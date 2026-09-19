// safeBool local typing + isTrue consumer checks for
// build/java-local-types.js#patchJavaSafeBoolLocals (section 7).
//
//   npx tsx build/java-safe-bool-locals.test.ts
//
// Transpiles small TS files through the real printer with the real Java local-typing hooks
// installed (the same order build/javaTranspiler.ts#setupTranspiler uses), and asserts which
// `Object x = this.safeBool (...)` locals become `Boolean` and where `Helpers.isTrue (x)`
// becomes `Boolean.TRUE.equals (x)`. The positive cases fail on a tree where the section is
// absent (Object declaration + `Helpers.isTrue (x)`).
//
// The snippets are written to `<tmp>/base/Exchange.ts` — the accessor gate resolves the
// callee's declaration file, and the base tier of the real tree resolves it to
// `ts/src/base/Exchange(.nooverloads.<pid>)?.ts`, so the harness file has to live under a
// `base/Exchange.ts` path to exercise the same gate.
import { Transpiler } from 'ast-transpiler';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { patchJavaLocalTypes } from './javaTranspiler.js';
import {
    installJavaLocalTypes,
    installJavaNumericLocalTypes,
    patchJavaLiteralLocalTypes,
} from './java-local-types.js';

const config: any = {
    verbose: false,
    java: {
        parser: {
            'ELEMENT_ACCESS_WRAPPER_OPEN': 'Helpers.GetValue(',
            'ELEMENT_ACCESS_WRAPPER_CLOSE': ')',
        },
    },
};

const transpiler: any = new Transpiler(config);
transpiler.setVerboseMode(false);
patchJavaLocalTypes(transpiler);
installJavaLocalTypes(transpiler);
patchJavaLiteralLocalTypes(transpiler);
installJavaNumericLocalTypes(transpiler);

const root = path.join(os.tmpdir(), 'ccxt-java-safe-bool-' + process.pid, 'base');
fs.mkdirSync(root, { recursive: true });
const file = path.join(root, 'Exchange.ts');

// the accessor declarations the TS base carries (overloads stripped by the real pipeline —
// the single implementation signature returns `boolean | undefined`, which is what the 2-arg
// and 3-arg call sites resolve to here)
const HEAD = `class Exchange {
    safeValue (obj: any, key: any, defaultValue?: any): any { return null; }
    safeBool (dictionaryOrList: any, key: any, defaultValue?: boolean): boolean | undefined {
        const value = this.safeValue (dictionaryOrList, key, defaultValue);
        if (typeof value === 'boolean') { return value; }
        return defaultValue;
    }
    caseA (data: any, other: any): void {
`;

const TAIL = `    }
}
`;

let failures = 0;
const check = (name: string, body: string, expected: string, forbidden?: string) => {
    fs.writeFileSync(file, HEAD + body + '\n' + TAIL);
    let output = '';
    try {
        output = transpiler.transpileJavaByPath(file).content;
    } catch (e) {
        output = 'THREW ' + e;
    }
    const ok = output.includes(expected) && (forbidden === undefined || !output.includes(forbidden));
    console.log((ok ? 'ok   ' : 'FAIL ') + name);
    if (!ok) {
        failures++;
        console.log('  expected: ' + expected + (forbidden ? '  (and not: ' + forbidden + ')' : ''));
        console.log('  actual:   ' + output.trim().replace(/\s+/g, ' ').slice(0, 400));
    }
};

// ---- the declaration: Object -> Boolean, with the (Boolean) checkcast the accessor needs
check('safeBool 2-arg local -> Boolean',
    `        const x = this.safeBool (data, 'k');`,
    'Boolean x = (Boolean) this.safeBool(data, "k");',
    'Object x = this.safeBool(data, "k");');

check('safeBool 3-arg boolean-literal default -> Boolean',
    `        const x = this.safeBool (data, 'k', false);`,
    'Boolean x = (Boolean) this.safeBool(data, "k", false);');

// ---- the consumer: Helpers.isTrue (x) -> Boolean.TRUE.equals (x)
check('truthiness of the local -> Boolean.TRUE.equals',
    `        const x = this.safeBool (data, 'k');\n        if (x) { console.log ('a'); }`,
    'if (Boolean.TRUE.equals(x))',
    'Helpers.isTrue(x)');

check('negated local -> !Boolean.TRUE.equals',
    `        const x = this.safeBool (data, 'k');\n        if (!x) { console.log ('a'); }`,
    'if (!Boolean.TRUE.equals(x))',
    'Helpers.isTrue(x)');

check('ternary condition of the local',
    `        const x = this.safeBool (data, 'k');\n        console.log (x ? 'a' : 'b');`,
    '((Boolean.TRUE.equals(x))) ? "a" : "b"');

check('&& left operand',
    `        const x = this.safeBool (data, 'k');\n        if (x && data) { console.log ('a'); }`,
    'Boolean.TRUE.equals(x)',
    'Helpers.isTrue(x)');

// ---- D2: later writes the Boolean declaration can take
check('later boolean-literal write keeps the Boolean declaration',
    `        let x = this.safeBool (data, 'k');\n        x = false;\n        if (x) { console.log ('a'); }`,
    'Boolean x = (Boolean) this.safeBool(data, "k");');

check('later proven safeBool write keeps the declaration + takes the checkcast',
    `        let x = this.safeBool (data, 'k');\n        x = this.safeBool (data, 'k2');\n        if (x) { console.log ('a'); }`,
    'x = (Boolean) this.safeBool(data, "k2");');

// ---- negatives
check('3-arg non-literal default keeps Object + the helper',
    `        const x = this.safeBool (data, 'k', other);\n        if (x) { console.log ('a'); }`,
    'if (Helpers.isTrue(x))',
    'Boolean.TRUE.equals(x)');

check('later non-Boolean write keeps the Object box',
    `        let x = this.safeBool (data, 'k');\n        x = this.safeValue (data, 'z');\n        if (x) { console.log ('a'); }`,
    'Object x = this.safeBool(data, "k");',
    'Boolean.TRUE.equals(x)');

check('unboxing operator keeps the Object box',
    `        let x = this.safeBool (data, 'k');\n        x ++;`,
    'Object x = this.safeBool(data, "k");');

check('TS assertion keeps the Object box',
    `        const x = this.safeBool (data, 'k');\n        console.log (x as any);`,
    'Object x = this.safeBool(data, "k");');

check('a tuple-written local is never this family',
    `        let x;\n        x = this.safeBool (data, 'k');\n        if (x) { console.log ('a'); }`,
    'Object x = null;',
    'Boolean.TRUE.equals(x)');

check('safeValue locals keep the helper',
    `        const y = this.safeValue (data, 'z');\n        if (y) { console.log ('a'); }`,
    'if (Helpers.isTrue(y))',
    'Boolean.TRUE.equals(y)');

console.log(failures === 0 ? 'ALL PASSED' : failures + ' FAILED');
process.exit(failures === 0 ? 0 : 1);
