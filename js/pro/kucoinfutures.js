'use strict';

//  ---------------------------------------------------------------------------

const { ExchangeError, InvalidNonce } = require ('ccxt/js/base/errors');
const kucoinFuturesRest = require ('../kucoinfutures');
const kucoin = require ('./kucoin');
const { ArrayCache } = require ('./base/Cache');

//  ---------------------------------------------------------------------------

class kucoinfutures extends kucoin {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchOrderBook': true,
                'watchMyTrades': true,
                'watchTicker': true,
                'watchTrades': true,
                'watchBalance': false, // on backend
            },
            'options': {
                'tradesLimit': 1000,
                'watchOrderBookRate': 100, // get updates every 100ms or 1000ms
                'fetchOrderBookSnapshot': {
                    'maxAttempts': 3, // default number of sync attempts
                    'delay': 1000, // warmup delay in ms before synchronizing
                },
                'watchTicker': {
                    'topic': 'contractMarket/tickerV2',
                },
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
                response = await this.futuresPrivatePostBulletPrivate ();
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
                response = await this.futuresPublicPostBulletPublic ();
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

    async subscribe (negotiation, topic, messageHash, method, symbol, params = {}) {
        await this.loadMarkets ();
        // const market = this.market (symbol);
        const data = this.safeValue (negotiation, 'data', {});
        const instanceServers = this.safeValue (data, 'instanceServers', []);
        const firstServer = this.safeValue (instanceServers, 0, {});
        const endpoint = this.safeString (firstServer, 'endpoint');
        const token = this.safeString (data, 'token');
        const nonce = this.requestId ();
        const query = {
            'token': token,
            'acceptUserMessage': 'true',
            // 'connectId': nonce, // user-defined id is supported, received by handleSystemStatus
        };
        const url = endpoint + '?' + this.urlencode (query);
        // const topic = '/market/snapshot'; // '/market/ticker';
        // const messageHash = topic + ':' + market['id'];
        const subscribe = {
            'id': nonce,
            'type': 'subscribe',
            'topic': topic,
            'response': true,
        };
        const subscription = {
            'id': nonce.toString (),
            'symbol': symbol,
            'topic': topic,
            'messageHash': messageHash,
            'method': method,
        };
        const request = this.extend (subscribe, params);
        const subscriptionHash = topic;
        return await this.watch (url, messageHash, request, subscriptionHash, subscription);
    }

    async watchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const negotiation = await this.negotiate ();
        const options = this.safeValue (this.options, 'watchTicker', {});
        const channel = this.safeString (options, 'topic', 'contractMarket/tickerV2');
        const topic = '/' + channel + ':' + market['id'];
        const messageHash = topic;
        return await this.subscribe (negotiation, topic, messageHash, undefined, symbol, params);
    }

    handleTicker (client, message) {
        const topic = this.safeString (message, 'topic');
        let market = undefined;
        if (topic !== undefined) {
            const parts = topic.split (':');
            const marketId = this.safeString (parts, 1);
            market = this.safeMarket (marketId, market, '-');
        }
        const data = this.safeValue (message, 'data', {});
        const rawTicker = this.safeValue (data, 'data', data);
        const ticker = this.parseTicker (rawTicker, market);
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
        const negotiation = await this.negotiate ();
        const market = this.market (symbol);
        const topic = '/contractMarket/execution:' + market['id'];
        const messageHash = topic;
        const trades = await this.subscribe (negotiation, topic, messageHash, undefined, symbol, params);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleTrade (client, message) {
        const data = this.safeValue (message, 'data', {});
        const trade = this.parseTrade (data);
        const messageHash = this.safeString (message, 'topic');
        const symbol = trade['symbol'];
        let trades = this.safeValue (this.trades, symbol);
        if (trades === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            trades = new ArrayCache (limit);
            this.trades[symbol] = trades;
        }
        trades.append (trade);
        client.resolve (trades, messageHash);
        return message;
    }

    async watchOrderBook (symbol, limit = undefined, params = {}) {
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
        if (limit !== undefined) {
            if ((limit !== 20) && (limit !== 100)) {
                throw new ExchangeError (this.id + " watchOrderBook 'limit' argument must be undefined, 20 or 100");
            }
        }
        await this.loadMarkets ();
        const negotiation = await this.negotiate ();
        const market = this.market (symbol);
        const topic = '/contractMarket/level2:' + market['id'];
        const messageHash = topic;
        const orderbook = await this.subscribe (negotiation, topic, messageHash, this.handleOrderBookSubscription, symbol, params);
        return orderbook.limit (limit);
    }

    async fetchOrderBookSnapshot (client, message, subscription) {
        const symbol = this.safeString (subscription, 'symbol');
        const limit = this.safeInteger (subscription, 'limit');
        const messageHash = this.safeString (subscription, 'messageHash');
        try {
            // 2. Initiate a REST request to get the snapshot data of Level 2 order book.
            // todo: this is a synch blocking call in ccxt.php - make it async
            const snapshot = await this.fetchOrderBook (symbol, limit);
            const orderbook = this.orderbooks[symbol];
            const messages = orderbook.cache;
            // make sure we have at least one delta before fetching the snapshot
            // otherwise we cannot synchronize the feed with the snapshot
            // and that will lead to a bidask cross as reported here
            // https://github.com/ccxt/ccxt/issues/6762
            const firstMessage = this.safeValue (messages, 0, {});
            const data = this.safeValue (firstMessage, 'data', {});
            const sequenceStart = this.safeInteger (data, 'sequence');
            const nonce = this.safeInteger (snapshot, 'nonce');
            const previousSequence = sequenceStart - 1;
            // if the received snapshot is earlier than the first cached delta
            // then we cannot align it with the cached deltas and we need to
            // retry synchronizing in maxAttempts
            if (nonce < previousSequence) {
                const options = this.safeValue (this.options, 'fetchOrderBookSnapshot', {});
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
                // 3. Playback the cached Level 2 data flow.
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
        console.log (message);
        const messageHash = this.safeString (message, 'topic');
        const data = this.safeValue (message, 'data');
        const market = this.market (messageHash.split (':')[1]);
        const orderbook = this.orderbooks[market['id']];

        // if (orderbook['nonce'] === undefined) {
        //     const subscription = this.safeValue (client.subscriptions, messageHash);
        //     const fetchingOrderBookSnapshot = this.safeValue (subscription, 'fetchingOrderBookSnapshot');
        //     if (fetchingOrderBookSnapshot === undefined) {
        //         subscription['fetchingOrderBookSnapshot'] = true;
        //         client.subscriptions[messageHash] = subscription;
        //         const options = this.safeValue (this.options, 'fetchOrderBookSnapshot', {});
        //         const delay = this.safeInteger (options, 'delay', this.rateLimit);
        //         // fetch the snapshot in a separate async call after a warmup delay
        //         this.delay (delay, this.fetchOrderBookSnapshot, client, message, subscription);
        //     }
        //     // 1. After receiving the websocket Level 2 data flow, cache the data.
        //     orderbook.cache.push (message);
        // } else {
        //     this.handleOrderBookMessage (client, message, orderbook);
        //     client.resolve (orderbook, messageHash);
        // }
    }

    handleOrderBookSubscription (client, message, subscription) {
        const symbol = this.safeString (subscription, 'symbol');
        const limit = this.safeString (subscription, 'limit');
        if (symbol in this.orderbooks) {
            delete this.orderbooks[symbol];
        }
        this.orderbooks[symbol] = this.orderBook ({}, limit);
        // moved snapshot initialization to handleOrderBook to fix
        // https://github.com/ccxt/ccxt/issues/6820
        // the general idea is to fetch the snapshot after the first delta
        // but not before, because otherwise we cannot synchronize the feed
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

    handleSubject (client, message) {
        const subject = this.safeString (message, 'subject');
        const methods = {
            'level2': this.handleOrderBook,
            'tickerV2': this.handleTicker,
            'match': this.handleTrade,
            'trade.candles.update': this.handleOHLCV,
        };
        let method = this.safeValue (methods, subject);
        if (subject === 'orderChange') {
            const data = this.safeValue (message, 'data');
            const type = this.safeString (data, 'type');
            if (type === 'match') {
                method = this.handleMyTrade;
            } else {
                method = this.handleOrder;
            }
        }
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
        const id = this.requestId ().toString ();
        return {
            'id': id,
            'type': 'ping',
        };
    }

    async watchHeartbeat () {
        await this.loadMarkets ();
        const negotiation = await this.negotiate ();
        const topic = 'ping';
        const messageHash = topic;
        const heartbeat = await this.subscribe (negotiation, topic, messageHash);
        return heartbeat;
    }

    handlePong (client, message) {
        // https://docs.kucoin.com/#ping
        client.lastPong = this.milliseconds ();
        client.resolve (message, 'ping');
        return message;
    }

    handleErrorMessage (client, message) {
        return message;
    }

    handleMessage (client, message) {
        // console.log(message);
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
}
const copyProps = (target, source) => {
    // this function copies all properties and symbols, filtering out some special ones
    Object.getOwnPropertyNames (source)
    // @ts-ignore
        .concat (Object.getOwnPropertySymbols (source))
        .forEach ((prop) => {
            if (
                !prop.match (
                    /^(?:constructor|prototype|arguments|caller|name|bind|call|apply|toString|length)$/
                )
            ) Object.defineProperty (target, prop, Object.getOwnPropertyDescriptor (source, prop));
        });
};
copyProps (kucoinfutures, kucoinFuturesRest);

module.exports = kucoinfutures;
