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
    /// On a WS-cache Map (carrying a `__cacheKind` marker; see
    /// `crate::pro::cache`) it dispatches to the per-kind logic below.
    pub fn append(&mut self, item: Value) {
        match self {
            Value::Arr(a) => Arc::make_mut(a).push(item),
            Value::Dict(m) if m.contains_key("__cacheKind") => {
                cache_append(self, item);
            }
            _ => {}
        }
    }

    /// `clear()` — resets the rolling buffer for a cache marker (or
    /// truncates the inner array of an `Arr` value).
    pub fn clear(&mut self) {
        match self {
            Value::Arr(a) => Arc::make_mut(a).clear(),
            Value::Dict(m) if m.contains_key("__cacheKind") => {
                let m = Arc::make_mut(m);
                if let Some(Value::Arr(data)) = m.get_mut("_data") {
                    Arc::make_mut(data).clear();
                }
            }
            _ => {}
        }
    }

    /// `getLimit(symbol, limit)` for the cache markers. Returns the
    /// count of new updates since the last call (clamped by `limit`
    /// when supplied) and arms the per-symbol / global reset flag so
    /// the next `append` zeroes the counter.
    pub fn get_limit(&mut self, symbol: Value, limit: Value) -> Value {
        if matches!(self, Value::Dict(d) if d.contains_key("__cacheKind")) {
            cache_get_limit(self, symbol, limit)
        } else {
            limit
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
    pub fn reject(&self, _args: &[Value]) -> Value { Value::Null }
    pub fn resolve(&self, _args: &[Value]) -> Value { Value::Null }
    /// WS stub — transpiled `client.future(messageHash)` returns a
    /// promise. Until the Client/Future infra is ported, we just hand
    /// back `Value::Null` so the call sites type-check.
    pub fn future(&self, _args: &[Value]) -> Value { Value::Null }
    /// `client.reusable_future(messageHash)` — TS Client method that
    /// returns a shared Future per message-hash. Stubbed identically
    /// to `future` until the WS Client port lands.
    pub fn reusable_future(&self, _msg_hash: Value) -> Value { Value::Null }
    /// Field accessor: `cache.hashmap` — same as the WS Cache marker's
    /// hashmap sub-dict. Some transpiled WS code reads this directly
    /// via the JS field-access syntax rather than going through
    /// `get_value`.
    pub fn hashmap(&self) -> Value {
        if let Value::Dict(d) = self {
            if let Some(v) = d.get("hashmap") { return v.clone(); }
        }
        Value::Null
    }
    /// `client.send(payload)` — WS stub, no-op until Client port lands.
    pub fn send(&self, _args: &[Value]) -> Value { Value::Null }
    /// `client.decode_proto_msg(...)` — exchange-specific protobuf
    /// decode helper; stubbed to `Value::Null`.
    pub fn decode_proto_msg(&self, _args: &[Value]) -> Value { Value::Null }
    /// `client.on_pong(...)` — WS heartbeat hook; stubbed.
    pub fn on_pong(&self, _args: &[Value]) -> Value { Value::Null }
    /// WS stub — transpiled `fn(...args)` over a Value-typed callable.
    pub fn call(&self, _args: &[Value]) -> Value { Value::Null }
    /// `exchange.isDictionary(value)` — transpiled tests treat `exchange`
    /// as `Value` instead of the typed `Exchange`, so we mirror the
    /// dict-typecheck method here.
    pub fn is_dictionary(&self, value: Value) -> Value {
        Value::Bool(matches!(value, Value::Dict(_)))
    }
    /// Lifts this snapshot's `options` + `currencies` onto a throwaway base
    /// `Exchange` so the *transpiled* conversion methods can run against it.
    /// The afterConstruct test transpiles its call sites with `exchange:
    /// Value`, so these methods have to exist on `Value` — but the logic
    /// must stay in the transpiled base, not be duplicated here.
    #[cfg(feature = "transpiled-base")]
    fn snapshot_as_exchange(&self) -> crate::exchange::Exchange {
        let mut ex = crate::exchange::Exchange::new(None);
        ex.options = crate::runtime::get_value(self, &Value::Str("options".to_string()));
        ex.currencies = crate::runtime::get_value(self, &Value::Str("currencies".to_string()));
        ex
    }

    /// `exchange.networkCodeToId(code, currency)` on a snapshot `Value` —
    /// delegates to the transpiled `Exchange::network_code_to_id`.
    pub fn network_code_to_id(&self, code: Value, args: &[Value]) -> Value {
        #[cfg(feature = "transpiled-base")]
        {
            let currency = args.first().cloned().unwrap_or(Value::Null);
            return self.snapshot_as_exchange().network_code_to_id(code, &[currency]);
        }
        #[cfg(not(feature = "transpiled-base"))]
        {
            let _ = args;
            code
        }
    }

    /// `exchange.networkIdToCode(networkId, currency)` on a snapshot `Value`
    /// — delegates to the transpiled `Exchange::network_id_to_code`.
    pub fn network_id_to_code(&self, args: &[Value]) -> Value {
        #[cfg(feature = "transpiled-base")]
        {
            return self.snapshot_as_exchange().network_id_to_code(args);
        }
        #[cfg(not(feature = "transpiled-base"))]
        {
            let _ = args;
            Value::Null
        }
    }

    /// `exchange.extend(a, b, ...)` on a snapshot `Value` — CCXT's shallow
    /// object merge. Pure (ignores exchange state), so it delegates to the
    /// transpiled `Exchange::extend`. Used by the (prediction-aware) transpiled
    /// test harness, where `exchange` is a dynamic `Value` handle.
    pub fn extend(&self, a: Value, args: &[Value]) -> Value {
        #[cfg(feature = "transpiled-base")]
        {
            return self.snapshot_as_exchange().extend(a, args);
        }
        #[cfg(not(feature = "transpiled-base"))]
        {
            let _ = args;
            a
        }
    }

    /// `exchange.setMarkets(markets)` on a snapshot `Value` — used by the
    /// prediction test harness to seed event-derived markets. Delegates the
    /// indexing to the transpiled `Exchange::set_markets`, then writes the
    /// computed `markets`/`markets_by_id`/`symbols` back onto the `Value`
    /// handle so later `get_value(exchange, "markets")` reads see them.
    pub fn set_markets(&mut self, markets: Value) -> Value {
        #[cfg(feature = "transpiled-base")]
        {
            let mut ex = self.snapshot_as_exchange();
            let result = ex.set_markets(markets, &[]);
            crate::runtime::add_element_to_object(self, &Value::Str("markets".to_string()), ex.markets.clone());
            crate::runtime::add_element_to_object(self, &Value::Str("markets_by_id".to_string()), ex.markets_by_id.clone());
            crate::runtime::add_element_to_object(self, &Value::Str("symbols".to_string()), ex.symbols.clone());
            return result;
        }
        #[cfg(not(feature = "transpiled-base"))]
        {
            let _ = markets;
            Value::Null
        }
    }
    /// `side.storeArray(delta)` — insert/update/delete by price (or
    /// by id for the indexed variant). Defined here (rather than next
    /// to `store`) so that derived exchange code which calls
    /// `Value::store_array` on a non-side Value still compiles as a
    /// no-op.
    pub fn store_array(&mut self, delta: Value) {
        if side_kind(self).is_some() { side_store_array(self, delta); }
    }
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
/// `From<ExchangeError>` makes `error.clone()` flow into `&[Value]`
/// slices without an explicit conversion — surfaces the typed error
/// as a `[Kind] message`-shaped string Value, matching how
/// `runtime::panic_msg_to_error` round-trips it back into a typed
/// `ExchangeError` for the caller.
impl From<crate::ExchangeError> for Value {
    fn from(e: crate::ExchangeError) -> Self {
        Value::Str(format!("[{}] {}", e.kind, e.message))
    }
}
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

/// Hot-path `get_value` variant that takes the key as a `&str` directly,
/// skipping a `Value::Str` heap allocation. Used by the `safe_*_k`
/// fast-path readers the transpiler routes literal-key calls through.
#[inline]
pub fn get_value_k(obj: &Value, key: &str) -> Value {
    if let Value::Dict(m) = obj {
        if let Some(v) = m.get(key) {
            if !matches!(v, Value::Null) {
                return v.clone();
            }
        }
        if let Some(id_val) = m.get("__live_id") {
            if let (Value::Str(id), Some(cb)) = (id_val, live_lookup_get()) {
                if let Some(v) = cb(id, key) { return v; }
            }
        }
    }
    Value::Null
}

/// Access a value in a map by string key, or array by integer key encoded as
/// a `Value::Str` / `Value::Int`. Returns `Value::Null` on miss.
pub fn get_value(obj: &Value, key: &Value) -> Value {
    // Cache / order-book / side markers expose numeric indexing as if
    // they were arrays — `cache[i]` reads `_data[i]`, `side[i]` reads
    // `_entries[i]`. Handle this before the regular dict lookup so the
    // transpiled `get_value(&cache, &Value::Int(0))` calls reach the
    // right backing buffer.
    if let (Value::Dict(m), Value::Int(i)) = (obj, key) {
        if m.contains_key("__cacheKind") {
            if let Some(Value::Arr(data)) = m.get("_data") {
                return data.get(*i as usize).cloned().unwrap_or(Value::Null);
            }
        }
        if m.contains_key("__sideKind") {
            if let Some(Value::Arr(entries)) = m.get("_entries") {
                return entries.get(*i as usize).cloned().unwrap_or(Value::Null);
            }
        }
    }
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

// ────────────────────────────────────────────────────────────────────────────
// WS cache helpers — operate on the `Value::Dict` marker maps produced by
// `crate::pro::cache`. Logic mirrors `ts/src/base/ws/Cache.ts`.
// ────────────────────────────────────────────────────────────────────────────

fn cache_str_field(item: &Value, key: &str) -> Option<String> {
    match item {
        Value::Dict(d) => match d.get(key) {
            Some(Value::Str(s)) => Some(s.clone()),
            _ => None,
        },
        _ => None,
    }
}

fn cache_kind(v: &Value) -> Option<String> {
    match v {
        Value::Dict(d) => match d.get("__cacheKind") {
            Some(Value::Str(s)) => Some(s.clone()),
            _ => None,
        },
        _ => None,
    }
}

fn cache_max_size(v: &Value) -> Option<usize> {
    match v {
        Value::Dict(d) => match d.get("maxSize") {
            Some(Value::Int(n)) if *n > 0 => Some(*n as usize),
            _ => None,
        },
        _ => None,
    }
}

/// `_data` is the rolling buffer Vec for every cache kind. Returns a
/// mutable handle to the inner Vec by going through `Arc::make_mut`.
fn cache_data_mut(m: &mut HashMap<String, Value>) -> &mut Vec<Value> {
    let entry = m.entry("_data".to_string()).or_insert_with(|| Value::Array(Vec::new()));
    if let Value::Arr(a) = entry {
        return Arc::make_mut(a);
    }
    *entry = Value::Array(Vec::new());
    if let Value::Arr(a) = entry {
        return Arc::make_mut(a);
    }
    unreachable!()
}

fn cache_dict_field_mut<'a>(m: &'a mut HashMap<String, Value>, key: &str) -> &'a mut HashMap<String, Value> {
    let entry = m.entry(key.to_string()).or_insert_with(|| Value::Map(HashMap::new()));
    if let Value::Dict(d) = entry {
        return Arc::make_mut(d);
    }
    *entry = Value::Map(HashMap::new());
    if let Value::Dict(d) = entry {
        return Arc::make_mut(d);
    }
    unreachable!()
}

fn cache_int_field(m: &HashMap<String, Value>, key: &str) -> i64 {
    match m.get(key) { Some(Value::Int(n)) => *n, _ => 0 }
}

fn cache_set_int(m: &mut HashMap<String, Value>, key: &str, value: i64) {
    m.insert(key.to_string(), Value::Int(value));
}

fn cache_bool_field(m: &HashMap<String, Value>, key: &str) -> bool {
    matches!(m.get(key), Some(Value::Bool(true)))
}

fn cache_set_bool(m: &mut HashMap<String, Value>, key: &str, value: bool) {
    m.insert(key.to_string(), Value::Bool(value));
}

pub(crate) fn cache_append(target: &mut Value, item: Value) {
    let kind = cache_kind(target).unwrap_or_default();
    let cap = cache_max_size(target);
    if let Value::Dict(m_arc) = target {
        let m = Arc::make_mut(m_arc);
        match kind.as_str() {
            "ArrayCache" => {
                let data = cache_data_mut(m);
                if let Some(cap) = cap { if data.len() == cap { data.remove(0); } }
                data.push(item.clone());
                cache_reset_counters_if_needed(m, &item, /*by_id_set=*/ false, /*by_side_set=*/ false);
                let sym = cache_str_field(&item, "symbol").unwrap_or_default();
                {
                    let nubs = cache_dict_field_mut(m, "_newUpdatesBySymbol");
                    let cur = match nubs.get(&sym) { Some(Value::Int(n)) => *n, _ => 0 };
                    nubs.insert(sym, Value::Int(cur + 1));
                }
                let all = cache_int_field(m, "_allNewUpdates");
                cache_set_int(m, "_allNewUpdates", all + 1);
            }
            "ArrayCacheByTimestamp" => {
                let ts_key = match item {
                    Value::Arr(ref a) => match a.first() {
                        Some(Value::Int(n))   => n.to_string(),
                        Some(Value::Float(f)) => f.to_string(),
                        Some(Value::Str(s))   => s.clone(),
                        _ => String::new(),
                    },
                    _ => String::new(),
                };
                let existing_idx = {
                    let hm = cache_dict_field_mut(m, "hashmap");
                    match hm.get(&ts_key) { Some(Value::Int(n)) => Some(*n as usize), _ => None }
                };
                if let Some(idx) = existing_idx {
                    let data = cache_data_mut(m);
                    if idx < data.len() && data[idx] != item { data[idx] = item.clone(); }
                } else {
                    // Evict if at cap; shift hashmap indices down.
                    let evicting = match cap { Some(c) => {
                        let data_len = cache_data_mut(m).len();
                        data_len == c
                    }, None => false };
                    if evicting {
                        let removed = {
                            let data = cache_data_mut(m);
                            if data.is_empty() { Value::Null } else { data.remove(0) }
                        };
                        let removed_key = match &removed {
                            Value::Arr(a) => match a.first() {
                                Some(Value::Int(n))   => n.to_string(),
                                Some(Value::Float(f)) => f.to_string(),
                                Some(Value::Str(s))   => s.clone(),
                                _ => String::new(),
                            },
                            _ => String::new(),
                        };
                        let hm = cache_dict_field_mut(m, "hashmap");
                        hm.shift_remove(&removed_key);
                        for v in hm.values_mut() {
                            if let Value::Int(n) = v { *n = n.saturating_sub(1); }
                        }
                    }
                    let new_idx = {
                        let data = cache_data_mut(m);
                        let i = data.len();
                        data.push(item);
                        i
                    };
                    let hm = cache_dict_field_mut(m, "hashmap");
                    hm.insert(ts_key.clone(), Value::Int(new_idx as i64));
                }
                // size tracker / new updates
                if cache_bool_field(m, "_clearUpdates") {
                    cache_set_bool(m, "_clearUpdates", false);
                    let st = cache_dict_field_mut(m, "_sizeTracker");
                    st.clear();
                }
                {
                    let st = cache_dict_field_mut(m, "_sizeTracker");
                    st.insert(ts_key, Value::Bool(true));
                }
                let st_len = match m.get("_sizeTracker") {
                    Some(Value::Dict(d)) => d.len() as i64,
                    _ => 0,
                };
                cache_set_int(m, "_newUpdates", st_len);
            }
            "ArrayCacheBySymbolById" | "ArrayCacheBySymbolBySide" => {
                let symbol = cache_str_field(&item, "symbol").unwrap_or_default();
                let key2_name = if kind == "ArrayCacheBySymbolById" { "id" } else { "side" };
                let key2 = cache_str_field(&item, key2_name).unwrap_or_default();
                let was_duplicate = {
                    let hm = cache_dict_field_mut(m, "hashmap");
                    let bucket = hm.entry(symbol.clone())
                        .or_insert_with(|| Value::Map(HashMap::new()));
                    if let Value::Dict(bd) = bucket {
                        Arc::make_mut(bd);
                    }
                    if let Some(Value::Dict(bd)) = hm.get(&symbol) {
                        bd.contains_key(&key2)
                    } else { false }
                };
                let item_to_store = if was_duplicate {
                    let merged = {
                        let hm = cache_dict_field_mut(m, "hashmap");
                        let bucket = hm.get(&symbol).cloned();
                        let existing = match bucket {
                            Some(Value::Dict(bd)) => bd.get(&key2).cloned(),
                            _ => None,
                        };
                        match (existing, item.clone()) {
                            (Some(Value::Dict(old)), Value::Dict(new_)) => {
                                let mut merged = (*old).clone();
                                for (k, v) in new_.iter() { merged.insert(k.clone(), v.clone()); }
                                Value::Dict(Arc::new(merged))
                            }
                            (_, new_) => new_,
                        }
                    };
                    {
                        let hm = cache_dict_field_mut(m, "hashmap");
                        let bucket = hm.entry(symbol.clone())
                            .or_insert_with(|| Value::Map(HashMap::new()));
                        if let Value::Dict(bd) = bucket {
                            Arc::make_mut(bd).insert(key2.clone(), merged.clone());
                        }
                    }
                    // Remove the existing slot from _data.
                    {
                        let data = cache_data_mut(m);
                        if let Some(pos) = data.iter().position(|x| {
                            cache_str_field(x, key2_name).as_deref() == Some(&key2)
                                && cache_str_field(x, "symbol").as_deref() == Some(&symbol)
                        }) { data.remove(pos); }
                    }
                    merged
                } else {
                    let hm = cache_dict_field_mut(m, "hashmap");
                    let bucket = hm.entry(symbol.clone())
                        .or_insert_with(|| Value::Map(HashMap::new()));
                    if let Value::Dict(bd) = bucket {
                        Arc::make_mut(bd).insert(key2.clone(), item.clone());
                    }
                    item.clone()
                };
                // Evict from front if at cap.
                let evicting = match cap { Some(c) => {
                    cache_data_mut(m).len() == c
                }, None => false };
                if evicting {
                    let removed = {
                        let data = cache_data_mut(m);
                        if data.is_empty() { Value::Null } else { data.remove(0) }
                    };
                    let r_sym = cache_str_field(&removed, "symbol").unwrap_or_default();
                    let r_key2 = cache_str_field(&removed, key2_name).unwrap_or_default();
                    let hm = cache_dict_field_mut(m, "hashmap");
                    if let Some(Value::Dict(bd)) = hm.get_mut(&r_sym) {
                        Arc::make_mut(bd).shift_remove(&r_key2);
                    }
                }
                cache_data_mut(m).push(item_to_store);

                // Per-symbol Set-based update tracking.
                cache_reset_counters_if_needed(m, &item, /*by_id_set=*/ kind == "ArrayCacheBySymbolById", /*by_side_set=*/ kind == "ArrayCacheBySymbolBySide");
                let before;
                let after;
                {
                    let nubs = cache_dict_field_mut(m, "_newUpdatesBySymbol");
                    let bucket = nubs.entry(symbol.clone())
                        .or_insert_with(|| Value::Map(HashMap::new()));
                    if let Value::Dict(bd) = bucket {
                        let bd = Arc::make_mut(bd);
                        before = bd.len() as i64;
                        bd.insert(key2.clone(), Value::Bool(true));
                        after = bd.len() as i64;
                    } else { before = 0; after = 0; }
                }
                let all = cache_int_field(m, "_allNewUpdates");
                cache_set_int(m, "_allNewUpdates", all + (after - before));
            }
            _ => {}
        }
    }
}

fn cache_reset_counters_if_needed(m: &mut HashMap<String, Value>, item: &Value, by_id_set: bool, by_side_set: bool) {
    if cache_bool_field(m, "_clearAllUpdates") {
        cache_set_bool(m, "_clearAllUpdates", false);
        cache_dict_field_mut(m, "_clearUpdatesBySymbol").clear();
        cache_set_int(m, "_allNewUpdates", 0);
        cache_dict_field_mut(m, "_newUpdatesBySymbol").clear();
    }
    let sym = cache_str_field(item, "symbol").unwrap_or_default();
    let pending = {
        let cs = cache_dict_field_mut(m, "_clearUpdatesBySymbol");
        matches!(cs.get(&sym), Some(Value::Bool(true)))
    };
    if pending {
        cache_dict_field_mut(m, "_clearUpdatesBySymbol")
            .insert(sym.clone(), Value::Bool(false));
        let by_set = by_id_set || by_side_set;
        let nubs = cache_dict_field_mut(m, "_newUpdatesBySymbol");
        if by_set {
            if let Some(Value::Dict(bd)) = nubs.get_mut(&sym) {
                Arc::make_mut(bd).clear();
            }
        } else {
            nubs.insert(sym, Value::Int(0));
        }
    }
}

pub(crate) fn cache_get_limit(target: &mut Value, symbol: Value, limit: Value) -> Value {
    let kind = cache_kind(target).unwrap_or_default();
    let nested_set = matches!(kind.as_str(), "ArrayCacheBySymbolById" | "ArrayCacheBySymbolBySide");
    if let Value::Dict(m_arc) = target {
        let m = Arc::make_mut(m_arc);
        // `ArrayCacheByTimestamp` doesn't track per-symbol updates —
        // both `getLimit(undefined, …)` and `getLimit(sym, …)` return
        // `this.newUpdates` and arm a single global `clearUpdates` flag.
        if kind == "ArrayCacheByTimestamp" {
            let v = cache_int_field(m, "_newUpdates");
            cache_set_bool(m, "_clearUpdates", true);
            return match limit {
                Value::Int(l) => Value::Int(v.min(l)),
                _             => Value::Int(v),
            };
        }
        let new_updates_value: Option<i64> = match &symbol {
            Value::Null => {
                cache_set_bool(m, "_clearAllUpdates", true);
                Some(cache_int_field(m, "_allNewUpdates"))
            }
            Value::Str(sym) => {
                let nubs = cache_dict_field_mut(m, "_newUpdatesBySymbol");
                let v = match nubs.get(sym) {
                    Some(Value::Int(n)) => Some(*n),
                    Some(Value::Dict(bd)) if nested_set => Some(bd.len() as i64),
                    _ => None,
                };
                cache_dict_field_mut(m, "_clearUpdatesBySymbol")
                    .insert(sym.clone(), Value::Bool(true));
                v
            }
            _ => None,
        };
        match (new_updates_value, &limit) {
            (None,    _)              => limit.clone(),
            (Some(v), Value::Int(l))  => Value::Int(v.min(*l)),
            (Some(v), Value::Null)    => Value::Int(v),
            (Some(v), _)              => Value::Int(v),
        }
    } else {
        limit
    }
}

// ────────────────────────────────────────────────────────────────────────────
// WS order-book helpers — operate on the `Value::Dict` markers from
// `crate::pro::order_book`. Tag layout:
//   * `__bookKind`  ∈ {OrderBook, IndexedOrderBook, CountedOrderBook}
//   * `__sideKind`  ∈ {OrderBookSide, IndexedOrderBookSide,
//                      CountedOrderBookSide}  (carried under `bids`/`asks`)
// ────────────────────────────────────────────────────────────────────────────

fn as_f64(v: &Value) -> f64 {
    match v {
        Value::Float(f) => *f,
        Value::Int(n)   => *n as f64,
        Value::Str(s)   => s.parse().unwrap_or(0.0),
        _ => 0.0,
    }
}

fn book_kind(v: &Value) -> Option<String> {
    match v { Value::Dict(d) => match d.get("__bookKind") {
        Some(Value::Str(s)) => Some(s.clone()), _ => None,
    }, _ => None }
}

fn side_kind(v: &Value) -> Option<String> {
    match v { Value::Dict(d) => match d.get("__sideKind") {
        Some(Value::Str(s)) => Some(s.clone()), _ => None,
    }, _ => None }
}

fn side_is_bid(m: &HashMap<String, Value>) -> bool {
    matches!(m.get("_isBid"), Some(Value::Bool(true)))
}

fn side_depth(m: &HashMap<String, Value>) -> usize {
    match m.get("_depth") {
        Some(Value::Int(n)) if *n > 0 => *n as usize,
        _ => usize::MAX / 2,
    }
}

fn side_entries_mut(m: &mut HashMap<String, Value>) -> &mut Vec<Value> {
    let entry = m.entry("_entries".to_string()).or_insert_with(|| Value::Array(Vec::new()));
    if let Value::Arr(a) = entry { return Arc::make_mut(a); }
    *entry = Value::Array(Vec::new());
    if let Value::Arr(a) = entry { return Arc::make_mut(a); }
    unreachable!()
}

fn entry_at_price(entries: &[Value]) -> impl Fn(usize) -> f64 + '_ {
    move |i: usize| match &entries[i] {
        Value::Arr(a) => match a.first() { Some(v) => as_f64(v), None => 0.0 },
        _ => 0.0,
    }
}

