// The OrderRouter suite, living in ccxt-base rather than in the ti-rust test crate.
//
// It is here for one practical reason: ti-rust links the whole generated surface
// (104 typed REST wrappers, 76 WS ones), and building that needs more memory
// than some development machines have — it OOM-kills at link time on a 16 GB
// box, the same way the Go test binary does. The suite exercises nothing but
// `Value` and `OrderRouter`, both of which live in THIS crate, so putting it
// here makes it runnable with `cargo test -p ccxt-base` in about a minute
// without the generated venues.
//
// `run()` is public so `ti-rust --orderRouterTests` drives exactly the same
// checks in CI, alongside the other five ports. One harness, two entry points —
// a second copy is how the two would drift.

// OrderRouter — the sixth port's half of the cross-language contract.
//
// The class is hand-written in six languages; `ts/src/test/base/fixtures/
// orderRouter.json` is what stops them drifting. This file runs that fixture in
// Rust. A case that passes in TypeScript, Python, PHP, C# and Go and fails here
// means THIS port is wrong — that is the whole reason for running the same table
// six times rather than trusting six readings of the same spec.

use crate::order_router::{OrderRouter, NO_CAP, TOLERANCE};
use crate::value::{HashMap, Value};

fn fixture() -> Result<Value, String> {
    // From this crate's manifest dir: rust/ccxt-base -> repo root.
    let path = concat!(
        env!("CARGO_MANIFEST_DIR"),
        "/../../ts/src/test/base/fixtures/orderRouter.json"
    );
    let raw = std::fs::read_to_string(path)
        .map_err(|e| format!("reading the shared fixture at {path}: {e}"))?;
    let parsed: serde_json::Value =
        serde_json::from_str(&raw).map_err(|e| format!("parsing the shared fixture: {e}"))?;
    Ok(Value::from_json(&parsed))
}

fn router() -> Result<OrderRouter, String> {
    let mut config = HashMap::new();
    config.insert("apiKey".to_string(), Value::Str("test-key".to_string()));
    OrderRouter::new(&Value::Map(config)).map_err(|e| e.to_string())
}

fn section(fixture: &Value, name: &str) -> Result<Value, String> {
    match fixture.as_map().and_then(|m| m.get(name)) {
        Some(found) => Ok(found.clone()),
        None => Err(format!("the shared fixture has no `{name}` section")),
    }
}

fn cases(fixture: &Value, name: &str) -> Result<Vec<Value>, String> {
    match section(fixture, name)? {
        Value::Arr(items) if !items.is_empty() => Ok(items.as_ref().clone()),
        Value::Arr(_) => Err(format!("the fixture's `{name}` section is empty")),
        _ => Err(format!("the fixture's `{name}` section is not an array")),
    }
}

fn named(fixture: &Value, section_name: &str, key: &str) -> Result<Value, String> {
    let holder = section(fixture, section_name)?;
    match holder.as_map().and_then(|m| m.get(key)) {
        Some(found) => Ok(found.clone()),
        None => Err(format!("`{section_name}` has no entry named `{key}`")),
    }
}

fn text(container: &Value, key: &str) -> String {
    match container.as_map().and_then(|m| m.get(key)) {
        Some(Value::Str(s)) => s.clone(),
        _ => String::new(),
    }
}

fn at<'a>(container: &'a Value, key: &str) -> Option<&'a Value> {
    container.as_map().and_then(|m| m.get(key))
}

/// The same relative comparison the other five ports use: floating point cannot
/// be compared exactly across six languages' arithmetic, and an absolute epsilon
/// is wrong at both ends of the magnitude range a price can take.
fn numbers_match(a: f64, b: f64) -> bool {
    if a == b {
        return true;
    }
    if !a.is_finite() || !b.is_finite() {
        // An infinity only ever matches itself. Without this the relative
        // comparison below reads Infinity <= Infinity as a match, and an
        // infinite value passes against ANY expectation — which is exactly how
        // a number grammar that overflows would slip past the numberCases table.
        return false;
    }
    let mut scale = 1.0f64;
    if a.abs() > scale {
        scale = a.abs();
    }
    if b.abs() > scale {
        scale = b.abs();
    }
    (a - b).abs() <= TOLERANCE * scale
}

fn as_number(value: &Value) -> Option<f64> {
    match value {
        Value::Int(n) => Some(*n as f64),
        Value::Float(n) => Some(*n),
        _ => None,
    }
}

/// Compares an actual structure against the fixture's expectation, in BOTH
/// directions: a missing field and an invented field are both drift.
fn assert_matches(actual: &Value, expected: &Value, whereat: &str) -> Result<(), String> {
    match expected {
        Value::Arr(expected_items) => {
            let actual_items = match actual {
                Value::Arr(items) => items,
                other => return Err(format!("{whereat}: expected an array, got {other:?}")),
            };
            if actual_items.len() != expected_items.len() {
                return Err(format!(
                    "{whereat}: array length — expected {}, got {}",
                    expected_items.len(),
                    actual_items.len()
                ));
            }
            for (i, expected_item) in expected_items.iter().enumerate() {
                assert_matches(&actual_items[i], expected_item, &format!("{whereat}[{i}]"))?;
            }
            Ok(())
        }
        Value::Dict(expected_map) => {
            let actual_map = match actual {
                Value::Dict(map) => map,
                other => return Err(format!("{whereat}: expected an object, got {other:?}")),
            };
            let mut expected_keys: Vec<&String> = expected_map.keys().collect();
            let mut actual_keys: Vec<&String> = actual_map.keys().collect();
            expected_keys.sort();
            actual_keys.sort();
            if expected_keys != actual_keys {
                return Err(format!(
                    "{whereat}: key set — expected {expected_keys:?}, got {actual_keys:?}"
                ));
            }
            for key in expected_keys {
                assert_matches(
                    actual_map.get(key).unwrap_or(&Value::Null),
                    expected_map.get(key).unwrap_or(&Value::Null),
                    &format!("{whereat}.{key}"),
                )?;
            }
            Ok(())
        }
        _ => {
            if let Some(expected_number) = as_number(expected) {
                let actual_number = as_number(actual).ok_or_else(|| {
                    format!("{whereat}: expected the number {expected_number}, got {actual:?}")
                })?;
                if !numbers_match(actual_number, expected_number) {
                    return Err(format!(
                        "{whereat}: expected {expected_number}, got {actual_number}"
                    ));
                }
                return Ok(());
            }
            if actual != expected {
                return Err(format!("{whereat}: expected {expected:?}, got {actual:?}"));
            }
            Ok(())
        }
    }
}

// ---------------------------------------------------------------------------
// the shared fixture — the cross-language contract
// ---------------------------------------------------------------------------

fn fixture_build_execution_plan(r: &OrderRouter, f: &Value) -> Result<(), String> {
    for test_case in cases(f, "planCases")? {
        let route = named(f, "routes", &text(&test_case, "route"))?;
        let options = at(&test_case, "options").cloned().unwrap_or(Value::Null);
        let plan = r.build_execution_plan(&route, &options).map_err(|e| e.to_string())?;
        let expected = at(&test_case, "expected").cloned().unwrap_or(Value::Null);
        assert_matches(&plan, &expected, &format!("planCase {}", text(&test_case, "id")))?;
    }
    Ok(())
}

fn fixture_plan_is_deterministic(r: &OrderRouter, f: &Value) -> Result<(), String> {
    for test_case in cases(f, "planCases")? {
        let route = named(f, "routes", &text(&test_case, "route"))?;
        let options = at(&test_case, "options").cloned().unwrap_or(Value::Null);
        let before = serde_json::to_string(&route.to_json()).map_err(|e| e.to_string())?;
        let first = r.build_execution_plan(&route, &options).map_err(|e| e.to_string())?;
        let second = r.build_execution_plan(&route, &options).map_err(|e| e.to_string())?;
        let id = text(&test_case, "id");
        assert_matches(&second, &first, &format!("planCase {id} repeated"))?;
        let after = serde_json::to_string(&route.to_json()).map_err(|e| e.to_string())?;
        if before != after {
            return Err(format!("planCase {id}: the route was mutated"));
        }
    }
    Ok(())
}

fn fixture_check_execution_plan_safety(r: &OrderRouter, f: &Value) -> Result<(), String> {
    for test_case in cases(f, "safetyCases")? {
        let route = named(f, "routes", &text(&test_case, "route"))?;
        let markets = named(f, "marketSets", &text(&test_case, "markets"))?;
        let plan_options = at(&test_case, "planOptions").cloned().unwrap_or(Value::Null);
        let options = at(&test_case, "options").cloned().unwrap_or(Value::Null);
        let plan = r.build_execution_plan(&route, &plan_options).map_err(|e| e.to_string())?;
        let violations = r.check_execution_plan_safety(&plan, &markets, &options);
        let expected = at(&test_case, "expected").cloned().unwrap_or(Value::Null);
        assert_matches(
            &Value::List(violations),
            &expected,
            &format!("safetyCase {}", text(&test_case, "id")),
        )?;
    }
    Ok(())
}

fn fixture_reconcile_execution_step(r: &OrderRouter, f: &Value) -> Result<(), String> {
    for test_case in cases(f, "reconcileCases")? {
        // A case names either a route to plan from, or a plan written out in
        // full — the latter is how a plan with field types no builder produces
        // (an int hopIndex on one step and a float on the next) gets covered.
        let plan = if at(&test_case, "plan").is_some() {
            named(f, "plans", &text(&test_case, "plan"))?
        } else {
            let route = named(f, "routes", &text(&test_case, "route"))?;
            let plan_options = at(&test_case, "planOptions").cloned().unwrap_or(Value::Null);
            r.build_execution_plan(&route, &plan_options).map_err(|e| e.to_string())?
        };
        let step_index = r.number_at(&test_case, "stepIndex", 0.0) as i64;
        let realised_out = r.number_at(&test_case, "realisedOut", 0.0);
        let verdict = r
            .reconcile_execution_step(&plan, step_index, realised_out)
            .map_err(|e| e.to_string())?;
        let expected = at(&test_case, "expected").cloned().unwrap_or(Value::Null);
        assert_matches(&verdict, &expected, &format!("reconcileCase {}", text(&test_case, "id")))?;
    }
    Ok(())
}

