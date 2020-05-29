'use strict';

//  ---------------------------------------------------------------------------

const ccxt = require ('ccxt');

//  ---------------------------------------------------------------------------

module.exports = class bitvavo extends ccxt.bitvavo {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchOrderBook': true,
            },
            'urls': {
                'api': {
                    'ws': 'wss://ws.bitvavo.com/v2',
                },
            },
            'options': {
                'tradesLimit': 1000,
                'ordersLimit': 1000,
                'OHLCVLimit': 1000,
            },
        });
    }

    async watchTicker (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const name = 'ticker24h';
        const messageHash = name + '@' + market['id'];
        const url = this.urls['api']['ws'];
        const request = {
            'action': 'subscribe',
            'channels': [
                {
                    'name': name,
                    'markets': [
                        market['id'],
                    ],
                },
            ],
        };
        const message = this.extend (request, params);
        return await this.watch (url, messageHash, message, messageHash);
    }

    handleTicker (client, message) {
        //
        //     {
        //         event: 'ticker24h',
        //         data: [
        //             {
        //                 market: 'ETH-EUR',
        //                 open: '193.5',
        //                 high: '202.72',
        //                 low: '192.46',
        //                 last: '199.01',
        //                 volume: '3587.05020246',
        //                 volumeQuote: '708030.17',
        //                 bid: '199.56',
        //                 bidSize: '4.14730803',
        //                 ask: '199.57',
        //                 askSize: '6.13642074',
        //                 timestamp: 1590770885217
        //             }
        //         ]
        //     }
        //
        const event = this.safeString (message, 'event');
        const tickers = this.safeValue (message, 'data', []);
        for (let i = 0; i < tickers.length; i++) {
            const data = tickers[i];
            const marketId = this.safeString (data, 'market');
            if (marketId in this.markets_by_id) {
                const messageHash = event + '@' + marketId;
                const market = this.markets_by_id[marketId];
                const ticker = this.parseTicker (data, market);
                const symbol = ticker['symbol'];
                this.tickers[symbol] = ticker;
                client.resolve (ticker, messageHash);
            }
        }
        return message;
    }

    async watchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const name = 'book';
        const messageHash = name + '@' + market['id'];
        const url = this.urls['api']['ws'];
        const request = {
            'action': 'subscribe',
            'channels': [
                {
                    'name': name,
                    'markets': [
                        market['id'],
                    ],
                },
            ],
        };
        const subscription = {
            'messageHash': messageHash,
            'name': name,
            'symbol': symbol,
            'marketId': market['id'],
            'method': this.handleOrderBookSubscription,
            'limit': limit,
            'params': params,
        };
        const message = this.extend (request, params);
        const future = this.watch (url, messageHash, message, messageHash, subscription);
        return await this.after (future, this.limitOrderBook, symbol, limit, params);
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

    handleOrderBookMessage (client, message, orderbook) {
        //
        //     {
        //         event: 'book',
        //         market: 'BTC-EUR',
        //         nonce: 36947383,
        //         bids: [
        //             [ '8477.8', '0' ]
        //         ],
        //         asks: [
        //             [ '8550.9', '0' ]
        //         ]
        //     }
        //
        const nonce = this.safeInteger (message, 'nonce');
        if (nonce > orderbook['nonce']) {
            this.handleDeltas (orderbook['asks'], this.safeValue (message, 'asks', []));
            this.handleDeltas (orderbook['bids'], this.safeValue (message, 'bids', []));
            orderbook['nonce'] = nonce;
        }
        return orderbook;
    }

    handleOrderBook (client, message) {
        //
        //     {
        //         event: 'book',
        //         market: 'BTC-EUR',
        //         nonce: 36729561,
        //         bids: [
        //             [ '8513.3', '0' ],
        //             [ '8518.8', '0.64236203' ],
        //             [ '8513.6', '0.32435481' ],
        //         ],
        //         asks: []
        //     }
        //
        const event = this.safeString (message, 'event');
        const marketId = this.safeString (message, 'market');
        let market = undefined;
        let symbol = undefined;
        if (marketId !== undefined) {
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
                symbol = market['symbol'];
            }
        }
        const messageHash = event + '@' + market['id'];
        const orderbook = this.safeValue (this.orderbooks, symbol);
        if (orderbook === undefined) {
            return;
        }
        if (orderbook['nonce'] === undefined) {
            const subscription = this.safeValue (client.subscriptions, messageHash, {});
            const watchingOrderBookSnapshot = this.safeValue (subscription, 'watchingOrderBookSnapshot');
            if (watchingOrderBookSnapshot === undefined) {
                subscription['watchingOrderBookSnapshot'] = true;
                client.subscriptions[messageHash] = subscription;
                const options = this.safeValue (this.options, 'watchOrderBookSnapshot', {});
                const delay = this.safeInteger (options, 'delay', this.rateLimit);
                // fetch the snapshot in a separate async call after a warmup delay
                this.delay (delay, this.watchOrderBookSnapshot, client, message, subscription);
            }
            orderbook.cache.push (message);
        } else {
            this.handleOrderBookMessage (client, message, orderbook);
            client.resolve (orderbook, messageHash);
        }
    }

    async watchOrderBookSnapshot (client, message, subscription) {
        const symbol = this.safeString (subscription, 'symbol');
        const limit = this.safeInteger (subscription, 'limit');
        const params = this.safeValue (subscription, 'params');
        const marketId = this.safeString (subscription, 'marketId');
        const name = 'getBook';
        const messageHash = name + '@' + marketId;
        const url = this.urls['api']['ws'];
        const request = {
            'action': name,
            'market': marketId,
        };
        const future = this.watch (url, messageHash, request, messageHash, subscription);
        return await this.after (future, this.limitOrderBook, symbol, limit, params);
    }

    handleOrderBookSnapshot (client, message) {
        //
        //     {
        //         action: 'getBook',
        //         response: {
        //             market: 'BTC-EUR',
        //             nonce: 36946120,
        //             bids: [
        //                 [ '8494.9', '0.24399521' ],
        //                 [ '8494.8', '0.34884085' ],
        //                 [ '8493.9', '0.14535128' ],
        //             ],
        //             asks: [
        //                 [ '8495', '0.46982463' ],
        //                 [ '8495.1', '0.12178267' ],
        //                 [ '8496.2', '0.21924143' ],
        //             ]
        //         }
        //     }
        //
        const response = this.safeValue (message, 'response');
        if (response === undefined) {
            return message;
        }
        const marketId = this.safeString (response, 'market');
        let symbol = undefined;
        if (marketId in this.markets_by_id) {
            const market = this.markets_by_id[marketId];
            symbol = market['symbol'];
        }
        const name = 'book';
        const messageHash = name + '@' + marketId;
        const orderbook = this.orderbooks[symbol];
        const snapshot = this.parseOrderBook (response);
        snapshot['nonce'] = this.safeInteger (response, 'nonce');
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

    handleOrderBookSubscription (client, message, subscription) {
        const symbol = this.safeString (subscription, 'symbol');
        const limit = this.safeInteger (subscription, 'limit');
        if (symbol in this.orderbooks) {
            delete this.orderbooks[symbol];
        }
        this.orderbooks[symbol] = this.orderBook ({}, limit);
    }

    handleOrderBookSubscriptions (client, message, marketIds) {
        const name = 'book';
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = this.safeString (marketIds, i);
            if (marketId in this.markets_by_id) {
                const market = this.markets_by_id[marketId];
                const symbol = market['symbol'];
                const messageHash = name + '@' + marketId;
                if (!(symbol in this.orderbooks)) {
                    const subscription = this.safeValue (client.subscriptions, messageHash);
                    const method = this.safeValue (subscription, 'method');
                    if (method !== undefined) {
                        method.call (this, client, message, subscription);
                    }
                }
            }
        }
    }

    handleSubscriptionStatus (client, message) {
        //
        //     {
        //         event: 'subscribed',
        //         subscriptions: {
        //             book: [ 'BTC-EUR' ]
        //         }
        //     }
        //
        const subscriptions = this.safeValue (message, 'subscriptions', {});
        const methods = {
            'book': this.handleOrderBookSubscriptions,
        };
        const names = Object.keys (subscriptions);
        for (let i = 0; i < names.length; i++) {
            const name = names[i];
            const method = this.safeValue (methods, name);
            if (method !== undefined) {
                const subscription = this.safeValue (subscriptions, name);
                method.call (this, client, message, subscription);
            }
        }
        return message;
    }

    signMessage (client, messageHash, message, params = {}) {
        // todo: implement signMessage
        return message;
    }

    handleMessage (client, message) {
        //
        //     {
        //         event: 'subscribed',
        //         subscriptions: {
        //             book: [ 'BTC-EUR' ]
        //         }
        //     }
        //
        //
        //     {
        //         event: 'book',
        //         market: 'BTC-EUR',
        //         nonce: 36729561,
        //         bids: [
        //             [ '8513.3', '0' ],
        //             [ '8518.8', '0.64236203' ],
        //             [ '8513.6', '0.32435481' ],
        //         ],
        //         asks: []
        //     }
        //
        //     {
        //         action: 'getBook',
        //         response: {
        //             market: 'BTC-EUR',
        //             nonce: 36946120,
        //             bids: [
        //                 [ '8494.9', '0.24399521' ],
        //                 [ '8494.8', '0.34884085' ],
        //                 [ '8493.9', '0.14535128' ],
        //             ],
        //             asks: [
        //                 [ '8495', '0.46982463' ],
        //                 [ '8495.1', '0.12178267' ],
        //                 [ '8496.2', '0.21924143' ],
        //             ]
        //         }
        //     }
        //
        const methods = {
            'subscribed': this.handleSubscriptionStatus,
            'book': this.handleOrderBook,
            'getBook': this.handleOrderBookSnapshot,
            // 'trade': this.handleTrade,
            // 'kline': this.handleOHLCV,
            'ticker24h': this.handleTicker,
            // 'outboundAccountInfo': this.handleBalance,
            // 'executionReport': this.handleOrder,
        };
        const event = this.safeString (message, 'event');
        let method = this.safeValue (methods, event);
        if (method === undefined) {
            const action = this.safeString (message, 'action');
            method = this.safeValue (methods, action);
            if (method === undefined) {
                const util = require ('util');
                console.log ('handleMessage', util.inspect (message, { showHidden: false, depth: null }));
                process.exit ();
                return message;
            } else {
                return method.call (this, client, message);
            }
        } else {
            return method.call (this, client, message);
        }
    }
};
