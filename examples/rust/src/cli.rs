// CCXT Rust CLI — mirrors `cli.go` / `cli.cs`. Each transpiled Core
// has an auto-generated `call_dynamic(method_name, args)` method, so
// this file doesn't need to know any unified-method signatures.
//
//   npm run cli.rs -- binance fetchTicker BTC/USDT
//   npm run cli.rs -- bybit  fetchOHLCV  BTC/USDT 1h
//   npm run cli.rs -- okx    fetchMarkets --verbose
//   npm run cli.rs -- gate   fetchTrades BTC/USDT null 5
//
// Args:
//   bare words `null`/`true`/`false` and JSON `{...}`/`[...]` are
//   parsed as Value::{Null,Bool,Map,Array}; everything else is a string.
// Flags:
//   --verbose  print the HTTP request/response trace
//   --sandbox  swap urls.api with urls.test (where supported)
//   --testnet  alias of --sandbox
//   --demo     enable demo trading (enableDemoTrading)
//
// Adding a new exchange is one `dispatch_exchange!` arm below — the
// generated `init()` + `call_dynamic` on each Core handle the rest.

use ccxt::Value;
use ccxt::exchanges::{
    binance::BinanceCore, bybit::BybitCore, okx::OkxCore, kucoin::KucoinCore,
    bitget::BitgetCore, hyperliquid::HyperliquidCore, gate::GateCore,
};
use std::env;
use std::panic;
use futures::FutureExt;

// ── color codes ───────────────────────────────────────────────────────────────
const RED:    &str = "\x1b[31m";
const GREEN:  &str = "\x1b[32m";
const YELLOW: &str = "\x1b[33m";
const RESET:  &str = "\x1b[0m";

// ── arg parsing ──────────────────────────────────────────────────────────────

fn parse_arg(s: &str) -> Value {
    if s == "null"  { return Value::Null; }
    if s == "true"  { return Value::Bool(true); }
    if s == "false" { return Value::Bool(false); }
    if let Ok(n) = s.parse::<i64>() { return Value::Int(n); }
    if let Ok(f) = s.parse::<f64>() { return Value::Float(f); }
    if s.starts_with('{') || s.starts_with('[') {
        return ccxt::runtime::json_parse(&Value::Str(s.to_string()));
    }
    Value::Str(s.to_string())
}

// Camel → snake matching the transpiler's `toSnakeCase`. Acronyms
// stay glued (`fetchOHLCV` → `fetch_ohlcv`, not `fetch_o_h_l_c_v`).
fn snake(name: &str) -> String {
    let bytes: Vec<char> = name.chars().collect();
    let mut out = String::with_capacity(name.len() + 4);
    for i in 0..bytes.len() {
        let c = bytes[i];
        let prev = if i > 0 { Some(bytes[i - 1]) } else { None };
        let next = if i + 1 < bytes.len() { Some(bytes[i + 1]) } else { None };
        if c.is_ascii_uppercase() {
            let prev_lower_or_digit = prev.map(|p| p.is_ascii_lowercase() || p.is_ascii_digit()).unwrap_or(false);
            let prev_upper = prev.map(|p| p.is_ascii_uppercase()).unwrap_or(false);
            let next_lower = next.map(|n| n.is_ascii_lowercase()).unwrap_or(false);
            if prev_lower_or_digit { out.push('_'); }
            else if prev_upper && next_lower { out.push('_'); }
        }
        out.push(c.to_ascii_lowercase());
    }
    out
}

// ── dynamic dispatch over exchanges ──────────────────────────────────────────

/// Each transpiled Core auto-implements `init()` (bind + populate +
/// build_implicit_api) and `call_dynamic(method, args) -> Value` in its
/// generated impl block. We just box the right Core and invoke.
macro_rules! dispatch_exchange {
    ($id:expr, $method:expr, $args:expr, $verbose:expr, $sandbox:expr, $demo:expr,
     $( $name:literal => $core:ty ),* $(,)?
    ) => {{
        match $id {
            $(
                $name => {
                    let mut ex = Box::new(<$core>::new(None));
                    ex.bind(); // re-bind after Box move
                    ex.exchange.verbose = Value::Bool($verbose);
                    if $sandbox { ex.exchange.set_sandbox_mode(Value::Bool(true)); }
                    if $demo { ex.exchange.enable_demo_trading(Value::Bool(true)); }
                    // Most unified methods need markets loaded first.
                    let m = $method;
                    if !["fetch_markets", "fetch_currencies", "fetch_time", "fetch_status", "describe"].contains(&m.as_str()) {
                        let _ = ex.load_markets_safe().await;
                    }
                    ex.call_dynamic(&m, $args).await
                }
            )*
            other => panic!("{RED}exchange not transpiled yet: {other}{RESET}\nAdd it to dispatch_exchange! in cli.rs and run `tsx build/rustTranspiler.ts {other}`."),
        }
    }};
}

