// Hand-written methods that are ABOVE the
// `METHODS BELOW THIS LINE ARE TRANSPILED FROM TYPESCRIPT` marker in
// `ts/src/base/Exchange.ts`. These are TS class-field aliases that bind
// imported free functions (`safeValue = safeValue;` etc.) — they aren't
// transpiled, so we implement them by hand here.
//
// Signature convention to match the transpiler's call shape:
//
//   pub fn name(&self, arg1: Value, arg2: Value, optional_args: &[Value]) -> Value
//
// The call-site post-processor in `build/rustTranspiler.ts` wraps trailing
// args (defaults) into the `&[Value]` slice so `self.safe_value(obj, key)`
// becomes `self.safe_value(obj, key, &[])` and `self.safe_value(obj, key, d)`
// becomes `self.safe_value(obj, key, &[d])`.

#![allow(non_snake_case, dead_code, unused_variables)]

use crate::exchange::Exchange;
use crate::runtime::stringify_param;
use crate::{ExchangeError, Result, Value};
use indexmap::IndexMap as HashMap;
use std::sync::Arc;

/// Coerces `&Exchange` to `&mut Exchange`. The lint that warns about
/// this is suppressed locally — see the safety note on the call site.
#[allow(clippy::mut_from_ref, invalid_reference_casting)]
unsafe fn coerce_to_mut_unsafe(e: &Exchange) -> &mut Exchange {
    let ptr = e as *const Exchange as *mut Exchange;
    &mut *ptr
}

/// Non-cryptographic 64-bit PRNG (splitmix64) seeded from a global
/// counter mixed with the high-resolution clock. Good enough for the
/// `uuid*` helpers — uniqueness across calls, not security.
fn random_u64() -> u64 {
    use std::sync::atomic::{AtomicU64, Ordering};
    static COUNTER: AtomicU64 = AtomicU64::new(0);
    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_nanos() as u64)
        .unwrap_or(0);
    let n = COUNTER.fetch_add(1, Ordering::Relaxed);
    let mut z = now ^ n.wrapping_mul(0x9E37_79B9_7F4A_7C15);
    z = (z ^ (z >> 30)).wrapping_mul(0xBF58_476D_1CE4_E5B9);
    z = (z ^ (z >> 27)).wrapping_mul(0x94D0_49BB_1331_11EB);
    z ^ (z >> 31)
}

/// Returns `n` random lowercase hex characters.
fn random_hex(n: usize) -> String {
    let mut s = String::with_capacity(n);
    while s.len() < n {
        s.push_str(&format!("{:016x}", random_u64()));
    }
    s.truncate(n);
    s
}

/// Wraps a byte slice into the port's binary representation —
/// a `Value::Array` of `Value::Int` byte values.
fn bytes_to_value(bytes: &[u8]) -> Value {
    Value::Array(bytes.iter().map(|b| Value::Int(*b as i64)).collect())
}

/// True when `v` is a `Value::Array` whose elements are all integer
/// byte values (0..=255) — the port's stand-in for a binary buffer.
fn is_byte_array(v: &Value) -> bool {
    match v {
        Value::Arr(a) => a
            .iter()
            .all(|x| matches!(x, Value::Int(n) if (0..=255).contains(n))),
        _ => false,
    }
}

/// Recursive helper for `urlencodeNested` — flattens nested maps and
/// arrays into bracketed keys (`b[c]`, `d[0]`), encoding only values.
fn urlencode_nested_walk(prefix: &str, v: &Value, out: &mut Vec<String>) {
    match v {
        Value::Dict(m) => {
            for (k, val) in m.iter() {
                urlencode_nested_walk(&format!("{prefix}[{k}]"), val, out);
            }
        }
        Value::Arr(a) => {
            for (i, val) in a.iter().enumerate() {
                urlencode_nested_walk(&format!("{prefix}[{i}]"), val, out);
            }
        }
        scalar => {
            out.push(format!(
                "{}={}",
                prefix,
                crate::exchange::url_pct(&stringify_param(scalar))
            ));
        }
    }
}

/// f64 → plain decimal string (Rust's `{}` never uses scientific
/// notation for f64, matching TS `numberToString`).
fn dtp_num_to_string(x: f64) -> String {
    format!("{x}")
}

/// Free-function form of `precisionFromString` (returns i64).
fn precision_from_string_i64(s: &str) -> i64 {
    if let Some(idx) = s.find(['e', 'E']) {
        let exp: i64 = s[idx + 1..].parse().unwrap_or(0);
        return -exp;
    }
    let trimmed = s.trim_end_matches('0');
    match trimmed.split_once('.') {
        Some((_, frac)) => frac.len() as i64,
        None => 0,
    }
}

/// Port of `truncate_to_string` from `functions/number.ts`.
fn truncate_to_string(num: &str, precision: i64) -> String {
    if precision > 0 {
        if let Some(dot) = num.find('.') {
            let frac = &num[dot + 1..];
            if frac.len() as i64 > precision {
                return format!("{}.{}", &num[..dot], &frac[..precision as usize]);
            }
        }
        return num.to_string();
    }
    let int_part = num.split('.').next().unwrap_or("0");
    int_part
        .parse::<i64>()
        .map(|n| n.to_string())
        .unwrap_or_else(|_| "0".to_string())
}

/// Faithful port of `_decimalToPrecision` from `functions/number.ts`.
fn decimal_to_precision_impl(
    x: &str,
    rounding_mode: i64,
    num_precision_digits: f64,
    counting_mode: i64,
    padding_mode: i64,
) -> String {
    use crate::runtime::{
        DECIMAL_PLACES, NO_PADDING, ROUND, SIGNIFICANT_DIGITS, TICK_SIZE, TRUNCATE,
    };
    const ZERO: i64 = 48;
    const ONE: i64 = 49;
    const FIVE: i64 = 53;
    const NINE: i64 = 57;

    // ── negative precision ───────────────────────────────────────────
    if num_precision_digits < 0.0 {
        let to_nearest = 10f64.powf(-num_precision_digits);
        let xnum: f64 = x.parse().unwrap_or(0.0);
        if rounding_mode == ROUND {
            let inner = decimal_to_precision_impl(
                &dtp_num_to_string(xnum / to_nearest),
                rounding_mode,
                0.0,
                counting_mode,
                padding_mode,
            );
            let inner_num: f64 = inner.parse().unwrap_or(0.0);
            return dtp_num_to_string(to_nearest * inner_num);
        }
        if rounding_mode == TRUNCATE {
            return dtp_num_to_string(xnum - (xnum % to_nearest));
        }
    }

    // ── tick size ────────────────────────────────────────────────────
    if counting_mode == TICK_SIZE {
        let precision_digits_string = decimal_to_precision_impl(
            &dtp_num_to_string(num_precision_digits),
            ROUND,
            22.0,
            DECIMAL_PLACES,
            NO_PADDING,
        );
        let new_npd = precision_from_string_i64(&precision_digits_string);
        if rounding_mode == TRUNCATE {
            let truncated_x = truncate_to_string(x, new_npd.max(0));
            let x_num: f64 = truncated_x.parse().unwrap_or(0.0);
            let scale = 10f64.powi(new_npd as i32);
            let x_scaled = (x_num * scale).round();
            let tick_scaled = (num_precision_digits * scale).round();
            let ticks = (x_scaled / tick_scaled).trunc();
            let x_new = (ticks * tick_scaled) / scale;
            if padding_mode == NO_PADDING {
                let fixed = format!("{:.*}", new_npd.max(0) as usize, x_new);
                let renum: f64 = fixed.parse().unwrap_or(0.0);
                return dtp_num_to_string(renum);
            }
            return decimal_to_precision_impl(
                &dtp_num_to_string(x_new),
                ROUND,
                new_npd as f64,
                DECIMAL_PLACES,
                padding_mode,
            );
        }
        let mut x_num: f64 = x.parse().unwrap_or(0.0);
        let mut missing = x_num % num_precision_digits;
        missing = decimal_to_precision_impl(
            &dtp_num_to_string(missing),
            ROUND,
            8.0,
            DECIMAL_PLACES,
            NO_PADDING,
        )
        .parse()
        .unwrap_or(0.0);
        let fp_error = decimal_to_precision_impl(
            &dtp_num_to_string(missing / num_precision_digits),
            ROUND,
            new_npd.max(8) as f64,
            DECIMAL_PLACES,
            NO_PADDING,
        );
        if precision_from_string_i64(&fp_error) != 0 {
            if x_num > 0.0 {
                if missing >= num_precision_digits / 2.0 {
                    x_num = x_num - missing + num_precision_digits;
                } else {
                    x_num -= missing;
                }
            } else if missing >= num_precision_digits / 2.0 {
                x_num -= missing;
            } else {
                x_num = x_num - missing - num_precision_digits;
            }
        }
        return decimal_to_precision_impl(
            &dtp_num_to_string(x_num),
            ROUND,
            new_npd as f64,
            DECIMAL_PLACES,
            padding_mode,
        );
    }

    // ── main char-buffer path ────────────────────────────────────────
    let npd = num_precision_digits as i64;
    let bytes: Vec<u8> = x.as_bytes().to_vec();
    let str_end = bytes.len() as i64;
    if str_end == 0 {
        return String::new();
    }
    let is_negative = bytes[0] == b'-';
    let str_start: i64 = if is_negative { 1 } else { 0 };
    let mut str_dot = str_end;
    for k in 0..str_end {
        if bytes[k as usize] == b'.' {
            str_dot = k;
            break;
        }
    }
    let has_dot = str_dot < str_end;
    let chars_len = ((str_end - str_start) + if has_dot { 0 } else { 1 }) as usize;
    let mut chars = vec![ZERO as u8; chars_len];

    let mut after_dot = chars_len as i64;
    let mut digits_start: i64 = -1;
    let mut digits_end: i64;
    {
        let mut i: i64 = 1;
        let mut j: i64 = str_start;
        while j < str_end {
            let c = bytes[j as usize];
            if c == b'.' {
                after_dot = i;
                i -= 1;
            } else if !c.is_ascii_digit() {
                return x.to_string();
            } else {
                if (i as usize) < chars.len() {
                    chars[i as usize] = c;
                }
                if c != b'0' && digits_start < 0 {
                    digits_start = i;
                }
            }
            j += 1;
            i += 1;
        }
    }
    if digits_start < 0 {
        digits_start = 1;
    }

    let mut precision_start = if counting_mode == DECIMAL_PLACES {
        after_dot
    } else {
        digits_start
    };

    digits_end = -1;
    let mut all_zeros = true;
    let mut sign_needed = is_negative;
    {
        let mut memo: i64 = 0;
        let mut i = chars.len() as i64 - 1;
        while i >= 0 {
            let mut c = chars[i as usize] as i64;
            if i != 0 {
                c += memo;
                if i >= precision_start + npd {
                    let ceil =
                        (rounding_mode == ROUND) && (c >= FIVE) && !((c == FIVE) && memo != 0);
                    c = if ceil { NINE + 1 } else { ZERO };
                }
                if c > NINE {
                    c = ZERO;
                    memo = 1;
                } else {
                    memo = 0;
                }
            } else if memo != 0 {
                c = ONE;
            }
            chars[i as usize] = c as u8;
            if c != ZERO {
                all_zeros = false;
                digits_start = i;
                digits_end = if digits_end < 0 { i + 1 } else { digits_end };
            }
            i -= 1;
        }
    }

    if counting_mode == SIGNIFICANT_DIGITS {
        precision_start = digits_start;
    }
    let precision_end = precision_start + npd;
    if all_zeros {
        sign_needed = false;
    }

    let read_start = if digits_start >= after_dot || all_zeros {
        after_dot - 1
    } else {
        digits_start
    };
    let read_end = if digits_end < after_dot {
        after_dot
    } else {
        digits_end
    };

    let n_sign: i64 = if sign_needed { 1 } else { 0 };
    let n_before_dot = n_sign + (after_dot - read_start);
    let n_after_dot = (read_end - after_dot).max(0);
    let actual_length = read_end - read_start;
    let desired_length = if padding_mode == NO_PADDING {
        actual_length
    } else {
        precision_end - read_start
    };
    let pad = (desired_length - actual_length).max(0);
    let pad_start = n_before_dot + 1 + n_after_dot;
    let pad_end = pad_start + pad;
    let is_integer = (n_after_dot + pad) == 0;

    let out_len =
        (n_before_dot + if is_integer { 0 } else { 1 } + n_after_dot + pad).max(0) as usize;
    let mut out = vec![ZERO as u8; out_len];
    let get_char = |idx: i64| -> u8 {
        if idx >= 0 && (idx as usize) < chars.len() {
            chars[idx as usize]
        } else {
            ZERO as u8
        }
    };
    if sign_needed && !out.is_empty() {
        out[0] = b'-';
    }
    {
        let mut i = n_sign;
        let mut j = read_start;
        while i < n_before_dot {
            if (i as usize) < out.len() {
                out[i as usize] = get_char(j);
            }
            i += 1;
            j += 1;
        }
    }
    if !is_integer && (n_before_dot as usize) < out.len() {
        out[n_before_dot as usize] = b'.';
    }
    {
        let mut i = n_before_dot + 1;
        let mut j = after_dot;
        while i < pad_start {
            if (i as usize) < out.len() {
                out[i as usize] = get_char(j);
            }
            i += 1;
            j += 1;
        }
    }
    {
        let mut i = pad_start;
        while i < pad_end {
            if (i as usize) < out.len() {
                out[i as usize] = ZERO as u8;
            }
            i += 1;
        }
    }
    String::from_utf8(out).unwrap_or_default()
}

/// Coerces a `Value` (or a missing one) to `f64` — used by `aggregate`.
fn value_as_f64(v: Option<&Value>) -> f64 {
    match v {
        Some(Value::Int(n)) => *n as f64,
        Some(Value::Float(f)) => *f,
        Some(Value::Str(s)) => s.parse().unwrap_or(0.0),
        _ => 0.0,
    }
}

/// Generic ordering for `Value`s — numeric when both sides are
/// numbers, lexical for strings, used by `sortBy`/`sortBy2`.
fn value_cmp(a: &Value, b: &Value) -> std::cmp::Ordering {
    use std::cmp::Ordering;
    let num = |v: &Value| -> Option<f64> {
        match v {
            Value::Int(n) => Some(*n as f64),
            Value::Float(f) => Some(*f),
            _ => None,
        }
    };
    match (num(a), num(b)) {
        (Some(x), Some(y)) => x.partial_cmp(&y).unwrap_or(Ordering::Equal),
        _ => stringify_param(a).cmp(&stringify_param(b)),
    }
}

