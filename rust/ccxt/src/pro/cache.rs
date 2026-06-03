// Hand-written Rust port of `ts/src/base/ws/Cache.ts`.
//
// In TypeScript the cache classes extend `Array`, exposing both
// numeric indexing (`cache[0]`) and named methods (`append`, `clear`,
// `getLimit`). The JS prototype chain plus `Object.defineProperty`
// hides bookkeeping fields like `hashmap`, `newUpdatesBySymbol`, etc.
//
// Rust doesn't subclass collections; instead each cache owns a
// `Vec<Value>` and exposes:
//
//   * `len()` / `is_empty()` / `clear()`     — array-shaped surface
//   * `append(item)`                          — class-specific insert
//   * `get_limit(symbol, limit)`              — new-update tracking
//   * `Index<usize>` / `iter()`               — numeric access
//
// The bookkeeping fields are public so the WS base tests can poke at
// them directly (mirroring the TS tests which read `cache.length`,
// `cache.hashmap`, etc.). The hidden-via-`defineProperty` distinction
// from TS doesn't matter here — we just don't ship a `Display` impl
// that includes them.

use crate::Value;
use indexmap::IndexMap;
use std::collections::HashSet;

// ─── BaseCache ────────────────────────────────────────────────────────────

/// Common surface shared by every cache class — owns the backing `Vec`
/// and the optional `max_size` rolling-window cap.
#[derive(Debug, Clone, Default)]
pub struct BaseCache {
    /// Public so callers can iterate / index via the cache's `Index`
    /// impl below. The Rust analogue of "extends Array".
    pub items: Vec<Value>,
    /// `None` ↔ TS `maxSize === undefined`; `Some(0)` also matches the
    /// JS short-circuit (`if (this.maxSize && …)` treats 0 as falsy).
    pub max_size: Option<usize>,
}

impl BaseCache {
    pub fn new(max_size: Option<usize>) -> Self {
        Self { items: Vec::new(), max_size }
    }
    /// JS `this.length = 0`.
    pub fn clear(&mut self) { self.items.clear(); }
    pub fn len(&self) -> usize { self.items.len() }
    pub fn is_empty(&self) -> bool { self.items.is_empty() }
    pub fn iter(&self) -> std::slice::Iter<'_, Value> { self.items.iter() }
    /// JS `arr.push(item)`.
    pub fn push(&mut self, item: Value) { self.items.push(item); }
    /// JS `arr.shift()` — returns the removed element or `Value::Null`.
    pub fn shift(&mut self) -> Value {
        if self.items.is_empty() { Value::Null } else { self.items.remove(0) }
    }
}

// ─── helpers ──────────────────────────────────────────────────────────────

fn symbol_of(item: &Value) -> Option<String> {
    match item {
        Value::Dict(d) => match d.get("symbol") {
            Some(Value::Str(s)) => Some(s.clone()),
            _ => None,
        },
        _ => None,
    }
}

fn id_of(item: &Value) -> Option<String> {
    match item {
        Value::Dict(d) => match d.get("id") {
            Some(Value::Str(s)) => Some(s.clone()),
            _ => None,
        },
        _ => None,
    }
}

fn side_of(item: &Value) -> Option<String> {
    match item {
        Value::Dict(d) => match d.get("side") {
            Some(Value::Str(s)) => Some(s.clone()),
            _ => None,
        },
        _ => None,
    }
}

fn arr_at(item: &Value, idx: usize) -> Option<Value> {
    match item {
        Value::Arr(a) => a.get(idx).cloned(),
        _ => None,
    }
}

fn dict_insert(target: &mut Value, key: &str, value: Value) {
    if let Value::Dict(d) = target {
        let m = std::sync::Arc::make_mut(d);
        m.insert(key.to_string(), value);
    }
}

// ─── ArrayCache ────────────────────────────────────────────────────────────

