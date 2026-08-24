// CCXT cross-language benchmark — C# (.NET), offline "load" mode.
//
// Mirrors examples/benchmarks/bench.mjs load mode: parse a large order book in a
// tight loop (no network) to measure CPU throughput and memory, printing the same
// ##RESULT## JSON line.
//
// Run:  dotnet run -c Release --project cs/benchmark load

using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using ccxt;

namespace ccxtbench
{
    // Times the two base methods every request flows through, mirroring the
    // JS/Python/PHP wrappers: fetch() is the whole HTTP layer, parseJson() the
    // JSON decode inside it. network = fetch - jsonDecode.
    public class TracedCoinbase : coinbase
    {
        public double HttpMs;
        public double JsonMs;
        public double WireMs;

        public override async Task<object> fetch(object url2, object method2 = null, object headers2 = null, object body2 = null)
        {
            this.Profile = true;
            this.ProfileJsonMs = 0;
            this.ProfileWireMs = 0;
            var sw = Stopwatch.StartNew();
            var r = await base.fetch(url2, method2, headers2, body2);
            HttpMs = sw.Elapsed.TotalMilliseconds;
            JsonMs = this.ProfileJsonMs;   // decode timed inside the HTTP layer
            WireMs = this.ProfileWireMs;   // send + body read only
            return r;
        }

    }

    static class Bench
    {
        static long StatusKb(string field)
        {
            foreach (var line in File.ReadLines("/proc/self/status"))
                if (line.StartsWith(field + ":", StringComparison.Ordinal))
                    return long.Parse(line.Split(new[] { ' ', '\t' }, StringSplitOptions.RemoveEmptyEntries)[1]);
            return 0;
        }
        static long PeakRssKb() => StatusKb("VmHWM");
        static long CurrentRssKb() => StatusKb("VmRSS");

        static string BuildRawBook(int levels)
        {
            bool str = Environment.GetEnvironmentVariable("BENCH_STRING_PRICES") == "1";
            var sb = new StringBuilder();
            sb.Append("{\"bids\":[");
            for (int i = 0; i < levels; i++)
            {
                if (i > 0) sb.Append(',');
                if (str) sb.Append("[\"").Append((112345.67 - i * 0.01).ToString("F2", CultureInfo.InvariantCulture)).Append("\",\"").Append((0.5 + i * 0.001).ToString("F8", CultureInfo.InvariantCulture)).Append("\"]");
                else sb.Append('[').Append(1000000 - i).Append(',').Append(500 + i).Append(']');
            }
            sb.Append("],\"asks\":[");
            for (int i = 0; i < levels; i++)
            {
                if (i > 0) sb.Append(',');
                if (str) sb.Append("[\"").Append((112345.68 + i * 0.01).ToString("F2", CultureInfo.InvariantCulture)).Append("\",\"").Append((0.5 + i * 0.001).ToString("F8", CultureInfo.InvariantCulture)).Append("\"]");
                else sb.Append('[').Append(1000000 + i).Append(',').Append(500 + i).Append(']');
            }
            sb.Append("],\"timestamp\":1700000000000}");
            return sb.ToString();
        }

        // coinbase's real shape: {"pricebook":{"bids":[{"price":"..","size":".."}],...}}
        static string BuildDictBook(int levels)
        {
            var sb = new StringBuilder();
            sb.Append("{\"bids\":[");
            for (int i = 0; i < levels; i++)
            {
                if (i > 0) sb.Append(',');
                sb.Append("{\"price\":\"").Append((112345.67 - i * 0.01).ToString("F2", CultureInfo.InvariantCulture))
                  .Append("\",\"size\":\"").Append((0.5 + i * 0.001).ToString("F8", CultureInfo.InvariantCulture)).Append("\"}");
            }
            sb.Append("],\"asks\":[");
            for (int i = 0; i < levels; i++)
            {
                if (i > 0) sb.Append(',');
                sb.Append("{\"price\":\"").Append((112345.68 + i * 0.01).ToString("F2", CultureInfo.InvariantCulture))
                  .Append("\",\"size\":\"").Append((0.5 + i * 0.001).ToString("F8", CultureInfo.InvariantCulture)).Append("\"}");
            }
            sb.Append("]}");
            return sb.ToString();
        }

