import { ExchangeDescription } from "./ExchangeDescription";

declare abstract class ExchangeBase extends ExchangeDescription {

    constructor(config?: {[key in keyof ExchangeBase]?: ExchangeBase[key]});

    // set by loadMarkets
    markets: Dictionary<Market>;
    marketsById: Dictionary<Market>;
    markets_by_id: Dictionary<Market>;
    currencies: Dictionary<Currency>;
    currencies_by_id: Dictionary<Currency>;
    ids: string[];
    symbols: TickerSymbol[];

    // capabilities
    hasCancelAllOrders: boolean;
    hasCancelOrder: boolean;
    hasCancelOrders: boolean;
    hasCORS: boolean;
    hasCreateDepositAddress: boolean;
    hasCreateLimitOrder: boolean;
    hasCreateMarketOrder: boolean;
    hasCreateOrder: boolean;
    hasDeposit: boolean;
    hasEditOrder: boolean;
    hasFetchBalance: boolean;
    hasFetchBidsAsks: boolean;
    hasFetchClosedOrders: boolean;
    hasFetchCurrencies: boolean;
    hasFetchDepositAddress: boolean;
    hasFetchDeposits: boolean;
    hasFetchFundingFees: boolean;
    hasFetchL2OrderBook: boolean;
    hasFetchLedger: boolean;
    hasFetchMarkets: boolean;
    hasFetchMyTrades: boolean;
    hasFetchOHLCV: boolean;
    hasFetchOpenOrders: boolean;
    hasFetchOrder: boolean;
    hasFetchOrderBook: boolean;
    hasFetchOrderBooks: boolean;
    hasFetchOrders: boolean;
    hasFetchStatus: boolean;
    hasFetchTicker: boolean;
    hasFetchTickers: boolean;
    hasFetchTime: boolean;
    hasFetchTrades: boolean;
    hasFetchTradingFee: boolean;
    hasFetchTradingFees: boolean;
    hasFetchTradingLimits: boolean;
    hasFetchTransactions: boolean;
    hasFetchWithdrawals: boolean;
    hasPrivateAPI: boolean;
    hasPublicAPI: boolean;
    hasWithdraw: boolean;

