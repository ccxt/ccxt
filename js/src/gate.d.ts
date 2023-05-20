import Exchange from './abstract/gate.js';
import { Int, OrderSide } from './base/types.js';
export default class gate extends Exchange {
    describe(): any;
    setSandboxMode(enable: any): void;
    fetchMarkets(params?: {}): Promise<any>;
    fetchSpotMarkets(params?: {}): Promise<any[]>;
    fetchContractMarkets(params?: {}): Promise<any[]>;
    parseContractMarket(market: any, settleId: any): {
        id: string;
        symbol: string;
        base: any;
        quote: any;
        settle: any;
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
        symbol: any;
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
    fetchFundingRates(symbols?: string[], params?: {}): Promise<any>;
    parseFundingRate(contract: any, market?: any): {
        info: any;
        symbol: any;
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
    createDepositAddress(code: string, params?: {}): Promise<{
        info: any;
        code: string;
        currency: string;
        address: any;
        tag: any;
        network: any;
    }>;
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
    parseTradingFee(info: any, market?: any): {
        info: any;
        symbol: string;
        maker: number;
        taker: number;
    };
    fetchTransactionFees(codes?: any, params?: {}): Promise<{}>;
    fetchDepositWithdrawFees(codes?: any, params?: {}): Promise<any>;
    parseDepositWithdrawFee(fee: any, currency?: any): {
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
    fetchFundingHistory(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    parseFundingHistories(response: any, symbol: any, since: any, limit: any): any;
    parseFundingHistory(info: any, market?: any): {
        info: any;
        symbol: string;
        code: string;
        timestamp: number;
        datetime: string;
        id: any;
        amount: number;
    };
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<import("./base/types.js").OrderBook>;
    fetchTicker(symbol: string, params?: {}): Promise<import("./base/types.js").Ticker>;
    parseTicker(ticker: any, market?: any): import("./base/types.js").Ticker;
    fetchTickers(symbols?: string[], params?: {}): Promise<any>;
    parseBalanceHelper(entry: any): import("./base/types.js").Balance;
    fetchBalance(params?: {}): Promise<{
        info: any;
    }>;
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<import("./base/types.js").OHLCV[]>;
    fetchFundingRateHistory(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    parseOHLCV(ohlcv: any, market?: any): number[];
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<import("./base/types.js").Trade[]>;
    fetchOrderTrades(id: string, symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<import("./base/types.js").Trade[]>;
    fetchMyTrades(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<import("./base/types.js").Trade[]>;
    parseTrade(trade: any, market?: any): import("./base/types.js").Trade;
    fetchDeposits(code?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    fetchWithdrawals(code?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    withdraw(code: string, amount: any, address: any, tag?: any, params?: {}): Promise<{
        info: any;
        id: string;
        txid: string;
        currency: any;
        amount: number;
        network: any;
        address: string;
        addressTo: any;
        addressFrom: any;
        tag: string;
        tagTo: any;
        tagFrom: any;
        status: string;
        type: any;
        timestamp: number;
        datetime: string;
        updated: any;
        fee: {
            currency: any;
            cost: number;
        };
    }>;
    parseTransactionStatus(status: any): string;
    parseTransactionType(type: any): string;
    parseTransaction(transaction: any, currency?: any): {
        info: any;
        id: string;
        txid: string;
        currency: any;
        amount: number;
        network: any;
        address: string;
        addressTo: any;
        addressFrom: any;
        tag: string;
        tagTo: any;
        tagFrom: any;
        status: string;
        type: any;
        timestamp: number;
        datetime: string;
        updated: any;
        fee: {
            currency: any;
            cost: number;
        };
    };
    createOrder(symbol: string, type: any, side: OrderSide, amount: any, price?: any, params?: {}): Promise<any>;
    editOrder(id: string, symbol: any, type: any, side: any, amount: any, price?: any, params?: {}): Promise<any>;
    parseOrderStatus(status: any): string;
    parseOrder(order: any, market?: any): any;
    fetchOrder(id: string, symbol?: string, params?: {}): Promise<any>;
    fetchOpenOrders(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    fetchClosedOrders(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    fetchOrdersByStatus(status: any, symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    cancelOrder(id: string, symbol?: string, params?: {}): Promise<any>;
    cancelAllOrders(symbol?: string, params?: {}): Promise<import("./base/types.js").Order[]>;
    transfer(code: string, amount: any, fromAccount: any, toAccount: any, params?: {}): Promise<{
        id: any;
        timestamp: number;
        datetime: string;
        currency: any;
        amount: any;
        fromAccount: any;
        toAccount: any;
        status: any;
        info: any;
    }>;
    parseTransfer(transfer: any, currency?: any): {
        id: any;
        timestamp: number;
        datetime: string;
        currency: any;
        amount: any;
        fromAccount: any;
        toAccount: any;
        status: any;
        info: any;
    };
    setLeverage(leverage: any, symbol?: string, params?: {}): Promise<any>;
    parsePosition(position: any, market?: any): any;
    fetchPositions(symbols?: string[], params?: {}): Promise<any>;
    fetchLeverageTiers(symbols?: string[], params?: {}): Promise<{}>;
    parseMarketLeverageTiers(info: any, market?: any): any[];
    repayMargin(code: string, amount: any, symbol?: string, params?: {}): Promise<{
        id: number;
        currency: any;
        amount: number;
        symbol: any;
        timestamp: number;
        datetime: string;
        info: any;
    }>;
    borrowMargin(code: string, amount: any, symbol?: string, params?: {}): Promise<{
        id: number;
        currency: any;
        amount: number;
        symbol: any;
        timestamp: number;
        datetime: string;
        info: any;
    }>;
    parseMarginLoan(info: any, currency?: any): {
        id: number;
        currency: any;
        amount: number;
        symbol: any;
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
        symbol: any;
        total: number;
        status: string;
    }>;
    parseMarginModification(data: any, market?: any): {
        info: any;
        amount: any;
        code: any;
        symbol: any;
        total: number;
        status: string;
    };
    reduceMargin(symbol: string, amount: any, params?: {}): Promise<{
        info: any;
        amount: any;
        code: any;
        symbol: any;
        total: number;
        status: string;
    }>;
    addMargin(symbol: string, amount: any, params?: {}): Promise<{
        info: any;
        amount: any;
        code: any;
        symbol: any;
        total: number;
        status: string;
    }>;
    fetchOpenInterestHistory(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    parseOpenInterest(interest: any, market?: any): {
        symbol: string;
        openInterestAmount: number;
        openInterestValue: number;
        timestamp: number;
        datetime: string;
        info: any;
    };
    handleErrors(code: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): any;
}
