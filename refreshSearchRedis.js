var bluebird = require("bluebird");
var redis = require("redis");
var redisHelper = require('./redisHelper');
var searchAnime = require('./searchAnime');
var searchSeasonal = require('./searchSeasonal');
var PromiseThrottle = require('promise-throttle');

var promiseThrottle = new PromiseThrottle({
    requestsPerSecond: 1,           // max requests per second
    promiseImplementation: Promise  // the Promise library you are using
});
bluebird.promisifyAll(redis.RedisClient.prototype);
let dryrun = false;

// recrawls search keys to keep cache updated
async function refreshRedis() {
    await refreshAllKeys()
}

async function refreshAllKeys() {
    const client = redisHelper.getSearchClient();
    let cursor = 0;
    while (true) {
        const result = await client.scanAsync(cursor);
        cursor = result[0];
        const keys = result[1];
        for (let i = 0; i < keys.length; ++i) {
            const key = keys[i];
            if (key !== searchSeasonal.SEASONAL_KEY) {
                await refreshKey(key);
            }
        }

        if (cursor == 0) {
            break;
        }
    }
}

// Recrawls a specific key
async function refreshKey(key) {
    console.log('Refreshing ' + key);
    let value = await promiseThrottle.add(searchAnime.bind(this, key, null, 5 /*JSON.parse(await redisHelper.getSearchClient().getAsync(key)).length*/, true));

    if (!dryrun) {
        // set to parent key to crawled result
        await redisHelper.searchSet(key, value);
    } else {
        console.log('Would have set ' + key + ' to:');
        console.log(value);
    }
}

async function main() {
    let args = process.argv.slice(2);

    if (args.length == 1) {
        await refreshKey(args[0]);
    } else {
        await refreshRedis();
    }
    console.log('Done with search redis!');
    process.exit()
}

async function refresh(key = '') {
    if (key !== '') {
        await refreshASeries(key);
    } else {
        await refreshRedis();
    }
    console.log('Done with search redis!');
}

// main();

module.exports = { refresh };
