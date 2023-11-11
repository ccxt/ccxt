import coinbaseRest from '../coinbase.js';
export default class coinbase extends coinbaseRest {
    describe(): any;
    subscribe(name: any, symbol?: any, params?: {}): Promise<any>;
    watchTicker(symbol: any, params?: {}): Promise<any>;
    watchTickers(symbols?: any, params?: {}): Promise<any>;
    handleTickers(client: any, message: any): any;
    parseWsTicker(ticker: any, market?: any): import("../base/types.js").Ticker;
    watchTrades(symbol: any, since?: any, limit?: any, params?: {}): Promise<any>;
    watchOrders(symbol?: any, since?: any, limit?: any, params?: {}): Promise<any>;
    watchOrderBook(symbol: any, limit?: any, params?: {}): Promise<any>;
    handleTrade(client: any, message: any): any;
    handleOrder(client: any, message: any): any;
    parseWsOrder(order: any, market?: any): import("../base/types.js").Order;
    handleOrderBookHelper(orderbook: any, updates: any): void;
    handleOrderBook(client: any, message: any): any;
    handleSubscriptionStatus(client: any, message: any): any;
    handleMessage(client: any, message: any): any;
}
