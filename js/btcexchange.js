'use strict';

// ---------------------------------------------------------------------------

const btcturk = require ('./btcturk.js');

// ---------------------------------------------------------------------------

module.exports = class btcexchange extends btcturk {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'btcexchange',
            'name': 'BTCExchange',
            'countries': [ 'PH' ], // Philippines
            'rateLimit': 1500,
            'has': {
                'CORS': false,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27993052-4c92911a-64aa-11e7-96d8-ec6ac3435757.jpg',
                'api': 'https://www.btcexchange.ph/api',
                'www': 'https://www.btcexchange.ph',
                'doc': 'https://github.com/BTCTrader/broker-api-docs',
            },
            'markets': {
                'BTC/PHP': { 'id': 'BTC/PHP', 'symbol': 'BTC/PHP', 'base': 'BTC', 'quote': 'PHP' },
            },
        });
    }
};
