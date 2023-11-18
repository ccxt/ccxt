import Exchange from './abstract/wavesexchange.js';
import { Precise } from './base/Precise.js';
import { Balances, Currency, Int, Market, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, Transaction } from './base/types.js';
/**
 * @class wavesexchange
 * @extends Exchange
 */
export default class wavesexchange extends Exchange {
    describe(): undefined;
    setSandboxMode(enabled: any): void;
    getFeesForAsset(symbol: string, side: any, amount: any, price: any, params?: {}): Promise<any>;
    customCalculateFee(symbol: string, type: any, side: any, amount: any, price: any, takerOrMaker?: string, params?: {}): Promise<{
        type: string;
        currency: string;
        rate: number;
        cost: number;
    }>;
    getQuotes(): Promise<any>;
    fetchMarkets(params?: {}): Promise<never[]>;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseOrderBookSide(bookSide: any, market?: undefined, limit?: Int): never[];
    checkRequiredKeys(): void;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: undefined, body?: undefined): {
        url: string;
        method: string;
        body: undefined;
        headers: undefined;
    };
    signIn(params?: {}): Promise<any>;
    parseTicker(ticker: any, market?: Market): Ticker;
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    filterFutureCandles(ohlcvs: any): never[];
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    fetchDepositAddress(code: string, params?: {}): Promise<{
        address: Str;
        code: string;
        currency: string;
        network: string;
        tag: undefined;
        info: any;
    } | {
        address: Str;
        code: string;
        currency: string;
        tag: undefined;
        network: Str;
        info: undefined;
    }>;
    getMatcherPublicKey(): Promise<any>;
    getAssetBytes(currencyId: any): Uint8Array;
    getAssetId(currencyId: any): any;
    customPriceToPrecision(symbol: any, price: any): number;
    customAmountToPrecision(symbol: any, amount: any): number;
    currencyToPrecision(code: any, amount: any, networkCode?: undefined): number;
    fromPrecision(amount: any, scale: any): string | undefined;
    toPrecision(amount: any, scale: any): Precise;
    currencyFromPrecision(currency: any, amount: any): string | undefined;
    priceFromPrecision(symbol: any, price: any): string | undefined;
    safeGetDynamic(settings: any): any;
    safeGetRates(dynamic: any): any;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: any, price?: undefined, params?: {}): Promise<Order>;
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<{
        info: any;
        id: Str;
        clientOrderId: undefined;
        timestamp: undefined;
        datetime: undefined;
        lastTradeTimestamp: undefined;
        symbol: Str;
        type: undefined;
        side: undefined;
        price: undefined;
        amount: undefined;
        cost: undefined;
        average: undefined;
        filled: undefined;
        remaining: undefined;
        status: undefined;
        fee: undefined;
        trades: undefined;
    }>;
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    fetchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    parseOrderStatus(status: any): Str;
    getSymbolFromAssetPair(assetPair: any): string;
    parseOrder(order: any, market?: Market): Order;
    getWavesAddress(): Promise<any>;
    fetchBalance(params?: {}): Promise<Balances>;
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseTrade(trade: any, market?: Market): Trade;
    parseDepositWithdrawFees(response: any, codes?: Strings, currencyIdKey?: undefined): any;
    fetchDepositWithdrawFees(codes?: Strings, params?: {}): Promise<any>;
    handleErrors(code: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): undefined;
    withdraw(code: string, amount: any, address: any, tag?: undefined, params?: {}): Promise<Transaction>;
    parseTransaction(transaction: any, currency?: Currency): Transaction;
}
