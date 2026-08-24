// Typed prediction-market API demo — the `ccxt_prediction::<Venue>` wrappers
// (Kalshi, Polymarket, Limitless, …) expose the unified `fetch_*` methods with
// native Rust return types, exactly like the REST `ccxt::<Exchange>` wrappers,
// but over the prediction-market Cores. Compile-check only (no `.await` to
// completion in `main`, so no network traffic).
//
// Build: `cargo run --example prediction_typed_demo`.
use ccxt::Params;
use ccxt_prediction::{Kalshi, Polymarket, TypedExchange, TypedExchangeExt};

// ── A. concrete wrapper — typed returns ──────────────────────────────────────
#[allow(dead_code)]
async fn demo() {
    let mut k = Kalshi::new(None);
    k.load_markets(false).await;

    match k.fetch_ticker("KXBTCD", Params::none()).await {
        Ok(t) => println!("kalshi {} last={:?}", t.symbol, t.last),
        Err(e) => println!("fetch_ticker unsupported: {e}"),
    }
    let _book = k.fetch_order_book("KXBTCD", Some(10), Params::none()).await; // -> Result<OrderBook>
    let _trades = k.fetch_trades("KXBTCD", None, Some(50), Params::none()).await; // -> Result<Vec<Trade>>

    // ── B. dynamic across prediction venues via the trait ────────────────────
    let mut venues: Vec<Box<dyn TypedExchange>> = vec![
        Box::new(Kalshi::new(None)),
        Box::new(Polymarket::new(None)),
    ];
    for ex in &mut venues {
        ex.load_markets(false).await;
        let _ = ex.fetch_ticker("BTC", Params::none()).await; // via TypedExchangeExt
    }
}

fn main() {
    println!("prediction_typed_demo: compile-check only — ccxt_prediction typed fetch_* -> Result<T>");
}
