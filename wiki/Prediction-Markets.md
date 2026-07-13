# Prediction Markets

CCXT supports prediction-market exchanges (Polymarket, Kalshi, Limitless, Myriad, and Hyperliquid prediction markets) through a dedicated `prediction` namespace. Prediction exchanges implement the same unified API as regular crypto exchanges, with prices quoted between 0 and 1 USDC per outcome share.

> Per-exchange API references live in the **[Prediction Markets](/docs/prediction)** section, and runnable code is under **[Examples](/docs/examples)**.

```javascript
// JavaScript / TypeScript
const exchange = new ccxt.prediction.polymarket ()
```

```python
# Python (async-only — ccxt.prediction.<id> IS the async class)
import ccxt.prediction
exchange = ccxt.prediction.polymarket()
```

```php
// PHP (async-only, ReactPHP — \ccxt\prediction\<id> IS the async class)
$exchange = new \ccxt\prediction\polymarket();
```

```csharp
// C#
var exchange = new ccxt.prediction.polymarket();
```

```go
// Go
import ccxtprediction "github.com/ccxt/ccxt/go/v4/prediction"
exchange := ccxtprediction.NewPolymarket()
```

```java
// Java
import io.github.ccxt.exchanges.prediction.Polymarket;
Polymarket exchange = new Polymarket();
```

Prediction exchanges are flagged with `exchange.has['prediction']`. Their data model has three levels:

- **events** — a question or grouping, like *"Will X happen by July?"*
- **markets** — each event contains one or more markets, returned by `fetchMarkets()` / `loadMarkets()` with `market['type'] === 'prediction'`
- **outcomes** — each market carries an `outcomes` list (for example YES and NO tokens); each outcome has its own `outcome` handle like `TRUMP_OUT_PRESIDENT_2027:YES`, an exchange-specific `outcomeId`, the parent `market`, and a `label` (e.g. `YES`/`NO`)

How the structures relate — `PredictionEvent` → market → `PredictionOutcome`, where the **outcome** is the tradeable unit that every price/trade method takes. Each market is a standard ccxt `Market` row that additionally carries prediction fields (`marketType`, `executionModel`, `collateral`, …) and its own `outcomes` list:

```mermaid
flowchart TD
    F["fetchEvents() / fetchEvent()"] --> E["PredictionEvent — a question or grouping (id, title, active, resolved, volume)"]
    E -->|"markets: Market[]"| M["Market (+ prediction fields) — marketType: binary / categorical / scalar · executionModel: clob / amm / parimutuel · collateral · tickSize"]
    M -->|"outcomes: PredictionOutcome[] · 1..N"| O["PredictionOutcome — the tradeable unit · outcome handle, outcomeId, label · price 0..1 · bid / ask"]
    O -->|"the outcome handle is what every price / trade method takes"| T["fetchTicker · fetchOrderBook · fetchOHLCV · createOrder · fetchPositions · fetchMyTrades"]
    T --> R["PredictionTicker · PredictionOrderBook · OHLCV[] · PredictionOrder · PredictionPosition[] · PredictionTrade[]"]
    classDef unit stroke:#2563eb,stroke-width:3px;
    class O unit;
```

Prices are probabilities between 0 and 1 per share, `amount` is the number of shares, and `cost` is the collateral spent.

## Unified methods

Prediction exchanges expose the same unified API as crypto exchanges. Discovery starts with events; every **price and trade** method then takes an **outcome handle** (or outcome id) through the `outcome` / `outcomes` parameter instead of a market symbol. Support varies per venue — always check `exchange.has[methodName]` and the [per-exchange reference](/docs/prediction/polymarket).

**Discovery & markets**

- `fetchEvents (params?)` — search events (scope by `query`/`queries`/`tags`/`eventId`/`slug`), caching their markets and outcomes
- `fetchEvent (id, params?)` — a single event by id, slug or ticker
- `fetchMarkets (params?)` / `loadMarkets (reload?)` — every market (each carries `type: 'prediction'` and an `outcomes` list)
- `fetchTime (params?)` — exchange server time

**Market data** — each takes an outcome handle

