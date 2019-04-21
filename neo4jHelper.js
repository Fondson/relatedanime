var neo4j = require('neo4j-driver').v1;
var tranformAnimes = require('./transformAnimes');
var sortAnimesByDate = require('./sortAnimesByDate');

// var graphenedbURL = process.env.GRAPHENEDB_BOLT_URL;
// var graphenedbUser = process.env.GRAPHENEDB_BOLT_USER;
// var graphenedbPass = process.env.GRAPHENEDB_BOLT_PASSWORD;

var driver = neo4j.driver('bolt://localhost', neo4j.auth.basic('neo4j', 'password'));

// create indexes
driver.session().run("create index on :anime(malID)");
driver.session().run("create index on :manga(malID)");


function _getSession(req = null) {
    if (req === null) {
        return driver.session();
    }

    if (!req.session) {
        req.session = driver.session();
    }
    return req.session;
}

function _getASeriesFromNode(node) {
    const aSeries = node.properties
    if (aSeries.startDate !== 'Not available') aSeries.startDate = new Date(aSeries.startDate);
    aSeries.malType = node.labels[0];
    return aSeries;
}

async function _getSeries(malType, id, session) {
    try {
        const result = await session
        .run(
            "match (a:" + malType + " {malID:{malIDParam}})-[r1:RELATED_TO*1..2]-(b) return a, b",
            {
                malIDParam: +id
            }
        )
        // console.log(result);
        if (result.records.length == 0) {
            return [];
        } else {
            const rootSeriesNode = result.records[0].toObject().a;
            let rootSeries = _getASeriesFromNode(rootSeriesNode)
            let series = [rootSeries];
            result.records.forEach(function(record){
                const aSeriesNode = record.toObject().b;
                let aSeries = _getASeriesFromNode(aSeriesNode)
                series.push(aSeries);
            });
            console.log(series);
            return series
        }
    } catch (e) {
        throw e;
    }
}

async function _deleteSeriesIfExist(series, session) {
    for (let i = 0; i < series.length; ++i) {
        const result = await session
        .run(
            "match (n:" + series[i].malType + " {malID: {malIDParam}}) detach delete n",
            {
                malIDParam: series[i].malID,
            }
        );
    }
}

async function deleteSeriesFromDB(malType, id) {
    try {
        const session = _getSession();
        let series = await _getSeries(malType, id, session);
        await _deleteSeriesIfExist(series, session);
    } catch (e) {
        console.log(e);
    }
}

async function addToDB(series){
    const session = _getSession();
    await _deleteSeriesIfExist(series, session);
    for (let i = 0; i < series.length; ++i) {
        const aSeries = series[i]
        // add each aSeries as node
        await session
        .run("create (n:" + aSeries.malType + " \
            {\
                type: {typeParam},\
                title: {titleParam},\
                link: {linkParam},\
                image: {imageParam},\
                startDate: {startDateParam},\
                malID: {malIDParam}\
            }) return n",
            {
                typeParam: aSeries.type,
                titleParam: aSeries.title,
                linkParam: aSeries.link,
                imageParam: aSeries.image,
                startDateParam: aSeries.startDate ? aSeries.startDate.toString() : aSeries.startDate,
                malIDParam: aSeries.malID
            }
        );
    }

    let rootSeries = null
    // just to be safe
    if (series.length > 0) {
        rootSeries = series[0]
    }
    for (let i = 1; i < series.length; ++i) {
        const aSeries = series[i]
        await session
        .run(
            "match \
                (a:" + rootSeries.malType + " \
                    {\
                        malID: {malIDParam}\
                    }), \
                (b:" + aSeries.malType + " \
                    {\
                        malID: {otherMalIDParam}\
                    }) \
            merge (a)-[r:RELATED_TO]-(b)\
            return a,r,b",
            {
                malIDParam: rootSeries.malID,
                otherMalIDParam: aSeries.malID
            }
        )
    }
}

async function getFromDbByMalTypeAndMalID(malType, id, res, req){
    console.log(malType + ' ' + id);
    try{
        const session = _getSession(req);
        let series = await _getSeries(malType, id, session);
        if (!series.length) {
            res.end(JSON.stringify({ error: true, why: 'not in db'}));
        } else {
            series = tranformAnimes(sortAnimesByDate(series));
            console.log(series);
            res.end(JSON.stringify({ error: false, series: series}));
        }
    } catch (e) {
        console.log(e);
        res.end(JSON.stringify({ error: true, why: e}));
    }
}

async function clearDb() {
    console.log('CLEARING DB');
    try {
        const session = _getSession();
        const result = await session
        .run(
            "match (n) detach delete n"
        )
    } catch (e) {
        console.log(e);
    }
}

module.exports = {addToDB, getFromDbByMalTypeAndMalID, clearDb, deleteSeriesFromDB};