import { MalType, SeasonalAnimeItem } from 'types/common'

const API_URL = process.env.NEXT_PUBLIC_API_URL

type EventSourceEvent = {
  data: string
}

function crawl(
  malType: string,
  id: string | number,
  updateListener: (e: EventSourceEvent) => void,
  eventListener: (e: EventSourceEvent) => void,
  errorListener: (e: EventSourceEvent) => void,
) {
  if (id === 0) id = 1

  const es = new EventSource(new URL(`/api/crawl/${malType}/${id}`, API_URL))
  es.addEventListener('update', updateListener)
  es.addEventListener('full-data', eventListener)
  es.addEventListener('error', errorListener)
  es.addEventListener('done', () => es.close())
}

async function searchSeasonal() {
  return fetchWithRetriesWithoutCb('/api/searchSeasonal') as Promise<{ data: SeasonalAnimeItem[] }>
}

async function getResourcePageSeoData(malType: MalType, malId: string | number) {
  return fetchWithRetriesWithoutCb(`/api/mal-page-seo/${malType}/${malId}`) as Promise<{
    data: {
      title: string
      image: string
    }
  }>
}

async function search(
  query: string,
  count: number,
): Promise<Array<{ name: string; malType: MalType; id: string }>> {
  const obj = (await fetchWithRetriesWithoutCb(
    `/api/search/${encodeURIComponent(query)}?count=${count}`,
    3,
  )) as { error: boolean; data: Array<{ name: string; malType: MalType; id: string }> }
  if (obj.error) {
    return []
  }
  return obj.data
}

async function fetchWithRetriesWithoutCb(url: string, retries = 0): Promise<unknown> {
  try {
    const response = await fetch(new URL(url, API_URL).href)
    const obj = await processResponse(response)
    return obj
  } catch (e) {
    console.log(e)
    // retry up to 2 times (3 tries total)
    if (retries < 3) {
      console.log('Retry count: ' + retries)
      return await fetchWithRetriesWithoutCb(url, retries + 1)
    } else {
      console.log('Reached max retry count!')
      throw e
    }
  }
}

type RepsponseError = Error & { response: Response; status: string }

function processResponse(response: Response) {
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

const Client = { crawl, search, searchSeasonal, getResourcePageSeoData }

export default Client
