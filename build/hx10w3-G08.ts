// ===== hx10 wave3 G08: exchange-local method parameters print the Go type their call sites pass =====
// A method the exchange itself declares (not a base member, not `parse*`/`handle*`, not async) whose
// TypeScript parameter is declared `any` (or not at all) prints `func (this *X) F(id any, options any)`
// today, so every read in the body goes through the box helpers (GetValue(options, "k"),
// GetArrayLength(list), InOp(m, k), ...). The printer already types a parameter whose declared
// TypeScript type names a Go type (goNativeParameterTypeOf → g11NativeParameterType); the `any`-declared
// half has no such proof, and the call sites are the only evidence left.
//
// This module wraps `goNativeParameterType` (the single decision point behind both
// `printParameterType` and `goDeclaredTypeOfIdentifier`) and answers only where the printer answered
// `undefined`: the printed Go type of the argument at this position in EVERY same-file call site must
// be one and the same whitelisted type. The printer's own gates then decide, unchanged:
//   goParameterCallSitesPassType     - every same-file and deriving-file site passes exactly that type
//   goLocalIsSafeToType              - no `param.push`, no write of another type, no ++, no destructuring
//   goParameterKeepsNilCompareNative - no `param === undefined` in the body (a native `== nil` on a
//                                      string/int64/bool does not hold the box the helper derefs)
// plus `??` (reads its operand as undefined) and a dynamic `this['name'](...)` call site, which no
// static proof can see. A declared-type parameter with no call site at all is the declared proof only:
// nobody can pass a value of another type. Everything unproven keeps the bare helper call.

import Transpiler from 'ast-transpiler';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { ts } from './csharp-local-types.js';

const G08_WHITELIST = new Set ([ 'string', 'bool', 'map[string]any', '[]any' ]);

