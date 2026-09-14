//! Exchange-specific extra parameters, without exposing [`Value`].
//!
//! Every unified method ends with a `params` argument carrying the knobs a
//! particular venue understands (`timeInForce`, `reduceOnly`, `marginMode`, …).
//! The typed layer takes a [`Params`] here rather than a raw [`Value`], so a
//! caller only ever handles Rust primitives:
//!
//! ```ignore
//! // nothing extra
//! ex.create_order("BTC/USDT", "limit", "buy", 0.01, Some(50_000.0), Params::none()).await?;
//!
//! // a couple of venue-specific knobs
//! ex.create_order("BTC/USDT", "limit", "buy", 0.01, Some(50_000.0),
//!     Params::new()
//!         .with_str("timeInForce", "GTC")
//!         .with_bool("postOnly", true)
//!         .with_float("stopPrice", 49_000.0),
//! ).await?;
//! ```
//!
//! Values keep insertion order, matching the JS object ordering the transpiled
//! code and every signing routine expect.
use crate::Value;
use indexmap::IndexMap;

/// Extra exchange-specific parameters for a unified call.
///
/// Build with [`Params::new`] and the `with_*` setters, or [`Params::none`]
/// when a method needs no extras. Cheap to clone and `Default`-constructible.
#[derive(Clone, Debug, Default, PartialEq)]
pub struct Params {
    entries: IndexMap<String, Value>,
}

impl Params {
    /// An empty parameter set.
    pub fn new() -> Self {
        Self::default()
    }

    /// An empty parameter set — reads better at a call site than
    /// `Params::new()` when you are explicitly passing "no extras".
    pub fn none() -> Self {
        Self::default()
    }

    /// `true` when nothing has been set.
    pub fn is_empty(&self) -> bool {
        self.entries.is_empty()
    }

    /// Number of parameters set.
    pub fn len(&self) -> usize {
        self.entries.len()
    }

    /// Set a string parameter.
    pub fn with_str(mut self, key: &str, value: &str) -> Self {
        self.entries.insert(key.to_string(), Value::Str(value.to_string()));
        self
    }

    /// Set an integer parameter.
    pub fn with_int(mut self, key: &str, value: i64) -> Self {
        self.entries.insert(key.to_string(), Value::Int(value));
        self
    }

    /// Set a floating-point parameter.
    pub fn with_float(mut self, key: &str, value: f64) -> Self {
        self.entries.insert(key.to_string(), Value::Float(value));
        self
    }

    /// Set a boolean parameter.
    pub fn with_bool(mut self, key: &str, value: bool) -> Self {
        self.entries.insert(key.to_string(), Value::Bool(value));
        self
    }

    /// Set a list-of-strings parameter (e.g. a batch of client order ids).
    pub fn with_strs(mut self, key: &str, values: &[&str]) -> Self {
        let list: Vec<Value> = values.iter().map(|s| Value::Str((*s).to_string())).collect();
        self.entries.insert(key.to_string(), Value::Arr(std::sync::Arc::new(list)));
        self
    }

    /// Set a nested parameter from a JSON literal, for the rare venue that
    /// wants a structured object. Invalid JSON is stored as a plain string.
    pub fn with_json(mut self, key: &str, json: &str) -> Self {
        let parsed = crate::runtime::json_parse(&Value::Str(json.to_string()));
        let v = if matches!(parsed, Value::Null) { Value::Str(json.to_string()) } else { parsed };
        self.entries.insert(key.to_string(), v);
        self
    }

    /// Set a nested object from another `Params`. Calling this twice with the
    /// same key MERGES — the second call adds to the object rather than
    /// replacing it.
    pub fn with_params(mut self, key: &str, value: Params) -> Self {
        let mut base = match self.entries.get(key) {
            Some(Value::Dict(d)) => (**d).clone(),
            _ => IndexMap::new(),
        };
        deep_merge(&mut base, value.into_entries());
        // `insert` on an existing key keeps its original position.
        self.entries.insert(key.to_string(), Value::Dict(std::sync::Arc::new(base)));
        self
    }

    /// The entries, for callers that need to embed this object somewhere.
    pub(crate) fn into_entries(self) -> IndexMap<String, Value> {
        self.entries
    }

    /// Like [`Params::into_value`] but an empty set stays an empty object
    /// rather than collapsing to `Value::Null` — used when nesting, where the
    /// key should still exist.
    pub fn into_value_object(self) -> Value {
        Value::Dict(std::sync::Arc::new(self.entries))
    }

