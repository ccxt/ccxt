<!-- title: CCXT vs Hummingbot -->
<!-- description: Hummingbot is a trading-bot framework with its own hand-written connectors. Compared with CCXT on scope, venue coverage, DEX support, languages and licence. -->
<!-- group: Multi-exchange libraries and frameworks -->
<!-- summary: Hummingbot is a strategy framework that writes its own connectors instead of using CCXT, so the two really do overlap at the connector layer. It reaches AMM DEXes CCXT cannot; CCXT covers far more centralised venues. -->
<!-- weight: 30 -->

# CCXT vs Hummingbot

[Hummingbot](https://github.com/hummingbot/hummingbot) describes itself as "an open-source framework that helps you design and deploy automated trading strategies, or **bots**, that can run on many centralized or decentralized exchanges". [CCXT](/docs/manual) is not a bot. It is the exchange-access layer a bot is built on.

That would make the two incomparable, except for one thing: unlike most Python trading bots, Hummingbot does **not** use CCXT. It hand-writes a connector per venue — signing, REST plumbing, order-book diffing and all. So the two projects really do overlap, at exactly one layer, and the question that decides between them is: **do you want the strategy engine too, or only the venue access?**

## TL;DR

- **Pick Hummingbot** if you want a market maker running today rather than a codebase to write — with paper trading, a backtesting dashboard, an executor library and an encrypted keystore — and your venues are on its connector list. It also reaches on-chain AMM DEXes, which CCXT does not.
- **Pick CCXT** if you are building your own system and want venue access as a library: 104 exchanges, 76 of them streaming, in TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java or Rust, with every raw endpoint still reachable.
- **They are not really rivals.** Hummingbot competes with the strategy engine you would otherwise write. CCXT competes with the connector layer underneath it. Plenty of teams run a Hummingbot instance for market making and CCXT for everything else.

## At a glance

| | **CCXT** | **Hummingbot** |
| --- | --- | --- |
| What it is | exchange-access library | framework for building and running trading bots |
| Connector layer | its own, one unified API | its own, hand-written per venue — no CCXT dependency |
| Centralised venues | 104 REST, 76 with WebSocket | 24 CLOB CEX rows in the README connector tables |
| On-chain venues | none | 8 CLOB DEX and 12 AMM DEX rows; AMM access runs through the separate Gateway service |
| Prediction markets | 7 venues in `ccxt.prediction` | not listed |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java, Rust | Python, with Cython extensions |
| Install | `pip install ccxt` / `npm i ccxt` | Anaconda/Miniconda + `make install` from source, or Docker Compose |
| Strategy engine | none — you write the loop | scripts, V2 controllers, executors, legacy V1 strategies |
| Backtesting | none | yes, on controller pages in the Hummingbot Dashboard |
| Paper trading | testnet where the venue offers one, via `set_sandbox_mode(True)` | yes — `binance_paper_trade` and equivalents, no API keys needed |
| Rate limiting | built in, per-endpoint weights, on by default | built in, `AsyncThrottler` in `hummingbot/core/api_throttler` |
| Raw endpoint access | yes — every endpoint as an implicit method (808 on Binance) | whatever the connector implements |
| Unified error types | 41 typed exceptions in one hierarchy | per-connector exception handling |
| Popularity | 43.8k GitHub stars · 4.7M PyPI + 494k npm installs/month (one package, every venue) | 19.8k GitHub stars, 4.9k forks; installed from source or Docker rather than PyPI |
| Licence | MIT | Apache-2.0 |
| Support | Discord, Telegram, GitHub issues | Discord `#support`, GitHub issues |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, the Hummingbot repository README and `setup.py`/`setup/environment.yml` on `master`, hummingbot.org, and install counts from npm and PyPI.</sub>

## The same job, written both ways

### Quote a two-sided market

<!-- tabs:start -->

#### **CCXT**

```python
import asyncio
import ccxt.pro

async def main():
    exchange = ccxt.pro.binance({'apiKey': '...', 'secret': '...'})
    symbol, size, spread = 'BTC/USDT', 0.001, 0.001
    while True:
        book = await exchange.watch_order_book(symbol)
        mid = (book['bids'][0][0] + book['asks'][0][0]) / 2
        await exchange.cancel_all_orders(symbol)
        bid = exchange.price_to_precision(symbol, mid * (1 - spread))
        ask = exchange.price_to_precision(symbol, mid * (1 + spread))
        await exchange.create_order(symbol, 'limit', 'buy', size, bid)
        await exchange.create_order(symbol, 'limit', 'sell', size, ask)

asyncio.run(main())
```

#### **Hummingbot**

```python
class SimplePMM(StrategyV2Base):

    def on_tick(self):
        if self.create_timestamp <= self.current_timestamp:
            self.cancel_all_orders()
            proposal = self.create_proposal()
            self.place_orders(self.adjust_proposal_to_budget(proposal))
            self.create_timestamp = self.config.order_refresh_time + self.current_timestamp

    def create_proposal(self):
        ref_price = self.connectors[self.config.exchange].get_price_by_type(
            self.config.trading_pair, PriceType.MidPrice)
        return [
            OrderCandidate(trading_pair=self.config.trading_pair, is_maker=True,
                           order_type=OrderType.LIMIT, order_side=TradeType.BUY,
                           amount=Decimal(self.config.order_amount),
                           price=ref_price * Decimal(1 - self.config.bid_spread)),
            OrderCandidate(trading_pair=self.config.trading_pair, is_maker=True,
                           order_type=OrderType.LIMIT, order_side=TradeType.SELL,
                           amount=Decimal(self.config.order_amount),
                           price=ref_price * Decimal(1 + self.config.ask_spread)),
        ]
```

<!-- tabs:end -->

The Hummingbot excerpt is abridged from `scripts/simple_pmm.py` in its repository. It is shorter than it looks: the framework supplies the clock, the config schema, budget checking, order tracking and fill events. In exchange, your code only exists inside its lifecycle. The CCXT version has no lifecycle — it is a loop you own, in a process you own, and it stops where you stop it.

### From nothing to something running

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.binance()
print(exchange.fetch_ticker('BTC/USDT')['last'])
```

#### **Hummingbot**

```bash
hbot create simple_pmm --name conf_paper_bot.yml \
     --set exchange=binance_paper_trade --set trading_pair=BTC-USDT
hbot start conf_paper_bot.yml
hbot status
```

<!-- tabs:end -->

This is the category difference in four lines each. Three `hbot` commands give you a paper-trading market maker quoting against live Binance data with no API keys. Four lines of CCXT give you a number, and everything you do with it is yours to build. Note the market naming as well: Hummingbot uses `BTC-USDT` with a separate connector id per product line (`binance`, `binance_perpetual`); CCXT uses `'BTC/USDT'` and `'BTC/USDT:USDT'` on a single `ccxt.binance()` instance.

## Where the differences actually bite

### Two connector layers, maintained twice

This is the substantive overlap. Hummingbot has no CCXT dependency — neither `setup.py` nor `setup/environment.yml` lists it, and each connector ships its own signing code (`hummingbot/connector/exchange/kraken/kraken_auth.py` builds Kraken's request signature by hand with `hmac`, `hashlib` and `base64`). That is a deliberate design choice: purpose-built connectors can be tuned for the latency and order-tracking behaviour a high-frequency market maker needs.

The cost is arithmetic. Every venue integration exists once in each project, and every venue's API changes have to be absorbed twice. When a venue is on both lists, you get two well-maintained implementations. When it is on neither, both are equal work. When it is on one, that is your answer.

### Coverage points in opposite directions

For centralised exchanges, CCXT covers 104 with REST and 76 with WebSocket; the Hummingbot README lists 24 CLOB CEX rows. For on-chain venues the comparison inverts completely — CCXT has no AMM support at all, and Hummingbot lists 12 AMM DEX rows plus 8 CLOB DEX rows.

If your venue list is centralised and long-tailed, CCXT reaches more of it. If it includes Uniswap, Raydium, Meteora, Orca or Curve, CCXT does not reach it at any price.

### One language versus eight

Hummingbot is Python with Cython extensions, installed from source through conda or run in Docker. That is a reasonable footprint for a dedicated trading host and a heavy one for a library dependency.

CCXT is written once in TypeScript and transpiled to JavaScript, Python, PHP, C#/.NET, Go, Java and Rust with identical method names and return structures, and installs with a single `pip install ccxt` or `npm i ccxt`. Research in Python and execute in Go or C# without a second data model.

### Nothing is hidden — the implicit API

Every endpoint of every supported exchange is generated as a callable [implicit method](/docs/exchanges/binance/implicit-api) — 808 of them on Binance — with signing, rate limiting and error mapping already applied. A venue-specific feature that no unified method covers is still one call away. In a hand-written connector, an endpoint that was not implemented is a pull request.

### Scope is the real fork in the road

CCXT deliberately stops at the exchange boundary. There is no scheduler, no strategy lifecycle, no persistence, no dashboard and no backtester, because those are opinions and CCXT is trying not to have any. If you want those opinions supplied, a framework is the correct choice and CCXT is the wrong one.

## What Hummingbot does better

- **On-chain AMM and DEX trading.** Through [Gateway](https://github.com/hummingbot/gateway), a separate TypeScript service, Hummingbot trades router, AMM and concentrated-liquidity pools across Ethereum, Arbitrum, Avalanche, Base, BSC, Celo, Optimism, Polygon and Solana. Uniswap, Curve, Balancer, PancakeSwap, Raydium, Orca, Meteora and Jupiter are all connector rows. CCXT has no equivalent — it speaks exchange APIs, not chains.
- **A real market-making strategy library.** Pure Market Making, Avellaneda Market Making and Cross-Exchange Market Making ship as strategies, and the V2 executors cover position, DCA, grid, arbitrage, XEMM, TWAP and liquidity-provision patterns as reusable building blocks. That is years of accumulated execution logic you would otherwise write yourself.
- **Backtesting and a dashboard.** Controller configs can be backtested from the Hummingbot Dashboard over historical data with net PnL, max drawdown, Sharpe ratio, profit factor and per-closure-type breakdowns. CCXT has no backtester.
- **Paper trading with no keys.** `binance_paper_trade` simulates against live market data, so a strategy can be exercised end to end before any credential exists. CCXT can only offer whatever testnet the venue itself runs.
- **Operational scaffolding.** An encrypted keystore for API keys, a scriptable `hbot` CLI with stable exit codes, Docker Compose deployment, and the Condor harness for LLM-driven strategies. None of that is a library's job, and all of it is work you would otherwise do.

If you want a market maker rather than a codebase — especially one quoting on Uniswap, Raydium or another AMM — Hummingbot is the better choice, and CCXT will not get you there.

## Migrating from Hummingbot to CCXT

Migration only makes sense at the **connector layer** — replacing Hummingbot's venue access while keeping, or rewriting, your own strategy logic. There is no CCXT equivalent of the strategy framework, and this table does not pretend otherwise. If you want a framework, stay on Hummingbot.

| What you are doing | Hummingbot | CCXT |
| --- | --- | --- |
| Naming a market | `BTC-USDT`, plus a connector id per product (`binance`, `binance_perpetual`) | `'BTC/USDT'` and `'BTC/USDT:USDT'` on one `ccxt.binance()` |
| Connecting | `hbot connect binance` into the encrypted keystore | `ccxt.binance({'apiKey': '...', 'secret': '...'})` |
| Reference price | `get_price_by_type(pair, PriceType.MidPrice)` | `fetch_ticker(symbol)` or `fetch_order_book(symbol)` |
| Order book | `connector.get_order_book(trading_pair)` | `fetch_order_book()` / `watch_order_book()` |
| Candles | the candles feed in `hummingbot/data_feed/candles_feed` | `fetch_ohlcv()` / `watch_ohlcv()` |
| New order | `OrderCandidate` then `self.buy()` / `self.sell()` | `create_order(symbol, type, side, amount, price)` |
| Cancel order | `self.cancel(connector, pair, client_order_id)` | `cancel_order(id, symbol)` |
| Open orders | `self.get_active_orders(connector_name=...)` | `fetch_open_orders(symbol)` |
| Fills | `did_fill_order(OrderFilledEvent)` callback | `fetch_my_trades()` / `watch_my_trades()` |
| Balance | `connector.get_balance(currency)`, plus the budget checker | `fetch_balance()` |
| Paper trading | `binance_paper_trade` connector | `exchange.set_sandbox_mode(True)` where the venue has a testnet |
| Anything not listed | connector method, if implemented | the same endpoint as an implicit method |

## FAQ

**Does Hummingbot use CCXT?**
No. Hummingbot writes and maintains its own connector per venue — there is no `ccxt` entry in its `setup.py` or conda environment, and each connector ships its own request signing. This is unusual: most Python trading bots, Freqtrade and OctoBot among them, use CCXT for exchange access.

**Can CCXT trade on Uniswap or Raydium?**
No. CCXT speaks exchange REST and WebSocket APIs, including on-chain order-book venues such as Hyperliquid and dYdX, but it has no AMM or liquidity-pool support. Hummingbot does, through its Gateway service, and that is a genuine capability gap rather than a difference of emphasis.

**Which one supports more exchanges?**
It depends which kind. For centralised exchanges, CCXT — 104 with REST and 76 with WebSocket, against 24 CLOB CEX rows in Hummingbot's README. For AMM DEXes, Hummingbot, because CCXT supports none.

**Can I use CCXT inside a Hummingbot strategy?**
Nothing stops you importing `ccxt` in a script strategy to reach a venue or an endpoint Hummingbot has no connector for — it is an ordinary Python package. Its orders will not be tracked by Hummingbot's order-tracking or budget checker, so treat anything you do that way as outside the framework's accounting.

**Does CCXT do market making?**
CCXT provides the pieces — streaming books, precision-correct prices, order placement, cancellation and fill tracking across 104 venues — and none of the strategy. The quoting logic, inventory management and risk controls are yours to write. If you want those supplied, that is precisely what Hummingbot is for.

**Is CCXT's WebSocket support a paid add-on?**
No. CCXT Pro is bundled in the `ccxt` package under MIT. Use `ccxt.pro.<exchange>` and the `watch*` methods.

## Next steps

- [Install CCXT](/docs/install)
- [Manual](/docs/manual) — unified structures and conventions
- [CCXT Pro manual](/docs/pro-manual) — the `watch*` streaming methods
- [Supported exchanges](/docs/exchange-markets)
- [More comparisons](/docs/comparisons)
