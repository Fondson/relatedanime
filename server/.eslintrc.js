module.exports = {
  parserOptions: {
    ecmaVersion: 2020,
  },
  extends: ['plugin:node/recommended', 'prettier'],
  settings: {
    node: {
      tryExtensions: ['.js', '.json', '.node', '.ts'],
    },
  },
}
