// D-32 — `is_true(&…)` residual: native-bool callees, `Option<bool>` shadows
// and native compares (`build/rustTranspiler.ts`: `dropNativeCallIsTrue`,
// `dropOptionShadowIsTrue`, `isRustBoolExpr`).
//
//   npx tsx build/rust-native-bool-call-is-true.test.ts
//
// Feeds the post-passes the exact printed shapes the Rust printer emits for a
// call whose declaration returns `bool` / `Option<bool>` and for the `Option`
// payload-typed shadow locals the batch-D param/return units introduce.
import { RustTranspilerBuilder } from './rustTranspiler.js';

const builder = new RustTranspilerBuilder();
const run = (source: string): string =>
    builder.dropOptionShadowIsTrue(builder.dropNativeCallIsTrue(builder.dropRedundantIsTrue(source)));

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

// ── call with an emitted `-> bool` signature ────────────────────────────────

check('bool-returning callee in an if condition', `
impl Core {
    fn is_uta_enabled(&self) -> bool { true }
    fn f(&self) -> Value {
        if is_true(&self.is_uta_enabled()) {
            return Value::Bool(true);
        }
        Value::Null
    }
}
`, [
    'if self.is_uta_enabled() {',
], [
    'is_true(&self.is_uta_enabled())',
]);

check('bool-returning callee as a logical operand and under `!`', `
impl Core {
    fn is_uta_enabled(&self) -> bool { true }
    fn f(&self) -> Value {
        if (x == Value::Null) && is_true(&self.is_uta_enabled()) {
            return Value::Bool(true);
        }
        if !is_true(&self.is_uta_enabled()) {
            return Value::Null;
        }
        Value::Bool(true)
    }
}
`, [
    '(x == Value::Null) && self.is_uta_enabled()',
    'if !self.is_uta_enabled() {',
], [
    'is_true(&self.is_uta_enabled())',
]);

check('bool-returning callee in a `Value::Bool(..)` box', `
impl Core {
    fn is_uta_enabled(&self) -> bool { true }
    fn f(&self) -> Value {
        let mut m = indexmap::IndexMap::new();
        m.insert("uta".to_string(), Value::Bool(is_true(&self.is_uta_enabled())));
        Value::Map(m)
    }
}
`, [
    'Value::Bool(self.is_uta_enabled())',
], [
    'is_true(&self.is_uta_enabled())',
]);

check('bool-returning callee in a Value slot keeps the marker', `
impl Core {
    fn is_uta_enabled(&self) -> bool { true }
    fn f(&self) -> Value {
        let mut x: Value = is_true(&self.is_uta_enabled());
        self.keep(x.clone());
        Value::Null
    }
}
`, [
    'is_true(&self.is_uta_enabled())',
], [
    'let mut x: Value = self.is_uta_enabled();',
]);

check('async `-> bool` is a future, not a bool', `
impl Core {
    async fn is_uta_enabled(&self) -> bool { true }
    fn f(&self) -> Value {
        if is_true(&self.is_uta_enabled()) {
            return Value::Bool(true);
        }
        Value::Null
    }
}
`, [
    'is_true(&self.is_uta_enabled())',
], [
    'if self.is_uta_enabled() {',
]);

// The base tier's hand-written `-> bool` fns are in the index; a same-named
// inherent method in the file wins (it shadows the trait method).
check('own non-bool definition shadows the base `-> bool` name', `
impl Core {
    fn is_verbose(&self) -> Value { Value::Str("x".to_string()) }
    fn f(&self) -> Value {
        if is_true(&self.is_verbose()) {
            return Value::Bool(true);
        }
        Value::Null
    }
}
`, [
    'is_true(&self.is_verbose())',
], [
    'if self.is_verbose() {',
    'as_bool() == Some(true)',
]);

check('bare free-fn call with an emitted `-> bool`', `
fn is_uta_enabled(v: &Value) -> bool { true }
fn f(v: Value) -> Value {
    if is_true(&is_uta_enabled(&v)) {
        return Value::Bool(true);
    }
    Value::Null
}
`, [
    'if is_uta_enabled(&v) {',
], [
    'is_true(&is_uta_enabled(&v))',
]);

// ── call with an emitted `-> Option<bool>` signature ────────────────────────

