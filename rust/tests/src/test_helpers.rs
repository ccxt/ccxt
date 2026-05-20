// Hand-written test-harness helpers used by the transpiled
// `tests.rs` (`TestMainClass`). Mirrors `go/tests/base/helpers.go`
// and `go/tests/base/utils.go` — the per-language test scaffolding
// that the transpiled `ts/src/test/tests.ts` imports as free
// functions (`getCliArgValue`, `ioFileRead`, `initExchange`, …).
//
// Names are kept camelCase to match what the transpiled code calls
// directly (the AST transpiler does not snake-case imported free
// function references).

#![allow(non_snake_case, dead_code, unused)]

use ccxt::Value;
use std::collections::HashMap;

pub const LANG: &str = "rust";
pub const EXT:  &str = "rs";

// ── CLI args ────────────────────────────────────────────────────────────────

/// True iff the string flag `arg` is present in the process argv.
pub fn getCliArgValue(arg: Value) -> Value {
    let target = match &arg {
        Value::Str(s) => s.clone(),
        other => ccxt::runtime::stringify_param(other),
    };
    Value::Bool(std::env::args().any(|a| a == target))
}

/// The Nth non-flag positional CLI argument (0-based), or Null.
pub fn getCliPositionalArg(index: Value) -> Value {
    let idx = match &index { Value::Int(n) => *n as usize, _ => 0 };
    let positionals: Vec<String> = std::env::args()
        .skip(1)
        .filter(|a| !a.starts_with("--"))
        .collect();
    match positionals.get(idx) {
        Some(s) => Value::Str(s.clone()),
        None => Value::Null,
    }
}

// ── environment / platform ──────────────────────────────────────────────────

pub fn isSync()    -> Value { Value::Bool(false) }
pub fn getLang()   -> Value { Value::Str(LANG.to_string()) }
pub fn getExt()    -> Value { Value::Str(EXT.to_string()) }
pub fn isWindows() -> Value { Value::Bool(cfg!(target_os = "windows")) }
pub fn isLinux()   -> Value { Value::Bool(cfg!(target_os = "linux")) }
pub fn isAmd64()   -> Value { Value::Bool(cfg!(target_arch = "x86_64")) }

/// Repo root with a trailing slash (mirrors Go's `GetRootDir`).
pub fn getRootDir() -> Value {
    // tests crate lives at <repo>/rust/tests — walk up two dirs.
    let here = env!("CARGO_MANIFEST_DIR");
    let root = std::path::Path::new(here).join("..").join("..");
    let s = root.to_string_lossy().to_string();
    Value::Str(format!("{}/", s.trim_end_matches('/')))
}

pub fn getEnvVars() -> Value {
    let mut m = HashMap::new();
    for (k, v) in std::env::vars() {
        m.insert(k, Value::Str(v));
    }
    Value::Map(m)
}

pub fn convertAscii(input: Value) -> Value { input }

// ── logging ─────────────────────────────────────────────────────────────────

/// `dump(...)` — space-joined print, like `console.log`.
pub fn dump(args: &[Value]) {
    let parts: Vec<String> = args.iter().map(|v| match v {
        Value::Str(s) => s.clone(),
        other => ccxt::runtime::stringify_param(other),
    }).collect();
    println!("{}", parts.join(" "));
}

// ── JSON ────────────────────────────────────────────────────────────────────

pub fn jsonParse(s: Value)     -> Value { ccxt::runtime::json_parse(&s) }
pub fn jsonStringify(v: Value) -> Value { ccxt::runtime::json_stringify(&v) }

// ── file IO ─────────────────────────────────────────────────────────────────

pub fn ioFileExists(path: Value) -> Value {
    match &path {
        Value::Str(p) => Value::Bool(std::path::Path::new(p).exists()),
        _ => Value::Bool(false),
    }
}

/// Reads a file and JSON-parses its contents.
pub fn ioFileRead(path: Value, _optional_args: &[Value]) -> Value {
    let p = match &path { Value::Str(p) => p.clone(), _ => return Value::Null };
    match std::fs::read_to_string(&p) {
        Ok(content) => ccxt::runtime::json_parse(&Value::Str(content)),
        Err(_) => Value::Null,
    }
}

