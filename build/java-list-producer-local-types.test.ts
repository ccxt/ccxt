// List-producer local declaration checks for build/java-local-types.js#javaListProducerLocalType.
//
//   npx tsx build/java-list-producer-local-types.test.ts
//
// Transpiles small TS snippets through the real Java printer with the real local-typing hooks
// installed (the same chain setupTranspiler() and the pooled workers install) and asserts when
// `x.split (sep)` / `Object.keys (x)` locals are declared `List<Object>`. The positive cases
// print `Object ... = Helpers.split(` on a tree without the family, so they fail there.
import { Transpiler } from 'ast-transpiler';
import { patchJavaLocalTypes } from './javaTranspiler.js';
import { installJavaLocalTypes, installJavaNumericLocalTypes, patchJavaLiteralLocalTypes, patchJavaStringReceiverCasts, patchJavaMapChannelStringCasts, patchJavaConsumerStringCasts } from './java-local-types.js';

const config: any = {
    verbose: false,
    csharp: {
        parser: {
            NUM_LINES_END_FILE: 0,
            'ELEMENT_ACCESS_WRAPPER_OPEN': 'getValue(',
            'ELEMENT_ACCESS_WRAPPER_CLOSE': ')',
        },
    },
    java: {},
};

const transpiler: any = new Transpiler (config);
transpiler.setVerboseMode (false);
patchJavaLocalTypes (transpiler);
installJavaLocalTypes (transpiler);
patchJavaLiteralLocalTypes (transpiler);
installJavaNumericLocalTypes (transpiler);
patchJavaConsumerStringCasts (transpiler);
patchJavaMapChannelStringCasts (transpiler);
patchJavaStringReceiverCasts (transpiler);

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

// ---- split: the helper boxes a List on every path, so the declaration carries the checkcast
check ('split local -> List<Object> with checkcast',
    'function f (symbol) { const parts = symbol.split ("-"); return parts; }',
    'java.util.List<Object> parts = (java.util.List<Object>) Helpers.split(symbol, "-");',
    'Object parts = Helpers.split(');

check ('split on a non-literal separator',
    'function f (content, startRegex) { const splitted_by_start = content.split (startRegex); return splitted_by_start; }',
    'java.util.List<Object> splitted_by_start = (java.util.List<Object>) Helpers.split(content, startRegex);');

check ('split local read by index / length stays List',
    'function f (symbol) { const parts = symbol.split ("-"); return parts.length + parts[0]; }',
    'java.util.List<Object> parts = (java.util.List<Object>) Helpers.split(symbol, "-");');

// ---- Object.keys: Helpers.objectKeys is declared List<Object> -> no checkcast
check ('objectKeys local -> List<Object> without checkcast',
    'function f (parameters) { const keys = Object.keys (parameters); return keys; }',
    'java.util.List<Object> keys = Helpers.objectKeys(parameters);',
    '(java.util.List<Object>) Helpers.objectKeys(');

check ('Object.values stays Object (not this family)',
    'function f (parameters) { const values = Object.values (parameters); return values; }',
    'Object values = Helpers.objectValues(parameters);');

// ---- negatives: D2 writes and later-uses that need the box
check ('a later non-list write keeps Object',
    'function f (parameters) { const keys = Object.keys (parameters); keys = 1; return keys; }',
    'Object keys = Helpers.objectKeys(parameters);',
    'List<Object> keys = Helpers.objectKeys(');

check ('a later join receiver keeps Object',
    'function f (symbol) { const parts = symbol.split (","); return parts.join ("-"); }',
    'Object parts = Helpers.split(symbol, ",");',
    'List<Object> parts =');

check ('a reassignment from another split keeps Object',
    'function f (symbol) { const parts = symbol.split (","); parts = symbol.split ("-"); return parts; }',
    'Object parts = Helpers.split(symbol, ",");',
    'List<Object> parts =');

check ('multi-declarator list keeps Object',
    'function f (symbol) { const a = symbol.split (","), b = 2; return a + b; }',
    'Object a = Helpers.split(symbol, ",");',
    'List<Object> a =');

check ('an element read (Helpers.GetValue) keeps Object',
    'function f (data) { const v = data["k"]; return v; }',
    'Object v = Helpers.GetValue(data, "k");',
    'List<Object> v =');

check ('a split result returned directly is unaffected (no local)',
    'function f (symbol) { return symbol.split ("-"); }',
    'Helpers.split(symbol, "-")',
    'List<Object>');

console.log (failures === 0 ? '\nall checks passed' : `\n${failures} check(s) FAILED`);
process.exit (failures === 0 ? 0 : 1);