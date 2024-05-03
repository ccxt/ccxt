import Exchange from './abstract/coinbase.js';
import type { Int, OrderSide, OrderType, Order, Trade, OHLCV, Ticker, OrderBook, Str, Transaction, Balances, Tickers, Strings, Market, Currency, Num, Account, Currencies, MarketInterface, Conversion } from './base/types.js';
/**
 * @class coinbase
 * @augments Exchange
 */
export default class coinbase extends Exchange {
    describe(): any;
    fetchTime(params?: {}): Promise<number>;
    fetchAccounts(params?: {}): Promise<Account[]>;
    fetchAccountsV2(params?: {}): Promise<Account[]>;
    fetchAccountsV3(params?: {}): Promise<Account[]>;
    fetchPortfolios(params?: {}): Promise<Account[]>;
    parseAccount(account: any): {
        id: string;
        type: string;
        code: string;
        info: any;
    };
    createDepositAddress(code: string, params?: {}): Promise<{
        currency: string;
        tag: string;
        address: string;
        info: any;
    }>;
    fetchMySells(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchMyBuys(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchTransactionsWithMethod(method: any, code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    parseTransactionStatus(status: any): string;
    parseTransaction(transaction: any, currency?: Currency): Transaction;
    parseTrade(trade: any, market?: Market): Trade;
    fetchMarkets(params?: {}): Promise<Market[]>;
    fetchMarketsV2(params?: {}): Promise<any[]>;
    fetchMarketsV3(params?: {}): Promise<any[]>;
    parseSpotMarket(market: any, feeTier: any): MarketInterface;
    parseContractMarket(market: any, feeTier: any): MarketInterface;
    fetchCurrenciesFromCache(params?: {}): Promise<import("./base/types.js").Dictionary<any>>;
    fetchCurrencies(params?: {}): Promise<Currencies>;
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    fetchTickersV2(symbols?: Strings, params?: {}): Promise<import("./base/types.js").Dictionary<Ticker>>;
    fetchTickersV3(symbols?: Strings, params?: {}): Promise<import("./base/types.js").Dictionary<Ticker>>;
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    fetchTickerV2(symbol: string, params?: {}): Promise<Ticker>;
    fetchTickerV3(symbol: string, params?: {}): Promise<Ticker>;
    parseTicker(ticker: any, market?: Market): Ticker;
    parseCustomBalance(response: any, params?: {}): Balances;
    fetchBalance(params?: {}): Promise<Balances>;
    fetchLedger(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    parseLedgerEntryStatus(status: any): string;
    parseLedgerEntryType(type: any): string;
    parseLedgerEntry(item: any, currency?: Currency): {
        info: any;
        id: string;
        timestamp: number;
        datetime: string;
        direction: any;
        account: any;
        referenceId: any;
        referenceAccount: any;
        type: string;
        currency: string;
        amount: number;
        before: any;
        after: any;
        status: string;
        fee: any;
    };
    findAccountId(code: any, params?: {}): Promise<any>;
    prepareAccountRequest(limit?: Int, params?: {}): {
        account_id: string;
    };
    prepareAccountRequestWithCurrencyCode(code?: Str, limit?: Int, params?: {}): Promise<{}[]>;
    createMarketBuyOrderWithCost(symbol: string, cost: number, params?: {}): Promise<Order>;
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    parseOrder(order: any, market?: Market): Order;
    parseOrderStatus(status: any): string;
    parseOrderType(type: any): string;
    parseTimeInForce(timeInForce: any): string;
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<import("./base/types.js").Dictionary<any>>;
    cancelOrders(ids: any, symbol?: Str, params?: {}): Promise<Order[]>;
    editOrder(id: string, symbol: string, type: OrderType, side: OrderSide, amount?: Num, price?: Num, params?: {}): Promise<Order>;
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    fetchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOrdersByStatus(status: any, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchCanceledOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    fetchBidsAsks(symbols?: Strings, params?: {}): Promise<import("./base/types.js").Dictionary<Ticker>>;
    withdraw(code: string, amount: number, address: string, tag?: any, params?: {}): Promise<Transaction>;
    fetchDepositAddressesByNetwork(code: string, params?: {}): Promise<import("./base/types.js").Dictionary<any>>;
    parseDepositAddress(depositAddress: any, currency?: Currency): {
        info: any;
        currency: string;
        address: string;
        tag: string;
        network: string;
    };
    deposit(code: string, amount: number, id: string, params?: {}): Promise<Transaction>;
    fetchDeposit(id: string, code?: Str, params?: {}): Promise<Transaction>;
    fetchConvertQuote(fromCode: string, toCode: string, amount?: Num, params?: {}): Promise<Conversion>;
    createConvertTrade(id: string, fromCode: string, toCode: string, amount?: Num, params?: {}): Promise<Conversion>;
    fetchConvertTrade(id: string, code?: Str, params?: {}): Promise<Conversion>;
    parseConversion(conversion: any, fromCurrency?: Currency, toCurrency?: Currency): Conversion;
    closePosition(symbol: string, side?: OrderSide, params?: {}): Promise<Order>;
    fetchPositions(symbols?: Strings, params?: {}): Promise<import("./base/types.js").Position[]>;
    fetchPosition(symbol: string, params?: {}): Promise<import("./base/types.js").Position>;
    parsePosition(position: any, market?: Market): import("./base/types.js").Position;
    createAuthToken(seconds: Int, method?: Str, url?: Str): string;
    sign(path: any, api?: any[], method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(code: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): any;
}
