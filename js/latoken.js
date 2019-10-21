'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, InvalidNonce, OrderNotFound, InvalidOrder, DDoSProtection, BadRequest, AuthenticationError } = require ('./base/errors');
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
                'fetchCanceledOrders': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchMyTrades': true,
                'fetchOpenOrders': true,
                'fetchOrder': false,
                'fetchOrdersByStatus': true,
                'fetchOrderBook': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/61511972-24c39f00-aa01-11e9-9f7c-471f1d6e5214.jpg',
                'api': 'https://api.latoken.com',
                'www': 'https://latoken.com',
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
                        'MarketData/ticker/{symbol}',
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
            'commonCurrencies': {
                'TSL': 'Treasure SL',
            },
            'options': {
                'createOrderMethod': 'private_post_order_new', // private_post_order_test_order
            },
            'exceptions': {
                'exact': {
                    'Signature or ApiKey is not valid': AuthenticationError,
                    'Request is out of time': InvalidNonce,
                    'Symbol must be specified': BadRequest,
                },
                'broad': {
                    'Request limit reached': DDoSProtection,
                    'Pair': BadRequest,
                    'Price needs to be greater than': InvalidOrder,
                    'Amount needs to be greater than': InvalidOrder,
                    'The Symbol field is required': InvalidOrder,
                    'OrderType is not valid': InvalidOrder,
                    'Side is not valid': InvalidOrder,
                    'Cancelable order whit': OrderNotFound,
                    'Order': OrderNotFound,
                },
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
            const baseId = this.safeString (market, 'baseCurrency');
            const quoteId = this.safeString (market, 'quotedCurrency');
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
                    'min': Math.pow (10, -precision['price']),
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

    calculateFee (symbol, type, side, amount, price, takerOrMaker = 'taker', params = {}) {
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
            'baseVolume': undefined,
            'quoteVolume': this.safeFloat (ticker, 'volume'),
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetMarketDataTickerSymbol (this.extend (request, params));
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
        //         side: 'buy',
        //         price: 0.33634,
        //         amount: 0.01,
        //         timestamp: 1564240008000 // milliseconds
        //     }
        //
        // fetchMyTrades (private)
        //
        //     {
        //         id: '1564223032.892829.3.tg15',
        //         orderId: '1564223032.671436.707548@1379:1',
        //         commission: 0,
        //         side: 'buy',
        //         price: 0.32874,
        //         amount: 0.607,
        //         timestamp: 1564223033 // seconds
        //     }
        //
        const type = undefined;
        let timestamp = this.safeInteger2 (trade, 'timestamp', 'time');
        if (timestamp !== undefined) {
            // 03 Jan 2009 - first block
            if (timestamp < 1230940800000) {
                timestamp *= 1000;
            }
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
        //                 side: 'buy',
        //                 price: 0.33634,
        //                 amount: 0.01,
        //                 timestamp: 1564240008000 // milliseconds
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
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.privateGetOrderTrades (this.extend (request, params));
        //
        //     {
        //         "pairId": 502,
        //         "symbol": "LAETH",
        //         "tradeCount": 1,
        //         "trades": [
        //             {
        //                 id: '1564223032.892829.3.tg15',
        //                 orderId: '1564223032.671436.707548@1379:1',
        //                 commission: 0,
        //                 side: 'buy',
        //                 price: 0.32874,
        //                 amount: 0.607,
        //                 timestamp: 1564223033 // seconds
        //             }
        //         ]
        //     }
        //
        const trades = this.safeValue (response, 'trades', []);
        return this.parseTrades (trades, market, since, limit);
    }

    parseOrderStatus (status) {
        const statuses = {
            'active': 'open',
            'partiallyFilled': 'open',
            'filled': 'closed',
            'cancelled': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        // createOrder
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
        // cancelOrder, fetchOrder, fetchOpenOrders, fetchClosedOrders, fetchCanceledOrders
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
        const id = this.safeString (order, 'orderId');
        const timestamp = this.safeTimestamp (order, 'timeCreated');
        const marketId = this.safeString (order, 'symbol');
        let symbol = marketId;
        if (marketId in this.markets_by_id) {
            market = this.markets_by_id[marketId];
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const side = this.safeString (order, 'side');
        const type = this.safeString (order, 'orderType');
        const price = this.safeFloat (order, 'price');
        const amount = this.safeFloat (order, 'amount');
        const filled = this.safeFloat (order, 'executedAmount');
        let remaining = undefined;
        if (amount !== undefined) {
            if (filled !== undefined) {
                remaining = amount - filled;
            }
        }
        const status = this.parseOrderStatus (this.safeString (order, 'orderStatus'));
        let cost = undefined;
        if (filled !== undefined) {
            if (price !== undefined) {
                cost = filled * price;
            }
        }
        const timeFilled = this.safeTimestamp (order, 'timeFilled');
        let lastTradeTimestamp = undefined;
        if ((timeFilled !== undefined) && (timeFilled > 0)) {
            lastTradeTimestamp = timeFilled;
        }
        return {
            'id': id,
            'info': order,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'status': status,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'average': undefined,
            'remaining': remaining,
            'fee': undefined,
        };
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return this.fetchOrdersWithMethod ('private_get_order_active', symbol, since, limit, params);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return this.fetchOrdersByStatus ('filled', symbol, since, limit, params);
    }

    async fetchCanceledOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return this.fetchOrdersByStatus ('cancelled', symbol, since, limit, params);
    }

    async fetchOrdersByStatus (status, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'status': status,
        };
        return this.fetchOrdersWithMethod ('private_get_order_status', symbol, since, limit, this.extend (request, params));
    }

    async fetchOrdersWithMethod (method, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrdersWithMethod requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default 100
        }
        const response = await this[method] (this.extend (request, params));
        //
        //     [
        //         {
        //             "orderId": "1555492358.126073.126767@0502:2",
        //             "cliOrdId": "myNewOrder",
        //             "pairId": 502,
        //             "symbol": "LAETH",
        //             "side": "buy",
        //             "orderType": "limit",
        //             "price": 136.2,
        //             "amount": 0.57,
        //             "orderStatus": "partiallyFilled",
        //             "executedAmount": 0.27,
        //             "reaminingAmount": 0.3,
        //             "timeCreated": 155551580736,
        //             "timeFilled": 0
        //         }
        //     ]
        //
        return this.parseOrders (response, market, since, limit);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'orderId': id,
        };
        const response = await this.privateGetOrderGetOrder (this.extend (request, params));
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

    async cancelAllOrders (symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelAllOrders requires a symbol argument');
        }
        await this.loadMarkets ();
        const marketId = this.marketId (symbol);
        const request = {
            'symbol': marketId,
        };
        const response = await this.privatePostOrderCancelAll (this.extend (request, params));
        //
        //     {
        //         "pairId": 502,
        //         "symbol": "LAETH",
        //         "cancelledOrders": [
        //             "1555492358.126073.126767@0502:2"
        //         ]
        //     }
        //
        const result = [];
        const canceledOrders = this.safeValue (response, 'cancelledOrders', []);
        for (let i = 0; i < canceledOrders.length; i++) {
            const order = this.parseOrder ({
                'symbol': marketId,
                'orderId': canceledOrders[i],
                'orderStatus': 'canceled',
            });
            result.push (order);
        }
        return result;
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

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (!response) {
            return;
        }
        //
        //     { "message": "Request limit reached!", "details": "Request limit reached. Maximum allowed: 1 per 1s. Please try again in 1 second(s)." }
        //     { "error": { "message": "Pair 370 is not found","errorType":"RequestError","statusCode":400 }}
        //     { "error": { "message": "Signature or ApiKey is not valid","errorType":"RequestError","statusCode":400 }}
        //     { "error": { "message": "Request is out of time", "errorType": "RequestError", "statusCode":400 }}
        //     { "error": { "message": "Price needs to be greater than 0","errorType":"ValidationError","statusCode":400 }}
        //     { "error": { "message": "Side is not valid, Price needs to be greater than 0, Amount needs to be greater than 0, The Symbol field is required., OrderType is not valid","errorType":"ValidationError","statusCode":400 }}
        //     { "error": { "message": "Cancelable order whit ID 1563460289.571254.704945@0370:1 not found","errorType":"RequestError","statusCode":400 }}
        //     { "error": { "message": "Symbol must be specified","errorType":"RequestError","statusCode":400 }}
        //     { "error": { "message": "Order 1563460289.571254.704945@0370:1 is not found","errorType":"RequestError","statusCode":400 }}
        //
        const message = this.safeString (response, 'message');
        const exact = this.exceptions['exact'];
        const broad = this.exceptions['broad'];
        const feedback = this.id + ' ' + body;
        if (message !== undefined) {
            if (message in exact) {
                throw new exact[message] (feedback);
            }
            const broadKey = this.findBroadlyMatchedKey (broad, message);
            if (broadKey !== undefined) {
                throw new broad[broadKey] (feedback);
            }
        }
        const error = this.safeValue (response, 'error', {});
        const errorMessage = this.safeString (error, 'message');
        if (errorMessage !== undefined) {
            if (errorMessage in exact) {
                throw new exact[errorMessage] (feedback);
            }
            const broadKey = this.findBroadlyMatchedKey (broad, errorMessage);
            if (broadKey !== undefined) {
                throw new broad[broadKey] (feedback);
            }
            throw new ExchangeError (feedback); // unknown message
        }
    }
};
