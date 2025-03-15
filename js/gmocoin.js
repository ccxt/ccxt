'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { AccountSuspended, BadRequest, ExchangeError, ExchangeNotAvailable, AuthenticationError, InsufficientFunds, InvalidOrder, OnMaintenance, OrderNotFound, PermissionDenied, RateLimitExceeded } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class gmocoin extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'gmocoin',
            'name': 'GMOCoin',
            'countries': ['JP'],
            'version': 'v1',
            'has': {
                'cancelOrder': true,
                'createOrder': true,
                'fetchBalance': true,
                'fetchCurrencies': false,
                'fetchMyTrades': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchTicker': true,
                'fetchTrades': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/69445828/104123101-70ec6700-538c-11eb-9572-f5b7ea9bc7fd.png',
                'api': {
                    'public': 'https://api.coin.z.com/public',
                    'private': 'https://api.coin.z.com/private',
                },
                'www': 'https://coin.z.com/jp/',
                'doc': 'https://api.coin.z.com/docs/',
                'fees': 'https://coin.z.com/jp/corp/guide/fees/',
            },
            'api': {
                'public': {
                    'get': [
                        'ticker',
                        'orderbooks',
                        'trades'],
                },
                'private': {
                    'get': [
                        'account/assets',
                        'orders',
                        'activeOrders',
                        'latestExecutions',
                    ],
                    'post': [
                        'order',
                        'cancelOrder',
                        'cancelOrders'],
                },
            },
            'markets': {
                'BTC/JPY': {
                    'id': 'BTC',
                    'symbol': 'BTC/JPY',
                    'base': 'BTC',
                    'quote': 'JPY',
                    'baseId': 'btc',
                    'quoteId': 'jpy',
                },
                'ETH/JPY': {
                    'id': 'ETH',
                    'symbol': 'ETH/JPY',
                    'base': 'ETH',
                    'quote': 'JPY',
                    'baseId': 'eth',
                    'quoteId': 'jpy',
                },
                'BCH/JPY': {
                    'id': 'BCH',
                    'symbol': 'BCH/JPY',
                    'base': 'BCH',
                    'quote': 'JPY',
                    'baseId': 'bcc',
                    'quoteId': 'jpy',
                },
                'LTC/JPY': {
                    'id': 'LTC',
                    'symbol': 'LTC/JPY',
                    'base': 'LTC',
                    'quote': 'JPY',
                    'baseId': 'ltc',
                    'quoteId': 'jpy',
                },
                'XRP/JPY': {
                    'id': 'XRP',
                    'symbol': 'XRP/JPY',
                    'base': 'XRP',
                    'quote': 'JPY',
                    'baseId': 'xrp',
                    'quoteId': 'jpy',
                },
            },
            'fees': {
                'trading': {
                    'maker': -0.01 / 100,
                    'taker': 0.05 / 100,
                },
            },
            'precision': {
                'price': 8,
                'amount': 8,
            },
            'exceptions': {
                'ERR-189': InvalidOrder,
                'ERR-200': RateLimitExceeded,
                'ERR-201': InsufficientFunds,
                'ERR-208': InsufficientFunds,
                'ERR-430': InvalidOrder,
                'ERR-554': ExchangeNotAvailable,
                'ERR-626': ExchangeNotAvailable,
                'ERR-635': RateLimitExceeded,
                'ERR-5003': RateLimitExceeded,
                'ERR-5008': AuthenticationError,
                'ERR-5009': AuthenticationError,
                'ERR-5106': BadRequest,
                'ERR-5012': AuthenticationError,
                'ERR-5014': PermissionDenied,
                'ERR-5121': InvalidOrder,
                'ERR-5122': InvalidOrder,
                'ERR-5123': OrderNotFound,
                'ERR-5127': AccountSuspended,
                'ERR-5129': InvalidOrder,
                'ERR-5201': OnMaintenance,
                'ERR-5202': OnMaintenance,
                'ERR-5203': InvalidOrder,
                'ERR-5204': BadRequest,
                'ERR-5206': RateLimitExceeded,
            },
            'errorMessages': {
                'ERR-189': 'The quantity of your close order exceeds your open position.',
                'ERR-200': 'There are existing active orders and your order exceeds the maximum quantity that can be ordered. Please change the quantity to order or cancel an active order in order to create a new close order.',
                'ERR-201': 'Insufficient funds.',
                'ERR-208': 'The quantity of your order exceeds your available balance. Please check your balance or active orders.',
                'ERR-430': 'Invalid parameter (orderId/executionId) in executions.',
                'ERR-554': 'The server is unavalibale.',
                'ERR-626': 'The server is busy. Please retry later.',
                'ERR-635': 'The number of active orders has exceeded the limit. Please cancel an active order to create a new order.',
                'ERR-5003': 'The API usage limits are exceeded.',
                'ERR-5008': 'The API-TIMESTAMP that is set in the request header is later than the system time of the API.',
                'ERR-5009': 'The API-TIMESTAMP that is set in the request header is earlier than the system time of the API.',
                'ERR-5106': 'The request parameter is invalid.',
                'ERR-5012': 'The API authentication is invalid.',
                'ERR-5014': 'The membership agreement has not been completed.',
                'ERR-5121': 'Impossible to order due to order price is too low.',
                'ERR-5122': 'The specified order can not be changed or canceled (already MODIFYING, CANCELLING, CANCELED, EXECUTED or EXPIRED). Orders can be changed or canceled only in ORDERED (WAITING for stop limit orders) status.',
                'ERR-5123': "The specified order doesn't exist.",
                'ERR-5127': 'Your API connection is restricted.',
                'ERR-5129': 'Stop limit orders cannot be specified a price that will be executed immediately.',
                'ERR-5201': 'A response code that when Public/Private API is called while the service is in a regular maintenance.',
                'ERR-5202': 'A response code that when Public/Private API is called while the service is in a emergency maintenance.',
                'ERR-5203': 'A response code that when order or change order is called while the service is pre-open.',
                'ERR-5204': 'The request API PATH is invalid.',
                'ERR-5206': 'The limits of changing order for each order are exceeded. If you would like further changes for the order, please cancel the order and create a brand new order.mitExceeded',
            },
        });
    }

    async fetchStatus (params = {}) {
        const response = await this.publicGetStatus (params);
        const data = this.safeValue (response, 'data');
        const status = this.safeValue (data, 'status');
        if (status !== undefined) {
            const formattedStatus = status === 'OPEN' ? 'ok' : 'maintenance';
            this.status = this.extend (this.status, {
                'status': formattedStatus,
                'updated': this.milliseconds (),
            });
        }
        return this.status;
    }

    parseTicker (ticker, market = undefined) {
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const datetime = this.safeString (ticker, 'timestamp');
        const last = this.safeFloat (ticker, 'last');
        return {
            'symbol': symbol,
            'timestamp': this.parse8601 (datetime),
            'datetime': datetime,
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
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'volume'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {};
        params['symbol'] = market['id'];
        const response = await this.publicGetTicker (this.extend (request, params));
        const data = this.safeValue (response, 'data', {});
        if (data.length > 0) {
            return this.parseTicker (data[0], market);
        }
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        params['symbol'] = this.marketId (symbol);
        const response = await this.publicGetOrderbooks (
            this.extend (request, params)
        );
        const orderbook = this.safeValue (response, 'data', {});
        return this.parseOrderBook (
            orderbook,
            undefined,
            'timestamp',
            'bids',
            'asks',
            'price',
            'size'
        );
    }

    parseTrade (trade, market = undefined) {
        const timestamp = this.parse8601 (this.safeString (trade, 'timestamp'));
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'size');
        let cost = undefined;
        if (price !== undefined) {
            if (amount !== undefined) {
                cost = parseFloat (this.costToPrecision (symbol, price * amount));
            }
        }
        const id = undefined;
        const takerOrMaker = undefined;
        const fee = undefined;
        const orderId = undefined;
        const type = undefined;
        const side = this.safeStringLower (trade, 'side');
        return {
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': id,
            'order': orderId,
            'type': type,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
            'info': trade,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {};
        params['symbol'] = market['id'];
        if (limit !== undefined) {
            params['count'] = limit;
        }
        const response = await this.publicGetTrades (this.extend (request, params));
        const data = this.safeValue (response, 'data', {});
        const trades = this.safeValue (data, 'list', []);
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetAccountAssets (params);
        const result = { 'info': response };
        const assets = this.safeValue (response, 'data', {});
        for (let i = 0; i < assets.length; i++) {
            const balance = assets[i];
            const currencyId = this.safeString (balance, 'symbol');
            const code = this.safeCurrencyCode (currencyId);
            const account = {
                'free': this.safeFloat (balance, 'available'),
                'total': this.safeFloat (balance, 'amount'),
            };
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    parseOrderStatus (status) {
        const statuses = {
            'ORDERED': 'open',
            'ORDERED MODIFYING': 'open',
            'EXECUTED': 'closed',
            'CANCELLING': 'canceled',
            'CANCECANCELEDLED_PARTIALLY_FILLED': 'canceled',
            'EXPIRED': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        const id = this.safeString (order, 'orderId');
        const marketId = this.safeString (order, 'symbol');
        let symbol = undefined;
        if (marketId && !market && (marketId in this.marketsById)) {
            market = this.marketsById[marketId];
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const timestamp = this.safeTimestamp (order, 'timestamp');
        const price = this.safeFloat (order, 'price');
        const amount = this.safeFloat (order, 'size');
        const filled = this.safeFloat (order, 'executedSize');
        const remaining = undefined;
        const average = undefined;
        const cost = undefined;
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const type = this.safeStringLower (order, 'executionType');
        const side = this.safeStringLower (order, 'side');
        return {
            'id': id,
            'clientOrderId': undefined,
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': type,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'cost': cost,
            'average': average,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'trades': undefined,
            'fee': undefined,
            'info': order,
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (price === undefined) {
            throw new InvalidOrder (this.id + ' createOrder requires a price argument for both market and limit orders');
        }
        const request = {
            'symbol': market['id'],
            'side': side,
            'executionType': type,
            'price': this.priceToPrecision (symbol, price),
            'size': this.amountToPrecision (symbol, amount),
        };
        const response = await this.privatePostOrder (this.extend (request, params));
        const data = this.safeInteger (response, 'data');
        return this.parseOrder (data, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'orderId': id,
        };
        const response = await this.privatePostCancelorder (this.extend (request, params));
        const data = this.safeValue (response, 'data');
        return data;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'orderId': id,
        };
        const response = await this.privatePostOrders (this.extend (request, params));
        const data = this.safeValue (response, 'data');
        return this.parseOrder (data, market);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['count'] = limit;
        }
        const response = await this.privatePostActiveorders (this.extend (request, params));
        const data = this.safeValue (response, 'data', {});
        const orders = this.safeValue (data, 'list', []);
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request = {};
        if (market !== undefined) {
            request['symbol'] = market['id'];
        }
        if (limit !== undefined) {
            request['count'] = limit;
        }
        const response = await this.privatePostLatestexecutions (this.extend (request, params));
        const data = this.safeValue (response, 'data', {});
        const trades = this.safeValue (data, 'list', []);
        return this.parseTrades (trades, market, since, limit);
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const query = this.omit (params, this.extractParams (path));
        let url = this.urls['api'][api] + '/';
        url += this.version + '/' + this.implodeParams (path, params);
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ().toString ();
            body = this.json (query);
            let auth = nonce;
            auth += '/' + this.version + '/' + path + body;
            headers = {
                'Content-Type': 'application/json',
                'ACCESS-KEY': this.apiKey,
                'ACCESS-TIMESTAMP': this.nonce (),
                'ACCESS-SIGN': this.hmac (this.encode (auth), this.encode (this.secret)),
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const response = await this.fetch2 (
            path,
            api,
            method,
            params,
            headers,
            body
        );
        const success = this.safeInteger (response, 'status');
        const data = this.safeValue (response, 'data');
        if (success !== 0 || !data) {
            const errorClasses = this.exceptions;
            const code = this.safeString (data, 'code');
            const message = this.safeString (this.errorMessages, code, 'Error');
            const ErrorClass = this.safeValue (errorClasses, code);
            if (ErrorClass !== undefined) {
                throw new ErrorClass (message);
            } else {
                throw new ExchangeError (this.id + ' ' + this.json (response));
            }
        }
        return response;
    }
};
