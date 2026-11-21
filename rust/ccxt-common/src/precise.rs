// Native Rust – Precise decimal arithmetic.
//
// Mirrors CCXT's Precise.ts exactly.  All arithmetic operates on string
// representations to avoid floating-point rounding issues, and all inputs
// / outputs are Strings (just like the TypeScript version).

use num_bigint::BigInt;
use num_traits::{Signed, Zero};

/// Strict decimal syntax for `string_div` / `string_to_precision`: optional
/// leading sign, digits with one optional `.`, `_` separators after a digit,
/// and an optional `e`/`E` exponent of at most 28. Returns `(integer, decimals)`.
fn decimal_parse(s: &str) -> Option<(BigInt, i32)> {
    fn mantissa_ok(t: &str) -> bool {
        let body = t.strip_prefix(['+', '-']).unwrap_or(t);
        let (mut digit, mut point) = (false, false);
        for c in body.bytes() {
            match c {
                b'0'..=b'9' => digit = true,
                b'.' if !point => point = true,
                b'_' if digit => {}
                _ => return false,
            }
        }
        digit
    }
    if mantissa_ok(s) {
        return precise_parse_big(&s.replace('_', ""));
    }
    let epos = s.find(['e', 'E'])?;
    let (base, exp) = (&s[..epos], &s[epos + 1..]);
    if !mantissa_ok(base) {
        return None;
    }
    let (negative_exp, digits) = match exp.strip_prefix('-') {
        Some(rest) => (true, rest),
        None => (false, exp),
    };
    let e: u32 = digits.parse().ok()?;
    if e > 28 {
        return None;
    }
    let (integer, decimals) = precise_parse_big(&base.replace('_', ""))?;
    Some((integer, if negative_exp { decimals + e as i32 } else { decimals - e as i32 }))
}

/// `(|a| * 10^shift) / |b|` as a numerator/denominator pair, `shift` may be negative.
fn scaled_ratio(a: &BigInt, b: &BigInt, shift: i32) -> (BigInt, BigInt) {
    if shift >= 0 {
        (a.abs() * big_pow10(shift), b.abs())
    } else {
        (a.abs(), b.abs() * big_pow10(-shift))
    }
}

/// `num / den` rounded half to even (both non-negative).
fn div_half_even(num: &BigInt, den: &BigInt) -> BigInt {
    let (q, r) = (num / den, num % den);
    let twice: BigInt = r * 2u8;
    if twice > *den || (twice == *den && !(&q % 2u8).is_zero()) { q + 1u8 } else { q }
}

/// Fixed-point rendering of `integer / 10^decimals` with exactly `decimals` places.
fn fixed_to_string(negative: bool, integer: &BigInt, decimals: u32) -> String {
    let k = decimals as usize;
    let digits = format!("{:0>width$}", integer.to_string(), width = k + 1);
    let (whole, frac) = digits.split_at(digits.len() - k);
    let sign = if negative { "-" } else { "" };
    if k == 0 { format!("{sign}{whole}") } else { format!("{sign}{whole}.{frac}") }
}

// ── public API ────────────────────────────────────────────────────────────────

/// 10^n as a `BigInt`, for aligning two operands to a common scale.
fn big_pow10(n: i32) -> num_bigint::BigInt {
    num_bigint::BigInt::from(10u8).pow(n.max(0) as u32)
}

/// Align two `(integer, decimals)` pairs onto the larger scale, mirroring the
/// scaling TS `add`/`sub`/`compare` do inline.
fn big_align(
    (ai, ad): (num_bigint::BigInt, i32),
    (bi, bd): (num_bigint::BigInt, i32),
) -> (num_bigint::BigInt, num_bigint::BigInt, i32) {
    if ad == bd {
        return (ai, bi, ad);
    }
    if ad > bd {
        let scaled = bi * big_pow10(ad - bd);
        (ai, scaled, ad)
    } else {
        let scaled = ai * big_pow10(bd - ad);
        (scaled, bi, bd)
    }
}

pub fn string_add(a: &str, b: &str) -> Option<String> {
    // Arbitrary precision, like CCXT's BigInt-backed `Precise`.
    let (ai, bi, dec) = big_align(precise_parse_big(a)?, precise_parse_big(b)?);
    Some(bigint_to_precise_string(&(ai + bi), dec))
}

pub fn string_sub(a: &str, b: &str) -> Option<String> {
    let (ai, bi, dec) = big_align(precise_parse_big(a)?, precise_parse_big(b)?);
    Some(bigint_to_precise_string(&(ai - bi), dec))
}

pub fn string_mul(a: &str, b: &str) -> Option<String> {
    string_mul_big(a, b)
}

/// Arbitrary-precision `a * b`: product integer is `a_int * b_int`, with the
/// decimal counts summed.
fn string_mul_big(a: &str, b: &str) -> Option<String> {
    let (a_int, a_dec) = precise_parse_big(a)?;
    let (b_int, b_dec) = precise_parse_big(b)?;
    Some(bigint_to_precise_string(&(a_int * b_int), a_dec + b_dec))
}

