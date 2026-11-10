package io.github.ccxt.types;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Level 3 order book: every row is [ price (Double), amount (Double), orderId (String) ].
 */
public final class OrderBookL3 extends TypedMap {
    public List<List<Object>> bids;
    public List<List<Object>> asks;
    public String symbol;
    public Long timestamp;
    public String datetime;
    public Long nonce;

    public OrderBookL3(Object raw) {
        super(raw);
        Map<String, Object> data = TypeHelper.toMap(raw);
        if (data == null) {
            this.bids = new ArrayList<>();
            this.asks = new ArrayList<>();
            return;
        }
        this.bids = parseEntries(data.get("bids"));
        this.asks = parseEntries(data.get("asks"));
        this.symbol = TypeHelper.safeString(data, "symbol");
        this.timestamp = TypeHelper.safeInteger(data, "timestamp");
        this.datetime = TypeHelper.safeString(data, "datetime");
        this.nonce = TypeHelper.safeInteger(data, "nonce");
    }

    @SuppressWarnings("unchecked")
    private static List<List<Object>> parseEntries(Object raw) {
        if (!(raw instanceof List<?>)) return new ArrayList<>();
        List<Object> entries = (List<Object>) raw;
        List<List<Object>> result = new ArrayList<>(entries.size());
        for (Object entry : entries) {
            if (!(entry instanceof List<?>)) continue;
            List<Object> row = (List<Object>) entry;
            List<Object> parsed = new ArrayList<>(3);
            parsed.add(toDouble(row.size() > 0 ? row.get(0) : null));
            parsed.add(toDouble(row.size() > 1 ? row.get(1) : null));
            Object orderId = row.size() > 2 ? row.get(2) : null;
            parsed.add(orderId == null ? null : String.valueOf(orderId));
            result.add(parsed);
        }
        return result;
    }

    private static Double toDouble(Object val) {
        if (val instanceof Number n) return n.doubleValue();
        if (val == null) return null;
        try { return Double.parseDouble(String.valueOf(val)); } catch (Exception e) { return null; }
    }
}
