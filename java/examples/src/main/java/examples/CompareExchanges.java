package examples;

import io.github.ccxt.Exchange;

import java.util.Map;

/**
 * Compare the price of a symbol across multiple exchanges.
 * Uses Exchange.dynamicallyCreateInstance for the generic/dynamic pattern.
 * The result is untyped (Object/Map) since the exchange type is unknown at compile time.
 *
 * Usage:
 *   cd java && ./gradlew :examples:run -PmainClass=examples.CompareExchanges
 */
public class CompareExchanges {

    @SuppressWarnings("unchecked")
    public static void main(String[] args) {
        String symbol = args.length > 0 ? args[0] : "BTC/USDT";
        String[] exchangeIds = {"binance", "bybit", "okx", "kraken", "bitget"};

        System.out.println("Comparing " + symbol + " across exchanges\n");

        System.out.printf("%-12s %12s %12s %12s %10s%n",
                "Exchange", "Last", "Bid", "Ask", "Spread");
        System.out.println("-".repeat(60));

        for (String id : exchangeIds) {
            try {
                Exchange exchange = Exchange.dynamicallyCreateInstance(id, null);
                exchange.loadMarkets(false).join();

                // Untyped: fetchTicker returns CompletableFuture<Object>
                Map<String, Object> ticker = (Map<String, Object>) exchange.fetchTicker(symbol).join();

                Double last = toDouble(ticker.get("last"));
                Double bid = toDouble(ticker.get("bid"));
                Double ask = toDouble(ticker.get("ask"));

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
