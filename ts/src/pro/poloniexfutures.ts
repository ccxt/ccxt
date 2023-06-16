'use strict';

//  ---------------------------------------------------------------------------

import poloniexfuturesRest from '../poloniexfutures.js';
import { AuthenticationError, BadRequest, ExchangeError } from '../base/errors.js';
import { ArrayCache, ArrayCacheBySymbolById } from '../base/ws/Cache.js';
import { Int } from '../base/types.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

export default class poloniexfutures extends poloniexfuturesRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchOHLCV': false,
                'watchOrderBook': true,
                'watchTicker': true,
                'watchTickers': false,
                'watchTrades': true,
                'watchBalance': true,
                'watchOrders': true,
                'watchMyTrades': false,
                'watchPosition': undefined,
                'watchPositions': false,
            },
            'urls': {
                'api': {
                    'ws': 'wss://futures-apiws.poloniex.com/endpoint',
                },
            },
            'options': {
                'tradesLimit': 1000,
                'ordersLimit': 1000,
                'watchTicker': {
                    'method': '/contractMarket/ticker', // can also be /contractMarket/snapshot
                },
                'watchOrders': {
                    'method': '/contractMarket/tradeOrders', // can also be /contractMarket/advancedOrders
                },
                'watchOrderBook': {
                    'method': '/contractMarket/level2', // can also be '/contractMarket/level3v2'
                    'snapshotDelay': 5,
                    'maxRetries': 3,
                },
                'streamLimit': 5, // called tunnels by poloniexfutures docs
                'streamBySubscriptionsHash': {},
                'streamIndex': -1,
            },
            'streaming': {
                'keepAlive': 30000,
                'maxPingPongMisses': 2.0,
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
            response = await this.privatePostBulletPrivate (params);
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
            response = await this.publicPostBulletPublic (params);
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

    async subscribe (name: string, isPrivate: boolean, symbol: string = undefined, subscription = undefined, params = {}) {
        /**
         * @ignore
         * @method
         * @description Connects to a websocket channel
         * @param {string} name name of the channel and suscriptionHash
         * @param {bool} isPrivate true for the authenticated url, false for the public url
         * @param {string|undefined} symbol is required for all public channels, not required for private channels (except position)
         * @param {Object} subscription subscription parameters
         * @param {Object} params extra parameters specific to the poloniex api
         * @returns {Object} data from the websocket stream
         */
        const url = await this.negotiate (isPrivate);
        if (symbol !== undefined) {
            const market = this.market (symbol);
            const marketId = market['id'];
            name += ':' + marketId;
        }
        const messageHash = name;
        const tunnelId = await this.stream (url, messageHash);
        const requestId = this.requestId ();
        const subscribe = {
            'id': requestId,
            'type': 'subscribe',
            'topic': name,                 // Subscribed topic. Some topics support subscribe to the data of multiple trading pairs through ",".
            'privateChannel': isPrivate,   // Adopt the private channel or not. Set as false by default.
            'response': true,              // Whether the server needs to return the receipt information of this subscription or not. Set as false by default.
            'tunnelId': tunnelId,
        };
        const subscriptionRequest = {
            'id': requestId,
        };
        if (subscription === undefined) {
            subscription = subscriptionRequest;
        } else {
            subscription = this.extend (subscriptionRequest, subscription);
        }
        const request = this.extend (subscribe, params);
        return await this.watch (url, messageHash, request, name, subscriptionRequest);
    }

    onClose (client, error) {
        this.options['streamBySubscriptionsHash'] = {};
        super.onClose (client, error);
    }

    async stream (url, subscriptionHash) {
        const streamBySubscriptionsHash = this.safeValue (this.options, 'streamBySubscriptionsHash', {});
        let stream = this.safeString (streamBySubscriptionsHash, subscriptionHash);
        if (stream === undefined) {
            let streamIndex = this.safeInteger (this.options, 'streamIndex', -1);
            const streamLimit = this.safeValue (this.options, 'streamLimit');
            streamIndex = streamIndex + 1;
            const normalizedIndex = streamIndex % streamLimit;
            this.options['streamIndex'] = streamIndex;
            const streamIndexString = this.numberToString (normalizedIndex);
            stream = 'stream-' + streamIndexString;
            this.options['streamBySubscriptionsHash'][subscriptionHash] = stream;
            const messageHash = 'tunnel:' + stream;
            const request = {
                'id': messageHash,
                'type': 'openTunnel',
                'newTunnelId': stream,
                'response': true,
            };
            const subscription = {
                'id': messageHash,
                'method': this.handleNewStream,
            };
            await this.watch (url, messageHash, request, messageHash, subscription);
        }
        return stream;
    }

    handleOrderBookSubscription (client: Client, message, subscription) {
        const symbol = this.safeString (subscription, 'symbol');
        const limit = this.safeInteger (subscription, 'limit');
        this.orderbooks[symbol] = this.orderBook ({}, limit);
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

    handleNewStream (client: Client, message, subscription) {
        //
        //    {
        //        "id": "1545910840805",
        //        "type": "ack"
        //    }
        //
        const messageHash = this.safeString (message, 'id');
        client.resolve (message, messageHash);
    }

    async watchTicker (symbol: string, params = {}) {
        /**
         * @method
         * @name poloniexfutures#watchTicker
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://futures-docs.poloniex.com/#get-real-time-symbol-ticker
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the poloniexfutures api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        symbol = this.symbol (symbol);
        const name = '/contractMarket/ticker';
        return await this.subscribe (name, false, symbol, undefined, params);
    }

    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name poloniexfutures#watchTrades
         * @description get the list of most recent trades for a particular symbol
         * @see https://futures-docs.poloniex.com/#full-matching-engine-data-level-3
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the poloniexfutures api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const options = this.safeValue (this.options, 'watchTrades');
        let name = this.safeString (options, 'method', '/contractMarket/execution'); // can also be /contractMarket/snapshot
        [ name, params ] = this.handleOptionAndParams (params, 'method', 'name', name);
        symbol = this.symbol (symbol);
        const trades = await this.subscribe (name, false, symbol, undefined, params);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name poloniexfutures#watchOrderBook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://futures-docs.poloniex.com/#level-2-market-data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit not used by poloniexfutures watchOrderBook
         * @param {object} params extra parameters specific to the poloniexfutures api endpoint
         * @param {string} params.method the method to use. Defaults to /contractMarket/level2 can also be /contractMarket/level3v2 to receive the raw stream of orders
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const options = this.safeValue (this.options, 'watchOrderBook');
        let name = this.safeString (options, 'method', '/contractMarket/level2'); // can also be /contractMarket/level2, /contractMarket/level2Depth5:{symbol}, /contractMarket/level2Depth50:{symbol}
        [ name, params ] = this.handleOptionAndParams (params, 'method', 'name', name);
        if (name === '/contractMarket/level2' && limit !== undefined) {
            if (limit !== 5 && limit !== 50) {
                throw new BadRequest (this.id + ' watchOrderBook limit argument must be none, 5 or 50 if using method /contractMarket/level2');
            }
            name += 'Depth' + this.numberToString (limit);
        }
        const subscription = {
            'symbol': symbol,
            'limit': limit,
            'method': this.handleOrderBookSubscription,
        };
        const orderbook = await this.subscribe (name, false, symbol, subscription, params);
        return orderbook.limit ();
    }

    async watchOrders (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name poloniexfutures#watchOrders
         * @description watches information on multiple orders made by the user
         * @see https://futures-docs.poloniex.com/#private-messages
         * @param {string|undefined} symbol filter by unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the poloniexfutures api endpoint
         * @param {string} params.method the method to use will default to /contractMarket/tradeOrders. Set to /contractMarket/advancedOrders to watch stop orders
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const options = this.safeValue (this.options, 'watchOrders');
        const name = this.safeString (options, 'method', '/contractMarket/tradeOrders');
        let orders = await this.subscribe (name, true, undefined, undefined, params);
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        orders = this.filterBySymbolSinceLimit (orders, symbol, since, limit);
        if (orders.length === 0) {
            return await this.watchOrders (symbol, since, limit, params);
        }
        return orders;
    }

    async watchBalance (params = {}) {
        /**
         * @method
         * @name poloniexfutures#watchBalance
         * @description watches information on multiple orders made by the user
         * @see https://futures-docs.poloniex.com/#account-balance-events
         * @param {string|undefined} symbol not used by poloniexfutures watchBalance
         * @param {int|undefined} since not used by poloniexfutures watchBalance
         * @param {int|undefined} limit not used by poloniexfutures watchBalance
         * @param {object} params extra parameters specific to the poloniexfutures api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const name = '/contractAccount/wallet';
        return await this.subscribe (name, true, undefined, undefined, params);
    }

    handleTrade (client: Client, message) {
        //
        //    {
        //        data: {
        //            makerUserId: "1410336",
        //            symbol: "BTCUSDTPERP",
        //            sequence: 267913,
        //            side: "buy",
        //            size: 2,
        //            price: 28409.5,
        //            takerOrderId: "6426f9f15782c8000776995f",
        //            makerOrderId: "6426f9f141406b0008df976e",
        //            takerUserId: "1410880",
        //            tradeId: "6426f9f1de029f0001e334dd",
        //            ts: 1680275953739092500,
        //        },
        //        subject: "match",
        //        topic: "/contractMarket/execution:BTCUSDTPERP",
        //        type: "message",
        //    }
        //
        const data = this.safeValue (message, 'data', {});
        const marketId = this.safeString (data, 'symbol');
        if (marketId !== undefined) {
            const trade = this.parseWsTrade (data);
            const symbol = trade['symbol'];
            const messageHash = '/contractMarket/execution:' + marketId;
            let stored = this.safeValue (this.trades, symbol);
            if (stored === undefined) {
                const tradesLimit = this.safeInteger (this.options, 'tradesLimit', 1000);
                stored = new ArrayCache (tradesLimit);
                this.trades[symbol] = stored;
            }
            stored.append (trade);
            client.resolve (stored, messageHash);
        }
        return message;
    }

    parseWsTrade (trade, market = undefined) {
        //
        // handleTrade
        //
        //    {
        //        makerUserId: '1410880',
        //        symbol: 'BTCUSDTPERP',
        //        sequence: 731390,
        //        side: 'sell',
        //        size: 2,
        //        price: 29372.4,
        //        takerOrderId: '644ef0fdd64748000759218a',
        //        makerOrderId: '644ef0fd25f4a50007f12fc5',
        //        takerUserId: '1410880',
        //        tradeId: '644ef0fdde029f0001eec346',
        //        ts: 1682895101923194000
        //    }
        //
        const marketId = this.safeString (trade, 'symbol');
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeIntegerProduct (trade, 'ts', 0.000001);
        return this.safeTrade ({
            'info': trade,
            'id': this.safeString (trade, 'tradeId'),
            'symbol': this.safeString (market, 'symbol'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'order': this.safeString2 (trade, 'takerOrderId', 'makerOrderId'),
            'type': undefined,
            'side': this.safeString (trade, 'side'),
            'takerOrMaker': undefined,
            'price': this.safeString (trade, 'price'),
            'amount': this.safeString2 (trade, 'matchSize', 'size'),
            'cost': undefined,
            'fee': undefined,
        }, market);
    }

    parseWsOrderTrade (trade, market = undefined) {
        //
        //    {
        //        "symbol": "BTC_USDT",
        //        "type": "LIMIT",
        //        "quantity": "1",
        //        "orderId": "32471407854219264",
        //        "tradeFee": "0",
        //        "clientOrderId": "",
        //        "accountType": "SPOT",
        //        "feeCurrency": "",
        //        "eventType": "place",
        //        "source": "API",
        //        "side": "BUY",
        //        "filledQuantity": "0",
        //        "filledAmount": "0",
        //        "matchRole": "MAKER",
        //        "state": "NEW",
        //        "tradeTime": 0,
        //        "tradeAmount": "0",
        //        "orderAmount": "0",
        //        "createTime": 1648708186922,
        //        "price": "47112.1",
        //        "tradeQty": "0",
        //        "tradePrice": "0",
        //        "tradeId": "0",
        //        "ts": 1648708187469
        //    }
        //
        const timestamp = this.safeInteger (trade, 'tradeTime');
        const marketId = this.safeString (trade, 'symbol');
        return this.safeTrade ({
            'info': trade,
            'id': this.safeString (trade, 'tradeId'),
            'symbol': this.safeSymbol (marketId, market),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'order': this.safeString (trade, 'orderId'),
            'type': this.safeStringLower (trade, 'type'),
            'side': this.safeString (trade, 'side'),
            'takerOrMaker': this.safeStringLower (trade, 'matchRole'),
            'price': this.safeString (trade, 'price'),
            'amount': this.safeString (trade, 'tradeAmount'), // ? tradeQty?
            'cost': undefined,
            'fee': {
                'rate': undefined,
                'cost': this.safeString (trade, 'tradeFee'),
                'currency': this.safeString (trade, 'feeCurrency'),
            },
        }, market);
    }

    handleOrder (client: Client, message) {
        //
        //    {
        //        data: {
        //          symbol: 'ADAUSDTPERP',
        //          orderType: 'limit',
        //          side: 'buy',
        //          canceledSize: '1',
        //          orderId: '642b4d4c0494cd0007c76813',
        //          type: 'canceled',
        //          orderTime: '1680559436101909048',
        //          size: '1',
        //          filledSize: '0',
        //          marginType: 1,
        //          price: '0.25',
        //          remainSize: '0',
        //          clientOid: '112cbbf1-95a3-4917-957c-d3a87d81f853',
        //          status: 'done',
        //          ts: 1680559677560686600
        //        },
        //        subject: 'orderChange',
        //        topic: '/contractMarket/tradeOrders',
        //        channelType: 'private',
        //        type: 'message',
        //        userId: '1139790'
        //    }
        // stop order
        //    {
        //        data: {
        //            orderType: 'stop',
        //            symbol: 'BTCUSDTPERP',
        //            side: 'buy',
        //            stopPriceType: 'TP',
        //            orderId: '64514fe1850d2100074378f6',
        //            type: 'open',
        //            createdAt: 1683050465847,
        //            stopPrice: '29000',
        //            size: 2,
        //            stop: 'up',
        //            marginType: 0,
        //            orderPrice: '28552.9',
        //            ts: 1683050465847597300
        //        },
        //        subject: 'stopOrder',
        //        topic: '/contractMarket/advancedOrders',
        //        channelType: 'private',
        //        id: '64514fe1850d2100074378fa',
        //        type: 'message',
        //        userId: '1160396'
        //    }
        //
        const data = this.safeValue (message, 'data', {});
        let orders = this.orders;
        if (orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit');
            orders = new ArrayCacheBySymbolById (limit);
            this.orders = orders;
        }
        const messageHash = '/contractMarket/tradeOrders';
        const parsed = this.parseWsOrder (data);
        orders.append (parsed);
        client.resolve (orders, messageHash);
        return message;
    }

    parseOrderStatus (status: string, type: string) {
        /**
         * @ignore
         * @method
         * @param {string} status "match", "open", "done"
         * @param {string} type "open", "match", "filled", "canceled", "update"
         * @returns {string}
         */
        const types = {
            'canceled': 'canceled',
            'cancel': 'canceled',
            'filled': 'closed',
        };
        let parsedStatus = this.safeString (types, type);
        if (parsedStatus === undefined) {
            const statuses = {
                'open': 'open',
                'match': 'open',
                'done': 'closed',
            };
            parsedStatus = this.safeString (statuses, status, status);
        }
        return parsedStatus;
    }

    parseWsOrder (order, market = undefined) {
        //
        //    {
        //        symbol: 'ADAUSDTPERP',
        //        orderType: 'limit',
        //        side: 'buy',
        //        canceledSize: '1',
        //        orderId: '642b4d4c0494cd0007c76813',
        //        type: 'canceled',
        //        orderTime: '1680559436101909048',
        //        size: '1',
        //        filledSize: '0',
        //        marginType: 1,
        //        price: '0.25',
        //        remainSize: '0',
        //        clientOid: '112cbbf1-95a3-4917-957c-d3a87d81f853',
        //        status: 'done',
        //        ts: 1680559677560686600
        //    }
        // stop
        //    {
        //        orderType: 'stop',
        //        symbol: 'BTCUSDTPERP',
        //        side: 'buy',
        //        stopPriceType: 'TP',
        //        orderId: '64514fe1850d2100074378f6',
        //        type: 'open',
        //        createdAt: 1683050465847,
        //        stopPrice: '29000',
        //        size: 2,
        //        stop: 'up',
        //        marginType: 0,
        //        orderPrice: '28552.9',
        //        ts: 1683050465847597300
        //    }
        //
        const id = this.safeString (order, 'orderId');
        const clientOrderId = this.safeString (order, 'clientOid');
        const marketId = this.safeString (order, 'symbol');
        const timestamp = this.safeIntegerProduct2 (order, 'orderTime', 'ts', 0.000001);
        const status = this.safeString (order, 'status');
        const messageType = this.safeString (order, 'type');
        return this.safeOrder ({
            'info': order,
            'symbol': this.safeSymbol (marketId, market),
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'type': this.safeString (order, 'orderType'),
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': this.safeString (order, 'side'),
            'price': this.safeString2 (order, 'price', 'orderPrice'),
            'stopPrice': this.safeString (order, 'stopPrice'),
            'triggerPrice': undefined,
            'amount': this.safeString (order, 'size'),
            'cost': undefined,
            'average': undefined,
            'filled': this.safeString (order, 'filledSize'),
            'remaining': this.safeString (order, 'remainSize'),
            'status': this.parseOrderStatus (status, messageType),
            'fee': undefined,
            'trades': undefined,
        });
    }

    handleTicker (client: Client, message) {
        //
        //    {
        //        "subject": "ticker",
        //        "topic": "/contractMarket/ticker:BTCUSDTPERP",
        //        "data": {
        //            "symbol": "BTCUSDTPERP",                   // Market of the symbol
        //            "sequence": 45,                            // Sequence number which is used to judge the continuity of the pushed messages
        //            "side": "sell",                            // Transaction side of the last traded taker order
        //            "price": 3600.00,                          // Filled price
        //            "size": 16,                                // Filled quantity
        //            "tradeId": "5c9dcf4170744d6f5a3d32fb",     // Order ID
        //            "bestBidSize": 795,                        // Best bid size
        //            "bestBidPrice": 3200.00,                   // Best bid
        //            "bestAskPrice": 3600.00,                   // Best ask size
        //            "bestAskSize": 284,                        // Best ask
        //            "ts": 1553846081210004941                  // Filled time - nanosecond
        //        },
        //        "type": "message",
        //    }
        //
        //    {
        //        "topic": "/contractMarket/snapshot:BTCUSDTPERP",
        //        "subject": "snapshot.24h",
        //        "data": {
        //            "volume": 30449670,            //24h Volume
        //            "turnover": 845169919063,      //24h Turnover
        //            "lastPrice": 3551,           //Last price
        //            "priceChgPct": 0.0043,         //24h Change
        //            "ts": 1547697294838004923      //Snapshot time (nanosecond)
        //        }
        //    }
        //
        const data = this.safeValue (message, 'data', {});
        const messageHash = this.safeString (message, 'topic');
        const symbol = this.getSymbolFromTopic (messageHash);
        if (symbol !== undefined) {
            const ticker = this.parseTicker (data);
            this.tickers[symbol] = ticker;
            client.resolve (ticker, messageHash);
        }
        return message;
    }

    handleL3OrderBook (client: Client, message) {
        //
        //    {
        //        data: {
        //            symbol: 'BTCUSDTPERP',
        //            sequence: 1679593048010,
        //            orderId: '6426fec8586b9500089d64d8',
        //            clientOid: '14e6ee8e-8757-462c-84db-ed12c2b62f55',
        //            ts: 1680277192127513900
        //        },
        //        subject: 'received',
        //        topic: '/contractMarket/level3v2:BTCUSDTPERP',
        //        type: 'message'
        //    }
        //
        //    {
        //        data: {
        //            symbol: 'BTCUSDTPERP',
        //            sequence: 1679593047982,
        //            side: 'sell',
        //            orderTime: '1680277191900131371',
        //            size: '1',
        //            orderId: '6426fec7d32b6e000790268b',
        //            price: '28376.4',
        //            ts: 1680277191939042300
        //        },
        //        subject: 'open',
        //        topic: '/contractMarket/level3v2:BTCUSDTPERP',
        //        type: 'message'
        //    }
        //
        //    {
        //        data: {
        //            symbol: 'BTCUSDTPERP',
        //            reason: 'canceled',   // or 'filled'
        //            sequence: 1679593047983,
        //            orderId: '6426fec74026fa0008e7046f',
        //            ts: 1680277191949842000
        //        },
        //        subject: 'done',
        //        topic: '/contractMarket/level3v2:BTCUSDTPERP',
        //        type: 'message'
        //    }
        //
        const messageHash = this.safeString (message, 'topic');
        const subject = this.safeString (message, 'subject');
        if (subject === 'received') {
            return message;
        }
        // At the time of writting this, there is no implementation to easily convert each order into the orderbook so raw messages are returned
        client.resolve (message, messageHash);
    }

    handleLevel2 (client: Client, message) {
        //    {
        //        "subject": "level2",
        //        "topic": "/contractMarket/level2:BTCUSDTPERP",
        //        "type": "message",
        //        "data": {
        //            "sequence": 18,                   // Sequence number which is used to judge the continuity of pushed messages
        //            "change": "5000.0,sell,83"        // Price, side, quantity
        //            "timestamp": 1551770400000
        //        }
        //    }
        const topic = this.safeString (message, 'topic');
        const isSnapshot = topic.indexOf ('Depth') >= 0;
        if (isSnapshot) {
            return this.handeL2Snapshot (client, message);
        }
        return this.handleL2OrderBook (client, message);
    }

    handleL2OrderBook (client: Client, message) {
        //
        //    {
        //        "id": 1545910660740,
        //        "type": "subscribe",
        //        "topic": "/contractMarket/level2:BTCUSDTPERP",
        //        "response": true
        //    }
        //
        //    {
        //        "subject": "level2",
        //        "topic": "/contractMarket/level2:BTCUSDTPERP",
        //        "type": "message",
        //        "data": {
        //            "sequence": 18,                   // Sequence number which is used to judge the continuity of pushed messages
        //            "change": "5000.0,sell,83"        // Price, side, quantity
        //            "timestamp": 1551770400000
        //        }
        //    }
        //
        const data = this.safeValue (message, 'data', {});
        const messageHash = this.safeString (message, 'topic', '');
        const symbol = this.getSymbolFromTopic (messageHash);
        let orderBook = this.safeValue (this.orderbooks, symbol);
        if (orderBook === undefined) {
            this.orderbooks[symbol] = this.orderBook ({});
            orderBook = this.orderbooks[symbol];
            orderBook['symbol'] = symbol;
        }
        const nonce = this.safeInteger (orderBook, 'nonce');
        if (nonce === undefined) {
            const cacheLength = orderBook.cache.length;
            const snapshotDelay = this.handleOption ('watchOrderBook', 'snapshotDelay', 5);
            if (cacheLength === snapshotDelay) {
                const limit = 0;
                this.spawn (this.loadOrderBook, client, messageHash, symbol, limit);
            }
            orderBook.cache.push (data);
            return;
        }
        try {
            this.handleDelta (orderBook, data);
            client.resolve (orderBook, messageHash);
        } catch (e) {
            delete this.orderbooks[symbol];
            client.reject (e, messageHash);
        }
    }

    handeL2Snapshot (client: Client, message) {
        //
        //    {
        //        "type": "message",
        //        "topic": "/contractMarket/level2Depth5:BTCUSDTPERP",
        //        "subject": "level2",
        //        "data": {
        //            "asks": [
        //                ["9993", "3"],
        //                ["9992", "3"],
        //                ["9991", "47"],
        //                ["9990", "32"],
        //                ["9989", "8"]
        //            ],
        //            "bids": [
        //                ["9988", "56"],
        //                ["9987", "15"],
        //                ["9986", "100"],
        //                ["9985", "10"],
        //                ["9984", "10"]
        //            ],
        //            "timestamp": 1682993050531,
        //        }
        //    }
        //
        const data = this.safeValue (message, 'data', {});
        const messageHash = this.safeString (message, 'topic', '');
        const symbol = this.getSymbolFromTopic (messageHash);
        const timestamp = this.safeInteger (data, 'timestamp');
        const snapshot = this.parseOrderBook (data, symbol, timestamp, 'bids', 'asks');
        const orderbook = this.orderBook (snapshot);
        this.orderbooks[symbol] = orderbook;
        client.resolve (orderbook, messageHash);
    }

    getSymbolFromTopic (topic: string) {
        const splitTopic = topic.split (':');
        const marketId = this.safeString (splitTopic, 1);
        return this.safeSymbol (marketId);
    }

    getCacheIndex (orderbook, cache) {
        const firstDelta = this.safeValue (cache, 0);
        const nonce = this.safeInteger (orderbook, 'nonce');
        const firstDeltaSequence = this.safeInteger (firstDelta, 'sequence');
        if (firstDeltaSequence > nonce + 1) {
            return -1;
        }
        for (let i = 0; i < cache.length; i++) {
            const delta = cache[i];
            const sequence = this.safeInteger (delta, 'sequence');
            if (nonce === sequence - 1) {
                return i;
            }
        }
        return cache.length;
    }

    handleDelta (orderbook, delta) {
        //
        //    {
        //        "sequence": 18,                   // Sequence number which is used to judge the continuity of pushed messages
        //        "change": "5000.0,sell,83"        // Price, side, quantity
        //        "timestamp": 1551770400000
        //    }
        //
        const sequence = this.safeInteger (delta, 'sequence');
        const nonce = this.safeInteger (orderbook, 'nonce');
        if (nonce !== sequence - 1) {
            throw new ExchangeError (this.id + ' watchOrderBook received an out-of-order nonce');
        }
        const change = this.safeString (delta, 'change');
        const splitChange = change.split (',');
        const price = this.safeNumber (splitChange, 0);
        const side = this.safeString (splitChange, 1);
        const size = this.safeNumber (splitChange, 2);
        const timestamp = this.safeInteger (delta, 'timestamp');
        orderbook['timestamp'] = timestamp;
        orderbook['datetime'] = this.iso8601 (timestamp);
        orderbook['nonce'] = sequence;
        const orderBookSide = (side === 'buy') ? orderbook['bids'] : orderbook['asks'];
        orderBookSide.store (price, size);
    }

    handleBalance (client: Client, message) {
        //
        //    {
        //        data: {
        //          currency: 'USDT',
        //          availableBalance: '4.0000000000',
        //          timestamp: '1680557568670'
        //        },
        //        subject: 'availableBalance.change',
        //        topic: '/contractAccount/wallet',
        //        channelType: 'private',
        //        id: '642b4600cae86800074b5ab7',
        //        type: 'message',
        //        userId: '1139790'
        //    }
        //
        //    {
        //        data: {
        //          currency: 'USDT',
        //          orderMargin: '0.0000000000',
        //          timestamp: '1680558743307'
        //        },
        //        subject: 'orderMargin.change',
        //        topic: '/contractAccount/wallet',
        //        channelType: 'private',
        //        id: '642b4a97b58e360007c3a237',
        //        type: 'message',
        //        userId: '1139790'
        //    }
        //
        const data = this.safeValue (message, 'data', []);
        const messageHash = '/contractAccount/wallet';
        const currencyId = this.safeString (data, 'currency');
        const currency = this.currency (currencyId);
        const code = currency['code'];
        this.balance[code] = this.parseWsBalance (data);
        client.resolve (this.balance[code], messageHash);
        return message;
    }

    parseWsBalance (response) {
        //
        //    {
        //        currency: 'USDT',
        //        availableBalance: '4.0000000000',
        //        timestamp: '1680557568670'
        //    }
        //
        //    {
        //        currency: 'USDT',
        //        orderMargin: '0.0000000000',
        //        timestamp: '1680558743307'
        //    }
        //
        const timestamp = this.safeInteger (response, 'timestamp');
        const result = {
            'info': response,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        const currencyId = this.safeString (response, 'currency');
        const code = this.safeCurrencyCode (currencyId);
        const newAccount = this.account ();
        newAccount['free'] = this.safeString (response, 'availableBalance');
        result[code] = newAccount;
        return this.safeBalance (result);
    }

    handleSystemStatus (client: Client, message) {
        //
        //     {
        //         id: '1578090234088', // connectId
        //         type: 'welcome',
        //     }
        //
        return message;
    }

    handleSubject (client: Client, message) {
        const subject = this.safeString (message, 'subject');
        const methods = {
            'auth': this.handleAuthenticate,
            'received': this.handleL3OrderBook,
            'open': this.handleL3OrderBook,
            'update': this.handleL3OrderBook,
            'done': this.handleL3OrderBook,
            'level2': this.handleLevel2,
            'ticker': this.handleTicker,
            'snapshot.24h': this.handleTicker,
            'match': this.handleTrade,
            'orderChange': this.handleOrder,
            'stopOrder': this.handleOrder,
            'availableBalance.change': this.handleBalance,
            'orderMargin.change': this.handleBalance,
        };
        const method = this.safeValue (methods, subject);
        if (method !== undefined) {
            return method.call (this, client, message);
        }
    }

    ping (client: Client) {
        const id = this.requestId ().toString ();
        return {
            'id': id,
            'type': 'ping',
        };
    }

    handlePong (client: Client, message) {
        client.lastPong = this.milliseconds ();
        return message;
    }

    handleErrorMessage (client: Client, message) {
        //
        //    {
        //        code: 404,
        //        data: 'tunnel stream-0 is not exist',
        //        id: '3',
        //        type: 'error'
        //    }
        //
        client.reject (message);
    }

    handleMessage (client: Client, message) {
        const type = this.safeString (message, 'type');
        const methods = {
            'welcome': this.handleSystemStatus,
            'ack': this.handleSubscriptionStatus,
            'message': this.handleSubject,
            'pong': this.handlePong,
            'error': this.handleErrorMessage,
        };
        const method = this.safeValue (methods, type);
        if (method !== undefined) {
            return method.call (this, client, message);
        }
    }

    handleAuthenticate (client, message) {
        //
        //    {
        //        success: true,
        //        ret_msg: '',
        //        op: 'auth',
        //        conn_id: 'ce3dpomvha7dha97tvp0-2xh'
        //    }
        //
        const data = this.safeValue (message, 'data');
        const success = this.safeValue (data, 'success');
        const messageHash = 'authenticated';
        if (success) {
            client.resolve (message, messageHash);
        } else {
            const error = new AuthenticationError (this.id + ' ' + this.json (message));
            client.reject (error, messageHash);
            if (messageHash in client.subscriptions) {
                delete client.subscriptions[messageHash];
            }
        }
        return message;
    }
}
