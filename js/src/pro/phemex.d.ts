import phemexRest from '../phemex.js';
import type { Int, Str, OrderBook, Order, Trade, Ticker, OHLCV, Balances, Dict, Strings, Tickers } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class phemex extends phemexRest {
    describe(): any;
    fromEn(en: any, scale: any): string;
    fromEp(ep: any, market?: any): any;
    fromEv(ev: any, market?: any): any;
    fromEr(er: any, market?: any): any;
    requestId(): any;
    parseSwapTicker(ticker: any, market?: any): Dict;
    parsePerpetualTicker(ticker: any, market?: any): Dict;
    handleTicker(client: Client, message: any): void;
    /**
     * @method
     * @name phemex#watchBalance
     * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#subscribe-account-order-position-aop
     * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Contract-API-en.md#subscribe-account-order-position-aop
     * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Spot-API-en.md#subscribe-wallet-order-messages
     * @description watch balance and get the amount of funds available for trading or funds locked in orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.settle] set to USDT to use hedged perpetual api
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    watchBalance(params?: {}): Promise<Balances>;
    handleBalance(type: any, client: any, message: any): void;
    handleTrades(client: Client, message: any): void;
    handleOHLCV(client: Client, message: any): void;
    /**
     * @method
     * @name phemex#watchTicker
     * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#subscribe-24-hours-ticker
     * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Contract-API-en.md#subscribe-24-hours-ticker
     * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Spot-API-en.md#subscribe-24-hours-ticker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name phemex#watchTickers
     * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#subscribe-24-hours-ticker
     * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Contract-API-en.md#subscribe-24-hours-ticker
     * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Spot-API-en.md#subscribe-24-hours-ticker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @param {string[]} [symbols] unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.channel] the channel to subscribe to, tickers by default. Can be tickers, sprd-tickers, index-tickers, block-tickers
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name phemex#watchTrades
     * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#subscribe-trade
     * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Contract-API-en.md#subscribe-trade
     * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Spot-API-en.md#subscribe-trade
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
     * @name phemex#watchOrderBook
     * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Spot-API-en.md#subscribe-orderbook
     * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#subscribe-orderbook-for-new-model
     * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Contract-API-en.md#subscribe-30-levels-orderbook
     * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Contract-API-en.md#subscribe-full-orderbook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name phemex#watchOHLCV
     * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#subscribe-kline
     * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Contract-API-en.md#subscribe-kline
     * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Spot-API-en.md#subscribe-kline
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    customHandleDelta(bookside: any, delta: any, market?: any): void;
    customHandleDeltas(bookside: any, deltas: any, market?: any): void;
    handleOrderBook(client: Client, message: any): void;
    /**
     * @method
     * @name phemex#watchMyTrades
     * @description watches information on multiple trades made by the user
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    watchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    handleMyTrades(client: Client, message: any): void;
    /**
     * @method
     * @name phemex#watchOrders
     * @description watches information on multiple orders made by the user
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    handleOrders(client: Client, message: any): void;
    parseWSSwapOrder(order: any, market?: any): Order;
    handleMessage(client: Client, message: any): void;
    handleAuthenticate(client: Client, message: any): void;
    subscribePrivate(type: any, messageHash: any, params?: {}): Promise<any>;
    authenticate(params?: {}): Promise<any>;
}
