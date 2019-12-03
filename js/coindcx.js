'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');

//  ---------------------------------------------------------------------------

module.exports = class coindcx extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coindcx',
            'name': 'CoinDCX',
            'countries': ['IN'], // india
            'urls': {
                'api': {
                    'api': 'https://api.coindcx.com',
                    'public': 'https://public.coindcx.com',
                },
                'www': 'https://coindcx.com/',
                'doc': 'https://coindcx-official.github.io/rest-api/',
                'fees': 'https://coindcx.com/fees',
            },
            'version': 'v1',
            'api': {
                'api': {
                    'get': [
                        'exchange/ticker',
                        'exchange/v1/markets',
                        'exchange/v1/markets_details',
                    ],
                },
                'public': {
                    'get': [
                        'market_data/trade_history',
                        'market_data/order_book',
                        'market_data/candles',
                    ],
                },
            },
            'has': {},
            'timeframes': {},
            'timeout': 10000,
            'rateLimit': 2000,
        });
    }

    async fetchMarkets (params = {}) {
        // answer example https://coindcx-official.github.io/rest-api/?javascript#markets-details
        const details = await this.apiGetExchangeV1MarketsDetails (params);
        const result = [];
        for (let i = 0; i < details.length; i++) {
            const market = details[i];
            const id = this.safeString (market, 'symbol');
            const baseId = this.safeString (market, 'base_currency_short_name');
            const base = this.safeCurrencyCode (baseId);
            const quoteId = this.safeString (market, 'target_currency_short_name');
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            let active = false;
            if (market['status'] === 'active') {
                active = true;
            }
            const precision = {
                'price': market['base_currency_precision'],
                'amount': market['target_currency_precision'],
            };
            const limits = {
                'amount': {
                    'min': this.safeFloat (market, 'min_quantity'),
                    'max': this.safeFloat (market, 'max_quantity'),
                },
                'price': {
                    'min': this.safeFloat (market, 'min_price'),
                    'max': this.safeFloat (market, 'max_price'),
                },
            };
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': active,
                'precision': precision,
                'limits': limits,
                'info': market,
            });
        }
        return result;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        // console.log (path, api, method, headers, body);
        const base = this.urls['api'][api];
        const url = base + '/' + path;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
