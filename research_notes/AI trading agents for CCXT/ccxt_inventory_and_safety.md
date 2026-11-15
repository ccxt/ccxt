# CCXT agent-facing inventory and evaluation/safety practices for LLM trading agents

Scope note: local findings are cited by repo path (read-only inspection of /home/user/ccxt on 2026-11-15). Web findings come from search-result snippets. WebFetch could not reach arxiv.org or docs.ccxt.com from this session (the hosts are not in the network allowlist), so I could not read primary PDFs in full. Each web claim below therefore rests on abstract or summary text.

## (A1) What agent-facing skills ship in .claude/skills?

### Takeaway
CCXT ships 9 first-party "usage" skills: 7 language skills, `ccxt-cli` and `ccxt-mcp`. All of them are documentation-only Markdown with no scripts. Besides them, the directory holds `new-exchange` (for contributors) and about 15 third-party Binance skills, some with Node or Python scripts. **There is no workflow-level skill** (research, strategy, risk, backtest, journaling). Every CCXT skill is an API or how-to reference.

### Cited Findings
- `.claude/skills/README.md` describes the directory as "seven language-specific skills plus CLI and MCP skills to help developers use CCXT". The language skills are ccxt-typescript, -python, -php, -csharp, -go, -java and -rust. Each is a single SKILL.md of 733–1310 lines covering install, REST/WS, errors and rate limits. — `/home/user/ccxt/.claude/skills/README.md`, `/home/user/ccxt/.claude/skills/ccxt-*/SKILL.md`
- The `ccxt-cli` skill (348 lines) covers calling any unified method from the terminal, `--param` rules, keys, sandbox/demo, WS tickers and orderbooks, OHLCV charts, and `--raw` JSON output for scripting. — `/home/user/ccxt/.claude/skills/ccxt-cli/SKILL.md`, `/home/user/ccxt/wiki/AI-Skills.md`
- `wiki/CLI.md` warns: "CLI executes your command and does not ask for a confirmation… confusing amounts with prices can cause a loss of funds." The CLI therefore has no safety rails comparable to the MCP server's. — `/home/user/ccxt/wiki/CLI.md`; CLI source at `/home/user/ccxt/cli/ts/{cli.ts,cache.ts,helpers.ts,charts}`
- The `ccxt-mcp` skill (133 lines) covers install per host (Claude Code/Desktop, Cursor, VS Code `inputs` secret storage, Windsurf, `.mcpb` bundle), the account config, capability tiers, sandbox, tool usage conventions, `fetch_route`/`execute_route` guidance ("Read `fillRatio` before `effectiveRate`") and a "Trading safely" section. — `/home/user/ccxt/.claude/skills/ccxt-mcp/SKILL.md` (also bundled at `/home/user/ccxt/mcp/plugin/skills/ccxt-mcp`)
- The `ccxt-mcp` skill itself warns about a gap: "Under the default `live` policy, sandbox/demo orders execute immediately without a preview, and `maxOrderValue: null` means no cap — so on a demo account an order can execute in one call with no gate." — `/home/user/ccxt/.claude/skills/ccxt-mcp/SKILL.md`
- `wiki/AI-Skills.md` says skills install via `npx skills add ccxt/ccxt` (the skills CLI) and target Claude Code, OpenCode, Codex and Gemini. It also says "`ccxt-mcp` has no individual installer flag… installed by `--all`". `llms.txt` advertises the same install command. — `/home/user/ccxt/wiki/AI-Skills.md`, `/home/user/ccxt/llms.txt`
- The Binance-authored skills present are `binance` (binance-cli for Spot/USD-S futures/Convert, with many `references/*.md`), `binance-agentic-wallet` (web3 wallet, DEX, prediction, x402, with `references/security.md` and `preflight.md`), `fiat`, `p2p`, `payment-assistant` (Python scripts), `onchain-pay-open-api` (`sign_and_call.sh`), `square-post` (mjs scripts) and `binance-tokenized-securities-info`. — `/home/user/ccxt/.claude/skills/*`
- The Binance Web3 data skills each have `scripts/cli.mjs` plus `references/cli.md`. They are `crypto-market-rank` (social-hype, trending, smart-money inflow, meme, top-trader PnL leaderboards), `trading-signal` (per-trade smart-money buy/sell signals, BSC and Solana only), `meme-rush` (launchpad feed and AI "hot topics"), `query-token-info`, `query-token-audit` (honeypot/scam audit) and `query-address-info`. — `/home/user/ccxt/.claude/skills/{crypto-market-rank,trading-signal,meme-rush,query-token-*,query-address-info}/`
- `new-exchange` is a contributor skill that scaffolds a new exchange integration (318 lines). — `/home/user/ccxt/.claude/skills/new-exchange/SKILL.md`
- The only agent definition is `.claude/agents/ccxt-pr-reviewer.md`, which is contributor-facing. — `/home/user/ccxt/CLAUDE.md` §14

