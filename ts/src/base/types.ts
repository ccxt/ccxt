export type Bool = boolean | undefined;
export type Currency = CurrencyInterface | undefined;
export type Int = number | undefined;
export type Market = MarketInterface | undefined;
export type Num = number | undefined;
export type Str = string | undefined;
export type Strings = string[] | undefined;

export interface Dictionary<T> {
    [key: string]: T;
}
/** Request parameters */
// type Params = Dictionary<string | number | boolean | string[]>;

export interface MinMax {
    max: Num;
    min: Num;
}

export interface Fee {
    cost: number;
    currency: string;
    rate?: number;
    type?: 'taker' | 'maker' | string;
}

export interface MarketInterface {
    active: Bool;
    base: string;
    baseId: string;
    contract: boolean;
    contractSize: Num;
    created: Int;
    expiry: Int;
    expiryDatetime: Str;
    feeSide?: string | undefined;
    future: boolean;
    id: string;
    info: any;
    inverse: Bool;
    limits: {
        amount?: MinMax,
        cost?: MinMax,
        leverage?: MinMax,
        price?: MinMax,
    };
    linear: Bool;
    lowercaseId?: string;
    maker?: Num
    margin: boolean;
    option: boolean;
    optionType: Str;
    percentage?: boolean | undefined;
    quanto?: boolean;
    quoteId: string;
    precision: {
        amount: Num
        price: Num
    };
    settle: Str;
    settleId: Str;
    spot: boolean;
    strike: Num;
    swap: boolean;
    symbol: string;
    taker?: Num
    tierBased?: boolean | undefined;
    type: string;
    uppercaseId?: string;
}

export interface Trade {
    amount: Num;                  // amount of base currency
    cost: Num;                    // total cost (including fees), `price * amount`
    datetime: Str;                // ISO8601 datetime with milliseconds;
    fee: Fee;
    id: Str;                      // string trade id
    info: any;                        // the original decoded JSON as is
    order: Str;                  // string order id or undefined/None/null
    price: number;                   // float price in quote currency
    side: 'buy' | 'sell' | string;            // direction of the trade, 'buy' or 'sell'
    symbol: Str;                  // symbol in CCXT format
    takerOrMaker: 'taker' | 'maker' | string; // string, 'taker' or 'maker'
    timestamp: Int;               // Unix timestamp in milliseconds
    type: Str;                   // order type, 'market', 'limit', ... or undefined/None/null
}

export interface Order {
    amount: number;
    average?: number;
    clientOrderId: string;
    cost: number;
    datetime: string;
    fee: Fee;
    filled: number;
    id: string;
    info: any;
    lastTradeTimestamp?: number;
    lastUpdateTimestamp?: number;
    price: number;
    remaining: number;
    side: 'buy' | 'sell' | string;
    status: 'open' | 'closed' | 'canceled' | string;
    stopLossPrice?: number;
    stopPrice?: number;
    symbol: string;
    takeProfitPrice?: number;
    timeInForce?: string;
    timestamp: number;
    trades: Trade[];
    type: string;
}

export interface OrderBook {
    asks: [Num, Num][];
    bids: [Num, Num][];
    datetime: Str;
    timestamp: Int;
    nonce: Int;
}

export interface Ticker {
    ask: Int;
    askVolume: Int;
    average: Int;
    baseVolume: Int;
    bid: Int;
    bidVolume: Int;
    change: Int;
    close: Int;
    datetime: Str;
    high: Int;
    info: any;
    last: Int;
    low: Int;
    open: Int;
    percentage: Int;
    previousClose: Int;
    quoteVolume: Int;
    symbol: string;
    timestamp: Int;
    vwap: Int;
}

export interface Transaction {
    address: Str;
    addressFrom: Str;
    addressTo: Str;
    amount: Num;
    comment: Str;
    currency: Str;
    datetime: Str;
    fee: Fee;
    id: Str;
    info: any;
    internal: Bool;
    network: Str;
    status: 'pending' | 'ok' | string;
    tag: Str;
    tagFrom: Str;
    tagTo: Str;
    timestamp: Int;
    txid: Str;
    type: 'deposit' | 'withdrawal' | string;
    updated: Int;
}

export interface Tickers extends Dictionary<Ticker> {
}

export interface CurrencyInterface {
    id: string;
    numericId?: number;
    precision: number;
}

export interface Balance {
    free: number | string;
    total: number | string;
    used: number | string;
}

export interface PartialBalances extends Dictionary<number> {
}

export interface Balances extends Dictionary<Balance> {
    datetime?: any;
    info: any;
    timestamp?: any; // we need to fix this later
}

export interface DepositAddress {
    address: string;
    currency: string;
    info: any;
    status: string;
}

export interface WithdrawalResponse {
    id: string;
    info: any;
}

export interface DepositAddressResponse {
    address: string;
    currency: string;
    info: any;
    tag?: string;
}

export interface Position {
    collateral?: number;
    contracts?: number;
    contractSize?: number;
    datetime: string;
    entryPrice?: number;
    hedged?: boolean;
    id: string;
    info: any;
    initialMargin?: number;
    initialMarginPercentage?: number;
    lastPrice?: number;
    lastUpdateTimestamp?: number;
    leverage?: number;
    liquidationPrice?: number;
    maintenanceMargin?: number;
    maintenanceMarginPercentage?: number;
    marginMode: string;
    marginRatio?: number;
    markPrice?: number;
    notional?: number;
    percentage?: number;
    realizedPnl?: number;
    side: string;
    stopLossPrice?: number;
    symbol: string;
    takeProfitPrice?: number;
    timestamp?: number;
    unrealizedPnl?: number;
}

export interface FundingRateHistory {
    datetime?: string;
    fundingRate: number;
    info: any;
    symbol: string;
    timestamp?: number
}

export interface OpenInterest {
    baseVolume?: number;
    datetime?: string;
    info: any;
    openInterestAmount?: number;
    openInterestValue?: number;
    quoteVolume?: number;
    symbol: string;
    timestamp?: number;
}

export interface Liquidation {
    baseValue?: number;
    datetime?: string;
    info: any;
    price: number;
    quoteValue?: number;
    symbol: string;
    timestamp?: number
}

export interface OrderRequest {
    amount?: number;
    params?: any;
    price?: number | undefined;
    side: string;
    symbol: string;
    type: string;
}

export interface FundingHistory {
    amount: number;
    code: string;
    datetime?: string;
    id: string;
    info: any;
    symbol: string;
    timestamp?: number
}

export interface MarginMode {
    infp: any;
    marginMode: 'isolated' | 'cross' | string;
    symbol: string;
}

export interface Greeks {
    askImpliedVolatility: number;
    askPrice: number;
    askSize: number;
    bidImpliedVolatility: number;
    bidPrice: number;
    bidSize: number;
    datetime?: string;
    delta: number;
    gamma: number;
    info: any;
    lastPrice: number;
    markImpliedVolatility: number;
    markPrice: number;
    rho: number;
    symbol: string;
    theta: number;
    timestamp?: number
    underlyingPrice: number;
    vega: number;
}

/** [ timestamp, open, high, low, close, volume ] */
export type OHLCV = [Num, Num, Num, Num, Num, Num];

/** [ timestamp, open, high, low, close, volume, count ] */
export type OHLCVC = [Num, Num, Num, Num, Num, Num, Num];

export type implicitReturnType = any;

// must be an integer in other langs
export type IndexType = number | string;


export type OrderSide = 'buy' | 'sell' | string;

export type OrderType = 'limit' | 'market' | string;
