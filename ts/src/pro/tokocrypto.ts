'use strict';

//  ---------------------------------------------------------------------------

import tokocryptoRest from '../tokocrypto.js';
import { ArgumentsRequired, AuthenticationError, ExchangeError } from '../base/errors.js';
import { ArrayCache, ArrayCacheBySymbolById } from '../base/ws/Cache.js';
import { Int } from '../base/types.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

export default class tokocrypto extends tokocryptoRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchOHLCV': undefined,
                'watchOrderBook': undefined,
                'watchTicker': undefined,
                'watchTickers': undefined,
                'watchTrades': undefined,
                'watchBalance': undefined,
                'watchOrders': undefined,
                'watchMyTrades': undefined,
                'watchPosition': undefined,
                'watchPositions': undefined,
            },
            'urls': {
                'api': {
                    'ws': {
                        '1': 'wss://stream.binance.com',
                        '2': 'wss://stream-cloud.binanceru.net',
                        '3': 'wss://www.tokocrypto.com/ws/',
                    },
                },
            },
            'options': {
                'tradesLimit': 1000,
                'ordersLimit': 1000,
                'OHLCVLimit': 1000,
                'watchTrades': {
                    'method': '<symbol>@trade',  // can also be '<symbol>@aggTrade'
                },
            },
            'streaming': {
                // 'keepAlive': 30000,
            },
        });
    }

    negotiate (privateChannel, params = {}) {
        // TODO
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
        // TODO
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
        // TODO
        const requestId = this.sum (this.safeInteger (this.options, 'requestId', 0), 1);
        this.options['requestId'] = requestId;
        return requestId;
    }

    async subscribe (name: string, symbol: string = undefined, params = {}) {
        /**
         * // TODO
         * @ignore
         * @method
         * @description Connects to a websocket channel
         * @param {string} name name of the channel and suscriptionHash
         * @param {bool} isPrivate true for the authenticated url, false for the public url
         * @param {string} symbol is required for all public channels, not required for private channels (except position)
         * @param {Object} subscription subscription parameters
         * @param {Object} [params] extra parameters specific to the poloniex api
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

    async subscribePrivate (messageHash, params) {
        // TODO
    }

    onClose (client, error) {
        // TODO
        this.options['streamBySubscriptionsHash'] = {};
        super.onClose (client, error);
    }

    async stream (url, subscriptionHash) {
        // TODO
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
        // TODO
        const symbol = this.safeString (subscription, 'symbol');
        const limit = this.safeInteger (subscription, 'limit');
        this.orderbooks[symbol] = this.orderBook ({}, limit);
    }

    handleSubscriptionStatus (client: Client, message) {
        // TODO
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
        // TODO
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
         * @name tokocrypto#watchTicker
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://www.tokocrypto.com/apidocs/#individual-symbol-mini-ticker-stream
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the tokocrypto api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const name = market['id'] + '@miniTicker';
        return await this.subscribe (name, symbol, params);
    }

    async watchTickers (symbols: string[] = undefined, params = {}) {
        /**
         * @method
         * @name tokocrypto#watchTickers
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
         * @see https://www.tokocrypto.com/apidocs/#all-market-mini-tickers-stream
         * @param {string[]} [symbols] unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the okx api endpoint
         * @param {string} [params.channel] the channel to subscribe to, tickers by default. Can be tickers, sprd-tickers, index-tickers, block-tickers
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        const name = '!miniTicker@arr';
        const tickers = await this.subscribe (name, symbols, params);
        if (this.newUpdates) {
            return tickers;
        }
        return this.filterByArray (this.tickers, 'symbol', symbols);
    }

    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name tokocrypto#watchTrades
         * @description get the list of most recent trades for a particular symbol
         * @see https://www.tokocrypto.com/apidocs/#aggregate-trade-streams
         * @see https://www.tokocrypto.com/apidocs/#trade-streams
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum amount of trades to fetch
         * @param {object} [params] extra parameters specific to the tokocrypto api endpoint
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const options = this.safeValue (this.options, 'watchTrades');
        let method = this.safeString (options, 'method', '<symbol>@trade');  // can also be <symbol>@aggTrade
        [ method, params ] = this.handleOptionAndParams (params, 'method', 'name', method);
        const splitMethod = method.split ('@');
        const tail = this.safeString (splitMethod, 1);
        const market = this.market (symbol);
        const name = market['id'] + '@' + tail;
        const trades = await this.subscribe (name, symbol, params);
        if (this.newUpdates) {
            limit = trades.getLimit (market['symbol'], limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    async watchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name tokocrypto#watchOHLCV
         * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @see https://www.tokocrypto.com/apidocs/#klinecandlestick-streams
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int} [since] timestamp in ms of the earliest candle to fetch
         * @param {int} [limit] the maximum amount of candles to fetch
         * @param {object} [params] extra parameters specific to the alpaca api endpoint
         * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const interval = this.findTimeframe (timeframe);
        const name = symbol + '@kline_' + interval;
        const ohlcvs = await this.subscribe (name, symbol, params);
        if (this.newUpdates) {
            limit = ohlcvs.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcvs, since, limit, 0, true);
    }

    handleOHLCV (client: Client, message) {
        //
        //    {
        //        "e": "kline",     // Event type
        //        "E": 123456789,   // Event time
        //        "s": "BNBBTC",    // Symbol
        //        "k": {
        //            "t": 123400000, // Kline start time
        //            "T": 123460000, // Kline close time
        //            "s": "BNBBTC",  // Symbol
        //            "i": "1m",      // Interval
        //            "f": 100,       // First trade ID
        //            "L": 200,       // Last trade ID
        //            "o": "0.0010",  // Open price
        //            "c": "0.0020",  // Close price
        //            "h": "0.0025",  // High price
        //            "l": "0.0015",  // Low price
        //            "v": "1000",    // Base asset volume
        //            "n": 100,       // Number of trades
        //            "x": false,     // Is this kline closed?
        //            "q": "1.0000",  // Quote asset volume
        //            "V": "500",     // Taker buy base asset volume
        //            "Q": "0.500",   // Taker buy quote asset volume
        //            "B": "123456"   // Ignore
        //        }
        //    }
        //
        const marketId = this.safeString (message, 'S');
        const symbol = this.safeSymbol (marketId);
        let stored = this.safeValue (this.ohlcvs, symbol);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
            stored = new ArrayCacheByTimestamp (limit);
            this.ohlcvs[symbol] = stored;
        }
        const parsed = this.parseOHLCV (message);
        stored.append (parsed);
        const messageHash = 'ohlcv:' + symbol;
        client.resolve (stored, messageHash);
    }

    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name tokocrypto#watchOrderBook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] not used by tokocrypto watchOrderBook
         * @param {object} [params] extra parameters specific to the tokocrypto api endpoint
         * @param {string} [params.level] 5, 10, or 20
         * @param {string} [params.updateSpeed] 1000ms (default) or 100ms
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const level = this.safeString (params, 'level');
        if (level === undefined) {
            throw new ArgumentsRequired (this.id + ' watchOrderBook requires a params["level"] argument');
        }
        const updateSpeed = this.safeString (params, 'updateSpeed');
        const market = this.market (symbol);
        let name = market['id'] + '@depth' + level;
        if (updateSpeed === '100ms') {
            name = name + '@100ms';
        }
        const orderbook = await this.subscribe (name, symbol, params);
        return orderbook.limit ();
    }

    async watchOrders (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name tokocrypto#watchOrders
         * @description watches information on multiple orders made by the user
         * @see https://www.tokocrypto.com/apidocs/#create-a-listenkey
         * @param {string} symbol filter by unified market symbol of the market orders were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of  orde structures to retrieve
         * @param {object} [params] extra parameters specific to the tokocrypto api endpoint
         * @param {string} [params.method] the method to use will default to /contractMarket/tradeOrders. Set to /contractMarket/advancedOrders to watch stop orders
         * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const messageHash = 'orders';
        let orders = await this.subscribePrivate (messageHash, params);
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
         * @name tokocrypto#watchBalance
         * @description watch balance and get the amount of funds available for trading or funds locked in orders
         * @see https://www.tokocrypto.com/apidocs/#create-a-listenkey
         * @param {object} [params] extra parameters specific to the tokocrypto api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        const messageHash = 'balance';
        return await this.subscribePrivate (messageHash, params);
    }

    handleTrade (client: Client, message) {
        //
        // TODO
        // <symbol>@aggTrade
        //
        //    {
        //        "e": "aggTrade",  // Event type
        //        "E": 123456789,   // Event time
        //        "s": "BNBBTC",    // Symbol
        //        "a": 12345,       // Aggregate trade ID
        //        "p": "0.001",     // Price
        //        "q": "100",       // Quantity
        //        "f": 100,         // First trade ID
        //        "l": 105,         // Last trade ID
        //        "T": 123456785,   // Trade time
        //        "m": true,        // Is the buyer the market maker?
        //        "M": true         // Ignore
        //    }
        //
        // <symbol>@trade
        //
        //    {
        //        "e": "trade",     // Event type
        //        "E": 123456789,   // Event time
        //        "s": "BNBBTC",    // Symbol
        //        "t": 12345,       // Trade ID
        //        "p": "0.001",     // Price
        //        "q": "100",       // Quantity
        //        "b": 88,          // Buyer order ID
        //        "a": 50,          // Seller order ID
        //        "T": 123456785,   // Trade time
        //        "m": true,        // Is the buyer the market maker?
        //        "M": true         // Ignore
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
        // TODO
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
        // TODO
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
        // TODO
        //
        //    {
        //        "e": "executionReport",        // Event type
        //        "E": 1499405658658,            // Event time
        //        "s": "ETHBTC",                 // Symbol
        //        "c": "mUvoqJxFIILMdfAW5iGSOW", // order ID
        //        "S": "BUY",                    // Side
        //        "o": "LIMIT",                  // Order type
        //        "f": "GTC",                    // Time in force
        //        "q": "1.00000000",             // Order quantity
        //        "p": "0.10264410",             // Order price
        //        "P": "0.00000000",             // Stop price
        //        "F": "0.00000000",             // Iceberg quantity
        //        "g": -1,                       // Ignore
        //        "C": "null",                   // Original client order ID; This is the ID of the order being canceled
        //        "x": "NEW",                    // Current execution type
        //        "X": "NEW",                    // Current order status
        //        "r": "NONE",                   // Order reject reason; will be an error code.
        //        "i": 4293153,                  // Binance Order ID
        //        "l": "0.00000000",             // Last executed quantity
        //        "z": "0.00000000",             // Cumulative filled quantity
        //        "L": "0.00000000",             // Last executed price
        //        "n": "0",                      // Commission amount
        //        "N": null,                     // Commission asset
        //        "T": 1499405658657,            // Transaction time
        //        "t": -1,                       // Trade ID
        //        "I": 8641984,                  // Ignore
        //        "w": true,                     // Is the order working? Stops will have
        //        "m": false,                    // Is this trade the maker side?
        //        "M": false,                    // Ignore
        //        "O": 1499405658657,            // Order creation time
        //        "Z": "0.00000000",             // Cumulative quote asset transacted quantity
        //        "Y": "0.00000000"              // Last quote asset transacted quantity (i.e. lastPrice * lastQty)
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
         * // TODO
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
        // TODO
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
        // TODO
        //
        //    {
        //        "e": "24hrMiniTicker",  // Event type
        //        "E": 123456789,         // Event time
        //        "s": "BNBBTC",          // Symbol
        //        "c": "0.0025",          // Close price
        //        "o": "0.0010",          // Open price
        //        "h": "0.0025",          // High price
        //        "l": "0.0010",          // Low price
        //        "v": "10000",           // Total traded base asset volume
        //        "q": "18"               // Total traded quote asset volume
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
        // TODO
        //
        //    {
        //        "lastUpdateId": 160,  // Last update ID
        //        "bids": [             // Bids to be updated
        //          [
        //            "0.0024",         // Price level to be updated
        //            "10"              // Quantity
        //          ]
        //        ],
        //        "asks": [             // Asks to be updated
        //          [
        //            "0.0026",         // Price level to be updated
        //            "100"            // Quantity
        //          ]
        //        ]
        //    }
        //
        //    {
        //        "e": "depthUpdate", // Event type
        //        "E": 123456789,     // Event time
        //        "s": "BNBBTC",      // Symbol
        //        "U": 157,           // First update ID in event
        //        "u": 160,           // Final update ID in event
        //        "b": [              // Bids to be updated
        //          [
        //            "0.0024",       // Price level to be updated
        //            "10"            // Quantity
        //          ]
        //        ],
        //        "a": [              // Asks to be updated
        //          [
        //            "0.0026",       // Price level to be updated
        //            "100"           // Quantity
        //          ]
        //        ]
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
        // TODO
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
        // TODO
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
        // TODO
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
        // TODO
        const splitTopic = topic.split (':');
        const marketId = this.safeString (splitTopic, 1);
        return this.safeSymbol (marketId);
    }

    getCacheIndex (orderbook, cache) {
        // TODO
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
        // TODO
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
        // TODO
        //
        //    {
        //        "e": "outboundAccountPosition",   // Event type
        //        "E": 1499405658849,           // Event time
        //        "m": 0,                       // Maker commission rate (bips)
        //        "t": 0,                       // Taker commission rate (bips)
        //        "b": 0,                       // Buyer commission rate (bips)
        //        "s": 0,                       // Seller commission rate (bips)
        //        "T": true,                    // Can trade?
        //        "W": true,                    // Can withdraw?
        //        "D": true,                    // Can deposit?
        //        "u": 1499405658848,           // Time of last account update
        //        "B": [                        // Balances array
        //          {
        //            "a": "LTC",               // Asset
        //            "f": "17366.18538083",    // Free amount
        //            "l": "0.00000000"         // Locked amount
        //          },
        //          {
        //            "a": "BTC",
        //            "f": "10537.85314051",
        //            "l": "2.19464093"
        //          },
        //          {
        //            "a": "ETH",
        //            "f": "17902.35190619",
        //            "l": "0.00000000"
        //          },
        //          {
        //            "a": "BNC",
        //            "f": "1114503.29769312",
        //            "l": "0.00000000"
        //          },
        //          {
        //            "a": "NEO",
        //            "f": "0.00000000",
        //            "l": "0.00000000"
        //          }
        //        ]
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
        // TODO
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
        // TODO
        //
        //     {
        //         id: '1578090234088', // connectId
        //         type: 'welcome',
        //     }
        //
        return message;
    }

    handleSubject (client: Client, message) {
        // TODO
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
        // TODO
        const id = this.requestId ().toString ();
        return {
            'id': id,
            'type': 'ping',
        };
    }

    handlePong (client: Client, message) {
        // TODO
        client.lastPong = this.milliseconds ();
        return message;
    }

    handleErrorMessage (client: Client, message) {
        // TODO
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
        // TODO
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
        // TODO
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
