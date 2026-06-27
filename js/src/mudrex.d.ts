import Exchange from './abstract/mudrex.js';
import type { Balances, Dict, Int, Market, Num, OHLCV, Order, OrderSide, OrderType, Position, Str, Strings, Ticker, Tickers, Trade, TransferEntry, int } from './base/types.js';
/**
 * @class mudrex
 * @augments Exchange
 */
export default class mudrex extends Exchange {
    leverageCache: Dict;
    describe(): any;
    mudrexSymbol(unified: string): string;
    unifiedSymbol(raw: string): string;
    resolveMarketOptional(symbol: string): Market | undefined;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: string;
        headers: any;
    };
    handleErrors(code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    fetchMarkOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    fetchMarkets(params?: {}): Promise<Market[]>;
    parseMarket(asset: Dict): Market;
    fetchBalance(params?: {}): Promise<Balances>;
    parseBalance(response: any): Balances;
    fetchLeverage(symbol: string, params?: {}): Promise<any>;
    setLeverage(leverage: Int, symbol?: Str, params?: {}): Promise<any>;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    editOrder(id: string, symbol: string, type: OrderType, side: OrderSide, amount?: Num, price?: Num, params?: {}): Promise<Order>;
    parseOrder(order: Dict, market?: Market): Order;
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    fetchOrdersByState(state: string, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchPositions(symbols?: Strings, params?: {}): Promise<Position[]>;
    parsePosition(position: Dict, market?: Market): Position;
    closePosition(symbol: string, side?: OrderSide, params?: {}): Promise<any>;
    addMargin(symbol: string, amount: number, params?: {}): Promise<any>;
    reduceMargin(symbol: string, amount: number, params?: {}): Promise<any>;
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseTrade(trade: Dict, market?: Market): Trade;
    transfer(code: string, amount: number, fromAccount: string, toAccount: string, params?: {}): Promise<TransferEntry>;
}
