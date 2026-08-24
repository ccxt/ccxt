# Raw network baseline — control for the REST benchmark

The REST benchmark reports a `network` span defined as `time inside fetch() −
time inside JSON decode`. That is **not** wire time: it also contains each
language's HTTP-client overhead, TLS/proxy handling, and response-body decoding.

These five programs are the control. Each does a plain keep-alive HTTPS GET to
the same Coinbase endpoint the benchmark hits, with **no CCXT involved**, and
prints its raw per-call samples as JSON:

```
{"lang":"Go","samples":[55.53,53.79,...],"bytes":79292}
```

## Running them

Run them **round-robin**, not one language after another. Latency here drifts
minute to minute (this environment egresses through a local CONNECT proxy and
the tail is heavy — 100–200 ms outliers are routine in every language), so
sequential per-language runs are not comparable to each other. Interleaving is
what makes them comparable.

```bash
for round in 1 2 3 4 5 6; do
  node raw.mjs 8
  python raw.py 8
  ./rawgo 8                                  # go build -o rawgo raw.go
  dotnet cs/bin/Release/net8.0/raw.dll 8     # dotnet build cs/raw.csproj -c Release
  java -cp . Raw 8                           # javac Raw.java
done
```

`results-raw.jsonl` holds one such run (6 rounds × 8 calls = 48 samples per
language). Pool the samples per language and take percentiles across the pool.

## Why this control exists

Running CCXT's client and the raw client adjacently, round-robin, six rounds:

| Language | raw client | CCXT `network` span | difference |
|---|---|---|---|
| C# | 54.0 ms | 69.7 ms | +15.6 ms |
| JavaScript | 61.5 ms | 47.3 ms | −14.2 ms |
| Python | 61.4 ms | 46.3 ms | −15.1 ms |
| Java | 63.0 ms | 57.2 ms | −5.7 ms |
| Go | 62.0 ms | 44.9 ms | −17.1 ms |

The raw clients agree within **8.9 ms**; the CCXT spans spread **24.7 ms**. Three
of the spans read 14–17 ms *below* that same language's bare HTTP GET — in six
rounds out of six — which is impossible as wire time. The spans do not cover the
same work in each implementation, so the network/processing split must not be
compared across languages. `results-paired.json` holds that run.

## csvar/ — was it C#'s handler configuration?

C# was the one language whose span read *above* its raw client, so we checked
whether CCXT's handler choice was responsible. `csvar/` times four
configurations interleaved in a single process:

```
sockets-plain              med=71.0 ms
sockets-gzip               med=63.5 ms
httpclienthandler-plain    med=63.4 ms
ccxt (HttpClientHandler + AutomaticDecompression)   med=69.8 ms
```

No. CCXT's exact configuration is unremarkable, and two near-identical
configurations differ by 7.6 ms in the same run — the size of the effect being
investigated. CCXT's C# client is a normal C# client.

## results-rest-samples.json — the full latency distribution

Every `fetchOrderBook` call from an interleaved run: 7 rounds × 30 calls = 210
samples per language, keyed by language. Produced by running each harness's
`rest` mode round-robin and pooling its `latencySamplesMs`.

| Language | p01 | p25 | p50 | p75 | p99 | p01→p99 |
|---|---|---|---|---|---|---|
| Go | 43.3 | 49.4 | 52.9 | 73.9 | 313.8 | 271 |
| JavaScript | 42.8 | 49.5 | 54.7 | 72.0 | 148.3 | 106 |
| Python | 42.4 | 50.1 | 56.1 | 87.9 | 322.1 | 280 |
| Java | 52.6 | 59.8 | 65.3 | 83.7 | 352.3 | 300 |
| C# | 58.2 | 67.8 | 74.1 | 104.2 | 169.0 | 111 |
| PHP | 208.5 | 214.8 | 221.7 | 268.3 | 359.2 | 151 |

The medians of the five non-PHP languages span 21 ms; a single language's own
p01–p99 spans 106–300 ms. That ~13× ratio is why per-language REST rankings are
not meaningful here — and why PHP's is, since its p01 sits above every other
language's p75.
