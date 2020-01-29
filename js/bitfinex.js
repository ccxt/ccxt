'use strict';

//  ---------------------------------------------------------------------------

const ccxt = require ('ccxt');
const { ExchangeError } = require ('ccxt/js/base/errors');

//  ---------------------------------------------------------------------------

module.exports = class bitfinex extends ccxt.bitfinex {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'watchTicker': true,
                'watchOrderBook': true,
            },
            'urls': {
                'api': {
                    'ws': {
                        'public': 'wss://api.bitfinex.com/ws/1',
                        'private': 'wss://api.bitfinex.com/ws/1',
                    },
                },
            },
        });
    }

    async watchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketId = market['id'];
        const url = this.urls['api']['ws']['public'];
        const channel = 'ticker';
        const request = {
            'event': 'subscribe',
            'channel': channel,
            'symbol': marketId,
        };
        const messageHash = channel + ':' + marketId;
        return await this.watch (url, messageHash, this.deepExtend (request, params), messageHash);
    }

    handleTicker (client, message, subscription) {
        //
        //     [
        //         1231,
        //         'hb',
        //     ]
        //
        if (message[1] === 'hb') {
            return; // skip ticker heartbeats
        }
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
        if (limit !== undefined) {
            if ((limit !== 25) && (limit !== 100)) {
                throw new ExchangeError (this.id + ' watchOrderBook limit argument must be undefined, 25 or 100');
            }
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketId = market['id'];
        const url = this.urls['api']['ws']['public'];
        const channel = 'book';
        const request = {
            'event': 'subscribe',
            'channel': channel,
            'symbol': marketId,
            // 'prec': 'P0', // string, level of price aggregation, 'P0', 'P1', 'P2', 'P3', 'P4', default P0
            // 'freq': 'F0', // string, frequency of updates 'F0' = realtime, 'F1' = 2 seconds, default is 'F0'
            // 'len': '25', // string, number of price points, '25', '100', default = '25'
        };
        if (limit !== undefined) {
            request['len'] = limit.toString ();
        }
        const messageHash = channel + ':' + marketId;
        const future = this.watch (url, messageHash, this.deepExtend (request, params), messageHash);
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
        // if it is an initial snapshot
        if (Array.isArray (message[1])) {
            const limit = this.safeInteger (subscription, 'len');
            this.orderbooks[symbol] = this.countedOrderBook ({}, limit);
            const orderbook = this.orderbooks[symbol];
            const deltas = message[1];
            for (let i = 0; i < deltas.length; i++) {
                const delta = deltas[i];
                const price = delta[0];
                const count = delta[1];
                const amount = (delta[2] < 0) ? -delta[2] : delta[2];
                const side = (delta[2] < 0) ? 'asks' : 'bids';
                const bookside = orderbook[side];
                bookside.store (price, amount, count);
            }
            client.resolve (orderbook, messageHash);
        } else {
            const orderbook = this.orderbooks[symbol];
            const price = message[1];
            const count = message[2];
            const amount = (message[3] < 0) ? -message[3] : message[3];
            const side = (message[3] < 0) ? 'asks' : 'bids';
            const bookside = orderbook[side];
            bookside.store (price, amount, count);
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
        // console.log (new Date (), message);
        if (Array.isArray (message)) {
            const channelId = message[0].toString ();
            const subscription = this.safeValue (client.subscriptions, channelId, {});
            const channel = this.safeString (subscription, 'channel');
            const methods = {
                'book': this.handleOrderBook,
                // 'ohlc': this.handleOHLCV,
                'ticker': this.handleTicker,
                // 'trade': this.handleTrades,
            };
            const method = this.safeValue (methods, channel);
            if (method === undefined) {
                return message;
            } else {
                return method.call (this, client, message, subscription);
            }
        } else {
            // todo: add bitfinex handleErrorMessage
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
