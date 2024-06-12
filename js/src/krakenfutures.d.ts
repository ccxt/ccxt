import Exchange from './abstract/krakenfutures.js';
import type { TransferEntry, Int, OrderSide, OrderType, OHLCV, Trade, FundingRateHistory, OrderRequest, Order, Balances, Str, Dict, Ticker, OrderBook, Tickers, Strings, Market, Currency, Leverage, Leverages, Num, LeverageTier, LeverageTiers, int } from './base/types.js';
/**
 * @class krakenfutures
 * @augments Exchange
 */
export default class krakenfutures extends Exchange {
    describe(): any;
    fetchMarkets(params?: {}): Promise<Market[]>;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseTrade(trade: Dict, market?: Market): Trade;
    createOrderRequest(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): any;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    createOrders(orders: OrderRequest[], params?: {}): Promise<Order[]>;
    editOrder(id: string, symbol: string, type: OrderType, side: OrderSide, amount?: Num, price?: Num, params?: {}): Promise<Order>;
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<any>;
    cancelOrders(ids: string[], symbol?: Str, params?: {}): Promise<Order[]>;
    cancelAllOrders(symbol?: Str, params?: {}): Promise<Order[]>;
    cancelAllOrdersAfter(timeout: Int, params?: {}): Promise<any>;
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchCanceledOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    parseOrderType(orderType: any): string;
    verifyOrderActionSuccess(status: any, method: any, omit?: any[]): void;
    parseOrderStatus(status: Str): string;
    parseOrder(order: Dict, market?: Market): Order;
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchBalance(params?: {}): Promise<Balances>;
    parseBalance(response: any): Balances;
    fetchFundingRates(symbols?: Strings, params?: {}): Promise<any>;
    parseFundingRate(ticker: any, market?: Market): {
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
    fetchFundingRateHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<FundingRateHistory[]>;
    fetchPositions(symbols?: Strings, params?: {}): Promise<import("./base/types.js").Position[]>;
    parsePositions(response: any, symbols?: Strings, params?: {}): any[];
    parsePosition(position: Dict, market?: Market): {
        info: Dict;
        symbol: string;
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
    fetchLeverageTiers(symbols?: Strings, params?: {}): Promise<LeverageTiers>;
    parseMarketLeverageTiers(info: any, market?: Market): LeverageTier[];
    parseTransfer(transfer: Dict, currency?: Currency): TransferEntry;
    parseAccount(account: any): any;
    transferOut(code: string, amount: any, params?: {}): Promise<TransferEntry>;
    transfer(code: string, amount: number, fromAccount: string, toAccount: string, params?: {}): Promise<TransferEntry>;
    setLeverage(leverage: Int, symbol?: Str, params?: {}): Promise<any>;
    fetchLeverages(symbols?: Strings, params?: {}): Promise<Leverages>;
    fetchLeverage(symbol: string, params?: {}): Promise<Leverage>;
    parseLeverage(leverage: Dict, market?: Market): Leverage;
    handleErrors(code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
}
