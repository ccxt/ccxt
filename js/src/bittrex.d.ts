import Exchange from './abstract/bittrex.js';
export default class bittrex extends Exchange {
    describe(): any;
    feeToPrecision(symbol: any, fee: any): any;
    fetchMarkets(params?: {}): Promise<any[]>;
    parseBalance(response: any): import("./base/types.js").Balances;
    fetchBalance(params?: {}): Promise<import("./base/types.js").Balances>;
    fetchOrderBook(symbol: any, limit?: any, params?: {}): Promise<import("./base/types.js").OrderBook>;
    fetchCurrencies(params?: {}): Promise<{}>;
    parseTicker(ticker: any, market?: any): import("./base/types.js").Ticker;
    fetchTickers(symbols?: any, params?: {}): Promise<any>;
    fetchTicker(symbol: any, params?: {}): Promise<import("./base/types.js").Ticker>;
    fetchBidsAsks(symbols?: any, params?: {}): Promise<any>;
    parseTrade(trade: any, market?: any): import("./base/types.js").Trade;
    fetchTime(params?: {}): Promise<number>;
    fetchTrades(symbol: any, since?: any, limit?: any, params?: {}): Promise<import("./base/types.js").Trade[]>;
    fetchTradingFee(symbol: any, params?: {}): Promise<{
        info: any;
        symbol: any;
        maker: number;
        taker: number;
    }>;
    fetchTradingFees(params?: {}): Promise<{
        info: any;
    }>;
    parseTradingFee(fee: any, market?: any): {
        info: any;
        symbol: any;
        maker: number;
        taker: number;
    };
    parseTradingFees(fees: any): {
        info: any;
    };
    parseOHLCV(ohlcv: any, market?: any): number[];
    fetchOHLCV(symbol: any, timeframe?: string, since?: any, limit?: any, params?: {}): Promise<import("./base/types.js").OHLCV[]>;
    fetchOpenOrders(symbol?: any, since?: any, limit?: any, params?: {}): Promise<import("./base/types.js").Order[]>;
    fetchOrderTrades(id: any, symbol?: any, since?: any, limit?: any, params?: {}): Promise<import("./base/types.js").Trade[]>;
    createOrder(symbol: any, type: any, side: any, amount: any, price?: any, params?: {}): Promise<any>;
    cancelOrder(id: any, symbol?: any, params?: {}): Promise<any>;
    cancelAllOrders(symbol?: any, params?: {}): Promise<import("./base/types.js").Order[]>;
    fetchDeposit(id: any, code?: any, params?: {}): Promise<any>;
    fetchDeposits(code?: any, since?: any, limit?: any, params?: {}): Promise<any>;
    fetchPendingDeposits(code?: any, since?: any, limit?: any, params?: {}): Promise<any>;
    fetchWithdrawal(id: any, code?: any, params?: {}): Promise<any>;
    fetchWithdrawals(code?: any, since?: any, limit?: any, params?: {}): Promise<any>;
    fetchPendingWithdrawals(code?: any, since?: any, limit?: any, params?: {}): Promise<any>;
    parseTransaction(transaction: any, currency?: any): {
        info: any;
        id: string;
        currency: any;
        amount: number;
        network: any;
        address: string;
        addressTo: any;
        addressFrom: any;
        tag: any;
        tagTo: any;
        tagFrom: any;
        status: string;
        type: string;
        updated: number;
        txid: string;
        timestamp: number;
        datetime: string;
        fee: {
            currency: any;
            cost: number;
        };
    };
    parseTimeInForce(timeInForce: any): string;
    parseOrder(order: any, market?: any): any;
    parseOrders(orders: any, market?: any, since?: any, limit?: any, params?: {}): import("./base/types.js").Order[];
    parseOrderStatus(status: any): string;
    fetchOrder(id: any, symbol?: any, params?: {}): Promise<any>;
    fetchMyTrades(symbol?: any, since?: any, limit?: any, params?: {}): Promise<any>;
    fetchClosedOrders(symbol?: any, since?: any, limit?: any, params?: {}): Promise<import("./base/types.js").Order[]>;
    createDepositAddress(code: any, params?: {}): Promise<{
        currency: any;
        address: string;
        tag: string;
        network: any;
        info: any;
    }>;
    fetchDepositAddress(code: any, params?: {}): Promise<{
        currency: any;
        address: string;
        tag: string;
        network: any;
        info: any;
    }>;
    withdraw(code: any, amount: any, address: any, tag?: any, params?: {}): Promise<{
        info: any;
        id: string;
        currency: any;
        amount: number;
        network: any;
        address: string;
        addressTo: any;
        addressFrom: any;
        tag: any;
        tagTo: any;
        tagFrom: any;
        status: string;
        type: string;
        updated: number;
        txid: string;
        timestamp: number;
        datetime: string;
        fee: {
            currency: any;
            cost: number;
        };
    }>;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(code: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): void;
}
