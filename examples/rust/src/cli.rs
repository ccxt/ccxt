// CCXT Rust CLI — mirrors `cli.go` / `cli.cs`, built on the TYPED crate.
// `ccxt::from_id(id, config)` builds a boxed `TypedExchange`; the method name
// is dispatched dynamically through `TypedExchange::call_raw` (the typed crate's
// runtime escape hatch), so this file needs no per-method signatures.
//
//   npm run cli.rs -- binance fetchTicker BTC/USDT
//   npm run cli.rs -- bybit  fetchOHLCV  BTC/USDT 1h
//   npm run cli.rs -- okx    fetchMarkets --verbose
//   npm run cli.rs -- gate   fetchTrades BTC/USDT null 5
//
// Args: bare `null`/`true`/`false` and JSON `{...}`/`[...]` parse to
//   Value::{Null,Bool,Map,Array}; everything else is a string.
// Credentials: `keys.local.json` (fallback `keys.json`) at the repo root, then
//   `<EXCHANGE_ID>_<CRED>` env vars override. Passed via the `config` map.
// Flags: --verbose --testnet --demo --no-keys
//        --httpProxy=URL --httpsProxy=URL --socksProxy=URL --proxy=URL
use ccxt::value::HashMap;
use ccxt::Value;
use ccxt::{from_id, TypedExchange};
use std::env;
use std::panic;
use futures::FutureExt;

// ── color codes ───────────────────────────────────────────────────────────────
const RED: &str = "\x1b[31m";
const GREEN: &str = "\x1b[32m";
const YELLOW: &str = "\x1b[33m";
const RESET: &str = "\x1b[0m";

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
        Value::Null => "null".to_string(),
        Value::Bool(b) => b.to_string(),
        Value::Int(n) => n.to_string(),
        Value::Float(f) => {
            if f.is_nan() { "NaN".into() }
            else if f.is_infinite() { (if *f < 0.0 { "-Infinity" } else { "Infinity" }).into() }
            else { format!("{f}") }
        }
        Value::Str(s) => format!("'{}'", s.replace('\\', "\\\\").replace('\'', "\\'")),
        Value::Arr(a) => {
            if a.is_empty() { return "[]".into(); }
            let items: Vec<String> = a.iter().map(|x| format!("{pad_next}{}", pretty(x, indent + 1))).collect();
            format!("[\n{}\n{pad}]", items.join(",\n"))
        }
        Value::Dict(m) => {
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
    if s == "null" { return Value::Null; }
    if s == "true" { return Value::Bool(true); }
    if s == "false" { return Value::Bool(false); }
    if let Ok(n) = s.parse::<i64>() { return Value::Int(n); }
    if let Ok(f) = s.parse::<f64>() { return Value::Float(f); }
    if s.starts_with('{') || s.starts_with('[') {
        return ccxt::runtime::json_parse(&Value::Str(s.to_string()));
    }
    Value::Str(s.to_string())
}

// Camel → snake matching the transpiler's `toSnakeCase` (fetchOHLCV → fetch_ohlcv).
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
const CRED_KEYS: &[&str] = &[
    "apiKey", "secret", "password", "uid",
    "walletAddress", "privateKey", "token", "twofa", "login", "accountId",
];

fn load_credentials(id: &str) -> HashMap<String, String> {
    let mut creds: HashMap<String, String> = HashMap::new();
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
                                if let Value::Str(s) = v { creds.insert(k.clone(), s.clone()); }
                            }
                        }
                    }
                }
                break 'outer;
            }
            if !dir.pop() { break; }
        }
    }
    for &cred in CRED_KEYS {
        let env_name = format!("{}_{}", id.to_uppercase(), cred.to_uppercase());
        if let Ok(v) = env::var(&env_name) {
            if !v.is_empty() { creds.insert(cred.to_string(), v); }
        }
    }
    creds
}

fn flag_value(flags: &[String], name: &str) -> Option<String> {
    let key_eq = format!("--{name}=");
    flags.iter().find_map(|f| f.strip_prefix(&key_eq).map(|s| s.to_string()))
}

