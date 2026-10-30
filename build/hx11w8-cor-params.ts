// hx11 w8 printer-go-createorderrequest-params-typed.
// An exchange-local `createOrderRequest (symbol: string, type: OrderType, side: OrderSide, ...)` prints `string`
// parameters when every call site passes a Go `string`. The printer proves the same-file sites by their printed
// type, but its sibling-file (pro/<x>.ts) text proof accepts only a quoted literal for `string`, so the
// `createOrderWs` caller kept `symbol`/`type`/`side` as `any` and every `type.toUpperCase ()` / `side === 'buy'`
// printed ToUpper/IsEqual helpers. A sibling site that passes a parameter of the enclosing method straight through
// is a Go `string` whenever that method's slot is in the printer's unified string table (createOrderWs 0,1,2 prints
// `string` on the base, every override and the interface), so the proof is sound; the parameter must not be
// reassigned in that method. Everything else keeps failing closed.
import path from 'path';
import { ts } from './csharp-local-types.js';

const SIGNATURE = /\n {4}(?:(?:override|async|public|private|protected) )*([A-Za-z_$][\w$]*) \(([^\n]*)\)(?:: [^\n{]*)? \{/g;

// top-level comma split of a one-line TS parameter list
function splitParams (list: string): string[] {
    const out: string[] = [];
    let depth = 0;
    let cur = '';
    for (const c of list) {
        if ('([{<'.includes (c)) { depth++; } else if (')]}>'.includes (c)) { depth--; }
        if ((c === ',') && (depth === 0)) { out.push (cur); cur = ''; } else { cur += c; }
    }
    out.push (cur);
    return out.map ((p) => p.trim ());
}

function siblingPassesUnifiedString (go: any, text: string, at: number | undefined, arg: string): boolean {
    const name = /^([A-Za-z_$][\w$]*)$/.exec ((arg ?? '').trim ())?.[1];
    if ((name === undefined) || (at === undefined)) { return false; }
    const head = text.substring (0, at);
    let last: RegExpExecArray | null = null;
    let m: RegExpExecArray | null;
    SIGNATURE.lastIndex = 0;
    while ((m = SIGNATURE.exec (head)) !== null) { last = m; }
    if (last === null) { return false; }
    const method = last[1];
    const slots: number[] | undefined = Object.prototype.hasOwnProperty.call (go.unifiedStringParams ?? {}, method) ? go.unifiedStringParams[method] : undefined;
    if (slots === undefined) { return false; }
    const params = splitParams (last[2]);
    const index = params.findIndex ((p) => new RegExp ('^' + name.replace (/\$/g, '\\$') + ':').test (p));
    if ((index < 0) || !slots.includes (index) || /[=?]/.test (params[index].split (':')[0]) || /=/.test (params[index])) { return false; }
    const body = head.substring (last.index + last[0].length);
    return !new RegExp ('(?<![\\w.$])' + name.replace (/\$/g, '\\$') + '\\s*(?:[-+*/]?=(?!=)|\\+\\+|--)').test (body);
}

export function installHx11w8CorParams (goTranspiler: any) {
    const flag = 'hx11w8CorParamsInstalled';
    if ((goTranspiler === undefined) || (goTranspiler[flag] === true) || (typeof goTranspiler.goParameterCallSitesPassType !== 'function')
        || (typeof goTranspiler.goSameFileCallsOf !== 'function') || (typeof goTranspiler.goTsSrcTree !== 'function')) {
        return;
    }
    goTranspiler[flag] = true;
    // hx11 w8 printer-go-binance-handleclientorderid-api-isequal-string: a defaulted `method: string = 'GET'` parameter is
    // bound by GetArgString, so it is a Go `string` at every consumer. The upstream identifier proof stops at
    // goNativeParameterType (undefined for any defaulted parameter), so a call site `this.f (..., method)` never proved `string`.
    const upstreamPrinted = goTranspiler.goPrintedArgType;
    if (typeof upstreamPrinted === 'function') {
        goTranspiler.goPrintedArgType = function (this: any, arg: any) {
            const printed = upstreamPrinted.call (this, arg);
            if ((printed !== undefined) || (arg?.kind !== ts.SyntaxKind.Identifier) || (typeof this.goGetArgParameterType !== 'function')) { return printed; }
            const decl = this.checkerOrUndefined ()?.getSymbolAtLocation (arg)?.valueDeclaration?.resolve?.();
            return ((decl?.kind === ts.SyntaxKind.Parameter) && (this.goGetArgParameterType (decl) === 'string')) ? 'string' : printed;
        };
    }
    const upstream = goTranspiler.goParameterCallSitesPassType;
    goTranspiler.goParameterCallSitesPassType = function (this: any, fn: any, index: number, goType: string) {
        if (upstream.call (this, fn, index, goType)) { return true; }
        // only the order-request builders: every other method keeps the upstream verdict
        if ((goType !== 'string') || !/^(create|edit)\w*OrderRequest$/.test (fn?.name?.text ?? '')) { return false; }
        const name = fn.name.text;
        for (const call of this.goSameFileCallsOf (fn, name)) {
            const arg = call.arguments?.[index];
            if ((arg === undefined) || ts.isSpreadElement (arg) || (this.goPrintedArgType (arg) !== 'string')) { return false; }
        }
        const tree = this.goTsSrcTree (fn.getSourceFile ());
        if (tree === undefined) { return true; }
        const myClass = this.goEnclosingClassName (fn);
        const myFile = tree.relativeOf.get (path.resolve (fn.getSourceFile ().fileName));
        for (const site of tree.callIndex.get (name) ?? []) {
            if ((site.file === myFile) || !this.goTsSrcFileDerivesFrom (tree, site.file, myClass)) { continue; }
            const arg = site.args[index];
            if ((arg === undefined) || !(this.goTextArgMatchesType (arg, 'string', site.file, tree, site.at)
                || siblingPassesUnifiedString (this, tree.fileText.get (site.file) ?? '', site.at, arg))) {
                return false;
            }
        }
        return true;
    };
}
