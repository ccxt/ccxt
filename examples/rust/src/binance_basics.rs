// CCXT Rust — Binance example.
//
// Constructs the transpiled `BinanceCore` struct and exercises the unified
// API surface: `load_markets`, `fetch_tickers`, `fetch_trades`.
//
// Note: these are the *transpiled* methods (from `ts/src/binance.ts`), so
// editing their behaviour means editing the TypeScript source and re-running
// the Rust transpiler (`npm run transpileRust`). Don't hand-modify
// `rust/ccxt/src/exchanges/binance.rs`.

use ccxt::Value;
use ccxt::exchanges::binance::BinanceCore;
use std::panic;
use futures::FutureExt;

#[tokio::main]
async fn main() {
    println!("=== Binance — CCXT Rust example ===\n");
    println!("Calls the transpiled-from-TS `BinanceCore` methods. Two");
    println!("dispatch layers run under the hood:");
    println!("  1. implicit API: `Exchange::call_method` walks describe()'s");
    println!("     `api` block and routes to `fetch_typed` (real HTTPS).");
    println!("  2. Go-style trait dispatch: `binance.bind()` installs a");
    println!("     `&dyn DerivedExchange` on Exchange; Exchange.ts's");
    println!("     `self.parse_X(...)` calls are rewritten to forward via");
    println!("     `self.derived().parse_X(...)`, hitting Binance's override.\n");

    // Box-allocate so the binance struct has a stable address, then call
    // bind() once so the base Exchange knows how to route virtual calls
    // (parse_ticker, parse_trade, …) back to the derived overrides.
    let mut binance = Box::new(BinanceCore::new(None));
    binance.bind();
    // Populate the Exchange describe-data and build the implicit-API map.
    let described = binance.describe();
    binance.exchange.api  = ccxt::get_value(&described, &Value::Str("api".to_string()));
    binance.exchange.urls = ccxt::get_value(&described, &Value::Str("urls".to_string()));
    binance.exchange.has  = ccxt::get_value(&described, &Value::Str("has".to_string()));
    binance.exchange.options = ccxt::get_value(&described, &Value::Str("options".to_string()));
    binance.exchange.hostname = ccxt::get_value(&described, &Value::Str("hostname".to_string()));
    binance.exchange.verbose = Value::Bool(std::env::var("VERBOSE").is_ok());
    binance.exchange.build_implicit_api();

    println!("→ binance.fetch_markets() — calls the transpiled");
    println!("  `BinanceCore::fetch_markets`, which routes through");
    println!("  Exchange::call_method → implicit-API dispatch → HTTPS request");
    println!("  to https://api.binance.com/api/v3/exchangeInfo.\n");
    let markets = panic::AssertUnwindSafe(binance.fetch_markets(&[]))
        .catch_unwind().await
        .unwrap_or(Value::Null);
    let markets_count = match &markets {
        Value::Arr(a) => a.len(),
        _ => 0,
    };
    println!("   ✓ live response: Array of {markets_count} markets");
    print_a_few_markets(&markets);
    println!();

    // Cache markets on the Exchange so symbol lookups work in subsequent
    // calls. The transpiled `load_markets` normally does this; we set it up
    // here directly so the next two calls see populated state.
    populate_markets(&mut binance, &markets);

    println!("→ binance.fetch_tickers() — /api/v3/ticker/24hr.");
    println!("  With the virtual dispatcher bound, Exchange's `parse_ticker`");
    println!("  routes to BinanceCore's override, so the response is fully parsed.");
    let tickers_result = panic::AssertUnwindSafe(binance.fetch_tickers(&[]))
        .catch_unwind().await;
    match tickers_result {
        Ok(Value::Dict(m))    => {
            println!("   ✓ parsed: {} tickers", m.len());
            print_a_few_tickers(&Value::Dict(m));
        }
        Ok(Value::Arr(a))  => println!("   ✓ parsed: {} entries", a.len()),
        Ok(other)            => println!("   returned: {other:?}"),
        Err(_)               => println!("   ✗ parse_ticker panicked"),
    }
    println!();

    println!("→ binance.fetch_trades(\"BTC/USDT\", 5) — /api/v3/aggTrades.");
    let trades_result = panic::AssertUnwindSafe(binance.fetch_trades(
        Value::Str("BTC/USDT".to_string()),
        &[Value::Null, Value::Int(5)],
    )).catch_unwind().await;
    match trades_result {
        Ok(Value::Arr(a)) => {
            println!("   ✓ parsed: {} trades", a.len());
            print_a_few_trades(&Value::Arr(a));
        }
        Ok(other)           => println!("   returned: {other:?}"),
        Err(_)              => println!("   ✗ parse_trade panicked"),
    }
}