    // methods
    account (): Balance;
    cancelAllOrders (...args: any): Promise<any>; // TODO: add function signatures
    cancelOrder (id: string, symbol?: TickerSymbol, params?: Params): Promise<Order>;
    cancelOrders (...args: any): Promise<any>; // TODO: add function signatures
    checkRequiredCredentials (): void;
    commonCurrencyCode (currency: string): string;
    createDepositAddress (currency: string, params?: Params): Promise<DepositAddressResponse>;
    createLimitOrder (symbol: TickerSymbol, side: Order['side'], amount: number, price?: number, params?: Params): Promise<Order>;
    createMarketOrder (symbol: TickerSymbol, side: Order['side'], amount: number, price?: number, params?: Params): Promise<Order>;
    createOrder (symbol: TickerSymbol, type: Order['type'], side: Order['side'], amount: number, price?: number, params?: Params): Promise<Order>;
    decode (str: string): string;
    defaults (): any;
    defineRestApi (api: any, methodName: any, options?: Dictionary<any>): void;
    deposit (...args: any): Promise<any>; // TODO: add function signatures
    describe (): Partial<ExchangeDescription>;
    editOrder (id: string, symbol: TickerSymbol, type: Order['type'], side: Order['side'], amount: number, price?: number, params?: Params): Promise<Order>;
    encode (str: string): string;
    encodeURIComponent (...args: any[]): string;
    extractParams (str: string): string[];
    fetch (url: string, method?: string, headers?: any, body?: any): Promise<any>;
    fetch2 (path: any, api?: string, method?: string, params?: Params, headers?: any, body?: any): Promise<any>;
    fetchBalance (params?: Params): Promise<Balances>;
    fetchBidsAsks (symbols?: TickerSymbol[], params?: Params): Promise<any>;
    fetchClosedOrders (symbol?: TickerSymbol, since?: number, limit?: number, params?: Params): Promise<Order[]>;
    fetchCurrencies (params?: Params): Promise<Dictionary<Currency>>;
    fetchDepositAddress (currency: string, params?: Params): Promise<DepositAddressResponse>;
    fetchDeposits (currency?: string, since?: number, limit?: number, params?: Params): Promise<Transaction[]>;
    fetchFreeBalance (params?: Params): Promise<PartialBalances>;
    fetchFundingFees (...args: any): Promise<any>; // TODO: add function signatures
    fetchL2OrderBook (...args: any): Promise<any>; // TODO: add function signatures
    fetchLedger (...args: any): Promise<any>; // TODO: add function signatures
    fetchMarkets (): Promise<Market[]>;
    fetchMyTrades (symbol?: TickerSymbol, since?: number, limit?: number, params?: Params): Promise<Trade[]>;
    fetchOHLCV (symbol: TickerSymbol, timeframe?: string, since?: number, limit?: number, params?: Params): Promise<OHLCV[]>;
    fetchOpenOrders (symbol?: TickerSymbol, since?: number, limit?: number, params?: Params): Promise<Order[]>;
    fetchOrder (id: string, symbol: TickerSymbol, params?: Params): Promise<Order>;
    fetchOrderBook (symbol: TickerSymbol, limit?: number, params?: Params): Promise<OrderBook>;
    fetchOrderBooks (...args: any): Promise<any>; // TODO: add function signatures
    fetchOrders (symbol?: TickerSymbol, since?: number, limit?: number, params?: Params): Promise<Order[]>;
    fetchOrderStatus (id: string, market: string): Promise<string>;
    fetchStatus (...args: any): Promise<any>; // TODO: add function signatures
    fetchTicker (symbol: TickerSymbol, params?: Params): Promise<Ticker>;
    fetchTickers (symbols?: TickerSymbol[], params?: Params): Promise<Dictionary<Ticker>>;
    fetchTime (params?: Params): Promise<number>;
    fetchTotalBalance (params?: Params): Promise<PartialBalances>;
    fetchTrades (symbol: TickerSymbol, since?: number, limit?: number, params?: Params): Promise<Trade[]>;
    fetchTradingFee (...args: any): Promise<any>; // TODO: add function signatures
    fetchTradingFees (...args: any): Promise<any>; // TODO: add function signatures
    fetchTradingLimits (...args: any): Promise<any>; // TODO: add function signatures
    fetchTransactions (currency?: string, since?: number, limit?: number, params?: Params): Promise<Transaction[]>;
    fetchUsedBalance (params?: Params): Promise<PartialBalances>;
    fetchWithdrawals (currency?: string, since?: number, limit?: number, params?: Params): Promise<Transaction[]>;
    getMarket (symbol: TickerSymbol): Market;
    handleResponse (url: string, method: string, headers?: any, body?: any): any;
    initRestRateLimiter (): void;
    iso8601 (timestamp: number | string): string;
    loadMarkets (reload?: boolean): Promise<Dictionary<Market>>;
    market (symbol: TickerSymbol): Market;
    marketId (symbol: TickerSymbol): string;
    marketIds (symbols: TickerSymbol[]): string[];
    microseconds (): number;
    nonce (): number;
    purgeCachedOrders (timestamp: number): void;
    request (path: string, api?: string, method?: string, params?: Params, headers?: any, body?: any): Promise<any>;
    seconds (): number;
    setMarkets (markets: Collection<Market>, currencies?: Dictionary<Currency>): Dictionary<Market>;
    symbol (symbol: TickerSymbol): TickerSymbol;
    withdraw (currency: string, amount: number, address: string, tag?: string, params?: Params): Promise<WithdrawalResponse>;
    YmdHMS (timestamp: string, infix: string) : string;
}

