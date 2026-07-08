package examples;

import io.github.ccxt.exchanges.pro.Binance;
import io.github.ccxt.types.Ticker;

/**
 * Watch real-time ticker updates via WebSocket.
 * Prints live price updates for a symbol until interrupted or max iterations reached.
 *
 * Usage:
 *   cd java && ./gradlew :examples:run -PmainClass=examples.WatchTicker
 *   cd java && ./gradlew :examples:run -PmainClass=examples.WatchTicker --args="ETH/USDT"
 */
public class WatchTicker {

    public static void main(String[] args) throws Exception {
        String symbol = args.length > 0 ? args[0] : "BTC/USDT";

        Binance exchange = new Binance();
        exchange.verbose = false;

        System.out.println("Loading markets...");
        exchange.loadMarkets(false);
        System.out.println("Watching " + symbol + " ticker (20 updates)...\n");

        System.out.printf("%-26s %12s %12s %12s %10s%n",
                "Datetime", "Last", "Bid", "Ask", "Volume");
        System.out.println("-".repeat(74));

        for (int i = 0; i < 20; i++) {
            Ticker ticker = exchange.watchTicker(symbol);
            System.out.printf("%-26s %12s %12s %12s %10s%n",
                    ticker.datetime,
                    ticker.last,
                    ticker.bid,
                    ticker.ask,
                    ticker.baseVolume);
        }

        System.out.println("\nDone!");
        System.exit(0);
    }
}
