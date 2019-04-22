/* eslint-disable no-undef */
function crawl(malType, id, updateListener, eventListener) {
  if (id === 0) id = 1;
  //http://localhost:3001
  const es = new EventSource(`/api/crawl/${malType}/${id}`);
  es.addEventListener('update', updateListener);
  es.addEventListener('full-data', eventListener);
  es.addEventListener('done', (e) => es.close());
}

/* eslint-disable no-undef */
function precrawl(malType, id, cb) {
  fetchWithRetries(`/api/precrawl/${malType}/${id}`, cb);
}

/* eslint-disable no-undef */
function search(query, cb) {
  fetchWithRetries(`/api/search/${encodeURIComponent(query)}`, cb);
}

async function fetchWithRetries(url, cb, retries = 0) {
  try {
    let response = await fetch(url, {
      accept: 'application/json',
    });
    let obj = await processResponse(response);
    cb(obj);
  } catch (e) {
    console.log(e);
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

const Client = { crawl, search, precrawl };
export default Client;