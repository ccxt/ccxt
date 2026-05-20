// Exchange registry — maps an exchange id to an async dispatcher that
// runs `<method>(args)` in offline mode and returns whatever was about
// to be sent over the network (URL, headers, body).
//
// Adding a new exchange is one arm of the `match` in `dispatch`.

use ccxt::Value;
use ccxt::exchanges::{
    binance::BinanceCore, bybit::BybitCore, okx::OkxCore, kucoin::KucoinCore,
    bitget::BitgetCore, hyperliquid::HyperliquidCore, gate::GateCore,
};
use std::collections::HashMap;
use std::panic;
use futures::FutureExt;

#[derive(Debug, Default, Clone)]
pub struct Captured {
    pub url:     String,
    pub method:  String,
    pub body:    Option<String>,
    pub headers: HashMap<String, String>,
}

/// True iff a Core for this id exists.
pub fn has(id: &str) -> bool {
    matches!(id, "binance" | "bybit" | "okx" | "kucoin"
        | "bitget" | "hyperliquid" | "gate")
}

/// Run `method(args)` in offline mode and capture last_request_*.
/// Mirrors Go's `InitOfflineExchange` + `TestRequestStatically`:
///   markets/currencies come in via the constructor config so
///   `load_markets()` sees them already cached and never hits the wire.
pub async fn dispatch(id: &str, method: &str, args: Vec<Value>, fixture_options: &Value) -> Captured {
    let cfg = build_offline_config(id, fixture_options);
    macro_rules! go {
        ($core:ty) => {{
            let mut ex = Box::new(<$core>::new(Some(cfg.clone())));
            ex.bind();
            ex.exchange.offline_mode = Value::Bool(true);
            // call_dynamic expects snake_case names; fixtures use camelCase.
            let m = camel_to_snake(method);
            let _ = panic::AssertUnwindSafe(ex.call_dynamic(&m, args)).catch_unwind().await;
            capture(&ex.exchange)
        }};
    }
    match id {
        "binance"     => go!(BinanceCore),
        "bybit"       => go!(BybitCore),
        "okx"         => go!(OkxCore),
        "kucoin"      => go!(KucoinCore),
        "bitget"      => go!(BitgetCore),
        "hyperliquid" => go!(HyperliquidCore),
        "gate"        => go!(GateCore),
        _ => Captured::default(),
    }
}

/// Static *response* test dispatch — injects `mock` as the canned HTTP
/// response and returns whatever the exchange's parser produced.
pub async fn dispatch_response(
    id: &str, method: &str, args: Vec<Value>, fixture_options: &Value, mock: Value,
) -> Value {
    let cfg = build_offline_config(id, fixture_options);
    macro_rules! go {
        ($core:ty) => {{
            let mut ex = Box::new(<$core>::new(Some(cfg.clone())));
            ex.bind();
            ex.exchange.offline_mode  = Value::Bool(true);
            ex.exchange.mock_response = mock.clone();
            let m = camel_to_snake(method);
            match panic::AssertUnwindSafe(ex.call_dynamic(&m, args)).catch_unwind().await {
                Ok(v)  => v,
                Err(_) => Value::Null,
            }
        }};
    }
    match id {
        "binance"     => go!(BinanceCore),
        "bybit"       => go!(BybitCore),
        "okx"         => go!(OkxCore),
        "kucoin"      => go!(KucoinCore),
        "bitget"      => go!(BitgetCore),
        "hyperliquid" => go!(HyperliquidCore),
        "gate"        => go!(GateCore),
        _ => Value::Null,
    }
}

