# Crypto-native AI agent tooling, bot frameworks, and agent-facing skills/MCP servers (as of Nov 2026)

Method note: research ran as web searches plus a read of the in-repo official CCXT MCP server (`/home/user/ccxt/mcp/README.md`, `/home/user/ccxt/mcp/DESIGN.md`, `/home/user/ccxt/.claude/skills/ccxt-mcp/SKILL.md`). Direct page fetches of hummingbot.org and blockeden.xyz failed (hosts not in this session's network allowlist), so several claims come from search-result summaries of those pages rather than full-page reads. Many hits are secondary or aggregator sources (directory listings, crypto-news reposts); they are flagged where it matters.

## Bot frameworks and their AI/agent features (Freqtrade, Hummingbot, Jesse, OctoBot, Superalgos, NautilusTrader, Passivbot)

### Takeaway
The classic open-source bots now reach agents mostly through MCP bridges over their existing REST APIs (backtest, deploy, monitor), not through native LLM strategy logic. Hummingbot has gone furthest with Condor, an official "agent harness" with its own MCP servers and guardrails. Freqtrade depends on CCXT, and OctoBot is commonly described as CCXT-based. Freqtrade's agent bridges are community-built.

### Cited Findings
**Hummingbot / Condor (official; Hummingbot uses its own connectors, not CCXT)**
- Condor is Hummingbot's open-source harness for AI trading agents. It connects LLM decision-making to deterministic execution through the Hummingbot API across 50+ exchanges and blockchains, and the project likens it to OpenClaw for trading tasks ("CTAs"). — [Hummingbot blog: Introducing Condor](https://hummingbot.org/blog/introducing-condor-the-open-source-harness-for-trading-agents/); [Condor docs overview](https://condor.hummingbot.org/trading-agents/overview)
- Condor runs two MCP servers. `hummingbot-mcp` handles trading through the Hummingbot API (13 tools), and `condor-mcp` handles local operations: skills, memory and journals. — [Condor MCP tools](https://condor.hummingbot.org/trading-agents/mcp-tools)
- Each Condor trading agent is a directory with a strategy definition file. The docs state that "risk guardrails cannot be bypassed by the agent." — [Condor trading-agents overview](https://condor.hummingbot.org/trading-agents/overview)
- The Hummingbot API is a RESTful server that serves as the execution layer for Condor and other AI trading systems. — [Hummingbot API docs](https://hummingbot.org/hummingbot-api/)
- A "hummingbot-deploy" skill on skill directories (ClawHub and others) installs the API, the MCP server and Condor. Only the API is required. — [ClawHub hummingbot-deploy](https://clawhub.ai/hummingbot-deploy); [agskills.dev listing](https://agskills.dev/skills/hummingbot-skills-hummingbot-deploy)
- A later blog post is titled "Introducing Condor Agents: the open-source standard for trading agents". The page was not read. — [Hummingbot blog](https://hummingbot.org/blog/introducing-condor-agents-the-open-source-standard-for-trading-agents)

**Freqtrade (+FreqAI) — uses CCXT**
- Freqtrade is built on CCXT. Its `SUPPORTED_EXCHANGES` list names about 15 tested exchange IDs, and `freqtrade list-exchanges` filters CCXT's exchange list by required capabilities. (Source is CCXT-authored.) — [CCXT docs: CCXT vs Freqtrade](https://docs.ccxt.com/docs/comparisons/ccxt-vs-freqtrade); [Freqtrade exchanges.md](https://codeclimate.com/github/freqtrade/freqtrade/docs/exchanges.md/source)
- Community MCP bridges:
  - kukapay `freqtrade-mcp` drives a running bot through Freqtrade's REST API (the API server must be enabled in config). It exposes tools such as fetching OHLCV. — [FlowHunt freqtrade-mcp](https://www.flowhunt.io/vi/tich-hop/freqtrade-mcp/); [mdskills listing](https://www.mdskills.ai/mcp-servers/freqtrade-mcp)
  - `freqtrade-mcp-server` (PyPI) is read-only codebase and docs introspection with a docs filter such as "freqai". It does not trade. — [PyPI freqtrade-mcp-server](https://pypi.org/project/freqtrade-mcp-server/)
  - "Freqtrade Dev" generates, optimizes and evaluates strategies with a LangGraph agent. — [mcpmarket Freqtrade Dev](https://mcpmarket.com/server/freqtrade-dev)
- I found no official Freqtrade/FreqAI MCP server or LLM feature.

**Jesse**
- The community `bkuri/jesse-mcp` exposes Jesse's backtesting and trading tools over MCP through a bridge to Jesse's REST API. It has grown from 15 "agent tools" to 32 tools (17 core plus 15 agent). Its docs say the server is only a protocol bridge and the LLM does the orchestration. — [GitHub bkuri/jesse-mcp](https://github.com/bkuri/jesse-mcp); [Glama README](https://glama.ai/mcp/servers/@bkuri/jesse-mcp/blob/0dcad8f90a1ad45e86f5d1d9f3d6f370b8dd117c/README.md)

**OctoBot (commonly described as CCXT-based)**
- OctoBot is an open-source bot with built-in backtesting and paper trading. It has "AI/LLM connectors" that use cloud or local models for market-context decisions, and it is aimed at click-and-configure users. — [SourcePulse OctoBot](https://www.sourcepulse.org/projects/8038); [selfhostyourself OctoBot](https://selfhostyourself.com/services/octobot)

**Other frameworks**
- FMZ "AI Trader" with MCP RunJobs is presented as a way to close the loop on automated trading for agents (adjacent, closed platform). — [DEV: FMZ MCP RunJobs](https://dev.to/quant001/closing-the-loop-on-automated-trading-for-ai-agents-ai-trader-fmz-mcp-runjobs-in-practice-58o3)
- cTrader (FX/CFD, not crypto) launched an MCP server and describes it as a two-way channel to account, charts and trading data. — [cTrader blog](https://blog.ctrader.com/your-ai-can-now-trade-for-you/)

### Inferences
- Agents can already drive these workflows: strategy authoring, then backtest, hyperopt/optimise, paper/dry-run, deploy, then monitor/journal. Each bot reaches agents through its REST API wrapped in MCP. A CCXT workflow skill could reuse that sequence.
- Freqtrade, and probably OctoBot, Superalgos and Passivbot (unverified, see Gaps), sit on CCXT. CCXT-level improvements, such as agent-friendly market search and response trimming, would reach these bots indirectly. CCXT itself has no backtest or dry-run engine; the official MCP's sandbox tier is the closest equivalent.
- Condor's pattern is a strategy file per agent, guardrails the agent cannot override, and memory/journal tools. It is a template for a CCXT "trading agent" skill.

### Gaps
- Superalgos, NautilusTrader and Passivbot: no search results on their AI/MCP features or on their CCXT dependency. From training knowledge, Passivbot v7 and Superalgos use CCXT and NautilusTrader uses its own Rust adapters, but none of this is verified here.
- FreqAI: found nothing beyond the docs-introspection MCP. FreqAI's own feature set (ML model training, retraining) was not re-verified for 2026.
- OctoBot's CCXT use is from general knowledge, and its "AI connectors" details come from aggregator pages.
- I did not read Hummingbot/Condor pages in full (fetch blocked), so the exact 13 hummingbot-mcp tools are not listed here.

## Agent frameworks, exchange-official toolkits and data MCPs

### Takeaway
In 2026 every major CEX shipped official agent tooling: Binance (Agent OS, MCP, CLI, Skills Hub), OKX (Agent Trade Kit: MCP and CLI, about 80 tools), Kraken (open-source CLI with built-in MCP and paper trading), Bitget (Agent Hub skills and CLI) and Coinbase (AgentKit, Agentic Wallets, x402, Coinbase for Agents). None of these toolkits reportedly uses CCXT. Each is single-venue, which leaves cross-exchange workflows as CCXT's natural niche. Live LLM trading results (Alpha Arena) are mostly negative.

### Cited Findings
**Binance**
- Binance's Agent OS includes an MCP server for spot, margin, Convert and two futures product types. MCP clients connect over Streamable HTTP at `https://agent.binance.com/mcp/agentic`. — [crypto.news: Binance launches Agent OS and MCP trading server](https://crypto.news/binance-launches-agent-os-and-mcp-trading-server/); [HackerNoon: Agent OS with limits you set](https://hackernoon.com/binance-launches-agent-os-letting-ai-agents-trade-on-your-account-with-limits-you-set)
- Binance's first 7 AI Agent Skills came in early March 2026 (spot trading, wallet data, execution). Four more followed on 18 March 2026 (derivatives, margin, Binance Alpha data, asset management). — [crypto.news: Binance AI trading skills](https://crypto.news/binance-launches-ai-trading-skills-with-unified-agent-interface/); [The Week wire, 18 Mar 2026](https://www.theweek.in/wire-updates/business/2026/03/18/binance-enhances-ai-agent-skills-with-comprehensive-trading-asset-management-and-market-intelligence-capabilities.html)
- The skills are listed on Binance's Skills Hub and backed by `binance-cli` (Spot, USD-S Futures, Convert). — [Binance Developers Skills Hub](https://developers.binance.com/en/docs/sdks-tools/tools/skills-hub)
- This session also has Binance skills installed: `binance` (binance-cli), `binance-agentic-wallet`, `query-token-audit`, `trading-signal`, `crypto-market-rank`, `meme-rush` and others. They cover token audits, smart-money signals, launchpad feeds, P2P and Pay. — local skill listing.
- Binance's MCP docs say users are responsible for agent trades, that AI can act on outdated or hallucinated information, and that Binance is not liable. — [crypto.news](https://crypto.news/binance-launches-agent-os-and-mcp-trading-server/)

**OKX**
- The Agent Trade Kit has two MIT npm packages: `okx-trade-mcp` (MCP server) and `okx-trade-cli`. Reports put it at 80+ tools across spot, perps, algo orders and DeFi. Credentials are kept from the LLM, and write operations reportedly need explicit user approval. — [GitHub okx/agent-trade-kit](https://github.com/okx/agent-trade-kit); [OKX Learn](https://web3.okx.com/learn/agent-trade-kit); [DEV write-up](https://dev.to/timmyzinin/okx-agent-trade-kit-connecting-ai-assistants-to-crypto-trading-via-model-context-protocol-408b)

**Kraken**
- Kraken released an open-source single-binary CLI covering spot, futures, staking, subaccount transfers and WebSocket streaming. It has a built-in MCP server (`kraken-mcp`, stdio) and a local paper-trading engine that runs on live data with simulated balances. It targets Claude Code, Codex, Cursor and OpenClaw. — [Kraken blog: Announcing the Kraken CLI](https://blog.kraken.com/news/industry-news/announcing-the-kraken-cli); [Kraken docs: MCP](https://docs.kraken.com/home/mcp); [Kraken docs: CLI](https://docs.kraken.com/home/cli)
- Tool count is inconsistent: Kraken's own docs say 151 or 152, and a third-party article says 134 commands. Launch dates in secondary sources range from March to June 2026. — [Kraken docs](https://docs.kraken.com/home/mcp); [Bitcoinist](https://bitcoinist.com/kraken-launches-open-source-mcp-server-for-ai-trading-agents/); [BlockEden, 22 Apr 2026](https://blockeden.xyz/blog/2026/04/22/kraken-cli-open-source-ai-agent-execution-engine-crypto-markets/)
- The official CCXT MCP design doc credits Kraken's official MCP with a tiered posture (market data without keys, then read-only, then opt-in trading) and adopted the same idea. — [ccxt/mcp/DESIGN.md](https://github.com/ccxt/ccxt/tree/master/mcp)

**Bitget, Bybit**
- By about 9 March 2026, Bitget's Agent Hub had Skills and CLI modules, so OpenClaw-connected agents could trade live. — [BlockEden: exchange AI agent skills war](https://blockeden.xyz/blog/2026/03/10/exchange-ai-agent-skills-war-binance-okx-bitget-mcp-trading/) (not fetched; from search summary)
- Bybit: no official agent skill or MCP found. One "bybit-trading" skill exists, created by openclaw (third party). — [mcp.directory bybit-trading](https://mcp.directory/skills/bybit-trading)

**Coinbase / x402 / on-chain agent kits**
- AgentKit (github.com/coinbase/agentkit) is open source and framework-agnostic (LangChain, ElizaOS and others). Agentic Wallets launched on 11 Feb 2026 with MPC wallets, session caps, spend limits and native x402. — [Cointelegraph](https://cointelegraph.com/news/coinbase-launches-crypto-wallets-built-ai-agents); [DEV: Coinbase MCP stack](https://dev.to/docdavkitty/coinbases-mcp-stack-how-ai-agents-got-wallets-trading-desks-and-an-sec-registration-5bcc)
- "Coinbase for Agents" launched on 11 June 2026. It links a Coinbase account so an agent can trade, pay (x402) and run workflows, and it comes with a registered "Coinbase Advisor". — [The Defiant](https://thedefiant.io/news/cefi/coinbase-for-agents-ai-accounts-trade-pay-x402); [The Next Web](https://thenextweb.com/news/coinbase-ai-agent-trading-x402-payments)
- One secondary source cites Coinbase figures of 165M x402 transactions and 69k active agents (April 2026). This is unverified against primary sources. — [madeonsol blog](https://madeonsol.com/blog/agentic-trading-2026-what-changed)
- Solana Agent Kit (SendAI) has 30+ Solana protocol integrations (Jupiter, Raydium, Orca, Pump.fun). GOAT is an action layer with 200+ on-chain tools across 11+ chains. ElizaOS is the runtime many teams pair with GOAT. — [CoinGape: Best Web3 AI agent frameworks 2026](https://coingape.com/best-web3-ai-agent-frameworks/)

**Hyperliquid (DEX perps)**
- Community MCPs: edkdev/hyperliquid-mcp (PyPI `mcp-hyperliquid`, agent-wallet approval through the Hyperliquid UI); Dakkshin/hyperliquid-mcp (orderbook and trade-flow signals, Monte Carlo risk, testnet-first); erscoder/hyperliquid-mcp (uvx, LangChain and CrewAI examples); and a Glama-listed server with 48 tools that include an emergency stop. Most are built on the official Python SDK. A common safety pattern is an API/agent wallet that signs for the main account, so the main key stays offline. — [LobeHub edkdev](https://lobehub.com/mcp/edkdev-hyperliquid-mcp); [PyPI mcp-hyperliquid](https://pypi.org/project/mcp-hyperliquid/); [mcpservers Dakkshin](https://mcpservers.org/servers/dakkshin/hyperliquid-mcp); [Glama 48-tool server](https://glama.ai/mcp/servers/@TradingBalthazar/hyperliquid-mcp-server-v9)

**Data MCPs**
- Glassnode: official MCP (beta) at mcp.glassnode.com with 7 tools and public and authenticated modes. — [Glassnode docs](https://docs.glassnode.com/guides-and-tutorials/glassnode-mcp-server)
- CoinGecko: official MCP with a free keyless hosted endpoint and a local `@coingecko/coingecko-mcp` (Pro/Demo key), over Streamable HTTP and SSE. Covers 200+ networks and 8M+ tokens. — [CoinGecko docs: MCP server](https://docs.coingecko.com/docs/ai-agent-hub/mcp-server.md)

**Alpha Arena (Nof1): LLMs trading real money on Hyperliquid**
- Season 1 ended on 3 Nov 2025. Six LLMs each had $10k on Hyperliquid perps. Qwen3-Max was first at +22.3%, DeepSeek V3.1 was reported at +4.9%, GPT-5 at -62.7% and Gemini 2.5 Pro at -56.7%. Most models lost money, and Gemini was noted for erratic flip-flopping and overtrading. — [Decrypt](https://decrypt.co/345006/ai-crypto-trading-showdown-deepseek-grok-winning-gemini-implodes); [Forklog](https://forklog.com/en/four-out-of-six-ai-models-suffer-losses-in-trading-tournament/); [Aurpay](https://aurpay.net/?p=23782)
- Nof1 called Season 1 exploratory: short duration, modest capital, no statistical controls. Its founder said it is "not yet feasible to directly hand over money to an LLM and let it trade on its own". — [KuCoin news](https://www.kucoin.com/news/flash/ai-trading-models-struggle-in-live-market-tests-majority-of-systems-report-losses); [Decrypt](https://decrypt.co/345006)
- Season 1.5 moved to US equities, with $320k across four competition modes ("monk mode", situational awareness, max-leverage) and news sentiment every 6 minutes. An anonymous "Mystery Model", later identified as xAI's Grok 4.20, won at about +12% aggregate. Reportedly only 6 of 32 individual results were profitable. — [Forklog: Grok 4.2 triumphs](https://forklog.com/en/ai-model-grok-4-2-triumphs-in-trading-tournament/); [ThinkAdvisor, May 2026](https://www.thinkadvisor.com/amp/2026/05/06/why-ai-bots-arent-ready-to-replace-your-fund-manager/)
- Season 2 is planned to add web search, longer reasoning, more data sources, multi-step execution and human competitors. No confirmed start date was found. — [Forklog: new season](https://forklog.com/en/new-season-of-ai-trading-tournament-kicks-off/)

**Research and competitions**
- CryptoTrade (EMNLP 2024, Li et al.) is a reflective LLM agent for zero-shot crypto trading that combines on-chain and off-chain data. Code is at Xtra-Computing/CryptoTrade. — [ACL Anthology](https://aclanthology.org/2024.emnlp-main.63/); [arXiv 2407.09546](https://arxiv.org/abs/2407.09546v1)
- Recall Network is a sandboxed paper-trading environment and API where agents enter competitions. — [Peerlist dev write-up](https://peerlist.io/harishh/articles/building-a-multiagent-crypto-trading-bot-with-local-llms-rec)

### Inferences
- Exchange-official toolkits are single-venue and compete for agent order flow. CCXT's differentiators are cross-venue features: comparing, routing, aggregating and unified schemas. The official ccxt-mcp's `fetch_route`/`execute_route` (OrderRouter) is already a step in that direction.
- Recurring features across the official toolkits are a CLI plus MCP pair, a skills bundle, a paper-trading or sandbox engine (Kraken), approvals before writes (OKX) and spend/session caps (Coinbase, Binance). They suggest that "CLI + MCP + skills + local paper engine" is the expected 2026 baseline.
- Alpha Arena points to guardrails such as leverage caps, trade-frequency throttles and journaling as more valuable than prompt engineering. Its own commentary says model choice mattered more than prompt.

### Gaps
- Virtuals and Giza: not researched (out of call budget). Kaito, Santiment, Nansen and CoinMarketCap MCPs: searches returned nothing on Nansen or Santiment; Kaito and CMC were not checked.
- ElizaOS: no authoritative 2026 trading plugin found.
- Full Alpha Arena Season 1 standings (Grok, Claude) vary across sources; only the figures above were consistent.
- Recall competition rules and results were not found.
- Bitget Agent Hub tool counts and safety model were not found.

## Existing CCXT-based MCP servers and skills (community and official): tools, gaps, complaints

### Takeaway
The official CCXT MCP (`ccxt-mcp`, in this repo's `mcp/`) is the most safety-hardened option. Its design log documents systematic flaws in six community CCXT MCPs: credentials passed as tool parameters, hardcoded exchange subsets, unbounded response sizes, rails that can be bypassed, per-call instances, and README/tool drift. Its own roadmap still lists portfolio aggregation as v2 and has no packaged analytic workflows (funding scans, slippage and similar).

### Cited Findings
- **Official `ccxt-mcp`** (npm, `npx -y ccxt-mcp`; docs at docs.ccxt.com/docs/mcp; source at ccxt/ccxt `mcp/`): runs over stdio and covers 100+ exchanges plus prediction markets. Public data is available with zero config. Accounts are named, so keys never appear as tool parameters, and outputs are redacted. Capability tiers (`trading`, `funds`, `implicitWrites`) are opt-in per account in the config file only. `trading: true` works on sandbox/demo only; live trading needs `"live"` plus a `maxOrderValue`. Writes are previewed and confirmed (elicitation first, otherwise an HMAC confirm token with a 60s TTL), validated against market limits and notional caps, and journaled to an append-only audit log. Withdrawals sit behind the `funds` tier with `maxTransferValue`. — [CCXT MCP docs](https://docs.ccxt.com/fr/docs/mcp); [github.com/ccxt/ccxt/tree/master/mcp](https://github.com/ccxt/ccxt/tree/master/mcp) (README.md and DESIGN.md read locally)
- Official tool surface (local README): about 12 always-on tools, rising to 28 with all tiers. They include `search_markets` (field projection, paginated), `call_read_method` (gated to `fetch*`/`load*`), `call_implicit_get`, `fetch_route`, and WebSocket `watch_*` streaming (cursor-based `watch_read`, 10-minute idle TTL). Trading tools are `create_order`, `edit_order`, `cancel_order`, `cancel_all_orders`, `set_leverage`, `set_margin_mode`, `call_write_method` and `execute_route`. Funds tools are `withdraw`, `transfer` and `get_deposit_address`. Batch `createOrders` is excluded so per-order caps can't be bypassed. `cancel_order` is never confirmed, so stale orders don't linger. Anthropic's directory rejects money-moving connectors, so the trading tiers ship only via npx/MCPB. — [ccxt/mcp](https://github.com/ccxt/ccxt/tree/master/mcp)
- Official roadmap: "v2: ... portfolio aggregation across accounts". — [ccxt/mcp DESIGN.md](https://github.com/ccxt/ccxt/tree/master/mcp)
- **doggybee/mcp-server-ccxt** (`@mcpfun/mcp-server-ccxt`, MIT, the most popular community server; DESIGN.md cites about 140 stars and about 511 downloads/month). Public tools are list-exchanges, get-ticker, batch-get-tickers, get-orderbook, get-ohlcv, get-trades, get-markets, get-leverage-tiers and get-funding-rates. Private tools are place-market/limit-order, futures orders, cancel, set-leverage/margin-mode and transfer-funds. Utility tools include cache-stats, proxy config and set-default-exchange. It uses LRU caching (ticker 10s, orderbook 5s, markets 1h) and adaptive rate limiting. It has no documented order confirmation, size limits or sandbox. — [GitHub doggybee/mcp-server-ccxt](https://github.com/doggybee/mcp-server-ccxt); [mcpservers.org](https://mcpservers.org/servers/doggybee/mcp-server-ccxt)
- Complaints about doggybee recorded in CCXT's design log: apiKey/secret are required per-call tool parameters, so secrets end up in transcripts; only 24 exchanges are hardcoded; the trading path rebuilds the instance and reloads markets on every order; the README documents about 10 tools that don't exist. — [ccxt/mcp DESIGN.md](https://github.com/ccxt/ccxt/tree/master/mcp)
- **lazy-dinosaur/ccxt-mcp** (`@lazydino/ccxt-mcp`): 20 tools plus 8 resources, a named multi-account JSON config, and trading-performance analysis (win rate, periodic returns) on account history. It has no backtester. CCXT's design log notes the plaintext config and no rails. — [Glama listAccounts](https://glama.ai/mcp/servers/@lazy-dinosaur/ccxt-mcp/tools/listAccounts); [README via jsDelivr](https://cdn.jsdelivr.net/gh/lazy-dinosaur/ccxt-mcp@master/README.md); [TypingMind listing](https://www.typingmind.com/mcp/ccxt-crypto-trading)
- Others: Nayshins/mcp-server-ccxt (Python, 7 read-only tools, 10 hardcoded exchanges); jcwleo/ccxt-mcp-server (Python FastMCP, tools split by auth); pcriadoperez/ccxt-mcp (per-call `testnet` boolean defaulting to live, stdout-corruption bug); PelleNybe/Crypto-MCP-Hub (HTTP on 0.0.0.0, approval queue that can be bypassed at execution); pedrobraiti/Valet (one exchange per process, but dry-run by default, live acknowledgement, caps and an intent journal, rated "best-in-class" rails). — [Glama jcwleo](https://glama.ai/mcp/servers/@jcwleo/ccxt-mcp-server/tree); [ecosyste.ms nayshins](https://awesome.ecosyste.ms/projects/github.com%2Fnayshins%2Fmcp-server-ccxt); [ccxt/mcp DESIGN.md prior-art table](https://github.com/ccxt/ccxt/tree/master/mcp)
- In-repo skills already shipped: `ccxt-mcp`, `ccxt-cli`, and per-language `ccxt-{typescript,python,php,csharp,go,java,rust}`. — `/home/user/ccxt/.claude/skills/`

### Inferences
- Gaps that remain even in the official server: no packaged multi-step workflows (cross-exchange spread/funding scans, depth/slippage estimates, portfolio aggregation, PnL/tax export), no backtest or paper engine (Kraken ships one), and no trade-frequency or leverage-cap rails of the kind Alpha Arena's failures suggest.
- Many community servers still carry the anti-patterns listed above. A published "how to safely build on CCXT for agents" guide or skill could improve the ecosystem.

### Gaps
- No public user complaints (GitHub issues, Reddit) were gathered for the official ccxt-mcp; its adoption numbers are unknown.
- I did not check smithery or mcp.so for further CCXT servers beyond the six in the design log plus jcwleo.

## Crypto-specific workflows worth packaging as CCXT skills/tools

### Takeaway
Existing products already cover workflows such as order routing (ccxt-mcp), funding-rate data (doggybee get-funding-rates), performance analysis (lazy-dinosaur), paper trading (Kraken CLI), strategy/backtest/deploy loops (Hummingbot/Condor, jesse-mcp, Freqtrade bridges) and token audit and smart-money feeds (Binance skills). A cross-venue CCXT skill bundle could compose these into named workflows.

### Cited Findings
- `fetch_route`/`execute_route` over CCXT's OrderRouter already gives cross-account best-execution routing with per-venue caps. — [ccxt/mcp](https://github.com/ccxt/ccxt/tree/master/mcp)
- Funding rates and leverage tiers are exposed as tools in doggybee's server. — [doggybee repo](https://github.com/doggybee/mcp-server-ccxt)
- Account performance analytics (win rate, periodic returns) appear in lazy-dinosaur. — [LobeHub listing](https://lobehub.com/en/mcp/lazy-dinosaur-ccxt-mcp)
- Orderbook and trade-flow signals plus Monte Carlo risk appear in a Hyperliquid MCP. — [mcpservers Dakkshin](https://mcpservers.org/servers/dakkshin/hyperliquid-mcp)
- A local paper-trading engine on live data ships in the Kraken CLI. — [Kraken blog](https://blog.kraken.com/news/industry-news/announcing-the-kraken-cli)
- Token security audit (honeypot and scam detection) and smart-money signal skills exist from Binance (installed locally as `query-token-audit`, `trading-signal`, `crypto-market-rank`). — [Binance Skills Hub](https://developers.binance.com/en/docs/sdks-tools/tools/skills-hub)
- Grid/DCA and market-making are core Hummingbot strategies driven by Condor agents. — [Condor overview](https://condor.hummingbot.org/trading-agents/overview)

### Inferences
Candidate CCXT workflow skills, each built from unified methods (fetchFundingRates, fetchOrderBook, fetchTickers, fetchOpenInterest, fetchLiquidations, fetchMyTrades, fetchBalance, fetchPositions):
- Funding/basis arbitrage scan across venues (perp funding versus spot or dated futures, annualised, net of fees).
- Cross-exchange price and liquidity comparison, plus slippage estimation for size X by walking the orderbook.
- Open-interest and liquidation monitor using the WS `watch_*` buffer.
- Portfolio aggregation across named accounts (already on the official v2 roadmap) and PnL/tax export from fetchMyTrades and ledger data.
- Grid/DCA "plan then confirm" templates on top of ccxt-mcp's confirm and journal rails.
- A paper/dry-run mode to match Kraken.

### Gaps
- I did not find quantified demand data (download counts, issue votes) for any single workflow.
- I did not search for dedicated tax/PnL reconciliation agent tools (Koinly, CoinTracker MCPs).

## Safety patterns (API keys, withdrawal disabled, sandbox, spending limits, human approval)

### Takeaway
Safety designs are converging on five measures:
- keys stay out of model context (named accounts, OS keychain, agent sub-wallets);
- capability tiers are opt-in and owned by config, not by the conversation;
- sandbox or paper trading comes first;
- notional, spend and session caps are enforced at the execution point;
- humans confirm writes, and every write is journaled.

Exchange-side measures (no withdrawal permission, IP allowlist) are the recommended backstop.

### Cited Findings
- **CCXT official:**
  - credentials are never tool parameters, and outputs pass a redaction filter;
  - the config file cannot be edited from the conversation;
  - live trading needs `"live"` plus `maxOrderValue`;
  - a failed elicitation fails closed, so the model can never confirm its own write;
  - deposit and withdraw address reads are gated behind the funds tier to prevent address-substitution scams;
  - recommended backstops are withdrawal-disabled keys and an IP allowlist;
  - the docs admit that a local agent with filesystem access could read the config file.

  — [ccxt/mcp README and DESIGN](https://github.com/ccxt/ccxt/tree/master/mcp)
- OKX: credentials are kept from the LLM, and writes need explicit user approval. — [OKX agent-trade-kit](https://github.com/okx/agent-trade-kit)
- Coinbase Agentic Wallets: MPC custody, session caps and spend limits. — [Cointelegraph](https://cointelegraph.com/news/coinbase-launches-crypto-wallets-built-ai-agents)
- Binance Agent OS: the agent trades on the user's account "with limits you set", and liability sits with the user. — [HackerNoon](https://hackernoon.com/binance-launches-agent-os-letting-ai-agents-trade-on-your-account-with-limits-you-set)
- Hyperliquid: an approved agent/API wallet signs trades, and the main key stays offline. — [LobeHub edkdev](https://lobehub.com/mcp/edkdev-hyperliquid-mcp)
- Kraken: paper trading, and the MCP reads the CLI's stored key. — [Kraken docs MCP](https://docs.kraken.com/home/mcp)
- Condor: guardrails the agent cannot bypass. — [Condor docs](https://condor.hummingbot.org/trading-agents/overview)
- Valet (community CCXT MCP): dry-run by default, live acknowledgement, caps and an intent journal. — [ccxt/mcp DESIGN.md](https://github.com/ccxt/ccxt/tree/master/mcp)
- The ccxt repo's contributor rules cap live tests at 25 USD per trade and ban live `withdraw()` calls entirely. — `/home/user/ccxt/CLAUDE.md`

### Inferences
- Rails still missing from the official CCXT MCP, prompted by Alpha Arena's overtrading and leverage blow-ups: max leverage per account, trades-per-hour throttles, a daily-loss kill switch and an emergency "flatten all" tool. The Glama Hyperliquid server ships an emergency stop.

### Gaps
- I found no incident reports or postmortems of an agent-tooling security breach (for example, leaked keys through an MCP) to cite.
