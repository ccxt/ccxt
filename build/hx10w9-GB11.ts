// ===== hx10 wave9 GB11: `handleErrors` takes its status code as int64 =====
// Every venue override declares `code: int` (an alias of `number`) and reads it only as a numeric
// comparison or a `code.toString ()`. The printer pins the whole family to the base signature
// (goMethodKeepsBaseSignature: every override carries `override`), so the code parameter printed
// `any` and every `code === 418` / `code >= 400` / `code.toString ()` kept IsEqual / the ordered
// helpers / ToString. This module answers only where the printer answered `undefined`, and only for
// a code the body never writes, never compares with nil and never treats as a string; the two
// dynamic call sites and the hand-written exchange_req.go pass an int64 (see campaign notes).

import fs from 'fs';
import os from 'os';
import path from 'path';
import Transpiler from 'ast-transpiler';
import { ts } from './csharp-local-types.js';

const GB11_METHOD = 'handleErrors';
const GB11_INDEX = 0;
// declared TS types that name a whole number: `int` is `number`, `Int` is `number | undefined`
// (the nil arm is dead: no body in the family tests the code against nil, and the Go interface now
// takes an int64, so no caller can pass one)
const GB11_NUMERIC_TYPES = [ 'int', 'number', 'Int' ];
const GB11_COMPARISONS: { [kind: number]: boolean } = {};

function gb11ComparisonOperators (SK: any) {
    if (Object.keys (GB11_COMPARISONS).length !== 0) {
        return GB11_COMPARISONS;
    }
    for (const op of [ 'EqualsEqualsToken', 'EqualsEqualsEqualsToken', 'ExclamationEqualsToken', 'ExclamationEqualsEqualsToken',
        'LessThanToken', 'LessThanEqualsToken', 'GreaterThanToken', 'GreaterThanEqualsToken' ]) {
        GB11_COMPARISONS[(SK as any)[op]] = true;
    }
    return GB11_COMPARISONS;
}

// the identifier refers to this very parameter (a shadowing local answers false)
function gb11RefersToParam (go: any, node: any, param: any): boolean {
    const checker = go.checkerOrUndefined ();
    if (checker === undefined) {
        return false;
    }
    try {
        const symbol = checker.getSymbolAtLocation (node);
        return symbol?.valueDeclaration?.resolve () === param;
    } catch (e) {
        return false;
    }
}

// every read of the code is a numeric-literal comparison, a `.toString ()` receiver, or the argument
// of `this.parseToInt (...)`: the three shapes a Go int64 answers exactly like the boxed value did
function gb11UsesAreIntOnly (go: any, body: any, param: any): boolean {
    const SK = ts.SyntaxKind;
    const comparisons = gb11ComparisonOperators (SK);
    const name = param.name.text;
    let ok = true;
    const visit = (n: any) => {
        if (!ok || (n === undefined)) {
            return;
        }
        if ((n.kind === SK.Identifier) && (n.text === name) && gb11RefersToParam (go, n, param)) {
            const parent = n.parent;
            if ((parent?.kind === SK.PropertyAccessExpression) && (parent.expression === n) && (parent.name?.text === 'toString')) {
                return;
            }
            if ((parent?.kind === SK.BinaryExpression) && comparisons[parent.operatorToken?.kind]) {
                const other = (parent.left === n) ? parent.right : parent.left;
                const literal = (other?.kind === SK.NumericLiteral) || ((other?.kind === SK.PrefixUnaryExpression) && (other.operator === SK.MinusToken) && (other.operand?.kind === SK.NumericLiteral));
                if (!literal) {
                    ok = false;
                }
                return;
            }
            if ((parent?.kind === SK.CallExpression) && (parent.arguments ?? []).includes (n)) {
                const callee = parent.expression;
                if ((callee?.kind === SK.PropertyAccessExpression) && (callee.name?.text === 'parseToInt')) {
                    return;
                }
            }
            ok = false;
            return;
        }
        n.forEachChild (visit);
    };
    body.forEachChild (visit);
    return ok;
}

function gb11Derived (go: any, param: any): string | undefined {
    const SK = ts.SyntaxKind;
    if (param?.kind !== SK.Parameter) { return undefined; }
    if ((param.dotDotDotToken !== undefined) || (param.initializer !== undefined)) { return undefined; }
    if (param.name?.kind !== SK.Identifier) { return undefined; }
    const fn = param.parent;
    if ((fn?.kind !== SK.MethodDeclaration) || (fn.body === undefined) || (fn.name?.kind !== SK.Identifier)) { return undefined; }
    if (fn.name.text !== GB11_METHOD) { return undefined; }
    if (fn.parameters.indexOf (param) !== GB11_INDEX) { return undefined; }
    if (go.isAsyncFunction (fn)) { return undefined; }
    const declared = param.type === undefined ? undefined : String (param.type.getText ()).trim ();
    if (GB11_NUMERIC_TYPES.indexOf (declared) < 0) { return undefined; }
    if (!go.goLocalIsSafeToType (fn.body, param, param.name.text, 'int64')) { return undefined; }
    if (!go.goParameterKeepsNilCompareNative (fn.body, param, 'int64')) { return undefined; }
    if (!gb11UsesAreIntOnly (go, fn.body, param)) { return undefined; }
    return 'int64';
}