const BASE58_ALPHABET: &[u8] = b"123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

/// Base58 encode (Bitcoin alphabet).
fn base58_encode(input: &[u8]) -> String {
    if input.is_empty() {
        return String::new();
    }
    let zeros = input.iter().take_while(|&&b| b == 0).count();
    let mut digits: Vec<u8> = Vec::new();
    for &byte in input {
        let mut carry = byte as u32;
        for d in digits.iter_mut() {
            carry += (*d as u32) << 8;
            *d = (carry % 58) as u8;
            carry /= 58;
        }
        while carry > 0 {
            digits.push((carry % 58) as u8);
            carry /= 58;
        }
    }
    let mut out = String::with_capacity(zeros + digits.len());
    for _ in 0..zeros {
        out.push('1');
    }
    for &d in digits.iter().rev() {
        out.push(BASE58_ALPHABET[d as usize] as char);
    }
    out
}

/// Base58 decode (Bitcoin alphabet). Returns `None` on invalid input.
fn base58_decode(input: &str) -> Option<Vec<u8>> {
    if input.is_empty() {
        return Some(Vec::new());
    }
    let zeros = input.bytes().take_while(|&b| b == b'1').count();
    let mut bytes: Vec<u8> = Vec::new();
    for ch in input.bytes() {
        let mut carry = BASE58_ALPHABET.iter().position(|&a| a == ch)? as u32;
        for b in bytes.iter_mut() {
            carry += (*b as u32) * 58;
            *b = (carry & 0xff) as u8;
            carry >>= 8;
        }
        while carry > 0 {
            bytes.push((carry & 0xff) as u8);
            carry >>= 8;
        }
    }
    let mut out = vec![0u8; zeros];
    out.extend(bytes.iter().rev());
    Some(out)
}

fn arg_default(opt: &[Value]) -> Value {
    opt.get(0).cloned().unwrap_or(Value::Null)
}

fn strip_trailing_zeros(s: &str) -> String {
    if !s.contains('.') {
        return s.to_string();
    }
    let out = s.trim_end_matches('0').trim_end_matches('.');
    if out.is_empty() {
        "0".to_string()
    } else {
        out.to_string()
    }
}

fn key_str(key: &Value) -> String {
    stringify_param(key)
}

impl Exchange {
    // ── safe_* aliases (above-marker in TS) ─────────────────────────────────

    /// Coerce a caught panic payload into the `[ClassName] message`
    /// shape TS uses (see `Exchange.exceptionMessage`). Truncates to
    /// 100k chars to match. Rust panics carry just a string in `Value`,
    /// so we trust it as the formatted message and trim it. Used by
    /// exchanges that re-throw with a contextual prefix in their
    /// catch arms (grvt.transfer is the canonical case).
    pub fn exception_message(&self, exc: Value, _optional_args: &[Value]) -> Value {
        let s = match exc {
            Value::Str(s) => s,
            other => crate::runtime::stringify_param(&other),
        };
        let n = s.chars().count().min(100_000);
        Value::Str(s.chars().take(n).collect())
    }

    // ── Hot-path `safe_*_k` variants — take `key: &str` directly so the
    // transpiler can skip wrapping every literal key in a `Value::Str`.
    // Each `_k` saves two String allocations per call (the key Value +
    // the key_str re-extraction). On a 500-trade fetchTrades, cumulative
    // savings are several thousand allocations.

    #[inline]
    pub fn safe_value_k(&self, obj: Value, key: &str, optional_args: &[Value]) -> Value {
        let v = crate::value::get_value_k(&obj, key);
        let missing = matches!(&v, Value::Null) || matches!(&v, Value::Str(s) if s.is_empty());
        if missing {
            arg_default(optional_args)
        } else {
            v
        }
    }

    #[inline]
    pub fn safe_string_k(&self, obj: Value, key: &str, optional_args: &[Value]) -> Value {
        let v = self.safe_value_k(obj, key, &[]);
        match v {
            Value::Str(_) => v,
            Value::Int(n) => Value::Str(n.to_string()),
            Value::Float(f) => Value::Str(f.to_string()),
            Value::Bool(b) => Value::Str(b.to_string()),
            _ => arg_default(optional_args),
        }
    }

    #[inline]
    pub fn safe_integer_k(&self, obj: Value, key: &str, optional_args: &[Value]) -> Value {
        let v = self.safe_value_k(obj, key, &[]);
        match v {
            Value::Int(_) => v,
            Value::Float(f) => Value::Int(f as i64),
            Value::Str(s) => match s.parse::<i64>() {
                Ok(n) => Value::Int(n),
                Err(_) => match s.parse::<f64>() {
                    Ok(f) if f.is_finite() => Value::Int(f as i64),
                    _ => arg_default(optional_args),
                },
            },
            _ => arg_default(optional_args),
        }
    }

    #[inline]
    pub fn safe_float_k(&self, obj: Value, key: &str, optional_args: &[Value]) -> Value {
        let v = self.safe_value_k(obj, key, &[]);
        match v {
            Value::Float(_) => v,
            Value::Int(n) => Value::Float(n as f64),
            Value::Str(s) => match s.parse::<f64>() {
                Ok(n) => Value::Float(n),
                Err(_) => arg_default(optional_args),
            },
            _ => arg_default(optional_args),
        }
    }

    #[inline]
    pub fn safe_number_k(&self, obj: Value, key: &str, optional_args: &[Value]) -> Value {
        self.safe_float_k(obj, key, optional_args)
    }

    #[inline]
    pub fn safe_bool_k(&self, obj: Value, key: &str, optional_args: &[Value]) -> Value {
        // Mirror CCXT `safeBool`: the value is returned ONLY when it is an
        // actual boolean (`typeof value === 'boolean'`). A string like
        // "true" or an integer is NOT a boolean, so it yields the default
        // — coercing them (as a previous version did) diverges from every
        // other language and broke e.g. zebpay `fetchCurrencies`, where
        // `isDepositEnabled: "true"` (a string) must read as the default.
        let v = self.safe_value_k(obj, key, &[]);
        match v {
            Value::Bool(_) => v,
            _ => arg_default(optional_args),
        }
    }

    #[inline]
    pub fn safe_dict_k(&self, obj: Value, key: &str, optional_args: &[Value]) -> Value {
        let v = self.safe_value_k(obj, key, &[]);
        if matches!(v, Value::Dict(_)) {
            v
        } else {
            arg_default(optional_args)
        }
    }

    #[inline]
    pub fn safe_list_k(&self, obj: Value, key: &str, optional_args: &[Value]) -> Value {
        let v = self.safe_value_k(obj, key, &[]);
        if matches!(v, Value::Arr(_)) {
            v
        } else {
            arg_default(optional_args)
        }
    }

    pub fn safe_value(&self, obj: Value, key: Value, optional_args: &[Value]) -> Value {
        // Match TS `prop` semantics: an empty string is treated as
        // "missing" — same as null/undefined. Without this, exchanges
        // that signal end-of-pagination with `cursor: ""` loop forever
        // because `is_equal(&Value::Str(""), &Value::Null)` is false.
        let v = crate::get_value(&obj, &Value::Str(key_str(&key)));
        let missing = matches!(&v, Value::Null) || matches!(&v, Value::Str(s) if s.is_empty());
        if missing {
            arg_default(optional_args)
        } else {
            v
        }
    }

    pub fn safe_value2(&self, obj: Value, k1: Value, k2: Value, optional_args: &[Value]) -> Value {
        let v = self.safe_value(obj.clone(), k1, &[]);
        if !v.is_null() {
            return v;
        }
        let v = self.safe_value(obj, k2, &[]);
        if !v.is_null() {
            v
        } else {
            arg_default(optional_args)
        }
    }

    pub fn safe_value_n(&self, obj: Value, keys: Value, optional_args: &[Value]) -> Value {
        if let Value::Arr(ks) = keys {
            for k in ks.iter().cloned() {
                let v = self.safe_value(obj.clone(), k, &[]);
                if !v.is_null() {
                    return v;
                }
            }
        }
        arg_default(optional_args)
    }

    pub fn safe_string(&self, obj: Value, key: Value, optional_args: &[Value]) -> Value {
        let v = self.safe_value(obj, key, &[]);
        match v {
            Value::Str(_) => v,
            Value::Int(n) => Value::Str(n.to_string()),
            Value::Float(f) => Value::Str(f.to_string()),
            Value::Bool(b) => Value::Str(b.to_string()),
            Value::Null => arg_default(optional_args),
            _ => arg_default(optional_args),
        }
    }

    pub fn safe_string2(&self, obj: Value, k1: Value, k2: Value, optional_args: &[Value]) -> Value {
        let v = self.safe_string(obj.clone(), k1, &[]);
        if !v.is_null() {
            return v;
        }
        let v = self.safe_string(obj, k2, &[]);
        if !v.is_null() {
            v
        } else {
            arg_default(optional_args)
        }
    }

    pub fn safe_string_n(&self, obj: Value, keys: Value, optional_args: &[Value]) -> Value {
        if let Value::Arr(ks) = keys {
            for k in ks.iter().cloned() {
                let v = self.safe_string(obj.clone(), k, &[]);
                if !v.is_null() {
                    return v;
                }
            }
        }
        arg_default(optional_args)
    }

    // NB: case-transform the *found* value only, and return the default
    // UNCHANGED — matching TS `safeStringLower/Upper` (type.ts), which lower/
    // upper-cases `String(x)` when the key resolves and otherwise returns
    // `$default` verbatim. Passing the default through `safe_string` first
    // (and then casing the result) wrongly lower-cased mixed-case defaults
    // such as hyperliquid's checksummed builder address.
    pub fn safe_string_upper(&self, obj: Value, key: Value, optional_args: &[Value]) -> Value {
        let v = self.safe_string(obj, key, &[]);
        if !v.is_null() {
            if let Value::Str(s) = v {
                return Value::Str(s.to_uppercase());
            }
            return v;
        }
        arg_default(optional_args)
    }

    pub fn safe_string_lower_n(&self, obj: Value, keys: Value, optional_args: &[Value]) -> Value {
        if let Value::Arr(ks) = keys {
            for k in ks.iter().cloned() {
                let v = self.safe_string(obj.clone(), k, &[]);
                if !v.is_null() {
                    if let Value::Str(s) = v {
                        return Value::Str(s.to_lowercase());
                    }
                    return v;
                }
            }
        }
        arg_default(optional_args)
    }

    pub fn safe_string_upper_n(&self, obj: Value, keys: Value, optional_args: &[Value]) -> Value {
        if let Value::Arr(ks) = keys {
            for k in ks.iter().cloned() {
                let v = self.safe_string(obj.clone(), k, &[]);
                if !v.is_null() {
                    if let Value::Str(s) = v {
                        return Value::Str(s.to_uppercase());
                    }
                    return v;
                }
            }
        }
        arg_default(optional_args)
    }

    pub fn safe_string_lower(&self, obj: Value, key: Value, optional_args: &[Value]) -> Value {
        let v = self.safe_string(obj, key, &[]);
        if !v.is_null() {
            if let Value::Str(s) = v {
                return Value::Str(s.to_lowercase());
            }
            return v;
        }
        arg_default(optional_args)
    }

    pub fn safe_string_lower2(
        &self,
        obj: Value,
        k1: Value,
        k2: Value,
        optional_args: &[Value],
    ) -> Value {
        let v = self.safe_string2(obj, k1, k2, &[]);
        if !v.is_null() {
            if let Value::Str(s) = v {
                return Value::Str(s.to_lowercase());
            }
            return v;
        }
        arg_default(optional_args)
    }

    pub fn safe_string_upper2(
        &self,
        obj: Value,
        k1: Value,
        k2: Value,
        optional_args: &[Value],
    ) -> Value {
        let v = self.safe_string2(obj, k1, k2, &[]);
        if !v.is_null() {
            if let Value::Str(s) = v {
                return Value::Str(s.to_uppercase());
            }
            return v;
        }
        arg_default(optional_args)
    }

    /// `super.X(...)` from derived exchanges — routes back to the base
    /// Exchange impl. These stubs return Value::Null; they exist so
    /// transpiled `self.super_X()` calls type-check.
    pub fn super_describe(&self) -> Value {
        // Return the base `Exchange::describe()` so derived exchanges'
        // `deep_extend(self.super_describe(), { ... })` inherit the base
        // `has`/`timeframes`/`options` defaults (mirrors TS
        // `deepExtend(super.describe(), ...)`). `self` here is the base
        // `Exchange`, so this resolves to the inherent base describe (no
        // dynamic dispatch → no recursion into the derived describe).
        // Without this, exchanges that rely on a base default they don't
        // re-declare (e.g. foxbit/latoken/alias `has.fetchOrderBook`) end
        // up with those flags missing.
        self.describe()
    }
    pub fn super_set_sandbox_mode(&mut self, _enabled: Value) { /* stub */
    }
    pub fn super_safe_market(
        &self,
        id: Value,
        market: Value,
        delim: Value,
        market_type: Value,
    ) -> Value {
        // Forward to the base Exchange::safe_market (transpiled into
        // exchange_generated.rs). `super.safeMarket(...)` in a derived
        // exchange means "call the parent class's impl".
        self.safe_market(&[id, market, delim, market_type])
    }
    pub fn super_currency(&self, _code: Value) -> Value {
        Value::Null
    }
    pub fn super_handle_errors(
        &self,
        _code: Value,
        _reason: Value,
        _url: Value,
        _method: Value,
        _headers: Value,
        _body: Value,
        _response: Value,
        _request_headers: Value,
        _request_body: Value,
    ) -> Value {
        Value::Null
    }
    pub fn super_handle_market_type_and_params(
        &self,
        method_name: Value,
        market: Value,
        params: Value,
        default_value: Value,
    ) -> Value {
        self.handle_market_type_and_params(method_name, &[market, params, default_value])
    }
    pub fn super_market(&self, symbol: Value) -> Value {
        self.market(symbol)
    }
    pub async fn super_fetch_deposit_address(&self, code: Value, params: Value) -> Value {
        // The transpiled call site holds `&self` borrows for other args
        // (e.g. `self.extend(...)`), so we can't take `&mut self`. Coerce
        // to mut via the same unsafe helper used by call_method.
        let me = unsafe { coerce_to_mut_unsafe(self) };
        me.fetch_deposit_address(code, &[params]).await
    }
    pub fn super_amount_to_precision(&self, symbol: Value, amount: Value) -> Value {
        self.amount_to_precision(symbol, amount)
    }
    pub fn super_handle_margin_mode_and_params(
        &self,
        method_name: Value,
        params: Value,
        default_value: Value,
    ) -> Value {
        self.handle_margin_mode_and_params(method_name, &[params, default_value])
    }
    pub fn super_safe_currency_code(&self, currency_id: Value, currency: Value) -> Value {
        self.safe_currency_code(currency_id, &[currency])
    }
    pub fn super_set_markets(&self, markets: Value, currencies: Value) -> Value {
        let me = unsafe { coerce_to_mut_unsafe(self) };
        me.set_markets(markets, &[currencies])
    }
    pub fn super_network_id_to_code(&self, optional_args: &[Value]) -> Value {
        self.network_id_to_code(optional_args)
    }

