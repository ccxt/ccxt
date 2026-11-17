package io.github.ccxt.types;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public final class OrderBook extends TypedMap {
    public List<List<Double>> bids;
    public List<List<Double>> asks;
    public String symbol;
    public Long timestamp;
    public String datetime;
    public Long nonce;

    @SuppressWarnings("unchecked")
    public OrderBook(Object raw) {
        super(raw);
        // Handle WsOrderBook (WebSocket) — read its published record, not the live sides
        if (raw instanceof io.github.ccxt.ws.WsOrderBook wsOb) {
            // read the book's published record, never its live sides: this runs on the caller's
            // thread while the ws owner thread keeps applying deltas
            Map<String, Object> published = wsOb.toMap();
            this.bids = parseEntries(published.get("bids"));
            this.asks = parseEntries(published.get("asks"));
            this.symbol = (published.get("symbol") instanceof String s) ? s : null;
            this.timestamp = (published.get("timestamp") instanceof Number n) ? n.longValue() : null;
            this.datetime = (published.get("datetime") instanceof String s) ? s : null;
            this.nonce = (published.get("nonce") instanceof Number n) ? n.longValue() : null;
            return;
        }
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
