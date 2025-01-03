import ndaxRest from '../ndax.js';
import type { Int, OrderBook, Trade, Ticker, OHLCV } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class ndax extends ndaxRest {
    describe(): any;
    requestId(): any;
    /**
     * @method
     * @name ndax#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://apidoc.ndax.io/#subscribelevel1
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchTicker(symbol: string, params?: {}): Promise<Ticker>;
    handleTicker(client: Client, message: any): void;
    /**
     * @method
     * @name ndax#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://apidoc.ndax.io/#subscribetrades
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    handleTrades(client: Client, message: any): void;
    /**
     * @method
     * @name ndax#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://apidoc.ndax.io/#subscribeticker
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
     * @name ndax#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://apidoc.ndax.io/#subscribelevel2
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    handleOrderBook(client: Client, message: any): void;
    handleOrderBookSubscription(client: Client, message: any, subscription: any): void;
    handleSubscriptionStatus(client: Client, message: any): void;
    handleMessage(client: Client, message: any): void;
}
