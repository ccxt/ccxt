import Exchange from './abstract/poloniexfutures.js';
import { Balances, FundingHistory, Int, Market, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade } from './base/types.js';
/**
 * @class poloniexfutures
 * @extends Exchange
 */
export default class poloniexfutures extends Exchange {
    describe(): undefined;
    fetchMarkets(params?: {}): Promise<Market[]>;
    parseMarket(market: any): Market;
    parseTicker(ticker: any, market?: Market): Ticker;
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    fetchL3OrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseTrade(trade: any, market?: Market): Trade;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchTime(params?: {}): Promise<Int>;
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseBalance(response: any): Balances;
    fetchBalance(params?: {}): Promise<Balances>;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: any, price?: undefined, params?: {}): Promise<Order>;
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    fetchPositions(symbols?: Strings, params?: {}): Promise<import("./base/types.js").Position[]>;
    parsePosition(position: any, market?: Market): {
        info: any;
        id: undefined;
        symbol: Str;
        timestamp: Int;
        datetime: string | undefined;
        initialMargin: number;
        initialMarginPercentage: number;
        maintenanceMargin: import("./base/types.js").Num;
        maintenanceMarginPercentage: import("./base/types.js").Num;
        entryPrice: import("./base/types.js").Num;
        notional: number;
        leverage: import("./base/types.js").Num;
        unrealizedPnl: number;
        contracts: number;
        contractSize: any;
        marginRatio: undefined;
        liquidationPrice: import("./base/types.js").Num;
        markPrice: import("./base/types.js").Num;
        collateral: import("./base/types.js").Num;
        marginMode: string;
        side: Str;
        percentage: number;
        stopLossPrice: undefined;
        takeProfitPrice: undefined;
    };
    fetchFundingHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<FundingHistory[]>;
    cancelAllOrders(symbol?: Str, params?: {}): Promise<never[]>;
    fetchOrdersByStatus(status: any, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOrder(id?: undefined, symbol?: Str, params?: {}): Promise<Order>;
    parseOrder(order: any, market?: Market): Order;
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
        previousFundingRate: import("./base/types.js").Num;
        previousFundingTimestamp: Int;
        previousFundingDatetime: string | undefined;
    }>;
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    setMarginMode(marginMode: any, symbol: any, params?: {}): Promise<any>;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: undefined, body?: undefined): {
        url: string;
        method: string;
        body: undefined;
        headers: undefined;
    };
    handleErrors(code: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): undefined;
}
