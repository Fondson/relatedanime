var neo4j = require('./neo4jHelper');
var crawl = require('./crawl');

var args = process.argv.slice(2);

async function main(){
    try{
        await neo4j.deleteAnimesFromDB(args[0]);
    } catch(e) {
        console.log(e)
    }
    process.exit()
}

main()