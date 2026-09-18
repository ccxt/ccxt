// rust-05 emission checks for build/rustTranspiler.ts#dropDeadFirstArgClones.
//
//   npx tsx build/rust-dead-arg-clones.test.ts
//
// `self.safe_{number,value,bool,list,dict}_k(obj, key, args)` take `obj: Value`
// BY VALUE, so the defensive `.clone()` `wrapVariadicCalls` adds to a
// bare-identifier object argument can be dropped whenever the local is provably
// dead after the call (the move is then equivalent). Every check below asserts
// the transformed text of a small generated-Rust snippet; the "drop" cases fail
// on a tree where the pass is not installed (the clone stays).
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
    const out = (builder as any).dropDeadFirstArgClones (wrap (body));
    const ok = out.includes (expected) && (forbidden === undefined || !out.includes (forbidden));
    console.log ((ok ? 'ok   ' : 'FAIL ') + name);
    if (!ok) {
        failures++;
        console.log ('  expected: ' + expected + (forbidden ? '  (and not: ' + forbidden + ')' : ''));
        console.log ('  actual:   ' + out.replace (/\s+/g, ' ').slice (0, 400));
    }
};

// dead-after local: the move is equivalent, the clone goes
check ('local dead after the call',
    '        let mut data: Value = self.safe_value_k(response.clone(), "data", &[]);\n' +
    '        return data;',
    'self.safe_value_k(response, "data", &[])',
    'response.clone()');

// same local, still read later: the first call keeps the clone, the LAST read drops it
check ('local read after the call keeps the clone',
    '        let mut data: Value = self.safe_value_k(response.clone(), "data", &[]);\n' +
    '        let mut rows: Value = self.safe_list_k(response.clone(), "rows", &[]);\n' +
    '        return rows;',
    'self.safe_list_k(response, "rows", &[])',
    'self.safe_value_k(response, "data", &[])');

// the LAST use of a run drops its clone, the earlier ones keep theirs
check ('only the last read of the local drops',
    '        let mut a: Value = self.safe_list_k(response.clone(), "a", &[]);\n' +
    '        let mut b: Value = self.safe_list_k(response.clone(), "b", &[]);\n' +
    '        return a;',
    'self.safe_list_k(response, "b", &[])',
    'self.safe_list_k(response, "a", &[])');

// binding declared OUTSIDE the enclosing loop: iteration 2 would read a moved
// value, so the clone stays
check ('binding declared outside the loop keeps the clone',
    '        let mut item: Value = get_value(&items, &Value::Int(0));\n' +
    '        while is_less_than(&i, &Value::Int(3)) {\n' +
    '            let mut data: Value = self.safe_dict_k(item.clone(), "data", &[]);\n' +
    '            i = Value::Int(1);\n' +
    '        }\n' +
    '        return Value::Null;',
    'self.safe_dict_k(item.clone(), "data", &[])',
    'self.safe_dict_k(item, "data"');

// binding declared INSIDE the loop body is re-created per iteration: drop
check ('binding declared inside the loop drops the clone',
    '        while is_less_than(&i, &Value::Int(3)) {\n' +
    '            let mut entry: Value = get_value(&items, &i);\n' +
    '            let mut data: Value = self.safe_dict_k(entry.clone(), "data", &[]);\n' +
    '            i = Value::Int(1);\n' +
    '        }\n' +
    '        return Value::Null;',
    'self.safe_dict_k(entry, "data", &[])',
    'entry.clone()');

// a `self.<field>` argument can never be moved out of `&self`
check ('self.field argument keeps the clone',
    '        let mut data: Value = self.safe_dict_k(self.options.clone(), "fetchMarkets", &[]);\n' +
    '        return data;',
    'self.safe_dict_k(self.options.clone(), "fetchMarkets", &[])',
    'self.safe_dict_k(self.options,');

// only the object argument is touched — the optional-args slice is another family
check ('later-argument clones are untouched',
    '        let mut params: Value = get_arg(optional_args, 0, Value::Map(Value::Map::new()));\n' +
    '        let mut types: Value = self.safe_list_k(params.clone(), "types", &[defaultTypes.clone()]);\n' +
    '        return defaultTypes;',
    'self.safe_list_k(params, "types", &[defaultTypes.clone()])',
    'params.clone()');

// non-`_k` callees (no literal key) are out of this family
check ('non-_k call untouched',
    '        let mut data: Value = self.safe_value(response.clone(), Value::Str("data".to_string()), &[]);\n' +
    '        return data;',
    'self.safe_value(response.clone(),',
    undefined);

if (failures > 0) {
    console.log (`\n${failures} check(s) failed`);
    process.exit (1);
}
console.log ('\nall checks passed');
