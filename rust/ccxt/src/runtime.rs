// Runtime helpers used by transpiled Rust code.
//
// The ast-transpiler emits code like `add(&a, &b)`, `is_equal(&x, &y)`,
// `get_value(&obj, &key)`, etc. — a Value-only "duck-typed" runtime,
// modelled after how the Python/PHP transpilations work.
//
// These helpers implement those primitives on `crate::Value`. They aim to
// be lenient: any type mismatch returns `Value::Null` or `false` rather
// than panicking, mirroring JS semantics.

#![allow(clippy::float_cmp, clippy::needless_return, dead_code)]

use crate::Value;
use indexmap::IndexMap as HashMap;
use std::sync::Arc;

// ── numeric / arithmetic ─────────────────────────────────────────────────────

fn as_f64(v: &Value) -> Option<f64> {
    match v {
        Value::Int(n)   => Some(*n as f64),
        Value::Float(f) => Some(*f),
        Value::Str(s)   => s.parse().ok(),
        Value::Bool(b)  => Some(if *b { 1.0 } else { 0.0 }),
        _ => None,
    }
}

fn as_i64(v: &Value) -> Option<i64> {
    match v {
        Value::Int(n)   => Some(*n),
        Value::Float(f) => Some(*f as i64),
        Value::Str(s)   => s.parse().ok(),
        Value::Bool(b)  => Some(if *b { 1 } else { 0 }),
        _ => None,
    }
}

fn both_ints(a: &Value, b: &Value) -> bool {
    matches!(a, Value::Int(_)) && matches!(b, Value::Int(_))
}

pub fn add(a: &Value, b: &Value) -> Value {
    // String concatenation if either side is a string (JS-style)
    if let (Value::Str(sa), Value::Str(sb)) = (a, b) {
        return Value::Str(format!("{sa}{sb}"));
    }
    if let Value::Str(_) = a { if let Some(_) = as_f64(b) {} return string_concat(a, b); }
    if let Value::Str(_) = b { return string_concat(a, b); }
    if both_ints(a, b) {
        return Value::Int(as_i64(a).unwrap() + as_i64(b).unwrap());
    }
    match (as_f64(a), as_f64(b)) {
        (Some(x), Some(y)) => Value::Float(x + y),
        _ => Value::Null,
    }
}

fn string_concat(a: &Value, b: &Value) -> Value {
    let sa = stringify_simple(a);
    let sb = stringify_simple(b);
    Value::Str(format!("{sa}{sb}"))
}

pub fn stringify_param(v: &Value) -> String { stringify_simple(v) }

fn stringify_simple(v: &Value) -> String {
    match v {
        Value::Str(s)   => s.clone(),
        Value::Int(n)   => n.to_string(),
        Value::Float(f) => f.to_string(),
        Value::Bool(b)  => b.to_string(),
        Value::Null     => "null".to_string(),
        // Precise sentinel — { integer, decimals, __precise: true }.
        // Reconstruct the decimal representation so `to_string_val` in
        // transpiled code returns the expected number string (phemex
        // `toEn` shifts decimals by `valueScale`, then reduce/stringify).
        Value::Dict(m) if m.contains_key("__precise") => precise_to_string(m),
        _ => format!("{v}"),
    }
}

fn precise_to_string(m: &indexmap::IndexMap<String, Value>) -> String {
    let decimals: i64 = match m.get("decimals") { Some(Value::Int(n)) => *n, _ => 0 };
    let integer: String = match m.get("integer") {
        Some(Value::Str(s)) => s.clone(),
        _ => return "0".to_string(),
    };
    let (sign, mut digits) = if let Some(rest) = integer.strip_prefix('-') {
        ("-".to_string(), rest.to_string())
    } else { ("".to_string(), integer) };
    if decimals <= 0 {
        // Pad zeros onto the integer side.
        for _ in 0..(-decimals) { digits.push('0'); }
        return format!("{sign}{digits}");
    }
    let d = decimals as usize;
    if digits.len() <= d {
        // Need leading zeros: "1" with decimals=4 → "0.0001"
        let zeros = "0".repeat(d - digits.len());
        format!("{sign}0.{zeros}{digits}")
    } else {
        let split = digits.len() - d;
        let (int_part, frac_part) = digits.split_at(split);
        format!("{sign}{int_part}.{frac_part}")
    }
}

pub fn subtract(a: &Value, b: &Value) -> Value {
    if both_ints(a, b) { return Value::Int(as_i64(a).unwrap() - as_i64(b).unwrap()); }
    match (as_f64(a), as_f64(b)) {
        (Some(x), Some(y)) => Value::Float(x - y),
        _ => Value::Null,
    }
}

pub fn multiply(a: &Value, b: &Value) -> Value {
    if both_ints(a, b) { return Value::Int(as_i64(a).unwrap() * as_i64(b).unwrap()); }
    match (as_f64(a), as_f64(b)) {
        (Some(x), Some(y)) => Value::Float(x * y),
        _ => Value::Null,
    }
}

pub fn divide(a: &Value, b: &Value) -> Value {
    match (as_f64(a), as_f64(b)) {
        (Some(_), Some(y)) if y == 0.0 => Value::Null,
        (Some(x), Some(y)) => Value::Float(x / y),
        _ => Value::Null,
    }
}

pub fn mod_val(a: &Value, b: &Value) -> Value {
    if both_ints(a, b) {
        let yi = as_i64(b).unwrap();
        if yi == 0 { return Value::Null; }
        return Value::Int(as_i64(a).unwrap() % yi);
    }
    match (as_f64(a), as_f64(b)) {
        (Some(_), Some(y)) if y == 0.0 => Value::Null,
        (Some(x), Some(y)) => Value::Float(x % y),
        _ => Value::Null,
    }
}

pub fn negate(v: &Value) -> Value {
    match v {
        Value::Int(n)   => Value::Int(-n),
        Value::Float(f) => Value::Float(-f),
        _ => match as_f64(v) {
            Some(x) => Value::Float(-x),
            None    => Value::Null,
        },
    }
}

// ── comparisons ─────────────────────────────────────────────────────────────

