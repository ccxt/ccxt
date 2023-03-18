import lunoRest from '../luno.js';
export default class luno extends lunoRest {
    describe(): any;
    watchTrades(symbol: any, since?: any, limit?: any, params?: {}): Promise<any>;
    handleTrades(client: any, message: any, subscription: any): void;
    parseTrade(trade: any, market?: any): import("../base/types.js").Trade;
    watchOrderBook(symbol: any, limit?: any, params?: {}): Promise<any>;
    handleOrderBook(client: any, message: any, subscription: any): void;
    customParseOrderBook(orderbook: any, symbol: any, timestamp?: any, bidsKey?: string, asksKey?: string, priceKey?: string, amountKey?: string, thirdKey?: any): {
        symbol: any;
        bids: any;
        asks: any;
        timestamp: any;
        datetime: string;
        nonce: any;
    };
    parseBidsAsks(bidasks: any, priceKey?: string, amountKey?: string, thirdKey?: any): any[];
    customParseBidAsk(bidask: any, priceKey?: string, amountKey?: string, thirdKey?: any): number[];
    handleDelta(orderbook: any, message: any): any;
    handleMessage(client: any, message: any): any;
}
