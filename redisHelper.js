var bluebird = require("bluebird");
var redis = require("redis");

bluebird.promisifyAll(redis.RedisClient.prototype);
var client = redis.createClient({
    url: process.env.REDIS_URL,
    retry_strategy: function (options) {
        if (options.error && options.error.code === 'ECONNREFUSED') {
            // End reconnecting on a specific error and flush all commands with
            // a individual error
            return new Error('The server refused the connection');
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
            // End reconnecting after a specific timeout and flush all commands
            // with a individual error
            return new Error('Retry time exhausted');
        }
        if (options.attempt > 10) {
            // End reconnecting with built in error
            return undefined;
        }
        // reconnect after
        return Math.min(options.attempt * 100, 3000);
    }
});

client.on('error', function (err) {
    console.log('Redis: Something went wrong ' + err);
});

async function setSeries(malType, malId, value) {
    console.log('Redis setting ' + malType + ' ' + malId) + ' to:';
    console.log(value)
    try {
        await client.setAsync(_getKey(malType, malId), JSON.stringify(value));
    } catch (e) {
        console.log('Redis error:');
        console.log(e);
    }
}

async function getSeries(malType, malId) {
    try {
        return JSON.parse(await client.getAsync((_getKey(malType, malId))));
    } catch (e) {
        console.log('Redis error:');
        console.log(e);
        return null;
    }
}

function _getKey(malType, malId) {
    return malType + '_' + malId;
}


module.exports = {setSeries, getSeries};