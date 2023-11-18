import Exchange from './abstract/htx.js';
import { Int, OrderSide, OrderType, Order, OHLCV, Trade, FundingRateHistory, Balances, Str, Transaction, Ticker, OrderBook, Tickers, OrderRequest, Strings, Market, Currency } from './base/types.js';
/**
 * @class huobi
 * @extends Exchange
 */
export default class htx extends Exchange {
    describe(): undefined;
    fetchStatus(params?: {}): Promise<{
        status: undefined;
        updated: undefined;
        eta: undefined;
        url: undefined;
        info: any;
    }>;
    fetchTime(params?: {}): Promise<Int>;
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
    fetchTradingLimits(symbols?: Strings, params?: {}): Promise<{}>;
    fetchTradingLimitsById(id: string, params?: {}): Promise<{
        info: any;
        limits: {
            amount: {
                min: import("./base/types.js").Num;
                max: import("./base/types.js").Num;
            };
        };
    }>;
    parseTradingLimits(limits: any, symbol?: Str, params?: {}): {
        info: any;
        limits: {
            amount: {
                min: import("./base/types.js").Num;
                max: import("./base/types.js").Num;
            };
        };
    };
    costToPrecision(symbol: any, cost: any): any;
    fetchMarkets(params?: {}): Promise<never[]>;
    fetchMarketsByTypeAndSubType(type: any, subType: any, params?: {}): Promise<never[]>;
    parseTicker(ticker: any, market?: Market): Ticker;
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseTrade(trade: any, market?: Market): Trade;
    fetchOrderTrades(id: string, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchSpotOrderTrades(id: string, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchTrades(symbol: string, since?: Int, limit?: number, params?: {}): Promise<Trade[]>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    fetchAccounts(params?: {}): Promise<never[]>;
    parseAccount(account: any): {
        info: any;
        id: Str;
        type: any;
        code: undefined;
    };
    fetchAccountIdByType(type: any, marginMode?: undefined, symbol?: undefined, params?: {}): Promise<any>;
    fetchCurrencies(params?: {}): Promise<{}>;
    networkIdToCode(networkId: any, currencyCode?: undefined): Str;
    networkCodeToId(networkCode: any, currencyCode?: undefined): any;
    fetchBalance(params?: {}): Promise<Balances>;
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    parseMarginBalanceHelper(balance: any, code: any, result: any): undefined;
    fetchSpotOrdersByStates(states: any, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchSpotOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchClosedSpotOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchContractOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchClosedContractOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    parseOrderStatus(status: any): Str;
    parseOrder(order: any, market?: Market): Order;
    createSpotOrderRequest(symbol: string, type: OrderType, side: OrderSide, amount: any, price?: undefined, params?: {}): Promise<any>;
    createContractOrderRequest(symbol: string, type: OrderType, side: OrderSide, amount: any, price?: undefined, params?: {}): any;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: any, price?: undefined, params?: {}): Promise<Order>;
    createOrders(orders: OrderRequest[], params?: {}): Promise<Order[]>;
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<any>;
    cancelOrders(ids: any, symbol?: Str, params?: {}): Promise<undefined>;
    cancelAllOrders(symbol?: Str, params?: {}): Promise<undefined>;
    parseDepositAddress(depositAddress: any, currency?: Currency): {
        currency: string;
        address: Str;
        tag: Str;
        network: Str;
        note: Str;
        info: any;
    };
    fetchDepositAddressesByNetwork(code: string, params?: {}): Promise<{}>;
    fetchDepositAddress(code: string, params?: {}): Promise<any>;
    fetchWithdrawAddresses(code: string, note?: undefined, networkCode?: undefined, params?: {}): Promise<never[]>;
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    parseTransaction(transaction: any, currency?: Currency): Transaction;
    parseTransactionStatus(status: any): Str;
    withdraw(code: string, amount: any, address: any, tag?: undefined, params?: {}): Promise<Transaction>;
    parseTransfer(transfer: any, currency?: Currency): {
        info: any;
        id: Str;
        timestamp: undefined;
        datetime: undefined;
        currency: string;
        amount: undefined;
        fromAccount: undefined;
        toAccount: undefined;
        status: undefined;
    };
    transfer(code: string, amount: any, fromAccount: any, toAccount: any, params?: {}): Promise<{
        info: any;
        id: Str;
        timestamp: undefined;
        datetime: undefined;
        currency: string;
        amount: undefined;
        fromAccount: undefined;
        toAccount: undefined;
        status: undefined;
    }>;
    fetchIsolatedBorrowRates(params?: {}): Promise<never[]>;
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
    fetchFundingRateHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<FundingRateHistory[]>;
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
        fundingTimestamp: Int;
        fundingDatetime: string | undefined;
        nextFundingRate: import("./base/types.js").Num;
        nextFundingTimestamp: Int;
        nextFundingDatetime: string | undefined;
        previousFundingRate: undefined;
        previousFundingTimestamp: undefined;
        previousFundingDatetime: undefined;
    };
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
        fundingTimestamp: Int;
        fundingDatetime: string | undefined;
        nextFundingRate: import("./base/types.js").Num;
        nextFundingTimestamp: Int;
        nextFundingDatetime: string | undefined;
        previousFundingRate: undefined;
        previousFundingTimestamp: undefined;
        previousFundingDatetime: undefined;
    }>;
    fetchFundingRates(symbols?: Strings, params?: {}): Promise<any>;
    fetchBorrowInterest(code?: Str, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    parseBorrowInterest(info: any, market?: Market): {
        account: Str;
        symbol: Str;
        marginMode: string;
        currency: string;
        interest: import("./base/types.js").Num;
        interestRate: import("./base/types.js").Num;
        amountBorrowed: import("./base/types.js").Num;
        timestamp: import("./base/types.js").Num;
        datetime: string | undefined;
        info: any;
    };
    sign(path: any, api?: string, method?: string, params?: {}, headers?: undefined, body?: undefined): {
        url: string;
        method: string;
        body: undefined;
        headers: undefined;
    };
    handleErrors(httpCode: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): undefined;
    fetchFundingHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<import("./base/types.js").FundingHistory[]>;
    setLeverage(leverage: any, symbol?: Str, params?: {}): Promise<any>;
    parseIncome(income: any, market?: Market): {
        info: any;
        symbol: string;
        code: string;
        timestamp: Int;
        datetime: string | undefined;
        id: Str;
        amount: import("./base/types.js").Num;
    };
    parsePosition(position: any, market?: Market): import("./base/types.js").Position;
    fetchPositions(symbols?: Strings, params?: {}): Promise<import("./base/types.js").Position[]>;
    fetchPosition(symbol: string, params?: {}): Promise<import("./base/types.js").Position>;
    parseLedgerEntryType(type: any): Str;
    parseLedgerEntry(item: any, currency?: Currency): {
        id: Str;
        direction: Str;
        account: Str;
        referenceId: Str;
        referenceAccount: Str;
        type: Str;
        currency: string;
        amount: import("./base/types.js").Num;
        timestamp: Int;
        datetime: string | undefined;
        before: undefined;
        after: undefined;
        status: undefined;
        fee: undefined;
        info: any;
    };
    fetchLedger(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    fetchLeverageTiers(symbols?: Strings, params?: {}): Promise<{}>;
    fetchMarketLeverageTiers(symbol: string, params?: {}): Promise<any>;
    parseLeverageTiers(response: any, symbols?: Strings, marketIdKey?: undefined): {};
    fetchOpenInterestHistory(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<import("./base/types.js").OpenInterest[]>;
    fetchOpenInterest(symbol: string, params?: {}): Promise<import("./base/types.js").OpenInterest>;
    parseOpenInterest(interest: any, market?: Market): import("./base/types.js").OpenInterest;
    borrowMargin(code: string, amount: any, symbol?: Str, params?: {}): Promise<any>;
    repayMargin(code: string, amount: any, symbol?: Str, params?: {}): Promise<any>;
    parseMarginLoan(info: any, currency?: Currency): {
        id: Int;
        currency: string;
        amount: undefined;
        symbol: undefined;
        timestamp: Int;
        datetime: string | undefined;
        info: any;
    };
    fetchSettlementHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    fetchDepositWithdrawFees(codes?: Strings, params?: {}): Promise<any>;
    parseDepositWithdrawFee(fee: any, currency?: Currency): any;
    parseSettlements(settlements: any, market: any): never[];
    parseSettlement(settlement: any, market: any): {
        info: any;
        symbol: string;
        price: import("./base/types.js").Num;
        timestamp: Int;
        datetime: string | undefined;
    };
    fetchLiquidations(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<import("./base/types.js").Liquidation[]>;
    parseLiquidation(liquidation: any, market?: Market): import("./base/types.js").Liquidation;
}
