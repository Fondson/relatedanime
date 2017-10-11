/* eslint-disable no-undef */
function crawl(query, updateListener, eventListener) {
  if (query === 0) query = 1;
  //http://localhost:3001
  const es = new EventSource(`/anime/${query}`);
  es.addEventListener('update', updateListener);
  es.addEventListener('full-data', eventListener);
  es.addEventListener('done', (e) => es.close());
}

/* eslint-disable no-undef */
function search(query, cb) {
  return fetch(`search/${encodeURIComponent(query)}`, {
    accept: 'application/json',
  }).then(checkStatus)
    .then(parseJSON)
    .then(cb);
}

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }
  const error = new Error(`HTTP Error ${response.statusText}`);
  error.status = response.statusText;
  error.response = response;
  console.log(error); // eslint-disable-line no-console
  throw error;
}

function parseJSON(response) {
  const obj = response.json();
  return obj;
}

// if (!!window.EventSource) {
//   var source = new EventSource('/anime/31240')

//   source.addEventListener('message', function(e) {
//     console.log(JSON.parse(e.data))
//   }, false)

//   source.addEventListener('open', function(e) {
//     console.log("Connected")
//   }, false)

//   source.addEventListener('error', function(e) {
//     if (e.target.readyState == EventSource.CLOSED) {
//       console.log("Disconnected")
//     }
//     else if (e.target.readyState == EventSource.CONNECTING) {
//       console.log("Connecting...")
//     }
//   }, false)
// } else {
//   console.log("Your browser doesn't support SSE")
// }

const Client = { crawl, search };
export default Client;