fn fixture_reconcile_sequence(r: &OrderRouter, f: &Value) -> Result<(), String> {
    // reconcile_execution_step is pure and cannot remember across calls, so a
    // hop's cumulative shortfall lives on the steps themselves — written by
    // apply_resize. That interaction is only visible across a SEQUENCE of calls,
    // which reconcileCases (one call each) cannot express, and it is exactly
    // where the six ports could silently disagree.
    for test_case in cases(f, "reconcileSequenceCases")? {
        let id = text(&test_case, "id");
        let mut steps: Vec<Value> = match at(&test_case, "steps") {
            Some(Value::Arr(items)) => items.as_ref().clone(),
            _ => return Err(format!("reconcileSequenceCase {id}: no steps")),
        };
        let tolerance = r.number_at(&test_case, "reconcileToleranceRatio", 0.0);
        let calls = match at(&test_case, "calls") {
            Some(Value::Arr(items)) => items.as_ref().clone(),
            _ => Vec::new(),
        };
        let expected_scales = match at(&test_case, "expectedScales") {
            Some(Value::Arr(items)) => items.as_ref().clone(),
            _ => Vec::new(),
        };
        for (index, call) in calls.iter().enumerate() {
            // The plan is rebuilt from the working steps on every call, exactly
            // as execute does — PHP copies arrays on assignment, so a plan built
            // once outside this loop would mean six ports running six different
            // tests.
            let mut plan = HashMap::new();
            plan.insert("steps".to_string(), Value::List(steps.clone()));
            plan.insert("reconcileToleranceRatio".to_string(), Value::Float(tolerance));
            let plan = Value::Map(plan);
            let step_index = r.number_at(call, "stepIndex", 0.0) as i64;
            let realised_out = r.number_at(call, "realisedOut", 0.0);
            let reconciliation = r
                .reconcile_execution_step(&plan, step_index, realised_out)
                .map_err(|e| e.to_string())?;
            let scale = r.number_at(&reconciliation, "scale", f64::NAN);
            let expected = as_number(&expected_scales[index]).unwrap_or(f64::NAN);
            if !numbers_match(scale, expected) {
                return Err(format!(
                    "reconcileSequenceCase {id} call {index}: scale — expected {expected}, got {scale}"
                ));
            }
            r.apply_resize(&mut steps, &reconciliation);
        }
        let expected_amounts = match at(&test_case, "expectedAmounts") {
            Some(Value::Arr(items)) => items.as_ref().clone(),
            _ => Vec::new(),
        };
        for (index, step) in steps.iter().enumerate() {
            let amount = r.number_at(step, "amount", f64::NAN);
            let expected = as_number(&expected_amounts[index]).unwrap_or(f64::NAN);
            if !numbers_match(amount, expected) {
                return Err(format!(
                    "reconcileSequenceCase {id} step {index}: amount — expected {expected}, got {amount}"
                ));
            }
        }
    }
    Ok(())
}

fn fixture_build_unwind_plan(r: &OrderRouter, f: &Value) -> Result<(), String> {
    for test_case in cases(f, "unwindCases")? {
        let report = named(f, "reports", &text(&test_case, "report"))?;
        let unwind = r.build_unwind_plan(&report);
        let expected = at(&test_case, "expected").cloned().unwrap_or(Value::Null);
        assert_matches(&unwind, &expected, &format!("unwindCase {}", text(&test_case, "id")))?;
    }
    Ok(())
}

fn fixture_number_at(r: &OrderRouter, f: &Value) -> Result<(), String> {
    // Every port hand-implements JavaScript's parseFloat prefix grammar rather
    // than calling its own parser, because every language's own parser disagrees
    // with the others somewhere. These cases are the contract: a cap read as
    // 1234.5 in one language and 1 in another is a cap that silently disappears,
    // and this table is what stops that shipping green.
    for test_case in cases(f, "numberCases")? {
        let container = at(&test_case, "container").cloned().unwrap_or(Value::Null);
        let key = text(&test_case, "key");
        let default_value = r.number_at(&test_case, "default", 0.0);
        let actual = r.number_at(&container, &key, default_value);
        let expected = at(&test_case, "expected")
            .and_then(as_number)
            .ok_or_else(|| format!("numberCase {}: no expected number", text(&test_case, "id")))?;
        if !numbers_match(actual, expected) {
            return Err(format!(
                "numberCase {}: expected {expected}, got {actual}",
                text(&test_case, "id")
            ));
        }
    }
    Ok(())
}

// ---------------------------------------------------------------------------
// invariants, asserted directly rather than through the fixture
// ---------------------------------------------------------------------------

fn config_with(entries: &[(&str, Value)]) -> Value {
    let mut config = HashMap::new();
    for (key, value) in entries {
        config.insert((*key).to_string(), value.clone());
    }
    Value::Map(config)
}

fn capped_client(cap: f64) -> Result<OrderRouter, String> {
    let config = config_with(&[
        ("apiKey", Value::Str("k".into())),
        ("maxNotionalUsd", Value::Float(cap)),
    ]);
    OrderRouter::new(&config).map_err(|e| e.to_string())
}

fn constructor_guards() -> Result<(), String> {
    if OrderRouter::new(&config_with(&[])).is_ok() {
        return Err("an apiKey is required".to_string());
    }
    // No ceiling. A caller trading thousands is using this correctly, and the
    // class does not get to decide otherwise — the old hard 25 USD limit came
    // from this repository's own live-test safety rule, which is not a rule
    // about anyone's money.
    let large = capped_client(250000.0)?;
    if !numbers_match(large.max_notional_usd(), 250000.0) {
        return Err(format!(
            "a large cap is honoured exactly, not clamped, got {}",
            large.max_notional_usd()
        ));
    }
    let small = capped_client(0.05)?;
    if !numbers_match(small.max_notional_usd(), 0.05) {
        return Err("cents are a legitimate trade size".to_string());
    }
    // The default is NO cap.
    let standard = OrderRouter::new(&config_with(&[("apiKey", Value::Str("k".into()))]))
        .map_err(|e| e.to_string())?;
    if !numbers_match(standard.max_notional_usd(), NO_CAP) || !numbers_match(NO_CAP, 0.0) {
        return Err(format!(
            "the default is NO_CAP, which is 0, got {}",
            standard.max_notional_usd()
        ));
    }
    // 0 is the explicit spelling of "no cap"; a negative value is a typo, and
    // silently ignoring it would leave the caller believing a guardrail is in
    // place.
    if !numbers_match(capped_client(0.0)?.max_notional_usd(), 0.0) {
        return Err("0 is the explicit spelling of no cap".to_string());
    }
    let negative = config_with(&[
        ("apiKey", Value::Str("k".into())),
        ("maxNotionalUsd", Value::Float(-1.0)),
    ]);
    match OrderRouter::new(&negative) {
        Ok(_) => return Err("a negative cap is refused, not ignored".to_string()),
        Err(e) if e.is("BadRequest") => {}
        Err(e) => return Err(format!("a negative cap is a BadRequest, got {e}")),
    }
    // Trailing slashes are stripped so the url is built the same way in six
    // languages.
    let slashed = config_with(&[
        ("apiKey", Value::Str("k".into())),
        ("baseUrl", Value::Str("https://example.test/router///".into())),
    ]);
    let client = OrderRouter::new(&slashed).map_err(|e| e.to_string())?;
    if client.base_url() != "https://example.test/router" {
        return Err(format!("trailing slashes are stripped, got {}", client.base_url()));
    }
    Ok(())
}

fn one_leg_route(side: &str, base_code: &str, quote: &str, amount: f64, price: f64) -> Value {
    let mut leg = HashMap::new();
    leg.insert("exchangeId".to_string(), Value::Str("stub".into()));
    leg.insert("amount".to_string(), Value::Float(amount));
    leg.insert("averagePrice".to_string(), Value::Float(price));
    leg.insert("effectivePrice".to_string(), Value::Float(price));
    let mut hop = HashMap::new();
    hop.insert("pair".to_string(), Value::Str(format!("{base_code}/{quote}")));
    hop.insert("side".to_string(), Value::Str(side.into()));
    hop.insert("base".to_string(), Value::Str(base_code.into()));
    hop.insert("quote".to_string(), Value::Str(quote.into()));
    hop.insert("legs".to_string(), Value::List(vec![Value::Map(leg)]));
    let mut route = HashMap::new();
    route.insert("from".to_string(), Value::Str(quote.into()));
    route.insert("to".to_string(), Value::Str(base_code.into()));
    route.insert("strategy".to_string(), Value::Str("best_single".into()));
    route.insert("exactSide".to_string(), Value::Str("in".into()));
    route.insert("fullyFillable".to_string(), Value::Bool(true));
    route.insert("fillRatio".to_string(), Value::Float(1.0));
    route.insert("hops".to_string(), Value::List(vec![Value::Map(hop)]));
    Value::Map(route)
}

/// USDT -> BTC -> ETH across two hops on the same stub venue, so a report's
/// filledIn/filledOut can be checked against the assets they are supposed to be
/// denominated in.
fn two_hop_route() -> Value {
    let hop = |base_code: &str, quote: &str, side: &str, amount: f64, price: f64| {
        let mut leg = HashMap::new();
        leg.insert("exchangeId".to_string(), Value::Str("stub".into()));
        leg.insert("amount".to_string(), Value::Float(amount));
        leg.insert("averagePrice".to_string(), Value::Float(price));
        leg.insert("effectivePrice".to_string(), Value::Float(price));
        let mut hop = HashMap::new();
        hop.insert("pair".to_string(), Value::Str(format!("{base_code}/{quote}")));
        hop.insert("side".to_string(), Value::Str(side.into()));
        hop.insert("base".to_string(), Value::Str(base_code.into()));
        hop.insert("quote".to_string(), Value::Str(quote.into()));
        hop.insert("legs".to_string(), Value::List(vec![Value::Map(leg)]));
        Value::Map(hop)
    };
    let mut route = HashMap::new();
    route.insert("from".to_string(), Value::Str("USDT".into()));
    route.insert("to".to_string(), Value::Str("ETH".into()));
    route.insert("strategy".to_string(), Value::Str("best_single".into()));
    route.insert("exactSide".to_string(), Value::Str("in".into()));
    route.insert("fullyFillable".to_string(), Value::Bool(true));
    route.insert("fillRatio".to_string(), Value::Float(1.0));
    // hop 0 spends 20 USDT for 0.2 BTC; hop 1 sells that 0.2 BTC for 2 ETH
    route.insert("hops".to_string(), Value::List(vec![
        hop("BTC", "USDT", "buy", 0.2, 100.0),
        hop("BTC", "ETH", "sell", 0.2, 10.0),
    ]));
    Value::Map(route)
}

