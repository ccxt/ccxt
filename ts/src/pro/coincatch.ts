//  ---------------------------------------------------------------------------

import coincatchRest from '../coincatch.js';
import { ArgumentsRequired, ChecksumError } from '../base/errors.js';
import type { Dict, Int, Market, OHLCV, OrderBook, Strings, Ticker, Tickers, Trade } from '../base/types.js';
import Client from '../base/ws/Client.js';
import { sha256 } from '../static_dependencies/noble-hashes/sha256.js';
import { ArrayCache, ArrayCacheByTimestamp } from '../base/ws/Cache.js';

//  ---------------------------------------------------------------------------

export default class coincatch extends coincatchRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchTrades': true,
                'watchTradesForSymbols': true,
                'watchOrderBook': true,
                'watchOrderBookForSymbols': true,
                'watchOHLCV': true,
                'watchOrders': false,
                'watchMyTrades': false,
                'watchTicker': true,
                'watchTickers': true,
                'watchBalance': false,
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
        });
    }

    async authenticate (params = {}) {
        this.checkRequiredCredentials ();
        const url = this.urls['api']['ws']['private'];
        const client = this.client (url);
        const messageHash = 'authenticated';
        const future = client.future (messageHash);
        const authenticated = this.safeValue (client.subscriptions, messageHash);
        if (authenticated === undefined) {
            const timestamp = this.seconds ().toString ();
            const auth = timestamp + 'GET' + '/user/verify';
            const signature = this.hmac (this.encode (auth), this.encode (this.secret), sha256, 'base64');
            const operation = 'login';
            const request: Dict = {
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
            const message = this.extend (request, params);
            this.watch (url, messageHash, message, messageHash);
        }
        return await future;
    }

    async watchPublic (messageHash, args, params = {}) {
        const url = this.urls['api']['ws']['public'];
        const request: Dict = {
            'op': 'subscribe',
            'args': [ args ],
        };
        const message = this.extend (request, params);
        return await this.watch (url, messageHash, message, messageHash);
    }

    async unWatchPublic (messageHash, args, params = {}) {
        const url = this.urls['api']['ws']['public'];
        const request: Dict = {
            'op': 'unsubscribe',
            'args': [ args ],
        };
        const message = this.extend (request, params);
        return await this.watch (url, messageHash, message, messageHash);
    }

    async watchPrivate (messageHash, subscriptionHash, args, params = {}) {
        await this.authenticate ();
        const url = this.urls['api']['ws']['private'];
        const request: Dict = {
            'op': 'subscribe',
            'args': [ args ],
        };
        const message = this.extend (request, params);
        return await this.watch (url, messageHash, message, subscriptionHash);
    }

    handleAuthenticate (client: Client, message) {
        //
        //  { event: "login", code: 0 }
        //
        const messageHash = 'authenticated';
        const future = this.safeValue (client.futures, messageHash);
        future.resolve (true);
    }

    async watchPublicMultiple (messageHashes, argsArray, params = {}) {
        const url = this.urls['api']['ws']['public'];
        const request: Dict = {
            'op': 'subscribe',
            'args': argsArray,
        };
        const message = this.extend (request, params);
        return await this.watchMultiple (url, messageHashes, message, messageHashes);
    }

    async unWatchChannel (symbol: string, channel: string, messageHashTopic: string, params = {}): Promise<any> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const instId = market['baseId'] + market['quoteId'];
        let instType = undefined;
        if (market['spot']) {
            instType = 'SP'; // SP: Spot public channel; MC: Contract/future channel
        } else if (market['futures'] || market['swap']) {
            instType = 'MC';
        }
        const messageHash = 'unsubscribe:' + messageHashTopic + ':' + instId;
        const args: Dict = {
            'instType': instType,
            'channel': channel,
            'instId': instId,
        };
        return await this.unWatchPublic (messageHash, args, params);
    }

    async watchTicker (symbol: string, params = {}): Promise<Ticker> {
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
        await this.loadMarkets ();
        const market = this.market (symbol);
        const instId = market['baseId'] + market['quoteId'];
        const channel = 'ticker';
        let instType = undefined;
        if (market['spot']) {
            instType = 'SP'; // SP: Spot public channel; MC: Contract/future channel
        } else if (market['futures'] || market['swap']) {
            instType = 'MC';
        }
        const messageHash = channel + ':' + symbol;
        const args: Dict = {
            'instType': instType,
            'channel': channel,
            'instId': instId,
        };
        return await this.watchPublic (messageHash, args, params);
    }

    async unWatchTicker (symbol: string, params = {}): Promise<any> {
        /**
         * @method
         * @name coinctach#unWatchTicker
         * @description unsubscribe from the ticker channel
         * @see https://coincatch.github.io/github.io/en/mix/#tickers-channel
         * @param {string} symbol unified symbol of the market to unwatch the ticker for
         * @returns {any} status of the unwatch request
         */
        await this.loadMarkets ();
        return await this.unWatchChannel (symbol, 'ticker', 'ticker', params);
    }

    async watchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        /**
         * @method
         * @name coincatch#watchTickers
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
         * @see https://coincatch.github.io/github.io/en/mix/#tickers-channel
         * @param {string[]} symbols unified symbol of the market to watch the tickers for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined, false);
        const market = this.market (symbols[0]);
        let instType = undefined;
        if (market['spot']) {
            instType = 'SP'; // SP: Spot public channel; MC: Contract/future channel
        } else if (market['futures'] || market['swap']) {
            instType = 'MC';
        }
        const topics = [];
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const marketInner = this.market (symbol);
            const instId = marketInner['baseId'] + marketInner['quoteId'];
            const args: Dict = {
                'instType': instType,
                'channel': 'ticker',
                'instId': instId,
            };
            topics.push (args);
            messageHashes.push ('ticker:' + symbol);
        }
        const tickers = await this.watchPublicMultiple (messageHashes, topics, params);
        if (this.newUpdates) {
            const result: Dict = {};
            result[tickers['symbol']] = tickers;
            return result;
        }
        return this.filterByArray (this.tickers, 'symbol', symbols);
    }

    handleTicker (client: Client, message) {
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
        const arg = this.safeDict (message, 'arg', {});
        const instType = this.safeStringLower (arg, 'instType');
        const baseAndQuote = this.parseSpotMarketId (this.safeString (arg, 'instId'));
        let symbol = this.safeCurrencyCode (baseAndQuote['baseId']) + '/' + this.safeCurrencyCode (baseAndQuote['quoteId']);
        if (instType !== 'sp') {
            symbol += '_SPBL';
        }
        const market = this.safeMarket (symbol);
        const data = this.safeList (message, 'data', []);
        const ticker = this.parseWsTicker (this.safeDict (data, 0, {}), market);
        const messageHash = 'ticker:' + symbol;
        this.tickers[symbol] = ticker;
        client.resolve (this.tickers[symbol], messageHash);
    }

    parseWsTicker (ticker, market = undefined) {
        //
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
        const marketId = this.safeString (ticker, 'instId');
        const symbol = this.safeSymbol (marketId, market);
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': this.safeInteger (ticker, 'ts'),
            'datetime': this.iso8601 (this.safeInteger (ticker, 'ts')),
            'high': this.safeString (ticker, 'high24h'),
            'low': this.safeString (ticker, 'low24h'),
            'bid': this.safeString (ticker, 'bestBid'),
            'bidVolume': this.safeString (ticker, 'bidSz'),
            'ask': this.safeString (ticker, 'bestAsk'),
            'askVolume': this.safeString (ticker, 'askSz'),
            'vwap': undefined,
            'open': undefined,
            'close': this.safeString (ticker, 'open24h'),
            'last': this.safeString (ticker, 'last'),
            'previousClose': undefined,
            'change': this.safeString (ticker, 'chgUTC'),
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeNumber (ticker, 'baseVolume'),
            'quoteVolume': this.safeNumber (ticker, 'quoteVolume'),
            'info': ticker,
        }, market);
    }

    async watchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
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
        await this.loadMarkets ();
        const market = this.market (symbol);
        const instId = market['baseId'] + market['quoteId'];
        const timeframes = this.options['timeframesForWs'];
        const channel = 'candle' + this.safeString (timeframes, timeframe);
        let instType = undefined;
        if (market['spot']) {
            instType = 'SP'; // SP: Spot public channel; MC: Contract/future channel
        } else if (market['futures'] || market['swap']) {
            instType = 'MC';
        }
        const args: Dict = {
            'instType': instType,
            'channel': channel,
            'instId': instId,
        };
        const messageHash = channel + ':' + symbol;
        const ohlcv = await this.watchPublic (messageHash, args, params);
        if (this.newUpdates) {
            limit = ohlcv.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0, true);
    }

    async unWatchOHLCV (symbol: string, timeframe = '1m', params = {}): Promise<any> {
        /**
         * @method
         * @name coincatch#unWatchOHLCV
         * @description unsubscribe from the ohlcv channel
         * @see https://www.bitget.com/api-doc/spot/websocket/public/Candlesticks-Channel
         * @param {string} symbol unified symbol of the market to unwatch the ohlcv for
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const timeframes = this.options['timeframesForWs'];
        const interval = this.safeString (timeframes, timeframe);
        const channel = 'candle' + interval;
        return await this.unWatchChannel (symbol, channel, 'candle:' + interval, params);
    }

    handleOHLCV (client: Client, message) {
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
        const arg = this.safeDict (message, 'arg', {});
        const instType = this.safeStringLower (arg, 'instType');
        const baseAndQuote = this.parseSpotMarketId (this.safeString (arg, 'instId'));
        let symbol = this.safeCurrencyCode (baseAndQuote['baseId']) + '/' + this.safeCurrencyCode (baseAndQuote['quoteId']);
        if (instType !== 'sp') {
            symbol += '_SPBL';
        }
        if (!(symbol in this.ohlcvs)) {
            this.ohlcvs[symbol] = {};
        }
        const market = this.safeMarket (symbol);
        const data = this.safeList (message, 'data', []);
        const channel = this.safeString (arg, 'channel');
        const klineType = channel.slice (6);
        const timeframe = this.findTimeframe (klineType);
        if (!(timeframe in this.ohlcvs[symbol])) {
            const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
            this.ohlcvs[symbol][timeframe] = new ArrayCacheByTimestamp (limit);
        }
        const stored = this.ohlcvs[symbol][timeframe];
        for (let i = 0; i < data.length; i++) {
            const candle = this.safeList (data, i, []);
            const parsed = this.parseWsOHLCV (candle, market);
            stored.append (parsed);
        }
        const messageHash = channel + ':' + symbol;
        client.resolve (stored, messageHash);
    }

    parseWsOHLCV (ohlcv, market: Market = undefined): OHLCV {
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
            this.safeInteger (ohlcv, 0),
            this.safeNumber (ohlcv, 1),
            this.safeNumber (ohlcv, 2),
            this.safeNumber (ohlcv, 3),
            this.safeNumber (ohlcv, 4),
            this.safeNumber (ohlcv, 5),
        ];
    }

    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
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
        return await this.watchOrderBookForSymbols ([ symbol ], limit, params);
    }

    async unWatchOrderBook (symbol: string, params = {}): Promise<any> {
        /**
         * @method
         * @name bitget#unWatchOrderBook
         * @description unsubscribe from the orderbook channel
         * @see https://www.bitget.com/api-doc/spot/websocket/public/Depth-Channel
         * @see https://www.bitget.com/api-doc/contract/websocket/public/Order-Book-Channel
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [params.limit] orderbook limit, default is undefined
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        let channel = 'books';
        const limit = this.safeInteger (params, 'limit');
        if ((limit === 5) || (limit === 15)) {
            params = this.omit (params, 'limit');
            channel += limit.toString ();
        }
        return await this.unWatchChannel (symbol, channel, channel, params);
    }

    async watchOrderBookForSymbols (symbols: string[], limit: Int = undefined, params = {}): Promise<OrderBook> {
        /**
         * @method
         * @name coincatch#watchOrderBook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://coincatch.github.io/github.io/en/spot/#depth-channel
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return (only 5 or 15 in exchange).
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        let channel = 'books';
        let incrementalFeed = true;
        if ((limit === 5) || (limit === 15)) {
            channel += limit.toString ();
            incrementalFeed = false;
        }
        const topics = [];
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.market (symbol);
            const instId = market['baseId'] + market['quoteId'];
            let instType = undefined;
            if (market['spot']) {
                instType = 'SP'; // SP: Spot public channel; MC: Contract/future channel
            } else if (market['futures'] || market['swap']) {
                instType = 'MC';
            }
            const args: Dict = {
                'instType': instType,
                'channel': channel,
                'instId': instId,
            };
            topics.push (args);
            messageHashes.push (channel + ':' + symbol);
        }
        const orderbook = await this.watchPublicMultiple (messageHashes, topics, params);
        if (incrementalFeed) {
            return orderbook.limit ();
        } else {
            return orderbook;
        }
    }

    handleOrderBook (client: Client, message) {
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
        const arg = this.safeDict (message, 'arg', {});
        const instType = this.safeStringLower (arg, 'instType');
        const baseAndQuote = this.parseSpotMarketId (this.safeString (arg, 'instId'));
        let symbol = this.safeCurrencyCode (baseAndQuote['baseId']) + '/' + this.safeCurrencyCode (baseAndQuote['quoteId']);
        if (instType !== 'sp') {
            symbol += '_SPBL';
        }
        const channel = this.safeString (arg, 'channel');
        const messageHash = channel + ':' + symbol;
        const data = this.safeList (message, 'data', []);
        const rawOrderBook = this.safeDict (data, 0);
        const timestamp = this.safeInteger (rawOrderBook, 'ts');
        const incrementalBook = channel;
        if (incrementalBook) {
            if (!(symbol in this.orderbooks)) {
                const ob = this.countedOrderBook ({});
                ob['symbol'] = symbol;
                this.orderbooks[symbol] = ob;
            }
            const storedOrderBook = this.orderbooks[symbol];
            const asks = this.safeList (rawOrderBook, 'asks', []);
            const bids = this.safeList (rawOrderBook, 'bids', []);
            this.handleDeltas (storedOrderBook['asks'], asks);
            this.handleDeltas (storedOrderBook['bids'], bids);
            storedOrderBook['timestamp'] = timestamp;
            storedOrderBook['datetime'] = this.iso8601 (timestamp);
            const checksum = this.safeBool (this.options, 'checksum', true);
            const isSnapshot = this.safeString (message, 'action') === 'snapshot';
            if (!isSnapshot && checksum) {
                const storedAsks = storedOrderBook['asks'];
                const storedBids = storedOrderBook['bids'];
                const asksLength = storedAsks.length;
                const bidsLength = storedBids.length;
                const payloadArray = [];
                for (let i = 0; i < 25; i++) {
                    if (i < bidsLength) {
                        payloadArray.push (storedBids[i][2][0]);
                        payloadArray.push (storedBids[i][2][1]);
                    }
                    if (i < asksLength) {
                        payloadArray.push (storedAsks[i][2][0]);
                        payloadArray.push (storedAsks[i][2][1]);
                    }
                }
                const payload = payloadArray.join (':');
                const calculatedChecksum = this.crc32 (payload, true);
                const responseChecksum = this.safeInteger (rawOrderBook, 'checksum');
                if (calculatedChecksum !== responseChecksum) {
                    this.spawn (this.handleCheckSumError, client, symbol, messageHash);
                    return;
                }
            }
        } else {
            const orderbook = this.orderBook ({});
            const parsedOrderbook = this.parseOrderBook (rawOrderBook, symbol, timestamp);
            orderbook.reset (parsedOrderbook);
            this.orderbooks[symbol] = orderbook;
        }
        client.resolve (this.orderbooks[symbol], messageHash);
    }

    async handleCheckSumError (client: Client, symbol: string, messageHash: string) {
        await this.unWatchOrderBook (symbol);
        const error = new ChecksumError (this.id + ' ' + this.orderbookChecksumMessage (symbol));
        client.reject (error, messageHash);
    }

    handleDelta (bookside, delta) {
        const bidAsk = this.parseBidAsk (delta, 0, 1);
        bidAsk.push (delta);
        bookside.storeArray (bidAsk);
    }

    handleDeltas (bookside, deltas) {
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta (bookside, deltas[i]);
        }
    }

    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name hashkey#watchTrades
         * @description get the list of most recent trades for a particular symbol
         * @see https://hashkeyglobal-apidoc.readme.io/reference/websocket-api#public-stream
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum amount of trades to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
         */
        return await this.watchTradesForSymbols ([ symbol ], since, limit, params);
    }

    async watchTradesForSymbols (symbols: string[], since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name hashkey#watchTrades
         * @description watches information on multiple trades made in a market
         * @see https://hashkeyglobal-apidoc.readme.io/reference/websocket-api#public-stream
         * @param {string} symbol unified market symbol of the market trades were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of trade structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        const symbolsLength = symbols.length;
        if (symbolsLength === 0) {
            throw new ArgumentsRequired (this.id + ' watchTradesForSymbols() requires a non-empty array of symbols');
        }
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const topics = [];
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.market (symbol);
            const instId = market['baseId'] + market['quoteId'];
            let instType = undefined;
            if (market['spot']) {
                instType = 'SP'; // SP: Spot public channel; MC: Contract/future channel
            } else if (market['futures'] || market['swap']) {
                instType = 'MC';
            }
            const args: Dict = {
                'instType': instType,
                'channel': 'trade',
                'instId': instId,
            };
            topics.push (args);
            messageHashes.push ('trade:' + symbol);
        }
        const trades = await this.watchPublicMultiple (messageHashes, topics, params);
        if (this.newUpdates) {
            const first = this.safeValue (trades, 0);
            const tradeSymbol = this.safeString (first, 'symbol');
            limit = trades.getLimit (tradeSymbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    async unWatchTrades (symbol: string, params = {}): Promise<any> {
        /**
         * @method
         * @name hashkey#unWatchTrades
         * @description unsubscribe from the trades channel
         * @see https://hashkeyglobal-apidoc.readme.io/reference/websocket-api#public-stream
         * @param {string} symbol unified symbol of the market to unwatch the trades for
         * @returns {any} status of the unwatch request
         */
        await this.loadMarkets ();
        return await this.unWatchChannel (symbol, 'trade', 'trade', params);
    }

    handleTrades (client: Client, message) {
        //
        //     {
        //         action: 'update',
        //         arg: { instType: 'sp', channel: 'trade', instId: 'ETHUSDT' },
        //         data: [ [ '1728341807469', '2421.41', '0.478', 'sell' ] ],
        //         ts: 1728341807482
        //     }
        //
        const arg = this.safeDict (message, 'arg', {});
        const instType = this.safeStringLower (arg, 'instType');
        const baseAndQuote = this.parseSpotMarketId (this.safeString (arg, 'instId'));
        let symbol = this.safeCurrencyCode (baseAndQuote['baseId']) + '/' + this.safeCurrencyCode (baseAndQuote['quoteId']);
        if (instType !== 'sp') {
            symbol += '_SPBL';
        }
        const market = this.safeMarket (symbol);
        if (!(symbol in this.trades)) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            this.trades[symbol] = new ArrayCache (limit);
        }
        const stored = this.trades[symbol];
        let data = this.safeList (message, 'data', []);
        data[symbol] = symbol;
        if (data !== undefined) {
            data = this.sortBy (data, 0);
            for (let i = 0; i < data.length; i++) {
                const trade = this.safeList (data, i);
                const parsed = this.parseWsTrade (trade, market);
                stored.append (parsed);
            }
        }
        const messageHash = 'trade:' + symbol;
        client.resolve (stored, messageHash);
    }

    parseWsTrade (trade, market = undefined): Trade {
        //
        //     [
        //         '1728341807469',
        //         '2421.41',
        //         '0.478',
        //         'sell'
        //     ]
        //
        const marketId = market['id'];
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger (trade, 0);
        return this.safeTrade ({
            'id': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'side': this.safeStringLower (trade, 3),
            'price': this.safeString (trade, 1),
            'amount': this.safeString (trade, 2),
            'cost': undefined,
            'takerOrMaker': undefined,
            'type': undefined,
            'order': undefined,
            'fee': undefined,
            'info': trade,
        }, market);
    }

    handleMessage (client: Client, message) {
        const data = this.safeDict (message, 'arg', {});
        const channel = this.safeString (data, 'channel');
        const timeframe = channel.slice (6);
        const limitForOrderBook = channel.slice (5);
        if (channel === 'ticker') {
            this.handleTicker (client, message);
        }
        if (channel === 'candle' + timeframe) {
            this.handleOHLCV (client, message);
        }
        if (channel === 'books' + limitForOrderBook) {
            this.handleOrderBook (client, message);
        }
        if (channel === 'trade') {
            this.handleTrades (client, message);
        }
    }
}