### Inferences
- The CCXT-owned skills teach *how to call the API*. None teaches *how to run a trading workflow safely*, such as research → plan → paper → confirm → execute → journal → review. Binance's third-party skills show a richer pattern (scripts, preflight/security references) that CCXT could adopt.
- The signal and sentiment skills (trading-signal, crypto-market-rank, meme-rush) bring untrusted, social-derived data into agent context. This is exactly the prompt-injection and manipulation surface flagged in section B3. A CCXT workflow that consumes such feeds should treat them as data and never as instructions.

### Gaps
- I did not read every Binance skill's security reference in full (e.g. `binance-agentic-wallet/references/security.md`).

## (A2) What does the official CCXT MCP server (mcp/) offer: tools, tiers, rails, accounts, prediction markets?

### Takeaway
`ccxt-mcp` is a mature, security-first local stdio server. It has 34 tools, five opt-in capability tiers, file-owned permissions, notional/daily caps, symbol allow/deny lists, preview+confirm (elicitation-first), an append-only journal, WebSocket subscribe/poll, cross-venue routing and prediction-market support. It explicitly lacks a kill switch or halt tool, max-position/leverage/drawdown limits, portfolio aggregation across accounts, a paper-trading mode inside the server, and backtesting.

### Cited Findings
- Security model: local stdio only. "Credentials are never tool parameters". Accounts are referenced by name. A redaction filter covers every result, error and log line, and `verbose` is force-disabled. Tiers are enabled only by editing the config file ("there is no tool that edits config, so a conversation can never grant itself permissions"), and unregistered tiers are hidden from the tool list. — `/home/user/ccxt/mcp/README.md`
- The README admits a caveat: any local agent with filesystem access could read the config file. It recommends `chmod 600`, host secret storage, and exchange-side keys with withdrawals disabled plus an IP allowlist. — `/home/user/ccxt/mcp/README.md`
- Capability tiers, all off by default except the first: market (default on, no keys), read (on when an account is configured), trading (`"trading": true` works for sandbox/demo only; `"live"` is required for real money), funds (withdraw/transfer/deposit addresses) and implicitWrites (raw POST/PUT/DELETE). Live trading also requires a user-authored `maxOrderValue` (a number or explicit `null`). The same pattern applies to funds with `maxTransferValue`. — `/home/user/ccxt/mcp/README.md`, `/home/user/ccxt/mcp/DESIGN.md`
- Account config fields (zod schema): exchange, prediction, apiKey, secret, password, uid, login, token, twofa, walletAddress, privateKey, sandbox, demo, trading, funds, implicitWrites, **dryRun**, maxOrderValue, maxTransferValue, maxDailyValue, allowedSymbols, deniedSymbols, confirm (`always|live|never`), defaultType, options, timeout, rateLimit. Settings include strictPermissions, maxSubscriptions, hideDisabledTools, loadEnvKeys and exchangeOptions. — `/home/user/ccxt/mcp/ts/config.ts`
- The 34 registered tools fall into these groups. — `/home/user/ccxt/mcp/ts/tools/*.ts`; `/home/user/ccxt/mcp/README.md`
  - market: list_exchanges, describe_exchange, describe_method, search_markets, get_tickers, get_orderbook, get_ohlcv, get_trades, search_events, call_read_method, call_implicit_get, get_safety_status, fetch_route
  - watch: watch_subscribe, watch_read, watch_unsubscribe, watch_list
  - read: list_accounts, get_balance, get_orders, get_my_trades, get_positions
  - trading: create_order, edit_order, cancel_order, cancel_all_orders, set_leverage, set_margin_mode, call_write_method, execute_route
  - funds: withdraw, transfer, get_deposit_address
  - implicitWrites: call_implicit_write
