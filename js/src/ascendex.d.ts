import Exchange from './abstract/ascendex.js';
import { FundingHistory, Int, OHLCV, Order, OrderSide, OrderType, OrderRequest, Str, Trade, Balances, Transaction, Ticker, OrderBook, Tickers, Strings, Num, Currency, Market } from './base/types.js';
/**
 * @class ascendex
 * @extends Exchange
 */
export default class ascendex extends Exchange {
    describe(): undefined;
    getAccount(params?: {}): string;
    fetchCurrencies(params?: {}): Promise<{}>;
    fetchMarkets(params?: {}): Promise<never[]>;
    fetchTime(params?: {}): Promise<Int>;
    fetchAccounts(params?: {}): Promise<{
        id: Str;
        type: undefined;
        currency: undefined;
        info: undefined;
    }[]>;
    parseBalance(response: any): Balances;
    parseMarginBalance(response: any): Balances;
    parseSwapBalance(response: any): Balances;
    fetchBalance(params?: {}): Promise<Balances>;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseTicker(ticker: any, market?: Market): Ticker;
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseTrade(trade: any, market?: Market): Trade;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseOrderStatus(status: any): Str;
    parseOrder(order: any, market?: Market): Order;
    fetchTradingFees(params?: {}): Promise<{}>;
    createOrderRequest(symbol: string, type: OrderType, side: OrderSide, amount: any, price?: undefined, params?: {}): any;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: any, price?: undefined, params?: {}): Promise<Order>;
    createOrders(orders: OrderRequest[], params?: {}): Promise<Order[]>;
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    cancelAllOrders(symbol?: Str, params?: {}): Promise<any>;
    parseDepositAddress(depositAddress: any, currency?: Currency): {
        currency: string | undefined;
        address: Str;
        tag: Str;
        network: Str;
        info: any;
    };
    safeNetwork(networkId: any): Str;
    fetchDepositAddress(code: string, params?: {}): Promise<any>;
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchDepositsWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    parseTransactionStatus(status: any): Str;
    parseTransaction(transaction: any, currency?: Currency): Transaction;
    fetchPositions(symbols?: Strings, params?: {}): Promise<import("./base/types.js").Position[]>;
    parsePosition(position: any, market?: Market): import("./base/types.js").Position;
    parseFundingRate(contract: any, market?: Market): {
        info: any;
        symbol: string;
        markPrice: Num;
        indexPrice: Num;
        interestRate: number;
        estimatedSettlePrice: undefined;
        timestamp: Int;
        datetime: string | undefined;
        previousFundingRate: undefined;
        nextFundingRate: undefined;
        previousFundingTimestamp: undefined;
        nextFundingTimestamp: undefined;
        previousFundingDatetime: undefined;
        nextFundingDatetime: undefined;
        fundingRate: Num;
        fundingTimestamp: Int;
        fundingDatetime: string | undefined;
    };
    fetchFundingRates(symbols?: Strings, params?: {}): Promise<any>;
    modifyMarginHelper(symbol: string, amount: any, type: any, params?: {}): Promise<any>;
    parseMarginModification(data: any, market?: Market): {
        info: any;
        type: undefined;
        amount: undefined;
        code: string;
        symbol: string;
        status: string;
    };
    reduceMargin(symbol: string, amount: any, params?: {}): Promise<any>;
    addMargin(symbol: string, amount: any, params?: {}): Promise<any>;
    setLeverage(leverage: any, symbol?: Str, params?: {}): Promise<any>;
    setMarginMode(marginMode: any, symbol?: Str, params?: {}): Promise<any>;
    fetchLeverageTiers(symbols?: Strings, params?: {}): Promise<{}>;
    parseMarketLeverageTiers(info: any, market?: Market): never[];
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
    transfer(code: string, amount: any, fromAccount: any, toAccount: any, params?: {}): Promise<{
        info: any;
        id: undefined;
        timestamp: number;
        datetime: string | undefined;
        currency: string;
        amount: undefined;
        fromAccount: undefined;
        toAccount: undefined;
        status: string;
    }>;
    parseTransfer(transfer: any, currency?: Currency): {
        info: any;
        id: undefined;
        timestamp: number;
        datetime: string | undefined;
        currency: string;
        amount: undefined;
        fromAccount: undefined;
        toAccount: undefined;
        status: string;
    };
    parseTransferStatus(status: any): "ok" | "failed";
    fetchFundingHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<FundingHistory[]>;
    parseIncome(income: any, market?: Market): {
        info: any;
        symbol: string;
        code: string;
        timestamp: Int;
        datetime: string | undefined;
        id: undefined;
        amount: Num;
    };
    sign(path: any, api?: string, method?: string, params?: {}, headers?: undefined, body?: undefined): {
        url: string;
        method: string;
        body: undefined;
        headers: undefined;
    };
    handleErrors(httpCode: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): undefined;
}
