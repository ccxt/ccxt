import Exchange from './abstract/upbit.js';
import type { Balances, Currency, Dict, Dictionary, Int, Market, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, TradingFeeInterface, Transaction, int } from './base/types.js';
/**
 * @class upbit
 * @augments Exchange
 */
export default class upbit extends Exchange {
    describe(): any;
    fetchCurrency(code: string, params?: {}): Promise<{
        info: any;
        id: string;
        code: string;
        name: string;
        active: boolean;
        fee: number;
        precision: any;
        limits: {
            withdraw: {
                min: number;
                max: number;
            };
        };
    }>;
    fetchCurrencyById(id: string, params?: {}): Promise<{
        info: any;
        id: string;
        code: string;
        name: string;
        active: boolean;
        fee: number;
        precision: any;
        limits: {
            withdraw: {
                min: number;
                max: number;
            };
        };
    }>;
    fetchMarket(symbol: string, params?: {}): Promise<import("./base/types.js").MarketInterface>;
    fetchMarketById(id: string, params?: {}): Promise<import("./base/types.js").MarketInterface>;
    fetchMarkets(params?: {}): Promise<Market[]>;
    parseMarket(market: Dict): Market;
    parseBalance(response: any): Balances;
    fetchBalance(params?: {}): Promise<Balances>;
    fetchOrderBooks(symbols?: Strings, limit?: Int, params?: {}): Promise<Dictionary<OrderBook>>;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    parseTrade(trade: Dict, market?: Market): Trade;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchTradingFee(symbol: string, params?: {}): Promise<TradingFeeInterface>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchDeposit(id: string, code?: Str, params?: {}): Promise<Transaction>;
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchWithdrawal(id: string, code?: Str, params?: {}): Promise<Transaction>;
    parseTransactionStatus(status: Str): string;
    parseTransaction(transaction: Dict, currency?: Currency): Transaction;
    parseOrderStatus(status: Str): string;
    parseOrder(order: Dict, market?: Market): Order;
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchCanceledOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    fetchDepositAddresses(codes?: Strings, params?: {}): Promise<Dictionary<any>>;
    parseDepositAddress(depositAddress: any, currency?: Currency): {
        currency: string;
        address: string;
        tag: string;
        network: string;
        info: any;
    };
    fetchDepositAddress(code: string, params?: {}): Promise<{
        currency: string;
        address: string;
        tag: string;
        network: string;
        info: any;
    }>;
    createDepositAddress(code: string, params?: {}): Promise<{
        currency: string;
        address: string;
        tag: string;
        network: string;
        info: any;
    }>;
    withdraw(code: string, amount: number, address: string, tag?: any, params?: {}): Promise<Transaction>;
    nonce(): number;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
}
