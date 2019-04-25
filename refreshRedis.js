var bluebird = require("bluebird");
var redis = require("redis");
var redisHelper = require('./redisHelper');
var crawl = require('./crawl');
var transformAnimes = require('./transformAnimes');

bluebird.promisifyAll(redis.RedisClient.prototype);

/*
THIS METHOD IS MEANT TO BE RUN MANUALLY!
THIS METHOD SHOULD IDEALLY BE RUN ON ANOTHER SERVER SO PRODUCTION DOES NOT
GET RATE LIMITED WHEN THIS METHOD IS RUNNING!

Steps for running this script:
1. In redisHelper.js, set the url to the production url
2. Do a dryrun run to see what keys you will be refreshing and spot check some of
   them to make sure they are parents keys (connect to redis production using 
   `redis-cli -u <url>` and run `GET <key>`)
3. Run method with dryrun=false
----------------------------------------------------------------------------------
Future:

This can be run periodically using js setInterval() as well. The concern is that
production will be slow if we do this. Maybe find a time with few usages to run this
if we want to change this to run this in production.
----------------------------------------------------------------------------------
Description:

Looks for parents keys and recrawls the entries to keep the cache updated.
Does not add or update any child keys.
*/
async function refreshCache(dryrun=true) {
    const client = redisHelper.getClient();
    let cursor = 0;
    while (true) {
        const result = await client.scanAsync(cursor);
        cursor = result[0];
        const keys = result[1];
        for (let i = 0; i < keys.length; ++i) {
            const key = keys[i];
            const value = await client.getAsync(key);
            if (!redisHelper.isKey(value)) {
                console.log('Refreshing ' + key);
                const typeAndIdObj = redisHelper.getMalTypeAndMalIdFromKey(key);
                let preTransform = await crawl(typeAndIdObj.malType, typeAndIdObj.malId, null, null);
                let postTransform = transformAnimes(preTransform);
                if (!dryrun) {
                    // set to redis without setting all child keys
                    await client.setAsync(key, JSON.stringify(postTransform));
                } else {
                    console.log('Setting ' + key + ' to:');
                    console.log(postTransform);
                }
            }
        }

        if (cursor == 0) {
            break;
        }
    }
}

async function main() {
    await refreshCache(false);
    console.log('Done!');
    process.exit()
}

main();