fn bisect_left_by(len: usize, target: f64, is_bid: bool, get_price: impl Fn(usize) -> f64) -> usize {
    let mut lo = 0usize;
    let mut hi = len;
    while lo < hi {
        let mid = (lo + hi) / 2;
        let p = get_price(mid);
        let ip = if is_bid { -p } else { p };
        if ip < target { lo = mid + 1; } else { hi = mid; }
    }
    lo
}

fn delta_field<T>(d: &Value, idx: usize, parse: impl Fn(&Value) -> T, default: T) -> T {
    match d {
        Value::Arr(a) => match a.get(idx) { Some(v) => parse(v), None => default },
        _ => default,
    }
}

fn entry_id(entries: &[Value], i: usize) -> String {
    if let Value::Arr(a) = &entries[i] {
        if let Some(v) = a.get(2) {
            return match v {
                Value::Str(s) => s.clone(),
                Value::Int(n) => n.to_string(),
                _ => String::new(),
            };
        }
    }
    String::new()
}

fn side_store_array(side: &mut Value, delta: Value) {
    let kind = side_kind(side).unwrap_or_default();
    let d = match side { Value::Dict(d) => d, _ => return };
    let m = Arc::make_mut(d);
    let is_bid = side_is_bid(m);
    match kind.as_str() {
        "OrderBookSide" => {
            let price = delta_field(&delta, 0, as_f64, 0.0);
            let size  = delta_field(&delta, 1, as_f64, 0.0);
            let target = if is_bid { -price } else { price };
            let entries = side_entries_mut(m);
            let entries_view: Vec<Value> = entries.iter().cloned().collect();
            let idx = bisect_left_by(entries.len(), target, is_bid, entry_at_price(&entries_view));
            if size != 0.0 {
                if idx < entries.len()
                    && {
                        let p = match &entries[idx] {
                            Value::Arr(a) => a.first().map(as_f64).unwrap_or(0.0),
                            _ => 0.0,
                        };
                        (if is_bid { -p } else { p }) == target
                    }
                {
                    entries[idx] = delta;
                } else {
                    entries.insert(idx, delta);
                }
            } else if idx < entries.len() {
                let p = match &entries[idx] {
                    Value::Arr(a) => a.first().map(as_f64).unwrap_or(0.0),
                    _ => 0.0,
                };
                if (if is_bid { -p } else { p }) == target { entries.remove(idx); }
            }
        }
        "CountedOrderBookSide" => {
            let price = delta_field(&delta, 0, as_f64, 0.0);
            let size  = delta_field(&delta, 1, as_f64, 0.0);
            let count = delta_field(&delta, 2, as_f64, 0.0);
            let target = if is_bid { -price } else { price };
            let entries = side_entries_mut(m);
            let entries_view: Vec<Value> = entries.iter().cloned().collect();
            let idx = bisect_left_by(entries.len(), target, is_bid, entry_at_price(&entries_view));
            if size != 0.0 && count != 0.0 {
                if idx < entries.len()
                    && {
                        let p = match &entries[idx] {
                            Value::Arr(a) => a.first().map(as_f64).unwrap_or(0.0),
                            _ => 0.0,
                        };
                        (if is_bid { -p } else { p }) == target
                    }
                {
                    entries[idx] = delta;
                } else {
                    entries.insert(idx, delta);
                }
            } else if idx < entries.len() {
                let p = match &entries[idx] {
                    Value::Arr(a) => a.first().map(as_f64).unwrap_or(0.0),
                    _ => 0.0,
                };
                if (if is_bid { -p } else { p }) == target { entries.remove(idx); }
            }
        }
        "IndexedOrderBookSide" => {
            let price_opt = match &delta {
                Value::Arr(a) => a.first().and_then(|v| match v {
                    Value::Float(f) => Some(*f),
                    Value::Int(n)   => Some(*n as f64),
                    _ => None,
                }),
                _ => None,
            };
            let size = delta_field(&delta, 1, as_f64, 0.0);
            let id = match &delta {
                Value::Arr(a) => match a.get(2) {
                    Some(Value::Str(s)) => s.clone(),
                    Some(Value::Int(n)) => n.to_string(),
                    _ => String::new(),
                },
                _ => String::new(),
            };
            let mut index_price = price_opt.map(|p| if is_bid { -p } else { p });
            let old_price_opt = {
                if let Some(Value::Dict(hm)) = m.get("hashmap") {
                    match hm.get(&id) {
                        Some(Value::Float(f)) => Some(*f),
                        Some(Value::Int(n))   => Some(*n as f64),
                        _ => None,
                    }
                } else { None }
            };
            if size != 0.0 {
                if let Some(old_price) = old_price_opt {
                    index_price = index_price.or(Some(old_price));
                    if Some(old_price) == index_price {
                        // Find slot by walking from bisect_left
                        let target = old_price;
                        let entries = side_entries_mut(m);
                        let entries_view: Vec<Value> = entries.iter().cloned().collect();
                        let mut idx = bisect_left_by(entries.len(), target, is_bid, entry_at_price(&entries_view));
                        while idx < entries.len() && entry_id(entries, idx) != id { idx += 1; }
                        if idx < entries.len() { entries[idx] = delta; }
                        return;
                    }
                    // Different price — remove old slot
                    let target = old_price;
                    let entries = side_entries_mut(m);
                    let entries_view: Vec<Value> = entries.iter().cloned().collect();
                    let mut old_idx = bisect_left_by(entries.len(), target, is_bid, entry_at_price(&entries_view));
                    while old_idx < entries.len() && entry_id(entries, old_idx) != id { old_idx += 1; }
                    if old_idx < entries.len() { entries.remove(old_idx); }
                }
                let target = match index_price { Some(p) => p, None => return };
                // Insert sorted with secondary id tiebreaker
                let entries = side_entries_mut(m);
                let entries_view: Vec<Value> = entries.iter().cloned().collect();
                let mut idx = bisect_left_by(entries.len(), target, is_bid, entry_at_price(&entries_view));
                while idx < entries.len() {
                    let p = match &entries[idx] {
                        Value::Arr(a) => a.first().map(as_f64).unwrap_or(0.0),
                        _ => 0.0,
                    };
                    let ip = if is_bid { -p } else { p };
                    if ip != target { break; }
                    if entry_id(entries, idx) >= id { break; }
                    idx += 1;
                }
                entries.insert(idx, delta);
                if let Some(Value::Dict(hm_arc)) = m.get_mut("hashmap") {
                    Arc::make_mut(hm_arc).insert(id, Value::Float(target));
                }
            } else if let Some(old_price) = old_price_opt {
                // Delete by id
                let target = old_price;
                let entries = side_entries_mut(m);
                let entries_view: Vec<Value> = entries.iter().cloned().collect();
                let mut idx = bisect_left_by(entries.len(), target, is_bid, entry_at_price(&entries_view));
                while idx < entries.len() && entry_id(entries, idx) != id { idx += 1; }
                if idx < entries.len() { entries.remove(idx); }
                if let Some(Value::Dict(hm_arc)) = m.get_mut("hashmap") {
                    Arc::make_mut(hm_arc).shift_remove(&id);
                }
            }
        }
        _ => {}
    }
}

