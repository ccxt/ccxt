// ccxt-rust side of the binance-rs comparison — on the TYPED layer.
//
// `ccxt_pro::Binance` is the concrete typed WebSocket wrapper. Two ways to
// watch N books, both multiplexed over ONE connection:
//
//   agg (default) — `watch_order_book_for_symbols(symbols, ..) -> Result<OrderBook>`
//                   subscribes to all N in a single SUBSCRIBE frame; each await
//                   returns whichever book updated next. This is the direct
//                   counterpart of binance-rs's `connect_multiple_streams`.
//   rr            — `watch_order_book(symbol, ..)` per symbol, round-robin;
//                   each await drains the next update for THAT symbol.
//
// Either way a frame is a full, sorted, checksum-validated book — not a raw
// delta. Note the seeding cost: ccxt pulls one REST depth snapshot per book
// before that book can go live, so `t_all_live` below is well above zero and
// grows with N (see README).
//
//   cargo run --release --bin ccxt_side -- [secs] [symbols] [mode]
//     symbols: a count (e.g. `10` -> first 10 of the built-in list) or a
//              comma-separated list (e.g. `BTC/USDT,ETH/USDT`). Default: BTC/USDT.
//     mode:    `agg` (default) or `rr`.
use ccxt::types::Market;
use ccxt::{Config, Params, Value};

/// `(symbol, a, b)` — bids/asks for a book, or `(trades_in_batch, 0)` for the tape.
pub type WatchResult = (String, usize, usize);
use ccxt_pro::Binance;
use std::collections::HashMap;
use std::time::{Duration, Instant};

const BUILTIN: &[&str] = &[
    "BTC/USDT", "ETH/USDT", "BNB/USDT", "SOL/USDT", "XRP/USDT",
    "ADA/USDT", "DOGE/USDT", "AVAX/USDT", "LINK/USDT", "DOT/USDT",
];

// Liquid bases tried first when auto-selecting a large symbol set, so the
// throughput numbers are not dominated by dead pairs. The rest is filled
// alphabetically from whatever the venue actually lists.
const LIQUID: &[&str] = &[
    "BTC", "ETH", "BNB", "SOL", "XRP", "ADA", "DOGE", "AVAX", "LINK", "DOT",
    "TRX", "MATIC", "LTC", "BCH", "NEAR", "UNI", "ATOM", "FIL", "APT", "ARB",
    "OP", "INJ", "SUI", "SEI", "TIA", "AAVE", "ETC", "ICP", "RUNE", "LDO",
];

fn cpu_secs() -> f64 {
    std::fs::read_to_string("/proc/self/stat").ok().and_then(|s| {
        let close = s.rfind(')')?;
        let rest: Vec<&str> = s[close + 2..].split_whitespace().collect();
        let u: f64 = rest.get(11)?.parse().ok()?;
        let k: f64 = rest.get(12)?.parse().ok()?;
        Some((u + k) / 100.0)
    }).unwrap_or(0.0)
}
fn rss_field_mb(field: &str) -> f64 {
    std::fs::read_to_string("/proc/self/status").ok().and_then(|s| {
        s.lines().find(|l| l.starts_with(field))
            .and_then(|l| l.split_whitespace().nth(1))
            .and_then(|kb| kb.parse::<f64>().ok())
    }).map(|kb| kb / 1024.0).unwrap_or(0.0)
}
fn rss_mb() -> f64 { rss_field_mb("VmRSS:") }
fn peak_rss_mb() -> f64 { rss_field_mb("VmHWM:") }

fn parse_symbols(arg: Option<String>) -> Vec<String> {
    match arg {
        None => vec!["BTC/USDT".to_string()],
        Some(a) => match a.parse::<usize>() {
            Ok(n) => BUILTIN.iter().take(n.min(BUILTIN.len())).map(|s| s.to_string()).collect(),
            Err(_) => a.split(',').map(|s| s.trim().to_string()).filter(|s| !s.is_empty()).collect(),
        },
    }
}

