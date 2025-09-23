'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var apex$1 = require('../apex.js');
var Cache = require('../base/ws/Cache.js');
var errors = require('../base/errors.js');
var sha256 = require('../static_dependencies/noble-hashes/sha256.js');

// ----------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
class apex extends apex$1["default"] {
    describe() {
        return this.deepExtend(super.describe(), {
            'has': {
                'ws': true,
                'watchTicker': true,
                'watchTickers': true,
                'watchOrderBook': true,
                'watchOrders': true,
                'watchTrades': true,
                'watchTradesForSymbols': false,
                'watchPositions': true,
                'watchMyTrades': true,
                'watchBalance': false,
                'watchOHLCV': true,
            },
            'urls': {
                'logo': 'https://omni.apex.exchange/assets/logo_content-CY9uyFbz.svg',
                'api': {
                    'ws': {
                        'public': 'wss://quote.omni.apex.exchange/realtime_public?v=2',
                        'private': 'wss://quote.omni.apex.exchange/realtime_private?v=2',
                    },
                },
                'test': {
                    'ws': {
                        'public': 'wss://qa-quote.omni.apex.exchange/realtime_public?v=2',
                        'private': 'wss://qa-quote.omni.apex.exchange/realtime_private?v=2',
                    },
                },
                'www': 'https://apex.exchange/',
                'doc': 'https://api-docs.pro.apex.exchange',
                'fees': 'https://apex-pro.gitbook.io/apex-pro/apex-omni-live-now/trading-perpetual-contracts/trading-fees',
                'referral': 'https://omni.apex.exchange/trade',
            },
            'options': {},
            'streaming': {
                'ping': this.ping,
                'keepAlive': 18000,
            },
        });
    }
    /**
     * @method
     * @name apex#watchTrades
     * @description watches information on multiple trades made in a market
     * @see https://api-docs.pro.apex.exchange/#websocket-v3-for-omni-websocket-endpoint
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async watchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        return await this.watchTradesForSymbols([symbol], since, limit, params);
    }
    /**
     * @method
     * @name apex#watchTradesForSymbols
     * @description get the list of most recent trades for a list of symbols
     * @see https://api-docs.pro.apex.exchange/#websocket-v3-for-omni-websocket-endpoint
     * @param {string[]} symbols unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async watchTradesForSymbols(symbols, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols);
        const symbolsLength = symbols.length;
        if (symbolsLength === 0) {
            throw new errors.ArgumentsRequired(this.id + ' watchTradesForSymbols() requires a non-empty array of symbols');
        }
        const timeStamp = this.milliseconds().toString();
        const url = this.urls['api']['ws']['public'] + '&timestamp=' + timeStamp;
        const topics = [];
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.market(symbol);
            const topic = 'recentlyTrade.H.' + market['id2'];
            topics.push(topic);
            const messageHash = 'trade:' + symbol;
            messageHashes.push(messageHash);
        }
        const trades = await this.watchTopics(url, messageHashes, topics, params);
        if (this.newUpdates) {
            const first = this.safeValue(trades, 0);
            const tradeSymbol = this.safeString(first, 'symbol');
            limit = trades.getLimit(tradeSymbol, limit);
        }
        return this.filterBySinceLimit(trades, since, limit, 'timestamp', true);
    }
    handleTrades(client, message) {
        //
        //     {
        //         "topic": "recentlyTrade.H.BTCUSDT",
        //         "type": "snapshot",
        //         "ts": 1672304486868,
        //         "data": [
        //             {
        //                 "T": 1672304486865,
        //                 "s": "BTCUSDT",
        //                 "S": "Buy",
        //                 "v": "0.001",
        //                 "p": "16578.50",
        //                 "L": "PlusTick",
        //                 "i": "20f43950-d8dd-5b31-9112-a178eb6023af",
        //                 "BT": false
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue(message, 'data', {});
        const topic = this.safeString(message, 'topic');
        const trades = data;
        const parts = topic.split('.');
        const marketId = this.safeString(parts, 2);
        const market = this.safeMarket(marketId, undefined, undefined);
        const symbol = market['symbol'];
        let stored = this.safeValue(this.trades, symbol);
        if (stored === undefined) {
            const limit = this.safeInteger(this.options, 'tradesLimit', 1000);
            stored = new Cache.ArrayCache(limit);
            this.trades[symbol] = stored;
        }
        for (let j = 0; j < trades.length; j++) {
            const parsed = this.parseWsTrade(trades[j], market);
            stored.append(parsed);
        }
        const messageHash = 'trade' + ':' + symbol;
        client.resolve(stored, messageHash);
    }
    parseWsTrade(trade, market = undefined) {
        //
        // public
        //    {
        //         "T": 1672304486865,
        //         "s": "BTCUSDT",
        //         "S": "Buy",
        //         "v": "0.001",
        //         "p": "16578.50",
        //         "L": "PlusTick",
        //         "i": "20f43950-d8dd-5b31-9112-a178eb6023af",
        //         "BT": false
        //     }
        //
        const id = this.safeStringN(trade, ['i', 'id', 'v']);
        const marketId = this.safeStringN(trade, ['s', 'symbol']);
        market = this.safeMarket(marketId, market, undefined);
        const symbol = market['symbol'];
        const timestamp = this.safeIntegerN(trade, ['t', 'T', 'createdAt']);
        const side = this.safeStringLowerN(trade, ['S', 'side']);
        const price = this.safeStringN(trade, ['p', 'price']);
        const amount = this.safeStringN(trade, ['q', 'v', 'size']);
        return this.safeTrade({
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'symbol': symbol,
            'order': undefined,
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': undefined,
        }, market);
    }
    /**
     * @method
     * @name apex#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://api-docs.pro.apex.exchange/#websocket-v3-for-omni-websocket-endpoint
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return.
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBook(symbol, limit = undefined, params = {}) {
        return await this.watchOrderBookForSymbols([symbol], limit, params);
    }
    /**
     * @method
     * @name apex#watchOrderBookForSymbols
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://api-docs.pro.apex.exchange/#websocket-v3-for-omni-websocket-endpoint
     * @param {string[]} symbols unified array of symbols
     * @param {int} [limit] the maximum amount of order book entries to return.
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBookForSymbols(symbols, limit = undefined, params = {}) {
        await this.loadMarkets();
        const symbolsLength = symbols.length;
        if (symbolsLength === 0) {
            throw new errors.ArgumentsRequired(this.id + ' watchOrderBookForSymbols() requires a non-empty array of symbols');
        }
        symbols = this.marketSymbols(symbols);
        const timeStamp = this.milliseconds().toString();
        const url = this.urls['api']['ws']['public'] + '&timestamp=' + timeStamp;
        const topics = [];
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.market(symbol);
            if (limit === undefined) {
                limit = 25;
            }
            const topic = 'orderBook' + limit.toString() + '.H.' + market['id2'];
            topics.push(topic);
            const messageHash = 'orderbook:' + symbol;
            messageHashes.push(messageHash);
        }
        const orderbook = await this.watchTopics(url, messageHashes, topics, params);
        return orderbook.limit();
    }
    async watchTopics(url, messageHashes, topics, params = {}) {
        const request = {
            'op': 'subscribe',
            'args': topics,
        };
        const message = this.extend(request, params);
        return await this.watchMultiple(url, messageHashes, message, messageHashes);
    }
    handleOrderBook(client, message) {
        //
        //     {
        //         "topic": "orderbook25.H.BTCUSDT",
        //         "type": "snapshot",
        //         "ts": 1672304484978,
        //         "data": {
        //             "s": "BTCUSDT",
        //             "b": [
        //                 ...,
        //                 [
        //                     "16493.50",
        //                     "0.006"
        //                 ],
        //                 [
        //                     "16493.00",
        //                     "0.100"
        //                 ]
        //             ],
        //             "a": [
        //                 [
        //                     "16611.00",
        //                     "0.029"
        //                 ],
        //                 [
        //                     "16612.00",
        //                     "0.213"
        //                 ],
        //             ],
        //             "u": 18521288,
        //             "seq": 7961638724
        //         }
        //     }
        //
        const type = this.safeString(message, 'type');
        const isSnapshot = (type === 'snapshot');
        const data = this.safeDict(message, 'data', {});
        const marketId = this.safeString(data, 's');
        const market = this.safeMarket(marketId, undefined, undefined);
        const symbol = market['symbol'];
        const timestamp = this.safeIntegerProduct(message, 'ts', 0.001);
        if (!(symbol in this.orderbooks)) {
            this.orderbooks[symbol] = this.orderBook();
        }
        const orderbook = this.orderbooks[symbol];
        if (isSnapshot) {
            const snapshot = this.parseOrderBook(data, symbol, timestamp, 'b', 'a');
            orderbook.reset(snapshot);
        }
        else {
            const asks = this.safeList(data, 'a', []);
            const bids = this.safeList(data, 'b', []);
            this.handleDeltas(orderbook['asks'], asks);
            this.handleDeltas(orderbook['bids'], bids);
            orderbook['timestamp'] = timestamp;
            orderbook['datetime'] = this.iso8601(timestamp);
        }
        const messageHash = 'orderbook' + ':' + symbol;
        this.orderbooks[symbol] = orderbook;
        client.resolve(orderbook, messageHash);
    }
    handleDelta(bookside, delta) {
        const bidAsk = this.parseBidAsk(delta, 0, 1);
        bookside.storeArray(bidAsk);
    }
    handleDeltas(bookside, deltas) {
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta(bookside, deltas[i]);
        }
    }
    /**
     * @method
     * @name apex#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://api-docs.pro.apex.exchange/#websocket-v3-for-omni-websocket-endpoint
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTicker(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        symbol = market['symbol'];
        const timeStamp = this.milliseconds().toString();
        const url = this.urls['api']['ws']['public'] + '&timestamp=' + timeStamp;
        const messageHash = 'ticker:' + symbol;
        const topic = 'instrumentInfo' + '.H.' + market['id2'];
        const topics = [topic];
        return await this.watchTopics(url, [messageHash], topics, params);
    }
    /**
     * @method
     * @name apex#watchTickers
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://api-docs.pro.apex.exchange/#websocket-v3-for-omni-websocket-endpoint
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTickers(symbols = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols, undefined, false);
        const messageHashes = [];
        const timeStamp = this.milliseconds().toString();
        const url = this.urls['api']['ws']['public'] + '&timestamp=' + timeStamp;
        const topics = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.market(symbol);
            const topic = 'instrumentInfo' + '.H.' + market['id2'];
            topics.push(topic);
            const messageHash = 'ticker:' + symbol;
            messageHashes.push(messageHash);
        }
        const ticker = await this.watchTopics(url, messageHashes, topics, params);
        if (this.newUpdates) {
            const result = {};
            result[ticker['symbol']] = ticker;
            return result;
        }
        return this.filterByArray(this.tickers, 'symbol', symbols);
    }
    handleTicker(client, message) {
        // "topic":"instrumentInfo.H.BTCUSDT",
        //     "type":"snapshot",
        //     "data":{
        //     "symbol":"BTCUSDT",
        //         "lastPrice":"21572.5",
        //         "price24hPcnt":"-0.0194318181818182",
        //         "highPrice24h":"25306.5",
        //         "lowPrice24h":"17001.5",
        //         "turnover24h":"1334891.4545",
        //         "volume24h":"64.896",
        //         "nextFundingTime":"2022-08-26T08:00:00Z",
        //         "oraclePrice":"21412.060000000002752512",
        //         "indexPrice":"21409.82",
        //         "openInterest":"49.598",
        //         "tradeCount":"0",
        //         "fundingRate":"0.0000125",
        //         "predictedFundingRate":"0.0000125"
        // },
        //     "cs":44939063,
        //     "ts":1661500091955487
        // }
        const topic = this.safeString(message, 'topic', '');
        const updateType = this.safeString(message, 'type', '');
        const data = this.safeDict(message, 'data', {});
        let symbol = undefined;
        let parsed = undefined;
        if ((updateType === 'snapshot')) {
            parsed = this.parseTicker(data);
            symbol = parsed['symbol'];
        }
        else if (updateType === 'delta') {
            const topicParts = topic.split('.');
            const topicLength = topicParts.length;
            const marketId = this.safeString(topicParts, topicLength - 1);
            const market = this.safeMarket(marketId, undefined, undefined);
            symbol = market['symbol'];
            const ticker = this.safeDict(this.tickers, symbol, {});
            const rawTicker = this.safeDict(ticker, 'info', {});
            const merged = this.extend(rawTicker, data);
            parsed = this.parseTicker(merged);
        }
        const timestamp = this.safeIntegerProduct(message, 'ts', 0.001);
        parsed['timestamp'] = timestamp;
        parsed['datetime'] = this.iso8601(timestamp);
        this.tickers[symbol] = parsed;
        const messageHash = 'ticker:' + symbol;
        client.resolve(this.tickers[symbol], messageHash);
    }
    /**
     * @method
     * @name apex#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://api-docs.pro.apex.exchange/#websocket-v3-for-omni-websocket-endpoint
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
     * @name apex#watchOHLCVForSymbols
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://api-docs.pro.apex.exchange/#websocket-v3-for-omni-websocket-endpoint
     * @param {string[][]} symbolsAndTimeframes array of arrays containing unified symbols and timeframes to fetch OHLCV data for, example [['BTC/USDT', '1m'], ['LTC/USDT', '5m']]
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async watchOHLCVForSymbols(symbolsAndTimeframes, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const timeStamp = this.milliseconds().toString();
        const url = this.urls['api']['ws']['public'] + '&timestamp=' + timeStamp;
        const rawHashes = [];
        const messageHashes = [];
        for (let i = 0; i < symbolsAndTimeframes.length; i++) {
            const data = symbolsAndTimeframes[i];
            let symbolString = this.safeString(data, 0);
            const market = this.market(symbolString);
            symbolString = market['id2'];
            const unfiedTimeframe = this.safeString(data, 1, '1');
            const timeframeId = this.safeString(this.timeframes, unfiedTimeframe, unfiedTimeframe);
            rawHashes.push('candle.' + timeframeId + '.' + symbolString);
            messageHashes.push('ohlcv::' + symbolString + '::' + unfiedTimeframe);
        }
        const [symbol, timeframe, stored] = await this.watchTopics(url, messageHashes, rawHashes, params);
        if (this.newUpdates) {
            limit = stored.getLimit(symbol, limit);
        }
        const filtered = this.filterBySinceLimit(stored, since, limit, 0, true);
        return this.createOHLCVObject(symbol, timeframe, filtered);
    }
    handleOHLCV(client, message) {
        //
        //     {
        //         "topic": "candle.5.BTCUSDT",
        //         "data": [
        //             {
        //                 "start": 1672324800000,
        //                 "end": 1672325099999,
        //                 "interval": "5",
        //                 "open": "16649.5",
        //                 "close": "16677",
        //                 "high": "16677",
        //                 "low": "16608",
        //                 "volume": "2.081",
        //                 "turnover": "34666.4005",
        //                 "confirm": false,
        //                 "timestamp": 1672324988882
        //             }
        //         ],
        //         "ts": 1672324988882,
        //         "type": "snapshot"
        //     }
        //
        const data = this.safeValue(message, 'data', {});
        const topic = this.safeString(message, 'topic');
        const topicParts = topic.split('.');
        const topicLength = topicParts.length;
        const timeframeId = this.safeString(topicParts, 1);
        const timeframe = this.findTimeframe(timeframeId);
        const marketId = this.safeString(topicParts, topicLength - 1);
        const isSpot = client.url.indexOf('spot') > -1;
        const marketType = isSpot ? 'spot' : 'contract';
        const market = this.safeMarket(marketId, undefined, undefined, marketType);
        const symbol = market['symbol'];
        const ohlcvsByTimeframe = this.safeValue(this.ohlcvs, symbol);
        if (ohlcvsByTimeframe === undefined) {
            this.ohlcvs[symbol] = {};
        }
        if (this.safeValue(ohlcvsByTimeframe, timeframe) === undefined) {
            const limit = this.safeInteger(this.options, 'OHLCVLimit', 1000);
            this.ohlcvs[symbol][timeframe] = new Cache.ArrayCacheByTimestamp(limit);
        }
        const stored = this.ohlcvs[symbol][timeframe];
        for (let i = 0; i < data.length; i++) {
            const parsed = this.parseWsOHLCV(data[i]);
            stored.append(parsed);
        }
        const messageHash = 'ohlcv::' + symbol + '::' + timeframe;
        const resolveData = [symbol, timeframe, stored];
        client.resolve(resolveData, messageHash);
    }
    parseWsOHLCV(ohlcv, market = undefined) {
        //
        //     {
        //         "start": 1670363160000,
        //         "end": 1670363219999,
        //         "interval": "1",
        //         "open": "16987.5",
        //         "close": "16987.5",
        //         "high": "16988",
        //         "low": "16987.5",
        //         "volume": "23.511",
        //         "turnover": "399396.344",
        //         "confirm": false,
        //         "timestamp": 1670363219614
        //     }
        //
        return [
            this.safeInteger(ohlcv, 'start'),
            this.safeNumber(ohlcv, 'open'),
            this.safeNumber(ohlcv, 'high'),
            this.safeNumber(ohlcv, 'low'),
            this.safeNumber(ohlcv, 'close'),
            this.safeNumber2(ohlcv, 'volume', 'turnover'),
        ];
    }
    /**
     * @method
     * @name apex#watchMyTrades
     * @description watches information on multiple trades made by the user
     * @see https://api-docs.pro.apex.exchange/#private-websocket
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.unifiedMargin] use unified margin account
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async watchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let messageHash = 'myTrades';
        await this.loadMarkets();
        if (symbol !== undefined) {
            symbol = this.symbol(symbol);
            messageHash += ':' + symbol;
        }
        const timeStamp = this.milliseconds().toString();
        const url = this.urls['api']['ws']['private'] + '&timestamp=' + timeStamp;
        await this.authenticate(url);
        const trades = await this.watchTopics(url, [messageHash], ['myTrades'], params);
        if (this.newUpdates) {
            limit = trades.getLimit(symbol, limit);
        }
        return this.filterBySymbolSinceLimit(trades, symbol, since, limit, true);
    }
    /**
     * @method
     * @name apex#watchPositions
     * @see https://api-docs.pro.apex.exchange/#private-websocket
     * @description watch all open positions
     * @param {string[]} [symbols] list of unified market symbols
     * @param {int} [since] the earliest time in ms to fetch positions for
     * @param {int} [limit] the maximum number of positions to retrieve
     * @param {object} params extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
     */
    async watchPositions(symbols = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let messageHash = '';
        if (!this.isEmpty(symbols)) {
            symbols = this.marketSymbols(symbols);
            messageHash = '::' + symbols.join(',');
        }
        const timeStamp = this.milliseconds().toString();
        const url = this.urls['api']['ws']['private'] + '&timestamp=' + timeStamp;
        messageHash = 'positions' + messageHash;
        const client = this.client(url);
        await this.authenticate(url);
        this.setPositionsCache(client, symbols);
        const cache = this.positions;
        if (cache === undefined) {
            const snapshot = await client.future('fetchPositionsSnapshot');
            return this.filterBySymbolsSinceLimit(snapshot, symbols, since, limit, true);
        }
        const topics = ['positions'];
        const newPositions = await this.watchTopics(url, [messageHash], topics, params);
        if (this.newUpdates) {
            return newPositions;
        }
        return this.filterBySymbolsSinceLimit(cache, symbols, since, limit, true);
    }
    /**
     * @method
     * @name apex#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://api-docs.pro.apex.exchange/#private-websocket
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
            messageHash += ':' + symbol;
        }
        const timeStamp = this.milliseconds().toString();
        const url = this.urls['api']['ws']['private'] + '&timestamp=' + timeStamp;
        await this.authenticate(url);
        const topics = ['orders'];
        const orders = await this.watchTopics(url, [messageHash], topics, params);
        if (this.newUpdates) {
            limit = orders.getLimit(symbol, limit);
        }
        return this.filterBySymbolSinceLimit(orders, symbol, since, limit, true);
    }
    handleMyTrades(client, lists) {
        // [
        //     {
        //         "symbol":"ETH-USDT",
        //         "side":"BUY",
        //         "orderId":"2048046080",
        //         "fee":"0.625000",
        //         "liquidity":"TAKER",
        //         "accountId":"1024000",
        //         "createdAt":1652185521361,
        //         "isOpen":true,
        //         "size":"0.500",
        //         "price":"2500.0",
        //         "quoteAmount":"1250.0000",
        //         "id":"2048000182272",
        //         "updatedAt":1652185678345
        //     }
        // ]
        if (this.myTrades === undefined) {
            const limit = this.safeInteger(this.options, 'tradesLimit', 1000);
            this.myTrades = new Cache.ArrayCacheBySymbolById(limit);
        }
        const trades = this.myTrades;
        const symbols = {};
        for (let i = 0; i < lists.length; i++) {
            const rawTrade = lists[i];
            let parsed = undefined;
            parsed = this.parseWsTrade(rawTrade);
            const symbol = parsed['symbol'];
            symbols[symbol] = true;
            trades.append(parsed);
        }
        const keys = Object.keys(symbols);
        for (let i = 0; i < keys.length; i++) {
            const currentMessageHash = 'myTrades:' + keys[i];
            client.resolve(trades, currentMessageHash);
        }
        // non-symbol specific
        const messageHash = 'myTrades';
        client.resolve(trades, messageHash);
    }
    handleOrder(client, lists) {
        // [
        //     {
        //         "symbol":"ETH-USDT",
        //         "cumSuccessFillFee":"0.625000",
        //         "trailingPercent":"0",
        //         "type":"LIMIT",
        //         "unfillableAt":1654779600000,
        //         "isDeleverage":false,
        //         "createdAt":1652185521339,
        //         "price":"2500.0",
        //         "cumSuccessFillValue":"0",
        //         "id":"2048046080",
        //         "cancelReason":"",
        //         "timeInForce":1,
        //         "updatedAt":1652185521392,
        //         "limitFee":"0.625000",
        //         "side":"BUY",
        //         "clientOrderId":"522843990",
        //         "triggerPrice":"",
        //         "expiresAt":1654779600000,
        //         "cumSuccessFillSize":"0",
        //         "accountId":"1024000",
        //         "size":"0.500",
        //         "reduceOnly":false,
        //         "isLiquidate":false,
        //         "remainingSize":"0.000",
        //         "status":"PENDING"
        //     }
        // ]
        if (this.orders === undefined) {
            const limit = this.safeInteger(this.options, 'ordersLimit', 1000);
            this.orders = new Cache.ArrayCacheBySymbolById(limit);
        }
        const orders = this.orders;
        const symbols = {};
        for (let i = 0; i < lists.length; i++) {
            let parsed = undefined;
            parsed = this.parseOrder(lists[i]);
            const symbol = parsed['symbol'];
            symbols[symbol] = true;
            orders.append(parsed);
        }
        const symbolsArray = Object.keys(symbols);
        for (let i = 0; i < symbolsArray.length; i++) {
            const currentMessageHash = 'orders:' + symbolsArray[i];
            client.resolve(orders, currentMessageHash);
        }
        const messageHash = 'orders';
        client.resolve(orders, messageHash);
    }
    setPositionsCache(client, symbols = undefined) {
        if (this.positions !== undefined) {
            return;
        }
        const messageHash = 'fetchPositionsSnapshot';
        if (!(messageHash in client.futures)) {
            client.future(messageHash);
            this.spawn(this.loadPositionsSnapshot, client, messageHash);
        }
    }
    async loadPositionsSnapshot(client, messageHash) {
        // as only one ws channel gives positions for all types, for snapshot must load all positions
        const fetchFunctions = [
            this.fetchPositions(undefined),
        ];
        const promises = await Promise.all(fetchFunctions);
        this.positions = new Cache.ArrayCacheBySymbolBySide();
        const cache = this.positions;
        for (let i = 0; i < promises.length; i++) {
            const positions = promises[i];
            for (let ii = 0; ii < positions.length; ii++) {
                const position = positions[ii];
                cache.append(position);
            }
        }
        // don't remove the future from the .futures cache
        const future = client.futures[messageHash];
        future.resolve(cache);
        client.resolve(cache, 'positions');
    }
    handlePositions(client, lists) {
        //
        // [
        //     {
        //         "symbol":"ETH-USDT",
        //         "exitPrice":"0",
        //         "side":"LONG",
        //         "maxSize":"2820.000",
        //         "sumOpen":"1.820",
        //         "sumClose":"0.000",
        //         "netFunding":"0.000000",
        //         "entryPrice":"2500.000000000000000000",
        //         "accountId":"1024000",
        //         "createdAt":1652179377769,
        //         "size":"1.820",
        //         "realizedPnl":"0",
        //         "closedAt":1652185521392,
        //         "updatedAt":1652185521392
        //     }
        // ]
        //
        // each account is connected to a different endpoint
        // and has exactly one subscriptionhash which is the account type
        if (this.positions === undefined) {
            this.positions = new Cache.ArrayCacheBySymbolBySide();
        }
        const cache = this.positions;
        const newPositions = [];
        for (let i = 0; i < lists.length; i++) {
            const rawPosition = lists[i];
            const position = this.parsePosition(rawPosition);
            const side = this.safeString(position, 'side');
            // hacky solution to handle closing positions
            // without crashing, we should handle this properly later
            newPositions.push(position);
            if (side === undefined || side === '') {
                // closing update, adding both sides to "reset" both sides
                // since we don't know which side is being closed
                position['side'] = 'long';
                cache.append(position);
                position['side'] = 'short';
                cache.append(position);
                position['side'] = undefined;
            }
            else {
                // regular update
                cache.append(position);
            }
        }
        const messageHashes = this.findMessageHashes(client, 'positions::');
        for (let i = 0; i < messageHashes.length; i++) {
            const messageHash = messageHashes[i];
            const parts = messageHash.split('::');
            const symbolsString = parts[1];
            const symbols = symbolsString.split(',');
            const positions = this.filterByArray(newPositions, 'symbol', symbols, false);
            if (!this.isEmpty(positions)) {
                client.resolve(positions, messageHash);
            }
        }
        client.resolve(newPositions, 'positions');
    }
    async authenticate(url, params = {}) {
        this.checkRequiredCredentials();
        const timestamp = this.milliseconds().toString();
        const request_path = '/ws/accounts';
        const http_method = 'GET';
        const messageString = (timestamp + http_method + request_path);
        const signature = this.hmac(this.encode(messageString), this.encode(this.stringToBase64(this.secret)), sha256.sha256, 'base64');
        const messageHash = 'authenticated';
        const client = this.client(url);
        const future = client.future(messageHash);
        const authenticated = this.safeValue(client.subscriptions, messageHash);
        if (authenticated === undefined) {
            // auth sign
            const request = {
                'type': 'login',
                'topics': ['ws_zk_accounts_v3'],
                'httpMethod': http_method,
                'requestPath': request_path,
                'apiKey': this.apiKey,
                'passphrase': this.password,
                'timestamp': timestamp,
                'signature': signature,
            };
            const message = {
                'op': 'login',
                'args': [JSON.stringify(request)],
            };
            this.watch(url, messageHash, message, messageHash);
        }
        return await future;
    }
    handleErrorMessage(client, message) {
        //
        //   {
        //       "success": false,
        //       "ret_msg": "error:invalid op",
        //       "conn_id": "5e079fdd-9c7f-404d-9dbf-969d650838b5",
        //       "request": { op: '', args: null }
        //   }
        //
        // auth error
        //
        //   {
        //       "success": false,
        //       "ret_msg": "error:USVC1111",
        //       "conn_id": "e73770fb-a0dc-45bd-8028-140e20958090",
        //       "request": {
        //         "op": "auth",
        //         "args": [
        //           "9rFT6uR4uz9Imkw4Wx",
        //           "1653405853543",
        //           "542e71bd85597b4db0290f0ce2d13ed1fd4bb5df3188716c1e9cc69a879f7889"
        //         ]
        //   }
        //
        //   { code: '-10009', desc: "Invalid period!" }
        //
        //   {
        //       "reqId":"1",
        //       "retCode":170131,
        //       "retMsg":"Insufficient balance.",
        //       "op":"order.create",
        //       "data":{
        //
        //       },
        //       "header":{
        //           "X-Bapi-Limit":"20",
        //           "X-Bapi-Limit-Status":"19",
        //           "X-Bapi-Limit-Reset-Timestamp":"1714236608944",
        //           "Traceid":"3d7168a137bf32a947b7e5e6a575ac7f",
        //           "Timenow":"1714236608946"
        //       },
        //       "connId":"cojifin88smerbj9t560-406"
        //   }
        //
        const code = this.safeStringN(message, ['code', 'ret_code', 'retCode']);
        try {
            if (code !== undefined && code !== '0') {
                const feedback = this.id + ' ' + this.json(message);
                this.throwExactlyMatchedException(this.exceptions['exact'], code, feedback);
                const msg = this.safeString2(message, 'retMsg', 'ret_msg');
                this.throwBroadlyMatchedException(this.exceptions['broad'], msg, feedback);
                throw new errors.ExchangeError(feedback);
            }
            const success = this.safeValue(message, 'success');
            if (success !== undefined && !success) {
                const ret_msg = this.safeString(message, 'ret_msg');
                const request = this.safeValue(message, 'request', {});
                const op = this.safeString(request, 'op');
                if (op === 'auth') {
                    throw new errors.AuthenticationError('Authentication failed: ' + ret_msg);
                }
                else {
                    throw new errors.ExchangeError(this.id + ' ' + ret_msg);
                }
            }
            return false;
        }
        catch (error) {
            if (error instanceof errors.AuthenticationError) {
                const messageHash = 'authenticated';
                client.reject(error, messageHash);
                if (messageHash in client.subscriptions) {
                    delete client.subscriptions[messageHash];
                }
            }
            else {
                const messageHash = this.safeString(message, 'reqId');
                client.reject(error, messageHash);
            }
            return true;
        }
    }
    handleMessage(client, message) {
        if (this.handleErrorMessage(client, message)) {
            return;
        }
        const topic = this.safeString2(message, 'topic', 'op', '');
        const methods = {
            'ws_zk_accounts_v3': this.handleAccount,
            'orderBook': this.handleOrderBook,
            'depth': this.handleOrderBook,
            'candle': this.handleOHLCV,
            'kline': this.handleOHLCV,
            'ticker': this.handleTicker,
            'instrumentInfo': this.handleTicker,
            'trade': this.handleTrades,
            'recentlyTrade': this.handleTrades,
            'pong': this.handlePong,
            'auth': this.handleAuthenticate,
        };
        const exacMethod = this.safeValue(methods, topic);
        if (exacMethod !== undefined) {
            exacMethod.call(this, client, message);
            return;
        }
        const keys = Object.keys(methods);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (topic.indexOf(keys[i]) >= 0) {
                const method = methods[key];
                method.call(this, client, message);
                return;
            }
        }
        // unified auth acknowledgement
        const type = this.safeString(message, 'type');
        if (type === 'AUTH_RESP') {
            this.handleAuthenticate(client, message);
        }
    }
    ping(client) {
        const timeStamp = this.milliseconds().toString();
        client.lastPong = timeStamp; // server won't send a pong, so we set it here
        return {
            'args': [timeStamp],
            'op': 'ping',
        };
    }
    handlePong(client, message) {
        //
        //   {
        //       "success": true,
        //       "ret_msg": "pong",
        //       "conn_id": "db3158a0-8960-44b9-a9de-ac350ee13158",
        //       "request": { op: "ping", args: null }
        //   }
        //
        //   { pong: 1653296711335 }
        //
        client.lastPong = this.safeInteger(message, 'pong');
        return message;
    }
    handleAccount(client, message) {
        const contents = this.safeDict(message, 'contents', {});
        const fills = this.safeList(contents, 'fills', []);
        if (fills !== undefined) {
            this.handleMyTrades(client, fills);
        }
        const positions = this.safeList(contents, 'positions', []);
        if (positions !== undefined) {
            this.handlePositions(client, positions);
        }
        const orders = this.safeList(contents, 'orders', []);
        if (orders !== undefined) {
            this.handleOrder(client, orders);
        }
    }
    handleAuthenticate(client, message) {
        //
        //    {
        //        "success": true,
        //        "ret_msg": '',
        //        "op": "auth",
        //        "conn_id": "ce3dpomvha7dha97tvp0-2xh"
        //    }
        //
        const success = this.safeValue(message, 'success');
        const code = this.safeInteger(message, 'retCode');
        const messageHash = 'authenticated';
        if (success || code === 0) {
            const future = this.safeValue(client.futures, messageHash);
            future.resolve(true);
        }
        else {
            const error = new errors.AuthenticationError(this.id + ' ' + this.json(message));
            client.reject(error, messageHash);
            if (messageHash in client.subscriptions) {
                delete client.subscriptions[messageHash];
            }
        }
        return message;
    }
    handleSubscriptionStatus(client, message) {
        //
        //    {
        //        "topic": "kline",
        //        "event": "sub",
        //        "params": {
        //          "symbol": "LTCUSDT",
        //          "binary": "false",
        //          "klineType": "1m",
        //          "symbolName": "LTCUSDT"
        //        },
        //        "code": "0",
        //        "msg": "Success"
        //    }
        //
        return message;
    }
}

exports["default"] = apex;
