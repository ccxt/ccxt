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
                'watchTrades': false, // for now
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
        }
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
        const negotiate = this.negotiate ();
        const topic = '/market/match';
        const future = this.afterAsync (negotiate, this.subscribe, topic, undefined, symbol, since, params);
        return await this.after (future, this.filterBySinceLimit, since, limit);
    }

    handleTrade (client, message) {
        //
        //     {
        //         data: {
        //             sequence: '1568787654360',
        //             symbol: 'BTC-USDT',
        //             side: 'buy',
        //             size: '0.00536577',
        //             price: '9345',
        //             takerOrderId: '5e356c4a9f1a790008f8d921',
        //             time: '1580559434436443257',
        //             type: 'match',
        //             makerOrderId: '5e356bffedf0010008fa5d7f',
        //             tradeId: '5e356c4aeefabd62c62a1ece'
        //         },
        //         subject: 'trade.l3match',
        //         topic: '/market/match:BTC-USDT',
        //         type: 'message'
        //     }
        //
        const data = this.safeValue (message, 'data', {});
        const trade = this.parseTrade (data);
        const messageHash = this.safeString (message, 'topic');
        const symbol = trade['symbol'];
        const array = this.safeValue (this.trades, symbol, []);
        array.push (trade);
        const length = array.length;
        if (length > this.options['tradesLimit']) {
            array.shift ();
        }
        this.trades[symbol] = array;
        client.resolve (array, messageHash);
        return message;
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
        // new code cp from bittrex
        const options = this.safeValue (this.options, 'ws', {});
        const api = this.safeValue (options, 'api');
        const url = this.urls['api']['ws'][api]['public'];
        // const method = 'QueryBalanceState';
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
        if (seqNum > orderbook['nonce']) {
            if (prevSeqNum !== orderbook['nonce']) {
                // todo: client.reject from handleOrderBookMessage properly
                throw new ExchangeError (this.id + ' handleOrderBookMessage received an out-of-order nonce ' + prevSeqNum.toString () + ' !== ' + orderbook['nonce'].toString ());
            }
            const asks = this.safeValue (tick, 'asks', []);
            const bids = this.safeValue (tick, 'bids', []);
            this.handleDeltas (orderbook['asks'], asks, orderbook['nonce']);
            this.handleDeltas (orderbook['bids'], bids, orderbook['nonce']);
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
            // const marketId = this.safeString (parts, 1);
            const subject = this.safeString (parts, 2);
            const level = this.safeString (parts, 3);
            let methodName = subject;
            if (level !== undefined) {
                methodName += '.' + level;
            }
            const methods = {
                'mbp.150': this.handleOrderBook,
                'detail': this.handleTicker,
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
