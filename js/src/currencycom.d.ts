import Exchange from './abstract/currencycom.js';
import { Balances, Currency, Int, Market, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, Transaction } from './base/types.js';
/**
 * @class currencycom
 * @extends Exchange
 */
export default class currencycom extends Exchange {
    describe(): undefined;
    nonce(): number;
    fetchTime(params?: {}): Promise<Int>;
    fetchCurrencies(params?: {}): Promise<{} | undefined>;
    fetchMarkets(params?: {}): Promise<never[]>;
    fetchAccounts(params?: {}): Promise<never[]>;
    fetchTradingFees(params?: {}): Promise<{}>;
    parseBalance(response: any, type?: undefined): Balances;
    fetchBalance(params?: {}): Promise<Balances>;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseTicker(ticker: any, market?: Market): Ticker;
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseTrade(trade: any, market?: Market): Trade;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseOrder(order: any, market?: Market): Order;
    parseOrderStatus(status: any): Str;
    parseOrderType(status: any): Str;
    parseOrderTimeInForce(status: any): Str;
    parseOrderSide(status: any): Str;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: any, price?: undefined, params?: {}): Promise<Order>;
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchDepositsWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchTransactionsByMethod(method: any, code?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    parseTransaction(transaction: any, currency?: Currency): Transaction;
    parseTransactionStatus(status: any): Str;
    parseTransactionType(type: any): Str;
    fetchLedger(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    parseLedgerEntry(item: any, currency?: Currency): {
        id: Str;
        timestamp: Int;
        datetime: string | undefined;
        direction: string;
        account: undefined;
        referenceId: Str;
        referenceAccount: undefined;
        type: Str;
        currency: string;
        amount: string | undefined;
        before: undefined;
        after: Str;
        status: Str;
        fee: undefined;
        info: any;
    };
    parseLedgerEntryStatus(status: any): Str;
    parseLedgerEntryType(type: any): Str;
    fetchLeverage(symbol: string, params?: {}): Promise<import("./base/types.js").Num>;
    fetchDepositAddress(code: string, params?: {}): Promise<{
        currency: string;
        address: Str;
        tag: undefined;
        network: undefined;
        info: any;
    }>;
    parseDepositAddress(depositAddress: any, currency?: Currency): {
        currency: string;
        address: Str;
        tag: undefined;
        network: undefined;
        info: any;
    };
    sign(path: any, api?: string, method?: string, params?: {}, headers?: undefined, body?: undefined): {
        url: string;
        method: string;
        body: undefined;
        headers: undefined;
    };
    fetchPositions(symbols?: Strings, params?: {}): Promise<import("./base/types.js").Position[]>;
    parsePosition(position: any, market?: Market): import("./base/types.js").Position;
    handleErrors(httpCode: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): undefined;
}
