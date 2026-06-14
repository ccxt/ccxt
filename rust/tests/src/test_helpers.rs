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
use indexmap::IndexMap as HashMap;

pub const LANG: &str = "RUST";
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
    Value::Str(getRootDir_str())
}

/// Plain-string variant used by hand-written helpers that don't need
/// the `Value` wrapper.
pub fn getRootDir_str() -> String {
    let here = env!("CARGO_MANIFEST_DIR");
    let root = std::path::Path::new(here).join("..").join("..");
    let s = root.to_string_lossy().to_string();
    format!("{}/", s.trim_end_matches('/'))
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
    // The live method-test path exits here (TestMainClass calls
    // `exitScript(0)` after `start_test`), `std::process::exit`-ing
    // before `main` can print anything. Without a line here a passing
    // run with `--info` off looks identical to a stall (the last output
    // is the symbol-selection banner). Emit a completion marker keyed by
    // the exchange under test so it's clear the run finished. Neutral
    // wording — the live path exits 0 even when individual
    // `[TEST_FAILURE]` lines were printed, so this is "finished", not a
    // success claim; failures are still visible inline above.
    if c == 0 {
        let id = std::env::args()
            .skip(1)
            .find(|a| !a.starts_with("--"));
        if let Some(id) = id {
            println!("[RUST] {id} test run finished.");
        }
    }
    std::process::exit(c);
}

pub fn exceptionMessage(exc: Value) -> Value {
    Value::Str(match &exc {
        Value::Str(s) => s.clone(),
        other => ccxt::runtime::stringify_param(other),
    })
}

pub fn getTestName(s: Value) -> Value { s }

/// Converts a `catch_unwind` panic payload into a `Value` — the
/// Re-export of `ccxt::runtime::panic_to_value` so the test crate's
/// `use crate::test_helpers::*;` pattern still resolves it.
pub use ccxt::runtime::panic_to_value;

