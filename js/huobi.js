'use strict';

//  ---------------------------------------------------------------------------

const ccxt = require ('ccxt');
const { ExchangeError, InvalidNonce, ArgumentsRequired } = require ('ccxt/js/base/errors');
const { ArrayCache, ArrayCacheByTimestamp, ArrayCacheBySymbolById } = require ('./base/Cache');

//  ---------------------------------------------------------------------------

module.exports = class huobi extends ccxt.huobi {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchOrderBook': true,
                'watchTickers': false, // for now
                'watchTicker': true,
                'watchTrades': true,
                'watchMyTrades': true,
                'watchBalance': false, // for now
                'watchOHLCV': true,
            },
            'urls': {
                'api': {
                    'ws': {
                        'api': {
                            'spot': {
                                'public': 'wss://{hostname}/ws',
                                'private': 'wss://{hostname}/ws/v2',
                            },
                            'future': {
                                'linear': {
                                    'public': 'wss://api.hbdm.com/linear-swap-ws',
                                    'private': 'wss://api.hbdm.com/linear-swap-notification',
                                },
                                'inverse': {
                                    'public': 'wss://api.hbdm.com/ws',
                                    'private': 'wss://api.hbdm.com/notification',
                                },
                            },
                            'swap': {
                                'inverse': {
                                    'public': 'wss://api.hbdm.com/swap-ws',
                                    'private': 'wss://api.hbdm.com/swap-notification',
                                },
                                'linear': {
                                    'public': 'wss://api.hbdm.com/linear-swap-ws',
                                    'private': 'wss://api.hbdm.com/linear-swap-notification',
                                },
                            },
                        },
                        // these settings work faster for clients hosted on AWS
                        'api-aws': {
                            'public': 'wss://api-aws.huobi.pro/ws',
                            'private': 'wss://api-aws.huobi.pro/ws/v2',
                        },
                    },
                },
            },
            'options': {
                'tradesLimit': 1000,
                'OHLCVLimit': 1000,
                'api': 'api', // or api-aws for clients hosted on AWS
                'watchOrderBookSnapshot': {
                    'maxAttempts': 3,
                },
                'ws': {
                    'gunzip': true,
                },
            },
        });
    }

    requestId () {
        const requestId = this.sum (this.safeInteger (this.options, 'requestId', 0), 1);
        this.options['requestId'] = requestId;
        return requestId.toString ();
    }

    async watchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const messageHash = 'market.' + market['id'] + '.detail';
        const url = this.getUrlByMarketType (market['type'], market['linear']);
        return await this.subscribePublic (url, symbol, messageHash, undefined, params);
    }

    handleTicker (client, message) {
        //
        //     {
        //         ch: 'market.btcusdt.detail',
        //         ts: 1583494163784,
        //         tick: {
        //             id: 209988464418,
        //             low: 8988,
        //             high: 9155.41,
        //             open: 9078.91,
        //             close: 9136.46,
        //             vol: 237813910.5928412,
        //             amount: 26184.202558551195,
        //             version: 209988464418,
        //             count: 265673
        //         }
        //     }
        //
        const tick = this.safeValue (message, 'tick', {});
        const ch = this.safeString (message, 'ch');
        const parts = ch.split ('.');
        const marketId = this.safeString (parts, 1);
        const market = this.safeMarket (marketId);
        const ticker = this.parseTicker (tick, market);
        const timestamp = this.safeValue (message, 'ts');
        ticker['timestamp'] = timestamp;
        ticker['datetime'] = this.iso8601 (timestamp);
        const symbol = ticker['symbol'];
        this.tickers[symbol] = ticker;
        client.resolve (ticker, ch);
        return message;
    }

    async watchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const messageHash = 'market.' + market['id'] + '.trade.detail';
        const url = this.getUrlByMarketType (market['type'], market['linear']);
        const trades = await this.subscribePublic (url, symbol, messageHash, undefined, params);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleTrades (client, message) {
        //
        //     {
        //         ch: "market.btcusdt.trade.detail",
        //         ts: 1583495834011,
        //         tick: {
        //             id: 105004645372,
        //             ts: 1583495833751,
        //             data: [
        //                 {
        //                     id: 1.050046453727319e+22,
        //                     ts: 1583495833751,
        //                     tradeId: 102090727790,
        //                     amount: 0.003893,
        //                     price: 9150.01,
        //                     direction: "sell"
        //                 }
        //             ]
        //         }
        //     }
        //
        const tick = this.safeValue (message, 'tick', {});
        const data = this.safeValue (tick, 'data', {});
        const ch = this.safeString (message, 'ch');
        const parts = ch.split ('.');
        const marketId = this.safeString (parts, 1);
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        let tradesCache = this.safeValue (this.trades, symbol);
        if (tradesCache === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            tradesCache = new ArrayCache (limit);
            this.trades[symbol] = tradesCache;
        }
        for (let i = 0; i < data.length; i++) {
            const trade = this.parseTrade (data[i], market);
            tradesCache.append (trade);
        }
        client.resolve (tradesCache, ch);
        return message;
    }

    async watchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const interval = this.timeframes[timeframe];
        const messageHash = 'market.' + market['id'] + '.kline.' + interval;
        const url = this.getUrlByMarketType (market['type'], market['linear']);
        const ohlcv = await this.subscribePublic (url, symbol, messageHash, undefined, params);
        if (this.newUpdates) {
            limit = ohlcv.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0, true);
    }

    handleOHLCV (client, message) {
        //
        //     {
        //         ch: 'market.btcusdt.kline.1min',
        //         ts: 1583501786794,
        //         tick: {
        //             id: 1583501760,
        //             open: 9094.5,
        //             close: 9094.51,
        //             low: 9094.5,
        //             high: 9094.51,
        //             amount: 0.44639786263800907,
        //             vol: 4059.76919054,
        //             count: 16
        //         }
        //     }
        //
        const ch = this.safeString (message, 'ch');
        const parts = ch.split ('.');
        const marketId = this.safeString (parts, 1);
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const interval = this.safeString (parts, 3);
        const timeframe = this.findTimeframe (interval);
        this.ohlcvs[symbol] = this.safeValue (this.ohlcvs, symbol, {});
        let stored = this.safeValue (this.ohlcvs[symbol], timeframe);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
            stored = new ArrayCacheByTimestamp (limit);
            this.ohlcvs[symbol][timeframe] = stored;
        }
        const tick = this.safeValue (message, 'tick');
        const parsed = this.parseOHLCV (tick, market);
        stored.append (parsed);
        client.resolve (stored, ch);
    }

    async watchOrderBook (symbol, limit = undefined, params = {}) {
        if ((limit !== undefined) && (limit !== 150)) {
            throw new ExchangeError (this.id + ' watchOrderBook accepts limit = 150 only');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        // only supports a limit of 150 at this time
        limit = (limit === undefined) ? 150 : limit;
        let messageHash = undefined;
        if (market['spot']) {
            messageHash = 'market.' + market['id'] + '.mbp.' + limit.toString ();
        } else {
            messageHash = 'market.' + market['id'] + '.depth.size_' + limit.toString () + '.high_freq';
        }
        const url = this.getUrlByMarketType (market['type'], market['linear']);
        if (!market['spot']) {
            params['data_type'] = 'incremental';
        }
        const orderbook = await this.subscribePublic (url, symbol, messageHash, this.handleOrderBookSubscription, params);
        return orderbook.limit (limit);
    }

    handleOrderBookSnapshot (client, message, subscription) {
        //
        //     {
        //         id: 1583473663565,
        //         rep: 'market.btcusdt.mbp.150',
        //         status: 'ok',
        //         data: {
        //             seqNum: 104999417756,
        //             bids: [
        //                 [9058.27, 0],
        //                 [9058.43, 0],
        //                 [9058.99, 0],
        //             ],
        //             asks: [
        //                 [9084.27, 0.2],
        //                 [9085.69, 0],
        //                 [9085.81, 0],
        //             ]
        //         }
        //     }
        //
        const symbol = this.safeString (subscription, 'symbol');
        const messageHash = this.safeString (subscription, 'messageHash');
        try {
            const orderbook = this.orderbooks[symbol];
            const data = this.safeValue (message, 'data');
            const messages = orderbook.cache;
            const firstMessage = this.safeValue (messages, 0, {});
            const snapshot = this.parseOrderBook (data, symbol);
            const tick = this.safeValue (firstMessage, 'tick');
            const sequence = this.safeInteger (tick, 'seqNum');
            const nonce = this.safeInteger (data, 'seqNum');
            snapshot['nonce'] = nonce;
            if ((sequence !== undefined) && (nonce < sequence)) {
                const options = this.safeValue (this.options, 'watchOrderBookSnapshot', {});
                const maxAttempts = this.safeInteger (options, 'maxAttempts', 3);
                let numAttempts = this.safeInteger (subscription, 'numAttempts', 0);
                // retry to syncrhonize if we haven't reached maxAttempts yet
                if (numAttempts < maxAttempts) {
                    // safety guard
                    if (messageHash in client.subscriptions) {
                        numAttempts = this.sum (numAttempts, 1);
                        subscription['numAttempts'] = numAttempts;
                        client.subscriptions[messageHash] = subscription;
                        this.spawn (this.watchOrderBookSnapshot, client, message, subscription);
                    }
                } else {
                    // throw upon failing to synchronize in maxAttempts
                    throw new InvalidNonce (this.id + ' failed to synchronize WebSocket feed with the snapshot for symbol ' + symbol + ' in ' + maxAttempts.toString () + ' attempts');
                }
            } else {
                orderbook.reset (snapshot);
                // unroll the accumulated deltas
                for (let i = 0; i < messages.length; i++) {
                    const message = messages[i];
                    this.handleOrderBookMessage (client, message, orderbook);
                }
                this.orderbooks[symbol] = orderbook;
                client.resolve (orderbook, messageHash);
            }
        } catch (e) {
            client.reject (e, messageHash);
        }
    }

    async watchOrderBookSnapshot (client, message, subscription) {
        const symbol = this.safeString (subscription, 'symbol');
        const limit = this.safeInteger (subscription, 'limit');
        const params = this.safeValue (subscription, 'params');
        const attempts = this.safeNumber (subscription, 'numAttempts', 0);
        const messageHash = this.safeString (subscription, 'messageHash');
        const market = this.market (symbol);
        const url = this.getUrlByMarketType (market['type'], market['linear']);
        const requestId = this.requestId ();
        const request = {
            'req': messageHash,
            'id': requestId,
        };
        // this is a temporary subscription by a specific requestId
        // it has a very short lifetime until the snapshot is received over ws
        const snapshotSubscription = {
            'id': requestId,
            'messageHash': messageHash,
            'symbol': symbol,
            'limit': limit,
            'params': params,
            'numAttempts': attempts,
            'method': this.handleOrderBookSnapshot,
        };
        const orderbook = await this.watch (url, requestId, request, requestId, snapshotSubscription);
        return orderbook.limit (limit);
    }

    async fetchOrderBookSnapshot (client, message, subscription) {
        const symbol = this.safeString (subscription, 'symbol');
        const limit = this.safeInteger (subscription, 'limit');
        const messageHash = this.safeString (subscription, 'messageHash');
        try {
            const snapshot = await this.fetchOrderBook (symbol, limit);
            const orderbook = this.orderbooks[symbol];
            const messages = orderbook.cache;
            const firstMessage = this.safeValue (messages, 0, {});
            const tick = this.safeValue (firstMessage, 'tick');
            const sequence = this.safeInteger (tick, 'seqNum');
            const nonce = this.safeInteger (snapshot, 'nonce');
            // if the received snapshot is earlier than the first cached delta
            // then we cannot align it with the cached deltas and we need to
            // retry synchronizing in maxAttempts
            if ((sequence !== undefined) && (nonce < sequence)) {
                const options = this.safeValue (this.options, 'watchOrderBookSnapshot', {});
                const maxAttempts = this.safeInteger (options, 'maxAttempts', 3);
                let numAttempts = this.safeInteger (subscription, 'numAttempts', 0);
                // retry to syncrhonize if we haven't reached maxAttempts yet
                if (numAttempts < maxAttempts) {
                    // safety guard
                    if (messageHash in client.subscriptions) {
                        numAttempts = this.sum (numAttempts, 1);
                        subscription['numAttempts'] = numAttempts;
                        client.subscriptions[messageHash] = subscription;
                        this.spawn (this.fetchOrderBookSnapshot, client, message, subscription);
                    }
                } else {
                    // throw upon failing to synchronize in maxAttempts
                    throw new InvalidNonce (this.id + ' failed to synchronize WebSocket feed with the snapshot for symbol ' + symbol + ' in ' + maxAttempts.toString () + ' attempts');
                }
            } else {
                orderbook.reset (snapshot);
                // unroll the accumulated deltas
                for (let i = 0; i < messages.length; i++) {
                    const message = messages[i];
                    this.handleOrderBookMessage (client, message, orderbook);
                }
                this.orderbooks[symbol] = orderbook;
                client.resolve (orderbook, messageHash);
            }
        } catch (e) {
            client.reject (e, messageHash);
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

    handleOrderBookMessage (client, message, orderbook) {
        // spot markets
        //     {
        //         ch: "market.btcusdt.mbp.150",
        //         ts: 1583472025885,
        //         tick: {
        //             seqNum: 104998984994,
        //             prevSeqNum: 104998984977,
        //             bids: [
        //                 [9058.27, 0],
        //                 [9058.43, 0],
        //                 [9058.99, 0],
        //             ],
        //             asks: [
        //                 [9084.27, 0.2],
        //                 [9085.69, 0],
        //                 [9085.81, 0],
        //             ]
        //         }
        //     }
        // non-spot market
        //     {
        //         "ch":"market.BTC220218.depth.size_150.high_freq",
        //         "tick":{
        //            "asks":[
        //            ],
        //            "bids":[
        //               [43445.74,1],
        //               [43444.48,0 ],
        //               [40593.92,9]
        //             ],
        //            "ch":"market.BTC220218.depth.size_150.high_freq",
        //            "event":"update",
        //            "id":152727500274,
        //            "mrid":152727500274,
        //            "ts":1645023376098,
        //            "version":37536690
        //         },
        //         "ts":1645023376098
        //      }
        const tick = this.safeValue (message, 'tick', {});
        const seqNum = this.safeInteger2 (tick, 'seqNum', 'id');
        const prevSeqNum = this.safeInteger (tick, 'prevSeqNum');
        if ((prevSeqNum === undefined || prevSeqNum <= orderbook['nonce']) && (seqNum > orderbook['nonce'])) {
            const asks = this.safeValue (tick, 'asks', []);
            const bids = this.safeValue (tick, 'bids', []);
            this.handleDeltas (orderbook['asks'], asks);
            this.handleDeltas (orderbook['bids'], bids);
            orderbook['nonce'] = seqNum;
            const timestamp = this.safeInteger (message, 'ts');
            orderbook['timestamp'] = timestamp;
            orderbook['datetime'] = this.iso8601 (timestamp);
        }
        return orderbook;
    }

    handleOrderBook (client, message) {
        //
        // deltas
        //
        // spot markets
        //     {
        //         ch: "market.btcusdt.mbp.150",
        //         ts: 1583472025885,
        //         tick: {
        //             seqNum: 104998984994,
        //             prevSeqNum: 104998984977,
        //             bids: [
        //                 [9058.27, 0],
        //                 [9058.43, 0],
        //                 [9058.99, 0],
        //             ],
        //             asks: [
        //                 [9084.27, 0.2],
        //                 [9085.69, 0],
        //                 [9085.81, 0],
        //             ]
        //         }
        //     }
        //
        // non spot markets
        //     {
        //         "ch":"market.BTC220218.depth.size_150.high_freq",
        //         "tick":{
        //            "asks":[
        //            ],
        //            "bids":[
        //               [43445.74,1],
        //               [43444.48,0 ],
        //               [40593.92,9]
        //             ],
        //            "ch":"market.BTC220218.depth.size_150.high_freq",
        //            "event":"update",
        //            "id":152727500274,
        //            "mrid":152727500274,
        //            "ts":1645023376098,
        //            "version":37536690
        //         },
        //         "ts":1645023376098
        //      }
        const messageHash = this.safeString (message, 'ch');
        const ch = this.safeValue (message, 'ch');
        const parts = ch.split ('.');
        const marketId = this.safeString (parts, 1);
        const symbol = this.safeSymbol (marketId);
        let orderbook = this.safeValue (this.orderbooks, symbol);
        if (orderbook === undefined) {
            const size = this.safeString (parts, 3);
            const sizeParts = size.split ('_');
            const limit = this.safeNumber (sizeParts, 1);
            orderbook = this.orderBook ({}, limit);
        }
        if (orderbook['nonce'] === undefined) {
            orderbook.cache.push (message);
        } else {
            this.handleOrderBookMessage (client, message, orderbook);
            client.resolve (orderbook, messageHash);
        }
    }

    handleOrderBookSubscription (client, message, subscription) {
        const symbol = this.safeString (subscription, 'symbol');
        const limit = this.safeInteger (subscription, 'limit');
        if (symbol in this.orderbooks) {
            delete this.orderbooks[symbol];
        }
        this.orderbooks[symbol] = this.orderBook ({}, limit);
        if (this.markets[symbol]['spot'] === true) {
            this.spawn (this.watchOrderBookSnapshot, client, message, subscription);
        } else {
            this.spawn (this.fetchOrderBookSnapshot, client, message, subscription);
        }
    }

    async watchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        this.checkRequiredCredentials ();
        let type = undefined;
        let marketId = '*'; // wildcard
        if (symbol !== undefined) {
            await this.loadMarkets ();
            const market = this.market (symbol);
            type = market['type'];
            marketId = market['id'].toLowerCase ();
        } else {
            [ type, params ] = this.handleMarketTypeAndParams ('watchMyTrades', undefined, params);
        }
        if (type !== 'spot') {
            throw new ArgumentsRequired (this.id + ' watchMyTrades supports spot markets only');
        }
        let mode = undefined;
        if (mode === undefined) {
            mode = this.safeString2 (this.options, 'watchMyTrades', 'mode', 0);
            mode = this.safeString (params, 'mode', mode);
        }
        const messageHash = 'trade.clearing' + '#' + marketId + '#' + mode;
        const trades = await this.subscribePrivate (messageHash, type, 'linear', params);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit);
    }

    handleSubscriptionStatus (client, message) {
        //
        //     {
        //         "id": 1583414227,
        //         "status": "ok",
        //         "subbed": "market.btcusdt.mbp.150",
        //         "ts": 1583414229143
        //     }
        //
        const id = this.safeString (message, 'id');
        const subscriptionsById = this.indexBy (client.subscriptions, 'id');
        const subscription = this.safeValue (subscriptionsById, id);
        if (subscription !== undefined) {
            const method = this.safeValue (subscription, 'method');
            if (method !== undefined) {
                return method.call (this, client, message, subscription);
            }
            // clean up
            if (id in client.subscriptions) {
                delete client.subscriptions[id];
            }
        }
        return message;
    }

    handleSystemStatus (client, message) {
        //
        // todo: answer the question whether handleSystemStatus should be renamed
        // and unified as handleStatus for any usage pattern that
        // involves system status and maintenance updates
        //
        //     {
        //         id: '1578090234088', // connectId
        //         type: 'welcome',
        //     }
        //
        return message;
    }

    handleSubject (client, message) {
        // spot
        //     {
        //         ch: "market.btcusdt.mbp.150",
        //         ts: 1583472025885,
        //         tick: {
        //             seqNum: 104998984994,
        //             prevSeqNum: 104998984977,
        //             bids: [
        //                 [9058.27, 0],
        //                 [9058.43, 0],
        //                 [9058.99, 0],
        //             ],
        //             asks: [
        //                 [9084.27, 0.2],
        //                 [9085.69, 0],
        //                 [9085.81, 0],
        //             ]
        //         }
        //     }
        // non spot
        //     {
        //         "ch":"market.BTC220218.depth.size_150.high_freq",
        //         "tick":{
        //            "asks":[
        //            ],
        //            "bids":[
        //               [43445.74,1],
        //               [43444.48,0 ],
        //               [40593.92,9]
        //             ],
        //            "ch":"market.BTC220218.depth.size_150.high_freq",
        //            "event":"update",
        //            "id":152727500274,
        //            "mrid":152727500274,
        //            "ts":1645023376098,
        //            "version":37536690
        //         },
        //         "ts":1645023376098
        //      }
        // spot private trade
        //
        //  {
        //      "action":"push",
        //      "ch":"trade.clearing#ltcusdt#1",
        //      "data":{
        //         "eventType":"trade",
        //         "symbol":"ltcusdt",
        //           (...)
        //  }
        //
        const ch = this.safeValue (message, 'ch');
        const parts = ch.split ('.');
        const type = this.safeString (parts, 0);
        if (type === 'market') {
            const methodName = this.safeString (parts, 2);
            const methods = {
                'depth': this.handleOrderBook,
                'mbp': this.handleOrderBook,
                'detail': this.handleTicker,
                'trade': this.handleTrades,
                'kline': this.handleOHLCV,
                // ...
            };
            const method = this.safeValue (methods, methodName);
            if (method === undefined) {
                return message;
            } else {
                return method.call (this, client, message);
            }
        }
        // private subjects
        const privateParts = ch.split ('#');
        const privateType = this.safeString (privateParts, 0);
        if (privateType === 'trade.clearing') {
            this.handleMyTrade (client, message);
        }
    }

    async pong (client, message) {
        //
        //     { ping: 1583491673714 }
        //
        // or
        //     { action: 'ping', data: { ts: 1645108204665 } }
        //
        // or
        //     { op: 'ping', ts: '1645202800015' }
        //
        const ping = this.safeInteger (message, 'ping');
        if (ping !== undefined) {
            await client.send ({ 'pong': ping });
            return;
        }
        const action = this.safeString (message, 'action');
        if (action === 'ping') {
            const data = this.safeValue (message, 'data');
            const ping = this.safeInteger (data, 'ts');
            await client.send ({ 'action': 'pong', 'data': { 'ts': ping }});
            return;
        }
        const op = this.safeString (message, 'op');
        if (op === 'ping') {
            const ping = this.safeInteger (message, 'ts');
            await client.send ({ 'op': 'pong', 'ts': ping });
        }
    }

    handlePing (client, message) {
        this.spawn (this.pong, client, message);
    }

    handleAuthenticate (client, message) {
        // spot
        // {
        //     "action": "req",
        //     "code": 200,
        //     "ch": "auth",
        //     "data": {}
        // }
        // non spot
        //    {
        //        op: 'auth',
        //        type: 'api',
        //        'err-code': 0,
        //        ts: 1645200307319,
        //        data: { 'user-id': '35930539' }
        //    }
        //
        client.resolve (message, 'auth');
        return message;
    }

    handleErrorMessage (client, message) {
        //
        //     {
        //         ts: 1586323747018,
        //         status: 'error',
        //         'err-code': 'bad-request',
        //         'err-msg': 'invalid mbp.150.symbol linkusdt',
        //         id: '2'
        //     }
        //
        const status = this.safeString (message, 'status');
        if (status === 'error') {
            const id = this.safeString (message, 'id');
            const subscriptionsById = this.indexBy (client.subscriptions, 'id');
            const subscription = this.safeValue (subscriptionsById, id);
            if (subscription !== undefined) {
                const errorCode = this.safeString (message, 'err-code');
                try {
                    this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, this.json (message));
                } catch (e) {
                    const messageHash = this.safeString (subscription, 'messageHash');
                    client.reject (e, messageHash);
                    client.reject (e, id);
                    if (id in client.subscriptions) {
                        delete client.subscriptions[id];
                    }
                }
            }
            return false;
        }
        return message;
    }

    handleMessage (client, message) {
        if (this.handleErrorMessage (client, message)) {
            //
            //     {"id":1583414227,"status":"ok","subbed":"market.btcusdt.mbp.150","ts":1583414229143}
            //
            // first ping format
            //
            //    {'ping': 1645106821667 }
            //
            // second ping format
            //
            //    {"action":"ping","data":{"ts":1645106821667}}
            //
            // third pong format
            //
            //
            // auth spot
            //     {
            //         "action": "req",
            //         "code": 200,
            //         "ch": "auth",
            //         "data": {}
            //     }
            // auth non spot
            //    {
            //        op: 'auth',
            //        type: 'api',
            //        'err-code': 0,
            //        ts: 1645200307319,
            //        data: { 'user-id': '35930539' }
            //    }
            // trade
            // {
            //     "action":"push",
            //     "ch":"trade.clearing#ltcusdt#1",
            //     "data":{
            //        "eventType":"trade",
            //          (...)
            //     }
            //  }
            //
            if ('id' in message) {
                this.handleSubscriptionStatus (client, message);
                return;
            }
            if ('action' in message) {
                const action = this.safeString (message, 'action');
                if (action === 'ping') {
                    this.handlePing (client, message);
                    return;
                }
                if (action === 'sub') {
                    this.handleSubscriptionStatus (client, message);
                    return;
                }
            }
            if ('ch' in message) {
                if (message['ch'] === 'auth') {
                    this.handleAuthenticate (client, message);
                    return;
                } else {
                    // route by channel aka topic aka subject
                    this.handleSubject (client, message);
                    return;
                }
            }
            if ('ping' in message) {
                this.handlePing (client, message);
            }
        }
    }

    handleMyTrade (client, message) {
        //
        // spot
        //
        // {
        //     "action":"push",
        //     "ch":"trade.clearing#ltcusdt#1",
        //     "data":{
        //        "eventType":"trade",
        //        "symbol":"ltcusdt",
        //        "orderId":"478862728954426",
        //        "orderSide":"buy",
        //        "orderType":"buy-market",
        //        "accountId":44234548,
        //        "source":"spot-web",
        //        "orderValue":"5.01724137",
        //        "orderCreateTime":1645124660365,
        //        "orderStatus":"filled",
        //        "feeCurrency":"ltc",
        //        "tradePrice":"118.89",
        //        "tradeVolume":"0.042200701236437042",
        //        "aggressor":true,
        //        "tradeId":101539740584,
        //        "tradeTime":1645124660368,
        //        "transactFee":"0.000041778694224073",
        //        "feeDeduct":"0",
        //        "feeDeductType":""
        //     }
        //  }
        //
        if (this.myTrades === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            this.myTrades = new ArrayCacheBySymbolById (limit);
        }
        const cachedTrades = this.myTrades;
        const messageHash = this.safeString (message, 'ch');
        if (messageHash !== undefined) {
            const data = this.safeValue (message, 'data');
            const parsed = this.parseWsTrade (data);
            const symbol = this.safeString (parsed, 'symbol');
            if (symbol !== undefined) {
                cachedTrades.append (parsed);
            }
            client.resolve (this.myTrades, messageHash);
        }
    }

    parseWsTrade (trade) {
        // spot private
        //
        //   {
        //        "eventType":"trade",
        //        "symbol":"ltcusdt",
        //        "orderId":"478862728954426",
        //        "orderSide":"buy",
        //        "orderType":"buy-market",
        //        "accountId":44234548,
        //        "source":"spot-web",
        //        "orderValue":"5.01724137",
        //        "orderCreateTime":1645124660365,
        //        "orderStatus":"filled",
        //        "feeCurrency":"ltc",
        //        "tradePrice":"118.89",
        //        "tradeVolume":"0.042200701236437042",
        //        "aggressor":true,
        //        "tradeId":101539740584,
        //        "tradeTime":1645124660368,
        //        "transactFee":"0.000041778694224073",
        //        "feeDeduct":"0",
        //        "feeDeductType":""
        //  }
        const symbol = this.safeSymbol (this.safeString (trade, 'symbol'));
        const side = this.safeString2 (trade, 'side', 'orderSide');
        const tradeId = this.safeString (trade, 'tradeId');
        const price = this.safeString (trade, 'tradePrice');
        const amount = this.safeString (trade, 'tradeVolume');
        const order = this.safeString (trade, 'orderId');
        const timestamp = this.safeInteger (trade, 'tradeTime');
        const market = this.market (symbol);
        let orderType = this.safeString (trade, 'orderType');
        const aggressor = this.safeValue (trade, 'aggressor');
        let takerOrMaker = undefined;
        if (aggressor !== undefined) {
            takerOrMaker = aggressor ? 'taker' : 'maker';
        }
        let type = undefined;
        if (orderType !== undefined) {
            orderType = orderType.split ('-');
            type = this.safeString (orderType, 1);
        }
        let fee = undefined;
        const feeCurrency = this.safeCurrencyCode (this.safeString (trade, 'feeCurrency'));
        if (feeCurrency !== undefined) {
            fee = {
                'cost': this.safeString (trade, 'transactFee'),
                'currency': feeCurrency,
            };
        }
        return this.safeTrade ({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': tradeId,
            'order': order,
            'type': type,
            'takerOrMaker': takerOrMaker,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': fee,
        }, market);
    }

    getUrlByMarketType (type, isLinear = true, isPrivate = false) {
        const api = this.safeString (this.options, 'api', 'api');
        const hostname = { 'hostname': this.hostname };
        let hostnameURL = undefined;
        let url = undefined;
        if (type === 'spot') {
            if (isPrivate) {
                hostnameURL = this.urls['api']['ws'][api]['spot']['private'];
            } else {
                hostnameURL = this.urls['api']['ws'][api]['spot']['public'];
            }
            url = this.implodeParams (hostnameURL, hostname);
        } else {
            const baseUrl = this.urls['api']['ws'][api][type];
            const subTypeUrl = isLinear ? baseUrl['linear'] : baseUrl['inverse'];
            url = isPrivate ? subTypeUrl['private'] : subTypeUrl['public'];
        }
        return url;
    }

    async subscribePublic (url, symbol, messageHash, method = undefined, params = {}) {
        const requestId = this.requestId ();
        const request = {
            'sub': messageHash,
            'id': requestId,
        };
        const subscription = {
            'id': requestId,
            'messageHash': messageHash,
            'symbol': symbol,
            'params': params,
        };
        if (method !== undefined) {
            subscription['method'] = method;
        }
        return await this.watch (url, messageHash, this.extend (request, params), messageHash, subscription);
    }

    async subscribePrivate (messageHash, type, subtype, params = {}) {
        const requestId = this.nonce ();
        const subscription = {
            'id': requestId,
            'messageHash': messageHash,
            'params': params,
        };
        let request = undefined;
        if (type === 'spot') {
            request = {
                'action': 'sub',
                'ch': messageHash,
            };
        } else {
            request = {
                'op': 'sub',
                'topic': messageHash,
                'cid': requestId,
            };
        }
        const isLinear = subtype === 'linear';
        const url = this.getUrlByMarketType (type, isLinear, true);
        const hostname = (type === 'spot') ? this.urls['hostnames']['spot'] : this.urls['hostnames']['contract'];
        const authParams = {
            'type': type,
            'url': url,
            'hostname': hostname,
        };
        if (type === 'spot') {
            this.options['ws']['gunzip'] = false;
        }
        await this.authenticate (authParams);
        return await this.watch (url, messageHash, this.extend (request, params), messageHash, subscription);
    }

    async authenticate (params = {}) {
        const url = this.safeString (params, 'url');
        const hostname = this.safeString (params, 'hostname');
        const type = this.safeString (params, 'type');
        if (url === undefined || hostname === undefined || type === undefined) {
            throw new ArgumentsRequired (this.id + ' authenticate requires a url, hostname and type argument');
        }
        this.checkRequiredCredentials ();
        const messageHash = 'auth';
        const relativePath = url.replace ('wss://' + hostname, '');
        const client = this.client (url);
        let future = this.safeValue (client.subscriptions, messageHash);
        if (future === undefined) {
            future = client.future (messageHash);
            const timestamp = this.ymdhms (this.milliseconds (), 'T');
            let signatureParams = undefined;
            if (type === 'spot') {
                signatureParams = {
                    'accessKey': this.apiKey,
                    'signatureMethod': 'HmacSHA256',
                    'signatureVersion': '2.1',
                    'timestamp': timestamp,
                };
            } else {
                signatureParams = {
                    'AccessKeyId': this.apiKey,
                    'SignatureMethod': 'HmacSHA256',
                    'SignatureVersion': '2',
                    'Timestamp': timestamp,
                };
            }
            signatureParams = this.keysort (signatureParams);
            const auth = this.urlencode (signatureParams);
            const payload = [ 'GET', hostname, relativePath, auth ].join ("\n"); // eslint-disable-line quotes
            const signature = this.hmac (this.encode (payload), this.encode (this.secret), 'sha256', 'base64');
            let request = undefined;
            if (type === 'spot') {
                const params = {
                    'authType': 'api',
                    'accessKey': this.apiKey,
                    'signatureMethod': 'HmacSHA256',
                    'signatureVersion': '2.1',
                    'timestamp': timestamp,
                    'signature': signature,
                };
                request = {
                    'params': params,
                    'action': 'req',
                    'ch': messageHash,
                };
            } else {
                request = {
                    'op': messageHash,
                    'type': 'api',
                    'AccessKeyId': this.apiKey,
                    'SignatureMethod': 'HmacSHA256',
                    'SignatureVersion': '2',
                    'Timestamp': timestamp,
                    'Signature': signature,
                };
            }
            await this.watch (url, messageHash, request, messageHash, future);
        }
        return await future;
    }
};
