package examples;

import io.github.ccxt.exchanges.Binance;
import io.github.ccxt.types.MarketInterface;

import java.util.Map;

/**
 * Fetch and display available markets from an exchange.
 *
 * Usage:
 *   cd java && ./gradlew :examples:run -PmainClass=examples.FetchMarkets
 *   cd java && ./gradlew :examples:run -PmainClass=examples.FetchMarkets --args="spot"
 */
public class FetchMarkets {

    public static void main(String[] args) {
        String filterType = args.length > 0 ? args[0] : null; // "spot", "swap", "future", "option"

        if (filterType != null) System.out.println("Filter: " + filterType);
        System.out.println();

        Binance exchange = new Binance();

        Map<String, MarketInterface> markets = exchange.loadMarkets(false);

        System.out.printf("%-16s %-8s %-6s %-8s %-12s %-14s %-14s%n",
                "Symbol", "Type", "Active", "Base", "Quote", "Price Prec", "Amount Prec");
        System.out.println("-".repeat(82));

        int count = 0;
        for (MarketInterface m : markets.values()) {
            // Apply type filter if specified
            if (filterType != null && !filterType.equals(m.type)) continue;

            // Show first 30 markets to keep output manageable
            if (++count > 30) {
                System.out.println("... (showing first 30 of " + markets.size() + " markets)");
                break;
            }

            System.out.printf("%-16s %-8s %-6s %-8s %-12s %-14s %-14s%n",
                    m.symbol,
                    m.type,
                    m.active,
                    m.base,
                    m.quote,
                    m.precision != null ? m.precision.price : "n/a",
                    m.precision != null ? m.precision.amount : "n/a");
        }

        System.out.println("\nTotal markets loaded: " + markets.size());
    }
}
