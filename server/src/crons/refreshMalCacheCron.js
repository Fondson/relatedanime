const { CronJob } = require('cron')
const { refreshMalCache } = require('../scripts/refreshMalCache')

function start() {
  const job = new CronJob(
    '0 0 0 * * 1',
    async function () {
      console.log('Starting refresh cron!')
      await refreshMalCache()
      console.log(`Refresh cron complete!`)
    },
    undefined,
    true,
    'America/Los_Angeles',
  )

  job.start()
  console.log(`MAL cache refresh cron initialized! Next run is ${job.nextDate()}`)
}

module.exports = { start }
