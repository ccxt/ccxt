import Exchange from './abstract/kucoin.js';
import { Int, OrderSide, OrderType, Order, OHLCV, Trade, Balances, OrderRequest, Str, Transaction, Ticker, OrderBook, Tickers, Strings, Currency, Market } from './base/types.js';
/**
 * @class kucoin
 * @extends Exchange
 */
export default class kucoin extends Exchange {
    describe(): undefined;
    nonce(): number;
    fetchTime(params?: {}): Promise<Int>;
    fetchStatus(params?: {}): Promise<{
        status: string;
        updated: undefined;
        eta: undefined;
        url: undefined;
        info: any;
    }>;
    fetchMarkets(params?: {}): Promise<never[]>;
    fetchCurrencies(params?: {}): Promise<{}>;
    fetchAccounts(params?: {}): Promise<never[]>;
    fetchTransactionFee(code: string, params?: {}): Promise<{
        info: any;
        withdraw: {};
        deposit: {};
    }>;
    fetchDepositWithdrawFee(code: string, params?: {}): Promise<{
        info: any;
        withdraw: {
            fee: undefined;
            percentage: undefined;
        };
        deposit: {
            fee: undefined;
            percentage: undefined;
        };
        networks: {};
    }>;
    parseDepositWithdrawFee(fee: any, currency?: Currency): {
        info: any;
        withdraw: {
            fee: undefined;
            percentage: undefined;
        };
        deposit: {
            fee: undefined;
            percentage: undefined;
        };
        networks: {};
    };
    isFuturesMethod(methodName: any, params: any): boolean;
    parseTicker(ticker: any, market?: Market): Ticker;
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    createDepositAddress(code: string, params?: {}): Promise<{
        info: any;
        currency: undefined;
        address: Str;
        tag: Str;
        network: Str;
    }>;
    fetchDepositAddress(code: string, params?: {}): Promise<{
        info: any;
        currency: undefined;
        address: Str;
        tag: Str;
        network: Str;
    }>;
    parseDepositAddress(depositAddress: any, currency?: Currency): {
        info: any;
        currency: undefined;
        address: Str;
        tag: Str;
        network: Str;
    };
    fetchDepositAddressesByNetwork(code: string, params?: {}): Promise<{}>;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    handleTriggerPrices(params: any): any[];
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: any, price?: undefined, params?: {}): Promise<Order>;
    createOrders(orders: OrderRequest[], params?: {}): Promise<Order[]>;
    createOrderRequest(symbol: string, type: OrderType, side: OrderSide, amount: any, price?: undefined, params?: {}): any;
    editOrder(id: string, symbol: any, type: any, side: any, amount?: undefined, price?: undefined, params?: {}): Promise<Order>;
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<undefined>;
    cancelAllOrders(symbol?: Str, params?: {}): Promise<any>;
    fetchOrdersByStatus(status: any, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    parseOrder(order: any, market?: Market): Order;
    fetchOrderTrades(id: string, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseTrade(trade: any, market?: Market): Trade;
    fetchTradingFee(symbol: string, params?: {}): Promise<{
        info: any;
        symbol: string;
        maker: import("./base/types.js").Num;
        taker: import("./base/types.js").Num;
        percentage: boolean;
        tierBased: boolean;
    }>;
    withdraw(code: string, amount: any, address: any, tag?: undefined, params?: {}): Promise<Transaction>;
    parseTransactionStatus(status: any): Str;
    parseTransaction(transaction: any, currency?: Currency): Transaction;
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    parseBalanceHelper(entry: any): import("./base/types.js").Account;
    fetchBalance(params?: {}): Promise<Balances>;
    transfer(code: string, amount: any, fromAccount: any, toAccount: any, params?: {}): Promise<{
        id: Str;
        currency: string;
        timestamp: Int;
        datetime: string | undefined;
        amount: import("./base/types.js").Num;
        fromAccount: Str;
        toAccount: Str;
        status: Str;
        info: any;
    }>;
    parseTransfer(transfer: any, currency?: Currency): {
        id: Str;
        currency: string;
        timestamp: Int;
        datetime: string | undefined;
        amount: import("./base/types.js").Num;
        fromAccount: Str;
        toAccount: Str;
        status: Str;
        info: any;
    };
    parseTransferStatus(status: any): Str;
    parseLedgerEntryType(type: any): Str;
    parseLedgerEntry(item: any, currency?: Currency): {
        id: Str;
        direction: Str;
        account: Str;
        referenceId: undefined;
        referenceAccount: Str;
        type: Str;
        currency: string;
        amount: import("./base/types.js").Num;
        timestamp: Int;
        datetime: string | undefined;
        before: undefined;
        after: undefined;
        status: undefined;
        fee: undefined;
        info: any;
    };
    fetchLedger(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    calculateRateLimiterCost(api: any, method: any, path: any, params: any, config?: {}): any;
    parseBorrowRateHistory(response: any, code: any, since: any, limit: any): any;
    parseBorrowRate(info: any, currency?: Currency): {
        currency: string;
        rate: import("./base/types.js").Num;
        period: number;
        timestamp: string | undefined;
        datetime: string | undefined;
        info: any;
    };
    fetchBorrowInterest(code?: Str, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<never[]>;
    parseBorrowInterest(info: any, market?: Market): {
        symbol: Str;
        marginMode: string;
        currency: string;
        interest: undefined;
        interestRate: import("./base/types.js").Num;
        amountBorrowed: undefined;
        timestamp: Int;
        datetime: string | undefined;
        info: any;
    };
    borrowMargin(code: string, amount: any, symbol?: Str, params?: {}): Promise<{
        id: Str;
        currency: string;
        amount: import("./base/types.js").Num;
        symbol: undefined;
        timestamp: number;
        datetime: string | undefined;
        info: any;
    }>;
    repayMargin(code: string, amount: any, symbol?: Str, params?: {}): Promise<{
        id: Str;
        currency: string;
        amount: import("./base/types.js").Num;
        symbol: undefined;
        timestamp: number;
        datetime: string | undefined;
        info: any;
    }>;
    parseMarginLoan(info: any, currency?: Currency): {
        id: Str;
        currency: string;
        amount: import("./base/types.js").Num;
        symbol: undefined;
        timestamp: number;
        datetime: string | undefined;
        info: any;
    };
    fetchDepositWithdrawFees(codes?: Strings, params?: {}): Promise<any>;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: undefined, body?: undefined): {
        url: string;
        method: string;
        body: undefined;
        headers: undefined;
    };
    handleErrors(code: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): undefined;
}
