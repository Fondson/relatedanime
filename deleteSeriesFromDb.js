var neo4j = require('./neo4jHelper');
var crawl = require('./crawl');

var args = process.argv.slice(2);

async function main(){
    try{
        await neo4j.deleteSeriesFromDB(args[0], args[1]);
    } catch(e) {
        console.log(e)
    }
    process.exit()
}

main()