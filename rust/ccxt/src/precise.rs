// Native Rust – Precise decimal arithmetic.
//
// Mirrors CCXT's Precise.ts exactly.  All arithmetic operates on string
// representations to avoid floating-point rounding issues, and all inputs
// / outputs are Strings (just like the TypeScript version).

use rust_decimal::Decimal;
use rust_decimal::prelude::*;
use std::str::FromStr;

/// Parse a string to a `Decimal`, returning `None` on failure.
fn parse(s: &str) -> Option<Decimal> {
    Decimal::from_str(s).ok()
}

/// Format a `Decimal` back to a string without trailing zeros.
fn fmt(d: Decimal) -> String {
    let s = d.to_string();
    // Remove trailing zeros after decimal point (but keep at least one digit)
    let out = if s.contains('.') {
        s.trim_end_matches('0').trim_end_matches('.').to_owned()
    } else {
        s
    };
    // Normalise negative zero ("-0") → "0".
    if out.bytes().all(|b| matches!(b, b'-' | b'0' | b'.')) {
        "0".to_string()
    } else {
        out
    }
}

// ── public API ────────────────────────────────────────────────────────────────

pub fn string_add(a: &str, b: &str) -> Option<String> {
    Some(fmt(parse(a)? + parse(b)?))
}

pub fn string_sub(a: &str, b: &str) -> Option<String> {
    Some(fmt(parse(a)? - parse(b)?))
}

pub fn string_mul(a: &str, b: &str) -> Option<String> {
    Some(fmt(parse(a)? * parse(b)?))
}

pub fn string_div(a: &str, b: &str) -> Option<String> {
    let divisor = parse(b)?;
    if divisor.is_zero() { return None; }
    Some(fmt(parse(a)? / divisor))
}

pub fn string_mod(a: &str, b: &str) -> Option<String> {
    let divisor = parse(b)?;
    if divisor.is_zero() { return None; }
    Some(fmt(parse(a)? % divisor))
}

pub fn string_eq(a: &str, b: &str) -> Option<bool> {
    Some(parse(a)? == parse(b)?)
}

pub fn string_gt(a: &str, b: &str) -> Option<bool> {
    Some(parse(a)? > parse(b)?)
}

pub fn string_ge(a: &str, b: &str) -> Option<bool> {
    Some(parse(a)? >= parse(b)?)
}

pub fn string_lt(a: &str, b: &str) -> Option<bool> {
    Some(parse(a)? < parse(b)?)
}

pub fn string_le(a: &str, b: &str) -> Option<bool> {
    Some(parse(a)? <= parse(b)?)
}

pub fn string_abs(a: &str) -> Option<String> {
    Some(fmt(parse(a)?.abs()))
}

pub fn string_neg(a: &str) -> Option<String> {
    Some(fmt(-parse(a)?))
}

/// Round to `decimals` decimal places using the specified rounding mode.
/// mode 0 = TRUNCATE, mode 2 = ROUND (half-up), mode 3 = ROUND_UP, mode 4 = ROUND_DOWN
pub fn string_to_precision(a: &str, decimals: u32, mode: u8) -> Option<String> {
    let d = parse(a)?;
    let rounded = match mode {
        0 => d.trunc_with_scale(decimals),
        3 => {
            // ROUND_UP (away from zero)
            let scale = Decimal::from(10u64.pow(decimals));
            (d * scale).ceil() / scale
        }
        4 => {
            // ROUND_DOWN (toward zero)
            let scale = Decimal::from(10u64.pow(decimals));
            (d * scale).floor() / scale
        }
        _ => d.round_dp(decimals), // ROUND half-up
    };
    let s = format!("{:.prec$}", rounded, prec = decimals as usize);
    Some(s)
}

/// Parses the number of significant digits in a decimal string.
pub fn precise_from_string(s: &str) -> Option<Decimal> {
    parse(s)
}

// ── precision-aware division ────────────────────────────────────────────────
//
// `string_div` above uses `rust_decimal` (fixed ~28-digit precision, rounds).
// The TS `Precise.stringDiv (a, b, precision)` uses arbitrary-precision
// big-integer math and *truncates* the result to exactly `precision`
// decimal places. `string_div_prec` ports that algorithm with `i128`
// (sufficient for the realistic value range; falls back to `string_div`
// on overflow).

/// Parses a decimal string into `(integer, decimals)` exactly like the
/// TS `Precise` constructor (handles scientific `e` notation).
fn precise_parse(s: &str) -> Option<(i128, i32)> {
    let mut num = s.to_lowercase();
    let mut modifier: i32 = 0;
    if let Some(epos) = num.find('e') {
        let exp = num[epos + 1..].to_string();
        modifier = exp.parse().ok()?;
        num = num[..epos].to_string();
    }
    let decimals: i32 = match num.find('.') {
        Some(di) => (num.len() - di - 1) as i32,
        None => 0,
    };
    let integer: i128 = num.replace('.', "").parse().ok()?;
    Some((integer, decimals - modifier))
}

