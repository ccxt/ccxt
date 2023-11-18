import Exchange from './abstract/krakenfutures.js';
import { Int, OrderSide, OrderType, OHLCV, Trade, FundingRateHistory, OrderRequest, Order, Balances, Str, Ticker, OrderBook, Tickers, Strings, Market, Currency } from './base/types.js';
/**
 * @class krakenfutures
 * @extends Exchange
 */
export default class krakenfutures extends Exchange {
    describe(): undefined;
    fetchMarkets(params?: {}): Promise<never[]>;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    parseTicker(ticker: any, market?: Market): Ticker;
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseTrade(trade: any, market?: Market): Trade;
    createOrderRequest(symbol: string, type: OrderType, side: OrderSide, amount: any, price?: undefined, params?: {}): any;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: any, price?: undefined, params?: {}): Promise<Order>;
    createOrders(orders: OrderRequest[], params?: {}): Promise<Order[]>;
    editOrder(id: string, symbol: any, type: any, side: any, amount?: undefined, price?: undefined, params?: {}): Promise<Order>;
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<any>;
    cancelOrders(ids: string[], symbol?: Str, params?: {}): Promise<Order[]>;
    cancelAllOrders(symbol?: Str, params?: {}): Promise<any>;
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    parseOrderType(orderType: any): Str;
    verifyOrderActionSuccess(status: any, method: any, omit?: never[]): void;
    parseOrderStatus(status: any): Str;
    parseOrder(order: any, market?: Market): Order;
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchBalance(params?: {}): Promise<Balances>;
    parseBalance(response: any): Balances;
    fetchFundingRates(symbols?: Strings, params?: {}): Promise<{}>;
    parseFundingRate(ticker: any, market?: Market): {
        info: any;
        symbol: string;
        markPrice: number;
        indexPrice: import("./base/types.js").Num;
        interestRate: undefined;
        estimatedSettlePrice: undefined;
        timestamp: number | undefined;
        datetime: string | undefined;
        fundingRate: number;
        fundingTimestamp: undefined;
        fundingDatetime: undefined;
        nextFundingRate: number;
        nextFundingTimestamp: undefined;
        nextFundingDatetime: undefined;
        previousFundingRate: undefined;
        previousFundingTimestamp: undefined;
        previousFundingDatetime: undefined;
    };
    fetchFundingRateHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<FundingRateHistory[]>;
    fetchPositions(symbols?: Strings, params?: {}): Promise<import("./base/types.js").Position[]>;
    parsePositions(response: any, symbols?: Strings, params?: {}): never[];
    parsePosition(position: any, market?: Market): {
        info: any;
        symbol: string;
        timestamp: number | undefined;
        datetime: Str;
        initialMargin: undefined;
        initialMarginPercentage: undefined;
        maintenanceMargin: undefined;
        maintenanceMarginPercentage: undefined;
        entryPrice: import("./base/types.js").Num;
        notional: undefined;
        leverage: import("./base/types.js").Num;
        unrealizedPnl: undefined;
        contracts: import("./base/types.js").Num;
        contractSize: import("./base/types.js").Num;
        marginRatio: undefined;
        liquidationPrice: undefined;
        markPrice: undefined;
        collateral: undefined;
        marginType: string;
        side: Str;
        percentage: undefined;
    };
    fetchLeverageTiers(symbols?: Strings, params?: {}): Promise<{}>;
    parseMarketLeverageTiers(info: any, market?: Market): never[];
    parseTransfer(transfer: any, currency?: Currency): {
        info: any;
        id: undefined;
        timestamp: number | undefined;
        datetime: Str;
        currency: Str;
        amount: undefined;
        fromAccount: undefined;
        toAccount: undefined;
        status: Str;
    };
    parseAccount(account: any): any;
    transferOut(code: string, amount: any, params?: {}): Promise<any>;
    transfer(code: string, amount: any, fromAccount: any, toAccount: any, params?: {}): Promise<any>;
    setLeverage(leverage: any, symbol?: Str, params?: {}): Promise<any>;
    fetchLeverage(symbol?: Str, params?: {}): Promise<any>;
    handleErrors(code: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): undefined;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: undefined, body?: undefined): {
        url: string;
        method: string;
        body: undefined;
        headers: undefined;
    };
}
