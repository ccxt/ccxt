package tests.base;
import io.github.ccxt.Exchange;
import io.github.ccxt.base.SafeMethods;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

import tests.BaseTest;

public class TestLanguageSpecific extends BaseTest
{
    public void testLanguageSpecific()
    {
        testSafeMethodsCorrectness();
        testSafeMethodsConcurrentReadDuringWrite();
        testSafeMethodsPerformance();
    }

    /**
     * Regression suite for SafeValueN / SafeStringN — locks in behaviour on
     * the cases that matter for the WS hot path: String-keyed maps (the
     * common case), Integer-keyed maps (the slow-path coercion), missing
     * keys, empty-string values, null values, nested-key resolution order.
     */
    private void testSafeMethodsCorrectness() {
        Exchange ex = new Exchange(new HashMap<String, Object>() {{ put("id", "unit"); }});

        Map<String, Object> stringKeyed = new HashMap<>();
        stringKeyed.put("a", 1);
        stringKeyed.put("b", "two");
        stringKeyed.put("empty", "");
        stringKeyed.put("nullVal", null);

        Assert(equals(ex.safeValue(stringKeyed, "a"), 1));
        Assert(equals(ex.safeValue(stringKeyed, "b"), "two"));
        // empty-string and explicit null are treated as misses → defaultValue
        Assert(equals(ex.safeValue(stringKeyed, "empty", "fallback"), "fallback"));
        Assert(equals(ex.safeValue(stringKeyed, "nullVal", "fallback"), "fallback"));
        Assert(equals(ex.safeValue(stringKeyed, "missing", "fallback"), "fallback"));

        // safeValueN — first non-empty wins in order
        Assert(equals(ex.safeValueN(stringKeyed,
                new ArrayList<>(Arrays.asList("missing", "empty", "b"))), "two"));

        // Integer-keyed dict (e.g. transpiled `dict[1] = x`) hits the slow
        // coercion path. Lookup by stringified key must still resolve.
        Map<Object, Object> intKeyed = new HashMap<>();
        intKeyed.put(1, "one");
        intKeyed.put(2, "two");
        Assert(equals(ex.safeValue(intKeyed, "1"), "one"));
        Assert(equals(ex.safeValue(intKeyed, 1), "one"));
        Assert(equals(ex.safeValue(intKeyed, "missing", "x"), "x"));

        // LinkedHashMap (used by JsonHelper for ordered parses)
        Map<String, Object> linked = new LinkedHashMap<>();
        linked.put("a", "first");
        linked.put("b", "second");
        Assert(equals(ex.safeValue(linked, "b"), "second"));
        Assert(equals(ex.safeValue(linked, "missing", "x"), "x"));

        // List indexing
        List<Object> list = new ArrayList<>(Arrays.asList("zero", "one", "two"));
        Assert(equals(ex.safeValue(list, 0), "zero"));
        Assert(equals(ex.safeValue(list, 99, "fallback"), "fallback"));

        // Null input
        Assert(equals(ex.safeValue(null, "anything", "fallback"), "fallback"));
    }

    /**
     * Reproduces (and locks against regression of) the CME we hit on
     * binance Java WS where a handler thread mutates a shared dict while
     * another thread calls safeValue on it. Before the fix this throws
     * `ConcurrentModificationException` from HashMap$KeySpliterator.tryAdvance;
     * after the fix the read path either returns a stale value or the
     * default — never throws.
     */
    private void testSafeMethodsConcurrentReadDuringWrite() {
        Exchange ex = new Exchange(new HashMap<String, Object>() {{ put("id", "unit"); }});

        Map<String, Object> shared = new HashMap<>();
        for (int i = 0; i < 64; i++) {
            shared.put("k" + i, "v" + i);
        }

        AtomicBoolean stop = new AtomicBoolean(false);
        AtomicBoolean readerSawCme = new AtomicBoolean(false);
        AtomicLong reads = new AtomicLong();
        AtomicLong writes = new AtomicLong();

        Thread writer = new Thread(() -> {
            int n = 0;
            while (!stop.get()) {
                String key = "k" + (n & 127);
                if ((n & 1) == 0) {
                    shared.put(key, "v" + n);
                } else {
                    shared.remove(key);
                }
                writes.incrementAndGet();
                n++;
            }
        });

        // Spin up a few reader threads — heavier contention is more likely
        // to surface the keySet-stream race.
        int readerCount = 4;
        Thread[] readers = new Thread[readerCount];
        for (int r = 0; r < readerCount; r++) {
            readers[r] = new Thread(() -> {
                while (!stop.get()) {
                    try {
                        ex.safeValue(shared, "k5");
                        ex.safeValueN(shared,
                                new ArrayList<>(Arrays.asList("missing", "k7", "k13")));
                        ex.safeString(shared, "k20");
                        reads.incrementAndGet();
                    } catch (java.util.ConcurrentModificationException cme) {
                        readerSawCme.set(true);
                        // keep the loop running so we count
                    } catch (RuntimeException re) {
                        if (re.getCause() instanceof java.util.ConcurrentModificationException) {
                            readerSawCme.set(true);
                        } else {
                            throw re;
                        }
                    }
                }
            });
        }

        writer.start();
        for (Thread r : readers) r.start();

        try {
            Thread.sleep(800); // 800ms of contention
        } catch (InterruptedException ignored) {}
        stop.set(true);

        try {
            writer.join(2000);
            for (Thread r : readers) r.join(2000);
        } catch (InterruptedException ignored) {}

        Assert(reads.get() > 1000, "expected many reads under contention, got " + reads.get());
        Assert(writes.get() > 1000, "expected many writes under contention, got " + writes.get());
        Assert(!readerSawCme.get(), "safeValue must not throw ConcurrentModificationException — "
                + "reads=" + reads.get() + ", writes=" + writes.get());
    }

