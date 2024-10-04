import alephxRest from '../alephx.js';
import { Int, Trade, Order, Str, Dict } from '../base/types.js';
export default class alephx extends alephxRest {
    describe(): any;
    subscribe(name: string, isPrivate: boolean, symbol?: any, params?: {}): Promise<any>;
    createWSAuth(): Dict;
    watchMyTrades(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    handleTrade(client: any, message: any): any;
    parseWsTrade(trade: any, market?: any): Trade;
    handleOrder(client: any, message: any): any;
    parseWsOrder(order: any, market?: any): Order;
    handleSubscriptionStatus(client: any, message: any): any;
    handleHeartbeats(client: any, message: any): any;
    handleMessage(client: any, message: any): void;
}