    /// Lower to the dynamic representation the transpiled core consumes.
    /// An empty set becomes `Value::Null`, which every unified method treats
    /// as "no extra params".
    pub fn into_value(self) -> Value {
        if self.entries.is_empty() {
            return Value::Null;
        }
        Value::Map(self.entries)
    }
}

impl From<Params> for Value {
    fn from(p: Params) -> Value {
        p.into_value()
    }
}

/// Back-compat: existing call sites that already hold a `Value` (including
/// `Value::Null`) keep working without a conversion at the call site.
impl From<Value> for Params {
    fn from(v: Value) -> Params {
        match v {
            Value::Dict(entries) => Params {
                entries: std::sync::Arc::try_unwrap(entries).unwrap_or_else(|a| (*a).clone()),
            },
            Value::Null => Params::default(),
            // Anything else is not a parameter object; treat it as no params
            // rather than silently corrupting the request.
            _ => Params::default(),
        }
    }
}

/// `()` reads as "no extra params" at a call site.
impl From<()> for Params {
    fn from(_: ()) -> Params {
        Params::default()
    }
}

impl<const N: usize> From<[(&str, &str); N]> for Params {
    fn from(pairs: [(&str, &str); N]) -> Params {
        let mut p = Params::new();
        for (k, v) in pairs {
            p = p.with_str(k, v);
        }
        p
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn empty_lowers_to_null() {
        assert!(matches!(Params::none().into_value(), Value::Null));
        assert!(Params::new().is_empty());
    }

    #[test]
    fn preserves_insertion_order_and_types() {
        let v = Params::new()
            .with_str("timeInForce", "GTC")
            .with_bool("postOnly", true)
            .with_float("stopPrice", 49_000.0)
            .with_int("recvWindow", 5_000)
            .into_value();
        let map = match &v { Value::Dict(m) => m, _ => panic!("expected a map") };
        let keys: Vec<&str> = map.keys().map(|k| k.as_str()).collect();
        assert_eq!(keys, ["timeInForce", "postOnly", "stopPrice", "recvWindow"]);
        assert_eq!(map["postOnly"], Value::Bool(true));
        assert_eq!(map["recvWindow"], Value::Int(5_000));
    }

    #[test]
    fn round_trips_through_value() {
        let p = Params::new().with_str("a", "1").with_int("b", 2);
        let back: Params = Params::from(p.clone().into_value());
        assert_eq!(p, back);
    }

    #[test]
    fn value_null_and_unit_are_empty() {
        assert!(Params::from(Value::Null).is_empty());
        assert!(Params::from(()).is_empty());
    }

    #[test]
    fn array_literal_shorthand() {
        let p: Params = [("timeInForce", "IOC"), ("newClientOrderId", "x1")].into();
        assert_eq!(p.len(), 2);
    }
}

/// Constructor configuration for an exchange, without exposing [`Value`].
///
/// ```ignore
/// let ex = Binance::with_config(
///     Config::new()
///         .api_key(&key)
///         .secret(&secret)
///         .sandbox(true)
///         .option_strs("fetchMarkets.types", &["spot"]),
/// );
/// ```
///
/// `options` nests exactly the way it does in every other ccxt binding. What
/// the manual writes as
///
/// ```text
/// { "options": { "fetchMarkets": { "types": ["spot"] } } }
/// ```
///
/// is built with [`Config::option`] and a nested [`Params`]:
///
/// ```ignore
/// Config::new().option("fetchMarkets", Params::new().with_strs("types", &["spot"]))
/// ```
///
/// Use [`Config::option_str`] and friends for a flat key
/// (`options: { defaultType: "swap" }`), or [`Config::options`] to hand over
/// the whole block at once.
#[derive(Clone, Debug, Default, PartialEq)]
pub struct Config {
    top: IndexMap<String, Value>,
    options: IndexMap<String, Value>,
}

impl Config {
    pub fn new() -> Self {
        Self::default()
    }

    /// No configuration — same as `Config::new()`, clearer at a call site.
    pub fn none() -> Self {
        Self::default()
    }

    pub fn api_key(self, v: &str) -> Self { self.set_str("apiKey", v) }
    pub fn secret(self, v: &str) -> Self { self.set_str("secret", v) }
    pub fn password(self, v: &str) -> Self { self.set_str("password", v) }
    pub fn uid(self, v: &str) -> Self { self.set_str("uid", v) }
    pub fn wallet_address(self, v: &str) -> Self { self.set_str("walletAddress", v) }
    pub fn private_key(self, v: &str) -> Self { self.set_str("privateKey", v) }
    pub fn token(self, v: &str) -> Self { self.set_str("token", v) }

