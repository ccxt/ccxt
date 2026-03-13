'use strict';

// ----------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, AuthenticationError, InsufficientFunds, OrderNotFound, OrderNotFillable, InvalidOrder, RateLimitExceeded } = require ('./base/errors');

// ----------------------------------------------------------------------------

module.exports = class coinjar extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coinjar',
            'name': 'CoinJar Exchange',
            'countries': [ 'AU' ],
            'rateLimit': 1000, // 60 calls per minute
            'enableRateLimit': true,
            'has': {
                'CORS': true,
                'publicAPI': true,
                'privateAPI': true,
                'fetchAccounts': true,
                'fetchBalance': true,
                'fetchMarkets': true,
                'fetchTicker': true,
                'fetchTickers': false,
                'fetchOrderBook': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': false,
                'fetchTrades': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'createOrder': true,
                'cancelOrder': true,
                'cancelAllOrders': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/3690032/87370324-f782e000-c5c5-11ea-9f1e-967c28480ca0.png',
                'api': {
                    'public': 'https://data.exchange.coinjar.com',
                    'private': 'https://api.exchange.coinjar.com',
                },
                'www': 'https://exchange.coinjar.com/',
                'doc': 'https://docs.exchange.coinjar.com/',
                'fees': 'https://support.coinjar.com/hc/en-us/articles/360000826626-CoinJar-Exchange-trading-rates',
            },
            'requiredCredentials': {
                'apiKey': false,
                'secret': false,
                'token': true,
            },
            'api': {
                'public': {
                    'get': [
                        'products/{productId}/ticker',
                        'products/{productId}/book', // ?level=3
                        'products/{productId}/stats',
                        'products/{productId}/candles', // ?before=before&after=after&interval=interval
                    ],
                },
                'private': {
                    'get': [
                        'accounts',
                        'products',
                        'orders/{Oid}',
                        'orders', // ?cursor=0
                        'orders/all', // ?cursor=0
                        'fills', // ?cursor=0&product_id=BTCAUD
                    ],
                    'post': [
                        'orders',
                        'orders/cancel_all',
                    ],
                    'put': [
                    ],
                    'delete': [
                        'orders/{Oid}',
                    ],
                },
            },
            'exceptions': {
                'AUTHENTICATION_ERROR': AuthenticationError,
                'NOT_FOUND': OrderNotFound,
                'INSUFFICIENT_BALANCE': InsufficientFunds,
                'PRICE_OUTSIDE_SPREAD': OrderNotFillable,
                'PRICE_INVALID': InvalidOrder,
                'VALIDATION_ERROR': InvalidOrder,
                'PRODUCT_NOT_PERMITTED': InvalidOrder,
                'FILLED_OR_CANCELLED': OrderNotFillable,
                'MARKET_NO_CANCEL': OrderNotFillable,
            },
            'options': {
                'fetchCurrencies': {
                    'expires': 5000,
                },
                'accounts': [
                    'wallet',
                    'fiat',
                ],
            },
        });
    }

    async fetchMarkets (params = {}) {
        const markets = await this.privateGetProducts (params);
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = market['id'];
            const symbol = market['name'];
            const baseId = market['base_currency']['iso_code'];
            const base = this.safeCurrencyCode (baseId);
            const quoteId = market['counter_currency']['iso_code'];
            const quote = this.safeCurrencyCode (quoteId);
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'precision': undefined,
                'info': market,
                'active': true,
                'tierBased': true,
                'limits': undefined,
            });
        }
        return result;
    }

    async fetchAccounts (params = {}) {
        const response = await this.privateGetAccounts (params);
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const account = response[i];
            const accountId = this.safeString (account, 'number');
            const assetCode = this.safeString (account, 'asset_code');
            const code = this.safeCurrencyCode (assetCode);
            const type = this.safeString (account, 'type');
            result.push ({
                'id': accountId,
                'type': type,
                'currency': code,
                'info': account,
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetAccounts (params);
        const result = { 'info': response };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const assetCode = this.safeString (balance, 'asset_code');
            const code = this.safeCurrencyCode (assetCode);
            const account = {
                'free': this.safeFloat (balance, 'available'),
                'used': this.safeFloat (balance, 'hold'),
                'total': this.safeFloat (balance, 'balance'),
            };
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = this.extend ({
            'productId': market['id'],
        }, params);
        const tick = await this.publicGetProductsProductIdTicker (request);
        const ask = tick['ask'];
        const bid = tick['bid'];
        const last = tick['last'];
        const timestamp = tick['current_time'];
        return {
            'symbol': symbol,
            'timestamp': this.parse8601 (timestamp),
            'datetime': timestamp,
            'bid': bid,
            'ask': ask,
            'last': last,
            'high': undefined,
            'low': undefined,
            'bidVolume': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': undefined,
            'info': tick,
        };
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'productId': market['id'],
            'level': 3,
        };
        const response = await this.publicGetProductsProductIdBook (this.extend (request, params));
        const orderbook = this.parseOrderBook (response);
        return orderbook;
    }

    async fetchOrders (symbol = undefined, since = 0, limit = undefined, params = {}) {
        const market = await this.loadMarkets ();
        const request = {
            'cursor': since,
        };
        const response = await this.privateGetOrdersAll (this.extend (request, params));
        return this.parseOrders (response, market);
    }

    async fetchOpenOrders (symbol = undefined, since = 0, limit = undefined, params = {}) {
        const market = await this.loadMarkets ();
        const request = {
            'cursor': since,
        };
        const response = await this.privateGetOrders (this.extend (request, params));
        return this.parseOrders (response, market);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        const market = await this.loadMarkets ();
        const request = this.extend ({
            'Oid': id,
        }, params);
        const response = await this.privateGetOrdersOid (request);
        return this.parseOrder (response, market);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const product_id = this.marketId (symbol);
        const request = {
            'product_id': product_id,
            'type': type,
            'side': side,
            'price': price,
            'size': amount,
            'time_in_force': params['time_in_force'] || 'GTC',
        };
        const response = await this.privatePostOrders (this.extend (request, params));
        const productId = this.safeValue (response, 'product_id');
        const market = this.safeValue (this.markets_by_id, productId);
        return this.parseOrder (response, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'Oid': id,
        };
        const response = await this.privateDeleteOrdersOid (this.extend (request, params));
        const order = this.parseOrder (response);
        return order;
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        const request = {};
        const response = await this.privatePostOrdersCancelAll (this.extend (request, params));
        return response;
    }

    parseOrder (order, market = undefined) {
        const id = this.safeString (order, 'oid');
        const type = this.safeString (order, 'type');
        const timestamp = this.parse8601 (this.safeString (order, 'timestamp'));
        const status = this.safeString (order, 'status');
        const side = this.safeString (order, 'side');
        const price = this.safeFloat (order, 'price');
        const amount = this.safeFloat (order, 'size');
        const filled = this.safeFloat (order, 'filled');
        const remaining = amount - filled;
        const symbol = this.markets_by_id[order['product_id']]['symbol'];
        return {
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'trades': undefined,
            'fee': undefined,
            'info': order,
            'cost': undefined,
            'average': undefined,
        };
    }

    async fetchMyTrades (symbol = undefined, since = 0, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'cursor': since,
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['product_id'] = market['id'];
        }
        const response = await this.privateGetFills (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        const timestamp = this.parse8601 (this.safeString (trade, 'timestamp'));
        const productId = this.safeString (trade, 'product_id');
        const symbol = this.markets_by_id[productId]['symbol'];
        return {
            'info': trade,
            'id': this.safeString (trade, 'tid'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': undefined,
            'side': this.safeString (trade, 'side'),
            'order': this.safeString (trade, 'oid'),
            'takerOrMaker': this.safeString (trade, 'liquidity'),
            'price': this.safeFloat (trade, 'price'),
            'amount': this.safeFloat (trade, 'size'),
            'cost': this.safeFloat (trade, 'value'),
            'fee': this.safeFloat (trade, 'estimated_fee'),
        };
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const after = parseInt (since / 1000);
        const before = parseInt (this.now () / 1000);
        const request = {
            'productId': market['id'],
            'interval': timeframe,
            'after': after,
            'before': before,
        };
        const response = await this.publicGetProductsProductIdCandles (this.extend (request, params));
        // Sample response from publicGetProductsProductIdCandles()
        // [
        //     [
        //         "2018-03-06T00:00:00Z",
        //         "15010.00000000",
        //         "15010.00000000",
        //         "14540.00000000",
        //         "14550.00000000",
        //         "8.95300000"
        //     ],
        //     [
        //         "2018-03-06T04:00:00Z",
        //         "14590.00000000",
        //         "14700.00000000",
        //         "14000.00000000",
        //         "14590.00000000",
        //         "10.57200000"
        //     ],
        // ]
        const data = this.parseCandles (response);
        // Converts them into ccxt friendly format
        // [
        //     [
        //         1520294400000,
        //         15010,
        //         15010,
        //         14540,
        //         14550,
        //         8.953
        //     ],
        //     [
        //         1520308800000
        //         14590,
        //         14700,
        //         14000,
        //         14590,
        //         10.572
        //     ],
        // ]
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    parseCandles (response) {
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const row = response[i];
            const timestamp = this.parse8601 (this.safeString (row, 0));
            const open = this.safeNumber (row, 1);
            const high = this.safeNumber (row, 2);
            const low = this.safeNumber (row, 3);
            const close = this.safeNumber (row, 4);
            const volume = this.safeNumber (row, 5);
            result[i] = [timestamp, open, high, low, close, volume];
        }
        return result;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let fullPath = '/' + this.implodeParams (path, params);
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const authorization = 'Token token="' + this.token + '"';
            headers = {
                'Authorization': authorization,
                'Content-Type': 'application/json',
            };
            if (method === 'POST') {
                body = this.json (params);
            }
        }
        const query = this.omit (params, this.extractParams (path));
        if (method === 'GET') {
            if (Object.keys (query).length) {
                fullPath += '?' + this.urlencode (query);
            }
        }
        const url = this.urls['api'][api] + fullPath;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (code === 500) {
            throw new ExchangeError (response);
        }
        if (code === 429) {
            throw new RateLimitExceeded (response);
        }
        if (code >= 400) {
            const errorType = this.safeString (response, 'error_type');
            const message = this.safeString (response, 'error_messages');
            const feedback = this.id + ' ' + message;
            this.throwExactlyMatchedException (this.exceptions, errorType, feedback);
        }
    }
};
