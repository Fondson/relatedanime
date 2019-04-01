var neo4j = require('./neo4jHelper');


async function main(){
    try{
        await neo4j.clearDb();
        console.log('SUCCESS');
    } catch(e) {
        console.log(e)
    }
    process.exit()
}

main()