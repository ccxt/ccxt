'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');

//  ---------------------------------------------------------------------------

module.exports = class globe extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'globe',
            'name': 'Globe',
            'countries': [ 'SC' ], // Seychelles
            'version': 'v1',
            'userAgent': undefined,
            'rateLimit': 22,
            'pro': true,
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
                '12h': '12h',
                '1d': '1d',
                '3d': '3d',
                '1w': '1w',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/6444377/112348305-9caa9800-8cbf-11eb-8692-30f049d87d97.jpg',
                'api': {
                    'public': 'https://globedx.com/api/v1',
                    'private': 'https://globedx.com/api/v1',
                    'ws': 'wss://globedx.com/api/v1/ws',
                },
                'www': 'https://globedx.com/',
                'doc': [
                    'https://developers.globedx.com/#introduction',
                    'https://github.com/globedx/globe-api-clients',
                ],
                'fees': 'https://globedx.com/en/fees',
            },
            'api': {
                'public': {
                    'get': [
                        'history/{symbol}/candles/{timeframe}',
                        'history/index-price/{symbol}/candles/{timeframe}',
                    ],
                },
            },
            'markets': {
                'BTC/USD': { 'id': 'XBTUSD', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD', 'baseId': 'XBT', 'quoteId': 'USD', 'precision': { 'amount': 1, 'price': 0.5 }},
                'ETH/USD': { 'id': 'ETHUSD', 'symbol': 'ETH/USD', 'base': 'ETH', 'quote': 'USD', 'baseId': 'ETH', 'quoteId': 'USD', 'precision': { 'amount': 1, 'price': 0.05 }},
                'UNI/USD': { 'id': 'UNIUSD', 'symbol': 'UNI/USD', 'base': 'UNI', 'quote': 'USD', 'baseId': 'UNI', 'quoteId': 'USD', 'precision': { 'amount': 1, 'price': 0.05 }},
                'VXBT/USD': { 'id': 'VXBT', 'symbol': 'VXBT/USD', 'base': 'VXBT', 'quote': 'USD', 'baseId': 'VXBT', 'quoteId': 'USD', 'precision': { 'amount': 1, 'price': 0.0005 }},
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0.00,
                    'taker': 0.075 / 100,
                },
            },
        });
    }

    parseOHLCV (ohlcv, market = undefined) {
        // {
        //     "open":56571.5,
        //     "high":56583.0,
        //     "low":56549.5,
        //     "close":56562.5,
        //     "time":1616599260000,
        //     "volume":512144
        // }
        return [
            this.safeTimestamp (ohlcv, 'time'),
            this.safeFloat (ohlcv, 'open'),
            this.safeFloat (ohlcv, 'high'),
            this.safeFloat (ohlcv, 'low'),
            this.safeFloat (ohlcv, 'close'),
            this.safeFloat (ohlcv, 'volume'),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'timeframe': this.timeframes[timeframe],
        };
        if (limit !== undefined) {
            request['max'] = limit; // default 100, max 1440
        }
        if (since !== undefined) {
            request['from'] = parseInt (since);
        }
        const response = await this.publicGetHistorySymbolCandlesTimeframe (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const query = this.omit (params, this.extractParams (path));
        let url = this.urls['api'][api] + '/' + this.implodeParams (path, params);
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
