var request = require('request-promise');
var PromiseThrottle = require('promise-throttle');
var cheerio = require('cheerio');
var sse = require("simple-sse");
var chrono = require('chrono-node');
var neo4j = require('./neo4jHelper');
var transformAnimes = require('./transformAnimes');
var sortAnimesByDate = require('./sortAnimesByDate');

/*
    related anime links are relative
*/
let baseURL;
var promiseThrottle = new PromiseThrottle({
    requestsPerSecond: 1,           // max requests per second
    promiseImplementation: Promise  // the Promise library you are using
  });

async function crawl(animeID, res, client){
    baseURL = 'https://myanimelist.net';
    let pagesVisited = new Set();
    let pagesToVisit = ["/anime/"+animeID];
    let allRelated = []; // array of all related animes
    return await startCrawl(res, client, pagesVisited, pagesToVisit, allRelated);
}

async function startCrawl(res, client, pagesVisited, pagesToVisit, allRelated) {
    if (pagesToVisit.length > 0){
        let nextPage = pagesToVisit.pop();
        if (pagesVisited.has(getID(nextPage))) {
            // We've already visited this page, so repeat the crawl
            return await startCrawl(res, client, pagesVisited, pagesToVisit, allRelated);
        } else {
            // New page we haven't visited
            pagesVisited.add(getID(nextPage));
            return await visitPage(nextPage, startCrawl, res, client, pagesVisited, pagesToVisit, allRelated);
        }
    }else{
        // neo4j.addToDB(allRelated);
        preTransform = allRelated
        allRelated = transformAnimes(sortAnimesByDate(allRelated));
        if (client) {
            sse.send(client, 'full-data', JSON.stringify(allRelated));
            sse.send(client, 'done', 'success');
            sse.remove(client);
        }
        if (res) {
            res.end();
        }
        return preTransform;
    }
}

async function visitPage(relLink, callback, res, client, pagesVisited, pagesToVisit, allRelated){
    url = baseURL + relLink
    // console.log("Visiting page " + url)
    try {
        const body = await promiseThrottle.add(request.bind(this, encodeURI(url)));
        // Parse the document body
        let $ = cheerio.load(body);
        console.log("Page title:  " + $('title').text());
        if (client) {
            sse.send(client, 'update', $('title').text().trim() );
        }
        
        // collect related anime links
        let relatedTypes = $('table.anime_detail_related_anime td.ar.fw-n.borderClass');

        relatedTypes.each((typeIndex, type) => {
            const thisType = type.children[0].data.trim();
            // 'Other' and 'Character' types of animes can be really unrelated, we'll discard them
            if (thisType != 'Other:' && thisType != 'Character:'){
                let children = type.next.children;
                children.forEach((element, elementIndex) => {
                    if (element.type === 'tag') {
                        const page = element.attribs.href
                        if (!pagesVisited.has(getID(page))) pagesToVisit.push(page);
                    }
                });
            }
        });

        let image = $('img[itemprop=image]');
        let newEntry = {
            malID: getID(relLink),
            type: $('div a[href*="?type="]')[0].children[0].data,
            title: $('span[itemprop=name]')[0].children[0].data,
            link: url,
            image: image.length < 1 ? null : image[0].attribs.src,
            startDate: chrono.parseDate($('span:contains("Aired:"), span:contains("Published:")')[0].next.data.trim())
        };
        if (isNaN(newEntry.startDate)) newEntry.startDate = null;

        allRelated.push(newEntry);
        return await callback(res, client, pagesVisited, pagesToVisit, allRelated);
    } catch(e) {
        console.log(e);
        if (e.statusCode == 429) {  // too many requests error
            // try again
            return await visitPage(relLink, callback, res, client, pagesVisited, pagesToVisit, allRelated);
        } else {
            return await callback(res, client, pagesVisited, pagesToVisit, allRelated);
        }
    }
};

// assumes link is a relative link following the format '/anime/ID/...'
function getID (link) {
    let startWithID = link.slice('/anime/'.length);
    let ret = '';
    for (let i = 0; i < startWithID.length; ++i){
        if (startWithID[i] === '/') break;
        ret += startWithID[i];
    }
    return +ret;
};

module.exports = crawl;
