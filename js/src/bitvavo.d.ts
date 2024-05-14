import Exchange from './abstract/bitvavo.js';
import type { Balances, Currencies, Currency, Dict, Int, Market, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, TradingFees, Transaction } from './base/types.js';
/**
 * @class bitvavo
 * @augments Exchange
 */
export default class bitvavo extends Exchange {
    describe(): any;
    currencyToPrecision(code: any, fee: any, networkCode?: any): string;
    amountToPrecision(symbol: any, amount: any): string;
    priceToPrecision(symbol: any, price: any): string;
    fetchTime(params?: {}): Promise<number>;
    fetchMarkets(params?: {}): Promise<Market[]>;
    parseMarkets(markets: any): any[];
    fetchCurrencies(params?: {}): Promise<Currencies>;
    parseCurrencies(currencies: any): {};
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseTrade(trade: any, market?: Market): Trade;
    fetchTradingFees(params?: {}): Promise<TradingFees>;
    parseTradingFees(fees: any, market?: any): {};
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    fetchOHLCVRequest(symbol: Str, timeframe?: string, since?: Int, limit?: Int, params?: {}): any;
    fetchOHLCV(symbol: Str, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseBalance(response: any): Balances;
    fetchBalance(params?: {}): Promise<Balances>;
    fetchDepositAddress(code: string, params?: {}): Promise<{
        currency: string;
        address: string;
        tag: string;
        network: any;
        info: any;
    }>;
    createOrderRequest(symbol: Str, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): any;
    createOrder(symbol: Str, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    editOrderRequest(id: string, symbol: any, type: any, side: any, amount?: any, price?: any, params?: {}): {};
    editOrder(id: string, symbol: string, type: OrderType, side: OrderSide, amount?: Num, price?: Num, params?: {}): Promise<Order>;
    cancelOrderRequest(id: Str, symbol?: Str, params?: {}): any;
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    cancelAllOrders(symbol?: Str, params?: {}): Promise<Order[]>;
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    fetchOrdersRequest(symbol?: Str, since?: Int, limit?: Int, params?: {}): any;
    fetchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    parseOrderStatus(status: any): string;
    parseOrder(order: any, market?: Market): Order;
    fetchMyTradesRequest(symbol?: Str, since?: Int, limit?: Int, params?: {}): any;
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    withdrawRequest(code: Str, amount: any, address: any, tag?: any, params?: {}): any;
    withdraw(code: string, amount: number, address: string, tag?: any, params?: {}): Promise<Transaction>;
    fetchWithdrawalsRequest(code?: Str, since?: Int, limit?: Int, params?: {}): any;
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchDepositsRequest(code?: Str, since?: Int, limit?: Int, params?: {}): any;
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    parseTransactionStatus(status: any): string;
    parseTransaction(transaction: any, currency?: Currency): Transaction;
    parseDepositWithdrawFee(fee: any, currency?: Currency): {
        info: any;
        withdraw: {
            fee: number;
            percentage: boolean;
        };
        deposit: {
            fee: number;
            percentage: boolean;
        };
        networks: {};
    };
    fetchDepositWithdrawFees(codes?: Strings, params?: {}): Promise<any>;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(httpCode: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): any;
    calculateRateLimiterCost(api: any, method: any, path: any, params: any, config?: {}): any;
}
