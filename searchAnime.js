var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');

function searchAnime(searchStr, res){
    fs.readFile('creds.txt', 'utf8', function(err, data) {  
        if (err) throw err;
        requestData(data, searchStr, res);
    });
}


function requestData(creds, searchStr, res){
    request("https://" + creds + "@myanimelist.net/api/anime/search.xml?q=" + searchStr, function(error, response, body) {
        if(error) {
            console.log("Error: " + error);
            res.end(JSON.stringify({ error: true, why: error}));
            return;
        }
        // Check status code (200 is HTTP OK)
        // console.log("Status code: " + response.statusCode);
        if(response.statusCode === 200) {
            // Parse the document body
            let $ = cheerio.load(body, {
                normalizeWhitespace: true,
                xmlMode: true
            });

            if ($('title').length < 1){
                res.end( { error: true, why: "No results"});
                return;
            }
            const type = $('type')[0].children[0].data;
            const title = $('title')[0].children[0].data;
            const id = $('id')[0].children[0].data;
            res.end( JSON.stringify({ error: false, title: title, id: id, type: type}) );
        }
    });
}

module.exports = searchAnime;