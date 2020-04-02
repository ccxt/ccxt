'use strict';

//  ---------------------------------------------------------------------------

const ccxt = require ('ccxt');

//  ---------------------------------------------------------------------------

module.exports = class ftx extends ccxt.ftx {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchOrderBook': true,
                'watchTicker': true,
                'watchTrades': true,
                'watchOHLCV': false, // missing on the exchange side
                'watchBalance': false, // missing on the exchange side
                'watchOrders': false, // not implemented yet
                'watchMyTrades': false, // not implemented yet
            },
            'urls': {
                'api': {
                    'ws': 'wss://ftx.com/ws',
                },
            },
            'options': {
                'tradesLimit': 1000,
            },
            'streaming': {
                // ftx does not support built-in ws protocol-level ping-pong
                // instead it requires a custom text-based ping-pong
                'ping': this.ping,
                'keepAlive': 15000,
            },
        });
    }

    async watchPublic (symbol, channel, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketId = market['id'];
        const url = this.urls['api']['ws'];
        const request = {
            'op': 'subscribe',
            'channel': channel,
            'market': marketId,
        };
        const messageHash = channel + ':' + marketId;
        return await this.watch (url, messageHash, request, messageHash);
    }

    async watchTicker (symbol, params = {}) {
        return await this.watchPublic (symbol, 'ticker');
    }

    async watchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        const future = this.watchPublic (symbol, 'trades');
        return await this.after (future, this.filterBySinceLimit, since, limit, true);
    }

    async watchOrderBook (symbol, limit = undefined, params = {}) {
        const future = this.watchPublic (symbol, 'orderbook');
        return await this.after (future, this.limitOrderBook, symbol, limit, params);
    }

    signMessage (client, messageHash, message) {
        return message;
    }

    handlePartial (client, message) {
        const methods = {
            'orderbook': this.handleOrderBookSnapshot,
        };
        const methodName = this.safeString (message, 'channel');
        const method = this.safeValue (methods, methodName);
        if (method) {
            method.call (this, client, message);
        }
    }

    handleUpdate (client, message) {
        const methods = {
            'trades': this.handleTrades,
            'ticker': this.handleTicker,
            'orderbook': this.handleOrderBookUpdate,
        };
        const methodName = this.safeString (message, 'channel');
        const method = this.safeValue (methods, methodName);
        if (method) {
            method.call (this, client, message);
        }
    }

    handleMessage (client, message) {
        const methods = {
            // ftx API docs say that all tickers and trades will be "partial"
            // however, in fact those are "update"
            // therefore we don't need to parse the "partial" update
            // since it is only used for orderbooks...
            // uncomment to fix if this is wrong
            // 'partial': this.handlePartial,
            'partial': this.handleOrderBookSnapshot,
            'update': this.handleUpdate,
            'subscribed': this.handleSubscriptionStatus,
            'unsubscribed': this.handleUnsubscriptionStatus,
            'info': this.handleInfo,
            'error': this.handleError,
            'pong': this.handlePong,
        };
        const methodName = this.safeString (message, 'type');
        const method = this.safeValue (methods, methodName);
        if (method) {
            method.call (this, client, message);
        }
    }

    getMessageHash (message) {
        const channel = this.safeString (message, 'channel');
        const marketId = this.safeString (message, 'market');
        return channel + ':' + marketId;
    }

    handleTicker (client, message) {
        const data = this.safeValue (message, 'data', {});
        const marketId = this.safeString (message, 'market');
        let market = undefined;
        if (marketId in this.markets_by_id) {
            market = this.markets_by_id[marketId];
            const ticker = this.parseTicker (data, market);
            const symbol = ticker['symbol'];
            this.tickers[symbol] = ticker;
            const messageHash = this.getMessageHash (message);
            client.resolve (ticker, messageHash);
        }
        return message;
    }

    handleOrderBookSnapshot (client, message) {
        //
        //     {
        //         channel: "orderbook",
        //         market: "BTC/USD",
        //         type: "partial",
        //         data: {
        //             time: 1585812237.6300597,
        //             checksum: 2028058404,
        //             bids: [
        //                 [6655.5, 21.23],
        //                 [6655, 41.0165],
        //                 [6652.5, 15.1985],
        //             ],
        //             asks: [
        //                 [6658, 48.8094],
        //                 [6659.5, 15.6184],
        //                 [6660, 16.7178],
        //             ],
        //             action: "partial"
        //         }
        //     }
        //
        const data = this.safeValue (message, 'data', {});
        const marketId = this.safeString (message, 'market');
        if (marketId in this.markets_by_id) {
            const market = this.markets_by_id[marketId];
            const symbol = market['symbol'];
            const options = this.safeValue (this.options, 'watchOrderBook', {});
            const limit = this.safeInteger (options, 'limit', 400);
            const orderbook = this.orderBook ({}, limit);
            this.orderbooks[symbol] = orderbook;
            const timestamp = this.safeTimestamp (data, 'time');
            const snapshot = this.parseOrderBook (data, timestamp);
            orderbook.reset (snapshot);
            // const checksum = this.safeString (data, 'checksum');
            // todo: this.checkOrderBookChecksum (client, orderbook, checksum);
            this.orderbooks[symbol] = orderbook;
            const messageHash = this.getMessageHash (message);
            client.resolve (orderbook, messageHash);
        }
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

    handleOrderBookUpdate (client, message) {
        // action: update
        // bids
        // asks
        // checksum: see below
        // time: Timestamp
        // const u = this.safeInteger (message, 'u');
        const data = this.safeValue (message, 'data', {});
        const symbol = this.safeString (data, 'market');
        const orderbook = this.orderbooks[symbol];
        this.handleDeltas (orderbook['asks'], this.safeValue (data, 'asks', []));
        this.handleDeltas (orderbook['bids'], this.safeValue (data, 'bids', []));
        // orderbook['nonce'] = u;
        const timestamp = this.safeTimestamp (data, 'time');
        orderbook['timestamp'] = timestamp;
        orderbook['datetime'] = this.iso8601 (timestamp);
        // const checksum = this.safeString (data, 'checksum');
        // todo: this.checkOrderBookChecksum (client, orderbook, checksum);
        this.orderbooks[symbol] = orderbook;
        const messageHash = this.getMessageHash (message);
        client.resolve (orderbook, messageHash);
    }

    handleTrades (client, message) {
        const data = this.safeValue (message, 'data', {});
        const symbol = this.safeValue (message, 'market', {});
        const market = this.market (symbol);
        const messageHash = this.getMessageHash (message);
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
        return message;
    }

    handleSubscriptionStatus (client, message) {
        // todo: handle unsubscription status
        // {'type': 'subscribed', 'channel': 'trades', 'market': 'BTC-PERP'}
        return message;
    }

    handleUnsubscriptionStatus (client, message) {
        // todo: handle unsubscription status
        // {'type': 'unsubscribed', 'channel': 'trades', 'market': 'BTC-PERP'}
        return message;
    }

    handleInfo (client, message) {
        // todo: handle info messages
        // Used to convey information to the user. Is accompanied by a code and msg field.
        // When our servers restart, you may see an info message with code 20001. If you do, please reconnect.
        return message;
    }

    handleError (client, message) {
        return message;
    }

    ping (client) {
        // ftx does not support built-in ws protocol-level ping-pong
        // instead it requires a custom json-based text ping-pong
        // https://docs.ftx.com/#websocket-api
        return {
            'op': 'ping',
        };
    }

    handlePong (client, message) {
        client.lastPong = this.milliseconds ();
        return message;
    }
};
