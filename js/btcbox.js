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
            'countries': 'JP',
            'rateLimit': 1000,
            'version': 'v1',
            'has': {
                'CORS': false,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOpenOrders': true,
                'fetchTickers': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/31275803-4df755a8-aaa1-11e7-9abb-11ec2fad9f2d.jpg',
                'api': 'https://www.btcbox.co.jp/api',
                'www': 'https://www.btcbox.co.jp/',
                'doc': 'https://www.btcbox.co.jp/help/asm',
            },
            'api': {
                'public': {
                    'get': [
                        'depth',
                        'orders',
                        'ticker',
                        'allticker',
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
                'BTC/JPY': { 'id': 'BTC/JPY', 'symbol': 'BTC/JPY', 'base': 'BTC', 'quote': 'JPY' },
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
        let balances = await this.privatePostBalance ();
        let result = { 'info': balances };
        let currencies = Object.keys (this.currencies);
        for (let i = 0; i < currencies.length; i++) {
            let currency = currencies[i];
            let lowercase = currency.toLowerCase ();
            if (lowercase === 'dash')
                lowercase = 'drk';
            let account = this.account ();
            let free = lowercase + '_balance';
            let used = lowercase + '_lock';
            if (free in balances)
                account['free'] = parseFloat (balances[free]);
            if (used in balances)
                account['used'] = parseFloat (balances[used]);
            account['total'] = this.sum (account['free'], account['used']);
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {};
        let numSymbols = this.symbols.length;
        if (numSymbols > 1)
            request['coin'] = market['id'];
        let orderbook = await this.publicGetDepth (this.extend (request, params));
        return this.parseOrderBook (orderbook);
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = this.milliseconds ();
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        let last = this.safeFloat (ticker, 'last');
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

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let tickers = await this.publicGetAllticker (params);
        let ids = Object.keys (tickers);
        let result = {};
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let market = this.markets_by_id[id];
            let symbol = market['symbol'];
            let ticker = tickers[id];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {};
        let numSymbols = this.symbols.length;
        if (numSymbols > 1)
            request['coin'] = market['id'];
        let ticker = await this.publicGetTicker (this.extend (request, params));
        return this.parseTicker (ticker, market);
    }

    parseTrade (trade, market) {
        let timestamp = parseInt (trade['date']) * 1000; // GMT time
        return {
            'info': trade,
            'id': trade['tid'],
            'order': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': trade['type'],
            'price': trade['price'],
            'amount': trade['amount'],
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {};
        let numSymbols = this.symbols.length;
        if (numSymbols > 1)
            request['coin'] = market['id'];
        let response = await this.publicGetOrders (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'amount': amount,
            'price': price,
            'type': side,
        };
        let numSymbols = this.symbols.length;
        if (numSymbols > 1)
            request['coin'] = market['id'];
        let response = await this.privatePostTradeAdd (this.extend (request, params));
        return {
            'info': response,
            'id': response['id'],
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        return await this.privatePostTradeCancel (this.extend ({
            'id': id,
        }, params));
    }

    parseOrder (order) {
        // {"id":11,"datetime":"2014-10-21 10:47:20","type":"sell","price":42000,"amount_original":1.2,"amount_outstanding":1.2,"status":"closed","trades":[]}
        const id = this.safeString (order, 'id');
        const timestamp = this.parse8601 (order['datetime'] + '+09:00'); // Tokyo time
        const amount = this.safeFloat (order, 'amount_original');
        const remaining = this.safeFloat (order, 'amount_outstanding');
        let filled = undefined;
        if (typeof amount !== 'undefined')
            if (typeof remaining !== 'undefined')
                filled = amount - remaining;
        const price = this.safeFloat (order, 'price');
        let cost = undefined;
        if (typeof price !== 'undefined')
            if (typeof filled !== 'undefined')
                cost = filled * price;
        // status is set by fetchOrder method only
        const statuses = {
            // TODO: complete list
            'part': 'open', // partially or not at all executed
            'all': 'closed', // fully executed
            'cancelled': 'canceled',
            'closed': 'closed', // never encountered, seems to be bug in the doc
        };
        let status = undefined;
        if (order['status'] in statuses)
            status = statuses[order['status']];
        // fetchOrders do not return status, use heuristic
        if (typeof status === 'undefined')
            if (typeof remaining !== 'undefined' && remaining === 0)
                status = 'closed';
        let trades = undefined; // todo: this.parseTrades (order['trades']);
        return {
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'amount': amount,
            'remaining': remaining,
            'filled': filled,
            'side': order['type'],
            'type': undefined,
            'status': status,
            'symbol': 'BTC/JPY',
            'price': price,
            'cost': cost,
            'trades': trades,
            'fee': undefined,
            'info': order,
        };
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostTradeView (this.extend ({
            'id': id,
        }, params));
        return this.parseOrder (response);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostTradeList (this.extend ({
            'type': 'all', // 'open' or 'all'
        }, params));
        // status (open/closed/canceled) is undefined
        return this.parseOrders (response);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostTradeList (this.extend ({
            'type': 'open', // 'open' or 'all'
        }, params));
        const orders = this.parseOrders (response);
        // btcbox does not return status, but we know it's 'open' as we queried for open orders
        for (let i = 0; i < orders.length; i++) {
            const order = orders[i];
            order['status'] = 'open';
        }
        return orders;
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.version + '/' + path;
        if (api === 'public') {
            if (Object.keys (params).length)
                url += '?' + this.urlencode (params);
        } else {
            this.checkRequiredCredentials ();
            let nonce = this.nonce ().toString ();
            let query = this.extend ({
                'key': this.apiKey,
                'nonce': nonce,
            }, params);
            let request = this.urlencode (query);
            let secret = this.hash (this.encode (this.secret));
            query['signature'] = this.hmac (this.encode (request), this.encode (secret));
            body = this.urlencode (query);
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body) {
        // typical error response: {"result":false,"code":"401"}
        if (httpCode >= 400)
            return; // resort to defaultErrorHandler
        if (body[0] !== '{')
            return; // not json, resort to defaultErrorHandler
        const response = JSON.parse (body);
        const result = this.safeValue (response, 'result');
        if (typeof result === 'undefined' || result === true)
            return; // either public API (no error codes expected) or success
        const errorCode = this.safeValue (response, 'code');
        const feedback = this.id + ' ' + this.json (response);
        const exceptions = this.exceptions;
        if (errorCode in exceptions)
            throw new exceptions[errorCode] (feedback);
        throw new ExchangeError (feedback); // unknown message
    }
};
