// Typed WebSocket API demo — the `ccxt_pro::<Exchange>` wrappers expose each
// `watch_*` method with a native Rust return type (one decoded update per call)
// instead of the dynamic `Value`. This is the WS analog of `iexchange_demo`
// (REST). Compile-check only: the futures are constructed to prove the types,
// never `.await`-ed to completion in `main`, so no live traffic is generated.
//
// Build: `cargo run --example ws_typed_demo --features ws` (or `--bin`).
use ccxt::Value;
use ccxt_pro::{Binance, TypedExchange, TypedExchangeExt};

// ── A. concrete wrapper — typed returns ──────────────────────────────────────
#[allow(dead_code)]
async fn demo() {
    let mut b = Binance::new(None);
    b.load_markets(false).await;

    // Each typed `watch_*` resolves to one decoded, statically-typed update:
    match b.watch_ticker("BTC/USDT", Value::Null).await {
        Ok(t) => println!("ticker {} last={:?}", t.symbol, t.last),
        Err(e) => println!("watch_ticker unsupported: {e}"),
    }
    // `-> Result<OrderBook>` / `Result<Vec<Trade>>` — bound and dropped here.
    let _book = b.watch_order_book("BTC/USDT", Some(20), Value::Null).await;
    let _trades = b.watch_trades("BTC/USDT", None, Some(50), Value::Null).await;
    let _tickers = b.watch_tickers(None, Value::Null).await;

    // ── B. generic / dynamic via the `ccxt_pro::TypedExchange` trait ─────────
    // Same object-safe pattern as the REST `iexchange_demo`, but over `watch_*`.
    let mut ex: Box<dyn TypedExchange> = Box::new(Binance::new(None));
    ex.load_markets(false).await;
    let _ = ex.watch_ticker("BTC/USDT", Value::Null).await; // via TypedExchangeExt
}

fn main() {
    println!("ws_typed_demo: compile-check only — ccxt_pro typed watch_* -> Result<T>");
}
