'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, InvalidNonce, OrderNotFound, InvalidOrder, DDoSProtection, BadRequest, AuthenticationError } = require ('./base/errors');
const { ROUND } = require ('./base/functions/number');

//  ---------------------------------------------------------------------------

module.export = class latoken_v2 extends Exchange {
    describe() {
        return this.deepExtend (super.describe (), {
            'id': 'latoken',
            'name': 'Latoken',
            'countries': [ 'KY' ], // Cayman Islands
            'version': 'v2',
            'rateLimit': 2000,
            'certified': false,
            'userAgent': this.userAgents['chrome'],
            'has': {
                'CORS': false,
                'publicAPI': true,
                'privateAPI': true,
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
                'api': 'https://api.latoken.com/v2',
                'www': 'https://latoken.com',
                'doc': [
                    'https://api.latoken.com/doc/c2',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        'currency',
                        'currency/available',
                        'currency/quotes',
                        'currency/{currency}',
                        'pair',
                        'pair/available',
                        'ticker',
                        'ticker/{base}/{quote}',
                        'time',
                        'trade/history/{currency}/{quote}',
                        'transaction/bindings',
                        'marketOverview/ticker',
                        'marketOverview/orderbook/{market_pair}',
                        'marketOverview/trades/{market_pair}',
                        'book/{currency}/{quote}',
                    ],
                },
                'private': {
                    'get': [
                        'auth/account',
                        'auth/account/currency/{currency}/{type}',
                        'auth/order',
                        'auth/order/getOrder/{id}',
                        'auth/order/pair/{currency}/{quote}',
                        'auth/order/pair/{currency}/{quote}/active',
                        'auth/trade',
                        'auth/trade/pair/{currency}/{quote}',
                        'auth/transaction',
                        'auth/transaction/bindings',
                        'auth/transaction/bindings/{currency}',
                        'auth/transaction/{id}',
                        'auth/transfer',
                    ],
                    'post': [
                        'auth/order/cancel',
                        'auth/order/place',
                        'auth/spot/deposit',
                        'auth/spot/withdrawal',
                        'auth/transaction/depositAddress',
                        'auth/transaction/withdraw',
                        'auth/transaction/withdraw/cancel',
                        'auth/transaction/withdraw/confirm',
                        'auth/transaction/withdraw/resendCode',
                        'auth/transfer/email',
                        'auth/transfer/id',
                        'auth/transfer/phone',
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
                'MT': 'Monarch',
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

    nonce() {
        return this.milliseconds ();
    }

    async fetchTime (params = {}) {
        const response = await this.publicGetTime (params);
        //
        //     {
        //         "serverTime": 12345,
        //     }
        //
        return this.safeInteger (response, 'unixTimeMiliseconds');
    }

    async fetchMarkets(params = {}) {
        const response = await this.publicGetPair (params);

    //    [ 
    //        {
    //             "id": "263d5e99-1413-47e4-9215-ce4f5dec3556",
    //             "status": "PAIR_STATUS_ACTIVE",
    //             "baseCurrency": "6ae140a9-8e75-4413-b157-8dd95c711b23",
    //             "quoteCurrency": "23fa548b-f887-4f48-9b9b-7dd2c7de5ed0",
    //             "priceTick": "0.010000000",
    //             "priceDecimals": 2,
    //             "quantityTick": "0.010000000",
    //             "quantityDecimals": 2,
    //             "costDisplayDecimals": 3,
    //             "created": 1571333313871
    //         }
    //     ]

        const result = [];
        for (let i = 0; i < response.length; i++) {
            const market = response[i];
            const id = this.safeString (market, 'symbol');
            // the exchange shows them inverted
            const baseId = this.safeString (market, 'baseCurrency');
            const quoteId = this.safeString (market, 'quotedCurrency');
            const numericId = this.safeInteger (market, 'id');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const precision = {
                'price': this.safeInteger (market, 'priceDecimals'),
                'amount': this.safeInteger (market, 'quantityDecimals'),
            };
            const limits = {
                'amount': {
                    'min': this.safeFloat (market, 'quantityTick'),
                    'max': undefined,
                },
                'price': {
                    'min': Math.pow (10, -precision['priceTick']),
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
        const response = await this.publicGetCurrency (params);
        //
        //     [
        //         {
        //            "id": "d663138b-3ec1-436c-9275-b3a161761523",
        //            "status": "CURRENCY_STATUS_ACTIVE",
        //            "type": "CURRENCY_TYPE_CRYPTO",
        //            "name": "Latoken",
        //            "tag": "LA",
        //            "description": "LATOKEN is a cutting edge exchange which makes investing and payments easy and safe worldwide.",
        //            "logo": "https://static.dev-mid.nekotal.tech/icons/color/la.svg",
        //            "decimals": 9,
        //            "created": 1571333563712
        //         }
        //     ]
        //
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const currency = response[i];
            const id = this.safeString (currency, 'tag');
            const numericId = this.safeInteger (currency, 'currencyId');
            const code = this.safeCurrencyCode (id);
            const precision = this.safeInteger (currency, 'decimals');
            const fee = undefined;
            const active = true;
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

    
    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetAuthAccount (params);
        //
        //     [
        //         {
        //              "id": "1e200836-a037-4475-825e-f202dd0b0e92",
        //              "status": "ACCOUNT_STATUS_ACTIVE",
        //              "type": "ACCOUNT_TYPE_WALLET",
        //              "timestamp": 1566408522980,
        //              "currency": "6ae140a9-8e75-4413-b157-8dd95c711b23",
        //              "available": "898849.3300",
        //              "blocked": "4581.9510"
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
            const available = this.safeFloat (balance, 'available');
            const blocked = this.safeFloat (balance, 'blocked');
            const pending = undefined;
            const used = this.sum (blocked, pending);
            const quantity = this.sum (available, blocked);
            const account = {
                'free': available,
                'used': used,
                'total': quantity,
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
            'limit': 10,
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default 10, max 1000
        }
        const response = await this.publicGetBookCurrencyQuote (this.extend (request, params));
        //
        //     {
        //         "ask": [
        //              { 
        //                  "price": "123.321", 
        //                  "quantity": "0.12",
        //                  "cost": "14.79852",
        //                  "accumulated": "14.79852",
        //              }
        //         ],
        //         "bid": [
        //              { 
        //                  "price": "123.321", 
        //                  "quantity": "0.12",
        //                  "cost": "14.79852",
        //                  "accumulated": "14.79852",
        //              }
        //         ],
        //         "totalAsk": "...",
        //         "totalBid": "..."
        //     }
        //
        return this.parseOrderBook (response, undefined, 'bids', 'asks', 'price', 'quantity');
    }

    parseTicker (ticker, market = undefined) {
        //
        //     {
        //         "symbol": "ETH/USDT",
        //         "baseCurrency": "23fa548b-f887-4f48-9b9b-7dd2c7de5ed0",
        //         "quoteCurrency": "d721fcf2-cf87-4626-916a-da50548fe5b3",
        //         "volume24h": "450.29",
        //         "volume7d": "3410.23",
        //         "change24h": "-5.2100",
        //         "change7d": "1.1491",
        //         "lastPrice": "10034.14"
        //     }
        //       
        let symbol = undefined;
        const marketId = this.safeString (ticker, 'symbol');
        if (marketId in this.markets_by_id) {
            market = this.markets_by_id[marketId];
        }
        if ((symbol === undefined) && (market !== undefined)) {
            symbol = market['symbol'];
        }
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
        const response = await this.publicGetTickerBaseQuote (this.extend (request, params));
        //
        //     {
        //         "symbol": "ETH/USDT",
        //         "baseCurrency": "23fa548b-f887-4f48-9b9b-7dd2c7de5ed0",
        //         "quoteCurrency": "d721fcf2-cf87-4626-916a-da50548fe5b3",
        //         "volume24h": "450.29",
        //         "volume7d": "3410.23",
        //         "change24h": "-5.2100",
        //         "change7d": "1.1491",
        //         "lastPrice": "10034.14"
        //     }
        //       
        return this.parseTicker (response, market);
    }

    
    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetTicker (params);
        //
        //     [
        //       {
        //         "symbol": "ETH/USDT",
        //         "baseCurrency": "23fa548b-f887-4f48-9b9b-7dd2c7de5ed0",
        //         "quoteCurrency": "d721fcf2-cf87-4626-916a-da50548fe5b3",
        //         "volume24h": "450.29",
        //         "volume7d": "3410.23",
        //         "change24h": "-5.2100",
        //         "change7d": "1.1491",
        //         "lastPrice": "10034.14"
        //       }
        //     ]
        //
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const ticker = this.parseTicker (response[i]);
            const symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //     {
        //         id: "92609cf4-fca5-43ed-b0ea-b40fb48d3b0d",
        //         direction: "TRADE_DIRECTION_BUY",
        //         baseCurrency: "6ae140a9-8e75-4413-b157-8dd95c711b23",
        //         quoteCurrency: "d721fcf2-cf87-4626-916a-da50548fe5b3",
        //         price: "10000.00",
        //         quantity: "18.0000",
        //         cost: "180000.000",
        //         timestamp: 1568396094704
        //     }
        //
        // fetchMyTrades (private)
        //
        //     {
        //         id: "92609cf4-fca5-43ed-b0ea-b40fb48d3b0d",
        //         direction: "TRADE_DIRECTION_BUY",
        //         baseCurrency: "6ae140a9-8e75-4413-b157-8dd95c711b23",
        //         quoteCurrency: "d721fcf2-cf87-4626-916a-da50548fe5b3",
        //         price: "10000.00",
        //         quantity: "18.0000",
        //         cost: "180000.000",
        //         timestamp: 1568396094704
        //     }
        //
        const type = undefined;
        let timestamp = this.safeInteger2 (trade, 'timestamp', 'time');
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'quantity');
        const side = this.safeString (trade, 'direction');
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
        const orderId = this.safeString (trade, 'id');
        const feeCost = undefined;
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
        const response = await this.publicGetTradeHistoryCurrencyQuote (this.extend (request, params));
        //   [
        //     {
        //         id: "92609cf4-fca5-43ed-b0ea-b40fb48d3b0d",
        //         direction: "TRADE_DIRECTION_BUY",
        //         baseCurrency: "6ae140a9-8e75-4413-b157-8dd95c711b23",
        //         quoteCurrency: "d721fcf2-cf87-4626-916a-da50548fe5b3",
        //         price: "10000.00",
        //         quantity: "18.0000",
        //         cost: "180000.000",
        //         timestamp: 1568396094704
        //     },
        //   ]
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
        const response = await this.privateGetAuthTradePairCurrencyQuote (this.extend (request, params));
        //   [
        //     {
        //         id: "92609cf4-fca5-43ed-b0ea-b40fb48d3b0d",
        //         direction: "TRADE_DIRECTION_BUY",
        //         baseCurrency: "6ae140a9-8e75-4413-b157-8dd95c711b23",
        //         quoteCurrency: "d721fcf2-cf87-4626-916a-da50548fe5b3",
        //         price: "10000.00",
        //         quantity: "18.0000",
        //         cost: "180000.000",
        //         timestamp: 1568396094704
        //     },
        //   ]
        //
        const trades = this.safeValue (response, 'trades', []);
        return this.parseTrades (trades, market, since, limit);
    }

    parseOrderStatus (status) {
        const statuses = {
            'CANCELED': 'canceled',
            'PLACED': 'open',
            'FILLED': 'filled',
            'INACTIVE': 'inactive',
            'PLACING': 'placing',
            'REJECTED': 'rejected',
            'WORKING': 'working',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        // createOrder
        //
        //     {
        //          "baseCurrency": "f7dac554-8139-4ff6-841f-0e586a5984a0",
        //          "quoteCurrency": "a5a7a7a9-e2a3-43f9-8754-29a02f6b709b",
        //          "side": "BID",
        //          "condition": "GTC",
        //          "type": "LIMIT",
        //          "clientOrderId": "my-wonderful-order-number-71566",
        //          "price": "10103.19",
        //          "quantity": "3.21",
        //          "timestamp": 1568185507 // seconds
        //     }
        //
        // cancelOrder, fetchOrder, fetchOpenOrders, fetchClosedOrders, fetchCanceledOrders
        //
        //     {
        //          "id": "...",
        //          "message": "your request was successfully processed",
        //          "status": "SUCCESS",
        //          "error": "...",
        //          "errors": {
        //              "property1": "...",
        //              "property2": "..."
        //          }
        //     }
        //
        const id = this.safeString (order, 'id');
        const timestamp = this.safeTimestamp (order, 'timestamp');
        if (timestamp !== undefined) {
            // 03 Jan 2009 - first block
            if (timestamp < 1230940800000) {
                timestamp *= 1000;
            }
        }
        const marketId = this.safeString (order, 'symbol');
        let symbol = marketId;
        if (marketId in this.markets_by_id) {
            market = this.markets_by_id[marketId];
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const side = this.safeString (order, 'side');
        const type = this.safeString (order, 'type');
        const price = this.safeFloat (order, 'price');
        const amount = this.safeFloat (order, 'quantity');
        const filled = undefined;
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
        const clientOrderId = this.safeString (order, 'cliOrdId');
        return {
            'id': id,
            'clientOrderId': clientOrderId,
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
            'trades': undefined,
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
        const response = await this.privateGetAuthOrderGetOrderId (this.extend (request, params));
        //
        //     {
        //          "id": "12609cf4-fca5-43ed-b0ea-b40fb48d3b0d",
        //          "status": "CLOSED",
        //          "side": "BUY",
        //          "condition": "GTC",
        //          "type": "LIMIT",
        //          "baseCurrency": "3092b810-c39f-47ba-8c5f-a8ca3bd8902c",
        //          "quoteCurrency": "4092b810-c39f-47ba-8c5f-a8ca3bd0004c",
        //          "clientOrderId": "myOrder",
        //          "price": "100.0",
        //          "quantity": "1000.0",
        //          "cost": "100000.0",
        //          "filled": "230.0",
        //          "trader": "12345678-fca5-43ed-b0ea-b40fb48d3b0d",
        //          "timestamp": 3800014433
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
         //      {
        //          "id": "...",
        //          "message": "your request was successfully processed",
        //          "status": "SUCCESS",
        //          "error": "...",
        //          "errors": {
        //              "property1": "...",
        //              "property2": "..."
        //          }
        //      }
        //
        return this.parseOrder (response);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'orderId': id,
        };
        const response = await this.privatePostAuthOrderCancel (this.extend (request, params));
        //
        //      {
        //          "id": "...",
        //          "message": "your request was successfully processed",
        //          "status": "SUCCESS",
        //          "error": "...",
        //          "errors": {
        //              "property1": "...",
        //              "property2": "..."
        //          }
        //      }
        //
        return this.parseOrder (response);
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
                'X-LA-APIKEY': this.apiKey,
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
        const feedback = this.id + ' ' + body;
        if (message !== undefined) {
            this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
        }
        const error = this.safeValue (response, 'error', {});
        const errorMessage = this.safeString (error, 'message');
        if (errorMessage !== undefined) {
            this.throwExactlyMatchedException (this.exceptions['exact'], errorMessage, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], errorMessage, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
    }
}