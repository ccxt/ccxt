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
use crate::{ExchangeError, Value};
use chrono::{Datelike, TimeZone, Utc};
use indexmap::IndexMap as HashMap;
use std::sync::Arc;

/// The needle of `in_array`: a `Value` (as before), or a typed string / integer local lent as is, so the transpiled
/// code passes it without boxing or copying it. Each answers exactly `is_equal(element, &boxed_needle)`.
pub trait InArrayNeedle {
    fn needle_eq(&self, x: &Value) -> bool;
}
impl InArrayNeedle for Value {
    fn needle_eq(&self, x: &Value) -> bool { crate::runtime::is_equal(x, self) }
}
impl InArrayNeedle for str {
    fn needle_eq(&self, x: &Value) -> bool {
        match x {
            Value::Str(y) => y.as_ref() == self,
            _ => matches!((crate::runtime::value_as_f64(x), self.parse::<f64>().ok()), (Some(a), Some(b)) if a == b),
        }
    }
}
impl InArrayNeedle for String {
    fn needle_eq(&self, x: &Value) -> bool { self.as_str().needle_eq(x) }
}
impl InArrayNeedle for Option<String> {
    fn needle_eq(&self, x: &Value) -> bool { match self { Some(s) => s.as_str().needle_eq(x), None => matches!(x, Value::Null) } }
}
impl InArrayNeedle for i64 {
    fn needle_eq(&self, x: &Value) -> bool {
        match x {
            Value::Int(y) => y == self,
            _ => crate::runtime::value_as_f64(x) == Some(*self as f64),
        }
    }
}
impl InArrayNeedle for Option<i64> {
    fn needle_eq(&self, x: &Value) -> bool { match self { Some(n) => n.needle_eq(x), None => matches!(x, Value::Null) } }
}
impl<T: InArrayNeedle + ?Sized> InArrayNeedle for &T {
    fn needle_eq(&self, x: &Value) -> bool { (**self).needle_eq(x) }
}

/// Coerces `&Exchange` to `&mut Exchange`. The lint that warns about
/// this is suppressed locally — see the safety note on the call site.
#[allow(clippy::mut_from_ref, invalid_reference_casting)]
unsafe fn coerce_to_mut_unsafe(e: &Exchange) -> &mut Exchange {
    let ptr = e as *const Exchange as *mut Exchange;
    &mut *ptr
}

// One owner thread hands out the counter, so two tasks can never take the same
// value and no call site touches an atomic.
static RANDOM_COUNTER: std::sync::LazyLock<crate::value::OwnerThread<u64>> =
    std::sync::LazyLock::new(|| crate::value::OwnerThread::spawn("ccxt-random", 0u64));

/// Non-cryptographic 64-bit PRNG (splitmix64) seeded from a global
/// counter mixed with the high-resolution clock. Good enough for the
/// `uuid*` helpers — uniqueness across calls, not security.
fn random_u64() -> u64 {
    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_nanos() as u64)
        .unwrap_or(0);
    let n = RANDOM_COUNTER.run(|c| { *c = c.wrapping_add(1); *c });
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
pub(crate) fn bytes_to_value(bytes: &[u8]) -> Value {
    Value::Array(bytes.iter().map(|b| Value::Int(*b as i64)).collect())
}