fn a_report_is_summarised_in_the_assets_it_names(r: &OrderRouter) -> Result<(), String> {
    // filledIn is denominated in the route's FROM asset and filledOut in its TO
    // asset, which holds only if each is summed over ONE hop. This port summed
    // inAmount and outAmount across every step, adding USDT to BTC to ETH and
    // reporting the total as one number — meaningless on a multi-hop route, and
    // meaningless in a way that reads like a figure.
    let route = two_hop_route();
    let plan = r.build_execution_plan(&route, &Value::Map(HashMap::new())).map_err(|e| e.to_string())?;
    let venue = StubVenue::new("stub");
    let mut venues: BTreeMap<String, Box<dyn RouterVenue>> = BTreeMap::new();
    venues.insert("stub".to_string(), Box::new(venue));
    let mut options = execute_options(true, "sequential");
    // Both markets, so neither hop is refused for want of one.
    let mut btc_usdt = HashMap::new();
    btc_usdt.insert("symbol".to_string(), Value::Str("BTC/USDT".into()));
    btc_usdt.insert("base".to_string(), Value::Str("BTC".into()));
    btc_usdt.insert("quote".to_string(), Value::Str("USDT".into()));
    let mut btc_eth = HashMap::new();
    btc_eth.insert("symbol".to_string(), Value::Str("BTC/ETH".into()));
    btc_eth.insert("base".to_string(), Value::Str("BTC".into()));
    btc_eth.insert("quote".to_string(), Value::Str("ETH".into()));
    let mut by_symbol = HashMap::new();
    by_symbol.insert("BTC/USDT".to_string(), Value::Map(btc_usdt));
    by_symbol.insert("BTC/ETH".to_string(), Value::Map(btc_eth));
    let mut markets = HashMap::new();
    markets.insert("stub".to_string(), Value::Map(by_symbol));
    OrderRouter::set_key(&mut options, "markets", Value::Map(markets));
    let mut usd_rates = HashMap::new();
    usd_rates.insert("USDT".to_string(), Value::Float(1.0));
    usd_rates.insert("ETH".to_string(), Value::Float(10.0));
    OrderRouter::set_key(&mut options, "usdRates", Value::Map(usd_rates));

    let report = block_on(r.execute(&plan, &venues, &options)).map_err(|e| e.to_string())?;
    let results = r.list_at(&report, "steps");
    if results.len() != 2 {
        return Err(format!("the two-hop route must place two orders, got {results:?}"));
    }
    // hop 0 spends USDT and acquires BTC; hop 1 spends that BTC and produces ETH.
    // filledIn must therefore be hop 0's inAmount alone (USDT) and filledOut hop
    // 1's outAmount alone (ETH). The bug summed both columns over both steps, so
    // filledIn was USDT + BTC and filledOut was BTC + ETH — two currencies added
    // together and reported as one figure.
    let first_in = r.number_at(&results[0], "inAmount", 0.0);
    let second_in = r.number_at(&results[1], "inAmount", 0.0);
    let first_out = r.number_at(&results[0], "outAmount", 0.0);
    let second_out = r.number_at(&results[1], "outAmount", 0.0);
    let filled_in = r.number_at(&report, "filledIn", -1.0);
    let filled_out = r.number_at(&report, "filledOut", -1.0);
    if (filled_in - first_in).abs() > 1e-9 {
        return Err(format!("filledIn is the FIRST hop's spend alone ({first_in} USDT), got {filled_in}"));
    }
    if (filled_out - second_out).abs() > 1e-9 {
        return Err(format!("filledOut is the LAST hop's proceeds alone ({second_out} ETH), got {filled_out}"));
    }
    // Belt and braces: the two hops must actually differ, or the check above
    // would pass on a route where summing happens to give the same answer.
    if second_in <= 0.0 || first_out <= 0.0 {
        return Err("the fixture route must have a real middle asset for this to mean anything".to_string());
    }
    if r.number_at(&report, "ordersPlaced", 0.0) != 2.0 {
        return Err(format!("both placements are counted, got {}", r.number_at(&report, "ordersPlaced", 0.0)));
    }
    // And the companion flags this port dropped entirely: a caller must be able
    // to tell the venue's own figure from this class's fallback.
    for result in &results {
        for flag in ["filledKnown", "averageKnown", "costKnown"] {
            if !r.bool_at(result, flag, false) {
                return Err(format!("{flag} must be reported, and true when the stub answered fully: {result:?}"));
            }
        }
    }
    Ok(())
}

fn limit_price_side(r: &OrderRouter) -> Result<(), String> {
    // The limit sits on the side that costs you, and only there.
    let options = config_with(&[("slippageBps", Value::Float(100.0))]);
    let buy = r
        .build_execution_plan(&one_leg_route("buy", "BTC", "USDT", 1.0, 100.0), &options)
        .map_err(|e| e.to_string())?;
    let buy_steps = r.list_at(&buy, "steps");
    let buy_limit = r.number_at(&buy_steps[0], "limitPrice", 0.0);
    if !numbers_match(buy_limit, 101.0) {
        return Err(format!("a buy limit sits ABOVE the expected price, got {buy_limit}"));
    }
    let sell = r
        .build_execution_plan(&one_leg_route("sell", "BTC", "USDT", 1.0, 100.0), &options)
        .map_err(|e| e.to_string())?;
    let sell_steps = r.list_at(&sell, "steps");
    let sell_limit = r.number_at(&sell_steps[0], "limitPrice", 0.0);
    if !numbers_match(sell_limit, 99.0) {
        return Err(format!("a sell limit sits BELOW the expected price, got {sell_limit}"));
    }
    Ok(())
}

fn unwind_buy_is_fundable(r: &OrderRouter, f: &Value) -> Result<(), String> {
    // The residual IS the budget. Sizing the buy at the expected price and then
    // pricing it slippage above that orders more quote than the venue is
    // holding: 44.5 USDT at 0.089 is 500 DOGE, but 500 DOGE at the 0.0892225
    // limit costs 44.61125 — the venue rejects it for insufficient funds, or
    // partially fills and leaves the rest of the stranded money stranded on a
    // halted route.
    let report = named(f, "reports", "haltedCrossVenue")?;
    let unwind = r.build_unwind_plan(&report);
    let steps = r.list_at(&unwind, "steps");
    if steps.len() != 2 {
        return Err(format!("the cross-venue report strands two positions, got {}", steps.len()));
    }
    let buy = &steps[1];
    if text(buy, "side") != "buy" {
        return Err("the mexc leg is the buy".to_string());
    }
    let residual = 44.5f64;
    let spend = r.number_at(buy, "amount", 0.0) * r.number_at(buy, "limitPrice", 0.0);
    if spend > residual + 1e-9 {
        return Err(format!("the buy spends {spend} of a {residual} residual"));
    }
    // And it does not leave the residual pointlessly unspent either.
    if spend < residual - 1e-9 {
        return Err(format!("the buy spends {spend}, short of the {residual} residual"));
    }
    // The notional the safety cap sees must be that same real spend.
    if !numbers_match(r.number_at(buy, "notionalQuote", 0.0), spend) {
        return Err("notionalQuote is priced at the limit the order is placed at".to_string());
    }
    // The sell side is sized on the residual itself — there is no budget to run out of.
    let sell = &steps[0];
    if text(sell, "side") != "sell" {
        return Err("the binance leg is the sell".to_string());
    }
    if !numbers_match(r.number_at(sell, "amount", 0.0), 0.2) {
        return Err("the whole 0.2 SOL residual is sold".to_string());
    }
    if !numbers_match(
        r.number_at(sell, "notionalQuote", 0.0),
        0.2 * r.number_at(sell, "limitPrice", 0.0),
    ) {
        return Err("the sell notional is priced at its limit too".to_string());
    }
    Ok(())
}

fn empty_plan_is_not_safe(r: &OrderRouter) -> Result<(), String> {
    // "Nothing to check" and "checked, all good" are different answers and used
    // to look identical.
    let mut plan = HashMap::new();
    plan.insert("steps".to_string(), Value::List(vec![]));
    let violations = r.check_execution_plan_safety(
        &Value::Map(plan),
        &Value::Map(HashMap::new()),
        &Value::Map(HashMap::new()),
    );
    if violations.len() != 1 {
        return Err(format!("an empty plan yields one finding, got {}", violations.len()));
    }
    if text(&violations[0], "code") != "empty_plan" {
        return Err("an empty plan is flagged empty_plan".to_string());
    }
    Ok(())
}

/// The market set the cap tests check against: it constrains nothing, so the
/// only findings a plan can produce against it are the notional ones.
fn permissive_stub_markets() -> Value {
    let mut market = HashMap::new();
    market.insert("symbol".to_string(), Value::Str("BTC/USDT".into()));
    market.insert("base".to_string(), Value::Str("BTC".into()));
    market.insert("quote".to_string(), Value::Str("USDT".into()));
    let mut venue = HashMap::new();
    venue.insert("BTC/USDT".to_string(), Value::Map(market));
    let mut markets = HashMap::new();
    markets.insert("stub".to_string(), Value::Map(venue));
    Value::Map(markets)
}

/// `{ 'usdRates': { <code>: <rate>, ... } }`, plus whatever else the check
/// options carry.
fn rates(entries: &[(&str, f64)]) -> Value {
    let mut usd_rates = HashMap::new();
    for (code, rate) in entries {
        usd_rates.insert((*code).to_string(), Value::Float(*rate));
    }
    Value::Map(usd_rates)
}

fn capped_options(cap: f64, usd_rates: &[(&str, f64)]) -> Value {
    config_with(&[
        ("usdRates", rates(usd_rates)),
        ("maxNotionalUsd", Value::Float(cap)),
    ])
}

fn uncapped_options(usd_rates: &[(&str, f64)]) -> Value {
    config_with(&[("usdRates", rates(usd_rates))])
}

/// The codes of a plan's findings, in order, so an expectation reads as one
/// line rather than as five index lookups.
fn codes(violations: &[Value]) -> Vec<String> {
    violations.iter().map(|v| text(v, "code")).collect()
}

fn planned(r: &OrderRouter, amount: f64, price: f64, slippage_bps: f64) -> Result<Value, String> {
    let options = config_with(&[("slippageBps", Value::Float(slippage_bps))]);
    r.build_execution_plan(&one_leg_route("buy", "BTC", "USDT", amount, price), &options)
        .map_err(|e| e.to_string())
}

fn a_cap_that_is_set_binds_exactly(r: &OrderRouter) -> Result<(), String> {
    // A cap the caller ASKED FOR is honoured at whatever size they chose, and
    // the slippage is inside the measurement rather than outside it.
    let markets = permissive_stub_markets();
    let capped = capped_options(25.0, &[("USDT", 1.0)]);
    let under = planned(r, 0.24, 100.0, 0.0)?;
    if !codes(&r.check_execution_plan_safety(&under, &markets, &capped)).is_empty() {
        return Err("24 USD passes a 25 USD cap".to_string());
    }
    let at_the_cap = planned(r, 0.25, 100.0, 0.0)?;
    if !codes(&r.check_execution_plan_safety(&at_the_cap, &markets, &capped)).is_empty() {
        return Err("exactly at the cap passes".to_string());
    }
    let over = planned(r, 0.2501, 100.0, 0.0)?;
    if codes(&r.check_execution_plan_safety(&over, &markets, &capped)) != ["notional_exceeds_cap"] {
        return Err("25.01 USD trips a 25 USD cap".to_string());
    }
    let slipped = planned(r, 0.249, 100.0, 100.0)?;
    if codes(&r.check_execution_plan_safety(&slipped, &markets, &capped)) != ["notional_exceeds_cap"]
    {
        return Err("24.90 USD at 1% slippage is 25.15 USD of risk".to_string());
    }
    // A LARGE cap is honoured just as exactly. This is the case the old hard
    // ceiling made unreachable: 2,000 USD of BTC under a 5,000 USD guardrail is
    // a normal trade.
    let large = planned(r, 20.0, 100.0, 0.0)?;
    let generous = capped_options(5000.0, &[("USDT", 1.0)]);
    if !codes(&r.check_execution_plan_safety(&large, &markets, &generous)).is_empty() {
        return Err("2,000 USD under a 5,000 USD cap".to_string());
    }
    let tighter = capped_options(1000.0, &[("USDT", 1.0)]);
    if codes(&r.check_execution_plan_safety(&large, &markets, &tighter)) != ["notional_exceeds_cap"]
    {
        return Err("and the same 2,000 USD trips a 1,000 USD cap".to_string());
    }
    Ok(())
}

fn with_no_cap_no_notional_check_runs(r: &OrderRouter) -> Result<(), String> {
    // The default. This class does not decide how much of your money you may
    // trade — the guardrail is opt-in, so a plan of any size passes untouched,
    // and a caller who never asked for a cap is not made to supply usdRates for
    // it.
    let markets = permissive_stub_markets();
    let large = planned(r, 1000.0, 100.0, 0.0)?;
    let found = codes(&r.check_execution_plan_safety(&large, &markets, &uncapped_options(&[("USDT", 1.0)])));
    if !found.is_empty() {
        return Err(format!("100,000 USD passes when no cap is set, got {found:?}"));
    }
    let bare = codes(&r.check_execution_plan_safety(&large, &markets, &Value::Map(HashMap::new())));
    if !bare.is_empty() {
        return Err(format!("and needs no usdRates at all, got {bare:?}"));
    }
    Ok(())
}