/// Rolling buffer keyed by insertion order with per-symbol update
/// counters. Matches `ts/src/base/ws/Cache.ts::ArrayCache`.
#[derive(Debug, Clone, Default)]
pub struct ArrayCache {
    pub base: BaseCache,
    /// `false` for plain `ArrayCache` (each symbol's update count is a
    /// scalar `i64`), `true` for the BySymbolById / BySymbolBySide
    /// subclasses (the count is the size of a `HashSet`). The TS code
    /// stores this on the prototype; in Rust we just carry the flag.
    pub nested_new_updates_by_symbol: bool,
    /// Per-symbol update counter. For `ArrayCache` this map holds
    /// `Value::Int(n)`; for the subclasses it holds a `Value::Arr` of
    /// ids/sides (we use `Value::Arr` to share storage cheaply via
    /// `Arc<Vec<Value>>` rather than a `HashSet`).
    pub new_updates_by_symbol: IndexMap<String, NewUpdatesEntry>,
    /// Per-symbol "next append should reset this counter" flag.
    pub clear_updates_by_symbol: IndexMap<String, bool>,
    pub all_new_updates: i64,
    pub clear_all_updates: bool,
    /// Mirrors TS `this.hashmap`. Not used by plain `ArrayCache` itself
    /// but the BySymbolById / BySymbolBySide subclasses store their
    /// lookup index here (`symbol → id → item-ref` / `symbol → side → item-ref`).
    pub hashmap: IndexMap<String, IndexMap<String, usize>>,
}

/// The per-symbol counter is either a scalar or a set of ids/sides
/// (depending on the subclass). Modelled as an enum so we don't
/// allocate a `HashSet` for the plain-ArrayCache case.
#[derive(Debug, Clone)]
pub enum NewUpdatesEntry {
    Count(i64),
    Set(HashSet<String>),
}

impl NewUpdatesEntry {
    pub fn size(&self) -> i64 {
        match self {
            NewUpdatesEntry::Count(n) => *n,
            NewUpdatesEntry::Set(s)   => s.len() as i64,
        }
    }
}

impl ArrayCache {
    pub fn new(max_size: Option<usize>) -> Self {
        Self { base: BaseCache::new(max_size), ..Default::default() }
    }

    /// `getLimit(symbol, limit)` — port of the TS impl. Returns the
    /// number of "new" items since the last call; resets the
    /// per-symbol (or all-symbol) counter on next `append`.
    pub fn get_limit(&mut self, symbol: Option<&str>, limit: Option<i64>) -> i64 {
        let new_updates_value: Option<i64>;
        match symbol {
            None => {
                new_updates_value = Some(self.all_new_updates);
                self.clear_all_updates = true;
            }
            Some(sym) => {
                new_updates_value = self.new_updates_by_symbol.get(sym).map(|e| {
                    if self.nested_new_updates_by_symbol { e.size() } else { e.size() }
                });
                self.clear_updates_by_symbol.insert(sym.to_string(), true);
            }
        }
        match (new_updates_value, limit) {
            (None,    _)        => limit.unwrap_or(i64::MAX),
            (Some(v), Some(l))  => v.min(l),
            (Some(v), None)     => v,
        }
    }

    /// `append(item)` for plain ArrayCache.
    pub fn append(&mut self, item: Value) {
        // maxSize may be 0 when initialised by a `.filter()` copy
        // (TS `Array.prototype.filter()` returns a new instance with
        // `maxSize: 0`). Treat 0 like "no cap" for symmetry with JS's
        // truthiness check.
        if let Some(cap) = self.base.max_size {
            if cap > 0 && self.base.len() == cap {
                self.base.shift();
            }
        }
        self.base.push(item.clone());
        self.reset_counters_if_needed(&item);
        let sym = symbol_of(&item).unwrap_or_default();
        let entry = self.new_updates_by_symbol
            .entry(sym)
            .or_insert(NewUpdatesEntry::Count(0));
        if let NewUpdatesEntry::Count(n) = entry { *n += 1; }
        self.all_new_updates += 1;
    }

