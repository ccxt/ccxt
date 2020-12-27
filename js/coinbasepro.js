'use strict';

//  ---------------------------------------------------------------------------

const ccxt = require ('ccxt');
const { ArrayCache } = require ('./base/Cache');

//  ---------------------------------------------------------------------------

module.exports = class coinbasepro extends ccxt.coinbasepro {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchOHLCV': false, // missing on the exchange side
                'watchOrderBook': true,
                'watchTicker': true,
                'watchTickers': false, // for now
                'watchTrades': true,
                'watchBalance': false,
                'watchStatus': false, // for now
            },
            'urls': {
                'api': {
                    'ws': 'wss://ws-feed.pro.coinbase.com',
                },
            },
        });
    }

    async subscribe (name, symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
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
        return await this.watch (url, messageHash, request, messageHash);
    }

    async watchTicker (symbol, params = {}) {
        const name = 'ticker';
        return await this.subscribe (name, symbol, params);
    }

    async watchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        const name = 'matches';
        const future = this.subscribe (name, symbol, params);
        return await this.after (future, this.filterBySinceLimit, since, limit, 'timestamp', true);
    }

    async watchOrderBook (symbol, limit = undefined, params = {}) {
        const name = 'level2';
        await this.loadMarkets ();
        const market = this.market (symbol);
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
        const subscription = {
            'messageHash': messageHash,
            'symbol': symbol,
            'marketId': market['id'],
            'limit': limit,
        };
        const future = this.watch (url, messageHash, request, messageHash, subscription);
        // this.subscribe (name, symbol, params);
        return await this.after (future, this.limitOrderBook, symbol, limit, params);
    }

    handleTrade (client, message) {
        //
        //     {
        //         type: 'match',
        //         trade_id: 82047307,
        //         maker_order_id: '0f358725-2134-435e-be11-753912a326e0',
        //         taker_order_id: '252b7002-87a3-425c-ac73-f5b9e23f3caf',
        //         side: 'sell',
        //         size: '0.00513192',
        //         price: '9314.78',
        //         product_id: 'BTC-USD',
        //         sequence: 12038915443,
        //         time: '2020-01-31T20:03:41.158814Z'
        //     }
        //
        const marketId = this.safeString (message, 'product_id');
        if (marketId !== undefined) {
            const trade = this.parseTrade (message);
            const symbol = trade['symbol'];
            // the exchange sends type = 'match'
            // but requires 'matches' upon subscribing
            // therefore we resolve 'matches' here instead of 'match'
            // const type = this.safeString (message, 'type');
            const type = 'matches';
            const messageHash = type + ':' + marketId;
            let array = this.safeValue (this.trades, symbol);
            if (array === undefined) {
                const tradesLimit = this.safeInteger (this.options, 'tradesLimit', 1000);
                array = new ArrayCache (tradesLimit);
                this.trades[symbol] = array;
            }
            array.append (trade);
            client.resolve (array, messageHash);
        }
        return message;
    }

    handleTicker (client, message) {
        //
        //     {
        //         type: 'ticker',
        //         sequence: 12042642428,
        //         product_id: 'BTC-USD',
        //         price: '9380.55',
        //         open_24h: '9450.81000000',
        //         volume_24h: '9611.79166047',
        //         low_24h: '9195.49000000',
        //         high_24h: '9475.19000000',
        //         volume_30d: '327812.00311873',
        //         best_bid: '9380.54',
        //         best_ask: '9380.55',
        //         side: 'buy',
        //         time: '2020-02-01T01:40:16.253563Z',
        //         trade_id: 82062566,
        //         last_size: '0.41969131'
        //     }
        //
        const marketId = this.safeString (message, 'product_id');
        if (marketId !== undefined) {
            const ticker = this.parseTicker (message);
            const symbol = ticker['symbol'];
            this.tickers[symbol] = ticker;
            const type = this.safeString (message, 'type');
            const messageHash = type + ':' + marketId;
            client.resolve (ticker, messageHash);
        }
        return message;
    }

    parseTicker (ticker, market = undefined) {
        //
        //     {
        //         type: 'ticker',
        //         sequence: 12042642428,
        //         product_id: 'BTC-USD',
        //         price: '9380.55',
        //         open_24h: '9450.81000000',
        //         volume_24h: '9611.79166047',
        //         low_24h: '9195.49000000',
        //         high_24h: '9475.19000000',
        //         volume_30d: '327812.00311873',
        //         best_bid: '9380.54',
        //         best_ask: '9380.55',
        //         side: 'buy',
        //         time: '2020-02-01T01:40:16.253563Z',
        //         trade_id: 82062566,
        //         last_size: '0.41969131'
        //     }
        //
        const type = this.safeString (ticker, 'type');
        if (type === undefined) {
            return super.parseTicker (ticker, market);
        }
        const marketId = this.safeString (ticker, 'product_id');
        const symbol = this.safeSymbol (marketId, market, '-');
        const timestamp = this.parse8601 (this.safeString (ticker, 'time'));
        const last = this.safeFloat (ticker, 'price');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high_24h'),
            'low': this.safeFloat (ticker, 'low_24h'),
            'bid': this.safeFloat (ticker, 'best_bid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'best_ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeFloat (ticker, 'open_24h'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'volume_24h'),
            'quoteVolume': undefined,
            'info': ticker,
        };
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
        const market = this.safeMarket (marketId, undefined, '-');
        const symbol = market['symbol'];
        const name = 'level2';
        const messageHash = name + ':' + marketId;
        const subscription = this.safeValue (client.subscriptions, messageHash, {});
        const limit = this.safeInteger (subscription, 'limit');
        if (type === 'snapshot') {
            this.orderbooks[symbol] = this.orderBook ({}, limit);
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
            'match': this.handleTrade,
            'ticker': this.handleTicker,
        };
        const method = this.safeValue (methods, type);
        if (method === undefined) {
            return message;
        } else {
            return method.call (this, client, message);
        }
    }
};

