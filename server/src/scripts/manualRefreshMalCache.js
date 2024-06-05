const { sendMail } = require('../mail/sendMail')
const { refreshMalCache } = require('./refreshMalCache')
const redis = require('../redis/redisHelper')
const { formatDistanceToNow } = require('date-fns')

/*
This script is meant to be used to manually refresh the MAL cache DynamoDB and Redis.
Uses refreshMalCache.js to do the heavy lifting.

Steps for running this script:
1. Set the url for MAL cache Redis and the AWS credentials for MAL cache DynamoDB
   in .env
2. Run script with `(cd server && node -r dotenv/config src/scripts/manualRefreshMalCache.js <key>)`
*/

async function main() {
  const start = new Date()
  try {
    let args = process.argv.slice(2)

    if (args.length === 0) {
      const lock = await redis.acquireLock('refreshMalCache', 5 * 60 * 1000)
      if (lock == null) {
        throw new Error('Refresh cron lock is unavailable! Aborting refresh cron run...')
      }

      try {
        await refreshMalCache()
        await sendMail(
          'Refresh MAL cache complete',
          `Refreshed everything.<br/><br/>Finished in ${formatDistanceToNow(start)}`,
        )
      } finally {
        await lock.unlock()
      }
    } else if (args.length >= 1) {
      const key = args[0]

      // key validation
      const splitKey = key.split('/')
      console.assert(splitKey.length === 3)
      console.assert(new Set(['anime', 'manga']).has(splitKey[1]))
      console.assert(parseInt(splitKey[2]) !== NaN)
      console.log(`Refreshing using key (relLink) ${key}`)

      await refreshMalCache(key)
      await sendMail(
        'Refresh MAL cache complete',
        `Refreshed ${key}.<br/><br/>Finished in ${formatDistanceToNow(start)}`,
      )
    } else {
      console.log(
        'Please provide no args to refresh everything or one arg to refresh a specific series.',
      )
      return
    }

    console.log('Done manual refresh!')
  } catch (e) {
    console.error(e)
    await sendMail('Refresh MAL cache failed', `Error: ${e}`)
  } finally {
    process.kill(process.pid, 'SIGTERM')
  }
}

main()