/// Mirrors Go's `InitOfflineExchange` — fake credentials + sentinel
/// proxy + markets/currencies pre-loaded from the static fixture files.
fn build_offline_config(id: &str, fixture_options: &Value) -> Value {
    let markets    = load_static_json(id, "markets");
    let currencies = load_static_json(id, "currencies");

    let mut nested_options: HashMap<String, Value> = HashMap::from([
        ("enableUnifiedAccount".to_string(), Value::Bool(true)),
        ("enableUnifiedMargin".to_string(),  Value::Bool(false)),
        ("accessToken".to_string(),          Value::Str("token".to_string())),
        ("expires".to_string(),              Value::Int(999_999_999_999_999)),
        ("leverageBrackets".to_string(),     Value::Map(HashMap::new())),
    ]);
    // Fixture-level + case-level options come in as a flat Map (e.g.
    // {leverageBrackets: ..., portfolioMargin: true}). These map
    // directly into exchange.options. Also support a nested .options
    // key for fixtures that wrap them.
    if let Value::Map(fm) = fixture_options {
        for (k, v) in fm {
            // Skip top-level credential keys (handled separately below).
            if matches!(k.as_str(),
                "apiKey" | "secret" | "password" | "uid" | "walletAddress"
                | "privateKey" | "token" | "login" | "accountId" | "accounts"
                | "options" | "markets" | "currencies" | "httpProxy" | "httpsProxy"
            ) { continue; }
            nested_options.insert(k.clone(), v.clone());
        }
        if let Some(Value::Map(inner)) = fm.get("options") {
            for (k, v) in inner { nested_options.insert(k.clone(), v.clone()); }
        }
    }
    let mut accounts_a = HashMap::new();
    accounts_a.insert("id".to_string(),   Value::Str("myAccount".to_string()));
    accounts_a.insert("code".to_string(), Value::Str("USDT".to_string()));
    let mut accounts_b = HashMap::new();
    accounts_b.insert("id".to_string(),   Value::Str("myAccount".to_string()));
    accounts_b.insert("code".to_string(), Value::Str("USDC".to_string()));

    let mut cfg = HashMap::new();
    cfg.insert("markets".to_string(),         markets);
    cfg.insert("currencies".to_string(),      currencies);
    cfg.insert("enableRateLimit".to_string(), Value::Bool(false));
    cfg.insert("httpProxy".to_string(),       Value::Str("http://fake:8080".to_string()));
    cfg.insert("httpsProxy".to_string(),      Value::Str("http://fake:8080".to_string()));
    cfg.insert("apiKey".to_string(),          Value::Str("key".to_string()));
    cfg.insert("secret".to_string(),          Value::Str("secretsecret".to_string()));
    cfg.insert("password".to_string(),        Value::Str("password".to_string()));
    cfg.insert("walletAddress".to_string(),   Value::Str("wallet".to_string()));
    cfg.insert("privateKey".to_string(),      Value::Str("0xff3bdd43534543d421f05aec535965b5050ad6ac15345435345435453495e771".to_string()));
    cfg.insert("uid".to_string(),             Value::Str("uid".to_string()));
    cfg.insert("token".to_string(),           Value::Str("token".to_string()));
    cfg.insert("login".to_string(),           Value::Str("login".to_string()));
    cfg.insert("accountId".to_string(),       Value::Str("12345".to_string()));
    cfg.insert("accounts".to_string(),        Value::Array(vec![Value::Map(accounts_a), Value::Map(accounts_b)]));
    cfg.insert("offline".to_string(),         Value::Bool(true));
    cfg.insert("options".to_string(),         Value::Map(nested_options));
    // Top-level fixture credential overrides (apiKey/secret/etc.)
    if let Value::Map(fm) = fixture_options {
        for (k, v) in fm {
            if k == "options" { continue; } // handled above
            cfg.insert(k.clone(), v.clone());
        }
    }
    Value::Map(cfg)
}

fn capture(e: &ccxt::exchange::Exchange) -> Captured {
    let url     = match &e.last_request_url     { Value::Str(s) => s.clone(), _ => String::new() };
    let body    = match &e.last_request_body    { Value::Str(s) => Some(s.clone()), _ => None };
    let headers = match &e.last_request_headers {
        Value::Map(m) => m.iter().filter_map(|(k, v)|
            match v { Value::Str(s) => Some((k.clone(), s.clone())), _ => None }).collect(),
        _ => HashMap::new(),
    };
    Captured { url, method: String::new(), body, headers }
}

fn load_static_json(id: &str, kind: &str) -> Value {
    let repo = env!("CARGO_MANIFEST_DIR").trim_end_matches("/rust/tests");
    let path = format!("{}/ts/src/test/static/{}/{}.json", repo, kind, id);
    let raw = match std::fs::read_to_string(&path) { Ok(s) => s, _ => return Value::Null };
    let j: serde_json::Value = match serde_json::from_str(&raw) { Ok(v) => v, _ => return Value::Null };
    json_to_value(&j)
}

/// camelCase → snake_case matching the transpiler's `toSnakeCase`:
///   - Acronyms stay glued: `fetchOHLCV` → `fetch_ohlcv` (not `fetch_o_h_l_c_v`)
///   - But `[A-Z]+[A-Z][a-z]` splits before the last cap: `XMLHttpRequest` → `xml_http_request`
fn camel_to_snake(s: &str) -> String {
    let bytes: Vec<char> = s.chars().collect();
    let mut out = String::with_capacity(s.len() + 4);
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

fn json_to_value(j: &serde_json::Value) -> Value {
    match j {
        serde_json::Value::Null         => Value::Null,
        serde_json::Value::Bool(b)      => Value::Bool(*b),
        serde_json::Value::Number(n)    => {
            if let Some(i) = n.as_i64() { Value::Int(i) }
            else if let Some(f) = n.as_f64() { Value::Float(f) }
            else { Value::Null }
        }
        serde_json::Value::String(s)    => Value::Str(s.clone()),
        serde_json::Value::Array(a)     => Value::Array(a.iter().map(json_to_value).collect()),
        serde_json::Value::Object(o)    => {
            let mut m = HashMap::new();
            for (k, v) in o { m.insert(k.clone(), json_to_value(v)); }
            Value::Map(m)
        }
    }
}
