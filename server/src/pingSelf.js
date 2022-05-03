var http = require('http')

// default every 5 minutes (300000)
const DEFAUT = 300000
const LINK = 'http://relatedanime.herokuapp.com/'

function pingHomepage(interval = DEFAUT) {
  setInterval(function () {
    console.log('Pinging self at ' + LINK + '...')
    http.get(LINK)
  }, interval)
}

module.exports = { pingHomepage }
