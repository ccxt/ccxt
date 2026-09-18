// Emission checks for build/rustTranspiler.ts#nativeMutSelfCoerceMutSites.
//
//   npx tsx build/rust-native-coerce-mut.test.ts
//
// The pass turns the `&self` encoding of a nested-key write
// (`get_value_mut(unsafe { crate::runtime::coerce_value_to_mut(&self.options) }, &k1)`)
// into a real mutable field borrow once the enclosing method is `&mut self`.
// The "native" cases below fail on a tree where the pass is not installed (the
// unsafe cast is still in the output); the "keeps the cast" cases fail if the
// receiver or the `self`-conflict guard is loosened.
import * as rustTranspiler from './rustTranspiler.js';

const Builder: any = (rustTranspiler as any).RustTranspilerBuilder;
const t: any = Builder ? new Builder() : null;
// Absent pass (pre-change tree) -> identity, so the emission checks fail below.
const run = (source: string): string =>
    (t && typeof t.nativeMutSelfCoerceMutSites === 'function') ? t.nativeMutSelfCoerceMutSites(source) : source;

let failures = 0;
const check = (name: string, source: string, expected: string[], forbidden: string[] = []) => {
    const output: string = run(source);
    const ok = expected.every(e => output.includes(e)) && forbidden.every(f => !output.includes(f));
    console.log((ok ? 'ok   ' : 'FAIL ') + name);
    if (!ok) {
        failures++;
        console.log('  expected: ' + expected.join(' | '));
        if (forbidden.length) console.log('  and not:  ' + forbidden.join(' | '));
        console.log('  actual:   ' + output.trim().replace(/\s+/g, ' ').slice(0, 400));
    }
};

const CAST = 'crate::runtime::coerce_value_to_mut(&self.balance)';

// `&mut self` method: the real field is borrowable -> native.
check('&mut self method',
    `pub fn handle_balance(&mut self, message: Value) {
        add_element_to_object(get_value_mut(unsafe { crate::runtime::coerce_value_to_mut(&self.balance) }, &accountType), &Value::Str("info".to_string()), message.clone());
    }`,
    ['get_value_mut(&mut self.balance,'],
    [CAST]);

// async receivers are the common WS handler shape.
check('pub async fn &mut self method',
    `pub async fn load_balance_snapshot(&mut self, client: Value) {
        add_element_to_object(get_value_mut(unsafe { crate::runtime::coerce_value_to_mut(&self.ohlcvs) }, &symbol), &timeframe, stored.clone());
    }`,
    ['get_value_mut(&mut self.ohlcvs,'],
    ['coerce_value_to_mut(&self.ohlcvs)']);

// nested-key chain: the cast sits inside two get_value_mut wrappers.
check('nested get_value_mut chain',
    `pub fn create_auth(&mut self, args: &[Value]) {
        add_element_to_object(get_value_mut(get_value_mut(get_value_mut(unsafe { crate::runtime::coerce_value_to_mut(&self.options) }, &Value::Str("auths".to_string())), &accountIndex), &apiKeyIndex), &Value::Str("token".to_string()), token.clone());
    }`,
    ['get_value_mut(get_value_mut(get_value_mut(&mut self.options,'],
    ['coerce_value_to_mut']);

// a `self` reference in a previous statement (the `__be_tmp` hoist) is not a
// conflict — the mutable borrow ends at the end of its own statement.
check('self in a preceding statement',
    `pub fn handle_balance(&mut self, timestamp: Value) {
        { let __be_tmp = self.iso8601(timestamp.clone()); add_element_to_object(get_value_mut(unsafe { crate::runtime::coerce_value_to_mut(&self.balance) }, &accountType), &Value::Str("datetime".to_string()), __be_tmp); };
    }`,
    ['get_value_mut(&mut self.balance,'],
    [CAST]);

// ---- cases that must keep the cast ----

// `&self` method: `&mut self.balance` would not compile.
check('&self method keeps the cast',
    `pub fn request_id(&self, url: Value) -> Value {
        add_element_to_object(get_value_mut(unsafe { crate::runtime::coerce_value_to_mut(&self.options) }, &Value::Str("requestId".to_string())), &url, newValue.clone());
    }`,
    ['get_value_mut(unsafe { crate::runtime::coerce_value_to_mut(&self.options) },'],
    ['get_value_mut(&mut self.options,']);

// `&mut self` but a later arg of the same call touches `self` (a method call
// here): `&mut self.balance` + `&self` is E0502.
check('self in a later arg keeps the cast',
    `pub fn handle_balance(&mut self, message: Value) {
        add_element_to_object(get_value_mut(unsafe { crate::runtime::coerce_value_to_mut(&self.balance) }, &accountType), &code, self.safe_string(message.clone(), "code"));
    }`,
    ['get_value_mut(unsafe { crate::runtime::coerce_value_to_mut(&self.balance) },'],
    ['get_value_mut(&mut self.balance,']);

// `self.<field>` read in the value arg of the same call.
check('field read in a later arg keeps the cast',
    `pub fn set_balance_cache(&mut self, type_var: Value) {
        add_element_to_object(get_value_mut(unsafe { crate::runtime::coerce_value_to_mut(&self.balance) }, &type_var), &type_var, self.balance.clone());
    }`,
    ['get_value_mut(unsafe { crate::runtime::coerce_value_to_mut(&self.balance) },'],
    ['get_value_mut(&mut self.balance,']);

// A cast that is not the receiver of an `add_element_to_object` call is left
// alone (the pass only proves the receiver position).
check('non add_element_to_object receiver keeps the cast',
    `pub fn helper(&mut self, x: Value) -> Value {
        get_value_mut(unsafe { crate::runtime::coerce_value_to_mut(&self.options) }, &x)
    }`,
    ['crate::runtime::coerce_value_to_mut(&self.options)'],
    ['get_value_mut(&mut self.options,']);

console.log(failures === 0 ? 'all checks passed' : failures + ' check(s) failed');
process.exit(failures === 0 ? 0 : 1);
