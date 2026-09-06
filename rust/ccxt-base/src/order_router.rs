// Native Rust — hand-written client for the CCXT order-router service.
//
// This is the SIXTH port of a class that is hand-written, not transpiled: the
// TypeScript reference lives in `ts/src/base/OrderRouter.ts`, and Python, PHP,
// C# and Go carry line-for-line siblings. They are held together by one shared
// fixture, `ts/src/test/base/fixtures/orderRouter.json`, which every port runs.
// A change to any of them that this port does not match fails that fixture, in
// this language, which is the entire point of writing it out again rather than
// generating it.
//
// Two things about Rust make the port read differently from its siblings while
// meaning the same thing, and both are load-bearing:
//
//   * The other five pass dictionaries of `any`. Here that is `Value`, which is
//     the same shape (`Value::Dict(Arc<IndexMap<String, Value>>)`) — so the
//     accessors below are genuine equivalents of `numberAt`/`stringAt`/… and
//     not a re-design.
//   * The other five throw. Here the fallible methods return
//     `Result<_, ExchangeError>`. `ExchangeError::kind` carries the same class
//     names the other ports throw, so `is("NetworkError")` answers the same
//     question `isOutcomeUnknownError` asks there.

use std::collections::BTreeSet;
use std::sync::Arc;

use crate::error::ExchangeError;
use crate::value::{HashMap, Value};

/// Result of a fallible router operation. The error's `kind` matches the
/// exception class the other five ports raise for the same condition.
pub type RouterResult<T> = std::result::Result<T, ExchangeError>;

fn arguments_required(message: &str) -> ExchangeError {
    ExchangeError::new("ArgumentsRequired", message)
}

fn bad_request(message: &str) -> ExchangeError {
    ExchangeError::new("BadRequest", message)
}

fn exchange_error(message: &str) -> ExchangeError {
    ExchangeError::new("ExchangeError", message)
}

fn insufficient_funds(message: &str) -> ExchangeError {
    ExchangeError::new("InsufficientFunds", message)
}

/// NO_CAP is the default: this class does not decide how much of your money you
/// may trade. `maxNotionalUsd` is an OPT-IN guardrail — set it and it is honoured
/// exactly, at whatever value you choose; leave it unset and no notional check
/// runs at all.
///
/// It used to be a hard 25 USD ceiling that could be lowered but never raised.
/// That number came from CLAUDE.md §5.5, which governs THIS REPOSITORY'S live
/// tests against real exchanges — not the people using the library. A client that
/// refuses a 30 USD order because its own test suite is cautious is broken as a
/// product.
pub const NO_CAP: f64 = 0.0;
/// Default distance from the expected price at which the limit is placed.
pub const DEFAULT_SLIPPAGE_BPS: f64 = 25.0;
/// Default shortfall ratio at which `reconcile_execution_step` halts.
pub const DEFAULT_RECONCILE_TOLERANCE: f64 = 0.02;
/// The float-equality epsilon this class compares with. Not a business
/// tolerance — that is DEFAULT_RECONCILE_TOLERANCE. This one exists so that
/// "the fill matches the request" and "the value sits on the precision grid"
/// survive the last bits of floating-point arithmetic, and it must be the same
/// number in all six ports or a violation fires in one language and not another.
pub const TOLERANCE: f64 = 1e-9;
const DEFAULT_BASE_URL: &str = "https://docs.ccxt.com/router/api";

/// Human-readable text for each safety violation code. Carried in the violation
/// record itself so a caller logging one does not have to keep its own copy of
/// this table — and so all six ports emit the same sentence for the same code.
fn violation_message(code: &str) -> &'static str {
    match code {
        "empty_plan" => "the plan contains no steps",
        "route_unroutable" => "the route carries an unroutableReason and must not be executed",
        "partial_fill" => "the route does not fill completely at the requested size",
        "unknown_symbol" => "the symbol is not listed on that venue",
        "market_mismatch" => "the venue market trades a different pair than the route hop says it does",
        "invalid_step" => "the step has a non-positive amount or price, or a side that is neither buy nor sell",
        "amount_below_minimum" => "the amount is below the market minimum",
        "amount_above_maximum" => "the amount is above the market maximum",
        "cost_below_minimum" => "the notional is below the market minimum cost",
        "price_out_of_range" => "the limit price falls outside the market price limits",
        "notional_unvaluable" => "the step cannot be valued in USD, so the notional cap cannot be enforced",
        "notional_exceeds_cap" => "the notional exceeds the per-trade USD cap",
        "amount_precision" => "the amount does not sit on the market amount precision",
        "price_precision" => "the limit price does not sit on the market price precision",
        // The TypeScript reads this table with stringAt(.., code, code): an
        // unknown code falls back to the code itself rather than to empty.
        other => {
            // `other` is a &str borrowed from the caller, but this function
            // returns 'static. Every code the class emits is in the table above,
            // so the fallback only fires for a code that does not exist yet.
            let _ = other;
            "unknown_violation"
        }
    }
}
const DEFAULT_TIMEOUT_MS: f64 = 30000.0;
/// The router accepts at most this many balance entries; the rest are dropped
/// smallest-first and reported.
const MAX_BALANCE_ENTRIES: usize = 64;
/// And at most this many characters in the rendered value.
const MAX_BALANCE_CHARS: usize = 4096;

/// A client for the CCXT order-router service.
pub struct OrderRouter {
    api_key: String,
    base_url: String,
    timeout_ms: f64,
    max_notional_usd: f64,
    /// The only clock this class reads. `None` means the real wall clock; a
    /// test pins time by setting it. A field rather than an overridable method
    /// because `OrderRouter` is a concrete struct, not a trait.
    now_ms_override: Option<f64>,
    /// In-process idempotency ledger: the identity of every plan this instance
    /// has already executed live. Behind a mutex because `execute` takes `&self`
    /// — a `Vec` rather than a set, because it is only ever searched linearly and
    /// never iterated for ordered output.
    executed_plan_ids: std::sync::Mutex<Vec<String>>,
}

// ---------------------------------------------------------------------------
// container accessors
//
// Every port has these; they exist so the six implementations read line for
// line, and so a missing key is never a language-specific crash.
// ---------------------------------------------------------------------------

/// Plain container read: the field if the container is a dict and the field is
/// present and not null, `None` otherwise. Deliberately NOT `get_value_k`, which
/// also routes shared-order-book meta keys and live-client lookups — this class
/// reads inert JSON structures, and picking up those side effects would make the
/// accessors mean something the other five ports' accessors do not.
fn field<'a>(container: &'a Value, key: &str) -> Option<&'a Value> {
    match container.as_map().and_then(|map| map.get(key)) {
        Some(Value::Null) | None => None,
        found => found,
    }
}

impl OrderRouter {
    /// Reads a numeric field, with a default for missing, null and unparseable
    /// values.
    pub fn number_at(&self, container: &Value, key: &str, default_value: f64) -> f64 {
        Self::number_of(field(container, key), default_value)
    }

    fn number_of(value: Option<&Value>, default_value: f64) -> f64 {
        match value {
            None | Some(Value::Null) => default_value,
            // NaN and the infinities are not numbers this class will act on. An
            // infinite tolerance silently disables the halt verdict and an
            // infinite rate silently disables the cap, and "the default" is the
            // only answer six languages can agree on for either.
            Some(Value::Int(n)) => {
                let as_float = *n as f64;
                if Self::is_finite_number(as_float) { as_float } else { default_value }
            }
            Some(Value::Float(n)) => {
                if Self::is_finite_number(*n) { *n } else { default_value }
            }
            Some(Value::Str(text)) => Self::parse_number_text(text, default_value),
            _ => default_value,
        }
    }

    /// Reports whether a double is a real number, i.e. neither NaN nor an
    /// infinity.
    pub fn is_finite_number(value: f64) -> bool {
        // DIVERGENCE, and the only one in this method. The other five ports
        // write `value !== value`, which their comment calls "the one NaN test
        // that needs no library" — in Rust that is clippy::eq_op, denied by
        // default, and CI compiles with it fatal. `is_nan()` is the identical
        // predicate; only the spelling differs.
        if value.is_nan() {
            return false;
        }
        if value > 1.7976931348623157e308 || value < -1.7976931348623157e308 {
            return false;
        }
        true
    }

    /// Reads the leading numeric prefix of a string exactly as JavaScript's
    /// `parseFloat` does, returning the default when there is not one or when
    /// the result is not finite.
    pub fn parse_number(&self, text: &str, default_value: f64) -> f64 {
        Self::parse_number_text(text, default_value)
    }

    fn parse_number_text(text: &str, default_value: f64) -> f64 {
        // Hand-rolled rather than delegated to the language's own parser,
        // because every language's own parser disagrees with the others
        // somewhere: Python reads '1_000' as 1000 and '1,234.5' not at all, PHP
        // and Go read '0x10' as 0 only by accident of their regex, C# trims
        // Unicode whitespace JavaScript does not, and Rust's own `f64::from_str`
        // accepts "inf"/"NaN" and rejects any trailing text at all. The grammar
        // below is JavaScript's StrDecimalLiteral prefix over the ASCII
        // whitespace set, and it is the SAME twenty lines in all six ports.
        //
        // Indexed over BYTES, not chars: every character the grammar accepts is
        // ASCII, and a multi-byte character can only ever end the scan.
        let bytes = text.as_bytes();
        let mut cursor = 0usize;
        while cursor < bytes.len() && Self::is_router_space(bytes[cursor]) {
            cursor += 1;
        }
        let start = cursor;
        if cursor < bytes.len() && (bytes[cursor] == b'+' || bytes[cursor] == b'-') {
            cursor += 1;
        }
        let mut digits = 0usize;
        while cursor < bytes.len() && bytes[cursor].is_ascii_digit() {
            cursor += 1;
            digits += 1;
        }
        if cursor < bytes.len() && bytes[cursor] == b'.' {
            cursor += 1;
            while cursor < bytes.len() && bytes[cursor].is_ascii_digit() {
                cursor += 1;
                digits += 1;
            }
        }
        if digits == 0 {
            // 'Infinity', 'inf', 'NaN', '' and '٠١' all land here, in all six.
            return default_value;
        }
        let mut end = cursor;
        if cursor < bytes.len() && (bytes[cursor] == b'e' || bytes[cursor] == b'E') {
            let mut exponent = cursor + 1;
            if exponent < bytes.len() && (bytes[exponent] == b'+' || bytes[exponent] == b'-') {
                exponent += 1;
            }
            let mut exponent_digits = 0usize;
            while exponent < bytes.len() && bytes[exponent].is_ascii_digit() {
                exponent += 1;
                exponent_digits += 1;
            }
            if exponent_digits > 0 {
                // A trailing 'e' with no digits is not part of the number: JS
                // reads '1e' as 1, and so does every port here.
                end = exponent;
            }
        }
        let slice = &text[start..end];
        match slice.parse::<f64>() {
            // '1e400' overflows to an infinity, which is not a number the cap or
            // the tolerance may be built out of.
            Ok(parsed) if Self::is_finite_number(parsed) => parsed,
            _ => default_value,
        }
    }

    /// Reports whether a byte is one of the six ASCII spaces the number grammar
    /// skips.
    fn is_router_space(character: u8) -> bool {
        // Deliberately NOT the language's own is_whitespace: Python, PHP, C#,
        // Go and Rust each draw the Unicode line in a different place, and a
        // non-breaking space that parses in one language and not the others is
        // drift.
        character == b' '
            || character == b'\t'
            || character == b'\n'
            || character == b'\r'
            || character == 0x0c
            || character == 0x0b
    }

    /// Reads a string field, with a default for missing and null values.
    pub fn string_at(&self, container: &Value, key: &str, default_value: &str) -> String {
        match field(container, key) {
            Some(Value::Str(text)) => text.clone(),
            _ => default_value.to_string(),
        }
    }

    /// Reads a boolean field, with a default for missing and null values.
    pub fn bool_at(&self, container: &Value, key: &str, default_value: bool) -> bool {
        match field(container, key) {
            Some(Value::Bool(flag)) => *flag,
            _ => default_value,
        }
    }

    /// Reads an array field, returning an empty vector when absent. Never None,
    /// for the same reason `listAt` never returns undefined.
    pub fn list_at(&self, container: &Value, key: &str) -> Vec<Value> {
        match field(container, key) {
            Some(Value::Arr(items)) => items.as_ref().clone(),
            _ => Vec::new(),
        }
    }

    /// Reads a nested dictionary, returning an empty one when absent.
    pub fn dict_at(&self, container: &Value, key: &str) -> Value {
        match field(container, key) {
            Some(Value::Dict(map)) => Value::Dict(Arc::clone(map)),
            _ => Value::Map(HashMap::new()),
        }
    }

    /// Formats a double as decimal text with no exponent, so that six languages
    /// produce the same string.
    pub fn format_number(&self, value: f64) -> RouterResult<String> {
        // JavaScript prints 1e-7 where Python prints 1e-07 and Go prints 1e-07;
        // a fixed 12-decimal rendering with the trailing zeros trimmed is the
        // one spelling all six languages agree on for the magnitudes a balance
        // or an amount can take.
        if !Self::is_finite_number(value) {
            return Ok("0".to_string());
        }
        if value.abs() >= 1e18 {
            // JavaScript's toFixed switches to exponent notation at 1e21 while
            // the other languages never do. Rather than let one language send a
            // different string than the others, refuse — loudly, and at a
            // magnitude no real amount reaches.
            return Err(bad_request(
                "OrderRouter: a number this large cannot be rendered identically in all six languages",
            ));
        }
        let mut text = Self::to_fixed_12(value);
        if text.contains('.') {
            while text.ends_with('0') {
                text.pop();
            }
            if text.ends_with('.') {
                text.pop();
            }
        }
        if text.is_empty() || text == "-" || text == "-0" {
            return Ok("0".to_string());
        }
        Ok(text)
    }

    /// Renders a finite f64 with exactly twelve decimals, from the exact binary
    /// value and under JavaScript's toFixed tie rule.
    ///
    /// The reference is TypeScript, and TypeScript's toFixed is ECMA-262's: the
    /// sign is stripped BEFORE the digits are chosen, so a tie rounds AWAY FROM
    /// ZERO on the magnitude and (-0.0001220703125).toFixed(12) is
    /// -0.000122070313, not -...312. Rust's `{:.12}` rounds half to EVEN and
    /// would answer ...312, so the balances query string this feeds would differ
    /// per language on every value landing exactly on a half tick — 2^-13
    /// included.
    ///
    /// `{:.53}` is EXACT for every double whose expansion reaches the twelfth
    /// decimal: a double is m * 2^-k and its expansion terminates at digit k, so
    /// k <= 53 (|value| >= 2^-53) renders with no rounding at all, and anything
    /// smaller is below 1e-16 — its digits 13 and 14 are both 0, so no carry
    /// from digit 53 can reach the digit this rounds on.
    fn to_fixed_12(value: f64) -> String {
        let negative = value < 0.0;
        // abs() rather than a negation, so a negative zero renders WITHOUT a
        // sign: the digit walk below assumes every byte it reads is a digit.
        let magnitude = value.abs();
        let rendered = format!("{magnitude:.53}");
        let dot = match rendered.find('.') {
            Some(index) => index,
            None => return rendered,
        };
        let mut integer_length = dot;
        let digits: Vec<u8> = rendered
            .bytes()
            .filter(|byte| *byte != b'.')
            .collect();
        let keep = integer_length + 12;
        // round half UP on the magnitude, reading the thirteenth decimal exactly
        let round_up = digits[keep] >= b'5';
        let mut kept: Vec<u8> = digits[..keep].to_vec();
        if round_up {
            let mut carry = 1u8;
            let mut index = kept.len();
            while index > 0 && carry == 1 {
                index -= 1;
                let digit = kept[index] - b'0' + carry;
                carry = u8::from(digit >= 10);
                kept[index] = (digit % 10) + b'0';
            }
            if carry == 1 {
                kept.insert(0, b'1');
                integer_length += 1;
            }
        }
        let text = String::from_utf8_lossy(&kept).to_string();
        let sign = if negative { "-" } else { "" };
        format!("{}{}.{}", sign, &text[..integer_length], &text[integer_length..])
    }
}

