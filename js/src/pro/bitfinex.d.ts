import bitfinexRest from '../bitfinex.js';
import type { Int, Str, OrderBook, Order, Trade, Ticker, OHLCV, Balances, Dict, Market, BalanceAccount } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class bitfinex extends bitfinexRest {
    describe(): any;
    subscribe(channel: any, symbol: any, params?: Dict): Promise<any>;
    unSubscribe(channel: any, topic: any, symbol: any, params?: Dict): Promise<any>;
    subscribePrivate(messageHash: any): Promise<any>;
    /**
     * @method
     * @name bitfinex#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: Dict): Promise<OHLCV[]>;
    /**
     * @method
     * @name bitfinex#unWatchOHLCV
     * @description unWatches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {bool} true if successfully unsubscribed, false otherwise
     */
    unWatchOHLCV(symbol: string, timeframe?: string, params?: Dict): Promise<any>;
    handleOHLCV(client: Client, message: any[], subscription: Dict): void;
    /**
     * @method
     * @name bitfinex#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: Dict): Promise<Trade[]>;
    /**
     * @method
     * @name bitfinex#unWatchTrades
     * @description unWatches the list of most recent trades for a particular symbol
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    unWatchTrades(symbol: string, params?: Dict): Promise<any>;
    /**
     * @method
     * @name bitfinex#watchMyTrades
     * @description watches information on multiple trades made by the user
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    watchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Trade[]>;
    /**
     * @method
     * @name bitfinex#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    watchTicker(symbol: string, params?: Dict): Promise<Ticker>;
    /**
     * @method
     * @name bitfinex#unWatchTicker
     * @description unWatches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    unWatchTicker(symbol: string, params?: Dict): Promise<any>;
    handleMyTrade(client: Client, message: any[], subscription?: Dict): void;
    handleTrades(client: Client, message: any[], subscription: Dict): void;
    parseWsTrade(trade: any[], market?: Market): Trade;
    handleTicker(client: Client, message: any[], subscription: Dict): void;
    parseWsTicker(ticker: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name bitfinex#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
     */
    watchOrderBook(symbol: string, limit?: Int, params?: Dict): Promise<OrderBook>;
    handleOrderBook(client: Client, message: any[], subscription: Dict): void;
    handleChecksum(client: Client, message: any[], subscription: Dict): void;
    /**
     * @method
     * @name bitfinex#watchBalance
     * @description watch balance and get the amount of funds available for trading or funds locked in orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {str} [params.type] spot or contract if not provided this.options['defaultType'] is used
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    watchBalance(params?: Dict): Promise<Balances>;
    handleBalance(client: Client, message: any[], subscription: Dict): void;
    parseWsBalance(balance: any): BalanceAccount;
    handleSystemStatus(client: Client, message: Dict): Dict;
    handleUnsubscriptionStatus(client: Client, message: Dict): boolean;
    handleSubscriptionStatus(client: Client, message: Dict): Dict;
    authenticate(params?: Dict): Promise<any>;
    handleAuthenticationMessage(client: Client, message: Dict): void;
    /**
     * @method
     * @name bitfinex#watchOrders
     * @description watches information on multiple orders made by the user
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Order[]>;
    handleOrders(client: Client, message: any[], subscription: Dict): void;
    parseWsOrderStatus(status: Str): Str;
    parseWsOrder(order: any[], market?: Market): Order;
    handleMessage(client: Client, message: any): void;
}
