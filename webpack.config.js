
const path = (new URL (import.meta.url)).pathname;
const split = path.split ('/')
split[split.length - 1] = 'dist'

export default {
  entry : "./ts/ccxt.ts",
  output: {
    path: split.join ('/'),
    filename: "web.js",
    library: {
      type: 'commonjs-static',
    },
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
    extensions: [ ".ts" ],
    // Add support for TypeScripts fully qualified ESM imports.
    extensionAlias: {
     ".js": [ ".js", ".ts" ],
    },
  },
  externals: {
    'ws': 'WebSocket',
  },
  mode: 'production',
  target: 'web',
  optimization: {
    minimize: false,
    usedExports: true,
    concatenateModules: false
  },
}
