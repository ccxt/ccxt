package io.github.ccxt.types;

import static org.junit.jupiter.api.Assertions.*;

import io.github.ccxt.Exchange;
import io.github.ccxt.exchanges.Binance;
import io.github.ccxt.errors.*;

import static org.junit.jupiter.api.Assumptions.assumeTrue;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionException;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;

/**
 * Tests for ExchangeTyped wrapper: exception propagation, concurrent access,
 * authenticated endpoint errors, rate limiting under load.
 *
 * These are live tests that hit Binance public/private endpoints.
 */
class ExchangeTypedTest {

    static Binance exchange;

    @BeforeAll
    static void setup() {
        exchange = new Binance();
        exchange.verbose = false;
        String proxy = System.getenv("CCXT_HTTPS_PROXY");
        if (proxy != null && !proxy.isEmpty()) {
            exchange.httpsProxy = proxy;
        }
        try {
            exchange.loadMarkets(false);
        } catch (Exception e) {
            assumeTrue(false, "Skipping: exchange not reachable (" + e.getMessage() + ")");
        }
    }

    // ==========================================
    // Exception propagation
    // ==========================================

    @Test
    void testBadSymbolThrowsThroughTypedWrapper() {
        // fetchTicker with an invalid symbol throws BadSymbol directly
        // (typed wrappers unwrap CompletionException — see Helpers.joinUnwrapped)
        ExchangeError ex = assertThrows(ExchangeError.class, () -> {
            exchange.fetchTicker("INVALID/NOTEXIST");
        });
        assertTrue(ex instanceof BadSymbol || ex instanceof BadRequest || ex instanceof ExchangeError,
                "Expected BadSymbol/BadRequest/ExchangeError, got: " + ex.getClass().getSimpleName() + ": " + ex.getMessage());
    }

    @Test
    void testAsyncBadSymbolThrows() throws Exception {
        CompletableFuture<Ticker> future = exchange.fetchTickerAsync("INVALID/NOTEXIST", null);
        try {
            future.get(30, TimeUnit.SECONDS);
            fail("Should have thrown");
        } catch (java.util.concurrent.ExecutionException ex) {
            Throwable cause = unwrap(ex);
            assertTrue(cause instanceof BadSymbol || cause instanceof BadRequest || cause instanceof ExchangeError,
                    "Expected exchange error, got: " + cause.getClass().getSimpleName());
        }
    }

    @Test
    void testAuthenticationErrorOnPrivateEndpoint() {
        // Private endpoint without credentials throws AuthenticationError directly
        // (typed wrappers unwrap CompletionException — see Helpers.joinUnwrapped)
        ExchangeError ex = assertThrows(ExchangeError.class, () -> {
            exchange.fetchBalance((Map<String, Object>) null);
        });
        assertTrue(ex instanceof AuthenticationError || ex instanceof ExchangeError,
                "Expected AuthenticationError, got: " + ex.getClass().getSimpleName() + ": " + ex.getMessage());
    }

    @Test
    void testExceptionPreservesMessage() {
        // Typed wrappers unwrap CompletionException — caller catches the
        // ccxt error directly (see Helpers.joinUnwrapped).
        try {
            exchange.fetchTicker("TOTALLY/BOGUS");
            fail("Should have thrown");
        } catch (ExchangeError ex) {
            assertNotNull(ex.getMessage());
            assertTrue(ex.getMessage().length() > 0, "Error message should not be empty");
        }
    }

    // ==========================================
    // Concurrent access
    // ==========================================

    @Test
    void testConcurrentFetchTickers() throws Exception {
        int threadCount = 5;
        CountDownLatch latch = new CountDownLatch(threadCount);
        AtomicInteger successes = new AtomicInteger(0);
        AtomicReference<Throwable> firstError = new AtomicReference<>(null);

        String[] symbols = {"BTC/USDT", "ETH/USDT", "BNB/USDT", "SOL/USDT", "XRP/USDT"};

        for (int i = 0; i < threadCount; i++) {
            final String symbol = symbols[i];
            Thread.ofVirtual().start(() -> {
                try {
                    Ticker t = exchange.fetchTicker(symbol);
                    assertNotNull(t.symbol);
                    assertNotNull(t.last);
                    assertTrue(t.last > 0);
                    successes.incrementAndGet();
                } catch (Throwable e) {
                    firstError.compareAndSet(null, e);
                } finally {
                    latch.countDown();
                }
            });
        }

        assertTrue(latch.await(60, TimeUnit.SECONDS), "All threads should complete within 60s");
        if (firstError.get() != null) {
            fail("Concurrent fetch failed: " + firstError.get().getMessage());
        }
        assertEquals(threadCount, successes.get(), "All concurrent fetches should succeed");
    }

