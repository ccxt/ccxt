// Driver: runs ccxt_side and binance_rs_side as separate concurrent processes
// (so peak RSS is attributed per process) for the same window and symbol set,
// then prints the comparison tables.
//
//   cargo run --release --bin compare -- [secs] [counts]
//     secs:   seconds per round. Default 30.
//     counts: comma-separated book counts, one round each. Default `1,10`.
//
// The ccxt child runs with CCXT_NO_RATELIMIT=1 by default: with the limiter on,
// ccxt needs ~20s per REST depth snapshot and multi-book rounds return nothing
// inside a 30s window (see README, "book seeding is throttle-bound"). Set
// CCXT_KEEP_RATELIMIT=1 to measure the default-config behaviour instead.
use std::collections::HashMap;
use std::process::{Command, Stdio};

#[derive(Default, Clone)]
struct Run {
    frames: f64,
    cpu: f64,
    wall: f64,
    levels: f64,
    levels_total: f64,
    books: f64,
    want: f64,
    resyncs: f64,
    t_all_live: f64,
    load_s: f64,
    markets: f64,
    currencies: f64,
    rss_boot: f64,
    rss_new: f64,
    rss_markets: f64,
    rss_end: f64,
    rss_peak: f64,
}

impl Run {
    fn from_kv(kv: &HashMap<String, String>) -> Self {
        let g = |k: &str| kv.get(k).and_then(|v| v.parse::<f64>().ok()).unwrap_or(0.0);
        Run {
            frames: g("frames"), cpu: g("cpu"), wall: g("wall"), levels: g("levels"),
            levels_total: g("levels_total"),
            books: g("books"), want: g("want"), resyncs: g("resyncs"),
            t_all_live: g("t_all_live"), load_s: g("load_s"), markets: g("markets"),
            currencies: g("currencies"), rss_boot: g("rss_boot"), rss_new: g("rss_new"),
            rss_markets: g("rss_markets"), rss_end: g("rss_end"), rss_peak: g("rss_peak"),
        }
    }
    fn fps(&self) -> f64 { if self.wall > 0.0 { self.frames / self.wall } else { 0.0 } }
    fn us_per_frame(&self) -> f64 { if self.frames > 0.0 { self.cpu * 1e6 / self.frames } else { 0.0 } }
    fn levels_per_frame(&self) -> f64 {
        if self.frames > 0.0 { self.levels_total / self.frames } else { 0.0 }
    }
}

fn parse_result(out: &str) -> Option<Run> {
    let line = out.lines().find(|l| l.starts_with("RESULT "))?;
    let mut kv = HashMap::new();
    for tok in line.split_whitespace().skip(1) {
        if let Some((k, v)) = tok.split_once('=') {
            // `books=3/3` -> keep the numerator; the denominator is `want`.
            kv.insert(k.to_string(), v.split('/').next().unwrap_or(v).to_string());
        }
    }
    Some(Run::from_kv(&kv))
}

// Run both sides concurrently for one round.
fn round(dir: &std::path::Path, secs: u64, n: usize) -> (Option<Run>, Option<Run>) {
    let secs = secs.to_string();
    let n = n.to_string();
    let mut ccxt = Command::new(dir.join("ccxt_side"));
    ccxt.args([&secs, &n]).stdout(Stdio::piped()).stderr(Stdio::null());
    if std::env::var("CCXT_KEEP_RATELIMIT").is_err() {
        ccxt.env("CCXT_NO_RATELIMIT", "1");
    }
    let ccxt = ccxt.spawn().expect("spawn ccxt_side");
    let brs = Command::new(dir.join("binance_rs_side"))
        .args([&secs, &n])
        .stdout(Stdio::piped())
        .stderr(Stdio::null())
        .spawn()
        .expect("spawn binance_rs_side");
    let a = ccxt.wait_with_output().expect("ccxt_side");
    let b = brs.wait_with_output().expect("binance_rs_side");
    (
        parse_result(&String::from_utf8_lossy(&a.stdout)),
        parse_result(&String::from_utf8_lossy(&b.stdout)),
    )
}

fn row(label: &str, cells: &[String]) {
    print!("| {label:<22} |");
    for c in cells { print!(" {c:>12} |"); }
    println!();
}

fn header(counts: &[usize]) {
    print!("| {:<22} |", "");
    for n in counts {
        print!(" {:>12} |", format!("{n} bk ccxt"));
        print!(" {:>12} |", format!("{n} bk brs"));
    }
    println!();
    print!("|{}|", "-".repeat(24));
    for _ in counts { print!("{}|{}|", "-".repeat(14), "-".repeat(14)); }
    println!();
}

