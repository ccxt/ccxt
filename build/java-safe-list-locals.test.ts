// safeList* locals -> java.util.List<Object> (hx2 java-02). Drives the real Java printer with
// the real classifier hooks installed (installJavaLocalTypes, the installer the driver and the
// pooled workers use) over a synthetic two-file tree laid out as `ts/src/base/Exchange.ts` +
// an exchange file, so the accessor call resolves to the hand-written base gate.
//
//   npx tsx build/java-safe-list-locals.test.ts
//
// On a tree without the family installed the declaration stays `Object` with no checkcast, so
// every `typed` case below fails there (the `Object` cases pass both ways).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Transpiler } from 'ast-transpiler';
import { installJavaLocalTypes } from './java-local-types.js';

const tmp = fs.mkdtempSync (path.join (os.tmpdir (), 'java-safe-list-locals-'));
const baseDir = path.join (tmp, 'ts', 'src', 'base');
fs.mkdirSync (baseDir, { recursive: true });

fs.writeFileSync (path.join (baseDir, 'Exchange.ts'),
    'export default class Exchange {\n' +
    '    safeList (dictionaryOrList: any, key: any, defaultValue?: any): any[] { return []; }\n' +
    '    safeList2 (dictionaryOrList: any, key1: any, key2: any, defaultValue?: any): any[] { return []; }\n' +
    '    safeListN (dictionaryOrList: any, keys: any[], defaultValue?: any): any[] { return []; }\n' +
    '    safeValue (obj: any, key: any, ...defaultValue: any[]): any { return undefined; }\n' +
    '    safeString (obj: any, key: any, ...defaultValue: any[]): String { return \'\'; }\n' +
    '}\n');

const transpiler = new Transpiler ({ verbose: false });
installJavaLocalTypes (transpiler);

let failures = 0;
let probeCount = 0;
const check = (name: string, body: string, expected: string, forbidden?: string) => {
    probeCount++;
    const file = path.join (tmp, 'ts', 'src', `probe${probeCount}.ts`);
    fs.writeFileSync (file,
        'import Exchange from \'./base/Exchange.js\';\n' +
        'class Test extends Exchange {\n' +
        '    run (data, response) {\n' +
        body +
        '    }\n' +
        '}\n');
    const output: any = (transpiler as any).transpileJavaByPath (file).content;
    const ok = output.includes (expected) && (forbidden === undefined || !output.includes (forbidden));
    console.log ((ok ? 'ok   ' : 'FAIL ') + name);
    if (!ok) {
        failures++;
        console.log ('  expected: ' + expected + (forbidden === undefined ? '' : '  (and not: ' + forbidden + ')'));
        console.log ('  actual:   ' + output.trim ().replace (/\s+/g, ' ').slice (0, 300));
    }
};

const LIST_DECL = 'java.util.List<Object> parts = (java.util.List<Object>) this.safeList(';
const LIST_DECL_AS = 'java.util.List<Object> rows = (java.util.List<Object>) this.safeList(';

// the accessor's TS type is `any[]`, the default is a list literal -> typed declaration + checkcast
check ('bare safeList with a list-literal default is typed',
    '        const parts = this.safeList (data, \'list\', []);\n        return parts;\n',
    LIST_DECL);

// `as List` (the shape most venues write) asserts the array; the printer drops the assertion
check ('safeList ... as List is typed',
    '        const rows = this.safeList (response, \'data\', []) as List;\n        return rows;\n',
    LIST_DECL_AS);

// absent default: the accessor hands back null, `(List<Object>) null` is fine
check ('safeList without a default is typed',
    '        const parts = this.safeList (data, \'list\');\n        return parts;\n',
    LIST_DECL);

// safeList2 / safeListN carry the same proof
check ('safeList2 is typed',
    '        const parts = this.safeList2 (data, \'a\', \'b\', []);\n        return parts;\n',
    'java.util.List<Object> parts = (java.util.List<Object>) this.safeList2(');
check ('safeListN is typed',
    '        const parts = this.safeListN (data, [ \'a\', \'b\' ], []);\n        return parts;\n',
    'java.util.List<Object> parts = (java.util.List<Object>) this.safeListN(');

// `as any` asserts nothing about the box -> the declaration keeps Object
check ('safeList ... as any keeps Object',
    '        const parts = this.safeList (data, \'list\', []) as any;\n        return parts;\n',
    'Object parts = ((Object)this.safeList(',
    '(java.util.List<Object>) this.safeList(');

// a default of unknown type can be handed back untouched -> keeps Object
check ('a non-list default keeps Object',
    '        const parts = this.safeList (data, \'list\', response);\n        return parts;\n',
    'Object parts = this.safeList(',
    '(java.util.List<Object>) this.safeList(');

// D2: a later write of another type keeps the declaration Object
check ('a later write of another type keeps Object',
    '        let parts = this.safeList (data, \'list\', []);\n        parts = this.safeString (data, \'x\');\n        return parts;\n',
    'Object parts = this.safeList(',
    '(java.util.List<Object>) this.safeList(');

// plain reads of a typed local are untouched: only the type token and the checkcast move
check ('reads of the typed local keep their helper calls',
    '        const parts = this.safeList (data, \'list\', []);\n        return this.safeString (parts, 0);\n',
    'this.safeString(parts, 0)',
    undefined);

// a venue override of the accessor (its own file) never classifies
probeCount++;
const overrideFile = path.join (tmp, 'ts', 'src', `probe${probeCount}.ts`);
fs.writeFileSync (overrideFile,
    'class Test {\n' +
    '    safeList (dictionaryOrList: any, key: any, defaultValue?: any): any[] { return []; }\n' +
    '    run (data) {\n' +
    '        const parts = this.safeList (data, \'list\', []);\n' +
    '        return parts;\n' +
    '    }\n' +
    '}\n');
const overrideOutput: any = (transpiler as any).transpileJavaByPath (overrideFile).content;
const overrideOk = overrideOutput.includes ('Object parts = this.safeList(')
    && !overrideOutput.includes ('(java.util.List<Object>) this.safeList(');
console.log ((overrideOk ? 'ok   ' : 'FAIL ') + 'a venue-local safeList override is not typed');
if (!overrideOk) {
    failures++;
    console.log ('  actual: ' + overrideOutput.trim ().replace (/\s+/g, ' ').slice (0, 300));
}

fs.rmSync (tmp, { recursive: true, force: true });
console.log (failures === 0 ? '\nall safeList-local checks passed' : '\n' + failures + ' check(s) failed');
if (failures > 0) {
    process.exit (1);
}