/// `a / b` rounded half to even at the largest scale (at most 28) whose
/// integer stays below 2^96, then trailing zeros trimmed.
pub fn string_div(a: &str, b: &str) -> Option<String> {
    let (ai, ad) = decimal_parse(a)?;
    let (bi, bd) = decimal_parse(b)?;
    if bi.is_zero() { return None; }
    let limit = BigInt::from(1u8) << 96usize;
    let mut scale = 28;
    while scale > 0 {
        let (num, den) = scaled_ratio(&ai, &bi, bd - ad + scale);
        if num / den < limit { break; }
        scale -= 1;
    }
    let (num, den) = scaled_ratio(&ai, &bi, bd - ad + scale);
    let mut q = div_half_even(&num, &den);
    if q >= limit && scale > 0 {
        scale -= 1;
        let (num, den) = scaled_ratio(&ai, &bi, bd - ad + scale);
        q = div_half_even(&num, &den);
    }
    let negative = ai.is_negative() != bi.is_negative();
    Some(bigint_to_precise_string(&if negative { -q } else { q }, scale))
}

pub fn string_mod(a: &str, b: &str) -> Option<String> {
    // Mirrors TS `mod()`: rationalize both sides onto a common scale, then
    // take the remainder of the scaled integers.
    let (ai, ad) = precise_parse_big(a)?;
    let (bi, bd) = precise_parse_big(b)?;
    if bi.is_zero() { return None; }
    let rat_num = (-ad + bd).max(0);
    let rat_den = (-bd + ad).max(0);
    let numerator = ai * big_pow10(rat_num);
    let denominator = bi * big_pow10(rat_den);
    Some(bigint_to_precise_string(&(numerator % denominator), rat_den + bd))
}

pub fn string_eq(a: &str, b: &str) -> Option<bool> {
    // Mirrors TS `equals()`: reduce both and compare (integer, decimals).
    let (ia, da) = precise_parse(a)?;
    let (ib, db) = precise_parse(b)?;
    let (ia, da) = precise_reduce(ia, da);
    let (ib, db) = precise_reduce(ib, db);
    Some(ia == ib && da == db)
}

/// TS `compare()` — align onto the larger scale, compare the integers.
fn big_compare(a: &str, b: &str) -> Option<std::cmp::Ordering> {
    let (ai, bi, _) = big_align(precise_parse_big(a)?, precise_parse_big(b)?);
    Some(ai.cmp(&bi))
}

pub fn string_gt(a: &str, b: &str) -> Option<bool> {
    Some(big_compare(a, b)?.is_gt())
}

pub fn string_ge(a: &str, b: &str) -> Option<bool> {
    Some(big_compare(a, b)?.is_ge())
}

pub fn string_lt(a: &str, b: &str) -> Option<bool> {
    Some(big_compare(a, b)?.is_lt())
}

pub fn string_le(a: &str, b: &str) -> Option<bool> {
    Some(big_compare(a, b)?.is_le())
}

pub fn string_abs(a: &str) -> Option<String> {
    let (i, d) = precise_parse_big(a)?;
    Some(bigint_to_precise_string(&i.abs(), d))
}

pub fn string_neg(a: &str) -> Option<String> {
    let (i, d) = precise_parse_big(a)?;
    Some(bigint_to_precise_string(&(-i), d))
}

/// Round to `decimals` decimal places using the specified rounding mode.
/// mode 0 = truncate (keeps a `-` on a negative input truncated to zero),
/// 3 = ceiling, 4 = floor, any other = round half to even.
pub fn string_to_precision(a: &str, decimals: u32, mode: u8) -> Option<String> {
    let (integer, d) = decimal_parse(a)?;
    let (num, den) = scaled_ratio(&integer, &BigInt::from(1u8), decimals as i32 - d);
    let num = if integer.is_negative() { -num } else { num };
    let (q, r) = (&num / &den, &num % &den);
    let (negative, magnitude) = match mode {
        0 => (integer.is_negative(), q.abs()),
        3 => { let v = if r.is_positive() { q + 1u8 } else { q }; (v.is_negative(), v.abs()) }
        4 => { let v = if r.is_negative() { q - 1u8 } else { q }; (v.is_negative(), v.abs()) }
        _ => { let v = div_half_even(&num.abs(), &den); (integer.is_negative() && !v.is_zero(), v) }
    };
    Some(fixed_to_string(negative, &magnitude, decimals))
}

// ── precision-aware division ────────────────────────────────────────────────
//
// The TS `Precise.stringDiv (a, b, precision)` *truncates* the result to
// exactly `precision` decimal places; `string_div_prec` ports it with an
// `i128` fast path and a BigInt fallback.

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
    if start == 0 && abs == "0" {
        // TS `reduceDigits()` zeroes the scale for a bare "0": `0 * 1e-6` is "0".
        decimals = 0;
    }
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

/// TS `Precise`: a decimal `integer` digit string scaled by `10^-decimals`; the `Precise::string*` entry points
/// below are its static methods.
#[derive(Clone, Debug, PartialEq)]
pub struct Precise {
    pub integer: String,
    pub decimals: i64,
}

