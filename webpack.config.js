import path from 'path';
import url from 'url';
import { fileURLToPath } from "node:url";
import TerserPlugin from "terser-webpack-plugin";
import webpack from 'webpack';

const cwd = url.fileURLToPath (import.meta.url);
const outputDirectory = path.normalize (path.join (path.dirname (cwd), 'dist'))

import { createRequire } from "node:module";
const require = createRequire(import.meta.url);;

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
    extensions: [ '.ts', '.cjs', '.js' ],
    // this line is needed because we use import xxx.js in ccxt
    extensionAlias: {
     '.js': [ '.js', '.ts' ],
     '.cjs': ['.cjs', '.cts', '.ts', '.js'],
    },
    alias: {
      "protobufjs/minimal$": require.resolve("protobufjs/minimal"),
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
    // new webpack.IgnorePlugin({ resourceRegExp: /^protobufjs\/minimal(.js)?$/ }),
    new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }),
  ],
}
