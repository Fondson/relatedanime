var request = require('request-promise');
var cheerio = require('cheerio');
var PromiseThrottle = require('promise-throttle');
var redis = require('./redisHelper');
var searchSeasonal = require('./searchSeasonal');

const MAL_TYPES = new Set(['anime', 'manga'])
var promiseThrottle = new PromiseThrottle({
    requestsPerSecond: 1,           // max requests per second
    promiseImplementation: Promise  // the Promise library you are using
});

function searchAnime(searchStr, res, count){
    if (searchStr === searchSeasonal.SEASONAL_KEY) {
        res.end(JSON.stringify({ error: true, why: 'invalid search string' }));
    }
    scrapSearch(searchStr, res, count);
}

async function scrapSearch(searchStr, res, count) {
    try {
        const body = await promiseThrottle.add(request.bind(this, encodeURI("https://myanimelist.net/search/all?q=" + searchStr)));
        let $ = cheerio.load(body);

        const root = $('.content-result .content-left .js-scrollfix-bottom-rel');
        let headers = root.children('h2');
        let malType = '';
        let malEntries = null;
        // get the first header (either anime or manga)
        for (let i = 0; i < headers.length; ++i) {
            const curType = $(headers[i]).attr('id');
            console.log(curType);
            if (MAL_TYPES.has(curType)) {
                malType = curType;
                malEntries = $(headers[i]).next();
                break;
            }
        }

        // get the entries for the header
        let urlsAndNames = [];
        malEntries.find('.information .hoverinfo_trigger').slice(0, count).each(
            (index, element) => urlsAndNames.push({name: $(element).text(), url: $(element).attr('href')})
        );
        
        let ret = []
        for (let i = 0; i < urlsAndNames.length; ++i) {
            const url = urlsAndNames[i].url;
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
            ret.push({name: urlsAndNames[i].name, malType: malType, id: id});
        }
        console.log(urlsAndNames);
        if (ret.length > 1) {
            redis.searchSet(searchStr, ret);
        }
        if (res) {
            res.end( JSON.stringify({ error: false, data: ret}) );
        }
    }
    catch (e) {
        console.log(e);
        if (e.statusCode == 429) {  // too many requests error
            // try again but send error to client
            scrapSearch(searchStr, null, count);
            res.end(JSON.stringify({ error: true, why: e }));
        } else {  // unhandled error
            res.end(JSON.stringify({ error: true, why: e }));
        }
    }
}

module.exports = searchAnime;