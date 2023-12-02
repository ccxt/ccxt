import Exchange from './abstract/phemex.js';
import { Balances, Currency, FundingHistory, FundingRateHistory, Int, Market, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, Transaction } from './base/types.js';
/**
 * @class phemex
 * @extends Exchange
 */
export default class phemex extends Exchange {
    describe(): any;
    parseSafeNumber(value?: any): any;
    parseSwapMarket(market: any): {
        id: string;
        symbol: string;
        base: string;
        quote: string;
        settle: string;
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
        taker: number;
        maker: number;
        contractSize: number;
        expiry: any;
        expiryDatetime: any;
        strike: any;
        optionType: any;
        priceScale: number;
        valueScale: number;
        ratioScale: number;
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
                min: any;
                max: any;
            };
            price: {
                min: number;
                max: number;
            };
            cost: {
                min: any;
                max: number;
            };
        };
        created: any;
        info: any;
    };
    parseSpotMarket(market: any): {
        id: string;
        symbol: string;
        base: string;
        quote: string;
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
        priceScale: number;
        valueScale: number;
        ratioScale: number;
        precision: {
            amount: any;
            price: any;
        };
        limits: {
            leverage: {
                min: any;
                max: any;
            };
            amount: {
                min: any;
                max: any;
            };
            price: {
                min: any;
                max: any;
            };
            cost: {
                min: any;
                max: any;
            };
        };
        created: any;
        info: any;
    };
    fetchMarkets(params?: {}): Promise<any[]>;
    fetchCurrencies(params?: {}): Promise<{}>;
    customParseBidAsk(bidask: any, priceKey?: number, amountKey?: number, market?: Market): number[];
    customParseOrderBook(orderbook: any, symbol: any, timestamp?: any, bidsKey?: string, asksKey?: string, priceKey?: number, amountKey?: number, market?: Market): any;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    toEn(n: any, scale: any): number;
    toEv(amount: any, market?: Market): any;
    toEp(price: any, market?: Market): any;
    fromEn(en: any, scale: any): string;
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
    parseOrderStatus(status: any): string;
    parseOrderType(type: any): string;
    parseTimeInForce(timeInForce: any): string;
    parseSpotOrder(order: any, market?: Market): Order;
    parseOrderSide(side: any): string;
    parseSwapOrder(order: any, market?: Market): Order;
    parseOrder(order: any, market?: Market): Order;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: any, price?: any, params?: {}): Promise<Order>;
    editOrder(id: string, symbol: any, type?: any, side?: any, amount?: any, price?: any, params?: {}): Promise<Order>;
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    cancelAllOrders(symbol?: Str, params?: {}): Promise<any>;
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    fetchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchDepositAddress(code: string, params?: {}): Promise<{
        currency: string;
        address: string;
        tag: string;
        network: any;
        info: any;
    }>;
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    parseTransactionStatus(status: any): string;
    parseTransaction(transaction: any, currency?: Currency): Transaction;
    fetchPositions(symbols?: Strings, params?: {}): Promise<import("./base/types.js").Position[]>;
    parsePosition(position: any, market?: Market): import("./base/types.js").Position;
    fetchFundingHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<FundingHistory[]>;
    fetchFundingRate(symbol: string, params?: {}): Promise<{
        info: any;
        symbol: string;
        markPrice: any;
        indexPrice: any;
        interestRate: any;
        estimatedSettlePrice: any;
        timestamp: number;
        datetime: string;
        fundingRate: any;
        fundingTimestamp: any;
        fundingDatetime: any;
        nextFundingRate: any;
        nextFundingTimestamp: any;
        nextFundingDatetime: any;
        previousFundingRate: any;
        previousFundingTimestamp: any;
        previousFundingDatetime: any;
    }>;
    parseFundingRate(contract: any, market?: Market): {
        info: any;
        symbol: string;
        markPrice: any;
        indexPrice: any;
        interestRate: any;
        estimatedSettlePrice: any;
        timestamp: number;
        datetime: string;
        fundingRate: any;
        fundingTimestamp: any;
        fundingDatetime: any;
        nextFundingRate: any;
        nextFundingTimestamp: any;
        nextFundingDatetime: any;
        previousFundingRate: any;
        previousFundingTimestamp: any;
        previousFundingDatetime: any;
    };
    setMargin(symbol: string, amount: any, params?: {}): Promise<any>;
    parseMarginStatus(status: any): string;
    parseMarginModification(data: any, market?: Market): {
        info: any;
        type: string;
        amount: any;
        total: any;
        code: string;
        symbol: string;
        status: string;
    };
    setMarginMode(marginMode: any, symbol?: Str, params?: {}): Promise<any>;
    setPositionMode(hedged: any, symbol?: Str, params?: {}): Promise<any>;
    fetchLeverageTiers(symbols?: Strings, params?: {}): Promise<{}>;
    parseMarketLeverageTiers(info: any, market?: Market): any[];
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    setLeverage(leverage: any, symbol?: Str, params?: {}): Promise<any>;
    transfer(code: string, amount: any, fromAccount: any, toAccount: any, params?: {}): Promise<any>;
    fetchTransfers(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    parseTransfer(transfer: any, currency?: Currency): {
        info: any;
        id: string;
        timestamp: number;
        datetime: string;
        currency: string;
        amount: any;
        fromAccount: any;
        toAccount: any;
        status: string;
    };
    parseTransferStatus(status: any): string;
    fetchFundingRateHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<FundingRateHistory[]>;
    handleErrors(httpCode: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): any;
}
