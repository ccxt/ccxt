export interface Dictionary<T> {
    [key: string]: T;
}
/** Request parameters */
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
        amount: number | undefined;
        price: number | undefined;
    };
    limits: {
        amount?: MinMax;
        cost?: MinMax;
        leverage?: MinMax;
        price?: MinMax;
    };
    info: any;
}
export interface Trade {
    amount: number;
    datetime: string;
    id: string;
    info: any;
    order?: string;
    price: number;
    timestamp: number;
    type?: string;
    side: 'buy' | 'sell' | string;
    symbol: string;
    takerOrMaker: 'taker' | 'maker' | string;
    cost: number;
    fee: Fee;
}
export interface Order {
    id: string;
    clientOrderId: string;
    datetime: string;
    timestamp: number;
    lastTradeTimestamp: number;
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
/** [ timestamp, open, high, low, close, volume ] */
export declare type OHLCV = [number, number, number, number, number, number];
/** [ timestamp, open, high, low, close, volume, count ] */
export declare type OHLCVC = [number, number, number, number, number, number, number];
export declare type implicitReturnType = any;
export declare type IndexType = number | string;
export declare type Int = number;
export declare type OrderSide = 'buy' | 'sell' | string;
export declare type OrderType = 'limit' | 'market' | string;
