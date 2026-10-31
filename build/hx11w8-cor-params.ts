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
            if (decl?.kind === ts.SyntaxKind.Parameter) { return (this.goGetArgParameterType (decl) === 'string') ? 'string' : printed; }
            // `const [ marketType, query ] = this.handleMarketTypeAndParams (...)`: slot 0 is the *string tuple result
            const isSlot0 = (decl?.kind === ts.SyntaxKind.BindingElement) && (decl.parent?.kind === ts.SyntaxKind.ArrayBindingPattern) && (decl.parent.elements[0] === decl);
            const holder = isSlot0 ? decl.parent.parent : undefined;
            const init = holder?.initializer;
            const constant = ((holder?.parent?.flags ?? 0) & ts.NodeFlags.Const) !== 0;
            return (constant && (init?.kind === ts.SyntaxKind.CallExpression) && (init.expression?.name?.text === 'handleMarketTypeAndParams')) ? '*string' : printed;
        };
    }
    // hx11 w8 printer-go-bingx-getorderbooklimitbymarkettype: pro/bingx only, keyed by class + method (never the
    // global string table). The method has no caller in ts/src, so its required `marketType: string` is a Go string.
    const upstreamNative = goTranspiler.goNativeParameterTypeOf;
    if (typeof upstreamNative === 'function') {
        goTranspiler.goNativeParameterTypeOf = function (this: any, param: any) {
            const result = upstreamNative.call (this, param);
            const fn: any = param?.parent;
            if ((result !== undefined) || (fn?.kind !== ts.SyntaxKind.MethodDeclaration) || (fn.name?.text !== 'getOrderBookLimitByMarketType')
                || (this.goEnclosingClassName (fn) !== 'bingx') || (fn.parameters.indexOf (param) !== 0) || (param.initializer !== undefined)
                || !/[\\/]pro[\\/]bingx\.ts$/.test (fn.getSourceFile ().fileName) || (this.goRequiredStringParameterType (param) !== 'string')
                || this.goHasTreeCallSite (fn) || (this.goTsSrcTree (fn.getSourceFile ())?.callIndex.get ('getOrderBookLimitByMarketType') ?? []).length > 0) {
                return result;
            }
            return (this.goLocalIsSafeToType (fn.body, param, param.name.text, 'string')
                && this.goParameterKeepsNilCompareNative (fn.body, param, 'string')) ? 'string' : result;
        };
    }
    // hx11 w8 printer-go-hitbtc-convertcurrencynetwork: hitbtc.ts only, keyed by class + method + slot (no global table).
    // The method has no caller in ts/src, so the required `fromNetwork`/`toNetwork: string` params are Go strings.
    const upstreamHitbtcNative = goTranspiler.goNativeParameterTypeOf;
    if (typeof upstreamHitbtcNative === 'function') {
        goTranspiler.goNativeParameterTypeOf = function (this: any, param: any) {
            const result = upstreamHitbtcNative.call (this, param);
            const fn: any = param?.parent;
            if ((result !== undefined) || (fn?.kind !== ts.SyntaxKind.MethodDeclaration) || (fn.name?.text !== 'convertCurrencyNetwork')
                || (this.goEnclosingClassName (fn) !== 'hitbtc') || ![ 2, 3 ].includes (fn.parameters.indexOf (param)) || (param.initializer !== undefined)
                || !/[\\/]hitbtc\.ts$/.test (fn.getSourceFile ().fileName) || (this.goRequiredStringParameterType (param) !== 'string')
                || this.goHasTreeCallSite (fn) || (this.goTsSrcTree (fn.getSourceFile ())?.callIndex.get ('convertCurrencyNetwork') ?? []).length > 0) {
                return result;
            }
            return (this.goLocalIsSafeToType (fn.body, param, param.name.text, 'string')
                && this.goParameterKeepsNilCompareNative (fn.body, param, 'string')) ? 'string' : result;
        };
    }

    // hx11 w8 printer-go-aster-pro-getaccounttypefromurl: pro/aster only, keyed by class + method (never the global
    // string table). Every caller passes `client.url` of a `client: Client` parameter, which prints GetUrl() string.
    const upstreamNative = goTranspiler.goNativeParameterTypeOf;
    if (typeof upstreamNative === 'function') {
        goTranspiler.goNativeParameterTypeOf = function (this: any, param: any) {
            const result = upstreamNative.call (this, param);
            const fn: any = param?.parent;
            if ((result !== undefined) || (fn?.kind !== ts.SyntaxKind.MethodDeclaration) || (fn.name?.text !== 'getAccountTypeFromUrl')
                || (this.goEnclosingClassName (fn) !== 'aster') || (fn.parameters.indexOf (param) !== 0) || (param.initializer !== undefined)
                || !/[\\/]pro[\\/]aster\.ts$/.test (fn.getSourceFile ().fileName) || (this.goRequiredStringParameterType (param) !== 'string')) {
                return result;
            }
            const calls = this.goSameFileCallsOf (fn, 'getAccountTypeFromUrl');
            const tree = this.goTsSrcTree (fn.getSourceFile ());
            const otherFile = (tree?.callIndex.get ('getAccountTypeFromUrl') ?? []).some ((site: any) => this.goTsSrcFileDerivesFrom (tree, site.file, 'aster') && (site.file !== tree.relativeOf.get (path.resolve (fn.getSourceFile ().fileName))));
            const clientUrl = (arg: any) => {
                const decl = (arg?.kind === ts.SyntaxKind.PropertyAccessExpression && arg.name.text === 'url' && arg.expression.kind === ts.SyntaxKind.Identifier)
                    ? this.checkerOrUndefined ()?.getSymbolAtLocation (arg.expression)?.valueDeclaration?.resolve?.() : undefined;
                return (decl?.kind === ts.SyntaxKind.Parameter) && (decl.type?.getText () === 'Client');
            };
            if (otherFile || (calls.length === 0) || !calls.every ((call: any) => clientUrl (call.arguments?.[0]))) {
                return result;
            }
            return (this.goLocalIsSafeToType (fn.body, param, param.name.text, 'string')
                && this.goParameterKeepsNilCompareNative (fn.body, param, 'string')) ? 'string' : result;
        };
    }
    // hx11 w8 printer-go-gate-pro-getmarkettypebyurl: pro/gate only, keyed by class + method. Its one caller passes
    // `client.url` of a `client: Client` parameter, which Go prints as the string `GetUrl()`.
    const upstreamUrl = goTranspiler.goParameterCallSitesPassType;
    goTranspiler.goParameterCallSitesPassType = function (this: any, fn: any, index: number, goType: string) {
        if (upstreamUrl.call (this, fn, index, goType)) { return true; }
        if ((goType !== 'string') || (index !== 0) || (fn?.name?.text !== 'getMarketTypeByUrl') || (this.goEnclosingClassName (fn) !== 'gate')
            || !/[\\/]pro[\\/]gate\.ts$/.test (fn.getSourceFile ().fileName)) { return false; }
        const calls = this.goSameFileCallsOf (fn, 'getMarketTypeByUrl');
        const tree = this.goTsSrcTree (fn.getSourceFile ());
        if ((calls.length === 0) || ((tree?.callIndex.get ('getMarketTypeByUrl') ?? []).length !== calls.length)) { return false; }
        return calls.every ((call: any) => {
            const arg = call.arguments?.[0];
            const holder = arg?.expression;
            if ((arg?.kind !== ts.SyntaxKind.PropertyAccessExpression) || (arg.name.text !== 'url') || (holder?.kind !== ts.SyntaxKind.Identifier)) { return false; }
            const decl = this.checkerOrUndefined ()?.getSymbolAtLocation (holder)?.valueDeclaration?.resolve?.();
            return (decl?.kind === ts.SyntaxKind.Parameter) && (decl.type?.getText () === 'Client');
        });
    };
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
