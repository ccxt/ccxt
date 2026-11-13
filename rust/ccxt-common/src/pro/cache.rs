// CCXT-pro Cache types — Value-shaped facades.
//
// Reflects the TS classes (`ArrayCache`, `ArrayCacheByTimestamp`,
// `ArrayCacheBySymbolById`, `ArrayCacheBySymbolBySide`) into Rust as
// unit-struct factories that return `Value::Dict` "marker maps". The
// marker carries a `__cacheKind` tag, an optional `maxSize` cap, an
// ordered `_data` Vec for the rolling buffer, plus per-class
// bookkeeping fields (`_hashmap`, `_new_updates_by_symbol`, …).
//
// All append/clear/getLimit/length/indexing logic lives in
// `Value::*` methods (see `value.rs` and `runtime.rs`) — the
// transpiled tests in `rust/tests/base_ws/test.cache.rs` call those
// methods directly on the Value-typed locals the transpiler emits
// (`cache.append(...)`, `cache.get_limit(...)`, `cache.clear()`,
// `cache[i]`, `get_array_length(&cache)`).

use crate::Value;
use indexmap::IndexMap;

/// Cache kind tag stored at `__cacheKind` inside the marker map.
/// Drives the dispatch in `Value::append`.
pub const KIND_ARRAY_CACHE:              &str = "ArrayCache";
pub const KIND_ARRAY_CACHE_BY_TIMESTAMP: &str = "ArrayCacheByTimestamp";
pub const KIND_ARRAY_CACHE_BY_SYMBOL_ID: &str = "ArrayCacheBySymbolById";
pub const KIND_ARRAY_CACHE_BY_SYMBOL_SIDE: &str = "ArrayCacheBySymbolBySide";
// Prediction-market cache: like BySymbolById but keys the outer bucket on
// `outcome` (several outcomes of one market can share an order id), so it needs
// a distinct tag or the append dispatch merges two outcomes into one row.
pub const KIND_ARRAY_CACHE_BY_OUTCOME_ID: &str = "ArrayCacheByOutcomeById";

/// Internal constructor: builds the marker `Value::Dict` with default
/// bookkeeping fields. Per-kind overrides flip specific fields after.
fn new_marker(kind: &str, max_size: Value) -> Value {
    // The mutable rolling buffer + hashmap + counters live in the shared cache
    // registry (keyed by __cache_id) so COW clones of the marker share them —
    // see value::WsStateStore. The marker Dict keeps only the immutable tags.
    let mut state: IndexMap<String, Value> = IndexMap::new();
    state.insert("_data".to_string(),             Value::Array(Vec::new()));
    state.insert("hashmap".to_string(),           Value::Map(IndexMap::new()));
    state.insert("_newUpdatesBySymbol".to_string(),   Value::Map(IndexMap::new()));
    // Two independent distinct-key seen-sets: the symbol-scoped poll and the
    // global poll each clear only their own scope (see value::cache_seen_*).
    state.insert("_seenUpdatesBySymbol".to_string(),  Value::Map(IndexMap::new()));
    state.insert("_seenUpdatesAll".to_string(),       Value::Map(IndexMap::new()));
    state.insert("_clearUpdatesBySymbol".to_string(), Value::Map(IndexMap::new()));
    state.insert("_allNewUpdates".to_string(),    Value::Int(0));
    state.insert("_clearAllUpdates".to_string(),  Value::Bool(false));
    // Per-timestamp cache fields (default zero/empty; unused by the other kinds).
    state.insert("_sizeTracker".to_string(),      Value::Map(IndexMap::new()));
    state.insert("_newUpdates".to_string(),       Value::Int(0));
    state.insert("_clearUpdates".to_string(),     Value::Bool(false));
    let id = crate::value::alloc_cache_id(state);
    let mut m = IndexMap::new();
    m.insert("__cacheKind".to_string(),       Value::Str(kind.to_string().into()));
    m.insert("__cache_id".to_string(),        Value::Int(id));
    m.insert("maxSize".to_string(),           max_size);
    Value::Map(m)
}

// ─── typed handle ─────────────────────────────────────────────────────────

