import hollaexRest from '../hollaex.js';
export default class hollaex extends hollaexRest {
    describe(): any;
    watchOrderBook(symbol: any, limit?: any, params?: {}): Promise<any>;
    handleOrderBook(client: any, message: any): void;
    watchTrades(symbol: any, since?: any, limit?: any, params?: {}): Promise<any>;
    handleTrades(client: any, message: any): void;
    watchMyTrades(symbol?: string, since?: any, limit?: any, params?: {}): Promise<any>;
    handleMyTrades(client: any, message: any, subscription?: any): number;
    watchOrders(symbol?: string, since?: any, limit?: any, params?: {}): Promise<any>;
    handleOrder(client: any, message: any, subscription?: any): number;
    watchBalance(params?: {}): Promise<any>;
    handleBalance(client: any, message: any): void;
    watchPublic(messageHash: any, params?: {}): Promise<any>;
    watchPrivate(messageHash: any, params?: {}): Promise<any>;
    handleErrorMessage(client: any, message: any): any;
    handleMessage(client: any, message: any): void;
    ping(client: any): {
        op: string;
    };
    handlePong(client: any, message: any): any;
    onError(client: any, error: any): void;
    onClose(client: any, error: any): void;
}