// ---------------------------------------------------------------------------
// construction
// ---------------------------------------------------------------------------

impl OrderRouter {
    /// Creates a client for the CCXT order-router service.
    ///
    /// `config` keys: `apiKey` (required), `baseUrl`, `timeoutMs`,
    /// `maxNotionalUsd` (an OPT-IN per-trade USD cap, honoured exactly at
    /// whatever value is given; 0 — the default — means NO CAP, and a negative
    /// value is refused).
    pub fn new(config: &Value) -> RouterResult<Self> {
        // Constructed through a temporary so the accessors — which are methods,
        // exactly as in the other five ports — are available while reading the
        // config that builds the real one.
        let reader = OrderRouter {
            api_key: String::new(),
            base_url: String::new(),
            timeout_ms: DEFAULT_TIMEOUT_MS,
            max_notional_usd: NO_CAP,
            now_ms_override: None,
            executed_plan_ids: std::sync::Mutex::new(Vec::new()),
        };
        let api_key = reader.string_at(config, "apiKey", "");
        if api_key.is_empty() {
            return Err(arguments_required("OrderRouter requires an apiKey"));
        }
        let mut base_url = reader.string_at(config, "baseUrl", DEFAULT_BASE_URL);
        while base_url.ends_with('/') {
            base_url.pop();
        }
        let timeout_ms = reader.number_at(config, "timeoutMs", DEFAULT_TIMEOUT_MS);
        let max_notional_usd = reader.number_at(config, "maxNotionalUsd", NO_CAP);
        if max_notional_usd < 0.0 {
            // A negative cap is a typo, not a policy, and silently ignoring it
            // would leave the caller believing a guardrail is in place.
            return Err(bad_request(
                "OrderRouter maxNotionalUsd must not be negative; omit it, or pass 0, for no cap",
            ));
        }
        // 0 means NO CAP. Any positive value is honoured exactly — it is not
        // clamped, because the caller is the one who knows the size of their own
        // trade.
        Ok(OrderRouter {
            api_key,
            base_url,
            timeout_ms,
            max_notional_usd,
            now_ms_override: None,
            executed_plan_ids: std::sync::Mutex::new(Vec::new()),
        })
    }

    /// Pins the clock, for tests. Production never calls this.
    pub fn set_now_ms(&mut self, now_ms: f64) {
        self.now_ms_override = Some(now_ms);
    }

    /// The only clock this class reads.
    fn now_ms(&self) -> f64 {
        match self.now_ms_override {
            Some(pinned) => pinned,
            None => std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .map(|d| d.as_millis() as f64)
                .unwrap_or(0.0),
        }
    }

    /// The per-trade USD notional cap this client will enforce, or `NO_CAP` when
    /// the caller never asked for one.
    pub fn max_notional_usd(&self) -> f64 {
        self.max_notional_usd
    }

    /// The router base url, with any trailing slashes removed.
    pub fn base_url(&self) -> &str {
        &self.base_url
    }

    /// The configured request timeout, in milliseconds.
    pub fn timeout_ms(&self) -> f64 {
        self.timeout_ms
    }
}

// ---------------------------------------------------------------------------
// PURE: build_execution_plan
// ---------------------------------------------------------------------------

impl OrderRouter {
    /// Refuses a route whose hops do not connect, or that does not run from the
    /// asset the caller offered to the asset the caller wanted.
    ///
    /// `build_execution_plan` used to copy `from`, `to`, `pair` and `side`
    /// straight out of the server's JSON, and the safety checks only tested
    /// internal consistency against whatever market that named — so a
    /// compromised, or simply buggy, router response could steer real orders
    /// into any real market and every check would pass it, under the 25 USD cap.
    pub fn assert_route_chain_is_coherent(&self, route: &Value, hops: &[Value]) -> RouterResult<()> {
        if hops.is_empty() {
            return Ok(());
        }
        let mut carried = String::new();
        for (index, hop) in hops.iter().enumerate() {
            let side = self.string_at(hop, "side", "").to_lowercase();
            let base_code = self.string_at(hop, "base", "").to_uppercase();
            let quote = self.string_at(hop, "quote", "").to_uppercase();
            if base_code.is_empty() || quote.is_empty() || (side != "buy" && side != "sell") {
                return Err(exchange_error(&format!(
                    "OrderRouter: hop {index} does not name a market and a side"
                )));
            }
            // A buy spends the quote to acquire the base; a sell is the reverse.
            let spends = if side == "buy" { quote.clone() } else { base_code.clone() };
            let produces = if side == "buy" { base_code } else { quote };
            if index > 0 && spends != carried {
                // Hop N+1 must spend exactly what hop N produced, or the plan
                // strands the proceeds of one order and funds the next from a
                // wallet nobody checked.
                return Err(exchange_error(&format!(
                    "OrderRouter: hop {index} spends {spends} but the previous hop produced {carried}"
                )));
            }
            if index == 0 {
                let requested_from = self.string_at(route, "clientRequestedFrom", "");
                if !requested_from.is_empty() && spends != requested_from {
                    return Err(exchange_error(&format!(
                        "OrderRouter: the route spends {spends}, not the requested {requested_from}"
                    )));
                }
            }
            carried = produces;
        }
        let requested_to = self.string_at(route, "clientRequestedTo", "");
        if !requested_to.is_empty() && carried != requested_to {
            return Err(exchange_error(&format!(
                "OrderRouter: the route produces {carried}, not the requested {requested_to}"
            )));
        }
        Ok(())
    }

    /// Turns a RouteResult into an ordered list of concrete orders. PURE — no
    /// I/O, and the same input produces the same output in all six languages.
    ///
    /// `options` keys: `slippageBps` (default 25) and `reconcileToleranceRatio`
    /// (default 0.02).
    pub fn build_execution_plan(&self, route: &Value, options: &Value) -> RouterResult<Value> {
        let slippage_bps = self.number_at(options, "slippageBps", DEFAULT_SLIPPAGE_BPS);
        let tolerance = self.number_at(options, "reconcileToleranceRatio", DEFAULT_RECONCILE_TOLERANCE);
        let hops = self.list_at(route, "hops");
        self.assert_route_chain_is_coherent(route, &hops)?;
        let mut steps: Vec<Value> = Vec::new();
        let mut step_index = 0i64;
        for (hop_index, hop) in hops.iter().enumerate() {
            let symbol = self.string_at(hop, "pair", "");
            let side = self.string_at(hop, "side", "");
            let base_code = self.string_at(hop, "base", "");
            let quote = self.string_at(hop, "quote", "");
            let legs = self.list_at(hop, "legs");
            for (leg_index, leg) in legs.iter().enumerate() {
                // Leg amounts are always in BASE units, on both sides of the
                // market — see the router's RoutingQuote.filledAmount contract.
                let amount = self.number_at(leg, "amount", 0.0);
                let expected_price = self.number_at(leg, "averagePrice", 0.0);
                let effective_price = self.number_at(leg, "effectivePrice", expected_price);
                // The limit sits on the side that costs you: above for a buy,
                // below for a sell.
                let limit_price = if side == "buy" {
                    expected_price * (1.0 + slippage_bps / 10000.0)
                } else {
                    expected_price * (1.0 - slippage_bps / 10000.0)
                };
                let mut step = HashMap::new();
                step.insert("stepIndex".into(), Value::Float(step_index as f64));
                step.insert("hopIndex".into(), Value::Float(hop_index as f64));
                step.insert("legIndex".into(), Value::Float(leg_index as f64));
                step.insert("exchangeId".into(), Value::Str(self.string_at(leg, "exchangeId", "")));
                step.insert("symbol".into(), Value::Str(symbol.clone()));
                step.insert("side".into(), Value::Str(side.clone()));
                step.insert("base".into(), Value::Str(base_code.clone()));
                step.insert("quote".into(), Value::Str(quote.clone()));
                step.insert("amount".into(), Value::Float(amount));
                step.insert("expectedPrice".into(), Value::Float(expected_price));
                step.insert("effectivePrice".into(), Value::Float(effective_price));
                step.insert("limitPrice".into(), Value::Float(limit_price));
                step.insert("notionalQuote".into(), Value::Float(amount * expected_price));
                steps.push(Value::Map(step));
                step_index += 1;
            }
        }
        let mut plan = HashMap::new();
        plan.insert("requestId".into(), Value::Str(self.string_at(route, "requestId", "")));
        plan.insert("calculatedAt".into(), Value::Float(self.number_at(route, "calculatedAt", 0.0)));
        plan.insert("from".into(), Value::Str(self.string_at(route, "from", "")));
        plan.insert("to".into(), Value::Str(self.string_at(route, "to", "")));
        plan.insert("routingStrategy".into(), Value::Str(self.string_at(route, "strategy", "")));
        plan.insert("exactSide".into(), Value::Str(self.string_at(route, "exactSide", "")));
        plan.insert("amountIn".into(), Value::Float(self.number_at(route, "amountIn", 0.0)));
        plan.insert("amountOut".into(), Value::Float(self.number_at(route, "amountOut", 0.0)));
        plan.insert("fullyFillable".into(), Value::Bool(self.bool_at(route, "fullyFillable", false)));
        plan.insert("fillRatio".into(), Value::Float(self.number_at(route, "fillRatio", 0.0)));
        plan.insert("unroutableReason".into(), Value::Str(self.string_at(route, "unroutableReason", "")));
        plan.insert("hopCount".into(), Value::Float(hops.len() as f64));
        plan.insert("stepCount".into(), Value::Float(steps.len() as f64));
        plan.insert("slippageBps".into(), Value::Float(slippage_bps));
        plan.insert("reconcileToleranceRatio".into(), Value::Float(tolerance));
        plan.insert("steps".into(), Value::List(steps));
        Ok(Value::Map(plan))
    }
}

// ---------------------------------------------------------------------------
// the venue abstraction
// ---------------------------------------------------------------------------

/// What `execute` needs from an exchange, and nothing more.
///
/// The other five ports hand `execute` their language's exchange object
/// directly. Rust cannot: `ExchangeBase`'s methods return `impl Future`, which
/// is not object-safe, so a `HashMap<String, Box<dyn ExchangeBase>>` — the
/// shape every other port uses for `venues` — cannot exist. This trait is that
/// shape, narrowed to the operations the money path actually performs, and it
/// is what makes the venues map possible here at all.
///
/// It also buys something the other ports get for free from dynamic typing: a
/// test can implement this in twenty lines, so the execute-path invariants are
/// testable without a live exchange.
#[async_trait::async_trait]
pub trait RouterVenue: Send + Sync {
    /// The venue's ccxt id, e.g. `binance`. Matched against a step's
    /// `exchangeId`.
    fn id(&self) -> String;

    /// Snaps an amount to the market's precision, as text — the same contract
    /// as ccxt's `amountToPrecision`.
    fn amount_to_precision(&self, symbol: &str, amount: f64) -> String;

    /// Snaps a price to the market's precision, as text.
    fn price_to_precision(&self, symbol: &str, price: f64) -> String;

    /// Whether this venue accepts an immediate-or-cancel time-in-force on a
    /// limit order. A venue that does not gets a market order only when the
    /// caller has explicitly opted in — see `execute`.
    fn supports_ioc(&self) -> bool;

    /// Places an order. `params` carries the time-in-force and any caller
    /// extras.
    async fn create_order(
        &self,
        symbol: &str,
        order_type: &str,
        side: &str,
        amount: f64,
        price: f64,
        params: &Value,
    ) -> RouterResult<Value>;

    /// Reads an order back. Used to re-read a venue that answered without a
    /// `filled`, rather than assuming one.
    async fn fetch_order(&self, id: &str, symbol: &str) -> RouterResult<Value>;

    /// Cancels an order. Used by the protected-limit path when the poll expires.
    async fn cancel_order(&self, id: &str, symbol: &str) -> RouterResult<Value>;

    /// Reads the account's holdings, in ccxt's balance shape — `free` and
    /// `total` maps of currency code to amount. Only `fetch_route_with_balances`
    /// calls this; a venue used solely with `execute` can return an empty map.
    async fn fetch_balance(&self) -> RouterResult<Value> {
        Ok(Value::Map(HashMap::new()))
    }
}

// ---------------------------------------------------------------------------
// PURE: check_execution_plan_safety
// ---------------------------------------------------------------------------

impl OrderRouter {
    /// Builds one safety violation record.
    fn violation(
        &self,
        step_index: f64,
        exchange_id: &str,
        symbol: &str,
        code: &str,
        blocking: bool,
        actual: f64,
        limit: f64,
    ) -> Value {
        let mut entry = HashMap::new();
        entry.insert("stepIndex".into(), Value::Float(step_index));
        entry.insert("exchangeId".into(), Value::Str(exchange_id.to_string()));
        entry.insert("symbol".into(), Value::Str(symbol.to_string()));
        entry.insert("code".into(), Value::Str(code.to_string()));
        entry.insert("blocking".into(), Value::Bool(blocking));
        entry.insert("actual".into(), Value::Float(actual));
        entry.insert("limit".into(), Value::Float(limit));
        entry.insert("message".into(), Value::Str(violation_message(code).to_string()));
        Value::Map(entry)
    }

    /// Resolves the USD price of a currency, treating USD itself as 1 and
    /// assuming nothing about anything else.
    fn usd_rate_for(&self, code: &str, usd_rates: &Value) -> f64 {
        if code.is_empty() {
            return 0.0;
        }
        if code == "USD" {
            return 1.0;
        }
        // USDT and USDC are NOT assumed to be one dollar. A stablecoin peg is an
        // empirical fact, not a definition, and the caller supplying rates is
        // the one who knows today's.
        let rate = self.number_at(usd_rates, code, 0.0);
        if rate > 0.0 {
            return rate;
        }
        0.0
    }

