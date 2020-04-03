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
                'watchTrades': false, // not implemented yet
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
            },
        });
    }

    async watchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const url = this.urls['api']['ws'];
        const messageHash = 'orderbook:' + market['id'];
        const request = {
            'method': 'subscribeOrderbook',
            'params': {
                'symbol': market['id'],
            },
        };
        const future = this.watch (url, messageHash, request, messageHash);
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
        await this.loadMarkets ();
        const market = this.market (symbol);
        const url = this.urls['api']['ws'];
        const messageHash = 'ticker:' + market['id'];
        const request = {
            'method': 'subscribeTicker',
            'params': {
                'symbol': market['id'],
            },
            'id': market['id'],
        };
        return await this.watch (url, messageHash, request, messageHash);
    }

    handleTicker (client, message) {
        const params = this.safeValue (message, 'params');
        const marketId = this.safeValue (params, 'symbol');
        let market = undefined;
        let symbol = undefined;
        if (marketId !== undefined) {
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
                symbol = market['symbol'];
            }
        }
        if (market === undefined || symbol === undefined) {
            // if market or symbol is undefined we just return
            return;
        }
        const result = this.parseTicker (params, market);
        this.tickers[symbol] = result;
        const messageHash = 'ticker:' + marketId;
        client.resolve (result, messageHash);
    }

    signMessage (client, messageHash, message, params = {}) {
        // todo: implement hitbtc2 signMessage
        return message;
    }

    handleNotification (client, message) {
        // TODO
        return message;
    }

    handleMessage (client, message) {
        const methods = {
            'snapshotOrderbook': this.handleOrderBookSnapshot,
            'updateOrderbook': this.handleUpdateOrderbook,
            'ticker': this.handleTicker,
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
