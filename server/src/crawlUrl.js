const BASE_URL = 'https://myanimelist.net'
const PROXY_URL = 'https://relatedanime-proxy.herokuapp.com'

function getUrl(proxy) {
  return proxy ? PROXY_URL : BASE_URL
}

module.exports = { getUrl }
