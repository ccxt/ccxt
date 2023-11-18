import lunoRest from '../luno.js';
import { Int, Trade } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class luno extends lunoRest {
    describe(): undefined;
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    handleTrades(client: Client, message: any, subscription: any): void;
    parseTrade(trade: any, market?: undefined): Trade;
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<any>;
    handleOrderBook(client: Client, message: any, subscription: any): void;
    customParseOrderBook(orderbook: any, symbol: any, timestamp?: undefined, bidsKey?: string, asksKey?: string, priceKey?: string, amountKey?: string, thirdKey?: undefined): {
        symbol: any;
        bids: any;
        asks: any;
        timestamp: undefined;
        datetime: string | undefined;
        nonce: undefined;
    };
    parseBidsAsks(bidasks: any, priceKey?: string, amountKey?: string, thirdKey?: undefined): never[];
    customParseBidAsk(bidask: any, priceKey?: string, amountKey?: string, thirdKey?: undefined): import("../base/types.js").Num[];
    handleDelta(orderbook: any, message: any): any;
    handleMessage(client: Client, message: any): any;
}
