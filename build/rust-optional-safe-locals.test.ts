// Typed-local checks for build/rustTranspiler.ts#narrowOptionalSafeLocals.
//
//   npx tsx build/rust-optional-safe-locals.test.ts
//
// Feeds hand-written generated-Rust snippets through the real post-pass and
// asserts that `let X: Value = self.safe_number[_k](…)/safe_integer[_k](…)` is
// printed as `Option<f64>`/`Option<i64>` — with the `Value::Null` test and the
// `as_f64() == Some(n.0)` comparison printed natively — only when every later
// use of X in the enclosing fn is one of those two shapes. The "helper" cases
// fail on a tree where the pass is not installed (the declaration stays
// `: Value`).
import * as rustTranspiler from './rustTranspiler.js';

// The pass lives on the builder; on a tree without it the snippets come back
// unchanged, so every "accepted" check below fails on its own assertion.
const Builder = (rustTranspiler as any).RustTranspilerBuilder;
const builder = Builder ? new Builder () : null;
const typed = (src: string): string => (builder && typeof builder.narrowOptionalSafeLocals === 'function')
    ? builder.narrowOptionalSafeLocals (src)
    : src;

let failures = 0;
const check = (name: string, source: string, expected: string[], forbidden: string[] = []) => {
    const output = typed (source);
    const ok = expected.every (e => output.includes (e)) && forbidden.every (f => !output.includes (f));
    console.log ((ok ? 'ok   ' : 'FAIL ') + name);
    if (!ok) {
        failures++;
        console.log ('  expected:   ' + JSON.stringify (expected));
        if (forbidden.length) console.log ('  forbidden:  ' + JSON.stringify (forbidden));
        console.log ('  actual:     ' + output.replace (/\s+/g, ' ').slice (0, 400));
    }
};

const wrap = (body: string): string => 'fn f(&self) {\n' + body + '\n}\n';

// ── accepted: every use is Option-native ─────────────────────────────────────

check ('null test -> Option<i64> + is_some()',
    wrap ('    let mut until: Value = self.safe_integer_k(params.clone(), "until", &[]);\n'
        + '    if (until != Value::Null) {\n'
        + '        return Value::Null;\n'
        + '    }'),
    ['let mut until: Option<i64> = self.safe_integer_k(params.clone(), "until", &[]).as_i64();', 'if (until.is_some()) {'],
    ['until: Value']);

check ('== Value::Null -> is_none()',
    wrap ('    let mut end: Value = self.safe_integer_k(params.clone(), "end_time", &[]);\n'
        + '    if (end == Value::Null) {\n'
        + '        params = self.omit(params.clone(), Value::Str("end_time".to_string()), &[]);\n'
        + '    }'),
    ['let mut end: Option<i64> =', 'if (end.is_none()) {'],
    ['end: Value']);

check ('as_f64() == Some(n.0) on an integer reader -> Some(n)',
    wrap ('    let mut code: Value = self.safe_integer_k(order.clone(), "code", &[]);\n'
        + '    if (code.as_f64() == Some(0.0)) {\n'
        + '        return Value::Null;\n'
        + '    }'),
    ['let mut code: Option<i64> = self.safe_integer_k(order.clone(), "code", &[]).as_i64();', 'if (code == Some(0)) {'],
    ['code: Value', '.as_f64() == Some(0.0)']);

check ('as_f64() != Some(n.0) on an integer reader -> Some(n)',
    wrap ('    let mut internalInteger: Value = self.safe_integer_k(transaction.clone(), "transferType", &[]);\n'
        + '    if (internalInteger != Value::Null) && (internalInteger.as_f64() != Some(0.0)) {\n'
        + '        return Value::Null;\n'
        + '    }'),
    ['internalInteger: Option<i64> =', 'if (internalInteger.is_some()) && (internalInteger != Some(0)) {'],
    ['internalInteger: Value', '.as_f64()']);

check ('a numeric reader keeps the float literal',
    wrap ('    let mut rate: Value = self.safe_number_k(params.clone(), "rate", &[]);\n'
        + '    if (rate.as_f64() != Some(0.0)) {\n'
        + '        return Value::Null;\n'
        + '    }'),
    ['let mut rate: Option<f64> = self.safe_number_k(params.clone(), "rate", &[]).as_f64();', 'if (rate != Some(0.0)) {'],
    ['rate: Value']);

check ('safe_number_k with a numeric default',
    wrap ('    let mut leverage: Value = self.safe_number_k(market.clone(), "leverage", &[Value::Float(1.0)]);\n'
        + '    if (leverage == Value::Null) {\n'
        + '        return Value::Null;\n'
        + '    }'),
    ['let mut leverage: Option<f64> =', 'if (leverage.is_none()) {'],
    ['leverage: Value']);

check ('safe_integer_k with an integer default',
    wrap ('    let mut active: Value = self.safe_integer_k(market.clone(), "status", &[Value::Int(1)]);\n'
        + '    if (active.as_f64() == Some(1.0)) {\n'
        + '        return Value::Null;\n'
        + '    }'),
    ['let mut active: Option<i64> =', 'if (active == Some(1)) {'],
    ['active: Value']);

