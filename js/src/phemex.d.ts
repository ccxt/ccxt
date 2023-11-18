import Exchange from './abstract/phemex.js';
import { Balances, Currency, FundingHistory, FundingRateHistory, Int, Market, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, Transaction } from './base/types.js';
/**
 * @class phemex
 * @extends Exchange
 */
export default class phemex extends Exchange {
    describe(): undefined;
    parseSafeNumber(value?: undefined): Num;
    parseSwapMarket(market: any): {
        id: Str;
        symbol: string;
        base: string;
        quote: string;
        settle: string;
        baseId: Str;
        quoteId: Str;
        settleId: Str;
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
        expiry: undefined;
        expiryDatetime: undefined;
        strike: undefined;
        optionType: undefined;
        priceScale: Int;
        valueScale: Int;
        ratioScale: Int;
        precision: {
            amount: number;
            price: Num;
        };
        limits: {
            leverage: {
                min: number;
                max: Num;
            };
            amount: {
                min: undefined;
                max: undefined;
            };
            price: {
                min: number;
                max: number;
            };
            cost: {
                min: undefined;
                max: number;
            };
        };
        created: undefined;
        info: any;
    };
    parseSpotMarket(market: any): {
        id: Str;
        symbol: string;
        base: string;
        quote: string;
        settle: undefined;
        baseId: Str;
        quoteId: Str;
        settleId: undefined;
        type: Str;
        spot: boolean;
        margin: boolean;
        swap: boolean;
        future: boolean;
        option: boolean;
        active: boolean;
        contract: boolean;
        linear: undefined;
        inverse: undefined;
        taker: Num;
        maker: Num;
        contractSize: undefined;
        expiry: undefined;
        expiryDatetime: undefined;
        strike: undefined;
        optionType: undefined;
        priceScale: Int;
        valueScale: Int;
        ratioScale: Int;
        precision: {
            amount: Num;
            price: Num;
        };
        limits: {
            leverage: {
                min: undefined;
                max: undefined;
            };
            amount: {
                min: Num;
                max: Num;
            };
            price: {
                min: Num;
                max: undefined;
            };
            cost: {
                min: Num;
                max: Num;
            };
        };
        created: undefined;
        info: any;
    };
    fetchMarkets(params?: {}): Promise<never[]>;
    fetchCurrencies(params?: {}): Promise<{}>;
    customParseBidAsk(bidask: any, priceKey?: number, amountKey?: number, market?: Market): number[];
    customParseOrderBook(orderbook: any, symbol: any, timestamp?: undefined, bidsKey?: string, asksKey?: string, priceKey?: number, amountKey?: number, market?: Market): any;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    toEn(n: any, scale: any): number;
    toEv(amount: any, market?: Market): any;
    toEp(price: any, market?: Market): any;
    fromEn(en: any, scale: any): string | undefined;
    fromEp(ep: any, market?: Market): any;
    fromEv(ev: any, market?: Market): any;
    fromEr(er: any, market?: Market): any;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseTicker(ticker: any, market?: Market): Ticker;
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseTrade(trade: any, market?: Market): Trade;
    parseSpotBalance(response: any): Balances;
    parseSwapBalance(response: any): Balances;
    fetchBalance(params?: {}): Promise<Balances>;
    parseOrderStatus(status: any): Str;
    parseOrderType(type: any): Str;
    parseTimeInForce(timeInForce: any): Str;
    parseSpotOrder(order: any, market?: Market): Order;
    parseOrderSide(side: any): Str;
    parseSwapOrder(order: any, market?: Market): Order;
    parseOrder(order: any, market?: Market): Order;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: any, price?: undefined, params?: {}): Promise<Order>;
    editOrder(id: string, symbol: any, type?: undefined, side?: undefined, amount?: undefined, price?: undefined, params?: {}): Promise<Order>;
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    cancelAllOrders(symbol?: Str, params?: {}): Promise<any>;
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    fetchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchDepositAddress(code: string, params?: {}): Promise<{
        currency: string;
        address: Str;
        tag: Str;
        network: undefined;
        info: any;
    }>;
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    parseTransactionStatus(status: any): Str;
    parseTransaction(transaction: any, currency?: Currency): Transaction;
    fetchPositions(symbols?: Strings, params?: {}): Promise<import("./base/types.js").Position[]>;
    parsePosition(position: any, market?: Market): import("./base/types.js").Position;
    fetchFundingHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<FundingHistory[]>;
    fetchFundingRate(symbol: string, params?: {}): Promise<{
        info: any;
        symbol: string;
        markPrice: any;
        indexPrice: any;
        interestRate: undefined;
        estimatedSettlePrice: undefined;
        timestamp: Int;
        datetime: string | undefined;
        fundingRate: any;
        fundingTimestamp: undefined;
        fundingDatetime: undefined;
        nextFundingRate: any;
        nextFundingTimestamp: undefined;
        nextFundingDatetime: undefined;
        previousFundingRate: undefined;
        previousFundingTimestamp: undefined;
        previousFundingDatetime: undefined;
    }>;
    parseFundingRate(contract: any, market?: Market): {
        info: any;
        symbol: string;
        markPrice: any;
        indexPrice: any;
        interestRate: undefined;
        estimatedSettlePrice: undefined;
        timestamp: Int;
        datetime: string | undefined;
        fundingRate: any;
        fundingTimestamp: undefined;
        fundingDatetime: undefined;
        nextFundingRate: any;
        nextFundingTimestamp: undefined;
        nextFundingDatetime: undefined;
        previousFundingRate: undefined;
        previousFundingTimestamp: undefined;
        previousFundingDatetime: undefined;
    };
    setMargin(symbol: string, amount: any, params?: {}): Promise<any>;
    parseMarginStatus(status: any): Str;
    parseMarginModification(data: any, market?: Market): {
        info: any;
        type: string;
        amount: undefined;
        total: undefined;
        code: string;
        symbol: string;
        status: Str;
    };
    setMarginMode(marginMode: any, symbol?: Str, params?: {}): Promise<any>;
    setPositionMode(hedged: any, symbol?: Str, params?: {}): Promise<any>;
    fetchLeverageTiers(symbols?: Strings, params?: {}): Promise<{}>;
    parseMarketLeverageTiers(info: any, market?: Market): never[];
    sign(path: any, api?: string, method?: string, params?: {}, headers?: undefined, body?: undefined): {
        url: string;
        method: string;
        body: undefined;
        headers: undefined;
    };
    setLeverage(leverage: any, symbol?: Str, params?: {}): Promise<undefined>;
    transfer(code: string, amount: any, fromAccount: any, toAccount: any, params?: {}): Promise<undefined>;
    fetchTransfers(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    parseTransfer(transfer: any, currency?: Currency): {
        info: any;
        id: Str;
        timestamp: Int;
        datetime: string | undefined;
        currency: string;
        amount: any;
        fromAccount: undefined;
        toAccount: undefined;
        status: Str;
    };
    parseTransferStatus(status: any): Str;
    fetchFundingRateHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<FundingRateHistory[]>;
    handleErrors(httpCode: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): undefined;
}