    fn reset_counters_if_needed(&mut self, item: &Value) {
        if self.clear_all_updates {
            self.clear_all_updates = false;
            self.clear_updates_by_symbol.clear();
            self.all_new_updates = 0;
            self.new_updates_by_symbol.clear();
        }
        let sym = symbol_of(item).unwrap_or_default();
        if matches!(self.clear_updates_by_symbol.get(&sym), Some(true)) {
            self.clear_updates_by_symbol.insert(sym.clone(), false);
            // Reset the per-symbol counter. For Set entries clear the
            // set; for Count entries reset to 0.
            match self.new_updates_by_symbol.get_mut(&sym) {
                Some(NewUpdatesEntry::Count(n)) => *n = 0,
                Some(NewUpdatesEntry::Set(s))   => s.clear(),
                None => {}
            }
        }
    }
}

// ─── ArrayCacheByTimestamp ─────────────────────────────────────────────────

/// OHLCV-shaped cache keyed by the first element of each row (a
/// timestamp). Repeated appends with the same timestamp update the
/// existing row in place.
#[derive(Debug, Clone, Default)]
pub struct ArrayCacheByTimestamp {
    pub base: BaseCache,
    /// timestamp → index in `base.items`. We model the JS hashmap
    /// (which stored the array reference) as the position so we can
    /// mutate the underlying row in place.
    pub hashmap: IndexMap<String, usize>,
    pub size_tracker: HashSet<String>,
    pub new_updates: i64,
    pub clear_updates: bool,
}

impl ArrayCacheByTimestamp {
    pub fn new(max_size: Option<usize>) -> Self {
        Self { base: BaseCache::new(max_size), ..Default::default() }
    }

    pub fn get_limit(&mut self, _symbol: Option<&str>, limit: Option<i64>) -> i64 {
        self.clear_updates = true;
        match limit {
            None    => self.new_updates,
            Some(l) => self.new_updates.min(l),
        }
    }

    /// `append([ts, o, h, l, c, v])`.
    pub fn append(&mut self, item: Value) {
        let ts_key = match arr_at(&item, 0) {
            Some(Value::Int(n))   => n.to_string(),
            Some(Value::Float(f)) => f.to_string(),
            Some(Value::Str(s))   => s,
            _ => String::new(),
        };
        if let Some(&idx) = self.hashmap.get(&ts_key) {
            // Update in place: replace the existing row with the new
            // values (TS copies prop-by-prop; for our `Value::Arr`
            // shape, replacing the whole entry yields the same
            // observable result).
            if self.base.items.get(idx).cloned().unwrap_or(Value::Null) != item {
                self.base.items[idx] = item.clone();
            }
        } else {
            // New timestamp. Evict the oldest row if we hit the cap.
            if let Some(cap) = self.base.max_size {
                if cap > 0 && self.base.len() == cap {
                    let removed = self.base.shift();
                    let removed_key = match arr_at(&removed, 0) {
                        Some(Value::Int(n))   => n.to_string(),
                        Some(Value::Float(f)) => f.to_string(),
                        Some(Value::Str(s))   => s,
                        _ => String::new(),
                    };
                    self.hashmap.shift_remove(&removed_key);
                    // Shift down every other hashmap index now that
                    // index 0 is gone.
                    for v in self.hashmap.values_mut() { *v = v.saturating_sub(1); }
                }
            }
            let idx = self.base.items.len();
            self.base.items.push(item);
            self.hashmap.insert(ts_key.clone(), idx);
        }
        if self.clear_updates {
            self.clear_updates = false;
            self.size_tracker.clear();
        }
        self.size_tracker.insert(ts_key);
        self.new_updates = self.size_tracker.len() as i64;
    }
}

// ─── ArrayCacheBySymbolById ────────────────────────────────────────────────

