import Exchange from './abstract/coinmetro.js';
import { Balances, Currencies, Currency, Dict, IndexType, Int, Market, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade } from './base/types.js';
/**
 * @class coinmetro
 * @augments Exchange
 */
export default class coinmetro extends Exchange {
    describe(): any;
    fetchCurrencies(params?: {}): Promise<Currencies>;
    fetchMarkets(params?: {}): Promise<Market[]>;
    parseMarket(market: any): Market;
    parseMarketId(marketId: any): {
        baseId: any;
        quoteId: any;
    };
    parseMarketPrecisionAndLimits(currencyId: any): {
        precision: number;
        minLimit: number;
    };
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseTrade(trade: any, market?: Market): Trade;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseBidsAsks(bidasks: any, priceKey?: IndexType, amountKey?: IndexType, countOrIdKey?: IndexType): any[];
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    fetchBidsAsks(symbols?: Strings, params?: {}): Promise<Tickers>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    fetchBalance(params?: {}): Promise<Balances>;
    parseBalance(balances: any): Balances;
    fetchLedger(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    parseLedgerEntry(item: any, currency?: Currency): {
        id: string;
        timestamp: number;
        datetime: string;
        direction: string;
        account: string;
        referenceId: string;
        referenceAccount: string;
        type: string;
        currency: string;
        amount: number;
        before: number;
        after: number;
        status: string;
        fee: any;
        info: import("./base/types.js").Dictionary<any>;
    };
    parseLedgerEntryDescription(description: any): any[];
    parseLedgerEntryType(type: any): string;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    handleCreateOrderSide(sellingCurrency: any, buyingCurrency: any, sellingQty: any, buyingQty: any, request?: {}): {};
    encodeOrderTimeInForce(timeInForce: any): any;
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    closePosition(symbol: string, side?: OrderSide, params?: {}): Promise<Order>;
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchCanceledAndClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    parseOrder(order: any, market?: Market): Order;
    parseOrderTimeInForce(timeInForce: any): any;
    borrowCrossMargin(code: string, amount: number, params?: {}): Promise<any>;
    parseMarginLoan(info: any, currency?: Currency): {
        id: any;
        currency: string;
        amount: any;
        symbol: any;
        timestamp: any;
        datetime: any;
        info: any;
    };
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(code: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): any;
}