/// Helper trait: lets every Core load+populate markets uniformly. The
/// transpiled `load_markets` stub returns cached value but doesn't
/// actually populate, so we call fetch_markets and write the symbol map.
// `?Send`: an `Exchange` holds a raw `*mut ()` core pointer for virtual
// dispatch, so its futures are not `Send`. The CLI never spawns onto
// other threads (it just `block_on`s `main`), so a non-Send boxed future
// is fine — the default `#[async_trait]` would wrongly demand `Send`.
#[async_trait::async_trait(?Send)]
trait LoadMarketsSafe {
    async fn load_markets_safe(&mut self) -> Value;
}

macro_rules! impl_load_markets {
    ($($core:ty),* $(,)?) => {
        $(
            #[async_trait::async_trait(?Send)]
            impl LoadMarketsSafe for $core {
                async fn load_markets_safe(&mut self) -> Value {
                    let markets = self.fetch_markets(&[]).await;
                    populate_markets(&mut self.exchange, &markets);
                    markets
                }
            }
        )*
    };
}

impl_load_markets!(BinanceCore, BybitCore, OkxCore, KucoinCore, BitgetCore, HyperliquidCore, GateCore);

fn populate_markets(ex: &mut ccxt::exchange::Exchange, markets_array: &Value) {
    use std::collections::HashMap;
    let arr = match markets_array { Value::Array(a) => a, _ => return };
    let mut by_symbol: HashMap<String, Value> = HashMap::new();
    let mut by_id:     HashMap<String, Value> = HashMap::new();
    let mut symbols:   Vec<Value> = vec![];
    for m in arr {
        if let Some(sym) = ccxt::value::safe_string(m, "symbol", None) {
            by_symbol.insert(sym.clone(), m.clone());
            symbols.push(Value::Str(sym));
        }
        if let Some(id) = ccxt::value::safe_string(m, "id", None) {
            by_id.insert(id, m.clone());
        }
    }
    ex.markets       = Value::Map(by_symbol);
    ex.markets_by_id = Value::Map(by_id);
    ex.symbols       = Value::Array(symbols);
}

fn usage() -> ! {
    eprintln!("{RED}usage: cli <exchange> <method> [args...] [flags]{RESET}");
    eprintln!("examples:");
    eprintln!("  npm run cli.rs -- binance fetchTicker BTC/USDT");
    eprintln!("  npm run cli.rs -- bybit fetchOHLCV BTC/USDT 1h null 10");
    eprintln!("  npm run cli.rs -- okx fetchMarkets --verbose");
    eprintln!("  npm run cli.rs -- binance fetchBalance --testnet");
    eprintln!("  npm run cli.rs -- okx fetchBalance --demo");
    eprintln!("flags: --verbose --sandbox --testnet --demo");
    std::process::exit(2);
}

#[tokio::main]
async fn main() {
    let argv: Vec<String> = env::args().collect();
    if argv.len() < 3 { usage(); }

    let id     = argv[1].clone();
    let method = argv[2].clone();
    let m_snake = snake(&method);

    let flags:      Vec<String> = argv.iter().skip(3).filter(|a| a.starts_with("--")).cloned().collect();
    let positional: Vec<String> = argv.iter().skip(3).filter(|a| !a.starts_with("--")).cloned().collect();
    let verbose = flags.iter().any(|f| f == "--verbose");
    // `--testnet` is an alias of `--sandbox` (matches cli/ts/helpers.ts).
    let sandbox = flags.iter().any(|f| f == "--sandbox" || f == "--testnet");
    let demo    = flags.iter().any(|f| f == "--demo");

    let args: Vec<Value> = positional.iter().map(|s| parse_arg(s)).collect();

    println!("{GREEN}exchange:{RESET} {id}");
    println!("{GREEN}method:{RESET}   {method} ({m_snake})");
    if !args.is_empty() {
        println!("{GREEN}args:{RESET}     {args:?}");
    }
    if verbose { println!("{YELLOW}verbose mode{RESET}"); }
    if sandbox { println!("{YELLOW}sandbox mode{RESET}"); }
    if demo    { println!("{YELLOW}demo trading mode{RESET}"); }
    println!();

    let m = m_snake.clone();
    let result = panic::AssertUnwindSafe(async move {
        dispatch_exchange!(id.as_str(), m, args, verbose, sandbox, demo,
            "binance"     => BinanceCore,
            "bybit"       => BybitCore,
            "okx"         => OkxCore,
            "kucoin"      => KucoinCore,
            "bitget"      => BitgetCore,
            "hyperliquid" => HyperliquidCore,
            "gate"        => GateCore,
        )
    }).catch_unwind().await;

    match result {
        Ok(v)  => println!("\n{GREEN}result:{RESET} {v:?}"),
        Err(_) => println!("\n{RED}(panicked){RESET}"),
    }
}
