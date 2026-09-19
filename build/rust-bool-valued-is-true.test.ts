// `is_true(&x)` over a bool-valued `Value` local -> `x.as_bool() == Some(true)`
// for build/rustTranspiler.ts (`dropBoolValuedIsTrue`).
//
//   npx tsx build/rust-bool-valued-is-true.test.ts
//
// Feeds the post-pass the exact printed shapes the Rust printer emits for a
// local whose every assignment is a `Value::Bool(..)` box or a `safe_bool*`
// result, and asserts which `is_true` calls go native and which stay.
// Every positive case fails on the base tree (the helper survives there).
import { RustTranspilerBuilder } from './rustTranspiler.js';

const builder = new RustTranspilerBuilder();
// Pipeline order: narrowBoolLocals -> dropRedundantIsTrue -> dropBoolValuedIsTrue.
// A `Value` local only survives `narrowBoolLocals` when it has a use the
// bool-local allow-list rejects (here: a `.clone()` into a `Value` slot),
// which is exactly the shape the census counts.
const run = (source: string): string =>
    builder.dropBoolValuedIsTrue(builder.dropRedundantIsTrue(builder.narrowBoolLocals(source)));
const runDirect = (source: string): string => builder.dropBoolValuedIsTrue(source);

let failures = 0;
const check = (name: string, source: string, expected: string[], forbidden: string[] = [], direct = false) => {
    const output = (direct ? runDirect : run)(source);
    const missing = expected.filter(e => !output.includes(e));
    const present = forbidden.filter(f => output.includes(f));
    if (missing.length === 0 && present.length === 0) {
        console.log(`ok   ${name}`);
        return;
    }
    failures += 1;
    console.log(`FAIL ${name}`);
    for (const m of missing) console.log(`     missing:   ${JSON.stringify(m)}`);
    for (const p of present) console.log(`     forbidden: ${JSON.stringify(p)}`);
    console.log(output.split('\n').map(l => `     | ${l}`).join('\n'));
};

// `let postOnly = false;` with a use the bool-local narrowing rejects, then
// `if (postOnly)`.
check('Value::Bool local, non-negated read', `
fn f(&self) -> Value {
    let mut postOnly: Value = Value::Bool(false);
    self.keep_value(postOnly.clone());
    if is_true(&postOnly) {
        return Value::Str("GTX".to_string());
    }
    Value::Null
}
`, [
    'let mut postOnly: Value = Value::Bool(false);',
    'if postOnly.as_bool() == Some(true) {',
], [
    'is_true(&postOnly)',
]);

// `if (!postOnly)` — `!` binds tighter than `==`, so the comparison keeps the
// source's parens (the `!` itself stays where it was).
check('Value::Bool local, negated read', `
fn f(&self) -> Value {
    let mut postOnly: Value = Value::Bool(false);
    self.keep_value(postOnly.clone());
    if !is_true(&postOnly) {
        return Value::Str("GTC".to_string());
    }
    Value::Null
}
`, [
    'if !(postOnly.as_bool() == Some(true)) {',
], [
    'is_true(&postOnly)',
]);

// `let mut uta = false; uta = cond;` — every write keeps the bool variant.
check('bool re-assignment keeps the local admitted', `
fn f(&self, instType: Value) -> Value {
    let mut uta: Value = Value::Bool(false);
    uta = Value::Bool(instType != Value::Null);
    self.keep_value(uta.clone());
    if is_true(&uta) {
        return to_lower(&instType);
    }
    Value::Null
}
`, [
    'if uta.as_bool() == Some(true) {',
], [
    'is_true(&uta)',
]);

// A write of another variant at any point keeps the helper (D2).
check('non-bool re-assignment keeps the helper', `
fn f(&self, entry: Value) -> Value {
    let mut uta: Value = Value::Bool(false);
    uta = self.safe_value_k(entry.clone(), "uta", &[]);
    if is_true(&uta) {
        return Value::Bool(true);
    }
    Value::Null
}
`, [
    'is_true(&uta)',
], [
    'uta.as_bool()',
]);

// `safeBool` returns the member only when it is a bool, else the default —
// an empty/`false` default is exact, a string default is not.
check('safe_bool_k with bool default', `
fn f(&self, order: Value) -> Value {
    let mut postOnly: Value = self.safe_bool_k(order.clone(), "postOnly", &[]);
    if is_true(&postOnly) {
        return Value::Bool(true);
    }
    Value::Null
}
`, [
    'if postOnly.as_bool() == Some(true) {',
], [
    'is_true(&postOnly)',
]);

check('safe_bool2 with bool default', `
fn f(&self, params: Value) -> Value {
    let mut isPortfolioMargin: Value = self.safe_bool2(params.clone(), Value::Str("papi".to_string()), Value::Str("portfolioMargin".to_string()), &[Value::Bool(false)]);
    if is_true(&isPortfolioMargin) {
        return Value::Bool(true);
    }
    Value::Null
}
`, [
    'if isPortfolioMargin.as_bool() == Some(true) {',
], [
    'is_true(&isPortfolioMargin)',
]);

check('safe_bool_k with non-bool default keeps the helper', `
fn f(&self, order: Value) -> Value {
    let mut postOnly: Value = self.safe_bool_k(order.clone(), "postOnly", &[Value::Str("gtc".to_string())]);
    if is_true(&postOnly) {
        return Value::Bool(true);
    }
    Value::Null
}
`, [
    'is_true(&postOnly)',
], [
    'postOnly.as_bool()',
]);

