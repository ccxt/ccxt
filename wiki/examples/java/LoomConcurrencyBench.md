```java
package examples;

import io.github.ccxt.exchanges.Binance;
import io.github.ccxt.types.Ticker;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ForkJoinPool;

/**
 * Concurrency benchmark: N concurrent fetchTicker() calls against a fake exchange
 * whose transport sleeps 200 ms. Ideal wall-clock is ~200 ms regardless of N.
 *
 * Usage:
 *   cd java && ./gradlew :examples:run -PmainClass=examples.LoomConcurrencyBench
 *   cd java && ./gradlew :examples:run -PmainClass=examples.LoomConcurrencyBench -Pargs="64 256"
 */
public class LoomConcurrencyBench {

    static final long LATENCY_MS = 200;

    /** Binance with the HTTP layer replaced by a 200 ms sleep returning a canned ticker. */
    static class FakeExchange extends Binance {
        FakeExchange() {
            super();
            this.enableRateLimit = false;
        }

        @Override
        public CompletableFuture<Object> fetch(Object url, Object method, Object headers, Object body) {
            try {
                Thread.sleep(LATENCY_MS);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
            Map<String, Object> ticker = new HashMap<>();
            ticker.put("symbol", "BTCUSDT");
            ticker.put("lastPrice", "50000.0");
            ticker.put("bidPrice", "49999.0");
            ticker.put("askPrice", "50001.0");
            ticker.put("highPrice", "51000.0");
            ticker.put("lowPrice", "49000.0");
            ticker.put("volume", "1000.0");
            ticker.put("quoteVolume", "50000000.0");
            ticker.put("closeTime", System.currentTimeMillis());
            return CompletableFuture.completedFuture(ticker);
        }
    }

    static Map<String, Object> fakeMarket() {
        Map<String, Object> m = new HashMap<>();
        m.put("id", "BTCUSDT");
        m.put("symbol", "BTC/USDT");
        m.put("base", "BTC");
        m.put("quote", "USDT");
        m.put("baseId", "BTC");
        m.put("quoteId", "USDT");
        m.put("type", "spot");
        m.put("spot", true);
        m.put("margin", false);
        m.put("swap", false);
        m.put("future", false);
        m.put("option", false);
        m.put("active", true);
        m.put("contract", false);
        m.put("linear", null);
        m.put("inverse", null);
        m.put("precision", new HashMap<String, Object>() {{ put("amount", 1e-8); put("price", 1e-8); }});
        m.put("limits", new HashMap<String, Object>());
        m.put("info", new HashMap<String, Object>());
        return m;
    }

    static long run(FakeExchange ex, int n) {
        long t0 = System.nanoTime();
        List<CompletableFuture<Ticker>> futures = new ArrayList<>(n);
        for (int i = 0; i < n; i++) {
            futures.add(ex.fetchTickerAsync("BTC/USDT"));
        }
        for (CompletableFuture<Ticker> f : futures) {
            Ticker t = f.join();
            if (t.last == null) {
                throw new IllegalStateException("fetchTicker returned no last price");
            }
        }
        return (System.nanoTime() - t0) / 1_000_000;
    }

    public static void main(String[] args) {
        int[] sizes = args.length > 0
                ? Arrays.stream(args).mapToInt(Integer::parseInt).toArray()
                : new int[]{64, 256};

        FakeExchange ex = new FakeExchange();
        ex.setMarkets(new ArrayList<>(List.of(fakeMarket())));

        System.out.println("commonPool parallelism=" + ForkJoinPool.commonPool().getParallelism()
                + "  latency_each=" + LATENCY_MS + "ms  ideal=~" + LATENCY_MS + "ms");
        run(ex, 4); // warm-up

        for (int n : sizes) {
            long ms = run(ex, n);
            System.out.println("N=" + n + "  fetchTicker wall-clock: " + ms + " ms");
        }
    }
}

```
