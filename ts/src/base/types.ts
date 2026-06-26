export type Int = number | undefined;
export type int = number;
export type Str = string | undefined;
export type Strings = string[] | undefined;
export type Num = number | undefined;
export type Bool = boolean | undefined;
// must be an integer in other langs
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

export type Fee = FeeInterface | undefined;

export interface MarketMarginModes {
    isolated: boolean;
    cross: boolean;
}

export interface Precision {
    amount: Num
    price: Num
    cost?: Num
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
    taker?: Num
    maker?: Num
    percentage?: Bool;
    tierBased?: Bool;
    feeSide?: Str;
    precision: Precision;
    marginModes?: MarketMarginModes;
    limits: {
        amount?: MinMax,
        cost?: MinMax,
        leverage?: MinMax,
        price?: MinMax,
        market?: MinMax,
    };
    created: Int;
    info: any;
    outcomes?: PredictionOutcome[];
}

// Prediction-market structures (ccxt.prediction namespace).
// Hierarchy: Event -> Market -> Outcome. The Outcome is the tradeable unit; there is
// no `symbol` field — the handle is `outcome` ("MARKET:LABEL") and the raw exchange id
// is `outcomeId`. Prices are probabilities 0..1, amounts are shares, costs are collateral.

export interface PredictionFees {
    trading?: Num;       // per-trade taker/maker rate (fraction, e.g. 0.02 = 2%)
    resolution?: Num;    // fee taken from winnings at settlement (fraction)
}

export interface PredictionEvent {
    info: any;
    id: string;                  // raw exchange event id
    event: string;               // unified handle "US_ELECTION_2024"
    title?: Str;
    description?: Str;
    slug?: Str;
    category?: Str;
    tags?: string[];
    markets: PredictionMarket[]; // grouped markets (does not re-derive outcomes)
    mutuallyExclusive?: Bool;    // exactly one market in the event resolves YES
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
    id: string;                  // raw exchange market id
    market: string;              // unified handle "TRUMP_WIN_2024"
    event?: Str;
    marketType: 'binary' | 'categorical' | 'scalar' | Str;
    executionModel?: 'clob' | 'amm' | 'parimutuel' | Str;
    title?: Str;
    description?: Str;
    outcomes: PredictionOutcome[];   // 1..N (categorical can be > 2)
    underlying?: Str;            // scalar only
    floorStrike?: Num;           // scalar only
    capStrike?: Num;             // scalar only
    strikeType?: Str;            // scalar only
    collateral?: Str;            // quote currency symbol (USDC / USD1 / USD / ...)
    active?: Bool;
    closed?: Bool;
    resolved?: Bool;
    resolvedOutcome?: Str;       // winning outcome handle
    settlementValue?: Num;       // scalar: the realized number
    created?: Int;
    createdDatetime?: Str;
    end?: Int;
    endDatetime?: Str;
    volume?: Num;
    liquidity?: Num;
    openInterest?: Num;
    tickSize?: Num;
    limits?: { amount?: MinMax, cost?: MinMax };
    fees?: PredictionFees;
    resolutionSource?: Str;
    image?: Str;
}

export interface PredictionOutcome {
    info: any;
    outcome: string;             // unified handle "TRUMP_WIN_2024:YES" — round-trips; ex.outcomes key
    outcomeId?: Str;             // raw exchange/on-chain id (token id / ticker / coin)
    label?: Str;                 // short human name "Yes"
    market?: Str;                // parent market handle
    marketId?: Str;
    event?: Str;
    price?: Num;                 // probability 0..1
    bid?: Num;
    ask?: Num;
    active?: Bool;
    winner?: Bool;               // resolved true (the settleFraction === 1 case)
    settleFraction?: Num;        // 0..1 fractional settlement
    precision?: Precision;       // outcome-level price/amount precision
}

// Prediction trading structures extend their base unified types so they stay
// covariantly assignable (parse/fetch overrides type-check without casts) and map
// 1:1 onto the native structs in Go/C#/Java (embed/inherit the base struct, add the
// prediction fields). The inherited `symbol` is left unpopulated — `outcome` (the
// "MARKET:LABEL" handle) is the canonical identity; price = probability 0..1,
// amount = shares, cost = collateral.
export interface PredictionOrder extends Order {
    outcome: string;             // handle "TRUMP_WIN_2024:YES"
    outcomeId?: Str;
    label?: Str;
    market?: Str;
    event?: Str;
    trades: PredictionTrade[];
}

