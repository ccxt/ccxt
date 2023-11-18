import Exchange from './abstract/bitfinex2.js';
import { Int, OrderSide, OrderType, Trade, OHLCV, Order, FundingRateHistory, OrderBook, Str, Transaction, Ticker, Balances, Tickers, Strings, Currency, Market } from './base/types.js';
/**
 * @class bitfinex2
 * @extends Exchange
 */
export default class bitfinex2 extends Exchange {
    describe(): undefined;
    isFiat(code: any): boolean;
    getCurrencyId(code: any): string;
    getCurrencyName(code: any): any;
    amountToPrecision(symbol: any, amount: any): any;
    priceToPrecision(symbol: any, price: any): any;
    fetchStatus(params?: {}): Promise<{
        status: Str;
        updated: undefined;
        eta: undefined;
        url: undefined;
        info: any;
    }>;
    fetchMarkets(params?: {}): Promise<never[]>;
    fetchCurrencies(params?: {}): Promise<{}>;
    safeNetwork(networkId: any): Str;
    fetchBalance(params?: {}): Promise<Balances>;
    transfer(code: string, amount: any, fromAccount: any, toAccount: any, params?: {}): Promise<{
        id: undefined;
        timestamp: Int;
        datetime: string | undefined;
        status: Str;
        amount: import("./base/types.js").Num;
        currency: string;
        fromAccount: Str;
        toAccount: Str;
        info: any;
    }>;
    parseTransfer(transfer: any, currency?: Currency): {
        id: undefined;
        timestamp: Int;
        datetime: string | undefined;
        status: Str;
        amount: import("./base/types.js").Num;
        currency: string;
        fromAccount: Str;
        toAccount: Str;
        info: any;
    };
    parseTransferStatus(status: any): Str;
    convertDerivativesId(currency: any, type: any): undefined;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseTicker(ticker: any, market?: Market): Ticker;
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    parseTrade(trade: any, market?: Market): Trade;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: number, params?: {}): Promise<OHLCV[]>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    parseOrderStatus(status: any): any;
    parseOrderFlags(flags: any): any;
    parseTimeInForce(orderType: any): Str;
    parseOrder(order: any, market?: Market): Order;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: any, price?: undefined, params?: {}): Promise<Order>;
    cancelAllOrders(symbol?: Str, params?: {}): Promise<Order[]>;
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    fetchOpenOrder(id: string, symbol?: Str, params?: {}): Promise<any>;
    fetchClosedOrder(id: string, symbol?: Str, params?: {}): Promise<any>;
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOrderTrades(id: string, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    createDepositAddress(code: string, params?: {}): Promise<{
        currency: string;
        address: Str;
        tag: Str;
        network: undefined;
        info: any;
    }>;
    fetchDepositAddress(code: string, params?: {}): Promise<{
        currency: string;
        address: Str;
        tag: Str;
        network: undefined;
        info: any;
    }>;
    parseTransactionStatus(status: any): Str;
    parseTransaction(transaction: any, currency?: Currency): Transaction;
    fetchTradingFees(params?: {}): Promise<{}>;
    fetchDepositsWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    withdraw(code: string, amount: any, address: any, tag?: undefined, params?: {}): Promise<any>;
    fetchPositions(symbols?: Strings, params?: {}): Promise<import("./base/types.js").Position[]>;
    parsePosition(position: any, market?: Market): import("./base/types.js").Position;
    nonce(): number;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: undefined, body?: undefined): {
        url: string;
        method: string;
        body: undefined;
        headers: undefined;
    };
    handleErrors(statusCode: any, statusText: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): any;
    parseLedgerEntryType(type: any): any;
    parseLedgerEntry(item: any, currency?: Currency): {
        id: Str;
        direction: undefined;
        account: undefined;
        referenceId: Str;
        referenceAccount: undefined;
        type: undefined;
        currency: string;
        amount: import("./base/types.js").Num;
        timestamp: Int;
        datetime: string | undefined;
        before: undefined;
        after: import("./base/types.js").Num;
        status: undefined;
        fee: undefined;
        info: any;
    };
    fetchLedger(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    fetchFundingRate(symbol: string, params?: {}): Promise<{}>;
    fetchFundingRates(symbols?: Strings, params?: {}): Promise<{}>;
    fetchFundingRateHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<FundingRateHistory[]>;
    parseFundingRate(contract: any, market?: Market): {
        info: any;
        symbol: string;
        markPrice: import("./base/types.js").Num;
        indexPrice: import("./base/types.js").Num;
        interestRate: undefined;
        estimatedSettlePrice: undefined;
        timestamp: Int;
        datetime: string | undefined;
        fundingRate: import("./base/types.js").Num;
        fundingTimestamp: undefined;
        fundingDatetime: undefined;
        nextFundingRate: import("./base/types.js").Num;
        nextFundingTimestamp: Int;
        nextFundingDatetime: string | undefined;
        previousFundingRate: undefined;
        previousFundingTimestamp: undefined;
        previousFundingDatetime: undefined;
    };
    parseFundingRateHistory(contract: any, market?: Market): {
        info: any;
        symbol: string;
        markPrice: import("./base/types.js").Num;
        indexPrice: import("./base/types.js").Num;
        interestRate: undefined;
        estimatedSettlePrice: undefined;
        timestamp: Int;
        datetime: string | undefined;
        fundingRate: import("./base/types.js").Num;
        fundingTimestamp: undefined;
        fundingDatetime: undefined;
        nextFundingRate: import("./base/types.js").Num;
        nextFundingTimestamp: Int;
        nextFundingDatetime: string | undefined;
        previousFundingRate: undefined;
        previousFundingTimestamp: undefined;
        previousFundingDatetime: undefined;
    };
}