impl Precise {
    /// TS `new Precise(s)`: the digits of `s` without the point, `decimals` the count after it minus any exponent.
    pub fn new(v: crate::Value) -> Precise {
        let text = crate::runtime::stringify_param(&v);
        let (body, modifier) = match text.find(['e', 'E']) {
            Some(e) => (&text[..e], text[e + 1..].parse::<i64>().unwrap_or(0)),
            None => (text.as_str(), 0),
        };
        let (digits, decimals) = match body.find('.') {
            Some(dot) => (format!("{}{}", &body[..dot], &body[dot + 1..]), (body.len() - dot - 1) as i64 - modifier),
            None => (body.to_string(), -modifier),
        };
        Precise { integer: Self::normalize(&digits), decimals }
    }

    /// The decimal text `BigInt(digits).toString()` gives: sign kept, `+` and leading zeros dropped, `-0` is `0`.
    fn normalize(digits: &str) -> String {
        let (sign, rest) = match digits.strip_prefix('-') { Some(r) => ("-", r), None => ("", digits.trim_start_matches('+')) };
        let trimmed = rest.trim_start_matches('0');
        if trimmed.is_empty() { return if rest.is_empty() { digits.to_string() } else { "0".to_string() }; }
        format!("{sign}{trimmed}")
    }

    /// TS `reduceDigits`: strips trailing zeros from `integer`, lowering `decimals` by as many.
    fn reduce_digits(&mut self) {
        if self.integer.len() <= 1 {
            if self.integer == "0" { self.decimals = 0; }
            return;
        }
        let kept = self.integer.trim_end_matches('0').len();
        let difference = self.integer.len() - kept;
        if difference == 0 || kept == 0 { return; }
        self.decimals -= difference as i64;
        self.integer.truncate(kept);
    }

    /// TS `reduce ()`.
    pub fn reduce(&mut self) -> &mut Precise {
        self.reduce_digits();
        self
    }
}

/// TS `toString ()`.
impl std::fmt::Display for Precise {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        // reduceDigits on borrowed text: trailing zeros off the digits, decimals lowered by as many
        let (mut integer, mut decimals) = (self.integer.as_str(), self.decimals);
        if integer == "0" { decimals = 0; }
        let kept = integer.trim_end_matches('0').len();
        if integer.len() > 1 && kept > 0 { decimals -= (integer.len() - kept) as i64; integer = &integer[..kept]; }
        let (sign, digits) = match integer.strip_prefix('-') { Some(d) => ("-", d), None => ("", integer) };
        if decimals <= 0 {
            return write!(f, "{sign}{digits}{}", "0".repeat((-decimals) as usize));
        }
        let d = decimals as usize;
        if digits.len() <= d {
            return write!(f, "{sign}0.{digits:0>d$}");
        }
        let index = digits.len() - d;
        write!(f, "{sign}{}.{}", &digits[..index], &digits[index..])
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

/// An operand of the `Precise::string*` arithmetic entry points: a `Value` (as before), or a typed string local lent
/// as is (`&Option<String>` / `&String` / `&str`), so the transpiled code passes it without boxing or copying it.
/// `None` is the `Value::Null` of the boxed form; a string is the `Value::Str` it would have been boxed into.
pub trait PreciseArg {
    /// `None` for an undefined operand.
    fn precise_null(&self) -> bool;
    /// The operand's text, exactly as `stringify_param` prints its boxed `Value` (`"null"` for an undefined one).
    fn precise_text(&self) -> std::borrow::Cow<'_, str>;
}
impl PreciseArg for crate::Value {
    fn precise_null(&self) -> bool { matches!(self, crate::Value::Null) }
    fn precise_text(&self) -> std::borrow::Cow<'_, str> { match self.as_str() { Some(s) => s.into(), None => crate::runtime::stringify_param(self).into() } }
}
impl PreciseArg for Option<String> {
    fn precise_null(&self) -> bool { self.is_none() }
    fn precise_text(&self) -> std::borrow::Cow<'_, str> { self.as_deref().unwrap_or("null").into() }
}
impl PreciseArg for String {
    fn precise_null(&self) -> bool { false }
    fn precise_text(&self) -> std::borrow::Cow<'_, str> { self.as_str().into() }
}
impl<T: PreciseArg + ?Sized> PreciseArg for &T {
    fn precise_null(&self) -> bool { (**self).precise_null() }
    fn precise_text(&self) -> std::borrow::Cow<'_, str> { (**self).precise_text() }
}
impl PreciseArg for str {
    fn precise_null(&self) -> bool { false }
    fn precise_text(&self) -> std::borrow::Cow<'_, str> { self.into() }
}

#[allow(non_snake_case)]
impl Precise {
    fn vstr(v: &crate::Value) -> String { crate::runtime::stringify_param(v) }
    fn vopt(s: Option<String>) -> crate::Value { match s { Some(s) => crate::Value::Str(s.into()), None => crate::Value::Null } }
    fn vbool(b: Option<bool>)  -> crate::Value { match b { Some(b) => crate::Value::Bool(b), None => crate::Value::Null } }

