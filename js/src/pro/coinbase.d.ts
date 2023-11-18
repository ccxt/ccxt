import coinbaseRest from '../coinbase.js';
export default class coinbase extends coinbaseRest {
    describe(): undefined;
    subscribe(name: any, symbol?: undefined, params?: {}): Promise<any>;
    watchTicker(symbol: any, params?: {}): Promise<any>;
    watchTickers(symbols?: undefined, params?: {}): Promise<any>;
    handleTickers(client: any, message: any): any;
    parseWsTicker(ticker: any, market?: undefined): import("../base/types.js").Ticker;
    watchTrades(symbol: any, since?: undefined, limit?: undefined, params?: {}): Promise<any>;
    watchOrders(symbol?: undefined, since?: undefined, limit?: undefined, params?: {}): Promise<any>;
    watchOrderBook(symbol: any, limit?: undefined, params?: {}): Promise<any>;
    handleTrade(client: any, message: any): any;
    handleOrder(client: any, message: any): any;
    parseWsOrder(order: any, market?: undefined): import("../base/types.js").Order;
    handleOrderBookHelper(orderbook: any, updates: any): void;
    handleOrderBook(client: any, message: any): any;
    handleSubscriptionStatus(client: any, message: any): any;
    handleMessage(client: any, message: any): any;
}
