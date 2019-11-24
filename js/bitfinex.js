'use strict';

//  ---------------------------------------------------------------------------

const ccxt = require ('ccxt');
const { ExchangeError } = require ('ccxt/js/base/errors');

//  ---------------------------------------------------------------------------

module.exports = class bitfinex extends ccxt.bitfinex {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'fetchWsTicker': true,
                'fetchWsOrderBook': true,
            },
            'urls': {
                'ws': {
                    'public': 'wss://api-pub.bitfinex.com/ws/2',
                    'private': 'wss://api.bitfinex.com',
                },
            },
            'options': {
                'subscriptionsByChannelId': {},
            },
        });
    }

    async fetchWsOrderBook (symbol, limit = undefined, params = {}) {
        if (limit !== undefined) {
            if ((limit !== 25) && (limit !== 100)) {
                throw new ExchangeError (this.id + ' fetchWsOrderBook limit argument must be undefined, 25 or 100');
            }
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketId = market['id'];
        const url = this.urls['ws']['public'];
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
            request['limit'] = limit.toString ();
        }
        const messageHash = channel + ':' + marketId;
        return this.sendWsMessage (url, messageHash, this.deepExtend (request, params), messageHash);
    }

    handleWsOrderBook (client, message) {
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
        //         39393, // channel id
        //         [ 7138.9, 0, -1 ], // price, count, size, size > 0 = bid, size < 0 = ask
        //     ]
        //
        const channelId = message[0].toString ();
        const subscription = this.safeValue (this.options['subscriptionsByChannelId'], channelId, {});
        //
        //     {
        //         event: 'subscribed',
        //         channel: 'book',
        //         chanId: 67473,
        //         symbol: 'tBTCUSD', // v2 id
        //         prec: 'P0',
        //         freq: 'F0',
        //         len: '25',
        //         pair: 'BTCUSD', // v1 id
        //     }
        //
        const marketId = this.safeString (subscription, 'pair');
        const market = this.markets_by_id[marketId];
        const symbol = market['symbol'];
        const messageHash = 'book:' + marketId;
        // if it is an initial snapshot
        if (Array.isArray (message[1][0])) {
            this.orderbooks[symbol] = this.limitedCountedOrderBook ();
            const orderbook = this.orderbooks[symbol];
            const deltas = message[1];
            for (let i = 0; i < deltas.length; i++) {
                const delta = deltas[i];
                const side = (delta[2] < 0) ? 'asks' : 'bids';
                const bookside = orderbook[side];
                this.handleWsDelta (bookside, delta);
            }
            this.resolveWsFuture (client, messageHash, orderbook.limit ());
        } else {
            const orderbook = this.orderbooks[symbol];
            const side = (message[1][2] < 0) ? 'asks' : 'bids';
            const bookside = orderbook[side];
            this.handleWsDelta (bookside, message[1]);
            this.resolveWsFuture (client, messageHash, orderbook.limit ());
        }
    }

    handleWsDelta (bookside, delta) {
        const price = delta[0];
        const count = delta[1];
        const amount = (delta[2] < 0) ? -delta[2] : delta[2];
        bookside.store (price, amount, count);
    }

    handleWsHeartbeat (client, message) {
        //
        // every second (approx) if no other updates are sent
        //
        //     { "event": "heartbeat" }
        //
        const event = this.safeString (message, 'event');
        this.resolveWsFuture (client, event, message);
    }

    handleWsSystemStatus (client, message) {
        //
        // todo: answer the question whether this method should be renamed
        // and unified as handleWsStatus for any usage pattern that
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

    handleWsSubscriptionStatus (client, message) {
        //
        // todo: answer the question whether this method should be renamed
        // and unified as handleWsResponse for any usage pattern that
        // involves an identified request/response sequence
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
        // --------------------------------------------------------------------
        //
        const channelId = this.safeString (message, 'chanId');
        this.options['subscriptionsByChannelId'][channelId] = message;
        return message;
    }

    signWsMessage (client, messageHash, message, params = {}) {
        // todo: not implemented yet
        return message;
    }

    handleWsMessage (client, message) {
        // console.log (new Date (), message);
        if (Array.isArray (message)) {
            const channelId = message[0].toString ();
            const subscription = this.safeValue (this.options['subscriptionsByChannelId'], channelId, {});
            const channel = this.safeString (subscription, 'channel');
            const methods = {
                'book': 'handleWsOrderBook',
                // 'ohlc': 'handleWsOHLCV',
                // 'ticker': 'handleWsTicker',
                // 'trade': 'handleWsTrades',
            };
            const method = this.safeString (methods, channel);
            if (method === undefined) {
                return message;
            } else {
                return this[method] (client, message);
            }
        } else {
            // todo: add handleWsErrors
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
                    'info': 'handleWsSystemStatus',
                    // 'book': 'handleWsOrderBook',
                    'subscribed': 'handleWsSubscriptionStatus',
                };
                const method = this.safeString (methods, event);
                if (method === undefined) {
                    return message;
                } else {
                    return this[method] (client, message);
                }
            }
        }
    }
};
