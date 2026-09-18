// `Value::Bool` local narrowing + `is_true` removal for build/rustTranspiler.ts
// (`narrowBoolLocals` / `dropRedundantIsTrue`).
//
//   npx tsx build/rust-bool-locals.test.ts
//
// Feeds the post-passes the exact printed shapes the Rust printer emits for
// `const x = <bool>`, `x === true`, `x !== true` and `x = <bool>` and asserts
// which locals become `let mut x: bool` and which `is_true(&x)` calls go away.
// Every positive case fails on the base tree (the local stays `Value` and the
// `is_true`/`Value::Bool` wrappers survive).
import { RustTranspilerBuilder } from './rustTranspiler.js';

const builder = new RustTranspilerBuilder();
const run = (source: string): string => builder.dropRedundantIsTrue(builder.narrowBoolLocals(source));

let failures = 0;
const check = (name: string, source: string, expected: string[], forbidden: string[] = []) => {
    const output = run(source);
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

// `const isDemoEnv = a || b;` then `if ((t === 'option') && (isDemoEnv === true))`.
// The comparison is boxed to feed `is_true`; the local is written nowhere else.
check('boxed `=== true` inside is_true', `
fn f(&self, type_var: Value) -> Value {
    let mut isDemoEnv: Value = Value::Bool(a || b);
    if (type_var.as_str() == Some("option")) && is_true(&(Value::Bool(isDemoEnv.as_bool() == Some(true)))) {
        return Value::Bool(false);
    }
    Value::Null
}
`, [
    'let mut isDemoEnv: bool = a || b;',
    'return Value::Bool(false);',
], [
    'isDemoEnv.as_bool()',
    ': Value = Value::Bool(a || b)',
]);

// `let paging = true; while (paging === true) { paging = c < l; }`
check('bare `=== true` condition + bool re-assignment', `
fn f(&self) -> Value {
    let mut paging: Value = Value::Bool(false);
    while (paging.as_bool() == Some(true)) {
        let mut r: Value = self.fetch(&[]);
        paging = Value::Bool(r.as_map().and_then(|__m| __m.get("next")).cloned().unwrap_or(Value::Null) != Value::Null);
    }
    Value::Null
}
`, [
    'let mut paging: bool = false;',
    'while (paging) {',
    'paging = r.as_map().and_then(|__m| __m.get("next")).cloned().unwrap_or(Value::Null) != Value::Null;',
], [
    'paging.as_bool()',
    'Value::Bool(r.as_map()',
]);

// `if (x)` printed as `is_true(&(x))` — phase-1 only accepted `is_true(&x)`.
check('is_true over a paren-wrapped bool local', `
fn f(&self, a: Value) -> Value {
    let mut isTp: Value = Value::Bool(false);
    if (a != Value::Null) {
        isTp = Value::Bool(true);
    }
    let mut tpSlType: Value = (if is_true(&(isTp)) { Value::Str("tp".to_string()) } else { Value::Str("sl".to_string()) });
    Value::Null
}
`, [
    'let mut isTp: bool = false;',
    'isTp = true;',
    '(if (isTp) {',
], [
    ': Value = Value::Bool(false)',
]);

// `x !== true` boxed to feed `is_true`.
check('boxed `!== true` inside is_true', `
fn f(&self, c: Value) -> Value {
    let mut isPortfolioMargin: Value = Value::Bool(false);
    if is_true(&(Value::Bool(isPortfolioMargin.as_bool() != Some(true)))) {
        isPortfolioMargin = Value::Bool(true);
    }
    Value::Null
}
`, [
    'let mut isPortfolioMargin: bool = false;',
    'if (!isPortfolioMargin) {',
], [
    'isPortfolioMargin.as_bool()',
]);

// `== Some(false)` is `!x`; `!= Some(false)` is `x`; both bare.
check('bare Some(false) comparisons', `
fn f(&self) -> Value {
    let mut a: Value = Value::Bool(true);
    if (a.as_bool() == Some(false)) {
        return Value::Null;
    }
    let mut b: Value = Value::Bool(true);
    if (b.as_bool() != Some(false)) {
        return Value::Null;
    }
    Value::Null
}
`, [
    'let mut a: bool = true;',
    'if (!a) {',
    'let mut b: bool = true;',
    'if (b) {',
], [
    '.as_bool()',
]);

// A later write of a non-bool `Value` keeps the box (D2).
check('later Value write keeps the box', `
fn f(&self, x: Value) -> Value {
    let mut paginate: Value = Value::Bool(false);
    if is_true(&paginate) {
        paginate = self.safe_bool_k(x, "paginate", &[]);
    }
    Value::Null
}
`, [
    'let mut paginate: Value = Value::Bool(false);',
    'if is_true(&paginate) {',
]);

// `x.clone()` into a `Value` slot keeps the box.
check('clone into a Value slot keeps the box', `
fn f(&self) -> Value {
    let mut hedged: Value = Value::Bool(positionSide.as_str() != Some("BOTH"));
    let mut m = indexmap::IndexMap::new();
    m.insert("hedged".to_string(), hedged.clone());
    Value::Null
}
`, [
    'let mut hedged: Value = Value::Bool(positionSide.as_str() != Some("BOTH"));',
    'm.insert("hedged".to_string(), hedged.clone());',
]);

// A `Value::Bool(…)` box that is NOT the argument of `is_true` is a `Value`
// slot: unboxing it would not compile, so the local stays.
check('box in a Value slot keeps the box', `
fn f(&self, x: Value) -> Value {
    let mut flag: Value = Value::Bool(false);
    let mut request: Value = Value::Map({ let mut m = indexmap::IndexMap::new(); m });
    add_element_to_object(&mut request, &Value::Str("k".to_string()), Value::Bool(flag.as_bool() == Some(true)));
    Value::Null
}
`, [
    'let mut flag: Value = Value::Bool(false);',
    'Value::Bool(flag.as_bool() == Some(true))',
]);

console.log(failures === 0 ? '\nall ok' : `\n${failures} failure(s)`);
process.exit(failures === 0 ? 0 : 1);
