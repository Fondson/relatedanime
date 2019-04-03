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

async function _getAnimes(id) {
    try {
        const result = await session
        .run(
            "match (a:Anime {malID:{malIDParam}})-[r1:RELATED_TO*1..2]-(b:Anime) return a, b",
            {
                malIDParam: +id
            }
        )
        console.log(result);
        if (result.records.length == 0) {
            return [];
        } else {
            const rootAnime = result.records[0]._fields[0].properties;
            rootAnime.startDate = new Date(rootAnime.startDate);
            let animes = [rootAnime];
            result.records.forEach(function(record){
                const anime = record._fields[1].properties;
                console.log(anime);
                anime.startDate = new Date(anime.startDate);
                animes.push(anime);
            });
            console.log(animes);
            return animes
        }
    } catch (e) {
        throw e;
    }
}

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

async function deleteAnimesFromDB(id) {
    try {
        let animes = await _getAnimes(id);
        await deleteAnimesIfExist(animes);
    } catch (e) {
        console.log(e);
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

    let rootAnime = null
    // just to be safe
    if (animes.length > 0) {
        rootAnime = animes[0]
    }
    for (let i = 1; i < animes.length; ++i) {
        const anime = animes[i]
        await session
            .run(
                "match \
                    (a:Anime \
                        {\
                            malID: {malIDParam}\
                        }), \
                    (b:Anime \
                        {\
                            malID: {otherMalIDParam}\
                        }) \
                merge (a)-[r:RELATED_TO]-(b)\
                return a,r,b",
                {
                    malIDParam: rootAnime.malID,
                    otherMalIDParam: anime.malID
                }
            )
    }
}

async function getFromDBByMalID(id, res){
    console.log(id);
    try{
        let animes = await _getAnimes(id);
        if (!animes.length) {
            res.end(JSON.stringify({ error: true, why: 'not in db'}));
        } else {
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

module.exports = {addToDB, getFromDBByMalID, clearDb, deleteAnimesFromDB};