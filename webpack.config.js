
const path = (new URL (import.meta.url)).pathname;
const split = path.split ('/')
split[split.length - 1] = 'dist'

export default {
  entry : "./js/ccxt.js",
  output: {
    path: split.join ('/'),
    filename: "webpack.out.js",
    chunkFormat: 'module',
  },
  externals: [ /.*node-fetch\/.*$/i, /.*\/ws\/lib\/.*$/i ],
  mode: 'production',
  target: 'es2019',
  optimization: {
    minimize: false,
  }
}
