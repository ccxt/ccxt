// Typed-local emission checks for build/csharp-local-types.js#CSHARP_LOCAL_THIS_RETURN_TYPES /
// CSHARP_NUMERIC_RETURN_TYPES (the safeInteger/safeNumber/safeFloat family).
//
//   npx tsx build/csharp-safe-numeric-locals.test.ts
//
// Transpiles small TS snippets through the real printer with the real C# classifier hooks
// installed (the same setupCsharpPrinter the driver and the pooled workers use) and asserts the
// declaration type the family's locals get. `safeIntegerOmitZero` is the member whose C#
// signature the classifier used to leave `object`: without its two table entries the local
// prints `object x = ...` and the generated method keeps the `object` return type.
import { Transpiler } from 'ast-transpiler';
import { setupCsharpPrinter } from './csharp-worker.js';

const config: any = {
    verbose: false,
    csharp: {
        parser: {
            NUM_LINES_END_FILE: 0,
            'ELEMENT_ACCESS_WRAPPER_OPEN': 'getValue(',
            'ELEMENT_ACCESS_WRAPPER_CLOSE': ')',
        },
    },
};

const transpiler = new Transpiler (config);
setupCsharpPrinter (transpiler);

let failures = 0;
const check = (name: string, source: string, expected: string, forbidden?: string) => {
    const output: string = (transpiler as any).transpileCSharp (source).content;
    const ok = output.includes (expected) && (forbidden === undefined || !output.includes (forbidden));
    console.log ((ok ? 'ok   ' : 'FAIL ') + name);
    if (!ok) {
        failures++;
        console.log ('  expected: ' + expected + (forbidden ? '  (and not: ' + forbidden + ')' : ''));
        console.log ('  actual:   ' + output.trim ().replace (/\s+/g, ' ').slice (0, 400));
    }
};

// the local takes the helper's Int64? signature (boxed Int64 or null, never 0)
check ('safeIntegerOmitZero local -> Int64?',
    'function f (t) { const x = this.safeIntegerOmitZero (t, "ts"); return x; }',
    'Int64? x =',
    'object x =');

// D2: a later write of a different printed type keeps the box
check ('safeIntegerOmitZero local with an int write stays object',
    'function f (t) { let x = this.safeIntegerOmitZero (t, "ts"); x = 0; return x; }',
    'object x =',
    'Int64? x =');

// the sibling member was already mapped; keep it pinned here so the pair stays in sync
check ('safeNumberOmitZero local -> double?',
    'function f (t) { const x = this.safeNumberOmitZero (t, "ts"); return x; }',
    'double? x =',
    'object x =');

// the generated base method: every path returns null or the safeInteger box, so the C#
// signature becomes Int64? and the returns unbox through object (the object declaration
// and the null literal are the shapes the wrap skips)
check ('safeIntegerOmitZero signature -> Int64?',
    'class C { safeIntegerOmitZero (obj, key, defaultValue = undefined) { const timestamp = this.safeInteger (obj, key, defaultValue); if (timestamp === undefined || timestamp === 0) { return undefined; } return timestamp; } }',
    'Int64? safeIntegerOmitZero',
    'object safeIntegerOmitZero');

console.log (failures === 0 ? 'all checks passed' : failures + ' check(s) failed');
process.exit (failures === 0 ? 0 : 1);