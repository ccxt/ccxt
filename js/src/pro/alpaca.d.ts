import alpacaRest from '../alpaca.js';
export default class alpaca extends alpacaRest {
    describe(): any;
    watchTicker(symbol: any, params?: {}): Promise<any>;
    handleTicker(client: any, message: any): void;
    parseTicker(ticker: any, market?: any): import("../base/types.js").Ticker;
    watchOHLCV(symbol: any, timeframe?: string, since?: any, limit?: any, params?: {}): Promise<any>;
    handleOHLCV(client: any, message: any): void;
    watchOrderBook(symbol: any, limit?: any, params?: {}): Promise<any>;
    handleOrderBook(client: any, message: any): void;
    handleDelta(bookside: any, delta: any): void;
    handleDeltas(bookside: any, deltas: any): void;
    watchTrades(symbol: any, since?: any, limit?: any, params?: {}): Promise<any>;
    handleTrades(client: any, message: any): void;
    watchMyTrades(symbol?: string, since?: any, limit?: any, params?: {}): Promise<any>;
    watchOrders(symbol?: string, since?: any, limit?: any, params?: {}): Promise<any>;
    handleTradeUpdate(client: any, message: any): void;
    handleOrder(client: any, message: any): void;
    handleMyTrade(client: any, message: any): void;
    parseMyTrade(trade: any, market?: any): import("../base/types.js").Trade;
    authenticate(url: any, params?: {}): Promise<any>;
    handleErrorMessage(client: any, message: any): void;
    handleConnected(client: any, message: any): any;
    handleCryptoMessage(client: any, message: any): any;
    handleTradingMessage(client: any, message: any): void;
    handleMessage(client: any, message: any): any;
    handleAuthenticate(client: any, message: any): void;
    handleSubscription(client: any, message: any): any;
}
