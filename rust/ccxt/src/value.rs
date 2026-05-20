// Native Rust – hand-written Value type.
//
// The ast-transpiler emits `Value::Map(...)`, `Value::Str(...)`, etc.
// This module defines those variants so generated code compiles without
// requiring serde_json macros in every file.
//
// At the HTTP boundary (exchange.rs) we convert between Value and
// serde_json::Value for serialisation / deserialisation.

use std::collections::HashMap;

/// A dynamic value type that mirrors the CCXT JavaScript Value semantics.
#[derive(Debug, Clone, PartialEq)]
pub enum Value {
    Null,
    Bool(bool),
    Int(i64),
    Float(f64),
    Str(String),
    Map(HashMap<String, Value>),
    Array(Vec<Value>),
}

impl Default for Value {
    fn default() -> Self {
        Value::Null
    }
}

impl Value {
    /// No-op stub matching `Precise::reduce()` from TS. `Precise::new(v)`
    /// in the Rust port currently returns a Value-shaped object; this
    /// satisfies the `precise.reduce()` call shape until Precise is a
    /// real struct in Rust.
    pub fn reduce(&mut self) { /* no-op */ }

    /// `append(item)` on an Array — pushes the item. No-op on other
    /// variants. Mirrors TS `array.push` shape (single arg, no return).
    pub fn append(&mut self, item: Value) {
        if let Value::Array(a) = self { a.push(item); }
    }

    /// Constructor named to match the ast-transpiler's emission shape:
    /// `Value::List(vec![...])`. Aliases `Value::Array`. Note that this
    /// is a function, not a variant — so pattern matches still use
    /// `Value::Array(_)`, not `Value::List(_)`.
    #[allow(non_snake_case)]
    pub fn List(items: Vec<Value>) -> Value {
        Value::Array(items)
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
    pub fn is_map(&self)    -> bool { matches!(self, Value::Map(_)) }
    pub fn is_array(&self)  -> bool { matches!(self, Value::Array(_)) }
    pub fn is_truthy(&self) -> bool {
        match self {
            Value::Null       => false,
            Value::Bool(b)    => *b,
            Value::Int(n)     => *n != 0,
            Value::Float(f)   => *f != 0.0,
            Value::Str(s)     => !s.is_empty(),
            Value::Map(m)     => !m.is_empty(),
            Value::Array(a)   => !a.is_empty(),
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
        if let Value::Map(m) = self { Some(m) } else { None }
    }
    pub fn as_array(&self) -> Option<&Vec<Value>> {
        if let Value::Array(a) = self { Some(a) } else { None }
    }

    /// Length of array, map, or string; 0 for everything else.
    /// String length counts Unicode chars (matches TS `String#length`
    /// closely enough for ASCII-only API addresses/identifiers).
    pub fn len(&self) -> usize {
        match self {
            Value::Array(a) => a.len(),
            Value::Map(m)   => m.len(),
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
            Value::Array(a)    => serde_json::Value::Array(a.iter().map(Value::to_json).collect()),
            Value::Map(m)      => serde_json::Value::Object(
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
            Value::Array(a)    => write!(f, "[{} items]", a.len()),
            Value::Map(m)      => write!(f, "{{{}  keys}}", m.len()),
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

/// Access a value in a map by string key, or array by integer key encoded as
/// a `Value::Str` / `Value::Int`. Returns `Value::Null` on miss.
pub fn get_value(obj: &Value, key: &Value) -> Value {
    match (obj, key) {
        (Value::Map(m), Value::Str(k)) => m.get(k).cloned().unwrap_or(Value::Null),
        (Value::Array(a), Value::Int(i)) => a.get(*i as usize).cloned().unwrap_or(Value::Null),
        (Value::Array(a), Value::Str(k)) => {
            if let Ok(i) = k.parse::<usize>() {
                a.get(i).cloned().unwrap_or(Value::Null)
            } else {
                Value::Null
            }
        }
        _ => Value::Null,
    }
}

/// Set a key/index in a map or array value.
pub fn set_value(obj: &mut Value, key: &Value, val: Value) {
    match (obj, key) {
        (Value::Map(m), Value::Str(k)) => { m.insert(k.clone(), val); }
        (Value::Array(a), Value::Int(i)) => {
            let idx = *i as usize;
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
        (Value::Map(mut d), Value::Map(s)) => {
            for (k, v) in s {
                let entry = d.remove(&k).unwrap_or(Value::Null);
                d.insert(k, deep_extend(entry, v));
            }
            Value::Map(d)
        }
        (_, src) => src,
    }
}