fn side_limit(side: &mut Value) {
    let d = match side { Value::Dict(d) => d, _ => return };
    let m = Arc::make_mut(d);
    let depth = side_depth(m);
    let entries = side_entries_mut(m);
    if entries.len() > depth { entries.truncate(depth); }
}

fn book_reseed_sides(book: &mut Value, snapshot: &Value) {
    let kind = book_kind(book).unwrap_or_default();
    let side_kind_str = match kind.as_str() {
        "IndexedOrderBook" => "IndexedOrderBookSide",
        "CountedOrderBook" => "CountedOrderBookSide",
        _                  => "OrderBookSide",
    };
    let bids_deltas = crate::get_value(snapshot, &Value::Str("bids".to_string()));
    let asks_deltas = crate::get_value(snapshot, &Value::Str("asks".to_string()));
    if let Value::Dict(book_arc) = book {
        let book_m = Arc::make_mut(book_arc);
        let depth = match book_m.get("_depth") {
            Some(Value::Int(n)) => *n,
            _ => i64::MAX / 2,
        };
        // Rebuild bids
        for (side_key, deltas, is_bid) in [
            ("bids", &bids_deltas, true),
            ("asks", &asks_deltas, false),
        ] {
            let mut m = HashMap::new();
            m.insert("__sideKind".to_string(),  Value::Str(side_kind_str.to_string()));
            m.insert("_isBid".to_string(),      Value::Bool(is_bid));
            m.insert("_depth".to_string(),      Value::Int(depth));
            m.insert("_entries".to_string(),    Value::Array(Vec::new()));
            m.insert("hashmap".to_string(),    Value::Map(HashMap::new()));
            let mut side = Value::Map(m);
            if let Value::Arr(rows) = deltas {
                for row in rows.iter() {
                    if let Value::Arr(_) = row { side_store_array(&mut side, row.clone()); }
                }
            }
            book_m.insert(side_key.to_string(), side);
        }
    }
}

