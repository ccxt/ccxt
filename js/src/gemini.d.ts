import Exchange from './abstract/gemini.js';
import { Balances, Int, OHLCV, Order, OrderBook, OrderSide, OrderType, Ticker, Trade, Transaction } from './base/types.js';
/**
 * @class gemini
 * @extends Exchange
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
    parseMarket(response: any): {
        id: string;
        symbol: string;
        base: any;
        quote: any;
        settle: any;
        baseId: string;
        quoteId: string;
        settleId: any;
        type: string;
        spot: boolean;
        margin: boolean;
        swap: boolean;
        future: boolean;
        option: boolean;
        active: any;
        contract: boolean;
        linear: any;
        inverse: any;
        contractSize: any;
        expiry: any;
        expiryDatetime: any;
        strike: any;
        optionType: any;
        precision: {
            price: number;
            amount: number;
        };
        limits: {
            leverage: {
                min: any;
                max: any;
            };
            amount: {
                min: number;
                max: any;
            };
            price: {
                min: any;
                max: any;
            };
            cost: {
                min: any;
                max: any;
            };
        };
        created: any;
        info: any;
    };
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    fetchTickerV1(symbol: string, params?: {}): Promise<Ticker>;
    fetchTickerV2(symbol: string, params?: {}): Promise<Ticker>;
    fetchTickerV1AndV2(symbol: string, params?: {}): Promise<Ticker>;
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    parseTicker(ticker: any, market?: any): Ticker;
    fetchTickers(symbols?: string[], params?: {}): Promise<import("./base/types.js").Dictionary<Ticker>>;
    parseTrade(trade: any, market?: any): Trade;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseBalance(response: any): Balances;
    fetchTradingFees(params?: {}): Promise<{}>;
    fetchBalance(params?: {}): Promise<Balances>;
    parseOrder(order: any, market?: any): Order;
    fetchOrder(id: string, symbol?: string, params?: {}): Promise<Order>;
    fetchOpenOrders(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: any, price?: any, params?: {}): Promise<Order>;
    cancelOrder(id: string, symbol?: string, params?: {}): Promise<Order>;
    fetchMyTrades(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    withdraw(code: string, amount: any, address: any, tag?: any, params?: {}): Promise<Transaction>;
    nonce(): number;
    fetchDepositsWithdrawals(code?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    parseTransaction(transaction: any, currency?: any): Transaction;
    parseTransactionStatus(status: any): string;
    parseDepositAddress(depositAddress: any, currency?: any): {
        currency: any;
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
