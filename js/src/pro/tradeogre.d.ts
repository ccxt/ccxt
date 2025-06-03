import tradeogreRest from '../tradeogre.js';
import type { Int, OrderBook, Trade } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class tradeogre extends tradeogreRest {
    describe(): any;
    /**
     * @method
     * @name tradeogre#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://tradeogre.com/help/api
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return (not used by the exchange)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    handleOrderBook(client: Client, message: any): void;
    handleDelta(orderbook: any, delta: any): void;
    handleBidAsks(bookSide: any, bidAsks: any): void;
    getCacheIndex(orderbook: any, deltas: any): any;
    /**
     * @method
     * @name tradeogre#watchTrades
     * @description watches information on multiple trades made in a market
     * @see https://tradeogre.com/help/api
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name tradeogre#watchTradesForSymbols
     * @see https://tradeogre.com/help/api
     * @description get the list of most recent trades for a list of symbols
     * @param {string[]} symbols unified symbol of the market to fetch trades for (empty array means all markets)
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    watchTradesForSymbols(symbols: string[], since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    handleTrade(client: Client, message: any): void;
    parseWsTrade(trade: any, market?: any): Trade;
    parseWsTradeSide(side: any): string;
    handleMessage(client: Client, message: any): void;
}
