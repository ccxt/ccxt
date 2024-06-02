import lunoRest from '../luno.js';
import type { Int, Trade, OrderBook, IndexType } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class luno extends lunoRest {
    describe(): any;
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    handleTrades(client: Client, message: any, subscription: any): void;
    parseTrade(trade: any, market?: any): Trade;
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    handleOrderBook(client: Client, message: any, subscription: any): void;
    customParseOrderBook(orderbook: any, symbol: any, timestamp?: any, bidsKey?: string, asksKey?: IndexType, priceKey?: IndexType, amountKey?: IndexType, countOrIdKey?: IndexType): {
        symbol: any;
        bids: any[];
        asks: any[];
        timestamp: any;
        datetime: string;
        nonce: any;
    };
    parseBidsAsks(bidasks: any, priceKey?: IndexType, amountKey?: IndexType, thirdKey?: IndexType): any[];
    customParseBidAsk(bidask: any, priceKey?: IndexType, amountKey?: IndexType, thirdKey?: IndexType): number[];
    handleDelta(orderbook: any, message: any): void;
    handleMessage(client: Client, message: any): void;
}
