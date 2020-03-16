'use strict';

//  ---------------------------------------------------------------------------

const ccxt = require ('ccxt');
const { ExchangeError } = require ('ccxt/js/base/errors');

//  ---------------------------------------------------------------------------

module.exports = class okex extends ccxt.okex {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchTicker': true,
                'watchTickers': false,
                'watchOrderBook': true,
                'watchTrades': true,
                'watchBalance': false, // for now
                'watchOHLCV': false, // missing on the exchange side in v1
            },
            'urls': {
                'api': {
                    'ws': 'wss://real.okex.com:8443/ws', // + v3 this.version
                },
            },
            'options': {
                'watchOrderBook': {
                    'prec': 'P0',
                    'freq': 'F0',
                },
            },
        });
    }

    async subscribe (channel, symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketId = market['id'];
        const url = this.urls['api']['ws']['public'];
        const messageHash = channel + ':' + marketId;
        // const channel = 'trades';
        const request = {
            'event': 'subscribe',
            'channel': channel,
            'symbol': marketId,
            'messageHash': messageHash,
        };
        return await this.watch (url, messageHash, this.deepExtend (request, params), messageHash);
    }

    async watchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        const future = this.subscribe ('trades', symbol, params);
        return await this.after (future, this.filterBySinceLimit, since, limit);
    }

    async watchTicker (symbol, params = {}) {
        return await this.subscribe ('ticker', symbol, params);
    }

    handleTrades (client, message, subscription) {
        //
        // initial snapshot
        //
        //     [
        //         2,
        //             [
        //             [ null, 1580565020, 9374.9, 0.005 ],
        //             [ null, 1580565004, 9374.9, 0.005 ],
        //             [ null, 1580565003, 9374.9, 0.005 ],
        //         ]
        //     ]
        //
        // when a trade does not have an id yet
        //
        //     // channel id, update type, seq, time, price, amount
        //     [ 2, 'te', '28462857-BTCUSD', 1580565041, 9374.9, 0.005 ],
        //
        // when a trade already has an id
        //
        //     // channel id, update type, seq, trade id, time, price, amount
        //     [ 2, 'tu', '28462857-BTCUSD', 413357662, 1580565041, 9374.9, 0.005 ]
        //
        const messageHash = this.safeValue (subscription, 'messageHash');
        const marketId = this.safeString (subscription, 'pair');
        if (marketId in this.markets_by_id) {
            const market = this.markets_by_id[marketId];
            const symbol = market['symbol'];
            const data = this.safeValue (message, 1);
            const stored = this.safeValue (this.trades, symbol, []);
            if (Array.isArray (data)) {
                const trades = this.parseTrades (data, market);
                for (let i = 0; i < trades.length; i++) {
                    stored.push (trades[i]);
                    const storedLength = stored.length;
                    if (storedLength > this.options['tradesLimit']) {
                        stored.shift ();
                    }
                }
            } else {
                const second = this.safeString (message, 1);
                if (second !== 'tu') {
                    return;
                }
                const trade = this.parseTrade (message, market);
                stored.push (trade);
                const length = stored.length;
                if (length > this.options['tradesLimit']) {
                    stored.shift ();
                }
            }
            this.trades[symbol] = stored;
            client.resolve (stored, messageHash);
        }
        return message;
    }

    parseTrade (trade, market = undefined) {
        //
        // snapshot trade
        //
        //     // null, time, price, amount
        //     [ null, 1580565020, 9374.9, 0.005 ],
        //
        // when a trade does not have an id yet
        //
        //     // channel id, update type, seq, time, price, amount
        //     [ 2, 'te', '28462857-BTCUSD', 1580565041, 9374.9, 0.005 ],
        //
        // when a trade already has an id
        //
        //     // channel id, update type, seq, trade id, time, price, amount
        //     [ 2, 'tu', '28462857-BTCUSD', 413357662, 1580565041, 9374.9, 0.005 ]
        //
        if (!Array.isArray (trade)) {
            return super.parseTrade (trade, market);
        }
        const tradeLength = trade.length;
        const event = this.safeString (trade, 1);
        let id = undefined;
        if (event === 'tu') {
            id = this.safeString (trade, tradeLength - 4);
        }
        const timestamp = this.safeTimestamp (trade, tradeLength - 3);
        const price = this.safeFloat (trade, tradeLength - 2);
        let amount = this.safeFloat (trade, tradeLength - 1);
        let side = undefined;
        if (amount !== undefined) {
            side = (amount > 0) ? 'buy' : 'sell';
            amount = Math.abs (amount);
        }
        let cost = undefined;
        if ((price !== undefined) && (amount !== undefined)) {
            cost = price * amount;
        }
        const seq = this.safeString (trade, 2);
        const parts = seq.split ('-');
        const marketId = this.safeString (parts, 1);
        let symbol = undefined;
        if (marketId in this.markets_by_id) {
            market = this.markets_by_id[marketId];
        }
        if ((symbol === undefined) && (market !== undefined)) {
            symbol = market['symbol'];
        }
        const takerOrMaker = undefined;
        const orderId = undefined;
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

    handleTicker (client, message, subscription) {
        //
        //     [
        //         2,             // 0 CHANNEL_ID integer Channel ID
        //         236.62,        // 1 BID float Price of last highest bid
        //         9.0029,        // 2 BID_SIZE float Size of the last highest bid
        //         236.88,        // 3 ASK float Price of last lowest ask
        //         7.1138,        // 4 ASK_SIZE float Size of the last lowest ask
        //         -1.02,         // 5 DAILY_CHANGE float Amount that the last price has changed since yesterday
        //         0,             // 6 DAILY_CHANGE_PERC float Amount that the price has changed expressed in percentage terms
        //         236.52,        // 7 LAST_PRICE float Price of the last trade.
        //         5191.36754297, // 8 VOLUME float Daily volume
        //         250.01,        // 9 HIGH float Daily high
        //         220.05,        // 10 LOW float Daily low
        //     ]
        //
        const timestamp = this.milliseconds ();
        const marketId = this.safeString (subscription, 'pair');
        const market = this.markets_by_id[marketId];
        const symbol = market['symbol'];
        const channel = 'ticker';
        const messageHash = channel + ':' + marketId;
        const last = this.safeFloat (message, 7);
        const change = this.safeFloat (message, 5);
        let open = undefined;
        if ((last !== undefined) && (change !== undefined)) {
            open = last - change;
        }
        const result = {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (message, 9),
            'low': this.safeFloat (message, 10),
            'bid': this.safeFloat (message, 1),
            'bidVolume': undefined,
            'ask': this.safeFloat (message, 3),
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': this.safeFloat (message, 6),
            'average': undefined,
            'baseVolume': this.safeFloat (message, 8),
            'quoteVolume': undefined,
            'info': message,
        };
        this.tickers[symbol] = result;
        client.resolve (result, messageHash);
    }

    async watchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const name = 'depth';
        const channel = market['type'] + '/' + name + ':' + market['id'];
        const request = {
            'event': 'subscribe',
            'channel': channel,
        };
        const url = this.urls['api']['ws'];
        const future = this.watch (url, channel, this.deepExtend (request, params), channel);
        return await this.after (future, this.limitOrderBook, symbol, limit, params);
    }

    limitOrderBook (orderbook, symbol, limit = undefined, params = {}) {
        return orderbook.limit (limit);
    }

    handleOrderBook (client, message, subscription) {
        //
        // first message (snapshot)
        //
        //     [
        //         18691, // channel id
        //         [
        //             [ 7364.8, 10, 4.354802 ], // price, count, size > 0 = bid
        //             [ 7364.7, 1, 0.00288831 ],
        //             [ 7364.3, 12, 0.048 ],
        //             [ 7364.9, 3, -0.42028976 ], // price, count, size < 0 = ask
        //             [ 7365, 1, -0.25 ],
        //             [ 7365.5, 1, -0.00371937 ],
        //         ]
        //     ]
        //
        // subsequent updates
        //
        //     [
        //         30,     // channel id
        //         9339.9, // price
        //         0,      // count
        //         -1,     // size > 0 = bid, size < 0 = ask
        //     ]
        //
        const marketId = this.safeString (subscription, 'pair');
        const market = this.markets_by_id[marketId];
        const symbol = market['symbol'];
        const channel = 'book';
        const messageHash = channel + ':' + marketId;
        const prec = this.safeString (subscription, 'prec', 'P0');
        const isRaw = (prec === 'R0');
        // if it is an initial snapshot
        if (Array.isArray (message[1])) {
            const limit = this.safeInteger (subscription, 'len');
            if (isRaw) {
                // raw order books
                this.orderbooks[symbol] = this.indexedOrderBook ({}, limit);
            } else {
                // P0, P1, P2, P3, P4
                this.orderbooks[symbol] = this.countedOrderBook ({}, limit);
            }
            const orderbook = this.orderbooks[symbol];
            if (isRaw) {
                const deltas = message[1];
                for (let i = 0; i < deltas.length; i++) {
                    const delta = deltas[i];
                    const id = this.safeString (delta, 0);
                    const price = this.safeFloat (delta, 1);
                    const size = (delta[2] < 0) ? -delta[2] : delta[2];
                    const side = (delta[2] < 0) ? 'asks' : 'bids';
                    const bookside = orderbook[side];
                    bookside.store (price, size, id);
                }
            } else {
                const deltas = message[1];
                for (let i = 0; i < deltas.length; i++) {
                    const delta = deltas[i];
                    const size = (delta[2] < 0) ? -delta[2] : delta[2];
                    const side = (delta[2] < 0) ? 'asks' : 'bids';
                    const bookside = orderbook[side];
                    bookside.store (delta[0], size, delta[1]);
                }
            }
            client.resolve (orderbook, messageHash);
        } else {
            const orderbook = this.orderbooks[symbol];
            if (isRaw) {
                const id = this.safeString (message, 1);
                const price = this.safeFloat (message, 2);
                const size = (message[3] < 0) ? -message[3] : message[3];
                const side = (message[3] < 0) ? 'asks' : 'bids';
                const bookside = orderbook[side];
                // price = 0 means that you have to remove the order from your book
                const amount = (price > 0) ? size : 0;
                bookside.store (price, amount, id);
            } else {
                const size = (message[3] < 0) ? -message[3] : message[3];
                const side = (message[3] < 0) ? 'asks' : 'bids';
                const bookside = orderbook[side];
                bookside.store (message[1], size, message[2]);
            }
            client.resolve (orderbook, messageHash);
        }
    }

    handleHeartbeat (client, message) {
        //
        // every second (approx) if no other updates are sent
        //
        //     { "event": "heartbeat" }
        //
        const event = this.safeString (message, 'event');
        client.resolve (message, event);
    }

    handleSystemStatus (client, message) {
        //
        // todo: answer the question whether handleSystemStatus should be renamed
        // and unified as handleStatus for any usage pattern that
        // involves system status and maintenance updates
        //
        //     {
        //         event: 'info',
        //         version: 2,
        //         serverId: 'e293377e-7bb7-427e-b28c-5db045b2c1d1',
        //         platform: { status: 1 }, // 1 for operative, 0 for maintenance
        //     }
        //
        return message;
    }

    handleSubscriptionStatus (client, message) {
        //
        //     {
        //         event: 'subscribed',
        //         channel: 'book',
        //         chanId: 67473,
        //         symbol: 'tBTCUSD',
        //         prec: 'P0',
        //         freq: 'F0',
        //         len: '25',
        //         pair: 'BTCUSD'
        //     }
        //
        const channelId = this.safeString (message, 'chanId');
        client.subscriptions[channelId] = message;
        return message;
    }

    signMessage (client, messageHash, message, params = {}) {
        // todo: bitfinex signMessage not implemented yet
        return message;
    }

    handleMessage (client, message) {
        console.log (message);
        process.exit ();
        if (Array.isArray (message)) {
            const channelId = this.safeString (message, 0);
            //
            //     [
            //         1231,
            //         'hb',
            //     ]
            //
            if (message[1] === 'hb') {
                return message; // skip heartbeats within subscription channels for now
            }
            const subscription = this.safeValue (client.subscriptions, channelId, {});
            const channel = this.safeString (subscription, 'channel');
            const methods = {
                'book': this.handleOrderBook,
                // 'ohlc': this.handleOHLCV,
                'ticker': this.handleTicker,
                'trades': this.handleTrades,
            };
            const method = this.safeValue (methods, channel);
            if (method === undefined) {
                return message;
            } else {
                return method.call (this, client, message, subscription);
            }
        } else {
            // todo add bitfinex handleErrorMessage
            //
            //     {
            //         event: 'info',
            //         version: 2,
            //         serverId: 'e293377e-7bb7-427e-b28c-5db045b2c1d1',
            //         platform: { status: 1 }, // 1 for operative, 0 for maintenance
            //     }
            //
            const event = this.safeString (message, 'event');
            if (event !== undefined) {
                const methods = {
                    'info': this.handleSystemStatus,
                    // 'book': 'handleOrderBook',
                    'subscribed': this.handleSubscriptionStatus,
                };
                const method = this.safeValue (methods, event);
                if (method === undefined) {
                    return message;
                } else {
                    return method.call (this, client, message);
                }
            }
        }
    }
};
