'use strict';

//  ---------------------------------------------------------------------------

const ccxt = require ('ccxt');
const { ExchangeError } = require ('ccxt/js/base/errors');

//  ---------------------------------------------------------------------------

module.exports = class huobipro extends ccxt.huobipro {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchOrderBook': true,
                'watchTickers': false, // for now
                'watchTicker': true,
                'watchTrades': true,
                'watchBalance': false, // for now
                'watchOHLCV': false, // for now
            },
            'urls': {
                'api': {
                    'ws': {
                        'api': {
                            'public': 'wss://api.huobi.pro/ws',
                            'private': 'wss://api.huobi.pro/ws/v2',
                        },
                        // these settings work faster for clients hosted on AWS
                        'api-aws': {
                            'public': 'wss://api-aws.huobi.pro/ws',
                            'private': 'wss://api-aws.huobi.pro/ws/v2',
                        }
                    }
                },
            },
            'options': {
                'tradesLimit': 1000,
                'ws': {
                    'api': 'api', // or api-aws for clients hosted on AWS
                    'gunzip': true,
                },
            },
        });
    }

    async watchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        // only supports a limit of 150 at this time
        const messageHash = 'market.' + market['id'] + '.detail';
        const options = this.safeString (this.options, 'ws', {});
        const api = this.safeString (options, 'api', 'api');
        const url = this.urls['api']['ws'][api]['public'];
        const requestId = this.milliseconds ();
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
        return await this.watch (url, messageHash, this.extend (request, params), messageHash, subscription);
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
        if (marketId in this.markets_by_id) {
            const market = this.markets_by_id[marketId];
            const ticker = this.parseTicker (tick, market);
            const timestamp = this.safeValue (message, 'ts');
            ticker['timestamp'] = timestamp;
            ticker['datetime'] = this.iso8601 (timestamp);
            const symbol = ticker['symbol'];
            this.tickers[symbol] = ticker;
            client.resolve (ticker, ch);
        }
        return message;
    }

    async watchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        // only supports a limit of 150 at this time
        const messageHash = 'market.' + market['id'] + '.trade.detail';
        const options = this.safeString (this.options, 'ws', {});
        const api = this.safeString (options, 'api', 'api');
        const url = this.urls['api']['ws'][api]['public'];
        const requestId = this.milliseconds ();
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
        const future = this.watch (url, messageHash, this.extend (request, params), messageHash, subscription);
        return await this.after (future, this.filterBySinceLimit, since, limit);
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
        if (marketId in this.markets_by_id) {
            const market = this.markets_by_id[marketId];
            const symbol = market['symbol'];
            const array = this.safeValue (this.trades, symbol, []);
            for (let i = 0; i < data.length; i++) {
                const trade = this.parseTrade (data[i], market);
                array.push (trade);
                const length = array.length;
                if (length > this.options['tradesLimit']) {
                    array.shift ();
                }
                this.trades[symbol] = array;
            }
            client.resolve (array, ch);
        }
        return message;
    }

    async watchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const interval = this.timeframes[timeframe];
        const messageHash = 'market.' + market['id'] + '.kline.' + interval;
        const options = this.safeString (this.options, 'ws', {});
        const api = this.safeString (options, 'api', 'api');
        const url = this.urls['api']['ws'][api]['public'];
        const requestId = this.milliseconds ();
        const request = {
            'sub': messageHash,
            'id': requestId,
        };
        const subscription = {
            'id': requestId,
            'messageHash': messageHash,
            'symbol': symbol,
            'timeframe': timeframe,
            'params': params,
        };
        const future = this.watch (url, messageHash, this.extend (request, params), messageHash, subscription);
        return await this.after (future, this.filterBySinceLimit, since, limit);
    }

    handleOHLCV (client, message) {
        console.log ('handleOHLCV', message);
        process.exit ();
        //
        //     {
        //         e: 'kline',
        //         E: 1579482921215,
        //         s: 'ETHBTC',
        //         k: {
        //             t: 1579482900000,
        //             T: 1579482959999,
        //             s: 'ETHBTC',
        //             i: '1m',
        //             f: 158411535,
        //             L: 158411550,
        //             o: '0.01913200',
        //             c: '0.01913500',
        //             h: '0.01913700',
        //             l: '0.01913200',
        //             v: '5.08400000',
        //             n: 16,
        //             x: false,
        //             q: '0.09728060',
        //             V: '3.30200000',
        //             Q: '0.06318500',
        //             B: '0'
        //         }
        //     }
        //
        const marketId = this.safeString (message, 's');
        const lowercaseMarketId = this.safeStringLower (message, 's');
        const event = this.safeString (message, 'e');
        const kline = this.safeValue (message, 'k');
        const interval = this.safeString (kline, 'i');
        // use a reverse lookup in a static map instead
        const timeframe = this.findTimeframe (interval);
        const messageHash = lowercaseMarketId + '@' + event + '_' + interval;
        const parsed = [
            this.safeInteger (kline, 't'),
            this.safeFloat (kline, 'o'),
            this.safeFloat (kline, 'h'),
            this.safeFloat (kline, 'l'),
            this.safeFloat (kline, 'c'),
            this.safeFloat (kline, 'v'),
        ];
        let symbol = marketId;
        if (marketId in this.markets_by_id) {
            const market = this.markets_by_id[marketId];
            symbol = market['symbol'];
        }
        this.ohlcvs[symbol] = this.safeValue (this.ohlcvs, symbol, {});
        const stored = this.safeValue (this.ohlcvs[symbol], timeframe, []);
        const length = stored.length;
        if (length && parsed[0] === stored[length - 1][0]) {
            stored[length - 1] = parsed;
        } else {
            stored.push (parsed);
            if (length + 1 > this.options['OHLCVLimit']) {
                stored.shift ();
            }
        }
        this.ohlcvs[symbol][timeframe] = stored;
        client.resolve (stored, messageHash);
    }

    async watchOrderBook (symbol, limit = undefined, params = {}) {
        if ((limit !== undefined) && (limit !== 150)) {
            throw ExchangeError (this.id + ' watchOrderBook accepts limit = 150 only');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        // only supports a limit of 150 at this time
        limit = (limit === undefined) ? 150 : limit;
        const messageHash = 'market.' + market['id'] + '.mbp.' + limit.toString ();
        const options = this.safeString (this.options, 'ws', {});
        const api = this.safeString (options, 'api', 'api');
        const url = this.urls['api']['ws'][api]['public'];
        const requestId = this.milliseconds ();
        const request = {
            'sub': messageHash,
            'id': requestId,
        };
        const subscription = {
            'id': requestId,
            'messageHash': messageHash,
            'symbol': symbol,
            'limit': limit,
            'params': params,
            'method': this.handleOrderBookSubscription,
        };
        const future = this.watch (url, messageHash, this.extend (request, params), messageHash, subscription);
        return await this.after (future, this.limitOrderBook, symbol, limit, params);
    }

    limitOrderBook (orderbook, symbol, limit = undefined, params = {}) {
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
        const orderbook = this.orderbooks[symbol];
        const data = this.safeValue (message, 'data');
        const snapshot = this.parseOrderBook (data);
        snapshot['nonce'] = this.safeInteger (data, 'seqNum');
        orderbook.reset (snapshot);
        // unroll the accumulated deltas
        const messages = orderbook.cache;
        for (let i = 0; i < messages.length; i++) {
            const message = messages[i];
            this.handleOrderBookMessage (client, message, orderbook);
        }
        this.orderbooks[symbol] = orderbook;
        client.resolve (orderbook, messageHash);
    }

    async watchOrderBookSnapshot (client, message, subscription) {
        const symbol = this.safeString (subscription, 'symbol');
        const limit = this.safeInteger (subscription, 'limit');
        const params = this.safeValue (subscription, 'params');
        const messageHash = this.safeString (subscription, 'messageHash');
        const options = this.safeValue (this.options, 'ws', {});
        const api = this.safeValue (options, 'api');
        const url = this.urls['api']['ws'][api]['public'];
        const requestId = this.milliseconds ();
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
            'method': this.handleOrderBookSnapshot,
        };
        const future = this.watch (url, requestId, request, requestId, snapshotSubscription);
        return await this.after (future, this.limitOrderBook, symbol, limit, params);
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
        //
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
        const tick = this.safeValue (message, 'tick', {});
        const seqNum = this.safeInteger (tick, 'seqNum');
        const prevSeqNum = this.safeInteger (tick, 'prevSeqNum');
        if ((prevSeqNum <= orderbook['nonce']) && (seqNum > orderbook['nonce'])) {
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
        const messageHash = this.safeString (message, 'ch');
        const ch = this.safeValue (message, 'ch');
        const parts = ch.split ('.');
        const marketId = this.safeString (parts, 1);
        let market = undefined;
        let symbol = undefined;
        if (marketId !== undefined) {
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
                symbol = market['symbol'];
            }
        }
        const orderbook = this.orderbooks[symbol];
        if (orderbook['nonce'] === undefined) {
            orderbook.cache.push (message);
        } else {
            this.handleOrderBookMessage (client, message, orderbook);
            client.resolve (orderbook, messageHash);
        }
    }

    signMessage (client, messageHash, message, params = {}) {
        // todo: implement huobipro signMessage
        return message;
    }

    handleOrderBookSubscription (client, message, subscription) {
        const symbol = this.safeString (subscription, 'symbol');
        const limit = this.safeString (subscription, 'limit');
        if (symbol in this.orderbooks) {
            delete this.orderbooks[symbol];
        }
        this.orderbooks[symbol] = this.orderBook ({}, limit);
        // watch the snapshot in a separate async call
        this.spawn (this.watchOrderBookSnapshot, client, message, subscription);
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
        const id = this.safeInteger (message, 'id');
        const subscriptionsById = this.indexBy (client.subscriptions, 'id');
        const subscription = this.safeValue (subscriptionsById, id);
        if (subscription !== undefined) {
            const method = this.safeValue (subscription, 'method');
            if (method !== undefined) {
                return method.call (this, client, message, subscription);
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
        //
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
        const ch = this.safeValue (message, 'ch');
        const parts = ch.split ('.');
        const type = this.safeString (parts, 0);
        if (type === 'market') {
            const methodName = this.safeString (parts, 2);
            const methods = {
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
    }

    handlePing (client, message) {
        //
        //     { ping: 1583491673714 }
        //
        client.send ({ 'pong': this.safeInteger (message, 'ping') });
    }

    handleErrorMessage (client, message) {
        return message;
    }

    handleMessage (client, message) {
        if (this.handleErrorMessage (client, message)) {
            //
            //     {"id":1583414227,"status":"ok","subbed":"market.btcusdt.mbp.150","ts":1583414229143}
            //
            if ('id' in message) {
                this.handleSubscriptionStatus (client, message);
            } else
            // route by channel aka topic aka subject
            if ('ch' in message) {
                this.handleSubject (client, message);
            } else if ('ping' in message) {
                this.handlePing (client, message);
            } else {
                const log = require ('ololog');
                log ('handleMessage', message);
                process.exit ();
            }
        }
    }
};
