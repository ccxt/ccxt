import upbitRest from '../upbit.js';
import { Int } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class upbit extends upbitRest {
    describe(): any;
    watchPublic(symbol: string, channel: any, params?: {}): Promise<any>;
    watchTicker(symbol: string, params?: {}): Promise<any>;
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<any>;
    handleTicker(client: Client, message: any): void;
    handleOrderBook(client: Client, message: any): void;
    handleTrades(client: Client, message: any): void;
    handleMessage(client: Client, message: any): void;
}
