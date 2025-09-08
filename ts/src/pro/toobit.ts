//  ---------------------------------------------------------------------------

import toobitRest from '../toobit.js';
import { ArgumentsRequired } from '../base/errors.js';
import { ArrayCache, ArrayCacheBySymbolById, ArrayCacheByTimestamp } from '../base/ws/Cache.js';
import type { Int, Str, Ticker, OrderBook, Order, Trade, OHLCV, Dict, Bool } from '../base/types.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

export default class toobit extends toobitRest {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                // 'watchBalance': false,
                // 'watchMyTrades': true,
                // 'watchOHLCV': true,
                // 'watchOrderBook': true,
                // 'watchOrders': true,
                // 'watchTicker': true,
                // 'watchTickers': false, // for now
                // 'watchTrades': true,
                // 'watchPosition': false,
            },
            'urls': {
                'api': {
                    'ws': {
                        'spot': 'wss://stream.toobit.com',
                        'swap': 'wss://stream.toobit.com',
                    },
                },
            },
            'options': {
                'ws': {
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
                        '8h': '8h',
                        '12h': '12h',
                        '1d': '1d',
                        '1w': '1w',
                        '1M': '1M',
                    },
                },
            },
            'streaming': {
                'keepAlive': (60 - 1) * 5 * 1000, // every 5 minutes
                'ping': this.ping,
            },
            'exceptions': {
                'ws': {
                    'exact': {
                    },
                },
            },
        });
    }

    ping (client: Client) {
        return {
            'ping': this.milliseconds (),
        };
    }

    handleMessage (client: Client, message) {
        //
        //     {
        //         symbol: "DOGEUSDT",
        //         symbolName: "DOGEUSDT",
        //         topic: "trade",
        //         params: {
        //             realtimeInterval: "24h",
        //             binary: "false",
        //         },
        //         data: [
        //             {
        //                 v: "4864732022868004630",
        //                 t: 1757243788405,
        //                 p: "0.21804",
        //                 q: "80",
        //                 m: true,
        //             },
        //         ],
        //         f: true,  // initial first snapshot or not
        //         sendTime: 1757244002117,
        //         shared: false,
        //     }
        //
        const topic = this.safeString (message, 'topic');
        // const isSnapshot = this.safeBool (message, 'f');
        // if (this.handleErrorMessage (client, message)) {
        //     return;
        // }
        // if (event === 'pong') {
        //     client.lastPong = this.milliseconds ();
        // }
        const methods: Dict = {
            'trade': this.handleTrades,
            'kline': this.handleOHLCV,
            'realtimes': this.handleTickers,
            'depth': this.handlePartialOrderBook,
        };
        const method = this.safeValue (methods, topic);
        if (method !== undefined) {
            // if (isSnapshot) {
            //     return; // todo
            // }
            method.call (this, client, message);
        }
    }

    /**
     * @method
     * @name toobit#watchTrades
     * @description watches information on multiple trades made in a market
     * @see https://toobit-docs.github.io/apidocs/spot/v1/en/#trade-streams
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        return await this.watchTradesForSymbols ([ symbol ], since, limit, params);
    }

    /**
     * @method
     * @name toobit#watchTradesForSymbols
     * @description get the list of most recent trades for a list of symbols
     * @see https://toobit-docs.github.io/apidocs/spot/v1/en/#trade-streams
     * @param {string[]} symbols unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.name] the name of the method to call, 'trade' or 'aggTrade', default is 'trade'
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async watchTradesForSymbols (symbols: string[], since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        if (symbols === undefined) {
            throw new ArgumentsRequired (this.id + ' watchTradesForSymbols() requires a non-empty array of symbols');
        }
        symbols = this.marketSymbols (symbols);
        // const streamHash = 'multipleTrades' + '::' + symbols.join (',');
        // const firstMarket = this.market (symbols[0]);
        const messageHashes = [];
        const subParams = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.market (symbol);
            messageHashes.push ('trade::' + symbol);
            const rawHash = market['id'];
            subParams.push (rawHash);
        }
        const marketIds = this.marketIds (symbols);
        const url = this.urls['api']['ws']['spot'] + '/quote/ws/v1';
        const request: Dict = {
            'symbol': marketIds.join (','),
            'topic': 'trade',
            'event': 'sub',
        };
        const trades = await this.watchMultiple (url, messageHashes, this.extend (request, params), messageHashes);
        if (this.newUpdates) {
            const first = this.safeValue (trades, 0);
            const tradeSymbol = this.safeString (first, 'symbol');
            limit = trades.getLimit (tradeSymbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleTrades (client: Client, message) {
        //
        //     {
        //         symbol: "DOGEUSDT",
        //         symbolName: "DOGEUSDT",
        //         topic: "trade",
        //         params: {
        //             realtimeInterval: "24h",
        //             binary: "false",
        //         },
        //         data: [
        //             {
        //                 v: "4864732022868004630",
        //                 t: 1757243788405,
        //                 p: "0.21804",
        //                 q: "80",
        //                 m: true,
        //             },
        //         ],
        //         f: true,  // initial first snapshot or not
        //         sendTime: 1757244002117,
        //         shared: false,
        //     }
        //
        const marketId = this.safeString (message, 'symbol');
        const symbol = this.safeSymbol (marketId);
        if (!(symbol in this.trades)) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            this.trades[symbol] = new ArrayCache (limit);
        }
        const stored = this.trades[symbol];
        const data = this.safeList (message, 'data', []);
        const parsed = this.parseWsTrades (data);
        for (let i = 0; i < parsed.length; i++) {
            stored.append (parsed[i]);
        }
        const messageHash = 'trade::' + symbol;
        client.resolve (stored, messageHash);
    }

    parseWsTrade (trade: Dict, market: Market = undefined): Trade {
        return this.parseTrade (trade, market);
    }

    /**
     * @method
     * @name toobit#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://toobit-docs.github.io/apidocs/spot/v1/en/#kline-candlestick-streams
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async watchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        params['callerMethodName'] = 'watchOHLCV';
        const result = await this.watchOHLCVForSymbols ([ [ symbol, timeframe ] ], since, limit, params);
        return result[symbol][timeframe];
    }

    /**
     * @method
     * @name toobit#watchOHLCVForSymbols
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://toobit-docs.github.io/apidocs/spot/v1/en/#kline-candlestick-streams
     * @param {string[][]} symbolsAndTimeframes array of arrays containing unified symbols and timeframes to fetch OHLCV data for, example [['BTC/USDT', '1m'], ['LTC/USDT', '5m']]
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async watchOHLCVForSymbols (symbolsAndTimeframes: string[][], since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        const url = this.urls['api']['ws']['spot'] + '/quote/ws/v1';
        const messageHashes = [];
        const timeframes = this.safeDict (this.options['ws'], 'timeframes', {});
        const marketIds = [];
        let selectedTimeframe: Str = undefined;
        for (let i = 0; i < symbolsAndTimeframes.length; i++) {
            const data = symbolsAndTimeframes[i];
            const symbolStr = this.safeString (data, 0);
            const market = this.market (symbolStr);
            const marketId = market['id'];
            const unfiedTimeframe = this.safeString (data, 1, '1m');
            const rawTimeframe = this.safeString (timeframes, unfiedTimeframe, unfiedTimeframe);
            if (selectedTimeframe !== undefined && selectedTimeframe !== rawTimeframe) {
                throw new Error (this.id + ' watchOHLCVForSymbols() only supports a single timeframe for all symbols');
            } else {
                selectedTimeframe = rawTimeframe;
            }
            marketIds.push (marketId);
            messageHashes.push ('ohlcv::' + symbolStr + '::' + unfiedTimeframe);
        }
        const request: Dict = {
            'symbol': marketIds.join (','),
            'topic': 'kline_' + selectedTimeframe,
            'event': 'sub',
        };
        const [ symbol, timeframe, stored ] = await this.watchMultiple (url, messageHashes, this.extend (request, params), messageHashes);
        if (this.newUpdates) {
            limit = stored.getLimit (symbol, limit);
        }
        const filtered = this.filterBySinceLimit (stored, since, limit, 0, true);
        return this.createOHLCVObject (symbol, timeframe, filtered);
    }

    handleOHLCV (client: Client, message) {
        //
        //     {
        //         symbol: 'DOGEUSDT',
        //         symbolName: 'DOGEUSDT',
        //         klineType: '1m',
        //         topic: 'kline',
        //         params: { realtimeInterval: '24h', klineType: '1m', binary: 'false' },
        //         data: [
        //             {
        //                 t: 1757251200000,
        //                 s: 'DOGEUSDT',
        //                 sn: 'DOGEUSDT',
        //                 c: '0.21889',
        //                 h: '0.21898',
        //                 l: '0.21889',
        //                 o: '0.21897',
        //                 v: '5247',
        //                 st: 0
        //             }
        //         ],
        //         f: true,
        //         sendTime: 1757251217643,
        //         shared: false
        //     }
        //
        const marketId = this.safeString (message, 'symbol');
        const market = this.market (marketId);
        const symbol = market['symbol'];
        const params = this.safeDict (message, 'params', {});
        const timeframeId = this.safeString (params, 'klineType');
        const timeframe = this.findTimeframe (timeframeId);
        if (!(symbol in this.ohlcvs)) {
            this.ohlcvs[symbol] = {};
        }
        if (!(timeframe in this.ohlcvs[symbol])) {
            const limit = this.safeInteger (this.options['ws'], 'OHLCVLimit', 1000);
            this.ohlcvs[symbol][timeframe] = new ArrayCacheByTimestamp (limit);
        }
        const stored = this.ohlcvs[symbol][timeframe];
        const data = this.safeList (message, 'data', []);
        for (let i = 0; i < data.length; i++) {
            const parsed = this.parseWsOHLCV (data[i], market);
            stored.append (parsed);
        }
        const messageHash = 'ohlcv::' + symbol + '::' + timeframe;
        const resolveData = [ symbol, timeframe, stored ];
        client.resolve (resolveData, messageHash);
    }

    parseWsOHLCV (ohlcv, market = undefined): OHLCV {
        //
        //             {
        //                 t: 1757251200000,
        //                 o: '0.21897',
        //                 h: '0.21898',
        //                 l: '0.21889',
        //                 c: '0.21889',
        //                 v: '5247',
        //                 s: 'DOGEUSDT',
        //                 sn: 'DOGEUSDT',
        //                 st: 0
        //             }
        //
        const parsed = this.parseOHLCV (ohlcv, market);
        return parsed;
    }

    /**
     * @method
     * @name toobit#watchTicker
     * @see https://toobit-docs.github.io/apidocs/spot/v1/en/#individual-symbol-ticker-streams
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        symbol = this.symbol (symbol);
        const tickers = await this.watchTickers ([ symbol ], params);
        return tickers[symbol];
    }

    /**
     * @method
     * @name toobit#watchTickers
     * @see https://toobit-docs.github.io/apidocs/spot/v1/en/#individual-symbol-ticker-streams
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        if (symbols === undefined) {
            throw new ArgumentsRequired (this.id + ' watchTradesForSymbols() requires a non-empty array of symbols');
        }
        symbols = this.marketSymbols (symbols);
        // const streamHash = 'multipleTrades' + '::' + symbols.join (',');
        // const firstMarket = this.market (symbols[0]);
        const messageHashes = [];
        const subParams = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.market (symbol);
            messageHashes.push ('ticker::' + symbol);
            const rawHash = market['id'];
            subParams.push (rawHash);
        }
        const marketIds = this.marketIds (symbols);
        const url = this.urls['api']['ws']['spot'] + '/quote/ws/v1';
        const request: Dict = {
            'symbol': marketIds.join (','),
            'topic': 'realtimes',
            'event': 'sub',
        };
        const ticker = await this.watchMultiple (url, messageHashes, this.extend (request, params), messageHashes);
        if (this.newUpdates) {
            const result: Dict = {};
            result[ticker['symbol']] = ticker;
            return result;
        }
        return this.filterByArray (this.tickers, 'symbol', symbols);
    }

    handleTickers (client: Client, message) {
        //
        //    {
        //        "symbol": "DOGEUSDT",
        //        "symbolName": "DOGEUSDT",
        //        "topic": "realtimes",
        //        "params": {
        //            "realtimeInterval": "24h"
        //        },
        //        "data": [
        //            {
        //                "t": 1757257643683,
        //                "s": "DOGEUSDT",
        //                "o": "0.21462",
        //                "h": "0.22518",
        //                "l": "0.21229",
        //                "c": "0.2232",
        //                "v": "283337017",
        //                "qv": "62063771.42702",
        //                "sn": "DOGEUSDT",
        //                "m": "0.04",
        //                "e": 301,
        //                "c24h": "0.2232",
        //                "h24h": "0.22518",
        //                "l24h": "0.21229",
        //                "o24h": "0.21462",
        //                "v24h": "283337017",
        //                "qv24h": "62063771.42702",
        //                "m24h": "0.04"
        //            }
        //        ],
        //        "f": false,
        //        "sendTime": 1757257643751,
        //        "shared": false
        //    }
        //
        const data = this.safeList (message, 'data');
        const newTickers = {};
        for (let i = 0; i < data.length; i++) {
            const ticker = data[i];
            const parsed = this.parseWsTicker (ticker);
            const symbol = parsed['symbol'];
            this.tickers[symbol] = parsed;
            newTickers[symbol] = parsed;
            const messageHash = 'ticker::' + symbol;
            client.resolve (parsed, messageHash);
        }
        client.resolve (newTickers, 'tickers');
    }

    parseWsTicker (ticker, market = undefined) {
        return this.parseTicker (ticker, market);
    }

    /**
     * @method
     * @name toobit#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://toobit-docs.github.io/apidocs/spot/v1/en/#partial-book-depth-streams
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return.
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        return await this.watchOrderBookForSymbols ([ symbol ], limit, params);
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
    async watchOrderBookForSymbols (symbols: string[], limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        if (symbols === undefined) {
            throw new ArgumentsRequired (this.id + ' watchTradesForSymbols() requires a non-empty array of symbols');
        }
        symbols = this.marketSymbols (symbols);
        let channel: Str = undefined;
        [ channel, params ] = this.handleOptionAndParams (params, 'watchOrderBook', 'channel', 'depth');
        const messageHashes = [];
        const subParams = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.market (symbol);
            messageHashes.push ('orderBook::' + symbol + '::' + channel);
            const rawHash = market['id'];
            subParams.push (rawHash);
        }
        const marketIds = this.marketIds (symbols);
        const url = this.urls['api']['ws']['spot'] + '/quote/ws/v1';
        const request: Dict = {
            'symbol': marketIds.join (','),
            'topic': channel,
            'event': 'sub',
        };
        const orderbook = await this.watchMultiple (url, messageHashes, this.extend (request, params), messageHashes);
        return orderbook.limit ();
    }

    handlePartialOrderBook (client: Client, message) {
        //
        //     {
        //         symbol: 'DOGEUSDT',
        //         symbolName: 'DOGEUSDT',
        //         topic: 'depth',
        //         params: { realtimeInterval: '24h' },
        //         data: [
        //             {
        //             e: 301,
        //             s: 'DOGEUSDT',
        //             t: 1757304842860,
        //             v: '9814355_1E-18',
        //             b: [Array],
        //             a: [Array],
        //             o: 0
        //             }
        //         ],
        //         f: false,
        //         sendTime: 1757304843047,
        //         shared: false
        //     }
        //
        const data = this.safeList (message, 'data', []);
        if (data.length === 0) {
            return;
        }
        for (let i = 0; i < data.length; i++) {
            const entry = data[i];
            const marketId = this.safeString (entry, 's');
            const symbol = this.safeSymbol (marketId);
            const messageHash = 'orderBook::' + symbol + '::depth';
            if (!(symbol in this.orderbooks)) {
                const limit = this.safeInteger (this.options['ws'], 'orderBookLimit', 1000);
                this.orderbooks[symbol] = this.orderBook ({}, limit);
            }
            const orderbook = this.orderbooks[symbol];
            const timestamp = this.safeInteger (entry, 't');
            const snapshot = this.parseOrderBook (entry, symbol, timestamp, 'b', 'a');
            orderbook.reset (snapshot);
            client.resolve (orderbook, messageHash);
        }
    }
}
