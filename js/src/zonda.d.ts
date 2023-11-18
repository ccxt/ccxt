import Exchange from './abstract/zonda.js';
import { Balances, Currency, Int, Market, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, Transaction } from './base/types.js';
/**
 * @class zonda
 * @extends Exchange
 */
export default class zonda extends Exchange {
    describe(): undefined;
    fetchMarkets(params?: {}): Promise<Market[]>;
    parseMarket(item: any): Market;
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    parseOrder(order: any, market?: Market): Order;
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseBalance(response: any): Balances;
    fetchBalance(params?: {}): Promise<Balances>;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseTicker(ticker: any, market?: Market): Ticker;
    fetchTicker(symbol: any, params?: {}): Promise<Ticker>;
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    fetchLedger(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    parseLedgerEntry(item: any, currency?: Currency): {
        info: any;
        id: Str;
        direction: string;
        account: undefined;
        referenceId: Str;
        referenceAccount: undefined;
        type: Str;
        currency: string;
        amount: number;
        before: import("./base/types.js").Num;
        after: import("./base/types.js").Num;
        status: string;
        timestamp: Int;
        datetime: string | undefined;
        fee: undefined;
    };
    parseLedgerEntryType(type: any): Str;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseTrade(trade: any, market?: Market): Trade;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: any, price?: undefined, params?: {}): Promise<Order>;
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<any>;
    isFiat(currency: any): any;
    parseDepositAddress(depositAddress: any, currency?: Currency): {
        currency: string;
        address: Str;
        tag: Str;
        network: undefined;
        info: any;
    };
    fetchDepositAddress(code: string, params?: {}): Promise<{
        currency: string;
        address: Str;
        tag: Str;
        network: undefined;
        info: any;
    }>;
    fetchDepositAddresses(codes?: undefined, params?: {}): Promise<{}>;
    transfer(code: string, amount: any, fromAccount: any, toAccount: any, params?: {}): Promise<{
        info: any;
        id: undefined;
        timestamp: undefined;
        datetime: undefined;
        currency: string;
        amount: undefined;
        fromAccount: Str;
        toAccount: Str;
        status: Str;
    }>;
    parseTransfer(transfer: any, currency?: Currency): {
        info: any;
        id: undefined;
        timestamp: undefined;
        datetime: undefined;
        currency: string;
        amount: undefined;
        fromAccount: Str;
        toAccount: Str;
        status: Str;
    };
    parseTransferStatus(status: any): Str;
    withdraw(code: string, amount: any, address: any, tag?: undefined, params?: {}): Promise<Transaction>;
    parseTransaction(transaction: any, currency?: Currency): Transaction;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: undefined, body?: undefined): {
        url: any;
        method: string;
        body: undefined;
        headers: undefined;
    };
    handleErrors(httpCode: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): undefined;
}
