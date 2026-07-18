# CCXT — Rust

A Rust port of [CCXT](https://github.com/ccxt/ccxt), the CryptoCurrency eXchange
Trading library. Like the other CCXT targets, the Rust sources are **transpiled
from the TypeScript source of truth** (`ts/src`); the hand-written parts are the
runtime (`Value`, HTTP, crypto, rate limiter) and the typed wrapper layer.

> **Status: work in progress.** The offline conformance suites pass (base,
> static request/response, id, prediction), but not every exchange method is
> exercised end-to-end and some signing primitives are intentionally
> unimplemented (see [Known limitations](#known-limitations)). Treat this as a
> preview, not a stable release. The crate is still `0.1.0`.

## Installation

```toml
[dependencies]
# The generated REST exchanges are behind a feature flag (see below).
ccxt = { git = "https://github.com/ccxt/ccxt", package = "ccxt", features = ["transpiled-base"] }
tokio = { version = "1", features = ["full"] }
```

## Quick start

Each exchange has a typed wrapper (`Binance`, `Kraken`, …) analogous to Go's
typed exchange structs. Typed methods return `Result<T, ExchangeError>`.

```rust
use ccxt::{Binance, Value};

#[tokio::main]
async fn main() -> Result<(), ccxt::ExchangeError> {
    let mut ex = Binance::new(None);
    let ticker = ex.fetch_ticker("BTC/USDT", Value::Null).await?;
    println!("last = {:?}", ticker.last);
    Ok(())
}
```

The typed wrapper `Deref`s to the underlying core, so the full dynamic surface
(`Value`-typed methods) is also reachable when a typed method isn't available.

## Feature flags

| feature | what it enables |
|---|---|
| *(default)* | the base runtime + hand-written base methods only (no venues) |
| `transpiled-base` | all transpiled REST exchanges (`ccxt::Binance`, …) |
| `transpiled-ws` | the transpiled WebSocket (`pro`) exchanges (implies `transpiled-base`) |

The base `Exchange` methods are always compiled; `transpiled-base` gates only the
per-exchange venue modules. The crate builds with `--no-default-features` and
with `--all-features`.

## Error handling

Expected failures surface as `Result<T, ExchangeError>` from the typed wrappers.
`ExchangeError::is()` / `is_a()` understand the CCXT class hierarchy, so you can
match on a base class:

```rust
match ex.fetch_ticker("BTC/USDT", Value::Null).await {
    Ok(t) => { /* … */ }
    Err(e) if e.is("NetworkError") => { /* transient — RequestTimeout, DDoSProtection, … */ }
    Err(e) if e.is("AuthenticationError") => { /* keys */ }
    Err(e) => eprintln!("{e}"),
}
```

## Rate limiting

`enableRateLimit` (on by default) drives a leaky-bucket limiter: requests are
spaced by `rateLimit` ms (weighted per endpoint). Disable it only if you throttle
externally.

## Prediction markets

Prediction venues (`kalshi`, `myriad`, `limitless`, `polymarket`, and the
prediction flavour of `hyperliquid`) live in the `ccxt::prediction` module and
share the `PredictionExchange` base (events → markets → outcomes).

## Known limitations

- **Unimplemented signing** — some exchange-specific signers (StarkNet/`paradex`,
  `lighter` zk-proofs, `dydx` protobuf tx, `apex` StarkEx, curve25519/`axolotl`)
  are **not yet ported**. They fail loudly with `NotSupported` rather than
  emitting an invalid signature, so those exchanges' private/trading endpoints
  are not usable yet. Public endpoints work.
- **Integer precision** — JSON integers above `u64::MAX` still fall back to
  `f64`; values up to `u64::MAX` are preserved losslessly (as strings when they
  exceed `i64`).
- The transpiler and dispatch layer are still being hardened; see the repo's
  Rust review notes for the current architectural roadmap.

## License

MIT — same as CCXT.
