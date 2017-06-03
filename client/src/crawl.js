var request = require('request');
var cheerio = require('cheerio');

/*
    related anime links are relative
*/
let baseURL;
let pagesVisited;

let pagesToVisit;

// array of all related animes
let allRelated;

function crawl(anime = "/anime/33674"){
    baseURL = 'https://myanimelist.net';
    pagesVisited = new Set();
    pagesToVisit = [anime];
    allRelated = [];

    return startCrawl();
}

function startCrawl() {
    if (pagesToVisit.length > 0){
        let nextPage = pagesToVisit.pop();
        if (pagesVisited.has(getID(nextPage))) {
            // We've already visited this page, so repeat the crawl
            startCrawl();
        } else {
            // New page we haven't visited
            pagesVisited.add(getID(nextPage));
            visitPage(baseURL + nextPage, startCrawl);
        }
    }else{
        console.log('all done');
        allRelated = sortIntoTypes(sortByDate(allRelated));
        console.log(allRelated);
        return allRelated;
    }
}

function visitPage(url, callback){
    console.log("Visiting page " + url);
    request(url, function(error, response, body) {
        if(error) {
            console.log("Error: " + error);
            return;
        }
        // Check status code (200 is HTTP OK)
        console.log("Status code: " + response.statusCode);
        if(response.statusCode === 200) {
            // Parse the document body
            var $ = cheerio.load(body);
            console.log("Page title:  " + $('title').text());

            // collect related anime links
            var related = $('table.anime_detail_related_anime a[href^="/"]');
            related.each((index, element) => {
                const relLink = element.attribs.href;
                pagesToVisit.push(relLink);
            });

            let newEntry = {
                type: $('div a[href*="?type="]')[0].children[0].data,
                title: $('span[itemprop=name]')[0].children[0].data,
                link: url,
                image: $('img[itemprop=image]')[0].attribs.src,
                startDate: new Date(getDateString($('span:contains("Aired:"), span:contains("Published:")')[0].next.data.trim()))
            };
            if (isNaN(newEntry.startDate)) newEntry.startDate = null;

            allRelated.push(newEntry);
            
            callback();

        }
    });
};

function getDateString (str){
    if (str === 'Not available' || str.length < 11) return str;
    let date = str[0];
    let maxSpaces = 2;
    let curSpaces = 0;
    let i = 1;
    while (curSpaces < maxSpaces){
        if (str[i] !== ' '){
            date += str[i];
        }else{
            // ignore consecutive spaces
            if (date[i - 1] === ' '){
                ++i;
                continue;
            } 
            date += str[i];
            curSpaces += 1;
        }
        ++i;
    }
    while (str[i] && str[i] !== ' ') date += str[i++];
    
    return date;
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

function sortIntoTypes(animes){
    let types = {};
    animes.forEach(function(anime) {
        if (!types.hasOwnProperty(anime.type)){
            types[anime.type] = [];
        }
        types[anime.type].push(anime);
    });
    return types;
};

function sortByDate(items){
    let len = items.length, min;

    for (let i=0; i < len; i++){
        //set minimum to this position
        min = i;

        //check the rest of the array to see if anything is smaller
        for (let j=i+1; j < len; j++){
            if (items[j].startDate < items[min].startDate){
                min = j;
            }
        }

        //if the minimum isn't in the position, swap it
        if (i != min){
            const temp = items[i];
            items[i] = items[min];
            items[min] = temp;
        }
    }

    return items;
};

export default crawl;