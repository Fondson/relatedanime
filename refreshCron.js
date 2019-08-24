const CronJob = require('cron').CronJob;
var refreshRedis = require('./refreshRedis');
var fs = require('fs');

function start() {
    const job = new CronJob('0 0 0 * * 6', async function() {
        console.log('Starting refresh cron!');
        const stream = fs.createWriteStream('refreshCron.txt', {flags:'a'});
        stream.write('Starting at ' + new Date().toString() + '\n');
        await refreshRedis.refresh();
        stream.write('Finished at ' + new Date().toString() + '\n\n');
        stream.end();
        console.log(`Refresh cron complete!`);
    }, undefined, true, 'America/Los_Angeles');

    job.start();
    console.log(`Refresh cron initialized! Next run is ${job.nextDate()}`);
}

module.exports = {start};