check('safe_bool_k with an unproven default keeps the helper', `
fn f(&self, order: Value, fallback: Value) -> Value {
    let mut postOnly: Value = self.safe_bool_k(order.clone(), "postOnly", &[fallback.clone()]);
    if is_true(&postOnly) {
        return Value::Bool(true);
    }
    Value::Null
}
`, [
    'is_true(&postOnly)',
], [
    'postOnly.as_bool()',
]);

// `let mut linear = null; linear = (settle == quote);`
check('Null initializer + bool assignment', `
fn f(&self, settle: Value, quote: Value) -> Value {
    let mut linear: Value = Value::Null;
    if is_true(&contract) {
        linear = Value::Bool(settle.as_str() == quote.as_str());
    }
    self.keep_value(linear.clone());
    if is_true(&linear) {
        return Value::Str("linear".to_string());
    }
    Value::Null
}
`, [
    'if linear.as_bool() == Some(true) {',
], [
    'is_true(&linear)',
]);

// `Value::Bool(is_true(&a) && is_true(&b))` inside a dict literal: the
// comparison sits in a delimited slot, so it needs no extra parens.
check('boxed argument position', `
fn f(&self) -> Value {
    let mut depositAllowed: Value = Value::Bool(self.safe_bool_k(chain.clone(), "isDepositEnabled", &[]).as_bool() == Some(true));
    let mut withdrawAllowed: Value = Value::Bool(self.safe_bool_k(chain.clone(), "isWithdrawalEnabled", &[]).as_bool() == Some(true));
    self.keep_value(depositAllowed.clone());
    self.keep_value(withdrawAllowed.clone());
    let mut m = indexmap::IndexMap::new();
    m.insert("active".to_string(), Value::Bool(is_true(&depositAllowed) && is_true(&withdrawAllowed)));
    Value::Map(m)
}
`, [
    'Value::Bool(depositAllowed.as_bool() == Some(true) && withdrawAllowed.as_bool() == Some(true))',
], [
    'is_true(&depositAllowed)',
    'is_true(&withdrawAllowed)',
]);

// Parenthesised operand and condition-position parens.
check('parenthesised operand', `
fn f(&self) -> Value {
    let mut isTestnet: Value = Value::Bool(false);
    self.keep_value(isTestnet.clone());
    let mut source: Value = (if is_true(&(isTestnet)) { Value::Str("b".to_string()) } else { Value::Str("a".to_string()) });
    Value::Null
}
`, [
    '(if isTestnet.as_bool() == Some(true) {',
], [
    'is_true(&(isTestnet))',
]);

// Shapes that must keep the helper.
check('param / get_arg locals keep the helper', `
fn f(&self, paginate: Value) -> Value {
    let mut filterClosed = get_arg(optional_args, 0, Value::Bool(false));
    if is_true(&paginate) && is_true(&filterClosed) {
        return Value::Bool(true);
    }
    Value::Null
}
`, [
    'is_true(&paginate)',
    'is_true(&filterClosed)',
], [
    'paginate.as_bool()',
    'filterClosed.as_bool()',
]);

check('second declaration of the name keeps the helper', `
fn f(&self) -> Value {
    let mut spot: Value = Value::Bool(false);
    if is_true(&spot) {
        let mut spot: Value = self.fetch(&[]);
        return spot;
    }
    Value::Null
}
`, [
    'is_true(&spot)',
], [
    'spot.as_bool()',
]);

// A comparison cannot feed a postfix use, so the helper stays (`narrowBoolLocals`
// handles the plain-bool variant of this shape itself).
check('postfix use keeps the helper', `
fn f(&self) -> Value {
    let mut ok: Value = Value::Bool(true);
    return Value::Str(is_true(&ok).to_string());
}
`, [
    'is_true(&ok)',
], [
    'ok.as_bool()',
], true);

check('bool local is handled by dropRedundantIsTrue, not here', `
fn f(&self) -> Value {
    let mut __for_first_7: bool = true;
    if is_true(&__for_first_7) {
        return Value::Bool(true);
    }
    Value::Null
}
`, [
    'let mut __for_first_7: bool = true;',
], [
    '__for_first_7.as_bool()',
]);

// A `Value::Bool(is_true(&x))` inside a box: the replaced span must not eat the
// box's own closing paren.
check('is_true as the whole boxed argument', `
fn f(&self) -> Value {
    let mut inverse: Value = Value::Bool(false);
    self.keep_value(inverse.clone());
    let mut linear: Value = Value::Null;
    linear = Value::Bool(!is_true(&inverse));
    if is_true(&linear) {
        return Value::Bool(true);
    }
    Value::Null
}
`, [
    'linear = Value::Bool(!(inverse.as_bool() == Some(true)));',
    'if linear.as_bool() == Some(true) {',
], [
    'is_true(&inverse)',
    'is_true(&linear)',
]);

// The two passes compose: the `: bool` local is unwrapped bare, the
// `Value` local through the comparison.
check('composed with dropRedundantIsTrue', `
fn f(&self) -> Value {
    let mut spot: Value = Value::Bool(false);
    self.keep_value(spot.clone());
    let mut isSpot: bool = is_true(&spot);
    if is_true(&isSpot) {
        return Value::Bool(true);
    }
    Value::Null
}
`, [
    'let mut isSpot: bool = spot.as_bool() == Some(true);',
    'if isSpot {',
], [
    'is_true(&spot)',
    'is_true(&isSpot)',
]);

if (failures > 0) {
    console.log(`\n${failures} failure(s)`);
    process.exit(1);
}
console.log('\nall checks passed');