/// Pick `n` symbols of one kind out of the loaded market map: liquid bases
/// first (in `LIQUID` order), then alphabetically. `kind` is "spot" or "swap".
fn pick(markets: &[Market], kind: &str, n: usize) -> Vec<String> {
    let mut cands: Vec<(String, String)> = Vec::new(); // (base, symbol)
    for m in markets {
        let is_kind = match kind {
            "spot" => m.spot,
            // linear USDT only — inverse/COIN-M books live on another endpoint.
            "swap" => m.swap && m.linear == Some(true),
            _ => false,
        };
        if is_kind && m.active && m.quote == "USDT" {
            cands.push((m.base.clone(), m.symbol.clone()));
        }
    }
    cands.sort();
    cands.dedup_by(|a, b| a.1 == b.1);
    let mut out: Vec<String> = Vec::new();
    for want in LIQUID {
        if out.len() >= n { break; }
        if let Some((_, sym)) = cands.iter().find(|(b, _)| b == want) {
            if !out.contains(sym) { out.push(sym.clone()); }
        }
    }
    for (_, sym) in &cands {
        if out.len() >= n { break; }
        if !out.contains(sym) { out.push(sym.clone()); }
    }
    out
}

// One maintained book: current depth plus when it first went live.
struct Book { bids: usize, asks: usize, frames: u64, first_s: f64 }

