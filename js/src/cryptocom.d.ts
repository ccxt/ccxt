import Exchange from './abstract/cryptocom.js';
import { Int, OrderSide, OrderType, Trade, OHLCV, Order, FundingRateHistory, Str, Ticker, OrderRequest, Balances, Transaction, OrderBook, Tickers, Strings, Currency, Market } from './base/types.js';
/**
 * @class cryptocom
 * @extends Exchange
 */
export default class cryptocom extends Exchange {
    describe(): undefined;
    fetchMarkets(params?: {}): Promise<never[]>;
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    fetchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseBalance(response: any): Balances;
    fetchBalance(params?: {}): Promise<Balances>;
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    createOrderRequest(symbol: string, type: OrderType, side: OrderSide, amount: any, price?: undefined, params?: {}): any;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: any, price?: undefined, params?: {}): Promise<Order>;
    createOrders(orders: OrderRequest[], params?: {}): Promise<Order[]>;
    createAdvancedOrderRequest(symbol: string, type: OrderType, side: OrderSide, amount: any, price?: undefined, params?: {}): any;
    cancelAllOrders(symbol?: Str, params?: {}): Promise<any>;
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    cancelOrders(ids: any, symbol?: Str, params?: {}): Promise<Order[]>;
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseAddress(addressString: any): undefined[];
    withdraw(code: string, amount: any, address: any, tag?: undefined, params?: {}): Promise<Transaction>;
    fetchDepositAddressesByNetwork(code: string, params?: {}): Promise<{}>;
    fetchDepositAddress(code: string, params?: {}): Promise<any>;
    safeNetwork(networkId: any): Str;
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    transfer(code: string, amount: any, fromAccount: any, toAccount: any, params?: {}): Promise<{
        info: any;
        id: Str;
        timestamp: undefined;
        datetime: string | undefined;
        currency: undefined;
        amount: undefined;
        fromAccount: undefined;
        toAccount: undefined;
        status: undefined;
    }>;
    fetchTransfers(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    parseTransferStatus(status: any): Str;
    parseTransfer(transfer: any, currency?: Currency): {
        info: any;
        id: Str;
        timestamp: undefined;
        datetime: string | undefined;
        currency: undefined;
        amount: undefined;
        fromAccount: undefined;
        toAccount: undefined;
        status: undefined;
    };
    parseTicker(ticker: any, market?: Market): Ticker;
    parseTrade(trade: any, market?: Market): Trade;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    parseOrderStatus(status: any): Str;
    parseTimeInForce(timeInForce: any): Str;
    parseOrder(order: any, market?: Market): Order;
    parseDepositStatus(status: any): Str;
    parseWithdrawalStatus(status: any): Str;
    parseTransaction(transaction: any, currency?: Currency): Transaction;
    repayMargin(code: string, amount: any, symbol?: Str, params?: {}): Promise<any>;
    borrowMargin(code: string, amount: any, symbol?: Str, params?: {}): Promise<any>;
    parseMarginLoan(info: any, currency?: Currency): {
        id: Int;
        currency: string;
        amount: undefined;
        symbol: undefined;
        timestamp: undefined;
        datetime: undefined;
        info: any;
    };
    parseBorrowInterest(info: any, market?: Market): {
        symbol: undefined;
        marginMode: undefined;
        currency: string;
        interest: import("./base/types.js").Num;
        interestRate: import("./base/types.js").Num;
        amountBorrowed: undefined;
        timestamp: Int;
        datetime: string | undefined;
        info: any;
    };
    parseBorrowRates(info: any, codeKey: any): never[];
    customHandleMarginModeAndParams(methodName: any, params?: {}): ({} | undefined)[];
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
    fetchDepositWithdrawFees(codes?: Strings, params?: {}): Promise<any>;
    fetchLedger(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    parseLedgerEntry(item: any, currency?: Currency): {
        id: Str;
        direction: undefined;
        account: Str;
        referenceId: Str;
        referenceAccount: Str;
        type: Str;
        currency: string;
        amount: number;
        timestamp: Int;
        datetime: string | undefined;
        before: undefined;
        after: undefined;
        status: undefined;
        fee: {
            currency: undefined;
            cost: undefined;
        };
        info: any;
    };
    parseLedgerEntryType(type: any): Str;
    fetchAccounts(params?: {}): Promise<never[]>;
    parseAccount(account: any): {
        id: Str;
        type: Str;
        code: undefined;
        info: any;
    };
    fetchSettlementHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    parseSettlement(settlement: any, market: any): {
        info: any;
        symbol: string;
        price: import("./base/types.js").Num;
        timestamp: Int;
        datetime: string | undefined;
    };
    parseSettlements(settlements: any, market: any): never[];
    fetchFundingRateHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<FundingRateHistory[]>;
    fetchPosition(symbol: string, params?: {}): Promise<import("./base/types.js").Position>;
    fetchPositions(symbols?: Strings, params?: {}): Promise<import("./base/types.js").Position[]>;
    parsePosition(position: any, market?: Market): import("./base/types.js").Position;
    nonce(): number;
    paramsToString(object: any, level: any): any;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: undefined, body?: undefined): {
        url: string;
        method: string;
        body: undefined;
        headers: undefined;
    };
    handleErrors(code: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): undefined;
}
