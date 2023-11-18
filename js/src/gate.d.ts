import Exchange from './abstract/gate.js';
import { Int, OrderSide, OrderType, OHLCV, Trade, FundingRateHistory, OpenInterest, Order, Balances, OrderRequest, FundingHistory, Str, Transaction, Ticker, OrderBook, Tickers, Greeks, Strings, Market, Currency, MarketInterface } from './base/types.js';
/**
 * @class gate
 * @extends Exchange
 */
export default class gate extends Exchange {
    describe(): undefined;
    setSandboxMode(enable: any): void;
    convertExpireDate(date: any): string;
    createExpiredOptionMarket(symbol: any): MarketInterface;
    market(symbol: any): any;
    safeMarket(marketId?: undefined, market?: undefined, delimiter?: undefined, marketType?: undefined): MarketInterface;
    fetchMarkets(params?: {}): Promise<any>;
    fetchSpotMarkets(params?: {}): Promise<never[]>;
    fetchContractMarkets(params?: {}): Promise<never[]>;
    parseContractMarket(market: any, settleId: any): {
        id: Str;
        symbol: string;
        base: string;
        quote: string;
        settle: string;
        baseId: Str;
        quoteId: Str;
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
        contractSize: import("./base/types.js").Num;
        expiry: number | undefined;
        expiryDatetime: string | undefined;
        strike: undefined;
        optionType: undefined;
        precision: {
            amount: number;
            price: import("./base/types.js").Num;
        };
        limits: {
            leverage: {
                min: import("./base/types.js").Num;
                max: import("./base/types.js").Num;
            };
            amount: {
                min: import("./base/types.js").Num;
                max: import("./base/types.js").Num;
            };
            price: {
                min: number;
                max: number;
            };
            cost: {
                min: undefined;
                max: undefined;
            };
        };
        created: undefined;
        info: any;
    };
    fetchOptionMarkets(params?: {}): Promise<never[]>;
    fetchOptionUnderlyings(): Promise<never[]>;
    prepareRequest(market?: undefined, type?: undefined, params?: {}): {}[];
    spotOrderPrepareRequest(market?: undefined, stop?: boolean, params?: {}): any[];
    multiOrderSpotPrepareRequest(market?: undefined, stop?: boolean, params?: {}): any[];
    getMarginMode(stop: any, params: any): any[];
    getSettlementCurrencies(type: any, method: any): any;
    fetchCurrencies(params?: {}): Promise<{} | undefined>;
    fetchFundingRate(symbol: string, params?: {}): Promise<{
        info: any;
        symbol: string;
        markPrice: import("./base/types.js").Num;
        indexPrice: import("./base/types.js").Num;
        interestRate: import("./base/types.js").Num;
        estimatedSettlePrice: undefined;
        timestamp: undefined;
        datetime: undefined;
        fundingRate: import("./base/types.js").Num;
        fundingTimestamp: number | undefined;
        fundingDatetime: string | undefined;
        nextFundingRate: import("./base/types.js").Num;
        nextFundingTimestamp: undefined;
        nextFundingDatetime: undefined;
        previousFundingRate: undefined;
        previousFundingTimestamp: undefined;
        previousFundingDatetime: undefined;
    }>;
    fetchFundingRates(symbols?: Strings, params?: {}): Promise<any>;
    parseFundingRate(contract: any, market?: Market): {
        info: any;
        symbol: string;
        markPrice: import("./base/types.js").Num;
        indexPrice: import("./base/types.js").Num;
        interestRate: import("./base/types.js").Num;
        estimatedSettlePrice: undefined;
        timestamp: undefined;
        datetime: undefined;
        fundingRate: import("./base/types.js").Num;
        fundingTimestamp: number | undefined;
        fundingDatetime: string | undefined;
        nextFundingRate: import("./base/types.js").Num;
        nextFundingTimestamp: undefined;
        nextFundingDatetime: undefined;
        previousFundingRate: undefined;
        previousFundingTimestamp: undefined;
        previousFundingDatetime: undefined;
    };
    fetchNetworkDepositAddress(code: string, params?: {}): Promise<{}>;
    fetchDepositAddress(code: string, params?: {}): Promise<{
        info: any;
        code: string;
        currency: string;
        address: undefined;
        tag: undefined;
        network: undefined;
    }>;
    fetchTradingFee(symbol: string, params?: {}): Promise<{
        info: any;
        symbol: Str;
        maker: import("./base/types.js").Num;
        taker: import("./base/types.js").Num;
    }>;
    fetchTradingFees(params?: {}): Promise<{}>;
    parseTradingFees(response: any): {};
    parseTradingFee(info: any, market?: Market): {
        info: any;
        symbol: Str;
        maker: import("./base/types.js").Num;
        taker: import("./base/types.js").Num;
    };
    fetchTransactionFees(codes?: undefined, params?: {}): Promise<{}>;
    fetchDepositWithdrawFees(codes?: Strings, params?: {}): Promise<any>;
    parseDepositWithdrawFee(fee: any, currency?: Currency): {
        info: any;
        withdraw: {
            fee: import("./base/types.js").Num;
            percentage: boolean;
        };
        deposit: {
            fee: import("./base/types.js").Num;
            percentage: boolean;
        };
        networks: {};
    };
    fetchFundingHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<FundingHistory[]>;
    parseFundingHistories(response: any, symbol: any, since: any, limit: any): FundingHistory[];
    parseFundingHistory(info: any, market?: Market): {
        info: any;
        symbol: Str;
        code: Str;
        timestamp: number | undefined;
        datetime: string | undefined;
        id: undefined;
        amount: import("./base/types.js").Num;
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
    withdraw(code: string, amount: any, address: any, tag?: undefined, params?: {}): Promise<Transaction>;
    parseTransactionStatus(status: any): Str;
    parseTransactionType(type: any): Str;
    parseTransaction(transaction: any, currency?: Currency): Transaction;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: any, price?: undefined, params?: {}): Promise<Order>;
    createOrders(orders: OrderRequest[], params?: {}): Promise<Order[]>;
    createOrderRequest(symbol: string, type: OrderType, side: OrderSide, amount: any, price?: undefined, params?: {}): any;
    editOrder(id: string, symbol: any, type: any, side: any, amount?: undefined, price?: undefined, params?: {}): Promise<Order>;
    parseOrderStatus(status: any): Str;
    parseOrder(order: any, market?: Market): Order;
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOrdersByStatus(status: any, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    cancelAllOrders(symbol?: Str, params?: {}): Promise<Order[]>;
    transfer(code: string, amount: any, fromAccount: any, toAccount: any, params?: {}): Promise<{
        id: Str;
        timestamp: number;
        datetime: string | undefined;
        currency: string;
        amount: undefined;
        fromAccount: undefined;
        toAccount: undefined;
        status: undefined;
        info: any;
    }>;
    parseTransfer(transfer: any, currency?: Currency): {
        id: Str;
        timestamp: number;
        datetime: string | undefined;
        currency: string;
        amount: undefined;
        fromAccount: undefined;
        toAccount: undefined;
        status: undefined;
        info: any;
    };
    setLeverage(leverage: any, symbol?: Str, params?: {}): Promise<any>;
    parsePosition(position: any, market?: Market): import("./base/types.js").Position;
    fetchPosition(symbol: string, params?: {}): Promise<import("./base/types.js").Position>;
    fetchPositions(symbols?: Strings, params?: {}): Promise<import("./base/types.js").Position[]>;
    fetchLeverageTiers(symbols?: Strings, params?: {}): Promise<{}>;
    parseMarketLeverageTiers(info: any, market?: Market): never[];
    repayMargin(code: string, amount: any, symbol?: Str, params?: {}): Promise<{
        id: Int;
        currency: string;
        amount: import("./base/types.js").Num;
        symbol: string;
        timestamp: Int;
        datetime: string | undefined;
        info: any;
    }>;
    borrowMargin(code: string, amount: any, symbol?: Str, params?: {}): Promise<{
        id: Int;
        currency: string;
        amount: import("./base/types.js").Num;
        symbol: string;
        timestamp: Int;
        datetime: string | undefined;
        info: any;
    }>;
    parseMarginLoan(info: any, currency?: Currency): {
        id: Int;
        currency: string;
        amount: import("./base/types.js").Num;
        symbol: string;
        timestamp: Int;
        datetime: string | undefined;
        info: any;
    };
    sign(path: any, api?: never[], method?: string, params?: {}, headers?: undefined, body?: undefined): {
        url: string;
        method: string;
        body: undefined;
        headers: undefined;
    };
    modifyMarginHelper(symbol: string, amount: any, params?: {}): Promise<{
        info: any;
        amount: undefined;
        code: any;
        symbol: string;
        total: import("./base/types.js").Num;
        status: string;
    }>;
    parseMarginModification(data: any, market?: Market): {
        info: any;
        amount: undefined;
        code: any;
        symbol: string;
        total: import("./base/types.js").Num;
        status: string;
    };
    reduceMargin(symbol: string, amount: any, params?: {}): Promise<{
        info: any;
        amount: undefined;
        code: any;
        symbol: string;
        total: import("./base/types.js").Num;
        status: string;
    }>;
    addMargin(symbol: string, amount: any, params?: {}): Promise<{
        info: any;
        amount: undefined;
        code: any;
        symbol: string;
        total: import("./base/types.js").Num;
        status: string;
    }>;
    fetchOpenInterestHistory(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OpenInterest[]>;
    parseOpenInterest(interest: any, market?: Market): {
        symbol: Str;
        openInterestAmount: import("./base/types.js").Num;
        openInterestValue: import("./base/types.js").Num;
        timestamp: number | undefined;
        datetime: string | undefined;
        info: any;
    };
    fetchSettlementHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    fetchMySettlementHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    parseSettlement(settlement: any, market: any): {
        info: any;
        symbol: string;
        price: import("./base/types.js").Num;
        timestamp: number | undefined;
        datetime: string | undefined;
    };
    parseSettlements(settlements: any, market: any): never[];
    fetchLedger(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    parseLedgerEntry(item: any, currency?: Currency): {
        id: Str;
        direction: undefined;
        account: undefined;
        referenceAccount: undefined;
        referenceId: undefined;
        type: Str;
        currency: string;
        amount: number;
        timestamp: undefined;
        datetime: string | undefined;
        before: number;
        after: import("./base/types.js").Num;
        status: undefined;
        fee: undefined;
        info: any;
    };
    parseLedgerEntryType(type: any): Str;
    setPositionMode(hedged: any, symbol?: undefined, params?: {}): Promise<any>;
    fetchUnderlyingAssets(params?: {}): Promise<never[]>;
    fetchLiquidations(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<import("./base/types.js").Liquidation[]>;
    fetchMyLiquidations(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<import("./base/types.js").Liquidation[]>;
    parseLiquidation(liquidation: any, market?: Market): import("./base/types.js").Liquidation;
    fetchGreeks(symbol: string, params?: {}): Promise<Greeks>;
    parseGreeks(greeks: any, market?: Market): {
        symbol: string;
        timestamp: undefined;
        datetime: undefined;
        delta: import("./base/types.js").Num;
        gamma: import("./base/types.js").Num;
        theta: import("./base/types.js").Num;
        vega: import("./base/types.js").Num;
        rho: undefined;
        bidSize: import("./base/types.js").Num;
        askSize: import("./base/types.js").Num;
        bidImpliedVolatility: import("./base/types.js").Num;
        askImpliedVolatility: import("./base/types.js").Num;
        markImpliedVolatility: import("./base/types.js").Num;
        bidPrice: import("./base/types.js").Num;
        askPrice: import("./base/types.js").Num;
        markPrice: import("./base/types.js").Num;
        lastPrice: import("./base/types.js").Num;
        underlyingPrice: number;
        info: any;
    };
    handleErrors(code: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): undefined;
}
