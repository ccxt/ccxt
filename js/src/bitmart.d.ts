import Exchange from './abstract/bitmart.js';
import { Int, OrderSide, Balances, OrderType, OHLCV, Order, Str, Trade, Transaction, Ticker, OrderBook, Tickers, Strings, Currency, Market } from './base/types.js';
/**
 * @class bitmart
 * @extends Exchange
 */
export default class bitmart extends Exchange {
    describe(): undefined;
    fetchTime(params?: {}): Promise<Int>;
    fetchStatus(params?: {}): Promise<{
        status: undefined;
        updated: undefined;
        eta: undefined;
        url: undefined;
        info: any;
    }>;
    fetchSpotMarkets(params?: {}): Promise<never[]>;
    fetchContractMarkets(params?: {}): Promise<never[]>;
    fetchMarkets(params?: {}): Promise<any>;
    fetchCurrencies(params?: {}): Promise<{}>;
    fetchTransactionFee(code: string, params?: {}): Promise<{
        info: any;
        withdraw: {};
        deposit: {};
    }>;
    parseDepositWithdrawFee(fee: any, currency?: Currency): {
        info: any;
        withdraw: {
            fee: import("./base/types.js").Num;
            percentage: undefined;
        };
        deposit: {
            fee: undefined;
            percentage: undefined;
        };
        networks: {};
    };
    fetchDepositWithdrawFee(code: string, params?: {}): Promise<{
        info: any;
        withdraw: {
            fee: import("./base/types.js").Num;
            percentage: undefined;
        };
        deposit: {
            fee: undefined;
            percentage: undefined;
        };
        networks: {};
    }>;
    parseTicker(ticker: any, market?: Market): Ticker;
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseTrade(trade: any, market?: Market): Trade;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchOrderTrades(id: string, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    customParseBalance(response: any, marketType: any): Balances;
    parseBalanceHelper(entry: any): import("./base/types.js").Account;
    fetchBalance(params?: {}): Promise<Balances>;
    parseTradingFee(fee: any, market?: Market): {
        info: any;
        symbol: string;
        maker: import("./base/types.js").Num;
        taker: import("./base/types.js").Num;
    };
    fetchTradingFee(symbol: string, params?: {}): Promise<{
        info: any;
        symbol: string;
        maker: import("./base/types.js").Num;
        taker: import("./base/types.js").Num;
    }>;
    parseOrder(order: any, market?: Market): Order;
    parseOrderSide(side: any): Str;
    parseOrderStatusByType(type: any, status: any): Str;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: any, price?: undefined, params?: {}): Promise<Order>;
    createSwapOrderRequest(symbol: string, type: OrderType, side: OrderSide, amount: any, price?: undefined, params?: {}): any;
    createSpotOrderRequest(symbol: string, type: OrderType, side: OrderSide, amount: any, price?: undefined, params?: {}): any;
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<any>;
    cancelAllOrders(symbol?: Str, params?: {}): Promise<undefined>;
    fetchOrdersByStatus(status: any, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchCanceledOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    fetchDepositAddress(code: string, params?: {}): Promise<{
        currency: string;
        address: Str;
        tag: Str;
        network: undefined;
        info: any;
    }>;
    safeNetwork(networkId: any): any;
    withdraw(code: string, amount: any, address: any, tag?: undefined, params?: {}): Promise<any>;
    fetchTransactionsByType(type: any, code?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    fetchDeposit(id: string, code?: Str, params?: {}): Promise<Transaction>;
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchWithdrawal(id: string, code?: Str, params?: {}): Promise<Transaction>;
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    parseTransactionStatus(status: any): Str;
    parseTransaction(transaction: any, currency?: Currency): Transaction;
    repayMargin(code: string, amount: any, symbol?: Str, params?: {}): Promise<any>;
    borrowMargin(code: string, amount: any, symbol?: Str, params?: {}): Promise<any>;
    parseMarginLoan(info: any, currency?: Currency): {
        id: Str;
        currency: string;
        amount: undefined;
        symbol: undefined;
        timestamp: number;
        datetime: string | undefined;
        info: any;
    };
    fetchIsolatedBorrowRate(symbol: string, params?: {}): Promise<{
        symbol: string;
        base: string;
        baseRate: import("./base/types.js").Num;
        quote: string;
        quoteRate: import("./base/types.js").Num;
        period: number;
        timestamp: undefined;
        datetime: undefined;
        info: any;
    }>;
    parseIsolatedBorrowRate(info: any, market?: Market): {
        symbol: string;
        base: string;
        baseRate: import("./base/types.js").Num;
        quote: string;
        quoteRate: import("./base/types.js").Num;
        period: number;
        timestamp: undefined;
        datetime: undefined;
        info: any;
    };
    fetchIsolatedBorrowRates(params?: {}): Promise<never[]>;
    transfer(code: string, amount: any, fromAccount: any, toAccount: any, params?: {}): Promise<any>;
    parseTransferStatus(status: any): Str;
    parseTransferToAccount(type: any): Str;
    parseTransferFromAccount(type: any): Str;
    parseTransfer(transfer: any, currency?: Currency): {
        id: Str;
        timestamp: Int;
        datetime: string | undefined;
        currency: string;
        amount: import("./base/types.js").Num;
        fromAccount: Str;
        toAccount: Str;
        status: Str;
    };
    fetchTransfers(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    fetchBorrowInterest(code?: Str, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    parseBorrowInterest(info: any, market?: Market): {
        symbol: Str;
        marginMode: string;
        currency: string;
        interest: import("./base/types.js").Num;
        interestRate: import("./base/types.js").Num;
        amountBorrowed: import("./base/types.js").Num;
        timestamp: Int;
        datetime: string | undefined;
        info: any;
    };
    fetchOpenInterest(symbol: string, params?: {}): Promise<import("./base/types.js").OpenInterest>;
    parseOpenInterest(interest: any, market?: Market): import("./base/types.js").OpenInterest;
    setLeverage(leverage: any, symbol?: Str, params?: {}): Promise<any>;
    fetchFundingRate(symbol: string, params?: {}): Promise<{
        info: any;
        symbol: string;
        markPrice: undefined;
        indexPrice: undefined;
        interestRate: undefined;
        estimatedSettlePrice: undefined;
        timestamp: Int;
        datetime: string | undefined;
        fundingRate: import("./base/types.js").Num;
        fundingTimestamp: undefined;
        fundingDatetime: undefined;
        nextFundingRate: undefined;
        nextFundingTimestamp: undefined;
        nextFundingDatetime: undefined;
        previousFundingRate: import("./base/types.js").Num;
        previousFundingTimestamp: undefined;
        previousFundingDatetime: undefined;
    }>;
    parseFundingRate(contract: any, market?: Market): {
        info: any;
        symbol: string;
        markPrice: undefined;
        indexPrice: undefined;
        interestRate: undefined;
        estimatedSettlePrice: undefined;
        timestamp: Int;
        datetime: string | undefined;
        fundingRate: import("./base/types.js").Num;
        fundingTimestamp: undefined;
        fundingDatetime: undefined;
        nextFundingRate: undefined;
        nextFundingTimestamp: undefined;
        nextFundingDatetime: undefined;
        previousFundingRate: import("./base/types.js").Num;
        previousFundingTimestamp: undefined;
        previousFundingDatetime: undefined;
    };
    fetchPosition(symbol: string, params?: {}): Promise<import("./base/types.js").Position>;
    fetchPositions(symbols?: Strings, params?: {}): Promise<import("./base/types.js").Position[]>;
    parsePosition(position: any, market?: Market): import("./base/types.js").Position;
    fetchMyLiquidations(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<import("./base/types.js").Liquidation[]>;
    parseLiquidation(liquidation: any, market?: Market): import("./base/types.js").Liquidation;
    nonce(): number;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: undefined, body?: undefined): {
        url: string;
        method: string;
        body: undefined;
        headers: undefined;
    };
    handleErrors(code: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): undefined;
}
