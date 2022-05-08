const { gzip, ungzip } = require('node-gzip')

const compressHtml = async (html) => {
  return (await gzip(html)).toString('base64')
}

const decompressHtml = async (compressedHtml) => {
  return (await ungzip(Buffer.from(compressedHtml, 'base64'))).toString()
}

module.exports = { compressHtml, decompressHtml }
