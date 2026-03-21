import aftermathRest from '../aftermath.js';
import type { Int, Strings, OrderBook, Trade, Position, Dict } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class aftermath extends aftermathRest {
    describe(): any;
    watchPublic(suffix: any, messageHash: any, message: any): Promise<any>;
    watchPublicMultiple(suffix: any, messageHashes: any, message: any): Promise<any>;
    /**
     * @method
     * @name aftermath#watchTrades
     * @description watches information on multiple trades made in a market
     * @see https://testnet.aftermath.finance/docs/#/CCXT/service%3A%3Ahandlers%3A%3Accxt%3A%3Astream%3A%3Atrades
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    handleTrade(client: Client, message: any): void;
    /**
     * @method
     * @name aftermath#watchOrderBook
     * @see https://testnet.aftermath.finance/docs/#/CCXT/service%3A%3Ahandlers%3A%3Accxt%3A%3Astream%3A%3Aorderbook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return.
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    handleOrderBook(client: Client, message: any): void;
    fetchOrderBookSnapshot(client: any, message: any, subscription: any): Promise<void>;
    handleOrderBookMessage(client: Client, message: any, orderbook: any): any;
    handleDelta(bookside: any, delta: any): void;
    handleDeltas(bookside: any, deltas: any): void;
    /**
     * @method
     * @name aftermath#watchPositions
     * @see https://testnet.aftermath.finance/docs/#/CCXT/service%3A%3Ahandlers%3A%3Accxt%3A%3Astream%3A%3Apositions
     * @description watch all open positions
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {int} [since] the earliest time in ms to fetch positions for
     * @param {int} [limit] the maximum number of position structures to retrieve
     * @param {object} params extra parameters specific to the exchange API endpoint
     * @param {int} [params.accountNumber] account number to query orders for, required
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
     */
    watchPositions(symbols?: Strings, since?: Int, limit?: Int, params?: {}): Promise<Position[]>;
    setPositionsCache(client: Client, symbols?: Strings, params?: Dict): void;
    loadPositionsSnapshot(client: any, messageHash: any, symbols: any, params: any): Promise<void>;
    handlePositions(client: any, message: any): void;
    handleErrorMessage(client: Client, message: any): boolean;
    handleMessage(client: Client, message: any): void;
}