pub fn is_equal(a: &Value, b: &Value) -> bool {
    match (a, b) {
        (Value::Null, Value::Null) => true,
        (Value::Bool(x), Value::Bool(y)) => x == y,
        (Value::Str(x), Value::Str(y))   => x == y,
        (Value::Int(x), Value::Int(y))   => x == y,
        (Value::Float(x), Value::Float(y)) => x == y,
        _ => match (as_f64(a), as_f64(b)) {
            (Some(x), Some(y)) => x == y,
            _ => false,
        },
    }
}

pub fn is_greater_than(a: &Value, b: &Value) -> bool {
    match (as_f64(a), as_f64(b)) {
        (Some(x), Some(y)) => x > y,
        _ => match (a, b) { (Value::Str(x), Value::Str(y)) => x > y, _ => false },
    }
}

pub fn is_less_than(a: &Value, b: &Value) -> bool {
    match (as_f64(a), as_f64(b)) {
        (Some(x), Some(y)) => x < y,
        _ => match (a, b) { (Value::Str(x), Value::Str(y)) => x < y, _ => false },
    }
}

pub fn is_greater_than_or_equal(a: &Value, b: &Value) -> bool {
    is_greater_than(a, b) || is_equal(a, b)
}

pub fn is_less_than_or_equal(a: &Value, b: &Value) -> bool {
    is_less_than(a, b) || is_equal(a, b)
}

// ── type checks ─────────────────────────────────────────────────────────────

/// `is_true(x)` — polymorphic truthy check. The transpiler emits
/// `is_true(&X)` where `X` may be a `Value`, a `bool`, or the result of
/// any other predicate (`is_equal`, `in_op`, …). This trait lets all of
/// them work without manual conversion at the call site.
pub trait IsTruthy { fn truthy(&self) -> bool; }
impl IsTruthy for Value     { fn truthy(&self) -> bool { self.is_truthy() } }
impl IsTruthy for bool      { fn truthy(&self) -> bool { *self } }
impl IsTruthy for &Value    { fn truthy(&self) -> bool { (*self).is_truthy() } }
impl IsTruthy for &bool     { fn truthy(&self) -> bool { **self } }

pub fn is_true<T: IsTruthy + ?Sized>(v: &T) -> bool { v.truthy() }

pub fn is_array(v: &Value)    -> bool { matches!(v, Value::Arr(_)) }
pub fn is_object(v: &Value)   -> bool { matches!(v, Value::Dict(_)) }
pub fn is_string(v: &Value)   -> bool { matches!(v, Value::Str(_)) }
pub fn is_number(v: &Value)   -> bool { matches!(v, Value::Int(_) | Value::Float(_)) }
pub fn is_bool(v: &Value)     -> bool { matches!(v, Value::Bool(_)) }
pub fn is_integer(v: &Value)  -> bool { matches!(v, Value::Int(_)) }
pub fn is_function(_v: &Value)-> bool { false }

/// Convert a `catch_unwind` panic payload into the `Value::Str` shape
/// that transpiled `catch (e)` blocks expect. The transpiled code uses
/// this from the catch arm emitted by `rewriteTryCatchAsync` — kept in
/// the ccxt crate (rather than the test crate) so exchange files that
/// catch downstream panics (e.g. pacifica `try { approveBuilderCode }
/// catch { disable_builder_fee }`) can use it without a test-crate dep.
pub fn panic_to_value(payload: Box<dyn std::any::Any + Send>) -> Value {
    let msg = payload.downcast_ref::<String>().cloned()
        .or_else(|| payload.downcast_ref::<&str>().map(|s| (*s).to_string()))
        .unwrap_or_else(|| "panic".to_string());
    Value::Str(msg)
}

/// Parse a transpiled error payload (`"[Kind] message"`) into a typed
/// `ExchangeError`. Falls back to the generic `ExchangeError` kind when
/// the payload doesn't carry a leading `[Kind]` marker.
pub fn panic_msg_to_error(msg: &str) -> crate::ExchangeError {
    if let Some(start) = msg.find('[') {
        let after = &msg[start + 1..];
        if let Some(end) = after.find(']') {
            let kind = &after[..end];
            let rest = after[end + 1..].trim_start_matches(|c: char| c == ' ' || c == ':');
            return crate::ExchangeError::new(kind, rest);
        }
    }
    crate::ExchangeError::new("ExchangeError", msg)
}

/// Bridge an async exchange call's panic-based error convention onto Rust's
/// `Result`. The transpiled bodies use `panic!("[Kind] message")` (mirroring
/// the TS `throw new <Kind>(message)` pattern); the typed-wrapper layer
/// wraps every delegate call in this helper so its public surface is
/// idiomatic Rust (`Result<T, ExchangeError>`) rather than panicking.
pub async fn call_typed<F, T>(fut: F) -> crate::Result<T>
where
    F: std::future::Future<Output = T>,
{
    use futures::FutureExt;
    use std::panic::AssertUnwindSafe;
    match AssertUnwindSafe(fut).catch_unwind().await {
        Ok(v) => Ok(v),
        Err(payload) => {
            let msg = payload.downcast_ref::<String>().cloned()
                .or_else(|| payload.downcast_ref::<&str>().map(|s| (*s).to_string()))
                .unwrap_or_else(|| "panic".to_string());
            Err(panic_msg_to_error(&msg))
        }
    }
}

/// Mirrors TS `e instanceof <ClassName>`: panic payloads in the
/// transpiled tests are `Value::Str(format!("[{kind}] {message}"))`
/// (see `ExchangeError`'s `Display` impl), so the class name is whatever
/// sits between the first pair of square brackets. Matches the
/// expected-error-class names that broker-id and static-request tests
/// pass as `Value::Str("InvalidProxySettings")`.
pub fn is_instance(value: &Value, class: &Value) -> bool {
    let (msg, cls) = match (value, class) {
        (Value::Str(s), Value::Str(c)) => (s, c),
        _ => return false,
    };
    // Errors are stringified as `[Kind] message` (see ExchangeError's
    // Display). A direct `[cls]` hit covers the exact class and any
    // non-hierarchy class name.
    if msg.contains(&format!("[{cls}]")) {
        return true;
    }
    // Hierarchy-aware check: `[RateLimitExceeded]` IS-A `OperationFailed`.
    // Extract the actual class from the leading `[Kind]` and walk its
    // ancestor chain (errorHierarchy.ts) — without this, test_safe's
    // `is_instance(e, "OperationFailed")` retry/warn path never fires for
    // a rate-limit / network error and those get logged as failures.
    if let Some(actual) = extract_error_kind(msg) {
        let mut cur = error_parent(actual);
        while let Some(c) = cur {
            if c == cls.as_str() {
                return true;
            }
            cur = error_parent(c);
        }
    }
    false
}

