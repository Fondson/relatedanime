module.exports = {
  extends: ['plugin:node/recommended', 'prettier'],
  settings: {
    node: {
      tryExtensions: ['.js', '.json', '.node', '.ts'],
    },
  },
}
