
const path = (new URL (import.meta.url)).pathname;
const split = path.split ('/')
split[split.length - 1] = 'dist'

export default {
  entry : "./ts/ccxt.ts",
  output: {
    path: split.join ('/'),
    filename: "webpack.out.js",
    chunkFormat: 'module',
  },
  module: {
    rules: [{
      test: /\.ts$/,
      use: 'ts-loader',
      exclude: [ /node_modules/ ],
    }],
  },
  resolve: {
    extensions: [ ".ts" ],
    // Add support for TypeScripts fully qualified ESM imports.
    extensionAlias: {
     ".js": [ ".js", ".ts" ],
    },
  },
  externals: [ 'ws', 'zlib' ],
  mode: 'production',
  target: 'es2019',
  optimization: {
    minimize: false,
  },
}