        static int EnvInt(string k, int d) => int.TryParse(Environment.GetEnvironmentVariable(k), out var v) ? v : d;
        static double NowMs() => (double)Stopwatch.GetTimestamp() / Stopwatch.Frequency * 1000.0;
        static string N(double v) => v.ToString(CultureInfo.InvariantCulture);

        static double Pct(List<double> xs, double q)
        {
            var v = new List<double>(xs); v.Sort();
            if (v.Count == 0) return 0;
            int i = (int)Math.Floor(q / 100.0 * (v.Count - 1));
            return Math.Round(v[Math.Min(i, v.Count - 1)], 2);
        }

        static string Samples(List<double> xs)
        {
            var parts = new List<string>(xs.Count);
            foreach (var x in xs) parts.Add(Math.Round(x, 2).ToString(CultureInfo.InvariantCulture));
            return "[" + string.Join(",", parts) + "]";
        }

        static string Stats(List<double> xs)
        {
            return "{\"p50\":" + N(Pct(xs, 50)) + ",\"p90\":" + N(Pct(xs, 90))
                 + ",\"p95\":" + N(Pct(xs, 95)) + ",\"p99\":" + N(Pct(xs, 99)) + "}";
        }

        static async Task BenchRest(string symbol)
        {
            int iters = EnvInt("BENCH_REST_ITERS", 60);
            int sleepMs = EnvInt("BENCH_SLEEP_MS", 250);
            var ex = new TracedCoinbase();
            ex.enableRateLimit = false;   // match the other harnesses: measure work, not throttle sleep
            await ex.LoadMarkets();
            int warmup = EnvInt("BENCH_REST_WARMUP", 5);
            for (int w = 0; w < warmup; w++) await ex.fetchOrderBook(symbol, null, null);  // warmup: connection + JIT

            var latency = new List<double>();
            var network = new List<double>();
            var processing = new List<double>();
            var jsonDecode = new List<double>();
            var wireSpan = new List<double>();
            var proc = Process.GetCurrentProcess();
            var cpu0 = proc.TotalProcessorTime;

            for (int i = 0; i < iters; i++)
            {
                double t0 = NowMs();
                await ex.fetchOrderBook(symbol, null, null);
                double total = NowMs() - t0;
                double wire = ex.HttpMs - ex.JsonMs;
                latency.Add(total);
                network.Add(wire);
                processing.Add(total - wire);
                jsonDecode.Add(ex.JsonMs);
                wireSpan.Add(ex.WireMs);
                await Task.Delay(sleepMs);
            }
            proc.Refresh();
            double cpu = (proc.TotalProcessorTime - cpu0).TotalSeconds;

            var sb = new StringBuilder("##RESULT## {");
            sb.Append("\"language\":\"C#\",");
            sb.Append("\"runtime\":\".NET ").Append(Environment.Version).Append("\",");
            sb.Append("\"ccxt\":\"").Append(Exchange.ccxtVersion).Append("\",");
            sb.Append("\"mode\":\"rest\",\"exchange\":\"coinbase\",");
            sb.Append("\"symbol\":\"").Append(symbol).Append("\",");
            sb.Append("\"iterations\":").Append(iters).Append(',');
            sb.Append("\"latencyMs\":").Append(Stats(latency)).Append(',');
            // raw per-call samples so any percentile can be recomputed from the data
            sb.Append("\"latencySamplesMs\":").Append(Samples(latency)).Append(',');
            sb.Append("\"networkMs\":").Append(Stats(network)).Append(',');
            sb.Append("\"processingMs\":").Append(Stats(processing)).Append(',');
            sb.Append("\"jsonDecodeMs\":").Append(Stats(jsonDecode)).Append(',');
            sb.Append("\"wireMs\":").Append(Stats(wireSpan)).Append(',');
            sb.Append("\"cpuUserSec\":").Append(N(Math.Round(cpu, 3))).Append(',');
            sb.Append("\"cpuSystemSec\":0,");
            sb.Append("\"peakRssMb\":").Append(N(Math.Round(PeakRssKb() / 1024.0, 1)));
            sb.Append('}');
            Console.WriteLine(sb.ToString());
        }

