// safeValue dict-twin emission checks for build/csharp-local-types.js (the cs-03 family).
//
//   npx tsx build/csharp-safevalue-dict-locals.test.ts
//
// Transpiles small TS snippets through the real printer with the real C# classifier hooks
// installed (setupCsharpPrinter) and asserts which `const x = this.safeValue (recv, 'key')`
// locals name their box. On a tree without the family every case prints `object x = ...`.
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
const check = (name: string, body: string, expected: string, forbidden?: string) => {
    const source = 'class Test {'
        + ' safeValue (o: any, k: string, d?: any) { return o[k]; }'
        + ' safeDict (o: any, k: string, d?: any) { return o[k]; }'
        + ' safeList (o: any, k: string, d?: any) { return o[k]; }'
        + ' f (response) { ' + body + ' } }';
    const output: string = (transpiler as any).transpileCSharp (source).content;
    const ok = output.includes (expected) && (forbidden === undefined || !output.includes (forbidden));
    console.log ((ok ? 'ok   ' : 'FAIL ') + name);
    if (!ok) {
        failures++;
        console.log ('  expected: ' + expected + (forbidden ? '  (and not: ' + forbidden + ')' : ''));
        console.log ('  actual:   ' + output.trim ().replace (/\s+/g, ' ').slice (0, 300));
    }
};

// a same-file safeDict twin for the SAME (identifier receiver, literal key) pair: the box is the
// decoded JSON dictionary, so the declaration names it behind the exact cast back
check ('safeValue + dict twin -> IDictionary behind the cast',
    'const data = this.safeValue (response, "data"); const twin = this.safeDict (response, "data"); return [ data, twin ];',
    'IDictionary<string, object> data = ((IDictionary<string, object>)this.safeValue(response, "data"));');

// the same shape with a `{}` default on the candidate site
check ('safeValue dict default + dict twin',
    'const data = this.safeValue (response, "data", {}); const twin = this.safeDict (response, "data", {}); return [ data, twin ];',
    'IDictionary<string, object> data = ((IDictionary<string, object>)this.safeValue(response, "data", new Dictionary<string, object>() {}));');

// a list twin for the same pair contradicts the shape: the local keeps `object`
check ('safeValue with a list twin stays object',
    'const data = this.safeValue (response, "data"); const twin = this.safeList (response, "data", []); return [ data, twin ];',
    'object data = this.safeValue(response, "data");',
    'IDictionary<string, object> data');

// a `[]` default elsewhere for the same pair is the same contradiction
check ('safeValue with a [] default sibling stays object',
    'const data = this.safeValue (response, "data"); const other = this.safeValue (response, "data", []); return [ data, other ];',
    'object data = this.safeValue(response, "data");',
    'IDictionary<string, object> data');

// no twin at all keeps the printer's object
check ('safeValue without any twin stays object',
    'const data = this.safeValue (response, "data"); return data;',
    'object data = this.safeValue(response, "data");',
    'IDictionary<string, object> data');

// a use that only a list has (x.length) vetoes the declaration even with a dict twin
check ('safeValue dict twin + .length use stays object',
    'const data = this.safeValue (response, "data"); const twin = this.safeDict (response, "data"); return [ data.length, twin ];',
    'object data = this.safeValue(response, "data");',
    'IDictionary<string, object> data');

// the veto follows a `const y = x;` copy (apex pro: trades = data; trades.length)
check ('safeValue dict twin + copied list use stays object',
    'const data = this.safeValue (response, "data"); const twin = this.safeDict (response, "data"); const trades = data; return [ trades.length, twin ];',
    'object data = this.safeValue(response, "data");',
    'IDictionary<string, object> data');

// `this.<member>` receivers are module state: never evidence, never a candidate
check ('this.options receiver is not a candidate',
    'const ws = this.safeValue (this.options, "ws", {}); const twin = this.safeDict (this.options, "ws", {}); return [ ws, twin ];',
    'object ws = this.safeValue(this.options, "ws", new Dictionary<string, object>() {});',
    'IDictionary<string, object> ws');

console.log (failures === 0 ? '\nall ok' : `\n${failures} failure(s)`);
process.exit (failures === 0 ? 0 : 1);