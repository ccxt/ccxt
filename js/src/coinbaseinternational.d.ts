import Exchange from './abstract/coinbaseinternational.js';
import type { Int, OrderSide, OrderType, Order, Trade, Ticker, Str, Transaction, Balances, Tickers, Strings, Market, Currency, TransferEntry, Position, FundingRateHistory, Currencies } from './base/types.js';
/**
 * @class coinbaseinternational
 * @augments Exchange
 */
export default class coinbaseinternational extends Exchange {
    describe(): any;
    handlePortfolioAndParams(methodName: string, params?: {}): Promise<any[]>;
    handleNetworkIdAndParams(currencyCode: string, methodName: string, params: any): Promise<any[]>;
    fetchAccounts(params?: {}): Promise<import("./base/types.js").Account[]>;
    parseAccount(account: any): {
        id: string;
        type: any;
        code: any;
        info: any;
    };
    fetchFundingRateHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<FundingRateHistory[]>;
    parseFundingRateHistory(info: any, market?: Market): FundingRateHistory;
    parseFundingRate(contract: any, market?: Market): {
        info: any;
        symbol: string;
        markPrice: number;
        indexPrice: any;
        interestRate: any;
        estimatedSettlePrice: any;
        timestamp: number;
        datetime: string;
        fundingRate: number;
        fundingTimestamp: number;
        fundingDatetime: string;
        nextFundingRate: any;
        nextFundingTimestamp: any;
        nextFundingDatetime: any;
        previousFundingRate: any;
        previousFundingTimestamp: any;
        previousFundingDatetime: any;
    };
    createDepositAddress(code: string, params?: {}): Promise<{
        currency: string;
        tag: string;
        address: string;
        info: any;
    }>;
    findDefaultNetwork(networks: any): any;
    loadCurrencyNetworks(code: any, params?: {}): Promise<void>;
    parseNetworks(networks: any, params?: {}): {};
    parseNetwork(network: any, params?: {}): {
        info: any;
        id: string;
        name: string;
        network: string;
        active: boolean;
        deposit: boolean;
        withdraw: boolean;
        fee: number;
        precision: number;
        limits: {
            withdraw: {
                min: number;
                max: number;
            };
            deposit: {
                min: number;
                max: number;
            };
        };
    };
    setMargin(symbol: string, amount: number, params?: {}): Promise<any>;
    fetchDepositsWithdrawals(code?: string, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchPosition(symbol: string, params?: {}): Promise<Position>;
    parsePosition(position: any, market?: Market): Position;
    fetchPositions(symbols?: Strings, params?: {}): Promise<Position[]>;
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    parseTransactionStatus(status: any): string;
    parseTransaction(transaction: any, currency?: Currency): Transaction;
    parseTrade(trade: any, market?: Market): Trade;
    fetchMarkets(params?: {}): Promise<Market[]>;
    parseMarket(market: any): Market;
    fetchCurrencies(params?: {}): Promise<Currencies>;
    parseCurrency(currency: any): {
        id: string;
        name: string;
        code: string;
        precision: any;
        info: any;
        active: boolean;
        deposit: any;
        withdraw: any;
        networks: any;
        fee: any;
        fees: any;
        limits: {
            amount?: import("./base/types.js").MinMax;
            cost?: import("./base/types.js").MinMax;
            leverage?: import("./base/types.js").MinMax;
            price?: import("./base/types.js").MinMax;
        };
    };
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    parseTicker(ticker: object, market?: Market): Ticker;
    fetchBalance(params?: {}): Promise<Balances>;
    parseBalance(response: any): Balances;
    transfer(code: string, amount: number, fromAccount: string, toAccount: string, params?: {}): Promise<TransferEntry>;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: number, params?: {}): Promise<Order>;
    parseOrder(order: any, market?: Market): Order;
    parseOrderStatus(status: any): string;
    parseOrderType(type: any): string;
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    cancelAllOrders(symbol?: string, params?: {}): Promise<Order[]>;
    editOrder(id: string, symbol: string, type: OrderType, side: OrderSide, amount?: number, price?: number, params?: {}): Promise<Order>;
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    withdraw(code: string, amount: number, address: string, tag?: any, params?: {}): Promise<Transaction>;
    safeNetwork(network: any): {
        info: any;
        id: string;
        name: string;
        network: string;
        active: boolean;
        deposit: boolean;
        withdraw: boolean;
        fee: number;
        precision: number;
        limits: {
            withdraw: {
                min: number;
                max: number;
            };
            deposit: {
                min: number;
                max: number;
            };
        };
    };
    sign(path: any, api?: any[], method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(code: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): any;
}
