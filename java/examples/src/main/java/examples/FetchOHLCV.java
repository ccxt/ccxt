package examples;

import io.github.ccxt.exchanges.Binance;
import io.github.ccxt.types.OHLCV;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Fetch OHLCV (candlestick) data for a symbol.
 *
 * Usage:
 *   cd java && ./gradlew :examples:run -PmainClass=examples.FetchOHLCV
 *   cd java && ./gradlew :examples:run -PmainClass=examples.FetchOHLCV --args="BTC/USDT 1d"
 */
public class FetchOHLCV {

    static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")
            .withZone(ZoneId.systemDefault());

    public static void main(String[] args) {
        String symbol = args.length > 0 ? args[0] : "BTC/USDT";
        String timeframe = args.length > 1 ? args[1] : "1h";

        System.out.println("Symbol:    " + symbol);
        System.out.println("Timeframe: " + timeframe);
        System.out.println();

        Binance exchange = new Binance();

        exchange.loadMarkets(false);

        List<OHLCV> candles = exchange.fetchOHLCV(symbol, timeframe, null, 20L, null);

        System.out.printf("%-18s %12s %12s %12s %12s %14s%n",
                "Date", "Open", "High", "Low", "Close", "Volume");
        System.out.println("-".repeat(82));

        for (OHLCV c : candles) {
            String date = FMT.format(Instant.ofEpochMilli(c.timestamp));
            System.out.printf("%-18s %12.2f %12.2f %12.2f %12.2f %14.4f%n",
                    date, c.open, c.high, c.low, c.close, c.volume);
        }

        System.out.println("\nTotal candles: " + candles.size());
    }
}
