'use strict';

//  ---------------------------------------------------------------------------

const ccxt = require ('ccxt');
const { BadSymbol } = require ('ccxt/js/base/errors');
const { ArrayCache, ArrayCacheBySymbolById, NotSupported } = require ('./base/Cache');

//  ---------------------------------------------------------------------------

module.exports = class aax extends ccxt.aax {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                // 'watchOHLCV': false, // missing on the exchange side
                'watchOrderBook': true,
                'watchTicker': true,
                // 'watchTickers': false, // for now
                'watchTrades': true,
                // 'watchBalance': false,
                // 'watchStatus': false, // for now
                // 'watchOrders': true,
                // 'watchMyTrades': true,
            },
            'urls': {
                'api': {
                    'ws': {
                        'public': 'wss://realtime.aax.com/marketdata/v2/',
                        'private': 'wss://stream.aax.com/notification/v2/',
                    },
                },
            },
            'options': {
                'tradesLimit': 1000,
                'ordersLimit': 1000,
                'myTradesLimit': 1000,
            },
        });
    }

    async watchTicker (symbol, params = {}) {
        const name = 'tickers';
        await this.loadMarkets ();
        const market = this.market (symbol);
        const messageHash = market['id'] + '@' + name;
        const url = this.urls['api']['ws']['public'];
        const subscribe = {
            'e': 'subscribe',
            'stream': name,
        };
        const request = this.extend (subscribe, params);
        return await this.watch (url, messageHash, request, name);
    }

    async handleTicker (client, message) {

    }

    async watchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        const name = 'trade';
        await this.loadMarkets ();
        const market = this.market (symbol);
        const messageHash = market['id'] + '@' + name;
        const url = this.urls['api']['ws']['public'];
        const subscribe = {
            'e': 'subscribe',
            'stream': messageHash,
        };
        const request = this.extend (subscribe, params);
        const trades = await this.watch (url, messageHash, request, messageHash);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleTrades (client, message, subscription) {
        //
        //     {
        //         e: 'BTCUSDT@trade',
        //         p: '-54408.21000000',
        //         q: '0.007700',
        //         t: 1619644477710
        //     }
        //
        const messageHash = this.safeString (message, 'e');
        const parts = messageHash.split ('@');
        const marketId = this.safeString (parts, 0);
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        // const timestamp = this.safeInteger (message, 't');
        // const amount = this.safeNumber (message, 'q');
        // const price = this.safeNumber (message, 'p');
        const trade = this.parseTrade (message, market);
        let stored = this.safeValue (this.trades, symbol);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            stored = new ArrayCache (limit);
            this.trades[symbol] = stored;
        }
        stored.append (trade);
        client.resolve (stored, messageHash);
    }

    async watchOrderBook (symbol, limit = undefined, params = {}) {
        const name = 'book';
        await this.loadMarkets ();
        const market = this.market (symbol);
        limit = (limit === undefined) ? 20 : limit;
        if ((limit !== 20) && (limit !== 50)) {
            throw new NotSupported (this.id + ' watchOrderBook() accepts limit values of 20 or 50 only');
        }
        const messageHash = market['id'] + '@' + name + '_' + limit.toString ();
        const url = this.urls['api']['ws']['public'];
        const subscribe = {
            'e': 'subscribe',
            'stream': messageHash,
        };
        const request = this.extend (subscribe, params);
        const orderbook = await this.watch (url, messageHash, request, messageHash);
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
        //     {
        //         asks: [
        //             [ '54397.48000000', '0.002300' ],
        //             [ '54407.86000000', '1.880000' ],
        //             [ '54409.34000000', '0.046900' ],
        //         ],
        //         bids: [
        //             [ '54383.17000000', '1.380000' ],
        //             [ '54374.43000000', '1.880000' ],
        //             [ '54354.07000000', '0.013400' ],
        //         ],
        //         e: 'BTCUSDT@book_20',
        //         t: 1619626148086
        //     }
        //
        const messageHash = this.safeString (message, 'e');
        const [ marketId, nameLimit ] = messageHash.split ('@');
        const parts = nameLimit.split ('_');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const limitString = this.safeString (parts, 1);
        const limit = parseInt (limitString);
        const timestamp = this.safeInteger (message, 't');
        const snapshot = this.parseOrderBook (message, symbol, timestamp);
        let orderbook = undefined;
        if (!(symbol in this.orderbooks)) {
            orderbook = this.orderBook (snapshot, limit);
            this.orderbooks[symbol] = orderbook;
        } else {
            orderbook = this.orderbooks[symbol];
            orderbook.reset (snapshot)
        }
        client.resolve (orderbook, messageHash);
    }

    handleSystemStatus (client, message) {
        // { e: 'system', status: [ { all: 'active' } ] }
    }

    handleSubscriptionStatus (client, message) {
        // { e: 'reply', status: 'ok' }
    }

    handleMessage (client, message) {
        //
        //     {
        //         e: 'system',
        //         status: [
        //             { all: 'active' }
        //         ]
        //     }
        //
        //
        //     {
        //         asks: [
        //             [ '54397.48000000', '0.002300' ],
        //             [ '54407.86000000', '1.880000' ],
        //             [ '54409.34000000', '0.046900' ],
        //         ],
        //         bids: [
        //             [ '54383.17000000', '1.380000' ],
        //             [ '54374.43000000', '1.880000' ],
        //             [ '54354.07000000', '0.013400' ],
        //         ],
        //         e: 'BTCUSDT@book_20',
        //         t: 1619626148086
        //     }
        //
        // server may publish empty events if there is nothing to send right after a new connection is established
        //
        //     {"e":"empty"}
        //
        const e = this.safeString (message, 'e');
        const parts = e.split ('@');
        const numParts = parts.length;
        let name = undefined;
        if (numParts > 1) {
            const nameLimit = this.safeString (parts, 1);
            const subParts = nameLimit.split ('_');
            name = this.safeString (subParts, 0);
        } else {
            name = this.safeString (parts, 0);
        }
        const methods = {
            'reply': this.handleSubscriptionStatus,
            'system': this.handleSystemStatus,
            'book': this.handleOrderBook,
            'trade': this.handleTrades,
            'empty': undefined, // server may publish empty events if there is nothing to send right after a new connection is established
            'open': this.handleOrder,
            'change': this.handleOrder,
            'done': this.handleOrder,
        };
        const method = this.safeValue (methods, name);
        if (method !== undefined) {
            return method.call (this, client, message);
        }
        console.log (message);
        //
        // if (method === undefined) {
        //     if (type === 'match') {
        //         if (authenticated) {
        //             this.handleMyTrade (client, message);
        //             this.handleOrder (client, message);
        //         } else {
        //             this.handleTrade (client, message);
        //         }
        //     }
        // } else {
        // }
        // process.exit ();
    }
};