    // ── request bookkeeping (hand-written, above the transpile marker) ──
    // These live above the `METHODS BELOW THIS LINE ...` marker in
    // `ts/src/base/Exchange.ts` (plain assignments in most languages), so
    // they are implemented by hand rather than transpiled. They mutate
    // instance fields; the `&self` receiver matches the transpiler's call
    // shape and we reborrow `&mut` via the same helper as `super_set_markets`.
    pub fn set_last_rest_request_timestamp(&self) {
        let me = unsafe { coerce_to_mut_unsafe(self) };
        me.lastRestRequestTimestamp = self.milliseconds();
    }

    pub fn set_last_request(&self, request: Value) {
        let me = unsafe { coerce_to_mut_unsafe(self) };
        me.last_request_headers =
            crate::runtime::get_value(&request, &Value::Str("headers".to_string()));
        me.last_request_body = crate::runtime::get_value(&request, &Value::Str("body".to_string()));
        me.last_request_url = crate::runtime::get_value(&request, &Value::Str("url".to_string()));
    }

    pub fn get_fetch_cache(&self) -> Value {
        self.fetchHistoryCache.clone()
    }

    pub fn add_fetch_cache(&self, data: Value) {
        let me = unsafe { coerce_to_mut_unsafe(self) };
        if crate::runtime::is_less_than_or_equal(&me.fetchHistoryCacheSize, &Value::Int(0)) {
            return;
        }
        while crate::runtime::is_greater_than_or_equal(
            &crate::runtime::get_array_length(&me.fetchHistoryCache),
            &me.fetchHistoryCacheSize,
        ) {
            crate::runtime::remove(&mut me.fetchHistoryCache, &Value::Int(0));
        }
        crate::runtime::append_to_array(&mut me.fetchHistoryCache, data);
    }
    pub fn super_network_code_to_id(&self, network_code: Value, optional_args: &[Value]) -> Value {
        self.network_code_to_id(network_code, optional_args)
    }
    pub async fn super_load_markets(&self, reload: Value, params: Value) -> Value {
        let me = unsafe { coerce_to_mut_unsafe(self) };
        me.load_markets(&[reload, params]).await
    }

    // ── WS (pro) stubs ─────────────────────────────────────────────────────
    // The transpiled pro/<id>.rs files reference `self.watch()`, `self.client()`,
    // `self.spawn()` etc. from the WS Client infrastructure that hasn't been
    // ported yet. These stubs make the WS-extends-REST inheritance compile —
    // calls at runtime panic with a clear "WS not yet ported" error so we
    // surface the gap loudly instead of silently no-op'ing.
    //
    // Once `ts/src/base/ws/Client.ts` is ported, these stubs go away in
    // favour of the real impls.
    pub async fn watch(&mut self, _url: Value, _msg_hash: Value, _args: &[Value]) -> Value {
        panic!("[NotSupported] WS .watch() not yet ported")
    }
    pub async fn watch_multiple(
        &mut self,
        _url: Value,
        _msg_hashes: Value,
        _args: &[Value],
    ) -> Value {
        panic!("[NotSupported] WS .watch_multiple() not yet ported")
    }
    pub fn client(&mut self, _args: &[Value]) -> Value {
        Value::Null
    }
    pub fn spawn(&self, _args: &[Value]) -> Value {
        Value::Null
    }
    pub async fn delay(&mut self, _ms: Value, _args: &[Value]) -> Value {
        Value::Null
    }
    pub fn order_book(&self, _args: &[Value]) -> Value {
        crate::pro::OrderBook::new(Value::Null, Value::Null)
    }
    pub fn indexed_order_book(&self, _args: &[Value]) -> Value {
        crate::pro::IndexedOrderBook::new(Value::Null, Value::Null)
    }
    pub fn counted_order_book(&self, _args: &[Value]) -> Value {
        crate::pro::CountedOrderBook::new(Value::Null, Value::Null)
    }
    pub fn safe_order_tracker(&self, _args: &[Value]) -> Value {
        Value::Null
    }
    pub async fn un_watch(&mut self, _topic: Value, _args: &[Value]) -> Value {
        Value::Null
    }
    pub fn send(&self, _payload: Value) -> Value {
        Value::Null
    }
    pub fn lock_id(&self, _args: &[Value]) -> Value {
        Value::Null
    }
    pub fn unlock_id(&self, _args: &[Value]) -> Value {
        Value::Null
    }
    pub fn extend_exchange_options(&self, _args: &[Value]) -> Value {
        Value::Null
    }
    pub fn on_error(&self, _args: &[Value]) -> Value {
        Value::Null
    }
    pub fn on_close(&self, _args: &[Value]) -> Value {
        Value::Null
    }
    pub fn on_pong(&self, _args: &[Value]) -> Value {
        Value::Null
    }
    /// CRC-32 checksum — used by a few WS order-book reconcilers
    /// (bitget, bitfinex, independentreserve). Stub returns 0; will be
    /// replaced with the real algorithm when those order books need it.
    pub fn crc32(&self, _args: &[Value]) -> Value {
        Value::Int(0)
    }
    /// `decode_proto_msg(message)` — exchange-specific protobuf
    /// decoder (mexc). Stub returns the input unchanged.
    pub fn decode_proto_msg(&self, _args: &[Value]) -> Value {
        Value::Null
    }
    /// `loadOrderBook` — WS helper used by some bookkeeping methods.
    /// Stubbed identically to the unwatch flow.
    pub async fn load_order_book(&mut self, _args: &[Value]) -> Value {
        Value::Null
    }

    // ── hand-written base helpers ──────────────────────────────────────────
    // These live above the `METHODS BELOW THIS LINE ARE TRANSPILED` marker in
    // ts/src/base/Exchange.ts, so they are language-specific hand-written code
    // rather than transpiled into exchange_generated.rs.

    /// `remove0xPrefix(hexData)` — strips a leading `0x`/`0X` if present.
    pub fn remove0x_prefix(&self, hex_data: Value) -> Value {
        match &hex_data {
            Value::Str(s) if s.len() >= 2 && (&s[0..2] == "0x" || &s[0..2] == "0X") => {
                Value::Str(s[2..].to_string())
            }
            _ => hex_data,
        }
    }

    /// `checkRequiredDependencies()` — a no-op in Rust; all crypto deps are
    /// compiled in.
    pub fn check_required_dependencies(&self) -> Value {
        Value::Null
    }

    /// `randNumber(size)` — a random integer with `size` decimal digits.
    pub fn rand_number(&self, size: Value) -> Value {
        use rand::Rng;
        let n = size.as_i64().unwrap_or(0).max(0) as usize;
        let mut rng = rand::thread_rng();
        let mut s = String::new();
        for _ in 0..n {
            s.push(char::from(b'0' + rng.gen_range(0..10u8)));
        }
        Value::Int(s.parse::<i64>().unwrap_or(0))
    }

    /// `randomBytes(length)` — `length` random bytes as a hex string.
    pub fn random_bytes(&self, length: Value) -> Value {
        use rand::Rng;
        let n = length.as_i64().unwrap_or(0).max(0) as usize;
        let mut rng = rand::thread_rng();
        let bytes: Vec<u8> = (0..n).map(|_| rng.gen()).collect();
        Value::Str(hex::encode(bytes))
    }

    /// `convertToBigInt(value)` — the Value-bag has no distinct bigint type,
    /// so coerce to a 64-bit integer.
    pub fn convert_to_big_int(&self, value: Value) -> Value {
        match &value {
            Value::Int(_) => value,
            Value::Float(f) => Value::Int(*f as i64),
            Value::Str(s) => {
                let t = s.trim();
                // A uint256 (e.g. polymarket tokenId) overflows i64; keep the
                // decimal/0x-hex string so downstream big-int consumers
                // (eth_abi_encode) encode the full value instead of truncating.
                match t.parse::<i64>() {
                    Ok(n) => Value::Int(n),
                    Err(_) => Value::Str(t.to_string()),
                }
            }
            _ => Value::Int(0),
        }
    }

    /// `fixStringifiedJsonMembers(content)` — un-escapes a JSON string whose
    /// members are themselves stringified JSON (used by bingx).
    pub fn fix_stringified_json_members(&self, content: Value) -> Value {
        match &content {
            Value::Str(s) => Value::Str(
                s.replace('\\', "")
                    .replace("\"{", "{")
                    .replace("}\"", "}")
                    .replace("\"[", "[")
                    .replace("]\"", "]"),
            ),
            _ => content,
        }
    }

    /// `binaryConcatArray(arrayOfChunks)` — concatenates hex-string chunks.
    pub fn binary_concat_array(&self, arr: Value) -> Value {
        let mut out = String::new();
        if let Value::Arr(items) = &arr {
            for it in items.iter() {
                if let Value::Str(s) = it {
                    out.push_str(s);
                }
            }
        }
        Value::Str(out)
    }

    /// `uuid5(namespace, name)` — RFC-4122 v5 (SHA-1 based) UUID.
    pub fn uuid5(&self, namespace: Value, name: Value) -> Value {
        use sha1::{Digest, Sha1};
        let ns = namespace.as_str().unwrap_or("").replace('-', "");
        let mut data: Vec<u8> = Vec::new();
        let mut i = 0;
        while i + 1 < ns.len() {
            if let Ok(b) = u8::from_str_radix(&ns[i..i + 2], 16) {
                data.push(b);
            }
            i += 2;
        }
        data.extend_from_slice(name.as_str().unwrap_or("").as_bytes());
        let mut hasher = Sha1::new();
        hasher.update(&data);
        let mut hash = hasher.finalize().to_vec();
        hash[6] = (hash[6] & 0x0f) | 0x50;
        hash[8] = (hash[8] & 0x3f) | 0x80;
        let h = hex::encode(&hash[0..16]);
        Value::Str(format!(
            "{}-{}-{}-{}-{}",
            &h[0..8],
            &h[8..12],
            &h[12..16],
            &h[16..20],
            &h[20..32]
        ))
    }

    /// `ethAbiEncode(types, values)` — Solidity `abi.encode` of a head-only
    /// (all-static) tuple: every element becomes one 32-byte word. Supports the
    /// static types the callers use (address, bytesN, uint*/int*, bool). Dynamic
    /// types (`bytes`, `string`, arrays) are not needed (polymarket ERC-7739) and
    /// return Null. Values arrive as: bytesN → binary `Value::Arr` (or 0x-hex
    /// string); uint/int → `Value::Int` or a decimal/0x-hex string (big uint256
    /// like tokenId exceed i64, so string form is preserved by convert_to_big_int);
    /// address → 0x-hex string. Result is a binary `Value::Arr` that `hash(...)`
    /// consumes via value_to_bytes.
    pub fn eth_abi_encode(&self, types: Value, values: Value) -> Value {
        use num_bigint::BigInt;
        let ts: Vec<Value> = match &types  { Value::Arr(a) => (**a).clone(), _ => return Value::Null };
        let vs: Vec<Value> = match &values { Value::Arr(a) => (**a).clone(), _ => return Value::Null };
        let to_bytes = |v: &Value| -> Vec<u8> {
            match v {
                Value::Arr(a) => a.iter().filter_map(|x| if let Value::Int(n) = x { Some(*n as u8) } else { None }).collect(),
                Value::Str(s) => hex::decode(s.trim_start_matches("0x")).unwrap_or_default(),
                _ => Vec::new(),
            }
        };
        let to_bigint = |v: &Value| -> BigInt {
            match v {
                Value::Int(n)   => BigInt::from(*n),
                Value::Float(f) => BigInt::from(*f as i64),
                Value::Str(s)   => {
                    let t = s.trim();
                    if let Some(h) = t.strip_prefix("0x") {
                        BigInt::parse_bytes(h.as_bytes(), 16).unwrap_or_default()
                    } else {
                        BigInt::parse_bytes(t.as_bytes(), 10).unwrap_or_default()
                    }
                }
                _ => BigInt::from(0),
            }
        };
        let mut out: Vec<u8> = Vec::new();
        for (t, v) in ts.iter().zip(vs.iter()) {
            let ty = match t { Value::Str(s) => s.as_str(), _ => return Value::Null };
            let mut word = [0u8; 32];
            if ty == "address" {
                let b = to_bytes(v);
                let n = b.len().min(20);
                word[32 - n..].copy_from_slice(&b[b.len() - n..]);
            } else if ty.starts_with("bytes") && ty != "bytes" {
                // fixed bytesN — left-aligned
                let b = to_bytes(v);
                let n = b.len().min(32);
                word[..n].copy_from_slice(&b[..n]);
            } else if ty.starts_with("uint") {
                let (_, mag) = to_bigint(v).to_bytes_be();
                let n = mag.len().min(32);
                word[32 - n..].copy_from_slice(&mag[mag.len() - n..]);
            } else if ty.starts_with("int") {
                // signed intN — two's-complement, sign-extended to 32 bytes.
                use num_bigint::Sign;
                let bi = to_bigint(v);
                let sbytes = bi.to_signed_bytes_be();
                if bi.sign() == Sign::Minus { word = [0xff; 32]; }
                let n = sbytes.len().min(32);
                word[32 - n..].copy_from_slice(&sbytes[sbytes.len() - n..]);
            } else if ty == "bool" {
                if matches!(v, Value::Bool(true)) { word[31] = 1; }
            } else {
                return Value::Null; // unsupported (dynamic) type
            }
            out.extend_from_slice(&word);
        }
        Value::Array(out.into_iter().map(|b| Value::Int(b as i64)).collect())
    }

