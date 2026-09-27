# Historical Market-Data Capture, Storage and Replay Infrastructure (for a possible CCXT historical-data server)

Research date: 2026-09-27. Method note: the sandbox egress proxy blocked direct fetches of docs.tardis.dev, tardis.dev, databento.com, docs.kaiko.com, docs.coinapi.io, crypto-lake.com, code.kx.com, coinbase.com and developers.binance.com. Findings on those vendors therefore come from (a) the vendors' own open-source repositories, cloned and read directly (tardis-machine, tardis-node, tardis-python, databento/dbn, databento-python, crypto-lake/lake-api, binance/binance-public-data, KxSystems/kdb-tick), (b) direct listing of the Binance public-data S3 bucket, and (c) search-engine snippets of the vendor doc pages. Snippet-only claims are marked "(search snippet)" and should be treated as slightly lower confidence than claims verified against source code.

## 1. Tardis.dev: capture, data types, formats, the tardis-machine replay server, and pricing

### Takeaway
Tardis records the raw WebSocket messages each exchange sends and stamps each one with a local arrival timestamp. It sells three things on top of that archive: (1) a raw "exchange-native" replay API, (2) a normalized replay/stream API, and (3) daily gzip CSV datasets. tardis-machine is an MPL-2.0, self-hosted Node server that runs the replay in front of the Tardis cloud API. Its `/ws-replay` endpoint speaks each exchange's own WebSocket subscribe protocol, so an existing exchange WS client can replay history just by changing its URL. This is the closest existing implementation of the "server that replays history in the exchange's own API format" idea. Replay has no wall-clock pacing: it runs as fast as the client can consume, with backpressure.

