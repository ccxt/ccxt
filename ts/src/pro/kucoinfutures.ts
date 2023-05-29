//  ---------------------------------------------------------------------------

import kucoinfuturesRest from '../kucoinfutures.js';
import { ExchangeError } from '../base/errors.js';
import { ArrayCache, ArrayCacheBySymbolById } from '../base/ws/Cache.js';
import { Int } from '../base/types.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

export default class kucoinfutures extends kucoinfuturesRest {
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
                'watchOrderBook': {
                    'snapshotDelay': 20,
                    'maxRetries': 3,
                },
                'watchTicker': {
                    'name': 'contractMarket/tickerV2', // market/ticker
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

    negotiate (privateChannel, params = {}) {
        const connectId = privateChannel ? 'private' : 'public';
        const urls = this.safeValue (this.options, 'urls', {});
        if (connectId in urls) {
            return urls[connectId];
        }
        // we store an awaitable to the url
        // so that multiple calls don't asynchronously
        // fetch different urls and overwrite each other
        urls[connectId] = this.spawn (this.negotiateHelper, privateChannel, params);
        this.options['urls'] = urls;
        return urls[connectId];
    }

    async negotiateHelper (privateChannel, params = {}) {
        let response = undefined;
        const connectId = privateChannel ? 'private' : 'public';
        if (privateChannel) {
            response = await this.futuresPrivatePostBulletPrivate (params);
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
            response = await this.futuresPublicPostBulletPublic (params);
        }
        const data = this.safeValue (response, 'data', {});
        const instanceServers = this.safeValue (data, 'instanceServers', []);
        const firstInstanceServer = this.safeValue (instanceServers, 0);
        const pingInterval = this.safeInteger (firstInstanceServer, 'pingInterval');
        const endpoint = this.safeString (firstInstanceServer, 'endpoint');
        const token = this.safeString (data, 'token');
        const result = endpoint + '?' + this.urlencode ({
            'token': token,
            'privateChannel': privateChannel,
            'connectId': connectId,
        });
        const client = this.client (result);
        client.keepAlive = pingInterval;
        return result;
    }

    requestId () {
        const requestId = this.sum (this.safeInteger (this.options, 'requestId', 0), 1);
        this.options['requestId'] = requestId;
        return requestId;
    }

    async subscribe (url, messageHash, subscriptionHash, subscription, params = {}) {
        const requestId = this.requestId ().toString ();
        const request = {
            'id': requestId,
            'type': 'subscribe',
            'topic': subscriptionHash,
            'response': true,
        };
        const message = this.extend (request, params);
        const subscriptionRequest = {
            'id': requestId,
        };
        if (subscription === undefined) {
            subscription = subscriptionRequest;
        } else {
            subscription = this.extend (subscriptionRequest, subscription);
        }
        return await this.watch (url, messageHash, message, subscriptionHash, subscription);
    }

    async watchTicker (symbol: string, params = {}) {
        /**
         * @method
         * @name kucoinfutures#watchTicker
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://docs.kucoin.com/futures/#get-real-time-symbol-ticker-v2
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the kucoinfutures api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const url = await this.negotiate (false);
        const options = this.safeValue (this.options, 'watchTicker', {});
        const channel = this.safeString (options, 'name', 'contractMarket/tickerV2');
        const topic = '/' + channel + ':' + market['id'];
        const messageHash = 'ticker:' + symbol;
        return await this.subscribe (url, messageHash, topic, undefined, params);
    }

    handleTicker (client: Client, message) {
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
        const messageHash = 'ticker:' + market['symbol'];
        client.resolve (ticker, messageHash);
        return message;
    }

    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}) {
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
        const url = await this.negotiate (false);
        const market = this.market (symbol);
        symbol = market['symbol'];
        const topic = '/contractMarket/execution:' + market['id'];
        const messageHash = 'trades:' + symbol;
        const trades = await this.subscribe (url, messageHash, topic, undefined, params);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleTrade (client: Client, message) {
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
        const symbol = trade['symbol'];
        let trades = this.safeValue (this.trades, symbol);
        if (trades === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            trades = new ArrayCache (limit);
            this.trades[symbol] = trades;
        }
        trades.append (trade);
        const messageHash = 'trades:' + symbol;
        client.resolve (trades, messageHash);
        return message;
    }

    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}) {
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
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        if (limit !== undefined) {
            if ((limit !== 20) && (limit !== 100)) {
                throw new ExchangeError (this.id + " watchOrderBook 'limit' argument must be undefined, 20 or 100");
            }
        }
        await this.loadMarkets ();
        const url = await this.negotiate (false);
        const market = this.market (symbol);
        symbol = market['symbol'];
        const topic = '/contractMarket/level2:' + market['id'];
        const messageHash = 'orderbook:' + symbol;
        const subscription = {
            'method': this.handleOrderBookSubscription,
            'symbol': symbol,
            'limit': limit,
        };
        const orderbook = await this.subscribe (url, messageHash, topic, subscription, params);
        return orderbook.limit ();
    }

    handleDelta (orderbook, delta) {
        orderbook['nonce'] = this.safeInteger (delta, 'sequence');
        const timestamp = this.safeInteger (delta, 'timestamp');
        orderbook['timestamp'] = timestamp;
        orderbook['datetime'] = this.iso8601 (timestamp);
        const change = this.safeValue (delta, 'change', {});
        const splitChange = change.split (',');
        const price = this.safeNumber (splitChange, 0);
        const side = this.safeString (splitChange, 1);
        const quantity = this.safeNumber (splitChange, 2);
        const type = (side === 'buy') ? 'bids' : 'asks';
        const value = [ price, quantity ];
        if (type === 'bids') {
            const storedBids = orderbook['bids'];
            storedBids.storeArray (value);
        } else {
            const storedAsks = orderbook['asks'];
            storedAsks.storeArray (value);
        }
    }

    handleDeltas (bookside, deltas) {
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta (bookside, deltas[i]);
        }
    }

    handleOrderBook (client: Client, message) {
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
        const data = this.safeValue (message, 'data');
        const topic = this.safeString (message, 'topic');
        const topicParts = topic.split (':');
        const marketId = this.safeString (topicParts, 1);
        const symbol = this.safeSymbol (marketId, undefined, '-');
        const messageHash = 'orderbook:' + symbol;
        const storedOrderBook = this.orderbooks[symbol];
        const nonce = this.safeInteger (storedOrderBook, 'nonce');
        const deltaEnd = this.safeInteger (data, 'sequence');
        if (nonce === undefined) {
            const cacheLength = storedOrderBook.cache.length;
            const topic = this.safeString (message, 'topic');
            const subscription = client.subscriptions[topic];
            const limit = this.safeInteger (subscription, 'limit');
            const snapshotDelay = this.handleOption ('watchOrderBook', 'snapshotDelay', 5);
            if (cacheLength === snapshotDelay) {
                this.spawn (this.loadOrderBook, client, messageHash, symbol, limit);
            }
            storedOrderBook.cache.push (data);
            return;
        } else if (nonce >= deltaEnd) {
            return;
        }
        this.handleDelta (storedOrderBook, data);
        client.resolve (storedOrderBook, messageHash);
    }

    getCacheIndex (orderbook, cache) {
        const firstDelta = this.safeValue (cache, 0);
        const nonce = this.safeInteger (orderbook, 'nonce');
        const firstDeltaStart = this.safeInteger (firstDelta, 'sequence');
        if (nonce < firstDeltaStart - 1) {
            return -1;
        }
        for (let i = 0; i < cache.length; i++) {
            const delta = cache[i];
            const deltaStart = this.safeInteger (delta, 'sequence');
            if (nonce < deltaStart - 1) {
                return i;
            }
        }
        return cache.length;
    }

    handleOrderBookSubscription (client: Client, message, subscription) {
        const symbol = this.safeString (subscription, 'symbol');
        const limit = this.safeInteger (subscription, 'limit');
        this.orderbooks[symbol] = this.orderBook ({}, limit);
        // moved snapshot initialization to handleOrderBook to fix
        // https://github.com/ccxt/ccxt/issues/6820
        // the general idea is to fetch the snapshot after the first delta
        // but not before, because otherwise we cannot synchronize the feed
    }

    handleSubscriptionStatus (client: Client, message) {
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

    handleSystemStatus (client: Client, message) {
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

    async watchOrders (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name kucoinfutures#watchOrders
         * @description watches information on multiple orders made by the user
         * @see https://docs.kucoin.com/futures/#trade-orders-according-to-the-market
         * @param {string|undefined} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the kucoinfutures api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const url = await this.negotiate (true);
        const topic = '/contractMarket/tradeOrders';
        const request = {
            'privateChannel': true,
        };
        let messageHash = 'orders';
        if (symbol !== undefined) {
            const market = this.market (symbol);
            symbol = market['symbol'];
            messageHash = messageHash + ':' + symbol;
        }
        const orders = await this.subscribe (url, messageHash, topic, undefined, this.extend (request, params));
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit);
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

    handleOrder (client: Client, message) {
        const messageHash = 'orders';
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
        const url = await this.negotiate (true);
        const topic = '/contractAccount/wallet';
        const request = {
            'privateChannel': true,
        };
        const subscription = {
            'method': this.handleBalanceSubscription,
        };
        const messageHash = 'balance';
        return await this.subscribe (url, messageHash, topic, subscription, this.extend (request, params));
    }

    handleBalance (client: Client, message) {
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
        this.balance['info'] = data;
        const currencyId = this.safeString (data, 'currency');
        const code = this.safeCurrencyCode (currencyId);
        const account = this.account ();
        account['free'] = this.safeString (data, 'availableBalance');
        account['used'] = this.safeString (data, 'holdBalance');
        this.balance[code] = account;
        this.balance = this.safeBalance (this.balance);
        client.resolve (this.balance, 'balance');
    }

    handleBalanceSubscription (client: Client, message, subscription) {
        this.spawn (this.fetchBalanceSnapshot, client, message);
    }

    async fetchBalanceSnapshot (client, message) {
        await this.loadMarkets ();
        this.checkRequiredCredentials ();
        const messageHash = 'balance';
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
        this.balance['info'] = this.safeValue (snapshot, 'info', {});
        client.resolve (this.balance, messageHash);
    }

    handleSubject (client: Client, message) {
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
        const subject = this.safeString (message, 'subject');
        const methods = {
            'level2': this.handleOrderBook,
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
        const id = this.requestId ().toString ();
        return {
            'id': id,
            'type': 'ping',
        };
    }

    handlePong (client: Client, message) {
        // https://docs.kucoin.com/#ping
        client.lastPong = this.milliseconds ();
        return message;
    }

    handleErrorMessage (client: Client, message) {
        return message;
    }

    handleMessage (client: Client, message) {
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