    /// `setProperty(this, key, value)` — dynamic field setter. The typed
    /// `Exchange` struct has no Value-shaped dynamic field store, so this
    /// is currently a no-op (the receiver arg is dropped by the transpiler).
    pub fn set_property(&self, _property: Value, _optional_args: &[Value]) -> Value {
        Value::Null
    }

    // ── exchange-specific signing helpers (above-the-marker base methods) ──
    // These wrap heavy crypto (curve25519, StarkNet, dydx protobuf, lighter
    // zk-proofs) that has not yet been ported to Rust. The terminal
    // signature-producing methods fail loudly with NotSupported rather than
    // returning a null/empty signature — an unsigned request silently sent to an
    // exchange is worse than an explicit error (review #4). The static request
    // fixtures mark the affected private cases `disabledRS`, as Go/Java do.

    /// Fail loudly for an unported crypto/signing primitive. Diverges (`-> !`),
    /// so it satisfies any `-> Value` stub body.
    fn crypto_not_supported(&self, what: &str) -> ! {
        let id = match &self.id { Value::Str(s) => s.clone(), _ => String::new() };
        panic!("{}", crate::exchange_errors::not_supported(Value::Str(
            format!("{id} {what}() signing is not implemented in the Rust port yet"),
        )));
    }

    /// `axolotl(payload, hexKey, ed25519)` — curve25519 signing (waves).
    pub fn axolotl(&self, _payload: Value, _hex_key: Value, _ed25519: Value) -> Value {
        self.crypto_not_supported("axolotl")
    }

    /// `retrieveStarkAccount(signature, accountClassHash, accountProxyClassHash)`.
    pub fn retrieve_stark_account(
        &self,
        _signature: Value,
        _class_hash: Value,
        _proxy_hash: Value,
    ) -> Value {
        Value::Null
    }

    /// `starknetEncodeStructuredData(domain, messageTypes, messageData, address)`.
    pub fn starknet_encode_structured_data(
        &self,
        _domain: Value,
        _types: Value,
        _data: Value,
        _address: Value,
    ) -> Value {
        Value::Null
    }

    /// `starknetSign(msgHash, pri)`.
    pub fn starknet_sign(&self, _msg_hash: Value, _pri: Value) -> Value {
        self.crypto_not_supported("starknetSign")
    }

    /// `extendedStarknetSign(msgHash, pri)` — starknet-curve signing for the
    /// `extended` exchange. Stub: starknet crypto (poseidon/stark-curve) is
    /// not ported to Rust yet, matching `starknet_sign` above.
    pub fn extended_starknet_sign(&self, _msg_hash: Value, _pri: Value) -> Value {
        self.crypto_not_supported("extendedStarknetSign")
    }

    /// `extendedStarknetGetSelectorFromName(name)`.
    pub fn extended_starknet_get_selector_from_name(&self, _name: Value) -> Value {
        Value::Null
    }

    /// `extendedStarknetComputePoseidonHashOnElements(data)`.
    pub fn extended_starknet_compute_poseidon_hash_on_elements(&self, _data: Value) -> Value {
        Value::Null
    }

    /// `toDydxLong(numStr)`.
    pub fn to_dydx_long(&self, _num_str: Value) -> Value {
        Value::Null
    }

    /// `retrieveDydxCredentials(entropy)`.
    pub fn retrieve_dydx_credentials(&self, _entropy: Value) -> Value {
        Value::Null
    }

    /// `loadDydxProtos()`.
    pub async fn load_dydx_protos(&self) -> Value {
        Value::Null
    }

    /// `encodeDydxTxRaw(signDoc, signature)`.
    pub fn encode_dydx_tx_raw(&self, _sign_doc: Value, _signature: Value) -> Value {
        self.crypto_not_supported("encodeDydxTxRaw")
    }

    /// `encodeDydxTxForSimulation(message, memo, sequence, publicKey)`.
    pub fn encode_dydx_tx_for_simulation(
        &self,
        _message: Value,
        _memo: Value,
        _sequence: Value,
        _public_key: Value,
    ) -> Value {
        Value::Null
    }

    /// `encodeDydxTxForSigning(message, memo, chainId, account, authenticators, fee?)`.
    pub fn encode_dydx_tx_for_signing(
        &self,
        _message: Value,
        _memo: Value,
        _chain_id: Value,
        _account: Value,
        _authenticators: Value,
        _optional_args: &[Value],
    ) -> Value {
        Value::Null
    }

    /// `loadLighterLibrary(libraryPath, chainId, privateKey, apiKeyIndex, accountIndex, createClient?)`.
    pub async fn load_lighter_library(
        &self,
        _library_path: Value,
        _chain_id: Value,
        _private_key: Value,
        _api_key_index: Value,
        _account_index: Value,
        _optional_args: &[Value],
    ) -> Value {
        Value::Null
    }

    /// `lighterCreateClient(signer, chainId, privateKey, apiKeyIndex, accountIndex)`.
    pub fn lighter_create_client(
        &self,
        _signer: Value,
        _chain_id: Value,
        _private_key: Value,
        _api_key_index: Value,
        _account_index: Value,
    ) -> Value {
        Value::Null
    }

    /// `lighterGenerateApiKey(signer)`.
    pub fn lighter_generate_api_key(&self, _signer: Value) -> Value {
        self.crypto_not_supported("lighterGenerateApiKey")
    }

    /// `getZKTransferSignatureObj(seeds, order)` — apex StarkEx signing.
    pub async fn get_zk_transfer_signature_obj(
        &self,
        _seeds: Value,
        _optional_args: &[Value],
    ) -> Value {
        self.crypto_not_supported("getZKTransferSignatureObj")
    }

    /// `getZKContractSignatureObj(seeds, order)` — apex StarkEx signing.
    pub async fn get_zk_contract_signature_obj(
        &self,
        _seeds: Value,
        _optional_args: &[Value],
    ) -> Value {
        self.crypto_not_supported("getZKContractSignatureObj")
    }

    /// `futuresTransfer(code, amount, type, params?)` — binance futures
    /// wallet transfer; inherited by binancecoinm / binanceusdm.
    pub async fn futures_transfer(
        &self,
        _code: Value,
        _amount: Value,
        _transfer_type: Value,
        _optional_args: &[Value],
    ) -> Value {
        Value::Null
    }

    /// `lighterSign*(signer, request)` — lighter zk-proof signing helpers.
    pub fn lighter_sign_create_order(&self, _signer: Value, _request: Value) -> Value {
        self.crypto_not_supported("lighterSignCreateOrder")
    }
    pub fn lighter_sign_create_grouped_orders(&self, _signer: Value, _request: Value) -> Value {
        self.crypto_not_supported("lighterSignCreateGroupedOrders")
    }
    pub fn lighter_sign_cancel_order(&self, _signer: Value, _request: Value) -> Value {
        self.crypto_not_supported("lighterSignCancelOrder")
    }
    pub fn lighter_sign_cancel_all_orders(&self, _signer: Value, _request: Value) -> Value {
        self.crypto_not_supported("lighterSignCancelAllOrders")
    }
    pub fn lighter_sign_withdraw(&self, _signer: Value, _request: Value) -> Value {
        self.crypto_not_supported("lighterSignWithdraw")
    }
    pub fn lighter_sign_create_sub_account(&self, _signer: Value, _request: Value) -> Value {
        self.crypto_not_supported("lighterSignCreateSubAccount")
    }
    pub fn lighter_sign_modify_order(&self, _signer: Value, _request: Value) -> Value {
        self.crypto_not_supported("lighterSignModifyOrder")
    }
    pub fn lighter_sign_transfer(&self, _signer: Value, _request: Value) -> Value {
        self.crypto_not_supported("lighterSignTransfer")
    }
    pub fn lighter_sign_update_leverage(&self, _signer: Value, _request: Value) -> Value {
        self.crypto_not_supported("lighterSignUpdateLeverage")
    }
    pub fn lighter_sign_update_margin(&self, _signer: Value, _request: Value) -> Value {
        self.crypto_not_supported("lighterSignUpdateMargin")
    }
    pub fn lighter_sign_approve_integrator(&self, _signer: Value, _request: Value) -> Value {
        self.crypto_not_supported("lighterSignApproveIntegrator")
    }
    pub fn lighter_sign_change_pubkey(&self, _signer: Value, _request: Value) -> Value {
        self.crypto_not_supported("lighterSignChangePubkey")
    }
    pub fn lighter_create_auth_token(&self, _signer: Value, _request: Value) -> Value {
        self.crypto_not_supported("lighterCreateAuthToken")
    }

    /// `urlencodeWithArrayRepeat(params)` — `qs.stringify(object, { arrayFormat: 'repeat' })`:
    /// array values repeat the key (`a=1&a=2`); scalars encode normally.
    pub fn urlencode_with_array_repeat(&self, params: Value) -> Value {
        let m = match &params {
            Value::Dict(m) => m,
            _ => return Value::Str(String::new()),
        };
        let mut pairs: Vec<String> = Vec::new();
        for (k, v) in m.iter() {
            let key = crate::exchange::url_pct(k);
            match v {
                Value::Arr(items) => {
                    for item in items.iter() {
                        pairs.push(format!(
                            "{}={}",
                            key,
                            crate::exchange::url_pct(&stringify_param(item))
                        ));
                    }
                }
                other => {
                    pairs.push(format!(
                        "{}={}",
                        key,
                        crate::exchange::url_pct(&stringify_param(other))
                    ));
                }
            }
        }
        Value::Str(pairs.join("&"))
    }

    pub fn safe_integer(&self, obj: Value, key: Value, optional_args: &[Value]) -> Value {
        let v = self.safe_value(obj, key, &[]);
        match v {
            Value::Int(_) => v,
            Value::Float(f) => Value::Int(f as i64),
            // CCXT `safeInteger` is parseInt-style: a decimal string like
            // "3.33" truncates to 3 (arkham leverage tiers), not null. Try
            // an exact i64 first, then fall back to f64 → truncate.
            Value::Str(s) => match s.parse::<i64>() {
                Ok(n) => Value::Int(n),
                Err(_) => match s.parse::<f64>() {
                    Ok(f) if f.is_finite() => Value::Int(f as i64),
                    _ => arg_default(optional_args),
                },
            },
            _ => arg_default(optional_args),
        }
    }

    pub fn safe_integer2(
        &self,
        obj: Value,
        k1: Value,
        k2: Value,
        optional_args: &[Value],
    ) -> Value {
        let v = self.safe_integer(obj.clone(), k1, &[]);
        if !v.is_null() {
            return v;
        }
        let v = self.safe_integer(obj, k2, &[]);
        if !v.is_null() {
            v
        } else {
            arg_default(optional_args)
        }
    }

    pub fn safe_integer_n(&self, obj: Value, keys: Value, optional_args: &[Value]) -> Value {
        if let Value::Arr(ks) = keys {
            for k in ks.iter().cloned() {
                let v = self.safe_integer(obj.clone(), k, &[]);
                if !v.is_null() {
                    return v;
                }
            }
        }
        arg_default(optional_args)
    }

    /// Reads `obj[key]` as a number, multiplies by `factor`, and casts
    /// to i64. Used to convert seconds → milliseconds for timestamps.
    pub fn safe_integer_product(
        &self,
        obj: Value,
        key: Value,
        factor: Value,
        optional_args: &[Value],
    ) -> Value {
        let v = self.safe_value(obj, key, &[]);
        let n = match v {
            Value::Int(n) => Some(n as f64),
            Value::Float(f) => Some(f),
            Value::Str(s) => s.parse::<f64>().ok(),
            _ => None,
        };
        let f = match factor {
            Value::Int(n) => n as f64,
            Value::Float(f) => f,
            _ => return arg_default(optional_args),
        };
        match n {
            Some(x) => Value::Int((x * f) as i64),
            None => arg_default(optional_args),
        }
    }

    pub fn safe_integer_product2(
        &self,
        obj: Value,
        k1: Value,
        k2: Value,
        factor: Value,
        optional_args: &[Value],
    ) -> Value {
        let v = self.safe_integer_product(obj.clone(), k1, factor.clone(), &[]);
        if !v.is_null() {
            return v;
        }
        let v = self.safe_integer_product(obj, k2, factor, &[]);
        if !v.is_null() {
            v
        } else {
            arg_default(optional_args)
        }
    }

    pub fn safe_integer_product_n(
        &self,
        obj: Value,
        keys: Value,
        factor: Value,
        optional_args: &[Value],
    ) -> Value {
        if let Value::Arr(ks) = keys {
            for k in ks.iter().cloned() {
                let v = self.safe_integer_product(obj.clone(), k, factor.clone(), &[]);
                if !v.is_null() {
                    return v;
                }
            }
        }
        arg_default(optional_args)
    }

    pub fn safe_timestamp2(
        &self,
        obj: Value,
        k1: Value,
        k2: Value,
        optional_args: &[Value],
    ) -> Value {
        self.safe_integer_product2(obj, k1, k2, Value::Int(1000), optional_args)
    }

    pub fn safe_timestamp_n(&self, obj: Value, keys: Value, optional_args: &[Value]) -> Value {
        self.safe_integer_product_n(obj, keys, Value::Int(1000), optional_args)
    }

    pub fn safe_float(&self, obj: Value, key: Value, optional_args: &[Value]) -> Value {
        let v = self.safe_value(obj, key, &[]);
        match v {
            Value::Float(_) => v,
            Value::Int(n) => Value::Float(n as f64),
            Value::Str(s) => match s.parse::<f64>() {
                Ok(n) => Value::Float(n),
                Err(_) => arg_default(optional_args),
            },
            _ => arg_default(optional_args),
        }
    }

    /// `safeTimestamp(o, k)` — `parseInt(asFloat(value) * 1000)`. The
    /// value is read as a float (seconds, possibly fractional) and
    /// converted to integer milliseconds.
    pub fn safe_timestamp(&self, obj: Value, key: Value, optional_args: &[Value]) -> Value {
        match self.safe_float(obj, key, &[]) {
            Value::Float(f) => Value::Int((f * 1000.0) as i64),
            Value::Int(n) => Value::Int(n * 1000),
            _ => arg_default(optional_args),
        }
    }

