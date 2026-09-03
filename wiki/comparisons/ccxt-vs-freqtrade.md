<!-- title: CCXT vs Freqtrade -->
<!-- description: Freqtrade is a Python strategy runner built on CCXT. What each layer does, which exchanges each reaches, and when to drop from Freqtrade down to CCXT directly. -->
<!-- group: Multi-exchange libraries and frameworks -->
<!-- summary: Freqtrade is not an alternative to CCXT — it is built on it, and lists `ccxt` as its first dependency. The question is whether you want a strategy runner on top, or the exchange layer on its own. -->
<!-- weight: 32 -->

# CCXT vs Freqtrade

If you are comparing these two, the first thing to know is that they are not competitors: **Freqtrade uses CCXT for every exchange call it makes.** Its exchange-configuration documentation states that "Freqtrade is based on [CCXT library](https://github.com/ccxt/ccxt) that supports over 100 cryptocurrency exchange markets and trading APIs", and `ccxt>=4.5.76` is the first entry in its `pyproject.toml` dependency list.

[Freqtrade](https://github.com/freqtrade/freqtrade) is "a free and open source crypto trading bot written in Python … designed to support all major exchanges and be controlled via Telegram or webUI", with backtesting, plotting, money management and machine-learning strategy optimisation. [CCXT](/docs/manual) is the exchange layer underneath. So the real question is not which to pick. It is **which layer your problem lives at**.

## TL;DR

- **Pick Freqtrade** if your problem is a candle-based strategy that you want to backtest, hyperopt, dry-run and then operate from Telegram or a web UI. It supplies all of that, and you would be rebuilding it on top of CCXT otherwise.
- **Pick CCXT directly** if you are building your own system, need a venue or a unified method Freqtrade does not expose, or want the exchange layer in TypeScript, Go, C#, PHP or Java rather than Python.
- **Choosing Freqtrade is choosing CCXT.** It is already there, one import away, and the config file has documented hooks for passing options straight through to it.

## At a glance

| | **CCXT** | **Freqtrade** |
| --- | --- | --- |
| What it is | exchange-access library | strategy runner and trading bot |
| Exchange access | its own | CCXT (`ccxt>=4.5.76`), sync and `ccxt.pro` |
| Exchanges | 104 REST, 76 with WebSocket | 15 ids in its `SUPPORTED_EXCHANGES` list; any other CCXT exchange that passes its capability check may be attempted |
| Spot venues named in the README | n/a — all 104 are supported the same way | Binance, BingX, Bitget, Bybit EU, Bybit, Gate EU, Gate, HTX, Hyperliquid, Kraken, MyOKX, OKX |
| Futures venues named in the README | n/a | Binance, Bitget, Bybit, Gate, Hyperliquid, Kraken, OKX |
| Community-tested venues | n/a | Bitvavo, KuCoin |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java | Python 3.11+ |
| Streaming | `watch*` on 76 exchanges — books, trades, tickers, OHLCV, orders, positions | through `ccxt.pro`, currently limited to OHLCV streams, with REST fallback |
| Strategy engine | none — you write the loop | `populate_indicators` / `populate_entry_trend` / `populate_exit_trend` on pandas dataframes |
| Backtesting | none | yes, plus `hyperopt` and FreqAI adaptive modelling |
| Control surface | none — it is a library | Telegram bot, FreqUI web UI, REST API, CLI |
| Persistence | none | SQLite |
| Raw endpoint access | yes — every endpoint as an implicit method (808 on Binance) | via the CCXT instance underneath |
| Unified error types | 41 typed exceptions in one hierarchy | maps CCXT exceptions onto its own `DDosProtection`, `TemporaryError`, `OperationalException` |
| Popularity | 43.8k GitHub stars · 4.7M PyPI + 494k npm installs/month | 54k GitHub stars, 11.2k forks · 73k PyPI installs/month |
| Licence | MIT | GPL-3.0 |
| Support | Discord, Telegram, GitHub issues | Discord, GitHub issues |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, the Freqtrade repository on `develop` (README, `pyproject.toml`, `LICENSE`, `freqtrade/exchange/`), freqtrade.io documentation, and install counts from npm and PyPI.</sub>

## The same job, written both ways

### Buy when RSI crosses back above 30

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt
import pandas as pd

exchange = ccxt.binance({'apiKey': '...', 'secret': '...'})
candles = exchange.fetch_ohlcv('BTC/USDT', '5m', limit=500)
df = pd.DataFrame(candles, columns=['ts', 'open', 'high', 'low', 'close', 'volume'])

delta = df['close'].diff()
gain = delta.clip(lower=0).ewm(alpha=1 / 14).mean()
loss = -delta.clip(upper=0).ewm(alpha=1 / 14).mean()
df['rsi'] = 100 - 100 / (1 + gain / loss)

if df['rsi'].iloc[-2] < 30 <= df['rsi'].iloc[-1]:
    exchange.create_order('BTC/USDT', 'market', 'buy', 0.001)
```

#### **Freqtrade**

```python
class MyStrategy(IStrategy):
    timeframe = '5m'

    def populate_indicators(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        dataframe['rsi'] = ta.RSI(dataframe)
        return dataframe

    def populate_entry_trend(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        dataframe.loc[
            (qtpylib.crossed_above(dataframe['rsi'], 30)) & (dataframe['volume'] > 0),
            'enter_long',
        ] = 1
        return dataframe
```

<!-- tabs:end -->

The Freqtrade version is shorter because it is only the part that is actually about your strategy. The scheduling, the pair whitelist, the candle cache, the stake sizing, the order placement, the trade record and the Telegram notification are all supplied. The CCXT version is longer because none of that exists yet — but it is also the whole program, running wherever and however you want it to.

Note what does *not* change: the symbol is `'BTC/USDT'` on both sides, and the candles behind Freqtrade's dataframe came from `fetch_ohlcv` on a CCXT exchange object.

### Read the live order book

<!-- tabs:start -->

#### **CCXT**

```python
import asyncio
import ccxt.pro

async def main():
    exchange = ccxt.pro.binance()
    while True:
        book = await exchange.watch_order_book('BTC/USDT')
        print(book['bids'][0], book['asks'][0])

asyncio.run(main())
```

#### **Freqtrade**

```python
if self.dp.runmode.value in ('live', 'dry_run'):
    ob = self.dp.orderbook(metadata['pair'], 1)
    dataframe['best_bid'] = ob['bids'][0][0]
    dataframe['best_ask'] = ob['asks'][0][0]
```

<!-- tabs:end -->

Freqtrade's data provider hands you a REST snapshot in CCXT's [order-book structure](/docs/manual#order-book-structure) — its own documentation links to the CCXT manual for the shape. That is enough for a strategy that decides once per candle. It is not a stream: Freqtrade's WebSocket support runs through `ccxt.pro` but, as its configuration docs state, "usage is limited to ohlcv data streams". If you need a live book, live trades or live order updates, that is `watch_order_book`, `watch_trades` and `watch_orders` on the CCXT instance — the same library, one layer down.

## Where the differences actually bite

### The dependency runs one way

Everything Freqtrade knows about an exchange, it learned from CCXT. `freqtrade/exchange/exchange.py` builds a sync `ccxt` client and an async `ccxt.pro` client on start-up and logs the CCXT version it is running. `exchange_has()` is a lookup into CCXT's `has` dictionary. `features()` reads CCXT's `features` block. Rounding uses CCXT's `decimal_to_precision`, `TICK_SIZE` and `ROUND_UP`/`ROUND_DOWN`. Demo trading calls CCXT's `enable_demo_trading()`.

Most of its 26 per-exchange classes are quirk tables rather than integrations. The Bitvavo one is 24 lines, and the payload is a single dictionary entry, `{"ohlcv_candle_limit": 1440}`. Kucoin's adds a stop-order parameter name, an order-book depth range and a time-in-force list. The actual talking to the exchange happens one layer down.

The consequence is practical. If a venue's behaviour changes, the fix usually lands in CCXT first and reaches you when Freqtrade's dependency floor moves. And a bug you hit inside Freqtrade is often reproducible in four lines of CCXT, which is a much better bug report.

### The venue lists are different sizes for a reason

Freqtrade's `SUPPORTED_EXCHANGES` constant names 15 ids, and its README lists 12 spot venues, 7 futures venues and 2 community-tested ones. That is not a coverage ceiling — it is a *tested* list. `freqtrade list-exchanges` enumerates `ccxt.exchanges` and filters it by whether each venue reports the capabilities Freqtrade needs (`fetchOrder`, `fetchL2OrderBook`, `cancelOrder`, `createOrder`, `fetchBalance`, `fetchOHLCV`), which is why the README ends its spot list with "potentially many others" linking to the CCXT repository, followed by "(We cannot guarantee they will work)".

CCXT's 104 is a coverage number. Freqtrade's is a support commitment. Both are honest and they mean different things.

### Freqtrade sees the world as candles

The strategy interface is a pandas dataframe of OHLCV rows per pair, and everything else is arranged around that: pairlist handlers, the candle cache, backtesting, hyperopt. It fits trend and mean-reversion strategies extremely well.

It fits some things badly by construction. Order-book-driven execution, options, quoting both sides of a spread, or anything that has to react within a candle rather than at its close — those want the exchange layer directly. A bot is also configured with a single `exchange` block, so cross-venue work means running more than one of it. And CCXT's unified API covers ground the strategy interface does not surface at all: `fetch_liquidations`, transfers between account types, deposit addresses, and 7 prediction-market venues in `ccxt.prediction`.

### One language versus seven

Freqtrade is Python 3.11+. CCXT is written once in TypeScript and transpiled to JavaScript, Python, PHP, C#/.NET, Go and Java with identical method names and return structures. If the trading service is in Go and the research is in Python, the exchange layer is the same library in both.

### Licence

Freqtrade is **GPL-3.0**; CCXT is **MIT**. Running Freqtrade for yourself raises no question at all. Building a product that redistributes a modified Freqtrade is a conversation with your lawyers, and one that CCXT's licence does not start.

## What Freqtrade does better

- **Backtesting, and the tooling around it.** `backtesting`, `backtesting-analysis`, `plot-dataframe`, `plot-profit`, `lookahead-analysis` and `recursive-analysis` — the last two exist specifically to catch look-ahead bias and recursive-formula bugs in your own strategy. CCXT has no backtester and no opinion about one.
- **Hyperparameter optimisation.** `hyperopt`, `hyperopt-list` and `hyperopt-show` search strategy parameters against real exchange data, with pluggable loss functions. Writing that yourself is a project.
- **FreqAI.** An adaptive machine-learning layer that retrains models on a rolling window as the market moves, wired into the same strategy interface.
- **Operating a live bot.** Telegram control (`/status`, `/profit`, `/balance`, `/forceexit`, `/performance`), the FreqUI web interface, a REST API, SQLite persistence of every trade, and dry-run mode that runs the full loop without touching money. All of that is the unglamorous 80% of running a bot, and it is done.
- **Exchange quirks already absorbed.** Its 26 exchange classes encode stop-order parameter names, candle limits, time-in-force sets and order-book depth ranges per venue — knowledge you would otherwise rediscover the hard way.
- **The parts of a bot nobody enjoys writing.** Stoploss handling — including exchange-side stoploss on venues whose quirk table declares `stoploss_on_exchange` — `minimum_roi` exits, and dynamic whitelisting and blacklisting of pairs are all built in and tested.

If your problem is "I have a candle-based idea and I want it backtested, tuned and running by the weekend", Freqtrade is unambiguously the better choice, and reaching for CCXT directly would mean rebuilding most of the above.

## Using them together

Migration is the wrong frame here — Freqtrade *is* a CCXT application. The useful question is where the boundary sits and how to cross it.

**Reaching CCXT from inside Freqtrade.** The exchange config block has documented pass-throughs:

```json
"exchange": {
    "name": "binance",
    "api_key": "your_exchange_api_key",
    "secret": "your_exchange_secret",
    "ccxt_config": { "enableRateLimit": true },
    "ccxt_sync_config": {},
    "ccxt_async_config": { "rateLimit": 3100 }
}
```

`exchange.name` is the CCXT exchange id — it is passed to `getattr(ccxt, name.lower())`. `ccxt_config` goes to both clients, `ccxt_sync_config` and `ccxt_async_config` to one each, and Freqtrade's own docs point at the CCXT manual for what belongs in them. Proxy configuration, `options`, per-venue flags and rate-limit tuning all go through this hole.

Inside a strategy, several data-provider methods return CCXT structures unchanged: `self.dp.market(pair)` is the CCXT [market structure](/docs/manual#market-structure), `self.dp.ticker(pair)` the [ticker](/docs/manual#ticker-structure), `self.dp.orderbook(pair, n)` the [order book](/docs/manual#order-book-structure), and `self.dp.funding_rate(pair)` the funding-rate structure. The CCXT client objects themselves live on private attributes (`_api` for sync, `_api_async` for `ccxt.pro`), so treat them as an escape hatch rather than a supported interface.

**When to step outside.** Run Freqtrade for what it is good at and CCXT alongside it when you need:

| You need | Where it lives |
| --- | --- |
| A venue Freqtrade has not tested | `ccxt.<id>()` directly — 104 to choose from |
| Live order books, trades or order updates | `watch_order_book`, `watch_trades`, `watch_orders` on `ccxt.pro.<id>` |
| Liquidations, transfers between accounts, deposit addresses | `fetch_liquidations`, `transfer`, `fetch_deposit_address` |
| Prediction markets | `ccxt.prediction.polymarket()`, `ccxt.prediction.kalshi()` |
| A venue-specific endpoint with no unified method | the [implicit API](/docs/exchanges/binance/implicit-api) |
| The exchange layer in Go, C#, TypeScript, PHP or Java | the same CCXT API in that language |

A common shape: Freqtrade runs the candle strategies, and a small separate CCXT service handles book-driven execution, funding-carry monitoring or a venue outside the tested list. They share nothing but the exchange, and they agree about it because they are talking to the same library.

## FAQ

**Does Freqtrade use CCXT?**
Yes. `ccxt>=4.5.76` is the first dependency in its `pyproject.toml`, and `freqtrade/exchange/exchange.py` constructs both a sync `ccxt` client and an async `ccxt.pro` client for every exchange it trades. Its exchange documentation states outright that "Freqtrade is based on CCXT library".

**Can Freqtrade trade on an exchange that is not in its README list?**
It can attempt to. `freqtrade list-exchanges` walks CCXT's full exchange list and reports which venues expose the capabilities Freqtrade requires. The README's spot list ends with "potentially many others" pointing at the CCXT repository, with the caveat "We cannot guarantee they will work". Untested is not the same as unsupported — but it does mean you are the one testing it.

**Do I still need CCXT if I use Freqtrade?**
You already have it — it is installed as a dependency. You would import it directly when you need something outside Freqtrade's candle-shaped world: a live order-book stream, a second venue in the same process, an untested exchange, a prediction market, or an exchange-specific endpoint.

**Is Freqtrade's WebSocket support the same as CCXT Pro?**
It is CCXT Pro underneath, but only part of it. Freqtrade's configuration docs say WebSocket usage "is limited to ohlcv data streams" and falls back to REST if the socket fails; it can be disabled with `exchange.enable_ws`. CCXT Pro itself exposes `watch_order_book`, `watch_trades`, `watch_ticker`, `watch_orders`, `watch_my_trades`, `watch_positions` and `watch_balance` across 76 exchanges.

**How do I pass a CCXT option through Freqtrade?**
Use `ccxt_config` in the exchange block of your config, or `ccxt_sync_config` / `ccxt_async_config` to target one client. Those dictionaries are merged straight into the CCXT constructor, so anything documented as a constructor property in the [CCXT manual](/docs/manual) works.

**Which is more popular?**
Different units, so compare carefully. Freqtrade has 54k GitHub stars and about 73k PyPI installs a month, as one application. CCXT has 43.8k stars and about 4.7M PyPI plus 494k npm installs a month, as a library that many applications — Freqtrade among them — depend on. Both figures were read in September 2026.

## Next steps

- [Install CCXT](/docs/install)
- [Manual](/docs/manual) — unified structures and conventions
- [CCXT Pro manual](/docs/pro-manual) — the `watch*` streaming methods
- [Supported exchanges](/docs/exchange-markets)
- [More comparisons](/docs/comparisons)
