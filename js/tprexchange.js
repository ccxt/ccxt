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
                'fetchBalance': true,
                'fetchBidsAsks': false,
                'fetchClosedOrders': false,
                'fetchCurrencies': false,
                'fetchDepositAddress': false,
                'fetchDeposits': false,
                'fetchFundingFees': false,
                'fetchL2OrderBook': false,
                'fetchLedger': false,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': 'emulated',
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': false,
                'fetchOrderBooks': false,
                'fetchOrders': true,
                'fetchOrderTrades': false,
                'fetchStatus': 'emulated',
                'fetchTicker': false,
                'fetchTickers': false,
                'fetchTime': false,
                'fetchTrades': true,
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
                        'uc/balance',
                        'exchange/order/add',
                        'exchange/order/find',
                        'exchange/order/all',
                        'exchange/order/apicancel',
                        'exchange/order/trades',
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
        const loginData = response['data'];
        this.options['token'] = this.safeString (loginData, 'token');
        const memberId = this.safeString (loginData, 'id');
        return memberId;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        const request = {
            'orderId': id,
        };
        const response = await this.privatePostExchangeOrderFind (request);
        return this.parseOrder (response);
    }

    async parseOrder (order, market = undefined) {
        // {
        //   'orderId':'E161183624377614',
        //   'memberId':2,
        //   'type':'LIMIT_PRICE',
        //   'amount':1000.0,
        //   'symbol':'BCH/USDT',
        //   'tradedAmount':1000.0,
        //   'turnover':1080.0,
        //   'coinSymbol':'BCH',
        //   'baseSymbol':'USDT',
        //   'status':'COMPLETED',
        //   'direction':'SELL',
        //   'price':1.0,
        //   'time':1611836243776,
        //   'completedTime':1611836256242,
        // },
        let type = 'market';
        if (order['type'] === 'LIMIT_PRICE') {
            type = 'limit';
        }
        const side = order['direction'].toLowerCase ();
        const remaining = order['amount'] - order['tradedAmount'];
        let status = order['status'];
        if (status === 'COMPLETED') {
            status = 'closed';
        } else if (status === 'TRADING') {
            status = 'open';
        } else {
            status = 'canceled';
        }
        const cost = order['tradedAmount'] * order['price'];
        const result = {
            'info': order,
            'id': order['orderId'],
            'clientOrderId': order['memberId'],
            'timestamp': order['time'],
            'datetime': this.iso8601 (order['time']),
            'lastTradeTimestamp': undefined,
            'symbol': order['symbol'],
            'type': type,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': order['price'],
            'stopPrice': undefined,
            'cost': cost,
            'average': undefined,
            'amount': order['amount'],
            'filled': order['tradedAmount'],
            'remaining': remaining,
            'status': status,
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
        const orderId = this.safeString (response, 'data');
        return await this.fetchOrder (orderId);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        const request = {
            'orderId': id,
        };
        const response = await this.privatePostExchangeOrderApicancel (this.extend (request, params));
        return await this.parseOrder (response['data']);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        // Request structure
        // {
        //   'symbol': Parameter from method arguments
        //   'since': Timestamp of first order in list in Unix epoch format
        //   'limit': Response list size
        //   'memberId': May be set in params. May be not set
        //   'status': one of TRADING COMPLETED CANCELED OVERTIMED. May be set in params
        //   'page': for pagination. In this case limit is size of every page. May be set in params
        // }
        if ('page' in params) {
            params['pageNo'] = this.safeString (params, 'page');
        } else {
            params['pageNo'] = 1;
        }
        const request = {
            'symbol': symbol,
            'since': since,
            'pageSize': limit,
        };
        const fullRequest = this.extend (request, params);
        const response = this.privatePostExchangeOrderAll (fullRequest);
        // {
        //     'content': [
        //         {
        //             'orderId':'E161183624377614',
        //             'memberId':2,
        //             'type':'LIMIT_PRICE',
        //             'amount':1000.0,
        //             'symbol':'BCH/USDT',
        //             'tradedAmount':1000.0,
        //             'turnover':1080.0,
        //             'coinSymbol':'BCH',
        //             'baseSymbol':'USDT',
        //             'status':'COMPLETED',
        //             'direction':'SELL',
        //             'price':1.0,
        //             'time':1611836243776,
        //             'completedTime':1611836256242,
        //         },
        //         ...
        //     ],
        //     'totalElements':41,
        //     'totalPages':3,
        //     'last':False,
        //     'size':20,
        //     'number':1,
        //     'first':False,
        //     'numberOfElements':20,
        //     'sort': [
        //         {
        //             'direction':'DESC',
        //             'property':'time',
        //             'ignoreCase':False,
        //             'nullHandling':'NATIVE',
        //             'ascending':False,
        //             'descending':True,
        //         }
        //     ]
        // }
        return this.parseOrders (response['content']);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        // Request structure
        // {
        //   'symbol': Parameter from method arguments
        //   'since': Timestamp of first order in list in Unix epoch format
        //   'limit': Response list size
        //   'memberId': May be set in params. May be not set
        //   'status': one of TRADING COMPLETED CANCELED OVERTIMED. May be set in params
        //   'page': for pagination. In this case limit is size of every page. May be set in params
        // }
        params['status'] = 'TRADING';
        if ('page' in params) {
            params['pageNo'] = this.safeString (params, 'page');
        } else {
            params['pageNo'] = 1;
        }
        const request = {
            'symbol': symbol,
            'since': since,
            'pageSize': limit,
        };
        const fullRequest = this.extend (request, params);
        const response = this.privatePostExchangeOrderAll (fullRequest);
        // {
        //     'content': [
        //         {
        //             'orderId':'E161183624377614',
        //             'memberId':2,
        //             'type':'LIMIT_PRICE',
        //             'amount':1000.0,
        //             'symbol':'BCH/USDT',
        //             'tradedAmount':1000.0,
        //             'turnover':1080.0,
        //             'coinSymbol':'BCH',
        //             'baseSymbol':'USDT',
        //             'status':'COMPLETED',
        //             'direction':'SELL',
        //             'price':1.0,
        //             'time':1611836243776,
        //             'completedTime':1611836256242,
        //         },
        //         ...
        //     ],
        //     'totalElements':41,
        //     'totalPages':3,
        //     'last':False,
        //     'size':20,
        //     'number':1,
        //     'first':False,
        //     'numberOfElements':20,
        //     'sort': [
        //         {
        //             'direction':'DESC',
        //             'property':'time',
        //             'ignoreCase':False,
        //             'nullHandling':'NATIVE',
        //             'ascending':False,
        //             'descending':True,
        //         }
        //     ]
        // }
        return this.parseOrders (response['content']);
    }

    parseBalance (balance) {
        return {
            'info': balance,
        };
    }

    async fetchBalance (params = {}) {
        const response = await this.privatePostUcBalance (params);
        return this.parseBalance (response);
    }

    parseTrade (trade, market = undefined) {
        const timestamp = 0;
        const fee = {
            'cost': undefined,
            'currency': undefined,
        };
        return {
            'info': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': undefined,
            'id': undefined,
            'order': undefined,
            'type': undefined,
            'side': undefined,
            'takerOrMaker': undefined,
            'price': undefined,
            'amount': undefined,
            'cost': undefined,
            'fee': fee,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        const market = undefined;
        const trades = this.privatePostExchangeOrderTrades (params);
        return this.parseTrades (trades, market, since, limit, params);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const market = undefined;
        const trades = this.privatePostExchangeOrderTrades (params);
        return this.parseTrades (trades, market, since, limit, params);
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // fallback to default error handler
        }
        if (httpCode === 200) {
            if ('code' in response) {
                if (response['code'] === 0) {
                    return;
                }
            } else {
                return;
            }
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
