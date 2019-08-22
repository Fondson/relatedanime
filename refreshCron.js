var cron = require('node-cron');
var refreshRedis = require('./refreshRedis');
var fs = require('fs');
 
cron.schedule('0 1 * * 4', async () => {
    console.log('Starting refresh cron!');
    const stream = fs.createWriteStream('refreshCron.txt', {flags:'a'});
    stream.write('Starting at ' + new Date().toString() + '\n');
    await refreshRedis.refresh();
    stream.write('Finished at ' + new Date().toString() + '\n\n');
    stream.end();
}, {
    scheduled: true,
    timezone: "America/Los_Angeles"
}).start();
