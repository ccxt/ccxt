'use strict';

var kucoinfutures$1 = require('../kucoinfutures.js');
var errors = require('../base/errors.js');
var Cache = require('../base/ws/Cache.js');

//  ---------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
class kucoinfutures extends kucoinfutures$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'has': {
                'ws': true,
                'watchTicker': true,
                'watchTickers': true,
                'watchBidsAsks': true,
                'watchTrades': true,
                'watchOrderBook': true,
                'watchOrders': true,
                'watchBalance': true,
                'watchPosition': true,
                'watchPositions': false,
                'watchPositionForSymbols': false,
                'watchTradesForSymbols': true,
                'watchOrderBookForSymbols': true,
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
                    'snapshotMaxRetries': 3,
                },
                'watchPosition': {
                    'fetchPositionSnapshot': true,
                    'awaitPositionSnapshot': true, // whether to wait for the position snapshot before providing updates
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
    async negotiate(privateChannel, params = {}) {
        const connectId = privateChannel ? 'private' : 'public';
        const urls = this.safeValue(this.options, 'urls', {});
        const spawaned = this.safeValue(urls, connectId);
        if (spawaned !== undefined) {
            return await spawaned;
        }
        // we store an awaitable to the url
        // so that multiple calls don't asynchronously
        // fetch different urls and overwrite each other
        urls[connectId] = this.spawn(this.negotiateHelper, privateChannel, params); // we have to wait here otherwsie in c# will not work
        this.options['urls'] = urls;
        const future = urls[connectId];
        return await future;
    }
    async negotiateHelper(privateChannel, params = {}) {
        let response = undefined;
        const connectId = privateChannel ? 'private' : 'public';
        try {
            if (privateChannel) {
                response = await this.futuresPrivatePostBulletPrivate(params);
                //
                //     {
                //         "code": "200000",
                //         "data": {
                //             "instanceServers": [
                //                 {
                //                     "pingInterval":  50000,
                //                     "endpoint": "wss://push-private.kucoin.com/endpoint",
                //                     "protocol": "websocket",
                //                     "encrypt": true,
                //                     "pingTimeout": 10000
                //                 }
                //             ],
                //             "token": "2neAiuYvAU61ZDXANAGAsiL4-iAExhsBXZxftpOeh_55i3Ysy2q2LEsEWU64mdzUOPusi34M_wGoSf7iNyEWJ1UQy47YbpY4zVdzilNP-Bj3iXzrjjGlWtiYB9J6i9GjsxUuhPw3BlrzazF6ghq4Lzf7scStOz3KkxjwpsOBCH4=.WNQmhZQeUKIkh97KYgU0Lg=="
                //         }
                //     }
                //
            }
            else {
                response = await this.futuresPublicPostBulletPublic(params);
            }
            const data = this.safeValue(response, 'data', {});
            const instanceServers = this.safeValue(data, 'instanceServers', []);
            const firstInstanceServer = this.safeValue(instanceServers, 0);
            const pingInterval = this.safeInteger(firstInstanceServer, 'pingInterval');
            const endpoint = this.safeString(firstInstanceServer, 'endpoint');
            const token = this.safeString(data, 'token');
            const result = endpoint + '?' + this.urlencode({
                'token': token,
                'privateChannel': privateChannel,
                'connectId': connectId,
            });
            const client = this.client(result);
            client.keepAlive = pingInterval;
            return result;
        }
        catch (e) {
            const future = this.safeValue(this.options['urls'], connectId);
            future.reject(e);
            delete this.options['urls'][connectId];
        }
        return undefined;
    }
    requestId() {
        const requestId = this.sum(this.safeInteger(this.options, 'requestId', 0), 1);
        this.options['requestId'] = requestId;
        return requestId;
    }
    async subscribe(url, messageHash, subscriptionHash, subscription, params = {}) {
        const requestId = this.requestId().toString();
        const request = {
            'id': requestId,
            'type': 'subscribe',
            'topic': subscriptionHash,
            'response': true,
        };
        const message = this.extend(request, params);
        const subscriptionRequest = {
            'id': requestId,
        };
        if (subscription === undefined) {
            subscription = subscriptionRequest;
        }
        else {
            subscription = this.extend(subscriptionRequest, subscription);
        }
        return await this.watch(url, messageHash, message, subscriptionHash, subscription);
    }
    async subscribeMultiple(url, messageHashes, topic, subscriptionHashes, subscriptionArgs, params = {}) {
        const requestId = this.requestId().toString();
        const request = {
            'id': requestId,
            'type': 'subscribe',
            'topic': topic,
            'response': true,
        };
        return await this.watchMultiple(url, messageHashes, this.extend(request, params), subscriptionHashes, subscriptionArgs);
    }
    async watchTicker(symbol, params = {}) {
        /**
         * @method
         * @name kucoinfutures#watchTicker
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://www.kucoin.com/docs/websocket/futures-trading/public-channels/get-ticker
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        symbol = market['symbol'];
        params['callerMethodName'] = 'watchTicker';
        const tickers = await this.watchTickers([symbol], params);
        return tickers[symbol];
    }
    async watchTickers(symbols = undefined, params = {}) {
        /**
         * @method
         * @name kucoinfutures#watchTickers
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
         * @param {string[]} symbols unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets();
        const ticker = await this.watchMultiRequest('watchTickers', '/contractMarket/ticker:', symbols, params);
        if (this.newUpdates) {
            const tickers = {};
            tickers[ticker['symbol']] = ticker;
            return tickers;
        }
        return this.filterByArray(this.tickers, 'symbol', symbols);
    }
    handleTicker(client, message) {
        //
        // ticker (v1)
        //
        //    {
        //     "subject": "ticker",
        //     "topic": "/contractMarket/ticker:XBTUSDM",
        //     "data": {
        //         "symbol": "XBTUSDM", //Market of the symbol
        //         "sequence": 45, //Sequence number which is used to judge the continuity of the pushed messages
        //         "side": "sell", //Transaction side of the last traded taker order
        //         "price": "3600.0", //Filled price
        //         "size": 16, //Filled quantity
        //         "tradeId": "5c9dcf4170744d6f5a3d32fb", //Order ID
        //         "bestBidSize": 795, //Best bid size
        //         "bestBidPrice": "3200.0", //Best bid
        //         "bestAskPrice": "3600.0", //Best ask size
        //         "bestAskSize": 284, //Best ask
        //         "ts": 1553846081210004941 //Filled time - nanosecond
        //     }
        //    }
        //
        const data = this.safeValue(message, 'data', {});
        const marketId = this.safeValue(data, 'symbol');
        const market = this.safeMarket(marketId, undefined, '-');
        const ticker = this.parseTicker(data, market);
        this.tickers[market['symbol']] = ticker;
        client.resolve(ticker, this.getMessageHash('ticker', market['symbol']));
    }
    async watchBidsAsks(symbols = undefined, params = {}) {
        /**
         * @method
         * @name kucoinfutures#watchBidsAsks
         * @see https://www.kucoin.com/docs/websocket/futures-trading/public-channels/get-ticker-v2
         * @description watches best bid & ask for symbols
         * @param {string[]} symbols unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        const ticker = await this.watchMultiRequest('watchBidsAsks', '/contractMarket/tickerV2:', symbols, params);
        if (this.newUpdates) {
            const tickers = {};
            tickers[ticker['symbol']] = ticker;
            return tickers;
        }
        return this.filterByArray(this.bidsasks, 'symbol', symbols);
    }
    async watchMultiRequest(methodName, channelName, symbols = undefined, params = {}) {
        await this.loadMarkets();
        [methodName, params] = this.handleParamString(params, 'callerMethodName', methodName);
        const isBidsAsks = (methodName === 'watchBidsAsks');
        symbols = this.marketSymbols(symbols, undefined, false, true, false);
        const length = symbols.length;
        if (length > 100) {
            throw new errors.ArgumentsRequired(this.id + ' ' + methodName + '() accepts a maximum of 100 symbols');
        }
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.market(symbol);
            const prefix = isBidsAsks ? 'bidask' : 'ticker';
            messageHashes.push(this.getMessageHash(prefix, market['symbol']));
        }
        const url = await this.negotiate(false);
        const marketIds = this.marketIds(symbols);
        const joined = marketIds.join(',');
        const requestId = this.requestId().toString();
        const request = {
            'id': requestId,
            'type': 'subscribe',
            'topic': channelName + joined,
            'response': true,
        };
        const subscription = {
            'id': requestId,
        };
        return await this.watchMultiple(url, messageHashes, this.extend(request, params), messageHashes, subscription);
    }
    handleBidAsk(client, message) {
        //
        // arrives one symbol dict
        //
        // {
        //   "subject": "tickerV2",
        //   "topic": "/contractMarket/tickerV2:XBTUSDM",
        //   "data": {
        //     "symbol": "XBTUSDM", //Market of the symbol
        //     "bestBidSize": 795, // Best bid size
        //     "bestBidPrice": 3200.0, // Best bid
        //     "bestAskPrice": 3600.0, // Best ask
        //     "bestAskSize": 284, // Best ask size
        //     "ts": 1553846081210004941 // Filled time - nanosecond
        //   }
        // }
        //
        const parsedTicker = this.parseWsBidAsk(message);
        const symbol = parsedTicker['symbol'];
        this.bidsasks[symbol] = parsedTicker;
        client.resolve(parsedTicker, this.getMessageHash('bidask', symbol));
    }
    parseWsBidAsk(ticker, market = undefined) {
        const data = this.safeDict(ticker, 'data', {});
        const marketId = this.safeString(data, 'symbol');
        market = this.safeMarket(marketId, market);
        const symbol = this.safeString(market, 'symbol');
        const timestamp = this.safeIntegerProduct(data, 'ts', 0.000001);
        return this.safeTicker({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'ask': this.safeNumber(data, 'bestAskPrice'),
            'askVolume': this.safeNumber(data, 'bestAskSize'),
            'bid': this.safeNumber(data, 'bestBidPrice'),
            'bidVolume': this.safeNumber(data, 'bestBidSize'),
            'info': ticker,
        }, market);
    }
    async watchPosition(symbol = undefined, params = {}) {
        /**
         * @method
         * @name kucoinfutures#watchPosition
         * @description watch open positions for a specific symbol
         * @see https://docs.kucoin.com/futures/#position-change-events
         * @param {string|undefined} symbol unified market symbol
         * @param {object} params extra parameters specific to the exchange API endpoint
         * @returns {object} a [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
         */
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' watchPosition() requires a symbol argument');
        }
        await this.loadMarkets();
        const url = await this.negotiate(true);
        const market = this.market(symbol);
        const topic = '/contract/position:' + market['id'];
        const request = {
            'privateChannel': true,
        };
        const messageHash = 'position:' + market['symbol'];
        const client = this.client(url);
        this.setPositionCache(client, symbol);
        const fetchPositionSnapshot = this.handleOption('watchPosition', 'fetchPositionSnapshot', true);
        const awaitPositionSnapshot = this.safeBool('watchPosition', 'awaitPositionSnapshot', true);
        const currentPosition = this.getCurrentPosition(symbol);
        if (fetchPositionSnapshot && awaitPositionSnapshot && currentPosition === undefined) {
            const snapshot = await client.future('fetchPositionSnapshot:' + symbol);
            return snapshot;
        }
        return await this.subscribe(url, messageHash, topic, undefined, this.extend(request, params));
    }
    getCurrentPosition(symbol) {
        if (this.positions === undefined) {
            return undefined;
        }
        const cache = this.positions.hashmap;
        const symbolCache = this.safeValue(cache, symbol, {});
        const values = Object.values(symbolCache);
        return this.safeValue(values, 0);
    }
    setPositionCache(client, symbol) {
        const fetchPositionSnapshot = this.handleOption('watchPosition', 'fetchPositionSnapshot', false);
        if (fetchPositionSnapshot) {
            const messageHash = 'fetchPositionSnapshot:' + symbol;
            if (!(messageHash in client.futures)) {
                client.future(messageHash);
                this.spawn(this.loadPositionSnapshot, client, messageHash, symbol);
            }
        }
    }
    async loadPositionSnapshot(client, messageHash, symbol) {
        const position = await this.fetchPosition(symbol);
        this.positions = new Cache.ArrayCacheBySymbolById();
        const cache = this.positions;
        cache.append(position);
        // don't remove the future from the .futures cache
        const future = client.futures[messageHash];
        future.resolve(cache);
        client.resolve(position, 'position:' + symbol);
    }
    handlePosition(client, message) {
        //
        // Position Changes Caused Operations
        //    {
        //        "type": "message",
        //        "userId": "5c32d69203aa676ce4b543c7", // Deprecated, will detele later
        //        "channelType": "private",
        //        "topic": "/contract/position:XBTUSDM",
        //        "subject": "position.change",
        //        "data": {
        //            "realisedGrossPnl": 0E-8, //Accumulated realised profit and loss
        //            "symbol": "XBTUSDM", //Symbol
        //            "crossMode": false, //Cross mode or not
        //            "liquidationPrice": 1000000.0, //Liquidation price
        //            "posLoss": 0E-8, //Manually added margin amount
        //            "avgEntryPrice": 7508.22, //Average entry price
        //            "unrealisedPnl": -0.00014735, //Unrealised profit and loss
        //            "markPrice": 7947.83, //Mark price
        //            "posMargin": 0.00266779, //Position margin
        //            "autoDeposit": false, //Auto deposit margin or not
        //            "riskLimit": 100000, //Risk limit
        //            "unrealisedCost": 0.00266375, //Unrealised value
        //            "posComm": 0.00000392, //Bankruptcy cost
        //            "posMaint": 0.00001724, //Maintenance margin
        //            "posCost": 0.00266375, //Position value
        //            "maintMarginReq": 0.005, //Maintenance margin rate
        //            "bankruptPrice": 1000000.0, //Bankruptcy price
        //            "realisedCost": 0.00000271, //Currently accumulated realised position value
        //            "markValue": 0.00251640, //Mark value
        //            "posInit": 0.00266375, //Position margin
        //            "realisedPnl": -0.00000253, //Realised profit and losts
        //            "maintMargin": 0.00252044, //Position margin
        //            "realLeverage": 1.06, //Leverage of the order
        //            "changeReason": "positionChange", //changeReason:marginChange、positionChange、liquidation、autoAppendMarginStatusChange、adl
        //            "currentCost": 0.00266375, //Current position value
        //            "openingTimestamp": 1558433191000, //Open time
        //            "currentQty": -20, //Current position
        //            "delevPercentage": 0.52, //ADL ranking percentile
        //            "currentComm": 0.00000271, //Current commission
        //            "realisedGrossCost": 0E-8, //Accumulated reliased gross profit value
        //            "isOpen": true, //Opened position or not
        //            "posCross": 1.2E-7, //Manually added margin
        //            "currentTimestamp": 1558506060394, //Current timestamp
        //            "unrealisedRoePcnt": -0.0553, //Rate of return on investment
        //            "unrealisedPnlPcnt": -0.0553, //Position profit and loss ratio
        //            "settleCurrency": "XBT" //Currency used to clear and settle the trades
        //        }
        //    }
        // Position Changes Caused by Mark Price
        //    {
        //        "userId": "5cd3f1a7b7ebc19ae9558591", // Deprecated, will detele later
        //        "topic": "/contract/position:XBTUSDM",
        //        "subject": "position.change",
        //          "data": {
        //              "markPrice": 7947.83,                   //Mark price
        //              "markValue": 0.00251640,                 //Mark value
        //              "maintMargin": 0.00252044,              //Position margin
        //              "realLeverage": 10.06,                   //Leverage of the order
        //              "unrealisedPnl": -0.00014735,           //Unrealised profit and lost
        //              "unrealisedRoePcnt": -0.0553,           //Rate of return on investment
        //              "unrealisedPnlPcnt": -0.0553,            //Position profit and loss ratio
        //              "delevPercentage": 0.52,             //ADL ranking percentile
        //              "currentTimestamp": 1558087175068,      //Current timestamp
        //              "settleCurrency": "XBT"                 //Currency used to clear and settle the trades
        //          }
        //    }
        //  Funding Settlement
        //    {
        //        "userId": "xbc453tg732eba53a88ggyt8c", // Deprecated, will detele later
        //        "topic": "/contract/position:XBTUSDM",
        //        "subject": "position.settlement",
        //        "data": {
        //            "fundingTime": 1551770400000,          //Funding time
        //            "qty": 100,                            //Position siz
        //            "markPrice": 3610.85,                 //Settlement price
        //            "fundingRate": -0.002966,             //Funding rate
        //            "fundingFee": -296,                   //Funding fees
        //            "ts": 1547697294838004923,             //Current time (nanosecond)
        //            "settleCurrency": "XBT"                //Currency used to clear and settle the trades
        //        }
        //    }
        // Adjustmet result of risk limit level
        //     {
        //         "userId": "xbc453tg732eba53a88ggyt8c",
        //         "topic": "/contract/position:ADAUSDTM",
        //         "subject": "position.adjustRiskLimit",
        //         "data": {
        //           "success": true, // Successful or not
        //           "riskLimitLevel": 1, // Current risk limit level
        //           "msg": "" // Failure reason
        //         }
        //     }
        //
        const topic = this.safeString(message, 'topic', '');
        const parts = topic.split(':');
        const marketId = this.safeString(parts, 1);
        const symbol = this.safeSymbol(marketId, undefined, '');
        const cache = this.positions;
        const currentPosition = this.getCurrentPosition(symbol);
        const messageHash = 'position:' + symbol;
        const data = this.safeValue(message, 'data', {});
        const newPosition = this.parsePosition(data);
        const keys = Object.keys(newPosition);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (newPosition[key] === undefined) {
                delete newPosition[key];
            }
        }
        const position = this.extend(currentPosition, newPosition);
        cache.append(position);
        client.resolve(position, messageHash);
    }
    async watchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name kucoinfutures#watchTrades
         * @description get the list of most recent trades for a particular symbol
         * @see https://docs.kucoin.com/futures/#execution-data
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum amount of trades to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
         */
        return await this.watchTradesForSymbols([symbol], since, limit, params);
    }
    async watchTradesForSymbols(symbols, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name kucoinfutures#watchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum amount of trades to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
         */
        const symbolsLength = symbols.length;
        if (symbolsLength === 0) {
            throw new errors.ArgumentsRequired(this.id + ' watchTradesForSymbols() requires a non-empty array of symbols');
        }
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols);
        const url = await this.negotiate(false);
        symbols = this.marketSymbols(symbols);
        const marketIds = this.marketIds(symbols);
        const topic = '/contractMarket/execution:' + marketIds.join(',');
        const subscriptionHashes = [];
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const marketId = marketIds[i];
            messageHashes.push('trades:' + symbol);
            subscriptionHashes.push('/contractMarket/execution:' + marketId);
        }
        const trades = await this.subscribeMultiple(url, messageHashes, topic, subscriptionHashes, undefined, params);
        if (this.newUpdates) {
            const first = this.safeValue(trades, 0);
            const tradeSymbol = this.safeString(first, 'symbol');
            limit = trades.getLimit(tradeSymbol, limit);
        }
        return this.filterBySinceLimit(trades, since, limit, 'timestamp', true);
    }
    handleTrade(client, message) {
        //
        //    {
        //        "type": "message",
        //        "topic": "/contractMarket/execution:ADAUSDTM",
        //        "subject": "match",
        //        "data": {
        //            "makerUserId": "62286a4d720edf0001e81961",
        //            "symbol": "ADAUSDTM",
        //            "sequence": 41320766,
        //            "side": "sell",
        //            "size": 2,
        //            "price": 0.35904,
        //            "takerOrderId": "636dd9da9857ba00010cfa44",
        //            "makerOrderId": "636dd9c8df149d0001e62bc8",
        //            "takerUserId": "6180be22b6ab210001fa3371",
        //            "tradeId": "636dd9da0000d400d477eca7",
        //            "ts": 1668143578987357700
        //        }
        //    }
        //
        const data = this.safeValue(message, 'data', {});
        const trade = this.parseTrade(data);
        const symbol = trade['symbol'];
        let trades = this.safeValue(this.trades, symbol);
        if (trades === undefined) {
            const limit = this.safeInteger(this.options, 'tradesLimit', 1000);
            trades = new Cache.ArrayCache(limit);
            this.trades[symbol] = trades;
        }
        trades.append(trade);
        const messageHash = 'trades:' + symbol;
        client.resolve(trades, messageHash);
        return message;
    }
    async watchOrderBook(symbol, limit = undefined, params = {}) {
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
         * @param {int} [limit] the maximum amount of order book entries to return
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        return await this.watchOrderBookForSymbols([symbol], limit, params);
    }
    async watchOrderBookForSymbols(symbols, limit = undefined, params = {}) {
        /**
         * @method
         * @name kucoinfutures#watchOrderBookForSymbols
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string[]} symbols unified array of symbols
         * @param {int} [limit] the maximum amount of order book entries to return
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        const symbolsLength = symbols.length;
        if (symbolsLength === 0) {
            throw new errors.ArgumentsRequired(this.id + ' watchOrderBookForSymbols() requires a non-empty array of symbols');
        }
        if (limit !== undefined) {
            if ((limit !== 20) && (limit !== 100)) {
                throw new errors.ExchangeError(this.id + " watchOrderBook 'limit' argument must be undefined, 20 or 100");
            }
        }
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols);
        const marketIds = this.marketIds(symbols);
        const url = await this.negotiate(false);
        const topic = '/contractMarket/level2:' + marketIds.join(',');
        const subscriptionArgs = {
            'limit': limit,
        };
        const subscriptionHashes = [];
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const marketId = marketIds[i];
            messageHashes.push('orderbook:' + symbol);
            subscriptionHashes.push('/contractMarket/level2:' + marketId);
        }
        const orderbook = await this.subscribeMultiple(url, messageHashes, topic, subscriptionHashes, subscriptionArgs, params);
        return orderbook.limit();
    }
    handleDelta(orderbook, delta) {
        orderbook['nonce'] = this.safeInteger(delta, 'sequence');
        const timestamp = this.safeInteger(delta, 'timestamp');
        orderbook['timestamp'] = timestamp;
        orderbook['datetime'] = this.iso8601(timestamp);
        const change = this.safeValue(delta, 'change', {});
        const splitChange = change.split(',');
        const price = this.safeNumber(splitChange, 0);
        const side = this.safeString(splitChange, 1);
        const quantity = this.safeNumber(splitChange, 2);
        const type = (side === 'buy') ? 'bids' : 'asks';
        const value = [price, quantity];
        if (type === 'bids') {
            const storedBids = orderbook['bids'];
            storedBids.storeArray(value);
        }
        else {
            const storedAsks = orderbook['asks'];
            storedAsks.storeArray(value);
        }
    }
    handleDeltas(bookside, deltas) {
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta(bookside, deltas[i]);
        }
    }
    handleOrderBook(client, message) {
        //
        // initial snapshot is fetched with ccxt's fetchOrderBook
        // the feed does not include a snapshot, just the deltas
        //
        //    {
        //        "type": "message",
        //        "topic": "/contractMarket/level2:ADAUSDTM",
        //        "subject": "level2",
        //        "data": {
        //            "sequence": 1668059586457,
        //            "change": "0.34172,sell,456", // type, side, quantity
        //            "timestamp": 1668573023223
        //        }
        //    }
        //
        const data = this.safeValue(message, 'data');
        const topic = this.safeString(message, 'topic');
        const topicParts = topic.split(':');
        const marketId = this.safeString(topicParts, 1);
        const symbol = this.safeSymbol(marketId, undefined, '-');
        const messageHash = 'orderbook:' + symbol;
        if (!(symbol in this.orderbooks)) {
            const subscriptionArgs = this.safeDict(client.subscriptions, topic, {});
            const limit = this.safeInteger(subscriptionArgs, 'limit');
            this.orderbooks[symbol] = this.orderBook({}, limit);
        }
        const storedOrderBook = this.orderbooks[symbol];
        const nonce = this.safeInteger(storedOrderBook, 'nonce');
        const deltaEnd = this.safeInteger(data, 'sequence');
        if (nonce === undefined) {
            const cacheLength = storedOrderBook.cache.length;
            const topicPartsNew = topic.split(':');
            const topicSymbol = this.safeString(topicPartsNew, 1);
            const topicChannel = this.safeString(topicPartsNew, 0);
            const subscriptions = Object.keys(client.subscriptions);
            let subscription = undefined;
            for (let i = 0; i < subscriptions.length; i++) {
                const key = subscriptions[i];
                if ((key.indexOf(topicSymbol) >= 0) && (key.indexOf(topicChannel) >= 0)) {
                    subscription = client.subscriptions[key];
                    break;
                }
            }
            const limit = this.safeInteger(subscription, 'limit');
            const snapshotDelay = this.handleOption('watchOrderBook', 'snapshotDelay', 5);
            if (cacheLength === snapshotDelay) {
                this.spawn(this.loadOrderBook, client, messageHash, symbol, limit, {});
            }
            storedOrderBook.cache.push(data);
            return;
        }
        else if (nonce >= deltaEnd) {
            return;
        }
        this.handleDelta(storedOrderBook, data);
        client.resolve(storedOrderBook, messageHash);
    }
    getCacheIndex(orderbook, cache) {
        const firstDelta = this.safeValue(cache, 0);
        const nonce = this.safeInteger(orderbook, 'nonce');
        const firstDeltaStart = this.safeInteger(firstDelta, 'sequence');
        if (nonce < firstDeltaStart - 1) {
            return -1;
        }
        for (let i = 0; i < cache.length; i++) {
            const delta = cache[i];
            const deltaStart = this.safeInteger(delta, 'sequence');
            if (nonce < deltaStart - 1) {
                return i;
            }
        }
        return cache.length;
    }
    handleSystemStatus(client, message) {
        //
        // todo: answer the question whether handleSystemStatus should be renamed
        // and unified as handleStatus for any usage pattern that
        // involves system status and maintenance updates
        //
        //     {
        //         "id": "1578090234088", // connectId
        //         "type": "welcome",
        //     }
        //
        return message;
    }
    async watchOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name kucoinfutures#watchOrders
         * @description watches information on multiple orders made by the user
         * @see https://docs.kucoin.com/futures/#trade-orders-according-to-the-market
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of order structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        const url = await this.negotiate(true);
        const topic = '/contractMarket/tradeOrders';
        const request = {
            'privateChannel': true,
        };
        let messageHash = 'orders';
        if (symbol !== undefined) {
            const market = this.market(symbol);
            symbol = market['symbol'];
            messageHash = messageHash + ':' + symbol;
        }
        const orders = await this.subscribe(url, messageHash, topic, undefined, this.extend(request, params));
        if (this.newUpdates) {
            limit = orders.getLimit(symbol, limit);
        }
        return this.filterBySymbolSinceLimit(orders, symbol, since, limit, true);
    }
    parseWsOrderStatus(status) {
        const statuses = {
            'open': 'open',
            'filled': 'closed',
            'match': 'open',
            'update': 'open',
            'canceled': 'canceled',
        };
        return this.safeString(statuses, status, status);
    }
    parseWsOrder(order, market = undefined) {
        //
        //         "symbol": "XCAD-USDT",
        //     {
        //         "orderType": "limit",
        //         "side": "buy",
        //         "orderId": "6249167327218b000135e749",
        //         "type": "canceled",
        //         "orderTime": 1648957043065280224,
        //         "size": "100.452",
        //         "filledSize": "0",
        //         "price": "2.9635",
        //         "clientOid": "buy-XCAD-USDT-1648957043010159",
        //         "remainSize": "0",
        //         "status": "done",
        //         "ts": 1648957054031001037
        //     }
        //
        const id = this.safeString(order, 'orderId');
        const clientOrderId = this.safeString(order, 'clientOid');
        const orderType = this.safeStringLower(order, 'orderType');
        const price = this.safeString(order, 'price');
        const filled = this.safeString(order, 'filledSize');
        const amount = this.safeString(order, 'size');
        const rawType = this.safeString(order, 'type');
        const status = this.parseWsOrderStatus(rawType);
        const timestamp = this.safeIntegerProduct(order, 'orderTime', 0.000001);
        const marketId = this.safeString(order, 'symbol');
        market = this.safeMarket(marketId, market);
        const symbol = market['symbol'];
        const side = this.safeStringLower(order, 'side');
        return this.safeOrder({
            'info': order,
            'symbol': symbol,
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
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
    handleOrder(client, message) {
        const messageHash = 'orders';
        const data = this.safeValue(message, 'data');
        const parsed = this.parseWsOrder(data);
        const symbol = this.safeString(parsed, 'symbol');
        const orderId = this.safeString(parsed, 'id');
        if (symbol !== undefined) {
            if (this.orders === undefined) {
                const limit = this.safeInteger(this.options, 'ordersLimit', 1000);
                this.orders = new Cache.ArrayCacheBySymbolById(limit);
            }
            const cachedOrders = this.orders;
            const orders = this.safeValue(cachedOrders.hashmap, symbol, {});
            const order = this.safeValue(orders, orderId);
            if (order !== undefined) {
                // todo add others to calculate average etc
                const stopPrice = this.safeValue(order, 'stopPrice');
                if (stopPrice !== undefined) {
                    parsed['stopPrice'] = stopPrice;
                }
                if (order['status'] === 'closed') {
                    parsed['status'] = 'closed';
                }
            }
            cachedOrders.append(parsed);
            client.resolve(this.orders, messageHash);
            const symbolSpecificMessageHash = messageHash + ':' + symbol;
            client.resolve(this.orders, symbolSpecificMessageHash);
        }
    }
    async watchBalance(params = {}) {
        /**
         * @method
         * @name kucoinfutures#watchBalance
         * @description watch balance and get the amount of funds available for trading or funds locked in orders
         * @see https://docs.kucoin.com/futures/#account-balance-events
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
         */
        await this.loadMarkets();
        const url = await this.negotiate(true);
        const topic = '/contractAccount/wallet';
        const request = {
            'privateChannel': true,
        };
        const subscription = {
            'method': this.handleBalanceSubscription,
        };
        const messageHash = 'balance';
        return await this.subscribe(url, messageHash, topic, subscription, this.extend(request, params));
    }
    handleBalance(client, message) {
        //
        //    {
        //        "id": "6375553193027a0001f6566f",
        //        "type": "message",
        //        "topic": "/contractAccount/wallet",
        //        "userId": "613a896885d8660006151f01",
        //        "channelType": "private",
        //        "subject": "availableBalance.change",
        //        "data": {
        //            "currency": "USDT",
        //            "holdBalance": "0.0000000000",
        //            "availableBalance": "14.0350281903",
        //            "timestamp": "1668633905657"
        //        }
        //    }
        //
        const data = this.safeValue(message, 'data', {});
        this.balance['info'] = data;
        const currencyId = this.safeString(data, 'currency');
        const code = this.safeCurrencyCode(currencyId);
        const account = this.account();
        account['free'] = this.safeString(data, 'availableBalance');
        account['used'] = this.safeString(data, 'holdBalance');
        this.balance[code] = account;
        this.balance = this.safeBalance(this.balance);
        client.resolve(this.balance, 'balance');
    }
    handleBalanceSubscription(client, message, subscription) {
        this.spawn(this.fetchBalanceSnapshot, client, message);
    }
    async fetchBalanceSnapshot(client, message) {
        await this.loadMarkets();
        this.checkRequiredCredentials();
        const messageHash = 'balance';
        const selectedType = this.safeString2(this.options, 'watchBalance', 'defaultType', 'swap'); // spot, margin, main, funding, future, mining, trade, contract, pool
        const params = {
            'type': selectedType,
        };
        const snapshot = await this.fetchBalance(params);
        //
        //    {
        //        "info": {
        //            "code": "200000",
        //            "data": {
        //                "accountEquity": 0.0350281903,
        //                "unrealisedPNL": 0,
        //                "marginBalance": 0.0350281903,
        //                "positionMargin": 0,
        //                "orderMargin": 0,
        //                "frozenFunds": 0,
        //                "availableBalance": 0.0350281903,
        //                "currency": "USDT"
        //            }
        //        },
        //        "timestamp": undefined,
        //        "datetime": undefined,
        //        "USDT": {
        //            "free": 0.0350281903,
        //            "used": 0,
        //            "total": 0.0350281903
        //        },
        //        "free": {
        //            "USDT": 0.0350281903
        //        },
        //        "used": {
        //            "USDT": 0
        //        },
        //        "total": {
        //            "USDT": 0.0350281903
        //        }
        //    }
        //
        const keys = Object.keys(snapshot);
        for (let i = 0; i < keys.length; i++) {
            const code = keys[i];
            if (code !== 'free' && code !== 'used' && code !== 'total' && code !== 'timestamp' && code !== 'datetime' && code !== 'info') {
                this.balance[code] = snapshot[code];
            }
        }
        this.balance['info'] = this.safeValue(snapshot, 'info', {});
        client.resolve(this.balance, messageHash);
    }
    handleSubject(client, message) {
        //
        //    {
        //        "type": "message",
        //        "topic": "/contractMarket/level2:ADAUSDTM",
        //        "subject": "level2",
        //        "data": {
        //            "sequence": 1668059586457,
        //            "change": "0.34172,sell,456", // type, side, quantity
        //            "timestamp": 1668573023223
        //        }
        //    }
        //
        const subject = this.safeString(message, 'subject');
        const methods = {
            'level2': this.handleOrderBook,
            'ticker': this.handleTicker,
            'tickerV2': this.handleBidAsk,
            'availableBalance.change': this.handleBalance,
            'match': this.handleTrade,
            'orderChange': this.handleOrder,
            'orderUpdated': this.handleOrder,
            'position.change': this.handlePosition,
            'position.settlement': this.handlePosition,
            'position.adjustRiskLimit': this.handlePosition,
        };
        const method = this.safeValue(methods, subject);
        if (method !== undefined) {
            method.call(this, client, message);
        }
    }
    getMessageHash(elementName, symbol = undefined) {
        // elementName can be 'ticker', 'bidask', ...
        if (symbol !== undefined) {
            return elementName + '@' + symbol;
        }
        else {
            return elementName + 's@all';
        }
    }
    ping(client) {
        // kucoin does not support built-in ws protocol-level ping-pong
        // instead it requires a custom json-based text ping-pong
        // https://docs.kucoin.com/#ping
        const id = this.requestId().toString();
        return {
            'id': id,
            'type': 'ping',
        };
    }
    handlePong(client, message) {
        // https://docs.kucoin.com/#ping
        client.lastPong = this.milliseconds();
        return message;
    }
    handleErrorMessage(client, message) {
        //
        //    {
        //        "id": "64d8732c856851144bded10d",
        //        "type": "error",
        //        "code": 401,
        //        "data": "token is expired"
        //    }
        //
        const data = this.safeString(message, 'data', '');
        if (data === 'token is expired') {
            let type = 'public';
            if (client.url.indexOf('connectId=private') >= 0) {
                type = 'private';
            }
            this.options['urls'][type] = undefined;
        }
        this.handleErrors(undefined, undefined, client.url, undefined, undefined, data, message, undefined, undefined);
    }
    handleMessage(client, message) {
        const type = this.safeString(message, 'type');
        const methods = {
            // 'heartbeat': this.handleHeartbeat,
            'welcome': this.handleSystemStatus,
            'message': this.handleSubject,
            'pong': this.handlePong,
            'error': this.handleErrorMessage,
        };
        const method = this.safeValue(methods, type);
        if (method !== undefined) {
            method.call(this, client, message);
        }
    }
}

module.exports = kucoinfutures;
