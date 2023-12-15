import blockchaincomRest from '../blockchaincom.js';
import type { IndexType, Int, Str, OrderBook, Order, Trade, Ticker, OHLCV, Balances } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class blockchaincom extends blockchaincomRest {
    describe(): any;
    watchBalance(params?: {}): Promise<Balances>;
    handleBalance(client: Client, message: any): any;
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    handleOHLCV(client: Client, message: any): any;
    watchTicker(symbol: string, params?: {}): Promise<Ticker>;
    handleTicker(client: Client, message: any): any;
    parseWsUpdatedTicker(ticker: any, lastTicker?: any, market?: any): Ticker;
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    handleTrades(client: Client, message: any): any;
    parseWsTrade(trade: any, market?: any): Trade;
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    handleOrders(client: Client, message: any): any;
    parseWsOrder(order: any, market?: any): Order;
    parseWsOrderStatus(status: any): string;
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    handleOrderBook(client: Client, message: any): any;
    parseCountedBidAsk(bidAsk: any, priceKey?: IndexType, amountKey?: IndexType, countKey?: IndexType): number[];
    parseCountedBidsAsks(bidasks: any, priceKey?: IndexType, amountKey?: IndexType, countKey?: IndexType): any[];
    parseCountedOrderBook(orderbook: any, symbol: string, timestamp?: Int, bidsKey?: IndexType, asksKey?: IndexType, priceKey?: IndexType, amountKey?: IndexType, countKey?: IndexType): {
        symbol: string;
        bids: any;
        asks: any;
        timestamp: number;
        datetime: string;
        nonce: any;
    };
    handleDelta(bookside: any, delta: any): void;
    handleDeltas(bookside: any, deltas: any): void;
    checkSequenceNumber(client: Client, message: any): void;
    handleMessage(client: Client, message: any): any;
    handleAuthenticationMessage(client: Client, message: any): void;
    authenticate(params?: {}): any;
}
