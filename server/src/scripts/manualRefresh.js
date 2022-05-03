var refreshRedis = require('./refreshRedis')

/*
This script is meant to be used to manually refresh anime redis (not the search redis).
*/

async function main() {
  let args = process.argv.slice(2)

  if (args.length === 0) {
    console.log('Refreshing all series')
    await refreshRedis.refresh()
  } else if (args.length === 1) {
    const key = args[0]

    // validation
    console.assert(key.split(':').length === 2)
    console.assert(new Set(['anime', 'manga']).has(key.split(':')[0]))
    console.assert(parseInt(key.split(':')[1]) !== NaN)
    console.log('Refreshing using key ' + key)

    await refreshRedis.refresh(key)
  } else {
    console.log(
      'Please provide no args to refresh all of the anime Redis ' +
        'or one arg to refresh a specific series.',
    )
  }

  console.log('Done manualRefresh.js!')
  Process.exit()
  const exit = process.exit
}

main()
