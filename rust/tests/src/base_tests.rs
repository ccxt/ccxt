// Base unit tests — exercises the hand-written Rust crate (Precise, Value,
// safeXxx, JSON round-trip) without needing any transpiled exchanges.

use ccxt::value::{
    Value, get_value, set_value, safe_string, safe_number, safe_integer, safe_bool, deep_extend,
};
use ccxt::precise::Precise;
use indexmap::IndexMap as HashMap;

use crate::{assert_eq_msg, assert_true};

pub fn run(ws: bool) -> Result<(), String> {
    if ws {
        // WS base tests are transpiled from ts/src/pro/test/base/*.ts
        // into rust/tests/base_ws/ — wired up in main.rs (gated behind
        // the same `transpiled-tests` feature as the REST suite).
        return Ok(());
    }
    test_precise_arithmetic()?;
    test_precise_compare()?;
    test_precise_to_precision()?;
    test_value_basics()?;
    test_safe_helpers()?;
    test_get_set_value()?;
    test_deep_extend()?;
    test_json_roundtrip()?;
    Ok(())
}

fn run_ws_panicable(f: fn(), name: &str) -> Result<(), String> {
    let outcome = std::panic::catch_unwind(std::panic::AssertUnwindSafe(f));
    if let Err(payload) = outcome {
        let msg = payload.downcast_ref::<String>().cloned()
            .or_else(|| payload.downcast_ref::<&str>().map(|s| (*s).to_string()))
            .unwrap_or_else(|| "<panic>".to_string());
        return Err(format!("{name}: {msg}"));
    }
    Ok(())
}

fn test_precise_arithmetic() -> Result<(), String> {
    assert_eq_msg!(Precise::string_add ("1.5",  "2.25").unwrap(), "3.75",  "stringAdd");
    assert_eq_msg!(Precise::string_sub ("10",   "0.1" ).unwrap(), "9.9",   "stringSub");
    assert_eq_msg!(Precise::string_mul ("2.5",  "4"   ).unwrap(), "10",    "stringMul");
    assert_eq_msg!(Precise::string_div ("10",   "4"   ).unwrap(), "2.5",   "stringDiv");
    assert_eq_msg!(Precise::string_abs ("-3.14"      ).unwrap(), "3.14",  "stringAbs");
    assert_eq_msg!(Precise::string_neg ("3.14"       ).unwrap(), "-3.14", "stringNeg");
    assert_true!(Precise::string_div("1", "0").is_none(),               "div-by-zero");
    Ok(())
}

fn test_precise_compare() -> Result<(), String> {
    assert_true!(Precise::string_eq("1.0",  "1").unwrap(),   "eq");
    assert_true!(Precise::string_gt("2.0",  "1").unwrap(),   "gt");
    assert_true!(Precise::string_ge("1.0",  "1").unwrap(),   "ge");
    assert_true!(Precise::string_lt("0.5",  "1").unwrap(),   "lt");
    assert_true!(Precise::string_le("1.0",  "1").unwrap(),   "le");
    Ok(())
}

fn test_precise_to_precision() -> Result<(), String> {
    // mode 0 = TRUNCATE
    assert_eq_msg!(Precise::string_to_precision("1.23456", 2, 0).unwrap(), "1.23", "truncate");
    // mode 2 (default) = ROUND half-up
    assert_eq_msg!(Precise::string_to_precision("1.235",   2, 2).unwrap(), "1.24", "round-half-up");
    // mode 3 = ROUND_UP (ceiling away from zero)
    assert_eq_msg!(Precise::string_to_precision("1.231",   2, 3).unwrap(), "1.24", "round-up");
    // mode 4 = ROUND_DOWN (floor toward zero)
    assert_eq_msg!(Precise::string_to_precision("1.239",   2, 4).unwrap(), "1.23", "round-down");
    Ok(())
}

