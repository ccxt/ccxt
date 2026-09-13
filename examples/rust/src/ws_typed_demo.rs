// Typed WebSocket API demo — the `ccxt_pro::<Exchange>` wrappers expose each
// `watch_*` method with a native Rust return type (one decoded update per call)
// instead of the dynamic `Value`. This is the WS analog of `iexchange_demo`
// (REST).
//
// This demo actually connects and consumes a few live updates from binance's
// public streams. No credentials, no private data.
//
// Build/run: `cargo run --bin ws_typed_demo --features ws`
use ccxt::Params;
use ccxt_pro::{Binance, TypedExchange, TypedExchangeExt};

const SYMBOL: &str = "BTC/USDT";
const UPDATES: usize = 3;

#[tokio::main]
async fn main() {
    println!("=== ccxt_pro typed watch_* demo — binance {SYMBOL} ===\n");

    // ── A. concrete wrapper — typed returns ──────────────────────────────────
    let mut b = Binance::new(None);
    b.load_markets(false).await;

    // Each typed `watch_*` resolves to one decoded, statically-typed update,
    // so consuming a stream is just calling it in a loop.
    println!("→ watch_ticker -> Ticker");
    for i in 1..=UPDATES {
        match b.watch_ticker(SYMBOL, Params::none()).await {
            Ok(t) => println!("   #{i} last={:?} bid={:?} ask={:?}", t.last, t.bid, t.ask),
            Err(e) => {
                eprintln!("   x [{}] {}", e.kind, e.message);
                break;
            }
        }
    }

    // `limit` is best-effort: some venues only publish a full book, so expect
    // more levels than requested.
    println!("\n→ watch_order_book -> OrderBook");
    for i in 1..=UPDATES {
        match b.watch_order_book(SYMBOL, Some(20), Params::none()).await {
            Ok(ob) => println!(
                "   #{i} bids={} asks={} top_bid={:?}",
                ob.bids.len(),
                ob.asks.len(),
                ob.bids.first()
            ),
            Err(e) => {
                eprintln!("   x [{}] {}", e.kind, e.message);
                break;
            }
        }
    }

    // One update carries the batch of trades the venue published.
    println!("\n→ watch_trades -> Vec<Trade>");
    for i in 1..=UPDATES {
        match b.watch_trades(SYMBOL, None, Some(50), Params::none()).await {
            Ok(tr) => println!(
                "   #{i} {} trade(s), first px={:?} amount={:?}",
                tr.len(),
                tr.first().and_then(|t| t.price),
                tr.first().and_then(|t| t.amount)
            ),
            Err(e) => {
                eprintln!("   x [{}] {}", e.kind, e.message);
                break;
            }
        }
    }

    // ── B. generic / dynamic via the `ccxt_pro::TypedExchange` trait ─────────
    // Same object-safe pattern as the REST `iexchange_demo`, but over `watch_*`.
    println!("\n→ same surface through Box<dyn TypedExchange>");
    let mut ex: Box<dyn TypedExchange> = Box::new(Binance::new(None));
    ex.load_markets(false).await;
    match ex.watch_ticker(SYMBOL, Params::none()).await {
        Ok(t) => println!("   last={:?}", t.last),
        Err(e) => eprintln!("   x [{}] {}", e.kind, e.message),
    }

    println!("\ndone.");
}
