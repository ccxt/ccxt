'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { TICK_SIZE } = require ('./base/functions/number');
const { AuthenticationError, DDoSProtection, ExchangeError, ExchangeNotAvailable, InsufficientFunds, InvalidOrder, OrderNotFound, PermissionDenied } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class phemex extends Exchange {
    convertTimeNs (ns) {
        return ns * (Math.pow (10, -6));
    }

    convertEv (ev, scale) {
        return ev * (Math.pow (10, -scale));
    }

    convertEp (ep) {
        return ep * (Math.pow (10, -4));
    }

    convertToEp (price) {
        return price * (Math.pow (10, 4));
    }

    parseAverage (filledValue, filled, contractSide) {
        if (filled === undefined) {
            return undefined;
        }
        if (filledValue === undefined) {
            return undefined;
        }
        if (contractSide > 0) {
            return filledValue / filled;
        }
        return filled / filledValue;
    }

    parseCost (filled, average, price, contractSide) {
        if (filled === undefined) {
            return undefined;
        }
        if (average !== undefined) {
            if (contractSide > 0) {
                return filled * average;
            }
            return filled / average;
        }
        if (price !== undefined) {
            if (contractSide > 0) {
                return filled * price;
            }
            return filled / price;
        }
        return undefined;
    }

    parseResponse (response) {
        return response.data;
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
        const contractSides = this.safeString (this.options, 'contractSides');
        const contractSide = this.safeInteger (contractSides, marketID, 1);
        const price = this.convertEp (order.priceEp);
        const status = this.parseOrderStatus (this.safeString (order, 'ordStatus'));
        const timestamp = this.parse8601 (this.convertTimeNs (this.safeInteger (order, 'actionTimeNs')));
        const lastTradeTimestamp = this.parse8601 (this.convertTimeNs (this.safeInteger (order, 'transactTimeNs')));
        const priceEp = this.safeInteger (order, 'priceEp');
        const amount = this.safeInteger (order, 'orderQty');
        const filled = this.safeInteger (order, 'cumQty');
        const filledValue = this.convertEv (this.safeInteger (order, 'cumValueEv'), market['valueScale']);
        let remaining = undefined;
        if (amount !== undefined) {
            if (filled !== undefined) {
                remaining = Math.max (amount - filled, 0);
            }
        }
        const average = this.parseAverage (filledValue, filled, contractSide);
        const cost = this.parseCost (filled, average, price, contractSide);
        const id = this.safeString (order, 'orderID');
        const type = this.safeStringLower (order, 'ordType');
        const side = this.safeStringLower (order, 'side');
        return {
            'info': order,
            'id': id,
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': marketID,
            'type': type,
            'side': side,
            'price': this.convertEp (priceEp),
            'amount': amount,
            'cost': cost,
            'average': average,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': undefined,
        };
    }

    parseOrders (orders, market = undefined, since = undefined, limit = undefined, params = {}) {
        const result = [];
        const count = orders.length;
        for (let i = 0; i < count; i++) {
            result.push (this.parseOrder (orders[i], market));
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
                'fetchMyTrades': false,
                'fetchOHLCV': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': false,
                'fetchOrderBooks': false,
                'fetchOrders': true,
                'fetchStatus': false,
                'fetchTicker': false,
                'fetchTickers': false,
                'fetchTime': false,
                'fetchTrades': false,
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
                    'private': 'https://testnet-api.phemex.com',
                },
                'api': {
                    'public': 'https://phemex.com/api',
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
                'private': {
                    'get': [
                        'accounts/accountPositions',
                        'phemex-user/order',
                        'phemex-user/order/list',
                        'phemex-user/order/orderList',
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
            'precisionMode': TICK_SIZE,
            'options': {
                'contractSides': {
                    'BTCUSD': -1,
                    'ETHUSD': 1,
                    'XRPUSD': 1,
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        const method = 'publicGetExchangePublicProducts';
        const response = await this[method] (params);
        const markets = this.safeValue (response, 'data');
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'symbol');
            const baseId = market['underlyingSymbol'].split ('.')[1];
            const quoteId = market['quoteCurrency'];
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const priceScale = this.safeInteger (market, 'priceScale', 1);
            const ratioScale = this.safeInteger (market, 'ratioScale', 1);
            const valueScale = this.safeInteger (market, 'valueScale', 1);
            const entry = {
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'info': market,
                'type': 'future',
                'spot': false,
                'future': true,
                'active': true,
                'priceScale': priceScale,
                'ratioScale': ratioScale,
                'valueScale': valueScale,
                'precision': {
                    'amount': 0,
                    'price': market['quotePrecision'],
                },
                'limits': {
                    'amount': {
                        'min': 1,
                        'max': market['maxOrderQty'],
                    },
                    'price': {
                        'min': undefined,
                        'max': market['maxPriceEp'],
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
            };
            result.push (entry);
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const method = 'privateGetAccountsAccountPositions';
        const btcResponse = await this[method] ({ 'currency': 'BTC' });
        const usdResponse = await this[method] ({ 'currency': 'USD' });
        const btcAccount = this.safeValue (this.parseResponse (btcResponse), 'account');
        const usdAccount = this.safeValue (this.parseResponse (usdResponse), 'account');
        return {
            'BTC': {
                'free': this.convertEv (btcAccount.accountBalanceEv - btcAccount.totalUsedBalanceEv, 8),
                'used': this.convertEv (btcAccount.totalUsedBalanceEv, 8),
                'total': this.convertEv (btcAccount.accountBalanceEv, 8),
            },
            'USD': {
                'free': this.convertEv (usdAccount.accountBalanceEv - usdAccount.totalUsedBalanceEv, 8),
                'used': this.convertEv (usdAccount.totalUsedBalanceEv, 8),
                'total': this.convertEv (usdAccount.accountBalanceEv, 4),
            },
            'info': {},
        };
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        const method = 'privateGetPhemexUserOrder';
        const response = await this[method] ({ 'orderID': id, 'symbol': symbol });
        const orders = this.parseResponse (response);
        if (orders.length > 0) {
            return orders[0];
        }
        throw new OrderNotFound (this.id + ': The order ' + id + ' not found.');
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const method = 'privateGetPhemexUserOrderList';
        const response = await this[method] ({ 'symbol': market['id'], 'start': since, 'limit': limit });
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
            const orders = this.parseResponse (response);
            return this.parseOrders (orders, market);
        } catch (e) {
            return [];
        }
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketID = market['id'];
        const method = 'privateGetPhemexUserOrderOrderList';
        const response = await this[method] ({ 'symbol': marketID, 'limit': limit });
        const closedOrders = this.parseResponse (response);
        return this.parseOrders (closedOrders);
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
            const orders = this.parseResponse (response);
            if (orders.length > 0) {
                return this.parseOrder (orders[0], market);
            }
        } catch (e) {
            throw new OrderNotFound (this.id + ': The order ' + id + ' not found.');
        }
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
            if (Object.keys (params).length) {
                querystring = this.urlencode (params);
            }
        } else {
            body = this.json (params);
        }
        let url = this.urls['api'][api] + urlPath + '';
        if (querystring !== '') {
            url += '?' + querystring;
        }
        if (this.apiKey && this.secret) {
            const expiry = Math.floor (this.now () / 1000) + 2 * 60;
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
