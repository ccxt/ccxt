import Exchange from './abstract/wavesexchange.js';
import type { Balances, Currency, Dict, Int, Market, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, Transaction } from './base/types.js';
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
    customPriceToPrecision(symbol: any, price: any): number;
    customAmountToPrecision(symbol: any, amount: any): number;
    customCurrencyToPrecision(code: any, amount: any, networkCode?: any): number;
    fromPrecision(amount: any, scale: any): string;
    toPrecision(amount: any, scale: any): string;
    currencyFromPrecision(currency: any, amount: any): string;
    priceFromPrecision(symbol: any, price: any): string;
    safeGetDynamic(settings: any): any;
    safeGetRates(dynamic: any): any;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<{
        info: any;
        id: string;
        clientOrderId: any;
        timestamp: any;
        datetime: any;
        lastTradeTimestamp: any;
        symbol: string;
        type: any;
        side: any;
        price: any;
        amount: any;
        cost: any;
        average: any;
        filled: any;
        remaining: any;
        status: any;
        fee: any;
        trades: any;
    }>;
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    fetchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    parseOrderStatus(status: any): string;
    getSymbolFromAssetPair(assetPair: any): string;
    parseOrder(order: any, market?: Market): Order;
    getWavesAddress(): Promise<any>;
    fetchBalance(params?: {}): Promise<Balances>;
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseTrade(trade: any, market?: Market): Trade;
    parseDepositWithdrawFees(response: any, codes?: Strings, currencyIdKey?: any): any;
    fetchDepositWithdrawFees(codes?: Strings, params?: {}): Promise<any>;
    handleErrors(code: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): any;
    withdraw(code: string, amount: number, address: string, tag?: any, params?: {}): Promise<Transaction>;
    parseTransaction(transaction: any, currency?: Currency): Transaction;
}
