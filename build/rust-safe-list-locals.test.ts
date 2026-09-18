// Native-typed `safe_list` locals (build/rustTranspiler.ts#typeSafeListLocals).
//
//   npx tsx build/rust-safe-list-locals.test.ts
//
// The pass runs on the generated Rust text, so every case below is a literal
// slice of that text: a `let mut X: Value = self.safe_list_k(..)` declaration
// plus the uses the printer emits. "typed" means the local becomes
// `Vec<Value>` and the read drops the `get_value` call; "boxed" means the
// declaration and every use are left exactly as they were.
import { RustTranspilerBuilder } from './rustTranspiler.js';

const pass = (src: string): string =>
    (RustTranspilerBuilder.prototype as any).typeSafeListLocals.call(null, src);

let failures = 0;
const check = (name: string, source: string, expect: string[], forbid: string[] = []) => {
    const out = pass(source);
    const missing = expect.filter(e => !out.includes(e));
    const present = forbid.filter(f => out.includes(f));
    const ok = missing.length === 0 && present.length === 0;
    console.log((ok ? 'ok   ' : 'FAIL ') + name);
    if (!ok) {
        failures++;
        for (const e of missing) console.log('  missing: ' + e);
        for (const f of present) console.log('  must not appear: ' + f);
        console.log('  actual: ' + out.trim().replace(/\s+/g, ' ').slice(0, 400));
    }
};

// The printer's loop shape: `.len()` bound + one index read per iteration.
const loop = (name: string, read: string, extra = ''): string => `
    pub fn f(&self, response: Value) -> Value {
        let mut ${name}: Value = self.safe_list_k(response.clone(), "data", &[Value::List(vec![])]);
        let mut out: Value = Value::List(vec![]);
        {
            let mut i: Value = Value::Int(0);
            let mut __for_first_1: bool = true;
            while { if !__for_first_1 { i = (match (&(i), &(Value::Int(1))) { (Value::Int(x), Value::Int(y)) => Value::Int(x + y), _ => Value::Null }); } __for_first_1 = false; i.as_f64().unwrap_or(f64::NAN) < Value::Int(${name}.len() as i64).as_f64().unwrap_or(f64::NAN) } {
                let mut entry: Value = ${read};
                append_to_array(&mut out, entry.clone());
            }
        }
        ${extra}
        out
    }
`;

// 1. len + index read: typed, read native, helper gone.
check('len + index read -> Vec<Value> + native .get()',
    loop('data', 'get_value(&data, &i)'),
    ['let mut data: Vec<Value> = self.safe_list_k(response.clone(), "data", &[Value::List(vec![])]).as_array().cloned().unwrap_or_default();',
     'match &i { Value::Int(__n) => data.get(*__n as usize), Value::Str(__s) => __s.parse::<usize>().ok().and_then(|__n| data.get(__n)), _ => None }.cloned().unwrap_or(Value::Null)'],
    ['let mut data: Value =', 'get_value(&data, &i)']);

// 2. a `.is_empty()` sink counts as a length sink.
check('is_empty sink is a length sink',
    loop('rows', 'get_value(&rows, &i)').replace('Value::Int(rows.len() as i64)', 'Value::Bool(rows.is_empty())'),
    ['let mut rows: Vec<Value> ='],
    ['let mut rows: Value =']);

// 3. `.clone()` into a Value sink keeps the box (D2: a use that needs the box).
check('clone into a Value sink stays boxed',
    loop('data', 'get_value(&data, &i)', 'let mut other: Value = self.safe_dict_k(data.clone(), "x", &[]);'),
    ['let mut data: Value = self.safe_list_k'],
    [': Vec<Value>', 'data.get(']);

// 4. `as_array()` (iteration) stays boxed.
check('as_array() use stays boxed',
    loop('data', 'get_value(&data, &i)', 'for entry in data.as_array().unwrap_or(&[]) { let mut x: Value = entry.clone(); }'),
    ['let mut data: Value = self.safe_list_k'],
    [': Vec<Value>']);

// 5. a `&mut X` use (append_to_array / set_value) stays boxed.
check('&mut X use stays boxed',
    loop('data', 'get_value(&data, &i)', 'append_to_array(&mut data, Value::Null);'),
    ['let mut data: Value = self.safe_list_k'],
    [': Vec<Value>']);

// 6. an assignment is a later write of another printed type -> boxed (D2).
check('assignment stays boxed',
    loop('data', 'get_value(&data, &i)', 'data = self.parse_trades(response.clone(), Value::Null, Value::Null, &[]);'),
    ['let mut data: Value = self.safe_list_k'],
    [': Vec<Value>']);

// 7. a second binding of the name in the same fn -> boxed.
check('re-binding of the name stays boxed',
    loop('data', 'get_value(&data, &i)', 'let mut data: Value = Value::List(vec![]);'),
    ['let mut data: Value = self.safe_list_k'],
    [': Vec<Value>']);

