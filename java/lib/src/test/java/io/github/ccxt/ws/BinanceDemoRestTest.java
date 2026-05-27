package io.github.ccxt.ws;

import io.github.ccxt.Exchange;
import io.github.ccxt.Helpers;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

/**
 * Comprehensive Binance REST test against demo/sandbox.
 * Run with: BINANCE_APIKEY=xxx BINANCE_SECRET=yyy ./gradlew :lib:restTest
 */
public class BinanceDemoRestTest {

    static Exchange exchange;
    static final String SYMBOL = "BTC/USDT";
    static final int TIMEOUT_SEC = 30;
    static int passed = 0;
    static int failed = 0;
    static int skipped = 0;

    public static void main(String[] args) throws Exception {
        String apiKey = System.getenv("BINANCE_APIKEY");
        String secret = System.getenv("BINANCE_SECRET");

        if (apiKey == null || apiKey.isEmpty() || secret == null || secret.isEmpty()) {
            System.err.println("BINANCE_APIKEY and BINANCE_SECRET must be set");
            System.exit(1);
        }

        Map<String, Object> config = new HashMap<>();
        config.put("apiKey", apiKey);
        config.put("secret", secret);
        config.put("verbose", false);

        exchange = Exchange.dynamicallyCreateInstance("binance", config);
        exchange.enableDemoTrading(true);
        System.out.println("Demo trading enabled");
        System.out.println("Loading markets...\n");
        exchange.loadMarkets().join();

        // ── Public endpoints (no auth needed) ──
        section("PUBLIC ENDPOINTS");
        test("fetchTime");
        test("fetchStatus");
        test("fetchMarkets");
        test("fetchCurrencies");
        test("fetchTicker", SYMBOL);
        test("fetchTickers", new Object[]{List.of(SYMBOL, "ETH/USDT")});
        test("fetchOrderBook", SYMBOL);
        test("fetchTrades", SYMBOL);
        test("fetchOHLCV", SYMBOL, "1m");
        test("fetchBidsAsks", new Object[]{List.of(SYMBOL)});
        test("fetchLastPrices", new Object[]{List.of(SYMBOL)});

        // ── Private endpoints (auth required) ──
        section("PRIVATE ENDPOINTS");
        test("fetchBalance");
        test("fetchOpenOrders", SYMBOL);
        test("fetchClosedOrders", SYMBOL);
        test("fetchCanceledOrders", SYMBOL);
        test("fetchMyTrades", SYMBOL);
        test("fetchTradingFee", SYMBOL);
        test("fetchTradingFees");
        test("fetchDepositAddress", "USDT");
        test("fetchDeposits");
        test("fetchWithdrawals");
        test("fetchLedger");
        test("fetchDepositWithdrawFees");

        // ── Trading (create + cancel) ──
        section("TRADING");
        testCreateAndCancelOrder();

        // ── Summary ──
        System.out.println("\n══════════════════════════════════════");
        System.out.printf("Results: %d passed, %d failed, %d skipped%n", passed, failed, skipped);
        System.out.println("══════════════════════════════════════");

        System.exit(failed > 0 ? 1 : 0);
    }

    static void section(String name) {
        System.out.println("\n── " + name + " ──");
    }

    static void test(String method, Object... args) {
        System.out.printf("  %-40s ", method + "(" + argsStr(args) + ")");
        try {
            CompletableFuture<Object> future = (CompletableFuture<Object>) Helpers.callDynamically(exchange, method, args);
            Object result = future.get(TIMEOUT_SEC, TimeUnit.SECONDS);
            System.out.println("PASS  " + describe(result));
            passed++;
        } catch (Exception e) {
            String msg = root(e);
            if (msg.contains("not supported") || msg.contains("Not supported") || msg.contains("not available")
                    || msg.contains("not allowed") || msg.contains("does not have")
                    || msg.contains("contract wallets only")) {
                System.out.println("SKIP  " + shorten(msg));
                skipped++;
            } else if (msg.contains("IP") || msg.contains("permissions") || msg.contains("-2015")
                    || msg.contains("not whitelisted") || msg.contains("API-key")) {
                System.out.println("SKIP  (sandbox key limitation) " + shorten(msg));
                skipped++;
            } else {
                System.out.println("FAIL  " + shorten(msg));
                e.printStackTrace(System.err);
                failed++;
            }
        }
    }

