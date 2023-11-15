export type Int = number | undefined;

export type Str = string | undefined;

export type Bool = boolean | undefined;

export interface Dictionary<T> {
    [key: string]: T;
}
/** Request parameters */
// type Params = Dictionary<string | number | boolean | string[]>;

export interface MinMax {
    min: number | undefined;
    max: number | undefined;
}

export interface Fee {
    type?: 'taker' | 'maker' | string;
    currency: string;
    rate?: number;
    cost: number;
}

export interface Market {
    id: string;
    uppercaseId?: string;
    lowercaseId?: string;
    symbol: Str;
    base: Str;
    quote: Str;
    baseId: Str;
    quoteId: Str;
    active: Bool;
    type: Str;
    spot: boolean;
    margin: boolean;
    swap: boolean;
    future: boolean;
    option: boolean;
    contract: boolean;
    settle: Str;
    settleId: Str;
    contractSize: Int;
    linear: Bool;
    inverse: Bool;
    quanto?: boolean;
    expiry: Int;
    expiryDatetime: Str;
    strike: Int;
    optionType: Str;
    taker?: number | undefined;
    maker?: number | undefined;
    percentage?: boolean | undefined;
    tierBased?: boolean | undefined;
    feeSide?: string | undefined;
    precision: {
        amount: number | undefined,
        price: number | undefined
    };
    limits: {
        amount?: MinMax,
        cost?: MinMax,
        leverage?: MinMax,
        price?: MinMax,
    };
    created: Int;
    info: any;
}

export interface Trade {
    info: any;                        // the original decoded JSON as is
    amount: Int;                  // amount of base currency
    datetime: Str;                // ISO8601 datetime with milliseconds;
    id: Str;                      // string trade id
    order: Str;                  // string order id or undefined/None/null
    price: number;                   // float price in quote currency
    timestamp: Int;               // Unix timestamp in milliseconds
    type: Str;                   // order type, 'market', 'limit', ... or undefined/None/null
    side: 'buy' | 'sell' | string;            // direction of the trade, 'buy' or 'sell'
    symbol: Str;                  // symbol in CCXT format
    takerOrMaker: 'taker' | 'maker' | string; // string, 'taker' or 'maker'
    cost: Int;                    // total cost (including fees), `price * amount`
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
    asks: [number, number][];
    bids: [number, number][];
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
    amount: Int;
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

export interface Currency {
    id: string;
    code: string;
    numericId?: number;
    precision: number;
}

export interface Balance {
    free: number | string;
    used: number | string;
    total: number | string;
}

export interface PartialBalances extends Dictionary<number> {
}

export interface Balances extends Dictionary<Balance> {
    info: any;
    timestamp?: any; // we need to fix this later
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

export interface FundingRate {
    symbol: string;
    info: any;
    timestamp?: number;
    fundingRate?: number;
    datetime?: string;
    markPrice?: number;
    indexPrice?: number;
    interestRate?: number;
    estimatedSettlePrice?: number;
    fundingTimestamp?: number;
    fundingDatetime?: string;
    nextFundingTimestamp?: number;
    nextFundingDatetime?: string;
    nextFundingRate?: number;
    previousFundingTimestamp?: number;
    previousFundingDatetime?: string;
    previousFundingRate?: number;
}

export interface Position {
    symbol: string;
    id?: string;
    info: any;
    timestamp?: number;
    datetime?: string;
    contracts?: number;
    contractSize?: number;
    side: string;
    notional?: number;
    leverage?: number;
    unrealizedPnl?: number;
    collateral?: number;
    entryPrice?: number;
    markPrice?: number;
    liquidationPrice?: number;
    marginMode?: string;
    hedged?: boolean;
    maintenenceMargin?: number;
    maintenanceMarginPercentage?: number;
    initialMargin?: number;
    initialMarginPercentage?: number;
    marginRatio?: number;
    lastUpdateTimestamp?: number;
    lastPrice?: number;
    stopLossPrice?: number;
    takeProfitPrice?: number;
    percentage?: number;
}

export interface BorrowInterest {
    account?: string;
    currency?: string;
    interest?: number;
    interestRate?: number;
    amountBorrowed?: number;
    marginMode?: string;
    timestamp?: number;
    datetime?: string;
    info: any;
}

export interface LeverageTier {
    tier?: number;
    currency?: string;
    minNotional?: number;
    maxNotional?: number;
    maintenanceMarginRate?: number;
    maxLeverage?: number;
    info: any;
}

export interface LedgerEntry {
    id?: string;
    info: any;
    timestamp?: number;
    datetime?: string;
    direction?: string;
    account?: string;
    referenceId?: string;
    referenceAccount?: string;
    type?: string;
    currency?: string;
    amount?: number;
    before?: number;
    after?: number;
    status?: string;
    fee?: Fee;
}

export interface DepositWithdrawFeeNetwork {
    fee?: number;
    percentage?: boolean;
}

export interface DepositWithdrawFee {
    info: any;
    withdraw?: DepositWithdrawFeeNetwork,
    deposit?: DepositWithdrawFeeNetwork,
    networks?: Dictionary<DepositWithdrawFeeNetwork>;
}

export interface TransferEntry {
    info?: any;
    id?: string;
    timestamp?: number;
    datetime?: string;
    currency?: string;
    amount?: number;
    fromAccount?: string;
    toAccount?: string;
    status?: string;
}

export interface BorrowRate {
    currency?: string;
    rate?: number;
    period?: number;
    timestamp?: number;
    datetime?: string;
    info: any;
}

export interface FundingRateHistory {
    info: any;
    symbol: string;
    fundingRate: number;
    timestamp?: number
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
    timestamp?: number
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
    timestamp?: number
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
    timestamp?: number
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
export type OHLCV = [Int, Int, Int, Int, Int, Int];

/** [ timestamp, open, high, low, close, volume, count ] */
export type OHLCVC = [Int, Int, Int, Int, Int, Int, Int];

export type implicitReturnType = any;

// must be an integer in other langs
export type IndexType = number | string;

export type OrderSide = 'buy' | 'sell' | string;

export type OrderType = 'limit' | 'market' | string;
