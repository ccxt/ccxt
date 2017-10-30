"use strict";

// ---------------------------------------------------------------------------

const okcoin = require ('./okcoin.js')

// ---------------------------------------------------------------------------

module.exports = class okcoinusd extends okcoin {

    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'okcoinusd',
            'name': 'OKCoin USD',
            'countries': [ 'CN', 'US' ],
            'hasCORS': false,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766791-89ffb502-5ee5-11e7-8a5b-c5950b68ac65.jpg',
                'api': {
                    'web': 'https://www.okcoin.com',
                    'public': 'https://www.okcoin.com/api',
                    'private': 'https://www.okcoin.com/api',
                },
                'www': 'https://www.okcoin.com',
                'doc': [
                    'https://www.okcoin.com/rest_getStarted.html',
                    'https://www.npmjs.com/package/okcoin.com',
                ],
            },
            'markets': {
                'BTC/USD': { 'id': 'btc_usd', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD', 'type': 'spot', 'spot': true, 'future': false },
                'LTC/USD': { 'id': 'ltc_usd', 'symbol': 'LTC/USD', 'base': 'LTC', 'quote': 'USD', 'type': 'spot', 'spot': true, 'future': false },
                'ETH/USD': { 'id': 'eth_usd', 'symbol': 'ETH/USD', 'base': 'ETH', 'quote': 'USD', 'type': 'spot', 'spot': true, 'future': false },
                'ETC/USD': { 'id': 'etc_usd', 'symbol': 'ETC/USD', 'base': 'ETC', 'quote': 'USD', 'type': 'spot', 'spot': true, 'future': false },
            }
        });
    }
}
