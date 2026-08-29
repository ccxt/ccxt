package examples;

import io.github.ccxt.exchanges.Binance;
import io.github.ccxt.errors.*;
import io.github.ccxt.types.Ticker;

import java.util.Map;
import java.util.concurrent.CompletionException;

/**
 * Demonstrates error handling patterns with CCXT Java.
 *
 * Usage:
 *   cd java && ./gradlew :examples:run -PmainClass=examples.ErrorHandling
 */
public class ErrorHandling {

    public static void main(String[] args) {
        Binance exchange = new Binance();

        exchange.loadMarkets(false);

        // 1. Handle bad symbol
        System.out.println("--- Test 1: Invalid symbol ---");
        try {
            exchange.fetchTicker("INVALID/NOTEXIST");
        } catch (CompletionException e) {
            Throwable cause = unwrap(e);
            if (cause instanceof BadSymbol) {
                System.out.println("Caught BadSymbol: " + cause.getMessage());
            } else if (cause instanceof ExchangeError) {
                System.out.println("Caught ExchangeError: " + cause.getMessage());
            } else {
                System.out.println("Caught: " + cause.getClass().getSimpleName() + ": " + cause.getMessage());
            }
        }

        // 2. Handle authentication error
        System.out.println("\n--- Test 2: Auth required without credentials ---");
        try {
            exchange.fetchBalance((Map<String, Object>) null);
        } catch (CompletionException e) {
            Throwable cause = unwrap(e);
            if (cause instanceof AuthenticationError) {
                System.out.println("Caught AuthenticationError: " + shorten(cause.getMessage()));
            } else if (cause instanceof ExchangeError) {
                System.out.println("Caught ExchangeError: " + shorten(cause.getMessage()));
            } else {
                System.out.println("Caught: " + cause.getClass().getSimpleName() + ": " + shorten(cause.getMessage()));
            }
        }

        // 3. Successful request
        System.out.println("\n--- Test 3: Successful ticker fetch ---");
        try {
            Ticker ticker = exchange.fetchTicker("BTC/USDT");
            System.out.println("Success: BTC/USDT last=" + ticker.last);
        } catch (CompletionException e) {
            Throwable cause = unwrap(e);
            System.out.println("Unexpected error: " + cause.getMessage());
        }

        System.out.println("\nAll error handling tests completed.");
    }

    static Throwable unwrap(Throwable t) {
        while ((t instanceof CompletionException || t instanceof java.util.concurrent.ExecutionException)
                && t.getCause() != null) {
            t = t.getCause();
        }
        while (t instanceof RuntimeException && t.getCause() != null
                && !(t instanceof BaseError)) {
            t = t.getCause();
        }
        return t;
    }

    static String shorten(String s) {
        if (s == null) return "null";
        return s.length() > 100 ? s.substring(0, 100) + "..." : s;
    }
}
