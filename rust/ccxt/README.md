# ccxt

Typed Rust API for [CCXT](https://github.com/ccxt/ccxt) — a cryptocurrency trading library
with support for 100+ exchanges.

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

For WebSocket (`watch*`) support see [`ccxt-pro`](https://crates.io/crates/ccxt-pro); for
prediction markets see [`ccxt-prediction`](https://crates.io/crates/ccxt-prediction).

Documentation: <https://docs.ccxt.com> · Manual: <https://github.com/ccxt/ccxt/wiki>
