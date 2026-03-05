import type { Dict, Int, Liquidation, OrderBook, Str, Strings, Ticker, Tickers, Trade } from '../base/types.js';
import Client from '../base/ws/Client.js';
import lighterRest from '../lighter.js';
export default class lighter extends lighterRest {
    describe(): any;
    getMessageHash(unifiedChannel: string, symbol?: Str, extra?: Str): string;
    subscribePublic(messageHash: any, params?: {}): Promise<any>;
    subscribePublicMultiple(messageHashes: any, params?: {}): Promise<any>;
    unsubscribePublic(messageHash: any, params?: {}): Promise<any>;
    handleDelta(bookside: any, delta: any): void;
    handleDeltas(bookside: any, deltas: any): void;
    handleOrderBookMessage(client: Client, message: any, orderbook: any): any;
    handleOrderBook(client: Client, message: any): void;
    /**
     * @method
     * @name lighter#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://apidocs.lighter.xyz/docs/websocket-reference#order-book
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name lighter#unWatchOrderBook
     * @description unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://apidocs.lighter.xyz/docs/websocket-reference#order-book
     * @param {string} symbol unified symbol of the market
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    unWatchOrderBook(symbol: string, params?: {}): Promise<any>;
    handleTicker(client: Client, message: any): void;
    /**
     * @method
     * @name lighter#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://apidocs.lighter.xyz/docs/websocket-reference#market-stats
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name lighter#unWatchTicker
     * @description unWatches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://apidocs.lighter.xyz/docs/websocket-reference#market-stats
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    unWatchTicker(symbol: string, params?: {}): Promise<any>;
    /**
     * @method
     * @name lighter#watchTickers
     * @see https://apidocs.lighter.xyz/docs/websocket-reference#market-stats
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @param {string[]} [symbols] unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.channel] the channel to subscribe to, tickers by default. Can be tickers, sprd-tickers, index-tickers, block-tickers
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name lighter#unWatchTickers
     * @description unWatches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://apidocs.lighter.xyz/docs/websocket-reference#market-stats
     * @param {string[]} [symbols] unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    unWatchTickers(symbols?: Strings, params?: {}): Promise<any>;
    /**
     * @method
     * @name lighter#watchMarkPrice
     * @see https://apidocs.lighter.xyz/docs/websocket-reference#market-stats
     * @description watches a mark price
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchMarkPrice(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name lighter#watchMarkPrices
     * @see https://apidocs.lighter.xyz/docs/websocket-reference#market-stats
     * @description watches mark prices
     * @param {string[]} [symbols] unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchMarkPrices(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name lighter#unWatchMarkPrice
     * @see https://apidocs.lighter.xyz/docs/websocket-reference#market-stats
     * @description unWatches a mark price
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    unWatchMarkPrice(symbol: string, params?: {}): Promise<any>;
    /**
     * @method
     * @name lighter#unWatchMarkPrices
     * @see https://apidocs.lighter.xyz/docs/websocket-reference#market-stats
     * @description unWatches mark prices
     * @param {string[]} [symbols] unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    unWatchMarkPrices(symbols?: Strings, params?: {}): Promise<any>;
    parseWsTrade(trade: any, market?: any): Trade;
    handleTrades(client: Client, message: any): void;
    /**
     * @method
     * @name lighter#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://apidocs.lighter.xyz/docs/websocket-reference#trade
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name lighter#unWatchTrades
     * @description unsubscribe from the trades channel
     * @see https://apidocs.lighter.xyz/docs/websocket-reference#trade
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    unWatchTrades(symbol: string, params?: {}): Promise<any>;
    parseWsLiquidation(liquidation: any, market?: any): Liquidation;
    handleLiquidation(client: Client, message: any): void;
    /**
     * @method
     * @name lighter#watchLiquidations
     * @description watch the public liquidations of a trading pair
     * @see https://apidocs.lighter.xyz/docs/websocket-reference#trade
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    watchLiquidations(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Liquidation[]>;
    handleErrorMessage(client: any, message: any): boolean;
    handleMessage(client: Client, message: any): void;
    handleSubscriptionStatus(client: Client, message: any): any;
    handleUnSubscription(client: Client, subscription: Dict): void;
    handlePing(client: Client, message: any): void;
    pong(client: any, message: any): Promise<void>;
}
