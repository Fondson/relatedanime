var neo4j = require('neo4j-driver').v1;
var tranformAnimes = require('./transformAnimes');
var sortAnimesByDate = require('./sortAnimesByDate');

var graphenedbURL = process.env.GRAPHENEDB_BOLT_URL;
var graphenedbUser = process.env.GRAPHENEDB_BOLT_USER;
var graphenedbPass = process.env.GRAPHENEDB_BOLT_PASSWORD;

var driver = neo4j.driver(graphenedbURL, neo4j.auth.basic(graphenedbUser, graphenedbPass));
var session = driver.session();

function addToDB(animes){
    animes.forEach(function(anime) {
        // add each anime as node
        session
            .run("create (n \
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
            )
            .then(function(result){
                console.log('Node creation OK!')

                // create relationships
                animes.forEach(function(animeRel){
                    if (anime != animeRel) {
                        session
                            .run(
                                "match \
                                    (a \
                                        {\
                                            type: {typeParam},\
                                            title: {titleParam},\
                                            link: {linkParam},\
                                            image: {imageParam},\
                                            startDate: {startDateParam},\
                                            malID: {malIDParam}\
                                        }), \
                                    (b \
                                        {\
                                            type: {relTypeParam},\
                                            title: {relTitleParam},\
                                            link: {relLinkParam},\
                                            image: {relImageParam},\
                                            startDate: {relStartDateParam},\
                                            malID: {relMalIDParam}\
                                        }) \
                                merge (a)-[r:RELATED_TO]-(b)\
                                return a,r,b",
                                {
                                    typeParam: anime.type,
                                    titleParam: anime.title,
                                    linkParam: anime.link,
                                    imageParam: anime.image,
                                    startDateParam: anime.startDate ? anime.startDate.toString() : anime.startDate,
                                    malIDParam: anime.malID,

                                    relTypeParam: animeRel.type,
                                    relTitleParam: animeRel.title,
                                    relLinkParam: animeRel.link,
                                    relImageParam: animeRel.image,
                                    relStartDateParam: animeRel.startDate ? animeRel.startDate.toString() : animeRel.startDate,
                                    relMalIDParam: animeRel.malID
                                }
                            )
                            .then(function(result){
                                console.log('Relationship creation OK!')
                            })
                            .catch(function(err){
                                console.log('Relationship creation FAILED!')
                                console.log(err);
                            });
                    }
                });
            })
            .catch(function(err){
                console.log('Node creation FAILED!')
                console.log(err);
            });
    });
}

function getFromDB(animeTitle, res){
    console.log(animeTitle);
    session
        .run(
            "match \
                (a \
                    {title: {titleParam}}\
                )-[r]-(b)\
            return a,b",
            {
                titleParam: animeTitle
            }
        )
        .then(function(result){
            // console.log(result.records[0]._fields[0]);
            // console.log(result.records[0]._fields[1]);
            if (result.records.length == 0) {
                res.end(JSON.stringify({ error: true, why: 'not in db'}));
            } else {
                let animes = [];
                result.records.forEach(function(record){
                    let anime = record._fields[1].properties;
                    anime.startDate = new Date(anime.startDate);
                    animes.push(anime);
                });
                console.log(animes);
                animes = tranformAnimes(sortAnimesByDate(animes));
                console.log(animes);
                res.end(JSON.stringify({ error: false, animes: animes}));
            }

        })
        .catch(function(err){
            console.log(err);
            res.end(JSON.stringify({ error: true, why: err}));
        });
}

function getFromDBByMalID(id, res){
    session
        .run(
            "match \
                (a \
                    {malID: {idParam}}\
                )-[r]-(b)\
            return a,b",
            {
                idParam: id
            }
        )
        .then(function(result){
            //console.log(result.records[0]._fields[0]);
            //console.log(result.records[0]._fields[1]);
            if (result.records.length == 0) {
                res.end(JSON.stringify({ error: true, why: 'not in db'}));
            } else {
                let animes = [];

                let init = result.records[0]._fields[0].properties;
                init.startDate = new Date(init.startDate);
                animes.push(init);
                
                result.records.forEach(function(record){
                    let anime = record._fields[1].properties;
                    anime.startDate = new Date(anime.startDate);
                    animes.push(anime);
                });
                console.log(animes);
                animes = tranformAnimes(sortAnimesByDate(animes));
                console.log(animes);
                res.end(JSON.stringify({ error: false, animes: animes}));
            }
        })
        .catch(function(err){
            console.log(err);
            res.end(JSON.stringify({ error: true, why: err}));
        });
}

module.exports = {addToDB, getFromDBByMalID};