import idexRest from '../idex.js';
import { Int } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class idex extends idexRest {
    describe(): any;
    subscribe(subscribeObject: any, messageHash: any, subscription?: boolean): Promise<any>;
    subscribePrivate(subscribeObject: any, messageHash: any): Promise<any>;
    watchTicker(symbol: string, params?: {}): Promise<any>;
    handleTicker(client: Client, message: any): void;
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    handleTrade(client: Client, message: any): void;
    parseWsTrade(trade: any): {
        info: any;
        timestamp: number;
        datetime: string;
        symbol: any;
        id: string;
        order: any;
        type: any;
        takerOrMaker: string;
        side: string;
        price: number;
        amount: number;
        cost: number;
        fee: {
            currency: string;
            cost: number;
        };
    };
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    handleOHLCV(client: Client, message: any): void;
    handleSubscribeMessage(client: Client, message: any): void;
    fetchOrderBookSnapshot(client: any, symbol: any, params?: {}): Promise<void>;
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<any>;
    handleOrderBook(client: Client, message: any): void;
    handleOrderBookMessage(client: Client, message: any, orderbook: any): void;
    handleDelta(bookside: any, delta: any): void;
    handleDeltas(bookside: any, deltas: any): void;
    authenticate(params?: {}): Promise<any>;
    watchOrders(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    handleOrder(client: Client, message: any): void;
    watchTransactions(code?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    handleTransaction(client: Client, message: any): void;
    handleMessage(client: Client, message: any): void;
}
