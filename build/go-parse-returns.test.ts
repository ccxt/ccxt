// D-02 emission checks for build/go-local-types.js#ccxtGoAnnotatedMethodReturnType.
//
//   npx tsx build/go-parse-returns.test.ts
//
// Transpiles small TS classes through the real Go printer with the real classifier hooks
// installed (the same installCcxtGoLocalTypes the driver and the pooled workers use) and
// asserts that an internal `parseX (..): Str/Dict/List/Bool/number` method prints its
// native Go return type — and that every caller's `var x any = this.ParseX (..)` becomes
// the matching typed local. The negative cases keep `any`: an override (D8), a bare
// `return;`, a mixed literal/pointer body, an unannotated method, and a method name the
// repo's interface files reserve.
//
// The method names are deliberately outside the older narrow name regex
// (^parse…(Status|Type|TimeInForce|Side|Action)$) so each case exercises THIS rule.
import fs from 'fs';
import os from 'os';
import path from 'path';
import { Transpiler } from 'ast-transpiler';
import { installCcxtGoLocalTypes, installCcxtGoIndexableTypes } from './go-local-types.js';

const config: any = {
    verbose: false,
    go: {
        asyncMethodSuffix: 'Async',
    },
};

const transpiler = new Transpiler (config);
installCcxtGoLocalTypes ((transpiler as any).goTranspiler);
installCcxtGoIndexableTypes ((transpiler as any).goTranspiler);

const transpile = (source: string): any => (transpiler as any).transpileGo (source).content;

let failures = 0;
const check = (name: string, source: string, expected: string, forbidden?: string) => {
    const output: any = transpile (source);
    const ok = output.includes (expected) && (forbidden === undefined || !output.includes (forbidden));
    console.log ((ok ? 'ok   ' : 'FAIL ') + name);
    if (!ok) {
        failures++;
        console.log ('  expected: ' + expected + (forbidden ? '  (and not: ' + forbidden + ')' : ''));
        console.log ('  actual:   ' + output.trim ().replace (/\s+/g, ' ').slice (0, 400));
    }
};

const aliases =
    'type Dict = { [key: string]: any };\n' +
    'type Str = string | undefined;\n' +
    'type Bool = boolean | undefined;\n' +
    'type List = Array<any>;\n';

// the derived class is what the rule applies to: a root class is the abstract base of
// the generated tree and stays `any` (goMethodKeepsBaseSignature)
const classOf = (body: string) => aliases +
    'class Base {\n    ping () { return 1 }\n}\n' +
    'class Test extends Base {\n' + body + '    safeString (x, k) { return x[k] }\n}\n';

// Str: the Safe* pointer shape prints `*string` on the signature and types the caller local
check ('parse*: Str -> *string',
    classOf ("    parseStatusX (status: Str): Str {\n        return this.safeString ({ 'a': 'ok' }, status, status)\n    }\n"),
    'ParseStatusX(status *string) *string {',
    'ParseStatusX(status *string) any {');

check ('caller local of a Str parse* becomes *string',
    classOf ("    parseStatusX (status: Str): Str {\n        return this.safeString ({ 'a': 'ok' }, status, status)\n    }\n" +
        "    read (status) {\n        const s = this.parseStatusX (status)\n        return s === 'ok'\n    }\n"),
    'var s *string = this.ParseStatusX(status)',
    'var s any = this.ParseStatusX(status)');

// Dict: an object literal body prints map[string]any, and the caller reads it natively
check ('parse*: Dict -> map[string]any',
    classOf ('    parseInfoX (x: Dict): Dict {\n' +
        "        const out: Dict = { 'a': x['a'] };\n" +
        '        return out;\n' +
        '    }\n'),
    'ParseInfoX(x map[string]any) map[string]any {',
    'ParseInfoX(x map[string]any) any {');

check ('caller local of a Dict parse* reads natively',
    classOf ('    parseInfoX (x: Dict): Dict {\n' +
        "        const out: Dict = { 'a': x['a'] };\n" +
        '        return out;\n' +
        '    }\n' +
        '    read (x) {\n' +
        '        const out = this.parseInfoX (x);\n' +
        "        return out['a'];\n" +
        '    }\n'),
    'var out map[string]any = this.ParseInfoX(x)',
    'GetValue(out, "a")');

// List: an array literal body prints []any
check ('parse*: List -> []any',
    classOf ('    parseListX (x: Dict): List {\n        return [ x ];\n    }\n'),
    'ParseListX(x map[string]any) []any {',
    'ParseListX(x map[string]any) any {');

