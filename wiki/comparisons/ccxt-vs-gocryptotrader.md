<!-- title: CCXT vs GoCryptoTrader -->
<!-- description: GoCryptoTrader is a Go trading bot and framework. Compared with CCXT on the part that overlaps — the exchange layer — plus coverage, packaging and scope. -->
<!-- group: Multi-exchange libraries and frameworks -->
<!-- summary: GoCryptoTrader is an application — engine, gRPC server, backtester, database — with a usable exchange package inside it. Only that package competes with CCXT, and it covers 23 venues to CCXT's 104. -->
<!-- weight: 12 -->

# CCXT vs GoCryptoTrader

[GoCryptoTrader](https://github.com/thrasher-corp/gocryptotrader) describes itself as "a cryptocurrency trading bot and framework supporting multiple exchanges written in Golang". That is two things, and only one of them competes with [CCXT](/docs/manual).

The framework part — the `exchanges` package, with a unified Go interface over each venue's REST and WebSocket APIs — is a direct alternative to CCXT. The rest of the repository is an application: a config system, an engine, a gRPC service, a CLI, a database layer, a portfolio tracker and an event-driven backtester. CCXT has no equivalent to any of that, and does not try to. The question that decides between them is whether you want a library to build on or a running system to configure.

## TL;DR

- **Pick GoCryptoTrader** if you want the whole apparatus — config, engine, gRPC/JSON-RPC server, CLI, Postgres or SQLite storage, backtester — and its 23 supported venues are the ones you trade. Its README states plainly that "this bot is under development and is not ready for production".
- **Pick CCXT** if you want a library: 104 venues, 76 with WebSocket, one import, no config file, no engine, and the same API available in eight languages.
- **They are not mutually exclusive.** GoCryptoTrader's exchange wrappers are importable Go packages, and so is CCXT's Go build — nothing stops a Go service from using CCXT for venues GoCryptoTrader does not cover.

## At a glance

| | **CCXT** | **GoCryptoTrader** |
| --- | --- | --- |
| What it is | a library | a bot and framework — the `exchanges` package is the library part |
| Exchanges | 104 with REST, 76 of them with WebSocket | 23 rows in the README's support table; 20 marked "Yes" for WebSocket |
| Stated coverage goal | every venue with a maintained implementation | "the top 30 exchanges sorted by average liquidity as ranked by CoinMarketCap" |
| FIX support | no | the support table's FIX column is "No" or "NA" for every listed exchange |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java, Rust | Go (`go.mod` declares `go 1.26`) |
| Setup before the first call | construct the exchange | `SetDefaults()`, then `Setup()` with a validated `*config.Exchange` |
| Streaming model | `WatchOrderBook` returns the same struct as `FetchOrderBook` | parsed messages are pushed onto `Websocket.DataHandler`, one stream of mixed types |
| Raw endpoint access | implicit methods for every endpoint — 808 for binance, 446 for okx | the exchange package's own exported request methods |
| Unified error types | 41 typed exceptions in one hierarchy | Go `error` values with sentinel errors per package |
| Engine, CLI, gRPC server | none | `engine`, `cmd/gctcli`, `gctrpc` — "gRPC service and JSON RPC proxy" |
| Backtester | none | "an event-driven backtesting tool to test and iterate trading strategies" |
| Storage | none — you write the sink | "Database support (Postgres and SQLite3)" |
| Tagged releases | continuous, on npm, PyPI, NuGet, Packagist, Go modules, Maven Central | none published on GitHub; consumed by `go get` at a commit |
| Last commit read | — | 3 September 2026 on `master` |
| Popularity | 43.8k GitHub stars · **4.68M PyPI + 494k npm installs/month** | 3.5k GitHub stars · 915 forks |
| Licence | MIT | MIT |
| Support | Discord, Telegram, GitHub issues | Slack, GitHub issues, a public Kanban board |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, and against the GoCryptoTrader GitHub repository, README, `go.mod`, `exchanges/interfaces.go` and `docs/ADD_NEW_EXCHANGE.md` read on 3 September 2026. Install counts from the npm and PyPI APIs.</sub>

## The same job, written both ways

Both sides in Go, since that is where the comparison is real. CCXT's Go build lives at `github.com/ccxt/ccxt/go/v4`.

### Fetch a ticker

<!-- tabs:start -->

#### **CCXT**

```go
package main

import (
    "fmt"

    ccxt "github.com/ccxt/ccxt/go/v4"
)

func main() {
    exchange := ccxt.NewBinance(nil)
    ticker, err := exchange.FetchTicker("BTC/USDT")
    if err != nil {
        panic(err)
    }
    fmt.Println(*ticker.Last)
}
```

#### **GoCryptoTrader**

```go
package main

import (
    "context"
    "fmt"

    "github.com/thrasher-corp/gocryptotrader/config"
    "github.com/thrasher-corp/gocryptotrader/currency"
    "github.com/thrasher-corp/gocryptotrader/exchanges/asset"
    "github.com/thrasher-corp/gocryptotrader/exchanges/binance"
)

func main() {
    cfg := &config.Config{}
    if err := cfg.ReadConfigFromFile("config.json", true); err != nil {
        panic(err)
    }
    exchCfg, err := cfg.GetExchangeConfig("Binance")
    if err != nil {
        panic(err)
    }

    var e binance.Exchange
    e.SetDefaults()
    if err := e.Setup(exchCfg); err != nil {
        panic(err)
    }

    tick, err := e.UpdateTicker(context.Background(), currency.NewBTCUSDT(), asset.Spot)
    if err != nil {
        panic(err)
    }
    fmt.Println(tick.Last)
}
```

<!-- tabs:end -->

The extra lines are not incidental — they are the framework showing through. `Setup` takes a `*config.Exchange` and calls `Validate()` on it, so the natural way to get one is to load the project's config file. That is exactly right when you are running the bot, and it is friction when you only wanted a price.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```go
exchange := ccxt.NewBinance(map[string]any{
    "apiKey": "...",
    "secret": "...",
})

order, err := exchange.CreateOrder("BTC/USDT", "limit", "buy", 0.001,
    ccxt.WithCreateOrderPrice(60000))
if err != nil {
    panic(err)
}
fmt.Println(*order.Id)
```

#### **GoCryptoTrader**

```go
resp, err := e.SubmitOrder(context.Background(), &order.Submit{
    Exchange:  "Binance",
    Pair:      currency.NewBTCUSDT(),
    AssetType: asset.Spot,
    Side:      order.Buy,
    Type:      order.Limit,
    Price:     60000,
    Amount:    0.001,
})
if err != nil {
    panic(err)
}
fmt.Println(resp.OrderID)
```

<!-- tabs:end -->

GoCryptoTrader's `order.Submit` is a wide struct — `TimeInForce`, `ReduceOnly`, `Leverage`, `TriggerPrice`, `TriggerPriceType`, `MarginType`, `AutoBorrow`, `AutoRepay` and more are fields on it. CCXT puts the common arguments positionally and everything else in a `params` map. Both approaches work; the struct is more discoverable in an IDE, the map is easier to pass through from configuration.

## Where the differences actually bite

### A library versus an application with a library inside

This is the whole comparison. GoCryptoTrader's repository root holds `engine`, `gctrpc`, `gctscript`, `backtester`, `database`, `portfolio`, `communications`, `connchecker`, `signaler` and a `cmd` tree with fourteen tools in it — `gctcli`, `config_builder`, `dbmigrate`, `dbseed`, `gen_cert`, `gen_otp`, `exchange_template` and more. The README's install instructions are `git clone`, `go build`, copy `config_example.json` to `~/.gocryptotrader/config.json`, edit it, run the binary. That is an application.

CCXT is `import ccxt`. It has no config file, no daemon, no CLI to run, no database. If you want an application you build it; if you already have one, there is nothing to displace.

The practical consequence: the exchange wrappers *are* importable on their own — `exchanges/interfaces.go` defines the `IBotExchange` interface, and each venue package exports a concrete `Exchange` type with `UpdateTicker`, `UpdateOrderbook`, `SubmitOrder` and the rest hanging off it — but they were designed to be driven by the engine, and the setup path shows it.

### Coverage

23 exchanges against 104, and the gap is not in the head of the market — both cover Binance, Kraken, Coinbase, OKX, Bybit, Bitfinex, KuCoin and Deribit. It is in the tail: regional venues, perpetuals-first DEXes, and 7 prediction-market venues in `ccxt.prediction` (Polymarket, Kalshi, Limitless, Myriad, Opinion, plus Binance and Hyperliquid prediction products). GoCryptoTrader is explicit about this being deliberate — it aims at "the top 30 exchanges sorted by average liquidity" — so the difference is a stated scope choice, not an oversight.

Streaming: 20 of GoCryptoTrader's 23 listed exchanges are marked "Yes" for WebSocket. CCXT's `watch*` methods cover 76.

### Eight languages, one API

GoCryptoTrader is Go. CCXT is generated from one TypeScript source into TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java and Rust, with the same method names and return structures in each. If your research runs in a Python notebook and your execution service is in Go, that is one integration rather than two.

<!-- tabs:start -->

#### **Go**

```go
exchange := ccxt.NewBinance(nil)
ticker, err := exchange.FetchTicker("BTC/USDT")
```

#### **Python**

```python
exchange = ccxt.binance()
ticker = exchange.fetch_ticker('BTC/USDT')
```

#### **TypeScript**

```typescript
const exchange = new ccxt.binance ();
const ticker = await exchange.fetchTicker ('BTC/USDT');
```

<!-- tabs:end -->

### Streaming: typed returns versus one data channel

GoCryptoTrader parses each venue's WebSocket messages and pushes the results onto a single `Websocket.DataHandler` stream — a ticker price, a fills payload, an error, all onto the same channel, with the consumer type-switching over them. That is the right shape for an engine that fans everything into one dispatcher.

CCXT returns values from the call site:

```go
import ccxtpro "github.com/ccxt/ccxt/go/v4/pro"

exchange := ccxtpro.NewBinance(nil)

for {
    ob, err := exchange.WatchOrderBook("BTC/USDT")
    if err != nil {
        panic(err)
    }
    fmt.Println(ob.Bids[0], ob.Asks[0])
}
```

`WatchOrderBook` returns the same `OrderBook` struct as `FetchOrderBook`, so swapping a polling loop for a stream leaves the downstream code untouched. Underneath, CCXT does the snapshot-plus-delta alignment, sequence-gap detection, checksum verification where the venue publishes one, and reconnect-and-reseed — per exchange, because every venue sequences differently.

### Adding a venue

Both projects hand-write per-exchange code; the difference is how many times.

GoCryptoTrader's `docs/ADD_NEW_EXCHANGE.md` is 1,117 lines. The path starts with the templating tool (`go run exchange_template.go -name Binance -ws -rest`), then adds a struct to `config_example.json` and `testdata/configtest.json`, registers the venue in `exchanges/support.go`, adds it to the root README template, writes the requester and public/authenticated functions, fills in the wrapper functions, and wires up the WebSocket connection, subscription generation and message handling.

CCXT's per-exchange work happens once, in one TypeScript file, and is transpiled into all eight languages by the build. A venue added this week is available in Python, Go, C#, PHP, Java and JavaScript in the same release.

### Versioning and distribution

GoCryptoTrader publishes no tagged releases on GitHub; you pin a commit through Go modules. That is a normal Go practice, and it means upgrades are a diff against `master` rather than a changelog. CCXT publishes versioned releases continuously to npm, PyPI, NuGet, Packagist, Go modules and Maven Central, so an exchange API change reaches you as a version bump.

## What GoCryptoTrader does better

Genuine advantages, and several have no CCXT counterpart at all:

- **It is a complete system, not a component.** An AES256-encrypted config file, an engine that runs the enabled exchanges, a gRPC service with a JSON-RPC proxy, `gctcli` to drive it, a connection monitor, an NTP client, and communication packages for Slack, Telegram, SMTP and SMS. If what you want is a running bot rather than a dependency, you are most of the way there on day one.
- **An event-driven backtester.** `backtester/` is a first-class part of the project, built to replay historical or custom data through a strategy. CCXT gives you `fetch_ohlcv` and stops there — the backtest engine is yours to write or to bring.
- **Built-in persistence.** Postgres and SQLite3 support, with migration and seeding tools (`dbmigrate`, `dbseed`) and documented OHLCV and trade storage. CCXT deliberately has no storage layer.
- **Asset type as a first-class dimension.** Every wrapper call takes an `asset.Item` — `asset.Spot`, `asset.Margin`, `asset.USDTMarginedFutures`, `asset.CoinMarginedFutures` — so the product line is explicit in the signature rather than carried in options.
- **Go-native performance tuning through build tags.** `-tags=sonic_on` swaps in Bytedance's Sonic JSON decoder; `-tags=udecimal_on` swaps the decimal implementation, with the precision and division trade-offs documented in the README. That kind of compile-time tuning is not available to a transpiled library.
- **Scripting and mock testing.** `gctscript` for in-process strategy scripts and an exchange HTTP mock package for offline wrapper tests.

If you want a configurable trading bot in Go, trade the major venues, and value the engine and backtester more than breadth of exchange coverage, GoCryptoTrader is the better starting point — and its own README asks you to note that it is under development and not ready for production.

## Migrating from GoCryptoTrader to CCXT

Only the exchange layer maps across; the engine, backtester and database have no CCXT equivalent.

| What you are doing | GoCryptoTrader | CCXT (Go) |
| --- | --- | --- |
| Constructing a client | `SetDefaults()` then `Setup(*config.Exchange)` | `ccxt.NewBinance(map[string]any{...})` |
| Symbols | `currency.Pair` + `asset.Item` | `"BTC/USDT"` spot, `"BTC/USDT:USDT"` linear swap |
| Markets metadata | `FetchTradablePairs(ctx, asset)` | `LoadMarkets()` |
| Ticker | `UpdateTicker(ctx, pair, asset)` | `FetchTicker(symbol)` |
| Order book | `UpdateOrderbook(ctx, pair, asset)` | `FetchOrderBook(symbol)` |
| Candles | OHLCV retrieval via the exchange wrapper | `FetchOHLCV(symbol, timeframe)` |
| New order | `SubmitOrder(ctx, *order.Submit)` | `CreateOrder(symbol, type, side, amount, WithCreateOrderPrice(price))` |
| Cancel order | `CancelOrder(ctx, *order.Cancel)` | `CancelOrder(id, symbol)` |
| Balance | `UpdateAccountBalances(ctx, asset)` | `FetchBalance()` |
| Streams | `Websocket.DataHandler` channel | `Watch*` on `github.com/ccxt/ccxt/go/v4/pro` |
| Venue-specific calls | the exchange package's exported methods | the same endpoint as an [implicit method](/docs/exchanges/binance/implicit-api) |

Start with [Install](/docs/install), then the [Manual](/docs/manual).

## FAQ

**Can I use GoCryptoTrader's exchange package as a library without running the bot?**
Yes. `exchanges/interfaces.go` defines the `IBotExchange` interface and each venue package exports a concrete `Exchange` type. You call `SetDefaults()`, then `Setup()` with a validated `*config.Exchange`, then the wrapper methods. The setup path assumes a config file, because the package is written for the engine to drive.

**Which supports more exchanges, CCXT or GoCryptoTrader?**
CCXT — 104 with REST and 76 of those with WebSocket, against the 23 rows in GoCryptoTrader's README support table, 20 of them marked "Yes" for WebSocket. GoCryptoTrader states a target of the top 30 exchanges by average liquidity, so this is a scope difference rather than a gap.

**Does CCXT include a trading engine or a backtester?**
No. CCXT is a library — market data, order entry, accounts, positions and funding across venues. Strategy execution, scheduling, persistence and backtesting are yours to build or to bring from elsewhere. GoCryptoTrader ships all four.

**Is CCXT available for Go?**
Yes — `go get github.com/ccxt/ccxt/go/v4` for REST and `github.com/ccxt/ccxt/go/v4/pro` for WebSocket, with the same method names as the Python, TypeScript, C#, PHP and Java builds. Methods return `(value, error)` in the usual Go style.

**Does GoCryptoTrader support WebSockets?**
Yes, for 20 of the 23 exchanges in its support table. Parsed messages arrive on the exchange's `Websocket.DataHandler` stream rather than as return values. The FIX column in the same table is "No" or "NA" throughout; CCXT does not implement FIX either.

**Is CCXT free?**
Yes. MIT-licensed, including the WebSocket support. GoCryptoTrader is MIT as well.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — unified structures and conventions
- [CCXT Pro manual](/docs/pro-manual) — the `watch*` streaming methods
- [Supported exchanges](/docs/exchange-markets)
- [More comparisons](/docs/comparisons)
