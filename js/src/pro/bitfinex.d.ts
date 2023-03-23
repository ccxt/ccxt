import bitfinexRest from '../bitfinex.js';
export default class bitfinex extends bitfinexRest {
    describe(): any;
    subscribe(channel: any, symbol: any, params?: {}): Promise<any>;
    watchTrades(symbol: any, since?: any, limit?: any, params?: {}): Promise<any>;
    watchTicker(symbol: any, params?: {}): Promise<any>;
    handleTrades(client: any, message: any, subscription: any): any;
    parseTrade(trade: any, market?: any): import("../base/types.js").Trade | {
        info: any[];
        timestamp: number;
        datetime: string;
        symbol: any;
        id: any;
        order: any;
        type: any;
        takerOrMaker: any;
        side: any;
        price: number;
        amount: number;
        cost: any;
        fee: any;
    };
    handleTicker(client: any, message: any, subscription: any): void;
    watchOrderBook(symbol: any, limit?: any, params?: {}): Promise<any>;
    handleOrderBook(client: any, message: any, subscription: any): void;
    handleHeartbeat(client: any, message: any): void;
    handleSystemStatus(client: any, message: any): any;
    handleSubscriptionStatus(client: any, message: any): any;
    authenticate(params?: {}): Promise<any>;
    handleAuthenticationMessage(client: any, message: any): void;
    watchOrder(id: any, symbol?: string, params?: {}): Promise<any>;
    watchOrders(symbol?: string, since?: any, limit?: any, params?: {}): Promise<any>;
    handleOrders(client: any, message: any, subscription: any): void;
    parseWsOrderStatus(status: any): string;
    handleOrder(client: any, order: any): any;
    handleMessage(client: any, message: any): any;
}
