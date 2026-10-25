// ===== hx10 wave8 GB05: the balance/position/ticker parse family reads its frame natively =====
// `parseBalance`/`safeBalance`/`safePosition`/`safeTicker` take the exchange frame as their first
// parameter. When that parameter prints `any`, every `frame['key']` read and write in the body goes
// through GetValue/AddElementToObject. The printer's own call-site proof (goNativeParameterTypeOf)
// never reaches these: a base method and every override are pinned to the base signature, and the
// `parse*` half stays boxed by design. This module answers only where the printer answered
// `undefined`, and only for a `map[string]any` whose proof is complete:
//   goParameterCallSitesPassType     - every same-file and deriving-file call site passes that map
//   goLocalIsSafeToType              - no write of another type, no push, no destructuring
//   goParameterKeepsNilCompareNative - no `param === undefined` in the body
// A dynamic `this['name'](...)` call site and a `??` read are outside any static proof and keep the
// parameter boxed. ParsePosition/ParseTicker are absent on purpose: IDerivedExchange pins them and
// base's parse loops pass a boxed `DerivedExchange.ParsePosition(...)` argument.

import Transpiler from 'ast-transpiler';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { ts } from './csharp-local-types.js';

const GB05_METHODS: { [method: string]: number } = {
    'parseBalance': 0, 'safeBalance': 0, 'safePosition': 0, 'safeTicker': 0,
};

const GB05_NULLISH_CACHE = new WeakMap<any, Set<string>> ();

