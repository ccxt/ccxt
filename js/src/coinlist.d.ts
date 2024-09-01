import Exchange from './abstract/coinlist.js';
import type { Account, Balances, Currencies, Currency, Dict, Int, Market, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, TradingFees, Transaction, TransferEntry, int } from './base/types.js';
/**
 * @class coinlist
 * @augments Exchange
 */
export default class coinlist extends Exchange {
    describe(): any;
    calculateRateLimiterCost(api: any, method: any, path: any, params: any, config?: {}): number;
    fetchTime(params?: {}): Promise<number>;
    fetchCurrencies(params?: {}): Promise<Currencies>;
    fetchMarkets(params?: {}): Promise<Market[]>;
    parseMarket(market: Dict): Market;
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseTrade(trade: Dict, market?: Market): Trade;
    fetchTradingFees(params?: {}): Promise<TradingFees>;
    parseFeeTiers(feeTiers: any, market?: Market): {
        maker: any[];
        taker: any[];
    };
    fetchAccounts(params?: {}): Promise<Account[]>;
    parseAccount(account: any): {
        id: string;
        type: string;
        code: any;
        info: any;
    };
    fetchBalance(params?: {}): Promise<Balances>;
    parseBalance(response: any): Balances;
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchOrderTrades(id: string, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchCanceledOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    cancelAllOrders(symbol?: Str, params?: {}): Promise<Order[]>;
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    cancelOrders(ids: any, symbol?: Str, params?: {}): Promise<any[]>;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    editOrder(id: string, symbol: string, type: OrderType, side: OrderSide, amount?: Num, price?: Num, params?: {}): Promise<Order>;
    parseOrder(order: Dict, market?: Market): Order;
    parseOrderStatus(status: Str): string;
    parseOrderType(status: any): string;
    transfer(code: string, amount: number, fromAccount: string, toAccount: string, params?: {}): Promise<TransferEntry>;
    fetchTransfers(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<TransferEntry[]>;
    parseTransfer(transfer: Dict, currency?: Currency): TransferEntry;
    parseTransferStatus(status: Str): Str;
    fetchDepositsWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    withdraw(code: string, amount: number, address: string, tag?: any, params?: {}): Promise<Transaction>;
    parseTransaction(transaction: Dict, currency?: Currency): Transaction;
    parseTransactionType(type: any): string;
    fetchLedger(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    parseLedgerEntry(item: Dict, currency?: Currency): {
        info: Dict;
        id: string;
        timestamp: number;
        datetime: string;
        direction: any;
        account: string;
        referenceId: any;
        referenceAccount: any;
        type: string;
        currency: string;
        amount: number;
        before: any;
        after: any;
        status: string;
        fee: any;
    };
    parseLedgerEntryType(type: any): string;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
}
