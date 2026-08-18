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
    // see value::CACHE_STORE. The marker Dict keeps only the immutable tags.
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
    m.insert("__cacheKind".to_string(),       Value::Str(kind.to_string()));
    m.insert("__cache_id".to_string(),        Value::Int(id));
    m.insert("maxSize".to_string(),           max_size);
    Value::Map(m)
}

// ─── public factories ─────────────────────────────────────────────────────

pub struct ArrayCache;
impl ArrayCache {
    /// `new ArrayCache(maxSize?)` → marker map. `maxSize` is held as a
    /// `Value::Int` or `Value::Null` (matches the JS `undefined` semantics).
    pub fn new(max_size: Value) -> Value {
        new_marker(KIND_ARRAY_CACHE, max_size)
    }
}

pub struct ArrayCacheByTimestamp;
impl ArrayCacheByTimestamp {
    pub fn new(max_size: Value) -> Value {
        new_marker(KIND_ARRAY_CACHE_BY_TIMESTAMP, max_size)
    }
}

pub struct ArrayCacheBySymbolById;
impl ArrayCacheBySymbolById {
    pub fn new(max_size: Value) -> Value {
        new_marker(KIND_ARRAY_CACHE_BY_SYMBOL_ID, max_size)
    }
}

pub struct ArrayCacheBySymbolBySide;
impl ArrayCacheBySymbolBySide {
    pub fn new(max_size: Value) -> Value {
        new_marker(KIND_ARRAY_CACHE_BY_SYMBOL_SIDE, max_size)
    }
}

/// Prediction-market analogue of `ArrayCacheBySymbolById`, keyed by outcome id
/// instead of symbol id. Behaviourally identical for the cache marker, so it
/// reuses the same kind.
pub struct ArrayCacheByOutcomeById;
impl ArrayCacheByOutcomeById {
    pub fn new(max_size: Value) -> Value {
        new_marker(KIND_ARRAY_CACHE_BY_OUTCOME_ID, max_size)
    }
}
