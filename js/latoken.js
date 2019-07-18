'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, ExchangeNotAvailable, OrderNotFound, InvalidOrder, DDoSProtection, NotSupported, BadRequest, AuthenticationError } = require ('./base/errors');
const { ROUND } = require ('./base/functions/number');

//  ---------------------------------------------------------------------------

module.exports = class latoken extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'latoken',
            'name': 'Latoken',
            'countries': [ 'KY' ], // Cayman Islands
            'version': 'v1',
            'rateLimit': 2000,
            'certified': false,
            'userAgent': this.userAgents['chrome'],
            'has': {
                'CORS': false,
                'publicAPI': true,
                'pivateAPI': true,
                'cancelOrder': true,
                'cancelAllOrders': true,
                'createMarketOrder': false,
                'createOrder': true,
                'fetchBalance': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': false,
                'fetchOrdersByStatus': true,
                'fetchOrderBook': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '3h': '3h',
                '6h': '6h',
                '12h': '12h',
                '1d': '1D',
                '1w': '7D',
                '2w': '14D',
                '1M': '1M',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/6286552/54519214-0f693600-4977-11e9-9ff4-6ea2f62875b0.png',
                'api': 'https://api.latoken.com',
                'www': 'https://www.latoken.com',
                'doc': [
                    'https://api.latoken.com',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        'ExchangeInfo/time',
                        'ExchangeInfo/limits',
                        'ExchangeInfo/pairs',
                        'ExchangeInfo/pairs/{currency}',
                        'ExchangeInfo/pair',
                        'ExchangeInfo/currencies',
                        'ExchangeInfo/currencies/{symbol}',
                        'MarketData/tickers',
                        'MarketData/tickers/{symbol}',
                        'MarketData/orderBook/{symbol}',
                        'MarketData/trades/{symbol}',
                        'MarketData/trades/{symbol}/{limit}',
                    ],
                },
                'private': {
                    'get': [
                        'Account/balances',
                        'Account/balances/{currency}',
                        'Order/status',
                        'Order/active',
                        'Order/get_order',
                        'Order/trades',
                    ],
                    'post': [
                        'Order/new',
                        'Order/test-order',
                        'Order/cancel',
                        'Order/cancel_all',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0.1 / 100,
                    'taker': 0.1 / 100,
                },
            },
            'options': {
                'createOrderMethod': 'private_post_order_new', // private_post_order_test_order
            },
            'exceptions': {
                'exact': {
                },
                'broad': {
                },
                'order_not_exist': OrderNotFound, // {"code":"order_not_exist","msg":"order_not_exist"} ¯\_(ツ)_/¯
                'order_not_exist_or_not_allow_to_cancel': InvalidOrder, // {"code":"400100","msg":"order_not_exist_or_not_allow_to_cancel"}
                'Order size below the minimum requirement.': InvalidOrder, // {"code":"400100","msg":"Order size below the minimum requirement."}
                'The withdrawal amount is below the minimum requirement.': ExchangeError, // {"code":"400100","msg":"The withdrawal amount is below the minimum requirement."}
                '400': BadRequest,
                '401': AuthenticationError,
                '403': NotSupported,
                '404': NotSupported,
                '405': NotSupported,
                '429': DDoSProtection,
                '500': ExchangeError,
                '503': ExchangeNotAvailable,
            },
        });
    }

    nonce () {
        return this.milliseconds ();
    }

    async fetchTime (params = {}) {
        const response = await this.publicGetExchangeInfoTime (params);
        //
        //     {
        //         "time": "2019-04-18T9:00:00.0Z",
        //         "unixTimeSeconds": 1555578000,
        //         "unixTimeMiliseconds": 1555578000000
        //     }
        //
        return this.safeInteger (response, 'unixTimeMiliseconds');
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetExchangeInfoPairs (params);
        //
        //     [
        //         {
        //             "pairId": 502,
        //             "symbol": "LAETH",
        //             "baseCurrency": "LA",
        //             "quotedCurrency": "ETH",
        //             "makerFee": 0.01,
        //             "takerFee": 0.01,
        //             "pricePrecision": 8,
        //             "amountPrecision": 8,
        //             "minQty": 0.1
        //         }
        //     ]
        //
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const market = response[i];
            const id = this.safeString (market, 'symbol');
            // the exchange shows them inverted
            const baseId = this.safeString (market, 'quotedCurrency');
            const quoteId = this.safeString (market, 'baseCurrency');
            const numericId = this.safeInteger (market, 'pairId');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const precision = {
                'price': this.safeInteger (market, 'pricePrecision'),
                'amount': this.safeInteger (market, 'amountPrecision'),
            };
            const limits = {
                'amount': {
                    'min': this.safeFloat (market, 'minQty'),
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
            };
            result.push ({
                'id': id,
                'numericId': numericId,
                'info': market,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': undefined, // assuming true
                'precision': precision,
                'limits': limits,
            });
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        const response = await this.publicGetExchangeInfoCurrencies (params);
        //
        //     [
        //         {
        //             "currencyId": 102,
        //             "symbol": "LA",
        //             "name": "Latoken",
        //             "precission": 8,
        //             "type": "ERC20",
        //             "fee": 0.1
        //         }
        //     ]
        //
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const currency = response[i];
            const id = this.safeString (currency, 'symbol');
            const numericId = this.safeInteger (currency, 'currencyId');
            const code = this.safeCurrencyCode (id);
            const precision = this.safeInteger (currency, 'precission');
            const fee = this.safeFloat (currency, 'fee');
            const active = undefined;
            result[code] = {
                'id': id,
                'numericId': numericId,
                'code': code,
                'info': currency,
                'name': code,
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
                        'min': undefined,
                        'max': undefined,
                    },
                },
            };
        }
        return result;
    }

    calculateFee (symbol, side, amount, price, takerOrMaker = 'taker') {
        const market = this.markets[symbol];
        let key = 'quote';
        const rate = market[takerOrMaker];
        let cost = amount * rate;
        let precision = market['precision']['price'];
        if (side === 'sell') {
            cost *= price;
        } else {
            key = 'base';
            precision = market['precision']['amount'];
        }
        cost = this.decimalToPrecision (cost, ROUND, precision, this.precisionMode);
        return {
            'type': takerOrMaker,
            'currency': market[key],
            'rate': rate,
            'cost': parseFloat (cost),
        };
    }

    async fetchBalance (currency = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetAccountBalances (params);
        //
        //     [
        //         {
        //             "currencyId": 102,
        //             "symbol": "LA",
        //             "name": "Latoken",
        //             "amount": 1054.66,
        //             "available": 900.66,
        //             "frozen": 154,
        //             "pending": 0
        //         }
        //     ]
        //
        const result = {
            'info': response,
        };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const currencyId = this.safeString (balance, 'symbol');
            const code = this.safeCurrencyCode (currencyId);
            const frozen = this.safeFloat (balance, 'frozen');
            const pending = this.safeFloat (balance, 'pending');
            const used = this.sum (frozen, pending);
            const account = {
                'free': this.safeFloat (balance, 'available'),
                'used': used,
                'total': this.safeFloat (balance, 'amount'),
            };
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetMarketDataOrderBookSymbol (this.extend (request, params));
        //
        //     {
        //         "pairId": 502,
        //         "symbol": "LAETH",
        //         "spread": 0.07,
        //         "asks": [
        //             { "price": 136.3, "amount": 7.024 }
        //         ],
        //         "bids": [
        //             { "price": 136.2, "amount": 6.554 }
        //         ]
        //     }
        //
        return this.parseOrderBook (response, undefined, 'bids', 'asks', 'price', 'amount');
    }

    parseTicker (ticker, market = undefined) {
        const symbol = this.findSymbol (this.safeString (ticker, 'symbol'), market);
        const open = this.safeFloat (ticker, 'open');
        const close = this.safeFloat (ticker, 'close');
        let change = undefined;
        if (open !== undefined && close !== undefined) {
            change = close - open;
        }
        const percentage = this.safeFloat (ticker, 'priceChange');
        const timestamp = this.nonce ();
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'low': this.safeFloat (ticker, 'low'),
            'high': this.safeFloat (ticker, 'high'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': close,
            'last': close,
            'previousClose': undefined,
            'change': change,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'volume'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetMarketDataTickersSymbol (this.extend (request, params));
        //
        //     {
        //         "pairId": 502,
        //         "symbol": "LAETH",
        //         "volume": 1023314.3202,
        //         "open": 134.82,
        //         "low": 133.95,
        //         "high": 136.22,
        //         "close": 135.12,
        //         "priceChange": 0.22
        //     }
        //
        return this.parseTicker (response, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetMarketDataTickers (params);
        //
        //     [
        //         {
        //             "pairId": 502,
        //             "symbol": "LAETH",
        //             "volume": 1023314.3202,
        //             "open": 134.82,
        //             "low": 133.95,
        //             "high": 136.22,
        //             "close": 135.12,
        //             "priceChange": 0.22
        //         }
        //     ]
        //
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const ticker = this.parseTicker (response[i]);
            const symbol = ticker['symbol'];
            if (symbols === undefined || this.inArray (symbol, symbols)) {
                result[symbol] = ticker;
            }
        }
        return result;
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //     {
        //         "side":"buy",
        //         "price":0.022315,
        //         "amount":0.706,
        //         "timestamp":1563454655
        //     }
        //
        // fetchMyTrades (private)
        //
        //     {
        //         "id": "1555492358.126073.126767@0502:2",
        //         "orderId": "1555492358.126073.126767@0502:2",
        //         "commission": 0.012,
        //         "side": "buy",
        //         "price": 136.2,
        //         "amount": 0.7,
        //         "time": 1555515807369
        //     }
        //
        const type = undefined;
        let timestamp = this.safeInteger2 (trade, 'timestamp', 'time');
        if (timestamp !== undefined) {
            timestamp *= 1000;
        }
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'amount');
        const side = this.safeString (trade, 'side');
        let cost = undefined;
        if (amount !== undefined) {
            if (price !== undefined) {
                cost = amount * price;
            }
        }
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const id = this.safeString (trade, 'id');
        const orderId = this.safeString (trade, 'orderId');
        const feeCost = this.safeFloat (trade, 'commission');
        let fee = undefined;
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': undefined,
            };
        }
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': id,
            'order': orderId,
            'type': type,
            'takerOrMaker': undefined,
            'side': side,
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
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default 50, max 100
        }
        const response = await this.publicGetMarketDataTradesSymbol (this.extend (request, params));
        //
        //     {
        //         "pairId":370,
        //         "symbol":"ETHBTC",
        //         "tradeCount":51,
        //         "trades": [
        //             {
        //                 "side":"buy",
        //                 "price":0.022315,
        //                 "amount":0.706,
        //                 "timestamp":1563454655
        //             }
        //         ]
        //     }
        //
        const trades = this.safeValue (response, 'trades', []);
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = undefined;
        const request = {
            'symbol': symbol,
        };
        if (since !== undefined) {
            request['timestamp'] = since;
        }
        const response = await this.privateGetOrderTrades (this.extend (request, params));
        //
        //     {
        //         "pairId": 502,
        //         "symbol": "LAETH",
        //         "tradeCount": 1,
        //         "trades": [
        //             {
        //                 "id": "1555492358.126073.126767@0502:2",
        //                 "orderId": "1555492358.126073.126767@0502:2",
        //                 "commission": 0.012,
        //                 "side": "buy",
        //                 "price": 136.2,
        //                 "amount": 0.7,
        //                 "time": 1555515807369
        //             }
        //         ]
        //     }
        //
        const trades = this.safeValue (response, 'trades', []);
        return this.parseTrades (trades, market, since, limit);
    }

    parseOrder (order) {
        const symbol = order['symbol'];
        const side = order['side'];
        const orderType = order['orderType'];
        const price = this.safeFloat (order, 'price');
        const amount = this.safeFloat (order, 'amount');
        const orderStatus = order['orderStatus'];
        const executedAmount = this.safeFloat (order, 'executedAmount');
        const reaminingAmount = this.safeFloat (order, 'reaminingAmount');
        const timeCreated = this.safeValue (order, 'timeCreated');
        return {
            'id': order['orderId'],
            'info': order,
            'timestamp': timeCreated,
            'datetime': this.iso8601 (timeCreated),
            'lastTradeTimestamp': undefined,
            'status': orderStatus,
            'symbol': symbol,
            'type': orderType,
            'side': side,
            'price': price,
            'cost': undefined,
            'amount': amount,
            'filled': executedAmount,
            'average': price,
            'remaining': reaminingAmount,
            'fee': undefined,
        };
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = 50, params = {}) {
        return this.fetchOrdersByStatus (symbol, 'active', since, limit, params);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = 50, params = {}) {
        return this.fetchOrdersByStatus (symbol, 'cancelled', since, limit, params);
    }

    async fetchOrdersByStatus (symbol, status, since = undefined, limit = 100, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        const request = {
            'status': status,
        };
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['symbol'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetOrderStatus (this.extend (request, params));
        const orders = this.parseOrders (response);
        return orders;
    }

    async fetchAllActiveOrders (symbol, limit = 50, params = {}) {
        await this.loadMarkets ();
        const request = {
            'symbol': symbol,
            'limit': limit,
        };
        request['timestamp'] = this.nonce ();
        const response = await this.privateGetOrderActive (this.extend (request, params));
        const orders = this.parseOrders (response);
        return orders;
    }

    async fetchOrder (id, params = {}) {
        await this.loadMarkets ();
        const request = {
            'orderId': id,
        };
        const response = await this.privateGetOrderGetOrder (this.extend (request, params));
        return (this.parseOrder (response));
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        if (type !== 'limit') {
            throw new ExchangeError (this.id + ' allows limit orders only');
        }
        const request = {
            'symbol': this.marketId (symbol),
            'side': side,
            'price': this.priceToPrecision (symbol, price),
            'amount': this.amountToPrecision (symbol, amount),
            'orderType': type,
        };
        const method = this.safeString (this.options, 'createOrderMethod', 'private_post_order_new');
        const response = await this[method] (this.extend (request, params));
        //
        //     {
        //         "orderId":"1563460093.134037.704945@0370:2",
        //         "cliOrdId":"",
        //         "pairId":370,
        //         "symbol":"ETHBTC",
        //         "side":"sell",
        //         "orderType":"limit",
        //         "price":1.0,
        //         "amount":1.0
        //     }
        //
        return this.parseOrder (response);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'orderId': id,
        };
        const response = await this.privatePostOrderCancel (this.extend (request, params));
        //
        //     {
        //         "orderId": "1555492358.126073.126767@0502:2",
        //         "cliOrdId": "myNewOrder",
        //         "pairId": 502,
        //         "symbol": "LAETH",
        //         "side": "buy",
        //         "orderType": "limit",
        //         "price": 136.2,
        //         "amount": 0.57,
        //         "orderStatus": "partiallyFilled",
        //         "executedAmount": 0.27,
        //         "reaminingAmount": 0.3,
        //         "timeCreated": 155551580736,
        //         "timeFilled": 0
        //     }
        //
        return this.parseOrder (response);
    }

    async cancelAllOrders (symbol, params = {}) {
        await this.loadMarkets ();
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.symbol + ' cancelAllOrders requires a symbol argument');
        }
        const response = await this.privatePostOrderCancelAll (this.extend ({
            'symbol': symbol,
        }, params));
        const result = [];
        for (let i = 0; i < response.cancelledOrders.length; i++) {
            const resp = response.cancelledOrders[i];
            result.push ({
                'pairId': response['pairId'],
                'symbol': response['symbol'],
                'cancelledOrder': resp,
            });
        }
        const orders = this.parseTrades (result);
        return orders;
    }

    sign (path, api = 'public', method = 'GET', params = undefined, headers = undefined, body = undefined) {
        let request = '/api/' + this.version + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (api === 'private') {
            const nonce = this.nonce ();
            query = this.extend ({
                'timestamp': nonce,
            }, query);
        }
        const urlencodedQuery = this.urlencode (query);
        if (Object.keys (query).length) {
            request += '?' + urlencodedQuery;
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const signature = this.hmac (this.encode (request), this.encode (this.secret));
            headers = {
                'X-LA-KEY': this.apiKey,
                'X-LA-SIGNATURE': signature,
            };
            if (method === 'POST') {
                headers['Content-Type'] = 'application/x-www-form-urlencoded';
                body = urlencodedQuery;
            }
        }
        const url = this.urls['api'] + request;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response) {
        if (!response) {
            return;
        }
        // { "message": "Request limit reached!", "details": "Request limit reached. Maximum allowed: 1 per 1s. Please try again in 1 second(s)." }
        // { "error": { "message": "Pair 370 is not found","errorType":"RequestError","statusCode":400 }}
        // { "error": { "message": "Signature or ApiKey is not valid","errorType":"RequestError","statusCode":400 }}
        // { "error": { "message": "Request is out of time", "errorType": "RequestError", "statusCode":400 }}
        // { "error": { "message": "Price needs to be greater than 0","errorType":"ValidationError","statusCode":400 }}
        // { "error": { "message": "Side is not valid, Price needs to be greater than 0, Amount needs to be greater than 0, The Symbol field is required., OrderType is not valid","errorType":"ValidationError","statusCode":400 }}
        // { "error": { "message": "Cancelable order whit ID 1563460289.571254.704945@0370:1 not found","errorType":"RequestError","statusCode":400 }}
        const errorCode = this.safeString (response, 'code');
        const message = this.safeString (response, 'msg');
        const ExceptionClass = this.safeValue2 (this.exceptions, message, errorCode);
        if (ExceptionClass !== undefined) {
            throw new ExceptionClass (this.id + ' ' + message);
        }
    }
};
