// Count watchTrades activity over a fixed window (default 30s) and report a few
// coarse performance metrics (loadMarkets wall time, peak RSS). Used to
// cross-check the Rust WS runtime against the Python ccxt.pro reference.
//
// Select the venue with CCXT_EXCHANGE (binance | hyperliquid), the symbol with
// CCXT_SYMBOL, and the window with CCXT_SECS.
use std::time::{Duration, Instant};

use ccxt::exchange_generated::ExchangeBase;
use ccxt::Value;

fn secs() -> u64 {
    std::env::var("CCXT_SECS").ok().and_then(|s| s.parse().ok()).unwrap_or(30)
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

// Run the benchmark against an already-constructed, bound Core. Generic because
// `ExchangeBase` is not object-safe (its methods return `impl Future`), so a
// `&mut dyn ExchangeBase` is illegal — monomorphise per Core instead.
async fn bench<E: ExchangeBase>(ex: &mut E, id: &str, sym: &str) {
    let t0 = Instant::now();
    let _ = ExchangeBase::call_dynamic(ex, "load_markets", vec![]).await;
    let load_ms = t0.elapsed().as_secs_f64();

    let window = Duration::from_secs(secs());
    let deadline = tokio::time::Instant::now() + window;
    let mut resolutions: u64 = 0;
    let mut trades: u64 = 0;
    loop {
        let now = tokio::time::Instant::now();
        if now >= deadline {
            break;
        }
        let fut = ExchangeBase::call_dynamic(ex, "watch_trades", vec![Value::Str(sym.to_string())]);
        match tokio::time::timeout(deadline - now, fut).await {
            Ok(res) => {
                resolutions += 1;
                trades += match &res {
                    Value::Arr(a) => a.len() as u64,
                    _ => 0,
                };
            }
            Err(_) => break, // window elapsed mid-wait
        }
    }
    println!(
        "RUST {} watchTrades [{}] {}s: loadMarkets={:.2}s resolutions={} trades={} peakRSS={:.0}MB",
        id,
        sym,
        secs(),
        load_ms,
        resolutions,
        trades,
        peak_rss_mb()
    );
}

async fn run() {
    match exchange().as_str() {
        "hyperliquid" => {
            let mut ex = Box::new(ccxt_pro::pro::hyperliquid::HyperliquidCore::new(None));
            ex.bind();
            bench(&mut *ex, "hyperliquid", &symbol("BTC/USDC:USDC")).await;
        }
        _ => {
            let mut ex = Box::new(ccxt_pro::pro::binance::BinanceCore::new(None));
            ex.bind();
            bench(&mut *ex, "binance", &symbol("BTC/USDT")).await;
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