/// Lists the entries of a directory.
pub fn ioDirRead(path: Value) -> Value {
    let p = match &path { Value::Str(p) => p.clone(), _ => return Value::Null };
    match std::fs::read_dir(&p) {
        Ok(rd) => Value::Array(
            rd.filter_map(|e| e.ok())
              .filter_map(|e| e.file_name().into_string().ok())
              .map(Value::Str)
              .collect()
        ),
        Err(_) => Value::Null,
    }
}

// ── misc ────────────────────────────────────────────────────────────────────

pub fn isNullValue(value: Value) -> Value { Value::Bool(matches!(value, Value::Null)) }

pub fn exitScript(code: Value) {
    let c = match &code { Value::Int(n) => *n as i32, _ => 0 };
    std::process::exit(c);
}

pub fn exceptionMessage(exc: Value) -> Value {
    Value::Str(match &exc {
        Value::Str(s) => s.clone(),
        other => ccxt::runtime::stringify_param(other),
    })
}

pub fn getTestName(s: Value) -> Value { s }

// ── assertions ──────────────────────────────────────────────────────────────

/// Truthiness for `assert` — accepts either a `Value` (the common
/// case) or a bare `bool` (when the condition is a comparison like
/// `is_greater_than(...)`).
pub trait Truthy { fn truthy(&self) -> bool; }
impl Truthy for bool      { fn truthy(&self) -> bool { *self } }
impl Truthy for Value     { fn truthy(&self) -> bool { ccxt::runtime::is_true(self) } }
impl Truthy for &Value    { fn truthy(&self) -> bool { ccxt::runtime::is_true(self) } }

/// `assert(condition, ...message)` — the test harness's assertion.
/// A plain function (not Rust's `assert!` macro) so the transpiled
/// `assert(...)` calls in `tests.rs` resolve directly. Panics with a
/// joined message when `condition` is falsy; the panic is caught by
/// the per-test `catch_unwind` in the runner.
pub fn assert<T: Truthy>(condition: T, optional_args: &[Value]) {
    if condition.truthy() {
        return;
    }
    let message: String = optional_args.iter()
        .map(|v| match v {
            Value::Str(s) => s.clone(),
            other => ccxt::runtime::stringify_param(other),
        })
        .collect::<Vec<_>>()
        .join(" ");
    if message.is_empty() {
        panic!("Assertion failed");
    } else {
        panic!("Assertion failed: {message}");
    }
}

// ── exchange bridge ─────────────────────────────────────────────────────────
//
// These take/return `Value` for now. Once the transpiled `tests.rs`
// retypes its `exchange` locals to `ccxt::exchange::Exchange` (the
// dynamic-dispatch step), these signatures will be revisited so the
// helpers route into a real exchange instance.

pub fn getExchangeProp(exchange: Value, prop: Value, optional_args: &[Value]) -> Value {
    let res = ccxt::get_value(&exchange, &prop);
    if !matches!(res, Value::Null) {
        return res;
    }
    optional_args.get(0).cloned().unwrap_or(Value::Null)
}

pub fn setExchangeProp(_exchange: Value, _prop: Value, _value: Value) {
    // Filled in by the dynamic-dispatch step.
}

/// `setFetchResponse(exchange, response)` — stashes a canned HTTP
/// response on the exchange value for static *response* tests.
/// `Null` clears it.
pub fn setFetchResponse(exchange: &mut Value, response: Value) -> Value {
    ccxt::set_value(exchange, &Value::Str("__fetchResponse".to_string()), response);
    exchange.clone()
}

/// `initExchange(id, [config], [ws])` — synchronous in the TS source.
/// Returns a `Value`-shaped exchange handle: the supplied config map
/// (markets / currencies / options / credentials) with its `id` set.
/// The static request/response path dispatches by `id` + `options`
/// through the exchange registry.
pub fn initExchange(exchange_id: Value, optional_args: &[Value]) -> Value {
    let mut m = match optional_args.get(0) {
        Some(Value::Map(om)) => om.clone(),
        _ => HashMap::new(),
    };
    m.insert("id".to_string(), exchange_id);
    Value::Map(m)
}

pub async fn close(_exchange: Value) -> Value { Value::Null }

pub async fn callMethod(
    _test_files: Value, _method_name: Value, _exchange: Value,
    _skipped_properties: Value, _args: Value,
) -> Value {
    Value::Null
}

pub fn callMethodSync(
    _test_files: Value, _method_name: Value, _exchange: Value,
    _skipped_properties: Value, _args: Value,
) -> Value {
    Value::Null
}