// splits a printed argument list at its top-level commas (string literals and the three bracket kinds
// nest), so the first argument of an already-mapped list can be replaced without re-printing the rest
function gb11SplitArgs (text: string): string[] | undefined {
    const parts: string[] = [];
    let depth = 0;
    let start = 0;
    let quote: string | undefined;
    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (quote !== undefined) {
            if (c === '\\') { i++; continue; }
            if (c === quote) { quote = undefined; }
            continue;
        }
        if ((c === '"') || (c === '`') || (c === '\'')) { quote = c; continue; }
        if ((c === '(') || (c === '[') || (c === '{')) { depth++; continue; }
        if ((c === ')') || (c === ']') || (c === '}')) { depth--; continue; }
        if ((c === ',') && (depth === 0)) {
            parts.push (text.substring (start, i));
            start = i + 1;
        }
    }
    if (quote !== undefined || depth !== 0) { return undefined; }
    parts.push (text.substring (start));
    return parts;
}

// a call argument that is already an int64 in Go: an untyped numeric constant adapts to the
// parameter type, and a local the printer declares `int64` (pro/binance's `codeValue`) needs no work
function gb11ArgIsInt64 (go: any, arg: any): boolean {
    const SK = ts.SyntaxKind;
    if (arg?.kind === SK.NumericLiteral) { return true; }
    if ((arg?.kind === SK.PrefixUnaryExpression) && (arg.operator === SK.MinusToken) && (arg.operand?.kind === SK.NumericLiteral)) { return true; }
    return go.goPrintedArgType (arg) === 'int64';
}

// `this.handleErrors (...)` with a code the printer cannot name as int64 goes through the base
// ParseToInt (pro/bitvavo passes a nullable *int64 there). The rest of the argument list is the
// printer's own answer, including whatever a previously installed hook answered.
function gb11CodeArg (go: any, node: any, printed: string): string | undefined {
    const SK = ts.SyntaxKind;
    const callee = node.expression;
    if (callee?.kind !== SK.PropertyAccessExpression) { return undefined; }
    if (callee.name?.text !== GB11_METHOD) { return undefined; }
    if (callee.expression?.kind !== SK.ThisKeyword) { return undefined; }
    const args = node.arguments ?? [];
    if ((args.length === 0) || args.some ((a: any) => a.kind === SK.SpreadElement)) { return undefined; }
    if (gb11ArgIsInt64 (go, args[0])) { return undefined; }
    const parts = gb11SplitArgs (printed);
    if ((parts === undefined) || (parts.length !== args.length)) { return undefined; }
    parts[0] = 'this.ParseToInt(' + parts[0].trim () + ')';
    return parts.join (',');
}