    /// Mirrors TS `Precise.stringAdd`: when one operand is `undefined` /
    /// `null` it returns the OTHER side (treating the missing value as the
    /// arithmetic identity). Bitget's `parsePosition` relies on this when
    /// `keepMarginRate` is missing (UTA response uses `mmr` instead), so
    /// `Precise.stringAdd(undefined, feeToClose)` should yield `feeToClose`.
    pub fn stringAdd(a: &(impl PreciseArg + ?Sized), b: &(impl PreciseArg + ?Sized)) -> crate::Value {
        // Mirrors TS `Precise.stringAdd`: either operand undefined → undefined.
        if a.precise_null() || b.precise_null() {
            return crate::Value::Null;
        }
        Self::vopt(string_add(&a.precise_text(), &b.precise_text()))
    }
    /// Mirrors TS `Precise.stringSub`: either operand undefined → undefined.
    pub fn stringSub(a: &(impl PreciseArg + ?Sized), b: &(impl PreciseArg + ?Sized)) -> crate::Value {
        if a.precise_null() || b.precise_null() {
            return crate::Value::Null;
        }
        Self::vopt(string_sub(&a.precise_text(), &b.precise_text()))
    }
    /// Mirrors TS `Precise.stringMul`: any undefined operand → undefined
    /// (matches the typescript `x * undefined === NaN → undefined` chain).
    pub fn stringMul(a: &(impl PreciseArg + ?Sized), b: &(impl PreciseArg + ?Sized)) -> crate::Value {
        if a.precise_null() || b.precise_null() {
            return crate::Value::Null;
        }
        Self::vopt(string_mul(&a.precise_text(), &b.precise_text()))
    }
    pub fn stringDiv(a: &(impl PreciseArg + ?Sized), b: &(impl PreciseArg + ?Sized)) -> crate::Value {
        // TS `Precise.stringDiv` defaults to precision 18 (truncating).
        Self::vopt(string_div_prec(&a.precise_text(), &b.precise_text(), 18))
    }
    /// `Precise.stringDiv (a, b, precision)` — truncating division to a
    /// given number of decimal places.
    pub fn stringDivPrec(a: &(impl PreciseArg + ?Sized), b: &(impl PreciseArg + ?Sized), precision: &crate::Value) -> crate::Value {
        let prec: i64 = match precision {
            crate::Value::Int(n)   => *n,
            crate::Value::Float(f) => *f as i64,
            crate::Value::Str(s)   => s.parse().unwrap_or(18),
            _ => 18,
        };
        Self::vopt(string_div_prec(&a.precise_text(), &b.precise_text(), prec))
    }
    pub fn stringMod(a: &(impl PreciseArg + ?Sized), b: &(impl PreciseArg + ?Sized)) -> crate::Value { Self::vopt(string_mod(&a.precise_text(), &b.precise_text())) }
    pub fn stringEq(a: &(impl PreciseArg + ?Sized), b: &(impl PreciseArg + ?Sized)) -> crate::Value { if Self::any_null(a, b) { return crate::Value::Bool(false); } Self::vbool(string_eq(&a.precise_text(), &b.precise_text())) }
    pub fn stringGt(a: &(impl PreciseArg + ?Sized), b: &(impl PreciseArg + ?Sized)) -> crate::Value { if Self::any_null(a, b) { return crate::Value::Bool(false); } Self::vbool(string_gt(&a.precise_text(), &b.precise_text())) }
    pub fn stringGe(a: &(impl PreciseArg + ?Sized), b: &(impl PreciseArg + ?Sized)) -> crate::Value { if Self::any_null(a, b) { return crate::Value::Bool(false); } Self::vbool(string_ge(&a.precise_text(), &b.precise_text())) }
    pub fn stringLt(a: &(impl PreciseArg + ?Sized), b: &(impl PreciseArg + ?Sized)) -> crate::Value { if Self::any_null(a, b) { return crate::Value::Bool(false); } Self::vbool(string_lt(&a.precise_text(), &b.precise_text())) }
    pub fn stringLe(a: &(impl PreciseArg + ?Sized), b: &(impl PreciseArg + ?Sized)) -> crate::Value { if Self::any_null(a, b) { return crate::Value::Bool(false); } Self::vbool(string_le(&a.precise_text(), &b.precise_text())) }
    /// TS treats the comparison operators as `false` when either operand
    /// is undefined (they short-circuit before constructing a `Precise`).
    fn any_null(a: &(impl PreciseArg + ?Sized), b: &(impl PreciseArg + ?Sized)) -> bool { a.precise_null() || b.precise_null() }
    pub fn stringAbs(a: &(impl PreciseArg + ?Sized))     -> crate::Value { Self::vopt(string_abs(&a.precise_text())) }
    pub fn stringNeg(a: &(impl PreciseArg + ?Sized))     -> crate::Value { Self::vopt(string_neg(&a.precise_text())) }
    pub fn stringMin(a: &(impl PreciseArg + ?Sized), b: &(impl PreciseArg + ?Sized)) -> crate::Value {
        // Mirrors TS `Precise.stringMin`: either operand undefined → undefined.
        if a.precise_null() || b.precise_null() {
            return crate::Value::Null;
        }
        let (sa, sb) = (a.precise_text(), b.precise_text());
        let pick = if let Some(true) = string_le(&sa, &sb) { sa } else { sb };
        crate::Value::Str(reduce_string(&pick).into())
    }
    pub fn stringMax(a: &(impl PreciseArg + ?Sized), b: &(impl PreciseArg + ?Sized)) -> crate::Value {
        // Mirrors TS `Precise.stringMax`: either operand undefined → undefined.
        if a.precise_null() || b.precise_null() {
            return crate::Value::Null;
        }
        let (sa, sb) = (a.precise_text(), b.precise_text());
        let pick = if let Some(true) = string_ge(&sa, &sb) { sa } else { sb };
        crate::Value::Str(reduce_string(&pick).into())
    }
    pub fn stringEquals(a: &(impl PreciseArg + ?Sized), b: &(impl PreciseArg + ?Sized)) -> crate::Value { Self::stringEq(a, b) }
    /// Mirrors TS `Precise.stringOr`: bitwise OR of the underlying
    /// integer representations at a common decimal scale.
    /// `stringOr("5", "3") == "7"`, `stringOr("5.5", "3") == "6.3"` etc.
    /// Either undefined operand → undefined (matches TS).
    pub fn stringOr(a: &(impl PreciseArg + ?Sized), b: &(impl PreciseArg + ?Sized)) -> crate::Value {
        if a.precise_null() || b.precise_null() {
            return crate::Value::Null;
        }
        let (sa, sb) = (a.precise_text(), b.precise_text());
        // Split each into (sign, integer-string, decimal-count). Mirrors
        // the constructor in TS Precise — chop at `.`, count fractional
        // digits, drop the `.` so the integer parses as a single number.
        fn split_parts(s: &str) -> Option<(i64, i64, u32)> {
            let (sign, body) = if let Some(rest) = s.strip_prefix('-') { (-1i64, rest) } else { (1i64, s) };
            let (int_part, frac_part) = match body.find('.') {
                Some(i) => (&body[..i], &body[i + 1..]),
                None    => (body, ""),
            };
            let joined = format!("{int_part}{frac_part}");
            let n: i64 = joined.parse().ok()?;
            Some((sign, n, frac_part.len() as u32))
        }
        let (sga, ia, da) = match split_parts(&sa) { Some(t) => t, None => return crate::Value::Null };
        let (sgb, ib, db) = match split_parts(&sb) { Some(t) => t, None => return crate::Value::Null };
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
        crate::Value::Str(reduce_string(&s).into())
    }
}

#[cfg(test)]
mod precise_arg_tests {
    use super::Precise;
    use crate::Value;

