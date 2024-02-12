
//  ---------------------------------------------------------------------------

import blofinRest from '../blofin.js';
import { NotSupported, ArgumentsRequired } from '../base/errors.js';
import { ArrayCache } from '../base/ws/Cache.js';
import type { Int, MarketInterface, Trade, OrderBook, Str, Strings, Ticker, Tickers, OHLCV } from '../base/types.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

export default class blofin extends blofinRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchTrades': true,
                'watchTradesForSymbols': true,
                'watchOrderBook': true,
                'watchOrderBookForSymbols': true,
                'watchTicker': true,
                'watchTickers': true,
                'watchOHLCV': true,
                'watchOHLCVForSymbols': true,
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
        });
    }

    async watchMultipleWrapper (channelName: string, methodName: string, symbols: string[], limit: Int = undefined, params = {}) {
        // underlier method for all watch-multiple symbols
        await this.loadMarkets ();
        this.requireSymbolsForMultiSubscription (methodName, symbols);
        let firstMarket = undefined;
        symbols = this.marketSymbols (symbols, undefined, false, true);
        if (symbols !== undefined) {
            firstMarket = this.market (symbols[0]);
        }
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams (methodName, firstMarket, params);
        if (marketType === 'spot') {
            throw new NotSupported (this.id + ' ' + methodName + '() is not supported for spot markets');
        }
        const rawSubscriptions = [];
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const market = this.market (symbols[i]);
            const message = {
                'channel': channelName,
                'instId': market['id'],
            };
            rawSubscriptions.push (message);
            messageHashes.push (channelName + ':' + market['symbol']);
        }
        const request = {
            'op': 'subscribe',
            'args': rawSubscriptions,
        };
        const url = this.implodeHostname (this.urls['api']['ws'][marketType]['public']);
        return await this.watchMultiple (url, messageHashes, this.deepExtend (request, params), messageHashes);
    }

    handleMessage (client: Client, message) {
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
            'trades': this.handleWsTrades,
            'books': this.handleWsOrderBook,
            'tickers': this.handleWsTicker,
        };
        const event = this.safeString (message, 'event');
        if (event === 'subscribe') {
            return;
        }
        const arg = this.safeDict (message, 'arg');
        const channelName = this.safeString (arg, 'channel');
        const method = this.safeValue (methods, channelName);
        if (method) {
            method.call (this, client, message, channelName);
        }
    }

    handleParam (params: object, optionName: string, defaultValue = undefined) {
        const value = this.safeValue (params, optionName, defaultValue);
        if (value !== undefined) {
            params = this.omit (params, optionName);
        }
        return [ value, params ];
    }

    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name blofin#watchTrades
         * @see https://docs.blofin.com/index.html#ws-trades-channel
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum amount of trades to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
         */
        await this.loadMarkets ();
        params['callerMethodName'] = 'watchTrades';
        return await this.watchTradesForSymbols ([ symbol ], since, limit, params);
    }

    async watchTradesForSymbols (symbols: string[], since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name blofin#watchTradesForSymbols
         * @see https://docs.blofin.com/index.html#ws-trades-channel
         * @description get the list of most recent trades for a list of symbols
         * @param {string[]} symbols unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum amount of trades to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
         */
        await this.loadMarkets ();
        let callerMethodName = undefined;
        [ callerMethodName, params ] = this.handleParam (params, 'callerMethodName', 'watchTradesForSymbols');
        const trades = await this.watchMultipleWrapper ('trades', callerMethodName, symbols, limit, params);
        if (this.newUpdates) {
            const first = this.safeDict (trades, 0);
            const tradeSymbol = this.safeString (first, 'symbol');
            limit = trades.getLimit (tradeSymbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleWsTrades (client: Client, message, channelName: Str) {
        const data = this.safeList (message, 'data');
        //
        //     {
        //       arg: {
        //         channel: "trades",
        //         instId: "DOGE-USDT",
        //       },
        //       data : [
        //         {
        //           instId: "DOGE-USDT",
        //           tradeId: "3373545342",
        //           price: "0.08199",
        //           size: "4",
        //           side: "buy",
        //           ts: "1707486245435",
        //         },
        //         ...
        //       ]
        //     }
        //
        if (data === undefined) {
            return;
        }
        for (let i = 0; i < data.length; i++) {
            const rawTrade = data[i];
            const trade = this.parseWsTrade (rawTrade);
            const symbol = trade['symbol'];
            let stored = this.safeValue (this.trades, symbol);
            if (stored === undefined) {
                const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
                stored = new ArrayCache (limit);
                this.trades[symbol] = stored;
            }
            stored.append (trade);
            const messageHash = channelName + ':' + symbol;
            client.resolve (stored, messageHash);
        }
    }

    parseWsTrade (trade: any, market?: MarketInterface): Trade {
        //
        //     {
        //       instId: "DOGE-USDT",
        //       tradeId: "3373545342",
        //       price: "0.08199",
        //       size: "4",
        //       side: "buy",
        //       ts: "1707486245435",
        //     }
        //
        return this.parseTrade (trade, market);
    }

    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        /**
         * @method
         * @name blofin#watchOrderBook
         * @see https://docs.blofin.com/index.html#ws-order-book-channel
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://www.bitget.com/api-doc/spot/websocket/public/Depth-Channel
         * @see https://www.bitget.com/api-doc/contract/websocket/public/Order-Book-Channel
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        params['callerMethodName'] = 'watchOrderBook';
        return await this.watchOrderBookForSymbols ([ symbol ], limit, params);
    }

    async watchOrderBookForSymbols (symbols: string[], limit: Int = undefined, params = {}): Promise<OrderBook> {
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
        await this.loadMarkets ();
        let callerMethodName = undefined;
        [ callerMethodName, params ] = this.handleParam (params, 'callerMethodName', 'watchOrderBookForSymbols');
        let channelName = undefined;
        [ channelName, params ] = this.handleOptionAndParams (params, callerMethodName, 'channel', 'books');
        // due to some problem, temporarily disable other channels
        if (channelName !== 'books') {
            throw new NotSupported (this.id + ' ' + callerMethodName + '() at this moment ' + channelName + ' is not supported, coming soon');
        }
        const orderbook = await this.watchMultipleWrapper (channelName, callerMethodName, symbols, limit, params);
        return orderbook.limit ();
    }

    handleWsOrderBook (client: Client, message, channelName: Str) {
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
        const arg = this.safeDict (message, 'arg');
        const marketId = this.safeString (arg, 'instId');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const messageHash = channelName + ':' + symbol;
        let orderbook = this.safeDict (this.orderbooks, symbol);
        if (orderbook === undefined) {
            orderbook = this.orderBook ();
        }
        const data = this.safeDict (message, 'data');
        const timestamp = this.safeInteger (data, 'ts');
        const action = this.safeString (message, 'action');
        if (action === 'snapshot') {
            const orderBookSnapshot = this.parseOrderBook (data, symbol, timestamp);
            orderBookSnapshot['nonce'] = this.safeInteger (data, 'seqId');
            orderbook.reset (orderBookSnapshot);
        } else {
            const asks = this.safeValue (data, 'asks', []);
            const bids = this.safeValue (data, 'bids', []);
            this.handleDeltasWithKeys (orderbook['asks'], asks);
            this.handleDeltasWithKeys (orderbook['bids'], bids);
            orderbook['timestamp'] = timestamp;
            orderbook['datetime'] = this.iso8601 (timestamp);
        }
        this.orderbooks[symbol] = orderbook;
        client.resolve (orderbook, messageHash);
    }

    async watchTicker (symbol: string, params = {}): Promise<Ticker> {
        /**
         * @method
         * @name blofin#watchTicker
         * @see https://docs.blofin.com/index.html#ws-tickers-channel
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        params['callerMethodName'] = 'watchTicker';
        const market = this.market (symbol);
        symbol = market['symbol'];
        const result = await this.watchTickers ([ symbol ], params);
        return result[symbol];
    }

    async watchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        /**
         * @method
         * @name blofin#watchTickers
         * @see https://docs.blofin.com/index.html#ws-tickers-channel
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
         * @param {string[]} symbols unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        let callerMethodName = undefined;
        [ callerMethodName, params ] = this.handleParam (params, 'callerMethodName', 'watchTickers');
        const ticker = await this.watchMultipleWrapper ('tickers', callerMethodName, symbols, undefined, params);
        if (this.newUpdates) {
            const tickers = {};
            tickers[ticker['symbol']] = ticker;
            return tickers;
        }
        return this.filterByArray (this.tickers, 'symbol', symbols);
    }

    handleWsTicker (client: Client, message, channelName: string) {
        //
        //     {
        //         instId: "ADA-USDT",
        //         ts: "1707736811486",
        //         last: "0.5315",
        //         lastSize: "4",
        //         askPrice: "0.5318",
        //         askSize: "248",
        //         bidPrice: "0.5315",
        //         bidSize: "63",
        //         open24h: "0.5555",
        //         high24h: "0.5563",
        //         low24h: "0.5315",
        //         volCurrency24h: "198560100",
        //         vol24h: "1985601",
        //     }
        //
        const data = this.safeList (message, 'data', []);
        for (let i = 0; i < data.length; i++) {
            const ticker = this.parseTicker (data[i]);
            const symbol = ticker['symbol'];
            const messageHash = channelName + ':' + symbol;
            this.tickers[symbol] = ticker;
            client.resolve (this.tickers[symbol], messageHash);
        }
    }

    // async watchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
    //     /**
    //      * @method
    //      * @name blofin#watchOHLCV
    //      * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
    //      * @param {string} symbol unified symbol of the market to fetch OHLCV data for
    //      * @param {string} timeframe the length of time each candle represents
    //      * @param {int} [since] timestamp in ms of the earliest candle to fetch
    //      * @param {int} [limit] the maximum amount of candles to fetch
    //      * @param {object} [params] extra parameters specific to the exchange API endpoint
    //      * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
    //      */
    //     params['callerMethodName'] = 'watchOHLCV';
    //     const market = this.market (symbol);
    //     symbol = market['symbol'];
    //     const result = await this.watchOHLCVForSymbols ([ symbol, timeframe ], since, limit, params);
    //     return result[symbol];
    // }

    async watchOHLCVForSymbols (symbolsAndTimeframes: string[][], since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name blofin#watchOHLCVForSymbols
         * @see https://docs.blofin.com/index.html#ws-candlesticks-channel
         * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string[][]} symbolsAndTimeframes array of arrays containing unified symbols and timeframes to fetch OHLCV data for, example [['BTC/USDT', '1m'], ['LTC/USDT', '5m']]
         * @param {int} [since] timestamp in ms of the earliest candle to fetch
         * @param {int} [limit] the maximum amount of candles to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        const symbolsLength = symbolsAndTimeframes.length;
        if (symbolsLength === 0 || !Array.isArray (symbolsAndTimeframes[0])) {
            throw new ArgumentsRequired (this.id + " watchOHLCVForSymbols() requires a an array of symbols and timeframes, like  [['BTC/USDT', '1m'], ['LTC/USDT', '5m']]");
        }
        await this.loadMarkets ();
        const topics = [];
        const messageHashes = [];
        for (let i = 0; i < symbolsAndTimeframes.length; i++) {
            const symbolAndTimeframe = symbolsAndTimeframes[i];
            const sym = symbolAndTimeframe[0];
            const tf = symbolAndTimeframe[1];
            const marketId = this.marketId (sym);
            const interval = this.safeString (this.timeframes, tf, tf);
            const channel = 'candle' + interval;
            const topic = {
                'channel': channel,
                'instId': marketId,
            };
            topics.push (topic);
            messageHashes.push ('multi:' + channel + ':' + sym);
        }
        const request = {
            'op': 'subscribe',
            'args': topics,
        };
        const url = this.getUrl ('candle', 'public');
        const [ symbol, timeframe, candles ] = await this.watchMultiple (url, messageHashes, request, messageHashes);
        if (this.newUpdates) {
            limit = candles.getLimit (symbol, limit);
        }
        const filtered = this.filterBySinceLimit (candles, since, limit, 0, true);
        return this.createOHLCVObject (symbol, timeframe, filtered);
    }

    handleOHLCV (client: Client, message) {
        //
        //     {
        //         "e": "kline",
        //         "E": 1579482921215,
        //         "s": "ETHBTC",
        //         "k": {
        //             "t": 1579482900000,
        //             "T": 1579482959999,
        //             "s": "ETHBTC",
        //             "i": "1m",
        //             "f": 158411535,
        //             "L": 158411550,
        //             "o": "0.01913200",
        //             "c": "0.01913500",
        //             "h": "0.01913700",
        //             "l": "0.01913200",
        //             "v": "5.08400000",
        //             "n": 16,
        //             "x": false,
        //             "q": "0.09728060",
        //             "V": "3.30200000",
        //             "Q": "0.06318500",
        //             "B": "0"
        //         }
        //     }
        //
        let event = this.safeString (message, 'e');
        const eventMap = {
            'indexPrice_kline': 'indexPriceKline',
            'markPrice_kline': 'markPriceKline',
        };
        event = this.safeString (eventMap, event, event);
        const kline = this.safeValue (message, 'k');
        let marketId = this.safeString2 (kline, 's', 'ps');
        if (event === 'indexPriceKline') {
            // indexPriceKline doesn't have the _PERP suffix
            marketId = this.safeString (message, 'ps');
        }
        const lowercaseMarketId = marketId.toLowerCase ();
        const interval = this.safeString (kline, 'i');
        // use a reverse lookup in a static map instead
        const timeframe = this.findTimeframe (interval);
        const messageHash = lowercaseMarketId + '@' + event + '_' + interval;
        const parsed = [
            this.safeInteger (kline, 't'),
            this.safeFloat (kline, 'o'),
            this.safeFloat (kline, 'h'),
            this.safeFloat (kline, 'l'),
            this.safeFloat (kline, 'c'),
            this.safeFloat (kline, 'v'),
        ];
        const isSpot = ((client.url.indexOf ('/stream') > -1) || (client.url.indexOf ('/testnet.binance') > -1));
        const marketType = (isSpot) ? 'spot' : 'contract';
        const symbol = this.safeSymbol (marketId, undefined, undefined, marketType);
        this.ohlcvs[symbol] = this.safeValue (this.ohlcvs, symbol, {});
        let stored = this.safeValue (this.ohlcvs[symbol], timeframe);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
            stored = new ArrayCacheByTimestamp (limit);
            this.ohlcvs[symbol][timeframe] = stored;
        }
        stored.append (parsed);
        client.resolve (stored, messageHash);
    }
}
