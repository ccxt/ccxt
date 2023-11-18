import Exchange from './abstract/lbank.js';
import { Balances, Currency, Int, Market, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, Transaction } from './base/types.js';
/**
 * @class lbank2
 * @extends Exchange
 */
export default class lbank extends Exchange {
    describe(): undefined;
    fetchTime(params?: {}): Promise<Int>;
    fetchMarkets(params?: {}): Promise<any>;
    fetchSpotMarkets(params?: {}): Promise<never[]>;
    fetchSwapMarkets(params?: {}): Promise<never[]>;
    parseTicker(ticker: any, market?: Market): Ticker;
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseTrade(trade: any, market?: Market): Trade;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseBalance(response: any): Balances;
    fetchBalance(params?: {}): Promise<Balances>;
    parseTradingFee(fee: any, market?: Market): {
        info: any;
        symbol: string;
        maker: import("./base/types.js").Num;
        taker: import("./base/types.js").Num;
    };
    fetchTradingFee(symbol: string, params?: {}): Promise<{}>;
    fetchTradingFees(params?: {}): Promise<{}>;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: any, price?: undefined, params?: {}): Promise<Order>;
    parseOrderStatus(status: any): Str;
    parseOrder(order: any, market?: Market): Order;
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    fetchOrderSupplement(id: string, symbol?: Str, params?: {}): Promise<Order>;
    fetchOrderDefault(id: string, symbol?: Str, params?: {}): Promise<Order>;
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<any>;
    cancelAllOrders(symbol?: Str, params?: {}): Promise<any>;
    getNetworkCodeForCurrency(currencyCode: any, params: any): Str;
    fetchDepositAddress(code: string, params?: {}): Promise<any>;
    fetchDepositAddressDefault(code: string, params?: {}): Promise<{
        currency: string;
        address: Str;
        tag: Str;
        network: Str;
        info: any;
    }>;
    fetchDepositAddressSupplement(code: string, params?: {}): Promise<{
        currency: string;
        address: Str;
        tag: Str;
        network: Str;
        info: any;
    }>;
    withdraw(code: string, amount: any, address: any, tag?: undefined, params?: {}): Promise<{
        info: any;
        id: Str;
    }>;
    parseTransactionStatus(status: any, type: any): Str;
    parseTransaction(transaction: any, currency?: Currency): Transaction;
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchTransactionFees(codes?: undefined, params?: {}): Promise<undefined>;
    fetchPrivateTransactionFees(params?: {}): Promise<{
        withdraw: {};
        deposit: {};
        info: any;
    }>;
    fetchPublicTransactionFees(params?: {}): Promise<{
        withdraw: {};
        deposit: {};
        info: any;
    }>;
    fetchDepositWithdrawFees(codes?: Strings, params?: {}): Promise<any>;
    fetchPrivateDepositWithdrawFees(codes?: undefined, params?: {}): Promise<any>;
    fetchPublicDepositWithdrawFees(codes?: undefined, params?: {}): Promise<{}>;
    parsePublicDepositWithdrawFees(response: any, codes?: undefined): {};
    parseDepositWithdrawFee(fee: any, currency?: Currency): any;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: undefined, body?: undefined): {
        url: string;
        method: string;
        body: undefined;
        headers: undefined;
    };
    convertSecretToPem(secret: any): string;
    handleErrors(httpCode: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): undefined;
}
