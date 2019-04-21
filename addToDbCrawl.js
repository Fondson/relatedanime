var neo4j = require('./neo4jHelper');
var crawl = require('./crawl');

var args = process.argv.slice(2);

async function main(){
    try{
        await neo4j.addToDB(await crawl(args[0], args[1], null, null));
    } catch(e) {
        console.log(e)
    }
    process.exit()
}

main()