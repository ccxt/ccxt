'use strict';

var hashkey$1 = require('../hashkey.js');
var Cache = require('../base/ws/Cache.js');

//  ---------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
class hashkey extends hashkey$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'has': {
                'ws': true,
                'watchBalance': true,
                'watchMyTrades': true,
                'watchOHLCV': true,
                'watchOrderBook': true,
                'watchOrders': true,
                'watchTicker': true,
                'watchTrades': true,
                'watchTradesForSymbols': false,
                'watchPositions': false,
            },
            'urls': {
                'api': {
                    'ws': {
                        'public': 'wss://stream-glb.hashkey.com/quote/ws/v1',
                        'private': 'wss://stream-glb.hashkey.com/api/v1/ws',
                    },
                    'test': {
                        'ws': {
                            'public': 'wss://stream-glb.sim.hashkeydev.com/quote/ws/v1',
                            'private': 'wss://stream-glb.sim.hashkeydev.com/api/v1/ws',
                        },
                    },
                },
            },
            'options': {
                'listenKeyRefreshRate': 3600000,
                'listenKey': undefined,
                'watchBalance': {
                    'fetchBalanceSnapshot': true,
                    'awaitBalanceSnapshot': false, // whether to wait for the balance snapshot before providing updates
                },
            },
            'streaming': {
                'keepAlive': 10000,
            },
        });
    }
    async wathPublic(market, topic, messageHash, params = {}) {
        const request = {
            'symbol': market['id'],
            'topic': topic,
            'event': 'sub',
        };
        const url = this.urls['api']['ws']['public'];
        return await this.watch(url, messageHash, this.deepExtend(request, params), messageHash);
    }
    async watchPrivate(messageHash) {
        const listenKey = await this.authenticate();
        const url = this.getPrivateUrl(listenKey);
        return await this.watch(url, messageHash, undefined, messageHash);
    }
    getPrivateUrl(listenKey) {
        return this.urls['api']['ws']['private'] + '/' + listenKey;
    }
    /**
     * @method
     * @name hashkey#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://hashkeyglobal-apidoc.readme.io/reference/websocket-api#public-stream
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.binary] true or false - default false
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async watchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        symbol = market['symbol'];
        const interval = this.safeString(this.timeframes, timeframe, timeframe);
        const topic = 'kline_' + interval;
        const messageHash = 'ohlcv:' + symbol + ':' + timeframe;
        const ohlcv = await this.wathPublic(market, topic, messageHash, params);
        if (this.newUpdates) {
            limit = ohlcv.getLimit(symbol, limit);
        }
        return this.filterBySinceLimit(ohlcv, since, limit, 0, true);
    }
    handleOHLCV(client, message) {
        //
        //     {
        //         "symbol": "DOGEUSDT",
        //         "symbolName": "DOGEUSDT",
        //         "topic": "kline",
        //         "params": {
        //             "realtimeInterval": "24h",
        //             "klineType": "1m"
        //         },
        //         "data": [
        //             {
        //                 "t": 1722861660000,
        //                 "s": "DOGEUSDT",
        //                 "sn": "DOGEUSDT",
        //                 "c": "0.08389",
        //                 "h": "0.08389",
        //                 "l": "0.08389",
        //                 "o": "0.08389",
        //                 "v": "0"
        //             }
        //         ],
        //         "f": true,
        //         "sendTime": 1722861664258,
        //         "shared": false
        //     }
        //
        const marketId = this.safeString(message, 'symbol');
        const market = this.safeMarket(marketId);
        const symbol = this.safeSymbol(marketId, market);
        if (!(symbol in this.ohlcvs)) {
            this.ohlcvs[symbol] = {};
        }
        const params = this.safeDict(message, 'params');
        const klineType = this.safeString(params, 'klineType');
        const timeframe = this.findTimeframe(klineType);
        if (!(timeframe in this.ohlcvs[symbol])) {
            const limit = this.safeInteger(this.options, 'OHLCVLimit', 1000);
            this.ohlcvs[symbol][timeframe] = new Cache.ArrayCacheByTimestamp(limit);
        }
        const data = this.safeList(message, 'data', []);
        const stored = this.ohlcvs[symbol][timeframe];
        for (let i = 0; i < data.length; i++) {
            const candle = this.safeDict(data, i, {});
            const parsed = this.parseWsOHLCV(candle, market);
            stored.append(parsed);
        }
        const messageHash = 'ohlcv:' + symbol + ':' + timeframe;
        client.resolve(stored, messageHash);
    }
    parseWsOHLCV(ohlcv, market = undefined) {
        //
        //     {
        //         "t": 1722861660000,
        //         "s": "DOGEUSDT",
        //         "sn": "DOGEUSDT",
        //         "c": "0.08389",
        //         "h": "0.08389",
        //         "l": "0.08389",
        //         "o": "0.08389",
        //         "v": "0"
        //     }
        //
        return [
            this.safeInteger(ohlcv, 't'),
            this.safeNumber(ohlcv, 'o'),
            this.safeNumber(ohlcv, 'h'),
            this.safeNumber(ohlcv, 'l'),
            this.safeNumber(ohlcv, 'c'),
            this.safeNumber(ohlcv, 'v'),
        ];
    }
    /**
     * @method
     * @name hahskey#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://hashkeyglobal-apidoc.readme.io/reference/websocket-api#public-stream
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.binary] true or false - default false
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTicker(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        symbol = market['symbol'];
        const topic = 'realtimes';
        const messageHash = 'ticker:' + symbol;
        return await this.wathPublic(market, topic, messageHash, params);
    }
    handleTicker(client, message) {
        //
        //     {
        //         "symbol": "ETHUSDT",
        //         "symbolName": "ETHUSDT",
        //         "topic": "realtimes",
        //         "params": {
        //             "realtimeInterval": "24h"
        //         },
        //         "data": [
        //             {
        //                 "t": 1722864411064,
        //                 "s": "ETHUSDT",
        //                 "sn": "ETHUSDT",
        //                 "c": "2195",
        //                 "h": "2918.85",
        //                 "l": "2135.5",
        //                 "o": "2915.78",
        //                 "v": "666.5019",
        //                 "qv": "1586902.757079",
        //                 "m": "-0.2472",
        //                 "e": 301
        //             }
        //         ],
        //         "f": false,
        //         "sendTime": 1722864411086,
        //         "shared": false
        //     }
        //
        const data = this.safeList(message, 'data', []);
        const ticker = this.parseTicker(this.safeDict(data, 0));
        const symbol = ticker['symbol'];
        const messageHash = 'ticker:' + symbol;
        this.tickers[symbol] = ticker;
        client.resolve(this.tickers[symbol], messageHash);
    }
    /**
     * @method
     * @name hashkey#watchTrades
     * @description watches information on multiple trades made in a market
     * @see https://hashkeyglobal-apidoc.readme.io/reference/websocket-api#public-stream
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.binary] true or false - default false
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async watchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        symbol = market['symbol'];
        const topic = 'trade';
        const messageHash = 'trades:' + symbol;
        const trades = await this.wathPublic(market, topic, messageHash, params);
        if (this.newUpdates) {
            limit = trades.getLimit(symbol, limit);
        }
        return this.filterBySinceLimit(trades, since, limit, 'timestamp', true);
    }
    handleTrades(client, message) {
        //
        //     {
        //         "symbol": "ETHUSDT",
        //         "symbolName": "ETHUSDT",
        //         "topic": "trade",
        //         "params": {
        //             "realtimeInterval": "24h"
        //         },
        //         "data": [
        //             {
        //                 "v": "1745922896272048129",
        //                 "t": 1722866228075,
        //                 "p": "2340.41",
        //                 "q": "0.0132",
        //                 "m": true
        //             },
        //             ...
        //         ],
        //         "f": true,
        //         "sendTime": 1722869464248,
        //         "channelId": "668498fffeba4108-00000001-00113184-562e27d215e43f9c-c188b319",
        //         "shared": false
        //     }
        //
        const marketId = this.safeString(message, 'symbol');
        const market = this.safeMarket(marketId);
        const symbol = market['symbol'];
        if (!(symbol in this.trades)) {
            const limit = this.safeInteger(this.options, 'tradesLimit', 1000);
            this.trades[symbol] = new Cache.ArrayCache(limit);
        }
        const stored = this.trades[symbol];
        let data = this.safeList(message, 'data');
        if (data !== undefined) {
            data = this.sortBy(data, 't');
            for (let i = 0; i < data.length; i++) {
                const trade = this.safeDict(data, i);
                const parsed = this.parseWsTrade(trade, market);
                stored.append(parsed);
            }
        }
        const messageHash = 'trades' + ':' + symbol;
        client.resolve(stored, messageHash);
    }
    /**
     * @method
     * @name alpaca#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://hashkeyglobal-apidoc.readme.io/reference/websocket-api#public-stream
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return.
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBook(symbol, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        symbol = market['symbol'];
        const topic = 'depth';
        const messageHash = 'orderbook:' + symbol;
        const orderbook = await this.wathPublic(market, topic, messageHash, params);
        return orderbook.limit();
    }
    handleOrderBook(client, message) {
        //
        //     {
        //         "symbol": "ETHUSDT",
        //         "symbolName": "ETHUSDT",
        //         "topic": "depth",
        //         "params": { "realtimeInterval": "24h" },
        //         "data": [
        //             {
        //                 "e": 301,
        //                 "s": "ETHUSDT",
        //                 "t": 1722873144371,
        //                 "v": "84661262_18",
        //                 "b": [
        //                     [ "1650", "0.0864" ],
        //                     ...
        //                 ],
        //                 "a": [
        //                     ["4085", "0.0074" ],
        //                     ...
        //                 ],
        //                 "o": 0
        //             }
        //         ],
        //         "f": false,
        //         "sendTime": 1722873144589,
        //         "channelId": "2265aafffe68b588-00000001-0011510c-9e9ca710b1500854-551830bd",
        //         "shared": false
        //     }
        //
        const marketId = this.safeString(message, 'symbol');
        const symbol = this.safeSymbol(marketId);
        const messageHash = 'orderbook:' + symbol;
        if (!(symbol in this.orderbooks)) {
            this.orderbooks[symbol] = this.orderBook({});
        }
        const orderbook = this.orderbooks[symbol];
        const data = this.safeList(message, 'data', []);
        const dataEntry = this.safeDict(data, 0);
        const timestamp = this.safeInteger(dataEntry, 't');
        const snapshot = this.parseOrderBook(dataEntry, symbol, timestamp, 'b', 'a');
        orderbook.reset(snapshot);
        orderbook['nonce'] = this.safeInteger(message, 'id');
        this.orderbooks[symbol] = orderbook;
        client.resolve(orderbook, messageHash);
    }
    /**
     * @method
     * @name hashkey#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://hashkeyglobal-apidoc.readme.io/reference/websocket-api#private-stream
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async watchOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let messageHash = 'orders';
        if (symbol !== undefined) {
            symbol = this.symbol(symbol);
            messageHash = messageHash + ':' + symbol;
        }
        const orders = await this.watchPrivate(messageHash);
        if (this.newUpdates) {
            limit = orders.getLimit(symbol, limit);
        }
        return this.filterBySymbolSinceLimit(orders, symbol, since, limit, true);
    }
    handleOrder(client, message) {
        //
        // swap
        //     {
        //         "e": "contractExecutionReport",
        //         "E": "1723037391181",
        //         "s": "ETHUSDT-PERPETUAL",
        //         "c": "1723037389677",
        //         "S": "BUY_OPEN",
        //         "o": "LIMIT",
        //         "f": "IOC",
        //         "q": "1",
        //         "p": "2561.75",
        //         "X": "FILLED",
        //         "i": "1747358716129257216",
        //         "l": "1",
        //         "z": "1",
        //         "L": "2463.36",
        //         "n": "0.001478016",
        //         "N": "USDT",
        //         "u": true,
        //         "w": true,
        //         "m": false,
        //         "O": "1723037391140",
        //         "Z": "2463.36",
        //         "C": false,
        //         "v": "5",
        //         "reqAmt": "0",
        //         "d": "1747358716255075840",
        //         "r": "0",
        //         "V": "2463.36",
        //         "P": "0",
        //         "lo": false,
        //         "lt": ""
        //     }
        //
        if (this.orders === undefined) {
            const limit = this.safeInteger(this.options, 'ordersLimit', 1000);
            this.orders = new Cache.ArrayCacheBySymbolById(limit);
        }
        const parsed = this.parseWsOrder(message);
        const orders = this.orders;
        orders.append(parsed);
        const messageHash = 'orders';
        client.resolve(orders, messageHash);
        const symbol = parsed['symbol'];
        const symbolSpecificMessageHash = messageHash + ':' + symbol;
        client.resolve(orders, symbolSpecificMessageHash);
    }
    parseWsOrder(order, market = undefined) {
        const marketId = this.safeString(order, 's');
        market = this.safeMarket(marketId, market);
        const timestamp = this.safeInteger(order, 'O');
        let side = this.safeStringLower(order, 'S');
        let reduceOnly = undefined;
        [side, reduceOnly] = this.parseOrderSideAndReduceOnly(side);
        let type = this.parseOrderType(this.safeString(order, 'o'));
        let timeInForce = this.safeString(order, 'f');
        let postOnly = undefined;
        [type, timeInForce, postOnly] = this.parseOrderTypeTimeInForceAndPostOnly(type, timeInForce);
        if (market['contract']) { // swap orders are always have type 'LIMIT', thus we can not define the correct type
            type = undefined;
        }
        return this.safeOrder({
            'id': this.safeString(order, 'i'),
            'clientOrderId': this.safeString(order, 'c'),
            'datetime': this.iso8601(timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': undefined,
            'lastUpdateTimestamp': undefined,
            'status': this.parseOrderStatus(this.safeString(order, 'X')),
            'symbol': market['symbol'],
            'type': type,
            'timeInForce': timeInForce,
            'side': side,
            'price': this.safeString(order, 'p'),
            'average': this.safeString(order, 'V'),
            'amount': this.omitZero(this.safeString(order, 'q')),
            'filled': this.safeString(order, 'z'),
            'remaining': this.safeString(order, 'r'),
            'stopPrice': undefined,
            'triggerPrice': undefined,
            'takeProfitPrice': undefined,
            'stopLossPrice': undefined,
            'cost': this.omitZero(this.safeString(order, 'Z')),
            'trades': undefined,
            'fee': {
                'currency': this.safeCurrencyCode(this.safeString(order, 'N')),
                'amount': this.omitZero(this.safeString(order, 'n')),
            },
            'reduceOnly': reduceOnly,
            'postOnly': postOnly,
            'info': order,
        }, market);
    }
    /**
     * @method
     * @name hashkey#watchMyTrades
     * @description watches information on multiple trades made by the user
     * @see https://hashkeyglobal-apidoc.readme.io/reference/websocket-api#private-stream
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async watchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let messageHash = 'myTrades';
        if (symbol !== undefined) {
            symbol = this.symbol(symbol);
            messageHash += ':' + symbol;
        }
        const trades = await this.watchPrivate(messageHash);
        if (this.newUpdates) {
            limit = trades.getLimit(symbol, limit);
        }
        return this.filterBySinceLimit(trades, since, limit, 'timestamp', true);
    }
    handleMyTrade(client, message, subscription = {}) {
        //
        //     {
        //         "e": "ticketInfo",
        //         "E": "1723037391156",
        //         "s": "ETHUSDT-PERPETUAL",
        //         "q": "1.00",
        //         "t": "1723037391147",
        //         "p": "2463.36",
        //         "T": "1747358716187197441",
        //         "o": "1747358716129257216",
        //         "c": "1723037389677",
        //         "a": "1735619524953226496",
        //         "m": false,
        //         "S": "BUY"
        //     }
        //
        if (this.myTrades === undefined) {
            const limit = this.safeInteger(this.options, 'tradesLimit', 1000);
            this.myTrades = new Cache.ArrayCacheBySymbolById(limit);
        }
        const tradesArray = this.myTrades;
        const parsed = this.parseWsTrade(message);
        tradesArray.append(parsed);
        this.myTrades = tradesArray;
        const messageHash = 'myTrades';
        client.resolve(tradesArray, messageHash);
        const symbol = parsed['symbol'];
        const symbolSpecificMessageHash = messageHash + ':' + symbol;
        client.resolve(tradesArray, symbolSpecificMessageHash);
    }
    parseWsTrade(trade, market = undefined) {
        //
        // watchTrades
        //     {
        //         "v": "1745922896272048129",
        //         "t": 1722866228075,
        //         "p": "2340.41",
        //         "q": "0.0132",
        //         "m": true
        //     }
        //
        // watchMyTrades
        //     {
        //         "e": "ticketInfo",
        //         "E": "1723037391156",
        //         "s": "ETHUSDT-PERPETUAL",
        //         "q": "1.00",
        //         "t": "1723037391147",
        //         "p": "2463.36",
        //         "T": "1747358716187197441",
        //         "o": "1747358716129257216",
        //         "c": "1723037389677",
        //         "a": "1735619524953226496",
        //         "m": false,
        //         "S": "BUY"
        //     }
        //
        const marketId = this.safeString(trade, 's');
        market = this.safeMarket(marketId, market);
        const timestamp = this.safeInteger(trade, 't');
        const isMaker = this.safeBool(trade, 'm');
        let takerOrMaker = undefined;
        if (isMaker !== undefined) {
            if (isMaker) {
                takerOrMaker = 'maker';
            }
            else {
                takerOrMaker = 'taker';
            }
        }
        return this.safeTrade({
            'id': this.safeString2(trade, 'v', 'T'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'symbol': market['symbol'],
            'side': this.safeStringLower(trade, 'S'),
            'price': this.safeString(trade, 'p'),
            'amount': this.safeString(trade, 'q'),
            'cost': undefined,
            'takerOrMaker': takerOrMaker,
            'type': undefined,
            'order': this.safeString(trade, 'o'),
            'fee': undefined,
            'info': trade,
        }, market);
    }
    /**
     * @method
     * @name hashkey#watchPositions
     * @see https://hashkeyglobal-apidoc.readme.io/reference/websocket-api#private-stream
     * @description watch all open positions
     * @param {string[]} [symbols] list of unified market symbols to watch positions for
     * @param {int} [since] the earliest time in ms to fetch positions for
     * @param {int} [limit] the maximum number of positions to retrieve
     * @param {object} params extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
     */
    async watchPositions(symbols = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const listenKey = await this.authenticate();
        symbols = this.marketSymbols(symbols);
        const messageHash = 'positions';
        const messageHashes = [];
        if (symbols === undefined) {
            messageHashes.push(messageHash);
        }
        else {
            for (let i = 0; i < symbols.length; i++) {
                const symbol = symbols[i];
                messageHashes.push(messageHash + ':' + symbol);
            }
        }
        const url = this.getPrivateUrl(listenKey);
        const positions = await this.watchMultiple(url, messageHashes, undefined, messageHashes);
        if (this.newUpdates) {
            return positions;
        }
        return this.filterBySymbolsSinceLimit(this.positions, symbols, since, limit, true);
    }
    handlePosition(client, message) {
        //
        //     {
        //         "e": "outboundContractPositionInfo",
        //         "E": "1723084699801",
        //         "A": "1735619524953226496",
        //         "s": "ETHUSDT-PERPETUAL",
        //         "S": "LONG",
        //         "p": "2429.6",
        //         "P": "2",
        //         "a": "2",
        //         "f": "10760.14",
        //         "m": "1.0085",
        //         "r": "-0.0029",
        //         "up": "0.0478",
        //         "pr": "0.0492",
        //         "pv": "4.8592",
        //         "v": "5.00",
        //         "mt": "CROSS",
        //         "mm": "0.0367"
        //     }
        //
        if (this.positions === undefined) {
            this.positions = new Cache.ArrayCacheBySymbolBySide();
        }
        const positions = this.positions;
        const parsed = this.parseWsPosition(message);
        positions.append(parsed);
        const messageHash = 'positions';
        client.resolve(parsed, messageHash);
        const symbol = parsed['symbol'];
        client.resolve(parsed, messageHash + ':' + symbol);
    }
    parseWsPosition(position, market = undefined) {
        const marketId = this.safeString(position, 's');
        market = this.safeMarket(marketId);
        const timestamp = this.safeInteger(position, 'E');
        return this.safePosition({
            'symbol': market['symbol'],
            'id': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'contracts': this.safeNumber(position, 'P'),
            'contractSize': undefined,
            'side': this.safeStringLower(position, 'S'),
            'notional': this.safeNumber(position, 'pv'),
            'leverage': this.safeInteger(position, 'v'),
            'unrealizedPnl': this.safeNumber(position, 'up'),
            'realizedPnl': this.safeNumber(position, 'r'),
            'collateral': undefined,
            'entryPrice': this.safeNumber(position, 'p'),
            'markPrice': undefined,
            'liquidationPrice': this.safeNumber(position, 'f'),
            'marginMode': this.safeStringLower(position, 'mt'),
            'hedged': true,
            'maintenanceMargin': this.safeNumber(position, 'mm'),
            'maintenanceMarginPercentage': undefined,
            'initialMargin': this.safeNumber(position, 'm'),
            'initialMarginPercentage': undefined,
            'marginRatio': undefined,
            'lastUpdateTimestamp': undefined,
            'lastPrice': undefined,
            'stopLossPrice': undefined,
            'takeProfitPrice': undefined,
            'percentage': undefined,
            'info': position,
        });
    }
    /**
     * @method
     * @name bitmart#watchBalance
     * @description watch balance and get the amount of funds available for trading or funds locked in orders
     * @see https://hashkeyglobal-apidoc.readme.io/reference/websocket-api#private-stream
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'spot' or 'swap' - the type of the market to watch balance for (default 'spot')
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async watchBalance(params = {}) {
        const listenKey = await this.authenticate();
        await this.loadMarkets();
        let type = 'spot';
        [type, params] = this.handleMarketTypeAndParams('watchBalance', undefined, params, type);
        const messageHash = 'balance:' + type;
        const url = this.getPrivateUrl(listenKey);
        const client = this.client(url);
        this.setBalanceCache(client, type, messageHash);
        let fetchBalanceSnapshot = undefined;
        let awaitBalanceSnapshot = undefined;
        [fetchBalanceSnapshot, params] = this.handleOptionAndParams(this.options, 'watchBalance', 'fetchBalanceSnapshot', true);
        [awaitBalanceSnapshot, params] = this.handleOptionAndParams(this.options, 'watchBalance', 'awaitBalanceSnapshot', false);
        if (fetchBalanceSnapshot && awaitBalanceSnapshot) {
            await client.future(type + ':fetchBalanceSnapshot');
        }
        return await this.watch(url, messageHash, undefined, messageHash);
    }
    setBalanceCache(client, type, subscribeHash) {
        if (subscribeHash in client.subscriptions) {
            return;
        }
        const options = this.safeDict(this.options, 'watchBalance');
        const snapshot = this.safeBool(options, 'fetchBalanceSnapshot', true);
        if (snapshot) {
            const messageHash = type + ':' + 'fetchBalanceSnapshot';
            if (!(messageHash in client.futures)) {
                client.future(messageHash);
                this.spawn(this.loadBalanceSnapshot, client, messageHash, type);
            }
        }
        this.balance[type] = {};
        // without this comment, transpilation breaks for some reason...
    }
    async loadBalanceSnapshot(client, messageHash, type) {
        const response = await this.fetchBalance({ 'type': type });
        this.balance[type] = this.extend(response, this.safeValue(this.balance, type, {}));
        // don't remove the future from the .futures cache
        const future = client.futures[messageHash];
        future.resolve();
        client.resolve(this.balance[type], 'balance:' + type);
    }
    handleBalance(client, message) {
        //
        //     {
        //         "e": "outboundContractAccountInfo",        // event type
        //                                                    // outboundContractAccountInfo
        //         "E": "1714717314118",                      // event time
        //         "T": true,                                 // can trade
        //         "W": true,                                 // can withdraw
        //         "D": true,                                 // can deposit
        //         "B": [                                     // balances changed
        //             {
        //                 "a": "USDT",                       // asset
        //                 "f": "474960.65",                  // free amount
        //                 "l": "24835.178056020383226869",   // locked amount
        //                 "r": ""                            // to be released
        //             }
        //         ]
        //     }
        //
        const event = this.safeString(message, 'e');
        const data = this.safeList(message, 'B', []);
        const balanceUpdate = this.safeDict(data, 0);
        const isSpot = event === 'outboundAccountInfo';
        const type = isSpot ? 'spot' : 'swap';
        if (!(type in this.balance)) {
            this.balance[type] = {};
        }
        this.balance[type]['info'] = message;
        const currencyId = this.safeString(balanceUpdate, 'a');
        const code = this.safeCurrencyCode(currencyId);
        const account = this.account();
        account['free'] = this.safeString(balanceUpdate, 'f');
        account['used'] = this.safeString(balanceUpdate, 'l');
        this.balance[type][code] = account;
        this.balance[type] = this.safeBalance(this.balance[type]);
        const messageHash = 'balance:' + type;
        client.resolve(this.balance[type], messageHash);
    }
    async authenticate(params = {}) {
        let listenKey = this.safeString(this.options, 'listenKey');
        if (listenKey !== undefined) {
            return listenKey;
        }
        const response = await this.privatePostApiV1UserDataStream(params);
        //
        //    {
        //        "listenKey": "atbNEcWnBqnmgkfmYQeTuxKTpTStlZzgoPLJsZhzAOZTbAlxbHqGNWiYaUQzMtDz"
        //    }
        //
        listenKey = this.safeString(response, 'listenKey');
        this.options['listenKey'] = listenKey;
        const listenKeyRefreshRate = this.safeInteger(this.options, 'listenKeyRefreshRate', 3600000);
        this.delay(listenKeyRefreshRate, this.keepAliveListenKey, listenKey, params);
        return listenKey;
    }
    async keepAliveListenKey(listenKey, params = {}) {
        if (listenKey === undefined) {
            return;
        }
        const request = {
            'listenKey': listenKey,
        };
        try {
            await this.privatePutApiV1UserDataStream(this.extend(request, params));
            const listenKeyRefreshRate = this.safeInteger(this.options, 'listenKeyRefreshRate', 1200000);
            this.delay(listenKeyRefreshRate, this.keepAliveListenKey, listenKey, params);
        }
        catch (error) {
            const url = this.getPrivateUrl(listenKey);
            const client = this.client(url);
            this.options['listenKey'] = undefined;
            client.reject(error);
            delete this.clients[url];
        }
    }
    handleMessage(client, message) {
        if (Array.isArray(message)) {
            message = this.safeDict(message, 0, {});
        }
        const topic = this.safeString2(message, 'topic', 'e');
        if (topic === 'kline') {
            this.handleOHLCV(client, message);
        }
        else if (topic === 'realtimes') {
            this.handleTicker(client, message);
        }
        else if (topic === 'trade') {
            this.handleTrades(client, message);
        }
        else if (topic === 'depth') {
            this.handleOrderBook(client, message);
        }
        else if ((topic === 'contractExecutionReport') || (topic === 'executionReport')) {
            this.handleOrder(client, message);
        }
        else if (topic === 'ticketInfo') {
            this.handleMyTrade(client, message);
        }
        else if (topic === 'outboundContractPositionInfo') {
            this.handlePosition(client, message);
        }
        else if ((topic === 'outboundAccountInfo') || (topic === 'outboundContractAccountInfo')) {
            this.handleBalance(client, message);
        }
    }
}

module.exports = hashkey;
