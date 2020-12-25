var refreshRedis = require('./refreshRedis');

/*
This script is meant to be used to manually refresh anime redis (not the search redis).
*/

function start() {
    refreshRedis.refresh();
}
start()