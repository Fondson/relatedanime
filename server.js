var express = require('express');
var searchAnime = require('./searchAnime');
var crawl = require('./crawl');
var sse = require("simple-sse");
var neo4j = require('./neo4jHelper');
var pingSelf = require('./pingSelf');
var redis = require('./redisHelper');
const path = require('path');

pingSelf.pingHomepage();
pingSelf.pingNeo4j();
var app = express();

app.set('port', (process.env.PORT || 3001));

async function _preCrawl(malType, malId, req=null) {
    // check redis
    let redisResult = await redis.getSeries(malType, malId);
    if (redisResult !== null && redisResult !== undefined) {
        console.log(malType + ' ' + malId + ' served from redis!')
        return redisResult;
    } 
    // check db
    let neo4jResult = await neo4j.getFromDbByMalTypeAndMalId(malType, malId, req);
    if (neo4jResult !== null) {
        // explicitly not using await
        redis.setSeries(malType, malId, neo4jResult);
        console.log(malType + ' ' + malId + ' served from neo4j!')
        return neo4jResult;
    }

    // couldn't find in redis or neo4j
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

app.get('/api/search/:searchStr', function(req, res){
    const searchStr = req.params.searchStr
    searchAnime(searchStr, res);
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
