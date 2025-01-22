var cheerio = require('cheerio')
var sse = require('simple-sse')
var chrono = require('chrono-node')
var transformAnimes = require('./transformAnimes')
var crawlUrl = require('./crawlUrl')
var sortAnimesByDate = require('./sortAnimesByDate')
const { malTypeAndIdToRelLink } = require('./relLinkHelper')
const crawlAndCacheMalPage = require('./crawlAndCacheMalPage')
const getMalPage = require('./getMalPage')
const isEmpty = require('lodash/isEmpty')

const TEXT_NODE = 3
/*
    These are (graph) edges that are problematic and can expand the series graph
    in a way that is unexpected. To deal with it, we remove specific edges to
    limit the series expansion.
*/
const EDGES_EXCLUSION_LIST = {
  'manga:118865': 'manga:87610',
  'manga:13': 'manga:25146',
}

const defaultCrawlOptions = {
  res: undefined,
  client: undefined,
  forceRefresh: false,
  useCache: true,
}
// dfs crawl
async function crawl(malType, malId, options) {
  const { res, client, forceRefresh, useCache } = { ...defaultCrawlOptions, ...options }

  let pagesVisited = new Set()
  let pagesToVisit = [{ relLink: malTypeAndIdToRelLink(malType, malId) }]
  let allRelated = [] // array of all related animes

  while (pagesToVisit.length) {
    const { relLink: nextPage, skipRelated = false } = pagesToVisit.pop()
    // New page we haven't visited
    if (!pagesVisited.has(nextPage)) {
      pagesVisited.add(nextPage)
      await visitPage(
        nextPage,
        client,
        pagesVisited,
        pagesToVisit,
        allRelated,
        forceRefresh,
        useCache,
        skipRelated,
      )
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
  forceRefresh,
  useCache,
  skipRelated = false,
) {
  const url = new URL(relLink, crawlUrl.getUrl()).href
  try {
    const body = forceRefresh
      ? await crawlAndCacheMalPage(relLink)
      : await getMalPage(relLink, { useCache })

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
    if (!skipRelated) {
      const entries = getRelatedEntriesOld($)

      if (isEmpty(entries)) {
        const newEntries = getRelatedEntries($)
        entries.push(...newEntries)
      }

      // do not add page links that are excluded as part of EDGES_EXCLUSION_LIST
      const filteredEntries = entries.filter(({ relLink: destMalTypeAndIdRelLink }) => {
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
          return false
        }
        return true
      })

      pagesToVisit.push(
        ...filteredEntries.reverse(), // reverse so that pagesToVisit stack traverses the first entries first
      )
    }

    let image = $('img[itemprop=image]')
    let typeSpan = $('span').filter((i, span) => $(span).text().trim() === 'Type:')
    let newEntry = {
      malType: malTypeAndId.malType,
      malId: malTypeAndId.malId,
      type: !isEmpty(typeSpan.next().text().trim())
        ? // Normal types
          typeSpan.next().text().trim()
        : // Non-normal types
          typeSpan
            .parent()
            .contents()
            .filter(function () {
              return this.nodeType == TEXT_NODE
            })
            .text()
            .trim(),
      title,
      link: url,
      image: image.length < 1 ? null : image.attr('src') || image.attr('data-src'),
      startDate: (() => {
        const dateText = $(
          'span:contains("Aired:"), span:contains("Published:")',
        )[0].next.data.trim()
        // Try normal date parsing first
        let parsedDate = chrono.parseDate(dateText)

        if (parsedDate == null) {
          // Check for year-only format
          const yearMatch = dateText.match(/(\d{4})/)
          if (yearMatch) {
            // If only year is found, set to January 1st at midnight
            const date = new Date(parseInt(yearMatch[1]), 0, 1)
            date.setUTCHours(0, 0, 0, 0)
            return date
          }
          return null
        }
        return parsedDate
      })(),
      // mark "Other" pages as maybeRelated
      maybeRelated: skipRelated,
    }
    if (isNaN(newEntry.startDate)) newEntry.startDate = null

    allRelated.push(newEntry)
  } catch (e) {
    console.log(e)
    if (e.statusCode == 429 || e.statusCode == 403) {
      // try again
      await visitPage(
        relLink,
        client,
        pagesVisited,
        pagesToVisit,
        allRelated,
        forceRefresh,
        useCache,
        skipRelated,
      )
    } else if (!forceRefresh) {
      // try again with forceRefresh in case we cached a bad page
      await visitPage(
        relLink,
        client,
        pagesVisited,
        pagesToVisit,
        allRelated,
        true,
        useCache,
        skipRelated,
      )
    } else {
      // unhandled error
      // skip entry
    }
  }
}

function getRelatedEntriesOld($) {
  let relatedTypes = $('table.anime_detail_related_anime td.ar.fw-n.borderClass')
  return Array.from(relatedTypes)
    .flatMap((type) => {
      const thisType = type.children[0].data.trim()
      // 'Character' type can be really unrelated, we'll discard them
      if (thisType != 'Character:') {
        return []
      }

      let children = type.next.children
      return children.map((element, elementIndex) => {
        if (element.type === 'tag') {
          const destMalTypeAndIdRelLink = stripToMalTypeAndId(element.attribs.href)
          return {
            relLink: destMalTypeAndIdRelLink,
            // instead of outright skipping "Other" pages, we'll traverse them only down to a depth of one
            skipRelated: thisType === 'Other:',
          }
        }
        return null
      })
    })
    .filter(Boolean)
}

function getRelatedEntries($) {
  const relatedTiles = $('.related-entries .entries-tile .entry')
  const linksFromTiles = Array.from(relatedTiles)
    .map((tile) => {
      const anchorTags = $(tile).find('a')
      if (anchorTags.length < 1) return null

      return { link: anchorTags.first().attr('href') }
    })
    .filter(Boolean)

  const relatedTableEntries = $('.related-entries .entries-table tr')
  const linksFromTable = Array.from(relatedTableEntries)
    .flatMap((tableEntry) => {
      const type = $(tableEntry).find('td').first().text().trim()
      // 'Character' type can be really unrelated, we'll discard them
      if (type === 'Character:') return []

      const anchorTags = $(tableEntry).find('a')
      if (anchorTags.length < 1) return []

      return Array.from(anchorTags).map((anchorTag) => {
        return {
          link: $(anchorTag).attr('href'),
          // instead of outright skipping "Other" pages, we'll traverse them only down to a depth of one
          skipRelated: type === 'Other:',
        }
      })
    })
    .filter(Boolean)

  const relatedLinks = [...linksFromTiles, ...linksFromTable]
  return relatedLinks.map(({ link, skipRelated }) => {
    const destMalTypeAndIdRelLink = stripToMalTypeAndId(link)
    return { relLink: destMalTypeAndIdRelLink, skipRelated }
  })
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

function stripToMalTypeAndId(url) {
  const parts = url.split('/')
  if (parts.length < 1) return null

  const startingIndex = parts.findIndex((part) => part === 'anime' || part === 'manga')
  if (startingIndex === undefined) return null

  return `/${parts[startingIndex]}/${parts[startingIndex + 1]}`
}

module.exports = crawl
