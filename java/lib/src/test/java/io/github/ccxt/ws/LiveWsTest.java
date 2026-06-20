package io.github.ccxt.ws;

import static org.junit.jupiter.api.Assertions.*;

import io.github.ccxt.Exchange;
import io.github.ccxt.Helpers;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Timeout;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;

import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

/**
 * Live WebSocket tests against Binance public endpoints.
 * These test the full pipeline: WsClient → Netty → Binance WS → handleMessage → resolve.
 *
 * Requires network access. Run with: CCXT_LIVE_WS_TESTS=true ./gradlew :lib:test --tests "io.github.ccxt.ws.LiveWsTest"
 */
// Enable with: CCXT_LIVE_WS_TESTS=true or -DCCXT_LIVE_WS_TESTS=true
@org.junit.jupiter.api.condition.EnabledIf("isLiveTestEnabled")
class LiveWsTest {

    static boolean isLiveTestEnabled() {
        return "true".equals(System.getenv("CCXT_LIVE_WS_TESTS"))
            || "true".equals(System.getProperty("CCXT_LIVE_WS_TESTS"));
    }

    static Exchange exchange;

    @BeforeAll
    static void setup() {
        // Use a WS exchange class — dynamically so it works without generated pro/ files
        try {
            exchange = (Exchange) Class.forName("io.github.ccxt.exchanges.pro.Binance")
                    .getDeclaredConstructor().newInstance();
        } catch (Exception e) {
            exchange = Exchange.dynamicallyCreateInstance("binance", null);
        }
        exchange.verbose = false;
        exchange.loadMarkets().join();
    }

    @Test
    @Timeout(value = 30, unit = TimeUnit.SECONDS)
    @SuppressWarnings("unchecked")
    void testWatchTicker() throws Exception {
        CompletableFuture<Object> future = (CompletableFuture<Object>) Helpers.callDynamically(exchange,"watchTicker", new Object[]{"BTC/USDT"});
        Object result = future.get(20, TimeUnit.SECONDS);

        assertNotNull(result, "watchTicker should return data");
        assertTrue(result instanceof Map, "Result should be a Map (ticker)");

        Map<String, Object> ticker = (Map<String, Object>) result;
        assertNotNull(ticker.get("symbol"), "Ticker should have symbol");
        System.out.println("watchTicker BTC/USDT: last=" + ticker.get("last"));
    }

    @Test
    @Timeout(value = 30, unit = TimeUnit.SECONDS)
    @SuppressWarnings("unchecked")
    void testWatchTrades() throws Exception {
        CompletableFuture<Object> future = (CompletableFuture<Object>) Helpers.callDynamically(exchange,"watchTrades", new Object[]{"BTC/USDT"});
        Object result = future.get(20, TimeUnit.SECONDS);

        assertNotNull(result, "watchTrades should return data");
        System.out.println("watchTrades BTC/USDT: received data type=" + result.getClass().getSimpleName());
    }
}