    /// Route to the venue's testnet / demo endpoints.
    pub fn sandbox(self, on: bool) -> Self { self.option_bool("sandbox", on) }
    /// Client-side rate limiting (on by default in ccxt).
    pub fn enable_rate_limit(self, on: bool) -> Self { self.set_bool("enableRateLimit", on) }
    /// Milliseconds per rate-limit token.
    pub fn rate_limit_ms(self, ms: i64) -> Self { self.set_int("rateLimit", ms) }
    /// Request timeout in milliseconds.
    pub fn timeout_ms(self, ms: i64) -> Self { self.set_int("timeout", ms) }
    /// Log every request and response.
    pub fn verbose(self, on: bool) -> Self { self.set_bool("verbose", on) }

    /// Set an arbitrary top-level property.
    pub fn set_str(mut self, key: &str, v: &str) -> Self {
        self.top.insert(key.to_string(), Value::Str(v.to_string()));
        self
    }
    pub fn set_int(mut self, key: &str, v: i64) -> Self {
        self.top.insert(key.to_string(), Value::Int(v));
        self
    }
    pub fn set_float(mut self, key: &str, v: f64) -> Self {
        self.top.insert(key.to_string(), Value::Float(v));
        self
    }
    pub fn set_bool(mut self, key: &str, v: bool) -> Self {
        self.top.insert(key.to_string(), Value::Bool(v));
        self
    }

    /// Merge a whole `options` block in — the closest match to passing an
    /// options dict wholesale in the other language bindings. Deep-merges, so
    /// it composes with anything already set (`sandbox`, earlier `option`
    /// calls) instead of discarding it.
    pub fn options(mut self, options: Params) -> Self {
        deep_merge(&mut self.options, options.into_entries());
        self
    }

    /// Set one nested object under `options`, e.g.
    /// `option("fetchMarkets", Params::new().with_strs("types", &["spot"]))`
    /// for `options: { fetchMarkets: { types: ["spot"] } }`.
    ///
    /// Calling it twice with the same key MERGES the two objects, so nested
    /// options can be built up across several calls.
    pub fn option(mut self, key: &str, value: Params) -> Self {
        let mut base = match self.options.get(key) {
            Some(Value::Dict(d)) => (**d).clone(),
            _ => IndexMap::new(),
        };
        deep_merge(&mut base, value.into_entries());
        self.options.insert(key.to_string(), Value::Dict(std::sync::Arc::new(base)));
        self
    }

    /// Set a flat entry under `options`. The key is taken literally.
    pub fn option_str(self, key: &str, v: &str) -> Self {
        self.option_value(key, Value::Str(v.to_string()))
    }
    pub fn option_int(self, key: &str, v: i64) -> Self {
        self.option_value(key, Value::Int(v))
    }
    pub fn option_float(self, key: &str, v: f64) -> Self {
        self.option_value(key, Value::Float(v))
    }
    pub fn option_bool(self, key: &str, v: bool) -> Self {
        self.option_value(key, Value::Bool(v))
    }
    pub fn option_strs(self, key: &str, values: &[&str]) -> Self {
        let list: Vec<Value> = values.iter().map(|s| Value::Str((*s).to_string())).collect();
        self.option_value(key, Value::Arr(std::sync::Arc::new(list)))
    }

    fn option_value(mut self, key: &str, v: Value) -> Self {
        self.options.insert(key.to_string(), v);
        self
    }

    /// Lower to the dynamic representation the transpiled core consumes.
    pub fn into_value(self) -> Value {
        let mut top = self.top;
        if !self.options.is_empty() {
            // Merge into any `options` already set through `set_*`.
            let merged = match top.shift_remove("options") {
                Some(Value::Dict(existing)) => {
                    let mut m = (*existing).clone();
                    for (k, v) in self.options { m.insert(k, v); }
                    m
                }
                _ => self.options,
            };
            top.insert("options".to_string(), Value::Dict(std::sync::Arc::new(merged)));
        }
        if top.is_empty() { Value::Null } else { Value::Dict(std::sync::Arc::new(top)) }
    }

