var request = require('request-promise')
var cheerio = require('cheerio')
var PromiseThrottle = require('promise-throttle')
var redis = require('./redis/redisHelper')
var searchSeasonal = require('./searchSeasonal')
var crawlUrl = require('./crawlUrl')

const MAL_TYPES = new Set(['anime', 'manga'])
var promiseThrottle = new PromiseThrottle({
  requestsPerSecond: 1, // max requests per second
  promiseImplementation: Promise, // the Promise library you are using
})

async function searchAnime(searchStr, count, proxy = false) {
  if (searchStr === searchSeasonal.SEASONAL_KEY) {
    throw new Error('invalid search string')
  }
  return await scrapSearch(searchStr, count, proxy)
}

async function scrapSearch(searchStr, count, proxy) {
  try {
    const body = await promiseThrottle.add(
      request.bind(
        this,
        new URL(`/search/all?q=${encodeURIComponent(searchStr)}`, crawlUrl.getUrl(proxy)).href,
      ),
    )
    let $ = cheerio.load(body)

    const root = $('.content-result .content-left .js-scrollfix-bottom-rel')
    let headers = root.children('h2')
    let malType = ''
    let malEntries = null
    // get the first header (either anime or manga)
    for (let i = 0; i < headers.length; ++i) {
      const curType = $(headers[i]).attr('id')
      console.log(curType)
      if (MAL_TYPES.has(curType)) {
        malType = curType
        malEntries = $(headers[i]).next()
        break
      }
    }

    // get the entries for the header
    let urlsAndNames = []
    malEntries
      .find('.information .hoverinfo_trigger')
      .slice(0, count)
      .each((index, element) =>
        urlsAndNames.push({ name: $(element).text(), url: $(element).attr('href') }),
      )

    let ret = []
    for (let i = 0; i < urlsAndNames.length; ++i) {
      const url = urlsAndNames[i].url
      // get the malId
      let pos = 0
      let slashCount = 0
      while (pos < url.length && slashCount < 4) {
        if (url[pos++] == '/') {
          slashCount += 1
        }
      }
      let id = ''
      while (pos < url.length && url[pos] != '/') {
        id += url[pos++]
      }
      ret.push({ name: urlsAndNames[i].name, malType: malType, id: id })
    }
    console.log(urlsAndNames)
    if (ret.length > 0) {
      redis.searchSet(searchStr, ret)
      return ret
    }
    throw new Error('no results')
  } catch (e) {
    if (e.statusCode == 429 || e.statusCode == 403) {
      // try again
      return await scrapSearch(searchStr, null, count, proxy)
    }
    throw e
  }
}

module.exports = searchAnime
