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
    if s.contains('.') {
        let trimmed = s.trim_end_matches('0').trim_end_matches('.');
        trimmed.to_owned()
    } else {
        s
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
    pub fn stringDiv(a: &crate::Value, b: &crate::Value) -> crate::Value { Self::vopt(string_div(&Self::vstr(a), &Self::vstr(b))) }
    pub fn stringMod(a: &crate::Value, b: &crate::Value) -> crate::Value { Self::vopt(string_mod(&Self::vstr(a), &Self::vstr(b))) }
    pub fn stringEq(a: &crate::Value, b: &crate::Value)  -> crate::Value { Self::vbool(string_eq(&Self::vstr(a), &Self::vstr(b))) }
    pub fn stringGt(a: &crate::Value, b: &crate::Value)  -> crate::Value { Self::vbool(string_gt(&Self::vstr(a), &Self::vstr(b))) }
    pub fn stringGe(a: &crate::Value, b: &crate::Value)  -> crate::Value { Self::vbool(string_ge(&Self::vstr(a), &Self::vstr(b))) }
    pub fn stringLt(a: &crate::Value, b: &crate::Value)  -> crate::Value { Self::vbool(string_lt(&Self::vstr(a), &Self::vstr(b))) }
    pub fn stringLe(a: &crate::Value, b: &crate::Value)  -> crate::Value { Self::vbool(string_le(&Self::vstr(a), &Self::vstr(b))) }
    pub fn stringAbs(a: &crate::Value)                   -> crate::Value { Self::vopt(string_abs(&Self::vstr(a))) }
    pub fn stringNeg(a: &crate::Value)                   -> crate::Value { Self::vopt(string_neg(&Self::vstr(a))) }
    pub fn stringMin(a: &crate::Value, b: &crate::Value) -> crate::Value {
        if let Some(true) = string_le(&Self::vstr(a), &Self::vstr(b)) { a.clone() } else { b.clone() }
    }
    pub fn stringMax(a: &crate::Value, b: &crate::Value) -> crate::Value {
        if let Some(true) = string_ge(&Self::vstr(a), &Self::vstr(b)) { a.clone() } else { b.clone() }
    }
    pub fn stringEquals(a: &crate::Value, b: &crate::Value) -> crate::Value { Self::stringEq(a, b) }
    pub fn stringOr(a: &crate::Value, b: &crate::Value) -> crate::Value {
        if !a.is_null() { a.clone() } else { b.clone() }
    }
}
