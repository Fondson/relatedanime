const CronJob = require('cron').CronJob;
var refreshRedis = require('../scripts/refreshRedis');

function start() {
    const job = new CronJob('0 0 0 * * 1', async function() {
        console.log('Starting refresh cron!');
        await refreshRedis.refresh();
        console.log(`Refresh cron complete!`);
    }, undefined, true, 'America/Los_Angeles');

    job.start();
    console.log(`Refresh cron initialized! Next run is ${job.nextDate()}`);
}

module.exports = {start};