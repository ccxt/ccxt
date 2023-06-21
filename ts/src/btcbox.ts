
//  ---------------------------------------------------------------------------

import Exchange from './abstract/btcbox.js';
import { ExchangeError, InsufficientFunds, InvalidOrder, AuthenticationError, PermissionDenied, InvalidNonce, OrderNotFound, DDoSProtection } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import { Int, OrderSide, OrderType } from './base/types.js';

//  ---------------------------------------------------------------------------

export default class btcbox extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'btcbox',
            'name': 'BtcBox',
            'countries': [ 'JP' ],
            'rateLimit': 1000,
            'version': 'v1',
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelOrder': true,
                'createOrder': true,
                'createReduceOnlyOrder': false,
                'fetchBalance': true,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchLeverage': false,
                'fetchMarginMode': false,
                'fetchMarkOHLCV': false,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchPosition': false,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': false,
                'fetchTrades': true,
                'fetchTransfer': false,
                'fetchTransfers': false,
                'fetchWithdrawal': false,
                'fetchWithdrawals': false,
                'reduceMargin': false,
                'setLeverage': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'transfer': false,
                'withdraw': false,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/51840849/87327317-98c55400-c53c-11ea-9a11-81f7d951cc74.jpg',
                'api': {
                    'rest': 'https://www.btcbox.co.jp/api',
                },
                'www': 'https://www.btcbox.co.jp/',
                'doc': 'https://blog.btcbox.jp/en/archives/8762',
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
                'BTC/JPY': { 'id': 'btc', 'symbol': 'BTC/JPY', 'base': 'BTC', 'quote': 'JPY', 'baseId': 'btc', 'quoteId': 'jpy', 'taker': this.parseNumber ('0.0005'), 'maker': this.parseNumber ('0.0005'), 'type': 'spot', 'spot': true },
                'ETH/JPY': { 'id': 'eth', 'symbol': 'ETH/JPY', 'base': 'ETH', 'quote': 'JPY', 'baseId': 'eth', 'quoteId': 'jpy', 'taker': this.parseNumber ('0.0010'), 'maker': this.parseNumber ('0.0010'), 'type': 'spot', 'spot': true },
                'LTC/JPY': { 'id': 'ltc', 'symbol': 'LTC/JPY', 'base': 'LTC', 'quote': 'JPY', 'baseId': 'ltc', 'quoteId': 'jpy', 'taker': this.parseNumber ('0.0010'), 'maker': this.parseNumber ('0.0010'), 'type': 'spot', 'spot': true },
                'BCH/JPY': { 'id': 'bch', 'symbol': 'BCH/JPY', 'base': 'BCH', 'quote': 'JPY', 'baseId': 'bch', 'quoteId': 'jpy', 'taker': this.parseNumber ('0.0010'), 'maker': this.parseNumber ('0.0010'), 'type': 'spot', 'spot': true },
            },
            'precisionMode': TICK_SIZE,
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

    parseBalance (response) {
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
                account['free'] = this.safeString (response, free);
                account['used'] = this.safeString (response, used);
                result[code] = account;
            }
        }
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name btcbox#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the btcbox api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        const response = await this.privatePostBalance (params);
        return this.parseBalance (response);
    }

    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name btcbox#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the btcbox api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {};
        const numSymbols = this.symbols.length;
        if (numSymbols > 1) {
            request['coin'] = market['baseId'];
        }
        const response = await this.publicGetDepth (this.extend (request, params));
        return this.parseOrderBook (response, market['symbol']);
    }

    parseTicker (ticker, market = undefined) {
        const timestamp = this.milliseconds ();
        const symbol = this.safeSymbol (undefined, market);
        const last = this.safeString (ticker, 'last');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': this.safeString (ticker, 'buy'),
            'bidVolume': undefined,
            'ask': this.safeString (ticker, 'sell'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'vol'),
            'quoteVolume': this.safeString (ticker, 'volume'),
            'info': ticker,
        }, market);
    }

    async fetchTicker (symbol: string, params = {}) {
        /**
         * @method
         * @name btcbox#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the btcbox api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
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
        //
        // fetchTrades (public)
        //
        //      {
        //          "date":"0",
        //          "price":3,
        //          "amount":0.1,
        //          "tid":"1",
        //          "type":"buy"
        //      }
        //
        const timestamp = this.safeTimestamp (trade, 'date');
        market = this.safeMarket (undefined, market);
        const id = this.safeString (trade, 'tid');
        const priceString = this.safeString (trade, 'price');
        const amountString = this.safeString (trade, 'amount');
        const type = undefined;
        const side = this.safeString (trade, 'type');
        return this.safeTrade ({
            'info': trade,
            'id': id,
            'order': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': type,
            'side': side,
            'takerOrMaker': undefined,
            'price': priceString,
            'amount': amountString,
            'cost': undefined,
            'fee': undefined,
        }, market);
    }

    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name btcbox#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the btcbox api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {};
        const numSymbols = this.symbols.length;
        if (numSymbols > 1) {
            request['coin'] = market['baseId'];
        }
        const response = await this.publicGetOrders (this.extend (request, params));
        //
        //     [
        //          {
        //              "date":"0",
        //              "price":3,
        //              "amount":0.1,
        //              "tid":"1",
        //              "type":"buy"
        //          },
        //     ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name btcbox#createOrder
         * @description create a trade order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} params extra parameters specific to the btcbox api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
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

    async cancelOrder (id: string, symbol: string = undefined, params = {}) {
        /**
         * @method
         * @name btcbox#cancelOrder
         * @description cancels an open order
         * @param {string} id order id
         * @param {string|undefined} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the btcbox api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
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
        //         "trades":[] // no clarification of trade value structure of order endpoint
        //     }
        //
        const id = this.safeString (order, 'id');
        const datetimeString = this.safeString (order, 'datetime');
        let timestamp = undefined;
        if (datetimeString !== undefined) {
            timestamp = this.parse8601 (order['datetime'] + '+09:00'); // Tokyo time
        }
        const amount = this.safeString (order, 'amount_original');
        const remaining = this.safeString (order, 'amount_outstanding');
        const price = this.safeString (order, 'price');
        // status is set by fetchOrder method only
        let status = this.parseOrderStatus (this.safeString (order, 'status'));
        // fetchOrders do not return status, use heuristic
        if (status === undefined) {
            if (Precise.stringEquals (remaining, '0')) {
                status = 'closed';
            }
        }
        const trades = undefined; // todo: this.parseTrades (order['trades']);
        market = this.safeMarket (undefined, market);
        const side = this.safeString (order, 'type');
        return this.safeOrder ({
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'amount': amount,
            'remaining': remaining,
            'filled': undefined,
            'side': side,
            'type': undefined,
            'timeInForce': undefined,
            'postOnly': undefined,
            'status': status,
            'symbol': market['symbol'],
            'price': price,
            'stopPrice': undefined,
            'triggerPrice': undefined,
            'cost': undefined,
            'trades': trades,
            'fee': undefined,
            'info': order,
            'average': undefined,
        }, market);
    }

    async fetchOrder (id: string, symbol: string = undefined, params = {}) {
        /**
         * @method
         * @name btcbox#fetchOrder
         * @description fetches information on an order made by the user
         * @param {string|undefined} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the btcbox api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
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
        //
        //      {
        //          "id":11,
        //          "datetime":"2014-10-21 10:47:20",
        //          "type":"sell",
        //          "price":42000,
        //          "amount_original":1.2,
        //          "amount_outstanding":1.2,
        //          "status":"closed",
        //          "trades":[]
        //      }
        //
        return this.parseOrder (response, market);
    }

    async fetchOrdersByType (type, symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
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
        //
        // [
        //      {
        //          "id":"7",
        //          "datetime":"2014-10-20 13:27:38",
        //          "type":"buy",
        //          "price":42750,
        //          "amount_original":0.235,
        //          "amount_outstanding":0.235
        //      },
        // ]
        //
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

    async fetchOrders (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name btcbox#fetchOrders
         * @description fetches information on multiple orders made by the user
         * @param {string|undefined} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the btcbox api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        return await this.fetchOrdersByType ('all', symbol, since, limit, params);
    }

    async fetchOpenOrders (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name btcbox#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch open orders for
         * @param {int|undefined} limit the maximum number of  open orders structures to retrieve
         * @param {object} params extra parameters specific to the btcbox api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        return await this.fetchOrdersByType ('open', symbol, since, limit, params);
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api']['rest'] + '/' + this.version + '/' + path;
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
            const secret = this.hash (this.encode (this.secret), sha256);
            query['signature'] = this.hmac (this.encode (request), this.encode (secret), sha256);
            body = this.urlencode (query);
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined; // resort to defaultErrorHandler
        }
        // typical error response: {"result":false,"code":"401"}
        if (httpCode >= 400) {
            return undefined; // resort to defaultErrorHandler
        }
        const result = this.safeValue (response, 'result');
        if (result === undefined || result === true) {
            return undefined; // either public API (no error codes expected) or success
        }
        const code = this.safeValue (response, 'code');
        const feedback = this.id + ' ' + body;
        this.throwExactlyMatchedException (this.exceptions, code, feedback);
        throw new ExchangeError (feedback); // unknown message
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined, config = {}) {
        let response = await this.fetch2 (path, api, method, params, headers, body, config);
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
}
