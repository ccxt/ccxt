'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { OrderNotFound, BadRequest, ArgumentsRequired, AuthenticationError, InvalidOrder, DDoSProtection, ExchangeNotAvailable } = require ('./base/errors');
//  ---------------------------------------------------------------------------

module.exports = class multi extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'multi',
            'name': 'multi',
            'countries': [ 'SG' ],
            'version': 'v1',
            'rateLimit': 1000,
            'has': {
                'fetchMarkets': true,
                'fetchCurrencies': true,
                'fetchTradingLimits': false,
                'fetchTradingFees': true,
                'fetchFundingLimits': false,
                'fetchTicker': true,
                'fetchOrderBook': true,
                'fetchTrades': true,
                'fetchOHLCV': true,
                'fetchBalance': true,
                'fetchAccounts': false,
                'createOrder': true,
                'cancelOrder': true,
                'editOrder': false,
                'fetchOrder': true,
                'fetchOpenOrders': true,
                'fetchOrders': true,
                'fetchMyTrades': true,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchWithdrawals': true,
                'fetchTransactions': true,
                'fetchLedger': true,
                'withdraw': true,
                'transfer': false,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '10m': '10m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '2h': '2h',
                '4h': '4h',
                '6h': '6h',
                '8h': '8h',
                '12h': '12h',
                '1d': '1d',
                '1w': '1w',
                '1M': '1M',
            },
            'urls': {
                'logo': 'https://multi.io/en/static/img/icons/logo_white.svg',
                'api': 'https://api.multi.io/api',
                'www': 'https://multi.io/',
                'doc': 'https://docs.multi.io/',
            },
            'api': {
                'public': {
                    'get': [
                        'market/list',
                        'asset/list',
                        'order/depth',
                        'market/kline',
                        'fee_schedules',
                        'market/trade',
                        'market/status/all',
                    ],
                },
                'private': {
                    'get': [
                        'asset/balance',
                        'order/pending/detail',
                        'order/completed/detail',
                        'order/pending',
                        'order/pending/stoplimit',
                        'order/completed',
                        'order/completed/detail',
                        'market/user/trade',
                        'asset/transactions/withdraw',
                        'asset/transactions/deposit',
                        'asset/transactions/all',
                    ],
                    'post': [
                        'asset/deposit',
                        'order',
                        'order/cancel',
                        'asset/withdraw',
                    ],
                },
            },
            'exceptions': {
                'exact': {
                    '1': BadRequest,
                    '701': ArgumentsRequired,
                    '603': AuthenticationError,
                    '10': InvalidOrder,
                    '600': ArgumentsRequired,
                },
            },
            'whitelistErrorsAPIs': [ 'order/pending/detail', 'order/completed/detail' ],
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetMarketList (params);
        return this.parseMarkets (response);
    }

    parseMarkets (markets) {
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const base = this.safeCurrencyCode (market['base']);
            const quote = this.safeCurrencyCode (market['quote']);
            const symbol = base + '/' + quote;
            const precision = {
                'amount': this.safeInteger (market, 'basePrec'),
                'price': this.safeInteger (market, 'quotePrec'),
            };
            result.push ({
                'id': market['name'],
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': base.toLowerCase (),
                'quoteId': quote.toLowerCase (),
                'active': true,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        const response = await this.publicGetAssetList (params);
        return this.parseCurrencies (response);
    }

    parseCurrencies (currencies) {
        const result = {};
        for (let i = 0; i < currencies.length; i++) {
            const currency = currencies[i];
            const currencyCode = this.safeString (currency, 'name');
            const id = currencyCode.toLowerCase ();
            const numericId = this.safeInteger (currency, 'id');
            const code = this.safeCurrencyCode (currencyCode);
            const name = this.safeString (currency, 'displayName');
            const active = this.safeValue (currency, 'status');
            const fee = this.safeFloat (currency, 'withdrawFee');
            const precision = this.safeFloat (currency, 'precWithdraw');
            result[code] = {
                'id': id,
                'numericId': numericId,
                'code': code,
                'info': currency,
                'name': name,
                'active': active,
                'fee': fee,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': this.safeFloat (currency, 'minWithdrawAmount'),
                        'max': undefined,
                    },
                },
            };
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default = 20
        }
        const response = await this.publicGetOrderDepth (this.extend (request, params));
        const timestamp = this.safeInteger (response, 'timestamp');
        return this.parseOrderBook (response, timestamp * 1000);
    }

    async fetchOHLCV (symbol, timeframe = '1h', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        const period = this.safeString (this.timeframes, timeframe);
        const intervalInSeconds = this.parseTimeframe (period);
        request['interval'] = intervalInSeconds;
        const now = this.seconds ();
        if (since === undefined) {
            if (limit !== undefined) {
                const start = now - limit * intervalInSeconds;
                request['start'] = parseInt (start);
            }
        } else {
            const start = parseInt (since / 1000);
            request['start'] = start;
            if (limit !== undefined) {
                request['end'] = parseInt (this.sum (start, limit * intervalInSeconds));
            }
        }
        const response = await this.publicGetMarketKline (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined) {
        const timestamp = this.safeInteger (ohlcv, 0) * 1000;
        return [
            timestamp,
            this.safeFloat (ohlcv, 1),
            this.safeFloat (ohlcv, 3),
            this.safeFloat (ohlcv, 4),
            this.safeFloat (ohlcv, 2),
            this.safeFloat (ohlcv, 5),
        ];
    }

    async fetchTradingFees (params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetFeeSchedules (params);
        const fees = [];
        for (let i = 0; i < response.length; i++) {
            const fee = response[i];
            fees.push ({
                'minVolume': fee['minVolume'],
                'maker': fee['makerFee'],
                'taker': fee['takerFee'],
            });
        }
        return {
            'info': response,
            'fees': fees,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetMarketTrade (this.extend (request, params));
        return this.parseTrades (response['result'], market, since, limit);
    }

    parseTrade (trade, market) {
        const symbol = market['symbol'];
        const timestamp = this.safeTimestamp (trade, 'time');
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'amount');
        const role = this.safeString (trade, 'role');
        const takerOrMaker = (role === '1') ? 'maker' : 'taker';
        let side = this.safeString (trade, 'side');
        const type = this.safeValue (trade, 'type');
        const fee = {};
        fee['cost'] = this.safeFloat (trade, 'fee');
        if (side === '1' || type === 'sell') { // sell
            fee['currency'] = market['quote'];
            side = 'sell';
        }
        if (side === '2' || type === 'buy') { // buy
            fee['currency'] = market['quote'];
            side = 'buy';
        }
        return {
            'info': trade,
            'id': this.safeString (trade, 'id'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': parseFloat (price * amount),
            'order': this.safeString (trade, 'id'),
            'takerOrMaker': takerOrMaker,
            'type': undefined,
            'fee': fee,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketId = market['id'];
        const response = await this.publicGetMarketStatusAll (params);
        const marketTicket = this.getMarketTicket (response, marketId);
        return this.parseTicker (marketTicket['result'], symbol);
    }

    getMarketTicket (response, marketId) {
        const marketTicker = {};
        for (let i = 0; i < response.length; i++) {
            if (response[i]['market'] === marketId) {
                marketTicker['result'] = response[i];
                break;
            }
        }
        return marketTicker;
    }

    parseTicker (ticker, symbol) {
        return {
            'symbol': symbol,
            'info': ticker,
            'high': ticker['high'],
            'low': ticker['low'],
            'bid': ticker['bid'],
            'bidVolume': undefined,
            'ask': ticker['ask'],
            'open': ticker['open'],
            'close': ticker['close'],
            'last': ticker['close'],
            'baseVolume': ticker['baseVolume'],
            'quoteVolume': ticker['quoteVolume'],
            'askVolume': undefined,
            'average': undefined,
            'change': undefined,
            'datetime': undefined,
            'percentage': undefined,
            'previousClose': undefined,
            'timestamp': undefined,
            'vwap': undefined,
        };
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetAssetBalance (params);
        const exchange = response['exchange'];
        const keys = Object.keys (exchange);
        const result = { 'info': exchange };
        for (let i = 0; i < keys.length; i++) {
            const code = keys[i];
            result[code] = {
                'free': parseFloat (exchange[code]['available']),
                'used': parseFloat (exchange[code]['freeze']),
            };
        }
        return this.parseBalance (result);
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'symbol': currency['code'],
        };
        const response = await this.privatePostAssetDeposit (this.extend (request, params));
        const currencyObject = this.safeValue (response, code);
        return {
            'currency': code,
            'address': currencyObject['address'],
            'tag': this.safeValue (currencyObject, 'memo'),
            'info': currencyObject,
        };
    }

    parseOrder (order, market) {
        const timestamp = this.safeTimestamp (order, 'cTime');
        const orderType = this.safeString (order, 'type');
        const orderSide = this.safeString (order, 'side');
        const type = (orderType === '1') ? 'limit' : 'market';
        const side = (orderSide === '1') ? 'sell' : 'buy';
        const amount = this.safeFloat (order, 'amount');
        const filled = amount - this.safeFloat (order, 'left', 0);
        const fee = {};
        if (side === 'buy') {
            fee['cost'] = this.safeValue (order, 'takerFee');
        } else {
            fee['cost'] = this.safeValue (order, 'makerFee');
        }
        fee['currency'] = market['quote'];
        return {
            'id': this.safeString (order, 'id'),
            'clientOrderId': undefined,
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': undefined,
            'status': undefined,
            'symbol': market['symbol'],
            'type': type,
            'side': side,
            'price': this.safeFloat (order, 'price'),
            'average': undefined,
            'amount': amount,
            'filled': filled,
            'remaining': this.safeFloat (order, 'left'),
            'cost': parseFloat (filled * this.safeFloat (order, 'price')),
            'trades': undefined,
            'fee': fee,
            'info': order,
        };
    }

    async fetchOpenOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'orderId': id,
            'type': 'limit',
        };
        const fetchLimitOrderResponse = await this.privateGetOrderPendingDetail (this.extend (request, params));
        if (fetchLimitOrderResponse) {
            return this.parseOrder (fetchLimitOrderResponse, market);
        }
        request['type'] = 'stoplimit';
        const fetchStopLimitOrderResponse = await this.privateGetOrderPendingDetail (this.extend (request, params));
        if (fetchStopLimitOrderResponse) {
            return this.parseOrder (fetchStopLimitOrderResponse, market);
        }
        return null;
    }

    async fetchCompleteOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'orderId': id,
        };
        const response = await this.privateGetOrderCompletedDetail (this.extend (request, params));
        return this.parseOrder (response, market);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        const openOrder = await this.fetchOpenOrder (id, symbol, params);
        if (openOrder) {
            return openOrder;
        }
        const completeOrder = await this.fetchCompleteOrder (id, symbol);
        if (completeOrder) {
            return completeOrder;
        }
        throw new OrderNotFound (this.id + ' order ' + id + ' not found');
    }

    async fetchLimitPendingOrders (marketId, limit = undefined, params = {}) {
        const request = {
            'market': marketId,
            'limit': limit,
        };
        const response = await this.privateGetOrderPending (this.extend (request, params));
        return this.safeValue (response, 'records');
    }

    async fetchStopLimitPendingOrders (marketId, limit = undefined, params = {}) {
        const request = {
            'market': marketId,
            'limit': limit,
        };
        const response = await this.privateGetOrderPendingStoplimit (this.extend (request, params));
        return this.safeValue (response, 'records');
    }

    async fetchCompleteOrders (marketId, limit = undefined, params = {}) {
        const request = {
            'market': marketId,
            'limit': limit,
        };
        const response = await this.privateGetOrderCompleted (this.extend (request, params));
        return this.safeValue (response, 'records');
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketId = market['id'];
        const pendingLimitOrdersPromise = this.fetchLimitPendingOrders (marketId, limit, params);
        const pendingStopLimitOrdersPromise = this.fetchStopLimitPendingOrders (marketId, limit, params);
        const limitOrders = await pendingLimitOrdersPromise;
        const stopLimitOrders = await pendingStopLimitOrdersPromise;
        return this.parseOrders (limitOrders.concat (stopLimitOrders), market, since, limit, params);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketId = market['id'];
        const pendingLimitOrdersPromise = this.fetchLimitPendingOrders (marketId, limit, params);
        const pendingStopLimitOrdersPromise = this.fetchStopLimitPendingOrders (marketId, limit, params);
        const completeOrdersPromise = this.fetchCompleteOrders (marketId, limit, params);
        const limitOrders = await pendingLimitOrdersPromise;
        const stopLimitOrders = await pendingStopLimitOrdersPromise;
        const completeOrders = await completeOrdersPromise;
        const allOrders = limitOrders.concat (stopLimitOrders, completeOrders);
        return this.parseOrders (allOrders, market, since, limit, params);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        if (since) {
            request['since'] = parseInt (since / 1000);
        }
        if (limit) {
            request['limit'] = limit;
        }
        const response = await this.privateGetMarketUserTrade (this.extend (request, params));
        return this.parseTrades (response['records'], market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'side': (side === 'sell') ? 1 : 2,
            'amount': amount,
            'price': price,
            'type': type,
        };
        if (this.safeValue (params, 'type') === 'stopLimit') {
            request['type'] = 'stoplimit';
            request['stop'] = this.safeValue (params, 'stopPrice');
            request['gtlt'] = this.safeValue (params, 'gtlt', 1);
            params = this.omit (params, [ 'type', 'stopPrice', 'gtlt' ]);
        }
        const response = await this.privatePostOrder (this.extend (request, params));
        return this.parseOrder (response, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'orderId': id,
            'type': 'limit', // TODO support cancelling stop limit order
        };
        const response = await this.privatePostOrderCancel (this.extend (request, params));
        return { 'success': true, 'info': response };
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'symbol': currency['code'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetAssetTransactionsWithdraw (this.extend (request, params));
        return this.parseTransactions (response['result'], currency, since, limit, params);
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'symbol': currency['code'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetAssetTransactionsDeposit (this.extend (request, params));
        return this.parseTransactions (response['result'], currency, since, limit, params);
    }

    async fetchTransactions (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'symbol': currency['code'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetAssetTransactionsAll (this.extend (request, params));
        return this.parseTransactions (response['result'], currency, since, limit, params);
    }

    parseTransaction (transaction, currency) {
        let addressFrom = undefined;
        let addressTo = undefined;
        let tagFrom = undefined;
        let tagTo = undefined;
        const address = this.safeValue (transaction, 'address');
        const tag = this.safeValue (transaction, 'memo');
        const type = this.safeValue (transaction, 'type');
        if (type === 'WITHDRAW') {
            addressTo = address;
            tagTo = tag;
        }
        if (type === 'DEPOSIT') {
            addressFrom = address;
            tagFrom = tag;
        }
        return {
            'info': transaction,
            'id': this.safeValue (transaction, 'id'),
            'txid': this.safeValue (transaction, 'txhash'),
            'timestamp': this.safeTimestamp (transaction, 'nonce'),
            'datetime': this.safeValue (transaction, 'createdAt'),
            'addressFrom': addressFrom,
            'address': address,
            'addressTo': addressTo,
            'tagFrom': tagFrom,
            'tag': tag,
            'tagTo': tagTo,
            'type': type.toLowerCase (),
            'amount': this.safeFloat (transaction, 'amount'),
            'currency': this.safeValue (transaction, 'symbol'),
            'status': this.safeValue (transaction, 'status'),
            'fee': undefined,
        };
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'amount': amount,
            'symbol': currency['code'],
            'address': address,
        };
        if (tag !== undefined) {
            request['memo'] = tag;
        }
        const response = await this.privatePostAssetWithdraw (this.extend (request, params));
        return {
            'info': this.extend ({ 'status': 'ok' }, response),
        };
    }

    sign (path, api = 'public', method = 'GET', params = undefined, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.version + '/' + path;
        const query = this.omit (params, this.extractParams (path));
        if (method === 'GET') {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const timestamp = Math.floor (this.milliseconds () / 1000);
            let payloadToSign = {};
            if (method === 'GET' && params) {
                payloadToSign = {};
            }
            if (method === 'POST') {
                body = this.json (query);
                payloadToSign = query;
            }
            const message = this._makeQueryString (this.extend ({}, payloadToSign, { timestamp, method, path })).substr (1);
            const signature = this.hmac (this.encode (message), this.encode (this.secret), 'sha256', 'hex');
            headers = {
                'Content-Type': 'application/json',
                'X-MULTI-API-KEY': this.apiKey,
                'X-MULTI-API-SIGNATURE': signature,
                'X-MULTI-API-TIMESTAMP': timestamp,
                'X-MULTI-API-SIGNED-PATH': path,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    _makeQueryString (q) {
        const arr = [];
        if (q) {
            const sortedParams = this.keysort (q);
            const keys = Object.keys (sortedParams);
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                arr.push (this.encodeURIComponent (key) + '=' + this.encodeURIComponent (q[key]));
            }
            return '?' + arr.join ('&');
        } else {
            return '';
        }
    }

    checkIfWhitelistedPath (url) {
        let whitelistedUrl = false;
        for (let i = 0; i < this.whitelistErrorsAPIs.length; i++) {
            const path = this.whitelistErrorsAPIs[i];
            if (url.indexOf (path) !== -1) {
                whitelistedUrl = true;
                break;
            }
        }
        return whitelistedUrl;
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        const status = this.safeString (response, 'status');
        if (code >= 200 && code < 300) {
            return;
        }
        if (this.checkIfWhitelistedPath (url)) {
            return; // default to defaultErrorHandler
        }
        if (code === 429) {
            throw new DDoSProtection (this.id + ' ' + body);
        }
        if (status === 'error') {
            const errors = this.safeValue (response, 'errors');
            const errorCode = this.safeString (errors[0], 'code');
            const message = this.safeString (errors[0], 'message');
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, message);
        }
    }

    defaultErrorHandler (code, reason, url, method, headers, body, response) {
        if ((code >= 200) && (code <= 299)) {
            return;
        }
        let details = body;
        const codeAsString = code.toString ();
        let ErrorClass = undefined;
        if (this.checkIfWhitelistedPath (url)) {
            return;
        }
        if (this.httpExceptions.indexOf (codeAsString) !== -1) {
            ErrorClass = this.httpExceptions[codeAsString];
        }
        if (ErrorClass === ExchangeNotAvailable) {
            details += ' (possible reasons: ' + [
                'invalid API keys',
                'bad or old nonce',
                'exchange is down or offline',
                'on maintenance',
                'DDoS protection',
                'rate-limiting',
            ].join (', ') + ')';
        }
        if (ErrorClass !== undefined) {
            throw new ErrorClass ([ this.id, method, url, code, reason, details ].join (' '));
        }
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const response = await this.fetch2 (path, api, method, params, headers, body);
        return this.safeValue (response, 'data');
    }
};
