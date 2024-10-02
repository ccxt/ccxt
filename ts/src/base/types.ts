export type Int = number | undefined;
export type int = number;
export type Str = string | undefined;
export type Strings = string[] | undefined;
export type Num = number | undefined;
export type Bool = boolean | undefined;
// must be an integer in other langs
export type IndexType = number | string;
export type OrderSide = 'buy' | 'sell' | string;
export type OrderType = 'limit' | 'market' | string;
export type MarketType = 'spot' | 'margin' | 'swap' | 'future' | 'option' | 'delivery' | 'index';
export type SubType = 'linear' | 'inverse' | undefined;

export interface Dictionary<T> {
    [key: string]: T;
}

export type Dict = Dictionary<any>;
export type NullableDict = Dict | undefined;

export type List = Array<any>;
export type NullableList = List | undefined;

/** Request parameters */
// type Params = Dictionary<string | number | boolean | string[]>;

export interface MinMax {
    min: Num;
    max: Num;
}

export interface FeeInterface {
    currency: Str;
    cost: Num;
    rate?: Num;
}

export interface TradingFeeInterface {
    info: any;
    symbol: Str;
    maker: Num;
    taker: Num;
    percentage: Bool;
    tierBased: Bool;
}

export type Fee = FeeInterface | undefined

export interface MarketMarginModes {
    isolated: boolean;
    cross: boolean;
}

export interface MarketInterface {
    id: Str;
    numericId?: Num;
    uppercaseId?: Str;
    lowercaseId?: Str;
    symbol: string;
    base: Str;
    quote: Str;
    baseId: Str;
    quoteId: Str;
    active: Bool;
    type: MarketType;
    subType?: SubType;
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
    taker?: Num
    maker?: Num
    percentage?: Bool;
    tierBased?: Bool;
    feeSide?: Str;
    precision: {
        amount: Num
        price: Num
        cost?: Num
    };
    marginModes?: MarketMarginModes;
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
    amount: Num;                  // amount of base currency
    datetime: Str;                // ISO8601 datetime with milliseconds;
    id: Str;                      // string trade id
    order: Str;                  // string order id or undefined/None/null
    price: number;                   // float price in quote currency
    timestamp: Int;               // Unix timestamp in milliseconds
    type: Str;                   // order type, 'market', 'limit', ... or undefined/None/null
    side: 'buy' | 'sell' | Str;            // direction of the trade, 'buy' or 'sell'
    symbol: Str;                  // symbol in CCXT format
    takerOrMaker: 'taker' | 'maker' | Str; // string, 'taker' or 'maker'
    cost: Num;                    // total cost (including fees), `price * amount`
    fee: Fee;
}

export interface Order {
    id: string;
    clientOrderId: Str;
    datetime: string;
    timestamp: number;
    lastTradeTimestamp: number;
    lastUpdateTimestamp?: number;
    status: 'open' | 'closed' | 'canceled' | Str;
    symbol: string;
    type: Str;
    timeInForce?: Str;
    side: 'buy' | 'sell' | Str;
    price: number;
    average?: number;
    amount: number;
    filled: number;
    remaining: number;
    stopPrice?: number;
    triggerPrice?: number;
    takeProfitPrice?: number;
    stopLossPrice?: number;
    cost: number;
    trades: Trade[];
    fee: Fee;
    reduceOnly: Bool;
    postOnly: Bool;
    info: any;
}

export interface OrderBook {
    asks: [Num, Num][];
    bids: [Num, Num][];
    datetime: Str;
    timestamp: Int;
    nonce: Int;
    symbol: Str;
}

export interface Ticker {
    symbol: string;
    info: any;
    timestamp: Int;
    datetime: Str;
    high: Num;
    low: Num;
    bid: Num;
    bidVolume: Num;
    ask: Num;
    askVolume: Num;
    vwap: Num;
    open: Num;
    close: Num;
    last: Num;
    previousClose: Num;
    change: Num;
    percentage: Num;
    average: Num;
    quoteVolume: Num;
    baseVolume: Num;
    indexPrice: Num
    markPrice: Num;
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
    type: 'deposit' | 'withdrawal' | Str;
    amount: Num;
    currency: Str;
    status: 'pending' | 'ok' | Str;
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
    numericId?: Int;
    precision: number;
    type?: Str;
    margin?: Bool;
    name?: Str;
    active?: Bool;
    deposit?: Bool;
    withdraw?: Bool;
    fee?: Num;
    limits: {
        amount: {
            min?: Num;
            max?: Num;
        },
        withdraw: {
            min?: Num;
            max?: Num;
        },
    },
    networks: {
        string: any,
    },
    info: any;
}

export interface Balance {
    free: Num,
    used: Num,
    total: Num,
    debt?: Num,
}

export interface BalanceAccount {
    free: Str,
    used: Str,
    total: Str,
}

export interface Account {
    id: Str,
    type: Str,
    code: Str,
    info: any,
}

export interface PartialBalances extends Dictionary<number> {
}

export interface Balances extends Dictionary<Balance> {
    info: any;
    timestamp?: any; // we need to fix this later
    datetime?: any;
}

export interface DepositAddress {
    currency: Str;
    address: string;
    status: Str;
    info: any;
}

export interface WithdrawalResponse {
    info: any;
    id: string;
}

export interface DepositAddressResponse {
    currency: Str;
    address: string;
    info: any;
    tag?: Str;
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
    interval?: string;
}

export interface FundingRates extends Dictionary<FundingRate> {
}

