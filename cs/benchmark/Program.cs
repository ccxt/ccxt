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
using ccxt;

namespace ccxtbench
{
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
            var sb = new StringBuilder();
            sb.Append("{\"bids\":[");
            for (int i = 0; i < levels; i++) { if (i > 0) sb.Append(','); sb.Append('[').Append(1000000 - i).Append(',').Append(500 + i).Append(']'); }
            sb.Append("],\"asks\":[");
            for (int i = 0; i < levels; i++) { if (i > 0) sb.Append(','); sb.Append('[').Append(1000000 + i).Append(',').Append(500 + i).Append(']'); }
            sb.Append("],\"timestamp\":1700000000000}");
            return sb.ToString();
        }

        static int EnvInt(string k, int d) => int.TryParse(Environment.GetEnvironmentVariable(k), out var v) ? v : d;
        static double NowMs() => (double)Stopwatch.GetTimestamp() / Stopwatch.Frequency * 1000.0;
        static string N(double v) => v.ToString(CultureInfo.InvariantCulture);

        static void Main(string[] args)
        {
            var symbol = Environment.GetEnvironmentVariable("BENCH_SYMBOL") ?? "BTC/USD";
            int seconds = EnvInt("BENCH_LOAD_SECONDS", 8);
            int levels = EnvInt("BENCH_LOAD_LEVELS", 1000);
            int retain = EnvInt("BENCH_LOAD_RETAIN", 2000);

            var ex = new coinbase();
            string raw = BuildRawBook(levels);
            for (int i = 0; i < 200; i++) ex.parseOrderBook(ex.parseJson(raw), symbol); // warmup / JIT

            var proc = Process.GetCurrentProcess();
            var cpu0 = proc.TotalProcessorTime;
            double t0 = NowMs(), deadline = t0 + seconds * 1000.0;
            long ops = 0, sink = 0;
            while (NowMs() < deadline)
            {
                var ob = ex.parseOrderBook(ex.parseJson(raw), symbol);
                if (ob is IDictionary<string, object> d && d.TryGetValue("bids", out var b) && b is System.Collections.IList list) sink += list.Count;
                ops++;
            }
            double wallA = NowMs() - t0;
            proc.Refresh();
            double cpu = (proc.TotalProcessorTime - cpu0).TotalSeconds;

            long rssBefore = CurrentRssKb();
            var kept = new List<object>();
            for (int i = 0; i < retain; i++) kept.Add(ex.parseOrderBook(ex.parseJson(raw), symbol));
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