async fn run() {
    let run_secs: u64 = std::env::args().nth(1).and_then(|s| s.parse().ok()).unwrap_or(30);
    let arg = std::env::args().nth(2);
    let mode = std::env::args().nth(3).unwrap_or_else(|| "agg".to_string());
    // `book` (default) watches order books; `trades` watches the trade tape.
    // Trades need no REST snapshot, so nothing to seed and no checksum.
    let channel = std::env::args().nth(4).unwrap_or_else(|| "book".to_string());
    let trades = channel == "trades" || channel == "aggtrades";
    // binance exposes two trade feeds; `aggTrade` collapses same-price fills.
    let trade_params = if channel == "aggtrades" {
        Params::new().with_str("name", "aggTrade")
    } else {
        Params::none()
    };
    // "<spotN>+<perpN>" (e.g. `50+50`) selects two groups straight out of the
    // loaded market map. Spot and linear perps live on DIFFERENT binance ws
    // endpoints (stream. vs fstream.), so they cannot share one
    // watch_order_book_for_symbols call — each group gets its own subscription
    // and the loop alternates between them on the same exchange instance.
    let mix: Option<(usize, usize)> = arg.as_deref().and_then(|a| {
        let (l, r) = a.split_once('+')?;
        Some((l.trim().parse().ok()?, r.trim().parse().ok()?))
    });
    let syms = if mix.is_some() { Vec::new() } else { parse_symbols(arg.clone()) };

    // The per-book REST depth snapshot goes through the REST rate limiter.
    // CCXT_NO_RATELIMIT=1 turns it off to isolate how much of the seeding wall
    // below is throttling vs. actual network/parse work.
    // CCXT_MARKET_TYPES=spot (or "spot,linear", …) narrows loadMarkets, which is
    // where nearly all of the RSS below comes from.
    let mut cfg = Config::new();
    if std::env::var("CCXT_NO_RATELIMIT").is_ok() {
        cfg = cfg.enable_rate_limit(false);
    }
    if let Ok(t) = std::env::var("CCXT_MARKET_TYPES") {
        let types: Vec<&str> = t.split(',').map(str::trim).filter(|s| !s.is_empty()).collect();
        cfg = cfg.option("fetchMarkets", Params::new().with_strs("types", &types));
    }
    // Memory attribution: sample RSS at each stage so the peak can be split
    // into runtime baseline / instance / market metadata / live books.
    let rss_boot = rss_mb();
    let mut ex = Binance::with_config(cfg);
    let rss_new = rss_mb();
    let load0 = Instant::now();
    ex.load_markets(false).await;
    let load_s = load0.elapsed().as_secs_f64();
    let rss_markets = rss_mb();
    let markets = ex.markets();
    let n_markets = markets.len();
    let n_currencies = ex.currencies().len();

    // One group per ws endpoint.
    let groups: Vec<(String, Vec<String>)> = match mix {
        Some((ns, np)) => vec![
            ("spot".to_string(), pick(&markets, "spot", ns)),
            ("perp".to_string(), pick(&markets, "swap", np)),
        ],
        None => vec![("spot".to_string(), syms.clone())],
    };
    let all_syms: Vec<String> = groups.iter().flat_map(|(_, g)| g.clone()).collect();
    println!(
        "ccxt-rust (typed): binance {} {channel} stream(s) mode={mode} for {run_secs}s\u{2026} {}",
        all_syms.len(),
        groups.iter().map(|(k, g)| format!("{k}={}", g.len())).collect::<Vec<_>>().join(" "),
    );
    let show = if std::env::var("CCXT_PRINT_SYMBOLS").is_ok() { usize::MAX } else { 6 };
    for (k, g) in &groups {
        println!("  {k}: {}", g.iter().take(show).cloned().collect::<Vec<_>>().join(","));
    }

    let mut books: HashMap<String, Book> = HashMap::new();
    let (mut frames, mut errs) = (0u64, 0u64);
    let mut levels_total: u64 = 0;
    let mut all_live_s = f64::NAN;
    let start = Instant::now();
    let cpu0 = cpu_secs();
    // CCXT_TICK=10 prints a progress line every 10s — the reconnect/outage view.
    // run_secs = 0 means run forever (a plain `while true` driver loop).
    let tick_s: u64 = std::env::var("CCXT_TICK").ok().and_then(|v| v.parse().ok()).unwrap_or(0);
    let backoff_ms: u64 = std::env::var("CCXT_BACKOFF_MS").ok().and_then(|v| v.parse().ok()).unwrap_or(250);
    let forever = run_secs == 0;
    let mut last_tick = Instant::now();
    let mut last_tick_cpu = cpu_secs();
    let (mut tick_frames, mut tick_errs) = (0u64, 0u64);
    let mut i = 0usize;
    while forever || start.elapsed().as_secs() < run_secs {
        if tick_s > 0 && last_tick.elapsed().as_secs() >= tick_s {
            let now_cpu = cpu_secs();
            println!(
                "tick t={:>5.0}s  frames=+{tick_frames:<6} total={frames:<8} live={}/{}  \
                 errs=+{tick_errs:<7} cpu=+{:.2}s  rss={:.0}MB",
                start.elapsed().as_secs_f64(), books.len(), all_syms.len(),
                now_cpu - last_tick_cpu, rss_mb()
            );
            last_tick = Instant::now();
            last_tick_cpu = now_cpu;
            tick_frames = 0;
            tick_errs = 0;
        }
        // When running forever, cap each await so a dead socket cannot park the
        // loop indefinitely — this is the retry cadence a real driver needs.
        let remaining = if forever {
            Duration::from_secs(15)
        } else {
            Duration::from_secs(run_secs).saturating_sub(start.elapsed())
        };
        // (symbol, a, b) where a/b are bids/asks for books, or trade count / 0
        // for the tape — one shape so the accounting below stays shared.
        let got: Result<Result<WatchResult, _>, _> = if trades {
            let g = groups[i % groups.len()].1.clone();
            i += 1;
            tokio::time::timeout(remaining, ex.watch_trades_for_symbols(g, None, None, trade_params.clone()))
                .await
                .map(|r| r.map(|ts| {
                    let sym = ts.first().map(|t| t.symbol.clone()).unwrap_or_default();
                    (sym, ts.len(), 0usize)
                }))
        } else if mode == "rr" {
            let sym = all_syms[i % all_syms.len()].clone();
            i += 1;
            tokio::time::timeout(remaining, ex.watch_order_book(&sym, None, Params::none()))
                .await
                .map(|r| r.map(|ob| (ob.symbol.clone().unwrap_or_default(), ob.bids.len(), ob.asks.len())))
        } else {
            let g = groups[i % groups.len()].1.clone();
            i += 1;
            tokio::time::timeout(remaining, ex.watch_order_book_for_symbols(g, None, Params::none()))
                .await
                .map(|r| r.map(|ob| (ob.symbol.clone().unwrap_or_default(), ob.bids.len(), ob.asks.len())))
        };
        match got {
            Ok(Ok((sym, a, b))) => {
                frames += 1;
                let at = start.elapsed().as_secs_f64();
                let e = books.entry(sym)
                    .or_insert(Book { bids: 0, asks: 0, frames: 0, first_s: at });
                e.bids = a;
                e.asks = b;
                e.frames += 1;
                levels_total += (a + b) as u64;
                tick_frames += 1;
                if books.len() == all_syms.len() && all_live_s.is_nan() { all_live_s = at; }
            }
            // A binance sequence gap surfaces as a checksum error telling you to
            // resync; the next call re-seeds from a fresh REST snapshot.
            Ok(Err(e)) => {
                errs += 1;
                tick_errs += 1;
                if errs <= 5 {
                    println!("  [{:>6.1}s] err#{errs}: {e}", start.elapsed().as_secs_f64());
                }
                // ccxt retries the connect with NO backoff of its own — without
                // this sleep the loop spins at ~9k failed handshakes/second for
                // the whole outage. CCXT_BACKOFF_MS=0 reproduces that.
                if backoff_ms > 0 {
                    tokio::time::sleep(Duration::from_millis(backoff_ms)).await;
                }
            }
            // Await deadline. When bounded that is the end of the run; when
            // running forever it just means nothing arrived in 15s — keep going.
            Err(_) => {
                if !forever { break; }
                errs += 1;
                tick_errs += 1;
                println!("  [{:>6.1}s] await timed out with no update", start.elapsed().as_secs_f64());
            }
        }
    }
    let cpu = cpu_secs() - cpu0;
    let wall = start.elapsed().as_secs_f64();
    let rss_end = rss_mb();
    let levels: usize = books.values().map(|b| b.bids + b.asks).sum();
    println!(
        "CCXT-RUST   books={}/{}  frames={frames}  levels_maintained={levels}  \
         wall={wall:.1}s  cpu={cpu:.3}s  peakRSS={:.0}MB  resyncs={errs}",
        books.len(), all_syms.len(), peak_rss_mb()
    );
    let mut per: Vec<String> = Vec::new();
    if books.len() <= 12 {
        per = books.iter()
            .map(|(s, b)| format!("{s} {}/{} live@{:.1}s x{}", b.bids, b.asks, b.first_s, b.frames))
            .collect();
        per.sort();
    } else {
        // Too many to list — summarize per group.
        for (k, g) in &groups {
            let live: Vec<&Book> = g.iter().filter_map(|s| books.get(s)).collect();
            let fr: u64 = live.iter().map(|b| b.frames).sum();
            let last = live.iter().map(|b| b.first_s).fold(0.0f64, f64::max);
            per.push(format!("{k}: {}/{} live, last@{last:.1}s, {fr} frames", live.len(), g.len()));
        }
    }
    println!(
        "note: loadMarkets={load_s:.1}s for {n_markets} markets / {n_currencies} currencies (excluded from cpu/wall above). \
         t_all_live={}  per-book: {per:?}",
        if all_live_s.is_nan() { "never".to_string() } else { format!("{all_live_s:.1}s") }
    );
    let rss_peak = peak_rss_mb();
    println!(
        "rss: boot={rss_boot:.0}MB new={rss_new:.0}MB afterMarkets={rss_markets:.0}MB \
         end={rss_end:.0}MB peak={rss_peak:.0}MB"
    );
    // One machine-readable line for the `compare` driver.
    println!(
        "RESULT side=ccxt channel={channel} mode={mode} want={} books={} frames={frames} cpu={cpu:.3} wall={wall:.1} \
         levels={levels} levels_total={levels_total} resyncs={errs} t_all_live={} load_s={load_s:.1} markets={n_markets} \
         currencies={n_currencies} rss_boot={rss_boot:.0} rss_new={rss_new:.0} \
         rss_markets={rss_markets:.0} rss_end={rss_end:.0} rss_peak={rss_peak:.0}",
        all_syms.len(), books.len(),
        if all_live_s.is_nan() { -1.0 } else { all_live_s }
    );
    // CCXT_MEM_DETAIL=1 re-serializes the stores to JSON to show how much of the
    // resident footprint is payload vs `Value` representation overhead. Costs a
    // large transient allocation, so it runs after the peak is reported.
    if std::env::var("CCXT_MEM_DETAIL").is_ok() {
        let mb = |v: &Value| v.to_json().to_string().len() as f64 / 1_048_576.0;
        println!(
            "mem-detail: markets_json={:.1}MB markets_by_id_json={:.1}MB currencies_json={:.1}MB \
             (resident after load = {:.0}MB)",
            mb(&ex.markets), mb(&ex.markets_by_id), mb(&ex.currencies), rss_markets - rss_new
        );
    }
}

fn main() {
    // The pro runtime signals errors by panicking across an internal
    // catch_unwind (surfaced back as `Result`). Silence the default hook so a
    // reconnect storm does not bury stdout — the `errs` counter is the signal.
    if std::env::var("CCXT_SHOW_PANICS").is_err() {
        std::panic::set_hook(Box::new(|_| {}));
    }
    let rt = tokio::runtime::Builder::new_multi_thread()
        .worker_threads(4)
        .thread_stack_size(64 * 1024 * 1024)
        .enable_all()
        .build()
        .unwrap();
    rt.block_on(run());
}
