'use strict';

//  ---------------------------------------------------------------------------

const ccxt = require ('ccxt');
const { ExchangeError, AuthenticationError } = require ('ccxt/js/base/errors');
const { ArrayCache, ArrayCacheBySymbolById, ArrayCacheByTimestamp } = require ('./base/Cache');

//  ---------------------------------------------------------------------------

module.exports = class bitfinex2 extends ccxt.bitfinex2 {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchTicker': true,
                'watchTickers': false,
                'watchOrderBook': true,
                'watchTrades': true,
                'watchBalance': false, // for now
                'watchOHLCV': true,
            },
            'urls': {
                'api': {
                    'ws': {
                        'public': 'wss://api-pub.bitfinex.com/ws/2',
                        'private': 'wss://api.bitfinex.com/ws/2',
                    },
                },
            },
            'options': {
                'watchOrderBook': {
                    'prec': 'P0',
                    'freq': 'F0',
                },
                'ordersLimit': 1000,
            },
        });
    }

    async subscribe (channel, symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketId = market['id'];
        const url = this.urls['api']['ws']['public'];
        const messageHash = channel + ':' + marketId;
        let request = undefined;
        request = {
            'event': 'subscribe',
            'channel': channel,
            'symbol': marketId,
        };
        return await this.watch (url, messageHash, this.deepExtend (request, params), messageHash);
    }

    async watchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const interval = this.timeframes[timeframe];
        const channel = 'candles';
        const key = 'trade:' + interval + ':' + market['id'];
        const messageHash = channel + ':' + interval + ':' + market['id'];
        const request = {
            'event': 'subscribe',
            'channel': channel,
            'key': key,
        };
        const url = this.urls['api']['ws']['public'];
        // not using subscribe here because this message has a different format
        const ohlcv = await this.watch (url, messageHash, this.deepExtend (request, params), messageHash);
        if (this.newUpdates) {
            limit = ohlcv.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0, true);
    }

    handleOHLCV (client, message, subscription) {
        //
        // initial snapshot
        //   [
        //       341527, // channel id
        //       [
        //          [
        //             1654705860000, // timestamp
        //             1802.6, // open
        //             1800.3, // close
        //             1802.8, // high
        //             1800.3, // low
        //             86.49588236 // volume
        //          ],
        //          [
        //             1654705800000,
        //             1803.6,
        //             1802.6,
        //             1804.9,
        //             1802.3,
        //             74.6348086
        //          ],
        //          [
        //             1654705740000,
        //             1802.5,
        //             1803.2,
        //             1804.4,
        //             1802.4,
        //             23.61801085
        //          ]
        //       ]
        //   ]
        //
        // update
        //   [
        //       211171,
        //       [
        //          1654705680000,
        //          1801,
        //          1802.4,
        //          1802.9,
        //          1800.4,
        //          23.91911091
        //       ]
        //   ]
        //
        const data = this.safeValue (message, 1, []);
        let ohlcvs = undefined;
        if (Array.isArray (data)) {
            // snapshot
            ohlcvs = data;
        } else {
            // update
            ohlcvs = [ data ];
        }
        const channel = this.safeValue (subscription, 'channel');
        const key = this.safeString (subscription, 'key');
        const keyParts = key.split (':');
        const interval = this.safeString (keyParts, 1);
        let marketId = key;
        marketId = marketId.replace ('trade:', '');
        marketId = marketId.replace (interval + ':', '');
        const market = this.safeMarket (marketId);
        const timeframe = this.findTimeframe (interval);
        const symbol = market['symbol'];
        const messageHash = channel + ':' + interval + ':' + marketId;
        this.ohlcvs[symbol] = this.safeValue (this.ohlcvs, symbol, {});
        let stored = this.safeValue (this.ohlcvs[symbol], timeframe);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
            stored = new ArrayCacheByTimestamp (limit);
            this.ohlcvs[symbol][timeframe] = stored;
        }
        for (let i = 0; i < ohlcvs.length; i++) {
            const ohlcv = ohlcvs[i];
            const parsed = this.parseOHLCV (ohlcv, market);
            stored.append (parsed);
        }
        client.resolve (stored, messageHash);
    }

    async watchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        const trades = await this.subscribe ('trades', symbol, params);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    async watchTicker (symbol, params = {}) {
        return await this.subscribe ('ticker', symbol, params);
    }

    handleTrades (client, message, subscription) {
        //
        // initial snapshot
        //
        //    [
        //        188687, // channel id
        //        [
        //          [ 1128060675, 1654701572690, 0.00217533, 1815.3 ], // id, mts, amount, price
        //          [ 1128060665, 1654701551231, -0.00280472, 1814.1 ],
        //          [ 1128060664, 1654701550996, -0.00364444, 1814.1 ],
        //          [ 1128060656, 1654701527730, -0.00265203, 1814.2 ],
        //          [ 1128060647, 1654701505193, 0.00262395, 1815.2 ],
        //          [ 1128060642, 1654701484656, -0.13411443, 1816 ],
        //          [ 1128060641, 1654701484656, -0.00088557, 1816 ],
        //          [ 1128060639, 1654701478326, -0.002, 1816 ],
        //        ]
        //    ]
        // update
        //
        //    [
        //        360141,
        //        'te',
        //        [
        //            1128060969, // id
        //            1654702500098, // mts
        //            0.00325131, // amount positive buy, negative sell
        //            1818.5, // price
        //        ],
        //    ]
        //
        //
        const channel = this.safeValue (subscription, 'channel');
        const marketId = this.safeString (subscription, 'symbol');
        const market = this.safeMarket (marketId);
        const messageHash = channel + ':' + marketId;
        const tradesLimit = this.safeInteger (this.options, 'tradesLimit', 1000);
        const symbol = market['symbol'];
        let stored = this.safeValue (this.trades, symbol);
        if (stored === undefined) {
            stored = new ArrayCache (tradesLimit);
            this.trades[symbol] = stored;
        }
        if (Array.isArray (message)) {
            const messageLength = message.length;
            let trades = undefined;
            if (messageLength === 2) {
                // initial snapshot
                trades = this.safeValue (message, 1, []);
            } else {
                // update
                trades = [ this.safeValue (message, 2, []) ];
            }
            for (let i = 0; i < trades.length; i++) {
                const parsed = this.parseWsTrade (trades[i], market);
                stored.append (parsed);
            }
        } else {
            const second = this.safeString (message, 1);
            if (second !== 'tu') {
                return;
            }
            const trade = this.parseWsTrade (message, market);
            stored.append (trade);
        }
        client.resolve (stored, messageHash);
        return message;
    }

    parseWsTrade (trade, market = undefined) {
        //
        //    [
        //        1128060969, // id
        //        1654702500098, // mts
        //        0.00325131, // amount positive buy, negative sell
        //        1818.5, // price
        //    ]
        //
        market = this.safeMarket (undefined, market);
        const marketId = market['id'];
        const id = this.safeString (trade, 0);
        const timestamp = this.safeInteger (trade, 1);
        const price = this.safeString (trade, 3);
        let amount = this.safeFloat (trade, 2);
        let side = undefined;
        if (amount !== undefined) {
            side = (amount > 0) ? 'buy' : 'sell';
            amount = Math.abs (amount);
        }
        const symbol = this.safeSymbol (marketId, market);
        return this.safeTrade ({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': id,
            'order': undefined,
            'type': undefined,
            'takerOrMaker': undefined,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': undefined,
        }, market);
    }

    handleTicker (client, message, subscription) {
        //
        // [
        //    340432, // channel ID
        //     [
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
        //  ]
        //
        const ticker = this.safeValue (message, 1);
        const marketId = this.safeString (subscription, 'symbol');
        const market = this.safeMarket (marketId);
        const symbol = this.safeSymbol (marketId);
        const parsed = this.parseWsTicker (ticker, market);
        const channel = 'ticker';
        const messageHash = channel + ':' + marketId;
        this.tickers[symbol] = parsed;
        client.resolve (parsed, messageHash);
    }

    parseWsTicker (ticker, market = undefined) {
        //
        //     [
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
        market = this.safeMarket (undefined, market);
        const symbol = market['symbol'];
        const last = this.safeString (ticker, 7);
        const change = this.safeString (ticker, 5);
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 9),
            'low': this.safeString (ticker, 10),
            'bid': this.safeString (ticker, 1),
            'bidVolume': undefined,
            'ask': this.safeString (ticker, 3),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': this.safeString (ticker, 6),
            'average': undefined,
            'baseVolume': this.safeString (ticker, 8),
            'quoteVolume': undefined,
            'info': ticker,
        }, market);
    }

    async watchOrderBook (symbol, limit = undefined, params = {}) {
        if (limit !== undefined) {
            if ((limit !== 25) && (limit !== 100)) {
                throw new ExchangeError (this.id + ' watchOrderBook limit argument must be undefined, 25 or 100');
            }
        }
        const options = this.safeValue (this.options, 'watchOrderBook', {});
        const prec = this.safeString (options, 'prec', 'P0');
        const freq = this.safeString (options, 'freq', 'F0');
        const request = {
            'prec': prec, // string, level of price aggregation, 'P0', 'P1', 'P2', 'P3', 'P4', default P0
            'freq': freq, // string, frequency of updates 'F0' = realtime, 'F1' = 2 seconds, default is 'F0'
        };
        if (limit !== undefined) {
            request['len'] = limit; // string, number of price points, '25', '100', default = '25'
        }
        const orderbook = await this.subscribe ('book', symbol, this.deepExtend (request, params));
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
        //         358169, // channel id
        //         [
        //            1807.1, // price
        //            0, // cound
        //            1 // size
        //         ]
        //     ]
        //
        const marketId = this.safeString (subscription, 'symbol');
        const symbol = this.safeSymbol (marketId);
        const channel = 'book';
        const messageHash = channel + ':' + marketId;
        const prec = this.safeString (subscription, 'prec', 'P0');
        const isRaw = (prec === 'R0');
        const id = this.safeString (message, 0);
        // if it is an initial snapshot
        let orderbook = this.orderbooks[symbol];
        if (orderbook === undefined) {
            const limit = this.safeInteger (subscription, 'len');
            if (isRaw) {
                // raw order books
                this.orderbooks[symbol] = this.indexedOrderBook ({}, limit);
            } else {
                // P0, P1, P2, P3, P4
                this.orderbooks[symbol] = this.countedOrderBook ({}, limit);
            }
            orderbook = this.orderbooks[symbol];
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
                    const size = (delta[1] < 0) ? -delta[1] : delta[1];
                    const side = (delta[1] < 0) ? 'asks' : 'bids';
                    const bookside = orderbook[side];
                    bookside.store (delta[0], size, id);
                }
            }
            client.resolve (orderbook, messageHash);
        } else {
            const deltas = message[1];
            const orderbook = this.orderbooks[symbol];
            if (isRaw) {
                const price = this.safeFloat (deltas, 1);
                const size = (deltas[2] < 0) ? -deltas[2] : deltas[2];
                const side = (deltas[2] < 0) ? 'asks' : 'bids';
                const bookside = orderbook[side];
                // price = 0 means that you have to remove the order from your book
                const amount = (price > 0) ? size : 0;
                bookside.store (price, amount, id);
            } else {
                const size = (deltas[2] < 0) ? -deltas[2] : deltas[2];
                const side = (deltas[2] < 0) ? 'asks' : 'bids';
                const bookside = orderbook[side];
                bookside.store (deltas[0], size, deltas[1]);
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

    async authenticate (params = {}) {
        const url = this.urls['api']['ws']['private'];
        const client = this.client (url);
        const future = client.future ('authenticated');
        const method = 'auth';
        const authenticated = this.safeValue (client.subscriptions, method);
        if (authenticated === undefined) {
            const nonce = this.milliseconds ();
            const payload = 'AUTH' + nonce.toString ();
            const signature = this.hmac (this.encode (payload), this.encode (this.secret), 'sha384', 'hex');
            const request = {
                'apiKey': this.apiKey,
                'authSig': signature,
                'authNonce': nonce,
                'authPayload': payload,
                'event': method,
                'filter': [
                    'trading',
                    'wallet',
                ],
            };
            this.spawn (this.watch, url, method, request, 1);
        }
        return await future;
    }

    handleAuthenticationMessage (client, message) {
        const status = this.safeString (message, 'status');
        if (status === 'OK') {
            // we resolve the future here permanently so authentication only happens once
            const future = this.safeValue (client.futures, 'authenticated');
            future.resolve (true);
        } else {
            const error = new AuthenticationError (this.json (message));
            client.reject (error, 'authenticated');
            // allows further authentication attempts
            const method = this.safeString (message, 'event');
            if (method in client.subscriptions) {
                delete client.subscriptions[method];
            }
        }
    }

    async watchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const url = this.urls['api']['ws']['private'];
        await this.authenticate ();
        return await this.watch (url, id, undefined, 1);
    }

    async watchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        await this.authenticate ();
        const url = this.urls['api']['ws']['private'];
        const orders = await this.watch (url, 'os', undefined, 1);
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit, true);
    }

    handleOrders (client, message, subscription) {
        //
        // order snapshot
        //
        //     [
        //         0,
        //         'os',
        //         [
        //             [
        //                 45287766631,
        //                 'ETHUST',
        //                 -0.07,
        //                 -0.07,
        //                 'EXCHANGE LIMIT',
        //                 'ACTIVE',
        //                 210,
        //                 0,
        //                 '2020-05-16T13:17:46Z',
        //                 0,
        //                 0,
        //                 0
        //             ]
        //         ]
        //     ]
        //
        // order cancel
        //
        //     [
        //         0,
        //         'oc',
        //         [
        //             45287766631,
        //             'ETHUST',
        //             -0.07,
        //             -0.07,
        //             'EXCHANGE LIMIT',
        //             'CANCELED',
        //             210,
        //             0,
        //             '2020-05-16T13:17:46Z',
        //             0,
        //             0,
        //             0,
        //         ]
        //     ]
        //
        const data = this.safeValue (message, 2, []);
        const messageType = this.safeString (message, 1);
        if (messageType === 'os') {
            for (let i = 0; i < data.length; i++) {
                const value = data[i];
                this.handleOrder (client, value);
            }
        } else {
            this.handleOrder (client, data);
        }
        if (this.orders !== undefined) {
            client.resolve (this.orders, 'os');
        }
    }

    parseWsOrderStatus (status) {
        const statuses = {
            'ACTIVE': 'open',
            'CANCELED': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    handleOrder (client, order) {
        //
        // [ 45287766631,
        //     'ETHUST',
        //     -0.07,
        //     -0.07,
        //     'EXCHANGE LIMIT',
        //     'CANCELED',
        //     210,
        //     0,
        //     '2020-05-16T13:17:46Z',
        //     0,
        //     0,
        //     0 ]
        //
        const id = this.safeString (order, 0);
        const marketId = this.safeString (order, 1);
        const symbol = this.safeSymbol (marketId);
        let amount = this.safeFloat (order, 2);
        let remaining = this.safeFloat (order, 3);
        let side = 'buy';
        if (amount < 0) {
            amount = Math.abs (amount);
            remaining = Math.abs (remaining);
            side = 'sell';
        }
        let type = this.safeString (order, 4);
        if (type.indexOf ('LIMIT') > -1) {
            type = 'limit';
        } else if (type.indexOf ('MARKET') > -1) {
            type = 'market';
        }
        const status = this.parseWsOrderStatus (this.safeString (order, 5));
        const price = this.safeFloat (order, 6);
        const rawDatetime = this.safeString (order, 8);
        const timestamp = this.parse8601 (rawDatetime);
        const parsed = {
            'info': order,
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'average': undefined,
            'amount': amount,
            'remaining': remaining,
            'filled': amount - remaining,
            'status': status,
            'fee': undefined,
            'cost': undefined,
            'trades': undefined,
        };
        if (this.orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            this.orders = new ArrayCacheBySymbolById (limit);
        }
        const orders = this.orders;
        orders.append (parsed);
        client.resolve (parsed, id);
        return parsed;
    }

    handleMessage (client, message) {
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
            const name = this.safeString (message, 1);
            const methods = {
                'book': this.handleOrderBook,
                'candles': this.handleOHLCV,
                'ticker': this.handleTicker,
                'trades': this.handleTrades,
                'os': this.handleOrders,
                'on': this.handleOrders,
                'oc': this.handleOrders,
            };
            const method = this.safeValue2 (methods, channel, name);
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
                    'auth': this.handleAuthenticationMessage,
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
