package examples;

import io.github.ccxt.Exchange;

import java.util.Map;

/**
 * Show details for an exchange: name, version, markets, supported features.
 * Uses Exchange.dynamicallyCreateInstance for the generic/dynamic pattern.
 *
 * Usage:
 *   cd java && ./gradlew :examples:run -PmainClass=examples.ListExchanges
 *   cd java && ./gradlew :examples:run -PmainClass=examples.ListExchanges --args="bybit"
 */
public class ListExchanges {

    @SuppressWarnings("unchecked")
    public static void main(String[] args) {
        String exchangeId = args.length > 0 ? args[0] : "binance";

        System.out.println("--- " + exchangeId + " details ---\n");

        Exchange exchange = Exchange.dynamicallyCreateInstance(exchangeId, null);

        System.out.println("ID:          " + exchange.id);
        System.out.println("Version:     " + exchange.version);
        System.out.println("Rate limit:  " + (int) exchange.rateLimit + " ms");

        // Load and summarize markets (untyped: returns CompletableFuture<Object>)
        Map<String, Object> markets = (Map<String, Object>) exchange.loadMarkets(false).join();
        long spotCount = markets.values().stream()
                .filter(m -> Boolean.TRUE.equals(((Map<String, Object>) m).get("spot"))).count();
        long futuresCount = markets.values().stream()
                .filter(m -> "swap".equals(((Map<String, Object>) m).get("type"))).count();
        long optionCount = markets.values().stream()
                .filter(m -> "option".equals(((Map<String, Object>) m).get("type"))).count();

        System.out.println("Markets:     " + markets.size() + " total");
        System.out.println("  Spot:      " + spotCount);
        System.out.println("  Futures:   " + futuresCount);
        System.out.println("  Options:   " + optionCount);

        // Show feature support
        System.out.println("\nSupported features:");
        Map<String, Object> has = (Map<String, Object>) exchange.has;
        String[] features = {"fetchTicker", "fetchOrderBook", "fetchOHLCV", "fetchTrades",
                "fetchBalance", "createOrder", "cancelOrder", "fetchOpenOrders",
                "fetchMyTrades", "watchTicker", "watchOrderBook", "watchTrades"};
        for (String f : features) {
            Object val = has.get(f);
            String status;
            if (Boolean.TRUE.equals(val)) status = "YES";
            else if (val instanceof String s) status = s;  // e.g. "emulated"
            else status = "no";
            System.out.printf("  %-20s %s%n", f, status);
        }
    }
}
