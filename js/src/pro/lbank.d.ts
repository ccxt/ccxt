import lbankRest from '../lbank.js';
import type { Int, Str, Trade, OrderBook, Order, OHLCV, Ticker } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class lbank extends lbankRest {
    describe(): any;
    requestId(): any;
    /**
     * @method
     * @name lbank#fetchOHLCVWs
     * @see https://www.lbank.com/en-US/docs/index.html#request-amp-subscription-instruction
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCVWs(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    /**
     * @method
     * @name lbank#watchOHLCV
     * @see https://www.lbank.com/en-US/docs/index.html#subscription-of-k-line-data
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    handleOHLCV(client: any, message: any): void;
    /**
     * @method
     * @name lbank#fetchTickerWs
     * @see https://www.lbank.com/en-US/docs/index.html#request-amp-subscription-instruction
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the cex api endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTickerWs(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name lbank#watchTicker
     * @see https://www.lbank.com/en-US/docs/index.html#market
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} params extra parameters specific to the lbank api endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
     */
    watchTicker(symbol: string, params?: {}): Promise<Ticker>;
    handleTicker(client: any, message: any): void;
    parseWsTicker(ticker: any, market?: any): Ticker;
    /**
     * @method
     * @name lbank#fetchTradesWs
     * @description get the list of most recent trades for a particular symbol
     * @see https://www.lbank.com/en-US/docs/index.html#request-amp-subscription-instruction
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    fetchTradesWs(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name lbank#watchTrades
     * @see https://www.lbank.com/en-US/docs/index.html#trade-record
     * @description get the list of most recent trades for a particular symbol
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    handleTrades(client: any, message: any): void;
    parseWsTrade(trade: any, market?: any): Trade;
    /**
     * @method
     * @name lbank#watchOrders
     * @see https://www.lbank.com/en-US/docs/index.html#update-subscribed-orders
     * @description get the list of trades associated with the user
     * @param {string} [symbol] unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} params extra parameters specific to the lbank api endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    handleOrders(client: any, message: any): void;
    parseWsOrder(order: any, market?: any): Order;
    parseWsOrderStatus(status: any): string;
    /**
     * @method
     * @name lbank#fetchOrderBookWs
     * @see https://www.lbank.com/en-US/docs/index.html#request-amp-subscription-instruction
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int|undefined} limit the maximum amount of order book entries to return
     * @param {object} params extra parameters specific to the lbank api endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
     */
    fetchOrderBookWs(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name lbank#watchOrderBook
     * @see https://www.lbank.com/en-US/docs/index.html#market-depth
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int|undefined} limit the maximum amount of order book entries to return
     * @param {object} params extra parameters specific to the lbank api endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
     */
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    handleOrderBook(client: any, message: any): void;
    handleErrorMessage(client: any, message: any): void;
    handlePing(client: Client, message: any): Promise<void>;
    handleMessage(client: any, message: any): void;
    authenticate(params?: {}): Promise<any>;
}
