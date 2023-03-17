import currencycomRest from '../currencycom.js';
export default class currencycom extends currencycomRest {
    describe(): any;
    ping(client: any): {
        destination: string;
        correlationId: any;
        payload: {};
    };
    handlePong(client: any, message: any): any;
    handleBalance(client: any, message: any, subscription: any): void;
    handleTicker(client: any, message: any, subscription: any): void;
    handleTrade(trade: any, market?: any): {
        info: any;
        timestamp: number;
        datetime: string;
        symbol: any;
        id: string;
        order: string;
        type: any;
        takerOrMaker: any;
        side: string;
        price: number;
        amount: number;
        cost: number;
        fee: any;
    };
    handleTrades(client: any, message: any, subscription: any): void;
    findTimeframe(timeframe: any, defaultTimeframes?: any): string;
    handleOHLCV(client: any, message: any): void;
    requestId(): any;
    watchPublic(destination: any, symbol: any, params?: {}): Promise<any>;
    watchPrivate(destination: any, params?: {}): Promise<any>;
    watchBalance(params?: {}): Promise<any>;
    watchTicker(symbol: any, params?: {}): Promise<any>;
    watchTrades(symbol: any, since?: any, limit?: any, params?: {}): Promise<any>;
    watchOrderBook(symbol: any, limit?: any, params?: {}): Promise<any>;
    watchOHLCV(symbol: any, timeframe?: string, since?: any, limit?: any, params?: {}): Promise<any>;
    handleDeltas(bookside: any, deltas: any): void;
    handleOrderBook(client: any, message: any): void;
    handleMessage(client: any, message: any): any;
}
