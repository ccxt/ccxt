// Safe-string local typing checks for build/csharp-local-types.js (cs-24).
//
//   npx tsx build/csharp-safe-string-locals.test.ts
//
// `let x = this.safeString* (...)` is declared `string?` when every later write is
// compatible. A conditional write that reads x in one arm (`x = cond ? 'lit' : x`, printed
// unchanged) is proven against the declaration's own `string?` spelling
// (selfTernaryStringWriteType); a local of any other family, or a conditional whose other
// arm is not a proven string, keeps `object`.
import { Transpiler } from 'ast-transpiler';
import { setupCsharpPrinter } from './csharp-worker.js';

const config: any = {
    verbose: false,
    csharp: {
        parser: {
            NUM_LINES_END_FILE: 0,
            'ELEMENT_ACCESS_WRITE': 'getValue(',
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
        console.log ('  actual:   ' + output.trim ().replace (/\s+/g, ' ').slice (0, 300));
    }
};

// the two residual shapes the family's scan used to reject
check ('safeString + self ternary in the false arm',
    'function f (marginMode) { let marginType = this.safeString (marginMode, "marginMode"); marginType = (marginType === "crossed") ? "cross" : marginType; return marginType; }',
    'string? marginType = ',
    'object marginType');

check ('safeString2 + self ternary in the true arm',
    'function f (contract) { let interval = this.safeString2 (contract, "ratePeriod", "fundingRateInterval"); interval = (interval === undefined) ? "" : interval; return interval; }',
    'string? interval = ',
    'object interval');

// the same shape from a non-family local: the declaration keeps the printer's `object`
check ('safeValue local with the same self ternary stays object',
    'function f (order) { let x = this.safeValue (order, "filled"); x = (x === undefined) ? "0" : x; return x; }',
    'object x = ',
    'string? x = ');

// family local, but the other arm is not a proven string
check ('safeString + self ternary with an untyped other arm stays object',
    'function f (order, other) { let x = this.safeString (order, "filled"); x = (x === undefined) ? other : x; return x; }',
    'object x = ',
    'string? x = ');

console.log (failures === 0 ? 'all checks passed' : (failures + ' checks failed'));
if (failures !== 0) {
    process.exit (1);
}