/// Port of `Precise.reduce()` — strips trailing zeros from the integer.
fn precise_reduce(integer: i128, decimals: i32) -> (i128, i32) {
    let string = integer.to_string();
    let start = string.len() as i32 - 1;
    if start == 0 {
        return if string == "0" { (integer, 0) } else { (integer, decimals) };
    }
    let bytes = string.as_bytes();
    let mut i = start;
    while i >= 0 && bytes[i as usize] == b'0' {
        i -= 1;
    }
    let difference = start - i;
    if difference == 0 {
        return (integer, decimals);
    }
    let new_int: i128 = string[..(i + 1) as usize].parse().unwrap_or(integer);
    (new_int, decimals - difference)
}

/// Port of `Precise.toString()`.
fn precise_to_string(integer: i128, decimals: i32) -> String {
    let (integer, decimals) = precise_reduce(integer, decimals);
    let sign = if integer < 0 { "-" } else { "" };
    let abs_str = integer.unsigned_abs().to_string();
    let pad_len = if decimals > 0 { decimals as usize } else { 0 };
    let padded = if abs_str.len() < pad_len {
        "0".repeat(pad_len - abs_str.len()) + &abs_str
    } else {
        abs_str
    };
    let arr: Vec<char> = padded.chars().collect();
    let index = arr.len() as i32 - decimals;
    let item: String = if index == 0 {
        "0.".to_string()
    } else if decimals < 0 {
        "0".repeat((-decimals) as usize)
    } else if decimals == 0 {
        String::new()
    } else {
        ".".to_string()
    };
    let idx = index.max(0) as usize;
    let mut result = String::new();
    for (k, c) in arr.iter().enumerate() {
        if k == idx {
            result.push_str(&item);
        }
        result.push(*c);
    }
    if idx >= arr.len() {
        result.push_str(&item);
    }
    format!("{sign}{result}")
}

/// Normalises a decimal string by stripping trailing fractional
/// zeros (mirrors `Precise.reduce()` + `toString()`). Falls back to
/// the input on overflow / parse failure.
pub fn reduce_string(s: &str) -> String {
    match precise_parse(s) {
        Some((integer, decimals)) => precise_to_string(integer, decimals),
        None => s.to_string(),
    }
}

/// Port of `Precise.stringDiv (a, b, precision)` — truncating
/// big-integer division to exactly `precision` decimal places.
pub fn string_div_prec(a: &str, b: &str, precision: i64) -> Option<String> {
    let (a_int, a_dec) = match precise_parse(a) {
        Some(v) => v,
        None => return string_div(a, b),
    };
    let (b_int, b_dec) = match precise_parse(b) {
        Some(v) => v,
        None => return string_div(a, b),
    };
    if b_int == 0 {
        return None;
    }
    let precision = precision as i32;
    let distance = precision - a_dec + b_dec;
    let numerator: i128 = if distance == 0 {
        a_int
    } else if distance < 0 {
        match 10i128.checked_pow((-distance) as u32) {
            Some(exp) => a_int / exp,
            None => return string_div(a, b),
        }
    } else {
        match 10i128.checked_pow(distance as u32).and_then(|e| a_int.checked_mul(e)) {
            Some(v) => v,
            None => return string_div(a, b),
        }
    };
    Some(precise_to_string(numerator / b_int, precision))
}

/// A struct wrapper matching CCXT Precise class usage (e.g. `Precise::string_add`).
pub struct Precise;

impl Precise {
    /// TS-style `new Precise(x)` constructor — returns the string-form value.
    pub fn new(v: crate::Value) -> crate::Value {
        crate::Value::Str(crate::runtime::stringify_param(&v))
    }
}

impl Precise {
    pub fn string_add(a: &str, b: &str) -> Option<String> { string_add(a, b) }
    pub fn string_sub(a: &str, b: &str) -> Option<String> { string_sub(a, b) }
    pub fn string_mul(a: &str, b: &str) -> Option<String> { string_mul(a, b) }
    pub fn string_div(a: &str, b: &str) -> Option<String> { string_div(a, b) }
    pub fn string_mod(a: &str, b: &str) -> Option<String> { string_mod(a, b) }
    pub fn string_eq(a: &str, b: &str)  -> Option<bool>   { string_eq(a, b) }
    pub fn string_gt(a: &str, b: &str)  -> Option<bool>   { string_gt(a, b) }
    pub fn string_ge(a: &str, b: &str)  -> Option<bool>   { string_ge(a, b) }
    pub fn string_lt(a: &str, b: &str)  -> Option<bool>   { string_lt(a, b) }
    pub fn string_le(a: &str, b: &str)  -> Option<bool>   { string_le(a, b) }
    pub fn string_abs(a: &str)          -> Option<String>  { string_abs(a) }
    pub fn string_neg(a: &str)          -> Option<String>  { string_neg(a) }
    pub fn string_to_precision(a: &str, decimals: u32, mode: u8) -> Option<String> {
        string_to_precision(a, decimals, mode)
    }
}

