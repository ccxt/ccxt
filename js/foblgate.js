'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, AuthenticationError, BadRequest, PermissionDenied, InvalidOrder } = require ('./base/errors');
const { DECIMAL_PLACES, SIGNIFICANT_DIGITS, TRUNCATE } = require ('./base/functions/number');

//  ---------------------------------------------------------------------------

module.exports = class foblgate extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'foblgate',
            'name': 'FOBLGATE',
            'countries': [ 'KR' ], // South Korea
            'rateLimit': 500,
            'has': {
                'CORS': true,
                'createOrder': true,
                'cancelOrder': true,
                'createMarketOrder': true,
                'fetchTicker': false,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'fetchOrder': true,
                'fetchTrades': true,
                'fetchMyTrades': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/69025125/89286704-a5495200-d68d-11ea-8486-fe3fa693e4a6.jpg',
                'api': {
                    'public': 'https://api2.foblgate.com',
                    'private': 'https://api2.foblgate.com',
                },
                'www': 'https://www.foblgate.com',
                'doc': 'https://api-document.foblgate.com',
                'fees': 'https://www.foblgate.com/fees',
            },
            'api': {
                'public': {
                    'post': [
                        'ccxt/marketList',
                        'ccxt/orderBook',
                        'ccxt/trades',
                    ],
                },
                'private': {
                    'post': [
                        'ccxt/balance',
                        'ccxt/myTrades',
                        'ccxt/createOrder',
                        'ccxt/cancelOrder',
                        'ccxt/orderDetail',
                        'ccxt/openOrders',
                        'ccxt/closedOrders',
                    ],
                },
            },
            'requiredCredentials': {
                'uid': true,
            },
            'precisionMode': SIGNIFICANT_DIGITS,
            'exceptions': {
                'invalid_apikey': AuthenticationError, // {"status":"6004","message":"This API key does not have permission to access the URL"}
                'method_not_allowed_access_ip': PermissionDenied, // {"status":"6007","message":"IP Address is not granted access"}
                'order_bid_limit_price': InvalidOrder, // {"status":"6119","message":"The price is higher than the available price"}
                'order_ask_limit_price': InvalidOrder, // {"status":"6120","message":"The price is lower than the available for sale price"}
                'order_not_enough': InvalidOrder, // {"status":"6106",message":"Check the minimum order request price"}
                'order_limitorder_price_max_error': InvalidOrder, // {"stauts":"6113","message":"The amount exceeds the upper limit"}
                'order_limitorder_price_min_error': InvalidOrder, // {"stauts":"6114","message":"The amount exceeds the lower limit"}
                'not_enough_balance': InvalidOrder, // {"stauts":"5002","message":"There is not enough balance"}
                'check_order_price_tickUnit': InvalidOrder, // {"stauts":"5003","message":"Check order price, tickUnit"}
                '400': BadRequest,
                '401': AuthenticationError,
                '403': AuthenticationError,
                '500': ExchangeError,
            },
        });
    }

    amountToPrecision (symbol, amount) {
        return this.decimalToPrecision (amount, TRUNCATE, this.markets[symbol]['precision']['amount'], DECIMAL_PLACES);
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicPostCcxtMarketList (params);
        const marketList = this.safeValue (response, 'marketList');
        // {
        //     'ETH/BTC': {
        //         limits: { amount: [Object], price: [Object], cost: [Object] },
        //         precision: { amount: 8, price: 8 },
        //         tierBased: false,
        //             percentage: true,
        //             taker: 0.03,
        //             maker: 0.03,
        //             symbol: 'ETH/BTC',
        //             active: true,
        //             baseId: 'ETH',
        //             quoteId: 'BTC',
        //             quote: 'BTC',
        //             id: 'ETH-BTC',
        //             base: 'ETH',
        //             info: { market: 'ETH/BTC', coinName: 'ETH', coinNameKo: '이더리움' }
        //     }
        // }
        return marketList;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'pairName': symbol,
        };
        if (limit !== undefined) {
            request['count'] = limit;
        }
        const response = await this.publicPostCcxtOrderBook (this.extend (request, params));
        // {
        //     bids: [
        //         [ 303100, 11.68805904 ],
        //         [ 303000, 0.61282982 ],
        //         [ 302900, 0.59681086 ]
        //     ],
        //     asks: [
        //         [ 303700, 0.99953148 ],
        //         [ 303800, 0.66825562 ],
        //         [ 303900, 1.47346607 ],
        //     ],
        //     timestamp: undefined,
        //     datetime: undefined,
        //     nonce: undefined
        // }
        return this.parseOrderBook (response, undefined, 'bids', 'asks', 'price', 'amount');
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //     {
        //         "transaction_date":"2020-04-23 22:21:46",
        //         "type":"ask",
        //         "units_traded":"0.0125",
        //         "price":"8667000",
        //         "total":"108337"
        //     }
        //
        // fetchOrder (private)
        //
        //     {
        //         "transaction_date": "1572497603902030",
        //         "price": "8601000",
        //         "units": "0.005",
        //         "fee_currency": "KRW",
        //         "fee": "107.51",
        //         "total": "43005"
        //     }
        //
        // a workaround for their bug in date format, hours are not 0-padded
        let timestamp = undefined;
        const transactionDatetime = this.safeString (trade, 'transaction_date');
        if (transactionDatetime !== undefined) {
            const parts = transactionDatetime.split (' ');
            const numParts = parts.length;
            if (numParts > 1) {
                const transactionDate = parts[0];
                let transactionTime = parts[1];
                if (transactionTime.length < 8) {
                    transactionTime = '0' + transactionTime;
                }
                timestamp = this.parse8601 (transactionDate + ' ' + transactionTime);
            } else {
                timestamp = this.safeIntegerProduct (trade, 'transaction_date', 0.001);
            }
        }
        if (timestamp !== undefined) {
            timestamp -= 9 * 3600000; // they report UTC + 9 hours, server in Korean timezone
        }
        const type = undefined;
        let side = this.safeString (trade, 'type');
        side = (side === 'ask') ? 'sell' : 'buy';
        const id = this.safeString2 (trade, 'id', 'id');
        const order = this.safeString2 (trade, 'order', 'order');
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'units_traded');
        let cost = this.safeFloat (trade, 'total');
        if (cost === undefined) {
            if (amount !== undefined) {
                if (price !== undefined) {
                    cost = price * amount;
                }
            }
        }
        let fee = undefined;
        const feeCost = this.safeFloat (trade, 'fee');
        if (feeCost !== undefined) {
            const feeCurrencyId = this.safeString (trade, 'fee_currency');
            const feeCurrencyCode = this.commonCurrencyCode (feeCurrencyId);
            fee = {
                'cost': feeCost,
                'currency': feeCurrencyCode,
            };
        }
        return {
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': order,
            'type': type,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pairName': symbol,
            'since': since,
            'cnt': limit,
        };
        const response = await this.publicPostCcxtTrades (this.extend (request, params));
        const data = this.safeValue (response, 'data', []);
        return this.parseTrades (data, market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pairName': symbol,
            'cnt': limit,
            'since': since,
        };
        const response = await this.privatePostCcxtMyTrades (this.extend (request, params));
        const data = this.safeValue (response, 'data', []);
        return this.parseTrades (data, market, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostCcxtBalance (params);
        // {
        //     BTC: { total: 0, used: 0, free: 0 },
        //     ETH: { total: 0, used: 0, free: 0 },
        //     info: {}
        // }
        return this.parseBalance (response);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (type === 'market') {
            throw new InvalidOrder (this.id + ' createOrder type = market, currently not supported.');
        }
        let action = undefined;
        if (side === 'buy') {
            action = 'bid';
        } else if (side === 'sell') {
            action = 'ask';
        } else {
            throw new InvalidOrder (this.id + ' createOrder allows buy or sell side only!');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pairName': market['symbol'],
            'type': type,
            'action': action,
            'amount': this.amountToPrecision (symbol, amount),
            'price': price,
        };
        const response = await this.privatePostCcxtCreateOrder (this.extend (request, params));
        // {
        //     info: { data: '2008042' },
        //     id: '2008042',
        //     symbol: 'BTC/KRW',
        //     type: 'limit',
        //     side: 'buy',
        //     amount: 0.1,
        //     price: 9000000
        // }
        return response;
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'ordNo': id,
        };
        const response = await this.privatePostCcxtCancelOrder (this.extend (request, params));
        // { status: '0' }
        return response;
    }

    parseOrder (order, market = undefined) {
        const id = this.safeString (order, 'id');
        const timestamp = this.safeValue (order, 'timestamp');
        const lastTradeTimestamp = this.safeValue (order, 'lastTradeTimestamp');
        const symbol = this.safeString (order, 'symbol');
        const type = this.safeString (order, 'type');
        const side = this.safeString (order, 'side');
        const price = this.safeFloat (order, 'price');
        const amount = this.safeFloat (order, 'amount');
        const cost = this.safeFloat (order, 'cost');
        const average = this.safeFloat (order, 'average');
        const filled = this.safeFloat (order, 'filled');
        const remaining = this.safeFloat (order, 'remaining');
        const status = this.safeString (order, 'status');
        const fee = this.safeValue (order, 'fee');
        let trades = this.safeValue (order, 'trades', []);
        trades = this.parseTrades (trades, market, undefined, undefined, {
            'order': id,
            'type': type,
        });
        return {
            'info': order,
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'average': average,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': fee,
            'trades': trades,
        };
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'ordNo': id,
        };
        const response = await this.privatePostCcxtOrderDetail (this.extend (request, params));
        const order = this.safeValue (response, 'order');
        return this.parseOrder (order);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pairName': market['symbol'],
            'since': since,
            'cnt': limit,
        };
        const response = await this.privatePostCcxtOpenOrders (this.extend (request, params));
        const orderList = this.safeValue (response, 'orderList', []);
        return this.parseOrders (orderList, market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pairName': market['symbol'],
            'since': since,
            'cnt': limit,
        };
        const response = await this.privatePostCcxtClosedOrders (this.extend (request, params));
        const orderList = this.safeValue (response, 'orderList', []);
        return this.parseOrders (orderList, market, since, limit);
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const endpoint = '/' + this.implodeParams (path, params);
        let url = this.urls['api'][api] + endpoint;
        const query = this.omit (params, this.extractParams (path));
        if (method !== 'POST') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            if (api === 'private') {
                this.checkRequiredCredentials ();
                body = this.urlencode (query);
                const nonce = this.nonce ().toString ();
                const auth = this.urlencode (this.extend ({
                    'apiKey': this.apiKey,
                    'mbId': this.uid,
                    'nonce': nonce,
                }, query));
                const signature = this.hmac (this.encode (auth), this.encode (this.secret), 'sha512');
                const signature64 = this.decode (this.stringToBase64 (this.encode (signature)));
                headers = {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Api-Key': this.apiKey,
                    'Api-Uid': this.uid,
                    'Api-Sign': signature64.toString (),
                    'Api-Nonce': nonce,
                };
            } else {
                body = this.urlencode (query);
                headers = {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded',
                };
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // fallback to default error handler
        }
        const code = this.safeValue (response, 'code');
        if (code !== undefined) {
            if (code === '0') {
                return;
            }
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions, code, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
    }
};