/// A ws cache built by one of the factories below. It always holds a marker dict
/// (`__cacheKind` + `__cache_id`); clones share the rolling buffer through the id.
#[derive(Debug, Clone, PartialEq)]
pub struct Cache(Value);

impl Cache {
    pub fn append(&mut self, item: Value) { self.0.append(item) }
    pub fn get_limit(&mut self, symbol: Option<&str>, limit: Option<i64>) -> Option<i64> { self.0.get_limit(symbol, limit) }
    pub fn clear(&mut self) { self.0.clear() }
    pub fn hashmap(&self) -> Value { self.0.hashmap() }
    /// `cache.length`: the rolling buffer's size (`Value::len` unwraps the marker).
    pub fn size(&self) -> i64 { self.0.len() as i64 }
}

impl From<Cache> for Value { fn from(c: Cache) -> Value { c.0 } }
/// The shared marker (an Arc bump, as `From<&List>` lends a list); a `Cache` always holds a `Dict`.
impl From<&Cache> for Value { fn from(c: &Cache) -> Value { if let Value::Dict(d) = &c.0 { Value::Dict(std::sync::Arc::clone(d)) } else { Value::Null } } }
impl From<Option<Cache>> for Value { fn from(c: Option<Cache>) -> Value { c.map_or(Value::Null, |c| c.0) } }
/// A resolved watch value: a cache marker is that cache, anything else is no cache (`Value::get_limit` answered
/// `limit` and the `Rows` readers took it as rows, exactly as `CacheSlot` / `Rows` do for `None`).
impl From<Value> for Option<Cache> {
    fn from(v: Value) -> Option<Cache> { if crate::value::cache_kind_of(&v) { Some(Cache(v)) } else { None } }
}
impl From<&Option<Cache>> for Value { fn from(c: &Option<Cache>) -> Value { c.as_ref().map_or(Value::Null, Value::from) } }

impl crate::value::Rows for &Cache {
    fn rows(self) -> Value { Value::from(self) }
    fn absent(&self) -> bool { false }
}
impl crate::value::Rows for &Option<Cache> {
    fn rows(self) -> Value { Value::from(self) }
    fn absent(&self) -> bool { self.is_none() }
}

/// The cache operations on an optional cache slot; an absent cache ignores them, as a `Value::Null` receiver did.
pub trait CacheSlot {
    fn append(&mut self, item: Value);
    fn get_limit(&mut self, symbol: Option<&str>, limit: Option<i64>) -> Option<i64>;
    fn clear(&mut self);
    fn hashmap(&self) -> Value;
    fn size(&self) -> i64;
}

impl CacheSlot for Option<Cache> {
    fn append(&mut self, item: Value) { if let Some(c) = self { c.append(item) } }
    fn get_limit(&mut self, symbol: Option<&str>, limit: Option<i64>) -> Option<i64> {
        match self { Some(c) => c.get_limit(symbol, limit), None => limit }
    }
    fn clear(&mut self) { if let Some(c) = self { c.clear() } }
    fn hashmap(&self) -> Value { self.as_ref().map_or(Value::Null, Cache::hashmap) }
    /// An absent cache has length 0, as `get_array_length(&Value::Null)` did.
    fn size(&self) -> i64 { self.as_ref().map_or(0, Cache::size) }
}

/// A dictionary of caches keyed by symbol (`Exchange::trades`). Entries are only ever
/// written from a `Cache`, so every element read is a `Cache` or absent.
pub type CacheMap = IndexMap<String, Cache>;

/// A map key as the transpiled code holds it. `strict` is the key only when it is a
/// string (what `in`, `m[k]` and `delete` match on); `text` is the stringified key the
/// `safe_*` readers and the dict insert use (`Null` becomes `"null"`).
pub trait CacheKey {
    fn strict(&self) -> Option<&str>;
    fn text(&self) -> std::borrow::Cow<'_, str>;
}
impl CacheKey for Value {
    fn strict(&self) -> Option<&str> { self.as_str() }
    fn text(&self) -> std::borrow::Cow<'_, str> {
        match self.as_str() { Some(s) => std::borrow::Cow::Borrowed(s), None => std::borrow::Cow::Owned(crate::runtime::stringify_param(self)) }
    }
}
impl CacheKey for String {
    fn strict(&self) -> Option<&str> { Some(self.as_str()) }
    fn text(&self) -> std::borrow::Cow<'_, str> { std::borrow::Cow::Borrowed(self.as_str()) }
}
impl CacheKey for Option<String> {
    fn strict(&self) -> Option<&str> { self.as_deref() }
    fn text(&self) -> std::borrow::Cow<'_, str> { std::borrow::Cow::Borrowed(self.as_deref().unwrap_or("null")) }
}

