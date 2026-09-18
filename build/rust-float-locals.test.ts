// f64 accessor-chain checks for build/rustTranspiler.ts:
//   narrowFloatLocals          — `let mut X: Value = Value::Int(<e>)` -> `f64`
//   collapseNumericBoxAccessors — `Value::Int(<e>).as_f64().unwrap_or(f64::NAN)` -> `((<e>) as f64)`
//
//   npx tsx build/rust-float-locals.test.ts
//
// The ast printer wraps both operands of a checker-proven numeric compare in
// `.as_f64().unwrap_or(f64::NAN)`; these two passes are the only places that
// remove it, so every case below fails on a tree without them.
import { RustTranspilerBuilder } from './rustTranspiler.js';

const builder: any = new RustTranspilerBuilder ();

let failures = 0;
const check = (name: string, pass: string, source: string, expected: string, forbidden?: string) => {
    const out: string = builder[pass] (source);
    const ok = out.includes (expected) && (forbidden === undefined || !out.includes (forbidden));
    console.log ((ok ? 'ok   ' : 'FAIL ') + name);
    if (!ok) {
        failures++;
        console.log ('  expected: ' + expected + (forbidden ? '  (and not: ' + forbidden + ')' : ''));
        console.log ('  actual:   ' + out.trim ().replace (/\s+/g, ' ').slice (0, 400));
    }
};

// ── collapseNumericBoxAccessors ──────────────────────────────────────────────

check ('int box in a numeric compare loses the accessor',
    'collapseNumericBoxAccessors',
    'fn f(&self, types: Value) -> Value {\n' +
    '    while i.as_f64().unwrap_or(f64::NAN) < Value::Int(types.len() as i64).as_f64().unwrap_or(f64::NAN) {\n' +
    '        i = i;\n' +
    '    }\n' +
    'Value::Null\n}',
    '< ((types.len() as i64) as f64) {',
    'Value::Int(types.len() as i64).as_f64()');

check ('float box in a numeric compare loses the accessor',
    'collapseNumericBoxAccessors',
    'if price.as_f64().unwrap_or(f64::NAN) > Value::Float(0.5).as_f64().unwrap_or(f64::NAN) {',
    '> (0.5) {',
    'Value::Float(0.5).as_f64()');

check ('int literal box loses the accessor',
    'collapseNumericBoxAccessors',
    'if length.as_f64().unwrap_or(f64::NAN) > Value::Int(1).as_f64().unwrap_or(f64::NAN) {',
    '> ((1) as f64) {',
    '.as_f64().unwrap_or(f64::NAN) > Value::Int(1)');

// A box that does not span the whole receiver is not the chain's operand.
check ('box plus operand keeps the accessor',
    'collapseNumericBoxAccessors',
    'if Value::Int(a) + b.as_f64().unwrap_or(f64::NAN) > 1.0 {',
    'Value::Int(a) + b.as_f64().unwrap_or(f64::NAN)');

// Qualified constructors are a different path (ccxt::Value) — keep the helper.
check ('qualified Value::Int keeps the accessor',
    'collapseNumericBoxAccessors',
    'if crate::Value::Int(1).as_f64().unwrap_or(f64::NAN) > 0.0 {',
    'crate::Value::Int(1).as_f64().unwrap_or(f64::NAN)');

// The cast must be parenthesised as a whole: `as f64 <` would parse as the
// start of a generic argument list (rustc: "`<` is interpreted as a start of
// generic arguments for `f64`").
check ('the cast is parenthesised before a comparison',
    'collapseNumericBoxAccessors',
    'if a.as_f64().unwrap_or(f64::NAN) < Value::Int(x.len() as i64).as_f64().unwrap_or(f64::NAN) {',
    '< ((x.len() as i64) as f64) {',
    ') as f64 <');

check ('box without the chain is untouched',
    'collapseNumericBoxAccessors',
    'let x: Value = Value::Int(3);',
    'Value::Int(3)');

// ── narrowFloatLocals ───────────────────────────────────────────────────────

check ('int local read only by numeric compares becomes f64',
    'narrowFloatLocals',
    'fn check_proxy(&self, used: Value) -> Value {\n' +
    '    let mut length: Value = Value::Int(used.len() as i64);\n' +
    '    if length.as_f64().unwrap_or(f64::NAN) > Value::Int(1).as_f64().unwrap_or(f64::NAN) {\n' +
    '        panic!("bad");\n' +
    '    }\n' +
    '    return Value::Null;\n' +
    '}',
    'let mut length: f64 = ((used.len() as i64) as f64);',
    'length.as_f64()');

