var request = require('request-promise')
const cheerio = require('cheerio')
const PromiseThrottle = require('promise-throttle')
const { compressHtml } = require('./compressHtml')
const { getUrl } = require('./crawlUrl')
const redis = require('./redis/redisHelper')
const ddb = require('./dynamoDb/dynamoDbHelper')

const promiseThrottle = new PromiseThrottle({
  requestsPerSecond: 1 / 3, // max requests per second
  promiseImplementation: Promise, // the Promise library you are using
})

const crawlAndCacheMalPage = async (relLink, proxy = false) => {
  // Crawl MAL page
  const url = new URL(relLink, getUrl(proxy)).href
  const fullBody = await promiseThrottle.add(request.bind(this, encodeURI(url)))

  // Parse and store
  const $ = cheerio.load(fullBody)
  const body = $('#contentWrapper')
  const compressedBody = await compressHtml(body.html())
  await ddb.setMalCachePath(relLink, compressedBody)
  // page was in Redis cache, so add it
  if ((await redis.getMalCachePath(relLink)) != null) {
    await redis.setMalCachePath(relLink, compressedBody)
  }

  return body.html()
}

module.exports = crawlAndCacheMalPage