fn usdt_is_not_a_dollar(r: &OrderRouter) -> Result<(), String> {
    // A stablecoin peg is an empirical fact, not a definition. With a cap in
    // force and no rate supplied, a USDT-quoted step cannot be valued and must
    // BLOCK — 0.1 USDT of notional is trivially under the cap, and it is still
    // refused, because the point is that the cap the caller ASKED FOR could not
    // be evaluated.
    let markets = permissive_stub_markets();
    let plan = planned(r, 0.001, 100.0, 25.0)?;
    let violations =
        r.check_execution_plan_safety(&plan, &markets, &capped_options(25.0, &[("USD", 1.0)]));
    let blocked = violations
        .iter()
        .any(|v| text(v, "code") == "notional_unvaluable" && r.bool_at(v, "blocking", false));
    if !blocked {
        return Err("an unvaluable step BLOCKS rather than being skipped".to_string());
    }
    // Unrelated rates do not help.
    let unrelated =
        r.check_execution_plan_safety(&plan, &markets, &capped_options(25.0, &[("ETH", 3000.0)]));
    if codes(&unrelated) != ["notional_unvaluable"] {
        return Err("a rate for another currency does not value this step".to_string());
    }
    // Either side of the market resolves it, and a depegged rate is respected.
    for resolving in [("USDT", 0.4), ("BTC", 100.0)] {
        let resolved =
            r.check_execution_plan_safety(&plan, &markets, &capped_options(25.0, &[resolving]));
        if !codes(&resolved).is_empty() {
            return Err(format!("a rate for {} values the step", resolving.0));
        }
    }
    // And with NO cap set there is nothing to enforce, so the same unvaluable
    // step passes.
    let uncapped = r.check_execution_plan_safety(&plan, &markets, &uncapped_options(&[]));
    if !codes(&uncapped).is_empty() {
        return Err("an unvaluable step passes when no cap is set".to_string());
    }
    Ok(())
}

fn a_per_call_cap_overrides_the_client_one() -> Result<(), String> {
    // The cap is a guardrail the CALLER sets, so the per-call value wins — there
    // is no ceiling re-imposed behind their back. Both directions are asserted
    // because the old implementation clamped one way only, and a guardrail that
    // silently refuses to loosen is as surprising as one that silently refuses
    // to tighten.
    let client = capped_client(100.0)?;
    let markets = permissive_stub_markets();
    // 0.005 BTC at 100000 USDT is 500 USD.
    let plan = planned(&client, 0.005, 100000.0, 0.0)?;
    let against_the_client_cap =
        client.check_execution_plan_safety(&plan, &markets, &uncapped_options(&[("USDT", 1.0)]));
    if codes(&against_the_client_cap) != ["notional_exceeds_cap"] {
        return Err("500 USD trips the client cap of 100".to_string());
    }
    if !numbers_match(client.number_at(&against_the_client_cap[0], "limit", 0.0), 100.0) {
        return Err("the client cap is the limit reported".to_string());
    }
    // Raised for this call.
    let raised =
        client.check_execution_plan_safety(&plan, &markets, &capped_options(1000.0, &[("USDT", 1.0)]));
    if !codes(&raised).is_empty() {
        return Err("a per-call cap of 1000 lets it through".to_string());
    }
    // Lowered for this call.
    let tightened =
        client.check_execution_plan_safety(&plan, &markets, &capped_options(10.0, &[("USDT", 1.0)]));
    if !numbers_match(client.number_at(&tightened[0], "limit", 0.0), 10.0) {
        return Err("a per-call cap of 10 is the limit reported".to_string());
    }
    Ok(())
}

fn refuses_incoherent_routes(r: &OrderRouter) -> Result<(), String> {
    // build_execution_plan used to copy from, to, pair and side straight out of
    // the server's JSON, so a compromised — or simply buggy — router response
    // could steer real orders into any real market and every check would pass
    // it. The client now checks the answer against its OWN record of the
    // question.
    let mut route = one_leg_route("buy", "BTC", "USDT", 0.1, 100.0);
    OrderRouter::set_key(&mut route, "clientRequestedFrom", Value::Str("USDT".into()));
    OrderRouter::set_key(&mut route, "clientRequestedTo", Value::Str("ETH".into()));
    match r.build_execution_plan(&route, &Value::Null) {
        Ok(_) => return Err("a route that produces the wrong asset is refused".to_string()),
        Err(e) => {
            if !e.message.contains("produces BTC, not the requested ETH") {
                return Err(format!("wrong refusal for a produces mismatch: {e}"));
            }
        }
    }
    let mut route = one_leg_route("buy", "BTC", "USDT", 0.1, 100.0);
    OrderRouter::set_key(&mut route, "clientRequestedFrom", Value::Str("EUR".into()));
    OrderRouter::set_key(&mut route, "clientRequestedTo", Value::Str("BTC".into()));
    match r.build_execution_plan(&route, &Value::Null) {
        Ok(_) => return Err("a route that spends an unoffered asset is refused".to_string()),
        Err(e) => {
            if !e.message.contains("spends USDT, not the requested EUR") {
                return Err(format!("wrong refusal for a spends mismatch: {e}"));
            }
        }
    }
    // A well-formed route still plans.
    let mut route = one_leg_route("buy", "BTC", "USDT", 0.1, 100.0);
    OrderRouter::set_key(&mut route, "clientRequestedFrom", Value::Str("USDT".into()));
    OrderRouter::set_key(&mut route, "clientRequestedTo", Value::Str("BTC".into()));
    let plan = r.build_execution_plan(&route, &Value::Null).map_err(|e| e.to_string())?;
    if r.list_at(&plan, "steps").len() != 1 {
        return Err("a coherent route still plans".to_string());
    }
    Ok(())
}

fn format_number_never_uses_exponents(r: &OrderRouter) -> Result<(), String> {
    for probe in [0.0000001f64, 1234.5, 0.1, 1e17] {
        let rendered = r.format_number(probe).map_err(|e| e.to_string())?;
        if rendered.contains('e') || rendered.contains('E') {
            return Err(format!("format_number emitted an exponent for {probe}: {rendered}"));
        }
    }
    if r.format_number(0.0).map_err(|e| e.to_string())? != "0" {
        return Err("zero renders as 0".to_string());
    }
    // A magnitude no real amount reaches, where the six languages stop agreeing.
    if r.format_number(1e18).is_ok() {
        return Err("a number too large to render identically is refused".to_string());
    }
    Ok(())
}


fn route_url_is_deterministic(r: &OrderRouter) -> Result<(), String> {
    // The URL has to be byte-identical in six languages: the query keys go out
    // in a fixed order, numbers go through format_number rather than the
    // language's own float printer, and the escaping is encodeURIComponent's
    // rather than form-urlencoded's. This is the same assertion the TypeScript
    // suite makes, against the same expected string.
    let mut config = HashMap::new();
    config.insert("apiKey".to_string(), Value::Str("k".to_string()));
    config.insert("baseUrl".to_string(), Value::Str("https://example.test/api/".to_string()));
    let client = OrderRouter::new(&Value::Map(config)).map_err(|e| e.to_string())?;
    let mut params = HashMap::new();
    params.insert("amountIn".to_string(), Value::Float(0.001));
    params.insert("strategy".to_string(), Value::Str("split_capped".to_string()));
    params.insert("maxVenues".to_string(), Value::Int(3));
    params.insert(
        "exchanges".to_string(),
        Value::List(vec![Value::Str("binance".into()), Value::Str("kraken".into())]),
    );
    params.insert("certified".to_string(), Value::Bool(true));
    let url = client
        .build_route_url("usdt", "btc", &Value::Map(params))
        .map_err(|e| e.to_string())?;
    let expected = "https://example.test/api/route?from=USDT&to=BTC&amountIn=0.001&strategy=split_capped&maxVenues=3&exchanges=binance%2Ckraken&certified=true";
    if url != expected {
        return Err(format!("expected\n  {expected}\ngot\n  {url}"));
    }
    // Exactly one of amountIn / amountOut — neither and both are both refused,
    // client-side, because a typo must not become a confidently wrong route.
    let empty = Value::Map(HashMap::new());
    if r.build_route_url("USDT", "BTC", &empty).is_ok() {
        return Err("neither amountIn nor amountOut is refused".to_string());
    }
    let mut both = HashMap::new();
    both.insert("amountIn".to_string(), Value::Float(1.0));
    both.insert("amountOut".to_string(), Value::Float(1.0));
    if r.build_route_url("USDT", "BTC", &Value::Map(both)).is_ok() {
        return Err("both amountIn and amountOut is refused".to_string());
    }
    let mut one = HashMap::new();
    one.insert("amountIn".to_string(), Value::Float(1.0));
    if r.build_route_url("", "BTC", &Value::Map(one)).is_ok() {
        return Err("an empty fromAsset is refused".to_string());
    }
    Ok(())
}

fn encode_uri_component_matches_javascript(r: &OrderRouter) -> Result<(), String> {
    // encodeURIComponent leaves !'()* alone and escapes a space as %20;
    // form-urlencoded escapes the former and renders a space as +. A balances
    // string or bridge list containing any of them would otherwise produce a
    // different URL here than in the other five ports.
    let mut params = HashMap::new();
    params.insert("amountIn".to_string(), Value::Float(1.0));
    params.insert("bridges".to_string(), Value::Str("a!b'c(d)e*f g".to_string()));
    let url = r
        .build_route_url("USDT", "BTC", &Value::Map(params))
        .map_err(|e| e.to_string())?;
    if !url.contains("bridges=a!b'c(d)e*f%20g") {
        return Err(format!("encodeURIComponent semantics, got {url}"));
    }
    // And a colon IS escaped, which is what balances entries depend on.
    let mut params = HashMap::new();
    params.insert("amountIn".to_string(), Value::Float(1.0));
    params.insert("balances".to_string(), Value::Str("stub.USDT:1000".to_string()));
    let url = r
        .build_route_url("USDT", "BTC", &Value::Map(params))
        .map_err(|e| e.to_string())?;
    if !url.contains("balances=stub.USDT%3A1000") {
        return Err(format!("a colon is escaped, got {url}"));
    }
    Ok(())
}

// ---------------------------------------------------------------------------
// entry point
// ---------------------------------------------------------------------------

