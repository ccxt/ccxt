---
name: ccxt-rust
description: CCXT cryptocurrency exchange library for Rust developers. Covers both REST API (standard) and WebSocket API (real-time). Helps install CCXT, connect to exchanges, fetch market data, place orders, stream live tickers/orderbooks, handle authentication, and manage errors in Rust projects. Use when working with crypto exchanges in Rust applications, trading bots, or low-latency services. Async (tokio), typed wrappers returning Result<T, ExchangeError>.
---

# CCXT for Rust

A comprehensive guide to using CCXT in Rust projects for cryptocurrency exchange integration.

Every exchange has a **typed wrapper** (`ccxt::Binance`, `ccxt::Kraken`, …) exposing the unified
CCXT API with native Rust return types — `Ticker`, `Order`, `OrderBook`, `Market` — instead of a
dynamic value. All methods are `async` and return `Result<T, ExchangeError>`.

## Installation

### REST API

```bash
cargo add ccxt tokio --features tokio/full
```

### WebSocket API (ccxt.pro)

```bash
cargo add ccxt-pro
```

### Prediction markets

```bash
cargo add ccxt-prediction
```

### Cargo.toml

```toml
[dependencies]
ccxt = "4.5.75"                 # REST exchanges (typed) — required
ccxt-pro = "4.5.75"             # WebSocket (watch*) exchanges — only if you stream
ccxt-prediction = "4.5.75"      # prediction markets — only if you trade them
tokio = { version = "1", features = ["full"] }
```

### Requirements

- Rust **stable**, edition 2021 or later.
- A **tokio** runtime — every unified method is `async`. There is no sync API.
- `ccxt` alone is enough for REST. Add `ccxt-pro` only when you need `watch_*`; it is a separate
  crate so a REST-only build does not compile the whole WebSocket surface.

## Quick Start

### REST API

```rust
use ccxt::{Binance, Params};

#[tokio::main]
async fn main() -> Result<(), ccxt::ExchangeError> {
    let mut exchange = Binance::new(None);
    exchange.load_markets(false).await;

    let ticker = exchange.fetch_ticker("BTC/USDT", Params::none()).await?;
    println!("{} last={:?} bid={:?} ask={:?}", ticker.symbol, ticker.last, ticker.bid, ticker.ask);
    Ok(())
}
```

### WebSocket API — real-time updates

```rust
use ccxt::Params;
use ccxt_pro::Binance;

#[tokio::main]
async fn main() -> Result<(), ccxt::ExchangeError> {
    let mut exchange = Binance::new(None);
    exchange.try_load_markets(false).await?;

    loop {
        let ticker = exchange.watch_ticker("BTC/USDT", Params::none()).await?;
        println!("{:?}", ticker.last); // live updates
    }
}
```

Each `watch_*` call resolves to **one** decoded update, so consuming a stream is just calling it in
a loop.

## Crate layout

| Crate | Contains | Use when |
|---|---|---|
| `ccxt` | Typed REST wrappers (`ccxt::Binance`, …), `Params`, `Config`, `types::*`, `TypedExchange`. Re-exports the whole engine at its root. | Always |
| `ccxt-pro` | Typed WebSocket wrappers (`ccxt_pro::Binance`, …) with `watch_*` | Streaming |
| `ccxt-prediction` | Typed prediction-market wrappers (`ccxt_prediction::Kalshi`, …) | Prediction markets |
| `ccxt-base` | The untyped engine (`Value`, HTTP, crypto, rate limiter, Cores, WS infra) | Rarely direct — `ccxt` re-exports it |

`ccxt` re-exports `ccxt-base` at its root, so `ccxt::Value`, `ccxt::runtime::…`,
`ccxt::exchanges::binance::BinanceCore` resolve alongside the typed `ccxt::Binance`.

Coverage today: **105** typed REST venues, **76** typed WebSocket venues, **7** prediction venues.

## REST vs WebSocket

| Feature | REST API | WebSocket API |
|---------|----------|---------------|
| **Use for** | One-time queries, placing orders | Real-time monitoring, live price feeds |
| **Crate** | `ccxt` | `ccxt-pro` |
| **Import** | `use ccxt::Binance;` | `use ccxt_pro::Binance;` |
| **Methods** | `fetch_*` (`fetch_ticker`, `fetch_order_book`) | `watch_*` (`watch_ticker`, `watch_order_book`) |
| **Speed** | Slower (HTTP request/response) | Faster (persistent connection) |
| **Rate limits** | Strict (1–2 req/sec) | More lenient (continuous stream) |
| **Best for** | Trading, account management | Price monitoring, arbitrage detection |

Both crates expose a type named `Binance`. When you use both in one file, alias one of them:

```rust
use ccxt::Binance as BinanceRest;
use ccxt_pro::Binance as BinanceWs;
```

## Runtime setup

Two settings matter in real programs and are easy to miss:

```rust
fn main() {
    // 1. The transpiled core signals errors by panicking across an internal
    //    catch_unwind; the typed layer turns that back into `Result`. Silencing
    //    the default hook stops caught panics from printing to stderr.
    //    Set CCXT_SHOW_PANICS=1 to see them while debugging.
    if std::env::var("CCXT_SHOW_PANICS").is_err() {
        std::panic::set_hook(Box::new(|_| {}));
    }

    // 2. The generated exchange code is deeply nested — give worker threads a
    //    large stack. The default 2 MB can overflow on some venues.
    let rt = tokio::runtime::Builder::new_multi_thread()
        .worker_threads(2)
        .thread_stack_size(64 * 1024 * 1024)
        .enable_all()
        .build()
        .unwrap();

    rt.block_on(run());
}
```

`#[tokio::main]` is fine for short examples and scripts; use the explicit builder for anything
long-running.

