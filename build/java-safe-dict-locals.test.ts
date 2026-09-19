// safeDict-local checks for build/java-local-types.js#safeDictLocalType (JAVA-01).
//
//   npx tsx build/java-safe-dict-locals.test.ts
//
// Transpiles small TS snippets through the real Java printer with the real classifier hooks
// installed (the same installJavaLocalTypes the driver and the pooled workers use) and asserts
// that `const x = this.safeDict (a, b [, {}])` prints a `java.util.Map<String, Object>`
// declaration with the accessor's checkcast, that every other shape (a data-carrying default,
// a later write of another type, a later tuple-destructuring write, a `return x as <type>`, an
// argument position, safeValue) keeps `Object`, and that a later same-family write takes the
// reassignment checkcast. On a tree without the family the declaration stays
// `Object x = this.safeDict (…)`, so every "typed" case below fails there.
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
const transpile = (source: string): any => (transpiler as any).transpileJava (source).content;

let failures = 0;
const check = (name: string, source: string, expected: string, forbidden?: string) => {
    const output: any = transpile (source);
    const ok = output.includes (expected) && (forbidden === undefined || !output.includes (forbidden));
    console.log ((ok ? 'ok   ' : 'FAIL ') + name);
    if (!ok) {
        failures++;
        console.log ('  expected: ' + expected + (forbidden ? '  (and not: ' + forbidden + ')' : ''));
        console.log ('  actual:   ' + output.trim ().replace (/\s+/g, ' ').slice (0, 400));
    }
};
const classOf = (body: string) =>
    "class Test {\n" +
    "    f (a, b, id) {\n" +
    body +
    "    }\n" +
    "    safeDict (d, k, ...args) { return undefined }\n" +
    "    safeValue (d, k) { return undefined }\n" +
    "    safeString (d, k) { return undefined }\n" +
    "    safeCurrency (id) { return undefined }\n" +
    "    handleOptionAndParams2 (d, k, k2) { return undefined }\n" +
    "}\n";

// 1. plain two-argument safeDict -> Map declaration with the accessor's checkcast
check ('safeDict (a, b) -> Map<String, Object> + checkcast',
    classOf ("        const x = this.safeDict (a, b)\n        return x\n"),
    `${MAP} x = (${MAP}) this.safeDict(a, b)`,
    "Object x = this.safeDict(a, b)");

// 2. empty-map default is the same box ({} prints a HashMap literal)
check ('safeDict (a, b, {}) -> Map<String, Object> + checkcast',
    classOf ("        const x = this.safeDict (a, b, {})\n        return x\n"),
    `${MAP} x = (${MAP}) this.safeDict(a, b, new java.util.HashMap<String, Object>() {{}})`,
    "Object x = this.safeDict(a, b, new java.util.HashMap");

// 3. reads keep their helper calls (the typing changes no consumer)
check ('reads keep their helper calls',
    classOf ("        const x = this.safeDict (a, b)\n        return this.safeString (x, 'k')\n"),
    `${MAP} x = (${MAP}) this.safeDict(a, b)`,
    `((${MAP}) x)`);

// 4. a data-carrying default is handed back raw by the accessor -> stays Object, no cast
check ('a non-empty default keeps Object',
    classOf ("        const x = this.safeDict (a, b, 'NOTIONAL')\n        return x\n"),
    "Object x = this.safeDict(a, b, \"NOTIONAL\")",
    `(${MAP}) this.safeDict(a, b, \"NOTIONAL\")`);

// 5. an expression default could be any box -> stays Object
check ('a variable default keeps Object',
    classOf ("        const x = this.safeDict (a, b, id)\n        return x\n"),
    "Object x = this.safeDict(a, b, id)",
    `(${MAP}) this.safeDict(a, b, id)`);

// 6. D2: a later write of another printed type keeps the Object declaration
check ('a later write of another type keeps Object',
    classOf ("        let x = this.safeDict (a, b)\n        x = this.safeString (a, 'k')\n        return x\n"),
    "Object x = this.safeDict(a, b)",
    `${MAP} x = (${MAP}) this.safeDict(a, b)`);

// 7. D2: a following tuple-destructuring write keeps the Object declaration
check ('a later destructuring write keeps Object',
    classOf ("        let x = this.safeDict (a, b)\n        let y\n        [ y, x ] = this.handleOptionAndParams2 (a, 'editOrders', 'papi')\n        return x\n"),
    "Object x = this.safeDict(a, b)",
    `${MAP} x = (${MAP}) this.safeDict(a, b)`);

// 8. hx3 B-15: a `return x as <type>` site no longer forces Object — the printer drops a
// TypeReference assertion (printAsExpression falls through to the operand), so the printed
// statement is the SAME as with the Object declaration. `x as string` / `x as any[]` still
// print a cast and keep Object (see java-b15-typed-local-assertions.test.ts).
check ('a later as-cast to a structure type keeps the local typed',
    classOf ("        const x = this.safeDict (a, b)\n        return x as Ticker\n"),
    `${MAP} x = (${MAP}) this.safeDict(a, b)`,
    "Object x = this.safeDict(a, b)");

// 9. a later write that IS a structure box (safeCurrency) takes the reassignment checkcast
check ('a later structure-box write takes the reassignment cast',
    classOf ("        let x = this.safeDict (a, b)\n        x = this.safeCurrency (id)\n        return x\n"),
    `x = (${MAP}) this.safeCurrency(id)`);

// 10. only a declaration is typed: the same call in an argument position is untouched
check ('an argument position is not typed',
    classOf ("        return this.safeString (this.safeDict (a, b), 'k')\n"),
    "this.safeString(this.safeDict(a, b), \"k\")",
    `Object x = (${MAP}) this.safeDict`);

// 11. safeValue locals stay Object (the other half of the unit line)
check ('safeValue locals stay Object',
    classOf ("        const x = this.safeValue (a, b)\n        return x\n"),
    "Object x = this.safeValue(a, b)",
    `${MAP} x = `);

console.log (failures === 0 ? '\nall safeDict-local checks passed' : '\n' + failures + ' check(s) failed');
if (failures > 0) {
    process.exit (1);
}
