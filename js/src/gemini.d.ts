import Exchange from './abstract/gemini.js';
import type { Balances, Currency, Int, Market, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, Transaction } from './base/types.js';
/**
 * @class gemini
 * @augments Exchange
 */
export default class gemini extends Exchange {
    describe(): any;
    fetchCurrencies(params?: {}): Promise<{}>;
    fetchCurrenciesFromWeb(params?: {}): Promise<{}>;
    fetchMarkets(params?: {}): Promise<any>;
    fetchMarketsFromWeb(params?: {}): Promise<any[]>;
    parseMarketActive(status: any): any;
    fetchUSDTMarkets(params?: {}): Promise<any[]>;
    fetchMarketsFromAPI(params?: {}): Promise<unknown[]>;
    parseMarket(response: any): Market;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    fetchTickerV1(symbol: string, params?: {}): Promise<Ticker>;
    fetchTickerV2(symbol: string, params?: {}): Promise<Ticker>;
    fetchTickerV1AndV2(symbol: string, params?: {}): Promise<Ticker>;
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    parseTicker(ticker: any, market?: Market): Ticker;
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    parseTrade(trade: any, market?: Market): Trade;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseBalance(response: any): Balances;
    fetchTradingFees(params?: {}): Promise<{}>;
    fetchBalance(params?: {}): Promise<Balances>;
    parseOrder(order: any, market?: Market): Order;
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: any, price?: any, params?: {}): Promise<Order>;
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    withdraw(code: string, amount: any, address: any, tag?: any, params?: {}): Promise<Transaction>;
    nonce(): number;
    fetchDepositsWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    parseTransaction(transaction: any, currency?: Currency): Transaction;
    parseTransactionStatus(status: any): string;
    parseDepositAddress(depositAddress: any, currency?: Currency): {
        currency: string;
        network: any;
        address: string;
        tag: any;
        info: any;
    };
    fetchDepositAddress(code: string, params?: {}): Promise<any>;
    fetchDepositAddressesByNetwork(code: string, params?: {}): Promise<{}>;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(httpCode: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): any;
    createDepositAddress(code: string, params?: {}): Promise<{
        currency: string;
        address: string;
        tag: any;
        info: any;
    }>;
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
}