/// True when `v` is a `Value::Array` whose elements are all integer
/// byte values (0..=255) — the port's stand-in for a binary buffer.
pub(crate) fn is_byte_array(v: &Value) -> bool {
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

/// The one body of the `safe_string_{lower,upper}*_opt` twins: a found string is case-transformed, else
/// the default is returned verbatim when it is a string (`None` where the boxed helper's
/// `arg_default(..).as_str()` is `None`), matching TS `safeStringLower/Upper` (type.ts).
fn cased_or_default(found: Option<String>, upper: bool, optional_args: &[Value]) -> Option<String> {
    match found {
        Some(s) => Some(if upper { s.to_uppercase() } else { s.to_lowercase() }),
        None => match arg_default(optional_args) {
            Value::Str(d) => Some(d.to_string()),
            _ => None,
        },
    }
}

fn key_str(key: &Value) -> String {
    stringify_param(key)
}

// ── deferred coroutine (`spawn` / `delay`) queue ─────────────────────────────
// JS `this.spawn(this.method, ...args)` backgrounds a coroutine. We can't truly
// background it (it needs `&mut self`, held by the WS drive loop), so `spawn`
// records the (method-name, args) and the drive loop (`ws_run`) drains and runs
// them inline. The transpiler already lowers the method reference to a
// dispatchable name string.
/// A queued coroutine. `due_at` is `None` for `spawn` (run at the next drain)
/// and `Some(instant)` for `delay` (run at the first drain at or after it —
/// the drive loop bounds its socket read by the earliest deadline so a timer
/// fires even on a silent stream).
///
/// The queue is thread-local, so a coroutine is only ever run by the drive loop
/// that queued it. That holds because a `watch` drive loop and the venue code
/// feeding it are one task, and tokio only migrates a task when another worker
/// steals it — measured as not happening for this loop. A long-deadline item
/// (a 20-minute `keepAliveListenKey`) now sits here across many iterations
/// rather than being drained immediately, so if a future change contends the
/// runtime hard enough to provoke stealing, this queue is the thing to move to
/// a task-local.
struct QueuedSpawn {
    method: String,
    args: Vec<Value>,
    due_at: Option<std::time::Instant>,
}

thread_local! {
    static SPAWN_QUEUE: std::cell::RefCell<Vec<QueuedSpawn>> =
        std::cell::RefCell::new(Vec::new());
}

/// Take everything queued by `spawn`, plus every `delay` whose deadline has
/// passed. Items still waiting on their deadline stay queued.
pub(crate) fn drain_spawn_queue() -> Vec<(String, Vec<Value>)> {
    let now = std::time::Instant::now();
    SPAWN_QUEUE.with(|q| {
        let mut q = q.borrow_mut();
        let mut due = Vec::new();
        let mut pending = Vec::new();
        for item in std::mem::take(&mut *q) {
            if item.due_at.map(|t| t <= now).unwrap_or(true) {
                due.push((item.method, item.args));
            } else {
                pending.push(item);
            }
        }
        *q = pending;
        due
    })
}

/// How long until the earliest not-yet-due `delay` fires, or `None` when
/// nothing is waiting on a deadline. The WS drive loop uses this to bound its
/// read, so a timer still fires on a stream that has gone quiet.
pub(crate) fn next_spawn_due() -> Option<std::time::Duration> {
    let now = std::time::Instant::now();
    SPAWN_QUEUE.with(|q| {
        q.borrow()
            .iter()
            .filter_map(|i| i.due_at)
            .min()
            .map(|t| t.saturating_duration_since(now))
    })
}

/// Await a WS single-flight handle (what `client.future ()` /
/// `client.reusable_future ()` return). Re-exported here because the generated
/// venue files reach the base through `crate::exchange_stubs::…`, a path that
/// resolves in both `ccxt-base` and `ccxt-pro`.
pub async fn ws_await_flight(handle: impl Into<crate::pro::ws_client::Flight>) -> Value {
    crate::pro::ws_client::ws_await_flight(handle.into()).await
}

/// Queue an async WS handler for the drive loop to run. The sync
/// `dispatch_ws_handler` can't `.await` an async handler (e.g. htx's
/// `handle_order_book_snapshot`), so it enqueues it here; `ws_run` drains and
/// dispatches it asynchronously right after the current `handle_message`.
pub fn enqueue_spawn(name: &str, args: Vec<Value>) {
    SPAWN_QUEUE.with(|q| {
        q.borrow_mut().push(QueuedSpawn {
            method: name.to_string(),
            args,
            due_at: None,
        })
    });
}

/// Queue a coroutine to run no earlier than `ms` from now — the scheduling half
/// of `delay`. Used for the venues' periodic self-rescheduling loops
/// (`keepAliveListenKey`, token refresh, …), which must fire on their own
/// cadence rather than on the next inbound frame.
pub fn enqueue_spawn_after(name: &str, args: Vec<Value>, ms: i64) {
    let due_at = std::time::Instant::now() + std::time::Duration::from_millis(ms.max(0) as u64);
    SPAWN_QUEUE.with(|q| {
        q.borrow_mut().push(QueuedSpawn {
            method: name.to_string(),
            args,
            due_at: Some(due_at),
        })
    });
}

impl Exchange {
    // ── safe_* aliases (above-marker in TS) ─────────────────────────────────

    /// Coerce a caught panic payload into the `[ClassName] message`
    /// shape TS uses (see `Exchange.exceptionMessage`). Truncates to
    /// 100k chars to match. Rust panics carry just a string in `Value`,
    /// so we trust it as the formatted message and trim it. Used by
    /// exchanges that re-throw with a contextual prefix in their
    /// catch arms (grvt.transfer is the canonical case).
    pub fn exception_message(&self, exc: impl Into<Value>, _optional_args: &[Value]) -> Value {
        let s = match exc.into() {
            Value::Str(s) => s,
            other => crate::runtime::stringify_param(&other).into(),
        };
        let n = s.chars().count().min(100_000);
        Value::Str(s.chars().take(n).collect())
    }

    /// Port of `Exchange.getCcxtVersion()`. The TS reads the static
    /// `Exchange.ccxtVersion` (a class member the release process bumps); the
    /// transpiler can't lower that `(Exchange as any).ccxtVersion` static access,
    /// so `getCcxtVersion` is dropped from `exchange_generated.rs` and lives here
    /// as a hand-written stub instead. Value mirrors `ts/src/base/Exchange.ts`'s
    /// `static ccxtVersion` (== package.json "version"); only foxbit consumes it
    /// (the `X-FB-CLIENT-VERSION` request header), and no static fixture asserts
    /// the header, so a version bump can't break the suites.
    pub fn get_ccxt_version(&self) -> Value {
        Value::Str("4.5.71".into())
    }

    // ── Hot-path `safe_*_k` variants — take `key: &str` directly so the
    // transpiler can skip wrapping every literal key in a `Value::Str`.
    // Each `_k` saves two String allocations per call (the key Value +
    // the key_str re-extraction). On a 500-trade fetchTrades, cumulative
    // savings are several thousand allocations.

    #[inline]
    pub fn safe_value_k(&self, obj: impl crate::value::KeyRead, key: &str, optional_args: &[Value]) -> Value {
        let v = obj.key_read(key);
        let missing = matches!(&v, Value::Null) || matches!(&v, Value::Str(s) if s.is_empty());
        if missing {
            arg_default(optional_args)
        } else {
            v
        }
    }

    #[inline]
    pub fn safe_string_k(&self, obj: impl crate::value::KeyRead, key: &str, optional_args: &[Value]) -> Value {
        let v = self.safe_value_k(obj, key, &[]);
        match v {
            Value::Str(_) => v,
            Value::Int(n) => Value::Str(n.to_string().into()),
            Value::Float(f) => Value::Str(f.to_string().into()),
            // Booleans/lists/dicts are not strings or finite numbers → return
            // the default, matching TS `safeString` (base/functions/type.ts).
            _ => arg_default(optional_args),
        }
    }

    /// `safe_string_k` without the box: same lookup, empty-string and default
    /// rules, `None` where the boxed helper yields `Value::Null`.
    #[inline]
    pub fn safe_string_k_opt(&self, obj: impl crate::value::KeyRead, key: &str, optional_args: &[Value]) -> Option<String> {
        match self.safe_value_k(obj, key, &[]) {
            Value::Str(s) => Some(s.to_string()),
            Value::Int(n) => Some(n.to_string()),
            Value::Float(f) => Some(f.to_string()),
            _ => match arg_default(optional_args) {
                Value::Str(d) => Some(d.to_string()),
                _ => None,
            },
        }
    }

    /// `safe_string` without the box (Value key): same lookup and default rules.
    #[inline]
    pub fn safe_string_opt(&self, obj: impl crate::value::KeyRead, key: Value, optional_args: &[Value]) -> Option<String> {
        match self.safe_value(obj, key, &[]) {
            Value::Str(s) => Some(s.to_string()),
            Value::Int(n) => Some(n.to_string()),
            Value::Float(f) => Some(f.to_string()),
            _ => match arg_default(optional_args) {
                Value::Str(d) => Some(d.to_string()),
                _ => None,
            },
        }
    }

    #[inline]
    pub fn safe_integer_k(&self, obj: impl crate::value::KeyRead, key: &str, optional_args: &[Value]) -> Value {
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
    pub fn safe_float_k(&self, obj: impl crate::value::KeyRead, key: &str, optional_args: &[Value]) -> Value {
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
    pub fn safe_number_k(&self, obj: impl crate::value::KeyRead, key: &str, optional_args: &[Value]) -> Value {
        self.safe_float_k(obj, key, optional_args)
    }

    /// `safe_bool_k` without the box: `Some` only for an actual boolean, else `None`.
    #[inline]
    pub fn safe_bool_k_opt(&self, obj: impl crate::value::KeyRead, key: &str, _optional_args: &[Value]) -> Option<bool> {
        match self.safe_value_k(obj, key, &[]) {
            Value::Bool(b) => Some(b),
            _ => None,
        }
    }

    /// `safe_bool` without the box (Value key): same lookup rule as `safe_bool_k_opt`.
    #[inline]
    pub fn safe_bool_opt(&self, obj: impl crate::value::KeyRead, key: Value, _optional_args: &[Value]) -> Option<bool> {
        match self.safe_value(obj, key, &[]) {
            Value::Bool(b) => Some(b),
            _ => None,
        }
    }

    /// `safe_bool2` without the box: first key holding a real boolean wins, else `None`.
    #[inline]
    pub fn safe_bool2_opt(&self, obj: impl crate::value::KeyRead, k1: Value, k2: Value, _optional_args: &[Value]) -> Option<bool> {
        if let Value::Bool(b) = self.safe_value(obj.clone(), k1, &[]) {
            return Some(b);
        }
        match self.safe_value(obj, k2, &[]) {
            Value::Bool(b) => Some(b),
            _ => None,
        }
    }

    /// `safe_bool_n` without the box: `Some` only for an actual boolean, else `None`.
    #[inline]
    pub fn safe_bool_n_opt(&self, obj: impl crate::value::KeyRead, keys: Value, _optional_args: &[Value]) -> Option<bool> {
        match self.safe_value_n(obj, keys, &[]) {
            Value::Bool(b) => Some(b),
            _ => None,
        }
    }

    /// `safe_string2` without the box: first key whose `safe_string` is non-null, then the
    /// default; `None` where the boxed helper yields `Value::Null`.
    #[inline]
    pub fn safe_string2_opt(&self, obj: impl crate::value::KeyRead, k1: Value, k2: Value, optional_args: &[Value]) -> Option<String> {
        self.safe_string_opt(obj.clone(), k1, &[])
            .or_else(|| self.safe_string_opt(obj, k2, &[]))
            .or_else(|| match arg_default(optional_args) {
                Value::Str(d) => Some(d.to_string()),
                _ => None,
            })
    }

    /// `safe_string_n` without the box: first key whose `safe_string` is non-null, then the
    /// default; `None` where the boxed helper yields `Value::Null`.
    #[inline]
    pub fn safe_string_n_opt(&self, obj: impl crate::value::KeyRead, keys: Value, optional_args: &[Value]) -> Option<String> {
        if let Value::Arr(ks) = keys {
            for k in ks.iter().cloned() {
                if let Some(s) = self.safe_string_opt(obj.clone(), k, &[]) {
                    return Some(s);
                }
            }
        }
        match arg_default(optional_args) {
            Value::Str(d) => Some(d.to_string()),
            _ => None,
        }
    }

    /// `safe_number2` without the box (no default): first key whose string form parses as f64.
    pub fn safe_number2_opt(&self, obj: impl crate::value::KeyRead, k1: Value, k2: Value, _optional_args: &[Value]) -> Option<f64> {
        match self.safe_string2(obj, k1, k2, &[]) {
            Value::Str(s) => s.parse::<f64>().ok(),
            _ => None,
        }
    }

    #[inline]
    pub fn safe_bool_k(&self, obj: impl crate::value::KeyRead, key: &str, optional_args: &[Value]) -> Value {
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
    pub fn safe_dict_k(&self, obj: impl crate::value::KeyRead, key: &str, optional_args: &[Value]) -> Value {
        let v = self.safe_value_k(obj, key, &[]);
        if matches!(v, Value::Dict(_)) {
            v
        } else {
            arg_default(optional_args)
        }
    }

    #[inline]
    pub fn safe_list_k(&self, obj: impl crate::value::KeyRead, key: &str, optional_args: &[Value]) -> Value {
        let v = self.safe_value_k(obj, key, &[]);
        if matches!(v, Value::Arr(_)) {
            v
        } else {
            arg_default(optional_args)
        }
    }

    /// Typed twins of `safe_dict*` / `safe_list*` with no or an empty default: the member when it is a map / list,
    /// else the empty one (`_t`) or `None` (`_o`), exactly what the boxed reader's `.into_*()` answered.
    pub fn safe_dict_k_t(&self, obj: impl crate::value::KeyRead, key: &str) -> crate::value::Dict { self.safe_dict_k_o(obj, key).unwrap_or_default() }
    pub fn safe_dict_k_o(&self, obj: impl crate::value::KeyRead, key: &str) -> Option<crate::value::Dict> { if let Value::Dict(m) = self.safe_value_k(obj, key, &[]) { Some(m) } else { None } }
    pub fn safe_list_k_t(&self, obj: impl crate::value::KeyRead, key: &str) -> crate::value::List { self.safe_list_k_o(obj, key).unwrap_or_default() }
    pub fn safe_list_k_o(&self, obj: impl crate::value::KeyRead, key: &str) -> Option<crate::value::List> { if let Value::Arr(a) = self.safe_value_k(obj, key, &[]) { Some(a) } else { None } }
    pub fn safe_dict_t(&self, obj: impl crate::value::KeyRead, key: impl Into<Value>) -> crate::value::Dict { self.safe_dict_o(obj, key).unwrap_or_default() }
    pub fn safe_dict_o(&self, obj: impl crate::value::KeyRead, key: impl Into<Value>) -> Option<crate::value::Dict> { if let Value::Dict(m) = self.safe_value(obj, key.into(), &[]) { Some(m) } else { None } }
    pub fn safe_list_t(&self, obj: impl crate::value::KeyRead, key: impl Into<Value>) -> crate::value::List { self.safe_list_o(obj, key).unwrap_or_default() }
    pub fn safe_list_o(&self, obj: impl crate::value::KeyRead, key: impl Into<Value>) -> Option<crate::value::List> { if let Value::Arr(a) = self.safe_value(obj, key.into(), &[]) { Some(a) } else { None } }

    pub fn safe_value(&self, obj: impl crate::value::KeyRead, key: Value, optional_args: &[Value]) -> Value {
        // Match TS `prop` semantics: an empty string is treated as
        // "missing" — same as null/undefined. Without this, exchanges
        // that signal end-of-pagination with `cursor: ""` loop forever
        // because `is_equal(&Value::Str(""), &Value::Null)` is false.
        let v = obj.read(&Value::Str(key_str(&key).into()));
        let missing = matches!(&v, Value::Null) || matches!(&v, Value::Str(s) if s.is_empty());
        if missing {
            arg_default(optional_args)
        } else {
            v
        }
    }

    pub fn safe_value2(&self, obj: impl crate::value::KeyRead, k1: Value, k2: Value, optional_args: &[Value]) -> Value {
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

    pub fn safe_value_n(&self, obj: impl crate::value::KeyRead, keys: Value, optional_args: &[Value]) -> Value {
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

    pub fn safe_string(&self, obj: impl crate::value::KeyRead, key: Value, optional_args: &[Value]) -> Value {
        let v = self.safe_value(obj, key, &[]);
        match v {
            Value::Str(_) => v,
            Value::Int(n) => Value::Str(n.to_string().into()),
            Value::Float(f) => Value::Str(f.to_string().into()),
            // A boolean is NOT a string or finite number — TS `safeString`
            // (base/functions/type.ts) returns the default for it, not "true"/
            // "false". Same for lists/dicts (the `_` arm).
            Value::Null => arg_default(optional_args),
            _ => arg_default(optional_args),
        }
    }

    pub fn safe_string2(&self, obj: impl crate::value::KeyRead, k1: Value, k2: Value, optional_args: &[Value]) -> Value {
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

    pub fn safe_string_n(&self, obj: impl crate::value::KeyRead, keys: Value, optional_args: &[Value]) -> Value {
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
    pub fn safe_string_upper(&self, obj: impl crate::value::KeyRead, key: Value, optional_args: &[Value]) -> Value {
        let v = self.safe_string(obj, key, &[]);
        if !v.is_null() {
            if let Value::Str(s) = v {
                return Value::Str(s.to_uppercase().into());
            }
            return v;
        }
        arg_default(optional_args)
    }

    /// `safe_string_upper` with a `&str` key — the `safe_*_k` twin.
    #[inline]
    pub fn safe_string_upper_k(&self, obj: impl crate::value::KeyRead, key: &str, optional_args: &[Value]) -> Value {
        let v = self.safe_string_k(obj, key, &[]);
        if !v.is_null() {
            if let Value::Str(s) = v {
                return Value::Str(s.to_uppercase().into());
            }
            return v;
        }
        arg_default(optional_args)
    }

    /// `safe_string_upper_k` without the box: the found value is upper-cased, a
    /// default is returned verbatim (`None` where the boxed helper yields `Null`).
    #[inline]
    pub fn safe_string_upper_k_opt(&self, obj: impl crate::value::KeyRead, key: &str, optional_args: &[Value]) -> Option<String> {
        cased_or_default(self.safe_string_k_opt(obj, key, &[]), true, optional_args)
    }

    pub fn safe_string_lower_n(&self, obj: impl crate::value::KeyRead, keys: Value, optional_args: &[Value]) -> Value {
        if let Value::Arr(ks) = keys {
            for k in ks.iter().cloned() {
                let v = self.safe_string(obj.clone(), k, &[]);
                if !v.is_null() {
                    if let Value::Str(s) = v {
                        return Value::Str(s.to_lowercase().into());
                    }
                    return v;
                }
            }
        }
        arg_default(optional_args)
    }

    pub fn safe_string_upper_n(&self, obj: impl crate::value::KeyRead, keys: Value, optional_args: &[Value]) -> Value {
        if let Value::Arr(ks) = keys {
            for k in ks.iter().cloned() {
                let v = self.safe_string(obj.clone(), k, &[]);
                if !v.is_null() {
                    if let Value::Str(s) = v {
                        return Value::Str(s.to_uppercase().into());
                    }
                    return v;
                }
            }
        }
        arg_default(optional_args)
    }

    pub fn safe_string_lower(&self, obj: impl crate::value::KeyRead, key: Value, optional_args: &[Value]) -> Value {
        let v = self.safe_string(obj, key, &[]);
        if !v.is_null() {
            if let Value::Str(s) = v {
                return Value::Str(s.to_lowercase().into());
            }
            return v;
        }
        arg_default(optional_args)
    }

    /// `safe_string_lower` with a `&str` key — the `safe_*_k` twin of the
    /// lookup above (same `get_value_k` path as the rest of the family).
    #[inline]
    pub fn safe_string_lower_k(&self, obj: impl crate::value::KeyRead, key: &str, optional_args: &[Value]) -> Value {
        let v = self.safe_string_k(obj, key, &[]);
        if !v.is_null() {
            if let Value::Str(s) = v {
                return Value::Str(s.to_lowercase().into());
            }
            return v;
        }
        arg_default(optional_args)
    }

    /// `safe_string_lower_k` without the box: the found value is lower-cased, a
    /// default is returned verbatim (`None` where the boxed helper yields `Null`).
    #[inline]
    pub fn safe_string_lower_k_opt(&self, obj: impl crate::value::KeyRead, key: &str, optional_args: &[Value]) -> Option<String> {
        cased_or_default(self.safe_string_k_opt(obj, key, &[]), false, optional_args)
    }

    pub fn safe_string_lower2(
        &self,
        obj: impl crate::value::KeyRead,
        k1: Value,
        k2: Value,
        optional_args: &[Value],
    ) -> Value {
        let v = self.safe_string2(obj, k1, k2, &[]);
        if !v.is_null() {
            if let Value::Str(s) = v {
                return Value::Str(s.to_lowercase().into());
            }
            return v;
        }
        arg_default(optional_args)
    }

    pub fn safe_string_upper2(
        &self,
        obj: impl crate::value::KeyRead,
        k1: Value,
        k2: Value,
        optional_args: &[Value],
    ) -> Value {
        let v = self.safe_string2(obj, k1, k2, &[]);
        if !v.is_null() {
            if let Value::Str(s) = v {
                return Value::Str(s.to_uppercase().into());
            }
            return v;
        }
        arg_default(optional_args)
    }

    /// `safe_string_lower` without the box (Value key): see `cased_or_default`.
    #[inline]
    pub fn safe_string_lower_opt(&self, obj: impl crate::value::KeyRead, key: Value, optional_args: &[Value]) -> Option<String> {
        cased_or_default(self.safe_string_opt(obj, key, &[]), false, optional_args)
    }

    /// `safe_string_upper` without the box (Value key): see `cased_or_default`.
    #[inline]
    pub fn safe_string_upper_opt(&self, obj: impl crate::value::KeyRead, key: Value, optional_args: &[Value]) -> Option<String> {
        cased_or_default(self.safe_string_opt(obj, key, &[]), true, optional_args)
    }

    /// `safe_string_lower2` without the box: see `cased_or_default`.
    #[inline]
    pub fn safe_string_lower2_opt(&self, obj: impl crate::value::KeyRead, k1: Value, k2: Value, optional_args: &[Value]) -> Option<String> {
        cased_or_default(self.safe_string2_opt(obj, k1, k2, &[]), false, optional_args)
    }

    /// `safe_string_upper2` without the box: see `cased_or_default`.
    #[inline]
    pub fn safe_string_upper2_opt(&self, obj: impl crate::value::KeyRead, k1: Value, k2: Value, optional_args: &[Value]) -> Option<String> {
        cased_or_default(self.safe_string2_opt(obj, k1, k2, &[]), true, optional_args)
    }

    /// `safe_string_lower_n` without the box: see `cased_or_default`.
    #[inline]
    pub fn safe_string_lower_n_opt(&self, obj: impl crate::value::KeyRead, keys: Value, optional_args: &[Value]) -> Option<String> {
        cased_or_default(self.safe_string_n_opt(obj, keys, &[]), false, optional_args)
    }

    /// `safe_string_upper_n` without the box: see `cased_or_default`.
    #[inline]
    pub fn safe_string_upper_n_opt(&self, obj: impl crate::value::KeyRead, keys: Value, optional_args: &[Value]) -> Option<String> {
        cased_or_default(self.safe_string_n_opt(obj, keys, &[]), true, optional_args)
    }

    /// `super.X(...)` from derived exchanges — routes back to the base
    /// Exchange impl. These stubs return Value::Null; they exist so
    /// transpiled `self.super_X()` calls type-check.
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

    // ── request bookkeeping (hand-written, above the transpile marker) ──
    // These live above the `METHODS BELOW THIS LINE ...` marker in
    // `ts/src/base/Exchange.ts` (plain assignments in most languages), so
    // they are implemented by hand rather than transpiled. They mutate
    // instance fields; the `&self` receiver matches the transpiler's call
    // shape and we reborrow `&mut` via the same helper as `super_set_markets`.
    pub fn set_last_rest_request_timestamp(&self) {
        let me = unsafe { coerce_to_mut_unsafe(self) };
        me.lastRestRequestTimestamp = Value::Int(self.milliseconds());
    }

    pub fn set_last_request(&self, request: Value) {
        let me = unsafe { coerce_to_mut_unsafe(self) };
        me.last_request_headers =
            crate::runtime::get_value(&request, &Value::Str("headers".into()));
        me.last_request_body = crate::runtime::get_value(&request, &Value::Str("body".into()));
        me.last_request_url = crate::runtime::get_value(&request, &Value::Str("url".into()));
    }

    pub fn get_fetch_cache(&self) -> Value {
        self.fetchHistoryCache.clone()
    }

    pub fn add_fetch_cache(&self, data: Value) {
        let me = unsafe { coerce_to_mut_unsafe(self) };
        // the size is only ever an Int / Float and the cache a list (constructor + apply_config)
        let size = me.fetchHistoryCacheSize.as_f64().unwrap_or(f64::NAN);
        if size <= 0.0 {
            return;
        }
        while (me.fetchHistoryCache.len() as f64) >= size {
            if let Value::Arr(a) = &mut me.fetchHistoryCache { Arc::make_mut(a).remove(0); }
        }
        crate::runtime::append_to_array(&mut me.fetchHistoryCache, data);
    }

    // ── WS (pro) stubs ─────────────────────────────────────────────────────
    // The transpiled pro/<id>.rs files reference `self.watch()`, `self.client()`,
    // `self.spawn()` etc. from the WS Client infrastructure that hasn't been
    // ported yet. These stubs make the WS-extends-REST inheritance compile —
    // calls at runtime panic with a clear "WS not yet ported" error so we
    // surface the gap loudly instead of silently no-op'ing.
    //
    // `watch()` / `watch_multiple()` are the WS drive loop and live in the
    // `ExchangeRuntime` trait (generic `self`) so they can dispatch to the
    // concrete Core's `handle_message` override — see exchange.rs.
    //
    // `client(url)` returns the client-handle `Value` (`Map{url, subscriptions,
    // futures}`) the transpiled `handle_message` reads; the live connection is
    // established lazily by `watch()`.
    pub fn client<'a>(&mut self, url: impl Into<Option<&'a str>>) -> Value {
        match url.into() {
            Some(url) => crate::pro::ws_client::client_value(url),
            None => Value::Null,
        }
    }
    // `spawn(fn, ...)` / `delay(ms, fn, ...)`: the transpiler lowers the JS
    // function reference to `Value::Null` (it has no Rust callable to pass), so
    // these can't invoke the coroutine and are necessarily no-ops. Background
    // keep-alive/auth-refresh loops that rely on them are a known gap.
    pub fn spawn(&self, args: &[Value]) -> Value {
        // args = [ method_name, ...call_args ]; queue it for the drive loop.
        if let Some(Value::Str(name)) = args.get(0) {
            let call_args: Vec<Value> = args.get(1..).map(|s| s.to_vec()).unwrap_or_default();
            enqueue_spawn(name, call_args);
        }
        Value::Null
    }
    pub async fn delay(&mut self, ms: Value, args: &[Value]) -> Value {
        // `delay(ms, method, ...args)` schedules a coroutine after a warm-up
        // delay (bitvavo's snapshot fetch, htx's resync retry) or on a long
        // period (binance's `keepAliveListenKey`, every 20 min). We can't sleep
        // and then call it — that needs &mut self — so queue it with its
        // deadline; the WS drive loop bounds its socket read by the earliest
        // deadline and runs the coroutine when it comes due.
        if let Some(Value::Str(name)) = args.get(0) {
            let call_args: Vec<Value> = args.get(1..).map(|s| s.to_vec()).unwrap_or_default();
            enqueue_spawn_after(name, call_args, ms.as_f64().unwrap_or(0.0) as i64);
        }
        Value::Null
    }
    pub fn order_book(&self, args: &[Value]) -> crate::pro::order_book::Book {
        crate::pro::order_book::new_book(crate::pro::order_book::BOOK_PLAIN, 
            crate::runtime::get_arg(args, 0, Value::Null),
            crate::runtime::get_arg(args, 1, Value::Null),
        )
    }
    pub fn indexed_order_book(&self, args: &[Value]) -> crate::pro::order_book::Book {
        crate::pro::order_book::new_book(crate::pro::order_book::BOOK_INDEXED, 
            crate::runtime::get_arg(args, 0, Value::Null),
            crate::runtime::get_arg(args, 1, Value::Null),
        )
    }
    pub fn counted_order_book(&self, args: &[Value]) -> crate::pro::order_book::Book {
        crate::pro::order_book::new_book(crate::pro::order_book::BOOK_COUNTED, 
            crate::runtime::get_arg(args, 0, Value::Null),
            crate::runtime::get_arg(args, 1, Value::Null),
        )
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
    pub fn lock_last_nonce(&self, _args: &[Value]) -> Value {
        Value::Null
    }
    pub fn unlock_last_nonce(&self, _args: &[Value]) -> Value {
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
    /// `crc32(str, signed)`: TypeScript declares `number`, and the runtime always yields an integer.
    pub fn crc32(&self, args: &[Value]) -> i64 {
        let payload = args.get(0).cloned().unwrap_or(Value::Str(String::new().into()));
        let signed = args.get(1).cloned().unwrap_or(Value::Bool(false));
        crate::runtime::crc32(payload, signed).as_i64().unwrap_or_default()
    }
    /// `decode_proto_msg(message)` — exchange-specific protobuf decoder
    /// (mexc). `message` is the binary frame carried as a byte array; decode
    /// it into mexc's `PushDataV3ApiWrapper` shape (matching protobufjs
    /// `.toJSON()`) so the ported handlers consume it unchanged.
    pub fn decode_proto_msg(&self, args: &[Value]) -> Value {
        match args.get(0) {
            Some(v) if is_byte_array(v) => {
                let bytes = crate::exchange::value_to_bytes(v);
                crate::runtime::decode_mexc_push_data(&bytes)
            }
            Some(v) => v.clone(),
            None => Value::Null,
        }
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
                Value::Str(s[2..].to_string().into())
            }
            _ => hex_data,
        }
    }

    /// `handleHttpStatusCode(code, reason, url, method, body)` — throws the
    /// `httpExceptions` class for the status; a status outside the table passes.
    pub fn handle_http_status_code(&self, code: Value, reason: Value, url: Value, method: Value, body: Value) {
        let code_as_string = Value::Str(stringify_param(&code).into());
        if crate::runtime::in_op(&self.httpExceptions, &code_as_string) {
            let error_class = crate::runtime::get_value(&self.httpExceptions, &code_as_string);
            let message = [&self.id, &method, &url, &code_as_string, &reason, &body]
                .iter()
                .map(|part| stringify_param(part))
                .collect::<Vec<_>>()
                .join(" ");
            panic!("{}", crate::exchange_errors::create_error(&stringify_param(&error_class), message));
        }
    }

    /// `checkRequiredDependencies()` — a no-op in Rust; all crypto deps are
    /// compiled in.
    pub fn check_required_dependencies(&self) -> Value {
        Value::Null
    }

    /// `randNumber(size)` — a random integer with `size` decimal digits.
    pub fn rand_number(&self, size: Value) -> i64 {
        use rsa::rand_core::{OsRng, RngCore};
        let n = size.as_i64().unwrap_or(0).max(0) as usize;
        let mut s = String::new();
        let mut byte = [0u8; 1];
        while s.len() < n {
            OsRng.fill_bytes(&mut byte);
            // Reject 250..=255 so every digit is equally likely.
            if byte[0] < 250 {
                s.push(char::from(b'0' + byte[0] % 10));
            }
        }
        s.parse::<i64>().unwrap_or(0)
    }

    /// `randomBytes(length)` — `length` random bytes as a hex string.
    pub fn random_bytes(&self, length: Value) -> String {
        use rsa::rand_core::{OsRng, RngCore};
        let n = length.as_i64().unwrap_or(0).max(0) as usize;
        let mut bytes = vec![0u8; n];
        OsRng.fill_bytes(&mut bytes);
        crate::exchange::hex_encode(bytes)
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
                    Err(_) => Value::Str(t.to_string().into()),
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
                    .replace("]\"", "]").into(),
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
        Value::Str(out.into())
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
        let h = crate::exchange::hex_encode(&hash[0..16]);
        Value::Str(format!(
            "{}-{}-{}-{}-{}",
            &h[0..8],
            &h[8..12],
            &h[12..16],
            &h[16..20],
            &h[20..32]
        ).into())
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
        let ts: Vec<Value> = match &types {
            Value::Arr(a) => (**a).clone(),
            _ => return Value::Null,
        };
        let vs: Vec<Value> = match &values {
            Value::Arr(a) => (**a).clone(),
            _ => return Value::Null,
        };
        let to_bytes = |v: &Value| -> Vec<u8> {
            match v {
                Value::Arr(a) => a
                    .iter()
                    .filter_map(|x| {
                        if let Value::Int(n) = x {
                            Some(*n as u8)
                        } else {
                            None
                        }
                    })
                    .collect(),
                Value::Str(s) => crate::exchange::hex_decode(s.trim_start_matches("0x")).unwrap_or_default(),
                _ => Vec::new(),
            }
        };
        let to_bigint = |v: &Value| -> BigInt {
            match v {
                Value::Int(n) => BigInt::from(*n),
                Value::Float(f) => BigInt::from(*f as i64),
                Value::Str(s) => {
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
            let ty = match t {
                Value::Str(s) => s.as_ref(),
                _ => return Value::Null,
            };
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
            } else if ty.starts_with("uint") || ty.starts_with("int") {
                // uintN/intN — validate the declared bit width, reject
                // negative-for-unsigned / overflow, then encode (review #15).
                word = crate::exchange::eip712_int_word(ty, &to_bigint(v));
            } else if ty == "bool" {
                if matches!(v, Value::Bool(true)) {
                    word[31] = 1;
                }
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
        let id = match &self.id {
            Value::Str(s) => s.clone(),
            _ => String::new().into(),
        };
        panic!(
            "{}",
            crate::exchange_errors::not_supported(Value::Str(format!(
                "{id} {what}() signing is not implemented in the Rust port yet"
            ).into(),))
        );
    }

    /// `axolotl(payload, hexKey, ed25519)` — curve25519 signing (Waves exchange).
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
        _code: &str,
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
    pub fn urlencode_with_array_repeat(&self, params: impl Into<Value>) -> String {
        let Value::Dict(m) = Into::<Value>::into(params) else {
            return String::new();
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
        pairs.join("&")
    }

    pub fn safe_integer(&self, obj: impl crate::value::KeyRead, key: Value, optional_args: &[Value]) -> Value {
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
        obj: impl crate::value::KeyRead,
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

    pub fn safe_integer_n(&self, obj: impl crate::value::KeyRead, keys: Value, optional_args: &[Value]) -> Value {
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

    /// `safe_integer2` without the box (no default): first key yielding an integer.
    pub fn safe_integer2_opt(&self, obj: impl crate::value::KeyRead, k1: Value, k2: Value, _optional_args: &[Value]) -> Option<i64> {
        self.safe_integer(obj.clone(), k1, &[]).as_i64().or_else(|| self.safe_integer(obj, k2, &[]).as_i64())
    }

    /// `safe_integer_n` without the box (no default): first key in `keys` yielding an integer.
    pub fn safe_integer_n_opt(&self, obj: impl crate::value::KeyRead, keys: Value, _optional_args: &[Value]) -> Option<i64> {
        let Value::Arr(ks) = keys else { return None };
        ks.iter().find_map(|k| self.safe_integer(obj.clone(), k.clone(), &[]).as_i64())
    }

    /// Reads `obj[key]` as a number, multiplies by `factor`, and casts
    /// to i64. Used to convert seconds → milliseconds for timestamps.
    pub fn safe_integer_product(
        &self,
        obj: impl crate::value::KeyRead,
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

    /// `safe_integer_product` with a `&str` key — the `safe_*_k` twin.
    #[inline]
    pub fn safe_integer_product_k(
        &self,
        obj: impl crate::value::KeyRead,
        key: &str,
        factor: Value,
        optional_args: &[Value],
    ) -> Value {
        let v = self.safe_value_k(obj, key, &[]);
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
        obj: impl crate::value::KeyRead,
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
        obj: impl crate::value::KeyRead,
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
        obj: impl crate::value::KeyRead,
        k1: Value,
        k2: Value,
        optional_args: &[Value],
    ) -> Value {
        self.safe_integer_product2(obj, k1, k2, Value::Int(1000), optional_args)
    }

    pub fn safe_timestamp_n(&self, obj: impl crate::value::KeyRead, keys: Value, optional_args: &[Value]) -> Value {
        self.safe_integer_product_n(obj, keys, Value::Int(1000), optional_args)
    }

    pub fn safe_float(&self, obj: impl crate::value::KeyRead, key: Value, optional_args: &[Value]) -> Value {
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
    pub fn safe_timestamp(&self, obj: impl crate::value::KeyRead, key: Value, optional_args: &[Value]) -> Value {
        match self.safe_float(obj, key, &[]) {
            Value::Float(f) => Value::Int((f * 1000.0) as i64),
            Value::Int(n) => Value::Int(n * 1000),
            _ => arg_default(optional_args),
        }
    }

    /// `safe_timestamp` with a `&str` key — the `safe_*_k` twin.
    #[inline]
    pub fn safe_timestamp_k(&self, obj: impl crate::value::KeyRead, key: &str, optional_args: &[Value]) -> Value {
        match self.safe_float_k(obj, key, &[]) {
            Value::Float(f) => Value::Int((f * 1000.0) as i64),
            Value::Int(n) => Value::Int(n * 1000),
            _ => arg_default(optional_args),
        }
    }

    /// `isEmpty(value)` — true when an array/dict is empty, or the
    /// value is null/undefined. Scalars (strings, numbers, bools) are
    /// never considered empty — mirrors `functions/generic.ts`.
    pub fn is_empty(&self, v: impl Into<Value>) -> Value {
        let empty = match &Into::<Value>::into(v) {
            Value::Null => true,
            Value::Arr(a) => a.is_empty(),
            Value::Dict(m) => m.is_empty(),
            _ => false,
        };
        Value::Bool(empty)
    }

    pub fn value_is_defined(&self, v: Value) -> bool {
        !v.is_null()
    }

    // ── extend / deep_extend / omit ─────────────────────────────────────────

    pub fn extend(&self, a: impl crate::value::ExtendHead, optional_args: impl crate::value::MergeOperands) -> Value {
        let mut out = a.into_head();
        optional_args.for_each_map(|m| {
            for (k, v) in m.iter() {
                out.insert(k.clone(), v.clone());
            }
        });
        Value::Map(out)
    }

    pub fn deep_extend(&self, a: impl Into<Value>, optional_args: impl crate::value::MergeOperands) -> Value {
        let mut current: Value = a.into();
        optional_args.for_each_operand(|extra| {
            current = crate::value::deep_extend(std::mem::take(&mut current), extra);
        });
        current
    }

    pub fn omit(&self, obj: impl crate::value::OmitSource, keys: impl crate::value::OmitKeys, _optional_args: &[Value]) -> Value {
        match obj.into_operand() {
            Value::Dict(mut m) => {
                let mm = Arc::make_mut(&mut m);
                keys.for_each_key(|k| { mm.shift_remove(k); });
                Value::Dict(m)
            }
            other => other,
        }
    }

    pub fn omit_zero(&self, v: Value) -> Option<String> {
        // Mirrors TS `omitZero`: undefined/'' or any value that parses to
        // numeric 0 → undefined. The old `s == "0"` check missed "0.0",
        // "0.00", "0e0" etc. — e.g. gate echoes `gt_fee:"0.0"`, and
        // keeping it as a non-null fee left `safeTrade` with 3 fee
        // entries (so it couldn't collapse to a single `fee`).
        // The TS parameter is `string | undefined`; any other input reads as its text.
        match &v {
            Value::Null | Value::Int(0) => None,
            Value::Float(f) if *f == 0.0 => None,
            Value::Str(s) => {
                if s.is_empty() {
                    return None;
                }
                match s.parse::<f64>() {
                    Ok(n) if n == 0.0 => None,
                    _ => Some(s.to_string()),
                }
            }
            _ => Some(stringify_param(&v)),
        }
    }

    // ── array / object utilities ────────────────────────────────────────────

    pub fn to_array(&self, v: impl Into<Value>) -> Value {
        let v: Value = v.into();
        // A WS cache (ArrayCache / order-book cache) keeps its entries in `_data`
        // or the shared cache registry, not the dict's meta fields — surface
        // those, else `to_array` would leak `__cacheKind`/counters/flags as rows.
        if let Some(entries) = crate::value::cache_entries_as_value(&v) {
            return entries;
        }
        match v {
            Value::Arr(_) => v,
            Value::Dict(m) => Value::Array(m.values().cloned().collect()),
            Value::Null => Value::Array(vec![]),
            other => Value::Array(vec![other]),
        }
    }

    pub fn array_concat(&self, a: impl Into<Value>, b: impl Into<Value>) -> Value {
        crate::runtime::concat_arrays(&a.into(), &b.into())
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

    pub fn in_array(&self, needle: impl InArrayNeedle, haystack: impl Into<Value>) -> bool {
        if let Value::Arr(a) = haystack.into() {
            a.iter().any(|x| needle.needle_eq(x))
        } else {
            false
        }
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
                    let v = crate::get_value(it, &Value::Str(k.clone().into()));
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
        let key = Value::Str(stringify_param(&key).into());
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
        let k1 = Value::Str(stringify_param(&k1).into());
        let k2 = Value::Str(stringify_param(&k2).into());
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
        // An order-book side is a marker Dict backed by the shared side store,
        // not a plain array (in JS `OrderBookSide` extends Array). Snapshot its
        // `[[price, size], …]` rows so aggregate iterates the levels.
        let arr = crate::value::side_entries_as_value(&arr).unwrap_or(arr);
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

    // only the C#, Java and Go ports type-check an option value; here it passes through unchanged
    pub fn check_option_string(&self, _method_name: Value, _option_name: Value, value: Value) -> Value {
        value
    }
    // "true"/"false" strings and 1/0 numbers read as booleans; any other present non-boolean panics BadRequest
    pub fn check_option_bool(&self, method_name: Value, option_name: Value, value: Value) -> Value {
        if value.is_null() {
            return Value::Null;
        }
        let parsed = match &value {
            Value::Bool(b) => Some(*b),
            Value::Str(s) if s == "true" || s == "false" => Some(s == "true"),
            Value::Int(n) if *n == 1 || *n == 0 => Some(*n == 1),
            Value::Float(n) if *n == 1.0 || *n == 0.0 => Some(*n == 1.0),
            _ => None,
        };
        if parsed.is_none() {
            let label = if method_name.is_null() { "exchange-wide".to_string() } else { format!("{}()", stringify_param(&method_name)) };
            let message = format!("{} {} option {} must be a boolean", stringify_param(&self.id), label, stringify_param(&option_name));
            panic!("{}", crate::exchange_errors::create_error("BadRequest", message));
        }
        Value::Bool(parsed == Some(true))
    }
    // Int and null pass; an integral finite Float reads as Int; any other present value panics BadRequest (as the Go/C#/Java ports)
    pub fn check_option_integer(&self, method_name: Value, option_name: Value, value: Value) -> Value {
        match value {
            Value::Null | Value::Int(_) => value,
            Value::Float(f) if f.is_finite() && f == f.trunc() => Value::Int(f as i64),
            _ => {
                let label = if method_name.is_null() { "exchange-wide".to_string() } else { format!("{}()", stringify_param(&method_name)) };
                let message = format!("{} {} option {} must be an integer", stringify_param(&self.id), label, stringify_param(&option_name));
                panic!("{}", crate::exchange_errors::create_error("BadRequest", message));
            }
        }
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
                crate::runtime::json_parse(&Value::Str(prepared.into()))
            }
            // Already a parsed object/array (some fixtures store the
            // response pre-parsed) — pass it through untouched.
            other => other,
        }
    }

    // `yymmdd()` / `yyyymmdd()` — date formatters.
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
        put("symbols", &Value::from(&self.symbols));
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
        put("orderbooks", &Value::from(&self.orderbooks));
        put("orders", &Value::from(&self.orders));
        put("trades", &Value::from(&self.trades));
        put("myTrades", &Value::from(&self.myTrades));
        put("positions", &Value::from(&self.positions));
        put("positionsByType", &Value::from(&self.positionsByType));
        put("tickers", &self.tickers);
        put("bidsasks", &self.bidsasks);
        put("ohlcvs", &Value::from(&self.ohlcvs));
        put("clients", &self.clients);
        put("balance", &self.balance);
        put("liquidations", &Value::from(&self.liquidations));
        put("myLiquidations", &Value::from(&self.myLiquidations));
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
        put("networkAliases", &self.networkAliases);
        put("MAX_VALUE", &self.MAX_VALUE);
        put("returnResponseHeaders", &self.returnResponseHeaders);
        put("httpExceptions", &self.httpExceptions);
        put("status", &self.status);
        put("userAgent", &self.userAgent);
        put("user_agent", &self.user_agent);
        put("userAgents", &self.userAgents);
        Value::Map(m)
    }

    pub fn base16ToBinary(&self, hex: Value, optional_args: &[Value]) -> crate::value::Bytes {
        self.base16_to_binary(hex, optional_args)
    }
    pub fn base58_to_binary(&self, s: Value, _optional_args: &[Value]) -> crate::value::Bytes {
        match &s {
            Value::Str(s) => crate::value::Bytes::of(&base58_decode(s).unwrap_or_default()),
            _ => crate::value::Bytes::default(),
        }
    }
    pub fn binary_to_base58(&self, b: impl Into<Value>, _optional_args: &[Value]) -> String {
        base58_encode(&crate::exchange::value_to_bytes(&b.into()))
    }
    pub fn binary_length(&self, b: impl Into<Value>, _optional_args: &[Value]) -> i64 {
        match b.into() {
            Value::Arr(a) => a.len() as i64,
            _ => 0,
        }
    }
    /// `isBinaryMessage` — in this port a binary buffer is a
    /// `Value::Array` of byte-valued ints (see `base16_to_binary`,
    /// `string_to_binary`). `instanceof Uint8Array` can't transpile.
    pub fn is_binary_message(&self, v: impl Into<Value>, _optional_args: &[Value]) -> Value {
        Value::Bool(is_byte_array(&v.into()))
    }
    /// `numberToBE(n, padding)` — big-endian byte array of width `padding`.
    pub fn number_to_be(&self, n: Value, optional_args: &[Value]) -> crate::value::Bytes {
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
        crate::value::Bytes::of(&out)
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
            self.yyyymmdd(ts, &[Value::Str(String::new().into())])
        } else {
            self.yyyymmdd(ts, optional_args)
        }
    }
    pub fn safe_float_n(&self, obj: impl crate::value::KeyRead, keys: Value, optional_args: &[Value]) -> Value {
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
    pub fn safe_float2(&self, obj: impl crate::value::KeyRead, k1: Value, k2: Value, optional_args: &[Value]) -> Value {
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
    pub fn binary_concat(&self, first: impl Into<Value>, optional_args: &[Value]) -> crate::value::Bytes {
        let mut out = crate::exchange::value_to_bytes(&first.into());
        for v in optional_args {
            out.extend(crate::exchange::value_to_bytes(v));
        }
        crate::value::Bytes::of(&out)
    }
    pub fn stringToBase64(&self, s: Value, optional_args: &[Value]) -> String {
        self.string_to_base64(s, optional_args)
    }
    /// `binaryToString(buffer)` — decodes a byte buffer as UTF-8.
    pub fn binary_to_string(&self, b: impl Into<Value>, _optional_args: &[Value]) -> String {
        let bytes = crate::exchange::value_to_bytes(&b.into());
        String::from_utf8_lossy(&bytes).into_owned()
    }
    pub fn string_to_binary(&self, s: Value, _optional_args: &[Value]) -> crate::value::Bytes {
        match s {
            Value::Str(s) => crate::value::Bytes::of(s.as_bytes()),
            _ => crate::value::Bytes::default(),
        }
    }
    /// `urlencodeBase64(payload)` — url-safe base64 with `+/` → `-_`
    /// and trailing `=` padding stripped. Accepts a string or a byte
    /// buffer (`Value::Array`).
    pub fn urlencode_base64(&self, v: impl Into<Value>, _optional_args: &[Value]) -> Value {
        // a string reads as its UTF-8 bytes, as `value_to_bytes` does for `Value::Str`
        let bytes = crate::exchange::value_to_bytes(&v.into());
        let encoded = self.binary_to_base64(bytes_to_value(&bytes), &[]);
        let trimmed = encoded.trim_end_matches('=');
        Value::Str(trimmed.replace('+', "-").replace('/', "_").into())
    }
    /// `urlencodeNested(object)` — `qs.stringify(object, { encodeValuesOnly: true })`:
    /// nested maps → `parent[child]`, arrays → `parent[index]`, only
    /// values are percent-encoded.
    pub fn urlencode_nested(&self, v: impl Into<Value>, _optional_args: &[Value]) -> String {
        let Value::Dict(m) = Into::<Value>::into(v) else {
            return String::new();
        };
        let mut pairs: Vec<String> = Vec::new();
        for (k, val) in m.iter() {
            urlencode_nested_walk(k, val, &mut pairs);
        }
        pairs.join("&")
    }
    pub fn is_json_encoded_object(&self, optional_args: &[Value]) -> bool {
        match optional_args.get(0) {
            Some(Value::Str(s)) => s.starts_with('{') || s.starts_with('['),
            _ => false,
        }
    }
    pub fn strip(&self, s: Value, _optional_args: &[Value]) -> Value {
        match s {
            Value::Str(s) => Value::Str(s.trim().to_string().into()),
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
        let timeframe = match &tf {
            Value::Str(timeframe) => timeframe.as_ref(),
            _ => "",
        };
        let unit = timeframe.chars().last().unwrap_or(' ');
        let amount = timeframe[..timeframe.len().saturating_sub(1)]
            .parse::<i64>()
            .unwrap_or(0);
        let secs = self.parse_timeframe(tf);
        let ms = secs * 1000;
        let t = match &ts {
            Value::Int(i) => *i,
            Value::Float(f) => *f as i64,
            _ => return ts,
        };
        if ms == 0 {
            return ts;
        }
        if ((unit == 'w') || (unit == 'M') || (unit == 'y')) && (amount >= 1) {
            let date = match Utc.timestamp_millis_opt(t).single() {
                Some(date) => date,
                None => return ts,
            };
            let mut rounded = date.date_naive().and_hms_opt(0, 0, 0).unwrap().and_utc();
            if unit == 'w' {
                let days_since_monday = date.weekday().num_days_from_monday() as i64;
                let monday = rounded - chrono::Duration::days(days_since_monday);
                let epoch_monday = Utc.with_ymd_and_hms(1970, 1, 5, 0, 0, 0).unwrap();
                let weeks_since_epoch_monday = (monday - epoch_monday).num_days() / 7;
                rounded = epoch_monday
                    + chrono::Duration::days(
                        weeks_since_epoch_monday.div_euclid(amount) * amount * 7,
                    );
                if matches!(&direction, Value::Int(d) if *d == crate::runtime::ROUND_UP) {
                    rounded = rounded + chrono::Duration::days(amount * 7);
                }
            } else if unit == 'M' {
                let months_since_year_zero = date.year() as i64 * 12 + date.month0() as i64;
                let rounded_months = months_since_year_zero.div_euclid(amount) * amount;
                let year = rounded_months.div_euclid(12) as i32;
                let month = (rounded_months.rem_euclid(12) + 1) as u32;
                rounded = Utc.with_ymd_and_hms(year, month, 1, 0, 0, 0).unwrap();
                if matches!(&direction, Value::Int(d) if *d == crate::runtime::ROUND_UP) {
                    rounded = rounded + chrono::Months::new(amount as u32);
                }
            } else {
                let year = (date.year() as i64).div_euclid(amount) * amount;
                rounded = Utc.with_ymd_and_hms(year as i32, 1, 1, 0, 0, 0).unwrap();
                if matches!(&direction, Value::Int(d) if *d == crate::runtime::ROUND_UP) {
                    rounded = rounded + chrono::Months::new((amount * 12) as u32);
                }
            }
            return Value::Int(rounded.timestamp_millis());
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
        let pk_s = match &pk {
            Value::Str(s) => s.trim_start_matches("0x").to_string(),
            _ => return Value::Str(String::new().into()),
        };
        let pk_bytes = match crate::exchange::hex_decode(&pk_s) {
            Some(b) => b,
            None => return Value::Str(String::new().into()),
        };
        let sk = match SigningKey::from_slice(&pk_bytes) {
            Ok(k) => k,
            Err(_) => return Value::Str(String::new().into()),
        };
        let point = sk.verifying_key().to_encoded_point(false); // 0x04 || X || Y
        let pubkey = &point.as_bytes()[1..]; // 64 bytes
        let hash = crate::exchange::hash_raw(pubkey, "keccak");
        Value::Str(format!("0x{}", crate::exchange::hex_encode(&hash[12..32])).into())
    }
    /// ensures the file path has a whitelisted extension, so users are safeguarded from arbitrary file access
    pub fn ensure_whitelisted_file(&self, p: &Value) {
        let path = match p {
            Value::Str(s) => s.to_string(),
            _ => panic!("invalid file path: {}", stringify_param(p)),
        };
        let exts = ["ccxtfile", "pem", "wasm"];
        if exts.iter().any(|ext| path.ends_with(&format!(".{}", ext))) {
            return;
        }
        panic!("invalid file path: {}", path);
    }
    pub fn exists_file(&self, p: Value) -> Value {
        self.ensure_whitelisted_file(&p);
        match &p {
            Value::Str(path) => Value::Bool(std::path::Path::new(path.as_ref()).is_file()),
            _ => Value::Bool(false),
        }
    }
    pub fn read_file(&self, p: Value) -> Value {
        self.ensure_whitelisted_file(&p);
        match &p {
            Value::Str(path) => match std::fs::read_to_string(path.as_ref()) {
                Ok(s) => Value::Str(s.into()),
                Err(_) => Value::Null,
            },
            _ => Value::Null,
        }
    }
    pub fn write_file(&self, p: Value, content: Value) -> Value {
        self.ensure_whitelisted_file(&p);
        let path = match &p {
            Value::Str(s) => s.to_string(),
            _ => return Value::Bool(false),
        };
        let body = match &content {
            Value::Str(s) => s.to_string(),
            other => stringify_param(other).into(),
        };
        Value::Bool(std::fs::write(&*path, body).is_ok())
    }
    pub fn get_temp_dir(&self) -> Value {
        Value::Str(format!(
            "{}/",
            std::env::temp_dir().to_string_lossy().trim_end_matches('/')
        ).into())
    }
    pub fn get_property(&self, obj: Value, key: Value) -> Value {
        crate::get_value(&obj, &Value::Str(stringify_param(&key).into()))
    }

    pub fn yymmdd(&self, ts: Value, optional_args: &[Value]) -> Value {
        let infix = match optional_args.get(0) {
            Some(Value::Str(s)) => s.clone(),
            _ => String::new().into(),
        };
        let n = match ts {
            Value::Int(n) => n,
            _ => 0,
        };
        let dt = chrono::DateTime::<chrono::Utc>::from_timestamp_millis(n);
        match dt {
            Some(t) => Value::Str(t.format(&format!("%y{i}%m{i}%d", i = infix)).to_string().into()),
            None => Value::Null,
        }
    }
    pub fn yyyymmdd(&self, ts: Value, optional_args: &[Value]) -> Value {
        // TS default infix for yyyymmdd is '-'.
        let infix = match optional_args.get(0) {
            Some(Value::Str(s)) => s.clone(),
            _ => "-".to_string().into(),
        };
        let n = match ts {
            Value::Int(n) => n,
            _ => 0,
        };
        let dt = chrono::DateTime::<chrono::Utc>::from_timestamp_millis(n);
        match dt {
            Some(t) => Value::Str(t.format(&format!("%Y{i}%m{i}%d", i = infix)).to_string().into()),
            None => Value::Null,
        }
    }
    /// `ymdhms(timestamp, infix=' ')` — UTC `YYYY-MM-DD<infix>HH:MM:SS`.
    pub fn ymdhms(&self, ts: Value, optional_args: &[Value]) -> Value {
        let infix = match optional_args.get(0) {
            Some(Value::Str(s)) => s.clone(),
            _ => " ".to_string().into(),
        };
        let n = match ts {
            Value::Int(n) => n,
            Value::Float(f) => f as i64,
            _ => 0,
        };
        let dt = chrono::DateTime::<chrono::Utc>::from_timestamp_millis(n);
        match dt {
            Some(t) => Value::Str(t.format(&format!("%Y-%m-%d{infix}%H:%M:%S")).to_string().into()),
            None => Value::Null,
        }
    }

    /// `rawencode(params, [doSeq])` — URL-encode without sorting.
    /// `rawencode(object)` — `qs.stringify(object, { encode: false })`:
    /// flat `key=value` pairs with no percent-encoding.
    pub fn rawencode(&self, params: impl Into<Value>, _optional_args: &[Value]) -> String {
        let Value::Dict(m) = Into::<Value>::into(params) else {
            return String::new();
        };
        let pairs: Vec<String> = m
            .iter()
            .map(|(k, v)| format!("{}={}", k, stringify_param(v)))
            .collect();
        pairs.join("&")
    }

    /// `intToBase16(n)` — int → lowercase hex string.
    pub fn int_to_base16(&self, n: Value, _optional_args: &[Value]) -> String {
        let v = match n {
            Value::Int(n) => n as u64,
            Value::Float(f) => f as u64,
            Value::Str(s) => s.parse::<u64>().unwrap_or(0),
            _ => 0,
        };
        format!("{:x}", v)
    }

    /// `packb(action)` — MessagePack pack stub. Hyperliquid signs the
    /// packed bytes of an action. Returning empty bytes here is enough
    /// to make the call compile; live signing won't be correct.
    /// `packb(value)` — MessagePack-encode a Value into a byte array.
    pub fn packb(&self, action: Value, _optional_args: &[Value]) -> Value {
        // Narrowest-form MessagePack: non-negative ints as uint, negative as int, floats as f64.
        fn head(buf: &mut Vec<u8>, fix: u8, fix_max: u64, tags: [u8; 4], n: u64) {
            match n {
                n if n <= fix_max => buf.push(fix | n as u8),
                n if n <= 0xff && tags[0] != 0 => buf.extend([tags[0], n as u8]),
                n if n <= 0xffff => { buf.push(tags[1]); buf.extend((n as u16).to_be_bytes()) }
                n if n <= 0xffff_ffff => { buf.push(tags[2]); buf.extend((n as u32).to_be_bytes()) }
                n => { buf.push(tags[3]); buf.extend(n.to_be_bytes()) }
            }
        }
        fn enc(buf: &mut Vec<u8>, v: &Value) {
            match v {
                Value::Null => buf.push(0xc0),
                Value::Bool(b) => buf.push(0xc2 | *b as u8),
                Value::Int(i) if *i >= 0 => head(buf, 0x00, 0x7f, [0xcc, 0xcd, 0xce, 0xcf], *i as u64),
                Value::Int(i) if *i >= -32 => buf.push(*i as u8),
                Value::Int(i) if *i >= -128 => buf.extend([0xd0, *i as u8]),
                Value::Int(i) if *i >= -32768 => { buf.push(0xd1); buf.extend((*i as i16).to_be_bytes()) }
                Value::Int(i) if *i >= i32::MIN as i64 => { buf.push(0xd2); buf.extend((*i as i32).to_be_bytes()) }
                Value::Int(i) => { buf.push(0xd3); buf.extend(i.to_be_bytes()) }
                Value::Float(f) => { buf.push(0xcb); buf.extend(f.to_be_bytes()) }
                Value::Str(s) => { head(buf, 0xa0, 31, [0xd9, 0xda, 0xdb, 0xdb], s.len() as u64); buf.extend(s.as_bytes()) }
                Value::Arr(a) => { head(buf, 0x90, 15, [0, 0xdc, 0xdd, 0xdd], a.len() as u64); a.iter().for_each(|x| enc(buf, x)) }
                Value::Dict(m) => {
                    head(buf, 0x80, 15, [0, 0xde, 0xdf, 0xdf], m.len() as u64);
                    m.iter().for_each(|(k, x)| { enc(buf, &Value::Str(k.clone().into())); enc(buf, x) })
                }
            }
        }
        let mut buf: Vec<u8> = Vec::new();
        enc(&mut buf, &action);
        Value::Array(buf.iter().map(|b| Value::Int(*b as i64)).collect())
    }

    /// `ethEncodeStructuredData(domain, types, message)` — EIP-712
    /// encoding: returns the `\x19\x01 || domainSeparator || structHash`
    /// preimage that the caller keccak-hashes before signing.
    /// Returns the typed byte handle (TS `Uint8Array`); `Value::from` boxes it to the same list as before.
    pub fn eth_encode_structured_data(&self, domain: Value, types: Value, message: Value) -> crate::value::Bytes {
        let bytes = crate::exchange::eip712_encode(&domain, &types, &message);
        crate::value::Bytes::of(&bytes)
    }

    /// `uuid22()` — pseudo-random 22-char hex id.
    pub fn uuid22(&self, _optional_args: &[Value]) -> String {
        random_hex(22)
    }
    /// `uuid16()` — pseudo-random 16-char hex id.
    pub fn uuid16(&self, _optional_args: &[Value]) -> String {
        random_hex(16)
    }
    /// `uuid()` — pseudo-random UUID v4: `xxxxxxxx-xxxx-4xxx-[89ab]xxx-xxxxxxxxxxxx`.
    pub fn uuid(&self, _optional_args: &[Value]) -> String {
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
        s
    }

    /// `urlencode(params)` — wraps the typed `urlencode_kv` for Value args.
    pub fn urlencode(&self, params: impl Into<Value>, _optional_args: &[Value]) -> String {
        self.urlencode_kv(&params.into())
    }

    /// `json(value)` — JSON-stringify.
    pub fn json(&self, v: Value) -> Value {
        Value::Str(self.json_str(&v).into())
    }

    /// `encode(s)` — UTF-8 encode string to bytes (as Value::Array of ints).
    pub fn encode(&self, s: Value) -> crate::value::Bytes {
        match s {
            Value::Str(s) => crate::value::Bytes::of(s.as_bytes()),
            _ => crate::value::Bytes::default(),
        }
    }

    /// `decode(bytes)` — decode bytes to a UTF-8 string.
    pub fn decode(&self, b: impl Into<Value>) -> Value {
        match b.into() {
            Value::Str(s) => Value::Str(s),
            Value::Arr(a) => {
                let bytes: Vec<u8> = a
                    .iter()
                    .filter_map(|v| match v {
                        Value::Int(n) => Some(*n as u8),
                        _ => None,
                    })
                    .collect();
                Value::Str(String::from_utf8_lossy(&bytes).into_owned().into())
            }
            _ => Value::Str(String::new().into()),
        }
    }

    /// `log(msg)` — debug print.
    pub fn log(&self, msg: Value) {
        if matches!(self.verbose, Value::Bool(true)) {
            println!("[ccxt] {}", crate::runtime::stringify_param(&msg));
        }
    }

    // Dynamic dispatch for the implicit API (`public_get_exchange_info`, …)
    // now lives in the `ExchangeRuntime::call_method` trait method (review #1),
    // routing through `implicit_api_call` → `request_typed` → `fetch_typed`.

    // ── string / number formatting ──────────────────────────────────────────

    pub fn number_to_string(&self, n: Value) -> Option<String> {
        // TS `numberToString(undefined)` returns undefined — don't
        // stringify a missing value into the literal "null".
        if matches!(n, Value::Null) {
            return None;
        }
        Some(stringify_param(&n))
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

    pub fn parse_timeframe(&self, tf: Value) -> i64 {
        let s = stringify_param(&tf);
        let last = s.chars().last().unwrap_or('m');
        let num: i64 = s[..s.len().saturating_sub(1)].parse().unwrap_or(0);
        match last {
            's' => num,
            'm' => num * 60,
            'h' => num * 3600,
            'd' => num * 86400,
            'w' => num * 604800,
            'M' => num * 2592000,
            'y' => num * 31536000,
            _ => 0,
        }
    }

    /// `precisionFromString(str)` — ports `functions/number.ts`.
    /// Scientific notation (`1e-4` → 4, `1e4` → -4); otherwise the
    /// number of fractional digits after stripping trailing zeros.
    pub fn precision_from_string(&self, s: Value) -> i64 {
        let s = stringify_param(&s);
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
            _ => return Value::Str(n_s.into()),
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
        ).into())
    }

    pub fn capitalize(&self, s: Value) -> String {
        let s = stringify_param(&s);
        let mut c = s.chars();
        match c.next() {
            None => String::new(),
            Some(f) => f.to_uppercase().chain(c).collect(),
        }
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
        Value::Array(s.chars().map(|c| Value::Str(c.to_string().into())).collect())
    }

    pub fn string_to_base64(&self, s: Value, _optional_args: &[Value]) -> String {
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
                    out.push(Value::Str(name.into()));
                }
            }
        }
        Value::Array(out)
    }

    // ── async lifecycle stubs ───────────────────────────────────────────────

    // Minimal port of TS `loadMarketsHelper`:
    //   1. Return the cached `markets` if already populated and not
    //      forcing a reload.
    //   2. If `has.fetchCurrencies === true`, dispatch `fetch_currencies`
    //      first — passing the result into `set_markets` avoids the
    //      O(N²) "synthesize from markets" branch (cloning the
    //      grouped-by-code Map inside an outer loop).
    //   3. Dispatch `fetch_markets` to the derived exchange.
    //   4. `set_markets(markets, currencies)` populates `markets`,
    //      `markets_by_id`, `symbols`, `ids`, and merges currencies.
    // Returns cached markets on hit; otherwise fetches markets (and
    // currencies when supported) and pushes everything through
    // `set_markets`. The built-in synthesize branch of `set_markets` is
    // O(N) per code with full Map clones —
    // for binance (~4k markets, ~1k unique codes) that grew to minutes
    // and looked like a hang. `load_markets_fast_synthesize_currencies`
    // below short-circuits when currencies are empty by synthesizing
    // them here in idiomatic Rust (HashMap-direct, no Value cloning of
    // the whole grouped map per code).

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
    /// refills back to zero. The bucket is owned by one task, so concurrent calls
    /// on one instance serialize by queuing there (the TS single queue).
    /// A no-op when `enableRateLimit` is false or the rate is effectively
    /// unlimited.
    pub async fn throttle(&self, cost: &[Value]) -> Value {
        if !matches!(self.enableRateLimit, Value::Bool(true)) {
            return Value::Null;
        }
        let tb = |key: &str| -> Option<f64> {
            crate::get_value(&self.tokenBucket, &Value::Str(key.to_string().into())).as_f64()
        };
        let rate_limit = self.rateLimit.as_f64().unwrap_or(0.0);
        let refill_rate = tb("refillRate").unwrap_or_else(|| {
            if rate_limit > 0.0 {
                1.0 / rate_limit
            } else {
                f64::MAX
            }
        });
        if !(refill_rate.is_finite() && refill_rate > 0.0) {
            return Value::Null; // effectively unlimited
        }
        let capacity = tb("capacity").unwrap_or(1.0);
        let delay_ms = tb("delay").unwrap_or(0.001) * 1000.0;
        let this_cost = cost
            .first()
            .and_then(|v| v.as_f64())
            .unwrap_or_else(|| tb("cost").unwrap_or(1.0));

        self.internals.throttle.wait(refill_rate, capacity, delay_ms, this_cost).await;
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
pub(crate) fn synthesize_currencies_from_markets(markets: &Value, precision_mode: &Value) -> Value {
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
        let market_precision = crate::get_value(market, &Value::Str("precision".into()));
        // base side
        for (id_key, code_key, prec_keys) in [
            ("baseId", "base", ["base", "amount"]),
            ("quoteId", "quote", ["quote", "price"]),
        ] {
            let code = crate::get_value(market, &Value::Str(code_key.to_string().into()));
            let code_s = match &code {
                Value::Str(s) if !s.is_empty() => s.clone(),
                _ => continue,
            };
            let id = crate::get_value(market, &Value::Str(id_key.to_string().into()));
            let id_v = match &id {
                Value::Null => Value::Str(code_s.clone()),
                other => other.clone(),
            };
            let mut precision =
                crate::get_value(&market_precision, &Value::Str(prec_keys[0].to_string().into()));
            if matches!(precision, Value::Null) {
                precision =
                    crate::get_value(&market_precision, &Value::Str(prec_keys[1].to_string().into()));
            }
            if matches!(precision, Value::Null) {
                precision = default_precision.clone();
            }
            let entry = by_code.entry(code_s.to_string()).or_insert_with(|| {
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

#[cfg(test)]
mod built_list_sort_parity_tests {
    // ral-xf: `x = self.sort_by(Value::Arr(x), ..).into_list()` on a native list against the boxed
    // `x = self.sort_by(x, ..)`: same order, and an Arr input always answers a `Value::Arr`.
    use super::*;

    fn rows() -> Vec<Value> {
        let mut out = Vec::new();
        for (ts, id) in [(3, "c"), (1, "a"), (2, "b"), (1, "z")] {
            let mut m = HashMap::new();
            m.insert("timestamp".to_string(), Value::Int(ts));
            m.insert("id".to_string(), Value::Str(id.into()));
            out.push(Value::Dict(Arc::new(m)));
        }
        out.push(Value::Null);
        out
    }

    #[test]
    fn native_list_sort_matches_boxed_sort() {
        let ex = Exchange::default();
        let sort: fn(&Exchange, Value, Value, &[Value]) -> Value = Exchange::sort_by;
        let sort2: fn(&Exchange, Value, Value, Value, &[Value]) -> Value = Exchange::sort_by2;
        for desc in [false, true] {
            let native: crate::value::List = Arc::new(rows());
            let native = sort(&ex, Value::Arr(native), Value::Str("timestamp".into()), &[Value::Bool(desc)]).into_list();
            assert_eq!(Value::Arr(native), sort(&ex, Value::Array(rows()), Value::Str("timestamp".into()), &[Value::Bool(desc)]));
            let native2: crate::value::List = Arc::new(rows());
            let native2 = sort2(&ex, Value::Arr(native2), Value::Str("timestamp".into()), Value::Str("id".into()), &[Value::Bool(desc)]).into_list();
            assert_eq!(Value::Arr(native2), sort2(&ex, Value::Array(rows()), Value::Str("timestamp".into()), Value::Str("id".into()), &[Value::Bool(desc)]));
        }
    }
}

#[cfg(test)]
mod spawn_queue_tests {
    use super::*;

    // `delay(ms, method, …)` schedules a coroutine on a real deadline —
    // binance's `keepAliveListenKey` re-arms itself every 20 min this way.
    // Regression cover for the original stub, which elided `ms` entirely and
    // ran the coroutine on the next inbound frame instead.
    #[test]
    fn delayed_spawns_wait_for_their_deadline() {
        // Not yet due: held back, and reported as the next deadline.
        enqueue_spawn_after("keep_alive_listen_key", vec![], 10_000);
        assert!(drain_spawn_queue().is_empty(), "not due yet");
        let due_in = next_spawn_due().expect("a deadline is pending");
        assert!(due_in > std::time::Duration::from_secs(9));

        // An undelayed spawn still runs on the next drain, and does not
        // disturb the queued deadline.
        enqueue_spawn("handle_order_book_snapshot", vec![]);
        let batch = drain_spawn_queue();
        assert_eq!(batch.len(), 1);
        assert_eq!(batch[0].0, "handle_order_book_snapshot");
        assert!(
            next_spawn_due().is_some(),
            "the delayed item is still queued"
        );
    }

    #[test]
    fn spawns_run_once_their_deadline_passes() {
        enqueue_spawn_after("keep_alive_listen_key", vec![], 1);
        std::thread::sleep(std::time::Duration::from_millis(5));
        assert_eq!(next_spawn_due(), Some(std::time::Duration::ZERO));
        let batch = drain_spawn_queue();
        assert_eq!(batch.len(), 1);
        assert_eq!(batch[0].0, "keep_alive_listen_key");
        assert!(next_spawn_due().is_none(), "queue drained");
    }
}

#[cfg(test)]
mod eth_encode_structured_data_bytes_tests {
    // ral-44e: `eth_encode_structured_data` returns the typed `Bytes` handle; boxing it gives exactly the
    // `Value::Arr` of byte ints the old `-> Value` stub returned, and the same 0x1901-prefixed preimage.
    use super::*;

    fn entry(name: &'static str, ty: &'static str) -> Value {
        let mut m = HashMap::new();
        m.insert("name".to_string(), Value::Str(name.into()));
        m.insert("type".to_string(), Value::Str(ty.into()));
        Value::Dict(Arc::new(m))
    }

    fn inputs() -> (Value, Value, Value) {
        let mut domain = HashMap::new();
        domain.insert("name".to_string(), Value::Str("ccxt".into()));
        domain.insert("chainId".to_string(), Value::Int(1));
        let mut types = HashMap::new();
        types.insert("Mail".to_string(), Value::Array(vec![entry("contents", "string"), entry("nonce", "uint256")]));
        let mut message = HashMap::new();
        message.insert("contents".to_string(), Value::Str("hello".into()));
        message.insert("nonce".to_string(), Value::Int(7));
        (Value::Dict(Arc::new(domain)), Value::Dict(Arc::new(types)), Value::Dict(Arc::new(message)))
    }

    #[test]
    fn bytes_box_to_the_old_value_list() {
        let ex = Exchange::default();
        let (d, t, m) = inputs();
        let raw = crate::exchange::eip712_encode(&d, &t, &m);
        let old = Value::Array(raw.iter().map(|b| Value::Int(*b as i64)).collect());
        let (d, t, m) = inputs();
        let typed: crate::value::Bytes = ex.eth_encode_structured_data(d, t, m);
        assert_eq!(typed.0.len(), 66);
        assert_eq!(typed.0[0], Value::Int(0x19));
        assert_eq!(typed.0[1], Value::Int(0x01));
        assert_eq!(Value::from(&typed), old);
        assert_eq!(Value::from(typed), old);
    }
}

#[cfg(test)]
mod cased_reader_opt_twin_tests {
    // ral-65o: every `safe_string_{lower,upper}{,2,_n}_opt` twin equals its boxed reader followed by
    // `.as_str().map(str::to_owned)` (the long form it replaces in generated Rust), over found strings,
    // numbers, booleans, missing keys, string / non-string / mixed-case defaults.
    use super::*;

    fn row() -> Value {
        let mut m = HashMap::new();
        m.insert("s".to_string(), Value::Str("MiXed".into()));
        m.insert("n".to_string(), Value::Int(42));
        m.insert("f".to_string(), Value::Float(1.5));
        m.insert("b".to_string(), Value::Bool(true));
        m.insert("e".to_string(), Value::Str("".into()));
        Value::Dict(Arc::new(m))
    }

    const KEYS: [&'static str; 6] = ["s", "n", "f", "b", "e", "missing"];

    fn key(k: &'static str) -> Value {
        Value::Str(k.into())
    }

    fn keys() -> Vec<Value> {
        let mut out = Vec::new();
        for k in KEYS {
            out.push(key(k));
        }
        out
    }

    fn three(a: &'static str, b: &'static str) -> Value {
        Value::Array(vec![key(a), key(b), key("s")])
    }

    fn defaults() -> Vec<Vec<Value>> {
        vec![vec![], vec![Value::Null], vec![Value::Str("DefAult".into())], vec![Value::Int(7)]]
    }

    fn long(v: Value) -> Option<String> {
        v.as_str().map(str::to_owned)
    }

    #[test]
    fn one_key_twins_match_the_long_form() {
        let ex = Exchange::default();
        for k in KEYS {
            for d in defaults() {
                assert_eq!(ex.safe_string_lower_opt(row(), key(k), &d), long(ex.safe_string_lower(row(), key(k), &d)));
                assert_eq!(ex.safe_string_upper_opt(row(), key(k), &d), long(ex.safe_string_upper(row(), key(k), &d)));
                assert_eq!(ex.safe_string_lower_k_opt(row(), k, &d), long(ex.safe_string_lower_k(row(), k, &d)));
                assert_eq!(ex.safe_string_upper_k_opt(row(), k, &d), long(ex.safe_string_upper_k(row(), k, &d)));
            }
        }
        assert_eq!(ex.safe_string_lower_opt(row(), Value::Str("s".into()), &[]), Some("mixed".to_string()));
        assert_eq!(ex.safe_string_upper_opt(row(), Value::Str("missing".into()), &[Value::Str("DefAult".into())]), Some("DefAult".to_string()));
    }

    #[test]
    fn two_key_and_n_key_twins_match_the_long_form() {
        let ex = Exchange::default();
        for a in KEYS {
            for b in KEYS {
                for d in defaults() {
                    assert_eq!(ex.safe_string_lower2_opt(row(), key(a), key(b), &d), long(ex.safe_string_lower2(row(), key(a), key(b), &d)));
                    assert_eq!(ex.safe_string_upper2_opt(row(), key(a), key(b), &d), long(ex.safe_string_upper2(row(), key(a), key(b), &d)));
                    assert_eq!(ex.safe_string_lower_n_opt(row(), three(a, b), &d), long(ex.safe_string_lower_n(row(), three(a, b), &d)));
                    assert_eq!(ex.safe_string_upper_n_opt(row(), three(a, b), &d), long(ex.safe_string_upper_n(row(), three(a, b), &d)));
                }
            }
        }
        assert_eq!(ex.safe_string_upper2_opt(row(), Value::Str("missing".into()), Value::Str("n".into()), &[]), Some("42".to_string()));
        assert_eq!(ex.safe_string_lower_n_opt(Value::Null, Value::Array(keys()), &[Value::Int(1)]), None);
    }
}

#[cfg(test)]
mod packb_tests {
    use crate::exchange::Exchange;
    use crate::Value;
    use sha2::{Digest, Sha256};

    fn packb_bytes(v: Value) -> Vec<u8> {
        match Exchange::new(None).packb(v, &[]) {
            Value::Arr(a) => a.iter().map(|b| match b { Value::Int(i) => *i as u8, _ => panic!("non-int byte") }).collect(),
            other => panic!("packb returned {:?}", other),
        }
    }
    fn hex(b: &[u8]) -> String { b.iter().map(|x| format!("{:02x}", x)).collect() }
    fn pack_json(j: &str) -> String { hex(&packb_bytes(Value::from_json(&serde_json::from_str(j).unwrap()))) }

    // (json input, expected hex): the shared TS vectors, all byte-identical in Rust.
    const VECTORS: &[(&str, &str)] = &[
        ("null", "c0"),
        ("true", "c3"),
        ("false", "c2"),
        ("0", "00"),
        ("1", "01"),
        ("127", "7f"),
        ("128", "cc80"),
        ("255", "ccff"),
        ("256", "cd0100"),
        ("65535", "cdffff"),
        ("65536", "ce00010000"),
        ("4294967295", "ceffffffff"),
        ("4294967296", "cf0000000100000000"),
        ("1700000000000", "cf0000018bcfe56800"),
        ("9007199254740991", "cf001fffffffffffff"),
        ("-1", "ff"),
        ("-32", "e0"),
        ("-33", "d0df"),
        ("-128", "d080"),
        ("-129", "d1ff7f"),
        ("-32768", "d18000"),
        ("-32769", "d2ffff7fff"),
        ("-2147483648", "d280000000"),
        ("-2147483649", "d3ffffffff7fffffff"),
        ("-1700000000000", "d3fffffe74301a9800"),
        ("1.5", "cb3ff8000000000000"),
        ("0.1", "cb3fb999999999999a"),
        ("-2.25", "cbc002000000000000"),
        ("\"\"", "a0"),
        ("\"a\"", "a161"),
        ("\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\"", "bf61616161616161616161616161616161616161616161616161616161616161"),
        ("\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\"", "d9206161616161616161616161616161616161616161616161616161616161616161"),
        ("\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\"", "d9ff616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161"),
        ("\"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\"", "da010061616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161616161"),
        ("\"héllo €𝄞\"", "ae68c3a96c6c6f20e282acf09d849e"),
        ("[]", "90"),
        ("[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14]", "9f000102030405060708090a0b0c0d0e"),
        ("[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]", "dc0010000102030405060708090a0b0c0d0e0f"),
        ("{}", "80"),
        ("{\"k0\":0,\"k1\":1,\"k2\":2,\"k3\":3,\"k4\":4,\"k5\":5,\"k6\":6,\"k7\":7,\"k8\":8,\"k9\":9,\"k10\":10,\"k11\":11,\"k12\":12,\"k13\":13,\"k14\":14}", "8fa26b3000a26b3101a26b3202a26b3303a26b3404a26b3505a26b3606a26b3707a26b3808a26b3909a36b31300aa36b31310ba36b31320ca36b31330da36b31340e"),
        ("{\"k0\":0,\"k1\":1,\"k2\":2,\"k3\":3,\"k4\":4,\"k5\":5,\"k6\":6,\"k7\":7,\"k8\":8,\"k9\":9,\"k10\":10,\"k11\":11,\"k12\":12,\"k13\":13,\"k14\":14,\"k15\":15}", "de0010a26b3000a26b3101a26b3202a26b3303a26b3404a26b3505a26b3606a26b3707a26b3808a26b3909a36b31300aa36b31310ba36b31320ca36b31330da36b31340ea36b31350f"),
        ("{\"a\":[1,{\"b\":null,\"c\":[true,\"x\"]}],\"d\":{}}", "82a161920182a162c0a16392c3a178a16480"),
        ("{\"type\":\"order\",\"orders\":[{\"a\":4,\"b\":true,\"p\":\"1100.5\",\"s\":\"0.2\",\"r\":false,\"t\":{\"limit\":{\"tif\":\"Gtc\"}},\"c\":\"0x1234567890abcdef1234567890abcdef\"}],\"grouping\":\"na\",\"builder\":{\"b\":\"0x6530512a6c89c7cfcebc3ba7fcd9ada5f30827a6\",\"f\":10}}", "84a474797065a56f72646572a66f72646572739187a16104a162c3a170a6313130302e35a173a3302e32a172c2a17481a56c696d697481a3746966a3477463a163d92230783132333435363738393061626364656631323334353637383930616263646566a867726f7570696e67a26e61a76275696c64657282a162d92a307836353330353132613663383963376366636562633362613766636439616461356633303832376136a1660a"),
        ("{\"type\":\"order\",\"orders\":[{\"a\":10005,\"b\":false,\"p\":\"0\",\"s\":\"1\",\"r\":true,\"t\":{\"trigger\":{\"isMarket\":true,\"triggerPx\":\"1900\",\"tpsl\":\"sl\"}}}],\"grouping\":\"normalTpsl\"}", "83a474797065a56f72646572a66f72646572739186a161cd2715a162c2a170a130a173a131a172c3a17481a77472696767657283a869734d61726b6574c3a9747269676765725078a431393030a47470736ca2736ca867726f7570696e67aa6e6f726d616c5470736c"),
        ("{\"type\":\"cancel\",\"cancels\":[{\"a\":0,\"o\":123456789012}]}", "82a474797065a663616e63656ca763616e63656c739182a16100a16fcf0000001cbe991a14"),
        ("{\"type\":\"cancelByCloid\",\"cancels\":[{\"asset\":3,\"cloid\":\"0x1234567890abcdef1234567890abcdef\"}]}", "82a474797065ad63616e63656c4279436c6f6964a763616e63656c739182a5617373657403a5636c6f6964d92230783132333435363738393061626364656631323334353637383930616263646566"),
        ("{\"type\":\"batchModify\",\"modifies\":[{\"oid\":70000,\"order\":{\"a\":1,\"b\":true,\"p\":\"2000\",\"s\":\"0.01\",\"r\":false,\"t\":{\"limit\":{\"tif\":\"Alo\"}}}}]}", "82a474797065ab62617463684d6f64696679a86d6f6469666965739182a36f6964ce00011170a56f7264657286a16101a162c3a170a432303030a173a4302e3031a172c2a17481a56c696d697481a3746966a3416c6f"),
        ("{\"type\":\"updateLeverage\",\"asset\":1,\"isCross\":true,\"leverage\":20}", "84a474797065ae7570646174654c65766572616765a5617373657401a7697343726f7373c3a86c6576657261676514"),
        ("{\"type\":\"updateIsolatedMargin\",\"asset\":1,\"isBuy\":true,\"ntli\":-5000000}", "84a474797065b475706461746549736f6c617465644d617267696ea5617373657401a56973427579c3a46e746c69d2ffb3b4c0"),
        ("{\"type\":\"vaultTransfer\",\"vaultAddress\":\"0xdfc24b077bc1425ad1dea75bcb6f8158e10df303\",\"isDeposit\":true,\"usd\":5000000}", "84a474797065ad7661756c745472616e73666572ac7661756c7441646472657373d92a307864666332346230373762633134323561643164656137356263623666383135386531306466333033a969734465706f736974c3a3757364ce004c4b40"),
        ("{\"type\":\"scheduleCancel\",\"time\":1700000000000}", "82a474797065ae7363686564756c6543616e63656ca474696d65cf0000018bcfe56800"),
        ("{\"type\":\"twapOrder\",\"twap\":{\"a\":0,\"b\":true,\"s\":\"1\",\"r\":false,\"m\":30,\"t\":false}}", "82a474797065a9747761704f72646572a47477617086a16100a162c3a173a131a172c2a16d1ea174c2"),
        ("[\"op\",1,\"0xabc\",[1700000000000,\"x\"],null,false]", "96a26f7001a5307861626392cf0000018bcfe56800a178c0c2"),
    ];

    #[test]
    fn packb_matches_vectors() {
        for (j, h) in VECTORS {
            assert_eq!(pack_json(j), *h, "input {}", j);
        }
    }

    #[test]
    fn packb_long_str_and_array() {
        for (kind, n, len, head, sha) in [
        ("str", 65535, 65538, "daffff616161", "ae606c3d6aaca8b43b24feb4aae3e5ab4088edb6d99d254d366f00e08f287c3d"),
        ("str", 65536, 65541, "db0001000061", "5f97d047d40a13f57389f8c7817f5afd69fe1e7739a305850eb23c5adb54674a"),
        ("array", 65535, 196224, "dcffff000102", "8c336eb0f76e5433623ce52adf0fa4704a7410cacd206d5442c835b7bd294f04"),
        ("array", 65536, 196229, "dd0001000000", "659da62605120aecab3feb7ceb9f912947719200e22ea46c7705c99cb10cacfa"),
        ] {
            let v = if kind == "str" { Value::Str("a".repeat(n).into()) } else { Value::Array((0..n as i64).map(Value::Int).collect()) };
            let b = packb_bytes(v);
            assert_eq!((b.len(), &hex(&b)[..12]), (len, head), "{} {}", kind, n);
            assert_eq!(hex(&Sha256::digest(&b)), sha, "{} {}", kind, n);
        }
    }

    #[test]
    fn packb_edges_beyond_vectors() {
        let one = |v: Value| hex(&packb_bytes(v));
        assert_eq!(one(Value::Int(i64::MAX)), "cf7fffffffffffffff");
        assert_eq!(one(Value::Int(i64::MIN)), "d38000000000000000");
        assert_eq!(one(Value::Int(2147483647)), "ce7fffffff");
        assert_eq!(one(Value::Int(-31)), "e1");
        assert_eq!(one(Value::Float(-0.0)), "cb8000000000000000");
        assert_eq!(one(Value::Float(3.0)), "cb4008000000000000");
        assert_eq!(one(Value::Str("\u{e9}".repeat(16).into())), format!("d920{}", "c3a9".repeat(16)));
        assert_eq!(&one(Value::Str("\u{20ac}".repeat(85).into()))[..4], "d9ff");
        assert_eq!(&one(Value::Str("\u{e9}".repeat(128).into()))[..6], "da0100");
        let m16: Value = Value::from_json(&serde_json::from_str(&format!("{{{}}}", (0..65536).map(|i| format!("\"{}\":0", i)).collect::<Vec<_>>().join(","))).unwrap());
        assert_eq!(&one(m16)[..10], "df00010000");
    }
}

#[cfg(test)]
mod random_tests {
    use super::*;

    #[test]
    fn random_bytes_is_lowercase_hex_of_requested_length() {
        let ex = Exchange::new(None);
        let a = ex.random_bytes(Value::Int(32));
        let b = ex.random_bytes(Value::Int(32));
        assert_eq!(a.len(), 64);
        assert!(a.bytes().all(|c| matches!(c, b'0'..=b'9' | b'a'..=b'f')), "{a}");
        assert_ne!(a, b, "two calls differ");
        assert_eq!(ex.random_bytes(Value::Int(0)), "");
    }

    #[test]
    fn rand_number_has_requested_digit_count() {
        let ex = Exchange::new(None);
        let mut seen = std::collections::HashSet::new();
        for _ in 0..20 {
            let v = ex.rand_number(Value::Int(12));
            assert!((0..1_000_000_000_000).contains(&v), "{v}");
            seen.insert(v);
        }
        assert!(seen.len() > 1, "two calls differ");
        assert_eq!(ex.rand_number(Value::Int(0)), 0);
    }
}