- The `call_write_method` allowlist is cancelOrders, cancelOrdersForSymbols, cancelAllOrdersAfter, setPositionMode, addMargin, reduceMargin, setMargin, borrow/repay Cross/Isolated margin, closePosition and closeAllPositions. `createOrders` (batch) is deliberately excluded because it "would bypass the per-order notional caps". — `/home/user/ccxt/mcp/ts/tools/trade.ts`, `/home/user/ccxt/mcp/DESIGN.md`
- `call_read_method` is "provably read-only": only `^(fetch|load)` names, excluding watch*/Ws. That gives it access to the long tail, including fetchFundingRates, fetchOpenInterest and fetchLedger. — `/home/user/ccxt/mcp/DESIGN.md`
- Rails are enforced at the execution point: `guardOrder()` runs inside the write handler under a per-account mutex. It rejects `params.cost`/`quoteOrderQty` bypasses. Inverse contracts are valued as amount×contractSize and prediction outcomes as amount×price in USD. `maxDailyValue` is a combined rolling-24h cap over orders and fund moves, derived from the journal so it survives restarts. — `/home/user/ccxt/mcp/DESIGN.md`, `/home/user/ccxt/mcp/ts/safety.ts`
- Confirmation is elicitation-first (a native host form) with a 5-minute timeout. Hosts without elicitation get a fallback: a single-use HMAC confirm token with a 60s TTL, bound to the canonical payload. On an elicitation-capable host a failed prompt "fails closed" and never falls back to the model-redeemable token. `cancel_order` is never confirmed ("cancels reduce risk"). — `/home/user/ccxt/mcp/DESIGN.md`
- The journal is "append-only monthly JSONL, fsync'd intent-before-dispatch, no auto-delete", and "a 50 MB warning doubles as a runaway-loop detector". — `/home/user/ccxt/mcp/DESIGN.md`
- Address-material gating: deposit and withdraw addresses sit behind the funds tier ("transcript-visible addresses invite address-substitution scams"). — `/home/user/ccxt/mcp/DESIGN.md`
- WebSocket support uses subscribe+poll. State streams (ticker, book, balance, positions, mark price, funding) merge into a full snapshot, and event streams (trades, orders, myTrades, liquidations) are cursor-drained. `waitForChange` long-polls for fills. Idle streams time out after 10 minutes. — `/home/user/ccxt/mcp/README.md`, `/home/user/ccxt/mcp/DESIGN.md`
- Routing: `fetch_route` (market tier, a quote across about 50 venues via the CCXT OrderRouter) and `execute_route` (trading tier, executes a cached `routeId` only, with every leg re-guarded and journaled, `dryRun` supported, and an `unwind` suggestion that is never automatic). — `/home/user/ccxt/mcp/README.md`, `/home/user/ccxt/wiki/OrderRouter.md`
- Prediction markets: `search_events`, after which outcome handles act as symbols in the ordinary tools. The prediction namespace covers Polymarket, Kalshi, Limitless, Myriad and Hyperliquid prediction markets, with prices from 0 to 1. — `/home/user/ccxt/mcp/README.md`, `/home/user/ccxt/wiki/Prediction-Markets.md`
- Context-size engineering: per-tool caps, `info` stripped, valid-JSON truncation, and a `search_markets` `fields` projection. Listing all 528 okx USDT swaps dropped from 6 calls / 239,592 chars to 1 call / 14,805 chars. — `/home/user/ccxt/mcp/DESIGN.md`
- Prior-art review (2026-07-21) of six community CCXT MCP servers found recurring failures: credentials passed as tool params, rails not enforced at execution, and no response sizing. Valet is noted as "best-in-class: dry-run default, live-ack, caps, intent journal". — `/home/user/ccxt/mcp/DESIGN.md`
- The roadmap lists "v2: MCP resources…, portfolio aggregation across accounts, `tools: "extended"` mode". There is no mention of a kill switch, position limits or backtesting. — `/home/user/ccxt/mcp/DESIGN.md` ("Also planned")
- Packaging: a signed `.mcpb` bundle (keys in the OS keychain), MCP registry `server.json` (`io.github.ccxt/ccxt-mcp`), a Claude Code plugin, and tests (unit/schema/integration/live). — `/home/user/ccxt/mcp/{mcpb,plugin,server.json,test}`
- DESIGN notes a policy constraint: "Anthropic directory rejects money-moving connectors — so the trading/funds tiers are npx/MCPB-installed, never directory-listed." — `/home/user/ccxt/mcp/DESIGN.md`

