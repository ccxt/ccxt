'use strict';

//  ---------------------------------------------------------------------------
const timexRest = require ('../timex');
const Precise = require ('../base/Precise');
const { ArgumentsRequired, ExchangeError } = require ('../base/errors');
const { ArrayCache, ArrayCacheBySymbolById } = require ('./base/Cache');

//  ---------------------------------------------------------------------------

module.exports = class timex extends timexRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': true,
                'watchTicker': false, // Documentation on how to subscribe but no response is received
                'watchTickers': false,
                'watchTrades': true,
                'watchMyTrades': false,
                'watchOrders': true,
                'watchOrderBook': true,
                'watchOHLCV': false,
            },
            'urls': {
                'api': {
                    'ws': 'wss://plasma-relay-backend.timex.io/socket/relay',
                },
            },
            'options': {
            },
            'timeframes': {
                '1m': 'I1',
                '5m': 'I5',
                '15m': 'I15',
                '30m': 'I30',
                '1h': 'H1',
                '2h': 'H2',
                '4h': 'H4',
                '6h': 'H6',
                '12h': 'H12',
                '1d': 'D1',
                '1w': 'W1',
            },
            'streaming': {
            },
            'exceptions': {
            },
        });
    }

    requestId () {
        const requestId = this.sum (this.safeInteger (this.options, 'requestId', 0), 1);
        this.options['requestId'] = requestId;
        return requestId;
    }

    async watchBalance (params = {}) {
        /**
         * @method
         * @name timex#watchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @see https://docs.timex.io/websocket-api-general.html#subscribe-account-to-channels
         * @param {object} params extra parameters specific to the timex api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        this.checkRequiredCredentials ();
        const wallet = this.safeString2 (params, 'wallet', 'walletAddress', this.wallet);
        if (wallet === undefined) {
            throw new ArgumentsRequired (this.id + ' watchBalance() requires a walletAddress parameter');
        }
        params = this.omit (params, [ 'wallet', 'walletAddress' ]);
        const messageHash = 'balances';
        const url = this.urls['api']['ws'];
        const subscribe = {
            'type': 'ACCOUNT_SUBSCRIBE',
            'requestId': this.requestId (),
            'account': this.wallet,
            'auth': {
                'id': this.apiKey,
                'secret': this.secret,
            },
            'snapshot': true,
        };
        const subscriptionHash = 'account';
        const request = this.deepExtend (subscribe, params);
        return await this.watch (url, messageHash, request, subscriptionHash);
    }

    handleBalance (client, message) {
        //
        //  snapshot
        //     {
        //         type: "SUBSCRIBED",
        //         requestId: "1",
        //         subscriptionId: "8cfb653f-9397-4f55-958f-e4ef3635843c",
        //         payload: {
        //             snapshot: {
        //                 balances: [
        //                     {
        //                         currency: "TIME",
        //                         totalBalance: "0.0404237241634375",
        //                         lockedBalance: "0",
        //                     },
        //                     ...
        //                 ],
        //             },
        //         },
        //     }
        //  update
        //     {
        //         type: "ACCOUNT_SUBSCRIPTION",
        //         subscriptionId: "95428897-d91a-43e6-9c9e-cebb28fc7b39",
        //         payload: {
        //             balance: {
        //                 currency: "USDT",
        //                 totalBalance: "16.54435572",
        //                 lockedBalance: "0",
        //             },
        //         },
        //     }
        //
        const payload = this.safeValue (message, 'payload', {});
        if (this.balance === undefined) {
            this.balance = {};
        }
        let result = this.balance;
        const snapshot = this.safeValue (payload, 'snapshot', {});
        const balances = this.safeValue (snapshot, 'balances');
        if (balances !== undefined) {
            result = this.parseBalance (balances);
        }
        const balance = this.safeValue (payload, 'balance');
        if (balance !== undefined) {
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['total'] = this.safeString (balance, 'totalBalance');
            account['used'] = this.safeString (balance, 'lockedBalance');
            result[code] = account;
        }
        this.balance = this.safeBalance (result);
        client.resolve (this.balance, 'balances');
    }

    async watchTicker (symbol, params = {}) {
        /**
         * @method
         * @name timex#watchTicker
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://docs.timex.io/websocket-api-list-patterns.html#ticker
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the timex api endpoint
         * @param {string} params.period period of ticker, can be sent in ccxt unified or format or exchange I1, I5, I15, I30, H1, H2, H4, H6, H12, D1, W1
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = this.symbol (symbol);
        const url = this.urls['api']['ws'];
        const messageHash = 'ticker:' + symbol;
        let period = this.safeString (params, 'period', 'D1');
        period = this.safeString (this.timeframes, period, period);
        params = this.omit (params, 'period');
        const message = {
            'type': 'SUBSCRIBE',
            'requestId': this.requestId (),
            'pattern': '/ticker/' + market['id'] + '/' + period,
        };
        const request = this.deepExtend (message, params);
        return await this.watch (url, messageHash, request, messageHash, request);
    }

    async watchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name timex#watchTrades
         * @description get the list of most recent trades for a particular symbol
         * @see https://docs.timex.io/websocket-api-list-patterns.html#trade
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the timex api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const url = this.urls['api']['ws'];
        const messageHash = 'trades:' + symbol;
        const message = {
            'type': 'SUBSCRIBE',
            'requestId': 'uniqueID',
            'pattern': '/trade.symbols/' + market['base'] + '/' + market['quote'],
        };
        const request = this.deepExtend (message, params);
        const trades = await this.watch (url, messageHash, request, messageHash, request);
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleTrades (client, message) {
        //
        //      {
        //          timestamp: '2022-09-10T16:46:26.584',
        //          type: 'TRADE',
        //          reference: '30688731',
        //          topics: ["BTC", "USDT","0x8370fbc6ddec1e18b4e41e72ed943e238458487c","0xdac17f958d2ee523a2206206994597c13d831ec7"],
        //          data: {
        //              id: 30688846,
        //              direction: "SELL",
        //              baseTokenAddress: "0x8370fbc6ddec1e18b4e41e72ed943e238458487c",
        //              quoteTokenAddress: "0xdac17f958d2ee523a2206206994597c13d831ec7",
        //              baseTokenSymbol: "BTC",
        //              quoteTokenSymbol: "USDT",
        //              baseTokenAmount: "500000000000000000",
        //              quoteTokenAmount: "1066450000000000000",
        //              makerAddress: "0xc2af39e7039462893d6e540be4dc6b1a447b42ab",
        //              takerAddress: "0xc2af39e7039462893d6e540be4dc6b1a447b42ab",
        //          }
        //      }
        //
        const data = this.safeValue (message, 'data', {});
        const base = this.safeString (data, 'baseTokenSymbol');
        const quote = this.safeString (data, 'quoteTokenSymbol');
        const marketId = base + quote;
        const symbol = this.safeSymbol (marketId);
        const market = this.safeMarket (marketId);
        const dateTime = this.safeString (message, 'timestamp');
        const timestamp = this.parse8601 (dateTime);
        const messageHash = 'trades:' + symbol;
        let stored = this.safeValue (this.trades, symbol);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            stored = new ArrayCache (limit);
            this.trades[symbol] = stored;
        }
        const parsed = this.parseWsTrade (data, market);
        parsed['timestamp'] = timestamp;
        parsed['datetime'] = dateTime;
        stored.append (parsed);
        this.trades[symbol] = stored;
        client.resolve (this.trades[symbol], messageHash);
    }

    parseWsTrade (trade, market = undefined) {
        //
        //     {
        //         "id": 13384,
        //         "direction": "BUY",
        //         "baseTokenAddress": "0x6baad3fe5d0fd4be604420e728adbd68d67e119e",
        //         "quoteTokenAddress": "0x14067be7a55defaaf094b324a7010136e072d6f5",
        //         "baseTokenSymbol": "TIME",
        //         "quoteTokenSymbol": "ETH",
        //         "baseTokenAmount": 2014400000000000000,
        //         "quoteTokenAmount": 31726800000000000000000000000,
        //         "makerAddress": "0x1134cc86b45039cc211c6d1d2e4b3c77f60207ed",
        //         "takerAddress": "0x1134cc86b45039cc211c6d1d2e4b3c77f60207ed"
        //     }
        //
        const baseId = this.safeString (trade, 'baseTokenSymbol');
        const base = this.safeCurrencyCode (baseId);
        const baseTradeAmount = this.safeString (trade, 'baseTokenAmount');
        const baseAmount = this.parseTradeAmount (baseId, baseTradeAmount);
        const quoteId = this.safeString (trade, 'quoteTokenSymbol');
        const quote = this.safeCurrencyCode (quoteId);
        const symbol = base + '/' + quote;
        const quoteTradeAmount = this.safeString (trade, 'quoteTokenAmount');
        const quoteAmount = this.parseTradeAmount (quoteId, quoteTradeAmount);
        const price = Precise.stringDiv (quoteAmount, baseAmount);
        return this.safeTrade ({
            'info': trade,
            'id': this.safeString (trade, 'id'),
            'timestamp': undefined,
            'datetime': undefined,
            'symbol': symbol,
            'order': undefined,
            'type': undefined,
            'side': this.safeStringLower (trade, 'direction'),
            'price': price,
            'amount': baseAmount,
            'cost': undefined,
            'takerOrMaker': undefined,
            'fee': undefined,
        });
    }

    parseTradeAmount (code, amount) {
        const currency = this.safeCurrency (code);
        const tradeDecimals = this.safeString (currency['info'], 'tradeDecimals');
        const tradePrecision = this.parsePrecision (tradeDecimals);
        return Precise.stringMul (amount, tradePrecision);
    }

    async watchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name timex#watchOrders
         * @description watches information on multiple orders made by the user
         * @see https://docs.timex.io/websocket-api-general.html#subscribe-account-to-channels
         * @param {string|undefined} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the timex api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        this.checkRequiredCredentials ();
        if (symbol !== undefined) {
            await this.loadMarkets ();
            symbol = this.symbol (symbol);
        }
        const wallet = this.safeString2 (params, 'wallet', 'walletAddress', this.wallet);
        if (wallet === undefined) {
            throw new ArgumentsRequired (this.id + ' watchOrders() requires a walletAddress parameter');
        }
        params = this.omit (params, [ 'wallet', 'walletAddress' ]);
        const url = this.urls['api']['ws'];
        const messageHash = 'orders';
        const subscribe = {
            'type': 'ACCOUNT_SUBSCRIBE',
            'requestId': this.requestId (),
            'account': this.wallet,
            'auth': {
                'id': this.apiKey,
                'secret': this.secret,
            },
            'snapshot': true,
        };
        const subscriptionHash = 'account';
        const request = this.deepExtend (subscribe, params);
        const orders = await this.watch (url, messageHash, request, subscriptionHash);
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit, true);
    }

    handleOrders (client, message) {
        //
        //  snapshot
        //     {
        //         type: "SUBSCRIBED",
        //         requestId: "1",
        //         subscriptionId: "80a881cf-915b-4dbd-969c-428dacf2eb47",
        //         payload: {
        //             snapshot: {
        //                 openOrders: [{
        //                     market: "TIMEUSDT",
        //                     orders: [{
        //                         id: "0x6877b8610671ec535b71a46f4d73612e34015a5f73cb6dc41f31ac759f9d0c34",
        //                         cursorId: 1888127724,
        //                         clientOrderId: null,
        //                         symbol: "TIMEUSDT",
        //                         side: "BUY",
        //                         type: "LIMIT",
        //                         quantity: "0.01",
        //                         filledQuantity: "0",
        //                         cancelledQuantity: "0",
        //                         price: "10",
        //                         avgPrice: null,
        //                         createdAt: "2022-09-18T03:18:57.134Z",
        //                         updatedAt: "2022-09-18T03:18:57.134Z",
        //                         expireTime: "2023-09-18T03:18:57.133Z",
        //                     }, ],
        //                     pageNumber: 0,
        //                     totalPageCount: 1,
        //                 }, ],
        //             },
        //         },
        //     }
        //  update
        //     {
        //         type: "ACCOUNT_SUBSCRIPTION",
        //         subscriptionId: "0fa7329d-6f66-4252-8b82-83aedf1d0ffd",
        //         payload: {
        //             order: {
        //                 id: "0xa92828dfa18aeaa0eab70e7dbdfa55045fbfed05f1d3b93a3ae1c533ddbca50b",
        //                 cursorId: 1888139469,
        //                 clientOrderId: null,
        //                 symbol: "TIMEUSDT",
        //                 side: "BUY",
        //                 type: "LIMIT",
        //                 quantity: "0.01",
        //                 filledQuantity: "0",
        //                 cancelledQuantity: "0",
        //                 price: "10",
        //                 avgPrice: null,
        //                 createdAt: "2022-09-18T03:27:35.275Z",
        //                 updatedAt: "2022-09-18T03:27:35.275Z",
        //                 expireTime: "2023-09-18T03:27:35.262Z",
        //             },
        //             messageType: "ORDER",
        //             orderStatus: "ACTIVE",
        //         }
        //     }
        //
        if (this.orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            this.orders = new ArrayCacheBySymbolById (limit);
        }
        const stored = this.orders;
        const payload = this.safeValue (message, 'payload', {});
        const snapshot = this.safeValue (payload, 'snapshot', {});
        const openOrdersByMarket = this.safeValue (snapshot, 'openOrders', []);
        for (let i = 0; i < openOrdersByMarket.length; i++) {
            const openOrders = openOrdersByMarket[i];
            const rawOrders = this.safeValue (openOrders, 'orders', []);
            for (let j = 0; j < rawOrders.length; j++) {
                const rawOrder = rawOrders[j];
                const order = this.parseOrder (rawOrder);
                stored.append (order);
            }
        }
        const rawOrder = this.safeValue (payload, 'order');
        if (rawOrder !== undefined) {
            const order = this.parseOrder (rawOrder);
            stored.append (order);
        }
        client.resolve (stored, 'orders');
    }

    async watchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name timex#watchOrderBook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://docs.timex.io/websocket-api-list-patterns.html#order-book
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the timex api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const url = this.urls['api']['ws'];
        const messageHash = 'orderbook:' + symbol;
        const subscribe = {
            'type': 'SUBSCRIBE',
            'requestId': this.requestId (),
            'pattern': '/orderbook.raw/' + market['id'],
            'snapshot': true,
        };
        const request = this.deepExtend (subscribe, params);
        const orderbook = await this.watch (url, messageHash, request, messageHash);
        return orderbook.limit (limit);
    }

    handleOrderBook (client, message) {
        //
        //     {
        //         "timestamp": "2019-07-12T11:36:35.98",
        //         "type": "RAW_ORDER_BOOK_UPDATED",
        //         "reference": "TIMEBTC",
        //         "topics": ["TIMEBTC"],
        //         "data": {
        //             "market": "TIMEBTC",
        //             "rawOrderBook": {
        //                 "timestamp": "2019-07-12T11:36:35.967",
        //                 "bid": [
        //                     {
        //                         "market": "TIMEBTC",
        //                         "hash": "0x06072180e86dc95e12a68870f39536c1362220f64432e8d377cb064fc888ff82",
        //                         "direction": "BUY",
        //                         "quantity": "38.464219",
        //                         "price": "0.00030133",
        //                         "createdAt": "2019-07-12T11:34:55.498",
        //                         "expiredAt": "2019-07-12T11:40:53.618"
        //                     }
        //                     ...
        //                 ],
        //                 "ask": [
        //                     {
        //                         "market": "TIMEBTC",
        //                         "hash": "0x9ed45ce8b944c822aeeb811aa4018a8172c1fc327f5ee76c66332735f3df98a0",
        //                         "direction": "SELL",
        //                         "quantity": "0.1",
        //                         "price": "0.00031237",
        //                         "createdAt": "2019-07-12T11:36:27.557",
        //                         "expiredAt": "2019-07-12T11:42:07.623"
        //                     }
        //                     ...
        //                 ]
        //             }
        //         }
        //     }
        //
        const data = this.safeValue (message, 'data', {});
        const marketId = this.safeString (data, 'market');
        const symbol = this.safeSymbol (marketId);
        const rawOrderBook = this.safeValue (data, 'rawOrderBook', {});
        const messageHash = 'orderbook:' + symbol;
        const dateTime = this.safeString (rawOrderBook, 'timestamp');
        const timestamp = this.parse8601 (dateTime);
        let storedOrderBook = this.safeValue (this.orderbooks, symbol);
        if (storedOrderBook === undefined) {
            storedOrderBook = this.orderBook ({});
            this.orderbooks[symbol] = storedOrderBook;
        }
        const snapshot = this.parseOrderBook (rawOrderBook, symbol, timestamp, 'bid', 'ask', 'price', 'quantity');
        storedOrderBook.reset (snapshot);
        client.resolve (storedOrderBook, messageHash);
    }

    handleDelta (bookside, delta) {
        const bidAsk = this.parseBidAsk (delta, 0, 1);
        bookside.storeArray (bidAsk);
    }

    handleDeltas (bookside, deltas) {
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta (bookside, deltas[i]);
        }
    }

    handleErrorMessage (client, message) {
        //
        //     {
        //         "requestId": "uniqueID",
        //         "status": "ERROR",
        //         "message": "message"
        //     }
        throw new ExchangeError (this.id + ' ' + this.json (message));
    }

    handleAccountSubscription (client, message) {
        //
        //     {
        //         type: "ACCOUNT_SUBSCRIPTION",
        //         subscriptionId: "95428897-d91a-43e6-9c9e-cebb28fc7b39",
        //         payload: {
        //             order: {
        //                 id: "0x70aa356e1bb081878149b139410539dea1e341509af591a35bc7d3757939815e",
        //                 cursorId: 1888097805,
        //                 clientOrderId: null,
        //                 symbol: "TIMEUSDT",
        //                 side: "BUY",
        //                 type: "MARKET",
        //                 quantity: "0.01",
        //                 filledQuantity: "0.01",
        //                 cancelledQuantity: "0",
        //                 price: "64",
        //                 avgPrice: "64",
        //                 createdAt: "2022-09-18T02:57:06.899Z",
        //                 updatedAt: "2022-09-18T02:57:06.906Z",
        //                 expireTime: "2022-09-18T02:57:06.898Z",
        //             },
        //             messageType: "MARKET_ORDER",
        //             orderStatus: "FILLED",
        //             tradeInfo: [{
        //                 tradeId: 30978252,
        //                 tradePrice: "64",
        //                 tradeQuantity: "0.01",
        //             }, ],
        //         },
        //     }
        //
        const payload = this.safeValue (message, 'payload');
        if ('balance' in payload) {
            this.handleBalance (client, message);
        }
        if ('order' in payload) {
            this.handleOrders (client, message);
        }
    }

    handleSubscribed (client, message) {
        //
        //     {
        //         type: 'SUBSCRIBED',
        //         requestId: '1',
        //         subscriptionId: '74a98984-df2b-452a-93ed-309e86389e3d',
        //         payload: {
        //             snapshot: {
        //                 balances: [Array],
        //                 openOrders: [Array]
        //             }
        //         }
        //     }
        //
        const payload = this.safeValue (message, 'payload', {});
        const snapshot = this.safeValue (payload, 'snapshot');
        if (snapshot !== undefined) {
            this.handleBalance (client, message);
            this.handleOrders (client, message);
        }
    }

    handleTypeMessage (client, message) {
        const messageData = this.safeValue (message, 'message', {});
        const event = this.safeValue (messageData, 'event', {});
        const type = this.safeString (event, 'type');
        const handlers = {
            'RAW_ORDER_BOOK_UPDATED': this.handleOrderBook,
            'GROUP_ORDER_BOOK_UPDATED': this.handleOrderBook,
            'ORDER_BOOK_UPDATED': this.handleOrderBook,
            'ORDER': this.handleOrders,
            'ORDER_UPDATE': this.handleOrders,
            'ORDER_EXPIRED': this.handleOrders,
            'FILLING': this.handleOrders,
            'TRADE': this.handleTrades,
        };
        const handler = this.safeValue (handlers, type);
        if (handler !== undefined) {
            return handler.call (this, client, event);
        }
    }

    handleMessage (client, message) {
        const status = this.safeString (message, 'status');
        if (status === 'ERROR') {
            return this.handleErrorMessage (client, message);
        }
        const type = this.safeString (message, 'type');
        const handlers = {
            'MESSAGE': this.handleTypeMessage,
            'ACCOUNT_SUBSCRIPTION': this.handleAccountSubscription,
            'SUBSCRIBED': this.handleSubscribed,
        };
        const handler = this.safeValue (handlers, type);
        if (handler !== undefined) {
            return handler.call (this, client, message);
        }
        return message;
    }
};
