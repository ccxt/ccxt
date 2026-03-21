import kucoinRest from '../kucoin.js';
import type { Balances, Bool, Dict, Int, OHLCV, Order, OrderBook, Position, Str, Strings, Ticker, Tickers, Trade } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class kucoin extends kucoinRest {
    describe(): any;
    negotiate(privateChannel: any, isFuturesMethod?: boolean, params?: {}): Promise<any>;
    negotiateHelper(privateChannel: any, connectId: any, params?: {}): Promise<string>;
    requestId(): any;
    subscribe(url: any, messageHash: any, subscriptionHash: any, params?: {}, subscription?: any): Promise<any>;
    unSubscribe(url: any, messageHash: any, topic: any, subscriptionHash: any, params?: {}, subscription?: Dict): Promise<any>;
    subscribeMultiple(url: any, messageHashes: any, topic: any, subscriptionHashes: any, params?: {}, subscription?: any): Promise<any>;
    unSubscribeMultiple(url: any, messageHashes: any, topic: any, subscriptionHashes: any, params?: {}, subscription?: Dict): Promise<any>;
    /**
     * @method
     * @name kucoin#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://www.kucoin.com/docs-new/3470063w0
     * @see https://www.kucoin.com/docs-new/3470081w0
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    watchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name kucoin#unWatchTicker
     * @description unWatches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://www.kucoin.com/docs-new/3470063w0
     * @see https://www.kucoin.com/docs-new/3470081w0
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    unWatchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name kucoin#watchTickers
     * @see https://www.kucoin.com/docs-new/3470063w0
     * @see https://www.kucoin.com/docs-new/3470064w0
     * @see https://www.kucoin.com/docs-new/3470081w0
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.method] *spot markets only* either '/market/snapshot' or '/market/ticker' default is '/market/ticker'
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    watchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    handleTicker(client: Client, message: any): void;
    handleContractTicker(client: Client, message: any): void;
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
    watchBidsAsks(symbols?: Strings, params?: {}): Promise<Tickers>;
    watchMultiHelper(methodName: any, channelName: string, symbols?: Strings, params?: {}): Promise<any>;
    handleBidAsk(client: Client, message: any): void;
    parseWsBidAsk(ticker: any, market?: any): Ticker;
    /**
     * @method
     * @name kucoin#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://www.kucoin.com/docs-new/3470071w0
     * @see https://www.kucoin.com/docs-new/3470086w0
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    /**
     * @method
     * @name kucoin#unWatchOHLCV
     * @description unWatches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://www.kucoin.com/docs-new/3470071w0
     * @see https://www.kucoin.com/docs-new/3470086w0
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    unWatchOHLCV(symbol: string, timeframe?: string, params?: {}): Promise<OHLCV[]>;
    handleOHLCV(client: Client, message: any): void;
    /**
     * @method
     * @name kucoin#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://www.kucoin.com/docs-new/3470072w0
     * @see https://www.kucoin.com/docs-new/3470084w0
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
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
    watchTradesForSymbols(symbols: string[], since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
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
    unWatchTradesForSymbols(symbols: string[], params?: {}): Promise<any>;
    /**
     * @method
     * @name kucoin#unWatchTrades
     * @description unWatches trades stream
     * @see https://www.kucoin.com/docs-new/3470072w0
     * @see https://www.kucoin.com/docs-new/3470084w0
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    unWatchTrades(symbol: string, params?: {}): Promise<any>;
    handleTrade(client: Client, message: any): void;
    /**
     * @method
     * @name kucoin#watchOrderBook
     * @see https://www.kucoin.com/docs/websocket/spot-trading/public-channels/level1-bbo-market-data
     * @see https://www.kucoin.com/docs/websocket/spot-trading/public-channels/level2-market-data
     * @see https://www.kucoin.com/docs/websocket/spot-trading/public-channels/level2-5-best-ask-bid-orders
     * @see https://www.kucoin.com/docs/websocket/spot-trading/public-channels/level2-50-best-ask-bid-orders
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.method] either '/market/level2' or '/spotMarket/level2Depth5' or '/spotMarket/level2Depth50' default is '/market/level2'
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbols
     */
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name kucoin#unWatchOrderBook
     * @see https://www.kucoin.com/docs/websocket/spot-trading/public-channels/level1-bbo-market-data
     * @see https://www.kucoin.com/docs/websocket/spot-trading/public-channels/level2-market-data
     * @see https://www.kucoin.com/docs/websocket/spot-trading/public-channels/level2-5-best-ask-bid-orders
     * @see https://www.kucoin.com/docs/websocket/spot-trading/public-channels/level2-50-best-ask-bid-orders
     * @description unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.method] either '/market/level2' or '/spotMarket/level2Depth5' or '/spotMarket/level2Depth50' default is '/market/level2'
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbols
     */
    unWatchOrderBook(symbol: string, params?: {}): Promise<any>;
    /**
     * @method
     * @name kucoin#watchOrderBookForSymbols
     * @see https://www.kucoin.com/docs-new/3470069w0 // spot level 5
     * @see https://www.kucoin.com/docs-new/3470070w0 // spot level 50
     * @see https://www.kucoin.com/docs-new/3470068w0 // spot incremental
     * @see https://www.kucoin.com/docs-new/3470083w0 // futures level 5
     * @see https://www.kucoin.com/docs-new/3470097w0 // futures level 50
     * @see https://www.kucoin.com/docs-new/3470082w0 // futures incremental
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string[]} symbols unified array of symbols
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbols
     */
    watchOrderBookForSymbols(symbols: string[], limit?: Int, params?: {}): Promise<OrderBook>;
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
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbols
     */
    unWatchOrderBookForSymbols(symbols: string[], params?: {}): Promise<any>;
    handleOrderBook(client: Client, message: any): void;
    getCacheIndex(orderbook: any, cache: any): any;
    handleDelta(orderbook: any, delta: any): void;
    handleBidAsks(bookSide: any, bidAsks: any): void;
    handleOrderBookSubscription(client: Client, message: any, subscription: any): void;
    handleSubscriptionStatus(client: Client, message: any): void;
    handleSystemStatus(client: Client, message: any): any;
    /**
     * @method
     * @name kucoin#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://www.kucoin.com/docs-new/3470074w0 // spot regular orders
     * @see https://www.kucoin.com/docs-new/3470139w0 // spot trigger orders
     * @see https://www.kucoin.com/docs-new/3470090w0 // contract regular orders
     * @see https://www.kucoin.com/docs-new/3470091w0 // contract trigger orders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] trigger orders are watched if true
     * @param {string} [params.type] 'spot' or 'swap' (default is 'spot' if symbol is not provided)
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    getOrdersMessageHashSuffix(topic: any): string;
    parseWsOrderStatus(status: any): string;
    parseWsOrder(order: any, market?: any): Order;
    handleOrder(client: Client, message: any): void;
    /**
     * @method
     * @name kucoin#watchMyTrades
     * @description watches information on multiple trades made by the user on spot
     * @see https://www.kucoin.com/docs-new/3470074w0
     * @see https://www.kucoin.com/docs-new/3470090w0
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.method] '/spotMarket/tradeOrders' or '/spot/tradeFills' or '/contractMarket/tradeOrders', default is '/spotMarket/tradeOrders'
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    watchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    getMyTradesMessageHashSuffix(topic: any): string;
    handleMyTrade(client: Client, message: any): void;
    parseWsTrade(trade: any, market?: any): Trade;
    /**
     * @method
     * @name kucoin#watchBalance
     * @description watch balance and get the amount of funds available for trading or funds locked in orders
     * @see https://www.kucoin.com/docs-new/3470075w0 // spot balance
     * @see https://www.kucoin.com/docs-new/3470092w0 // contract balance
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'spot' or 'swap' (default is 'spot')
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    watchBalance(params?: {}): Promise<Balances>;
    setBalanceCache(client: Client, type: any): void;
    loadBalanceSnapshot(client: any, messageHash: any, type: any): Promise<void>;
    handleBalance(client: Client, message: any): void;
    /**
     * @method
     * @name kucoin#watchPosition
     * @description watch open positions for a specific symbol
     * @see https://www.kucoin.com/docs-new/3470093w0
     * @param {string|undefined} symbol unified market symbol
     * @param {object} params extra parameters specific to the exchange API endpoint
     * @returns {object} a [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
     */
    watchPosition(symbol?: Str, params?: {}): Promise<Position>;
    getCurrentPosition(symbol: any): any;
    setPositionCache(client: Client, symbol: string): void;
    loadPositionSnapshot(client: any, messageHash: any, symbol: any): Promise<void>;
    handlePosition(client: Client, message: any): void;
    handleSubject(client: Client, message: any): void;
    ping(client: Client): {
        id: any;
        type: string;
    };
    handlePong(client: Client, message: any): void;
    handleErrorMessage(client: Client, message: any): Bool;
    handleMessage(client: Client, message: any): void;
    getMessageHash(elementName: string, symbol?: Str): string;
}
