var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');

const MAL_TYPES = new Set(['anime', 'manga'])

function searchAnime(searchStr, res){
    scrapSearch(searchStr, res);
}

function scrapSearch(searchStr, res) {
    request("https://myanimelist.net/search/all?q=" + searchStr, function(error, response, body) {
        if(error) {
            res.end(JSON.stringify({ error: true, why: error}));
            return;
        }
        // Check status code (200 is HTTP OK)
        if(response.statusCode === 200) {
            try {
                let $ = cheerio.load(body);

                const root = $('.content-result .content-left .js-scrollfix-bottom-rel');
                let headers = root.children('h2');
                let malType = '';
                let malEntries = null;
                // get the first header (either anime or manga)
                for (let i = 0; i < headers.length; ++i) {
                    const curType = $(headers[i]).attr('id');
                    // console.log(curType);
                    if (MAL_TYPES.has(curType)) {
                        malType = curType;
                        malEntries = $(headers[i]).next();
                        break;
                    }
                }

                // get the first entry for the header
                const url = malEntries.find('.hoverinfo_trigger').attr('href');

                // get the malId
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

                res.end( JSON.stringify({ error: false, id: id, malType: malType}) );
            }
            catch (e) {
                console.log('searchAnime.js: ' + e)
                res.end(JSON.stringify({ error: true, why: 'No such anime.'}));
                return;
            }
        }
    });
}

module.exports = searchAnime;