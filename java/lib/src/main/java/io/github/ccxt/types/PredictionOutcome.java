package io.github.ccxt.types;

import java.util.Map;

// Native dedicated prediction-market type. The Outcome is the tradeable unit;
// there is no `symbol` field — the handle is `outcome` ("MARKET:LABEL") and the
// raw exchange id is `outcomeId`. Prices are probabilities 0..1. Mirrors the
// `PredictionOutcome` interface in ts/src/base/types.ts and the Go/C# structs.
public final class PredictionOutcome {
    public String outcome;        // unified handle "TRUMP_WIN_2024:YES"
    public String outcomeId;      // raw exchange/on-chain id (token id / ticker / coin)
    public String label;          // short human name "Yes"
    public String market;         // parent market handle
    public String marketId;
    public String eventId;
    public Double price;          // probability 0..1
    public Double bid;
    public Double ask;
    public Boolean active;
    public Boolean winner;        // resolved true (the settleFraction == 1 case)
    public Double settleFraction; // 0..1 fractional settlement
    public Precision precision;   // outcome-level price/amount precision
    public Map<String, Object> info;

    public PredictionOutcome(Object raw) {
        Map<String, Object> data = TypeHelper.toMap(raw);
        this.outcome = TypeHelper.safeString(data, "outcome");
        this.outcomeId = TypeHelper.safeString(data, "outcomeId");
        this.label = TypeHelper.safeString(data, "label");
        this.market = TypeHelper.safeString(data, "market");
        this.marketId = TypeHelper.safeString(data, "marketId");
        this.eventId = TypeHelper.safeString(data, "event");
        this.price = TypeHelper.safeFloat(data, "price");
        this.bid = TypeHelper.safeFloat(data, "bid");
        this.ask = TypeHelper.safeFloat(data, "ask");
        this.active = TypeHelper.safeBool(data, "active");
        this.winner = TypeHelper.safeBool(data, "winner");
        this.settleFraction = TypeHelper.safeFloat(data, "settleFraction");
        Object precisionRaw = TypeHelper.safeValue(data, "precision");
        this.precision = precisionRaw != null ? new Precision(precisionRaw) : null;
        this.info = TypeHelper.getInfo(data);
    }
}