    /// The USD value of a step's notional, quote side first and base side as
    /// the fallback — `amount * usd(base)` values the same trade.
    fn notional_usd(&self, step: &Value, notional_quote: f64, usd_rates: &Value) -> f64 {
        let quote = self.string_at(step, "quote", "");
        let quote_rate = self.usd_rate_for(&quote, usd_rates);
        if quote_rate > 0.0 {
            return notional_quote * quote_rate;
        }
        let base_code = self.string_at(step, "base", "");
        let base_rate = self.usd_rate_for(&base_code, usd_rates);
        if base_rate > 0.0 {
            return self.number_at(step, "amount", 0.0) * base_rate;
        }
        0.0
    }

    /// Reports whether a value fails to sit on a market's precision grid.
    fn precision_violated(&self, value: f64, precision: f64, mode: &str) -> bool {
        if precision <= 0.0 {
            // Unknown or unconstrained precision is not a finding.
            return false;
        }
        let rounded = if mode == "decimal_places" {
            let factor = 10f64.powf(precision);
            (value * factor).round() / factor
        } else {
            // The rounding mode is irrelevant here: a value exactly halfway
            // between two ticks is off-grid whichever neighbour it snaps to, so
            // the six languages' differing round() semantics cannot change this
            // predicate's answer.
            (value / precision).round() * precision
        };
        let allowed = value.abs() * TOLERANCE + 1e-15;
        (rounded - value).abs() > allowed
    }

    /// Checks a plan against per-venue market rules and the hard per-trade USD
    /// notional cap. PURE — no I/O. A step that cannot be valued in USD BLOCKS;
    /// it is never skipped, because a cap that silently disappears when a rate
    /// is missing is not a cap.
    ///
    /// `markets` is `markets[exchangeId][symbol]`.
    pub fn check_execution_plan_safety(
        &self,
        plan: &Value,
        markets: &Value,
        options: &Value,
    ) -> Vec<Value> {
        let mut violations: Vec<Value> = Vec::new();
        // Honoured exactly as given, per call or per client. No clamping: a
        // caller trading thousands and a caller trading cents are both using
        // this correctly.
        let max_notional_usd = self.number_at(options, "maxNotionalUsd", self.max_notional_usd);
        let cap_in_force = max_notional_usd > 0.0;
        let usd_rates = self.dict_at(options, "usdRates");
        let precision_mode = self.string_at(options, "precisionMode", "tick_size");
        let steps = self.list_at(plan, "steps");
        if steps.is_empty() {
            // An empty plan passing an empty violation list would read as "safe".
            violations.push(self.violation(-1.0, "", "", "empty_plan", true, 0.0, 0.0));
            return violations;
        }
        let unroutable_reason = self.string_at(plan, "unroutableReason", "");
        if !unroutable_reason.is_empty() {
            violations.push(self.violation(-1.0, "", "", "route_unroutable", true, 0.0, 0.0));
        }
        if !self.bool_at(plan, "fullyFillable", false) {
            violations.push(self.violation(
                -1.0, "", "", "partial_fill", false, self.number_at(plan, "fillRatio", 0.0), 1.0,
            ));
        }
        for (i, step) in steps.iter().enumerate() {
            let step_index = self.number_at(step, "stepIndex", i as f64);
            let exchange_id = self.string_at(step, "exchangeId", "");
            let symbol = self.string_at(step, "symbol", "");
            let amount = self.number_at(step, "amount", 0.0);
            let expected_price = self.number_at(step, "expectedPrice", 0.0);
            let limit_price = self.number_at(step, "limitPrice", 0.0);
            let notional_quote = self.number_at(step, "notionalQuote", 0.0);
            let side = self.string_at(step, "side", "");
            if amount <= 0.0 || expected_price <= 0.0 || (side != "buy" && side != "sell") {
                violations.push(self.violation(
                    step_index, &exchange_id, &symbol, "invalid_step", true, amount, 0.0,
                ));
                continue;
            }
            let venue_markets = self.dict_at(markets, &exchange_id);
            let market = self.dict_at(&venue_markets, &symbol);
            if market.as_map().map(|m| m.is_empty()).unwrap_or(true) {
                violations.push(self.violation(
                    step_index, &exchange_id, &symbol, "unknown_symbol", true, 0.0, 0.0,
                ));
                continue;
            }
            // The same symbol string on a different venue is not necessarily the
            // same pair, and the USD valuation below trusts the step's quote
            // currency — so disagreement is fatal, not cosmetic.
            let market_base = self.string_at(&market, "base", "");
            let market_quote = self.string_at(&market, "quote", "");
            let step_base = self.string_at(step, "base", "");
            let step_quote = self.string_at(step, "quote", "");
            let base_disagrees =
                !market_base.is_empty() && !step_base.is_empty() && market_base != step_base;
            let quote_disagrees =
                !market_quote.is_empty() && !step_quote.is_empty() && market_quote != step_quote;
            if base_disagrees || quote_disagrees {
                violations.push(self.violation(
                    step_index, &exchange_id, &symbol, "market_mismatch", true, 0.0, 0.0,
                ));
                continue;
            }
            let limits = self.dict_at(&market, "limits");
            let amount_limits = self.dict_at(&limits, "amount");
            let price_limits = self.dict_at(&limits, "price");
            let cost_limits = self.dict_at(&limits, "cost");
            let min_amount = self.number_at(&amount_limits, "min", 0.0);
            let max_amount = self.number_at(&amount_limits, "max", 0.0);
            let min_price = self.number_at(&price_limits, "min", 0.0);
            let max_price = self.number_at(&price_limits, "max", 0.0);
            let min_cost = self.number_at(&cost_limits, "min", 0.0);
            if min_amount > 0.0 && amount < min_amount {
                violations.push(self.violation(
                    step_index, &exchange_id, &symbol, "amount_below_minimum", true, amount, min_amount,
                ));
            }
            if max_amount > 0.0 && amount > max_amount {
                violations.push(self.violation(
                    step_index, &exchange_id, &symbol, "amount_above_maximum", true, amount, max_amount,
                ));
            }
            if min_cost > 0.0 && notional_quote < min_cost {
                violations.push(self.violation(
                    step_index, &exchange_id, &symbol, "cost_below_minimum", true, notional_quote, min_cost,
                ));
            }
            if (min_price > 0.0 && limit_price < min_price)
                || (max_price > 0.0 && limit_price > max_price)
            {
                let bound = if limit_price < min_price { min_price } else { max_price };
                violations.push(self.violation(
                    step_index, &exchange_id, &symbol, "price_out_of_range", true, limit_price, bound,
                ));
            }
            let precision = self.dict_at(&market, "precision");
            let amount_precision = self.number_at(&precision, "amount", 0.0);
            let price_precision = self.number_at(&precision, "price", 0.0);
            // Precision findings are advisory: execute() snaps through the
            // venue's own amountToPrecision/priceToPrecision before sending.
            if self.precision_violated(amount, amount_precision, &precision_mode) {
                violations.push(self.violation(
                    step_index, &exchange_id, &symbol, "amount_precision", false, amount, amount_precision,
                ));
            }
            if self.precision_violated(limit_price, price_precision, &precision_mode) {
                violations.push(self.violation(
                    step_index, &exchange_id, &symbol, "price_precision", false, limit_price, price_precision,
                ));
            }
            // The notional cap. The worst case is the higher of the expected and
            // the limit price, which is the buy side; a sell's limit sits below,
            // so its expected price is the one that governs.
            let mut worst_price = expected_price;
            if limit_price > worst_price {
                worst_price = limit_price;
            }
            if cap_in_force {
                // Only when a cap is actually set. With no cap there is nothing
                // to enforce, so a missing USD rate is not an error and the
                // caller is not made to supply usdRates for a check they did not
                // ask for.
                let worst_notional = amount * worst_price;
                let usd_value = self.notional_usd(step, worst_notional, &usd_rates);
                if usd_value <= 0.0 {
                    // BLOCKING, and deliberately so. Skipping the cap for a step
                    // whose USD value is unknown defeats the cap the caller DID
                    // ask for.
                    violations.push(self.violation(
                        step_index, &exchange_id, &symbol, "notional_unvaluable", true,
                        worst_notional, max_notional_usd,
                    ));
                } else if usd_value > max_notional_usd * (1.0 + TOLERANCE) {
                    violations.push(self.violation(
                        step_index, &exchange_id, &symbol, "notional_exceeds_cap", true, usd_value,
                        max_notional_usd,
                    ));
                }
            }
        }
        violations
    }
}

// ---------------------------------------------------------------------------
// PURE: reconcile_execution_step
// ---------------------------------------------------------------------------

impl OrderRouter {
    /// How much of its output asset a step is expected to produce, gross of
    /// fees: base units for a buy, quote units for a sell.
    pub fn step_expected_out(&self, step: &Value) -> f64 {
        let amount = self.number_at(step, "amount", 0.0);
        if self.string_at(step, "side", "") == "buy" {
            return amount;
        }
        amount * self.number_at(step, "expectedPrice", 0.0)
    }

    /// Reports whether a field holds a usable number, as opposed to holding
    /// zero or nothing at all.
    ///
    /// "The venue said zero" and "the venue said nothing" are different facts
    /// and used to produce the same number. Reuses `number_of` rather than
    /// re-deriving the coercion: "the value is usable" and "the value is
    /// present" must never disagree, and two copies of that rule is how they
    /// would.
    pub fn has_number_at(&self, container: &Value, key: &str) -> bool {
        let probe = Self::number_of(field(container, key), f64::NAN);
        Self::is_finite_number(probe)
    }

    /// Compares what a step actually produced against what the route predicted,
    /// resizes every downstream hop, and returns the proceed-or-halt verdict.
    /// PURE — no I/O.
    ///
    /// The halt decision lives here rather than in the execution loop because it
    /// is a money decision, and six separate loops is six chances to omit it.
    pub fn reconcile_execution_step(
        &self,
        plan: &Value,
        step_index: i64,
        realised_out: f64,
    ) -> RouterResult<Value> {
        let steps = self.list_at(plan, "steps");
        if step_index < 0 || step_index as usize >= steps.len() {
            return Err(bad_request("reconcileExecutionStep: stepIndex is out of range"));
        }
        let step = &steps[step_index as usize];
        let hop_index = self.number_at(step, "hopIndex", 0.0);
        let tolerance =
            self.number_at(plan, "reconcileToleranceRatio", DEFAULT_RECONCILE_TOLERANCE);
        let expected_out = self.step_expected_out(step);
        let mut resized: Vec<Value> = Vec::new();
        if expected_out <= 0.0 {
            let mut verdict = HashMap::new();
            verdict.insert("stepIndex".into(), Value::Float(step_index as f64));
            verdict.insert("hopIndex".into(), Value::Float(hop_index));
            verdict.insert("expectedOut".into(), Value::Float(0.0));
            verdict.insert("realisedOut".into(), Value::Float(realised_out));
            verdict.insert("shortfall".into(), Value::Float(0.0));
            verdict.insert("shortfallRatio".into(), Value::Float(0.0));
            verdict.insert("scale".into(), Value::Float(0.0));
            verdict.insert("verdict".into(), Value::Str("halt".into()));
            verdict.insert("reason".into(), Value::Str("zero_expected_output".into()));
            verdict.insert("resizedSteps".into(), Value::List(resized));
            return Ok(Value::Map(verdict));
        }
        let mut shortfall = expected_out - realised_out;
        if shortfall < 0.0 {
            shortfall = 0.0;
        }
        let shortfall_ratio = shortfall / expected_out;
        // The downstream hops lost `shortfall` out of this hop's whole output,
        // not out of this leg's, so the scale is measured against the hop.
        let mut hop_expected_out = 0.0f64;
        // Shortfall already reported by this hop's OTHER legs. Each leg used to
        // compute a scale from the hop total and multiply the downstream amounts
        // by it, so a second leg scaled an already-scaled number: 80% and 60%
        // fills produced 0.9 x 0.8 = 0.72 of the next hop instead of the true
        // 0.70, sizing it for more than the wallet actually received and
        // inviting a spurious insufficient-funds halt on exactly the bridged
        // routes this class exists for. Reproduced at 144 against a true 140
        // before this changed.
        let mut prior_shortfall = 0.0f64;
        for other in steps.iter() {
            if self.number_at(other, "hopIndex", 0.0) == hop_index {
                hop_expected_out += self.step_expected_out(other);
                if self.number_at(other, "stepIndex", -1.0) != step_index as f64
                    && self.has_number_at(other, "realisedOut")
                {
                    let mut leg_shortfall =
                        self.step_expected_out(other) - self.number_at(other, "realisedOut", 0.0);
                    if leg_shortfall < 0.0 {
                        leg_shortfall = 0.0;
                    }
                    prior_shortfall += leg_shortfall;
                }
            }
        }
        // scale_before is what the downstream amounts have ALREADY been
        // multiplied by, so the factor applied here is the increment that takes
        // them from that to the hop's true cumulative scale. With one leg per
        // hop prior_shortfall is 0, scale_before is 1, and this is
        // arithmetically identical to what it replaced.
        let mut scale_before = 1.0f64;
        let mut scale_after = 1.0f64;
        if hop_expected_out > 0.0 {
            scale_before = (hop_expected_out - prior_shortfall) / hop_expected_out;
            scale_after = (hop_expected_out - prior_shortfall - shortfall) / hop_expected_out;
        }
        if scale_before <= 0.0 {
            // The hop already produced nothing; there is nothing left to scale
            // down.
            scale_before = 1.0;
            scale_after = 0.0;
        }
        let mut scale = scale_after / scale_before;
        if scale > 1.0 {
            // Never scale UP. An overfill is good news, but growing a downstream
            // order past the size that passed the safety check would place an
            // order nobody ever approved.
            scale = 1.0;
        }
        if scale < 0.0 {
            scale = 0.0;
        }
        for (i, other) in steps.iter().enumerate() {
            if self.number_at(other, "hopIndex", 0.0) <= hop_index {
                continue;
            }
            let previous_amount = self.number_at(other, "amount", 0.0);
            let amount = previous_amount * scale;
            let mut entry = HashMap::new();
            entry.insert(
                "stepIndex".into(),
                Value::Float(self.number_at(other, "stepIndex", i as f64)),
            );
            entry.insert("previousAmount".into(), Value::Float(previous_amount));
            entry.insert("amount".into(), Value::Float(amount));
            entry.insert(
                "notionalQuote".into(),
                Value::Float(amount * self.number_at(other, "expectedPrice", 0.0)),
            );
            resized.push(Value::Map(entry));
        }
        let mut verdict_text = "proceed";
        let mut reason = "within_tolerance";
        if realised_out <= 0.0 {
            verdict_text = "halt";
            reason = "nothing_filled";
        } else if shortfall_ratio > tolerance * (1.0 + TOLERANCE) {
            verdict_text = "halt";
            reason = "shortfall_exceeds_tolerance";
        }
        let mut verdict = HashMap::new();
        verdict.insert("stepIndex".into(), Value::Float(step_index as f64));
        verdict.insert("hopIndex".into(), Value::Float(hop_index));
        verdict.insert("expectedOut".into(), Value::Float(expected_out));
        verdict.insert("realisedOut".into(), Value::Float(realised_out));
        verdict.insert("shortfall".into(), Value::Float(shortfall));
        verdict.insert("shortfallRatio".into(), Value::Float(shortfall_ratio));
        verdict.insert("scale".into(), Value::Float(scale));
        verdict.insert("verdict".into(), Value::Str(verdict_text.into()));
        verdict.insert("reason".into(), Value::Str(reason.into()));
        verdict.insert("resizedSteps".into(), Value::List(resized));
        Ok(Value::Map(verdict))
    }