/// Extracts the class name from the leading `[Kind]` of an error message.
fn extract_error_kind(msg: &str) -> Option<&str> {
    let start = msg.find('[')? + 1;
    let end = msg[start..].find(']')? + start;
    Some(&msg[start..end])
}

/// Parent class in the CCXT error hierarchy (mirrors
/// `ts/src/base/errorHierarchy.ts`). `None` for `BaseError` / unknowns.
fn error_parent(class: &str) -> Option<&'static str> {
    Some(match class {
        // ExchangeError branch
        "ExchangeError" => "BaseError",
        "AuthenticationError" => "ExchangeError",
        "PermissionDenied" => "AuthenticationError",
        "AccountNotEnabled" => "PermissionDenied",
        "AccountSuspended" => "AuthenticationError",
        "ArgumentsRequired" => "ExchangeError",
        "BadRequest" => "ExchangeError",
        "BadSymbol" => "BadRequest",
        "OperationRejected" => "ExchangeError",
        "NoChange" => "OperationRejected",
        "MarginModeAlreadySet" => "NoChange",
        "MarketClosed" => "OperationRejected",
        "ManualInteractionNeeded" => "OperationRejected",
        "RestrictedLocation" => "OperationRejected",
        "InsufficientFunds" => "ExchangeError",
        "InvalidAddress" => "ExchangeError",
        "AddressPending" => "InvalidAddress",
        "InvalidOrder" => "ExchangeError",
        "OrderNotFound" => "InvalidOrder",
        "OrderNotCached" => "InvalidOrder",
        "OrderImmediatelyFillable" => "InvalidOrder",
        "OrderNotFillable" => "InvalidOrder",
        "DuplicateOrderId" => "InvalidOrder",
        "ContractUnavailable" => "InvalidOrder",
        "NotSupported" => "ExchangeError",
        "InvalidProxySettings" => "ExchangeError",
        "ExchangeClosedByUser" => "ExchangeError",
        // OperationFailed branch
        "OperationFailed" => "BaseError",
        "NetworkError" => "OperationFailed",
        "DDoSProtection" => "NetworkError",
        "RateLimitExceeded" => "NetworkError",
        "ExchangeNotAvailable" => "NetworkError",
        "OnMaintenance" => "ExchangeNotAvailable",
        "InvalidNonce" => "NetworkError",
        "ChecksumError" => "InvalidNonce",
        "RequestTimeout" => "NetworkError",
        "BadResponse" => "OperationFailed",
        "NullResponse" => "BadResponse",
        "CancelPending" => "OperationFailed",
        "UnsubscribeError" => "BaseError",
        _ => return None,
    })
}

// ── element access ───────────────────────────────────────────────────────────

pub fn get_value(obj: &Value, key: &Value) -> Value {
    crate::value::get_value(obj, key)
}

/// Forge a `&mut Value` from a `&Value`. Used by the transpiler to
/// emit nested-key writes (`this.options['k1'][k2] = v` in TS) inside
/// `&self` parser methods like `bitstamp.parseCurrency` that accumulate
/// state into `self.options`. The naive `&mut self.options.clone()`
/// mutably borrows a temporary — the write never reaches `self.options`,
/// silently breaking the parser.
///
/// SAFETY: the caller must guarantee no concurrent readers of the same
/// `Value` exist. In CCXT's transpiled parsers the only reader is the
/// owning exchange (called sequentially from a single test or fetch),
/// so this is sound. Wraps the pointer cast in a function so the
/// `invalid_reference_casting` lint can be allowed in one place. Mirrors
/// `coerce_to_mut_unsafe` in `exchange_stubs.rs`.
#[allow(clippy::mut_from_ref, invalid_reference_casting)]
pub unsafe fn coerce_value_to_mut(v: &Value) -> &mut Value {
    let ptr = v as *const Value as *mut Value;
    &mut *ptr
}

pub fn get_value_mut<'a>(obj: &'a mut Value, key: &Value) -> &'a mut Value {
    match (obj, key) {
        (Value::Dict(m), Value::Str(k)) => Arc::make_mut(m).entry(k.clone()).or_insert(Value::Null),
        (Value::Arr(a), Value::Int(i)) => {
            let idx = *i as usize;
            let a = Arc::make_mut(a);
            while a.len() <= idx { a.push(Value::Null); }
            &mut a[idx]
        }
        (other, _) => other,
    }
}

pub fn add_element_to_object(obj: &mut Value, key: &Value, val: Value) {
    match (obj, key) {
        (Value::Dict(m), Value::Str(k)) => { Arc::make_mut(m).insert(k.clone(), val); }
        (Value::Dict(m), other) => { Arc::make_mut(m).insert(stringify_simple(other), val); }
        (Value::Arr(a), Value::Int(i)) => {
            let idx = *i as usize;
            let a = Arc::make_mut(a);
            while a.len() <= idx { a.push(Value::Null); }
            a[idx] = val;
        }
        _ => {}
    }
}

pub fn remove(obj: &mut Value, key: &Value) {
    match (obj, key) {
        (Value::Dict(m), Value::Str(k)) => { Arc::make_mut(m).shift_remove(k); }
        (Value::Arr(a), Value::Int(i)) => {
            let idx = *i as usize;
            let a = Arc::make_mut(a);
            if idx < a.len() { a.remove(idx); }
        }
        _ => {}
    }
}

/// `Array.prototype.shift()` — removes and returns the first element.
/// Called as a free function from transpiled WS code (`shift(stored)`).
/// Returns `Value::Null` if the array is empty or the target isn't an
/// array.
pub fn shift(mut arr: Value) -> Value {
    if let Value::Arr(a) = &mut arr {
        let inner = Arc::make_mut(a);
        if !inner.is_empty() { return inner.remove(0); }
    }
    Value::Null
}

