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
    symbol: string;
    base: string;
    quote: string;
    baseId: string;
    quoteId: string;
    active?: boolean | undefined;
    type?: string;
    spot?: boolean;
    margin?: boolean;
    swap?: boolean;
    future?: boolean;
    option?: boolean;
    contract?: boolean;
    settle?: string | undefined;
    settleId?: string | undefined;
    contractSize?: number | undefined;
    linear?: boolean | undefined;
    inverse?: boolean | undefined;
    expiry?: number | undefined;
    expiryDatetime?: string | undefined;
    strike?: number | undefined;
    optionType?: string | undefined;
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
    info: any;
}

export interface Trade {
    amount: number;                  // amount of base currency
    datetime: string;                // ISO8601 datetime with milliseconds;
    id: string;                      // string trade id
    info: any;                        // the original decoded JSON as is
    order?: string;                  // string order id or undefined/None/null
    price: number;                   // float price in quote currency
    timestamp: number;               // Unix timestamp in milliseconds
    type?: string;                   // order type, 'market', 'limit', ... or undefined/None/null
    side: 'buy' | 'sell' | string;            // direction of the trade, 'buy' or 'sell'
    symbol: string;                  // symbol in CCXT format
    takerOrMaker: 'taker' | 'maker' | string; // string, 'taker' or 'maker'
    cost: number;                    // total cost (including fees), `price * amount`
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
    datetime: string;
    timestamp: number;
    nonce: number;
}

export interface Ticker {
    symbol: string;
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

export interface Transaction {
    info: any;
    id: string;
    txid?: string;
    timestamp: number;
    datetime: string;
    address: string;
    type: 'deposit' | 'withdrawal' | string;
    amount: number;
    currency: string;
    status: 'pending' | 'ok' | string;
    updated: number;
    fee: Fee;
}

export interface Tickers extends Dictionary<Ticker> {
    info: any;
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
    contractsSize?: number;
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

/** [ timestamp, open, high, low, close, volume ] */
export type OHLCV = [number, number, number, number, number, number];

/** [ timestamp, open, high, low, close, volume, count ] */
export type OHLCVC = [number, number, number, number, number, number, number];

export type implicitReturnType = any;

// must be an integer in other langs
export type IndexType = number | string;

export type Int = number;

export type OrderSide = 'buy' | 'sell' | string;

export type OrderType = 'limit' | 'market' | string;