    /// Writes a reconciliation's downstream resize back into the working steps.
    ///
    /// Records what this leg actually produced BEFORE resizing anything.
    /// `reconcile_execution_step` is pure and cannot remember across calls, so
    /// the hop's cumulative shortfall has to live on the steps themselves —
    /// this is what stops the next leg of the same hop compounding its scale
    /// onto an already-scaled amount.
    pub fn apply_resize(&self, steps: &mut [Value], reconciliation: &Value) {
        let reconciled_step = self.number_at(reconciliation, "stepIndex", -1.0);
        let realised_out = self.number_at(reconciliation, "realisedOut", 0.0);
        for step in steps.iter_mut() {
            if self.number_at(step, "stepIndex", -1.0) == reconciled_step {
                Self::put(step, "realisedOut", Value::Float(realised_out));
                break;
            }
        }
        let resized = self.list_at(reconciliation, "resizedSteps");
        for entry in &resized {
            let target = self.number_at(entry, "stepIndex", -1.0);
            let amount = self.number_at(entry, "amount", 0.0);
            let notional = self.number_at(entry, "notionalQuote", 0.0);
            for step in steps.iter_mut() {
                if self.number_at(step, "stepIndex", -1.0) == target {
                    Self::put(step, "amount", Value::Float(amount));
                    Self::put(step, "notionalQuote", Value::Float(notional));
                    break;
                }
            }
        }
    }

    /// Sets a key on a `Value::Dict` in place, through `Arc::make_mut` so the
    /// copy-on-write only deep-copies when the map is actually shared.
    ///
    /// Public because callers building a route by hand need it too — stamping
    /// `clientRequestedFrom`/`clientRequestedTo` onto a route obtained by some
    /// route other than `fetch_route`, for one. The other five ports get this
    /// for free from assignment into a dictionary.
    pub fn set_key(container: &mut Value, key: &str, value: Value) {
        Self::put(container, key, value)
    }

    fn put(container: &mut Value, key: &str, value: Value) {
        if let Value::Dict(map) = container {
            Arc::make_mut(map).insert(key.to_string(), value);
        }
    }
}

// ---------------------------------------------------------------------------
// PURE: build_unwind_plan
// ---------------------------------------------------------------------------

impl OrderRouter {
    /// Accumulates a signed amount into the (exchangeId, asset) position list,
    /// appending in first-seen order.
    ///
    /// `produced` is true when this step PRODUCED the asset, which is the only
    /// kind of step an unwind can reverse.
    fn add_position(
        &self,
        positions: &mut Vec<Value>,
        exchange_id: &str,
        asset: &str,
        amount: f64,
        source: &Value,
        produced: bool,
    ) {
        for position in positions.iter_mut() {
            let same_venue = self.string_at(position, "exchangeId", "") == exchange_id;
            let same_asset = self.string_at(position, "asset", "") == asset;
            if same_venue && same_asset {
                let running = self.number_at(position, "amount", 0.0) + amount;
                Self::put(position, "amount", Value::Float(running));
                let existing = self.dict_at(position, "source");
                let empty = existing.as_map().map(|m| m.is_empty()).unwrap_or(true);
                if produced && empty {
                    Self::put(position, "source", source.clone());
                }
                return;
            }
        }
        // The source must be the step that PRODUCED the asset, never one that
        // consumed it: reversing a step that spent your USDT would sell the
        // wrong side of the wrong market. Walking the results backwards, the
        // first producing step seen is the last one that ran, which is exactly
        // the order an unwind undoes first.
        let initial_source =
            if produced { source.clone() } else { Value::Map(HashMap::new()) };
        let mut entry = HashMap::new();
        entry.insert("exchangeId".into(), Value::Str(exchange_id.to_string()));
        entry.insert("asset".into(), Value::Str(asset.to_string()));
        entry.insert("amount".into(), Value::Float(amount));
        entry.insert("source".into(), initial_source);
        positions.push(Value::Map(entry));
    }

    /// Given a halted execution report, computes the reverse orders that sell
    /// each stranded residual back toward the original from-asset, on the venue
    /// that actually holds it. PURE — no I/O.
    ///
    /// NEVER automatic: the result carries `requiresConfirmation` and nothing in
    /// this class executes it.
    pub fn build_unwind_plan(&self, report: &Value) -> Value {
        let from_asset = self.string_at(report, "from", "");
        let to_asset = self.string_at(report, "to", "");
        let slippage_bps = self.number_at(report, "slippageBps", DEFAULT_SLIPPAGE_BPS);
        let results = self.list_at(report, "steps");
        // Net position per (exchangeId, asset). Held in a VECTOR rather than a
        // map because the output order must be identical in six languages and
        // map iteration order is not.
        let mut positions: Vec<Value> = Vec::new();
        for result in results.iter().rev() {
            let exchange_id = self.string_at(result, "exchangeId", "");
            let out_asset = self.string_at(result, "outAsset", "");
            let out_amount = self.number_at(result, "outAmount", 0.0);
            if !out_asset.is_empty() && out_amount > 0.0 {
                self.add_position(&mut positions, &exchange_id, &out_asset, out_amount, result, true);
            }
            let in_asset = self.string_at(result, "inAsset", "");
            let in_amount = self.number_at(result, "inAmount", 0.0);
            if !in_asset.is_empty() && in_amount > 0.0 {
                // What a later hop consumed on this venue is not a residual.
                // Netting is per venue: assets sitting on a venue the route
                // never spent them on stay stranded, because this class never
                // moves funds between venues.
                self.add_position(&mut positions, &exchange_id, &in_asset, -in_amount, result, false);
            }
        }
        let mut steps: Vec<Value> = Vec::new();
        let mut unresolved: Vec<Value> = Vec::new();
        let mut residual_count = 0i64;
        for position in &positions {
            let asset = self.string_at(position, "asset", "");
            let amount = self.number_at(position, "amount", 0.0);
            let exchange_id = self.string_at(position, "exchangeId", "");
            if amount <= 0.0 {
                continue;
            }
            if asset == from_asset {
                // Already home.
                continue;
            }
            residual_count += 1;
            let source = self.dict_at(position, "source");
            let symbol = self.string_at(&source, "symbol", "");
            let source_side = self.string_at(&source, "side", "");
            let mut price = self.number_at(&source, "averagePrice", 0.0);
            if price <= 0.0 {
                price = self.number_at(&source, "expectedPrice", 0.0);
            }
            if symbol.is_empty() || (source_side != "buy" && source_side != "sell") {
                unresolved.push(Self::unresolved_entry(&exchange_id, &asset, amount, "no_source_market"));
                continue;
            }
            if price <= 0.0 {
                unresolved.push(Self::unresolved_entry(&exchange_id, &asset, amount, "no_price"));
                continue;
            }
            // Reverse the order that created the residual: a buy left you
            // holding base, so sell it back; a sell left you holding quote, so
            // buy the base back with it.
            //
            // The counter asset is whatever the reversed order gives back, which
            // is exactly what the original order spent.
            let counter_asset = self.string_at(&source, "inAsset", "");
            let side;
            let unwind_amount;
            let market_base;
            let market_quote;
            if source_side == "buy" {
                side = "sell";
                market_base = self.string_at(&source, "outAsset", "");
                market_quote = self.string_at(&source, "inAsset", "");
            } else {
                side = "buy";
                market_base = self.string_at(&source, "inAsset", "");
                market_quote = self.string_at(&source, "outAsset", "");
            }
            // The limit price comes FIRST, because the buy below is sized on it.
            let limit_price = if side == "buy" {
                price * (1.0 + slippage_bps / 10000.0)
            } else {
                price * (1.0 - slippage_bps / 10000.0)
            };
            if side == "buy" {
                // Size the buy on the price it is actually PLACED at, not on the
                // expected price. A residual of 44.5 USDT sized at 0.089 is 500
                // DOGE, but the order goes out at 0.0892225 and would need 44.61
                // USDT to fill - 0.11 more than the venue holds. The venue rejects
                // it for insufficient funds, or fills it partially and leaves the
                // rest of the stranded money stranded. Dividing by limit_price
                // spends at most the residual.
                unwind_amount = amount / limit_price;
            } else {
                unwind_amount = amount;
            }
            let mut step = HashMap::new();
            step.insert("stepIndex".into(), Value::Float(steps.len() as f64));
            step.insert("exchangeId".into(), Value::Str(exchange_id.clone()));
            step.insert("symbol".into(), Value::Str(symbol));
            step.insert("side".into(), Value::Str(side.to_string()));
            // base and quote are carried so that an unwind plan can be fed
            // straight back into check_execution_plan_safety: unwinding is
            // trading, and it is subject to the same 25 USD cap.
            step.insert("base".into(), Value::Str(market_base));
            step.insert("quote".into(), Value::Str(market_quote));
            step.insert("asset".into(), Value::Str(asset.clone()));
            step.insert("counterAsset".into(), Value::Str(counter_asset.clone()));
            step.insert("amount".into(), Value::Float(unwind_amount));
            step.insert("expectedPrice".into(), Value::Float(price));
            step.insert("limitPrice".into(), Value::Float(limit_price));
            // Notional at the price the order is actually placed at: this plan is
            // fed back into check_execution_plan_safety, and a cap that was
            // checked against the expected price under-counts what the buy above
            // really spends.
            step.insert(
                "notionalQuote".into(),
                Value::Float(unwind_amount * limit_price),
            );
            step.insert("reachesFrom".into(), Value::Bool(counter_asset == from_asset));
            step.insert("isDestination".into(), Value::Bool(asset == to_asset));
            steps.push(Value::Map(step));
        }
        let mut plan = HashMap::new();
        plan.insert("from".into(), Value::Str(from_asset));
        plan.insert("to".into(), Value::Str(to_asset));
        plan.insert("halted".into(), Value::Bool(self.bool_at(report, "halted", false)));
        plan.insert("haltReason".into(), Value::Str(self.string_at(report, "haltReason", "")));
        plan.insert("residualCount".into(), Value::Float(residual_count as f64));
        plan.insert("requiresConfirmation".into(), Value::Bool(true));
        plan.insert("automatic".into(), Value::Bool(false));
        plan.insert("steps".into(), Value::List(steps));
        plan.insert("unresolved".into(), Value::List(unresolved));
        Value::Map(plan)
    }

    fn unresolved_entry(exchange_id: &str, asset: &str, amount: f64, reason: &str) -> Value {
        let mut entry = HashMap::new();
        entry.insert("exchangeId".into(), Value::Str(exchange_id.to_string()));
        entry.insert("asset".into(), Value::Str(asset.to_string()));
        entry.insert("amount".into(), Value::Float(amount));
        entry.insert("reason".into(), Value::Str(reason.to_string()));
        Value::Map(entry)
    }
}

// ---------------------------------------------------------------------------
// I/O: the router HTTP client
// ---------------------------------------------------------------------------

/// The query keys forwarded to GET /route, in a fixed order so that two ports
/// build a byte-identical URL.
const ROUTE_QUERY_KEYS: [&str; 14] = [
    "amountIn", "amountOut", "strategy", "maxVenues", "bridges", "exchanges", "balances",
    "balanceMode", "includeQuotes", "includeFees", "certified", "requireFullFill",
    "hopPenaltyBps", "minLegNotional",
];

impl OrderRouter {
    /// Percent-encodes exactly what JavaScript's `encodeURIComponent` leaves
    /// alone, so six ports produce the same URL byte for byte.
    ///
    /// Deliberately not `urlencoding::encode`: that is `application/x-www-form-
    /// urlencoded`, which escapes `!`, `'`, `(`, `)`, `*` and renders a space as
    /// `+`. `encodeURIComponent` does neither. A route whose bridge list or
    /// balances string contains any of those would sign a different URL here
    /// than in the other five.
    fn encode_uri_component(text: &str) -> String {
        let mut out = String::with_capacity(text.len());
        for byte in text.as_bytes() {
            let c = *byte;
            let unreserved = c.is_ascii_alphanumeric()
                || matches!(c, b'-' | b'_' | b'.' | b'!' | b'~' | b'*' | b'\'' | b'(' | b')');
            if unreserved {
                out.push(c as char);
            } else {
                out.push_str(&format!("%{:02X}", c));
            }
        }
        out
    }

    /// Renders one query parameter's value the way the other five ports do.
    fn query_text(&self, value: &Value) -> RouterResult<String> {
        Ok(match value {
            Value::Bool(flag) => (if *flag { "true" } else { "false" }).to_string(),
            Value::Int(n) => self.format_number(*n as f64)?,
            Value::Float(n) => self.format_number(*n)?,
            Value::Arr(items) => items
                .iter()
                .map(|item| match item {
                    Value::Str(s) => s.clone(),
                    other => format!("{other:?}"),
                })
                .collect::<Vec<String>>()
                .join(","),
            Value::Str(s) => s.clone(),
            other => format!("{other:?}"),
        })
    }

    /// Builds the fully-formed `/route` url, including the query string.
    ///
    /// Split out from `fetch_route` so the URL construction — the part that has
    /// to be byte-identical across six languages — is testable without a
    /// network.
    pub fn build_route_url(
        &self,
        from_asset: &str,
        to_asset: &str,
        params: &Value,
    ) -> RouterResult<String> {
        if from_asset.is_empty() || to_asset.is_empty() {
            return Err(arguments_required("fetchRoute requires fromAsset and toAsset"));
        }
        let has_amount_in = field(params, "amountIn").is_some();
        let has_amount_out = field(params, "amountOut").is_some();
        if has_amount_in == has_amount_out {
            // Refused client-side for the same reason the router refuses it: a
            // typo must not become a confidently wrong route.
            return Err(bad_request("fetchRoute requires exactly one of amountIn or amountOut"));
        }
        let mut query = format!(
            "from={}&to={}",
            Self::encode_uri_component(&from_asset.to_uppercase()),
            Self::encode_uri_component(&to_asset.to_uppercase())
        );
        for key in ROUTE_QUERY_KEYS.iter() {
            let value = match field(params, key) {
                Some(found) => found,
                None => continue,
            };
            let text = self.query_text(value)?;
            query.push('&');
            query.push_str(key);
            query.push('=');
            query.push_str(&Self::encode_uri_component(&text));
        }
        Ok(format!("{}/route?{}", self.base_url, query))
    }

