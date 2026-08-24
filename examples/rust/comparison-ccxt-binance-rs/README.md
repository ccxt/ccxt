# comparison-ccxt-binance-rs

A side-by-side of watching Binance order books with:

- **ccxt-rust** — the typed WS layer (`ccxt_pro::Binance::watch_order_book{,_for_symbols} -> Result<OrderBook>`)
- **[`binance-rs`](https://crates.io/crates/binance)** — the popular third-party Binance client (`<sym>@depth@100ms`)

Both consume the **same** Binance diff-depth stream, one connection either way. The important difference:

| | ccxt-rust | binance-rs |
|---|---|---|
| What each frame gives you | a full, **sorted, checksum-validated `OrderBook`** (bids/asks decoded) | the **raw delta** for that frame |
| Book maintenance | done for you (seed via REST snapshot + merge deltas + CRC check) | you do it yourself |
| N books on one connection | `watch_order_book_for_symbols(symbols, …)` | `connect_multiple_streams(&streams)` |
| Markets metadata | loads ~all Binance markets (symbol resolution, precision, limits) | none |

So ccxt does strictly more work per frame in exchange for a ready-to-use book — the numbers below quantify that cost.

> This example is **intentionally kept out of the `examples/rust` workspace** so the
> CI examples build never pulls the `binance` crate. Build/run it from this directory.

## Run

The quickest path is the `compare` driver: it runs both sides as **separate,
concurrent processes** (so peak RSS is attributed per process) and prints the
tables below.

```bash
cd examples/rust/comparison-ccxt-binance-rs

# 30s per round at 1 and 10 books, then print the tables
cargo run --release --bin compare -- 30

# custom: 60s rounds at 1, 3 and 10 books
cargo run --release --bin compare -- 60 1,3,10
```

The ccxt child runs with `CCXT_NO_RATELIMIT=1` by default — with the limiter on,
a multi-book round returns nothing inside a 30 s window (see the seeding caveat
below). `CCXT_KEEP_RATELIMIT=1` measures the default config instead.

Either side can also be run on its own:

```bash
cargo run --release --bin ccxt_side       -- 60 10      # [secs] [symbols] [mode]
cargo run --release --bin binance_rs_side -- 60 10      # [secs] [symbols]

# `<spotN>+<perpN>` watches two groups at once, picked out of the loaded
# market map (liquid bases first, then alphabetical):
CCXT_NO_RATELIMIT=1 cargo run --release --bin ccxt_side -- 180 50+50
```

Spot and linear perps live on **different** binance ws endpoints (`stream.` vs
`fstream.`), so one `watch_order_book_for_symbols` call cannot cover both — it
derives the endpoint from the first market. The mixed mode therefore keeps one
subscription per group and alternates between them on the same exchange
instance; the background reader task per URL means the idle group keeps
buffering while the other is drained.

Arguments are `[secs] [symbols] [mode]`:

- `symbols` — a count (`10` → first 10 of the built-in list) or a comma-separated
  list (`BTC/USDT,ETH/USDT`). Default `BTC/USDT`.
- `mode` (ccxt side only) — `agg` (default) calls `watch_order_book_for_symbols`,
  one SUBSCRIBE for all N; `rr` round-robins `watch_order_book` per symbol.
  Both share one connection.

Each prints books live / frames / wall / CPU / peak RSS, plus `t_all_live` (when
the last of the N books delivered its first frame), a per-book breakdown, a
staged RSS line, and one machine-readable `RESULT …` line that `compare` parses.

Environment knobs on the ccxt side:

| var | effect |
|---|---|
| `CCXT_NO_RATELIMIT=1` | disable the REST rate limiter (see the seeding caveat) |
| `CCXT_MARKET_TYPES=linear` | narrow `loadMarkets`; the main RAM lever |
| `CCXT_MEM_DETAIL=1` | re-serialize the market stores to JSON to split payload from `Value` overhead |

## Results

Output of `compare 30 1,10` — 30 s per round, both sides concurrent, live
Binance spot `@depth@100ms`. Release builds (binance-rs at the default
opt-level 3; the `ccxt` crate at opt-level 2 to fit RAM).

### Throughput / CPU / RAM

|                        |    1 bk ccxt |     1 bk brs |   10 bk ccxt |    10 bk brs |
|------------------------|--------------|--------------|--------------|--------------|
| books live             |          1/1 |          1/1 |        10/10 |        10/10 |
| frames                 |          284 |          290 |         1845 |         1945 |
| frames/s               |          9.5 |          9.6 |         61.5 |         64.8 |
| CPU (watch loop)       |       0.14 s |       0.08 s |       1.15 s |       0.32 s |
| CPU per frame          |       493 us |       276 us |       623 us |       165 us |
| peak RSS               |       257 MB |         9 MB |       257 MB |         9 MB |
| t_all_live             |        1.6 s |        1.1 s |        3.8 s |        1.2 s |
| resyncs                |            0 |            0 |            0 |            0 |

### What one update carries

|                        |    1 bk ccxt |     1 bk brs |   10 bk ccxt |    10 bk brs |
|------------------------|--------------|--------------|--------------|--------------|
| levels per frame (avg) |         1994 |           19 |         1970 |            9 |
| levels over window     |       566300 |         5511 |      3633822 |        17147 |
| sorted + checksummed   |          yes |           no |          yes |           no |
| depth held at end      |         1977 |           23 |        19363 |           34 |
| markets loaded         |         4583 |            0 |         4583 |            0 |

### ccxt / binance-rs

|                        |    1 book(s) |   10 book(s) |
|------------------------|--------------|--------------|
| frames                 |         1.0x |         0.9x |
| CPU                    |         1.8x |         3.6x |
| CPU per frame          |         1.8x |         3.8x |
| peak RSS               |        28.6x |        28.6x |
| levels per frame       |       104.9x |       223.4x |

Reading the numbers:

- **Frames are ~equal per stream** — both ride the same `@100ms` feed, as expected.
- **CPU: 1.8x (1 book) to 3.8x (10 books) more for ccxt** per frame. That is the
  cost of merging every delta into a sorted book and running the CRC checksum.
  In absolute terms ccxt spends 1.15 s of CPU to maintain 10 checksum-validated
  books for 30 s — about 3.8 % of one core.
- **ccxt hands back ~100–220x more data per frame**: a full ~2000-level sorted
  book versus a 9–19 level raw delta you have to apply yourself.
- **Memory: 28.6x more for ccxt, and flat in N** — see below.

## Where the memory goes

`compare` ends with a staged RSS breakdown of the ccxt process:

| stage                                      |        RSS |      delta |
|--------------------------------------------|------------|------------|
| process baseline (tokio + binary)          |       4 MB |      +4 MB |
| + Binance instance (describe, api)         |       8 MB |      +4 MB |
| + loadMarkets (4583 mkts / 1203 ccy, 2.4s) |     242 MB |    +234 MB |
| + 10 live order book(s)                    |     244 MB |      +2 MB |
| peak (VmHWM, transient parse spike)        |     257 MB |     +13 MB |
| binance-rs, same window                    |       9 MB |            |

**`loadMarkets` is 91 % of it. The live books are ~0.2 MB each.** The 28.6x gap
against binance-rs is a fixed metadata cost, not a per-book one — it is identical
at 1 book and at 10.

Two things make that 234 MB bigger than it needs to be. `CCXT_MEM_DETAIL=1` shows:

```
mem-detail: markets_json=21.5MB markets_by_id_json=21.3MB currencies_json=0.1MB
            (resident after load = 234MB)
```

1. **The market table is stored twice** — `markets` (keyed by symbol) and
   `markets_by_id` are separate full copies, ~21.5 MB of JSON each.
2. **The `Value` representation expands it ~5.4x** — 43 MB of logical payload
   occupies 234 MB resident. Each market is a nested `IndexMap` of boxed
   `String` keys and `Value` nodes, so the cost tracks node *count*, not bytes.
   This is live retained data, not allocator slack: `MALLOC_ARENA_MAX=1` and a
   128 KB trim threshold change nothing.

The practical lever today is to load fewer markets:

| `CCXT_MARKET_TYPES` | markets | currencies | RSS after load |
|---|---:|---:|---:|
| `inverse` | 30 | 21 | 12 MB |
| `linear` | 872 | 826 | 34 MB |
| `spot` | 3681 | 827 | 242 MB |
| *(default, all)* | 4583 | 1203 | 243 MB |

A linear-only futures bot pays 34 MB, not 257 MB.

## Scale test: 50 spot + 50 linear perps

100 maintained books on one exchange instance, two connections, `CCXT_NO_RATELIMIT=1`:

| window | books live | frames | frames/s | CPU | % of one core | peak RSS | resyncs |
|---|---:|---:|---:|---:|---:|---:|---:|
| 120 s | 100/100 | 33 866 | 282 | 26.8 s | 22 % | 283 MB | 0 |
| 180 s | 100/100 | 67 564 | 375 | 46.7 s | 26 % | 317 MB | 0 |
| 300 s | 100/100 | 42 941 | 143 | 32.2 s | 11 % | 317 MB | 1 |

**It keeps up.** Over the same 180 s window, binance-rs on the *identical* 50
spot streams returned 34 308 frames; ccxt's spot group returned 33 782 — 98.5 %.
All 100 books seeded in ~28 s (100 REST depth snapshots), which is roughly how
long the least liquid of the 50 spot streams took to produce its first update at
all (binance-rs `t_all_live` on the same set: 23.7 s). So with the limiter off,
snapshot seeding is not the bottleneck even at 100 books.

Two things degrade past a few minutes:

- **A socket close costs the whole group.** Both 300 s runs hit
  `[NetworkError] wss://stream.binance.com:9443/ws/0 websocket connection closed`
  (plus some `fapi` REST snapshot failures). ccxt does recover — `ensure_slot`
  replaces a closed client and the next `watch_*` re-subscribes — but the caller
  sees an error, and the group is dark for the ~28 s it takes to re-seed its 50
  books. That is why the 300 s rows show roughly half the frame rate.
- **Per-book RSS grows with runtime.** The 100 books cost +41 MB at 120 s and
  +75 MB at 300 s over the 242 MB market baseline. It does not run away (both
  300 s runs peaked at 317 MB) but it is not flat either.

Also note the strict 1:1 alternation between the two groups: each returns exactly
half the frames regardless of which is busier. Fine when the two sides have
similar rates, as here; a real application with one hot group and one quiet one
should drive them from separate instances instead.

## Same scale test on the trade tape

`channel` is the 4th argument: `book` (default), `trades` (`@trade`) or
`aggtrades` (`@aggTrade`).

```bash
cargo run --release --bin ccxt_side -- 180 50+50 agg trades
```

Trades need **no REST snapshot**, so there is nothing to seed and nothing for
the rate limiter to throttle — unlike the book test, these runs use the
**default config**:

| run | streams live | trades | CPU | % of one core | us/frame | peak RSS | resyncs |
|---|---:|---:|---:|---:|---:|---:|---:|
| `@trade`, 180 s | 98/100 | 31 708 | 8.9 s | 5.0 % | 281 | 303 MB | 0 |
| `@aggTrade`, 120 s | 98/100 | 13 630 | 5.5 s | 4.6 % | 401 | 262 MB | 0 |
| *(books, 180 s, limiter off)* | 100/100 | 67 564 | 46.7 s | 26 % | 692 | 317 MB | 0 |

The 2 missing streams are illiquid spot pairs that simply did not trade inside
the window — with a tape you only see a symbol once it prints.

**Trades are ~5x cheaper than books** and, more importantly, they work out of the
box: no snapshot means the ~20 s-per-fetch throttle defect never comes into play.
If you need 100 symbols live on the default config today, the tape is the channel
that works.

### binance-rs cannot serve as a trade baseline here

Worth recording, since the book comparison above was clean:

- **`@trade` delivers nothing.** On the path URL binance-rs builds
  (`wss://stream.binance.com/ws/btcusdt@trade`, no `:9443`) the socket connects
  and then no frame ever arrives; `@depth@100ms` on the same URL is fine.
- **`@aggTrade` is partial and unstable.** Two runs over the same 50 spot symbols
  saw 41–42 of 50 streams and 13–18 trades/s, each ending in
  `Tungstenite(Protocol(ResetWithoutClosingHandshake))` with no reconnect.

ccxt over the same 50 spot symbols saw ~57 aggTrades/s and stayed connected. For
`@depth` the two agreed to within 1.5 % (34 308 vs 33 782 frames), so this is
specific to the trade feeds on that endpoint, not a general throughput gap.

## Reconnect behaviour under a simulated network outage

`ccxt_side` takes `0` as the duration to run **forever** — a plain `while true`
driver loop — and `CCXT_TICK=5` prints a progress line every 5 s:

```bash
CCXT_TICK=5 CCXT_NO_RATELIMIT=1 cargo run --release --bin ccxt_side -- 0 10
```

The outage was injected at the network layer, not faked in the client: a TCP
relay sits on `127.0.0.1:9443` with `/etc/hosts` pointing `stream.binance.com`
at it, so TLS stays end-to-end (real SNI, real certificate) and the relay is a
pure byte pipe. Touching a block-file kills every live connection and refuses
new ones; removing it restores service. `api.binance.com` is left alone, so the
REST snapshots used for re-seeding stay reachable.

### Result: reconnect works; the retry loop does not

10 spot books, 30 s outage starting at t=30 s.

| | `CCXT_BACKOFF_MS=0` (raw ccxt) | `CCXT_BACKOFF_MS=250` (example default) |
|---|---:|---:|
| steady-state CPU per 5 s | 0.19 s (3.8 % of a core) | 0.20 s (4.0 % of a core) |
| CPU per 5 s **during outage** | **3.5 s (70 % of a core)** | **0.02 s (0.4 %)** |
| failed reconnects per 5 s | ~46 000 | 20 |
| total errors over the 30 s outage | ~270 000 | ~105 |
| stderr produced by one 12 s outage | **70 MB** | a few KB |
| frames lost | all, for the outage | all, for the outage |
| time to full rate after service returns | ~3 s | ~3 s |

**The good news:** recovery is correct and fast. `ensure_slot` swaps in a fresh
client, the next `watch_*` re-subscribes, and the 10 books re-seed from REST — 
first frame ~3 s after the network comes back, full rate within 8 s, no
duplicate or stale books, and `resyncs` stops climbing. That held across a 12 s
and a 30 s outage in the same process.

**The bad news:** ccxt applies no backoff of its own. It retries
`connect_async` as fast as the loop can turn — ~9 000 failed TLS handshakes per
second — burning 70 % of a core for the whole outage and achieving nothing: the
250 ms variant recovers at exactly the same moment. Against a real venue that
is also a good way to get an IP ban.

Worse, every failed attempt panics across the runtime's internal `catch_unwind`,
and the default panic hook prints it: a 12 s outage produced a **70 MB** log.
This example installs a silent hook (`CCXT_SHOW_PANICS=1` restores it) and
counts errors instead.

So a `while true` loop around `watch_*` is safe **only if you add your own
backoff**. Two things belong in ccxt-rust rather than in every caller:
exponential backoff with jitter inside `ensure_client`, and surfacing connect
failures as ordinary `Err` values instead of caught panics.

## Caveat: book seeding is throttle-bound in ccxt-rust today

ccxt seeds each book with one REST `fetchOrderBook(limit=1000)` snapshot before
that book can go live. binance-rs has no such step — it just forwards deltas.
That is an inherent difference, but the current Rust runtime makes it far more
expensive than it should be. Measured with the **default** config:

| run | result |
|---|---|
| `ccxt_side 120 10 rr` | 6 / 10 books after 120 s — books go live at 1.6 s, 21.1 s, 41.1 s, 61.1 s, 81.1 s, 101.1 s |
| `ccxt_side 90 10 agg` | 0 / 10 books after 90 s, 0 frames |
| `CCXT_NO_RATELIMIT=1 ccxt_side 60 10 rr` | 10 / 10, `t_all_live` 15.4 s |
| `CCXT_NO_RATELIMIT=1 ccxt_side 60 10 agg` | 10 / 10, `t_all_live` 3.8 s |

Two things are visible there:

1. **~20 s per snapshot.** The first snapshot is free (the bucket starts full),
   every later one waits ~20 s — the 20 s spacing above is exact. Binance declares
   `depth` at weight 20 with `rateLimit: 50` ms, so the wait should be ~1 s. The
   same over-charge shows up in `loadMarkets`: 11.2 s with the limiter, 2.0 s
   without. Disabling the limiter drops per-book seeding to ~1.5 s, which is just
   the REST round-trip.
2. **`agg` amplifies it.** `watch_order_book_for_symbols` subscribes to all N at
   once, so all N snapshot fetches land in a single spawn batch that is drained
   *inside* the WebSocket read loop. Nothing is delivered until the whole batch
   finishes, so with the limiter on, N=10 returns nothing for ~200 s. With the
   limiter off `agg` is the better mode by a wide margin (`t_all_live` 3.8 s vs
   15.4 s for `rr`, and 4753 frames vs 2079).

Neither is a protocol problem — with the limiter off, `agg` seeds 10 books in
3.8 s and runs clean for the rest of the window with 0 resyncs. Treat the
`CCXT_NO_RATELIMIT=1` numbers as what the typed layer costs, and the default-config
rows as an open rate-limiter defect in the Rust runtime.
