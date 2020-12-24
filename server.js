var express = require('express');
var searchAnime = require('./searchAnime');
var searchSeasonal = require('./searchSeasonal');
var crawl = require('./crawl');
var sse = require("simple-sse");
var pingSelf = require('./pingSelf');
var redis = require('./redisHelper');
var refreshCron = require('./refreshCron');
const path = require('path');

pingSelf.pingHomepage();
refreshCron.start();
var app = express();

app.set('port', (process.env.PORT || 3001));

async function _preCrawl(malType, malId, req=null) {
    // check redis
    let redisResult = await redis.getSeries(malType, malId);
    if (redisResult !== null && redisResult !== undefined) {
        console.log(malType + ' ' + malId + ' served from redis!')
        return redisResult;
    } 

    // couldn't find in redis
    return null;
}

async function _preCrawlSearch(query) {
    try {
        // check redis
        let redisResult = await redis.searchGet(query);
        if (redisResult !== null && redisResult !== undefined) {
            console.log(query + ' served from redis!')
            return redisResult;
        } 
    } catch (e) {
        console.log(e);
    }

    // couldn't find in redis
    return null;
}

app.get('/api/crawl/:malType(anime|manga)/:malId([0-9]+)', async function(req, res){
    const client = sse.add(req, res);
    const malType = req.params.malType;
    const malId = req.params.malId || 1;
    console.log('Received ' + malType + ' ' + malId);

    let preCrawlResult = await _preCrawl(malType, malId, req);
    // preCrawl success!
    if (preCrawlResult !== null) {
        sse.send(client, 'full-data', JSON.stringify(preCrawlResult));
        sse.send(client, 'done', 'success');
        sse.remove(client);
        res.end();
        return;
    }

    // have to crawl to find data
    console.log('precrawl failed, crawling...');
    crawl(malType, malId, res, client);
});

app.get('/api/search/:searchStr', async function(req, res){
    const searchStr = req.params.searchStr;
    let count = 1;
    if (req.query.count > 1) {
        count = req.query.count;
    }

    let redisResult = await _preCrawlSearch(searchStr);
    if (redisResult !== null) {
        res.end( JSON.stringify({ error: false, data: redisResult.slice(0, count)}) );
    } else {
        searchAnime(searchStr, res, count);
    }
});

app.get('/api/searchSeasonal', async function(req, res){
    let redisResult = await _preCrawlSearch(searchSeasonal.SEASONAL_KEY);
    if (redisResult !== null) {
        res.end( JSON.stringify({ error: false, data: redisResult }) );
    } else {
        searchSeasonal.searchSeasonal(res);
    }
});

//if (process.env.NODE_ENV === 'production') {
   app.use(express.static(path.join(__dirname, 'client/build')));
//}

app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

app.listen(app.get('port'), () => {
    console.log(`Find the server at: http://localhost:${app.get('port')}/`); // eslint-disable-line no-console
});