    /// `Some(value)` for the generated `new(Option<Value>)` constructors.
    pub fn into_option(self) -> Option<Value> {
        match self.into_value() {
            Value::Null => None,
            v => Some(v),
        }
    }
}

/// Recursive merge, mirroring ccxt's `deepExtend`: nested objects combine,
/// anything else is overwritten by the incoming value.
fn deep_merge(into: &mut IndexMap<String, Value>, from: IndexMap<String, Value>) {
    for (k, v) in from {
        let merged = match (into.get(&k), &v) {
            (Some(Value::Dict(a)), Value::Dict(b)) => {
                let mut m = (**a).clone();
                deep_merge(&mut m, (**b).clone());
                Value::Dict(std::sync::Arc::new(m))
            }
            _ => v,
        };
        into.insert(k, merged);
    }
}

impl From<Config> for Value {
    fn from(c: Config) -> Value { c.into_value() }
}

impl From<Config> for Option<Value> {
    fn from(c: Config) -> Option<Value> { c.into_option() }
}

#[cfg(test)]
mod config_tests {
    use super::*;

    fn dict(v: &Value) -> IndexMap<String, Value> {
        match v { Value::Dict(d) => (**d).clone(), other => panic!("expected a dict, got {other:?}") }
    }

    #[test]
    fn empty_config_is_none() {
        assert!(Config::new().into_option().is_none());
    }

    // The shape every other ccxt binding sends for
    // `{"options": {"fetchMarkets": {"types": [...]}, "defaultType": "..."}}`.
    #[test]
    fn options_nest_like_the_other_bindings() {
        let v = Config::new()
            .api_key("k")
            .option("fetchMarkets", Params::new().with_strs("types", &["spot", "linear"]))
            .option_str("defaultType", "spot")
            .sandbox(true)
            .into_value();
        let top = dict(&v);
        assert_eq!(top["apiKey"], Value::Str("k".into()));
        let options = dict(&top["options"]);
        assert_eq!(options["defaultType"], Value::Str("spot".into()));
        assert_eq!(options["sandbox"], Value::Bool(true));
        // The nested object, exactly as the other bindings send it.
        let fetch_markets = dict(&options["fetchMarkets"]);
        let types = match &fetch_markets["types"] { Value::Arr(a) => a.clone(), _ => panic!("types") };
        assert_eq!(&types[..], &[Value::Str("spot".into()), Value::Str("linear".into())]);
    }

    #[test]
    fn options_block_can_be_handed_over_wholesale() {
        let v = Config::new()
            .options(Params::new()
                .with_params("fetchMarkets", Params::new().with_strs("types", &["swap"]))
                .with_str("defaultType", "swap"))
            .into_value();
        let options = dict(&dict(&v)["options"]);
        assert_eq!(options["defaultType"], Value::Str("swap".into()));
        let types = match &dict(&options["fetchMarkets"])["types"] { Value::Arr(a) => a.clone(), _ => panic!("types") };
        assert_eq!(&types[..], &[Value::Str("swap".into())]);
    }

    // Several entries at the same level: just keep chaining.
    #[test]
    fn many_entries_at_one_level() {
        let v = Config::new()
            .option("fetchMarkets", Params::new()
                .with_strs("types", &["spot", "swap"])
                .with_bool("skipDelisted", true)
                .with_int("limit", 500))
            .into_value();
        let fm = dict(&dict(&dict(&v)["options"])["fetchMarkets"]);
        assert_eq!(fm.len(), 3);
        assert_eq!(fm["skipDelisted"], Value::Bool(true));
        assert_eq!(fm["limit"], Value::Int(500));
    }

    // Repeated `option` calls for the same key add to it rather than replace.
    #[test]
    fn repeated_option_calls_merge() {
        let v = Config::new()
            .option("fetchMarkets", Params::new().with_strs("types", &["spot"]))
            .option("fetchMarkets", Params::new().with_bool("skipDelisted", true))
            .into_value();
        let fm = dict(&dict(&dict(&v)["options"])["fetchMarkets"]);
        assert_eq!(fm.len(), 2, "second call must not clobber the first");
        assert!(matches!(fm["types"], Value::Arr(_)));
        assert_eq!(fm["skipDelisted"], Value::Bool(true));
    }

    // `options()` composes with settings made before AND after it.
    #[test]
    fn options_block_merges_with_neighbours() {
        let v = Config::new()
            .sandbox(true)
            .options(Params::new().with_str("defaultType", "swap"))
            .option_int("recvWindow", 5_000)
            .into_value();
        let options = dict(&dict(&v)["options"]);
        assert_eq!(options["sandbox"], Value::Bool(true), "sandbox must survive options()");
        assert_eq!(options["defaultType"], Value::Str("swap".into()));
        assert_eq!(options["recvWindow"], Value::Int(5_000));
    }

    #[test]
    fn a_literal_dot_in_a_key_stays_a_literal_dot() {
        let v = Config::new().option_str("a.b", "x").into_value();
        assert_eq!(dict(&dict(&v)["options"])["a.b"], Value::Str("x".into()));
    }
}