/// `getRootException(e)` — TS unwraps nested `.cause` chains; the Rust
/// catch binding is already the rendered error, so return it as-is.
pub fn getRootException(e: Value) -> Value { e }

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
    let cfg = optional_args.get(0).cloned().unwrap_or(Value::Map(HashMap::new()));
    let id = match &exchange_id { Value::Str(s) => s.clone(), _ => String::new() };
    // Always build the real exchange Core so `exchange.<method>(...)` in
    // tests runs the same code a user gets from `ccxt` (mirrors Go's
    // typed-interface dispatch). `apply_config` accepts pre-loaded
    // `markets` / `options` from offline harnesses (broker-id tests,
    // static request/response) — the cached Core simply uses them.
    if !id.is_empty() {
        crate::live_dispatch::ensure_live_core(&id, cfg.clone());
        // `--useProxy`: TS source mutates `exchange.httpProxy = …` on the
        // Value object directly. The Rust transpiler emits that as a
        // `set_value(&mut exchange, …)` call, but the surrounding test
        // harness passes `exchange.clone()` to `expand_settings` — so the
        // mutation lands on a discarded clone of the snapshot, never on
        // the live Core. We do the proxy lookup here, against the
        // hand-written runtime, so the writes land on the Core's actual
        // `httpProxy`/`httpsProxy`/`socksProxy` fields before any HTTP
        // client is built. `expand_settings` still runs its snapshot-side
        // mutation (kept for parity with TS) but it's now a no-op.
        let use_proxy_flag = std::env::args().any(|a| a == "--useProxy");
        if use_proxy_flag {
            if let Ok(text) = std::fs::read_to_string(format!("{}skip-tests.json", crate::test_helpers::getRootDir_str())) {
                if let Ok(json) = serde_json::from_str::<serde_json::Value>(&text) {
                    if let Some(entry) = json.get(&id) {
                        for key in ["httpProxy", "httpsProxy", "socksProxy", "proxy",
                                    "wsProxy", "wssProxy", "wsSocksProxy"] {
                            if let Some(v) = entry.get(key).and_then(|v| v.as_str()) {
                                if !v.is_empty() {
                                    crate::live_dispatch::write_field_for_id(
                                        &id, key, Value::Str(v.to_string()),
                                    );
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    // Snapshot the real exchange so its `describe()` output (notably
    // `options.brokerId`, which broker-id tests assert) is present.
    // Falls back to a bare config map for ids with no registered Core.
    let snap = crate::registry::exchange_snapshot(&id, cfg.clone());
    if let Value::Dict(m_arc) = snap {
        let mut m = std::sync::Arc::try_unwrap(m_arc).unwrap_or_else(|a| (*a).clone());
        m.insert("id".to_string(), exchange_id.clone());
        // `__live_id` flags this snapshot for `ccxt::value::get_value`'s
        // live-lookup fast path — heavy reads (`exchange.markets` etc.)
        // skip the deep-cloned snapshot copy and route to the cached
        // Core via `live_dispatch::live_lookup`.
        m.insert("__live_id".to_string(), exchange_id);
        // Drop the large describe()-derived config blocks from the
        // snapshot. The transpiled validators (`testMarket`, `testTicker`,
        // …) call `exchange.clone()` dozens of times per item; with a
        // 4k-market loop that deep-copied binance's whole `api` block
        // ~130k times (≈64s just for loadMarkets). These keys are
        // immutable during a test and resolve via `live_lookup`
        // (read_field) straight off the cached Core, so removing them
        // here is transparent to reads.
        // NB: do NOT strip `options` here — broker-id tests mutate
        // `exchange.options` on the snapshot and read it back; stripping
        // it routed those reads to the Core's pristine options (dropping
        // the per-case broker overrides → "id not in headers" failures).
        // `has` IS safe to strip: it's read-only in tests and resolves
        // via live_lookup. It's ~250 flags and the per-assert
        // `exchange.clone()` in the validators made cloning it the
        // dominant cost of large-collection loops (fetchTickers/markets).
        for k in ["api", "urls", "fees", "timeframes", "exceptions",
                  "features", "precision", "limits", "has"] {
            m.shift_remove(k);
        }
        return Value::Map(m);
    }
    let mut m = match cfg {
        Value::Dict(om) => std::sync::Arc::try_unwrap(om).unwrap_or_else(|a| (*a).clone()),
        _ => HashMap::new(),
    };
    m.insert("id".to_string(), exchange_id);
    Value::Map(m)
}

pub async fn close(_exchange: Value) -> Value { Value::Null }

#[cfg(feature = "exchange-tests")]
pub async fn callMethod(
    _test_files: Value, method_name: Value, exchange: Value,
    skipped_properties: Value, args: Value,
) -> Value {
    let name = match &method_name { Value::Str(s) => s.clone(), _ => return Value::Null };
    crate::exchange_transpiled::call_test(&name, exchange, skipped_properties, args).await;
    Value::Null
}
#[cfg(not(feature = "exchange-tests"))]
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
    let method = match &method_name {
        Value::Str(s) => s.clone(),
        _ => return Value::Null,
    };
    let arg_vec: Vec<Value> = match args {
        Value::Arr(a) => std::sync::Arc::try_unwrap(a).unwrap_or_else(|x| (*x).clone()),
        Value::Null     => Vec::new(),
        other           => vec![other],
    };
    // Static *response* test: a canned response was stashed via
    // `setFetchResponse`. Live dispatch consumes it inside `fetch_typed`
    // (mirrors Go's `mockResponse`), then runs the exchange parser
    // against it. No proxy throw fires because the canned response
    // short-circuits the network path.
    crate::live_dispatch::dispatch(exchange, &method, arg_vec).await
}

pub fn callExchangeMethodDynamicallySync(
    _exchange: Value, _method_name: Value, _args: Value,
) -> Value {
    Value::Null
}

#[cfg(feature = "exchange-tests")]
pub async fn getTestFiles(_properties: Value, _ws: Value) -> Value {
    crate::exchange_transpiled::available_tests()
}
#[cfg(not(feature = "exchange-tests"))]
pub async fn getTestFiles(_properties: Value, _ws: Value) -> Value {
    Value::Map(HashMap::new())
}

#[cfg(feature = "exchange-tests")]
pub fn getTestFilesSync(_properties: Value, _ws: Value) -> Value {
    crate::exchange_transpiled::available_tests()
}
#[cfg(not(feature = "exchange-tests"))]
pub fn getTestFilesSync(_properties: Value, _ws: Value) -> Value {
    Value::Map(HashMap::new())
}

// ── exchange-method surface (`ExchangeOps`) ─────────────────────────────────
//
// PURE-HELPER ONLY. Live methods (`fetch_*`, `create_*`, `load_markets`,
// `sign_in`, etc.) are NOT here — the transpiler now rewrites those calls
// to `live_dispatch::dispatch(&exchange, "<method>", vec![args])`, which
// forwards to the cached real `<X>Core`. Mirrors Go's `exchange
// ccxt.ICoreExchange` typed-interface dispatch: same code in tests as
// users get from `ccxt`.
//
// What stays here are the pure base helpers (`safe_value`, `parse_number`,
// `deep_extend`, …) that operate on the exchange Value's data, not on a
// cached Core. They're still callable as `exchange.safe_value(...)` from
// the transpiled tests, and route through a throwaway base Exchange
// instance — no network, no per-exchange state.

use ccxt::exchange::Exchange;

// One throwaway `Exchange` per thread for the ExchangeOps stub forwarders.
// `Exchange::new(None)` allocates ~10 large `Value::Map` defaults
// (`has`, `urls`, `features`, …); constructing one per call made
// `testMarket` (which calls `exchange.parse_number(...)` five times per
// market) build ~22k Exchange structs for binance, taking minutes.
// `with_base` reuses a single instance per thread for ~100x speedup.
thread_local! {
    static BASE_EXCHANGE: std::cell::RefCell<Exchange> =
        std::cell::RefCell::new(Exchange::new(None));
}

fn with_base<F, R>(f: F) -> R where F: FnOnce(&mut Exchange) -> R {
    BASE_EXCHANGE.with(|cell| f(&mut cell.borrow_mut()))
}

#[allow(dead_code)]
fn with_base_clone() -> Exchange { Exchange::new(None) }

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
    fn parse_number(&self, n: Value, optional_args: &[Value]) -> Value;
    fn safe_number(&self, d: Value, key: Value, optional_args: &[Value]) -> Value;
    fn safe_integer(&self, d: Value, key: Value, optional_args: &[Value]) -> Value;
    fn safe_string_n(&self, d: Value, keys: Value, optional_args: &[Value]) -> Value;
    fn omit_zero(&self, s: Value) -> Value;
    fn array_concat(&self, a: Value, b: Value) -> Value;
    /// Reflects `exchange.setProperty(exchange, key, value)` from TS —
    /// the receiver and first arg are the same Value, hence the
    /// `_redundant_exchange` slot. Mutates the Value-map keyed by `key`.
    fn set_property(&mut self, redundant_exchange: Value, key: Value, value: Value);
    fn parse_timeframe(&self, tf: Value) -> Value;
    fn iso8601(&self, ts: Value) -> Value;
    fn milliseconds(&self) -> Value;
    fn safeString(&self, d: Value, key: Value, optional_args: &[Value]) -> Value;
    fn exception_message(&self, e: Value) -> Value;
    fn decimal_to_precision(&self, n: Value, rounding: Value, precision: Value, optional_args: &[Value]) -> Value;
    /// Offline tests don't really wait — `sleep` is a no-op so retry
    /// loops resolve instantly.
    fn sleep(&self, ms: Value) -> impl std::future::Future<Output = Value>;
}

impl ExchangeOps for Value {
    fn safe_value(&self, obj: Value, key: Value, o: &[Value]) -> Value { with_base(|e| e.safe_value(obj, key, o)) }
    fn safe_string(&self, obj: Value, key: Value, o: &[Value]) -> Value { with_base(|e| e.safe_string(obj, key, o)) }
    fn safe_bool(&self, d: Value, key: Value, o: &[Value]) -> Value { with_base(|e| e.safe_bool(d, key, o)) }
    fn safe_dict(&self, d: Value, key: Value, o: &[Value]) -> Value { with_base(|e| e.safe_dict(d, key, o)) }
    fn safe_list(&self, d: Value, key: Value, o: &[Value]) -> Value { with_base(|e| e.safe_list(d, key, o)) }
    fn is_empty_string(&self, value: Value) -> Value { with_base(|e| e.is_empty_string(value)) }
    fn json(&self, v: Value) -> Value { with_base(|e| e.json(v)) }
    fn in_array(&self, needle: Value, haystack: Value) -> Value { with_base(|e| e.in_array(needle, haystack)) }
    fn deep_extend(&self, a: Value, o: &[Value]) -> Value { with_base(|e| e.deep_extend(a, o)) }
    fn deepExtend(&self, a: Value, o: &[Value]) -> Value { with_base(|e| e.deep_extend(a, o)) }
    fn index_by(&self, arr: Value, key: Value) -> Value { with_base(|e| e.index_by(arr, key)) }
    fn filter_by(&self, arr: Value, key: Value, value: Value, o: &[Value]) -> Value { with_base(|e| e.filter_by(arr, key, value, o)) }
    fn number_to_string(&self, n: Value) -> Value { with_base(|e| e.number_to_string(n)) }
    fn parse_to_int(&self, n: Value) -> Value { with_base(|e| e.parse_to_int(n)) }
    fn parse_to_numeric(&self, n: Value) -> Value { with_base(|e| e.parse_to_numeric(n)) }
    fn sum(&self, optional_args: &[Value]) -> Value { with_base(|e| e.sum(optional_args)) }
    fn convert_to_safe_dictionary(&self, v: Value) -> Value { v }
    /// `market(symbol)` — look the unified symbol up in this exchange
    /// value's `markets` map (offline exchanges carry markets inline).
    /// For a `__live_id` snapshot, resolve the single market off the
    /// cached Core instead of `get_value(self, "markets")`, which would
    /// deep-clone the entire ~4k-market map on every call — the
    /// validators call this once per item, so that clone dominated
    /// large-collection loops (fetchTickers/loadMarkets).
    fn market(&self, symbol: Value) -> Value {
        if let (Value::Dict(m), Value::Str(sym)) = (self, &symbol) {
            if let Some(Value::Str(id)) = m.get("__live_id") {
                let mkt = crate::live_dispatch::market_for(id, sym);
                if !matches!(mkt, Value::Null) { return mkt; }
            }
        }
        let markets = ccxt::get_value(self, &Value::Str("markets".to_string()));
        ccxt::get_value(&markets, &symbol)
    }
    fn set_sandbox_mode(&self, _enabled: Value) { /* stub — no live exchange */ }
    /// Deep-merges `options` into this exchange value's `options` map
    /// (mirrors `Exchange.extendExchangeOptions`).
    fn extend_exchange_options(&mut self, options: Value) -> Value {
        let current = ccxt::get_value(self, &Value::Str("options".to_string()));
        let merged = with_base(|e| e.deep_extend(current, &[options]));
        ccxt::set_value(self, &Value::Str("options".to_string()), merged.clone());
        merged
    }
    fn check_required_credentials(&self, _optional_args: &[Value]) -> Value { Value::Bool(true) }
    fn parse_number(&self, n: Value, o: &[Value]) -> Value { with_base(|e| e.parse_number(n, o)) }
    fn safe_number(&self, d: Value, key: Value, o: &[Value]) -> Value { with_base(|e| e.safe_number(d, key, o)) }
    fn safe_integer(&self, d: Value, key: Value, o: &[Value]) -> Value { with_base(|e| e.safe_integer(d, key, o)) }
    fn safe_string_n(&self, d: Value, keys: Value, o: &[Value]) -> Value { with_base(|e| e.safe_string_n(d, keys, o)) }
    fn omit_zero(&self, s: Value)                -> Value { with_base(|e| e.omit_zero(s)) }
    fn array_concat(&self, a: Value, b: Value)   -> Value { with_base(|e| e.array_concat(a, b)) }
    fn parse_timeframe(&self, tf: Value)         -> Value { with_base(|e| e.parse_timeframe(tf)) }
    fn iso8601(&self, ts: Value)                 -> Value { with_base(|e| e.iso8601(ts)) }
    fn milliseconds(&self)                        -> Value { with_base(|e| e.milliseconds()) }
    /// Set a field on the exchange Value-map by key. The
    /// transpiled tests use this to inject precision/markets/etc.
    /// Three-arg form matches TS `setProperty(exchange, key, value)`.
    fn set_property(&mut self, _redundant_exchange: Value, key: Value, value: Value) {
        ccxt::set_value(self, &key, value);
    }
    /// camelCase alias — some test files slip through the snake-case rewrite.
    fn safeString(&self, d: Value, key: Value, o: &[Value]) -> Value {
        with_base(|e| e.safe_string(d, key, o))
    }
    fn exception_message(&self, e: Value) -> Value { exceptionMessage(e) }
    fn decimal_to_precision(&self, n: Value, rounding: Value, precision: Value, o: &[Value]) -> Value {
        with_base(|e| e.decimal_to_precision(n, rounding, precision, o))
    }
    async fn sleep(&self, _ms: Value) -> Value { Value::Null }
}
