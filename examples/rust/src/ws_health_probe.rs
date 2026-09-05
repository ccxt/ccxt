// WS health probe (TYPED API): for every pro exchange, load markets, pick a BTC
// symbol, and call the watch_* method under test once with a timeout + panic
// capture. Classifies each as OK / EMPTY / TIMEOUT / PANIC(msg) so systemic
// runtime bugs stand out from environmental failures.
//
// Each venue is built by id with `ccxt_pro::from_id`; because the method under
// test is chosen at runtime (CCXT_METHOD), it's dispatched via the typed
// `TypedExchange::call_raw` (the typed crate's dynamic escape hatch).
use std::future::Future;
use std::panic::AssertUnwindSafe;
use std::pin::Pin;
use std::time::Duration;

use ccxt::{get_value, Value};
use ccxt_pro::{from_id, TypedExchange};
use futures::stream::{self, StreamExt};
use futures::FutureExt;

const CANDIDATES: &[&str] = &[
    "BTC/USDT",
    "BTC/USDT:USDT",
    "BTC/USD",
    "BTC/USD:BTC",
    "BTC/USDC",
    "BTC/USDC:USDC",
    "BTC/EUR",
    "ETH/USDT",
    "BTC/JPY",
    "BTC/KRW",
];

// Every pro venue with a typed WS wrapper (`ccxt_pro::from_id`).
const VENUES: &[&str] = &[
    "alpaca",
    "apex",
    "aster",
    "backpack",
    "binance",
    "bingx",
    "bitfinex",
    "bitget",
    "bithumb",
    "bitmex",
    "bitopro",
    "bitrue",
    "bitstamp",
    "bittrade",
    "bitvavo",
    "blockchaincom",
    "blofin",
    "bullish",
    "bybit",
    "bydfi",
    "cex",
    "coinbase",
    "coinbaseexchange",
    "coinbaseinternational",
    "coincheck",
    "coinex",
    "coinone",
    "cryptocom",
    "deepcoin",
    "deribit",
    "derive",
    "dydx",
    "extended",
    "gate",
    "gemini",
    "grvt",
    "hashkey",
    "hitbtc",
    "hollaex",
    "htx",
    "hyperliquid",
    "independentreserve",
    "kraken",
    "krakenfutures",
    "kucoin",
    "lbank",
    "lighter",
    "luno",
    "mexc",
    "modetrade",
    "nado",
    "ndax",
    "okx",
    "onetrading",
    "p2b",
    "pacifica",
    "paradex",
    "phemex",
    "poloniex",
    "toobit",
    "upbit",
    "weex",
    "whitebit",
    "woo",
    "woofipro",
    "xt",
];

type Probe = Pin<Box<dyn Future<Output = (String, String)> + Send>>;

fn panic_msg(e: Box<dyn std::any::Any + Send>) -> String {
    let s = if let Some(s) = e.downcast_ref::<String>() {
        s.clone()
    } else if let Some(s) = e.downcast_ref::<&str>() {
        s.to_string()
    } else {
        "<non-string panic>".to_string()
    };
    s.chars().take(90).collect()
}

fn probe_method() -> String {
    std::env::var("CCXT_METHOD").unwrap_or_else(|_| "watch_order_book".to_string())
}

fn extra_args(method: &str) -> Vec<Value> {
    match method {
        "watch_ohlcv" => vec![Value::Str("1m".to_string())],
        _ => vec![],
    }
}

fn nonempty_list(v: &Value) -> bool {
    !matches!(get_value(v, &Value::Int(0)), Value::Null)
}

fn classify(method: &str, result: &Value, sym: &str) -> String {
    match method {
        "watch_order_book" => {
            let bids = get_value(result, &Value::Str("bids".to_string()));
            let asks = get_value(result, &Value::Str("asks".to_string()));
            let bid = get_value(&get_value(&bids, &Value::Int(0)), &Value::Int(0))
                .as_f64()
                .unwrap_or(0.0);
            let ask = get_value(&get_value(&asks, &Value::Int(0)), &Value::Int(0))
                .as_f64()
                .unwrap_or(0.0);
            if bid > 0.0 && ask > 0.0 {
                format!("OK        [{sym}] {bid}/{ask}")
            } else if bid > 0.0 || ask > 0.0 {
                format!("OK1SIDE   [{sym}] {bid}/{ask}")
            } else {
                format!("EMPTY     [{sym}]")
            }
        }
        "watch_ticker" => {
            let field = |k: &str| {
                get_value(result, &Value::Str(k.to_string()))
                    .as_f64()
                    .unwrap_or(0.0)
            };
            let px = [field("last"), field("close"), field("bid"), field("ask")]
                .into_iter()
                .find(|x| *x > 0.0)
                .unwrap_or(0.0);
            if px > 0.0 {
                format!("OK        [{sym}] last={px}")
            } else {
                format!("EMPTY     [{sym}]")
            }
        }
        _ => {
            if nonempty_list(result) {
                let first = get_value(result, &Value::Int(0));
                let px = get_value(&first, &Value::Str("price".to_string()))
                    .as_f64()
                    .or_else(|| get_value(&first, &Value::Int(4)).as_f64())
                    .unwrap_or(0.0);
                format!("OK        [{sym}] px={px}")
            } else {
                format!("EMPTY     [{sym}]")
            }
        }
    }
}

