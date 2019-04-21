var express = require('express');
var searchAnime = require('./searchAnime');
var crawl = require('./crawl');
var sse = require("simple-sse");
var neo4j = require('./neo4jHelper');
var pingSelf = require('./pingSelf');
const path = require('path');

pingSelf.pingHomepage();
pingSelf.pingNeo4j();
var app = express();

app.set('port', (process.env.PORT || 3001));

app.get('/api/db/:malType(anime|manga)/:malId([0-9]+)', function(req, res){
    neo4j.getFromDbByMalTypeAndMalID(req.params.malType, req.params.malId, res, req);
})

app.get('/api/:malType(anime|manga)/:malId([0-9]+)', function(req, res){
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
