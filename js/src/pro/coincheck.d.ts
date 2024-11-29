import coincheckRest from '../coincheck.js';
import type { Int, Market, OrderBook, Trade, Dict } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class coincheck extends coincheckRest {
    describe(): any;
    /**
     * @method
     * @name coincheck#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://coincheck.com/documents/exchange/api#websocket-order-book
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    handleOrderBook(client: any, message: any): void;
    /**
     * @method
     * @name coincheck#watchTrades
     * @description watches information on multiple trades made in a market
     * @see https://coincheck.com/documents/exchange/api#websocket-trades
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    handleTrades(client: Client, message: any): void;
    parseWsTrade(trade: Dict, market?: Market): Trade;
    handleMessage(client: Client, message: any): void;
}
