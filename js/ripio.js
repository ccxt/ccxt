'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { AuthenticationError, ExchangeError, BadSymbol, InvalidOrder, ArgumentsRequired, OrderNotFound } = require ('./base/errors');
const { TICK_SIZE } = require ('./base/functions/number');

//  ---------------------------------------------------------------------------

module.exports = class ripio extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'ripio',
            'name': 'Ripio',
            'countries': [ 'AR' ], // Argentina
            'rateLimit': 50,
            'version': 'v1',
            // new metainfo interface
            'has': {
                'CORS': false,
                'cancelOrder': true,
                'createOrder': true,
                'fetchBalance': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/92337550-2b085500-f0b3-11ea-98e7-5794fb07dd3b.jpg',
                'api': {
                    'public': 'https://api.exchange.ripio.com/api',
                    'private': 'https://api.exchange.ripio.com/api',
                },
                'www': 'https://exchange.ripio.com',
                'doc': [
                    'https://exchange.ripio.com/en/api/',
                ],
                'fees': 'https://exchange.ripio.com/en/fee',
            },
            'api': {
                'public': {
                    'get': [
                        'rate/all/',
                        'rate/{pair}/',
                        'orderbook/{pair}/',
                        'tradehistory/{pair}/',
                        'pair/',
                        'currency/',
                        'orderbook/{pair}/depth/',
                    ],
                },
                'private': {
                    'get': [
                        'balances/exchange_balances/',
                        'order/{pair}/{order_id}/',
                        'order/{pair}/',
                        'trade/{pair}/',
                    ],
                    'post': [
                        'order/{pair}/',
                        'order/{pair}/{order_id}/cancel/',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'taker': 0.0 / 100,
                    'maker': 0.0 / 100,
                },
            },
            'precisionMode': TICK_SIZE,
            'requiredCredentials': {
                'apiKey': true,
                'secret': false,
            },
            'exceptions': {
                'exact': {
                },
                'broad': {
                    'Invalid pair': BadSymbol, // {"status_code":400,"errors":{"pair":["Invalid pair FOOBAR"]},"message":"An error has occurred, please check the form."}
                    'Disabled pair': BadSymbol, // {"status_code":400,"errors":{"pair":["Invalid/Disabled pair BTC_ARS"]},"message":"An error has occurred, please check the form."}
                    'Authentication credentials were not provided': AuthenticationError, // {"detail":"Authentication credentials were not provided."}
                    'Invalid order type': InvalidOrder, // {"status_code":400,"errors":{"order_type":["Invalid order type. Valid options: ['MARKET', 'LIMIT']"]},"message":"An error has occurred, please check the form."}
                    'not found': OrderNotFound, // {"status_code":404,"errors":{"order":["Order 286e560e-b8a2-464b-8b84-15a7e2a67eab not found."]},"message":"An error has occurred, please check the form."}
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetPair (params);
        //
        //     {
        //         "next":null,
        //         "previous":null,
        //         "results":[
        //             {
        //                 "base":"BTC",
        //                 "base_name":"Bitcoin",
        //                 "quote":"USDC",
        //                 "quote_name":"USD Coin",
        //                 "symbol":"BTC_USDC",
        //                 "fees":[
        //                     {"traded_volume":0.0,"maker_fee":0.0,"taker_fee":0.0,"cancellation_fee":0.0}
        //                 ],
        //                 "country":"ZZ",
        //                 "enabled":true,
        //                 "priority":10,
        //                 "min_amount":"0.00001",
        //                 "price_tick":"0.000001",
        //                 "min_value":"10",
        //                 "limit_price_threshold":"25.00"
        //             },
        //         ]
        //     }
        //
        const result = [];
        const results = this.safeValue (response, 'results', []);
        for (let i = 0; i < results.length; i++) {
            const market = results[i];
            const baseId = this.safeString (market, 'base');
            const quoteId = this.safeString (market, 'quote');
            const id = this.safeString (market, 'symbol');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const precision = {
                'amount': this.safeFloat (market, 'min_amount'),
                'price': this.safeFloat (market, 'price_tick'),
            };
            const limits = {
                'amount': {
                    'min': this.safeFloat (market, 'min_amount'),
                    'max': undefined,
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': this.safeFloat (market, 'min_value'),
                    'max': undefined,
                },
            };
            const active = this.safeValue (market, 'enabled', true);
            const fees = this.safeValue (market, 'fees', []);
            const firstFee = this.safeValue (fees, 0, {});
            const maker = this.safeFloat (firstFee, 'maker_fee', 0.0);
            const taker = this.safeFloat (firstFee, 'taker_fee', 0.0);
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'precision': precision,
                'maker': maker,
                'taker': taker,
                'limits': limits,
                'info': market,
                'active': active,
            });
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        const response = await this.publicGetCurrency (params);
        //
        //     {
        //         "next":null,
        //         "previous":null,
        //         "results":[
        //             {
        //                 "name":"Argentine Peso",
        //                 "symbol":"$",
        //                 "currency":"ARS",
        //                 "country":"AR",
        //                 "decimal_places":"2",
        //                 "enabled":true
        //             },
        //             {
        //                 "name":"Bitcoin Cash",
        //                 "symbol":"BCH",
        //                 "currency":"BCH",
        //                 "country":"AR",
        //                 "decimal_places":"8",
        //                 "enabled":true
        //             },
        //             {
        //                 "name":"Bitcoin",
        //                 "symbol":"BTC",
        //                 "currency":"BTC",
        //                 "country":"AR",
        //                 "decimal_places":"8",
        //                 "enabled":true
        //             }
        //         ]
        //     }
        //
        const results = this.safeValue (response, 'results', []);
        const result = {};
        for (let i = 0; i < results.length; i++) {
            const currency = results[i];
            const id = this.safeString (currency, 'currency');
            const code = this.safeCurrencyCode (id);
            const name = this.safeString (currency, 'name');
            const active = this.safeValue (currency, 'enabled', true);
            const precision = this.safeInteger (currency, 'decimal_places');
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
                    'price': { 'min': undefined, 'max': undefined },
                    'cost': { 'min': undefined, 'max': undefined },
                    'withdraw': { 'min': undefined, 'max': undefined },
                },
            };
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        //
        // fetchTicker, fetchTickers
        //
        //     {
        //         "pair":"BTC_USDC",
        //         "last_price":"10850.02",
        //         "low":"10720.03",
        //         "high":"10909.99",
        //         "variation":"1.21",
        //         "volume":"0.83868",
        //         "base":"BTC",
        //         "base_name":"Bitcoin",
        //         "quote":"USDC",
        //         "quote_name":"USD Coin",
        //         "bid":"10811.00",
        //         "ask":"10720.03",
        //         "avg":"10851.47",
        //         "ask_volume":"0.00140",
        //         "bid_volume":"0.00185",
        //         "created_at":"2020-09-28 21:44:51.228920+00:00"
        //     }
        //
        const timestamp = this.parse8601 (this.safeString (ticker, 'created_at'));
        const marketId = this.safeString (ticker, 'pair');
        let symbol = undefined;
        if (marketId !== undefined) {
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
            } else if (marketId !== undefined) {
                const [ baseId, quoteId ] = marketId.split ('_');
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            }
        }
        if ((symbol === undefined) && (market !== undefined)) {
            symbol = market['symbol'];
        }
        const last = this.safeFloat (ticker, 'last_price');
        const average = this.safeFloat (ticker, 'avg');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'bid'),
            'bidVolume': this.safeFloat (ticker, 'bid_volume'),
            'ask': this.safeFloat (ticker, 'ask'),
            'askVolume': this.safeFloat (ticker, 'ask_volume'),
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': average,
            'baseVolume': undefined,
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        const response = await this.publicGetRatePair (this.extend (request, params));
        //
        //     {
        //         "pair":"BTC_USDC",
        //         "last_price":"10850.02",
        //         "low":"10720.03",
        //         "high":"10909.99",
        //         "variation":"1.21",
        //         "volume":"0.83868",
        //         "base":"BTC",
        //         "base_name":"Bitcoin",
        //         "quote":"USDC",
        //         "quote_name":"USD Coin",
        //         "bid":"10811.00",
        //         "ask":"10720.03",
        //         "avg":"10851.47",
        //         "ask_volume":"0.00140",
        //         "bid_volume":"0.00185",
        //         "created_at":"2020-09-28 21:44:51.228920+00:00"
        //     }
        //
        return this.parseTicker (response, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetRateAll (params);
        //
        //     [
        //         {
        //             "pair":"BTC_USDC",
        //             "last_price":"10850.02",
        //             "low":"10720.03",
        //             "high":"10909.99",
        //             "variation":"1.21",
        //             "volume":"0.83868",
        //             "base":"BTC",
        //             "base_name":"Bitcoin",
        //             "quote":"USDC",
        //             "quote_name":"USD Coin",
        //             "bid":"10811.00",
        //             "ask":"10720.03",
        //             "avg":"10851.47",
        //             "ask_volume":"0.00140",
        //             "bid_volume":"0.00185",
        //             "created_at":"2020-09-28 21:44:51.228920+00:00"
        //         }
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

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'pair': this.marketId (symbol),
        };
        const response = await this.publicGetOrderbookPair (this.extend (request, params));
        //
        //     {
        //         "buy":[
        //             {"amount":"0.00230","total":"24.95","price":"10850.02"},
        //             {"amount":"0.07920","total":"858.52","price":"10840.00"},
        //             {"amount":"0.00277","total":"30.00","price":"10833.03"},
        //         ],
        //         "sell":[
        //             {"amount":"0.03193","total":"348.16","price":"10904.00"},
        //             {"amount":"0.00210","total":"22.90","price":"10905.70"},
        //             {"amount":"0.00300","total":"32.72","price":"10907.98"},
        //         ],
        //         "updated_id":47225
        //     }
        //
        const orderbook = this.parseOrderBook (response, undefined, 'buy', 'sell', 'price', 'amount');
        orderbook['nonce'] = this.safeInteger (response, 'updated_id');
        return orderbook;
    }

    parseTrade (trade, market = undefined) {
        //
        // public fetchTrades
        //
        //     {
        //         "created_at":1601322501,
        //         "amount":"0.00276",
        //         "price":"10850.020000",
        //         "side":"SELL",
        //         "pair":"BTC_USDC",
        //         "taker_fee":"0",
        //         "taker_side":"SELL",
        //         "maker_fee":"0",
        //         "taker":2577953,
        //         "maker":2577937
        //     }
        //
        const id = this.safeString (trade, 'id');
        const timestamp = this.safeTimestamp (trade, 'created_at');
        let side = this.safeString (trade, 'side');
        const takerSide = this.safeString (trade, 'taker_side');
        const takerOrMaker = (takerSide === side) ? 'taker' : 'maker';
        side = side.toLowerCase ();
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'amount');
        let cost = undefined;
        if ((amount !== undefined) && (price !== undefined)) {
            cost = amount * price;
        }
        const marketId = this.safeString (trade, 'pair');
        let symbol = undefined;
        let base = undefined;
        let quote = undefined;
        if (marketId !== undefined) {
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
                symbol = market['symbol'];
                base = market['base'];
                quote = market['quote'];
            } else {
                const [ baseId, quoteId ] = marketId.split ('_');
                base = this.safeCurrencyCode (baseId);
                quote = this.safeCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            }
        }
        if ((market !== undefined) && (symbol === undefined)) {
            symbol = market['symbol'];
            base = market['base'];
            quote = market['quote'];
        }
        const feeCost = this.safeFloat (trade, takerOrMaker + '_fee');
        const orderId = this.safeString (trade, takerOrMaker);
        let fee = undefined;
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': (side === 'buy') ? base : quote,
            };
        }
        return {
            'id': id,
            'order': orderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
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
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        const response = await this.publicGetTradehistoryPair (this.extend (request, params));
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
        return this.parseTrades (response, market, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetBalancesExchangeBalances (params);
        //
        //     [
        //         {
        //             "id":603794,
        //             "currency":"USD Coin",
        //             "symbol":"USDC",
        //             "available":"0",
        //             "locked":"0",
        //             "code":"exchange",
        //             "balance_type":"crypto"
        //         },
        //     ]
        //
        const result = { 'info': response };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const currencyId = this.safeString (balance, 'symbol');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeFloat (balance, 'available');
            account['used'] = this.safeFloat (balance, 'locked');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const uppercaseType = type.toUpperCase ();
        const uppercaseSide = side.toUpperCase ();
        const request = {
            'pair': market['id'],
            'order_type': uppercaseType, // LIMIT, MARKET
            'side': uppercaseSide, // BUY or SELL
            'amount': this.amountToPrecision (symbol, amount),
        };
        if (uppercaseType === 'LIMIT') {
            request['limit_price'] = this.priceToPrecision (symbol, price);
        }
        const response = await this.privatePostOrderPair (this.extend (request, params));
        //
        //     {
        //         "order_id": "160f523c-f6ef-4cd1-a7c9-1a8ede1468d8",
        //         "pair": "BTC_ARS",
        //         "side": "BUY",
        //         "amount": "0.00400",
        //         "notional": null,
        //         "fill_or_kill": false,
        //         "all_or_none": false,
        //         "order_type": "LIMIT",
        //         "status": "OPEN",
        //         "created_at": 1578413945,
        //         "filled": "0.00000",
        //         "limit_price": "10.00",
        //         "stop_price": null,
        //         "distance": null
        //     }
        //
        return this.parseOrder (response, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
            'order_id': id,
        };
        const response = await this.privatePostOrderPairOrderIdCancel (this.extend (request, params));
        //
        //     {
        //         "order_id": "286e560e-b8a2-464b-8b84-15a7e2a67eab",
        //         "pair": "BTC_ARS",
        //         "side": "SELL",
        //         "amount": "0.00100",
        //         "notional": null,
        //         "fill_or_kill": false,
        //         "all_or_none": false,
        //         "order_type": "LIMIT",
        //         "status": "CANC",
        //         "created_at": 1575472707,
        //         "filled": "0.00000",
        //         "limit_price": "681000.00",
        //         "stop_price": null,
        //         "distance": null
        //     }
        //
        return this.parseOrder (response, market);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
            'order_id': id,
        };
        const response = await this.privateGetOrderPairOrderId (this.extend (request, params));
        //
        //     {
        //         "order_id": "0b4ff48e-cfd6-42db-8d8c-3b536da447af",
        //         "pair": "BTC_ARS",
        //         "side": "BUY",
        //         "amount": "0.00100",
        //         "notional": null,
        //         "fill_or_kill": false,
        //         "all_or_none": false,
        //         "order_type": "LIMIT",
        //         "status": "OPEN",
        //         "created_at": 1575472944,
        //         "filled": "0.00000",
        //         "limit_price": "661000.00",
        //         "stop_price": null,
        //         "distance": null
        //     }
        //
        return this.parseOrder (response, market);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
            // OPEN: Open order available to be fill in the orderbook.
            // PART: Partially filled order, the remaining amount to fill remains in the orderbook.
            // CLOS: Order was cancelled before be fully filled but the amount already filled amount is traded.
            // CANC: Order was cancelled before any fill.
            // COMP: Order was fully filled.
            // 'status': 'OPEN,PART,CLOS,CANC,COMP', // SUBMITTED, PROCESSING, PARTIAL_FILLED, CANCELING, FILLED, CANCELED, REJECTED
            // 'page_size': limit, // default 25
            // 'offset': 20,
            // 'limit': 20,
            // 'page': 1,
        };
        if (limit !== undefined) {
            request['page_size'] = limit; // default 100, max 100
        }
        const response = await this.privateGetOrderPair (this.extend (request, params));
        //
        //     {
        //         "next": "https://api.exchange.ripio.com/api/v1/order/BTC_ARS/?limit=20&offset=20&page=1&page_size=25&status=OPEN%2CPART",
        //         "previous": null,
        //         "results": {
        //             "data": [
        //                 {
        //                     "order_id": "ca74280b-6966-4b73-a720-68709078922b",
        //                     "pair": "BTC_ARS",
        //                     "side": "SELL",
        //                     "amount": "0.00100",
        //                     "notional": null,
        //                     "fill_or_kill": false,
        //                     "all_or_none": false,
        //                     "order_type": "LIMIT",
        //                     "status": "OPEN",
        //                     "created_at": 1578340134,
        //                     "filled": "0.00000",
        //                     "limit_price": "665000.00",
        //                     "stop_price": null,
        //                     "distance": null
        //                 },
        //             ]
        //         }
        //     }
        //
        const results = this.safeValue (response, 'results', {});
        const data = this.safeValue (results, 'data', []);
        return this.parseOrders (data, market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'status': 'OPEN,PART',
        };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'status': 'CLOS,CANC,COMP',
        };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    parseOrderStatus (status) {
        const statuses = {
            'OPEN': 'open',
            'PART': 'open',
            'CLOS': 'canceled',
            'CANC': 'canceled',
            'COMP': 'closed',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        // createOrder, cancelOrder, fetchOpenOrders, fetchClosedOrders, fetchOrders, fetchOrder
        //
        //
        //     {
        //         "order_id": "286e560e-b8a2-464b-8b84-15a7e2a67eab",
        //         "pair": "BTC_ARS",
        //         "side": "SELL",
        //         "amount": "0.00100",
        //         "notional": null,
        //         "fill_or_kill": false,
        //         "all_or_none": false,
        //         "order_type": "LIMIT",
        //         "status": "CANC",
        //         "created_at": 1575472707,
        //         "filled": "0.00000",
        //         "limit_price": "681000.00",
        //         "stop_price": null,
        //         "distance": null
        //     }
        //
        const id = this.safeString (order, 'order_id');
        const amount = this.safeFloat (order, 'amount');
        const price = this.safeFloat (order, 'limit_price');
        let cost = this.safeFloat (order, 'notional');
        const type = this.safeStringLower (order, 'order_type');
        const side = this.safeStringLower (order, 'side');
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const timestamp = this.safeTimestamp (order, 'timestamp');
        const average = this.safeFloat (order, 'created_at');
        const filled = this.safeFloat (order, 'filled');
        let remaining = undefined;
        if (filled !== undefined) {
            if ((cost === undefined) && (price !== undefined)) {
                cost = price * filled;
            }
            if (amount !== undefined) {
                remaining = Math.max (0, amount - filled);
            }
        }
        let symbol = undefined;
        const marketId = this.safeString (order, 'pair');
        if (marketId !== undefined) {
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
            } else {
                const [ baseId, quoteId ] = marketId.split ('_');
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            }
        }
        if ((symbol === undefined) && (market !== undefined)) {
            symbol = market['symbol'];
        }
        return {
            'id': id,
            'clientOrderId': undefined,
            'info': order,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
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
            'fee': undefined,
            'trades': undefined,
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
        //
        //      {"detail":"Authentication credentials were not provided."}
        //      {"status_code":400,"errors":{"pair":["Invalid pair FOOBAR"]},"message":"An error has occurred, please check the form."}
        //      {"status_code":400,"errors":{"order_type":["Invalid order type. Valid options: ['MARKET', 'LIMIT']"]},"message":"An error has occurred, please check the form."}
        //      {"status_code":400,"errors":{"non_field_errors":"Something unexpected ocurred!"},"message":"Seems like an unexpected error occurred. Please try again later or write us to support@ripio.com if the problem persists."}
        //      {"status_code":400,"errors":{"pair":["Invalid/Disabled pair BTC_ARS"]},"message":"An error has occurred, please check the form."}
        //
        const detail = this.safeString (response, 'detail');
        if (detail !== undefined) {
            const feedback = this.id + ' ' + body;
            // this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], detail, feedback);
        }
        const errors = this.safeValue (response, 'errors');
        if (errors !== undefined) {
            const feedback = this.id + ' ' + body;
            const keys = Object.keys (errors);
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                const error = this.safeValue (errors, key, []);
                const message = this.safeString (error, 0);
                // this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
                this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            }
            throw new ExchangeError (feedback); // unknown message
        }
    }
};
