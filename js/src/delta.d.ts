import Exchange from './abstract/delta.js';
import { Balances, Currency, Greeks, Int, Market, MarketInterface, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade } from './base/types.js';
/**
 * @class delta
 * @extends Exchange
 */
export default class delta extends Exchange {
    describe(): undefined;
    convertExpireDate(date: any): string;
    createExpiredOptionMarket(symbol: any): MarketInterface;
    market(symbol: any): any;
    safeMarket(marketId?: undefined, market?: undefined, delimiter?: undefined, marketType?: undefined): MarketInterface;
    fetchTime(params?: {}): Promise<Int>;
    fetchStatus(params?: {}): Promise<{
        status: string;
        updated: Int;
        eta: undefined;
        url: undefined;
        info: any;
    }>;
    fetchCurrencies(params?: {}): Promise<{}>;
    loadMarkets(reload?: boolean, params?: {}): Promise<import("./base/types.js").Dictionary<Market>>;
    fetchMarkets(params?: {}): Promise<never[]>;
    parseTicker(ticker: any, market?: Market): Ticker;
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseTrade(trade: any, market?: Market): Trade;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseBalance(response: any): Balances;
    fetchBalance(params?: {}): Promise<Balances>;
    fetchPosition(symbol: string, params?: {}): Promise<import("./base/types.js").Position>;
    fetchPositions(symbols?: Strings, params?: {}): Promise<import("./base/types.js").Position[]>;
    parsePosition(position: any, market?: Market): import("./base/types.js").Position;
    parseOrderStatus(status: any): Str;
    parseOrder(order: any, market?: Market): Order;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: any, price?: undefined, params?: {}): Promise<Order>;
    editOrder(id: string, symbol: any, type: any, side: any, amount?: undefined, price?: undefined, params?: {}): Promise<Order>;
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    cancelAllOrders(symbol?: Str, params?: {}): Promise<any>;
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOrdersWithMethod(method: any, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchLedger(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    parseLedgerEntryType(type: any): Str;
    parseLedgerEntry(item: any, currency?: Currency): {
        info: any;
        id: Str;
        direction: undefined;
        account: undefined;
        referenceId: Str;
        referenceAccount: undefined;
        type: Str;
        currency: string | undefined;
        amount: number;
        before: number;
        after: number;
        status: string;
        timestamp: number | undefined;
        datetime: string | undefined;
        fee: undefined;
    };
    fetchDepositAddress(code: string, params?: {}): Promise<{
        currency: string;
        address: Str;
        tag: Str;
        network: Str;
        info: any;
    }>;
    parseDepositAddress(depositAddress: any, currency?: Currency): {
        currency: string;
        address: Str;
        tag: Str;
        network: Str;
        info: any;
    };
    fetchFundingRate(symbol: string, params?: {}): Promise<{
        info: any;
        symbol: string;
        markPrice: import("./base/types.js").Num;
        indexPrice: import("./base/types.js").Num;
        interestRate: undefined;
        estimatedSettlePrice: undefined;
        timestamp: Int;
        datetime: string | undefined;
        fundingRate: number;
        fundingTimestamp: undefined;
        fundingDatetime: undefined;
        nextFundingRate: undefined;
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
        interestRate: undefined;
        estimatedSettlePrice: undefined;
        timestamp: Int;
        datetime: string | undefined;
        fundingRate: number;
        fundingTimestamp: undefined;
        fundingDatetime: undefined;
        nextFundingRate: undefined;
        nextFundingTimestamp: undefined;
        nextFundingDatetime: undefined;
        previousFundingRate: undefined;
        previousFundingTimestamp: undefined;
        previousFundingDatetime: undefined;
    };
    addMargin(symbol: string, amount: any, params?: {}): Promise<{
        info: any;
        type: undefined;
        amount: undefined;
        total: import("./base/types.js").Num;
        code: undefined;
        symbol: string;
        status: undefined;
    }>;
    reduceMargin(symbol: string, amount: any, params?: {}): Promise<{
        info: any;
        type: undefined;
        amount: undefined;
        total: import("./base/types.js").Num;
        code: undefined;
        symbol: string;
        status: undefined;
    }>;
    modifyMarginHelper(symbol: string, amount: any, type: any, params?: {}): Promise<{
        info: any;
        type: undefined;
        amount: undefined;
        total: import("./base/types.js").Num;
        code: undefined;
        symbol: string;
        status: undefined;
    }>;
    parseMarginModification(data: any, market?: Market): {
        info: any;
        type: undefined;
        amount: undefined;
        total: import("./base/types.js").Num;
        code: undefined;
        symbol: string;
        status: undefined;
    };
    fetchOpenInterest(symbol: string, params?: {}): Promise<import("./base/types.js").OpenInterest>;
    parseOpenInterest(interest: any, market?: Market): import("./base/types.js").OpenInterest;
    fetchLeverage(symbol: string, params?: {}): Promise<any>;
    setLeverage(leverage: any, symbol?: Str, params?: {}): Promise<any>;
    fetchSettlementHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    parseSettlement(settlement: any, market: any): {
        info: any;
        symbol: string;
        price: import("./base/types.js").Num;
        timestamp: number | undefined;
        datetime: Str;
    };
    parseSettlements(settlements: any, market: any): never[];
    fetchGreeks(symbol: string, params?: {}): Promise<Greeks>;
    parseGreeks(greeks: any, market?: Market): {
        symbol: string;
        timestamp: Int;
        datetime: string | undefined;
        delta: import("./base/types.js").Num;
        gamma: import("./base/types.js").Num;
        theta: import("./base/types.js").Num;
        vega: import("./base/types.js").Num;
        rho: import("./base/types.js").Num;
        bidSize: import("./base/types.js").Num;
        askSize: import("./base/types.js").Num;
        bidImpliedVolatility: import("./base/types.js").Num;
        askImpliedVolatility: import("./base/types.js").Num;
        markImpliedVolatility: import("./base/types.js").Num;
        bidPrice: import("./base/types.js").Num;
        askPrice: import("./base/types.js").Num;
        markPrice: import("./base/types.js").Num;
        lastPrice: undefined;
        underlyingPrice: import("./base/types.js").Num;
        info: any;
    };
    sign(path: any, api?: string, method?: string, params?: {}, headers?: undefined, body?: undefined): {
        url: string;
        method: string;
        body: undefined;
        headers: undefined;
    };
    handleErrors(code: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): undefined;
}
