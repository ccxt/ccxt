import currencycomRest from '../currencycom.js';
import type { Int, OrderBook, Trade, Ticker, OHLCV, Balances } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class currencycom extends currencycomRest {
    describe(): any;
    ping(client: Client): {
        destination: string;
        correlationId: any;
        payload: {};
    };
    handlePong(client: Client, message: any): any;
    handleBalance(client: Client, message: any, subscription: any): void;
    handleTicker(client: Client, message: any, subscription: any): void;
    handleTrade(trade: any, market?: any): {
        info: any;
        timestamp: number;
        datetime: string;
        symbol: string;
        id: string;
        order: string;
        type: any;
        takerOrMaker: any;
        side: string;
        price: number;
        amount: number;
        cost: number;
        fee: any;
    };
    handleTrades(client: Client, message: any): void;
    findTimeframe(timeframe: any, defaultTimeframes?: any): string;
    handleOHLCV(client: Client, message: any): void;
    requestId(): any;
    watchPublic(destination: any, symbol: any, params?: {}): Promise<any>;
    watchPrivate(destination: any, params?: {}): Promise<any>;
    /**
     * @method
     * @name currencycom#watchBalance
     * @description watch balance and get the amount of funds available for trading or funds locked in orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    watchBalance(params?: {}): Promise<Balances>;
    /**
     * @method
     * @name currencycom#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name currencycom#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name currencycom#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name currencycom#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    handleDeltas(bookside: any, deltas: any): void;
    handleOrderBook(client: Client, message: any): void;
    handleMessage(client: Client, message: any): void;
}
