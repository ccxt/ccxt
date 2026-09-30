import upbitRest from '../upbit.js';
import type { Int, Str, Order, OrderBook, Trade, Ticker, Dict, Balances, Tickers, Strings, OHLCV, Market } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class upbit extends upbitRest {
    describe(): any;
    watchPublicMultiple(symbols: Strings, channel: Str, params?: Dict): Promise<any>;
    /**
     * @method
     * @name upbit#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://global-docs.upbit.com/reference/websocket-ticker
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    watchTicker(symbol: string, params?: Dict): Promise<Ticker>;
    /**
     * @method
     * @name upbit#watchTickers
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://global-docs.upbit.com/reference/websocket-ticker
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    watchTickers(symbols?: Strings, params?: Dict): Promise<Tickers>;
    /**
     * @method
     * @name upbit#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://global-docs.upbit.com/reference/websocket-trade
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: Dict): Promise<Trade[]>;
    /**
     * @method
     * @name upbit#watchTradesForSymbols
     * @description get the list of most recent trades for a list of symbols
     * @see https://global-docs.upbit.com/reference/websocket-trade
     * @param {string[]} symbols unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    watchTradesForSymbols(symbols: string[], since?: Int, limit?: Int, params?: Dict): Promise<Trade[]>;
    /**
     * @method
     * @name upbit#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://global-docs.upbit.com/reference/websocket-orderbook
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
     */
    watchOrderBook(symbol: string, limit?: Int, params?: Dict): Promise<OrderBook>;
    /**
     * @method
     * @name upbit#watchOHLCV
     * @description watches information an OHLCV with timestamp, openingPrice, highPrice, lowPrice, tradePrice, baseVolume in 1s.
     * @see https://docs.upbit.com/kr/reference/websocket-candle for Upbit KR
     * @see https://global-docs.upbit.com/reference/websocket-candle for Upbit Global
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {string} timeframe specifies the OHLCV candle interval to watch. As of now, Upbit only supports 1s candles.
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {OHLCV[]} a list of [OHLCV structures]{@link https://docs.ccxt.com/?id=ohlcv-structure}
     */
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: Dict): Promise<OHLCV[]>;
    handleTicker(client: Client, message: Dict): void;
    handleOrderBook(client: Client, message: Dict): void;
    handleTrades(client: Client, message: Dict): void;
    handleOHLCV(client: Client, message: Dict): void;
    authenticate(params?: Dict): Promise<import("../base/ws/WsClient.js").default>;
    watchPrivate(symbol: Str, channel: string, messageHash: string, params?: Dict): Promise<any>;
    /**
     * @method
     * @name upbit#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://global-docs.upbit.com/reference/websocket-myorder
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Order[]>;
    /**
     * @method
     * @name upbit#watchMyTrades
     * @description watches information on multiple trades made by the user
     * @see https://global-docs.upbit.com/reference/websocket-myorder
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    watchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Trade[]>;
    parseWsOrderStatus(status: Str): string | undefined;
    parseWsOrder(order: Dict, market?: Market): Order;
    parseWsTrade(trade: Dict, market?: Market): Trade;
    handleMyOrder(client: Client, message: Dict): void;
    handleMyTrade(client: Client, message: Dict): void;
    handleOrder(client: Client, message: Dict): void;
    /**
     * @method
     * @name upbit#watchBalance
     * @see https://global-docs.upbit.com/reference/websocket-myasset
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    watchBalance(params?: Dict): Promise<Balances>;
    handleBalance(client: Client, message: Dict): void;
    handleMessage(client: Client, message: Dict): void;
}
