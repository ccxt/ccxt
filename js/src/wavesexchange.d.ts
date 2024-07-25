import Exchange from './abstract/wavesexchange.js';
import type { Balances, Currency, Dict, Int, Market, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, Transaction, int } from './base/types.js';
/**
 * @class wavesexchange
 * @augments Exchange
 */
export default class wavesexchange extends Exchange {
    describe(): any;
    setSandboxMode(enabled: any): void;
    getFeesForAsset(symbol: string, side: any, amount: any, price: any, params?: {}): Promise<any>;
    customCalculateFee(symbol: string, type: any, side: any, amount: any, price: any, takerOrMaker?: string, params?: {}): Promise<{
        type: string;
        currency: string;
        rate: number;
        cost: number;
    }>;
    getQuotes(): Promise<any>;
    fetchMarkets(params?: {}): Promise<Market[]>;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseOrderBookSide(bookSide: any, market?: any, limit?: Int): any[];
    checkRequiredKeys(): void;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    signIn(params?: {}): Promise<any>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    filterFutureCandles(ohlcvs: any): any[];
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    fetchDepositAddress(code: string, params?: {}): Promise<{
        address: string;
        code: string;
        currency: string;
        network: string;
        tag: any;
        info: any;
    }>;
    getMatcherPublicKey(): Promise<any>;
    getAssetBytes(currencyId: any): Uint8Array;
    getAssetId(currencyId: any): any;
    toRealCurrencyAmount(code: string, amount: number, networkCode?: any): number;
    fromRealCurrencyAmount(code: string, amountString: string): string;
    toRealSymbolPrice(symbol: string, price: number): number;
    fromRealSymbolPrice(symbol: string, priceString: string): string;
    toRealSymbolAmount(symbol: string, amount: number): number;
    fromRealSymbolAmount(symbol: string, amountString: string): string;
    safeGetDynamic(settings: any): any;
    safeGetRates(dynamic: any): any;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    fetchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    parseOrderStatus(status: Str): string;
    getSymbolFromAssetPair(assetPair: any): string;
    parseOrder(order: Dict, market?: Market): Order;
    getWavesAddress(): Promise<any>;
    fetchBalance(params?: {}): Promise<Balances>;
    setUndefinedBalancesToZero(balances: any, key?: string): any;
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseTrade(trade: Dict, market?: Market): Trade;
    parseDepositWithdrawFees(response: any, codes?: Strings, currencyIdKey?: any): any;
    fetchDepositWithdrawFees(codes?: Strings, params?: {}): Promise<any>;
    handleErrors(code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
    withdraw(code: string, amount: number, address: string, tag?: any, params?: {}): Promise<Transaction>;
    parseTransaction(transaction: Dict, currency?: Currency): Transaction;
}
