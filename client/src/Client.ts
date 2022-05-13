import { MalType } from 'types/common'

const API_URL = process.env.REACT_APP_API_URL

function crawl(malType, id, updateListener, eventListener) {
  if (id === 0) id = 1

  const es = new EventSource(new URL(`/api/crawl/${malType}/${id}`, API_URL))
  es.addEventListener('update', updateListener)
  es.addEventListener('full-data', eventListener)
  es.addEventListener('done', (e) => es.close())
}

function search(query, cb, count = 1) {
  fetchWithRetries(`/api/search/${encodeURIComponent(query)}?count=${count}`, cb)
}

function searchSeasonal(cb) {
  fetchWithRetries('/api/searchSeasonal', cb)
}

async function searchWithoutCb(
  query: string,
  count: number,
): Promise<Array<{ name: string; malType: MalType; id: string }>> {
  let obj = await fetchWithRetriesWithoutCb(
    `/api/search/${encodeURIComponent(query)}?count=${count}`,
    3,
  )
  if (obj.error) {
    return []
  }
  return obj.data
}

async function fetchWithRetries(url, cb, retries = 0) {
  try {
    let response = await fetch(new URL(url, API_URL).href)
    let obj = await processResponse(response)
    cb(obj)
  } catch (e) {
    console.log(e)
    // retry up to 2 times (3 tries total)
    if (retries < 3) {
      console.log('Retry count: ' + retries)
      fetchWithRetries(url, cb, retries + 1)
    } else {
      console.log('Reached max retry count!')
      cb({ error: true, why: e })
    }
  }
}

async function fetchWithRetriesWithoutCb(url, retries = 0) {
  try {
    let response = await fetch(new URL(url, API_URL).href)
    let obj = await processResponse(response)
    return obj
  } catch (e) {
    console.log(e)
    // retry up to 2 times (3 tries total)
    if (retries < 3) {
      console.log('Retry count: ' + retries)
      return await fetchWithRetriesWithoutCb(url, retries + 1)
    } else {
      console.log('Reached max retry count!')
      return { error: true, why: e }
    }
  }
}

type RepsponseError = Error & { response: Response; status: string }

function processResponse(response) {
  if (response.status >= 200 && response.status < 300) {
    const obj = response.json()
    return obj
  }
  const error = new Error(`HTTP Error ${response.statusText}`) as RepsponseError
  error.status = response.statusText
  error.response = response
  console.log(error) // eslint-disable-line no-console
  throw error
}

const Client = { crawl, search, searchWithoutCb, searchSeasonal }

export default Client
export { crawl, search, searchWithoutCb, searchSeasonal }
