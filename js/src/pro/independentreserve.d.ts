import independentreserveRest from '../independentreserve.js';
import type { Int, OrderBook, Trade, Dict, Market, Num } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class independentreserve extends independentreserveRest {
    describe(): any;
    /**
     * @method
     * @name independentreserve#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: Dict): Promise<Trade[]>;
    handleTrades(client: Client, message: Dict): void;
    parseWsTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name independentreserve#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
     */
    watchOrderBook(symbol: string, limit?: Int, params?: Dict): Promise<OrderBook>;
    handleOrderBook(client: Client, message: Dict): void;
    valueToChecksum(value: Num): string;
    handleDelta(bookside: any, delta: Dict): void;
    handleDeltas(bookside: any, deltas: any[]): void;
    handleHeartbeat(client: Client, message: Dict): Dict;
    handleSubscriptions(client: Client, message: Dict): Dict;
    handleMessage(client: Client, message: Dict): void;
}
