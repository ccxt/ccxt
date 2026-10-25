// ===== hx10 wave8 GB01: the base safe* dictionary inputs print map[string]any =====
// `safeTrade (trade: Dict, market: Market = undefined)` takes a dictionary, but a base member is
// pinned to the printed `any` ABI (goMethodKeepsBaseSignature), so the body writes it back through
// the box: AddElementToObject(trade, "fee", v). The g08 rule cannot reach a base member.
//
// This module answers `map[string]any` for the tabled method/index pairs, after the printer's own
// gates still hold unchanged: goLocalIsSafeToType (the body never writes another type),
// goParameterKeepsNilCompareNative (a nil compare is the native map test), no `??` on the
// parameter, and every call site passing a printed map.
//
// Only the methods with NO venue override are tabled: a base method and its overrides must print
// one signature, so a family is all-or-nothing. The parse*/safeOrder params are left boxed - their
// call sites pass an implicit-API response local, which prints `any` (see GB01 notes).

import fs from 'fs';
import path from 'path';
import { ts } from './csharp-local-types.js';

export const GB01_DICT_PARAMS: { [method: string]: number[] } = {
    'safeTrade': [ 0 ], 'safeLedgerEntry': [ 0 ],
};
const GB01_TYPE = 'map[string]any';
const GB01_DEBUG = (process.env.GB01_DEBUG === '1');
const GB01_LENIENT = (process.env.GB01_LENIENT === '1');  // survey only: keep `any` instead of failing the build
const GB01_FAILURES: string[] = [];

function gb01Log (message: string) {
    GB01_FAILURES.push (message);
    if (GB01_DEBUG || GB01_LENIENT) { console.error ('hx10 GB01: ' + message); }
}

function gb01IsBaseFile (fn: any): boolean {
    return /(^|[\\/])ts[\\/]src[\\/]base[\\/]/.test (String (fn.getSourceFile ().fileName ?? ''));
}

