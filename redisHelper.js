var bluebird = require("bluebird");
var redis = require("redis");

bluebird.promisifyAll(redis.RedisClient.prototype);
const TYPES = ['anime', 'manga'];
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
    const parentKey = _createKey(malType, malId);
    console.log('Redis setting ' + parentKey + ' to:');
    console.log(value)
    try {
        await client.setAsync(parentKey, JSON.stringify(value));
        await _linkChildrenToParent(parentKey, value);
    } catch (e) {
        console.log('Redis error:');
        console.log(e);
    }
}

// For parent anime:1 with child anime:2, set anime:2 to anime:1.
// Note that parent is set to to the full series object.
async function _linkChildrenToParent(parentKey, parentSeries) {
    const types = Object.values(parentSeries);
    for (let i = 0; i < types.length; ++i) {
        const children = types[i];
        for (let j = 0; j < children.length; ++j) {
            const child = children[j];
            const childKey = _createKey(child.malType, child.malId);
            // do the link
            if (childKey !== parentKey) {
                console.log('Setting child ' + childKey + ' to parent ' + parentKey);
                await client.setAsync(childKey, parentKey);
            }
        }
    }
}

async function getSeries(malType, malId) {
    try {
        const value = await client.getAsync((_createKey(malType, malId)));
        if (_isKey(value)) {
            const nextValue = await client.getAsync(value);
            // This means we had anime:1 points to anime:2 and anime:2 points to anime:x instead of a series obj.
            // We're in a bad state (probably due to concurrent updates), just return null to crawl again
            if (_isKey(nextValue)) {
                console.log('Redis: Bad key points to key points to key state!');
                console.log('Redis: Returning null to crawl again.');
                return null;
            } else {
                return JSON.parse(nextValue);
            }
        }

        return JSON.parse(value);
    } catch (e) {
        console.log('Redis error:');
        console.log(e);
        return null;
    }
}

function _isKey(key) {
    try {
        for (let i = 0; i < TYPES.length; ++i) {
            if (key.startsWith(TYPES[i])) {
                return true;
            }
        }
        
        return false;
    } catch (e) {
        return false;
    }
}

function _createKey(malType, malId) {
    return malType + ':' + malId;
}


module.exports = {setSeries, getSeries};