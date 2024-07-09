import Exchange from './abstract/bl3p.js';
import type { Balances, Int, Market, OrderBook, OrderSide, OrderType, Str, Ticker, Trade, IndexType, Currency, Num, TradingFees, Dict } from './base/types.js';
/**
 * @class bl3p
 * @augments Exchange
 */
export default class bl3p extends Exchange {
    describe(): any;
    parseBalance(response: any): Balances;
    fetchBalance(params?: {}): Promise<Balances>;
    parseBidAsk(bidask: any, priceKey?: IndexType, amountKey?: IndexType, countOrIdKey?: IndexType): number[];
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    parseTrade(trade: Dict, market?: Market): Trade;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchTradingFees(params?: {}): Promise<TradingFees>;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<import("./base/types.js").Order>;
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<import("./base/types.js").Order>;
    createDepositAddress(code: string, params?: {}): Promise<{
        info: any;
        currency: string;
        address: string;
        tag: any;
        network: any;
    }>;
    parseDepositAddress(depositAddress: any, currency?: Currency): {
        info: any;
        currency: string;
        address: string;
        tag: any;
        network: any;
    };
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
}