// ── Value-accepting versions (used by transpiled code) ───────────────────────
//
// The transpiler emits `Precise::stringDiv(a, b)` with Value arguments. These
// camelCase methods stringify their args and dispatch to the typed versions
// above. They return `Value` so the rest of the transpiled code can chain.

#[allow(non_snake_case)]
impl Precise {
    fn vstr(v: &crate::Value) -> String { crate::runtime::stringify_param(v) }
    fn vopt(s: Option<String>) -> crate::Value { match s { Some(s) => crate::Value::Str(s), None => crate::Value::Null } }
    fn vbool(b: Option<bool>)  -> crate::Value { match b { Some(b) => crate::Value::Bool(b), None => crate::Value::Null } }

    pub fn stringAdd(a: &crate::Value, b: &crate::Value) -> crate::Value { Self::vopt(string_add(&Self::vstr(a), &Self::vstr(b))) }
    pub fn stringSub(a: &crate::Value, b: &crate::Value) -> crate::Value { Self::vopt(string_sub(&Self::vstr(a), &Self::vstr(b))) }
    pub fn stringMul(a: &crate::Value, b: &crate::Value) -> crate::Value { Self::vopt(string_mul(&Self::vstr(a), &Self::vstr(b))) }
    pub fn stringDiv(a: &crate::Value, b: &crate::Value) -> crate::Value {
        // TS `Precise.stringDiv` defaults to precision 18 (truncating).
        Self::vopt(string_div_prec(&Self::vstr(a), &Self::vstr(b), 18))
    }
    /// `Precise.stringDiv (a, b, precision)` — truncating division to a
    /// given number of decimal places.
    pub fn stringDivPrec(a: &crate::Value, b: &crate::Value, precision: &crate::Value) -> crate::Value {
        let prec: i64 = match precision {
            crate::Value::Int(n)   => *n,
            crate::Value::Float(f) => *f as i64,
            crate::Value::Str(s)   => s.parse().unwrap_or(18),
            _ => 18,
        };
        Self::vopt(string_div_prec(&Self::vstr(a), &Self::vstr(b), prec))
    }
    pub fn stringMod(a: &crate::Value, b: &crate::Value) -> crate::Value { Self::vopt(string_mod(&Self::vstr(a), &Self::vstr(b))) }
    pub fn stringEq(a: &crate::Value, b: &crate::Value)  -> crate::Value { Self::vbool(string_eq(&Self::vstr(a), &Self::vstr(b))) }
    pub fn stringGt(a: &crate::Value, b: &crate::Value)  -> crate::Value { Self::vbool(string_gt(&Self::vstr(a), &Self::vstr(b))) }
    pub fn stringGe(a: &crate::Value, b: &crate::Value)  -> crate::Value { Self::vbool(string_ge(&Self::vstr(a), &Self::vstr(b))) }
    pub fn stringLt(a: &crate::Value, b: &crate::Value)  -> crate::Value { Self::vbool(string_lt(&Self::vstr(a), &Self::vstr(b))) }
    pub fn stringLe(a: &crate::Value, b: &crate::Value)  -> crate::Value { Self::vbool(string_le(&Self::vstr(a), &Self::vstr(b))) }
    pub fn stringAbs(a: &crate::Value)                   -> crate::Value { Self::vopt(string_abs(&Self::vstr(a))) }
    pub fn stringNeg(a: &crate::Value)                   -> crate::Value { Self::vopt(string_neg(&Self::vstr(a))) }
    pub fn stringMin(a: &crate::Value, b: &crate::Value) -> crate::Value {
        let (sa, sb) = (Self::vstr(a), Self::vstr(b));
        let pick = if let Some(true) = string_le(&sa, &sb) { sa } else { sb };
        crate::Value::Str(reduce_string(&pick))
    }
    pub fn stringMax(a: &crate::Value, b: &crate::Value) -> crate::Value {
        let (sa, sb) = (Self::vstr(a), Self::vstr(b));
        let pick = if let Some(true) = string_ge(&sa, &sb) { sa } else { sb };
        crate::Value::Str(reduce_string(&pick))
    }
    pub fn stringEquals(a: &crate::Value, b: &crate::Value) -> crate::Value { Self::stringEq(a, b) }
    pub fn stringOr(a: &crate::Value, b: &crate::Value) -> crate::Value {
        if !a.is_null() { a.clone() } else { b.clone() }
    }
}
