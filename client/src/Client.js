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
  fetchWithRetries(`search/${encodeURIComponent(query)}`, cb);
}

/* eslint-disable no-undef */
function dbSearch(id, cb) {
  fetchWithRetries(`db/${encodeURIComponent(id)}`, cb);
}

async function fetchWithRetries(url, cb, retries = 0) {
  try {
    let response = await fetch(url, {
      accept: 'application/json',
    });
    let obj = await processResponse(response);
    cb(obj);
  } catch (e) {
    // retry up to 2 times (3 tries total)
    if (retries < 3) {
      console.log('Retry count: ' + retries);
      fetchWithRetries(url, cb, retries + 1);
    } else {
      console.log('Reached max retry count!');
      cb({ error: true, why: e});
    }
  }
}

function processResponse(response) {
  if (response.status >= 200 && response.status < 300) {
    const obj = response.json();
    return obj;
  }
  const error = new Error(`HTTP Error ${response.statusText}`);
  error.status = response.statusText;
  error.response = response;
  console.log(error); // eslint-disable-line no-console
  throw error;
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

const Client = { crawl, search, dbSearch };
export default Client;