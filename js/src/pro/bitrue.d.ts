import bitrueRest from '../bitrue.js';
import type { Int, Str, OrderBook, Order, Balances } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class bitrue extends bitrueRest {
    describe(): any;
    /**
     * @method
     * @name bitrue#watchBalance
     * @description watch balance and get the amount of funds available for trading or funds locked in orders
     * @see https://github.com/Bitrue-exchange/Spot-official-api-docs#balance-update
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    watchBalance(params?: {}): Promise<Balances>;
    handleBalance(client: Client, message: any): void;
    parseWSBalances(balances: any): void;
    /**
     * @method
     * @name bitrue#watchOrders
     * @description watches information on user orders
     * @see https://github.com/Bitrue-exchange/Spot-official-api-docs#order-update
     * @param {string} symbol
     * @param {int} [since] timestamp in ms of the earliest order
     * @param {int} [limit] the maximum amount of orders to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order structure]{@link https://docs.ccxt.com/#/?id=order-structure} indexed by market symbols
     */
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    handleOrder(client: Client, message: any): void;
    parseWsOrder(order: any, market?: any): Order;
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    handleOrderBook(client: Client, message: any): void;
    parseWsOrderType(typeId: any): string;
    parseWsOrderStatus(status: any): string;
    handlePing(client: Client, message: any): void;
    pong(client: any, message: any): Promise<void>;
    handleMessage(client: Client, message: any): void;
    authenticate(params?: {}): Promise<any>;
    keepAliveListenKey(params?: {}): Promise<void>;
}
