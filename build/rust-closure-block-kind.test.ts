// D-29 checks for build/rustTranspiler.ts#rustBlocksOf closure classification.
//
//   npx tsx build/rust-closure-block-kind.test.ts
//
// A block is a closure body only when its header ENDS with the parameter list
// (`|…|`, optionally `|…| -> Type`). `||` conditions and the printer's own read
// shadows (`|__m| …` / `|__arr| …` written inside an if/let header) are not
// closure bodies: the enclosing block captures nothing, so a mention inside it
// must not block the B-32 dead-last-use move. Real closures — including ones
// with a `-> Type` return annotation — and loops still block the move.
import { RustTranspilerBuilder } from './rustTranspiler.js';

const builder = new RustTranspilerBuilder ();

const wrap = (body: string): string => `impl Exchange {
    pub fn f(&self, mut response: Value, mut params: Value) -> Value {
${body}
    }
}
`;

let failures = 0;
const check = (name: string, body: string, expected: string, forbidden?: string) => {
    const out = (builder as any).dropDeadValueSlotClones (wrap (body));
    const ok = out.includes (expected) && (forbidden === undefined || !out.includes (forbidden));
    console.log ((ok ? 'ok   ' : 'FAIL ') + name);
    if (!ok) {
        failures++;
        console.log ('  expected: ' + expected + (forbidden ? '  (and not: ' + forbidden + ')' : ''));
        console.log ('  actual:   ' + out.replace (/\s+/g, ' ').slice (0, 500));
    }
};

// ---- `||` condition blocks are not closures ---------------------------------

// a local written inside an `if (a || b)` block is not a closure capture: the
// clone at its last use drops
check ('|| condition block does not block the drop',
    '        let mut item: Value = Value::Null;\n' +
    '        if (is_true(&a) || is_true(&b)) {\n' +
    '            item = get_value(&response, &Value::Str("item".to_string()));\n' +
    '        }\n' +
    '        return Value::from(vec![item.clone()]);',
    'Value::from(vec![item])',
    'item.clone()');

// ---- printer read shadows inside an if condition ----------------------------

// the `|__m|` read shadow in the condition makes the block look like a closure
// to a plain `header.includes('|')` test; it is an if body and captures nothing
check ('read shadow in the if condition does not block the drop',
    '        if (market.as_map().and_then(|__m| __m.get("swap")).cloned().unwrap_or(Value::Null).as_bool() == Some(true)) {\n' +
    '            params = self.omit(params.clone(), Value::Str("a".to_string()).into());\n' +
    '        }\n' +
    '        return self.fetch(Value::Str("x".to_string()).into(), params.clone());',
    'into(), params)',
    'into(), params.clone())');

// the same shape but the local is live after the slot: the clone stays
check ('read shadow in the condition keeps a live-after clone',
    '        if (market.as_map().and_then(|__m| __m.get("swap")).cloned().unwrap_or(Value::Null).as_bool() == Some(true)) {\n' +
    '            params = self.omit(params.clone(), Value::Str("a".to_string()).into());\n' +
    '        }\n' +
    '        let mut first: Value = self.fetch(Value::Str("x".to_string()).into(), params.clone());\n' +
    '        return first;',
    'params.clone()');

// `|__arr|` shadow inside a `let` initializer is not a closure either
check ('read shadow in a let initializer does not block the drop',
    '        let mut rows: Value = response.as_array().and_then(|__arr| __arr.get(0)).cloned().unwrap_or(Value::Null);\n' +
    '        return Value::from(vec![params.clone(), rows]);',
    'Value::from(vec![params, rows])',
    'params.clone()');

// ---- real closures still block ----------------------------------------------

// a closure bound to a variable and called later borrows `item`
check ('real closure body still blocks the drop',
    '        let mut item: Value = get_value(&rows, &Value::Int(0));\n' +
    '        let f = |x: Value| { if is_true(&is_equal(&x, &item)) { x } else { Value::Null } };\n' +
    '        let mut row: Value = self.safe_value(item.clone(), Value::Str("row".to_string()).into());\n' +
    '        return f(row);',
    'self.safe_value(item.clone()',
    'self.safe_value(item,');

// a closure with a `-> Type` return annotation is a real closure too
check ('return-annotated closure still blocks the drop',
    '        let mut item: Value = get_value(&rows, &Value::Int(0));\n' +
    '        let f = |x: Value| -> Value { if is_true(&is_equal(&x, &item)) { x } else { Value::Null } };\n' +
    '        let mut row: Value = self.safe_value(item.clone(), Value::Str("row".to_string()).into());\n' +
    '        return f(row);',
    'self.safe_value(item.clone()',
    'self.safe_value(item,');

// a block-bodied closure in an if condition is a real closure: its own block
// (header ends with `|`) keeps blocking
check ('block-bodied closure in a condition still blocks',
    '        let mut item: Value = get_value(&rows, &Value::Int(0));\n' +
    '        if (rows.iter().any(|x| { is_true(&is_equal(x, &item)) })) {\n' +
    '            let mut row: Value = self.safe_value(item.clone(), Value::Str("row".to_string()).into());\n' +
    '        }\n' +
    '        return item;',
    'self.safe_value(item.clone()',
    'self.safe_value(item,');

// ---- loops still block ------------------------------------------------------

check ('loop-declared-outside local still blocks',
    '        let mut i: Value = Value::Int(0);\n' +
    '        while (i.as_f64().unwrap_or(f64::NAN) < 3.0) {\n' +
    '            let mut row: Value = self.safe_value(params.clone(), Value::Str("row".to_string()).into());\n' +
    '        }\n' +
    '        return Value::Null;',
    'self.safe_value(params.clone()',
    'self.safe_value(params,');

console.log (failures === 0 ? '\nall checks passed' : `\n${failures} check(s) failed`);
process.exit (failures === 0 ? 0 : 1);