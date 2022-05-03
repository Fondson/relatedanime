var refreshRedis = require('./refreshRedis')

/*
This script is meant to be used to manually refresh anime redis (not the search redis).
Uses refreshRedis.js to do the heavy lifting.

Steps for running this script:
1. In redisHelper.js, set the url to the production url
(optional)
  2. Do a dryrun run to see what keys you will be refreshing and spot check some of
     them to make sure they are parents keys (connect to redis production using 
     `redis-cli -u <url>` and run `GET <key>`)
3. Run script with `node manualRefresh.js <key> <dryrun>`
*/

async function main() {
  let args = process.argv.slice(2)

  if (args.length === 0) {
    console.log('Refreshing all series')
    await refreshRedis.refresh()
  } else if (args.length >= 1) {
    const key = args[0]

    // key validation
    console.assert(key.split(':').length === 2)
    console.assert(new Set(['anime', 'manga']).has(key.split(':')[0]))
    console.assert(parseInt(key.split(':')[1]) !== NaN)
    console.log('Refreshing using key ' + key)

    const dryrun = args.length > 1 ? args[1] : false
    await refreshRedis.refresh(key, dryrun)
  } else {
    console.log(
      'Please provide no args to refresh all of the anime Redis ' +
        'or at least one arg to refresh a specific series.',
    )
  }

  console.log('Done manualRefresh.js!')
  process.kill(process.pid, 'SIGTERM')
}

main()