/// Keyed access to a map of ws handles (`CacheMap`, `BookMap`), with the semantics the untyped
/// dict had for the same key: `has` / `at` / `forget` match string keys only, `lookup` / `put` stringify.
pub trait CacheStore {
    type Entry;
    fn has<K: CacheKey + ?Sized>(&self, key: &K) -> bool;
    fn at<K: CacheKey + ?Sized>(&self, key: &K) -> Option<Self::Entry>;
    fn lookup<K: CacheKey + ?Sized>(&self, key: &K) -> Option<Self::Entry>;
    fn put<K: CacheKey + ?Sized>(&mut self, key: &K, entry: impl Into<Option<Self::Entry>>);
    fn forget<K: CacheKey + ?Sized>(&mut self, key: &K);
    /// `safeValue (m, k, dflt)`: the stringified-key entry, else the (already built) default.
    fn lookup_or<K: CacheKey + ?Sized>(&self, key: &K, dflt: Self::Entry) -> Self::Entry { self.lookup(key).unwrap_or(dflt) }
}

impl CacheStore for CacheMap {
    type Entry = Cache;
    fn has<K: CacheKey + ?Sized>(&self, key: &K) -> bool { key.strict().is_some_and(|k| self.contains_key(k)) }
    fn at<K: CacheKey + ?Sized>(&self, key: &K) -> Option<Cache> { key.strict().and_then(|k| self.get(k)).cloned() }
    fn lookup<K: CacheKey + ?Sized>(&self, key: &K) -> Option<Cache> { self.get(key.text().as_ref()).cloned() }
    /// Writing an absent cache leaves the map as it is (the untyped dict stored a `Null` entry there).
    fn put<K: CacheKey + ?Sized>(&mut self, key: &K, cache: impl Into<Option<Cache>>) {
        if let Some(c) = cache.into() { self.insert(key.text().into_owned(), c); }
    }
    fn forget<K: CacheKey + ?Sized>(&mut self, key: &K) { if let Some(k) = key.strict() { self.shift_remove(k); } }
}

/// The map as a plain dict of cache markers (the `to_value` snapshot): each key is copied, each marker an Arc bump.
impl From<&CacheMap> for Value {
    fn from(m: &CacheMap) -> Value { Value::Map(m.iter().map(|(k, c)| (String::from(k.as_str()), Value::from(c))).collect()) }
}

/// Cache maps keyed by symbol, each keyed by timeframe (`Exchange::ohlcvs`).
pub type CacheShelf = IndexMap<String, CacheMap>;

static NO_CACHES: std::sync::OnceLock<CacheMap> = std::sync::OnceLock::new();

/// Keyed access to a `CacheShelf`, with the untyped dict's key rules: `has` / `shelf` /
/// `forget` match string keys only, `shelf_text` / `ensure` / `reset` / `put2` stringify.
/// A missing inner map reads as an empty one, as a `Value::Null` entry did.
pub trait CacheShelves {
    fn has<K: CacheKey + ?Sized>(&self, key: &K) -> bool;
    fn shelf<K: CacheKey + ?Sized>(&self, key: &K) -> &CacheMap;
    fn shelf_text<K: CacheKey + ?Sized>(&self, key: &K) -> &CacheMap;
    fn ensure<K: CacheKey + ?Sized>(&mut self, key: &K);
    fn reset<K: CacheKey + ?Sized>(&mut self, key: &K);
    fn put2<K: CacheKey + ?Sized, J: CacheKey + ?Sized>(&mut self, key: &K, inner: &J, cache: impl Into<Option<Cache>>);
    fn forget<K: CacheKey + ?Sized>(&mut self, key: &K);
    fn forget2<K: CacheKey + ?Sized, J: CacheKey + ?Sized>(&mut self, key: &K, inner: &J);
}