- `fetchTicker (outcome, params?)` / `fetchTickers (outcomes?, params?)` — last price, bid/ask and volume
- `fetchOrderBook (outcome, limit?, params?)` — bids and asks for an outcome
- `fetchOHLCV (outcome, timeframe?, since?, limit?, params?)` — price-history candles
- `fetchTrades (outcome, since?, limit?, params?)` — public trades
- `fetchOpenInterest (outcome, params?)` — open interest
- `fetchTradingFee (outcome, params?)` — taker / maker fees
- `fetchTradeQuote (outcome, ...)` — an executable quote on AMM venues

**Trading** — `amount` is the number of shares, `price` is a probability between 0 and 1

- `createOrder (outcome, type, side, amount, price?, params?)` — place an order
- `createOrders (orders, params?)` — batch create
- `editOrder (id, outcome, ...)` — amend a resting order
- `cancelOrder (id, outcome?, params?)`, `cancelOrders (ids, ...)`, `cancelAllOrders (outcome?, params?)`

**Account & orders**

- `fetchBalance (params?)` — collateral balances
- `fetchOrder (id, outcome?, params?)`, `fetchOrders`, `fetchOpenOrders`, `fetchClosedOrders`, `fetchCanceledOrders`, `fetchOrderTrades`
- `fetchMyTrades (outcome?, since?, limit?, params?)` — your fills
- `fetchPositions (outcomes?, params?)` / `fetchPosition (outcome, params?)` — open positions
- `fetchStatus (params?)` — exchange operational status

**WebSocket (Pro)** — live streams, also keyed by the outcome handle

- `watchTicker`, `watchTickers`, `watchOrderBook`, `watchTrades`, `watchOHLCV`, `watchOrders`, `watchMyTrades`, `watchPositions`

The rest of this page documents `fetchEvents` and `fetchEvent`, the two entry points unique to prediction markets; the remaining methods behave like their crypto counterparts in [the Manual](/docs/manual), only addressed by outcome.

## fetchEvents

```javascript
fetchEvents (params = {})
```

