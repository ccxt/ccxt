# ccxt-pro

WebSocket (`watch*`) support for [CCXT](https://github.com/ccxt/ccxt) in Rust.

Each exchange wrapper carries both the streaming surface and the REST surface, so one
instance can subscribe and trade:

```rust
use ccxt::Params;
use ccxt_pro::Binance;

let mut exchange = Binance::new(None);
exchange.load_markets(false).await;

let book = exchange.watch_order_book("BTC/USDT", Some(10), Params::none()).await?;
let ticker = exchange.fetch_ticker("BTC/USDT", Params::none()).await?;
```

Requires a Tokio runtime. For the REST-only surface see
[`ccxt`](https://crates.io/crates/ccxt).

Documentation: <https://docs.ccxt.com> · Manual: <https://github.com/ccxt/ccxt/wiki>
