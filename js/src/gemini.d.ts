import Exchange from './abstract/gemini.js';
import { Balances, Currency, Int, Market, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, Transaction } from './base/types.js';
/**
 * @class gemini
 * @extends Exchange
 */
export default class gemini extends Exchange {
    describe(): undefined;
    fetchCurrencies(params?: {}): Promise<{} | undefined>;
    fetchCurrenciesFromWeb(params?: {}): Promise<{} | undefined>;
    fetchMarkets(params?: {}): Promise<any>;
    fetchMarketsFromWeb(params?: {}): Promise<never[]>;
    parseMarketActive(status: any): any;
    fetchUSDTMarkets(params?: {}): Promise<never[]>;
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
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: any, price?: undefined, params?: {}): Promise<Order>;
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    withdraw(code: string, amount: any, address: any, tag?: undefined, params?: {}): Promise<Transaction>;
    nonce(): number;
    fetchDepositsWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    parseTransaction(transaction: any, currency?: Currency): Transaction;
    parseTransactionStatus(status: any): Str;
    parseDepositAddress(depositAddress: any, currency?: Currency): {
        currency: string;
        network: undefined;
        address: Str;
        tag: undefined;
        info: any;
    };
    fetchDepositAddress(code: string, params?: {}): Promise<any>;
    fetchDepositAddressesByNetwork(code: string, params?: {}): Promise<{}>;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: undefined, body?: undefined): {
        url: string;
        method: string;
        body: undefined;
        headers: undefined;
    };
    handleErrors(httpCode: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): undefined;
    createDepositAddress(code: string, params?: {}): Promise<{
        currency: string;
        address: Str;
        tag: undefined;
        info: any;
    }>;
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
}
