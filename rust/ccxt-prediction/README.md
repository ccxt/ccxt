# ccxt-prediction

Typed prediction-market API for [CCXT](https://github.com/ccxt/ccxt) in Rust — Kalshi,
Polymarket, Limitless, Myriad and others.

```rust
use ccxt::Params;
use ccxt_prediction::Kalshi;

let mut exchange = Kalshi::new(None);
exchange.load_markets(false).await;

let ticker = exchange.fetch_ticker("KXBTCD", Params::none()).await?;
```

For spot/derivatives exchanges see [`ccxt`](https://crates.io/crates/ccxt); for WebSocket
support see [`ccxt-pro`](https://crates.io/crates/ccxt-pro).

Every venue is behind a cargo feature named after its id; the default `all` compiles every
one. To keep build time and memory down, disable the defaults and list what you use — the
same feature names work on every ccxt crate, so keep the lists in sync:

```toml
ccxt-prediction = { version = "4", default-features = false, features = ["polymarket", "kalshi"] }
```

Documentation: <https://docs.ccxt.com> · Manual: <https://github.com/ccxt/ccxt/wiki>
