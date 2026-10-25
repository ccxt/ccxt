// Run: npx tsx --test build/tests/test.hx10w3-r08.ts
import assert from 'node:assert/strict';
import test from 'node:test';
import { r08DictReads } from '../hx10w3-R08.js';

const N = 'Value::Null';
const G = (recv: string, key: string) => `${recv}.as_map().and_then(|__m| ${key}).cloned().unwrap_or(${N})`;

function src(decl: string, use: string): string {
    return `fn f(&self) {\n    ${decl}\n    ${use}\n}`;
}

test('get_value on a fresh map-literal local goes native (literal key)', () => {
    const s = src('let mut fees: Value = Value::Map({\n    let mut m = indexmap::IndexMap::new();\n    m\n});',
        'let mut core: Value = get_value(&fees, &Value::Str("core".into()));');
    const out = r08DictReads(s);
    assert.ok(out.includes(`let mut core: Value = ${G('fees', '__m.get("core")')};`), out);
    assert.ok(!out.includes('get_value('), out);
});

test('get_value on a fresh map-literal local goes native (variable key)', () => {
    const s = src('let mut fees: Value = Value::Map({\n    m\n});',
        'let mut one: Value = get_value(&fees, &code);');
    const out = r08DictReads(s);
    assert.ok(out.includes(`let mut one: Value = ${G('fees', 'code.as_str().and_then(|__k| __m.get(__k))')};`), out);
});

test('in_op on a fresh map-literal local goes native for both key shapes', () => {
    const s = src('let mut has: Value = Value::Map({\n    m\n});',
        'if (in_op(&has, &Value::Str("fetchOrders".into()))) { return; }\n    if (in_op(&has, &k)) { return; }');
    const out = r08DictReads(s);
    assert.ok(out.includes('if (has.as_map().is_some_and(|__m| __m.contains_key("fetchOrders"))) { return; }'), out);
    assert.ok(out.includes('if (has.as_map().is_some_and(|__m| k.as_str().is_some_and(|__k| __m.contains_key(__k)))) { return; }'), out);
    assert.ok(!out.includes('in_op('), out);
});

test('a safe_dict result is a Dict: a plain literal key goes native', () => {
    const s = src('let mut limits: Value = self.safe_dict_k(network, "limits", &[Value::Map({\n    m\n})]);',
        'let mut deposit: Value = get_value(&limits, &Value::Str("deposit".into()));');
    const out = r08DictReads(s);
    assert.ok(out.includes(`let mut deposit: Value = ${G('limits', '__m.get("deposit")')};`), out);
});

test('a dict of unproven content keeps routed keys and variable keys', () => {
    const ts = src('let mut limits: Value = self.safe_dict_k(network, "limits", &[]);',
        'let mut n: Value = get_value(&limits, &Value::Str("timestamp".into()));');
    assert.ok(r08DictReads(ts).includes('get_value(&limits, &Value::Str("timestamp".into()))'), r08DictReads(ts));
    const dyn = src('let mut limits: Value = self.safe_dict_k(network, "limits", &[]);',
        'let mut n: Value = get_value(&limits, &k);');
    assert.ok(r08DictReads(dyn).includes('get_value(&limits, &k)'), r08DictReads(dyn));
});

test('a fresh literal local keeps a routed key: the runtime may tag it later', () => {
    const s = src('let mut book: Value = Value::Map({\n    m\n});',
        'let mut n: Value = get_value(&book, &Value::Str("nonce".into()));');
    assert.ok(r08DictReads(s).includes('get_value(&book, &Value::Str("nonce".into()))'), r08DictReads(s));
});

test('params and non-dict locals keep the helper', () => {
    const param = 'fn f(&self, entry: Value) {\n    let mut a: Value = get_value(&entry, &k);\n}';
    assert.ok(r08DictReads(param).includes('get_value(&entry, &k)'), r08DictReads(param));
    const str = src('let mut name: Value = self.safe_string_k(entry.clone(), "name", &[]);',
        'let mut a: Value = get_value(&name, &k);');
    assert.ok(r08DictReads(str).includes('get_value(&name, &k)'), r08DictReads(str));
    const prec = src('let mut p: Value = Precise::new(value.clone());',
        'let mut a: Value = get_value(&p, &Value::Str("decimals".into()));');
    assert.ok(r08DictReads(prec).includes('get_value(&p,'), r08DictReads(prec));
});

test('a rebind to a non-dict value drops the proof', () => {
    const s = src('let mut fees: Value = Value::Map({\n    m\n});',
        'fees = self.parse_trading_fees(response, &[]);\n    let mut a: Value = get_value(&fees, &k);');
    assert.ok(r08DictReads(s).includes('get_value(&fees, &k)'), r08DictReads(s));
});

test('a whole-value write outside a keyed helper drops the proof', () => {
    const s = src('let mut fees: Value = Value::Map({\n    m\n});',
        'std::mem::swap(&mut fees, &mut other);\n    let mut a: Value = get_value(&fees, &k);');
    assert.ok(r08DictReads(s).includes('get_value(&fees, &k)'), r08DictReads(s));
});

test('a keyed write keeps the proof', () => {
    const s = src('let mut fees: Value = Value::Map({\n    m\n});',
        'add_element_to_object(&mut fees, &Value::Str("core".into()), v);\n    if let Value::Dict(__d) = &mut fees { std::sync::Arc::make_mut(__d).insert("x".to_string(), v); }\n    let mut a: Value = get_value(&fees, &k);');
    assert.ok(!r08DictReads(s).includes('get_value(&fees'), r08DictReads(s));
});

test('a closure parameter that shadows the local keeps the helper', () => {
    const s = src('let mut fees: Value = Value::Map({\n    m\n});',
        'let g = map.iter().map(|fees| get_value(&fees, &k)).collect::<Vec<Value>>();');
    assert.ok(r08DictReads(s).includes('get_value(&fees, &k)'), r08DictReads(s));
});

test('the >400-char line count does not rise', () => {
    const pad = 'x'.repeat(360);
    const s = `fn f(&self) {\n    let mut fees: Value = Value::Map({\n    m\n});\n    let mut a: Value = get_value(&fees, &Value::Str("${pad}".into()));\n}`;
    const out = r08DictReads(s);
    const long = (t: string) => t.split('\n').filter((l) => l.length > 400).length;
    assert.equal(long(out), long(s));
});
