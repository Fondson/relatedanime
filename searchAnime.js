var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');

function searchAnime(searchStr, res){
    scrapSearch(searchStr, res);
}

function scrapSearch(searchStr, res) {
    request("https://myanimelist.net/anime.php?q=" + searchStr, function(error, response, body) {
        if(error) {
            res.end(JSON.stringify({ error: true, why: error}));
            return;
        }
        // Check status code (200 is HTTP OK)
        if(response.statusCode === 200) {
            try {
                let $ = cheerio.load(body);
                let url = $('.js-categories-seasonal').find('.hoverinfo_trigger')[0].attribs.href;
    
                let pos = 0;
                let slashCount = 0;
                while (pos < url.length && slashCount < 4) {
                    if (url[pos++] == '/') {
                        slashCount += 1;
                    }
                }
    
                let id = ''
                while (pos < url.length && url[pos] != '/') {
                    id += url[pos++];
                }
                res.end( JSON.stringify({ error: false, id: id}) );
            }
            catch(e) {
                console.log('searchAnime.js: ' + e)
                res.end(JSON.stringify({ error: true, why: 'No such anime.'}));
                return;
            }
        }
    });
}

module.exports = searchAnime;