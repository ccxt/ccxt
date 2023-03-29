import bitrueRest from '../bitrue.js';
export default class bitrue extends bitrueRest {
    describe(): any;
    watchBalance(params?: {}): Promise<any>;
    handleBalance(client: any, message: any): void;
    parseWSBalances(balances: any): void;
    watchOrders(symbol?: string, since?: any, limit?: any, params?: {}): Promise<any>;
    handleOrder(client: any, message: any): void;
    parseWSOrder(order: any, market?: any): any;
    watchOrderBook(symbol: any, limit?: any, params?: {}): Promise<any>;
    handleOrderBook(client: any, message: any): void;
    parseWSOrderType(typeId: any): string;
    parseWSOrderStatus(status: any): string;
    handlePing(client: any, message: any): void;
    pong(client: any, message: any): Promise<void>;
    handleMessage(client: any, message: any): void;
    authenticate(params?: {}): Promise<any>;
    keepAliveListenKey(params?: {}): Promise<void>;
}