    type Opt = Option<String>;
    // Function references, not one call per line: the table drives every entry point, so the test adds no
    // Precise::string* call sites to the census.
    const UNARY: [(fn(&Opt) -> Value, fn(&String) -> Value, fn(&str) -> Value, fn(&Value) -> Value); 2] = [
        (Precise::stringAbs, Precise::stringAbs, Precise::stringAbs, Precise::stringAbs),
        (Precise::stringNeg, Precise::stringNeg, Precise::stringNeg, Precise::stringNeg),
    ];
    const BINARY: [(fn(&Opt, &Opt) -> Value, fn(&String, &Opt) -> Value, fn(&Value, &Opt) -> Value, fn(&Opt, &Value) -> Value, fn(&Value, &Value) -> Value); 14] = [
        (Precise::stringAdd, Precise::stringAdd, Precise::stringAdd, Precise::stringAdd, Precise::stringAdd),
        (Precise::stringSub, Precise::stringSub, Precise::stringSub, Precise::stringSub, Precise::stringSub),
        (Precise::stringMul, Precise::stringMul, Precise::stringMul, Precise::stringMul, Precise::stringMul),
        (Precise::stringDiv, Precise::stringDiv, Precise::stringDiv, Precise::stringDiv, Precise::stringDiv),
        (Precise::stringMod, Precise::stringMod, Precise::stringMod, Precise::stringMod, Precise::stringMod),
        (Precise::stringMin, Precise::stringMin, Precise::stringMin, Precise::stringMin, Precise::stringMin),
        (Precise::stringMax, Precise::stringMax, Precise::stringMax, Precise::stringMax, Precise::stringMax),
        (Precise::stringEq, Precise::stringEq, Precise::stringEq, Precise::stringEq, Precise::stringEq),
        (Precise::stringEquals, Precise::stringEquals, Precise::stringEquals, Precise::stringEquals, Precise::stringEquals),
        (Precise::stringGt, Precise::stringGt, Precise::stringGt, Precise::stringGt, Precise::stringGt),
        (Precise::stringGe, Precise::stringGe, Precise::stringGe, Precise::stringGe, Precise::stringGe),
        (Precise::stringLt, Precise::stringLt, Precise::stringLt, Precise::stringLt, Precise::stringLt),
        (Precise::stringLe, Precise::stringLe, Precise::stringLe, Precise::stringLe, Precise::stringLe),
        (Precise::stringOr, Precise::stringOr, Precise::stringOr, Precise::stringOr, Precise::stringOr),
    ];
    const DIV_PREC: (fn(&Opt, &Opt, &Value) -> Value, fn(&Value, &Value, &Value) -> Value) = (Precise::stringDivPrec, Precise::stringDivPrec);

