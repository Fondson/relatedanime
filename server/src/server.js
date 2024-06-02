var express = require('express')
var searchAnime = require('./searchAnime')
var searchSeasonal = require('./searchSeasonal')
var crawl = require('./crawl')
var sse = require('simple-sse')
var redis = require('./redis/redisHelper')
// TODO: remove on experiment success
// var refreshCron = require('./crons/refreshCron')
const refreshMalCacheCron = require('./crons/refreshMalCacheCron')
const path = require('path')
const cors = require('cors')
const { malTypeAndIdToRelLink } = require('./relLinkHelper')
const transformAnimes = require('./transformAnimes')
const getSeoData = require('./getSeoData')
const sentry = require('./sentry')

// TODO: remove on experiment success
// refreshCron.start()
refreshMalCacheCron.start()
var app = express()

app.set('port', process.env.PORT || 3001)

const corsOptions =
  process.env.APP_ENV === 'prod'
    ? {
        origin: 'https://relatedanime.com',
      }
    : {}
app.use(cors(corsOptions))

sentry.init(app)

async function _preCrawl(malType, malId, req = null) {
  // check redis
  let redisResult = await redis.getSeries(malType, malId)
  if (redisResult != null) {
    console.log(`${malTypeAndIdToRelLink(malType, malId)} served from redis!`)
    return redisResult
  }

  // couldn't find in redis
  return null
}

async function _preCrawlSearch(query) {
  try {
    // check redis
    let redisResult = await redis.searchGet(query)
    if (redisResult !== null && redisResult !== undefined) {
      console.log(query + ' served from redis!')
      return redisResult
    }
  } catch (e) {
    console.log(e)
  }

  // couldn't find in redis
  return null
}

app.get('/api/crawl/:malType(anime|manga)/:malId([0-9]+)', async function (req, res) {
  const client = sse.add(req, res)
  const malType = req.params.malType
  const malId = req.params.malId || 1
  console.log('Received ' + malType + ' ' + malId)

  const useCache = req.query.useCache !== 'false'

  if (useCache) {
    let cachedResult = await _preCrawl(malType, malId, req)
    if (cachedResult != null) {
      sse.send(client, 'full-data', JSON.stringify(cachedResult))
      sse.send(client, 'done', 'success')
      sse.remove(client)
      res.end()

      const preTransform = await crawl(malType, malId)
      await redis.setSeries(malType, malId, transformAnimes(preTransform))
    } else {
      const preTransform = await crawl(malType, malId, { res, client })
      await redis.setSeries(malType, malId, transformAnimes(preTransform))
    }
  } else {
    await crawl(malType, malId, { res, client, useCache: false })
  }
  console.log(`Updated cache for ${malTypeAndIdToRelLink(malType, malId)}`)
})

app.get('/api/mal-page-seo/:malType(anime|manga)/:malId([0-9]+)', async function (req, res) {
  const { malType, malId } = req.params
  const relLink = malTypeAndIdToRelLink(malType, malId)
  const seoData = await getSeoData(relLink)

  res.end(JSON.stringify({ data: seoData }))
})

app.get('/api/search/:searchStr', async function (req, res) {
  const searchStr = req.params.searchStr
  let count = Math.max(5, req.query.count)

  let redisResult = await _preCrawlSearch(searchStr)
  if (redisResult !== null) {
    res.end(JSON.stringify({ error: false, data: redisResult.slice(0, count) }))

    // update redis result if result is older than 1 week
    const lastUpdated = await redis.searchLastUpdated(searchStr)
    if (lastUpdated == null || lastUpdated + 60 * 60 * 24 * 7 < Math.floor(Date.now() / 1000)) {
      searchAnime(searchStr, count)
    }
  } else {
    try {
      const crawlResult = await searchAnime(searchStr, count)
      res.end(JSON.stringify({ error: false, data: crawlResult }))
    } catch (e) {
      console.log(e)
      res.end(JSON.stringify({ error: true, why: e }))
    }
  }
})

app.get('/api/searchSeasonal', async function (req, res) {
  let redisResult = await _preCrawlSearch(searchSeasonal.SEASONAL_KEY)
  if (redisResult !== null) {
    res.end(JSON.stringify({ data: redisResult }))
  } else {
    searchSeasonal.searchSeasonal(res)
  }
})

app.get('/health-check', async function (req, res) {
  res.send(new Date())
})

sentry.initErrorHandling(app)

app.listen(app.get('port'), () => {
  console.log(`Find the server at: http://localhost:${app.get('port')}/`) // eslint-disable-line no-console
})
