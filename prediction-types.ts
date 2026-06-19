// =============================================================================
// CCXT Prediction-Market unified types
// =============================================================================
// Dedicated types for the ccxt.prediction namespace (not the spot/derivatives
// Order/Trade/Position). The tradeable unit is an OUTCOME, so there is no
// `symbol` field — the handle is `outcome`.
//
// Hierarchy:   Event  (1) ──▶ (N) Market  (1) ──▶ (N) Outcome
//              Outcome is the tradeable unit; Order/Trade/Position/Ticker/
//              OrderBook all reference an Outcome by its `outcome` handle.
//
// Conventions (normalized in every parser):
//   price / bid / ask / last  = PROBABILITY 0..1
//   amount / contracts        = SHARES
//   cost / notional / payout  = COLLATERAL in the quote currency
//   side                      = 'buy' | 'sell' of an outcome (YES/NO is in the handle)
//
// Identity:
//   outcome    -> unified handle "MARKET:LABEL" (round-trips into every method; ex.outcomes key)
//   outcomeId  -> raw exchange/on-chain id (token id / ticker / coin) — stable, used internally
//   label      -> short human name ("Yes" / "Trump")
//   market     -> parent market handle
//   event      -> parent event handle
// -----------------------------------------------------------------------------

import type { Str, Num, Int, Bool, Fee } from './ts/src/base/types.js';

export interface MinMax { min?: Num; max?: Num }

export interface PredictionFees {
    trading?: Num;      // per-trade taker/maker rate (fraction, e.g. 0.02 = 2%)
    resolution?: Num;   // fee taken from winnings at settlement (fraction)
}

// ---------------------------------------------------------------------------
// Reference structures — Event ▶ Market ▶ Outcome
// ---------------------------------------------------------------------------

export interface PredictionEvent {
    info: any;
    id: string;                     // raw exchange event id
    event: string;                  // unified event handle "US_ELECTION_2024"
    title?: Str;
    description?: Str;
    slug?: Str;
    category?: Str;
    tags?: string[];
    markets: PredictionMarket[];    // grouped markets (does NOT re-derive outcomes)
    mutuallyExclusive?: Bool;       // exactly one market in the event resolves YES
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
    id: string;                                       // raw exchange market id
    market: string;                                   // unified market handle "TRUMP_WIN_2024"
    event?: Str;                                      // parent event handle
    marketType: 'binary' | 'categorical' | 'scalar'; // never assume binary
    executionModel?: 'clob' | 'amm' | 'parimutuel';  // AMM/parimutuel have no resting book
    title?: Str;
    description?: Str;
    outcomes: PredictionOutcome[];                    // 1..N (categorical can be > 2)
    // scalar / range markets only:
    underlying?: Str;
    floorStrike?: Num;
    capStrike?: Num;
    strikeType?: Str;                                 // greater | less | between | functional | ...
    collateral?: Str;                                 // quote currency symbol (USDC / USD1 / USD / ...)
    active?: Bool;
    closed?: Bool;
    resolved?: Bool;
    resolvedOutcome?: Str;                            // winning outcome handle (when resolved)
    settlementValue?: Num;                            // scalar: the realized number (e.g. CPI = 2.7)
    created?: Int;
    createdDatetime?: Str;
    end?: Int;                                        // expiration / close (ms)
    endDatetime?: Str;
    volume?: Num;                                     // quote-currency volume
    liquidity?: Num;
    openInterest?: Num;
    tickSize?: Num;                                   // min price increment (probability)
    limits?: { amount?: MinMax; cost?: MinMax };      // min/max order size + notional
    fees?: PredictionFees;                            // trading + resolution fees
    resolutionSource?: Str;
    image?: Str;
}

