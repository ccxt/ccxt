import Exchange from './abstract/woo.js';
import { Balances, Currency, FundingRateHistory, Int, Market, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Trade, Transaction } from './base/types.js';
/**
 * @class woo
 * @extends Exchange
 */
export default class woo extends Exchange {
    describe(): undefined;
    fetchMarkets(params?: {}): Promise<Market[]>;
    parseMarket(market: any): Market;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseTrade(trade: any, market?: Market): Trade;
    parseTokenAndFeeTemp(item: any, feeTokenKey: any, feeAmountKey: any): undefined;
    fetchTradingFees(params?: {}): Promise<{}>;
    fetchCurrencies(params?: {}): Promise<{}>;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: any, price?: undefined, params?: {}): Promise<Order>;
    editOrder(id: string, symbol: any, type: any, side: any, amount?: undefined, price?: undefined, params?: {}): Promise<Order>;
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<any>;
    cancelAllOrders(symbol?: Str, params?: {}): Promise<any>;
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    fetchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    parseTimeInForce(timeInForce: any): Str;
    parseOrder(order: any, market?: Market): Order;
    parseOrderStatus(status: any): any;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    fetchOrderTrades(id: string, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchAccounts(params?: {}): Promise<never[]>;
    parseAccount(account: any): {
        info: any;
        id: Str;
        name: Str;
        code: undefined;
        type: string;
    };
    fetchBalance(params?: {}): Promise<Balances>;
    parseBalance(response: any): Balances;
    fetchDepositAddress(code: string, params?: {}): Promise<{
        currency: string;
        address: Str;
        tag: Str;
        network: Str;
        info: any;
    }>;
    getAssetHistoryRows(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<any[]>;
    fetchLedger(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    parseLedgerEntry(item: any, currency?: Currency): {
        id: Str;
        currency: any;
        account: Str;
        referenceAccount: undefined;
        referenceId: Str;
        status: Str;
        amount: Num;
        before: undefined;
        after: undefined;
        fee: undefined;
        direction: string;
        timestamp: number | undefined;
        datetime: string | undefined;
        type: Str;
        info: any;
    };
    parseLedgerEntryType(type: any): Str;
    getCurrencyFromChaincode(networkizedCode: any, currency: any): any;
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchDepositsWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    parseTransaction(transaction: any, currency?: Currency): Transaction;
    parseTransactionStatus(status: any): Str;
    transfer(code: string, amount: any, fromAccount: any, toAccount: any, params?: {}): Promise<{
        id: Str;
        timestamp: number | undefined;
        datetime: string | undefined;
        currency: any;
        amount: Num;
        fromAccount: Str;
        toAccount: Str;
        status: Str;
        info: any;
    }>;
    fetchTransfers(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    parseTransfer(transfer: any, currency?: Currency): {
        id: Str;
        timestamp: number | undefined;
        datetime: string | undefined;
        currency: any;
        amount: Num;
        fromAccount: Str;
        toAccount: Str;
        status: Str;
        info: any;
    };
    parseTransferStatus(status: any): Str;
    withdraw(code: string, amount: any, address: any, tag?: undefined, params?: {}): Promise<Transaction>;
    repayMargin(code: string, amount: any, symbol?: Str, params?: {}): Promise<any>;
    parseMarginLoan(info: any, currency?: Currency): {
        id: undefined;
        currency: string;
        amount: undefined;
        symbol: undefined;
        timestamp: undefined;
        datetime: undefined;
        info: any;
    };
    nonce(): number;
    sign(path: any, section?: string, method?: string, params?: {}, headers?: undefined, body?: undefined): {
        url: any;
        method: string;
        body: undefined;
        headers: undefined;
    };
    handleErrors(httpCode: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): undefined;
    parseIncome(income: any, market?: Market): {
        info: any;
        symbol: string;
        code: string;
        timestamp: number | undefined;
        datetime: string | undefined;
        id: Str;
        amount: Num;
        rate: Num;
    };
    fetchFundingHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<import("./base/types.js").FundingHistory[]>;
    parseFundingRate(fundingRate: any, market?: Market): {
        info: any;
        symbol: string;
        markPrice: undefined;
        indexPrice: undefined;
        interestRate: number;
        estimatedSettlePrice: undefined;
        timestamp: Int;
        datetime: string | undefined;
        fundingRate: Num;
        fundingTimestamp: Int;
        fundingDatetime: string | undefined;
        nextFundingRate: undefined;
        nextFundingTimestamp: undefined;
        nextFundingDatetime: undefined;
        previousFundingRate: Num;
        previousFundingTimestamp: Int;
        previousFundingDatetime: string | undefined;
    };
    fetchFundingRate(symbol: string, params?: {}): Promise<{
        info: any;
        symbol: string;
        markPrice: undefined;
        indexPrice: undefined;
        interestRate: number;
        estimatedSettlePrice: undefined;
        timestamp: Int;
        datetime: string | undefined;
        fundingRate: Num;
        fundingTimestamp: Int;
        fundingDatetime: string | undefined;
        nextFundingRate: undefined;
        nextFundingTimestamp: undefined;
        nextFundingDatetime: undefined;
        previousFundingRate: Num;
        previousFundingTimestamp: Int;
        previousFundingDatetime: string | undefined;
    }>;
    fetchFundingRates(symbols?: Strings, params?: {}): Promise<any>;
    fetchFundingRateHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<FundingRateHistory[]>;
    fetchLeverage(symbol: string, params?: {}): Promise<{
        info: any;
        leverage: Num;
    }>;
    setLeverage(leverage: any, symbol?: Str, params?: {}): Promise<any>;
    fetchPosition(symbol?: Str, params?: {}): Promise<import("./base/types.js").Position>;
    fetchPositions(symbols?: Strings, params?: {}): Promise<import("./base/types.js").Position[]>;
    parsePosition(position: any, market?: Market): import("./base/types.js").Position;
    defaultNetworkCodeForCurrency(code: any): any;
    setSandboxMode(enable: any): void;
}
