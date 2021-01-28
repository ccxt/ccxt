'use strict';

// ----------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { InvalidOrder, ExchangeError, BadRequest, BadSymbol } = require ('./base/errors');
const { SIGNIFICANT_DIGITS } = require ('./base/functions/number');

// ----------------------------------------------------------------------------

module.exports = class tprexchange extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'tprexchange',
            'name': 'TPR Exchange',
            // 'countries': [ 'US' ],
            // 'rateLimit': 500,
            'version': 'v1',
            'certified': false,
            'has': {
                'loadMarkets': false,
                'cancelAllOrders': false,
                'cancelOrder': true,
                'cancelOrders': false,
                'CORS': false,
                'createDepositAddress': false,
                'createLimitOrder': false,
                'createMarketOrder': false,
                'createOrder': true,
                'deposit': false,
                'editOrder': 'emulated',
                'fetchBalance': false,
                'fetchBidsAsks': false,
                'fetchClosedOrders': false,
                'fetchCurrencies': false,
                'fetchDepositAddress': false,
                'fetchDeposits': false,
                'fetchFundingFees': false,
                'fetchL2OrderBook': false,
                'fetchLedger': false,
                'fetchMarkets': true,
                'fetchMyTrades': false,
                'fetchOHLCV': 'emulated',
                'fetchOpenOrders': false,
                'fetchOrder': true,
                'fetchOrderBook': false,
                'fetchOrderBooks': false,
                'fetchOrders': true,
                'fetchOrderTrades': false,
                'fetchStatus': 'emulated',
                'fetchTicker': false,
                'fetchTickers': false,
                'fetchTime': false,
                'fetchTrades': false,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTradingLimits': false,
                'fetchTransactions': false,
                'fetchWithdrawals': false,
                'privateAPI': true,
                'publicAPI': false,
                'signIn': true,
                'withdraw': false,
            },
            'timeframes': {
                '1m': '1',
                '5m': '5',
                '15m': '15',
                '1h': '60',
                '4h': '240',
                '1d': '1440',
                '1w': '10080',
            },
            'urls': {
                'logo': '',
                'api': '{hostname}',
                'www': '',
                'doc': '',
                'fees': '',
                'referral': '',
            },
            'api': {
                'private': {
                    'get': [
                    ],
                    'post': [
                        'uc/api-login',
                        'exchange/order/add',
                        'exchange/detail/detail/{id}',
                        'exchange/order/history',
                        'exchange/order/cancel/{id}',
                    ],
                    'delete': [
                    ],
                },
                'feed': {
                    'get': [
                    ],
                },
            },
            'fees': {
                'trading': {
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
                'uid': false,
            },
            'precisionMode': SIGNIFICANT_DIGITS,
            'options': {
                'createMarketBuyOrderRequiresPrice': false,
            },
            'exceptions': {
                'exact': {
                    'Invalid cost': InvalidOrder, // {"message":"Invalid cost","_links":{"self":{"href":"/orders","templated":false}}}
                    'Invalid order ID': InvalidOrder, // {"message":"Invalid order ID","_links":{"self":{"href":"/orders/4a151805-d594-4a96-9d64-e3984f2441f7","templated":false}}}
                    'Invalid market !': BadSymbol, // {"message":"Invalid market !","_links":{"self":{"href":"/markets/300/order-book","templated":false}}}
                },
                'broad': {
                    'Failed to convert argument': BadRequest,
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        return [
            {
                'id': 'TPR',
                'symbol': 'TPR/USD',
                'base': 'TPR',
                'quote': 'USD',
                'baseId': 'TPR',
                'quoteId': 'USD',
                'type': 'spot',
                'active': true,
                'precision': {
                    'amount': undefined,
                    'price': undefined,
                },
                'limits': {
                    'amount': { 'min': undefined, 'max': undefined },
                    'price': { 'min': undefined, 'max': undefined },
                    'cost': { 'min': undefined, 'max': undefined },
                },
                'taker': '0.005',
                'maker': '0.0025',
                'info': 'TPR Market',
            },
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = 1000, params = {}) {
        return [];
    }

    async sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        // Check existance of authentication token
        // Just use empy one in case of an application is not signed in yet
        let authToken = '';
        if ('token' in this.options) {
            authToken = this.options['token'];
        }
        // Get URL
        let url = this.implodeParams (this.urls['api'], { 'hostname': this.hostname }) + '/' + path;
        // Calculate body and content type depending on method type: GET or POST
        const keys = Object.keys (params);
        const keysLength = keys.length;
        // In case of body is still not assigned just make it empty string
        if (body === undefined) {
            body = '';
        }
        // Prepare line for hashing
        // This hash sum is checked on backend side to verify API user
        // POST params should not be added as body
        const query = method + ' /' + path + ' ' + this.urlencode (params) + ' ' + authToken + '\n' + body;
        const signed = this.hmac (this.encode (query), this.encode (this.secret));
        let contentType = undefined;
        if (method === 'POST') {
            contentType = 'application/x-www-form-urlencoded';
            if (keysLength > 0) {
                body = this.urlencode (params);
            }
        } else {
            if (keysLength > 0) {
                url += '?' + this.urlencode (params);
            }
        }
        headers = {
            'x-auth-sign': signed,
            'x-auth-token': authToken,
        };
        if (authToken !== '') {
            headers['access-auth-token'] = authToken;
        }
        if (contentType !== undefined) {
            headers['Content-Type'] = contentType;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async signIn (params = {}) {
        params = {
            'key': this.key,
            'token': this.token,
        };
        const response = await this.privatePostUcApiLogin (params);
        const authToken = this.safeString (response, 'message');
        this.options['token'] = authToken;
        return authToken;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        const request = {
            'id': id,
        };
        const response = await this.privateGetUcOrdersId (this.extend (request, params));
        return this.parseOrder (response);
    }

    async parseOrder (order, market = undefined) {
        //
        //      {
        //          "data": "ORDER ID"
        //      }
        //
        const id = this.safeString (order, 'data');
        const result = {
            'info': order,
            'id': id,
            'clientOrderId': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'lastTradeTimestamp': undefined,
            'symbol': undefined,
            'type': undefined,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': undefined,
            'price': undefined,
            'stopPrice': undefined,
            'cost': undefined,
            'average': undefined,
            'amount': undefined,
            'filled': undefined,
            'remaining': undefined,
            'status': undefined,
            'fee': undefined,
            'trades': undefined,
        };
        return result;
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        params['symbol'] = symbol;
        params['price'] = price;
        params['amount'] = amount;
        if (side === 'buy') {
            params['direction'] = 'BUY';
        } else {
            params['direction'] = 'SELL';
        }
        if (type === 'market') {
            params['type'] = 'MARKET_PRICE';
        } else {
            params['type'] = 'LIMIT_PRICE';
        }
        params['useDiscount'] = '0';
        const response = await this.privatePostExchangeOrderAdd (params);
        return this.parseOrder (response);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        const request = {
            'id': id,
        };
        return await this.privateDeleteOrdersId (this.extend (request, params));
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // fallback to default error handler
        }
        if (httpCode === 200) {
            return;
        }
        // {
        //     "message": "Error text in case when HTTP code is not 200",
        //     ...
        // }
        const message = this.safeString (response, 'message');
        if (message !== undefined) {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
    }
};
