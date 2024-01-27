import Exchange from './abstract/bitget.js';
import type { Int, OrderSide, OrderType, Trade, OHLCV, Order, FundingRateHistory, OrderRequest, FundingHistory, Balances, Str, Transaction, Ticker, OrderBook, Tickers, Market, Strings, Currency, Position, Liquidation } from './base/types.js';
/**
 * @class bitget
 * @augments Exchange
 */
export default class bitget extends Exchange {
    describe(): any;
    setSandboxMode(enabled: any): void;
    convertSymbolForSandbox(symbol: any): any;
    handleProductTypeAndParams(market?: any, params?: {}): {}[];
    fetchTime(params?: {}): Promise<number>;
    fetchMarkets(params?: {}): Promise<any>;
    parseMarket(market: any): Market;
    fetchMarketsByType(type: any, params?: {}): Promise<import("./base/types.js").MarketInterface[]>;
    fetchCurrencies(params?: {}): Promise<{}>;
    fetchMarketLeverageTiers(symbol: string, params?: {}): Promise<any[]>;
    parseMarketLeverageTiers(info: any, market?: Market): any[];
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    withdraw(code: string, amount: any, address: any, tag?: any, params?: {}): Promise<{
        id: string;
        info: any;
        txid: any;
        timestamp: any;
        datetime: any;
        network: any;
        addressFrom: any;
        address: any;
        addressTo: any;
        amount: any;
        type: string;
        currency: any;
        status: any;
        updated: any;
        tagFrom: any;
        tag: any;
        tagTo: any;
        comment: any;
        fee: any;
    }>;
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    parseTransaction(transaction: any, currency?: Currency): Transaction;
    parseTransactionStatus(status: any): string;
    fetchDepositAddress(code: string, params?: {}): Promise<{
        currency: string;
        address: string;
        tag: string;
        network: string;
        info: any;
    }>;
    parseDepositAddress(depositAddress: any, currency?: Currency): {
        currency: string;
        address: string;
        tag: string;
        network: string;
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
        maker: number;
        taker: number;
    }>;
    fetchTradingFees(params?: {}): Promise<{}>;
    parseTradingFee(data: any, market?: Market): {
        info: any;
        symbol: string;
        maker: number;
        taker: number;
    };
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    fetchBalance(params?: {}): Promise<Balances>;
    parseBalance(balance: any): Balances;
    parseOrderStatus(status: any): string;
    parseOrder(order: any, market?: Market): Order;
    createMarketBuyOrderWithCost(symbol: string, cost: any, params?: {}): Promise<Order>;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: any, price?: any, params?: {}): Promise<Order>;
    createOrderRequest(symbol: any, type: any, side: any, amount: any, price?: any, params?: {}): any;
    createOrders(orders: OrderRequest[], params?: {}): Promise<Order[]>;
    editOrder(id: string, symbol: any, type: any, side: any, amount?: any, price?: any, params?: {}): Promise<Order>;
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    cancelOrders(ids: any, symbol?: Str, params?: {}): Promise<Order[]>;
    cancelAllOrders(symbol?: Str, params?: {}): Promise<any>;
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchCanceledOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchCanceledAndClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchLedger(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    parseLedgerEntry(item: any, currency?: Currency): {
        info: any;
        id: string;
        timestamp: number;
        datetime: string;
        direction: string;
        account: any;
        referenceId: any;
        referenceAccount: any;
        type: string;
        currency: string;
        amount: number;
        before: any;
        after: number;
        status: any;
        fee: number;
    };
    parseLedgerType(type: any): string;
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchPosition(symbol: string, params?: {}): Promise<Position>;
    fetchPositions(symbols?: Strings, params?: {}): Promise<Position[]>;
    parsePosition(position: any, market?: Market): Position;
    fetchFundingRateHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<FundingRateHistory[]>;
    fetchFundingRate(symbol: string, params?: {}): Promise<{
        info: any;
        symbol: string;
        markPrice: any;
        indexPrice: any;
        interestRate: any;
        estimatedSettlePrice: any;
        timestamp: any;
        datetime: any;
        fundingRate: number;
        fundingTimestamp: any;
        fundingDatetime: any;
        nextFundingRate: any;
        nextFundingTimestamp: any;
        nextFundingDatetime: any;
        previousFundingRate: any;
        previousFundingTimestamp: any;
        previousFundingDatetime: any;
    }>;
    parseFundingRate(contract: any, market?: Market): {
        info: any;
        symbol: string;
        markPrice: any;
        indexPrice: any;
        interestRate: any;
        estimatedSettlePrice: any;
        timestamp: any;
        datetime: any;
        fundingRate: number;
        fundingTimestamp: any;
        fundingDatetime: any;
        nextFundingRate: any;
        nextFundingTimestamp: any;
        nextFundingDatetime: any;
        previousFundingRate: any;
        previousFundingTimestamp: any;
        previousFundingDatetime: any;
    };
    fetchFundingHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<FundingHistory[]>;
    parseFundingHistory(contract: any, market?: Market): {
        info: any;
        symbol: string;
        timestamp: number;
        datetime: string;
        code: string;
        amount: number;
        id: string;
    };
    parseFundingHistories(contracts: any, market?: any, since?: Int, limit?: Int): FundingHistory[];
    modifyMarginHelper(symbol: string, amount: any, type: any, params?: {}): Promise<any>;
    parseMarginModification(data: any, market?: Market): {
        info: any;
        type: any;
        amount: any;
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
    parseOpenInterest(interest: any, market?: Market): import("./base/types.js").OpenInterest;
    fetchTransfers(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    transfer(code: string, amount: any, fromAccount: any, toAccount: any, params?: {}): Promise<{
        info: any;
        id: string;
        timestamp: number;
        datetime: string;
        currency: string;
        amount: number;
        fromAccount: string;
        toAccount: string;
        status: string;
    }>;
    parseTransfer(transfer: any, currency?: Currency): {
        info: any;
        id: string;
        timestamp: number;
        datetime: string;
        currency: string;
        amount: number;
        fromAccount: string;
        toAccount: string;
        status: string;
    };
    parseTransferStatus(status: any): string;
    parseDepositWithdrawFee(fee: any, currency?: Currency): {
        info: any;
        withdraw: {
            fee: any;
            percentage: any;
        };
        deposit: {
            fee: any;
            percentage: any;
        };
        networks: {};
    };
    fetchDepositWithdrawFees(codes?: Strings, params?: {}): Promise<any>;
    borrowCrossMargin(code: string, amount: any, params?: {}): Promise<{
        id: string;
        currency: string;
        amount: number;
        symbol: any;
        timestamp: any;
        datetime: any;
        info: any;
    }>;
    borrowIsolatedMargin(symbol: string, code: string, amount: any, params?: {}): Promise<{
        id: string;
        currency: string;
        amount: number;
        symbol: any;
        timestamp: any;
        datetime: any;
        info: any;
    }>;
    repayIsolatedMargin(symbol: string, code: string, amount: any, params?: {}): Promise<{
        id: string;
        currency: string;
        amount: number;
        symbol: any;
        timestamp: any;
        datetime: any;
        info: any;
    }>;
    repayCrossMargin(code: string, amount: any, params?: {}): Promise<{
        id: string;
        currency: string;
        amount: number;
        symbol: any;
        timestamp: any;
        datetime: any;
        info: any;
    }>;
    parseMarginLoan(info: any, currency?: Currency, market?: Market): {
        id: string;
        currency: string;
        amount: number;
        symbol: any;
        timestamp: any;
        datetime: any;
        info: any;
    };
    fetchMyLiquidations(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Liquidation[]>;
    parseLiquidation(liquidation: any, market?: Market): Liquidation;
    fetchIsolatedBorrowRate(symbol: string, params?: {}): Promise<{
        symbol: string;
        base: string;
        baseRate: number;
        quote: string;
        quoteRate: number;
        period: number;
        timestamp: number;
        datetime: string;
        info: any;
    }>;
    parseIsolatedBorrowRate(info: any, market?: Market): {
        symbol: string;
        base: string;
        baseRate: number;
        quote: string;
        quoteRate: number;
        period: number;
        timestamp: number;
        datetime: string;
        info: any;
    };
    fetchCrossBorrowRate(code: string, params?: {}): Promise<{
        currency: string;
        rate: number;
        period: number;
        timestamp: number;
        datetime: string;
        info: any;
    }>;
    parseBorrowRate(info: any, currency?: Currency): {
        currency: string;
        rate: number;
        period: number;
        timestamp: number;
        datetime: string;
        info: any;
    };
    fetchBorrowInterest(code?: Str, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    parseBorrowInterest(info: any, market?: Market): {
        symbol: string;
        marginMode: string;
        currency: string;
        interest: number;
        interestRate: number;
        amountBorrowed: any;
        timestamp: number;
        datetime: string;
        info: any;
    };
    closePosition(symbol: string, side?: OrderSide, params?: {}): Promise<Order>;
    closeAllPositions(params?: {}): Promise<Position[]>;
    handleErrors(code: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): any;
    sign(path: any, api?: any[], method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
}
