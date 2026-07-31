package io.github.ccxt.types;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

// Native dedicated prediction-market type. Standalone typed mirror (does NOT extend OrderBook); holds its own copy of the base
// fields (flat typed access) and adds the prediction identity
// fields. Identity is the `outcome` handle ("MARKET:LABEL"), no symbol. Mirrors the standalone
// `PredictionOrderBook` interface in ts/src/base/types.ts.
public final class PredictionOrderBook {
    public List<List<Double>> bids;
    public List<List<Double>> asks;
    public Long timestamp;
    public String datetime;
    public Long nonce;
    // prediction-specific
    public String outcome;
    public String outcomeId;
    public String market;
    public Map<String, Object> info;

    @SuppressWarnings("unchecked")
    public PredictionOrderBook(Object raw) {
        Map<String, Object> data = TypeHelper.toMap(raw);
        this.bids = parseEntries(data.get("bids"));
        this.asks = parseEntries(data.get("asks"));
        this.timestamp = TypeHelper.safeInteger(data, "timestamp");
        this.datetime = TypeHelper.safeString(data, "datetime");
        this.nonce = TypeHelper.safeInteger(data, "nonce");
        this.outcome = TypeHelper.safeString(data, "outcome");
        this.outcomeId = TypeHelper.safeString(data, "outcomeId");
        this.market = TypeHelper.safeString(data, "market");
        this.info = TypeHelper.getInfo(data);
    }

    @SuppressWarnings("unchecked")
    private static List<List<Double>> parseEntries(Object raw) {
        if (raw == null) return new ArrayList<>();
        List<Object> entries = (List<Object>) raw;
        List<List<Double>> result = new ArrayList<>(entries.size());
        for (Object entry : entries) {
            List<Object> pair = (List<Object>) entry;
            List<Double> parsed = new ArrayList<>(pair.size());
            for (Object val : pair) {
                if (val instanceof Number n) {
                    parsed.add(n.doubleValue());
                } else if (val != null) {
                    try { parsed.add(Double.parseDouble(String.valueOf(val))); } catch (Exception e) { parsed.add(null); }
                } else {
                    parsed.add(null);
                }
            }
            result.add(parsed);
        }
        return result;
    }
}
