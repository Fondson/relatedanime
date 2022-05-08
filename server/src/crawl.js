var request = require('request-promise')
var PromiseThrottle = require('promise-throttle')
var cheerio = require('cheerio')
var sse = require('simple-sse')
var chrono = require('chrono-node')
var redis = require('./redis/redisHelper')
var transformAnimes = require('./transformAnimes')
var crawlUrl = require('./crawlUrl')
var sortAnimesByDate = require('./sortAnimesByDate')
const ddb = require('./dynamoDb/dynamoDbHelper')
const { compressHtml, decompressHtml } = require('./compressHtml')
const { malTypeAndIdToRelLink } = require('./relLinkHelper')
const crawlAndCacheMalPage = require('./crawlAndCacheMalPage')

/*
    These are (graph) edges that are problematic and can expand the series graph
    in a way that is unexpected. To deal with it, we remove specific edges to
    limit the series expansion.
*/
const EDGES_EXCLUSION_LIST = {
  'manga:118865': 'manga:87610',
  'manga:13': 'manga:25146',
}

var promiseThrottle = new PromiseThrottle({
  requestsPerSecond: 1 / 3, // max requests per second
  promiseImplementation: Promise, // the Promise library you are using
})

// dfs crawl
async function crawl(malType, malId, res, client, proxy = false, forceRefresh = false) {
  let pagesVisited = new Set()
  let pagesToVisit = [malTypeAndIdToRelLink(malType, malId)]
  let allRelated = [] // array of all related animes

  while (pagesToVisit.length) {
    const nextPage = pagesToVisit.pop()
    // New page we haven't visited
    if (!pagesVisited.has(nextPage)) {
      pagesVisited.add(nextPage)
      await visitPage(nextPage, client, pagesVisited, pagesToVisit, allRelated, proxy, forceRefresh)
    }
  }

  let preTransform = allRelated
  allRelated = transformAnimes(sortAnimesByDate(allRelated))
  if (client) {
    sse.send(client, 'full-data', JSON.stringify(allRelated))
    sse.send(client, 'done', 'success')
    sse.remove(client)
  }
  if (res) {
    res.end()
  }
  return preTransform
}

async function visitPage(
  relLink,
  client,
  pagesVisited,
  pagesToVisit,
  allRelated,
  proxy,
  forceRefresh,
) {
  const url = new URL(relLink, crawlUrl.getUrl(proxy)).href
  try {
    const body = forceRefresh
      ? await crawlAndCacheMalPage(relLink, proxy)
      : await getMalPage(relLink, proxy)

    // Parse the document body
    let $ = cheerio.load(body)
    const title =
      $('.h1-title').find('.title-name').text().trim() ||
      $('.h1-title').find('span[itemprop=name]').contents()[0].data.trim()
    console.log('Page title:  ' + title)
    if (client) {
      sse.send(client, 'update', title)
    }

    const malTypeAndId = getMalTypeAndId(relLink)
    // collect related anime links
    let relatedTypes = $('table.anime_detail_related_anime td.ar.fw-n.borderClass')
    relatedTypes.each((typeIndex, type) => {
      const thisType = type.children[0].data.trim()
      // 'Other' and 'Character' types of animes can be really unrelated, we'll discard them
      if (thisType != 'Other:' && thisType != 'Character:') {
        let children = type.next.children
        children.forEach((element, elementIndex) => {
          if (element.type === 'tag') {
            const destMalTypeAndIdRelLink = stripToMalTypeAndId(element.attribs.href)

            // do not add page links that are excluded as part of EDGES_EXCLUSION_LIST
            const destMalTypeAndIdKey = destMalTypeAndIdRelLink.slice(1).replace('/', ':')
            const sourceMalTypeAndIdKey = malTypeAndId.malType + ':' + malTypeAndId.malId
            if (
              // check forward facing link sourceMalTypeAndIdKey -> destMalTypeAndIdKey
              (sourceMalTypeAndIdKey in EDGES_EXCLUSION_LIST &&
                EDGES_EXCLUSION_LIST[sourceMalTypeAndIdKey] == destMalTypeAndIdKey) ||
              // check backward facing link destMalTypeAndIdKey -> sourceMalTypeAndIdKey
              (destMalTypeAndIdKey in EDGES_EXCLUSION_LIST &&
                EDGES_EXCLUSION_LIST[destMalTypeAndIdKey] == sourceMalTypeAndIdKey)
            ) {
              return
            }

            pagesToVisit.push(destMalTypeAndIdRelLink)
          }
        })
      }
    })
    let image = $('img[itemprop=image]')
    let newEntry = {
      malType: malTypeAndId.malType,
      malId: malTypeAndId.malId,
      type: $('div a[href*="?type="]')[0].children[0].data,
      title,
      link: url,
      image: image.length < 1 ? null : image.attr('src') || image.attr('data-src'),
      startDate: chrono.parseDate(
        $('span:contains("Aired:"), span:contains("Published:")')[0].next.data.trim(),
      ),
    }
    if (isNaN(newEntry.startDate)) newEntry.startDate = null

    allRelated.push(newEntry)
  } catch (e) {
    console.log(e)
    if (e.statusCode == 429 || e.statusCode == 403) {
      // try again
      await visitPage(relLink, client, pagesVisited, pagesToVisit, allRelated, proxy, forceRefresh)
    } else {
      // unhandled error
      // skip entry
    }
  }
}

async function getMalPage(relLink, proxy = false) {
  const url = new URL(relLink, crawlUrl.getUrl(proxy)).href

  let body
  // Try to load from Redis, then DynamoDB, then scrape
  const redisCacheResponse = await redis.getMalCachePath(relLink)
  if (redisCacheResponse != null) {
    body = await decompressHtml(redisCacheResponse)
    console.log(`${relLink} loaded from Redis`)
  } else {
    const ddbCacheResponse = await ddb.getMalCachePath(relLink)

    if (ddbCacheResponse.Item != null) {
      body = await decompressHtml(ddbCacheResponse.Item.page.S)
      console.log(`${relLink} loaded from DynamoDB`)

      // Add to Redis cache
      await redis.setMalCachePath(relLink, ddbCacheResponse.Item.page.S)
    } else {
      const fullBody = await promiseThrottle.add(request.bind(this, encodeURI(url)))
      const $ = cheerio.load(fullBody)
      body = $('#contentWrapper').html()

      // put in data stores
      const compressedBody = await compressHtml(body)
      await Promise.allSettled([
        ddb.setMalCachePath(relLink, compressedBody),
        redis.setMalCachePath(relLink, compressedBody),
      ])
    }
  }

  return body
}

// assumes url is a relative url following the format '/(anime|manga)/ID/...'
function getMalTypeAndId(url) {
  let pos = 1
  let malType = ''
  while (pos < url.length && url[pos] != '/') {
    malType += url[pos++]
  }
  let id = ''
  pos++
  while (pos < url.length && url[pos] != '/') {
    id += url[pos++]
  }

  return { malType: malType, malId: +id }
}

// assumes url is a relative url following the format '/(anime|manga)/ID/...'
function stripToMalTypeAndId(url) {
  let ret = ''
  let slashCount = 0
  let pos = 0
  while (pos < url.length) {
    if (url[pos] == '/') {
      slashCount += 1
    }
    if (slashCount == 3) {
      break
    }
    ret += url[pos++]
  }

  return ret
}

module.exports = crawl
