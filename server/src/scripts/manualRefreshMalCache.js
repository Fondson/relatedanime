const request = require('request-promise')
const { refreshMalCache } = require('./refreshMalCache')

/*
This script is meant to be used to manually refresh the MAL cache DynamoDB and Redis.
Uses refreshMalCache.js to do the heavy lifting.

Steps for running this script:
1. Set the url for MAL cache Redis and the AWS credentials for MAL cache DynamoDB
   in .env
2. Run script with `(cd server && node -r dotenv/config src/scripts/manualRefreshMalCache.js <key>)`
*/

async function main() {
  let args = process.argv.slice(2)

  if (args.length === 0) {
    console.log('Refreshing everything')
    await refreshMalCache()
  } else if (args.length >= 1) {
    const key = args[0]

    // key validation
    const splitKey = key.split('/')
    console.assert(splitKey.length === 3)
    console.assert(new Set(['anime', 'manga']).has(splitKey[1]))
    console.assert(parseInt(splitKey[2]) !== NaN)
    console.log(`Refreshing using key (relLink) ${key}`)

    await refreshMalCache(key)
  } else {
    console.log(
      'Please provide no args to refresh everything or one arg to refresh a specific series.',
    )
  }

  console.log('Done manual refresh!')
  process.kill(process.pid, 'SIGTERM')
}

main()
