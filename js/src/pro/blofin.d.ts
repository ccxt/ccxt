import blofinRest from '../blofin.js';
import type { Int, Market, Trade, OrderBook, Strings, Ticker, Tickers, OHLCV, Balances, Str, Order, Position } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class blofin extends blofinRest {
    describe(): any;
    ping(client: any): string;
    handlePong(client: Client, message: any): void;
    /**
     * @method
     * @name blofin#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://docs.blofin.com/index.html#ws-trades-channel
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name blofin#watchTradesForSymbols
     * @description get the list of most recent trades for a list of symbols
     * @see https://docs.blofin.com/index.html#ws-trades-channel
     * @param {string[]} symbols unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    watchTradesForSymbols(symbols: string[], since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    handleTrades(client: Client, message: any): void;
    parseWsTrade(trade: any, market?: Market): Trade;
    /**
     * @method
     * @name blofin#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.blofin.com/index.html#ws-order-book-channel
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
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
    watchOrderBookForSymbols(symbols: string[], limit?: Int, params?: {}): Promise<OrderBook>;
    handleOrderBook(client: Client, message: any): void;
    /**
     * @method
     * @name blofin#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.blofin.com/index.html#ws-tickers-channel
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name blofin#watchTickers
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://docs.blofin.com/index.html#ws-tickers-channel
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    handleTicker(client: Client, message: any): void;
    parseWsTicker(ticker: any, market?: Market): Ticker;
    /**
     * @method
     * @name blofin#watchBidsAsks
     * @description watches best bid & ask for symbols
     * @see https://docs.blofin.com/index.html#ws-tickers-channel
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchBidsAsks(symbols?: Strings, params?: {}): Promise<Tickers>;
    handleBidAsk(client: Client, message: any): void;
    parseWsBidAsk(ticker: any, market?: any): Ticker;
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
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
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
    watchOHLCVForSymbols(symbolsAndTimeframes: string[][], since?: Int, limit?: Int, params?: {}): Promise<import("../base/types.js").Dictionary<import("../base/types.js").Dictionary<OHLCV[]>>>;
    handleOHLCV(client: Client, message: any): void;
    /**
     * @method
     * @name blofin#watchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://docs.blofin.com/index.html#ws-account-channel
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    watchBalance(params?: {}): Promise<Balances>;
    handleBalance(client: Client, message: any): void;
    parseWsBalance(message: any): Balances;
    /**
     * @method
     * @name biofin#watchOrders
     * @description watches information on multiple orders made by the user
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure
     */
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name blofin#watchOrdersForSymbols
     * @description watches information on multiple orders made by the user across multiple symbols
     * @see https://docs.blofin.com/index.html#ws-order-channel
     * @param {string[]} symbols
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure
     */
    watchOrdersForSymbols(symbols: string[], since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    handleOrders(client: Client, message: any): void;
    parseWsOrder(order: any, market?: Market): Order;
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
    watchPositions(symbols?: Strings, since?: Int, limit?: Int, params?: {}): Promise<Position[]>;
    handlePositions(client: Client, message: any): void;
    parseWsPosition(position: any, market?: Market): Position;
    watchMultipleWrapper(isPublic: boolean, channelName: string, callerMethodName: string, symbolsArray?: any[], params?: {}): Promise<any>;
    getSubscriptionRequest(args: any): {
        op: string;
        args: any;
    };
    handleMessage(client: Client, message: any): void;
    authenticate(params?: {}): Promise<void>;
}
