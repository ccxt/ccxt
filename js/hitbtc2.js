'use strict';

//  ---------------------------------------------------------------------------

const ccxt = require ('ccxt');

//  ---------------------------------------------------------------------------

module.exports = class hitbtc2 extends ccxt.hitbtc2 {
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
            'id': market['id'],
        };
        const future = this.watch (url, messageHash, request, messageHash);
        return await this.after (future, this.limitOrderBook, symbol, limit, params);
    }

    handleOrderBookSnapshot (client, message) {
        const params = this.safeValue (message, 'params', {});
        const marketId = this.safeString (params, 'symbol');
        let market = undefined;
        let symbol = undefined;
        if (marketId !== undefined) {
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
                symbol = market['symbol'];
            }
        }
        if (symbol === undefined) {
            // if symbol is not available we just return
            return;
        }
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

    handleUpdateOrderbook (client, message) {
        const params = this.safeValue (message, 'params', {});
        const marketId = this.safeString (params, 'symbol');
        let market = undefined;
        let symbol = undefined;
        if (marketId !== undefined) {
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
                symbol = market['symbol'];
            }
        }
        if (symbol === undefined) {
            // if symbol is not available we just return
            return;
        }
        const timestamp = this.parse8601 (this.safeString (params, 'timestamp'));
        const nonce = this.safeInteger (params, 'sequence');
        if (symbol in this.orderbooks) {
            const orderbook = this.orderbooks[symbol];
            const asks = this.safeValue (params, 'ask', []);
            const bids = this.safeValue (params, 'bid', []);
            this.updateOrders (orderbook['asks'], asks);
            this.updateOrders (orderbook['bids'], bids);
            orderbook['timestamp'] = timestamp;
            orderbook['datetime'] = this.iso8601 (timestamp);
            orderbook['nonce'] = nonce;
            this.orderbooks[symbol] = orderbook;
            const messageHash = 'orderbook:' + marketId;
            client.resolve (orderbook, messageHash);
        }
    }

    updateOrders (bookside, data) {
        for (let i = 0; i < data.length; i++) {
            const delta = data[i];
            const price = this.safeFloat (delta, 'price');
            const amount = this.safeFloat (delta, 'size');
            bookside.store (price, amount);
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
        const messageData = this.safeValue (message, 'params');
        const marketId = this.safeValue (messageData, 'symbol');
        let market = undefined;
        let symbol = undefined;
        if (marketId !== undefined) {
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
                symbol = market['symbol'];
            }
        }
        if (symbol === undefined) {
            // if symbol is not available we just return
            return;
        }
        const timestamp = this.safeValue (messageData, 'timestamp');
        const last = this.safeFloat (messageData, 'last');
        const open = this.safeFloat (messageData, 'open');
        let change = undefined;
        let average = undefined;
        let percentage = undefined;
        if (last !== undefined && open !== undefined) {
            change = last - open;
            average = this.sum (last, open) / 2;
            if (open !== 0) {
                percentage = change / open * 100;
            }
        }
        const result = {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': timestamp,
            'high': this.safeFloat (messageData, 'high'),
            'low': this.safeFloat (messageData, 'low'),
            'bid': this.safeFloat (messageData, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (messageData, 'ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': percentage,
            'average': average,
            'baseVolume': this.safeFloat (messageData, 'volume'),
            'quoteVolume': this.safeFloat (messageData, 'volumeQuote'),
            'info': messageData,
        };
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