pub(crate) fn book_limit(book: &mut Value) {
    if book_kind(book).is_none() { return; }
    if let Value::Dict(arc) = book {
        let m = Arc::make_mut(arc);
        if let Some(side) = m.get_mut("bids") { side_limit(side); }
        if let Some(side) = m.get_mut("asks") { side_limit(side); }
    }
}

pub(crate) fn book_reset(book: &mut Value, snapshot: Value) {
    if book_kind(book).is_none() { return; }
    book_reseed_sides(book, &snapshot);
    if let Value::Dict(arc) = book {
        let m = Arc::make_mut(arc);
        let ts = match crate::get_value(&snapshot, &Value::Str("timestamp".to_string())) {
            Value::Int(n)   => Some(n),
            Value::Float(f) => Some(f as i64),
            _ => None,
        };
        let dt = ts.and_then(|n| chrono::DateTime::<chrono::Utc>::from_timestamp_millis(n)
            .map(|t| t.to_rfc3339_opts(chrono::SecondsFormat::Millis, true)));
        m.insert("timestamp".to_string(), ts.map(Value::Int).unwrap_or(Value::Null));
        m.insert("datetime".to_string(),  dt.map(Value::Str).unwrap_or(Value::Null));
        m.insert("nonce".to_string(),     crate::get_value(&snapshot, &Value::Str("nonce".to_string())));
        m.insert("symbol".to_string(),    crate::get_value(&snapshot, &Value::Str("symbol".to_string())));
    }
}

