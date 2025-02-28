'use strict';

var bingx$1 = require('../bingx.js');
var errors = require('../base/errors.js');
var Cache = require('../base/ws/Cache.js');

// ----------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
class bingx extends bingx$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'has': {
                'ws': true,
                'watchTrades': true,
                'watchTradesForSymbols': false,
                'watchOrderBook': true,
                'watchOrderBookForSymbols': true,
                'watchOHLCV': true,
                'watchOHLCVForSymbols': true,
                'watchOrders': true,
                'watchMyTrades': true,
                'watchTicker': true,
                'watchTickers': true,
                'watchBalance': true,
            },
            'urls': {
                'api': {
                    'ws': {
                        'spot': 'wss://open-api-ws.bingx.com/market',
                        'linear': 'wss://open-api-swap.bingx.com/swap-market',
                        'inverse': 'wss://open-api-cswap-ws.bingx.com/market',
                    },
                },
            },
            'options': {
                'listenKeyRefreshRate': 3540000,
                'ws': {
                    'gunzip': true,
                },
                'swap': {
                    'timeframes': {
                        '1m': '1m',
                        '3m': '3m',
                        '5m': '5m',
                        '15m': '15m',
                        '30m': '30m',
                        '1h': '1h',
                        '2h': '2h',
                        '4h': '4h',
                        '6h': '6h',
                        '12h': '12h',
                        '1d': '1d',
                        '3d': '3d',
                        '1w': '1w',
                        '1M': '1M',
                    },
                },
                'spot': {
                    'timeframes': {
                        '1m': '1min',
                        '5m': '5min',
                        '15m': '15min',
                        '30m': '30min',
                        '1h': '60min',
                        '1d': '1day',
                    },
                },
                'watchBalance': {
                    'fetchBalanceSnapshot': true,
                    'awaitBalanceSnapshot': false, // whether to wait for the balance snapshot before providing updates
                },
                'watchOrderBook': {
                    'depth': 100,
                    'interval': 500, // 100, 200, 500, 1000
                },
                'watchOrderBookForSymbols': {
                    'depth': 100,
                    'interval': 500, // 100, 200, 500, 1000
                },
            },
            'streaming': {
                'keepAlive': 1800000, // 30 minutes
            },
        });
    }
    /**
     * @method
     * @name bingx#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://bingx-api.github.io/docs/#/en-us/spot/socket/market.html#Subscribe%20to%2024-hour%20Price%20Change
     * @see https://bingx-api.github.io/docs/#/en-us/swapV2/socket/market.html#Subscribe%20to%2024-hour%20price%20changes
     * @see https://bingx-api.github.io/docs/#/en-us/cswap/socket/market.html#Subscribe%20to%2024-Hour%20Price%20Change
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTicker(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        let marketType = undefined;
        let subType = undefined;
        let url = undefined;
        [marketType, params] = this.handleMarketTypeAndParams('watchTicker', market, params);
        [subType, params] = this.handleSubTypeAndParams('watchTicker', market, params, 'linear');
        if (marketType === 'swap') {
            url = this.safeString(this.urls['api']['ws'], subType);
        }
        else {
            url = this.safeString(this.urls['api']['ws'], marketType);
        }
        const subscriptionHash = market['id'] + '@ticker';
        const messageHash = this.getMessageHash('ticker', market['symbol']);
        const uuid = this.uuid();
        const request = {
            'id': uuid,
            'dataType': subscriptionHash,
        };
        if (marketType === 'swap') {
            request['reqType'] = 'sub';
        }
        return await this.watch(url, messageHash, this.extend(request, params), subscriptionHash);
    }
    handleTicker(client, message) {
        //
        // swap
        //
        //     {
        //         "code": 0,
        //         "dataType": "BTC-USDT@ticker",
        //         "data": {
        //             "e": "24hTicker",
        //             "E": 1706498923556,
        //             "s": "BTC-USDT",
        //             "p": "346.4",
        //             "P": "0.82",
        //             "c": "42432.5",
        //             "L": "0.0529",
        //             "h": "42855.4",
        //             "l": "41578.3",
        //             "v": "64310.9754",
        //             "q": "2728360284.15",
        //             "o": "42086.1",
        //             "O": 1706498922655,
        //             "C": 1706498883023,
        //             "A": "42437.8",
        //             "a": "1.4160",
        //             "B": "42437.1",
        //             "b": "2.5747"
        //         }
        //     }
        //
        // spot
        //
        //     {
        //         "code": 0,
        //         "timestamp": 1706506795473,
        //         "data": {
        //             "e": "24hTicker",
        //             "E": 1706506795472,
        //             "s": "BTC-USDT",
        //             "p": -372.12,
        //             "P": "-0.87%",
        //             "o": 42548.95,
        //             "h": 42696.1,
        //             "l": 41621.29,
        //             "c": 42176.83,
        //             "v": 4943.33,
        //             "q": 208842236.5,
        //             "O": 1706420395472,
        //             "C": 1706506795472,
        //             "A": 42177.23,
        //             "a": 5.14484,
        //             "B": 42176.38,
        //             "b": 5.36117
        //         }
        //     }
        //
        const data = this.safeValue(message, 'data', {});
        const marketId = this.safeString(data, 's');
        // const marketId = messageHash.split('@')[0];
        const isSwap = client.url.indexOf('swap') >= 0;
        const marketType = isSwap ? 'swap' : 'spot';
        const market = this.safeMarket(marketId, undefined, undefined, marketType);
        const symbol = market['symbol'];
        const ticker = this.parseWsTicker(data, market);
        this.tickers[symbol] = ticker;
        client.resolve(ticker, this.getMessageHash('ticker', symbol));
        if (this.safeString(message, 'dataType') === 'all@ticker') {
            client.resolve(ticker, this.getMessageHash('ticker'));
        }
    }
    parseWsTicker(message, market = undefined) {
        //
        //     {
        //         "e": "24hTicker",
        //         "E": 1706498923556,
        //         "s": "BTC-USDT",
        //         "p": "346.4",
        //         "P": "0.82",
        //         "c": "42432.5",
        //         "L": "0.0529",
        //         "h": "42855.4",
        //         "l": "41578.3",
        //         "v": "64310.9754",
        //         "q": "2728360284.15",
        //         "o": "42086.1",
        //         "O": 1706498922655,
        //         "C": 1706498883023,
        //         "A": "42437.8",
        //         "a": "1.4160",
        //         "B": "42437.1",
        //         "b": "2.5747"
        //     }
        //
        const timestamp = this.safeInteger(message, 'C');
        const marketId = this.safeString(message, 's');
        market = this.safeMarket(marketId, market);
        const close = this.safeString(message, 'c');
        return this.safeTicker({
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'high': this.safeString(message, 'h'),
            'low': this.safeString(message, 'l'),
            'bid': this.safeString(message, 'B'),
            'bidVolume': this.safeString(message, 'b'),
            'ask': this.safeString(message, 'A'),
            'askVolume': this.safeString(message, 'a'),
            'vwap': undefined,
            'open': this.safeString(message, 'o'),
            'close': close,
            'last': close,
            'previousClose': undefined,
            'change': this.safeString(message, 'p'),
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString(message, 'v'),
            'quoteVolume': this.safeString(message, 'q'),
            'info': message,
        }, market);
    }
    /**
     * @method
     * @name bingx#watchTickers
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://bingx-api.github.io/docs/#/en-us/swapV2/socket/market.html#Subscribe%20to%2024-hour%20price%20changes%20of%20all%20trading%20pairs
     * @param {string[]} symbols unified symbol of the market to watch the tickers for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTickers(symbols = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols, undefined, true, true, false);
        let firstMarket = undefined;
        let marketType = undefined;
        let subType = undefined;
        const symbolsDefined = (symbols !== undefined);
        if (symbolsDefined) {
            firstMarket = this.market(symbols[0]);
        }
        [marketType, params] = this.handleMarketTypeAndParams('watchTickers', firstMarket, params);
        [subType, params] = this.handleSubTypeAndParams('watchTickers', firstMarket, params, 'linear');
        if (marketType === 'spot') {
            throw new errors.NotSupported(this.id + ' watchTickers is not supported for spot markets yet');
        }
        if (subType === 'inverse') {
            throw new errors.NotSupported(this.id + ' watchTickers is not supported for inverse markets yet');
        }
        const messageHashes = [];
        const subscriptionHashes = ['all@ticker'];
        if (symbolsDefined) {
            for (let i = 0; i < symbols.length; i++) {
                const symbol = symbols[i];
                const market = this.market(symbol);
                messageHashes.push(this.getMessageHash('ticker', market['symbol']));
            }
        }
        else {
            messageHashes.push(this.getMessageHash('ticker'));
        }
        const url = this.safeString(this.urls['api']['ws'], subType);
        const uuid = this.uuid();
        const request = {
            'id': uuid,
            'dataType': 'all@ticker',
        };
        if (marketType === 'swap') {
            request['reqType'] = 'sub';
        }
        const result = await this.watchMultiple(url, messageHashes, this.deepExtend(request, params), subscriptionHashes);
        if (this.newUpdates) {
            const newDict = {};
            newDict[result['symbol']] = result;
            return newDict;
        }
        return this.tickers;
    }
    /**
     * @method
     * @name bingx#watchOrderBookForSymbols
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://bingx-api.github.io/docs/#/en-us/swapV2/socket/market.html#Subscribe%20Market%20Depth%20Data%20of%20all%20trading%20pairs
     * @param {string[]} symbols unified array of symbols
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBookForSymbols(symbols, limit = undefined, params = {}) {
        symbols = this.marketSymbols(symbols, undefined, true, true, false);
        let firstMarket = undefined;
        let marketType = undefined;
        let subType = undefined;
        const symbolsDefined = (symbols !== undefined);
        if (symbolsDefined) {
            firstMarket = this.market(symbols[0]);
        }
        [marketType, params] = this.handleMarketTypeAndParams('watchOrderBookForSymbols', firstMarket, params);
        [subType, params] = this.handleSubTypeAndParams('watchOrderBookForSymbols', firstMarket, params, 'linear');
        if (marketType === 'spot') {
            throw new errors.NotSupported(this.id + ' watchOrderBookForSymbols is not supported for spot markets yet');
        }
        if (subType === 'inverse') {
            throw new errors.NotSupported(this.id + ' watchOrderBookForSymbols is not supported for inverse markets yet');
        }
        limit = this.getOrderBookLimitByMarketType(marketType, limit);
        let interval = undefined;
        [interval, params] = this.handleOptionAndParams(params, 'watchOrderBookForSymbols', 'interval', 500);
        this.checkRequiredArgument('watchOrderBookForSymbols', interval, 'interval', [100, 200, 500, 1000]);
        const channelName = 'depth' + limit.toString() + '@' + interval.toString() + 'ms';
        const subscriptionHash = 'all@' + channelName;
        const messageHashes = [];
        if (symbolsDefined) {
            for (let i = 0; i < symbols.length; i++) {
                const symbol = symbols[i];
                const market = this.market(symbol);
                messageHashes.push(this.getMessageHash('orderbook', market['symbol']));
            }
        }
        else {
            messageHashes.push(this.getMessageHash('orderbook'));
        }
        const url = this.safeString(this.urls['api']['ws'], subType);
        const uuid = this.uuid();
        const request = {
            'id': uuid,
            'dataType': subscriptionHash,
        };
        if (marketType === 'swap') {
            request['reqType'] = 'sub';
        }
        const subscriptionArgs = {
            'symbols': symbols,
            'limit': limit,
            'interval': interval,
            'params': params,
        };
        const orderbook = await this.watchMultiple(url, messageHashes, this.deepExtend(request, params), [subscriptionHash], subscriptionArgs);
        return orderbook.limit();
    }
    /**
     * @method
     * @name bingx#watchOHLCVForSymbols
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://bingx-api.github.io/docs/#/en-us/swapV2/socket/market.html#Subscribe%20K-Line%20Data%20of%20all%20trading%20pairs
     * @param {string[][]} symbolsAndTimeframes array of arrays containing unified symbols and timeframes to fetch OHLCV data for, example [['BTC/USDT', '1m'], ['LTC/USDT', '5m']]
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async watchOHLCVForSymbols(symbolsAndTimeframes, since = undefined, limit = undefined, params = {}) {
        const symbolsLength = symbolsAndTimeframes.length;
        if (symbolsLength !== 0 && !Array.isArray(symbolsAndTimeframes[0])) {
            throw new errors.ArgumentsRequired(this.id + " watchOHLCVForSymbols() requires a an array like  [['BTC/USDT:USDT', '1m'], ['LTC/USDT:USDT', '5m']]");
        }
        await this.loadMarkets();
        const messageHashes = [];
        let marketType = undefined;
        let subType = undefined;
        let chosenTimeframe = undefined;
        let firstMarket = undefined;
        if (symbolsLength !== 0) {
            let symbols = this.getListFromObjectValues(symbolsAndTimeframes, 0);
            symbols = this.marketSymbols(symbols, undefined, true, true, false);
            firstMarket = this.market(symbols[0]);
        }
        [marketType, params] = this.handleMarketTypeAndParams('watchOHLCVForSymbols', firstMarket, params);
        [subType, params] = this.handleSubTypeAndParams('watchOHLCVForSymbols', firstMarket, params, 'linear');
        if (marketType === 'spot') {
            throw new errors.NotSupported(this.id + ' watchOHLCVForSymbols is not supported for spot markets yet');
        }
        if (subType === 'inverse') {
            throw new errors.NotSupported(this.id + ' watchOHLCVForSymbols is not supported for inverse markets yet');
        }
        const marketOptions = this.safeDict(this.options, marketType);
        const timeframes = this.safeDict(marketOptions, 'timeframes', {});
        for (let i = 0; i < symbolsAndTimeframes.length; i++) {
            const symbolAndTimeframe = symbolsAndTimeframes[i];
            const sym = symbolAndTimeframe[0];
            const tf = symbolAndTimeframe[1];
            const market = this.market(sym);
            const rawTimeframe = this.safeString(timeframes, tf, tf);
            if (chosenTimeframe === undefined) {
                chosenTimeframe = rawTimeframe;
            }
            else if (chosenTimeframe !== rawTimeframe) {
                throw new errors.BadRequest(this.id + ' watchOHLCVForSymbols requires all timeframes to be the same');
            }
            messageHashes.push(this.getMessageHash('ohlcv', market['symbol'], chosenTimeframe));
        }
        const subscriptionHash = 'all@kline_' + chosenTimeframe;
        const url = this.safeString(this.urls['api']['ws'], subType);
        const uuid = this.uuid();
        const request = {
            'id': uuid,
            'dataType': subscriptionHash,
        };
        if (marketType === 'swap') {
            request['reqType'] = 'sub';
        }
        const subscriptionArgs = {
            'limit': limit,
            'params': params,
        };
        const [symbol, timeframe, candles] = await this.watchMultiple(url, messageHashes, request, [subscriptionHash], subscriptionArgs);
        if (this.newUpdates) {
            limit = candles.getLimit(symbol, limit);
        }
        const filtered = this.filterBySinceLimit(candles, since, limit, 0, true);
        return this.createOHLCVObject(symbol, timeframe, filtered);
    }
    getOrderBookLimitByMarketType(marketType, limit = undefined) {
        if (limit === undefined) {
            limit = 100;
        }
        else {
            if (marketType === 'swap' || marketType === 'future') {
                limit = this.findNearestCeiling([5, 10, 20, 50, 100], limit);
            }
            else if (marketType === 'spot') {
                limit = this.findNearestCeiling([20, 100], limit);
            }
        }
        return limit;
    }
    getMessageHash(unifiedChannel, symbol = undefined, extra = undefined) {
        let hash = unifiedChannel;
        if (symbol !== undefined) {
            hash += '::' + symbol;
        }
        else {
            hash += 's'; // tickers, orderbooks, ohlcvs ...
        }
        if (extra !== undefined) {
            hash += '::' + extra;
        }
        return hash;
    }
    /**
     * @method
     * @name bingx#watchTrades
     * @description watches information on multiple trades made in a market
     * @see https://bingx-api.github.io/docs/#/spot/socket/market.html#Subscribe%20to%20tick-by-tick
     * @see https://bingx-api.github.io/docs/#/swapV2/socket/market.html#Subscribe%20the%20Latest%20Trade%20Detail
     * @see https://bingx-api.github.io/docs/#/en-us/cswap/socket/market.html#Subscription%20transaction%20by%20transaction
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async watchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        symbol = market['symbol'];
        let marketType = undefined;
        let subType = undefined;
        let url = undefined;
        [marketType, params] = this.handleMarketTypeAndParams('watchTrades', market, params);
        [subType, params] = this.handleSubTypeAndParams('watchTrades', market, params, 'linear');
        if (marketType === 'swap') {
            url = this.safeString(this.urls['api']['ws'], subType);
        }
        else {
            url = this.safeString(this.urls['api']['ws'], marketType);
        }
        const rawHash = market['id'] + '@trade';
        const messageHash = 'trade::' + symbol;
        const uuid = this.uuid();
        const request = {
            'id': uuid,
            'dataType': rawHash,
        };
        if (marketType === 'swap') {
            request['reqType'] = 'sub';
        }
        const trades = await this.watch(url, messageHash, this.extend(request, params), messageHash);
        if (this.newUpdates) {
            limit = trades.getLimit(symbol, limit);
        }
        return this.filterBySinceLimit(trades, since, limit, 'timestamp', true);
    }
    handleTrades(client, message) {
        //
        // spot: first snapshot
        //
        //    {
        //      "id": "d83b78ce-98be-4dc2-b847-12fe471b5bc5",
        //      "code": 0,
        //      "msg": "SUCCESS",
        //      "timestamp": 1690214699854
        //    }
        //
        // spot: subsequent updates
        //
        //     {
        //         "code": 0,
        //         "data": {
        //           "E": 1690214529432,
        //           "T": 1690214529386,
        //           "e": "trade",
        //           "m": true,
        //           "p": "29110.19",
        //           "q": "0.1868",
        //           "s": "BTC-USDT",
        //           "t": "57903921"
        //         },
        //         "dataType": "BTC-USDT@trade",
        //         "success": true
        //     }
        //
        // linear swap: first snapshot
        //
        //    {
        //        "id": "2aed93b1-6e1e-4038-aeba-f5eeaec2ca48",
        //        "code": 0,
        //        "msg": '',
        //        "dataType": '',
        //        "data": null
        //    }
        //
        // linear swap: subsequent updates
        //
        //    {
        //        "code": 0,
        //        "dataType": "BTC-USDT@trade",
        //        "data": [
        //            {
        //                "q": "0.0421",
        //                "p": "29023.5",
        //                "T": 1690221401344,
        //                "m": false,
        //                "s": "BTC-USDT"
        //            },
        //            ...
        //        ]
        //    }
        //
        // inverse swap: first snapshot
        //
        //     {
        //         "code": 0,
        //         "id": "a2e482ca-f71b-42f8-a83a-8ff85a713e64",
        //         "msg": "SUCCESS",
        //         "timestamp": 1722920589426
        //     }
        //
        // inverse swap: subsequent updates
        //
        //     {
        //         "code": 0,
        //         "dataType": "BTC-USD@trade",
        //         "data": {
        //             "e": "trade",
        //             "E": 1722920589665,
        //             "s": "BTC-USD",
        //             "t": "39125001",
        //             "p": "55360.0",
        //             "q": "1",
        //             "T": 1722920589582,
        //             "m": false
        //         }
        //     }
        //
        const data = this.safeValue(message, 'data', []);
        const rawHash = this.safeString(message, 'dataType');
        const marketId = rawHash.split('@')[0];
        const isSwap = client.url.indexOf('swap') >= 0;
        const marketType = isSwap ? 'swap' : 'spot';
        const market = this.safeMarket(marketId, undefined, undefined, marketType);
        const symbol = market['symbol'];
        const messageHash = 'trade::' + symbol;
        let trades = undefined;
        if (Array.isArray(data)) {
            trades = this.parseTrades(data, market);
        }
        else {
            trades = [this.parseTrade(data, market)];
        }
        let stored = this.safeValue(this.trades, symbol);
        if (stored === undefined) {
            const limit = this.safeInteger(this.options, 'tradesLimit', 1000);
            stored = new Cache.ArrayCache(limit);
            this.trades[symbol] = stored;
        }
        for (let j = 0; j < trades.length; j++) {
            stored.append(trades[j]);
        }
        client.resolve(stored, messageHash);
    }
    /**
     * @method
     * @name bingx#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://bingx-api.github.io/docs/#/en-us/spot/socket/market.html#Subscribe%20Market%20Depth%20Data
     * @see https://bingx-api.github.io/docs/#/en-us/swapV2/socket/market.html#Subscribe%20Market%20Depth%20Data
     * @see https://bingx-api.github.io/docs/#/en-us/cswap/socket/market.html#Subscribe%20to%20Limited%20Depth
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBook(symbol, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        let marketType = undefined;
        let subType = undefined;
        let url = undefined;
        [marketType, params] = this.handleMarketTypeAndParams('watchOrderBook', market, params);
        [subType, params] = this.handleSubTypeAndParams('watchOrderBook', market, params, 'linear');
        if (marketType === 'swap') {
            url = this.safeString(this.urls['api']['ws'], subType);
        }
        else {
            url = this.safeString(this.urls['api']['ws'], marketType);
        }
        limit = this.getOrderBookLimitByMarketType(marketType, limit);
        let channelName = 'depth' + limit.toString();
        let interval = undefined;
        if (marketType !== 'spot') {
            if (!market['inverse']) {
                [interval, params] = this.handleOptionAndParams(params, 'watchOrderBook', 'interval', 500);
                this.checkRequiredArgument('watchOrderBook', interval, 'interval', [100, 200, 500, 1000]);
                channelName = channelName + '@' + interval.toString() + 'ms';
            }
        }
        const subscriptionHash = market['id'] + '@' + channelName;
        const messageHash = this.getMessageHash('orderbook', market['symbol']);
        const uuid = this.uuid();
        const request = {
            'id': uuid,
            'dataType': subscriptionHash,
        };
        if (marketType === 'swap') {
            request['reqType'] = 'sub';
        }
        let subscriptionArgs = {};
        if (market['inverse']) {
            subscriptionArgs = {
                'count': limit,
                'params': params,
            };
        }
        else {
            subscriptionArgs = {
                'level': limit,
                'interval': interval,
                'params': params,
            };
        }
        const orderbook = await this.watch(url, messageHash, this.deepExtend(request, params), subscriptionHash, subscriptionArgs);
        return orderbook.limit();
    }
    handleDelta(bookside, delta) {
        const price = this.safeFloat2(delta, 0, 'p');
        const amount = this.safeFloat2(delta, 1, 'a');
        bookside.store(price, amount);
    }
    handleOrderBook(client, message) {
        //
        // spot
        //
        //    {
        //        "code": 0,
        //        "dataType": "BTC-USDT@depth20",
        //        "data": {
        //          "bids": [
        //            [ '28852.9', "34.2621" ],
        //            ...
        //          ],
        //          "asks": [
        //            [ '28864.9', "23.4079" ],
        //            ...
        //          ]
        //        },
        //        "dataType": "BTC-USDT@depth20",
        //        "success": true
        //    }
        //
        // linear swap
        //
        //    {
        //        "code": 0,
        //        "dataType": "BTC-USDT@depth20@100ms", //or "all@depth20@100ms"
        //        "data": {
        //          "bids": [
        //            [ '28852.9', "34.2621" ],
        //            ...
        //          ],
        //          "asks": [
        //            [ '28864.9', "23.4079" ],
        //            ...
        //          ],
        //          "symbol": "BTC-USDT", // this key exists only in "all" subscription
        //        }
        //    }
        //
        // inverse swap
        //
        //     {
        //         "code": 0,
        //         "dataType": "BTC-USD@depth100",
        //         "data": {
        //             {
        //                 "symbol": "BTC-USD",
        //                 "bids": [
        //                     { "p": "58074.2", "a": "1.422318", "v": "826.0" },
        //                     ...
        //                 ],
        //                 "asks": [
        //                     { "p": "62878.0", "a": "0.001590", "v": "1.0" },
        //                     ...
        //                 ],
        //                 "aggPrecision": "0.1",
        //                 "timestamp": 1723705093529
        //             }
        //         }
        //     }
        //
        const data = this.safeDict(message, 'data', {});
        const dataType = this.safeString(message, 'dataType');
        const parts = dataType.split('@');
        const firstPart = parts[0];
        const isAllEndpoint = (firstPart === 'all');
        const marketId = this.safeString(data, 'symbol', firstPart);
        const isSwap = client.url.indexOf('swap') >= 0;
        const marketType = isSwap ? 'swap' : 'spot';
        const market = this.safeMarket(marketId, undefined, undefined, marketType);
        const symbol = market['symbol'];
        if (this.safeValue(this.orderbooks, symbol) === undefined) {
            // const limit = [ 5, 10, 20, 50, 100 ]
            const subscriptionHash = dataType;
            const subscription = client.subscriptions[subscriptionHash];
            const limit = this.safeInteger(subscription, 'limit');
            this.orderbooks[symbol] = this.orderBook({}, limit);
        }
        const orderbook = this.orderbooks[symbol];
        let snapshot = undefined;
        if (market['inverse']) {
            snapshot = this.parseOrderBook(data, symbol, undefined, 'bids', 'asks', 'p', 'a');
        }
        else {
            snapshot = this.parseOrderBook(data, symbol, undefined, 'bids', 'asks', 0, 1);
        }
        orderbook.reset(snapshot);
        this.orderbooks[symbol] = orderbook;
        const messageHash = this.getMessageHash('orderbook', symbol);
        client.resolve(orderbook, messageHash);
        // resolve for "all"
        if (isAllEndpoint) {
            const messageHashForAll = this.getMessageHash('orderbook');
            client.resolve(orderbook, messageHashForAll);
        }
    }
    parseWsOHLCV(ohlcv, market = undefined) {
        //
        //    {
        //        "c": "28909.0",
        //        "o": "28915.4",
        //        "h": "28915.4",
        //        "l": "28896.1",
        //        "v": "27.6919",
        //        "T": 1696687499999,
        //        "t": 1696687440000
        //    }
        //
        // for spot, opening-time (t) is used instead of closing-time (T), to be compatible with fetchOHLCV
        // for linear swap, (T) is the opening time
        let timestamp = (market['spot']) ? 't' : 'T';
        if (market['swap']) {
            timestamp = (market['inverse']) ? 't' : 'T';
        }
        return [
            this.safeInteger(ohlcv, timestamp),
            this.safeNumber(ohlcv, 'o'),
            this.safeNumber(ohlcv, 'h'),
            this.safeNumber(ohlcv, 'l'),
            this.safeNumber(ohlcv, 'c'),
            this.safeNumber(ohlcv, 'v'),
        ];
    }
    handleOHLCV(client, message) {
        //
        // spot:
        //
        //   {
        //       "code": 0,
        //       "data": {
        //         "E": 1696687498608,
        //         "K": {
        //           "T": 1696687499999,
        //           "c": "27917.829",
        //           "h": "27918.427",
        //           "i": "1min",
        //           "l": "27917.7",
        //           "n": 262,
        //           "o": "27917.91",
        //           "q": "25715.359197",
        //           "s": "BTC-USDT",
        //           "t": 1696687440000,
        //           "v": "0.921100"
        //         },
        //         "e": "kline",
        //         "s": "BTC-USDT"
        //       },
        //       "dataType": "BTC-USDT@kline_1min",
        //       "success": true
        //   }
        //
        // linear swap:
        //
        //    {
        //        "code": 0,
        //        "dataType": "BTC-USDT@kline_1m",
        //        "s": "BTC-USDT",
        //        "data": [
        //            {
        //            "c": "28909.0",
        //            "o": "28915.4",
        //            "h": "28915.4",
        //            "l": "28896.1",
        //            "v": "27.6919",
        //            "T": 1690907580000
        //            }
        //        ]
        //    }
        //
        // inverse swap:
        //
        //     {
        //         "code": 0,
        //         "timestamp": 1723769354547,
        //         "dataType": "BTC-USD@kline_1m",
        //         "data": {
        //             "t": 1723769340000,
        //             "o": 57485.1,
        //             "c": 57468,
        //             "l": 57464.9,
        //             "h": 57485.1,
        //             "a": 0.189663,
        //             "v": 109,
        //             "u": 92,
        //             "s": "BTC-USD"
        //         }
        //     }
        //
        const isSwap = client.url.indexOf('swap') >= 0;
        const dataType = this.safeString(message, 'dataType');
        const parts = dataType.split('@');
        const firstPart = parts[0];
        const isAllEndpoint = (firstPart === 'all');
        const marketId = this.safeString(message, 's', firstPart);
        const marketType = isSwap ? 'swap' : 'spot';
        const market = this.safeMarket(marketId, undefined, undefined, marketType);
        let candles = undefined;
        if (isSwap) {
            if (market['inverse']) {
                candles = [this.safeDict(message, 'data', {})];
            }
            else {
                candles = this.safeList(message, 'data', []);
            }
        }
        else {
            const data = this.safeDict(message, 'data', {});
            candles = [this.safeDict(data, 'K', {})];
        }
        const symbol = market['symbol'];
        this.ohlcvs[symbol] = this.safeValue(this.ohlcvs, symbol, {});
        const rawTimeframe = dataType.split('_')[1];
        const marketOptions = this.safeDict(this.options, marketType);
        const timeframes = this.safeDict(marketOptions, 'timeframes', {});
        const unifiedTimeframe = this.findTimeframe(rawTimeframe, timeframes);
        if (this.safeValue(this.ohlcvs[symbol], rawTimeframe) === undefined) {
            const subscriptionHash = dataType;
            const subscription = client.subscriptions[subscriptionHash];
            const limit = this.safeInteger(subscription, 'limit');
            this.ohlcvs[symbol][unifiedTimeframe] = new Cache.ArrayCacheByTimestamp(limit);
        }
        const stored = this.ohlcvs[symbol][unifiedTimeframe];
        for (let i = 0; i < candles.length; i++) {
            const candle = candles[i];
            const parsed = this.parseWsOHLCV(candle, market);
            stored.append(parsed);
        }
        const resolveData = [symbol, unifiedTimeframe, stored];
        const messageHash = this.getMessageHash('ohlcv', symbol, unifiedTimeframe);
        client.resolve(resolveData, messageHash);
        // resolve for "all"
        if (isAllEndpoint) {
            const messageHashForAll = this.getMessageHash('ohlcv', undefined, unifiedTimeframe);
            client.resolve(resolveData, messageHashForAll);
        }
    }
    /**
     * @method
     * @name bingx#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://bingx-api.github.io/docs/#/en-us/spot/socket/market.html#K-line%20Streams
     * @see https://bingx-api.github.io/docs/#/en-us/swapV2/socket/market.html#Subscribe%20K-Line%20Data
     * @see https://bingx-api.github.io/docs/#/en-us/cswap/socket/market.html#Subscribe%20to%20Latest%20Trading%20Pair%20K-Line
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async watchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        let marketType = undefined;
        let subType = undefined;
        let url = undefined;
        [marketType, params] = this.handleMarketTypeAndParams('watchOHLCV', market, params);
        [subType, params] = this.handleSubTypeAndParams('watchOHLCV', market, params, 'linear');
        if (marketType === 'swap') {
            url = this.safeString(this.urls['api']['ws'], subType);
        }
        else {
            url = this.safeString(this.urls['api']['ws'], marketType);
        }
        if (url === undefined) {
            throw new errors.BadRequest(this.id + ' watchOHLCV is not supported for ' + marketType + ' markets.');
        }
        const options = this.safeValue(this.options, marketType, {});
        const timeframes = this.safeValue(options, 'timeframes', {});
        const rawTimeframe = this.safeString(timeframes, timeframe, timeframe);
        const messageHash = this.getMessageHash('ohlcv', market['symbol'], timeframe);
        const subscriptionHash = market['id'] + '@kline_' + rawTimeframe;
        const uuid = this.uuid();
        const request = {
            'id': uuid,
            'dataType': subscriptionHash,
        };
        if (marketType === 'swap') {
            request['reqType'] = 'sub';
        }
        const subscriptionArgs = {
            'interval': rawTimeframe,
            'params': params,
        };
        const result = await this.watch(url, messageHash, this.extend(request, params), subscriptionHash, subscriptionArgs);
        const ohlcv = result[2];
        if (this.newUpdates) {
            limit = ohlcv.getLimit(symbol, limit);
        }
        return this.filterBySinceLimit(ohlcv, since, limit, 0, true);
    }
    /**
     * @method
     * @name bingx#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://bingx-api.github.io/docs/#/en-us/spot/socket/account.html#Subscription%20order%20update%20data
     * @see https://bingx-api.github.io/docs/#/en-us/swapV2/socket/account.html#Order%20update%20push
     * @see https://bingx-api.github.io/docs/#/en-us/cswap/socket/account.html#Order%20update%20push
     * @param {string} [symbol] unified market symbol of the market orders are made in
     * @param {int} [since] the earliest time in ms to watch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async watchOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        await this.authenticate();
        let type = undefined;
        let subType = undefined;
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            symbol = market['symbol'];
        }
        [type, params] = this.handleMarketTypeAndParams('watchOrders', market, params);
        [subType, params] = this.handleSubTypeAndParams('watchOrders', market, params, 'linear');
        const isSpot = (type === 'spot');
        const spotHash = 'spot:private';
        const swapHash = 'swap:private';
        const subscriptionHash = isSpot ? spotHash : swapHash;
        const spotMessageHash = 'spot:order';
        const swapMessageHash = 'swap:order';
        let messageHash = isSpot ? spotMessageHash : swapMessageHash;
        if (market !== undefined) {
            messageHash += ':' + symbol;
        }
        const uuid = this.uuid();
        let baseUrl = undefined;
        let request = undefined;
        if (type === 'swap') {
            if (subType === 'inverse') {
                throw new errors.NotSupported(this.id + ' watchOrders is not supported for inverse swap markets yet');
            }
            baseUrl = this.safeString(this.urls['api']['ws'], subType);
        }
        else {
            baseUrl = this.safeString(this.urls['api']['ws'], type);
            request = {
                'id': uuid,
                'reqType': 'sub',
                'dataType': 'spot.executionReport',
            };
        }
        const url = baseUrl + '?listenKey=' + this.options['listenKey'];
        const orders = await this.watch(url, messageHash, request, subscriptionHash);
        if (this.newUpdates) {
            limit = orders.getLimit(symbol, limit);
        }
        return this.filterBySymbolSinceLimit(orders, symbol, since, limit, true);
    }
    /**
     * @method
     * @name bingx#watchMyTrades
     * @description watches information on multiple trades made by the user
     * @see https://bingx-api.github.io/docs/#/en-us/spot/socket/account.html#Subscription%20order%20update%20data
     * @see https://bingx-api.github.io/docs/#/en-us/swapV2/socket/account.html#Order%20update%20push
     * @see https://bingx-api.github.io/docs/#/en-us/cswap/socket/account.html#Order%20update%20push
     * @param {string} [symbol] unified market symbol of the market the trades are made in
     * @param {int} [since] the earliest time in ms to watch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async watchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        await this.authenticate();
        let type = undefined;
        let subType = undefined;
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            symbol = market['symbol'];
        }
        [type, params] = this.handleMarketTypeAndParams('watchMyTrades', market, params);
        [subType, params] = this.handleSubTypeAndParams('watchMyTrades', market, params, 'linear');
        const isSpot = (type === 'spot');
        const spotHash = 'spot:private';
        const swapHash = 'swap:private';
        const subscriptionHash = isSpot ? spotHash : swapHash;
        const spotMessageHash = 'spot:mytrades';
        const swapMessageHash = 'swap:mytrades';
        let messageHash = isSpot ? spotMessageHash : swapMessageHash;
        if (market !== undefined) {
            messageHash += ':' + symbol;
        }
        const uuid = this.uuid();
        let baseUrl = undefined;
        let request = undefined;
        if (type === 'swap') {
            if (subType === 'inverse') {
                throw new errors.NotSupported(this.id + ' watchMyTrades is not supported for inverse swap markets yet');
            }
            baseUrl = this.safeString(this.urls['api']['ws'], subType);
        }
        else {
            baseUrl = this.safeString(this.urls['api']['ws'], type);
            request = {
                'id': uuid,
                'reqType': 'sub',
                'dataType': 'spot.executionReport',
            };
        }
        const url = baseUrl + '?listenKey=' + this.options['listenKey'];
        const trades = await this.watch(url, messageHash, request, subscriptionHash);
        if (this.newUpdates) {
            limit = trades.getLimit(symbol, limit);
        }
        return this.filterBySymbolSinceLimit(trades, symbol, since, limit, true);
    }
    /**
     * @method
     * @name bingx#watchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://bingx-api.github.io/docs/#/en-us/spot/socket/account.html#Subscription%20account%20balance%20push
     * @see https://bingx-api.github.io/docs/#/en-us/swapV2/socket/account.html#Account%20balance%20and%20position%20update%20push
     * @see https://bingx-api.github.io/docs/#/en-us/cswap/socket/account.html#Account%20balance%20and%20position%20update%20push
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async watchBalance(params = {}) {
        await this.loadMarkets();
        await this.authenticate();
        let type = undefined;
        let subType = undefined;
        [type, params] = this.handleMarketTypeAndParams('watchBalance', undefined, params);
        [subType, params] = this.handleSubTypeAndParams('watchBalance', undefined, params, 'linear');
        const isSpot = (type === 'spot');
        const spotSubHash = 'spot:balance';
        const swapSubHash = 'swap:private';
        const spotMessageHash = 'spot:balance';
        const swapMessageHash = 'swap:balance';
        const messageHash = isSpot ? spotMessageHash : swapMessageHash;
        const subscriptionHash = isSpot ? spotSubHash : swapSubHash;
        let request = undefined;
        let baseUrl = undefined;
        const uuid = this.uuid();
        if (type === 'swap') {
            if (subType === 'inverse') {
                throw new errors.NotSupported(this.id + ' watchBalance is not supported for inverse swap markets yet');
            }
            baseUrl = this.safeString(this.urls['api']['ws'], subType);
        }
        else {
            baseUrl = this.safeString(this.urls['api']['ws'], type);
            request = {
                'id': uuid,
                'dataType': 'ACCOUNT_UPDATE',
            };
        }
        const url = baseUrl + '?listenKey=' + this.options['listenKey'];
        const client = this.client(url);
        this.setBalanceCache(client, type, subType, subscriptionHash, params);
        let fetchBalanceSnapshot = undefined;
        let awaitBalanceSnapshot = undefined;
        [fetchBalanceSnapshot, params] = this.handleOptionAndParams(params, 'watchBalance', 'fetchBalanceSnapshot', true);
        [awaitBalanceSnapshot, params] = this.handleOptionAndParams(params, 'watchBalance', 'awaitBalanceSnapshot', false);
        if (fetchBalanceSnapshot && awaitBalanceSnapshot) {
            await client.future(type + ':fetchBalanceSnapshot');
        }
        return await this.watch(url, messageHash, request, subscriptionHash);
    }
    setBalanceCache(client, type, subType, subscriptionHash, params) {
        if (subscriptionHash in client.subscriptions) {
            return;
        }
        const fetchBalanceSnapshot = this.handleOptionAndParams(params, 'watchBalance', 'fetchBalanceSnapshot', true);
        if (fetchBalanceSnapshot) {
            const messageHash = type + ':fetchBalanceSnapshot';
            if (!(messageHash in client.futures)) {
                client.future(messageHash);
                this.spawn(this.loadBalanceSnapshot, client, messageHash, type, subType);
            }
        }
        else {
            this.balance[type] = {};
        }
    }
    async loadBalanceSnapshot(client, messageHash, type, subType) {
        const response = await this.fetchBalance({ 'type': type, 'subType': subType });
        this.balance[type] = this.extend(response, this.safeValue(this.balance, type, {}));
        // don't remove the future from the .futures cache
        const future = client.futures[messageHash];
        future.resolve();
        client.resolve(this.balance[type], type + ':balance');
    }
    handleErrorMessage(client, message) {
        //
        // { code: 100400, msg: '', timestamp: 1696245808833 }
        //
        // {
        //     "code": 100500,
        //     "id": "9cd37d32-da98-440b-bd04-37e7dbcf51ad",
        //     "msg": '',
        //     "timestamp": 1696245842307
        // }
        const code = this.safeString(message, 'code');
        try {
            if (code !== undefined) {
                const feedback = this.id + ' ' + this.json(message);
                this.throwExactlyMatchedException(this.exceptions['exact'], code, feedback);
            }
        }
        catch (e) {
            client.reject(e);
        }
        return true;
    }
    async keepAliveListenKey(params = {}) {
        const listenKey = this.safeString(this.options, 'listenKey');
        if (listenKey === undefined) {
            // A network error happened: we can't renew a listen key that does not exist.
            return;
        }
        try {
            await this.userAuthPrivatePutUserDataStream({ 'listenKey': listenKey }); // extend the expiry
        }
        catch (error) {
            const types = ['spot', 'linear', 'inverse'];
            for (let i = 0; i < types.length; i++) {
                const type = types[i];
                const url = this.urls['api']['ws'][type] + '?listenKey=' + listenKey;
                const client = this.client(url);
                const messageHashes = Object.keys(client.futures);
                for (let j = 0; j < messageHashes.length; j++) {
                    const messageHash = messageHashes[j];
                    client.reject(error, messageHash);
                }
            }
            this.options['listenKey'] = undefined;
            this.options['lastAuthenticatedTime'] = 0;
            return;
        }
        // whether or not to schedule another listenKey keepAlive request
        const listenKeyRefreshRate = this.safeInteger(this.options, 'listenKeyRefreshRate', 3600000);
        this.delay(listenKeyRefreshRate, this.keepAliveListenKey, params);
    }
    async authenticate(params = {}) {
        const time = this.milliseconds();
        const lastAuthenticatedTime = this.safeInteger(this.options, 'lastAuthenticatedTime', 0);
        const listenKeyRefreshRate = this.safeInteger(this.options, 'listenKeyRefreshRate', 3600000); // 1 hour
        if (time - lastAuthenticatedTime > listenKeyRefreshRate) {
            const response = await this.userAuthPrivatePostUserDataStream();
            this.options['listenKey'] = this.safeString(response, 'listenKey');
            this.options['lastAuthenticatedTime'] = time;
            this.delay(listenKeyRefreshRate, this.keepAliveListenKey, params);
        }
    }
    async pong(client, message) {
        //
        // spot
        // {
        //     "ping": "5963ba3db76049b2870f9a686b2ebaac",
        //     "time": "2023-10-02T18:51:55.089+0800"
        // }
        // swap
        // Ping
        //
        try {
            if (message === 'Ping') {
                await client.send('Pong');
            }
            else {
                const ping = this.safeString(message, 'ping');
                const time = this.safeString(message, 'time');
                await client.send({
                    'pong': ping,
                    'time': time,
                });
            }
        }
        catch (e) {
            const error = new errors.NetworkError(this.id + ' pong failed with error ' + this.json(e));
            client.reset(error);
        }
    }
    handleOrder(client, message) {
        //
        //     {
        //         "code": 0,
        //         "dataType": "spot.executionReport",
        //         "data": {
        //            "e": "executionReport",
        //            "E": 1694680212947,
        //            "s": "LTC-USDT",
        //            "S": "BUY",
        //            "o": "LIMIT",
        //            "q": 0.1,
        //            "p": 50,
        //            "x": "NEW",
        //            "X": "PENDING",
        //            "i": 1702238305204043800,
        //            "l": 0,
        //            "z": 0,
        //            "L": 0,
        //            "n": 0,
        //            "N": "",
        //            "T": 0,
        //            "t": 0,
        //            "O": 1694680212676,
        //            "Z": 0,
        //            "Y": 0,
        //            "Q": 0,
        //            "m": false
        //         }
        //      }
        //
        //      {
        //         "code": 0,
        //         "dataType": "spot.executionReport",
        //         "data": {
        //           "e": "executionReport",
        //           "E": 1694681809302,
        //           "s": "LTC-USDT",
        //           "S": "BUY",
        //           "o": "MARKET",
        //           "q": 0,
        //           "p": 62.29,
        //           "x": "TRADE",
        //           "X": "FILLED",
        //           "i": "1702245001712369664",
        //           "l": 0.0802,
        //           "z": 0.0802,
        //           "L": 62.308,
        //           "n": -0.0000802,
        //           "N": "LTC",
        //           "T": 1694681809256,
        //           "t": 38259147,
        //           "O": 1694681809248,
        //           "Z": 4.9971016,
        //           "Y": 4.9971016,
        //           "Q": 5,
        //           "m": false
        //         }
        //       }
        // swap
        //    {
        //        "e": "ORDER_TRADE_UPDATE",
        //        "E": 1696843635475,
        //        "o": {
        //           "s": "LTC-USDT",
        //           "c": "",
        //           "i": "1711312357852147712",
        //           "S": "BUY",
        //           "o": "MARKET",
        //           "q": "0.10000000",
        //           "p": "64.35010000",
        //           "ap": "64.36000000",
        //           "x": "TRADE",
        //           "X": "FILLED",
        //           "N": "USDT",
        //           "n": "-0.00321800",
        //           "T": 0,
        //           "wt": "MARK_PRICE",
        //           "ps": "LONG",
        //           "rp": "0.00000000",
        //           "z": "0.10000000"
        //        }
        //    }
        //
        const isSpot = ('dataType' in message);
        const data = this.safeValue2(message, 'data', 'o', {});
        if (this.orders === undefined) {
            const limit = this.safeInteger(this.options, 'ordersLimit', 1000);
            this.orders = new Cache.ArrayCacheBySymbolById(limit);
        }
        const stored = this.orders;
        const parsedOrder = this.parseOrder(data);
        stored.append(parsedOrder);
        const symbol = parsedOrder['symbol'];
        const spotHash = 'spot:order';
        const swapHash = 'swap:order';
        const messageHash = (isSpot) ? spotHash : swapHash;
        client.resolve(stored, messageHash);
        client.resolve(stored, messageHash + ':' + symbol);
    }
    handleMyTrades(client, message) {
        //
        //
        //      {
        //         "code": 0,
        //         "dataType": "spot.executionReport",
        //         "data": {
        //           "e": "executionReport",
        //           "E": 1694681809302,
        //           "s": "LTC-USDT",
        //           "S": "BUY",
        //           "o": "MARKET",
        //           "q": 0,
        //           "p": 62.29,
        //           "x": "TRADE",
        //           "X": "FILLED",
        //           "i": "1702245001712369664",
        //           "l": 0.0802,
        //           "z": 0.0802,
        //           "L": 62.308,
        //           "n": -0.0000802,
        //           "N": "LTC",
        //           "T": 1694681809256,
        //           "t": 38259147,
        //           "O": 1694681809248,
        //           "Z": 4.9971016,
        //           "Y": 4.9971016,
        //           "Q": 5,
        //           "m": false
        //         }
        //       }
        //
        //  swap
        //    {
        //        "e": "ORDER_TRADE_UPDATE",
        //        "E": 1696843635475,
        //        "o": {
        //           "s": "LTC-USDT",
        //           "c": "",
        //           "i": "1711312357852147712",
        //           "S": "BUY",
        //           "o": "MARKET",
        //           "q": "0.10000000",
        //           "p": "64.35010000",
        //           "ap": "64.36000000",
        //           "x": "TRADE",
        //           "X": "FILLED",
        //           "N": "USDT",
        //           "n": "-0.00321800",
        //           "T": 0,
        //           "wt": "MARK_PRICE",
        //           "ps": "LONG",
        //           "rp": "0.00000000",
        //           "z": "0.10000000"
        //        }
        //    }
        //
        const isSpot = ('dataType' in message);
        const result = this.safeDict2(message, 'data', 'o', {});
        let cachedTrades = this.myTrades;
        if (cachedTrades === undefined) {
            const limit = this.safeInteger(this.options, 'tradesLimit', 1000);
            cachedTrades = new Cache.ArrayCacheBySymbolById(limit);
            this.myTrades = cachedTrades;
        }
        const type = isSpot ? 'spot' : 'swap';
        const marketId = this.safeString(result, 's');
        const market = this.safeMarket(marketId, undefined, '-', type);
        const parsed = this.parseTrade(result, market);
        const symbol = parsed['symbol'];
        const spotHash = 'spot:mytrades';
        const swapHash = 'swap:mytrades';
        const messageHash = isSpot ? spotHash : swapHash;
        cachedTrades.append(parsed);
        client.resolve(cachedTrades, messageHash);
        client.resolve(cachedTrades, messageHash + ':' + symbol);
    }
    handleBalance(client, message) {
        // spot
        //     {
        //         "e":"ACCOUNT_UPDATE",
        //         "E":1696242817000,
        //         "T":1696242817142,
        //         "a":{
        //            "B":[
        //               {
        //                  "a":"USDT",
        //                  "bc":"-1.00000000000000000000",
        //                  "cw":"86.59497382000000050000",
        //                  "wb":"86.59497382000000050000"
        //               }
        //            ],
        //            "m":"ASSET_TRANSFER"
        //         }
        //     }
        // swap
        //     {
        //         "e":"ACCOUNT_UPDATE",
        //         "E":1696244249320,
        //         "a":{
        //            "m":"WITHDRAW",
        //            "B":[
        //               {
        //                  "a":"USDT",
        //                  "wb":"49.81083984",
        //                  "cw":"49.81083984",
        //                  "bc":"-1.00000000"
        //               }
        //            ],
        //            "P":[
        //            ]
        //         }
        //     }
        //
        const a = this.safeDict(message, 'a', {});
        const data = this.safeList(a, 'B', []);
        const timestamp = this.safeInteger2(message, 'T', 'E');
        const type = ('P' in a) ? 'swap' : 'spot';
        if (!(type in this.balance)) {
            this.balance[type] = {};
        }
        this.balance[type]['info'] = data;
        this.balance[type]['timestamp'] = timestamp;
        this.balance[type]['datetime'] = this.iso8601(timestamp);
        for (let i = 0; i < data.length; i++) {
            const balance = data[i];
            const currencyId = this.safeString(balance, 'a');
            const code = this.safeCurrencyCode(currencyId);
            const account = this.account();
            account['info'] = balance;
            account['used'] = this.safeString(balance, 'lk');
            account['free'] = this.safeString(balance, 'wb');
            this.balance[type][code] = account;
        }
        this.balance[type] = this.safeBalance(this.balance[type]);
        client.resolve(this.balance[type], type + ':balance');
    }
    handleMessage(client, message) {
        if (!this.handleErrorMessage(client, message)) {
            return;
        }
        // public subscriptions
        if ((message === 'Ping') || ('ping' in message)) {
            this.spawn(this.pong, client, message);
            return;
        }
        const dataType = this.safeString(message, 'dataType', '');
        if (dataType.indexOf('@depth') >= 0) {
            this.handleOrderBook(client, message);
            return;
        }
        if (dataType.indexOf('@ticker') >= 0) {
            this.handleTicker(client, message);
            return;
        }
        if (dataType.indexOf('@trade') >= 0) {
            this.handleTrades(client, message);
            return;
        }
        if (dataType.indexOf('@kline') >= 0) {
            this.handleOHLCV(client, message);
            return;
        }
        if (dataType.indexOf('executionReport') >= 0) {
            const data = this.safeValue(message, 'data', {});
            const type = this.safeString(data, 'x');
            if (type === 'TRADE') {
                this.handleMyTrades(client, message);
            }
            this.handleOrder(client, message);
            return;
        }
        const e = this.safeString(message, 'e');
        if (e === 'ACCOUNT_UPDATE') {
            this.handleBalance(client, message);
        }
        if (e === 'ORDER_TRADE_UPDATE') {
            this.handleOrder(client, message);
            const data = this.safeValue(message, 'o', {});
            const type = this.safeString(data, 'x');
            const status = this.safeString(data, 'X');
            if ((type === 'TRADE') && (status === 'FILLED')) {
                this.handleMyTrades(client, message);
            }
        }
        const msgData = this.safeValue(message, 'data');
        const msgEvent = this.safeString(msgData, 'e');
        if (msgEvent === '24hTicker') {
            this.handleTicker(client, message);
        }
    }
}

module.exports = bingx;
