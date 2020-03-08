'use strict';

//  ---------------------------------------------------------------------------

const ccxt = require ('ccxt');

//  ---------------------------------------------------------------------------

module.exports = class bitstamp extends ccxt.bitstamp {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchOrderBook': true,
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
                'watchOrderBook': {
                    'type': 'order_book', // detail_order_book, diff_order_book
                },
                'tradesLimit': 1000,
                'OHLCVLimit': 1000,
            },
        });
    }

    async watchOrderBook (symbol, limit = undefined, params = {}) {
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
        const future = this.watch (url, messageHash, message, messageHash, subscription);
        return await this.after (future, this.limitOrderBook, symbol, limit, params);
    }

    limitOrderBook (orderbook, symbol, limit = undefined, params = {}) {
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
            'method': this.handleOrderBookSubscription,
            'limit': limit,
            'params': params,
        };
        const message = this.extend (request, params);
        const future = this.watch (url, messageHash, message, messageHash, subscription);
        return await this.after (future, this.filterBySinceLimit, since, limit);
    }

    parseTrade (trade, market = undefined) {
        //
        //     {
        //         e: 'trade',       // event type
        //         E: 1579481530911, // event time
        //         s: 'ETHBTC',      // symbol
        //         t: 158410082,     // trade id
        //         p: '0.01914100',  // price
        //         q: '0.00700000',  // quantity
        //         b: 586187049,     // buyer order id
        //         a: 586186710,     // seller order id
        //         T: 1579481530910, // trade time
        //         m: false,         // is the buyer the market maker
        //         M: true           // binance docs say it should be ignored
        //     }
        //
        const event = this.safeString (trade, 'e');
        if (event === undefined) {
            return super.parseTrade (trade, market);
        }
        const id = this.safeString (trade, 't');
        const timestamp = this.safeInteger (trade, 'T');
        const price = this.safeFloat (trade, 'p');
        const amount = this.safeFloat (trade, 'q');
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
        let side = undefined;
        let takerOrMaker = undefined;
        const orderId = undefined;
        if ('m' in trade) {
            side = trade['m'] ? 'sell' : 'buy'; // this is reversed intentionally
            takerOrMaker = trade['m'] ? 'maker' : 'taker';
        }
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': id,
            'order': orderId,
            'type': undefined,
            'takerOrMaker': takerOrMaker,
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
        const array = this.safeValue (this.trades, symbol, []);
        array.push (trade);
        const length = array.length;
        if (length > this.options['tradesLimit']) {
            array.shift ();
        }
        this.trades[symbol] = array;
        client.resolve (array, channel);
    }

    signMessage (client, messageHash, message, params = {}) {
        // todo: implement binance signMessage
        return message;
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
        const channel = this.safeString (message, 'channel');
        const subscription = this.safeValue (client.subscriptions, channel);
        const type = this.safeString (subscription, 'type');
        const methods = {
            'live_trades': this.handleTrade,
            // 'live_orders': this.handleOrderBook,
            'order_book': this.handleOrderBook,
            'detail_order_book': this.handleOrderBook,
            'diff_order_book': this.handleOrderBook,
        };
        const method = this.safeValue (methods, type);
        if (method === undefined) {
            return message;
        } else {
            return method.call (this, client, message);
        }
    }

    handleErrorMessage (client, message) {
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
        const event = this.safeString (message, 'event');
        if (event === 'bts:subscription_succeeded') {
            return this.handleSubscriptionStatus (client, message);
        } else {
            return this.handleSubject (client, message);
        }
    }
};
