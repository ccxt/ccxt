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
                'watchTicker': false, // for now
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

    // To receive data you have to send a "sub" message first.
    //
    // {
    //     "sub": "market.btcusdt.kline.1min",
    //     "id": "id1"
    // }
    //
    // { "sub": "topic to sub", "id": "id generate by client" }
    //
    // After successfully subscribed, you will receive a response to confirm subscription
    //
    // {
    //     "id": "id1",
    //     "status": "ok",
    //     "subbed": "market.btcusdt.kline.1min",
    //     "ts": 1489474081631
    // }
    //
    // Then, you will received message when there is update in this topic
    //
    // {
    //     "ch": "market.btcusdt.kline.1min",
    //     "ts": 1489474082831,
    //     "tick": {
    //         "id": 1489464480,
    //         "amount": 0.0,
    //         "count": 0,
    //         "open": 7962.62,
    //         "close": 7962.62,
    //         "low": 7962.62,
    //         "high": 7962.62,
    //         "vol": 0.0
    //     }
    // }
    //
    // Unsubscribe
    //
    // To unsubscribe, you need to send below message
    //
    // {
    //     "unsub": "market.btcusdt.trade.detail",
    //     "id": "id4"
    // }
    //
    // { "unsub": "topic to unsub", "id": "id generate by client" }
    //
    // And you will receive a message to confirm the unsubscribe
    // {
    //     "id": "id4",
    //     "status": "ok",
    //     "unsubbed": "market.btcusdt.trade.detail",
    //     "ts": 1494326028889
    // }
    //
    // Pull Data
    //
    // While connected to websocket, you can also use it in pull style by sending
    // message to the server. To request pull style data, you send below message
    //
    // {
    //     "req": "market.ethbtc.kline.1min",
    //     "id": "id10"
    // }
    //
    // { "req": "topic to req", "id": "id generate by client" }
    //
    // You will receive a response accordingly and immediately
    //
    // async subscribe (negotiation, topic, method, symbol, params = {}) {
    //     await this.loadMarkets ();
    //     const market = this.market (symbol);
    //     const data = this.safeValue (negotiation, 'data', {});
    //     const instanceServers = this.safeValue (data, 'instanceServers', []);
    //     const firstServer = this.safeValue (instanceServers, 0, {});
    //     const endpoint = this.safeString (firstServer, 'endpoint');
    //     const token = this.safeString (data, 'token');
    //     const nonce = this.nonce ();
    //     const query = {
    //         'token': token,
    //         'acceptUserMessage': 'true',
    //         // 'connectId': nonce, // user-defined id is supported, received by handleSystemStatus
    //     };
    //     const url = endpoint + '?' + this.urlencode (query);
    //     // const topic = '/market/snapshot'; // '/market/ticker';
    //     const messageHash = topic + ':' + market['id'];
    //     const subscribe = {
    //         'id': nonce,
    //         'type': 'subscribe',
    //         'topic': messageHash,
    //         'response': true,
    //     };
    //     const subscription = {
    //         'id': nonce.toString (),
    //         'symbol': symbol,
    //         'topic': topic,
    //         'messageHash': messageHash,
    //         'method': method,
    //     };
    //     const request = this.extend (subscribe, params);
    //     return await this.watch (url, messageHash, request, messageHash, subscription);
    // }

    async watchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const negotiate = this.negotiate ();
        const topic = '/market/snapshot';
        return await this.afterAsync (negotiate, this.subscribe, topic, undefined, symbol, params);
    }

    handleTicker (client, message) {
        //
        // updates come in every 2 sec unless there
        // were no changes since the previous update
        //
        //     {
        //         "data": {
        //             "sequence": "1545896669291",
        //             "data": {
        //                 "trading": true,
        //                 "symbol": "KCS-BTC",
        //                 "buy": 0.00011,
        //                 "sell": 0.00012,
        //                 "sort": 100,
        //                 "volValue": 3.13851792584, // total
        //                 "baseCurrency": "KCS",
        //                 "market": "BTC",
        //                 "quoteCurrency": "BTC",
        //                 "symbolCode": "KCS-BTC",
        //                 "datetime": 1548388122031,
        //                 "high": 0.00013,
        //                 "vol": 27514.34842,
        //                 "low": 0.0001,
        //                 "changePrice": -1.0e-5,
        //                 "changeRate": -0.0769,
        //                 "lastTradedPrice": 0.00012,
        //                 "board": 0,
        //                 "mark": 0
        //             }
        //         },
        //         "subject": "trade.snapshot",
        //         "topic": "/market/snapshot:KCS-BTC",
        //         "type": "message"
        //     }
        //
        const data = this.safeValue (message, 'data', {});
        const rawTicker = this.safeValue (data, 'data', {});
        const ticker = this.parseTicker (rawTicker);
        const symbol = ticker['symbol'];
        this.tickers[symbol] = ticker;
        const messageHash = this.safeString (message, 'topic');
        if (messageHash !== undefined) {
            client.resolve (ticker, messageHash);
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
