import p2bRest from '../p2b.js';
import type { Int, OHLCV, OrderBook, Trade, Ticker, Strings, Tickers } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class p2b extends p2bRest {
    describe(): any;
    /**
     * @ignore
     * @method
     * @description Connects to a websocket channel
     * @param {string} name name of the channel
     * @param {string} messageHash string to look up in handler
     * @param {string[]|float[]} request endpoint parameters
     * @param {object} [params] extra parameters specific to the p2b api
     * @returns {object} data from the websocket stream
     */
    subscribe(name: string, messageHash: string, request: any, params?: {}): Promise<any>;
    /**
     * @method
     * @name p2b#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market. Can only subscribe to one timeframe at a time for each symbol
     * @see https://github.com/P2B-team/P2B-WSS-Public/blob/main/wss_documentation.md#kline-candlestick
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe 15m, 30m, 1h or 1d
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    /**
     * @method
     * @name p2b#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://github.com/P2B-team/P2B-WSS-Public/blob/main/wss_documentation.md#last-price
     * @see https://github.com/P2B-team/P2B-WSS-Public/blob/main/wss_documentation.md#market-status
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {object} [params.method] 'state' (default) or 'price'
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name p2b#watchTickers
     * @see https://github.com/P2B-team/P2B-WSS-Public/blob/main/wss_documentation.md#last-price
     * @see https://github.com/P2B-team/P2B-WSS-Public/blob/main/wss_documentation.md#market-status
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @param {string[]} [symbols] unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {object} [params.method] 'state' (default) or 'price'
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name p2b#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://github.com/P2B-team/P2B-WSS-Public/blob/main/wss_documentation.md#deals
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name p2b#watchTradesForSymbols
     * @description get the list of most recent trades for a list of symbols
     * @see https://github.com/P2B-team/P2B-WSS-Public/blob/main/wss_documentation.md#deals
     * @param {string[]} symbols unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    watchTradesForSymbols(symbols: string[], since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name p2b#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://github.com/P2B-team/P2B-WSS-Public/blob/main/wss_documentation.md#depth-of-market
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] 1-100, default=100
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.interval] 0, 0.00000001, 0.0000001, 0.000001, 0.00001, 0.0001, 0.001, 0.01, 0.1, interval of precision for order, default=0.001
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    handleOHLCV(client: Client, message: any): any;
    handleTrade(client: Client, message: any): any;
    handleTicker(client: Client, message: any): any;
    handleOrderBook(client: Client, message: any): void;
    handleMessage(client: Client, message: any): void;
    handleErrorMessage(client: Client, message: any): boolean;
    ping(client: Client): {
        method: string;
        params: any[];
        id: number;
    };
    handlePong(client: Client, message: any): any;
    onError(client: Client, error: any): void;
    onClose(client: Client, error: any): void;
}