/// `<symbol → id → items>` map plus the rolling buffer. Re-appending an
/// existing `(symbol, id)` moves the entry to the end of the buffer
/// (TS uses `findIndex` + `splice` for this; we walk `items` in
/// reverse to find the duplicate).
#[derive(Debug, Clone, Default)]
pub struct ArrayCacheBySymbolById {
    pub base: BaseCache,
    pub hashmap: IndexMap<String, IndexMap<String, Value>>,
    pub new_updates_by_symbol: IndexMap<String, HashSet<String>>,
    pub clear_updates_by_symbol: IndexMap<String, bool>,
    pub all_new_updates: i64,
    pub clear_all_updates: bool,
}

impl ArrayCacheBySymbolById {
    pub fn new(max_size: Option<usize>) -> Self {
        Self { base: BaseCache::new(max_size), ..Default::default() }
    }

    pub fn get_limit(&mut self, symbol: Option<&str>, limit: Option<i64>) -> i64 {
        let new_updates_value: Option<i64>;
        match symbol {
            None => {
                new_updates_value = Some(self.all_new_updates);
                self.clear_all_updates = true;
            }
            Some(sym) => {
                new_updates_value = self.new_updates_by_symbol.get(sym).map(|s| s.len() as i64);
                self.clear_updates_by_symbol.insert(sym.to_string(), true);
            }
        }
        match (new_updates_value, limit) {
            (None,    _)        => limit.unwrap_or(i64::MAX),
            (Some(v), Some(l))  => v.min(l),
            (Some(v), None)     => v,
        }
    }

    pub fn append(&mut self, mut item: Value) {
        let symbol = symbol_of(&item).unwrap_or_default();
        let id = id_of(&item).unwrap_or_default();

        let by_id = self.hashmap.entry(symbol.clone()).or_default();
        let was_duplicate = by_id.contains_key(&id);
        if was_duplicate {
            // TS: merge `item` props onto the existing reference, then
            // splice the old slot out and push the merged item to the
            // end. We perform the prop-merge by overwriting the
            // existing entry with the new value (since the only thing
            // tests observe is the final equality of the array slot).
            let merged = match (by_id.get(&id).cloned(), item.clone()) {
                (Some(Value::Dict(old)), Value::Dict(new_)) => {
                    let mut merged = (*old).clone();
                    for (k, v) in new_.iter() { merged.insert(k.clone(), v.clone()); }
                    Value::Dict(std::sync::Arc::new(merged))
                }
                (_, new_) => new_,
            };
            by_id.insert(id.clone(), merged.clone());
            item = merged;
            // Remove the existing slot from `base.items`.
            if let Some(pos) = self.base.items.iter().position(|x| id_of(x).as_deref() == Some(&id)
                && symbol_of(x).as_deref() == Some(&symbol)) {
                self.base.items.remove(pos);
            }
        } else {
            by_id.insert(id.clone(), item.clone());
        }
        // Evict from front if at capacity.
        if let Some(cap) = self.base.max_size {
            if cap > 0 && self.base.len() == cap {
                let removed = self.base.shift();
                let r_sym = symbol_of(&removed).unwrap_or_default();
                let r_id  = id_of(&removed).unwrap_or_default();
                if let Some(inner) = self.hashmap.get_mut(&r_sym) {
                    inner.shift_remove(&r_id);
                }
            }
        }
        self.base.push(item);

        // Per-symbol new-update tracking (Set of ids — duplicate id
        // doesn't bump the counter).
        if self.clear_all_updates {
            self.clear_all_updates = false;
            self.clear_updates_by_symbol.clear();
            self.all_new_updates = 0;
            self.new_updates_by_symbol.clear();
        }
        let entry = self.new_updates_by_symbol
            .entry(symbol.clone())
            .or_insert_with(HashSet::new);
        if matches!(self.clear_updates_by_symbol.get(&symbol), Some(true)) {
            self.clear_updates_by_symbol.insert(symbol.clone(), false);
            entry.clear();
        }
        let before = entry.len();
        entry.insert(id);
        let after  = entry.len();
        self.all_new_updates += (after - before) as i64;
    }
}

