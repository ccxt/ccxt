// Native Rust – hand-written Value type.
//
// The ast-transpiler emits `Value::Map(...)`, `Value::Str(...)`, etc.
// This module defines those variants so generated code compiles without
// requiring serde_json macros in every file.
//
// At the HTTP boundary (exchange.rs) we convert between Value and
// serde_json::Value for serialisation / deserialisation.

// Value::Map uses `IndexMap` (re-exported here as `HashMap` so the rest
// of the codebase — including transpiler-emitted `std::collections::
// HashMap::new()` calls swapped to `indexmap::IndexMap::new()` by a
// post-pass — keeps building literals via the same API). Insertion
// order matters for JSON / URL-encoded payloads: exchanges like bingx /
// digifinex / mexc reject (and the static request fixtures assert)
// specific key orders such as `{symbol,type,side,quantity,price}`.
pub use indexmap::IndexMap as HashMap;
use std::sync::Arc;

/// A dynamic value type that mirrors the CCXT JavaScript Value semantics.
///
/// `Dict`/`Arr` hold their containers behind an `Arc` so that `clone()` is
/// an O(1) refcount bump instead of a deep copy — the transpiled parsers
/// and the static-test assertions clone Values pervasively (every
/// `safeString`/`safeNumber`, every recursion level), which dominated
/// runtime. Mutation goes through `Arc::make_mut` (copy-on-write): it
/// only deep-copies when the container is actually shared.
///
/// NOTE: the variants are named `Dict`/`Arr`, but construction uses the
/// associated functions `Value::Map(..)` / `Value::Array(..)` /
/// `Value::List(..)` (which wrap the `Arc`) so the ~18k transpiler-emitted
/// `Value::Map({..})` / `Value::List(vec![..])` call sites need no change.
/// Pattern matches use `Value::Dict(..)` / `Value::Arr(..)`.
#[derive(Debug, Clone, PartialEq)]
pub enum Value {
    Null,
    Bool(bool),
    Int(i64),
    Float(f64),
    Str(String),
    Dict(Arc<HashMap<String, Value>>),
    Arr(Arc<Vec<Value>>),
}

impl Default for Value {
    fn default() -> Self {
        Value::Null
    }
}

impl Value {
    /// Mirrors TS `Precise.reduce()`: when this Value is a
    /// `Precise::new(...)` Map (carries the `__precise` marker), strip
    /// trailing zeros from `integer` and bump `decimals` down to match.
    /// Used by phemex's `to_en` after it shifts `decimals` by the
    /// market's `valueScale`: subtracts decimals, then reduce balances
    /// the integer side so the final `stringify_param` renders the
    /// scaled integer correctly (`0.1` × 10^8 → `10000000`).
    pub fn reduce(&mut self) {
        let m = match self { Value::Dict(m) if m.contains_key("__precise") => Arc::make_mut(m), _ => return };
        let mut decimals: i64 = match m.get("decimals") {
            Some(Value::Int(n)) => *n,
            _ => return,
        };
        let mut integer: String = match m.get("integer") {
            Some(Value::Str(s)) => s.clone(),
            _ => return,
        };
        // Negative decimals → pad zeros onto the integer.
        if decimals < 0 {
            // careful: a leading '-' (negative number) stays at the front.
            let (sign, digits) = if let Some(rest) = integer.strip_prefix('-') {
                ("-", rest.to_string())
            } else { ("", integer.clone()) };
            let padded = format!("{digits}{:0<width$}", "", width = (-decimals) as usize);
            integer = format!("{sign}{padded}");
            decimals = 0;
        }
        // Trim trailing zeros while there are decimal places to consume.
        while decimals > 0 && integer.ends_with('0') && integer.len() > 1 {
            integer.pop();
            decimals -= 1;
        }
        m.insert("integer".to_string(),  Value::Str(integer));
        m.insert("decimals".to_string(), Value::Int(decimals));
    }

