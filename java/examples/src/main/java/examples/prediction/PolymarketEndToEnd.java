package examples.prediction;

import io.github.ccxt.exchanges.prediction.Polymarket;
import io.github.ccxt.types.PredictionEvent;
import io.github.ccxt.types.PredictionMarket;
import io.github.ccxt.types.PredictionOrder;
import io.github.ccxt.types.PredictionOrderBook;
import io.github.ccxt.types.PredictionOutcome;
import io.github.ccxt.types.PredictionTicker;
import io.github.ccxt.types.PredictionTrade;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Polymarket end-to-end example (read market data + place/fetch/cancel one order).
 *
 * Flow:
 *   1. pick a high-volume event, a market inside it, and an outcome with a live two-sided book
 *   2. fetch the order book, ticker and recent trades for that outcome
 *   3. place a resting limit BUY well below the book, fetch it back, then cancel it
 *
 * Usage:
 *   POLYMARKET_PRIVATEKEY=... POLYMARKET_WALLETADDRESS=0x... \
 *   ./gradlew :examples:run -PmainClass=examples.prediction.PolymarketEndToEnd
 *
 * walletAddress is the polymarket account wallet (the proxy / deposit wallet shown in
 * your polymarket profile), privateKey is the key of the EOA that owns it.
 */
public class PolymarketEndToEnd {

    static final double MAX_NOTIONAL_USD = 25;  // hard cap per trade
    static final double ORDER_SIZE_SHARES = 5;  // polymarket minimum order size

    public static void main(String[] args) {
        String privateKey = System.getenv("POLYMARKET_PRIVATEKEY");
        String walletAddress = System.getenv("POLYMARKET_WALLETADDRESS");
        if (privateKey == null || walletAddress == null) {
            System.out.println("Set POLYMARKET_PRIVATEKEY and POLYMARKET_WALLETADDRESS env vars first.");
            return;
        }
        Map<String, Object> config = new HashMap<>();
        config.put("privateKey", privateKey);
        config.put("walletAddress", walletAddress);
        Polymarket exchange = new Polymarket(config);

        // 1) pick a high-volume event and an outcome with a live two-sided book ------------
        Map<String, Object> eventsParams = new HashMap<>();
        eventsParams.put("sort", "volume");
        eventsParams.put("limit", 15);
        List<PredictionEvent> events = exchange.fetchEvents(eventsParams);
        String symbol = null;
        PredictionOrderBook book = null;
        double tick = 0.01;
        int probes = 0;
        outer:
        for (PredictionEvent event : events) {
            if (event.markets == null) continue;
            for (PredictionMarket market : event.markets) {
                if (market.outcomes == null) continue;
                for (PredictionOutcome outcome : market.outcomes) {
                    if (probes >= 20 || outcome.outcome == null) {
                        break outer;
                    }
                    probes += 1;
                    PredictionOrderBook candidate = exchange.fetchOrderBook(outcome.outcome);
                    if (candidate.bids != null && !candidate.bids.isEmpty() && candidate.asks != null && !candidate.asks.isEmpty()) {
                        symbol = outcome.outcome;
                        book = candidate;
                        if (outcome.precision != null && outcome.precision.price != null) {
                            tick = outcome.precision.price;
                        }
                        System.out.println("event:    " + event.title);
                        System.out.println("outcome:  " + symbol + " (" + outcome.label + ")");
                        break outer;
                    }
                }
            }
        }
        if (symbol == null) {
            System.out.println("Could not find an outcome with a live two-sided order book right now.");
            return;
        }

        // 2) market data for the chosen outcome --------------------------------------------
        List<Double> bestBid = book.bids.get(0);
        List<Double> bestAsk = book.asks.get(0);
        System.out.println("\n--- market data ---");
        System.out.println("orderbook bid/ask: " + bestBid + " / " + bestAsk);
        try {
            PredictionTicker ticker = exchange.fetchTicker(symbol);
            System.out.println("ticker bid/ask/last: " + ticker.bid + " / " + ticker.ask + " / " + ticker.last);
        } catch (Exception e) {
            System.out.println("ticker:        n/a (" + e.getClass().getSimpleName() + ")");
        }
        try {
            List<PredictionTrade> trades = exchange.fetchTrades(symbol, null, 3L);
            System.out.println("recent trades: " + trades.size() + (trades.isEmpty() ? "" : (" last @ " + trades.get(0).price)));
        } catch (Exception e) {
            System.out.println("trades:        n/a (" + e.getClass().getSimpleName() + ")");
        }

        // 3) place a resting limit BUY well below the book, fetch it, then cancel -----------
        double bidPrice = bestBid.get(0);
        // half the best bid, floored to the tick — far below the ask, so it cannot fill
        double price = Math.floor((bidPrice * 0.5) / tick) * tick;
        price = Math.max(tick, Math.round(price * 10000.0) / 10000.0);
        double notional = ORDER_SIZE_SHARES * price;
        System.out.println("\n--- order ---");
        System.out.println("placing limit BUY " + ORDER_SIZE_SHARES + " shares @ " + price + " (notional " + (Math.round(notional * 100.0) / 100.0) + " USD)");
        if (notional >= MAX_NOTIONAL_USD) {
            System.out.println("ABORT: notional >= " + MAX_NOTIONAL_USD + " USD safety cap.");
            return;
        }

        PredictionOrder order = null;
        int exitCode = 0;
        try {
            order = exchange.createOrder(symbol, "limit", "buy", ORDER_SIZE_SHARES, price);
            System.out.println("placed:  id " + order.id + " | status " + order.status);
            PredictionOrder fetched = exchange.fetchOrder(order.id, symbol);
            System.out.println("fetched: id " + fetched.id + " | status " + fetched.status + " | remaining " + fetched.remaining);
        } catch (Exception e) {
            System.out.println("order flow failed: " + e);
            exitCode = 1;
        } finally {
            if (order != null && order.id != null) {
                PredictionOrder canceled = exchange.cancelOrder(order.id, symbol);
                System.out.println("canceled: id " + canceled.id + " | status " + canceled.status);
            }
        }
        System.exit(exitCode); // the exchange keeps a background thread pool alive
    }
}
