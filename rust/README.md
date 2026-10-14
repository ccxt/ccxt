# CCXT for Rust

The Rust port of [CCXT](https://github.com/ccxt/ccxt) is a cargo workspace of four published
crates. Pick the ones you need:

| crate | what it is | use it when |
|---|---|---|
| [`ccxt`](ccxt/README.md) | typed REST API — `Binance::fetch_ticker(..) -> Result<Ticker>` | you call `fetch_*` / `create_order` on spot or derivatives exchanges |
| [`ccxt-pro`](ccxt-pro/README.md) | typed WebSocket API — `watch_order_book`, `watch_trades`, … (REST included) | you stream market data or your own orders |
| [`ccxt-prediction`](ccxt-prediction/README.md) | typed prediction-market API — Polymarket, Kalshi, Limitless, Myriad, … | you trade outcome markets |
| [`ccxt-base`](ccxt-base/README.md) | the untyped engine the three above wrap — `Value`, runtime, transpiled Cores | you build tooling on the dynamic `Value` surface; app code normally does not depend on it directly |

All of them are async and expect a Tokio runtime.

```toml
[dependencies]
ccxt = "4"
tokio = { version = "1", features = ["full"] }
```

```rust
use ccxt::{Binance, Params};

let mut exchange = Binance::new(None);
exchange.load_markets(false).await;
let ticker = exchange.fetch_ticker("BTC/USDT", Params::none()).await?;
```

## Compile only the exchanges you use

Every exchange is a cargo feature named after its id, and the default feature set (`all`)
compiles all of them. That is heavy: a fresh debug build of a crate depending on `ccxt` with
defaults needs about 19 GB of RAM and several minutes, a release build about 50 GB. Turn the
defaults off and list what you use:

```toml
[dependencies]
ccxt            = { version = "4", default-features = false, features = ["binance", "kraken", "okx"] }
ccxt-pro        = { version = "4", default-features = false, features = ["binance"] }
ccxt-prediction = { version = "4", default-features = false, features = ["polymarket"] }
```

Rules of thumb:

- Features are per crate. Put the list on every ccxt crate you depend on, and keep
  `default-features = false` on each — one crate left on defaults brings every exchange back.
- A derived exchange enables its parent (`binanceus` → `binance`), and a `ccxt-pro` venue
  enables its REST Core, so the REST and WebSocket lists can be identical.
- `ccxt-prediction`'s ids are the prediction venues (`polymarket`, `kalshi`, `binance` for
  Binance's prediction markets, …); they are separate features from the spot exchange of the
  same name.
- `from_id("kraken", …)` returns `None` for an exchange that was not compiled in, so code that
  picks exchanges at runtime needs them in the list.
- Docs follow the same features: `cargo doc --open` in your project documents only the
  exchanges you enabled.

## Layout

```
rust/
  ccxt-base/        engine: value.rs, runtime.rs, exchange.rs (hand-written) + generated
                    exchanges/<id>.rs, <id>_api.rs, prediction/<id>.rs, exchange_generated.rs
  ccxt/             typed REST wrappers  — generated exchanges/<id>_typed.rs, typed.rs
  ccxt-pro/         WebSocket venues     — generated pro/<id>.rs, pro_typed/<id>_typed.rs, typed.rs
  ccxt-prediction/  typed prediction wrappers — generated prediction/<id>_typed.rs, typed.rs
  tests/            the `ti-rust` test binary (static request/response/WS suites, live tests)
  BUILD-BENCHMARK.md
```

Everything under `src/exchanges`, `src/prediction`, `src/pro`, `src/pro_typed` and the
`typed.rs` / `mod.rs` registries is transpiled from `ts/src/` — do not edit it by hand.
The per-exchange feature lists in each `Cargo.toml` are generated too (between the
`BEGIN/END GENERATED FEATURES` markers).

## Contributing

The Rust code is produced by the transpiler; fixes go into the TypeScript source and are
regenerated (see the repository's `CONTRIBUTING.md`). From the repository root:

```bash
npm run transpileRust                      # ts/src → rust/ (REST + WS + typed wrappers + Cargo features)
npm run buildRust                          # cargo build --manifest-path rust/Cargo.toml
tsx build/granular-rust-build.ts binance   # regenerate one exchange (and its ancestors)
npm run request-rust && npm run response-rust && npm run ws-tests-rust   # offline suites
node run-tests binance --rust              # live public tests, --ws for WebSocket
```

`cargo doc --manifest-path rust/Cargo.toml -p ccxt --no-deps --open` builds the API docs
locally; add `--no-default-features --features binance` to keep that quick as well.
