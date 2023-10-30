import Exchange from './abstract/krakenfutures.js';
import { Int, OrderSide, OrderType, OHLCV, Trade, FundingRateHistory, OrderRequest } from './base/types.js';
/**
 * @class krakenfutures
 * @extends Exchange
 */
export default class krakenfutures extends Exchange {
    describe(): any;
    fetchMarkets(params?: {}): Promise<any[]>;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<import("./base/types.js").OrderBook>;
    fetchTickers(symbols?: string[], params?: {}): Promise<import("./base/types.js").Dictionary<import("./base/types.js").Ticker>>;
    parseTicker(ticker: any, market?: any): import("./base/types.js").Ticker;
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseOHLCV(ohlcv: any, market?: any): number[];
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseTrade(trade: any, market?: any): Trade;
    createOrderRequest(symbol: string, type: OrderType, side: OrderSide, amount: any, price?: any, params?: {}): any;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: any, price?: any, params?: {}): Promise<import("./base/types.js").Order>;
    createOrders(orders: OrderRequest[], params?: {}): Promise<import("./base/types.js").Order[]>;
    editOrder(id: string, symbol: any, type: any, side: any, amount?: any, price?: any, params?: {}): Promise<import("./base/types.js").Order>;
    cancelOrder(id: string, symbol?: string, params?: {}): Promise<any>;
    cancelOrders(ids: string[], symbol?: string, params?: {}): Promise<import("./base/types.js").Order[]>;
    cancelAllOrders(symbol?: string, params?: {}): Promise<any>;
    fetchOpenOrders(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<import("./base/types.js").Order[]>;
    parseOrderType(orderType: any): string;
    verifyOrderActionSuccess(status: any, method: any, omit?: any[]): void;
    parseOrderStatus(status: any): string;
    parseOrder(order: any, market?: any): import("./base/types.js").Order;
    fetchMyTrades(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchBalance(params?: {}): Promise<import("./base/types.js").Balances>;
    parseBalance(response: any): import("./base/types.js").Balances;
    fetchFundingRates(symbols?: string[], params?: {}): Promise<{}>;
    parseFundingRate(ticker: any, market?: any): {
        info: any;
        symbol: string;
        markPrice: number;
        indexPrice: number;
        interestRate: any;
        estimatedSettlePrice: any;
        timestamp: number;
        datetime: string;
        fundingRate: number;
        fundingTimestamp: any;
        fundingDatetime: any;
        nextFundingRate: number;
        nextFundingTimestamp: any;
        nextFundingDatetime: any;
        previousFundingRate: any;
        previousFundingTimestamp: any;
        previousFundingDatetime: any;
    };
    fetchFundingRateHistory(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<FundingRateHistory[]>;
    fetchPositions(symbols?: string[], params?: {}): Promise<import("./base/types.js").Position[]>;
    parsePositions(response: any, symbols?: string[], params?: {}): any[];
    parsePosition(position: any, market?: any): {
        info: any;
        symbol: any;
        timestamp: number;
        datetime: string;
        initialMargin: any;
        initialMarginPercentage: any;
        maintenanceMargin: any;
        maintenanceMarginPercentage: any;
        entryPrice: number;
        notional: any;
        leverage: number;
        unrealizedPnl: any;
        contracts: number;
        contractSize: number;
        marginRatio: any;
        liquidationPrice: any;
        markPrice: any;
        collateral: any;
        marginType: string;
        side: string;
        percentage: any;
    };
    fetchLeverageTiers(symbols?: string[], params?: {}): Promise<{}>;
    parseMarketLeverageTiers(info: any, market?: any): any[];
    parseTransfer(transfer: any, currency?: any): {
        info: any;
        id: any;
        timestamp: number;
        datetime: string;
        currency: string;
        amount: any;
        fromAccount: any;
        toAccount: any;
        status: string;
    };
    parseAccount(account: any): any;
    transferOut(code: string, amount: any, params?: {}): Promise<any>;
    transfer(code: string, amount: any, fromAccount: any, toAccount: any, params?: {}): Promise<any>;
    setLeverage(leverage: any, symbol?: string, params?: {}): Promise<any>;
    fetchLeverage(symbol?: string, params?: {}): Promise<any>;
    handleErrors(code: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): any;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
}
