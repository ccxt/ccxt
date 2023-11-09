import Exchange from './abstract/kraken.js';
import { Int, OrderSide, OrderType, OHLCV, Trade, Order, Balances, Transaction, Ticker, OrderBook } from './base/types.js';
/**
 * @class kraken
 * @extends Exchange
 */
export default class kraken extends Exchange {
    describe(): any;
    feeToPrecision(symbol: any, fee: any): any;
    fetchMarkets(params?: {}): Promise<any[]>;
    safeCurrency(currencyId: any, currency?: any): any;
    appendInactiveMarkets(result: any): any;
    fetchCurrencies(params?: {}): Promise<{}>;
    fetchTradingFee(symbol: string, params?: {}): Promise<{
        info: any;
        symbol: any;
        maker: number;
        taker: number;
        percentage: boolean;
        tierBased: boolean;
    }>;
    parseTradingFee(response: any, market: any): {
        info: any;
        symbol: any;
        maker: number;
        taker: number;
        percentage: boolean;
        tierBased: boolean;
    };
    parseBidAsk(bidask: any, priceKey?: number, amountKey?: number): number[];
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseTicker(ticker: any, market?: any): Ticker;
    fetchTickers(symbols?: string[], params?: {}): Promise<import("./base/types.js").Dictionary<Ticker>>;
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    parseOHLCV(ohlcv: any, market?: any): OHLCV;
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseLedgerEntryType(type: any): string;
    parseLedgerEntry(item: any, currency?: any): {
        info: any;
        id: string;
        direction: any;
        account: any;
        referenceId: string;
        referenceAccount: any;
        type: string;
        currency: any;
        amount: number;
        before: any;
        after: number;
        status: string;
        timestamp: number;
        datetime: string;
        fee: {
            cost: number;
            currency: any;
        };
    };
    fetchLedger(code?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    fetchLedgerEntriesByIds(ids: any, code?: string, params?: {}): Promise<any>;
    fetchLedgerEntry(id: string, code?: string, params?: {}): Promise<any>;
    parseTrade(trade: any, market?: any): Trade;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseBalance(response: any): Balances;
    fetchBalance(params?: {}): Promise<Balances>;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: any, price?: any, params?: {}): Promise<Order>;
    findMarketByAltnameOrId(id: any): any;
    getDelistedMarketById(id: any): any;
    parseOrderStatus(status: any): string;
    parseOrder(order: any, market?: any): Order;
    orderRequest(method: any, symbol: any, type: any, request: any, price?: any, params?: {}): any[];
    editOrder(id: string, symbol: any, type: any, side: any, amount?: any, price?: any, params?: {}): Promise<Order>;
    fetchOrder(id: string, symbol?: string, params?: {}): Promise<Order>;
    fetchOrderTrades(id: string, symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchOrdersByIds(ids: any, symbol?: string, params?: {}): Promise<any[]>;
    fetchMyTrades(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    cancelOrder(id: string, symbol?: string, params?: {}): Promise<any>;
    cancelOrders(ids: any, symbol?: string, params?: {}): Promise<any>;
    cancelAllOrders(symbol?: string, params?: {}): Promise<any>;
    fetchOpenOrders(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchClosedOrders(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    parseTransactionStatus(status: any): string;
    parseTransaction(transaction: any, currency?: any): Transaction;
    parseTransactionsByType(type: any, transactions: any, code?: string, since?: Int, limit?: Int): any;
    fetchDeposits(code?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    fetchTime(params?: {}): Promise<number>;
    fetchWithdrawals(code?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    createDepositAddress(code: string, params?: {}): Promise<{
        currency: any;
        address: string;
        tag: string;
        network: any;
        info: any;
    }>;
    fetchDepositMethods(code: string, params?: {}): Promise<any>;
    fetchDepositAddress(code: string, params?: {}): Promise<{
        currency: any;
        address: string;
        tag: string;
        network: any;
        info: any;
    }>;
    parseDepositAddress(depositAddress: any, currency?: any): {
        currency: any;
        address: string;
        tag: string;
        network: any;
        info: any;
    };
    withdraw(code: string, amount: any, address: any, tag?: any, params?: {}): Promise<Transaction>;
    fetchPositions(symbols?: string[], params?: {}): Promise<any>;
    parseAccount(account: any): string;
    transferOut(code: string, amount: any, params?: {}): Promise<any>;
    transfer(code: string, amount: any, fromAccount: any, toAccount: any, params?: {}): Promise<any>;
    parseTransfer(transfer: any, currency?: any): {
        info: any;
        id: string;
        timestamp: any;
        datetime: any;
        currency: string;
        amount: any;
        fromAccount: any;
        toAccount: any;
        status: string;
    };
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    nonce(): number;
    handleErrors(code: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): any;
}
