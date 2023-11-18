import Exchange from './abstract/bitget.js';
import { Int, OrderSide, OrderType, Trade, OHLCV, Order, FundingRateHistory, OrderRequest, FundingHistory, Balances, Str, Transaction, Ticker, OrderBook, Tickers, Market, Strings, Currency } from './base/types.js';
/**
 * @class bitget
 * @extends Exchange
 */
export default class bitget extends Exchange {
    describe(): undefined;
    setSandboxMode(enabled: any): void;
    fetchTime(params?: {}): Promise<Int>;
    fetchMarkets(params?: {}): Promise<never>;
    parseMarket(market: any): Market;
    fetchMarketsByType(type: any, params?: {}): Promise<Market[]>;
    fetchCurrencies(params?: {}): Promise<{}>;
    fetchMarketLeverageTiers(symbol: string, params?: {}): Promise<never[]>;
    parseMarketLeverageTiers(info: any, market?: Market): never[];
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    withdraw(code: string, amount: any, address: any, tag?: undefined, params?: {}): Promise<{
        id: undefined;
        info: any;
        txid: undefined;
        timestamp: undefined;
        datetime: undefined;
        network: undefined;
        addressFrom: undefined;
        address: undefined;
        addressTo: undefined;
        amount: undefined;
        type: string;
        currency: undefined;
        status: undefined;
        updated: undefined;
        tagFrom: undefined;
        tag: undefined;
        tagTo: undefined;
        comment: undefined;
        fee: undefined;
    }>;
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    parseTransaction(transaction: any, currency?: Currency): Transaction;
    parseTransactionStatus(status: any): Str;
    fetchDepositAddress(code: string, params?: {}): Promise<{
        currency: string;
        address: Str;
        tag: Str;
        network: Str;
        info: any;
    }>;
    parseDepositAddress(depositAddress: any, currency?: Currency): {
        currency: string;
        address: Str;
        tag: Str;
        network: Str;
        info: any;
    };
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseTicker(ticker: any, market?: Market): Ticker;
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    parseTrade(trade: any, market?: Market): Trade;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchTradingFee(symbol: string, params?: {}): Promise<{
        info: any;
        symbol: string;
        maker: import("./base/types.js").Num;
        taker: import("./base/types.js").Num;
    }>;
    fetchTradingFees(params?: {}): Promise<{}>;
    parseTradingFee(data: any, market?: Market): {
        info: any;
        symbol: string;
        maker: import("./base/types.js").Num;
        taker: import("./base/types.js").Num;
    };
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    fetchBalance(params?: {}): Promise<Balances>;
    parseBalance(balance: any): Balances;
    parseOrderStatus(status: any): Str;
    parseOrder(order: any, market?: Market): Order;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: any, price?: undefined, params?: {}): Promise<Order>;
    createOrderRequest(symbol: any, type: any, side: any, amount: any, price?: undefined, params?: {}): any;
    createOrders(orders: OrderRequest[], params?: {}): Promise<Order[]>;
    editOrder(id: string, symbol: any, type: any, side: any, amount?: undefined, price?: undefined, params?: {}): Promise<Order>;
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    cancelOrders(ids: any, symbol?: Str, params?: {}): Promise<undefined>;
    cancelAllOrders(symbol?: Str, params?: {}): Promise<any>;
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchCanceledOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchCanceledAndClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    addPaginationCursorToResult(response: any, data: any): any;
    fetchLedger(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    parseLedgerEntry(item: any, currency?: Currency): {
        info: any;
        id: Str;
        timestamp: Int;
        datetime: string | undefined;
        direction: undefined;
        account: undefined;
        referenceId: undefined;
        referenceAccount: undefined;
        type: Str;
        currency: string;
        amount: number;
        before: undefined;
        after: import("./base/types.js").Num;
        status: undefined;
        fee: import("./base/types.js").Num;
    };
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchOrderTrades(id: string, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchPosition(symbol: string, params?: {}): Promise<import("./base/types.js").Position>;
    fetchPositions(symbols?: Strings, params?: {}): Promise<import("./base/types.js").Position[]>;
    parsePosition(position: any, market?: Market): import("./base/types.js").Position;
    fetchFundingRateHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<FundingRateHistory[]>;
    fetchFundingRate(symbol: string, params?: {}): Promise<{
        info: any;
        symbol: string;
        markPrice: undefined;
        indexPrice: undefined;
        interestRate: undefined;
        estimatedSettlePrice: undefined;
        timestamp: undefined;
        datetime: undefined;
        fundingRate: import("./base/types.js").Num;
        fundingTimestamp: undefined;
        fundingDatetime: undefined;
        nextFundingRate: undefined;
        nextFundingTimestamp: undefined;
        nextFundingDatetime: undefined;
        previousFundingRate: undefined;
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
        timestamp: undefined;
        datetime: undefined;
        fundingRate: import("./base/types.js").Num;
        fundingTimestamp: undefined;
        fundingDatetime: undefined;
        nextFundingRate: undefined;
        nextFundingTimestamp: undefined;
        nextFundingDatetime: undefined;
        previousFundingRate: undefined;
        previousFundingTimestamp: undefined;
        previousFundingDatetime: undefined;
    };
    fetchFundingHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<FundingHistory[]>;
    parseFundingHistory(contract: any, market?: Market): {
        info: any;
        symbol: string;
        timestamp: Int;
        datetime: string | undefined;
        code: string;
        amount: import("./base/types.js").Num;
        id: Str;
    };
    parseFundingHistories(contracts: any, market?: undefined, since?: Int, limit?: Int): FundingHistory[];
    modifyMarginHelper(symbol: string, amount: any, type: any, params?: {}): Promise<any>;
    parseMarginModification(data: any, market?: Market): {
        info: any;
        type: undefined;
        amount: undefined;
        code: string;
        symbol: string;
        status: string;
    };
    reduceMargin(symbol: string, amount: any, params?: {}): Promise<any>;
    addMargin(symbol: string, amount: any, params?: {}): Promise<any>;
    fetchLeverage(symbol: string, params?: {}): Promise<any>;
    setLeverage(leverage: any, symbol?: Str, params?: {}): Promise<any>;
    setMarginMode(marginMode: any, symbol?: Str, params?: {}): Promise<any>;
    setPositionMode(hedged: any, symbol?: Str, params?: {}): Promise<any>;
    fetchOpenInterest(symbol: string, params?: {}): Promise<import("./base/types.js").OpenInterest>;
    fetchTransfers(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
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
    parseTransferStatus(status: any): Str;
    parseOpenInterest(interest: any, market?: Market): import("./base/types.js").OpenInterest;
    borrowMargin(code: string, amount: any, symbol?: Str, params?: {}): Promise<{
        id: Str;
        currency: string;
        amount: number;
        symbol: undefined;
        timestamp: undefined;
        datetime: undefined;
        info: any;
    }>;
    repayMargin(code: string, amount: any, symbol?: Str, params?: {}): Promise<{
        id: Str;
        currency: string;
        amount: number;
        symbol: undefined;
        timestamp: undefined;
        datetime: undefined;
        info: any;
    }>;
    parseMarginLoan(info: any, currency?: Currency): {
        id: Str;
        currency: string;
        amount: number;
        symbol: undefined;
        timestamp: undefined;
        datetime: undefined;
        info: any;
    };
    fetchMyLiquidations(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<import("./base/types.js").Liquidation[]>;
    parseLiquidation(liquidation: any, market?: Market): import("./base/types.js").Liquidation;
    fetchIsolatedBorrowRate(symbol: string, params?: {}): Promise<{
        symbol: string;
        base: string;
        baseRate: import("./base/types.js").Num;
        quote: string;
        quoteRate: import("./base/types.js").Num;
        period: number;
        timestamp: Int;
        datetime: string | undefined;
        info: any;
    }>;
    parseIsolatedBorrowRate(info: any, market?: Market): {
        symbol: string;
        base: string;
        baseRate: import("./base/types.js").Num;
        quote: string;
        quoteRate: import("./base/types.js").Num;
        period: number;
        timestamp: Int;
        datetime: string | undefined;
        info: any;
    };
    fetchCrossBorrowRate(code: string, params?: {}): Promise<{
        currency: string;
        rate: import("./base/types.js").Num;
        period: number;
        timestamp: Int;
        datetime: string | undefined;
        info: any;
    }>;
    parseBorrowRate(info: any, currency?: Currency): {
        currency: string;
        rate: import("./base/types.js").Num;
        period: number;
        timestamp: Int;
        datetime: string | undefined;
        info: any;
    };
    fetchBorrowInterest(code?: Str, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    parseBorrowInterest(info: any, market?: Market): {
        symbol: Str;
        marginMode: string;
        currency: string;
        interest: import("./base/types.js").Num;
        interestRate: import("./base/types.js").Num;
        amountBorrowed: undefined;
        timestamp: Int;
        datetime: string | undefined;
        info: any;
    };
    handleErrors(code: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): undefined;
    sign(path: any, api?: never[], method?: string, params?: {}, headers?: undefined, body?: undefined): {
        url: string;
        method: string;
        body: undefined;
        headers: undefined;
    };
}
