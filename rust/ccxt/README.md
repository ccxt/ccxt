# ccxt

Typed Rust API for [CCXT](https://github.com/ccxt/ccxt) — a cryptocurrency trading library
with support for 100+ exchanges and prediction markets.

This crate is the **REST** surface: each exchange has a typed wrapper returning native Rust
types (`Ticker`, `Order`, `Market`, `OrderBook`) rather than a dynamic value. It re-exports
the [`ccxt-base`](https://crates.io/crates/ccxt-base) engine, so `ccxt::Value`,
`ccxt::Params` and `ccxt::Config` resolve here too.

```rust
use ccxt::{Binance, Params};

let mut exchange = Binance::new(None);
exchange.load_markets(false).await;

let ticker = exchange.fetch_ticker("BTC/USDT", Params::none()).await?;
println!("{} {:?}", ticker.symbol, ticker.last);
```

## WebSocket (`watch*`)

Streaming lives in [`ccxt-pro`](https://crates.io/crates/ccxt-pro). Its wrappers carry the
REST surface too, so one instance can subscribe and trade. `watch_*` resolves with the next
update, so call it in a loop:

```rust
use ccxt::Params;
use ccxt_pro::Binance;

let mut exchange = Binance::new(None);
exchange.load_markets(false).await;

loop {
    let book = exchange.watch_order_book("BTC/USDT", Some(10), Params::none()).await?;
    println!("{:?} bid={:?} ask={:?}", book.symbol, book.bids.first(), book.asks.first());
}
```

Other streams follow the same shape: `watch_ticker`, `watch_trades`, `watch_ohlcv`,
`watch_orders`, `watch_my_trades`, `watch_balance`. Requires a Tokio runtime.

## Prediction markets

Prediction-market venues live in [`ccxt-prediction`](https://crates.io/crates/ccxt-prediction):
Binance, Hyperliquid, Kalshi, Limitless, Myriad, Opinion, Polymarket and Predictfun. They
share the unified surface, so the same `fetch_*` calls work against outcome markets:

```rust
use ccxt::Params;
use ccxt_prediction::Polymarket;

let mut exchange = Polymarket::new(None);
exchange.load_markets(false).await;

let book = exchange.fetch_order_book("TRUMP_WINS_2028:YES", Some(10), Params::none()).await?;
println!("{:?} best bid {:?}", book.symbol, book.bids.first());
```

Documentation: <https://docs.ccxt.com> · Manual: <https://github.com/ccxt/ccxt/wiki>
