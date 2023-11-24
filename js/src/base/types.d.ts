export declare type Int = number | undefined;
export declare type Str = string | undefined;
export declare type Strings = string[] | undefined;
export declare type Num = number | undefined;
export declare type Bool = boolean | undefined;
export declare type IndexType = number | string;
export declare type OrderSide = 'buy' | 'sell' | string;
export declare type OrderType = 'limit' | 'market' | string;
export declare type MarketType = 'spot' | 'margin' | 'swap' | 'future' | 'option';
export interface Dictionary<T> {
    [key: string]: T;
}
/** Request parameters */
export interface MinMax {
    min: Num;
    max: Num;
}
export interface FeeInterface {
    currency: Str;
    cost: Num;
    rate?: Num;
}
export declare type Fee = FeeInterface | undefined;
export interface MarketInterface {
    id: string;
    uppercaseId?: string;
    lowercaseId?: string;
    symbol: string;
    base: string;
    quote: string;
    baseId: string;
    quoteId: string;
    active: Bool;
    type: MarketType;
    spot: boolean;
    margin: boolean;
    swap: boolean;
    future: boolean;
    option: boolean;
    contract: boolean;
    settle: Str;
    settleId: Str;
    contractSize: Num;
    linear: Bool;
    inverse: Bool;
    quanto?: boolean;
    expiry: Int;
    expiryDatetime: Str;
    strike: Num;
    optionType: Str;
    taker?: Num;
    maker?: Num;
    percentage?: boolean | undefined;
    tierBased?: boolean | undefined;
    feeSide?: string | undefined;
    precision: {
        amount: Num;
        price: Num;
    };
    limits: {
        amount?: MinMax;
        cost?: MinMax;
        leverage?: MinMax;
        price?: MinMax;
    };
    created: Int;
    info: any;
}
export interface Trade {
    info: any;
    amount: Num;
    datetime: Str;
    id: Str;
    order: Str;
    price: number;
    timestamp: Int;
    type: Str;
    side: 'buy' | 'sell' | string;
    symbol: Str;
    takerOrMaker: 'taker' | 'maker' | string;
    cost: Num;
    fee: Fee;
}
export interface Order {
    id: string;
    clientOrderId: string;
    datetime: string;
    timestamp: number;
    lastTradeTimestamp: number;
    lastUpdateTimestamp?: number;
    status: 'open' | 'closed' | 'canceled' | string;
    symbol: string;
    type: string;
    timeInForce?: string;
    side: 'buy' | 'sell' | string;
    price: number;
    average?: number;
    amount: number;
    filled: number;
    remaining: number;
    stopPrice?: number;
    takeProfitPrice?: number;
    stopLossPrice?: number;
    cost: number;
    trades: Trade[];
    fee: Fee;
    info: any;
}
export interface OrderBook {
    asks: [Num, Num][];
    bids: [Num, Num][];
    datetime: Str;
    timestamp: Int;
    nonce: Int;
}
export interface Ticker {
    symbol: string;
    info: any;
    timestamp: Int;
    datetime: Str;
    high: Int;
    low: Int;
    bid: Int;
    bidVolume: Int;
    ask: Int;
    askVolume: Int;
    vwap: Int;
    open: Int;
    close: Int;
    last: Int;
    previousClose: Int;
    change: Int;
    percentage: Int;
    average: Int;
    quoteVolume: Int;
    baseVolume: Int;
}
export interface Transaction {
    info: any;
    id: Str;
    txid: Str;
    timestamp: Int;
    datetime: Str;
    address: Str;
    addressFrom: Str;
    addressTo: Str;
    tag: Str;
    tagFrom: Str;
    tagTo: Str;
    type: 'deposit' | 'withdrawal' | string;
    amount: Num;
    currency: Str;
    status: 'pending' | 'ok' | string;
    updated: Int;
    fee: Fee;
    network: Str;
    comment: Str;
    internal: Bool;
}
export interface Tickers extends Dictionary<Ticker> {
}
export interface CurrencyInterface {
    id: string;
    code: string;
    numericId?: number;
    precision: number;
}
export interface Balance {
    free: Num;
    used: Num;
    total: Num;
    debt?: Num;
}
export interface Account {
    free: Str;
    used: Str;
    total: Str;
}
export interface PartialBalances extends Dictionary<number> {
}
export interface Balances extends Dictionary<Balance> {
    info: any;
    timestamp?: any;
    datetime?: any;
}
export interface DepositAddress {
    currency: string;
    address: string;
    status: string;
    info: any;
}
export interface WithdrawalResponse {
    info: any;
    id: string;
}
export interface DepositAddressResponse {
    currency: string;
    address: string;
    info: any;
    tag?: string;
}
export interface Position {
    symbol: string;
    id: string;
    timestamp?: number;
    datetime: string;
    contracts?: number;
    contractSize?: number;
    side: string;
    notional?: number;
    leverage?: number;
    unrealizedPnl?: number;
    realizedPnl?: number;
    collateral?: number;
    entryPrice?: number;
    markPrice?: number;
    liquidationPrice?: number;
    hedged?: boolean;
    maintenanceMargin?: number;
    maintenanceMarginPercentage?: number;
    initialMargin?: number;
    initialMarginPercentage?: number;
    marginMode: string;
    marginRatio?: number;
    lastUpdateTimestamp?: number;
    lastPrice?: number;
    percentage?: number;
    stopLossPrice?: number;
    takeProfitPrice?: number;
    info: any;
}
export interface FundingRateHistory {
    info: any;
    symbol: string;
    fundingRate: number;
    timestamp?: number;
    datetime?: string;
}
export interface OpenInterest {
    symbol: string;
    openInterestAmount?: number;
    openInterestValue?: number;
    baseVolume?: number;
    quoteVolume?: number;
    timestamp?: number;
    datetime?: string;
    info: any;
}
export interface Liquidation {
    info: any;
    symbol: string;
    timestamp?: number;
    datetime?: string;
    price: number;
    baseValue?: number;
    quoteValue?: number;
}
export interface OrderRequest {
    symbol: string;
    type: string;
    side: string;
    amount?: number;
    price?: number | undefined;
    params?: any;
}
export interface FundingHistory {
    info: any;
    symbol: string;
    code: string;
    timestamp?: number;
    datetime?: string;
    id: string;
    amount: number;
}
export interface MarginMode {
    infp: any;
    symbol: string;
    marginMode: 'isolated' | 'cross' | string;
}
export interface Greeks {
    symbol: string;
    timestamp?: number;
    datetime?: string;
    delta: number;
    gamma: number;
    theta: number;
    vega: number;
    rho: number;
    bidSize: number;
    askSize: number;
    bidImpliedVolatility: number;
    askImpliedVolatility: number;
    markImpliedVolatility: number;
    bidPrice: number;
    askPrice: number;
    markPrice: number;
    lastPrice: number;
    underlyingPrice: number;
    info: any;
}
/** [ timestamp, open, high, low, close, volume ] */
export declare type OHLCV = [Num, Num, Num, Num, Num, Num];
/** [ timestamp, open, high, low, close, volume, count ] */
export declare type OHLCVC = [Num, Num, Num, Num, Num, Num, Num];
export declare type implicitReturnType = any;
export declare type Market = MarketInterface | undefined;
export declare type Currency = CurrencyInterface | undefined;
