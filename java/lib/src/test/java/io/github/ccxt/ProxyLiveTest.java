package io.github.ccxt;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

/**
 * Live proxy integration test. Requires a local HTTP CONNECT proxy on port 18911.
 * Start proxy: python3 /tmp/test_proxy.py
 * Run test:    ./gradlew :lib:proxyLiveTest
 *
 * Tests real Binance data fetching through an HTTP proxy.
 */
public class ProxyLiveTest {

    static int passed = 0;
    static int failed = 0;

    public static void main(String[] args) throws Exception {
        String proxyHost = System.getenv("PROXY_HOST") != null ? System.getenv("PROXY_HOST") : "127.0.0.1";
        String proxyPort = System.getenv("PROXY_PORT") != null ? System.getenv("PROXY_PORT") : "18911";
        String proxyUrl = "http://" + proxyHost + ":" + proxyPort;

        System.out.println("Testing with httpProxy=" + proxyUrl + "\n");

        // ── Test 1: fetchTicker via httpProxy ──
        test("fetchTicker via httpProxy", () -> {
            Map<String, Object> config = new HashMap<>();
            config.put("httpProxy", proxyUrl);
            Exchange ex = Exchange.dynamicallyCreateInstance("binance", config);
            ex.loadMarkets().get(30, TimeUnit.SECONDS);
            @SuppressWarnings("unchecked")
            Map<String, Object> ticker = (Map<String, Object>) ((java.util.concurrent.CompletableFuture<Object>) Helpers.callDynamically(ex, "fetchTicker", new Object[]{"BTC/USDT"})).get(15, TimeUnit.SECONDS);
            assert ticker.get("symbol").equals("BTC/USDT") : "symbol mismatch";
            assert ticker.get("last") != null : "last price is null";
            return "symbol=" + ticker.get("symbol") + " last=" + ticker.get("last");
        });

        // ── Test 2: fetchOrderBook via httpProxy ──
        test("fetchOrderBook via httpProxy", () -> {
            Map<String, Object> config = new HashMap<>();
            config.put("httpProxy", proxyUrl);
            Exchange ex = Exchange.dynamicallyCreateInstance("binance", config);
            ex.loadMarkets().get(30, TimeUnit.SECONDS);
            @SuppressWarnings("unchecked")
            Map<String, Object> ob = (Map<String, Object>) ((java.util.concurrent.CompletableFuture<Object>) Helpers.callDynamically(ex, "fetchOrderBook", new Object[]{"ETH/USDT"})).get(15, TimeUnit.SECONDS);
            List<?> asks = (List<?>) ob.get("asks");
            List<?> bids = (List<?>) ob.get("bids");
            assert asks != null && !asks.isEmpty() : "no asks";
            assert bids != null && !bids.isEmpty() : "no bids";
            return "asks=" + asks.size() + " bids=" + bids.size();
        });

        // ── Test 3: fetchTrades via httpProxy ──
        test("fetchTrades via httpProxy", () -> {
            Map<String, Object> config = new HashMap<>();
            config.put("httpProxy", proxyUrl);
            Exchange ex = Exchange.dynamicallyCreateInstance("binance", config);
            ex.loadMarkets().get(30, TimeUnit.SECONDS);
            @SuppressWarnings("unchecked")
            List<?> trades = (List<?>) ((java.util.concurrent.CompletableFuture<Object>) Helpers.callDynamically(ex, "fetchTrades", new Object[]{"BTC/USDT"})).get(15, TimeUnit.SECONDS);
            assert trades != null && !trades.isEmpty() : "no trades";
            return "trades=" + trades.size();
        });

        // ── Test 4: httpsProxy also works ──
        test("fetchTicker via httpsProxy", () -> {
            Map<String, Object> config = new HashMap<>();
            config.put("httpsProxy", proxyUrl);
            Exchange ex = Exchange.dynamicallyCreateInstance("binance", config);
            ex.loadMarkets().get(30, TimeUnit.SECONDS);
            @SuppressWarnings("unchecked")
            Map<String, Object> ticker = (Map<String, Object>) ((java.util.concurrent.CompletableFuture<Object>) Helpers.callDynamically(ex, "fetchTicker", new Object[]{"BTC/USDT"})).get(15, TimeUnit.SECONDS);
            assert ticker.get("last") != null : "last price is null";
            return "last=" + ticker.get("last");
        });

        // ── Summary ──
        System.out.println("\n══════════════════════════════════════");
        System.out.printf("Results: %d passed, %d failed%n", passed, failed);
        System.out.println("══════════════════════════════════════");
        System.exit(failed > 0 ? 1 : 0);
    }

    interface TestBody {
        String run() throws Exception;
    }

    static void test(String name, TestBody body) {
        System.out.printf("  %-45s ", name);
        try {
            String result = body.run();
            System.out.println("PASS  " + result);
            passed++;
        } catch (Exception e) {
            Throwable cause = e;
            while (cause.getCause() != null) cause = cause.getCause();
            String msg = cause.getMessage() != null ? cause.getMessage() : cause.getClass().getSimpleName();
            System.out.println("FAIL  " + (msg.length() > 100 ? msg.substring(0, 100) + "..." : msg));
            failed++;
        }
    }
}
