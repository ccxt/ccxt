// WS health probe: for every pro exchange, load markets, pick a BTC symbol, and
// call watch_order_book once with a timeout + panic capture. Classifies each as
// OK / EMPTY / TIMEOUT / PANIC(msg) so systemic runtime bugs stand out from
// environmental failures (geo-block, auth-required, symbol-absent).
use std::future::Future;
use std::panic::AssertUnwindSafe;
use std::pin::Pin;
use std::time::Duration;

use ccxt::exchange_generated::ExchangeBase;
use ccxt::{get_value, Value};
use futures::stream::{self, StreamExt};
use futures::FutureExt;

const CANDIDATES: &[&str] = &[
    "BTC/USDT", "BTC/USDT:USDT", "BTC/USD", "BTC/USD:BTC", "BTC/USDC",
    "BTC/USDC:USDC", "BTC/EUR", "ETH/USDT", "BTC/JPY", "BTC/KRW",
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

// The watch_* method under test — defaults to watch_order_book.
fn probe_method() -> String {
    std::env::var("CCXT_METHOD").unwrap_or_else(|_| "watch_order_book".to_string())
}

// Extra positional args after the symbol (watch_ohlcv needs a timeframe).
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
            let bid = get_value(&get_value(&bids, &Value::Int(0)), &Value::Int(0)).as_f64().unwrap_or(0.0);
            let ask = get_value(&get_value(&asks, &Value::Int(0)), &Value::Int(0)).as_f64().unwrap_or(0.0);
            // A two-sided book is a definitive success; some markets are thin.
            if bid > 0.0 && ask > 0.0 {
                format!("OK        [{sym}] {bid}/{ask}")
            } else if bid > 0.0 || ask > 0.0 {
                format!("OK1SIDE   [{sym}] {bid}/{ask}")
            } else {
                format!("EMPTY     [{sym}]")
            }
        }
        "watch_ticker" => {
            let field = |k: &str| get_value(result, &Value::Str(k.to_string())).as_f64().unwrap_or(0.0);
            let px = [field("last"), field("close"), field("bid"), field("ask")]
                .into_iter().find(|x| *x > 0.0).unwrap_or(0.0);
            if px > 0.0 { format!("OK        [{sym}] last={px}") } else { format!("EMPTY     [{sym}]") }
        }
        // watch_trades / watch_ohlcv resolve a non-empty list.
        _ => {
            if nonempty_list(result) {
                let first = get_value(result, &Value::Int(0));
                let px = get_value(&first, &Value::Str("price".to_string())).as_f64()
                    .or_else(|| get_value(&first, &Value::Int(4)).as_f64()) // ohlcv close
                    .unwrap_or(0.0);
                format!("OK        [{sym}] px={px}")
            } else {
                format!("EMPTY     [{sym}]")
            }
        }
    }
}

