/**
 * JN-4 runtime smoke test — exercises nested members (precision/limits/MinMax/fee/trades/tiers)
 * of the Java nominal type classes against the compiled output.
 *
 * Run from the repo worktree root:
 *   javac -cp java/lib/build/classes/java/main -d /tmp/jn4/out JN-4-runtime-smoke.java
 *   java  -cp java/lib/build/classes/java/main:/tmp/jn4/out JN4Smoke
 * (class is package-private so the file name does not need to match; expect "ALL PASS")
 */
import io.github.ccxt.types.*;
import java.util.*;

class JN4Smoke {
    static int failures = 0;

    static void check(String label, boolean ok) {
        System.out.println((ok ? "PASS " : "FAIL ") + label);
        if (!ok) failures++;
    }

    static boolean eq(Object a, Object b) { return Objects.equals(a, b); }

    public static void main(String[] args) {
        // ---------- MarketInterface: precision / limits / marginModes / outcomes ----------
        Map<String, Object> marketRaw = new LinkedHashMap<>();
        marketRaw.put("id", "BTC/USDT");
        marketRaw.put("symbol", "BTC/USDT");
        marketRaw.put("spot", true);
        Map<String, Object> precision = new LinkedHashMap<>();
        precision.put("amount", 0.001);
        precision.put("price", 0.01);
        marketRaw.put("precision", precision);
        Map<String, Object> limits = new LinkedHashMap<>();
        Map<String, Object> limitAmount = new LinkedHashMap<>();
        limitAmount.put("min", 1.0);
        limitAmount.put("max", 100.0);
        limits.put("amount", limitAmount);
        marketRaw.put("limits", limits);
        Map<String, Object> info = new LinkedHashMap<>();
        info.put("venueKey", "abc");
        marketRaw.put("info", info);

        MarketInterface m = new MarketInterface(marketRaw);
        check("MarketInterface.precision is Precision", m.precision instanceof Precision);
        check("precision.amount == 0.001", eq(m.precision.amount, 0.001));
        check("precision.price == 0.01", eq(m.precision.price, 0.01));
        check("precision.cost absent -> null (no fabrication)", m.precision.cost == null);
        check("precision.base absent -> null", m.precision.base == null);
        check("MarketInterface.limits is Limits", m.limits instanceof Limits);
        check("limits.amount is MinMax", m.limits.amount instanceof MinMax);
        check("limits.amount.min == 1.0 / max == 100.0", eq(m.limits.amount.min, 1.0) && eq(m.limits.amount.max, 100.0));
        check("limits.cost absent -> null", m.limits.cost == null);
        check("limits.leverage/price/market absent -> null", m.limits.leverage == null && m.limits.price == null && m.limits.market == null);
        check("marginModes absent -> null", m.marginModes == null);
        check("outcomes absent -> null (not empty list)", m.outcomes == null);
        check("numericId absent -> null", m.numericId == null);
        check("active absent -> null", m.active == null);
        check("info round-trips", m.info != null && eq(m.info.get("venueKey"), "abc"));

        // ---------- Order: fee + trades ----------
        Map<String, Object> feeRaw = new LinkedHashMap<>();
        feeRaw.put("currency", "USDT");
        feeRaw.put("cost", 1.5);
        Map<String, Object> tradeRaw = new LinkedHashMap<>();
        tradeRaw.put("id", "t1");
        tradeRaw.put("price", 50.0);
        tradeRaw.put("amount", 2.0);
        tradeRaw.put("fee", feeRaw);
        Map<String, Object> orderRaw = new LinkedHashMap<>();
        orderRaw.put("id", "o1");
        orderRaw.put("symbol", "BTC/USDT");
        orderRaw.put("side", "buy");
        orderRaw.put("type", "limit");
        orderRaw.put("fee", feeRaw);
        orderRaw.put("trades", new ArrayList<>(Arrays.asList(tradeRaw)));
        Order o = new Order(orderRaw);
        check("Order.fee is Fee", o.fee instanceof Fee);
        check("Order.fee.cost == 1.5, rate absent -> null", eq(o.fee.cost, 1.5) && o.fee.rate == null);
        check("Order.trades is List<Trade>", o.trades instanceof List && o.trades.size() == 1 && o.trades.get(0) instanceof Trade);
        check("Order.trades[0].fee.cost == 1.5", eq(o.trades.get(0).fee.cost, 1.5));
        check("Order.remaining absent -> null", o.remaining == null);
        check("Order.lastUpdateTimestamp absent -> null", o.lastUpdateTimestamp == null);
        check("Order.fee absent on second order -> null", new Order(new LinkedHashMap<>(Map.of("id", "o2", "symbol", "X"))).fee == null);

        // ---------- Trade ----------
        Trade t = new Trade(tradeRaw);
        check("Trade.fee is Fee", t.fee instanceof Fee);
        check("Trade.amount == 2.0", eq(t.amount, 2.0));
        check("Trade.timestamp absent -> null", t.timestamp == null);

        // ---------- Ticker (all scalars) ----------
        Map<String, Object> tickerRaw = new LinkedHashMap<>();
        tickerRaw.put("symbol", "BTC/USDT");
        tickerRaw.put("bid", 49999.5);
        Ticker tk = new Ticker(tickerRaw);
        check("Ticker.bid == 49999.5", eq(tk.bid, 49999.5));
        check("Ticker.ask absent -> null", tk.ask == null);
        check("Ticker.timestamp absent -> null", tk.timestamp == null);
        check("Ticker.info absent -> null", tk.info == null);

        // ---------- Position / Balance ----------
        Position p = new Position(new LinkedHashMap<>(Map.of("symbol", "BTC/USDT", "side", "long", "contracts", 3.0)));
        check("Position.contracts == 3.0", eq(p.contracts, 3.0));
        check("Position.entryPrice absent -> null", p.entryPrice == null);
        Balance b = new Balance(new LinkedHashMap<>(Map.of("free", 1.0, "used", 2.0, "total", 3.0)));
        check("Balance.free/used/total", eq(b.free, 1.0) && eq(b.used, 2.0) && eq(b.total, 3.0));
        check("Balance.debt absent -> null", b.debt == null);

        // ---------- TradingFeeInterface.tiers passthrough (Dict) ----------
        Map<String, Object> tiers = new LinkedHashMap<>();
        tiers.put("maker", Arrays.asList(Arrays.asList(0.0, 0.001)));
        tiers.put("taker", Arrays.asList(Arrays.asList(0.0, 0.002)));
        Map<String, Object> tfRaw = new LinkedHashMap<>();
        tfRaw.put("symbol", "BTC/USDT");
        tfRaw.put("maker", 0.001);
        tfRaw.put("taker", 0.002);
        tfRaw.put("tiers", tiers);
        TradingFeeInterface tf = new TradingFeeInterface(tfRaw);
        check("TradingFeeInterface.tiers round-trips as Map", tf.tiers instanceof Map && tf.tiers.containsKey("maker"));

        // ---------- malformed *structure* is not tolerated: nested-object conversion casts,
        // same as C# (`(Dictionary<string,object>)`) and Go (`data.(map[string]any)` panics).
        // Only missing/null values are tolerated (-> null). ----------
        boolean threw = false;
        try { new MarketInterface(new LinkedHashMap<>(Map.of("precision", "not-a-map"))); }
        catch (ClassCastException e) { threw = true; }
        check("non-map precision throws ClassCastException (port-family contract)", threw);
        // non-list for a list member IS guarded -> null
        MarketInterface bad = new MarketInterface(new LinkedHashMap<>(Map.of("outcomes", "not-a-list")));
        check("non-list outcomes -> null", bad.outcomes == null);
        Map<String, Object> nullLimits = new HashMap<>();
        nullLimits.put("limits", null);
        check("null nested limits -> null", new MarketInterface(nullLimits).limits == null);

        System.out.println(failures == 0 ? "ALL PASS" : (failures + " FAILURES"));
        if (failures > 0) System.exit(1);
    }
}
