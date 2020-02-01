'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { DECIMAL_PLACES, PAD_WITH_ZERO, ROUND } = require ('./base/functions/number');
const { AuthenticationError, DDoSProtection, ExchangeError, ExchangeNotAvailable, InsufficientFunds, InvalidOrder, OrderNotFound, PermissionDenied } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class phemex extends Exchange {
    convertTimeNs (ns) {
        return Math.floor (ns * Math.pow (10, -6));
    }

    convertENumber (eNum, scale, precision, roundType) {
        return this.decimalToPrecision (eNum * Math.pow (10, -scale), roundType, precision, DECIMAL_PLACES, PAD_WITH_ZERO);
    }

    convertEv (ev, scale, precision) {
        return this.convertENumber (ev, scale, precision, ROUND);
    }

    convertEr (er, scale, precision) {
        return this.convertENumber (er, scale, precision, ROUND);
    }

    convertEp (ep, scale, precision) {
        if (ep === undefined) {
            return undefined;
        }
        return this.convertENumber (ep, scale, precision, ROUND);
    }

    convertToEp (price) {
        return price * Math.pow (10, 4);
    }

    calcAverageEp (filledEv, valueScale, priceScale, filled, contractSide) {
        if (filled === 0) {
            return undefined;
        }
        if (filledEv === 0) {
            return undefined;
        }
        const priceFactor = Math.pow (10, priceScale);
        const valueFactor = Math.pow (10, valueScale);
        return Math.pow (filledEv / (valueFactor * filled), contractSide) * priceFactor;
    }

    calcCostEv (filled, averageEp, priceEp, priceScale, valueScale, contractSide) {
        if (filled === 0) {
            return 0;
        }
        let ep = undefined;
        if (averageEp !== undefined) {
            ep = averageEp;
        } else if (priceEp !== undefined) {
            ep = priceEp;
        }
        if (ep === undefined) {
            return undefined;
        }
        const priceFactor = Math.pow (10, priceScale);
        const valueFactor = Math.pow (10, valueScale);
        return filled * Math.pow (ep / priceFactor, contractSide) * valueFactor;
    }

    parseResponse (response) {
        return this.safeValue (response, 'data', null);
    }

    parseMdResponse (response) {
        return this.safeValue (response, 'result', null);
    }

    parseMarket (product, precisions) {
        const id = this.safeString (product, 'symbol');
        const quoteCurrency = this.safeString (product, 'quoteCurrency');
        const settlementCurrency = this.safeString (product, 'settlementCurrency');
        const underlyingSymbol = this.safeString (product, 'underlyingSymbol');
        const baseId = underlyingSymbol.split ('.')[1];
        const quoteId = quoteCurrency;
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        return {
            'id': id,
            'symbol': base + '/' + quote,
            'base': base,
            'quote': quote,
            'baseId': baseId,
            'quoteId': quoteId,
            'contractSide': (quoteCurrency === settlementCurrency) ? 1 : -1,
            'type': 'future',
            'spot': false,
            'future': true,
            'active': true,
            'priceScale': this.safeInteger (product, 'priceScale', 1),
            'ratioScale': this.safeInteger (product, 'ratioScale', 1),
            'valueScale': this.safeInteger (product, 'valueScale', 1),
            'precision': this.safeValue (precisions, id),
            'limits': {
                'amount': {
                    'min': 1,
                    'max': product['maxOrderQty'],
                },
                'price': {
                    'min': undefined,
                    'max': product['maxPriceEp'],
                },
                'cost': {
                    'min': undefined,
                    'max': undefined,
                },
            },
            'info': product,
        };
    }

    parseBidAsk (bidask, priceKey = 0, amountKey = 1, priceScale = 4, pricePrecision = 1) {
        const priceEp = bidask[priceKey];
        const price = parseFloat (this.convertEp (priceEp, priceScale, pricePrecision));
        const amount = parseFloat (bidask[amountKey]);
        return [price, amount];
    }

    parseBidsAsks (bidasks, priceKey = 0, amountKey = 1, priceScale = 4, pricePrecision = 1) {
        const result = [];
        for (let i = 0; i < bidasks.length; i++) {
            const bidask = this.parseBidAsk (bidasks[i], priceKey, amountKey, priceScale, pricePrecision);
            result.push (bidask);
        }
        return result;
    }

    parseOrderBook (orderbook, timestamp = undefined, bidsKey = 'bids', asksKey = 'asks', priceKey = 0, amountKey = 1, market = undefined) {
        // market data
        const precisions = this.safeValue (market, 'precision');
        const priceScale = this.safeInteger (market, 'priceScale');
        const pricePrecision = this.safeInteger (precisions, 'price');
        const rawBids = this.safeValue (orderbook, bidsKey);
        const rawAsks = this.safeValue (orderbook, asksKey);
        return {
            'bids': this.sortBy (this.parseBidsAsks (rawBids, priceKey, amountKey, priceScale, pricePrecision), 0, true),
            'asks': this.sortBy (this.parseBidsAsks (rawAsks, priceKey, amountKey, priceScale, pricePrecision), 0),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'nonce': undefined,
        };
    }

    parseOrderStatus (status) {
        const statuses = {
            'Untriggered': 'open',
            'Deactivated': 'closed',
            'Triggered': 'open',
            'Rejected': 'rejected',
            'New': 'open',
            'PartiallyFilled': 'open',
            'Filled': 'closed',
            'Canceled': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        const marketID = market['id'];
        // market data
        const contractSide = this.safeInteger (market, marketID, 1);
        const precisions = this.safeValue (market, 'precision');
        const priceScale = this.safeInteger (market, 'priceScale');
        const pricePrecision = this.safeInteger (precisions, 'price');
        const valueScale = this.safeInteger (market, 'valueScale');
        const valuePrecision = this.safeInteger (precisions, 'value');
        // order data
        const id = this.safeString (order, 'orderID');
        const type = this.safeStringLower (order, 'ordType');
        const side = this.safeStringLower (order, 'side');
        const ordStatus = this.safeString (order, 'ordStatus');
        const actionTimeNs = this.safeInteger (order, 'actionTimeNs', 0);
        const transactTimeNs = this.safeInteger (order, 'transactTimeNs', 0);
        const priceEp = this.safeInteger (order, 'priceEp', 0);
        const amount = this.safeInteger (order, 'orderQty', 0);
        const filled = this.safeInteger (order, 'cumQty', 0);
        const filledEv = this.safeInteger (order, 'cumValueEv', 0);
        // derived data
        const timestamp = this.convertTimeNs (actionTimeNs);
        let remaining = 0;
        if (amount !== 0) {
            if (filled !== 0) {
                remaining = Math.max (amount - filled, 0);
            }
        }
        const averageEp = this.calcAverageEp (filledEv, valueScale, priceScale, filled, contractSide);
        const average = this.convertEp (averageEp, priceScale, pricePrecision);
        const costEv = this.calcCostEv (filled, averageEp, priceEp, priceScale, valueScale, contractSide);
        return {
            'info': order,
            'id': id,
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': this.convertTimeNs (transactTimeNs),
            'symbol': market['symbol'],
            'type': type,
            'side': side,
            'price': this.convertEp (priceEp, priceScale, pricePrecision),
            'amount': amount,
            'cost': this.convertEv (costEv, valueScale, valuePrecision),
            'average': average,
            'filled': filled,
            'remaining': remaining,
            'status': this.parseOrderStatus (ordStatus),
            'fee': undefined,
        };
    }

    parseOrders (orders, market = undefined, since = undefined, limit = undefined, params = {}) {
        const result = [];
        const ordersCount = orders.length;
        for (let i = 0; i < ordersCount; i++) {
            result.push (this.parseOrder (orders[i], market));
        }
        return result;
    }

    parseMyTrade (trade, market = undefined) {
        const marketID = market['id'];
        // market data
        const contractSide = this.safeInteger (market, marketID, 1);
        const precisions = this.safeValue (market, 'precision');
        const priceScale = this.safeInteger (market, 'priceScale');
        const pricePrecision = this.safeInteger (precisions, 'price');
        const valueScale = this.safeInteger (market, 'valueScale');
        const valuePrecision = this.safeInteger (precisions, 'value');
        // trade data
        const transactTimeNs = this.safeInteger (trade, 'transactTimeNs', 0);
        const timestamp = this.convertTimeNs (transactTimeNs);
        const type = this.safeStringLower (trade, 'ordType');
        const side = this.safeStringLower (trade, 'side');
        const execStatus = this.safeString (trade, 'execStatus');
        const execPriceEp = this.safeInteger (trade, 'execPriceEp', 0);
        const priceEp = this.safeInteger (trade, 'priceEp', 0);
        const amount = this.safeInteger (trade, 'execQty', 0);
        const costEv = this.calcCostEv (amount, execPriceEp, priceEp, priceScale, valueScale, contractSide);
        const execFeeEv = this.safeInteger (trade, 'execFeeEv', 0);
        const feeRateEr = this.safeInteger (trade, 'feeRateEr', 0);
        let takerOrMaker = undefined;
        if (execStatus === 'TakerFill') {
            takerOrMaker = 'taker';
        } else if (execStatus === 'MakerFill') {
            takerOrMaker = 'maker';
        }
        return {
            'info': trade,
            'id': this.safeString (trade, 'execID'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'order': this.safeString (trade, 'orderID'),
            'type': type,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': this.convertEp (execPriceEp, priceScale, pricePrecision),
            'amount': amount,
            'cost': this.convertEv (costEv + execFeeEv, valueScale, valuePrecision),
            'fee': {
                'cost': this.convertEv (execFeeEv, valueScale, valuePrecision),
                'currency': this.safeString (trade, 'currency'),
                'rate': this.convertEr (feeRateEr, 8, 8),
            },
        };
    }

    parseMyTrades (trades, market = undefined) {
        const result = [];
        const tradesCount = trades.length;
        for (let i = 0; i < tradesCount; i++) {
            result.push (this.parseMyTrade (trades[i], market));
        }
        return result;
    }

    parseMdTrade (trade, market = undefined) {
        // market data
        const precisions = this.safeValue (market, 'precision');
        const priceScale = this.safeInteger (market, 'priceScale');
        const pricePrecision = this.safeInteger (precisions, 'price');
        const timestampNs = trade[0];
        const timestamp = this.convertTimeNs (timestampNs);
        const side = trade[1].toLowerCase ();
        const priceEp = trade[2];
        const amount = trade[3];
        return {
            'info': trade,
            'id': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'order': undefined,
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': parseFloat (this.convertEp (priceEp, priceScale, pricePrecision)),
            'amount': amount,
            'cost': undefined,
            'fee': {
                'cost': undefined,
                'currency': undefined,
                'rate': undefined,
            },
        };
    }

    parseMdTrades (trades, market = undefined) {
        const result = [];
        const tradesCount = trades.length;
        for (let i = 0; i < tradesCount; i++) {
            result.push (this.parseMdTrade (trades[i], market));
        }
        return result;
    }

    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'phemex',
            'name': 'Phemex',
            'countries': ['SC'],
            'version': 'v1',
            'userAgent': undefined,
            'rateLimit': 2000,
            'has': {
                'cancelAllOrders': false,
                'cancelOrder': true,
                'cancelOrders': false,
                'CORS': false,
                'createDepositAddress': false,
                'createLimitBuyOrder': true,
                'createLimitSellOrder': true,
                'createMarketBuyOrder': true,
                'createMarketSellOrder': true,
                'createOrder': true,
                'deposit': false,
                'editOrder': false,
                'fetchBalance': true,
                'fetchBidsAsks': false,
                'fetchClosedOrders': true,
                'fetchCurrencies': false,
                'fetchDepositAddress': false,
                'fetchDeposits': false,
                'fetchFundingFees': false,
                'fetchL2OrderBook': false,
                'fetchLedger': false,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrderBooks': false,
                'fetchOrders': true,
                'fetchStatus': false,
                'fetchTicker': false,
                'fetchTickers': false,
                'fetchTime': false,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTradingLimits': false,
                'fetchTransactions': false,
                'fetchWithdrawals': false,
                'privateAPI': false,
                'publicAPI': false,
                'withdraw': false,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '1h': '1h',
                '1d': '1d',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/7397642/72579020-cd03e300-3912-11ea-9371-04cbd58c31f8.png',
                'www': 'https://phemex.com',
                'test': {
                    'public': 'https://testnet.phemex.com/api',
                    'public2': 'https://testnet-api.phemex.com',
                    'private': 'https://testnet-api.phemex.com',
                },
                'api': {
                    'public': 'https://phemex.com/api',
                    'public2': 'https://api.phemex.com',
                    'private': 'https://api.phemex.com',
                },
                'doc': [
                    'https://github.com/phemex/phemex-api-docs',
                ],
                'api_management': 'https://phemex.com/web/account/api/list',
                'referral': 'https://phemex.com/?referralCode=D6XAJ',
                'fees': 'https://phemex.com/fees-conditions',
            },
            'api': {
                'public': {
                    'get': [
                        'exchange/public/products',
                    ],
                },
                'public2': {
                    'get': [
                        'md/orderbook',
                        'md/trade',
                    ],
                },
                'private': {
                    'get': [
                        'accounts/accountPositions',
                        'phemex-user/order',
                        'phemex-user/order/list',
                        'phemex-user/order/orderList',
                        'phemex-user/order/trade',
                        'orders/activeList',
                    ],
                    'post': [
                        'orders',
                    ],
                    'put': [],
                    'delete': [
                        'orders/cancel',
                    ],
                },
            },
            'exceptions': {
                'exact': {
                    'Invalid API Key.': AuthenticationError,
                    'This key is disabled.': PermissionDenied,
                    'Access Denied': PermissionDenied,
                    'Duplicate clOrdID': InvalidOrder,
                    'orderQty is invalid': InvalidOrder,
                    'Invalid price': InvalidOrder,
                    'Invalid stopPx for ordType': InvalidOrder,
                },
                'broad': {
                    'Signature not valid': AuthenticationError,
                    'overloaded': ExchangeNotAvailable,
                    'Account has insufficient Available Balance': InsufficientFunds,
                    'Service unavailable': ExchangeNotAvailable, // {"error":{"message":"Service unavailable","name":"HTTPError"}}
                },
            },
            'precisionMode': DECIMAL_PLACES,
        });
    }

    async fetchMarkets (params = {}) {
        const precisions = {
            'BTCUSD': {
                'amount': 0,
                'price': 1,
                'value': 8,
            },
            'ETHUSD': {
                'amount': 0,
                'price': 2,
                'value': 2,
            },
            'XRPUSD': {
                'amount': 0,
                'price': 4,
                'value': 2,
            },
        };
        const method = 'publicGetExchangePublicProducts';
        const response = await this[method] (params);
        const products = this.safeValue (response, 'data');
        const productsCount = products.length;
        const result = [];
        for (let i = 0; i < productsCount; i++) {
            const market = this.parseMarket (products[i], precisions);
            result.push (market);
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketID = market['id'];
        const method = 'public2GetMdOrderbook';
        const response = await this[method] ({ 'symbol': marketID });
        const data = this.parseMdResponse (response);
        const book = this.safeValue (data, 'book');
        return this.parseOrderBook (book, undefined, 'bids', 'asks', 0, 1, market);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketID = market['id'];
        const method = 'public2GetMdTrade';
        const response = await this[method] ({ 'symbol': marketID });
        const data = this.parseMdResponse (response);
        const trades = this.safeValue (data, 'trades');
        return this.parseMdTrades (this.sortBy (trades, 0), market);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const method = 'privateGetAccountsAccountPositions';
        const btcResponse = await this[method] ({ 'currency': 'BTC' });
        const usdResponse = await this[method] ({ 'currency': 'USD' });
        const btcAccount = this.safeValue (this.parseResponse (btcResponse), 'account');
        const btcBalanceEv = this.safeValue (btcAccount, 'accountBalanceEv');
        const btcTotalUsedBalanceEv = this.safeValue (btcAccount, 'totalUsedBalanceEv');
        const usdAccount = this.safeValue (this.parseResponse (usdResponse), 'account');
        const usdBalanceEv = this.safeValue (usdAccount, 'accountBalanceEv');
        const usdTotalUsedBalanceEv = this.safeValue (usdAccount, 'totalUsedBalanceEv');
        const BTC = {
            'free': this.convertEv (btcBalanceEv - btcTotalUsedBalanceEv, 8, 8),
            'used': this.convertEv (btcTotalUsedBalanceEv, 8, 8),
            'total': this.convertEv (btcBalanceEv, 8, 8),
        };
        const USD = {
            'free': this.convertEv (usdBalanceEv - usdTotalUsedBalanceEv, 4, 2),
            'used': this.convertEv (usdTotalUsedBalanceEv, 4, 2),
            'total': this.convertEv (usdBalanceEv, 4, 2),
        };
        return {
            'free': {
                'BTC': this.safeString (BTC, 'free'),
                'USD': this.safeString (USD, 'free'),
            },
            'used': {
                'BTC': this.safeString (BTC, 'used'),
                'USD': this.safeString (USD, 'used'),
            },
            'total': {
                'BTC': this.safeString (BTC, 'total'),
                'USD': this.safeString (USD, 'total'),
            },
            'BTC': BTC,
            'USD': USD,
            'info': {},
        };
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketID = market['id'];
        const method = 'privateGetPhemexUserOrder';
        const response = await this[method] ({ 'orderID': id, 'symbol': marketID });
        const orders = this.parseResponse (response);
        const orderCount = orders.length;
        if (orderCount > 0) {
            return this.parseOrder (orders[0], market);
        }
        throw new OrderNotFound (this.id + ': The order ' + id + ' not found.');
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketID = market['id'];
        const method = 'privateGetPhemexUserOrderList';
        const response = await this[method] ({ 'symbol': marketID, 'start': since, 'limit': limit });
        const data = this.parseResponse (response);
        const orders = this.safeValue (data, 'rows', []);
        return this.parseOrders (orders, market);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketID = market['id'];
        const method = 'privateGetOrdersActiveList';
        try {
            const response = await this[method] ({ 'symbol': marketID });
            const data = this.parseResponse (response);
            const orders = this.safeValue (data, 'rows');
            return this.parseOrders (orders, market);
        } catch (e) {
            return [];
        }
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketID = market['id'];
        const method = 'privateGetPhemexUserOrderList';
        const response = await this[method] ({ 'symbol': marketID, 'start': since, 'limit': limit });
        const data = this.parseResponse (response);
        const rawOrders = this.safeValue (data, 'rows');
        const orders = this.parseOrders (rawOrders, market);
        const orderCount = orders.length;
        const result = [];
        for (let i = 0; i < orderCount; i++) {
            const order = orders[i];
            const status = this.safeString (order, 'status');
            if (status === 'closed') {
                result.push (order);
            }
        }
        return result;
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketID = market['id'];
        const request = {
            'clOrdID': this.uuid (),
            'symbol': marketID,
            'side': this.capitalize (side),
            'orderQty': amount,
            'ordType': this.capitalize (type),
            'postOnly': false,
            'reduceOnly': false,
            'timeInForce': this.safeString (params, 'timeInForce', 'GoodTillCancel'),
        };
        if (price !== undefined) {
            request['priceEp'] = this.convertToEp (price);
        }
        const method = 'privatePostOrders';
        const response = await this[method] (this.extend (request, params));
        const order = this.parseOrder (response, market);
        const id = this.safeString (order, 'id');
        this.orders[id] = order;
        return this.extend ({ 'info': response }, order);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketID = market['id'];
        const method = 'privateDeleteOrdersCancel';
        try {
            const response = await this[method] ({ 'orderID': id, 'symbol': marketID });
            const order = this.parseResponse (response);
            return this.parseOrder (order, market);
        } catch (e) {
            throw new OrderNotFound (this.id + ': The order ' + id + ' not found.');
        }
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketID = market['id'];
        const method = 'privateGetPhemexUserOrderTrade';
        const response = await this[method] ({ 'symbol': marketID, 'start': since, 'limit': limit });
        const data = this.parseResponse (response);
        const trades = this.safeValue (data, 'rows', []);
        return this.parseMyTrades (trades, market);
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (httpCode === 429) {
            throw new DDoSProtection (this.id + ' ' + httpCode.toString () + ' ' + reason + ' ' + body);
        }
        const code = this.safeValue (response, 'code', 0);
        if (code !== 0) {
            const message = this.safeString (response, 'msg');
            throw new ExchangeError (this.id + ' ' + message);
        }
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const urlPath = '/' + path;
        let querystring = '';
        if (method === 'GET' || method === 'DELETE') {
            const keys = Object.keys (params);
            const keysCount = keys.length;
            if (keysCount > 0) {
                const cleanParams = {};
                for (let i = 0; i < keysCount; i++) {
                    const key = keys[i];
                    if (params[key] !== undefined) {
                        cleanParams[key] = params[key];
                    }
                }
                const cleanKeys = Object.keys (cleanParams);
                const cleanKeysCount = cleanKeys.length;
                if (cleanKeysCount > 0) {
                    querystring = this.urlencodeWithArrayRepeat (cleanParams);
                }
            }
        } else {
            body = this.json (params);
        }
        let url = this.urls['api'][api] + urlPath + '';
        if (querystring !== '') {
            url += '?' + querystring;
        }
        if (this.apiKey && this.secret) {
            const expiry = this.numberToString (this.seconds () + 2 * 60);
            let content = urlPath + querystring + expiry;
            if (body) {
                content += body;
            }
            const signature = this.hmac (content, this.secret);
            headers = {
                'Content-Type': 'application/json',
                'x-phemex-access-token': this.apiKey,
                'x-phemex-request-expiry': expiry,
                'x-phemex-request-signature': signature,
            };
        }
        return { 'url': url, 'method': method, 'headers': headers, 'body': body };
    }
};