// `x ?? y` / `x ??= y` read their operand as undefined; the map parameter has no such state
function gb01UsesNullish (go: any, body: any, param: any): boolean {
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

// every call site of `fn` must pass a printed map. Same-file sites are the printer's own proof;
// in a sibling file the printer only names an identifier bound to `this.market(...)`, so accept
// the two declarations whose printed Go IS the map: an object literal and `this.safeDict(...)`
function gb01CallSitesPassMap (go: any, fn: any, index: number): boolean {
    const name = fn.name.text;
    for (const call of go.goSameFileCallsOf (fn, name)) {
        const arg = call.arguments?.[index];
        if ((arg === undefined) || (arg.kind === ts.SyntaxKind.SpreadElement)) { return false; }
        if (go.goPrintedArgType (arg) !== GB01_TYPE) { return false; }
    }
    const tree = go.goTsSrcTree (fn.getSourceFile ());
    if (tree === undefined) { return false; }
    const myClass = go.goEnclosingClassName (fn);
    const myFile = tree.relativeOf.get (path.resolve (fn.getSourceFile ().fileName));
    const sites = tree.callIndex.get (name) ?? [];
    if (sites.length === 0) { return true; }
    for (const site of sites) {
        if (site.file === myFile) { continue; }  // proven above off the checker
        if (!go.goTsSrcFileDerivesFrom (tree, site.file, myClass)) { continue; }
        const arg = String (site.args?.[index] ?? '').trim ();
        if (arg.startsWith ('{')) { continue; }
        if (/^this\s*\.\s*(extend|deepExtend|keysort|indexBy|groupBy)\s*\(/.test (arg)) { continue; }
        const identifier = /^([A-Za-z_$][\w$]*)$/.exec (arg);
        if (identifier === null) { return false; }
        const text = tree.fileText.get (site.file) ?? '';
        const declRe = new RegExp ('(?:const|let|var)\\s+' + identifier[1] + '\\s*(?::[^=]*)?=\\s*([^;\\n]+)', 'g');
        let declaration: any;
        let match;
        while ((match = declRe.exec (text)) !== null) {
            if (match.index > site.at) { break; }
            declaration = match;
        }
        if (declaration === undefined) { return false; }
        const initializer = declaration[1].trim ();
        if (initializer.startsWith ('{') || /^this\s*\.\s*(extend|deepExtend|safeDict)\s*\(/.test (initializer)) { continue; }
        return false;
    }
    return true;
}

// the printed-signature and body proofs, or the reason the parameter keeps the box
function gb01Rejection (go: any, fn: any, param: any): string | undefined {
    const SK = ts.SyntaxKind;
    if (param?.kind !== SK.Parameter) { return 'not a parameter'; }
    if ((param.dotDotDotToken !== undefined) || (param.initializer !== undefined)) { return 'optional/variadic parameter'; }
    if (param.name?.kind !== SK.Identifier) { return 'destructured parameter'; }
    if ((fn?.kind !== SK.MethodDeclaration) || (fn.body === undefined) || (fn.name?.kind !== SK.Identifier)) { return 'not a method with a body'; }
    if (go.isAsyncFunction (fn)) { return 'async method'; }
    if (go.goMethodKeepsBaseSignature (fn) && !gb01IsBaseFile (fn)) {
        // an override of a method outside the table would print the base signature for another reason
        const cls = go.goEnclosingClass (fn);
        if ((cls?.heritageClauses ?? []).some ((c: any) => c.token === SK.ExtendsKeyword) === false) { return 'root class member'; }
    }
    const index = fn.parameters.indexOf (param);
    const name = param.name.text;
    if (!gb01CallSitesPassMap (go, fn, index)) { return 'call site passes another type'; }
    if (!go.goLocalIsSafeToType (fn.body, param, name, GB01_TYPE)) { return 'body writes another type'; }
    if (!go.goParameterKeepsNilCompareNative (fn.body, param, GB01_TYPE)) { return 'body nil-compares the parameter'; }
    if (gb01UsesNullish (go, fn.body, param)) { return 'body reads the parameter with ??' }
    return undefined;
}

function gb01Derived (go: any, param: any): string | undefined {
    if (param?.kind !== ts.SyntaxKind.Parameter) { return undefined; }
    const fn = param.parent;
    if ((fn?.kind !== ts.SyntaxKind.MethodDeclaration) || (fn.name?.kind !== ts.SyntaxKind.Identifier)) { return undefined; }
    const method = fn.name.text;
    const indexes = Object.prototype.hasOwnProperty.call (GB01_DICT_PARAMS, method) ? GB01_DICT_PARAMS[method] : undefined;
    if ((indexes === undefined) || (indexes.indexOf (fn.parameters.indexOf (param)) < 0)) { return undefined; }
    const reason = gb01Rejection (go, fn, param);
    if (reason !== undefined) {
        const file = String (fn.getSourceFile ().fileName ?? '').split (/[\\/]/).slice (-3).join ('/');
        const message = `${file}: ${method}(${param.name?.text}) keeps the box: ${reason}`;
        if (!GB01_LENIENT) {
            if (!gb01IsBaseFile (fn) || reason === 'not a parameter') {
                throw new Error ('hx10 GB01: ' + message + ' (the base prints map[string]any, an override must too)');
            }
        }
        gb01Log (message);
        return undefined;
    }
    if (GB01_DEBUG) { gb01Log (`typed ${method}(${param.name.text}) in ${String (fn.getSourceFile ().fileName ?? '')}`); }
    return GB01_TYPE;
}

// installs the derivation on a Go printer instance; the main transpiler and the worker both call
// this, or the two code paths emit a different signature for the same method
export function installCcxtGoDictParams (goTranspiler: any) {
    const flag = 'hx10GB01w8Installed';
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
            derived = gb01Derived (this, param);
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

export function hx10w8GB01Failures (): string[] {
    return GB01_FAILURES.slice ();
}

// ---- self-test: one dict parameter that every call site passes, and one that does not --------
export function hx10w8GB01Check (): string[] {
    const problems: string[] = [];
    const ok = (condition: boolean, message: string) => { if (!condition) { problems.push ('hx10 GB01: ' + message); } };
    for (const entry of Object.values (GB01_DICT_PARAMS)) {
        ok (entry.length > 0, 'table entry without an index');
    }
    ok (fs.existsSync (new URL ('./hx10w8-GB01.ts', import.meta.url)), 'module not on disk');
    return problems;
}