export interface PredictionTrade extends Trade {
    outcome: string;
    outcomeId?: Str;
    label?: Str;
    market?: Str;
    realizedPnl?: Num;
}

export interface PredictionPosition extends Position {
    outcome: string;
    outcomeId?: Str;
    label?: Str;
    market?: Str;
    event?: Str;

    resolved?: Bool;
    won?: Bool;
    settleFraction?: Num;
    payout?: Num;                // claimable collateral after resolution
}

export interface PredictionTicker extends Ticker {
    outcome: string;
    outcomeId?: Str;
    label?: Str;
    market?: Str;
    event?: Str;
    openInterest?: Num;
}

export interface PredictionOrderBook extends OrderBook {
    outcome: string;             // required — books are per-outcome
    outcomeId?: Str;
    market?: Str;
}

export interface PredictionTickers extends Dictionary<PredictionTicker> {
}

export interface PredictionTradingFee extends TradingFeeInterface {
    outcome: string;
    outcomeId?: Str;
    market?: Str;
}

export interface PredictionOpenInterest extends OpenInterest {
    outcome: string;
    outcomeId?: Str;
    market?: Str;
}

// extra params accepted by fetchEvents on prediction exchanges; the [key] index
// signature keeps it open for exchange-specific passthrough params
export interface fetchEventsParams {
    query?: string;       // keyword search
    limit?: number;       // max number of events to return
    sort?: 'volume' | 'liquidity' | 'newest';
    status?: 'active' | 'inactive' | 'closed' | 'all'; // default 'active'; 'inactive' and 'closed' are interchangeable
    searchIn?: 'title' | 'description' | 'both';
    eventId?: string;     // direct lookup by event id
    slug?: string;        // lookup by event slug
    [key: string]: any;
}

export interface Trade {
    info: any;                        // the original decoded JSON as is
    amount: Num;                  // amount of base currency
    datetime: Str;                // ISO8601 datetime with milliseconds;
    id: Str;                      // string trade id
    order: Str;                  // string order id or undefined/None/null
    price: Num;                   // float price in quote currency
    timestamp: Int;               // Unix timestamp in milliseconds
    type: Str;                   // order type, 'market', 'limit', ... or undefined/None/null
    side: 'buy' | 'sell' | Str;            // direction of the trade, 'buy' or 'sell'
    symbol: Str;                  // symbol in CCXT format
    takerOrMaker: 'taker' | 'maker' | Str; // string, 'taker' or 'maker'
    cost: Num;                    // total cost (including fees), `price * amount`
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
    networks: Dictionary<any>,
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
    withdraw?: DepositWithdrawFeeNetwork,
    deposit?: DepositWithdrawFeeNetwork,
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
    info: any,
    symbol: Str,
    base: Str,
    baseRate: Num,
    quote: Str,
    quoteRate: Num,
    period?: Int,
    timestamp?: Int,
    datetime?: Str,
}

export interface FundingRateHistory {
    info: any;
    symbol: Str;
    fundingRate: Num;
    timestamp?: Int
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
    timestamp?: Int
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

export interface CancellationRequest {
    id: string;
    clientOrderId?: string;
    symbol: string;
}

export interface FundingHistory {
    info: any;
    symbol: Str;
    code: Str;
    timestamp?: Int
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
    timestamp?: Int
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
    timestamp?: Int
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
    timestamp?: Int
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
    symbol: Str,
    timestamp?: Int,
    datetime?: Str,
    price: Num,
    side?: OrderSide,
    info: any,
}

export interface Leverage {
    info: any;
    symbol: Str;
    marginMode: 'isolated' | 'cross' | Str;
    longLeverage: Num;
    shortLeverage: Num;
}

export interface LongShortRatio {
    info: any,
    symbol: Str,
    timestamp?: Int,
    datetime?: Str,
    timeframe?: Str,
    longShortRatio: Num,
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
    'info': any,
    'symbol': Str,
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
    sandbox?: boolean; // redundant with testnet but kept for backward compatibility
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
    hostname?: string
    urls?: Dict;
    headers?: Dict;
}

export type ConstructorArgs = Partial<BaseConstructorArgs> & {
    [key: string]: any;
};
