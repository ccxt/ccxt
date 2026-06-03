package io.github.ccxt.types;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public final class OrderBook {
    public List<List<Double>> bids;
    public List<List<Double>> asks;
    public String symbol;
    public Long timestamp;
    public String datetime;
    public Long nonce;

    @SuppressWarnings("unchecked")
    public OrderBook(Object raw) {
        // Handle WsOrderBook (WebSocket) — extract data directly from its typed fields
        // Handle WsOrderBook (WebSocket) — copy live data from its OrderBookSide fields
        if (raw instanceof io.github.ccxt.ws.WsOrderBook wsOb) {
            // WsOrderBook.bids/asks are OrderBookSide (extends ArrayList<Object>)
            // Each element is a List<Object> [price, amount]
            // Copy them via parseEntries which converts to List<List<Double>>
            this.bids = parseEntries(new java.util.ArrayList<>(wsOb.bids));
            this.asks = parseEntries(new java.util.ArrayList<>(wsOb.asks));
            this.symbol = wsOb.symbol;
            this.timestamp = (wsOb.timestamp instanceof Number n) ? n.longValue() : null;
            this.datetime = (wsOb.datetime instanceof String s) ? s : null;
            this.nonce = (wsOb.nonce instanceof Number n) ? n.longValue() : null;
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
