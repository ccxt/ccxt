'use strict';

//  ---------------------------------------------------------------------------

const ccxt = require ('ccxt');
const Precise = require ('ccxt/js/base/Precise');
const { NotSupported } = require ('ccxt/js/base/errors');
const { ArrayCache, ArrayCacheBySymbolById } = require ('./base/Cache');

//  ---------------------------------------------------------------------------

module.exports = class exmo extends ccxt.exmo {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': true,
                'watchTicker': true,
                'watchTickers': false,
                'watchTrades': true,
                'watchMyTrades': true,
                'watchOrders': true,
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
                'account': 'spot',
                'watchOrderBook': {
                    'limits': [5, 10, 20, 50],
                    'defaultLimit': 50,
                    'aggregations': ['10', '1', '0', '0.1', '0.01'],
                    'defaultAggregation': '0',
                },
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
         * @param {dict} params extra parameters specific to the exmo api endpoint
         * @returns {dict} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.authenticate (params);
        let type = undefined;
        [type, params] = this.handleMarketTypeAndParams ('watchBalance', undefined, params);
        const messageHash = 'balance:' + type;
        const url = this.urls['api']['ws'][type];
        const subscribe = {
            'method': 'subscribe',
            'topics': [type + '/wallet'],
            'id': this.requestId (),
        };
        const request = this.deepExtend (subscribe, params);
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
        const data = this.safeValue (message, 'data', {});
        if (type === 'spot') {
            this.parseSpotBalance (data);
        } else if (type === 'margin') {
            this.parseMarginBalance (data);
        }
        const messageHash = 'balance:' + type;
        client.resolve (this.balance, messageHash);
    }

    parseSpotBalance (data) {
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
        const balances = this.safeValue (data, 'balances', {});
        const reserved = this.safeValue (data, 'reserved', {});
        const currencies = Object.keys (balances);
        for (let i = 0; i < currencies.length; i++) {
            const currencyId = currencies[i];
            const code = this.safeCurrencyCode (currencyId);
            const free = balances[currencyId];
            const used = reserved[currencyId];
            const total = Precise.stringAdd (free, used);
            const account = this.account ();
            account['free'] = this.parseNumber (free);
            account['used'] = this.parseNumber (used);
            account['total'] = this.parseNumber (total);
            this.balance[code] = account;
            this.balance = this.safeBalance (this.balance);
        }
    }

    parseMarginBalance (data) {
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
         * @param {str} symbol unified symbol of the market to fetch the ticker for
         * @param {dict} params extra parameters specific to the exmo api endpoint
         * @returns {dict} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
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
         * @param {str} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {dict} params extra parameters specific to the exmo api endpoint
         * @returns {[dict]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
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
         * @param {str} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {dict} params extra parameters specific to the exmo api endpoint
         * @returns {[dict]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.authenticate (params);
        let type = undefined;
        [type, params] = this.handleMarketTypeAndParams ('watchMyTrades', undefined, params);
        const url = this.urls['api']['ws'][type];
        const messageHash = 'mytrades:' + type;
        const message = {
            'method': 'subscribe',
            'topics': [
                type + '/user_trades',
            ],
            'id': this.requestId (),
        };
        const request = this.deepExtend (message, params);
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
        const messageHash = 'mytrades:' + type;
        const event = this.safeString (message, 'event');
        let rawTrades = [];
        if (this.myTrades === undefined || event === 'snapshot') {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            this.myTrades = new ArrayCacheBySymbolById (limit);
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
            const symbol = trade['symbol'];
            this.myTrades.append (trade);
            symbols[symbol] = trade;
        }
        client.resolve (this.myTrades, messageHash);
    }

    async watchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name exmo#watchOrderBook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {str} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {dict} params extra parameters specific to the exmo api endpoint
         * @returns {dict} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
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
        return orderbook.limit (limit);
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
        let orderBook = this.safeValue (message, 'data', {});
        const messageHash = 'orderbook:' + symbol;
        const timestamp = this.safeNumber (message, 'ts');
        const currentOrderBook = this.safeValue (this.orderbooks, symbol);
        const event = this.safeString (message, 'event');
        if (event === 'snapshot') {
            const snapshot = this.parseOrderBook (orderBook, symbol, timestamp, 'bid', 'ask');
            if (currentOrderBook === undefined) {
                orderBook = this.orderBook (snapshot);
                this.orderbooks[symbol] = orderBook;
            } else {
                orderBook = this.orderbooks[symbol];
                orderBook.reset (snapshot);
            }
        } else {
            const asks = this.safeValue (orderBook, 'ask', []);
            const bids = this.safeValue (orderBook, 'bid', []);
            this.handleDeltas (currentOrderBook['asks'], asks);
            this.handleDeltas (currentOrderBook['bids'], bids);
            currentOrderBook['nonce'] = timestamp;
            currentOrderBook['timestamp'] = timestamp;
            currentOrderBook['datetime'] = this.iso8601 (timestamp);
            this.orderbooks[symbol] = currentOrderBook;
        }
        client.resolve (this.orderbooks[symbol], messageHash);
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

    async watchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        await this.authenticate (params);
        const market = undefined;
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('watchOrders', market, params);
        const messageHash = 'someorders:' + type;
        const message = {
            'method': 'subscribe',
            'id': this.requestId (),
            'topics': [type + '/orders'],
        };
        const url = this.urls['api']['ws'][type];
        const request = this.deepExtend (message, params);
        const orders = await this.watch (url, messageHash, request, messageHash, request);
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit, true);
    }

    handleOrders (client, message) {
        //
        //  spot
        //     {
        //         "ts": 1574427585174,
        //         "event": "snapshot",
        //         "topic": "spot/orders",
        //         "data": [{
        //                 "order_id": "14",
        //                 "client_id": "100500",
        //                 "created": "1574427585",
        //                 "pair": "BTC_USD",
        //                 "price": "7750",
        //                 "quantity": "0.1",
        //                 "amount": "775",
        //                 "original_quantity": "0.1",
        //                 "original_amount": "775",
        //                 "type": "sell",
        //                 "status": "open"
        //             },
        //             {
        //                 "parent_order_id": "6216512412",
        //                 "client_id": "100501",
        //                 "created": "1574427585",
        //                 "type": "stop_market_sell",
        //                 "pair": "BTC_USD",
        //                 "quantity": "1",
        //                 "trigger_price": "7727",
        //                 "amount": "7727",
        //                 "status": "open"
        //             }
        //         ]
        //     }
        //     {
        //         "ts": 1574427585174,
        //         "event": "update",
        //         "topic": "spot/orders",
        //         "data": {
        //             "order_id": "15",
        //             "client_id": "100502",
        //             "created": "1574427585",
        //             "pair": "BTC_USD",
        //             "quantity": "0",
        //             "original_quantity": "0.1",
        //             "type": "market_sell",
        //             "status": "cancelled",
        //             "last_trade_id": "51",
        //             "last_trade_price": "7728",
        //             "last_trade_quantity": "0.002"
        //         }
        //     }
        //
        //  margin
        //     {
        //         "ts":1624371221620,
        //         "event":"update",
        //         "topic":"margin/orders",
        //         "data":{
        //            "order_id":"692844278081168599",
        //            "created":"1624371221546858900",
        //            "type":"market_buy",
        //            "previous_type":"market_buy",
        //            "pair":"BTC_USD",
        //            "leverage":"2",
        //            "price":"0",
        //            "stop_price":"0",
        //            "distance":"0",
        //            "trigger_price":"36638.5",
        //            "init_quantity":"0.1",
        //            "quantity":"0",
        //            "funding_currency":"USD",
        //            "funding_quantity":"0",
        //            "funding_rate":"0",
        //            "client_id":"111111",
        //            "expire":0,
        //            "src":1,
        //            "comment":"comment1",
        //            "updated":1624371221627390400,
        //            "status":"executed"
        //         }
        //     }
        //
        const event = this.safeString (message, 'event');
        const topic = this.safeString (message, 'topic');
        const parts = topic.split ('/');
        const type = this.safeString (parts, 0);
        const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
        if (this.orders === undefined || event === 'snapshot') {
            this.orders = new ArrayCacheBySymbolById (limit);
        }
        let orders = [];
        if (event === 'snapshot') {
            orders = this.safeValue (message, 'data', []);
        } else if (event === 'update') {
            const order = this.safeValue (message, 'data', {});
            orders = [order];
        }
        for (let i = 0; i < orders.length; i++) {
            const parsedOrder = this.parseWSOrder (orders[i]);
            this.orders.append (parsedOrder);
        }
        const messageHash = 'someorders:' + type;
        client.resolve (this.orders, messageHash);
    }

    parseWSOrder (order, market = undefined) {
        //
        //  spot
        //     {
        //         "order_id": "14",
        //         "client_id": "100500",
        //         "created": "1574427585",
        //         "pair": "BTC_USD",
        //         "price": "7750",
        //         "quantity": "0.1",
        //         "amount": "775",
        //         "original_quantity": "0.1",
        //         "original_amount": "775",
        //         "type": "sell",
        //         "status": "open"
        //     }
        //     {
        //         "parent_order_id": "6216512412",
        //         "client_id": "100501",
        //         "created": "1574427585",
        //         "type": "stop_market_sell",
        //         "pair": "BTC_USD",
        //         "quantity": "1",
        //         "trigger_price": "7727",
        //         "amount": "7727",
        //         "status": "open"
        //     }
        //     {
        //         "order_id": "15",
        //         "client_id": "100502",
        //         "created": "1574427585",
        //         "pair": "BTC_USD",
        //         "quantity": "0",
        //         "original_quantity": "0.1",
        //         "type": "market_sell",
        //         "status": "cancelled",
        //         "last_trade_id": "51",
        //         "last_trade_price": "7728",
        //         "last_trade_quantity": "0.002"
        //     }
        //
        //  margin
        //     {
        //         "order_id": "692844278081168599",
        //         "created": "1624371221546858900",
        //         "type": "market_buy",
        //         "previous_type": "market_buy",
        //         "pair": "BTC_USD",
        //         "leverage": "2",
        //         "price": "0",
        //         "stop_price": "0",
        //         "distance": "0",
        //         "trigger_price": "36638.5",
        //         "init_quantity": "0.1",
        //         "quantity": "0",
        //         "funding_currency": "USD",
        //         "funding_quantity": "0",
        //         "funding_rate": "0",
        //         "client_id": "111111",
        //         "expire": 0,
        //         "src": 1,
        //         "comment": "comment1",
        //         "updated": 1624371221627390400,
        //         "status": "executed"
        //     }
        //
        const timestamp = this.safeTimestamp2 (order, 'updated', 'created');
        const marketId = this.safeString (order, 'pair');
        const typeString = this.safeString (order, 'type');
        const type = this.getSupportedMapping (typeString, {
            'sell': 'limit',
            'buy': 'limit',
            'market_buy': 'market',
            'market_sell': 'market',
            'stop_market_sell': 'stopMarket',
            'stop_market_buy': 'stopMarket',
            'stop_buy': 'stop',
            'stop_sell': 'stop',
            'stop_limit_buy': 'stopLimit',
            'stop_limit_sell': 'stopLimit',
            'trailing_stop_buy': 'stop',
            'trailing_stop_sell': 'stop',
        });
        const side = this.getSupportedMapping (typeString, {
            'sell': 'sell',
            'buy': 'buy',
            'market_sell': 'sell',
            'market_buy': 'buy',
            'stop_market_sell': 'sell',
            'stop_market_buy': 'buy',
            'stop_buy': 'buy',
            'stop_sell': 'sell',
            'stop_limit_buy': 'buy',
            'stop_limit_sell': 'sell',
            'trailing_stop_buy': 'buy',
            'trailing_stop_sell': 'sell',
        });
        const status = this.safeString (order, 'status');
        let amount = this.safeNumber (order, 'quantity');
        const filled = undefined;
        let remaining = undefined;
        if ('original_quantity' in order) {
            remaining = this.safeNumber (order, 'quantity');
            amount = this.safeNumber (order, 'original_quantity');
        }
        return this.safeOrder ({
            'info': order,
            'id': this.safeString2 (order, 'order_id', 'id'),
            'clientOrderId': this.safeString (order, 'client_id'),
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': undefined,
            'symbol': this.safeSymbol (marketId),
            'type': type,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': this.safeNumber (order, 'price'),
            'stopPrice': this.safeNumber (order, 'trigger_price'),
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'cost': this.safeNumber (order, 'amount'),
            'average': undefined,
            'status': this.parseWSOrderStatus (status),
            'fee': {},
            'trades': undefined,
        }, this.safeMarket (marketId));
    }

    parseWSOrderStatus (status) {
        const statuses = {
            'cancelled': 'canceled',
            'executing': 'open',
            'open': 'open',
            'executed': 'closed',
        };
        return this.safeString (statuses, status, status);
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
            return this.handleSubscriptionStatus (client, message);
        }
        if (event === 'update' || event === 'snapshot') {
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
                    'spot/orders': this.handleOrders,
                    'margin/orders': this.handleOrders,
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
        return message;
    }

    handleSubscriptionStatus (client, message) {
        const id = this.safeString (message, 'id');
        const subscriptionsById = this.indexBy (client.subscriptions, 'id');
        const subscription = this.safeValue (subscriptionsById, id);
        if (subscription !== undefined) {
            const method = this.safeValue (subscription, 'callmethod');
            if (method !== undefined) {
                return method.call (this, client, message, subscription);
            }
            if (id in client.subscriptions) {
                delete client.subscriptions[id];
            }
        }
        return message;
    }

    async authenticate (params = {}) {
        let type = undefined;
        [type, params] = this.handleMarketTypeAndParams ('authenticate', undefined, params);
        const url = this.urls['api']['ws'][type];
        const client = this.client (url);
        const time = this.milliseconds ();
        const messageHash = 'authenticated';
        const future = client.future ('authenticated');
        const authenticated = this.safeValue (client.subscriptions, messageHash);
        if (authenticated === undefined) {
            this.checkRequiredCredentials ();
            const requestId = this.requestId ();
            const subscribe = {
                'id': requestId,
                'callmethod': this.handleAuthenticationMessage,
            };
            const signData = this.apiKey + this.numberToString (time);
            const sign = this.hmac (this.encode (signData), this.encode (this.secret), 'sha512', 'base64');
            const request = {
                'method': 'login',
                'id': requestId,
                'api_key': this.apiKey,
                'sign': sign,
                'nonce': time,
            };
            this.spawn (this.watch, url, messageHash, request, messageHash, subscribe);
        }
        return await future;
    }
};
