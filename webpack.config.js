import path from 'path';
import url from 'url';
import TerserPlugin from "terser-webpack-plugin";
import webpack from 'webpack';

const cwd = url.fileURLToPath (import.meta.url);
const outputDirectory = path.normalize (path.join (path.dirname (cwd), 'dist'))

export default {
  entry : './ts/ccxt.ts',
  output: {
    path: outputDirectory,
    filename: 'ccxt.browser.js',
    library: {
      type: 'self', // we are targeting the browser (including webworkers)
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
    minimizer: [new TerserPlugin ({ extractComments: false })],
    usedExports: true, // these two lines line turns on tree shaking
    concatenateModules: false,
    splitChunks: false,
  },
  performance: {
    hints: false,
  },
  plugins: [
    new webpack.IgnorePlugin({ resourceRegExp: /^protobufjs\/minimal$/ }),
    new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }),
  ],
}