pub fn in_op(obj: &Value, key: &Value) -> bool {
    match (obj, key) {
        (Value::Dict(m), Value::Str(k)) => m.contains_key(k),
        (Value::Arr(a), v) => a.iter().any(|x| is_equal(x, v)),
        _ => false,
    }
}

pub fn object_keys(v: &Value) -> Value {
    match v {
        Value::Dict(m) => Value::Array(m.keys().map(|k| Value::Str(k.clone())).collect()),
        _ => Value::Array(vec![]),
    }
}

pub fn object_values(v: &Value) -> Value {
    match v {
        Value::Dict(m) => Value::Array(m.values().cloned().collect()),
        _ => Value::Array(vec![]),
    }
}

pub fn get_array_length(v: &Value) -> Value {
    // Cache / order-book markers expose their rolling buffer via
    // `_data` / `_entries` — `cache.length` in TS refers to the
    // backing array, not the marker dict's keys. Look those up first
    // so `get_array_length(&cache)` reports the right number.
    if let Value::Dict(d) = v {
        if d.contains_key("__cacheKind") {
            if let Some(Value::Arr(data)) = d.get("_data") {
                return Value::Int(data.len() as i64);
            }
        }
        if d.contains_key("__sideKind") {
            if let Some(Value::Arr(entries)) = d.get("_entries") {
                return Value::Int(entries.len() as i64);
            }
        }
    }
    Value::Int(v.len() as i64)
}

pub fn get_index_of(haystack: &Value, needle: &Value) -> Value {
    match haystack {
        Value::Arr(a) => {
            for (i, item) in a.iter().enumerate() {
                if is_equal(item, needle) { return Value::Int(i as i64); }
            }
            Value::Int(-1)
        }
        Value::Str(s) => {
            if let Value::Str(n) = needle {
                match s.find(n.as_str()) {
                    Some(i) => Value::Int(i as i64),
                    None    => Value::Int(-1),
                }
            } else { Value::Int(-1) }
        }
        _ => Value::Int(-1),
    }
}

// ── JSON ────────────────────────────────────────────────────────────────────

pub fn json_parse(v: &Value) -> Value {
    match v {
        Value::Str(s) => match serde_json::from_str::<serde_json::Value>(s) {
            Ok(j)  => Value::from_json(&j),
            Err(_) => Value::Null,
        },
        _ => Value::Null,
    }
}

/// Wraps every JSON object number VALUE in quotes, replicating CCXT's
/// `onJsonResponse` transform `responseBody.replace(/":([+.0-9eE-]+)([,}])/g, '":"$1"$2')`
/// used when `quoteJsonNumbers` is on (the default). This preserves big
/// integer ids and high-precision decimals as strings through parsing,
/// matching how the unified parsers (safeString/safeNumber/Precise)
/// expect to read them. Only object values (a number right after `":`
/// and right before `,` or `}`) are quoted — array elements are left
/// alone, mirroring the upstream regex. Byte-oriented so multi-byte
/// UTF-8 in the surrounding text is preserved.
pub fn quote_json_numbers(s: &str) -> String {
    let b = s.as_bytes();
    let n = b.len();
    let mut out: Vec<u8> = Vec::with_capacity(n + 16);
    let mut i = 0;
    while i < n {
        if b[i] == b'"' && i + 1 < n && b[i + 1] == b':' {
            out.push(b'"');
            out.push(b':');
            let start = i + 2;
            let mut j = start;
            while j < n && matches!(b[j], b'+' | b'.' | b'0'..=b'9' | b'e' | b'E' | b'-') {
                j += 1;
            }
            if j > start && j < n && (b[j] == b',' || b[j] == b'}') {
                out.push(b'"');
                out.extend_from_slice(&b[start..j]);
                out.push(b'"');
                out.push(b[j]);
                i = j + 1;
                continue;
            }
            i += 2;
            continue;
        }
        out.push(b[i]);
        i += 1;
    }
    String::from_utf8(out).unwrap_or_else(|_| s.to_string())
}

pub fn json_stringify(v: &Value) -> Value {
    Value::Str(serde_json::to_string(&v.to_json()).unwrap_or_default())
}

// ── math ────────────────────────────────────────────────────────────────────

pub fn math_floor(v: &Value) -> Value {
    match as_f64(v) { Some(x) => Value::Float(x.floor()), None => Value::Null }
}
pub fn math_round(v: &Value) -> Value {
    match as_f64(v) { Some(x) => Value::Float(x.round()), None => Value::Null }
}
pub fn math_ceil(v: &Value) -> Value {
    match as_f64(v) { Some(x) => Value::Float(x.ceil()), None => Value::Null }
}

// ── misc ────────────────────────────────────────────────────────────────────

pub fn ternary(cond: bool, when_true: Value, when_false: Value) -> Value {
    if cond { when_true } else { when_false }
}

pub fn println_val(v: &Value) {
    println!("{v}");
}

/// Async equivalent of Promise.all — awaits all futures and collects results.
/// Currently a stub: takes a Value::Array and returns it unchanged.
pub async fn promise_all(v: &Value) -> Value {
    v.clone()
}

// ── variadic / array helpers ─────────────────────────────────────────────────

/// `get_arg(args, index, default)` — used by transpiled methods that accept
/// `params = []` variadic optional arguments.
pub fn get_arg(args: &[Value], idx: usize, default: Value) -> Value {
    args.get(idx).cloned().unwrap_or(default)
}

pub fn append_to_array(arr: &mut Value, v: Value) {
    if let Value::Arr(a) = arr {
        Arc::make_mut(a).push(v);
    }
}

pub fn concat_arrays(a: &Value, b: &Value) -> Value {
    match (a, b) {
        (Value::Arr(x), Value::Arr(y)) => {
            let mut out = (**x).clone();
            out.extend(y.iter().cloned());
            Value::Array(out)
        }
        _ => Value::Array(vec![]),
    }
}

// ── error constructors – re-exported so transpiled code can call them ───────

pub use crate::exchange_errors::*;
pub use crate::precise::Precise;