    /// `isEmpty(value)` — true when an array/dict is empty, or the
    /// value is null/undefined. Scalars (strings, numbers, bools) are
    /// never considered empty — mirrors `functions/generic.ts`.
    pub fn is_empty(&self, v: Value) -> Value {
        let empty = match &v {
            Value::Null => true,
            Value::Arr(a) => a.is_empty(),
            Value::Dict(m) => m.is_empty(),
            _ => false,
        };
        Value::Bool(empty)
    }

    pub fn value_is_defined(&self, v: Value) -> Value {
        Value::Bool(!v.is_null())
    }

    // ── extend / deep_extend / omit ─────────────────────────────────────────

    pub fn extend(&self, a: Value, optional_args: &[Value]) -> Value {
        let mut out = match a {
            Value::Dict(m) => Arc::try_unwrap(m).unwrap_or_else(|x| (*x).clone()),
            _ => HashMap::new(),
        };
        let merge = |out: &mut HashMap<String, Value>, src: Value| {
            if let Value::Dict(m) = src {
                let m = Arc::try_unwrap(m).unwrap_or_else(|x| (*x).clone());
                for (k, v) in m {
                    out.insert(k, v);
                }
            }
        };
        for extra in optional_args {
            merge(&mut out, extra.clone());
        }
        Value::Map(out)
    }

    pub fn deep_extend(&self, a: Value, optional_args: &[Value]) -> Value {
        let mut current = a;
        for extra in optional_args {
            current = crate::value::deep_extend(current, extra.clone());
        }
        current
    }

    pub fn omit(&self, obj: Value, keys: Value, _optional_args: &[Value]) -> Value {
        match obj {
            Value::Dict(mut m) => {
                let mm = Arc::make_mut(&mut m);
                match keys {
                    Value::Arr(ks) => {
                        for k in ks.iter() {
                            if let Value::Str(s) = k {
                                mm.shift_remove(s);
                            }
                        }
                    }
                    Value::Str(s) => {
                        mm.shift_remove(&s);
                    }
                    _ => {}
                }
                Value::Dict(m)
            }
            other => other,
        }
    }

    pub fn omit_zero(&self, v: Value) -> Value {
        // Mirrors TS `omitZero`: undefined/'' or any value that parses to
        // numeric 0 → undefined. The old `s == "0"` check missed "0.0",
        // "0.00", "0e0" etc. — e.g. gate echoes `gt_fee:"0.0"`, and
        // keeping it as a non-null fee left `safeTrade` with 3 fee
        // entries (so it couldn't collapse to a single `fee`).
        match &v {
            Value::Int(0) => Value::Null,
            Value::Float(f) if *f == 0.0 => Value::Null,
            Value::Str(s) => {
                if s.is_empty() {
                    return Value::Null;
                }
                match s.parse::<f64>() {
                    Ok(n) if n == 0.0 => Value::Null,
                    _ => v,
                }
            }
            _ => v,
        }
    }

    // ── array / object utilities ────────────────────────────────────────────

    pub fn to_array(&self, v: Value) -> Value {
        match v {
            Value::Arr(_) => v,
            Value::Dict(m) => Value::Array(m.values().cloned().collect()),
            Value::Null => Value::Array(vec![]),
            other => Value::Array(vec![other]),
        }
    }

    pub fn array_concat(&self, a: Value, b: Value) -> Value {
        crate::runtime::concat_arrays(&a, &b)
    }

    pub fn array_slice(&self, v: Value, start: Value, optional_args: &[Value]) -> Value {
        let Value::Arr(a) = v else {
            return Value::Array(vec![]);
        };
        let len = a.len() as i64;
        let s = match start {
            Value::Int(n) => n,
            _ => 0,
        };
        let s = if s < 0 {
            (len + s).max(0) as usize
        } else {
            (s as usize).min(a.len())
        };
        let e = match optional_args.get(0) {
            None | Some(Value::Null) => a.len(),
            Some(Value::Int(n)) => {
                if *n < 0 {
                    ((len) + n).max(0) as usize
                } else {
                    (*n as usize).min(a.len())
                }
            }
            _ => a.len(),
        };
        if s <= e {
            Value::Array(a[s..e].to_vec())
        } else {
            Value::Array(vec![])
        }
    }

    pub fn in_array(&self, needle: Value, haystack: Value) -> Value {
        let hit = if let Value::Arr(a) = haystack {
            a.iter().any(|x| crate::runtime::is_equal(x, &needle))
        } else {
            false
        };
        Value::Bool(hit)
    }

    pub fn unique(&self, v: Value) -> Value {
        if let Value::Arr(a) = v {
            let mut out: Vec<Value> = vec![];
            for item in a.iter().cloned() {
                if !out.iter().any(|x| crate::runtime::is_equal(x, &item)) {
                    out.push(item);
                }
            }
            Value::Array(out)
        } else {
            Value::Array(vec![])
        }
    }

    pub fn index_by(&self, arr: Value, key: Value) -> Value {
        let k = key_str(&key);
        let mut out: HashMap<String, Value> = HashMap::new();
        // TS `indexBy` accepts an array OR an object — for an object it
        // iterates `Object.values`. okx's parseDepositAddress relies on
        // this: `indexBy(currency['networks'], 'id')` where `networks` is
        // a dict keyed by network code. Array-only would return {} and
        // collapse every parsed address to a null network.
        let items: Vec<Value> = match arr {
            Value::Arr(items) => Arc::try_unwrap(items).unwrap_or_else(|a| (*a).clone()),
            Value::Dict(m) => m.values().cloned().collect(),
            _ => return Value::Map(out),
        };
        for item in items {
            if let Some(kv) = crate::value::safe_string(&item, &k, None) {
                out.insert(kv, item);
            }
        }
        Value::Map(out)
    }

    pub fn index_by_safe(&self, arr: Value, key: Value) -> Value {
        self.index_by(arr, key)
    }

    pub fn group_by(&self, arr: Value, key: Value, _optional_args: &[Value]) -> Value {
        let k = key_str(&key);
        let mut out: HashMap<String, Vec<Value>> = HashMap::new();
        if let Value::Arr(items) = arr {
            for item in items.iter().cloned() {
                if let Some(kv) = crate::value::safe_string(&item, &k, None) {
                    out.entry(kv).or_default().push(item);
                }
            }
        }
        Value::Map(out.into_iter().map(|(k, v)| (k, Value::Array(v))).collect())
    }

    pub fn filter_by(
        &self,
        arr: Value,
        key: Value,
        value: Value,
        _optional_args: &[Value],
    ) -> Value {
        let k = key_str(&key);
        if let Value::Arr(items) = arr {
            let items = Arc::try_unwrap(items).unwrap_or_else(|a| (*a).clone());
            let out: Vec<Value> = items
                .into_iter()
                .filter(|it| {
                    let v = crate::get_value(it, &Value::Str(k.clone()));
                    crate::runtime::is_equal(&v, &value)
                })
                .collect();
            Value::Array(out)
        } else {
            Value::Array(vec![])
        }
    }

    /// `sortBy(array, key, descending=false)` — stable sort of an array
    /// of objects by `obj[key]`. Mirrors `functions/generic.ts`.
    pub fn sort_by(&self, arr: Value, key: Value, optional_args: &[Value]) -> Value {
        let mut items = match arr {
            Value::Arr(a) => Arc::try_unwrap(a).unwrap_or_else(|x| (*x).clone()),
            other => return other,
        };
        let descending = matches!(optional_args.get(0), Some(Value::Bool(true)));
        let key = Value::Str(stringify_param(&key));
        items.sort_by(|a, b| {
            let av = crate::get_value(a, &key);
            let bv = crate::get_value(b, &key);
            let ord = value_cmp(&av, &bv);
            if descending {
                ord.reverse()
            } else {
                ord
            }
        });
        Value::Array(items)
    }

    /// `sortBy2(array, key1, key2, descending=false)` — sort by `key1`,
    /// then `key2` as a tiebreaker. Mirrors `functions/generic.ts`.
    pub fn sort_by2(&self, arr: Value, k1: Value, k2: Value, optional_args: &[Value]) -> Value {
        let mut items = match arr {
            Value::Arr(a) => Arc::try_unwrap(a).unwrap_or_else(|x| (*x).clone()),
            other => return other,
        };
        let descending = matches!(optional_args.get(0), Some(Value::Bool(true)));
        let k1 = Value::Str(stringify_param(&k1));
        let k2 = Value::Str(stringify_param(&k2));
        items.sort_by(|a, b| {
            let ord = value_cmp(&crate::get_value(a, &k1), &crate::get_value(b, &k1)).then(
                value_cmp(&crate::get_value(a, &k2), &crate::get_value(b, &k2)),
            );
            if descending {
                ord.reverse()
            } else {
                ord
            }
        });
        Value::Array(items)
    }

    pub fn keysort(&self, obj: Value, _optional_args: &[Value]) -> Value {
        if let Value::Dict(m) = obj {
            let mut keys: Vec<&String> = m.keys().collect();
            keys.sort();
            let mut out = HashMap::new();
            for k in &keys {
                out.insert((*k).clone(), m[*k].clone());
            }
            Value::Map(out)
        } else {
            obj
        }
    }

    /// `aggregate(bidasks)` — groups `[price, volume]` rows by price,
    /// summing volume and dropping zero-volume rows. Preserves the
    /// first-occurrence order of prices. Mirrors `functions/misc.ts`.
    pub fn aggregate(&self, arr: Value) -> Value {
        let items = match arr {
            Value::Arr(a) => Arc::try_unwrap(a).unwrap_or_else(|x| (*x).clone()),
            _ => return Value::Array(vec![]),
        };
        let mut order: Vec<u64> = Vec::new();
        let mut buckets: HashMap<u64, (f64, f64)> = HashMap::new();
        for item in items {
            let row = match item {
                Value::Arr(r) => r,
                _ => continue,
            };
            let price = value_as_f64(row.get(0));
            let volume = value_as_f64(row.get(1));
            if volume > 0.0 {
                let bits = price.to_bits();
                let entry = buckets.entry(bits).or_insert_with(|| {
                    order.push(bits);
                    (price, 0.0)
                });
                entry.1 += volume;
            }
        }
        let out: Vec<Value> = order
            .iter()
            .map(|b| {
                let (p, v) = buckets[b];
                Value::Array(vec![Value::Float(p), Value::Float(v)])
            })
            .collect();
        Value::Array(out)
    }
    pub fn map_to_safe_map(&self, v: Value) -> Value {
        v
    }
    pub fn create_safe_dictionary(&self, _optional_args: &[Value]) -> Value {
        Value::Map(HashMap::new())
    }

    /// `clone(value)` — CCXT's deep clone, distinct from Rust's `Clone` trait.
    /// We disambiguate by name; the transpiler emits `self.clone(x)`.
    pub fn clone_value(&self, v: Value) -> Value {
        v
    }

    /// `sum(...)` — variadic numeric sum. Pure variadic (0 fixed
    /// args) so single-arg `sum(x)` (e.g. from test.sum) also works.
    pub fn sum(&self, optional_args: &[Value]) -> Value {
        let mut acc: Option<Value> = None;
        for x in optional_args {
            acc = Some(match acc {
                None => x.clone(),
                Some(a) => crate::runtime::add(&a, x),
            });
        }
        acc.unwrap_or(Value::Null)
    }

    /// `parse_json(text)` — JSON parse. Mirrors CCXT `parseJson`, which
    /// runs `onJsonResponse` first: when `quoteJsonNumbers` is on
    /// (default), every object number VALUE is wrapped in quotes before
    /// parsing so big integer ids (e.g. bingx's 18-digit `orderId`) and
    /// precise decimals survive as strings instead of lossy f64/i64.
    pub fn parse_json_value(&self, v: Value) -> Value {
        match v {
            Value::Str(s) => {
                let prepared = crate::runtime::quote_json_numbers(&s);
                crate::runtime::json_parse(&Value::Str(prepared))
            }
            // Already a parsed object/array (some fixtures store the
            // response pre-parsed) — pass it through untouched.
            other => other,
        }
    }

    /// `yymmdd()` / `yyyymmdd()` — date formatters.
    // ── methods called by transpiled base tests ─────────────────────────────

    /// Test helper: tests sometimes call `exchange.clone()` to deep-copy
    /// state. We don't implement structural clone (the trait pointer
    /// can't be cloned safely) — return a fresh empty Exchange so the
    /// call compiles and tests can move on.
    /// No-arg `exchange.clone()` form — a structural copy of every
    /// `Value` field. The copy gets a fresh `Internals` (no shared http
    /// client / derived pointers), which is all the transpiled tests need.
    pub fn clone_self(&self) -> Exchange {
        Clone::clone(self)
    }

    /// `clone(v)` — deep-clone a Value. Matches TS `exchange.clone(x)`.
    /// Note: keep this name even though it shadows the (manual) `clone_self`,
    /// because the transpiled tests call `exchange.clone(value)`. Empty-arg
    /// calls `exchange.clone()` get post-processed to `clone_self()`.
    pub fn clone(&self, v: Value) -> Value {
        v
    }

    /// Dynamic-property lookup for transpiled base tests. The TS code
    /// does `exchange['options']`, `exchange['markets']`, etc. — this
    /// reads from the unified `to_value()` view so both access paths
    /// (`exchange.prop(k)` and `testSharedMethods.exchangeProp`) agree.
    pub fn prop(&self, key: &Value) -> Value {
        crate::get_value(&self.to_value(), key)
    }

