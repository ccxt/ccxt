// Pure-decode benchmark — no network, no async runtime. Reads a captured JSON
// array of CCXT market objects and runs the typed decode `Market::from_value`
// over it N times, reporting min/median/avg/max wall time per iteration.
//
//   cargo run --release --bin bench_parse_markets -- /tmp/markets.json
//
// This is the typed-layer analog of the old raw `parse_markets` micro-bench:
// it measures the `Value -> ccxt::types::Market` decode the typed wrappers do
// on every `fetch_markets()` call.
use ccxt::types::Market;
use ccxt::Value;
use std::env;
use std::fs;
use std::time::Instant;

fn main() {
    let path = env::args().nth(1).unwrap_or_else(|| "/tmp/markets.json".to_string());
    let iters: usize = env::args().nth(2).and_then(|s| s.parse().ok()).unwrap_or(20);

    let text = fs::read_to_string(&path).unwrap_or_else(|e| {
        eprintln!("failed to read {path}: {e}");
        std::process::exit(2);
    });
    eprintln!("read {} bytes from {path}", text.len());

    // text -> Value (one-shot cost, reported separately)
    let json_t0 = Instant::now();
    let parsed = ccxt::runtime::json_parse(&Value::Str(text));
    let json_ms = json_t0.elapsed().as_secs_f64() * 1000.0;

    // Accept either a top-level array or an object wrapping one under a common key.
    let markets = match &parsed {
        Value::Arr(_) => parsed.clone(),
        _ => {
            let mut v = Value::Null;
            for k in ["markets", "symbols", "result", "data"] {
                let candidate = ccxt::get_value(&parsed, &Value::Str(k.to_string()));
                if matches!(candidate, Value::Arr(_)) { v = candidate; break; }
            }
            v
        }
    };
    let items: &Vec<Value> = match &markets {
        Value::Arr(a) => a,
        _ => { eprintln!("no market array found in {path}"); std::process::exit(2); }
    };
    eprintln!("json_parse: {json_ms:.2} ms — market objects: {}", items.len());

    // Warmup
    for _ in 0..3 {
        let _: Vec<Market> = items.iter().map(|m| Market::from_value(m.clone())).collect();
    }

    let mut samples_ms: Vec<f64> = Vec::with_capacity(iters);
    for _ in 0..iters {
        let t0 = Instant::now();
        let _decoded: Vec<Market> = items.iter().map(|m| Market::from_value(m.clone())).collect();
        samples_ms.push(t0.elapsed().as_secs_f64() * 1000.0);
    }
    samples_ms.sort_by(|a, b| a.partial_cmp(b).unwrap());
    let min = samples_ms[0];
    let median = samples_ms[iters / 2];
    let max = samples_ms[iters - 1];
    let avg: f64 = samples_ms.iter().sum::<f64>() / iters as f64;
    println!("Market::from_value ({} objects × {iters} iters):", items.len());
    println!("  min={min:.2} ms  median={median:.2} ms  avg={avg:.2} ms  max={max:.2} ms");
    println!("  (one-shot json_parse: {json_ms:.2} ms)");
}
