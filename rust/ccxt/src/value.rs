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
#[cfg(feature = "transpiled-base")]
use crate::exchange_generated::ExchangeBase;

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
    /// `client.reject(error, messageHash)` — stores a rejection the `watch`
    /// drive loop delivers to the awaiting caller. Routes by the client
    /// handle's `url` to the WS registry (no-op on a non-client Value).
    pub fn reject(&self, args: &[Value]) -> Value {
        crate::pro::ws_client::value_reject(self, args)
    }
    /// `client.resolve(value, messageHash)` — stores the resolved value the
    /// `watch` drive loop returns. Routes by the client handle's `url`.
    pub fn resolve(&self, args: &[Value]) -> Value {
        crate::pro::ws_client::value_resolve(self, args)
    }
    /// `client.future(messageHash)` — TS returns a Future for the hash. The
    /// Rust `watch` drives synchronously (it polls `take_settled`), so the
    /// future object itself is unused; return the hash so any `.then`-style
    /// chaining in transpiled code still has a Value to work with.
    pub fn future(&self, args: &[Value]) -> Value {
        args.get(0).cloned().unwrap_or(Value::Null)
    }
    /// `client.reusable_future(messageHash)` — shared Future per hash; same
    /// synchronous-drive treatment as `future`.
    pub fn reusable_future(&self, msg_hash: Value) -> Value { msg_hash }
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
    /// `client.send(payload)` — queues a frame on the WS connection (routed by
    /// the client handle's `url`). No-op on a non-client Value.
    pub fn send(&self, args: &[Value]) -> Value {
        crate::pro::ws_client::value_send(self, args)
    }
    /// `client.decode_proto_msg(...)` — exchange-specific protobuf
    /// decode helper; stubbed to `Value::Null`.
    pub fn decode_proto_msg(&self, _args: &[Value]) -> Value { Value::Null }
    /// `client.on_pong(...)` — WS heartbeat hook; records the pong time.
    pub fn on_pong(&self, _args: &[Value]) -> Value {
        crate::pro::ws_client::value_on_pong(self)
    }
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
            return crate::exchange::BaseCore::new(self.snapshot_as_exchange()).network_code_to_id(code, &[currency]);
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
            return crate::exchange::BaseCore::new(self.snapshot_as_exchange()).network_id_to_code(args);
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
            // If this snapshot is backed by a live Core (`__live_id`), route to
            // it so the Core's own `set_markets` runs — for a prediction venue
            // that's `PredictionExchange::set_markets` (outcome→symbol aliasing +
            // populateOutcomes), populating the outcome caches on the very
            // instance the method dispatch uses. Without this, the prediction
            // static request tests seed markets onto a throwaway snapshot and the
            // live Core resolves every outcome by (re)fetching events.
            if let Value::Dict(m) = &*self {
                if let Some(Value::Str(id)) = m.get("__live_id") {
                    if let Some(cb) = live_set_markets_get() {
                        return cb(&id.clone(), markets);
                    }
                }
            }
            let mut ex = crate::exchange::BaseCore::new(self.snapshot_as_exchange());
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
            Value::Dict(m)     => {
                let mut obj: serde_json::Map<String, serde_json::Value> =
                    m.iter().map(|(k, v)| (k.clone(), v.to_json())).collect();
                // A side marker keeps its entries in the shared side store, not
                // in the Dict — surface them under `_entries` for serialization.
                if m.contains_key("__side_id") {
                    let entries = side_entries_view(m);
                    obj.insert("_entries".to_string(),
                        serde_json::Value::Array(entries.iter().map(Value::to_json).collect()));
                }
                // A shared book keeps scalar meta (nonce/timestamp/…) in the
                // book store — surface it for serialization.
                if let Some(Value::Int(id)) = m.get("__book_id") {
                    for (k, v) in book_meta_snapshot(*id) { obj.insert(k, v.to_json()); }
                }
                serde_json::Value::Object(obj)
            }
        }
    }

    pub fn from_json(v: &serde_json::Value) -> Self {
        match v {
            serde_json::Value::Null        => Value::Null,
            serde_json::Value::Bool(b)     => Value::Bool(*b),
            serde_json::Value::Number(n)   => {
                if let Some(i) = n.as_i64()  {
                    Value::Int(i)
                } else if n.is_u64() {
                    // Integer in (i64::MAX, u64::MAX] — a large order/trade/
                    // account id. `Value::Int` is i64 and `f64` would round it,
                    // so preserve the exact digits as a string (Go does the
                    // same). CCXT's safe_integer/safe_number read it back as a
                    // number when needed.
                    Value::Str(n.to_string())
                } else if let Some(f) = n.as_f64() {
                    Value::Float(f)
                } else {
                    Value::Null
                }
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

// Companion to `LiveLookupFn` but for writing: routes `exchange.setMarkets(...)`
// on a `__live_id` snapshot to the registered *live* Core, so the Core's
// `PredictionExchange::set_markets` override (outcome aliasing + populateOutcomes)
// runs against the real instance the method dispatch will use. Returns the
// resulting markets. See `Value::set_markets`.
type LiveSetMarketsFn = fn(id: &str, markets: Value) -> Value;
static LIVE_SET_MARKETS_PTR: std::sync::atomic::AtomicUsize =
    std::sync::atomic::AtomicUsize::new(0);

pub fn set_live_set_markets(f: LiveSetMarketsFn) {
    LIVE_SET_MARKETS_PTR.store(f as usize, std::sync::atomic::Ordering::Release);
}

fn live_set_markets_get() -> Option<LiveSetMarketsFn> {
    let n = LIVE_SET_MARKETS_PTR.load(std::sync::atomic::Ordering::Acquire);
    if n == 0 { None } else {
        // SAFETY: only ever stored as `fn(&str, Value) -> Value` via
        // `set_live_set_markets`; the pointer-to-fn round-trip is sound.
        Some(unsafe { std::mem::transmute::<usize, LiveSetMarketsFn>(n) })
    }
}

/// Hot-path `get_value` variant that takes the key as a `&str` directly,
/// skipping a `Value::Str` heap allocation. Used by the `safe_*_k`
/// fast-path readers the transpiler routes literal-key calls through.
#[inline]
pub fn get_value_k(obj: &Value, key: &str) -> Value {
    if let Value::Dict(m) = obj {
        // A shared order book keeps its scalar meta (nonce/timestamp/…) in the
        // book store; route those through it so the safe_* helpers (which go via
        // get_value_k) see the shared value, not the empty Dict slot.
        if is_book_meta_key(key) {
            if let Some(id) = book_id_of(m) { return book_meta_get(id, key); }
        }
        if key == "cache" {
            if let Some(id) = book_id_of(m) { return book_cache_handle(id); }
        }
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
    // The index may arrive as an Int (`get_value(&side, &Value::Int(0))`) or as
    // a numeric string — the `safe_*` helpers stringify their key, so
    // `safe_value(cache, 0)` reaches here as `Str("0")`. Accept both.
    if let Value::Dict(m) = obj {
        let idx = match key {
            Value::Int(i) if *i >= 0 => Some(*i as usize),
            Value::Str(s) => s.parse::<usize>().ok(),
            _ => None,
        };
        if let Some(i) = idx {
            if let Some(id) = book_cache_id_of(m) {
                return book_cache_at(id, i);
            }
            if m.contains_key("__cacheKind") {
                if let Some(Value::Arr(data)) = m.get("_data") {
                    return data.get(i).cloned().unwrap_or(Value::Null);
                }
            }
            if m.contains_key("__sideKind") {
                return side_entry_at(m, i);
            }
        }
    }
    match (obj, key) {
        (Value::Dict(m), Value::Str(k)) => {
            // A shared order book keeps its scalar meta (nonce/timestamp/…) in
            // the book store so mutations propagate across clones.
            if is_book_meta_key(k) {
                if let Some(id) = book_id_of(m) { return book_meta_get(id, k); }
            }
            if k == "cache" {
                if let Some(id) = book_id_of(m) { return book_cache_handle(id); }
            }
            // A client handle (`Map{url, subscriptions, futures}`) serves its
            // subscriptions/futures live from the WS registry, so a read after a
            // write (upbit sets subs then reads them back to build its subscribe
            // frame) is coherent rather than a stale embedded snapshot.
            if (k == "subscriptions" || k == "futures")
                && m.contains_key("subscriptions") && m.contains_key("futures")
            {
                if let Some(Value::Str(url)) = m.get("url") {
                    return crate::pro::ws_client::client_field_live(url, k);
                }
            }
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
        (Value::Dict(m), Value::Str(k)) => {
            if try_book_meta_write(m, k, &val) { return; }
            // Persist to the live client AND keep the local snapshot coherent so
            // code that reads back what it just wrote (upbit builds its subscribe
            // frame from `object_keys(client.subscriptions)`) sees the new entry.
            try_ws_subs_write(m, k, &val);
            try_ws_sub_field_write(m, k, &val);
            Arc::make_mut(m).insert(k.clone(), val);
        }
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
        // Booleans are not strings/finite numbers → TS `safeString` returns the
        // default for them (not "true"/"false"), same as lists/dicts.
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

// ────────────────────────────────────────────────────────────────────────────
// Shared book scalar-metadata store.
//
// Like side entries, an OrderBook's scalar fields must be shared across clones:
// WS handlers mutate a book pulled out of `self.orderbooks` (a COW clone) and
// expect the write visible on the next message — okx's per-message seqId nonce
// check reads the book's `nonce`, written inside `handle_order_book_message` on
// a clone. These fields live in a store keyed by a stable `__book_id`; bids/asks
// stay in the Dict (their entries are already shared via `__side_id`).
static BOOK_META: once_cell::sync::Lazy<std::sync::Mutex<std::collections::HashMap<i64, HashMap<String, Value>>>> =
    once_cell::sync::Lazy::new(|| std::sync::Mutex::new(std::collections::HashMap::new()));
static NEXT_BOOK_ID: std::sync::atomic::AtomicI64 = std::sync::atomic::AtomicI64::new(1);

/// Scalar book fields that live in the shared meta store (not the Dict).
fn is_book_meta_key(k: &str) -> bool {
    matches!(k, "timestamp" | "datetime" | "nonce" | "symbol" | "checksum")
}

pub(crate) fn alloc_book_id() -> i64 {
    let id = NEXT_BOOK_ID.fetch_add(1, std::sync::atomic::Ordering::Relaxed);
    BOOK_META.lock().unwrap().insert(id, HashMap::new());
    id
}

fn book_id_of(m: &HashMap<String, Value>) -> Option<i64> {
    match m.get("__book_id") { Some(Value::Int(n)) => Some(*n), _ => None }
}

fn book_meta_get(id: i64, k: &str) -> Value {
    BOOK_META.lock().unwrap().get(&id).and_then(|m| m.get(k).cloned()).unwrap_or(Value::Null)
}

pub(crate) fn book_meta_set(id: i64, k: &str, v: Value) {
    let mut g = BOOK_META.lock().unwrap();
    g.entry(id).or_default().insert(k.to_string(), v);
}

fn book_meta_snapshot(id: i64) -> Vec<(String, Value)> {
    BOOK_META.lock().unwrap().get(&id)
        .map(|m| m.iter().map(|(k, v)| (k.clone(), v.clone())).collect())
        .unwrap_or_default()
}

// A JS `OrderBook` also carries a mutable `cache` array — venues that fetch a
// REST/`req` snapshot buffer live deltas into `orderbook.cache` while the
// snapshot is in flight (binance, htx, …). Like the sides/meta, the cache must
// be shared across clones: `orderbook.cache.push(msg)` transpiles to
// `append_to_array(get_value(&book, "cache"), msg)`, and get_value returns a COW
// clone. So `get_value(book, "cache")` returns a lightweight handle carrying
// `__book_cache_id`, and length/index/append/clear route through this store.
static BOOK_CACHE: once_cell::sync::Lazy<std::sync::Mutex<std::collections::HashMap<i64, Vec<Value>>>> =
    once_cell::sync::Lazy::new(|| std::sync::Mutex::new(std::collections::HashMap::new()));

/// Build a cache handle for a book id (returned by `get_value(book, "cache")`).
fn book_cache_handle(id: i64) -> Value {
    let mut h = HashMap::new();
    h.insert("__book_cache_id".to_string(), Value::Int(id));
    Value::Dict(Arc::new(h))
}

fn book_cache_id_of(m: &HashMap<String, Value>) -> Option<i64> {
    match m.get("__book_cache_id") { Some(Value::Int(n)) => Some(*n), _ => None }
}

pub(crate) fn book_cache_push(id: i64, v: Value) {
    BOOK_CACHE.lock().unwrap().entry(id).or_default().push(v);
}

fn book_cache_len(id: i64) -> usize {
    BOOK_CACHE.lock().unwrap().get(&id).map(|c| c.len()).unwrap_or(0)
}

/// Length of a cache handle Dict's backing store, or None if `m` isn't a handle.
pub(crate) fn book_cache_len_of(m: &HashMap<String, Value>) -> Option<usize> {
    book_cache_id_of(m).map(book_cache_len)
}

/// If `m` is a tagged live-subscriptions snapshot, apply `client.subscriptions
/// [key] = val` to the live WS client and return true.
pub(crate) fn try_ws_subs_write(m: &HashMap<String, Value>, key: &str, val: &Value) -> bool {
    if key == "__ws_subs_url" { return false; }
    if let Some(Value::Str(url)) = m.get("__ws_subs_url") {
        crate::pro::ws_client::value_subs_insert(url, key, val.clone());
        return true;
    }
    false
}

/// If `m` is a tagged subscription dict (`__ws_sub_ref`), persist a field write
/// `subscription[key] = val` to the live WS client and return true.
pub(crate) fn try_ws_sub_field_write(m: &HashMap<String, Value>, key: &str, val: &Value) -> bool {
    if key == "__ws_sub_ref" { return false; }
    if let Some(Value::Str(subref)) = m.get("__ws_sub_ref") {
        crate::pro::ws_client::value_sub_field_write(subref, key, val.clone());
        return true;
    }
    false
}

/// If `m` is a tagged live-subscriptions snapshot, apply `delete
/// client.subscriptions[key]` to the live WS client and return true.
pub(crate) fn try_ws_subs_remove(m: &HashMap<String, Value>, key: &str) -> bool {
    if let Some(Value::Str(url)) = m.get("__ws_subs_url") {
        crate::pro::ws_client::value_subs_remove(url, key);
        return true;
    }
    false
}

/// If `obj` is a cache handle, push `v` into its store and return true.
pub(crate) fn try_book_cache_push(obj: &Value, v: &Value) -> bool {
    if let Value::Dict(m) = obj {
        if let Some(id) = book_cache_id_of(m) { book_cache_push(id, v.clone()); return true; }
    }
    false
}

fn book_cache_at(id: i64, i: usize) -> Value {
    BOOK_CACHE.lock().unwrap().get(&id).and_then(|c| c.get(i).cloned()).unwrap_or(Value::Null)
}

/// Replace a book's cache contents (from `book.cache = [...]`, usually to clear).
pub(crate) fn book_cache_set(id: i64, items: Vec<Value>) {
    BOOK_CACHE.lock().unwrap().insert(id, items);
}

/// Snapshot a WS cache's rolling buffer as a plain array. Handles both the
/// `_data`-backed ArrayCache / ArrayCacheByTimestamp (trades, ohlcv, tickers)
/// and the registry-backed order-book cache handle. Returns `None` when `v`
/// isn't a cache — `to_array` then falls back to its generic Dict handling.
/// Without this, `to_array(cache)` would surface the cache's meta fields
/// (`__cacheKind`, counters, boolean flags) as if they were entries.
pub fn cache_entries_as_value(v: &Value) -> Option<Value> {
    if let Value::Dict(m) = v {
        if let Some(id) = book_cache_id_of(m) {
            let items = BOOK_CACHE.lock().unwrap().get(&id).cloned().unwrap_or_default();
            return Some(Value::Array(items));
        }
        if m.contains_key("__cacheKind") {
            return Some(match m.get("_data") {
                Some(Value::Arr(a)) => Value::Array((**a).clone()),
                _ => Value::Array(vec![]),
            });
        }
    }
    None
}

/// If `m` is a shared book and `k` a meta key, write `v` to the book store and
/// return true (the caller should skip its own Dict insert); else false.
pub(crate) fn try_book_meta_write(m: &HashMap<String, Value>, k: &str, v: &Value) -> bool {
    if is_book_meta_key(k) {
        if let Some(id) = book_id_of(m) { book_meta_set(id, k, v.clone()); return true; }
    }
    // `book.cache = [...]` — replace the shared cache store (usually a clear).
    if k == "cache" {
        if let Some(id) = book_id_of(m) {
            let items = match v { Value::Arr(a) => a.as_ref().clone(), _ => Vec::new() };
            book_cache_set(id, items);
            return true;
        }
    }
    false
}

/// Expand a shared book Dict into a plain Dict carrying its meta fields (for
/// serialization / equality). Strips `__book_id` so the result is inert.
pub fn book_fields_as_value(v: &Value) -> Option<Value> {
    match v {
        Value::Dict(d) if d.contains_key("__book_id") => {
            let mut out: HashMap<String, Value> = (**d).clone();
            out.shift_remove("__book_id");
            if let Some(Value::Int(id)) = d.get("__book_id") {
                if let Some(meta) = BOOK_META.lock().unwrap().get(id) {
                    for (k, val) in meta.iter() { out.insert(k.clone(), val.clone()); }
                }
            }
            Some(Value::Dict(Arc::new(out)))
        }
        _ => None,
    }
}

// ────────────────────────────────────────────────────────────────────────────
// Shared side backing store.
//
// In JS an `OrderBookSide` is a mutable object; the WS handlers routinely do
// `const bookside = book['asks']; storeDeltas(bookside, deltas)` where the
// helper mutates `bookside` in place and the change is visible through `book`.
// Our `Value` is copy-on-write (Arc), so cloning the side Dict and mutating the
// clone (the transpiled `handle_deltas(side.clone(), …)` shape) would lose the
// writes. To restore shared mutability we keep the side's `_entries` (and the
// indexed-side `hashmap`) OUTSIDE the Dict, in a global store keyed by a stable
// `__side_id` that survives cloning. All reads and writes go through the store,
// so every clone of a side Dict points at the same buffer — matching JS.
struct SideCell {
    entries: Vec<Value>,
    hashmap: HashMap<String, Value>,
}

static SIDE_STORE: once_cell::sync::Lazy<std::sync::Mutex<std::collections::HashMap<i64, SideCell>>> =
    once_cell::sync::Lazy::new(|| std::sync::Mutex::new(std::collections::HashMap::new()));
static NEXT_SIDE_ID: std::sync::atomic::AtomicI64 = std::sync::atomic::AtomicI64::new(1);

/// Allocate a fresh, empty side cell and return its id.
fn alloc_side_id() -> i64 {
    let id = NEXT_SIDE_ID.fetch_add(1, std::sync::atomic::Ordering::Relaxed);
    SIDE_STORE.lock().unwrap().insert(id, SideCell { entries: Vec::new(), hashmap: HashMap::new() });
    id
}

/// Clear (but keep) an existing side cell — used on reset so the id stays
/// stable across reseeds instead of leaking a new cell each time.
fn clear_side_cell(id: i64) {
    let mut g = SIDE_STORE.lock().unwrap();
    let cell = g.entry(id).or_insert_with(|| SideCell { entries: Vec::new(), hashmap: HashMap::new() });
    cell.entries.clear();
    cell.hashmap.clear();
}

fn side_id_of(m: &HashMap<String, Value>) -> Option<i64> {
    match m.get("__side_id") { Some(Value::Int(n)) => Some(*n), _ => None }
}

/// Snapshot a side's entries (clone) — for read paths (indexing, length, JSON).
fn side_entries_view(m: &HashMap<String, Value>) -> Vec<Value> {
    match side_id_of(m) {
        Some(id) => SIDE_STORE.lock().unwrap().get(&id).map(|c| c.entries.clone()).unwrap_or_default(),
        // Legacy fallback: a side Dict that still carries an inline `_entries`.
        None => match m.get("_entries") { Some(Value::Arr(a)) => a.as_ref().clone(), _ => Vec::new() },
    }
}

fn side_entry_at(m: &HashMap<String, Value>, i: usize) -> Value {
    match side_id_of(m) {
        Some(id) => SIDE_STORE.lock().unwrap().get(&id)
            .and_then(|c| c.entries.get(i).cloned()).unwrap_or(Value::Null),
        None => match m.get("_entries") {
            Some(Value::Arr(a)) => a.get(i).cloned().unwrap_or(Value::Null), _ => Value::Null },
    }
}

pub(crate) fn side_entries_len(m: &HashMap<String, Value>) -> usize {
    match side_id_of(m) {
        Some(id) => SIDE_STORE.lock().unwrap().get(&id).map(|c| c.entries.len()).unwrap_or(0),
        None => match m.get("_entries") { Some(Value::Arr(a)) => a.len(), _ => 0 },
    }
}

/// Mutate a side's cell (entries + hashmap) under the store lock. No-op if the
/// side carries no `__side_id`.
fn with_side_cell<R>(m: &HashMap<String, Value>, f: impl FnOnce(&mut SideCell) -> R) -> Option<R> {
    let id = side_id_of(m)?;
    let mut g = SIDE_STORE.lock().unwrap();
    let cell = g.entry(id).or_insert_with(|| SideCell { entries: Vec::new(), hashmap: HashMap::new() });
    Some(f(cell))
}

/// Public: snapshot a side marker's entries as a `Value` array, or `None` when
/// `v` is not a side marker. Entries live in the shared side store (not the
/// Dict), so callers that need the raw `[[price, size, …], …]` list — test
/// helpers, serializers — go through this.
pub fn side_entries_as_value(v: &Value) -> Option<Value> {
    match v {
        Value::Dict(d) if d.contains_key("__sideKind") => Some(Value::List(side_entries_view(d))),
        _ => None,
    }
}

/// Build a fresh side marker Dict backed by a new (empty) shared cell.
pub(crate) fn make_side_marker(side_kind: &str, is_bid: bool, depth: i64) -> Value {
    let sid = alloc_side_id();
    let mut m = HashMap::new();
    m.insert("__sideKind".to_string(), Value::Str(side_kind.to_string()));
    m.insert("_isBid".to_string(),     Value::Bool(is_bid));
    m.insert("_depth".to_string(),     Value::Int(depth));
    m.insert("__side_id".to_string(),  Value::Int(sid));
    Value::Dict(Arc::new(m))
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

fn side_store_array(side: &Value, delta: Value) {
    let kind = side_kind(side).unwrap_or_default();
    let m = match side { Value::Dict(d) => d.as_ref(), _ => return };
    let is_bid = side_is_bid(m);
    with_side_cell(m, |cell| {
    match kind.as_str() {
        "OrderBookSide" => {
            let price = delta_field(&delta, 0, as_f64, 0.0);
            let size  = delta_field(&delta, 1, as_f64, 0.0);
            let target = if is_bid { -price } else { price };
            let entries = &mut cell.entries;
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
            // JS gates a counted store on `size && count`, but some venues drive
            // a counted book with no numeric count in slot 2 — bitget stores
            // `[price, size, [rawPrice, rawSize]]` (the raw pair, for checksums).
            // Only treat slot 2 as a count when it's actually a number; otherwise
            // gate on size alone so the entry stores.
            let has_count = matches!(&delta,
                Value::Arr(a) if matches!(a.get(2), Some(Value::Int(_)) | Some(Value::Float(_))));
            let store_it = if has_count { size != 0.0 && count != 0.0 } else { size != 0.0 };
            let target = if is_bid { -price } else { price };
            let entries = &mut cell.entries;
            let entries_view: Vec<Value> = entries.iter().cloned().collect();
            let idx = bisect_left_by(entries.len(), target, is_bid, entry_at_price(&entries_view));
            if store_it {
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
                match cell.hashmap.get(&id) {
                    Some(Value::Float(f)) => Some(*f),
                    Some(Value::Int(n))   => Some(*n as f64),
                    _ => None,
                }
            };
            if size != 0.0 {
                if let Some(old_price) = old_price_opt {
                    index_price = index_price.or(Some(old_price));
                    if Some(old_price) == index_price {
                        // Find slot by walking from bisect_left
                        let target = old_price;
                        let entries = &mut cell.entries;
                        let entries_view: Vec<Value> = entries.iter().cloned().collect();
                        let mut idx = bisect_left_by(entries.len(), target, is_bid, entry_at_price(&entries_view));
                        while idx < entries.len() && entry_id(entries, idx) != id { idx += 1; }
                        if idx < entries.len() { entries[idx] = delta; }
                        return;
                    }
                    // Different price — remove old slot
                    let target = old_price;
                    let entries = &mut cell.entries;
                    let entries_view: Vec<Value> = entries.iter().cloned().collect();
                    let mut old_idx = bisect_left_by(entries.len(), target, is_bid, entry_at_price(&entries_view));
                    while old_idx < entries.len() && entry_id(entries, old_idx) != id { old_idx += 1; }
                    if old_idx < entries.len() { entries.remove(old_idx); }
                }
                let target = match index_price { Some(p) => p, None => return };
                // Insert sorted with secondary id tiebreaker
                let entries = &mut cell.entries;
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
                cell.hashmap.insert(id, Value::Float(target));
            } else if let Some(old_price) = old_price_opt {
                // Delete by id
                let target = old_price;
                let entries = &mut cell.entries;
                let entries_view: Vec<Value> = entries.iter().cloned().collect();
                let mut idx = bisect_left_by(entries.len(), target, is_bid, entry_at_price(&entries_view));
                while idx < entries.len() && entry_id(entries, idx) != id { idx += 1; }
                if idx < entries.len() { entries.remove(idx); }
                cell.hashmap.shift_remove(&id);
            }
        }
        _ => {}
    }
    });
}

fn side_limit(side: &Value) {
    let m = match side { Value::Dict(d) => d.as_ref(), _ => return };
    let depth = side_depth(m);
    with_side_cell(m, |cell| {
        if cell.entries.len() > depth { cell.entries.truncate(depth); }
    });
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
        // Rebuild bids/asks. Reuse the existing side's `__side_id` (clearing its
        // backing cell) so repeated resets don't leak a fresh cell each time.
        for (side_key, deltas, is_bid) in [
            ("bids", &bids_deltas, true),
            ("asks", &asks_deltas, false),
        ] {
            let sid = match book_m.get(side_key) {
                Some(Value::Dict(d)) => match d.get("__side_id") {
                    Some(Value::Int(n)) => { clear_side_cell(*n); *n }
                    _ => alloc_side_id(),
                },
                _ => alloc_side_id(),
            };
            let mut m = HashMap::new();
            m.insert("__sideKind".to_string(),  Value::Str(side_kind_str.to_string()));
            m.insert("_isBid".to_string(),      Value::Bool(is_bid));
            m.insert("_depth".to_string(),      Value::Int(depth));
            m.insert("__side_id".to_string(),   Value::Int(sid));
            let side = Value::Map(m);
            if let Value::Arr(rows) = deltas {
                for row in rows.iter() {
                    if let Value::Arr(_) = row { side_store_array(&side, row.clone()); }
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
    let id = match book { Value::Dict(d) => book_id_of(d), _ => None };
    if let Some(id) = id {
        let ts = match crate::get_value(&snapshot, &Value::Str("timestamp".to_string())) {
            Value::Int(n)   => Some(n),
            Value::Float(f) => Some(f as i64),
            _ => None,
        };
        let dt = ts.and_then(|n| chrono::DateTime::<chrono::Utc>::from_timestamp_millis(n)
            .map(|t| t.to_rfc3339_opts(chrono::SecondsFormat::Millis, true)));
        book_meta_set(id, "timestamp", ts.map(Value::Int).unwrap_or(Value::Null));
        book_meta_set(id, "datetime",  dt.map(Value::Str).unwrap_or(Value::Null));
        book_meta_set(id, "nonce",     crate::get_value(&snapshot, &Value::Str("nonce".to_string())));
        book_meta_set(id, "symbol",    crate::get_value(&snapshot, &Value::Str("symbol".to_string())));
    }
}

pub(crate) fn book_update(book: &mut Value, snapshot: Value) {
    if book_kind(book).is_none() { return; }
    // Skip stale updates.
    let new_nonce = match crate::get_value(&snapshot, &Value::Str("nonce".to_string())) {
        Value::Int(n) => Some(n), _ => None,
    };
    let cur_nonce = match book {
        Value::Dict(d) => match book_id_of(d).map(|id| book_meta_get(id, "nonce")) {
            Some(Value::Int(n)) => Some(n), _ => None,
        },
        _ => None,
    };
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
        // `client.reset(error)` — a WS client handle (carries "url") resets its
        // registry entry; everything else is an OrderBook snapshot reset.
        if matches!(&self, Value::Dict(d) if d.contains_key("url") && d.contains_key("subscriptions")) {
            return crate::pro::ws_client::value_reset(self);
        }
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

#[cfg(test)]
mod json_int_precision_tests {
    use super::Value;

    #[test]
    fn preserves_large_u64_ids_losslessly() {
        // 12345678901234567890 > i64::MAX but ≤ u64::MAX — must not round.
        let v: serde_json::Value = serde_json::from_str(r#"{"id": 12345678901234567890}"#).unwrap();
        let parsed = Value::from_json(&v);
        let id = crate::runtime::get_value(&parsed, &Value::Str("id".to_string()));
        assert_eq!(id, Value::Str("12345678901234567890".to_string()));
    }

    #[test]
    fn small_ints_stay_ints_floats_stay_floats() {
        let v: serde_json::Value = serde_json::from_str(r#"{"a": 42, "b": -7, "c": 1.5}"#).unwrap();
        let p = Value::from_json(&v);
        assert_eq!(crate::runtime::get_value(&p, &Value::Str("a".to_string())), Value::Int(42));
        assert_eq!(crate::runtime::get_value(&p, &Value::Str("b".to_string())), Value::Int(-7));
        assert_eq!(crate::runtime::get_value(&p, &Value::Str("c".to_string())), Value::Float(1.5));
    }
}