fn print_a_few_markets(markets: &Value) {
    let arr = match markets { Value::Arr(a) => a, _ => return };
    for m in arr.iter().take(5) {
        let id     = ccxt::value::safe_string(m, "id",     Some("?")).unwrap_or_default();
        let symbol = ccxt::value::safe_string(m, "symbol", Some("?")).unwrap_or_default();
        let kind   = ccxt::value::safe_string(m, "type",   Some("?")).unwrap_or_default();
        println!("     {id:<12} {symbol:<16} [{kind}]");
    }
    if arr.len() > 5 { println!("     … and {} more", arr.len() - 5); }
}

fn populate_markets(b: &mut BinanceCore, markets_array: &Value) {
    use ccxt::value::HashMap;
    let arr = match markets_array { Value::Arr(a) => a, _ => return };
    let mut by_symbol: HashMap<String, Value> = HashMap::new();
    let mut by_id: HashMap<String, Value> = HashMap::new();
    let mut symbols: Vec<Value> = vec![];
    for m in arr.iter() {
        if let Some(sym) = ccxt::value::safe_string(m, "symbol", None) {
            by_symbol.insert(sym.clone(), m.clone());
            symbols.push(Value::Str(sym));
        }
        if let Some(id) = ccxt::value::safe_string(m, "id", None) {
            by_id.insert(id, m.clone());
        }
    }
    b.exchange.markets       = Value::Map(by_symbol);
    b.exchange.markets_by_id = Value::Map(by_id);
    b.exchange.symbols       = Value::Array(symbols);
}

fn print_a_few_tickers(tickers: &Value) {
    let map = match tickers { Value::Dict(m) => m, _ => return };
    for sym in ["BTC/USDT", "ETH/USDT", "SOL/USDT"] {
        if let Some(t) = map.get(sym) {
            let last = ccxt::value::safe_string(t, "last", Some("?")).unwrap_or_default();
            let vol  = ccxt::value::safe_string(t, "baseVolume", Some("?")).unwrap_or_default();
            println!("   {sym:<10} last={last:<12} baseVol={vol}");
        }
    }
}

fn print_a_few_trades(trades: &Value) {
    let arr = match trades { Value::Arr(a) => a, _ => return };
    for t in arr.iter().take(5) {
        let side  = ccxt::value::safe_string(t, "side",   Some("?")).unwrap_or_default();
        let price = ccxt::value::safe_string(t, "price",  Some("?")).unwrap_or_default();
        let amt   = ccxt::value::safe_string(t, "amount", Some("?")).unwrap_or_default();
        println!("   {side:<4} price={price:<12} amount={amt}");
    }
}


fn print_value(label: &str, v: &Value) {
    match v {
        Value::Null => println!("   {label}: <null>"),
        Value::Dict(m) => println!("   {label}: Map with {} entries", m.len()),
        Value::Arr(a) => println!("   {label}: Array of {} items", a.len()),
        Value::Str(s) => {
            let preview: String = s.chars().take(80).collect();
            println!("   {label}: \"{preview}…\"");
        }
        Value::Int(n)   => println!("   {label}: {n}"),
        Value::Float(f) => println!("   {label}: {f}"),
        Value::Bool(b)  => println!("   {label}: {b}"),
    }
}
