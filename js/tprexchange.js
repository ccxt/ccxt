'use strict';

// ----------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ArgumentsRequired, InvalidOrder, ExchangeError, BadRequest, BadSymbol } = require ('./base/errors');
const { TRUNCATE, SIGNIFICANT_DIGITS } = require ('./base/functions/number');

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
                'fetchMarkets': false,
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
                'logo': 'https://{hostname}/logo.png',
                'api': 'https://{hostname}',
                'www': 'https://{hostname}',
                'doc': '',
                'fees': '',
                'referral': '',
            },
            'api': {
                'private': {
                    'get': [
                        'detail/detail/{id}',
                        'order/history',
                        'order/add',
                    ],
                    'post': [
                    ],
                    'delete': [
                        'order/cancel/{id}',
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

    async fetchOrder (id, symbol = undefined, params = {}) {
        const request = {
            'id': id,
        };
        const response = await this.privateGetOrdersId (this.extend (request, params));
        //
        //     {
        //         "id": "30a2b5d0-be2e-4d0a-93ed-a7c45fed1792",
        //         "accountId": "30a2b5d0-be2e-4d0a-93ed-a7c45fed1792",
        //         "marketId": 123,
        //         "type": 1,
        //         "side": 1,
        //         "qty": "1.23456",
        //         "cost": "1.23456",
        //         "remainingQty": "1.23456",
        //         "remainingCost": "1.23456",
        //         "limitPrice": "1.23456",
        //         "stopPrice": "1.23456",
        //         "postOnly": false,
        //         "timeInForce": "GTC",
        //         "state": 1,
        //         "closeReason": "FILLED",
        //         "placedAt": 1556355722341,
        //         "closedAt": 1556355722341
        //     }
        //
        if (false) {
            throw new ArgumentsRequired (this.id + ' fetchOHLCV requires a since argument, or a limit argument, or both');
        }
        return this.parseOrder (response);
    }

    parseOrderStatus (status) {
        const statuses = {
            '1': undefined, // pending
            '2': 'open', // open
            '3': 'open', // partially filled
            '4': 'closed', // closed
            'FILLED': 'closed',
            'USER_REQUESTED_CANCEL': 'canceled',
            'ADMINISTRATIVE_CANCEL': 'canceled',
            'NOT_ENOUGH_LIQUIDITY': 'canceled',
            'EXPIRED': 'expired',
            'ONE_CANCELS_OTHER': 'canceled',
        };
        return this.safeString (statuses, status);
    }

    parseOrder (order, market = undefined) {
        //
        // fetchOrder, fetchOpenOrders, fetchClosedOrders
        //
        //     {
        //         "id": "30a2b5d0-be2e-4d0a-93ed-a7c45fed1792",
        //         "accountId": "30a2b5d0-be2e-4d0a-93ed-a7c45fed1792",
        //         "marketId": 123,
        //         "type": 1,
        //         "side": 1,
        //         "qty": "1.23456",
        //         "cost": "1.23456",
        //         "remainingQty": "1.23456",
        //         "remainingCost": "1.23456",
        //         "limitPrice": "1.23456",
        //         "stopPrice": "1.23456",
        //         "postOnly": false,
        //         "timeInForce": "GTC",
        //         "state": 1,
        //         "closeReason": "FILLED",
        //         "placedAt": 1556355722341,
        //         "closedAt": 1556355722341
        //     }
        //
        // createOrder
        //
        //     market buy
        //
        //     {
        //         "id":"ff81127c-8fd5-4846-b683-110639dcd322",
        //         "accountId":"6d445378-d8a3-4932-91cd-545d0a4ad2a2",
        //         "marketId":33,
        //         "type":1,
        //         "side":1,
        //         "cost":"25",
        //         "postOnly":false,
        //         "timeInForce":"GTC",
        //         "state":1,
        //         "placedAt":1589510846735
        //     }
        //
        //     market sell, limit buy, limit sell
        //
        //     {
        //         "id":"042a38b0-e369-4ad2-ae73-a18ff6b1dcf1",
        //         "accountId":"6d445378-d8a3-4932-91cd-545d0a4ad2a2",
        //         "marketId":33,
        //         "type":2,
        //         "side":1,
        //         "qty":"1000",
        //         "limitPrice":"100",
        //         "postOnly":false,
        //         "timeInForce":"GTC",
        //         "state":1,
        //         "placedAt":1589403938682,
        //     }
        //
        const id = this.safeString (order, 'id');
        const timestamp = this.safeInteger (order, 'placedAt');
        const marketId = this.safeInteger (order, 'marketId');
        const symbol = this.safeSymbol (marketId, market);
        let status = this.parseOrderStatus (this.safeString (order, 'state'));
        if (status === 'closed') {
            status = this.parseOrderStatus (this.safeString (order, 'closeReason'));
        }
        const orderSide = this.safeString (order, 'side');
        const side = (orderSide === '1') ? 'buy' : 'sell';
        const orderType = this.safeString (order, 'type');
        let type = undefined;
        if (orderType === '1') {
            type = 'market';
        } else if (orderType === '2') {
            type = 'limit';
        } else if (orderType === '3') {
            type = 'stopmarket';
        } else {
            type = 'stoplimit';
        }
        let price = this.safeFloat (order, 'limitPrice');
        const amount = this.safeFloat (order, 'qty');
        let remaining = this.safeFloat (order, 'remainingQty');
        let filled = undefined;
        const remainingCost = this.safeFloat (order, 'remainingCost');
        if ((remainingCost !== undefined) && (remainingCost === 0.0)) {
            remaining = 0;
        }
        if ((amount !== undefined) && (remaining !== undefined)) {
            filled = Math.max (0, amount - remaining);
        }
        const cost = this.safeFloat (order, 'cost');
        if (type === 'market') {
            if (price === 0.0) {
                if ((cost !== undefined) && (filled !== undefined)) {
                    if ((cost > 0) && (filled > 0)) {
                        price = cost / filled;
                    }
                }
            }
        }
        let average = undefined;
        if (cost !== undefined) {
            if (filled) {
                average = cost / filled;
            }
        }
        const timeInForce = this.safeString (order, 'timeInForce');
        const stopPrice = this.safeFloat (order, 'stopPrice');
        const postOnly = this.safeValue (order, 'postOnly');
        return {
            'info': order,
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': postOnly,
            'side': side,
            'price': price,
            'stopPrice': stopPrice,
            'amount': amount,
            'cost': cost,
            'average': average,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': undefined,
            'trades': undefined,
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const uppercaseType = type.toUpperCase ();
        if (uppercaseType === 'MARKET') {
            type = 1;
        } else if (uppercaseType === 'LIMIT') {
            type = 2;
        } else if (uppercaseType === 'STOPMARKET') {
            type = 3;
        } else if (uppercaseType === 'STOPLIMIT') {
            type = 4;
        }
        const uppercaseSide = side.toUpperCase ();
        side = uppercaseSide === 'BUY' ? 1 : 2;
        const request = {
            'accountId': this.uid,
            'marketId': market['id'],
            'type': type,
            'side': side,
            // 'postOnly': false,
            // 'timeInForce': 'GTC',
        };
        const clientOrderId = this.safeValue2 (params, 'refId', 'clientOrderId');
        let query = params;
        if (clientOrderId !== undefined) {
            request['refId'] = clientOrderId;
            query = this.omit (params, [ 'refId', 'clientOrderId' ]);
        }
        if ((uppercaseType === 'MARKET') && (uppercaseSide === 'BUY')) {
            // for market buy it requires the amount of quote currency to spend
            let cost = this.safeFloat (params, 'cost');
            if (this.options['createMarketBuyOrderRequiresPrice']) {
                if (cost === undefined) {
                    if (price !== undefined) {
                        cost = amount * price;
                    } else {
                        throw new InvalidOrder (this.id + " createOrder() requires the price argument with market buy orders to calculate total order cost (amount to spend), where cost = amount * price. Supply a price argument to createOrder() call if you want the cost to be calculated for you from price and amount, or, alternatively, add .options['createMarketBuyOrderRequiresPrice'] = false to supply the cost in the amount argument (the exchange-specific behaviour)");
                    }
                }
            } else {
                cost = (cost === undefined) ? amount : cost;
            }
            const precision = market['precision']['price'];
            request['cost'] = this.decimalToPrecision (cost, TRUNCATE, precision, this.precisionMode);
        } else {
            request['qty'] = this.amountToPrecision (symbol, amount);
        }
        if (uppercaseType === 'LIMIT') {
            request['limitPrice'] = this.priceToPrecision (symbol, price);
        }
        const response = await this.privatePostOrders (this.extend (request, query));
        //
        // market buy
        //
        //     {
        //         "id":"ff81127c-8fd5-4846-b683-110639dcd322",
        //         "accountId":"6d445378-d8a3-4932-91cd-545d0a4ad2a2",
        //         "marketId":33,
        //         "type":1,
        //         "side":1,
        //         "cost":"25",
        //         "postOnly":false,
        //         "timeInForce":"GTC",
        //         "state":1,
        //         "placedAt":1589510846735
        //     }
        //
        // market sell, limit buy, limit sell
        //
        //     {
        //         "id":"042a38b0-e369-4ad2-ae73-a18ff6b1dcf1",
        //         "accountId":"6d445378-d8a3-4932-91cd-545d0a4ad2a2",
        //         "marketId":33,
        //         "type":2,
        //         "side":1,
        //         "qty":"1000",
        //         "limitPrice":"100",
        //         "postOnly":false,
        //         "timeInForce":"GTC",
        //         "state":1,
        //         "placedAt":1589403938682,
        //     }
        //
        return this.parseOrder (response, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        const request = {
            'id': id,
        };
        return await this.privateDeleteOrdersId (this.extend (request, params));
    }

    sign (path, api = 'public', method = 'GET', params = {}, httpHeaders = undefined, body = undefined) {
        const query = this.omit (params, this.extractParams (path));
        let request = '/';
        if (api === 'public') {
            request += 'api/' + this.version;
        } else if (api === 'private') {
            request += 'api/' + this.version;
        } else if (api === 'markets') {
            request += 'api/' + api;
        }
        request += '/' + this.implodeParams (path, params);
        if (method === 'GET') {
            if (Object.keys (query).length) {
                request += '?' + this.urlencode (query);
            }
        }
        const url = this.urls['api'] + request;
        if (api === 'private') {
            this.checkRequiredCredentials ();
            let payload = '';
            if (method !== 'GET') {
                if (Object.keys (query).length) {
                    body = this.json (query);
                    payload = body;
                }
            }
            // construct signature
            const hasBody = (method === 'POST') || (method === 'PUT') || (method === 'PATCH');
            // const date = 'Mon, 30 Sep 2019 13:57:23 GMT';
            const date = this.rfc2616 (this.milliseconds ());
            let headersCSV = 'date' + ' ' + 'request-line';
            let message = 'date' + ':' + ' ' + date + "\n" + method + ' ' + request + ' HTTP/1.1'; // eslint-disable-line quotes
            let digest = '';
            if (hasBody) {
                digest = 'SHA-256=' + this.hash (payload, 'sha256', 'base64');
                message += "\ndigest" + ':' + ' ' + digest;  // eslint-disable-line quotes
                headersCSV += ' ' + 'digest';
            }
            const signature = this.hmac (this.encode (message), this.encode (this.secret), 'sha256', 'base64');
            const authorizationHeader = 'hmac username="' + this.apiKey + '",algorithm="hmac-sha256",headers="' + headersCSV + '",' + 'signature="' + signature + '"';
            httpHeaders = {
                'Date': date,
                'Authorization': authorizationHeader,
                'Content-Type': 'application/json',
            };
            if (hasBody) {
                httpHeaders['Digest'] = digest;
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': httpHeaders };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // fallback to default error handler
        }
        //
        //     {"message":"Invalid cost","_links":{"self":{"href":"/orders","templated":false}}}
        //
        const message = this.safeString (response, 'message');
        if (message !== undefined) {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
    }
};
