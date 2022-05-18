const cheerioModule = require('cheerio')
const getMalPage = require('./getMalPage')

const getSeoData = async (relLink) => {
  const body = await getMalPage(relLink)
  const $ = cheerioModule.load(body)

  const title =
    $('.h1-title').find('.title-name').text().trim() ||
    $('.h1-title').find('span[itemprop=name]').contents()[0].data.trim()

  const imageElement = $('img[itemprop=image]')
  const image =
    imageElement.length < 1 ? '' : imageElement.attr('src') || imageElement.attr('data-src')

  return { title, image }
}

module.exports = getSeoData