// ── Math (TS Math.min/max/abs/pow) ──────────────────────────────────────────

#[allow(non_snake_case)]
pub mod Math {
    use super::Value;
    use super::as_f64;
    pub fn min(a: &Value, b: &Value) -> Value {
        match (as_f64(a), as_f64(b)) { (Some(x), Some(y)) => Value::Float(x.min(y)), _ => Value::Null }
    }
    pub fn max(a: &Value, b: &Value) -> Value {
        match (as_f64(a), as_f64(b)) { (Some(x), Some(y)) => Value::Float(x.max(y)), _ => Value::Null }
    }
    pub fn abs(a: &Value) -> Value {
        match as_f64(a) { Some(x) => Value::Float(x.abs()), None => Value::Null }
    }
    pub fn pow(a: &Value, b: &Value) -> Value {
        match (as_f64(a), as_f64(b)) { (Some(x), Some(y)) => Value::Float(x.powf(y)), _ => Value::Null }
    }
    pub fn floor(v: &Value) -> Value { super::math_floor(v) }
    pub fn round(v: &Value) -> Value { super::math_round(v) }
    pub fn ceil(v: &Value)  -> Value { super::math_ceil(v) }
    pub fn log(v: &Value) -> Value {
        match as_f64(v) { Some(x) => Value::Float(x.ln()), None => Value::Null }
    }
}

// Allow `Math.min(...)` style access through a Math singleton with method
// syntax (transpiler emits `Math.X(...)` which becomes `Math::X(...)` only
// if the rust transpiler picks up FullPropertyAccessReplacements). Post-
// processing in build/rustTranspiler.ts converts `Math.X(...)` to
// `crate::runtime::Math::X(...)`.

/// `slice(value, start [, end])` — string and array slicing.
pub fn slice(v: &Value, start: &Value, end: &Value) -> Value {
    let s = as_i64(start).unwrap_or(0);
    let e_opt = as_i64(end);
    match v {
        Value::Str(s_val) => {
            let chars: Vec<char> = s_val.chars().collect();
            let len = chars.len() as i64;
            let si = if s < 0 { (len + s).max(0) as usize } else { (s as usize).min(chars.len()) };
            let ei = match e_opt {
                None => chars.len(),
                Some(n) => if n < 0 { (len + n).max(0) as usize } else { (n as usize).min(chars.len()) },
            };
            if si <= ei { Value::Str(chars[si..ei].iter().collect()) } else { Value::Str(String::new()) }
        }
        Value::Arr(a) => {
            let len = a.len() as i64;
            let si = if s < 0 { (len + s).max(0) as usize } else { (s as usize).min(a.len()) };
            let ei = match e_opt {
                None => a.len(),
                Some(n) => if n < 0 { (len + n).max(0) as usize } else { (n as usize).min(a.len()) },
            };
            if si <= ei { Value::Array(a[si..ei].to_vec()) } else { Value::Array(vec![]) }
        }
        _ => Value::Null,
    }
}

/// `join(array, separator)` — joins array elements into a string.
pub fn join(arr: &Value, sep: &Value) -> Value {
    let s = stringify_simple(sep);
    if let Value::Arr(a) = arr {
        let parts: Vec<String> = a.iter().map(stringify_simple).collect();
        Value::Str(parts.join(&s))
    } else { Value::Str(String::new()) }
}

/// Generic `.toString()` for Value.
pub fn to_string_val(v: &Value) -> Value {
    Value::Str(stringify_simple(v))
}

/// `parse_int(value)` — best-effort to integer.
pub fn parse_int(v: &Value) -> Value {
    match v {
        Value::Int(_)   => v.clone(),
        Value::Float(f) => Value::Int(*f as i64),
        Value::Str(s)   => s.trim().parse::<i64>().map(Value::Int).unwrap_or(Value::Null),
        _ => Value::Null,
    }
}

/// `parse_float(value)` — best-effort to float.
pub fn parse_float(v: &Value) -> Value {
    match v {
        Value::Float(_) => v.clone(),
        Value::Int(n)   => Value::Float(*n as f64),
        Value::Str(s)   => s.trim().parse::<f64>().map(Value::Float).unwrap_or(Value::Null),
        _ => Value::Null,
    }
}

/// `length(value)` — array / string / map length as i64 Value.
pub fn length(v: &Value) -> Value { get_array_length(v) }

/// `starts_with(haystack, prefix)` — true if Value haystack starts with prefix.
pub fn starts_with(haystack: &Value, prefix: &Value) -> bool {
    match (haystack, prefix) {
        (Value::Str(h), Value::Str(p)) => h.starts_with(p.as_str()),
        _ => false,
    }
}

/// `ends_with(haystack, suffix)` — true if Value haystack ends with suffix.
pub fn ends_with(haystack: &Value, suffix: &Value) -> bool {
    match (haystack, suffix) {
        (Value::Str(h), Value::Str(s)) => h.ends_with(s.as_str()),
        _ => false,
    }
}

/// `to_lower(s)` / `to_upper(s)` — string-case conversion (returns Value).
pub fn to_lower(v: &Value) -> Value {
    match v { Value::Str(s) => Value::Str(s.to_lowercase()), _ => Value::Null }
}
pub fn to_upper(v: &Value) -> Value {
    match v { Value::Str(s) => Value::Str(s.to_uppercase()), _ => Value::Null }
}

/// `trim(s)` — string trim.
pub fn trim(v: &Value) -> Value {
    match v { Value::Str(s) => Value::Str(s.trim().to_string()), _ => Value::Null }
}

/// `index_of(haystack, needle)` — alias for `get_index_of`.
pub fn index_of(haystack: &Value, needle: &Value) -> Value {
    get_index_of(haystack, needle)
}

/// `contains(haystack, needle)` — substring check for `Value::Str`,
/// element check for `Value::Array`. Used by the transpiled tests
/// for `string.includes(...)` / `array.includes(...)` (the regex
/// transpiler rewrites both into this free function).
pub fn contains(haystack: &Value, needle: &Value) -> bool {
    match (haystack, needle) {
        (Value::Str(h), Value::Str(n))   => h.contains(n.as_str()),
        (Value::Arr(a), n)             => a.iter().any(|el| is_equal(el, n)),
        _ => false,
    }
}

