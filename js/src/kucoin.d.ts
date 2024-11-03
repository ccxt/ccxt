import Exchange from './abstract/kucoin.js';
import type { TransferEntry, Int, OrderSide, OrderType, Order, OHLCV, Trade, Balances, OrderRequest, Str, Transaction, Ticker, OrderBook, Tickers, Strings, Currency, Market, Num, Account, Dict, TradingFeeInterface, Currencies, int, LedgerEntry, DepositAddress, BorrowInterest } from './base/types.js';
/**
 * @class kucoin
 * @augments Exchange
 */
export default class kucoin extends Exchange {
    describe(): any;
    nonce(): number;
    fetchTime(params?: {}): Promise<number>;
    fetchStatus(params?: {}): Promise<{
        status: string;
        updated: any;
        eta: any;
        url: any;
        info: any;
    }>;
    fetchMarkets(params?: {}): Promise<Market[]>;
    loadMigrationStatus(force?: boolean): Promise<void>;
    handleHfAndParams(params?: {}): {}[];
    fetchCurrencies(params?: {}): Promise<Currencies>;
    fetchAccounts(params?: {}): Promise<Account[]>;
    fetchTransactionFee(code: string, params?: {}): Promise<{
        info: any;
        withdraw: Dict;
        deposit: {};
    }>;
    fetchDepositWithdrawFee(code: string, params?: {}): Promise<any>;
    parseDepositWithdrawFee(fee: any, currency?: Currency): Dict;
    isFuturesMethod(methodName: any, params: any): boolean;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    fetchMarkPrices(symbols?: Strings, params?: {}): Promise<Tickers>;
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    fetchMarkPrice(symbol: string, params?: {}): Promise<Ticker>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    createDepositAddress(code: string, params?: {}): Promise<DepositAddress>;
    fetchDepositAddress(code: string, params?: {}): Promise<DepositAddress>;
    parseDepositAddress(depositAddress: any, currency?: Currency): DepositAddress;
    fetchDepositAddressesByNetwork(code: string, params?: {}): Promise<DepositAddress[]>;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    handleTriggerPrices(params: any): any[];
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    createMarketOrderWithCost(symbol: string, side: OrderSide, cost: number, params?: {}): Promise<Order>;
    createMarketBuyOrderWithCost(symbol: string, cost: number, params?: {}): Promise<Order>;
    createMarketSellOrderWithCost(symbol: string, cost: number, params?: {}): Promise<Order>;
    createOrders(orders: OrderRequest[], params?: {}): Promise<Order[]>;
    marketOrderAmountToPrecision(symbol: string, amount: any): string;
    createOrderRequest(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): any;
    editOrder(id: string, symbol: string, type: OrderType, side: OrderSide, amount?: Num, price?: Num, params?: {}): Promise<Order>;
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    cancelAllOrders(symbol?: Str, params?: {}): Promise<any>;
    fetchOrdersByStatus(status: any, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    parseOrder(order: Dict, market?: Market): Order;
    fetchOrderTrades(id: string, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseTrade(trade: Dict, market?: Market): Trade;
    fetchTradingFee(symbol: string, params?: {}): Promise<TradingFeeInterface>;
    withdraw(code: string, amount: number, address: string, tag?: any, params?: {}): Promise<Transaction>;
    parseTransactionStatus(status: Str): string;
    parseTransaction(transaction: Dict, currency?: Currency): Transaction;
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    parseBalanceHelper(entry: any): import("./base/types.js").BalanceAccount;
    fetchBalance(params?: {}): Promise<Balances>;
    transfer(code: string, amount: number, fromAccount: string, toAccount: string, params?: {}): Promise<TransferEntry>;
    parseTransfer(transfer: Dict, currency?: Currency): TransferEntry;
    parseTransferStatus(status: Str): Str;
    parseLedgerEntryType(type: any): string;
    parseLedgerEntry(item: Dict, currency?: Currency): LedgerEntry;
    fetchLedger(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<LedgerEntry[]>;
    calculateRateLimiterCost(api: any, method: any, path: any, params: any, config?: {}): any;
    parseBorrowRate(info: any, currency?: Currency): {
        currency: string;
        rate: number;
        period: number;
        timestamp: number;
        datetime: string;
        info: any;
    };
    fetchBorrowInterest(code?: Str, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<BorrowInterest[]>;
    parseBorrowInterest(info: Dict, market?: Market): BorrowInterest;
    fetchBorrowRateHistories(codes?: any, since?: Int, limit?: Int, params?: {}): Promise<Dict>;
    fetchBorrowRateHistory(code: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    parseBorrowRateHistories(response: any, codes: any, since: any, limit: any): Dict;
    borrowCrossMargin(code: string, amount: number, params?: {}): Promise<{
        id: string;
        currency: string;
        amount: number;
        symbol: any;
        timestamp: number;
        datetime: string;
        info: any;
    }>;
    borrowIsolatedMargin(symbol: string, code: string, amount: number, params?: {}): Promise<{
        id: string;
        currency: string;
        amount: number;
        symbol: any;
        timestamp: number;
        datetime: string;
        info: any;
    }>;
    repayCrossMargin(code: string, amount: any, params?: {}): Promise<{
        id: string;
        currency: string;
        amount: number;
        symbol: any;
        timestamp: number;
        datetime: string;
        info: any;
    }>;
    repayIsolatedMargin(symbol: string, code: string, amount: any, params?: {}): Promise<{
        id: string;
        currency: string;
        amount: number;
        symbol: any;
        timestamp: number;
        datetime: string;
        info: any;
    }>;
    parseMarginLoan(info: any, currency?: Currency): {
        id: string;
        currency: string;
        amount: number;
        symbol: any;
        timestamp: number;
        datetime: string;
        info: any;
    };
    fetchDepositWithdrawFees(codes?: Strings, params?: {}): Promise<any>;
    setLeverage(leverage: Int, symbol?: Str, params?: {}): Promise<any>;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: any;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
}