/// Runs the OrderRouter suite. Returns the number of checks that passed.
pub fn run() -> Result<usize, String> {
    let f = fixture()?;
    let r = router()?;
    let mut passed = 0usize;
    let checks: Vec<(&str, Box<dyn Fn() -> Result<(), String>>)> = vec![
        ("fixture: buildExecutionPlan", Box::new(|| fixture_build_execution_plan(&router()?, &fixture()?))),
        ("fixture: buildExecutionPlan is deterministic and does not mutate its input", Box::new(|| fixture_plan_is_deterministic(&router()?, &fixture()?))),
        ("fixture: checkExecutionPlanSafety", Box::new(|| fixture_check_execution_plan_safety(&router()?, &fixture()?))),
        ("fixture: reconcileExecutionStep", Box::new(|| fixture_reconcile_execution_step(&router()?, &fixture()?))),
        ("fixture: a sequence of reconciliations on one hop", Box::new(|| fixture_reconcile_sequence(&router()?, &fixture()?))),
        ("fixture: buildUnwindPlan", Box::new(|| fixture_build_unwind_plan(&router()?, &fixture()?))),
        ("a buy-side unwind order never spends more quote than the residual actually holds", Box::new(|| unwind_buy_is_fundable(&router()?, &fixture()?))),
        ("fixture: numberAt reads one number grammar in all six languages", Box::new(|| fixture_number_at(&router()?, &fixture()?))),
        ("constructor: apiKey is required, and maxNotionalUsd is an opt-in guardrail at any size", Box::new(constructor_guards)),
        ("the limit price sits on the side that costs you, and only there", Box::new(|| limit_price_side(&router()?))),
        ("an empty plan is not a safe plan", Box::new(|| empty_plan_is_not_safe(&router()?))),
        ("a cap that IS set binds exactly, at whatever size, and includes the slippage", Box::new(|| a_cap_that_is_set_binds_exactly(&router()?))),
        ("with no cap set, no notional check runs at all", Box::new(|| with_no_cap_no_notional_check_runs(&router()?))),
        ("a per-call cap overrides the client-level one, in both directions", Box::new(a_per_call_cap_overrides_the_client_one)),
        ("USDT is not assumed to be one dollar, and an unvaluable step blocks only under a cap", Box::new(|| usdt_is_not_a_dollar(&router()?))),
        ("a route that does not match the question asked is refused", Box::new(|| refuses_incoherent_routes(&router()?))),
        ("formatNumber never emits exponent notation", Box::new(|| format_number_never_uses_exponents(&router()?))),
        ("fetchRoute builds a deterministic query", Box::new(|| route_url_is_deterministic(&router()?))),
        ("the query escaping is encodeURIComponent's, not form-urlencoded's", Box::new(|| encode_uri_component_matches_javascript(&router()?))),
        ("execute: dry_run is the default and a forgotten live flag places nothing", Box::new(|| dry_run_places_nothing(&router()?))),
        ("execute: an unknown strategy is refused even in dry run", Box::new(|| an_unknown_strategy_is_refused_even_in_dry_run(&router()?))),
        ("execute: sequential places IOC limit orders in plan order", Box::new(|| sequential_places_and_fills(&router()?))),
        ("execute: a failure BEFORE dispatch records no open order", Box::new(|| a_failure_before_dispatch_records_no_open_order(&router()?))),
        ("execute: a createOrder that times out is outcome-unknown, not a plain failure", Box::new(|| a_timeout_is_outcome_unknown_not_a_plain_failure(&router()?))),
        ("execute: a definite rejection stays a plain failure and reports no open order", Box::new(|| a_definite_rejection_stays_a_plain_failure(&router()?))),
        ("execute: a throttled request is a plain failure, not a possibly-live order", Box::new(|| a_rate_limit_rejection_is_a_plain_failure(&router()?))),
        ("execute: limit_protected refuses a non-positive pollIntervalMs before placing anything", Box::new(|| limit_protected_refuses_a_zero_poll_interval(&router()?))),
        ("execute: a fill that stays unknown after the re-read halts instead of guessing", Box::new(|| a_fill_that_stays_unknown_halts_instead_of_guessing(&router()?))),
        ("execute: refuses to go live above a cap the caller set", Box::new(|| execute_refuses_to_go_live_above_the_cap(&router()?))),
        ("execute: the same trade goes through when nobody asked for a cap", Box::new(|| execute_places_the_same_trade_with_no_cap(&router()?))),
        ("execute: a resting order is cancelled, and a cancel that fails halts the route", Box::new(|| a_resting_order_is_cancelled(&router()?))),
        ("execute: a throw after createOrder still reports the id and an open order", Box::new(|| a_known_order_id_survives_a_throw_after_create(&router()?))),
        ("execute: a spend the venue DID report survives an unknown fill", Box::new(|| a_reported_spend_survives_an_unknown_fill(&router()?))),
        ("execute: a report is summarised in the assets it names, not across currencies", Box::new(|| a_report_is_summarised_in_the_assets_it_names(&router()?))),
        ("execute: a plan carries its age, and a stale one is refused only when asked", Box::new(|| plan_age_is_reported_and_refused_only_when_asked(&router()?))),
        ("execute: a market order and a notional cap are refused together", Box::new(|| a_market_order_and_a_cap_are_refused_together(&router()?))),
        ("execute: atomic_ish demands the whole route pre-funded", Box::new(|| atomic_ish_demands_the_whole_route_prefunded(&router()?))),
        ("execute: best_effort demands both of its acknowledgements", Box::new(|| best_effort_demands_its_acknowledgements(&router()?))),
    ];
    let _ = (&f, &r);
    for (name, check) in checks {
        match check() {
            Ok(()) => {
                println!("ok   {name}");
                passed += 1;
            }
            Err(message) => return Err(format!("{name} — {message}")),
        }
    }
    Ok(passed)
}


#[cfg(test)]
mod tests {
    /// The whole cross-language contract, runnable without the generated
    /// exchange surface. `cargo test -p ccxt-base`.
    #[test]
    fn order_router_matches_the_shared_fixture() {
        match super::run() {
            Ok(passed) => assert!(passed > 0, "the suite ran no checks"),
            Err(message) => panic!("{message}"),
        }
    }
}

// ---------------------------------------------------------------------------
// execute, against stub venues
//
// The money path. It cannot be exercised against a real exchange from a test,
// and should not be — CLAUDE.md §5.5 caps a live trade at 25 USD and this suite
// places none. What IS testable, and is what the other five ports test too, is
// the behaviour around the placement: that dry_run touches nothing, that a
// forgotten `live` flag places nothing, that a refusal before dispatch records
// no open order, and that an unknown outcome halts rather than reconciling on a
// number nobody observed.
// ---------------------------------------------------------------------------

use crate::order_router::RouterVenue;
use std::collections::BTreeMap;
use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::Arc as StdArc;

struct StubVenue {
    id: String,
    supports_ioc: bool,
    /// Counts createOrder calls, so "placed nothing" is asserted rather than
    /// assumed.
    orders_placed: StdArc<AtomicUsize>,
    /// When set, createOrder fails with this error kind instead of filling.
    fail_with: Option<&'static str>,
    /// When true the order comes back with no `filled` at all — the case that
    /// used to be read as a zero fill.
    omit_filled: bool,
    /// When true createOrder returns a RESTING order, so limit_protected enters
    /// its poll loop and the fetch_order failure below is reached.
    created_open: bool,
    /// When set, the re-read still has no `filled` but DOES carry these
    /// (cost, average) — the venue is certain what it charged and silent about
    /// what it bought.
    reread_cost: Option<(f64, f64)>,
    /// The `free` map fetch_balance reports. `None` means "richly funded", so a
    /// prefunding check passes without every other test having to declare
    /// balances it does not care about.
    free_balances: Option<Vec<(String, f64)>>,
    /// When true, cancel_order errors — the venue refuses to take the resting
    /// order back off the book.
    cancel_fails: bool,
    /// Counts cancel_order calls, so "the resting order was cancelled" is
    /// asserted rather than assumed.
    cancels: StdArc<AtomicUsize>,
    /// When set, fetch_order hands this back instead of erroring — the order as
    /// it looks on the re-read after a cancel.
    reread_order: Option<(String, f64, f64, f64)>,
}

impl StubVenue {
    fn new(id: &str) -> Self {
        StubVenue {
            id: id.to_string(),
            supports_ioc: true,
            orders_placed: StdArc::new(AtomicUsize::new(0)),
            fail_with: None,
            omit_filled: false,
            created_open: false,
            reread_cost: None,
            free_balances: None,
            cancel_fails: false,
            cancels: StdArc::new(AtomicUsize::new(0)),
            reread_order: None,
        }
    }
}

#[async_trait::async_trait]
impl RouterVenue for StubVenue {
    fn id(&self) -> String {
        self.id.clone()
    }
    fn amount_to_precision(&self, _symbol: &str, amount: f64) -> String {
        format!("{amount}")
    }
    fn price_to_precision(&self, _symbol: &str, price: f64) -> String {
        format!("{price}")
    }
    fn supports_ioc(&self) -> bool {
        self.supports_ioc
    }
    async fn create_order(
        &self,
        _symbol: &str,
        _order_type: &str,
        _side: &str,
        amount: f64,
        price: f64,
        _params: &Value,
    ) -> Result<Value, crate::error::ExchangeError> {
        self.orders_placed.fetch_add(1, Ordering::SeqCst);
        if let Some(kind) = self.fail_with {
            return Err(crate::error::ExchangeError::new(kind, "stub refuses"));
        }
        let mut order = HashMap::new();
        order.insert("id".to_string(), Value::Str("stub-1".to_string()));
        if self.created_open {
            // A venue that reports the order it just accepted as still OPEN — the
            // shape a dropped timeInForce leaves behind. It still answers with a
            // fill, exactly as the other five ports' stubs do, so that "the order
            // is resting" and "the fill is unknown" stay separate cases.
            order.insert("status".to_string(), Value::Str("open".to_string()));
        } else {
            order.insert("status".to_string(), Value::Str("closed".to_string()));
        }
        if !self.omit_filled {
            order.insert("filled".to_string(), Value::Float(amount));
            order.insert("average".to_string(), Value::Float(price));
            order.insert("cost".to_string(), Value::Float(amount * price));
        }
        Ok(Value::Map(order))
    }
    async fn fetch_order(&self, _id: &str, _symbol: &str) -> Result<Value, crate::error::ExchangeError> {
        if let Some((status, filled, average, cost)) = &self.reread_order {
            let mut order = HashMap::new();
            order.insert("id".to_string(), Value::Str("stub-1".to_string()));
            order.insert("status".to_string(), Value::Str(status.clone()));
            order.insert("filled".to_string(), Value::Float(*filled));
            order.insert("average".to_string(), Value::Float(*average));
            order.insert("cost".to_string(), Value::Float(*cost));
            return Ok(Value::Map(order));
        }
        if self.omit_filled {
            // Still incomplete on the re-read: the fill stays genuinely unknown.
            let mut order = HashMap::new();
            order.insert("id".to_string(), Value::Str("stub-1".to_string()));
            order.insert("status".to_string(), Value::Str("closed".to_string()));
            if let Some((cost, average)) = self.reread_cost {
                order.insert("cost".to_string(), Value::Float(cost));
                order.insert("average".to_string(), Value::Float(average));
            }
            return Ok(Value::Map(order));
        }
        Err(crate::error::ExchangeError::new("ExchangeError", "stub cannot read the order back"))
    }
    async fn cancel_order(&self, _id: &str, _symbol: &str) -> Result<Value, crate::error::ExchangeError> {
        self.cancels.fetch_add(1, Ordering::SeqCst);
        if self.cancel_fails {
            return Err(crate::error::ExchangeError::new("ExchangeError", "stub refuses to cancel"));
        }
        Ok(Value::Map(HashMap::new()))
    }
    async fn fetch_balance(&self) -> Result<Value, crate::error::ExchangeError> {
        let mut free = HashMap::new();
        match &self.free_balances {
            Some(entries) => {
                for (asset, amount) in entries {
                    free.insert(asset.clone(), Value::Float(*amount));
                }
            }
            None => {
                free.insert("USDT".to_string(), Value::Float(1_000_000.0));
                free.insert("BTC".to_string(), Value::Float(1_000_000.0));
                free.insert("ETH".to_string(), Value::Float(1_000_000.0));
            }
        }
        let mut balance = HashMap::new();
        balance.insert("free".to_string(), Value::Map(free));
        Ok(Value::Map(balance))
    }
}

fn one_leg_plan(r: &OrderRouter) -> Result<Value, String> {
    let route = one_leg_route("buy", "BTC", "USDT", 0.2, 100.0);
    r.build_execution_plan(&route, &Value::Map(HashMap::new())).map_err(|e| e.to_string())
}