function g08UsesNullish (go: any, body: any, param: any): boolean {
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

// a `this['name'](...)` / `x['name'](...)` call the call-site index cannot resolve; the per-file set
// is built once because the check runs for every parameter of every exchange method
const G08_DYNAMIC_CACHE = new WeakMap<any, Set<string>> ();

function g08DynamicCallees (fn: any): Set<string> {
    const file = fn.getSourceFile ();
    let names = G08_DYNAMIC_CACHE.get (file);
    if (names === undefined) {
        names = new Set<string> ();
        const rx = /\[\s*['"]([A-Za-z_$][\w$]*)['"]\s*\]\s*\(/g;
        const text = file.getFullText ();
        let m: RegExpExecArray | null;
        while ((m = rx.exec (text)) !== null) { names.add (m[1]); }
        G08_DYNAMIC_CACHE.set (file, names);
    }
    return names;
}

function g08HasDynamicCall (fn: any, name: string): boolean {
    return g08DynamicCallees (fn).has (name);
}

function g08Derived (go: any, param: any): string | undefined {
    const SK = ts.SyntaxKind;
    if (param?.kind !== SK.Parameter) { return undefined; }
    if ((param.dotDotDotToken !== undefined) || (param.initializer !== undefined)) { return undefined; }
    if (param.name?.kind !== SK.Identifier) { return undefined; }
    const fn = param.parent;
    if ((fn?.kind !== SK.MethodDeclaration) || (fn.body === undefined) || (fn.name?.kind !== SK.Identifier)) { return undefined; }
    const name = param.name.text;
    if ((name === 'this') || (name === 'chan') || (name === 'optionalArgs')) { return undefined; }
    const file = String (fn.getSourceFile ().fileName ?? '');
    if (!/(^|[\\/])ts[\\/]src[\\/]/.test (file) || /(^|[\\/])ts[\\/]src[\\/]base[\\/]/.test (file)) { return undefined; }
    const methodName = fn.name.text;
    if (methodName.startsWith ('parse') || methodName.startsWith ('handle')) { return undefined; }
    if (go.isAsyncFunction (fn) || go.goMethodKeepsBaseSignature (fn)) { return undefined; }
    const checker = go.checkerOrUndefined ();
    if (checker === undefined) { return undefined; }
    const declared = param.type === undefined ? undefined : String (param.type.getText ()).trim ();
    if ((declared !== undefined) && (declared !== 'any') && (declared !== 'unknown')) { return undefined; }
    if (g08HasDynamicCall (fn, methodName)) { return undefined; }
    const index = fn.parameters.indexOf (param);
    const sites = go.goSameFileCallsOf (fn, methodName);
    if (sites.length === 0) { return undefined; }
    const types = new Set<string> ();
    for (const site of sites) {
        const arg = site.arguments?.[index];
        if ((arg === undefined) || (arg.kind === SK.SpreadElement)) { return undefined; }
        const printed = go.goPrintedArgType (arg);
        if ((printed === undefined) || !G08_WHITELIST.has (printed)) { return undefined; }
        types.add (printed);
        if (types.size > 1) { return undefined; }
    }
    const candidates = [ [ ...types ][0] ];
    for (const goType of candidates) {
        if (!go.goParameterCallSitesPassType (fn, index, goType)) { continue; }
        if (!go.goLocalIsSafeToType (fn.body, param, name, goType)) { continue; }
        if (!go.goParameterKeepsNilCompareNative (fn.body, param, goType)) { continue; }
        if (g08UsesNullish (go, fn.body, param)) { continue; }
        return goType;
    }
    return undefined;
}

// installs the derivation on a Go printer instance; both the main transpiler and the piscina worker
// call this, or the two code paths emit different Go for the same source
export function installCcxtGoParamTypes (goTranspiler: any) {
    const flag = 'hx10G08w3Installed';
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
            derived = g08Derived (this, param);
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

// ---- self-test: the derivation and its four keep-as-`any` gates -------------------------------
// The synthetic tree carries one stub base class (`Exchange`) and one exchange that overrides one of
// its members, so `goMethodKeepsBaseSignature` has something to answer true for.
const G08_TEST_BASE = `export type Dict = { [key: string]: any };
export type Str = string | undefined;
export class Exchange {
    safeString (o: any, k: any, d: any = undefined): any { return d; }
    extend (...args: any[]): any { return args[0]; }
    baseHelper (id: string) { return id; }
}
`;
const G08_TEST_EXCHANGE = `import { Exchange, Dict, Str } from './base/Exchange';
export class ex extends Exchange {
    byString (id, options) {
        if (id === 'ETH') { return options['chain']; }
        return this.safeString (options, 'x', id);
    }
    byInt (count) { return count; }
    mixedTypes (id) { this.mixedTypes ('a'); return this.mixedTypes (1); }
    nilCompare (options) { if (options === undefined) { return 0; } return 1; }
    declaredDict (config: Dict) { return config['a']; }
    dynamic (id) { return id; }
    baseHelper (id) { return id; }
    run (opts) {
        this.byString ('ETH', { 'chain': 'x' });
        this.byInt (1);
        this.mixedTypes ('a');
        this.nilCompare (undefined);
        this['dynamic'] ('x');
        return this.baseHelper ('x');
    }
}
`;

export function g08w3Check (): string[] {
    const problems: string[] = [];
    const ok = (condition: boolean, message: string) => { if (!condition) { problems.push ('hx10 G08w3: ' + message); } };
    const tmp = fs.mkdtempSync (path.join (os.tmpdir (), 'hx10-G08w3-'));
    try {
        const src = path.join (tmp, 'ts', 'src');
        fs.mkdirSync (path.join (src, 'base'), { 'recursive': true });
        fs.writeFileSync (path.join (src, 'base', 'Exchange.ts'), G08_TEST_BASE);
        fs.writeFileSync (path.join (src, 'ex.ts'), G08_TEST_EXCHANGE);
        const print = (install: boolean): string => {
            const t = new Transpiler ({ 'verbose': false, 'go': {} });
            if (install) { installCcxtGoParamTypes (t.goTranspiler); }
            return t.transpileGoByPath (path.join (src, 'ex.ts')).content;
        };
        const body = (go: string, name: string) => (go.split (/\nfunc /).find ((f) => f.startsWith ('(this *ex) ' + name + '(')) ?? '');
        const base = print (false);
        const hooked = print (true);
        ok (body (base, 'ByString').indexOf ('(id any, options any)') >= 0, 'the base generator prints the parameters as any: ' + body (base, 'ByString'));
        ok (body (hooked, 'ByString').indexOf ('(id string, options map[string]any)') >= 0, 'the call-site type prints both parameters: ' + body (hooked, 'ByString'));
        ok (body (hooked, 'ByString').indexOf ('options["chain"]') >= 0, 'a typed map parameter reads natively');
        ok (body (hooked, 'ByString').indexOf ('GetValue(options') < 0, 'the map read keeps no helper call');
        ok (body (hooked, 'ByInt').indexOf ('(count any)') >= 0, 'a numeric call site keeps the box: ' + body (hooked, 'ByInt'));
        ok (body (hooked, 'MixedTypes').indexOf ('(id any)') >= 0, 'call sites of two types keep the box: ' + body (hooked, 'MixedTypes'));
        ok (body (hooked, 'NilCompare').indexOf ('(options any)') >= 0, 'a nil-compared parameter keeps the box');
        ok (body (hooked, 'NilCompare').indexOf ('IsEqual(options, nil)') >= 0, 'the nil compare keeps its helper');
        ok (body (hooked, 'BaseHelper').indexOf ('(id any)') >= 0, 'a base-member override keeps the base signature');
        ok (body (hooked, 'DeclaredDict').indexOf ('(config any)') >= 0, 'a declared type stays the printer\'s own decision: ' + body (hooked, 'DeclaredDict'));
        ok (body (hooked, 'Dynamic').indexOf ('(id any)') >= 0, 'a dynamically named call site keeps the box: ' + body (hooked, 'Dynamic'));
        ok (body (base, 'ByString') !== body (hooked, 'ByString'), 'the rule changes the base generator output');
    } catch (e: any) {
        problems.push ('hx10 G08w3 threw: ' + e.message);
    } finally {
        fs.rmSync (tmp, { recursive: true, force: true });
    }
    return problems;
}