    /// Full `Value::Map` snapshot of every transpiler-visible field —
    /// the Rust analogue of indexing a JS object by property name.
    /// Used by `prop()` and by the base-test `exchangeProp` shim.
    pub fn to_value(&self) -> Value {
        let mut m = indexmap::IndexMap::new();
        let mut put = |k: &str, v: &Value| {
            m.insert(k.to_string(), v.clone());
        };
        put("id", &self.id);
        put("name", &self.name);
        put("countries", &self.countries);
        put("version", &self.version);
        put("alias", &self.alias);
        put("certified", &self.certified);
        put("pro", &self.pro);
        put("hostname", &self.hostname);
        put("apiKey", &self.apiKey);
        put("secret", &self.secret);
        put("password", &self.password);
        put("uid", &self.uid);
        put("walletAddress", &self.walletAddress);
        put("privateKey", &self.privateKey);
        put("twofa", &self.twofa);
        put("token", &self.token);
        put("login", &self.login);
        put("accountId", &self.accountId);
        put("requiredCredentials", &self.requiredCredentials);
        put("timeout", &self.timeout);
        put("rateLimit", &self.rateLimit);
        put("enableRateLimit", &self.enableRateLimit);
        put("fetchHistoryCacheSize", &self.fetchHistoryCacheSize);
        put("rateLimiterAlgorithm", &self.rateLimiterAlgorithm);
        put("rollingWindowSize", &self.rollingWindowSize);
        put("tokenBucket", &self.tokenBucket);
        put("verbose", &self.verbose);
        put("isSandboxModeEnabled", &self.isSandboxModeEnabled);
        put("proxy", &self.proxy);
        put("proxyUrl", &self.proxyUrl);
        put("proxy_url", &self.proxy_url);
        put("proxyUrlCallback", &self.proxyUrlCallback);
        put("proxy_url_callback", &self.proxy_url_callback);
        put("httpProxy", &self.httpProxy);
        put("http_proxy", &self.http_proxy);
        put("httpProxyCallback", &self.httpProxyCallback);
        put("http_proxy_callback", &self.http_proxy_callback);
        put("httpsProxy", &self.httpsProxy);
        put("https_proxy", &self.https_proxy);
        put("httpsProxyCallback", &self.httpsProxyCallback);
        put("https_proxy_callback", &self.https_proxy_callback);
        put("socksProxy", &self.socksProxy);
        put("socks_proxy", &self.socks_proxy);
        put("socksProxyCallback", &self.socksProxyCallback);
        put("socks_proxy_callback", &self.socks_proxy_callback);
        put("wsProxy", &self.wsProxy);
        put("ws_proxy", &self.ws_proxy);
        put("wssProxy", &self.wssProxy);
        put("wss_proxy", &self.wss_proxy);
        put("wsSocksProxy", &self.wsSocksProxy);
        put("ws_socks_proxy", &self.ws_socks_proxy);
        put("markets", &self.markets);
        put("markets_by_id", &self.markets_by_id);
        put("currencies", &self.currencies);
        put("currencies_by_id", &self.currencies_by_id);
        put("commonCurrencies", &self.commonCurrencies);
        put("baseCurrencies", &self.baseCurrencies);
        put("quoteCurrencies", &self.quoteCurrencies);
        put("symbols", &self.symbols);
        put("ids", &self.ids);
        put("codes", &self.codes);
        put("timeframes", &self.timeframes);
        put("precision", &self.precision);
        put("limits", &self.limits);
        put("fees", &self.fees);
        put("features", &self.features);
        put("has", &self.has);
        put("exceptions", &self.exceptions);
        put("urls", &self.urls);
        put("api", &self.api);
        put("options", &self.options);
        put("headers", &self.headers);
        put("accounts", &self.accounts);
        put("accountsById", &self.accountsById);
        put("orderbooks", &self.orderbooks);
        put("orders", &self.orders);
        put("trades", &self.trades);
        put("myTrades", &self.myTrades);
        put("positions", &self.positions);
        put("tickers", &self.tickers);
        put("bidsasks", &self.bidsasks);
        put("ohlcvs", &self.ohlcvs);
        put("clients", &self.clients);
        put("balance", &self.balance);
        put("liquidations", &self.liquidations);
        put("myLiquidations", &self.myLiquidations);
        put("transactions", &self.transactions);
        put("reloadingMarkets", &self.reloadingMarkets);
        put("marketsLoading", &self.marketsLoading);
        put("last_request_url", &self.last_request_url);
        put("last_request_headers", &self.last_request_headers);
        put("last_request_body", &self.last_request_body);
        put("last_http_response", &self.last_http_response);
        put("last_response_headers", &self.last_response_headers);
        put("last_json_response", &self.last_json_response);
        put("lastRestRequestTimestamp", &self.lastRestRequestTimestamp);
        put("paddingMode", &self.paddingMode);
        put("precisionMode", &self.precisionMode);
        put(
            "substituteCommonCurrencyCodes",
            &self.substituteCommonCurrencyCodes,
        );
        put("reduceFees", &self.reduceFees);
        put("minFundingAddressLength", &self.minFundingAddressLength);
        put("MAX_VALUE", &self.MAX_VALUE);
        put("returnResponseHeaders", &self.returnResponseHeaders);
        put("httpExceptions", &self.httpExceptions);
        put("status", &self.status);
        put("userAgent", &self.userAgent);
        put("user_agent", &self.user_agent);
        put("userAgents", &self.userAgents);
        Value::Map(m)
    }

    pub fn base16ToBinary(&self, hex: Value, optional_args: &[Value]) -> Value {
        self.base16_to_binary(hex, optional_args)
    }
    pub fn base58_to_binary(&self, s: Value, _optional_args: &[Value]) -> Value {
        match &s {
            Value::Str(s) => match base58_decode(s) {
                Some(b) => bytes_to_value(&b),
                None => Value::Null,
            },
            _ => Value::Null,
        }
    }
    pub fn binary_to_base58(&self, b: Value, _optional_args: &[Value]) -> Value {
        Value::Str(base58_encode(&crate::exchange::value_to_bytes(&b)))
    }
    pub fn binary_length(&self, b: Value, _optional_args: &[Value]) -> Value {
        match b {
            Value::Arr(a) => Value::Int(a.len() as i64),
            _ => Value::Int(0),
        }
    }
    /// `isBinaryMessage` — in this port a binary buffer is a
    /// `Value::Array` of byte-valued ints (see `base16_to_binary`,
    /// `string_to_binary`). `instanceof Uint8Array` can't transpile.
    pub fn is_binary_message(&self, v: Value, _optional_args: &[Value]) -> Value {
        Value::Bool(is_byte_array(&v))
    }
    /// `numberToBE(n, padding)` — big-endian byte array of width `padding`.
    pub fn number_to_be(&self, n: Value, optional_args: &[Value]) -> Value {
        let num: u64 = match &n {
            Value::Int(i) => (*i).max(0) as u64,
            Value::Float(f) => (*f).max(0.0) as u64,
            Value::Str(s) => s.parse().unwrap_or(0),
            _ => 0,
        };
        let padding: usize = match optional_args.get(0) {
            Some(Value::Int(i)) => (*i).max(0) as usize,
            Some(Value::Float(f)) => (*f).max(0.0) as usize,
            _ => 8,
        };
        let be = num.to_be_bytes(); // 8 bytes
        let mut out: Vec<u8> = Vec::with_capacity(padding);
        if padding >= be.len() {
            out.extend(std::iter::repeat(0u8).take(padding - be.len()));
            out.extend_from_slice(&be);
        } else {
            out.extend_from_slice(&be[be.len() - padding..]);
        }
        bytes_to_value(&out)
    }
    /// `parseDate(x)` — ports `functions/time.ts`. Parses an ISO-8601
    /// timestamp (with `T`/`Z` or a plain `YYYY-MM-DD HH:MM:SS` form,
    /// treated as UTC) into epoch milliseconds. Invalid → Null.
    pub fn parse_date(&self, s: Value, _optional_args: &[Value]) -> Value {
        let text = match &s {
            Value::Str(s) if !s.is_empty() => s.clone(),
            _ => return Value::Null,
        };
        // rfc3339 (handles the `T...Z` and offset forms)
        if let Ok(t) = chrono::DateTime::parse_from_rfc3339(&text) {
            return Value::Int(t.timestamp_millis());
        }
        // naive `YYYY-MM-DD HH:MM:SS[.fff]` — interpreted as UTC
        for fmt in [
            "%Y-%m-%d %H:%M:%S%.f",
            "%Y-%m-%d %H:%M:%S",
            "%Y-%m-%dT%H:%M:%S%.f",
            "%Y-%m-%dT%H:%M:%S",
        ] {
            if let Ok(ndt) = chrono::NaiveDateTime::parse_from_str(&text, fmt) {
                return Value::Int(ndt.and_utc().timestamp_millis());
            }
        }
        Value::Null
    }
    pub fn is_binary_message_var(&self, v: Value, _optional_args: &[Value]) -> Value {
        Value::Bool(is_byte_array(&v))
    }
    /// `ymd(timestamp, infix='')` — like `yyyymmdd` but the infix
    /// defaults to empty (TS `functions/time.ts`).
    pub fn ymd(&self, ts: Value, optional_args: &[Value]) -> Value {
        if optional_args.is_empty() {
            self.yyyymmdd(ts, &[Value::Str(String::new())])
        } else {
            self.yyyymmdd(ts, optional_args)
        }
    }
    pub fn safe_float_n(&self, obj: Value, keys: Value, optional_args: &[Value]) -> Value {
        if let Value::Arr(ks) = keys {
            for k in ks.iter().cloned() {
                let v = self.safe_float(obj.clone(), k, &[]);
                if !v.is_null() {
                    return v;
                }
            }
        }
        arg_default(optional_args)
    }
    pub fn safe_float2(&self, obj: Value, k1: Value, k2: Value, optional_args: &[Value]) -> Value {
        let v = self.safe_float(obj.clone(), k1, &[]);
        if !v.is_null() {
            return v;
        }
        let v = self.safe_float(obj, k2, &[]);
        if !v.is_null() {
            v
        } else {
            arg_default(optional_args)
        }
    }
    // The transpiler may emit camelCase callers (`safeString2`) directly
    // because the rust-port preserved the TS name. Alias to the
    // snake-cased one we already have.
    pub fn safeString2(&self, obj: Value, k1: Value, k2: Value, optional_args: &[Value]) -> Value {
        self.safe_string2(obj, k1, k2, optional_args)
    }
    /// `binaryConcat(a, b, ...)` — concatenates byte buffers. The
    /// variadic call-site wrap folds the tail args into `optional_args`.
    pub fn binary_concat(&self, first: Value, optional_args: &[Value]) -> Value {
        let mut out = crate::exchange::value_to_bytes(&first);
        for v in optional_args {
            out.extend(crate::exchange::value_to_bytes(v));
        }
        bytes_to_value(&out)
    }
    pub fn stringToBase64(&self, s: Value, optional_args: &[Value]) -> Value {
        self.string_to_base64(s, optional_args)
    }
    /// `binaryToString(buffer)` — decodes a byte buffer as UTF-8.
    pub fn binary_to_string(&self, b: Value, _optional_args: &[Value]) -> Value {
        let bytes = crate::exchange::value_to_bytes(&b);
        Value::Str(String::from_utf8_lossy(&bytes).into_owned())
    }
    pub fn string_to_binary(&self, s: Value, _optional_args: &[Value]) -> Value {
        match s {
            Value::Str(s) => Value::Array(s.bytes().map(|b| Value::Int(b as i64)).collect()),
            _ => Value::Array(vec![]),
        }
    }
    /// `urlencodeBase64(payload)` — url-safe base64 with `+/` → `-_`
    /// and trailing `=` padding stripped. Accepts a string or a byte
    /// buffer (`Value::Array`).
    pub fn urlencode_base64(&self, v: Value, _optional_args: &[Value]) -> Value {
        let bytes = match &v {
            Value::Str(s) => s.as_bytes().to_vec(),
            _ => crate::exchange::value_to_bytes(&v),
        };
        let encoded = match self.binary_to_base64(bytes_to_value(&bytes), &[]) {
            Value::Str(s) => s,
            _ => String::new(),
        };
        let trimmed = encoded.trim_end_matches('=');
        Value::Str(trimmed.replace('+', "-").replace('/', "_"))
    }
    /// `urlencodeNested(object)` — `qs.stringify(object, { encodeValuesOnly: true })`:
    /// nested maps → `parent[child]`, arrays → `parent[index]`, only
    /// values are percent-encoded.
    pub fn urlencode_nested(&self, v: Value, _optional_args: &[Value]) -> Value {
        let m = match &v {
            Value::Dict(m) => m,
            _ => return Value::Str(String::new()),
        };
        let mut pairs: Vec<String> = Vec::new();
        for (k, val) in m.iter() {
            urlencode_nested_walk(k, val, &mut pairs);
        }
        Value::Str(pairs.join("&"))
    }
    pub fn is_json_encoded_object(&self, optional_args: &[Value]) -> Value {
        match optional_args.get(0) {
            Some(Value::Str(s)) => Value::Bool(s.starts_with('{') || s.starts_with('[')),
            _ => Value::Bool(false),
        }
    }
    pub fn strip(&self, s: Value, _optional_args: &[Value]) -> Value {
        match s {
            Value::Str(s) => Value::Str(s.trim().to_string()),
            other => other,
        }
    }
    pub fn sort(&self, v: Value, _optional_args: &[Value]) -> Value {
        if let Value::Arr(a) = v {
            let mut a = Arc::try_unwrap(a).unwrap_or_else(|x| (*x).clone());
            a.sort_by(|x, y| {
                let xs = crate::runtime::stringify_param(x);
                let ys = crate::runtime::stringify_param(y);
                xs.cmp(&ys)
            });
            Value::Array(a)
        } else {
            v
        }
    }
    /// `roundTimeframe(timeframe, timestamp, direction)` — snap a
    /// timestamp to the timeframe boundary (down by default, up for
    /// `ROUND_UP`).
    pub fn round_timeframe(&self, tf: Value, ts: Value, direction: Value) -> Value {
        let secs = match self.parse_timeframe(tf) {
            Value::Int(s) => s,
            Value::Float(s) => s as i64,
            _ => return ts,
        };
        let ms = secs * 1000;
        let t = match &ts {
            Value::Int(i) => *i,
            Value::Float(f) => *f as i64,
            _ => return ts,
        };
        if ms == 0 {
            return ts;
        }
        let offset = t % ms;
        let is_up = matches!(&direction, Value::Int(d) if *d == crate::runtime::ROUND_UP);
        Value::Int(t - offset + if is_up { ms } else { 0 })
    }
    pub async fn sleep(&self, ms: Value) -> Value {
        if let Some(n) = match ms {
            Value::Int(n) => Some(n),
            Value::Float(f) => Some(f as i64),
            _ => None,
        } {
            if n > 0 {
                tokio::time::sleep(std::time::Duration::from_millis(n as u64)).await;
            }
        }
        Value::Null
    }
    /// `ethGetAddressFromPrivateKey(pk)` — derive the Ethereum address
    /// (keccak256 of the uncompressed secp256k1 public key, last 20 bytes).
    pub fn eth_get_address_from_private_key(&self, pk: Value, _optional_args: &[Value]) -> Value {
        use k256::ecdsa::SigningKey;
        use k256::elliptic_curve::sec1::ToEncodedPoint;
        let pk_s = match &pk {
            Value::Str(s) => s.trim_start_matches("0x").to_string(),
            _ => return Value::Str(String::new()),
        };
        let pk_bytes = match hex::decode(&pk_s) {
            Ok(b) => b,
            Err(_) => return Value::Str(String::new()),
        };
        let sk = match SigningKey::from_slice(&pk_bytes) {
            Ok(k) => k,
            Err(_) => return Value::Str(String::new()),
        };
        let point = sk.verifying_key().to_encoded_point(false); // 0x04 || X || Y
        let pubkey = &point.as_bytes()[1..]; // 64 bytes
        let hash = crate::exchange::hash_raw(pubkey, "keccak");
        Value::Str(format!("0x{}", hex::encode(&hash[12..32])))
    }
    pub fn exists_file(&self, p: Value) -> Value {
        match &p {
            Value::Str(path) => Value::Bool(std::path::Path::new(path).is_file()),
            _ => Value::Bool(false),
        }
    }
    pub fn read_file(&self, p: Value) -> Value {
        match &p {
            Value::Str(path) => match std::fs::read_to_string(path) {
                Ok(s) => Value::Str(s),
                Err(_) => Value::Null,
            },
            _ => Value::Null,
        }
    }
    pub fn write_file(&self, p: Value, content: Value) -> Value {
        let path = match &p {
            Value::Str(s) => s.clone(),
            _ => return Value::Bool(false),
        };
        let body = match &content {
            Value::Str(s) => s.clone(),
            other => stringify_param(other),
        };
        Value::Bool(std::fs::write(&path, body).is_ok())
    }
    pub fn get_temp_dir(&self) -> Value {
        Value::Str(format!(
            "{}/",
            std::env::temp_dir().to_string_lossy().trim_end_matches('/')
        ))
    }
    pub fn get_property(&self, obj: Value, key: Value) -> Value {
        crate::get_value(&obj, &Value::Str(stringify_param(&key)))
    }

