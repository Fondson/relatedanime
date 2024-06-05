const { CronJob } = require('cron')
const { spawn } = require('node:child_process')
const path = require('path')
const redis = require('../redis/redisHelper')

function start() {
  const job = new CronJob(
    '0 0 0 * * 0',
    async () => {
      try {
        const subprocess = spawn(
          process.argv[0],
          ['--expose-gc', path.join(__dirname, '../scripts/manualRefreshMalCache.js')],
          { detached: true, stdio: 'ignore' },
        )
        subprocess.unref()
      } catch (e) {
        console.error(e)
      }
    },
    undefined,
    true,
    'America/New_York',
  )

  job.start()
  console.log(`MAL cache refresh cron initialized! Next run is ${job.nextDate()}`)
}

module.exports = { start }
