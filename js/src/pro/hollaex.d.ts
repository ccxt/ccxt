import hollaexRest from '../hollaex.js';
import { Int, Str } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class hollaex extends hollaexRest {
    describe(): undefined;
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<any>;
    handleOrderBook(client: Client, message: any): void;
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    handleTrades(client: Client, message: any): void;
    watchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    handleMyTrades(client: Client, message: any, subscription?: undefined): 0 | undefined;
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    handleOrder(client: Client, message: any, subscription?: undefined): 0 | undefined;
    watchBalance(params?: {}): Promise<any>;
    handleBalance(client: Client, message: any): void;
    watchPublic(messageHash: any, params?: {}): Promise<any>;
    watchPrivate(messageHash: any, params?: {}): Promise<any>;
    handleErrorMessage(client: Client, message: any): any;
    handleMessage(client: Client, message: any): void;
    ping(client: any): {
        op: string;
    };
    handlePong(client: Client, message: any): any;
    onError(client: Client, error: any): void;
    onClose(client: Client, error: any): void;
}
