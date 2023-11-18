import Exchange from './abstract/bitvavo.js';
import { Balances, Currency, Int, Market, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, Transaction } from './base/types.js';
/**
 * @class bitvavo
 * @extends Exchange
 */
export default class bitvavo extends Exchange {
    describe(): undefined;
    currencyToPrecision(code: any, fee: any, networkCode?: undefined): any;
    amountToPrecision(symbol: any, amount: any): any;
    priceToPrecision(symbol: any, price: any): any;
    fetchTime(params?: {}): Promise<Int>;
    fetchMarkets(params?: {}): Promise<never[]>;
    fetchCurrencies(params?: {}): Promise<{}>;
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    parseTicker(ticker: any, market?: Market): Ticker;
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseTrade(trade: any, market?: Market): Trade;
    fetchTradingFees(params?: {}): Promise<{}>;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseBalance(response: any): Balances;
    fetchBalance(params?: {}): Promise<Balances>;
    fetchDepositAddress(code: string, params?: {}): Promise<{
        currency: string;
        address: Str;
        tag: Str;
        network: undefined;
        info: any;
    }>;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: any, price?: undefined, params?: {}): Promise<Order>;
    editOrder(id: string, symbol: any, type: any, side: any, amount?: undefined, price?: undefined, params?: {}): Promise<Order>;
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    cancelAllOrders(symbol?: Str, params?: {}): Promise<Order[]>;
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    fetchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    parseOrderStatus(status: any): Str;
    parseOrder(order: any, market?: Market): Order;
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    withdraw(code: string, amount: any, address: any, tag?: undefined, params?: {}): Promise<Transaction>;
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    parseTransactionStatus(status: any): Str;
    parseTransaction(transaction: any, currency?: Currency): Transaction;
    parseDepositWithdrawFee(fee: any, currency?: Currency): {
        info: any;
        withdraw: {
            fee: import("./base/types.js").Num;
            percentage: boolean;
        };
        deposit: {
            fee: import("./base/types.js").Num;
            percentage: boolean;
        };
        networks: {};
    };
    fetchDepositWithdrawFees(codes?: Strings, params?: {}): Promise<any>;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: undefined, body?: undefined): {
        url: string;
        method: string;
        body: undefined;
        headers: undefined;
    };
    handleErrors(httpCode: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): undefined;
    calculateRateLimiterCost(api: any, method: any, path: any, params: any, config?: {}): any;
}
