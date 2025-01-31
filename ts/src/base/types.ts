export type Bool = boolean | undefined;
// must be an integer in other langs
export type IndexType = number | string;
export type int = number;
export type Int = number | undefined;
export type MarketType = 'future' | 'margin' | 'option' | 'spot' | 'swap' | 'delivery' | 'index';
export type Num = number | undefined;
export type OrderSide = 'buy' | 'sell' | string;
export type OrderType = 'limit' | 'market' | string;
export type Str = string | undefined;
export type Strings = string[] | undefined;
export type SubType = 'inverse' | 'linear' | undefined;

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
    max: Num;
    min: Num;
}

export interface FeeInterface {
    cost: Num;
    currency: Str;
    rate?: Num;
}

export interface TradingFeeInterface {
    info: any;
    maker: Num;
    percentage: Bool;
    symbol: Str;
    taker: Num;
    tierBased: Bool;
}

export type Fee = FeeInterface | undefined

export interface MarketMarginModes {
    isolated: boolean;
    cross: boolean;
}

export interface MarketInterface {
    active: Bool;
    base: Str;
    baseId: Str;
    contract: boolean;
    contractSize: Num;
    created: Int;
    expiry: Int;
    expiryDatetime: Str;
    feeSide?: Str;
    future: boolean;
    id: Str;
    info: any;
    inverse: Bool;
    limits: {
        amount?: MinMax,
        cost?: MinMax,
        leverage?: MinMax,
        price?: MinMax,
        market?: MinMax,
    };
    linear: Bool;
    lowercaseId?: Str;
    maker?: Num;
    margin: boolean;
    marginMode?: {
        cross: boolean
        isolated: boolean
    };
    marginModes?: MarketMarginModes;
    numericId?: Num;
    option: boolean;
    optionType: Str;
    percentage?: Bool;
    precision: {
        amount: Num
        cost?: Num
        price: Num
    };
    quanto?: boolean;
    quote: Str;
    quoteId: Str;
    settle: Str;
    settleId: Str;
    spot: boolean;
    strike: Num;
    subType?: SubType;
    swap: boolean;
    symbol: string;
    taker?: Num;
    tierBased?: Bool;
    type: MarketType;
    uppercaseId?: Str;
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
    side: 'buy' | 'sell' | Str;            // direction of the trade, 'buy' or 'sell'
    symbol: Str;                  // symbol in CCXT format
    takerOrMaker: 'taker' | 'maker' | Str; // string, 'taker' or 'maker'
    timestamp: Int;               // Unix timestamp in milliseconds
    type: Str;                   // order type, 'market', 'limit', ... or undefined/None/null
}

export interface Order {
    amount: number;
    average?: number;
    clientOrderId: Str;
    cost: number;
    datetime: string;
    fee?: Fee;
    filled: number;
    id: string;
    info: any;
    lastTradeTimestamp?: number;
    lastUpdateTimestamp?: number;
    postOnly?: Bool;
    price: number;
    reduceOnly?: Bool;
    remaining: number;
    side: 'buy' | 'sell' | Str;
    status: 'open' | 'closed' | 'canceled' | Str;
    stopLossPrice?: number;
    stopPrice?: number;
    symbol: string;
    takeProfitPrice?: number;
    timeInForce?: Str;
    timestamp: number;
    trades: Trade[];
    triggerPrice?: number;
    type: Str;
}

export interface OrderBook {
    asks: [Num, Num][];
    bids: [Num, Num][];
    datetime: Str;
    nonce: Int;
    symbol: Str;
    timestamp: Int;
}

export interface OrderBooks extends Dictionary<OrderBook> {
}

export interface Ticker {
    ask: Num;
    askVolume: Num;
    average: Num;
    baseVolume: Num;
    bid: Num;
    bidVolume: Num;
    change: Num;
    close: Num;
    datetime: Str;
    high: Num;
    indexPrice: Num
    info: any;
    last: Num;
    low: Num;
    markPrice: Num;
    open: Num;
    percentage: Num;
    previousClose: Num;
    quoteVolume: Num;
    symbol: string;
    timestamp: Int;
    vwap: Num;
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
    status: 'pending' | 'ok' | Str;
    tag: Str;
    tagFrom: Str;
    tagTo: Str;
    timestamp: Int;
    txid: Str;
    type: 'deposit' | 'withdrawal' | Str;
    updated: Int;
}