// 8. a literal string key keeps the runtime's Str arm.
check('string-literal key emits the Str arm',
    loop('data', 'get_value(&data, &Value::Str("0".to_string()))'),
    ['Value::Str(__s) => __s.parse::<usize>().ok().and_then(|__n| data.get(__n))'],
    ['let mut data: Value =']);

// 9. `crate::value::get_value` and `&mut get_value(..)` are not rewritten.
check('crate::value::get_value receiver stays boxed',
    loop('data', 'crate::value::get_value(&data, &i)'),
    ['let mut data: Value = self.safe_list_k'],
    [': Vec<Value>']);
check('&mut get_value(..) stays boxed',
    loop('data', 'get_value(&data, &i)').replace('append_to_array(&mut out, entry.clone());', 'append_to_array(&mut get_value(&data, &i), entry.clone());'),
    ['let mut data: Value = self.safe_list_k'],
    [': Vec<Value>']);

// 10. the scan stops at the enclosing fn: a same-named local in the *next*
//     fn is classified on its own (each declaration is independent).
check('sibling fn does not leak into the scan',
    loop('data', 'get_value(&data, &i)') + `
    pub fn g(&self) -> Value {
        let mut data: Value = self.safe_list_k(self.options.clone(), "data", &[Value::List(vec![])]);
        let mut n: Value = Value::Int(data.len() as i64);
        n
    }
`,
    ['let mut data: Vec<Value> = self.safe_list_k(response.clone()',
     'let mut data: Vec<Value> = self.safe_list_k(self.options.clone()'],
    []);

// 11. a local whose only use is a length sink is still typed (no reads).
check('len-only local is typed',
    `pub fn f(&self, r: Value) -> Value {
        let mut symbols: Value = self.safe_list(subscription.clone(), key.clone(), &[Value::List(vec![])]);
        Value::Int(symbols.len() as i64)
    }`,
    ['let mut symbols: Vec<Value> = self.safe_list(subscription.clone(), key.clone(), &[Value::List(vec![])]).as_array().cloned().unwrap_or_default();'],
    ['let mut symbols: Value =']);

// 12. a use that is neither a read nor a length sink (a bare argument) stays boxed.
check('bare argument use stays boxed',
    loop('data', 'get_value(&data, &i)', 'let mut n: Value = self.index_by(data.clone(), Value::Int(0));'),
    ['let mut data: Value = self.safe_list_k'],
    [': Vec<Value>']);

// 13. a default that is not a list (returned verbatim when the stored value is
//     not an array) stays boxed.
check('non-list default stays boxed',
    `pub fn f(&self, r: Value) -> Value {
        let mut data: Value = self.safe_list_k(r.clone(), "data", &[Value::Map({ let mut m = indexmap::IndexMap::new(); m })]);
        Value::Int(data.len() as i64)
    }`,
    ['let mut data: Value = self.safe_list_k'],
    [': Vec<Value>']);

// 14. a read of a retyped local that sits inside ANOTHER retyped local's
//     initializer must be spliced into that declaration (the object of the
//     inner reader is still a `Value`).
check('read inside another retyped declaration is spliced in',
    `    pub fn f(&self, response: Value) -> Value {
        let mut data: Value = self.safe_list_k(response.clone(), "data", &[Value::List(vec![])]);
        let mut out: Value = Value::List(vec![]);
        {
            let mut i: Value = Value::Int(0);
            let mut __for_first_1: bool = true;
            while { if !__for_first_1 { i = (match (&(i), &(Value::Int(1))) { (Value::Int(x), Value::Int(y)) => Value::Int(x + y), _ => Value::Null }); } __for_first_1 = false; i.as_f64().unwrap_or(f64::NAN) < Value::Int(data.len() as i64).as_f64().unwrap_or(f64::NAN) } {
                let mut trades: Value = self.safe_list_k(get_value(&data, &i), "data", &[Value::List(vec![])]);
                let mut n: Value = Value::Int(trades.len() as i64);
                out = n;
            }
        }
        out
    }`,
    ['let mut data: Vec<Value> = self.safe_list_k(response.clone()',
     'let mut trades: Vec<Value> = self.safe_list_k(match &i { Value::Int(__n) => data.get(*__n as usize)'],
    ['get_value(&data, &i)']);

// 15. a read inside a *boxed* declaration is rewritten in place.
check('read inside a boxed declaration is rewritten in place',
    `    pub fn f(&self, response: Value) -> Value {
        let mut data: Value = self.safe_list_k(response.clone(), "data", &[Value::List(vec![])]);
        let mut trades: Value = self.safe_list_k(get_value(&data, &Value::Int(0)), "data", &[Value::List(vec![])]);
        let mut n: Value = Value::Int(data.len() as i64);
        append_to_array(&mut trades, n);
        n
    }`,
    ['let mut data: Vec<Value> = self.safe_list_k(response.clone()',
     'let mut trades: Value = self.safe_list_k(match &Value::Int(0) { Value::Int(__n) => data.get(*__n as usize)'],
    ['get_value(&data, &Value::Int(0))']);

console.log(failures === 0 ? 'ALL OK' : `${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
