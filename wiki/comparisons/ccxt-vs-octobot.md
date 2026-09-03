<!-- title: CCXT vs OctoBot -->
<!-- description: OctoBot is a GPL-3.0 trading bot whose exchange support runs on CCXT. Compared on scope, venue coverage, streaming, languages and licence, and how to use both. -->
<!-- group: Multi-exchange libraries and frameworks -->
<!-- summary: OctoBot's README says its exchange support comes from CCXT, and OctoBot-Trading pins `ccxt` as a direct dependency. The choice is between a configured, UI-driven bot and the exchange library it runs on. -->
<!-- weight: 38 -->

# CCXT vs OctoBot

[OctoBot](https://github.com/Drakkar-Software/OctoBot) is a "free open source crypto trading bot to automate AI, Grid, DCA and TradingView strategies on Binance, Hyperliquid and 15+ exchanges, with a simple interface". Its README does not leave the relationship in any doubt:

> OctoBot supports the vast majority of crypto exchanges thanks to the great [CCXT library](https://github.com/ccxt/ccxt).

That is accurate down to the code. OctoBot-Trading, the engine package, lists `ccxt` under "Exchange connection requirements", its default connector class is `CCXTConnector`, and its per-exchange tentacles are quirk layers over a `ccxt.async_support` or `ccxt.pro` client. So the two are not rivals. The question is **which layer your problem lives at**: a bot you configure and watch, or the exchange library underneath it that you program.

## TL;DR

- **Pick OctoBot** if you want strategies you configure rather than write — grids, DCA, crypto baskets, TradingView alerts, LLM-driven modes — with a web interface, a mobile app, paper trading, backtesting and Telegram control. None of that exists in CCXT and none of it is on its roadmap.
- **Pick CCXT directly** if you are building your own system, need a venue or a unified method OctoBot has no tentacle for, or want the exchange layer in TypeScript, Go, C#, PHP or Java rather than Python.
- **Choosing OctoBot is choosing CCXT.** Its profiles are written in CCXT exchange ids and CCXT unified symbols, because that is what is doing the work.

## At a glance

| | **CCXT** | **OctoBot** |
| --- | --- | --- |
| What it is | exchange-access library | configurable trading bot with a visual interface |
| Exchange access | its own | CCXT — `ccxt` is a direct dependency of OctoBot-Trading, pinned to an exact version |
| Exchanges | 104 REST, 76 with WebSocket | "15+" per the README; several dozen exchange tentacles in OctoBot-Tentacles, plus a generic CCXT REST tentacle for the rest |
| Venues named in the README | n/a — all 104 are supported the same way | Binance, Coinbase, Bybit, Hyperliquid, MEXC, KuCoin, HollaEx-powered exchanges, OKX, Binance US, Crypto.com, HTX, Bitget, BingX, CoinEx, BitMart, Phemex, Gate.io, Ascendex |
| Prediction markets | 7 venues in `ccxt.prediction` | a Polymarket tentacle |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java, Rust | Python |
| How you use it | import a library, write code | install, then configure a profile; Python only if you write a tentacle |
| Install | `pip install ccxt` / `npm i ccxt` | executables for Windows, macOS, Linux and Raspberry Pi, Docker image, DigitalOcean one-click, or from source |
| Strategy engine | none — you write the loop | trading modes: grid, DCA, crypto basket, market making, TradingView, ChatGPT/Ollama |
| Backtesting | none | built-in backtesting engine plus paper trading |
| Control surface | none — it is a library | web interface, mobile app, Telegram |
| Raw endpoint access | yes — every endpoint as an implicit method (808 on Binance) | via the CCXT client underneath |
| Unified error types | 41 typed exceptions in one hierarchy | CCXT exceptions mapped onto OctoBot's own error types |
| Popularity | 43.8k GitHub stars · 4.7M PyPI + 494k npm installs/month | 6.5k GitHub stars, 1.3k forks; the project's own counter reported 73,932 installed OctoBots |
| Licence | MIT | GPL-3.0 |
| Support | Discord, Telegram, GitHub issues | Discord, Telegram, GitHub issues |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, the OctoBot repository README and default config on `master`, the OctoBot-Trading and OctoBot-Tentacles repositories, the project's public community-stats endpoint, and install counts from npm and PyPI.</sub>

## The same job, written both ways

### Point the system at an exchange and a market

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.binance({'apiKey': '...', 'secret': '...'})
ticker = exchange.fetch_ticker('BTC/USDT')
print(ticker['last'])
```

#### **OctoBot**

```json
{
    "config": {
        "crypto-currencies": {
            "Bitcoin": { "enabled": true, "pairs": ["BTC/USDT"] }
        },
        "exchanges": {
            "binance": { "enabled": true, "exchange-type": "spot" }
        }
    }
}
```

<!-- tabs:end -->

Look at what the two sides have in common. `binance` is a CCXT exchange id. `BTC/USDT` is a CCXT [unified symbol](/docs/manual#symbols-and-market-ids). OctoBot's profile file is not translating your intent into something else — it is filling in the arguments that end up on a CCXT client. That is the whole relationship in one screen: OctoBot decides *what* to trade and *when*; CCXT is what actually talks to Binance.

### Teach the system an exchange quirk

<!-- tabs:start -->

#### **CCXT**

```python
exchange = ccxt.coinex({
    'apiKey': '...',
    'secret': '...',
    'options': {'createMarketBuyOrderRequiresPrice': False},
})
```

#### **OctoBot**

```python
class Coinex(exchanges.RestExchange):

    @classmethod
    def get_name(cls):
        return 'coinex'

    def get_additional_connector_config(self):
        # tell ccxt to use amount as provided and not to compute it by multiplying it by price
        return {
            ccxt_constants.CCXT_OPTIONS: {
                "createMarketBuyOrderRequiresPrice": False
            }
        }
```

<!-- tabs:end -->

This is an abridged excerpt from OctoBot's own Coinex tentacle, comment included. `ccxt_constants.CCXT_OPTIONS` is the string `"options"`, `get_name()` returns the CCXT exchange id, and the flag being set is a CCXT option. An exchange tentacle is a place to record what a venue does differently — the request itself is still a CCXT call.

## Where the differences actually bite

### The dependency runs one way

OctoBot's engine imports `ccxt.async_support` and `ccxt.pro`, wraps them in a `CCXTConnector`, and adapts CCXT structures into its internal enums. `RestExchange.DEFAULT_CONNECTOR_CLASS` is that connector. It calls CCXT's `check_required_credentials()` on start-up and logs the CCXT version it is using. Its internal field-name constants are CCXT's own: `CCXT_INFO = "info"`, `CCXT_OPTIONS = "options"`, `CCXT_FETCH_MARKETS = "fetchMarkets"`.

So a venue that CCXT supports and OctoBot has no tentacle for is not out of reach — `DefaultRestExchange.is_supporting_exchange()` accepts any exchange name, and OctoBot ships a `configurable_default_ccxt_rest` tentacle for exactly that case. The dedicated tentacles are where per-venue knowledge accumulates, not where support begins.

### Version pinning decides when new venues reach you

OctoBot-Trading pins CCXT to an exact version rather than a floor — `ccxt==4.5.28` at the time of writing, with a comment requiring authenticated exchange tests to pass before the pin moves. That is a defensible choice for a bot that must not break someone's live grid overnight, and it means new venues, new unified methods and venue fixes land in CCXT first and reach OctoBot when the pin is bumped.

If you are integrating a venue that CCXT added recently, or you need a fix that shipped last week, calling CCXT yourself removes the wait entirely.

### You configure OctoBot; you program CCXT

OctoBot's surface is a profile, a set of enabled tentacles and a web UI. That is a feature — it is how a grid bot ends up running on a Raspberry Pi with no code written — and it is a ceiling. Anything the trading modes do not express means writing a tentacle against OctoBot's internal APIs, which is a larger commitment than importing a library.

CCXT has no ceiling of that kind and no floor either. There is no scheduler, no persistence, no UI and no strategy: `fetch_order_book` returns an order book, and what happens next is entirely your code.

### Coverage and streaming

CCXT covers 104 exchanges with REST and 76 with WebSocket, and the `watch*` methods span order books, trades, tickers, OHLCV, orders, my-trades, positions and balances. OctoBot's README says "15+ exchanges"; OctoBot-Tentacles carries several dozen exchange tentacle directories, roughly half of them paired with a `_websocket_feed` tentacle for the venues where streaming is wired up.

Beyond order flow, CCXT's unified API covers `fetch_funding_rate_history`, `fetch_open_interest`, `fetch_leverage_tiers`, `fetch_liquidations`, transfers, deposit addresses, and 7 prediction-market venues in `ccxt.prediction` — of which OctoBot ships a tentacle for one, Polymarket.

### One language versus seven

OctoBot is Python. CCXT is written once in TypeScript and transpiled to JavaScript, Python, PHP, C#/.NET, Go and Java with identical method names and return structures. If the execution service is in Go and the research is in Python, the exchange layer is the same library in both.

### Licence

OctoBot is **GPL-3.0**; CCXT is **MIT**. Running OctoBot for yourself raises no question. Building a product that redistributes a modified OctoBot is a legal review before it is an engineering decision, and CCXT's licence does not start that conversation.

## What OctoBot does better

- **Strategies you configure instead of write.** Grid trading, DCA, crypto baskets, market making, TradingView alert automation and LLM-driven modes using OpenAI models or a local Ollama server all ship as trading modes with configurable parameters. In CCXT every one of those is a program you write from scratch.
- **A real interface.** A web UI, a mobile app for iOS and Android, and Telegram control — so the bot can be operated from a phone rather than an SSH session. CCXT has no interface at all, by design.
- **Backtesting and paper trading.** A built-in backtesting engine over historical data with a simulated portfolio, and a trader-simulator mode with configurable maker/taker fees and a starting portfolio, so a profile can be exercised end to end before any money moves. CCXT has neither.
- **Installation for people who do not want to build anything.** Pre-built executables for Windows, macOS, Linux and Raspberry Pi, an official Docker image, and a one-click DigitalOcean deployment, on minimum hardware of one 1 GHz core, 250 MB RAM and 1 GB disk.
- **Per-venue knowledge already written down.** Its exchange tentacles encode retry behaviour for specific error codes, order-not-found error strings, pagination limits and market-status fixes per venue — the kind of thing you only learn by running into it in production.

If you want a trading bot rather than a codebase — especially a grid or DCA bot you will operate from a phone — OctoBot is the better choice, and building the same thing on CCXT would take months.

## Using them together

Migration is the wrong frame: OctoBot *is* a CCXT application. What is worth knowing is where the seam is.

**Inside OctoBot.** Profiles name exchanges by CCXT id and markets by CCXT unified symbol, so anything you learn from the [CCXT manual](/docs/manual) about a venue's ids, symbols and market structure applies directly to an OctoBot config. Exchange tentacles can push configuration into the CCXT client through `get_additional_connector_config()`, which is how OctoBot sets CCXT `options` per venue. For an exchange with no dedicated tentacle, the `configurable_default_ccxt_rest` tentacle runs the generic CCXT REST connector.

**Alongside OctoBot.** Reach for CCXT directly, in your own code, when you need:

| You need | Where it lives |
| --- | --- |
| A venue OctoBot has no tentacle for, right now | `ccxt.<id>()` — 104 to choose from |
| Live order books, trades, orders or positions in your own code | `watch_order_book`, `watch_trades`, `watch_orders`, `watch_positions` on `ccxt.pro.<id>` |
| Funding-rate history, open interest, leverage tiers, liquidations | `fetch_funding_rate_history`, `fetch_open_interest`, `fetch_leverage_tiers`, `fetch_liquidations` |
| Prediction markets beyond Polymarket | `ccxt.prediction.kalshi()`, `ccxt.prediction.limitless()`, `ccxt.prediction.myriad()` |
| A venue-specific endpoint with no unified method | the [implicit API](/docs/exchanges/binance/implicit-api) |
| The exchange layer in Go, C#, TypeScript, PHP or Java | the same CCXT API in that language |

A common shape: OctoBot runs the configured strategies on the venues it knows well, and a small CCXT service handles reporting, a venue outside the tentacle list, or execution that has to react faster than a configured trading mode. They agree about markets and symbols without any glue, because underneath they are the same library.

## FAQ

**Does OctoBot use CCXT?**
Yes, and it says so in its README: "OctoBot supports the vast majority of crypto exchanges thanks to the great CCXT library." OctoBot-Trading lists `ccxt` under "Exchange connection requirements", and its default exchange connector wraps a `ccxt.async_support` or `ccxt.pro` client.

**Can OctoBot trade on an exchange that is not in its list?**
Often, yes. OctoBot's default REST exchange class accepts any exchange name and falls back to the generic CCXT connector, and OctoBot-Tentacles ships a `configurable_default_ccxt_rest` tentacle for that path. Venues with a dedicated tentacle get their quirks handled; the rest get whatever the generic connector and CCXT provide.

**Do I still need CCXT if I use OctoBot?**
You already have it — it is installed as a dependency. You would use it directly for anything outside the bot's shape: your own streaming code, funding-rate or open-interest data, reporting across accounts, a venue OctoBot has not integrated, or a prediction market other than Polymarket.

**Which CCXT version does OctoBot run?**
OctoBot-Trading pins an exact version rather than a range — `ccxt==4.5.28` when this page was written, against CCXT v{{CCXT_VERSION}} current. Pinning is deliberate: the requirements file asks for authenticated exchange tests to pass before the pin changes. If you need something newer, calling CCXT yourself is the way to get it.

**Is CCXT a trading bot?**
No. CCXT is the exchange-access layer: markets, tickers, order books, candles, orders, balances, positions, funding and transfers, unified across 104 venues in eight languages. It has no strategies, no scheduler, no UI and no backtester. OctoBot is one example of the kind of application built on top of it.

**Is CCXT's WebSocket support a paid add-on?**
No. CCXT Pro is bundled in the `ccxt` package under MIT, the same package OctoBot depends on. Use `ccxt.pro.<exchange>` and the `watch*` methods.

## Next steps

- [Install CCXT](/docs/install)
- [Manual](/docs/manual) — unified structures and conventions
- [CCXT Pro manual](/docs/pro-manual) — the `watch*` streaming methods
- [Supported exchanges](/docs/exchange-markets)
- [More comparisons](/docs/comparisons)
