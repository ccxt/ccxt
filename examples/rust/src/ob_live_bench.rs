// Live watch_order_book CPU benchmark — CCXT side of L1nkus's comparison
// (PR #28627). Streams binance USD-M futures BTC/USDT:USDT @depth and prints,
// every 5s: frames processed, current book depth (bids/asks), 5s CPU%, and
// cumulative CPU — mirroring the report's format so before/after is directly
// comparable.
//
//   cargo run --release --features ws --bin ob_live_bench -- [run_secs]
use ccxt::{Config, Params};
use ccxt_pro::{from_id_with_config, TypedExchange, TypedExchangeExt};
use std::time::{Duration, Instant};

fn cpu_secs() -> f64 {
    std::fs::read_to_string("/proc/self/stat")
        .ok()
        .and_then(|s| {
            let close = s.rfind(')')?;
            let rest: Vec<&str> = s[close + 2..].split_whitespace().collect();
            let utime: f64 = rest.get(11)?.parse().ok()?;
            let stime: f64 = rest.get(12)?.parse().ok()?;
            Some((utime + stime) / 100.0)
        })
        .unwrap_or(0.0)
}

async fn run() {
    let sym = std::env::var("CCXT_SYMBOL").unwrap_or_else(|_| "BTC/USDT:USDT".to_string());
    let run_secs: u64 = std::env::args().nth(1).and_then(|s| s.parse().ok()).unwrap_or(30);
    let id = std::env::var("CCXT_EXCHANGE").unwrap_or_else(|_| "binance".to_string());

    // linear-only so the "BTCUSDT" WS id resolves to the perpetual, not spot.
    let cfg = Config::new().option("fetchMarkets", Params::new().with_strs("types", &["linear"]));
    let mut ex: Box<dyn TypedExchange> = from_id_with_config(&id, cfg).expect("no typed WS wrapper");
    ex.load_markets(false).await;
    println!("Streaming {id} {sym} watch_order_book for {run_secs}s…");

    let start = Instant::now();
    let cpu_start = cpu_secs();
    let mut tick_frames: u64 = 0;
    let mut last_tick = Instant::now();
    let mut last_cpu = cpu_secs();
    loop {
        if start.elapsed().as_secs() >= run_secs {
            break;
        }
        match ex.watch_order_book(&sym, None, Params::none()).await {
            Ok(ob) => {
                tick_frames += 1;
                if last_tick.elapsed() >= Duration::from_secs(5) {
                    let cpu_now = cpu_secs();
                    let cpu5 = cpu_now - last_cpu;
                    println!(
                        "Tick | Frames (5s): {:<5} | Bids: {:<5} Asks: {:<5} | 5s CPU%: {:>5.1}% | Total CPU: {:.2}s",
                        tick_frames,
                        ob.bids.len(),
                        ob.asks.len(),
                        cpu5 / 5.0 * 100.0,
                        cpu_now - cpu_start,
                    );
                    tick_frames = 0;
                    last_tick = Instant::now();
                    last_cpu = cpu_now;
                }
            }
            Err(e) => {
                eprintln!("watch error: {e}");
                tokio::time::sleep(Duration::from_millis(500)).await;
            }
        }
    }
}

fn main() {
    let rt = tokio::runtime::Builder::new_multi_thread()
        .worker_threads(4)
        .thread_stack_size(64 * 1024 * 1024)
        .enable_all()
        .build()
        .unwrap();
    rt.block_on(run());
}
