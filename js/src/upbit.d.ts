import Exchange from './abstract/upbit.js';
import { Int, OrderSide, OrderType } from './base/types.js';
export default class upbit extends Exchange {
    describe(): any;
    fetchCurrency(code: string, params?: {}): Promise<{
        info: any;
        id: string;
        code: any;
        name: any;
        active: boolean;
        fee: number;
        precision: any;
        limits: {
            withdraw: {
                min: number;
                max: any;
            };
        };
    }>;
    fetchCurrencyById(id: string, params?: {}): Promise<{
        info: any;
        id: string;
        code: any;
        name: any;
        active: boolean;
        fee: number;
        precision: any;
        limits: {
            withdraw: {
                min: number;
                max: any;
            };
        };
    }>;
    fetchMarket(symbol: string, params?: {}): Promise<{
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
        linear: any;
        inverse: any;
        taker: number;
        maker: number;
        contractSize: any;
        expiry: any;
        expiryDatetime: any;
        strike: any;
        optionType: any;
        precision: {
            amount: number;
            price: number;
        };
        limits: {
            leverage: {
                min: any;
                max: any;
            };
            amount: {
                min: number;
                max: any;
            };
            price: {
                min: any;
                max: any;
            };
            cost: {
                min: number;
                max: number;
            };
            info: any;
        };
    }>;
    fetchMarketById(id: string, params?: {}): Promise<{
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
        linear: any;
        inverse: any;
        taker: number;
        maker: number;
        contractSize: any;
        expiry: any;
        expiryDatetime: any;
        strike: any;
        optionType: any;
        precision: {
            amount: number;
            price: number;
        };
        limits: {
            leverage: {
                min: any;
                max: any;
            };
            amount: {
                min: number;
                max: any;
            };
            price: {
                min: any;
                max: any;
            };
            cost: {
                min: number;
                max: number;
            };
            info: any;
        };
    }>;
    fetchMarkets(params?: {}): Promise<any[]>;
    parseBalance(response: any): import("./base/types.js").Balances;
    fetchBalance(params?: {}): Promise<import("./base/types.js").Balances>;
    fetchOrderBooks(symbols?: string[], limit?: Int, params?: {}): Promise<{}>;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<any>;
    parseTicker(ticker: any, market?: any): import("./base/types.js").Ticker;
    fetchTickers(symbols?: string[], params?: {}): Promise<any>;
    fetchTicker(symbol: string, params?: {}): Promise<any>;
    parseTrade(trade: any, market?: any): import("./base/types.js").Trade;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<import("./base/types.js").Trade[]>;
    fetchTradingFee(symbol: string, params?: {}): Promise<{
        info: any;
        symbol: string;
        maker: number;
        taker: number;
        percentage: boolean;
        tierBased: boolean;
    }>;
    parseOHLCV(ohlcv: any, market?: any): number[];
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<import("./base/types.js").OHLCV[]>;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: any, price?: any, params?: {}): Promise<{
        info: any;
        id: string;
        clientOrderId: any;
        timestamp: number;
        datetime: string;
        lastTradeTimestamp: any;
        symbol: any;
        type: string;
        timeInForce: any;
        postOnly: any;
        side: string;
        price: number;
        stopPrice: any;
        triggerPrice: any;
        cost: any;
        average: any;
        amount: number;
        filled: number;
        remaining: number;
        status: string;
        fee: any;
        trades: any;
    }>;
    cancelOrder(id: string, symbol?: string, params?: {}): Promise<{
        info: any;
        id: string;
        clientOrderId: any;
        timestamp: number;
        datetime: string;
        lastTradeTimestamp: any;
        symbol: any;
        type: string;
        timeInForce: any;
        postOnly: any;
        side: string;
        price: number;
        stopPrice: any;
        triggerPrice: any;
        cost: any;
        average: any;
        amount: number;
        filled: number;
        remaining: number;
        status: string;
        fee: any;
        trades: any;
    }>;
    fetchDeposits(code?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    fetchWithdrawals(code?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    parseTransactionStatus(status: any): string;
    parseTransaction(transaction: any, currency?: any): {
        info: any;
        id: string;
        currency: any;
        amount: number;
        network: any;
        address: any;
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
    parseOrderStatus(status: any): string;
    parseOrder(order: any, market?: any): {
        info: any;
        id: string;
        clientOrderId: any;
        timestamp: number;
        datetime: string;
        lastTradeTimestamp: any;
        symbol: any;
        type: string;
        timeInForce: any;
        postOnly: any;
        side: string;
        price: number;
        stopPrice: any;
        triggerPrice: any;
        cost: any;
        average: any;
        amount: number;
        filled: number;
        remaining: number;
        status: string;
        fee: any;
        trades: any;
    };
    fetchOrdersByState(state: any, symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<import("./base/types.js").Order[]>;
    fetchOpenOrders(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<import("./base/types.js").Order[]>;
    fetchClosedOrders(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<import("./base/types.js").Order[]>;
    fetchCanceledOrders(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<import("./base/types.js").Order[]>;
    fetchOrder(id: string, symbol?: string, params?: {}): Promise<{
        info: any;
        id: string;
        clientOrderId: any;
        timestamp: number;
        datetime: string;
        lastTradeTimestamp: any;
        symbol: any;
        type: string;
        timeInForce: any;
        postOnly: any;
        side: string;
        price: number;
        stopPrice: any;
        triggerPrice: any;
        cost: any;
        average: any;
        amount: number;
        filled: number;
        remaining: number;
        status: string;
        fee: any;
        trades: any;
    }>;
    fetchDepositAddresses(codes?: any, params?: {}): Promise<{}>;
    parseDepositAddress(depositAddress: any, currency?: any): {
        currency: any;
        address: string;
        tag: string;
        network: any;
        info: any;
    };
    fetchDepositAddress(code: string, params?: {}): Promise<{
        currency: any;
        address: string;
        tag: string;
        network: any;
        info: any;
    }>;
    createDepositAddress(code: string, params?: {}): Promise<{
        currency: any;
        address: string;
        tag: string;
        network: any;
        info: any;
    }>;
    withdraw(code: string, amount: any, address: any, tag?: any, params?: {}): Promise<{
        info: any;
        id: string;
        currency: any;
        amount: number;
        network: any;
        address: any;
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
    nonce(): number;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: any;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(httpCode: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): any;
}
