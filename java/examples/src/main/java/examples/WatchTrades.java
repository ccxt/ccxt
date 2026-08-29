package examples;

import io.github.ccxt.exchanges.pro.Binance;
import io.github.ccxt.types.Trade;

import java.util.List;

/**
 * Watch real-time trades via WebSocket.
 * Displays live trades as they happen on the exchange.
 *
 * Usage:
 *   cd java && ./gradlew :examples:run -PmainClass=examples.WatchTrades
 *   cd java && ./gradlew :examples:run -PmainClass=examples.WatchTrades --args="ETH/USDT"
 */
public class WatchTrades {

    public static void main(String[] args) throws Exception {
        String symbol = args.length > 0 ? args[0] : "BTC/USDT";

        Binance exchange = new Binance();
        exchange.verbose = false;

        System.out.println("Loading markets...");
        exchange.loadMarkets(false);
        System.out.println("Watching " + symbol + " trades (10 batches)...\n");

        System.out.printf("%-26s %-5s %12s %12s %14s%n",
                "Datetime", "Side", "Price", "Amount", "Cost");
        System.out.println("-".repeat(72));

        int totalTrades = 0;
        for (int i = 0; i < 10; i++) {
            List<Trade> trades = exchange.watchTrades(symbol);

            // Print only the latest trades from this batch
            int start = Math.max(0, trades.size() - 5);
            for (int j = start; j < trades.size(); j++) {
                Trade t = trades.get(j);
                System.out.printf("%-26s %-5s %12s %12s %14s%n",
                        t.datetime,
                        t.side,
                        t.price,
                        t.amount,
                        t.cost);
            }
            totalTrades += trades.size();
        }

        System.out.println("\nTotal trades received: " + totalTrades);
        System.out.println("Done!");
        System.exit(0);
    }
}
