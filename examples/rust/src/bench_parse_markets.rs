// Pure-parse benchmark — no network, no HTTP, no async runtime overhead.
// Reads a captured binance spot `exchangeInfo` JSON and runs `parse_markets`
// over its `symbols` array N times.
//
//   cargo run --release --bin bench_parse_markets -- /tmp/binance_spot.json
//
// Reports min/median/max wall time per iteration (excluding the first 3
// warmup runs) plus the cost of the initial JSON-text → `Value` parse.

use ccxt::Value;
use ccxt::exchanges::binance::BinanceCore;
use std::env;
use std::fs;
use std::time::Instant;

fn main() {
    let path = env::args().nth(1).unwrap_or_else(|| "/tmp/binance_spot.json".to_string());
    let iters: usize = env::args().nth(2).and_then(|s| s.parse().ok()).unwrap_or(20);

    let text = fs::read_to_string(&path).unwrap_or_else(|e| {
        eprintln!("failed to read {path}: {e}");
        std::process::exit(2);
    });
    eprintln!("read {} bytes from {path}", text.len());

    // text → Value (one-shot cost, reported separately)
    let json_t0 = Instant::now();
    let parsed = ccxt::runtime::json_parse(&Value::Str(text));
    let json_ms = json_t0.elapsed().as_secs_f64() * 1000.0;

    let symbols = ccxt::get_value(&parsed, &Value::Str("symbols".to_string()));
    let sym_count = match &symbols {
        Value::Arr(a) => a.len(),
        _ => 0,
    };
    eprintln!("json_parse: {json_ms:.2} ms — symbols: {sym_count}");

    // Build a binance Core. `new(None)` runs `init()` which depends on
    // `describe()` and a derived-ptr `bind`. `parse_market` doesn't need
    // the network, just the precision-mode + commonCurrencies state the
    // describe block seeds.
    let mut ex = Box::new(BinanceCore::new(None));
    ex.bind();

    // Warmup
    for _ in 0..3 {
        let _ = ex.parse_markets(symbols.clone());
    }

    let mut samples_ms: Vec<f64> = Vec::with_capacity(iters);
    for _ in 0..iters {
        let t0 = Instant::now();
        let _result = ex.parse_markets(symbols.clone());
        samples_ms.push(t0.elapsed().as_secs_f64() * 1000.0);
    }
    samples_ms.sort_by(|a, b| a.partial_cmp(b).unwrap());
    let min = samples_ms[0];
    let median = samples_ms[iters / 2];
    let max = samples_ms[iters - 1];
    let avg: f64 = samples_ms.iter().sum::<f64>() / iters as f64;
    println!("parse_markets ({sym_count} symbols × {iters} iters):");
    println!("  min={min:.2} ms  median={median:.2} ms  avg={avg:.2} ms  max={max:.2} ms");
    println!("  (one-shot json_parse: {json_ms:.2} ms)");
}
