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

async function searchAnime(searchStr, count) {
  if (searchStr === searchSeasonal.SEASONAL_KEY) {
    throw new Error('invalid search string')
  }
  return await scrapSearch(searchStr, count)
}

async function scrapSearch(searchStr, count) {
  try {
    const body = await promiseThrottle.add(
      request.bind(
        this,
        new URL(`/search/all?q=${encodeURIComponent(searchStr)}`, crawlUrl.getUrl()).href,
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
    const rawEntries = []
    malEntries
      .find('.list.di-t')
      .slice(0, count)
      .each((index, element) => {
        rawEntries.push({
          name: $(element).find('.fw-b.fl-l').first().text(),
          url: $(element).find('.fw-b.fl-l').first().attr('href'),
          thumbnail: $(element).find('img').first().attr('data-src'),
          type: $(element).find('.pt8 a').first().text(),
        })
      })

    let ret = []
    for (let i = 0; i < rawEntries.length; ++i) {
      const { url, name, thumbnail, type } = rawEntries[i]
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
      ret.push({ name, malType, id, thumbnail, type })
    }
    console.log(ret)
    if (ret.length > 0) {
      redis.searchSet(searchStr, ret)
      return ret
    }
    throw new Error('no results')
  } catch (e) {
    if (e.statusCode == 429 || e.statusCode == 403) {
      // try again
      return await scrapSearch(searchStr, null, count)
    }
    throw e
  }
}

module.exports = searchAnime
