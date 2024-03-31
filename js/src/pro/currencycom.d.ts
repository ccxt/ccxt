import currencycomRest from '../currencycom.js';
import type { Int, OrderBook, Trade, Ticker, OHLCV, Balances } from '../base/types.js';
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
        symbol: string;
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
    handleTrades(client: Client, message: any): void;
    findTimeframe(timeframe: any, defaultTimeframes?: any): string;
    handleOHLCV(client: Client, message: any): void;
    requestId(): any;
    watchPublic(destination: any, symbol: any, params?: {}): Promise<any>;
    watchPrivate(destination: any, params?: {}): Promise<any>;
    watchBalance(params?: {}): Promise<Balances>;
    watchTicker(symbol: string, params?: {}): Promise<Ticker>;
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    handleDeltas(bookside: any, deltas: any): void;
    handleOrderBook(client: Client, message: any): void;
    handleMessage(client: Client, message: any): void;
}