    /// `append(item)` on an Array — pushes the item. Mirrors TS
    /// `array.push` shape (single arg, no return).
    ///
    /// On a WS-cache Map (carrying a `__cacheKind` marker — see the
    /// cache shims in `rust/tests/src/tests_support.rs`) it pushes to
    /// `_data` and updates the `hashmap` index keyed by the cache kind.
    pub fn append(&mut self, item: Value) {
        match self {
            Value::Arr(a) => Arc::make_mut(a).push(item),
            Value::Dict(m) if m.contains_key("__cacheKind") => {
                let m = Arc::make_mut(m);
                let kind = match m.get("__cacheKind") {
                    Some(Value::Str(s)) => s.clone(),
                    _ => String::new(),
                };
                if let Some(Value::Arr(data)) = m.get_mut("_data") {
                    Arc::make_mut(data).push(item.clone());
                }
                let get_str = |v: &Value, k: &str| -> Option<String> {
                    match v { Value::Dict(im) => match im.get(k) {
                        Some(Value::Str(s)) => Some(s.clone()), _ => None,
                    }, _ => None }
                };
                let symbol = get_str(&item, "symbol");
                let second = match kind.as_str() {
                    "ArrayCacheBySymbolById"   => get_str(&item, "id"),
                    "ArrayCacheBySymbolBySide" => get_str(&item, "side"),
                    _ => None,
                };
                if let (Some(sym), Some(key)) = (symbol, second) {
                    if let Some(Value::Dict(hm)) = m.get_mut("hashmap") {
                        let bucket = Arc::make_mut(hm).entry(sym)
                            .or_insert_with(|| Value::Map(HashMap::new()));
                        if let Value::Dict(bm) = bucket {
                            Arc::make_mut(bm).insert(key, item);
                        }
                    }
                }
            }
            _ => {}
        }
    }

    /// Constructor named to match the ast-transpiler's emission shape:
    /// `Value::List(vec![...])`. Aliases `Value::Array`. Note that this
    /// is a function, not a variant — so pattern matches still use
    /// `Value::Array(_)`, not `Value::List(_)`.
    #[allow(non_snake_case)]
    pub fn List(items: Vec<Value>) -> Value {
        Value::Arr(Arc::new(items))
    }

    /// Construction shim — the transpiler emits `Value::Map({..IndexMap..})`
    /// in ~18k places; this wraps the map in the `Arc` the `Dict` variant
    /// now holds. (An associated fn, not a variant — patterns use `Dict`.)
    #[allow(non_snake_case)]
    pub fn Map(m: HashMap<String, Value>) -> Value {
        Value::Dict(Arc::new(m))
    }

    /// Construction shim for `Value::Array(vec)` call sites.
    #[allow(non_snake_case)]
    pub fn Array(a: Vec<Value>) -> Value {
        Value::Arr(Arc::new(a))
    }

    // ── constructors ──────────────────────────────────────────────────────────

    pub fn str(s: impl Into<String>) -> Self {
        Value::Str(s.into())
    }

    pub fn int(n: i64) -> Self {
        Value::Int(n)
    }

    pub fn float(f: f64) -> Self {
        Value::Float(f)
    }

    pub fn bool(b: bool) -> Self {
        Value::Bool(b)
    }

    pub fn map(m: HashMap<String, Value>) -> Self {
        Value::Map(m)
    }

    pub fn array(a: Vec<Value>) -> Self {
        Value::Array(a)
    }

    // ── type checks ───────────────────────────────────────────────────────────

    pub fn is_null(&self)   -> bool { matches!(self, Value::Null) }
    pub fn is_str(&self)    -> bool { matches!(self, Value::Str(_)) }
    pub fn is_int(&self)    -> bool { matches!(self, Value::Int(_)) }
    pub fn is_float(&self)  -> bool { matches!(self, Value::Float(_)) }
    pub fn is_number(&self) -> bool { matches!(self, Value::Int(_) | Value::Float(_)) }
    pub fn is_bool(&self)   -> bool { matches!(self, Value::Bool(_)) }
    pub fn is_map(&self)    -> bool { matches!(self, Value::Dict(_)) }
    pub fn is_array(&self)  -> bool { matches!(self, Value::Arr(_)) }
    pub fn is_truthy(&self) -> bool {
        match self {
            Value::Null       => false,
            Value::Bool(b)    => *b,
            Value::Int(n)     => *n != 0,
            Value::Float(f)   => *f != 0.0,
            Value::Str(s)     => !s.is_empty(),
            Value::Dict(m)    => !m.is_empty(),
            Value::Arr(a)     => !a.is_empty(),
        }
    }

