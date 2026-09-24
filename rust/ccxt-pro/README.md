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

Every venue is behind a cargo feature named after its id; the default `all` compiles every
one. To keep build time and memory down, disable the defaults and list what you use — the
same feature names work on every ccxt crate, so keep the lists in sync:

```toml
ccxt-pro = { version = "4", default-features = false, features = ["binance"] }
```

Documentation: <https://docs.ccxt.com> · Manual: <https://github.com/ccxt/ccxt/wiki>