## Creating an Exchange Instance

### Public (no authentication)

```rust
use ccxt::Binance;

let mut exchange = Binance::new(None);
```

### Private (with credentials), via the `Config` builder

```rust
use ccxt::{Binance, Config, Params};

let mut exchange = Binance::with_config(
    Config::new()
        .api_key("YOUR_API_KEY")
        .secret("YOUR_SECRET")
        .enable_rate_limit(true)       // on by default
        .timeout_ms(10_000)
        .option_str("defaultType", "swap")
        .option("fetchMarkets", Params::new().with_strs("types", &["spot", "linear"])),
);
```

`Config` covers every credential (`api_key`, `secret`, `password`, `uid`, `wallet_address`,
`private_key`, `token`), plus `sandbox`, `verbose`, `enable_rate_limit`, `rate_limit_ms`,
`timeout_ms`, and arbitrary properties via `set_str` / `set_int` / `set_float` / `set_bool`.
`options` nests exactly as in the other bindings: `option_str`/`option_int`/`option_bool`/
`option_strs` for a flat key, `option(key, Params)` for a nested object, `options(Params)` for a
whole block. Repeated calls deep-merge rather than replace.

### Settings after construction

The core's fields are dynamic, and the wrapper derefs read-only, so `exchange.verbose = true`
does not compile. Use the setters — they chain:

```rust
let mut exchange = Binance::new(None);
exchange.set_api_key("YOUR_API_KEY");
exchange.set_secret("YOUR_SECRET");
exchange.set_verbose(true).set_timeout_ms(10_000);
exchange.set_enable_rate_limit(true);
exchange.set_options(Params::new().with_str("defaultType", "spot"));

println!("{} {} {}", exchange.id(), exchange.is_verbose(), exchange.is_sandbox_mode_enabled());
```

### Sandbox / testnet

```rust
// at construction
let mut a = Binance::with_config(Config::new().sandbox(true));

// or afterwards — returns Err(NotSupported) when the venue has no testnet
let mut b = Binance::new(None);
b.set_sandbox_mode(true)?;
```

### Choosing an exchange at runtime

`from_id` / `from_id_with_config` build any supported venue from its id and hand back a trait
object; the typed API stays available through `TypedExchangeExt`.

```rust
use ccxt::{from_id_with_config, Config, Params, TypedExchange, TypedExchangeExt};

for id in ["binance", "bybit", "okx"] {
    let Some(mut exchange) = from_id_with_config(id, Config::new().enable_rate_limit(true)) else {
        continue; // unknown id
    };
    exchange.load_markets(false).await;
    let ticker = exchange.fetch_ticker("BTC/USDT", Params::none()).await?;
    println!("{id} {:?}", ticker.last);
}
```

`Box<dyn TypedExchange>` works because `TypedExchange` is object-safe; the ergonomic typed methods
live on the blanket `TypedExchangeExt`, so **both traits must be in scope**. The same pair exists in
`ccxt_pro` (for `watch_*`) and `ccxt_prediction`.

Write generic code the same way:

```rust
async fn best_bid<E: TypedExchange + TypedExchangeExt>(ex: &mut E) -> Result<Option<f64>, ccxt::ExchangeError> {
    Ok(ex.fetch_ticker("BTC/USDT", Params::none()).await?.bid)
}
```

## The `params` argument

Every unified method ends with `params` — the venue-specific knobs. On the typed layer that is a
`Params` builder over Rust primitives, never a dynamic value:

```rust
use ccxt::Params;

// nothing extra — these three are equivalent
exchange.fetch_ticker("BTC/USDT", Params::none()).await?;
exchange.fetch_ticker("BTC/USDT", ()).await?;
exchange.fetch_ticker("BTC/USDT", [("recvWindow", "5000")]).await?;

// venue-specific extras
exchange.create_order(
    "BTC/USDT", "limit", "buy", 0.001, Some(50_000.0),
    Params::new()
        .with_str("clientOrderId", "my-order-1")
        .with_bool("postOnly", true)
        .with_str("timeInForce", "GTC")
        .with_float("triggerPrice", 49_000.0)
        .with_int("recvWindow", 5_000)
        .with_strs("clientOrderIds", &["a", "b"]),
).await?;
```

Builders: `with_str`, `with_int`, `with_float`, `with_bool`, `with_strs`, `with_json`,
`with_params` (nested object). Entries keep insertion order, which some signing routines depend on.
Unified params (`clientOrderId`, `postOnly`, `timeInForce`, `reduceOnly`, `triggerPrice`, …) mean
the same thing on every venue — CCXT translates them into whatever the exchange wants on the wire.

## Common REST Operations

### Loading markets

```rust
// Untyped, panics on failure — fine for scripts
exchange.load_markets(false).await;

// Preferred: fallible and typed
let markets: Vec<ccxt::types::Market> = exchange.try_load_markets(false).await?;
```

Loading markets is required before any call that resolves a unified symbol.

### Market metadata

Trading rules can be checked locally, before sending an order and without an extra request:

```rust
let market = exchange.market("BTC/USDT")?;          // Err(BadSymbol) when not listed
println!("{} {} active={}", market.symbol, market.market_type, market.active);
println!("min amount {:?}  min cost {:?}", market.limits.amount.min, market.limits.cost.min);
println!("amount step {:?}  price tick {:?}", market.precision.amount, market.precision.price);

let swaps: Vec<_> = exchange.markets().into_iter().filter(|m| m.swap && m.active).collect();
let symbols: Vec<String> = exchange.symbols();
let currencies = exchange.currencies();
```

