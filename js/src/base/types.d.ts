export type Int = number | undefined;
export type int = number;
export type Str = string | undefined;
export type Strings = string[] | undefined;
export type Num = number | undefined;
export type Bool = boolean | undefined;
export type IndexType = number | string;
export type OrderSide = 'buy' | 'sell' | string | undefined;
export type OrderType = 'limit' | 'market' | string;
export type MarketType = 'spot' | 'margin' | 'swap' | 'future' | 'option' | 'delivery' | 'index' | 'prediction';
export type SubType = 'linear' | 'inverse' | undefined;
export interface Dictionary<T> {
    [key: string]: T;
}
export interface NestedDictionary {
    [key: string]: string | NestedDictionary;
}
export type Dict = Dictionary<any>;
export type NullableDict = Dict | undefined;
export type List = Array<any>;
export type NullableList = List | undefined;
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
export type Fee = FeeInterface | undefined;
export interface MarketMarginModes {
    isolated: boolean;
    cross: boolean;
}
export interface Precision {
    amount: Num;
    price: Num;
    cost?: Num;
}
export interface MarketInterface {
    id: Str;
    numericId?: Num;
    uppercaseId?: Str;
    lowercaseId?: Str;
    symbol: string;
    base: string;
    quote: string;
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
    prediction?: boolean;
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
    percentage?: Bool;
    tierBased?: Bool;
    feeSide?: Str;
    precision: Precision;
    marginModes?: MarketMarginModes;
    limits: {
        amount?: MinMax;
        cost?: MinMax;
        leverage?: MinMax;
        price?: MinMax;
        market?: MinMax;
    };
    created: Int;
    info: any;
    outcomes?: PredictionOutcome[];
}
export interface PredictionFees {
    trading?: Num;
    resolution?: Num;
}
export interface PredictionEvent {
    info: any;
    id: string;
    event: string;
    title?: Str;
    description?: Str;
    slug?: Str;
    category?: Str;
    tags?: string[];
    markets: PredictionMarket[];
    mutuallyExclusive?: Bool;
    active?: Bool;
    resolved?: Bool;
    volume?: Num;
    liquidity?: Num;
    created?: Int;
    createdDatetime?: Str;
    end?: Int;
    endDatetime?: Str;
    image?: Str;
    url?: Str;
}
export interface PredictionMarket {
    info: any;
    id: string;
    market: string;
    event?: Str;
    marketType: 'binary' | 'categorical' | 'scalar' | Str;
    executionModel?: 'clob' | 'amm' | 'parimutuel' | Str;
    title?: Str;
    description?: Str;
    outcomes: PredictionOutcome[];
    underlying?: Str;
    floorStrike?: Num;
    capStrike?: Num;
    strikeType?: Str;
    collateral?: Str;
    active?: Bool;
    closed?: Bool;
    resolved?: Bool;
    resolvedOutcome?: Str;
    settlementValue?: Num;
    created?: Int;
    createdDatetime?: Str;
    end?: Int;
    endDatetime?: Str;
    volume?: Num;
    liquidity?: Num;
    openInterest?: Num;
    tickSize?: Num;
    limits?: {
        amount?: MinMax;
        cost?: MinMax;
    };
    fees?: PredictionFees;
    resolutionSource?: Str;
    image?: Str;
}
export interface PredictionOutcome {
    info: any;
    outcome: string;
    outcomeId?: Str;
    label?: Str;
    market?: Str;
    marketId?: Str;
    event?: Str;
    price?: Num;
    bid?: Num;
    ask?: Num;
    active?: Bool;
    winner?: Bool;
    settleFraction?: Num;
    precision?: Precision;
}
export interface PredictionOrder {
    id: Str;
    clientOrderId: Str;
    datetime: Str;
    timestamp: Int;
    lastTradeTimestamp: Int;
    lastUpdateTimestamp?: Int;
    status: 'open' | 'closed' | 'canceled' | Str;
    type: Str;
    timeInForce?: Str;
    side: 'buy' | 'sell' | Str;
    price: Num;
    average?: Num;
    amount: Num;
    filled: Num;
    remaining: Num;
    cost: Num;
    fee: Fee;
    reduceOnly: Bool;
    postOnly: Bool;
    info: any;
    outcome: string;
    outcomeId?: Str;
    label?: Str;
    market?: Str;
    event?: Str;
    trades: PredictionTrade[];
}
export interface PredictionTrade {
    info: any;
    amount: Num;
    datetime: Str;
    id: Str;
    order: Str;
    price: Num;
    timestamp: Int;
    type: Str;
    side: 'buy' | 'sell' | Str;
    takerOrMaker: 'taker' | 'maker' | Str;
    cost: Num;
    fee: Fee;
    outcome: string;
    outcomeId?: Str;
    label?: Str;
    market?: Str;
    realizedPnl?: Num;
}
export interface PredictionPosition {
    id?: Str;
    info: any;
    timestamp?: Int;
    datetime?: Str;
    contracts?: Num;
    contractSize?: Num;
    side: Str;
    notional?: Num;
    unrealizedPnl?: Num;
    realizedPnl?: Num;
    collateral?: Num;
    entryPrice?: Num;
    markPrice?: Num;
    lastPrice?: Num;
    percentage?: Num;
    outcome: string;
    outcomeId?: Str;
    label?: Str;
    market?: Str;
    event?: Str;
    resolved?: Bool;
    won?: Bool;
    settleFraction?: Num;
    payout?: Num;
}
export interface PredictionTicker {
    info: any;
    timestamp: Int;
    datetime: Str;
    high: Num;
    low: Num;
    bid: Num;
    bidVolume: Num;
    ask: Num;
    askVolume: Num;
    open: Num;
    close: Num;
    last: Num;
    change: Num;
    percentage: Num;
    average: Num;
    quoteVolume: Num;
    baseVolume: Num;
    outcome: string;
    outcomeId?: Str;
    label?: Str;
    market?: Str;
    event?: Str;
    openInterest?: Num;
}
export interface PredictionOrderBook {
    asks: [Num, Num][];
    bids: [Num, Num][];
    datetime: Str;
    timestamp: Int;
    nonce: Int;
    outcome: string;
    outcomeId?: Str;
    market?: Str;
}
export interface PredictionTickers extends Dictionary<PredictionTicker> {
}
export interface PredictionTradingFee {
    info: any;
    maker: Num;
    taker: Num;
    percentage: Bool;
    tierBased: Bool;
    outcome: string;
    outcomeId?: Str;
    market?: Str;
}
export interface PredictionOpenInterest {
    openInterestAmount?: Num;
    openInterestValue?: Num;
    timestamp?: Int;
    datetime?: Str;
    info: any;
    outcome: string;
    outcomeId?: Str;
    market?: Str;
}
export interface PredictionSettlement {
    info: any;
    id?: Str;
    timestamp?: Int;
    datetime?: Str;
    outcome?: Str;
    outcomeId?: Str;
    market?: Str;
    event?: Str;
    result?: Str;
    won?: Bool;
    amount?: Num;
    price?: Num;
    cost?: Num;
    payout?: Num;
    pnl?: Num;
}
export interface fetchEventsParams {
    query?: string;
    queries?: string[];
    tags?: string[];
    limit?: number;
    sort?: 'volume' | 'liquidity' | 'newest';
    status?: 'active' | 'inactive' | 'closed' | 'all';
    searchIn?: 'title' | 'description' | 'both';
    eventId?: string;
    slug?: string;
    [key: string]: any;
}
export interface Trade {
    info: any;
    amount: Num;
    datetime: Str;
    id: Str;
    order: Str;
    price: Num;
    timestamp: Int;
    type: Str;
    side: 'buy' | 'sell' | Str;
    symbol: Str;
    takerOrMaker: 'taker' | 'maker' | Str;
    cost: Num;
    fee: Fee;
}
export interface Order {
    id: Str;
    clientOrderId: Str;
    datetime: Str;
    timestamp: Int;
    lastTradeTimestamp: Int;
    lastUpdateTimestamp?: Int;
    status: 'open' | 'closed' | 'canceled' | Str;
    symbol: Str;
    type: Str;
    timeInForce?: Str;
    side: 'buy' | 'sell' | Str;
    price: Num;
    average?: Num;
    amount: Num;
    filled: Num;
    remaining: Num;
    stopPrice?: Num;
    triggerPrice?: Num;
    takeProfitPrice?: Num;
    stopLossPrice?: Num;
    cost: Num;
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
export interface OrderBooks extends Dictionary<OrderBook> {
}
export interface Ticker {
    symbol: Str;
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
    indexPrice: Num;
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
        };
        withdraw: {
            min?: Num;
            max?: Num;
        };
    };
    networks: Dictionary<any>;
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
    info: any;
    currency: Str;
    network?: Str;
    address: Str;
    tag?: Str;
}
export interface WithdrawalResponse {
    info: any;
    id: string;
}
export interface FundingRate {
    symbol: Str;
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
    symbol: Str;
    id?: Str;
    info: any;
    timestamp?: Int;
    datetime?: Str;
    contracts?: Num;
    contractSize?: Num;
    side: Str;
    notional?: Num;
    leverage?: Num;
    unrealizedPnl?: Num;
    realizedPnl?: Num;
    collateral?: Num;
    entryPrice?: Num;
    markPrice?: Num;
    liquidationPrice?: Num;
    marginMode?: Str;
    hedged?: Bool;
    maintenanceMargin?: Num;
    maintenanceMarginPercentage?: Num;
    initialMargin?: Num;
    initialMarginPercentage?: Num;
    marginRatio?: Num;
    lastUpdateTimestamp?: Int;
    lastPrice?: Num;
    stopLossPrice?: Num;
    takeProfitPrice?: Num;
    percentage?: Num;
}
export interface BorrowInterest {
    info: any;
    symbol?: Str;
    currency?: Str;
    interest?: Num;
    interestRate?: Num;
    amountBorrowed?: Num;
    marginMode?: Str;
    timestamp?: Int;
    datetime?: Str;
}
export interface LeverageTier {
    tier?: Num;
    symbol?: Str;
    currency?: Str;
    minNotional?: Num;
    maxNotional?: Num;
    maintenanceMarginRate?: Num;
    maxLeverage?: Num;
    info: any;
}
export interface LedgerEntry {
    info: any;
    id?: Str;
    timestamp?: Int;
    datetime?: Str;
    direction?: Str;
    account?: Str;
    referenceId?: Str;
    referenceAccount?: Str;
    type?: Str;
    currency?: Str;
    amount?: Num;
    before?: Num;
    after?: Num;
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
    timestamp?: Int;
    datetime?: Str;
    currency?: Str;
    amount?: Num;
    fromAccount?: Str;
    toAccount?: Str;
    status?: Str;
}
export interface CrossBorrowRate {
    info: any;
    currency?: Str;
    rate: Num;
    period?: Num;
    timestamp?: Int;
    datetime?: Str;
}
export interface IsolatedBorrowRate {
    info: any;
    symbol: Str;
    base: Str;
    baseRate: Num;
    quote: Str;
    quoteRate: Num;
    period?: Int;
    timestamp?: Int;
    datetime?: Str;
}
export interface FundingRateHistory {
    info: any;
    symbol: Str;
    fundingRate: Num;
    timestamp?: Int;
    datetime?: Str;
}
export interface OpenInterest {
    symbol: Str;
    openInterestAmount?: Num;
    openInterestValue?: Num;
    baseVolume?: Num;
    quoteVolume?: Num;
    timestamp?: Int;
    datetime?: Str;
    info: any;
}
export interface OpenInterests extends Dictionary<OpenInterest> {
}
export interface Liquidation {
    info: any;
    symbol: Str;
    timestamp?: Int;
    datetime?: Str;
    price: Num;
    baseValue?: Num;
    quoteValue?: Num;
    contracts?: Num;
    contractSize?: Num;
    side?: OrderSide;
}
export interface OrderRequest {
    symbol: string;
    type: OrderType;
    side: OrderSide;
    amount?: number;
    price?: number | undefined;
    params?: any;
}
export interface PredictionOrderRequest {
    outcome?: string;
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
    symbol: Str;
    code: Str;
    timestamp?: Int;
    datetime?: Str;
    id: Str;
    amount: Num;
}
export interface MarginMode {
    info: any;
    symbol: Str;
    marginMode: 'isolated' | 'cross' | Str;
}
export interface Greeks {
    symbol: Str;
    timestamp?: Int;
    datetime?: Str;
    delta: Num;
    gamma: Num;
    theta: Num;
    vega: Num;
    rho: Num;
    vanna?: Num;
    volga?: Num;
    charm?: Num;
    bidSize: Num;
    askSize: Num;
    bidImpliedVolatility: Num;
    askImpliedVolatility: Num;
    markImpliedVolatility: Num;
    bidPrice: Num;
    askPrice: Num;
    markPrice: Num;
    lastPrice: Num;
    underlyingPrice: Num;
    info: any;
}
export interface Conversion {
    info: any;
    timestamp?: Int;
    datetime?: Str;
    id: Str;
    fromCurrency: Str;
    fromAmount: Num;
    toCurrency: Str;
    toAmount: Num;
    price: Num;
    fee: Num;
}
export interface Option {
    info: any;
    currency: Str;
    symbol: Str;
    timestamp?: Int;
    datetime?: Str;
    impliedVolatility: Num;
    openInterest: Num;
    bidPrice: Num;
    askPrice: Num;
    midPrice: Num;
    markPrice: Num;
    lastPrice: Num;
    underlyingPrice: Num;
    change: Num;
    percentage: Num;
    baseVolume: Num;
    quoteVolume: Num;
}
export interface LastPrice {
    symbol: Str;
    timestamp?: Int;
    datetime?: Str;
    price: Num;
    side?: OrderSide;
    info: any;
}
export interface Leverage {
    info: any;
    symbol: Str;
    marginMode: 'isolated' | 'cross' | Str;
    longLeverage: Num;
    shortLeverage: Num;
}
export interface LongShortRatio {
    info: any;
    symbol: Str;
    timestamp?: Int;
    datetime?: Str;
    timeframe?: Str;
    longShortRatio: Num;
}
export interface ADL {
    info: any;
    symbol: Str;
    rank?: Int;
    rating?: Str;
    percentage?: Num;
    timestamp?: Int;
    datetime?: Str;
}
export interface MarginModification {
    'info': any;
    'symbol': Str;
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
export interface IsolatedBorrowRates extends Dictionary<IsolatedBorrowRate> {
}
export interface CrossBorrowRates extends Dictionary<CrossBorrowRate> {
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
interface BaseConstructorArgs {
    apiKey?: string;
    secret?: string;
    password?: string;
    privateKey?: string;
    walletAddress?: string;
    uid?: string;
    verbose?: boolean;
    sandbox?: boolean;
    testnet?: boolean;
    options?: Dict;
    enableRateLimit?: boolean;
    httpsProxy?: string;
    socksProxy?: string;
    wssProxy?: string;
    proxy?: string;
    rateLimit?: number;
    commonCurrencies?: Dict;
    userAgent?: string;
    userAgents?: Dict;
    timeout?: number;
    markets?: Dict;
    currencies?: Dict;
    hostname?: string;
    urls?: Dict;
    headers?: Dict;
}
export type ConstructorArgs = Partial<BaseConstructorArgs> & {
    [key: string]: any;
};
export {};
