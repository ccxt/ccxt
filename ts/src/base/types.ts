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

export type PreciseNumber = string | number;

export interface MinMax {
    min: PreciseNumber;
    max: PreciseNumber;
}

export interface FeeInterface {
    currency: Str;
    cost: PreciseNumber;
    rate?: PreciseNumber;
}

export interface TradingFeeInterface {
    info: any;
    symbol: Str;
    maker: PreciseNumber;
    taker: PreciseNumber;
    percentage: Bool;
    tierBased: Bool;
}

export type Fee = FeeInterface | undefined

export interface MarketInterface {
    id: string;
    numericId?: Int;
    uppercaseId?: string;
    lowercaseId?: string;
    symbol: string;
    base: string;
    quote: string;
    baseId: string;
    quoteId: string;
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
    contractSize: PreciseNumber;
    linear: Bool;
    inverse: Bool;
    quanto?: boolean;
    expiry: Int;
    expiryDatetime: Str;
    strike: PreciseNumber;
    optionType: Str;
    taker?: PreciseNumber
    maker?: PreciseNumber
    percentage?: boolean | undefined;
    tierBased?: boolean | undefined;
    feeSide?: string | undefined;
    precision: {
        amount: PreciseNumber,
        price: PreciseNumber,
        cost?: PreciseNumber,
    };
    marginMode?: {
        isolated: boolean,
        cross: boolean,
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
    amount: PreciseNumber;                  // amount of base currency
    datetime: Str;                // ISO8601 datetime with milliseconds;
    id: Str;                      // string trade id
    order: Str;                  // string order id or undefined/None/null
    price: PreciseNumber;                   // float price in quote currency
    timestamp: Int;               // Unix timestamp in milliseconds
    type: Str;                   // order type, 'market', 'limit', ... or undefined/None/null
    side: 'buy' | 'sell' | Str;            // direction of the trade, 'buy' or 'sell'
    symbol: Str;                  // symbol in CCXT format
    takerOrMaker: 'taker' | 'maker' | Str; // string, 'taker' or 'maker'
    cost: PreciseNumber;                    // total cost (including fees), `price * amount`
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
    price: PreciseNumber;
    average?: PreciseNumber;
    amount: PreciseNumber;
    filled: PreciseNumber;
    remaining: PreciseNumber;
    stopPrice?: PreciseNumber;
    triggerPrice?: PreciseNumber;
    takeProfitPrice?: PreciseNumber;
    stopLossPrice?: PreciseNumber;
    cost: PreciseNumber;
    trades: Trade[];
    fee: Fee;
    reduceOnly: Bool;
    postOnly: Bool;
    info: any;
}

export interface OrderBook {
    asks: [PreciseNumber, PreciseNumber][];
    bids: [PreciseNumber, PreciseNumber][];
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
    high: PreciseNumber;
    low: PreciseNumber;
    bid: PreciseNumber;
    bidVolume: PreciseNumber;
    ask: PreciseNumber;
    askVolume: PreciseNumber;
    vwap: PreciseNumber;
    open: PreciseNumber;
    close: PreciseNumber;
    last: PreciseNumber;
    previousClose: PreciseNumber;
    change: PreciseNumber;
    percentage: PreciseNumber;
    average: PreciseNumber;
    quoteVolume: PreciseNumber;
    baseVolume: PreciseNumber;
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
    amount: PreciseNumber;
    currency: Str;
    status: 'pending' | 'ok' | Str;
    updated: PreciseNumber;
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
    fee?: PreciseNumber;
    limits: {
        amount: {
            min?: PreciseNumber;
            max?: PreciseNumber;
        },
        withdraw: {
            min?: PreciseNumber;
            max?: PreciseNumber;
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
    fundingRate?: PreciseNumber;
    datetime?: string;
    markPrice?: PreciseNumber;
    indexPrice?: PreciseNumber;
    interestRate?: PreciseNumber;
    estimatedSettlePrice?: PreciseNumber;
    fundingTimestamp?: number;
    fundingDatetime?: string;
    nextFundingTimestamp?: number;
    nextFundingDatetime?: string;
    nextFundingRate?: PreciseNumber;
    previousFundingTimestamp?: number;
    previousFundingDatetime?: string;
    previousFundingRate?: PreciseNumber;
}

export interface FundingRates extends Dictionary<FundingRate> {
}

export interface Position {
    symbol: string;
    id?: Str;
    info: any;
    timestamp?: number;
    datetime?: string;
    contracts?: PreciseNumber;
    contractSize?: PreciseNumber;
    side: Str;
    notional?: PreciseNumber;
    leverage?: PreciseNumber;
    unrealizedPnl?: PreciseNumber;
    realizedPnl?: PreciseNumber;
    collateral?: PreciseNumber;
    entryPrice?: PreciseNumber;
    markPrice?: PreciseNumber;
    liquidationPrice?: PreciseNumber;
    marginMode?: Str;
    hedged?: boolean;
    maintenanceMargin?: PreciseNumber;
    maintenanceMarginPercentage?: PreciseNumber;
    initialMargin?: PreciseNumber;
    initialMarginPercentage?: PreciseNumber;
    marginRatio?: PreciseNumber;
    lastUpdateTimestamp?: number;
    lastPrice?: PreciseNumber;
    stopLossPrice?: PreciseNumber;
    takeProfitPrice?: PreciseNumber;
    percentage?: PreciseNumber;
}

export interface BorrowInterest {
    account?: Str;
    currency?: Str;
    interest?: PreciseNumber;
    interestRate?: PreciseNumber;
    amountBorrowed?: PreciseNumber;
    marginMode?: Str;
    timestamp?: number;
    datetime?: Str;
    info: any;
}

export interface LeverageTier {
    tier?: number;
    currency?: Str;
    minNotional?: PreciseNumber;
    maxNotional?: PreciseNumber;
    maintenanceMarginRate?: PreciseNumber;
    maxLeverage?: PreciseNumber;
    info: any;
}

export interface LedgerEntry {
    id?: Str;
    info: any;
    timestamp?: number;
    datetime?: Str;
    direction?: Str;
    account?: Str;
    referenceId?: Str;
    referenceAccount?: Str;
    type?: Str;
    currency?: Str;
    amount?: PreciseNumber;
    before?: PreciseNumber;
    after?: PreciseNumber;
    status?: Str;
    fee?: Fee;
}

export interface DepositWithdrawFeeNetwork {
    fee?: PreciseNumber;
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
    amount?: PreciseNumber;
    fromAccount?: Str;
    toAccount?: Str;
    status?: Str;
}

export interface CrossBorrowRate {
    info: any;
    currency?: Str;
    rate: PreciseNumber;
    period?: number;
    timestamp?: number;
    datetime?: Str;
}

export interface IsolatedBorrowRate {
    info: any,
    symbol: string,
    base: string,
    baseRate: PreciseNumber,
    quote: string,
    quoteRate: PreciseNumber,
    period?: Int,
    timestamp?: Int,
    datetime?: Str,
}

export interface FundingRateHistory {
    info: any;
    symbol: string;
    fundingRate: PreciseNumber;
    timestamp?: number
    datetime?: Str;
}

export interface OpenInterest {
    symbol: string;
    openInterestAmount?: PreciseNumber;
    openInterestValue?: PreciseNumber;
    baseVolume?: PreciseNumber;
    quoteVolume?: PreciseNumber;
    timestamp?: number;
    datetime?: Str;
    info: any;
}

export interface Liquidation {
    info: any;
    symbol: string;
    timestamp?: number
    datetime?: Str;
    price: PreciseNumber;
    baseValue?: PreciseNumber;
    quoteValue?: PreciseNumber;
}

export interface OrderRequest {
    symbol: string;
    type: OrderType;
    side: OrderSide;
    amount?: PreciseNumber;
    price?: PreciseNumber;
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
    amount: PreciseNumber;
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
    delta: PreciseNumber;
    gamma: PreciseNumber;
    theta: PreciseNumber;
    vega: PreciseNumber;
    rho: PreciseNumber;
    bidSize: PreciseNumber;
    askSize: PreciseNumber;
    bidImpliedVolatility: PreciseNumber;
    askImpliedVolatility: PreciseNumber;
    markImpliedVolatility: PreciseNumber;
    bidPrice: PreciseNumber;
    askPrice: PreciseNumber;
    markPrice: PreciseNumber;
    lastPrice: PreciseNumber;
    underlyingPrice: PreciseNumber;
    info: any;
}

export interface Conversion {
    info: any;
    timestamp?: number
    datetime?: string;
    id: string;
    fromCurrency: string;
    fromAmount: PreciseNumber;
    toCurrency: string;
    toAmount: PreciseNumber;
    price: PreciseNumber;
    fee: PreciseNumber;
}

export interface Option {
    info: any;
    currency: string;
    symbol: string;
    timestamp?: number
    datetime?: Str;
    impliedVolatility: PreciseNumber;
    openInterest: PreciseNumber;
    bidPrice: PreciseNumber;
    askPrice: PreciseNumber;
    midPrice: PreciseNumber;
    markPrice: PreciseNumber;
    lastPrice: PreciseNumber;
    underlyingPrice: PreciseNumber;
    change: PreciseNumber;
    percentage: PreciseNumber;
    baseVolume: PreciseNumber;
    quoteVolume: PreciseNumber;
}

export interface LastPrice {
    symbol: string,
    timestamp?: number,
    datetime?: string,
    price: PreciseNumber,
    side?: OrderSide,
    info: any,
}

export interface Leverage {
    info: any;
    symbol: string;
    marginMode: 'isolated' | 'cross' | Str;
    longLeverage: PreciseNumber;
    shortLeverage: PreciseNumber;
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

export interface TransferEntries extends Dictionary<TransferEntry> {
}

export interface LeverageTiers extends Dictionary<LeverageTier[]> {
}

/** [ timestamp, open, high, low, close, volume ] */
export type OHLCV = [Num, PreciseNumber, PreciseNumber, PreciseNumber, PreciseNumber, PreciseNumber];

/** [ timestamp, open, high, low, close, volume, count ] */
export type OHLCVC = [Num, PreciseNumber, PreciseNumber, PreciseNumber, PreciseNumber, PreciseNumber, PreciseNumber];

export type implicitReturnType = any;

export type Market = MarketInterface | undefined;
export type Currency = CurrencyInterface | undefined;

