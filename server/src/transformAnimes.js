function transformAnimes(animes) {
  return sortIntoTypes(animes)
}

function sortIntoTypes(animes) {
  let types = {}
  animes.forEach(function (anime) {
    if (!types.hasOwnProperty(anime.type)) {
      types[anime.type] = []
      console.log(anime.type)
    }
    types[anime.type].push(anime)
  })
  return types
}

module.exports = transformAnimes
