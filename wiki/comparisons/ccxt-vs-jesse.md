<!-- title: CCXT vs Jesse -->
<!-- description: Jesse is a Python crypto strategy framework covering about ten venues; CCXT is an exchange client for 104. Compared on coverage, licence, deps and scope. -->
<!-- group: Multi-exchange libraries and frameworks -->
<!-- summary: Jesse hands you the whole research loop — backtest, optimise, Monte Carlo, live sessions — over roughly ten venues, using its own drivers and no CCXT dependency. CCXT gives you 104 venues and no strategy layer. -->
<!-- weight: 36 -->

# CCXT vs Jesse

[Jesse](https://github.com/jesse-ai/jesse) calls itself "an advanced crypto trading bot written in Python" on GitHub, and in its README "an advanced crypto trading framework that aims to simplify researching and defining YOUR OWN trading strategies for backtesting, optimizing, and live trading." [CCXT](/docs/manual) is a library that talks to exchanges. Jesse is an application you run — a self-hosted dashboard backed by PostgreSQL and Redis, with a strategy class, a backtester, an optimiser and live sessions.

Jesse does not depend on CCXT. It ships its own venue drivers. So the comparison is not "which client" but **how much of your trading system do you want supplied for you, and how many venues do you need to reach?**

## TL;DR

- **Pick Jesse** if you are writing crypto strategies in Python and want the research loop handed to you: backtesting without look-ahead bias, Optuna-based optimisation, Monte Carlo analysis, rule significance testing, an ML pipeline, 300+ indicators and a dashboard to run it all in. CCXT supplies none of that.
- **Pick CCXT** if your venue is not among the ten or so Jesse supports, if you need a language other than Python, or if you are building something that is not a candle-driven strategy — a market-data pipeline, an arbitrage scanner, an accounting service, an exchange integration inside a larger product.
- **They are complementary, and the seam is documented.** Jesse's research API exposes `store_candles()` specifically so you can load history from outside sources; CCXT's `fetch_ohlcv` across 104 venues is exactly such a source.

## At a glance

| | **CCXT** | **Jesse** |
| --- | --- | --- |
| What it is | unified exchange client (market data + trading) | crypto strategy framework: backtest, optimise, live |
| Venue coverage | 104 exchanges with REST, 76 with WebSocket, plus 7 prediction-market venues | 12 exchange/market sources for candle import; 16 exchange/market entries for live trading |
| Backtesting | none | yes — the core feature |
| Optimisation, Monte Carlo, ML | none | Optuna + Ray optimisation, Monte Carlo, rule significance testing, scikit-learn pipeline |
| Indicators | none | 300+, with native Rust implementations |
| Strategy model | none — you write the loop | `Strategy` subclass with `should_long`, `go_long`, `self.buy`, `self.take_profit`, `self.stop_loss` |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java, Rust | Python (docs state `>= 3.10 and <= 3.13`) |
| Infrastructure required | none — `pip install ccxt` | PostgreSQL >= 10, Redis >= 5, a Jesse project directory; dashboard served on port 9000 |
| Raw endpoint access | yes — every venue endpoint as an implicit method (808 for Binance) | not exposed; the driver surface is what you get |
| Live trading component | in the same MIT package | separate `jesse_live` plugin installed via `jesse install-live`, requiring a `LICENSE_API_TOKEN` from a jesse.trade account |
| Licence | **MIT** | **MIT** for the repository |
| Popularity | 43.8k GitHub stars · 4.68M PyPI + 494k npm installs/month | 8.4k GitHub stars · 10.3k PyPI installs/month |
| Support | Discord, Telegram, GitHub issues | Discord, help centre, GitHub issues |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, the Jesse GitHub repository and `master` branch (last commit 2 September 2026, `setup.py` VERSION "3.1.0"), docs.jesse.trade, and install counts from npm and PyPI.</sub>

## The same job, written both ways

### A moving-average crossover

<!-- tabs:start -->

#### **Jesse**

```python
class GoldenCross(Strategy):
    def should_long(self):
        short_ema = ta.ema(self.candles, 8)
        long_ema = ta.ema(self.candles, 21)
        return short_ema > long_ema

    def go_long(self):
        entry_price = self.price - 10
        qty = utils.size_to_qty(self.balance * 0.05, entry_price)
        self.buy = qty, entry_price
        self.take_profit = qty, entry_price * 1.2
        self.stop_loss = qty, entry_price * 0.9
```

#### **CCXT**

```python
import ccxt

exchange = ccxt.binance({'apiKey': '...', 'secret': '...'})
candles = exchange.fetch_ohlcv('BTC/USDT', '1h', limit=200)
closes = [c[4] for c in candles]

fast = sum(closes[-8:]) / 8
slow = sum(closes[-21:]) / 21
if fast > slow:
    price = closes[-1] - 10
    exchange.create_order('BTC/USDT', 'limit', 'buy', 0.01, price)
```

<!-- tabs:end -->

Jesse supplies the loop, the indicator library, the position sizing helper, the bracket orders and the accounting behind `self.balance`. CCXT supplies the candles and the order; the scheduling, the state, the exits and the risk are yours. The Jesse version is shorter because a framework is doing more — and because it only runs inside a Jesse project, on a route Jesse understands.

### Load historical candles for research

<!-- tabs:start -->

#### **Jesse**

```python
from jesse import research

candles, warmup = research.get_candles(
    'Binance Perpetual Futures',
    'BTC-USDT',
    '1h',
    start_date_timestamp,
    finish_date_timestamp,
    warmup_candles_num=0,
)
```

#### **CCXT**

```python
import ccxt

exchange = ccxt.binanceusdm()
candles = exchange.fetch_ohlcv('BTC/USDT:USDT', '1h', since=start_ms, limit=1000)
# [[timestamp, open, high, low, close, volume], ...]
```

<!-- tabs:end -->

Jesse reads from its own PostgreSQL store — you import candles first, and `get_candles` raises if it is not run from inside a Jesse project (`'.env' file not found`). CCXT calls the exchange directly and returns a list, with no database, no project layout and no prior import step. Note the column orders differ: CCXT returns `[timestamp, open, high, low, close, volume]`; Jesse's candles are `[timestamp, open, close, high, low, volume]`.

## Where the differences actually bite

### Venue coverage

Jesse's documentation lists 12 exchange/market entries for importing candles and running backtests — Binance Spot, Binance US Spot, Binance Perpetual Futures, Bitfinex Spot, Coinbase Spot, Bybit USDT/USDC Perpetual, Bybit Spot, Gate.io Perpetual Futures, KuCoin USDT Perpetual, KuCoin Spot and Kraken Pro Futures — and 16 entries for live trading, adding Lighter, Apex Omni, Hyperliquid, Kraken Pro Spot and Gate.io Spot. That is roughly ten distinct venues. The candle-import drivers in the repository sit under `jesse/modes/import_candles_mode/drivers`, one directory per venue.

CCXT covers 104 exchanges with REST and 76 of them with WebSocket, plus 7 prediction-market venues under `ccxt.prediction`. For anything outside Jesse's list — regional exchanges, newer perpetual DEXes, options venues — CCXT is where the implementation exists.

### The live-trading plugin is a separate package

This is the detail most worth knowing before you commit. The `jesse` repository is MIT and contains the framework, the backtester, the research API and the simulated exchange (`jesse/exchanges` holds `sandbox/` and a base `exchange.py`). Live exchange drivers are not in it.

Live trading is enabled by installing a separate plugin. Jesse's documentation calls it an "official plugin" and says you must "register on our website to generate your license key"; the CLI command is `jesse install-live`, and the installer source reads a `LICENSE_API_TOKEN` from your `.env`, then downloads a build of the `jesse_live` package matched to your OS, CPU architecture, Python version and Jesse version. Backtesting and research need none of this.

CCXT's live trading is the same package as everything else, MIT, with no key, no token and no per-platform build.

### What you have to stand up

CCXT is `pip install ccxt` and a Python file. Jesse's getting-started documentation lists Python `>= 3.10 and <= 3.13`, pip `>= 23`, PostgreSQL `>= 10` and Redis `>= 5`; you clone a project template, copy `.env.example` to `.env`, and `jesse run` starts a Uvicorn server on port 9000 that you drive from a browser.

If you want a research environment, that infrastructure is buying you something. If you want to add exchange connectivity to an existing service, it is a lot to adopt.

### Eight languages versus one

CCXT is written once in TypeScript and transpiled to JavaScript, Python, PHP, C#/.NET, Go and Java, with identical method names and return structures. Jesse is Python, and its strategy model, indicators, optimiser and dashboard are all Python. If your execution service is Go or C#, CCXT can be in it and Jesse cannot.

### Everything that is not a candle strategy

Jesse's surface is the strategy API — candles in, orders out, with helpers for sizing and risk. CCXT's surface is the exchange: order books, trades, tickers, funding rates, open interest, positions, margin and leverage settings, transfers, deposit addresses, ledgers, and every raw endpoint the venue publishes as an implicit method — 808 of them for Binance. Errors arrive as 41 typed exception classes in one hierarchy, so `InsufficientFunds` means the same thing on Kraken and Bybit.

If your problem is "compute a signal from candles and trade it," Jesse's narrower surface is a feature. If your problem includes reconciliation, treasury movement, market-data capture or venue-specific endpoints, you will run out of Jesse before you run out of CCXT.

## What Jesse does better

- **It backtests, and that is the whole point.** Multi-symbol, multi-timeframe, no look-ahead bias, partial fills, leverage and short-selling, with a metrics system and a debug mode. CCXT has no backtester at all — you would build or borrow one.
- **The research tooling around the backtest is deep.** Optuna-driven parameter optimisation parallelised with Ray, Monte Carlo analysis by trade-order shuffling and by candle simulation, rule significance testing against a bootstrap distribution of random entries, and batch benchmark runs across timeframes, symbols and strategies. That is a lot of statistics you do not have to write.
- **300+ indicators with native Rust implementations**, callable as `ta.ema(self.candles, 8)`. CCXT ships no indicators.
- **A built-in ML pipeline.** `record_features()` and `record_label()` during a gather-mode backtest, `train_model()` with any scikit-learn-compatible estimator, then `ml_predict_proba()` inside the strategy — with scaling and feature ordering handled.
- **The strategy syntax really is terse.** `should_long` / `go_long`, `self.buy = qty, price`, `self.take_profit`, `self.stop_loss`, `self.liquidate()`. Bracket orders and position sizing are one line each.
- **It is an application, not just a library.** Self-hosted dashboard, built-in code editor, interactive charts that overlay orders and completed trades on candles for backtests and live sessions alike, paper trading, multiple accounts, and Telegram/Slack/Discord notifications.
- **A local MCP server.** Jesse ships an MCP server so AI assistants can run backtests, manage candle data and inspect results against your actual project.

If you are a Python trader whose venues are on Jesse's list and whose work is researching candle-driven strategies, Jesse will get you further in a weekend than assembling the same thing from libraries — and CCXT is not trying to compete for that job.

## Using them together

Migration is the wrong frame: you do not move from a strategy framework to an exchange client. But the two do meet at a documented seam.

Jesse's research API includes `store_candles(candles, exchange, symbol)`, whose docstring says it "Stores candles in the database. The stored data can later be used for being fetched again via get_candles or even for running backtests on them. A common use case for this function is for importing candles from a CSV file so you can later use them for backtesting."

CCXT is a better source than a CSV. The pattern:

| Step | Tool |
| --- | --- |
| Pull history from any of 104 venues | `exchange.fetch_ohlcv(symbol, timeframe, since, limit)` |
| Reorder columns | CCXT gives `[ts, open, high, low, close, volume]`; Jesse wants `[ts, open, close, high, low, volume]` |
| Load into Jesse | `research.store_candles(candles, exchange, symbol)` |
| Backtest, optimise, Monte Carlo | Jesse |
| Trade a venue Jesse does not support live | `ccxt.<id>().create_order(...)` |
| Balances, transfers, funding rates, positions across venues | CCXT unified methods |

That gets Jesse's research loop pointed at market history it cannot import on its own, and gives you an execution path for the venues outside its live list.

## FAQ

**Does Jesse use CCXT?**
No. Jesse's `requirements.txt` on `master` does not list `ccxt`; it implements its own exchange drivers, with candle-import drivers under `jesse/modes/import_candles_mode/drivers` (Apex, Binance, Bitfinex, Bybit, Coinbase, Gate, Hyperliquid, Kraken, KuCoin, Lighter) and live drivers in the separate `jesse_live` plugin.

**Which exchanges can Jesse trade live?**
Its documentation lists 16 exchange/market entries: Lighter, Apex Omni, Kraken Pro Futures, Kraken Pro Spot, KuCoin USDT Perpetual Futures, KuCoin Spot, Hyperliquid, Bybit USDT Perpetual Futures, Bybit USDC Perpetual Futures, Bybit Spot, Binance Perpetual Futures, Binance Spot, Binance US Spot, Coinbase Spot, Gate.io Perpetual Futures and Gate.io Spot. CCXT supports 104 exchanges.

**Is Jesse free?**
The GitHub repository is MIT-licensed. Live trading requires the separate `jesse_live` plugin, installed with `jesse install-live`, which needs a `LICENSE_API_TOKEN` generated from a jesse.trade account. Backtesting, optimisation and the research API do not.

**Can CCXT backtest a strategy?**
No. CCXT gives you unified historical data — `fetch_ohlcv`, `fetch_trades` — and live execution, but no simulation loop, fill model or portfolio accounting. If you want those supplied, Jesse (or another engine) supplies them.

**Can I use CCXT data inside Jesse?**
Yes. Fetch candles with `fetch_ohlcv`, reorder the columns to Jesse's `[timestamp, open, close, high, low, volume]`, and load them with `research.store_candles()`. The function exists for exactly this kind of external import.

**Do I need a separate package for CCXT's WebSockets?**
No. CCXT Pro ships inside the `ccxt` package under MIT. Use `ccxt.pro.<id>` and the `watch*` methods.

## Next steps

- [Install CCXT](/docs/install)
- [Manual](/docs/manual) — unified structures and conventions
- [CCXT Pro manual](/docs/pro-manual) — the `watch*` streaming methods
- [Supported exchanges](/docs/exchange-markets)
- [Binance implicit API](/docs/exchanges/binance/implicit-api)
- [More comparisons](/docs/comparisons)
