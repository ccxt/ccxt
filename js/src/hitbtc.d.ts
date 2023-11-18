import Exchange from './abstract/hitbtc.js';
import { Int, OrderSide, OrderType, FundingRateHistory, OHLCV, Ticker, Order, OrderBook, Dictionary, Position, Str, Trade, Balances, Transaction, MarginMode, Tickers, Strings, Market, Currency } from './base/types.js';
/**
 * @class hitbtc
 * @extends Exchange
 */
export default class hitbtc extends Exchange {
    describe(): undefined;
    nonce(): number;
    fetchMarkets(params?: {}): Promise<never[]>;
    fetchCurrencies(params?: {}): Promise<{}>;
    safeNetwork(networkId: any): any;
    createDepositAddress(code: string, params?: {}): Promise<{
        currency: string;
        address: Str;
        tag: Str;
        network: undefined;
        info: any;
    }>;
    fetchDepositAddress(code: string, params?: {}): Promise<{
        info: any;
        address: Str;
        tag: Str;
        code: string;
        currency: string;
        network: undefined;
    }>;
    parseBalance(response: any): Balances;
    fetchBalance(params?: {}): Promise<Balances>;
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    parseTicker(ticker: any, market?: Market): Ticker;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseTrade(trade: any, market?: Market): Trade;
    fetchTransactionsHelper(types: any, code: any, since: any, limit: any, params: any): Promise<any>;
    parseTransactionStatus(status: any): Str;
    parseTransactionType(type: any): Str;
    parseTransaction(transaction: any, currency?: Currency): Transaction;
    fetchDepositsWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchOrderBooks(symbols?: Strings, limit?: Int, params?: {}): Promise<Dictionary<OrderBook>>;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseTradingFee(fee: any, market?: Market): {
        info: any;
        symbol: string;
        taker: import("./base/types.js").Num;
        maker: import("./base/types.js").Num;
    };
    fetchTradingFee(symbol: string, params?: {}): Promise<{
        info: any;
        symbol: string;
        taker: import("./base/types.js").Num;
        maker: import("./base/types.js").Num;
    }>;
    fetchTradingFees(params?: {}): Promise<{}>;
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    fetchOrderTrades(id: string, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOpenOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    cancelAllOrders(symbol?: Str, params?: {}): Promise<Order[]>;
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    editOrder(id: string, symbol: any, type: any, side: any, amount?: undefined, price?: undefined, params?: {}): Promise<Order>;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: any, price?: undefined, params?: {}): Promise<Order>;
    parseOrderStatus(status: any): Str;
    parseOrder(order: any, market?: Market): Order;
    fetchMarginMode(symbol?: Str, params?: {}): Promise<MarginMode>;
    transfer(code: string, amount: any, fromAccount: any, toAccount: any, params?: {}): Promise<{
        id: Str;
        timestamp: number;
        datetime: string | undefined;
        currency: string;
        amount: undefined;
        fromAccount: undefined;
        toAccount: undefined;
        status: undefined;
        info: any;
    }>;
    parseTransfer(transfer: any, currency?: Currency): {
        id: Str;
        timestamp: number;
        datetime: string | undefined;
        currency: string;
        amount: undefined;
        fromAccount: undefined;
        toAccount: undefined;
        status: undefined;
        info: any;
    };
    convertCurrencyNetwork(code: string, amount: any, fromNetwork: any, toNetwork: any, params: any): Promise<{
        info: any;
    }>;
    withdraw(code: string, amount: any, address: any, tag?: undefined, params?: {}): Promise<Transaction>;
    fetchFundingRates(symbols?: Strings, params?: {}): Promise<any>;
    fetchFundingRateHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<FundingRateHistory[]>;
    fetchPositions(symbols?: Strings, params?: {}): Promise<Position[]>;
    fetchPosition(symbol: string, params?: {}): Promise<Position>;
    parsePosition(position: any, market?: Market): Position;
    parseOpenInterest(interest: any, market?: Market): import("./base/types.js").OpenInterest;
    fetchOpenInterest(symbol: string, params?: {}): Promise<import("./base/types.js").OpenInterest>;
    fetchFundingRate(symbol: string, params?: {}): Promise<{
        info: any;
        symbol: string;
        markPrice: import("./base/types.js").Num;
        indexPrice: import("./base/types.js").Num;
        interestRate: import("./base/types.js").Num;
        estimatedSettlePrice: undefined;
        timestamp: number | undefined;
        datetime: Str;
        fundingRate: import("./base/types.js").Num;
        fundingTimestamp: number | undefined;
        fundingDatetime: Str;
        nextFundingRate: import("./base/types.js").Num;
        nextFundingTimestamp: undefined;
        nextFundingDatetime: undefined;
        previousFundingRate: undefined;
        previousFundingTimestamp: undefined;
        previousFundingDatetime: undefined;
    }>;
    parseFundingRate(contract: any, market?: Market): {
        info: any;
        symbol: string;
        markPrice: import("./base/types.js").Num;
        indexPrice: import("./base/types.js").Num;
        interestRate: import("./base/types.js").Num;
        estimatedSettlePrice: undefined;
        timestamp: number | undefined;
        datetime: Str;
        fundingRate: import("./base/types.js").Num;
        fundingTimestamp: number | undefined;
        fundingDatetime: Str;
        nextFundingRate: import("./base/types.js").Num;
        nextFundingTimestamp: undefined;
        nextFundingDatetime: undefined;
        previousFundingRate: undefined;
        previousFundingTimestamp: undefined;
        previousFundingDatetime: undefined;
    };
    modifyMarginHelper(symbol: string, amount: any, type: any, params?: {}): Promise<any>;
    parseMarginModification(data: any, market?: Market): {
        info: any;
        type: undefined;
        amount: undefined;
        code: Str;
        symbol: string;
        status: undefined;
    };
    reduceMargin(symbol: string, amount: any, params?: {}): Promise<any>;
    addMargin(symbol: string, amount: any, params?: {}): Promise<any>;
    fetchLeverage(symbol: string, params?: {}): Promise<import("./base/types.js").Num>;
    setLeverage(leverage: any, symbol?: Str, params?: {}): Promise<any>;
    fetchDepositWithdrawFees(codes?: Strings, params?: {}): Promise<any>;
    parseDepositWithdrawFee(fee: any, currency?: Currency): any;
    handleMarginModeAndParams(methodName: any, params?: {}, defaultValue?: undefined): ({} | undefined)[];
    handleErrors(code: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): undefined;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: undefined, body?: undefined): {
        url: string;
        method: string;
        body: undefined;
        headers: undefined;
    };
}