async fn watch_probe(mut ex: Box<dyn TypedExchange>) -> String {
    // `call_raw` is the TypedExchange dynamic escape hatch: `Result<Value>`.
    let lm = ex.call_raw("load_markets", vec![]);
    let markets =
        match tokio::time::timeout(Duration::from_secs(40), AssertUnwindSafe(lm).catch_unwind())
            .await
        {
            Err(_) => return "LOADMKTS_TIMEOUT".to_string(),
            Ok(Err(e)) => return format!("LOADMKTS_PANIC: {}", panic_msg(e)),
            Ok(Ok(Err(e))) => {
                return format!(
                    "LOADMKTS_ERR: {}",
                    e.to_string().chars().take(60).collect::<String>()
                )
            }
            Ok(Ok(Ok(m))) => m,
        };
    let candidate = CANDIDATES
        .iter()
        .find(|c| !matches!(get_value(&markets, &Value::Str(c.to_string())), Value::Null))
        .map(|s| s.to_string());
    let sym = candidate.or_else(|| match &markets {
        Value::Dict(d) => d
            .keys()
            .filter(|k| k.starts_with("BTC/"))
            .min_by_key(|k| k.len())
            .cloned(),
        _ => None,
    });
    let sym = match sym {
        Some(s) => s,
        None => {
            let sample: Vec<String> = match &markets {
                Value::Dict(d) => d.keys().take(12).cloned().collect(),
                _ => vec![],
            };
            return format!(
                "NO_BTC_SYMBOL (n={}, sample={:?})",
                match &markets {
                    Value::Dict(d) => d.len(),
                    _ => 0,
                },
                sample
            );
        }
    };
    let sym: &str = &sym;
    let method = probe_method();
    let extra = extra_args(&method);

    // Loop like real usage: many venues resolve an empty book first and fill via
    // subsequent deltas. Keep watching (within a budget) until two-sided.
    let deadline = tokio::time::Instant::now() + Duration::from_secs(22);
    let mut last = String::from("EMPTY     [never resolved]");
    let mut resolved_once = false;
    loop {
        let now = tokio::time::Instant::now();
        if now >= deadline {
            return if resolved_once {
                last
            } else {
                format!("TIMEOUT   [{sym}]")
            };
        }
        let mut args = vec![Value::Str(sym.to_string())];
        args.extend(extra.iter().cloned());
        let fut = ex.call_raw(&method, args);
        match tokio::time::timeout(deadline - now, AssertUnwindSafe(fut).catch_unwind()).await {
            Err(_) => {
                return if resolved_once {
                    last
                } else {
                    format!("TIMEOUT   [{sym}]")
                }
            }
            Ok(Err(e)) => return format!("PANIC     [{sym}]: {}", panic_msg(e)),
            Ok(Ok(Err(e))) => {
                return format!(
                    "ERR       [{sym}]: {}",
                    e.to_string().chars().take(60).collect::<String>()
                )
            }
            Ok(Ok(Ok(ob))) => {
                resolved_once = true;
                let c = classify(&method, &ob, sym);
                if c.starts_with("OK ") {
                    return c;
                }
                last = c;
            }
        }
    }
}

fn filter_ok(id: &str) -> bool {
    match std::env::var("CCXT_ONLY") {
        Ok(list) if !list.is_empty() => list.split(',').any(|x| x == id),
        _ => true,
    }
}

fn main() {
    std::panic::set_hook(Box::new(|_| {}));
    let rt = tokio::runtime::Builder::new_multi_thread()
        .worker_threads(8)
        .thread_stack_size(64 * 1024 * 1024)
        .enable_all()
        .build()
        .unwrap();
    rt.block_on(async_main());
}

async fn async_main() {
    let mut v: Vec<Probe> = Vec::new();
    for &id in VENUES {
        if !filter_ok(id) {
            continue;
        }
        if let Some(ex) = from_id(id, None) {
            v.push(Box::pin(async move { (id.to_string(), watch_probe(ex).await) }) as Probe);
        }
    }

    let total = v.len();
    eprintln!("probing {total} venues (concurrency 6)…");
    let mut results: Vec<(String, String)> = stream::iter(v)
        .buffer_unordered(6)
        .collect::<Vec<_>>()
        .await;
    results.sort();
    println!("\n==== {} health ====", probe_method());
    for (id, out) in &results {
        println!("{id:<22} {out}");
    }
    let mut ok = 0;
    let mut empty = 0;
    let mut timeout = 0;
    let mut panic = 0;
    let mut other = 0;
    for (_, o) in &results {
        if o.starts_with("OK") {
            ok += 1;
        } else if o.starts_with("EMPTY") {
            empty += 1;
        } else if o.starts_with("TIMEOUT") {
            timeout += 1;
        } else if o.starts_with("PANIC") {
            panic += 1;
        } else {
            other += 1;
        }
    }
    println!("\n==== summary: {total} venues ====");
    println!("OK={ok}  EMPTY={empty}  TIMEOUT={timeout}  PANIC={panic}  OTHER={other}");
}