// installs the derivation on a Go printer instance; the main transpiler and the piscina worker both
// call this, or the two code paths emit different Go for the same source
export function installCcxtGoGb11HandleErrorsCode (goTranspiler: any) {
    const flag = 'hx10Gb11w9Installed';
    const current = goTranspiler.goNativeParameterType as any;
    if (current?.[flag] === true) { return current; }
    const originalArgs = goTranspiler.goUnifiedStringCallArgs;
    // the previous hook (go-local-types derefs a *string argument into `*x`) runs exactly once: the
    // code rewrite only touches the text it answered
    const args = function (this: any, node: any, identation: any, flat: boolean = false) {
        const printed = originalArgs.call (this, node, identation, flat);
        if (printed === undefined) { return printed; }
        const rewritten = gb11CodeArg (this, node, printed);
        return (rewritten !== undefined) ? rewritten : printed;
    };
    (args as any)[flag] = true;
    goTranspiler.goUnifiedStringCallArgs = args;
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
            derived = gb11Derived (this, param);
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
// One stub base class carries handleErrors; the venue override owns the body shapes under test.
const GB11_TEST_BASE = `export type Dict = { [key: string]: any };
export class Exchange {
    id: string = 'x';
    safeInteger (o: any, k: string): any { return o[k]; }
    handleErrors (statusCode: int, statusText: string, url: string, method: string, responseHeaders: Dict, responseBody: string, response: any, requestHeaders: any, requestBody: any) {
        throw new Error (this.id + ' not implemented');
    }
}
`;
const GB11_TEST_EXCHANGE = `import { Exchange, Dict } from './base/Exchange';
export class ex extends Exchange {
    override handleErrors (code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any) {
        if ((code === 418) || (code === 429)) {
            throw new Error (this.id + ' ' + code.toString () + ' ' + reason);
        }
        if (code >= 400) {
            throw new Error ('http ' + code.toString ());
        }
        return undefined;
    }
    handleOther (code: int) { return code === 400; }
    run (err: any) {
        const code = this.safeInteger (err, 'code');
        this.handleErrors (code, '', '', '', {}, '', err, {}, {});
        this.handleErrors (418, '', '', '', {}, '', err, {}, {});
    }
}
`;
// a body that reads the code as a string, one that tests it against undefined, and one that writes it
const GB11_TEST_UNSAFE = `import { Exchange, Dict } from './base/Exchange';
export class ex extends Exchange {
    override handleErrors (code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any) {
        if (code === undefined) { return undefined; }
        return undefined;
    }
}
`;
// a nullable `Int` declaration whose body never tests the code against nil still prints int64
const GB11_TEST_NULLABLE = `import { Exchange, Dict } from './base/Exchange';
export class ex extends Exchange {
    override handleErrors (code: Int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any) {
        if (code === 401) { return undefined; }
        return undefined;
    }
}
`;
const GB11_TEST_REASSIGNED = `import { Exchange, Dict } from './base/Exchange';
export class ex extends Exchange {
    override handleErrors (code: any, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any) {
        code = this.safeString (response, 'code');
        if (code === 400) { return undefined; }
        return undefined;
    }
}
`;

export function hx10w9GB11Check (): string[] {
    const problems: string[] = [];
    const ok = (condition: boolean, message: string) => { if (!condition) { problems.push ('hx10 w9 GB11: ' + message); } };
    const tmp = fs.mkdtempSync (path.join (os.tmpdir (), 'hx10-GB11w9-'));
    try {
        const src = path.join (tmp, 'ts', 'src');
        fs.mkdirSync (path.join (src, 'base'), { recursive: true });
        fs.writeFileSync (path.join (src, 'base', 'Exchange.ts'), GB11_TEST_BASE);
        fs.writeFileSync (path.join (src, 'ex.ts'), GB11_TEST_EXCHANGE);
        fs.writeFileSync (path.join (src, 'unsafe.ts'), GB11_TEST_UNSAFE);
        fs.writeFileSync (path.join (src, 'reassigned.ts'), GB11_TEST_REASSIGNED);
        fs.writeFileSync (path.join (src, 'nullable.ts'), GB11_TEST_NULLABLE);
        const print = (file: string, install: boolean): string => {
            const t: any = new Transpiler ({ verbose: false, go: { unifiedStringParams: { 'handleErrors': [ 2, 5 ] } } });
            if (install) { installCcxtGoGb11HandleErrorsCode (t.goTranspiler); }
            return t.transpileGoByPath (path.join (src, file)).content;
        };
        const fnBody = (go: string, name: string) => (go.split (/\nfunc /).find ((f) => f.indexOf (' ' + name + '(') >= 0) ?? '');
        const base = print ('base/Exchange.ts', false);
        const baseHooked = print ('base/Exchange.ts', true);
        const exHooked = print ('ex.ts', true);
        const handle = fnBody (exHooked, 'HandleErrors');
        ok (fnBody (base, 'HandleErrors').indexOf ('(statusCode any,') >= 0, 'the base generator boxes the code');
        ok (fnBody (baseHooked, 'HandleErrors').indexOf ('(statusCode int64,') >= 0, 'the base method types the code: ' + fnBody (baseHooked, 'HandleErrors'));
        ok (handle.indexOf ('(code int64,') >= 0, 'a venue override types the code: ' + handle);
        ok (handle.indexOf ('code == 418') >= 0, 'a numeric comparison is native: ' + handle);
        ok (handle.indexOf ('code >= 400') >= 0, 'an ordered comparison is native: ' + handle);
        ok (handle.indexOf ('IsEqual(code') < 0 && handle.indexOf ('IsGreaterThan') < 0, 'no comparison helper survives');
        ok (handle.indexOf ('ToString(code)') < 0, 'the string conversion bails out of the helper: ' + handle);
        ok (fnBody (exHooked, 'HandleOther').indexOf ('(code any)') >= 0, 'a method outside the table keeps the box');
        ok (fnBody (print ('unsafe.ts', true), 'HandleErrors').indexOf ('(code any,') >= 0, 'a nil compare keeps the box');
        ok (fnBody (print ('reassigned.ts', true), 'HandleErrors').indexOf ('(code any,') >= 0, 'a written code keeps the box');
        ok (fnBody (print ('nullable.ts', true), 'HandleErrors').indexOf ('(code int64,') >= 0, 'a nullable Int without a nil compare types the code');
        const run = fnBody (exHooked, 'Run');
        ok (run.indexOf ('this.HandleErrors(this.ParseToInt(code),') >= 0, 'a boxed call argument converts: ' + run);
        ok (run.indexOf ('this.HandleErrors(418,') >= 0, 'a numeric literal stays a literal: ' + run);
    } catch (e: any) {
        problems.push ('hx10 w9 GB11 threw: ' + e.message);
    } finally {
        fs.rmSync (tmp, { recursive: true, force: true });
    }
    return problems;
}
