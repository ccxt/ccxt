'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { 
    AuthenticationError, ExchangeError, BadSymbol,
    BadRequest, InvalidOrder, ArgumentsRequired,
    OrderNotFound, InsufficientFunds, DDoSProtection,
    PermissionDenied, NullResponse, NetworkError,
    OrderNotFillable, RateLimitExceeded, OnMaintenance
} = require ('./base/errors');
const { TICK_SIZE } = require ('./base/functions/number');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class bitcointrade extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitcointrade',
            'name': 'Bitcointrade',
            'countries': [ 'BR' ], // Argentina
            'rateLimit': 50,
            'version': 'v3',
            'pro': false,
            // new metainfo interface
            'has': {
                'cancelOrder': true,
                'CORS': undefined,
                'createOrder': true,
                'fetchBalance': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchTicker': true,
                'fetchTrades': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/77060078/146831508-2f258617-c8ad-445e-80fd-9a7f32e26ed8.png',
                'api': {
                    'public': 'https://api.bitcointrade.com.br/v3/public',
                    'private': 'https://api.bitcointrade.com.br/v3',
                },
                'www': 'https://www.bitcointrade.com.br',
                'doc': [
                    'https://apidocs.bitcointrade.com.br',
                ],
                'fees': 'https://www.bitcointrade.com.br/rates',
            },
            'api': {
                'public': {
                    'get': [
                        '{pair}/ticker/', //rates
                        '{pair}/orders/', //orderbook
                        '{pair}/trades/',
                        'currencies/'
                    ],
                },
                'private': {
                    'get': [
                        'market/',
                        'market/summary/',
                        'market/estimated_price/',
                        'market/user_orders/list/',
                        'market/user_orders/{code}/',
                        'wallets/balance/'
                    ],
                    'post': [
                        'market/create_order/',
                    ],
                    'delete': [
                        'market/user_orders/'
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'taker': 0.005,
                    'maker': 0.0025,
                },
            },
            'precisionMode': TICK_SIZE,
            'requiredCredentials': {
                'apiKey': true,
                'secret': false,
            },
            'exceptions': {
                'exact': {
                    '400': InvalidOrder,
                    '401': PermissionDenied,
                    '402': AuthenticationError,
                    '403': PermissionDenied,
                    '404': NullResponse,
                    '405': ExchangeError,
                    '429': DDoSProtection,
                    '500': ExchangeError,
                    '502': NetworkError,
                    '503': OnMaintenance
                },
                'broad': {
                    'You did another transaction with the same amount in an interval lower than 10 (ten) minutes, it is not allowed in order to prevent mistakes. Try again in a few minutes': ExchangeError,
                    'Invalid order quantity': InvalidOrder,
                    'Funds insufficient': InsufficientFunds,
                    'Order already canceled': InvalidOrder,
                    'Order already completely executed': OrderNotFillable,
                    'No orders to cancel': OrderNotFound,
                    'Minimum value not reached': ExchangeError,
                    'Limit exceeded': DDoSProtection,
                    'Too many requests': RateLimitExceeded,
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.privateGetMarketSummary(params);
        //    {
        //        "message": null,
        //        "data": [
        //            {
        //            "unit_price_24h": 54049,
        //            "volume_24h": 0,
        //            "last_transaction_unit_price": 54049,
        //            "pair": "BTCBRL",
        //            "max_price": 54049,
        //            "min_price": 54049,
        //            "transactions_number": 10
        //            }
        //        ]
        //  
        const result = [];
        const results = this.safeValue (response, 'data', []);
        for (let i = 0; i < results.length; i++) {
            const market = results[i];
            const id = this.safeString (market, 'pair');
            const baseId = this.safeString (market, 'base');
            const quoteId = this.safeString (market, 'quote');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const precision = {
                'amount': this.safeNumber (market, 'min_amount'),
                'price': this.safeNumber (market, 'price_tick'),
            };
            const limits = {
                'amount': {
                    'min': this.safeNumber (market, 'min_amount'),
                    'max': undefined,
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': this.safeNumber (market, 'min_value'),
                    'max': undefined,
                },
            };
            const active = true;
            const maker = 0.0025;
            const taker = 0.005;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'type': 'spot',
                'spot': true,
                'active': active,
                'precision': precision,
                'maker': maker,
                'taker': taker,
                'limits': limits,
                'info': market,
            });
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        const response = await this.publicGetCurrencies(params);
        // {
        //   "message": null,
        //   "data": [
        //     {
        //       "active": true,
        //       "code": "BTC",
        //       "min_withdraw_amount": 0,
        //       "name": "string",
        //       "precision": 0
        //     }
        //   ]
        // }
        const results = this.safeValue (response, 'data', []);
        const result = {};
        for (let i = 0; i < results.length; i++) {
            const currency = results[i];
            const id = this.safeString (currency, 'code');
            const code = this.safeCurrencyCode (id);
            const name = this.safeString (currency, 'name');
            const active = this.safeValue (currency, 'active', true);
            const precision = this.safeInteger (currency, 'precision');
            const min_withdraw_amount = this.safeInteger (currency, 'min_withdraw_amount');
            result[code] = {
                'id': id,
                'code': code,
                'name': name,
                'info': currency, // the original payload
                'active': active,
                'fee': undefined,
                'precision': precision,
                'limits': {
                    'amount': { 'min': undefined, 'max': undefined },
                    'withdraw': { 'min': min_withdraw_amount, 'max': undefined },
                },
            };
        }
        return result;
    }


    async fetchTicker (symbol, params = {}) {
        //{
        //  "message": null,
        //  "data": {
        //    "high": 15999.12,
        //    "low": 15000.12,
        //    "volume": 123.12345678,
        //    "trades_quantity": 123,
        //    "last": 15500.12,
        //    "buy": 15400.12,
        //    "sell": 15600.12,
        //    "date": "2017-10-20T00:00:00Z"
        //  }
        //}
        const request = {
            'pair': symbol,
        };
        const response = await this.publicGetPairTicker(this.extend(request, params));
        const ticker = this.safeValue(response, 'ticker', {})
        const timestamp = this.parseDate(
            this.safeString(trade, 'date')
        )
        const last = this.safeNumber(ticker, 'last')
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'high': this.safeNumber(ticker, 'high'),
            'low': this.safeNumber(ticker, 'low'),
            'bid': this.safeNumber(ticker, 'buy'),
            'bidVolume': undefined,
            'ask': this.safeNumber(ticker, 'sell'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeNumber(ticker, 'volume'),
            'quoteVolume': undefined,
            'info': ticker,
        }
    }


    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        // {
        //   "data": {
        //     "buying": [
        //       {
        //         "unit_price": 54049,
        //         "code": "BypTSfJSz",
        //         "user_code": "H1u6_cuGM",
        //         "amount": 0.02055746
        //       }
        //     ],
        //     "selling": [
        //       {
        //         "unit_price": 1923847,
        //         "code": "IasDflk",
        //         "user_code": "H1u6_cuGM",
        //         "amount": 0.1283746
        //       }
        //     ],
        //     ...
        //   }
        // }
        params = this.extend (params, {
            'pair': symbol
        });
        const response = await this.privateGetMarket(params);
        orderbook = this.parseOrderBook(
            response["data"], symbol, undefined, 'buying', 'selling', 'unit_price', 'amount'
        );
        return orderbook;
    }

    parseTrade (trade, market = undefined) {
        const timestamp = this.parseDate(
            this.safeString(trade, 'timestamp')
        );

        const id = timestamp;
        let side = this.safeString(trade, 'type');
        const takerSide = this.safeString(trade, 'type');
        const takerOrMaker = 'taker';
        if (side !== undefined) {
            side = side.toLowerCase();
        }
        const priceString = this.safeNumber(trade, 'unit_price');
        const amountString = this.safeNumber(trade, 'amount');
        const price = this.parseNumber(priceString);
        const amount = this.parseNumber(amountString);
        const cost = this.parseNumber(Precise.mul(priceString, amountString));
        const fee = undefined;
        return {
            'id': id,
            'order': orderId,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'type': undefined,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'takerOrMaker': takerOrMaker,
            'fee': fee,
            'info': trade,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        //
        //     [
        //         {
        //             "created_at":1601322501,
        //             "amount":"0.00276",
        //             "price":"10850.020000",
        //             "side":"SELL",
        //             "pair":"BTC_USDC",
        //             "taker_fee":"0",
        //             "taker_side":"SELL",
        //             "maker_fee":"0",
        //             "taker":2577953,
        //             "maker":2577937
        //         }
        //     ]
        //
        params = this.extend (params, {
            'pair': symbol
        });
        const response = await this.privateGetMarket(params);
        return this.parseTrades (response, market, since, limit);
    }

    async fetchBalance (params = {}) {
        const response = await this.privateGetWalletsBalance(params);
        // {
        //   "message": null,
        //   "data": [
        //     {
        //       "address": "3JentmkNdL97VQDtgRMehxPJKS4AveUZJa",
        //       "available_amount": 5.23423423,
        //       "currency_code": "BTC",
        //       "last_update": "2020-10-20T18:39:45.198Z",
        //       "locked_amount": 0,
        //       "memo": null,
        //       "tag": null
        //     },
        //     {
        //       "address": "rfMyfzcavQ4tUe1yJYMS4YPUZhAvcWRbRm",
        //       "available_amount": 75.31057927,
        //       "currency_code": "XRP",
        //       "last_update": "2020-10-20T18:39:45.198Z",
        //       "locked_amount": 0,
        //       "memo": null,
        //       "tag": "0700000000"
        //     }
        //   ]
        // }
        const result = { 'info': response };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const currencyId = this.safeString(balance, 'symbol');
            const code = this.safeCurrencyCode(currencyId);
            const account = this.account();
            account['free'] = this.safeString(balance, 'available_amount');
            account['used'] = this.safeString(balance, 'locked_amount');
            result[code] = account;
        }
        return this.parseBalance(result);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        const uppercaseType = type.toUpperCase ();
        const uppercaseSide = side.toUpperCase ();
        const request = {
            'pair': market['id'],
            'order_type': uppercaseType, // LIMIT, MARKET
            'side': uppercaseSide, // BUY or SELL
            'amount': self.parseNumber(amount),
        };
        if (uppercaseType === 'limited') {
            request['unit_price'] = this.parseNumber(price);
        }
        const response = await this.privatePostMarketCreateOrder(this.extend(request, params));
        // {
        //   "message": null,
        //   "data": {
        //     "code": "string"
        //   }
        // }
        return response.data.code;
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        const request = {
            'code': id
        };
        const response = await this.privateDeleteMarketUserOrders(this.extend(request, params));
        // {
        //   "message": null,
        //   "data": {
        //     "code": "string",
        //     "create_date": "string",
        //     "executed_amount": 0,
        //     "pair": "BRLBTC",
        //     "remaining_amount": 0,
        //     "remaining_price": 0,
        //     "requested_amount": 0,
        //     "status": "string",
        //     "subtype": "string",
        //     "total_price": 0,
        //     "type": "string",
        //     "unit_price": 0,
        //     "update_date": "string"
        //   }
        // }
        return this.parseOrder(response["data"]);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder() requires a symbol argument');
        }
        const request = {
            'code': id
        };
        const response = await this.privateGetMarketUserOrdersCode(this.extend(request, params));
        // {
        //   "message": null,
        //   "data": {
        //     "code": "SkvtQoOZf",
        //     "type": "buy",
        //     "subtype": "limited",
        //     "requested_amount": 0.02347418,
        //     "remaining_amount": 0,
        //     "unit_price": 42600,
        //     "status": "executed_completely",
        //     "create_date": "2017-12-08T23:42:54.960Z",
        //     "update_date": "2017-12-13T21:48:48.817Z",
        //     "pair": "BRLBTC",
        //     "total_price": 1000,
        //     "executed_amount": 0.02347418,
        //     "remaining_price": 0,
        //     "transactions": [
        //       {
        //         "amount": 0.2,
        //         "create_date": "2020-02-21 20:24:43.433",
        //         "total_price": 1000,
        //         "unit_price": 5000
        //       },
        //       {
        //         "amount": 0.2,
        //         "create_date": "2020-02-21 20:49:37.450",
        //         "total_price": 1000,
        //         "unit_price": 5000
        //       }
        //     ]
        //   }
        // }
        return this.parseOrder(response);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrders() requires a symbol argument');
        }
        const request = {
            'pair': market['id'],
            // 'status': 'executed_partially,waiting,pending_creation,executed_completely,canceled' ,
            // 'page_size': 200,
            // 'current_page': 1,
        };
        if (limit !== undefined) {
            request['current_page'] = limit;
        }
        const response = await this.privateGetMarketUserOrdersList(this.extend(request, params));
        // {
        //   "message": null,
        //   "data": {
        //     "orders": [
        //       {
        //         "code": "SkvtQoOZf",
        //         "type": "buy",
        //         "subtype": "limited",
        //         "requested_amount": 0.02347418,
        //         "remaining_amount": 0,
        //         "unit_price": 42600,
        //         "status": "executed_completely",
        //         "create_date": "2017-12-08T23:42:54.960Z",
        //         "update_date": "2017-12-13T21:48:48.817Z",
        //         "pair": "BRLBTC",
        //         "total_price": 1000,
        //         "executed_amount": 0.02347418,
        //         "remaining_price": 0
        //       },
        //       {
        //         "code": "SyYpGa8p_",
        //         "type": "buy",
        //         "subtype": "market",
        //         "requested_amount": 0.00033518,
        //         "remaining_amount": 0,
        //         "unit_price": 16352.12,
        //         "status": "executed_completely",
        //         "create_date": "2017-10-20T00:26:40.403Z",
        //         "update_date": "2017-10-20T00:26:40.467Z",
        //         "pair": "BRLBTC",
        //         "total_price": 5.48090358,
        //         "executed_amount": 0.00033518,
        //         "remaining_price": 0
        //       }
        //     ],
        //     "pagination": {
        //       "total_pages": 1,
        //       "current_page": 1,
        //       "page_size": 100,
        //       "registers_count": 21
        //     }
        //   }
        // }
        const results = this.safeValue (response, 'results', {});
        const data = this.safeValue (results, 'data', []);
        return this.parseOrders (data, market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'status': 'executed_partially,waiting,pending_creation'
        };
        return await this.fetchOrders(symbol, since, limit, this.extend(request, params));
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'status': 'executed_completely,canceled'
        };
        return await this.fetchOrders(symbol, since, limit, this.extend(request, params));
    }

    parseOrderStatus (status) {
        const statuses = {
            'executed_completely': 'executed completely',
            'executed_partially': 'executed partially',
            'waiting': 'waiting',
            'canceled': 'canceled',
            'pending_creation': 'pending creation',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        // {
        //     "code": "SkvtQoOZf",
        //     "type": "buy",
        //     "subtype": "limited",
        //     "requested_amount": 0.02347418,
        //     "remaining_amount": 0,
        //     "unit_price": 42600,
        //     "status": "executed_completely",
        //     "create_date": "2017-12-08T23:42:54.960Z",
        //     "update_date": "2017-12-13T21:48:48.817Z",
        //     "pair": "BRLBTC",
        //     "total_price": 1000,
        //     "executed_amount": 0.02347418,
        //     "remaining_price": 0
        // }
        const code = this.safeString (order, 'code');
        const amount = this.safeNumber (order, 'requested_amount');
        let cost = undefined;
        const type = this.safeStringLower (order, 'subtype');
        const price = this.safeNumber (order, 'unit_price');
        const side = this.safeStringLower (order, 'type');
        const status = this.parseOrderStatus(this.safeString(order, 'status'));
        const timestamp = this.parseDate(
            this.safeString(order, 'created_at')
        );
        let average = undefined;
        let filled = this.safeNumber (order, 'executed_amount');
        const fills = undefined;
        let trades = undefined;
        let lastTradeTimestamp = this.parseDate(
            this.safeString(order, 'update_date')
        )
        const remaining = this.safeNumber(order, 'remaining_amount');
        const symbol = this.safeSymbol(order, 'pair');
        return {
            'id': id,
            'clientOrderId': undefined,
            'info': order,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': symbol,
            'type': type,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'amount': amount,
            'cost': cost,
            'average': average,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': undefined,
            'trades': trades,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const request = '/' + this.version + '/' + this.implodeParams (path, params);
        let url = this.urls['api'][api] + request;
        const query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else if (api === 'private') {
            this.checkRequiredCredentials ();
            if (method === 'POST') {
                body = this.json (query);
            } else {
                if (Object.keys (query).length) {
                    url += '?' + this.urlencode (query);
                }
            }
            headers = {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.apiKey,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        if ((code >= 400) && (code <= 503)) {
            const feedback = this.id + ' ' + body;
            const message = this.safeString (response, 'message');
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            const status = code.toString ();
            this.throwExactlyMatchedException (this.exceptions['exact'], status, feedback);
        }
    }
};