fn test_value_basics() -> Result<(), String> {
    let s = Value::str("hi");
    let i = Value::int(42);
    let f = Value::float(1.5);
    let b = Value::bool(true);
    let n = Value::Null;
    assert_true!(s.is_str()    && s.as_str()  == Some("hi"), "Value::Str");
    assert_true!(i.is_int()    && i.as_i64()  == Some(42),   "Value::Int");
    assert_true!(f.is_float()  && f.as_f64()  == Some(1.5),  "Value::Float");
    assert_true!(b.is_bool()   && b.as_bool() == Some(true), "Value::Bool");
    assert_true!(n.is_null(),                                "Value::Null");

    assert_true!( s.is_truthy(), "non-empty str truthy");
    assert_true!(!Value::str("").is_truthy(),  "empty str falsy");
    assert_true!(!Value::int(0).is_truthy(),   "zero int falsy");
    assert_true!(!Value::Null.is_truthy(),     "null falsy");
    Ok(())
}

fn test_safe_helpers() -> Result<(), String> {
    let mut m: HashMap<String, Value> = HashMap::new();
    m.insert("name".to_string(),    Value::str("BTC/USDT"));
    m.insert("price".to_string(),   Value::str("65000.5"));
    m.insert("count".to_string(),   Value::int(7));
    m.insert("flag".to_string(),    Value::bool(true));
    m.insert("nested".to_string(),  Value::int(123));
    let v = Value::Map(m);

    assert_eq_msg!(safe_string(&v, "name", None).unwrap(),  "BTC/USDT", "safe_string hit");
    assert_eq_msg!(safe_string(&v, "missing", Some("d")).unwrap(), "d", "safe_string default");
    assert_eq_msg!(safe_number(&v, "price", None).unwrap(),  65000.5,   "safe_number from string");
    assert_eq_msg!(safe_integer(&v, "count", None).unwrap(), 7i64,      "safe_integer");
    assert_eq_msg!(safe_bool(&v, "flag", None).unwrap(),     true,      "safe_bool");
    assert_eq_msg!(safe_integer(&v, "nested", None).unwrap(), 123i64,   "safe_integer from int");
    assert_true!(safe_string(&Value::Null, "x", None).is_none(),        "safe_string on null");
    Ok(())
}

fn test_get_set_value() -> Result<(), String> {
    let mut m: HashMap<String, Value> = HashMap::new();
    m.insert("a".to_string(), Value::int(1));
    let mut v = Value::Map(m);

    let got = get_value(&v, &Value::str("a"));
    assert_true!(got == Value::int(1), "get_value map hit");

    set_value(&mut v, &Value::str("b"), Value::int(2));
    let got_b = get_value(&v, &Value::str("b"));
    assert_true!(got_b == Value::int(2), "set_value map insert");

    let arr = Value::Array(vec![Value::int(10), Value::int(20), Value::int(30)]);
    let got_idx = get_value(&arr, &Value::int(1));
    assert_true!(got_idx == Value::int(20), "get_value array index");

    let miss = get_value(&v, &Value::str("missing"));
    assert_true!(miss.is_null(), "get_value miss is Null");
    Ok(())
}

fn test_deep_extend() -> Result<(), String> {
    let mut a: HashMap<String, Value> = HashMap::new();
    a.insert("x".to_string(), Value::int(1));
    let mut inner: HashMap<String, Value> = HashMap::new();
    inner.insert("nested".to_string(), Value::int(10));
    a.insert("y".to_string(), Value::Map(inner));

    let mut b: HashMap<String, Value> = HashMap::new();
    b.insert("x".to_string(), Value::int(2));               // overrides
    let mut inner_b: HashMap<String, Value> = HashMap::new();
    inner_b.insert("added".to_string(), Value::int(99));    // merges into y
    b.insert("y".to_string(), Value::Map(inner_b));

    let out = deep_extend(Value::Map(a), Value::Map(b));
    let out_map = out.as_map().ok_or("deep_extend should be map")?;
    assert_true!(out_map.get("x") == Some(&Value::int(2)), "deep_extend override");
    let y = out_map.get("y").and_then(Value::as_map).ok_or("y should be map")?;
    assert_true!(y.get("nested") == Some(&Value::int(10)), "deep_extend keeps nested");
    assert_true!(y.get("added")  == Some(&Value::int(99)), "deep_extend merges nested");
    Ok(())
}

fn test_json_roundtrip() -> Result<(), String> {
    let src = serde_json::json!({
        "id":      "btc",
        "price":   42.5,
        "active":  true,
        "qty":     null,
        "levels":  [1, 2, 3],
    });
    let v: Value = Value::from_json(&src);
    let back     = v.to_json();
    assert_true!(back == src, "JSON round-trip");
    Ok(())
}