    /// A typed string operand answers exactly what its boxed `Value` answered: `None` is `Value::Null`, `Some(s)` /
    /// `String` / `&str` are `Value::Str(s)`, on every arithmetic and comparator entry point and on either side.
    #[test]
    fn typed_operands_match_boxed() {
        let texts = ["0", "1", "-1.5", "0.00000001", "2.50", "-0.3", "123456789.123456789"];
        let none: Opt = None;
        let prec = Value::Int(4);
        for x in texts {
            let ox: Opt = Some(x.to_string());
            let sx: String = x.to_string();
            let vx = Value::Str(x.into());
            for (fo, fs, fstr, fv) in UNARY {
                let want = fv(&vx);
                assert_eq!(fo(&ox), want);
                assert_eq!(fs(&sx), want);
                assert_eq!(fstr(x), want);
                assert_eq!(fo(&none), fv(&Value::Null));
            }
            for y in texts {
                let oy: Opt = Some(y.to_string());
                let vy = Value::Str(y.into());
                for (foo, fso, fvo, fov, fvv) in BINARY {
                    let want = fvv(&vx, &vy);
                    assert_eq!(foo(&ox, &oy), want);
                    assert_eq!(fso(&sx, &oy), want);
                    assert_eq!(fvo(&vx, &oy), want);
                    assert_eq!(fov(&ox, &vy), want);
                    assert_eq!(foo(&none, &oy), fvv(&Value::Null, &vy));
                    assert_eq!(fov(&ox, &Value::Null), fvv(&vx, &Value::Null));
                }
                assert_eq!((DIV_PREC.0)(&ox, &oy, &prec), (DIV_PREC.1)(&vx, &vy, &prec));
            }
        }
        // a non-string Value operand keeps its own text (unchanged path)
        assert_eq!((BINARY[0].2)(&Value::Int(2), &Some("3".to_string())), Value::Str("5".into()));
    }
}

#[cfg(test)]
mod decimal_path_tests {
    use super::*;

    #[test]
    fn string_div_pins_outputs() {
        let cases: &[(&str, &str, &str)] = &[
            ("10", "4", "2.5"),
            ("1", "3", "0.3333333333333333333333333333"),
            ("2", "3", "0.6666666666666666666666666667"),
            ("-2", "3", "-0.6666666666666666666666666667"),
            ("2", "-3", "-0.6666666666666666666666666667"),
            ("-2", "-3", "0.6666666666666666666666666667"),
            ("10", "3", "3.3333333333333333333333333333"),
            ("100", "3", "33.333333333333333333333333333"),
            ("1", "7", "0.1428571428571428571428571429"),
            ("22", "7", "3.1428571428571428571428571429"),
            ("5", "2", "2.5"),
            ("1", "8", "0.125"),
            ("0", "5", "0"),
            ("-0", "5", "0"),
            ("0", "-5", "0"),
            ("1.50", "0.5", "3"),
            ("1.5e3", "2", "750"),
            ("1E-5", "3", "0.0000033333333333333333333333"),
            ("123456789012345678", "7", "17636684144620811.142857142857"),
            ("0.123456789012345678", "3", "0.041152263004115226"),
            ("0.1234567890123456789012345678", "2", "0.0617283945061728394506172839"),
            ("0.1234567890123456789012345678", "3", "0.0411522630041152263004115226"),
            ("-0.1234567890123456789012345678", "7", "-0.0176366841446208112716049383"),
            ("79228162514264337593543950335", "1", "79228162514264337593543950335"),
            ("79228162514264337593543950335", "3", "26409387504754779197847983445"),
            ("-79228162514264337593543950335", "7", "-11318308930609191084791992905"),
            ("1", "3000000", "0.0000003333333333333333333333"),
            ("1", "0.0003", "3333.3333333333333333333333333"),
            ("0.0000000000000000000000000001", "3", "0"),
            ("0.0000000000000000000000000002", "3", "0.0000000000000000000000000001"),
            ("0.0000000000000000000000000005", "10", "0"),
            ("0.0000000000000000000000000015", "10", "0.0000000000000000000000000002"),
            ("-0.0000000000000000000000000015", "10", "-0.0000000000000000000000000002"),
            ("0.1", "0.3", "0.3333333333333333333333333333"),
            ("100.000", "8.00", "12.5"),
            ("+6", "4", "1.5"),
            (".5", "2", "0.25"),
            ("5.", "2", "2.5"),
            ("1_000", "4", "250"),
        ];
        for (a, b, want) in cases {
            assert_eq!(string_div(a, b).as_deref(), Some(*want), "string_div({a:?}, {b:?})");
        }
        for (a, b) in [("1", "0"), ("1", "0.000"), ("0", "0"), ("abc", "1"), ("1", ""), ("", "1"), ("1.2.3", "1"), ("-", "1"), ("1e", "1"), (" 1", "1")] {
            assert_eq!(string_div(a, b), None, "string_div({a:?}, {b:?})");
        }
    }