/// `callExchangeMethodDynamically(exchange, method, args)` — dispatches
/// `method(args)` against an offline exchange instance via the registry
/// and stores the captured request (`last_request_url` / `_body` /
/// `_headers`) back onto the `exchange` value. Mirrors Go's
/// `CallExchangeMethodDynamically` + `TestRequestStatically` capture.
pub async fn callExchangeMethodDynamically(
    exchange: &mut Value, method_name: Value, args: Value,
) -> Value {
    let id = match ccxt::get_value(exchange, &Value::Str("id".to_string())) {
        Value::Str(s) => s,
        _ => return Value::Null,
    };
    let method = match &method_name {
        Value::Str(s) => s.clone(),
        _ => return Value::Null,
    };
    let arg_vec: Vec<Value> = match args {
        Value::Array(a) => a,
        Value::Null     => Vec::new(),
        other           => vec![other],
    };
    let options = ccxt::get_value(exchange, &Value::Str("options".to_string()));
    // Static *response* test: a mock was stashed by `setFetchResponse`
    // — dispatch through the mocked-response path and return the parsed
    // result the caller compares against `parsedResponse`.
    let mock = ccxt::get_value(exchange, &Value::Str("__fetchResponse".to_string()));
    if !matches!(mock, Value::Null) {
        return crate::registry::dispatch_response(&id, &method, arg_vec, &options, mock).await;
    }
    let captured = crate::registry::dispatch(&id, &method, arg_vec, &options).await;
    ccxt::set_value(exchange, &Value::Str("last_request_url".to_string()),
                    Value::Str(captured.url));
    ccxt::set_value(exchange, &Value::Str("last_request_body".to_string()),
                    match captured.body { Some(b) => Value::Str(b), None => Value::Null });
    let mut hm = HashMap::new();
    for (k, v) in captured.headers { hm.insert(k, Value::Str(v)); }
    ccxt::set_value(exchange, &Value::Str("last_request_headers".to_string()),
                    Value::Map(hm));
    Value::Null
}

pub fn callExchangeMethodDynamicallySync(
    _exchange: Value, _method_name: Value, _args: Value,
) -> Value {
    Value::Null
}

pub async fn getTestFiles(_properties: Value, _ws: Value) -> Value {
    Value::Map(HashMap::new())
}

pub fn getTestFilesSync(_properties: Value, _ws: Value) -> Value {
    Value::Map(HashMap::new())
}

// ── exchange-method surface (`ExchangeOps`) ─────────────────────────────────
//
// The transpiled `tests.rs` calls a handful of methods directly on its
// `exchange` values (`exchange.safeValue(...)`, `exchange.createOrder(...)`,
// …). In Go these resolve because `exchange` is typed `ICoreExchange`.
// Here `exchange` stays a `Value`, so this extension trait supplies the
// surface — avoiding a full retype-and-thread-`Exchange` cascade.
//
//   * Pure base methods delegate to a throwaway `Exchange` instance
//     (they don't read exchange state).
//   * Stateful / live methods (`createOrder`, `loadMarkets`, …) are
//     stubs — the static request/response path dispatches through
//     `callExchangeMethodDynamically`, and the broker-id / live paths
//     aren't exercised by the offline test runs.

use ccxt::exchange::Exchange;

fn base_exchange() -> Exchange { Exchange::new(None) }

pub trait ExchangeOps {
    fn safe_value(&self, obj: Value, key: Value, optional_args: &[Value]) -> Value;
    fn safe_string(&self, obj: Value, key: Value, optional_args: &[Value]) -> Value;
    fn safe_bool(&self, d: Value, key: Value, optional_args: &[Value]) -> Value;
    fn safe_dict(&self, d: Value, key: Value, optional_args: &[Value]) -> Value;
    fn safe_list(&self, d: Value, key: Value, optional_args: &[Value]) -> Value;
    fn is_empty_string(&self, value: Value) -> Value;
    fn json(&self, v: Value) -> Value;
    fn in_array(&self, needle: Value, haystack: Value) -> Value;
    fn deep_extend(&self, a: Value, optional_args: &[Value]) -> Value;
    fn deepExtend(&self, a: Value, optional_args: &[Value]) -> Value;
    fn index_by(&self, arr: Value, key: Value) -> Value;
    fn filter_by(&self, arr: Value, key: Value, value: Value, optional_args: &[Value]) -> Value;
    fn number_to_string(&self, n: Value) -> Value;
    fn parse_to_int(&self, n: Value) -> Value;
    fn parse_to_numeric(&self, n: Value) -> Value;
    fn sum(&self, optional_args: &[Value]) -> Value;
    fn convert_to_safe_dictionary(&self, v: Value) -> Value;
    fn market(&self, symbol: Value) -> Value;
    fn set_sandbox_mode(&self, enabled: Value);
    fn extend_exchange_options(&mut self, options: Value) -> Value;
    fn check_required_credentials(&self, optional_args: &[Value]) -> Value;
    fn create_order(&self, symbol: Value, type_var: Value, side: Value, amount: Value, optional_args: &[Value]) -> impl std::future::Future<Output = Value>;
    fn create_orders(&self, orders: Value, optional_args: &[Value]) -> impl std::future::Future<Output = Value>;
    fn fetch_ticker(&self, symbol: Value, optional_args: &[Value]) -> impl std::future::Future<Output = Value>;
    fn load_markets(&self, optional_args: &[Value]) -> impl std::future::Future<Output = Value>;
}

