// Order-book update micro-benchmark (no network) — replays realistic depth
// deltas into the CCXT WS `OrderBook` and measures wall/CPU time + peak RSS.
// Isolates the `handleDeltas`/side-store hot path L1nkus measured on
// watch_order_book (binance futures @depth 100ms).
//
//   cargo run --release --bin ob_bench -- [frames] [deltas_per_frame] [levels]
use ccxt::value::HashMap;
use ccxt::Value;
use std::time::Instant;

fn arr(vals: Vec<Value>) -> Value {
    Value::List(vals)
}
fn f(x: f64) -> Value {
    Value::Float(x)
}

fn cpu_secs() -> f64 {
    // utime+stime from /proc/self/stat (fields 14,15), in clock ticks.
    std::fs::read_to_string("/proc/self/stat")
        .ok()
        .and_then(|s| {
            let close = s.rfind(')')?;
            let rest: Vec<&str> = s[close + 2..].split_whitespace().collect();
            let utime: f64 = rest.get(11)?.parse().ok()?;
            let stime: f64 = rest.get(12)?.parse().ok()?;
            Some((utime + stime) / 100.0) // USER_HZ is 100 on linux
        })
        .unwrap_or(0.0)
}

fn peak_rss_mb() -> f64 {
    std::fs::read_to_string("/proc/self/status")
        .ok()
        .and_then(|s| {
            s.lines().find(|l| l.starts_with("VmHWM:"))
                .and_then(|l| l.split_whitespace().nth(1))
                .and_then(|kb| kb.parse::<f64>().ok())
        })
        .map(|kb| kb / 1024.0)
        .unwrap_or(0.0)
}

fn main() {
    let mut a = std::env::args().skip(1);
    let frames: usize = a.next().and_then(|s| s.parse().ok()).unwrap_or(50_000);
    let per: usize = a.next().and_then(|s| s.parse().ok()).unwrap_or(20);
    let levels: usize = a.next().and_then(|s| s.parse().ok()).unwrap_or(1000);

    // Snapshot: `levels` bids (descending) and asks (ascending) around 64000.
    let base = 64000.0;
    let tick = 0.1;
    let mut bids = Vec::with_capacity(levels);
    let mut asks = Vec::with_capacity(levels);
    for i in 0..levels {
        bids.push(arr(vec![f(base - i as f64 * tick), f(1.0 + i as f64 * 0.01)]));
        asks.push(arr(vec![f(base + tick + i as f64 * tick), f(1.0 + i as f64 * 0.01)]));
    }
    let mut snap = HashMap::new();
    snap.insert("bids".to_string(), arr(bids));
    snap.insert("asks".to_string(), arr(asks));
    let snapshot = Value::Map(snap);

    // depth 0 → unlimited (the book grows like a real @depth stream).
    let book = ccxt::pro::OrderBook::new(snapshot, Value::Int(0));

    // Warmup a couple frames.
    for _ in 0..2 {
        apply_frame(&book, base, tick, per, 0);
    }

    let w0 = Instant::now();
    let c0 = cpu_secs();
    for frame in 0..frames {
        apply_frame(&book, base, tick, per, frame);
        // read top-of-book each frame (like a resolution/BBO check)
        let bside = ccxt::get_value(&book, &Value::Str("bids".to_string()));
        let top = ccxt::get_value(&ccxt::get_value(&bside, &Value::Int(0)), &Value::Int(0));
        std::hint::black_box(top);
    }
    let wall = w0.elapsed().as_secs_f64();
    let cpu = cpu_secs() - c0;

    // Verify the typed decode reads the (marker-backed) book — should be
    // non-empty (regression guard for the "Bids: 0" from_value bug).
    let decoded = ccxt::types::OrderBook::from_value(book.clone());
    println!("typed decode: bids={} asks={}", decoded.bids.len(), decoded.asks.len());

    let updates = frames * per * 2;
    println!(
        "ob_bench: {frames} frames × {per} deltas × 2 sides ({levels} levels)\n\
         wall={wall:.3}s  cpu={cpu:.3}s  peakRSS={:.0}MB  ({:.2} M updates/s wall)",
        peak_rss_mb(),
        (updates as f64) / wall / 1e6
    );
}

// Apply `per` deltas to each side: a rolling mix of near-top updates, a fresh
// insert, and a delete (size 0) — the shape a live depth stream produces.
fn apply_frame(book: &Value, base: f64, tick: f64, per: usize, frame: usize) {
    let mut bside = ccxt::get_value(book, &Value::Str("bids".to_string()));
    let mut aside = ccxt::get_value(book, &Value::Str("asks".to_string()));
    for k in 0..per {
        // update an existing near-top level
        let bp = base - (k as f64) * tick;
        bside.store_array(arr(vec![f(bp), f(1.0 + (frame as f64) * 0.001)]));
        let ap = base + tick + (k as f64) * tick;
        aside.store_array(arr(vec![f(ap), f(1.0)]));
    }
    // one insert of a brand-new price + one delete, per side, to exercise the
    // insert/remove branches (not just in-place replace).
    let newp = base + 0.05 + (frame % 500) as f64 * tick;
    bside.store_array(arr(vec![f(base + 0.05), f(0.5)]));
    bside.store_array(arr(vec![f(base + 0.05), f(0.0)])); // delete it back
    aside.store_array(arr(vec![f(newp), f(0.5)]));
    aside.store_array(arr(vec![f(newp), f(0.0)]));
}
