'use strict';

//  ---------------------------------------------------------------------------

const ripioRest = require ('../ripio.js');
const { ArrayCache } = require ('./base/Cache');

//  ---------------------------------------------------------------------------

module.exports = class ripio extends ripioRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchOrderBook': true,
                'watchTrades': true,
                'watchTicker': true,
            },
            'urls': {
                'api': {
                    'ws': 'wss://api.exchange.ripio.com/ws/v2/consumer/non-persistent/public/default/',
                },
            },
            'options': {
                'tradesLimit': 1000,
                'uuid': this.uuid (),
            },
        });
    }

    async watchTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const name = 'trades';
        const messageHash = name + '_' + market['id'].toLowerCase ();
        const url = this.urls['api']['ws'] + messageHash + '/' + this.options['uuid'];
        const subscription = {
            'name': name,
            'symbol': symbol,
            'messageHash': messageHash,
            'method': this.handleTrade,
        };
        const trades = await this.watch (url, messageHash, undefined, messageHash, subscription);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleTrade (client, message, subscription) {
        //
        //     {
        //         messageId: 'CAAQAA==',
        //         payload: 'eyJjcmVhdGVkX2F0IjogMTYwMTczNjI0NywgImFtb3VudCI6ICIwLjAwMjAwIiwgInByaWNlIjogIjEwNTkzLjk5MDAwMCIsICJzaWRlIjogIkJVWSIsICJwYWlyIjogIkJUQ19VU0RDIiwgInRha2VyX2ZlZSI6ICIwIiwgInRha2VyX3NpZGUiOiAiQlVZIiwgIm1ha2VyX2ZlZSI6ICIwIiwgInRha2VyIjogMjYxODU2NCwgIm1ha2VyIjogMjYxODU1N30=',
        //         properties: {},
        //         publishTime: '2020-10-03T14:44:09.881Z'
        //     }
        //
        const payload = this.safeString (message, 'payload');
        if (payload === undefined) {
            return message;
        }
        const data = JSON.parse (this.base64ToString (payload));
        //
        //     {
        //         created_at: 1601736247,
        //         amount: '0.00200',
        //         price: '10593.990000',
        //         side: 'BUY',
        //         pair: 'BTC_USDC',
        //         taker_fee: '0',
        //         taker_side: 'BUY',
        //         maker_fee: '0',
        //         taker: 2618564,
        //         maker: 2618557
        //     }
        //
        const symbol = this.safeString (subscription, 'symbol');
        const messageHash = this.safeString (subscription, 'messageHash');
        const market = this.market (symbol);
        const trade = this.parseTrade (data, market);
        let tradesArray = this.safeValue (this.trades, symbol);
        if (tradesArray === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            tradesArray = new ArrayCache (limit);
            this.trades[symbol] = tradesArray;
        }
        tradesArray.append (trade);
        client.resolve (tradesArray, messageHash);
    }

    async watchTicker (symbol, params = {}) {
        /**
         * @method
         * @name ripio#watchTicker
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the ripio api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const name = 'rate';
        const messageHash = name + '_' + market['id'].toLowerCase ();
        const url = this.urls['api']['ws'] + messageHash + '/' + this.options['uuid'];
        const subscription = {
            'name': name,
            'symbol': symbol,
            'messageHash': messageHash,
            'method': this.handleTicker,
        };
        return await this.watch (url, messageHash, undefined, messageHash, subscription);
    }

    handleTicker (client, message, subscription) {
        //
        //     {
        //         messageId: 'CAAQAA==',
        //         payload: 'eyJidXkiOiBbeyJhbW91bnQiOiAiMC4wOTMxMiIsICJ0b3RhbCI6ICI4MzguMDgiLCAicHJpY2UiOiAiOTAwMC4wMCJ9XSwgInNlbGwiOiBbeyJhbW91bnQiOiAiMC4wMDAwMCIsICJ0b3RhbCI6ICIwLjAwIiwgInByaWNlIjogIjkwMDAuMDAifV0sICJ1cGRhdGVkX2lkIjogMTI0NDA0fQ==',
        //         properties: {},
        //         publishTime: '2020-10-03T10:05:09.445Z'
        //     }
        //
        const payload = this.safeString (message, 'payload');
        if (payload === undefined) {
            return message;
        }
        const data = JSON.parse (this.base64ToString (payload));
        //
        //     {
        //         "pair": "BTC_BRL",
        //         "last_price": "68558.59",
        //         "low": "54736.11",
        //         "high": "70034.68",
        //         "variation": "8.75",
        //         "volume": "10.10537"
        //     }
        //
        const ticker = this.parseTicker (data);
        const timestamp = this.parse8601 (this.safeString (message, 'publishTime'));
        ticker['timestamp'] = timestamp;
        ticker['datetime'] = this.iso8601 (timestamp);
        const symbol = ticker['symbol'];
        this.tickers[symbol] = ticker;
        const messageHash = this.safeString (subscription, 'messageHash');
        if (messageHash !== undefined) {
            client.resolve (ticker, messageHash);
        }
        return message;
    }

    async watchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name ripio#watchOrderBook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the ripio api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const name = 'orderbook';
        const messageHash = name + '_' + market['id'].toLowerCase ();
        const url = this.urls['api']['ws'] + messageHash + '/' + this.options['uuid'];
        const client = this.client (url);
        const subscription = {
            'name': name,
            'symbol': symbol,
            'messageHash': messageHash,
            'method': this.handleOrderBook,
        };
        if (!(messageHash in client.subscriptions)) {
            this.orderbooks[symbol] = this.orderBook ({});
            client.subscriptions[messageHash] = subscription;
            const options = this.safeValue (this.options, 'fetchOrderBookSnapshot', {});
            const delay = this.safeInteger (options, 'delay', this.rateLimit);
            // fetch the snapshot in a separate async call after a warmup delay
            this.delay (delay, this.fetchOrderBookSnapshot, client, subscription);
        }
        const orderbook = await this.watch (url, messageHash, undefined, messageHash, subscription);
        return orderbook.limit (limit);
    }

    async fetchOrderBookSnapshot (client, subscription) {
        const symbol = this.safeString (subscription, 'symbol');
        const messageHash = this.safeString (subscription, 'messageHash');
        try {
            // todo: this is a synch blocking call in ccxt.php - make it async
            const snapshot = await this.fetchOrderBook (symbol);
            const orderbook = this.orderbooks[symbol];
            const messages = orderbook.cache;
            orderbook.reset (snapshot);
            // unroll the accumulated deltas
            for (let i = 0; i < messages.length; i++) {
                const message = messages[i];
                this.handleOrderBookMessage (client, message, orderbook);
            }
            this.orderbooks[symbol] = orderbook;
            client.resolve (orderbook, messageHash);
        } catch (e) {
            client.reject (e, messageHash);
        }
    }

    handleOrderBook (client, message, subscription) {
        const messageHash = this.safeString (subscription, 'messageHash');
        const symbol = this.safeString (subscription, 'symbol');
        const orderbook = this.safeValue (this.orderbooks, symbol);
        if (orderbook === undefined) {
            return message;
        }
        if (orderbook['nonce'] === undefined) {
            orderbook.cache.push (message);
        } else {
            this.handleOrderBookMessage (client, message, orderbook);
            client.resolve (orderbook, messageHash);
        }
        return message;
    }

    handleOrderBookMessage (client, message, orderbook) {
        //
        //     {
        //         messageId: 'CAAQAA==',
        //         payload: 'eyJidXkiOiBbeyJhbW91bnQiOiAiMC4wOTMxMiIsICJ0b3RhbCI6ICI4MzguMDgiLCAicHJpY2UiOiAiOTAwMC4wMCJ9XSwgInNlbGwiOiBbeyJhbW91bnQiOiAiMC4wMDAwMCIsICJ0b3RhbCI6ICIwLjAwIiwgInByaWNlIjogIjkwMDAuMDAifV0sICJ1cGRhdGVkX2lkIjogMTI0NDA0fQ==',
        //         properties: {},
        //         publishTime: '2020-10-03T10:05:09.445Z'
        //     }
        //
        const payload = this.safeString (message, 'payload');
        if (payload === undefined) {
            return message;
        }
        const data = JSON.parse (this.base64ToString (payload));
        //
        //     {
        //         "buy": [
        //             {"amount": "0.05000", "total": "532.77", "price": "10655.41"}
        //         ],
        //         "sell": [
        //             {"amount": "0.00000", "total": "0.00", "price": "10655.41"}
        //         ],
        //         "updated_id": 99740
        //     }
        //
        const nonce = this.safeInteger (data, 'updated_id');
        if (nonce > orderbook['nonce']) {
            const asks = this.safeValue (data, 'sell', []);
            const bids = this.safeValue (data, 'buy', []);
            this.handleDeltas (orderbook['asks'], asks, orderbook['nonce']);
            this.handleDeltas (orderbook['bids'], bids, orderbook['nonce']);
            orderbook['nonce'] = nonce;
            const timestamp = this.parse8601 (this.safeString (message, 'publishTime'));
            orderbook['timestamp'] = timestamp;
            orderbook['datetime'] = this.iso8601 (timestamp);
        }
        return orderbook;
    }

    handleDelta (bookside, delta) {
        const price = this.safeFloat (delta, 'price');
        const amount = this.safeFloat (delta, 'amount');
        bookside.store (price, amount);
    }

    handleDeltas (bookside, deltas) {
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta (bookside, deltas[i]);
        }
    }

    async ack (client, messageId) {
        // the exchange requires acknowledging each received message
        await client.send ({ 'messageId': messageId });
    }

    handleMessage (client, message) {
        //
        //     {
        //         messageId: 'CAAQAA==',
        //         payload: 'eyJidXkiOiBbeyJhbW91bnQiOiAiMC4wNTAwMCIsICJ0b3RhbCI6ICI1MzIuNzciLCAicHJpY2UiOiAiMTA2NTUuNDEifV0sICJzZWxsIjogW3siYW1vdW50IjogIjAuMDAwMDAiLCAidG90YWwiOiAiMC4wMCIsICJwcmljZSI6ICIxMDY1NS40MSJ9XSwgInVwZGF0ZWRfaWQiOiA5OTc0MH0=',
        //         properties: {},
        //         publishTime: '2020-09-30T17:35:27.851Z'
        //     }
        //
        const messageId = this.safeString (message, 'messageId');
        if (messageId !== undefined) {
            // the exchange requires acknowledging each received message
            this.spawn (this.ack, client, messageId);
        }
        const keys = Object.keys (client.subscriptions);
        const firstKey = this.safeString (keys, 0);
        const subscription = this.safeValue (client.subscriptions, firstKey, {});
        const method = this.safeValue (subscription, 'method');
        if (method !== undefined) {
            return method.call (this, client, message, subscription);
        }
        return message;
    }
};