    /// Asks the router how to convert one asset into another, over the venues
    /// and bridges it has live books for.
    ///
    /// An unroutable pair comes back as a RouteResult carrying an
    /// `unroutableReason`, NOT as an error: refusing to quote is a deliberate
    /// outcome, not a failure.
    pub async fn fetch_route(
        &self,
        from_asset: &str,
        to_asset: &str,
        params: &Value,
    ) -> RouterResult<Value> {
        let url = self.build_route_url(from_asset, to_asset, params)?;
        let mut route = self.request(&url).await?;
        // Stamp what THIS CLIENT asked for, client-side, so build_execution_plan
        // can check the answer against the question. Everything else in the
        // response — from, to, pair, side — is the server's word for it, and the
        // plan used to trust all of it: a compromised or simply buggy router
        // could name any real market and the safety checks, which only test
        // internal consistency against that market, would pass it under the
        // 25 USD cap.
        Self::put(&mut route, "clientRequestedFrom", Value::Str(from_asset.to_uppercase()));
        Self::put(&mut route, "clientRequestedTo", Value::Str(to_asset.to_uppercase()));
        Ok(route)
    }

    /// Performs the authenticated GET and maps router status codes onto ccxt
    /// error kinds.
    pub async fn request(&self, url: &str) -> RouterResult<Value> {
        let client = reqwest::Client::builder()
            .timeout(std::time::Duration::from_millis(self.timeout_ms.max(0.0) as u64))
            .build()
            .map_err(|e| ExchangeError::new("ExchangeNotAvailable", format!("OrderRouter could not build an http client: {e}")))?;
        let response = client
            .get(url)
            .header("x-api-key", &self.api_key)
            .header("Accept", "application/json")
            .send()
            .await;
        let response = match response {
            Ok(found) => found,
            Err(e) => {
                if e.is_timeout() {
                    return Err(ExchangeError::new(
                        "RequestTimeout",
                        format!("OrderRouter request timed out after {}ms", self.timeout_ms),
                    ));
                }
                return Err(ExchangeError::new(
                    "ExchangeNotAvailable",
                    format!("OrderRouter request failed: {e}"),
                ));
            }
        };
        let status = response.status().as_u16();
        let text = response.text().await.map_err(|e| {
            ExchangeError::new("ExchangeNotAvailable", format!("OrderRouter request failed: {e}"))
        })?;
        let parsed: serde_json::Value = serde_json::from_str(&text)
            .map_err(|_| exchange_error("OrderRouter returned a non-JSON body"))?;
        let body = Value::from_json(&parsed);
        if (200..300).contains(&status) {
            return Ok(body);
        }
        // 404 and 501 carry a complete RouteResult explaining the refusal —
        // `no_market` and `exact_out_multi_hop_unsupported` are routing
        // outcomes, and turning them into errors would make the caller parse an
        // error string to recover a structure it already has.
        if (status == 404 || status == 501) && !self.string_at(&body, "unroutableReason", "").is_empty() {
            return Ok(body);
        }
        let message = self.string_at(&body, "error", &format!("http status {status}"));
        let kind = match status {
            400 => "BadRequest",
            401 | 403 => "AuthenticationError",
            429 => "RateLimitExceeded",
            408 | 504 => "RequestTimeout",
            _ => "ExchangeError",
        };
        Err(ExchangeError::new(kind, format!("OrderRouter: {message}")))
    }
}

// ---------------------------------------------------------------------------
// IMPURE: execute
// ---------------------------------------------------------------------------

/// The strategies `execute` accepts. Anything else is refused before a venue is
/// touched, rather than silently falling through to a default.
const KNOWN_STRATEGIES: [&str; 6] = [
    "dry_run", "sequential", "parallel_within_hop", "limit_protected", "best_effort", "atomic_ish",
];

impl OrderRouter {
    /// The stable identity of an execution, used both for the re-execution guard
    /// and for the per-step client order ids.
    ///
    /// A caller-supplied `idempotencyKey` WINS over the plan's own `requestId`:
    /// passing one is a deliberate statement about what this execution is, and it
    /// is the only identity a hand-assembled plan can have — `execute` takes any
    /// dictionary of the plan shape, not only the output of `build_execution_plan`,
    /// and a plan a user built themselves never went through a routing request and
    /// so never had a `requestId`. Nothing is invented when both are absent: a
    /// generated identity would be either random, which defeats both mechanisms
    /// that depend on it, or a fingerprint of the plan's contents, which makes two
    /// plans that happen to agree indistinguishable.
    pub fn plan_identity(&self, plan: &Value, options: &Value) -> String {
        let idempotency_key = self.string_at(options, "idempotencyKey", "");
        if !idempotency_key.is_empty() {
            return idempotency_key;
        }
        self.string_at(plan, "requestId", "")
    }

    /// Derives the deterministic client order id for one step, so that a second
    /// run of the same plan re-sends ids the venue has already seen and is
    /// rejected as a duplicate instead of filled.
    pub fn client_order_id_for(&self, plan_id: &str, step_index: f64) -> String {
        let text = self.format_number(step_index).unwrap_or_else(|_| "0".to_string());
        format!("{plan_id}-{text}")
    }

    /// Counts the distinct hops a step list spans, which is the only authority
    /// on whether a plan is multi-hop.
    fn hop_count_of(&self, steps: &[Value]) -> usize {
        // A vector rather than a set, so the count is the same in six languages
        // and does not depend on hash iteration order.
        let mut seen: Vec<f64> = Vec::new();
        for step in steps {
            let hop_index = self.number_at(step, "hopIndex", 0.0);
            if !seen.iter().any(|s| *s == hop_index) {
                seen.push(hop_index);
            }
        }
        seen.len()
    }

    /// A deep-enough copy of the plan's steps that resizing them cannot reach
    /// back into the caller's plan.
    fn clone_steps(&self, plan: &Value) -> Vec<Value> {
        let mut copied = Vec::new();
        for step in self.list_at(plan, "steps") {
            let mut fresh = HashMap::new();
            if let Some(map) = step.as_map() {
                for (key, value) in map.iter() {
                    fresh.insert(key.clone(), value.clone());
                }
            }
            copied.push(Value::Map(fresh));
        }
        copied
    }

    /// The report skeleton, with one planned result per step.
    fn empty_report(
        &self,
        plan: &Value,
        strategy: &str,
        requested_strategy: &str,
        live: bool,
        steps: &[Value],
    ) -> Value {
        let mut results = Vec::new();
        for step in steps {
            let mut result = HashMap::new();
            result.insert("stepIndex".into(), Value::Float(self.number_at(step, "stepIndex", -1.0)));
            result.insert("hopIndex".into(), Value::Float(self.number_at(step, "hopIndex", 0.0)));
            result.insert("legIndex".into(), Value::Float(self.number_at(step, "legIndex", 0.0)));
            result.insert("exchangeId".into(), Value::Str(self.string_at(step, "exchangeId", "")));
            result.insert("symbol".into(), Value::Str(self.string_at(step, "symbol", "")));
            result.insert("side".into(), Value::Str(self.string_at(step, "side", "")));
            result.insert("status".into(), Value::Str("planned".into()));
            result.insert("requestedAmount".into(), Value::Float(self.number_at(step, "amount", 0.0)));
            result.insert("filledAmount".into(), Value::Float(0.0));
            result.insert("averagePrice".into(), Value::Float(0.0));
            result.insert("cost".into(), Value::Float(0.0));
            result.insert("inAsset".into(), Value::Str(String::new()));
            result.insert("inAmount".into(), Value::Float(0.0));
            result.insert("outAsset".into(), Value::Str(String::new()));
            result.insert("outAmount".into(), Value::Float(0.0));
            result.insert("orderId".into(), Value::Str(String::new()));
            result.insert("clientOrderId".into(), Value::Str(String::new()));
            result.insert("errorCode".into(), Value::Str(String::new()));
            // False until an order is actually dispatched — a failure before
            // dispatch cannot have left anything resting on a venue.
            result.insert("placementAttempted".into(), Value::Bool(false));
            results.push(Value::Map(result));
        }
        let mut report = HashMap::new();
        // A placeholder: execute resolves the real identity from the plan AND the
        // options and overwrites it before anything reads this field.
        report.insert("planId".into(), Value::Str(String::new()));
        report.insert("strategy".into(), Value::Str(strategy.to_string()));
        report.insert("requestedStrategy".into(), Value::Str(requested_strategy.to_string()));
        report.insert("dryRun".into(), Value::Bool(strategy == "dry_run"));
        report.insert("live".into(), Value::Bool(live));
        report.insert("from".into(), Value::Str(self.string_at(plan, "from", "")));
        report.insert("to".into(), Value::Str(self.string_at(plan, "to", "")));
        report.insert("slippageBps".into(), Value::Float(self.number_at(plan, "slippageBps", DEFAULT_SLIPPAGE_BPS)));
        report.insert(
            "reconcileToleranceRatio".into(),
            Value::Float(self.number_at(plan, "reconcileToleranceRatio", DEFAULT_RECONCILE_TOLERANCE)),
        );
        report.insert("stepCount".into(), Value::Float(steps.len() as f64));
        report.insert("wouldPlaceOrders".into(), Value::Float(0.0));
        report.insert("ordersPlaced".into(), Value::Float(0.0));
        report.insert("halted".into(), Value::Bool(false));
        report.insert("haltReason".into(), Value::Str(String::new()));
        report.insert("haltStepIndex".into(), Value::Float(-1.0));
        report.insert("filledIn".into(), Value::Float(0.0));
        report.insert("filledOut".into(), Value::Float(0.0));
        report.insert("steps".into(), Value::List(results));
        report.insert("openOrders".into(), Value::List(Vec::new()));
        report.insert("errors".into(), Value::List(Vec::new()));
        report.insert("reconciliations".into(), Value::List(Vec::new()));
        Value::Map(report)
    }

    /// Appends one entry to a list-valued field of a container.
    fn append_to(container: &mut Value, key: &str, entry: Value) {
        let mut items = match container.as_map().and_then(|m| m.get(key)) {
            Some(Value::Arr(existing)) => existing.as_ref().clone(),
            _ => Vec::new(),
        };
        items.push(entry);
        Self::put(container, key, Value::List(items));
    }

    /// Records an error against the report.
    fn record_error(&self, report: &mut Value, step_index: f64, exchange_id: &str, symbol: &str, code: &str) {
        let mut entry = HashMap::new();
        entry.insert("stepIndex".into(), Value::Float(step_index));
        entry.insert("exchangeId".into(), Value::Str(exchange_id.to_string()));
        entry.insert("symbol".into(), Value::Str(symbol.to_string()));
        entry.insert("code".into(), Value::Str(code.to_string()));
        Self::append_to(report, "errors", Value::Map(entry));
    }

    /// Records an order that may still be resting on a venue.
    fn record_open_order(&self, report: &mut Value, exchange_id: &str, symbol: &str, order_id: &str, reason: &str) {
        let mut entry = HashMap::new();
        entry.insert("exchangeId".into(), Value::Str(exchange_id.to_string()));
        entry.insert("symbol".into(), Value::Str(symbol.to_string()));
        entry.insert("orderId".into(), Value::Str(order_id.to_string()));
        entry.insert("reason".into(), Value::Str(reason.to_string()));
        Self::append_to(report, "openOrders", Value::Map(entry));
    }

    /// Records a placement whose outcome is genuinely unknown — the request may
    /// or may not have reached the venue, so an order may or may not exist.
    fn record_unconfirmed_placement(&self, report: &mut Value, exchange_id: &str, symbol: &str, reason: &str) {
        // No order id, because there is none to record: that is the whole
        // problem. It goes on openOrders regardless, because the one thing a
        // caller must not conclude is that nothing was placed.
        self.record_open_order(report, exchange_id, symbol, "", reason);
    }

    /// Reports whether a thrown error leaves a placement's outcome genuinely
    /// unknown.
    fn is_outcome_unknown_error(&self, error: &ExchangeError) -> bool {
        // Four names, matched exactly — the same list the other five ports use.
        //
        // NOT `error.is("NetworkError")`: that walks the hierarchy, and in
        // ccxt's tree DDoSProtection, RateLimitExceeded and InvalidNonce are
        // all children of NetworkError. Those are the venue ANSWERING — a
        // rate-limit rejection is a definite "no order was placed" — so the
        // walk reported every throttled request as a possibly-live order,
        // halting a route the other five ports complete and sending an
        // operator hunting for an order that never existed.
        matches!(
            error.kind.as_str(),
            "RequestTimeout" | "ExchangeNotAvailable" | "NetworkError" | "OnMaintenance"
        )
    }

    /// Marks every step from an index onwards as skipped after a halt.
    fn mark_remaining_skipped(&self, report: &mut Value, start: usize) {
        let mut results = self.list_at(report, "steps");
        for result in results.iter_mut().skip(start) {
            if self.string_at(result, "status", "") == "planned" {
                Self::put(result, "status", Value::Str("skipped".into()));
            }
        }
        Self::put(report, "steps", Value::List(results));
    }

    /// Totals the report's fills once the loops are done.
    fn summarise_report(&self, report: &mut Value, steps: &[Value]) {
        let results = self.list_at(report, "steps");
        // filledIn is denominated in the route's FROM asset and filledOut in its
        // TO asset, which is only true if each is summed over one hop: the first
        // and the last. Summing inAmount and outAmount across every step, as
        // this port did, adds USDT to BTC to ETH and reports the total as one
        // number — meaningless on any route longer than a single hop, and
        // meaningless in a way that reads like a figure.
        let mut last_hop = 0.0;
        for step in steps {
            let hop_index = self.number_at(step, "hopIndex", 0.0);
            if hop_index > last_hop {
                last_hop = hop_index;
            }
        }
        let mut filled_in = 0.0;
        let mut filled_out = 0.0;
        for result in &results {
            let hop_index = self.number_at(result, "hopIndex", 0.0);
            if hop_index == 0.0 {
                filled_in += self.number_at(result, "inAmount", 0.0);
            }
            if hop_index == last_hop {
                filled_out += self.number_at(result, "outAmount", 0.0);
            }
        }
        // ordersPlaced is NOT recomputed here. It is incremented as each order is
        // placed, so it counts an outcome_unknown step too — a status-derived
        // recount silently dropped exactly those, which are the placements an
        // operator most needs to know about.
        Self::put(report, "filledIn", Value::Float(filled_in));
        Self::put(report, "filledOut", Value::Float(filled_out));
        Self::put(report, "stepCount", Value::Float(steps.len() as f64));
    }
}

