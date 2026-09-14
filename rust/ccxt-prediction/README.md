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

Documentation: <https://docs.ccxt.com> · Manual: <https://github.com/ccxt/ccxt/wiki>
