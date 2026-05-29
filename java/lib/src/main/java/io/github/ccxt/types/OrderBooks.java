package io.github.ccxt.types;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.NoSuchElementException;

public final class OrderBooks {
    public Map<String, OrderBook> orderBooks;

    @SuppressWarnings("unchecked")
    public OrderBooks(Object raw) {
        Map<String, Object> data = TypeHelper.toMap(raw);
        this.orderBooks = new LinkedHashMap<>();
        for (Map.Entry<String, Object> entry : data.entrySet()) {
            this.orderBooks.put(entry.getKey(), new OrderBook(entry.getValue()));
        }
    }

    public OrderBook get(String key) {
        OrderBook ob = orderBooks.get(key);
        if (ob == null) throw new NoSuchElementException("Key not found: " + key);
        return ob;
    }
}
