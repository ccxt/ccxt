// CCXT cross-language benchmark — Java, offline "load" mode.
//
// Mirrors examples/benchmarks/bench.mjs load mode: parse a large order book in a
// tight loop (no network) to measure CPU throughput and memory, printing the same
// ##RESULT## JSON line.
//
// Run:  ./gradlew :benchmark:run --args=load   (from java/)

package bench;

import io.github.ccxt.exchanges.Coinbase;
import java.util.ArrayList;
import java.util.Collections;
import java.util.concurrent.CompletableFuture;
import java.lang.management.ManagementFactory;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import com.sun.management.OperatingSystemMXBean;

public class Main {

    static long statusKb(String field) throws Exception {
        for (String line : Files.readAllLines(Paths.get("/proc/self/status"))) {
            if (line.startsWith(field + ":")) {
                return Long.parseLong(line.trim().split("\\s+")[1]);
            }
        }
        return 0;
    }

    static String buildRawBook(int levels) {
        StringBuilder sb = new StringBuilder("{\"bids\":[");
        for (int i = 0; i < levels; i++) {
            if (i > 0) sb.append(',');
            sb.append('[').append(1000000 - i).append(',').append(500 + i).append(']');
        }
        sb.append("],\"asks\":[");
        for (int i = 0; i < levels; i++) {
            if (i > 0) sb.append(',');
            sb.append('[').append(1000000 + i).append(',').append(500 + i).append(']');
        }
        sb.append("],\"timestamp\":1700000000000}");
        return sb.toString();
    }

    static int envInt(String k, int d) {
        String v = System.getenv(k);
        return v != null ? Integer.parseInt(v) : d;
    }

    static double nowMs() {
        return System.nanoTime() / 1e6;
    }

    static double round(double v, int d) {
        double p = Math.pow(10, d);
        return Math.round(v * p) / p;
    }

    // Times the two base methods every request flows through, mirroring the
    // JS/Python/PHP/C# harnesses: fetch() is the whole HTTP layer, parseJson()
    // the JSON decode inside it. network = fetch - jsonDecode.
    static class TracedCoinbase extends Coinbase {
        double httpMs;
        double jsonMs;
        double wireMs;

        @Override
        public CompletableFuture<Object> fetch(Object url2, Object method2, Object headers2, Object body2) {
            this.profile = true;
            this.profileJsonMs = 0;
            this.profileWireMs = 0;
            long t0 = System.nanoTime();
            return super.fetch(url2, method2, headers2, body2).thenApply(r -> {
                this.httpMs = (System.nanoTime() - t0) / 1e6;
                this.jsonMs = this.profileJsonMs;   // decode timed inside the HTTP layer
                this.wireMs = this.profileWireMs;   // send + body read only
                return r;
            });
        }


    }

    static double pct(List<Double> xs, double q) {
        if (xs.isEmpty()) return 0;
        List<Double> v = new ArrayList<>(xs);
        Collections.sort(v);
        int i = (int) Math.floor(q / 100.0 * (v.size() - 1));
        return round(v.get(Math.min(i, v.size() - 1)), 2);
    }

    static String stats(List<Double> xs) {
        return "{\"p50\":" + pct(xs, 50) + ",\"p90\":" + pct(xs, 90)
             + ",\"p95\":" + pct(xs, 95) + ",\"p99\":" + pct(xs, 99) + "}";
    }

