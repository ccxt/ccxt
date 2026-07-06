package examples;

import io.github.ccxt.exchanges.Binance;
import io.github.ccxt.types.Ticker;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

/**
 * Demonstrates asynchronous fetching with CompletableFuture.
 * Fetches multiple tickers concurrently and waits for all results.
 *
 * Usage:
 *   cd java && ./gradlew :examples:run -PmainClass=examples.AsyncExample
 */
public class AsyncExample {

    public static void main(String[] args) throws Exception {
        Binance exchange = new Binance();

        exchange.loadMarkets(false);

        String[] symbols = {"BTC/USDT", "ETH/USDT", "SOL/USDT", "XRP/USDT", "DOGE/USDT"};

        System.out.println("Fetching " + symbols.length + " tickers concurrently...");
        long start = System.currentTimeMillis();

        // Fire all requests concurrently
        @SuppressWarnings("unchecked")
        CompletableFuture<Ticker>[] futures = new CompletableFuture[symbols.length];
        for (int i = 0; i < symbols.length; i++) {
            futures[i] = exchange.fetchTickerAsync(symbols[i], null);
        }

        // Wait for all to complete
        CompletableFuture.allOf(futures).get(30, TimeUnit.SECONDS);

        long elapsed = System.currentTimeMillis() - start;

        System.out.printf("%-12s %12s %10s%n", "Symbol", "Price", "Change%");
        System.out.println("-".repeat(36));

        for (CompletableFuture<Ticker> f : futures) {
            Ticker t = f.get();
            System.out.printf("%-12s %12.4f %9.2f%%%n",
                    t.symbol,
                    t.last != null ? t.last : 0,
                    t.percentage != null ? t.percentage : 0);
        }

        System.out.println("\nAll fetched in " + elapsed + "ms");
    }
}
