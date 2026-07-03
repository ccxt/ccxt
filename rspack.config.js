import path from 'path';
import url from 'url';
import { fileURLToPath } from "node:url";
import rspack from '@rspack/core';

const cwd = url.fileURLToPath (import.meta.url);
const outputDirectory = path.normalize (path.join (path.dirname (cwd), 'dist'))

import { createRequire } from "node:module";
const require = createRequire(import.meta.url);;

const outputFilename = process.env['CCXT_OUTPUT_FILENAME'] || 'ccxt.browser.js';
const minimizedFilename = outputFilename.replace (/\.js$/, '.min.js');

// Vendored node_modules (e.g. protobufjs) ship with CRLF and pass through
// verbatim; rewrite the emitted bundle to LF to match git's eol=lf.
const forceLf = (filename) => (compiler) => compiler.hooks.afterEmit.tap ('forceLf:' + filename, () => {
  const fs = require ('fs');
  const filePath = path.join (outputDirectory, filename);
  fs.writeFileSync (filePath, fs.readFileSync (filePath, 'utf8').replace (/\r\n/g, '\n'));
});

const baseConfig = {
  entry : './ts/ccxt.ts',
  output: {
    path: outputDirectory,
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
    // node's `crypto` module (used synchronously by base/functions/rsa.ts) has no browser
    // equivalent; stub it to an empty module so the bundle builds. rsa() guards on
    // crypto.createSign and throws "rsa is currently not supported in the browser".
    fallback: {
      crypto: false,
    },
  },
  mode: 'production',
  target: 'web',
  optimization: {
    usedExports: true, // these two lines line turns on tree shaking
    concatenateModules: false,
    splitChunks: false,
  },
  performance: {
    hints: false,
  },
  plugins: [
    new rspack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }),
  ],
  ignoreWarnings: [
    {
      message: /Critical dependency: the request of a dependency is an expression/,
    },
  ],
};

// Non-minimized build.
const unminimizedConfig = {
  ...baseConfig,
  output: {
    ...baseConfig.output,
    filename: outputFilename,
  },
  optimization: {
    ...baseConfig.optimization,
    minimize: false,
  },
  plugins: [
    ...baseConfig.plugins,
    forceLf (outputFilename),
  ],
};

// Minimized build with a source map.
const minimizedConfig = {
  ...baseConfig,
  devtool: 'source-map',
  output: {
    ...baseConfig.output,
    filename: minimizedFilename,
    sourceMapFilename: minimizedFilename + '.map',
  },
  optimization: {
    ...baseConfig.optimization,
    minimize: true,
  },
  plugins: [
    ...baseConfig.plugins,
    forceLf (minimizedFilename),
  ],
};

export default [unminimizedConfig, minimizedConfig];
