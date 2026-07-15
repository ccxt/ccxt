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
// Credentials:
//   Loaded from `keys.local.json` (fallback `keys.json`) at the repo
//   root, then `<EXCHANGE_ID>_<CRED>` env vars override — same as cli.go.
//     e.g. BINANCE_APIKEY, BINANCE_SECRET, OKX_PASSWORD
// Flags:
//   --verbose  print the HTTP request/response trace
//   --testnet  enable sandbox/testnet mode (setSandboxMode(true))
//   --demo     enable demo trading (enableDemoTrading(true))
//   --no-keys  skip credential loading
//
// Adding a new exchange is one `dispatch_exchange!` arm below — the
// generated `init()` + `call_dynamic` on each Core handle the rest.

use ccxt::Value;
use ccxt::exchanges::{
    binance::BinanceCore, bybit::BybitCore, okx::OkxCore, kucoin::KucoinCore,
    bitget::BitgetCore, hyperliquid::HyperliquidCore, gate::GateCore,
};
use ccxt::value::HashMap;
use std::env;
use std::panic;
use futures::FutureExt;

// ── color codes ───────────────────────────────────────────────────────────────
const RED:    &str = "\x1b[31m";
const GREEN:  &str = "\x1b[32m";
const YELLOW: &str = "\x1b[33m";
const RESET:  &str = "\x1b[0m";

// ── pretty printer (JS-console style) ────────────────────────────────────────

fn is_ident(s: &str) -> bool {
    let mut chars = s.chars();
    match chars.next() {
        Some(c) if c.is_ascii_alphabetic() || c == '_' || c == '$' => {}
        _ => return false,
    }
    chars.all(|c| c.is_ascii_alphanumeric() || c == '_' || c == '$')
}

fn pretty(v: &Value, indent: usize) -> String {
    let pad = "  ".repeat(indent);
    let pad_next = "  ".repeat(indent + 1);
    match v {
        Value::Null      => "null".to_string(),
        Value::Bool(b)   => b.to_string(),
        Value::Int(n)    => n.to_string(),
        Value::Float(f)  => {
            if f.is_nan() { "NaN".into() }
            else if f.is_infinite() { (if *f < 0.0 { "-Infinity" } else { "Infinity" }).into() }
            else { format!("{f}") }
        }
        Value::Str(s)    => format!("'{}'", s.replace('\\', "\\\\").replace('\'', "\\'")),
        Value::Arr(a)    => {
            if a.is_empty() { return "[]".into(); }
            let items: Vec<String> = a.iter().map(|x| format!("{pad_next}{}", pretty(x, indent + 1))).collect();
            format!("[\n{}\n{pad}]", items.join(",\n"))
        }
        Value::Dict(m)   => {
            if m.is_empty() { return "{}".into(); }
            let items: Vec<String> = m.iter().map(|(k, val)| {
                let key = if is_ident(k) { k.clone() } else { format!("'{}'", k.replace('\'', "\\'")) };
                format!("{pad_next}{key}: {}", pretty(val, indent + 1))
            }).collect();
            format!("{{\n{}\n{pad}}}", items.join(",\n"))
        }
    }
}

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

// ── credentials (keys.local.json / keys.json + env vars) ─────────────────────

/// Standard CCXT credential field names.
const CRED_KEYS: &[&str] = &[
    "apiKey", "secret", "password", "uid",
    "walletAddress", "privateKey", "token", "twofa", "login", "accountId",
];

/// Loads credentials for `id` from `keys.local.json` (falling back to
/// `keys.json`) at the repo root, then lets `<ID>_<CRED>` env vars
/// override — mirroring cli.go's keys-file + env behavior.
fn load_credentials(id: &str) -> Vec<(String, String)> {
    let mut creds: HashMap<String, String> = HashMap::new();
    // 1. keys file — search the cwd and a few parents (npm runs from the
    //    repo root, but `cargo run` may be invoked from elsewhere).
    'outer: for fname in ["keys.local.json", "keys.json"] {
        let mut dir = env::current_dir().unwrap_or_default();
        for _ in 0..5 {
            let path = dir.join(fname);
            if path.is_file() {
                if let Ok(text) = std::fs::read_to_string(&path) {
                    let parsed = ccxt::runtime::json_parse(&Value::Str(text));
                    if let Value::Dict(top) = &parsed {
                        if let Some(Value::Dict(ex_obj)) = top.get(id) {
                            for (k, v) in ex_obj.iter() {
                                if let Value::Str(s) = v {
                                    creds.insert(k.clone(), s.clone());
                                }
                            }
                        }
                    }
                }
                break 'outer;
            }
            if !dir.pop() { break; }
        }
    }
    // 2. env vars override — `<ID>_<CRED>` upper-cased.
    for &cred in CRED_KEYS {
        let env_name = format!("{}_{}", id.to_uppercase(), cred.to_uppercase());
        if let Ok(v) = env::var(&env_name) {
            if !v.is_empty() { creds.insert(cred.to_string(), v); }
        }
    }
    creds.into_iter().collect()
}

