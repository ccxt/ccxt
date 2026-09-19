import kucoinRest from '../kucoin.js';
import type { Balances, Bool, Dict, FundingRate, Int, Market, NullableDict, OHLCV, Order, OrderBook, Position, Str, Strings, Ticker, Tickers, Trade } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class kucoin extends kucoinRest {
    describe(): any;
    negotiate(privateChannel: any, isFuturesMethod?: boolean, params?: Dict): Promise<any>;
    negotiateHelper(privateChannel: any, connectId: string, params?: Dict): Promise<Str>;
    requestId(): number;
    subscribe(url: string, messageHash: string, subscriptionHash: string, params?: Dict, subscription?: NullableDict): Promise<any>;
    subscribePublicUta(messageHash: string, channel: string, symbol: string, params?: Dict, subscription?: NullableDict): Promise<any>;
    subscribePrivateUta(messageHashes: string[], subscribeHash: string, channel: string, symbol?: Str, params?: Dict, subscription?: NullableDict): Promise<any>;
    getUtaUrl(): Promise<string>;
    authenticateUta(): Promise<Str>;
    unSubscribe(url: string, messageHash: string, topic: string, subscriptionHash: string, params?: Dict, subscription?: NullableDict): Promise<any>;
    subscribeMultiple(url: string, messageHashes: string[], topic: string, subscriptionHashes: string[], params?: Dict, subscription?: NullableDict): Promise<any>;
    unSubscribeMultiple(url: string, messageHashes: string[], topic: string, subscriptionHashes: string[], params?: Dict, subscription?: NullableDict): Promise<any>;
    /**
     * @method
     * @name kucoin#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://www.kucoin.com/docs-new/3470063w0
     * @see https://www.kucoin.com/docs-new/3470081w0
     * @see https://www.kucoin.com/docs-new/3470222w0
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), default is false
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    watchTicker(symbol: string, params?: Dict): Promise<Ticker>;
    /**
     * @method
     * @name kucoin#unWatchTicker
     * @description unWatches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://www.kucoin.com/docs-new/3470063w0
     * @see https://www.kucoin.com/docs-new/3470081w0
     * @see https://www.kucoin.com/docs-new/3470222w0
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), default is false
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    unWatchTicker(symbol: string, params?: Dict): Promise<Ticker>;
    /**
     * @method
     * @name kucoin#watchTickers
     * @see https://www.kucoin.com/docs-new/3470063w0
     * @see https://www.kucoin.com/docs-new/3470064w0
     * @see https://www.kucoin.com/docs-new/3470081w0
     * @see https://www.kucoin.com/docs-new/3470222w0
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.method] *spot markets only* either '/market/snapshot' or '/market/ticker' default is '/market/ticker'
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), default is false
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    watchTickers(symbols?: Strings, params?: Dict): Promise<Tickers>;
    subscribePublicMultipleUta(messageHashes: string[], channel: string, symbols: any[], params?: Dict, subscription?: NullableDict): Promise<any>;
    watchUtaTickers(symbols?: Strings, params?: Dict): Promise<Tickers>;
    handleTicker(client: Client, message: Dict): void;
    handleContractTicker(client: Client, message: Dict): void;
    handleUtaTicker(client: Client, message: Dict): void;
    parseWsUtaTicker(ticker: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name kucoin#watchBidsAsks
     * @see https://www.kucoin.com/docs-new/3470067w0
     * @see https://www.kucoin.com/docs-new/3470080w0
     * @description watches best bid & ask for symbols
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    watchBidsAsks(symbols?: Strings, params?: Dict): Promise<Tickers>;
    watchMultiHelper(methodName: string, channelName: string, isFuturesChannel: boolean, symbols?: Strings, params?: Dict): Promise<any>;
    handleBidAsk(client: Client, message: Dict): void;
    parseWsBidAsk(ticker: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name kucoin#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://www.kucoin.com/docs-new/3470071w0
     * @see https://www.kucoin.com/docs-new/3470086w0
     * @see https://www.kucoin.com/docs-new/3470223w0
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), default is false
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: Dict): Promise<OHLCV[]>;
    /**
     * @method
     * @name kucoin#unWatchOHLCV
     * @description unWatches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://www.kucoin.com/docs-new/3470071w0
     * @see https://www.kucoin.com/docs-new/3470086w0
     * @see https://www.kucoin.com/docs-new/3470223w0
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), default is false
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    unWatchOHLCV(symbol: string, timeframe?: string, params?: Dict): Promise<OHLCV[]>;
    handleOHLCV(client: Client, message: Dict): void;
    handleUtaOHLCV(client: Client, message: Dict): void;
    /**
     * @method
     * @name kucoin#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://www.kucoin.com/docs-new/3470072w0
     * @see https://www.kucoin.com/docs-new/3470084w0
     * @see https://www.kucoin.com/docs-new/3470224w0
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), default is false
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: Dict): Promise<Trade[]>;
    /**
     * @method
     * @name kucoin#watchTradesForSymbols
     * @description get the list of most recent trades for a particular symbol
     * @see https://www.kucoin.com/docs-new/3470072w0
     * @see https://www.kucoin.com/docs-new/3470084w0
     * @param {string[]} symbols
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    watchTradesForSymbols(symbols: string[], since?: Int, limit?: Int, params?: Dict): Promise<Trade[]>;
    /**
     * @method
     * @name kucoin#unWatchTradesForSymbols
     * @description unWatches trades stream
     * @see https://www.kucoin.com/docs-new/3470072w0
     * @see https://www.kucoin.com/docs-new/3470084w0
     * @param {string} symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    unWatchTradesForSymbols(symbols: string[], params?: Dict): Promise<any>;
    /**
     * @method
     * @name kucoin#unWatchTrades
     * @description unWatches trades stream
     * @see https://www.kucoin.com/docs-new/3470072w0
     * @see https://www.kucoin.com/docs-new/3470084w0
     * @see https://www.kucoin.com/docs-new/3470224w0
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), default is false
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    unWatchTrades(symbol: string, params?: Dict): Promise<any>;
    handleTrade(client: Client, message: Dict): void;
    handleUtaTrade(client: Client, message: Dict): void;
    parseWsUtaTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name kucoin#watchOrderBook
     * @see https://www.kucoin.com/docs-new/3470069w0 // spot level 5
     * @see https://www.kucoin.com/docs-new/3470070w0 // spot level 50
     * @see https://www.kucoin.com/docs-new/3470068w0 // spot incremental
     * @see https://www.kucoin.com/docs-new/3470083w0 // futures level 5
     * @see https://www.kucoin.com/docs-new/3470097w0 // futures level 50
     * @see https://www.kucoin.com/docs-new/3470082w0 // futures incremental
     * @see https://www.kucoin.com/docs-new/3470221w0 // uta
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), default is false
     * @param {string} [params.method] either '/market/level2' or '/spotMarket/level2Depth5' or '/spotMarket/level2Depth50' default is '/market/level2'
     * @returns {object} an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
     */
    watchOrderBook(symbol: string, limit?: Int, params?: Dict): Promise<OrderBook>;
    /**
     * @method
     * @name kucoin#unWatchOrderBook
     * @see https://www.kucoin.com/docs-new/3470069w0 // spot level 5
     * @see https://www.kucoin.com/docs-new/3470070w0 // spot level 50
     * @see https://www.kucoin.com/docs-new/3470068w0 // spot incremental
     * @see https://www.kucoin.com/docs-new/3470083w0 // futures level 5
     * @see https://www.kucoin.com/docs-new/3470097w0 // futures level 50
     * @see https://www.kucoin.com/docs-new/3470082w0 // futures incremental
     * @see https://www.kucoin.com/docs-new/3470221w0 // uta
     * @description unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), default is false
     * @param {string} [params.method] either '/market/level2' or '/spotMarket/level2Depth5' or '/spotMarket/level2Depth50' default is '/market/level2'
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure}
     */
    unWatchOrderBook(symbol: string, params?: Dict): Promise<any>;
    /**
     * @method
     * @name kucoin#watchOrderBookForSymbols
     * @see https://www.kucoin.com/docs-new/3470069w0 // spot level 5
     * @see https://www.kucoin.com/docs-new/3470070w0 // spot level 50
     * @see https://www.kucoin.com/docs-new/3470068w0 // spot incremental
     * @see https://www.kucoin.com/docs-new/3470083w0 // futures level 5
     * @see https://www.kucoin.com/docs-new/3470097w0 // futures level 50
     * @see https://www.kucoin.com/docs-new/3470082w0 // futures incremental
     * @see https://www.kucoin.com/docs-new/3470221w0 // uta
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string[]} symbols unified array of symbols
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
     */
    watchOrderBookForSymbols(symbols: string[], limit?: Int, params?: Dict): Promise<OrderBook>;
    /**
     * @method
     * @name kucoin#unWatchOrderBookForSymbols
     * @see https://www.kucoin.com/docs-new/3470069w0 // spot level 5
     * @see https://www.kucoin.com/docs-new/3470070w0 // spot level 50
     * @see https://www.kucoin.com/docs-new/3470068w0 // spot incremental
     * @see https://www.kucoin.com/docs-new/3470083w0 // futures level 5
     * @see https://www.kucoin.com/docs-new/3470097w0 // futures level 50
     * @see https://www.kucoin.com/docs-new/3470082w0 // futures incremental
     * @description unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string[]} symbols unified array of symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.method] either '/market/level2' or '/spotMarket/level2Depth5' or '/spotMarket/level2Depth50' or '/contractMarket/level2' or '/contractMarket/level2Depth5' or '/contractMarket/level2Depth50' default is '/market/level2' for spot and '/contractMarket/level2' for futures
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure}
     */
    unWatchOrderBookForSymbols(symbols: string[], params?: Dict): Promise<any>;
    handleOrderBook(client: Client, message: Dict): void;
    handleUtaOrderBook(client: Client, message: Dict): void;
    getCacheIndex(orderbook: any, cache: any): number;
    handleDelta(orderbook: any, delta: NullableDict): void;
    handleBidAsks(bookSide: any, bidAsks: any[]): void;
    handleOrderBookSubscription(client: Client, message: Dict, subscription: Dict): void;
    handleSubscriptionStatus(client: Client, message: Dict): void;
    handleSystemStatus(client: Client, message: Dict): Dict;
    /**
     * @method
     * @name kucoin#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://www.kucoin.com/docs-new/3470074w0 // spot regular orders
     * @see https://www.kucoin.com/docs-new/3470139w0 // spot trigger orders
     * @see https://www.kucoin.com/docs-new/3470090w0 // contract regular orders
     * @see https://www.kucoin.com/docs-new/3470091w0 // contract trigger orders
     * @see https://www.kucoin.com/docs-new/3470228w0 // uta orders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.uta] set to true for the unified trading account (uta)
     * @param {boolean} [params.trigger] trigger orders are watched if true
     * @param {string} [params.type] 'spot' or 'swap' (default is 'spot' if symbol is not provided)
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Order[]>;
    getOrdersMessageHashSuffix(topic: Str): string;
    parseWsOrderStatus(status: Str): Str;
    parseWsOrder(order: NullableDict, market?: Market): Order;
    parseWsUtaOrder(order: Dict, market?: Market): Order;
    handleOrder(client: Client, message: Dict): void;
    handleUtaOrder(client: Client, message: Dict): void;
    /**
     * @method
     * @name kucoin#watchMyTrades
     * @description watches information on multiple trades made by the user on spot
     * @see https://www.kucoin.com/docs-new/3470074w0
     * @see https://www.kucoin.com/docs-new/3470090w0
     * @see https://www.kucoin.com/docs-new/3470264w0
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.uta] set to true for the unified trading account (uta)
     * @param {string} [params.method] *classic (non-uta) account only* '/spotMarket/tradeOrders' or '/spot/tradeFills' or '/contractMarket/tradeOrders', default is '/spotMarket/tradeOrders'
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    watchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Trade[]>;
    getMyTradesMessageHashSuffix(topic: any): string;
    handleMyTrade(client: Client, message: Dict): void;
    handleUtaMyTrade(client: Client, message: Dict): void;
    parseWsTrade(trade: NullableDict, market?: Market): Trade;
    /**
     * @method
     * @name kucoin#watchBalance
     * @description watch balance and get the amount of funds available for trading or funds locked in orders
     * @see https://www.kucoin.com/docs-new/3470075w0 // spot balance
     * @see https://www.kucoin.com/docs-new/3470092w0 // contract balance
     * @see https://www.kucoin.com/docs-new/3470231w0 // uta balance
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.uta] set to true for the unified trading account (uta)
     * @param {string} [params.type] *classic (non-uta) account only* 'spot' or 'swap' (default is 'spot')
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    watchBalance(params?: Dict): Promise<Balances>;
    setBalanceCache(client: Client, type: string): void;
    loadBalanceSnapshot(client: Client, messageHash: string, type: string): Promise<void>;
    handleBalance(client: Client, message: Dict): void;
    handleUtaBalance(client: Client, message: Dict): void;
    /**
     * @method
     * @name kucoin#watchPosition
     * @description watch open positions for a specific symbol
     * @see https://www.kucoin.com/docs-new/3470093w0
     * @param {string|undefined} symbol unified market symbol
     * @param {object} params extra parameters specific to the exchange API endpoint
     * @returns {object} a [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
     */
    watchPosition(symbol?: Str, params?: Dict): Promise<Position>;
    /**
     * @method
     * @name kucoin#watchPositions
     * @see https://www.kucoin.com/docs-new/3470233w0
     * @description watch all open positions
     * @param {string[]} [symbols] list of unified market symbols
     * @param {int} [since] the earliest time in ms to fetch positions for
     * @param {int} [limit] the maximum number of positions to retrieve
     * @param {object} params extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.uta] set to true for the unified trading account (uta)
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
     */
    watchPositions(symbols?: Strings, since?: Int, limit?: Int, params?: Dict): Promise<Position[]>;
    getCurrentPosition(symbol: string): NullableDict;
    setPositionsCache(client: Client, uta: boolean): void;
    loadPositionsSnapshot(client: Client, messageHash: string, uta: boolean): Promise<void>;
    setPositionCache(client: Client, symbol: string): void;
    loadPositionSnapshot(client: Client, messageHash: string, symbol: string): Promise<void>;
    handlePosition(client: Client, message: Dict): void;
    handleUtaPosition(client: Client, message: Dict): void;
    parseWsUtaPosition(position: Dict, market?: Market): Position;
    /**
     * @method
     * @name kucoin#watchFundingRate
     * @description watch the current funding rate
     * @see https://www.kucoin.com/docs-new/3470270w0
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/?id=funding-rate-structure}
     */
    watchFundingRate(symbol: string, params?: Dict): Promise<FundingRate>;
    /**
     * @method
     * @name kucoin#unWatchFundingRate
     * @description unWatches the current funding rate for a symbol
     * @see https://www.kucoin.com/docs-new/3470270w0
     * @param {string} symbol unified symbol of the market
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/?id=funding-rate-structure}
     */
    unWatchFundingRate(symbol: string, params?: Dict): Promise<any>;
    handleUtaFundingRate(client: Client, message: Dict): void;
    parseWsFundingRate(data: Dict, market?: Market): FundingRate;
    /**
     * @method
     * @name kucoin#watchMarkPrice
     * @description watches a mark price for a specific market
     * @see https://www.kucoin.com/docs-new/3470272w0
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    watchMarkPrice(symbol: string, params?: Dict): Promise<Ticker>;
    /**
     * @method
     * @name kucoin#unWatchMarkPrice
     * @description unWatches a mark price for a specific market
     * @see https://www.kucoin.com/docs-new/3470272w0
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    unWatchMarkPrice(symbol: string, params?: Dict): Promise<any>;
    handleSubject(client: Client, message: Dict): void;
    ping(client: Client): Dict;
    handlePong(client: Client, message: Dict): void;
    handleErrorMessage(client: Client, message: Dict): Bool;
    handleMessage(client: Client, message: Dict): void;
    getMessageHash(elementName: string, symbol?: Str): string;
}