// Marker interface for symbol strings in CCXT format (ASSET/QUOTE)
// Can substitute it with nominal types when the feature is available:
// https://github.com/Microsoft/TypeScript/issues/202
interface TickerSymbol extends String {}

interface Market {
    id: string;
    symbol: TickerSymbol;
    base: string;
    quote: string;
    baseId: string,
    quoteId: string,
    active: boolean;
    precision: { base: number, quote: number, amount: number, price: number };
    limits: { amount: MinMax, price: MinMax, cost?: MinMax };
    tierBased: boolean,
    percentage: boolean,
    taker: number,
    maker: number,
    info: any,
}

interface Order {
    id: string;
    datetime: string;
    timestamp: number;
    lastTradeTimestamp: number;
    status: 'open' | 'closed' | 'canceled';
    symbol: TickerSymbol;
    type: 'market' | 'limit';
    side: 'buy' | 'sell';
    price: number;
    average?: number;
    amount: number;
    filled: number;
    remaining: number;
    cost: number;
    trades: Trade[];
    fee: Fee;
    info: any;
}

interface OrderBook {
    asks: [string, string][];
    bids: [string, string][];
    datetime: string;
    timestamp: number;
    nonce: number;
}

interface Trade {
    amount: number;                  // amount of base currency
    datetime: string;                // ISO8601 datetime with milliseconds;
    id: string;                      // string trade id
    info: any;                        // the original decoded JSON as is
    order?: string;                  // string order id or undefined/None/null
    price: number;                   // float price in quote currency
    timestamp: number;               // Unix timestamp in milliseconds
    type?: 'market' | 'limit';       // order type, 'market', 'limit' or undefined/None/null
    side: 'buy' | 'sell';            // direction of the trade, 'buy' or 'sell'
    symbol: TickerSymbol;                  // symbol in CCXT format
    takerOrMaker: 'taker' | 'maker'; // string, 'taker' or 'maker'
    cost: number;                    // total cost (including fees), `price * amount`
    fee: Fee;
}

interface Ticker {
    symbol: TickerSymbol;
    info: any;
    timestamp: number;
    datetime: string;
    high: number;
    low: number;
    bid: number;
    bidVolume?: number;
    ask: number;
    askVolume?: number;
    vwap?: number;
    open?: number;
    close?: number;
    last?: number;
    previousClose?: number;
    change?: number;
    percentage?: number;
    average?: number;
    quoteVolume?: number;
    baseVolume?: number;
}

interface Transaction {
    info: any;
    id: string;
    txid?: string;
    timestamp: number;
    datetime: string;
    address: string;
    type: "deposit" | "withdrawal";
    amount: number;
    currency: string;
    status: "pending" | "ok";
    updated: number;
    fee: Fee;
}

interface Tickers extends Dictionary<Ticker> {
    info: any;
}

interface Currency {
    id: string;
    code: string;
    numericId?: number;
    precision: number;
}

interface Balance {
    free: number;
    used: number;
    total: number;
}

interface PartialBalances extends Dictionary<number> {
}

interface Balances extends Dictionary<Balance> {
    info: any;
}

interface DepositAddress {
    currency: string;
    address: string;
    status: string;
    info: any;
}

interface Fee {
    type: 'taker' | 'maker';
    currency: string;
    rate: number;
    cost: number;
}

interface WithdrawalResponse {
    info: any;
    id: string;
}

interface DepositAddressResponse {
    currency: string;
    address: string;
    info: any;
    tag?: string;
}

type MinMax = {
    min: number;
    max: number | undefined;
}

/** Request parameters */
type Params = Dictionary<string | number>;

/** [ timestamp, open, high, low, close, volume ] */
type OHLCV = [number, number, number, number, number, number];

/** [ timestamp, open, high, low, close, volume, count ] */
type OHLCVC = [number, number, number, number, number, number, number];

interface TradingViewOHLCV {
    't': number[];
    'o': number[];
    'h': number[];
    'l': number[];
    'c': number[];
    'v': number[];
}
