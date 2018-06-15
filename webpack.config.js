const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const CompressionPlugin = require("compression-webpack-plugin")

module.exports = {
  entry: {
    'ccxt': ['babel-polyfill', './ccxt.js'],
    'ccxt.min': ['babel-polyfill', './ccxt.js'],
  },
  output: {
    filename: '[name].js',
    path: __dirname + '/dist',
    library: 'ccxt',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.js', '.json']
  },
  plugins: [
    new UglifyJsPlugin({
      minimize: true,
      sourceMap: true,
      include: /\.min\.js$/,
    }),
    new CompressionPlugin({
      include: /\.min\.js$/,
    })
  ],
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['env'],
        }
      }
    ]
  }
};