check('Option<bool>-returning callee -> `== Some(true)`', `
impl Core {
    fn is_uta_enabled(&self) -> Option<bool> { Some(true) }
    fn f(&self) -> Value {
        if is_true(&self.is_uta_enabled()) {
            return Value::Bool(true);
        }
        Value::Null
    }
}
`, [
    'if self.is_uta_enabled() == Some(true) {',
], [
    'is_true(&self.is_uta_enabled())',
]);

check('negated Option<bool> callee keeps the operand parenthesised', `
impl Core {
    fn is_uta_enabled(&self) -> Option<bool> { Some(true) }
    fn f(&self) -> Value {
        if !is_true(&self.is_uta_enabled()) {
            return Value::Bool(true);
        }
        Value::Null
    }
}
`, [
    'if !(self.is_uta_enabled() == Some(true)) {',
], [
    'is_true(&self.is_uta_enabled())',
]);

check('Option<bool> callee in a Value slot keeps the marker', `
impl Core {
    fn is_uta_enabled(&self) -> Option<bool> { Some(true) }
    fn f(&self) -> Value {
        self.keep(is_true(&self.is_uta_enabled()));
        Value::Null
    }
}
`, [
    'is_true(&self.is_uta_enabled())',
], [
    'is_uta_enabled() == Some(true)',
]);

// ── `Option` payload-typed shadow locals ────────────────────────────────────

check('Option<bool> shadow -> `== Some(true)`', `
impl Core {
    fn f(&self, p: Value) -> Value {
        let mut uta: Option<bool> = p.as_bool();
        if is_true(&uta) {
            return Value::Bool(true);
        }
        Value::Null
    }
}
`, [
    'if uta == Some(true) {',
], [
    'is_true(&uta)',
]);

check('negated Option<bool> shadow', `
impl Core {
    fn f(&self, p: Value) -> Value {
        let mut uta: Option<bool> = p.as_bool();
        if !is_true(&uta) {
            return Value::Bool(true);
        }
        Value::Null
    }
}
`, [
    'if !(uta == Some(true)) {',
], [
    'is_true(&uta)',
]);

check('Option<f64> shadow -> `is_some_and` (numeric payload)', `
impl Core {
    fn f(&self, p: Value) -> Value {
        let mut amount: Option<f64> = p.as_f64();
        if is_true(&amount) {
            return Value::Bool(true);
        }
        Value::Null
    }
}
`, [
    'if amount.is_some_and(|v| v != 0.0) {',
], [
    'is_true(&amount)',
]);

check('Option shadow in a Value slot keeps the marker', `
impl Core {
    fn f(&self, p: Value) -> Value {
        let mut uta: Option<bool> = p.as_bool();
        self.keep(is_true(&uta));
        Value::Null
    }
}
`, [
    'is_true(&uta)',
], [
    'uta == Some(true)',
]);

check('shadow site before the declaration keeps the helper', `
impl Core {
    fn f(&self, p: Value) -> Value {
        if is_true(&uta) {
            return Value::Bool(true);
        }
        let mut uta: Option<bool> = p.as_bool();
        Value::Null
    }
}
`, [
    'is_true(&uta)',
], [
    'uta == Some(true)',
]);

check('re-declared Option shadow keeps the helper', `
impl Core {
    fn f(&self, p: Value) -> Value {
        let mut uta: Option<bool> = p.as_bool();
        if is_true(&uta) {
            return Value::Bool(true);
        }
        let mut uta: Option<bool> = p.as_bool();
        Value::Null
    }
}
`, [
    'is_true(&uta)',
], [
    'uta == Some(true)',
]);

// ── native compares / matches! in the is_true wrapper (isRustBoolExpr) ──────

check('native ordered compare drops the wrapper', `
impl Core {
    fn f(&self, marketId: Value, parts: Vec<Value>) -> Value {
        let mut partsLength: f64 = ((parts.len() as i64) as f64);
        let mut isOption: Value = Value::Bool(is_true(&(partsLength > ((3i64) as f64))));
        self.keep(isOption.clone());
        Value::Null
    }
}
`, [
    'Value::Bool((partsLength > ((3i64) as f64)))',
], [
    'is_true(&(partsLength > ((3i64) as f64)))',
]);

