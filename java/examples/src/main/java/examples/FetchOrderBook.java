package examples;

import io.github.ccxt.exchanges.Binance;
import io.github.ccxt.types.OrderBook;

import java.util.List;

/**
 * Fetch an order book and display the top bids and asks.
 *
 * Usage:
 *   cd java && ./gradlew :examples:run -PmainClass=examples.FetchOrderBook
 */
public class FetchOrderBook {

    public static void main(String[] args) {
        String symbol = args.length > 0 ? args[0] : "BTC/USDT";

        System.out.println("Symbol: " + symbol);
        System.out.println();

        Binance exchange = new Binance();

        exchange.loadMarkets(false);

        OrderBook ob = exchange.fetchOrderBook(symbol, 10L, null);

        System.out.printf("%-20s | %-20s%n", "BIDS (price x size)", "ASKS (price x size)");
        System.out.println("-".repeat(43));

        int rows = Math.min(10, Math.min(ob.bids.size(), ob.asks.size()));
        for (int i = 0; i < rows; i++) {
            List<Double> bid = ob.bids.get(i);
            List<Double> ask = ob.asks.get(i);
            System.out.printf("%10.2f x %-8.6f | %10.2f x %-8.6f%n",
                    bid.get(0), bid.get(1), ask.get(0), ask.get(1));
        }

        System.out.println();
        System.out.println("Spread: " + String.format("%.2f", ob.asks.get(0).get(0) - ob.bids.get(0).get(0)));
        System.out.println("Timestamp: " + ob.timestamp);
    }
}
