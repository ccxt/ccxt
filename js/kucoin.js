'use strict';

//  ---------------------------------------------------------------------------

const ccxt = require ('ccxt');
const { ExchangeError } = require ('ccxt/js/base/errors');

//  ---------------------------------------------------------------------------

module.exports = class kucoin extends ccxt.kucoin {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchOrderBook': true,
                'watchTickers': false, // for now
                'watchTicker': true, // for now
                'watchTrades': true, // for now
                'watchBalance': false, // for now
            },
            'options': {
                'tradesLimit': 1000,
                'watchOrderBookRate': 100, // get updates every 100ms or 1000ms
            },
            'streaming': {
                // kucoin does not support built-in ws protocol-level ping-pong
                // instead it requires a custom json-based text ping-pong
                // https://docs.kucoin.com/#ping
                'ping': this.ping,
            },
        });
    }

    async negotiate (params = {}) {
        const client = this.client ('ws');
        const messageHash = 'negotiate';
        let future = this.safeValue (client.subscriptions, messageHash);
        if (future === undefined) {
            future = client.future (messageHash);
            client.subscriptions[messageHash] = future;
            let response = undefined;
            const throwException = false;
            if (this.checkRequiredCredentials (throwException)) {
                response = await this.privatePostBulletPrivate ();
                //
                //     {
                //         code: "200000",
                //         data: {
                //             instanceServers: [
                //                 {
                //                     pingInterval:  50000,
                //                     endpoint: "wss://push-private.kucoin.com/endpoint",
                //                     protocol: "websocket",
                //                     encrypt: true,
                //                     pingTimeout: 10000
                //                 }
                //             ],
                //             token: "2neAiuYvAU61ZDXANAGAsiL4-iAExhsBXZxftpOeh_55i3Ysy2q2LEsEWU64mdzUOPusi34M_wGoSf7iNyEWJ1UQy47YbpY4zVdzilNP-Bj3iXzrjjGlWtiYB9J6i9GjsxUuhPw3BlrzazF6ghq4Lzf7scStOz3KkxjwpsOBCH4=.WNQmhZQeUKIkh97KYgU0Lg=="
                //         }
                //     }
                //
            } else {
                response = await this.publicPostBulletPublic ();
            }
            client.resolve (response, messageHash);
            // const data = this.safeValue (response, 'data', {});
            // const instanceServers = this.safeValue (data, 'instanceServers', []);
            // const firstServer = this.safeValue (instanceServers, 0, {});
            // const endpoint = this.safeString (firstServer, 'endpoint');
            // const token = this.safeString (data, 'token');
        }
        return await future;
    }

    async watchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const future = this.negotiate ();
        return await this.afterAsync (future, this.subscribeToTicker, symbol, params);
    }

    async subscribeToTicker (negotiation, symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const data = this.safeValue (negotiation, 'data', {});
        const instanceServers = this.safeValue (data, 'instanceServers', []);
        const firstServer = this.safeValue (instanceServers, 0, {});
        const endpoint = this.safeString (firstServer, 'endpoint');
        const token = this.safeString (data, 'token');
        const nonce = this.nonce ();
        const query = {
            'token': token,
            'acceptUserMessage': 'true',
            // 'connectId': nonce, // user-defined id is supported, received by handleSystemStatus
        };
        const url = endpoint + '?' + this.urlencode (query);
        const topic = '/market/snapshot'; // '/market/ticker';
        const messageHash = topic + ':' + market['id'];
        const subscribe = {
            'id': nonce,
            'type': 'subscribe',
            'topic': messageHash,
            'response': true,
        };
        const subscription = {
            'id': nonce.toString (),
            'symbol': symbol,
            'topic': topic,
            'messageHash': messageHash,
        };
        const request = this.extend (subscribe, params);
        return await this.watch (url, messageHash, request, messageHash, subscription);
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
        const future = this.negotiate ();
        return await this.afterAsync (future, this.subscribeToTrades, symbol, since, limit, params);
    }

    async subscribeToTrades (negotiation, symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const data = this.safeValue (negotiation, 'data', {});
        const instanceServers = this.safeValue (data, 'instanceServers', []);
        const firstServer = this.safeValue (instanceServers, 0, {});
        const endpoint = this.safeString (firstServer, 'endpoint');
        const token = this.safeString (data, 'token');
        const nonce = this.nonce ();
        const query = {
            'token': token,
            'acceptUserMessage': 'true',
            // 'connectId': nonce, // user-defined id is supported, received by handleSystemStatus
        };
        const url = endpoint + '?' + this.urlencode (query);
        const topic = '/market/match';
        const messageHash = topic + ':' + market['id'];
        const subscribe = {
            'id': nonce,
            'type': 'subscribe',
            'topic': messageHash,
            'response': true,
        };
        const subscription = {
            'id': nonce.toString (),
            'symbol': symbol,
            'topic': topic,
            'messageHash': messageHash,
        };
        const request = this.extend (subscribe, params);
        return await this.watch (url, messageHash, request, messageHash, subscription);
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
        if (limit !== undefined) {
            if ((limit !== 20) && (limit !== 100)) {
                throw new ExchangeError (this.id + " watchOrderBook 'limit' argument must be undefined, 20 or 100");
            }
        }
        await this.loadMarkets ();
        const future = this.negotiate ();
        return await this.afterAsync (future, this.subscribeToOrderBook, symbol, limit, params);
    }

    async subscribeToOrderBook (negotiation, symbol, limit = undefined, params = {}) {
        //
        // https://docs.kucoin.com/#level-2-market-data
        //
        // 1. After receiving the websocket Level 2 data flow, cache the data.
        // 2. Initiate a REST request to get the snapshot data of Level 2 order book.
        // 3. Playback the cached Level 2 data flow.
        // 4. Apply the new Level 2 data flow to the local snapshot to ensure that
        // the sequence of the new Level 2 update lines up with the sequence of
        // the previous Level 2 data. Discard all the message prior to that
        // sequence, and then playback the change to snapshot.
        // 5. Update the level2 full data based on sequence according to the
        // size. If the price is 0, ignore the messages and update the sequence.
        // If the size=0, update the sequence and remove the price of which the
        // size is 0 out of level 2. For other cases, please update the price.
        //
        await this.loadMarkets ();
        const market = this.market (symbol);
        const data = this.safeValue (negotiation, 'data', {});
        const instanceServers = this.safeValue (data, 'instanceServers', []);
        const firstServer = this.safeValue (instanceServers, 0, {});
        const endpoint = this.safeString (firstServer, 'endpoint');
        const token = this.safeString (data, 'token');
        const nonce = this.nonce ();
        const query = {
            'token': token,
            'acceptUserMessage': 'true',
            // 'connectId': nonce, // user-defined id is supported, received by handleSystemStatus
        };
        const url = endpoint + '?' + this.urlencode (query);
        const topic = '/market/level2';
        const messageHash = topic + ':' + market['id'];
        const subscribe = {
            'id': nonce,
            'type': 'subscribe',
            'topic': messageHash,
            'response': true,
        };
        const subscription = {
            'id': nonce.toString (),
            'symbol': symbol,
            'topic': topic,
            'messageHash': messageHash,
            'method': this.handleOrderBookSubscription,
        };
        const request = this.extend (subscribe, params);
        const future = this.watch (url, messageHash, request, messageHash, subscription);
        return await this.after (future, this.limitOrderBook, symbol, limit, params);
    }

    limitOrderBook (orderbook, symbol, limit = undefined, params = {}) {
        return orderbook.limit (limit);
    }

    async fetchOrderBookSnapshot (client, message, subscription) {
        const symbol = this.safeString (subscription, 'symbol');
        const limit = this.safeInteger (subscription, 'limit');
        const messageHash = this.safeString (subscription, 'messageHash');
        // 2. Initiate a REST request to get the snapshot data of Level 2 order book.
        // todo: this is a synch blocking call in ccxt.php - make it async
        const snapshot = await this.fetchOrderBook (symbol, limit);
        const orderbook = this.orderbooks[symbol];
        orderbook.reset (snapshot);
        // unroll the accumulated deltas
        const messages = orderbook.cache;
        // 3. Playback the cached Level 2 data flow.
        for (let i = 0; i < messages.length; i++) {
            const message = messages[i];
            this.handleOrderBookMessage (client, message, orderbook);
        }
        this.orderbooks[symbol] = orderbook;
        client.resolve (orderbook, messageHash);
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
        // fetch the snapshot in a separate async call
        this.spawn (this.fetchOrderBookSnapshot, client, message, subscription);
    }

    handleSubscriptionStatus (client, message) {
        //
        //     {
        //         id: '1578090438322',
        //         type: 'ack'
        //     }
        //
        const id = this.safeString (message, 'id');
        const subscriptionsById = this.indexBy (client.subscriptions, 'id');
        const subscription = this.safeValue (subscriptionsById, id, {});
        const method = this.safeValue (subscription, 'method');
        if (method !== undefined) {
            method.call (this, client, message, subscription);
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
        const subject = this.safeString (message, 'subject');
        const methods = {
            'trade.l2update': this.handleOrderBook,
            'trade.snapshot': this.handleTicker,
            'trade.l3match': this.handleTrade,
        };
        const method = this.safeValue (methods, subject);
        if (method === undefined) {
            return message;
        } else {
            return method.call (this, client, message);
        }
    }

    ping (client) {
        // kucoin does not support built-in ws protocol-level ping-pong
        // instead it requires a custom json-based text ping-pong
        // https://docs.kucoin.com/#ping
        const id = this.nonce ().toString ();
        return {
            'id': id,
            'type': 'ping',
        };
    }

    handlePong (client, message) {
        // https://docs.kucoin.com/#ping
        client.lastPong = this.milliseconds ();
        return message;
    }

    handleErrorMessage (client, message) {
        return message;
    }

    handleMessage (client, message) {
        if (this.handleErrorMessage (client, message)) {
            const type = this.safeString (message, 'type');
            const methods = {
                // 'heartbeat': this.handleHeartbeat,
                'welcome': this.handleSystemStatus,
                'ack': this.handleSubscriptionStatus,
                'message': this.handleSubject,
                'pong': this.handlePong,
            };
            const method = this.safeValue (methods, type);
            if (method === undefined) {
                return message;
            } else {
                return method.call (this, client, message);
            }
        }
    }
};
