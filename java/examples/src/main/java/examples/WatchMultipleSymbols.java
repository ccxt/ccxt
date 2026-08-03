package examples;

import io.github.ccxt.exchanges.pro.Binance;
import io.github.ccxt.types.Ticker;
import io.github.ccxt.types.Tickers;

import java.util.List;

/**
 * Watch tickers for multiple symbols simultaneously via WebSocket.
 * Demonstrates watchTickers() which subscribes to several symbols at once.
 *
 * Usage:
 *   cd java && ./gradlew :examples:run -PmainClass=examples.WatchMultipleSymbols
 */
public class WatchMultipleSymbols {

    public static void main(String[] args) throws Exception {
        Binance exchange = new Binance();
        exchange.verbose = false;

        System.out.println("Loading markets...");
        exchange.loadMarkets(false);

        List<String> symbols = List.of("BTC/USDT", "ETH/USDT", "SOL/USDT", "XRP/USDT", "DOGE/USDT");
        System.out.println("Watching tickers for " + symbols + " (10 updates)...\n");

        for (int i = 0; i < 10; i++) {
            Tickers tickers = exchange.watchTickers(symbols, null);

            System.out.println("=== Update #" + (i + 1) + " ===");
            System.out.printf("%-12s %12s %12s %12s %10s%n",
                    "Symbol", "Last", "Bid", "Ask", "Change%");
            System.out.println("-".repeat(60));

            for (String sym : symbols) {
                Ticker t = tickers.tickers.get(sym);
                if (t != null) {
                    System.out.printf("%-12s %12s %12s %12s %10s%n",
                            t.symbol,
                            t.last,
                            t.bid,
                            t.ask,
                            t.percentage);
                }
            }
            System.out.println();
        }

        System.out.println("Done!");
        System.exit(0);
    }
}
