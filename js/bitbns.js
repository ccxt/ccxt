/* eslint-disable no-restricted-syntax */

'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
// const { ExchangeError, ArgumentsRequired, NotSupported, AuthenticationError, InsufficientFunds, OrderNotFound, BadRequest } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class bitbnsexchange extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitbns',
            'name': 'BitBns Exchange',
            'countries': ['IN'],
            'version': '1.0',
            'has': {
                // 'CORS': false,
                'fetchCurrencies': false,
                'fetchTicker': true, // Can be emulated on fetchTickers if necessary
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchTradingFees': false,
                'fetchBalance': false,
                'createOrder': true,
                'cancelOrder': true,
                'fetchOpenOrders': true,
                'fetchMyTrades': false,
                'fetchDepositAddress': false,
                'fetchWithdrawals': false,
                'fetchDeposits': false,
                'fetchClosedOrders': 'emulated',
                'fetchL2OrderBook': false,
                'fetchOHLCV': 'emulated',
                'fetchOrder': true,
                'editOrder': false,
                'fetchTransactions': false,
                'fetchLedger': false,
                'withdraw': false,
                'fetchMarkets': true,
                'fetchOrderBook': true,
            },
            'urls': {
                'logo': 'https://bitbns.com/assets/img/logos/bitbns.svg',
                'api': {
                    'public': 'https://c086dmj6f2.execute-api.ap-south-1.amazonaws.com/dev/',
                    'private': 'https://api.bitbns.com/api/trade/v2',
                    'private1': 'https://api.bitbns.com/api/trade/v1',
                },
                'www': 'https://bitbns.com/',
                'doc': 'https://github.com/bitbns-official/node-bitbns-api',
                'fees': 'https://bitbns.com/fees/',
            },
            'api': {
                // All methods are passed in as query params
                'public': { 'get': [
                    'fetchOrderBook',
                    'fetchMarkets',
                    'fetchTickers',
                    'fetchTrades',
                ] },
                'private': { 'post': [
                    'orders',
                    'cancel',
                ] },
                'private1': { 'post': [
                    'orderStatus',
                    'listOpenOrders',
                ] },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0.0025,
                    'taker': 0.0025,
                },
            },
            'verbose': false,
            'proxy': '',
            'apiKey': '***REMOVED***',
            'secret': '***REMOVED***',
        });
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        // console.log("PAth:", path);
        // console.log ('Params: ', params);
        let url = '';
        if (api === 'private1') {
            // Generate complete url
            url = this.urls['api'][api] + '/' + path + '/' + this.safeString (params, 'symbol');
            // console.log (method, url);
            // console.log ('Signing Privately !!!');
            if (method === 'POST') {
                body = this.json (params);
            }
            // Generate payload
            const timeStamp_nonce = Date.now ().toString ();
            // const timeStamp_nonce = '1571663667098';
            const data = {
                'symbol': '/' + path + '/' + this.safeString (params, 'symbol'),
                'timeStamp_nonce': timeStamp_nonce,
                'body': body,
            };
            // console.log("ccxt data:", data);
            const payload = this.stringToBase64 (JSON.stringify (data));
            // console.log("ccxt payload:", payload);
            // Generate signature from payload
            const signature = this.hmac (payload, this.secret, 'sha512', 'hex');
            // console.log("ccxt sign:", signature);
            // Init headers
            headers = {};
            // Attach headers
            headers['X-BITBNS-APIKEY'] = this.apiKey;
            headers['X-BITBNS-PAYLOAD'] = payload;
            headers['X-BITBNS-SIGNATURE'] = signature;
            headers['Accept'] = 'application/json';
            headers['Accept-Charset'] = 'utf-8';
            headers['content-type'] = 'application/x-www-form-urlencoded';
        } else if (api === 'private') {
            // Generate complete url
            url = this.urls['api'][api] + '/' + this.implodeParams (path, params);
            // console.log (method, url);
            // console.log ('Signing Privately !!!');
            if (method === 'POST') {
                body = this.json (params);
            }
            // Generate payload
            const timeStamp_nonce = Date.now ().toString ();
            // const timeStamp_nonce = '1571663667098';
            const data = {
                'symbol': '/' + path + '/' + this.safeString (params, 'symbol'),
                'timeStamp_nonce': timeStamp_nonce,
                'body': body,
            };
            // console.log("ccxt data:", data);
            const payload = this.stringToBase64 (JSON.stringify (data));
            // console.log("ccxt payload:", payload);
            // Generate signature from payload
            const signature = this.hmac (payload, this.secret, 'sha512', 'hex');
            // console.log("ccxt sign:", signature);
            // Init headers
            headers = {};
            // Attach headers
            headers['X-BITBNS-APIKEY'] = this.apiKey;
            headers['X-BITBNS-PAYLOAD'] = payload;
            headers['X-BITBNS-SIGNATURE'] = signature;
            headers['Accept'] = 'application/json';
            headers['Accept-Charset'] = 'utf-8';
            headers['content-type'] = 'application/x-www-form-urlencoded';
        } else {
            url = this.urls['api'][api] + path;
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
            // console.log (method, url);
        }
        // if (api === 'private')
        // console.log ("ccxt obj:",{ 'url': url, 'method': method, 'body': body, 'headers': headers });
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async fetchMarkets (params = {}) {
        const data = await this.publicGetFetchMarkets ();
        // console.log(data);
        return data;
    }

    async fetchTickers (symbols = undefined, params = {}) {
        const tickers = await this.publicGetFetchTickers ();
        return tickers;
    }

    async fetchTicker (symbol = undefined, params = {}) {
        const tickers = await this.fetchTickers ();
        return this.safeValue (tickers, symbol);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        // const data = bitbns
        await this.loadMarkets ();
        const market = this.market (symbol);
        const excgSymbol = market['id'];
        const request = {
            'symbol': excgSymbol,
            'since': since,
            'limit': limit,
        };
        const trades = await this.publicGetFetchTrades (this.extend (request, params));
        // console.log (trades.length);
        for (let i = 0; i < trades.length; i++) {
            trades[i].symbol = symbol;
            for (const key of Object.keys (trades[i])) {
                if (trades[i][key] === null) {
                    trades[i][key] = undefined;
                }
            }
        }
        return trades;
    }

    async fetchOrderBook (symbol = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const excgSymbol = market['id'];
        const request = {
            'symbol': excgSymbol,
            'limit': limit,
        };
        const ob = await this.publicGetFetchOrderBook (this.extend (request, params));
        return ob;
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const tradingSymbol = market['id'];
        const request = {
            'symbol': tradingSymbol,
            'side': side.toUpperCase (),
            'quantity': amount,
            'rate': price,
        };
        const splitSymbol = symbol.split ('/');
        if (splitSymbol[1] === 'USDT') {
            request['symbol'] = splitSymbol[0] + '_' + splitSymbol[1];
        }
        // console.log (request);
        // return request;
        const resp = await this.privatePostOrders (this.extend (request, params));
        return {
            'info': resp,
            'id': this.safeString (resp, 'id'),
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const tradingSymbol = market['id'];
        const request = {
            'symbol': tradingSymbol,
            'entry_id': id,
        };
        const splitSymbol = symbol.split ('/');
        if (splitSymbol[1] === 'USDT') {
            request['symbol'] = splitSymbol[0] + '_' + splitSymbol[1];
        }
        if (splitSymbol[1] === 'USDT') {
            request['side'] = 'usdtcancelOrder';
        } else {
            request['side'] = 'cancelOrder';
        }
        const resp = await this.privatePostCancel (this.extend (request, params));
        return resp;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const tradingSymbol = market['id'];
        const request = {
            'symbol': tradingSymbol,
            'entry_id': id,
        };
        const resp = await this.private1PostOrderStatus (this.extend (request, params));
        const order = this.safeValue (resp, 'data')[0];
        // console.log(order);
        const orderObj = {
            'id': this.safeString (order, 'entry_id'), // string
            'datetime': this.safeString (order, 'time'), // ISO8601 datetime of 'timestamp' with milliseconds
            'timestamp': (new Date (this.safeString (order, 'time'))).getTime (),
            'lastTradeTimestamp': undefined, // Unix timestamp of the most recent trade on this order
            'symbol': symbol,      // symbol
            'type': 'limit',        // 'market', 'limit'
            'side': undefined,          // 'buy', 'sell'
            'price': this.safeString (order, 'rate'),    // float price in quote currency
            'amount': undefined,           // ordered amount of base currency
            'filled': undefined,           // filled amount of base currency
            'remaining': this.safeString (order, 'btc'), // remaining amount to fill
            'cost': undefined,   // 'filled' * 'price' (filling price used where available)
            'trades': undefined,         // a list of order trades/executions
            'fee': undefined,
            'info': resp,              // the original unparsed order structure as is
        };
        const status = this.safeInteger (order, 'status');
        // console.log(status);
        if (status === 0) {
            orderObj['status'] = 'open';
        } else if (status === -1) {
            orderObj['status'] = 'canceled';
        } else if (status === 2) {
            orderObj['status'] = 'closed';
        }
        return orderObj;
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const tradingSymbol = market['id'];
        const request = {
            'symbol': tradingSymbol,
            'page': 0,
        };
        const resp = await this.private1PostListOpenOrders (this.extend (request, params));
        const orders = this.safeValue (resp, 'data');
        const openOrders = [];
        for (let i = 0; i < orders.length; i += 1) {
            const orderObj = {
                'id': this.safeString (orders[i], 'entry_id'), // string
                'datetime': this.safeString (orders[i], 'time'), // ISO8601 datetime of 'timestamp' with milliseconds
                'timestamp': (new Date (this.safeString (orders[i], 'time'))).getTime (),
                'lastTradeTimestamp': undefined, // Unix timestamp of the most recent trade on this order
                'symbol': symbol,      // symbol
                'type': 'limit',        // 'market', 'limit'
                'side': undefined,          // 'buy', 'sell'
                'price': this.safeString (orders[i], 'rate'),    // float price in quote currency
                'amount': undefined,           // ordered amount of base currency
                'filled': undefined,           // filled amount of base currency
                'remaining': this.safeString (orders[i], 'btc'), // remaining amount to fill
                'cost': undefined,   // 'filled' * 'price' (filling price used where available)
                'trades': undefined,         // a list of order trades/executions
                'fee': undefined,
                'info': resp,              // the original unparsed order structure as is
            };
            const status = this.safeInteger (orders[i], 'status');
            // console.log(status);
            if (status === 0) {
                orderObj['status'] = 'open';
            } else if (status === -1) {
                orderObj['status'] = 'canceled';
            } else if (status === 2) {
                orderObj['status'] = 'closed';
            }
            openOrders.push (orderObj);
        }
        return openOrders;
    }
};
