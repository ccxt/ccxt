import Exchange from './abstract/okcoin.js';
import { Balances, Currency, Int, Market, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, Transaction } from './base/types.js';
/**
 * @class okcoin
 * @extends Exchange
 */
export default class okcoin extends Exchange {
    describe(): undefined;
    fetchTime(params?: {}): Promise<number | undefined>;
    fetchMarkets(params?: {}): Promise<Market[]>;
    parseMarket(market: any): Market;
    safeNetwork(networkId: any): Str;
    fetchCurrencies(params?: {}): Promise<{} | undefined>;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseTicker(ticker: any, market?: Market): Ticker;
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    parseTrade(trade: any, market?: Market): Trade;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseAccountBalance(response: any): Balances;
    fetchBalance(params?: {}): Promise<Balances>;
    parseTradingBalance(response: any): Balances;
    parseFundingBalance(response: any): Balances;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: any, price?: undefined, params?: {}): Promise<Order>;
    createOrderRequest(symbol: string, type: OrderType, side: OrderSide, amount: any, price?: undefined, params?: {}): any;
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<any>;
    parseIds(ids: any): any;
    cancelOrders(ids: any, symbol?: Str, params?: {}): Promise<Order[]>;
    parseOrderStatus(status: any): Str;
    parseOrder(order: any, market?: Market): Order;
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    parseDepositAddress(depositAddress: any, currency?: Currency): {
        currency: string;
        address: Str;
        tag: Str;
        network: Str;
        info: any;
    };
    fetchDepositAddress(code: string, params?: {}): Promise<any>;
    fetchDepositAddressesByNetwork(code: string, params?: {}): Promise<{}>;
    transfer(code: string, amount: any, fromAccount: any, toAccount: any, params?: {}): Promise<{
        info: any;
        id: Str;
        timestamp: Int;
        datetime: string | undefined;
        currency: string;
        amount: import("./base/types.js").Num;
        fromAccount: Str;
        toAccount: Str;
        status: Str;
    }>;
    parseTransfer(transfer: any, currency?: Currency): {
        info: any;
        id: Str;
        timestamp: Int;
        datetime: string | undefined;
        currency: string;
        amount: import("./base/types.js").Num;
        fromAccount: Str;
        toAccount: Str;
        status: Str;
    };
    parseTransferStatus(status: any): Str;
    withdraw(code: string, amount: any, address: any, tag?: undefined, params?: {}): Promise<Transaction>;
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    parseTransactionStatus(status: any): Str;
    parseTransaction(transaction: any, currency?: Currency): Transaction;
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchOrderTrades(id: string, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchLedger(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    parseLedgerEntryType(type: any): Str;
    parseLedgerEntry(item: any, currency?: Currency): {
        id: Str;
        info: any;
        timestamp: Int;
        datetime: string | undefined;
        account: undefined;
        referenceId: Str;
        referenceAccount: undefined;
        type: Str;
        currency: string;
        symbol: string;
        amount: number;
        before: undefined;
        after: number;
        status: string;
        fee: undefined;
    };
    sign(path: any, api?: string, method?: string, params?: {}, headers?: undefined, body?: undefined): {
        url: string;
        method: string;
        body: undefined;
        headers: undefined;
    };
    parseBalanceByType(type: any, response: any): Balances;
    handleErrors(httpCode: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): undefined;
}