    #[test]
    fn string_to_precision_pins_outputs() {
        let cases: &[(&str, u32, u8, &str)] = &[
            ("1.23456", 2, 0, "1.23"),
            ("1.23456", 2, 1, "1.23"),
            ("1.23456", 2, 2, "1.23"),
            ("1.23456", 2, 3, "1.24"),
            ("1.23456", 2, 4, "1.23"),
            ("1.235", 2, 0, "1.23"),
            ("1.235", 2, 1, "1.24"),
            ("1.235", 2, 2, "1.24"),
            ("1.235", 2, 3, "1.24"),
            ("1.235", 2, 4, "1.23"),
            ("1.225", 2, 0, "1.22"),
            ("1.225", 2, 1, "1.22"),
            ("1.225", 2, 2, "1.22"),
            ("1.225", 2, 3, "1.23"),
            ("1.225", 2, 4, "1.22"),
            ("1.245", 2, 0, "1.24"),
            ("1.245", 2, 1, "1.24"),
            ("1.245", 2, 2, "1.24"),
            ("1.245", 2, 3, "1.25"),
            ("1.245", 2, 4, "1.24"),
            ("-1.235", 2, 0, "-1.23"),
            ("-1.235", 2, 1, "-1.24"),
            ("-1.235", 2, 2, "-1.24"),
            ("-1.235", 2, 3, "-1.23"),
            ("-1.235", 2, 4, "-1.24"),
            ("-1.225", 2, 0, "-1.22"),
            ("-1.225", 2, 1, "-1.22"),
            ("-1.225", 2, 2, "-1.22"),
            ("-1.225", 2, 3, "-1.22"),
            ("-1.225", 2, 4, "-1.23"),
            ("1.231", 2, 0, "1.23"),
            ("1.231", 2, 1, "1.23"),
            ("1.231", 2, 2, "1.23"),
            ("1.231", 2, 3, "1.24"),
            ("1.231", 2, 4, "1.23"),
            ("-1.231", 2, 0, "-1.23"),
            ("-1.231", 2, 1, "-1.23"),
            ("-1.231", 2, 2, "-1.23"),
            ("-1.231", 2, 3, "-1.23"),
            ("-1.231", 2, 4, "-1.24"),
            ("1.239", 2, 0, "1.23"),
            ("1.239", 2, 1, "1.24"),
            ("1.239", 2, 2, "1.24"),
            ("1.239", 2, 3, "1.24"),
            ("1.239", 2, 4, "1.23"),
            ("-1.239", 2, 0, "-1.23"),
            ("-1.239", 2, 1, "-1.24"),
            ("-1.239", 2, 2, "-1.24"),
            ("-1.239", 2, 3, "-1.23"),
            ("-1.239", 2, 4, "-1.24"),
            ("0", 2, 0, "0.00"),
            ("0", 2, 1, "0.00"),
            ("0", 2, 2, "0.00"),
            ("0", 2, 3, "0.00"),
            ("0", 2, 4, "0.00"),
            ("-0", 2, 0, "0.00"),
            ("-0", 2, 1, "0.00"),
            ("-0", 2, 2, "0.00"),
            ("-0", 2, 3, "0.00"),
            ("-0", 2, 4, "0.00"),
            ("-0.001", 2, 0, "-0.00"),
            ("-0.001", 2, 1, "0.00"),
            ("-0.001", 2, 2, "0.00"),
            ("-0.001", 2, 3, "0.00"),
            ("-0.001", 2, 4, "-0.01"),
            ("0.001", 2, 0, "0.00"),
            ("0.001", 2, 1, "0.00"),
            ("0.001", 2, 2, "0.00"),
            ("0.001", 2, 3, "0.01"),
            ("0.001", 2, 4, "0.00"),
            ("5", 0, 0, "5"),
            ("5", 0, 1, "5"),
            ("5", 0, 2, "5"),
            ("5", 0, 3, "5"),
            ("5", 0, 4, "5"),
            ("-5", 0, 0, "-5"),
            ("-5", 0, 1, "-5"),
            ("-5", 0, 2, "-5"),
            ("-5", 0, 3, "-5"),
            ("-5", 0, 4, "-5"),
            ("1.5", 0, 0, "1"),
            ("1.5", 0, 1, "2"),
            ("1.5", 0, 2, "2"),
            ("1.5", 0, 3, "2"),
            ("1.5", 0, 4, "1"),
            ("2.5", 0, 0, "2"),
            ("2.5", 0, 1, "2"),
            ("2.5", 0, 2, "2"),
            ("2.5", 0, 3, "3"),
            ("2.5", 0, 4, "2"),
            ("-2.5", 0, 0, "-2"),
            ("-2.5", 0, 1, "-2"),
            ("-2.5", 0, 2, "-2"),
            ("-2.5", 0, 3, "-2"),
            ("-2.5", 0, 4, "-3"),
            ("0.5", 0, 0, "0"),
            ("0.5", 0, 1, "0"),
            ("0.5", 0, 2, "0"),
            ("0.5", 0, 3, "1"),
            ("0.5", 0, 4, "0"),
            ("-0.5", 0, 0, "-0"),
            ("-0.5", 0, 1, "0"),
            ("-0.5", 0, 2, "0"),
            ("-0.5", 0, 3, "0"),
            ("-0.5", 0, 4, "-1"),
            ("1.2", 5, 0, "1.20000"),
            ("1.2", 5, 1, "1.20000"),
            ("1.2", 5, 2, "1.20000"),
            ("1.2", 5, 3, "1.20000"),
            ("1.2", 5, 4, "1.20000"),
            ("1.5e3", 2, 0, "1500.00"),
            ("1.5e3", 2, 1, "1500.00"),
            ("1.5e3", 2, 2, "1500.00"),
            ("1.5e3", 2, 3, "1500.00"),
            ("1.5e3", 2, 4, "1500.00"),
            ("123456789.123456789", 4, 0, "123456789.1234"),
            ("123456789.123456789", 4, 1, "123456789.1235"),
            ("123456789.123456789", 4, 2, "123456789.1235"),
            ("123456789.123456789", 4, 3, "123456789.1235"),
            ("123456789.123456789", 4, 4, "123456789.1234"),
            ("0.123456789012345678", 10, 0, "0.1234567890"),
            ("0.123456789012345678", 10, 1, "0.1234567890"),
            ("0.123456789012345678", 10, 2, "0.1234567890"),
            ("0.123456789012345678", 10, 3, "0.1234567891"),
            ("0.123456789012345678", 10, 4, "0.1234567890"),
            ("0.1234567890123456789012345678", 1, 0, "0.1"),
            ("0.1234567890123456789012345678", 1, 1, "0.1"),
            ("0.1234567890123456789012345678", 1, 2, "0.1"),
            ("0.1234567890123456789012345678", 1, 3, "0.2"),
            ("0.1234567890123456789012345678", 1, 4, "0.1"),
            ("1.123456785", 8, 0, "1.12345678"),
            ("1.123456785", 8, 1, "1.12345678"),
            ("1.123456785", 8, 2, "1.12345678"),
            ("1.123456785", 8, 3, "1.12345679"),
            ("1.123456785", 8, 4, "1.12345678"),
            ("-1.123456775", 8, 0, "-1.12345677"),
            ("-1.123456775", 8, 1, "-1.12345678"),
            ("-1.123456775", 8, 2, "-1.12345678"),
            ("-1.123456775", 8, 3, "-1.12345677"),
            ("-1.123456775", 8, 4, "-1.12345678"),
            ("9.999", 2, 0, "9.99"),
            ("9.999", 2, 1, "10.00"),
            ("9.999", 2, 2, "10.00"),
            ("9.999", 2, 3, "10.00"),
            ("9.999", 2, 4, "9.99"),
            ("-9.999", 2, 0, "-9.99"),
            ("-9.999", 2, 1, "-10.00"),
            ("-9.999", 2, 2, "-10.00"),
            ("-9.999", 2, 3, "-9.99"),
            ("-9.999", 2, 4, "-10.00"),
            ("79228162514264337593543950335", 0, 0, "79228162514264337593543950335"),
            ("79228162514264337593543950335", 0, 1, "79228162514264337593543950335"),
            ("79228162514264337593543950335", 0, 2, "79228162514264337593543950335"),
            ("79228162514264337593543950335", 0, 3, "79228162514264337593543950335"),
            ("79228162514264337593543950335", 0, 4, "79228162514264337593543950335"),
            ("100", 3, 0, "100.000"),
            ("100", 3, 1, "100.000"),
            ("100", 3, 2, "100.000"),
            ("100", 3, 3, "100.000"),
            ("100", 3, 4, "100.000"),
            ("0.000", 2, 0, "0.00"),
            ("0.000", 2, 1, "0.00"),
            ("0.000", 2, 2, "0.00"),
            ("0.000", 2, 3, "0.00"),
            ("0.000", 2, 4, "0.00"),
            ("-0.000", 1, 0, "0.0"),
            ("-0.000", 1, 1, "0.0"),
            ("-0.000", 1, 2, "0.0"),
            ("-0.000", 1, 3, "0.0"),
            ("-0.000", 1, 4, "0.0"),
            ("1_0.5", 0, 0, "10"),
            ("1_0.5", 0, 1, "10"),
            ("1_0.5", 0, 2, "10"),
            ("1_0.5", 0, 3, "11"),
            ("1_0.5", 0, 4, "10"),
            ("0.1234567890123456789012345678", 27, 0, "0.123456789012345678901234567"),
            ("0.1234567890123456789012345678", 27, 2, "0.123456789012345678901234568"),
            ("-0.1234567890123456789012345678", 27, 0, "-0.123456789012345678901234567"),
            ("-0.1234567890123456789012345678", 27, 2, "-0.123456789012345678901234568"),
            ("-0.1234567890123456789012345678", 18, 0, "-0.123456789012345678"),
            ("-0.1234567890123456789012345678", 18, 2, "-0.123456789012345679"),
        ];
        for (a, k, m, want) in cases {
            assert_eq!(string_to_precision(a, *k, *m).as_deref(), Some(*want), "string_to_precision({a:?}, {k}, {m})");
        }
        for a in ["abc", "", "1.2.3", "-", "1e"] {
            for m in [0u8, 2, 3, 4] {
                assert_eq!(string_to_precision(a, 2, m), None, "string_to_precision({a:?}, 2, {m})");
            }
        }
    }
}

#[cfg(test)]
mod precise_struct_tests {
    use super::Precise;
    use crate::Value;

    #[test]
    fn decimals_shift_and_text_match_ts() {
        let mut p = Precise::new(Value::from("0.1"));
        p.decimals += 8;
        assert_eq!(p.reduce().to_string(), "0.000000001");
        let mut q = Precise::new(Value::from("0.1"));
        q.decimals += -8;
        assert_eq!(q.to_string(), "10000000");
        let mut r = Precise::new(Value::from("0.0100"));
        r.decimals = i64::max(r.decimals, 6);
        assert_eq!(r.to_string(), "0.0001");
        assert_eq!(Precise::new(Value::from("5e-3")).to_string(), "0.005");
        assert_eq!(Precise::new(Value::from("-12.50")).to_string(), "-12.5");
        assert_eq!(Precise::new(Value::from("0")).to_string(), "0");
    }
}
