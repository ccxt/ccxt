package examples;

import io.github.ccxt.exchanges.Binance;
import io.github.ccxt.types.Trade;

import java.util.List;

/**
 * Fetch recent public trades for a symbol.
 *
 * Usage:
 *   cd java && ./gradlew :examples:run -PmainClass=examples.FetchTrades
 */
public class FetchTrades {

    public static void main(String[] args) {
        String symbol = args.length > 0 ? args[0] : "BTC/USDT";

        System.out.println("Symbol: " + symbol);
        System.out.println();

        Binance exchange = new Binance();

        exchange.loadMarkets(false);

        List<Trade> trades = exchange.fetchTrades(symbol, null, 20L, null);

        System.out.printf("%-24s %-5s %12s %12s %14s%n",
                "Datetime", "Side", "Price", "Amount", "Cost");
        System.out.println("-".repeat(70));

        for (Trade t : trades) {
            System.out.printf("%-24s %-5s %12.2f %12.6f %14.2f%n",
                    t.datetime,
                    t.side,
                    safe(t.price),
                    safe(t.amount),
                    safe(t.cost));
        }

        System.out.println("\nTotal trades: " + trades.size());
    }

    static double safe(Double v) { return v != null ? v : 0.0; }
}
