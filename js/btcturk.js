"use strict";

// ---------------------------------------------------------------------------

const btctrader = require ('./btctrader.js')

// ---------------------------------------------------------------------------

module.exports = class btcturk extends btctrader {

    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'btcturk',
            'name': 'BTCTurk',
            'countries': 'TR', // Turkey
            'rateLimit': 1000,
            'hasCORS': true,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27992709-18e15646-64a3-11e7-9fa2-b0950ec7712f.jpg',
                'api': 'https://www.btcturk.com/api',
                'www': 'https://www.btcturk.com',
                'doc': 'https://github.com/BTCTrader/broker-api-docs',
            },
            'markets': {
                'BTC/TRY': { 'id': 'BTCTRY', 'symbol': 'BTC/TRY', 'base': 'BTC', 'quote': 'TRY' },
                'ETH/TRY': { 'id': 'ETHTRY', 'symbol': 'ETH/TRY', 'base': 'ETH', 'quote': 'TRY' },
                'ETH/BTC': { 'id': 'ETHBTC', 'symbol': 'ETH/BTC', 'base': 'ETH', 'quote': 'BTC' },
            },
        })
    }
}
