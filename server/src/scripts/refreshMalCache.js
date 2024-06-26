const { relLinkToMalTypeAndId } = require('../relLinkHelper')
const crawl = require('../crawl')
const dynamoDbHelper = require('../dynamoDb/dynamoDbHelper')
const crawlAndCacheMalPage = require('../crawlAndCacheMalPage')

const _refreshEverything = async (paginationKey) => {
  // Force garbage collection to prevent memory leak
  if (global.gc) {
    global.gc()
  }

  const scanTableResult = await dynamoDbHelper.scanTable(paginationKey)
  await Promise.allSettled(
    scanTableResult?.Items?.map(async (item) => await crawlAndCacheMalPage(item.path.S)) ?? [],
  )
  if (scanTableResult.LastEvaluatedKey != null) {
    await _refreshEverything(scanTableResult.LastEvaluatedKey)
  }
}

const refreshEverything = async () => await _refreshEverything(undefined)

const refreshASeries = async (startingPageRelLink) => {
  const { malType, malId } = relLinkToMalTypeAndId(startingPageRelLink)
  await crawl(malType, malId, { forceRefresh: true })
}

const refreshMalCache = async (startingPageRelLink = '') => {
  if (startingPageRelLink !== '') {
    await refreshASeries(startingPageRelLink)
  } else {
    await refreshEverything()
  }
  console.log('Done refreshing MAL cache (Redis and DynamoDB)!')
}

module.exports = { refreshMalCache }