// ── Numeric / precision constants (mirrors decimal_to_precision.ts) ─────────

pub const TRUNCATE:  i64 = 0;
pub const ROUND:     i64 = 1;
pub const ROUND_UP:  i64 = 2;
pub const ROUND_DOWN: i64 = 3;
pub const DECIMAL_PLACES:       i64 = 2;
pub const SIGNIFICANT_DIGITS:   i64 = 3;
pub const TICK_SIZE: i64 = 4;
pub const NO_PADDING:           i64 = 5;
pub const PAD_WITH_ZERO:        i64 = 6;

/// `string_replace(s, old, new)` — string replacement.
pub fn string_replace(s: &Value, old: &Value, new_val: &Value) -> Value {
    match (s, old, new_val) {
        (Value::Str(s), Value::Str(o), Value::Str(n)) => Value::Str(s.replace(o.as_str(), n)),
        _ => s.clone(),
    }
}

/// `split(s, delim)` — string split returning Value::Array of Value::Str.
pub fn split(s: &Value, delim: &Value) -> Value {
    match (s, delim) {
        (Value::Str(s), Value::Str(d)) => {
            Value::Array(s.split(d.as_str()).map(|p| Value::Str(p.to_string())).collect())
        }
        _ => Value::Array(vec![]),
    }
}

/// `concat(a, b)` — generic concat: array+array or string+string.
pub fn concat(a: &Value, b: &Value) -> Value {
    match (a, b) {
        (Value::Arr(_), Value::Arr(_)) => concat_arrays(a, b),
        (Value::Str(x), Value::Str(y)) => Value::Str(format!("{x}{y}")),
        _ => Value::Null,
    }
}

/// `repeat(s, n)` — repeat string n times.
pub fn repeat(s: &Value, n: &Value) -> Value {
    let count = match as_i64(n) { Some(v) => v as usize, None => 0 };
    match s { Value::Str(s) => Value::Str(s.repeat(count)), _ => Value::Null }
}

/// RFC 4648 base32 decode (upper-case A–Z 2–7, `=` padding ignored). Unknown
/// characters (e.g. spaces already stripped by `totp`) are skipped.
fn base32_decode(s: &str) -> Vec<u8> {
    const ALPHA: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    let mut buf: u32 = 0;
    let mut bits: u32 = 0;
    let mut out = Vec::new();
    for c in s.bytes() {
        let up = c.to_ascii_uppercase();
        let val = match ALPHA.iter().position(|&x| x == up) {
            Some(v) => v as u32,
            None => continue,
        };
        buf = (buf << 5) | val;
        bits += 5;
        if bits >= 8 {
            bits -= 8;
            out.push((buf >> bits) as u8);
        }
    }
    out
}

/// `totp(secret)` — RFC 6238 time-based one-time password (HMAC-SHA1, 30s step,
/// 6 digits), mirroring `ts/src/base/functions/totp.ts`. The `secret` is a
/// base32 string (spaces allowed, as in "4TDV WOGO"). Returns `Value::Null` for
/// a non-string secret.
pub fn totp(secret: Value) -> Value {
    use hmac::{Hmac, Mac};
    use sha1::Sha1;
    let sec = match &secret {
        Value::Str(s) => s.replace(' ', ""),
        _ => return Value::Null,
    };
    let key = base32_decode(&sec);
    let epoch = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or(0);
    let counter: u64 = epoch / 30;
    let mut mac = match Hmac::<Sha1>::new_from_slice(&key) {
        Ok(m) => m,
        Err(_) => return Value::Null,
    };
    mac.update(&counter.to_be_bytes());
    let digest = mac.finalize().into_bytes(); // 20 bytes
    let offset = (digest[19] & 0x0f) as usize;
    let code = ((digest[offset] as u32 & 0x7f) << 24)
        | ((digest[offset + 1] as u32) << 16)
        | ((digest[offset + 2] as u32) << 8)
        | (digest[offset + 3] as u32);
    Value::Str(format!("{:06}", code % 1_000_000))
}

/// `encode(s)` — UTF-8 bytes of a string as a byte-array Value.
pub fn encode(s: Value) -> Value {
    match &s {
        Value::Str(st) => Value::Array(st.bytes().map(|b| Value::Int(b as i64)).collect()),
        Value::Arr(_) => s,
        _ => Value::Array(vec![]),
    }
}

/// Free-function `hash(data, algo, digest)` — used by transpiled crypto
/// code that imports `hash` from `base/functions/crypto.js`.
pub fn hash(data: Value, algo: Value, digest: Value) -> Value {
    let dbytes = crate::exchange::value_to_bytes(&data);
    let a = match &algo { Value::Str(s) => s.as_str(), _ => "sha256" };
    let dg = match &digest { Value::Str(s) => s.as_str(), _ => "hex" };
    let raw = crate::exchange::hash_raw(&dbytes, a);
    match dg {
        "binary" => Value::Array(raw.iter().map(|b| Value::Int(*b as i64)).collect()),
        "base64" => Value::Str(b64_encode(&raw)),
        _        => Value::Str(hex::encode(&raw)),
    }
}

/// Free-function `hmac(data, secret, algo, digest)`.
pub fn hmac(data: Value, secret: Value, algo: Value, digest: Value) -> Value {
    use hmac::{Hmac, Mac};
    let dbytes = crate::exchange::value_to_bytes(&data);
    let sbytes = crate::exchange::value_to_bytes(&secret);
    let a = match &algo { Value::Str(s) => s.to_ascii_lowercase(), _ => "sha256".to_string() };
    let dg = match &digest { Value::Str(s) => s.as_str(), _ => "hex" };
    let raw: Vec<u8> = match a.as_str() {
        "sha256" => { let mut m = Hmac::<sha2::Sha256>::new_from_slice(&sbytes).unwrap(); m.update(&dbytes); m.finalize().into_bytes().to_vec() }
        "sha512" => { let mut m = Hmac::<sha2::Sha512>::new_from_slice(&sbytes).unwrap(); m.update(&dbytes); m.finalize().into_bytes().to_vec() }
        "sha384" => { let mut m = Hmac::<sha2::Sha384>::new_from_slice(&sbytes).unwrap(); m.update(&dbytes); m.finalize().into_bytes().to_vec() }
        "sha1"   => { let mut m = Hmac::<sha1::Sha1>::new_from_slice(&sbytes).unwrap();   m.update(&dbytes); m.finalize().into_bytes().to_vec() }
        "md5"    => { let mut m = Hmac::<md5::Md5>::new_from_slice(&sbytes).unwrap();     m.update(&dbytes); m.finalize().into_bytes().to_vec() }
        _ => return Value::Null,
    };
    match dg {
        "binary" => Value::Array(raw.iter().map(|b| Value::Int(*b as i64)).collect()),
        "base64" => Value::Str(b64_encode(&raw)),
        _        => Value::Str(hex::encode(&raw)),
    }
}

