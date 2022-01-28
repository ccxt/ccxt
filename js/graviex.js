'use strict';

// ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
// const { AuthenticationError, InsufficientFunds } = require ('./base/errors');
// const Precise = require ('./base/Precise');

// ---------------------------------------------------------------------------

module.exports = class graviex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'graviex',
            'name': 'Graviex',
            'version': 'v3',
            'countries': [ 'MT', 'RU' ],
            'rateLimit': 1000,
            'has': {
                'CORS': undefined,
                'fetchMarkets': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchBalance': false,
                'fetchCurrencies': false,
                'fetchTrades': false,
                'fetchOHLCV': false,
                'fetchOrders': false,
                'fetchOrder': false,
                'fetchOrderBook': false,
                'fetchOrderBooks': false,
                'fetchL2OrderBook': false,
                'fetchOrderTrades': false,
                'fetchMyTrades': false,
                'fetchWithdrawals': false,
                'fetchDeposits': false,
                'fetchDepositAddress': false,
                'createOrder': false,
                'cancelOrder': false,
                'createOcoOrder': false,
            },
            'timeframes': {
                '1m': '1',
                '5m': '5',
                '15m': '15',
                '30m': '30',
                '1h': '60',
                '2h': '120',
                '4h': '240',
                '6h': '360',
                '12h': '720',
                '1d': '1440',
                '3d': '4320',
                '1w': '10080',
            },
            'urls': {
                'logo': '',
                'api': {
                    'public': 'https://graviex.net//webapi/v3',
                    'private': 'https://graviex.net//webapi/v3',
                },
                'www': 'https://graviex.net',
                'doc': 'https://graviex.net/documents/api_v3',
                'fees': 'https://graviex.net/documents/fees-and-discounts',
            },
            'api': {
                // market: Unique market id. It's always in the form of xxxyyy, where xxx is the base currency code, yyy is the quote currency code, e.g. 'btccny'. All available markets can be found at /api/v2/markets.
                'public': {
                    'get': [
                        'markets',
                        'tickers',
                        'trades', // Requires market XXXYYY. Optional: limit, timestamp, from, to, order_by
                    ],
                },
                'private': {
                },
            },
            'fees': {
                'trading': {
                    'percentage': true,
                    'maker': this.parseNumber ('0.001'),
                    'taker': this.parseNumber ('0.2'),
                },
                'funding': {
                    'withdraw': {
                        'BTC': 0.0004,
                        'ETH': 0.022,
                        'DOGE': 2.0,
                        'NYC': 1.0,
                        'XMR': 0.02,
                        'PIVX': 0.2,
                        'NEM': 0.05,
                        'SCAVO': 5.0,
                        'SEDO': 5.0,
                        'USDT': 3.0,
                        'GDM': 0.3,
                        'PIRL': 0.005,
                        'PK': 0.1,
                        'ORM': 10,
                        'NCP': 10,
                        'ETM': 10,
                        'USD': 0,
                        'EUR': 0,
                        'RUB': 0,
                        'other': 0.002,
                    },
                },
            },
            'limits': {
                'amount': {
                    'min': 0.001,
                    'max': undefined,
                },
            },
            'precision': {
                'amount': 8,
                'price': 8,
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetMarkets ();
        const markets = response;
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const id = markets[i]['id'];
            const symbolParts = markets[i]['name'].split ('/');
            const baseId = symbolParts[0];
            const quoteId = symbolParts[1];
            const base = this.commonCurrencyCode (baseId);
            const quote = this.commonCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const active = true;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': active,
                'info': markets[i],
            });
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        const timestamp = this.milliseconds ();
        const symbol = market['symbol'];
        // ticker = ticker['ticker'];
        const last = this.safeFloat (ticker, 'last');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'buy'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'sell'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': this.safeFloat (ticker, 'change'),
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'volume'),
            'quoteVolume': this.safeFloat (ticker, 'volume2'),
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'].replace ('_', ''),
        };
        const response = await this.publicGetTickers (this.extend (request, params));
        if (Array.isArray (response)) {
            const firstTicker = this.safeValue (response, 0, {});
            return this.parseTicker (firstTicker, market);
        }
        return this.parseTicker (response, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetTickers (params);
        const data = response;
        // let timestamp = data['at'];
        // let tickers = data['ticker'];
        const ids = Object.keys (data);
        const result = {};
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const market = this.markets_by_id[id];
            const symbol = market['symbol'];
            result[symbol] = this.parseTicker (response[id], market);
        }
        return result;
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + path;
        if (Object.keys (params).length) {
            url += '?' + this.urlencode (params);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined, config = {}, context = {}) {
        const response = await this.fetch2 (path, api, method, params, headers, body, config, context);
        return response;
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return '1'; // return;
        }
    }
};