`Market` fields: `id`, `symbol`, `base`, `quote`, `settle`, `base_id`, `quote_id`, `market_type`,
`spot`, `margin`, `swap`, `future`, `option`, `active`, `contract`, `linear`, `inverse`, `taker`,
`maker`, `limits`, `precision`, `raw`.

### Fetching a ticker

```rust
let ticker = exchange.fetch_ticker("BTC/USDT", Params::none()).await?;
println!("{:?}", ticker.last);           // last price
println!("{:?}", ticker.bid);            // best bid
println!("{:?}", ticker.ask);            // best ask
println!("{:?}", ticker.base_volume);    // 24h volume
println!("{:?}", ticker.timestamp);

// Multiple tickers (if supported) -> HashMap<String, Ticker>
let tickers = exchange
    .fetch_tickers(Some(vec!["BTC/USDT".into(), "ETH/USDT".into()]), Params::none())
    .await?;
for (symbol, t) in &tickers {
    println!("{symbol} {:?}", t.last);
}
```

Numeric fields are `Option<f64>` — a venue that does not publish a field yields `None`, not `0.0`.

### Fetching an order book

```rust
let book = exchange.fetch_order_book("BTC/USDT", Some(5), Params::none()).await?;
if let Some(bid) = book.bids.first() {
    println!("top bid price={} amount={}", bid[0], bid[1]);
}
if let Some(ask) = book.asks.first() {
    println!("top ask price={} amount={}", ask[0], ask[1]);
}
```

`bids` / `asks` are `Vec<[f64; 2]>` — `[price, amount]`, best first. Pass `None` for full depth.

### Fetching OHLCV (candlesticks)

```rust
use ccxt::types::OHLCV;   // = [f64; 6]

let candles: Vec<OHLCV> = exchange
    .fetch_ohlcv("BTC/USDT", Some("1h"), None, Some(100), Params::none())
    .await?;

for c in &candles {
    println!("ts={} o={} h={} l={} c={} v={}", c[0], c[1], c[2], c[3], c[4], c[5]);
}
```

### Fetching trades

```rust
// Recent public trades
let trades = exchange.fetch_trades("BTC/USDT", None, Some(50), Params::none()).await?;

// Your trades (requires authentication)
let my_trades = exchange.fetch_my_trades(Some("BTC/USDT"), None, Some(50), Params::none()).await?;
```

### Fetching balance

```rust
let balance = exchange.fetch_balance(()).await?;
println!("{:?}", balance.free.get("USDT"));    // available
println!("{:?}", balance.used.get("USDT"));    // held in orders
println!("{:?}", balance.total.get("USDT"));   // free + used
```

`free` / `used` / `total` are `HashMap<String, f64>` keyed by currency code; `balance.info` holds
the raw venue payload.

### Creating orders

```rust
// Generic
let order = exchange
    .create_order("BTC/USDT", "limit", "buy", 0.001, Some(50_000.0), Params::none())
    .await?;
println!("{:?} {:?} {:?}", order.id, order.status, order.filled);

// Market orders take `None` for price
let order = exchange
    .create_order("BTC/USDT", "market", "sell", 0.001, None, Params::none())
    .await?;

// Convenience constructors
let o = exchange.create_limit_buy_order("BTC/USDT", 0.001, 50_000.0, Params::none()).await?;
let o = exchange.create_limit_sell_order("BTC/USDT", 0.001, 60_000.0, Params::none()).await?;
let o = exchange.create_market_buy_order("BTC/USDT", 0.001, Params::none()).await?;
let o = exchange.create_market_sell_order("BTC/USDT", 0.001, Params::none()).await?;
let o = exchange.create_market_buy_order_with_cost("BTC/USDT", 100.0, Params::none()).await?;

// Trigger / conditional
//                                       symbol      side    amount  price     trigger
let o = exchange.create_stop_limit_order("BTC/USDT", "sell", 0.001, 47_900.0, 48_000.0, Params::none()).await?;
//                                        symbol      side    amount  trigger
let o = exchange.create_stop_market_order("BTC/USDT", "sell", 0.001, 48_000.0, Params::none()).await?;
//                                    symbol      type     side    amount  price           trigger
let o = exchange.create_trigger_order("BTC/USDT", "limit", "sell", 0.001, Some(47_900.0), Some(48_000.0), Params::none()).await?;
```

### Managing orders

```rust
let open = exchange.fetch_open_orders(Some("BTC/USDT"), None, None, Params::none()).await?;
let closed = exchange.fetch_closed_orders(Some("BTC/USDT"), None, None, Params::none()).await?;
let all = exchange.fetch_orders(Some("BTC/USDT"), None, None, Params::none()).await?;
let one = exchange.fetch_order("12345", Some("BTC/USDT"), Params::none()).await?;

let edited = exchange
    .edit_order("12345", "BTC/USDT", "limit", "buy", Some(0.002), Some(49_000.0), Params::none())
    .await?;

let canceled = exchange.cancel_order("12345", Some("BTC/USDT"), Params::none()).await?;
let batch = exchange.cancel_orders(vec!["1".into(), "2".into()], Some("BTC/USDT"), Params::none()).await?;
let everything = exchange.cancel_all_orders(Some("BTC/USDT"), Params::none()).await?;
```

`Order` fields: `id`, `client_order_id`, `symbol`, `timestamp`, `datetime`, `status`
(`"open" | "closed" | "canceled" | "expired"`), `order_type`, `side`, `price`, `amount`, `filled`,
`remaining`, `cost`, `fee`, `raw`. Note `order_type` — `type` is a Rust keyword.

### Positions (derivatives)