### Inferences
- Missing rails worth building, judged against the B-section practices:
  - a kill switch: a `halt` file or config flag that refuses all non-cancel writes and runs cancel-all/`cancelAllOrdersAfter`
  - per-account max position / gross exposure / max leverage caps (`set_leverage` is allowlisted, but no `maxLeverage` field exists)
  - drawdown or loss-based circuit breakers (caps are notional only, not P&L-based)
  - order-rate or turnover limits, the anti-overtrading measure seen in Alpha Arena and the CCXT arena
  - fat-finger price-band checks against mid/mark
- `dryRun` exists in the account schema. A first-class paper-trading tier, which would simulate fills against live books like `examples/mcp-arena/paper-broker.mjs`, does not exist in the server itself.

### Gaps
- I did not read `safety.ts` line by line to confirm exactly what `dryRun` does, or whether the price-band check is absent everywhere.

## (A3) Other agent-relevant assets: examples, arena/paper broker, llms.txt, wiki

### Takeaway
The repo already contains an LLM trading arena harness with a realistic paper broker (`examples/mcp-arena/`). It is the closest thing to an evaluation and paper-trading capability, but it lives in examples rather than as a reusable product. Strategy-like examples exist (arbitrage, aggregated books, OHLCV building, funding history) but are educational scripts.

### Cited Findings
- `examples/mcp-arena/` describes itself as "Give several LLMs $100, one hour, and the CCXT MCP server". It backs the blog post "We gave nine AI models $100 and an hour to trade. Most of them lost." Each agent gets the real `ccxt-mcp` server (market-data only) plus `paper-broker.mjs`. The broker is an MCP server where market orders walk live order books via CCXT and pay taker fees. Limit and trigger orders rest until the live price touches them. Perps pay real funding and liquidate at 0.5% maintenance margin. Cross-venue transfers cost $1 and take 5 minutes. Every call, fill and per-minute equity point is logged. `analyze.mjs` and `charts.py` analyse the runs. — `/home/user/ccxt/examples/mcp-arena/README.md`, `/home/user/ccxt/examples/mcp-arena/paper-broker.mjs`
- Arena prompt: "You are an autonomous trading agent running unattended…". Variants include `fees` and `mustTrade`. Non-Anthropic models run via OpenRouter and Claude via `claude -p` with only the two MCP servers attached. — `/home/user/ccxt/examples/mcp-arena/arena.mjs`, `README.md`
- The arena's own caveats: no queue position, no partial fills on resting orders, no latency, and stops fill at the book after the trigger. Binance and Bybit were excluded because of US-region 451/403 errors. "One hour on $100 says very little about skill. Read the results as behaviour, not as a leaderboard." — `/home/user/ccxt/examples/mcp-arena/README.md`
- I could not fetch the blog post itself (docs.ccxt.com is blocked from this session), so per-model results are not captured here.
- Strategy-like examples include `examples/py/bots/spot-arbitrage-bot.py` (has a `paper_trading = True` flag, "educational purposes only") and `bitfinex-lending-bot.py`. Others are `arbitrage-pairs.{py,ts}`, `aggregate-orderbook.ts`, `async-fetch-order-book-from-many-exchanges.py`, `build-ohlcv-bars.*`, `calculate-ohlcvs-from-trades*.ts`, `binance-fetch-ohlcv-to-csv.py`, `fetch-funding-rate-history.ts` and `async-fetch-ohlcv-indicators-discord-webhook.py`. — `/home/user/ccxt/examples/{py,ts}/`
- `examples/benchmarks/` is a performance/latency benchmark of the library across languages, not a trading benchmark. — `/home/user/ccxt/examples/benchmarks/`
- `llms.txt` (180 lines) and `llms-full.txt` (984 lines) are overview and expanded API references for LLMs. `llms.txt` mentions skills via `npx skills add ccxt/ccxt` but does not mention the MCP server (grep found no "mcp"). — `/home/user/ccxt/llms.txt`, `/home/user/ccxt/llms-full.txt`
- Agent-relevant wiki pages: `wiki/MCP.md` (195 lines), `wiki/AI-Skills.md`, `wiki/OrderRouter.md` (fetchRoute, buildExecutionPlan, **checkExecutionPlanSafety**, reconcileExecutionStep, buildUnwindPlan, execute) and `wiki/Prediction-Markets.md`. There are also `wiki/comparisons/` pages versus freqtrade, jesse, LEAN, NautilusTrader, OctoBot, barter and tardis, which are backtesting and bot frameworks CCXT does not replicate. — `/home/user/ccxt/wiki/`

