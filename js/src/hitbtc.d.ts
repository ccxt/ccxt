import Exchange from './abstract/hitbtc.js';
import type { TransferEntry, Int, OrderSide, OrderType, FundingRateHistory, OHLCV, Ticker, Order, OrderBook, Dictionary, Position, Str, Trade, Balances, Transaction, MarginMode, Tickers, Strings, Market, Currency, MarginModes } from './base/types.js';
/**
 * @class hitbtc
 * @augments Exchange
 */
export default class hitbtc extends Exchange {
    describe(): any;
    nonce(): number;
    fetchMarkets(params?: {}): Promise<any[]>;
    fetchCurrencies(params?: {}): Promise<{}>;
    safeNetwork(networkId: any): any;
    createDepositAddress(code: string, params?: {}): Promise<{
        currency: string;
        address: string;
        tag: string;
        network: any;
        info: any;
    }>;
    fetchDepositAddress(code: string, params?: {}): Promise<{
        info: any;
        address: string;
        tag: string;
        code: string;
        currency: string;
        network: any;
    }>;
    parseBalance(response: any): Balances;
    fetchBalance(params?: {}): Promise<Balances>;
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    parseTicker(ticker: any, market?: Market): Ticker;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseTrade(trade: any, market?: Market): Trade;
    fetchTransactionsHelper(types: any, code: any, since: any, limit: any, params: any): Promise<Transaction[]>;
    parseTransactionStatus(status: any): string;
    parseTransactionType(type: any): string;
    parseTransaction(transaction: any, currency?: Currency): Transaction;
    fetchDepositsWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchOrderBooks(symbols?: Strings, limit?: Int, params?: {}): Promise<Dictionary<OrderBook>>;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseTradingFee(fee: any, market?: Market): {
        info: any;
        symbol: string;
        taker: number;
        maker: number;
    };
    fetchTradingFee(symbol: string, params?: {}): Promise<{
        info: any;
        symbol: string;
        taker: number;
        maker: number;
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
    editOrder(id: string, symbol: string, type: OrderType, side: OrderSide, amount?: number, price?: number, params?: {}): Promise<Order>;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: number, params?: {}): Promise<Order>;
    createOrderRequest(market: object, marketType: string, type: OrderType, side: OrderSide, amount: any, price?: any, marginMode?: Str, params?: {}): {}[];
    parseOrderStatus(status: any): string;
    parseOrder(order: any, market?: Market): Order;
    fetchMarginModes(symbols?: Str[], params?: {}): Promise<MarginModes>;
    parseMarginMode(marginMode: any, market?: any): MarginMode;
    transfer(code: string, amount: number, fromAccount: string, toAccount: string, params?: {}): Promise<TransferEntry>;
    parseTransfer(transfer: any, currency?: Currency): {
        id: string;
        timestamp: any;
        datetime: any;
        currency: string;
        amount: any;
        fromAccount: any;
        toAccount: any;
        status: any;
        info: any;
    };
    convertCurrencyNetwork(code: string, amount: any, fromNetwork: any, toNetwork: any, params: any): Promise<{
        info: any;
    }>;
    withdraw(code: string, amount: number, address: any, tag?: any, params?: {}): Promise<Transaction>;
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
        markPrice: number;
        indexPrice: number;
        interestRate: number;
        estimatedSettlePrice: any;
        timestamp: number;
        datetime: string;
        fundingRate: number;
        fundingTimestamp: number;
        fundingDatetime: string;
        nextFundingRate: number;
        nextFundingTimestamp: any;
        nextFundingDatetime: any;
        previousFundingRate: any;
        previousFundingTimestamp: any;
        previousFundingDatetime: any;
    }>;
    parseFundingRate(contract: any, market?: Market): {
        info: any;
        symbol: string;
        markPrice: number;
        indexPrice: number;
        interestRate: number;
        estimatedSettlePrice: any;
        timestamp: number;
        datetime: string;
        fundingRate: number;
        fundingTimestamp: number;
        fundingDatetime: string;
        nextFundingRate: number;
        nextFundingTimestamp: any;
        nextFundingDatetime: any;
        previousFundingRate: any;
        previousFundingTimestamp: any;
        previousFundingDatetime: any;
    };
    modifyMarginHelper(symbol: string, amount: any, type: any, params?: {}): Promise<any>;
    parseMarginModification(data: any, market?: Market): {
        info: any;
        type: any;
        amount: any;
        code: string;
        symbol: string;
        status: any;
    };
    reduceMargin(symbol: string, amount: any, params?: {}): Promise<any>;
    addMargin(symbol: string, amount: any, params?: {}): Promise<any>;
    fetchLeverage(symbol: string, params?: {}): Promise<number>;
    setLeverage(leverage: Int, symbol?: Str, params?: {}): Promise<any>;
    fetchDepositWithdrawFees(codes?: Strings, params?: {}): Promise<any>;
    parseDepositWithdrawFee(fee: any, currency?: Currency): any;
    closePosition(symbol: string, side?: OrderSide, params?: {}): Promise<Order>;
    handleMarginModeAndParams(methodName: any, params?: {}, defaultValue?: any): any[];
    handleErrors(code: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): any;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
}
