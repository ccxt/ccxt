'use strict';

//  ---------------------------------------------------------------------------

const bitstampRest = require ('../bitstamp.js');
const { ArgumentsRequired, AuthenticationError } = require ('../base/errors');
const { ArrayCache, ArrayCacheBySymbolById } = require ('./base/Cache');

//  ---------------------------------------------------------------------------

module.exports = class bitstamp extends bitstampRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchOrderBook': true,
                'watchOrders': true,
                'watchTrades': true,
                'watchOHLCV': false,
                'watchTicker': false,
                'watchTickers': false,
            },
            'urls': {
                'api': {
                    'ws': 'wss://ws.bitstamp.net',
                },
            },
            'options': {
                'expiresIn': '',
                'userId': '',
                'wsSessionToken': '',
                'watchOrderBook': {
                    'type': 'order_book', // detail_order_book, diff_order_book
                },
                'tradesLimit': 1000,
                'OHLCVLimit': 1000,
            },
            'exceptions': {
                'exact': {
                    '4009': AuthenticationError,
                },
            },
        });
    }

    async watchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitstamp#watchOrderBook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the bitstamp api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const options = this.safeValue (this.options, 'watchOrderBook', {});
        const type = this.safeString (options, 'type', 'order_book');
        const messageHash = type + '_' + market['id'];
        const url = this.urls['api']['ws'];
        const request = {
            'event': 'bts:subscribe',
            'data': {
                'channel': messageHash,
            },
        };
        const subscription = {
            'messageHash': messageHash,
            'type': type,
            'symbol': symbol,
            'method': this.handleOrderBookSubscription,
            'limit': limit,
            'params': params,
        };
        const message = this.extend (request, params);
        const orderbook = await this.watch (url, messageHash, message, messageHash, subscription);
        return orderbook.limit (limit);
    }

    async fetchOrderBookSnapshot (client, message, subscription) {
        const symbol = this.safeString (subscription, 'symbol');
        const limit = this.safeInteger (subscription, 'limit');
        const params = this.safeValue (subscription, 'params');
        const messageHash = this.safeString (subscription, 'messageHash');
        // todo: this is a synch blocking call in ccxt.php - make it async
        const snapshot = await this.fetchOrderBook (symbol, limit, params);
        const orderbook = this.safeValue (this.orderbooks, symbol);
        if (orderbook !== undefined) {
            orderbook.reset (snapshot);
            // unroll the accumulated deltas
            const messages = orderbook.cache;
            for (let i = 0; i < messages.length; i++) {
                const message = messages[i];
                this.handleOrderBookMessage (client, message, orderbook);
            }
            this.orderbooks[symbol] = orderbook;
            client.resolve (orderbook, messageHash);
        }
    }

    handleDelta (bookside, delta) {
        const price = this.safeFloat (delta, 0);
        const amount = this.safeFloat (delta, 1);
        const id = this.safeString (delta, 2);
        if (id === undefined) {
            bookside.store (price, amount);
        } else {
            bookside.store (price, amount, id);
        }
    }

    handleDeltas (bookside, deltas) {
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta (bookside, deltas[i]);
        }
    }

    handleOrderBookMessage (client, message, orderbook, nonce = undefined) {
        const data = this.safeValue (message, 'data', {});
        const microtimestamp = this.safeInteger (data, 'microtimestamp');
        if ((nonce !== undefined) && (microtimestamp <= nonce)) {
            return orderbook;
        }
        this.handleDeltas (orderbook['asks'], this.safeValue (data, 'asks', []));
        this.handleDeltas (orderbook['bids'], this.safeValue (data, 'bids', []));
        orderbook['nonce'] = microtimestamp;
        const timestamp = parseInt (microtimestamp / 1000);
        orderbook['timestamp'] = timestamp;
        orderbook['datetime'] = this.iso8601 (timestamp);
        return orderbook;
    }

    handleOrderBook (client, message) {
        //
        // initial snapshot is fetched with ccxt's fetchOrderBook
        // the feed does not include a snapshot, just the deltas
        //
        //     {
        //         data: {
        //             timestamp: '1583656800',
        //             microtimestamp: '1583656800237527',
        //             bids: [
        //                 ["8732.02", "0.00002478", "1207590500704256"],
        //                 ["8729.62", "0.01600000", "1207590502350849"],
        //                 ["8727.22", "0.01800000", "1207590504296448"],
        //             ],
        //             asks: [
        //                 ["8735.67", "2.00000000", "1207590693249024"],
        //                 ["8735.67", "0.01700000", "1207590693634048"],
        //                 ["8735.68", "1.53294500", "1207590692048896"],
        //             ],
        //         },
        //         event: 'data',
        //         channel: 'detail_order_book_btcusd'
        //     }
        //
        const channel = this.safeString (message, 'channel');
        const subscription = this.safeValue (client.subscriptions, channel);
        const symbol = this.safeString (subscription, 'symbol');
        const type = this.safeString (subscription, 'type');
        const orderbook = this.safeValue (this.orderbooks, symbol);
        if (orderbook === undefined) {
            return message;
        }
        if (type === 'order_book') {
            orderbook.reset ({});
            this.handleOrderBookMessage (client, message, orderbook);
            client.resolve (orderbook, channel);
            // replace top bids and asks
        } else if (type === 'detail_order_book') {
            orderbook.reset ({});
            this.handleOrderBookMessage (client, message, orderbook);
            client.resolve (orderbook, channel);
            // replace top bids and asks
        } else if (type === 'diff_order_book') {
            // process incremental deltas
            const nonce = this.safeInteger (orderbook, 'nonce');
            if (nonce === undefined) {
                // buffer the events you receive from the stream
                orderbook.cache.push (message);
            } else {
                try {
                    this.handleOrderBookMessage (client, message, orderbook, nonce);
                    client.resolve (orderbook, channel);
                } catch (e) {
                    if (symbol in this.orderbooks) {
                        delete this.orderbooks[symbol];
                    }
                    if (channel in client.subscriptions) {
                        delete client.subscriptions[channel];
                    }
                    client.reject (e, channel);
                }
            }
        }
    }

    async watchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitstamp#watchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the bitstamp api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const options = this.safeValue (this.options, 'watchTrades', {});
        const type = this.safeString (options, 'type', 'live_trades');
        const messageHash = type + '_' + market['id'];
        const url = this.urls['api']['ws'];
        const request = {
            'event': 'bts:subscribe',
            'data': {
                'channel': messageHash,
            },
        };
        const subscription = {
            'messageHash': messageHash,
            'type': type,
            'symbol': symbol,
            'limit': limit,
            'params': params,
        };
        const message = this.extend (request, params);
        const trades = await this.watch (url, messageHash, message, messageHash, subscription);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    parseTrade (trade, market = undefined) {
        //
        //     {
        //         buy_order_id: 1211625836466176,
        //         amount_str: '1.08000000',
        //         timestamp: '1584642064',
        //         microtimestamp: '1584642064685000',
        //         id: 108637852,
        //         amount: 1.08,
        //         sell_order_id: 1211625840754689,
        //         price_str: '6294.77',
        //         type: 1,
        //         price: 6294.77
        //     }
        //
        const microtimestamp = this.safeInteger (trade, 'microtimestamp');
        if (microtimestamp === undefined) {
            return super.parseTrade (trade, market);
        }
        const id = this.safeString (trade, 'id');
        const timestamp = parseInt (microtimestamp / 1000);
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'amount');
        let cost = undefined;
        if ((price !== undefined) && (amount !== undefined)) {
            cost = price * amount;
        }
        let symbol = undefined;
        const marketId = this.safeString (trade, 's');
        if (marketId in this.markets_by_id) {
            market = this.markets_by_id[marketId];
        }
        if ((symbol === undefined) && (market !== undefined)) {
            symbol = market['symbol'];
        }
        let side = this.safeInteger (trade, 'type');
        side = (side === 0) ? 'buy' : 'sell';
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': id,
            'order': undefined,
            'type': undefined,
            'takerOrMaker': undefined,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
        };
    }

    handleTrade (client, message) {
        //
        //     {
        //         data: {
        //             buy_order_id: 1207733769326592,
        //             amount_str: "0.14406384",
        //             timestamp: "1583691851",
        //             microtimestamp: "1583691851934000",
        //             id: 106833903,
        //             amount: 0.14406384,
        //             sell_order_id: 1207733765476352,
        //             price_str: "8302.92",
        //             type: 0,
        //             price: 8302.92
        //         },
        //         event: "trade",
        //         channel: "live_trades_btcusd"
        //     }
        //
        // the trade streams push raw trade information in real-time
        // each trade has a unique buyer and seller
        const channel = this.safeString (message, 'channel');
        const data = this.safeValue (message, 'data');
        const subscription = this.safeValue (client.subscriptions, channel);
        const symbol = this.safeString (subscription, 'symbol');
        const market = this.market (symbol);
        const trade = this.parseTrade (data, market);
        let tradesArray = this.safeValue (this.trades, symbol);
        if (tradesArray === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            tradesArray = new ArrayCache (limit);
            this.trades[symbol] = tradesArray;
        }
        tradesArray.append (trade);
        client.resolve (tradesArray, channel);
    }

    async watchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitstamp#watchOrders
         * @description watches information on multiple orders made by the user
         * @param {string|undefined} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the bitstamp api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' watchOrders requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const channel = 'private-my_orders';
        const messageHash = channel + '_' + market['id'];
        const subscription = {
            'symbol': symbol,
            'limit': limit,
            'type': channel,
            'params': params,
        };
        const orders = await this.subscribePrivate (subscription, messageHash, params);
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (orders, since, limit, 'timestamp', true);
    }

    handleOrders (client, message) {
        //
        // {
        //     "data":{
        //        "id":"1463471322288128",
        //        "id_str":"1463471322288128",
        //        "order_type":1,
        //        "datetime":"1646127778",
        //        "microtimestamp":"1646127777950000",
        //        "amount":0.05,
        //        "amount_str":"0.05000000",
        //        "price":1000,
        //        "price_str":"1000.00"
        //     },
        //     "channel":"private-my_orders_ltcusd-4848701",
        // }
        //
        const channel = this.safeString (message, 'channel');
        const order = this.safeValue (message, 'data', {});
        const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
        if (this.orders === undefined) {
            this.orders = new ArrayCacheBySymbolById (limit);
        }
        const stored = this.orders;
        const subscription = this.safeValue (client.subscriptions, channel);
        const symbol = this.safeString (subscription, 'symbol');
        const market = this.market (symbol);
        const parsed = this.parseWsOrder (order, market);
        stored.append (parsed);
        client.resolve (this.orders, channel);
    }

    parseWsOrder (order, market = undefined) {
        //
        //   {
        //        "id":"1463471322288128",
        //        "id_str":"1463471322288128",
        //        "order_type":1,
        //        "datetime":"1646127778",
        //        "microtimestamp":"1646127777950000",
        //        "amount":0.05,
        //        "amount_str":"0.05000000",
        //        "price":1000,
        //        "price_str":"1000.00"
        //    }
        //
        const id = this.safeString (order, 'id_str');
        const orderType = this.safeStringLower (order, 'order_type');
        const price = this.safeString (order, 'price_str');
        const amount = this.safeString (order, 'amount_str');
        const side = (orderType === '1') ? 'sell' : 'buy';
        const timestamp = this.safeIntegerProduct (order, 'datetime', 1000);
        market = this.safeMarket (undefined, market);
        const symbol = market['symbol'];
        return this.safeOrder ({
            'info': order,
            'symbol': symbol,
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'type': undefined,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'amount': amount,
            'cost': undefined,
            'average': undefined,
            'filled': undefined,
            'remaining': undefined,
            'status': undefined,
            'fee': undefined,
            'trades': undefined,
        }, market);
    }

    handleOrderBookSubscription (client, message, subscription) {
        const type = this.safeString (subscription, 'type');
        const symbol = this.safeString (subscription, 'symbol');
        if (symbol in this.orderbooks) {
            delete this.orderbooks[symbol];
        }
        if (type === 'order_book') {
            const limit = this.safeInteger (subscription, 'limit', 100);
            this.orderbooks[symbol] = this.orderBook ({}, limit);
        } else if (type === 'detail_order_book') {
            const limit = this.safeInteger (subscription, 'limit', 100);
            this.orderbooks[symbol] = this.indexedOrderBook ({}, limit);
        } else if (type === 'diff_order_book') {
            const limit = this.safeInteger (subscription, 'limit');
            this.orderbooks[symbol] = this.orderBook ({}, limit);
            // fetch the snapshot in a separate async call
            this.spawn (this.fetchOrderBookSnapshot, client, message, subscription);
        }
    }

    handleSubscriptionStatus (client, message) {
        //
        //     {
        //         'event': "bts:subscription_succeeded",
        //         'channel': "detail_order_book_btcusd",
        //         'data': {},
        //     }
        //     {
        //         event: 'bts:subscription_succeeded',
        //         channel: 'private-my_orders_ltcusd-4848701',
        //         data: {}
        //     }
        //
        const channel = this.safeString (message, 'channel');
        const subscription = this.safeValue (client.subscriptions, channel, {});
        const method = this.safeValue (subscription, 'method');
        if (method !== undefined) {
            method.call (this, client, message, subscription);
        }
        return message;
    }

    handleSubject (client, message) {
        //
        //     {
        //         data: {
        //             timestamp: '1583656800',
        //             microtimestamp: '1583656800237527',
        //             bids: [
        //                 ["8732.02", "0.00002478", "1207590500704256"],
        //                 ["8729.62", "0.01600000", "1207590502350849"],
        //                 ["8727.22", "0.01800000", "1207590504296448"],
        //             ],
        //             asks: [
        //                 ["8735.67", "2.00000000", "1207590693249024"],
        //                 ["8735.67", "0.01700000", "1207590693634048"],
        //                 ["8735.68", "1.53294500", "1207590692048896"],
        //             ],
        //         },
        //         event: 'data',
        //         channel: 'detail_order_book_btcusd'
        //     }
        //
        // private order
        //     {
        //         "data":{
        //         "id":"1463471322288128",
        //         "id_str":"1463471322288128",
        //         "order_type":1,
        //         "datetime":"1646127778",
        //         "microtimestamp":"1646127777950000",
        //         "amount":0.05,
        //         "amount_str":"0.05000000",
        //         "price":1000,
        //         "price_str":"1000.00"
        //         },
        //         "channel":"private-my_orders_ltcusd-4848701",
        //     }
        //
        const channel = this.safeString (message, 'channel');
        const subscription = this.safeValue (client.subscriptions, channel);
        const type = this.safeString (subscription, 'type');
        const methods = {
            'live_trades': this.handleTrade,
            // 'live_orders': this.handleOrderBook,
            'order_book': this.handleOrderBook,
            'detail_order_book': this.handleOrderBook,
            'diff_order_book': this.handleOrderBook,
            'private-my_orders': this.handleOrders,
        };
        const method = this.safeValue (methods, type);
        if (method === undefined) {
            return message;
        } else {
            return method.call (this, client, message);
        }
    }

    handleErrorMessage (client, message) {
        // {
        //     event: 'bts:error',
        //     channel: '',
        //     data: { code: 4009, message: 'Connection is unauthorized.' }
        // }
        const event = this.safeString (message, 'event');
        if (event === 'bts:error') {
            const feedback = this.id + ' ' + this.json (message);
            const data = this.safeValue (message, 'data', {});
            const code = this.safeNumber (data, 'code');
            this.throwExactlyMatchedException (this.exceptions['exact'], code, feedback);
        }
        return message;
    }

    handleMessage (client, message) {
        if (!this.handleErrorMessage (client, message)) {
            return;
        }
        //
        //     {
        //         'event': "bts:subscription_succeeded",
        //         'channel': "detail_order_book_btcusd",
        //         'data': {},
        //     }
        //
        //     {
        //         data: {
        //             timestamp: '1583656800',
        //             microtimestamp: '1583656800237527',
        //             bids: [
        //                 ["8732.02", "0.00002478", "1207590500704256"],
        //                 ["8729.62", "0.01600000", "1207590502350849"],
        //                 ["8727.22", "0.01800000", "1207590504296448"],
        //             ],
        //             asks: [
        //                 ["8735.67", "2.00000000", "1207590693249024"],
        //                 ["8735.67", "0.01700000", "1207590693634048"],
        //                 ["8735.68", "1.53294500", "1207590692048896"],
        //             ],
        //         },
        //         event: 'data',
        //         channel: 'detail_order_book_btcusd'
        //     }
        //
        //     {
        //         event: 'bts:subscription_succeeded',
        //         channel: 'private-my_orders_ltcusd-4848701',
        //         data: {}
        //     }
        //
        const event = this.safeString (message, 'event');
        if (event === 'bts:subscription_succeeded') {
            return this.handleSubscriptionStatus (client, message);
        } else {
            return this.handleSubject (client, message);
        }
    }

    async authenticate (params = {}) {
        this.checkRequiredCredentials ();
        const time = this.milliseconds ();
        const expiresIn = this.safeInteger (this.options, 'expiresIn');
        if (time > expiresIn) {
            const response = await this.privatePostWebsocketsToken (params);
            //
            // {
            //     "valid_sec":60,
            //     "token":"siPaT4m6VGQCdsDCVbLBemiphHQs552e",
            //     "user_id":4848701
            // }
            //
            const sessionToken = this.safeString (response, 'token');
            if (sessionToken !== undefined) {
                const userId = this.safeNumber (response, 'user_id');
                const validity = this.safeIntegerProduct (response, 'valid_sec', 1000);
                this.options['expiresIn'] = this.sum (time, validity);
                this.options['userId'] = userId;
                this.options['wsSessionToken'] = sessionToken;
                return response;
            }
        }
    }

    async subscribePrivate (subscription, messageHash, params = {}) {
        const url = this.urls['api']['ws'];
        await this.authenticate ();
        messageHash += '-' + this.options['userId'];
        const request = {
            'event': 'bts:subscribe',
            'data': {
                'channel': messageHash,
                'auth': this.options['wsSessionToken'],
            },
        };
        subscription['messageHash'] = messageHash;
        return await this.watch (url, messageHash, this.extend (request, params), messageHash, subscription);
    }
};
