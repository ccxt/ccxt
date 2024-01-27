import Exchange from './abstract/whitebit.js';
import type { Balances, Currency, Int, Market, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, Transaction } from './base/types.js';
/**
 * @class whitebit
 * @augments Exchange
 */
export default class whitebit extends Exchange {
    describe(): any;
    fetchMarkets(params?: {}): Promise<import("./base/types.js").MarketInterface[]>;
    parseMarket(market: any): Market;
    fetchCurrencies(params?: {}): Promise<{}>;
    fetchTransactionFees(codes?: any, params?: {}): Promise<{
        withdraw: {};
        deposit: {};
        info: any;
    }>;
    fetchDepositWithdrawFees(codes?: Strings, params?: {}): Promise<{}>;
    parseDepositWithdrawFees(response: any, codes?: any, currencyIdKey?: any): {};
    fetchTradingFees(params?: {}): Promise<{}>;
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    parseTicker(ticker: any, market?: Market): Ticker;
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseTrade(trade: any, market?: Market): Trade;
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    fetchStatus(params?: {}): Promise<{
        status: string;
        updated: any;
        eta: any;
        url: any;
        info: any;
    }>;
    fetchTime(params?: {}): Promise<number>;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: any, price?: any, params?: {}): Promise<Order>;
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<any>;
    parseBalance(response: any): Balances;
    fetchBalance(params?: {}): Promise<Balances>;
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    parseOrderType(type: any): string;
    parseOrder(order: any, market?: Market): Order;
    fetchOrderTrades(id: string, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchDepositAddress(code: string, params?: {}): Promise<{
        currency: string;
        address: string;
        tag: string;
        network: any;
        info: any;
    }>;
    setLeverage(leverage: any, symbol?: Str, params?: {}): Promise<any>;
    transfer(code: string, amount: any, fromAccount: any, toAccount: any, params?: {}): Promise<{
        info: any;
        id: any;
        timestamp: any;
        datetime: any;
        currency: string;
        amount: any;
        fromAccount: any;
        toAccount: any;
        status: any;
    }>;
    parseTransfer(transfer: any, currency?: Currency): {
        info: any;
        id: any;
        timestamp: any;
        datetime: any;
        currency: string;
        amount: any;
        fromAccount: any;
        toAccount: any;
        status: any;
    };
    withdraw(code: string, amount: any, address: any, tag?: any, params?: {}): Promise<any>;
    parseTransaction(transaction: any, currency?: Currency): Transaction;
    parseTransactionStatus(status: any): string;
    fetchDeposit(id: string, code?: Str, params?: {}): Promise<Transaction>;
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchBorrowInterest(code?: Str, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    parseBorrowInterest(info: any, market?: Market): {
        symbol: string;
        marginMode: string;
        currency: string;
        interest: number;
        interestRate: number;
        amountBorrowed: number;
        timestamp: number;
        datetime: string;
        info: any;
    };
    fetchFundingRate(symbol: string, params?: {}): Promise<any>;
    fetchFundingRates(symbols?: Strings, params?: {}): Promise<any>;
    parseFundingRate(contract: any, market?: Market): {
        info: any;
        symbol: string;
        markPrice: number;
        indexPrice: number;
        interestRate: number;
        timestamp: any;
        datetime: any;
        fundingRate: number;
        fundingTimestamp: any;
        fundingDatetime: string;
        nextFundingRate: any;
        nextFundingTimestamp: number;
        nextFundingDatetime: string;
        previousFundingRate: any;
        previousFundingTimestamp: any;
        previousFundingDatetime: any;
    };
    isFiat(currency: any): any;
    nonce(): number;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(code: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): any;
}