fn block_on<F: std::future::Future>(future: F) -> F::Output {
    tokio::runtime::Builder::new_current_thread()
        .enable_all()
        .build()
        .expect("a tokio runtime")
        .block_on(future)
}

fn execute_options(live: bool, strategy: &str) -> Value {
    let mut usd_rates = HashMap::new();
    usd_rates.insert("USDT".to_string(), Value::Float(1.0));
    let mut market = HashMap::new();
    market.insert("symbol".to_string(), Value::Str("BTC/USDT".to_string()));
    market.insert("base".to_string(), Value::Str("BTC".to_string()));
    market.insert("quote".to_string(), Value::Str("USDT".to_string()));
    let mut by_symbol = HashMap::new();
    by_symbol.insert("BTC/USDT".to_string(), Value::Map(market));
    let mut markets = HashMap::new();
    markets.insert("stub".to_string(), Value::Map(by_symbol));
    let mut options = HashMap::new();
    options.insert("strategy".to_string(), Value::Str(strategy.to_string()));
    options.insert("live".to_string(), Value::Bool(live));
    options.insert("usdRates".to_string(), Value::Map(usd_rates));
    options.insert("markets".to_string(), Value::Map(markets));
    Value::Map(options)
}

fn dry_run_places_nothing(r: &OrderRouter) -> Result<(), String> {
    // The default, and the one that matters most: a caller who forgets `live`
    // must get a rehearsal, not a trade. Asserted by counting createOrder calls
    // rather than by reading the report, because the report is exactly what a
    // buggy implementation would still fill in correctly.
    let plan = one_leg_plan(r)?;
    let venue = StubVenue::new("stub");
    let counter = StdArc::clone(&venue.orders_placed);
    let mut venues: BTreeMap<String, Box<dyn RouterVenue>> = BTreeMap::new();
    venues.insert("stub".to_string(), Box::new(venue));

    // strategy: sequential, but live is FALSE — this is the forgotten-flag case.
    let report = block_on(r.execute(&plan, &venues, &execute_options(false, "sequential")))
        .map_err(|e| e.to_string())?;
    if counter.load(Ordering::SeqCst) != 0 {
        return Err("a non-live execute placed an order".to_string());
    }
    if r.string_at(&report, "strategy", "") != "dry_run" {
        return Err("live=false must force dry_run".to_string());
    }
    if !r.bool_at(&report, "dryRun", false) {
        return Err("the report must say it was a dry run".to_string());
    }
    if r.number_at(&report, "wouldPlaceOrders", 0.0) != 1.0 {
        return Err("a dry run reports what it would have placed".to_string());
    }
    Ok(())
}

fn an_unknown_strategy_is_refused_even_in_dry_run(r: &OrderRouter) -> Result<(), String> {
    let plan = one_leg_plan(r)?;
    let venues: BTreeMap<String, Box<dyn RouterVenue>> = BTreeMap::new();
    let outcome = block_on(r.execute(&plan, &venues, &execute_options(false, "sideways")));
    match outcome {
        Err(e) if e.message.contains("unknown execution strategy") => Ok(()),
        Err(e) => Err(format!("wrong refusal: {e}")),
        Ok(_) => Err("an unknown strategy is refused before anything else".to_string()),
    }
}

fn sequential_places_and_fills(r: &OrderRouter) -> Result<(), String> {
    let plan = one_leg_plan(r)?;
    let venue = StubVenue::new("stub");
    let counter = StdArc::clone(&venue.orders_placed);
    let mut venues: BTreeMap<String, Box<dyn RouterVenue>> = BTreeMap::new();
    venues.insert("stub".to_string(), Box::new(venue));
    let report = block_on(r.execute(&plan, &venues, &execute_options(true, "sequential")))
        .map_err(|e| e.to_string())?;
    if counter.load(Ordering::SeqCst) != 1 {
        return Err(format!("expected 1 order, placed {}", counter.load(Ordering::SeqCst)));
    }
    let results = r.list_at(&report, "steps");
    let status = r.string_at(&results[0], "status", "");
    if status != "filled" {
        return Err(format!("expected filled, got {status}"));
    }
    if !r.bool_at(&results[0], "placementAttempted", false) {
        return Err("a dispatched order records placementAttempted".to_string());
    }
    Ok(())
}

fn a_failure_before_dispatch_records_no_open_order(r: &OrderRouter) -> Result<(), String> {
    // The distinction placementAttempted exists for. A venue that is not in the
    // map cannot have received anything, so reporting an unconfirmed placement
    // for it would be a false alarm — and a false alarm on this particular
    // signal sends someone hunting for an order that does not exist.
    let plan = one_leg_plan(r)?;
    let venue = StubVenue::new("other");
    let mut venues: BTreeMap<String, Box<dyn RouterVenue>> = BTreeMap::new();
    venues.insert("other".to_string(), Box::new(venue));
    let report = block_on(r.execute(&plan, &venues, &execute_options(true, "sequential")))
        .map_err(|e| e.to_string())?;
    let results = r.list_at(&report, "steps");
    if r.bool_at(&results[0], "placementAttempted", true) {
        return Err("nothing was dispatched, so placementAttempted must be false".to_string());
    }
    if r.string_at(&results[0], "errorCode", "") != "venue_missing" {
        return Err("the missing venue is named".to_string());
    }
    if !r.list_at(&report, "openOrders").is_empty() {
        return Err("a failure before dispatch records NO open order".to_string());
    }
    if r.string_at(&report, "haltReason", "") != "order_failed" {
        return Err("a definite failure halts as order_failed".to_string());
    }
    Ok(())
}

fn a_timeout_is_outcome_unknown_not_a_plain_failure(r: &OrderRouter) -> Result<(), String> {
    // A request that timed out may still have been received and acted on. The
    // report must say so: concluding that nothing was placed is the one
    // conclusion that can strand a real position on a real venue.
    let plan = one_leg_plan(r)?;
    let mut venue = StubVenue::new("stub");
    venue.fail_with = Some("RequestTimeout");
    let mut venues: BTreeMap<String, Box<dyn RouterVenue>> = BTreeMap::new();
    venues.insert("stub".to_string(), Box::new(venue));
    let report = block_on(r.execute(&plan, &venues, &execute_options(true, "sequential")))
        .map_err(|e| e.to_string())?;
    let results = r.list_at(&report, "steps");
    if r.string_at(&results[0], "status", "") != "outcome_unknown" {
        return Err(format!("expected outcome_unknown, got {}", r.string_at(&results[0], "status", "")));
    }
    if r.string_at(&report, "haltReason", "") != "outcome_unknown" {
        return Err("the halt reason must not claim nothing_filled".to_string());
    }
    let open = r.list_at(&report, "openOrders");
    if open.len() != 1 || r.string_at(&open[0], "reason", "") != "placement_unconfirmed" {
        return Err("an unconfirmed placement is recorded".to_string());
    }
    Ok(())
}

fn a_definite_rejection_stays_a_plain_failure(r: &OrderRouter) -> Result<(), String> {
    // The counterpart. An ExchangeError is the venue ANSWERING — a definite
    // "no" — and treating it as unknown would send someone hunting for an order
    // that was never accepted.
    let plan = one_leg_plan(r)?;
    let mut venue = StubVenue::new("stub");
    venue.fail_with = Some("ExchangeError");
    let mut venues: BTreeMap<String, Box<dyn RouterVenue>> = BTreeMap::new();
    venues.insert("stub".to_string(), Box::new(venue));
    let report = block_on(r.execute(&plan, &venues, &execute_options(true, "sequential")))
        .map_err(|e| e.to_string())?;
    let results = r.list_at(&report, "steps");
    if r.string_at(&results[0], "status", "") != "failed" {
        return Err("a definite rejection is a plain failure".to_string());
    }
    if !r.list_at(&report, "openOrders").is_empty() {
        return Err("a definite rejection leaves no open order".to_string());
    }
    Ok(())
}

fn limit_protected_refuses_a_zero_poll_interval(r: &OrderRouter) -> Result<(), String> {
    // The poll loop advances its clock by pollIntervalMs, so 0 never reaches
    // the timeout: it spins on fetch_order forever with a real order resting on
    // a real venue, and the timeout that exists to cancel that order never
    // arrives. Refused BEFORE create_order — refusing afterwards would leave
    // the very order the loop could not clean up.
    for interval in [0.0_f64, -1.0_f64] {
        let plan = one_leg_plan(r)?;
        let mut venue = StubVenue::new("stub");
        venue.created_open = true;
        let placed = StdArc::clone(&venue.orders_placed);
        let mut venues: BTreeMap<String, Box<dyn RouterVenue>> = BTreeMap::new();
        venues.insert("stub".to_string(), Box::new(venue));
        let mut options = execute_options(true, "limit_protected");
        OrderRouter::set_key(&mut options, "orderTimeoutMs", Value::Float(4.0));
        OrderRouter::set_key(&mut options, "pollIntervalMs", Value::Float(interval));
        if block_on(r.execute(&plan, &venues, &options)).is_ok() {
            return Err(format!("pollIntervalMs {interval} must be refused"));
        }
        if placed.load(Ordering::SeqCst) != 0 {
            return Err("nothing may reach the venue".to_string());
        }
    }
    Ok(())
}

fn a_rate_limit_rejection_is_a_plain_failure(r: &OrderRouter) -> Result<(), String> {
    // The classifier used to walk the error hierarchy, where DDoSProtection,
    // RateLimitExceeded and InvalidNonce all sit UNDER NetworkError — so every
    // throttled request was reported as a possibly-live order, halting a route
    // the other five ports complete and sending an operator hunting for an
    // order that was never accepted. The other five match four names exactly;
    // this pins Rust to the same list.
    for kind in ["RateLimitExceeded", "DDoSProtection", "InvalidNonce"] {
        let plan = one_leg_plan(r)?;
        let mut venue = StubVenue::new("stub");
        venue.fail_with = Some(kind);
        let mut venues: BTreeMap<String, Box<dyn RouterVenue>> = BTreeMap::new();
        venues.insert("stub".to_string(), Box::new(venue));
        let report = block_on(r.execute(&plan, &venues, &execute_options(true, "sequential")))
            .map_err(|e| e.to_string())?;
        let results = r.list_at(&report, "steps");
        let status = r.string_at(&results[0], "status", "");
        if status != "failed" {
            return Err(format!("{kind} is the venue answering; expected failed, got {status}"));
        }
        if !r.list_at(&report, "openOrders").is_empty() {
            return Err(format!("{kind} left an open order behind"));
        }
    }
    // The four that genuinely are ambiguous still are.
    for kind in ["RequestTimeout", "ExchangeNotAvailable", "NetworkError", "OnMaintenance"] {
        let plan = one_leg_plan(r)?;
        let mut venue = StubVenue::new("stub");
        venue.fail_with = Some(kind);
        let mut venues: BTreeMap<String, Box<dyn RouterVenue>> = BTreeMap::new();
        venues.insert("stub".to_string(), Box::new(venue));
        let report = block_on(r.execute(&plan, &venues, &execute_options(true, "sequential")))
            .map_err(|e| e.to_string())?;
        let results = r.list_at(&report, "steps");
        let status = r.string_at(&results[0], "status", "");
        if status != "outcome_unknown" {
            return Err(format!("{kind} may still have reached the venue; got {status}"));
        }
    }
    Ok(())
}

