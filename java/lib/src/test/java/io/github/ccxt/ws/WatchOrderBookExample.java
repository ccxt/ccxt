package io.github.ccxt.ws;

import io.github.ccxt.Exchange;
import io.github.ccxt.Helpers;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

public class WatchOrderBookExample {
    static Exchange exchange;

    @SuppressWarnings("unchecked")
    public static void main(String[] args) throws Exception {
        Map<String, Object> config = new HashMap<>();
        config.put("apiKey", System.getenv("BINANCE_APIKEY"));
        config.put("secret", System.getenv("BINANCE_SECRET"));
        exchange = new io.github.ccxt.exchanges.pro.Binance(config);
        exchange.verbose = false;
        ((io.github.ccxt.exchanges.Binance) exchange).enableDemoTrading(true);

        System.out.println("Loading markets...");
        exchange.loadMarkets().get(60, TimeUnit.SECONDS);
        System.out.println("Markets loaded.\n");

        // Use spot for createOrderWs (demo ws-api only supports spot)
        String symbol = "BTC/USDT";

        // ── Step 1: Start watching orders in background ──
        System.out.println("═══ Step 1: Start watchOrders in background ═══");
        CompletableFuture<Object> watchFuture = (CompletableFuture<Object>) Helpers.callDynamically(
                exchange, "watchOrders", new Object[]{symbol});
        System.out.println("  watchOrders subscribed, waiting for user stream...\n");
        Thread.sleep(3000); // give time for user stream to connect

        // ── Step 2: Get current price for limit order ──
        System.out.println("═══ Step 2: Get current price ═══");
        double lastPrice = 0;
        try {
            // Use WS ticker which we know works
            Object ticker = watch("watchTicker", symbol);
            if (ticker instanceof Map t) {
                Object last = t.get("last");
                if (last instanceof Number n) lastPrice = n.doubleValue();
                else if (last instanceof String s) lastPrice = Double.parseDouble(s);
            }
        } catch (Exception e) {
            lastPrice = 66000; // fallback
        }
        System.out.printf("  %s last price: %.2f%n%n", symbol, lastPrice);

        // Place limit buy well below market (won't fill, just creates an order)
        double orderPrice = Math.round(lastPrice * 0.90 * 100.0) / 100.0; // 10% below market
        double amount = 0.002; // enough to meet $100 notional minimum

        // ── Step 3: Create order via WS API ──
        System.out.println("═══ Step 3: Create limit buy order via createOrderWs ═══");
        System.out.printf("  symbol=%s side=buy price=%.2f amount=%.4f%n", symbol, orderPrice, amount);
        String orderId = null;
        try {
            Object order = watch("createOrderWs", symbol, "limit", "buy", amount, orderPrice);
            if (order instanceof Map o) {
                orderId = o.get("id") != null ? o.get("id").toString() : null;
                System.out.printf("  Order created via WS API! id=%s status=%s%n", o.get("id"), o.get("status"));
                System.out.printf("  type=%s side=%s price=%s amount=%s%n%n",
                        o.get("type"), o.get("side"), o.get("price"), o.get("amount"));
            }
        } catch (Exception e) {
            Throwable cause = e; while (cause.getCause() != null) cause = cause.getCause();
            System.out.println("  createOrderWs error: " + cause.getMessage());
            System.out.println("  Falling back to REST createOrder...");
            try {
                Object order = watch("createOrder", symbol, "limit", "buy", amount, orderPrice);
                if (order instanceof Map o) {
                    orderId = o.get("id") != null ? o.get("id").toString() : null;
                    System.out.printf("  Order created via REST! id=%s status=%s%n%n", o.get("id"), o.get("status"));
                }
            } catch (Exception e2) {
                Throwable c2 = e2; while (c2.getCause() != null) c2 = c2.getCause();
                System.out.println("  REST error: " + c2.getMessage() + "\n");
            }
        }

        // ── Step 4: Wait for order to appear in watchOrders ──
        System.out.println("═══ Step 4: Wait for order in watchOrders ═══");
        try {
            Object result = watchFuture.get(15, TimeUnit.SECONDS);
            while (result instanceof CompletableFuture<?> cf) result = cf.get(15, TimeUnit.SECONDS);
            if (result instanceof List orders && !orders.isEmpty()) {
                System.out.println("  Got " + orders.size() + " order update(s)!");
                for (Object o : orders) {
                    if (o instanceof Map order) {
                        System.out.printf("  id=%s symbol=%s type=%s side=%s status=%s price=%s amount=%s%n",
                                order.get("id"), order.get("symbol"), order.get("type"),
                                order.get("side"), order.get("status"), order.get("price"), order.get("amount"));
                    }
                }
            } else {
                System.out.println("  Result: " + (result != null ? result.getClass().getSimpleName() : "null"));
            }
        } catch (java.util.concurrent.TimeoutException e) {
            System.out.println("  No order updates received within 15s");
        } catch (Exception e) {
            Throwable c = e; while (c.getCause() != null) c = c.getCause();
            System.out.println("  Error: " + c.getMessage());
        }

        // ── Step 5: Cancel all open orders ──
        System.out.println("\n═══ Step 5: Cancel open orders ═══");
        try {
            Object cancelled = watch("cancelAllOrders", symbol);
            System.out.println("  Orders cancelled");
        } catch (Exception e) {
            Throwable c = e; while (c.getCause() != null) c = c.getCause();
            System.out.println("  Cancel: " + c.getMessage());
        }

        System.out.println("\nDone!");
        System.exit(0);
    }

    static Object watch(String method, Object... a) throws Exception {
        CompletableFuture<Object> f = (CompletableFuture<Object>) Helpers.callDynamically(exchange, method, a);
        Object r = f.get(30, TimeUnit.SECONDS);
        while (r instanceof CompletableFuture<?> cf) r = cf.get(30, TimeUnit.SECONDS);
        return r;
    }
}
