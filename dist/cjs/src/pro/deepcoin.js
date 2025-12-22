'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var deepcoin$1 = require('../deepcoin.js');
var errors = require('../base/errors.js');
var Cache = require('../base/ws/Cache.js');

// ----------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
class deepcoin extends deepcoin$1["default"] {
    describe() {
        return this.deepExtend(super.describe(), {
            'has': {
                'ws': true,
                'watchTicker': true,
                'watchMarkPrice': false,
                'watchMarkPrices': false,
                'watchTickers': false,
                'watchBidsAsks': false,
                'watchOrderBook': true,
                'watchTrades': true,
                'watchTradesForSymbols': false,
                'watchOrderBookForSymbols': false,
                'watchBalance': false,
                'watchLiquidations': false,
                'watchLiquidationsForSymbols': false,
                'watchMyLiquidations': false,
                'watchMyLiquidationsForSymbols': false,
                'watchOHLCV': true,
                'watchOHLCVForSymbols': false,
                'watchOrders': true,
                'watchMyTrades': true,
                'watchPositions': true,
                'watchFundingRate': false,
                'watchFundingRates': false,
                'createOrderWs': false,
                'editOrderWs': false,
                'cancelOrderWs': false,
                'cancelOrdersWs': false,
                'cancelAllOrdersWs': false,
                'unWatchTicker': true,
                'unWatchTrades': true,
                'unWatchOHLCV': true,
                'unWatchOrderBook': true,
            },
            'urls': {
                'api': {
                    'ws': {
                        'public': {
                            'spot': 'wss://stream.deepcoin.com/streamlet/trade/public/spot?platform=api',
                            'swap': 'wss://stream.deepcoin.com/streamlet/trade/public/swap?platform=api',
                        },
                        'private': 'wss://stream.deepcoin.com/v1/private',
                    },
                },
            },
            'options': {
                'lastRequestId': undefined,
                'listenKey': undefined,
                'listenKeyExpiryTimestamp': undefined,
                'authenticate': {
                    'method': 'privateGetDeepcoinListenkeyExtend', // refresh existing listen key or 'privateGetDeepcoinListenkeyAcquire' - get a new one
                },
                'timeframes': {
                    '1m': '1m',
                    '5m': '5m',
                    '15m': '15m',
                    '30m': '30m',
                    '1h': '1h',
                    '4h': '4h',
                    '12h': '12h',
                    '1d': '1d',
                    '1w': '1w',
                    '1M': '1o',
                    '1y': '1y',
                },
            },
            'streaming': {
                'ping': this.ping,
            },
        });
    }
    ping(client) {
        const url = client.url;
        if (url.indexOf('private') >= 0) {
            client.lastPong = this.milliseconds();
            // prevent automatic disconnects on private channel
        }
        return 'ping';
    }
    handlePong(client, message) {
        client.lastPong = this.milliseconds();
        return message;
    }
    requestId() {
        this.lockId();
        const previousValue = this.safeInteger(this.options, 'lastRequestId', 0);
        const newValue = this.sum(previousValue, 1);
        this.options['lastRequestId'] = newValue;
        this.unlockId();
        return newValue;
    }
    createPublicRequest(market, requestId, topicID, suffix = '', unWatch = false) {
        let marketId = market['symbol']; // spot markets use symbol with slash
        if (market['type'] === 'swap') {
            marketId = market['baseId'] + market['quoteId']; // swap markets use symbol without slash
        }
        let action = '1'; // subscribe
        if (unWatch) {
            action = '0'; // unsubscribe
        }
        const request = {
            'sendTopicAction': {
                'Action': action,
                'FilterValue': 'DeepCoin_' + marketId + suffix,
                'LocalNo': requestId,
                'ResumeNo': -1,
                'TopicID': topicID,
            },
        };
        return request;
    }
    async watchPublic(market, messageHash, topicID, params = {}, suffix = '') {
        const url = this.urls['api']['ws']['public'][market['type']];
        const requestId = this.requestId();
        const request = this.createPublicRequest(market, requestId, topicID, suffix);
        const subscription = {
            'subHash': messageHash,
            'id': requestId,
        };
        return await this.watch(url, messageHash, this.deepExtend(request, params), messageHash, subscription);
    }
    async unWatchPublic(market, messageHash, topicID, params = {}, subscription = {}, suffix = '') {
        const url = this.urls['api']['ws']['public'][market['type']];
        const requestId = this.requestId();
        const client = this.client(url);
        const existingSubscription = this.safeDict(client.subscriptions, messageHash);
        if (existingSubscription === undefined) {
            throw new errors.BadRequest(this.id + ' no subscription for ' + messageHash);
        }
        const subId = this.safeInteger(existingSubscription, 'id');
        const request = this.createPublicRequest(market, subId, topicID, suffix, true); // unsubscribe message uses the same id as the original subscribe message
        const unsubHash = 'unsubscribe::' + messageHash;
        subscription = this.extend(subscription, {
            'subHash': messageHash,
            'unsubHash': unsubHash,
            'symbols': [market['symbol']],
            'id': requestId,
        });
        return await this.watch(url, unsubHash, this.deepExtend(request, params), unsubHash, subscription);
    }
    async watchPrivate(messageHash, params = {}) {
        const listenKey = await this.authenticate();
        const url = this.urls['api']['ws']['private'] + '?listenKey=' + listenKey;
        return await this.watch(url, messageHash, undefined, 'private', params);
    }
    async authenticate(params = {}) {
        this.checkRequiredCredentials();
        const time = this.milliseconds();
        let listenKeyExpiryTimestamp = this.safeInteger(this.options, 'listenKeyExpiryTimestamp', time);
        const expired = (time - listenKeyExpiryTimestamp) > 60000; // 1 minute before expiry
        let listenKey = this.safeString(this.options, 'listenKey');
        let response = undefined;
        if (listenKey === undefined) {
            response = await this.privateGetDeepcoinListenkeyAcquire(params);
        }
        else if (expired) {
            const method = this.safeString(this.options, 'method', 'privateGetDeepcoinListenkeyExtend');
            const getNewKey = (method === 'privateGetDeepcoinListenkeyAcquire');
            if (getNewKey) {
                response = await this.privateGetDeepcoinListenkeyAcquire(params);
            }
            else {
                const request = {
                    'listenkey': listenKey,
                };
                response = await this.privateGetDeepcoinListenkeyExtend(this.extend(request, params));
            }
        }
        if (response !== undefined) {
            const data = this.safeDict(response, 'data', {});
            listenKey = this.safeString(data, 'listenkey');
            listenKeyExpiryTimestamp = this.safeTimestamp(data, 'expire_time');
            this.options['listenKey'] = listenKey;
            this.options['listenKeyExpiryTimestamp'] = listenKeyExpiryTimestamp;
        }
        return listenKey;
    }
    /**
     * @method
     * @name deepcoin#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://www.deepcoin.com/docs/publicWS/latestMarketData
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async watchTicker(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const messageHash = 'ticker' + '::' + market['symbol'];
        return await this.watchPublic(market, messageHash, '7', params);
    }
    /**
     * @method
     * @name deepcoin#unWatchTicker
     * @description unWatches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://www.deepcoin.com/docs/publicWS/latestMarketData
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async unWatchTicker(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const messageHash = 'ticker' + '::' + market['symbol'];
        const subscription = {
            'topic': 'ticker',
        };
        return await this.unWatchPublic(market, messageHash, '7', params, subscription);
    }
    handleTicker(client, message) {
        //
        //     a: 'PO',
        //     m: 'Success',
        //     tt: 1760913034780,
        //     mt: 1760913034780,
        //     r: [
        //         {
        //             d: {
        //                 I: 'BTC/USDT',
        //                 U: 1760913034742,
        //                 PF: 0,
        //                 E: 0,
        //                 O: 108479.9,
        //                 H: 109449.9,
        //                 L: 108238,
        //                 V: 789.3424915,
        //                 T: 43003872.3705223,
        //                 N: 109345,
        //                 M: 87294.7,
        //                 D: 0,
        //                 V2: 3086.4496105,
        //                 T2: 332811624.339836,
        //                 F: 0,
        //                 C: 0,
        //                 BP1: 109344.9,
        //                 AP1: 109345.2
        //             }
        //         }
        //     ]
        //
        const response = this.safeList(message, 'r', []);
        const first = this.safeDict(response, 0, {});
        const data = this.safeDict(first, 'd', {});
        const marketId = this.safeString(data, 'I');
        const market = this.safeMarket(marketId, undefined, '/');
        const symbol = this.safeSymbol(marketId, market);
        const parsedTicker = this.parseWsTicker(data, market);
        const messageHash = 'ticker' + '::' + symbol;
        this.tickers[symbol] = parsedTicker;
        client.resolve(parsedTicker, messageHash);
    }
    parseWsTicker(ticker, market = undefined) {
        //
        //     {
        //         I: 'BTC/USDT',
        //         U: 1760913034742,
        //         PF: 0,
        //         E: 0,
        //         O: 108479.9,
        //         H: 109449.9,
        //         L: 108238,
        //         V: 789.3424915,
        //         T: 43003872.3705223,
        //         N: 109345,
        //         M: 87294.7,
        //         D: 0,
        //         V2: 3086.4496105,
        //         T2: 332811624.339836,
        //         F: 0,
        //         C: 0,
        //         BP1: 109344.9,
        //         AP1: 109345.2
        //     }
        //
        const timestamp = this.safeInteger(ticker, 'U');
        const high = this.safeNumber(ticker, 'H');
        const low = this.safeNumber(ticker, 'L');
        const open = this.safeNumber(ticker, 'O');
        const last = this.safeNumber(ticker, 'N');
        const bid = this.safeNumber(ticker, 'BP1');
        const ask = this.safeNumber(ticker, 'AP1');
        let baseVolume = this.safeNumber(ticker, 'V');
        let quoteVolume = this.safeNumber(ticker, 'T');
        if (market['inverse']) {
            const temp = baseVolume;
            baseVolume = quoteVolume;
            quoteVolume = temp;
        }
        return this.safeTicker({
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'high': high,
            'low': low,
            'bid': bid,
            'bidVolume': undefined,
            'ask': ask,
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        }, market);
    }
    /**
     * @method
     * @name deepcoin#watchTrades
     * @description watches information on multiple trades made in a market
     * @see https://www.deepcoin.com/docs/publicWS/lastTransactions
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    async watchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const messageHash = 'trades' + '::' + market['symbol'];
        const trades = await this.watchPublic(market, messageHash, '2', params);
        if (this.newUpdates) {
            limit = trades.getLimit(symbol, limit);
        }
        return this.filterBySinceLimit(trades, since, limit, 'timestamp', true);
    }
    /**
     * @method
     * @name deepcoin#unWatchTrades
     * @description unWatches the list of most recent trades for a particular symbol
     * @see https://www.deepcoin.com/docs/publicWS/lastTransactions
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    async unWatchTrades(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const messageHash = 'trades' + '::' + market['symbol'];
        const subscription = {
            'topic': 'trades',
        };
        return await this.unWatchPublic(market, messageHash, '2', params, subscription);
    }
    handleTrades(client, message) {
        //
        //     {
        //         "a": "PMT",
        //         "b": 0,
        //         "tt": 1760968672380,
        //         "mt": 1760968672380,
        //         "r": [
        //             {
        //                 "d": {
        //                     "TradeID": "1001056452325378",
        //                     "I": "BTC/USDT",
        //                     "D": "1",
        //                     "P": 111061,
        //                     "V": 0.00137,
        //                     "T": 1760968672
        //                 }
        //             }
        //         ]
        //     }
        //
        const response = this.safeList(message, 'r', []);
        const first = this.safeDict(response, 0, {});
        const data = this.safeDict(first, 'd', {});
        const marketId = this.safeString(data, 'I');
        const market = this.safeMarket(marketId, undefined, '/');
        const symbol = this.safeSymbol(marketId, market);
        if (!(symbol in this.trades)) {
            const limit = this.safeInteger(this.options, 'tradesLimit', 1000);
            this.trades[symbol] = new Cache.ArrayCache(limit);
        }
        const strored = this.trades[symbol];
        if (data !== undefined) {
            const trade = this.parseWsTrade(data, market);
            strored.append(trade);
        }
        const messageHash = 'trades' + '::' + symbol;
        client.resolve(strored, messageHash);
    }
    parseWsTrade(trade, market = undefined) {
        //
        // watchTrades
        //     {
        //         "TradeID": "1001056452325378",
        //         "I": "BTC/USDT",
        //         "D": "1",
        //         "P": 111061,
        //         "V": 0.00137,
        //         "T": 1760968672
        //     }
        //
        // watchMyTrades
        //     {
        //         "A": "9256245",
        //         "CC": "USDT",
        //         "CP": 0,
        //         "D": "0",
        //         "F": 0.152,
        //         "I": "DOGE/USDT",
        //         "IT": 1761048103,
        //         "M": "9256245",
        //         "OS": "1001437462198486",
        //         "P": 0.19443,
        //         "T": 14.77668,
        //         "TI": "1001056459096708",
        //         "TT": 1761048103,
        //         "V": 76,
        //         "f": "DOGE",
        //         "l": 1,
        //         "m": "1",
        //         "o": "0"
        //     }
        //
        const direction = this.safeString(trade, 'D');
        const timestamp = this.safeTimestamp2(trade, 'TT', 'T');
        const matchRole = this.safeString(trade, 'm');
        let fee = undefined;
        const feeCost = this.safeString(trade, 'F');
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': this.safeCurrencyCode(this.safeString(trade, 'f')),
            };
        }
        return this.safeTrade({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'symbol': market['symbol'],
            'id': this.safeString2(trade, 'TradeID', 'TI'),
            'order': this.safeString(trade, 'OS'),
            'type': undefined,
            'takerOrMaker': this.handleTakerOrMaker(matchRole),
            'side': this.parseTradeSide(direction),
            'price': this.safeString(trade, 'P'),
            'amount': this.safeString(trade, 'V'),
            'cost': this.safeString(trade, 'T'),
            'fee': fee,
        }, market);
    }
    parseTradeSide(direction) {
        const sides = {
            '0': 'buy',
            '1': 'sell',
        };
        return this.safeString(sides, direction, direction);
    }
    handleTakerOrMaker(matchRole) {
        const roles = {
            '0': 'maker',
            '1': 'taker',
        };
        return this.safeString(roles, matchRole, matchRole);
    }
    /**
     * @method
     * @name deepcoin#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://www.deepcoin.com/docs/publicWS/KLines
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} [timeframe] the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async watchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        symbol = market['symbol'];
        const timeframes = this.safeDict(this.options, 'timeframes', {});
        const interval = this.safeString(timeframes, timeframe, timeframe);
        const messageHash = 'ohlcv' + '::' + symbol + '::' + timeframe;
        const suffix = '_' + interval;
        const ohlcv = await this.watchPublic(market, messageHash, '11', params, suffix);
        if (this.newUpdates) {
            limit = ohlcv.getLimit(symbol, limit);
        }
        return this.filterBySinceLimit(ohlcv, since, limit, 0, true);
    }
    /**
     * @method
     * @name deepcoin#unWatchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://docs.backpack.exchange/#tag/Streams/Public/K-Line
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} [timeframe] the length of time each candle represents
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async unWatchOHLCV(symbol, timeframe = '1m', params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        symbol = market['symbol'];
        const timeframes = this.safeDict(this.options, 'timeframes', {});
        const interval = this.safeString(timeframes, timeframe, timeframe);
        const messageHash = 'ohlcv' + '::' + symbol + '::' + timeframe;
        const suffix = '_' + interval;
        const subscription = {
            'topic': 'ohlcv',
            'symbolsAndTimeframes': [[symbol, timeframe]],
        };
        return await this.unWatchPublic(market, messageHash, '11', params, subscription, suffix);
    }
    handleOHLCV(client, message) {
        //
        //     {
        //         "a": "PK",
        //         "tt": 1760972831580,
        //         "mt": 1760972831580,
        //         "r": [
        //             {
        //                 "d": {
        //                     "I": "BTC/USDT",
        //                     "P": "1m",
        //                     "B": 1760972820,
        //                     "O": 111373,
        //                     "C": 111382.9,
        //                     "H": 111382.9,
        //                     "L": 111373,
        //                     "V": 0.2414172,
        //                     "M": 26888.19693324
        //                 },
        //                 "t": "LK"
        //             }
        //         ]
        //     }
        //
        const response = this.safeList(message, 'r', []);
        const first = this.safeDict(response, 0, {});
        const data = this.safeDict(first, 'd', {});
        const marketId = this.safeString(data, 'I');
        const market = this.safeMarket(marketId, undefined, '/');
        const symbol = this.safeSymbol(marketId, market);
        const interval = this.safeString(data, 'P');
        const timeframe = this.findTimeframe(interval);
        if (!(symbol in this.ohlcvs)) {
            this.ohlcvs[symbol] = {};
        }
        if (!(timeframe in this.ohlcvs[symbol])) {
            const limit = this.safeInteger(this.options, 'OHLCVLimit', 1000);
            this.ohlcvs[symbol][timeframe] = new Cache.ArrayCacheByTimestamp(limit);
        }
        const stored = this.ohlcvs[symbol][timeframe];
        if (data !== undefined) {
            const ohlcv = this.parseWsOHLCV(data, market);
            stored.append(ohlcv);
        }
        const messageHash = 'ohlcv' + '::' + symbol + '::' + timeframe;
        client.resolve(stored, messageHash);
    }
    parseWsOHLCV(ohlcv, market = undefined) {
        //
        //     {
        //         "I": "BTC/USDT",
        //         "P": "1m",
        //         "B": 1760972820,
        //         "O": 111373,
        //         "C": 111382.9,
        //         "H": 111382.9,
        //         "L": 111373,
        //         "V": 0.2414172,
        //         "M": 26888.19693324
        //     }
        //
        return [
            this.safeTimestamp(ohlcv, 'B'),
            this.safeNumber(ohlcv, 'O'),
            this.safeNumber(ohlcv, 'H'),
            this.safeNumber(ohlcv, 'L'),
            this.safeNumber(ohlcv, 'C'),
            this.safeNumber(ohlcv, 'V'),
        ];
    }
    /**
     * @method
     * @name deepcoin#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://www.deepcoin.com/docs/publicWS/25LevelIncrementalMarketData
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return.
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBook(symbol, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const messageHash = 'orderbook' + '::' + market['symbol'];
        const suffix = '_0.1';
        const orderbook = await this.watchPublic(market, messageHash, '25', params, suffix);
        return orderbook.limit();
    }
    /**
     * @method
     * @name deepcoin#unWatchOrderBook
     * @description unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://www.deepcoin.com/docs/publicWS/25LevelIncrementalMarketData
     * @param {string} symbol unified array of symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbols
     */
    async unWatchOrderBook(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const messageHash = 'orderbook' + '::' + market['symbol'];
        const suffix = '_0.1';
        const subscription = {
            'topic': 'orderbook',
        };
        return await this.unWatchPublic(market, messageHash, '25', params, subscription, suffix);
    }
    handleOrderBook(client, message) {
        //
        //     {
        //         "a": "PMO",
        //         "t": "i", // i - update, f - snapshot
        //         "r": [
        //             {
        //                 "d": { "I": "ETH/USDT", "D": "1", "P": 4021, "V": 54.39979 }
        //             },
        //             {
        //                 "d": { "I": "ETH/USDT", "D": "0", "P": 4021.1, "V": 49.56724 }
        //             }
        //         ],
        //         "tt": 1760975816446,
        //         "mt": 1760975816446
        //     }
        //
        const response = this.safeList(message, 'r', []);
        const first = this.safeDict(response, 0, {});
        const data = this.safeDict(first, 'd', {});
        const marketId = this.safeString(data, 'I');
        const market = this.safeMarket(marketId, undefined, '/');
        const symbol = this.safeSymbol(marketId, market);
        if (!(symbol in this.orderbooks)) {
            this.orderbooks[symbol] = this.orderBook();
        }
        const orderbook = this.orderbooks[symbol];
        const type = this.safeString(message, 't');
        if (orderbook['timestamp'] === undefined) {
            if (type === 'f') {
                // snapshot
                this.handleOrderBookSnapshot(client, message);
            }
            else {
                // cache the updates until the snapshot is received
                orderbook.cache.push(message);
            }
        }
        else {
            this.handleOrderBookMessage(client, message, orderbook);
            const messageHash = 'orderbook' + '::' + symbol;
            client.resolve(orderbook, messageHash);
        }
    }
    handleOrderBookSnapshot(client, message) {
        const entries = this.safeList(message, 'r', []);
        const first = this.safeDict(entries, 0, {});
        const data = this.safeDict(first, 'd', {});
        const marketId = this.safeString(data, 'I');
        const market = this.safeMarket(marketId, undefined, '/');
        const symbol = this.safeSymbol(marketId, market);
        const orderbook = this.orderbooks[symbol];
        const orderedEntries = {
            'bids': [],
            'asks': [],
        };
        for (let i = 0; i < entries.length; i++) {
            const entry = entries[i];
            const entryData = this.safeDict(entry, 'd', {});
            const side = this.safeString(entryData, 'D');
            const price = this.safeNumber(entryData, 'P');
            const volume = this.safeNumber(entryData, 'V');
            if (side === '0') {
                // bid
                orderedEntries['bids'].push([price, volume]);
            }
            else if (side === '1') {
                // ask
                orderedEntries['asks'].push([price, volume]);
            }
        }
        const timestamp = this.safeInteger(message, 'mt');
        const snapshot = this.parseOrderBook(orderedEntries, symbol, timestamp);
        orderbook.reset(snapshot);
        const cachedMessages = orderbook.cache;
        for (let j = 0; j < cachedMessages.length; j++) {
            const cachedMessage = cachedMessages[j];
            this.handleOrderBookMessage(client, cachedMessage, orderbook);
        }
        orderbook.cache = [];
        const messageHash = 'orderbook' + '::' + symbol;
        client.resolve(orderbook, messageHash);
    }
    handleOrderBookMessage(client, message, orderbook) {
        //     {
        //         "a": "PMO",
        //         "t": "i", // i - update, f - snapshot
        //         "r": [
        //             {
        //                 "d": { "I": "ETH/USDT", "D": "1", "P": 4021, "V": 54.39979 }
        //             },
        //             {
        //                 "d": { "I": "ETH/USDT", "D": "0", "P": 4021.1, "V": 49.56724 }
        //             }
        //         ],
        //         "tt": 1760975816446,
        //         "mt": 1760975816446
        //     }
        //
        const timestamp = this.safeInteger(message, 'mt');
        if (timestamp > orderbook['timestamp']) {
            const response = this.safeList(message, 'r', []);
            this.handleDeltas(orderbook, response);
            orderbook['timestamp'] = timestamp;
            orderbook['datetime'] = this.iso8601(timestamp);
        }
    }
    handleDelta(orderbook, entry) {
        const data = this.safeDict(entry, 'd', {});
        const bids = orderbook['bids'];
        const asks = orderbook['asks'];
        const side = this.safeString(data, 'D');
        const price = this.safeNumber(data, 'P');
        const volume = this.safeNumber(data, 'V');
        if (side === '0') {
            // bid
            bids.store(price, volume);
        }
        else if (side === '1') {
            // ask
            asks.store(price, volume);
        }
    }
    /**
     * @method
     * @name deepcoin#watchMyTrades
     * @description watches information on multiple trades made by the user
     * @see https://www.deepcoin.com/docs/privateWS/Trade
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async watchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let messageHash = 'myTrades';
        await this.loadMarkets();
        if (symbol !== undefined) {
            symbol = this.symbol(symbol);
            messageHash += '::' + symbol;
        }
        const trades = await this.watchPrivate(messageHash, params);
        if (this.newUpdates) {
            limit = trades.getLimit(symbol, limit);
        }
        return this.filterBySymbolSinceLimit(trades, symbol, since, limit, true);
    }
    handleMyTrade(client, message) {
        //
        //     {
        //         "action": "PushTrade",
        //         "result": [
        //             {
        //                 "table": "Trade",
        //                 "data": {
        //                     "A": "9256245",
        //                     "CC": "USDT",
        //                     "CP": 0,
        //                     "D": "0",
        //                     "F": 0.152,
        //                     "I": "DOGE/USDT",
        //                     "IT": 1761048103,
        //                     "M": "9256245",
        //                     "OS": "1001437462198486",
        //                     "P": 0.19443,
        //                     "T": 14.77668,
        //                     "TI": "1001056459096708",
        //                     "TT": 1761048103,
        //                     "V": 76,
        //                     "f": "DOGE",
        //                     "l": 1,
        //                     "m": "1",
        //                     "o": "0"
        //                 }
        //             }
        //         ]
        //     }
        //
        const result = this.safeList(message, 'result', []);
        const first = this.safeDict(result, 0, {});
        const data = this.safeDict(first, 'data', {});
        const marketId = this.safeString(data, 'I');
        const market = this.safeMarket(marketId, undefined, '/');
        const symbol = this.safeSymbol(marketId, market);
        const messageHash = 'myTrades';
        const symbolMessageHash = messageHash + '::' + symbol;
        if ((messageHash in client.futures) || (symbolMessageHash in client.futures)) {
            if (this.myTrades === undefined) {
                const limit = this.safeInteger(this.options, 'tradesLimit', 1000);
                this.myTrades = new Cache.ArrayCacheBySymbolById(limit);
            }
            const stored = this.myTrades;
            const parsed = this.parseWsTrade(data, market);
            stored.append(parsed);
            client.resolve(stored, messageHash);
            client.resolve(stored, symbolMessageHash);
        }
    }
    /**
     * @method
     * @name deepcoin#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://www.deepcoin.com/docs/privateWS/order
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async watchOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let messageHash = 'orders';
        await this.loadMarkets();
        if (symbol !== undefined) {
            symbol = this.symbol(symbol);
            messageHash += '::' + symbol;
        }
        const orders = await this.watchPrivate(messageHash, params);
        if (this.newUpdates) {
            limit = orders.getLimit(symbol, limit);
        }
        return this.filterBySymbolSinceLimit(orders, symbol, since, limit, true);
    }
    handleOrder(client, message) {
        //
        //     {
        //         "action": "PushOrder",
        //         "result": [
        //             {
        //                 "table": "Order",
        //                 "data": {
        //                     "D": "0",
        //                     "I": "DOGE/USDT",
        //                     "IT": 1761051006,
        //                     "L": "1001437480817468",
        //                     "OPT": "4",
        //                     "OS": "1001437480817468",
        //                     "OT": "0",
        //                     "Or": "1",
        //                     "P": 0.19537,
        //                     "T": 14.84128,
        //                     "U": 1761051006,
        //                     "V": 76,
        //                     "VT": 76,
        //                     "i": 1,
        //                     "l": 1,
        //                     "o": "0",
        //                     "p": "0",
        //                     "t": 0.19528
        //                 }
        //             }
        //         ]
        //     }
        //
        const result = this.safeList(message, 'result', []);
        const first = this.safeDict(result, 0, {});
        const data = this.safeDict(first, 'data', {});
        const marketId = this.safeString(data, 'I');
        const market = this.safeMarket(marketId, undefined, '/');
        const symbol = this.safeSymbol(marketId, market);
        const messageHash = 'orders';
        const symbolMessageHash = messageHash + '::' + symbol;
        if ((messageHash in client.futures) || (symbolMessageHash in client.futures)) {
            if (this.orders === undefined) {
                const limit = this.safeInteger(this.options, 'ordersLimit', 1000);
                this.orders = new Cache.ArrayCacheBySymbolById(limit);
            }
            const parsed = this.parseWsOrder(data, market);
            this.orders.append(parsed);
            client.resolve(this.orders, messageHash);
            client.resolve(this.orders, symbolMessageHash);
        }
    }
    parseWsOrder(order, market = undefined) {
        //
        //     {
        //         "D": "0",
        //         "I": "DOGE/USDT",
        //         "IT": 1761051006,
        //         "L": "1001437480817468",
        //         "OPT": "4",
        //         "OS": "1001437480817468",
        //         "OT": "0",
        //         "Or": "1",
        //         "P": 0.19537,
        //         "T": 14.84128,
        //         "U": 1761051006,
        //         "V": 76,
        //         "VT": 76,
        //         "i": 1,
        //         "l": 1,
        //         "o": "0",
        //         "p": "0",
        //         "t": 0.19528
        //     }
        //
        const state = this.safeString(order, 'Or');
        const timestamp = this.safeTimestamp(order, 'IT');
        const direction = this.safeString(order, 'D');
        return this.safeOrder({
            'id': this.safeString(order, 'OS'),
            'clientOrderId': undefined,
            'datetime': this.iso8601(timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': undefined,
            'lastUpdateTimestamp': this.safeTimestamp(order, 'U'),
            'status': this.parseWsOrderStatus(state),
            'symbol': market['symbol'],
            'type': undefined,
            'timeInForce': undefined,
            'side': this.parseTradeSide(direction),
            'price': this.safeString(order, 'P'),
            'average': this.safeString(order, 't'),
            'amount': this.safeString(order, 'V'),
            'filled': this.safeString(order, 'VT'),
            'remaining': undefined,
            'triggerPrice': undefined,
            'takeProfitPrice': this.safeString(order, 'TPT'),
            'stopLossPrice': this.safeString(order, 'SLT'),
            'cost': this.safeString(order, 'T'),
            'trades': undefined,
            'fee': undefined,
            'reduceOnly': undefined,
            'postOnly': undefined,
            'info': order,
        }, market);
    }
    parseWsOrderStatus(status) {
        const statuses = {
            '1': 'closed',
            '4': 'open',
            '6': 'canceled',
        };
        return this.safeString(statuses, status, status);
    }
    /**
     * @method
     * @name deepcoin#watchPositions
     * @description watch all open positions
     * @see https://www.deepcoin.com/docs/privateWS/Position
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
        if (symbols !== undefined) {
            for (let i = 0; i < symbols.length; i++) {
                const symbol = symbols[i];
                const symbolMessageHash = messageHash + '::' + symbol;
                messageHashes.push(symbolMessageHash);
            }
        }
        else {
            messageHashes.push(messageHash);
        }
        const url = this.urls['api']['ws']['private'] + '?listenKey=' + listenKey;
        const positions = await this.watchMultiple(url, messageHashes, params, ['private']);
        if (this.newUpdates) {
            return positions;
        }
        return this.filterBySymbolsSinceLimit(this.positions, symbols, since, limit, true);
    }
    handlePosition(client, message) {
        //
        //     {
        //         "action": "PushPosition",
        //         "result": [
        //             {
        //                 "table": "Position",
        //                 "data": {
        //                     "A": "9256245",
        //                     "CP": 0,
        //                     "I": "DOGE/USDT",
        //                     "M": "9256245",
        //                     "OP": 0.198845,
        //                     "Po": 151.696,
        //                     "U": 1761058213,
        //                     "i": 1,
        //                     "l": 1,
        //                     "p": "0",
        //                     "u": 0
        //                 }
        //             }
        //         ]
        //     }
        //
        const result = this.safeList(message, 'result', []);
        const first = this.safeDict(result, 0, {});
        const data = this.safeDict(first, 'data', {});
        const marketId = this.safeString(data, 'I');
        const market = this.safeMarket(marketId, undefined, '/');
        const symbol = this.safeSymbol(marketId, market);
        const messageHash = 'positions';
        const symbolMessageHash = messageHash + '::' + symbol;
        if ((messageHash in client.futures) || (symbolMessageHash in client.futures)) {
            if (this.positions === undefined) {
                this.positions = new Cache.ArrayCacheBySymbolBySide();
            }
            const parsed = this.parseWsPosition(data, market);
            this.positions.append(parsed);
            client.resolve(this.positions, messageHash);
            client.resolve(this.positions, symbolMessageHash);
        }
    }
    parseWsPosition(position, market = undefined) {
        //
        //     {
        //         "A": "9256245",
        //         "CP": 0,
        //         "I": "DOGE/USDT",
        //         "M": "9256245",
        //         "OP": 0.198845,
        //         "Po": 151.696,
        //         "U": 1761058213,
        //         "i": 1,
        //         "l": 1,
        //         "p": "0",
        //         "u": 0
        //     }
        //
        const timestamp = this.safeInteger(position, 'U');
        const direction = this.safeString(position, 'p');
        const marginMode = this.safeString(position, 'i');
        return this.safePosition({
            'symbol': market['symbol'],
            'id': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'contracts': this.safeString(position, 'Po'),
            'contractSize': undefined,
            'side': this.parsePositionSide(direction),
            'notional': undefined,
            'leverage': this.omitZero(this.safeString(position, 'l')),
            'unrealizedPnl': undefined,
            'realizedPnl': undefined,
            'collateral': undefined,
            'entryPrice': this.safeString(position, 'OP'),
            'markPrice': undefined,
            'liquidationPrice': undefined,
            'marginMode': this.parseWsMarginMode(marginMode),
            'hedged': true,
            'maintenanceMargin': this.safeString(position, 'u'),
            'maintenanceMarginPercentage': undefined,
            'initialMargin': undefined,
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
    parsePositionSide(direction) {
        if (direction === undefined) {
            return direction;
        }
        const directions = {
            '0': 'long',
            '1': 'short',
        };
        return this.safeString(directions, direction, direction);
    }
    parseWsMarginMode(marginMode) {
        if (marginMode === undefined) {
            return marginMode;
        }
        const modes = {
            '0': 'isolated',
            '1': 'cross',
        };
        return this.safeString(modes, marginMode, marginMode);
    }
    handleMessage(client, message) {
        if (message === 'pong') {
            this.handlePong(client, message);
        }
        else {
            const m = this.safeString(message, 'm');
            if ((m !== undefined) && (m !== 'Success')) {
                this.handleErrorMessage(client, message);
            }
            const action = this.safeString2(message, 'a', 'action');
            if (action === 'RecvTopicAction') {
                this.handleSubscriptionStatus(client, message);
            }
            else if (action === 'PO') {
                this.handleTicker(client, message);
            }
            else if (action === 'PMT') {
                this.handleTrades(client, message);
            }
            else if (action === 'PK') {
                this.handleOHLCV(client, message);
            }
            else if (action === 'PMO') {
                this.handleOrderBook(client, message);
            }
            else if (action === 'PushTrade') {
                this.handleMyTrade(client, message);
            }
            else if (action === 'PushOrder') {
                this.handleOrder(client, message);
            }
            else if (action === 'PushPosition') {
                this.handlePosition(client, message);
            }
        }
    }
    handleSubscriptionStatus(client, message) {
        //
        //     {
        //         "a": "RecvTopicAction",
        //         "m": "Success",
        //         "r": [
        //             {
        //                 "d": {
        //                     "A": "0",
        //                     "L": 1,
        //                     "T": "7",
        //                     "F": "DeepCoin_BTC/USDT",
        //                     "R": -1
        //                 }
        //             }
        //         ]
        //     }
        //
        const response = this.safeList(message, 'r', []);
        const first = this.safeDict(response, 0, {});
        const data = this.safeDict(first, 'd', {});
        const action = this.safeString(data, 'A'); // 1 = subscribe, 0 = unsubscribe
        if (action === '0') {
            const subscriptionsById = this.indexBy(client.subscriptions, 'id');
            const subId = this.safeInteger(data, 'L');
            const subscription = this.safeDict(subscriptionsById, subId, {}); // original watch subscription
            const subHash = this.safeString(subscription, 'subHash');
            const unsubHash = 'unsubscribe::' + subHash;
            const unsubsciption = this.safeDict(client.subscriptions, unsubHash, {}); // unWatch subscription
            this.handleUnSubscription(client, unsubsciption);
        }
    }
    handleUnSubscription(client, subscription) {
        const subHash = this.safeString(subscription, 'subHash');
        const unsubHash = this.safeString(subscription, 'unsubHash');
        this.cleanUnsubscription(client, subHash, unsubHash);
        this.cleanCache(subscription);
    }
    handleErrorMessage(client, message) {
        //
        //     {
        //         "a": "RecvTopicAction",
        //         "m": "subscription cluster does not "exist": BTC/USD",
        //         "r": [
        //             {
        //                 "d": {
        //                     "A": "1",
        //                     "L": 1,
        //                     "T": "7",
        //                     "F": "DeepCoin_BTC/USD",
        //                     "R": -1
        //                 }
        //             }
        //         ]
        //     }
        //
        const messageText = this.safeString(message, 'm', '');
        const response = this.safeList(message, 'r', []);
        const first = this.safeDict(response, 0, {});
        const data = this.safeDict(first, 'd', {});
        const requestId = this.safeInteger(data, 'L');
        const subscriptionsById = this.indexBy(client.subscriptions, 'id');
        const subscription = this.safeDict(subscriptionsById, requestId, {});
        const messageHash = this.safeString(subscription, 'subHash');
        const feedback = this.id + ' ' + this.json(message);
        try {
            this.throwExactlyMatchedException(this.exceptions['exact'], messageText, feedback);
            this.throwBroadlyMatchedException(this.exceptions['broad'], messageText, feedback);
            throw new errors.ExchangeError(feedback);
        }
        catch (e) {
            client.reject(e, messageHash);
        }
    }
}

exports["default"] = deepcoin;
