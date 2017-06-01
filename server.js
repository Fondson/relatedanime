var express = require('express');
var searchAnime = require('./searchAnime');
var crawl = require('./crawl');
var sse = require("simple-sse");
const path = require('path');
var app = express();

app.set('port', (process.env.PORT || 3001));

//if (process.env.NODE_ENV === 'production') {
   app.use(express.static(path.join(__dirname, 'client/build')));
//}

app.get('/anime(/:animeID)?', function(req, res){
    const client = sse.add(req, res);
    if (!req.params.animeID) req.params.animeID = 33674;
    crawl(req.params.animeID, res, client);
});

app.get('/search/:searchStr', function(req, res){
    searchAnime(req.params.searchStr, res);
});

app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

app.listen(app.get('port'), () => {
  console.log(`Find the server at: http://localhost:${app.get('port')}/`); // eslint-disable-line no-console
});