impl ExchangeOps for Value {
    fn safe_value(&self, obj: Value, key: Value, o: &[Value]) -> Value { base_exchange().safe_value(obj, key, o) }
    fn safe_string(&self, obj: Value, key: Value, o: &[Value]) -> Value { base_exchange().safe_string(obj, key, o) }
    fn safe_bool(&self, d: Value, key: Value, o: &[Value]) -> Value { base_exchange().safe_bool(d, key, o) }
    fn safe_dict(&self, d: Value, key: Value, o: &[Value]) -> Value { base_exchange().safe_dict(d, key, o) }
    fn safe_list(&self, d: Value, key: Value, o: &[Value]) -> Value { base_exchange().safe_list(d, key, o) }
    fn is_empty_string(&self, value: Value) -> Value { base_exchange().is_empty_string(value) }
    fn json(&self, v: Value) -> Value { base_exchange().json(v) }
    fn in_array(&self, needle: Value, haystack: Value) -> Value { base_exchange().in_array(needle, haystack) }
    fn deep_extend(&self, a: Value, o: &[Value]) -> Value { base_exchange().deep_extend(a, o) }
    fn deepExtend(&self, a: Value, o: &[Value]) -> Value { base_exchange().deep_extend(a, o) }
    fn index_by(&self, arr: Value, key: Value) -> Value { base_exchange().index_by(arr, key) }
    fn filter_by(&self, arr: Value, key: Value, value: Value, o: &[Value]) -> Value { base_exchange().filter_by(arr, key, value, o) }
    fn number_to_string(&self, n: Value) -> Value { base_exchange().number_to_string(n) }
    fn parse_to_int(&self, n: Value) -> Value { base_exchange().parse_to_int(n) }
    fn parse_to_numeric(&self, n: Value) -> Value { base_exchange().parse_to_numeric(n) }
    fn sum(&self, optional_args: &[Value]) -> Value { base_exchange().sum(optional_args) }
    fn convert_to_safe_dictionary(&self, v: Value) -> Value { v }
    /// `market(symbol)` — look the unified symbol up in this exchange
    /// value's `markets` map (offline exchanges carry markets inline).
    fn market(&self, symbol: Value) -> Value {
        let markets = ccxt::get_value(self, &Value::Str("markets".to_string()));
        ccxt::get_value(&markets, &symbol)
    }
    fn set_sandbox_mode(&self, _enabled: Value) { /* stub — no live exchange */ }
    /// Deep-merges `options` into this exchange value's `options` map
    /// (mirrors `Exchange.extendExchangeOptions`).
    fn extend_exchange_options(&mut self, options: Value) -> Value {
        let current = ccxt::get_value(self, &Value::Str("options".to_string()));
        let merged = base_exchange().deep_extend(current, &[options]);
        ccxt::set_value(self, &Value::Str("options".to_string()), merged.clone());
        merged
    }
    fn check_required_credentials(&self, _optional_args: &[Value]) -> Value { Value::Bool(true) }
    async fn create_order(&self, _symbol: Value, _type_var: Value, _side: Value, _amount: Value, _o: &[Value]) -> Value { Value::Null }
    async fn create_orders(&self, _orders: Value, _o: &[Value]) -> Value { Value::Null }
    async fn fetch_ticker(&self, _symbol: Value, _o: &[Value]) -> Value { Value::Null }
    async fn load_markets(&self, _o: &[Value]) -> Value { Value::Null }
}
