'use strict';

var coincatch$1 = require('../coincatch.js');
var errors = require('../base/errors.js');
var Precise = require('../base/Precise.js');
var sha256 = require('../static_dependencies/noble-hashes/sha256.js');
var Cache = require('../base/ws/Cache.js');

//  ---------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
class coincatch extends coincatch$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'has': {
                'ws': true,
                'watchTrades': true,
                'watchTradesForSymbols': true,
                'watchOrderBook': true,
                'watchOrderBookForSymbols': true,
                'watchOHLCV': true,
                'watchOHLCVForSymbols': false,
                'watchOrders': true,
                'watchMyTrades': false,
                'watchTicker': true,
                'watchTickers': true,
                'watchBalance': true,
                'watchPositions': true,
            },
            'urls': {
                'api': {
                    'ws': {
                        'public': 'wss://ws.coincatch.com/public/v1/stream',
                        'private': 'wss://ws.coincatch.com/private/v1/stream',
                    },
                },
            },
            'options': {
                'tradesLimit': 1000,
                'OHLCVLimit': 200,
                'timeframesForWs': {
                    '1m': '1m',
                    '5m': '5m',
                    '15m': '15m',
                    '30m': '30m',
                    '1h': '1H',
                    '4h': '4H',
                    '12h': '12H',
                    '1d': '1D',
                    '1w': '1W',
                },
                'watchOrderBook': {
                    'checksum': true,
                },
            },
            'streaming': {
                'ping': this.ping,
            },
            'exceptions': {
                'ws': {
                    'exact': {
                        '30001': errors.BadRequest,
                        '30002': errors.AuthenticationError,
                        '30003': errors.BadRequest,
                        '30004': errors.AuthenticationError,
                        '30005': errors.AuthenticationError,
                        '30006': errors.RateLimitExceeded,
                        '30007': errors.RateLimitExceeded,
                        '30011': errors.AuthenticationError,
                        '30012': errors.AuthenticationError,
                        '30013': errors.AuthenticationError,
                        '30014': errors.BadRequest,
                        '30015': errors.AuthenticationError, // { event: 'error', code: 30015, msg: 'Invalid sign' }
                    },
                    'broad': {},
                },
            },
        });
    }
    getMarketFromArg(entry) {
        const instId = this.safeString(entry, 'instId');
        const instType = this.safeString(entry, 'instType');
        const baseAndQuote = this.parseSpotMarketId(instId);
        const baseId = baseAndQuote['baseId'];
        const quoteId = baseAndQuote['quoteId'];
        let suffix = '_SPBL'; // spot suffix
        if (instType === 'mc') {
            if (quoteId === 'USD') {
                suffix = '_DMCBL';
            }
            else {
                suffix = '_UMCBL';
            }
        }
        const marketId = this.safeCurrencyCode(baseId) + this.safeCurrencyCode(quoteId) + suffix;
        return this.safeMarketCustom(marketId);
    }
    async authenticate(params = {}) {
        this.checkRequiredCredentials();
        const url = this.urls['api']['ws']['private'];
        const client = this.client(url);
        const messageHash = 'authenticated';
        const future = client.future(messageHash);
        const authenticated = this.safeValue(client.subscriptions, messageHash);
        if (authenticated === undefined) {
            const timestamp = this.seconds().toString();
            const auth = timestamp + 'GET' + '/user/verify';
            const signature = this.hmac(this.encode(auth), this.encode(this.secret), sha256.sha256, 'base64');
            const operation = 'login';
            const request = {
                'op': operation,
                'args': [
                    {
                        'apiKey': this.apiKey,
                        'passphrase': this.password,
                        'timestamp': timestamp,
                        'sign': signature,
                    },
                ],
            };
            const message = this.extend(request, params);
            this.watch(url, messageHash, message, messageHash);
        }
        return await future;
    }
    async watchPublic(messageHash, subscribeHash, args, params = {}) {
        const url = this.urls['api']['ws']['public'];
        const request = {
            'op': 'subscribe',
            'args': [args],
        };
        const message = this.extend(request, params);
        return await this.watch(url, messageHash, message, subscribeHash);
    }
    async unWatchPublic(messageHash, args, params = {}) {
        const url = this.urls['api']['ws']['public'];
        const request = {
            'op': 'unsubscribe',
            'args': [args],
        };
        const message = this.extend(request, params);
        return await this.watch(url, messageHash, message, messageHash);
    }
    async watchPrivate(messageHash, subscribeHash, args, params = {}) {
        await this.authenticate();
        const url = this.urls['api']['ws']['private'];
        const request = {
            'op': 'subscribe',
            'args': [args],
        };
        const message = this.extend(request, params);
        return await this.watch(url, messageHash, message, subscribeHash);
    }
    async watchPrivateMultiple(messageHashes, subscribeHashes, args, params = {}) {
        await this.authenticate();
        const url = this.urls['api']['ws']['private'];
        const request = {
            'op': 'subscribe',
            'args': args,
        };
        const message = this.extend(request, params);
        return await this.watchMultiple(url, messageHashes, message, subscribeHashes);
    }
    handleAuthenticate(client, message) {
        //
        //  { event: "login", code: 0 }
        //
        const messageHash = 'authenticated';
        const future = this.safeValue(client.futures, messageHash);
        future.resolve(true);
    }
    async watchPublicMultiple(messageHashes, subscribeHashes, argsArray, params = {}) {
        const url = this.urls['api']['ws']['public'];
        const request = {
            'op': 'subscribe',
            'args': argsArray,
        };
        const message = this.extend(request, params);
        return await this.watchMultiple(url, messageHashes, message, subscribeHashes);
    }
    async unWatchChannel(symbol, channel, messageHashTopic, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const [instType, instId] = this.getPublicInstTypeAndId(market);
        const messageHash = 'unsubscribe:' + messageHashTopic + ':' + symbol;
        const args = {
            'instType': instType,
            'channel': channel,
            'instId': instId,
        };
        return await this.unWatchPublic(messageHash, args, params);
    }
    getPublicInstTypeAndId(market) {
        const instId = market['baseId'] + market['quoteId'];
        let instType = undefined;
        if (market['spot']) {
            instType = 'SP';
        }
        else if (market['swap']) {
            instType = 'MC';
        }
        else {
            throw new errors.NotSupported(this.id + ' supports only spot and swap markets');
        }
        return [instType, instId];
    }
    handleDMCBLMarketByMessageHashes(market, hash, client, timeframe = undefined) {
        const marketId = market['id'];
        const messageHashes = this.findMessageHashes(client, hash);
        // the exchange counts DMCBL markets as the same market with different quote currencies
        // for example symbols ETHUSD:ETH and ETH/USD:BTC both have the same marketId ETHUSD_DMCBL
        // we need to check all markets with the same marketId to find the correct market that is in messageHashes
        const marketsWithCurrentId = this.safeList(this.markets_by_id, marketId, []);
        let suffix = '';
        if (timeframe !== undefined) {
            suffix = ':' + timeframe;
        }
        for (let i = 0; i < marketsWithCurrentId.length; i++) {
            market = marketsWithCurrentId[i];
            const symbol = market['symbol'];
            const messageHash = hash + symbol + suffix;
            if (this.inArray(messageHash, messageHashes)) {
                return market;
            }
        }
        return market;
    }
    /**
     * @method
     * @name coincatch#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://coincatch.github.io/github.io/en/spot/#tickers-channel
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.instType] the type of the instrument to fetch the ticker for, 'SP' for spot markets, 'MC' for futures markets (default is 'SP')
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTicker(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const [instType, instId] = this.getPublicInstTypeAndId(market);
        const channel = 'ticker';
        const messageHash = channel + ':' + symbol;
        const args = {
            'instType': instType,
            'channel': channel,
            'instId': instId,
        };
        return await this.watchPublic(messageHash, messageHash, args, params);
    }
    /**
     * @method
     * @name coincatch#unWatchTicker
     * @description unsubscribe from the ticker channel
     * @see https://coincatch.github.io/github.io/en/mix/#tickers-channel
     * @param {string} symbol unified symbol of the market to unwatch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {any} status of the unwatch request
     */
    async unWatchTicker(symbol, params = {}) {
        await this.loadMarkets();
        return await this.unWatchChannel(symbol, 'ticker', 'ticker', params);
    }
    /**
     * @method
     * @name coincatch#watchTickers
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://coincatch.github.io/github.io/en/mix/#tickers-channel
     * @param {string[]} symbols unified symbol of the market to watch the tickers for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTickers(symbols = undefined, params = {}) {
        await this.loadMarkets();
        if (symbols === undefined) {
            symbols = this.symbols;
        }
        const topics = [];
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.market(symbol);
            const [instType, instId] = this.getPublicInstTypeAndId(market);
            const args = {
                'instType': instType,
                'channel': 'ticker',
                'instId': instId,
            };
            topics.push(args);
            messageHashes.push('ticker:' + symbol);
        }
        const tickers = await this.watchPublicMultiple(messageHashes, messageHashes, topics, params);
        if (this.newUpdates) {
            const result = {};
            result[tickers['symbol']] = tickers;
            return result;
        }
        return this.filterByArray(this.tickers, 'symbol', symbols);
    }
    handleTicker(client, message) {
        //
        //     action: 'snapshot',
        //     arg: { instType: 'sp', channel: 'ticker', instId: 'ETHUSDT' },
        //     data: [
        //         {
        //             instId: 'ETHUSDT',
        //             last: '2421.06',
        //             open24h: '2416.93',
        //             high24h: '2441.47',
        //             low24h: '2352.99',
        //             bestBid: '2421.03',
        //             bestAsk: '2421.06',
        //             baseVolume: '9445.2043',
        //             quoteVolume: '22807159.1148',
        //             ts: 1728131730687,
        //             labeId: 0,
        //             openUtc: '2414.50',
        //             chgUTC: '0.00272',
        //             bidSz: '3.866',
        //             askSz: '0.124'
        //         }
        //     ],
        //     ts: 1728131730688
        //
        const arg = this.safeDict(message, 'arg', {});
        let market = this.getMarketFromArg(arg);
        const marketId = market['id'];
        const hash = 'ticker:';
        if (marketId.indexOf('_DMCBL') >= 0) {
            market = this.handleDMCBLMarketByMessageHashes(market, hash, client);
        }
        const data = this.safeList(message, 'data', []);
        const ticker = this.parseWsTicker(this.safeDict(data, 0, {}), market);
        const symbol = market['symbol'];
        this.tickers[symbol] = ticker;
        const messageHash = hash + symbol;
        client.resolve(this.tickers[symbol], messageHash);
    }
    parseWsTicker(ticker, market = undefined) {
        //
        // spot
        //     {
        //         instId: 'ETHUSDT',
        //         last: '2421.06',
        //         open24h: '2416.93',
        //         high24h: '2441.47',
        //         low24h: '2352.99',
        //         bestBid: '2421.03',
        //         bestAsk: '2421.06',
        //         baseVolume: '9445.2043',
        //         quoteVolume: '22807159.1148',
        //         ts: 1728131730687,
        //         labeId: 0,
        //         openUtc: '2414.50',
        //         chgUTC: '0.00272',
        //         bidSz: '3.866',
        //         askSz: '0.124'
        //     }
        //
        // swap
        //     {
        //         instId: 'ETHUSDT',
        //         last: '2434.47',
        //         bestAsk: '2434.48',
        //         bestBid: '2434.47',
        //         high24h: '2471.68',
        //         low24h: '2400.01',
        //         priceChangePercent: '0.00674',
        //         capitalRate: '0.000082',
        //         nextSettleTime: 1728489600000,
        //         systemTime: 1728471993602,
        //         markPrice: '2434.46',
        //         indexPrice: '2435.44',
        //         holding: '171450.25',
        //         baseVolume: '1699298.91',
        //         quoteVolume: '4144522832.32',
        //         openUtc: '2439.67',
        //         chgUTC: '-0.00213',
        //         symbolType: 1,
        //         symbolId: 'ETHUSDT_UMCBL',
        //         deliveryPrice: '0',
        //         bidSz: '26.12',
        //         askSz: '49.6'
        //     }
        //
        const last = this.safeString(ticker, 'last');
        const timestamp = this.safeInteger2(ticker, 'ts', 'systemTime');
        return this.safeTicker({
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'high': this.safeString(ticker, 'high24h'),
            'low': this.safeString(ticker, 'low24h'),
            'bid': this.safeString(ticker, 'bestBid'),
            'bidVolume': this.safeString(ticker, 'bidSz'),
            'ask': this.safeString(ticker, 'bestAsk'),
            'askVolume': this.safeString(ticker, 'askSz'),
            'vwap': undefined,
            'open': this.safeString2(ticker, 'open24h', 'openUtc'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': Precise["default"].stringMul(this.safeString(ticker, 'chgUTC'), '100'),
            'average': undefined,
            'baseVolume': this.safeNumber(ticker, 'baseVolume'),
            'quoteVolume': this.safeNumber(ticker, 'quoteVolume'),
            'indexPrice': this.safeString(ticker, 'indexPrice'),
            'markPrice': this.safeString(ticker, 'markPrice'),
            'info': ticker,
        }, market);
    }
    /**
     * @method
     * @name coincatch#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://coincatch.github.io/github.io/en/spot/#candlesticks-channel
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch (not including)
     * @param {int} [limit] the maximum amount of candles to fetch (not including)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.instType] the type of the instrument to fetch the OHLCV data for, 'SP' for spot markets, 'MC' for futures markets (default is 'SP')
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async watchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const timeframes = this.options['timeframesForWs'];
        const channel = 'candle' + this.safeString(timeframes, timeframe);
        const [instType, instId] = this.getPublicInstTypeAndId(market);
        const args = {
            'instType': instType,
            'channel': channel,
            'instId': instId,
        };
        const messageHash = 'ohlcv:' + symbol + ':' + timeframe;
        const ohlcv = await this.watchPublic(messageHash, messageHash, args, params);
        if (this.newUpdates) {
            limit = ohlcv.getLimit(symbol, limit);
        }
        return this.filterBySinceLimit(ohlcv, since, limit, 0, true);
    }
    /**
     * @method
     * @name coincatch#unWatchOHLCV
     * @description unsubscribe from the ohlcv channel
     * @see https://www.bitget.com/api-doc/spot/websocket/public/Candlesticks-Channel
     * @param {string} symbol unified symbol of the market to unwatch the ohlcv for
     * @param timeframe
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async unWatchOHLCV(symbol, timeframe = '1m', params = {}) {
        await this.loadMarkets();
        const timeframes = this.options['timeframesForWs'];
        const interval = this.safeString(timeframes, timeframe);
        const channel = 'candle' + interval;
        return await this.unWatchChannel(symbol, channel, 'ohlcv:' + interval, params);
    }
    handleOHLCV(client, message) {
        //
        //     {
        //         action: 'update',
        //         arg: { instType: 'sp', channel: 'candle1D', instId: 'ETHUSDT' },
        //         data: [
        //             [
        //                 '1728316800000',
        //                 '2474.5',
        //                 '2478.21',
        //                 '2459.8',
        //                 '2463.51',
        //                 '86.0551'
        //             ]
        //         ],
        //         ts: 1728317607657
        //     }
        //
        const arg = this.safeDict(message, 'arg', {});
        let market = this.getMarketFromArg(arg);
        const marketId = market['id'];
        const hash = 'ohlcv:';
        const data = this.safeList(message, 'data', []);
        const channel = this.safeString(arg, 'channel');
        const klineType = channel.slice(6);
        const timeframe = this.findTimeframe(klineType);
        if (marketId.indexOf('_DMCBL') >= 0) {
            market = this.handleDMCBLMarketByMessageHashes(market, hash, client, timeframe);
        }
        const symbol = market['symbol'];
        if (!(symbol in this.ohlcvs)) {
            this.ohlcvs[symbol] = {};
        }
        if (!(timeframe in this.ohlcvs[symbol])) {
            const limit = this.safeInteger(this.options, 'OHLCVLimit', 1000);
            this.ohlcvs[symbol][timeframe] = new Cache.ArrayCacheByTimestamp(limit);
        }
        const stored = this.ohlcvs[symbol][timeframe];
        for (let i = 0; i < data.length; i++) {
            const candle = this.safeList(data, i, []);
            const parsed = this.parseWsOHLCV(candle, market);
            stored.append(parsed);
        }
        const messageHash = hash + symbol + ':' + timeframe;
        client.resolve(stored, messageHash);
    }
    parseWsOHLCV(ohlcv, market = undefined) {
        //
        //     [
        //         '1728316800000',
        //         '2474.5',
        //         '2478.21',
        //         '2459.8',
        //         '2463.51',
        //         '86.0551'
        //     ]
        //
        return [
            this.safeInteger(ohlcv, 0),
            this.safeNumber(ohlcv, 1),
            this.safeNumber(ohlcv, 2),
            this.safeNumber(ohlcv, 3),
            this.safeNumber(ohlcv, 4),
            this.safeNumber(ohlcv, 5),
        ];
    }
    /**
     * @method
     * @name coincatch#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://coincatch.github.io/github.io/en/spot/#depth-channel
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBook(symbol, limit = undefined, params = {}) {
        return await this.watchOrderBookForSymbols([symbol], limit, params);
    }
    /**
     * @method
     * @name coincatch#unWatchOrderBook
     * @description unsubscribe from the orderbook channel
     * @see https://coincatch.github.io/github.io/en/spot/#depth-channel
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.limit] orderbook limit, default is undefined
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async unWatchOrderBook(symbol, params = {}) {
        await this.loadMarkets();
        let channel = 'books';
        const limit = this.safeInteger(params, 'limit');
        if ((limit === 5) || (limit === 15)) {
            params = this.omit(params, 'limit');
            channel += limit.toString();
        }
        return await this.unWatchChannel(symbol, channel, channel, params);
    }
    /**
     * @method
     * @name coincatch#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://coincatch.github.io/github.io/en/spot/#depth-channel
     * @param symbols
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBookForSymbols(symbols, limit = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols);
        const channel = 'books';
        const topics = [];
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.market(symbol);
            const [instType, instId] = this.getPublicInstTypeAndId(market);
            const args = {
                'instType': instType,
                'channel': channel,
                'instId': instId,
            };
            topics.push(args);
            messageHashes.push(channel + ':' + symbol);
        }
        const orderbook = await this.watchPublicMultiple(messageHashes, messageHashes, topics, params);
        return orderbook.limit();
    }
    handleOrderBook(client, message) {
        //
        //     {
        //         action: 'update',
        //         arg: { instType: 'sp', channel: 'books', instId: 'ETHUSDT' },
        //         data: [
        //             {
        //                 asks: [ [ 2507.07, 0.4248 ] ],
        //                 bids: [ [ 2507.05, 0.1198 ] ],
        //                 checksum: -1400923312,
        //                 ts: '1728339446908'
        //             }
        //         ],
        //         ts: 1728339446908
        //     }
        //
        const arg = this.safeDict(message, 'arg', {});
        let market = this.getMarketFromArg(arg);
        const marketId = market['id'];
        const hash = 'books:';
        if (marketId.indexOf('_DMCBL') >= 0) {
            market = this.handleDMCBLMarketByMessageHashes(market, hash, client);
        }
        const symbol = market['symbol'];
        const channel = this.safeString(arg, 'channel');
        const messageHash = hash + symbol;
        const data = this.safeList(message, 'data', []);
        const rawOrderBook = this.safeDict(data, 0);
        const timestamp = this.safeInteger(rawOrderBook, 'ts');
        const incrementalBook = channel;
        if (incrementalBook) {
            if (!(symbol in this.orderbooks)) {
                const ob = this.countedOrderBook({});
                ob['symbol'] = symbol;
                this.orderbooks[symbol] = ob;
            }
            const storedOrderBook = this.orderbooks[symbol];
            const asks = this.safeList(rawOrderBook, 'asks', []);
            const bids = this.safeList(rawOrderBook, 'bids', []);
            this.handleDeltas(storedOrderBook['asks'], asks);
            this.handleDeltas(storedOrderBook['bids'], bids);
            storedOrderBook['timestamp'] = timestamp;
            storedOrderBook['datetime'] = this.iso8601(timestamp);
            const checksum = this.safeBool(this.options, 'checksum', true);
            const isSnapshot = this.safeString(message, 'action') === 'snapshot';
            if (!isSnapshot && checksum) {
                const storedAsks = storedOrderBook['asks'];
                const storedBids = storedOrderBook['bids'];
                const asksLength = storedAsks.length;
                const bidsLength = storedBids.length;
                const payloadArray = [];
                for (let i = 0; i < 25; i++) {
                    if (i < bidsLength) {
                        payloadArray.push(storedBids[i][2][0]);
                        payloadArray.push(storedBids[i][2][1]);
                    }
                    if (i < asksLength) {
                        payloadArray.push(storedAsks[i][2][0]);
                        payloadArray.push(storedAsks[i][2][1]);
                    }
                }
                const payload = payloadArray.join(':');
                const calculatedChecksum = this.crc32(payload, true);
                const responseChecksum = this.safeInteger(rawOrderBook, 'checksum');
                if (calculatedChecksum !== responseChecksum) {
                    this.spawn(this.handleCheckSumError, client, symbol, messageHash);
                    return;
                }
            }
        }
        else {
            const orderbook = this.orderBook({});
            const parsedOrderbook = this.parseOrderBook(rawOrderBook, symbol, timestamp);
            orderbook.reset(parsedOrderbook);
            this.orderbooks[symbol] = orderbook;
        }
        client.resolve(this.orderbooks[symbol], messageHash);
    }
    async handleCheckSumError(client, symbol, messageHash) {
        await this.unWatchOrderBook(symbol);
        const error = new errors.ChecksumError(this.id + ' ' + this.orderbookChecksumMessage(symbol));
        client.reject(error, messageHash);
    }
    handleDelta(bookside, delta) {
        const bidAsk = this.parseBidAsk(delta, 0, 1);
        bidAsk.push(delta);
        bookside.storeArray(bidAsk);
    }
    handleDeltas(bookside, deltas) {
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta(bookside, deltas[i]);
        }
    }
    /**
     * @method
     * @name coincatch#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://coincatch.github.io/github.io/en/spot/#trades-channel
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async watchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        return await this.watchTradesForSymbols([symbol], since, limit, params);
    }
    /**
     * @method
     * @name coincatch#watchTrades
     * @description watches information on multiple trades made in a market
     * @see https://coincatch.github.io/github.io/en/spot/#trades-channel
     * @param symbols
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async watchTradesForSymbols(symbols, since = undefined, limit = undefined, params = {}) {
        const symbolsLength = symbols.length;
        if (symbolsLength === 0) {
            throw new errors.ArgumentsRequired(this.id + ' watchTradesForSymbols() requires a non-empty array of symbols');
        }
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols);
        const topics = [];
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.market(symbol);
            const [instType, instId] = this.getPublicInstTypeAndId(market);
            const args = {
                'instType': instType,
                'channel': 'trade',
                'instId': instId,
            };
            topics.push(args);
            messageHashes.push('trade:' + symbol);
        }
        const trades = await this.watchPublicMultiple(messageHashes, messageHashes, topics, params);
        if (this.newUpdates) {
            const first = this.safeDict(trades, 0);
            const tradeSymbol = this.safeString(first, 'symbol');
            limit = trades.getLimit(tradeSymbol, limit);
        }
        return this.filterBySinceLimit(trades, since, limit, 'timestamp', true);
    }
    /**
     * @method
     * @name coincatch#unWatchTrades
     * @description unsubscribe from the trades channel
     * @see https://coincatch.github.io/github.io/en/spot/#trades-channel
     * @param {string} symbol unified symbol of the market to unwatch the trades for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {any} status of the unwatch request
     */
    async unWatchTrades(symbol, params = {}) {
        await this.loadMarkets();
        return await this.unWatchChannel(symbol, 'trade', 'trade', params);
    }
    handleTrades(client, message) {
        //
        //     {
        //         action: 'update',
        //         arg: { instType: 'sp', channel: 'trade', instId: 'ETHUSDT' },
        //         data: [ [ '1728341807469', '2421.41', '0.478', 'sell' ] ],
        //         ts: 1728341807482
        //     }
        //
        const arg = this.safeDict(message, 'arg', {});
        let market = this.getMarketFromArg(arg);
        const marketId = market['id'];
        const hash = 'trade:';
        if (marketId.indexOf('_DMCBL') >= 0) {
            market = this.handleDMCBLMarketByMessageHashes(market, hash, client);
        }
        const symbol = market['symbol'];
        if (!(symbol in this.trades)) {
            const limit = this.safeInteger(this.options, 'tradesLimit', 1000);
            this.trades[symbol] = new Cache.ArrayCache(limit);
        }
        const stored = this.trades[symbol];
        let data = this.safeList(message, 'data', []);
        if (data !== undefined) {
            data = this.sortBy(data, 0);
            for (let i = 0; i < data.length; i++) {
                const trade = this.safeList(data, i);
                const parsed = this.parseWsTrade(trade, market);
                stored.append(parsed);
            }
        }
        const messageHash = hash + symbol;
        client.resolve(stored, messageHash);
    }
    parseWsTrade(trade, market = undefined) {
        //
        //     [
        //         '1728341807469',
        //         '2421.41',
        //         '0.478',
        //         'sell'
        //     ]
        //
        const timestamp = this.safeInteger(trade, 0);
        return this.safeTrade({
            'id': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'symbol': market['symbol'],
            'side': this.safeStringLower(trade, 3),
            'price': this.safeString(trade, 1),
            'amount': this.safeString(trade, 2),
            'cost': undefined,
            'takerOrMaker': undefined,
            'type': undefined,
            'order': undefined,
            'fee': undefined,
            'info': trade,
        }, market);
    }
    /**
     * @method
     * @name coincatch#watchBalance
     * @description watch balance and get the amount of funds available for trading or funds locked in orders
     * @see https://coincatch.github.io/github.io/en/spot/#account-channel
     * @see https://coincatch.github.io/github.io/en/mix/#account-channel
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {str} [params.type] 'spot' or 'swap' (default is 'spot')
     * @param {string} [params.instType] *swap only* 'umcbl' or 'dmcbl' (default is 'umcbl')
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async watchBalance(params = {}) {
        let type = undefined;
        [type, params] = this.handleMarketTypeAndParams('watchBalance', undefined, params);
        let instType = 'spbl'; // must be lower case for spot
        if (type === 'swap') {
            instType = 'umcbl';
        }
        const channel = 'account';
        [instType, params] = this.handleOptionAndParams(params, 'watchBalance', 'instType', instType);
        const args = {
            'instType': instType,
            'channel': channel,
            'instId': 'default',
        };
        const messageHash = 'balance:' + instType.toLowerCase();
        return await this.watchPrivate(messageHash, messageHash, args, params);
    }
    handleBalance(client, message) {
        //
        //  spot
        //     {
        //         action: 'snapshot',
        //         arg: { instType: 'spbl', channel: 'account', instId: 'default' },
        //         data: [
        //             {
        //                 coinId: '3',
        //                 coinName: 'ETH',
        //                 available: '0.0000832',
        //                 frozen: '0',
        //                 lock: '0'
        //             }
        //         ],
        //         ts: 1728464548725
        //     }
        //
        // //  swap
        //     {
        //         action: 'snapshot',
        //         arg: { instType: 'dmcbl', channel: 'account', instId: 'default' },
        //         data: [
        //             {
        //                 marginCoin: 'ETH',
        //                 locked: '0.00000000',
        //                 available: '0.00001203',
        //                 maxOpenPosAvailable: '0.00001203',
        //                 maxTransferOut: '0.00001203',
        //                 equity: '0.00001203',
        //                 usdtEquity: '0.029092328738',
        //                 coinDisplayName: 'ETH'
        //             }
        //         ],
        //         ts: 1728650777643
        //     }
        //
        const data = this.safeList(message, 'data', []);
        for (let i = 0; i < data.length; i++) {
            const rawBalance = data[i];
            const currencyId = this.safeString2(rawBalance, 'coinName', 'marginCoin');
            const code = this.safeCurrencyCode(currencyId);
            const account = (code in this.balance) ? this.balance[code] : this.account();
            const freeQuery = ('maxTransferOut' in rawBalance) ? 'maxTransferOut' : 'available';
            account['free'] = this.safeString(rawBalance, freeQuery);
            account['total'] = this.safeString(rawBalance, 'equity');
            account['used'] = this.safeString(rawBalance, 'frozen');
            this.balance[code] = account;
        }
        this.balance = this.safeBalance(this.balance);
        const arg = this.safeDict(message, 'arg');
        const instType = this.safeStringLower(arg, 'instType');
        const messageHash = 'balance:' + instType;
        client.resolve(this.balance, messageHash);
    }
    /**
     * @method
     * @name coincatch#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://coincatch.github.io/github.io/en/spot/#order-channel
     * @see https://coincatch.github.io/github.io/en/mix/#order-channel
     * @see https://coincatch.github.io/github.io/en/mix/#plan-order-channel
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'spot' or 'swap'
     * @param {string} [params.instType] *swap only* 'umcbl' or 'dmcbl' (default is 'umcbl')
     * @param {bool} [params.trigger] *swap only* whether to watch trigger orders (default is false)
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async watchOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const methodName = 'watchOrders';
        await this.loadMarkets();
        let market = undefined;
        let marketId = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            symbol = market['symbol'];
            marketId = market['id'];
        }
        let marketType = undefined;
        [marketType, params] = this.handleMarketTypeAndParams(methodName, market, params);
        let instType = 'spbl';
        let instId = marketId;
        if (marketType === 'spot') {
            if (symbol === undefined) {
                throw new errors.ArgumentsRequired(this.id + ' ' + methodName + '() requires a symbol argument for ' + marketType + ' markets.');
            }
        }
        else {
            instId = 'default';
            instType = 'umcbl';
            if (symbol === undefined) {
                [instType, params] = this.handleOptionAndParams(params, methodName, 'instType', instType);
            }
            else {
                if (marketId.indexOf('_DMCBL') >= 0) {
                    instType = 'dmcbl';
                }
            }
        }
        let channel = 'orders';
        const isTrigger = this.safeBool(params, 'trigger');
        if (isTrigger) {
            channel = 'ordersAlgo'; // channel does not return any data
            params = this.omit(params, 'trigger');
        }
        const args = {
            'instType': instType,
            'channel': channel,
            'instId': instId,
        };
        let messageHash = 'orders';
        if (symbol !== undefined) {
            messageHash += ':' + symbol;
        }
        const orders = await this.watchPrivate(messageHash, messageHash, args, params);
        if (this.newUpdates) {
            limit = orders.getLimit(symbol, limit);
        }
        return this.filterBySymbolSinceLimit(orders, symbol, since, limit, true);
    }
    handleOrder(client, message) {
        //
        // spot
        //
        //     {
        //         action: 'snapshot',
        //         arg: { instType: 'spbl', channel: 'orders', instId: 'ETHUSDT_SPBL' },
        //         data: [
        //             {
        //                 instId: 'ETHUSDT_SPBL',
        //                 ordId: '1228627925964996608',
        //                 clOrdId: 'f0cccf74-c535-4523-a53d-dbe3b9958559',
        //                 px: '2000',
        //                 sz: '0.001',
        //                 notional: '2',
        //                 ordType: 'limit',
        //                 force: 'normal',
        //                 side: 'buy',
        //                 accFillSz: '0',
        //                 avgPx: '0',
        //                 status: 'new',
        //                 cTime: 1728653645030,
        //                 uTime: 1728653645030,
        //                 orderFee: [],
        //                 eps: 'API'
        //             }
        //         ],
        //         ts: 1728653645046
        //     }
        //
        // swap
        //
        //     {
        //         action: 'snapshot',
        //         arg: { instType: 'umcbl', channel: 'orders', instId: 'default' },
        //         data: [
        //             {
        //                 accFillSz: '0',
        //                 cTime: 1728653796976,
        //                 clOrdId: '1228628563272753152',
        //                 eps: 'API',
        //                 force: 'normal',
        //                 hM: 'single_hold',
        //                 instId: 'ETHUSDT_UMCBL',
        //                 lever: '5',
        //                 low: false,
        //                 notionalUsd: '20',
        //                 ordId: '1228628563188867072',
        //                 ordType: 'limit',
        //                 orderFee: [],
        //                 posSide: 'net',
        //                 px: '2000',
        //                 side: 'buy',
        //                 status: 'new',
        //                 sz: '0.01',
        //                 tS: 'buy_single',
        //                 tdMode: 'cross',
        //                 tgtCcy: 'USDT',
        //                 uTime: 1728653796976
        //             }
        //         ],
        //         ts: 1728653797002
        //     }
        //
        //
        const arg = this.safeDict(message, 'arg', {});
        const instType = this.safeString(arg, 'instType');
        const argInstId = this.safeString(arg, 'instId');
        let marketType = undefined;
        if (instType === 'spbl') {
            marketType = 'spot';
        }
        else {
            marketType = 'swap';
        }
        const data = this.safeList(message, 'data', []);
        if (this.orders === undefined) {
            const limit = this.safeInteger(this.options, 'ordersLimit', 1000);
            this.orders = new Cache.ArrayCacheBySymbolById(limit);
        }
        const hash = 'orders';
        const stored = this.orders;
        let symbol = undefined;
        for (let i = 0; i < data.length; i++) {
            const order = data[i];
            const marketId = this.safeString(order, 'instId', argInstId);
            const market = this.safeMarket(marketId, undefined, undefined, marketType);
            const parsed = this.parseWsOrder(order, market);
            stored.append(parsed);
            symbol = parsed['symbol'];
            const messageHash = 'orders:' + symbol;
            client.resolve(stored, messageHash);
        }
        client.resolve(stored, hash);
    }
    parseWsOrder(order, market = undefined) {
        //
        // spot
        //     {
        //         instId: 'ETHUSDT_SPBL',
        //         ordId: '1228627925964996608',
        //         clOrdId: 'f0cccf74-c535-4523-a53d-dbe3b9958559',
        //         px: '2000',
        //         sz: '0.001',
        //         notional: '2',
        //         ordType: 'limit',
        //         force: 'normal',
        //         side: 'buy',
        //         accFillSz: '0',
        //         avgPx: '0',
        //         status: 'new',
        //         cTime: 1728653645030,
        //         uTime: 1728653645030,
        //         orderFee: orderFee: [ { fee: '0', feeCcy: 'USDT' } ],
        //         eps: 'API'
        //     }
        //
        // swap
        //     {
        //         accFillSz: '0',
        //         cTime: 1728653796976,
        //         clOrdId: '1228628563272753152',
        //         eps: 'API',
        //         force: 'normal',
        //         hM: 'single_hold',
        //         instId: 'ETHUSDT_UMCBL',
        //         lever: '5',
        //         low: false,
        //         notionalUsd: '20',
        //         ordId: '1228628563188867072',
        //         ordType: 'limit',
        //         orderFee: [ { fee: '0', feeCcy: 'USDT' } ],
        //         posSide: 'net',
        //         px: '2000',
        //         side: 'buy',
        //         status: 'new',
        //         sz: '0.01',
        //         tS: 'buy_single',
        //         tdMode: 'cross',
        //         tgtCcy: 'USDT',
        //         uTime: 1728653796976
        //     }
        //
        const marketId = this.safeString(order, 'instId');
        const settleId = this.safeString(order, 'tgtCcy');
        market = this.safeMarketCustom(marketId, market, settleId);
        const timestamp = this.safeInteger(order, 'cTime');
        const symbol = market['symbol'];
        const rawStatus = this.safeString(order, 'status');
        const orderFee = this.safeList(order, 'orderFee', []);
        const fee = this.safeDict(orderFee, 0);
        const feeCost = Precise["default"].stringMul(this.safeString(fee, 'fee'), '-1');
        const feeCurrency = this.safeString(fee, 'feeCcy');
        let price = this.omitZero(this.safeString(order, 'px'));
        const priceAvg = this.omitZero(this.safeString(order, 'avgPx'));
        if (price === undefined) {
            price = priceAvg;
        }
        const type = this.safeStringLower(order, 'ordType');
        return this.safeOrder({
            'id': this.safeString(order, 'ordId'),
            'clientOrderId': this.safeString(order, 'clOrdId'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastTradeTimestamp': undefined,
            'lastUpdateTimestamp': this.safeInteger(order, 'uTime'),
            'status': this.parseOrderStatus(rawStatus),
            'symbol': symbol,
            'type': type,
            'timeInForce': this.parseOrderTimeInForce(this.safeStringLower(order, 'force')),
            'side': this.safeStringLower(order, 'side'),
            'price': price,
            'average': this.safeString(order, 'avgPx'),
            'amount': this.safeString(order, 'sz'),
            'filled': this.safeString(order, 'accFillSz'),
            'remaining': undefined,
            'triggerPrice': undefined,
            'takeProfitPrice': undefined,
            'stopLossPrice': undefined,
            'cost': this.safeString(order, 'notional'),
            'trades': undefined,
            'fee': {
                'currency': feeCurrency,
                'cost': feeCost,
            },
            'reduceOnly': this.safeBool(order, 'low'),
            'postOnly': undefined,
            'info': order,
        }, market);
    }
    /**
     * @method
     * @name coincatch#watchPositions
     * @description watch all open positions
     * @see https://coincatch.github.io/github.io/en/mix/#positions-channel
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param since
     * @param limit
     * @param {object} params extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
     */
    async watchPositions(symbols = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols, 'swap');
        const messageHashes = [];
        const hash = 'positions';
        let instTypes = [];
        if (symbols !== undefined) {
            for (let i = 0; i < symbols.length; i++) {
                const symbol = symbols[i];
                const market = this.market(symbol);
                const instType = this.getPrivateInstType(market);
                if (!this.inArray(instType, instTypes)) {
                    instTypes.push(instType);
                }
                messageHashes.push(hash + '::' + symbol);
            }
        }
        else {
            instTypes = ['umcbl', 'dmcbl'];
            messageHashes.push(hash);
        }
        const args = [];
        const subscribeHashes = [];
        for (let i = 0; i < instTypes.length; i++) {
            const instType = instTypes[i];
            const arg = {
                'instType': instType,
                'channel': hash,
                'instId': 'default',
            };
            subscribeHashes.push(hash + '::' + instType);
            args.push(arg);
        }
        const newPositions = await this.watchPrivateMultiple(messageHashes, subscribeHashes, args, params);
        if (this.newUpdates) {
            return newPositions;
        }
        return this.filterBySymbolsSinceLimit(newPositions, symbols, since, limit, true);
    }
    getPrivateInstType(market) {
        const marketId = market['id'];
        if (marketId.indexOf('_DMCBL') >= 0) {
            return 'dmcbl';
        }
        return 'umcbl';
    }
    handlePositions(client, message) {
        //
        //     {
        //         action: 'snapshot',
        //         arg: { instType: 'umcbl', channel: 'positions', instId: 'default' },
        //         data: [
        //             {
        //                 posId: '1221355728745619456',
        //                 instId: 'ETHUSDT_UMCBL',
        //                 instName: 'ETHUSDT',
        //                 marginCoin: 'USDT',
        //                 margin: '5.27182',
        //                 marginMode: 'crossed',
        //                 holdSide: 'long',
        //                 holdMode: 'single_hold',
        //                 total: '0.01',
        //                 available: '0.01',
        //                 locked: '0',
        //                 averageOpenPrice: '2635.91',
        //                 leverage: 5,
        //                 achievedProfits: '0',
        //                 upl: '-0.0267',
        //                 uplRate: '-0.005064664576',
        //                 liqPx: '-3110.66866033',
        //                 keepMarginRate: '0.0033',
        //                 marginRate: '0.002460827254',
        //                 cTime: '1726919818102',
        //                 uTime: '1728919604312',
        //                 markPrice: '2633.24',
        //                 autoMargin: 'off'
        //             }
        //         ],
        //         ts: 1728919604329
        //     }
        //
        if (this.positions === undefined) {
            this.positions = new Cache.ArrayCacheBySymbolBySide();
        }
        const cache = this.positions;
        const rawPositions = this.safeValue(message, 'data', []);
        const dataLength = rawPositions.length;
        if (dataLength === 0) {
            return;
        }
        const newPositions = [];
        const symbols = [];
        for (let i = 0; i < rawPositions.length; i++) {
            const rawPosition = rawPositions[i];
            const position = this.parseWsPosition(rawPosition);
            symbols.push(position['symbol']);
            newPositions.push(position);
            cache.append(position);
        }
        const hash = 'positions';
        const messageHashes = this.findMessageHashes(client, hash);
        for (let i = 0; i < messageHashes.length; i++) {
            const messageHash = messageHashes[i];
            const parts = messageHash.split('::');
            const symbol = parts[1];
            if (this.inArray(symbol, symbols)) {
                const positionsForSymbol = [];
                for (let j = 0; j < newPositions.length; j++) {
                    const position = newPositions[j];
                    if (position['symbol'] === symbol) {
                        positionsForSymbol.push(position);
                    }
                }
                client.resolve(positionsForSymbol, messageHash);
            }
        }
        client.resolve(newPositions, hash);
    }
    parseWsPosition(position, market = undefined) {
        //
        //     {
        //         posId: '1221355728745619456',
        //         instId: 'ETHUSDT_UMCBL',
        //         instName: 'ETHUSDT',
        //         marginCoin: 'USDT',
        //         margin: '5.27182',
        //         marginMode: 'crossed',
        //         holdSide: 'long',
        //         holdMode: 'single_hold',
        //         total: '0.01',
        //         available: '0.01',
        //         locked: '0',
        //         averageOpenPrice: '2635.91',
        //         leverage: 5,
        //         achievedProfits: '0',
        //         upl: '-0.0267',
        //         uplRate: '-0.005064664576',
        //         liqPx: '-3110.66866033',
        //         keepMarginRate: '0.0033',
        //         marginRate: '0.002460827254',
        //         cTime: '1726919818102',
        //         uTime: '1728919604312',
        //         markPrice: '2633.24',
        //         autoMargin: 'off'
        //     }
        //
        const marketId = this.safeString(position, 'symbol');
        const settleId = this.safeString(position, 'marginCoin');
        market = this.safeMarketCustom(marketId, market, settleId);
        const timestamp = this.safeInteger(position, 'cTime');
        const marginModeId = this.safeString(position, 'marginMode');
        const marginMode = this.getSupportedMapping(marginModeId, {
            'crossed': 'cross',
            'isolated': 'isolated',
        });
        let isHedged = undefined;
        const holdMode = this.safeString(position, 'holdMode');
        if (holdMode === 'double_hold') {
            isHedged = true;
        }
        else if (holdMode === 'single_hold') {
            isHedged = false;
        }
        const percentageDecimal = this.safeString(position, 'uplRate');
        const percentage = Precise["default"].stringMul(percentageDecimal, '100');
        const margin = this.safeNumber(position, 'margin');
        return this.safePosition({
            'symbol': market['symbol'],
            'id': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'contracts': this.safeNumber(position, 'total'),
            'contractSize': undefined,
            'side': this.safeStringLower(position, 'holdSide'),
            'notional': margin,
            'leverage': this.safeInteger(position, 'leverage'),
            'unrealizedPnl': this.safeNumber(position, 'upl'),
            'realizedPnl': this.safeNumber(position, 'achievedProfits'),
            'collateral': undefined,
            'entryPrice': this.safeNumber(position, 'averageOpenPrice'),
            'markPrice': this.safeNumber(position, 'markPrice'),
            'liquidationPrice': this.safeNumber(position, 'liqPx'),
            'marginMode': marginMode,
            'hedged': isHedged,
            'maintenanceMargin': undefined,
            'maintenanceMarginPercentage': this.safeNumber(position, 'keepMarginRate'),
            'initialMargin': margin,
            'initialMarginPercentage': undefined,
            'marginRatio': this.safeNumber(position, 'marginRate'),
            'lastUpdateTimestamp': this.safeInteger(position, 'uTime'),
            'lastPrice': undefined,
            'stopLossPrice': undefined,
            'takeProfitPrice': undefined,
            'percentage': percentage,
            'info': position,
        });
    }
    handleErrorMessage(client, message) {
        //
        //    { event: "error", code: 30001, msg: "Channel does not exist" }
        //
        const event = this.safeString(message, 'event');
        try {
            if (event === 'error') {
                const code = this.safeString(message, 'code');
                const feedback = this.id + ' ' + this.json(message);
                this.throwExactlyMatchedException(this.exceptions['ws']['exact'], code, feedback);
                const msg = this.safeString(message, 'msg', '');
                this.throwBroadlyMatchedException(this.exceptions['ws']['broad'], msg, feedback);
                throw new errors.ExchangeError(feedback);
            }
            return false;
        }
        catch (e) {
            if (e instanceof errors.AuthenticationError) {
                const messageHash = 'authenticated';
                client.reject(e, messageHash);
                if (messageHash in client.subscriptions) {
                    delete client.subscriptions[messageHash];
                }
            }
            else {
                client.reject(e);
            }
            return true;
        }
    }
    handleMessage(client, message) {
        // todo handle with subscribe and unsubscribe
        if (this.handleErrorMessage(client, message)) {
            return;
        }
        const content = this.safeString(message, 'message');
        if (content === 'pong') {
            this.handlePong(client, message);
            return;
        }
        if (message === 'pong') {
            this.handlePong(client, message);
            return;
        }
        const event = this.safeString(message, 'event');
        if (event === 'login') {
            this.handleAuthenticate(client, message);
            return;
        }
        if (event === 'subscribe') {
            this.handleSubscriptionStatus(client, message);
            return;
        }
        if (event === 'unsubscribe') {
            this.handleUnSubscriptionStatus(client, message);
            return;
        }
        const data = this.safeDict(message, 'arg', {});
        const channel = this.safeString(data, 'channel');
        if (channel === 'ticker') {
            this.handleTicker(client, message);
        }
        if (channel.indexOf('candle') >= 0) {
            this.handleOHLCV(client, message);
        }
        if (channel.indexOf('books') >= 0) {
            this.handleOrderBook(client, message);
        }
        if (channel === 'trade') {
            this.handleTrades(client, message);
        }
        if (channel === 'account') {
            this.handleBalance(client, message);
        }
        if ((channel === 'orders') || (channel === 'ordersAlgo')) {
            this.handleOrder(client, message);
        }
        if (channel === 'positions') {
            this.handlePositions(client, message);
        }
    }
    ping(client) {
        return 'ping';
    }
    handlePong(client, message) {
        client.lastPong = this.milliseconds();
        return message;
    }
    handleSubscriptionStatus(client, message) {
        return message;
    }
    handleUnSubscriptionStatus(client, message) {
        let argsList = this.safeList(message, 'args');
        if (argsList === undefined) {
            argsList = [this.safeDict(message, 'arg', {})];
        }
        for (let i = 0; i < argsList.length; i++) {
            const arg = argsList[i];
            const channel = this.safeString(arg, 'channel');
            if (channel === 'books') {
                this.handleOrderBookUnSubscription(client, message);
            }
            else if (channel === 'trade') {
                this.handleTradesUnSubscription(client, message);
            }
            else if (channel === 'ticker') {
                this.handleTickerUnSubscription(client, message);
            }
            else if (channel.startsWith('candle')) {
                this.handleOHLCVUnSubscription(client, message);
            }
        }
        return message;
    }
    handleOrderBookUnSubscription(client, message) {
        const arg = this.safeDict(message, 'arg', {});
        const instType = this.safeStringLower(arg, 'instType');
        const type = (instType === 'sp') ? 'spot' : 'swap';
        const instId = this.safeString(arg, 'instId');
        const market = this.safeMarket(instId, undefined, undefined, type);
        const symbol = market['symbol'];
        const messageHash = 'unsubscribe:orderbook:' + market['symbol'];
        const subMessageHash = 'orderbook:' + symbol;
        if (symbol in this.orderbooks) {
            delete this.orderbooks[symbol];
        }
        if (subMessageHash in client.subscriptions) {
            delete client.subscriptions[subMessageHash];
        }
        if (messageHash in client.subscriptions) {
            delete client.subscriptions[messageHash];
        }
        const error = new errors.UnsubscribeError(this.id + 'orderbook ' + symbol);
        client.reject(error, subMessageHash);
        client.resolve(true, messageHash);
    }
    handleTradesUnSubscription(client, message) {
        const arg = this.safeDict(message, 'arg', {});
        const instType = this.safeStringLower(arg, 'instType');
        const type = (instType === 'sp') ? 'spot' : 'swap';
        const instId = this.safeString(arg, 'instId');
        const market = this.safeMarket(instId, undefined, undefined, type);
        const symbol = market['symbol'];
        const messageHash = 'unsubscribe:trade:' + market['symbol'];
        const subMessageHash = 'trade:' + symbol;
        if (symbol in this.trades) {
            delete this.trades[symbol];
        }
        if (subMessageHash in client.subscriptions) {
            delete client.subscriptions[subMessageHash];
        }
        if (messageHash in client.subscriptions) {
            delete client.subscriptions[messageHash];
        }
        const error = new errors.UnsubscribeError(this.id + 'trades ' + symbol);
        client.reject(error, subMessageHash);
        client.resolve(true, messageHash);
    }
    handleTickerUnSubscription(client, message) {
        const arg = this.safeDict(message, 'arg', {});
        const instType = this.safeStringLower(arg, 'instType');
        const type = (instType === 'sp') ? 'spot' : 'swap';
        const instId = this.safeString(arg, 'instId');
        const market = this.safeMarket(instId, undefined, undefined, type);
        const symbol = market['symbol'];
        const messageHash = 'unsubscribe:ticker:' + market['symbol'];
        const subMessageHash = 'ticker:' + symbol;
        if (symbol in this.tickers) {
            delete this.tickers[symbol];
        }
        if (subMessageHash in client.subscriptions) {
            delete client.subscriptions[subMessageHash];
        }
        if (messageHash in client.subscriptions) {
            delete client.subscriptions[messageHash];
        }
        const error = new errors.UnsubscribeError(this.id + 'ticker ' + symbol);
        client.reject(error, subMessageHash);
        client.resolve(true, messageHash);
    }
    handleOHLCVUnSubscription(client, message) {
        const arg = this.safeDict(message, 'arg', {});
        const instType = this.safeStringLower(arg, 'instType');
        const type = (instType === 'sp') ? 'spot' : 'swap';
        const instId = this.safeString(arg, 'instId');
        const channel = this.safeString(arg, 'channel');
        const interval = channel.replace('candle', '');
        const timeframes = this.safeDict(this.options, 'timeframesForWs');
        const timeframe = this.findTimeframe(interval, timeframes);
        const market = this.safeMarket(instId, undefined, undefined, type);
        const symbol = market['symbol'];
        const messageHash = 'unsubscribe:ohlcv:' + timeframe + ':' + market['symbol'];
        const subMessageHash = 'ohlcv:' + symbol + ':' + timeframe;
        if (symbol in this.ohlcvs) {
            if (timeframe in this.ohlcvs[symbol]) {
                delete this.ohlcvs[symbol][timeframe];
            }
        }
        this.cleanUnsubscription(client, subMessageHash, messageHash);
    }
}

module.exports = coincatch;