fn main() {
    let secs: u64 = std::env::args().nth(1).and_then(|s| s.parse().ok()).unwrap_or(30);
    let counts: Vec<usize> = std::env::args().nth(2)
        .unwrap_or_else(|| "1,10".to_string())
        .split(',')
        .filter_map(|s| s.trim().parse().ok())
        .collect();
    let dir = std::env::current_exe().expect("current_exe").parent().expect("parent").to_path_buf();
    let limiter = if std::env::var("CCXT_KEEP_RATELIMIT").is_ok() { "ON (default config)" } else { "OFF (CCXT_NO_RATELIMIT=1)" };

    println!("compare: {secs}s per round, book counts {counts:?}, both sides concurrent");
    println!("         ccxt REST rate limiter: {limiter}\n");

    let mut results: Vec<(usize, Run, Run)> = Vec::new();
    for &n in &counts {
        eprintln!("… round: {n} book(s), {secs}s");
        let (a, b) = round(&dir, secs, n);
        results.push((n, a.unwrap_or_default(), b.unwrap_or_default()));
    }

    let cols: Vec<usize> = results.iter().map(|(n, _, _)| *n).collect();
    let each = |f: &dyn Fn(&Run) -> String| -> Vec<String> {
        results.iter().flat_map(|(_, a, b)| [f(a), f(b)]).collect()
    };

    println!("## Throughput / CPU / RAM ({secs}s per round)\n");
    header(&cols);
    row("books live", &each(&|r| format!("{:.0}/{:.0}", r.books, r.want)));
    row("frames", &each(&|r| format!("{:.0}", r.frames)));
    row("frames/s", &each(&|r| format!("{:.1}", r.fps())));
    row("CPU (watch loop)", &each(&|r| format!("{:.2} s", r.cpu)));
    row("CPU per frame", &each(&|r| format!("{:.0} us", r.us_per_frame())));
    row("peak RSS", &each(&|r| format!("{:.0} MB", r.rss_peak)));
    row("t_all_live", &each(&|r| if r.t_all_live < 0.0 { "never".into() } else { format!("{:.1} s", r.t_all_live) }));
    row("resyncs", &each(&|r| format!("{:.0}", r.resyncs)));

    println!("\n## What one update carries\n");
    header(&cols);
    row("levels per frame (avg)", &each(&|r| format!("{:.0}", r.levels_per_frame())));
    row("levels over window", &each(&|r| format!("{:.0}", r.levels_total)));
    row("sorted + checksummed", &each(&|r| (if r.markets > 0.0 { "yes" } else { "no" }).to_string()));
    row("depth held at end", &each(&|r| format!("{:.0}", r.levels)));
    row("markets loaded", &each(&|r| format!("{:.0}", r.markets)));

    println!("\n## ccxt / binance-rs\n");
    print!("| {:<22} |", "");
    for n in &cols { print!(" {:>12} |", format!("{n} book(s)")); }
    println!();
    print!("|{}|", "-".repeat(24));
    for _ in &cols { print!("{}|", "-".repeat(14)); }
    println!();
    let ratio = |f: &dyn Fn(&Run) -> f64| -> Vec<String> {
        results.iter().map(|(_, a, b)| {
            let (x, y) = (f(a), f(b));
            if y > 0.0 { format!("{:.1}x", x / y) } else { "n/a".into() }
        }).collect()
    };
    row("frames", &ratio(&|r| r.frames));
    row("CPU", &ratio(&|r| r.cpu));
    row("CPU per frame", &ratio(&|r| r.us_per_frame()));
    row("peak RSS", &ratio(&|r| r.rss_peak));
    row("levels per frame", &ratio(&|r| r.levels_per_frame()));

    // Memory attribution comes from the largest ccxt round (it is flat in N).
    if let Some((n, c, b)) = results.last() {
        println!("\n## Where ccxt's RSS goes ({n} book(s))\n");
        println!("| {:<42} | {:>10} | {:>10} |", "stage", "RSS", "delta");
        println!("|{}|{}|{}|", "-".repeat(44), "-".repeat(12), "-".repeat(12));
        let line = |label: String, rss: f64, delta: f64| {
            println!("| {label:<42} | {:>10} | {:>10} |", format!("{rss:.0} MB"), format!("{delta:+.0} MB"));
        };
        line("process baseline (tokio + binary)".into(), c.rss_boot, c.rss_boot);
        line("+ Binance instance (describe, api)".into(), c.rss_new, c.rss_new - c.rss_boot);
        line(
            format!("+ loadMarkets ({:.0} mkts / {:.0} ccy, {:.1}s)", c.markets, c.currencies, c.load_s),
            c.rss_markets, c.rss_markets - c.rss_new,
        );
        line(format!("+ {n} live order book(s)"), c.rss_end, c.rss_end - c.rss_markets);
        line("peak (VmHWM, transient parse spike)".into(), c.rss_peak, c.rss_peak - c.rss_end);
        println!("| {:<42} | {:>10} | {:>10} |", "binance-rs, same window", format!("{:.0} MB", b.rss_peak), "");
        let share = if c.rss_peak > 0.0 { (c.rss_markets - c.rss_new) / c.rss_peak * 100.0 } else { 0.0 };
        println!("\nloadMarkets accounts for {share:.0}% of ccxt's peak RSS; the live books cost {:+.0} MB.", c.rss_end - c.rss_markets);
        println!("Run `CCXT_MEM_DETAIL=1 ccxt_side …` to split that into payload vs Value overhead.");
    }
}
