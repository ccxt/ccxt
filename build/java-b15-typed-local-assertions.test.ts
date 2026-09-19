// hx3 B-15: the `as T` shapes the safeDict / safeList / market typed-local families accept.
//
//   npx tsx build/java-b15-typed-local-assertions.test.ts
//
// Two proofs, both on the real Java printer with the real classifier hooks installed
// (installJavaLocalTypes, the installer the driver and the pooled workers use):
//
//   (a) INITIALIZER — `const x = this.safeDict (…) as Dict`: the printer emits the bare
//       operand for every asserted type outside any/string/T[] (javaTranspiler
//       .printAsExpression), so the family proof runs on the inner call.
//   (b) LATER USE — a Map/List local used through an admitted assertion (`as Dict`,
//       `as any`, a class) prints the identity or an upcast, so the D2 audit accepts it.
//
// Every case is written so a tree without the change fails it (the negatives pass there too).
import { Transpiler } from 'ast-transpiler';
import { installJavaLocalTypes } from './java-local-types.js';

const config: any = {
    verbose: false,
    java: {
        asyncSupplier: 'BaseExchange.supplyAsync',
    },
};

const transpiler = new Transpiler (config);
installJavaLocalTypes (transpiler);

const MAP = 'java.util.Map<String, Object>';
const LIST = 'java.util.List<Object>';
const transpile = (source: string): any => (transpiler as any).transpileJava (source).content;

let failures = 0;
const check = (name: string, source: string, expected: string, forbidden?: string) => {
    const output: any = transpile (source);
    const ok = output.includes (expected) && (forbidden === undefined || !output.includes (forbidden));
    console.log ((ok ? 'ok   ' : 'FAIL ') + name);
    if (!ok) {
        failures++;
        console.log ('  expected: ' + expected + (forbidden === undefined ? '' : '  (and not: ' + forbidden + ')'));
        console.log ('  actual:   ' + output.trim ().replace (/\s+/g, ' ').slice (0, 300));
    }
};
const classOf = (body: string) =>
    "class Test {\n" +
    "    f (a, b, id, symbol) {\n" +
    body +
    "    }\n" +
    "    safeDict (d, k, ...args) { return undefined }\n" +
    "    safeList (d, k, ...args) { return undefined }\n" +
    "    market (s) { return undefined }\n" +
    "    safeValue (d, k) { return undefined }\n" +
    "}\n";

// (a) an `as Dict` initializer asserts nothing the printer prints -> the inner call proves
check ('safeDict (...) as Dict is typed',
    classOf ("        const x = this.safeDict (a, b) as Dict\n        return x\n"),
    `${MAP} x = (${MAP}) this.safeDict(a, b)`,
    `Object x = this.safeDict(a, b)`);

check ('safeDict (..., {}) as Dict is typed',
    classOf ("        const x = this.safeDict (a, b, {}) as Dict\n        return x\n"),
    `${MAP} x = (${MAP}) this.safeDict(a, b, new java.util.HashMap<String, Object>() {{}})`,
    `Object x = this.safeDict(a, b, new java.util.HashMap`);

// `as any[]` prints (java.util.List<Object>)(x) — an inconvertible checkcast on a Map family
check ('safeDict (...) as any[] keeps Object',
    classOf ("        const x = this.safeDict (a, b) as any[]\n        return x\n"),
    `Object x = (java.util.List<Object>)(this.safeDict(a, b))`,
    `${MAP} x = `);

// `as string` prints ((String) x) -> the family must not take the assertion
check ('safeDict (...) as string keeps Object',
    classOf ("        const x = this.safeDict (a, b) as string\n        return x\n"),
    `Object x = ((String)this.safeDict(a, b))`,
    `${MAP} x = `);

check ('market (...) as Market is typed',
    classOf ("        const m = this.market (symbol) as Market\n        return m\n"),
    `${MAP} m = (${MAP}) this.market(symbol)`,
    `Object m = this.market(symbol)`);

// (b) later uses: the printer drops a `as Dict` assertion (bare operand) and upcasts `as any`
check ('a later `as Dict` read keeps the local typed',
    classOf ("        const x = this.safeDict (a, b)\n        const y = (x as Dict)['k']\n        return y\n"),
    `${MAP} x = (${MAP}) this.safeDict(a, b)`,
    `Object x = this.safeDict(a, b)`);

check ('a later `as any` use keeps the local typed',
    classOf ("        const x = this.safeDict (a, b)\n        return this.safeValue (a, x as any)\n"),
    `${MAP} x = (${MAP}) this.safeDict(a, b)`,
    `Object x = this.safeDict(a, b)`);

check ('a later `as string` use keeps Object',
    classOf ("        const x = this.safeDict (a, b)\n        return x as string\n"),
    `Object x = this.safeDict(a, b)`,
    `${MAP} x = (${MAP}) this.safeDict(a, b)`);

// D2 stays enforced: a later write of another printed type keeps the box
check ('a later list write keeps Object',
    classOf ("        let x = this.safeDict (a, b)\n        x = this.safeValue (a, 'k')\n        return x\n"),
    `Object x = this.safeDict(a, b)`,
    `${MAP} x = (${MAP}) this.safeDict(a, b)`);

console.log (failures === 0 ? '\nall B-15 typed-local assertion checks passed' : '\n' + failures + ' check(s) failed');
if (failures > 0) {
    process.exit (1);
}
