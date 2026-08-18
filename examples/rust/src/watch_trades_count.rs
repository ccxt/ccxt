// Count binance watchTrades activity over a fixed window (default 30s).
// Reports the number of watch_trades resolutions (server messages dispatched)
// and the total NEW trades summed across them (newUpdates mode). Used to
// cross-check the Rust WS runtime against the Python ccxt.pro reference.
use std::time::Duration;

use ccxt::exchange_generated::ExchangeBase;
use ccxt::Value;

fn secs() -> u64 {
    std::env::var("CCXT_SECS").ok().and_then(|s| s.parse().ok()).unwrap_or(30)
}

fn symbol() -> String {
    std::env::var("CCXT_SYMBOL").unwrap_or_else(|_| "BTC/USDT".to_string())
}

async fn run() {
    let mut ex = Box::new(ccxt_pro::pro::binance::BinanceCore::new(None));
    ex.bind();
    let _ = ExchangeBase::call_dynamic(&mut *ex, "load_markets", vec![]).await;

    let sym = symbol();
    let window = Duration::from_secs(secs());
    let deadline = tokio::time::Instant::now() + window;
    let mut resolutions: u64 = 0;
    let mut trades: u64 = 0;
    loop {
        let now = tokio::time::Instant::now();
        if now >= deadline {
            break;
        }
        let fut = ExchangeBase::call_dynamic(
            &mut *ex,
            "watch_trades",
            vec![Value::Str(sym.clone())],
        );
        match tokio::time::timeout(deadline - now, fut).await {
            Ok(res) => {
                resolutions += 1;
                let n = match &res {
                    Value::Arr(a) => a.len() as u64,
                    _ => 0,
                };
                trades += n;
            }
            Err(_) => break, // window elapsed mid-wait
        }
    }
    println!(
        "RUST binance watchTrades [{}] over {}s: resolutions={} trades={}",
        sym,
        secs(),
        resolutions,
        trades
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