fn a_fill_that_stays_unknown_halts_instead_of_guessing(r: &OrderRouter) -> Result<(), String> {
    // "The venue said zero" and "the venue said nothing" are different facts.
    // A venue that omits `filled` used to yield 0, which reconciliation read as
    // nothing_filled and halted on — while a real position sat on a real venue.
    let plan = one_leg_plan(r)?;
    let mut venue = StubVenue::new("stub");
    venue.omit_filled = true;
    let mut venues: BTreeMap<String, Box<dyn RouterVenue>> = BTreeMap::new();
    venues.insert("stub".to_string(), Box::new(venue));
    let report = block_on(r.execute(&plan, &venues, &execute_options(true, "sequential")))
        .map_err(|e| e.to_string())?;
    let results = r.list_at(&report, "steps");
    if r.string_at(&results[0], "status", "") != "outcome_unknown" {
        return Err(format!("expected outcome_unknown, got {}", r.string_at(&results[0], "status", "")));
    }
    let open = r.list_at(&report, "openOrders");
    if open.len() != 1 || r.string_at(&open[0], "reason", "") != "fill_unconfirmed" {
        return Err("the unconfirmed fill is recorded".to_string());
    }
    Ok(())
}

fn execute_refuses_to_go_live_above_the_cap(r: &OrderRouter) -> Result<(), String> {
    // 100 USD against a 25 USD guardrail the caller asked for, re-checked at
    // execute rather than only at plan time. The refusal happens BEFORE any
    // order goes out, which is the property worth asserting — a cap checked
    // after the fact is an incident report, not a guardrail.
    let route = one_leg_route("buy", "BTC", "USDT", 1.0, 100.0);
    let plan = r.build_execution_plan(&route, &Value::Map(HashMap::new())).map_err(|e| e.to_string())?;
    let venue = StubVenue::new("stub");
    let counter = StdArc::clone(&venue.orders_placed);
    let mut venues: BTreeMap<String, Box<dyn RouterVenue>> = BTreeMap::new();
    venues.insert("stub".to_string(), Box::new(venue));
    let mut options = execute_options(true, "sequential");
    OrderRouter::set_key(&mut options, "maxNotionalUsd", Value::Float(25.0));
    let outcome = block_on(r.execute(&plan, &venues, &options));
    match outcome {
        Err(e) if e.message.contains("blocking safety violations") => {
            if counter.load(Ordering::SeqCst) != 0 {
                return Err("the cap must be refused BEFORE any order goes out".to_string());
            }
            Ok(())
        }
        Err(e) => Err(format!("wrong refusal: {e}")),
        Ok(_) => Err("a 100 USD notional is over a 25 USD cap the caller set".to_string()),
    }
}

fn execute_places_the_same_trade_with_no_cap(r: &OrderRouter) -> Result<(), String> {
    // The counterpart, and the point of the guardrail being opt-in: the very
    // same 100 USD trade goes through when nobody asked for a cap. It is also
    // the case the old hard ceiling made unreachable.
    let route = one_leg_route("buy", "BTC", "USDT", 1.0, 100.0);
    let plan = r.build_execution_plan(&route, &Value::Map(HashMap::new())).map_err(|e| e.to_string())?;
    let venue = StubVenue::new("stub");
    let counter = StdArc::clone(&venue.orders_placed);
    let mut venues: BTreeMap<String, Box<dyn RouterVenue>> = BTreeMap::new();
    venues.insert("stub".to_string(), Box::new(venue));
    let report = block_on(r.execute(&plan, &venues, &execute_options(true, "sequential")))
        .map_err(|e| e.to_string())?;
    if counter.load(Ordering::SeqCst) != 1 {
        return Err(format!("expected 1 order, placed {}", counter.load(Ordering::SeqCst)));
    }
    let results = r.list_at(&report, "steps");
    let status = r.string_at(&results[0], "status", "");
    if status != "filled" {
        return Err(format!("100 USD is a normal trade when nobody asked for a cap, got {status}"));
    }
    // And with no cap set, usdRates is not required either: there is no cap to
    // evaluate, so demanding the inputs for one would be asking for something
    // nobody wanted.
    let bare_venue = StubVenue::new("stub");
    let bare_counter = StdArc::clone(&bare_venue.orders_placed);
    let mut bare_venues: BTreeMap<String, Box<dyn RouterVenue>> = BTreeMap::new();
    bare_venues.insert("stub".to_string(), Box::new(bare_venue));
    let mut bare_options = execute_options(true, "sequential");
    OrderRouter::set_key(&mut bare_options, "usdRates", Value::Map(HashMap::new()));
    let bare_report = block_on(r.execute(&plan, &bare_venues, &bare_options))
        .map_err(|e| e.to_string())?;
    if bare_counter.load(Ordering::SeqCst) != 1 {
        return Err("no usdRates are needed when no cap was asked for".to_string());
    }
    let bare_results = r.list_at(&bare_report, "steps");
    if r.string_at(&bare_results[0], "status", "") != "filled" {
        return Err("the order fills without usdRates when no cap is set".to_string());
    }
    Ok(())
}

fn a_resting_order_is_cancelled(r: &OrderRouter) -> Result<(), String> {
    // A venue that silently drops timeInForce turns an immediate-or-cancel order
    // into a plain resting limit order. Recording it and continuing means the
    // next hop is sized on a fill that is still growing behind it, and the
    // leftover order stays live on a real venue after the route has returned and
    // nobody is watching it.
    for strategy in ["sequential", "parallel_within_hop", "best_effort"] {
        let mut options = execute_options(true, strategy);
        if strategy == "best_effort" {
            OrderRouter::set_key(&mut options, "acknowledgeDispersion", Value::Bool(true));
            OrderRouter::set_key(&mut options, "maxOrders", Value::Float(4.0));
        }
        // 1. the cancel works: the order is gone, the re-read is what gets reported
        let plan = one_leg_plan(r)?;
        let mut venue = StubVenue::new("stub");
        venue.created_open = true;
        venue.reread_order = Some(("canceled".to_string(), 0.1, 100.0, 10.0));
        let cancels = StdArc::clone(&venue.cancels);
        let mut venues: BTreeMap<String, Box<dyn RouterVenue>> = BTreeMap::new();
        venues.insert("stub".to_string(), Box::new(venue));
        let report = block_on(r.execute(&plan, &venues, &options)).map_err(|e| e.to_string())?;
        if cancels.load(Ordering::SeqCst) != 1 {
            return Err(format!("{strategy}: the resting order is cancelled, not merely noted"));
        }
        if !r.list_at(&report, "openOrders").is_empty() {
            return Err(format!("{strategy}: nothing is left resting after the cancel"));
        }
        let results = r.list_at(&report, "steps");
        // the re-read is authoritative — the cancel and a fill crossed
        if !numbers_match(r.number_at(&results[0], "filledAmount", 0.0), 0.1) {
            return Err(format!("{strategy}: the fill observed AFTER the cancel is the one reported"));
        }
        if text(&results[0], "status") != "partial" {
            return Err(format!("{strategy}: a real partial fill, not an unknown"));
        }
        // 2. the cancel fails: the order can still fill in full after this
        //    returns, so nothing downstream may be sized on what was observed
        let plan2 = one_leg_plan(r)?;
        let mut stubborn = StubVenue::new("stub");
        stubborn.created_open = true;
        stubborn.cancel_fails = true;
        let mut venues2: BTreeMap<String, Box<dyn RouterVenue>> = BTreeMap::new();
        venues2.insert("stub".to_string(), Box::new(stubborn));
        let failed = block_on(r.execute(&plan2, &venues2, &options)).map_err(|e| e.to_string())?;
        let failed_steps = r.list_at(&failed, "steps");
        if text(&failed_steps[0], "status") != "outcome_unknown" {
            return Err(format!("{strategy}: an uncancellable resting order is never a settled step"));
        }
        let open = r.list_at(&failed, "openOrders");
        if open.len() != 1 || text(&open[0], "reason") != "cancel_failed" {
            return Err(format!("{strategy}: the operator is told what is still live"));
        }
        // 3. the cancel is accepted and the venue still calls it open: same rule
        let plan3 = one_leg_plan(r)?;
        let mut ghost = StubVenue::new("stub");
        ghost.created_open = true;
        ghost.reread_order = Some(("open".to_string(), 0.0, 0.0, 0.0));
        let mut venues3: BTreeMap<String, Box<dyn RouterVenue>> = BTreeMap::new();
        venues3.insert("stub".to_string(), Box::new(ghost));
        let ghosted = block_on(r.execute(&plan3, &venues3, &options)).map_err(|e| e.to_string())?;
        let ghost_steps = r.list_at(&ghosted, "steps");
        if text(&ghost_steps[0], "status") != "outcome_unknown" {
            return Err(format!("{strategy}: a cancel the venue ignored leaves the outcome unknown"));
        }
        let ghost_open = r.list_at(&ghosted, "openOrders");
        if ghost_open.len() != 1 || text(&ghost_open[0], "reason") != "still_open" {
            return Err(format!("{strategy}: and it is reported as still open"));
        }
    }
    Ok(())
}

fn a_known_order_id_survives_a_throw_after_create(r: &OrderRouter) -> Result<(), String> {
    // createOrder RETURNED — the venue accepted something and named it — and the
    // first poll then died. This branch was missing from the Rust port entirely:
    // the step was reported as a plain failure and the id appeared nowhere in
    // the report, so an operator had a live order on a real venue and no way to
    // learn it existed. Two things must hold: the id reaches openOrders, and the
    // step is outcome_unknown rather than "failed", because "failed" reads as
    // "nothing happened" while openOrders says the opposite.
    let plan = one_leg_plan(r)?;
    let mut venue = StubVenue::new("stub");
    venue.created_open = true;
    let mut venues: BTreeMap<String, Box<dyn RouterVenue>> = BTreeMap::new();
    venues.insert("stub".to_string(), Box::new(venue));
    let mut options = execute_options(true, "limit_protected");
    OrderRouter::set_key(&mut options, "orderTimeoutMs", Value::Float(4.0));
    OrderRouter::set_key(&mut options, "pollIntervalMs", Value::Float(1.0));
    let report = block_on(r.execute(&plan, &venues, &options)).map_err(|e| e.to_string())?;
    let results = r.list_at(&report, "steps");
    let status = r.string_at(&results[0], "status", "");
    if status != "outcome_unknown" {
        return Err(format!("a known id means an order exists, so the step is outcome_unknown, got {status}"));
    }
    if r.string_at(&results[0], "orderId", "") != "stub-1" {
        return Err("the id is captured the instant create_order returns, not after the read".to_string());
    }
    let open_orders = r.list_at(&report, "openOrders");
    if open_orders.len() != 1 {
        return Err(format!("a live order the caller cannot see is the worst outcome there is, got {open_orders:?}"));
    }
    if r.string_at(&open_orders[0], "orderId", "") != "stub-1"
        || r.string_at(&open_orders[0], "exchangeId", "") != "stub"
        || r.string_at(&open_orders[0], "reason", "") != "outcome_unknown" {
        return Err(format!("the open order must name the venue, the id and why, got {open_orders:?}"));
    }
    if r.string_at(&report, "haltReason", "") != "outcome_unknown" {
        return Err("the halt must name the ambiguity rather than claim an outright failure".to_string());
    }
    Ok(())
}

