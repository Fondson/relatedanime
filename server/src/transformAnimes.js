function transformAnimes(animes) {
  // sort into types
  let types = {}
  animes.forEach(function (anime) {
    if (!types.hasOwnProperty(anime.type)) {
      types[anime.type] = []
    }
    types[anime.type].push(anime)
  })
  return types
}

module.exports = transformAnimes