    static void benchRest(String symbol) throws Exception {
        int iters = envInt("BENCH_REST_ITERS", 60);
        int sleepMs = envInt("BENCH_SLEEP_MS", 250);
        TracedCoinbase ex = new TracedCoinbase();
        ex.enableRateLimit = false;   // match the other harnesses: measure work, not throttle sleep
        ex.loadMarkets().get();
        int warmup = envInt("BENCH_REST_WARMUP", 5);
        for (int w = 0; w < warmup; w++) ex.fetchOrderBook((Object) symbol).get();  // warmup: connection + JIT

        List<Double> latency = new ArrayList<>();
        List<Double> network = new ArrayList<>();
        List<Double> processing = new ArrayList<>();
        List<Double> jsonDecode = new ArrayList<>();
        List<Double> wireSpan = new ArrayList<>();
        OperatingSystemMXBean os = (OperatingSystemMXBean) ManagementFactory.getOperatingSystemMXBean();
        long cpu0 = os.getProcessCpuTime();

        for (int i = 0; i < iters; i++) {
            long t0 = System.nanoTime();
            ex.fetchOrderBook((Object) symbol).get();
            double total = (System.nanoTime() - t0) / 1e6;
            double wire = ex.httpMs - ex.jsonMs;
            latency.add(total);
            network.add(wire);
            processing.add(total - wire);
            jsonDecode.add(ex.jsonMs);
            wireSpan.add(ex.wireMs);
            Thread.sleep(sleepMs);
        }
        double cpu = (os.getProcessCpuTime() - cpu0) / 1e9;

        StringBuilder r = new StringBuilder("##RESULT## {");
        r.append("\"language\":\"Java\",");
        r.append("\"runtime\":\"OpenJDK ").append(System.getProperty("java.version")).append("\",");
        r.append("\"ccxt\":\"4.5.65\",");
        r.append("\"mode\":\"rest\",\"exchange\":\"coinbase\",");
        r.append("\"symbol\":\"").append(symbol).append("\",");
        r.append("\"iterations\":").append(iters).append(',');
        r.append("\"latencyMs\":").append(stats(latency)).append(',');
        r.append("\"networkMs\":").append(stats(network)).append(',');
        r.append("\"processingMs\":").append(stats(processing)).append(',');
        r.append("\"jsonDecodeMs\":").append(stats(jsonDecode)).append(',');
        r.append("\"wireMs\":").append(stats(wireSpan)).append(',');
        r.append("\"cpuUserSec\":").append(round(cpu, 3)).append(',');
        r.append("\"cpuSystemSec\":0,");
        r.append("\"peakRssMb\":").append(round(statusKb("VmHWM") / 1024.0, 1));
        r.append('}');
        System.out.println(r.toString());
    }

    public static void main(String[] args) throws Exception {
        String symbol = System.getenv().getOrDefault("BENCH_SYMBOL", "BTC/USD");
        String mode = args.length > 0 ? args[0] : "load";
        if (mode.equals("rest")) { benchRest(symbol); return; }
        int seconds = envInt("BENCH_LOAD_SECONDS", 8);
        int levels = envInt("BENCH_LOAD_LEVELS", 1000);
        int retain = envInt("BENCH_LOAD_RETAIN", 2000);

        Coinbase ex = new Coinbase();
        String raw = buildRawBook(levels);
        for (int i = 0; i < 200; i++) ex.parseOrderBook(ex.parseJson(raw), symbol); // warmup / JIT

        OperatingSystemMXBean os = (OperatingSystemMXBean) ManagementFactory.getOperatingSystemMXBean();
        long cpu0 = os.getProcessCpuTime();
        double t0 = nowMs(), deadline = t0 + seconds * 1000.0;
        long ops = 0, sink = 0;
        while (nowMs() < deadline) {
            Object ob = ex.parseOrderBook(ex.parseJson(raw), symbol);
            if (ob instanceof Map) {
                Object b = ((Map<?, ?>) ob).get("bids");
                if (b instanceof List) sink += ((List<?>) b).size();
            }
            ops++;
        }
        double wallA = nowMs() - t0;
        double cpu = (os.getProcessCpuTime() - cpu0) / 1e9;

        long rssBefore = statusKb("VmRSS");
        List<Object> kept = new ArrayList<>();
        for (int i = 0; i < retain; i++) kept.add(ex.parseOrderBook(ex.parseJson(raw), symbol));
        long rssAfter = statusKb("VmRSS");
        double perBookKb = round((double) (rssAfter - rssBefore) / retain, 2);

        StringBuilder r = new StringBuilder("##RESULT## {");
        r.append("\"language\":\"Java\",");
        r.append("\"runtime\":\"OpenJDK ").append(System.getProperty("java.version")).append("\",");
        r.append("\"ccxt\":\"4.5.65\",");
        r.append("\"mode\":\"load\",");
        r.append("\"levels\":").append(levels).append(',');
        r.append("\"seconds\":").append(seconds).append(',');
        r.append("\"ops\":").append(ops).append(',');
        r.append("\"opsPerSec\":").append(round(ops / (wallA / 1000.0), 1)).append(',');
        r.append("\"cpuUserSec\":").append(round(cpu, 3)).append(',');
        r.append("\"cpuSystemSec\":0,");
        r.append("\"cpuPerOpUs\":").append(round(cpu * 1e6 / ops, 2)).append(',');
        r.append("\"peakRssMb\":").append(round(statusKb("VmHWM") / 1024.0, 1)).append(',');
        r.append("\"retainBooks\":").append(retain).append(',');
        r.append("\"perBookKb\":").append(perBookKb).append(',');
        r.append("\"keptLen\":").append(kept.size() + (sink < 0 ? 1 : 0));
        r.append('}');
        System.out.println(r.toString());
    }
}