check ('declaration without `mut` keeps its shape',
    wrap ('    let ts: Value = self.safe_integer_k(info.clone(), "ts", &[]);\n'
        + '    if (ts == Value::Null) {\n'
        + '        return Value::Null;\n'
        + '    }'),
    ['let ts: Option<i64> = self.safe_integer_k(info.clone(), "ts", &[]).as_i64();', 'if (ts.is_none()) {'],
    ['let mut ts: Option']);

check ('re-running the pass is a no-op (idempotent)',
    typed (wrap ('    let mut until: Value = self.safe_integer_k(params.clone(), "until", &[]);\n'
        + '    if (until != Value::Null) {\n'
        + '        return Value::Null;\n'
        + '    }')),
    ['let mut until: Option<i64> = self.safe_integer_k(params.clone(), "until", &[]).as_i64();', 'if (until.is_some()) {'],
    ['Option<Option']);

// ── rejected: the local stays a boxed `Value` ────────────────────────────────

check ('a .clone() into a Value slot keeps the box',
    wrap ('    let mut timestamp: Value = self.safe_integer_k(info.clone(), "updateTime", &[]);\n'
        + '    m.insert("timestamp".to_string(), timestamp.clone());\n'
        + '    m.insert("datetime".to_string(), self.iso8601(timestamp.clone()));'),
    ['let mut timestamp: Value = self.safe_integer_k(info.clone(), "updateTime", &[]);', 'timestamp.clone()'],
    ['Option<i64>']);

check ('a later write keeps the box',
    wrap ('    let mut timestamp: Value = self.safe_integer_k(position.clone(), "updateTime", &[]);\n'
        + '    if (timestamp.as_f64() == Some(0.0)) {\n'
        + '        timestamp = Value::Null;\n'
        + '    }'),
    ['let mut timestamp: Value =', 'timestamp.as_f64() == Some(0.0)', 'timestamp = Value::Null;'],
    ['Option<i64>']);

check ('a non-literal default keeps the box',
    wrap ('    let mut endTime: Value = self.safe_integer_k(params.clone(), "endTime", &[until.clone()]);\n'
        + '    if (endTime.as_f64() == Some(0.0)) {\n'
        + '        return Value::Null;\n'
        + '    }'),
    ['let mut endTime: Value = self.safe_integer_k(params.clone(), "endTime", &[until.clone()]);'],
    ['Option<i64>']);

check ('a numeric default on an integer reader keeps the box',
    wrap ('    let mut status: Value = self.safe_integer_k(market.clone(), "status", &[Value::Float(1.5)]);\n'
        + '    if (status.as_f64() == Some(1.0)) {\n'
        + '        return Value::Null;\n'
        + '    }'),
    ['let mut status: Value ='],
    ['Option<i64>']);

check ('a numeric use other than the comparison keeps the box',
    wrap ('    let mut cachedDeadline: Value = self.safe_integer_k(cachedAuth.clone(), "deadline", &[]);\n'
        + '    if cachedDeadline.as_f64().unwrap_or(f64::NAN) >= minimumDeadline.as_f64().unwrap_or(f64::NAN) {\n'
        + '        return Value::Null;\n'
        + '    }'),
    ['let mut cachedDeadline: Value =', 'cachedDeadline.as_f64().unwrap_or(f64::NAN)'],
    ['Option<i64>']);

check ('a non-integral comparison literal keeps the box',
    wrap ('    let mut ratio: Value = self.safe_integer_k(params.clone(), "ratio", &[]);\n'
        + '    if (ratio.as_f64() == Some(1.5)) {\n'
        + '        return Value::Null;\n'
        + '    }'),
    ['let mut ratio: Value ='],
    ['Option<i64>']);

check ('a shadowing binding keeps the box',
    wrap ('    let mut offset: Value = self.safe_integer_k(params.clone(), "offset", &[]);\n'
        + '    if (offset != Value::Null) {\n'
        + '        let offset: Value = Value::Int(1);\n'
        + '        return offset;\n'
        + '    }'),
    ['let mut offset: Value = self.safe_integer_k(params.clone(), "offset", &[]);'],
    ['Option<i64>']);

check ('a use in another fn is not scanned',
    wrap ('    let mut until: Value = self.safe_integer_k(params.clone(), "until", &[]);\n'
        + '    if (until != Value::Null) {\n'
        + '        return Value::Null;\n'
        + '    }')
    + 'fn g(&self) {\n    let mut until: Value = Value::Null;\n    return until;\n}\n',
    ['let mut until: Option<i64> = self.safe_integer_k(params.clone(), "until", &[]).as_i64();', 'if (until.is_some()) {']);

check ('unrelated code is untouched',
    wrap ('    let mut count: Value = Value::Int(0);\n    m.insert("count".to_string(), count.clone());'),
    ['let mut count: Value = Value::Int(0);', 'count.clone()'],
    ['Option<i64>']);

console.log (failures === 0 ? '\nall checks passed' : `\n${failures} check(s) failed`);
process.exit (failures === 0 ? 0 : 1);
