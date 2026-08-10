// CCXT cross-language benchmark — Java, offline "load" mode.
//
// Mirrors examples/benchmarks/bench.mjs load mode: parse a large order book in a
// tight loop (no network) to measure CPU throughput and memory, printing the same
// ##RESULT## JSON line.
//
// Run:  ./gradlew :benchmark:run --args=load   (from java/)

package bench;

import io.github.ccxt.exchanges.Coinbase;
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

    public static void main(String[] args) throws Exception {
        String symbol = System.getenv().getOrDefault("BENCH_SYMBOL", "BTC/USD");
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
