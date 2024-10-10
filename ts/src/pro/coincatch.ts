//  ---------------------------------------------------------------------------

import coincatchRest from '../coincatch.js';
import { ArgumentsRequired, ChecksumError, NotSupported } from '../base/errors.js';
import { Precise } from '../base/Precise.js';
import type { Balances, Dict, Int, Market, OHLCV, OrderBook, Strings, Ticker, Tickers, Trade } from '../base/types.js';
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
                'watchBalance': true,
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

    getMarketFromArg (entry) {
        const instId = this.safeString (entry, 'instId');
        const instType = this.safeString (entry, 'instType');
        const baseAndQuote = this.parseSpotMarketId (instId);
        const baseId = baseAndQuote['baseId'];
        const quoteId = baseAndQuote['quoteId'];
        let suffix = '_SPBL'; // spot suffix
        if (instType === 'mc') {
            if (quoteId === 'USD') {
                suffix = '_DMCBL';
            } else {
                suffix = '_UMCBL';
            }
        }
        const marketId = this.safeCurrencyCode (baseId) + this.safeCurrencyCode (quoteId) + suffix;
        return this.safeMarketCustom (marketId);
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
        const [ instType, instId ] = this.getInstTypeAndId (market);
        const messageHash = 'unsubscribe:' + messageHashTopic + ':' + symbol;
        const args: Dict = {
            'instType': instType,
            'channel': channel,
            'instId': instId,
        };
        return await this.unWatchPublic (messageHash, args, params);
    }

    getInstTypeAndId (market: Market) {
        const instId = market['baseId'] + market['quoteId'];
        let instType = undefined;
        if (market['spot']) {
            instType = 'SP';
        } else if (market['swap']) {
            instType = 'MC';
        } else {
            throw new NotSupported (this.id + ' supports only spot and swap markets');
        }
        return [ instType, instId ];
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
        const [ instType, instId ] = this.getInstTypeAndId (market);
        const channel = 'ticker';
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
        if (symbols === undefined) {
            symbols = this.symbols;
        }
        const topics = [];
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.market (symbol);
            const [ instType, instId ] = this.getInstTypeAndId (market);
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
        let market = this.getMarketFromArg (arg);
        const marketId = market['id'];
        const hash = 'ticker:';
        if (marketId.indexOf ('_DMCBL') >= 0) {
            market = this.handleDMCBLMarketByMessageHashes (market, hash, client);
        }
        const data = this.safeList (message, 'data', []);
        const ticker = this.parseWsTicker (this.safeDict (data, 0, {}), market);
        const symbol = market['symbol'];
        this.tickers[symbol] = ticker;
        const messageHash = hash + symbol;
        client.resolve (this.tickers[symbol], messageHash);
    }

    handleDMCBLMarketByMessageHashes (market: Market, hash: string, client: Client) {
        const marketId = market['id'];
        const messageHashes = this.findMessageHashes (client, hash);
        // the exchange counts DMCBL markets as the same market with different quote currencies
        // for example symbols ETHUSD:ETH and ETH/USD:BTC both have the same marketId ETHUSD_DMCBL
        // we need to check all markets with the same marketId to find the correct market that is in messageHashes
        const marketsWithCurrentId = this.safeList (this.markets_by_id, marketId, []);
        for (let i = 0; i < marketsWithCurrentId.length; i++) {
            market = marketsWithCurrentId[i];
            const symbol = market['symbol'];
            const messageHash = hash + symbol;
            if (this.inArray (messageHash, messageHashes)) {
                return market;
            }
        }
        return market;
    }

    parseWsTicker (ticker, market = undefined) {
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
        const last = this.safeString (ticker, 'last');
        const timestamp = this.safeInteger2 (ticker, 'ts', 'systemTime');
        return this.safeTicker ({
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'high24h'),
            'low': this.safeString (ticker, 'low24h'),
            'bid': this.safeString (ticker, 'bestBid'),
            'bidVolume': this.safeString (ticker, 'bidSz'),
            'ask': this.safeString (ticker, 'bestAsk'),
            'askVolume': this.safeString (ticker, 'askSz'),
            'vwap': undefined,
            'open': this.safeString2 (ticker, 'open24h', 'openUtc'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': Precise.stringMul (this.safeString (ticker, 'chgUTC'), '100'),
            'average': undefined,
            'baseVolume': this.safeNumber (ticker, 'baseVolume'),
            'quoteVolume': this.safeNumber (ticker, 'quoteVolume'),
            'indexPrice': this.safeString (ticker, 'indexPrice'),
            'markPrice': this.safeString (ticker, 'markPrice'),
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
        const market = this.getMarketFromArg (arg);
        const symbol = market['symbol'];
        if (!(symbol in this.ohlcvs)) {
            this.ohlcvs[symbol] = {};
        }
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
         * @name coincatch#unWatchOrderBook
         * @description unsubscribe from the orderbook channel
         * @see https://coincatch.github.io/github.io/en/spot/#depth-channel
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
        const market = this.getMarketFromArg (arg);
        const symbol = market['symbol'];
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
         * @name coincatch#watchTrades
         * @description get the list of most recent trades for a particular symbol
         * @see https://coincatch.github.io/github.io/en/spot/#trades-channel
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
         * @name coincatch#watchTrades
         * @description watches information on multiple trades made in a market
         * @see https://coincatch.github.io/github.io/en/spot/#trades-channel
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
         * @name coincatch#unWatchTrades
         * @description unsubscribe from the trades channel
         * @see https://coincatch.github.io/github.io/en/spot/#trades-channel
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
        const market = this.getMarketFromArg (arg);
        const symbol = market['symbol'];
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

    async watchBalance (params = {}): Promise<Balances> {
        /**
         * @method
         * @name bitget#watchBalance
         * @description watch balance and get the amount of funds available for trading or funds locked in orders
         * @see https://coincatch.github.io/github.io/en/spot/#account-channel
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {str} [params.type] spot or contract if not provided this.options['defaultType'] is used
         * @param {string} [params.instType] spbl for spot, UMCBL and DMCBL for contract if not provided this.options['defaultInstType'] is used
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
         */
        const channel = 'account';
        const instType = 'spbl';
        const args: Dict = {
            'instType': instType,
            'channel': channel,
            'instId': 'default',
        };
        const messageHash = 'balance:' + instType.toLowerCase ();
        return await this.watchPrivate (messageHash, messageHash, args, params);
    }

    handleBalance (client: Client, message) {
        //
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
        //             },
        //             {
        //                 coinId: '2',
        //                 coinName: 'USDT',
        //                 available: '19.17233843',
        //                 frozen: '0',
        //                 lock: '0'
        //             }
        //         ],
        //         ts: 1728464548725
        //
        const data = this.safeList (message, 'data', []);
        for (let i = 0; i < data.length; i++) {
            const rawBalance = data[i];
            const currencyId = this.safeString (rawBalance, 'coinName');
            const code = this.safeCurrencyCode (currencyId);
            const account = (code in this.balance) ? this.balance[code] : this.account ();
            account['total'] = this.safeString (rawBalance, 'available');
            account['used'] = this.safeString (rawBalance, 'frozen');
            this.balance[code] = account;
        }
        this.balance = this.safeBalance (this.balance);
        const arg = this.safeValue (message, 'arg');
        const instType = this.safeStringLower (arg, 'instType');
        const messageHash = 'balance:' + instType;
        client.resolve (this.balance, messageHash);
    }

    handleMessage (client: Client, message) {
        // todo handle with subscribe and unsubscribe
        const content = this.safeString (message, 'message');
        if (content === 'pong') {
            this.handlePong (client, message);
            return;
        }
        if (message === 'pong') {
            this.handlePong (client, message);
            return;
        }
        const event = this.safeString (message, 'event');
        if (event === 'login') {
            this.handleAuthenticate (client, message);
            return;
        }
        if (event === 'subscribe') {
            this.handleSubscriptionStatus (client, message);
            return;
        }
        const data = this.safeDict (message, 'arg', {});
        const channel = this.safeString (data, 'channel');
        if (channel === 'ticker') {
            this.handleTicker (client, message);
        }
        if (channel.indexOf ('candle') >= 0) {
            this.handleOHLCV (client, message);
        }
        if (channel.indexOf ('books') >= 0) {
            this.handleOrderBook (client, message);
        }
        if (channel === 'trade') {
            this.handleTrades (client, message);
        }
        if (channel === 'account') {
            this.handleBalance (client, message);
        }
    }

    ping (client: Client) {
        return 'ping';
    }

    handlePong (client: Client, message) {
        client.lastPong = this.milliseconds ();
        return message;
    }

    handleSubscriptionStatus (client: Client, message) {
        return message;
    }
}