impl OrderRouter {
    /// Sums the fees an order charged in one asset, ignoring any other currency.
    fn order_fee_in_asset(&self, order: &Value, asset: &str) -> f64 {
        if asset.is_empty() {
            return 0.0;
        }
        let mut total = 0.0;
        // ccxt sets a single `fee` and, since safeOrder, a `fees` list alongside
        // it. Reading only one would under-count on venues that report per-trade
        // fees, so both are summed — with `fee` skipped when it is also present
        // in `fees`, which is how safeOrder fills them in.
        let fees = self.list_at(order, "fees");
        let mut saw_in_list = false;
        for entry in &fees {
            if self.string_at(entry, "currency", "").to_uppercase() == asset.to_uppercase() {
                total += self.number_at(entry, "cost", 0.0);
                saw_in_list = true;
            }
        }
        if !saw_in_list {
            let single = self.dict_at(order, "fee");
            if self.string_at(&single, "currency", "").to_uppercase() == asset.to_uppercase() {
                total += self.number_at(&single, "cost", 0.0);
                saw_in_list = true;
            }
        }
        if !saw_in_list {
            // Last resort: a venue that reports its cut only per trade. The Go
            // port has no `fees` list on its typed Order at all, so this
            // fallback is what lets all six ports read the same fee off the same
            // order — and reading NOTHING here is the dangerous direction, not
            // the safe one: an unread fee leaves out_amount GROSS, which sizes
            // the next hop on money the venue already took.
            let trades = self.list_at(order, "trades");
            for trade in &trades {
                let trade_fee = self.dict_at(trade, "fee");
                if self.string_at(&trade_fee, "currency", "").to_uppercase() == asset.to_uppercase() {
                    total += self.number_at(&trade_fee, "cost", 0.0);
                }
            }
        }
        if !Self::is_finite_number(total) || total < 0.0 {
            return 0.0;
        }
        total
    }

    /// One re-read of an order the venue answered incompletely, falling back to
    /// what we already had rather than losing the placement record.
    async fn refetch_order(
        &self,
        venue: &dyn RouterVenue,
        order_id: &str,
        symbol: &str,
        fallback: Value,
    ) -> Value {
        match venue.fetch_order(order_id, symbol).await {
            Ok(reread) => reread,
            // The caller marks the fill unknown; a failure here must not lose
            // the placement record.
            Err(_) => fallback,
        }
    }

    /// Re-checks the notional cap immediately before a placement, and does
    /// nothing at all when the caller never asked for one.
    fn assert_under_cap(
        &self,
        step: &Value,
        amount: f64,
        price: f64,
        usd_rates: &Value,
        options: &Value,
    ) -> RouterResult<()> {
        let cap = self.number_at(options, "maxNotionalUsd", self.max_notional_usd);
        if cap <= 0.0 {
            // No cap set, so there is nothing to enforce here.
            return Ok(());
        }
        let usd_value = self.notional_usd(step, amount * price, usd_rates);
        if usd_value <= 0.0 {
            return Err(exchange_error(
                "OrderRouter: refusing to place an order that cannot be valued in USD",
            ));
        }
        if usd_value > cap * (1.0 + TOLERANCE) {
            return Err(exchange_error(&format!(
                "OrderRouter: refusing to place an order of {usd_value} USD, over the {cap} USD cap"
            )));
        }
        Ok(())
    }

    /// Places one order for one step and never returns an error, so that a
    /// sibling leg's failure cannot abandon an in-flight order.
    async fn place_step(
        &self,
        step: &Value,
        venues: &std::collections::BTreeMap<String, Box<dyn RouterVenue>>,
        options: &Value,
        usd_rates: &Value,
        strategy: &str,
        report: &mut Value,
    ) -> Value {
        let step_index = self.number_at(step, "stepIndex", -1.0);
        let exchange_id = self.string_at(step, "exchangeId", "");
        let symbol = self.string_at(step, "symbol", "");
        let side = self.string_at(step, "side", "");
        let mut result = HashMap::new();
        result.insert("stepIndex".into(), Value::Float(step_index));
        // Carried from the step, not derived. Without them every result read as
        // hopIndex 0, which is what let summarise_report sum a two-hop route's
        // spends together — and it is also how a caller tells which hop a result
        // belongs to at all.
        result.insert("hopIndex".into(), Value::Float(self.number_at(step, "hopIndex", 0.0)));
        result.insert("legIndex".into(), Value::Float(self.number_at(step, "legIndex", 0.0)));
        result.insert("exchangeId".into(), Value::Str(exchange_id.clone()));
        result.insert("symbol".into(), Value::Str(symbol.clone()));
        result.insert("side".into(), Value::Str(side.clone()));
        result.insert("status".into(), Value::Str("failed".into()));
        result.insert("requestedAmount".into(), Value::Float(self.number_at(step, "amount", 0.0)));
        result.insert("filledAmount".into(), Value::Float(0.0));
        result.insert("averagePrice".into(), Value::Float(0.0));
        result.insert("cost".into(), Value::Float(0.0));
        result.insert("inAsset".into(), Value::Str(String::new()));
        result.insert("inAmount".into(), Value::Float(0.0));
        result.insert("outAsset".into(), Value::Str(String::new()));
        result.insert("outAmount".into(), Value::Float(0.0));
        result.insert("orderId".into(), Value::Str(String::new()));
        result.insert("clientOrderId".into(), Value::Str(String::new()));
        result.insert("errorCode".into(), Value::Str(String::new()));
        result.insert("placementAttempted".into(), Value::Bool(false));
        let mut result = Value::Map(result);

        let venue = match venues.get(&exchange_id) {
            Some(found) => found,
            None => {
                Self::put(&mut result, "errorCode", Value::Str("venue_missing".into()));
                self.record_error(report, step_index, &exchange_id, &symbol, "venue_missing");
                return result;
            }
        };
        let amount = self.parse_number(&venue.amount_to_precision(&symbol, self.number_at(step, "amount", 0.0)), 0.0);
        let price = self.parse_number(&venue.price_to_precision(&symbol, self.number_at(step, "limitPrice", 0.0)), 0.0);
        if !(amount > 0.0) || !(price > 0.0) {
            Self::put(&mut result, "errorCode", Value::Str("rounded_to_zero".into()));
            self.record_error(report, step_index, &exchange_id, &symbol, "rounded_to_zero");
            return result;
        }
        // CLAUDE.md: compute the notional before EVERY createOrder. The
        // plan-level check already ran, but the plan can have been resized by a
        // reconciliation since, and the snapped price is not the one that was
        // checked.
        if let Err(e) = self.assert_under_cap(step, amount, price, usd_rates, options) {
            Self::put(&mut result, "errorCode", Value::Str("over_cap".into()));
            self.record_error(report, step_index, &exchange_id, &symbol, "over_cap");
            let _ = e;
            return result;
        }
        let mut order_params = self.dict_at(options, "orderParams");
        // IDEMPOTENCY, half two: a client order id derived from the plan's own
        // identity and this step's index. Deterministic, so a second run of the same
        // plan re-sends an id the venue has already seen and is rejected as a
        // duplicate rather than filled. It is set AFTER the caller's orderParams are
        // copied and deliberately overrides a clientOrderId found there: one id
        // reused across every step of a plan is worse than none at all.
        let client_order_id =
            self.client_order_id_for(&self.string_at(report, "planId", ""), step_index);
        Self::put(&mut order_params, "clientOrderId", Value::Str(client_order_id.clone()));
        Self::put(&mut result, "clientOrderId", Value::Str(client_order_id));

        // Dispatch. `placementAttempted` is set immediately before the call and
        // not a line earlier: everything above this point is a refusal that
        // cannot have reached a venue.
        let order = if strategy == "limit_protected" {
            self.place_protected_limit(
                venue.as_ref(), step, &symbol, &side, amount, price, &order_params, options,
                report, &mut result,
            )
            .await
        } else {
            self.place_immediate_order(
                venue.as_ref(), &symbol, &side, amount, price, &order_params, options, &mut result,
            )
            .await
        };
        let order = match order {
            Ok(placed) => placed,
            Err(e) => {
                Self::put(&mut result, "errorCode", Value::Str(e.kind.clone()));
                self.record_error(report, step_index, &exchange_id, &symbol, &e.kind);
                // createOrder may already have succeeded: every path between it and the final
                // read — a poll that times out, a network drop, a cap re-check — leaves a real
                // order on a real venue. Reporting the id is the difference between an operator
                // who can go cancel it and one who never learns it exists. (This branch was
                // missing from the Rust port: a limit_protected order whose poll threw was
                // reported as a plain failure with no id anywhere in the report.)
                let known_id = self.string_at(&result, "orderId", "");
                if !known_id.is_empty() {
                    // "failed" would read as "nothing happened" while openOrders says the
                    // opposite, and one report must not carry both readings. Having an id means
                    // create_order RETURNED — the venue accepted something — so whatever threw
                    // afterwards left a real order behind whose fill is simply unknown to us.
                    Self::put(&mut result, "status", Value::Str("outcome_unknown".into()));
                    self.record_open_order(report, &exchange_id, &symbol, &known_id, "outcome_unknown");
                    return result;
                }
                if self.bool_at(&result, "placementAttempted", false) && self.is_outcome_unknown_error(&e) {
                    // The request may or may not have reached the venue. Halting
                    // on an unknown quantity is recoverable; concluding that
                    // nothing was placed is not.
                    Self::put(&mut result, "status", Value::Str("outcome_unknown".into()));
                    self.record_unconfirmed_placement(report, &exchange_id, &symbol, "placement_unconfirmed");
                }
                return result;
            }
        };
        self.settle_order_into_result(&order, step, &mut result, venue.as_ref(), &symbol, &exchange_id, amount, price, report, strategy).await;
        result
    }
}

impl OrderRouter {
    /// Places an immediate-or-cancel limit order, or — only with explicit
    /// opt-in — a market order on a venue that cannot do IOC.
    async fn place_immediate_order(
        &self,
        venue: &dyn RouterVenue,
        symbol: &str,
        side: &str,
        amount: f64,
        price: f64,
        order_params: &Value,
        options: &Value,
        result: &mut Value,
    ) -> RouterResult<Value> {
        if venue.supports_ioc() {
            let mut params = order_params.clone();
            Self::put(&mut params, "timeInForce", Value::Str("IOC".into()));
            // Set immediately before the call that can leave a real order on a
            // real venue, and never reset. Anything that fails before this point
            // — a missing venue, a size that rounds to zero, the notional cap, a
            // venue that cannot do IOC — dispatched nothing, and recording an
            // unconfirmed placement for it would be a false alarm.
            Self::put(result, "placementAttempted", Value::Bool(true));
            let order = venue.create_order(symbol, "limit", side, amount, price, &params).await?;
            Self::put(result, "orderId", Value::Str(self.string_at(&order, "id", "")));
            return Ok(order);
        }
        if !self.bool_at(options, "allowMarketOrders", false) {
            // A market order is an unbounded price, and switching to one on a
            // caller's behalf is exactly the decision they did not delegate.
            return Err(ExchangeError::new(
                "NotSupported",
                "OrderRouter: venue cannot do IOC and allowMarketOrders was not set",
            ));
        }
        // A market order and a notional cap cannot both be honoured. assertUnderCap valued this order
        // at the plan's LIMIT price, and the call below sends no price at all: the venue fills wherever
        // the book is, which is the one thing the cap exists to bound. Passing the check and then
        // removing the price it was computed from is a cap that silently disappears, which by this
        // file's own rule is not a cap. So the two options are refused together.
        if self.number_at(options, "maxNotionalUsd", self.max_notional_usd) > 0.0 {
            return Err(ExchangeError::new("NotSupported", "OrderRouter: allowMarketOrders cannot be honoured under a maxNotionalUsd cap, because a market order has no price to check"));
        }
        Self::put(result, "placementAttempted", Value::Bool(true));
        // Price 0 stands for "no price", which is what a market order carries.
        let order = venue.create_order(symbol, "market", side, amount, 0.0, order_params).await?;
        Self::put(result, "orderId", Value::Str(self.string_at(&order, "id", "")));
        Ok(order)
    }

    /// Rests a limit order, then cancels it on timeout and ALWAYS re-reads it,
    /// because a cancel and a fill can cross.
    #[allow(clippy::too_many_arguments)]
    async fn place_protected_limit(
        &self,
        venue: &dyn RouterVenue,
        step: &Value,
        symbol: &str,
        side: &str,
        amount: f64,
        price: f64,
        order_params: &Value,
        options: &Value,
        report: &mut Value,
        result: &mut Value,
    ) -> RouterResult<Value> {
        let timeout_ms = self.number_at(options, "orderTimeoutMs", 20000.0);
        let poll_interval_ms = self.number_at(options, "pollIntervalMs", 1000.0);
        Self::put(result, "placementAttempted", Value::Bool(true));
        let mut order = venue.create_order(symbol, "limit", side, amount, price, order_params).await?;
        let order_id = self.string_at(&order, "id", "");
        // Before the first poll, the first sleep and the first thing that can go
        // wrong: from here on the caller can always name what is resting.
        Self::put(result, "orderId", Value::Str(order_id.clone()));
        let mut waited = 0.0;
        while waited < timeout_ms {
            let status = self.string_at(&order, "status", "");
            if status == "closed" || status == "canceled" {
                return Ok(order);
            }
            tokio::time::sleep(std::time::Duration::from_millis(poll_interval_ms.max(0.0) as u64)).await;
            waited += poll_interval_ms;
            order = venue.fetch_order(&order_id, symbol).await?;
        }
        let final_status = self.string_at(&order, "status", "");
        if final_status == "closed" || final_status == "canceled" {
            // The venue ended it on the last poll — an expiry, a self-trade
            // prevention, a post-only rejection of the remainder. Cancelling an
            // order the venue already closed throws, and the partial fill this
            // order carries is real: dropping it would hide a live position from
            // the report AND from the unwind plan built out of it.
            return Ok(order);
        }
        if venue.cancel_order(&order_id, symbol).await.is_err() {
            // The order may still be live. Reporting a fill we did not observe
            // would be a lie, and continuing to the next hop on top of an
            // unknown position is worse.
            self.record_open_order(report, &self.string_at(step, "exchangeId", ""), symbol, &order_id, "cancel_failed");
            return Err(exchange_error(
                "OrderRouter: cancelOrder failed and an order is left OPEN, refusing to proceed",
            ));
        }
        // ALWAYS re-read after a cancel: the cancel and the fill can cross, and
        // the observed order is the only authority on what actually happened.
        venue.fetch_order(&order_id, symbol).await
    }

