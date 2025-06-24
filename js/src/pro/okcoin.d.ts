import okcoinRest from '../okcoin.js';
import type { Int, Str, OrderBook, Order, Trade, Ticker, OHLCV, Balances } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class okcoin extends okcoinRest {
    describe(): any;
    subscribe(channel: any, symbol: any, params?: {}): Promise<any>;
    /**
     * @method
     * @name okcoin#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://www.okcoin.com/docs-v5/en/#websocket-api-public-channel-trades-channel
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name okcoin#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://www.okcoin.com/docs-v5/en/#websocket-api-private-channel-order-channel
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    handleOrders(client: Client, message: any, subscription?: any): void;
    /**
     * @method
     * @name okcoin#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://www.okcoin.com/docs-v5/en/#websocket-api-public-channel-tickers-channel
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchTicker(symbol: string, params?: {}): Promise<Ticker>;
    handleTrade(client: Client, message: any): any;
    handleTicker(client: Client, message: any): any;
    /**
     * @method
     * @name okcoin#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://www.okcoin.com/docs-v5/en/#websocket-api-public-channel-candlesticks-channel
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    handleOHLCV(client: Client, message: any): void;
    /**
     * @method
     * @name okcoin#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://www.okcoin.com/docs-v5/en/#websocket-api-public-channel-order-book-channel
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    handleDelta(bookside: any, delta: any): void;
    handleDeltas(bookside: any, deltas: any): void;
    handleOrderBookMessage(client: Client, message: any, orderbook: any): any;
    handleOrderBook(client: Client, message: any): any;
    authenticate(params?: {}): Promise<any>;
    /**
     * @method
     * @name okcoin#watchBalance
     * @description watch balance and get the amount of funds available for trading or funds locked in orders
     * @see https://www.okcoin.com/docs-v5/en/#websocket-api-private-channel-account-channel
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    watchBalance(params?: {}): Promise<Balances>;
    subscribeToUserAccount(negotiation: any, params?: {}): Promise<any>;
    handleBalance(client: Client, message: any): void;
    handleSubscriptionStatus(client: Client, message: any): any;
    handleAuthenticate(client: Client, message: any): any;
    ping(client: Client): string;
    handlePong(client: Client, message: any): any;
    handleErrorMessage(client: Client, message: any): any;
    handleMessage(client: Client, message: any): void;
}
