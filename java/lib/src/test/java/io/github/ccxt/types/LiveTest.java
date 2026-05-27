package io.github.ccxt.types;

import io.github.ccxt.Exchange;
import io.github.ccxt.exchanges.Binance;

import java.util.List;
import java.util.Map;

/**
 * Live integration test calling Binance public endpoints through ExchangeTyped.
 *
 * Run: cd java && ./gradlew :lib:liveTest
 *
 * If Binance is geo-blocked, pass a different exchange:
 *   ./gradlew :lib:liveTest --args="bybit"
 */
public class LiveTest {

    static void check(boolean cond, String msg) {
        if (!cond) throw new AssertionError("FAIL: " + msg);
    }

    public static void main(String[] args) throws Exception {
        System.out.println("=== CCXT Java Typed Wrapper - Live Test (binance) ===\n");

        // 1. Create exchange instance
        var exchange = new Binance();
        exchange.verbose = false;

        // 2. Load markets
        System.out.println("[1] Loading markets...");
        Map<String, MarketInterface> markets = exchange.loadMarkets(false);
        check(markets.size() > 0, "markets should not be empty");
        System.out.println("    Loaded " + markets.size() + " markets");
        MarketInterface btcUsdt = markets.get("BTC/USDT");
        if (btcUsdt != null) {
            check(btcUsdt.symbol != null, "symbol should not be null");
            System.out.println("    BTC/USDT: id=" + btcUsdt.id + " type=" + btcUsdt.type
                + " spot=" + btcUsdt.spot + " active=" + btcUsdt.active);
            if (btcUsdt.precision != null) {
                System.out.println("    precision: amount=" + btcUsdt.precision.amount + " price=" + btcUsdt.precision.price);
            }
            if (btcUsdt.limits != null && btcUsdt.limits.amount != null) {
                System.out.println("    limits.amount: min=" + btcUsdt.limits.amount.min + " max=" + btcUsdt.limits.amount.max);
            }
        }
        System.out.println("    PASS\n");

        // 3. Fetch ticker
        System.out.println("[2] Fetching BTC/USDT ticker...");
        Ticker ticker = exchange.fetchTicker("BTC/USDT");
        check(ticker.symbol != null, "ticker.symbol should not be null");
        check(ticker.last != null && ticker.last > 0, "ticker.last should be > 0");
        System.out.println("    symbol=" + ticker.symbol + " last=" + ticker.last + " bid=" + ticker.bid + " ask=" + ticker.ask);
        System.out.println("    high=" + ticker.high + " low=" + ticker.low + " volume=" + ticker.baseVolume);
        System.out.println("    PASS\n");

        // 4. Fetch order book
        System.out.println("[3] Fetching BTC/USDT order book...");
        OrderBook ob = exchange.fetchOrderBook("BTC/USDT");
        check(ob.bids != null && !ob.bids.isEmpty(), "orderbook bids should not be empty");
        check(ob.asks != null && !ob.asks.isEmpty(), "orderbook asks should not be empty");
        System.out.println("    bids=" + ob.bids.size() + " asks=" + ob.asks.size());
        System.out.println("    best bid: " + ob.bids.get(0).get(0) + " x " + ob.bids.get(0).get(1));
        System.out.println("    best ask: " + ob.asks.get(0).get(0) + " x " + ob.asks.get(0).get(1));
        check(ob.bids.get(0).get(0) > 0, "bid price should be > 0");
        System.out.println("    PASS\n");

        // 5. Fetch recent trades
        System.out.println("[4] Fetching BTC/USDT trades...");
        List<Trade> trades = exchange.fetchTrades("BTC/USDT");
        check(trades != null && !trades.isEmpty(), "trades should not be empty");
        System.out.println("    got " + trades.size() + " trades");
        Trade first = trades.get(0);
        check(first.price != null && first.price > 0, "trade.price should be > 0");
        check(first.amount != null && first.amount > 0, "trade.amount should be > 0");
        System.out.println("    first: " + first.datetime + " " + first.side + " " + first.amount + " @ " + first.price);
        System.out.println("    PASS\n");

        // 6. Fetch OHLCV (using typed wrapper with optional params)
        System.out.println("[5] Fetching BTC/USDT OHLCV...");
        List<OHLCV> candles = exchange.fetchOHLCV("BTC/USDT", "1h", null, 3L, null);
        check(candles != null && !candles.isEmpty(), "candles should not be empty");
        System.out.println("    got " + candles.size() + " candles");
        OHLCV c = candles.get(0);
        check(c.timestamp != null && c.timestamp > 0, "ohlcv.timestamp should be > 0");
        check(c.open != null && c.open > 0, "ohlcv.open should be > 0");
        System.out.println("    first: ts=" + c.timestamp + " O=" + c.open + " H=" + c.high + " L=" + c.low + " C=" + c.close);
        System.out.println("    PASS\n");

        // 7. Test async variant
        System.out.println("[6] Testing async fetchTicker (ETH/USDT)...");
        var future = exchange.fetchTickerAsync("ETH/USDT", null);
        Ticker ethTicker = future.get();
        check(ethTicker.symbol != null, "async ticker.symbol should not be null");
        check(ethTicker.last != null && ethTicker.last > 0, "async ticker.last should be > 0");
        System.out.println("    ETH/USDT last=" + ethTicker.last + " bid=" + ethTicker.bid + " ask=" + ethTicker.ask);
        System.out.println("    PASS\n");

        System.out.println("=== All 6 live tests PASSED! ===");
    }
}