fn usage() -> ! {
    eprintln!("{RED}usage: cli <exchange> <method> [args...] [flags]{RESET}");
    eprintln!("examples:");
    eprintln!("  npm run cli.rs -- binance fetchTicker BTC/USDT");
    eprintln!("  npm run cli.rs -- bybit fetchOHLCV BTC/USDT 1h null 10");
    eprintln!("  npm run cli.rs -- okx fetchMarkets --verbose");
    eprintln!("  npm run cli.rs -- binance fetchBalance --testnet");
    eprintln!("flags: --verbose --testnet --demo --no-keys");
    eprintln!("       --httpProxy=URL --httpsProxy=URL --socksProxy=URL --proxy=URL");
    eprintln!("credentials: keys.local.json / keys.json or <ID>_<CRED> env vars");
    std::process::exit(2);
}

#[tokio::main]
async fn main() {
    let argv: Vec<String> = env::args().collect();
    if argv.len() < 3 { usage(); }

    let id = argv[1].clone();
    let method = argv[2].clone();
    let m_snake = snake(&method);

    let flags: Vec<String> = argv.iter().skip(3).filter(|a| a.starts_with("--")).cloned().collect();
    let positional: Vec<String> = argv.iter().skip(3).filter(|a| !a.starts_with("--")).cloned().collect();
    let verbose = flags.iter().any(|f| f == "--verbose");
    let testnet = flags.iter().any(|f| f == "--testnet");
    let demo = flags.iter().any(|f| f == "--demo");
    let no_keys = flags.iter().any(|f| f == "--no-keys");

    // Build the settings map `<Exchange>::new` takes: credentials + proxies +
    // verbose all go in here so the typed wrapper (whose Core is private) is
    // configured entirely at construction.
    let mut config: HashMap<String, Value> = HashMap::new();
    if !no_keys {
        for (k, v) in load_credentials(&id) { config.insert(k, Value::Str(v)); }
    }
    for (flag, key) in [("httpProxy", "httpProxy"), ("httpsProxy", "httpsProxy"), ("socksProxy", "socksProxy"), ("proxy", "proxy")] {
        if let Some(s) = flag_value(&flags, flag) { config.insert(key.to_string(), Value::Str(s)); }
    }
    if verbose { config.insert("verbose".to_string(), Value::Bool(true)); }

    let args: Vec<Value> = positional.iter().map(|s| parse_arg(s)).collect();

    println!("{GREEN}exchange:{RESET} {id}");
    println!("{GREEN}method:{RESET}   {method} ({m_snake})");
    if !args.is_empty() { println!("{GREEN}args:{RESET}     {args:?}"); }
    if verbose { println!("{YELLOW}verbose mode{RESET}"); }
    if testnet { println!("{YELLOW}testnet mode{RESET}"); }
    if demo { println!("{YELLOW}demo trading mode{RESET}"); }
    let cred_names: Vec<&str> = config.keys().map(|k| k.as_str())
        .filter(|k| CRED_KEYS.contains(k)).collect();
    if !cred_names.is_empty() { println!("{GREEN}credentials:{RESET} {}", cred_names.join(", ")); }
    println!();

    let m = m_snake.clone();
    let result = panic::AssertUnwindSafe(async move {
        let mut ex: Box<dyn TypedExchange> = match from_id(&id, Some(Value::Map(config))) {
            Some(e) => e,
            None => panic!("{RED}exchange not transpiled yet: {id}{RESET}"),
        };
        // --testnet / --demo route through the runtime dispatch, same as any method.
        if testnet { let _ = ex.call_raw("set_sandbox_mode", vec![Value::Bool(true)]).await; }
        if demo { let _ = ex.call_raw("enable_demo_trading", vec![Value::Bool(true)]).await; }
        // Most unified methods need markets loaded first.
        let skip_load = ["load_markets", "fetch_markets", "fetch_currencies", "fetch_time", "fetch_status", "describe"].contains(&m.as_str());
        if !skip_load { let _ = ex.load_markets(false).await; }
        ex.call_raw(&m, args).await
    }).catch_unwind().await;

    match result {
        Ok(Ok(v)) => println!("\n{GREEN}result:{RESET} {}", pretty(&v, 0)),
        Ok(Err(e)) => { eprintln!("\n{RED}error:{RESET} {e}"); std::process::exit(1); }
        Err(payload) => {
            let msg = payload.downcast_ref::<String>().map(|s| s.as_str())
                .or_else(|| payload.downcast_ref::<&str>().copied())
                .unwrap_or("(unknown error)");
            eprintln!("\n{RED}error:{RESET} {msg}");
            std::process::exit(1);
        }
    }
}
