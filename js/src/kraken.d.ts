import Exchange from './abstract/kraken.js';
import { Int, OrderSide, OrderType, OHLCV, Trade, Order, Balances, Str, Transaction, Ticker, OrderBook, Tickers, Strings, Currency, Market } from './base/types.js';
/**
 * @class kraken
 * @extends Exchange
 */
export default class kraken extends Exchange {
    describe(): undefined;
    feeToPrecision(symbol: any, fee: any): any;
    fetchMarkets(params?: {}): Promise<never[]>;
    safeCurrency(currencyId: any, currency?: Currency): import("./base/types.js").CurrencyInterface;
    appendInactiveMarkets(result: any): any;
    fetchCurrencies(params?: {}): Promise<{}>;
    fetchTradingFee(symbol: string, params?: {}): Promise<{
        info: any;
        symbol: any;
        maker: import("./base/types.js").Num;
        taker: import("./base/types.js").Num;
        percentage: boolean;
        tierBased: boolean;
    }>;
    parseTradingFee(response: any, market: any): {
        info: any;
        symbol: any;
        maker: import("./base/types.js").Num;
        taker: import("./base/types.js").Num;
        percentage: boolean;
        tierBased: boolean;
    };
    parseBidAsk(bidask: any, priceKey?: number, amountKey?: number): (number | undefined)[];
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseTicker(ticker: any, market?: Market): Ticker;
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseLedgerEntryType(type: any): Str;
    parseLedgerEntry(item: any, currency?: Currency): {
        info: any;
        id: Str;
        direction: undefined;
        account: undefined;
        referenceId: Str;
        referenceAccount: undefined;
        type: Str;
        currency: string;
        amount: number;
        before: undefined;
        after: import("./base/types.js").Num;
        status: string;
        timestamp: number | undefined;
        datetime: string | undefined;
        fee: {
            cost: import("./base/types.js").Num;
            currency: string;
        };
    };
    fetchLedger(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    fetchLedgerEntriesByIds(ids: any, code?: Str, params?: {}): Promise<any>;
    fetchLedgerEntry(id: string, code?: Str, params?: {}): Promise<any>;
    parseTrade(trade: any, market?: Market): Trade;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseBalance(response: any): Balances;
    fetchBalance(params?: {}): Promise<Balances>;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: any, price?: undefined, params?: {}): Promise<Order>;
    findMarketByAltnameOrId(id: any): any;
    getDelistedMarketById(id: any): any;
    parseOrderStatus(status: any): Str;
    parseOrder(order: any, market?: Market): Order;
    orderRequest(method: any, symbol: any, type: any, request: any, price?: undefined, params?: {}): any[];
    editOrder(id: string, symbol: any, type: any, side: any, amount?: undefined, price?: undefined, params?: {}): Promise<Order>;
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    fetchOrderTrades(id: string, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchOrdersByIds(ids: any, symbol?: Str, params?: {}): Promise<never[]>;
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<undefined>;
    cancelOrders(ids: any, symbol?: Str, params?: {}): Promise<any>;
    cancelAllOrders(symbol?: Str, params?: {}): Promise<any>;
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    parseTransactionStatus(status: any): Str;
    parseTransaction(transaction: any, currency?: Currency): Transaction;
    parseTransactionsByType(type: any, transactions: any, code?: Str, since?: Int, limit?: Int): any;
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchTime(params?: {}): Promise<number | undefined>;
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    createDepositAddress(code: string, params?: {}): Promise<{
        currency: string;
        address: Str;
        tag: Str;
        network: undefined;
        info: any;
    }>;
    fetchDepositMethods(code: string, params?: {}): Promise<any>;
    fetchDepositAddress(code: string, params?: {}): Promise<{
        currency: string;
        address: Str;
        tag: Str;
        network: undefined;
        info: any;
    }>;
    parseDepositAddress(depositAddress: any, currency?: Currency): {
        currency: string;
        address: Str;
        tag: Str;
        network: undefined;
        info: any;
    };
    withdraw(code: string, amount: any, address: any, tag?: undefined, params?: {}): Promise<Transaction>;
    fetchPositions(symbols?: Strings, params?: {}): Promise<any>;
    parseAccount(account: any): Str;
    transferOut(code: string, amount: any, params?: {}): Promise<any>;
    transfer(code: string, amount: any, fromAccount: any, toAccount: any, params?: {}): Promise<any>;
    parseTransfer(transfer: any, currency?: Currency): {
        info: any;
        id: Str;
        timestamp: undefined;
        datetime: undefined;
        currency: Str;
        amount: undefined;
        fromAccount: undefined;
        toAccount: undefined;
        status: string;
    };
    sign(path: any, api?: string, method?: string, params?: {}, headers?: undefined, body?: undefined): {
        url: string;
        method: string;
        body: undefined;
        headers: undefined;
    };
    nonce(): number;
    handleErrors(code: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): undefined;
}
