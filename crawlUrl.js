const BASE_URL = 'https://myanimelist.net';
const PROXY_URL = 'http://localhost:3002/proxy';

function getUrl(proxy) {
    return proxy ? PROXY_URL : BASE_URL;
}

module.exports = {getUrl};