/// `crc32(string, signed)` — IEEE CRC-32. With `signed = true` the u32 is
/// reinterpreted as a signed 32-bit integer.
pub fn crc32(s: Value, signed: Value) -> Value {
    let bytes = crate::exchange::value_to_bytes(&s);
    let mut crc: u32 = 0xFFFF_FFFF;
    for &b in &bytes {
        crc ^= b as u32;
        for _ in 0..8 {
            crc = if crc & 1 != 0 { (crc >> 1) ^ 0xEDB8_8320 } else { crc >> 1 };
        }
    }
    crc = !crc;
    if matches!(signed, Value::Bool(true)) {
        Value::Int(crc as i32 as i64)
    } else {
        Value::Int(crc as i64)
    }
}

/// `rsa(message, key, hash)` — RSA PKCS#1 v1.5 signature (SHA-256),
/// returned base64-encoded. `key` is a PKCS#1 PEM private key.
pub fn rsa(message: Value, key: Value, _hash: Value) -> Value {
    use rsa::RsaPrivateKey;
    use rsa::pkcs1::DecodeRsaPrivateKey;
    use rsa::pkcs1v15::SigningKey;
    use rsa::signature::{SignatureEncoding, Signer};
    let msg = crate::exchange::value_to_bytes(&message);
    let pem = String::from_utf8_lossy(&crate::exchange::value_to_bytes(&key)).into_owned();
    let pk = match RsaPrivateKey::from_pkcs1_pem(pem.trim()) {
        Ok(k) => k,
        Err(_) => return Value::Str(String::new()),
    };
    let signing_key = SigningKey::<sha2::Sha256>::new(pk);
    let sig = signing_key.sign(&msg);
    Value::Str(b64_encode(&sig.to_bytes()))
}

/// `ecdsa(message, secret, curve, preHash)` — secp256k1 ECDSA signature
/// with public-key recovery. Returns `{r, s, v}` (hex r/s, integer
/// recovery id). `message` is a hex digest (already hashed) unless
/// `preHash` names a hash algorithm to apply first.
pub fn ecdsa(message: Value, secret: Value, _curve: Value, pre_hash: Value) -> Value {
    use k256::ecdsa::SigningKey;
    let empty = || Value::Map(indexmap::IndexMap::new());
    let msg_s = match &message { Value::Str(s) => s.trim_start_matches("0x").to_string(), _ => return empty() };
    let sk_s  = match &secret  { Value::Str(s) => s.trim_start_matches("0x").to_string(), _ => return empty() };
    let sk_bytes = match hex::decode(&sk_s) { Ok(b) => b, Err(_) => return empty() };
    // The 32-byte digest to sign.
    let digest: Vec<u8> = match &pre_hash {
        Value::Str(algo) => crate::exchange::hash_raw(
            &crate::exchange::value_to_bytes(&message), algo),
        _ => match hex::decode(&msg_s) { Ok(b) => b, Err(_) => return empty() },
    };
    let sk = match SigningKey::from_slice(&sk_bytes) { Ok(k) => k, Err(_) => return empty() };
    let (sig, recid) = match sk.sign_prehash_recoverable(&digest) {
        Ok(x) => x,
        Err(_) => return empty(),
    };
    let bytes = sig.to_bytes(); // 64 bytes: r || s, low-S normalized
    let mut m = indexmap::IndexMap::new();
    m.insert("r".to_string(), Value::Str(hex::encode(&bytes[0..32])));
    m.insert("s".to_string(), Value::Str(hex::encode(&bytes[32..64])));
    m.insert("v".to_string(), Value::Int(recid.to_byte() as i64));
    Value::Map(m)
}

/// Strip PEM armor (`-----BEGIN…-----` / `-----END…-----`) and base64-decode the
/// body to DER bytes. Returns the input's raw base64 decode if there is no armor.
fn pem_to_der(pem: &str) -> Vec<u8> {
    use base64::{engine::general_purpose::STANDARD, Engine as _};
    let body: String = pem
        .lines()
        .filter(|l| !l.starts_with("-----"))
        .collect::<Vec<_>>()
        .join("");
    STANDARD.decode(body.trim()).unwrap_or_default()
}

/// `eddsa(request, secret, curve)` — Ed25519 signature, mirroring
/// `ts/src/base/functions/crypto.ts`. `request` is the message (already-bytes
/// `Value::Arr` as produced by `encode(...)`, or a hex/utf8 string); `secret` is
/// either a 32-byte raw seed string or a base64/PEM PKCS#8 key (seed at DER
/// offset 16). Returns the standard-base64 signature. Fails loudly (NotSupported
/// panic) rather than returning an empty/invalid signature.
pub fn eddsa(request: Value, secret: Value, _curve: Value) -> Value {
    use ed25519_dalek::{Signer, SigningKey};
    let bad = |why: &str| -> ! {
        panic!("{}", crate::exchange_errors::not_supported(
            Value::Str(format!("eddsa: {why}"))));
    };
    let msg: Vec<u8> = match &request {
        Value::Arr(_) => crate::exchange::value_to_bytes(&request),
        Value::Str(s) => {
            let t = s.trim_start_matches("0x");
            hex::decode(t).unwrap_or_else(|_| s.as_bytes().to_vec())
        }
        _ => bad("request must be bytes or a string"),
    };
    // The seed (32 bytes) comes in as either raw bytes (`Value::Arr`, e.g.
    // pacifica's base58-decoded key sliced to 32), a 32-char raw string, or a
    // base64/PEM PKCS#8 key (seed at DER offset 16).
    let seed: [u8; 32] = match &secret {
        Value::Arr(_) => {
            let b = crate::exchange::value_to_bytes(&secret);
            if b.len() >= 32 { b[..32].try_into().unwrap() } else { bad("seed shorter than 32 bytes") }
        }
        Value::Str(sec_s) if sec_s.len() == 32 => {
            sec_s.as_bytes().try_into().unwrap()
        }
        Value::Str(sec_s) => {
            let der = pem_to_der(sec_s);
            if der.len() >= 48 {
                der[16..48].try_into().unwrap()
            } else if der.len() >= 32 {
                der[der.len() - 32..].try_into().unwrap()
            } else {
                bad("secret is not a 32-byte seed or a decodable PKCS#8 key");
            }
        }
        _ => bad("secret must be a string or byte array"),
    };
    let sk = SigningKey::from_bytes(&seed);
    let sig = sk.sign(&msg);
    Value::Str(b64_encode(&sig.to_bytes()))
}