export interface Position {
    symbol: string;
    id?: Str;
    info: any;
    timestamp?: number;
    datetime?: string;
    contracts?: number;
    contractSize?: number;
    side: Str;
    notional?: number;
    leverage?: number;
    unrealizedPnl?: number;
    realizedPnl?: number;
    collateral?: number;
    entryPrice?: number;
    markPrice?: number;
    liquidationPrice?: number;
    marginMode?: Str;
    hedged?: boolean;
    maintenanceMargin?: number;
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
    account?: Str;
    currency?: Str;
    interest?: number;
    interestRate?: number;
    amountBorrowed?: number;
    marginMode?: Str;
    timestamp?: number;
    datetime?: Str;
    info: any;
}

export interface LeverageTier {
    tier?: number;
    currency?: Str;
    minNotional?: number;
    maxNotional?: number;
    maintenanceMarginRate?: number;
    maxLeverage?: number;
    info: any;
}

export interface LedgerEntry {
    info: any;
    id?: Str;
    timestamp?: number;
    datetime?: Str;
    direction?: Str;
    account?: Str;
    referenceId?: Str;
    referenceAccount?: Str;
    type?: Str;
    currency?: Str;
    amount?: number;
    before?: number;
    after?: number;
    status?: Str;
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
    id?: Str;
    timestamp?: number;
    datetime?: Str;
    currency?: Str;
    amount?: number;
    fromAccount?: Str;
    toAccount?: Str;
    status?: Str;
}

export interface CrossBorrowRate {
    info: any;
    currency?: Str;
    rate: number;
    period?: number;
    timestamp?: number;
    datetime?: Str;
}

export interface IsolatedBorrowRate {
    info: any,
    symbol: string,
    base: string,
    baseRate: number,
    quote: string,
    quoteRate: number,
    period?: Int,
    timestamp?: Int,
    datetime?: Str,
}

export interface FundingRateHistory {
    info: any;
    symbol: string;
    fundingRate: number;
    timestamp?: number
    datetime?: Str;
}

export interface OpenInterest {
    symbol: string;
    openInterestAmount?: number;
    openInterestValue?: number;
    baseVolume?: number;
    quoteVolume?: number;
    timestamp?: number;
    datetime?: Str;
    info: any;
}

export interface Liquidation {
    info: any;
    symbol: string;
    timestamp?: number
    datetime?: Str;
    price: number;
    baseValue?: number;
    quoteValue?: number;
}

export interface OrderRequest {
    symbol: string;
    type: OrderType;
    side: OrderSide;
    amount?: number;
    price?: number | undefined;
    params?: any;
}

export interface CancellationRequest {
    id: string;
    clientOrderId?: string;
    symbol: string;
}

export interface FundingHistory {
    info: any;
    symbol: string;
    code: string;
    timestamp?: number
    datetime?: Str;
    id: string;
    amount: number;
}

export interface MarginMode {
    info: any;
    symbol: string;
    marginMode: 'isolated' | 'cross' | Str;
}

export interface Greeks {
    symbol: string;
    timestamp?: number
    datetime?: Str;
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

export interface Conversion {
    info: any;
    timestamp?: number
    datetime?: string;
    id: string;
    fromCurrency: string;
    fromAmount: number;
    toCurrency: string;
    toAmount: number;
    price: number;
    fee: number;
}

export interface Option {
    info: any;
    currency: string;
    symbol: string;
    timestamp?: number
    datetime?: Str;
    impliedVolatility: number;
    openInterest: number;
    bidPrice: number;
    askPrice: number;
    midPrice: number;
    markPrice: number;
    lastPrice: number;
    underlyingPrice: number;
    change: number;
    percentage: number;
    baseVolume: number;
    quoteVolume: number;
}

export interface LastPrice {
    symbol: string,
    timestamp?: number,
    datetime?: string,
    price: number,
    side?: OrderSide,
    info: any,
}

export interface Leverage {
    info: any;
    symbol: string;
    marginMode: 'isolated' | 'cross' | Str;
    longLeverage: number;
    shortLeverage: number;
}

export interface MarginModification {
    'info': any,
    'symbol': string,
    'type': 'add' | 'reduce' | 'set' | undefined,
    'marginMode': 'cross' | 'isolated' | undefined,
    'amount': Num,
    'total': Num,
    'code': Str,
    'status': Str,
    'timestamp': Int,
    'datetime': Str,
}

export interface Leverages extends Dictionary<Leverage> {
}

export interface LastPrices extends Dictionary<LastPrice> {
}
export interface Currencies extends Dictionary<CurrencyInterface> {
}

export interface TradingFees extends Dictionary<TradingFeeInterface> {
}

export interface MarginModes extends Dictionary<MarginMode> {
}

export interface OptionChain extends Dictionary<Option> {
}

export interface IsolatedBorrowRates extends Dictionary<IsolatedBorrowRates> {
}

export interface CrossBorrowRates extends Dictionary<CrossBorrowRates> {
}

export interface LeverageTiers extends Dictionary<LeverageTier[]> {
}

/** [ timestamp, open, high, low, close, volume ] */
export type OHLCV = [Num, Num, Num, Num, Num, Num];

/** [ timestamp, open, high, low, close, volume, count ] */
export type OHLCVC = [Num, Num, Num, Num, Num, Num, Num];

export type implicitReturnType = any;

export type Market = MarketInterface | undefined;
export type Currency = CurrencyInterface | undefined;

