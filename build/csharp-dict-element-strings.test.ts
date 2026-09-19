// Dictionary element-read typing checks for build/csharp-local-types.js#elementAccessStringReadType.
//
//   npx tsx build/csharp-dict-element-strings.test.ts
//
// Transpiles small TS snippets through the real printer with the real C# classifier hooks
// installed (the same setupCsharpPrinter the driver and the pooled workers use) and asserts
// which element reads off a declared-Dictionary local name the box (`string?` + `(string)`)
// and which stay `object`. The typed declarations below fail on a tree where the family is not
// installed (`object X = ...`), the "stays object" cases pin the guards.
import { Transpiler } from 'ast-transpiler';
import ts from 'typescript6';
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
// the family only moves the DECLARATION (the labelled type + the `(string)` cast the printer
// does not emit), so every check pins the declaration the read is printed behind
const check = (name: string, source: string, declared: string, undeclared?: string) => {
    const output: string = (transpiler as any).transpileCSharp (source).content;
    const flat = output.trim ().replace (/\s+/g, ' ');
    const ok = flat.includes (declared) && (undeclared === undefined || !flat.includes (undeclared));
    console.log ((ok ? 'ok   ' : 'FAIL ') + name);
    if (!ok) {
        failures++;
        console.log ('  expected: ' + declared + (undeclared ? '  (and not: ' + undeclared + ')' : ''));
        console.log ('  actual:   ' + flat.slice (0, 300));
    }
};

// a local the classifier declares Dictionary<string, object> (the object-literal family), read
// by a literal key the corpus proves a string -> `string?` behind the `(string)` cast
check ('typed row + proven string key (symbol)',
    "interface Market { 'symbol': string }\nconst market: Market = { 'symbol': 'BTC/USDT' };\nconst symbol = market['symbol'];\n",
    'string? symbol = ((string)', 'object symbol = ');

check ('typed row + proven string key (code)',
    "interface Currency { 'code': string }\nconst currency: Currency = { 'code': 'BTC' };\nconst code = currency['code'];\n",
    'string? code = ((string)', 'object code = ');

check ('typed row + proven string key (s)',
    "interface Signature { 's': string }\nconst signature: Signature = { 's': 'ff' };\nconst s = signature['s'];\n",
    'string? s = ((string)', 'object s = ');

// the box at the other keys is not a string: a key outside the proven set keeps `object`
check ('unproven string key stays object',
    "interface Currency { 'name': string }\nconst currency: Currency = { 'name': 'Bitcoin' };\nconst name = currency['name'];\n",
    'object name = ', 'string? name = ');

// numeric element types never name the box (Int64 / double / Int32 boxes)
check ('numeric element at a proven key stays object',
    "interface Market { 'id': number }\nconst market: Market = { 'id': 1 };\nconst id = market['id'];\n",
    'object id = ', 'string? id = ');

// boolean element types are out of this family
check ('bool element at a proven key stays object',
    "interface Market { 'symbol': boolean }\nconst market: Market = { 'symbol': true };\nconst symbol = market['symbol'];\n",
    'object symbol = ', 'string? symbol = ');

// a mixed union element type is not a scalar proof
check ('mixed union element stays object',
    "interface Market { 'symbol': string | number }\nconst market: Market = { 'symbol': 'BTC/USDT' };\nconst symbol = market['symbol'];\n",
    'object symbol = ', 'string? symbol = ');

// the receiver proof reads the declared-local table: a non-Dictionary receiver keeps `object`
check ('non-Dictionary receiver stays object',
    "const market = this.safeValue (markets, symbol);\nconst symbol2 = market['symbol'];\n",
    'object symbol2 = ', 'string? symbol2 = ');

// a dynamic key is not the proven shape
check ('dynamic key stays object',
    "interface Market { 'symbol': string }\nconst market: Market = { 'symbol': 'BTC/USDT' };\nconst key = 'symbol';\nconst symbol = market[key];\n",
    'object symbol = ', 'string? symbol = ');

// the initializer shape this unit leaves alone
check ('safeValue initialiser stays object',
    "const symbol = this.safeValue (market, 'symbol');\n",
    'object symbol = ', 'string? symbol = ');

console.log (failures === 0 ? '\nall checks passed' : '\n' + failures + ' check(s) failed');
process.exitCode = failures === 0 ? 0 : 1;