export interface PredictionOutcome {
    info: any;
    outcome: string;            // unified handle "TRUMP_WIN_2024:YES" — round-trips; ex.outcomes key
    outcomeId?: Str;            // raw exchange/on-chain id (token id / ticker / coin)
    label?: Str;                // short human name "Yes"
    market?: Str;               // parent market handle
    marketId?: Str;
    event?: Str;                // parent event handle
    price?: Num;                // current probability 0..1
    bid?: Num;
    ask?: Num;
    active?: Bool;
    winner?: Bool;              // resolved true (the settleFraction === 1 case)
    settleFraction?: Num;       // 0..1 fractional settlement (binary settles to 0 or 1)
}

// ---------------------------------------------------------------------------
// Trading structures — each references an Outcome via its `outcome` handle
// ---------------------------------------------------------------------------

export interface PredictionOrder {
    info: any;
    id: string;                 // order id
    clientOrderId?: Str;
    timestamp: Int;
    datetime: Str;
    status: 'open' | 'closed' | 'canceled' | 'expired' | Str;
    outcome: string;            // handle "TRUMP_WIN_2024:YES"
    outcomeId?: Str;            // raw id
    label?: Str;                // "Yes"
    market?: Str;
    event?: Str;
    side: 'buy' | 'sell';
    type?: Str;                 // 'limit' | 'market'
    timeInForce?: Str;          // GTC | FOK | GTD | FAK
    price: Num;                 // probability 0..1
    amount: Num;                // shares
    filled: Num;
    remaining: Num;
    average?: Num;              // avg fill probability
    cost: Num;                  // collateral (price * amount)
    currency?: Str;             // collateral currency
    fee?: Fee;
    trades?: PredictionTrade[];
}

export interface PredictionTrade {
    info: any;
    id: Str;
    order?: Str;
    timestamp: Int;
    datetime: Str;
    outcome: string;
    outcomeId?: Str;
    label?: Str;
    market?: Str;
    side: 'buy' | 'sell';
    takerOrMaker?: 'taker' | 'maker' | Str;
    price: Num;                 // probability 0..1
    amount: Num;                // shares
    cost: Num;                  // collateral
    currency?: Str;
    fee?: Fee;
    realizedPnl?: Num;          // when the venue reports it
}

export interface PredictionPosition {
    info: any;
    id?: Str;
    outcome: string;
    outcomeId?: Str;
    label?: Str;
    market?: Str;
    event?: Str;
    oppositeOutcome?: Str;      // complementary leg handle (NO when you hold YES)
    timestamp?: Int;
    datetime?: Str;
    side: 'long';               // you hold shares; "short YES" = "long NO" (a different outcome)
    contracts: Num;             // shares held
    entryPrice?: Num;           // avg entry probability
    markPrice?: Num;            // current probability
    notional?: Num;             // current value in quote
    cost?: Num;                 // collateral spent to acquire
    currency?: Str;             // collateral currency (required for cross-market P&L)
    unrealizedPnl?: Num;
    realizedPnl?: Num;
    percentage?: Num;           // ROI %
    // resolution
    resolved?: Bool;
    won?: Bool;
    settleFraction?: Num;       // 0..1
    payout?: Num;               // claimable collateral after resolution (net of resolution fee)
}

export interface PredictionTicker {
    info: any;
    outcome: string;
    outcomeId?: Str;
    label?: Str;
    market?: Str;
    event?: Str;
    timestamp: Int;
    datetime: Str;
    bid?: Num;
    bidVolume?: Num;
    ask?: Num;
    askVolume?: Num;
    last?: Num;                 // probability 0..1
    close?: Num;                // mid
    average?: Num;
    previousClose?: Num;
    change?: Num;
    percentage?: Num;
    baseVolume?: Num;           // shares traded
    quoteVolume?: Num;          // collateral volume
    openInterest?: Num;
}

export interface PredictionOrderBook {
    outcome: string;            // required — books are always per-outcome
    outcomeId?: Str;
    market?: Str;
    bids: [Num, Num][];         // [probability 0..1, shares]
    asks: [Num, Num][];
    timestamp: Int;
    datetime: Str;
    nonce?: Int;
}