    /// Reads a placed order into the step result: the fill, the direction, the
    /// fee netting and the status.
    #[allow(clippy::too_many_arguments)]
    async fn settle_order_into_result(
        &self,
        order: &Value,
        step: &Value,
        result: &mut Value,
        venue: &dyn RouterVenue,
        symbol: &str,
        exchange_id: &str,
        amount: f64,
        price: f64,
        report: &mut Value,
        strategy: &str,
    ) {
        let mut order = order.clone();
        // "The venue said zero" and "the venue said nothing" are different facts
        // and used to produce the same number. A venue that omits `filled`
        // yielded 0, reconciliation read that as nothing_filled and halted the
        // route — while a real position sat on a real venue. So presence is
        // tested, not the value.
        let order_id = self.string_at(result, "orderId", "");
        if !self.has_number_at(&order, "filled") && !order_id.is_empty() {
            // One re-read, exactly as place_protected_limit already does after
            // its poll. The immediate path never did, so it could only ever
            // fabricate.
            order = self.refetch_order(venue, &order_id, symbol, order.clone()).await;
        }
        // An order the venue explicitly calls open is RESTING, and on this path
        // it must not be: place_immediate_order asked for immediate-or-cancel, so
        // a venue that silently dropped the timeInForce param has left a plain
        // limit order sitting on the book. Recording it and walking on was not
        // enough — the next hop then trades on top of a position that keeps
        // growing behind it, is sized from a fill that is already out of date, and
        // the leftover order is still live after the route has ended and nobody is
        // watching it. So it is cancelled and re-read here, exactly as
        // place_protected_limit does on its timeout path.
        let mut resting_cancel_failed = false;
        if strategy != "limit_protected" && self.string_at(&order, "status", "") == "open" && !order_id.is_empty() {
            if venue.cancel_order(&order_id, symbol).await.is_err() {
                // The order may still be live and its fill can still move, so
                // whatever this step reports below is a snapshot that is already
                // stale. The status is downgraded after the amounts are filled in,
                // not here: a cost the venue DID report is a fact, and
                // build_unwind_plan subtracts it.
                resting_cancel_failed = true;
            } else {
                // ALWAYS re-read after a cancel: the cancel and the fill can
                // cross, and the observed order is the only authority on what
                // actually happened.
                order = self.refetch_order(venue, &order_id, symbol, order.clone()).await;
            }
        }
        let filled_known = self.has_number_at(&order, "filled");
        let filled = self.number_at(&order, "filled", 0.0);
        let average_known = self.has_number_at(&order, "average") || self.has_number_at(&order, "price");
        let mut average = self.number_at(&order, "average", 0.0);
        if average <= 0.0 {
            average = self.number_at(&order, "price", 0.0);
        }
        if average <= 0.0 {
            average = price;
        }
        let cost_known = self.has_number_at(&order, "cost");
        let mut cost = self.number_at(&order, "cost", 0.0);
        if cost <= 0.0 {
            cost = filled * average;
        }
        let side = self.string_at(step, "side", "");
        Self::put(result, "filledAmount", Value::Float(filled));
        Self::put(result, "averagePrice", Value::Float(average));
        Self::put(result, "cost", Value::Float(cost));
        // Companion flags, per the file's own "was it known" rule. A false here
        // means the number beside it is this class's best guess, not the venue's
        // answer. This port omitted all three, so a caller reading a Rust report
        // could not tell a venue's figure from a fallback.
        Self::put(result, "filledKnown", Value::Bool(filled_known));
        Self::put(result, "averageKnown", Value::Bool(average_known));
        Self::put(result, "costKnown", Value::Bool(cost_known));
        if side == "buy" {
            Self::put(result, "inAsset", Value::Str(self.string_at(step, "quote", "")));
            Self::put(result, "inAmount", Value::Float(cost));
            Self::put(result, "outAsset", Value::Str(self.string_at(step, "base", "")));
            Self::put(result, "outAmount", Value::Float(filled));
        } else {
            Self::put(result, "inAsset", Value::Str(self.string_at(step, "base", "")));
            Self::put(result, "inAmount", Value::Float(filled));
            Self::put(result, "outAsset", Value::Str(self.string_at(step, "quote", "")));
            Self::put(result, "outAmount", Value::Float(cost));
        }
        // Net the taker fee out of what is actually CARRIED FORWARD, when the
        // venue charged it in the asset this step produced. filled and cost are
        // gross of fees — the manual says so — so a venue taking its cut in the
        // acquired asset credits less than `filled`, and sizing the next hop (or
        // an unwind) on the gross figure orders more than the wallet holds. Fees
        // in any OTHER currency are left alone: they do not reduce what this hop
        // hands to the next one.
        let out_asset = self.string_at(result, "outAsset", "");
        let fee_cost = self.order_fee_in_asset(&order, &out_asset);
        Self::put(result, "feeCost", Value::Float(fee_cost));
        Self::put(result, "feeCurrency", Value::Str(out_asset));
        if fee_cost > 0.0 {
            let gross = self.number_at(result, "outAmount", 0.0);
            let mut net = gross - fee_cost;
            if net < 0.0 {
                net = 0.0;
            }
            Self::put(result, "grossOutAmount", Value::Float(gross));
            Self::put(result, "outAmount", Value::Float(net));
        }
        if !filled_known {
            // Refuse to reconcile on a fabricated fill: halting on an unknown
            // quantity is recoverable, sizing the next hop from an invented
            // number is not.
            Self::put(result, "status", Value::Str("outcome_unknown".into()));
            self.record_open_order(report, exchange_id, symbol, &self.string_at(result, "orderId", ""), "fill_unconfirmed");
            // An order WAS placed, and this is exactly the path where knowing
            // that matters most. Counted here, as in the other five ports.
            Self::put(report, "ordersPlaced", Value::Float(self.number_at(report, "ordersPlaced", 0.0) + 1.0));
            return;
        }
        // No halt on an unknown PRICE. This port had an extra `price_unconfirmed`
        // branch that no other has: a fill whose average or cost the venue did
        // not report falls back to the order's `price`, then to the limit price,
        // and is flagged above rather than stopping the route. The reference
        // halts on an unknown FILL — an invented quantity is what makes the next
        // hop unsafe — and reports an estimated price as an estimate.
        if filled <= 0.0 {
            Self::put(result, "status", Value::Str("unfilled".into()));
        } else if filled >= amount * (1.0 - TOLERANCE) {
            Self::put(result, "status", Value::Str("filled".into()));
        } else {
            Self::put(result, "status", Value::Str("partial".into()));
        }
        if resting_cancel_failed {
            // A resting order this class could not cancel is the worst outcome
            // there is: it can still fill, in full, after the route has returned.
            // Sizing the next hop on the fill recorded above would trade against a
            // position that is still moving, so the step is marked unknown and
            // execute_sequential stops here.
            Self::put(result, "status", Value::Str("outcome_unknown".into()));
            self.record_open_order(report, exchange_id, symbol, &self.string_at(result, "orderId", ""), "cancel_failed");
        } else if self.string_at(&order, "status", "") == "open" {
            // Cancelled — or on the limit_protected path, cancelled by
            // place_protected_limit — and the venue STILL calls it open. The order
            // is live whatever this class asked for, so the same rule applies:
            // report it, and refuse to size anything downstream from a fill that
            // can still grow.
            Self::put(result, "status", Value::Str("outcome_unknown".into()));
            self.record_open_order(report, exchange_id, symbol, &self.string_at(result, "orderId", ""), "still_open");
        }
        Self::put(report, "ordersPlaced", Value::Float(self.number_at(report, "ordersPlaced", 0.0) + 1.0));
    }
}

impl OrderRouter {
    /// Places one order at a time in plan order, reconciling after each and
    /// obeying the halt verdict.
    async fn execute_sequential(
        &self,
        report: &mut Value,
        steps: &mut Vec<Value>,
        venues: &std::collections::BTreeMap<String, Box<dyn RouterVenue>>,
        options: &Value,
        usd_rates: &Value,
        strategy: &str,
    ) {
        for i in 0..steps.len() {
            let step = steps[i].clone();
            let result = self.place_step(&step, venues, options, usd_rates, strategy, report).await;
            let mut results = self.list_at(report, "steps");
            results[i] = result.clone();
            Self::put(report, "steps", Value::List(results));
            let status = self.string_at(&result, "status", "");
            if status == "failed" || status == "outcome_unknown" {
                Self::put(report, "halted", Value::Bool(true));
                // An unknown outcome must NOT fall through to reconciliation:
                // reconciling reads outAmount, which is 0 because nothing was
                // observed, and reports the halt as "nothing_filled" — asserting
                // the one thing we do not know.
                let reason = if status == "failed" { "order_failed" } else { "outcome_unknown" };
                Self::put(report, "haltReason", Value::Str(reason.into()));
                Self::put(report, "haltStepIndex", Value::Float(i as f64));
                self.mark_remaining_skipped(report, i + 1);
                return;
            }
            let mut reconcile_plan = HashMap::new();
            reconcile_plan.insert("steps".to_string(), Value::List(steps.clone()));
            reconcile_plan.insert(
                "reconcileToleranceRatio".to_string(),
                Value::Float(self.number_at(report, "reconcileToleranceRatio", DEFAULT_RECONCILE_TOLERANCE)),
            );
            let reconciliation = match self.reconcile_execution_step(
                &Value::Map(reconcile_plan), i as i64, self.number_at(&result, "outAmount", 0.0),
            ) {
                Ok(verdict) => verdict,
                Err(_) => return,
            };
            Self::append_to(report, "reconciliations", reconciliation.clone());
            if strategy != "atomic_ish" {
                // atomic_ish is pre-funded end to end, so a hop's shortfall does
                // not shrink the next hop's order — the money for it was already
                // there before the first order went out.
                self.apply_resize(steps, &reconciliation);
            }
            if self.string_at(&reconciliation, "verdict", "") == "halt" {
                Self::put(report, "halted", Value::Bool(true));
                Self::put(report, "haltReason", Value::Str(self.string_at(&reconciliation, "reason", "")));
                Self::put(report, "haltStepIndex", Value::Float(i as f64));
                self.mark_remaining_skipped(report, i + 1);
                return;
            }
        }
    }

    /// Runs the legs of one hop concurrently ACROSS venues and serially WITHIN
    /// a venue, and the hops strictly in order.
    async fn execute_parallel_within_hop(
        &self,
        report: &mut Value,
        steps: &mut Vec<Value>,
        venues: &std::collections::BTreeMap<String, Box<dyn RouterVenue>>,
        options: &Value,
        usd_rates: &Value,
    ) {
        let mut cursor = 0usize;
        while cursor < steps.len() {
            let hop_index = self.number_at(&steps[cursor], "hopIndex", 0.0);
            let mut end = cursor;
            while end < steps.len() && self.number_at(&steps[end], "hopIndex", 0.0) == hop_index {
                end += 1;
            }
            // THE CONTRACT: concurrent ACROSS venues, serialised WITHIN a venue.
            // It is an ordering guarantee, not a performance promise, which is
            // what lets six very different runtimes honour the same words. Two
            // legs of one hop that land on the SAME venue must never have two
            // orders in flight against that venue's throttle and nonce state.
            //
            // DIVERGENCE, recorded rather than hidden: TypeScript, Python, C#
            // and Go run the venue groups concurrently. This port runs them one
            // after another. `place_step` takes `&mut Value` for the report, so
            // concurrent groups would need the report behind a lock, and a lock
            // around every record_error/record_open_order is a great deal of
            // machinery to buy back parallelism the contract does not promise.
            // Serialising everything satisfies the ordering guarantee strictly
            // more than grouping does — it is what the PHP port does, for the
            // same reason — so the report is identical either way.
            let mut group_ids: Vec<String> = Vec::new();
            for i in cursor..end {
                let exchange_id = self.string_at(&steps[i], "exchangeId", "");
                if !group_ids.contains(&exchange_id) {
                    group_ids.push(exchange_id);
                }
            }
            for group in &group_ids {
                for i in cursor..end {
                    if self.string_at(&steps[i], "exchangeId", "") != *group {
                        continue;
                    }
                    let step = steps[i].clone();
                    let result = self
                        .place_step(&step, venues, options, usd_rates, "parallel_within_hop", report)
                        .await;
                    let mut results = self.list_at(report, "steps");
                    results[i] = result;
                    Self::put(report, "steps", Value::List(results));
                }
            }
            for i in cursor..end {
                let results = self.list_at(report, "steps");
                let result = results[i].clone();
                let status = self.string_at(&result, "status", "");
                if status == "failed" || status == "outcome_unknown" {
                    Self::put(report, "halted", Value::Bool(true));
                    let reason = if status == "failed" { "order_failed" } else { "outcome_unknown" };
                    Self::put(report, "haltReason", Value::Str(reason.into()));
                    Self::put(report, "haltStepIndex", Value::Float(i as f64));
                    self.mark_remaining_skipped(report, end);
                    return;
                }
                let mut reconcile_plan = HashMap::new();
                reconcile_plan.insert("steps".to_string(), Value::List(steps.clone()));
                reconcile_plan.insert(
                    "reconcileToleranceRatio".to_string(),
                    Value::Float(self.number_at(report, "reconcileToleranceRatio", DEFAULT_RECONCILE_TOLERANCE)),
                );
                let reconciliation = match self.reconcile_execution_step(
                    &Value::Map(reconcile_plan), i as i64, self.number_at(&result, "outAmount", 0.0),
                ) {
                    Ok(verdict) => verdict,
                    Err(_) => return,
                };
                Self::append_to(report, "reconciliations", reconciliation.clone());
                self.apply_resize(steps, &reconciliation);
                if self.string_at(&reconciliation, "verdict", "") == "halt" {
                    Self::put(report, "halted", Value::Bool(true));
                    Self::put(report, "haltReason", Value::Str(self.string_at(&reconciliation, "reason", "")));
                    Self::put(report, "haltStepIndex", Value::Float(i as f64));
                    self.mark_remaining_skipped(report, end);
                    return;
                }
            }
            cursor = end;
        }
    }

    /// Places what it can and never halts, on a single hop only, up to
    /// maxOrders.
    async fn execute_best_effort(
        &self,
        report: &mut Value,
        steps: &mut [Value],
        venues: &std::collections::BTreeMap<String, Box<dyn RouterVenue>>,
        options: &Value,
        usd_rates: &Value,
    ) {
        let max_orders = self.number_at(options, "maxOrders", 0.0);
        let mut placed = 0.0;
        for i in 0..steps.len() {
            let mut results = self.list_at(report, "steps");
            if placed >= max_orders {
                Self::put(&mut results[i], "status", Value::Str("skipped".into()));
                Self::put(&mut results[i], "errorCode", Value::Str("max_orders_reached".into()));
                Self::put(report, "steps", Value::List(results));
                continue;
            }
            let step = steps[i].clone();
            let result = self.place_step(&step, venues, options, usd_rates, "best_effort", report).await;
            let mut results = self.list_at(report, "steps");
            results[i] = result;
            Self::put(report, "steps", Value::List(results));
            placed += 1.0;
            // No reconciliation and no halt: that is the whole point of the
            // strategy, and why it is refused on anything but a single hop.
        }
    }