/// Standard base64.
fn b64_encode(data: &[u8]) -> String {
    use base64::{engine::general_purpose::STANDARD, Engine as _};
    STANDARD.encode(data)
}

/// URL-safe base64, no padding (the `urlencodeBase64` of CCXT).
fn b64url_encode(data: &[u8]) -> String {
    use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine as _};
    URL_SAFE_NO_PAD.encode(data)
}

/// `jwt(request, secret, algorithm, isRsa, opts)` — JSON Web Token.
/// HS256 (HMAC) or RS256 (RSA), signing `header.payload`.
pub fn jwt(request: Value, secret: Value, algorithm: Value, is_rsa: Value, _opts: Value) -> Value {
    let rsa_mode = matches!(is_rsa, Value::Bool(true));
    let bits = match algorithm.as_str() {
        Some("sha512") => "512",
        Some("sha384") => "384",
        _ => "256",
    };
    let alg = format!("{}{}", if rsa_mode { "RS" } else { "HS" }, bits);
    // Header keys must be in a fixed order — build the JSON literally.
    let header = format!("{{\"alg\":\"{alg}\",\"typ\":\"JWT\"}}");
    let payload = serde_json::to_string(&request.to_json()).unwrap_or_else(|_| "{}".to_string());
    let token = format!("{}.{}",
        b64url_encode(header.as_bytes()),
        b64url_encode(payload.as_bytes()));
    // Signature: standard base64 from rsa()/hmac(), then made URL-safe.
    let sig_std: String = if rsa_mode {
        match rsa(Value::Str(token.clone()), secret, algorithm) {
            Value::Str(s) => s,
            _ => String::new(),
        }
    } else {
        match hmac(encode(Value::Str(token.clone())), secret, algorithm,
                   Value::Str("base64".to_string())) {
            Value::Str(s) => s,
            _ => String::new(),
        }
    };
    let sig_url = sig_std.replace('+', "-").replace('/', "_")
        .trim_end_matches('=').to_string();
    Value::Str(format!("{token}.{sig_url}"))
}

/// `replace_str(s, old, new)` — string replacement, alias for string_replace.
pub fn replace_str(s: &Value, old: &Value, new_val: &Value) -> Value {
    string_replace(s, old, new_val)
}

/// `replace_all_str(s, old, new)` — replace every occurrence (TS String.replaceAll).
pub fn replace_all_str(s: &Value, old: &Value, new_val: &Value) -> Value {
    let (Value::Str(sv), Value::Str(ov), Value::Str(nv)) = (s, old, new_val) else {
        return s.clone();
    };
    Value::Str(sv.replace(ov, nv))
}

/// `Date.now()` — current Unix time in milliseconds.
pub fn date_now() -> Value {
    let ms = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_millis() as i64)
        .unwrap_or(0);
    Value::Int(ms)
}

/// `pad_start(s, len, pad)` / `pad_end` — left/right pad strings.
pub fn pad_start(s: &Value, len: &Value, pad: &Value) -> Value {
    let target = match as_i64(len) { Some(v) => v as usize, None => 0 };
    let p = match pad { Value::Str(p) => p.clone(), _ => " ".to_string() };
    match s {
        Value::Str(sv) => {
            if sv.chars().count() >= target { Value::Str(sv.clone()) }
            else {
                let need = target - sv.chars().count();
                Value::Str(format!("{}{}", p.repeat((need / p.chars().count().max(1)).max(1)), sv))
            }
        }
        _ => Value::Null,
    }
}

pub fn pad_end(s: &Value, len: &Value, pad: &Value) -> Value {
    let target = match as_i64(len) { Some(v) => v as usize, None => 0 };
    let p = match pad { Value::Str(p) => p.clone(), _ => " ".to_string() };
    match s {
        Value::Str(sv) => {
            if sv.chars().count() >= target { Value::Str(sv.clone()) }
            else {
                let need = target - sv.chars().count();
                Value::Str(format!("{}{}", sv, p.repeat((need / p.chars().count().max(1)).max(1))))
            }
        }
        _ => Value::Null,
    }
}

/// `to_fixed(x, digits)` — JS `Number.prototype.toFixed`: format a number
/// with a fixed number of decimal places, returned as a string.
pub fn to_fixed(x: &Value, digits: &Value) -> Value {
    let d = match as_i64(digits) { Some(v) => v.max(0) as usize, None => 0 };
    let n = match x {
        Value::Int(i) => *i as f64,
        Value::Float(f) => *f,
        Value::Str(s) => s.trim().parse::<f64>().unwrap_or(0.0),
        _ => 0.0,
    };
    Value::Str(format!("{:.*}", d, n))
}

// ── Value helpers used by transpiled code in HashMap-construction blocks ─────

/// Helper for transpiler-emitted code that builds `Value::Map`s — kept here
/// so the `use crate::runtime::*` glob doesn't need to import std collections.
pub fn empty_map() -> Value { Value::Map(HashMap::new()) }
pub fn empty_array() -> Value { Value::Array(vec![]) }
