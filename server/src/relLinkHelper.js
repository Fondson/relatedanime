const relLinkToMalTypeAndId = (relLink) => {
  const parts = relLink.split('/')
  return { malType: parts[1], malId: parts[2] }
}

const malTypeAndIdToRelLink = (malType, malId) => {
  return `/${malType}/${malId}`
}

module.exports = { relLinkToMalTypeAndId, malTypeAndIdToRelLink }
