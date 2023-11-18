import Exchange from './abstract/bitmex.js';
import { Int, OrderSide, OrderType, Trade, OHLCV, Order, Liquidation, OrderBook, Balances, Str, Transaction, Ticker, Tickers, Market, Strings, Currency } from './base/types.js';
/**
 * @class bitmex
 * @extends Exchange
 */
export default class bitmex extends Exchange {
    describe(): undefined;
    fetchCurrencies(params?: {}): Promise<{}>;
    convertFromRealAmount(code: any, amount: any): number;
    convertToRealAmount(code: string, amount: string): string | undefined;
    amountToPrecision(symbol: any, amount: any): any;
    convertFromRawQuantity(symbol: any, rawQuantity: any, currencySide?: string): number;
    convertFromRawCost(symbol: any, rawQuantity: any): number;
    fetchMarkets(params?: {}): Promise<Market[]>;
    parseMarket(market: any): Market;
    parseBalance(response: any): Balances;
    fetchBalance(params?: {}): Promise<Balances>;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    fetchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseLedgerEntryType(type: any): Str;
    parseLedgerEntry(item: any, currency?: Currency): {
        id: Str;
        info: any;
        timestamp: number;
        datetime: string | undefined;
        direction: undefined;
        account: Str;
        referenceId: Str;
        referenceAccount: undefined;
        type: Str;
        currency: string;
        amount: string | undefined;
        before: number;
        after: number;
        status: Str;
        fee: {
            cost: number;
            currency: string;
        };
    };
    fetchLedger(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    fetchDepositsWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    parseTransactionStatus(status: any): Str;
    parseTransaction(transaction: any, currency?: Currency): Transaction;
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    parseTicker(ticker: any, market?: Market): Ticker;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseTrade(trade: any, market?: Market): Trade;
    parseOrderStatus(status: any): Str;
    parseTimeInForce(timeInForce: any): Str;
    parseOrder(order: any, market?: Market): Order;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: any, price?: undefined, params?: {}): Promise<Order>;
    editOrder(id: string, symbol: any, type: any, side: any, amount?: undefined, price?: undefined, params?: {}): Promise<Order>;
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    cancelOrders(ids: any, symbol?: Str, params?: {}): Promise<Order[]>;
    cancelAllOrders(symbol?: Str, params?: {}): Promise<Order[]>;
    fetchPositions(symbols?: Strings, params?: {}): Promise<import("./base/types.js").Position[]>;
    parsePosition(position: any, market?: Market): import("./base/types.js").Position;
    withdraw(code: string, amount: any, address: any, tag?: undefined, params?: {}): Promise<Transaction>;
    fetchFundingRates(symbols?: Strings, params?: {}): Promise<any>;
    parseFundingRate(contract: any, market?: Market): {
        info: any;
        symbol: string;
        markPrice: import("./base/types.js").Num;
        indexPrice: undefined;
        interestRate: undefined;
        estimatedSettlePrice: import("./base/types.js").Num;
        timestamp: number | undefined;
        datetime: Str;
        fundingRate: import("./base/types.js").Num;
        fundingTimestamp: string | undefined;
        fundingDatetime: Str;
        nextFundingRate: import("./base/types.js").Num;
        nextFundingTimestamp: undefined;
        nextFundingDatetime: undefined;
        previousFundingRate: undefined;
        previousFundingTimestamp: undefined;
        previousFundingDatetime: undefined;
    };
    fetchFundingRateHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<import("./base/types.js").FundingRateHistory[]>;
    parseFundingRateHistory(info: any, market?: Market): {
        info: any;
        symbol: string;
        fundingRate: import("./base/types.js").Num;
        timestamp: number | undefined;
        datetime: Str;
    };
    setLeverage(leverage: any, symbol?: Str, params?: {}): Promise<any>;
    setMarginMode(marginMode: any, symbol?: Str, params?: {}): Promise<any>;
    fetchDepositAddress(code: string, params?: {}): Promise<{
        currency: string;
        address: any;
        tag: undefined;
        network: never;
        info: any;
    }>;
    parseDepositWithdrawFee(fee: any, currency?: Currency): {
        info: any;
        withdraw: {
            fee: undefined;
            percentage: undefined;
        };
        deposit: {
            fee: undefined;
            percentage: undefined;
        };
        networks: {};
    };
    fetchDepositWithdrawFees(codes?: Strings, params?: {}): Promise<any>;
    calculateRateLimiterCost(api: any, method: any, path: any, params: any, config?: {}): any;
    fetchLiquidations(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Liquidation[]>;
    parseLiquidation(liquidation: any, market?: Market): Liquidation;
    handleErrors(code: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): undefined;
    nonce(): number;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: undefined, body?: undefined): {
        url: string;
        method: string;
        body: undefined;
        headers: undefined;
    };
}
