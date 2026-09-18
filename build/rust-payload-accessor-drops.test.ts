// Payload-accessor checks for build/rustTranspiler.ts#nativePayloadAccessorDrops.
//
//   npx tsx build/rust-payload-accessor-drops.test.ts
//
// Feeds the pass the Rust shapes the printer + the other post-passes produce and
// asserts which `X.as_map()/as_array()/as_str()/as_bool()` chains become native
// payload reads. The reject cases are the ones where the local's variant is not
// pinned (reassigned, shadowed, not a fresh constructor, used in another fn).
import { RustTranspilerBuilder } from './rustTranspiler.js';

const b: any = new RustTranspilerBuilder();

let failures = 0;
const check = (name: string, source: string, expected: string, forbidden?: string) => {
    const output: string = b.nativePayloadAccessorDrops(source);
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

// ── accept: the variant is pinned by the declaration ────────────────────────
const mapDecl = (name: string) => `        let mut ${name}: Value = Value::Map({\n            let mut m = indexmap::IndexMap::new();\n            m\n        });\n`;
const listDecl = (name: string) => `        let mut ${name}: Value = Value::List(vec![Value::Int(1), Value::Int(2)]);\n`;

check('fresh dict local + as_map chain',
    fn(mapDecl('request') + '        let mut limit: Value = request.as_map().and_then(|__m| __m.get("limit")).cloned().unwrap_or(Value::Null);\n'),
    'match &request { Value::Dict(__m15) => __m15.get("limit").cloned().unwrap_or(Value::Null), _ => Value::Null }',
    'as_map()');

check('fresh dict local + crate::Value::Null spelling',
    fn(mapDecl('request') + '        let mut limit: Value = request.as_map().and_then(|__m| __m.get("limit")).cloned().unwrap_or(crate::Value::Null);\n'),
    'Value::Dict(__m15) => __m15.get("limit").cloned().unwrap_or(crate::Value::Null)',
    'as_map()');

check('fresh list local + as_array chain',
    fn(listDecl('parsed') + '        let mut high: Value = parsed.as_array().and_then(|__arr| __arr.get(1)).cloned().unwrap_or(Value::Null);\n'),
    'match &parsed { Value::Arr(__a15) => __a15.get(1).cloned().unwrap_or(Value::Null), _ => Value::Null }',
    'as_array()');

check('fresh bool local + == Some(true)',
    fn('        let mut isArray: Value = Value::Bool(is_array(&data));\n        if (isArray.as_bool() == Some(true)) {\n            return Value::Null;\n        }\n'),
    'matches!(&isArray, Value::Bool(true))',
    'as_bool()');

check('fresh bool local + != Some(true)',
    fn('        let mut isDemoEnv: Value = Value::Bool(is_true(&demoMode));\n        if is_true(&(Value::Bool(isDemoEnv.as_bool() != Some(true)))) {\n            return Value::Null;\n        }\n'),
    '!matches!(&isDemoEnv, Value::Bool(true))',
    'as_bool()');

check('fresh bool local + == Some(false)',
    fn('        let mut isSpot: Value = Value::Bool(false);\n        if (isSpot.as_bool() == Some(false)) {\n            return Value::Null;\n        }\n'),
    'matches!(&isSpot, Value::Bool(false))',
    'as_bool()');

check('fresh str local + == Some("lit")',
    fn('        let mut typeVar: Value = Value::Str("spot".to_string());\n        if (typeVar.as_str() == Some("spot")) {\n            return Value::Null;\n        }\n'),
    'matches!(&typeVar, Value::Str(__s15) if __s15 == "spot")',
    'as_str()');

check('fresh str local + != Some("lit")',
    fn('        let mut marginMode: Value = Value::Str("isolated".to_string());\n        if (marginMode.as_str() != Some("cross")) {\n            return Value::Null;\n        }\n'),
    '!matches!(&marginMode, Value::Str(__s15) if __s15 == "cross")',
    'as_str()');

// ── reject: the variant is not pinned ──────────────────────────────────────
check('reassigned local keeps the accessor',
    fn(mapDecl('request') + '        request = Value::Null;\n        let mut limit: Value = request.as_map().and_then(|__m| __m.get("limit")).cloned().unwrap_or(Value::Null);\n'),
    'request.as_map()');

check('second declaration of the name keeps the accessor',
    fn(mapDecl('request') + '        let mut request: Value = Value::Null;\n        let mut limit: Value = request.as_map().and_then(|__m| __m.get("limit")).cloned().unwrap_or(Value::Null);\n'),
    'request.as_map()');

check('param receiver keeps the accessor',
    fn('        let mut limit: Value = request.as_map().and_then(|__m| __m.get("limit")).cloned().unwrap_or(Value::Null);\n',
        '    pub fn create_order_request(&mut self, request: Value) -> Value {'),
    'request.as_map()');

check('use in another fn keeps the accessor',
    fn(mapDecl('request') + '        let mut a: Value = request.as_map().and_then(|__m| __m.get("a")).cloned().unwrap_or(Value::Null);\n')
        + 'impl Other {\n    pub fn other(&self) -> Value {\n        request.as_map().and_then(|__m| __m.get("b")).cloned().unwrap_or(Value::Null)\n    }\n}\n',
    'request.as_map().and_then(|__m| __m.get("b"))');

check('non-literal comparand keeps the accessor',
    fn('        let mut typeVar: Value = Value::Str("spot".to_string());\n        if (typeVar.as_str() == Some(other)) {\n            return Value::Null;\n        }\n'),
    'typeVar.as_str()');

check('non-Value::Null default keeps the accessor',
    fn(mapDecl('request') + '        let mut limit: Value = request.as_map().and_then(|__m| __m.get("limit")).cloned().unwrap_or(Value::Int(0));\n'),
    'request.as_map()');

check('helper-built local keeps the accessor',
    fn('        let mut request: Value = self.create_order_request(symbol.clone());\n        let mut limit: Value = request.as_map().and_then(|__m| __m.get("limit")).cloned().unwrap_or(Value::Null);\n'),
    'request.as_map()');

check('idempotent on already-native output',
    fn(mapDecl('request') + '        let mut limit: Value = match &request { Value::Dict(__m15) => __m15.get("limit").cloned().unwrap_or(Value::Null), _ => Value::Null };\n'),
    'match &request { Value::Dict(__m15)');

console.log(failures === 0 ? '\nall checks passed' : `\n${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
