
//  ---------------------------------------------------------------------------

import { sha256 } from '@noble/hashes/sha2.js';
import blofinRest from '../blofin.js';
import { NotSupported, ArgumentsRequired, ExchangeError } from '../base/errors.js';
import { ArrayCache, ArrayCacheBySymbolById, ArrayCacheByTimestamp, ArrayCacheBySymbolBySide } from '../base/ws/Cache.js';
import type { Int, Market, Trade, OrderBook, Strings, Ticker, Tickers, OHLCV, Balances, Str, Order, Position, FundingRate, List, IndexType, Dict } from '../base/types.js';
import Client from '../base/ws/Client.js';
import type { WsOrderBook } from '../base/ws/OrderBook.js';

//  ---------------------------------------------------------------------------

export default class blofin extends blofinRest {
    override describe (): Dict {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchFundingRate': true,
                'watchFundingRates': false,
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
                'unWatchTrades': true,
                'unWatchTradesForSymbols': true,
                'unWatchOHLCV': true,
                'unWatchOHLCVForSymbols': true,
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
                'test': {
                    'ws': {
                        'swap': {
                            'public': 'wss://demo-trading-openapi.blofin.com/ws/public',
                            'private': 'wss://demo-trading-openapi.blofin.com/ws/private',
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

    override ping (client: Client) {
        return 'ping';
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
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    override async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Trade[]> {
        params['callerMethodName'] = 'watchTrades';
        return await this.watchTradesForSymbols ([ symbol ], since, limit, params);
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
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    override async watchTradesForSymbols (symbols: string[], since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Trade[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const trades = await this.watchMultipleWrapper (true, 'trades', 'watchTradesForSymbols', symbols, params);
        const firstMarket = this.safeDict (trades, 0);
        const firstSymbol = this.safeString (firstMarket, 'symbol');
        let limitResolved = limit;
        if (this.newUpdates) {
            limitResolved = trades.getLimit (firstSymbol, limit);
        }
        const result = this.filterBySinceLimit (trades, since, limitResolved, 'timestamp', true);
        return this.sortBy (result, 'timestamp'); // needed bcz of https://github.com/ccxt/ccxt/actions/runs/20755599430/job/59597237029?pr=27624#step:11:611
    }

    /**
     * @method
     * @name blofin#unWatchTrades
     * @description unWatches the list of most recent trades for a particular symbol
     * @see https://docs.blofin.com/index.html#ws-trades-channel
     * @param {string} symbol unified symbol of the market to unwatch trades for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {any} status of the unwatch request
     */
    override async unWatchTrades (symbol: string, params: Dict = {}): Promise<any> {
        params['callerMethodName'] = 'unWatchTrades';
        return await this.unWatchTradesForSymbols ([ symbol ], params);
    }

    /**
     * @method
     * @name blofin#unWatchTradesForSymbols
     * @description unWatches the list of most recent trades for a list of symbols
     * @see https://docs.blofin.com/index.html#ws-trades-channel
     * @param {string[]} symbols unified symbols of the markets to unwatch trades for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {any} status of the unwatch request
     */
    override async unWatchTradesForSymbols (symbols: string[], params: Dict = {}): Promise<any> {
        return await this.unsubscribeMultipleWrapper ('trades', 'unWatchTradesForSymbols', symbols, params);
    }

    handleTrades (client: Client, message: Dict) {
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
        const arg = this.safeDict (message, 'arg');
        const channelName = this.safeString (arg, 'channel');
        const data = this.safeList (message, 'data') as List;
        if (data === undefined) {
            return;
        }
        for (let i = 0; i < data.length; i++) {
            const rawTrade = this.safeValue (data, i);
            const trade = this.parseWsTrade (rawTrade);
            const symbol = this.safeString (trade, 'symbol', '');
            let stored = this.safeValue (this.trades, symbol);
            if (stored === undefined) {
                const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
                stored = new ArrayCache (limit);
                this.trades[symbol as IndexType] = stored;
            }
            stored.append (trade);
            if (channelName !== undefined) {
                const messageHash = channelName + ':' + symbol;
                client.resolve (stored, messageHash);
            }
        }
    }

    override parseWsTrade (trade: Dict, market: Market = undefined): Trade {
        return this.parseTrade (trade, market);
    }

    /**
     * @method
     * @name blofin#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.blofin.com/index.html#ws-order-book-channel
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
     */
    override async watchOrderBook (symbol: string, limit: Int = undefined, params: Dict = {}): Promise<OrderBook> {
        params['callerMethodName'] = 'watchOrderBook';
        return await this.watchOrderBookForSymbols ([ symbol ], limit, params);
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
     * @returns {object} an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
     */
    override async watchOrderBookForSymbols (symbols: string[], limit: Int = undefined, params: Dict = {}): Promise<OrderBook> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const [ callerMethodName, paramsCallerMethodName ] = this.handleParamString (params, 'callerMethodName', 'watchOrderBookForSymbols');
        const [ channelName, paramsChannel ] = this.handleOptionStringAndParams (paramsCallerMethodName, callerMethodName, 'channel', 'books');
        // due to some problem, temporarily disable other channels
        if (channelName !== 'books') {
            throw new NotSupported (this.id + ' ' + callerMethodName + '() at this moment ' + channelName + ' is not supported, coming soon');
        }
        const orderbook: WsOrderBook = await this.watchMultipleWrapper (true, channelName, callerMethodName, symbols, paramsChannel);
        return orderbook.limit ();
    }

    handleOrderBook (client: Client, message: Dict) {
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
        const channelName = this.safeString (arg, 'channel');
        const data = this.safeDict (message, 'data');
        const marketId = this.safeString (arg, 'instId');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        if (!(symbol in this.orderbooks)) {
            this.orderbooks[symbol] = this.orderBook ();
        }
        const orderbook = this.orderbooks[symbol];
        const timestamp = this.safeInteger (data, 'ts');
        const action = this.safeString (message, 'action');
        if (action === 'snapshot') {
            const orderBookSnapshot = this.parseOrderBook (data, symbol, timestamp);
            orderBookSnapshot['nonce'] = this.safeInteger (data, 'seqId');
            orderbook.reset (orderBookSnapshot);
        } else {
            const asks = this.safeList (data, 'asks', []);
            const bids = this.safeList (data, 'bids', []);
            this.handleDeltasWithKeys (orderbook['asks'], asks);
            this.handleDeltasWithKeys (orderbook['bids'], bids);
            orderbook['timestamp'] = timestamp;
            orderbook['datetime'] = this.iso8601 (timestamp);
        }
        this.orderbooks[symbol] = orderbook;
        if (channelName !== undefined) {
            const messageHash = channelName + ':' + symbol;
            client.resolve (orderbook, messageHash);
        }
    }

    /**
     * @method
     * @name blofin#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.blofin.com/index.html#ws-tickers-channel
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    override async watchTicker (symbol: string, params: Dict = {}): Promise<Ticker> {
        params['callerMethodName'] = 'watchTicker';
        const market = this.market (symbol);
        const symbolValue = this.safeString (market, 'symbol', '');
        const result = await this.watchTickers ([ symbolValue ], params);
        return this.safeValue (result, symbolValue);
    }

    /**
     * @method
     * @name blofin#watchTickers
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://docs.blofin.com/index.html#ws-tickers-channel
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    override async watchTickers (symbols: Strings = undefined, params: Dict = {}): Promise<Tickers> {
        if (symbols === undefined) {
            throw new NotSupported (this.id + ' watchTickers() requires a list of symbols');
        }
        const ticker = await this.watchMultipleWrapper (true, 'tickers', 'watchTickers', symbols, params);
        if (this.newUpdates) {
            const tickers: Dict = {};
            const tickerSymbol = this.safeString (ticker, 'symbol');
            if (tickerSymbol !== undefined) {
                tickers[tickerSymbol] = ticker;
            }
            return tickers;
        }
        return this.filterByArray (this.tickers, 'symbol', symbols);
    }

    handleTicker (client: Client, message: Dict) {
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
        this.handleBidAsk (client, message);
        const arg = this.safeDict (message, 'arg');
        const channelName = this.safeString (arg, 'channel');
        const data = this.safeList (message, 'data') as List;
        for (let i = 0; i < data.length; i++) {
            const ticker = this.parseWsTicker (this.safeValue (data, i));
            const symbol = this.safeString (ticker, 'symbol', '');
            this.tickers[(symbol as string)] = ticker;
            if (channelName !== undefined) {
                const messageHash = channelName + ':' + symbol;
                client.resolve (this.tickers[(symbol as string)], messageHash);
            }
        }
    }

    parseWsTicker (ticker: Dict, market: Market = undefined): Ticker {
        return this.parseTicker (ticker, market);
    }

    /**
     * @method
     * @name blofin#watchBidsAsks
     * @description watches best bid & ask for symbols
     * @see https://docs.blofin.com/index.html#ws-tickers-channel
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    override async watchBidsAsks (symbols: Strings = undefined, params: Dict = {}): Promise<Tickers> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const symbolsNormalized = this.marketSymbols (symbols, undefined, false);
        const symbolsList = symbolsNormalized as string[];
        const firstMarket = this.market (symbolsList[0]);
        const channel = 'tickers';
        const [ marketType, paramsMarketType ] = this.handleMarketTypeAndParams ('watchBidsAsks', firstMarket, params);
        const typeUrls: Dict = this.safeDict (this.urls['api']['ws'], marketType, {});
        const url = this.safeString (typeUrls, 'public');
        const messageHashes: List = [];
        const args: List = [];
        for (let i = 0; i < symbolsList.length; i++) {
            const market = this.market (symbolsList[i]);
            messageHashes.push ('bidask:' + market['symbol']);
            args.push ({
                'channel': channel,
                'instId': market['id'],
            });
        }
        const request = this.getSubscriptionRequest (args);
        const ticker = await this.watchMultiple (url, messageHashes, this.deepExtend (request, paramsMarketType), messageHashes);
        if (this.newUpdates) {
            const tickers: Dict = {};
            const tickerSymbol = this.safeString (ticker, 'symbol');
            if (tickerSymbol !== undefined) {
                tickers[tickerSymbol] = ticker;
            }
            return tickers;
        }
        return this.filterByArray (this.bidsasks, 'symbol', symbolsNormalized);
    }

    handleBidAsk (client: Client, message: Dict) {
        const data = this.safeList (message, 'data') as List;
        for (let i = 0; i < data.length; i++) {
            const ticker = this.parseWsBidAsk (this.safeValue (data, i));
            const symbol = this.safeString (ticker, 'symbol', '');
            const messageHash = 'bidask:' + symbol;
            this.bidsasks[(symbol as string)] = ticker;
            client.resolve (ticker, messageHash);
        }
    }

    parseWsBidAsk (ticker: Dict, market: Market = undefined): Ticker {
        const marketId = this.safeString (ticker, 'instId');
        const marketResolved: Market = this.safeMarket (marketId, market, '-');
        const symbol = this.safeString (marketResolved, 'symbol');
        const timestamp = this.safeInteger (ticker, 'ts');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'ask': this.safeString (ticker, 'askPrice'),
            'askVolume': this.safeString (ticker, 'askSize'),
            'bid': this.safeString (ticker, 'bidPrice'),
            'bidVolume': this.safeString (ticker, 'bidSize'),
            'info': ticker,
        }, marketResolved);
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
    override async watchOHLCV (symbol: string, timeframe: string = '1m', since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<OHLCV[]> {
        params['callerMethodName'] = 'watchOHLCV';
        const result = await this.watchOHLCVForSymbols ([ [ symbol, timeframe ] ], since, limit, params);
        const symbolResult: Dict = this.safeDict (result, symbol, {});
        return this.safeList (symbolResult, timeframe, []);
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
    override async watchOHLCVForSymbols (symbolsAndTimeframes: string[][], since: Int = undefined, limit: Int = undefined, params: Dict = {}) {
        const symbolsLength = symbolsAndTimeframes.length;
        if (symbolsLength === 0 || this.safeList (symbolsAndTimeframes, 0) === undefined) {
            throw new ArgumentsRequired (this.id + " watchOHLCVForSymbols() requires a an array of symbols and timeframes, like  [['BTC/USDT', '1m'], ['LTC/USDT', '5m']]");
        }
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const result = await this.watchMultipleWrapper (true, 'candle', 'watchOHLCVForSymbols', symbolsAndTimeframes, params);
        const symbol = this.safeString (result, 0, '');
        const timeframe = this.safeString (result, 1, '');
        const candles = this.safeValue (result, 2);
        let limitResolved = limit;
        if (this.newUpdates) {
            limitResolved = candles.getLimit (symbol, limit);
        }
        const filtered = this.filterBySinceLimit (candles, since, limitResolved, 0, true);
        return this.createOHLCVObject (symbol, timeframe, filtered);
    }

    /**
     * @method
     * @name blofin#unWatchOHLCV
     * @description unWatches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://docs.blofin.com/index.html#ws-candlesticks-channel
     * @param {string} symbol unified symbol of the market to unwatch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {any} status of the unwatch request
     */
    override async unWatchOHLCV (symbol: string, timeframe: string = '1m', params: Dict = {}): Promise<any> {
        params['callerMethodName'] = 'unWatchOHLCV';
        return await this.unWatchOHLCVForSymbols ([ [ symbol, timeframe ] ], params);
    }

    /**
     * @method
     * @name blofin#unWatchOHLCVForSymbols
     * @description unWatches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://docs.blofin.com/index.html#ws-candlesticks-channel
     * @param {string[][]} symbolsAndTimeframes array of arrays containing unified symbols and timeframes to unwatch OHLCV data for, example [['BTC/USDT', '1m'], ['LTC/USDT', '5m']]
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {any} status of the unwatch request
     */
    override async unWatchOHLCVForSymbols (symbolsAndTimeframes: string[][], params: Dict = {}): Promise<any> {
        const symbolsLength = symbolsAndTimeframes.length;
        if (symbolsLength === 0 || !Array.isArray (symbolsAndTimeframes[0])) {
            throw new ArgumentsRequired (this.id + " unWatchOHLCVForSymbols() requires a an array of symbols and timeframes, like  [['BTC/USDT', '1m'], ['LTC/USDT', '5m']]");
        }
        return await this.unsubscribeMultipleWrapper ('candle', 'unWatchOHLCVForSymbols', symbolsAndTimeframes, params);
    }

    handleOHLCV (client: Client, message: Dict) {
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
        const arg = this.safeDict (message, 'arg');
        const channelName = this.safeString (arg, 'channel');
        const data = this.safeList (message, 'data') as List;
        const marketId = this.safeString (arg, 'instId');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const interval = (channelName as string).replace ('candle', '');
        const unifiedTimeframe = this.findTimeframe (interval);
        this.ohlcvs[symbol] = this.safeDict (this.ohlcvs, symbol, {});
        let stored = this.safeValue (this.ohlcvs[symbol], unifiedTimeframe);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
            stored = new ArrayCacheByTimestamp (limit);
            this.ohlcvs[symbol][unifiedTimeframe as IndexType] = stored;
        }
        for (let i = 0; i < data.length; i++) {
            const candle = this.safeValue (data, i);
            const parsed = this.parseOHLCV (candle, market);
            stored.append (parsed);
        }
        const resolveData = [ symbol, unifiedTimeframe, stored ];
        const messageHash = 'candle' + interval + ':' + symbol;
        client.resolve (resolveData, messageHash);
    }

    /**
     * @method
     * @name blofin#watchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://docs.blofin.com/index.html#ws-account-channel
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    override async watchBalance (params: Dict = {}): Promise<Balances> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        await this.authenticate ();
        const [ marketType, paramsMarketType ] = this.handleMarketTypeAndParams ('watchBalance', undefined, params);
        if (marketType === 'spot') {
            throw new NotSupported (this.id + ' watchBalance() is not supported for spot markets yet');
        }
        const messageHash = marketType + ':balance';
        const sub: Dict = {
            'channel': 'account',
        };
        const request = this.getSubscriptionRequest ([ sub ]);
        const typeUrls: Dict = this.safeDict (this.urls['api']['ws'], marketType, {});
        const url = this.safeString (typeUrls, 'private');
        return await this.watch (url, messageHash, this.deepExtend (request, paramsMarketType), messageHash);
    }

    handleBalance (client: Client, message: Dict) {
        //
        //     {
        //         arg: {
        //           channel: "account",
        //         },
        //         data: <same object as shown in REST example>,
        //     }
        //
        const marketType = 'swap'; // for now
        // merge the parsed update into the existing balance object instead of
        // replacing it: a consumer awakened by an earlier message holds a
        // reference to this.balance[marketType], and Client.resolve is a no-op
        // while nobody is awaiting, so a replaced object would make updates
        // landing in that window invisible to the consumer forever (same class
        // as issue #26773); the free/used/total aggregates are rebuilt from
        // the merged currencies by safeBalance
        this.balance[marketType] = this.safeDict (this.balance, marketType, {});
        const parsed = this.parseWsBalance (message);
        const reserved = [ 'free', 'used', 'total' ];
        const keys = Object.keys (parsed);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (this.inArray (key, reserved)) {
                continue;
            }
            this.balance[marketType][key] = parsed[key];
        }
        this.balance[marketType] = this.safeBalance (this.balance[marketType]);
        const messageHash = marketType + ':balance';
        client.resolve (this.balance[marketType], messageHash);
    }

    parseWsBalance (message: Dict): Balances {
        return this.parseBalance (message);
    }

    /**
     * @method
     * @name biofin#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://docs.blofin.com/index.html#ws-order-channel
     * @see https://docs.blofin.com/index.html#ws-algo-orders-channel
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] set to true for trigger orders
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure
     */
    override async watchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Order[]> {
        params['callerMethodName'] = 'watchOrders';
        const symbolsArray = (symbol !== undefined) ? [ symbol ] : [];
        return await this.watchOrdersForSymbols (symbolsArray, since, limit, params);
    }

    /**
     * @method
     * @name blofin#watchOrdersForSymbols
     * @description watches information on multiple orders made by the user across multiple symbols
     * @see https://docs.blofin.com/index.html#ws-order-channel
     * @see https://docs.blofin.com/index.html#ws-algo-orders-channel
     * @param {string[]} symbols
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] set to true for trigger orders
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure
     */
    override async watchOrdersForSymbols (symbols: string[], since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Order[]> {
        await this.authenticate ();
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const trigger = this.safeBool2 (params, 'stop', 'trigger');
        const paramsOmitted: Dict = this.omit (params, [ 'stop', 'trigger' ]);
        let channel: Str = 'orders';
        if (trigger === true) {
            channel = 'orders-algo';
        }
        const orders = await this.watchMultipleWrapper (false, channel, 'watchOrdersForSymbols', symbols, paramsOmitted);
        const first = this.safeDict (orders, 0);
        const tradeSymbol = this.safeString (first, 'symbol');
        let limitResolved = limit;
        if (this.newUpdates) {
            limitResolved = orders.getLimit (tradeSymbol, limit);
        }
        return this.filterBySinceLimit (orders, since, limitResolved, 'timestamp', true);
    }

    handleOrders (client: Client, message: Dict) {
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
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            this.orders = new ArrayCacheBySymbolById (limit);
        }
        const orders = this.orders;
        const arg = this.safeDict (message, 'arg');
        const channelName = this.safeString (arg, 'channel');
        const data = this.safeList (message, 'data') as List;
        for (let i = 0; i < data.length; i++) {
            const order = this.parseWsOrder (this.safeValue (data, i));
            orders.append (order);
            if (channelName !== undefined) {
                client.resolve (orders, channelName + ':' + this.safeString (order, 'symbol', ''));
            }
            client.resolve (orders, channelName);
        }
    }

    override parseWsOrder (order: Dict, market: Market = undefined): Order {
        return this.parseOrder (order, market);
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
    override async watchPositions (symbols: Strings = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Position[]> {
        await this.authenticate ();
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const newPositions = await this.watchMultipleWrapper (false, 'positions', 'watchPositions', symbols, params);
        if (this.newUpdates) {
            return newPositions;
        }
        return this.filterBySymbolsSinceLimit (this.positions, symbols, since, limit);
    }

    handlePositions (client: Client, message: Dict) {
        //
        //     {
        //         arg: { channel: 'positions' },
        //         data: [
        //           <same object as shown in REST example>
        //         ]
        //     }
        //
        if (this.positions === undefined) {
            this.positions = new ArrayCacheBySymbolBySide ();
        }
        const cache: ArrayCacheBySymbolBySide = this.positions;
        const arg = this.safeDict (message, 'arg');
        const channelName = this.safeString (arg, 'channel');
        const data = this.safeList (message, 'data') as List;
        const newPositions: List = [];
        for (let i = 0; i < data.length; i++) {
            const position = this.parseWsPosition (this.safeValue (data, i));
            newPositions.push (position);
            cache.append (position);
            if (channelName !== undefined) {
                client.resolve (position, channelName + ':' + this.safeString (position, 'symbol', ''));
            }
        }
    }

    parseWsPosition (position: Dict, market: Market = undefined): Position {
        return this.parsePosition (position, market);
    }

    /**
     * @method
     * @name blofin#watchFundingRate
     * @description watch the current funding rate
     * @see https://docs.blofin.com/index.html#ws-funding-rate-channel
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/?id=funding-rate-structure}
     */
    override async watchFundingRate (symbol: string, params: Dict = {}): Promise<FundingRate> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        const [ marketType, paramsMarketType ] = this.handleMarketTypeAndParams ('watchFundingRate', market, params);
        const messageHash = 'fundingRate:' + market['symbol'];
        const requestParams: Dict = {
            'channel': 'funding-rate',
            'instId': market['id'],
        };
        const request = this.getSubscriptionRequest ([ requestParams ]);
        const typeUrls: Dict = this.safeDict (this.urls['api']['ws'], marketType, {});
        const url = this.safeString (typeUrls, 'public');
        return await this.watch (url, messageHash, this.deepExtend (request, paramsMarketType), messageHash);
    }

    handleFundingRate (client: Client, message: Dict) {
        //
        //     {
        //         "arg": {
        //             "channel": "funding-rate",
        //             "instId": "BTC-USDT"
        //         },
        //         "data": [
        //             {
        //                 "instId": "BTC-USDT",
        //                 "fundingRate": "0.00007873240488719234",
        //                 "fundingTime": "1771430400000"
        //             }
        //         ]
        //     }
        //
        const data = this.safeList (message, 'data', []);
        const first = this.safeDict (data, 0, {});
        const fundingRate = this.parseFundingRate (first);
        const symbol = this.safeString (fundingRate, 'symbol', '');
        this.fundingRates[(symbol as string)] = fundingRate;
        const messageHash = 'fundingRate:' + symbol;
        client.resolve (fundingRate, messageHash);
    }

    async watchMultipleWrapper (isPublic: boolean, channelName: string, callerMethodName: string, symbolsArray: any = undefined, params: Dict = {}) {
        // underlier method for all watch-multiple symbols
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const [ callerMethodNameOption, paramsCallerMethodName ] = this.handleParamString (params, 'callerMethodName', callerMethodName);
        // if OHLCV method are being called, then symbols would be symbolsAndTimeframes (multi-dimensional) array
        const isOHLCV = (channelName === 'candle');
        const symbolsRaw = isOHLCV ? this.getListFromObjectValues (symbolsArray, 0) : symbolsArray;
        const symbols = this.marketSymbols (symbolsRaw, undefined, true, true);
        let firstMarket: Market = undefined;
        const firstSymbol = this.safeString (symbols, 0);
        if (firstSymbol !== undefined) {
            firstMarket = this.market (firstSymbol);
        }
        const [ marketType, paramsMarketType ] = this.handleMarketTypeAndParams (callerMethodNameOption, firstMarket, paramsCallerMethodName);
        if (marketType !== 'swap') {
            throw new NotSupported (this.id + ' ' + callerMethodNameOption + '() does not support ' + marketType + ' markets yet');
        }
        let rawSubscriptions: List = [];
        const messageHashes: List = [];
        if ((symbols !== undefined) && (symbols.length > 0)) {
            for (let i = 0; i < symbols.length; i++) {
                const current = symbols[i];
                let market: Market = undefined;
                let channel = channelName;
                if (isOHLCV) {
                    market = this.market (current);
                    const tf = this.safeString (this.safeValue (symbolsArray, i), 1);
                    const interval = this.safeString (this.timeframes, tf, tf);
                    channel = channel + interval;
                } else {
                    market = this.market (current);
                }
                const topic: Dict = {
                    'channel': channel,
                    'instId': market['id'],
                };
                rawSubscriptions.push (topic);
                messageHashes.push (channel + ':' + this.safeString (market, 'symbol', ''));
            }
        } else {
            rawSubscriptions.push ({ 'channel': channelName });
            messageHashes.push (channelName);
        }
        // private channel are difference, they only need plural channel name for multiple symbols
        if (this.inArray (channelName, [ 'orders', 'orders-algo', 'positions' ])) {
            rawSubscriptions = [ { 'channel': channelName } ];
        }
        const request = this.getSubscriptionRequest (rawSubscriptions);
        let privateOrPublic: Str = 'private';
        if (isPublic === true) {
            privateOrPublic = 'public';
        }
        const typeUrls: Dict = this.safeDict (this.urls['api']['ws'], marketType, {});
        const url = this.safeString (typeUrls, privateOrPublic);
        return await this.watchMultiple (url, messageHashes, this.deepExtend (request, paramsMarketType), messageHashes);
    }

    async unsubscribeMultipleWrapper (channelName: string, callerMethodName: string, symbolsArray: any, params: Dict = {}): Promise<any> {
        // underlier method for the public unWatch* methods, sends the same topics as watchMultipleWrapper
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const [ callerMethodNameOption, paramsCallerMethodName ] = this.handleParamString (params, 'callerMethodName', callerMethodName);
        const isOHLCV = (channelName === 'candle');
        let symbols: string[] = [];
        if (isOHLCV) {
            symbols = this.marketSymbols (this.getListFromObjectValues (symbolsArray, 0), undefined, false, true);
        } else {
            symbols = this.marketSymbols (symbolsArray, undefined, false, true);
        }
        const firstMarket = this.market (this.safeString (symbols, 0));
        const [ marketType, paramsMarketType ] = this.handleMarketTypeAndParams (callerMethodNameOption, firstMarket, paramsCallerMethodName);
        if (marketType !== 'swap') {
            throw new NotSupported (this.id + ' ' + callerMethodNameOption + '() does not support ' + marketType + ' markets yet');
        }
        const topics: List = [];
        const messageHashes: List = [];
        for (let i = 0; i < symbols.length; i++) {
            const market = this.market (this.safeString (symbols, i));
            let channel = channelName;
            if (isOHLCV) {
                const tfArray = symbolsArray[i];
                const tf = tfArray[1];
                const interval = this.safeString (this.timeframes, tf, tf);
                channel += interval;
            }
            const topic: Dict = {
                'channel': channel,
                'instId': market['id'],
            };
            topics.push (topic);
            messageHashes.push ('unsubscribe:' + channel + ':' + market['symbol']);
        }
        const request: Dict = {
            'op': 'unsubscribe',
            'args': topics,
        };
        const url = (this.urls['api'])['ws'][marketType]['public'];
        return await this.watchMultiple (url, messageHashes, this.deepExtend (request, paramsMarketType), messageHashes);
    }

    handleUnsubscription (client: Client, message: Dict) {
        //
        //     {
        //         "event": "unsubscribe",
        //         "arg": {
        //             "channel": "candle1m",
        //             "instId": "BTC-USDT"
        //         }
        //     }
        //
        const arg = this.safeDict (message, 'arg', {});
        const channel = this.safeString (arg, 'channel', '');
        const marketId = this.safeString (arg, 'instId');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const subMessageHash = channel + ':' + symbol;
        if (channel === 'trades') {
            this.cleanCache ({ 'topic': 'trades', 'symbols': [ symbol ] });
            this.cleanUnsubscription (client, subMessageHash, 'unsubscribe:' + subMessageHash);
        } else if (channel.startsWith ('candle')) {
            const timeframe = this.findTimeframe (channel.replace ('candle', ''));
            if (timeframe !== undefined) {
                this.cleanCache ({ 'topic': 'ohlcv', 'symbolsAndTimeframes': [ [ symbol, timeframe ] ] });
            }
            this.cleanUnsubscription (client, subMessageHash, 'unsubscribe:' + subMessageHash);
        }
    }

    getSubscriptionRequest (args: List): Dict {
        return {
            'op': 'subscribe',
            'args': args,
        };
    }

    override handleTextMessage (client: Client, message: string) {
        if (message === 'pong') {
            client.lastPong = this.milliseconds ();
        }
    }

    override handleMessage (client: Client, message: Dict) {
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
            'trades': this.handleTrades,
            'books': this.handleOrderBook,
            'tickers': this.handleTicker,
            'candle': this.handleOHLCV, // candle1m, candle5m, etc
            // private
            'account': this.handleBalance,
            'orders': this.handleOrders,
            'orders-algo': this.handleOrders,
            'positions': this.handlePositions,
            'funding-rate': this.handleFundingRate,
        };
        let method: any = undefined;
        const event = this.safeString (message, 'event');
        if (event === 'subscribe') {
            return;
        } else if (event === 'unsubscribe') {
            this.handleUnsubscription (client, message);
            return;
        } else if (event === 'login') {
            const future = this.safeValue (client.futures, 'authenticate_hash');
            future.resolve (true);
            return;
        } else if (event === 'error') {
            throw new ExchangeError (this.id + ' error: ' + this.json (message));
        }
        const arg = this.safeDict (message, 'arg');
        const channelName = this.safeString (arg, 'channel');
        method = this.safeValue (methods, channelName);
        if ((method === undefined) && ((channelName as string).indexOf ('candle') >= 0)) {
            method = methods['candle'];
        }
        if (method !== undefined) {
            method.call (this, client, message);
        }
    }

    async authenticate (params: Dict = {}) {
        this.checkRequiredCredentials ();
        const milliseconds = this.milliseconds ();
        const messageHash = 'authenticate_hash';
        const timestamp = milliseconds.toString ();
        const nonce = 'n_' + timestamp;
        const auth = '/users/self/verify' + 'GET' + timestamp + '' + nonce;
        const signature = this.stringToBase64 (this.hmac (this.encode (auth), this.encode (this.secret), sha256));
        const request: Dict = {
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
        const typeUrls: Dict = this.safeDict (this.urls['api']['ws'], marketType, {});
        const url = this.safeString (typeUrls, 'private');
        await this.watch (url, messageHash, this.deepExtend (request, params), messageHash);
    }
}