        static void Main(string[] args)
        {
            var symbol = Environment.GetEnvironmentVariable("BENCH_SYMBOL") ?? "BTC/USD";
            var mode = args.Length > 0 ? args[0] : "load";
            if (mode == "rest") { BenchRest(symbol).GetAwaiter().GetResult(); return; }
            int seconds = EnvInt("BENCH_LOAD_SECONDS", 8);
            int levels = EnvInt("BENCH_LOAD_LEVELS", 1000);
            int retain = EnvInt("BENCH_LOAD_RETAIN", 2000);

            var ex = new coinbase();
            bool dictShape = Environment.GetEnvironmentVariable("BENCH_BOOK_SHAPE") == "dict";
            string raw = dictShape ? BuildDictBook(levels) : BuildRawBook(levels);
            Func<object> parseOne = dictShape
                ? (Func<object>)(() => ex.parseOrderBook(ex.parseJson(raw), symbol, null, "bids", "asks", "price", "size"))
                : (Func<object>)(() => ex.parseOrderBook(ex.parseJson(raw), symbol));
            for (int i = 0; i < 200; i++) parseOne(); // warmup / JIT

            var proc = Process.GetCurrentProcess();
            var cpu0 = proc.TotalProcessorTime;
            double t0 = NowMs(), deadline = t0 + seconds * 1000.0;
            long ops = 0, sink = 0;
            while (NowMs() < deadline)
            {
                var ob = parseOne();
                if (ob is IDictionary<string, object> d && d.TryGetValue("bids", out var b) && b is System.Collections.IList list) sink += list.Count;
                ops++;
            }
            double wallA = NowMs() - t0;
            proc.Refresh();
            double cpu = (proc.TotalProcessorTime - cpu0).TotalSeconds;

            long rssBefore = CurrentRssKb();
            var kept = new List<object>();
            for (int i = 0; i < retain; i++) kept.Add(parseOne());
            long rssAfter = CurrentRssKb();
            double perBookKb = Math.Round((double)(rssAfter - rssBefore) / retain, 2);

            var fields = new (string, string)[]
            {
                ("language", "\"C#\""),
                ("runtime", "\".NET " + Environment.Version + "\""),
                ("ccxt", "\"" + Exchange.ccxtVersion + "\""),
                ("mode", "\"load\""),
                ("levels", N(levels)),
                ("seconds", N(seconds)),
                ("ops", N(ops)),
                ("opsPerSec", N(Math.Round(ops / (wallA / 1000.0), 1))),
                ("cpuUserSec", N(Math.Round(cpu, 3))),
                ("cpuSystemSec", "0"),
                ("cpuPerOpUs", N(Math.Round(cpu * 1e6 / ops, 2))),
                ("peakRssMb", N(Math.Round(PeakRssKb() / 1024.0, 1))),
                ("retainBooks", N(retain)),
                ("perBookKb", N(perBookKb)),
                ("keptLen", N(kept.Count + (sink < 0 ? 1 : 0))),
            };
            var sb = new StringBuilder("##RESULT## {");
            for (int i = 0; i < fields.Length; i++) { if (i > 0) sb.Append(','); sb.Append('"').Append(fields[i].Item1).Append("\":").Append(fields[i].Item2); }
            sb.Append('}');
            Console.WriteLine(sb.ToString());
        }
    }
}
