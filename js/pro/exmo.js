'use strict';

//  ---------------------------------------------------------------------------

const exmoRest = require ('../exmo.js');
const { NotSupported } = require ('../base/errors');
const { ArrayCache, ArrayCacheBySymbolById } = require ('./base/Cache');

//  ---------------------------------------------------------------------------

module.exports = class exmo extends exmoRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': true,
                'watchTicker': true,
                'watchTickers': false,
                'watchTrades': true,
                'watchMyTrades': true,
                'watchOrders': false, // TODO
                'watchOrderBook': true,
                'watchOHLCV': false,
            },
            'urls': {
                'api': {
                    'ws': {
                        'public': 'wss://ws-api.exmo.com:443/v1/public',
                        'spot': 'wss://ws-api.exmo.com:443/v1/private',
                        'margin': 'wss://ws-api.exmo.com:443/v1/margin/private',
                    },
                },
            },
            'options': {
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
         * @name exmo#watchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the exmo api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.authenticate (params);
        const [ type, query ] = this.handleMarketTypeAndParams ('watchBalance', undefined, params);
        const messageHash = 'balance:' + type;
        const url = this.urls['api']['ws'][type];
        const subscribe = {
            'method': 'subscribe',
            'topics': [ type + '/wallet' ],
            'id': this.requestId (),
        };
        const request = this.deepExtend (subscribe, query);
        return await this.watch (url, messageHash, request, messageHash, request);
    }

    handleBalance (client, message) {
        //
        //  spot
        //     {
        //         ts: 1654208766007,
        //         event: 'snapshot',
        //         topic: 'spot/wallet',
        //         data: {
        //             balances: {
        //                 ADA: '0',
        //                 ALGO: '0',
        //                 ...
        //             },
        //             reserved: {
        //                 ADA: '0',
        //                 ALGO: '0',
        //                 ...
        //             }
        //         }
        //     }
        //
        //  margin
        //     {
        //         "ts": 1624370076651,
        //         "event": "snapshot",
        //         "topic": "margin/wallets",
        //         "data": {
        //             "RUB": {
        //                 "balance": "1000000",
        //                 "used": "0",
        //                 "free": "1000000"
        //             },
        //             "USD": {
        //                 "balance": "1000000",
        //                 "used": "1831.925",
        //                 "free": "998168.075"
        //             }
        //         }
        //     }
        //     {
        //         "ts": 1624370185720,
        //         "event": "update",
        //         "topic": "margin/wallets",
        //         "data": {
        //             "USD": {
        //                 "balance": "1000123",
        //                 "used": "1831.925",
        //                 "free": "998291.075"
        //             }
        //         }
        //     }
        //
        const topic = this.safeString (message, 'topic');
        const parts = topic.split ('/');
        const type = this.safeString (parts, 0);
        if (type === 'spot') {
            this.parseSpotBalance (message);
        } else if (type === 'margin') {
            this.parseMarginBalance (message);
        }
        const messageHash = 'balance:' + type;
        client.resolve (this.balance, messageHash);
    }

    parseSpotBalance (message) {
        //
        //     {
        //         "balances": {
        //             "BTC": "3",
        //             "USD": "1000",
        //             "RUB": "0"
        //         },
        //         "reserved": {
        //             "BTC": "0.5",
        //             "DASH": "0",
        //             "RUB": "0"
        //         }
        //     }
        //
        const event = this.safeString (message, 'event');
        const data = this.safeValue (message, 'data');
        if (event === 'snapshot') {
            const balances = this.safeValue (data, 'balances', {});
            const reserved = this.safeValue (data, 'reserved', {});
            const currencies = Object.keys (balances);
            for (let i = 0; i < currencies.length; i++) {
                const currencyId = currencies[i];
                const code = this.safeCurrencyCode (currencyId);
                const free = balances[currencyId];
                const used = reserved[currencyId];
                const account = this.account ();
                account['free'] = this.parseNumber (free);
                account['used'] = this.parseNumber (used);
                this.balance[code] = account;
            }
        } else if (event === 'update') {
            const currencyId = this.safeString (data, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeNumber (data, 'balance');
            account['used'] = this.safeNumber (data, 'reserved');
            this.balance[code] = account;
        }
        this.balance = this.safeBalance (this.balance);
    }

    parseMarginBalance (message) {
        //
        //     {
        //         "RUB": {
        //             "balance": "1000000",
        //             "used": "0",
        //             "free": "1000000"
        //         },
        //         "USD": {
        //             "balance": "1000000",
        //             "used": "1831.925",
        //             "free": "998168.075"
        //         }
        //     }
        //
        const data = this.safeValue (message, 'data');
        const currencies = Object.keys (data);
        for (let i = 0; i < currencies.length; i++) {
            const currencyId = currencies[i];
            const code = this.safeCurrencyCode (currencyId);
            const wallet = this.safeValue (data, currencyId);
            const account = this.account ();
            account['free'] = this.safeNumber (wallet, 'free');
            account['used'] = this.safeNumber (wallet, 'used');
            account['total'] = this.safeNumber (wallet, 'balance');
            this.balance[code] = account;
            this.balance = this.safeBalance (this.balance);
        }
    }

    async watchTicker (symbol, params = {}) {
        /**
         * @method
         * @name exmo#watchTicker
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the exmo api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const url = this.urls['api']['ws']['public'];
        const messageHash = 'ticker:' + symbol;
        const message = {
            'method': 'subscribe',
            'topics': [
                'spot/ticker:' + market['id'],
            ],
            'id': this.requestId (),
        };
        const request = this.deepExtend (message, params);
        return await this.watch (url, messageHash, request, messageHash, request);
    }

    handleTicker (client, message) {
        //
        //  spot
        //      {
        //          ts: 1654205085473,
        //          event: 'update',
        //          topic: 'spot/ticker:BTC_USDT',
        //          data: {
        //              buy_price: '30285.84',
        //              sell_price: '30299.97',
        //              last_trade: '30295.01',
        //              high: '30386.7',
        //              low: '29542.76',
        //              avg: '29974.16178449',
        //              vol: '118.79538518',
        //              vol_curr: '3598907.38200826',
        //              updated: 1654205084
        //          }
        //      }
        //
        const topic = this.safeString (message, 'topic');
        const topicParts = topic.split (':');
        const marketId = this.safeString (topicParts, 1);
        const symbol = this.safeSymbol (marketId);
        const ticker = this.safeValue (message, 'data', {});
        const market = this.safeMarket (marketId);
        const parsedTicker = this.parseTicker (ticker, market);
        const messageHash = 'ticker:' + symbol;
        this.tickers[symbol] = parsedTicker;
        client.resolve (parsedTicker, messageHash);
    }

    async watchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name exmo#watchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the exmo api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const url = this.urls['api']['ws']['public'];
        const messageHash = 'trades:' + symbol;
        const message = {
            'method': 'subscribe',
            'topics': [
                'spot/trades:' + market['id'],
            ],
            'id': this.requestId (),
        };
        const request = this.deepExtend (message, params);
        const trades = await this.watch (url, messageHash, request, messageHash, request);
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleTrades (client, message) {
        //
        //      {
        //          ts: 1654206084001,
        //          event: 'update',
        //          topic: 'spot/trades:BTC_USDT',
        //          data: [{
        //              trade_id: 389704729,
        //              type: 'sell',
        //              price: '30310.95',
        //              quantity: '0.0197',
        //              amount: '597.125715',
        //              date: 1654206083
        //          }]
        //      }
        //
        const topic = this.safeString (message, 'topic');
        const parts = topic.split (':');
        const marketId = this.safeString (parts, 1);
        const symbol = this.safeSymbol (marketId);
        const market = this.safeMarket (marketId);
        const trades = this.safeValue (message, 'data', []);
        const messageHash = 'trades:' + symbol;
        let stored = this.safeValue (this.trades, symbol);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            stored = new ArrayCache (limit);
            this.trades[symbol] = stored;
        }
        for (let i = 0; i < trades.length; i++) {
            const trade = trades[i];
            const parsed = this.parseTrade (trade, market);
            stored.append (parsed);
        }
        this.trades[symbol] = stored;
        client.resolve (this.trades[symbol], messageHash);
    }

    async watchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name exmo#watchTrades
         * @description get the list of trades associated with the user
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the exmo api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        await this.authenticate (params);
        const [ type, query ] = this.handleMarketTypeAndParams ('watchMyTrades', undefined, params);
        const url = this.urls['api']['ws'][type];
        let messageHash = undefined;
        if (symbol === undefined) {
            messageHash = 'myTrades:' + type;
        } else {
            const market = this.market (symbol);
            symbol = market['symbol'];
            messageHash = 'myTrades:' + market['symbol'];
        }
        const message = {
            'method': 'subscribe',
            'topics': [
                type + '/user_trades',
            ],
            'id': this.requestId (),
        };
        const request = this.deepExtend (message, query);
        const trades = await this.watch (url, messageHash, request, messageHash, request);
        return this.filterBySymbolSinceLimit (trades, symbol, since, limit, true);
    }

    handleMyTrades (client, message) {
        //
        //  spot
        //     {
        //         ts: 1654210290219,
        //         event: 'update',
        //         topic: 'spot/user_trades',
        //         data: {
        //             trade_id: 389715807,
        //             type: 'buy',
        //             price: '30527.77',
        //             quantity: '0.0001',
        //             amount: '3.052777',
        //             date: 1654210290,
        //             order_id: 27352777112,
        //             client_id: 0,
        //             pair: 'BTC_USDT',
        //             exec_type: 'taker',
        //             commission_amount: '0.0000001',
        //             commission_currency: 'BTC',
        //             commission_percent: '0.1'
        //         }
        //     }
        //
        //  margin
        //     {
        //         "ts":1624369720168,
        //         "event":"snapshot",
        //         "topic":"margin/user_trades",
        //         "data":[
        //            {
        //               "trade_id":"692844278081167054",
        //               "trade_dt":"1624369773990729200",
        //               "type":"buy",
        //               "order_id":"692844278081167033",
        //               "pair":"BTC_USD",
        //               "quantity":"0.1",
        //               "price":"36638.5",
        //               "is_maker":false
        //            }
        //         ]
        //     }
        //     {
        //         "ts":1624370368612,
        //         "event":"update",
        //         "topic":"margin/user_trades",
        //         "data":{
        //            "trade_id":"692844278081167693",
        //            "trade_dt":"1624370368569092500",
        //            "type":"buy",
        //            "order_id":"692844278081167674",
        //            "pair":"BTC_USD",
        //            "quantity":"0.1",
        //            "price":"36638.5",
        //            "is_maker":false
        //         }
        //     }
        //
        const topic = this.safeString (message, 'topic');
        const parts = topic.split ('/');
        const type = this.safeString (parts, 0);
        const messageHash = 'myTrades:' + type;
        const event = this.safeString (message, 'event');
        let rawTrades = [];
        let myTrades = undefined;
        if (this.myTrades === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            myTrades = new ArrayCacheBySymbolById (limit);
            this.myTrades = myTrades;
        } else {
            myTrades = this.myTrades;
        }
        if (event === 'snapshot') {
            rawTrades = this.safeValue (message, 'data', []);
        } else if (event === 'update') {
            const rawTrade = this.safeValue (message, 'data', {});
            rawTrades = [ rawTrade ];
        }
        const trades = this.parseTrades (rawTrades);
        const symbols = {};
        for (let j = 0; j < trades.length; j++) {
            const trade = trades[j];
            myTrades.append (trade);
            symbols[trade['symbol']] = true;
        }
        const symbolKeys = Object.keys (symbols);
        for (let i = 0; i < symbolKeys.length; i++) {
            const symbol = symbolKeys[i];
            const symbolSpecificMessageHash = 'myTrades:' + symbol;
            client.resolve (myTrades, symbolSpecificMessageHash);
        }
        client.resolve (myTrades, messageHash);
    }

    async watchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name exmo#watchOrderBook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the exmo api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const url = this.urls['api']['ws']['public'];
        const messageHash = 'orderbook:' + symbol;
        params = this.omit (params, 'aggregation');
        const subscribe = {
            'method': 'subscribe',
            'id': this.requestId (),
            'topics': [
                'spot/order_book_updates:' + market['id'],
            ],
        };
        const request = this.deepExtend (subscribe, params);
        const orderbook = await this.watch (url, messageHash, request, messageHash);
        return orderbook.limit ();
    }

    handleOrderBook (client, message) {
        //
        //     {
        //         "ts": 1574427585174,
        //         "event": "snapshot",
        //         "topic": "spot/order_book_updates:BTC_USD",
        //         "data": {
        //             "ask": [
        //                 ["100", "3", "300"],
        //                 ["200", "4", "800"]
        //             ],
        //             "bid": [
        //                 ["99", "2", "198"],
        //                 ["98", "1", "98"]
        //             ]
        //         }
        //     }
        //
        //     {
        //         "ts": 1574427585174,
        //         "event": "update",
        //         "topic": "spot/order_book_updates:BTC_USD",
        //         "data": {
        //             "ask": [
        //                 ["100", "1", "100"],
        //                 ["200", "2", "400"]
        //             ],
        //             "bid": [
        //                 ["99", "1", "99"],
        //                 ["98", "0", "0"]
        //             ]
        //         }
        //     }
        //
        const topic = this.safeString (message, 'topic');
        const parts = topic.split (':');
        const marketId = this.safeString (parts, 1);
        const symbol = this.safeSymbol (marketId);
        const orderBook = this.safeValue (message, 'data', {});
        const messageHash = 'orderbook:' + symbol;
        const timestamp = this.safeNumber (message, 'ts');
        let storedOrderBook = this.safeValue (this.orderbooks, symbol);
        if (storedOrderBook === undefined) {
            storedOrderBook = this.orderBook ({});
            this.orderbooks[symbol] = storedOrderBook;
        }
        const event = this.safeString (message, 'event');
        if (event === 'snapshot') {
            const snapshot = this.parseOrderBook (orderBook, symbol, timestamp, 'bid', 'ask');
            storedOrderBook.reset (snapshot);
        } else {
            const asks = this.safeValue (orderBook, 'ask', []);
            const bids = this.safeValue (orderBook, 'bid', []);
            this.handleDeltas (storedOrderBook['asks'], asks);
            this.handleDeltas (storedOrderBook['bids'], bids);
            storedOrderBook['timestamp'] = timestamp;
            storedOrderBook['datetime'] = this.iso8601 (timestamp);
        }
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

    handleMessage (client, message) {
        //
        // {
        //     ts: 1654206362552,
        //     event: 'info',
        //     code: 1,
        //     message: 'connection established',
        //     session_id: '7548931b-c2a4-45dd-8d71-877881a7251a'
        // }
        //
        // {
        //     ts: 1654206491399,
        //     event: 'subscribed',
        //     id: 1,
        //     topic: 'spot/ticker:BTC_USDT'
        // }
        const event = this.safeString (message, 'event');
        if (event === 'logged_in') {
            return this.handleAuthenticationMessage (client, message);
        }
        if ((event === 'update') || (event === 'snapshot')) {
            const topic = this.safeString (message, 'topic');
            if (topic !== undefined) {
                const parts = topic.split (':');
                const channel = this.safeString (parts, 0);
                const handlers = {
                    'spot/ticker': this.handleTicker,
                    'spot/wallet': this.handleBalance,
                    'margin/wallet': this.handleBalance,
                    'margin/wallets': this.handleBalance,
                    'spot/trades': this.handleTrades,
                    'margin/trades': this.handleTrades,
                    'spot/order_book_updates': this.handleOrderBook,
                    // 'spot/orders': this.handleOrders,
                    // 'margin/orders': this.handleOrders,
                    'spot/user_trades': this.handleMyTrades,
                    'margin/user_trades': this.handleMyTrades,
                };
                const handler = this.safeValue (handlers, channel);
                if (handler !== undefined) {
                    return handler.call (this, client, message);
                }
            }
        }
        if (event === 'info') {
            return this.handleInfo (client, message);
        }
        if (event === 'subscribed') {
            return this.handleSubscribed (client, message);
        }
        throw new NotSupported (this.id + ' received an unsupported message: ' + this.json (message));
    }

    handleSubscribed (client, message) {
        //
        // {
        //     method: 'subscribe',
        //     id: 2,
        //     topics: ['spot/orders']
        // }
        //
        return message;
    }

    handleInfo (client, message) {
        //
        // {
        //     ts: 1654215731659,
        //     event: 'info',
        //     code: 1,
        //     message: 'connection established',
        //     session_id: '4c496262-e259-4c27-b805-f20b46209c17'
        // }
        //
        return message;
    }

    handleAuthenticationMessage (client, message) {
        //
        //     {
        //         method: 'login',
        //         id: 1,
        //         api_key: 'K-************************',
        //         sign: '******************************************************************',
        //         nonce: 1654215729887
        //     }
        //
        const future = this.safeValue (client.futures, 'authenticated');
        if (future !== undefined) {
            future.resolve (true);
        }
    }

    async authenticate (params = {}) {
        const messageHash = 'authenticated';
        const [ type, query ] = this.handleMarketTypeAndParams ('authenticate', undefined, params);
        const url = this.urls['api']['ws'][type];
        const client = this.client (url);
        const future = client.future ('authenticated');
        const authenticated = this.safeValue (client.subscriptions, messageHash);
        if (authenticated === undefined) {
            const time = this.milliseconds ();
            this.checkRequiredCredentials ();
            const requestId = this.requestId ();
            const signData = this.apiKey + time.toString ();
            const sign = this.hmac (this.encode (signData), this.encode (this.secret), 'sha512', 'base64');
            const request = {
                'method': 'login',
                'id': requestId,
                'api_key': this.apiKey,
                'sign': sign,
                'nonce': time,
            };
            this.spawn (this.watch, url, messageHash, this.extend (request, query), messageHash);
        }
        return await future;
    }
};
