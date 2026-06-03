// Hand-written Rust port of `ts/src/base/ws/OrderBookSide.ts`.
//
// In the TS impl every side extends `Array`. We keep that visible shape
// (numeric indexing returns a `[price, size, …]` delta) by storing the
// entries as `Vec<Vec<Value>>` and exposing `Index<usize>` /
// `entries: &[Vec<Value>]` accessors.
//
// Three concrete variants:
//
//   * `OrderBookSide`        — bisect-sorted price ladder
//   * `CountedOrderBookSide` — same, but the 3rd field is an order count
//                              (zero count counts as "delete")
//   * `IndexedOrderBookSide` — keyed by an order id (delta[2]); inserts
//                              are stable-sorted by (price, id)
//
// The `Side` enum encodes the "is this a bid?" flag — the TS code
// stores it as a getter on the subclass (`Asks.side = false`,
// `Bids.side = true`); the only difference is that bid prices sort
// descending, so we negate the price during bisect.

use crate::Value;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Side {
    /// Asks — sorted ascending by price (lowest first).
    Ask,
    /// Bids — sorted descending by price (highest first). TS encodes
    /// this by negating `index_price`; we do the same in `index_price()`.
    Bid,
}

fn as_f64(v: &Value) -> Option<f64> {
    match v {
        Value::Float(f) => Some(*f),
        Value::Int(n)   => Some(*n as f64),
        Value::Str(s)   => s.parse().ok(),
        _ => None,
    }
}

fn as_str(v: &Value) -> Option<String> {
    match v {
        Value::Str(s) => Some(s.clone()),
        Value::Int(n) => Some(n.to_string()),
        _ => None,
    }
}

// ─── basic OrderBookSide ──────────────────────────────────────────────────

#[derive(Debug, Clone)]
pub struct OrderBookSide {
    pub entries: Vec<Vec<Value>>,
    pub side:    Side,
    pub depth:   usize,
}

impl OrderBookSide {
    pub fn new(side: Side, depth: Option<usize>) -> Self {
        Self {
            entries: Vec::new(),
            side,
            depth: depth.unwrap_or(usize::MAX / 2),
        }
    }

    /// Seed from a snapshot. Each delta is cloned in (mirroring the TS
    /// `slice()` defensive copy).
    pub fn seed(&mut self, deltas: &[Vec<Value>]) {
        self.entries.clear();
        for d in deltas { self.store_array(d.clone()); }
    }

    /// Negated price for bids so the underlying sort is always ascending.
    fn index_price(&self, price: f64) -> f64 {
        match self.side { Side::Bid => -price, Side::Ask => price }
    }

    fn entry_index_price(&self, i: usize) -> f64 {
        let p = as_f64(&self.entries[i][0]).unwrap_or(0.0);
        self.index_price(p)
    }

    fn bisect_left(&self, target: f64) -> usize {
        let mut lo = 0usize;
        let mut hi = self.entries.len();
        while lo < hi {
            let mid = (lo + hi) / 2;
            if self.entry_index_price(mid) < target { lo = mid + 1; } else { hi = mid; }
        }
        lo
    }

    /// `store(price, size)` — convenience that builds a 2-element delta.
    pub fn store(&mut self, price: f64, size: f64) {
        self.store_array(vec![Value::Float(price), Value::Float(size)]);
    }

    /// `storeArray([price, size])` — insert / update / delete.
    pub fn store_array(&mut self, delta: Vec<Value>) {
        let price = as_f64(&delta[0]).unwrap_or(0.0);
        let size  = as_f64(&delta[1]).unwrap_or(0.0);
        let target = self.index_price(price);
        let idx = self.bisect_left(target);
        if size != 0.0 {
            if idx < self.entries.len() && self.entry_index_price(idx) == target {
                // Same price level → replace the delta in place
                // (preserves any extra fields the caller passed).
                self.entries[idx] = delta;
            } else {
                self.entries.insert(idx, delta);
            }
        } else if idx < self.entries.len() && self.entry_index_price(idx) == target {
            self.entries.remove(idx);
        }
    }

    /// `limit()` — trim to `depth` entries.
    pub fn limit(&mut self) {
        if self.entries.len() > self.depth {
            self.entries.truncate(self.depth);
        }
    }

