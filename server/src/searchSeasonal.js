var request = require('request-promise')
var cheerio = require('cheerio')
var PromiseThrottle = require('promise-throttle')
var redis = require('./redis/redisHelper')
var crawlUrl = require('./crawlUrl')
const crawl = require('./crawl')

const SEASONAL_KEY = '$seasonal$'
// default every day
const DEFAULT_REFRESH = 1000 * 60 * 60 * 24

var promiseThrottle = new PromiseThrottle({
  requestsPerSecond: 1, // max requests per second
  promiseImplementation: Promise, // the Promise library you are using
})

function searchSeasonal(res = null) {
  scrapSearch(res)
}

async function scrapSearch(res) {
  try {
    const body = await promiseThrottle.add(
      request.bind(this, new URL('/anime/season', crawlUrl.getUrl()).href),
    )
    let $ = cheerio.load(body)

    const root = $('.seasonal-anime-list.js-seasonal-anime-list.js-seasonal-anime-list-key-1')
    console.log(root.find('.seasonal-anime.js-seasonal-anime').length)

    const animes = root.find('.seasonal-anime.js-seasonal-anime')
    let ret = []
    for (let i = 0; i < animes.length; ++i) {
      const block = $(animes[i]).find('.image')

      const img = block.find('img').attr('src') || block.find('img').attr('data-src')
      const title = block.find('img').attr('alt')
      const url = block.find('a.link-image').attr('href')

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

      ret.push({
        img: img,
        title: title,
        malType: 'anime',
        id: id,
      })
    }

    if (ret.length >= 1) {
      // scrape all seasonal animes if new batch is out
      if (
        process.env.APP_ENV !== 'dev' &&
        JSON.stringify(ret) !== JSON.stringify(await redis.searchGet(SEASONAL_KEY))
      ) {
        ret.forEach(({ malType, id }) => {
          crawl(malType, id, { forceRefresh: true })
        })
      }

      redis.searchSet(SEASONAL_KEY, ret)
    }
    if (res) {
      res.end(JSON.stringify({ error: false, data: ret }))
    }
  } catch (e) {
    console.log(e)
    if (e.statusCode == 429) {
      // too many requests error
      // try again
      scrapSearch(searchStr, null, count)
    } else {
      // unhandled error
      res.end(JSON.stringify({ error: true, why: e }))
    }
  }
}

function refreshSeasonal(interval) {
  searchSeasonal()

  setInterval(function () {
    console.log('Refreshing seasonal...')
    searchSeasonal()
  }, interval)
}
refreshSeasonal(DEFAULT_REFRESH)

module.exports = { searchSeasonal, SEASONAL_KEY }
