// Count watchTrades activity over a fixed window (default 30s) via the TYPED WS
// API and report loadMarkets wall time + peak RSS. Cross-checks the Rust WS
// runtime against the Python ccxt.pro reference.
//
// Select the venue with CCXT_EXCHANGE (binance | hyperliquid | …), the symbol
// with CCXT_SYMBOL, and the window with CCXT_SECS.
use std::time::{Duration, Instant};

use ccxt::Params;
use ccxt_pro::{from_id, TypedExchange, TypedExchangeExt};

fn secs() -> u64 {
    std::env::var("CCXT_SECS")
        .ok()
        .and_then(|s| s.parse().ok())
        .unwrap_or(30)
}

fn exchange() -> String {
    std::env::var("CCXT_EXCHANGE").unwrap_or_else(|_| "binance".to_string())
}

fn symbol(default: &str) -> String {
    std::env::var("CCXT_SYMBOL").unwrap_or_else(|_| default.to_string())
}

// Peak resident set size (VmHWM) in MB, read from /proc/self/status.
fn peak_rss_mb() -> f64 {
    std::fs::read_to_string("/proc/self/status")
        .ok()
        .and_then(|s| {
            s.lines()
                .find(|l| l.starts_with("VmHWM:"))
                .and_then(|l| l.split_whitespace().nth(1))
                .and_then(|kb| kb.parse::<f64>().ok())
        })
        .map(|kb| kb / 1024.0)
        .unwrap_or(0.0)
}

async fn run() {
    let id = exchange();
    // Typed WS wrapper picked by id — `ccxt_pro::from_id` returns a boxed
    // `TypedExchange`; the `watch_*` methods come from `TypedExchangeExt`.
    let mut ex: Box<dyn TypedExchange> = match from_id(&id, None) {
        Some(e) => e,
        None => {
            eprintln!("unknown/unsupported WS exchange: {id}");
            return;
        }
    };
    let sym = symbol(if id == "hyperliquid" {
        "BTC/USDC:USDC"
    } else {
        "BTC/USDT"
    });

    let t0 = Instant::now();
    ex.load_markets(false).await;
    let load_s = t0.elapsed().as_secs_f64();

    let window = Duration::from_secs(secs());
    let deadline = tokio::time::Instant::now() + window;
    let mut resolutions: u64 = 0;
    let mut trades: u64 = 0;
    loop {
        let now = tokio::time::Instant::now();
        if now >= deadline {
            break;
        }
        // watch_trades(symbol, since, limit, params) -> Result<Vec<Trade>>
        let fut = ex.watch_trades(&sym, None, None, Params::none());
        match tokio::time::timeout(deadline - now, fut).await {
            Ok(Ok(tr)) => {
                resolutions += 1;
                trades += tr.len() as u64;
            }
            Ok(Err(_)) | Err(_) => break, // stream error or window elapsed mid-wait
        }
    }
    println!(
        "RUST {} watchTrades [{}] {}s: loadMarkets={:.2}s resolutions={} trades={} peakRSS={:.0}MB",
        id,
        sym,
        secs(),
        load_s,
        resolutions,
        trades,
        peak_rss_mb()
    );
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
