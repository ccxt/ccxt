import bittradeRest from '../bittrade.js';
import type { Int, OrderBook, Trade, Ticker, OHLCV, Dict, Bool } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class bittrade extends bittradeRest {
    describe(): any;
    requestId(): string;
    /**
     * @method
     * @name bittrade#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    watchTicker(symbol: string, params?: Dict): Promise<Ticker>;
    handleTicker(client: Client, message: Dict): Dict;
    /**
     * @method
     * @name bittrade#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: Dict): Promise<Trade[]>;
    handleTrades(client: Client, message: Dict): Dict;
    /**
     * @method
     * @name bittrade#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: Dict): Promise<OHLCV[]>;
    handleOHLCV(client: Client, message: Dict): void;
    /**
     * @method
     * @name bittrade#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
     */
    watchOrderBook(symbol: string, limit?: Int, params?: Dict): Promise<OrderBook>;
    handleOrderBookSnapshot(client: Client, message: Dict, subscription: Dict): void;
    watchOrderBookSnapshot(client: Client, message: Dict, subscription: Dict): Promise<any>;
    handleDelta(bookside: any, delta: any): void;
    handleDeltas(bookside: any, deltas: any): void;
    handleOrderBookMessage(client: Client, message: Dict, orderbook: any): any;
    handleOrderBook(client: Client, message: Dict): void;
    handleOrderBookSubscription(client: Client, message: Dict, subscription: Dict): void;
    handleSubscriptionStatus(client: Client, message: Dict): any;
    handleSystemStatus(client: Client, message: Dict): Dict;
    handleSubject(client: Client, message: Dict): void;
    pong(client: Client, message: Dict): Promise<void>;
    handlePing(client: Client, message: Dict): void;
    handleErrorMessage(client: Client, message: Dict): Bool;
    handleMessage(client: Client, message: any): void;
}