pub(crate) fn book_update(book: &mut Value, snapshot: Value) {
    if book_kind(book).is_none() { return; }
    // Skip stale updates.
    let new_nonce = match crate::get_value(&snapshot, &Value::Str("nonce".to_string())) {
        Value::Int(n) => Some(n), _ => None,
    };
    let cur_nonce = match book { Value::Dict(d) => match d.get("nonce") {
        Some(Value::Int(n)) => Some(*n), _ => None,
    }, _ => None };
    if let (Some(n), Some(cur)) = (new_nonce, cur_nonce) {
        if n <= cur { return; }
    }
    book_reset(book, snapshot);
}

pub(crate) fn book_store_array_side(book: &mut Value, side_key: &str, delta: Value) {
    if let Value::Dict(arc) = book {
        let m = Arc::make_mut(arc);
        if let Some(side) = m.get_mut(side_key) {
            side_store_array(side, delta);
        }
    }
}

pub(crate) fn book_store_side(book: &mut Value, side_key: &str, price: f64, size: f64) {
    let delta = Value::List(vec![Value::Float(price), Value::Float(size)]);
    book_store_array_side(book, side_key, delta);
}

// ─── Value method API exposed to the transpiled tests ─────────────────────

impl Value {
    /// `book.limit()` — trim both sides to `_depth`. Returns a clone
    /// of `self` so transpiled `return book.limit();` lines still
    /// match the `-> Value` signature.
    pub fn limit(&mut self) -> Value {
        book_limit(self);
        self.clone()
    }

