import Exchange from './abstract/bingx.js';
import { Int, OrderSide } from './base/types.js';
export default class bingx extends Exchange {
    describe(): any;
    fetchTime(params?: {}): Promise<number>;
    fetchCurrencies(params?: {}): Promise<{}>;
    fetchSpotMarkets(params: any): Promise<any[]>;
    fetchSwapMarkets(params: any): Promise<any[]>;
    parseMarket(market: any): {
        id: string;
        symbol: string;
        base: any;
        quote: any;
        settle: any;
        baseId: string;
        quoteId: string;
        settleId: string;
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
        taker: any;
        maker: any;
        contractSize: number;
        expiry: any;
        expiryDatetime: any;
        strike: any;
        optionType: any;
        precision: {
            amount: number;
            price: number;
            base: any;
            quote: any;
        };
        limits: {
            leverage: {
                min: any;
                max: number;
            };
            amount: {
                min: number;
                max: number;
            };
            price: {
                min: any;
                max: any;
            };
            cost: {
                min: number;
                max: number;
            };
        };
        info: any;
    };
    fetchMarkets(params?: {}): Promise<any>;
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<import("./base/types.js").OHLCV[]>;
    parseOHLCV(ohlcv: any, market?: any): number[];
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<import("./base/types.js").Trade[]>;
    parseTrade(trade: any, market?: any): import("./base/types.js").Trade;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<import("./base/types.js").OrderBook>;
    fetchFundingRate(symbol: string, params?: {}): Promise<{
        info: any;
        symbol: any;
        markPrice: number;
        indexPrice: number;
        interestRate: any;
        estimatedSettlePrice: any;
        timestamp: any;
        datetime: any;
        fundingRate: number;
        fundingTimestamp: any;
        fundingDatetime: any;
        nextFundingRate: any;
        nextFundingTimestamp: number;
        nextFundingDatetime: string;
        previousFundingRate: any;
        previousFundingTimestamp: any;
        previousFundingDatetime: any;
    }>;
    parseFundingRate(contract: any, market?: any): {
        info: any;
        symbol: any;
        markPrice: number;
        indexPrice: number;
        interestRate: any;
        estimatedSettlePrice: any;
        timestamp: any;
        datetime: any;
        fundingRate: number;
        fundingTimestamp: any;
        fundingDatetime: any;
        nextFundingRate: any;
        nextFundingTimestamp: number;
        nextFundingDatetime: string;
        previousFundingRate: any;
        previousFundingTimestamp: any;
        previousFundingDatetime: any;
    };
    fetchFundingRateHistory(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    fetchOpenInterest(symbol: string, params?: {}): Promise<{
        symbol: any;
        openInterestAmount: any;
        openInterestValue: number;
        timestamp: number;
        datetime: string;
        info: any;
    }>;
    parseOpenInterest(interest: any, market?: any): {
        symbol: any;
        openInterestAmount: any;
        openInterestValue: number;
        timestamp: number;
        datetime: string;
        info: any;
    };
    fetchTicker(symbol: string, params?: {}): Promise<import("./base/types.js").Ticker>;
    fetchTickers(symbols?: string[], params?: {}): Promise<import("./base/types.js").Dictionary<import("./base/types.js").Ticker>>;
    parseTicker(ticker: any, market?: any): import("./base/types.js").Ticker;
    fetchBalance(params?: {}): Promise<import("./base/types.js").Balances>;
    parseBalance(response: any): import("./base/types.js").Balances;
    fetchPositions(symbols?: string[], params?: {}): Promise<import("./base/types.js").Position[]>;
    parsePosition(position: any, market?: any): import("./base/types.js").Position;
    createOrder(symbol: string, type: any, side: OrderSide, amount: any, price?: any, params?: {}): Promise<import("./base/types.js").Order>;
    parseOrder(order: any, market?: any): import("./base/types.js").Order;
    parseOrderStatus(status: any): string;
    cancelOrder(id: string, symbol?: string, params?: {}): Promise<import("./base/types.js").Order>;
    cancelAllOrders(symbol?: string, params?: {}): Promise<any>;
    cancelOrders(ids: Int[], symbol?: string, params?: {}): Promise<any>;
    fetchOrder(id: string, symbol?: string, params?: {}): Promise<import("./base/types.js").Order>;
    fetchOpenOrders(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<import("./base/types.js").Order[]>;
    fetchClosedOrders(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<import("./base/types.js").Order[]>;
    transfer(code: string, amount: any, fromAccount: any, toAccount: any, params?: {}): Promise<{
        info: any;
        id: string;
        timestamp: any;
        datetime: any;
        currency: string;
        amount: any;
        fromAccount: any;
        toAccount: any;
        status: any;
    }>;
    fetchTransfers(code?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    parseTransfer(transfer: any, currency?: any): {
        info: any;
        id: string;
        timestamp: number;
        datetime: string;
        currency: any;
        amount: number;
        fromAccount: string;
        toAccount: string;
        status: string;
    };
    fetchDeposits(code?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    fetchWithdrawals(code?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    parseTransaction(transaction: any, currency?: any): {
        info: any;
        id: string;
        txid: string;
        type: string;
        currency: any;
        network: string;
        amount: number;
        status: string;
        timestamp: number;
        datetime: string;
        address: string;
        addressFrom: any;
        addressTo: string;
        tag: string;
        tagFrom: string;
        tagTo: any;
        updated: any;
        comment: string;
        fee: {
            currency: any;
            cost: number;
            rate: any;
        };
    };
    parseTransactionStatus(status: any): string;
    setMarginMode(marginMode: string, symbol?: string, params?: {}): Promise<any>;
    setMargin(symbol: string, amount: any, params?: {}): Promise<any>;
    fetchLeverage(symbol: string, params?: {}): Promise<any>;
    setLeverage(leverage: any, symbol?: string, params?: {}): Promise<any>;
    fetchMyTrades(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<import("./base/types.js").Trade[]>;
    parseDepositWithdrawFee(fee: any, currency?: any): {
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
    fetchDepositWithdrawFees(codes?: string[], params?: {}): Promise<any>;
    withdraw(code: string, amount: any, address: any, tag?: any, params?: {}): Promise<void>;
    sign(path: any, section?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: any;
        method: string;
        body: any;
        headers: any;
    };
    nonce(): number;
    handleErrors(httpCode: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): any;
}