async fn watch_probe<T: ExchangeBase + Send + 'static>(mut ex: Box<T>) -> String {
    let lm = ExchangeBase::call_dynamic(&mut *ex, "load_markets", vec![]);
    let markets = match tokio::time::timeout(Duration::from_secs(40), AssertUnwindSafe(lm).catch_unwind()).await {
        Err(_) => return "LOADMKTS_TIMEOUT".to_string(),
        Ok(Err(e)) => return format!("LOADMKTS_PANIC: {}", panic_msg(e)),
        Ok(Ok(m)) => m,
    };
    let candidate = CANDIDATES.iter().find(|c| {
        !matches!(get_value(&markets, &Value::Str(c.to_string())), Value::Null)
    }).map(|s| s.to_string());
    // Fallback: any spot BTC market this venue lists (handles JP/KR/perp-only).
    let sym = candidate.or_else(|| match &markets {
        Value::Dict(d) => d.keys()
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
            return format!("NO_BTC_SYMBOL (n={}, sample={:?})",
                match &markets { Value::Dict(d) => d.len(), _ => 0 }, sample);
        }
    };
    let sym: &str = &sym;
    let method = probe_method();
    let extra = extra_args(&method);
    // Diagnostic: CCXT_LOOPS=N calls the method N times back-to-back (like the
    // real watch* test loop) and reports each call's latency, exposing a
    // re-resolve hang on the 2nd+ call.
    if let Ok(n) = std::env::var("CCXT_LOOPS").map(|s| s.parse::<usize>().unwrap_or(0)) {
        if n > 0 {
            for i in 0..n {
                let t0 = tokio::time::Instant::now();
                let mut args = vec![Value::Str(sym.to_string())];
                args.extend(extra.iter().cloned());
                let fut = ExchangeBase::call_dynamic(&mut *ex, &method, args);
                match tokio::time::timeout(Duration::from_secs(20), AssertUnwindSafe(fut).catch_unwind()).await {
                    Err(_)       => { eprintln!("[loop {i}] {method} TIMEOUT after 20s"); return format!("LOOP_HANG [{sym}] at call {i}"); }
                    Ok(Err(e))   => { eprintln!("[loop {i}] {method} PANIC {}", panic_msg(e)); return format!("LOOP_PANIC [{sym}] at {i}"); }
                    Ok(Ok(_ob))  => { eprintln!("[loop {i}] {method} resolved in {}ms", t0.elapsed().as_millis()); }
                }
            }
            return format!("LOOP_OK   [{sym}] {n} calls");
        }
    }
    // Loop like real usage: many venues resolve an empty book first and fill via
    // subsequent deltas. Keep watching (within a total budget) until the book is
    // two-sided. We track the best partial result so a genuinely one-sided venue
    // (e.g. derive's thin testnet market) surfaces as OK1SIDE at the deadline
    // rather than a bare TIMEOUT, while a never-resolving venue stays TIMEOUT.
    let deadline = tokio::time::Instant::now() + Duration::from_secs(22);
    let mut last = String::from("EMPTY     [never resolved]");
    let mut resolved_once = false;
    loop {
        let now = tokio::time::Instant::now();
        if now >= deadline {
            return if resolved_once { last } else { format!("TIMEOUT   [{sym}]") };
        }
        let mut args = vec![Value::Str(sym.to_string())];
        args.extend(extra.iter().cloned());
        let fut = ExchangeBase::call_dynamic(&mut *ex, &method, args);
        match tokio::time::timeout(deadline - now, AssertUnwindSafe(fut).catch_unwind()).await {
            Err(_) => return if resolved_once { last } else { format!("TIMEOUT   [{sym}]") },
            Ok(Err(e)) => return format!("PANIC     [{sym}]: {}", panic_msg(e)),
            Ok(Ok(ob)) => {
                resolved_once = true;
                let c = classify(&method, &ob, sym);
                // Only a two-sided book ("OK        ") is a definitive success.
                // Incremental venues (e.g. bithumb) resolve a one-sided book first
                // and fill the other side via later deltas, so keep looping on
                // OK1SIDE and only fall back to it at the deadline.
                if c.starts_with("OK ") { return c; }
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

macro_rules! probe {
    ($v:ident, $id:literal, $ty:ty) => {
        if filter_ok($id) {
            $v.push(Box::pin(async move {
                let mut ex = Box::new(<$ty>::new(None));
                ex.bind();
                (($id).to_string(), watch_probe(ex).await)
            }) as Probe);
        }
    };
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
        probe!(v, "alpaca", ccxt::pro::alpaca::AlpacaCore);
        probe!(v, "apex", ccxt::pro::apex::ApexCore);
        probe!(v, "aster", ccxt::pro::aster::AsterCore);
        probe!(v, "backpack", ccxt::pro::backpack::BackpackCore);
        probe!(v, "binance", ccxt::pro::binance::BinanceCore);
        probe!(v, "bingx", ccxt::pro::bingx::BingxCore);
        probe!(v, "bitfinex", ccxt::pro::bitfinex::BitfinexCore);
        probe!(v, "bitget", ccxt::pro::bitget::BitgetCore);
        probe!(v, "bithumb", ccxt::pro::bithumb::BithumbCore);
        probe!(v, "bitmex", ccxt::pro::bitmex::BitmexCore);
        probe!(v, "bitopro", ccxt::pro::bitopro::BitoproCore);
        probe!(v, "bitrue", ccxt::pro::bitrue::BitrueCore);
        probe!(v, "bitstamp", ccxt::pro::bitstamp::BitstampCore);
        probe!(v, "bittrade", ccxt::pro::bittrade::BittradeCore);
        probe!(v, "bitvavo", ccxt::pro::bitvavo::BitvavoCore);
        probe!(v, "blockchaincom", ccxt::pro::blockchaincom::BlockchaincomCore);
        probe!(v, "blofin", ccxt::pro::blofin::BlofinCore);
        probe!(v, "bullish", ccxt::pro::bullish::BullishCore);
        probe!(v, "bybit", ccxt::pro::bybit::BybitCore);
        probe!(v, "bydfi", ccxt::pro::bydfi::BydfiCore);
        probe!(v, "cex", ccxt::pro::cex::CexCore);
        probe!(v, "coinbase", ccxt::pro::coinbase::CoinbaseCore);
        probe!(v, "coinbaseexchange", ccxt::pro::coinbaseexchange::CoinbaseexchangeCore);
        probe!(v, "coinbaseinternational", ccxt::pro::coinbaseinternational::CoinbaseinternationalCore);
        probe!(v, "coincheck", ccxt::pro::coincheck::CoincheckCore);
        probe!(v, "coinex", ccxt::pro::coinex::CoinexCore);
        probe!(v, "coinone", ccxt::pro::coinone::CoinoneCore);
        probe!(v, "cryptocom", ccxt::pro::cryptocom::CryptocomCore);
        probe!(v, "deepcoin", ccxt::pro::deepcoin::DeepcoinCore);
        probe!(v, "deribit", ccxt::pro::deribit::DeribitCore);
        probe!(v, "derive", ccxt::pro::derive::DeriveCore);
        probe!(v, "dydx", ccxt::pro::dydx::DydxCore);
        probe!(v, "extended", ccxt::pro::extended::ExtendedCore);
        probe!(v, "gate", ccxt::pro::gate::GateCore);
        probe!(v, "gemini", ccxt::pro::gemini::GeminiCore);
        probe!(v, "grvt", ccxt::pro::grvt::GrvtCore);
        probe!(v, "hashkey", ccxt::pro::hashkey::HashkeyCore);
        probe!(v, "hitbtc", ccxt::pro::hitbtc::HitbtcCore);
        probe!(v, "hollaex", ccxt::pro::hollaex::HollaexCore);
        probe!(v, "htx", ccxt::pro::htx::HtxCore);
        probe!(v, "hyperliquid", ccxt::pro::hyperliquid::HyperliquidCore);
        probe!(v, "independentreserve", ccxt::pro::independentreserve::IndependentreserveCore);
        probe!(v, "kraken", ccxt::pro::kraken::KrakenCore);
        probe!(v, "krakenfutures", ccxt::pro::krakenfutures::KrakenfuturesCore);
        probe!(v, "kucoin", ccxt::pro::kucoin::KucoinCore);
        probe!(v, "lbank", ccxt::pro::lbank::LbankCore);
        probe!(v, "lighter", ccxt::pro::lighter::LighterCore);
        probe!(v, "luno", ccxt::pro::luno::LunoCore);
        probe!(v, "mexc", ccxt::pro::mexc::MexcCore);
        probe!(v, "modetrade", ccxt::pro::modetrade::ModetradeCore);
        probe!(v, "nado", ccxt::pro::nado::NadoCore);
        probe!(v, "ndax", ccxt::pro::ndax::NdaxCore);
        probe!(v, "okx", ccxt::pro::okx::OkxCore);
        probe!(v, "onetrading", ccxt::pro::onetrading::OnetradingCore);
        probe!(v, "p2b", ccxt::pro::p2b::P2bCore);
        probe!(v, "pacifica", ccxt::pro::pacifica::PacificaCore);
        probe!(v, "paradex", ccxt::pro::paradex::ParadexCore);
        probe!(v, "phemex", ccxt::pro::phemex::PhemexCore);
        probe!(v, "poloniex", ccxt::pro::poloniex::PoloniexCore);
        probe!(v, "toobit", ccxt::pro::toobit::ToobitCore);
        probe!(v, "upbit", ccxt::pro::upbit::UpbitCore);
        probe!(v, "weex", ccxt::pro::weex::WeexCore);
        probe!(v, "whitebit", ccxt::pro::whitebit::WhitebitCore);
        probe!(v, "woo", ccxt::pro::woo::WooCore);
        probe!(v, "woofipro", ccxt::pro::woofipro::WoofiproCore);
        probe!(v, "xt", ccxt::pro::xt::XtCore);

    let total = v.len();
    eprintln!("probing {total} venues (concurrency 6)…");
    let mut results: Vec<(String, String)> =
        stream::iter(v).buffer_unordered(6).collect::<Vec<_>>().await;
    results.sort();
    println!("\n==== watch_order_book health ====");
    for (id, out) in &results {
        println!("{id:<22} {out}");
    }
    // summary by class
    let mut ok = 0; let mut empty = 0; let mut timeout = 0; let mut panic = 0; let mut other = 0;
    for (_, o) in &results {
        if o.starts_with("OK") { ok += 1; }
        else if o.starts_with("EMPTY") { empty += 1; }
        else if o.starts_with("TIMEOUT") { timeout += 1; }
        else if o.starts_with("PANIC") { panic += 1; }
        else { other += 1; }
    }
    println!("\n==== summary: {total} venues ====");
    println!("OK={ok}  EMPTY={empty}  TIMEOUT={timeout}  PANIC={panic}  OTHER={other}");
}
