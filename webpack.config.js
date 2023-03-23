import path from 'path';

const cwd = (new URL (import.meta.url)).pathname;
const outputDirectory = path.join (path.dirname (cwd), 'dist')

export default {
  entry : './ts/ccxt.ts',
  output: {
    path: outputDirectory,
    filename: 'ccxt.browser.js',
    library: {
      type: 'window', // we are targeting the browser
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
    // this line is needed because we use import xxx.js in ccxt
    extensionAlias: {
     '.js': [ '.js', '.ts' ],
    },
  },
  mode: 'production',
  target: 'web',
  optimization: {
    minimize: false,
    usedExports: true, // these two lines line turns on tree shaking
    concatenateModules: false,
  },
}