    // ── accessors ─────────────────────────────────────────────────────────────

    pub fn as_str(&self)   -> Option<&str>  { if let Value::Str(s) = self { Some(s) } else { None } }
    pub fn as_i64(&self)   -> Option<i64>   { if let Value::Int(n) = self { Some(*n) } else { None } }
    pub fn as_f64(&self)   -> Option<f64> {
        match self {
            Value::Float(f) => Some(*f),
            Value::Int(n)   => Some(*n as f64),
            _               => None,
        }
    }
    pub fn as_bool(&self)  -> Option<bool>  { if let Value::Bool(b) = self { Some(*b) } else { None } }
    pub fn as_map(&self)   -> Option<&HashMap<String, Value>> {
        if let Value::Dict(m) = self { Some(&**m) } else { None }
    }
    pub fn as_array(&self) -> Option<&Vec<Value>> {
        if let Value::Arr(a) = self { Some(&**a) } else { None }
    }

    /// Length of array, map, or string; 0 for everything else.
    /// String length counts Unicode chars (matches TS `String#length`
    /// closely enough for ASCII-only API addresses/identifiers).
    pub fn len(&self) -> usize {
        match self {
            Value::Arr(a)   => a.len(),
            Value::Dict(m)  => m.len(),
            Value::Str(s)   => s.chars().count(),
            _               => 0,
        }
    }

    pub fn is_empty(&self) -> bool { self.len() == 0 }

    // ── duck-typed method stubs that transpiled code calls on a Value ────
    // These exist so transpiled code that calls methods on Value-typed
    // locals (e.g. `parentRestInstance.describe()`) compiles. They return
    // `Value::Null` and are placeholders for richer dispatch.

    pub fn describe(&self) -> Value { Value::Null }
    pub fn reject<T, U>(&self, _err: T, _msg_hash: U) -> Value { Value::Null }
    pub fn resolve<T, U>(&self, _v: T, _msg_hash: U) -> Value { Value::Null }
    pub fn store_array(&self, _v: Value) {}
    pub fn append_to_array(&self, _v: Value) {}

    // ── conversion to / from serde_json ───────────────────────────────────────

    pub fn to_json(&self) -> serde_json::Value {
        match self {
            Value::Null        => serde_json::Value::Null,
            Value::Bool(b)     => serde_json::Value::Bool(*b),
            Value::Int(n)      => serde_json::json!(*n),
            Value::Float(f)    => serde_json::json!(*f),
            Value::Str(s)      => serde_json::Value::String(s.clone()),
            Value::Arr(a)      => serde_json::Value::Array(a.iter().map(Value::to_json).collect()),
            Value::Dict(m)     => serde_json::Value::Object(
                m.iter().map(|(k, v)| (k.clone(), v.to_json())).collect()
            ),
        }
    }

    pub fn from_json(v: &serde_json::Value) -> Self {
        match v {
            serde_json::Value::Null        => Value::Null,
            serde_json::Value::Bool(b)     => Value::Bool(*b),
            serde_json::Value::Number(n)   => {
                if let Some(i) = n.as_i64()  { Value::Int(i) }
                else if let Some(f) = n.as_f64() { Value::Float(f) }
                else { Value::Null }
            }
            serde_json::Value::String(s)   => Value::Str(s.clone()),
            serde_json::Value::Array(a)    => Value::Array(a.iter().map(Value::from_json).collect()),
            serde_json::Value::Object(m)   => Value::Map(
                m.iter().map(|(k, v)| (k.clone(), Value::from_json(v))).collect()
            ),
        }
    }
}

impl std::fmt::Display for Value {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Value::Null        => write!(f, "null"),
            Value::Bool(b)     => write!(f, "{b}"),
            Value::Int(n)      => write!(f, "{n}"),
            Value::Float(fl)   => write!(f, "{fl}"),
            Value::Str(s)      => write!(f, "{s}"),
            Value::Arr(a)      => write!(f, "[{} items]", a.len()),
            Value::Dict(m)     => write!(f, "{{{}  keys}}", m.len()),
        }
    }
}

// ── From / Into conversions ───────────────────────────────────────────────────

