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

app.get('/api/precrawl/:malType(anime|manga)/:malId([0-9]+)', async function(req, res) {
    const malType = req.params.malType;
    const malId = req.params.malId;

    // check redis first
    let redisResult = await redis.getSeries(malType, malId);
    if (redisResult !== null && redisResult !== undefined) {
        console.log(malType + ' ' + malId + ' served from redis!')
        res.end(JSON.stringify({ error: false, series: redisResult}));
    } 
    // then try db
    else {
        neo4j.getFromDbByMalTypeAndMalID(malType, malId, res, req);
    }
});

app.get('/api/crawl/:malType(anime|manga)/:malId([0-9]+)', function(req, res){
    const client = sse.add(req, res);
    if (!req.params.malId) req.params.malId = 1;
    crawl(req.params.malType, req.params.malId, res, client);
});

app.get('/api/search/:searchStr', function(req, res){
    searchAnime(req.params.searchStr, res);
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