### Cited Findings
**Capture**
- Every message received over the WebSocket connection is stamped with a synchronized clock at arrival, before any processing, at 100 ns precision, and stored in ISO 8601 format (search snippet) — [Tardis FAQ: Data](https://docs.tardis.dev/faq/data)
- Collection hosts differ by exchange. Example: dYdX and Delta data is collected in GCP europe-west2 (London) while the exchanges run in AWS ap-northeast-1 (Tokyo). Local timestamps are comparable within one collection location, but Tardis warns against using London-vs-Tokyo comparisons for sub-millisecond latency analysis (search snippet) — [Tardis dYdX details](https://docs.tardis.dev/historical-data-details/dydx), [Tardis Delta details](https://docs.tardis.dev/historical-data-details/delta), [Tardis FAQ: Data](https://docs.tardis.dev/faq/data)
- The HTTP API includes order book snapshots at 00:00 UTC each day and whenever a recording WebSocket connection closed and was restarted, because the new connection delivers a fresh snapshot. Re-subscribing (every 24 h) leaves a small gap of about 300–3000 ms depending on the exchange (search snippet) — [Tardis FAQ: Order Books / Data](https://docs.tardis.dev/faq/order-books)
- Tardis says it holds "hundreds of terabytes of raw tick historical data" (search snippet) — [tardis.dev](https://tardis.dev/)

**Raw storage and replay format (from source code)**
- Replay fetches data "slices" from `https://api.tardis.dev/v1` and caches them on disk as `.gz` or `.zst` files. A worker thread prefetches the next slice while the main thread decompresses, splits lines and parses JSON. Each line holds a local timestamp and then the raw message. Normal replay requests the first and last minute as one-minute slices and uses a server-suggested multi-minute slice size in between — [tardis-node ARCHITECTURE.md](https://github.com/tardis-dev/tardis-node/blob/master/ARCHITECTURE.md), [tardis-node src/options.ts](https://github.com/tardis-dev/tardis-node/blob/master/src/options.ts)
- An empty line in the raw stream marks a recording disconnect. With `withDisconnects` / `withDisconnectMessages` set, the client emits `undefined` (raw mode) or a `{type:'disconnect'}` message (normalized mode), and downstream computables such as book snapshots reset — [tardis-node src/replay.ts](https://github.com/tardis-dev/tardis-node/blob/master/src/replay.ts), [Tardis normalization docs](https://docs.tardis.dev/node-client/normalization)
- Some exchanges have date-versioned mappers because the exchange changed its API format at a known date. Example: tardis-machine has a hard-coded `BYBIT_V5_API_SWITCH_DATE = 2023-04-05` — [tardis-node ARCHITECTURE.md](https://github.com/tardis-dev/tardis-node/blob/master/ARCHITECTURE.md), [tardis-machine subscriptionsmappers.ts](https://github.com/tardis-dev/tardis-machine/blob/master/src/ws/subscriptionsmappers.ts)

**Exchange coverage and channels**
- The current `EXCHANGES` list in tardis-node has about 67 venue ids. These include binance, binance-futures, binance-delivery, binance-european-options, bitmex, deribit, okex (spot, swap, futures, options, spreads), bybit (plus spot and options), coinbase, coinbase-international, kraken, cryptofacilities, bitfinex, gate-io, kucoin, bitget, mexc, crypto-com, hyperliquid, lighter, dydx-v4, bullish and polymarket. Delisted venues such as ftx, serum and coinflex are kept for their history — [tardis-node src/consts.ts](https://github.com/tardis-dev/tardis-node/blob/master/src/consts.ts)
- Binance spot channels recorded: `trade, aggTrade, ticker, depth, depthSnapshot, bookTicker, recentTrades, borrowInterest`. `depthSnapshot` is a REST snapshot that Tardis records alongside the WS diff stream — [tardis-node src/consts.ts](https://github.com/tardis-dev/tardis-node/blob/master/src/consts.ts)
- Normalized types: `trade`, `book_change` (with an `isSnapshot` flag), `derivative_ticker` (lastPrice, openInterest, fundingRate, fundingTimestamp, mark/index), `book_ticker`, `option_summary`, `liquidation`, plus computed `book_snapshot_N_Xms`, `quote` and `trade_bar_*` — [tardis-node src/types.ts](https://github.com/tardis-dev/tardis-node/blob/master/src/types.ts), [tardis-machine src/helpers.ts](https://github.com/tardis-dev/tardis-machine/blob/master/src/helpers.ts)
- Tardis's normalized schema is L2 price levels only. The `BookChange` type has no order-id field, so L3 is available only where the raw exchange feed carries it, and only in exchange-native form (inference from the type definition) — [tardis-node src/types.ts](https://github.com/tardis-dev/tardis-node/blob/master/src/types.ts)

**CSV datasets**
- CSV data types: trades, incremental order book L2 updates, order book snapshots (top 25 and top 5), options chains, quotes, book tickers, derivative tickers (open interest, funding, mark price, index price) and liquidations. Files are gzip CSV from `https://datasets.tardis.dev/v1/:exchange/:dataType/:year/:month/:day/:symbol.csv.gz` and each day is usually ready by about 06:00 UTC the next day (search snippet) — [Tardis Downloadable CSV files](https://docs.tardis.dev/downloadable-csv-files), [CSV API reference](https://docs.tardis.dev/downloadable-csv-files/api)
- Data for the first day of each month can be downloaded without an API key (search snippet) — [Tardis CSV API reference](https://docs.tardis.dev/downloadable-csv-files/api)
- The Python client (`tardis-dev` on PyPI) handles exchange-native replay and CSV download only. Normalized replay and streaming require the Node client or tardis-machine — [tardis-python README](https://github.com/tardis-dev/tardis-python)

**tardis-machine replay server (verified from source)**
- The server runs two listeners: HTTP on port N (default 8000) and WebSocket on N+1 (default 8001). HTTP routes are `/replay` (exchange-native), `/replay-normalized` and a health check. WS routes are `/ws-replay` (exchange-native), `/ws-replay-normalized` and `/ws-stream-normalized` (real-time). CLI flags are `--api-key`, `--cache-dir`, `--clear-cache`, `--port`, `--cluster-mode` and `--debug`, with `TM_*` environment variables — [tardis-machine src/tardismachine.ts](https://github.com/tardis-dev/tardis-machine/blob/master/src/tardismachine.ts), [bin/tardis-machine.js](https://github.com/tardis-dev/tardis-machine/blob/master/bin/tardis-machine.js)
- `/ws-replay?exchange=..&from=..&to=..[&session=..]` waits for the client's native subscribe messages. A per-exchange `SubscriptionMapper` then translates them into Tardis channel/symbol filters. For Binance, `{"method":"SUBSCRIBE","params":["btcusdt@depth@100ms"]}` becomes channel `depth` and symbol `btcusdt`. Mappers exist for about 40 venue families (bitmex, coinbase, deribit, okex*, kraken, binance*, bybit*, huobi, gate-io, kucoin, bitget, mexc, hyperliquid, lighter, bitvavo and others). Unsupported exchanges get an error telling the user to use HTTP instead — [tardis-machine subscriptionsmappers.ts](https://github.com/tardis-dev/tardis-machine/blob/master/src/ws/subscriptionsmappers.ts), [src/ws/replay.ts](https://github.com/tardis-dev/tardis-machine/blob/master/src/ws/replay.ts)
- Tardis's own description: "The WebSocket API replays data with the same format and subscribe logic as real-time exchange APIs — existing exchange WebSocket clients can connect to this endpoint" — [tardis-machine README](https://github.com/tardis-dev/tardis-machine/blob/master/README.md). The docs add that this works "in many cases ... just by changing URL" (search snippet) — [Tardis Machine v3 announcement](https://tardis.substack.com/p/tardis-machine-server-v3-unified)
- Several WS connections that share a `session` key and open within the 2-second `SESSION_START_DELAY_MS` window join one replay session. The server merges their streams by local timestamp through `combine()`, which gives synchronized replay across multiple sockets or exchanges. A connection that sends no subscription fails the session — [src/ws/replay.ts](https://github.com/tardis-dev/tardis-machine/blob/master/src/ws/replay.ts)
- Replay speed is not controlled. The code sends messages as fast as the socket drains and only waits while `getBufferedAmount() > 0`, so replay runs faster than real time and is limited by the consumer. There is no speed parameter and no wall-clock pacing in `/ws-replay` or `/ws-replay-normalized`. Seeking works only through the `from`/`to` query parameters — [src/ws/replay.ts](https://github.com/tardis-dev/tardis-machine/blob/master/src/ws/replay.ts), [src/ws/replaynormalized.ts](https://github.com/tardis-dev/tardis-machine/blob/master/src/ws/replaynormalized.ts)
- Exchange-native WS replay runs with `withDisconnects: false`, so a client using `/ws-replay` gets no signal when the recorder disconnected. It sees only the fresh snapshot that follows — [src/ws/replay.ts](https://github.com/tardis-dev/tardis-machine/blob/master/src/ws/replay.ts)
- `/ws-replay-normalized?options=<JSON>` takes an array of `{exchange, symbols, from, to, dataTypes}` and supports computed data types (book snapshots, trade bars) — [src/ws/replaynormalized.ts](https://github.com/tardis-dev/tardis-machine/blob/master/src/ws/replaynormalized.ts)
- tardis-machine and tardis-node are both MPL-2.0. The server itself needs a paid Tardis API key to fetch data outside the free samples — [tardis-machine LICENSE](https://github.com/tardis-dev/tardis-machine/blob/master/LICENSE), [tardis-machine README](https://github.com/tardis-dev/tardis-machine)
- NautilusTrader ships a Tardis integration, so a third-party backtester already consumes Tardis data (search snippet) — [NautilusTrader Tardis integration](https://nautilustrader.io/docs/latest/integrations/tardis/)

**Pricing and licensing**
- Plans are subscriptions (monthly, quarterly or yearly) for solo, academic, professional and business users. Yearly billing includes the full back history, quarterly includes 6 months and monthly includes 2 months. Tardis does not sell fixed date ranges or custom exports. The trial lasts 30 days and covers a random 7–14-day range of recent data (search snippet) — [Tardis FAQ: Billing and Subscriptions](https://docs.tardis.dev/faq/billing-and-subscriptions)
- Third-party sources quote Professional at $599/month and state that Academic, Solo and Pro plans see 4 years of history while Business gets the full archive. These are secondary sources and I did not verify them against tardis.dev — [algos.org data sourcing guide](https://www.algos.org/p/data-sourcing-the-guide), [Aperiodic vs Tardis](https://aperiodic.io/compare/aperiodic-vs-tardis)

### Inferences
- tardis-machine is a working reference design for "replay in exchange-native WS format". It has three parts: per-exchange subscribe-message mappers, a timestamp-ordered merge, and backpressure-driven send. Porting the idea to CCXT would mean a mapper per CCXT pro exchange: parse the `watch*` subscribe payload and emit the recorded raw frames. CCXT's static WS test harness (`ts/src/test/static/ws/*.json`, which replays canned frames into `handleMessage`) already does a small version of this.
- Tardis stores raw frames plus an arrival timestamp and normalizes at read time. That keeps storage simple, but it requires date-versioned parsers, because exchanges change their WS schemas.
- A replay server without pacing is fine for backtests but wrong for testing latency-sensitive live code. A CCXT design should decide whether to add a `speed` or real-time pacing option.

### Gaps
- Exact current Tardis prices and license text (redistribution and derived-data rights for subscribers) could not be fetched because docs.tardis.dev and tardis.dev were blocked.
- No authoritative per-exchange history start dates were retrieved. Many Tardis feeds reportedly start in 2019, but I could not verify this.
- Whether the HTTP `/replay` endpoint supports any pacing: I found no speed parameter in the code.

## 2. Databento: DBN, schemas, timestamps, and intraday replay in the live API

### Takeaway
Databento normalizes every venue into fixed-width binary structs (DBN, compressed with zstd). The same DBN is used for historical streaming, batch flat files and live streaming, so one callback-based code path serves backtest and live. The live API can start a subscription up to about 24 h in the past ("intraday replay") and then continue seamlessly into real time. Every record carries three clocks (`ts_event`, `ts_recv`, `ts_in_delta`), a venue `sequence`, and quality flags that mark bad timestamps and possibly corrupt books instead of deleting data.

### Cited Findings
- DBN is "an extremely fast message encoding and storage format for normalized market data" with "a simple, self-describing metadata header and a fixed set of struct definitions". It is the default encoding for live streaming, historical streaming and batch flat files, "highly compressible with Zstandard", and Apache-2.0 licensed — [databento/dbn README](https://github.com/databento/dbn)
- Schemas in the `Schema` enum: MBO (market by order, L3), MBP-1, MBP-10, TBBO (trades with the BBO immediately before each trade), Trades, OHLCV-1s/1m/1h/1d, OHLCV-EOD, Definition (instrument definitions), Statistics ("additional data disseminated by publishers"), Status (trading status), Imbalance (auction imbalance), CMBP-1 / CBBO-1s / CBBO-1m / TCBBO (consolidated), BBO-1s / BBO-1m — [dbn rust/dbn/src/enums.rs](https://github.com/databento/dbn/blob/main/rust/dbn/src/enums.rs)
- Field definitions from the record structs:
  - `ts_event`: "The matching-engine-received timestamp expressed as the number of nanoseconds since the UNIX epoch"
  - `ts_recv`: "The capture-server-received timestamp", which is the index timestamp
  - `ts_in_delta`: "The matching-engine-sending timestamp expressed as the number of nanoseconds before `ts_recv`"
  - `sequence`: "The message sequence number assigned at the venue"
  - plus `publisher_id` and `instrument_id`
  
  — [dbn rust/dbn/src/record.rs](https://github.com/databento/dbn/blob/main/rust/dbn/src/record.rs)
- Flags:
  - `LAST`: last record in the venue event for that instrument
  - `TOB`: top-of-book record
  - `SNAPSHOT`: "sourced from a replay, such as a snapshot server"
  - `MBP`: aggregated price level
  - `BAD_TS_RECV`: "ts_recv value is inaccurate due to clock issues or packet reordering"
  - `MAYBE_BAD_BOOK`: "an unrecoverable gap was detected in the channel"
  
  — [dbn rust/dbn/src/flags.rs](https://github.com/databento/dbn/blob/main/rust/dbn/src/flags.rs)
- Databento prefers marking inconsistent book states with these flags over discarding data. Out-of-order or missing data can be "self-healed with natural refresh" (search snippet) — [Databento blog: data integrity and cleaning](https://databento.com/blog/data-cleaning)
- Capture timestamps are taken "when the packet is pulled off the wire, synchronized to a GPS clock using PTP", which "enables accurate backtesting and simulation of the matching engine round-trip delay". They match the packet timestamps in Databento's PCAP data (search snippet) — [Databento tick data](https://databento.com/tick-data), [Databento NTP/PTP post](https://medium.databento.com/lies-damned-lies-and-latency-behind-databentos-ntp-time-service-ea8ad6f7a1a2)
- Live `subscribe(..., start=...)`: "The inclusive start of subscription replay. Pass `0` to request all available data. Cannot be specified after the session is started." `snapshot=True` (which requires `start=None`) requests a book snapshot instead — [databento-python live/client.py](https://github.com/databento/databento-python/blob/main/databento/live/client.py), [Intraday replay docs](https://databento.com/docs/api-reference-live/basics/intraday-replay)
- The live API offers "real-time and intraday history from the last 24 hours" and uses "the same interfaces and data structures as their historical market replay, letting you use the same code for backtest and live trading" (search snippet) — [Databento Live](https://databento.com/live). Databento says it can only guarantee 24 h of replay, down from an earlier one-week target, because of message rates (search snippet) — [Databento roadmap item](https://roadmap.databento.com/b/n0o5prm6/feature-ideas/provide-support-for-live-intraday-replay-up-to-1-week)
- `DBNStore.replay(callback)` dispatches each record of a historical block to a handler, mirroring the callback pattern of the Live client (search snippet) — [DBNStore.replay docs](https://databento.com/docs/api-reference-historical/helpers/dbn-store-replay)
- The instrument definition schema supplies point-in-time instrument metadata. I confirmed the schema exists in the enum but could not fetch the doc prose on point-in-time semantics — [dbn enums.rs](https://github.com/databento/dbn/blob/main/rust/dbn/src/enums.rs)

### Inferences
- Databento's "replay" is a normalized-schema replay that starts from a timestamp and continues into live. It is not an exchange-native-format replay. Its main lesson for CCXT is that one record type and one client interface for historical and live lets the same strategy code run unmodified. CCXT's unified structures (Trade, OrderBook, Ticker) could play the role of Databento's schemas.
- Storing both an exchange timestamp and a capture timestamp, plus sequence numbers and gap flags, is the professional baseline. CCXT unified structures currently carry only `timestamp`. Replay fidelity would need an additional local receive time.

### Gaps
- Databento docs pages were blocked, so exact intraday replay limits per dataset, definition-schema point-in-time behavior and pricing were not verified beyond snippets.
- Databento's crypto coverage (if any) was not researched. It is primarily equities, futures and options.

## 3. Kaiko, Crypto Lake, CoinAPI, Amberdata: data types, depth, delivery, quality

### Takeaway
All four vendors deliver bulk files (CSV.gz or Parquet) to cloud storage, not exchange-native replay. Order-book depth ranges from sampled top-N snapshots to full tick-level L2/L3 updates starting from a snapshot. None of them offers a server that emulates exchange WebSocket APIs; that niche is Tardis's.

### Cited Findings
**Kaiko**
- Delivers tick-level data by stream (Kaiko Stream), REST, daily CSV files and cloud shares such as Snowflake (search snippet) — [Kaiko L1/L2 data](https://www.kaiko.com/products/l1-l2-data)
- CSV files are daily and named like `[kaiko_legacy_slug]_[instrument_symbol]_[date].csv.gz`. Tick-level "bids and asks" updates are meant to be applied to a raw order-book snapshot in a companion file (search snippet) — [Kaiko cloud delivery: bids and asks](https://docs.kaiko.com/cloud-delivery/data-feeds/level-2-tick-level/bids-and-asks), [raw order book snapshot](https://docs.kaiko.com/cloud-delivery/data-feeds/level-2-aggregations/raw-order-book-snapshot)
- Order-book files have "at least one snapshot per minute", with history since 2015 depending on the exchange (search snippet) — [Kaiko L1/L2 data](https://www.kaiko.com/products/l1-l2-data)

**Crypto Lake**
- Offers order book, tick trades and 1-minute candles for about 10 exchanges and the top tokens plus altcoins. The standard `book` table holds 20 levels per side sampled every 100 ms. `book_delta_v2` carries full-depth updates at higher frequency (search snippet) — [crypto-lake.com](https://crypto-lake.com/), [Order book data](https://crypto-lake.com/order-book-data/)
- Tables in the Python client (`lakeapi`): `book, book_delta, trades, trades_mpid, candles, level_1, funding, open_interest, liquidations, book_1m`. Data is read from S3 as partitioned Parquet (`trades/exchange=BINANCE/symbol=BTC-USDT/dt=2022-01-01/*.parquet`). The default bucket path is `qnt.data/market-data/cryptofeed`, which suggests the open-source `cryptofeed` library does the capture (inference from the bucket name) — [crypto-lake/lake-api lakeapi/main.py](https://github.com/crypto-lake/lake-api/blob/master/lakeapi/main.py)
- Direct S3 access without lakeapi is possible but "not recommended or supported" (search snippet) — [crypto-lake data page](https://crypto-lake.com/data/)

**CoinAPI flat files**
- Delivered as `.csv.gz` over an S3-compatible endpoint `s3.flatfiles.coinapi.io` with paths like `T-LIMITBOOK_FULL/D-20250901/E-BINANCEOPT/` (search snippet) — [CoinAPI flat files limitbook](https://docs.coinapi.io/flat-files-api/data-types/limitbook)
- `limitbook_full` records every L2 or L3 update from the source. Each file starts with a snapshot, and the columns are `time_exchange, time_coinapi, update_type, is_buy, entry_px, entry_sx, order_id`, with microsecond UTC precision. The two columns give an exchange timestamp and a capture timestamp (search snippet) — [CoinAPI flat files limitbook](https://docs.coinapi.io/flat-files-api/data-types/limitbook)
- Pricing is based on usage and data type. Trades are quoted at $3.00/GiB. CoinAPI claims 632 TB of history from 380+ exchanges and archives back to 2010 (search snippets; marketing claims) — [CoinAPI flat files pricing](https://www.coinapi.io/products/flat-files/pricing), [CoinAPI flat files](https://www.coinapi.io/products/flat-files)

**Amberdata**
- Provides historical order-book events (updates) and snapshots for spot, futures and options. Bulk delivery is daily-updated Parquet on AWS S3, with Snowflake also available (search snippet) — [Amberdata delivery](https://www.amberdata.io/delivery), [Amberdata order book](https://www.amberdata.io/order-book)
- Deribit options and futures history starts 2021-05-21 and covers liquidations, OHLCV, open interest, book events and snapshots, trades and bid/ask (search snippet) — [Amberdata Deribit](https://www.amberdata.io/deribit-market-data)

### Inferences
- The storage pattern the industry has settled on is: a daily partition per exchange and symbol, a snapshot at the start of each file followed by deltas, and gzip CSV or Parquet on S3. A CCXT server that also exported this layout would interoperate with existing tooling.
- Two capture patterns coexist: sampled snapshots (Crypto Lake 100 ms/20 levels, Kaiko 1/min, Binance bookDepth 30 s) and full delta streams. Only full deltas support realistic fill and queue simulation.

### Gaps
- Kaiko and Amberdata gap-handling and outage methodology could not be verified (docs blocked; search returned only marketing text).
- Crypto Lake history start dates and pricing were not found.

## 4. Binance public data (data.binance.vision)

### Takeaway
Binance publishes free daily and monthly zip-of-CSV dumps with SHA-256 checksums. They cover trades, aggTrades and klines for spot and futures, plus futures bookTicker, sampled bookDepth, metrics (OI and long/short ratios), funding rate, mark/index/premium klines and COIN-M liquidation snapshots. There is no full-depth order-book delta dump, so tick-level L2 is not available from this source.

### Cited Findings
- Daily files appear the next day and monthly files on the first Monday of the month. Every zip has a `.CHECKSUM`, and Binance publishes a changelog of retroactively replaced files (e.g. 2022-08-08 kline fixes, 2022-04-21 aggTrade alignment). The repository is MIT-licensed — [binance-public-data README](https://github.com/binance/binance-public-data)
- Spot timestamps are in microseconds from 2025-01-01 onward. Kline intervals run from 1s to 1mo — [binance-public-data README](https://github.com/binance/binance-public-data)
- Top-level prefixes, from a direct listing of the public S3 bucket (`s3-ap-northeast-1.amazonaws.com/data.binance.vision`, listed 2026-09-27):
  - spot daily: `aggTrades, klines, trades`
  - USD-M futures daily: `aggTrades, bookDepth, bookTicker, indexPriceKlines, klines, markPriceKlines, metrics, premiumIndexKlines, trades`
  - USD-M futures monthly adds `fundingRate`
  - COIN-M daily adds `liquidationSnapshot`
  - options daily: `BVOLIndex, EOHSummary`
  
  — [data.binance.vision S3 listing](https://s3-ap-northeast-1.amazonaws.com/data.binance.vision?delimiter=/&prefix=data/futures/um/daily/)
- History starts: spot BTCUSDT monthly trades begin 2017-08; USD-M BTCUSDT `metrics` begin 2020-09-01; `fundingRate` monthly begins 2020-01; USD-M `bookDepth` for BTCUSDT begins 2023-01-01 — [S3 listing (bookDepth)](https://s3-ap-northeast-1.amazonaws.com/data.binance.vision?prefix=data/futures/um/daily/bookDepth/BTCUSDT/&max-keys=3), [S3 listing (metrics)](https://s3-ap-northeast-1.amazonaws.com/data.binance.vision?prefix=data/futures/um/daily/metrics/BTCUSDT/&max-keys=1)
- USD-M BTCUSDT daily `bookTicker` files appear to stop at 2024-03-30 (last key in the listing) — [S3 listing (bookTicker)](https://s3-ap-northeast-1.amazonaws.com/data.binance.vision?prefix=data/futures/um/daily/bookTicker/BTCUSDT/&marker=data/futures/um/daily/bookTicker/BTCUSDT/BTCUSDT-bookTicker-2024-03-30)
- `bookDepth` is not an order book. Its columns are `timestamp, percentage, depth, notional`: aggregate depth at ±0.2/1/2/3/4/5% from mid, sampled about every 30 s (the 2026-09-01 file has 34,560 rows = 2,880 samples × 12 bands). `metrics` has 5-minute rows of `sum_open_interest, sum_open_interest_value, count_toptrader_long_short_ratio, sum_toptrader_long_short_ratio, count_long_short_ratio, sum_taker_long_short_vol_ratio` — [BTCUSDT-bookDepth-2026-09-01.zip](https://s3-ap-northeast-1.amazonaws.com/data.binance.vision/data/futures/um/daily/bookDepth/BTCUSDT/BTCUSDT-bookDepth-2026-09-01.zip), [BTCUSDT-metrics-2026-09-01.zip](https://s3-ap-northeast-1.amazonaws.com/data.binance.vision/data/futures/um/daily/metrics/BTCUSDT/BTCUSDT-metrics-2026-09-01.zip)
- Sizes: spot BTCUSDT daily trades zip is 26.6 MB (2026-09-01) and 23.9 MB (2026-09-02). USD-M BTCUSDT daily trades is 26.3 MB and aggTrades 16.1 MB (2026-09-01). A 2023-05-16 USD-M BTCUSDT bookTicker day was 53.8 MB zipped. A bookDepth day is about 0.46 MB — [S3 listing](https://s3-ap-northeast-1.amazonaws.com/data.binance.vision?prefix=data/spot/daily/trades/BTCUSDT/BTCUSDT-trades-2026-09&max-keys=4)
- The CSV files come from the REST endpoints (`/api/v3/aggTrades`, `/api/v3/klines`, `/api/v3/historicalTrades`, `/fapi/v1/*`, `/dapi/v1/*`) — [binance-public-data README](https://github.com/binance/binance-public-data)

### Inferences
- Binance's dumps map directly onto CCXT's `fetchTrades` and `fetchOHLCV` structures. They are free, checksummed and published by the exchange itself, which makes them the lowest-risk bootstrap source for a CCXT trade/OHLCV backtester. They cannot drive order-book replay.
- Because Binance replaces archived files retroactively, a mirror has to re-verify checksums, not assume files are immutable.

### Gaps
- The data.binance.vision website itself was blocked; the S3 bucket listing was used instead. The redistribution terms for these specific files (as opposed to the MIT license on the downloader scripts) were not found.

## 5. kdb+/tick capture and replay

### Takeaway
The classic professional stack has four parts:
- A tickerplant (TP) receives `.u.upd` calls from feed handlers, appends each message to a daily on-disk log and publishes it to subscribers.
- A real-time database (RDB) holds today's data in memory.
- At end of day the RDB is saved to a partitioned historical database (HDB).
- Recovery and replay use `-11!`, which streams-executes the log, calling `upd` for each logged message.

Firms reuse the same mechanism for simulation by replaying a TP log (or HDB-derived messages) into a process that defines its own `upd`.

### Cited Findings
- In `tick.q`, `upd` inserts the data, publishes it and appends `(`upd;t;x)` to the log handle. At startup, `.u.ld` runs `-11!(-2;L)` to count valid chunks and aborts with "is a corrupt log. Truncate to length ..." if the log is damaged. `endofday` rolls to a new log each day — [KxSystems/kdb-tick tick.q](https://github.com/KxSystems/kdb-tick/blob/master/tick.q)
- In `r.q`, the RDB defines `upd:insert`. `.u.rep` initializes the schema and then runs `-11!y` to replay the TP log (message count and log path returned by `.u.sub`). `.u.end` saves partitions to the HDB with `.Q.hdpf` — [KxSystems/kdb-tick tick/r.q](https://github.com/KxSystems/kdb-tick/blob/master/tick/r.q)
- A vanilla setup has the TP logging to disk and publishing to an in-memory RDB; at day end the RDB is saved as another day in the HDB. The RDB's `upd` is "extremely simple" for both log replay and intraday updates (search snippet) — [code.kx.com: Realtime database](https://code.kx.com/q/learn/startingkdb/tick/), [code.kx.com: tick.q](https://code.kx.com/q/architecture/tickq/)
- `-11!(n;x)` streams-executes the first n chunks of log file x. Each chunk is evaluated through `.z.ps` (default `value`), which is "functionally equivalent to `value each get`:logfile` but uses far less memory". `-11!(-2;log)` finds the valid chunk count for corrupted logs (search snippet) — [code.kx.com KB: Logging, recovery and replication](https://code.kx.com/q/kb/logging/), [TimeStored -11! guide](https://www.timestored.com/kdb-guides/bang-internal/11-replay)
- KX publishes a white paper on data recovery for kdb+tick (search snippet) — [code.kx.com: Data recovery for kdb+tick](https://code.kx.com/q/wp/data-recovery/)

### Inferences
- The kdb+/tick design gets replay "for free" because every live message is logged as a function call (`upd[table;data]`). Replay is re-invoking that function, and a simulator just redefines `upd`. The CCXT analogue is to log raw WS frames (as Tardis does) and replay them into the existing `handleMessage`, which the CCXT static-WS test harness already does in miniature.
- kdb+ separates the append-only daily log (for replay) from the columnar HDB (for queries). That is the same split as raw-frame archive versus Parquet/CSV datasets at Tardis and the other vendors.

### Gaps
- code.kx.com could not be fetched, so I found no primary KX text on firms replaying TP logs into strategy simulators. That use is standard practice but is inferred here, not cited.

## 6. Storage sizing and compression

### Takeaway
Full-depth L2 delta streams for top crypto perps run to roughly 1–2 GB per symbol per day compressed. Trades alone are tens of MB per day for BTCUSDT. Sampled snapshots are single-digit MB. A full multi-exchange L2 archive is in the hundreds-of-TB range. Common compression is gzip (CSV), zstd (Tardis cache, DBN) and Parquet.

### Cited Findings
- A Binance BTCUSDT perpetual day of full L2 is "1–2 GB compressed with tens of millions of events". A BitMEX XRPUSDT perp day is about 59 MB with 1.87 M events. Top-10 snapshots at 1 s are about 4–5 MB/day as csv.gz (search snippet; small vendor, moderate confidence) — [cryptostruct order-book dataset guide](https://cryptostruct.com/guides/order-book-dataset-for-machine-learning), [CryptoHFTData Binance order book](https://www.cryptohftdata.com/datasets/binance-orderbook-data)
- Measured from the Binance bucket: BTCUSDT daily trades are about 24–27 MB zipped (spot and USD-M), aggTrades about 16 MB, bookTicker about 54 MB, and 30-second bookDepth about 0.46 MB — [data.binance.vision S3 listing](https://s3-ap-northeast-1.amazonaws.com/data.binance.vision?prefix=data/futures/um/daily/trades/BTCUSDT/BTCUSDT-trades-2026-09-01&max-keys=1)
- Archive totals: Tardis claims "hundreds of terabytes" of raw tick data. CoinAPI claims 632 TB of flat files (search snippets) — [tardis.dev](https://tardis.dev/), [CoinAPI flat files](https://www.coinapi.io/products/flat-files)
- Formats: Tardis caches raw slices as gzip or zstd and streams zstd frames through Node's built-in decoder — [tardis-node ARCHITECTURE.md](https://github.com/tardis-dev/tardis-node/blob/master/ARCHITECTURE.md). DBN is fixed-width binary with zstd (`.dbn.zst`) — [databento/dbn](https://github.com/databento/dbn). Crypto Lake and Amberdata use Parquet — [lake-api](https://github.com/crypto-lake/lake-api), [Amberdata delivery](https://www.amberdata.io/delivery)

### Inferences
- A rough budget for recording the top ~20 symbols on ~10 venues with full L2: about 200 symbol-days × 0.1–2 GB, i.e. tens to a few hundred GB per day, or about 10–100 TB per year compressed. That is beyond what an open-source project can host for free. This is an order-of-magnitude extrapolation, not a measured figure.

### Gaps
- There is no authoritative per-exchange daily L2 volume published by Tardis or Databento that I could reach. The Tardis free first-of-month CSVs, which would allow a direct measurement, were blocked (403) from this environment.

## 7. Licensing and redistribution of exchange market data

### Takeaway
Major exchanges' terms forbid commercial redistribution and data-feed services built on their public API data without written consent. Coinbase goes further and forbids any third-party redistribution or display of market data or derived works. An open-source project publicly hosting a historical replay server of raw exchange data would very likely breach these terms unless it had licenses. The legally safer designs are: software that users run themselves against their own recordings or their own vendor subscriptions (the tardis-machine model), or relaying only data the exchange itself publishes for bulk download.

### Cited Findings
- Binance: without written consent, commercial uses of Binance data are prohibited, "including data feeding or streaming services that make use of any market data of Binance", as are services that charge for or otherwise profit from (including through advertising) market data obtained from Binance (search snippet) — [Binance terms](https://www.binance.com/en/terms), [Binance Open Platform Terms of Use](https://developers.binance.com/docs/binance-spot-api-docs/PROD-TERMS-OF-USE)
- Coinbase Market Data Terms prohibit redistributing, displaying or disseminating Market Data "or any data, charts, analytics, research, or other works based on the Market Data" to any third party outside your organization, and restrict commercial derived works such as indexes and benchmarks. Redistribution goes through authorized partners or the Coinbase Data Marketplace (search snippet) — [Coinbase Market Data Terms of Use](https://www.coinbase.com/legal/market_data), [Coinbase Data Marketplace](https://data.coinbase.com/)
- Kraken requires prior permission for "any non-personal commercial use of data from publicly accessible endpoints, such as market data" (search snippet) — [Kraken legal](https://www.kraken.com/legal)
- Open-source projects have hit these terms. Superalgos had an issue titled "Violation of Binance's Terms of Use" (search snippet; I did not read the details) — [Superalgos issue #1019](https://github.com/Superalgos/Superalgos/issues/1019)
- The Binance public-data downloader repo is MIT-licensed, but that covers the scripts, not necessarily redistribution of the data — [binance-public-data README](https://github.com/binance/binance-public-data)
- tardis-machine is distributed as MPL-2.0 code but fetches data only with the user's own paid API key. Data licensing therefore sits between each user and Tardis, not with the software — [tardis-machine README](https://github.com/tardis-dev/tardis-machine)

### Inferences
- For CCXT, a self-hosted "record and replay" tool (users capture their own feeds through ccxt.pro and replay them locally) avoids redistribution. So do pluggable adapters to licensed vendors (Tardis, Databento and others) and to exchange-published dumps. A public CCXT-hosted archive of raw feeds would need per-exchange permission. Note that CCXT is not a commercial service, which may matter but is not an exemption in the Coinbase terms.

### Gaps
- Primary texts of the Binance, Coinbase and Kraken terms were not fetched (blocked), so the wording above comes from search snippets. Legal review of the exact current clauses is needed. Terms of OKX, Bybit and Deribit were not researched.

## 8. Data quality: gaps, ordering, sequence numbers, outages, clock skew

### Takeaway
Vendors handle quality mainly by recording enough metadata to detect problems: exchange and local timestamps, venue sequence numbers, snapshot-after-reconnect, and explicit disconnect or bad-book flags. They do not "fix" the data. Consumers are expected to reset book state at the markers.

### Cited Findings
- Tardis:
  - Snapshots at 00:00 UTC and after every reconnect.
  - A 300–3000 ms gap at the daily re-subscription.
  - Disconnects recorded as empty lines and surfaced as `disconnect` messages in normalized replay.
  - Local timestamps with 100 ns resolution from a synchronized clock.
  - A warning that cross-region timestamps are not comparable at sub-millisecond level.
  
  (search snippets plus source) — [Tardis FAQ: Data](https://docs.tardis.dev/faq/data), [Tardis FAQ: Order Books](https://docs.tardis.dev/faq/order-books), [tardis-node replay.ts](https://github.com/tardis-dev/tardis-node/blob/master/src/replay.ts)
- Databento: `sequence` per record, a `BAD_TS_RECV` flag for clock or reordering problems, a `MAYBE_BAD_BOOK` flag for unrecoverable gaps, and a `SNAPSHOT` flag for records from snapshot/replay servers. Capture clocks are PTP/GPS-disciplined. Databento prefers flagging to dropping data and allows "natural refresh" recovery — [dbn flags.rs](https://github.com/databento/dbn/blob/main/rust/dbn/src/flags.rs), [dbn record.rs](https://github.com/databento/dbn/blob/main/rust/dbn/src/record.rs), [Databento data cleaning blog](https://databento.com/blog/data-cleaning)
- A public Databento issue reports occasional out-of-order `ts_recv` within the same instrument on a live dataset. Even professional capture shows ordering anomalies (search snippet) — [Databento issue: out-of-order ts_recv](https://issues.databento.com/b/6vrl98vl/feature-ideas/equsmini-live-data-occasional-out-of-order-ts-recv-within-the-same-instrument)
- CoinAPI stores both `time_exchange` and `time_coinapi` per book update (search snippet) — [CoinAPI limitbook](https://docs.coinapi.io/flat-files-api/data-types/limitbook)
- Binance republishes corrected archive files and lists the replacements with checksums — [binance-public-data README](https://github.com/binance/binance-public-data)
- kdb+/tick detects corrupt or truncated logs with `-11!(-2;log)` and refuses to start until the log is truncated — [kdb-tick tick.q](https://github.com/KxSystems/kdb-tick/blob/master/tick.q)
- tardis-machine's exchange-native `/ws-replay` drops the disconnect markers (`withDisconnects: false`). A client relying on native sequence numbers (e.g. Binance `U`/`u`) would detect the gap only through sequence discontinuity — [tardis-machine ws/replay.ts](https://github.com/tardis-dev/tardis-machine/blob/master/src/ws/replay.ts)

### Inferences
- The minimum a CCXT capture/replay design needs: a local receive timestamp (monotonic plus wall clock, with NTP/PTP status), preservation of the exchange's own sequence fields, explicit connection open/close/resubscribe records, and a periodic REST snapshot. Replaying raw frames into CCXT's existing `handleMessage` would then exercise CCXT's own checksum and sequence-gap logic, including its resync paths.

### Gaps
- No quantitative vendor data (for example, gap frequency per exchange per month) was found.
