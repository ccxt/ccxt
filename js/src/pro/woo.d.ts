import wooRest from '../woo.js';
export default class woo extends wooRest {
    describe(): any;
    requestId(url: any): any;
    watchPublic(messageHash: any, message: any): Promise<any>;
    watchOrderBook(symbol: any, limit?: any, params?: {}): Promise<any>;
    handleOrderBook(client: any, message: any): void;
    watchTicker(symbol: any, params?: {}): Promise<any>;
    parseWsTicker(ticker: any, market?: any): import("../base/types.js").Ticker;
    handleTicker(client: any, message: any): any;
    watchTickers(symbols?: string[], params?: {}): Promise<any>;
    handleTickers(client: any, message: any): void;
    watchOHLCV(symbol: any, timeframe?: string, since?: any, limit?: any, params?: {}): Promise<any>;
    handleOHLCV(client: any, message: any): void;
    watchTrades(symbol: any, since?: any, limit?: any, params?: {}): Promise<any>;
    handleTrade(client: any, message: any): void;
    parseWsTrade(trade: any, market?: any): import("../base/types.js").Trade;
    checkRequiredUid(error?: boolean): boolean;
    authenticate(params?: {}): any;
    watchPrivate(messageHash: any, message: any, params?: {}): Promise<any>;
    watchOrders(symbol?: string, since?: any, limit?: any, params?: {}): Promise<any>;
    parseWsOrder(order: any, market?: any): {
        info: any;
        symbol: any;
        id: string;
        clientOrderId: string;
        timestamp: number;
        datetime: string;
        lastTradeTimestamp: number;
        type: string;
        timeInForce: any;
        postOnly: any;
        side: string;
        price: number;
        stopPrice: any;
        triggerPrice: any;
        amount: number;
        cost: string;
        average: any;
        filled: number;
        remaining: number;
        status: any;
        fee: {
            cost: string;
            currency: string;
        };
        trades: any;
    };
    handleOrderUpdate(client: any, message: any): void;
    handleOrder(client: any, message: any): void;
    handleMessage(client: any, message: any): any;
    ping(client: any): {
        event: string;
    };
    handlePing(client: any, message: any): {
        event: string;
    };
    handlePong(client: any, message: any): any;
    handleSubscribe(client: any, message: any): any;
    handleAuth(client: any, message: any): void;
}
