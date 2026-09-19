// parse* structure local declaration checks for build/java-local-types.js#parseStructureLocalType.
//
//   npx tsx build/java-parse-structure-local-types.test.ts
//
// Transpiles small TS snippets through the real Java printer with the real local-typing hooks
// installed (the same chain setupTranspiler() installs) and asserts when a local initialised by
// a whole `this.parseX (...)` call is declared `Map<String, Object>` / `List<Object>` from the
// callee's declared TS return type. The positive cases print `Object ... = this.parseX (` on a
// tree without the family, so they fail there.
import { Transpiler } from 'ast-transpiler';
import { patchJavaLocalTypes } from './javaTranspiler.js';
import { installJavaLocalTypes } from './java-local-types.js';

const config: any = { verbose: false, csharp: {}, java: {} };
const transpiler: any = new Transpiler (config);
transpiler.setVerboseMode (false);
patchJavaLocalTypes (transpiler);
installJavaLocalTypes (transpiler);

let failures = 0;
const check = (name: string, source: string, expected: string, forbidden?: string) => {
    const output: string = (transpiler as any).transpileJava (source).content;
    const ok = output.includes (expected) && (forbidden === undefined || !output.includes (forbidden));
    console.log ((ok ? 'ok   ' : 'FAIL ') + name);
    if (!ok) {
        failures++;
        console.log ('  expected: ' + expected + (forbidden ? '  (and not: ' + forbidden + ')' : ''));
        console.log ('  actual:   ' + output.trim ().replace (/\s+/g, ' ').slice (0, 400));
    }
};

// a caller-side interface return (the shape every venue parse* override uses) -> Map + checkcast
check ('parse* interface-returning local -> Map<String, Object> with checkcast',
    'interface ProbeOrder { id: string; }\n' +
    'class Probe {' +
    '  parseOrder (order: any): ProbeOrder { return order; }' +
    '  run (response: any) { const parsedOrder = this.parseOrder (response); return parsedOrder; }' +
    '}',
    'java.util.Map<String, Object> parsedOrder = (java.util.Map<String, Object>) this.parseOrder(response);',
    'Object parsedOrder = this.parseOrder(');

// a tuple/array return -> List + checkcast
check ('parse* array-returning local -> List<Object> with checkcast',
    'class Probe {' +
    '  parseOHLCV (ohlcv: any): number[] { return ohlcv; }' +
    '  run (response: any) { const ohlcv = this.parseOHLCV (response); return ohlcv; }' +
    '}',
    'java.util.List<Object> ohlcv = (java.util.List<Object>) this.parseOHLCV(response);',
    'Object ohlcv = this.parseOHLCV(');

// a class (not a structure row) never classifies: the box is a nominal instance
check ('parse* class-returning local stays Object',
    'class ProbeCache {}\n' +
    'class Probe {' +
    '  parseTicker (ticker: any): ProbeCache { return ticker; }' +
    '  run (response: any) { const parsedTicker = this.parseTicker (response); return parsedTicker; }' +
    '}',
    'Object parsedTicker = this.parseTicker(response);');

// a numeric return is another family's declaration
check ('parse* numeric-returning local stays Object',
    'class Probe {' +
    '  parseTransaction (amount: any): number { return amount; }' +
    '  run (response: any) { const amount = this.parseTransaction (response); return amount; }' +
    '}',
    'Object amount = this.parseTransaction(response);');

// names whose Java box is argument-dependent (filterByArray) are not in the table
check ('parseSettlements local stays Object',
    'interface ProbeSettlement { id: string; }\n' +
    'class Probe {' +
    '  parseSettlements (response: any): ProbeSettlement { return response; }' +
    '  run (response: any) { const result = this.parseSettlements (response); return result; }' +
    '}',
    'Object result = this.parseSettlements(response);');

if (failures > 0) {
    console.log ('\n' + failures + ' failure(s)');
    process.exit (1);
}
console.log ('\nall parse-structure local checks passed');
