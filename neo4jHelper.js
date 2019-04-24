var neo4j = require('neo4j-driver').v1;
var tranformAnimes = require('./transformAnimes');
var sortAnimesByDate = require('./sortAnimesByDate');

// var graphenedbURL = process.env.GRAPHENEDB_BOLT_URL;
// var graphenedbUser = process.env.GRAPHENEDB_BOLT_USER;
// var graphenedbPass = process.env.GRAPHENEDB_BOLT_PASSWORD;

var driver = neo4j.driver('bolt://localhost', neo4j.auth.basic('neo4j', 'password'));

// create indexes
driver.session().run("create index on :anime(malId)");
driver.session().run("create index on :manga(malId)");


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
            "match (a:" + malType + " {malId:{malIdParam}})-[r1:RELATED_TO*1..2]-(b) return a, b",
            {
                malIdParam: +id
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
            "match (n:" + series[i].malType + " {malId: {malIdParam}}) detach delete n",
            {
                malIdParam: series[i].malId,
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
                malId: {malIdParam}\
            }) return n",
            {
                typeParam: aSeries.type,
                titleParam: aSeries.title,
                linkParam: aSeries.link,
                imageParam: aSeries.image,
                startDateParam: aSeries.startDate ? aSeries.startDate.toString() : aSeries.startDate,
                malIdParam: aSeries.malId
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
                        malId: {malIdParam}\
                    }), \
                (b:" + aSeries.malType + " \
                    {\
                        malId: {otherMalIdParam}\
                    }) \
            merge (a)-[r:RELATED_TO]-(b)\
            return a,r,b",
            {
                malIdParam: rootSeries.malId,
                otherMalIdParam: aSeries.malId
            }
        )
    }
}

async function getFromDbByMalTypeAndMalId(malType, id, req){
    console.log(malType + ' ' + id);
    try{
        const session = _getSession(req);
        let series = await _getSeries(malType, id, session);
        if (!series.length) {
            return null;
        } else {
            series = tranformAnimes(sortAnimesByDate(series));
            return series;
        }
    } catch (e) {
        console.log(e);
        return null;
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

async function ping() {
    try {
        const session = _getSession();
        const result = await session
        .run(
            "match (n) return n limit 1"
        )
    } catch (e) {
        console.log(e);
    }

}

module.exports = {addToDB, getFromDbByMalTypeAndMalId, clearDb, deleteSeriesFromDB, ping};