import Exchange from './abstract/deribit.js';
import { Balances, Currency, FundingRateHistory, Greeks, Int, Liquidation, Market, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, Transaction } from './base/types.js';
/**
 * @class deribit
 * @extends Exchange
 */
export default class deribit extends Exchange {
    describe(): undefined;
    fetchTime(params?: {}): Promise<Int>;
    fetchCurrencies(params?: {}): Promise<{}>;
    codeFromOptions(methodName: any, params?: {}): any;
    fetchStatus(params?: {}): Promise<{
        status: string;
        updated: Int;
        eta: undefined;
        url: undefined;
        info: any;
    }>;
    fetchAccounts(params?: {}): Promise<never[]>;
    parseAccount(account: any, currency?: Currency): {
        info: any;
        id: Str;
        type: Str;
        code: string;
    };
    fetchMarkets(params?: {}): Promise<never[]>;
    parseBalance(balance: any): Balances;
    fetchBalance(params?: {}): Promise<Balances>;
    createDepositAddress(code: string, params?: {}): Promise<{
        currency: string;
        address: Str;
        tag: undefined;
        info: any;
    }>;
    fetchDepositAddress(code: string, params?: {}): Promise<{
        currency: string;
        address: Str;
        tag: undefined;
        network: undefined;
        info: any;
    }>;
    parseTicker(ticker: any, market?: Market): Ticker;
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseTrade(trade: any, market?: Market): Trade;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchTradingFees(params?: {}): Promise<{}>;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseOrderStatus(status: any): Str;
    parseTimeInForce(timeInForce: any): Str;
    parseOrderType(orderType: any): Str;
    parseOrder(order: any, market?: Market): Order;
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: any, price?: undefined, params?: {}): Promise<Order>;
    editOrder(id: string, symbol: any, type: any, side: any, amount?: undefined, price?: undefined, params?: {}): Promise<Order>;
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    cancelAllOrders(symbol?: Str, params?: {}): Promise<any>;
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOrderTrades(id: string, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    parseTransactionStatus(status: any): Str;
    parseTransaction(transaction: any, currency?: Currency): Transaction;
    parsePosition(position: any, market?: Market): import("./base/types.js").Position;
    fetchPosition(symbol: string, params?: {}): Promise<import("./base/types.js").Position>;
    fetchPositions(symbols?: Strings, params?: {}): Promise<import("./base/types.js").Position[]>;
    fetchVolatilityHistory(code: string, params?: {}): Promise<never[]>;
    parseVolatilityHistory(volatility: any): never[];
    fetchTransfers(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    transfer(code: string, amount: any, fromAccount: any, toAccount: any, params?: {}): Promise<{
        info: any;
        id: Str;
        status: Str;
        amount: import("./base/types.js").Num;
        code: string;
        fromAccount: Str;
        toAccount: Str;
        timestamp: number | undefined;
        datetime: string | undefined;
    }>;
    parseTransfer(transfer: any, currency?: Currency): {
        info: any;
        id: Str;
        status: Str;
        amount: import("./base/types.js").Num;
        code: string;
        fromAccount: Str;
        toAccount: Str;
        timestamp: number | undefined;
        datetime: string | undefined;
    };
    parseTransferStatus(status: any): Str;
    withdraw(code: string, amount: any, address: any, tag?: undefined, params?: {}): Promise<Transaction>;
    parseDepositWithdrawFee(fee: any, currency?: Currency): {
        info: any;
        withdraw: {
            fee: import("./base/types.js").Num;
            percentage: boolean;
        };
        deposit: {
            fee: undefined;
            percentage: undefined;
        };
        networks: {};
    };
    fetchDepositWithdrawFees(codes?: Strings, params?: {}): Promise<any>;
    fetchFundingRate(symbol: string, params?: {}): Promise<{
        info: any;
        symbol: string;
        markPrice: undefined;
        indexPrice: import("./base/types.js").Num;
        interestRate: undefined;
        estimatedSettlePrice: undefined;
        timestamp: Int;
        datetime: string | undefined;
        fundingRate: number;
        fundingTimestamp: undefined;
        fundingDatetime: undefined;
        nextFundingRate: undefined;
        nextFundingTimestamp: undefined;
        nextFundingDatetime: undefined;
        previousFundingRate: undefined;
        previousFundingTimestamp: undefined;
        previousFundingDatetime: undefined;
    }>;
    fetchFundingRateHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<FundingRateHistory[]>;
    parseFundingRate(contract: any, market?: Market): {
        info: any;
        symbol: string;
        markPrice: undefined;
        indexPrice: import("./base/types.js").Num;
        interestRate: undefined;
        estimatedSettlePrice: undefined;
        timestamp: Int;
        datetime: string | undefined;
        fundingRate: number;
        fundingTimestamp: undefined;
        fundingDatetime: undefined;
        nextFundingRate: undefined;
        nextFundingTimestamp: undefined;
        nextFundingDatetime: undefined;
        previousFundingRate: undefined;
        previousFundingTimestamp: undefined;
        previousFundingDatetime: undefined;
    };
    fetchLiquidations(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Liquidation[]>;
    addPaginationCursorToResult(cursor: any, data: any): any;
    fetchMyLiquidations(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Liquidation[]>;
    parseLiquidation(liquidation: any, market?: Market): Liquidation;
    fetchGreeks(symbol: string, params?: {}): Promise<Greeks>;
    parseGreeks(greeks: any, market?: Market): {
        symbol: string;
        timestamp: Int;
        datetime: string | undefined;
        delta: import("./base/types.js").Num;
        gamma: import("./base/types.js").Num;
        theta: import("./base/types.js").Num;
        vega: import("./base/types.js").Num;
        rho: import("./base/types.js").Num;
        bidSize: import("./base/types.js").Num;
        askSize: import("./base/types.js").Num;
        bidImpliedVolatility: import("./base/types.js").Num;
        askImpliedVolatility: import("./base/types.js").Num;
        markImpliedVolatility: import("./base/types.js").Num;
        bidPrice: import("./base/types.js").Num;
        askPrice: import("./base/types.js").Num;
        markPrice: import("./base/types.js").Num;
        lastPrice: import("./base/types.js").Num;
        underlyingPrice: import("./base/types.js").Num;
        info: any;
    };
    nonce(): number;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: undefined, body?: undefined): {
        url: string;
        method: string;
        body: undefined;
        headers: undefined;
    };
    handleErrors(httpCode: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): undefined;
}
