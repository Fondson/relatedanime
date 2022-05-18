var express = require('express')
var searchAnime = require('./searchAnime')
var searchSeasonal = require('./searchSeasonal')
var crawl = require('./crawl')
var sse = require('simple-sse')
var pingSelf = require('./pingSelf')
var redis = require('./redis/redisHelper')
// TODO: remove on experiment success
// var refreshCron = require('./crons/refreshCron')
const refreshMalCacheCron = require('./crons/refreshMalCacheCron')
const path = require('path')
const cors = require('cors')
const { malTypeAndIdToRelLink } = require('./relLinkHelper')
const transformAnimes = require('./transformAnimes')
const getSeoData = require('./getSeoData')

pingSelf.pingHomepage()
// TODO: remove on experiment success
// refreshCron.start()
refreshMalCacheCron.start()
var app = express()

app.set('port', process.env.PORT || 3001)

const corsOptions = {
  // origin: (() => {
  //   const env = process.env.APP_ENV
  //   if (env === 'prod') {
  //     return 'https://relatedanime.com'
  //   } else {
  //     return 'http://localhost:3000'
  //   }
  // })(),
}
app.use(cors(corsOptions))

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

  let cachedResult = await _preCrawl(malType, malId, req)
  if (cachedResult != null) {
    sse.send(client, 'full-data', JSON.stringify(cachedResult))
    sse.send(client, 'done', 'success')
    sse.remove(client)
    res.end()

    const preTransform = await crawl(malType, malId, null, null)
    await redis.setSeries(malType, malId, transformAnimes(preTransform))
  } else {
    const preTransform = await crawl(malType, malId, res, client)
    await redis.setSeries(malType, malId, transformAnimes(preTransform))
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
  let count = 1
  if (req.query.count > 1) {
    count = req.query.count
  }

  let redisResult = await _preCrawlSearch(searchStr)
  if (redisResult !== null) {
    res.end(JSON.stringify({ error: false, data: redisResult.slice(0, count) }))
  } else {
    searchAnime(searchStr, res, count)
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

if (process.env.APP_ENV === 'prod') {
  // Serve static files from the React app
  app.use(express.static(path.join(process.cwd(), '../client/build')))
  // The "catch all" handler: essentially proxies request to the React app
  app.get('/*', function (req, res) {
    res.sendFile(path.join(process.cwd(), '../client/build', 'index.html'))
  })
}

app.listen(app.get('port'), () => {
  console.log(`Find the server at: http://localhost:${app.get('port')}/`) // eslint-disable-line no-console
})
