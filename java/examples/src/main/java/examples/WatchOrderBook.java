package examples;

import io.github.ccxt.exchanges.pro.Binance;
import io.github.ccxt.types.OrderBook;

import java.util.List;

/**
 * Watch real-time order book updates via WebSocket.
 * Each call to watchOrderBook resolves on the next delta update.
 *
 * Usage:
 *   cd java && ./gradlew :examples:run -PmainClass=examples.WatchOrderBook
 *   cd java && ./gradlew :examples:run -PmainClass=examples.WatchOrderBook --args="ETH/USDT"
 */
public class WatchOrderBook {

    public static void main(String[] args) throws Exception {
        String symbol = args.length > 0 ? args[0] : "BTC/USDT";

        Binance exchange = new Binance();
        exchange.verbose = false;

        System.out.println("Loading markets...");
        exchange.loadMarkets(false);
        System.out.println("Watching " + symbol + " order book (10 updates)...\n");

        for (int i = 0; i < 10; i++) {
            OrderBook ob = exchange.watchOrderBook(symbol);

            List<List<Double>> bids = ob.bids;
            List<List<Double>> asks = ob.asks;

            System.out.println("=== Update #" + (i + 1) + " (ts=" + ob.timestamp + ") ===");
            System.out.printf("%-20s | %-20s%n", "BIDS (price x size)", "ASKS (price x size)");
            System.out.println("-".repeat(43));

            int rows = Math.min(5, Math.min(bids.size(), asks.size()));
            for (int j = 0; j < rows; j++) {
                List<Double> bid = bids.get(j);
                List<Double> ask = asks.get(j);
                System.out.printf("%10s x %-8s | %10s x %-8s%n",
                        bid.get(0), bid.get(1),
                        ask.get(0), ask.get(1));
            }

            if (!bids.isEmpty() && !asks.isEmpty()) {
                double bestBid = bids.get(0).get(0);
                double bestAsk = asks.get(0).get(0);
                double spread = bestAsk - bestBid;
                System.out.printf("Spread: %.2f  |  Total bids: %d  |  Total asks: %d%n%n",
                        spread, bids.size(), asks.size());
            }
        }

        System.out.println("Done!");
        System.exit(0);
    }
}