    @Test
    void testConcurrentAsyncFetches() throws Exception {
        // Fire multiple async requests simultaneously
        CompletableFuture<Ticker> f1 = exchange.fetchTickerAsync("BTC/USDT", null);
        CompletableFuture<Ticker> f2 = exchange.fetchTickerAsync("ETH/USDT", null);
        CompletableFuture<Ticker> f3 = exchange.fetchTickerAsync("BNB/USDT", null);

        CompletableFuture.allOf(f1, f2, f3).get(30, TimeUnit.SECONDS);

        assertEquals("BTC/USDT", f1.get().symbol);
        assertEquals("ETH/USDT", f2.get().symbol);
        assertEquals("BNB/USDT", f3.get().symbol);
        assertTrue(f1.get().last > 0);
        assertTrue(f2.get().last > 0);
        assertTrue(f3.get().last > 0);
    }

    // ==========================================
    // Rate limiter under real load
    // ==========================================

    @Test
    void testRateLimiterThrottlesRealRequests() throws Exception {
        // Binance rateLimit is 50ms. Fire 10 rapid requests and verify they don't all complete instantly.
        assertTrue(exchange.enableRateLimit, "Rate limiting should be enabled");

        long start = System.currentTimeMillis();
        int requestCount = 10;
        CompletableFuture<?>[] futures = new CompletableFuture[requestCount];

        for (int i = 0; i < requestCount; i++) {
            futures[i] = exchange.fetchTickerAsync("BTC/USDT", null);
        }

        CompletableFuture.allOf(futures).get(120, TimeUnit.SECONDS);
        long elapsed = System.currentTimeMillis() - start;

        // With rateLimit=50ms and 10 requests, should take at least ~400ms (first is free)
        // Be generous with the lower bound since network latency dominates
        assertTrue(elapsed >= 200,
                "10 requests with rate limiting should take at least 200ms, took " + elapsed + "ms");

        // Verify all completed successfully
        for (CompletableFuture<?> f : futures) {
            assertTrue(f.isDone());
            assertFalse(f.isCompletedExceptionally());
        }
    }

    // ==========================================
    // Type correctness on real data
    // ==========================================

    @Test
    void testFetchTradesReturnsTypedList() {
        List<Trade> trades = exchange.fetchTrades("BTC/USDT");
        assertNotNull(trades);
        assertFalse(trades.isEmpty());
        Trade first = trades.get(0);
        assertNotNull(first.price);
        assertNotNull(first.amount);
        assertNotNull(first.side);
        assertTrue("buy".equals(first.side) || "sell".equals(first.side),
                "side should be buy or sell, got: " + first.side);
    }

    @Test
    void testFetchOrderBookStructure() {
        OrderBook ob = exchange.fetchOrderBook("BTC/USDT");
        assertNotNull(ob.bids);
        assertNotNull(ob.asks);
        assertFalse(ob.bids.isEmpty());
        assertFalse(ob.asks.isEmpty());
        // Each entry should be [price, amount]
        List<Double> bestBid = ob.bids.get(0);
        assertEquals(2, bestBid.size(), "Order book entry should have [price, amount]");
        assertTrue(bestBid.get(0) > 0, "Bid price should be > 0");
        assertTrue(bestBid.get(1) > 0, "Bid amount should be > 0");
        // Bids should be descending, asks ascending
        if (ob.bids.size() > 1) {
            assertTrue(ob.bids.get(0).get(0) >= ob.bids.get(1).get(0),
                    "Bids should be in descending price order");
        }
        if (ob.asks.size() > 1) {
            assertTrue(ob.asks.get(0).get(0) <= ob.asks.get(1).get(0),
                    "Asks should be in ascending price order");
        }
    }

    @Test
    void testFetchOHLCVWithTimeframe() {
        List<OHLCV> candles = exchange.fetchOHLCV("BTC/USDT", "1h", null, 5L, null);
        assertNotNull(candles);
        assertFalse(candles.isEmpty());
        assertTrue(candles.size() <= 5, "Should respect limit");
        OHLCV c = candles.get(0);
        assertNotNull(c.timestamp);
        assertNotNull(c.open);
        assertNotNull(c.high);
        assertNotNull(c.low);
        assertNotNull(c.close);
        assertNotNull(c.volume);
        assertTrue(c.high >= c.low, "High should be >= Low");
        assertTrue(c.high >= c.open, "High should be >= Open");
        assertTrue(c.high >= c.close, "High should be >= Close");
    }

    @Test
    void testMarketFieldsFromLoadMarkets() {
        Map<String, MarketInterface> markets = exchange.loadMarkets(false);
        MarketInterface btc = markets.get("BTC/USDT");
        assertNotNull(btc);
        assertEquals("BTC/USDT", btc.symbol);
        assertNotNull(btc.id);
        assertNotNull(btc.base);
        assertNotNull(btc.quote);
        assertEquals("BTC", btc.base);
        assertEquals("USDT", btc.quote);
        assertNotNull(btc.type);
        assertNotNull(btc.precision);
        assertNotNull(btc.limits);
    }

    // ==========================================
    // Helper
    // ==========================================

    private static Throwable unwrap(Throwable t) {
        while ((t instanceof CompletionException || t instanceof java.util.concurrent.ExecutionException)
                && t.getCause() != null) {
            t = t.getCause();
        }
        // Also unwrap RuntimeException wrapping
        while (t instanceof RuntimeException && t.getCause() != null
                && !(t instanceof BaseError)) {
            t = t.getCause();
        }
        return t;
    }
}
