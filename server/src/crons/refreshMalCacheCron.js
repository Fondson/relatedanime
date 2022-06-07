const { CronJob } = require('cron')
const { refreshMalCache } = require('../scripts/refreshMalCache')
const redis = require('../redis/redisHelper')

function start() {
  const job = new CronJob(
    '0 0 0 * * 1',
    async () => {
      const lock = await redis.acquireLock('refreshMalCache', 5 * 60 * 1000)
      try {
        if (lock == null) {
          console.log('Refresh cron lock is unavailable!')
          return
        }

        console.log('Starting refresh cron!')
        await refreshMalCache()
        console.log(`Refresh cron complete!`)
      } finally {
        if (lock) {
          await lock.release()
        }
      }
    },
    undefined,
    true,
    'America/Los_Angeles',
  )

  job.start()
  console.log(`MAL cache refresh cron initialized! Next run is ${job.nextDate()}`)
}

module.exports = { start }
