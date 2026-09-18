// Native element-write checks for build/rustTranspiler.ts#nativeRequestDictInserts.
//
//   npx tsx build/rust-native-request-insert.test.ts
//
// Feeds the pass the exact Rust shapes the printer + the other post-passes
// produce and asserts which `add_element_to_object(&mut request, …)` calls
// become a native insert. The "helper" cases are the ones where the runtime
// tag write-throughs of `crate::runtime::add_element_to_object` could fire.
import { RustTranspilerBuilder } from './rustTranspiler.js';

const b: any = new RustTranspilerBuilder();

let failures = 0;
const check = (name: string, source: string, expected: string, forbidden?: string) => {
    const output: string = b.nativeRequestDictInserts(source);
    const ok = output.includes(expected) && (forbidden === undefined || !output.includes(forbidden));
    console.log((ok ? 'ok   ' : 'FAIL ') + name);
    if (!ok) {
        failures++;
        console.log('  expected: ' + expected + (forbidden ? '  (and not: ' + forbidden + ')' : ''));
        console.log('  actual:   ' + output.trim().replace(/\s+/g, ' ').slice(0, 300));
    }
};

const fn = (body: string, header = '    pub fn create_order_request(&mut self, symbol: Value) -> Value {') =>
    `impl Binance {\n${header}\n${body}\n    }\n\n    pub fn next_method(&self) -> Value {\n        Value::Null\n    }\n}\n`;
const decl = '        let mut request: Value = Value::Map({\n            let mut m = indexmap::IndexMap::new();\n                m.insert("symbol".to_string(), symbol.clone());\n            m\n        });\n';
const call = (key: string, value: string) => `        add_element_to_object(&mut request, &Value::Str("${key}".to_string()), ${value});\n`;
const native = (key: string, value: string) =>
    `if let Value::Dict(__d12) = &mut request { std::sync::Arc::make_mut(__d12).insert("${key}".to_string(), ${value}); }`;

// fresh object-literal dict local, literal key, value already cloned by
// splitAddElementBorrowConflicts → native insert
check('fresh map literal + literal key',
    fn(decl + call('limit', 'limit.clone()')),
    native('limit', 'limit.clone()'), 'add_element_to_object(');

// empty object literal local (printer's `{}` form)
check('empty map literal',
    fn('        let mut request: Value = Value::Map({\n            let mut m = indexmap::IndexMap::new();\n            m\n        });\n' + call('type', 'typeVar.clone()')),
    native('type', 'typeVar.clone()'), 'add_element_to_object(');

// hoisted value (borrow conflict) — the block form keeps working
check('hoisted __be_tmp value',
    fn(decl + '        { let __be_tmp = self.deep_extend(crate::value::get_value_k(&request, "params"), &[params.clone()]); add_element_to_object(&mut request, &Value::Str("params".to_string()), __be_tmp); }\n'),
    'if let Value::Dict(__d12) = &mut request { std::sync::Arc::make_mut(__d12).insert("params".to_string(), __be_tmp); }', 'add_element_to_object(');

// trailing line comment survives
check('trailing comment preserved',
    fn(decl + '        add_element_to_object(&mut request, &Value::Str("limit".to_string()), limit.clone()); // default 100\n'),
    native('limit', 'limit.clone()') + ' // default 100', 'add_element_to_object(');

// computed key keeps the helper (stringify_simple semantics)
check('computed key keeps helper',
    fn(decl + '        add_element_to_object(&mut request, &clientOrderIdRequest, clientOrderId.clone());\n'),
    'add_element_to_object(&mut request, &clientOrderIdRequest', native('x', 'y'));

// receiver built by a helper call is not provably a fresh dict
check('self.<method>() receiver keeps helper',
    fn('        let mut request: Value = self.create_order_request(symbol.clone(), typeVar.clone(), side.clone(), amount.clone(), &[]);\n' + call('newClientOrderId', 'clientOrderId.clone()')),
    'add_element_to_object(&mut request, &Value::Str("newClientOrderId"', native('newClientOrderId', 'clientOrderId.clone()'));

// `request` as a fn parameter
check('request param keeps helper',
    fn(call('cl_ord_id', 'clientOrderId.clone()'), '    pub fn order_request(&self, request: Value) -> Value {'),
    'add_element_to_object(&mut request, &Value::Str("cl_ord_id"', native('cl_ord_id', 'clientOrderId.clone()'));

// reassignment of the local (e.g. handleUntilOption) breaks the freshness proof
check('reassigned local keeps helper',
    fn(decl + call('startTime', 'since.clone()') + '        if untilDefined {\n            request = self.handle_until_option(Value::Str("endTime".to_string()), request.clone(), params.clone(), &[]);\n        }\n'),
    'add_element_to_object(&mut request, &Value::Str("startTime"', native('startTime', 'since.clone()'));

// a second declaration of the same local in the fn
check('two declarations keep helper',
    fn(decl + call('limit', 'limit.clone()') + '        if isFuture {\n            let mut request: Value = Value::Map({\n                let mut m = indexmap::IndexMap::new();\n                m\n            });\n            let _ = request.clone();\n        }\n'),
    'add_element_to_object(&mut request, &Value::Str("limit"', native('limit', 'limit.clone()'));

// a `"__…"` key literal in the fn means the receiver could be a runtime-tagged dict
check('tag key literal in fn keeps helper',
    fn(decl + '        add_element_to_object(&mut request, &Value::Str("__book_id".to_string()), Value::Int(1));\n' + call('limit', 'limit.clone()')),
    'add_element_to_object(&mut request, &Value::Str("limit"', native('limit', 'limit.clone()'));

// sibling receivers are other units' family
check('other receivers untouched',
    fn(decl + '        add_element_to_object(&mut params, &Value::Str("limit".to_string()), limit.clone());\n'),
    'add_element_to_object(&mut params, &Value::Str("limit"');

// value mentioning `request` would move the borrow inside the `if let`
check('value mentioning request keeps helper',
    fn(decl + '        add_element_to_object(&mut request, &Value::Str("params".to_string()), self.extend(request.clone(), params.clone(), &[]));\n'),
    'add_element_to_object(&mut request, &Value::Str("params"', native('params', 'x'));

// a fn without any request local (e.g. the same call in a helper fn)
check('no request local keeps helper',
    fn(call('limit', 'limit.clone()'), '    pub fn unrelated(&self) -> Value {'),
    'add_element_to_object(&mut request, &Value::Str("limit"', native('limit', 'limit.clone()'));

console.log(failures === 0 ? '\nall native-insert checks passed' : `\n${failures} check(s) FAILED`);
process.exit(failures === 0 ? 0 : 1);
