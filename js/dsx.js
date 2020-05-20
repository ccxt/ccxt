'use strict';

// ---------------------------------------------------------------------------

const hitbtc = require ('./hitbtc.js');

// ---------------------------------------------------------------------------

module.exports = class dsx extends hitbtc {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'dsx',
            'name': 'DSX',
            'countries': [ 'UK' ],
            'rateLimit': 100,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/51840849/76909626-cb2bb100-68bc-11ea-99e0-28ba54f04792.jpg',
                'api': {
                    'public': 'https://api.dsxglobal.com',
                    'private': 'https://api.dsxglobal.com',
                },
                'www': 'http://dsxglobal.com',
                'doc': [
                    'https://api.dsxglobal.com',
                ],
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'maker': 0.15 / 100,
                    'taker': 0.25 / 100,
                },
            },
            'timeframes': {
                '1m': 'M1',
                '3m': 'M3',
                '5m': 'M5',
                '15m': 'M15',
                '30m': 'M30',
                '1h': 'H1',
                '4h': 'H4',
                '1d': 'D1',
                '1w': 'D7',
                '1M': '1M',
            },
        });
    }
};
