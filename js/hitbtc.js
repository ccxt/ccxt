'use strict';

//  ---------------------------------------------------------------------------

const ccxt = require ('ccxt');

//  ---------------------------------------------------------------------------

module.exports = class hitbtc extends ccxt.hitbtc {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchTicker': true,
                'watchTickers': false, // not available on exchange side
                'watchTrades': true,
                'watchOrderBook': true,
                'watchBalance': false, // not implemented yet
                'watchOHLCV': false, // not implemented yet
            },
            'urls': {
                'api': {
                    'ws': 'wss://api.hitbtc.com/api/2/ws',
                },
            },
            'options': {
                'tradesLimit': 1000,
                'methods': {
                    'orderbook': 'subscribeOrderbook',
                    'ticker': 'subscribeTicker',
                    'trades': 'subscribeTrades',
                    'candles': 'subscribeCandles',
                },
            },
        });
    }

    async watchPublic (symbol, channel, params = {}) {
        await this.loadMarkets ();
        const marketId = this.marketId (symbol);
        const url = this.urls['api']['ws'];
        const messageHash = channel + ':' + marketId;
        const methods = this.safeValue (this.options, 'methods', {});
        const method = this.safeString (methods, channel, channel);
        const requestId = this.nonce ();
        const subscribe = {
            'method': method,
            'params': {
                'symbol': marketId,
            },
            'id': requestId,
        };
        const request = this.deepExtend (subscribe, params);
        return await this.watch (url, messageHash, request, messageHash);
    }

    async watchOrderBook (symbol, limit = undefined, params = {}) {
        const future = this.watchPublic (symbol, 'orderbook', params);
        return await this.after (future, this.limitOrderBook, symbol, limit, params);
    }

    handleOrderBookSnapshot (client, message) {
        //
        //     {
        //         jsonrpc: "2.0",
        //         method: "snapshotOrderbook",
        //         params: {
        //             ask: [
        //                 { price: "6927.75", size: "0.11991" },
        //                 { price: "6927.76", size: "0.06200" },
        //                 { price: "6927.85", size: "0.01000" },
        //             ],
        //             bid: [
        //                 { price: "6926.18", size: "0.16898" },
        //                 { price: "6926.17", size: "0.06200" },
        //                 { price: "6925.97", size: "0.00125" },
        //             ],
        //             symbol: "BTCUSD",
        //             sequence: 494854,
        //             timestamp: "2020-04-03T08:58:53.460Z"
        //         }
        //     }
        //
        const params = this.safeValue (message, 'params', {});
        const marketId = this.safeString (params, 'symbol');
        if (marketId in this.markets_by_id) {
            const market = this.markets_by_id[marketId];
            const symbol = market['symbol'];
            const timestamp = this.parse8601 (this.safeString (params, 'timestamp'));
            const nonce = this.safeInteger (params, 'sequence');
            if (symbol in this.orderbooks) {
                delete this.orderbooks[symbol];
            }
            const snapshot = this.parseOrderBook (params, timestamp, 'bid', 'ask', 'price', 'size');
            const orderbook = this.orderBook (snapshot);
            orderbook['nonce'] = nonce;
            this.orderbooks[symbol] = orderbook;
            const messageHash = 'orderbook:' + marketId;
            client.resolve (orderbook, messageHash);
        }
    }

    handleOrderBookUpdate (client, message) {
        //
        //     {
        //         jsonrpc: "2.0",
        //         method: "updateOrderbook",
        //         params: {
        //             ask: [
        //                 { price: "6940.65", size: "0.00000" },
        //                 { price: "6940.66", size: "6.00000" },
        //                 { price: "6943.52", size: "0.04707" },
        //             ],
        //             bid: [
        //                 { price: "6938.40", size: "0.11991" },
        //                 { price: "6938.39", size: "0.00073" },
        //                 { price: "6936.65", size: "0.00000" },
        //             ],
        //             symbol: "BTCUSD",
        //             sequence: 497872,
        //             timestamp: "2020-04-03T09:03:56.685Z"
        //         }
        //     }
        //
        const params = this.safeValue (message, 'params', {});
        const marketId = this.safeString (params, 'symbol');
        if (marketId in this.markets_by_id) {
            const market = this.markets_by_id[marketId];
            const symbol = market['symbol'];
            if (symbol in this.orderbooks) {
                const timestamp = this.parse8601 (this.safeString (params, 'timestamp'));
                const nonce = this.safeInteger (params, 'sequence');
                const orderbook = this.orderbooks[symbol];
                const asks = this.safeValue (params, 'ask', []);
                const bids = this.safeValue (params, 'bid', []);
                this.handleDeltas (orderbook['asks'], asks);
                this.handleDeltas (orderbook['bids'], bids);
                orderbook['timestamp'] = timestamp;
                orderbook['datetime'] = this.iso8601 (timestamp);
                orderbook['nonce'] = nonce;
                this.orderbooks[symbol] = orderbook;
                const messageHash = 'orderbook:' + marketId;
                client.resolve (orderbook, messageHash);
            }
        }
    }

    handleDelta (bookside, delta) {
        const price = this.safeFloat (delta, 'price');
        const amount = this.safeFloat (delta, 'size');
        bookside.store (price, amount);
    }

    handleDeltas (bookside, deltas) {
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta (bookside, deltas[i]);
        }
    }

    async watchTicker (symbol, params = {}) {
        return await this.watchPublic (symbol, 'ticker', params);
    }

    handleTicker (client, message) {
        //
        //     {
        //         jsonrpc: '2.0',
        //         method: 'ticker',
        //         params: {
        //             ask: '6983.22',
        //             bid: '6980.77',
        //             last: '6980.77',
        //             open: '6650.05',
        //             low: '6606.45',
        //             high: '7223.11',
        //             volume: '79264.33941',
        //             volumeQuote: '540183372.5134832',
        //             timestamp: '2020-04-03T10:02:18.943Z',
        //             symbol: 'BTCUSD'
        //         }
        //     }
        //
        const params = this.safeValue (message, 'params');
        const marketId = this.safeValue (params, 'symbol');
        if (marketId in this.markets_by_id) {
            const market = this.markets_by_id[marketId];
            const symbol = market['symbol'];
            const result = this.parseTicker (params, market);
            this.tickers[symbol] = result;
            const method = this.safeValue (message, 'method');
            const messageHash = method + ':' + marketId;
            client.resolve (result, messageHash);
        }
    }

    async watchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        const future = this.watchPublic (symbol, 'trades', params);
        return await this.after (future, this.filterBySinceLimit, since, limit, true);
    }

    handleTrades (client, message) {
        //
        //     {
        //         jsonrpc: '2.0',
        //         method: 'snapshotTrades', // updateTrades
        //         params: {
        //             data: [
        //                 {
        //                     id: 814145791,
        //                     price: '6957.20',
        //                     quantity: '0.02779',
        //                     side: 'buy',
        //                     timestamp: '2020-04-03T10:28:20.032Z'
        //                 },
        //                 {
        //                     id: 814145792,
        //                     price: '6957.20',
        //                     quantity: '0.12918',
        //                     side: 'buy',
        //                     timestamp: '2020-04-03T10:28:20.039Z'
        //                 },
        //             ],
        //             symbol: 'BTCUSD'
        //         }
        //     }
        //
        const params = this.safeValue (message, 'params', {});
        const data = this.safeValue (params, 'data', []);
        const marketId = this.safeString (params, 'symbol');
        if (marketId in this.markets_by_id) {
            const market = this.markets_by_id[marketId];
            const symbol = market['symbol'];
            const messageHash = 'trades:' + marketId;
            const tradesLimit = this.safeInteger (this.options, 'tradesLimit', 1000);
            const stored = this.safeValue (this.trades, symbol, []);
            if (Array.isArray (data)) {
                const trades = this.parseTrades (data, market);
                for (let i = 0; i < trades.length; i++) {
                    stored.push (trades[i]);
                    const storedLength = stored.length;
                    if (storedLength > tradesLimit) {
                        stored.shift ();
                    }
                }
            } else {
                const trade = this.parseTrade (message, market);
                stored.push (trade);
                const length = stored.length;
                if (length > tradesLimit) {
                    stored.shift ();
                }
            }
            this.trades[symbol] = stored;
            client.resolve (stored, messageHash);
        }
        return message;
    }

    signMessage (client, messageHash, message, params = {}) {
        // todo: implement hitbtc signMessage
        return message;
    }

    handleNotification (client, message) {
        //
        //     { jsonrpc: '2.0', result: true, id: null }
        //
        return message;
    }

    handleMessage (client, message) {
        const methods = {
            'snapshotOrderbook': this.handleOrderBookSnapshot,
            'updateOrderbook': this.handleOrderBookUpdate,
            'ticker': this.handleTicker,
            'snapshotTrades': this.handleTrades,
            'updateTrades': this.handleTrades,
        };
        const event = this.safeString (message, 'method');
        const method = this.safeValue (methods, event);
        if (method === undefined) {
            this.handleNotification (client, message);
        } else {
            method.call (this, client, message);
        }
    }
};
