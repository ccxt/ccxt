import hollaexRest from '../hollaex.js';
import { Int } from '../base/types.js';
export default class hollaex extends hollaexRest {
    describe(): any;
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<any>;
    handleOrderBook(client: any, message: any): void;
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    handleTrades(client: any, message: any): void;
    watchMyTrades(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    handleMyTrades(client: any, message: any, subscription?: any): number;
    watchOrders(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    handleOrder(client: any, message: any, subscription?: any): number;
    watchBalance(params?: {}): Promise<any>;
    handleBalance(client: any, message: any): void;
    watchPublic(messageHash: any, params?: {}): Promise<any>;
    watchPrivate(messageHash: any, params?: {}): Promise<any>;
    handleErrorMessage(client: any, message: any): any;
    handleMessage(client: any, message: any): void;
    ping(client: any): {
        op: string;
    };
    handlePong(client: any, message: any): any;
    onError(client: any, error: any): void;
    onClose(client: any, error: any): void;
}
