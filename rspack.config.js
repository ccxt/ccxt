import path from 'path';
import url from 'url';
import { fileURLToPath } from "node:url";
import rspack from '@rspack/core';

const cwd = url.fileURLToPath (import.meta.url);
const outputDirectory = path.normalize (path.join (path.dirname (cwd), 'dist'))

import { createRequire } from "node:module";
const require = createRequire(import.meta.url);;

const minimize = process.env['CCXT_MINIMIZE'] === 'true';
const outputFilename = process.env['CCXT_OUTPUT_FILENAME'] || 'ccxt.browser.js';

// Vendored node_modules (e.g. protobufjs) ship with CRLF and pass through
// verbatim; rewrite the emitted bundle to LF to match git's eol=lf.
const outputPath = path.join (outputDirectory, outputFilename);
const forceLf = (compiler) => compiler.hooks.afterEmit.tap ('forceLf', () => {
  const fs = require ('fs');
  fs.writeFileSync (outputPath, fs.readFileSync (outputPath, 'utf8').replace (/\r\n/g, '\n'));
});

export default {
  entry : './ts/ccxt.ts',
  output: {
    path: outputDirectory,
    filename: outputFilename,
    library: {
      type: 'self', // we are targeting the browser (including webworkers)
      name: 'ccxt',
    },
    chunkFormat: 'array-push',
    chunkLoading: 'jsonp',
  },
  module: {
    rules: [{
      test: /\.ts$/,
      loader: 'builtin:swc-loader',
      options: {
        jsc: {
          parser: {
            syntax: 'typescript',
          },
          target: 'es2021',
        },
      },
      exclude: [ /node_modules/ ],
      sideEffects: false,
      type: 'javascript/auto',
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
    minimize: minimize,
    usedExports: true, // these two lines line turns on tree shaking
    concatenateModules: false,
    splitChunks: false,
  },
  performance: {
    hints: false,
  },
  plugins: [
    new rspack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }),
    forceLf,
  ],
  ignoreWarnings: [
    {
      message: /Critical dependency: the request of a dependency is an expression/,
    },
  ],
}
