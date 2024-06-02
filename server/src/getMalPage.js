const request = require('request-promise')
const PromiseThrottle = require('promise-throttle')
const redis = require('./redis/redisHelper')
const ddb = require('./dynamoDb/dynamoDbHelper')
const { compressHtml, decompressHtml } = require('./compressHtml')
const cheerioModule = require('cheerio')
const { getUrl } = require('./crawlUrl')

const promiseThrottle = new PromiseThrottle({
  requestsPerSecond: 1 / 3, // max requests per second
  promiseImplementation: Promise, // the Promise library you are using
})

const defaultOptions = {
  useCache: true,
}
async function getMalPage(relLink, options) {
  const { useCache } = { ...defaultOptions, ...options }

  let body
  if (!useCache) {
    const url = new URL(relLink, getUrl()).href
    const fullBody = await promiseThrottle.add(request.bind(this, url))
    const $ = cheerioModule.load(fullBody)
    body = $('#contentWrapper').html()
  } else {
    // Try to load from Redis, then DynamoDB, then scrape
    const redisCacheResponse = await redis.getMalCachePath(relLink)
    if (redisCacheResponse != null) {
      body = await decompressHtml(redisCacheResponse)
      console.log(`${relLink} loaded from Redis`)
    } else {
      const ddbCacheResponse = await ddb.getMalCachePath(relLink)

      if (ddbCacheResponse?.Item != null) {
        body = await decompressHtml(ddbCacheResponse.Item.page.S)
        console.log(`${relLink} loaded from DynamoDB`)

        // Add to Redis cache
        await redis.setMalCachePath(relLink, ddbCacheResponse.Item.page.S)
      } else {
        const url = new URL(relLink, getUrl()).href
        const fullBody = await promiseThrottle.add(request.bind(this, url))
        const $ = cheerioModule.load(fullBody)
        body = $('#contentWrapper').html()

        // put in data stores
        const compressedBody = await compressHtml(body)
        await Promise.allSettled([
          ddb.setMalCachePath(relLink, compressedBody),
          redis.setMalCachePath(relLink, compressedBody),
        ])
      }
    }
  }

  return body
}

module.exports = getMalPage