/// Writes a credential onto the exchange's typed field.
fn set_credential(ex: &mut ccxt::exchange::Exchange, key: &str, val: &str) {
    let v = Value::Str(val.to_string());
    match key {
        "apiKey"        => ex.apiKey        = v,
        "secret"        => ex.secret        = v,
        "password"      => ex.password      = v,
        "uid"           => ex.uid           = v,
        "walletAddress" => ex.walletAddress = v,
        "privateKey"    => ex.privateKey    = v,
        "token"         => ex.token         = v,
        "twofa"         => ex.twofa         = v,
        "login"         => ex.login         = v,
        "accountId"     => ex.accountId     = v,
        _ => {}
    }
}

// ── dynamic dispatch over exchanges ──────────────────────────────────────────

/// Each transpiled Core auto-implements `init()` (bind + populate +
/// build_implicit_api) and `call_dynamic(method, args) -> Value` in its
/// generated impl block. We just box the right Core and invoke.
macro_rules! dispatch_exchange {
    ($id:expr, $method:expr, $args:expr, $verbose:expr, $testnet:expr, $demo:expr, $time:expr,
     $http_proxy:expr, $https_proxy:expr, $socks_proxy:expr, $legacy_proxy:expr, $creds:expr,
     $( $name:literal => $core:ty ),* $(,)?
    ) => {{
        match $id {
            $(
                $name => {
                    let mut ex = Box::new(<$core>::new(None));
                    ex.bind(); // re-bind after Box move
                    ex.exchange.verbose = Value::Bool($verbose);
                    for (k, v) in $creds.iter() {
                        set_credential(&mut ex.exchange, k, v);
                    }
                    // Proxy fields must be set BEFORE the first request so
                    // `http_client()` picks them up when it lazily builds
                    // the reqwest::Client. After that the client is cached
                    // and won't re-read proxy state.
                    if let Some(s) = $http_proxy.as_ref()  { ex.exchange.httpProxy  = Value::Str(s.clone()); }
                    if let Some(s) = $https_proxy.as_ref() { ex.exchange.httpsProxy = Value::Str(s.clone()); }
                    if let Some(s) = $socks_proxy.as_ref() { ex.exchange.socksProxy = Value::Str(s.clone()); }
                    if let Some(s) = $legacy_proxy.as_ref(){ ex.exchange.proxy      = Value::Str(s.clone()); }
                    // --testnet → setSandboxMode(true), --demo → enableDemoTrading(true)
                    if $testnet { ex.exchange.set_sandbox_mode(Value::Bool(true)); }
                    if $demo    { ex.exchange.enable_demo_trading(Value::Bool(true)); }
                    // Most unified methods need markets loaded first.
                    let m = $method;
                    let skip_load = ["fetch_markets", "fetch_currencies", "fetch_time", "fetch_status", "describe"].contains(&m.as_str());
                    let (load_total, load_http, load_json, load_calls);
                    if skip_load {
                        load_total = std::time::Duration::ZERO;
                        load_http = 0u64; load_json = 0u64; load_calls = 0u64;
                    } else {
                        let _ = ccxt::exchange::take_http_timings();
                        let t0 = std::time::Instant::now();
                        let _ = ex.load_markets_safe().await;
                        load_total = t0.elapsed();
                        let (h, j, c) = ccxt::exchange::take_http_timings();
                        load_http = h; load_json = j; load_calls = c;
                    }
                    let _ = ccxt::exchange::take_http_timings();
                    let t0 = std::time::Instant::now();
                    let result = ex.call_dynamic(&m, $args).await;
                    let method_total = t0.elapsed();
                    let (m_http, m_json, m_calls) = ccxt::exchange::take_http_timings();
                    if $time {
                        let ms = |n: u128| (n as f64) / 1_000_000.0;
                        eprintln!();
                        eprintln!("{YELLOW}timings (ms):{RESET}");
                        eprintln!("  loadMarkets:    total={:>8.2}  http={:>8.2}  json={:>8.2}  calls={}",
                            ms(load_total.as_nanos()), ms(load_http as u128), ms(load_json as u128), load_calls);
                        let m_parse = method_total.as_nanos().saturating_sub((m_http as u128).saturating_add(m_json as u128));
                        eprintln!("  {:<14}  total={:>8.2}  http={:>8.2}  json={:>8.2}  parse={:>8.2}  calls={}",
                            format!("{m}:"),
                            ms(method_total.as_nanos()), ms(m_http as u128), ms(m_json as u128),
                            ms(m_parse), m_calls);
                    }
                    result
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
    let arr = match markets_array { Value::Arr(a) => a, _ => return };
    let mut by_symbol: HashMap<String, Value> = HashMap::new();
    let mut by_id:     HashMap<String, Value> = HashMap::new();
    let mut symbols:   Vec<Value> = vec![];
    for m in arr.iter() {
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
    eprintln!("  npm run cli.rs -- binance loadMarkets --httpsProxy=http://localhost:8888");
    eprintln!("  npm run cli.rs -- binance loadMarkets --socksProxy=socks5://localhost:1080");
    eprintln!("flags: --verbose --testnet --demo --no-keys --time");
    eprintln!("       --httpProxy=URL --httpsProxy=URL --socksProxy=URL --proxy=URL");
    eprintln!("credentials: keys.local.json / keys.json or <ID>_<CRED> env vars");
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
    let testnet = flags.iter().any(|f| f == "--testnet");
    let demo    = flags.iter().any(|f| f == "--demo");
    let no_keys = flags.iter().any(|f| f == "--no-keys");
    let time    = flags.iter().any(|f| f == "--time");

    // Proxy flags. Accepted forms:
    //   --httpProxy=http://host:port
    //   --httpsProxy=http://host:port
    //   --socksProxy=socks5://host:port
    //   --proxy=<url>            (legacy single-setter, applied to all)
    fn flag_value(flags: &[String], name: &str) -> Option<String> {
        let key_eq = format!("--{name}=");
        flags.iter().find_map(|f| f.strip_prefix(&key_eq).map(|s| s.to_string()))
    }
    let http_proxy  = flag_value(&flags, "httpProxy");
    let https_proxy = flag_value(&flags, "httpsProxy");
    let socks_proxy = flag_value(&flags, "socksProxy");
    let legacy_proxy = flag_value(&flags, "proxy");

    // Credentials from keys.local.json / keys.json + env vars.
    let creds: Vec<(String, String)> = if no_keys { Vec::new() } else { load_credentials(&id) };

    let args: Vec<Value> = positional.iter().map(|s| parse_arg(s)).collect();

    println!("{GREEN}exchange:{RESET} {id}");
    println!("{GREEN}method:{RESET}   {method} ({m_snake})");
    if !args.is_empty() {
        println!("{GREEN}args:{RESET}     {args:?}");
    }
    if verbose { println!("{YELLOW}verbose mode{RESET}"); }
    if testnet { println!("{YELLOW}testnet mode{RESET}"); }
    if demo    { println!("{YELLOW}demo trading mode{RESET}"); }
    if let Some(s) = &http_proxy   { println!("{YELLOW}httpProxy:{RESET}  {s}"); }
    if let Some(s) = &https_proxy  { println!("{YELLOW}httpsProxy:{RESET} {s}"); }
    if let Some(s) = &socks_proxy  { println!("{YELLOW}socksProxy:{RESET} {s}"); }
    if let Some(s) = &legacy_proxy { println!("{YELLOW}proxy:{RESET}      {s}"); }
    if !creds.is_empty() {
        let mut names: Vec<&str> = creds.iter().map(|(k, _)| k.as_str()).collect();
        names.sort();
        println!("{GREEN}credentials:{RESET} {}", names.join(", "));
    }
    println!();

    let m = m_snake.clone();
    let result = panic::AssertUnwindSafe(async move {
        dispatch_exchange!(id.as_str(), m, args, verbose, testnet, demo, time,
            http_proxy, https_proxy, socks_proxy, legacy_proxy, creds,
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
        Ok(v)  => println!("\n{GREEN}result:{RESET} {}", pretty(&v, 0)),
        Err(payload) => {
            // A thrown CCXT error surfaces as a panic — extract its message.
            let msg = payload.downcast_ref::<String>().map(|s| s.as_str())
                .or_else(|| payload.downcast_ref::<&str>().copied())
                .unwrap_or("(unknown error)");
            eprintln!("\n{RED}error:{RESET} {msg}");
            std::process::exit(1);
        }
    }
}
