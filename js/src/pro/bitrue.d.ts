import bitrueRest from '../bitrue.js';
import { Int } from '../base/types.js';
export default class bitrue extends bitrueRest {
    describe(): any;
    watchBalance(params?: {}): Promise<any>;
    handleBalance(client: any, message: any): void;
    parseWSBalances(balances: any): void;
    watchOrders(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    handleOrder(client: any, message: any): void;
    parseWSOrder(order: any, market?: any): any;
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<any>;
    handleOrderBook(client: any, message: any): void;
    parseWSOrderType(typeId: any): string;
    parseWSOrderStatus(status: any): string;
    handlePing(client: any, message: any): void;
    pong(client: any, message: any): Promise<void>;
    handleMessage(client: any, message: any): void;
    authenticate(params?: {}): Promise<any>;
    keepAliveListenKey(params?: {}): Promise<void>;
}