// ─── ArrayCacheBySymbolBySide ─────────────────────────────────────────────

#[derive(Debug, Clone, Default)]
pub struct ArrayCacheBySymbolBySide {
    pub base: BaseCache,
    pub hashmap: IndexMap<String, IndexMap<String, Value>>,
    pub new_updates_by_symbol: IndexMap<String, HashSet<String>>,
    pub clear_updates_by_symbol: IndexMap<String, bool>,
    pub all_new_updates: i64,
    pub clear_all_updates: bool,
}

impl ArrayCacheBySymbolBySide {
    pub fn new() -> Self { Self::default() }

    pub fn get_limit(&mut self, symbol: Option<&str>, limit: Option<i64>) -> i64 {
        let new_updates_value: Option<i64>;
        match symbol {
            None => {
                new_updates_value = Some(self.all_new_updates);
                self.clear_all_updates = true;
            }
            Some(sym) => {
                new_updates_value = self.new_updates_by_symbol.get(sym).map(|s| s.len() as i64);
                self.clear_updates_by_symbol.insert(sym.to_string(), true);
            }
        }
        match (new_updates_value, limit) {
            (None,    _)        => limit.unwrap_or(i64::MAX),
            (Some(v), Some(l))  => v.min(l),
            (Some(v), None)     => v,
        }
    }

    pub fn append(&mut self, mut item: Value) {
        let symbol = symbol_of(&item).unwrap_or_default();
        let side = side_of(&item).unwrap_or_default();

        let by_side = self.hashmap.entry(symbol.clone()).or_default();
        let was_duplicate = by_side.contains_key(&side);
        if was_duplicate {
            let merged = match (by_side.get(&side).cloned(), item.clone()) {
                (Some(Value::Dict(old)), Value::Dict(new_)) => {
                    let mut merged = (*old).clone();
                    for (k, v) in new_.iter() { merged.insert(k.clone(), v.clone()); }
                    Value::Dict(std::sync::Arc::new(merged))
                }
                (_, new_) => new_,
            };
            by_side.insert(side.clone(), merged.clone());
            item = merged;
            if let Some(pos) = self.base.items.iter().position(|x|
                symbol_of(x).as_deref() == Some(&symbol)
                && side_of(x).as_deref()  == Some(&side)) {
                self.base.items.remove(pos);
            }
        } else {
            by_side.insert(side.clone(), item.clone());
        }
        self.base.push(item);

        if self.clear_all_updates {
            self.clear_all_updates = false;
            self.clear_updates_by_symbol.clear();
            self.all_new_updates = 0;
            self.new_updates_by_symbol.clear();
        }
        let entry = self.new_updates_by_symbol
            .entry(symbol.clone())
            .or_insert_with(HashSet::new);
        if matches!(self.clear_updates_by_symbol.get(&symbol), Some(true)) {
            self.clear_updates_by_symbol.insert(symbol.clone(), false);
            entry.clear();
        }
        let before = entry.len();
        entry.insert(side);
        let after  = entry.len();
        self.all_new_updates += (after - before) as i64;
    }
}

// ─── Index impls ──────────────────────────────────────────────────────────

impl std::ops::Index<usize> for BaseCache {
    type Output = Value;
    fn index(&self, i: usize) -> &Self::Output { &self.items[i] }
}
impl std::ops::Index<usize> for ArrayCache {
    type Output = Value;
    fn index(&self, i: usize) -> &Self::Output { &self.base[i] }
}
impl std::ops::Index<usize> for ArrayCacheByTimestamp {
    type Output = Value;
    fn index(&self, i: usize) -> &Self::Output { &self.base[i] }
}
impl std::ops::Index<usize> for ArrayCacheBySymbolById {
    type Output = Value;
    fn index(&self, i: usize) -> &Self::Output { &self.base[i] }
}
impl std::ops::Index<usize> for ArrayCacheBySymbolBySide {
    type Output = Value;
    fn index(&self, i: usize) -> &Self::Output { &self.base[i] }
}
