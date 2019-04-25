var http = require('http');
var neo4j = require('./neo4jHelper');

// default every 5 minutes (300000)
const DEFAUT = 300000;
const LINK = 'http://relatedanime.herokuapp.com/';


function pingHomepage(interval=DEFAUT) {
    setInterval(function() {
        console.log('Pinging self at ' + LINK + '...');
        http.get(LINK);
    }, interval); 
}

function pingNeo4j(interval=DEFAUT) {
    setInterval(function() {
        neo4j.ping();
    }, interval); 
}

module.exports = {pingHomepage, pingNeo4j};