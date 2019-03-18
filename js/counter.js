'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
//  ---------------------------------------------------------------------------

module.exports = class counter extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'counter',
            'name': 'Counter',
            'countries': ['UK'],
            'rateLimit': 1000,
            'has': {
                'publicAPI': true,
                'privateAPI': false,
            },
            'timeframes': {
                '1m': 60,
                '5m': 300,
                '15m': 900,
                '30m': 1800,
                '1h': 3600,
                '2h': 7200,
                '4h': 14400,
                '12h': 43200,
                '1d': 86400,
                '3d': 259200,
                '1w': 604800,
            },
            'urls': {
                'logo': 'https://s3.eu-west-2.amazonaws.com/counter-market-content/ccxt/logo.png',
                'api': 'https://counter.market/api',
                'www': 'https://counter.market',
                'doc': 'https://counter.market/developers',
            },
            'api': {
                'public': {
                    'get': [
                        'markets',
                        'tokens',
                        'ticker',
                        'orderbook',
                        'ohlcv',
                        'trades',
                    ],
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        let items = await this.publicGetMarkets ();
        let tokens = await this.publicGetTokens ();
        tokens = tokens['items'];
        items = items['items'];
        let mapTokens = {};
        for (let i = 0; i < tokens.length; i++) {
            mapTokens[tokens[i]['code']] = tokens[i];
        }
        let markets = [];
        for (let i = 0; i < items.length; i++) {
            let bq = items[i]['symbol'].split ('/');
            markets.push ({
                'symbol': items[i]['symbol'],
                'base': bq[0],
                'quote': bq[1],
                'id': items[i]['symbol'],
                'precision': {
                    'price': 8,
                    'amount': mapTokens[items[i]['stockTokenCode']]['decimalPlaces'],
                },
            });
        }
        return markets;
    }

    async fetchCurrencies (params = {}) {
        let tokens = await this.publicGetTokens ();
        tokens = tokens['items'];
        let currencies = [];
        for (let i = 0; i < tokens.length; i++) {
            currencies.push ({
                'code': tokens[i]['symbol'],
                'id': tokens[i]['code'],
            });
        }
        return currencies;
    }

    async fetchTicker (symbol = undefined, params = {}) {
        let ticker = await this.publicGetTicker (this.extend ({
            'symbol': symbol,
        }, params));
        let date = this.milliseconds ();
        return {
            'symbol': symbol,
            'info': ticker,
            'timestamp': date,
            'datetime': this.iso8601 (date),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'vwap': ticker['cashVolume'] === '0' ? 0 : this.safeFloat (ticker, 'stockVolume') / this.safeFloat (ticker, 'cashVolume'),
            'open': this.safeFloat (ticker, 'openPrice'),
            'close': this.safeFloat (ticker, 'lastPrice'),
            'last': this.safeFloat (ticker, 'lastPrice'),
            'previousClose': this.safeFloat (ticker, 'last24hPrice'),
            'change': this.safeFloat (ticker, 'lastPrice') - this.safeFloat (ticker, 'openPrice'),
            'percentage': ticker['openPrice'] === '0' ? 0 : (this.safeFloat (ticker, 'lastPrice') - this.safeFloat (ticker, 'openPrice') / this.safeFloat (ticker, 'openPrice') * 100),
            'average': (this.safeFloat (ticker, 'lastPrice') - this.safeFloat (ticker, 'openPrice')) / 2,
            'quoteVolume': this.safeFloat (ticker, 'stockVolume'),
            'baseVolume': this.safeFloat (ticker, 'cashVolume'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
        };
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        let orderBook = await this.publicGetOrderbook (this.extend ({
            'symbol': symbol
        }, params));
        let bids = [];
        let asks = [];
        for (let i = 0; i < orderBook['buy'].length; i++) {
            bids.push ([this.safeFloat (orderBook['buy'][i], 'cashPrice'), this.safeFloat (orderBook['buy'][i], 'stockAmount')]);
        }
        for (let i = 0; i < orderBook['sell'].length; i++) {
            asks.push ([this.safeFloat (orderBook['sell'][i], 'cashPrice'), this.safeFloat (orderBook['sell'][i], 'stockAmount')]);
        }
        bids = this.sortBy (bids, 0, true);
        asks = this.sortBy (asks, 0);
        return {
            'bids': bids,
            'asks': asks,
            'nonce': undefined,
            'timestamp': undefined,
            'datetime': undefined,
        };
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = 30, params = {}) {
        let date = this.milliseconds ();
        let request = {
            'symbol': symbol,
            'since': since,
            'step': this.timeframes[timeframe],
        };
        if (since === undefined) {
            request['since'] = date - limit * request['step'];
        }
        request['till'] = request['since'] + limit * request['step'];
        let ohlcv = await this.publicGetOhlcv (this.extend (request, params));
        ohlcv = ohlcv['items'];
        for (let i = 0; i < ohlcv.length; i++) {
            ohlcv[i] = [ohlcv[i]['time'], this.safeFloat (ohlcv[i], 'open'), this.safeFloat (ohlcv[i], 'high'), this.safeFloat (ohlcv[i], 'low'), this.safeFloat (ohlcv[i], 'close'), this.safeFloat (ohlcv[i], 'volume')];
        }
        return ohlcv;
    }

    async fetchTrades (symbol, since = 0, limit = 30, params = {}) {
        let request = {
            'symbol': symbol,
            'since': since,
            'limit': limit,
        };
        let trades = await this.publicGetTrades (this.extend (request, params));
        trades = trades['items'];
        for (let i = 0; i < trades.length; i++) {
            let date = this.parse8601 (trades[i]['timestamp']);
            trades[i] = {
                'info': trades[i],
                'id': undefined,
                'timestamp': date,
                'datetime': this.iso8601 (date),
                'symbol': symbol,
                'type': 'limit',
                'side': trades[i]['type'],
                'price': this.safeFloat (trades[i], 'cashPrice'),
                'amount': this.safeFloat (trades[i], 'stockAmount'),
            };
        }
        return trades;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'];
        if (path === 'tokens' || path === 'markets') {
            url += '/' + path;
        } else {
            url += '/markets';
            if (params['symbol'] !== undefined) {
                url += '/' + params['symbol'];
            }
            params = this.omit (params, 'symbol');
            url += '/' + path;
        }
        params['order'] = 'asc';
        if (Object.keys (params).length) {
            url += '?' + this.urlencode (params);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
