
const path = (new URL (import.meta.url)).pathname;
const split = path.split ('/')
split[split.length - 1] = 'dist'

export default {
  experiments: {
    outputModule: true,
    topLevelAwait: true,
  },
  entry : './ts/ccxt.ts',
  output: {
    path: split.join ('/'),
    filename: 'ccxt.browser.js',
    library: {
      type: 'window', // do not change
      name: 'ccxt',
    },
    chunkFormat: 'array-push',
    chunkLoading: 'jsonp',
  },
  cache: {
    type: 'filesystem',
  },
  module: {
    rules: [{
      test: /\.ts$/,
      use: 'ts-loader',
      exclude: [ /node_modules/ ],
      sideEffects: false,
    }],
  },
  resolve: {
    extensions: [ '.ts' ],
    // Add support for TypeScripts fully qualified ESM imports.
    extensionAlias: {
     '.js': [ '.js', '.ts' ],
    },
  },
  mode: 'production',
  target: 'web',
  optimization: {
    minimize: false,
    usedExports: true,
    concatenateModules: false,
  },
}
