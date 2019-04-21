var http = require("http");

// default every 5 minutes (300000)
function pingSelf(interval=300000) {
    setInterval(function() {
        http.get("http://related-anime.herokuapp.com");
    }, interval); 
}


module.exports = pingSelf;