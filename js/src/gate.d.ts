import Exchange from './abstract/gate.js';
import { Int, OrderSide, OrderType, OHLCV, Trade, FundingRateHistory, OpenInterest, Order, Balances, OrderRequest, FundingHistory, Str, Transaction, Ticker, OrderBook, Tickers, Greeks, Strings, Market, Currency, MarketInterface } from './base/types.js';
/**
 * @class gate
 * @extends Exchange
 */
export default class gate extends Exchange {
    describe(): any;
    setSandboxMode(enable: any): void;
    convertExpireDate(date: any): string;
    createExpiredOptionMarket(symbol: any): MarketInterface;
    market(symbol: any): any;
    safeMarket(marketId?: any, market?: any, delimiter?: any, marketType?: any): MarketInterface;
    fetchMarkets(params?: {}): Promise<any>;
    fetchSpotMarkets(params?: {}): Promise<any[]>;
    fetchContractMarkets(params?: {}): Promise<any[]>;
    parseContractMarket(market: any, settleId: any): {
        id: string;
        symbol: string;
        base: string;
        quote: string;
        settle: string;
        baseId: string;
        quoteId: string;
        settleId: any;
        type: string;
        spot: boolean;
        margin: boolean;
        swap: boolean;
        future: boolean;
        option: boolean;
        active: boolean;
        contract: boolean;
        linear: boolean;
        inverse: boolean;
        taker: number;
        maker: number;
        contractSize: number;
        expiry: number;
        expiryDatetime: string;
        strike: any;
        optionType: any;
        precision: {
            amount: number;
            price: number;
        };
        limits: {
            leverage: {
                min: number;
                max: number;
            };
            amount: {
                min: number;
                max: number;
            };
            price: {
                min: number;
                max: number;
            };
            cost: {
                min: any;
                max: any;
            };
        };
        created: any;
        info: any;
    };
    fetchOptionMarkets(params?: {}): Promise<any[]>;
    fetchOptionUnderlyings(): Promise<any[]>;
    prepareRequest(market?: any, type?: any, params?: {}): {}[];
    spotOrderPrepareRequest(market?: any, stop?: boolean, params?: {}): any[];
    multiOrderSpotPrepareRequest(market?: any, stop?: boolean, params?: {}): any[];
    getMarginMode(stop: any, params: any): any[];
    getSettlementCurrencies(type: any, method: any): any;
    fetchCurrencies(params?: {}): Promise<{}>;
    fetchFundingRate(symbol: string, params?: {}): Promise<{
        info: any;
        symbol: string;
        markPrice: number;
        indexPrice: number;
        interestRate: number;
        estimatedSettlePrice: any;
        timestamp: any;
        datetime: any;
        fundingRate: number;
        fundingTimestamp: number;
        fundingDatetime: string;
        nextFundingRate: number;
        nextFundingTimestamp: any;
        nextFundingDatetime: any;
        previousFundingRate: any;
        previousFundingTimestamp: any;
        previousFundingDatetime: any;
    }>;
    fetchFundingRates(symbols?: Strings, params?: {}): Promise<any>;
    parseFundingRate(contract: any, market?: Market): {
        info: any;
        symbol: string;
        markPrice: number;
        indexPrice: number;
        interestRate: number;
        estimatedSettlePrice: any;
        timestamp: any;
        datetime: any;
        fundingRate: number;
        fundingTimestamp: number;
        fundingDatetime: string;
        nextFundingRate: number;
        nextFundingTimestamp: any;
        nextFundingDatetime: any;
        previousFundingRate: any;
        previousFundingTimestamp: any;
        previousFundingDatetime: any;
    };
    fetchNetworkDepositAddress(code: string, params?: {}): Promise<{}>;
    fetchDepositAddress(code: string, params?: {}): Promise<{
        info: any;
        code: string;
        currency: string;
        address: any;
        tag: any;
        network: any;
    }>;
    fetchTradingFee(symbol: string, params?: {}): Promise<{
        info: any;
        symbol: string;
        maker: number;
        taker: number;
    }>;
    fetchTradingFees(params?: {}): Promise<{}>;
    parseTradingFees(response: any): {};
    parseTradingFee(info: any, market?: Market): {
        info: any;
        symbol: string;
        maker: number;
        taker: number;
    };
    fetchTransactionFees(codes?: any, params?: {}): Promise<{}>;
    fetchDepositWithdrawFees(codes?: Strings, params?: {}): Promise<any>;
    parseDepositWithdrawFee(fee: any, currency?: Currency): {
        info: any;
        withdraw: {
            fee: number;
            percentage: boolean;
        };
        deposit: {
            fee: number;
            percentage: boolean;
        };
        networks: {};
    };
    fetchFundingHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<FundingHistory[]>;
    parseFundingHistories(response: any, symbol: any, since: any, limit: any): FundingHistory[];
    parseFundingHistory(info: any, market?: Market): {
        info: any;
        symbol: string;
        code: string;
        timestamp: number;
        datetime: string;
        id: any;
        amount: number;
    };
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    parseTicker(ticker: any, market?: Market): Ticker;
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    parseBalanceHelper(entry: any): import("./base/types.js").Account;
    fetchBalance(params?: {}): Promise<Balances>;
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    fetchOptionOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    fetchFundingRateHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<FundingRateHistory[]>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchOrderTrades(id: string, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseTrade(trade: any, market?: Market): Trade;
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    withdraw(code: string, amount: any, address: any, tag?: any, params?: {}): Promise<Transaction>;
    parseTransactionStatus(status: any): string;
    parseTransactionType(type: any): string;
    parseTransaction(transaction: any, currency?: Currency): Transaction;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: any, price?: any, params?: {}): Promise<Order>;
    createOrders(orders: OrderRequest[], params?: {}): Promise<Order[]>;
    createOrderRequest(symbol: string, type: OrderType, side: OrderSide, amount: any, price?: any, params?: {}): any;
    editOrder(id: string, symbol: any, type: any, side: any, amount?: any, price?: any, params?: {}): Promise<Order>;
    parseOrderStatus(status: any): string;
    parseOrder(order: any, market?: Market): Order;
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOrdersByStatus(status: any, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    cancelAllOrders(symbol?: Str, params?: {}): Promise<Order[]>;
    transfer(code: string, amount: any, fromAccount: any, toAccount: any, params?: {}): Promise<{
        id: string;
        timestamp: number;
        datetime: string;
        currency: string;
        amount: any;
        fromAccount: any;
        toAccount: any;
        status: any;
        info: any;
    }>;
    parseTransfer(transfer: any, currency?: Currency): {
        id: string;
        timestamp: number;
        datetime: string;
        currency: string;
        amount: any;
        fromAccount: any;
        toAccount: any;
        status: any;
        info: any;
    };
    setLeverage(leverage: any, symbol?: Str, params?: {}): Promise<any>;
    parsePosition(position: any, market?: Market): import("./base/types.js").Position;
    fetchPosition(symbol: string, params?: {}): Promise<import("./base/types.js").Position>;
    fetchPositions(symbols?: Strings, params?: {}): Promise<import("./base/types.js").Position[]>;
    fetchLeverageTiers(symbols?: Strings, params?: {}): Promise<{}>;
    parseMarketLeverageTiers(info: any, market?: Market): any[];
    repayMargin(code: string, amount: any, symbol?: Str, params?: {}): Promise<{
        id: number;
        currency: string;
        amount: number;
        symbol: string;
        timestamp: number;
        datetime: string;
        info: any;
    }>;
    borrowMargin(code: string, amount: any, symbol?: Str, params?: {}): Promise<{
        id: number;
        currency: string;
        amount: number;
        symbol: string;
        timestamp: number;
        datetime: string;
        info: any;
    }>;
    parseMarginLoan(info: any, currency?: Currency): {
        id: number;
        currency: string;
        amount: number;
        symbol: string;
        timestamp: number;
        datetime: string;
        info: any;
    };
    sign(path: any, api?: any[], method?: string, params?: {}, headers?: any, body?: any): {
        url: any;
        method: string;
        body: any;
        headers: any;
    };
    modifyMarginHelper(symbol: string, amount: any, params?: {}): Promise<{
        info: any;
        amount: any;
        code: any;
        symbol: string;
        total: number;
        status: string;
    }>;
    parseMarginModification(data: any, market?: Market): {
        info: any;
        amount: any;
        code: any;
        symbol: string;
        total: number;
        status: string;
    };
    reduceMargin(symbol: string, amount: any, params?: {}): Promise<{
        info: any;
        amount: any;
        code: any;
        symbol: string;
        total: number;
        status: string;
    }>;
    addMargin(symbol: string, amount: any, params?: {}): Promise<{
        info: any;
        amount: any;
        code: any;
        symbol: string;
        total: number;
        status: string;
    }>;
    fetchOpenInterestHistory(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OpenInterest[]>;
    parseOpenInterest(interest: any, market?: Market): {
        symbol: string;
        openInterestAmount: number;
        openInterestValue: number;
        timestamp: number;
        datetime: string;
        info: any;
    };
    fetchSettlementHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    fetchMySettlementHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    parseSettlement(settlement: any, market: any): {
        info: any;
        symbol: string;
        price: number;
        timestamp: number;
        datetime: string;
    };
    parseSettlements(settlements: any, market: any): any[];
    fetchLedger(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    parseLedgerEntry(item: any, currency?: Currency): {
        id: string;
        direction: any;
        account: any;
        referenceAccount: any;
        referenceId: any;
        type: string;
        currency: string;
        amount: number;
        timestamp: any;
        datetime: string;
        before: number;
        after: number;
        status: any;
        fee: any;
        info: any;
    };
    parseLedgerEntryType(type: any): string;
    setPositionMode(hedged: any, symbol?: any, params?: {}): Promise<any>;
    fetchUnderlyingAssets(params?: {}): Promise<any[]>;
    fetchLiquidations(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<import("./base/types.js").Liquidation[]>;
    fetchMyLiquidations(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<import("./base/types.js").Liquidation[]>;
    parseLiquidation(liquidation: any, market?: Market): import("./base/types.js").Liquidation;
    fetchGreeks(symbol: string, params?: {}): Promise<Greeks>;
    parseGreeks(greeks: any, market?: Market): {
        symbol: string;
        timestamp: any;
        datetime: any;
        delta: number;
        gamma: number;
        theta: number;
        vega: number;
        rho: any;
        bidSize: number;
        askSize: number;
        bidImpliedVolatility: number;
        askImpliedVolatility: number;
        markImpliedVolatility: number;
        bidPrice: number;
        askPrice: number;
        markPrice: number;
        lastPrice: number;
        underlyingPrice: number;
        info: any;
    };
    handleErrors(code: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): any;
}
