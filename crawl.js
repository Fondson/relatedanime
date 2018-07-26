var request = require('request');
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

function crawl(animeID, res, client){
    baseURL = 'https://myanimelist.net';
    let pagesVisited = new Set();
    let pagesToVisit = ["/anime/"+animeID];
    let allRelated = []; // array of all related animes

    startCrawl(res, client, pagesVisited, pagesToVisit, allRelated);
}

function startCrawl(res, client, pagesVisited, pagesToVisit, allRelated) {
    if (pagesToVisit.length > 0){
        let nextPage = pagesToVisit.pop();
        if (pagesVisited.has(getID(nextPage))) {
            // We've already visited this page, so repeat the crawl
            startCrawl(res, client, pagesVisited, pagesToVisit, allRelated);
        } else {
            // New page we haven't visited
            pagesVisited.add(getID(nextPage));
            visitPage(baseURL + nextPage, startCrawl, res, client, pagesVisited, pagesToVisit, allRelated);
        }
    }else{
        // neo4j.addToDB(allRelated);
        allRelated = transformAnimes(sortAnimesByDate(allRelated));
        sse.send(client, 'full-data', JSON.stringify(allRelated));
        sse.send(client, 'done', 'success');
        sse.remove(client);
        res.end();
    }
}

function visitPage(url, callback, res, client, pagesVisited, pagesToVisit, allRelated){
    // console.log("Visiting page " + url);
    request(url, function(error, response, body) {
        if(error) {
            // console.log("Error: " + error);
            return;
        }
        // Check status code (200 is HTTP OK)
        console.log("Status code: " + response.statusCode);
        if(response.statusCode === 200) {
            // Parse the document body
            let $ = cheerio.load(body);
            console.log("Page title:  " + $('title').text());
            sse.send(client, 'update', $('title').text().trim() );
            
            // collect related anime links
            let relatedTypes = $('table.anime_detail_related_anime td.ar.fw-n.borderClass');

            relatedTypes.each((typeIndex, type) => {
                const thisType = type.children[0].data.trim();
                // 'Other' and 'Character' types of animes can be really unrelated, we'll discard them
                if (thisType != 'Other:' && thisType != 'Character:'){
                    let children = type.next.children;
                    children.forEach((element, elementIndex) => {
                        if (element.type === 'tag') pagesToVisit.push(element.attribs.href);
                    });
                }
            });

            let image = $('img[itemprop=image]');
            let newEntry = {
                type: $('div a[href*="?type="]')[0].children[0].data,
                title: $('span[itemprop=name]')[0].children[0].data,
                link: url,
                image: image.length < 1 ? null : image[0].attribs.src,
                startDate: chrono.parseDate($('span:contains("Aired:"), span:contains("Published:")')[0].next.data.trim())
            };
            if (isNaN(newEntry.startDate)) newEntry.startDate = null;

            allRelated.push(newEntry);
        }
        callback(res, client, pagesVisited, pagesToVisit, allRelated);
    });
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
