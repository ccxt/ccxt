import upbitRest from '../upbit.js';
export default class upbit extends upbitRest {
    describe(): any;
    watchPublic(symbol: any, channel: any, params?: {}): Promise<any>;
    watchTicker(symbol: any, params?: {}): Promise<any>;
    watchTrades(symbol: any, since?: any, limit?: any, params?: {}): Promise<any>;
    watchOrderBook(symbol: any, limit?: any, params?: {}): Promise<any>;
    handleTicker(client: any, message: any): void;
    handleOrderBook(client: any, message: any): void;
    handleTrades(client: any, message: any): void;
    handleMessage(client: any, message: any): void;
}
