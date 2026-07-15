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
    // Fast path: i128. Any overflow (operand too large to parse, or the
    // `a_int * 10^distance` intermediate exceeding i128) falls back to the
    // arbitrary-precision BigInt path so the result matches TS exactly —
    // NOT to `string_div` (which would silently change the precision).
    let (a_int, a_dec) = match precise_parse(a) {
        Some(v) => v,
        None => return string_div_prec_big(a, b, precision),
    };
    let (b_int, b_dec) = match precise_parse(b) {
        Some(v) => v,
        None => return string_div_prec_big(a, b, precision),
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
            None => return string_div_prec_big(a, b, precision as i64),
        }
    } else {
        match 10i128.checked_pow(distance as u32).and_then(|e| a_int.checked_mul(e)) {
            Some(v) => v,
            None => return string_div_prec_big(a, b, precision as i64),
        }
    };
    Some(precise_to_string(numerator / b_int, precision))
}

/// BigInt sibling of [`precise_parse`] — no i128 range limit. Splits a
/// decimal (with optional `e` exponent) into `(integer, decimals)`.
fn precise_parse_big(s: &str) -> Option<(num_bigint::BigInt, i32)> {
    let mut num = s.to_lowercase();
    let mut modifier: i32 = 0;
    if let Some(epos) = num.find('e') {
        modifier = num[epos + 1..].parse().ok()?;
        num = num[..epos].to_string();
    }
    let decimals: i32 = match num.find('.') {
        Some(di) => (num.len() - di - 1) as i32,
        None => 0,
    };
    let integer: num_bigint::BigInt = num.replace('.', "").parse().ok()?;
    Some((integer, decimals - modifier))
}

/// Arbitrary-precision port of `Precise.stringDiv (a, b, precision)`.
/// Mirrors the TS BigInt algorithm exactly; used when the i128 fast path
/// in [`string_div_prec`] would overflow.
pub fn string_div_prec_big(a: &str, b: &str, precision: i64) -> Option<String> {
    use num_bigint::BigInt;
    use num_traits::Zero;
    let (a_int, a_dec) = precise_parse_big(a)?;
    let (b_int, b_dec) = precise_parse_big(b)?;
    if b_int.is_zero() {
        return None;
    }
    let precision = precision as i32;
    let distance = precision - a_dec + b_dec;
    // 10^n as a BigInt via its literal digit string ("1" followed by n
    // zeros) — avoids depending on a particular `pow` API surface.
    let pow10 = |n: i32| -> BigInt { format!("1{}", "0".repeat(n as usize)).parse().unwrap() };
    let numerator: BigInt = if distance == 0 {
        a_int
    } else if distance < 0 {
        a_int / pow10(-distance)
    } else {
        a_int * pow10(distance)
    };
    // BigInt division truncates toward zero, matching TS `BigInt` `/`.
    let result = numerator / b_int;
    // The quotient (a value scaled to `precision` decimals) is almost
    // always small; reuse the i128 formatter when it fits, else format
    // the BigInt digits directly.
    match i128::try_from(result.clone()) {
        Ok(small) => Some(precise_to_string(small, precision)),
        Err(_) => Some(bigint_to_precise_string(&result, precision)),
    }
}

