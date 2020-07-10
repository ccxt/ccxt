'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');

//  ---------------------------------------------------------------------------

module.exports = class bitpanda extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitpanda',
            'name': 'Bitpanda',
            'countries': [ 'AT' ], // Austria
            'rateLimit': 300,
            'version': 'v1',
            // new metainfo interface
            'has': {
            },
            'timeframes': {
                '1m': '1m',
                '3m': '3m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '2h': '2h',
                '4h': '4h',
                '6h': '6h',
                '8h': '8h',
                '12h': '12h',
                '1d': '1d',
                '3d': '3d',
                '1w': '1w',
                '1M': '1M',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/29604020-d5483cdc-87ee-11e7-94c7-d1a8d9169293.jpg',
                'api': {
                    'public': 'https://api.exchange.bitpanda.com/public',
                    'private': 'https://api.exchange.bitpanda.com/public',
                },
                'www': 'https://www.bitpanda.com',
                'doc': [
                    'https://developers.bitpanda.com',
                ],
                'fees': 'https://www.bitpanda.com/en/pro/fees',
            },
            'api': {
                'public': {
                    'get': [
                        'currencies',
                        'candlesticks/{instrument_code}',
                        'fees',
                        'instruments',
                        'order-book/{instrument_code}',
                        'market-ticker',
                        'market-ticker/{instrument_code}',
                        'price-ticks/{instrument_code}',
                        'time',
                    ],
                },
                'private': {
                    'get': [
                    ],
                    'post': [
                    ],
                    'delete': [
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'taker': 0.001,
                    'maker': 0.001,
                    'tiers': [
                        // volume in BTC
                        {
                            'taker': [
                                [0, 0.15 / 100],
                                [100, 0.13 / 100],
                                [250, 0.13 / 100],
                                [1000, 0.1 / 100],
                                [5000, 0.09 / 100],
                                [10000, 0.075 / 100],
                                [20000, 0.065 / 100],
                            ],
                            'maker': [
                                [0, 0.1 / 100],
                                [100, 0.1 / 100],
                                [250, 0.09 / 100],
                                [1000, 0.075 / 100],
                                [5000, 0.06 / 100],
                                [10000, 0.05 / 100],
                                [20000, 0.05 / 100],
                            ],
                        },
                    ],
                },
            },
            // exchange-specific options
            'options': {
            },
            'exceptions': {
            },
        });
    }
};