// Bool: a literal body prints bool
check ('parse*: Bool -> bool',
    classOf ('    parseFlagX (x: Dict): Bool {\n        return true;\n    }\n'),
    'ParseFlagX(x map[string]any) bool {',
    'ParseFlagX(x map[string]any) any {');

// number: a numeric literal body prints float64
check ('parse*: number -> float64',
    classOf ('    parseAmountX (x: Dict): number {\n        return 1;\n    }\n'),
    'ParseAmountX(x map[string]any) float64 {',
    'ParseAmountX(x map[string]any) any {');

// an absent path is fine for the nullable annotations (Str -> *string, nil)
check ('parse*: Str with an absent path stays *string',
    classOf ("    parseStatusX (x: Dict): Str {\n        if (x === undefined) {\n            return undefined;\n        }\n        return this.safeString (x, 'status');\n    }\n"),
    'ParseStatusX(x any) *string {',
    'ParseStatusX(x any) any {');

// D8: an override keeps the emitted base-compatible signature
check ('override keeps `any`',
    aliases +
    'class Base {\n    parseInfoX (x: Dict): Dict {\n        return x\n    }\n}\n' +
    'class Test extends Base {\n    override parseInfoX (x: Dict): Dict {\n        return { \'a\': x[\'a\'] }\n    }\n}\n',
    'func (this *Test) ParseInfoX(x any) any {',
    'func (this *Test) ParseInfoX(x any) map[string]any {');

// a bare `return;` path cannot hold a typed value
check ('a bare return keeps `any`',
    classOf ('    parseStatusX (x: Str): Str {\n' +
        '        if (x === undefined) {\n            return;\n        }\n' +
        '        return this.safeString ({}, x, x);\n    }\n'),
    'ParseStatusX(x *string) any {',
    'ParseStatusX(x *string) *string {');

// a literal path and a pointer path cannot share one signature
check ('mixed literal/pointer body keeps `any`',
    classOf ("    parseStatusX (x: Str): Str {\n        if (x === undefined) {\n            return 'none';\n        }\n        return this.safeString ({}, x, x);\n    }\n"),
    'ParseStatusX(x *string) any {',
    'ParseStatusX(x *string) *string {');

// a nil path and a literal path cannot share one signature either: the literals would
// demand a plain `string`, which the `return nil` path cannot fill
check ('nil + literal body keeps `any`',
    classOf ("    parseStatusX (x: Str): Str {\n        if (x === undefined) {\n            return undefined;\n        }\n        return 'YES';\n    }\n"),
    'ParseStatusX(x *string) any {',
    'ParseStatusX(x *string) string {');

// the rule is annotation-driven: an unannotated parse* method stays `any`
check ('no annotation keeps `any`',
    classOf ('    parseStatusX (x) {\n        return this.safeString ({}, x, x);\n    }\n'),
    'ParseStatusX(x any) any {',
    'ParseStatusX(x any) *string {');

// a name listed on the repo's interface files keeps its exact `any` signature: every
// generated constructor asserts `this.Exchange.DerivedExchange = this`, so the
// IDerivedExchange / IBaseExchange member set has to match byte-for-byte. The fixture
// is a real <root>/ts/src/<id>.ts tree, because the interface list is read per root.
const fixtureRoot = fs.mkdtempSync (path.join (os.tmpdir (), 'd02-reserved-'));
fs.mkdirSync (path.join (fixtureRoot, 'ts/src'), { recursive: true });
fs.mkdirSync (path.join (fixtureRoot, 'go/v4'), { recursive: true });
fs.writeFileSync (path.join (fixtureRoot, 'go/v4/exchange_interface.go'),
    'package ccxt\n\ntype IDerivedExchange interface {\n\tParseStatusX(status any) any\n}\n');
fs.writeFileSync (path.join (fixtureRoot, 'ts/src/test.ts'), classOf ("    parseStatusX (status: Str): Str {\n        return this.safeString ({}, status, status)\n    }\n"));
const fixtureOutput: any = (transpiler as any).transpileGoByPath (path.join (fixtureRoot, 'ts/src/test.ts')).content;
{
    const ok = fixtureOutput.includes ('ParseStatusX(status *string) any {') && !fixtureOutput.includes ('ParseStatusX(status *string) *string {');
    console.log ((ok ? 'ok   ' : 'FAIL ') + 'an interface-listed name keeps `any`');
    if (!ok) {
        failures++;
        console.log ('  actual: ' + fixtureOutput.trim ().replace (/\s+/g, ' ').slice (0, 300));
    }
}
fs.rmSync (fixtureRoot, { recursive: true, force: true });

console.log (failures === 0 ? '\nall parse-return checks passed' : '\n' + failures + ' check(s) failed');
if (failures > 0) {
    process.exit (1);
}