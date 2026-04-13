
//  ---------------------------------------------------------------------------

import weexRest from '../weex.js';
import { BadRequest, ExchangeError, NotSupported } from '../base/errors.js';
// import { Precise } from '../base/Precise.js';
import { ArrayCache, ArrayCacheByTimestamp } from '../base/ws/Cache.js';
import type { Dict, Int, Market, OHLCV, OrderBook, Strings, Ticker, Tickers, Trade } from '../base/types.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

export default class weex extends weexRest {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'has': {
                'watchBidsAsks': true,
                'watchOHLCV': true,
                'watchOHLCVForSymbols': true,
                'watchOrderBook': false,
                'watchOrderBookForSymbols': false,
                'watchTicker': true,
                'watchTickers': true,
                'watchTrades': true,
                'watchTradesForSymbols': true,
                'unWatchBidsAsks': true,
                'unWatchOHLCV': true,
                'unWatchOHLCVForSymbols': true,
                'unWatchOrderBook': false,
                'unWatchOrderBookForSymbols': false,
                'unWatchTicker': true,
                'unWatchTickers': true,
                'unWatchTrades': true,
                'unWatchTradesForSymbols': true,
            },
            'urls': {
                'api': {
                    'ws': {
                        'spot': 'wss://ws-spot.weex.com/v3/ws',
                        'contract': 'wss://ws-contract.weex.com/v3/ws',
                    },
                },
            },
            'options': {
                'ws': {
                    'options': {
                        'headers': {
                            'User-Agent': 'b-WEEX111125', // todo check
                        },
                    },
                },
                'watchOHLCV': {
                    'priceType': 'LAST_PRICE', // or 'MARK_PRICE' for swap markets
                },
                'watchOHLCVForSymbols': {
                    'priceType': 'LAST_PRICE', // or 'MARK_PRICE' for swap markets
                },
                'watchOrderBook': {
                    'depth': '200', // or '15'
                },
                'watchOrderBookForSymbols': {
                    'depth': '200', // or '15'
                },
            },
            'streaming': {},
        });
    }

    requestId () {
        this.lockId ();
        const requestId = this.sum (this.safeInteger (this.options, 'requestId', 0), 1);
        this.options['requestId'] = requestId;
        this.unlockId ();
        return this.numberToString (requestId);
    }

    async subscribePublic (messageHashes, channels, isContract = false, params = {}, subscription = {}) {
        const id = this.requestId ();
        let method = 'SUBSCRIBE';
        const unsubscribe = this.safeBool (subscription, 'unsubscribe', false);
        if (unsubscribe) {
            method = 'UNSUBSCRIBE';
        }
        const message: Dict = {
            'id': id,
            'method': method,
            'params': channels,
        };
        subscription = this.extend (subscription, { 'id': id });
        const type = isContract ? 'contract' : 'spot';
        const url = this.urls['api']['ws'][type] + '/public';
        return await this.watchMultiple (url, messageHashes, this.deepExtend (message, params), messageHashes, subscription);
    }

    /**
     * @method
     * @name weex#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://www.weex.com/api-doc/spot/Websocket/public/Tickers-Channel
     * @see https://www.weex.com/api-doc/contract/Websocket/public/Tickers-Channel
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.name] stream to use can be ticker or miniTicker
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async watchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        symbol = this.symbol (symbol);
        const tickers = await this.watchTickers ([ symbol ], params);
        return tickers[symbol];
    }

    /**
     * @method
     * @name weex#watchTickers
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://www.weex.com/api-doc/spot/Websocket/public/Tickers-Channel
     * @see https://www.weex.com/api-doc/contract/Websocket/public/Tickers-Channel
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async watchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined, false, true);
        const firstMarket = this.getMarketFromSymbols (symbols);
        const isContract = firstMarket['contract'];
        const topic = 'ticker';
        const messageHashes = [];
        const channels = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.market (symbol);
            const channelName = market['id'] + '@' + topic;
            const messageHash = topic + '::' + symbol;
            messageHashes.push (messageHash);
            channels.push (channelName);
        }
        const newTicker = await this.subscribePublic (messageHashes, channels, isContract, params);
        if (this.newUpdates) {
            const result: Dict = {};
            result[newTicker['symbol']] = newTicker;
            return result;
        }
        return this.filterByArray (this.tickers, 'symbol', symbols);
    }

    /**
     * @method
     * @name weex#unWatchTicker
     * @description unWatches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://www.weex.com/api-doc/spot/Websocket/public/Tickers-Channel
     * @see https://www.weex.com/api-doc/contract/Websocket/public/Tickers-Channel
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async unWatchTicker (symbol: string, params = {}): Promise<any> {
        return await this.unWatchTickers ([ symbol ], params);
    }

    /**
     * @method
     * @name weex#unWatchTickers
     * @description unWatches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://www.weex.com/api-doc/spot/Websocket/public/Tickers-Channel
     * @see https://www.weex.com/api-doc/contract/Websocket/public/Tickers-Channel
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async unWatchTickers (symbols: Strings = undefined, params = {}): Promise<any> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined, false, true);
        const firstMarket = this.getMarketFromSymbols (symbols);
        const isContract = firstMarket['contract'];
        const topic = 'ticker';
        const subHashes = [];
        const channels = [];
        const unSubHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.market (symbol);
            const channelName = market['id'] + '@' + topic;
            const messageHash = topic + '::' + symbol;
            const unSubMessageHash = 'unsubscribe::' + messageHash;
            subHashes.push (messageHash);
            channels.push (channelName);
            unSubHashes.push (unSubMessageHash);
        }
        const subscription = {
            'unsubscribe': true,
            'symbols': symbols,
            'messageHashes': unSubHashes,
            'subMessageHashes': subHashes,
            'topic': topic,
        };
        return await this.subscribePublic (unSubHashes, channels, isContract, params, subscription);
    }

    handleTicker (client: Client, message) {
        //
        //     {
        //         "e": "ticker",
        //         "E": 1776081628845,
        //         "s": "ETHUSDT",
        //         "d": [
        //             {
        //                 "p": "-18.93",
        //                 "P": "-0.008592",
        //                 "w": "2192.40298388",
        //                 "c": "2184.20",
        //                 "o": "2203.13",
        //                 "h": "2217.34",
        //                 "l": "2173.32",
        //                 "v": "359395.800",
        //                 "q": "787940424.31399",
        //                 "O": 1775995200000,
        //                 "C": 1776081600000,
        //                 "n": 485169,
        //                 "m": "2184.28",
        //                 "i": "2185.2025"
        //             }
        //         ]
        //     }
        //
        const market = this.getMarketFromClientAndMessage (client, message);
        const tickers = this.safeList (message, 'd', []);
        const data = this.safeDict (tickers, 0, {});
        const ticker = this.parseWsTicker (data, market);
        const symbol = market['symbol'];
        const messageHash = 'ticker::' + symbol;
        this.tickers[symbol] = ticker;
        client.resolve (this.tickers[symbol], messageHash);
    }

    parseWsTicker (ticker: Dict, market: Market = undefined): Ticker {
        //
        //     {
        //         "p": "-18.93",
        //         "P": "-0.008592",
        //         "w": "2192.40298388",
        //         "c": "2184.20",
        //         "o": "2203.13",
        //         "h": "2217.34",
        //         "l": "2173.32",
        //         "v": "359395.800",
        //         "q": "787940424.31399",
        //         "O": 1775995200000,
        //         "C": 1776081600000,
        //         "n": 485169,
        //         "m": "2184.28",
        //         "i": "2185.2025"
        //     }
        //
        const timestamp = this.safeInteger (ticker, 'C');
        const close = this.safeString (ticker, 'c');
        return this.safeTicker ({
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'h'),
            'low': this.safeString (ticker, 'l'),
            'bid': this.safeString (ticker, 'b'),
            'bidVolume': this.safeString (ticker, 'B'),
            'ask': this.safeString (ticker, 'a'),
            'askVolume': this.safeString (ticker, 'A'),
            'vwap': this.safeString (ticker, 'w'),
            'open': this.safeString (ticker, 'o'),
            'close': close,
            'last': close,
            'previousClose': this.safeString (ticker, 'x'),
            'change': this.safeString (ticker, 'p'),
            'percentage': this.safeString (ticker, 'P'),
            'average': this.safeString (ticker, 'w'),
            'baseVolume': this.safeString (ticker, 'v'),
            'quoteVolume': this.safeString (ticker, 'q'),
            'markPrice': this.safeString (ticker, 'm'),
            'indexPrice': this.safeString (ticker, 'i'),
            'info': ticker,
        }, market);
    }

    /**
     * @method
     * @name weex#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://www.weex.com/api-doc/spot/Websocket/public/Trades-Channel
     * @see https://www.weex.com/api-doc/contract/Websocket/public/Trades-Channel
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        return await this.watchTradesForSymbols ([ symbol ], since, limit, params);
    }

    /**
     * @method
     * @name weex#watchTradesForSymbols
     * @description get the list of most recent trades for a list of symbols
     * @see https://www.weex.com/api-doc/spot/Websocket/public/Trades-Channel
     * @see https://www.weex.com/api-doc/contract/Websocket/public/Trades-Channel
     * @param {string[]} symbols unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    async watchTradesForSymbols (symbols: string[], since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined, false, true);
        const firstMarket = this.getMarketFromSymbols (symbols);
        const isContract = firstMarket['contract'];
        const topic = 'trade';
        const messageHashes = [];
        const channels = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.market (symbol);
            const channelName = market['id'] + '@' + topic;
            const messageHash = topic + '::' + symbol;
            messageHashes.push (messageHash);
            channels.push (channelName);
        }
        const trades = await this.subscribePublic (messageHashes, channels, isContract, params);
        if (this.newUpdates) {
            const first = this.safeValue (trades, 0);
            const tradeSymbol = this.safeString (first, 'symbol');
            limit = trades.getLimit (tradeSymbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    /**
     * @method
     * @name weex#unWatchTrades
     * @description unsubscribes from the trades channel
     * @see https://www.weex.com/api-doc/spot/Websocket/public/Trades-Channel
     * @see https://www.weex.com/api-doc/contract/Websocket/public/Trades-Channel
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    async unWatchTrades (symbol: string, params = {}): Promise<any> {
        await this.loadMarkets ();
        return await this.unWatchTradesForSymbols ([ symbol ], params);
    }

    /**
     * @method
     * @name weex#unWatchTradesForSymbols
     * @description unsubscribes from the trades channel
     * @see https://www.weex.com/api-doc/spot/Websocket/public/Trades-Channel
     * @see https://www.weex.com/api-doc/contract/Websocket/public/Trades-Channel
     * @param {string[]} symbols unified symbol of the market to fetch trades for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    async unWatchTradesForSymbols (symbols: string[], params = {}): Promise<any> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined, false, true);
        const firstMarket = this.getMarketFromSymbols (symbols);
        const isContract = firstMarket['contract'];
        const topic = 'trade';
        const subHashes = [];
        const channels = [];
        const unSubHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.market (symbol);
            const channelName = market['id'] + '@' + topic;
            const messageHash = topic + '::' + symbol;
            const unSubMessageHash = 'unsubscribe::' + messageHash;
            subHashes.push (messageHash);
            channels.push (channelName);
            unSubHashes.push (unSubMessageHash);
        }
        const subscription = {
            'unsubscribe': true,
            'symbols': symbols,
            'messageHashes': unSubHashes,
            'subMessageHashes': subHashes,
            'topic': 'trades',
        };
        return await this.subscribePublic (unSubHashes, channels, isContract, params, subscription);
    }

    handleTrade (client: Client, message) {
        //
        //     {
        //         "e": "trade",
        //         "E": 1776104608321,
        //         "s": "ETHUSDT",
        //         "d": [
        //             {
        //                 "T": 1776104608298,
        //                 "t": "41099265-7985-4f4c-af93-2cc3bc1cf13b",
        //                 "p": "2225.15",
        //                 "q": "0.02525",
        //                 "v": "56.1850375",
        //                 "m": false
        //             }
        //         ]
        //     }
        //
        const market = this.getMarketFromClientAndMessage (client, message);
        const symbol = market['symbol'];
        const messageHash = 'trade::' + symbol;
        if (!(symbol in this.trades)) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            this.trades[symbol] = new ArrayCache (limit);
        }
        const tradesArray = this.trades[symbol];
        const data = this.safeList (message, 'd', []);
        const newTrades = [];
        for (let i = 0; i < data.length; i++) {
            const rawTrade = this.safeDict (data, i, {});
            const trade = this.parseWsTrade (rawTrade, market);
            newTrades.push (trade);
        }
        const sorted = this.sortBy (newTrades, 'timestamp');
        for (let j = 0; j < sorted.length; j++) {
            const sortedTrade = sorted[j];
            tradesArray.append (sortedTrade);
        }
        this.trades[symbol] = tradesArray;
        client.resolve (tradesArray, messageHash);
    }

    parseWsTrade (trade, market = undefined) {
        //
        //     {
        //         "T": 1776089287762,
        //         "t": "df4d1af1-71e8-400d-9571-f2cee2e6bea8",
        //         "p": "2203.73",
        //         "q": "7.214",
        //         "v": "15897.70822",
        //         "m": false
        //     }
        //
        const timestamp = this.safeInteger (trade, 'T');
        return this.safeTrade ({
            'info': trade,
            'id': this.safeString (trade, 't'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'order': undefined,
            'type': undefined,
            'side': undefined,
            'takerOrMaker': undefined,
            'price': this.safeString (trade, 'p'),
            'amount': this.safeString (trade, 'q'),
            'cost': this.safeString (trade, 'v'),
            'fee': undefined,
        }, market);
    }

    /**
     * @method
     * @name weex#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://www.weex.com/api-doc/spot/Websocket/public/Candlesticks-Channel
     * @see https://www.weex.com/api-doc/contract/Websocket/public/Candlesticks-Channel
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async watchOHLCV (symbol: string, timeframe: string = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        const extendedParams = this.extend (params, {
            'callerMethodName': 'watchOHLCV',
        });
        const result = await this.watchOHLCVForSymbols ([ [ symbol, timeframe ] ], since, limit, extendedParams);
        return result[symbol][timeframe];
    }

    /**
     * @method
     * @name weex#watchOHLCVForSymbols
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://www.weex.com/api-doc/spot/Websocket/public/Candlesticks-Channel
     * @see https://www.weex.com/api-doc/contract/Websocket/public/Candlesticks-Channel
     * @param {string[][]} symbolsAndTimeframes array of arrays containing unified symbols and timeframes to fetch OHLCV data for, example [['BTC/USDT', '1m'], ['LTC/USDT', '5m']]
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async watchOHLCVForSymbols (symbolsAndTimeframes: string[][], since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        const callerMethodName = this.safeString (params, 'callerMethodName', 'watchOHLCVForSymbols');
        params = this.omit (params, 'callerMethodName');
        const channels = [];
        const messageHashes = [];
        const firstEntry = this.safeList (symbolsAndTimeframes, 0, []);
        const firstSymbol = this.safeString (firstEntry, 0);
        const firstMarket = this.market (firstSymbol);
        const isContract = firstMarket['contract'];
        let priceType = 'LAST_PRICE';
        if (isContract) {
            [ priceType, params ] = this.handleOptionAndParams2 (params, callerMethodName, 'price', 'priceType', priceType);
        }
        for (let i = 0; i < symbolsAndTimeframes.length; i++) {
            const data = this.safeList (symbolsAndTimeframes, i);
            let symbolString = this.safeString (data, 0);
            const market = this.market (symbolString);
            if (market['type'] !== firstMarket['type']) {
                throw new BadRequest (this.id + ' ' + callerMethodName + ' market symbols must be of the same type');
            }
            symbolString = market['symbol'];
            const unifiedTimeframe = this.safeString (data, 1, '1');
            const interval = this.safeString (this.timeframes, unifiedTimeframe, unifiedTimeframe);
            const channel = market['id'] + '@kline_' + interval + '_' + priceType;
            const messageHash = 'ohlcv::' + symbolString + '::' + unifiedTimeframe;
            channels.push (channel);
            messageHashes.push (messageHash);
        }
        const [ symbol, timeframe, stored ] = await this.subscribePublic (messageHashes, channels, isContract, params);
        if (this.newUpdates) {
            limit = stored.getLimit (symbol, limit);
        }
        const filtered = this.filterBySinceLimit (stored, since, limit, 0, true);
        return this.createOHLCVObject (symbol, timeframe, filtered);
    }

    /**
     * @method
     * @name weex#unWatchOHLCV
     * @description unWatches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://www.weex.com/api-doc/spot/Websocket/public/Candlesticks-Channel
     * @see https://www.weex.com/api-doc/contract/Websocket/public/Candlesticks-Channel
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async unWatchOHLCV (symbol: string, timeframe = '1m', params = {}): Promise<any> {
        params['callerMethodName'] = 'unWatchOHLCV';
        return await this.unWatchOHLCVForSymbols ([ [ symbol, timeframe ] ], params);
    }

    /**
     * @method
     * @name weex#unWatchOHLCVForSymbols
     * @description unWatches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://www.weex.com/api-doc/spot/Websocket/public/Candlesticks-Channel
     * @see https://www.weex.com/api-doc/contract/Websocket/public/Candlesticks-Channel
     * @param {string[][]} symbolsAndTimeframes array of arrays containing unified symbols and timeframes to fetch OHLCV data for, example [['BTC/USDT', '1m'], ['LTC/USDT', '5m']]
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async unWatchOHLCVForSymbols (symbolsAndTimeframes: string[][], params = {}): Promise<any> {
        await this.loadMarkets ();
        const callerMethodName = this.safeString (params, 'callerMethodName', 'unWatchOHLCVForSymbols');
        params = this.omit (params, 'callerMethodName');
        const channels = [];
        const subHashes = [];
        const unSubHashes = [];
        const firstEntry = this.safeList (symbolsAndTimeframes, 0, []);
        const firstSymbol = this.safeString (firstEntry, 0);
        const firstMarket = this.market (firstSymbol);
        const isContract = firstMarket['contract'];
        let priceType = 'LAST_PRICE';
        if (isContract) {
            [ priceType, params ] = this.handleOptionAndParams2 (params, callerMethodName, 'price', 'priceType', priceType);
        }
        for (let i = 0; i < symbolsAndTimeframes.length; i++) {
            const data = this.safeList (symbolsAndTimeframes, i);
            let symbolString = this.safeString (data, 0);
            const market = this.market (symbolString);
            if (market['type'] !== firstMarket['type']) {
                throw new BadRequest (this.id + ' ' + callerMethodName + ' market symbols must be of the same type');
            }
            symbolString = market['symbol'];
            const unifiedTimeframe = this.safeString (data, 1, '1');
            const interval = this.safeString (this.timeframes, unifiedTimeframe, unifiedTimeframe);
            const channel = market['id'] + '@kline_' + interval + '_' + priceType;
            const messageHash = 'ohlcv::' + symbolString + '::' + unifiedTimeframe;
            const unSubMessageHash = 'unsubscribe::' + messageHash;
            channels.push (channel);
            subHashes.push (messageHash);
            unSubHashes.push (unSubMessageHash);
        }
        const subscription = {
            'unsubscribe': true,
            'symbolsAndTimeframes': symbolsAndTimeframes,
            'messageHashes': unSubHashes,
            'subMessageHashes': subHashes,
            'topic': 'ohlcv',
        };
        return await this.subscribePublic (unSubHashes, channels, isContract, params, subscription);
    }

    handleOHLCV (client: Client, message) {
        //
        //     {
        //         e: 'kline',
        //         E: 1776095535012,
        //         s: 'ETHUSDT',
        //         p: 'LAST_PRICE',
        //         d: [
        //             {
        //                 t: 1776092400000,
        //                 T: 1776096000000,
        //                 s: 'ETHUSDT',
        //                 i: '1h',
        //                 o: '2234.18',
        //                 c: '2205.15',
        //                 h: '2236.43',
        //                 l: '2199.53',
        //                 v: '12505.60574',
        //                 n: 3381,
        //                 q: '27682528.6655305',
        //                 V: '6420.47929',
        //                 Q: '14213680.1906424'
        //             }
        //         ]
        //     }
        //
        const market = this.getMarketFromClientAndMessage (client, message);
        const symbol = market['symbol'];
        if (!(symbol in this.ohlcvs)) {
            this.ohlcvs[symbol] = {};
        }
        const data = this.safeList (message, 'd', []);
        const firstEntry = this.safeDict (data, 0, {});
        const interval = this.safeString (firstEntry, 'i');
        const timeframe = this.findTimeframe (interval);
        if (!(timeframe in this.ohlcvs[symbol])) {
            const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
            this.ohlcvs[symbol][timeframe] = new ArrayCacheByTimestamp (limit);
        }
        const stored = this.ohlcvs[symbol][timeframe];
        for (let i = 0; i < data.length; i++) {
            const entry = this.safeDict (data, i, {});
            const parsed = this.parseWsOHLCV (entry);
            stored.append (parsed);
        }
        const messageHash = 'ohlcv::' + symbol + '::' + timeframe;
        const resolveData = [ symbol, timeframe, stored ];
        client.resolve (resolveData, messageHash);
    }

    parseWsOHLCV (ohlcv, market = undefined): OHLCV {
        //
        //     {
        //         t: 1776092400000,
        //         T: 1776096000000,
        //         s: 'ETHUSDT',
        //         i: '1h',
        //         o: '2234.18',
        //         c: '2205.15',
        //         h: '2236.43',
        //         l: '2199.53',
        //         v: '12505.60574',
        //         n: 3381,
        //         q: '27682528.6655305',
        //         V: '6420.47929',
        //         Q: '14213680.1906424'
        //     }
        //
        return [
            this.safeInteger (ohlcv, 't'),
            this.safeNumber (ohlcv, 'o'),
            this.safeNumber (ohlcv, 'h'),
            this.safeNumber (ohlcv, 'l'),
            this.safeNumber (ohlcv, 'c'),
            this.safeNumber (ohlcv, 'v'),
        ];
    }

    /**
     * @method
     * @name weex#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://www.weex.com/api-doc/spot/Websocket/public/Depth-Channel
     * @see https://www.weex.com/api-doc/contract/Websocket/public/Depth-Channel
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        params = this.extend (params, {
            'callerMethodName': 'watchOrderBook',
        });
        return await this.watchOrderBookForSymbols ([ symbol ], limit, params);
    }

    /**
     * @method
     * @name weex#watchOrderBookForSymbols
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://www.weex.com/api-doc/spot/Websocket/public/Depth-Channel
     * @see https://www.weex.com/api-doc/contract/Websocket/public/Depth-Channel
     * @param {string[]} symbols unified array of symbols
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBookForSymbols (symbols: string[], limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined, false, true);
        const firstMarket = this.getMarketFromSymbols (symbols);
        const isContract = firstMarket['contract'];
        const callerMethodName = this.safeString (params, 'callerMethodName', 'watchOrderBookForSymbols');
        params = this.omit (params, 'callerMethodName');
        let depth = '200';
        [ depth, params ] = this.handleOptionAndParams (params, callerMethodName, 'depth', depth);
        const messageHashes = [];
        const channels = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.market (symbol);
            const messageHash = 'orderbook::' + symbol;
            const channel = market['id'] + '@depth' + depth;
            messageHashes.push (messageHash);
            channels.push (channel);
        }
        const subscription: Dict = {
            'limit': limit,
        };
        const orderbook = await this.subscribePublic (messageHashes, channels, isContract, params, subscription);
        return orderbook.limit ();
    }

    /**
     * @method
     * @name weex#unWatchOrderBook
     * @description unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://www.weex.com/api-doc/spot/Websocket/public/Depth-Channel
     * @see https://www.weex.com/api-doc/contract/Websocket/public/Depth-Channel
     * @param {string} symbol unified array of symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbols
     */
    async unWatchOrderBook (symbol: string, params = {}): Promise<any> {
        params = this.extend (params, {
            'callerMethodName': 'unWatchOrderBook',
        });
        return await this.unWatchOrderBookForSymbols ([ symbol ], params);
    }

    /**
     * @method
     * @name weex#unWatchOrderBookForSymbols
     * @description unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://www.weex.com/api-doc/spot/Websocket/public/Depth-Channel
     * @see https://www.weex.com/api-doc/contract/Websocket/public/Depth-Channel
     * @param {string[]} symbols unified array of symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbols
     */
    async unWatchOrderBookForSymbols (symbols: string[], params = {}): Promise<any> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined, false, true);
        const firstMarket = this.getMarketFromSymbols (symbols);
        const isContract = firstMarket['contract'];
        const callerMethodName = this.safeString (params, 'callerMethodName', 'unWatchOrderBookForSymbols');
        params = this.omit (params, 'callerMethodName');
        let depth = '200';
        [ depth, params ] = this.handleOptionAndParams (params, callerMethodName, 'depth', depth);
        const subHashes = [];
        const channels = [];
        const unSubHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.market (symbol);
            const messageHash = 'orderbook::' + symbol;
            const channel = market['id'] + '@depth' + depth;
            const unSubMessageHash = 'unsubscribe::' + messageHash;
            subHashes.push (messageHash);
            channels.push (channel);
            unSubHashes.push (unSubMessageHash);
        }
        const subscription = {
            'unsubscribe': true,
            'symbols': symbols,
            'messageHashes': unSubHashes,
            'subMessageHashes': subHashes,
            'topic': 'orderbook',
        };
        return await this.subscribePublic (unSubHashes, channels, isContract, params, subscription);
    }

    handleOrderBook (client: Client, message) {
        //
        //     {
        //         "e": "depth",
        //         "E": 1776098967972,
        //         "s": "ETHUSDT",
        //         "U": 14181847790,
        //         "u": 14181847802,
        //         "l": 200,
        //         "d": "CHANGED",
        //         "b": [ [ "2227.21", "0" ], [ "2227.20", "46.519" ] ],
        //         "a": [ [ "2227.21", "44.092" ], [ "2227.26", "0" ] ]
        //     }
        //
        const market = this.getMarketFromClientAndMessage (client, message);
        const symbol = market['symbol'];
        const messageHash = 'orderbook::' + symbol;
        if (!(symbol in this.orderbooks)) {
            const subscription = this.safeDict (client.subscriptions, messageHash, {});
            const limit = this.safeInteger (subscription, 'limit');
            if (limit !== undefined) {
                this.orderbooks[symbol] = this.orderBook ({}, limit);
            } else {
                this.orderbooks[symbol] = this.orderBook ({});
            }
        }
        const orderbook = this.orderbooks[symbol];
        const timestamp = this.safeInteger (message, 'E');
        const event = this.safeString (message, 'e');
        const nonce = this.safeInteger (message, 'u');
        if (event === 'depthSnapshot') {
            const parsed = this.parseOrderBook (message, symbol, timestamp, 'b', 'a');
            parsed['nonce'] = nonce;
            orderbook.reset (parsed);
        } else {
            const asks = this.safeList (message, 'a', []);
            const bids = this.safeList (message, 'b', []);
            this.handleDeltas (orderbook['asks'], asks);
            this.handleDeltas (orderbook['bids'], bids);
            orderbook['timestamp'] = timestamp;
            orderbook['datetime'] = this.iso8601 (timestamp);
            orderbook['nonce'] = nonce;
        }
        client.resolve (orderbook, messageHash);
    }

    handleDelta (bookside, delta) {
        const bidAsk = this.parseBidAsk (delta);
        bookside.storeArray (bidAsk);
    }

    /**
     * @method
     * @name weex#watchBidsAsks
     * @description watches best bid & ask for spot symbols
     * @see https://www.weex.com/api-doc/spot/Websocket/public/BookTicker-Channel
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchBidsAsks (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined, false, true);
        const firstMarket = this.getMarketFromSymbols (symbols);
        if (firstMarket['contract']) {
            throw new NotSupported (this.id + ' watchBidsAsks is supported for spot markets only');
        }
        const messageHashes = [];
        const channels = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.market (symbol);
            const channelName = market['id'] + '@' + 'bookTicker';
            const messageHash = 'bidask::' + symbol;
            messageHashes.push (messageHash);
            channels.push (channelName);
        }
        const newTicker = await this.subscribePublic (messageHashes, channels, false, params);
        if (this.newUpdates) {
            const result = {};
            result[newTicker['symbol']] = newTicker;
            return result;
        }
        return this.filterByArray (this.bidsasks, 'symbol', symbols);
    }

    /**
     * @method
     * @name weex#unWatchBidsAsks
     * @description unWatches best bid & ask for spot symbols
     * @see https://www.weex.com/api-doc/spot/Websocket/public/BookTicker-Channel
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async unWatchBidsAsks (symbols: Strings = undefined, params = {}): Promise<any> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined, false, true);
        const firstMarket = this.getMarketFromSymbols (symbols);
        if (firstMarket['contract']) {
            throw new NotSupported (this.id + ' unWatchBidsAsks is supported for spot markets only');
        }
        const subHashes = [];
        const channels = [];
        const unSubHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.market (symbol);
            const channelName = market['id'] + '@' + 'bookTicker';
            const messageHash = 'bidask::' + symbol;
            const unSubMessageHash = 'unsubscribe::' + messageHash;
            subHashes.push (messageHash);
            channels.push (channelName);
            unSubHashes.push (unSubMessageHash);
        }
        const subscription = {
            'unsubscribe': true,
            'symbols': symbols,
            'messageHashes': unSubHashes,
            'subMessageHashes': subHashes,
            'topic': 'bidsasks',
        };
        return await this.subscribePublic (unSubHashes, channels, false, params, subscription);
    }

    handleBidAsk (client: Client, message) {
        //
        //     {
        //         "e": "bookTicker",
        //         "E": 1776103547551,
        //         "s": "ETHUSDT",
        //         "u": 1776103547547,
        //         "b": "2227.39",
        //         "B": "1.05512",
        //         "a": "2227.40",
        //         "A": "6.30889"
        //     }
        //
        const market = this.getMarketFromClientAndMessage (client, message);
        const ticker = this.parseWsBidAsk (message, market);
        const symbol = ticker['symbol'];
        this.bidsasks[symbol] = ticker;
        const messageHash = 'bidask::' + symbol;
        client.resolve (ticker, messageHash);
    }

    parseWsBidAsk (message, market = undefined) {
        const timestamp = this.safeInteger (message, 'E');
        return this.safeTicker ({
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'ask': this.safeString (message, 'a'),
            'askVolume': this.safeString (message, 'A'),
            'bid': this.safeString (message, 'b'),
            'bidVolume': this.safeString (message, 'B'),
            'info': message,
        }, market);
    }

    getMarketFromClientAndMessage (client, message) {
        const url = client.url;
        let marketType = 'spot';
        if (url.indexOf ('contract') >= 0) {
            marketType = 'swap';
        }
        const marketId = this.safeString (message, 's');
        const market = this.safeMarket (marketId, undefined, undefined, marketType);
        return market;
    }

    async pong (client, message) {
        //
        //     { "event": "ping", "time": "1776078750000" }
        //
        const response: Dict = {
            'id': this.requestId (),
            'method': 'PONG',
        };
        await client.send (response);
    }

    handlePing (client: Client, message) {
        this.spawn (this.pong, client, message);
    }

    handleSubscriptionStatus (client: Client, message) {
        //
        //     { "result": true, "id": 2 }
        //
        const id = this.safeString (message, 'id');
        const subscriptionsById = this.indexBy (client.subscriptions, 'id');
        const subscription = this.safeDict (subscriptionsById, id, {});
        const unsubscribe = this.safeBool (subscription, 'unsubscribe', false);
        if (unsubscribe) {
            const messageHashes = this.safeList (subscription, 'messageHashes', []);
            const subHashes = this.safeList (subscription, 'subMessageHashes', []);
            for (let i = 0; i < messageHashes.length; i++) {
                const unSubHash = this.safeString (messageHashes, i);
                const subHash = this.safeString (subHashes, i);
                this.cleanUnsubscription (client, subHash, unSubHash);
            }
            this.cleanCache (subscription);
        }
        return message;
    }

    handleErrorMessage (client: Client, message) {
        //
        //     {
        //         "result": false,
        //         "id": 1,
        //         "msg": "INVALID_ARGUMENT: invalid symbol : ASDFS_SPBL"
        //     }
        //
        const result = this.safeBool (message, 'result', true);
        if (!result) {
            const msg = this.safeString (message, 'msg', '');
            const feedback = this.id + ' ' + this.json (message);
            try {
                this.throwExactlyMatchedException (this.exceptions['exact'], msg, feedback);
                this.throwBroadlyMatchedException (this.exceptions['broad'], msg, feedback);
                throw new ExchangeError (feedback);
            } catch (error) {
                client.reject (error);
                return true;
            }
        }
        return false;
    }

    handleMessage (client: Client, message) {
        //
        //     { "id": "5", "method": "PONG" }
        //
        //     { "result": true, "id": 2 }
        //
        //     {
        //         "result": false,
        //         "id": 1,
        //         "msg": "INVALID_ARGUMENT: invalid symbol : ASDFS_SPBL"
        //     }
        //
        if (this.handleErrorMessage (client, message)) {
            return;
        }
        const id = this.safeString (message, 'id');
        if (id !== undefined) {
            this.handleSubscriptionStatus (client, message);
            return;
        }
        const event = this.safeString2 (message, 'e', 'event');
        if (event === 'ping') {
            this.handlePing (client, message);
        } else if (event === 'ticker') {
            this.handleTicker (client, message);
        } else if ((event === 'trade') || (event === 'tradeSnapshot')) {
            this.handleTrade (client, message);
        } else if ((event === 'kline') || (event === 'klineSnapshot')) {
            this.handleOHLCV (client, message);
        } else if ((event === 'depth') || (event === 'depthSnapshot')) {
            this.handleOrderBook (client, message);
        } else if (event === 'bookTicker') {
            this.handleBidAsk (client, message);
        }
    }
}