fn atomic_ish_demands_the_whole_route_prefunded(r: &OrderRouter) -> Result<(), String> {
    // atomic_ish skips the downstream resize every other strategy performs — it
    // is allowed to, BECAUSE the route is pre-funded end to end, so no hop is
    // sized off the previous hop's proceeds. This port accepted the strategy,
    // took the skip, and never ran the check that earns it: an underfunded route
    // executed anyway and sized hop 1 against BTC that was never bought.
    let plan = one_leg_plan(r)?;
    let funded = StubVenue::new("stub");
    let funded_counter = StdArc::clone(&funded.orders_placed);
    let mut venues: BTreeMap<String, Box<dyn RouterVenue>> = BTreeMap::new();
    venues.insert("stub".to_string(), Box::new(funded));
    let report = block_on(r.execute(&plan, &venues, &execute_options(true, "atomic_ish")))
        .map_err(|e| e.to_string())?;
    if funded_counter.load(Ordering::SeqCst) != 1 {
        return Err("a pre-funded route runs end to end".to_string());
    }
    if r.number_at(&report, "ordersPlaced", 0.0) != 1.0 {
        return Err(format!("a pre-funded route places its order, got {report:?}"));
    }

    // The one-leg plan buys 0.2 BTC at 100 USDT, so it needs 20 USDT free.
    let mut broke = StubVenue::new("stub");
    broke.free_balances = Some(vec![("USDT".to_string(), 1.0), ("BTC".to_string(), 0.0)]);
    let broke_counter = StdArc::clone(&broke.orders_placed);
    let mut poor_venues: BTreeMap<String, Box<dyn RouterVenue>> = BTreeMap::new();
    poor_venues.insert("stub".to_string(), Box::new(broke));
    match block_on(r.execute(&plan, &poor_venues, &execute_options(true, "atomic_ish"))) {
        Err(e) if e.message.contains("pre-funded") => {}
        other => return Err(format!("an underfunded route must be refused, got {other:?}")),
    }
    // And refused BEFORE anything reaches a venue: a refusal that has already
    // traded is not a refusal.
    if broke_counter.load(Ordering::SeqCst) != 0 {
        return Err("the refusal must come before the first createOrder".to_string());
    }
    Ok(())
}

fn a_reported_spend_survives_an_unknown_fill(r: &OrderRouter) -> Result<(), String> {
    // The `if !filled_known` early return must come AFTER the assets and amounts
    // are filled in, not before. inAmount is what build_unwind_plan SUBTRACTS: a
    // buy whose venue reported a `cost` but no `filled` spent that quote for
    // certain, and dropping it leaves the unwind plan believing the money is
    // still on the venue and planning to route home funds that are already gone.
    // TypeScript was the outlier here; this pins the ordering in Rust too, since
    // the drift went unnoticed precisely because only one port had it covered.
    let plan = one_leg_plan(r)?;
    let mut venue = StubVenue::new("stub");
    venue.omit_filled = true;
    venue.reread_cost = Some((10.5, 105.0));
    let mut venues: BTreeMap<String, Box<dyn RouterVenue>> = BTreeMap::new();
    venues.insert("stub".to_string(), Box::new(venue));
    let report = block_on(r.execute(&plan, &venues, &execute_options(true, "sequential")))
        .map_err(|e| e.to_string())?;
    let results = r.list_at(&report, "steps");
    let step = &results[0];
    if r.string_at(step, "status", "") != "outcome_unknown" {
        return Err(format!("the fill is still unknown, got {step:?}"));
    }
    if r.bool_at(step, "filledKnown", true) {
        return Err("filledKnown must be false".to_string());
    }
    // The facts the venue gave are kept.
    if r.string_at(step, "inAsset", "") != "USDT" {
        return Err(format!("the asset actually spent must be named, got {step:?}"));
    }
    if (r.number_at(step, "inAmount", 0.0) - 10.5).abs() > 1e-9 {
        return Err(format!("the amount the venue reported spending must survive, got {step:?}"));
    }
    if !r.bool_at(step, "costKnown", false) {
        return Err("costKnown must be true: the venue really did report it".to_string());
    }
    // The fill itself is never invented.
    if r.number_at(step, "outAmount", -1.0) != 0.0 {
        return Err(format!("an unknown fill must not become a number, got {step:?}"));
    }
    // And the halt, not the missing fields, is what protects the next hop.
    if !r.bool_at(&report, "halted", false) || r.string_at(&report, "haltReason", "") != "outcome_unknown" {
        return Err(format!("the route must halt on the ambiguity, got {report:?}"));
    }
    Ok(())
}

fn a_market_order_and_a_cap_are_refused_together(r: &OrderRouter) -> Result<(), String> {
    // assert_under_cap values the order at the plan's LIMIT price; the market
    // call then sends no price at all and the venue fills wherever the book is,
    // which is the one thing the cap exists to bound. Passing the check and then
    // discarding the price it was computed from is a cap that silently
    // disappears — by this file's own rule, not a cap. So the two are refused
    // together, and refused BEFORE anything reaches a venue.
    let plan = one_leg_plan(r)?;
    let mut capped = StubVenue::new("stub");
    capped.supports_ioc = false;
    let capped_counter = StdArc::clone(&capped.orders_placed);
    let mut venues: BTreeMap<String, Box<dyn RouterVenue>> = BTreeMap::new();
    venues.insert("stub".to_string(), Box::new(capped));
    let mut options = execute_options(true, "sequential");
    OrderRouter::set_key(&mut options, "allowMarketOrders", Value::Bool(true));
    OrderRouter::set_key(&mut options, "maxNotionalUsd", Value::Float(1000.0));
    let report = block_on(r.execute(&plan, &venues, &options)).map_err(|e| e.to_string())?;
    let results = r.list_at(&report, "steps");
    if r.string_at(&results[0], "status", "") != "failed"
        || r.string_at(&results[0], "errorCode", "") != "NotSupported" {
        return Err(format!("a market order under a cap must be refused, got {:?}", results[0]));
    }
    if capped_counter.load(Ordering::SeqCst) != 0 {
        return Err("refused BEFORE dispatch: a cap checked against a price that is then discarded is worse than no cap".to_string());
    }

    // The refusal is about the CAP, not about market orders as such: with no cap
    // set, the identical call goes through.
    let mut uncapped = StubVenue::new("stub");
    uncapped.supports_ioc = false;
    let uncapped_counter = StdArc::clone(&uncapped.orders_placed);
    let mut open_venues: BTreeMap<String, Box<dyn RouterVenue>> = BTreeMap::new();
    open_venues.insert("stub".to_string(), Box::new(uncapped));
    let mut open_options = execute_options(true, "sequential");
    OrderRouter::set_key(&mut open_options, "allowMarketOrders", Value::Bool(true));
    let open_report = block_on(r.execute(&plan, &open_venues, &open_options)).map_err(|e| e.to_string())?;
    if uncapped_counter.load(Ordering::SeqCst) != 1 {
        return Err(format!("with no cap the market order goes out, got {open_report:?}"));
    }
    Ok(())
}

fn plan_age_is_reported_and_refused_only_when_asked(r: &OrderRouter) -> Result<(), String> {
    // A plan is a snapshot of a book. `calculatedAt` was carried on every plan
    // and read by nothing, so execute() would happily trade an hour-old plan at
    // hour-old prices — and the notional cap, computed from those same prices,
    // was just as stale.
    let mut route = one_leg_route("buy", "BTC", "USDT", 0.2, 100.0);
    OrderRouter::set_key(&mut route, "calculatedAt", Value::Float(1_000_000.0));
    let plan = r.build_execution_plan(&route, &Value::Map(HashMap::new())).map_err(|e| e.to_string())?;
    let mut pinned = router()?;
    pinned.set_now_ms(1_060_000.0); // the plan is exactly 60s old
    let venues = |v: StubVenue| {
        let mut m: BTreeMap<String, Box<dyn RouterVenue>> = BTreeMap::new();
        m.insert("stub".to_string(), Box::new(v));
        m
    };

    // Always reported, even with nothing enforced, and nothing is refused by
    // default: this class does not decide how stale a plan the caller may trade.
    let report = block_on(pinned.execute(&plan, &venues(StubVenue::new("stub")), &execute_options(true, "sequential")))
        .map_err(|e| e.to_string())?;
    if pinned.number_at(&report, "planAgeMs", 0.0) != 60_000.0 {
        return Err(format!("the age belongs on the report whether or not it is checked, got {:?}", report));
    }
    let results = pinned.list_at(&report, "steps");
    if pinned.string_at(&results[0], "status", "") != "filled" {
        return Err("nothing is refused by default".to_string());
    }

    // Enforced exactly, at whatever value is asked for.
    let strict = StubVenue::new("stub");
    let strict_counter = StdArc::clone(&strict.orders_placed);
    let mut strict_options = execute_options(true, "sequential");
    OrderRouter::set_key(&mut strict_options, "maxPlanAgeMs", Value::Float(30_000.0));
    match block_on(pinned.execute(&plan, &venues(strict), &strict_options)) {
        Err(e) if e.message.contains("older than maxPlanAgeMs") => {}
        other => return Err(format!("a stale plan must be refused under a limit, got {other:?}")),
    }
    if strict_counter.load(Ordering::SeqCst) != 0 {
        return Err("refused before anything reached the venue".to_string());
    }
    let mut wide_options = execute_options(true, "sequential");
    OrderRouter::set_key(&mut wide_options, "maxPlanAgeMs", Value::Float(120_000.0));
    let passed = block_on(pinned.execute(&plan, &venues(StubVenue::new("stub")), &wide_options))
        .map_err(|e| e.to_string())?;
    let passed_results = pinned.list_at(&passed, "steps");
    if pinned.string_at(&passed_results[0], "status", "") != "filled" {
        return Err("a limit the plan is inside of lets it through".to_string());
    }

    // An age that cannot be determined BLOCKS under an active limit: a freshness
    // check that silently passes when the timestamp is missing is not one.
    let undated = one_leg_plan(r)?;
    let undated_report = block_on(pinned.execute(&undated, &venues(StubVenue::new("stub")), &execute_options(true, "sequential")))
        .map_err(|e| e.to_string())?;
    if pinned.number_at(&undated_report, "planAgeMs", 0.0) != -1.0 {
        return Err("unknown is -1, never 0: 0 would read as fresh".to_string());
    }
    let mut undated_options = execute_options(true, "sequential");
    OrderRouter::set_key(&mut undated_options, "maxPlanAgeMs", Value::Float(30_000.0));
    match block_on(pinned.execute(&undated, &venues(StubVenue::new("stub")), &undated_options)) {
        Err(e) if e.message.contains("carries no calculatedAt") => Ok(()),
        other => Err(format!("an undatable plan must be refused under a limit, got {other:?}")),
    }
}

fn best_effort_demands_its_acknowledgements(r: &OrderRouter) -> Result<(), String> {
    let plan = one_leg_plan(r)?;
    let venue = StubVenue::new("stub");
    let mut venues: BTreeMap<String, Box<dyn RouterVenue>> = BTreeMap::new();
    venues.insert("stub".to_string(), Box::new(venue));
    // No acknowledgeDispersion.
    match block_on(r.execute(&plan, &venues, &execute_options(true, "best_effort"))) {
        Err(e) if e.message.contains("acknowledgeDispersion") => {}
        other => return Err(format!("expected an acknowledgeDispersion refusal, got {other:?}")),
    }
    // With the acknowledgement but no maxOrders.
    let mut options = execute_options(true, "best_effort");
    OrderRouter::set_key(&mut options, "acknowledgeDispersion", Value::Bool(true));
    match block_on(r.execute(&plan, &venues, &options)) {
        Err(e) if e.message.contains("maxOrders") => Ok(()),
        other => Err(format!("expected a maxOrders refusal, got {other:?}")),
    }
}