    pub fn len(&self) -> usize { self.entries.len() }
    pub fn is_empty(&self) -> bool { self.entries.is_empty() }
    pub fn iter(&self) -> std::slice::Iter<'_, Vec<Value>> { self.entries.iter() }
}

impl std::ops::Index<usize> for OrderBookSide {
    type Output = Vec<Value>;
    fn index(&self, i: usize) -> &Self::Output { &self.entries[i] }
}

// ─── counted variant ──────────────────────────────────────────────────────

/// Three-tuple ladder where `delta[2]` is an order count. A zero size
/// **or** a zero count deletes the level; otherwise the delta replaces
/// the existing level. `store(price, size)` is not supported because
/// the count cannot be inferred.
#[derive(Debug, Clone)]
pub struct CountedOrderBookSide {
    pub entries: Vec<Vec<Value>>,
    pub side:    Side,
    pub depth:   usize,
}

impl CountedOrderBookSide {
    pub fn new(side: Side, depth: Option<usize>) -> Self {
        Self {
            entries: Vec::new(),
            side,
            depth: depth.unwrap_or(usize::MAX / 2),
        }
    }

    pub fn seed(&mut self, deltas: &[Vec<Value>]) {
        self.entries.clear();
        for d in deltas { self.store_array(d.clone()); }
    }

    fn index_price(&self, price: f64) -> f64 {
        match self.side { Side::Bid => -price, Side::Ask => price }
    }

    fn entry_index_price(&self, i: usize) -> f64 {
        let p = as_f64(&self.entries[i][0]).unwrap_or(0.0);
        self.index_price(p)
    }

    fn bisect_left(&self, target: f64) -> usize {
        let mut lo = 0usize;
        let mut hi = self.entries.len();
        while lo < hi {
            let mid = (lo + hi) / 2;
            if self.entry_index_price(mid) < target { lo = mid + 1; } else { hi = mid; }
        }
        lo
    }

    pub fn store_array(&mut self, delta: Vec<Value>) {
        let price = as_f64(&delta[0]).unwrap_or(0.0);
        let size  = as_f64(&delta[1]).unwrap_or(0.0);
        let count = delta.get(2).and_then(as_f64).unwrap_or(0.0);
        let target = self.index_price(price);
        let idx = self.bisect_left(target);
        if size != 0.0 && count != 0.0 {
            if idx < self.entries.len() && self.entry_index_price(idx) == target {
                self.entries[idx] = delta;
            } else {
                self.entries.insert(idx, delta);
            }
        } else if idx < self.entries.len() && self.entry_index_price(idx) == target {
            self.entries.remove(idx);
        }
    }

    pub fn limit(&mut self) {
        if self.entries.len() > self.depth {
            self.entries.truncate(self.depth);
        }
    }

    pub fn len(&self) -> usize { self.entries.len() }
    pub fn is_empty(&self) -> bool { self.entries.is_empty() }
    pub fn iter(&self) -> std::slice::Iter<'_, Vec<Value>> { self.entries.iter() }
}

impl std::ops::Index<usize> for CountedOrderBookSide {
    type Output = Vec<Value>;
    fn index(&self, i: usize) -> &Self::Output { &self.entries[i] }
}

// ─── indexed variant ──────────────────────────────────────────────────────

/// Three-tuple ladder keyed by an order id (`delta[2]`). Tracks
/// `id → price` in a side hashmap so updates can find their existing
/// slot even when the new delta doesn't include the price. Stable
/// secondary sort on id within equal-price runs.
#[derive(Debug, Clone)]
pub struct IndexedOrderBookSide {
    pub entries: Vec<Vec<Value>>,
    pub side:    Side,
    pub depth:   usize,
    /// `id → index_price`. Mirrors TS `hashmap: Map<id, price>`.
    pub hashmap: indexmap::IndexMap<String, f64>,
}

impl IndexedOrderBookSide {
    pub fn new(side: Side, depth: Option<usize>) -> Self {
        Self {
            entries: Vec::new(),
            side,
            depth: depth.unwrap_or(usize::MAX / 2),
            hashmap: indexmap::IndexMap::new(),
        }
    }