    /// Executes a plan against live venues. THE ONLY IMPURE METHOD.
    ///
    /// `dry_run` is the default, and `options.live != true` forces `dry_run`
    /// regardless of the strategy requested, so a call that looks live but
    /// forgot the flag places nothing.
    ///
    /// `plan` is a plan from `build_execution_plan`, OR a caller-assembled plan of
    /// the same shape — this method never assumes the plan came from the routing
    /// service. `options.idempotencyKey` is the identity of this execution,
    /// required when the plan carries no `requestId`; it keys the re-execution
    /// guard, seeds the per-step client order ids, and overrides the plan's
    /// `requestId` when both are given. `options.allowReexecution` must be exactly
    /// true to run a plan this instance has already executed live; the DEFAULT is
    /// refusal.
    pub async fn execute(
        &self,
        plan: &Value,
        venues: &std::collections::BTreeMap<String, Box<dyn RouterVenue>>,
        options: &Value,
    ) -> RouterResult<Value> {
        let requested_strategy = self.string_at(options, "strategy", "dry_run");
        if !KNOWN_STRATEGIES.contains(&requested_strategy.as_str()) {
            return Err(bad_request(&format!(
                "OrderRouter: unknown execution strategy {requested_strategy}"
            )));
        }
        let live = self.bool_at(options, "live", false);
        // THE default. Anything short of an explicit true is a rehearsal.
        let strategy = if live { requested_strategy.clone() } else { "dry_run".to_string() };
        let mut steps = self.clone_steps(plan);
        let mut report = self.empty_report(plan, &strategy, &requested_strategy, live, &steps);
        // Resolved from BOTH the plan and the options, so a hand-assembled plan can
        // carry an identity too; reported on every report, rehearsals included.
        let plan_id = self.plan_identity(plan, options);
        Self::put(&mut report, "planId", Value::Str(plan_id.clone()));
        // How old the prices in this plan are. ALWAYS reported, even when nothing is enforced: a plan
        // is a snapshot of a book, and how stale that snapshot is decides whether any number in it
        // means anything. -1 when the route carried no calculatedAt, which is not the same as "fresh"
        // and must not read like it. Enforced only if asked for, at whatever value is asked for — the
        // same shape as maxNotionalUsd, and for the same reason. But an age that cannot be determined
        // BLOCKS under an active limit: a freshness check that silently passes when the timestamp is
        // missing is not a freshness check.
        let calculated_at = self.number_at(plan, "calculatedAt", 0.0);
        let plan_age_ms = if calculated_at > 0.0 { self.now_ms() - calculated_at } else { -1.0 };
        Self::put(&mut report, "planAgeMs", Value::Float(plan_age_ms));
        let max_plan_age_ms = self.number_at(options, "maxPlanAgeMs", 0.0);
        if live && max_plan_age_ms > 0.0 {
            if plan_age_ms < 0.0 {
                return Err(exchange_error("OrderRouter: refusing to execute, the plan carries no calculatedAt and maxPlanAgeMs was set"));
            }
            if plan_age_ms > max_plan_age_ms {
                return Err(exchange_error("OrderRouter: refusing to execute a plan older than maxPlanAgeMs, recompute the route"));
            }
        }
        if strategy == "dry_run" {
            // Not one call is made against a venue on this path, not even a read.
            Self::put(&mut report, "wouldPlaceOrders", Value::Float(steps.len() as f64));
            return Ok(report);
        }
        if venues.is_empty() {
            return Err(arguments_required(
                "OrderRouter.execute requires a venues dictionary when live",
            ));
        }
        // IDEMPOTENCY, half one: a plan this instance has already run live is
        // REFUSED, and refused here — before a single read reaches a venue. The
        // ledger is consulted now and written only once the plan is about to be
        // dispatched, so a caller error that placed nothing does not burn the plan.
        // dry_run never reaches this line and never consumes a plan, because a
        // rehearsal places nothing.
        if plan_id.is_empty() {
            // No identity means no idempotency: neither the ledger below nor the
            // per-step client order ids can be derived, so a re-run of this plan
            // would be indistinguishable from a first run all the way down to the
            // venue.
            return Err(bad_request("OrderRouter: refusing to execute live without an identity, the plan carries no requestId — pass options.idempotencyKey"));
        }
        if !self.bool_at(options, "allowReexecution", false) {
            let ledger = self.executed_plan_ids.lock().unwrap();
            if ledger.iter().any(|entry| entry == &plan_id) {
                return Err(bad_request("OrderRouter: refusing to re-execute a plan this instance already executed, pass allowReexecution to override"));
            }
        }
        // Derived from the steps about to be executed, NEVER read off the plan:
        // a plan that travelled through JSON, a persisted step list or a
        // hand-rebuilt tail of a halted route can be missing hopCount, and a
        // refusal that a missing key switches off is not a refusal.
        let hop_count = self.hop_count_of(&steps);
        if strategy == "best_effort" {
            if hop_count > 1 {
                // Best-effort multi-hop is the most reliable way to strand money
                // in a bridge asset.
                return Err(ExchangeError::new(
                    "NotSupported",
                    "OrderRouter: best_effort refuses multi-hop routes",
                ));
            }
            if !self.bool_at(options, "acknowledgeDispersion", false) {
                return Err(bad_request("OrderRouter: best_effort requires acknowledgeDispersion"));
            }
            if self.number_at(options, "maxOrders", 0.0) <= 0.0 {
                return Err(bad_request("OrderRouter: best_effort requires a positive maxOrders"));
            }
        }
        if strategy == "limit_protected" {
            // Refused HERE, before a single order is placed, because the alternative is worse than a
            // bad interval: the poll loop advances its clock by this value, so a zero or negative one
            // never reaches the timeout. It spins on fetchOrder forever with a real order resting on a
            // real venue, and the timeout that exists to cancel that order never arrives.
            if self.has_number_at(options, "pollIntervalMs")
                && self.number_at(options, "pollIntervalMs", 0.0) <= 0.0
            {
                return Err(bad_request("OrderRouter: pollIntervalMs must be positive, a resting order is polled on that clock"));
            }
        }
        // Markets are needed for the safety check and for precision snapping.
        // The caller supplies them: unlike the other five ports, this one cannot
        // call loadMarkets() through the venue trait — adding it there would put
        // a method on the trait that only this line uses, and every implementor
        // would have to write it.
        let markets = self.dict_at(options, "markets");
        let usd_rates = self.dict_at(options, "usdRates");
        let mut safety_options = HashMap::new();
        safety_options.insert("usdRates".to_string(), usd_rates.clone());
        safety_options.insert(
            "maxNotionalUsd".to_string(),
            Value::Float(self.number_at(options, "maxNotionalUsd", self.max_notional_usd)),
        );
        safety_options.insert(
            "precisionMode".to_string(),
            Value::Str(self.string_at(options, "precisionMode", "tick_size")),
        );
        let violations = self.check_execution_plan_safety(plan, &markets, &Value::Map(safety_options));
        let mut blockers: Vec<String> = Vec::new();
        for violation in &violations {
            if self.bool_at(violation, "blocking", false) {
                blockers.push(self.string_at(violation, "code", ""));
            }
        }
        if !blockers.is_empty() {
            // Returned as an error, not reported. A refusal a caller can forget
            // to read is not a refusal.
            return Err(exchange_error(&format!(
                "OrderRouter: refusing to execute, blocking safety violations: {}",
                blockers.join(", ")
            )));
        }
        if strategy == "atomic_ish" {
            // The check the strategy is NAMED for. Without it this port accepted
            // atomic_ish, skipped the downstream resize that every other strategy
            // performs — on the strength of the route being pre-funded end to
            // end — and then never established that it was. A short hop would
            // have sized the next one off proceeds it did not have.
            self.assert_prefunded(&steps, venues).await?;
        }
        // The ledger is written BEFORE the first order goes out, never after: a run
        // that fails half way through has still placed orders, and a guard that only
        // recorded completed runs would wave through exactly the retry that
        // double-fills.
        {
            let mut ledger = self.executed_plan_ids.lock().unwrap();
            if !ledger.iter().any(|entry| entry == &plan_id) {
                ledger.push(plan_id.clone());
            }
        }
        if strategy == "parallel_within_hop" {
            self.execute_parallel_within_hop(&mut report, &mut steps, venues, options, &usd_rates).await;
        } else if strategy == "best_effort" {
            self.execute_best_effort(&mut report, &mut steps, venues, options, &usd_rates).await;
        } else {
            // sequential, limit_protected and atomic_ish all walk the plan one
            // order at a time; they differ in how a single order is placed and in
            // whether they lean on the previous hop's proceeds.
            self.execute_sequential(&mut report, &mut steps, venues, options, &usd_rates, &strategy).await;
        }
        self.summarise_report(&mut report, &steps);
        Ok(report)
    }
}

impl OrderRouter {
    /// Verifies every step's input is already sitting on its venue, which is what
    /// `atomic_ish` actually requires. There is no cross-venue atomicity and there
    /// cannot be, so the strategy names its own hedge: pre-fund the whole route,
    /// and no hop then depends on the previous one settling.
    ///
    /// Most routes fail this, and that is the correct outcome.
    async fn assert_prefunded(
        &self,
        steps: &[Value],
        venues: &std::collections::BTreeMap<String, Box<dyn RouterVenue>>,
    ) -> RouterResult<()> {
        // Built as a Vec, not a map, so the first shortfall reported is the same
        // one in all six languages.
        let mut required: Vec<(String, String, f64)> = Vec::new();
        for step in steps {
            let exchange_id = self.string_at(step, "exchangeId", "");
            let amount = self.number_at(step, "amount", 0.0);
            let (asset, needed) = if self.string_at(step, "side", "") == "buy" {
                (self.string_at(step, "quote", ""), amount * self.number_at(step, "limitPrice", 0.0))
            } else {
                (self.string_at(step, "base", ""), amount)
            };
            let mut found = false;
            for entry in required.iter_mut() {
                if entry.0 == exchange_id && entry.1 == asset {
                    entry.2 += needed;
                    found = true;
                    break;
                }
            }
            if !found {
                required.push((exchange_id, asset, needed));
            }
        }
        // One fetch_balance per venue, cached: a route with four hops on one
        // exchange must not cost four balance calls.
        let mut balances: HashMap<String, Value> = HashMap::new();
        for (exchange_id, asset, needed) in &required {
            if !balances.contains_key(exchange_id) {
                let venue = match venues.get(exchange_id) {
                    Some(found) => found,
                    None => {
                        return Err(exchange_error(&format!(
                            "OrderRouter: atomic_ish cannot check funding, no venue was passed for {exchange_id}"
                        )))
                    }
                };
                balances.insert(exchange_id.clone(), venue.fetch_balance().await?);
            }
            let balance = balances.get(exchange_id).expect("just inserted");
            let free = self.dict_at(balance, "free");
            let available = self.number_at(&free, asset, 0.0);
            if available < *needed {
                return Err(insufficient_funds(&format!(
                    "OrderRouter: atomic_ish requires the whole route pre-funded, and {exchange_id} is short of {asset}"
                )));
            }
        }
        Ok(())
    }

    /// Renders balance entries as the router's `[exchangeId.]ASSET:amount`
    /// comma-separated form.
    fn join_balances(&self, entries: &[Value]) -> RouterResult<String> {
        let mut text = String::new();
        for (i, entry) in entries.iter().enumerate() {
            if i > 0 {
                text.push(',');
            }
            text.push_str(&self.string_at(entry, "exchangeId", ""));
            text.push('.');
            text.push_str(&self.string_at(entry, "asset", ""));
            text.push(':');
            text.push_str(&self.format_number(self.number_at(entry, "amount", 0.0))?);
        }
        Ok(text)
    }

    /// Reads the live balances of the supplied venues, sends them to the router,
    /// and returns a route you can actually fund.
    ///
    /// The returned route carries two client-side additions: `balancesUsed`,
    /// the exact string sent, and `balancesDropped`, everything that did not fit
    /// and why.
    pub async fn fetch_route_with_balances(
        &self,
        from_asset: &str,
        to_asset: &str,
        venues: &std::collections::BTreeMap<String, Box<dyn RouterVenue>>,
        params: &Value,
    ) -> RouterResult<Value> {
        let require_applied = self.bool_at(params, "requireBalancesApplied", true);
        let mut entries: Vec<Value> = Vec::new();
        let mut dropped: Vec<Value> = Vec::new();
        // BTreeMap iterates in key order, which is the sort the other five ports
        // do explicitly — six languages must build the same string from the same
        // wallet.
        for (exchange_id, venue) in venues.iter() {
            let balance = venue.fetch_balance().await?;
            let mut holdings = self.dict_at(&balance, "free");
            if holdings.as_map().map(|m| m.is_empty()).unwrap_or(true) {
                holdings = self.dict_at(&balance, "total");
            }
            let mut codes: Vec<String> = match holdings.as_map() {
                Some(map) => map.keys().cloned().collect(),
                None => Vec::new(),
            };
            codes.sort();
            for code in &codes {
                let amount = self.number_at(&holdings, code, 0.0);
                if amount <= 0.0 {
                    // A zero holding is not information, and it costs one of the
                    // router's 64 entries.
                    continue;
                }
                let mut entry = HashMap::new();
                entry.insert("exchangeId".to_string(), Value::Str(exchange_id.clone()));
                entry.insert("asset".to_string(), Value::Str(code.clone()));
                entry.insert("amount".to_string(), Value::Float(amount));
                if amount >= 1e18 {
                    // Beyond fixed-point rendering; reported rather than sent,
                    // because a silently reshaped amount is worse than a missing
                    // one.
                    entry.insert("reason".to_string(), Value::Str("amount_out_of_range".to_string()));
                    dropped.push(Value::Map(entry));
                    continue;
                }
                entries.push(Value::Map(entry));
            }
        }
        // Largest first, so trimming to the router's caps drops the smallest
        // holdings. Ties break on exchangeId then asset so six languages produce
        // the same list from the same wallet.
        entries.sort_by(|a, b| {
            let amount_a = self.number_at(a, "amount", 0.0);
            let amount_b = self.number_at(b, "amount", 0.0);
            if amount_a != amount_b {
                // Descending. partial_cmp cannot be None here: number_at only
                // ever returns a finite number.
                return amount_b.partial_cmp(&amount_a).unwrap_or(std::cmp::Ordering::Equal);
            }
            let id_a = self.string_at(a, "exchangeId", "");
            let id_b = self.string_at(b, "exchangeId", "");
            if id_a != id_b {
                return id_a.cmp(&id_b);
            }
            self.string_at(a, "asset", "").cmp(&self.string_at(b, "asset", ""))
        });
        while entries.len() > MAX_BALANCE_ENTRIES {
            let mut removed = entries.pop().expect("entries is non-empty inside this loop");
            Self::put(&mut removed, "reason", Value::Str("entry_cap".to_string()));
            dropped.push(removed);
        }
        let mut balances = self.join_balances(&entries)?;
        while balances.len() > MAX_BALANCE_CHARS && !entries.is_empty() {
            let mut removed = entries.pop().expect("entries is non-empty inside this loop");
            Self::put(&mut removed, "reason", Value::Str("char_cap".to_string()));
            dropped.push(removed);
            balances = self.join_balances(&entries)?;
        }
        let mut route_params = HashMap::new();
        if let Some(map) = params.as_map() {
            for (key, value) in map.iter() {
                route_params.insert(key.clone(), value.clone());
            }
        }
        route_params.insert("balances".to_string(), Value::Str(balances.clone()));
        let mut route = self.fetch_route(from_asset, to_asset, &Value::Map(route_params)).await?;
        if require_applied && !balances.is_empty() && self.string_at(&route, "balancesApplied", "").is_empty() {
            // /route declares its query without a JSON schema, so a router that
            // predates the balances feature answers byte-identically to one that
            // never received it. Executing a plan computed against a portfolio
            // the server never saw is the case worth failing on.
            return Err(exchange_error(
                "OrderRouter did not echo balancesApplied: the balances were ignored, so this route is not funded-aware",
            ));
        }
        Self::put(&mut route, "balancesUsed", Value::Str(balances));
        Self::put(&mut route, "balancesDropped", Value::List(dropped));
        Ok(route)
    }
}