    /// `book.reset(snapshot)` — wipe + reseed bids/asks + metadata.
    /// Returns self for the same reason as `limit()`. A bare
    /// `book.reset()` is also valid (matches the TS `OrderBook` shape);
    /// when called without a snapshot, we just rebind the existing one
    /// (effectively a no-op metadata refresh).
    pub fn reset(&mut self, snapshot: Value) -> Value {
        book_reset(self, snapshot);
        self.clone()
    }
    /// Zero-arg `reset()` form used by per-exchange WS code that just
    /// wants to clear the rolling buffers.
    pub fn reset0(&mut self) -> Value {
        book_reset(self, Value::Null);
        self.clone()
    }

    /// `book.update(snapshot)` — same as reset but only when the
    /// supplied nonce moves forward.
    pub fn update(&mut self, snapshot: Value) -> Value {
        book_update(self, snapshot);
        self.clone()
    }

    /// `side.store(price, size)` — convenience that builds a 2-element
    /// delta. Routed through the side's `store_array`. Only useful on a
    /// side marker (returned by `book['bids']`), not the book itself.
    pub fn store(&mut self, price: Value, size: Value) {
        if side_kind(self).is_some() {
            let delta = Value::List(vec![price, size]);
            side_store_array(self, delta);
        }
    }

    /// Book-level side mutators — the transpiler rewrites side-extraction
    /// patterns (`let bids = book['bids']; bids.X(...)`) into calls on
    /// these methods so the mutation reaches the book's actual side
    /// dict rather than a COW-cloned copy of it.
    pub fn store_to_bids(&mut self, price: Value, size: Value) {
        let delta = Value::List(vec![price, size]);
        book_store_array_side(self, "bids", delta);
    }
    pub fn store_to_asks(&mut self, price: Value, size: Value) {
        let delta = Value::List(vec![price, size]);
        book_store_array_side(self, "asks", delta);
    }
    pub fn store_array_to_bids(&mut self, delta: Value) {
        book_store_array_side(self, "bids", delta);
    }
    pub fn store_array_to_asks(&mut self, delta: Value) {
        book_store_array_side(self, "asks", delta);
    }
}
