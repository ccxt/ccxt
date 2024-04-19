import bitrueRest from '../bitrue.js';
import type { Int, Str, OrderBook, Order, Balances } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class bitrue extends bitrueRest {
    describe(): any;
    watchBalance(params?: {}): Promise<Balances>;
    handleBalance(client: Client, message: any): void;
    parseWSBalances(balances: any): void;
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