### Inferences
- `llms.txt` omitting the MCP server is a cheap discoverability fix.
- The arena plus paper broker could be productised as (a) a `paper` tier or account type in ccxt-mcp, or (b) a reusable "agent eval harness" skill or workflow, matching the B-section best practice of paper trading first.

### Gaps
- I could not view the arena's results data (no `runs/` directory is committed) or the blog post.

## (A4) Which unified CCXT methods matter most for agent workflows, and how widely are they supported?

### Takeaway
CCXT already exposes the derivatives and market-structure data an agent needs: funding, OI, liquidations, greeks, option chains, leverage tiers, long/short ratio and ledger. It also has batch and edit order methods and a dead-man switch (`cancelAllOrdersAfter`). Support is uneven, so agents need capability discovery (`has`, `describe_method`).

### Cited Findings
Approximate counts come from grepping `'<method>': true` in the `has` blocks of `ts/src/*.ts` (103 REST files) and `ts/src/pro/*.ts`. They undercount emulated or object-valued flags.
- fetchMyTrades 82; editOrder 43; fetchFundingRateHistory 42; fetchLedger 38; fetchFundingRates 29; fetchOpenInterest 28; createOrders 28; cancelAllOrdersAfter (dead-man switch) 14; fetchLeverageTiers 12; fetchOpenInterestHistory 9; fetchGreeks 8; fetchLiquidations 4; fetchOptionChain 4; fetchLongShortRatioHistory 4. — `/home/user/ccxt/ts/src/*.ts`
- WS: watchOrderBook in 64 pro exchanges and watchLiquidations in 4. — `/home/user/ccxt/ts/src/pro/*.ts`
- Exchanges with `urls.test` (sandbox) blocks: about 43 files. Exchanges with an `enableDemoTrading` reference: 3. — `/home/user/ccxt/ts/src/*.ts`
- The Manual documents fetchLeverageTiers (max leverage and maintenance margin by size), fetchFundingRates, fetchOpenInterest/History, fetchVolatilityHistory, fetchLiquidations/fetchMyLiquidations, fetchGreeks/fetchAllGreeks, fetchOptionChain, fetchLongShortRatio/History, fetchBorrowRateHistory, createOrders and fetchConvertQuote. — `/home/user/ccxt/wiki/Manual.md` (lines ~2373–2406, 4069–4645)

### Inferences
- Agent value by job:
  - market regime and positioning: fetchFundingRates, fetchOpenInterest(History), fetchLiquidations/watchLiquidations, fetchLongShortRatio
  - risk: fetchLeverageTiers (maintenance margin), fetchPositions, fetchMarkPrices
  - execution: watchOrderBook, createOrders, editOrder, fetch_route
  - reconciliation and journaling: fetchMyTrades, fetchLedger, fetchPositionsHistory
  - options: fetchGreeks, fetchOptionChain
  - safety: cancelAllOrdersAfter as an exchange-side heartbeat kill switch
- Cross-exchange aggregation helpers would fill a real gap: a funding-rate scanner across venues, aggregated OI, a unified portfolio/NAV across accounts, and basis/spread scanners. The core library has none of these, and the MCP roadmap only lists "portfolio aggregation".

### Gaps
- Counts are heuristic and not verified against `features` or emulation.

## (A5) What is missing in CCXT for agentic trading?

### Takeaway
The gaps are: no backtesting engine, no point-in-time data harness, no first-class paper-trading simulator (only the arena example), no cross-exchange analytics helpers, no P&L/position/drawdown risk layer, no kill-switch tool, no structured decision journal (rationale or thesis) beyond the MCP write journal, and no workflow skills.

### Cited Findings
- Backtesting is absent from CCXT itself. The wiki positions CCXT against backtesting frameworks through comparison pages (freqtrade, jesse, LEAN, NautilusTrader). — `/home/user/ccxt/wiki/comparisons/`
- The CLI wiki lists "aggregating data for backtesting" as a use case, i.e. data export only. — `/home/user/ccxt/wiki/CLI.md`
- The only paper-trading implementations are `examples/mcp-arena/paper-broker.mjs` and a `paper_trading` boolean in `examples/py/bots/spot-arbitrage-bot.py`. — local paths above
- MCP journal = order/fund intents, not agent reasoning; caps are notional/daily only (no position, leverage, drawdown, order-rate). — `/home/user/ccxt/mcp/DESIGN.md`, `/home/user/ccxt/mcp/ts/config.ts`

