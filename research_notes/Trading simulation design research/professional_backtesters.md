# Professional / Equities-Oriented Backtesting Platforms — Design Mechanics (LEAN, Zipline, Backtrader, VectorBT/PRO, QuantRocket, Deltix QuantOffice, TradeStation/MultiCharts)

Research method note: quantconnect.com, lean.io, zipline.ml4trading.io, backtrader.com, vectorbt.dev/.pro, quantrocket.com, deltixlab.com, multicharts.com and tradestation.com were **blocked by the sandbox egress proxy** for direct fetch (2026-09-27). Facts below come from (a) shallow clones of the primary source repos on GitHub — `QuantConnect/Lean` (last commit 2026-09-25), `QuantConnect/Documentation` (the source of quantconnect.com/docs/v2, last commit 2026-09-25), `stefan-jansen/zipline-reloaded` (last commit 2025-11-13), `mementum/backtrader` (last commit 2023-04-19), `polakowo/vectorbt` (v1.1.1, last commit 2026-09-26) — cited by GitHub URL; and (b) web-search result snippets from vendor pages (cited by the vendor URL the snippet came from; content not independently fetched, so treat snippet-level claims as slightly lower confidence). QC Documentation repo paths map 1:1 to quantconnect.com/docs/v2 pages.

Abbreviations for frequently cited sources:
- QCDOC = https://github.com/QuantConnect/Documentation/tree/master (docs source)
- LEAN = https://github.com/QuantConnect/Lean/tree/master
- ZL = https://github.com/stefan-jansen/zipline-reloaded/tree/main
- BT = https://github.com/mementum/backtrader/tree/master
- VBT = https://github.com/polakowo/vectorbt/tree/master

---

## Data: formats, storage, point-in-time handling, ingestion

### Takeaway
LEAN uses a deliberately open, vendor-neutral flat-file store (zipped CSV/JSON, one folder per securityType/market/resolution/ticker, sparse "only-on-change" rows) plus auxiliary map files (symbol changes/delistings) and factor files (splits/dividends) applied at read time via a selectable normalization mode; Zipline uses "bundles" (bcolz columnar bars + SQLite adjustments + asset DB) ingested once; QuantRocket layers databases (history DBs, TimescaleDB for live, prefab Sharadar bundles) under both Moonshot and Zipline. Point-in-time correctness is treated as a data-vendor + dynamic-universe problem, not an engine feature. For CCXT the LEAN layout (with `marketName` = exchange id) is the most directly transferable pattern.

