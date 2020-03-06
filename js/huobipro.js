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

    async handleOrderBookSnapshot (client, message, subscription) {
        console.log ('handleOrderBookSubscription', message, subscription);
        process.exit ();
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

    handleDelta (bookside, delta, nonce) {
        const price = this.safeFloat (delta, 0);
        if (price > 0) {
            const sequence = this.safeInteger (delta, 2);
            if (sequence > nonce) {
                const amount = this.safeFloat (delta, 1);
                bookside.store (price, amount);
            }
        }
    }

    handleDeltas (bookside, deltas, nonce) {
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta (bookside, deltas[i], nonce);
        }
    }

    handleOrderBookMessage (client, message, orderbook) {
        //
        //     {
        //         "type":"message",
        //         "topic":"/market/level2:BTC-USDT",
        //         "subject":"trade.l2update",
        //         "data":{
        //             "sequenceStart":1545896669105,
        //             "sequenceEnd":1545896669106,
        //             "symbol":"BTC-USDT",
        //             "changes": {
        //                 "asks": [["6","1","1545896669105"]], // price, size, sequence
        //                 "bids": [["4","1","1545896669106"]]
        //             }
        //         }
        //     }
        //
        const data = this.safeValue (message, 'data', {});
        const sequenceEnd = this.safeInteger (data, 'sequenceEnd');
        // 4. Apply the new Level 2 data flow to the local snapshot to ensure that
        // the sequence of the new Level 2 update lines up with the sequence of
        // the previous Level 2 data. Discard all the message prior to that
        // sequence, and then playback the change to snapshot.
        if (sequenceEnd > orderbook['nonce']) {
            const sequenceStart = this.safeInteger (message, 'sequenceStart');
            if ((sequenceStart !== undefined) && ((sequenceStart - 1) > orderbook['nonce'])) {
                // todo: client.reject from handleOrderBookMessage properly
                throw new ExchangeError (this.id + ' handleOrderBook received an out-of-order nonce');
            }
            const changes = this.safeValue (data, 'changes', {});
            let asks = this.safeValue (changes, 'asks', []);
            let bids = this.safeValue (changes, 'bids', []);
            asks = this.sortBy (asks, 2); // sort by sequence
            bids = this.sortBy (bids, 2);
            // 5. Update the level2 full data based on sequence according to the
            // size. If the price is 0, ignore the messages and update the sequence.
            // If the size=0, update the sequence and remove the price of which the
            // size is 0 out of level 2. For other cases, please update the price.
            this.handleDeltas (orderbook['asks'], asks, orderbook['nonce']);
            this.handleDeltas (orderbook['bids'], bids, orderbook['nonce']);
            orderbook['nonce'] = sequenceEnd;
            orderbook['timestamp'] = undefined;
            orderbook['datetime'] = undefined;
        }
        return orderbook;
    }

    handleOrderBook (client, message) {
        //
        // initial snapshot is fetched with ccxt's fetchOrderBook
        // the feed does not include a snapshot, just the deltas
        //
        //     {
        //         "type":"message",
        //         "topic":"/market/level2:BTC-USDT",
        //         "subject":"trade.l2update",
        //         "data":{
        //             "sequenceStart":1545896669105,
        //             "sequenceEnd":1545896669106,
        //             "symbol":"BTC-USDT",
        //             "changes": {
        //                 "asks": [["6","1","1545896669105"]], // price, size, sequence
        //                 "bids": [["4","1","1545896669106"]]
        //             }
        //         }
        //     }
        //
        const log = require ('ololog');
        log.red ('handleOrderBook', message);
        process.exit ();
        const messageHash = this.safeString (message, 'topic');
        const data = this.safeValue (message, 'data');
        const marketId = this.safeString (data, 'symbol');
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
            // 1. After receiving the websocket Level 2 data flow, cache the data.
            orderbook.cache.push (message);
        } else {
            this.handleOrderBookMessage (client, message, orderbook);
            client.resolve (orderbook, messageHash);
        }
    }

    signMessage (client, messageHash, message, params = {}) {
        // todo: implement kucoin signMessage
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
            // const subject = this.safeString (message, 'subject');
        } else {
            const log = require ('ololog');
            log.red ('handleSubject', type, message);
            process.exit ();
        }
    }

    // ping (client) {
    //     // kucoin does not support built-in ws protocol-level ping-pong
    //     // instead it requires a custom json-based text ping-pong
    //     // https://docs.kucoin.com/#ping
    //     const id = this.nonce ().toString ();
    //     return {
    //         'id': id,
    //         'type': 'ping',
    //     };
    // }

    // handlePong (client, message) {
    //     // https://docs.kucoin.com/#ping
    //     client.lastPong = this.milliseconds ();
    //     return message;
    // }

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
            }
            // route by channel aka topic aka subject
            if ('ch' in message) {
                this.handleSubject (client, message);
            }
        }
        //
        // console.log ('----', message);
        // process.exit ();
        // // // For Node v6+
        // // // Be less strict when decoding compressed responses, since sometimes
        // // // servers send slightly invalid responses that are still accepted
        // // // by common browsers.
        // // // Always using Z_SYNC_FLUSH is what cURL does.
        // // const zlibOptions = {
        // // 	flush: zlib.Z_SYNC_FLUSH,
        // // 	finishFlush: zlib.Z_SYNC_FLUSH
        // // };
        // // // for gzip
        // // if (codings == 'gzip' || codings == 'x-gzip') {
        // // 	body = body.pipe(zlib.createGunzip(zlibOptions));
        // // 	resolve(new Response(body, response_options));
        // // 	return;
        // // }
        // // // for deflate
        // // if (codings == 'deflate' || codings == 'x-deflate') {
        // // 	// handle the infamous raw deflate response from old servers
        // // 	// a hack for old IIS and Apache servers
        // // 	const raw = res.pipe(new PassThrough$1());
        // // 	raw.once('data', function (chunk) {
        // // 		// see http://stackoverflow.com/questions/37519828
        // // 		if ((chunk[0] & 0x0F) === 0x08) {
        // // 			body = body.pipe(zlib.createInflate());
        // // 		} else {
        // // 			body = body.pipe(zlib.createInflateRaw());
        // // 		}
        // // 		resolve(new Response(body, response_options));
        // // 	});
        // // 	return;
        // // }
        // // // otherwise, use response as-is
        // // resolve(new Response(body, response_options));
        //
        // // zlib.deflateRaw(buffer[, options], callback)#
        // // History
        // // buffer <Buffer> | <TypedArray> | <DataView> | <ArrayBuffer> | <string>
        // // options <zlib options>
        // // callback <Function></Function>
        //
        // // process.exit ();
        //
    }
};