    /**
     * Perf budget for the SafeValueN hot path — every WS message goes through
     * a dozen+ safeXxx calls so this needs to stay fast. The threshold is
     * intentionally generous to avoid CI flake; if it ever trips, we've
     * regressed the dispatch by an order of magnitude and want to know.
     */
    private void testSafeMethodsPerformance() {
        Exchange ex = new Exchange(new HashMap<String, Object>() {{ put("id", "unit"); }});

        // Typical WS message shape: ~20 String keys, mix of scalar values.
        Map<String, Object> dict = new HashMap<>();
        for (int i = 0; i < 20; i++) {
            dict.put("k" + i, i & 1) ;
        }
        dict.put("price", "29543.21");
        dict.put("amount", "0.0125");
        dict.put("side", "buy");

        List<Object> keys = new ArrayList<>(Arrays.asList("missing1", "missing2", "price"));
        List<Object> allMissKeys = new ArrayList<>(Arrays.asList("nope1", "nope2", "nope3"));

        int warmup = 50_000;
        int iters = 500_000;

        // JIT warmup
        for (int i = 0; i < warmup; i++) {
            ex.safeValue(dict, "side");
            ex.safeString(dict, "price");
            ex.safeValueN(dict, keys);
            ex.safeValue(dict, "totally_missing");
            ex.safeValueN(dict, allMissKeys);
        }

        long t0 = System.nanoTime();
        for (int i = 0; i < iters; i++) {
            ex.safeValue(dict, "side");
            ex.safeString(dict, "price");
            ex.safeValueN(dict, keys);
        }
        long elapsedNs = System.nanoTime() - t0;
        double nsPerOp = (double) elapsedNs / (iters * 3);
        long opsPerSecond = (long) (1_000_000_000.0 / nsPerOp);

        // All-miss workload: every key returns the default. Exercises whichever
        // miss-handling path is on (pre-fix: keySet().stream() precheck; post-fix:
        // slow-path entrySet walk + HashMap alloc). Same big-O, different constants.
        long t1 = System.nanoTime();
        for (int i = 0; i < iters; i++) {
            ex.safeValue(dict, "totally_missing");
            ex.safeValueN(dict, allMissKeys);
            ex.safeString(dict, "also_missing");
        }
        long elapsedMissNs = System.nanoTime() - t1;
        double nsPerOpMiss = (double) elapsedMissNs / (iters * 3);

        System.out.println("[perf] SafeMethods miss-only: "
                + String.format("%.0f", nsPerOpMiss) + " ns/op ("
                + (iters * 3) + " calls in " + (elapsedMissNs / 1_000_000) + " ms)");

        System.out.println("[perf] SafeMethods: "
                + String.format("%.0f", nsPerOp) + " ns/op, "
                + opsPerSecond + " ops/s ("
                + (iters * 3) + " calls in " + (elapsedNs / 1_000_000) + " ms)");

        // Budget: 1500 ns/op (≈ 670k calls/sec). The post-fix measurement on
        // an M-class Mac is ~150 ns/op (~6.7M ops/s); CI on Linux typically
        // sees 250–500 ns/op. The 10× headroom guards against accidental
        // O(n) regressions in the read path (e.g. re-introducing a keySet
        // iteration on every call) without flaking on slow CI runners.
        Assert(nsPerOp < 1500, "SafeValueN slower than budget: " + nsPerOp + " ns/op");
    }
}