export interface CurrencyInterface {
    active?: Bool;
    code: string;
    deposit?: Bool;
    fee?: Num;
    id: string;
    info: any;
    limits: {
        amount: {
            max?: Num;
            min?: Num;
        },
        withdraw: {
            max?: Num;
            min?: Num;
        },
    },
    margin?: Bool;
    name?: Str;
    networks: {
        string: any,
    },
    numericId?: Int;
    precision: number;
    type?: Str;
    withdraw?: Bool;
}

export interface Balance {
    debt?: Num,
    free: Num,
    total: Num,
    used: Num,
}

export interface BalanceAccount {
    free: Str,
    total: Str,
    used: Str,
}

export interface Account {
    code: Str,
    id: Str,
    info: any,
    type: Str,
}

export interface DepositAddress {
    address: string;
    currency: string;
    info: any;
    network?: string;
    tag?: Str;
}

export interface WithdrawalResponse {
    id: string;
    info: any;
}

export interface DepositAddressResponse {
    address: string;
    currency: Str;
    info: any;
    tag?: Str;
}

export interface FundingRate {
    datetime?: string;
    estimatedSettlePrice?: number;
    fundingDatetime?: string;
    fundingRate?: number;
    fundingTimestamp?: number;
    indexPrice?: number;
    info: any;
    interestRate?: number;
    interval?: string;
    markPrice?: number;
    nextFundingDatetime?: string;
    nextFundingRate?: number;
    nextFundingTimestamp?: number;
    previousFundingDatetime?: string;
    previousFundingRate?: number;
    previousFundingTimestamp?: number;
    symbol: string;
    timestamp?: number;
}

export interface Position {
    collateral?: number;
    contracts?: number;
    contractSize?: number;
    datetime?: string;
    entryPrice?: number;
    hedged?: boolean;
    id?: Str;
    info: any;
    initialMargin?: number;
    initialMarginPercentage?: number;
    lastPrice?: number;
    lastUpdateTimestamp?: number;
    leverage?: number;
    liquidationPrice?: number;
    maintenanceMarginPercentage?: number;
    maintenenceMargin?: number;
    marginMode?: Str;
    marginRatio?: number;
    markPrice?: number;
    notional?: number;
    percentage?: number;
    realizedPnl?: number;
    side: Str;
    stopLossPrice?: number;
    symbol: string;
    takeProfitPrice?: number;
    timestamp?: number;
    unrealizedPnl?: number;
}

export interface BorrowInterest {
    amountBorrowed?: number;
    currency?: Str;
    datetime?: Str;
    info: any;
    interest?: number;
    interestRate?: number;
    marginMode?: Str;
    symbol?: Str;
    timestamp?: Int;
}

export interface LeverageTier {
    currency?: Str;
    info: any;
    maintenanceMarginRate?: number;
    maxLeverage?: number;
    maxNotional?: number;
    minNotional?: number;
    symbol?: Str;
    tier?: number;
}

export interface LedgerEntry {
    account?: Str;
    after?: number;
    amount?: number;
    before?: number;
    currency?: Str;
    datetime?: Str;
    direction?: Str;
    fee?: Fee;
    id?: Str;
    info: any;
    referenceAccount?: Str;
    referenceId?: Str;
    status?: Str;
    timestamp?: number;
    type?: Str;
}

export interface DepositWithdrawFeeNetwork {
    fee?: number;
    percentage?: boolean;
}

export interface DepositWithdrawFee {
    deposit?: DepositWithdrawFeeNetwork,
    info: any;
    networks?: Dictionary<DepositWithdrawFeeNetwork>;
    withdraw?: DepositWithdrawFeeNetwork,
}

export interface TransferEntry {
    amount?: number;
    currency?: Str;
    datetime?: Str;
    fromAccount?: Str;
    id?: Str;
    info?: any;
    status?: Str;
    timestamp?: number;
    toAccount?: Str;
}

export interface CrossBorrowRate {
    currency?: Str;
    datetime?: Str;
    info: any;
    period?: number;
    rate: number;
    timestamp?: number;
}

export interface IsolatedBorrowRate {
    base: string,
    baseRate: number,
    datetime?: Str,
    info: any,
    period?: Int,
    quote: string,
    quoteRate: number,
    symbol: string,
    timestamp?: Int,
}

export interface FundingRateHistory {
    datetime?: Str;
    fundingRate: number;
    info: any;
    symbol: string;
    timestamp?: number;
}

