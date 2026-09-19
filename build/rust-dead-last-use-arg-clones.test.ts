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