```rust
let positions = exchange.fetch_positions(None, Params::none()).await?;
for p in &positions {
    println!("{} {:?} contracts={:?} entry={:?} upnl={:?}",
        p.symbol, p.side, p.contracts, p.entry_price, p.unrealized_pnl);
}

let one = exchange.fetch_position("BTC/USDT:USDT", Params::none()).await?;
let closed = exchange.close_position("BTC/USDT:USDT", Some("long"), Params::none()).await?;
```

## WebSocket Operations (Real-time)

All examples use `ccxt_pro`. Load markets once before watching.

### Watching a ticker

```rust
use ccxt::Params;
use ccxt_pro::Binance;

let mut exchange = Binance::new(None);
exchange.try_load_markets(false).await?;

loop {
    match exchange.watch_ticker("BTC/USDT", Params::none()).await {
        Ok(t) => println!("{:?} {:?}", t.last, t.timestamp),
        Err(e) => { eprintln!("[{}] {}", e.kind, e.message); break; }
    }
}
```

### Watching an order book

```rust
loop {
    let book = exchange.watch_order_book("BTC/USDT", Some(20), Params::none()).await?;
    println!("{:?} {:?}", book.bids.first(), book.asks.first());
}
```

`limit` is best-effort — some venues only publish a full book, so expect more levels than requested.

### Watching trades

```rust
loop {
    let trades = exchange.watch_trades("BTC/USDT", None, Some(50), Params::none()).await?;
    for t in &trades {
        println!("{:?} {:?} {:?} {:?}", t.datetime, t.side, t.price, t.amount);
    }
}
```

One update carries the batch of trades the venue published, not a single trade.

### Watching OHLCV

```rust
loop {
    let candles = exchange.watch_ohlcv("BTC/USDT", Some("1m"), None, None, Params::none()).await?;
    if let Some(c) = candles.last() {
        println!("close={} volume={}", c[4], c[5]);
    }
}
```

### Watching multiple symbols on one connection

```rust
let symbols = vec!["BTC/USDT".to_string(), "ETH/USDT".to_string()];

let trades = exchange.watch_trades_for_symbols(symbols.clone(), None, None, Params::none()).await?;
let book = exchange.watch_order_book_for_symbols(symbols, Some(10), Params::none()).await?;
let tickers = exchange.watch_tickers(Some(vec!["BTC/USDT".into()]), Params::none()).await?;
```

These multiplex over a single WebSocket connection instead of opening one per symbol.

### Watching your orders / trades / balance / positions (auth required)

```rust
use ccxt::{Config, Params};
use ccxt_pro::Binance;

let mut exchange = Binance::with_config(Config::new().api_key("KEY").secret("SECRET"));
exchange.try_load_markets(false).await?;

loop {
    let orders = exchange.watch_orders(Some("BTC/USDT"), None, None, Params::none()).await?;
    for o in &orders {
        println!("{:?} {:?} {:?}", o.id, o.status, o.filled);
    }
}
```

```rust
let my_trades = exchange.watch_my_trades(Some("BTC/USDT"), None, None, Params::none()).await?;
let balance = exchange.watch_balance(Params::none()).await?;
let positions = exchange.watch_positions(None, None, None, Params::none()).await?;
```

`watch_orders` and `watch_my_trades` share one user-data stream and one authentication, so
subscribing to both costs a single connection.

### Concurrent subscriptions

A `watch_*` call needs `&mut self`, so two streams from the *same* instance cannot be awaited
concurrently. Either interleave them in one loop, or give each stream its own instance:

```rust
let mut a = ccxt_pro::Binance::new(None);
let mut b = ccxt_pro::Binance::new(None);
a.try_load_markets(false).await?;
b.try_load_markets(false).await?;

let (btc, eth) = tokio::join!(
    a.watch_ticker("BTC/USDT", Params::none()),
    b.watch_ticker("ETH/USDT", Params::none()),
);
```

For many symbols on one venue, prefer the `*_for_symbols` variants above — one connection, one task.

### Closing connections

There is **no typed `close()` and no typed `un_watch_*` yet**. WebSocket clients live in a global
registry keyed by URL, so dropping the exchange value does not by itself disconnect. To force a
disconnect, drop the client for that URL:

```rust
ccxt::pro::ws_client::drop_client("wss://stream.binance.com:9443/ws");
```

For a process that streams until exit, doing nothing is fine.

## Complete Method Reference

Rust method names are the `snake_case` form of the unified CCXT names — `fetchOHLCV` is
`fetch_ohlcv`, `createOrder` is `create_order`, `watchOrderBook` is `watch_order_book`.

