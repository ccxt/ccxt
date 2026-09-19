// Currency-locals emission checks for build/go-local-types.js#ccxtGoTypeOfCurrencyInitializer
// and #ccxtGoUnboxCurrencyDeclaration.
//
//   npx tsx build/go-currency-locals.test.ts
//
// Transpiles small TS snippets through the real Go printer with the real classifier hooks
// installed (the same installCcxtGoLocalTypes the driver and the pooled workers use) and asserts
// that a declaration initialised by `this.currency (..)` / `this.safeCurrency (..)` is named
// map[string]any, that its accessor call is unboxed, and that its `currency['id']` reads print as
// the native map index. On a tree without the emission installed the declaration stays `any` and
// the reads stay `GetValue (..)`, so every "typed" case below fails there.
import { Transpiler } from 'ast-transpiler';
import { installCcxtGoLocalTypes, installCcxtGoIndexableTypes } from './go-local-types.js';

const config: any = {
    verbose: false,
    go: {
        asyncMethodSuffix: 'Async',
    },
};

const transpiler = new Transpiler (config);
installCcxtGoLocalTypes ((transpiler as any).goTranspiler);
installCcxtGoIndexableTypes ((transpiler as any).goTranspiler);

const transpile = (source: string): any => (transpiler as any).transpileGo (source).content;

let failures = 0;
const check = (name: string, source: string, expected: string, forbidden?: string) => {
    const output: any = transpile (source);
    const ok = output.includes (expected) && (forbidden === undefined || !output.includes (forbidden));
    console.log ((ok ? 'ok   ' : 'FAIL ') + name);
    if (!ok) {
        failures++;
        console.log ('  expected: ' + expected + (forbidden ? '  (and not: ' + forbidden + ')' : ''));
        console.log ('  actual:   ' + output.trim ().replace (/\s+/g, ' ').slice (0, 300));
    }
};

// the accessor calls a real exchange class needs; nothing here is typed by the checker
const classOf = (body: string) =>
    "class Test {\n" +
    "    f (code, id) {\n" +
    body +
    "    }\n" +
    "    currency (code) { return this.currencies[code] }\n" +
    "    safeCurrency (id) { return this.currencies[id] }\n" +
    "    safeString (x, k) { return x[k] }\n" +
    "}\n";

// this.currency (code): map declaration + unboxed accessor call + native read
check ('this.currency -> map[string]any + native read',
    classOf ("        const currency = this.currency (code)\n        return currency['id']\n"),
    "var currency map[string]any = this.Currency(code).(map[string]any)",
    "GetValue(currency");

// this.safeCurrency (id): same shape
check ('this.safeCurrency -> map[string]any + native read',
    classOf ("        const currency = this.safeCurrency (id)\n        return currency['code']\n"),
    "var currency map[string]any = this.SafeCurrency(id).(map[string]any)",
    "GetValue(currency");

// a read that is not an element access keeps the helper call on the typed local
check ('other names keep their helper calls',
    classOf ("        const currency = this.currency (code)\n        return this.safeString (currency, 'code')\n"),
    "this.SafeString(currency, \"code\")",
    "(map[string]any)).(map[string]any)");

// the local must not be re-assigned any other type: the printer's own later-writes
// scan keeps the `any` declaration, and the accessor call stays un-unboxed
check ('a later write of another type keeps the declaration `any`',
    classOf ("        let currency = this.currency (code)\n        currency = this.safeString (code, 'x')\n        return currency['id']\n"),
    "var currency any = this.Currency(code)",
    "map[string]any = this.Currency(code)");

// only a declaration initializer is typed: the same call as an argument is untouched
check ('an argument position is not typed or unboxed',
    classOf ("        return this.safeString (this.safeCurrency (id), 'code')\n"),
    "this.SafeString(this.SafeCurrency(id), \"code\")",
    "(map[string]any)");

// no double unbox when the printer re-prints the same declaration
check ('the unbox is emitted once',
    classOf ("        const currency = this.currency (code)\n        return currency['id']\n"),
    ".(map[string]any)",
    ".(map[string]any).(map[string]any)");

console.log (failures === 0 ? '\nall currency-local checks passed' : '\n' + failures + ' check(s) failed');
if (failures > 0) {
    process.exit (1);
}