// Operator overloads so transpiled code's `!x`, `x && y`, `x || y` over
// Value compile. They follow JS-style truthiness on the Value, not value
// equality. Result type is `Value::Bool`.

impl std::ops::Not for Value {
    type Output = Value;
    fn not(self) -> Value { Value::Bool(!self.is_truthy()) }
}

impl std::ops::Not for &Value {
    type Output = Value;
    fn not(self) -> Value { Value::Bool(!self.is_truthy()) }
}

impl std::ops::BitAnd for Value {
    type Output = Value;
    fn bitand(self, rhs: Value) -> Value {
        Value::Bool(self.is_truthy() && rhs.is_truthy())
    }
}

impl std::ops::BitOr for Value {
    type Output = Value;
    fn bitor(self, rhs: Value) -> Value {
        Value::Bool(self.is_truthy() || rhs.is_truthy())
    }
}

impl From<&str>    for Value { fn from(s: &str)   -> Self { Value::Str(s.to_owned()) } }
impl From<String>  for Value { fn from(s: String) -> Self { Value::Str(s) } }
impl From<i64>     for Value { fn from(n: i64)    -> Self { Value::Int(n) } }
impl From<f64>     for Value { fn from(f: f64)    -> Self { Value::Float(f) } }
impl From<bool>    for Value { fn from(b: bool)   -> Self { Value::Bool(b) } }
impl From<HashMap<String, Value>> for Value {
    fn from(m: HashMap<String, Value>) -> Self { Value::Map(m) }
}
impl From<Vec<Value>> for Value {
    fn from(a: Vec<Value>) -> Self { Value::Array(a) }
}
impl From<serde_json::Value> for Value {
    fn from(v: serde_json::Value) -> Self { Value::from_json(&v) }
}

// ── Helper free-functions (generated code calls these) ────────────────────────

/// Optional live-snapshot accessor. Installed by `ccxt_tests::live_dispatch`
/// so reads of the heavy fields (`markets`, `markets_by_id`, `symbols`, …)
/// on the test-runner's snapshot don't deep-clone the entire ~4k-entry
/// markets Map on every helper invocation. When `get_value` sees a Map
/// carrying `__live_id`, it consults this callback to resolve the key
/// directly from the cached real `<Id>Core`. Production / non-test code
/// leaves the callback unset and falls through to the normal map lookup.
type LiveLookupFn = fn(id: &str, key: &str) -> Option<Value>;
// Plain atomic-load-style global — `tokio::main` spawns worker threads
// that wouldn't see a `thread_local!` value set in main, so the lookup
// has to be shared across all threads. Stored as a usize because
// `AtomicPtr<fn>` is awkward to express. `fn` pointers are always
// non-null when set; 0 means "not installed".
static LIVE_LOOKUP_PTR: std::sync::atomic::AtomicUsize =
    std::sync::atomic::AtomicUsize::new(0);

pub fn set_live_lookup(f: LiveLookupFn) {
    LIVE_LOOKUP_PTR.store(f as usize, std::sync::atomic::Ordering::Release);
}

fn live_lookup_get() -> Option<LiveLookupFn> {
    let n = LIVE_LOOKUP_PTR.load(std::sync::atomic::Ordering::Acquire);
    if n == 0 { None } else {
        // SAFETY: only ever stored as `fn(&str, &str) -> Option<Value>`
        // via `set_live_lookup`; the pointer-to-fn round-trip is sound.
        Some(unsafe { std::mem::transmute::<usize, LiveLookupFn>(n) })
    }
}

