'use strict';

//  ---------------------------------------------------------------------------

const kucoinfuturesRest = require ('../kucoinfutures.js');
const { ExchangeError, InvalidNonce, NetworkError } = require ('../base/errors');
const { ArrayCache, ArrayCacheBySymbolById } = require ('./base/Cache');

//  ---------------------------------------------------------------------------

module.exports = class kucoinfutures extends kucoinfuturesRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchTicker': true,
                'watchTrades': true,
                'watchOrderBook': true,
                'watchOrders': true,
                'watchBalance': true,
            },
            'options': {
                'accountsByType': {
                    'swap': 'future',
                    'cross': 'margin',
                    // 'spot': ,
                    // 'margin': ,
                    // 'main': ,
                    // 'funding': ,
                    // 'future': ,
                    // 'mining': ,
                    // 'trade': ,
                    // 'contract': ,
                    // 'pool': ,
                },
                'tradesLimit': 1000,
                'watchOrderBookRate': 100, // get updates every 100ms or 1000ms
                'fetchOrderBookSnapshot': {
                    'maxAttempts': 3, // default number of sync attempts
                    'delay': 1000, // warmup delay in ms before synchronizing
                },
                'watchTicker': {
                    'topic': 'contractMarket/tickerV2', // market/ticker
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

    requestId () {
        // TODO
        const requestId = this.sum (this.safeInteger (this.options, 'requestId', 0), 1);
        this.options['requestId'] = requestId;
        return requestId;
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
        /**
         * @method
         * @name kucoinfutures#watchTicker
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://docs.kucoin.com/futures/#get-real-time-symbol-ticker-v2
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the kucoinfutures api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const negotiation = await this.negotiate ();
        const options = this.safeValue (this.options, 'watchTicker', {});
        const channel = this.safeString (options, 'topic', 'contractMarket/tickerV2');
        const topic = '/' + channel + ':' + market['id'];
        const messageHash = topic;
        return await this.subscribe (negotiation, topic, messageHash, undefined, symbol, params);
    }

    handleTicker (client, message) {
        //
        // market/tickerV2
        //
        //    {
        //        type: 'message',
        //        topic: '/contractMarket/tickerV2:ADAUSDTM',
        //        subject: 'tickerV2',
        //        data: {
        //            symbol: 'ADAUSDTM',
        //            sequence: 1668007800439,
        //            bestBidSize: 178,
        //            bestBidPrice: '0.35959',
        //            bestAskPrice: '0.35981',
        //            ts: '1668141430037124460',
        //            bestAskSize: 134
        //        }
        //    }
        //
        const data = this.safeValue (message, 'data', {});
        const marketId = this.safeValue (data, 'symbol');
        const market = this.safeMarket (marketId, undefined, '-');
        const ticker = this.parseTicker (data, market);
        this.tickers[market['symbol']] = ticker;
        const messageHash = this.safeString (message, 'topic');
        if (messageHash !== undefined) {
            client.resolve (ticker, messageHash);
        }
        return message;
    }

    async watchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name kucoinfutures#watchTrades
         * @description get the list of most recent trades for a particular symbol
         * @see https://docs.kucoin.com/futures/#execution-data
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the kucoinfutures api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const negotiation = await this.negotiate ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const topic = '/contractMarket/execution:' + market['id'];
        const messageHash = topic;
        const trades = await this.subscribe (negotiation, topic, messageHash, undefined, symbol, params);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleTrade (client, message) {
        //
        //    {
        //        type: 'message',
        //        topic: '/contractMarket/execution:ADAUSDTM',
        //        subject: 'match',
        //        data: {
        //            makerUserId: '62286a4d720edf0001e81961',
        //            symbol: 'ADAUSDTM',
        //            sequence: 41320766,
        //            side: 'sell',
        //            size: 2,
        //            price: 0.35904,
        //            takerOrderId: '636dd9da9857ba00010cfa44',
        //            makerOrderId: '636dd9c8df149d0001e62bc8',
        //            takerUserId: '6180be22b6ab210001fa3371',
        //            tradeId: '636dd9da0000d400d477eca7',
        //            ts: 1668143578987357700
        //        }
        //    }
        //
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
        /**
         * @method
         * @name kucoinfutures#watchOrderBook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         *   1. After receiving the websocket Level 2 data flow, cache the data.
         *   2. Initiate a REST request to get the snapshot data of Level 2 order book.
         *   3. Playback the cached Level 2 data flow.
         *   4. Apply the new Level 2 data flow to the local snapshot to ensure that the sequence of the new Level 2 update lines up with the sequence of the previous Level 2 data. Discard all the message prior to that sequence, and then playback the change to snapshot.
         *   5. Update the level2 full data based on sequence according to the size. If the price is 0, ignore the messages and update the sequence. If the size=0, update the sequence and remove the price of which the size is 0 out of level 2. For other cases, please update the price.
         *   6. If the sequence of the newly pushed message does not line up to the sequence of the last message, you could pull through REST Level 2 message request to get the updated messages. Please note that the difference between the start and end parameters cannot exceed 500.
         * @see https://docs.kucoin.com/futures/#level-2-market-data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the kucoinfutures api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        if (limit !== undefined) {
            if ((limit !== 20) && (limit !== 100)) {
                throw new ExchangeError (this.id + " watchOrderBook 'limit' argument must be undefined, 20 or 100");
            }
        }
        await this.loadMarkets ();
        const negotiation = await this.negotiate ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const topic = '/contractMarket/level2:' + market['id'];
        const messageHash = topic;
        const orderbook = await this.subscribe (negotiation, topic, messageHash, this.handleOrderBookSubscription, symbol, params);
        return orderbook.limit ();
    }

    retryFetchOrderBookSnapshot (client, message, subscription) {
        // TODO
        const symbol = this.safeString (subscription, 'symbol');
        const messageHash = this.safeString (subscription, 'messageHash');
        // console.log ('fetchOrderBookSnapshot', nonce, previousSequence, nonce >= previousSequence);
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
            if (messageHash in client.subscriptions) {
                subscription['fetchingOrderBookSnapshot'] = false;
                subscription['numAttempts'] = 0;
                client.subscriptions[messageHash] = subscription;
            }
            const e = new InvalidNonce (this.id + ' failed to synchronize WebSocket feed with the snapshot for symbol ' + symbol + ' in ' + maxAttempts.toString () + ' attempts');
            client.reject (e, messageHash);
        }
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
            const sequenceStart = this.safeInteger (data, 'sequenceStart');
            const nonce = this.safeInteger (snapshot, 'nonce');
            const previousSequence = sequenceStart - 1;
            // if the received snapshot is earlier than the first cached delta
            // then we cannot align it with the cached deltas and we need to
            // retry synchronizing in maxAttempts
            if (nonce < previousSequence) {
                this.retryFetchOrderBookSnapshot (client, message, subscription);
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
            if (e instanceof NetworkError) {
                this.retryFetchOrderBookSnapshot (client, message, subscription);
            } else {
                client.reject (e, messageHash);
            }
        }
    }

    handleDelta (bookside, delta, nonce) {
        // TODO
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
        // TODO
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta (bookside, deltas[i], nonce);
        }
    }

    handleOrderBookMessage (client, message, orderbook) {
        //
        //    {
        //        type: 'message',
        //        topic: '/contractMarket/level2:ADAUSDTM',
        //        subject: 'level2',
        //        data: {
        //            sequence: 1668059586457,
        //            change: '0.34172,sell,456', // price, side, quantity
        //            timestamp: 1668573023223
        //        }
        //    }
        //
        const data = this.safeValue (message, 'data', {});
        const sequence = this.safeInteger (data, 'sequence');
        // 4. Apply the new Level 2 data flow to the local snapshot to ensure that
        // the sequence of the new Level 2 update lines up with the sequence of
        // the previous Level 2 data. Discard all the message prior to that
        // sequence, and then playback the change to snapshot.
        if (sequence > orderbook['nonce']) {
            const change = this.safeValue (data, 'change', {});
            const splitChange = this.split (change, ',');
            const price = this.safeNumber (splitChange, 0);
            const side = this.safeNumber (splitChange, 1);
            const quantity = this.safeNumber (splitChange, 2);
            const type = (side === 'buy') ? 'bids' : 'asks';
            this.handleDeltas (orderbook[type], [ [ price, quantity, sequence ] ], orderbook['nonce']);
            // 5. Update the level2 full data based on sequence according to the
            // size. If the price is 0, ignore the messages and update the sequence.
            // If the size=0, update the sequence and remove the price of which the
            // size is 0 out of level 2. For other cases, please update the price.
            const timestamp = this.safeInteger (data, 'timestamp');
            orderbook['nonce'] = sequence;
            orderbook['timestamp'] = timestamp;
            orderbook['datetime'] = this.iso8601 (timestamp);
        }
        return orderbook;
    }

    handleOrderBook (client, message) {
        //
        // initial snapshot is fetched with ccxt's fetchOrderBook
        // the feed does not include a snapshot, just the deltas
        //
        //    {
        //        type: 'message',
        //        topic: '/contractMarket/level2:ADAUSDTM',
        //        subject: 'level2',
        //        data: {
        //            sequence: 1668059586457,
        //            change: '0.34172,sell,456', // type, side, quantity
        //            timestamp: 1668573023223
        //        }
        //    }
        //
        const messageHash = this.safeString (message, 'topic');
        const marketId = this.safeString (this.split (messageHash, ':'), 1);
        const symbol = this.safeSymbol (marketId, undefined, '-');
        const orderbook = this.orderbooks[symbol];
        if (orderbook['nonce'] === undefined) {
            const subscription = this.safeValue (client.subscriptions, messageHash);
            const fetchingOrderBookSnapshot = this.safeValue (subscription, 'fetchingOrderBookSnapshot');
            if (fetchingOrderBookSnapshot === undefined) {
                subscription['fetchingOrderBookSnapshot'] = true;
                client.subscriptions[messageHash] = subscription;
                const options = this.safeValue (this.options, 'fetchOrderBookSnapshot', {});
                const delay = this.safeInteger (options, 'delay', this.rateLimit);
                // fetch the snapshot in a separate async call after a warmup delay
                this.delay (delay, this.fetchOrderBookSnapshot, client, message, subscription);
            }
            // 1. After receiving the websocket Level 2 data flow, cache the data.
            orderbook.cache.push (message);
        } else {
            this.handleOrderBookMessage (client, message, orderbook);
            client.resolve (orderbook, messageHash);
        }
    }

    handleOrderBookSubscription (client, message, subscription) {
        // TODO
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
        // TODO
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
        // TODO
        return message;
    }

    async watchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name kucoinfutures#watchOrders
         * @description watches information on multiple orders made by the user
         * @see https://docs.kucoin.com/futures/#trade-orders-according-to-the-market
         * @param {string|undefined} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the kucoinfutures api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const negotiation = await this.negotiate ();
        const topic = '/contractMarket/tradeOrders';
        const request = {
            'privateChannel': true,
        };
        let messageHash = topic;
        if (symbol !== undefined) {
            const market = this.market (symbol);
            symbol = market['symbol'];
            messageHash = messageHash + ':' + market['symbol'];
        }
        const orders = await this.subscribe (negotiation, topic, messageHash, undefined, undefined, this.extend (request, params));
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit, true);
    }

    parseWsOrderStatus (status) {
        const statuses = {
            'open': 'open',
            'filled': 'closed',
            'match': 'open',
            'update': 'open',
            'canceled': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseWsOrder (order, market = undefined) {
        //
        //     {
        //         'symbol': 'XCAD-USDT',
        //         'orderType': 'limit',
        //         'side': 'buy',
        //         'orderId': '6249167327218b000135e749',
        //         'type': 'canceled',
        //         'orderTime': 1648957043065280224,
        //         'size': '100.452',
        //         'filledSize': '0',
        //         'price': '2.9635',
        //         'clientOid': 'buy-XCAD-USDT-1648957043010159',
        //         'remainSize': '0',
        //         'status': 'done',
        //         'ts': 1648957054031001037
        //     }
        //
        // TODO
        const id = this.safeString (order, 'orderId');
        const clientOrderId = this.safeString (order, 'clientOid');
        const orderType = this.safeStringLower (order, 'orderType');
        const price = this.safeString (order, 'price');
        const filled = this.safeString (order, 'filledSize');
        const amount = this.safeString (order, 'size');
        const rawType = this.safeString (order, 'type');
        const status = this.parseWsOrderStatus (rawType);
        const timestamp = this.safeIntegerProduct (order, 'orderTime', 0.000001);
        const marketId = this.safeString (order, 'symbol');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const side = this.safeStringLower (order, 'side');
        return this.safeOrder ({
            'info': order,
            'symbol': symbol,
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'type': orderType,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'amount': amount,
            'cost': undefined,
            'average': undefined,
            'filled': filled,
            'remaining': undefined,
            'status': status,
            'fee': undefined,
            'trades': undefined,
        }, market);
    }

    handleOrder (client, message) {
        const messageHash = '/contractMarket/tradeOrders';
        const data = this.safeValue (message, 'data');
        const parsed = this.parseWsOrder (data);
        const symbol = this.safeString (parsed, 'symbol');
        const orderId = this.safeString (parsed, 'id');
        if (symbol !== undefined) {
            if (this.orders === undefined) {
                const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
                this.orders = new ArrayCacheBySymbolById (limit);
            }
            const cachedOrders = this.orders;
            const orders = this.safeValue (cachedOrders.hashmap, symbol, {});
            const order = this.safeValue (orders, orderId);
            if (order !== undefined) {
                // todo add others to calculate average etc
                const stopPrice = this.safeValue (order, 'stopPrice');
                if (stopPrice !== undefined) {
                    parsed['stopPrice'] = stopPrice;
                }
                if (order['status'] === 'closed') {
                    parsed['status'] = 'closed';
                }
            }
            cachedOrders.append (parsed);
            client.resolve (this.orders, messageHash);
            const symbolSpecificMessageHash = messageHash + ':' + symbol;
            client.resolve (this.orders, symbolSpecificMessageHash);
        }
    }

    async watchBalance (params = {}) {
        /**
         * @method
         * @name kucoinfutures#watchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @see https://docs.kucoin.com/futures/#account-balance-events
         * @param {object} params extra parameters specific to the kucoinfutures api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        const negotiation = await this.negotiate ();
        const topic = '/contractAccount/wallet';
        const request = {
            'privateChannel': true,
        };
        const messageHash = topic;
        return await this.subscribe (negotiation, topic, messageHash, this.handleBalanceSubscription, undefined, this.extend (request, params));
    }

    handleBalance (client, message) {
        //
        //    {
        //        id: '6375553193027a0001f6566f',
        //        type: 'message',
        //        topic: '/contractAccount/wallet',
        //        userId: '613a896885d8660006151f01',
        //        channelType: 'private',
        //        subject: 'availableBalance.change',
        //        data: {
        //            currency: 'USDT',
        //            holdBalance: '0.0000000000',
        //            availableBalance: '14.0350281903',
        //            timestamp: '1668633905657'
        //        }
        //    }
        //
        const data = this.safeValue (message, 'data', {});
        const messageHash = this.safeString (message, 'topic');
        const currencyId = this.safeString (data, 'currency');
        const code = this.safeCurrencyCode (currencyId);
        const account = this.account ();
        account['free'] = this.safeString (data, 'availableBalance');
        account['used'] = this.safeString (data, 'holdBalance');
        this.balance[code] = account;
        this.balance = this.safeBalance (this.balance);
        client.resolve (this.balance, messageHash);
    }

    handleBalanceSubscription (client, message, subscription) {
        this.spawn (this.fetchBalanceSnapshot, client, message);
    }

    async fetchBalanceSnapshot (client, message) {
        await this.loadMarkets ();
        this.checkRequiredCredentials ();
        const messageHash = '/contractAccount/wallet';
        const selectedType = this.safeString2 (this.options, 'watchBalance', 'defaultType', 'swap'); // spot, margin, main, funding, future, mining, trade, contract, pool
        const params = {
            'type': selectedType,
        };
        const snapshot = await this.fetchBalance (params);
        //
        //    {
        //        info: {
        //            code: '200000',
        //            data: {
        //                accountEquity: 0.0350281903,
        //                unrealisedPNL: 0,
        //                marginBalance: 0.0350281903,
        //                positionMargin: 0,
        //                orderMargin: 0,
        //                frozenFunds: 0,
        //                availableBalance: 0.0350281903,
        //                currency: 'USDT'
        //            }
        //        },
        //        timestamp: undefined,
        //        datetime: undefined,
        //        USDT: {
        //            free: 0.0350281903,
        //            used: 0,
        //            total: 0.0350281903
        //        },
        //        free: {
        //            USDT: 0.0350281903
        //        },
        //        used: {
        //            USDT: 0
        //        },
        //        total: {
        //            USDT: 0.0350281903
        //        }
        //    }
        //
        const keys = Object.keys (snapshot);
        for (let i = 0; i < keys.length; i++) {
            const code = keys[i];
            if (code !== 'free' && code !== 'used' && code !== 'total' && code !== 'timestamp' && code !== 'datetime' && code !== 'info') {
                this.balance[code] = snapshot[code];
            }
        }
        client.resolve (this.balance, messageHash);
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
            'tickerV2': this.handleTicker,
            'availableBalance.change': this.handleBalance,
            'match': this.handleTrade,
            'orderChange': this.handleOrder,
            'orderUpdated': this.handleOrder,
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
        // TODO
        const id = this.requestId ().toString ();
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
