package examples;

import io.github.ccxt.exchanges.Binance;
import io.github.ccxt.types.Ticker;
import io.github.ccxt.types.Trade;
import io.github.ccxt.types.OrderBook;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Demonstrates both the typed unified API and exchange-specific implicit API methods.
 *
 * The unified API (fetchTicker, fetchTrades, etc.) returns typed objects directly.
 * The implicit API (publicGetTicker24hr, sapiGetAccount, etc.) provides access to
 * exchange-specific endpoints that may not have a unified wrapper.
 *
 * Usage:
 *   cd java && ./gradlew :examples:run -PmainClass=examples.ImplicitApi
 */
public class ImplicitApi {

    @SuppressWarnings("unchecked")
    public static void main(String[] args) throws Exception {

        // Create a concrete exchange class to access exchange-specific methods
        Binance exchange = new Binance();

        exchange.loadMarkets(false);

        String symbol = "BTC/USDT";

        // ==========================================
        // 1. Unified API — typed methods on Binance
        // ==========================================
        System.out.println("=== Unified Typed API ===\n");

        // fetchTicker returns Ticker directly
        Ticker ticker = exchange.fetchTicker(symbol);
        System.out.println("Ticker:  " + ticker.symbol + "  last=" + ticker.last
                + "  bid=" + ticker.bid + "  ask=" + ticker.ask);

        // fetchTrades returns List<Trade> directly
        List<Trade> trades = exchange.fetchTrades(symbol, null, 3L, null);
        System.out.println("\nRecent trades:");
        for (Trade t : trades) {
            System.out.printf("  %s  %-4s  price=%-12.2f  amount=%.6f%n",
                    t.datetime, t.side, t.price, t.amount);
        }

        // fetchOrderBook returns OrderBook directly
        OrderBook ob = exchange.fetchOrderBook(symbol, 5L, null);
        System.out.println("\nOrder book (top 5):");
        System.out.println("  Bids:");
        for (List<Double> bid : ob.bids) {
            System.out.printf("    %.2f x %.6f%n", bid.get(0), bid.get(1));
        }
        System.out.println("  Asks:");
        for (List<Double> ask : ob.asks) {
            System.out.printf("    %.2f x %.6f%n", ask.get(0), ask.get(1));
        }

        // ==========================================
        // 2. Implicit API — exchange-specific endpoints
        // ==========================================
        System.out.println("\n=== Implicit (Exchange-Specific) API ===\n");

        // Binance publicGetTicker24hr — returns raw exchange response as Object
        Map<String, Object> params = new HashMap<>();
        params.put("symbol", "BTCUSDT"); // Binance uses native symbol format
        Object rawTicker = exchange.publicGetTicker24hr(params).join();
        Map<String, Object> tickerMap = (Map<String, Object>) rawTicker;
        System.out.println("publicGetTicker24hr (raw Binance response):");
        System.out.println("  symbol:      " + tickerMap.get("symbol"));
        System.out.println("  lastPrice:   " + tickerMap.get("lastPrice"));
        System.out.println("  volume:      " + tickerMap.get("volume"));
        System.out.println("  priceChange: " + tickerMap.get("priceChange"));

        // Binance publicGetDepth — raw order book
        params.clear();
        params.put("symbol", "BTCUSDT");
        params.put("limit", 3);
        Object rawDepth = exchange.publicGetDepth(params).join();
        Map<String, Object> depthMap = (Map<String, Object>) rawDepth;
        List<Object> bids = (List<Object>) depthMap.get("bids");
        System.out.println("\npublicGetDepth (raw Binance response):");
        System.out.println("  top bid: " + bids.get(0));

        // Binance publicGetExchangeInfo — server info
        Object rawInfo = exchange.publicGetExchangeInfo(null).join();
        Map<String, Object> infoMap = (Map<String, Object>) rawInfo;
        System.out.println("\npublicGetExchangeInfo:");
        System.out.println("  timezone:    " + infoMap.get("timezone"));
        System.out.println("  serverTime:  " + infoMap.get("serverTime"));
        List<Object> symbols = (List<Object>) infoMap.get("symbols");
        System.out.println("  symbols:     " + symbols.size() + " trading pairs");

        System.out.println("\nDone!");
    }
}