/// Access a value in a map by string key, or array by integer key encoded as
/// a `Value::Str` / `Value::Int`. Returns `Value::Null` on miss.
pub fn get_value(obj: &Value, key: &Value) -> Value {
    match (obj, key) {
        (Value::Dict(m), Value::Str(k)) => {
            // Snapshot value wins WHEN PRESENT AND NON-NULL. Tests that
            // mutate `exchange.options` (e.g. kucoin broker-id test) need
            // the snapshot view to take precedence; but `to_value`
            // pre-populates heavy fields like `markets` with `Null`
            // before `load_markets` runs, so we still need to fall back
            // to the live-lookup if the snapshot value is null.
            let snapshot_val = m.get(k);
            if let Some(v) = snapshot_val {
                if !matches!(v, Value::Null) {
                    return v.clone();
                }
            }
            if let Some(id_val) = m.get("__live_id") {
                if let (Value::Str(id), Some(cb)) = (id_val, live_lookup_get()) {
                    if let Some(v) = cb(id, k) { return v; }
                }
            }
            Value::Null
        }
        (Value::Arr(a), Value::Int(i)) => a.get(*i as usize).cloned().unwrap_or(Value::Null),
        (Value::Arr(a), Value::Str(k)) => {
            if let Ok(i) = k.parse::<usize>() {
                a.get(i).cloned().unwrap_or(Value::Null)
            } else {
                Value::Null
            }
        }
        // JS string indexing: `s[i]` returns the i-th character as a
        // 1-char string (e.g. bitfinex `amountString[0] === '-'` to detect
        // a negative). Char-based so multi-byte UTF-8 is handled.
        (Value::Str(s), Value::Int(i)) => {
            if *i < 0 {
                return Value::Null;
            }
            match s.chars().nth(*i as usize) {
                Some(c) => Value::Str(c.to_string()),
                None    => Value::Null,
            }
        }
        _ => Value::Null,
    }
}

/// Set a key/index in a map or array value.
pub fn set_value(obj: &mut Value, key: &Value, val: Value) {
    match (obj, key) {
        (Value::Dict(m), Value::Str(k)) => { Arc::make_mut(m).insert(k.clone(), val); }
        (Value::Arr(a), Value::Int(i)) => {
            let idx = *i as usize;
            let a = Arc::make_mut(a);
            if idx < a.len() { a[idx] = val; }
        }
        _ => {}
    }
}

// ── safeXxx helpers (mirrors Exchange.ts safe helpers) ─────────────────────

pub fn safe_string(obj: &Value, key: &str, default: Option<&str>) -> Option<String> {
    let v = get_value(obj, &Value::Str(key.to_owned()));
    match v {
        Value::Str(s)  => Some(s),
        Value::Int(n)  => Some(n.to_string()),
        Value::Float(f)=> Some(f.to_string()),
        Value::Bool(b) => Some(b.to_string()),
        Value::Null    => default.map(str::to_owned),
        _              => default.map(str::to_owned),
    }
}

pub fn safe_number(obj: &Value, key: &str, default: Option<f64>) -> Option<f64> {
    let v = get_value(obj, &Value::Str(key.to_owned()));
    match v {
        Value::Float(f) => Some(f),
        Value::Int(n)   => Some(n as f64),
        Value::Str(s)   => s.parse::<f64>().ok().or(default),
        _               => default,
    }
}

pub fn safe_integer(obj: &Value, key: &str, default: Option<i64>) -> Option<i64> {
    let v = get_value(obj, &Value::Str(key.to_owned()));
    match v {
        Value::Int(n)   => Some(n),
        Value::Float(f) => Some(f as i64),
        Value::Str(s)   => s.parse::<i64>().ok().or(default),
        _               => default,
    }
}

pub fn safe_bool(obj: &Value, key: &str, default: Option<bool>) -> Option<bool> {
    let v = get_value(obj, &Value::Str(key.to_owned()));
    match v {
        Value::Bool(b)  => Some(b),
        Value::Int(n)   => Some(n != 0),
        Value::Str(s)   => match s.to_lowercase().as_str() {
            "true" | "1" | "yes" => Some(true),
            "false"| "0" | "no"  => Some(false),
            _                    => default,
        },
        _               => default,
    }
}

/// Recursively merges `src` into `dst`.
/// For map/map overlaps the source fields win (deep extend).
pub fn deep_extend(dst: Value, src: Value) -> Value {
    match (dst, src) {
        (Value::Dict(mut d), Value::Dict(s)) => {
            let dm = Arc::make_mut(&mut d);
            let sm = Arc::try_unwrap(s).unwrap_or_else(|arc| (*arc).clone());
            for (k, v) in sm {
                let entry = dm.shift_remove(&k).unwrap_or(Value::Null);
                dm.insert(k, deep_extend(entry, v));
            }
            Value::Dict(d)
        }
        (_, src) => src,
    }
}