    pub fn seed(&mut self, deltas: &[Vec<Value>]) {
        self.entries.clear();
        self.hashmap.clear();
        for d in deltas { self.store_array(d.clone()); }
    }

    fn index_price(&self, price: f64) -> f64 {
        match self.side { Side::Bid => -price, Side::Ask => price }
    }

    fn entry_index_price(&self, i: usize) -> f64 {
        let p = as_f64(&self.entries[i][0]).unwrap_or(0.0);
        self.index_price(p)
    }

    fn entry_id(&self, i: usize) -> String {
        self.entries[i].get(2).and_then(as_str).unwrap_or_default()
    }

    fn bisect_left(&self, target: f64) -> usize {
        let mut lo = 0usize;
        let mut hi = self.entries.len();
        while lo < hi {
            let mid = (lo + hi) / 2;
            if self.entry_index_price(mid) < target { lo = mid + 1; } else { hi = mid; }
        }
        lo
    }

    pub fn store_array(&mut self, mut delta: Vec<Value>) {
        let price = delta.first().and_then(as_f64);
        let size  = delta.get(1).and_then(as_f64).unwrap_or(0.0);
        let id    = delta.get(2).and_then(as_str).unwrap_or_default();
        let mut index_price = price.map(|p| self.index_price(p));

        if size != 0.0 {
            // Update path: id already exists → either tweak in place
            // (price unchanged) or remove the old slot before inserting
            // at the new price.
            if let Some(&old_price) = self.hashmap.get(&id) {
                index_price = index_price.or(Some(old_price));
                // Restore the price field on the delta if the caller
                // omitted it (TS: `delta[0] = Math.abs(index_price)`).
                if let Some(ip) = index_price {
                    if delta.is_empty() {
                        delta.push(Value::Float(ip.abs()));
                    } else if as_f64(&delta[0]).is_none() {
                        delta[0] = Value::Float(ip.abs());
                    }
                }
                if Some(old_price) == index_price {
                    // Find the slot by walking from the bisect point.
                    let mut idx = self.bisect_left(old_price);
                    while idx < self.entries.len() && self.entry_id(idx) != id { idx += 1; }
                    if idx < self.entries.len() {
                        self.entries[idx] = delta;
                    }
                    return;
                }
                // Price changed → remove the old slot, fall through to
                // the insert-new-price path below.
                let mut old_idx = self.bisect_left(old_price);
                while old_idx < self.entries.len() && self.entry_id(old_idx) != id { old_idx += 1; }
                if old_idx < self.entries.len() { self.entries.remove(old_idx); }
            }
            // Insert at sorted position; secondary sort by id within
            // equal-price runs.
            let target = match index_price { Some(p) => p, None => return };
            self.hashmap.insert(id.clone(), target);
            let mut idx = self.bisect_left(target);
            while idx < self.entries.len()
                && self.entry_index_price(idx) == target
                && self.entry_id(idx) < id
            {
                idx += 1;
            }
            self.entries.insert(idx, delta);
        } else if let Some(&old_price) = self.hashmap.get(&id) {
            // Delete path: id known, find its slot, remove from both
            // entries and hashmap.
            let mut idx = self.bisect_left(old_price);
            while idx < self.entries.len() && self.entry_id(idx) != id { idx += 1; }
            if idx < self.entries.len() { self.entries.remove(idx); }
            self.hashmap.shift_remove(&id);
        }
    }

    pub fn limit(&mut self) {
        if self.entries.len() > self.depth {
            // Drop the truncated tail from the hashmap so subsequent
            // store_array() of those ids inserts fresh.
            for i in self.depth..self.entries.len() {
                let id = self.entry_id(i);
                self.hashmap.shift_remove(&id);
            }
            self.entries.truncate(self.depth);
        }
    }

    pub fn len(&self) -> usize { self.entries.len() }
    pub fn is_empty(&self) -> bool { self.entries.is_empty() }
    pub fn iter(&self) -> std::slice::Iter<'_, Vec<Value>> { self.entries.iter() }
}

impl std::ops::Index<usize> for IndexedOrderBookSide {
    type Output = Vec<Value>;
    fn index(&self, i: usize) -> &Self::Output { &self.entries[i] }
}
