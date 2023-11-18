import bitrueRest from '../bitrue.js';
import { Int, Str } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class bitrue extends bitrueRest {
    describe(): undefined;
    watchBalance(params?: {}): Promise<any>;
    handleBalance(client: Client, message: any): void;
    parseWSBalances(balances: any): void;
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    handleOrder(client: Client, message: any): void;
    parseWsOrder(order: any, market?: undefined): import("../base/types.js").Order;
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<any>;
    handleOrderBook(client: Client, message: any): void;
    parseWsOrderType(typeId: any): Str;
    parseWsOrderStatus(status: any): Str;
    handlePing(client: Client, message: any): void;
    pong(client: any, message: any): Promise<void>;
    handleMessage(client: Client, message: any): void;
    authenticate(params?: {}): Promise<any>;
    keepAliveListenKey(params?: {}): Promise<void>;
}
