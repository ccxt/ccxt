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

/// Internal constructor: builds the marker `Value::Dict` with default
/// bookkeeping fields. Per-kind overrides flip specific fields after.
fn new_marker(kind: &str, max_size: Value) -> Value {
    let mut m = IndexMap::new();
    m.insert("__cacheKind".to_string(),       Value::Str(kind.to_string()));
    m.insert("maxSize".to_string(),           max_size);
    m.insert("_data".to_string(),             Value::Array(Vec::new()));
    m.insert("hashmap".to_string(),          Value::Map(IndexMap::new()));
    m.insert("_newUpdatesBySymbol".to_string(),   Value::Map(IndexMap::new()));
    m.insert("_clearUpdatesBySymbol".to_string(), Value::Map(IndexMap::new()));
    m.insert("_allNewUpdates".to_string(),    Value::Int(0));
    m.insert("_clearAllUpdates".to_string(),  Value::Bool(false));
    // Per-timestamp cache fields (default zero/empty; unused by the
    // other kinds).
    m.insert("_sizeTracker".to_string(),      Value::Map(IndexMap::new()));
    m.insert("_newUpdates".to_string(),       Value::Int(0));
    m.insert("_clearUpdates".to_string(),     Value::Bool(false));
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
        new_marker(KIND_ARRAY_CACHE_BY_SYMBOL_ID, max_size)
    }
}