### Inferences (candidate builds)
1. **Paper/simulated tier in ccxt-mcp**, promoted from paper-broker.mjs: live-book fills, fees, funding and liquidation, with the same tool names so an agent moves from paper → sandbox → live without prompt changes.
2. **Risk-policy extensions**: maxPositionValue, maxLeverage, maxOpenOrders, maxOrdersPerHour, price-band %, maxDrawdown/daily-loss breaker, and a `halt` kill switch (file- or config-owned, with automatic cancel-all and optional `cancelAllOrdersAfter` heartbeat).
3. **Point-in-time backtest/replay harness**: OHLCV/trades/funding snapshots with an enforced "as-of" clock, so agents cannot see the future; it reuses the paper broker for fills.
4. **Agent eval harness** (productised mcp-arena): multi-seed, longer horizons, fees on, baselines (buy-and-hold, cash), and risk-adjusted metrics.
5. **Cross-exchange scanners** (funding, basis, OI, spreads) as `call_read_method`-style composite read tools or skills.
6. **Workflow skills**: "market research brief", "pre-trade checklist", "post-trade review/journal", "safe live-trading onboarding (testnet → caps → live)".
7. Add MCP to `llms.txt`.

### Gaps
- Upstream maintainers' stance on adding a backtester is unknown. DESIGN.md says "it's the user's account and responsibility; the server provides gates… rather than vetoes," which suggests that policy-style limits would be user-configured switches.

## (B1) Benchmarks and evaluation of LLM trading agents

### Takeaway
Across live and backtested benchmarks, frontier LLMs mostly fail to beat simple baselines robustly. General capability does not predict trading skill, and agent architecture and risk control matter more than the backbone model. Most benchmarks omit costs and slippage, and short windows yield noisy rankings.

