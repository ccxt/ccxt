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
