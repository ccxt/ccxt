export declare type Int = number | undefined;
export declare type Str = string | undefined;
export declare type Strings = string[] | undefined;
export declare type Num = number | undefined;
export declare type Bool = boolean | undefined;
export declare type IndexType = number | string;
export declare type OrderSide = 'buy' | 'sell' | string;
export declare type OrderType = 'limit' | 'market' | string;
export declare type MarketType = 'spot' | 'margin' | 'swap' | 'future' | 'option' | 'delivery' | 'index';
export declare type SubType = 'linear' | 'inverse' | undefined;
export interface Dictionary<T> {
    [key: string]: T;
}
export declare type Dict = Dictionary<any>;
export declare type NullableDict = Dict | undefined;
export declare type List = Array<any>;
export declare type NullableList = List | undefined;
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
export interface TradingFeeInterface {
    info: any;
    symbol: Str;
    maker: Num;
    taker: Num;
    percentage: Bool;
    tierBased: Bool;
}
export declare type Fee = FeeInterface | undefined;
export interface MarketInterface {
    id: string;
    numericId?: Num;
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
        cost?: Num;
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
    side: 'buy' | 'sell' | Str;
    symbol: Str;
    takerOrMaker: 'taker' | 'maker' | Str;
    cost: Num;
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
        };
        withdraw: {
            min?: Num;
            max?: Num;
        };
    };
    networks: {
        string: any;
    };
    info: any;
}
export interface Balance {
    free: Num;
    used: Num;
    total: Num;
    debt?: Num;
}
export interface BalanceAccount {
    free: Str;
    used: Str;
    total: Str;
}
export interface Account {
    id: Str;
    type: Str;
    code: Str;
    info: any;
}
export interface PartialBalances extends Dictionary<number> {
}
export interface Balances extends Dictionary<Balance> {
    info: any;
    timestamp?: any;
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
    withdraw?: DepositWithdrawFeeNetwork;
    deposit?: DepositWithdrawFeeNetwork;
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
    info: any;
    symbol: string;
    base: string;
    baseRate: number;
    quote: string;
    quoteRate: number;
    period?: Int;
    timestamp?: Int;
    datetime?: Str;
}
export interface FundingRateHistory {
    info: any;
    symbol: string;
    fundingRate: number;
    timestamp?: number;
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
    timestamp?: number;
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
    timestamp?: number;
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
    timestamp?: number;
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
    timestamp?: number;
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
    timestamp?: number;
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
    symbol: string;
    timestamp?: number;
    datetime?: string;
    price: number;
    side?: OrderSide;
    info: any;
}
export interface Leverage {
    info: any;
    symbol: string;
    marginMode: 'isolated' | 'cross' | Str;
    longLeverage: number;
    shortLeverage: number;
}
export interface MarginModification {
    'info': any;
    'symbol': string;
    'type': 'add' | 'reduce' | 'set' | undefined;
    'marginMode': 'cross' | 'isolated' | undefined;
    'amount': Num;
    'total': Num;
    'code': Str;
    'status': Str;
    'timestamp': Int;
    'datetime': Str;
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
/** [ timestamp, open, high, low, close, volume ] */
export declare type OHLCV = [Num, Num, Num, Num, Num, Num];
/** [ timestamp, open, high, low, close, volume, count ] */
export declare type OHLCVC = [Num, Num, Num, Num, Num, Num, Num];
export declare type implicitReturnType = any;
export declare type Market = MarketInterface | undefined;
export declare type Currency = CurrencyInterface | undefined;
