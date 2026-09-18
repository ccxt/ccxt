// Dead-last-use `.clone()` drop for the Rust port's value-by-value callees.
//
//   npx tsx build/rust-dead-arg-clones.test.ts
//
// `self.extend/omit/market/parse_number` take their `Value` argument BY VALUE, so
// `autoCloneCallArgs`'s unconditional `.clone()` is only needed when the local is
// still read later. Each check feeds a self-contained Rust snippet to the real
// pass (`RustTranspilerBuilder#dropDeadLastUseArgClones`) and asserts the clone is
// dropped (dead local) or kept (live local / loop-carried / sibling callee).
import { RustTranspilerBuilder } from './rustTranspiler.js';

const builder: any = new RustTranspilerBuilder();
if (typeof builder.dropDeadLastUseArgClones !== 'function') {
    console.log('FAIL dropDeadLastUseArgClones is missing (rule not installed)');
    process.exit(1);
}

let failures = 0;
const check = (name: string, source: string, expected: string, forbidden?: string) => {
    const output: string = builder.dropDeadLastUseArgClones(source);
    const ok = output.includes(expected) && (forbidden === undefined || !output.includes(forbidden));
    console.log((ok ? 'ok   ' : 'FAIL ') + name);
    if (!ok) {
        failures++;
        console.log('  expected: ' + expected + (forbidden ? '  (and not: ' + forbidden + ')' : ''));
        console.log('  actual:   ' + output.trim().replace(/\s+/g, ' ').slice(0, 240));
    }
};

const wrap = (body: string) => `impl X {\n    fn f(&self) -> Value {\n${body}\n    }\n}\n`;

// ── drop: the local is dead after the call ────────────────────────────────────
check('extend: dead let-bound request',
    wrap('        let mut request: Value = Value::Map({});\n        let r = self.extend(request.clone(), &[params.clone()]);\n        return r;'),
    'self.extend(request, &[params.clone()])', 'request.clone()');

check('omit: dead let-bound obj',
    wrap('        let mut obj: Value = Value::Map({});\n        return self.omit(obj.clone(), Value::Str("k".to_string()), &[]);'),
    'self.omit(obj, Value::Str("k".to_string())', 'obj.clone()');

check('market: dead let-bound symbol',
    wrap('        let mut symbol: Value = Value::Str("BTC/USDT".to_string());\n        return self.market(symbol.clone());'),
    'self.market(symbol)', 'symbol.clone()');

check('market: dead function parameter',
    wrap('        return self.market(symbol.clone());').replace('fn f(&self)', 'fn f(&self, mut symbol: Value)'),
    'self.market(symbol)', 'symbol.clone()');

check('parse_number: dead let-bound priceString',
    wrap('        let mut priceString: Value = Value::Str("1".to_string());\n        pre = self.parse_number(priceString.clone(), &[]);\n        return pre;'),
    'self.parse_number(priceString, &[])', 'priceString.clone()');

// ── keep: still live, or a shape the move would break ─────────────────────────
check('keep: local read after the call',
    wrap('        let mut request: Value = Value::Map({});\n        let r = self.extend(request.clone(), &[]);\n        params = request.clone();\n        return r;'),
    'self.extend(request.clone()', undefined);

check('keep: same name repeated inside the call itself',
    wrap('        let mut p: Value = Value::Map({});\n        return self.extend(p.clone(), &[p.clone()]);'),
    'self.extend(p.clone()', undefined);

check('keep: loop-carried move (declared before a loop)',
    wrap('        let mut request: Value = Value::Map({});\n        while c {\n            r = self.extend(request.clone(), &[]);\n        }\n        return r;'),
    'self.extend(request.clone()', undefined);

check('keep: identical name in the next fn does not make it live',
    'impl X {\n    fn f(&self) -> Value {\n        let mut request: Value = Value::Map({});\n        let r = self.extend(request.clone(), &[]);\n        return r;\n    }\n    fn g(&self) -> Value {\n        let mut request: Value = Value::Map({});\n        return request;\n    }\n}\n',
    'self.extend(request, &[])', 'request.clone()');

check('drop: re-declared inside the loop body',
    wrap('        while c {\n            let mut request: Value = Value::Map({});\n            r = self.extend(request.clone(), &[]);\n        }\n        return r;'),
    'self.extend(request, &[])', 'request.clone()');

// ── untouched: sibling callees and comments ───────────────────────────────────
check('keep: sibling callee (safe_string_k, rust-03 family)',
    wrap('        let mut request: Value = Value::Map({});\n        return self.safe_string_k(request.clone(), "k", &[]);'),
    'self.safe_string_k(request.clone()', undefined);

check('keep: call inside a line comment',
    wrap('        // let r = self.extend(request.clone(), &[]);\n        return r;'),
    'self.extend(request.clone()', undefined);

console.log(failures === 0 ? '\nall checks passed' : `\n${failures} check(s) failed`);
process.exit(failures === 0 ? 0 : 1);
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

// the local is also read by a LATER ARGUMENT of the same call: the move would
// happen first (arguments are evaluated left to right), so the clone stays
check ('same call reads the local in a later argument',
    '        let mut orders: Value = self.safe_dict_k(response.clone(), "data", &[response.clone()]);\n' +
    '        return orders;',
    'self.safe_dict_k(response.clone(), "data", &[response.clone()])',
    undefined);

// generated `while { ..cond..;.. } {` bodies carry a `;` inside the condition —
// the loop must still be recognised (a binding declared outside it keeps the clone)
check ('while-condition semicolon does not hide the loop',
    '        let mut item: Value = get_value(&items, &Value::Int(0));\n' +
    '        while { __flag = false; is_less_than(&i, &Value::Int(3)) } {\n' +
    '            let mut data: Value = self.safe_list_k(item.clone(), "data", &[]);\n' +
    '            i = Value::Int(1);\n' +
    '        }\n' +
    '        return Value::Null;',
    'self.safe_list_k(item.clone(), "data", &[])',
    'self.safe_list_k(item, "data"');

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
