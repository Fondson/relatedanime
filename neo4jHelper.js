var neo4j = require('neo4j-driver').v1;
var tranformAnimes = require('./transformAnimes');
var sortAnimesByDate = require('./sortAnimesByDate');

// var graphenedbURL = process.env.GRAPHENEDB_BOLT_URL;
// var graphenedbUser = process.env.GRAPHENEDB_BOLT_USER;
// var graphenedbPass = process.env.GRAPHENEDB_BOLT_PASSWORD;

var driver = neo4j.driver('bolt://localhost', neo4j.auth.basic('neo4j', 'password'));
var session = driver.session();

// create index
session.run("create index on :Anime(malID)");

async function deleteAnimesIfExist(animes) {
    for (let i = 0; i < animes.length; ++i) {
        const result = await session
        .run(
            "match (n {malID: {malIDParam}}) detach delete n",
            {
                malIDParam: animes[i].malID,
            }
        );
    }
}

async function addToDB(animes){
    await deleteAnimesIfExist(animes);
    for (let i = 0; i < animes.length; ++i) {
        const anime = animes[i]
        // add each anime as node
        await session
        .run("create (n:Anime \
            {\
                type: {typeParam},\
                title: {titleParam},\
                link: {linkParam},\
                image: {imageParam},\
                startDate: {startDateParam},\
                malID: {malIDParam}\
            }) return n",
            {
                typeParam: anime.type,
                titleParam: anime.title,
                linkParam: anime.link,
                imageParam: anime.image,
                startDateParam: anime.startDate ? anime.startDate.toString() : anime.startDate,
                malIDParam: anime.malID
            }
        );
    }

    for (let i = 0; i < animes.length; ++i) {
        if (i < animes.length - 1) {
            let next = animes[i + 1]
            await session
                .run(
                    "match \
                        (a:Anime \
                            {\
                                malID: {malIDParam}\
                            }), \
                        (b:Anime \
                            {\
                                malID: {nextMalIDParam}\
                            }) \
                    merge (a)-[r:RELATED_TO]-(b)\
                    return a,r,b",
                    {
                        malIDParam: animes[i].malID,
                        nextMalIDParam: next.malID
                    }
                )
        }
    }
}

async function getFromDB(animeTitle, res){
    console.log(animeTitle);
    try{
        const result = await session
        .run(
            "match p=(a:Anime)-[r1:RELATED_TO*0..1000]-(n:Anime {title: {titleParam}})-[r2:RELATED_TO*0..1000]-(b:Anime) return p",
            {
                titleParam: animeTitle
            }
        )
        if (result.records.length == 0) {
            res.end(JSON.stringify({ error: true, why: 'not in db'}));
        } else {
            const links = result.records[result.records.length - 1]._fields[0].segments
            const first = links[0].start
            first.startDate = new Date(first.startDate)
            let animes = [first];
            links.forEach(function(link){
                console.log(link)
                let anime = link.end.properties;
                anime.startDate = new Date(anime.startDate);
                animes.push(anime);
            });
            console.log(animes);
            animes = tranformAnimes(sortAnimesByDate(animes));
            console.log(animes);
            res.end(JSON.stringify({ error: false, animes: animes}));
        }
    } catch (e) {
        console.log(e);
        res.end(JSON.stringify({ error: true, why: e}));
    }
}

async function getFromDBByMalID(id, res){
    console.log(id);
    try{
        const result = await session
        .run(
            "match p=(a:Anime)-[r1:RELATED_TO*0..1000]-(n:Anime {malID: {malIDParam}})-[r2:RELATED_TO*0..1000]-(b:Anime) return p",
            {
                malIDParam: +id
            }
        )
        console.log(result)
        if (result.records.length == 0) {
            res.end(JSON.stringify({ error: true, why: 'not in db'}));
        } else {
            const links = result.records[result.records.length - 1]._fields[0].segments
            const first = links[0].start.properties
            first.startDate = new Date(first.startDate)
            let animes = [first];
            links.forEach(function(link){
                console.log(link)
                let anime = link.end.properties;
                anime.startDate = new Date(anime.startDate);
                animes.push(anime);
            });
            console.log(animes);
            animes = tranformAnimes(sortAnimesByDate(animes));
            console.log(animes);
            res.end(JSON.stringify({ error: false, animes: animes}));
        }
    } catch (e) {
        console.log(e);
        res.end(JSON.stringify({ error: true, why: e}));
    }
}

async function clearDb() {
    console.log('CLEARING DB');
    try {
        const result = await session
        .run(
            "match (n) detach delete n"
        )
    } catch (e) {
        console.log(e);
    }
}

module.exports = {addToDB, getFromDBByMalID, clearDb};