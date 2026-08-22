# comparison-ccxt-binance-rs

A side-by-side of watching the Binance **BTC/USDT** order book with:

- **ccxt-rust** — the typed WS layer (`ccxt_pro::Binance::watch_order_book -> Result<OrderBook>`)
- **[`binance-rs`](https://crates.io/crates/binance)** — the popular third-party Binance client (`btcusdt@depth@100ms`)

Both consume the **same** Binance diff-depth stream. The important difference:

| | ccxt-rust (`watch_order_book`) | binance-rs (`@depth`) |
|---|---|---|
| What each frame gives you | a full, **sorted, checksum-validated `OrderBook`** (bids/asks decoded) | the **raw delta** for that frame |
| Book maintenance | done for you (seed via REST snapshot + merge deltas + CRC check) | you do it yourself |
| Markets metadata | loads ~all Binance markets (symbol resolution, precision, limits) | none |

So ccxt does strictly more work per frame in exchange for a ready-to-use book — the numbers below quantify that cost.

> This example is **intentionally kept out of the `examples/rust` workspace** so the
> CI examples build never pulls the `binance` crate. Build/run it from this directory.

## Run

Each side runs as its **own process** (so peak RSS is measured cleanly per process):

```bash
cd examples/rust/comparison-ccxt-binance-rs

# ccxt-rust, typed layer — 30s
cargo run --release --bin ccxt_side -- 30

# binance-rs baseline — 30s
cargo run --release --bin binance_rs_side -- 30
```

Each prints `frames`, the book/delta size, wall, CPU, and peak RSS.

## Results (30s, BTC/USDT, same machine)

| metric | ccxt-rust (typed `watch_order_book`) | binance-rs (`@depth`) |
|---|---:|---:|
| frames in 30s | 285 | 291 |
| per-frame payload | **full book: ~996 bids / ~915 asks** (sorted, checksum-validated) | raw delta: ~17 bids / ~24 asks |
| CPU (watch loop) | 0.120 s | 0.050 s |
| peak RSS | 252 MB | 9 MB |
| markets loaded | 4583 (loadMarkets 11.2 s) | 0 |

Reading the numbers:

- **Frames are ~equal** (285 vs 291) — both ride the same `@100ms` stream, as expected.
- **CPU: ~2.4× more for ccxt** (0.12 s vs 0.05 s over 30 s) — the cost of merging every
  delta into a sorted book and running the CRC checksum. Both are tiny (well under 1 %
  of one core); ccxt is doing real book-keeping, binance-rs just hands back the delta.
- **Memory: ~28× more for ccxt** (252 MB vs 9 MB), but that gap is almost entirely the
  **4583 markets** ccxt loads (symbol resolution, precision, limits) — the maintained book
  itself is small. binance-rs loads no market metadata.
- **What you get back differs**: ccxt gives a ready-to-use, sorted, checksum-validated
  `OrderBook` (~1000 levels/side) each frame; binance-rs gives you the raw delta to apply
  yourself.

So the trade is: ccxt costs more CPU/RAM (mostly one-time market metadata) and returns a
finished order book; binance-rs is a thin, minimal-footprint delta feed you assemble yourself.

_Measured on the same machine, 30 s each, separate processes. Release builds
(binance-rs default opt-level 3; the ccxt crate at opt-level 2 to fit RAM — a
minor factor next to the architectural difference above)._