    pub fn yymmdd(&self, ts: Value, optional_args: &[Value]) -> Value {
        let infix = match optional_args.get(0) {
            Some(Value::Str(s)) => s.clone(),
            _ => String::new(),
        };
        let n = match ts {
            Value::Int(n) => n,
            _ => 0,
        };
        let dt = chrono::DateTime::<chrono::Utc>::from_timestamp_millis(n);
        match dt {
            Some(t) => Value::Str(t.format(&format!("%y{i}%m{i}%d", i = infix)).to_string()),
            None => Value::Null,
        }
    }
    pub fn yyyymmdd(&self, ts: Value, optional_args: &[Value]) -> Value {
        // TS default infix for yyyymmdd is '-'.
        let infix = match optional_args.get(0) {
            Some(Value::Str(s)) => s.clone(),
            _ => "-".to_string(),
        };
        let n = match ts {
            Value::Int(n) => n,
            _ => 0,
        };
        let dt = chrono::DateTime::<chrono::Utc>::from_timestamp_millis(n);
        match dt {
            Some(t) => Value::Str(t.format(&format!("%Y{i}%m{i}%d", i = infix)).to_string()),
            None => Value::Null,
        }
    }
    /// `ymdhms(timestamp, infix=' ')` — UTC `YYYY-MM-DD<infix>HH:MM:SS`.
    pub fn ymdhms(&self, ts: Value, optional_args: &[Value]) -> Value {
        let infix = match optional_args.get(0) {
            Some(Value::Str(s)) => s.clone(),
            _ => " ".to_string(),
        };
        let n = match ts {
            Value::Int(n) => n,
            Value::Float(f) => f as i64,
            _ => 0,
        };
        let dt = chrono::DateTime::<chrono::Utc>::from_timestamp_millis(n);
        match dt {
            Some(t) => Value::Str(t.format(&format!("%Y-%m-%d{infix}%H:%M:%S")).to_string()),
            None => Value::Null,
        }
    }

    /// `rawencode(params, [doSeq])` — URL-encode without sorting.
    /// `rawencode(object)` — `qs.stringify(object, { encode: false })`:
    /// flat `key=value` pairs with no percent-encoding.
    pub fn rawencode(&self, params: Value, _optional_args: &[Value]) -> Value {
        let m = match &params {
            Value::Dict(m) => m,
            _ => return Value::Str(String::new()),
        };
        let pairs: Vec<String> = m
            .iter()
            .map(|(k, v)| format!("{}={}", k, stringify_param(v)))
            .collect();
        Value::Str(pairs.join("&"))
    }

    /// `intToBase16(n)` — int → lowercase hex string.
    pub fn int_to_base16(&self, n: Value, _optional_args: &[Value]) -> Value {
        let v = match n {
            Value::Int(n) => n as u64,
            Value::Float(f) => f as u64,
            Value::Str(s) => s.parse::<u64>().unwrap_or(0),
            _ => 0,
        };
        Value::Str(format!("{:x}", v))
    }

    /// `packb(action)` — MessagePack pack stub. Hyperliquid signs the
    /// packed bytes of an action. Returning empty bytes here is enough
    /// to make the call compile; live signing won't be correct.
    /// `packb(value)` — MessagePack-encode a Value into a byte array.
    pub fn packb(&self, action: Value, _optional_args: &[Value]) -> Value {
        fn to_rmpv(v: &Value) -> rmpv::Value {
            match v {
                Value::Null => rmpv::Value::Nil,
                Value::Bool(b) => rmpv::Value::Boolean(*b),
                Value::Int(i) => rmpv::Value::Integer((*i).into()),
                Value::Float(f) => rmpv::Value::F64(*f),
                Value::Str(s) => rmpv::Value::String(s.clone().into()),
                Value::Arr(a) => rmpv::Value::Array(a.iter().map(to_rmpv).collect()),
                Value::Dict(m) => rmpv::Value::Map(
                    m.iter()
                        .map(|(k, v)| (rmpv::Value::String(k.clone().into()), to_rmpv(v)))
                        .collect(),
                ),
            }
        }
        let mut buf: Vec<u8> = Vec::new();
        match rmpv::encode::write_value(&mut buf, &to_rmpv(&action)) {
            Ok(_) => Value::Array(buf.iter().map(|b| Value::Int(*b as i64)).collect()),
            Err(_) => Value::Null,
        }
    }

    /// `ethEncodeStructuredData(domain, types, message)` — EIP-712
    /// encoding: returns the `\x19\x01 || domainSeparator || structHash`
    /// preimage that the caller keccak-hashes before signing.
    pub fn eth_encode_structured_data(&self, domain: Value, types: Value, message: Value) -> Value {
        let bytes = crate::exchange::eip712_encode(&domain, &types, &message);
        Value::Array(bytes.iter().map(|b| Value::Int(*b as i64)).collect())
    }

    /// `uuid22()` — pseudo-random 22-char hex id.
    pub fn uuid22(&self, _optional_args: &[Value]) -> Value {
        Value::Str(random_hex(22))
    }
    /// `uuid16()` — pseudo-random 16-char hex id.
    pub fn uuid16(&self, _optional_args: &[Value]) -> Value {
        Value::Str(random_hex(16))
    }
    /// `uuid()` — pseudo-random UUID v4: `xxxxxxxx-xxxx-4xxx-[89ab]xxx-xxxxxxxxxxxx`.
    pub fn uuid(&self, _optional_args: &[Value]) -> Value {
        let h = random_hex(32);
        let variant = ['8', '9', 'a', 'b'][(random_u64() % 4) as usize];
        let s = format!(
            "{}-{}-4{}-{}{}-{}",
            &h[0..8],
            &h[8..12],
            &h[13..16],
            variant,
            &h[17..20],
            &h[20..32],
        );
        Value::Str(s)
    }

    /// `urlencode(params)` — wraps the typed `urlencode_kv` for Value args.
    pub fn urlencode(&self, params: Value, _optional_args: &[Value]) -> Value {
        Value::Str(self.urlencode_kv(&params))
    }

    /// `json(value)` — JSON-stringify.
    pub fn json(&self, v: Value) -> Value {
        Value::Str(self.json_str(&v))
    }

    /// `encode(s)` — UTF-8 encode string to bytes (as Value::Array of ints).
    pub fn encode(&self, s: Value) -> Value {
        match s {
            Value::Str(s) => Value::Array(s.bytes().map(|b| Value::Int(b as i64)).collect()),
            _ => Value::Array(vec![]),
        }
    }

    /// `decode(bytes)` — decode bytes to a UTF-8 string.
    pub fn decode(&self, b: Value) -> Value {
        match b {
            Value::Str(s) => Value::Str(s),
            Value::Arr(a) => {
                let bytes: Vec<u8> = a
                    .iter()
                    .filter_map(|v| match v {
                        Value::Int(n) => Some(*n as u8),
                        _ => None,
                    })
                    .collect();
                Value::Str(String::from_utf8_lossy(&bytes).to_string())
            }
            _ => Value::Str(String::new()),
        }
    }

    /// `log(msg)` — debug print.
    pub fn log(&self, msg: Value) {
        if matches!(self.verbose, Value::Bool(true)) {
            println!("[ccxt] {}", crate::runtime::stringify_param(&msg));
        }
    }

    /// `call_method(name, args)` — dynamic dispatch fallback. Real Rust
    /// can't look methods up by name, but for the *implicit API* (methods
    /// like `public_get_exchange_info` that come from the `api` block in
    /// describe()), we build a runtime dispatch table and route through
    /// `Exchange::implicit_api_call` → `request_typed` → `fetch_typed`.
    ///
    /// Note: this takes `&self` so call sites that also pass `self.X(...)`
    /// as args don't hit borrow conflicts. The actual HTTP fetch needs
    /// `&mut self`, so we use UnsafeCell-style interior mutability via
    /// `parking_lot::Mutex` on the http client — but for simplicity we use
    /// `unsafe { &mut *(self as *const _ as *mut _) }` here. (TODO: wrap
    /// the HTTP path in a RefCell or use `&mut self` end-to-end.)
    pub async fn call_method(&self, name: Value, args: &[Value]) -> Value {
        let n = match name {
            Value::Str(s) => s,
            _ => return Value::Null,
        };
        let params = args.get(0).cloned().unwrap_or(Value::Map(HashMap::new()));
        // The transpiled call sites pass `self` through multiple
        // immutable borrows (e.g. `self.call_method(..., &[self.extend(...)])`),
        // so we can't take `&mut self` here. Use raw-pointer mutability —
        // wrapped in a helper to silence the strict lint.
        let exchange_mut = unsafe { coerce_to_mut_unsafe(self) };
        match exchange_mut.implicit_api_call(&n, params).await {
            Ok(v) => v,
            Err(e) => {
                // Propagate the failure — a swallowed HTTP error (e.g. an
                // authentication failure on a private endpoint) would
                // otherwise surface as an empty/Null result. `throw` in
                // the transpiled code is a `panic!`, so we do the same.
                if matches!(exchange_mut.verbose, Value::Bool(true)) {
                    eprintln!("[ccxt] {n} failed: {e}");
                }
                panic!("{e}");
            }
        }
    }

    // ── string / number formatting ──────────────────────────────────────────

    pub fn number_to_string(&self, n: Value) -> Value {
        // TS `numberToString(undefined)` returns undefined — don't
        // stringify a missing value into the literal "null".
        if matches!(n, Value::Null) {
            return Value::Null;
        }
        Value::Str(stringify_param(&n))
    }

    pub fn parse_number(&self, v: Value, optional_args: &[Value]) -> Value {
        match v {
            Value::Float(_) | Value::Int(_) => v,
            Value::Str(ref s) => match s.parse::<f64>() {
                Ok(n) => Value::Float(n),
                Err(_) => arg_default(optional_args),
            },
            _ => arg_default(optional_args),
        }
    }

    pub fn parse_timeframe(&self, tf: Value) -> Value {
        let s = stringify_param(&tf);
        let last = s.chars().last().unwrap_or('m');
        let num: i64 = s[..s.len().saturating_sub(1)].parse().unwrap_or(0);
        Value::Int(match last {
            's' => num,
            'm' => num * 60,
            'h' => num * 3600,
            'd' => num * 86400,
            'w' => num * 604800,
            'M' => num * 2592000,
            'y' => num * 31536000,
            _ => 0,
        })
    }

    /// `precisionFromString(str)` — ports `functions/number.ts`.
    /// Scientific notation (`1e-4` → 4, `1e4` → -4); otherwise the
    /// number of fractional digits after stripping trailing zeros.
    pub fn precision_from_string(&self, s: Value) -> Value {
        let s = stringify_param(&s);
        if let Some(idx) = s.find(['e', 'E']) {
            let exp: i64 = s[idx + 1..].parse().unwrap_or(0);
            return Value::Int(-exp);
        }
        let trimmed = s.trim_end_matches('0');
        match trimmed.split_once('.') {
            Some((_, frac)) => Value::Int(frac.len() as i64),
            None => Value::Int(0),
        }
    }

    /// `decimalToPrecision(n, roundingMode, numPrecisionDigits, [countingMode], [paddingMode])`
    /// — faithful port of `_decimalToPrecision` from `functions/number.ts`.
    pub fn decimal_to_precision(
        &self,
        n: Value,
        rounding: Value,
        precision: Value,
        optional_args: &[Value],
    ) -> Value {
        let n_s = stringify_param(&n);
        let prec_f: f64 = match &precision {
            Value::Int(i) => *i as f64,
            Value::Float(f) => *f,
            Value::Str(s) => s.parse().unwrap_or(f64::NAN),
            _ => return Value::Str(n_s),
        };
        let counting: i64 = match optional_args.get(0) {
            Some(Value::Int(c)) => *c,
            _ => crate::runtime::DECIMAL_PLACES,
        };
        let padding: i64 = match optional_args.get(1) {
            Some(Value::Int(p)) => *p,
            _ => crate::runtime::NO_PADDING,
        };
        let rounding_mode: i64 = match &rounding {
            Value::Int(r) => *r,
            _ => crate::runtime::TRUNCATE,
        };
        Value::Str(decimal_to_precision_impl(
            &n_s,
            rounding_mode,
            prec_f,
            counting,
            padding,
        ))
    }

