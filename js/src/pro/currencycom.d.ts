import currencycomRest from '../currencycom.js';
import { Int } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class currencycom extends currencycomRest {
    describe(): any;
    ping(client: any): {
        destination: string;
        correlationId: any;
        payload: {};
    };
    handlePong(client: Client, message: any): any;
    handleBalance(client: Client, message: any, subscription: any): void;
    handleTicker(client: Client, message: any, subscription: any): void;
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
    handleTrades(client: Client, message: any, subscription: any): void;
    findTimeframe(timeframe: any, defaultTimeframes?: any): string;
    handleOHLCV(client: Client, message: any): void;
    requestId(): any;
    watchPublic(destination: any, symbol: any, params?: {}): Promise<any>;
    watchPrivate(destination: any, params?: {}): Promise<any>;
    watchBalance(params?: {}): Promise<any>;
    watchTicker(symbol: string, params?: {}): Promise<any>;
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<any>;
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    handleDeltas(bookside: any, deltas: any): void;
    handleOrderBook(client: Client, message: any): void;
    handleMessage(client: Client, message: any): any;
}