check ('f64 local use sites are rewritten to the bare name',
    'narrowFloatLocals',
    'fn f(&self, used: Value) -> Value {\n' +
    '    let mut length: Value = Value::Int(used.len() as i64);\n' +
    '    if length.as_f64().unwrap_or(f64::NAN) > Value::Int(1).as_f64().unwrap_or(f64::NAN) {\n' +
    '        panic!("bad");\n' +
    '    }\n' +
    '    while j.as_f64().unwrap_or(f64::NAN) < length.as_f64().unwrap_or(f64::NAN) {\n' +
    '        j = j;\n' +
    '    }\n' +
    '    return Value::Null;\n' +
    '}',
    'j.as_f64().unwrap_or(f64::NAN) < length {',
    'length.as_f64()');

check ('float local and `== Some(lit)` use become f64',
    'narrowFloatLocals',
    'fn f(&self, symbols: Value) -> Value {\n' +
    '    let mut rate: Value = Value::Float(0.5);\n' +
    '    if (rate.as_f64() == Some(0.5)) || (rate.as_f64().unwrap_or(f64::NAN) < Value::Int(1).as_f64().unwrap_or(f64::NAN)) {\n' +
    '        return Value::Bool(true);\n' +
    '    }\n' +
    '    return Value::Null;\n' +
    '}',
    'let mut rate: f64 = (0.5);',
    'rate.as_f64()');

check ('equality use keeps the literal',
    'narrowFloatLocals',
    'fn f(&self, symbols: Value) -> Value {\n' +
    '    let mut symbolsLength: Value = Value::Int(symbols.len() as i64);\n' +
    '    if (symbolsLength.as_f64() == Some(1.0)) {\n' +
    '        return Value::Bool(true);\n' +
    '    }\n' +
    '    return Value::Null;\n' +
    '}',
    'if (symbolsLength == 1.0) {',
    'symbolsLength.as_f64()');

// D2: any use that is not a numeric read keeps the Value local.
check ('a use as an argument keeps the Value local',
    'narrowFloatLocals',
    'fn f(&self, arr: Value) -> Value {\n' +
    '    let mut i: Value = Value::Int(0);\n' +
    '    while i.as_f64().unwrap_or(f64::NAN) < Value::Int(arr.len() as i64).as_f64().unwrap_or(f64::NAN) {\n' +
    '        let x: Value = get_value(&arr, &i);\n' +
    '        i = i;\n' +
    '    }\n' +
    '    return Value::Null;\n' +
    '}',
    'let mut i: Value = Value::Int(0);',
    'let mut i: f64');

check ('a reassignment keeps the Value local',
    'narrowFloatLocals',
    'fn f(&self, used: Value) -> Value {\n' +
    '    let mut length: Value = Value::Int(used.len() as i64);\n' +
    '    length = Value::Int(2);\n' +
    '    if length.as_f64().unwrap_or(f64::NAN) > Value::Int(1).as_f64().unwrap_or(f64::NAN) {\n' +
    '        panic!("bad");\n' +
    '    }\n' +
    '    return Value::Null;\n' +
    '}',
    'let mut length: Value = Value::Int(used.len() as i64);',
    'let mut length: f64');

check ('a shadowing redeclaration keeps the outer Value local',
    'narrowFloatLocals',
    'fn f(&self, used: Value) -> Value {\n' +
    '    let mut length: Value = Value::Int(used.len() as i64);\n' +
    '    {\n' +
    '        let mut length: Value = Value::Int(1);\n' +
    '        if length.as_f64().unwrap_or(f64::NAN) > Value::Int(0).as_f64().unwrap_or(f64::NAN) {\n' +
    '            panic!("bad");\n' +
    '        }\n' +
    '    }\n' +
    '    if length.as_f64().unwrap_or(f64::NAN) > Value::Int(1).as_f64().unwrap_or(f64::NAN) {\n' +
    '        panic!("bad");\n' +
    '    }\n' +
    '    return Value::Null;\n' +
    '}',
    'length.as_f64().unwrap_or(f64::NAN) > Value::Int(1).as_f64().unwrap_or(f64::NAN)',
    'let mut length: f64 = ((used.len() as i64) as f64)');

check ('a closure parameter of the same name keeps the Value local',
    'narrowFloatLocals',
    'fn f(&self, used: Value) -> Value {\n' +
    '    let mut length: Value = Value::Int(used.len() as i64);\n' +
    '    if length.as_f64().unwrap_or(f64::NAN) > Value::Int(1).as_f64().unwrap_or(f64::NAN) {\n' +
    '        used.iter().for_each(|length: Value| { let _ = length.as_f64().unwrap_or(f64::NAN); });\n' +
    '    }\n' +
    '    return Value::Null;\n' +
    '}',
    'let mut length: Value = Value::Int(used.len() as i64);',
    'let mut length: f64');