### Cited Findings
**LEAN**
- "From the beginning, LEAN has strived to use an open, human-readable data format - independent of any specific database or file format… Data compression is done in zip format, and all individual files are CSV or JSON." — [LEAN Data Format intro (QCDOC)](https://github.com/QuantConnect/Documentation/blob/master/06%20LEAN%20Engine/03%20Data%20Format/01%20Key%20Concepts/01%20Introduction.html); also [LEAN Data/readme.md](https://github.com/QuantConnect/Lean/blob/master/Data/readme.md)
- Folder layout: tick/second/minute → `/data/securityType/marketName/resolution/ticker/date_tradeType.zip`; hour/daily → `/data/securityType/marketName/resolution/ticker.zip`. "The marketName value is used to separate different tradable assets with the same ticker. E.g. BTCUSDT is traded on multiple brokerages all with slightly different prices." — [Folder Structure (QCDOC)](https://github.com/QuantConnect/Documentation/blob/master/06%20LEAN%20Engine/03%20Data%20Format/01%20Key%20Concepts/02%20Folder%20Structure.html)
- Prices are in the quote currency (e.g. ETHBTC 0.06920 = BTC per ETH); "When there is no activity for a security, the price is omitted from the file. Only new ticks and price changes are recorded." — [Price Representation (QCDOC)](https://github.com/QuantConnect/Documentation/blob/master/06%20LEAN%20Engine/03%20Data%20Format/01%20Key%20Concepts/03%20Price%20Representation.html)
- Core data types: TradeBar, QuoteBar (bid/ask bars), Tick (trade or quote) — [LEAN Data/readme.md](https://github.com/QuantConnect/Lean/blob/master/Data/readme.md)
- Resolutions offered as bars: second, minute, hour, daily (plus ticks); other periods via consolidators — [Period Values (QCDOC)](https://github.com/QuantConnect/Documentation/blob/master/03%20Writing%20Algorithms/01%20Key%20Concepts/05%20Time%20Modeling/01%20Periods/04%20Period%20Values.html)
- Auxiliary data: `MapFile` "Represents an entire map file for a specified symbol", exposes `Permtick` ("the entity's unique symbol, i.e OIH.1") and `DelistingDate` ("the last date in the map file which is indicative of a delisting event"); factor files via `CorporateFactorProvider`, `FactorFile`, `PriceScalingExtensions`, `MapFileResolver`, zip providers — [LEAN Common/Data/Auxiliary](https://github.com/QuantConnect/Lean/tree/master/Common/Data/Auxiliary), [MapFile.cs](https://github.com/QuantConnect/Lean/blob/master/Common/Data/Auxiliary/MapFile.cs)
- `DataNormalizationMode` enum: Raw ("dividends are paid in cash and splits are applied directly to your portfolio quantity"), Adjusted (splits+dividends backward-adjusted, "price today is identical to the current market price"), SplitAdjusted, TotalReturn, and futures continuous-contract modes ForwardPanamaCanal, BackwardsPanamaCanal, ratio modes — [LEAN Common/Global.cs](https://github.com/QuantConnect/Lean/blob/master/Common/Global.cs)
- QC's own research guide warns adjusted prices themselves are a look-ahead source (Wang et al. 2014: low-price portfolio built on adjusted prices "greatly outperformed" the raw-price one) and that using period-end rather than release date for fundamentals can inflate earnings-yield factor performance by 60%; recommends dynamic universes + point-in-time data, or "apply a reporting lag" — [Look-ahead Bias (QCDOC)](https://github.com/QuantConnect/Documentation/blob/master/03%20Writing%20Algorithms/01%20Key%20Concepts/10%20Research%20Guide/07%20Look-ahead%20Bias.html)
- Survivorship: current-constituent universes are "a form of look-ahead bias"; QC claims its Dataset Market datasets are vetted "to ensure they're free of survivorship bias" — [Survivorship Bias (QCDOC)](https://github.com/QuantConnect/Documentation/blob/master/03%20Writing%20Algorithms/01%20Key%20Concepts/10%20Research%20Guide/08%20Survivorship%20Bias.html)
- LEAN ships a `DownloaderDataProvider` project and `ToolBox` in-repo for fetching/converting data into this layout — [LEAN repo root](https://github.com/QuantConnect/Lean/tree/master)

**Zipline (zipline-reloaded)**
- Bundles: daily bars written with `BcolzDailyBarWriter` "to convert data into Zipline's internal bcolz format to later be read by a BcolzDailyBarReader"; splits/mergers/dividends written with `SQLiteAdjustmentWriter` — [ZL docs/source/bundles.rst](https://github.com/stefan-jansen/zipline-reloaded/blob/main/docs/source/bundles.rst)
- Zipline ≥2.4 uses `exchange_calendars` for trading calendars; 3.0 moved to pandas ≥2 / SQLAlchemy ≥2; 3.05 supports NumPy 2 — [ZL README](https://github.com/stefan-jansen/zipline-reloaded/blob/main/README.md)
- Third-party SQLite-backed bundles exist precisely because bcolz bundles are awkward to update incrementally and to join with fundamentals (e.g. "sharadar db bundle") — [alphaville76/sharadar_db_bundle](https://github.com/alphaville76/sharadar_db_bundle); [Medium: Sharadar DB bundle](https://mw96.medium.com/supercharge-zipline-with-full-sharadar-data-introducing-the-sharadar-db-bundle-c8d3dd101730)

**QuantRocket**
- Offers a prefabricated Sharadar Zipline bundle (stocks + ETFs) ingestible without first collecting a history database; Sharadar fundamentals in Pipeline can query previous fiscal periods — [QuantRocket Sharadar page](https://www.quantrocket.com/sharadar/) (search snippet)
- Zipline bundles can alternatively be ingested from QuantRocket history databases (adjustment handling discussed on forum) — [QuantRocket support forum](https://support.quantrocket.com/t/are-adjustments-handled-for-zipline-bundles-ingested-from-history-databases/1700); [Intro Zipline Part 1](https://www.quantrocket.com/codeload/zipline-intro/intro_zipline/Part1-Historical-Data-Collection.ipynb.html)
- Live market data can be saved to TimescaleDB — [quantrocket.com](https://www.quantrocket.com/) (search snippet)
- Moonshot "depends on QuantRocket for querying historical data in backtesting and for live trading"; CSV support is only a stated future hope — [moonshot README](https://github.com/quantrocket-llc/moonshot/blob/master/README.md)

**Deltix / QuantOffice**
- Data store is TimeBase, described as "high-performance, institutional-grade time-series database and messaging infrastructure", ~2-microsecond latency / 2M msgs/sec; TimeBase datetime supports nanosecond precision (`HdDateTime`) — [Deltix](https://www.deltixlab.com/); [QuantOffice Releases](https://kb.quantoffice.cloud/quant-office-releases) (search snippets)
- Connectivity to "100+ exchanges, brokers, ECNs" — [QuantOffice](https://www.deltixlab.com/quantoffice) (search snippet)

### Inferences
- LEAN's `securityType/market/resolution/ticker` layout maps almost exactly onto CCXT's (marketType / exchangeId / timeframe / market id) and its sparse-row convention suits illiquid crypto pairs. A CCXT simulator could adopt the layout nearly verbatim for OHLCV/trades/quotes, adding an `orderbook` tradeType.
- Crypto analogues of equity corporate actions: symbol/ticker renames and redenominations (map files), delistings (DelistingDate), token splits/redenominations (factor files), and perp funding (analogous to cash dividends in Raw mode). Survivorship bias in crypto = delisted pairs vanishing from `fetchMarkets`, so point-in-time market metadata snapshots are needed.
- Adjusted-price look-ahead is a documented trap; "Raw" should be the default for trading simulation, with adjustments only for indicators.

### Gaps
- Could not fetch exact map-file/factor-file CSV column schemas or QuantRocket history-DB (SQLite per-db) internals; blocked domains.
- Deltix TimeBase on-disk format details not found.

---

## Clock: event-driven vs vectorized, look-ahead prevention, scheduling, multi-asset sync

### Takeaway
LEAN is the reference design for a leak-proof clock: a single "Time Frontier" advances; each datum is emitted at its **EndTime** (bars at close = start of next period; daily bars at market close or midnight), all subscriptions with EndTime ≤ frontier are grouped into one `Slice`, missing bars are fill-forwarded, ticks are emitted immediately and never fill-forwarded. Backtrader/Zipline are bar-loop event engines where orders fill on the next bar unless you opt into "cheat" modes. Vectorized engines (VectorBT, Moonshot) are orders of magnitude faster but push look-ahead discipline onto the user (explicit `shift()`, close-only signals).

### Cited Findings
**LEAN**
- LEAN is "an event-based, streaming analysis system… presenting data ('events') to your algorithms in the order it arrives"; `OnData` receives a `Slice` = all data at a moment; "By only letting your algorithm see the present and past moments, we can prevent… look-ahead bias." — [Timeslices Introduction (QCDOC)](https://github.com/QuantConnect/Documentation/blob/master/03%20Writing%20Algorithms/01%20Key%20Concepts/05%20Time%20Modeling/02%20Timeslices/01%20Introduction.html)
- Time Frontier: multi-resolution / multi-timezone subscriptions are coordinated by each datum's `EndTime`; "For intraday bars, this is the beginning of the next period. For daily bars, it's market close or midnight, depending on your DailyPreciseEndTime setting… you can only access data from before this Time Frontier. The Time property of your algorithm is always equal to the Time Frontier." Daily bars of different time-zone datasets arrive at each asset's own market close. — [Time Frontier (QCDOC)](https://github.com/QuantConnect/Documentation/blob/master/03%20Writing%20Algorithms/01%20Key%20Concepts/05%20Time%20Modeling/02%20Timeslices/02%20Time%20Frontier.html)
- `bar.EndTime = bar.Time + bar.Period`; "Free online data providers commonly timestamp their bars to the start time of the bar and include the bar close price, making your research prone to look ahead bias." — [Start and End Time (QCDOC)](https://github.com/QuantConnect/Documentation/blob/master/03%20Writing%20Algorithms/01%20Key%20Concepts/05%20Time%20Modeling/01%20Periods/03%20Start%20and%20End%20Time.html)
- Daily bar is emitted at close, so an order placed on Friday's daily bar is sent "on Friday after the market close"; "When there are no ticks during a period, LEAN emits the previous bar… 'filling the data forward'", configurable per subscription — [Period Values (QCDOC)](https://github.com/QuantConnect/Documentation/blob/master/03%20Writing%20Algorithms/01%20Key%20Concepts/05%20Time%20Modeling/01%20Periods/04%20Period%20Values.html)
- Ticks: "Time and EndTime… are the same. LEAN emits ticks as soon as they arrive and doesn't fill them forward." — [Point Values (QCDOC)](https://github.com/QuantConnect/Documentation/blob/master/03%20Writing%20Algorithms/01%20Key%20Concepts/05%20Time%20Modeling/01%20Periods/06%20Point%20Values.html)
- `OnEndOfDay(symbol)` called per security per day — [Daily Periods (QCDOC)](https://github.com/QuantConnect/Documentation/blob/master/03%20Writing%20Algorithms/01%20Key%20Concepts/05%20Time%20Modeling/01%20Periods/05%20Daily%20Periods.html)
- Time zones are a dedicated docs section (Time Modeling → Time Zones); scheduled events have Date Rules, Time Rules and a documented "Execution Sequence" — [QCDOC Time Modeling dir](https://github.com/QuantConnect/Documentation/tree/master/03%20Writing%20Algorithms/01%20Key%20Concepts/05%20Time%20Modeling); [QCDOC Scheduled Events dir](https://github.com/QuantConnect/Documentation/tree/master/03%20Writing%20Algorithms/26%20Scheduled%20Events)
- Engine plugin `IRealtimeHandler` "generate[s] real-time events - such as the end of day events… For backtesting, this is mocked-up to work on simulated time." — [System Overview (QCDOC)](https://github.com/QuantConnect/Documentation/blob/master/06%20LEAN%20Engine/01%20Getting%20Started/02%20System%20Overview.html)

**Zipline**
- `schedule_function(func, date_rule=None, time_rule=None, half_days=True, calendar=None)`; default "every trading day", and without a time rule it executes "at the end of the first market minute of the day" — [ZL algorithm.py](https://github.com/stefan-jansen/zipline-reloaded/blob/main/src/zipline/algorithm.py)
- Trading calendars come from `exchange_calendars` — [ZL README](https://github.com/stefan-jansen/zipline-reloaded/blob/main/README.md)

**Backtrader**
- Cheat-On-Close (`coc`): "matching a Market order to the closing price of the bar in which the order was issued. This is actually *cheating*, because the bar is *closed* and any order should first be matched against the prices in the next bar" — [BT bbroker.py](https://github.com/mementum/backtrader/blob/master/backtrader/brokers/bbroker.py)
- Cheat-On-Open requires both `cerebro(cheat_on_open=True)` and broker `coo=True` (Cerebro sets it) — [BT cerebro.py](https://github.com/mementum/backtrader/blob/master/backtrader/cerebro.py)
- Default market execution uses the next bar's open (`exprice = popen`) unless coc, where `order.created.pclose` is used — [BT bbroker.py `_try_exec_market`](https://github.com/mementum/backtrader/blob/master/backtrader/brokers/bbroker.py)

**VectorBT (open-source)**
- `from_order_func` / `flex_simulate_nb` is presented as "Realistic simulation as it follows the event-driven approach - less risk of exposure to the look-ahead bias", with drawbacks: no broadcasting, needs NumPy+Numba skill — [VBT portfolio/base.py](https://github.com/polakowo/vectorbt/blob/master/vectorbt/portfolio/base.py)
- Stop handling caveat: "When the stop price is hit, the stop signal invalidates any other signal defined for this bar. Thus, make sure that your signaling logic happens at the very end of the bar (for example, by using the closing price), otherwise you may expose yourself to a look-ahead bias." — [VBT portfolio/base.py](https://github.com/polakowo/vectorbt/blob/master/vectorbt/portfolio/base.py)
- "We can execute only one signal per asset and bar… Stop signal cannot be processed at the same bar as the entry signal… we assume that any stop signal comes before any other signal in time… Otherwise, you're looking into the future." `StopExitPrice.Price` should only be used with `StopEntryPrice.Close` "Otherwise, there is no proof that the price comes after the stop price." — [VBT portfolio/enums.py](https://github.com/polakowo/vectorbt/blob/master/vectorbt/portfolio/enums.py)
- The `labels` module is explicitly "look-ahead indicators and label generators" (for ML targets) — [VBT labels/__init__.py](https://github.com/polakowo/vectorbt/blob/master/vectorbt/labels/__init__.py)

**QuantRocket Moonshot**
- Pandas vectorized; "No event-driven backtester can match Moonshot's speed"; lookahead avoided by explicit `positions = weights.shift()` ("we'll enter in the period after the signal") and `closes.pct_change() * positions.shift()`; eschews "hidden behaviors and complex, under-the-hood simulation rules" — [moonshot README](https://github.com/quantrocket-llc/moonshot/blob/master/README.md); [search snippet, same repo](https://github.com/quantrocket-llc/moonshot)

**Deltix QuantOffice**
- "Universal Strategy Runner" in QuantOffice Studio to develop/run/debug strategies; backtesting "a natural continuation", runs over tables of parameters, calendars, custom sessions, instrument lists — [QuantOffice Architecture](https://www.deltixlab.com/quantoffice/architecture) (search snippet)
- Nanosecond timestamps in TimeBase (`HdDateTime`) — [QuantOffice Releases](https://kb.quantoffice.cloud/quant-office-releases) (search snippet)

### Inferences
- A CCXT simulator should (1) store/label every bar by open time (CCXT convention) but **emit it at open+timeframe**, (2) run one global frontier across exchanges with a heap/merge of per-subscription streams, (3) fill-forward bars but not trades/order-book deltas, (4) make "cheat" modes explicit opt-ins with warnings (Backtrader naming is a good precedent).
- Crypto is 24/7 UTC so exchange-hours complexity is small, but per-venue maintenance windows / halts play the role of market hours.
- Offer both an event-driven engine (parity with live CCXT code) and a vectorized fast path for sweeps, with the vectorized path enforcing `shift(1)` semantics by construction.

### Gaps
- Zipline's exact order→fill timing (next bar vs. same-bar close) not verified from docs text (site blocked); widely described as next-bar, but uncited here.
- Deltix "identical code backtest/live" claim was only seen indirectly (simulator + Trading Console "as live"); no primary technical doc fetched.

---

## Fill, slippage, fee, buying-power and brokerage models (incl. intrabar / same-bar ambiguity)

### Takeaway
LEAN has the richest pluggable reality-model stack (per-security Fill/Slippage/Fee/BuyingPower/Settlement models, bundled by a BrokerageModel), but defaults are optimistic: full, immediate fills, zero slippage, and a stale-price guard. Zipline and LEAN share the same VolumeShare slippage model (2.5% of bar volume cap, 0.1 impact, quadratic). Backtrader adds volume "fillers" for partial fills. TradeStation/MultiCharts solve same-bar stop/target ambiguity with an O-H-L-C vs O-L-H-C heuristic, refined by drilling into lower-resolution data (Look-Inside-Bar / Bar Magnifier).

### Cited Findings
**LEAN**
- "Reality models… The default models assume you trade highly liquid assets. If you trade high volumes or on illiquid assets, you should create custom reality models" — some are security-level, some portfolio-level — [Reality Modeling intro (QCDOC)](https://github.com/QuantConnect/Documentation/blob/master/03%20Writing%20Algorithms/24%20Reality%20Modeling/01%20Key%20Concepts/01%20Introduction.html)
- Reality-model categories: Trade Fills, Slippage, Transaction Fees, Brokerages, Brokerage Message Handler, Buying Power, Settlement, Options Models, Risk Free Interest Rate, Dividend Yield, Margin Interest Rate, Margin Calls, Short Availability — [QCDOC Reality Modeling dir](https://github.com/QuantConnect/Documentation/tree/master/03%20Writing%20Algorithms/24%20Reality%20Modeling)
- FillModel has one overridable method per order type: MarketFill, LimitFill, LimitIfTouchedFill, StopMarketFill, StopLimitFill, TrailingStopFill, MarketOnOpenFill, MarketOnCloseFill, Combo*Fill; each returns an `OrderEvent`; set via `security.SetFillModel(...)` — [Fill Model Structure (QCDOC)](https://github.com/QuantConnect/Documentation/blob/master/03%20Writing%20Algorithms/24%20Reality%20Modeling/02%20Trade%20Fills/01%20Key%20Concepts/04%20Model%20Structure.html)
- DefaultBrokerageModel sets EquityFillModel (equities), FutureFillModel, FutureOptionFillModel, and ImmediateFillModel for all others (incl. crypto); also shipped: LatestPriceFillModel — [Fill Default Behavior (QCDOC)](https://github.com/QuantConnect/Documentation/blob/master/03%20Writing%20Algorithms/24%20Reality%20Modeling/02%20Trade%20Fills/01%20Key%20Concepts/03%20Default%20Behavior.html); [LEAN Common/Orders/Fills](https://github.com/QuantConnect/Lean/tree/master/Common/Orders/Fills)
- "In backtests, the pre-built fill models assume orders completely fill. To simulate partial fills in backtests, create a custom fill model." — [Partial Fills (QCDOC)](https://github.com/QuantConnect/Documentation/blob/master/03%20Writing%20Algorithms/24%20Reality%20Modeling/02%20Trade%20Fills/01%20Key%20Concepts/05%20Partial%20Fills.html)
- EquityFillModel: market buys fill at "best effort ask price plus slippage", sells at best-effort bid minus slippage, only in regular hours; limit buy fills if `low < limit` at `min(open, limit)`; stop-market buy triggers if `high >= stop` and fills at `max(open, stop) + slippage` (gap-through handled via open); trailing-stop update rules on high/low; MOO/MOC use official auction prices from ticks within one minute, else last trade, else best-effort quote — [Equity Model pages (QCDOC)](https://github.com/QuantConnect/Documentation/tree/master/03%20Writing%20Algorithms/24%20Reality%20Modeling/02%20Trade%20Fills/02%20Supported%20Models/01%20Equity%20Model)
- Stale-price guard in base FillModel: "do not fill on stale data"; "If the order would be filled on stale (fill-forward / already past) data, wait for fresh data instead of filling at a stale price when the latest data is more than one resolution bar behind the order submission" (`Parameters.StalePriceTimeSpan`), otherwise fills with a `FilledAtStalePrice` warning — [LEAN FillModel.cs](https://github.com/QuantConnect/Lean/blob/master/Common/Orders/Fills/FillModel.cs)
- Slippage models: NullSlippageModel (default of DefaultBrokerageModel), ConstantSlippageModel(percent), VolumeShareSlippageModel (volumeLimit default 0.025, priceImpact default 0.1; uses bid/ask size for QuoteBar data; "If there is no volume reported for [CFD, Forex, Crypto], the model returns zero slippage"), MarketImpactSlippageModel (Almgren et al. 2005-inspired: execution time, volatility, liquidity, order size) — [Slippage Supported Models (QCDOC)](https://github.com/QuantConnect/Documentation/tree/master/03%20Writing%20Algorithms/24%20Reality%20Modeling/03%20Slippage/02%20Supported%20Models)
- Fees: DefaultBrokerageModel uses ConstantFeeModel with no fees for Forex/CFD/Crypto and InteractiveBrokersFeeModel otherwise; venue fee models exist for Binance, BinanceFutures, BinanceCoinFutures, Bybit, BybitFutures, Coinbase, Kraken, Bitfinex, dYdX, etc. — [Fees Default Behavior (QCDOC)](https://github.com/QuantConnect/Documentation/blob/master/03%20Writing%20Algorithms/24%20Reality%20Modeling/04%20Transaction%20Fees/01%20Key%20Concepts/03%20Default%20Behavior.html); [LEAN Common/Orders/Fees](https://github.com/QuantConnect/Lean/tree/master/Common/Orders/Fees)
- Brokerage models "validate your orders before LEAN sends them to the real brokerage" and set supported order types, default markets and security-level models — [Brokerages intro (QCDOC)](https://github.com/QuantConnect/Documentation/blob/master/03%20Writing%20Algorithms/24%20Reality%20Modeling/05%20Brokerages/01%20Key%20Concepts/01%20Introduction.html)

**Zipline**
- `VolumeShareSlippage`: buys at `price * (1 + price_impact * volume_share**2)`, sells symmetric; `price` = bar close; volume_share capped at `volume_limit`; defaults volume_limit 0.025, price_impact 0.1 — [ZL slippage.py](https://github.com/stefan-jansen/zipline-reloaded/blob/main/src/zipline/finance/slippage.py)
- `FixedBasisPointsSlippage(basis_points=5.0, volume_limit=0.1)`: `price*(1±bps*0.0001)`, fill size capped at `historical_volume * volume_limit` — [ZL slippage.py](https://github.com/stefan-jansen/zipline-reloaded/blob/main/src/zipline/finance/slippage.py)
- Commission `PerShare` default $0.001/share, min trade cost $0 — [ZL commission.py](https://github.com/stefan-jansen/zipline-reloaded/blob/main/src/zipline/finance/commission.py)

**Backtrader**
- BackBroker params: `slip_perc`, `slip_fixed`, `slip_open` (slip on open-price fills), `slip_match` (cap slippage at bar high/low), `slip_limit`, `slip_out` (allow slippage outside the bar range), `coc`, `coo`, `filler`, `checksubmit` (cash check at submission), `shortcash`, `fundmode` — [BT bbroker.py](https://github.com/mementum/backtrader/blob/master/backtrader/brokers/bbroker.py)
- Fillers for partial fills: `FixedSize`, `FixedBarPerc` (percentage of bar volume), `BarPointPerc` (volume "distributed uniformly in the range high-low using minmov") — [BT fillers.py](https://github.com/mementum/backtrader/blob/master/backtrader/fillers.py)
- Limit execution: if limit ≥ open, buy fills at open (optionally slipped); elif limit ≥ low, fills at limit — [BT bbroker.py `_try_exec_limit`](https://github.com/mementum/backtrader/blob/master/backtrader/brokers/bbroker.py)

**VectorBT**
- Stop exit price options: StopLimit (stop price, no slippage; if gap-through, next-bar open), StopMarket (stop price with slippage), Price, Close — [VBT enums.py](https://github.com/polakowo/vectorbt/blob/master/vectorbt/portfolio/enums.py)

**MultiCharts / TradeStation**
- In backtesting, IOG "is limited by four calculations per bar: Open, High, Low, Close"; in real time with IOG, calculation is tick-by-tick — [MultiCharts Intrabar Assumptions](https://www.multicharts.com/trading-software/index.php?title=Intra-bar_Price_Movement_Assumptions) (search snippet); [IOG explained](https://www.multicharts.com/trading-software/index.php?title=Intra-Bar_Order_Generation_%28IOG%29_Explained)
- Heuristic: if open is closer to high → path O-H-L-C; if closer to low or exactly mid → O-L-H-C; example: SL 1340/PT 1360, bar O1355 H1360 L1340 C1345 → PT first; bar O1345 H1360 L1340 C1355 → SL first — [MultiCharts Intra-bar Price Movement Assumptions](https://www.multicharts.com/trading-software/index.php?title=Intra-bar_Price_Movement_Assumptions) (search snippet)
- Bar Magnifier "can be considered as a replay of the way a bar was formed", replay frequency by number of ticks or minutes; lets the engine determine "whether the profit target or the stop loss occurred first"; trade-off: finer resolution = more data/memory — [MultiCharts Bar Magnifier](https://www.multicharts.com/trading-software/index.php?title=Bar_Magnifier); [Price Movement Emulation](https://www.multicharts.com/trading-software/index.php?title=Price_Movement_Emulation_within_the_Bar_at_Backtest_and_Optimization) (search snippets)
- With BM + IOG the strategy is calculated as many times as there is detailed data (not just 4×) — [MultiCharts IOG & BM on non-standard charts](https://www.multicharts.com/trading-software/index.php?title=Intra-Bar_Order_Generation,_Bar_Magnifier_on_Non-Standard_Chart_Types) (search snippet)
- TradeStation Look-Inside-Bar Backtesting "enables the use of a sub-interval to identify price action occurring within each charted strategy bar"; no effect on real-time; not required to use IOG; with IOG + LIBB the strategy is evaluated four times per look-inside interval; users report "radically different" results depending on these settings — [TradeStation Strategy Properties – Backtesting](https://help.tradestation.com/09_01/tradestationhelp/st_testing/strategy_properties_strategies_chart_backtesting.htm); [TradeStation IOG](https://help.tradestation.com/10_00/eng/tradestationhelp/chart_analysis/intrabar_order_generation.htm); [Markplex Tutorial 147](https://markplex.com/free-tutorials/tutorial-147-look-inside-bar-back-testing-and-intra-bar-order-generation-and-calculation/) (search snippets)

**Deltix**
- Universal Strategy Runner uses "a variety of simulators, from coarse bar-based to substantially more precise L2 (MBP and MBO) simulators" — [QuantOffice](https://www.deltixlab.com/quantoffice) (search snippet)

### Inferences
- Design pattern to copy: per-market pluggable {FillModel, SlippageModel, FeeModel, MarginModel} bundled by an "ExchangeModel" per CCXT exchange id (fees/tick/lot/min-notional/order types already available from CCXT `markets` and `features`). LEAN's `BrokerageModel` ≈ CCXT's exchange `describe()` + `features`.
- Defaults matter: LEAN defaults zero fees and zero slippage for crypto and VolumeShare returns zero slippage when volume is missing — a CCXT premium simulator should default to taker fees from `market['taker']` and a conservative cost model.
- Same-bar ambiguity: offer three tiers — (1) pessimistic (stop first), (2) MultiCharts O-H-L-C/O-L-H-C heuristic, (3) "bar magnifier" by drilling down to 1m bars/trades; label result confidence accordingly.
- Partial fills and queue position are absent from LEAN/Zipline defaults; L2/MBO simulators (Deltix) are the professional bar for maker strategies.

### Gaps
- LEAN latency modelling: no explicit latency model found in docs tree scanned; LEAN fills are evaluated as data arrives (no configurable order latency found). Not verified.
- LEAN BuyingPowerModel detail pages were not extracted (only listed).

---

## Code parity backtest ↔ paper ↔ live; simulator as component vs server

### Takeaway
LEAN achieves parity by in-process component swap: the same `QCAlgorithm` runs under different "environments" in `config.json` that swap `IDataFeed`, `ITransactionHandler`, `IRealtimeHandler`, `IResultHandler`, `ISetupHandler` and `IBrokerage`; paper trading = live data feed + `PaperBrokerage` + the backtesting transaction handler (i.e., fill models on live data). Backtrader swaps "stores"; QuantRocket runs Zipline live via its blotter service and Moonshot live by re-running the backtest on fresh data to emit orders; Deltix runs strategies "as live" against an execution simulator in its Trading Console.

### Cited Findings
- LEAN engine modules are "configured in config.json as set 'environments'": IResultHandler, IDataFeed ("For backtesting this sources files from the disk, for live trading, it connects to a stream"), ITransactionHandler ("either using the fill models provided by the algorithm or with an actual brokerage"), IRealtimeHandler (mocked on simulated time in backtests), ISetupHandler — [System Overview (QCDOC)](https://github.com/QuantConnect/Documentation/blob/master/06%20LEAN%20Engine/01%20Getting%20Started/02%20System%20Overview.html)
- `config.json` environments include "live-paper", "backtesting", "live-interactive"; the live-paper env sets `"live-mode": true`, `"live-mode-brokerage": "PaperBrokerage"`, with comment "the paper brokerage requires the BacktestingTransactionHandler" — [LEAN Launcher/config.json](https://github.com/QuantConnect/Lean/blob/master/Launcher/config.json)
- `BacktestingBrokerage : Brokerage` "Represents a brokerage to be used during backtesting. This is intended to be only be used with the BacktestingTransactionHandler"; `PaperBrokerage` in Brokerages/Paper — [BacktestingBrokerage.cs](https://github.com/QuantConnect/Lean/blob/master/Brokerages/Backtesting/BacktestingBrokerage.cs); [PaperBrokerage.cs](https://github.com/QuantConnect/Lean/blob/master/Brokerages/Paper/PaperBrokerage.cs)
- LEAN has a `BaseWebsocketsBrokerage`, `DefaultOrderBook`, `BrokerageMultiWebSocketSubscriptionManager` shared plumbing for live brokerages — [LEAN Brokerages dir](https://github.com/QuantConnect/Lean/tree/master/Brokerages)
- Brokerage models validate orders so they are not rejected live — [Brokerages intro (QCDOC)](https://github.com/QuantConnect/Documentation/blob/master/03%20Writing%20Algorithms/24%20Reality%20Modeling/05%20Brokerages/01%20Key%20Concepts/01%20Introduction.html)
- Backtrader stores shipped: `ibstore` (Interactive Brokers), `oandastore`, `vcstore` (VisualChart) — [BT stores dir](https://github.com/mementum/backtrader/tree/master/backtrader/stores)
- QuantRocket Zipline live trading supports dry runs that write orders to file instead of the blotter — [Zipline Live Trading with QuantRocket](https://www.quantrocket.com/zipline/) (search snippet)
- Moonshot live = "running a backtest on up-to-date historical data and generating a batch of orders based on the latest signals" — [moonshot README](https://github.com/quantrocket-llc/moonshot/blob/master/README.md)
- Deltix: "go live on the execution simulator, and run 'as live' on simulated trading accounts"; Trading Console runs strategies "in live or live simulation trading modes" — [Deltix Trading Console](https://www.deltixlab.com/quantoffice/architecture/trading-console); [QuantOffice](https://www.deltixlab.com/quantoffice) (search snippets)

### Inferences
- For CCXT, the LEAN pattern translates to: a `SimulatedExchange` class that implements the same unified surface (`createOrder`, `fetchBalance`, `watchOrders`, `watchTicker` …) backed by a replay data feed + fill models, so user code switches by constructor/option — the in-process component-swap approach, not a server. "Paper" mode = live CCXT market data (`watch*`) + simulated matching, exactly LEAN's live-paper wiring.
- Moonshot's batch "re-run backtest to get orders" is a simpler parity mode suited to daily rebalancers.

### Gaps
- Could not verify zipline-live / zipline-trader maintenance status (sites blocked); Backtrader's IB/Oanda stores are known to target old APIs but not confirmed here.

---

## Optimization, walk-forward, overfitting safeguards, reproducibility

### Takeaway
LEAN ships a grid and "Euler" (coarse-to-fine step) optimizer plus docs framing walk-forward as in-algorithm periodic re-optimization; MultiCharts/TradeStation have dedicated Walk-Forward Optimizers (rolling and anchored); VectorBT PRO is the most advanced on statistical safeguards (purged walk-forward CV and combinatorial purged CV with embargo, per López de Prado), plus chunked parameter sweeps. LEAN also reports a Probabilistic Sharpe Ratio.

### Cited Findings
- LEAN optimizer strategies: `GridSearchOptimizationStrategy`, `EulerSearchOptimizationStrategy`, `StepBaseOptimizationStrategy`; `LeanOptimizer` is "Base Lean optimizer class in charge of handling an optimization job packet" — [LEAN Optimizer](https://github.com/QuantConnect/Lean/tree/master/Optimizer); [LeanOptimizer.cs](https://github.com/QuantConnect/Lean/blob/master/Optimizer/LeanOptimizer.cs)
- QC warns that re-running a backtest over the optimized period with the optimal params is look-ahead; "optimize on older historical data and test… on recent historical data. Alternatively, apply walk forward optimization" — [Optimization Look-Ahead Bias (QCDOC)](https://github.com/QuantConnect/Documentation/blob/master/03%20Writing%20Algorithms/30%20Optimization/01%20Parameters/05%20Look-Ahead%20Bias.html); overfitting page: [Overfitting (QCDOC)](https://github.com/QuantConnect/Documentation/blob/master/03%20Writing%20Algorithms/30%20Optimization/01%20Parameters/04%20Overfitting.html)
- LEAN WFO = "periodically adjusting the logic or parameters of a strategy to optimize some objective function over a trailing window of time" (implemented inside the algorithm with scheduled events) — [WFO Introduction (QCDOC)](https://github.com/QuantConnect/Documentation/blob/master/03%20Writing%20Algorithms/30%20Optimization/02%20Walk%20Forward%20Optimization/01%20Introduction.html)
- MultiCharts WFO: anchored mode keeps IS start fixed and lengthens; rolling mode keeps IS duration fixed; produces a Walk-Forward Optimization Report — [MultiCharts Walk Forward Optimization](https://www.multicharts.com/trading-software/index.php?title=Walk_Forward_Optimization); [MultiCharts WFO feature](https://www.multicharts.com/features/walk-forward/) (search snippets)
- TradeStation has a separate Walk-Forward Optimizer (anchored segments described) — [TradeStation WFO](https://help.tradestation.com/09_05/eng/tswfo/topics/about_wfo.htm) (search snippet)
- VectorBT PRO: rolling, expanding, walk-forward, purged, combinatorial splits; "walk-forward cross-validation (CV) with purging, as well as combinatorial CV with purging and embargoing, based on… Advances in Financial Machine Learning"; parameters pre-generated and chunked (e.g. 1000 combos per chunk) to save RAM; "parameterize, chunk, cache, and distribute work across supported execution engines" — [VectorBT PRO Optimization](https://vectorbt.pro/features/optimization/); [vectorbt.pro](https://vectorbt.pro/) (search snippets)
- Open-source vectorbt also has splitters (incl. expanding walk-forward, sklearn splitters) — [vectorbt splitters API](https://vectorbt.dev/api/generic/splitters/) (search snippet)
- LEAN statistics include `ProbabilisticSharpeRatio` computed vs benchmark Sharpe — [LEAN PortfolioStatistics.cs](https://github.com/QuantConnect/Lean/blob/master/Common/Statistics/PortfolioStatistics.cs)

### Inferences
- A CCXT premium module should ship: deterministic seeds + data-snapshot hashes (reproducibility), grid/random/coarse-to-fine search, rolling/anchored WFA with an OOS report, and PSR/deflated-Sharpe style multiple-testing penalties. Purged/embargoed CV is the differentiator VectorBT PRO sells.

### Gaps
- No primary source found on LEAN reproducibility guarantees (e.g., deterministic seeds) or VectorBT PRO pricing/licensing specifics.

---

## Reporting: metrics and formats

### Takeaway
LEAN has a built-in HTML report generator with a standard set of elements (CAGR, Sharpe, Sortino, PSR, information ratio, drawdowns, rolling beta/Sharpe, capacity, turnover, crisis-event overlays). Python ecosystems standardize on pyfolio/empyrical tear sheets (now in maintained "-reloaded" forks) and QuantStats.

### Cited Findings
- LEAN Report elements: AnnualReturns, AssetAllocation, CAGR, CumulativeReturns, DailyReturns, Drawdown, EstimatedCapacity, Exposure, InformationRatio, LeverageUtilization, MaxDrawdownRecovery, MaxDrawdown, MonthlyReturns, PSR, Parameters, ReturnsPerTrade, RollingPortfolioBeta, RollingSharpe, RuntimeDays, SharpeRatio, SortinoRatio, TradesPerDay, Turnover; plus `Crisis`/`CrisisEvent` overlays and an HTML `template.html` — [LEAN Report/ReportElements](https://github.com/QuantConnect/Lean/tree/master/Report/ReportElements); [LEAN Report](https://github.com/QuantConnect/Lean/tree/master/Report)
- LEAN docs include a Statistics → Capacity section — [QCDOC LEAN Engine/Statistics](https://github.com/QuantConnect/Documentation/tree/master/06%20LEAN%20Engine/11%20Statistics)
- Zipline documents risk & performance metrics in `risk-and-perf-metrics.rst` — [ZL docs](https://github.com/stefan-jansen/zipline-reloaded/tree/main/docs/source)
- QuantStats positioned as modern alternative to pyfolio with tear sheets; both consume returns series; backtrader has a PyFolio analyzer — [TradingBrokers pyfolio alternatives](https://tradingbrokers.com/pyfolio-alternatives/); [Backtrader PyFolio analyzer](https://www.backtrader.com/docu/analyzers/pyfolio/) (search snippets; secondary sources)
- Deltix Backtest Explorer: statistics/performance metrics at portfolio and instrument levels — [QuantOffice Backtest Explorer](https://www.deltixlab.com/quantoffice/architecture/backtest-explorer) (search snippet)

### Inferences
- Emit a returns/equity/trades/orders record set in a neutral format (Parquet/JSON) so users can feed QuantStats/pyfolio; add crypto-specific metrics (funding paid, fee share of PnL, liquidation distance, capacity vs. book depth).

### Gaps
- Could not verify current maintenance state of pyfolio-reloaded/empyrical-reloaded or quantstats releases in 2026 (primary pages not fetched).

---

## Known weaknesses, criticisms, maintenance status (as of Sept 2026)

### Takeaway
LEAN is actively developed (commits through 2026-09-25) but its defaults are optimistic (full fills, no slippage/fees for crypto). Backtrader is effectively abandoned (last commit April 2023; forks exist). zipline-reloaded is maintained but slow-moving (last commit Nov 2025) with a bcolz storage legacy. Open-source vectorbt is still maintained (v1.1.1, Sept 2026) while advanced features moved to paid PRO. Vectorized engines and bar-only intrabar heuristics carry structural look-ahead/ambiguity risks.

### Cited Findings
- LEAN repo last commit 2026-09-25; QC Documentation 2026-09-25 — [LEAN](https://github.com/QuantConnect/Lean); [QC Documentation](https://github.com/QuantConnect/Documentation) (git log of clones)
- Backtrader master last commit 2023-04-19 — [mementum/backtrader](https://github.com/mementum/backtrader); "The original backtrader is unmaintained, though there is a maintained fork available through LucidInvestor" — [backtrader-lucidinvestor on PyPI](https://pypi.org/project/backtrader-lucidinvestor) (search snippet)
- zipline-reloaded last commit 2025-11-13 (dependabot bump); supports Python ≥3.9, NumPy 2 — [zipline-reloaded](https://github.com/stefan-jansen/zipline-reloaded)
- vectorbt v1.1.1, last commit 2026-09-26 — [polakowo/vectorbt](https://github.com/polakowo/vectorbt/blob/master/vectorbt/_version.py)
- LEAN: full fills by default; zero slippage default; crypto zero fees by default; VolumeShare yields zero slippage when crypto volume missing — [Partial Fills (QCDOC)](https://github.com/QuantConnect/Documentation/blob/master/03%20Writing%20Algorithms/24%20Reality%20Modeling/02%20Trade%20Fills/01%20Key%20Concepts/05%20Partial%20Fills.html); [Null Model (QCDOC)](https://github.com/QuantConnect/Documentation/blob/master/03%20Writing%20Algorithms/24%20Reality%20Modeling/03%20Slippage/02%20Supported%20Models/02%20Null%20Model.html); [Fees Default (QCDOC)](https://github.com/QuantConnect/Documentation/blob/master/03%20Writing%20Algorithms/24%20Reality%20Modeling/04%20Transaction%20Fees/01%20Key%20Concepts/03%20Default%20Behavior.html)
- Backtrader's own docs call `coc` "cheating" — [BT bbroker.py](https://github.com/mementum/backtrader/blob/master/backtrader/brokers/bbroker.py)
- VectorBT: one signal per asset per bar; stop-vs-signal ordering assumption can look into the future — [VBT enums.py](https://github.com/polakowo/vectorbt/blob/master/vectorbt/portfolio/enums.py)
- Moonshot: no documented commission/slippage in README; locked to QuantRocket data — [moonshot README](https://github.com/quantrocket-llc/moonshot/blob/master/README.md)
- TradeStation/MultiCharts: results can change "radically" with LIBB/IOG settings; 4-point OHLC heuristic cannot infer true path — [Markplex Tutorial 147](https://markplex.com/free-tutorials/tutorial-147-look-inside-bar-back-testing-and-intra-bar-order-generation-and-calculation/); [MultiCharts assumptions](https://www.multicharts.com/trading-software/index.php?title=Intra-bar_Price_Movement_Assumptions) (search snippets)
- LEAN's own fee/model set still includes defunct venues (FTXFeeModel, FTXUSFeeModel, GDAXFeeModel) — [LEAN Common/Orders/Fees](https://github.com/QuantConnect/Lean/tree/master/Common/Orders/Fees)

### Inferences
- A CCXT simulator can differentiate by: realistic defaults (fees from markets, spread from quotes, depth-aware slippage from order-book snapshots), explicit ambiguity flags on same-bar events, and exchange-accurate order validation reused from CCXT `features`/precision/limits.
- Keeping venue models data-driven (from CCXT metadata) avoids LEAN's problem of hand-written per-venue model classes going stale.

### Gaps
- Could not retrieve independent third-party critiques (forums, papers) of LEAN fill realism or Deltix; sites blocked and search time limited.
- QuantRocket 2026 pricing/licensing and whether Moonshot is still actively developed not verified.
