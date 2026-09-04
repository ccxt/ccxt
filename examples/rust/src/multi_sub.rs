// Multiple simultaneous WebSocket subscriptions.
//
// Part A — ONE exchange instance, TWO channels multiplexed over a single WS
//   connection. The client's socket reader fills every subscribed channel's
//   cache in the background, so alternating `watch_order_book` + `watch_trades`
//   in one loop keeps both live at once (the typed methods take `&mut self`, so
//   a single instance drives them in sequence, not via two parallel borrows).
//   Proves channel multiplexing on one connection.
//
// Part B — TWO independent instances (own connections) in concurrent
//   `tokio::spawn` tasks, one watching the book and one watching trades. Proves
//   parallel subscriptions coexist and the global per-book / per-side stores
//   (keyed by unique ids) don't collide across concurrent books.
//
//   cargo run --features ws --bin multi_sub -- [secs]   (default 20)
use ccxt::Params;
use ccxt_pro::{from_id, TypedExchange, TypedExchangeExt};
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Arc;
use std::time::{Duration, Instant};

const EXCHANGE: &str = "binance";
const SYMBOL: &str = "BTC/USDT";

fn build() -> Box<dyn TypedExchange> {
    from_id(EXCHANGE, None).expect("no pro wrapper for binance")
}

// ── Part A: one instance, two channels on a single connection ────────────────
async fn part_a(secs: u64) {
    println!("── Part A: one {EXCHANGE} instance, watchOrderBook + watchTrades on ONE connection ──");
    let mut ex = build();
    ex.load_markets(false).await;

    let deadline = Instant::now() + Duration::from_secs(secs);
    let (mut ob_updates, mut trade_events, mut trade_count) = (0u64, 0u64, 0u64);
    let (mut best_bid, mut best_ask, mut last_px) = (0.0f64, 0.0f64, 0.0f64);

    while Instant::now() < deadline {
        // Each await returns the next update for THAT channel; the other
        // channel keeps buffering in the background meanwhile.
        if let Ok(ob) = ex.watch_order_book(SYMBOL, Some(10), Params::none()).await {
            ob_updates += 1;
            if let Some(b) = ob.bids.first() { best_bid = b[0]; }
            if let Some(a) = ob.asks.first() { best_ask = a[0]; }
        }
        if let Ok(trades) = ex.watch_trades(SYMBOL, None, Some(50), Params::none()).await {
            if !trades.is_empty() {
                trade_events += 1;
                trade_count += trades.len() as u64;
                if let Some(p) = trades.last().and_then(|t| t.price) { last_px = p; }
            }
        }
    }

    println!(
        "Part A done: orderBook updates={ob_updates}  trade events={trade_events} (\
         {trade_count} trades)  | bestBid={best_bid} bestAsk={best_ask} lastTrade={last_px}"
    );
    let ok = ob_updates > 0 && trade_count > 0;
    println!("Part A: both channels delivered on one connection? {}\n", if ok { "YES ✓" } else { "NO ✗" });
}

// Drive a single channel to completion, counting updates, for `secs`. Each
// watch await is bounded by `timeout` so a quiet channel can't stall past the
// deadline (the loop only re-checks the clock between awaits).
async fn count_book(secs: u64, counter: Arc<AtomicU64>) {
    let mut ex = build();
    ex.load_markets(false).await;
    eprintln!("  [book task] markets loaded, subscribing…");
    let deadline = Instant::now() + Duration::from_secs(secs);
    let mut first = true;
    while Instant::now() < deadline {
        let remaining = deadline.saturating_duration_since(Instant::now());
        match tokio::time::timeout(remaining, ex.watch_order_book(SYMBOL, Some(10), Params::none())).await {
            Ok(Ok(ob)) => {
                if first { eprintln!("  [book task] first update: bids={} asks={}", ob.bids.len(), ob.asks.len()); first = false; }
                counter.fetch_add(1, Ordering::Relaxed);
            }
            // A binance spot sequence gap surfaces as a ChecksumError telling you
            // to reconnect — the next `watch_order_book` call re-seeds. Keep going.
            Ok(Err(_)) => continue,
            Err(_) => break, // deadline elapsed
        }
    }
}

async fn count_trades(secs: u64, counter: Arc<AtomicU64>) {
    let mut ex = build();
    ex.load_markets(false).await;
    eprintln!("  [trades task] markets loaded, subscribing…");
    let deadline = Instant::now() + Duration::from_secs(secs);
    let mut first = true;
    while Instant::now() < deadline {
        let remaining = deadline.saturating_duration_since(Instant::now());
        match tokio::time::timeout(remaining, ex.watch_trades(SYMBOL, None, Some(50), Params::none())).await {
            Ok(Ok(trades)) => {
                if first { eprintln!("  [trades task] first update: {} trades", trades.len()); first = false; }
                counter.fetch_add(trades.len() as u64, Ordering::Relaxed);
            }
            Ok(Err(e)) => { eprintln!("  [trades task] error: {e}"); break; }
            Err(_) => break, // deadline elapsed
        }
    }
}

// ── Part B: two independent instances, truly concurrent ──────────────────────
async fn part_b(secs: u64) {
    println!("── Part B: TWO {EXCHANGE} instances watching book & trades concurrently ──");
    let ob_count = Arc::new(AtomicU64::new(0));
    let tr_count = Arc::new(AtomicU64::new(0));

    let h1 = tokio::spawn(count_book(secs, ob_count.clone()));
    let h2 = tokio::spawn(count_trades(secs, tr_count.clone()));
    let _ = tokio::join!(h1, h2);

    let (ob, tr) = (ob_count.load(Ordering::Relaxed), tr_count.load(Ordering::Relaxed));
    println!("Part B done: concurrent orderBook updates={ob}  trades={tr}");
    let ok = ob > 0 && tr > 0;
    println!("Part B: both concurrent subscriptions delivered? {}\n", if ok { "YES ✓" } else { "NO ✗" });
}

async fn run() {
    let secs: u64 = std::env::args().nth(1).and_then(|s| s.parse().ok()).unwrap_or(20);
    let part = std::env::args().nth(2).unwrap_or_else(|| "both".to_string());
    println!("multi_sub: {EXCHANGE} {SYMBOL} — {secs}s per part (part={part})\n");
    if part == "a" || part == "both" { part_a(secs).await; }
    if part == "b" || part == "both" { part_b(secs).await; }
    println!("multi_sub: done.");
}

fn main() {
    // The pro runtime signals errors by panicking across an internal
    // catch_unwind boundary (surfaced back as `Result`). Silence the default
    // hook so those caught panics don't print — same as the `ti-rust` harness.
    std::panic::set_hook(Box::new(|_| {}));
    let rt = tokio::runtime::Builder::new_multi_thread()
        .worker_threads(4)
        .thread_stack_size(64 * 1024 * 1024)
        .enable_all()
        .build()
        .unwrap();
    rt.block_on(run());
}
