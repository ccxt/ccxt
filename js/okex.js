"use strict";

const okcoin = require ('./okcoin.js')

module.exports = Object.assign ({}, okcoin, {

    'id': 'okex',
    'name': 'OKEX',
    'countries': [ 'CN', 'US' ],
    'hasCORS': false,
    'urls': {
        'logo': 'https://user-images.githubusercontent.com/1294454/29562593-9038a9bc-8742-11e7-91cc-8201f845bfc1.jpg',
        'api': {
            'www': 'https://www.okex.com',
            'public': 'https://www.okex.com/api',
            'private': 'https://www.okex.com/api',
        },
        'www': 'https://www.okex.com',
        'doc': 'https://www.okex.com/rest_getStarted.html',
    },
    'markets': {
        'BTC/USD': { 'id': 'btc_usd', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD', 'type': 'future', 'spot': false, 'future': true },
        'LTC/USD': { 'id': 'ltc_usd', 'symbol': 'LTC/USD', 'base': 'LTC', 'quote': 'USD', 'type': 'future', 'spot': false, 'future': true },
        'LTC/BTC': { 'id': 'ltc_btc', 'symbol': 'LTC/BTC', 'base': 'LTC', 'quote': 'BTC', 'type': 'spot', 'spot': true, 'future': false },
        'ETH/BTC': { 'id': 'eth_btc', 'symbol': 'ETH/BTC', 'base': 'ETH', 'quote': 'BTC', 'type': 'spot', 'spot': true, 'future': false },
        'ETC/BTC': { 'id': 'etc_btc', 'symbol': 'ETC/BTC', 'base': 'ETC', 'quote': 'BTC', 'type': 'spot', 'spot': true, 'future': false },
        'BCH/BTC': { 'id': 'bcc_btc', 'symbol': 'BCH/BTC', 'base': 'BCH', 'quote': 'BTC', 'type': 'spot', 'spot': true, 'future': false },
    },
})
