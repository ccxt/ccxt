import Exchange from './abstract/zonda.js';
import type { TransferEntry, Balances, Currency, Int, Market, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, Transaction, Num, Dict } from './base/types.js';
/**
 * @class zonda
 * @augments Exchange
 */
export default class zonda extends Exchange {
    describe(): any;
    fetchMarkets(params?: {}): Promise<Market[]>;
    parseMarket(item: any): Market;
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    parseOrder(order: any, market?: Market): Order;
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseBalance(response: any): Balances;
    fetchBalance(params?: {}): Promise<Balances>;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    fetchLedger(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    parseLedgerEntry(item: any, currency?: Currency): {
        info: any;
        id: string;
        direction: string;
        account: any;
        referenceId: string;
        referenceAccount: any;
        type: string;
        currency: string;
        amount: number;
        before: number;
        after: number;
        status: string;
        timestamp: number;
        datetime: string;
        fee: any;
    };
    parseLedgerEntryType(type: any): string;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseTrade(trade: any, market?: Market): Trade;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<any>;
    isFiat(currency: any): boolean;
    parseDepositAddress(depositAddress: any, currency?: Currency): {
        currency: string;
        address: string;
        tag: string;
        network: any;
        info: any;
    };
    fetchDepositAddress(code: string, params?: {}): Promise<{
        currency: string;
        address: string;
        tag: string;
        network: any;
        info: any;
    }>;
    fetchDepositAddresses(codes?: string[], params?: {}): Promise<import("./base/types.js").Dictionary<any>>;
    transfer(code: string, amount: number, fromAccount: string, toAccount: string, params?: {}): Promise<TransferEntry>;
    parseTransfer(transfer: Dict, currency?: Currency): TransferEntry;
    parseTransferStatus(status: Str): Str;
    withdraw(code: string, amount: number, address: string, tag?: any, params?: {}): Promise<Transaction>;
    parseTransaction(transaction: any, currency?: Currency): Transaction;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(httpCode: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): any;
}
