import Exchange from './abstract/coinbase.js';
import { Int, OrderSide, OrderType, Order, Trade, OHLCV, Ticker, OrderBook, Str, Transaction, Balances, Tickers, Strings, Market, Currency } from './base/types.js';
/**
 * @class coinbase
 * @extends Exchange
 */
export default class coinbase extends Exchange {
    describe(): undefined;
    fetchTime(params?: {}): Promise<number | undefined>;
    fetchAccounts(params?: {}): Promise<any>;
    fetchAccountsV2(params?: {}): Promise<any>;
    fetchAccountsV3(params?: {}): Promise<any>;
    parseAccount(account: any): {
        id: Str;
        type: Str;
        code: string;
        info: any;
    };
    createDepositAddress(code: string, params?: {}): Promise<{
        currency: string;
        tag: Str;
        address: Str;
        info: any;
    }>;
    fetchMySells(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchMyBuys(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchTransactionsWithMethod(method: any, code?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    parseTransactionStatus(status: any): Str;
    parseTransaction(transaction: any, currency?: Currency): {
        info: any;
        id: Str;
        txid: Str;
        timestamp: number | undefined;
        datetime: string | undefined;
        network: undefined;
        address: undefined;
        addressTo: undefined;
        addressFrom: undefined;
        tag: undefined;
        tagTo: undefined;
        tagFrom: undefined;
        type: Str;
        amount: import("./base/types.js").Num;
        currency: string;
        status: string;
        updated: number | undefined;
        fee: {
            cost: import("./base/types.js").Num;
            currency: string;
        };
    };
    parseTrade(trade: any, market?: Market): Trade;
    fetchMarkets(params?: {}): Promise<any>;
    fetchMarketsV2(params?: {}): Promise<never[]>;
    fetchMarketsV3(params?: {}): Promise<never[]>;
    fetchCurrenciesFromCache(params?: {}): Promise<any>;
    fetchCurrencies(params?: {}): Promise<{}>;
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    fetchTickersV2(symbols?: Strings, params?: {}): Promise<import("./base/types.js").Dictionary<Ticker>>;
    fetchTickersV3(symbols?: Strings, params?: {}): Promise<import("./base/types.js").Dictionary<Ticker>>;
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    fetchTickerV2(symbol: string, params?: {}): Promise<Ticker>;
    fetchTickerV3(symbol: string, params?: {}): Promise<Ticker>;
    parseTicker(ticker: any, market?: Market): Ticker;
    parseBalance(response: any, params?: {}): Balances;
    fetchBalance(params?: {}): Promise<Balances>;
    fetchLedger(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    parseLedgerEntryStatus(status: any): Str;
    parseLedgerEntryType(type: any): Str;
    parseLedgerEntry(item: any, currency?: Currency): {
        info: any;
        id: Str;
        timestamp: number | undefined;
        datetime: string | undefined;
        direction: undefined;
        account: undefined;
        referenceId: undefined;
        referenceAccount: undefined;
        type: Str;
        currency: string;
        amount: number;
        before: undefined;
        after: undefined;
        status: Str;
        fee: undefined;
    };
    findAccountId(code: any): Promise<any>;
    prepareAccountRequest(limit?: Int, params?: {}): {
        account_id: string;
    };
    prepareAccountRequestWithCurrencyCode(code?: Str, limit?: Int, params?: {}): Promise<{
        account_id: string;
    }>;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: any, price?: undefined, params?: {}): Promise<Order>;
    parseOrder(order: any, market?: Market): Order;
    parseOrderStatus(status: any): Str;
    parseOrderType(type: any): Str;
    parseTimeInForce(timeInForce: any): Str;
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<any>;
    cancelOrders(ids: any, symbol?: Str, params?: {}): Promise<Order[]>;
    editOrder(id: string, symbol: any, type: any, side: any, amount?: undefined, price?: undefined, params?: {}): Promise<Order>;
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    fetchOrders(symbol?: Str, since?: Int, limit?: number, params?: {}): Promise<Order[]>;
    fetchOrdersByStatus(status: any, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchCanceledOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    fetchBidsAsks(symbols?: Strings, params?: {}): Promise<import("./base/types.js").Dictionary<Ticker>>;
    sign(path: any, api?: never[], method?: string, params?: {}, headers?: undefined, body?: undefined): {
        url: string;
        method: string;
        body: undefined;
        headers: undefined;
    };
    handleErrors(code: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): undefined;
}
