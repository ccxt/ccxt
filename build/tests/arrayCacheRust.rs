// Hand-written Rust cache tests. Kept outside the generated rust/ tree and
// wired into its WS test aggregator by rustTranspiler.ts.
use ccxt::pro::*;
use ccxt::runtime::{add_element_to_object, get_array_length};
use ccxt::{get_value, Value};

fn text(s: &str) -> Value {
    Value::Str(s.to_string())
}
fn map(entries: &[(&str, Value)]) -> Value {
    Value::Map(
        entries
            .iter()
            .map(|(k, v)| (k.to_string(), v.clone()))
            .collect(),
    )
}
fn field(v: &Value, k: &str) -> Value {
    get_value(v, &text(k))
}
fn at(v: &Value, i: i64) -> Value {
    get_value(v, &Value::Int(i))
}
fn put(v: &mut Value, k: &str, item: Value) {
    add_element_to_object(v, &text(k), item);
}
fn order(symbol: &str, key: Value) -> Value {
    map(&[
        ("symbol", text(symbol)),
        ("id", key.clone()),
        ("side", key.clone()),
        ("outcome", text(symbol)),
    ])
}

pub fn test_ws_cache_native() {
    shared_clones_and_clear();
    hashmap_write_through();
    legacy_markers_and_invalid_fields();
    native_timestamp_and_key_shapes();
    defensive_legacy_state();
    non_cache_facades();
}

fn shared_clones_and_clear() {
    for factory in [
        ArrayCache::new,
        ArrayCacheByTimestamp::new,
        ArrayCacheBySymbolById::new,
        ArrayCacheBySymbolBySide::new,
        ArrayCacheByOutcomeById::new,
    ] {
        let mut cache = factory(Value::Int(2));
        let alias = cache.clone();
        let candle = field(&cache, "__cacheKind") == text("ArrayCacheByTimestamp");
        let item = if candle {
            Value::List(vec![Value::Int(100), Value::Int(1)])
        } else {
            order("A", text("1"))
        };
        cache.append(item.clone());
        assert_eq!(at(&alias, 0), item);
        assert_eq!(get_array_length(&alias), Value::Int(1));
        assert_eq!(cache.get_limit(Value::Null, Value::Int(5)), Value::Int(1));
        cache.clear();
        assert_eq!(get_array_length(&alias), Value::Int(0));
        assert_eq!(cache.get_limit(Value::Null, Value::Null), Value::Int(0));
        cache.append(item.clone());
        assert_eq!(at(&alias, 0), item);
        assert_eq!(cache.get_limit(Value::Null, Value::Null), Value::Int(1));
    }
}

fn hashmap_write_through() {
    for factory in [ArrayCacheBySymbolById::new, ArrayCacheBySymbolBySide::new] {
        let mut cache = factory(Value::Null);
        cache.append(order("B", text("1")));
        cache.append(order("A", text("2")));
        cache.append(order("A", text("1")));
        let mut bucket = field(&cache.hashmap(), "A");
        let mut replacement = order("A", text("1"));
        put(&mut replacement, "filled", Value::Int(7));
        // The side variant deliberately tests a row without an id: the write
        // must match the side key, not accidentally rely on the id fallback.
        if field(&cache, "__cacheKind") == text("ArrayCacheBySymbolBySide") {
            ccxt::runtime::remove(&mut replacement, &text("id"));
            cache.clear();
            cache.append(replacement.clone());
            bucket = field(&cache.hashmap(), "A");
            put(&mut replacement, "filled", Value::Int(8));
            put(&mut bucket, "1", replacement.clone());
            assert_eq!(at(&cache, 0), replacement);
        } else {
            put(&mut bucket, "1", replacement.clone());
            assert_eq!(at(&cache, 2), replacement);
            assert_eq!(field(&at(&cache, 0), "symbol"), text("B"));
        }
        assert_eq!(field(&field(&cache.hashmap(), "A"), "1"), replacement);
        // A stale tagged bucket can repopulate its index after clear, but
        // must not invent a row in the now-empty rolling buffer.
        cache.clear();
        put(&mut bucket, "1", replacement.clone());
        assert_eq!(get_array_length(&cache), Value::Int(0));
        assert_eq!(field(&field(&cache.hashmap(), "A"), "1"), replacement);
    }
    let mut candles = ArrayCacheByTimestamp::new(Value::Null);
    candles.append(Value::List(vec![Value::Int(100), Value::Int(1)]));
    assert_eq!(field(&candles.hashmap(), "100"), Value::Int(0));
    for backref in [
        Value::Null,
        Value::List(vec![]),
        Value::List(vec![text("invalid"), Value::Int(0)]),
    ] {
        let mut bucket = map(&[("__cache_backref", backref)]);
        put(&mut bucket, "1", Value::Int(7));
        assert_eq!(field(&bucket, "1"), Value::Int(7));
    }
}

