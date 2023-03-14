import { Exchange } from './base/Exchange.js';
export default class bitmart extends Exchange {
    describe(): any;
    fetchTime(params?: {}): Promise<number>;
    fetchStatus(params?: {}): Promise<{
        status: any;
        updated: any;
        eta: any;
        url: any;
        info: any;
    }>;
    fetchSpotMarkets(params?: {}): Promise<any[]>;
    fetchContractMarkets(params?: {}): Promise<any[]>;
    fetchMarkets(params?: {}): Promise<any>;
    fetchCurrencies(params?: {}): Promise<{}>;
    fetchTransactionFee(code: any, params?: {}): Promise<{
        info: any;
        withdraw: {};
        deposit: {};
    }>;
    parseDepositWithdrawFee(fee: any, currency?: any): {
        info: any;
        withdraw: {
            fee: number;
            percentage: any;
        };
        deposit: {
            fee: any;
            percentage: any;
        };
        networks: {};
    };
    fetchDepositWithdrawFee(code: any, params?: {}): Promise<{
        info: any;
        withdraw: {
            fee: number;
            percentage: any;
        };
        deposit: {
            fee: any;
            percentage: any;
        };
        networks: {};
    }>;
    parseTicker(ticker: any, market?: any): import("./base/types.js").Ticker;
    fetchTicker(symbol: any, params?: {}): Promise<import("./base/types.js").Ticker>;
    fetchTickers(symbols?: any, params?: {}): Promise<any>;
    fetchOrderBook(symbol: any, limit?: any, params?: {}): Promise<import("./base/ws/OrderBook.js").OrderBook>;
    parseTrade(trade: any, market?: any): import("./base/types.js").Trade;
    fetchTrades(symbol: any, since?: any, limit?: any, params?: {}): Promise<import("./base/types.js").Trade[]>;
    parseOHLCV(ohlcv: any, market?: any): number[];
    fetchOHLCV(symbol: any, timeframe?: string, since?: any, limit?: any, params?: {}): Promise<object[]>;
    fetchMyTrades(symbol?: any, since?: any, limit?: any, params?: {}): Promise<import("./base/types.js").Trade[]>;
    fetchOrderTrades(id: any, symbol?: any, since?: any, limit?: any, params?: {}): Promise<import("./base/types.js").Trade[]>;
    parseBalance(response: any, marketType: any): object;
    parseBalanceHelper(entry: any): {
        free: any;
        used: any;
        total: any;
    };
    fetchBalance(params?: {}): Promise<object>;
    parseTradingFee(fee: any, market?: any): {
        info: any;
        symbol: any;
        maker: number;
        taker: number;
    };
    fetchTradingFee(symbol: any, params?: {}): Promise<{
        info: any;
        symbol: any;
        maker: number;
        taker: number;
    }>;
    parseOrder(order: any, market?: any): any;
    parseOrderStatusByType(type: any, status: any): string;
    createOrder(symbol: any, type: any, side: any, amount: any, price?: any, params?: {}): Promise<any>;
    cancelOrder(id: any, symbol?: any, params?: {}): Promise<any>;
    cancelAllOrders(symbol?: any, params?: {}): Promise<any>;
    fetchOrdersByStatus(status: any, symbol?: any, since?: any, limit?: any, params?: {}): Promise<object[]>;
    fetchOpenOrders(symbol?: any, since?: any, limit?: any, params?: {}): Promise<object[]>;
    fetchClosedOrders(symbol?: any, since?: any, limit?: any, params?: {}): Promise<object[]>;
    fetchCanceledOrders(symbol?: any, since?: any, limit?: any, params?: {}): Promise<object[]>;
    fetchOrder(id: any, symbol?: any, params?: {}): Promise<any>;
    fetchDepositAddress(code: any, params?: {}): Promise<{
        currency: any;
        address: string;
        tag: string;
        network: any;
        info: any;
    }>;
    safeNetwork(networkId: any): any;
    withdraw(code: any, amount: any, address: any, tag?: any, params?: {}): Promise<any>;
    fetchTransactionsByType(type: any, code?: any, since?: any, limit?: any, params?: {}): Promise<object[]>;
    fetchDeposit(id: any, code?: any, params?: {}): Promise<{
        info: any;
        id: any;
        currency: any;
        amount: number;
        network: any;
        address: string;
        addressFrom: any;
        addressTo: any;
        tag: string;
        tagFrom: any;
        tagTo: any;
        status: string;
        type: any;
        updated: any;
        txid: string;
        timestamp: number;
        datetime: string;
        fee: any;
    }>;
    fetchDeposits(code?: any, since?: any, limit?: any, params?: {}): Promise<object[]>;
    fetchWithdrawal(id: any, code?: any, params?: {}): Promise<{
        info: any;
        id: any;
        currency: any;
        amount: number;
        network: any;
        address: string;
        addressFrom: any;
        addressTo: any;
        tag: string;
        tagFrom: any;
        tagTo: any;
        status: string;
        type: any;
        updated: any;
        txid: string;
        timestamp: number;
        datetime: string;
        fee: any;
    }>;
    fetchWithdrawals(code?: any, since?: any, limit?: any, params?: {}): Promise<object[]>;
    parseTransactionStatus(status: any): string;
    parseTransaction(transaction: any, currency?: any): {
        info: any;
        id: any;
        currency: any;
        amount: number;
        network: any;
        address: string;
        addressFrom: any;
        addressTo: any;
        tag: string;
        tagFrom: any;
        tagTo: any;
        status: string;
        type: any;
        updated: any;
        txid: string;
        timestamp: number;
        datetime: string;
        fee: any;
    };
    repayMargin(code: any, amount: any, symbol?: any, params?: {}): Promise<any>;
    borrowMargin(code: any, amount: any, symbol?: any, params?: {}): Promise<any>;
    parseMarginLoan(info: any, currency?: any): {
        id: string;
        currency: any;
        amount: any;
        symbol: any;
        timestamp: number;
        datetime: string;
        info: any;
    };
    fetchBorrowRate(code: any, params?: {}): Promise<{
        currency: any;
        rate: number;
        period: number;
        timestamp: number;
        datetime: string;
        info: any;
    }>;
    parseBorrowRate(info: any, currency?: any): {
        currency: any;
        rate: number;
        period: number;
        timestamp: number;
        datetime: string;
        info: any;
    };
    fetchBorrowRates(params?: {}): Promise<any[]>;
    parseBorrowRates(info: any, codeKey: any): any[];
    transfer(code: any, amount: any, fromAccount: any, toAccount: any, params?: {}): Promise<any>;
    parseTransferStatus(status: any): string;
    parseTransfer(transfer: any, currency?: any): {
        id: string;
        timestamp: any;
        datetime: any;
        currency: any;
        amount: any;
        fromAccount: any;
        toAccount: any;
        status: string;
    };
    fetchBorrowInterest(code?: any, symbol?: any, since?: any, limit?: any, params?: {}): Promise<object[]>;
    parseBorrowInterest(info: any, market?: any): {
        symbol: string;
        marginMode: string;
        currency: any;
        interest: number;
        interestRate: number;
        amountBorrowed: number;
        timestamp: number;
        datetime: string;
        info: any;
    };
    handleMarginModeAndParams(methodName: any, params?: {}, defaultValue?: any): any[];
    nonce(): number;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(code: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): void;
}
