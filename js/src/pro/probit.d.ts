import probitRest from '../probit.js';
export default class probit extends probitRest {
    describe(): any;
    watchBalance(params?: {}): Promise<any>;
    handleBalance(client: any, message: any): void;
    parseWSBalance(message: any): void;
    watchTicker(symbol: any, params?: {}): Promise<any>;
    handleTicker(client: any, message: any): void;
    watchTrades(symbol: any, since?: any, limit?: any, params?: {}): Promise<any>;
    handleTrades(client: any, message: any): void;
    watchMyTrades(symbol?: any, since?: any, limit?: any, params?: {}): Promise<any>;
    handleMyTrades(client: any, message: any): void;
    watchOrders(symbol?: any, since?: any, limit?: any, params?: {}): Promise<any>;
    handleOrders(client: any, message: any): void;
    watchOrderBook(symbol: any, limit?: any, params?: {}): Promise<any>;
    subscribeOrderBook(symbol: any, messageHash: any, filter: any, params?: {}): Promise<any>;
    handleOrderBook(client: any, message: any, orderBook: any): void;
    handleBidAsks(bookSide: any, bidAsks: any): void;
    handleDelta(orderbook: any, delta: any): void;
    handleErrorMessage(client: any, message: any): void;
    handleAuthenticate(client: any, message: any): void;
    handleMarketData(client: any, message: any): void;
    handleMessage(client: any, message: any): any;
    authenticate(params?: {}): Promise<any>;
}
