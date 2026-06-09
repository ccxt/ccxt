package examples;

import io.github.ccxt.exchanges.Binance;
import io.github.ccxt.types.Ticker;
import io.github.ccxt.types.Tickers;

import java.util.List;

/**
 * Fetch multiple tickers and display a price comparison table.
 *
 * Usage:
 *   cd java && ./gradlew :examples:run -PmainClass=examples.FetchMultipleTickers
 */
public class FetchMultipleTickers {

    public static void main(String[] args) {
        Binance exchange = new Binance();

        exchange.loadMarkets(false);

        List<String> symbols = List.of(
                "BTC/USDT", "ETH/USDT", "SOL/USDT", "XRP/USDT", "DOGE/USDT"
        );

        Tickers tickers = exchange.fetchTickers(symbols, null);

        System.out.printf("%-12s %12s %12s %12s %10s %12s%n",
                "Symbol", "Last", "Bid", "Ask", "Change%", "Volume");
        System.out.println("-".repeat(72));

        for (String symbol : symbols) {
            Ticker t = tickers.get(symbol);
            if (t != null) {
                System.out.printf("%-12s %12.4f %12.4f %12.4f %9.2f%% %12.2f%n",
                        t.symbol,
                        safe(t.last),
                        safe(t.bid),
                        safe(t.ask),
                        safe(t.percentage),
                        safe(t.baseVolume));
            }
        }
    }

    static double safe(Double v) { return v != null ? v : 0.0; }
}
