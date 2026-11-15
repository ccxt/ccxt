# Agent skills, MCP servers and toolkits for traditional markets (equities, options, futures, FX)

Research date: 2026-11-15. Network note: from this session, quantconnect.com, docs.tradier.com, mcpservers.org and cdn.jsdelivr.net would not resolve. Claims about those sources come from search-result snippets or GitHub mirrors and are marked as such.

## Q1. tradermonty/claude-trading-skills: the skills, data sources, SKILL.md structure, scripts and workflow chaining

### Takeaway
This is the largest open catalogue of Claude trading skills: 74 skills in 9 groups. Most are Python-script-backed, and they write JSON and Markdown reports to `reports/`. Skills are chained through YAML workflow manifests (`workflows/`) and "skillsets". Many skills run with no API key at all ("Local", public CSV, chart screenshots). FMP is the main paid data dependency, with FINVIZ Elite second. Alpaca is reached through the Alpaca MCP server, not directly.

### Cited Findings
Skill inventory as listed in the README catalog — [tradermonty/claude-trading-skills](https://github.com/tradermonty/claude-trading-skills):

- **Market Regime (16):**
  - `breadth-chart-analyst`: reads S&P 500 breadth chart images.
  - `cot-contrarian-detector`: crowded CFTC COT positioning; uses FMP.
  - `crypto-regime-analyzer`: crypto regime score 0–100; uses CoinGecko and Binance funding.
  - `downtrend-duration-analyzer`
  - `exposure-coach`: one-page "Market Posture" with an exposure ceiling.
  - `ftd-detector`: O'Neil follow-through days.
  - `ibd-distribution-day-monitor`: QQQ/SPY distribution days.
  - `macro-regime-detector`: cross-asset ratios; uses yfinance.
  - `market-breadth-analyzer`: public CSV.
  - `market-environment-analysis`: web search.
  - `market-news-analyst`
  - `market-top-detector`
  - `news-reaction-failure-analyzer`
  - `sector-analyst`: chart image.
  - `uptrend-analyzer`
  - `us-market-bubble-detector`: Minsky/Kindleberger framework.
- **Core Portfolio:**
  - `portfolio-manager`: analyzes Alpaca holdings for allocation, risk and rebalancing ideas; Alpaca is optional.
  - `us-undervalued-growth-screener`: uses SEC EDGAR, company IR and macro sources.
  - The README heading says "(1)" but lists 2 skills.
- **Dividend Income (5):** `dividend-growth-pullback-screener`, `kanchi-dividend-review-monitor` (returns OK/WARN/REVIEW states and never sells), `kanchi-dividend-sop`, `kanchi-dividend-us-tax-accounting`, `value-dividend-screener`.
- **Swing Opportunity (7):**
  - `breakout-trade-planner`: turns VCP output into plans with worst-case risk and **order templates**.
  - `canslim-screener`
  - `finviz-screener`: builds FinViz URLs from natural language.
  - `stockbee-exhaustion-hammer-screener`
  - `stockbee-momentum-burst-screener`
  - `theme-detector`
  - `vcp-screener`: Minervini volatility contraction pattern.
- **Trade Planning (7):**
  - `contrarian-setup-gate`
  - `drawdown-circuit-breaker`: reads journal state to decide whether new risk is allowed today.
  - `futures-position-sizer`: uses a 23-market contract spec table.
  - `position-sizer`
  - `pre-trade-discipline-gate`: blocks entries that fail discipline rules and journals the result.
  - `technical-analyst`: weekly charts for stocks, indices, crypto and forex.
  - `us-stock-analysis`
- **Trade Memory (6):**
  - `signal-postmortem`
  - `stockbee-setup-fluency-trainer`
  - `trade-hypothesis-ideator`: exports `strategy.yaml`.
  - `trade-performance-coach`
  - `trader-memory-core`: tracks a thesis from idea to postmortem.
  - `weekly-performance-digest`: win rate and expectancy.
- **Strategy Research (15):**
  - `backtest-expert`
  - Edge pipeline: `edge-candidate-agent`, `edge-concept-synthesizer`, `edge-hint-extractor`, `edge-pipeline-orchestrator`, `edge-signal-aggregator`, `edge-strategy-designer`, `edge-strategy-reviewer` (critiques overfitting).
  - `manifoldbt-backtester`
  - `mt5-robot-tester`: batch-tests MetaTrader 5 EAs.
  - `residual-edge-analyzer`
  - `scenario-analyzer`: 18-month scenarios from headlines.
  - `stanley-druckenmiller-investment`: combines 8 upstream outputs into a 0–100 conviction score.
  - `stockbee-20pct-study`
  - `strategy-pivot-designer`
- **Advanced Satellite (8 per the README heading; 7 are named):**
  - `earnings-trade-analyzer`: 5-factor post-earnings score.
  - `institutional-flow-tracker`: 13F data.
  - `options-strategy-advisor`: Black-Scholes simulation.
  - `pair-trade-screener`: cointegration.
  - `parabolic-short-trade-planner`: checks intraday triggers; Alpaca optional.
  - `pead-screener`
  - `stockbee-episodic-pivot-analyzer`
- **Meta / Dev tooling (9):**
  - `data-quality-checker`: catches scale, date and allocation errors before publishing.
  - `dual-axis-skill-reviewer`: deterministic checks plus LLM review.
  - `earnings-calendar`
  - `economic-calendar-fetcher`
  - `fxmacrodata-calendar`
  - `skill-designer`
  - `skill-idea-miner`: mines session logs for skill ideas.
  - `skill-integration-tester`: validates multi-skill workflow contracts.
  - `trading-skills-navigator`: recommends a workflow and setup path.

Data sources:
- FMP free tier: 250 requests/day — [repo README](https://github.com/tradermonty/claude-trading-skills)
- FINVIZ Elite: $39.50/mo — [repo README](https://github.com/tradermonty/claude-trading-skills)
- Alpaca: free paper account, accessed via the Alpaca MCP Server — [repo README](https://github.com/tradermonty/claude-trading-skills)
- Also used: CoinGecko, yfinance, SEC EDGAR, FXMacroData, MT5 local files — [repo README](https://github.com/tradermonty/claude-trading-skills)

Repo layout and packaging — [repo README](https://github.com/tradermonty/claude-trading-skills):
- Top-level folders and files: `skills/<name>/` (containing SKILL.md, references and scripts), `skills-index.yaml` (the canonical index), `workflows/`, `skillsets/`, `skill-packages/`, `scripts/package_skills.py`, `scripts/generate_catalog_from_index.py`.
- Claude web app: install from `.skill` ZIPs in GitHub Releases, verified against SHA256SUMS.
- Claude Code: copy skill folders to `~/.claude/skills/`.
- The README mentions no plugin marketplace.

Workflow manifests — [repo README](https://github.com/tradermonty/claude-trading-skills):

| Manifest | Skills chained |
|---|---|
| `market-regime-daily` | breadth, uptrend and exposure skills |
| `core-portfolio-weekly` | portfolio-manager, kanchi-dividend-review-monitor, trader-memory-core |
| `swing-opportunity-daily` | vcp-screener → drawdown-circuit-breaker → technical-analyst → position-sizer → trader-memory-core → pre-trade-discipline-gate |
| `trade-memory-loop` | trader-memory-core, signal-postmortem |
| `monthly-performance-review` | trader-memory-core, signal-postmortem, backtest-expert |

- A "no-API starter set" also exists: market-breadth-analyzer, uptrend-analyzer, position-sizer, trader-memory-core, signal-postmortem — [repo README](https://github.com/tradermonty/claude-trading-skills)

Example SKILL.md: `position-sizer` — [SKILL.md](https://raw.githubusercontent.com/tradermonty/claude-trading-skills/main/skills/position-sizer/SKILL.md):
- Frontmatter has `name` and `description`; the description carries trigger keywords such as Kelly, ATR and sector concentration.
- Sections: Overview / When to Use / Prerequisites (no API keys; stdlib Python 3.9+) / Workflow steps 1–6 / Output Format / Resources / Key Principles.
- Principles include "Survival first" and "Floor, never round up".
- The script is `scripts/position_sizer.py`.
  - Fixed-fractional arguments: `--account-size --entry --stop --risk-pct`.
  - ATR arguments: `--atr --atr-multiplier`, default 2.0.
  - Kelly arguments: `--win-rate --avg-win --avg-loss`. The skill recommends half-Kelly.
  - Constraint arguments: `--max-position-pct --max-sector-pct --current-sector-exposure`. The strictest constraint wins.
- Output is JSON (`schema_version` 1.0, `final_recommended_shares`, `final_risk_dollars`, `binding_constraint`, …) plus Markdown, saved to `reports/position_sizer_YYYY-MM-DD_HHMMSS.*`.

### Inferences
- Several patterns carry over directly to CCXT:
  - deterministic Python script + SKILL.md wrapper + JSON report with a schema version;
  - "gate" skills (circuit breaker, pre-trade discipline) placed before any order skill;
  - a journal/memory skill shared across workflows;
  - workflow YAML that chains regime → screen → size → journal.
- Crypto equivalents for CCXT:
  - breadth/regime: % of top-N markets above MA, using fetchTickers/fetchOHLCV;
  - COT-style positioning: funding rates and open interest via `fetchFundingRates` / `fetchOpenInterest`;
  - `futures-position-sizer` → contract size and leverage from CCXT market `contractSize`/`limits`.
- The repo never auto-executes trades. "Order templates" are its furthest step toward execution.

### Gaps
- I did not read each SKILL.md. Per-skill scripts beyond position-sizer are not enumerated.
- I did not see the exact YAML schema of `workflows/*.yaml`.

## Q2. Broker and data MCP servers and agent toolkits

### Takeaway
Broker MCPs cluster into three safety designs:
1. **Paper by default plus toolset allowlists** (Alpaca).
2. **Read-only by default, with out-of-band human approval of previewed orders** (community Schwab MCP).
3. **Hosted OAuth remote MCPs**, where the broker account permission is the main control (Tradier, QuantConnect, possibly IBKR).

Data MCPs are read-only. The newer ones (Massive, OpenBB) use "discover/search, then call" meta-tools instead of one tool per endpoint, to keep the model's context small.

### Cited Findings

**Alpaca MCP server (official, V2)** — [alpacahq/alpaca-mcp-server](https://github.com/alpacahq/alpaca-mcp-server)
- V2 is a complete rewrite on FastMCP. Tools are generated from Alpaca's OpenAPI specs, with hand-written overrides for trading and historical data. V1 tools are not compatible.
- It exposes 72 tools:
  - Account (6)
  - Orders (9): `place_stock_order`, `place_crypto_order`, `place_option_order`, `replace_order_by_id`, `cancel_all_orders`, …
  - Positions (6): `close_position`, `close_all_positions`, `exercise_options_position`, …
  - Watchlists (7)
  - Assets/market info (8): `get_option_contracts`, `get_calendar`, `get_clock`, …
  - Stock data (9): bars, quotes, trades, snapshot, `get_market_movers`, `get_most_active_stocks`
  - Crypto data (8), which also covers crypto
  - Options data (7): `get_option_chain`, `get_option_snapshot`
  - Corporate actions, news, fixed income
  - Locates (4; not available in paper)
  - Documentation tools (5): `search_alpaca_docs`, `fetch_alpaca_doc`, …
- Safety design:
  - `ALPACA_PAPER_TRADE` defaults to `true`.
  - `ALPACA_TOOLSETS` sets a server-side allowlist. Toolsets: account, trading, watchlists, assets, stock-data, crypto-data, options-data, corporate-actions, news, fixed-income-data, locates.
  - The HTTP transport binds to 127.0.0.1:8000 and validates Host/Origin headers. The README warns there is no built-in remote auth.
  - Credentials come only from env vars, and nothing is written to disk.
  - The README advises human review of LLM-proposed multi-leg options trades.

**Schwab: community `jkoelker/schwab-mcp`** — [GitHub](https://github.com/jkoelker/schwab-mcp)
- Tools:
  - Market data: `get_quotes`, `get_market_hours`, `get_movers`, `get_option_chain`, `get_price_history_*`, plus optional TA tools (SMA, RSI).
  - Accounts: `get_accounts`, `get_transactions`, `get_orders`.
  - Trading: `preview_equity_order`, `preview_option_order`, `preview_bracket_order`, `preview_replacement_order`, `place_previewed_order`, `replace_previewed_order`, `cancel_order`.
- Plain `schwab-mcp server` runs in "Basic Read-Only Mode (Safest)".
- Trading requires an approval backend: Discord (channel plus approver) or Signal.
- `--jesus-take-the-wheel` is labelled DANGER and bypasses approval.
- Key design: each preview returns a `preview_id`. `place_previewed_order` submits exactly that previewed order, so the LLM cannot swap in a different order after review.
- Other community Schwab servers are read-only by design:
  - acidsolution/schwab-mcp-server: "no trading endpoints should be implemented"
  - Tapojit/schwab-mcp: removes all trading
  - Source: search snippets — [GitHub acidsolution](https://github.com/acidsolution/schwab-mcp-server); [Glama Tapojit](https://glama.ai/mcp/servers/Tapojit/schwab-mcp)
- psonhoang/schwab-mcp uses a two-call `cancel_order` (the second call needs `confirm=true`) — [Glama, via search snippet](https://glama.ai/mcp/servers/yq5btyeak6). The URL to project mapping is unverified.

**Tradier MCP (official, hosted)** — [Tradier MCP page](https://tradier.com/individuals/mcp-server); [Tradier docs](https://docs.tradier.com/docs/tradier-mcp)
- Streamable HTTP with a personal API token. Works with Claude Code, Cursor and Gemini CLI.
- 22 tools: `search_tradier_docs` plus 21 tools covering account/portfolio, market data, trading and watchlists. Order placement is included.
- Source is search snippets only; the docs host was unreachable.

**Interactive Brokers**
- A directory lists a hosted IBKR endpoint `https://api.ibkr.com/v1/api/mcp` (Streamable HTTP, OAuth). It says orders "are never executed automatically" — [mcpservers.org listing](https://mcpservers.org/remote-mcp-servers/ibkr), via search snippet.
- This conflicts with Truthifi (2026), which could not confirm a dedicated IBKR MCP — [Truthifi](https://truthifi.com/providermcps/interactive-brokers-mcp).
- Community servers are also listed:
  - interactive-brokers-mcp: unofficial, alpha
  - kelvingao/ibkr-mcp: TWS/IB Gateway
  - a TWS server with paper defaults and order risk limits
  - Source: [Glama kelvingao/ibkr-mcp](https://glama.ai/mcp/servers/kelvingao/ibkr-mcp); [mcpservers.org](https://mcpservers.org/servers/ibkr-mcp-server)

**Massive (formerly Polygon.io) MCP** — [massive-com/mcp_massive](https://github.com/massive-com/mcp_massive)
- Only 3 tools:
  - `search_endpoints`: natural-language search over endpoints and built-in functions.
  - `call_api`: any REST endpoint. It can store results in an in-memory table and `apply` built-in functions (Black-Scholes greeks, returns, SMA/EMA).
  - `query_data`: SQL over an in-memory SQLite store.
- The endpoint index is built at startup from Massive's `llms.txt`.
- Env vars: `MASSIVE_API_KEY`, with `POLYGON_API_KEY` as a deprecated alias; `MASSIVE_MAX_TABLES=50`; `MASSIVE_MAX_ROWS=50000`.
- Also hosted at `https://mcp.massive.com`.
- The README advises against running via `uvx`, because cold starts can exceed the client timeout.

**OpenBB (ODP) MCP** — [OpenBB docs](https://docs.openbb.co/python/extensions/interface/openbb-mcp); [PyPI openbb-mcp-server](https://pypi.org/project/openbb-mcp-server/)
- `openbb-mcp-server` turns an Open Data Platform install, or any FastAPI app, into an MCP server. It exposes all GET endpoints as tools, on streamable-http at 127.0.0.1:8001/mcp.
- `enable_tool_discovery` hides command tools behind category/subcategory discovery tools, so an agent loads only what it needs.
- Operators can supply a system prompt and server "prompts" for multi-tool workflows.
- In the OpenBB Workspace copilot, users can toggle tools per server — [Workspace MCP tools](https://docs.openbb.co/workspace/analysts/ai-features/mcp-tools).
- OpenBB publishes a Pydantic AI agent guide — [OpenBB blog](https://openbb.co/blog/building-ai-agents-for-openbb-workspace-with-pydantic-ai).

**QuantConnect MCP (LEAN)** — [QuantConnect/mcp-server GitHub](https://github.com/QuantConnect/mcp-server)
- The current README describes a hosted remote MCP at `https://www.quantconnect.com/api/v2/mcp` with OAuth.
- Install paths: Claude connectors; `claude mcp add --transport http quantconnect …`; Local Platform (VS Code).
- Capabilities: create projects, edit strategy files, backtest, optimize, deploy to paper trading.
- It requires a paid agent node (A1-1, A4-8 or A16-32).
- The README suggests putting conventions such as position-sizing rules in CLAUDE.md.
- Directories list about 64 tools across projects, files, compile, backtests, optimizations, live algorithms and object store, plus `read_lean_versions` and `check_syntax` — [Glama](https://glama.ai/mcp/servers/QuantConnect/mcp-server/tools/read_lean_versions); [Docker Hub](https://hub.docker.com/r/quantconnect/mcp-server).
- An older Docker-based version's README was mirrored as "deprecated … preferred through the one embedded in VSCode" — search snippet; status conflicts between mirrors.

**Alpha Vantage (official)** — [PyPI alphavantage-mcp](https://pypi.org/project/alphavantage-mcp/)
- Install with `uvx alphavantage-mcp`; needs `ALPHAVANTAGE_API_KEY`.
- Supports stdio and Streamable HTTP, with optional OAuth 2.1.
- API functions become tools (TIME_SERIES_DAILY, RSI, COMPANY_OVERVIEW…).
- Listed in Claude's connector directory — [Claude Marketplaces](https://claudemarketplaces.com/mcp/alphavantage/alpha_vantage_mcp).

**Financial Datasets MCP** — [financial-datasets/mcp-server](https://github.com/financial-datasets/mcp-server)
- 10 read-only tools: `get_income_statements`, `get_balance_sheets`, `get_cash_flow_statements`, `get_current_stock_price`, `get_historical_stock_prices`, `get_company_news`, plus 4 crypto price tools.
- Run with `uv run server.py` and `FINANCIAL_DATASETS_API_KEY`.

**Yahoo Finance MCPs (community)**
- Many variants exist. One example is narumiruna `yfinance_get_option_chain` (read-only; strikes, IV, OI) — [Glama](https://glama.ai/mcp/servers/narumiruna/yfinance-mcp/tools/yfinance_get_option_chain).
- Another, Alex2Yang97 yahoo-finance-mcp, has a `get_option_chain` tool — [Glama](https://glama.ai/mcp/servers/Alex2Yang97/yahoo-finance-mcp/tools/get_option_chain).
- `options-chain-mcp` (blake365) is a read-only options research server over Tradier/Alpaca data, installed with `claude mcp add options-chain --env TRADIER_TOKEN=… -- npx -y options-chain-mcp`. Free data is roughly 15 minutes delayed — [GitHub](https://github.com/blake365/options-chain).

**TradingView (community only; none official)**
- Approaches: desktop chart readers via screenshots/accessibility, servers using the Chromium debug port (opt-in), and Yahoo-data servers with "TradingView-style" indicators. One Windows server bridges indicator signals to MT5 orders.
- A Glama listing warns that malicious forks add npm dependencies that install malware — [Glama listings](https://glama.ai/mcp/servers/dypsb0clz6); [Fusion Markets guide](https://fusionmarkets.com/posts/how-to-connect-tradingview-with-claude). Source is search snippets.

**Anthropic Claude for Financial Services** — [anthropics/financial-services](https://github.com/anthropics/financial-services-plugins)
- Apache-2.0. Install with `claude plugin marketplace add anthropics/financial-services`.
- It is markdown/JSON only, with no build step. Outputs are drafts for human review, and the agents "do not make investment recommendations or execute transactions".
- Vertical plugins:
  - **financial-analysis:** `/comps`, `/dcf`, `/lbo`, `/3-statement-model`, `/debug-model`, plus pptx/xlsx authoring.
  - **equity-research:** `/earnings`, `/earnings-preview`, `/initiate`, `/model-update`, `/morning-note` ("morning meeting notes and trade ideas"), `/sector`, `/thesis`, `/catalysts`, `/screen`.
  - **investment-banking**, **private-equity**, **fund-admin**, **operations (KYC)**.
  - **claude-for-financial-advisors:** meeting prep, compliance pre-check, rebalance review.
  - Partner plugins: LSEG (bond RV, swap curves, FX carry, options vol, macro-rates monitoring) and S&P Global.
- Named agents: Pitch, Meeting Prep, Market Researcher, Earnings Reviewer, Model Builder, Valuation Reviewer, GL Reconciler, Month-End Closer, Statement Auditor, KYC Screener. Also `managed-agent-cookbooks/` (agent.yaml + subagents).
- MCP connectors in `.mcp.json`: Daloopa, Morningstar, S&P Global/Kensho, FactSet, Moody's, MT Newswires, Aiera, LSEG, PitchBook, Chronograph, Egnyte, Box.

### Inferences
- Design ideas worth copying for a CCXT MCP or skill:
  - paper/sandbox default (Alpaca → CCXT `setSandboxMode`);
  - server-side toolset allowlists;
  - the preview → `preview_id` → place-exact-previewed-order pattern (Schwab);
  - out-of-band human approval (Discord/Signal);
  - a docs-search tool bundled in the trading server (Alpaca, Tradier);
  - meta-tools (search_endpoints / call_api / SQL over results) instead of hundreds of tools. This suits CCXT's large implicit API surface.
- Many "traditional" servers also cover crypto: Alpaca crypto toolset, Financial Datasets crypto prices, tradermonty `crypto-regime-analyzer`.

### Gaps
- I could not verify the full Tradier tool list or any confirmation/sandbox controls (host unreachable).
- I could not confirm whether IBKR's hosted MCP is official.
- Not found in this pass: a ThinkOrSwim/Schwab official MCP, CME/futures-specific MCPs, or FX broker (OANDA) MCPs.
- I did not verify QuantConnect live-money deployment controls.

## Q3. Common workflows packaged as skills

### Takeaway
The recurring workflow set is consistent across sources:
- regime/morning brief;
- screening;
- sizing plus pre-trade gate;
- journal/postmortem;
- backtest research;
- earnings digest;
- options analysis;
- rebalance review.

### Cited Findings
- Daily regime brief: `market-regime-daily` workflow and `exposure-coach` one-page posture — [tradermonty](https://github.com/tradermonty/claude-trading-skills). Morning note: `/morning-note` — [Anthropic FS](https://github.com/anthropics/financial-services-plugins).
- Watchlist screening: vcp/canslim/finviz/pead screeners — [tradermonty](https://github.com/tradermonty/claude-trading-skills); `/screen` idea-generation — [Anthropic FS](https://github.com/anthropics/financial-services-plugins); Alpaca watchlist tools — [Alpaca MCP](https://github.com/alpacahq/alpaca-mcp-server).
- Journal and post-trade review: trader-memory-core, signal-postmortem, trade-performance-coach, weekly-performance-digest — [tradermonty](https://github.com/tradermonty/claude-trading-skills); `/thesis` thesis-tracker — [Anthropic FS](https://github.com/anthropics/financial-services-plugins).
- Sizing and risk: position-sizer, futures-position-sizer, drawdown-circuit-breaker, pre-trade-discipline-gate — [tradermonty](https://github.com/tradermonty/claude-trading-skills).
- Backtest then deploy:
  - backtest-expert / edge pipeline / manifoldbt — research only — [tradermonty](https://github.com/tradermonty/claude-trading-skills).
  - QuantConnect MCP: backtest → optimize → deploy to paper — [QuantConnect](https://github.com/QuantConnect/mcp-server).
- Rebalancing: portfolio-manager on Alpaca holdings — [tradermonty](https://github.com/tradermonty/claude-trading-skills); rebalance review in claude-for-financial-advisors — [Anthropic FS](https://github.com/anthropics/financial-services-plugins).
- Earnings and news digest:
  - earnings-calendar, earnings-trade-analyzer, market-news-analyst — [tradermonty](https://github.com/tradermonty/claude-trading-skills).
  - `/earnings`, `/earnings-preview`, `/catalysts` — [Anthropic FS](https://github.com/anthropics/financial-services-plugins).
- Options analysis:
  - options-strategy-advisor (Black-Scholes) — [tradermonty](https://github.com/tradermonty/claude-trading-skills).
  - Massive `apply` greeks — [mcp_massive](https://github.com/massive-com/mcp_massive).
  - Option chain tools in Alpaca and Schwab — [Alpaca](https://github.com/alpacahq/alpaca-mcp-server); [Schwab](https://github.com/jkoelker/schwab-mcp).

### Inferences
- A CCXT skill pack could mirror this set one-for-one:
  - morning crypto brief: tickers, funding, OI, top movers;
  - screener over `fetchTickers`/`fetchOHLCV`;
  - sizer using market `limits`/`precision`/`contractSize`;
  - journal from `fetchMyTrades`;
  - backtest on `fetchOHLCV` history;
  - rebalance from `fetchBalance`;
  - options analysis via CCXT option markets (`fetchOptionChain`, `fetchGreeks` where supported).

### Gaps
- I found no detailed spec for how Anthropic's `/morning-note` or rebalance-review skills get their data.

## Q4. Safety handling

### Takeaway
The safety layers seen are:
1. Paper/sandbox default.
2. Read-only mode as the default or as a separate server.
3. Capability allowlists.
4. Preview-then-place, bound by ID.
5. Out-of-band human approval, with a loud-named override flag.
6. Two-step confirm parameters.
7. Local-only binding and env-only credentials.
8. Skills that stop at "order templates" or "drafts for human review".

I found no explicit max-notional caps in the primary sources I reviewed. One is only mentioned in a directory snippet ("order risk limits").

### Cited Findings
- Paper default via `ALPACA_PAPER_TRADE=true`; toolset allowlist; localhost bind; no remote auth — [Alpaca MCP](https://github.com/alpacahq/alpaca-mcp-server).
- Read-only default; Discord/Signal approval; preview_id binding; `--jesus-take-the-wheel` danger override — [schwab-mcp](https://github.com/jkoelker/schwab-mcp).
- Read-only-by-construction forks — [acidsolution](https://github.com/acidsolution/schwab-mcp-server).
- Agents don't execute transactions; outputs are drafts — [Anthropic FS](https://github.com/anthropics/financial-services-plugins).
- Circuit-breaker and discipline gates; order templates only — [tradermonty](https://github.com/tradermonty/claude-trading-skills).
- QuantConnect gates deployment behind a paid node and OAuth; paper deployment is advertised — [QuantConnect](https://github.com/QuantConnect/mcp-server).
- IBKR community TWS server with "paper-trading defaults and order risk limits"; IBKR hosted listing claims orders are never auto-executed — [mcpservers.org](https://mcpservers.org/servers/ibkr-mcp-server) (snippet, unverified).

### Inferences
- A CCXT agent toolkit should probably combine:
  - sandbox default;
  - tiered toolsets (read / trade / transfer, with withdraw never exposed);
  - preview IDs;
  - a configurable max-notional per order. This matches CCXT's own repo rule of a 25 USD cap and no `withdraw`.

### Gaps
- I could not verify max-notional or daily-loss limits in any official broker MCP.
- I could not verify the Tradier and IBKR safety controls.
