'use strict';

var blofin$1 = require('../blofin.js');
var errors = require('../base/errors.js');
var Cache = require('../base/ws/Cache.js');
var sha256 = require('../static_dependencies/noble-hashes/sha256.js');

//  ---------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
class blofin extends blofin$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'has': {
                'ws': true,
                'watchTrades': true,
                'watchTradesForSymbols': true,
                'watchOrderBook': true,
                'watchOrderBookForSymbols': true,
                'watchTicker': true,
                'watchTickers': true,
                'watchBidsAsks': true,
                'watchOHLCV': true,
                'watchOHLCVForSymbols': true,
                'watchOrders': true,
                'watchOrdersForSymbols': true,
                'watchPositions': true,
            },
            'urls': {
                'api': {
                    'ws': {
                        'swap': {
                            'public': 'wss://openapi.blofin.com/ws/public',
                            'private': 'wss://openapi.blofin.com/ws/private',
                        },
                    },
                },
            },
            'options': {
                'defaultType': 'swap',
                'tradesLimit': 1000,
                // orderbook channel can be one from:
                //  - "books": 200 depth levels will be pushed in the initial full snapshot. Incremental data will be pushed every 100 ms for the changes in the order book during that period of time.
                //  - "books5": 5 depth levels snapshot will be pushed every time. Snapshot data will be pushed every 100 ms when there are changes in the 5 depth levels snapshot.
                'watchOrderBook': {
                    'channel': 'books',
                },
                'watchOrderBookForSymbols': {
                    'channel': 'books',
                },
            },
            'streaming': {
                'ping': this.ping,
                'keepAlive': 25000, // 30 seconds max
            },
        });
    }
    ping(client) {
        return 'ping';
    }
    handlePong(client, message) {
        //
        //   'pong'
        //
        client.lastPong = this.milliseconds();
    }
    /**
     * @method
     * @name blofin#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://docs.blofin.com/index.html#ws-trades-channel
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async watchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        params['callerMethodName'] = 'watchTrades';
        return await this.watchTradesForSymbols([symbol], since, limit, params);
    }
    /**
     * @method
     * @name blofin#watchTradesForSymbols
     * @description get the list of most recent trades for a list of symbols
     * @see https://docs.blofin.com/index.html#ws-trades-channel
     * @param {string[]} symbols unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async watchTradesForSymbols(symbols, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const trades = await this.watchMultipleWrapper(true, 'trades', 'watchTradesForSymbols', symbols, params);
        if (this.newUpdates) {
            const firstMarket = this.safeDict(trades, 0);
            const firstSymbol = this.safeString(firstMarket, 'symbol');
            limit = trades.getLimit(firstSymbol, limit);
        }
        return this.filterBySinceLimit(trades, since, limit, 'timestamp', true);
    }
    handleTrades(client, message) {
        //
        //     {
        //       arg: {
        //         channel: "trades",
        //         instId: "DOGE-USDT",
        //       },
        //       data : [
        //         <same object as shown in REST example>,
        //         ...
        //       ]
        //     }
        //
        const arg = this.safeDict(message, 'arg');
        const channelName = this.safeString(arg, 'channel');
        const data = this.safeList(message, 'data');
        if (data === undefined) {
            return;
        }
        for (let i = 0; i < data.length; i++) {
            const rawTrade = data[i];
            const trade = this.parseWsTrade(rawTrade);
            const symbol = trade['symbol'];
            let stored = this.safeValue(this.trades, symbol);
            if (stored === undefined) {
                const limit = this.safeInteger(this.options, 'tradesLimit', 1000);
                stored = new Cache.ArrayCache(limit);
                this.trades[symbol] = stored;
            }
            stored.append(trade);
            const messageHash = channelName + ':' + symbol;
            client.resolve(stored, messageHash);
        }
    }
    parseWsTrade(trade, market = undefined) {
        return this.parseTrade(trade, market);
    }
    /**
     * @method
     * @name blofin#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.blofin.com/index.html#ws-order-book-channel
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBook(symbol, limit = undefined, params = {}) {
        params['callerMethodName'] = 'watchOrderBook';
        return await this.watchOrderBookForSymbols([symbol], limit, params);
    }
    /**
     * @method
     * @name blofin#watchOrderBookForSymbols
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.blofin.com/index.html#ws-order-book-channel
     * @param {string[]} symbols unified array of symbols
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.depth] the type of order book to subscribe to, default is 'depth/increase100', also accepts 'depth5' or 'depth20' or depth50
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBookForSymbols(symbols, limit = undefined, params = {}) {
        await this.loadMarkets();
        let callerMethodName = undefined;
        [callerMethodName, params] = this.handleParamString(params, 'callerMethodName', 'watchOrderBookForSymbols');
        let channelName = undefined;
        [channelName, params] = this.handleOptionAndParams(params, callerMethodName, 'channel', 'books');
        // due to some problem, temporarily disable other channels
        if (channelName !== 'books') {
            throw new errors.NotSupported(this.id + ' ' + callerMethodName + '() at this moment ' + channelName + ' is not supported, coming soon');
        }
        const orderbook = await this.watchMultipleWrapper(true, channelName, callerMethodName, symbols, params);
        return orderbook.limit();
    }
    handleOrderBook(client, message) {
        //
        //   {
        //     arg: {
        //         channel: "books",
        //         instId: "DOGE-USDT",
        //     },
        //     action: "snapshot", // can be 'snapshot' or 'update'
        //     data: {
        //         asks: [   [ 0.08096, 1 ], [ 0.08097, 123 ], ...   ],
        //         bids: [   [ 0.08095, 4 ], [ 0.08094, 237 ], ...   ],
        //         ts: "1707491587909",
        //         prevSeqId: "0", // in case of 'update' there will be some value, less then seqId
        //         seqId: "3374250786",
        //     },
        // }
        //
        const arg = this.safeDict(message, 'arg');
        const channelName = this.safeString(arg, 'channel');
        const data = this.safeDict(message, 'data');
        const marketId = this.safeString(arg, 'instId');
        const market = this.safeMarket(marketId);
        const symbol = market['symbol'];
        const messageHash = channelName + ':' + symbol;
        if (!(symbol in this.orderbooks)) {
            this.orderbooks[symbol] = this.orderBook();
        }
        const orderbook = this.orderbooks[symbol];
        const timestamp = this.safeInteger(data, 'ts');
        const action = this.safeString(message, 'action');
        if (action === 'snapshot') {
            const orderBookSnapshot = this.parseOrderBook(data, symbol, timestamp);
            orderBookSnapshot['nonce'] = this.safeInteger(data, 'seqId');
            orderbook.reset(orderBookSnapshot);
        }
        else {
            const asks = this.safeList(data, 'asks', []);
            const bids = this.safeList(data, 'bids', []);
            this.handleDeltasWithKeys(orderbook['asks'], asks);
            this.handleDeltasWithKeys(orderbook['bids'], bids);
            orderbook['timestamp'] = timestamp;
            orderbook['datetime'] = this.iso8601(timestamp);
        }
        this.orderbooks[symbol] = orderbook;
        client.resolve(orderbook, messageHash);
    }
    /**
     * @method
     * @name blofin#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.blofin.com/index.html#ws-tickers-channel
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTicker(symbol, params = {}) {
        params['callerMethodName'] = 'watchTicker';
        const market = this.market(symbol);
        symbol = market['symbol'];
        const result = await this.watchTickers([symbol], params);
        return result[symbol];
    }
    /**
     * @method
     * @name blofin#watchTickers
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://docs.blofin.com/index.html#ws-tickers-channel
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTickers(symbols = undefined, params = {}) {
        if (symbols === undefined) {
            throw new errors.NotSupported(this.id + ' watchTickers() requires a list of symbols');
        }
        const ticker = await this.watchMultipleWrapper(true, 'tickers', 'watchTickers', symbols, params);
        if (this.newUpdates) {
            const tickers = {};
            tickers[ticker['symbol']] = ticker;
            return tickers;
        }
        return this.filterByArray(this.tickers, 'symbol', symbols);
    }
    handleTicker(client, message) {
        //
        // message
        //
        //     {
        //         arg: {
        //             channel: "tickers",
        //             instId: "DOGE-USDT",
        //         },
        //         data: [
        //             <same object as shown in REST example>
        //         ],
        //     }
        //
        this.handleBidAsk(client, message);
        const arg = this.safeDict(message, 'arg');
        const channelName = this.safeString(arg, 'channel');
        const data = this.safeList(message, 'data');
        for (let i = 0; i < data.length; i++) {
            const ticker = this.parseWsTicker(data[i]);
            const symbol = ticker['symbol'];
            const messageHash = channelName + ':' + symbol;
            this.tickers[symbol] = ticker;
            client.resolve(this.tickers[symbol], messageHash);
        }
    }
    parseWsTicker(ticker, market = undefined) {
        return this.parseTicker(ticker, market);
    }
    /**
     * @method
     * @name blofin#watchBidsAsks
     * @description watches best bid & ask for symbols
     * @see https://docs.blofin.com/index.html#ws-tickers-channel
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchBidsAsks(symbols = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols, undefined, false);
        const firstMarket = this.market(symbols[0]);
        const channel = 'tickers';
        let marketType = undefined;
        [marketType, params] = this.handleMarketTypeAndParams('watchBidsAsks', firstMarket, params);
        const url = this.implodeHostname(this.urls['api']['ws'][marketType]['public']);
        const messageHashes = [];
        const args = [];
        for (let i = 0; i < symbols.length; i++) {
            const market = this.market(symbols[i]);
            messageHashes.push('bidask:' + market['symbol']);
            args.push({
                'channel': channel,
                'instId': market['id'],
            });
        }
        const request = this.getSubscriptionRequest(args);
        const ticker = await this.watchMultiple(url, messageHashes, this.deepExtend(request, params), messageHashes);
        if (this.newUpdates) {
            const tickers = {};
            tickers[ticker['symbol']] = ticker;
            return tickers;
        }
        return this.filterByArray(this.bidsasks, 'symbol', symbols);
    }
    handleBidAsk(client, message) {
        const data = this.safeList(message, 'data');
        for (let i = 0; i < data.length; i++) {
            const ticker = this.parseWsBidAsk(data[i]);
            const symbol = ticker['symbol'];
            const messageHash = 'bidask:' + symbol;
            this.bidsasks[symbol] = ticker;
            client.resolve(ticker, messageHash);
        }
    }
    parseWsBidAsk(ticker, market = undefined) {
        const marketId = this.safeString(ticker, 'instId');
        market = this.safeMarket(marketId, market, '-');
        const symbol = this.safeString(market, 'symbol');
        const timestamp = this.safeInteger(ticker, 'ts');
        return this.safeTicker({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'ask': this.safeString(ticker, 'askPrice'),
            'askVolume': this.safeString(ticker, 'askSize'),
            'bid': this.safeString(ticker, 'bidPrice'),
            'bidVolume': this.safeString(ticker, 'bidSize'),
            'info': ticker,
        }, market);
    }
    /**
     * @method
     * @name blofin#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async watchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        params['callerMethodName'] = 'watchOHLCV';
        const result = await this.watchOHLCVForSymbols([[symbol, timeframe]], since, limit, params);
        return result[symbol][timeframe];
    }
    /**
     * @method
     * @name blofin#watchOHLCVForSymbols
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://docs.blofin.com/index.html#ws-candlesticks-channel
     * @param {string[][]} symbolsAndTimeframes array of arrays containing unified symbols and timeframes to fetch OHLCV data for, example [['BTC/USDT', '1m'], ['LTC/USDT', '5m']]
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async watchOHLCVForSymbols(symbolsAndTimeframes, since = undefined, limit = undefined, params = {}) {
        const symbolsLength = symbolsAndTimeframes.length;
        if (symbolsLength === 0 || !Array.isArray(symbolsAndTimeframes[0])) {
            throw new errors.ArgumentsRequired(this.id + " watchOHLCVForSymbols() requires a an array of symbols and timeframes, like  [['BTC/USDT', '1m'], ['LTC/USDT', '5m']]");
        }
        await this.loadMarkets();
        const [symbol, timeframe, candles] = await this.watchMultipleWrapper(true, 'candle', 'watchOHLCVForSymbols', symbolsAndTimeframes, params);
        if (this.newUpdates) {
            limit = candles.getLimit(symbol, limit);
        }
        const filtered = this.filterBySinceLimit(candles, since, limit, 0, true);
        return this.createOHLCVObject(symbol, timeframe, filtered);
    }
    handleOHLCV(client, message) {
        //
        // message
        //
        //     {
        //         arg: {
        //             channel: "candle1m",
        //             instId: "DOGE-USDT",
        //         },
        //         data: [
        //             [ same object as shown in REST example ]
        //         ],
        //     }
        //
        const arg = this.safeDict(message, 'arg');
        const channelName = this.safeString(arg, 'channel');
        const data = this.safeList(message, 'data');
        const marketId = this.safeString(arg, 'instId');
        const market = this.safeMarket(marketId);
        const symbol = market['symbol'];
        const interval = channelName.replace('candle', '');
        const unifiedTimeframe = this.findTimeframe(interval);
        this.ohlcvs[symbol] = this.safeDict(this.ohlcvs, symbol, {});
        let stored = this.safeValue(this.ohlcvs[symbol], unifiedTimeframe);
        if (stored === undefined) {
            const limit = this.safeInteger(this.options, 'OHLCVLimit', 1000);
            stored = new Cache.ArrayCacheByTimestamp(limit);
            this.ohlcvs[symbol][unifiedTimeframe] = stored;
        }
        for (let i = 0; i < data.length; i++) {
            const candle = data[i];
            const parsed = this.parseOHLCV(candle, market);
            stored.append(parsed);
        }
        const resolveData = [symbol, unifiedTimeframe, stored];
        const messageHash = 'candle' + interval + ':' + symbol;
        client.resolve(resolveData, messageHash);
    }
    /**
     * @method
     * @name blofin#watchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://docs.blofin.com/index.html#ws-account-channel
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async watchBalance(params = {}) {
        await this.loadMarkets();
        await this.authenticate();
        let marketType = undefined;
        [marketType, params] = this.handleMarketTypeAndParams('watchBalance', undefined, params);
        if (marketType === 'spot') {
            throw new errors.NotSupported(this.id + ' watchBalance() is not supported for spot markets yet');
        }
        const messageHash = marketType + ':balance';
        const sub = {
            'channel': 'account',
        };
        const request = this.getSubscriptionRequest([sub]);
        const url = this.implodeHostname(this.urls['api']['ws'][marketType]['private']);
        return await this.watch(url, messageHash, this.deepExtend(request, params), messageHash);
    }
    handleBalance(client, message) {
        //
        //     {
        //         arg: {
        //           channel: "account",
        //         },
        //         data: <same object as shown in REST example>,
        //     }
        //
        const marketType = 'swap'; // for now
        if (!(marketType in this.balance)) {
            this.balance[marketType] = {};
        }
        this.balance[marketType] = this.parseWsBalance(message);
        const messageHash = marketType + ':balance';
        client.resolve(this.balance[marketType], messageHash);
    }
    parseWsBalance(message) {
        return this.parseBalance(message);
    }
    /**
     * @method
     * @name alpaca#watchOrders
     * @description watches information on multiple orders made by the user
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure
     */
    async watchOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        params['callerMethodName'] = 'watchOrders';
        const symbolsArray = (symbol !== undefined) ? [symbol] : [];
        return await this.watchOrdersForSymbols(symbolsArray, since, limit, params);
    }
    /**
     * @method
     * @name blofin#watchOrdersForSymbols
     * @description watches information on multiple orders made by the user across multiple symbols
     * @see https://docs.blofin.com/index.html#ws-order-channel
     * @param {string[]} symbols
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure
     */
    async watchOrdersForSymbols(symbols, since = undefined, limit = undefined, params = {}) {
        await this.authenticate();
        await this.loadMarkets();
        const orders = await this.watchMultipleWrapper(false, 'orders', 'watchOrdersForSymbols', symbols, params);
        if (this.newUpdates) {
            const first = this.safeValue(orders, 0);
            const tradeSymbol = this.safeString(first, 'symbol');
            limit = orders.getLimit(tradeSymbol, limit);
        }
        return this.filterBySinceLimit(orders, since, limit, 'timestamp', true);
    }
    handleOrders(client, message) {
        //
        //     {
        //         action: 'update',
        //         arg: { channel: 'orders' },
        //         data: [
        //           <same object as shown in REST example>
        //         ]
        //     }
        //
        if (this.orders === undefined) {
            const limit = this.safeInteger(this.options, 'ordersLimit', 1000);
            this.orders = new Cache.ArrayCacheBySymbolById(limit);
        }
        const orders = this.orders;
        const arg = this.safeDict(message, 'arg');
        const channelName = this.safeString(arg, 'channel');
        const data = this.safeList(message, 'data');
        for (let i = 0; i < data.length; i++) {
            const order = this.parseWsOrder(data[i]);
            const symbol = order['symbol'];
            const messageHash = channelName + ':' + symbol;
            orders.append(order);
            client.resolve(orders, messageHash);
            client.resolve(orders, channelName);
        }
    }
    parseWsOrder(order, market = undefined) {
        return this.parseOrder(order, market);
    }
    /**
     * @method
     * @name blofin#watchPositions
     * @see https://docs.blofin.com/index.html#ws-positions-channel
     * @description watch all open positions
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {int} [since] the earliest time in ms to fetch positions for
     * @param {int} [limit] the maximum number of positions to retrieve
     * @param {object} params extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
     */
    async watchPositions(symbols = undefined, since = undefined, limit = undefined, params = {}) {
        await this.authenticate();
        await this.loadMarkets();
        const newPositions = await this.watchMultipleWrapper(false, 'positions', 'watchPositions', symbols, params);
        if (this.newUpdates) {
            return newPositions;
        }
        return this.filterBySymbolsSinceLimit(this.positions, symbols, since, limit);
    }
    handlePositions(client, message) {
        //
        //     {
        //         arg: { channel: 'positions' },
        //         data: [
        //           <same object as shown in REST example>
        //         ]
        //     }
        //
        if (this.positions === undefined) {
            this.positions = new Cache.ArrayCacheBySymbolBySide();
        }
        const cache = this.positions;
        const arg = this.safeDict(message, 'arg');
        const channelName = this.safeString(arg, 'channel');
        const data = this.safeList(message, 'data');
        for (let i = 0; i < data.length; i++) {
            const position = this.parseWsPosition(data[i]);
            cache.append(position);
            const messageHash = channelName + ':' + position['symbol'];
            client.resolve(position, messageHash);
        }
    }
    parseWsPosition(position, market = undefined) {
        return this.parsePosition(position, market);
    }
    async watchMultipleWrapper(isPublic, channelName, callerMethodName, symbolsArray = undefined, params = {}) {
        // underlier method for all watch-multiple symbols
        await this.loadMarkets();
        [callerMethodName, params] = this.handleParamString(params, 'callerMethodName', callerMethodName);
        // if OHLCV method are being called, then symbols would be symbolsAndTimeframes (multi-dimensional) array
        const isOHLCV = (channelName === 'candle');
        let symbols = isOHLCV ? this.getListFromObjectValues(symbolsArray, 0) : symbolsArray;
        symbols = this.marketSymbols(symbols, undefined, true, true);
        let firstMarket = undefined;
        const firstSymbol = this.safeString(symbols, 0);
        if (firstSymbol !== undefined) {
            firstMarket = this.market(firstSymbol);
        }
        let marketType = undefined;
        [marketType, params] = this.handleMarketTypeAndParams(callerMethodName, firstMarket, params);
        if (marketType !== 'swap') {
            throw new errors.NotSupported(this.id + ' ' + callerMethodName + '() does not support ' + marketType + ' markets yet');
        }
        let rawSubscriptions = [];
        const messageHashes = [];
        if (symbols === undefined) {
            symbols = [];
        }
        const symbolsLength = symbols.length;
        if (symbolsLength > 0) {
            for (let i = 0; i < symbols.length; i++) {
                const current = symbols[i];
                let market = undefined;
                let channel = channelName;
                if (isOHLCV) {
                    market = this.market(current);
                    const tfArray = symbolsArray[i];
                    const tf = tfArray[1];
                    const interval = this.safeString(this.timeframes, tf, tf);
                    channel += interval;
                }
                else {
                    market = this.market(current);
                }
                const topic = {
                    'channel': channel,
                    'instId': market['id'],
                };
                rawSubscriptions.push(topic);
                messageHashes.push(channel + ':' + market['symbol']);
            }
        }
        else {
            rawSubscriptions.push({ 'channel': channelName });
            messageHashes.push(channelName);
        }
        // private channel are difference, they only need plural channel name for multiple symbols
        if (this.inArray(channelName, ['orders', 'positions'])) {
            rawSubscriptions = [{ 'channel': channelName }];
        }
        const request = this.getSubscriptionRequest(rawSubscriptions);
        const privateOrPublic = isPublic ? 'public' : 'private';
        const url = this.implodeHostname(this.urls['api']['ws'][marketType][privateOrPublic]);
        return await this.watchMultiple(url, messageHashes, this.deepExtend(request, params), messageHashes);
    }
    getSubscriptionRequest(args) {
        return {
            'op': 'subscribe',
            'args': args,
        };
    }
    handleMessage(client, message) {
        //
        // message examples
        //
        // {
        //   arg: {
        //     channel: "trades",
        //     instId: "DOGE-USDT",
        //   },
        //   event: "subscribe"
        // }
        //
        // incoming data updates' examples can be seen under each handler method
        //
        const methods = {
            // public
            'pong': this.handlePong,
            'trades': this.handleTrades,
            'books': this.handleOrderBook,
            'tickers': this.handleTicker,
            'candle': this.handleOHLCV,
            // private
            'account': this.handleBalance,
            'orders': this.handleOrders,
            'positions': this.handlePositions,
        };
        let method = undefined;
        if (message === 'pong') {
            method = this.safeValue(methods, 'pong');
        }
        else {
            const event = this.safeString(message, 'event');
            if (event === 'subscribe') {
                return;
            }
            else if (event === 'login') {
                const future = this.safeValue(client.futures, 'authenticate_hash');
                future.resolve(true);
                return;
            }
            else if (event === 'error') {
                throw new errors.ExchangeError(this.id + ' error: ' + this.json(message));
            }
            const arg = this.safeDict(message, 'arg');
            const channelName = this.safeString(arg, 'channel');
            method = this.safeValue(methods, channelName);
            if (!method && channelName.indexOf('candle') >= 0) {
                method = methods['candle'];
            }
        }
        if (method) {
            method.call(this, client, message);
        }
    }
    async authenticate(params = {}) {
        this.checkRequiredCredentials();
        const milliseconds = this.milliseconds();
        const messageHash = 'authenticate_hash';
        const timestamp = milliseconds.toString();
        const nonce = 'n_' + timestamp;
        const auth = '/users/self/verify' + 'GET' + timestamp + '' + nonce;
        const signature = this.stringToBase64(this.hmac(this.encode(auth), this.encode(this.secret), sha256.sha256));
        const request = {
            'op': 'login',
            'args': [
                {
                    'apiKey': this.apiKey,
                    'passphrase': this.password,
                    'timestamp': timestamp,
                    'nonce': nonce,
                    'sign': signature,
                },
            ],
        };
        const marketType = 'swap'; // for now
        const url = this.implodeHostname(this.urls['api']['ws'][marketType]['private']);
        await this.watch(url, messageHash, this.deepExtend(request, params), messageHash);
    }
}

module.exports = blofin;
