// Run: npx tsx --test build/tests/test.hx10w2-r08.ts
import assert from 'node:assert/strict';
import test from 'node:test';
import { hx10w2R08 } from '../hx10w2-R08.js';

const N = 'Value::Null';

test('get_value on an exchange state field goes native (literal key)', () => {
    const src = `let mut api: Value = get_value(&self.urls, &Value::Str("api".into()));`;
    assert.equal(hx10w2R08(src),
        `let mut api: Value = self.urls.as_map().and_then(|__m| __m.get("api")).cloned().unwrap_or(${N});`);
});

test('get_value on an exchange state field goes native (variable key)', () => {
    const src = `let mut type_: Value = get_value(&self.options, &key);`;
    assert.equal(hx10w2R08(src),
        `let mut type_: Value = self.options.as_map().and_then(|__m| key.as_str().and_then(|__k| __m.get(__k))).cloned().unwrap_or(${N});`);
});

test('in_op on an exchange state field goes native', () => {
    assert.equal(hx10w2R08(`if (in_op(&self.positions, &symbol)) { return; }`),
        `if (self.positions.as_map().is_some_and(|__m| symbol.as_str().is_some_and(|__k| __m.contains_key(__k)))) { return; }`);
    assert.equal(hx10w2R08(`if (in_op(&self.has, &Value::Str("fetchOrders".into()))) { }`),
        `if (self.has.as_map().is_some_and(|__m| __m.contains_key("fetchOrders"))) { }`);
});

test('add_element_to_object on an exchange state field inserts natively', () => {
    assert.equal(hx10w2R08(`add_element_to_object(&mut self.headers, &Value::Str("k".into()), v);`),
        `if let Value::Dict(__r08d) = &mut self.headers { std::sync::Arc::make_mut(__r08d).insert("k".to_string(), v); };`);
});

test('a nested write through a state field keeps both levels', () => {
    const src = `add_element_to_object(get_value_mut(&mut self.options, &Value::Str("ws".into())), &Value::Str("listenKey".into()), listenKey.clone());`;
    const out = hx10w2R08(src);
    assert.ok(out.includes(`if let Value::Dict(__r08a) = &mut self.options`), out);
    assert.ok(out.includes(`.entry("ws".to_string()).or_insert(${N})`), out);
    assert.ok(out.includes(`.insert("listenKey".to_string(), listenKey.clone())`), out);
    assert.ok(!out.includes('get_value_mut('), out);
});

test('a chained read with a literal key goes native', () => {
    const src = `let mut x: Value = get_value(&self.urls.as_map().and_then(|__m| __m.get("api")).cloned().unwrap_or(${N}), &Value::Str("public".into()));`;
    assert.equal(hx10w2R08(src),
        `let mut x: Value = self.urls.as_map().and_then(|__m| __m.get("api")).cloned().unwrap_or(${N}).as_map().and_then(|__m| __m.get("public")).cloned().unwrap_or(${N});`);
});

test('the ws client handle keeps its live-overlay helper', () => {
    const src = `if (in_op(&get_value(&client, &Value::Str("futures".into())), &hash)) { }`;
    assert.equal(hx10w2R08(src), src);
});

test('a marker key on a fetched value keeps the helper', () => {
    const src = `let mut hm: Value = get_value(&self.tickers.as_map().and_then(|__m| __m.get("s")).cloned().unwrap_or(${N}), &Value::Str("hashmap".into()));`;
    assert.equal(hx10w2R08(src), src);
});

test('a computed key keeps add_element_to_object', () => {
    const src = `add_element_to_object(&mut self.markets, &parsed.as_map().and_then(|__m| __m.get("market")).cloned().unwrap_or(${N}), parsed.clone());`;
    assert.equal(hx10w2R08(src), src);
});

test('remove keeps its helper and &mut get_value(..) is not read-rewritten', () => {
    const src = `remove(&mut get_value(&self.ohlcvs, &symbol), &timeframe);`;
    assert.equal(hx10w2R08(src), src);
});

test('the rewrite is idempotent', () => {
    const src = `add_element_to_object(&mut self.options, &Value::Str("k".into()), v);\nlet mut x: Value = get_value(&self.balance, &t);`;
    const once = hx10w2R08(src);
    assert.notEqual(once, src);
    assert.equal(hx10w2R08(once), once);
});
