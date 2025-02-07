import bitoproRest from '../bitopro.js';
import type { Int, OrderBook, Trade, Ticker, Balances, Market, Str, Dict } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class bitopro extends bitoproRest {
    describe(): any;
    watchPublic(path: any, messageHash: any, marketId: any): Promise<any>;
    /**
     * @method
     * @name bitopro#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://github.com/bitoex/bitopro-offical-api-docs/blob/master/ws/public/order_book_stream.md
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    handleOrderBook(client: Client, message: any): void;
    /**
     * @method
     * @name bitopro#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://github.com/bitoex/bitopro-offical-api-docs/blob/master/ws/public/trade_stream.md
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    handleTrade(client: Client, message: any): void;
    /**
     * @method
     * @name bitopro#watchMyTrades
     * @description watches information on multiple trades made by the user
     * @see https://github.com/bitoex/bitopro-offical-api-docs/blob/master/ws/private/matches_stream.md
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    watchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    handleMyTrade(client: Client, message: any): void;
    parseWsTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name bitopro#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://github.com/bitoex/bitopro-offical-api-docs/blob/master/ws/public/ticker_stream.md
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchTicker(symbol: string, params?: {}): Promise<Ticker>;
    handleTicker(client: Client, message: any): void;
    authenticate(url: any): void;
    /**
     * @method
     * @name bitopro#watchBalance
     * @description watch balance and get the amount of funds available for trading or funds locked in orders
     * @see https://github.com/bitoex/bitopro-offical-api-docs/blob/master/ws/private/user_balance_stream.md
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    watchBalance(params?: {}): Promise<Balances>;
    handleBalance(client: Client, message: any): void;
    handleMessage(client: Client, message: any): void;
}