impl CacheShelves for CacheShelf {
    fn has<K: CacheKey + ?Sized>(&self, key: &K) -> bool { key.strict().is_some_and(|k| self.contains_key(k)) }
    fn shelf<K: CacheKey + ?Sized>(&self, key: &K) -> &CacheMap {
        key.strict().and_then(|k| self.get(k)).unwrap_or_else(|| NO_CACHES.get_or_init(CacheMap::new))
    }
    fn shelf_text<K: CacheKey + ?Sized>(&self, key: &K) -> &CacheMap {
        self.get(key.text().as_ref()).unwrap_or_else(|| NO_CACHES.get_or_init(CacheMap::new))
    }
    fn ensure<K: CacheKey + ?Sized>(&mut self, key: &K) { self.entry(key.text().into_owned()).or_default(); }
    fn reset<K: CacheKey + ?Sized>(&mut self, key: &K) { self.insert(key.text().into_owned(), CacheMap::new()); }
    /// Writing into a missing inner map is a no-op (the untyped write reached a `Null` entry).
    fn put2<K: CacheKey + ?Sized, J: CacheKey + ?Sized>(&mut self, key: &K, inner: &J, cache: impl Into<Option<Cache>>) {
        if let Some(m) = self.get_mut(key.text().as_ref()) { m.put(inner, cache) }
    }
    fn forget<K: CacheKey + ?Sized>(&mut self, key: &K) { if let Some(k) = key.strict() { self.shift_remove(k); } }
    fn forget2<K: CacheKey + ?Sized, J: CacheKey + ?Sized>(&mut self, key: &K, inner: &J) {
        if let Some(m) = key.strict().and_then(|k| self.get_mut(k)) { m.forget(inner) }
    }
}

/// The nested maps as plain dicts of cache markers (the `to_value` snapshot).
impl From<&CacheShelf> for Value {
    fn from(m: &CacheShelf) -> Value { Value::Map(m.iter().map(|(k, c)| (String::from(k.as_str()), Value::from(c))).collect()) }
}

// ─── public factories ─────────────────────────────────────────────────────

pub struct ArrayCache;
impl ArrayCache {
    /// `new ArrayCache(maxSize?)` → marker map. `maxSize` is held as a
    /// `Value::Int` or `Value::Null` (matches the JS `undefined` semantics).
    pub fn new(max_size: impl Into<Value>) -> Cache {
        Cache(new_marker(KIND_ARRAY_CACHE, max_size.into()))
    }
}

pub struct ArrayCacheByTimestamp;
impl ArrayCacheByTimestamp {
    pub fn new(max_size: impl Into<Value>) -> Cache {
        Cache(new_marker(KIND_ARRAY_CACHE_BY_TIMESTAMP, max_size.into()))
    }
}

pub struct ArrayCacheBySymbolById;
impl ArrayCacheBySymbolById {
    pub fn new(max_size: impl Into<Value>) -> Cache {
        Cache(new_marker(KIND_ARRAY_CACHE_BY_SYMBOL_ID, max_size.into()))
    }
}

pub struct ArrayCacheBySymbolBySide;
impl ArrayCacheBySymbolBySide {
    pub fn new(max_size: impl Into<Value>) -> Cache {
        Cache(new_marker(KIND_ARRAY_CACHE_BY_SYMBOL_SIDE, max_size.into()))
    }
}

/// Prediction-market analogue of `ArrayCacheBySymbolById`, keyed by outcome id
/// instead of symbol id. Behaviourally identical for the cache marker, so it
/// reuses the same kind.
pub struct ArrayCacheByOutcomeById;
impl ArrayCacheByOutcomeById {
    pub fn new(max_size: impl Into<Value>) -> Cache {
        Cache(new_marker(KIND_ARRAY_CACHE_BY_OUTCOME_ID, max_size.into()))
    }
}
