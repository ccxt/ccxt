import alpacaRest from '../alpaca.js';
import type { Int, Str, Ticker, OrderBook, Order, Trade, OHLCV } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class alpaca extends alpacaRest {
    describe(): any;
    /**
     * @method
     * @name alpaca#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.alpaca.markets/docs/real-time-crypto-pricing-data#quotes
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchTicker(symbol: string, params?: {}): Promise<Ticker>;
    handleTicker(client: Client, message: any): void;
    parseTicker(ticker: any, market?: any): Ticker;
    /**
     * @method
     * @name alpaca#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://docs.alpaca.markets/docs/real-time-crypto-pricing-data#bars
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
     * @name alpaca#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.alpaca.markets/docs/real-time-crypto-pricing-data#orderbooks
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return.
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    handleOrderBook(client: Client, message: any): void;
    handleDelta(bookside: any, delta: any): void;
    handleDeltas(bookside: any, deltas: any): void;
    /**
     * @method
     * @name alpaca#watchTrades
     * @description watches information on multiple trades made in a market
     * @see https://docs.alpaca.markets/docs/real-time-crypto-pricing-data#trades
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    handleTrades(client: Client, message: any): void;
    /**
     * @method
     * @name alpaca#watchMyTrades
     * @description watches information on multiple trades made by the user
     * @see https://docs.alpaca.markets/docs/websocket-streaming#trade-updates
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.unifiedMargin] use unified margin account
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    watchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name alpaca#watchOrders
     * @description watches information on multiple orders made by the user
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    handleTradeUpdate(client: Client, message: any): void;
    handleOrder(client: Client, message: any): void;
    handleMyTrade(client: Client, message: any): void;
    parseMyTrade(trade: any, market?: any): Trade;
    authenticate(url: any, params?: {}): Promise<any>;
    handleErrorMessage(client: Client, message: any): void;
    handleConnected(client: Client, message: any): any;
    handleCryptoMessage(client: Client, message: any): void;
    handleTradingMessage(client: Client, message: any): void;
    handleMessage(client: Client, message: any): void;
    handleAuthenticate(client: Client, message: any): void;
    handleSubscription(client: Client, message: any): any;
}
