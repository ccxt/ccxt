export interface MinMax {
    min: number | undefined;
    max: number | undefined;
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

export interface OrderBook {
    symbol: string;
    asks: [number, number][];
    bids: [number, number][];
    datetime: string;
    timestamp: number;
    nonce: number;
}

export interface Fee {
    type?: 'taker' | 'maker';
    currency: string;
    rate?: number | string;
    cost: number | string;
}

export interface Trade {
    amount: number | string;
    datetime: string;
    id: string;
    info: any;
    order?: string;
    price: number| string;
    timestamp: number;
    type?: string;
    side: 'buy' | 'sell' | string; // tmp
    symbol: string;
    takerOrMaker: 'taker' | 'maker' | string; // tmp
    cost: number | string;
    fee: Fee;
    fees?: Fee[];
}
