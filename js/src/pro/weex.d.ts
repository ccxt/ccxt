import weexRest from '../weex.js';
import type { Balances, Dict, Int, Market, OHLCV, Order, OrderBook, Position, Str, Strings, Ticker, Tickers, Trade } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class weex extends weexRest {
    describe(): any;
    requestId(): string;
    subscribePublic(messageHashes: any, channels: any, isContract?: boolean, params?: {}, subscription?: {}): Promise<any>;
    subscribePrivate(messageHash: any, subscribeHash: any, channel: any, isContract?: boolean, params?: {}, subscription?: {}): Promise<any>;
    authenticate(url: any): void;
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
    watchTicker(symbol: string, params?: {}): Promise<Ticker>;
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
    watchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
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
    unWatchTicker(symbol: string, params?: {}): Promise<any>;
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
    unWatchTickers(symbols?: Strings, params?: {}): Promise<any>;
    handleTicker(client: Client, message: any): void;
    parseWsTicker(ticker: Dict, market?: Market): Ticker;
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
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
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
    watchTradesForSymbols(symbols: string[], since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
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
    unWatchTrades(symbol: string, params?: {}): Promise<any>;
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
    unWatchTradesForSymbols(symbols: string[], params?: {}): Promise<any>;
    handleTrade(client: Client, message: any): void;
    parseWsTrade(trade: any, market?: any): Trade;
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
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
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
    watchOHLCVForSymbols(symbolsAndTimeframes: string[][], since?: Int, limit?: Int, params?: {}): Promise<import("../base/types.js").Dictionary<import("../base/types.js").Dictionary<OHLCV[]>>>;
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
    unWatchOHLCV(symbol: string, timeframe?: string, params?: {}): Promise<any>;
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
    unWatchOHLCVForSymbols(symbolsAndTimeframes: string[][], params?: {}): Promise<any>;
    handleOHLCV(client: Client, message: any): void;
    parseWsOHLCV(ohlcv: any, market?: any): OHLCV;
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
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
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
    watchOrderBookForSymbols(symbols: string[], limit?: Int, params?: {}): Promise<OrderBook>;
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
    unWatchOrderBook(symbol: string, params?: {}): Promise<any>;
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
    unWatchOrderBookForSymbols(symbols: string[], params?: {}): Promise<any>;
    handleOrderBook(client: Client, message: any): void;
    handleDelta(bookside: any, delta: any): void;
    /**
     * @method
     * @name weex#watchBidsAsks
     * @description watches best bid & ask for spot symbols
     * @see https://www.weex.com/api-doc/spot/Websocket/public/BookTicker-Channel
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchBidsAsks(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name weex#unWatchBidsAsks
     * @description unWatches best bid & ask for spot symbols
     * @see https://www.weex.com/api-doc/spot/Websocket/public/BookTicker-Channel
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    unWatchBidsAsks(symbols?: Strings, params?: {}): Promise<any>;
    handleBidAsk(client: Client, message: any): void;
    parseWsBidAsk(message: any, market?: any): Ticker;
    /**
     * @method
     * @name weex#watchMyTrades
     * @description watches information on multiple trades made by the user
     * @see https://www.weex.com/api-doc/spot/Websocket/private/Fill-Channel
     * @see https://www.weex.com/api-doc/contract/Websocket/private/Fill-Channel
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] spot or swap, default is spot if symbol is not provided
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    watchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name weex#unWatchMyTrades
     * @description unWatches information on multiple trades made by the user
     * @see https://www.weex.com/api-doc/spot/Websocket/private/Fill-Channel
     * @see https://www.weex.com/api-doc/contract/Websocket/private/Fill-Channel
     * @param {string} [symbol] not used by the exchange
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] spot or swap, default is spot
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    unWatchMyTrades(symbol?: Str, params?: {}): Promise<any>;
    handleMyTrades(client: Client, message: any): void;
    parseWsMyTrade(trade: any, market?: any): Trade;
    /**
     * @method
     * @name weex#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://www.weex.com/api-doc/spot/Websocket/private/Order-Channel
     * @see https://www.weex.com/api-doc/contract/Websocket/private/Order-Channel
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] spot or swap, default is spot if symbol is not provided
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name weex#unWatchOrders
     * @description unWatches information on multiple orders made by the user
     * @see https://www.weex.com/api-doc/spot/Websocket/private/Order-Channel
     * @see https://www.weex.com/api-doc/contract/Websocket/private/Order-Channel
     * @param {string} [symbol] not used by the exchange
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    unWatchOrders(symbol?: Str, params?: {}): Promise<any>;
    handleOrders(client: Client, message: any): void;
    parseWsOrder(order: any, market?: any): Order;
    /**
     * @method
     * @name weex#watchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://www.weex.com/api-doc/spot/Websocket/private/Account-Channel
     * @see https://www.weex.com/api-doc/contract/Websocket/private/Account-Channel
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'spot' or 'swap', default is 'spot'
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    watchBalance(params?: {}): Promise<Balances>;
    setBalanceCache(client: Client, type: any): void;
    loadBalanceSnapshot(client: any, messageHash: any, type: any): Promise<void>;
    handleBalance(client: Client, message: any): void;
    /**
     * @method
     * @name weex#watchPositions
     * @see https://www.weex.com/api-doc/contract/Websocket/private/Positions-Channel
     * @description watch all open positions
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {int} [since] the earliest time in ms to fetch positions for
     * @param {int} [limit] the maximum number of position structures to retrieve
     * @param {object} params extra parameters specific to the exchange API endpoint
     * @param {int} [params.accountNumber] account number to query orders for, required
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
     */
    watchPositions(symbols?: Strings, since?: Int, limit?: Int, params?: {}): Promise<Position[]>;
    setPositionsCache(client: Client, params?: Dict): void;
    loadPositionsSnapshot(client: any, messageHash: any, params: any): Promise<void>;
    /**
     * @method
     * @name weex#unWatchPositions
     * @description unWatches all open positions
     * @see https://www.weex.com/api-doc/contract/Websocket/private/Positions-Channel
     * @param {string[]} [symbols] not used by the exchange, unsubscription from positions is global for all symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} status of the unwatch request
     */
    unWatchPositions(symbols?: Strings, params?: {}): Promise<any>;
    handlePositions(client: any, message: any): void;
    getMarketFromClientAndMessage(client: Client, message: any): import("../base/types.js").MarketInterface;
    pong(client: Client, message: any): Promise<void>;
    handlePing(client: Client, message: any): void;
    handleSubscriptionStatus(client: Client, message: any): any;
    handleErrorMessage(client: Client, message: any): boolean;
    handleMessage(client: Client, message: any): void;
}