function gb05DynamicCallees (fn: any): Set<string> {
    const file = fn.getSourceFile ();
    let names = GB05_NULLISH_CACHE.get (file);
    if (names === undefined) {
        names = new Set<string> ();
        const rx = /\[\s*['"]([A-Za-z_$][\w$]*)['"]\s*\]\s*\(/g;
        const text = file.getFullText ();
        let m: RegExpExecArray | null;
        while ((m = rx.exec (text)) !== null) { names.add (m[1]); }
        GB05_NULLISH_CACHE.set (file, names);
    }
    return names;
}

function gb05UsesNullish (go: any, body: any, param: any): boolean {
    const SK = ts.SyntaxKind;
    const name = param.name.text;
    let found = false;
    const visit = (n: any) => {
        if (found || (n === undefined)) { return; }
        if ((n.kind === SK.BinaryExpression) && ((n.operatorToken?.kind === SK.QuestionQuestionToken) || (n.operatorToken?.kind === SK.QuestionQuestionEqualsToken))) {
            const left = n.left;
            if ((left?.kind === SK.Identifier) && (left.text === name) && go.goIdentifierRefersToDeclaration (left, param)) {
                found = true;
                return;
            }
        }
        n.forEachChild (visit);
    };
    body.forEachChild (visit);
    return found;
}

function gb05Derived (go: any, param: any): string | undefined {
    const SK = ts.SyntaxKind;
    if (param?.kind !== SK.Parameter) { return undefined; }
    if ((param.dotDotDotToken !== undefined) || (param.initializer !== undefined)) { return undefined; }
    if (param.name?.kind !== SK.Identifier) { return undefined; }
    const fn = param.parent;
    if ((fn?.kind !== SK.MethodDeclaration) || (fn.body === undefined) || (fn.name?.kind !== SK.Identifier)) { return undefined; }
    const name = param.name.text;
    if ((name === 'this') || (name === 'chan') || (name === 'optionalArgs')) { return undefined; }
    const methodName = fn.name.text;
    const indexes = Object.prototype.hasOwnProperty.call (GB05_METHODS, methodName) ? GB05_METHODS[methodName] : undefined;
    if (indexes === undefined) { return undefined; }
    if (fn.parameters.indexOf (param) !== indexes) { return undefined; }
    if (go.isAsyncFunction (fn)) { return undefined; }
    const checker = go.checkerOrUndefined ();
    if (checker === undefined) { return undefined; }
    const declared = param.type === undefined ? undefined : String (param.type.getText ()).trim ();
    if ((declared !== undefined) && (declared !== 'any') && (declared !== 'unknown') && (declared !== 'Dict')) { return undefined; }
    // a declared Dict is the checker's index signature; anything else (a named structure, a class,
    // a union) keeps the box, so only the `any`-declared half leans on the call sites alone
    if ((declared !== undefined) && (declared !== 'any') && (declared !== 'unknown') && !go.goParameterTypeIsDict (checker.getTypeAtLocation (param))) { return undefined; }
    if (gb05DynamicCallees (fn).has (methodName)) { return undefined; }
    if (!go.goHasTreeCallSite (fn)) { return undefined; }
    if (!go.goParameterCallSitesPassType (fn, indexes, 'map[string]any')) { return undefined; }
    if (!go.goLocalIsSafeToType (fn.body, param, name, 'map[string]any')) { return undefined; }
    if (!go.goParameterKeepsNilCompareNative (fn.body, param, 'map[string]any')) { return undefined; }
    if (gb05UsesNullish (go, fn.body, param)) { return undefined; }
    return 'map[string]any';
}

// installs the derivation on a Go printer instance; the main transpiler and the piscina worker both
// call this, or the two code paths emit different Go for the same source
export function installCcxtGoGb05ParamTypes (goTranspiler: any) {
    const flag = 'hx10Gb05w8Installed';
    const current = goTranspiler.goNativeParameterType as any;
    if (current?.[flag] === true) { return current; }
    const original = goTranspiler.goNativeParameterType;
    const cache = new Map<any, any> ();
    const inProgress = new Set<any> ();
    const native = function (this: any, param: any) {
        const answer = original.call (this, param);
        if (answer !== undefined) { return answer; }
        if (cache.has (param)) { return cache.get (param); }
        if (inProgress.has (param)) { return undefined; }
        inProgress.add (param);
        let derived;
        try {
            derived = gb05Derived (this, param);
        } finally {
            inProgress.delete (param);
        }
        cache.set (param, derived);
        return derived;
    };
    (native as any)[flag] = true;
    goTranspiler.goNativeParameterType = native;
    return native;
}

// ---- self-test: the derivation and its keep-`any` gates --------------------------------------
// One stub base class carries the family members; the venue overrides one of them and owns the call
// sites, so `goParameterCallSitesPassType` has a tree to read.
const GB05_TEST_BASE = `export type Dict = { [key: string]: any };
export class Exchange {
    fetchFrame (): any { return {}; }
    safePosition (position: Dict): any { position['a'] = 1; return position; }
    safeTicker (ticker: Dict): any { ticker['b'] = 2; return ticker; }
    safeBalance (balance: Dict): any { return balance; }
    safeOrder (order: Dict): any { return order; }
    parseBalance (response): any { return response['total']; }
    parseTicker (ticker: Dict): any { return ticker['c']; }
}
`;
const GB05_TEST_EXCHANGE = `import { Exchange, Dict } from './base/Exchange';
export class ex extends Exchange {
    parseBalance (response) { return response['total']; }
    run () {
        this.safePosition ({ 'a': 1 });
        this.safeTicker ({ 'b': 2 });
        this.safeBalance ({ 'free': 1 });
        this.parseBalance ({ 'total': 1 });
        this.safeOrder ({ 'id': 1 });
        this.parseTicker ({ 'c': 3 });
        return 0;
    }
}
`;

export function hx10w8GB05Check (): string[] {
    const problems: string[] = [];
    const ok = (condition: boolean, message: string) => { if (!condition) { problems.push ('hx10 w8 GB05: ' + message); } };
    const tmp = fs.mkdtempSync (path.join (os.tmpdir (), 'hx10-GB05w8-'));
    try {
        const src = path.join (tmp, 'ts', 'src');
        fs.mkdirSync (path.join (src, 'base'), { recursive: true });
        fs.writeFileSync (path.join (src, 'base', 'Exchange.ts'), GB05_TEST_BASE);
        fs.writeFileSync (path.join (src, 'ex.ts'), GB05_TEST_EXCHANGE);
        const print = (file: string, install: boolean): string => {
            const t = new Transpiler ({ verbose: false, go: {} });
            if (install) { installCcxtGoGb05ParamTypes (t.goTranspiler); }
            return t.transpileGoByPath (path.join (src, file)).content;
        };
        const fnBody = (go: string, name: string) => (go.split (/\nfunc /).find ((f) => f.indexOf (' ' + name + '(') >= 0) ?? '');
        const base = print ('base/Exchange.ts', false);
        const baseHooked = print ('base/Exchange.ts', true);
        const exHooked = print ('ex.ts', true);
        const safePosition = fnBody (baseHooked, 'SafePosition');
        ok (safePosition.indexOf ('(position map[string]any)') >= 0, 'a proven frame parameter prints the map: ' + safePosition);
        ok (safePosition.indexOf ('position["a"] = 1') >= 0, 'the frame write is native: ' + safePosition);
        ok (safePosition.indexOf ('AddElementToObject(position') < 0, 'the frame write keeps no helper');
        ok (fnBody (base, 'SafePosition').indexOf ('(position any)') >= 0, 'the base generator boxes the frame parameter');
        ok (fnBody (baseHooked, 'SafeTicker').indexOf ('(ticker map[string]any)') >= 0, 'safeTicker types like safePosition');
        ok (fnBody (baseHooked, 'SafeBalance').indexOf ('(balance map[string]any)') >= 0, 'safeBalance types like safePosition');
        ok (fnBody (exHooked, 'ParseBalance').indexOf ('(response map[string]any)') >= 0, 'a venue parseBalance override types off its own call sites: ' + fnBody (exHooked, 'ParseBalance'));
        ok (fnBody (exHooked, 'ParseBalance').indexOf ('GetValue(response') < 0, 'the override reads the frame natively');
        ok (fnBody (baseHooked, 'ParseTicker').indexOf ('(ticker any)') >= 0, 'parseTicker keeps the box (IDerivedExchange pins it)');
        ok (fnBody (baseHooked, 'SafeOrder').indexOf ('(order any)') >= 0, 'a method outside the table keeps the box');
    } catch (e: any) {
        problems.push ('hx10 w8 GB05 threw: ' + e.message);
    } finally {
        fs.rmSync (tmp, { recursive: true, force: true });
    }
    return problems;
}
