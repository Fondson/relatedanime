const Redis = require('ioredis')

const TYPES = ['anime', 'manga']
let primaryClient = null
let searchClient = null
let malCacheClient = null

const createClient = (url) => {
  return new Redis(url, {
    retryStrategy: function (times) {
      if (times > 10) {
        return false
      }
      return Math.min(times * 50, 2000)
    },
  })
}

const getMainClient = () => {
  if (primaryClient == null) {
    primaryClient = createClient(process.env.REDIS_URL)
    primaryClient.on('error', function (err) {
      console.log('Redis: Something went wrong ' + err)
    })
  }
  return primaryClient
}

const getSearchClient = () => {
  if (searchClient == null) {
    searchClient = createClient(process.env.SEARCH_AND_SEASONAL_REDIS_URL)
    searchClient.on('error', function (err) {
      console.log('Search redis: Something went wrong ' + err)
    })
  }
  return searchClient
}

const getMalCacheClient = () => {
  if (malCacheClient == null) {
    malCacheClient = createClient(process.env.MAL_CACHE_REDIS_URL)
    malCacheClient.on('error', function (err) {
      console.log('MAL cache redis: Something went wrong ' + err)
    })
  }
  return malCacheClient
}

async function setSeries(malType, malId, value) {
  const client = getMainClient()
  const parentKey = createKey(malType, malId)
  console.log('Redis setting ' + parentKey)
  try {
    await client.set(parentKey, JSON.stringify(value))
    await _linkChildrenToParent(parentKey, value)
  } catch (e) {
    console.log('Redis error:')
    console.log(e)
  }
}

// For parent anime:1 with child anime:2, set key anime:2 to value anime:1.
// Note that parent is set to to the full series object.
async function _linkChildrenToParent(parentKey, parentSeries) {
  const client = getMainClient()
  const types = Object.values(parentSeries)
  for (let i = 0; i < types.length; ++i) {
    const children = types[i]
    for (let j = 0; j < children.length; ++j) {
      const child = children[j]
      // don't link maybeRelated to parent
      if (child.maybeRelated) continue

      const childKey = createKey(child.malType, child.malId)
      // do the link
      if (childKey !== parentKey) {
        console.log('Setting child ' + childKey + ' to parent ' + parentKey)
        await client.set(childKey, parentKey)
      }
    }
  }
}

async function getSeries(malType, malId) {
  try {
    const client = getMainClient()
    const parentKey = await getParentKey(createKey(malType, malId))
    if (parentKey === null) {
      return null
    }

    const value = await client.get(parentKey)
    return JSON.parse(value)
  } catch (e) {
    console.log('Redis error:')
    console.log(e)
    return null
  }
}

function isKey(key) {
  try {
    for (let i = 0; i < TYPES.length; ++i) {
      if (key.startsWith(TYPES[i])) {
        return true
      }
    }

    return false
  } catch (e) {
    return false
  }
}

function createKey(malType, malId) {
  return malType + ':' + malId
}

function getMalTypeAndMalIdFromKey(key) {
  // check that key is actually a key
  if (!isKey(key)) {
    return null
  }
  const parts = key.split(':')

  return { malType: parts[0], malId: parts[1] }
}

async function getParentKey(key) {
  const client = getMainClient()
  let ret = key
  const value = await client.get(key)
  if (isKey(value)) {
    const nextValue = await client.get(value)
    // This means we had anime:1 points to anime:2 and anime:2 points to anime:x instead of a series obj.
    // We're in a bad state (probably due to concurrent updates), just return null
    if (isKey(nextValue)) {
      console.log('Redis: Bad key points to key points to key state!')
      console.log('Redis: Returning null.')
      ret = null
    } else {
      ret = value
    }
  }
  return ret
}

async function searchSet(key, value) {
  const client = getSearchClient()
  console.log('Redis setting ' + key + ' to:')
  console.log(value)
  try {
    await client.set(key, JSON.stringify(value))
    await client.set(`${key}:last-updated`, Math.floor(Date.now() / 1000))
  } catch (e) {
    console.log('Redis error:')
    console.log(e)
  }
}

async function searchGet(key) {
  try {
    const client = getSearchClient()
    const value = await client.get(key)
    return JSON.parse(value)
  } catch (e) {
    console.log('Redis error:')
    console.log(e)
    return null
  }
}

async function searchLastUpdated(key) {
  try {
    const client = getSearchClient()
    const value = await client.get(`${key}:last-updated`)
    return value
  } catch (e) {
    console.log('Redis error:')
    console.log(e)
    return null
  }
}

const setMalCachePath = async (path, value) => {
  const client = getMalCacheClient()
  console.log('MAL cache redis setting ' + path)
  try {
    await client.set(path, value)
  } catch (e) {
    console.error('MAL cache redis error:', e)
  }
}

const getMalCachePath = async (path) => {
  try {
    const client = getMalCacheClient()
    const value = await client.get(path)
    return value
  } catch (e) {
    console.error('MAL cache redis error:', e)
    return undefined
  }
}

// initialize clients
getMainClient()
getSearchClient()
getMalCacheClient()

module.exports = {
  setSeries,
  getSeries,
  isKey,
  createKey,
  getMainClient,
  getSearchClient,
  getMalTypeAndMalIdFromKey,
  searchSet,
  searchGet,
  searchLastUpdated,
  setMalCachePath,
  getMalCachePath,
}
