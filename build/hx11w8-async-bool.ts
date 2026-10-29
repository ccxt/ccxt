// hx11 w8: a required TS `boolean` parameter of an exchange-local (non-base-pinned) async method prints a Go
// `bool` when every call site provably passes a bool: same-file sites by their printed Go type, sibling
// pro/<x>.ts sites only as a `true`/`false` literal. The body must not nil-test it. Everything else keeps `any`.
import path from 'path';
import { ts } from './csharp-local-types.js';

// a call-site argument that is a Go bool by syntax alone: a true/false literal, or a defaulted boolean
// parameter (bound through GetArgBool). No printer re-entry, so no parameter-type cache is touched.
function hx11w8ArgIsBool (arg: any, checker: any): boolean {
    if ((arg.kind === ts.SyntaxKind.TrueKeyword) || (arg.kind === ts.SyntaxKind.FalseKeyword)) { return true; }
    if (arg.kind !== ts.SyntaxKind.Identifier) { return false; }
    const decl: any = checker?.getSymbolAtLocation (arg)?.valueDeclaration?.resolve ();
    return (decl?.kind === ts.SyntaxKind.Parameter) && (decl.type?.getText () === 'boolean')
        && ((decl.initializer?.kind === ts.SyntaxKind.TrueKeyword) || (decl.initializer?.kind === ts.SyntaxKind.FalseKeyword))
        && !hx11w8Written (decl);
}

function hx11w8Written (decl: any): boolean {
    const name = decl.name.text;
    let written = false;
    const visit = (n: any) => {
        const p: any = n.parent;
        if ((n.kind === ts.SyntaxKind.Identifier) && (n.text === name) && (p?.kind === ts.SyntaxKind.BinaryExpression) && (p.left === n)
            && (p.operatorToken.kind >= ts.SyntaxKind.FirstAssignment) && (p.operatorToken.kind <= ts.SyntaxKind.LastAssignment)) { written = true; }
        n.forEachChild (visit);
    };
    decl.parent.body?.forEachChild (visit);
    return written;
}

function hx11w8CallsPassBool (self: any, fn: any, index: number): boolean {
    const checker = self.checkerOrUndefined ();
    for (const call of self.goSameFileCallsOf (fn, fn.name.text)) {
        const arg = call.arguments?.[index];
        if ((arg === undefined) || !hx11w8ArgIsBool (arg, checker)) { return false; }
    }
    const tree = self.goTsSrcTree (fn.getSourceFile ());
    if (tree === undefined) { return true; }
    const myClass = self.goEnclosingClassName (fn);
    const myFile = tree.relativeOf.get (path.resolve (fn.getSourceFile ().fileName));
    for (const site of tree.callIndex.get (fn.name.text) ?? []) {
        if ((site.file === myFile) || !self.goTsSrcFileDerivesFrom (tree, site.file, myClass)) { continue; }
        if (!/^\(*\s*(?:true|false)\s*\)*$/.test (site.args[index] ?? '')) { return false; }
    }
    return true;
}

export function installHx11w8AsyncBool (goTranspiler: any) {
    const flag = 'hx11w8AsyncBoolInstalled';
    if ((goTranspiler === undefined) || (goTranspiler[flag] === true) || (typeof goTranspiler.goNativeParameterTypeOf !== 'function')
       ) {
        return;
    }
    goTranspiler[flag] = true;
    const upstream = goTranspiler.goNativeParameterTypeOf;
    goTranspiler.goNativeParameterTypeOf = function (this: any, param: any) {
        const result = upstream.call (this, param);
        if (result !== undefined) { return result; }
        const fn: any = param.parent;
        if ((param.initializer !== undefined) || (param.dotDotDotToken !== undefined) || (param.name?.kind !== ts.SyntaxKind.Identifier)
            || (fn?.kind !== ts.SyntaxKind.MethodDeclaration) || (fn.body === undefined) || (fn.name?.kind !== ts.SyntaxKind.Identifier)
            || !this.isAsyncFunction (fn) || (String (param.type?.getText () ?? '').trim () !== 'boolean')
            || fn.name.text.startsWith ('parse') || this.goIsProHandlerMethod (fn) || this.goMethodKeepsBaseSignature (fn)
            || !this.goHasTreeCallSite (fn)) {
            return undefined;
        }
        const index = fn.parameters.indexOf (param);
        return (hx11w8CallsPassBool (this, fn, index)
            && this.goLocalIsSafeToType (fn.body, param, param.name.text, 'bool')
            && this.goParameterKeepsNilCompareNative (fn.body, param, 'bool')) ? 'bool' : undefined;
    };
}
