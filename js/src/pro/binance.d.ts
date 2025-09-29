import binanceRest from '../binance.js';
import type { Int, OrderSide, OrderType, Str, Strings, Trade, OrderBook, Order, Ticker, Tickers, OHLCV, Position, Balances, Num, Dict, Liquidation } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class binance extends binanceRest {
    describe(): any;
    describeData(): {
        has: {
            ws: boolean;
            watchBalance: boolean;
            watchLiquidations: boolean;
            watchLiquidationsForSymbols: boolean;
            watchMyLiquidations: boolean;
            watchMyLiquidationsForSymbols: boolean;
            watchBidsAsks: boolean;
            watchMyTrades: boolean;
            watchOHLCV: boolean;
            watchOHLCVForSymbols: boolean;
            watchOrderBook: boolean;
            watchOrderBookForSymbols: boolean;
            watchOrders: boolean;
            watchOrdersForSymbols: boolean;
            watchPositions: boolean;
            watchTicker: boolean;
            watchTickers: boolean;
            watchMarkPrices: boolean;
            watchMarkPrice: boolean;
            watchTrades: boolean;
            watchTradesForSymbols: boolean;
            createOrderWs: boolean;
            editOrderWs: boolean;
            cancelOrderWs: boolean;
            cancelOrdersWs: boolean;
            cancelAllOrdersWs: boolean;
            fetchBalanceWs: boolean;
            fetchDepositsWs: boolean;
            fetchMarketsWs: boolean;
            fetchMyTradesWs: boolean;
            fetchOHLCVWs: boolean;
            fetchOrderBookWs: boolean;
            fetchOpenOrdersWs: boolean;
            fetchOrderWs: boolean;
            fetchOrdersWs: boolean;
            fetchPositionWs: boolean;
            fetchPositionForSymbolWs: boolean;
            fetchPositionsWs: boolean;
            fetchTickerWs: boolean;
            fetchTradesWs: boolean;
            fetchTradingFeesWs: boolean;
            fetchWithdrawalsWs: boolean;
        };
        urls: {
            test: {
                ws: {
                    spot: string;
                    margin: string;
                    future: string;
                    delivery: string;
                    'ws-api': {
                        spot: string;
                        future: string;
                        delivery: string;
                    };
                };
            };
            demo: {
                ws: {
                    spot: string;
                    margin: string;
                    future: string;
                    delivery: string;
                    'ws-api': {
                        spot: string;
                        future: string;
                        delivery: string;
                    };
                };
            };
            api: {
                ws: {
                    spot: string;
                    margin: string;
                    future: string;
                    delivery: string;
                    'ws-api': {
                        spot: string;
                        future: string;
                        delivery: string;
                    };
                    papi: string;
                };
            };
            doc: string;
        };
        streaming: {
            keepAlive: number;
        };
        options: {
            returnRateLimits: boolean;
            streamLimits: {
                spot: number;
                margin: number;
                future: number;
                delivery: number;
            };
            subscriptionLimitByStream: {
                spot: number;
                margin: number;
                future: number;
                delivery: number;
            };
            streamBySubscriptionsHash: {};
            streamIndex: number;
            watchOrderBookRate: number;
            liquidationsLimit: number;
            myLiquidationsLimit: number;
            tradesLimit: number;
            ordersLimit: number;
            OHLCVLimit: number;
            requestId: {};
            watchOrderBookLimit: number;
            watchTrades: {
                name: string;
            };
            watchTicker: {
                name: string;
            };
            watchTickers: {
                name: string;
            };
            watchOHLCV: {
                name: string;
            };
            watchOrderBook: {
                maxRetries: number;
                checksum: boolean;
            };
            watchBalance: {
                fetchBalanceSnapshot: boolean;
                awaitBalanceSnapshot: boolean;
            };
            watchLiquidationsForSymbols: {
                defaultType: string;
            };
            watchPositions: {
                fetchPositionsSnapshot: boolean;
                awaitPositionsSnapshot: boolean;
            };
            wallet: string;
            listenKeyRefreshRate: number;
            ws: {
                cost: number;
            };
            tickerChannelsMap: {
                '24hrTicker': string;
                '24hrMiniTicker': string;
                markPriceUpdate: string;
                '1hTicker': string;
                '4hTicker': string;
                '1dTicker': string;
                bookTicker: string;
            };
        };
    };
    requestId(url: any): any;
    isSpotUrl(client: Client): boolean;
    stream(type: Str, subscriptionHash: Str, numSubscriptions?: number): string;
    /**
     * @method
     * @name binance#watchLiquidations
     * @description watch the public liquidations of a trading pair
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/websocket-market-streams/Liquidation-Order-Streams
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/websocket-market-streams/Liquidation-Order-Streams
     * @param {string} symbol unified CCXT market symbol
     * @param {int} [since] the earliest time in ms to fetch liquidations for
     * @param {int} [limit] the maximum number of liquidation structures to retrieve
     * @param {object} [params] exchange specific parameters for the bitmex api endpoint
     * @returns {object} an array of [liquidation structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#liquidation-structure}
     */
    watchLiquidations(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Liquidation[]>;
    /**
     * @method
     * @name binance#watchLiquidationsForSymbols
     * @description watch the public liquidations of a trading pair
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/websocket-market-streams/All-Market-Liquidation-Order-Streams
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/websocket-market-streams/All-Market-Liquidation-Order-Streams
     * @param {string[]} symbols list of unified market symbols
     * @param {int} [since] the earliest time in ms to fetch liquidations for
     * @param {int} [limit] the maximum number of liquidation structures to retrieve
     * @param {object} [params] exchange specific parameters for the bitmex api endpoint
     * @returns {object} an array of [liquidation structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#liquidation-structure}
     */
    watchLiquidationsForSymbols(symbols: string[], since?: Int, limit?: Int, params?: {}): Promise<Liquidation[]>;
    handleLiquidation(client: Client, message: any): void;
    parseWsLiquidation(liquidation: any, market?: any): Liquidation;
    /**
     * @method
     * @name binance#watchMyLiquidations
     * @description watch the private liquidations of a trading pair
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/user-data-streams/Event-Order-Update
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/user-data-streams/Event-Order-Update
     * @param {string} symbol unified CCXT market symbol
     * @param {int} [since] the earliest time in ms to fetch liquidations for
     * @param {int} [limit] the maximum number of liquidation structures to retrieve
     * @param {object} [params] exchange specific parameters for the bitmex api endpoint
     * @returns {object} an array of [liquidation structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#liquidation-structure}
     */
    watchMyLiquidations(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Liquidation[]>;
    /**
     * @method
     * @name binance#watchMyLiquidationsForSymbols
     * @description watch the private liquidations of a trading pair
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/user-data-streams/Event-Order-Update
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/user-data-streams/Event-Order-Update
     * @param {string[]} symbols list of unified market symbols
     * @param {int} [since] the earliest time in ms to fetch liquidations for
     * @param {int} [limit] the maximum number of liquidation structures to retrieve
     * @param {object} [params] exchange specific parameters for the bitmex api endpoint
     * @returns {object} an array of [liquidation structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#liquidation-structure}
     */
    watchMyLiquidationsForSymbols(symbols: string[], since?: Int, limit?: Int, params?: {}): Promise<Liquidation[]>;
    handleMyLiquidation(client: Client, message: any): void;
    /**
     * @method
     * @name binance#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://developers.binance.com/docs/binance-spot-api-docs/web-socket-streams#partial-book-depth-streams
     * @see https://developers.binance.com/docs/binance-spot-api-docs/web-socket-streams#diff-depth-stream
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/websocket-market-streams/Partial-Book-Depth-Streams
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/websocket-market-streams/Diff-Book-Depth-Streams
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/websocket-market-streams/Partial-Book-Depth-Streams
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/websocket-market-streams/Diff-Book-Depth-Streams
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name binance#watchOrderBookForSymbols
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://developers.binance.com/docs/binance-spot-api-docs/web-socket-streams#partial-book-depth-streams
     * @see https://developers.binance.com/docs/binance-spot-api-docs/web-socket-streams#diff-depth-stream
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/websocket-market-streams/Partial-Book-Depth-Streams
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/websocket-market-streams/Diff-Book-Depth-Streams
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/websocket-market-streams/Partial-Book-Depth-Streams
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/websocket-market-streams/Diff-Book-Depth-Streams
     * @param {string[]} symbols unified array of symbols
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    watchOrderBookForSymbols(symbols: string[], limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name binance#unWatchOrderBookForSymbols
     * @description unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://developers.binance.com/docs/binance-spot-api-docs/web-socket-streams#partial-book-depth-streams
     * @see https://developers.binance.com/docs/binance-spot-api-docs/web-socket-streams#diff-depth-stream
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/websocket-market-streams/Partial-Book-Depth-Streams
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/websocket-market-streams/Diff-Book-Depth-Streams
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/websocket-market-streams/Partial-Book-Depth-Streams
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/websocket-market-streams/Diff-Book-Depth-Streams
     * @param {string[]} symbols unified array of symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    unWatchOrderBookForSymbols(symbols: string[], params?: {}): Promise<any>;
    /**
     * @method
     * @name binance#unWatchOrderBook
     * @description unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://developers.binance.com/docs/binance-spot-api-docs/web-socket-streams#partial-book-depth-streams
     * @see https://developers.binance.com/docs/binance-spot-api-docs/web-socket-streams#diff-depth-stream
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/websocket-market-streams/Partial-Book-Depth-Streams
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/websocket-market-streams/Diff-Book-Depth-Streams
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/websocket-market-streams/Partial-Book-Depth-Streams
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/websocket-market-streams/Diff-Book-Depth-Streams
     * @param {string} symbol unified array of symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    unWatchOrderBook(symbol: string, params?: {}): Promise<any>;
    /**
     * @method
     * @name binance#fetchOrderBookWs
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://developers.binance.com/docs/binance-spot-api-docs/websocket-api/market-data-requests#order-book
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/websocket-api/Order-Book
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    fetchOrderBookWs(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    handleFetchOrderBook(client: Client, message: any): void;
    fetchOrderBookSnapshot(client: any, message: any, subscription: any): Promise<void>;
    handleDelta(bookside: any, delta: any): void;
    handleDeltas(bookside: any, deltas: any): void;
    handleOrderBookMessage(client: Client, message: any, orderbook: any): any;
    handleOrderBook(client: Client, message: any): void;
    handleOrderBookSubscription(client: Client, message: any, subscription: any): void;
    handleSubscriptionStatus(client: Client, message: any): any;
    handleUnSubscription(client: Client, subscription: Dict): void;
    /**
     * @method
     * @name binance#watchTradesForSymbols
     * @description get the list of most recent trades for a list of symbols
     * @see https://developers.binance.com/docs/binance-spot-api-docs/websocket-api/market-data-requests#aggregate-trades
     * @see https://developers.binance.com/docs/binance-spot-api-docs/websocket-api/market-data-requests#recent-trades
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/websocket-market-streams/Aggregate-Trade-Streams
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/websocket-market-streams/Aggregate-Trade-Streams
     * @param {string[]} symbols unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.name] the name of the method to call, 'trade' or 'aggTrade', default is 'trade'
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    watchTradesForSymbols(symbols: string[], since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name binance#unWatchTradesForSymbols
     * @description unsubscribes from the trades channel
     * @see https://developers.binance.com/docs/binance-spot-api-docs/websocket-api/market-data-requests#aggregate-trades
     * @see https://developers.binance.com/docs/binance-spot-api-docs/websocket-api/market-data-requests#recent-trades
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/websocket-market-streams/Aggregate-Trade-Streams
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/websocket-market-streams/Aggregate-Trade-Streams
     * @param {string[]} symbols unified symbol of the market to fetch trades for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.name] the name of the method to call, 'trade' or 'aggTrade', default is 'trade'
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    unWatchTradesForSymbols(symbols: string[], params?: {}): Promise<any>;
    /**
     * @method
     * @name binance#unWatchTrades
     * @description unsubscribes from the trades channel
     * @see https://developers.binance.com/docs/binance-spot-api-docs/websocket-api/market-data-requests#aggregate-trades
     * @see https://developers.binance.com/docs/binance-spot-api-docs/websocket-api/market-data-requests#recent-trades
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/websocket-market-streams/Aggregate-Trade-Streams
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/websocket-market-streams/Aggregate-Trade-Streams
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.name] the name of the method to call, 'trade' or 'aggTrade', default is 'trade'
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    unWatchTrades(symbol: string, params?: {}): Promise<any>;
    /**
     * @method
     * @name binance#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://developers.binance.com/docs/binance-spot-api-docs/websocket-api/market-data-requests#aggregate-trades
     * @see https://developers.binance.com/docs/binance-spot-api-docs/websocket-api/market-data-requests#recent-trades
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/websocket-market-streams/Aggregate-Trade-Streams
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/websocket-market-streams/Aggregate-Trade-Streams
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.name] the name of the method to call, 'trade' or 'aggTrade', default is 'trade'
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseWsTrade(trade: any, market?: any): Trade;
    handleTrade(client: Client, message: any): void;
    /**
     * @method
     * @name binance#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://developers.binance.com/docs/binance-spot-api-docs/websocket-api/market-data-requests#klines
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/websocket-market-streams/Kline-Candlestick-Streams
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/websocket-market-streams/Kline-Candlestick-Streams
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {object} [params.timezone] if provided, kline intervals are interpreted in that timezone instead of UTC, example '+08:00'
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    /**
     * @method
     * @name binance#watchOHLCVForSymbols
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://developers.binance.com/docs/binance-spot-api-docs/websocket-api/market-data-requests#klines
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/websocket-market-streams/Kline-Candlestick-Streams
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/websocket-market-streams/Kline-Candlestick-Streams
     * @param {string[][]} symbolsAndTimeframes array of arrays containing unified symbols and timeframes to fetch OHLCV data for, example [['BTC/USDT', '1m'], ['LTC/USDT', '5m']]
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {object} [params.timezone] if provided, kline intervals are interpreted in that timezone instead of UTC, example '+08:00'
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    watchOHLCVForSymbols(symbolsAndTimeframes: string[][], since?: Int, limit?: Int, params?: {}): Promise<import("../base/types.js").Dictionary<import("../base/types.js").Dictionary<OHLCV[]>>>;
    /**
     * @method
     * @name binance#unWatchOHLCVForSymbols
     * @description unWatches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://developers.binance.com/docs/binance-spot-api-docs/websocket-api/market-data-requests#klines
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/websocket-market-streams/Kline-Candlestick-Streams
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/websocket-market-streams/Kline-Candlestick-Streams
     * @param {string[][]} symbolsAndTimeframes array of arrays containing unified symbols and timeframes to fetch OHLCV data for, example [['BTC/USDT', '1m'], ['LTC/USDT', '5m']]
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {object} [params.timezone] if provided, kline intervals are interpreted in that timezone instead of UTC, example '+08:00'
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    unWatchOHLCVForSymbols(symbolsAndTimeframes: string[][], params?: {}): Promise<any>;
    /**
     * @method
     * @name binance#unWatchOHLCV
     * @description unWatches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://developers.binance.com/docs/binance-spot-api-docs/websocket-api/market-data-requests#klines
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/websocket-market-streams/Kline-Candlestick-Streams
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/websocket-market-streams/Kline-Candlestick-Streams
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {object} [params.timezone] if provided, kline intervals are interpreted in that timezone instead of UTC, example '+08:00'
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    unWatchOHLCV(symbol: string, timeframe?: string, params?: {}): Promise<any>;
    handleOHLCV(client: Client, message: any): void;
    /**
     * @method
     * @name binance#fetchTickerWs
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.method] method to use can be ticker.price or ticker.book
     * @param {boolean} [params.returnRateLimits] return the rate limits for the exchange
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTickerWs(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name binance#fetchOHLCVWs
     * @description query historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://developers.binance.com/docs/binance-spot-api-docs/websocket-api/market-data-requests#klines
     * @param {string} symbol unified symbol of the market to query OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} since timestamp in ms of the earliest candle to fetch
     * @param {int} limit the maximum amount of candles to fetch
     * @param {object} params extra parameters specific to the exchange API endpoint
     * @param {int} params.until timestamp in ms of the earliest candle to fetch
     *
     * EXCHANGE SPECIFIC PARAMETERS
     * @param {string} params.timeZone default=0 (UTC)
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCVWs(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    handleFetchOHLCV(client: Client, message: any): void;
    /**
     * @method
     * @name binance#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://developers.binance.com/docs/binance-spot-api-docs/web-socket-streams#individual-symbol-mini-ticker-stream
     * @see https://developers.binance.com/docs/binance-spot-api-docs/web-socket-streams#all-market-mini-tickers-stream
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/websocket-market-streams/Individual-Symbol-Ticker-Streams
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/websocket-market-streams/All-Market-Mini-Tickers-Stream
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/websocket-market-streams/All-Market-Mini-Tickers-Stream
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/websocket-market-streams/Individual-Symbol-Ticker-Streams
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.name] stream to use can be ticker or miniTicker
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name binance#watchMarkPrice
     * @description watches a mark price for a specific market
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/websocket-market-streams/Mark-Price-Stream
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.use1sFreq] *default is true* if set to true, the mark price will be updated every second, otherwise every 3 seconds
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchMarkPrice(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name binance#watchMarkPrices
     * @description watches the mark price for all markets
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/websocket-market-streams/Mark-Price-Stream-for-All-market
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.use1sFreq] *default is true* if set to true, the mark price will be updated every second, otherwise every 3 seconds
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchMarkPrices(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name binance#watchTickers
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://developers.binance.com/docs/binance-spot-api-docs/web-socket-streams#individual-symbol-mini-ticker-stream
     * @see https://developers.binance.com/docs/binance-spot-api-docs/web-socket-streams#all-market-mini-tickers-stream
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/websocket-market-streams/Individual-Symbol-Ticker-Streams
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/websocket-market-streams/All-Market-Mini-Tickers-Stream
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/websocket-market-streams/All-Market-Mini-Tickers-Stream
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/websocket-market-streams/Individual-Symbol-Ticker-Streams
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name binance#unWatchTickers
     * @description unWatches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://developers.binance.com/docs/binance-spot-api-docs/web-socket-streams#individual-symbol-mini-ticker-stream
     * @see https://developers.binance.com/docs/binance-spot-api-docs/web-socket-streams#all-market-mini-tickers-stream
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/websocket-market-streams/Individual-Symbol-Ticker-Streams
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/websocket-market-streams/All-Market-Mini-Tickers-Stream
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/websocket-market-streams/All-Market-Mini-Tickers-Stream
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/websocket-market-streams/Individual-Symbol-Ticker-Streams
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    unWatchTickers(symbols?: Strings, params?: {}): Promise<any>;
    /**
     * @method
     * @name binance#unWatchTicker
     * @description unWatches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://developers.binance.com/docs/binance-spot-api-docs/web-socket-streams#individual-symbol-mini-ticker-stream
     * @see https://developers.binance.com/docs/binance-spot-api-docs/web-socket-streams#all-market-mini-tickers-stream
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/websocket-market-streams/Individual-Symbol-Ticker-Streams
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/websocket-market-streams/All-Market-Mini-Tickers-Stream
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/websocket-market-streams/All-Market-Mini-Tickers-Stream
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/websocket-market-streams/Individual-Symbol-Ticker-Streams
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    unWatchTicker(symbol: string, params?: {}): Promise<any>;
    /**
     * @method
     * @name binance#watchBidsAsks
     * @description watches best bid & ask for symbols
     * @see https://developers.binance.com/docs/binance-spot-api-docs/websocket-api/market-data-requests#symbol-order-book-ticker
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/websocket-market-streams/All-Book-Tickers-Stream
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/websocket-market-streams/All-Book-Tickers-Stream
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchBidsAsks(symbols?: Strings, params?: {}): Promise<Tickers>;
    watchMultiTickerHelper(methodName: any, channelName: string, symbols?: Strings, params?: {}): Promise<any>;
    parseWsTicker(message: any, marketType: any): Ticker;
    handleTickerWs(client: Client, message: any): void;
    handleBidsAsks(client: Client, message: any): void;
    handleTickers(client: Client, message: any): void;
    handleTickersAndBidsAsks(client: Client, message: any, methodType: any): void;
    getMessageHash(channelName: string, symbol: Str, isBidAsk: boolean): string;
    signParams(params?: {}): any;
    /**
     * Ensures a User Data Stream WebSocket subscription is active for the specified scope
     * @param marketType {string} only support on 'spot'
     * @see {@link https://developers.binance.com/docs/binance-spot-api-docs/websocket-api/user-data-stream-requests#subscribe-to-user-data-stream-through-signature-subscription-user_data Binance User Data Stream Documentation}
     * @returns Promise<number> The subscription ID for the user data stream
     */
    ensureUserDataStreamWsSubscribeSignature(marketType?: string): Promise<void>;
    handleUserDataStreamSubscribe(client: Client, message: any): void;
    authenticate(params?: {}): Promise<void>;
    keepAliveListenKey(params?: {}): Promise<void>;
    setBalanceCache(client: Client, type: any, isPortfolioMargin?: boolean): void;
    loadBalanceSnapshot(client: any, messageHash: any, type: any, isPortfolioMargin: any): Promise<void>;
    /**
     * @method
     * @name binance#fetchBalanceWs
     * @description fetch balance and get the amount of funds available for trading or funds locked in orders
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/account/websocket-api/Futures-Account-Balance
     * @see https://developers.binance.com/docs/binance-spot-api-docs/websocket-api/account-requests#account-information-user_data
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/account/websocket-api
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string|undefined} [params.type] 'future', 'delivery', 'savings', 'funding', or 'spot'
     * @param {string|undefined} [params.marginMode] 'cross' or 'isolated', for margin trading, uses this.options.defaultMarginMode if not passed, defaults to undefined/None/null
     * @param {string[]|undefined} [params.symbols] unified market symbols, only used in isolated margin mode
     * @param {string|undefined} [params.method] method to use. Can be account.balance, account.status, v2/account.balance or v2/account.status
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    fetchBalanceWs(params?: {}): Promise<Balances>;
    handleBalanceWs(client: Client, message: any): void;
    handleAccountStatusWs(client: Client, message: any): void;
    /**
     * @method
     * @name binance#fetchPositionWs
     * @description fetch data on an open position
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/websocket-api/Position-Information
     * @param {string} symbol unified market symbol of the market the position is held in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    fetchPositionWs(symbol: string, params?: {}): Promise<Position[]>;
    /**
     * @method
     * @name binance#fetchPositionsWs
     * @description fetch all open positions
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/websocket-api/Position-Information
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/websocket-api/Position-Information
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.returnRateLimits] set to true to return rate limit informations, defaults to false.
     * @param {string|undefined} [params.method] method to use. Can be account.position or v2/account.position
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    fetchPositionsWs(symbols?: Strings, params?: {}): Promise<Position[]>;
    handlePositionsWs(client: Client, message: any): void;
    /**
     * @method
     * @name binance#watchBalance
     * @description watch balance and get the amount of funds available for trading or funds locked in orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.portfolioMargin] set to true if you would like to watch the balance of a portfolio margin account
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    watchBalance(params?: {}): Promise<Balances>;
    handleBalance(client: Client, message: any): void;
    getAccountTypeFromSubscriptions(subscriptions: string[]): string;
    getMarketType(method: any, market: any, params?: {}): any;
    /**
     * @method
     * @name binance#createOrderWs
     * @description create a trade order
     * @see https://developers.binance.com/docs/binance-spot-api-docs/websocket-api/trading-requests#place-new-order-trade
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/websocket-api/New-Order
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/websocket-api
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float|undefined} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} params.test test order, default false
     * @param {boolean} params.returnRateLimits set to true to return rate limit information, default false
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrderWs(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    handleOrderWs(client: Client, message: any): void;
    handleOrdersWs(client: Client, message: any): void;
    /**
     * @method
     * @name binance#editOrderWs
     * @description edit a trade order
     * @see https://developers.binance.com/docs/binance-spot-api-docs/websocket-api/trading-requests#cancel-and-replace-order-trade
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/websocket-api/Modify-Order
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/websocket-api/Modify-Order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of the currency you want to trade in units of the base currency
     * @param {float|undefined} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    editOrderWs(id: string, symbol: string, type: OrderType, side: OrderSide, amount?: Num, price?: Num, params?: {}): Promise<Order>;
    handleEditOrderWs(client: Client, message: any): void;
    /**
     * @method
     * @name binance#cancelOrderWs
     * @description cancel multiple orders
     * @see https://developers.binance.com/docs/binance-spot-api-docs/websocket-api/trading-requests#cancel-order-trade
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/websocket-api/Cancel-Order
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/websocket-api/Cancel-Order
     * @param {string} id order id
     * @param {string} [symbol] unified market symbol, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string|undefined} [params.cancelRestrictions] Supported values: ONLY_NEW - Cancel will succeed if the order status is NEW. ONLY_PARTIALLY_FILLED - Cancel will succeed if order status is PARTIALLY_FILLED.
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrderWs(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name binance#cancelAllOrdersWs
     * @description cancel all open orders in a market
     * @see https://developers.binance.com/docs/binance-spot-api-docs/websocket-api/trading-requests#cancel-open-orders-trade
     * @param {string} [symbol] unified market symbol of the market to cancel orders in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelAllOrdersWs(symbol?: Str, params?: {}): Promise<any>;
    /**
     * @method
     * @name binance#fetchOrderWs
     * @description fetches information on an order made by the user
     * @see https://developers.binance.com/docs/binance-spot-api-docs/websocket-api/trading-requests#query-order-user_data
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/websocket-api/Query-Order
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/websocket-api/Query-Order
     * @param {string} id order id
     * @param {string} [symbol] unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrderWs(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name binance#fetchOrdersWs
     * @description fetches information on multiple orders made by the user
     * @see https://developers.binance.com/docs/binance-spot-api-docs/websocket-api/trading-requests#order-lists
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int|undefined} [since] the earliest time in ms to fetch orders for
     * @param {int|undefined} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.orderId] order id to begin at
     * @param {int} [params.startTime] earliest time in ms to retrieve orders for
     * @param {int} [params.endTime] latest time in ms to retrieve orders for
     * @param {int} [params.limit] the maximum number of order structures to retrieve
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrdersWs(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name binance#fetchClosedOrdersWs
     * @description fetch closed orders
     * @see https://developers.binance.com/docs/binance-spot-api-docs/websocket-api/trading-requests#order-lists
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchClosedOrdersWs(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name binance#fetchOpenOrdersWs
     * @description fetch all unfilled currently open orders
     * @see https://developers.binance.com/docs/binance-spot-api-docs/websocket-api/trading-requests#current-open-orders-user_data
     * @param {string} symbol unified market symbol
     * @param {int|undefined} [since] the earliest time in ms to fetch open orders for
     * @param {int|undefined} [limit] the maximum number of open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOpenOrdersWs(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name binance#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://developers.binance.com/docs/binance-spot-api-docs/user-data-stream#order-update
     * @see https://developers.binance.com/docs/margin_trading/trade-data-stream/Event-Order-Update
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/user-data-streams/Event-Order-Update
     * @param {string} symbol unified market symbol of the market the orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string|undefined} [params.marginMode] 'cross' or 'isolated', for spot margin
     * @param {boolean} [params.portfolioMargin] set to true if you would like to watch portfolio margin account orders
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    parseWsOrder(order: any, market?: any): Order;
    handleOrderUpdate(client: Client, message: any): void;
    /**
     * @method
     * @name binance#watchPositions
     * @description watch all open positions
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {number} [since] since timestamp
     * @param {number} [limit] limit
     * @param {object} params extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.portfolioMargin] set to true if you would like to watch positions in a portfolio margin account
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
     */
    watchPositions(symbols?: Strings, since?: Int, limit?: Int, params?: {}): Promise<Position[]>;
    setPositionsCache(client: Client, type: any, symbols?: Strings, isPortfolioMargin?: boolean): void;
    loadPositionsSnapshot(client: any, messageHash: any, type: any, isPortfolioMargin: any): Promise<void>;
    handlePositions(client: any, message: any): void;
    parseWsPosition(position: any, market?: any): Position;
    /**
     * @method
     * @name binance#fetchMyTradesWs
     * @description fetch all trades made by the user
     * @see https://developers.binance.com/docs/binance-spot-api-docs/websocket-api/account-requests#account-trade-history-user_data
     * @param {string} symbol unified market symbol
     * @param {int|undefined} [since] the earliest time in ms to fetch trades for
     * @param {int|undefined} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.endTime] the latest time in ms to fetch trades for
     * @param {int} [params.fromId] first trade Id to fetch
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    fetchMyTradesWs(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name binance#fetchTradesWs
     * @description fetch all trades made by the user
     * @see https://developers.binance.com/docs/binance-spot-api-docs/websocket-api/market-data-requests#recent-trades
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve, default=500, max=1000
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     *
     * EXCHANGE SPECIFIC PARAMETERS
     * @param {int} [params.fromId] trade ID to begin at
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    fetchTradesWs(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    handleTradesWs(client: Client, message: any): void;
    /**
     * @method
     * @name binance#watchMyTrades
     * @description watches information on multiple trades made by the user
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.portfolioMargin] set to true if you would like to watch trades in a portfolio margin account
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    watchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    handleMyTrade(client: Client, message: any): void;
    handleOrder(client: Client, message: any): void;
    handleAcountUpdate(client: any, message: any): void;
    handleWsError(client: Client, message: any): void;
    handleEventStreamTerminated(client: Client, message: any): void;
    handleMessage(client: Client, message: any): void;
}