### Cited Findings
- **LiveTradeBench** (arXiv 2511.03628, Nov 2025): streams live prices and news, uses portfolio-allocation actions, and covers US stocks plus Polymarket. Over 50 days of live evaluation across 21 LLMs, high LMArena scores did not predict trading results, and stock and prediction-market performance were almost uncorrelated. It omits transaction costs, liquidity and slippage. — [arXiv abs](https://arxiv.org/abs/2511.03628?context=cs); [HTML](https://arxiv.org/html/2511.03628v1)
- **Agent Market Arena / "When Agents Trade"** (arXiv 2510.11695): described as the first lifelong, real-time multi-market benchmark (stocks and crypto) with verified data and expert-checked news. Its components are a Market Intelligence Stream, an Agent Execution Protocol and a Performance Analytics Interface. Finding: "agent architecture affects profitability more than the choice of LLM backbone." — [arXiv](https://arxiv.org/abs/2510.11695); [emergentmind](https://www.emergentmind.com/papers/2510.11695); [Moonlight review](https://www.themoonlight.io/review/when-agents-trade-live-multi-market-trading-benchmark-for-llm-agents)
- **StockBench** (arXiv 2510.02209): a contamination-free backtest using March–July 2025 data on Dow Jones stocks. Most agents beat buy-and-hold (0.4% return, −15.2% drawdown), e.g. Kimi-K2 at 1.9% / −11.8%, but they failed in the downturn, which suggests a bullish bias. It omits costs, slippage and liquidity and trades once per day. — [arXiv HTML](https://arxiv.org/html/2510.02209v1)
- **AI-Trader** (arXiv 2512.10971, Dec 2025): live and uncontaminated, covering US stocks, A-shares and crypto with 6 LLMs. "General intelligence does not automatically translate to effective trading capability"; most agents show poor returns and weak risk management, and risk control drives cross-market robustness. Code is at HKUDS/AI-Trader. — [arXiv](https://arxiv.org/abs/2512.10971v1); [emergentmind](https://www.emergentmind.com/papers/2512.10971)
- **InvestorBench** (arXiv 2412.18174, ACL 2025): the first benchmark for LLM agents in financial decision-making across stocks, crypto and ETFs, testing 13 LLM backbones. — [arXiv](https://arxiv.org/abs/2412.18174); [project](https://suchow.io/investorbench/)
- **FinBen**: described secondhand as 36 datasets and 24 tasks, including the first stock-trading evaluation. Unverified because I did not retrieve the primary paper. — (secondary listing; see Gaps)
- **FINSABER** (arXiv 2505.07078): a backtest from 2000 to 2024 that includes delisted stocks and rolling windows. LLM advantages "often vanish under broader and longer evaluations". The strategies were too conservative in bull markets and took disproportionate losses in bear markets. — [arXiv HTML](https://arxiv.org/html/2505.07078v2)
- **Alpha Arena Season 1 (Nof1)**: Oct 17/18 – Nov 3, 2025, with six LLMs given $10k each on Hyperliquid perps (BTC, ETH, SOL, BNB, DOGE, XRP), fully autonomous. More than half ended in the red, and Qwen 3 Max was reported first. Gemini 2.5 Pro and GPT-5 had heavy losses. Acknowledged limits: short context, no memory, narrow action space. — [Decrypt](https://decrypt.co/345006/ai-crypto-trading-showdown-deepseek-grok-winning-gemini-implodes); [Forklog](https://forklog.com/en/four-out-of-six-ai-models-suffer-losses-in-trading-tournament/). The final ranking is disputed: one guide says Nof1's writeup published no final ranking. — [Moby](https://moby.win/learn/alpha-arena/)
- Secondary analyses attribute losses to overtrading (fees), excessive leverage and poor sizing. — [iweaver](https://iweaver.ai/blog/alpha-arena-ai-trading-season-1-results); [besthub](https://www.besthub.dev/articles/can-llms-trade-crypto-profitably-inside-the-alpha-arena-competition-ace3b75ceaa5)

### Inferences
- A CCXT eval harness should include costs, slippage via book-walk (already in paper-broker), funding, multiple seeds and windows, both bull and bear regimes, and baselines. It should also report risk-adjusted metrics (Sharpe/Sortino, max drawdown, turnover, fee drag) rather than raw return.

### Gaps
- I could not access the Nof1 primary writeup, the FinBen paper or the CCXT arena blog post.

## (B2) Look-ahead bias and leakage mitigation

### Takeaway
LLM backtests are contaminated both by inputs (future data or news) and by weights (memorized outcomes). Mitigations are evaluating only on post-training-cutoff windows or live forward tests, point-in-time data and models, survivorship-free universes, and dedicated diagnostics.

### Cited Findings
- StockBench uses data after the training cutoff (Mar–Jul 2025) to be "contamination-free". — [arXiv](https://arxiv.org/html/2510.02209v1)
- "Summoning the Oracle to Slay It" (arXiv 2605.24564, May 2026) names "parametric look-ahead bias" (outcomes stored in the model's weights) and proposes FinCAD, an inference-time context-aware decoding method that suppresses memorized outcomes. Existing protections mostly address inputs. — [arXiv](https://arxiv.org/abs/2605.24564)
- Look-Ahead-Bench (arXiv 2601.13770, Jan 2026) measures look-ahead bias in point-in-time LLMs within realistic financial workflows. Commentary says bigger models may memorize more; this is a secondary claim. — [arXiv PDF](https://arxiv.org/pdf/2601.13770); [hedgefundalpha](https://hedgefundalpha.com/education/your-llms-alpha-might-be-mere-memorization/)
- FINSABER includes delisted stocks and historical constituents to remove survivorship bias, and uses rolling windows against data-snooping. — [arXiv](https://arxiv.org/html/2505.07078v2)
- Live forward benchmarks (LiveTradeBench, AMA, AI-Trader, Alpha Arena) are leakage-free by construction. — sources in B1

### Inferences
- A CCXT replay harness should enforce an as-of clock across every tool: OHLCV, trades, funding, news, and also `fetchMarkets`, because of delistings. It should prefer windows after the model's training cutoff and record the model cutoff with each run.

### Gaps
- A "37% memorization" figure for stock-return prediction appears only in a forum summary, so I excluded it as unverified.

## (B3) Safety: deterministic risk layers, HITL, kill switches, caps, prompt injection, key scoping

### Takeaway
Industry and regulatory practice puts hard pre-trade risk controls *outside* the decision-maker and adds kill switches. Agent-security guidance (OWASP Agentic Top 10) adds "least agency" and human approval for high-impact actions. Crypto-specific research shows memory and prompt injection can hijack trading agents, and prompt-level defenses are weak. ccxt-mcp already implements several of these; kill switch, position/loss limits and injection hygiene are the gaps.

### Cited Findings
- SEC Rule 15c3-5 (Market Access Rule) requires pre-trade risk controls under the broker's "direct and exclusive control" and effectively prohibits unfiltered access. FINRA asks firms what controls, "such as kill switches", they use against aberrant algorithms. It flags unreasonable aggregate daily limits as deficiencies and cites pre-trade "hard" blocks as effective practice. — [FINRA Market Access](https://finra.org/industry/market-access); [FINRA 2024 report](https://finra.org/rules-guidance/guidance/reports/2024-finra-annual-regulatory-oversight-report/market-access-rule); [FINRA 2026 report](https://www.finra.org/rules-guidance/guidance/reports/2026-finra-annual-regulatory-oversight-report/market-access-rule)
- FIA's 2024 *Best Practices for Automated Trading Risk Controls and System Safeguards* says localized pre-trade risk controls are the primary tool against errors and unauthorized activity, and it covers AI. FIA's 2012 paper recommends a kill switch that "disable[s] the trading platform's ability to trade and cancels all resting orders". — [FIA 2024 PDF](https://fia.org/sites/default/files/2024-07/FIA_WP_AUTOMATED%20TRADING%20RISK%20CONTROLS_FINAL_0.pdf); [FIA 2012 PDF](https://www.fia.org/sites/default/files/2019-05/Order-Handling-for-Executing-Brokers.pdf)
- The OWASP Top 10 for Agentic Applications (2026) introduces "least agency" on top of least privilege and Excessive Agency (LLM06:2025). ASI01 is Agent Goal Hijack. Commentary recommends human approval for privileged, irreversible or high-impact operations and layered defense. These are secondary sources; the primary OWASP doc was not retrieved. — [Palo Alto Networks](https://paloaltonetworks.com/blog/cloud-security/owasp-agentic-ai-security/); [TechRepublic](https://www.techrepublic.com/article/news-owasp-ai-agent-risk-list/)
- "AI Agents in Cryptoland: Practical Attacks and No Silver Bullet" (arXiv 2503.16248; FC'26) shows that memory injection against ElizaOS (bots managing over $25M) via Discord led to unauthorized leveraged trades and transfers on X. Agents were more vulnerable to memory injection than prompt injection across 500+ cases. Prompt-based defenses were limited, while fine-tuning defenses did better. — [arXiv](https://arxiv.org/abs/2503.16248v3); [Notebookcheck](https://www.notebookcheck.net/Study-shows-memory-attacks-can-hijack-AI-agents-to-transfer-crypto-assets.1015427.0.html)
- Key scoping guidance from Binance: IP-whitelist every key, disable withdrawals unless needed, use least-privilege permissions, rotate and delete unused keys, and use separate keys per bot. Non-whitelisted keys inactive for 30 days are deleted (Binance.com); Binance.US resets inactive non-whitelisted keys to read-only after 90 days. — [Binance blog](https://www.binance.com/bg/blog/security/how-to-use-an-api-key-securely-5-tips-from-binance-8638066848800196896); [Binance.US](https://support.binance.us/en/articles/9842812-binance-us-api-keys-best-practices-safety-tips). CCXT has its own post, "How trading bots get drained: the API-key security checklist" (not fetched). — [docs.ccxt.com](https://docs.ccxt.com/blog/api-key-security)
- Mapping to ccxt-mcp (local):
  - deterministic rails outside the LLM: yes (`guardOrder` at execution)
  - HITL: yes (elicitation confirm; fail-closed)
  - notional/daily caps: yes
  - key isolation from the model: yes
  - least agency: yes (tiers hidden until enabled)
  - kill switch: **no dedicated tool or flag** (`cancel_all_orders` and allowlisted `cancelAllOrdersAfter` exist but are model-invoked)
  - position, leverage and drawdown limits: **no**
  - — `/home/user/ccxt/mcp/README.md`, `/home/user/ccxt/mcp/DESIGN.md`, `/home/user/ccxt/mcp/ts/config.ts`

### Inferences
- A user-owned kill switch is the highest-value missing rail: an out-of-band halt file or config flag the model cannot clear, which blocks all writes except cancels and triggers cancel-all. Next come P&L/position limits and order-rate limits.
- For workflows that consume news, social or signal data (Binance trading-signal, crypto-market-rank, meme-rush), recommend:
  - separating "research" and "execution" agents or contexts
  - never letting retrieved text set order parameters without a deterministic check
  - keeping confirm on `always` while such feeds are attached
- The existing default where sandbox/demo orders skip confirmation and `maxOrderValue: null` means uncapped is fine for testing. Still, an eval or paper workflow should set explicit caps so paper behaviour mirrors live constraints.

### Gaps
- I did not retrieve the primary OWASP Agentic Top 10 document, Nof1's methodology page or the FIA 2024 full text. The details above come from summaries.
