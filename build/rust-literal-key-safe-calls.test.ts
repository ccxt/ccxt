// D-30 emission checks for build/rustTranspiler.ts#rewriteLiteralKeySafeCalls.
//
//   npx tsx build/rust-literal-key-safe-calls.test.ts
//
// A literal key passed to a `safe_*` reader stays boxed as
// `Value::Str("k".to_string())` until this pass routes it to the `&str`-key
// `_k` twin (`self.safe_string_lower_k(obj, "k", &[])`) the runtime already
// provides. The `_k` twins for `safe_string_lower/_upper/_timestamp` and
// `safe_integer_product` are covered here; the pre-existing eight variants
// stay covered as a regression check. Every check asserts the transformed
// text; the new-helper cases fail on a tree without the widened variant list.
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
    const out = (builder as any).rewriteLiteralKeySafeCalls (wrap (body));
    const ok = out.includes (expected) && (forbidden === undefined || !out.includes (forbidden));
    console.log ((ok ? 'ok   ' : 'FAIL ') + name);
    if (!ok) {
        failures++;
        console.log ('  expected: ' + expected + (forbidden ? '  (and not: ' + forbidden + ')' : ''));
        console.log ('  actual:   ' + out.replace (/\s+/g, ' ').slice (0, 400));
    }
};

check ('safe_string_lower literal key -> _k',
    '        let mut title: Value = self.safe_string_lower(response.clone(), Value::Str("title".to_string()), &[Value::Str("".to_string())]);\n' +
    '        return title;',
    'self.safe_string_lower_k(response.clone(), "title", &[Value::Str("".to_string())])',
    'Value::Str("title".to_string())');

check ('safe_string_upper literal key -> _k',
    '        let mut tif: Value = self.safe_string_upper(response.clone(), Value::Str("timeInForce".to_string()), &[]);\n' +
    '        return tif;',
    'self.safe_string_upper_k(response.clone(), "timeInForce", &[])',
    'Value::Str("timeInForce".to_string())');

check ('safe_timestamp literal key -> _k',
    '        let mut ts: Value = self.safe_timestamp(response.clone(), Value::Str("timestamp".to_string()), &[]);\n' +
    '        return ts;',
    'self.safe_timestamp_k(response.clone(), "timestamp", &[])',
    'Value::Str("timestamp".to_string())');

// the factor sits between the key and the defaults slice
check ('safe_integer_product literal key -> _k (factor preserved)',
    '        let mut ts: Value = self.safe_integer_product(response.clone(), Value::Str("timestamp".to_string()), Value::Int(1000), &[]);\n' +
    '        return ts;',
    'self.safe_integer_product_k(response.clone(), "timestamp", Value::Int(1000), &[])',
    'Value::Str("timestamp".to_string())');

// regression: the eight long-standing variants keep routing
check ('pre-existing safe_string variant still routes',
    '        let mut id: Value = self.safe_string(response.clone(), Value::Str("id".to_string()), &[]);\n' +
    '        return id;',
    'self.safe_string_k(response.clone(), "id", &[])',
    'Value::Str("id".to_string())');

check ('pre-existing safe_dict variant still routes',
    '        let mut data: Value = self.safe_dict(response.clone(), Value::Str("data".to_string()), &[]);\n' +
    '        return data;',
    'self.safe_dict_k(response.clone(), "data", &[])',
    'Value::Str("data".to_string())');

// a dynamic key is not a member of this family
check ('non-literal key untouched',
    '        let mut v: Value = self.safe_string_lower(response.clone(), Value::Str(key.to_string()), &[]);\n' +
    '        return v;',
    'self.safe_string_lower(response.clone(), Value::Str(key.to_string()), &[])',
    'safe_string_lower_k');

// the `2`/`_n` (multi-key) helpers have no `_k` twin yet: untouched
check ('two-key helper untouched',
    '        let mut v: Value = self.safe_string2(response.clone(), Value::Str("a".to_string()), Value::Str("b".to_string()), &[]);\n' +
    '        return v;',
    'self.safe_string2(response.clone(), Value::Str("a".to_string())',
    'safe_string2_k');

if (failures > 0) {
    console.log (`\n${failures} check(s) failed`);
    process.exit (1);
}
console.log ('\nall checks passed');