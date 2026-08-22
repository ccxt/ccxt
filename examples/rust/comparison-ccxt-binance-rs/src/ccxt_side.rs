// ccxt-rust side of the binance-rs comparison — on the TYPED layer.
//
// `ccxt_pro::Binance` is the concrete typed WebSocket wrapper: its
// `watch_order_book(symbol, limit, params) -> Result<OrderBook>` returns a
// decoded, statically-typed `OrderBook` (bids/asks as `Vec<[f64; 2]>`) each
// frame — a full, sorted, checksum-validated book, not raw deltas.
//
//   cargo run --release --bin ccxt_side -- [secs]
use ccxt::Value;
use ccxt_pro::Binance;
use std::time::{Duration, Instant};

fn cpu_secs() -> f64 {
    std::fs::read_to_string("/proc/self/stat").ok().and_then(|s| {
        let close = s.rfind(')')?;
        let rest: Vec<&str> = s[close + 2..].split_whitespace().collect();
        let u: f64 = rest.get(11)?.parse().ok()?;
        let k: f64 = rest.get(12)?.parse().ok()?;
        Some((u + k) / 100.0)
    }).unwrap_or(0.0)
}
fn peak_rss_mb() -> f64 {
    std::fs::read_to_string("/proc/self/status").ok().and_then(|s| {
        s.lines().find(|l| l.starts_with("VmHWM:"))
            .and_then(|l| l.split_whitespace().nth(1))
            .and_then(|kb| kb.parse::<f64>().ok())
    }).map(|kb| kb / 1024.0).unwrap_or(0.0)
}

async fn run() {
    let run_secs: u64 = std::env::args().nth(1).and_then(|s| s.parse().ok()).unwrap_or(30);
    let sym = std::env::var("SYM").unwrap_or_else(|_| "BTC/USDT".into());
    println!("ccxt-rust (typed): binance {sym} watch_order_book for {run_secs}s…");

    // Typed layer: concrete wrapper, typed OrderBook return.
    let mut ex = Binance::new(None);
    let load0 = Instant::now();
    let markets = ex.load_markets(false).await;
    let load_s = load0.elapsed().as_secs_f64();
    let n_markets = match &markets { Value::Dict(d) => d.len(), _ => 0 };
    let rss_after_load = peak_rss_mb();

    let start = Instant::now();
    let cpu0 = cpu_secs();
    let (mut frames, mut lb, mut la): (u64, usize, usize) = (0, 0, 0);
    while start.elapsed().as_secs() < run_secs {
        let remaining = Duration::from_secs(run_secs).saturating_sub(start.elapsed());
        match tokio::time::timeout(remaining, ex.watch_order_book(&sym, None, Value::Null)).await {
            Ok(Ok(ob)) => { frames += 1; lb = ob.bids.len(); la = ob.asks.len(); }
            Ok(Err(_)) => continue, // resync on a sequence gap
            Err(_) => break,        // deadline
        }
    }
    let cpu = cpu_secs() - cpu0;
    let wall = start.elapsed().as_secs_f64();
    println!(
        "CCXT-RUST   frames={frames}  (maintained book: bids={lb} asks={la})  \
         wall={wall:.1}s  cpu={cpu:.3}s  peakRSS={:.0}MB",
        peak_rss_mb()
    );
    println!(
        "note: loadMarkets={load_s:.1}s for {n_markets} markets (RSS after load ~{rss_after_load:.0}MB); \
         cpu above is the watch loop only."
    );
}

fn main() {
    let rt = tokio::runtime::Builder::new_multi_thread()
        .worker_threads(2)
        .thread_stack_size(64 * 1024 * 1024)
        .enable_all()
        .build()
        .unwrap();
    rt.block_on(run());
}