check('native as_f64 compare chain drops the wrapper', `
impl Core {
    fn f(&self, secondPart: Value) -> Value {
        let mut requiresURLEncoding = is_true(&(Value::Int(secondPart.as_str().and_then(|__s| __s.find("dual")).map(|__i| __i as i64).unwrap_or(-1)).as_f64().unwrap_or(f64::NAN) >= ((0i64) as f64))) || is_true(&(secondPart != Value::Null));
        Value::Null
    }
}
`, [
    'requiresURLEncoding = (Value::Int(secondPart.as_str().and_then(|__s| __s.find("dual")).map(|__i| __i as i64).unwrap_or(-1)).as_f64().unwrap_or(f64::NAN) >= ((0i64) as f64)) || (secondPart != Value::Null);',
], [
    'is_true(&(Value::Int(secondPart',
    'is_true(&(secondPart != Value::Null))',
]);

check('native matches! drops the wrapper', `
impl Core {
    fn f(&self, order: Value) -> Value {
        if is_true(&(matches!(&order, Value::Dict(__d) if __d.contains_key("k")))) {
            return Value::Bool(true);
        }
        Value::Null
    }
}
`, [
    'if (matches!(&order, Value::Dict(__d) if __d.contains_key("k"))) {',
], [
    'is_true(&(matches!',
]);

check('generic type in the text is not a compare', `
impl Core {
    fn f(&self) -> Value {
        if is_true(&(self.keep_some::<Vec<Value>>())) {
            return Value::Bool(true);
        }
        Value::Null
    }
}
`, [
    'is_true(&(self.keep_some::<Vec<Value>>()))',
]);

// ── callees whose every body returns only `Value::Bool` / `Value::Null` ─────

check('Bool-only callee (own body) -> `as_bool() == Some(true)`', `
impl Core {
    fn is_uta(&self, v: Value) -> Value {
        let hit = match &v { Value::Null => true, _ => false };
        Value::Bool(hit)
    }
    fn f(&self, v: Value) -> Value {
        if is_true(&self.is_uta(v.clone())) {
            return Value::Bool(true);
        }
        Value::Null
    }
}
`, [
    'if self.is_uta(v.clone()).as_bool() == Some(true) {',
], [
    'is_true(&self.is_uta(v.clone()))',
]);

check('Bool-only callee with `return` arms', `
impl Core {
    fn is_uta(&self, v: Value) -> Value {
        if v.is_null() { return Value::Null; }
        if v.as_str() == Some("y") { return Value::Bool(true); }
        return Value::Bool(false);
    }
    fn f(&self, v: Value) -> Value {
        if is_true(&self.is_uta(v.clone())) {
            return Value::Bool(true);
        }
        Value::Null
    }
}
`, [
    'if self.is_uta(v.clone()).as_bool() == Some(true) {',
], [
    'is_true(&self.is_uta(v.clone()))',
]);

check('non-Bool callee body keeps the helper', `
impl Core {
    fn is_uta(&self, v: Value) -> Value {
        if v.is_null() { return Value::Str("x".to_string()); }
        Value::Bool(true)
    }
    fn f(&self, v: Value) -> Value {
        if is_true(&self.is_uta(v.clone())) {
            return Value::Bool(true);
        }
        Value::Null
    }
}
`, [
    'is_true(&self.is_uta(v.clone()))',
], [
    'as_bool() == Some(true)',
]);

check('value-returning tail keeps the helper', `
impl Core {
    fn is_uta(&self, v: Value) -> Value {
        self.keep(v.clone())
    }
    fn f(&self, v: Value) -> Value {
        if is_true(&self.is_uta(v.clone())) {
            return Value::Bool(true);
        }
        Value::Null
    }
}
`, [
    'is_true(&self.is_uta(v.clone()))',
], [
    'as_bool() == Some(true)',
]);

// The base tier's hand-written `is_empty` body returns `Value::Bool(..)` only.
check('Bool-only callee resolved from the generated base files', `
impl Core {
    fn f(&self, v: Value) -> Value {
        if is_true(&self.is_empty(v.clone())) {
            return Value::Bool(true);
        }
        Value::Null
    }
}
`, [
    'if self.is_empty(v.clone()).as_bool() == Some(true) {',
], [
    'is_true(&self.is_empty(v.clone()))',
]);

console.log(failures === 0 ? '\nALL PASS' : `\n${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);