**124** unified REST methods are available as typed wrappers (`ccxt`), and **25** `watch_*` methods
on top of those in `ccxt-pro`. Anything outside that list is still reachable untyped — see
[Untyped escape hatch](#untyped-escape-hatch).

### Market data

- `fetch_markets(params)` — all markets
- `fetch_currencies(params)` — all currencies
- `fetch_ticker(symbol, params)` / `fetch_tickers(symbols, params)`
- `fetch_spot_tickers(symbols, params)` / `fetch_contract_tickers(symbols, params)`
- `fetch_bids_asks(symbols, params)` — best bid/ask for many symbols
- `fetch_mark_price(symbol, params)` / `fetch_mark_prices(symbols, params)`
- `fetch_order_book(symbol, limit, params)` / `fetch_order_books(symbols, limit, params)`
- `fetch_l3_order_book(symbol, limit, params)`
- `fetch_trades(symbol, since, limit, params)`
- `fetch_ohlcv(symbol, timeframe, since, limit, params)`
- `fetch_spot_ohlcv` / `fetch_contract_ohlcv` / `fetch_index_ohlcv` / `fetch_mark_ohlcv` / `fetch_premium_index_ohlcv`
- `fetch_time(params)` — server time
- `fetch_status(params)` — exchange status

### Account & balance

- `fetch_balance(params)` 🔒
- `fetch_free_balance` / `fetch_used_balance` / `fetch_total_balance` / `fetch_partial_balance` 🔒
- `fetch_ledger(code, since, limit, params)` / `fetch_ledger_entry(id, code, params)` 🔒
- `fetch_transactions` / `fetch_deposits` / `fetch_withdrawals` / `fetch_deposits_withdrawals` 🔒
- `fetch_borrow_interest(code, symbol, since, limit, params)` 🔒
- `fetch_cross_borrow_rate(code, params)` / `fetch_isolated_borrow_rate(symbol, params)`

### Trading

Creating:

- `create_order(symbol, type, side, amount, price, params)` 🔒
- `create_limit_order` / `create_market_order` 🔒
- `create_limit_buy_order` / `create_limit_sell_order` 🔒
- `create_market_buy_order` / `create_market_sell_order` 🔒
- `create_market_order_with_cost` / `create_market_buy_order_with_cost` / `create_market_sell_order_with_cost` 🔒
- `create_stop_order` / `create_stop_limit_order` / `create_stop_market_order` 🔒
- `create_stop_loss_order` / `create_take_profit_order` / `create_trigger_order` 🔒
- `create_trailing_amount_order` / `create_trailing_percent_order` 🔒
- `create_post_only_order` / `create_reduce_only_order` / `create_twap_order` 🔒
- `create_order_with_take_profit_and_stop_loss(...)` 🔒
- `create_orders(orders, params)` — batch 🔒

Managing:

- `fetch_order(id, symbol, params)` / `fetch_order_with_client_order_id` 🔒
- `fetch_orders` / `fetch_open_orders` / `fetch_closed_orders` / `fetch_canceled_orders` /
  `fetch_canceled_and_closed_orders` 🔒
- `fetch_order_status(id, symbol, params)` / `fetch_order_trades(id, symbol, since, limit, params)` 🔒
- `fetch_my_trades(symbol, since, limit, params)` 🔒
- `edit_order(id, symbol, type, side, amount, price, params)` / `edit_orders` /
  `edit_order_with_client_order_id` / `edit_limit_order` / `edit_limit_buy_order` / `edit_limit_sell_order` 🔒
- `cancel_order(id, symbol, params)` / `cancel_orders(ids, symbol, params)` /
  `cancel_all_orders(symbol, params)` / `cancel_orders_for_symbols(orders, params)` /
  `cancel_order_with_client_order_id` / `cancel_orders_with_client_order_ids` 🔒

### Derivatives & futures

- `fetch_position(symbol, params)` / `fetch_positions(symbols, params)` /
  `fetch_positions_for_symbol` / `fetch_positions_risk` 🔒
- `fetch_position_history` / `fetch_positions_history` 🔒
- `close_position(symbol, side, params)` / `close_all_positions(params)` 🔒
- `fetch_leverage(symbol, params)` / `fetch_leverages(symbols, params)` /
  `fetch_market_leverage_tiers(symbol, params)`
- `fetch_margin_mode(symbol, params)` / `fetch_margin_modes(symbols, params)`
- `fetch_funding_rate(symbol, params)` / `fetch_funding_rates(symbols, params)` /
  `fetch_funding_interval` / `fetch_funding_intervals`
- `fetch_open_interest(symbol, params)` / `fetch_open_interests` / `fetch_open_interest_history`
- `fetch_liquidations(symbol, since, limit, params)` / `fetch_my_liquidations` 🔒
- `fetch_greeks(symbol, params)` / `fetch_all_greeks(symbols, params)` — options

### Fees, deposits, withdrawals, transfers

- `fetch_trading_fee(symbol, params)` / `fetch_trading_fees(params)` 🔒
- `fetch_deposit_address(code, params)` / `fetch_deposit_addresses(codes, params)` /
  `fetch_deposit_addresses_by_network(code, params)` / `create_deposit_address(code, params)` 🔒
- `withdraw(code, amount, address, tag, params)` 🔒
- `transfer(code, amount, from_account, to_account, params)` / `fetch_transfer` / `fetch_transfers` 🔒
- `fetch_convert_currencies(params)`

### WebSocket (`ccxt-pro`)

Public:

- `watch_ticker(symbol, params)` / `watch_tickers(symbols, params)`
- `watch_bids_asks(symbols, params)`
- `watch_mark_price(symbol, params)` / `watch_mark_prices(symbols, params)`
- `watch_order_book(symbol, limit, params)` / `watch_order_book_for_symbols(symbols, limit, params)`
- `watch_trades(symbol, since, limit, params)` / `watch_trades_for_symbols(symbols, since, limit, params)`
- `watch_ohlcv(symbol, timeframe, since, limit, params)`
- `watch_funding_rate(symbol, params)` / `watch_funding_rates(symbols, params)` / `watch_funding_rates_for_symbols`
- `watch_liquidations(symbol, since, limit, params)` / `watch_liquidations_for_symbols`

Private 🔒:

- `watch_balance(params)`
- `watch_orders(symbol, since, limit, params)` / `watch_orders_for_symbols`
- `watch_my_trades(symbol, since, limit, params)` / `watch_my_trades_for_symbols`
- `watch_positions(symbols, since, limit, params)` / `watch_position` / `watch_position_for_symbols`
- `watch_my_liquidations(symbol, since, limit, params)` / `watch_my_liquidations_for_symbols`

🔒 = requires API credentials.

### Optional parameters

Optional scalars are `Option<T>` and nullable string arguments are `Option<&str>`:

```rust
exchange.fetch_ohlcv("BTC/USDT", Some("1h"), None, Some(100), Params::none()).await?;
//                                timeframe  since  limit

exchange.fetch_open_orders(None, None, None, Params::none()).await?;  // all symbols
```

Symbol lists are `Option<Vec<String>>` — `None` means "all":

```rust
exchange.fetch_tickers(None, Params::none()).await?;
exchange.fetch_positions(Some(vec!["BTC/USDT:USDT".into()]), Params::none()).await?;
```

### Checking method availability

Not every exchange implements every method. `has` is reachable through the wrapper's `Deref`:

```rust
if ccxt::safe_bool(&exchange.has, "fetchOHLCV", Some(false)).unwrap_or(false) {
    let candles = exchange.fetch_ohlcv("BTC/USDT", Some("1h"), None, Some(100), Params::none()).await?;
}
```

The keys are the **camelCase** unified names (`fetchOHLCV`, `createOrder`), matching every other
CCXT binding. A `ccxt_pro` instance carries the `watch*` and `*Ws` keys (`watchOrderBook`,
`createOrderWs`) on its own `has`; a REST instance does not. Calling a method the venue does not
implement returns `Err(NotSupported)`, so checking first is an optimisation, not a requirement.

## Authentication

### Setting API keys

```rust
use ccxt::{Binance, Config};

let mut exchange = Binance::with_config(
    Config::new()
        .api_key(&std::env::var("BINANCE_APIKEY").unwrap())
        .secret(&std::env::var("BINANCE_SECRET").unwrap()),
);
```

Other credentials, when a venue needs them:

```rust
Config::new()
    .api_key("...")
    .secret("...")
    .password("passphrase")      // okx, kucoin, …
    .uid("...")                  // kraken, …
    .wallet_address("0x...")     // hyperliquid, …
    .private_key("0x...")        // hyperliquid, dydx, …
    .token("...");
```

Never hard-code credentials — read them from the environment or a secrets store.

### Testing authentication

```rust
match exchange.fetch_balance(()).await {
    Ok(b) => println!("authenticated, {} currencies", b.total.len()),
    Err(e) if e.is("AuthenticationError") => println!("invalid credentials: {}", e.message),
    Err(e) => println!("[{}] {}", e.kind, e.message),
}
```

## Error Handling

Every typed method returns `Result<T, ExchangeError>`. `ExchangeError` carries a `kind` (the leaf
class name) and a `message`, plus `is()` / `is_a()`, which walk the unified CCXT class hierarchy —
so one handler covers a whole family.

### Hierarchy

```
BaseError
├─ ExchangeError                 (non-recoverable — the request or account state is wrong)
│  ├─ AuthenticationError
│  │  ├─ PermissionDenied → AccountNotEnabled
│  │  └─ AccountSuspended
│  ├─ ArgumentsRequired
│  ├─ BadRequest → BadSymbol
│  ├─ OperationRejected          (NoChange, MarginModeAlreadySet, MarketClosed, …)
│  ├─ InsufficientFunds
│  ├─ InvalidAddress → AddressPending
│  ├─ InvalidOrder
│  │  ├─ OrderNotFound
│  │  ├─ DuplicateOrderId
│  │  ├─ OrderNotFillable / OrderImmediatelyFillable
│  │  └─ ContractUnavailable
│  └─ NotSupported
└─ OperationFailed               (transient — retry)
   ├─ NetworkError
   │  ├─ RequestTimeout
   │  ├─ RateLimitExceeded
   │  ├─ DDoSProtection
   │  ├─ ExchangeNotAvailable → OnMaintenance
   │  └─ InvalidNonce → ChecksumError
   ├─ BadResponse → NullResponse
   └─ CancelPending
```

### Matching on the hierarchy

```rust
match exchange.create_order("BTC/USDT", "limit", "buy", 0.001, Some(50_000.0), Params::none()).await {
    Ok(order) => println!("{:?}", order.id),
    Err(e) if e.is("InsufficientFunds")     => println!("not enough balance"),
    Err(e) if e.is("OrderNotFound")         => println!("already filled or cancelled"),
    Err(e) if e.is("InvalidOrder")          => println!("bad parameters: {}", e.message),
    Err(e) if e.is("AuthenticationError")   => println!("check credentials"),
    Err(e) if e.is("RateLimitExceeded")     => println!("back off"),
    Err(e) if e.is("NetworkError")          => println!("transient: {}", e.kind),
    Err(e)                                  => println!("[{}] {}", e.kind, e.message),
}
```

**Order the arms most-specific first.** `OrderNotFound.is("InvalidOrder")` is true, so an
`InvalidOrder` arm placed above it swallows the more specific case.

Match on the hierarchy, **never on message text** — messages are venue-specific and change.

### Retry with backoff

Retry only the `OperationFailed` subtree. Everything under `ExchangeError` is a bug in the request
or the account state and will fail again.

```rust
use std::time::Duration;

async fn fetch_with_retry(ex: &mut ccxt::Binance, symbol: &str) -> Result<ccxt::types::Ticker, ccxt::ExchangeError> {
    let mut delay = Duration::from_millis(500);
    for attempt in 0..5 {
        match ex.fetch_ticker(symbol, Params::none()).await {
            Ok(t) => return Ok(t),
            Err(e) if e.is("NetworkError") && attempt < 4 => {
                eprintln!("retry {} after [{}]", attempt + 1, e.kind);
                tokio::time::sleep(delay).await;
                delay *= 2;
            }
            Err(e) => return Err(e),
        }
    }
    unreachable!()
}
```

### Errors from `load_markets`

`load_markets` returns a `Value` and **panics** on failure. Use `try_load_markets`, which returns
`Result<Vec<Market>, ExchangeError>` — loading really can fail (a venue outage, or a venue whose
currency load is authenticated rejecting bad credentials).

```rust
if let Err(e) = exchange.try_load_markets(false).await {
    eprintln!("cannot load markets: [{}] {}", e.kind, e.message);
    return;
}
```

## Rate Limiting

The built-in leaky-bucket limiter is **on by default** — requests are spaced by `rateLimit`
milliseconds, weighted per endpoint.

```rust
let mut exchange = Binance::with_config(Config::new().enable_rate_limit(true));

// or afterwards
exchange.set_enable_rate_limit(true);
exchange.set_rate_limit_ms(50);
```

Turn it off only if you throttle externally. Note that **each exchange instance has its own
limiter** — several instances hitting the same venue with the same API key can still trip a ban, so
share one instance per venue per key.

## Proxy Configuration

```rust
// at construction
let cfg = Config::new().set_str("httpsProxy", "http://127.0.0.1:8080");
let mut exchange = ccxt::Binance::with_config(cfg);

// or afterwards — set at most ONE of these; conflicting settings are rejected
exchange.set_http_proxy("http://user:pass@127.0.0.1:8080");
exchange.set_https_proxy("http://127.0.0.1:8080");
exchange.set_socks_proxy("socks5://127.0.0.1:1080");
```

WebSocket traffic uses a **separate** setting — the REST proxies do not apply to `watch_*`:

```rust
let mut ws = ccxt_pro::Binance::new(None);
ws.set_ws_proxy("http://127.0.0.1:8080");            // dialled with an HTTP CONNECT tunnel
// or: Config::new().set_str("wsProxy", "http://127.0.0.1:8080")
```

## Untyped escape hatch

The typed layer covers the unified API. Three ways down to the dynamic layer when you need more:

**1. `raw` on any returned struct** — the full venue payload:

```rust
let ticker = exchange.fetch_ticker("BTC/USDT", Params::none()).await?;
let info = ccxt::get_value(&ticker.raw, &ccxt::Value::Str("info".to_string()));
let count = ccxt::safe_string(&info, "count", None);
```

Helpers re-exported at the crate root: `get_value`, `safe_string`, `safe_number`, `safe_integer`,
`safe_bool`.

**2. `Deref` to the core** — read-only access to dynamic fields (`has`, `id`, `markets`, `urls`,
`options`, `rateLimit`, `timeout`, …):

```rust
let supports_ws_orders = ccxt::safe_bool(&exchange.has, "createOrderWs", Some(false));
```

**3. `call_raw`** — dispatch any method on the core by name, including ones with no typed wrapper
(`set_leverage`, `set_margin_mode`, `fetch_funding_rate_history`, exchange-specific implicit
endpoints). Names are `snake_case`; the result is a `Value`:

```rust
use ccxt::{TypedExchange, Value};

let mut ex: Box<dyn TypedExchange> = Box::new(ccxt::Binance::new(None));
let result: Value = ex
    .call_raw("set_leverage", vec![Value::Int(5), Value::Str("BTC/USDT:USDT".to_string())])
    .await?;
```

`call_raw` is on `TypedExchange`, which every typed wrapper implements, so it also works on a
concrete `Binance` with the trait in scope.

## Prediction Markets

CCXT supports prediction-market venues (Polymarket, Kalshi, Limitless, Myriad, Opinion, and the
prediction flavours of Hyperliquid and Binance) in the `ccxt-prediction` crate. They use the same
unified API, but prices are quoted **0–1** (USDC per outcome share) and the tradeable unit is an
**outcome** (a market's YES/NO token), not a regular market symbol.

```rust
use ccxt::Params;
use ccxt_prediction::{Kalshi, Polymarket, TypedExchange, TypedExchangeExt};

let mut ex = Polymarket::new(None);
ex.load_markets(false).await;   // outcomes load automatically

// An outcome handle looks like 'TRUMP_OUT_PRESIDENT_2027:YES'
let handle = "TRUMP_OUT_PRESIDENT_2027:YES";

let ticker = ex.fetch_ticker(handle, Params::none()).await?;
let book = ex.fetch_order_book(handle, Some(10), Params::none()).await?;

// limit buy 5 YES shares @ 0.40 USDC (price is 0..1 per share)
let order = ex.create_order(handle, "limit", "buy", 5.0, Some(0.40), Params::none()).await?;
if let Some(id) = order.id {
    ex.cancel_order(&id, Some(handle), Params::none()).await?;
}
```

- Price/trade methods (`fetch_ticker`, `fetch_order_book`, `fetch_ohlcv`, `fetch_trades`,
  `create_order`, `cancel_order`, …) take an **outcome handle** where a REST venue takes a symbol.
- Event discovery (`fetch_events`, `fetch_event`, `fetch_outcomes`, `fetch_outcome`) has no typed
  wrapper yet — reach it via `call_raw`:

  ```rust
  let events = ex.call_raw("fetch_events", vec![ccxt::Value::Null]).await?;
  ```

- Venues are also driven generically through `ccxt_prediction`'s own `TypedExchange` /
  `TypedExchangeExt` (distinct from the ones in `ccxt`).

## Common Pitfalls

### Not loading markets first

```rust
// Wrong — symbol resolution fails
let mut ex = Binance::new(None);
let ticker = ex.fetch_ticker("BTC/USDT", Params::none()).await?;   // BadSymbol

// Correct
let mut ex = Binance::new(None);
ex.try_load_markets(false).await?;
let ticker = ex.fetch_ticker("BTC/USDT", Params::none()).await?;
```

### Assigning to fields instead of using setters

```rust
// Wrong — the wrapper derefs read-only, this does not compile
exchange.verbose = true;
exchange.apiKey = "...".into();

// Correct
exchange.set_verbose(true);
exchange.set_api_key("...");
```

### Using `load_markets` where failure matters

```rust
// Risky — panics on a venue outage or bad credentials
exchange.load_markets(false).await;

// Correct
exchange.try_load_markets(false).await?;
```

### Ordering error arms from general to specific

```rust
// Wrong — InvalidOrder swallows OrderNotFound
Err(e) if e.is("InvalidOrder")  => ...,
Err(e) if e.is("OrderNotFound") => ...,   // unreachable

// Correct — specific first
Err(e) if e.is("OrderNotFound") => ...,
Err(e) if e.is("InvalidOrder")  => ...,
```

### Treating `Option<f64>` as a number

```rust
// Wrong — `last` is Option<f64>, not f64
let value = ticker.last * amount;

// Correct — decide what a missing price means
let Some(last) = ticker.last else { return Err(...) };
let value = last * amount;
```

### Polling REST for real-time data

```rust
// Wrong — burns rate limit, seconds of latency
loop {
    let t = exchange.fetch_ticker("BTC/USDT", Params::none()).await?;
    tokio::time::sleep(Duration::from_secs(1)).await;
}

// Correct — one connection, push updates
let mut ws = ccxt_pro::Binance::new(None);
ws.try_load_markets(false).await?;
loop {
    let t = ws.watch_ticker("BTC/USDT", Params::none()).await?;
}
```

### Wrong symbol format

```rust
"BTCUSDT"        // wrong — no separator (that's the exchange-specific id)
"BTC-USDT"       // wrong — dash separator
"btc/usdt"       // wrong — lowercase

"BTC/USDT"       // correct — unified spot symbol
"BTC/USDT:USDT"  // correct — linear perpetual swap
"BTC/USD:BTC"    // correct — inverse swap
```

### Default thread stack size

A stack overflow inside a `fetch_*` call usually means the runtime's worker threads are on the
2 MB default. Build the runtime with `.thread_stack_size(64 * 1024 * 1024)` — see
[Runtime setup](#runtime-setup).

### Sharing one instance across tasks

Every unified method takes `&mut self`, so a single instance cannot be used from two tasks at once.
Wrap it in a `tokio::sync::Mutex` (which serialises the calls) or give each task its own instance.

## Troubleshooting

**`error: no matching package named 'ccxt-pro' found`**
`cargo add ccxt-pro` — the WebSocket venues are a separate crate from `ccxt`.

**`cannot borrow as mutable` on a `watch_*` call**
Two `watch_*` calls from the same instance cannot be awaited concurrently. Use `*_for_symbols`, or a
second instance.

**`the trait bound ...: TypedExchangeExt is not satisfied`**
Bring both traits into scope: `use ccxt::{TypedExchange, TypedExchangeExt};` (or the `ccxt_pro` /
`ccxt_prediction` pair for those crates).

**`no method named 'fetch_ticker' found for struct 'Box<dyn TypedExchange>'`**
Same cause — `TypedExchangeExt` is not imported.

**`Err(BadSymbol)`**
Markets were not loaded, or the symbol is not listed. Check `exchange.symbols()`.

**`Err(NotSupported)`**
The venue does not implement that method, or the signer is not ported yet (see
[Known limitations](#known-limitations)). Check `exchange.has` first.

**`Err(AuthenticationError)`**
Verify the key and secret, the key's permissions on the exchange, any IP allowlist, and that the
system clock is synced.

**`Err(InvalidNonce)`**
Sync the system clock; use one exchange instance per API key.

**`Err(RateLimitExceeded)`**
Leave `enable_rate_limit` on, and don't run several instances against one key.

**Stack overflow**
Increase the worker-thread stack size — see [Runtime setup](#runtime-setup).

**A panic message printed but the call returned `Ok`/`Err` anyway**
Expected: the core signals errors by panicking across an internal `catch_unwind`. Install the
no-op panic hook shown in [Runtime setup](#runtime-setup); set `CCXT_SHOW_PANICS=1` to see them
while debugging.

**Long compile times**
The generated crates are large. Drop debug info in dev builds and keep `ccxt-pro` out of the
dependency list unless you stream:

```toml
[profile.dev]
debug = 0
```

### Debugging

```rust
exchange.set_verbose(true);   // logs every HTTP request and response to stderr
```

For a WebSocket venue, `set_verbose(true)` on the `ccxt_pro` instance logs the frames.

## Known limitations

The Rust port is newer than the other bindings. Current gaps:

- **Unimplemented signers** — a few exchange-specific signing schemes are not ported yet (StarkNet
  for `paradex`, `lighter` zk-proofs, `dydx` protobuf transactions, `apex` StarkEx, curve25519).
  They fail loudly with `NotSupported` rather than emitting an invalid signature, so those venues'
  private endpoints are unusable; **public endpoints work**.
- **No typed `un_watch_*` and no `close()`** — see
  [Closing connections](#closing-connections).
- **Fewer typed methods than the full unified API** — 124 REST methods have typed wrappers;
  everything else goes through `call_raw`.
- **Integer precision** — JSON integers above `u64::MAX` fall back to `f64`; values up to
  `u64::MAX` are preserved losslessly.

## Learn More

- [CCXT Manual](https://docs.ccxt.com/)
- [ccxt on crates.io](https://crates.io/crates/ccxt) · [docs.rs](https://docs.rs/ccxt)
- [ccxt-pro on crates.io](https://crates.io/crates/ccxt-pro) · [ccxt-prediction](https://crates.io/crates/ccxt-prediction)
- [Rust examples](https://github.com/ccxt/ccxt/tree/master/examples/rust) — runnable programs for
  every pattern in this guide
- [Supported Exchanges](https://github.com/ccxt/ccxt#supported-cryptocurrency-exchange-markets)
- [GitHub Repository](https://github.com/ccxt/ccxt)