fn legacy_markers_and_invalid_fields() {
    for kind in [
        "ArrayCache",
        "ArrayCacheByTimestamp",
        "ArrayCacheBySymbolById",
        "ArrayCacheBySymbolBySide",
        "ArrayCacheByOutcomeById",
    ] {
        // Legacy markers keep state inline rather than in the shared registry.
        let mut cache = map(&[("__cacheKind", text(kind)), ("maxSize", Value::Int(2))]);
        assert_eq!(get_array_length(&cache), Value::Int(0));
        assert_eq!(at(&cache, 0), Value::Null);
        assert_eq!(
            ccxt::value::cache_entries_as_value(&cache),
            Some(Value::List(vec![]))
        );
        assert_eq!(
            cache.get_limit(Value::Bool(true), Value::Int(9)),
            if kind == "ArrayCacheByTimestamp" {
                Value::Int(0)
            } else {
                Value::Int(9)
            }
        );
        let item = if kind == "ArrayCacheByTimestamp" {
            Value::List(vec![Value::Int(1)])
        } else {
            order("A", text("1"))
        };
        put(&mut cache, "_data", Value::Int(0));
        put(&mut cache, "hashmap", Value::Int(0));
        put(&mut cache, "_newUpdatesBySymbol", Value::Int(0));
        cache.append(item.clone());
        assert_eq!(at(&cache, 0), item);
        assert_eq!(get_array_length(&cache), Value::Int(1));
        assert_eq!(
            ccxt::value::cache_entries_as_value(&cache),
            Some(Value::List(vec![item.clone()]))
        );
        assert_ne!(cache.hashmap(), Value::Null);
        cache.clear();
        assert_eq!(get_array_length(&cache), Value::Int(0));
        cache.append(item.clone());
        assert_eq!(at(&cache, 0), item);
    }
    let mut unknown = map(&[("__cacheKind", Value::Int(0))]);
    unknown.append(Value::Int(1));
    unknown.clear();
    assert_eq!(get_array_length(&unknown), Value::Int(0));
    assert_eq!(unknown.get_limit(Value::Null, Value::Null), Value::Int(0));
}

fn native_timestamp_and_key_shapes() {
    for stamp in [Value::Float(1.5), text("stamp"), Value::Null] {
        let mut cache = ArrayCacheByTimestamp::new(Value::Int(1));
        let first = Value::List(vec![stamp, Value::Int(1)]);
        cache.append(first.clone());
        cache.append(first);
        assert_eq!(get_array_length(&cache), Value::Int(1));
        cache.append(Value::List(vec![Value::Int(200), Value::Int(2)]));
        assert_eq!(field(&cache.hashmap(), "200"), Value::Int(0));
        assert_eq!(get_array_length(&cache), Value::Int(1));
    }
    let mut candles = ArrayCacheByTimestamp::new(Value::Int(1));
    candles.append(text("malformed row"));
    candles.append(Value::List(vec![Value::Int(300)]));
    assert_eq!(get_array_length(&candles), Value::Int(1));
    for key in [Value::Float(1.5), Value::Bool(true), Value::Null] {
        let mut cache = ArrayCacheBySymbolById::new(Value::Null);
        let item = order("A", key);
        cache.append(item.clone());
        assert_eq!(at(&cache, 0), item);
        assert_eq!(cache.get_limit(text("A"), Value::Null), Value::Int(1));
    }
    let mut plain = ArrayCache::new(Value::Null);
    plain.append(Value::Int(1));
    assert_eq!(at(&plain, 0), Value::Int(1));
    assert_eq!(plain.get_limit(Value::Null, Value::Null), Value::Int(1));
}

fn non_cache_facades() {
    for mut other in [Value::Null, Value::Int(1), map(&[])] {
        assert_eq!(other.hashmap(), Value::Null);
        assert_eq!(other.get_limit(Value::Null, Value::Int(3)), Value::Int(3));
        assert_eq!(ccxt::value::cache_entries_as_value(&other), None);
        other.append(Value::Int(2));
        other.clear();
    }
}

fn defensive_legacy_state() {
    // A missing registry cell is initialized lazily. Derive a fresh negative
    // test-only id so repetitions cannot collide with this or other tests.
    let seed = field(&ArrayCache::new(Value::Null), "__cache_id");
    let reserved = match seed {
        Value::Int(n) => Value::Int(-n),
        _ => panic!("factory must allocate an id"),
    };
    let mut shared = map(&[
        ("__cacheKind", text("ArrayCache")),
        ("__cache_id", reserved),
    ]);
    assert_eq!(shared.hashmap(), Value::Null);
    assert_eq!(at(&shared, 0), Value::Null);
    assert_eq!(
        ccxt::value::cache_entries_as_value(&shared),
        Some(Value::List(vec![]))
    );
    shared.append(order("A", text("1")));
    assert_eq!(get_array_length(&shared), Value::Int(1));
    shared.clear();
    let mut malformed = map(&[
        ("__cacheKind", text("ArrayCacheBySymbolById")),
        ("hashmap", map(&[("A", Value::Bool(false))])),
        ("_seenUpdatesBySymbol", map(&[("A", Value::Bool(false))])),
        ("_seenUpdatesAll", map(&[("A", Value::Bool(false))])),
    ]);
    malformed.append(order("A", text("1")));
    assert_eq!(get_array_length(&malformed), Value::Int(1));
    assert_eq!(malformed.get_limit(text("A"), Value::Null), Value::Int(0));
    for with_seen in [false, true] {
        let mut inherited = map(&[
            ("__cacheKind", text("ArrayCacheBySymbolById")),
            ("maxSize", Value::Int(1)),
            ("_data", Value::List(vec![order("A", text("1"))])),
        ]);
        if with_seen {
            put(
                &mut inherited,
                "_seenUpdatesBySymbol",
                map(&[("A", map(&[("1", Value::Bool(true))]))]),
            );
        }
        inherited.append(order("B", text("2")));
        assert_eq!(at(&inherited, 0), order("B", text("2")));
        assert_eq!(inherited.get_limit(text("B"), Value::Null), Value::Int(1));
    }
    let mut non_maps = ArrayCacheBySymbolById::new(Value::Null);
    non_maps.append(Value::Int(1));
    non_maps.append(Value::Int(2));
    assert_eq!(get_array_length(&non_maps), Value::Int(2));
    assert_eq!(at(&non_maps, 1), Value::Int(2));
}
