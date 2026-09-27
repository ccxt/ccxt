# Out-of-process trading simulators vs in-process simulated exchanges vs explicit time control (for a CCXT simulation module)

Research method note: several primary doc domains were blocked by the network egress proxy from this environment (docs.alpaca.markets, docs.tardis.dev, www.interactivebrokers.com). For those, findings rely on search-engine result snippets pointing at those primary URLs, plus the Alpaca docs mirror on GitHub (fetched in full) and the tardis-machine GitHub README (fetched). Where a claim comes only from a snippet, the primary URL is still cited but treat wording as paraphrase. Local facts about CCXT itself were verified by reading the repo.

## Q1. Paper trading servers (IBKR paper, Alpaca paper, crypto testnets/demo) — how fills work and how they diverge from live

### Takeaway
"Same API, different base URL" paper servers are the most common form of architecture (A) in industry, but every one of them simulates fills crudely (top-of-book or NBBO, no queue position, no market impact) and crypto testnets additionally run on independent, non-production order books with unrealistic prices; they run strictly in real (wall-clock) time and cannot replay history or be sped up.

### Cited Findings
**Alpaca paper trading (primary docs mirror)**
- Paper uses the same API as live, switched by base URL: `APCA_API_BASE_URL=https://paper-api.alpaca.markets` — [Alpaca docs (GitHub mirror)](https://github.com/alpacahq/alpaca-docs/blob/master/content/trading/paper-trading.md)
- Fill rule: "Orders are filled only when they become marketable ... a non-marketable buy limit order will not be filled until its limit price is equal to or greater than the best ask price" — [Alpaca docs mirror](https://github.com/alpacahq/alpaca-docs/blob/master/content/trading/paper-trading.md)
- Partial fills are synthetic: "When orders are eligible to be filled, they will receive partial fills for a random size 10% of the time"; remaining quantity is re-evaluated if still marketable — [Alpaca docs mirror](https://github.com/alpacahq/alpaca-docs/blob/master/content/trading/paper-trading.md); [Alpaca paper trading docs](https://docs.alpaca.markets/us/docs/paper-trading)
- Not simulated: market impact, information leakage, slippage due to latency, order queue position, price improvement, regulatory fees, dividends; order quantity "is not checked against the NBBO quantities" (so you can be filled far beyond displayed liquidity); PDT rules are simulated; default balance $100,000 — [Alpaca docs mirror](https://github.com/alpacahq/alpaca-docs/blob/master/content/trading/paper-trading.md)
- Third-party commentary stresses that the 10% partial-fill figure is a simulation parameter, not a realistic partial-fill rate — [TradersPost blog](https://blog.traderspost.io/article/alpaca-paper-trading)
- Community reports of paper-vs-live slippage divergence — [Alpaca forum: Slippage paper vs real](https://forum.alpaca.markets/t/slippage-paper-trading-vs-real-trading/2801)

**Interactive Brokers paper account** (snippets; primary pages blocked)
- Fills are simulated from top of book, no deep-book access; you are generally filled at the displayed price with no market impact — [IBKR Campus: Paper vs Live](https://www.interactivebrokers.com/campus/trading-lessons/paper-trading-vs-live-trading-whats-the-difference/); [IBKR guides: About Paper Trading Accounts](https://www.ibkrguides.com/clientportal/aboutpapertradingaccounts.htm)
- Some order types unsupported (VWAP, Auction, RFQ, Pegged to Market), limited combos; stops and other complex orders are "always simulated", which may behave differently from production; US option penny fills not supported — [IBKR guides: About Paper Trading Accounts](https://www.ibkrguides.com/clientportal/aboutpapertradingaccounts.htm)
- Practitioner discussion of paper vs live fill divergence — [Elite Trader thread](https://www.elitetrader.com/et/threads/fills-in-paper-vs-live-trading.377373/)

**Crypto testnets / demo**
- Binance Spot testnet market data and order books are independent of and not synchronized with production; the testnet is reset roughly monthly without prior notice, wiping open and executed orders and refreshing balances — [Binance Spot testnet General Info](https://developers.binance.com/docs/binance-spot-api-docs/testnet/general-info); [Binance support FAQ](https://www.binance.com/en/support/faq/how-to-test-my-functions-on-binance-testnet-ab78f9a1b8824cf0a106b4229c76496d)
- Binance testnet candlestick prices "may not be accurate and differ from the actual prices" — [HedgeWithCrypto demo trading overview](https://www.hedgewithcrypto.com/bitcoin-demo-trading/) (secondary source)
- Distinction between "demo" (inside main platform, real prices) and "testnet" (separate platform); OKX demo characterized as using real prices, unlike Binance/Bybit testnets — [HedgeWithCrypto](https://www.hedgewithcrypto.com/bitcoin-demo-trading/) (secondary; not verified against OKX primary docs)
- Bybit maintains a Demo Trading FAQ (demo inside main platform) — [Bybit Help Center: FAQ Demo Trading](https://www.bybit.com/en/help-center/article/FAQ-Demo-Trading)
- Demo environments don't simulate liquidity crises/book thinning during crashes — [HedgeWithCrypto](https://www.hedgewithcrypto.com/bitcoin-demo-trading/)
- CCXT already treats testnet/demo as a URL swap: `setSandboxMode(true)` swaps `urls.api` with `urls.test`; some exchanges implement demo via header/account-type switch — repo `CLAUDE.md` §5.6 (local, `/home/user/ccxt/CLAUDE.md`)

### Inferences
- Paper servers validate *plumbing* (auth, request shapes, order lifecycle, error codes) better than *strategy economics*. For CCXT this is already covered by sandbox mode; a new simulation module should not try to replicate paper servers, but could adopt their explicit documented "fill rule" list as a spec template (what's simulated / what isn't).
- None of these paper servers support historical time: they are always "now". They are useless for backtesting and cannot be accelerated.
- Alpaca's randomized partial fills show a design trade-off: random partial fills exercise client code paths but reduce determinism unless seeded.

### Gaps
- Could not fetch Deribit test (test.deribit.com) or BitMEX testnet docs to cite their liquidity model; known anecdotally to have thin, bot-driven books but no primary source retrieved.
- OKX demo "real prices" claim is from a secondary source only.

## Q2. Exchange certification/simulation environments, FIX simulators, ABIDES, HFT emulators — what they emulate and how time is handled

### Takeaway
Exchange-run test environments (CME Certification/New Release) are real-time, production-shaped protocol endpoints for certification, not market-realistic simulators; vendor FIX/exchange simulators (Esprow) emulate matching engines, trading phases and latency and can replay logs "at any speed"; ABIDES is the canonical research discrete-event simulator with a kernel-owned virtual nanosecond clock and a latency model.

### Cited Findings
**CME Group**
- CME offers two customer test environments: Certification (matches production; tests existing products/functionality) and New Release (new products/functionality prior to production) — [CME Client Systems Wiki: Client Application Testing and Certification](https://cmegroupclientsite.atlassian.net/wiki/spaces/EPICSANDBOX/pages/457315236/Client+Application+Testing+and+Certification)
- Certification now supports testing trading applications only, while New Release supports end-to-end testing from Globex through CME Clearing — [CME ClearPort notice 2026-05-14](https://www.cmegroup.com/notices/clearport/2026/05/20260514.html)
- New Release has "significantly lower data rates than production" — [CME Client Systems Wiki (SBE market data pages)](https://cmegroupclientsite.atlassian.net/wiki/spaces/EPICSANDBOX/pages/457319776)
- "TCP historical replay" in CME market data is a message-recovery mechanism (by sequence number), not a market replay simulator — [CME Client Systems Wiki](https://cmegroupclientsite.atlassian.net/wiki/spaces/EPICSANDBOX/pages/457319776)
- Certification via AutoCert+ is required for client systems (e.g., for Pub/Sub market data) — [CME Client Systems Wiki](https://cmegroupclientsite.atlassian.net/wiki/spaces/EPICSANDBOX/pages/457319776); [CME Globex development requirements](https://www.cmegroup.com/globex/develop-to-cme-globex/cme-globex-development-requirements-assistance.html)

**Esprow (commercial exchange/FIX simulators)**
- ETP Markets "engineered to simulate any exchange platform, including trading protocols, matching engine, trading phases" — [Esprow ETP Markets](https://www.esprow.com/products/exchange-simulation/etp-markets-mifid2.php)
- ETP GEMS: configurable matching strategies (price-time, pro-rata, equilibrium price), trading phases (pre-open, open, continuous, close), loading specific order book configurations, and injecting latency in exchange components to simulate busy markets — [Esprow ETP GEMS](https://www.esprow.com/products/exchange-simulation/etp-gems.php)
- FIX log replay "at any speed" with tag replacement and message filtering — [Esprow FIX Log Replay Manager](https://www.esprow.com/products/fix-testing/fix-log-replay-manager.php)
- FIX Exchange Simulator: "mini FIX exchange running on your PC" for ad-hoc interactive testing — [Esprow FIX Exchange Simulator](https://www.esprow.com/products/fix-testing/fix-exchange-simulator.php)
- Binary (native protocol) exchange simulation for onboarding/certification — [Esprow Binary Exchange Simulation](https://www.esprow.com/products/onboarding-and-certification/binary-exchange-simulation.php)

**ABIDES / ABIDES-Gym (JPMorgan AI Research)**
- ABIDES is an open-source agent-based discrete event simulator for AI trading strategies and market microstructure — [ABIDES paper arXiv:1904.12066](https://arxiv.org/pdf/1904.12066); [abides-sim/abides](https://github.com/abides-sim/abides)
- Kernel = priority message queue; inputs are start time, end time, agent list, latency model and PRNG seed; models nanosecond time, pairwise network latency, agent computation delay, deterministic per-agent randomness; agents interact with the exchange only via messages patterned on NASDAQ ITCH/OUCH — [ABIDES paper](https://arxiv.org/pdf/1904.12066); [ABIDES-Gym arXiv:2110.14771](https://arxiv.org/pdf/2110.14771)
- JPMC maintains a public fork — [jpmorganchase/abides-jpmc-public](https://github.com/jpmorganchase/abides-jpmc-public)

### Inferences
- Time handling splits cleanly: exchange-run environments and paper servers = wall-clock real time; vendor simulators = real time plus log replay at configurable speed; research simulators (ABIDES) = pure virtual time advanced by the event queue (as fast as computation allows).
- ABIDES' "message-only interaction with a latency model" is exactly what an in-process CCXT simulator (B) with an event queue (C) would look like; its seed-based determinism is a good template.
- Esprow's feature list (matching strategies, trading phases, loaded book states, latency injection) is a checklist for what "scheduled/injected events" should cover.

### Gaps
- No primary sources retrieved for Nasdaq/ICE test environments, QuickFIX-based simulators or proprietary HFT exchange emulators (these are rarely publicly documented).
- Could not confirm whether CME offers a public "market replay" simulation product distinct from certification environments.

## Q3. Replay servers impersonating exchange APIs (tardis-machine, record/replay mocks, CCXT fixtures) and the "what time is it" problem

### Takeaway
tardis-machine is the closest real system to architecture (A) for crypto: it replays exchange-native WebSocket data from a past time so existing WS clients work by changing the URL, but it is market-data only (no order execution), so it doesn't answer "what is my account state at time T". CCXT's own static request/response fixtures are an in-process record/replay mock at the `fetch` layer.

### Cited Findings
- tardis-machine: open-source, locally runnable server with caching serving tick-level historical and real-time crypto market data over HTTP and WebSocket; npm and Docker — [tardis-machine GitHub](https://github.com/tardis-dev/tardis-machine); [Tardis Machine docs](https://docs.tardis.dev/api/tardis-machine)
- Endpoints `/replay`, `/ws-replay` (exchange-native format, same subscribe logic as the real exchange) and `/replay-normalized`, `/ws-replay-normalized` (unified format across exchanges); "synchronized multi-exchange replay" for normalized data — [tardis-machine README](https://github.com/tardis-dev/tardis-machine)
- "As long as you already use existing WebSocket client that connects to and consumes real-time exchange market data feed, in most cases you can use it to connect to /ws-replay API as well just by changing URL endpoint" — [Tardis Machine docs](https://docs.tardis.dev/api/tardis-machine) (snippet)
- The README contains no statements about order execution; it is data-only — [tardis-machine README](https://github.com/tardis-dev/tardis-machine)
- Tardis Machine v3 announced unified APIs for real-time and historical data — [Tardis substack](https://tardis.substack.com/p/tardis-machine-server-v3-unified)
- CCXT static tests replace the transport: `exchange.fetch = async (url, method, headers, body) => mockResponse` in `ts/src/test/tests.helpers.ts` (lines ~194–204, local repo) with fixtures under `ts/src/test/static/{request,response,ws,markets,currencies}` (local repo); WS static tests replay canned frames into `handleMessage` via a mocked transport — `/home/user/ccxt/CLAUDE.md` §5.1
- CCXT's clock is the host wall clock: `const now = Date.now; const milliseconds = now;` in `ts/src/base/functions/time.ts` (local), used across `Exchange.ts` for nonces, rate limiting (`lastRestRequestTimestamp = this.milliseconds()`), and cache timestamps (local, `ts/src/base/Exchange.ts`)

### Inferences
- "What time is it" in a replay server: with tardis-style replay, time is implicit in message timestamps; the client's own `Date.now()` stays at real time. Any client logic using wall-clock (CCXT nonces, rate-limit throttler, `since` defaults, OHLCV "current candle" logic, signature timestamps with recvWindow) will be inconsistent with replayed data unless the client's clock is injected. For CCXT this means architecture (A) *also* needs (C): an overridable `milliseconds()` hook in the base class, otherwise a historical server cannot be used coherently.
- A server that emulates each exchange's native REST/WS API for historical time would require re-implementing 100+ exchange-specific request/response/error/sign schemes server-side — i.e., a second copy of CCXT's per-exchange knowledge in reverse. A server exposing one unified CCXT-shaped API is far cheaper but then CCXT clients need a dedicated "sim" exchange class anyway, which erodes the "change only the URL" advantage.
- Out-of-process costs: per-call HTTP/WS round trips (latency dominates event-level backtests), pacing (server must either stream at wall-clock rate, stream as fast as possible and risk the client lagging, or run a lockstep request/ack protocol), and nondeterministic interleaving of network messages vs client timers. In-process (B) avoids all three and naturally works in all transpiled languages if written in `ts/src/`.
- Record/replay (VCR, CCXT fixtures) gives determinism but no reactivity: orders can't change the future market state; good for regression tests, not simulation.

### Gaps
- Could not retrieve tardis-machine docs on replay pacing (whether WS replay streams as fast as possible or honors timestamps) due to egress block; README fetch did not mention it.
- No public "unified-API simulated exchange server" for CCXT found in this pass; no primary source on clock-header or lockstep protocols in commercial replay servers.
- No WireMock/VCR-specific sources retrieved.

## Q4. Virtual clock / time-control techniques and how trading frameworks expose them (step/advance/seek, events, rewind)

### Takeaway
Across ecosystems the proven pattern is clock injection plus an "advance" primitive that fires due timers deterministically (Jest, .NET FakeTimeProvider, Go synctest); forward-only advancing is the norm (FakeTimeProvider explicitly never goes backward) and "rewind" is implemented everywhere as restore-snapshot-then-re-simulate (Antithesis, TigerBeetle seeds), not by running the clock backwards. Trading frameworks (NautilusTrader, LEAN) pair a test clock with a data "time frontier" to prevent look-ahead.

### Cited Findings
**Deterministic simulation testing**
- TigerBeetle VOPR simulates the whole cluster including clock, disk and network; deterministic given seed + Git commit, so failures reproduce exactly; time can be sped up arbitrarily ("one minute of VOPR time equivalent to days of real-world testing") — [TigerBeetle VOPR docs](https://github.com/tigerbeetle/tigerbeetle/blob/main/docs/internals/vopr.md)
- TigerBeetle's DST was inspired by FoundationDB (single-threaded deterministic control plane) — [TigerBeetle VOPR docs](https://github.com/tigerbeetle/tigerbeetle/blob/main/docs/internals/vopr.md); [TigerBeetle blog: protocol-aware DST (2026-08-20)](https://tigerbeetle.com/blog/2026-08-20-protocol-aware-dst/)
- Jepsen ran its TigerBeetle suite inside Antithesis to use deterministic simulation, fault injection and time-travel debugging — [Jepsen: TigerBeetle 0.16.11](https://jepsen.io/analyses/tigerbeetle-0.16.11)
- Antithesis is a deterministic hypervisor; time-travel works by snapshotting whole-VM state and replaying/branching from checkpoints rather than from the start — [Antithesis blog: deterministic hypervisor](https://antithesis.com/blog/deterministic_hypervisor/); [Pragmatic Engineer on Antithesis](https://newsletter.pragmaticengineer.com/p/antithesis)
- Curated DST resource list — [awesome-deterministic-simulation-testing](https://github.com/ivanyu/awesome-deterministic-simulation-testing)

**Fake timers / clock injection**
- Jest: `jest.advanceTimersByTime(ms)` executes all macro-tasks queued via `setTimeout`/`setInterval` within that window — [Jest Timer Mocks](https://jestjs.io/docs/timer-mocks)
- .NET: `Microsoft.Extensions.TimeProvider.Testing` `FakeTimeProvider`; `Advance()` and `SetUtcNow()` move time forward (never backwards) and fire pending timers whose due time falls in the advanced range — [Microsoft Learn: Testing with FakeTimeProvider](https://learn.microsoft.com/en-us/dotnet/core/extensions/timeprovider-testing); a GitHub issue documents surprising Advance/SetUtcNow semantics — [dotnet/extensions#3995](https://github.com/dotnet/extensions/issues/3995)
- Go `testing/synctest`: tests run in a "bubble" with a fake clock starting 2000-01-01 UTC; time advances only when every goroutine in the bubble is "durably blocked"; became stable in Go 1.25 — [pkg.go.dev testing/synctest](https://pkg.go.dev/testing/synctest); [Go blog: Testing Time](https://go.dev/blog/testing-time)
- Mutex waits are not durably blocking, so the fake clock won't advance while a goroutine waits on a mutex — [Internals for Interns: Inside Go's synctest](https://internals-for-interns.com/posts/inside-go-synctest)

**Trading frameworks**
- NautilusTrader modes: Backtest (historical data + simulated execution), Sandbox (real-time data + simulated execution), Live; all share one `NautilusKernel` owning cache, portfolio, engines, clock and messaging — [NautilusTrader Architecture](https://nautilustrader.io/docs/latest/concepts/architecture/)
- Backtest execution client uses a `TestClock`; nanosecond clock with consistent timers/alerts across backtest and live; same strategy code live and backtest — [NautilusTrader Backtest API](https://docs.nautilustrader.io/api_reference/backtest.html); [NautilusTrader Backtesting](https://nautilustrader.io/docs/latest/concepts/backtesting/)
- Ongoing work to add inbound latency modeling to the sandbox execution client (parity concern) — [nautilus_trader PR #4865](https://github.com/nautechsystems/nautilus_trader/pull/4865)
- QuantConnect LEAN: event-based streaming; a `Slice` is all data at one moment; algorithms only see data up to the "Time Frontier", which prevents look-ahead bias — [QuantConnect Timeslices](https://www.quantconnect.com/docs/v2/writing-algorithms/key-concepts/time-modeling/timeslices); [QuantConnect Understanding Time](https://www.quantconnect.com/docs/v1/key-concepts/understanding-time)
- Esprow supports injecting latency and trading phases as scheduled conditions — [Esprow ETP GEMS](https://www.esprow.com/products/exchange-simulation/etp-gems.php)

### Inferences
- For CCXT: the minimal time-control API = (1) injectable clock replacing `Date.now`-based `milliseconds()` in the base class (transpiles to every language, avoids per-language fake-timer libs), (2) `advance(ms)`/`advanceTo(ts)` that drains a priority queue of scheduled events (fills, candle closes, funding, injected faults like `ExchangeNotAvailable`, `RateLimitExceeded`, WS disconnects), (3) `seek`/rewind implemented as reset-to-snapshot + re-simulate forward, with seeded RNG so re-simulation is identical.
- Per-language fake-timer tools (Jest, freezegun/time-machine, FakeTimeProvider, synctest) differ in semantics (synctest auto-advances when blocked; Jest/.NET advance only on explicit calls), so relying on them would make behaviour language-dependent; an explicit clock owned by the simulator is the only uniform option across 7 transpiled languages.
- Async runtimes are the hard part: CCXT's WS `Future`s and the throttler use real timers/sleeps; in simulation they must be driven by the virtual clock or they will stall or race.
- Walk-forward analysis is mechanically repeated (train window → test window → roll forward) runs; with snapshot + deterministic re-simulation this is cheap to express as seeks.

### Gaps
- No primary sources retrieved for freezegun/time-machine or Sinon specifics, or for FoundationDB's original simulation paper/talk (only secondary via TigerBeetle).
- No trading framework found in this pass that supports true in-run rewind/seek; LEAN/Nautilus are forward-only per run (inference from their docs, not an explicit statement).
- Walk-forward analysis mechanics: no source retrieved.

## Q5. Lockstep / co-simulation protocols (Gym-style envs, ABIDES-Gym) and relevance to a multi-language library

### Takeaway
Gym-style `reset()/step(action)` is the de facto lockstep protocol between a strategy and a simulator: the simulator owns time and only advances on `step`, which makes it deterministic and look-ahead-safe, but it forces a bar/step-synchronous control flow unlike CCXT's async request/stream API.

### Cited Findings
- gym-anytrading provides Gym environments (TradingEnv, ForexEnv, StocksEnv) with `reset()`/`step(action)` and config such as `frame_bound` and `window_size` — [gym-anytrading GitHub](https://github.com/AminHP/gym-anytrading); [trading_env.py](https://github.com/AminHP/gym-anytrading/blob/master/gym_anytrading/envs/trading_env.py)
- FinRL-Meta builds gym-style market environments with a common interface over a data layer — [FinRL-Meta arXiv:2211.03107](https://arxiv.org/pdf/2211.03107)
- ABIDES-Gym wraps a discrete-event multi-agent simulator into the Gym framework, proposing a general technique for doing so (the RL agent is one "experimental agent"; kernel pauses at its wakeups) — [ABIDES-Gym arXiv:2110.14771](https://arxiv.org/pdf/2110.14771)

### Inferences
- Lockstep is the right answer to "what time is it" for out-of-process setups: the simulator (server) owns the clock and advances only when the client says "step/advance", eliminating pacing and clock-sync problems at the cost of a round trip per step.
- For CCXT, a lockstep API could be exposed in-process as explicit `advance()` calls; the same semantics could later be wrapped as a gym env (Python) or a server protocol without changing the core, suggesting (B)+(C) as the core and (A) as an optional thin façade.

### Gaps
- No example found of a lockstep protocol spanning multiple languages over a network for trading (beyond ABIDES-Gym being Python-only).

## Q6. Failure modes of each architecture

### Takeaway
(A) fails on fidelity (paper/testnet fills and books are unrealistic), clock coherence and speed, and — if exchange-native — on maintenance of 100+ API emulations; (B) fails if it diverges from live code paths or leaks wall-clock; (C) fails on look-ahead and non-determinism if data access and async timers are not bound to the virtual clock.

### Cited Findings
- Fill-realism failures in paper servers: no market impact, no queue position, quantity not checked against NBBO, random partial fills — [Alpaca docs mirror](https://github.com/alpacahq/alpaca-docs/blob/master/content/trading/paper-trading.md); top-of-book simulated fills, simulated complex orders — [IBKR guides](https://www.ibkrguides.com/clientportal/aboutpapertradingaccounts.htm)
- Price/liquidity failures in crypto testnets: independent unsynchronized books, monthly resets — [Binance testnet General Info](https://developers.binance.com/docs/binance-spot-api-docs/testnet/general-info)
- Real-time-only test environments with lower data rates than production — [CME wiki](https://cmegroupclientsite.atlassian.net/wiki/spaces/EPICSANDBOX/pages/457319776)
- Look-ahead prevention requires a time frontier on data access — [QuantConnect Timeslices](https://www.quantconnect.com/docs/v2/writing-algorithms/key-concepts/time-modeling/timeslices)
- Determinism requires owning clock/network/disk and a seed — [TigerBeetle VOPR](https://github.com/tigerbeetle/tigerbeetle/blob/main/docs/internals/vopr.md); [ABIDES](https://arxiv.org/pdf/1904.12066)
- Backtest/sandbox parity is an ongoing maintenance burden even in a single-codebase framework (latency modeling PR) — [nautilus_trader PR #4865](https://github.com/nautechsystems/nautilus_trader/pull/4865)
- Fake-clock edge cases (e.g., mutex waits don't advance time in synctest; Advance/SetUtcNow semantics surprises in .NET) — [Inside Go's synctest](https://internals-for-interns.com/posts/inside-go-synctest); [dotnet/extensions#3995](https://github.com/dotnet/extensions/issues/3995)

### Inferences
- Comparison summary for CCXT:
  - (A) server-as-exchange: + language-agnostic, reuses unchanged client code, can be shared by teams; − HTTP/WS overhead per call (backtests orders of magnitude slower than in-process — not measured here), network nondeterminism, pacing/clock-sync issues, client wall-clock leaks (CCXT nonces/throttler use `Date.now`), and if exchange-native: 100+ API emulations to maintain. Real-world instances: Alpaca/IBKR paper, crypto testnets, tardis-machine (data only), Esprow.
  - (B) in-process sim exchange with unified methods: + fast, deterministic, written once in `ts/src/` and transpiled to all languages, reuses unified structures and validators; − one more "exchange" whose fidelity is only as good as its matching model; risk that strategies using exchange-specific `params` or implicit API methods can't be simulated. Real-world instances: NautilusTrader BacktestExecClient/SimulatedExchange, LEAN.
  - (C) explicit time control: + reproducibility, fault/event injection, look-ahead safety, seek via snapshot; − needs base-class clock injection and async-timer integration in every language runtime. Real-world instances: TigerBeetle VOPR, FoundationDB, Antithesis, ABIDES kernel, Jest/.NET/Go fake clocks.
- The strongest design is (B)+(C) at the core, with (A) optional as a thin server over the same core for cross-process/shared use.

### Gaps
- No quantitative benchmark found comparing HTTP-based vs in-process backtest throughput.