export interface OpenInterest {
    baseVolume?: number;
    datetime?: Str;
    info: any;
    openInterestAmount?: number;
    openInterestValue?: number;
    quoteVolume?: number;
    symbol: string;
    timestamp?: number;
}

export interface Liquidation {
    baseValue?: number;
    datetime?: Str;
    info: any;
    price: number;
    quoteValue?: number;
    symbol: string;
    timestamp?: number;
}

export interface OrderRequest {
    amount?: number;
    params?: any;
    price?: number | undefined;
    side: OrderSide;
    symbol: string;
    type: OrderType;
}

export interface CancellationRequest {
    clientOrderId?: string;
    id: string;
    symbol: string;
}

export interface FundingHistory {
    amount: number;
    code: string;
    datetime?: Str;
    id: string;
    info: any;
    symbol: string;
    timestamp?: number;
}

export interface MarginMode {
    info: any;
    marginMode: 'isolated' | 'cross' | Str;
    symbol: string;
}

export interface Greeks {
    askImpliedVolatility: number;
    askPrice: number;
    askSize: number;
    bidImpliedVolatility: number;
    bidPrice: number;
    bidSize: number;
    datetime?: Str;
    delta: number;
    gamma: number;
    info: any;
    lastPrice: number;
    markImpliedVolatility: number;
    markPrice: number;
    rho: number;
    symbol: string;
    theta: number;
    timestamp?: number;
    underlyingPrice: number;
    vega: number;
}

export interface Conversion {
    datetime?: string;
    fee: number;
    fromAmount: number;
    fromCurrency: string;
    id: string;
    info: any;
    price: number;
    timestamp?: number;
    toAmount: number;
    toCurrency: string;
}

export interface Option {
    askPrice: number;
    baseVolume: number;
    bidPrice: number;
    change: number;
    currency: string;
    datetime?: Str;
    impliedVolatility: number;
    info: any;
    lastPrice: number;
    markPrice: number;
    midPrice: number;
    openInterest: number;
    percentage: number;
    quoteVolume: number;
    symbol: string;
    timestamp?: number;
    underlyingPrice: number;
}

export interface LastPrice {
    datetime?: string,
    info: any,
    price: number,
    side?: OrderSide,
    symbol: string,
    timestamp?: number,
}

export interface Leverage {
    info: any;
    longLeverage: number;
    marginMode: 'isolated' | 'cross' | Str;
    shortLeverage: number;
    symbol: string;
}

export interface LongShortRatio {
    info: any,
    symbol: string,
    timestamp?: number,
    datetime?: string,
    timeframe?: string,
    longShortRatio: number,
}

export interface MarginModification {
    'amount': Num,
    'code': Str,
    'datetime': Str,
    'info': any,
    'marginMode': 'cross' | 'isolated' | undefined,
    'status': Str,
    'symbol': string,
    'timestamp': Int,
    'total': Num,
    'type': 'add' | 'reduce' | 'set' | undefined,
}

export interface Balances extends Dictionary<Balance> {
    datetime?: any;
    info: any;
    timestamp?: any; // we need to fix this later
}

export interface CrossBorrowRates extends Dictionary<CrossBorrowRates> {
}

export interface Currencies extends Dictionary<CurrencyInterface> {
}

export interface FundingRates extends Dictionary<FundingRate> {
}

export interface IsolatedBorrowRates extends Dictionary<IsolatedBorrowRates> {
}

export interface LastPrices extends Dictionary<LastPrice> {
}

export interface Leverages extends Dictionary<Leverage> {
}

export interface LeverageTiers extends Dictionary<LeverageTier[]> {
}

export interface MarginModes extends Dictionary<MarginMode> {
}

export interface OpenInterests extends Dictionary<OpenInterest> {
}

export interface OptionChain extends Dictionary<Option> {
}

export interface PartialBalances extends Dictionary<number> {
}

export interface Tickers extends Dictionary<Ticker> {
}

export interface TradingFees extends Dictionary<TradingFeeInterface> {
}

/** [ timestamp, open, high, low, close, volume ] */
export type OHLCV = [ Num, Num, Num, Num, Num, Num ];

/** [ timestamp, open, high, low, close, volume, count ] */
export type OHLCVC = [ Num, Num, Num, Num, Num, Num, Num ];

export type implicitReturnType = any;

export type Market = MarketInterface | undefined;
export type Currency = CurrencyInterface | undefined;