    @SuppressWarnings("unchecked")
    static void testCreateAndCancelOrder() {
        System.out.printf("  %-40s ", "createOrder(BTC/USDT limit buy)");
        try {
            // Get current price and place limit buy ~20% below to avoid fill but within PERCENT_PRICE filter
            Map<String, Object> ticker = (Map<String, Object>) ((CompletableFuture<Object>) Helpers.callDynamically(exchange, "fetchTicker", new Object[]{SYMBOL})).get(TIMEOUT_SEC, TimeUnit.SECONDS);
            double lastPrice = ((Number) ticker.get("last")).doubleValue();
            double buyPrice = Math.floor(lastPrice * 0.80); // 20% below market

            CompletableFuture<Object> future = (CompletableFuture<Object>) Helpers.callDynamically(exchange, "createOrder",
                    new Object[]{SYMBOL, "limit", "buy", 0.001, buyPrice});
            Object result = future.get(TIMEOUT_SEC, TimeUnit.SECONDS);
            Map<String, Object> order = (Map<String, Object>) result;
            String orderId = String.valueOf(order.get("id"));
            System.out.println("PASS  id=" + orderId + " status=" + order.get("status"));
            passed++;

            // Cancel it
            System.out.printf("  %-40s ", "cancelOrder(" + orderId + ")");
            CompletableFuture<Object> cancelFuture = (CompletableFuture<Object>) Helpers.callDynamically(exchange, "cancelOrder",
                    new Object[]{orderId, SYMBOL});
            Object cancelResult = cancelFuture.get(TIMEOUT_SEC, TimeUnit.SECONDS);
            Map<String, Object> canceled = (Map<String, Object>) cancelResult;
            System.out.println("PASS  status=" + canceled.get("status"));
            passed++;
        } catch (Exception e) {
            String msg = root(e);
            if (msg.contains("permissions") || msg.contains("-2015") || msg.contains("API-key")) {
                System.out.println("SKIP  (sandbox key limitation) " + shorten(msg));
                skipped++;
            } else {
                System.out.println("FAIL  " + shorten(msg));
                e.printStackTrace(System.err);
                failed++;
            }
        }
    }

    @SuppressWarnings("unchecked")
    static String describe(Object r) {
        if (r == null) return "null";
        if (r instanceof Map) {
            Map<String, Object> m = (Map<String, Object>) r;
            if (m.containsKey("symbol")) return "symbol=" + m.get("symbol") + " keys=" + m.keySet().size();
            if (m.containsKey("asks")) return "ob asks=" + ((List<?>) m.get("asks")).size() + " bids=" + ((List<?>) m.get("bids")).size();
            if (m.size() <= 5) return "Map" + m.keySet();
            return "Map keys=" + m.keySet().size();
        }
        if (r instanceof List) {
            List<?> l = (List<?>) r;
            if (l.isEmpty()) return "List[]";
            Object first = l.get(0);
            if (first instanceof Map && ((Map<?,?>) first).containsKey("symbol"))
                return "List[" + l.size() + "] first.symbol=" + ((Map<?,?>) first).get("symbol");
            return "List[" + l.size() + "]";
        }
        String s = String.valueOf(r);
        return s.length() > 80 ? s.substring(0, 80) + "..." : s;
    }

    static String argsStr(Object[] a) {
        if (a == null || a.length == 0) return "";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < a.length; i++) {
            if (i > 0) sb.append(", ");
            String s = String.valueOf(a[i]);
            sb.append(s.length() > 30 ? s.substring(0, 30) + "..." : s);
        }
        return sb.toString();
    }

    static String root(Exception e) {
        Throwable c = e;
        while (c.getCause() != null) c = c.getCause();
        String m = c.getMessage();
        return m != null ? m : c.getClass().getSimpleName();
    }

    static String shorten(String s) {
        return s.length() > 120 ? s.substring(0, 120) + "..." : s;
    }
}
