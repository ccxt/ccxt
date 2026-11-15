# LLM Multi-Agent Trading Frameworks: Workflow Architectures (as of 2026-11-15)

Method note: GitHub pages were fetched directly. arxiv.org could not be fetched from this session (DNS blocked), so paper details come from search-result snippets of arXiv/ACL/NeurIPS pages and from secondary summaries (Emergent Mind, The Moonlight). Those are flagged where they matter. Star counts are snapshots from November 2026.

## 1. TauricResearch/TradingAgents: roles, LangGraph flow, data, config, crypto, results, versions

### Takeaway
TradingAgents is the reference "simulated trading firm" design. It runs parallel analyst agents, a bull/bear researcher debate, a trader, a risk debate and a portfolio-manager gate. It is built on LangGraph, splits LLMs into deep-think and quick-think tiers, and since v0.5 (Sep 2026) has focused on point-in-time data integrity. Crypto only works through Yahoo-style tickers (`BTC-USD`); there is no exchange or CCXT integration upstream, but several community forks add CCXT.

### Cited Findings
- **Roles.** The analyst team runs in parallel: Fundamentals; Sentiment (news headlines, StockTwits, Reddit); News (global and macro); and Technical (MACD, RSI, etc.). Bullish and bearish researchers debate the analyst reports. The Trader turns the reports and debate into a decision on timing and size. The Risk Management team and the Portfolio Manager then assess risk and approve or reject the proposal. Approved orders go to a *simulated* exchange. — [GitHub README](https://github.com/TauricResearch/TradingAgents)
- **LangGraph flow.** Analysts, then the research debate (which starts once every analyst report is in), then trader, risk review, portfolio manager and simulated execution. Opt-in checkpoints can be saved after each node so a run can resume. — [GitHub README](https://github.com/TauricResearch/TradingAgents)
- **Data vendors.** Yahoo Finance (prices, non-US statements, news search); SEC EDGAR (US filings dated as filed, no key needed); Alpha Vantage; FRED (macro); Polymarket; StockTwits and Reddit (social); optional "TypeSafe Jev" post screening. — [GitHub README](https://github.com/TauricResearch/TradingAgents)
- **Config keys.** `llm_provider`, `deep_think_llm` (managers and complex reasoning), `quick_think_llm` (analysts, researchers, trader), separate per-tier providers (`deep_think_provider` / `quick_think_provider`), `max_debate_rounds`, `max_risk_rounds`, `temperature`, `checkpoint_enabled`, `backend_url`. — [GitHub README](https://github.com/TauricResearch/TradingAgents)
- **LLM providers.** OpenAI, Google, Anthropic, xAI, DeepSeek, Qwen, GLM, MiniMax, OpenRouter, Mistral, Kimi, Groq, NVIDIA NIM, Ollama, Azure OpenAI, AWS Bedrock, ChatGPT Plus/Pro subscriptions, and any OpenAI-compatible endpoint. — [GitHub README](https://github.com/TauricResearch/TradingAgents)
- **Crypto.** Supported via Yahoo-style tickers (`BTC-USD`, `ETH-USD`). The v0.3.1 changelog mentions "working crypto sentiment sources". There is no exchange connectivity and no CCXT. — [GitHub README](https://github.com/TauricResearch/TradingAgents)
- **Version history (newest first):**
  - 2026-11: Trading-R1 v0.1.0 released, with early access.
  - 2026-10, v0.7.1: decisions scored on final closes.
  - 2026-10, v0.7.0: ChatGPT plan support; backtests scored from the first close after each decision.
  - 2026-10, v0.6.0: HTML reports; per-tier providers.
  - 2026-09, v0.5.2: parallel analysts; non-interactive CLI; point-in-time backtests.
  - 2026-09, v0.5.0: point-in-time integrity; SEC EDGAR fundamentals; backtesting grid; portfolio-aware runs.
  - 2026-08, v0.4.0: look-ahead fixes; checkpoint resume.
  - 2026-06, v0.3.0: FRED and Polymarket vendors.
  - 2026-04, v0.2.4: structured-output agents; decision log; Docker.
  - 2026-02, v0.2.0: multi-provider support.

  — [GitHub README](https://github.com/TauricResearch/TradingAgents)
- **Repo stats.** About 122.7k stars, 23.5k forks, Apache-2.0. Paper is arXiv 2412.20138. — [GitHub](https://github.com/TauricResearch/TradingAgents). One aggregator cited ">93K stars" earlier in 2026 — [themenonlab blog](https://themenonlab.blog/blog/ai-finance-github-repos-march-2026)
- **README results.** The README gives no performance figures. It says returns depend on model, temperature, date range and data quality. The built-in backtest scores realized alpha against regional benchmarks. — [GitHub README](https://github.com/TauricResearch/TradingAgents)
- **Paper results (secondary).** The paper reports at least 23.21% cumulative and 24.90% annual return on AAPL/GOOGL/AMZN, beating the best baselines (KDJ&RSI, ZMR, SMA, MACD, buy-and-hold) by 6.1%. One blog cites Sharpe ≥ 5.60, which I could not verify. Sources conflict on the test window (Jan–Mar 2024 vs Jun–Nov 2024). Slippage is not modelled. — [arXiv 2412.20138 PDF (search snippet)](https://arxiv.org/pdf/2412.20138); [project page](https://tradingagents-ai.github.io); [stork.ai blog](https://stork.ai/blog/this-ai-argues-its-way-to-profit)
- **Community crypto forks:**
  - *TradingAgents-CryptoA* uses **CCXT** (Binance/OKX/Bybit) with LangGraph orchestration.
  - *auronsun/TradingAgents-crypto* adds on-chain, Reddit and NFT analysts.
  - *Tomortec/CryptoTradingAgents* applies the TradingAgents design to crypto.
  - *CryptoFunk* (Go, MCP) uses **CCXT** and weighted-vote consensus.

  — [search results: CryptoA](https://gh.r-mj.com/OK-computer008/TradingAgents-CryptoA), [TradingAgents-crypto](https://github.com/auronsun/TradingAgents-crypto), [cryptofunk](https://gh.r-mj.com/ajitpratap0/cryptofunk); [awesome-trading-agents](https://github.com/LLMQuant/awesome-trading-agents)
- **Other derivatives.** TradingAgents-CN (A-shares), TradingAgents-AShare (15 agents), AlpacaTradingAgent (US equities via Alpaca), and TradingAgents-MCPmode (refactored as MCP tools). — [awesome-trading-agents](https://github.com/LLMQuant/awesome-trading-agents)

### Inferences
- Patterns a CCXT skill could copy directly:
  - Per-node checkpoints so long runs can resume.
  - Separate deep and quick LLM tiers to cut cost.
  - Configurable debate and risk rounds.
  - A structured decision log.
  - Scoring each decision from the *next* close after it, which avoids same-bar look-ahead.
- CCXT could fill the data-vendor slot for crypto: OHLCV, order book, funding rates and open interest replace Yahoo tickers. CCXT could also replace the "simulated exchange" through sandbox or testnet. Forks show both patterns already work.
- The project's history from v0.4 to v0.7 (look-ahead fixes, then point-in-time data, then next-close scoring) suggests early backtests were contaminated. Treat paper-era numbers as optimistic.

### Gaps
- I could not read the exact paper Table 1 (per-ticker Sharpe or max drawdown) or the test window because arxiv.org was unreachable.
- No upstream TradingAgents results on crypto were found.

## 2. TauricResearch/Trading-R1: training approach, thesis output, dataset, reusability

### Takeaway
Trading-R1 (arXiv 2509.11420, Sep 2025) distills the multi-agent analysis into one small reasoning model: Qwen3-4B trained with a three-stage SFT+RL (GRPO) curriculum. The stages move from thesis structure, to evidence-backed claims, to market-aligned decisions. The training data is a 100k-sample, 5-source corpus covering 14 equities. The open repo now ships a terminal app that needs a Tauric API key, so it is a product shell rather than open weights or a training pipeline.

### Cited Findings
- **Paper.** "Trading-R1: Financial Trading with LLM Reasoning via Reinforcement Learning" by Xiao, Sun, Chen, Wu, Luo and Wang (2025), arXiv 2509.11420. — [GitHub](https://github.com/TauricResearch/Trading-R1)
- **Dataset.** Tauric-TR1-DB has 100k samples covering 18 months (2024-01-01 to 2025-05-31) and 14 equities. It draws on five sources: technical, fundamental, news, sentiment and macro. — [The Moonlight review](https://www.themoonlight.io/en/review/trading-r1-financial-trading-with-llm-reasoning-via-reinforcement-learning); [Emergent Mind](https://www.emergentmind.com/papers/2509.11420)
- **Training.** The backbone is Qwen3-4B. A three-stage easy-to-hard curriculum interleaves SFT with reinforcement fine-tuning using GRPO. The stages are: structure, then claim substantiation (evidence-grounded thesis), then market-aligned decision. — [The Moonlight](https://www.themoonlight.io/en/review/trading-r1-financial-trading-with-llm-reasoning-via-reinforcement-learning); [Emergent Mind](https://www.emergentmind.com/papers/2509.11420)
- **Evaluation (secondary).**
  - Held-out backtest from 2024-06-01 to 2024-08-31 on NVDA, AAPL, MSFT, AMZN, META and SPY.
  - Reported ordering: SLM < RLM < LLM < Trading-SFT ≈ Trading-RFT < Trading-R1.
  - On NVDA: Sharpe 2.72, return 8.08%, hit rate 70%.

  These numbers are not verified against the primary paper. — [Emergent Mind](https://www.emergentmind.com/papers/2509.11420)
- **Repo status.** Public under Apache-2.0, about 702 stars. It provides the `trading-r1` terminal app (`pip install trading-r1`), which needs a Tauric API key. Research and education only. — [GitHub](https://github.com/TauricResearch/Trading-R1). The TradingAgents README lists "2026-11: Trading-R1 v0.1.0 released; early access open" and a "2026-01: Trading-R1 technical report" entry. — [TradingAgents README](https://github.com/TauricResearch/Trading-R1)

### Inferences
- What can be reused for CCXT work:
  - **Output schema.** A structured investment thesis with sections and claims tied to cited evidence, ending in a discrete decision. This is a good contract for any CCXT "analysis" skill.
  - **Training recipe.** Reward first for format, then for grounded claims, then for decision accuracy.
- Retraining for crypto would need a crypto analogue of TR1-DB, for example OHLCV and funding data from CCXT plus news and on-chain data. A 4B model makes local or cheap inference realistic.
- A three-month, six-ticker test window is very short. Treat the results as indicative only.

### Gaps
- I could not verify the exact thesis format or sections, the reward definitions, or whether weights or the dataset are public (the README needs an API key). Check arXiv 2509.11420 and the repo's MANUAL.md or CHANGELOG.md.
- No crypto evaluation was found.

## 3. Notable projects/papers (from LLMQuant/awesome-trading-agents and the literature)

### Takeaway
The field has split into four groups:
- **Academic persona/memory agents** (2023–2025): FinMem, FinAgent, FinCon, CryptoTrade, MarketSenseAI, QuantAgent.
- **Popular open-source "AI hedge fund" graphs**: TradingAgents, ai-hedge-fund and their crypto forks.
- **Automated quant R&D (code-generating) agents**: RD-Agent(Q), AlphaEvolve-style projects.
- **A 2026 wave of MCP servers and SKILL.md packs** from exchanges themselves (OKX, Kraken, Polymarket), plus live arenas (Alpha Arena) on Hyperliquid.

Crypto is common in community projects and rare in academic ones (CryptoTrade, FinAgent's ETHUSD, QuantAgent's BTC).

### Cited Findings (catalogue)

**1. virattt/ai-hedge-fund**
- **Purpose.** A LangGraph "investment committee". Investor-persona analysts (Buffett, Munger, Graham, Cathie Wood and others) plus valuation, sentiment, fundamentals and technical agents produce signals. A Risk Manager sets position limits, and a Portfolio Manager outputs buy/sell/hold with sizing. Agent counts vary by source (14, 18 or 19). — [reskilll blog](https://blogs.reskilll.com/ai-hedge-fund-the-50k-star-open-source-multi-agent-investment-system/); [pyshine](https://pyshine.com/AI-Hedge-Fund-Multi-Agent-Investment-System/)
- **Data.** Financial Datasets API, or pay-per-call in USDC on Base via x402.
- **LLMs.** Anthropic, OpenAI, DeepSeek, Google, xAI, Kimi.
- **Backtester.** Replays a fund against a benchmark.
- **Execution.** "The system does not actually make any trades." Educational.
- **Stats.** About 64.7k stars.
- **Crypto.** None mentioned upstream.

— [GitHub](https://github.com/virattt/ai-hedge-fund)

**2. 51bitquant/ai-hedge-fund-crypto**
- **Purpose.** A crypto fork of ai-hedge-fund.
- **Architecture.** A LangGraph DAG: start node, per-timeframe data nodes (5m to 1d), a merge node, strategy nodes (MACD, RSI, Bollinger; trend, mean-reversion, momentum, volatility and stat-arb ensemble), a risk node, and an LLM portfolio-manager node. Everything is configured in `config.yaml`.
- **Data.** Binance API directly, not CCXT.
- **Modes.** Backtest and live signal generation. The README contradicts itself on whether live order execution exists ("Real Trading Integration (Planned)").
- **Stats.** About 628 stars.

— [GitHub](https://github.com/51bitquant/ai-hedge-fund-crypto)

**3. FinMem** (arXiv 2311.13743)
- **Architecture.** A single agent with three modules:
  - Profiling, which sets the persona or risk character.
  - Layered memory, with hierarchical short-, mid- and long-term memory of market information.
  - Decision-making.
- **Claim.** The memory design mirrors how human traders think, which aids interpretability.
- **Crypto.** Was a baseline that beat FinAgent on ETHUSD.

— [FinMem PDF](https://suchow.io/assets/docs/yu2024finmem.pdf); [FinAgent summary](https://arxiv.org/html/2402.18485v3)

**4. FinAgent** (arXiv 2402.18485)
- **Architecture.** A multimodal (charts plus text), tool-augmented foundation agent with *dual-level reflection*. The low level reflects on market dynamics and price correlations; the high level reviews its own past decisions and strategy.
- **Results.** Tested on six datasets (stocks and ETHUSD). Reports a >36% average profit improvement over baselines and up to 92.27% return on one dataset.
- **Crypto.** Slightly underperformed FinMem on ETHUSD. The authors blame auxiliary agents tuned for stocks.

— [arXiv HTML](https://arxiv.org/html/2402.18485v3); [liner review](https://liner.com/review/multimodal-foundation-agent-for-financial-trading-toolaugmented-diversified-and-generalist)

**5. FinCon** (NeurIPS 2024, arXiv 2407.06567)
- **Architecture.** A manager–analyst hierarchy modelled on an investment firm. A risk-control component supervises each episode with CVaR, and across episodes runs "conceptual verbal reinforcement": self-critique that updates the team's investment beliefs. Covers single-stock trading and portfolio management.

— [NeurIPS proceedings](https://proceedings.neurips.cc/paper/2024/hash/f7ae4fe91d96f50abc2211f09b6a7e49-Abstract-Conference.html); [arXiv HTML](https://arxiv.org/html/2407.06567v2)

**6. CryptoTrade** (EMNLP 2024, arXiv 2407.09546)
- **Purpose.** Explicitly crypto. A zero-shot reflective agent that combines on-chain statistics and off-chain news for BTC, ETH and SOL.
- **Agents.** A market analyst (on-chain), a news analyst (GNews), a trading agent (buy/sell/hold) and a reflection agent that reviews past decisions.
- **Data.** CoinMarketCap.
- **Results.** Reports beating traditional and time-series baselines.
- **Code.** Xtra-Computing/CryptoTrade.
- **Conflict.** Secondary sources disagree on the model used (GPT-3.5 vs GPT-4).

— [ACL Anthology](https://aclanthology.org/2024.emnlp-main.63/); [arXiv HTML](https://arxiv.org/html/2407.09546v1); [The Moonlight](https://www.themoonlight.io/review/a-reflective-llm-based-agent-to-guide-zero-shot-cryptocurrency-trading)

**7. QuantAgent** (arXiv 2509.09995)
- **Purpose.** Price-only, multi-agent LLM for high-frequency trading.
- **Agents.** Indicator, Pattern, Trend and Risk, communicating through structured prompts. No news or sentiment.
- **Results.** Across nine instruments, including Bitcoin and Nasdaq futures, it beat baselines on prediction accuracy at 1h and 4h intervals.
- **Weakness.** Accuracy degrades at 1–15 minute bars because of noise.

— [arXiv abs](https://arxiv.org/abs/2509.09995); [liner review](https://liner.com/review/quantagent-pricedriven-multiagent-llms-for-highfrequency-trading)

**8. Microsoft RD-Agent / RD-Agent(Q)** (NeurIPS 2025 D&B, arXiv 2505.15155)
- **Architecture.** An automated quant R&D loop. A Research stage generates hypotheses and tasks. A Development stage (the Co-STEER code agent) writes factor and model code and runs real-market backtests. Feedback is scheduled by a multi-armed bandit.
- **Results.** Up to 2× annualized return versus classical factor libraries with 70% fewer factors, at under $10 cost (the cost figure is from the README).

— [NeurIPS](https://papers.nips.cc/paper_files/paper/2025/hash/ac5c2b6e423883cbcacbcccf88491b78-Abstract-Datasets_and_Benchmarks_Track.html); [Microsoft Research](https://www.microsoft.com/en-us/research/?p=1153361); [PyPI rdagent](https://pypi.org/project/rdagent/)

**9. FinRobot** (AI4Finance, arXiv 2405.14767 and 2411.08804)
- **Architecture.** A four-layer platform:
  - Financial AI Agents layer, using Financial Chain-of-Thought.
  - Model application strategies.
  - LLMOps/DataOps.
  - Multi-LLM foundation access.
- **Equity-research variant.** A multi-layer CoT that mimics a sell-side analyst. Evaluated by experts plus GPT-4 as grader.
- **Conflict.** One summary says the equity-research variant has three layers.

— [arXiv 2405.14767](https://arxiv.org/html/2405.14767v1); [arXiv 2411.08804](https://arxiv.org/html/2411.08804v1); [awesome list](https://github.com/LLMQuant/awesome-trading-agents)

**10. MarketSenseAI** (arXiv 2401.03737; Neural Computing and Applications 2024)
- **Approach.** GPT-4 stock selection using CoT plus in-context learning over news, fundamentals, price trend and macro.
- **Results.** Over a 15-month S&P 100 test: 10–30% excess alpha and up to 72% cumulative return (the MS-Top10-Cap-GPT variant, after costs).

— [arXiv](https://arxiv.org/abs/2401.03737); [UniPi DAC](https://dac.ds.unipi.gr/?p=5160)

**11. Alpha Arena (nof1) and its reimplementations**
- **Setup.** A live benchmark. Six LLMs each received $10k on Hyperliquid perps, 2025-10-17 to 2025-11-03.
- **Results.** Qwen3 Max won (about +22%). Most models lost. GPT-5's loss is reported as about −29% by Decrypt and −62.66% by another source, which conflict. Organizers noted Season 1 limits: short context, no memory of past actions, no position scaling.
- **Clones.** wquguru/nof0 (Go, Hyperliquid) and alpha-arena-okx (OKX).

— [Decrypt / Yahoo](https://finance.yahoo.com/news/ai-crypto-trading-showdown-deepseek-202512124.html); [Forklog](https://forklog.com/en/four-out-of-six-ai-models-suffer-losses-in-trading-tournament/); [awesome list](https://github.com/LLMQuant/awesome-trading-agents)

**12. Other crypto-native entries in the awesome list** — [awesome-trading-agents](https://github.com/LLMQuant/awesome-trading-agents)
- **Agents.** olaxbt/ai-market-maker (agentic crypto hedge fund with risk guard and paper trading); EthanAlgoX/LLM-TradeBot (multi-agent, Binance execution, strategy switching); MAHORAGA (TypeScript, social sentiment); Gajesh2007/ai-trading-agent (single LLM on Hyperliquid); crypto-trading-arena (Claude agents competing on live data).
- **Terminals.** NoFxAiOS/nofx: LLM decides, the runtime enforces hard risk limits.
- **Workspaces.** ValueCell (Binance/OKX/Hyperliquid); HKUDS/AI-Trader (agents trade via SKILL.md); HKUDS/Vibe-Trading (Skills, MCP, swarm presets).
- **Official exchange tooling.** okx/agent-trade-kit (MCP for spot, perps, options and grid); krakenfx/kraken-cli (embedded MCP plus 50 SKILL.md packs); okx/onchainos-skills; Polymarket/agent-skills.
- **Memory.** mnemox-ai/tradememory-protocol: an MCP server that records trade rationale and outcomes.

**13. Benchmarks**
- live-trade-bench (UIUC); DeepFund (arXiv 2505.11065, a live fund benchmark with an analyst leaderboard); Open-Finance-Lab/AgenticTrading. — [awesome list](https://github.com/LLMQuant/awesome-trading-agents)

### Inferences
- **CCXT appears in only a few community forks** (TradingAgents-CryptoA, CryptoFunk). Most crypto agents hard-wire one venue (Binance, Hyperliquid or OKX). Exchanges such as OKX and Kraken now ship their own MCP or skill packs. A venue-neutral CCXT-based MCP or skill set is a clear gap in this ecosystem.
- **Kraken's SKILL.md packs and HKUDS/AI-Trader** show that "skills as the trading interface" is now an established pattern, directly relevant to building CCXT skills.

### Gaps
- StockAgent (arXiv 2407.18957) and FinGPT details were not retrieved; searches returned nothing usable.
- Star counts were not collected for most academic repos.
- ai-hedge-fund's exact current agent roster is unverified from the primary repo.

## 4. Recurring design patterns and known failure modes

### Takeaway
Six patterns recur:
- Persona and role specialization (analysts by data modality or investor style).
- Adversarial bull/bear and risk debates.
- Hierarchical manager approval gates.
- Reflection or verbal-reinforcement memory.
- Tool-using code generation for factors and backtests.
- A deterministic risk layer outside the LLM.

The dominant criticism is contaminated evaluation. Parametric look-ahead (the model already "knows" the history) and data leakage inflate backtests, and Sharpe ratios reportedly drop 50–72% after the model's knowledge cutoff. Short test windows, missing slippage and live-arena losses add to the doubt.

### Cited Findings
- **Persona/role specialization.** TradingAgents splits analysts by data type ([GitHub](https://github.com/TauricResearch/TradingAgents)). ai-hedge-fund splits them by investor style ([reskilll](https://blogs.reskilll.com/ai-hedge-fund-the-50k-star-open-source-multi-agent-investment-system/)). QuantAgent splits technical analysis into four agents ([arXiv](https://arxiv.org/abs/2509.09995)).
- **Adversarial debate.** TradingAgents runs bull/bear researchers plus a risk debate with configurable rounds ([GitHub](https://github.com/TauricResearch/TradingAgents)). ContestTrade has agents compete internally before one view is chosen ([awesome list](https://github.com/LLMQuant/awesome-trading-agents)).
- **Hierarchy and approval gates.** In TradingAgents, the portfolio manager approves or rejects ([GitHub](https://github.com/TauricResearch/TradingAgents)). FinCon uses a manager–analyst hierarchy ([NeurIPS](https://proceedings.neurips.cc/paper/2024/hash/f7ae4fe91d96f50abc2211f09b6a7e49-Abstract-Conference.html)). OpenAlice has an approval workflow ([awesome list](https://github.com/LLMQuant/awesome-trading-agents)).
- **Reflection and memory.** FinMem uses layered memory ([PDF](https://suchow.io/assets/docs/yu2024finmem.pdf)). FinAgent uses dual-level reflection ([arXiv](https://arxiv.org/html/2402.18485v3)). FinCon uses cross-episode belief updates and CVaR ([arXiv](https://arxiv.org/html/2407.06567v2)). CryptoTrade has a reflection agent ([arXiv](https://arxiv.org/html/2407.09546v1)). Alpha Arena S1 was criticized for having no memory of past actions ([Forklog](https://forklog.com/en/four-out-of-six-ai-models-suffer-losses-in-trading-tournament/)).
- **Code-generating quant agents.** RD-Agent(Q) runs a research → code → backtest → bandit-feedback loop ([NeurIPS](https://papers.nips.cc/paper_files/paper/2025/hash/ac5c2b6e423883cbcacbcccf88491b78-Abstract-Datasets_and_Benchmarks_Track.html)). pwb-alphaevolve and Hyper-Alpha-Arena (86 validated factors, perps) follow similar loops ([awesome list](https://github.com/LLMQuant/awesome-trading-agents)).
- **Deterministic risk outside the LLM.** nofx: "LLMs decide and a runtime enforces risk limits". kalshi-ai-trading-bot uses a five-gate risk engine. polymarket-mcp-server has order-safety guards. — [awesome list](https://github.com/LLMQuant/awesome-trading-agents)
- **Structured outputs and cost tiers.** TradingAgents added structured-output agents in v0.2.4 and has had deep/quick LLM tiers since its early versions ([GitHub](https://github.com/TauricResearch/TradingAgents)). Trading-R1 trains structured theses ([Emergent Mind](https://www.emergentmind.com/papers/2509.11420)).
- **Failure mode: look-ahead and memorization.**
  - Look-Ahead-Bench (Jan 2026) finds standard LLMs suffer severe alpha decay compared with point-in-time models, and most published LLM agents fail to beat baselines after their knowledge cutoff ([arXiv 2601.13770](https://arxiv.org/pdf/2601.13770); [Moonlight review](https://www.themoonlight.io/review/look-ahead-bench-a-standardized-benchmark-of-look-ahead-bias-in-point-in-time-llms-for-finance)).
  - "Parametric look-ahead" (May 2026, FinCAD): a model with a 2025 cutoff has already seen how NVDA, MSFT and NFLX moved over 2010–2020 ([arXiv 2605.24564](https://arxiv.org/abs/2605.24564)).
  - Reported Sharpe drops of 50–71.85% after the knowledge window closes (Li et al., Oct 2025, cited secondarily) ([hedgefundalpha](https://hedgefundalpha.com/education/your-llms-alpha-might-be-mere-memorization/)).
  - FINSABER tracks survivorship, data-snooping and leakage biases ([arXiv 2605.24564](https://arxiv.org/pdf/2605.24564)).
  - BlindTrade anonymizes tickers ([arXiv 2603.17692](https://arxiv.org/html/2603.17692)).
- **Failure mode: backtest realism.** TradingAgents does not model slippage, and its tests cover three tickers ([stork.ai](https://stork.ai/blog/this-ai-argues-its-way-to-profit)). Trading-R1's test window is three months ([Emergent Mind](https://www.emergentmind.com/papers/2509.11420)). TradingAgents' own changelog shows a series of look-ahead, point-in-time and next-close scoring fixes in v0.4–v0.7 ([GitHub](https://github.com/TauricResearch/TradingAgents)).
- **Failure mode: live performance.** In Alpha Arena S1, most of six frontier LLMs lost money on Hyperliquid over two weeks ([Forklog](https://forklog.com/en/four-out-of-six-ai-models-suffer-losses-in-trading-tournament/); [Decrypt/Yahoo](https://finance.yahoo.com/news/ai-crypto-trading-showdown-deepseek-202512124.html)).
- **Failure mode: noise at high frequency.** QuantAgent's accuracy drops at 1–15 minute bars ([liner](https://liner.com/review/quantagent-pricedriven-multiagent-llms-for-highfrequency-trading)).
- **Failure mode: domain transfer.** FinAgent's stock-tuned tools underperformed on ETHUSD ([arXiv](https://arxiv.org/html/2402.18485v3)).

### Inferences
- **Point-in-time data.** CCXT `fetchOHLCV` with `since`/`until`, plus timestamped trades and funding history, gives point-in-time inputs. For crypto, a strict "data available as of T" wrapper is the cheapest defence against input leakage. Parametric look-ahead needs evaluation after the model's cutoff, or live paper trading via CCXT sandbox mode.
- **Recommended skill shape:**
  1. Data-gathering tools: CCXT market data plus news.
  2. Parallel analyst prompts.
  3. An optional bull/bear debate.
  4. A structured thesis and decision as JSON.
  5. A *deterministic* risk gate in code, not in the LLM: notional caps, leverage limits, precision and `amountToPrecision`, minimum order size.
  6. Execution via CCXT with a human or approval step.
  7. A decision log or memory of outcomes, used for reflection.
- **Cost and latency.** Multi-round debates multiply LLM calls per decision. TradingAgents' deep/quick tiering and Trading-R1's 4B distillation are two answers to this. Both point to LLM agents suiting hourly or slower decisions, not HFT.
- **Hallucinated numbers.** I found no primary source that quantifies this. Pushing all numbers through tools, as with structured outputs and SEC EDGAR "as filed" data, is the common mitigation.

### Gaps
- I found no primary source quantifying hallucinated-number rates in trading agents.
- I found no published per-decision cost or latency figures for TradingAgents.
- The FINSABER paper itself was not retrieved; it is known only through citation.
