'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, InsufficientFunds, InvalidOrder, AuthenticationError, PermissionDenied, InvalidNonce, OrderNotFound, DDoSProtection } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class btcbox extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'btcbox',
            'name': 'BtcBox',
            'countries': [ 'JP' ],
            'rateLimit': 1000,
            'version': 'v1',
            'has': {
                'CORS': false,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOpenOrders': true,
                'fetchTickers': false,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/31275803-4df755a8-aaa1-11e7-9abb-11ec2fad9f2d.jpg',
                'api': 'https://www.btcbox.co.jp/api',
                'www': 'https://www.btcbox.co.jp/',
                'doc': 'https://www.btcbox.co.jp/help/asm',
                'fees': 'https://support.btcbox.co.jp/hc/en-us/articles/360001235694-Fees-introduction',
            },
            'api': {
                'public': {
                    'get': [
                        'depth',
                        'orders',
                        'ticker',
                    ],
                },
                'private': {
                    'post': [
                        'balance',
                        'trade_add',
                        'trade_cancel',
                        'trade_list',
                        'trade_view',
                        'wallet',
                    ],
                },
            },
            'markets': {
                'BTC/JPY': { 'id': 'btc', 'symbol': 'BTC/JPY', 'base': 'BTC', 'quote': 'JPY', 'baseId': 'btc', 'quoteId': 'jpy', 'taker': 0.05 / 100, 'maker': 0.05 / 100 },
                'ETH/JPY': { 'id': 'eth', 'symbol': 'ETH/JPY', 'base': 'ETH', 'quote': 'JPY', 'baseId': 'eth', 'quoteId': 'jpy', 'taker': 0.10 / 100, 'maker': 0.10 / 100 },
                'LTC/JPY': { 'id': 'ltc', 'symbol': 'LTC/JPY', 'base': 'LTC', 'quote': 'JPY', 'baseId': 'ltc', 'quoteId': 'jpy', 'taker': 0.10 / 100, 'maker': 0.10 / 100 },
                'BCH/JPY': { 'id': 'bch', 'symbol': 'BCH/JPY', 'base': 'BCH', 'quote': 'JPY', 'baseId': 'bch', 'quoteId': 'jpy', 'taker': 0.10 / 100, 'maker': 0.10 / 100 },
            },
            'exceptions': {
                '104': AuthenticationError,
                '105': PermissionDenied,
                '106': InvalidNonce,
                '107': InvalidOrder, // price should be an integer
                '200': InsufficientFunds,
                '201': InvalidOrder, // amount too small
                '202': InvalidOrder, // price should be [0 : 1000000]
                '203': OrderNotFound,
                '401': OrderNotFound, // cancel canceled, closed or non-existent order
                '402': DDoSProtection,
            },
        });
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostBalance (params);
        const result = { 'info': response };
        const codes = Object.keys (this.currencies);
        for (let i = 0; i < codes.length; i++) {
            const code = codes[i];
            const currency = this.currency (code);
            const currencyId = currency['id'];
            const free = currencyId + '_balance';
            if (free in response) {
                const account = this.account ();
                const used = currencyId + '_lock';
                account['free'] = this.safeFloat (response, free);
                account['used'] = this.safeFloat (response, used);
                result[code] = account;
            }
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {};
        const numSymbols = this.symbols.length;
        if (numSymbols > 1) {
            request['coin'] = market['baseId'];
        }
        const response = await this.publicGetDepth (this.extend (request, params));
        return this.parseOrderBook (response);
    }

    parseTicker (ticker, market = undefined) {
        const timestamp = this.milliseconds ();
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
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
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'vol'),
            'quoteVolume': this.safeFloat (ticker, 'volume'),
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {};
        const numSymbols = this.symbols.length;
        if (numSymbols > 1) {
            request['coin'] = market['baseId'];
        }
        const response = await this.publicGetTicker (this.extend (request, params));
        return this.parseTicker (response, market);
    }

    parseTrade (trade, market = undefined) {
        const timestamp = this.safeTimestamp (trade, 'date');
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const id = this.safeString (trade, 'tid');
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'amount');
        let cost = undefined;
        if (amount !== undefined) {
            if (price !== undefined) {
                cost = price * amount;
            }
        }
        const type = undefined;
        const side = this.safeString (trade, 'type');
        return {
            'info': trade,
            'id': id,
            'order': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': type,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {};
        const numSymbols = this.symbols.length;
        if (numSymbols > 1) {
            request['coin'] = market['baseId'];
        }
        const response = await this.publicGetOrders (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'amount': amount,
            'price': price,
            'type': side,
            'coin': market['baseId'],
        };
        const response = await this.privatePostTradeAdd (this.extend (request, params));
        //
        //     {
        //         "result":true,
        //         "id":"11"
        //     }
        //
        return this.parseOrder (response, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        // a special case for btcbox – default symbol is BTC/JPY
        if (symbol === undefined) {
            symbol = 'BTC/JPY';
        }
        const market = this.market (symbol);
        const request = {
            'id': id,
            'coin': market['baseId'],
        };
        const response = await this.privatePostTradeCancel (this.extend (request, params));
        //
        //     {"result":true, "id":"11"}
        //
        return this.parseOrder (response, market);
    }

    parseOrderStatus (status) {
        const statuses = {
            // TODO: complete list
            'part': 'open', // partially or not at all executed
            'all': 'closed', // fully executed
            'cancelled': 'canceled',
            'closed': 'closed', // never encountered, seems to be bug in the doc
            'no': 'closed', // not clarified in the docs...
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        //     {
        //         "id":11,
        //         "datetime":"2014-10-21 10:47:20",
        //         "type":"sell",
        //         "price":42000,
        //         "amount_original":1.2,
        //         "amount_outstanding":1.2,
        //         "status":"closed",
        //         "trades":[]
        //     }
        //
        const id = this.safeString (order, 'id');
        const datetimeString = this.safeString (order, 'datetime');
        let timestamp = undefined;
        if (datetimeString !== undefined) {
            timestamp = this.parse8601 (order['datetime'] + '+09:00'); // Tokyo time
        }
        const amount = this.safeFloat (order, 'amount_original');
        const remaining = this.safeFloat (order, 'amount_outstanding');
        let filled = undefined;
        if (amount !== undefined) {
            if (remaining !== undefined) {
                filled = amount - remaining;
            }
        }
        const price = this.safeFloat (order, 'price');
        let cost = undefined;
        if (price !== undefined) {
            if (filled !== undefined) {
                cost = filled * price;
            }
        }
        // status is set by fetchOrder method only
        let status = this.parseOrderStatus (this.safeString (order, 'status'));
        // fetchOrders do not return status, use heuristic
        if (status === undefined) {
            if (remaining !== undefined && remaining === 0) {
                status = 'closed';
            }
        }
        const trades = undefined; // todo: this.parseTrades (order['trades']);
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const side = this.safeString (order, 'type');
        return {
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'amount': amount,
            'remaining': remaining,
            'filled': filled,
            'side': side,
            'type': undefined,
            'status': status,
            'symbol': symbol,
            'price': price,
            'cost': cost,
            'trades': trades,
            'fee': undefined,
            'info': order,
        };
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        // a special case for btcbox – default symbol is BTC/JPY
        if (symbol === undefined) {
            symbol = 'BTC/JPY';
        }
        const market = this.market (symbol);
        const request = this.extend ({
            'id': id,
            'coin': market['baseId'],
        }, params);
        const response = await this.privatePostTradeView (this.extend (request, params));
        return this.parseOrder (response, market);
    }

    async fetchOrdersByType (type, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        // a special case for btcbox – default symbol is BTC/JPY
        if (symbol === undefined) {
            symbol = 'BTC/JPY';
        }
        const market = this.market (symbol);
        const request = {
            'type': type, // 'open' or 'all'
            'coin': market['baseId'],
        };
        const response = await this.privatePostTradeList (this.extend (request, params));
        const orders = this.parseOrders (response, market, since, limit);
        // status (open/closed/canceled) is undefined
        // btcbox does not return status, but we know it's 'open' as we queried for open orders
        if (type === 'open') {
            for (let i = 0; i < orders.length; i++) {
                orders[i]['status'] = 'open';
            }
        }
        return orders;
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchOrdersByType ('all', symbol, since, limit, params);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchOrdersByType ('open', symbol, since, limit, params);
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.version + '/' + path;
        if (api === 'public') {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        } else {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ().toString ();
            const query = this.extend ({
                'key': this.apiKey,
                'nonce': nonce,
            }, params);
            const request = this.urlencode (query);
            const secret = this.hash (this.encode (this.secret));
            query['signature'] = this.hmac (this.encode (request), this.encode (secret));
            body = this.urlencode (query);
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // resort to defaultErrorHandler
        }
        // typical error response: {"result":false,"code":"401"}
        if (httpCode >= 400) {
            return; // resort to defaultErrorHandler
        }
        const result = this.safeValue (response, 'result');
        if (result === undefined || result === true) {
            return; // either public API (no error codes expected) or success
        }
        const code = this.safeValue (response, 'code');
        const feedback = this.id + ' ' + body;
        this.throwExactlyMatchedException (this.exceptions, code, feedback);
        throw new ExchangeError (feedback); // unknown message
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if (typeof response === 'string') {
            // sometimes the exchange returns whitespace prepended to json
            response = this.strip (response);
            if (!this.isJsonEncodedObject (response)) {
                throw new ExchangeError (this.id + ' ' + response);
            }
            response = JSON.parse (response);
        }
        return response;
    }
};
