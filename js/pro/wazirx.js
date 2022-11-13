'use strict';

//  ---------------------------------------------------------------------------

const wazirxRest = require ('../wazirx');
const { NotSupported, ExchangeError } = require ('../base/errors');
const { ArrayCacheBySymbolById } = require ('./base/Cache');

//  ---------------------------------------------------------------------------

module.exports = class wazirx extends wazirxRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': true,
                'watchTicker': true,
                'watchTickers': true,
                'watchTrades': false,
                'watchMyTrades': true,
                'watchOrders': true,
                'watchOrderBook': true,
                'watchOHLCV': false,
            },
            'urls': {
                'api': {
                    'ws': 'wss://stream.wazirx.com/stream',
                },
            },
            'options': {
            },
            'streaming': {
            },
            'exceptions': {
            },
            'api': {
                'private': {
                    'post': {
                        'create_auth_token': 1,
                    },
                },
            },
        });
    }

    async watchBalance (params = {}) {
        /**
         * @method
         * @name wazirx#watchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @see https://docs.wazirx.com/#account-update
         * @param {object} params extra parameters specific to the wazirx api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        const token = await this.authenticate (params);
        const messageHash = 'balance';
        const url = this.urls['api']['ws'];
        const subscribe = {
            'event': 'subscribe',
            'streams': [ 'outboundAccountPosition' ],
            'auth_key': token,
        };
        const request = this.deepExtend (subscribe, params);
        return await this.watch (url, messageHash, request, messageHash);
    }

    handleBalance (client, message) {
        //
        //     {
        //         "data":
        //         {
        //           "B": [
        //             {
        //               "a":"wrx",
        //               "b":"2043856.426455209",
        //               "l":"3001318.98"
        //             }
        //           ],
        //           "E":1631683058909
        //         },
        //         "stream":"outboundAccountPosition"
        //     }
        //
        const data = this.safeValue (message, 'data', {});
        const balances = this.safeValue (data, 'B', []);
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString (balance, 'a');
            const code = this.safeCurrencyCode (currencyId);
            const available = this.safeNumber (balance, 'b');
            const locked = this.safeNumber (balance, 'l');
            const account = this.account ();
            account['free'] = available;
            account['used'] = locked;
            this.balance[code] = account;
        }
        this.balance = this.safeBalance (this.balance);
        const messageHash = 'balance';
        client.resolve (this.balance, messageHash);
    }

    parseWSTrade (trade, market = undefined) {
        //
        //     {
        //         "E": 1631683058000,
        //         "S": "ask",
        //         "U": "inr",
        //         "a": 114144050,
        //         "b": 114144121,
        //         "f": "0.2",
        //         "m": true,
        //         "o": 26946170,
        //         "p": "5.0",
        //         "q": "20.0",
        //         "s": "btcinr",
        //         "t": 17376032,
        //         "w": "100.0"
        //     }
        //
        const timestamp = this.safeNumber (trade, 'E');
        const marketId = this.safeString (trade, 's');
        market = this.safeMarket (marketId, market);
        const feeCurrencyId = this.safeString (trade, 'U');
        return this.safeTrade ({
            'id': this.safeString (trade, 'id'),
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'order': this.safeString (trade, 'o'),
            'type': undefined,
            'side': undefined,
            'takerOrMaker': this.safeValue (trade, 'm'),
            'price': this.safeString (trade, 'p'),
            'amount': this.safeString (trade, 'q'),
            'cost': undefined,
            'fee': {
                'cost': this.safeString (trade, 'f'),
                'currency': this.safeCurrencyCode (feeCurrencyId),
                'rate': undefined,
            },
        }, market);
    }

    async watchTicker (symbol, params = {}) {
        /**
         * @method
         * @name wazirx#watchTicker
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://docs.wazirx.com/#all-market-tickers-stream
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the wazirx api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const url = this.urls['api']['ws'];
        const messageHash = 'ticker:' + market['symbol'];
        const subscribeHash = 'tickers';
        const subscribe = {
            'event': 'subscribe',
            'streams': [ '!ticker@arr' ],
        };
        const request = this.deepExtend (subscribe, params);
        return await this.watch (url, messageHash, request, subscribeHash);
    }

    async watchTickers (symbols = undefined, params = {}) {
        /**
         * @method
         * @name wazirx#watchTickers
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
         * @see https://docs.wazirx.com/#all-market-tickers-stream
         * @param {Array} symbols unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the wazirx api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const url = this.urls['api']['ws'];
        const messageHash = 'tickers';
        const subscribe = {
            'event': 'subscribe',
            'streams': [ '!ticker@arr' ],
        };
        const request = this.deepExtend (subscribe, params);
        const tickers = await this.watch (url, messageHash, request, messageHash);
        return this.filterByArray (tickers, 'symbol', symbols, false);
    }

    handleTicker (client, message) {
        //
        //     {
        //         "data":
        //         [
        //           {
        //             "E":1631625534000,    // Event time
        //             "T":"SPOT",           // Type
        //             "U":"wrx",            // Quote unit
        //             "a":"0.0",            // Best sell price
        //             "b":"0.0",            // Best buy price
        //             "c":"5.0",            // Last price
        //             "h":"5.0",            // High price
        //             "l":"5.0",            // Low price
        //             "o":"5.0",            // Open price
        //             "q":"0.0",            // Quantity
        //             "s":"btcwrx",         // Symbol
        //             "u":"btc"             // Base unit
        //           }
        //         ],
        //         "stream":"!ticker@arr"
        //     }
        //
        const data = this.safeValue (message, 'data', []);
        for (let i = 0; i < data.length; i++) {
            const ticker = data[i];
            const parsedTicker = this.parseWSTicker (ticker);
            const symbol = parsedTicker['symbol'];
            this.tickers[symbol] = parsedTicker;
            const messageHash = 'ticker:' + symbol;
            client.resolve (parsedTicker, messageHash);
        }
        client.resolve (this.tickers, 'tickers');
    }

    parseWSTicker (ticker, market = undefined) {
        //
        //     {
        //         "E":1631625534000,    // Event time
        //         "T":"SPOT",           // Type
        //         "U":"wrx",            // Quote unit
        //         "a":"0.0",            // Best sell price
        //         "b":"0.0",            // Best buy price
        //         "c":"5.0",            // Last price
        //         "h":"5.0",            // High price
        //         "l":"5.0",            // Low price
        //         "o":"5.0",            // Open price
        //         "q":"0.0",            // Quantity
        //         "s":"btcwrx",         // Symbol
        //         "u":"btc"             // Base unit
        //     }
        //
        const marketId = this.safeString (ticker, 's');
        const timestamp = this.safeNumber (ticker, 'E');
        return this.safeTicker ({
            'symbol': this.safeSymbol (marketId, market),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'h'),
            'low': this.safeString (ticker, 'l'),
            'bid': this.safeNumber (ticker, 'b'),
            'bidVolume': undefined,
            'ask': this.safeNumber (ticker, 'a'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeString (ticker, 'o'),
            'close': undefined,
            'last': this.safeString (ticker, 'l'),
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': this.safeString (ticker, 'q'),
            'info': ticker,
        }, market);
    }

    async watchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name wazirx#watchMyTrades
         * @description watch trades by user
         * @see https://docs.wazirx.com/#trade-update
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the wazirx api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const token = await this.authenticate (params);
        if (symbol !== undefined) {
            const market = this.market (symbol);
            symbol = market['symbol'];
        }
        const url = this.urls['api']['ws'];
        const messageHash = 'myTrades';
        const message = {
            'event': 'subscribe',
            'streams': [ 'ownTrade' ],
            'auth_key': token,
        };
        const request = this.deepExtend (message, params);
        const trades = await this.watch (url, messageHash, request, messageHash);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (trades, symbol, since, limit, true);
    }

    async watchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name wazirx#watchOrderBook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://docs.wazirx.com/#depth-stream
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the wazirx api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const url = this.urls['api']['ws'];
        const messageHash = 'orderbook:' + symbol;
        const stream = market['id'] + '@depth';
        const subscribe = {
            'event': 'subscribe',
            'streams': [ stream ],
        }; // TODO check if replaces all streams
        const request = this.deepExtend (subscribe, params);
        const orderbook = await this.watch (url, messageHash, request, messageHash);
        return orderbook.limit (limit);
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

    handleOrderBook (client, message) {
        //
        //     {
        //         "data": {
        //             "E": 1659475095000,
        //             "a": [
        //                 ["23051.0", "1.30141"],
        //             ],
        //             "b": [
        //                 ["22910.0", "1.30944"],
        //             ],
        //             "s": "btcusdt"
        //         },
        //         "stream": "btcusdt@depth"
        //     }
        //
        const data = this.safeValue (message, 'data', {});
        const timestamp = this.safeNumber (data, 'E');
        const marketId = this.safeString (data, 's');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const messageHash = 'orderbook:' + symbol;
        const currentOrderBook = this.safeValue (this.orderbooks, symbol);
        if (currentOrderBook === undefined) {
            const snapshot = this.parseOrderBook (data, symbol, timestamp, 'a', 'b');
            const orderBook = this.orderBook (snapshot);
            this.orderbooks[symbol] = orderBook;
        } else {
            const asks = this.safeValue (data, 'a', []);
            const bids = this.safeValue (data, 'b', []);
            this.handleDeltas (currentOrderBook['asks'], asks);
            this.handleDeltas (currentOrderBook['bids'], bids);
            currentOrderBook['nonce'] = timestamp;
            currentOrderBook['timestamp'] = timestamp;
            currentOrderBook['datetime'] = this.iso8601 (timestamp);
            this.orderbooks[symbol] = currentOrderBook;
        }
        client.resolve (this.orderbooks[symbol], messageHash);
    }

    async watchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        if (symbol !== undefined) {
            const market = this.market (symbol);
            symbol = market['symbol'];
        }
        const token = await this.authenticate (params);
        const messageHash = 'orders';
        const message = {
            'event': 'subscribe',
            'streams': [ 'orderUpdate' ],
            'auth_key': token,
        };
        const url = this.urls['api']['ws'];
        const request = this.deepExtend (message, params);
        const orders = await this.watch (url, messageHash, request, messageHash, request);
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit, true);
    }

    handleOrder (client, message) {
        //
        //     {
        //         "data": {
        //             "E": 1631683058904,
        //             "O": 1631683058000,
        //             "S": "ask",
        //             "V": "70.0",
        //             "X": "wait",
        //             "i": 26946170,
        //             "m": true,
        //             "o": "sell",
        //             "p": "5.0",
        //             "q": "70.0",
        //             "s": "wrxinr",
        //             "v": "0.0"
        //         },
        //         "stream": "orderUpdate"
        //     }
        //
        const order = this.safeValue (message, 'data', {});
        const parsedOrder = this.parseWSOrder (order);
        if (this.orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            this.orders = new ArrayCacheBySymbolById (limit);
        }
        this.orders.append (parsedOrder);
        let messageHash = 'orders';
        client.resolve (this.orders, messageHash);
        messageHash += ':' + parsedOrder['symbol'];
        client.resolve (this.orders, messageHash);
    }

    parseWSOrder (order) {
        //
        //     {
        //         "E": 1631683058904,
        //         "O": 1631683058000,
        //         "S": "ask",
        //         "V": "70.0",
        //         "X": "wait",
        //         "i": 26946170,
        //         "m": true,
        //         "o": "sell",
        //         "p": "5.0",
        //         "q": "70.0",
        //         "s": "wrxinr",
        //         "v": "0.0"
        //     }
        //
        const timestamp = this.safeNumber (order, 'O');
        const marketId = this.safeString (order, 's');
        const status = this.safeString (order, 'X');
        const market = this.safeMarket (marketId);
        return this.safeOrder ({
            'info': order,
            'id': this.safeString (order, 'i'),
            'clientOrderId': undefined,
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': undefined,
            'symbol': market['symbol'],
            'type': this.safeValue (order, 'm') ? 'limit' : 'market',
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': this.safeString (order, 'o'),
            'price': this.safeString (order, 'p'),
            'stopPrice': undefined,
            'amount': this.safeString (order, 'V'),
            'filled': undefined,
            'remaining': this.safeString (order, 'q'),
            'cost': undefined,
            'average': this.safeString (order, 'v'),
            'status': this.parseOrderStatus (status),
            'fee': undefined,
            'trades': undefined,
        }, market);
    }

    handleMyTrades (client, message) {
        //
        //     {
        //         "data": {
        //             "E": 1631683058000,
        //             "S": "ask",
        //             "U": "usdt",
        //             "a": 114144050,
        //             "b": 114144121,
        //             "f": "0.2",
        //             "ga": '0.0',
        //             "gc": 'usdt',
        //             "m": true,
        //             "o": 26946170,
        //             "p": "5.0",
        //             "q": "20.0",
        //             "s": "btcusdt",
        //             "t": 17376032,
        //             "w": "100.0"
        //         },
        //         "stream": "ownTrade"
        //     }
        //
        const trade = this.safeValue (message, 'data', {});
        const messageHash = 'myTrades';
        let myTrades = undefined;
        if (this.myTrades === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            myTrades = new ArrayCacheBySymbolById (limit);
            this.myTrades = myTrades;
        } else {
            myTrades = this.myTrades;
        }
        const parsedTrade = this.parseWSTrade (trade);
        myTrades.append (parsedTrade);
        client.resolve (myTrades, messageHash);
    }

    handleConnected (client, message) {
        //
        //     {
        //         data: {
        //             timeout_duration: 1800
        //         },
        //         event: 'connected'
        //     }
        //
        return message;
    }

    handleSubscribed (client, message) {
        //
        //     {
        //         data: {
        //             streams: ['!ticker@arr']
        //         },
        //         event: 'subscribed',
        //         id: 0
        //     }
        //
        return message;
    }

    handleError (client, message) {
        //
        //     {
        //         "data": {
        //             "code": 400,
        //             "message": "Invalid request: streams must be an array"
        //         },
        //         "event": "error",
        //         "id": 0
        //     }
        //
        throw new ExchangeError (this.id + ' ' + this.json (message));
    }

    handleMessage (client, message) {
        const event = this.safeString (message, 'event');
        const eventHandlers = {
            'error': this.handleError,
            'connected': this.handleConnected,
            'subscribed': this.handleSubscribed,
        };
        const eventHandler = this.safeValue (eventHandlers, event);
        if (eventHandler !== undefined) {
            return eventHandler.call (this, client, message);
        }
        const stream = this.safeString (message, 'stream', '');
        const streamHandlers = {
            '!ticker@arr': this.handleTicker,
            '@depth': this.handleOrderBook,
            'outboundAccountPosition': this.handleBalance,
            'orderUpdate': this.handleOrder,
            'ownTrade': this.handleMyTrades,
        };
        const streams = Object.keys (streamHandlers);
        for (let i = 0; i < streams.length; i++) {
            if (stream.includes (streams[i])) {
                const handler = streamHandlers[streams[i]];
                return handler.call (this, client, message);
            }
        }
        throw new NotSupported (this.id + ' this message type is not supported yet. Message: ' + this.json (message));
    }

    async authenticate (params = {}) {
        const url = this.urls['api']['ws'];
        const client = this.client (url);
        const messageHash = 'authenticated';
        const now = this.milliseconds ();
        let subscription = this.safeValue (client.subscriptions, messageHash);
        const expires = this.safeNumber (subscription, 'expires');
        if (subscription === undefined || now > expires) {
            subscription = await this.privatePostCreateAuthToken ();
            subscription['expires'] = now + this.safeNumber (subscription, 'timeout_duration') * 1000;
            //
            //     {
            //         "auth_key": "Xx***dM",
            //         "timeout_duration": 900
            //     }
            //
            client.subscriptions[messageHash] = subscription;
        }
        return this.safeString (subscription, 'auth_key');
    }
};
