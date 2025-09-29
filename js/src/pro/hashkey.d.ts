import hashkeyRest from '../hashkey.js';
import type { Balances, Dict, Int, Market, OHLCV, Order, OrderBook, Position, Str, Strings, Ticker, Trade } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class hashkey extends hashkeyRest {
    describe(): any;
    wathPublic(market: Market, topic: string, messageHash: string, params?: {}): Promise<any>;
    watchPrivate(messageHash: any): Promise<any>;
    getPrivateUrl(listenKey: any): string;
    /**
     * @method
     * @name hashkey#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://hashkeyglobal-apidoc.readme.io/reference/websocket-api#public-stream
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.binary] true or false - default false
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    handleOHLCV(client: Client, message: any): void;
    parseWsOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @method
     * @name hahskey#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://hashkeyglobal-apidoc.readme.io/reference/websocket-api#public-stream
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.binary] true or false - default false
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchTicker(symbol: string, params?: {}): Promise<Ticker>;
    handleTicker(client: Client, message: any): void;
    /**
     * @method
     * @name hashkey#watchTrades
     * @description watches information on multiple trades made in a market
     * @see https://hashkeyglobal-apidoc.readme.io/reference/websocket-api#public-stream
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.binary] true or false - default false
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    handleTrades(client: Client, message: any): void;
    /**
     * @method
     * @name alpaca#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://hashkeyglobal-apidoc.readme.io/reference/websocket-api#public-stream
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return.
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    handleOrderBook(client: Client, message: any): void;
    /**
     * @method
     * @name hashkey#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://hashkeyglobal-apidoc.readme.io/reference/websocket-api#private-stream
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    handleOrder(client: Client, message: any): void;
    parseWsOrder(order: Dict, market?: Market): Order;
    /**
     * @method
     * @name hashkey#watchMyTrades
     * @description watches information on multiple trades made by the user
     * @see https://hashkeyglobal-apidoc.readme.io/reference/websocket-api#private-stream
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    watchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    handleMyTrade(client: Client, message: any, subscription?: {}): void;
    parseWsTrade(trade: any, market?: any): Trade;
    /**
     * @method
     * @name hashkey#watchPositions
     * @see https://hashkeyglobal-apidoc.readme.io/reference/websocket-api#private-stream
     * @description watch all open positions
     * @param {string[]} [symbols] list of unified market symbols to watch positions for
     * @param {int} [since] the earliest time in ms to fetch positions for
     * @param {int} [limit] the maximum number of positions to retrieve
     * @param {object} params extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
     */
    watchPositions(symbols?: Strings, since?: Int, limit?: Int, params?: {}): Promise<Position[]>;
    handlePosition(client: Client, message: any): void;
    parseWsPosition(position: any, market?: Market): Position;
    /**
     * @method
     * @name bitmart#watchBalance
     * @description watch balance and get the amount of funds available for trading or funds locked in orders
     * @see https://hashkeyglobal-apidoc.readme.io/reference/websocket-api#private-stream
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'spot' or 'swap' - the type of the market to watch balance for (default 'spot')
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    watchBalance(params?: {}): Promise<Balances>;
    setBalanceCache(client: Client, type: any, subscribeHash: any): void;
    loadBalanceSnapshot(client: any, messageHash: any, type: any): Promise<void>;
    handleBalance(client: Client, message: any): void;
    authenticate(params?: {}): Promise<string>;
    keepAliveListenKey(listenKey: any, params?: {}): Promise<void>;
    handleMessage(client: Client, message: any): void;
}
