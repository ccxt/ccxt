```rust
// Prediction-market API demo — the `ccxt_prediction::<Venue>` exchanges
// (Kalshi, Polymarket, Limitless, …) expose the unified `fetch_*` methods with
// native Rust return types, exactly like the REST `ccxt::<Exchange>` structs.
// Compile-check only (no `.await` to
// completion in `main`, so no network traffic).
//
// Build: `cargo run --example prediction_typed_demo`.
use ccxt::Params;
use ccxt_prediction::{Kalshi, Polymarket, PredictionBase, TypedExchange, ExchangeRuntime};

// Any prediction venue through the generic bounds. `ExchangeBase` and `PredictionBase`
// share unified names, so the prediction method is named by its trait.
async fn probe<E: TypedExchange + PredictionBase>(ex: &mut E) {
    let _ = ex.load_markets(false, ()).await;
    let _ = PredictionBase::fetch_ticker(ex, "BTC", Params::none()).await;
}

// ── A. concrete exchange — typed returns ──────────────────────────────────────
#[allow(dead_code)]
async fn demo() {
    let mut k = Kalshi::new(None);
    let _ = k.load_markets(false, ()).await; // -> Result<Markets>

    match k.fetch_ticker("KXBTCD", Params::none()).await {
        Ok(t) => println!("kalshi {} last={:?}", t.symbol, t.last),
        Err(e) => println!("fetch_ticker unsupported: {e}"),
    }
    let _book = k.fetch_order_book("KXBTCD", Some(10), Params::none()).await; // -> Result<OrderBook>
    let _trades = k.fetch_trades("KXBTCD", None, Some(50), Params::none()).await; // -> Result<Vec<Trade>>

    // ── B. generic across prediction venues: a tuple of concrete types ───────
    let (mut kalshi, mut polymarket) = (Kalshi::new(None), Polymarket::new(None));
    probe(&mut kalshi).await;
    probe(&mut polymarket).await;
}

fn main() {
    println!("prediction_typed_demo: compile-check only — ccxt_prediction typed fetch_* -> Result<T>");
}

```
