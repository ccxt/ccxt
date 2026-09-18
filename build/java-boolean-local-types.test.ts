// Emission checks for build/java-local-types.js#patchJavaBooleanLocalTypes (unit java-04).
//
//   npx tsx build/java-boolean-local-types.test.ts
//
// Transpiles small TS snippets through the real Java printer with the real typed-local hooks
// installed (patchJavaLocalTypes + installJavaLocalTypes, the same pair setupTranspiler and
// the pooled worker install) and asserts the emitted declaration type and the
// Helpers.isTrue wrapper:
//
//   `Object x = this.isLinear (...)`  ->  `boolean x = Helpers.isTrue(this.isLinear (...))`
//   `Helpers.isTrue(x)` reads         ->  bare `x`
//   `Object x = this.inArray (...)`   ->  `boolean x = this.inArray (...)`   (Java boolean)
//
// The "typed" cases fail on a tree without the patch (the declaration prints `Object` and the
// reads keep the wrapper).
import { Transpiler } from 'ast-transpiler';
import { patchJavaLocalTypes } from './javaTranspiler.js';
import { installJavaLocalTypes } from './java-local-types.js';

const config: any = {
    verbose: false,
    java: {
        parser: { NUM_LINES_END_FILE: 0 },
    },
};

const transpiler = new Transpiler (config);
patchJavaLocalTypes (transpiler as any);
installJavaLocalTypes (transpiler as any);

let failures = 0;
const check = (name: string, source: string, expected: string, forbidden?: string) => {
    const output: string = (transpiler as any).transpileJava (source).content.replace (/\s+/g, ' ');
    const ok = output.includes (expected) && (forbidden === undefined || !output.includes (forbidden));
    console.log ((ok ? 'ok   ' : 'FAIL ') + name);
    if (!ok) {
        failures++;
        console.log ('  expected: ' + expected + (forbidden ? '  (and not: ' + forbidden + ')' : ''));
        console.log ('  actual:   ' + output.slice (0, 400));
    }
};

const methods = `
    isLinear (type: string, subType: string = undefined): boolean { return type === subType; }
    isInverse (type: string, subType: string = undefined): boolean { return type === subType; }
    checkRequiredCredentials (error: boolean = true): boolean { return true; }
    inArray (elem, list): boolean { return false; }
    isOn (): boolean { return true; }
`;

// a plain `this.<boolean method>(...)` local: one Helpers.isTrue at the declaration, bare reads
check ('isLinear local + if read',
    `class Ex { ${methods} probe (type, subType) { const isLinearType = this.isLinear (type, subType); if (isLinearType) { return 'a'; } return 'b'; } }`,
    'boolean isLinearType = Helpers.isTrue(this.isLinear(type, subType));',
    'Object isLinearType = this.isLinear(');
check ('isLinear local: the if read drops the wrapper',
    `class Ex { ${methods} probe (type, subType) { const isLinearType = this.isLinear (type, subType); if (isLinearType) { return 'a'; } return 'b'; } }`,
    'if (isLinearType)',
    'if (Helpers.isTrue(isLinearType))');
check ('isLinear local: else-if read drops the wrapper',
    `class Ex { ${methods} probe (type, subType) { const isLinearType = this.isLinear (type, subType); if (!isLinearType) { return 'a'; } else if (isLinearType) { return 'b'; } return 'c'; } }`,
    'else if (isLinearType)',
    'else if (Helpers.isTrue(isLinearType))');
check ('isLinear local: `!` and `&&` reads drop the wrapper',
    `class Ex { ${methods} probe (type, subType) { const isLinearType = this.isLinear (type, subType); const both = !isLinearType && isLinearType; return both; } }`,
    '!isLinearType && isLinearType',
    'isTrue(isLinearType)');
check ('isLinear local: ternary condition drops the wrapper',
    `class Ex { ${methods} probe (type, subType) { const isLinearType = this.isLinear (type, subType); return isLinearType ? 'a' : 'b'; } }`,
    '((isLinearType)) ? "a" : "b"',
    'isTrue(isLinearType)');
check ('isInverse local is typed too',
    `class Ex { ${methods} probe (type, subType) { const isInverseType = this.isInverse (type, subType); if (isInverseType) { return 'a'; } return 'b'; } }`,
    'boolean isInverseType = Helpers.isTrue(this.isInverse(type, subType));');
check ('checkRequiredCredentials local',
    `class Ex { ${methods} probe () { const isAuthenticated = this.checkRequiredCredentials (false); if (isAuthenticated) { return 'a'; } return 'b'; } }`,
    'boolean isAuthenticated = Helpers.isTrue(this.checkRequiredCredentials(false));');
// inArray prints a real Java boolean in the hand-written base: no wrapper at the declaration
check ('inArray local needs no declaration wrapper',
    `class Ex { ${methods} probe (id, ids) { const isFiat = this.inArray (id, ids); if (isFiat) { return 'a'; } return 'b'; } }`,
    'boolean isFiat = this.inArray(id, ids);',
    'Helpers.isTrue(this.inArray(');
check ('inArray local still drops the read wrapper',
    `class Ex { ${methods} probe (id, ids) { const isFiat = this.inArray (id, ids); if (isFiat) { return 'a'; } return 'b'; } }`,
    'if (isFiat)',
    'if (Helpers.isTrue(isFiat))');

// negative controls: the rule is closed over the four callees and never drops a read of a
// local it did not type
check ('other boolean-returning method stays Object + wrapper',
    `class Ex { ${methods} probe () { const isOn = this.isOn (); if (isOn) { return 'a'; } return 'b'; } }`,
    'Object isOn = this.isOn();',
    'boolean isOn = ');
check ('a local with no condition read keeps its box',
    `class Ex { ${methods} probe (type, subType) { const isLinearType = this.isLinear (type, subType); const copy = isLinearType; return copy; } }`,
    'Object isLinearType = this.isLinear(type, subType);',
    'boolean isLinearType = ');
// D2: a later write of another printed type keeps the box
check ('later write keeps the box',
    `class Ex { ${methods} safeString (o, k) { return 'x'; } probe (type, subType, o) { let isLinearType = this.isLinear (type, subType); if (isLinearType) { isLinearType = this.safeString (o, 'k'); } return isLinearType; } }`,
    'Object isLinearType = this.isLinear(type, subType);',
    'boolean isLinearType = ');
// D2: typeof / casts print a construct a primitive cannot take
check ('typeof read keeps the box',
    `class Ex { ${methods} probe (type, subType) { const isLinearType = this.isLinear (type, subType); if (typeof isLinearType === 'boolean') { return 'a'; } return 'b'; } }`,
    'Object isLinearType = this.isLinear(type, subType);',
    'boolean isLinearType = ');
check ('an `as` cast keeps the box',
    `class Ex { ${methods} probe (type, subType) { const isLinearType = this.isLinear (type, subType); const other = isLinearType as any; if (other) { return 'a'; } return 'b'; } }`,
    'Object isLinearType = this.isLinear(type, subType);',
    'boolean isLinearType = ');

console.log (failures === 0 ? '\nall checks passed' : `\n${failures} check(s) FAILED`);
process.exit (failures === 0 ? 0 : 1);
