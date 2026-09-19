// B-32 emission checks for build/rustTranspiler.ts#dropDeadValueSlotClones.
//
//   npx tsx build/rust-dead-value-slot-clones.test.ts
//
// A `.clone()` whose result is consumed by a by-value slot (a call argument, a
// slice element, a `let`/assignment value or a `return` operand) is dead as soon
// as the local is never read again — the value can then move instead of being
// copied. Borrow slots, `self.<field>` receivers and locals that are live after
// the slot keep their clone. Every check asserts the transformed text of a small
// generated-Rust snippet; the "drop" cases fail on a tree where the pass is not
// installed (the clone stays).
import { RustTranspilerBuilder } from './rustTranspiler.js';

const builder = new RustTranspilerBuilder ();

const wrap = (body: string): string => `impl Exchange {
    pub fn f(&self, mut response: Value) -> Value {
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
        console.log ('  actual:   ' + out.replace (/\s+/g, ' ').slice (0, 400));
    }
};

// ---- argument slots -------------------------------------------------------

// dead local as an argument of a by-value callee: the move is equivalent
check ('dead argument drops the clone',
    '        let mut data: Value = self.safe_value(response.clone(), Value::Str("data".to_string()), &[]);\n' +
    '        return data;',
    'self.safe_value(response, Value::Str("data".to_string()), &[])',
    'response.clone()');

// the local is read again later: the clone stays
check ('local read after the slot keeps the clone',
    '        let mut data: Value = self.safe_value(response.clone(), Value::Str("data".to_string()), &[]);\n' +
    '        let mut rows: Value = self.safe_value(response.clone(), Value::Str("rows".to_string()), &[]);\n' +
    '        return Value::from(vec![data, rows]);',
    'self.safe_value(response, Value::Str("rows".to_string()), &[])',
    'self.safe_value(response, Value::Str("data".to_string())');

// every argument slot is probed, not just the first
check ('second argument drops its clone too',
    '        let mut keys: Value = Value::List(vec![]);\n' +
    '        let mut defaults: Value = Value::List(vec![]);\n' +
    '        let mut a: Value = self.safe_value_n(keys.clone(), defaults.clone(), &[]);\n' +
    '        return a;',
    'self.safe_value_n(keys, defaults, &[])');

// a slice element is a by-value slot as well
check ('slice element drops the clone',
    '        let mut entries: Value = Value::List(vec![]);\n' +
    '        let mut limit: Value = Value::Int(10);\n' +
    '        let mut key: Value = Value::Str("key".to_string());\n' +
    '        let mut r: Value = self.filter_by_limit(entries.clone(), &[limit.clone(), key.clone()]);\n' +
    '        return r;',
    'self.filter_by_limit(entries, &[limit, key])',
    'limit.clone()');

// a key literal that spells the local's name is not a use of the local
check ('string literal mentioning the name does not block the move',
    '        let mut data: Value = Value::Map(indexmap::IndexMap::new());\n' +
    '        let mut m = indexmap::IndexMap::new();\n' +
    '        m.insert("data".to_string(), data.clone());\n' +
    '        return Value::Map(m);',
    'm.insert("data".to_string(), data)');

// ---- value slots ----------------------------------------------------------

check ('let value drops the clone',
    '        let mut key: Value = Value::Str("k".to_string());\n' +
    '        let mut k: Value = key.clone();\n' +
    '        return k;',
    'let mut k: Value = key;',
    'key.clone()');

check ('assignment value drops the clone',
    '        let mut newUrls: Value = Value::Map(indexmap::IndexMap::new());\n' +
    '        self.urls = newUrls.clone();\n' +
    '        return Value::Null;',
    'self.urls = newUrls;',
    'newUrls.clone()');

check ('return operand drops the clone',
    '        let mut out: Value = Value::Map(indexmap::IndexMap::new());\n' +
    '        return out.clone();',
    'return out;',
    'out.clone()');

// ---- receivers / borrows that can never move ------------------------------

// a field of `&self` is a borrow, not an owned value
check ('self.field keeps the clone',
    '        let mut m = indexmap::IndexMap::new();\n' +
    '        m.insert("markets".to_string(), self.markets.clone());\n' +
    '        return Value::Map(m);',
    'self.markets.clone()');

// `&x.clone()` is the borrow of a temporary: removing the clone would need the
// `&` rewritten, so the text stays
check ('borrowed clone is untouched',
    '        let mut r: Value = Value::from(vec![response.clone()]);\n' +
    '        let mut x: Value = self.safe_value(&response.clone(), Value::Str("k".to_string()), &[]);\n' +
    '        return Value::from(vec![r, x]);',
    '&response.clone()');

// ---- liveness guards ------------------------------------------------------

// declared OUTSIDE the loop: iteration 2 would read a moved value
check ('local declared outside the loop keeps the clone',
    '        let mut item: Value = get_value(&items, &Value::Int(0));\n' +
    '        let mut i: i64 = 0;\n' +
    '        while (i < 3) {\n' +
    '            let mut row: Value = self.safe_value(item.clone(), Value::Str("row".to_string()), &[]);\n' +
    '            i = i + 1;\n' +
    '        }\n' +
    '        return Value::Null;',
    'self.safe_value(item.clone(), Value::Str("row".to_string()), &[])',
    'self.safe_value(item,');

// declared INSIDE the loop body: each iteration re-creates it, the move is safe
check ('local declared inside the loop moves',
    '        let mut i: i64 = 0;\n' +
    '        while (i < 3) {\n' +
    '            let mut item: Value = get_value(&items, &Value::Int(0));\n' +
    '            let mut row: Value = self.safe_value(item.clone(), Value::Str("row".to_string()), &[]);\n' +
    '            i = i + 1;\n' +
    '        }\n' +
    '        return Value::Null;',
    'self.safe_value(item, Value::Str("row".to_string()), &[])');

// a closure defined before the slot captures the local: a move would break it
check ('local captured by an earlier closure keeps the clone',
    '        let mut item: Value = get_value(&items, &Value::Int(0));\n' +
    '        let f = |x: Value| -> Value { if is_true(&is_equal(&x, &item)) { x } else { Value::Null } };\n' +
    '        let mut row: Value = self.safe_value(item.clone(), Value::Str("row".to_string()), &[]);\n' +
    '        return f(row);',
    'self.safe_value(item.clone(), Value::Str("row".to_string()), &[])',
    'self.safe_value(item,');

// an enclosing call's earlier argument borrows the same local
check ('earlier argument of an enclosing call keeps the clone',
    '        let mut m = indexmap::IndexMap::new();\n' +
    '        add_element_to_object(&mut base, &network, Value::Map({\n' +
    '            let mut inner = indexmap::IndexMap::new();\n' +
    '            inner.insert("network".to_string(), network.clone());\n' +
    '            Value::Map(inner)\n' +
    '        }));\n' +
    '        return Value::Null;',
    'inner.insert("network".to_string(), network.clone())',
    'inner.insert("network".to_string(), network)');

// an enclosing `if let` header mutably borrows the same local
check ('enclosing block-header borrow keeps the clone',
    '        let mut account: Value = Value::Map(indexmap::IndexMap::new());\n' +
    '        let mut total: Value = Value::Int(0);\n' +
    '        if let Value::Dict(__d) = &mut account {\n' +
    '            let mut m = indexmap::IndexMap::new();\n' +
    '            m.insert("total".to_string(), total.clone());\n' +
    '            total = Value::Map(m);\n' +
    '        }\n' +
    '        return total;',
    'm.insert("total".to_string(), total.clone())',
    'm.insert("total".to_string(), total)');

// a bare value that is not a whole slot (an operand of `&&`) is left alone
check ('non-slot operand keeps the clone',
    '        let mut a: Value = Value::Bool(true);\n' +
    '        let mut b: Value = Value::Bool(is_true(&a.clone()) && is_true(&Value::Bool(true)));\n' +
    '        return b;',
    'is_true(&a.clone())');

if (failures > 0) {
    console.log (`\n${failures} check(s) failed`);
    process.exit (1);
}
console.log ('\nall checks passed');
