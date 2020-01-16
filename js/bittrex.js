'use strict';

//  ---------------------------------------------------------------------------

const ccxt = require ('ccxt');

//  ---------------------------------------------------------------------------

module.exports = class bittrex extends ccxt.bittrex {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchOrderBook': true,
            },
            'urls': {
                'api': {
                    'signalr': 'https://socket.bittrex.com/signalr',
                },
            },
        });
    }

    async watchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const name = 'level2';
        const messageHash = name + ':' + market['id'];
        const url = this.urls['api']['ws'];
        const subscribe = {
            'type': 'subscribe',
            'product_ids': [
                market['id'],
            ],
            'channels': [
                name,
            ],
        };
        const request = this.extend (subscribe, params);
        // console.log (request);
        // process.exit ();
        const future = this.watch (url, messageHash, request, messageHash);
        return await this.after (future, this.limitOrderBook, symbol, limit, params);
    }

    limitOrderBook (orderbook, symbol, limit = undefined, params = {}) {
        return orderbook.limit (limit);
    }

    handleDelta (bookside, delta) {
        const price = this.safeFloat (delta, 0);
        const amount = this.safeFloat (delta, 1);
        bookside.store (price, amount);
    }

    handleDeltas (bookside, deltas) {
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta (bookside, deltas[i]);
        }
    }

    handleOrderBook (client, message) {
        //
        // first message (snapshot)
        //
        //     {
        //         "type": "snapshot",
        //         "product_id": "BTC-USD",
        //         "bids": [
        //             ["10101.10", "0.45054140"]
        //         ],
        //         "asks": [
        //             ["10102.55", "0.57753524"]
        //         ]
        //     }
        //
        // subsequent updates
        //
        //     {
        //         "type": "l2update",
        //         "product_id": "BTC-USD",
        //         "time": "2019-08-14T20:42:27.265Z",
        //         "changes": [
        //             [ "buy", "10101.80000000", "0.162567" ]
        //         ]
        //     }
        //
        const type = this.safeString (message, 'type');
        const marketId = this.safeString (message, 'product_id');
        if (marketId !== undefined) {
            let symbol = undefined;
            let market = undefined;
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
                symbol = market['symbol'];
            } else {
                const [ baseId, quoteId ] = marketId.split ('-');
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            }
            const name = 'level2';
            const messageHash = name + ':' + marketId;
            if (type === 'snapshot') {
                const depth = 50; // default depth is 50
                this.orderbooks[symbol] = this.orderBook ({}, depth);
                const orderbook = this.orderbooks[symbol];
                this.handleDeltas (orderbook['asks'], this.safeValue (message, 'asks', []));
                this.handleDeltas (orderbook['bids'], this.safeValue (message, 'bids', []));
                orderbook['timestamp'] = undefined;
                orderbook['datetime'] = undefined;
                client.resolve (orderbook, messageHash);
            } else if (type === 'l2update') {
                const orderbook = this.orderbooks[symbol];
                const timestamp = this.parse8601 (this.safeString (message, 'time'));
                const changes = this.safeValue (message, 'changes', []);
                const sides = {
                    'sell': 'asks',
                    'buy': 'bids',
                };
                for (let i = 0; i < changes.length; i++) {
                    const change = changes[i];
                    const key = this.safeString (change, 0);
                    const side = this.safeString (sides, key);
                    const price = this.safeFloat (change, 1);
                    const amount = this.safeFloat (change, 2);
                    const bookside = orderbook[side];
                    bookside.store (price, amount);
                }
                orderbook['timestamp'] = timestamp;
                orderbook['datetime'] = this.iso8601 (timestamp);
                client.resolve (orderbook, messageHash);
            }
        }
    }

    signMessage (client, messageHash, message, params = {}) {
        // todo: implement coinbasepro signMessage() via parent sign()
        return message;
    }

    handleSubscriptionStatus (client, message) {
        //
        //     {
        //         type: 'subscriptions',
        //         channels: [
        //             {
        //                 name: 'level2',
        //                 product_ids: [ 'ETH-BTC' ]
        //             }
        //         ]
        //     }
        //
        return message;
    }

    handleMessage (client, message) {
        const type = this.safeString (message, 'type');
        const methods = {
            'snapshot': this.handleOrderBook,
            'l2update': this.handleOrderBook,
            'subscribe': this.handleSubscriptionStatus,
        };
        const method = this.safeValue (methods, type);
        if (method === undefined) {
            return message;
        } else {
            return method.call (this, client, message);
        }
    }
};

