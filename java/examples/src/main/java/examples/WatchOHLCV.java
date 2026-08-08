package examples;

import io.github.ccxt.exchanges.pro.Binance;
import io.github.ccxt.types.OHLCV;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Watch real-time OHLCV (candlestick) updates via WebSocket.
 * Shows the latest candles as they update in real-time.
 *
 * Usage:
 *   cd java && ./gradlew :examples:run -PmainClass=examples.WatchOHLCV
 *   cd java && ./gradlew :examples:run -PmainClass=examples.WatchOHLCV --args="ETH/USDT 5m"
 */
public class WatchOHLCV {

    static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")
            .withZone(ZoneId.systemDefault());

    public static void main(String[] args) throws Exception {
        String symbol = args.length > 0 ? args[0] : "BTC/USDT";
        String timeframe = args.length > 1 ? args[1] : "1m";

        Binance exchange = new Binance();
        exchange.verbose = false;

        System.out.println("Loading markets...");
        exchange.loadMarkets(false);
        System.out.println("Watching " + symbol + " OHLCV (" + timeframe + ", 15 updates)...\n");

        System.out.printf("%-18s %12s %12s %12s %12s %14s%n",
                "Date", "Open", "High", "Low", "Close", "Volume");
        System.out.println("-".repeat(82));

        for (int i = 0; i < 15; i++) {
            List<OHLCV> candles = exchange.watchOHLCV(symbol, timeframe, null, null, null);

            // Print the latest candle
            if (!candles.isEmpty()) {
                OHLCV c = candles.get(candles.size() - 1);
                String date = FMT.format(Instant.ofEpochMilli(c.timestamp));
                System.out.printf("%-18s %12.2f %12.2f %12.2f %12.2f %14.4f%n",
                        date, c.open, c.high, c.low, c.close, c.volume);
            }
        }

        System.out.println("\nDone!");
        System.exit(0);
    }
}
