package examples;

import io.github.ccxt.BaseExchange;
import io.github.ccxt.Exchange;
import io.github.ccxt.types.Ticker;

import java.util.Map;

/**
 * Compare the price of a symbol across multiple exchanges.
 * Uses Exchange.dynamicallyCreateInstance for the generic/dynamic pattern.
 * Trading methods on the Exchange tier now return their unified type
 * (fetchTicker -> Ticker), so a generic Exchange reference is typed too.
 *
 * Usage:
 *   cd java && ./gradlew :examples:run -PmainClass=examples.CompareExchanges
 */
public class CompareExchanges {

    public static void main(String[] args) {
        String symbol = args.length > 0 ? args[0] : "BTC/USDT";
        String[] exchangeIds = {"binance", "bybit", "okx", "kraken", "bitget"};

        System.out.println("Comparing " + symbol + " across exchanges\n");

        System.out.printf("%-12s %12s %12s %12s %10s%n",
                "Exchange", "Last", "Bid", "Ask", "Spread");
        System.out.println("-".repeat(60));

        for (String id : exchangeIds) {
            try {
                // Trading methods (fetchTicker/createOrder/...) live on the Exchange tier,
                // not BaseExchange, so use Exchange here (every crypto venue is an Exchange).
                Exchange exchange = (Exchange) BaseExchange.dynamicallyCreateInstance(id, null);
                exchange.loadMarkets(false).join();

                // Typed: fetchTicker returns CompletableFuture<Ticker>
                Ticker ticker = exchange.fetchTicker(symbol).join();

                Double last = ticker.last;
                Double bid = ticker.bid;
                Double ask = ticker.ask;

                double spread = 0;
                if (ask != null && bid != null) {
                    spread = ask - bid;
                }

                System.out.printf("%-12s %12.2f %12.2f %12.2f %10.2f%n",
                        id,
                        safe(last),
                        safe(bid),
                        safe(ask),
                        spread);
            } catch (Exception e) {
                System.out.printf("%-12s %s%n", id, "ERROR: " + rootMessage(e));
            }
        }
    }

    static Double toDouble(Object v) {
        if (v instanceof Number n) return n.doubleValue();
        return null;
    }

    static double safe(Double v) { return v != null ? v : 0.0; }

    static String rootMessage(Exception e) {
        Throwable c = e;
        while (c.getCause() != null) c = c.getCause();
        String msg = c.getMessage();
        return msg != null && msg.length() > 60 ? msg.substring(0, 60) + "..." : msg;
    }
}
