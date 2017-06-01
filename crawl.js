var request = require('request');
var cheerio = require('cheerio');
var sse = require("simple-sse");

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
        allRelated = sortIntoTypes(sortByDate(allRelated));
        console.log(allRelated);
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
                // 'Other' type of animes can be really unrelated, we'll discard them
                if (type.children[0].data.trim() != 'Other:'){
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
                startDate: new Date(getDateString($('span:contains("Aired:"), span:contains("Published:")')[0].next.data.trim()))
            };
            if (isNaN(newEntry.startDate)) newEntry.startDate = null;

            allRelated.push(newEntry);
            
            callback(res, client, pagesVisited, pagesToVisit, allRelated);
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
        if (items[i].startDate instanceof Date) items[i].startDate = formatDate(items[i].startDate);
        else console.log(items[i].startDate);
    }

    return items;
};

function formatDate(date) {
  var monthNames = [
    "Jan", "Feb", "Mar",
    "Apr", "May", "Jun", "Jul",
    "Aug", "Sep", "Oct",
    "Nov", "Dec"
  ];

  var day = date.getDate();
  var monthIndex = date.getMonth();
  var year = date.getFullYear();

  return monthNames[monthIndex] + ' ' + day + ', ' + year;
}

module.exports = crawl;