/// Format `(integer, decimals)` where `integer` is a BigInt — the
/// arbitrary-precision analogue of [`precise_to_string`]. Reduces trailing
/// zeros (adjusting `decimals`) then positions the decimal point.
fn bigint_to_precise_string(integer: &num_bigint::BigInt, decimals: i32) -> String {
    use num_bigint::Sign;
    let sign = if integer.sign() == Sign::Minus { "-" } else { "" };
    let mut abs: String = integer.magnitude().to_string();
    let mut decimals = decimals;
    // reduce(): strip trailing zeros from the digit string.
    let bytes = abs.as_bytes();
    let start = abs.len() as i32 - 1;
    if start > 0 {
        let mut i = start;
        while i >= 0 && bytes[i as usize] == b'0' {
            i -= 1;
        }
        let difference = start - i;
        if difference > 0 {
            abs.truncate((i + 1) as usize);
            decimals -= difference;
        }
    }
    let pad_len = if decimals > 0 { decimals as usize } else { 0 };
    let padded = if abs.len() < pad_len {
        "0".repeat(pad_len - abs.len()) + &abs
    } else {
        abs
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

/// A struct wrapper matching CCXT Precise class usage (e.g. `Precise::string_add`).
pub struct Precise;

impl Precise {
    /// TS-style `new Precise(s)` — parses `s` into an `integer` (the
    /// digit string) + `decimals` (count of digits to the right of the
    /// decimal point). Returns a `Value::Map` carrying those two
    /// fields plus a `__precise` marker that `stringify_param` /
    /// `Value::reduce` recognise — that's what makes
    /// `precise.decimals = subtract(...)` followed by `precise.reduce()`
    /// (as transpiled phemex's `toEn` does) work end-to-end.
    pub fn new(v: crate::Value) -> crate::Value {
        let s = crate::runtime::stringify_param(&v);
        let mut sign = "";
        let mut body: &str = s.trim_start_matches('+');
        if let Some(stripped) = body.strip_prefix('-') {
            sign = "-";
            body = stripped;
        }
        let (integer, decimals): (String, i64) = match body.find('.') {
            None => (format!("{sign}{body}"), 0),
            Some(dot) => {
                let before = &body[..dot];
                let after  = &body[dot + 1..];
                (format!("{sign}{before}{after}"), after.len() as i64)
            }
        };
        let mut m = indexmap::IndexMap::new();
        m.insert("integer".to_string(),  crate::Value::Str(integer));
        m.insert("decimals".to_string(), crate::Value::Int(decimals));
        m.insert("__precise".to_string(), crate::Value::Bool(true));
        crate::Value::Map(m)
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

    /// Mirrors TS `Precise.stringAdd`: when one operand is `undefined` /
    /// `null` it returns the OTHER side (treating the missing value as the
    /// arithmetic identity). Bitget's `parsePosition` relies on this when
    /// `keepMarginRate` is missing (UTA response uses `mmr` instead), so
    /// `Precise.stringAdd(undefined, feeToClose)` should yield `feeToClose`.
    pub fn stringAdd(a: &crate::Value, b: &crate::Value) -> crate::Value {
        // Mirrors TS `Precise.stringAdd`: either operand undefined → undefined.
        if matches!(a, crate::Value::Null) || matches!(b, crate::Value::Null) {
            return crate::Value::Null;
        }
        Self::vopt(string_add(&Self::vstr(a), &Self::vstr(b)))
    }
    /// Mirrors TS `Precise.stringSub`: either operand undefined → undefined.
    pub fn stringSub(a: &crate::Value, b: &crate::Value) -> crate::Value {
        if matches!(a, crate::Value::Null) || matches!(b, crate::Value::Null) {
            return crate::Value::Null;
        }
        Self::vopt(string_sub(&Self::vstr(a), &Self::vstr(b)))
    }
    /// Mirrors TS `Precise.stringMul`: any undefined operand → undefined
    /// (matches the typescript `x * undefined === NaN → undefined` chain).
    pub fn stringMul(a: &crate::Value, b: &crate::Value) -> crate::Value {
        if matches!(a, crate::Value::Null) || matches!(b, crate::Value::Null) {
            return crate::Value::Null;
        }
        Self::vopt(string_mul(&Self::vstr(a), &Self::vstr(b)))
    }
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
    pub fn stringEq(a: &crate::Value, b: &crate::Value)  -> crate::Value { if Self::any_null(a, b) { return crate::Value::Bool(false); } Self::vbool(string_eq(&Self::vstr(a), &Self::vstr(b))) }
    pub fn stringGt(a: &crate::Value, b: &crate::Value)  -> crate::Value { if Self::any_null(a, b) { return crate::Value::Bool(false); } Self::vbool(string_gt(&Self::vstr(a), &Self::vstr(b))) }
    pub fn stringGe(a: &crate::Value, b: &crate::Value)  -> crate::Value { if Self::any_null(a, b) { return crate::Value::Bool(false); } Self::vbool(string_ge(&Self::vstr(a), &Self::vstr(b))) }
    pub fn stringLt(a: &crate::Value, b: &crate::Value)  -> crate::Value { if Self::any_null(a, b) { return crate::Value::Bool(false); } Self::vbool(string_lt(&Self::vstr(a), &Self::vstr(b))) }
    pub fn stringLe(a: &crate::Value, b: &crate::Value)  -> crate::Value { if Self::any_null(a, b) { return crate::Value::Bool(false); } Self::vbool(string_le(&Self::vstr(a), &Self::vstr(b))) }
    /// TS treats the comparison operators as `false` when either operand
    /// is undefined (they short-circuit before constructing a `Precise`).
    fn any_null(a: &crate::Value, b: &crate::Value) -> bool { matches!(a, crate::Value::Null) || matches!(b, crate::Value::Null) }
    pub fn stringAbs(a: &crate::Value)                   -> crate::Value { Self::vopt(string_abs(&Self::vstr(a))) }
    pub fn stringNeg(a: &crate::Value)                   -> crate::Value { Self::vopt(string_neg(&Self::vstr(a))) }
    pub fn stringMin(a: &crate::Value, b: &crate::Value) -> crate::Value {
        // Mirrors TS `Precise.stringMin`: either operand undefined → undefined.
        if matches!(a, crate::Value::Null) || matches!(b, crate::Value::Null) {
            return crate::Value::Null;
        }
        let (sa, sb) = (Self::vstr(a), Self::vstr(b));
        let pick = if let Some(true) = string_le(&sa, &sb) { sa } else { sb };
        crate::Value::Str(reduce_string(&pick))
    }
    pub fn stringMax(a: &crate::Value, b: &crate::Value) -> crate::Value {
        // Mirrors TS `Precise.stringMax`: either operand undefined → undefined.
        if matches!(a, crate::Value::Null) || matches!(b, crate::Value::Null) {
            return crate::Value::Null;
        }
        let (sa, sb) = (Self::vstr(a), Self::vstr(b));
        let pick = if let Some(true) = string_ge(&sa, &sb) { sa } else { sb };
        crate::Value::Str(reduce_string(&pick))
    }
    pub fn stringEquals(a: &crate::Value, b: &crate::Value) -> crate::Value { Self::stringEq(a, b) }
    /// Mirrors TS `Precise.stringOr`: bitwise OR of the underlying
    /// integer representations at a common decimal scale.
    /// `stringOr("5", "3") == "7"`, `stringOr("5.5", "3") == "6.3"` etc.
    /// Either undefined operand → undefined (matches TS).
    pub fn stringOr(a: &crate::Value, b: &crate::Value) -> crate::Value {
        if matches!(a, crate::Value::Null) || matches!(b, crate::Value::Null) {
            return crate::Value::Null;
        }
        let (sa, sb) = (Self::vstr(a), Self::vstr(b));
        // Split each into (sign, integer-string, decimal-count). Mirrors
        // the constructor in TS Precise — chop at `.`, count fractional
        // digits, drop the `.` so the integer parses as a single number.
        fn split(s: &str) -> Option<(i64, i64, u32)> {
            let (sign, body) = if let Some(rest) = s.strip_prefix('-') { (-1i64, rest) } else { (1i64, s) };
            let (int_part, frac_part) = match body.find('.') {
                Some(i) => (&body[..i], &body[i + 1..]),
                None    => (body, ""),
            };
            let joined = format!("{int_part}{frac_part}");
            let n: i64 = joined.parse().ok()?;
            Some((sign, n, frac_part.len() as u32))
        }
        let (sga, ia, da) = match split(&sa) { Some(t) => t, None => return crate::Value::Null };
        let (sgb, ib, db) = match split(&sb) { Some(t) => t, None => return crate::Value::Null };
        // Shift the smaller-decimal side up to match.
        let dmax = da.max(db);
        let ia_s = sga * ia * 10i64.pow(dmax - da);
        let ib_s = sgb * ib * 10i64.pow(dmax - db);
        let or = ia_s | ib_s;
        let s = if dmax == 0 {
            or.to_string()
        } else {
            // Re-insert the decimal point dmax positions from the right.
            let abs = or.unsigned_abs();
            let digits = abs.to_string();
            let pad = if digits.len() <= dmax as usize { dmax as usize - digits.len() + 1 } else { 0 };
            let padded = format!("{}{}", "0".repeat(pad), digits);
            let cut = padded.len() - dmax as usize;
            let (lhs, rhs) = padded.split_at(cut);
            let mut out = format!("{lhs}.{rhs}");
            if or < 0 { out = format!("-{out}"); }
            out
        };
        crate::Value::Str(reduce_string(&s))
    }
}
