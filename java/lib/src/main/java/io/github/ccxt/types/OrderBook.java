package io.github.ccxt.types;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public final class OrderBook {
    // Levels are [price, amount] rows normalized to Double (C# OrderBook parity:
    // Convert.ToDouble over each cell); a source row's optional third cell (count/id)
    // is normalized the same way. A cell that is absent or unparseable stays null —
    // never fabricated to 0.
    public List<List<Double>> bids;
    public List<List<Double>> asks;
    public String symbol;
    public Long timestamp;
    public String datetime;
    public Long nonce;
    // Lossless inverse support (see build/typeEmitters/java.ts#renderInterface):
    // TypedCores.fromOrderBook() hands this back, never a field-set rebuild.
    public final Object __raw;

    @SuppressWarnings("unchecked")
    public OrderBook(Object raw) {
        this.__raw = raw;
        // Handle WsOrderBook (WebSocket) — extract data directly from its typed fields
        // Handle WsOrderBook (WebSocket) — copy live data from its OrderBookSide fields
        if (raw instanceof io.github.ccxt.ws.WsOrderBook wsOb) {
            // WsOrderBook.bids/asks are OrderBookSide (extends ArrayList<List<Object>>)
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

    private static List<List<Double>> parseEntries(Object raw) {
        if (!(raw instanceof List<?> entries)) return new ArrayList<>();
        List<List<Double>> result = new ArrayList<>(entries.size());
        for (Object entry : entries) {
            if (!(entry instanceof List<?> pair)) {
                // wrong-shaped level: keep the position, drop the value (TS has no cast to throw on)
                result.add(null);
                continue;
            }
            List<Double> parsed = new ArrayList<>(pair.size());
            for (Object val : pair) {
                parsed.add(TypeHelper.toDouble(val));
            }
            result.add(parsed);
        }
        return result;
    }
}
