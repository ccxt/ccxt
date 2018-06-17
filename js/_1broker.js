'use strict';

// ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, NotSupported } = require ('./base/errors');

// ---------------------------------------------------------------------------

module.exports = class _1broker extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': '_1broker',
            'name': '1Broker',
            'countries': 'US',
            'rateLimit': 1500,
            'version': 'v2',
            'has': {
                'publicAPI': false,
                'CORS': true,
                'fetchTrades': false,
                'fetchOHLCV': true,
            },
            'timeframes': {
                '1m': '60', // not working for some reason, returns {"server_time":"2018-03-26T03:52:27.912Z","error":true,"warning":false,"response":null,"error_code":-1,"error_message":"Error while trying to fetch historical market data. An invalid resolution was probably used."}
                '15m': '900',
                '1h': '3600',
                '1d': '86400',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766021-420bd9fc-5ecb-11e7-8ed6-56d0081efed2.jpg',
                'api': 'https://1broker.com/api',
                'www': 'https://1broker.com',
                'doc': 'https://1broker.com/?c=en/content/api-documentation',
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': false,
            },
            'api': {
                'private': {
                    'get': [
                        'market/bars',
                        'market/categories',
                        'market/details',
                        'market/list',
                        'market/quotes',
                        'market/ticks',
                        'order/cancel',
                        'order/create',
                        'order/open',
                        'position/close',
                        'position/close_cancel',
                        'position/edit',
                        'position/history',
                        'position/open',
                        'position/shared/get',
                        'social/profile_statistics',
                        'social/profile_trades',
                        'user/bitcoin_deposit_address',
                        'user/details',
                        'user/overview',
                        'user/quota_status',
                        'user/transaction_log',
                    ],
                },
            },
        });
    }

    async fetchCategories () {
        let response = await this.privateGetMarketCategories ();
        // they return an empty string among their categories, wtf?
        let categories = response['response'];
        let result = [];
        for (let i = 0; i < categories.length; i++) {
            if (categories[i])
                result.push (categories[i]);
        }
        return result;
    }

    async fetchMarkets () {
        let this_ = this; // workaround for Babel bug (not passing `this` to _recursive() call)
        let categories = await this.fetchCategories ();
        let result = [];
        for (let c = 0; c < categories.length; c++) {
            let category = categories[c];
            let markets = await this_.privateGetMarketList ({
                'category': category.toLowerCase (),
            });
            for (let p = 0; p < markets['response'].length; p++) {
                let market = markets['response'][p];
                let id = market['symbol'];
                let symbol = undefined;
                let base = undefined;
                let quote = undefined;
                if ((category === 'FOREX') || (category === 'CRYPTO')) {
                    symbol = market['name'];
                    let parts = symbol.split ('/');
                    base = parts[0];
                    quote = parts[1];
                } else {
                    base = id;
                    quote = 'USD';
                    symbol = base + '/' + quote;
                }
                base = this_.commonCurrencyCode (base);
                quote = this_.commonCurrencyCode (quote);
                result.push ({
                    'id': id,
                    'symbol': symbol,
                    'base': base,
                    'quote': quote,
                    'info': market,
                });
            }
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let balance = await this.privateGetUserOverview ();
        let response = balance['response'];
        let result = {
            'info': response,
        };
        let currencies = Object.keys (this.currencies);
        for (let c = 0; c < currencies.length; c++) {
            let currency = currencies[c];
            result[currency] = this.account ();
        }
        let total = this.safeFloat (response, 'balance');
        result['BTC']['free'] = total;
        result['BTC']['total'] = total;
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.privateGetMarketQuotes (this.extend ({
            'symbols': this.marketId (symbol),
        }, params));
        let orderbook = response['response'][0];
        let timestamp = this.parse8601 (orderbook['updated']);
        let bidPrice = this.safeFloat (orderbook, 'bid');
        let askPrice = this.safeFloat (orderbook, 'ask');
        let bid = [ bidPrice, undefined ];
        let ask = [ askPrice, undefined ];
        return {
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'bids': [ bid ],
            'asks': [ ask ],
            'nonce': undefined,
        };
    }

    async fetchTrades (symbol) {
        throw new NotSupported (this.id + ' fetchTrades () method not implemented yet');
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let result = await this.privateGetMarketBars (this.extend ({
            'symbol': this.marketId (symbol),
            'resolution': 60,
            'limit': 1,
        }, params));
        let ticker = result['response'][0];
        let timestamp = this.parse8601 (ticker['date']);
        let open = this.safeFloat (ticker, 'o');
        let close = this.safeFloat (ticker, 'c');
        let change = close - open;
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'h'),
            'low': this.safeFloat (ticker, 'l'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': close,
            'last': close,
            'previousClose': undefined,
            'change': change,
            'percentage': change / open * 100,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return [
            this.parse8601 (ohlcv['date']),
            parseFloat (ohlcv['o']),
            parseFloat (ohlcv['h']),
            parseFloat (ohlcv['l']),
            parseFloat (ohlcv['c']),
            undefined,
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
            'resolution': this.timeframes[timeframe],
        };
        if (typeof since !== 'undefined')
            request['date_start'] = this.iso8601 (since); // they also support date_end
        if (typeof limit !== 'undefined')
            request['limit'] = limit;
        let result = await this.privateGetMarketBars (this.extend (request, params));
        return this.parseOHLCVs (result['response'], market, timeframe, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let order = {
            'symbol': this.marketId (symbol),
            'margin': amount,
            'direction': (side === 'sell') ? 'short' : 'long',
            'leverage': 1,
            'type': side,
        };
        if (type === 'limit')
            order['price'] = price;
        else
            order['type'] += '_market';
        let result = await this.privateGetOrderCreate (this.extend (order, params));
        return {
            'info': result,
            'id': result['response']['order_id'],
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        return await this.privatePostOrderCancel ({ 'order_id': id });
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        this.checkRequiredCredentials ();
        let url = this.urls['api'] + '/' + this.version + '/' + path + '.php';
        let query = this.extend ({ 'token': this.apiKey }, params);
        url += '?' + this.urlencode (query);
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('warning' in response)
            if (response['warning'])
                throw new ExchangeError (this.id + ' ' + this.json (response));
        if ('error' in response)
            if (response['error'])
                throw new ExchangeError (this.id + ' ' + this.json (response));
        return response;
    }
};
