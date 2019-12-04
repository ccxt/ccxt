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
                    'general': 'https://api.coindcx.com',
                    'public': 'https://public.coindcx.com',
                    'private': 'https://api.coindcx.com',
                },
                'www': 'https://coindcx.com/',
                'doc': 'https://coindcx-official.github.io/rest-api/',
                'fees': 'https://coindcx.com/fees',
            },
            'version': 'v1',
            'api': {
                'general': {
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
            'has': {
                'fetchTicker': 'emulated',
                'fetchTickers': true,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '2h': '2h',
                '4h': '4h',
                '6h': '6h',
                '8h': '8h',
                '1d': '1d',
                '3d': '3d',
                '1w': '1w',
                '1M': '1M',
            },
            'timeout': 10000,
            'rateLimit': 2000,
        });
    }

    async fetchMarkets (params = {}) {
        // answer example https://coindcx-official.github.io/rest-api/?javascript#markets-details
        const details = await this.generalGetExchangeV1MarketsDetails (params);
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
                'price': this.safeFloat (market, 'base_currency_precision'),
                'amount': this.safeFloat (market, 'target_currency_precision'),
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

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.generalGetExchangeTicker (params);
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const ticker = this.parseTicker (response[i]);
            const symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const response = await this.generalGetExchangeTicker (params);
        let result = {};
        const market = this.findMarket (symbol);
        const marketId = market['id'];
        if (marketId === undefined) {
            return result;
        }
        for (let i = 0; i < response.length; i++) {
            if (response[i]['market'] !== marketId) {
                continue;
            }
            result = this.parseTicker (response[i]);
            break;
        }
        return result;
    }

    parseTicker (ticker) {
        let timestamp = this.safeInteger (ticker, 'timestamp');
        if (timestamp !== undefined) {
            timestamp *= 1000;
        }
        const symbol = this.findSymbol (this.safeString (ticker, 'market'));
        const last = this.safeFloat (ticker, 'lastPrice');
        return {
            'symbol': symbol,
            'info': ticker,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': this.safeFloat (ticker, 'last_price'),
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'volume'),
            'quoteVolume': undefined,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        // console.log (path, api, method, headers, body);
        const base = this.urls['api'][api];
        const url = base + '/' + path;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