- `params` — a `fetchEventsParams` object; **must be scoped** by at least one of `query` (a search string), `queries` (a list of strings), `tags`, `eventId` or `slug` — an unscoped call throws `ArgumentsRequired` on every venue (some venues accept extra scope keys, e.g. Kalshi's `category` / `series_ticker`). Optional: `limit`, `sort` (`volume`/`liquidity`/`newest`), `status` (`active`/`inactive`/`closed`/`all`), `searchIn` (`title`/`description`/`both`). The scope is pushed to the venue's API server-side: `tags` resolve to Kalshi series, Polymarket `tag_slug` listings (one per tag), Limitless categories, and Myriad keyword searches. For an unscoped "most active markets" browse use `fetchMarkets ()` — it returns a capped, volume-ordered listing where the venue supports it
- returns an **array of event structures** and caches the discovered events, markets and outcomes on the instance (`exchange.events`, `exchange.outcomes`)

```javascript
// event structure
{
    'id': '903193',                       // exchange-specific event id
    'slug': 'will-x-happen-by-july',      // url slug of the event
    'event': 'WILL_X_HAPPEN_JULY',        // shortened unified event handle (getEvent resolves this)
    'title': 'Will X happen by July?',    // human-readable title
    'markets': [ ... ],                   // a list of market structures, each with an outcomes list
    'active': true,                       // whether the event is still tradable
    'resolved': false,                    // whether the event has been resolved
    'end': 1781234567890,                 // resolution deadline timestamp in ms
    'endDatetime': '2026-07-01T00:00:00Z',
    'info': { ... },                      // the raw exchange response
}
```

A typical workflow:

```javascript
const exchange = new ccxt.prediction.polymarket ()
const events = await exchange.fetchEvents ({ 'query': 'Trump' })
const outcome = events[0]['markets'][0]['outcomes'][0]
const ticker = await exchange.fetchTicker (outcome['outcome'])
const orderbook = await exchange.fetchOrderBook (outcome['outcome'])
const candles = await exchange.fetchOHLCV (outcome['outcome'], '1h')
// place a limit buy of 5 YES shares at 0.40 USDC; prices are 0..1 per share
const order = await exchange.createOrder (outcome['outcome'], 'limit', 'buy', 5, 0.40)
```

Outcome-addressed methods (`fetchTicker`, `createOrder`, …) auto-load the outcome cache on first use — like `loadMarkets()` + `market(symbol)` in regular ccxt — so you don't need to `fetchEvents`/`loadMarkets` first. The auto-load is scoped to the requested outcome: a by-id fetch where the venue has one (Kalshi tickers, Polymarket token ids), otherwise a search derived from the handle — never a bulk listing download. A genuinely unknown outcome throws `BadSymbol`. Call `loadOutcomes()` to warm the cache explicitly, or `getEvent(idOrHandle)` to read a cached event.

## fetchEvent

```javascript
fetchEvent (id, params = {})
```

- `id` — the identifier of a single event. Polymarket accepts the numeric event id or its slug, Kalshi the event ticker, Myriad the `networkId:marketId` market id, and Limitless the market slug or address
- returns a single **event structure** (same shape as the entries returned by `fetchEvents`)

```javascript
const exchange = new ccxt.prediction.polymarket ()
const events = await exchange.fetchEvents ({ 'query': 'Trump' })
const event = await exchange.fetchEvent (events[0]['id'])
```

Supported by `polymarket`, `kalshi`, `myriad` and `limitless` (check `exchange.has['fetchEvent']`); Hyperliquid has no single-event endpoint.

## The outcome cache

Prediction exchanges address an **outcome** (e.g. `TRUMP_WINS:YES`, or its raw `outcomeId`) the way regular ccxt addresses a `symbol`. The outcome cache (`exchange.outcomes` / `exchange.outcomes_by_id`) is loaded automatically on first use, so you rarely touch it directly:

- **Auto-load** — the first outcome-addressed call (`fetchTicker`, `fetchOrderBook`, `createOrder`, …) resolves and caches just the requested outcome (a by-id fetch on Kalshi/Polymarket, the venue's search elsewhere); later calls hit the cache with no extra request. This mirrors `loadMarkets()` + `market(symbol)` without ever downloading the whole listing implicitly.
- **`loadOutcome (outcome, reload = false)`** — resolve one outcome explicitly; `reload = true` skips the cache and refetches the outcome's metadata (status, tick size, token ids) — the per-outcome refresh knob.
- **`loadOutcomes (reload = false, params = {})`** — warm the whole (capped) cache explicitly via the markets listing (the analogue of `loadMarkets`). `reload = true` refetches. This is the only bulk path, and it only runs when you call it.
- **`getEvent (idOrHandle)`** — read a cached event by its id, slug, or shortened handle (the `event` field). Cache-only; call `fetchEvents(...)` first.
- **`options['loadAllOutcomes']`** — defaults to `false`: a cache miss resolves only the requested outcome. Hyperliquid sets it `true` because its entire outcome universe is a single cheap request. Flip it to `true` on any venue to pay the (capped) listing scan on the first miss instead.

An unknown outcome throws `BadSymbol`; a genuinely cold cache accessed through the sync `outcome()` resolver (used inside parsers) throws `ExchangeError`. You never need to pre-load — just call the method.

### All-tickers honesty — `fetchTickers` requires `outcomes`

One ccxt call maps to a bounded number of venue requests. Kalshi, Polymarket, Limitless and Myriad have no endpoint returning every ticker at once, so `fetchTickers ()` without an `outcomes` list throws `ArgumentsRequired` on those venues instead of silently returning a capped subset — pass the outcome handles you actually want (Kalshi batches 100 per request, Polymarket 200 per batched request pair; Limitless costs two requests per market and Myriad one). Hyperliquid serves the whole universe in one `allMids` request, so its no-arg `fetchTickers ()` remains available. Account-scoped methods (`fetchPositions`, `fetchOrders`, `fetchMyTrades`, …) are always a single self-contained request; when the outcome cache is cold their rows are labelled with raw venue ids, and with unified handles once you've scoped a `fetchEvents` call.

## CLI

Every language CLI can target a prediction exchange with the `-p` / `--prediction` flag. Regular ids win for ids present in both namespaces (e.g. `hyperliquid`); `-p` forces the prediction namespace, and prediction-only ids (`polymarket`, `kalshi`, `limitless`, `myriad`) resolve there automatically:

```bash
npm run cli.ts -- -p polymarket fetchEvents '{"query":"trump"}'
npm run cli.py -- --prediction kalshi fetchTicker KXBTC-25DEC31-B100000:YES --sandbox
npm run cli.go -- -p hyperliquid fetchBalance
```