    pub fn capitalize(&self, s: Value) -> Value {
        let s = stringify_param(&s);
        let mut c = s.chars();
        Value::Str(match c.next() {
            None => String::new(),
            Some(f) => f.to_uppercase().chain(c).collect(),
        })
    }

    pub fn encode_uri_component(&self, s: Value) -> Value {
        let s = stringify_param(&s);
        Value::Str(
            s.bytes()
                .map(|b| match b {
                    b'A'..=b'Z' | b'a'..=b'z' | b'0'..=b'9' | b'-' | b'_' | b'.' | b'~' => {
                        (b as char).to_string()
                    }
                    _ => format!("%{b:02X}"),
                })
                .collect(),
        )
    }

    pub fn string_to_chars_array(&self, s: Value) -> Value {
        let s = stringify_param(&s);
        Value::Array(s.chars().map(|c| Value::Str(c.to_string())).collect())
    }

    pub fn string_to_base64(&self, s: Value, _optional_args: &[Value]) -> Value {
        self.binary_to_base64(s, &[])
    }

    /// `extract_params(path)` — pulls `{name}` placeholders from a URL
    /// template. Returns a Value::Array of names.
    pub fn extract_params(&self, path: Value) -> Value {
        let p = stringify_param(&path);
        let mut out: Vec<Value> = vec![];
        let mut chars = p.chars().peekable();
        while let Some(c) = chars.next() {
            if c == '{' {
                let mut name = String::new();
                while let Some(&nc) = chars.peek() {
                    if nc == '}' {
                        chars.next();
                        break;
                    }
                    name.push(nc);
                    chars.next();
                }
                if !name.is_empty() {
                    out.push(Value::Str(name));
                }
            }
        }
        Value::Array(out)
    }

    // ── async lifecycle stubs ───────────────────────────────────────────────

    /// Minimal port of TS `loadMarketsHelper`:
    ///   1. Return the cached `markets` if already populated and not
    ///      forcing a reload.
    ///   2. Otherwise dispatch `fetch_markets` to the derived exchange
    ///      (binance/okx/... — each implements the actual API call).
    ///   3. Feed the resulting list into `set_markets` so `markets`,
    ///      `markets_by_id`, `symbols`, `ids`, and synthesized
    ///      `currencies` are all populated. Live tests then read these
    ///      off the snapshot via `live_dispatch::read_state`.
    /// Minimal port of TS `loadMarketsHelper`:
    ///   1. Return the cached `markets` if already populated and not
    ///      forcing a reload.
    ///   2. If `has.fetchCurrencies === true`, dispatch `fetch_currencies`
    ///      first — passing the result into `set_markets` avoids the
    ///      O(N²) "synthesize from markets" branch (cloning the
    ///      grouped-by-code Map inside an outer loop).
    ///   3. Dispatch `fetch_markets` to the derived exchange.
    ///   4. `set_markets(markets, currencies)` populates `markets`,
    ///      `markets_by_id`, `symbols`, `ids`, and merges currencies.
    /// Minimal port of TS `loadMarketsHelper`. Returns cached markets
    /// on hit; otherwise fetches markets (and currencies when supported)
    /// and pushes everything through `set_markets`. Built-in synthesize
    /// branch of `set_markets` is O(N) per code with full Map clones —
    /// for binance (~4k markets, ~1k unique codes) that grew to minutes
    /// and looked like a hang. `load_markets_fast_synthesize_currencies`
    /// below short-circuits when currencies are empty by synthesizing
    /// them here in idiomatic Rust (HashMap-direct, no Value cloning of
    /// the whole grouped map per code).
    pub async fn load_markets(&mut self, optional_args: &[Value]) -> Value {
        let reload = optional_args.get(0).cloned().unwrap_or(Value::Bool(false));
        let reload_b = matches!(reload, Value::Bool(true));
        if !reload_b && !self.markets.is_null() {
            return self.markets.clone();
        }
        let has_fetch_currencies = matches!(
            crate::get_value(&self.has, &Value::Str("fetchCurrencies".to_string())),
            Value::Bool(true),
        );
        let mut currencies = Value::Null;
        if has_fetch_currencies {
            if let Some(v) = self
                .dispatch_to_derived("fetch_currencies", Vec::new())
                .await
            {
                currencies = v;
            }
        }
        let fetched = match self.dispatch_to_derived("fetch_markets", Vec::new()).await {
            Some(v) => v,
            None => return Value::Null,
        };
        if matches!(fetched, Value::Null) {
            return self.markets.clone();
        }
        // Pick the best currencies source:
        // 1. Network-fetched (from `fetch_currencies` above).
        // 2. Pre-loaded on the exchange (static-fixture path injects
        //    `currencies` via `apply_config` — those carry the real
        //    `id` mappings like bitmex BTC → "XBt").
        // 3. Synthesized from markets (fallback so `set_markets` still
        //    takes the fast IF branch and skips its O(N²) else branch).
        let preloaded_non_empty = matches!(&self.currencies, Value::Dict(m) if !m.is_empty());
        let currencies_arg = if matches!(&currencies, Value::Dict(m) if !m.is_empty()) {
            currencies
        } else if preloaded_non_empty {
            self.currencies.clone()
        } else {
            synthesize_currencies_from_markets(&fetched, &self.precisionMode)
        };
        // `PredictionExchange` overrides `setMarkets` to alias the outcome
        // `market` handle onto `symbol` (the prediction rows carry no `symbol`,
        // so the base indexer would build zero symbols) and to populate the
        // outcome lookup. This base method runs as the shared `Exchange`, so a
        // direct `self.set_markets(...)` calls the base version and bypasses that
        // override (Rust has no virtual dispatch off the deref chain). For a
        // prediction exchange, route through the derived dispatcher instead so
        // the venue → PredictionExchange::set_markets override runs (mirrors Go's
        // SetOutcomesFromMarkets hook). Regular exchanges keep the direct call.
        let is_prediction = matches!(
            crate::get_value(&self.has, &Value::Str("prediction".to_string())),
            Value::Bool(true),
        );
        if is_prediction {
            let _ = self
                .dispatch_to_derived("set_markets", vec![fetched, currencies_arg])
                .await;
        } else {
            self.set_markets(fetched, &[currencies_arg]);
        }
        self.markets.clone()
    }

    // Proxy callback "methods" — the post-processor rewrites
    // `self.proxy_url_callback(args)` → `self.proxy_url_callback_fn(args)`
    // so the field `proxy_url_callback: Value` can coexist with this
    // method-form for the call sites.
    pub fn proxy_fn(&self, _url: Value, _method: Value, _headers: Value, _body: Value) -> Value {
        self.proxy.clone()
    }
    pub fn proxy_url_callback_fn(
        &self,
        _url: Value,
        _method: Value,
        _headers: Value,
        _body: Value,
    ) -> Value {
        self.proxy_url_callback.clone()
    }
    pub fn http_proxy_callback_fn(
        &self,
        _url: Value,
        _method: Value,
        _headers: Value,
        _body: Value,
    ) -> Value {
        self.http_proxy_callback.clone()
    }
    pub fn https_proxy_callback_fn(
        &self,
        _url: Value,
        _method: Value,
        _headers: Value,
        _body: Value,
    ) -> Value {
        self.https_proxy_callback.clone()
    }
    pub fn socks_proxy_callback_fn(
        &self,
        _url: Value,
        _method: Value,
        _headers: Value,
        _body: Value,
    ) -> Value {
        self.socks_proxy_callback.clone()
    }
    pub fn ws_proxy_callback_fn(
        &self,
        _url: Value,
        _method: Value,
        _headers: Value,
        _body: Value,
    ) -> Value {
        Value::Null
    }
    pub fn wss_proxy_callback_fn(
        &self,
        _url: Value,
        _method: Value,
        _headers: Value,
        _body: Value,
    ) -> Value {
        Value::Null
    }
    pub fn ws_socks_proxy_callback_fn(
        &self,
        _url: Value,
        _method: Value,
        _headers: Value,
        _body: Value,
    ) -> Value {
        Value::Null
    }

    pub fn init_throttler(&mut self) { /* stub */
    }
    /// Leaky-bucket rate limiter, mirroring `ts/src/base/functions/throttle.ts`.
    /// `rateLimit` is milliseconds-per-token, so `refillRate = 1/rateLimit`
    /// tokens/ms; `tokens` may go negative (a request proceeds when `tokens >= 0`
    /// and then subtracts its cost), and the next request waits until the bucket
    /// refills back to zero. State lives in `internals.throttle` behind an async
    /// mutex, so concurrent calls on one instance serialize (the TS single queue).
    /// A no-op when `enableRateLimit` is false or the rate is effectively
    /// unlimited.
    pub async fn throttle(&self, cost: &[Value]) -> Value {
        if !matches!(self.enableRateLimit, Value::Bool(true)) {
            return Value::Null;
        }
        let tb = |key: &str| -> Option<f64> {
            crate::get_value(&self.tokenBucket, &Value::Str(key.to_string())).as_f64()
        };
        let rate_limit = self.rateLimit.as_f64().unwrap_or(0.0);
        let refill_rate = tb("refillRate")
            .unwrap_or_else(|| if rate_limit > 0.0 { 1.0 / rate_limit } else { f64::MAX });
        if !(refill_rate.is_finite() && refill_rate > 0.0) {
            return Value::Null; // effectively unlimited
        }
        let capacity = tb("capacity").unwrap_or(1.0);
        let delay_ms = tb("delay").unwrap_or(0.001) * 1000.0;
        let this_cost = cost.first().and_then(|v| v.as_f64())
            .unwrap_or_else(|| tb("cost").unwrap_or(1.0));

        let now_ms = || std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map(|d| d.as_millis() as i64)
            .unwrap_or(0);

        let mut guard = self.internals.throttle.lock().await;
        let (tokens, last_ms) = &mut *guard;
        if *last_ms == 0 {
            *last_ms = now_ms();
        }
        // Refill for the elapsed time (capped at capacity).
        let n = now_ms();
        *tokens = (*tokens + refill_rate * (n - *last_ms).max(0) as f64).min(capacity);
        *last_ms = n;
        // In deficit → wait until the bucket refills to zero, holding the lock so
        // requests stay serialized.
        if *tokens < 0.0 {
            let wait = ((-*tokens) / refill_rate).max(delay_ms);
            tokio::time::sleep(std::time::Duration::from_millis(wait.ceil() as u64)).await;
            let n2 = now_ms();
            *tokens = (*tokens + refill_rate * (n2 - *last_ms).max(0) as f64).min(capacity);
            *last_ms = n2;
        }
        *tokens -= this_cost;
        Value::Null
    }

    pub fn resolve<T>(&self, v: T) -> T {
        v
    }
    pub fn reject(&self, err: ExchangeError) -> ExchangeError {
        err
    }
}

/// Synthesizes a `code → currency` map from a list of markets, mirroring
/// what `Exchange::set_markets`' else-branch does in TS — but in straight
/// Rust without re-cloning the grouped Map per outer iteration. For
/// binance (~4k markets, ~1k codes) the transpiled path took minutes;
/// this version completes in milliseconds.
fn synthesize_currencies_from_markets(markets: &Value, precision_mode: &Value) -> Value {
    let market_list: Vec<&Value> = match markets {
        Value::Arr(a) => a.iter().collect(),
        Value::Dict(m) => m.values().collect(),
        _ => return Value::Map(HashMap::new()),
    };
    let is_tick_size = matches!(precision_mode, Value::Int(n) if *n == crate::runtime::TICK_SIZE);
    let default_precision = if is_tick_size {
        Value::Float(1e-8)
    } else {
        Value::Int(8)
    };

    // Helper to compare precision: tick size → smaller is more precise;
    // decimal places → larger is more precise.
    let more_precise = |new: &Value, cur: &Value| -> bool {
        let to_f = |v: &Value| -> f64 {
            match v {
                Value::Int(n) => *n as f64,
                Value::Float(f) => *f,
                Value::Str(s) => s.parse().unwrap_or(f64::NAN),
                _ => f64::NAN,
            }
        };
        let n = to_f(new);
        let c = to_f(cur);
        if n.is_nan() {
            return false;
        }
        if c.is_nan() {
            return true;
        }
        if is_tick_size {
            n < c
        } else {
            n > c
        }
    };

    // Pull out the "code", "id", "precision" triple for each side. We
    // dedupe by code, keeping the most-precise instance.
    let mut by_code: HashMap<String, HashMap<String, Value>> = HashMap::new();
    for market in market_list {
        let market_precision = crate::get_value(market, &Value::Str("precision".to_string()));
        // base side
        for (id_key, code_key, prec_keys) in [
            ("baseId", "base", ["base", "amount"]),
            ("quoteId", "quote", ["quote", "price"]),
        ] {
            let code = crate::get_value(market, &Value::Str(code_key.to_string()));
            let code_s = match &code {
                Value::Str(s) if !s.is_empty() => s.clone(),
                _ => continue,
            };
            let id = crate::get_value(market, &Value::Str(id_key.to_string()));
            let id_v = match &id {
                Value::Null => Value::Str(code_s.clone()),
                other => other.clone(),
            };
            let mut precision =
                crate::get_value(&market_precision, &Value::Str(prec_keys[0].to_string()));
            if matches!(precision, Value::Null) {
                precision =
                    crate::get_value(&market_precision, &Value::Str(prec_keys[1].to_string()));
            }
            if matches!(precision, Value::Null) {
                precision = default_precision.clone();
            }
            let entry = by_code.entry(code_s.clone()).or_insert_with(|| {
                let mut m = HashMap::new();
                m.insert("id".to_string(), id_v.clone());
                m.insert("numericId".to_string(), Value::Null);
                m.insert("code".to_string(), Value::Str(code_s.clone()));
                m.insert("precision".to_string(), precision.clone());
                m
            });
            let existing_precision = entry.get("precision").cloned().unwrap_or(Value::Null);
            if more_precise(&precision, &existing_precision) {
                entry.insert("precision".to_string(), precision.clone());
            }
        }
    }
    let result: HashMap<String, Value> = by_code
        .into_iter()
        .map(|(k, v)| (k, Value::Map(v)))
        .collect();
    Value::Map(result)
}