check ('a non-box initializer keeps the Value local',
    'narrowFloatLocals',
    'fn f(&self, symbols: Value) -> Value {\n' +
    '    let mut symbolsLength: Value = get_array_length(&symbols);\n' +
    '    if symbolsLength.as_f64().unwrap_or(f64::NAN) > Value::Int(1).as_f64().unwrap_or(f64::NAN) {\n' +
    '        panic!("bad");\n' +
    '    }\n' +
    '    return Value::Null;\n' +
    '}',
    'let mut symbolsLength: Value = get_array_length(&symbols);',
    'let mut symbolsLength: f64');

check ('an unused local keeps the Value local',
    'narrowFloatLocals',
    'fn f(&self, used: Value) -> Value {\n' +
    '    let mut length: Value = Value::Int(used.len() as i64);\n' +
    '    return Value::Null;\n' +
    '}',
    'let mut length: Value = Value::Int(used.len() as i64);',
    'let mut length: f64');

// String literals must not count as uses of the local.
check ('string literals are not uses',
    'narrowFloatLocals',
    'fn f(&self, used: Value) -> Value {\n' +
    '    let mut length: Value = Value::Int(used.len() as i64);\n' +
    '    let msg: Value = Value::Str("length".to_string());\n' +
    '    if length.as_f64().unwrap_or(f64::NAN) > Value::Int(1).as_f64().unwrap_or(f64::NAN) {\n' +
    '        panic!("length");\n' +
    '    }\n' +
    '    return msg;\n' +
    '}',
    'let mut length: f64 = ((used.len() as i64) as f64);');

// `y.length` is a field of another value, not a use of the local.
check ('field access is not a use',
    'narrowFloatLocals',
    'fn f(&self, used: Value) -> Value {\n' +
    '    let mut length: Value = Value::Int(used.len() as i64);\n' +
    '    if length.as_f64().unwrap_or(f64::NAN) > Value::Int(1).as_f64().unwrap_or(f64::NAN) {\n' +
    '        panic!("bad");\n' +
    '    }\n' +
    '    return self.length;\n' +
    '}',
    'let mut length: f64 = ((used.len() as i64) as f64);');

// The scan runs to the end of the fn body, so a nested-block use still blocks it.
check ('a nested-block use blocks the narrowing',
    'narrowFloatLocals',
    'fn f(&self, used: Value) -> Value {\n' +
    '    let mut length: Value = Value::Int(used.len() as i64);\n' +
    '    if length.as_f64().unwrap_or(f64::NAN) > Value::Int(1).as_f64().unwrap_or(f64::NAN) {\n' +
    '        {\n' +
    '            let x: Value = length.clone();\n' +
    '        }\n' +
    '    }\n' +
    '    return Value::Null;\n' +
    '}',
    'let mut length: Value = Value::Int(used.len() as i64);',
    'let mut length: f64');

// A later fn re-using the name is a different scope.
check ('the same name in a later fn is not a use',
    'narrowFloatLocals',
    'fn f(&self, used: Value) -> Value {\n' +
    '    let mut length: Value = Value::Int(used.len() as i64);\n' +
    '    if length.as_f64().unwrap_or(f64::NAN) > Value::Int(1).as_f64().unwrap_or(f64::NAN) {\n' +
    '        panic!("bad");\n' +
    '    }\n' +
    '    return Value::Null;\n' +
    '}\n' +
    'fn g(&self, other: Value) -> Value {\n' +
    '    let mut length: Value = other.clone();\n' +
    '    return length;\n' +
    '}',
    'let mut length: f64 = ((used.len() as i64) as f64);');

// ── idempotence ─────────────────────────────────────────────────────────────

for (const pass of ['narrowFloatLocals', 'collapseNumericBoxAccessors']) {
    const src = 'fn f(&self, used: Value) -> Value {\n' +
        '    let mut length: Value = Value::Int(used.len() as i64);\n' +
        '    if length.as_f64().unwrap_or(f64::NAN) > Value::Int(1).as_f64().unwrap_or(f64::NAN) {\n' +
        '        panic!("bad");\n' +
        '    }\n' +
        '    return Value::Null;\n' +
        '}';
    const once = builder[pass] (src);
    const twice = builder[pass] (once);
    const ok = once === twice;
    console.log ((ok ? 'ok   ' : 'FAIL ') + pass + ' is idempotent');
    if (!ok) {
        failures++;
        console.log ('  first:  ' + once.trim ().replace (/\s+/g, ' ').slice (0, 300));
        console.log ('  second: ' + twice.trim ().replace (/\s+/g, ' ').slice (0, 300));
    }
}

console.log (failures === 0 ? 'all checks passed' : failures + ' check(s) failed');
process.exit (failures === 0 ? 0 : 1);
