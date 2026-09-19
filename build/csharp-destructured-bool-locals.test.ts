// Tuple-destructured bool local checks for build/csharp-local-types.js (B-22).
//
//   npx tsx build/csharp-destructured-bool-locals.test.ts
//
// `let x = false; [ x, params ] = this.handleOptionAndParams (...)` — element 0 of the
// helper is the caller's RAW params value (any JSON box), so the declaration only becomes
// `bool`/`bool?` together with the `x = isTrue (((IList<object>)tmp)[0]);` coercion, and only
// while EVERY read of x is a truthiness position (`if (x)`, `!x`, `x ?:`, `x || y`).
// A read that observes the value itself (a comparison, an argument, a return) keeps the
// printer's `object` declaration and the isTrue wrapper.
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
        console.log ('  actual:   ' + output.trim ().replace (/\s+/g, ' ').slice (0, 400));
    }
};

// bool literal initializer + a truthiness-only read: declared bool, element coerced, read bare
check ('paginate: bool declaration + isTrue coercion + bare read',
    'function f (params) { let paginate = false; [ paginate, params ] = this.handleOptionAndParams (params, "fetchOHLCV", "paginate", false); if (paginate) { return 1; } return 0; }',
    'bool paginate = false;',
    'object paginate');

check ('coerced element write', 
    'function f (params) { let paginate = false; [ paginate, params ] = this.handleOptionAndParams (params, "fetchOHLCV", "paginate", false); if (paginate) { return 1; } return 0; }',
    'isTrue(((IList<object>)paginateparametersVariable)[0]);');

check ('read prints bare',
    'function f (params) { let paginate = false; [ paginate, params ] = this.handleOptionAndParams (params, "fetchOHLCV", "paginate", false); if (paginate) { return 1; } return 0; }',
    'if (paginate)',
    'isTrue(paginate)');

// `let x: Bool = undefined` + null init: the nullable spelling, compared with `== true`
check ('isPortfolioMargin: bool? declaration + (x == true) read',
    'function f (params) { let isPortfolioMargin: Bool = undefined; [ isPortfolioMargin, params ] = this.handleOptionAndParams2 (params, "fetchBalance", "papi", "portfolioMargin", false); if (isPortfolioMargin || isPortfolioMargin) { return 1; } return 0; }',
    'bool? isPortfolioMargin = null;',
    'object isPortfolioMargin');

// `!x` is a truthiness position as well
check ('negated read keeps the family',
    'function f (params) { let paginate = false; [ paginate, params ] = this.handleOptionAndParams (params, "x", "paginate"); if (!paginate) { return 1; } return 0; }',
    'bool paginate = false;');

// a read that observes the VALUE (a comparison) is not a truthiness position: object + isTrue
check ('value-observing read stays object',
    'function f (params) { let paginate = false; [ paginate, params ] = this.handleOptionAndParams (params, "x", "paginate"); if (paginate === true) { return 1; } return 0; }',
    'object paginate = false;',
    'bool paginate');

// element 1 (the caller's params dict) is never the coerced value
check ('params element keeps its shape',
    'function f (params) { let paginate = false; [ paginate, params ] = this.handleOptionAndParams (params, "x", "paginate"); if (paginate) { return 1; } return 0; }',
    'parameters = ((IList<object>)paginateparametersVariable)[1];');

// a helper outside the audited list keeps the cast-proven read (handleParamBool -> bool?)
check ('handleParamBool keeps the (bool?) cast',
    'function f (params) { let hedged: Bool = undefined; [ hedged, params ] = this.handleParamBool (params, "hedged", false); if (hedged === true) { return 1; } return 0; }',
    'hedged = (bool?)((IList<object>)hedgedparametersVariable)[0];');

console.log (failures === 0 ? 'all checks passed' : (failures + ' checks failed'));
if (failures !== 0) {
    process.exit (1);
}
