// hx10w3 J06 — awaited CompletableFuture results and destructured tuple slots that still print
// `Object` take the box their TS type proves, so the reads and writes on them print natively.
//
// Two outcomes per declaration: the TS type proves a json-object box -> the declaration prints
// `java.util.Map<String, Object>` with the checkcast the erased `.join()` / tuple `get` needs (the
// value is that map on every path the TS type allows); every unproven declaration keeps the
// `Object` line the base printed, helper calls included.
//
// The retype is only emitted when EVERY use of the local in its function is an element access
// (`x[k]` read or write), i.e. exactly the sites the native get/put rules rewrite. Any other use
// (argument position, copy, comparison, receiver) declines, so no call in the file can rebind a
// typed overload through the new static type.

import fs from 'node:fs';
import path from 'node:path';
import { ts } from './csharp-local-types.js';
import { publishJavaDeclaredLocalTypes } from './java-local-types.js';

const J06_MAP_TYPE = 'java.util.Map<String, Object>';

function j06IsThisKeyword (node: any): boolean {
    return node !== undefined && node.kind === ts.SyntaxKind.ThisKeyword;
}

function j06IsSuperKeyword (node: any): boolean {
    return node !== undefined && node.kind === ts.SyntaxKind.SuperKeyword;
}

function j06UnwrapParens (node: any): any {
    let current = node;
    while (current !== undefined && current.kind === ts.SyntaxKind.ParenthesizedExpression) {
        current = current.expression;
    }
    return current;
}

// a json object box: an object type with a string index signature and no numeric one, i.e. a
// Dict / Dictionary / Markets map. Arrays, tuples, DTOs, primitives and unions all decline.
function j06JsonBoxType (checker: any, type: any): string | undefined {
    if (type === undefined || type === null) {
        return undefined;
    }
    if (!(type.flags & ts.TypeFlags.Object)) {
        return undefined;
    }
    try {
        if (checker.isArrayType (type) || checker.isTupleType (type)) {
            return undefined;
        }
        const stringIndex = checker.getIndexTypeOfType (type, ts.IndexKind.String);
        if (stringIndex === undefined || stringIndex === null) {
            return undefined;
        }
        if (checker.getIndexTypeOfType (type, ts.IndexKind.Number) !== undefined) {
            return undefined;
        }
    } catch (e) {
        return undefined;
    }
    return J06_MAP_TYPE;
}

const J06_FUNCTION_PREDICATES = [ 'isMethodDeclaration', 'isFunctionDeclaration', 'isConstructorDeclaration',
    'isArrowFunction', 'isFunctionExpression', 'isGetAccessorDeclaration', 'isSetAccessorDeclaration' ];

// the function-like node a local of `node` lives in: uses cannot escape it
function j06EnclosingFunction (node: any): any {
    let current = node.parent;
    while (current !== undefined) {
        for (const predicate of J06_FUNCTION_PREDICATES) {
            const test = (ts as any)[predicate];
            if (typeof test === 'function' && test (current)) {
                return current;
            }
        }
        current = current.parent;
    }
    return undefined;
}

function j06SameSymbol (checker: any, node: any, nameNode: any): boolean {
    let symbol;
    let target;
    try {
        symbol = checker.getSymbolAtLocation (node);
        target = checker.getSymbolAtLocation (nameNode);
    } catch (e) {
        return false;
    }
    if (symbol === undefined || symbol === null || target === undefined || target === null) {
        return false;
    }
    return symbol === target || symbol.valueDeclaration === target.valueDeclaration;
}

// 'element' = the printed Java is a native get/put on this local; 'neutral' = the identifier is a
// property NAME, not a read of the local; 'other' = any use that would see the new static type
function j06UseVerdict (id: any): 'element' | 'neutral' | 'other' | 'value' {
    const parent = id.parent;
    if (parent === undefined || parent === null) {
        return 'other';
    }
    if (ts.isPropertyAccessExpression (parent) && parent.name === id) {
        return 'neutral';
    }
    // positions whose printed Java takes the box as an Object: a return, a copy, the value of a
    // dict element write. No overload is selected by the static type at any of them.
    if (parent.kind === ts.SyntaxKind.ReturnStatement && parent.expression === id) {
        return 'value';
    }
    if (parent.kind === ts.SyntaxKind.VariableDeclaration && parent.initializer === id) {
        return 'value';
    }
    if (parent.kind === ts.SyntaxKind.BinaryExpression && parent.right === id
        && parent.operatorToken?.kind === ts.SyntaxKind.EqualsToken) {
        return 'value';
    }
    if (ts.isElementAccessExpression (parent) && parent.expression === id) {
        const grand = parent.parent;
        if (ts.isDeleteExpression (grand) || ts.isSpreadElement (grand) || ts.isSpreadAssignment (grand)) {
            return 'other';
        }
        if (ts.isCallExpression (grand) && grand.expression === parent) {
            return 'other';
        }
        // a numeric / counter key takes the printer's LIST arm, which a Map box cannot honour
        const key = parent.argumentExpression;
        if (key !== undefined && (key.kind === ts.SyntaxKind.StringLiteral || key.kind === ts.SyntaxKind.NoSubstitutionTemplateLiteral || ts.isIdentifier (key))) {
            return 'element';
        }
        return 'other';
    }
    return 'other';
}

// every use is an element access (at least one), so the retype cannot reach any other position
// (the TS7 facade has no forEachChild: walk own node-valued properties, skipping the back edges)
const J06_WALK_SKIP = new Set ([ 'parent', 'symbol', 'locals', 'nextContainer', 'flowNode', 'emitNode', 'original', 'checker', 'resolvedSymbol' ]);

function j06Walk (node: any, visit: (node: any) => void, seen?: WeakSet<any>): void {
    const visited = seen ?? new WeakSet<any> ();
    if (visited.has (node)) {
        return;
    }
    visited.add (node);
    visit (node);
    for (const key of Object.keys (node)) {
        if (J06_WALK_SKIP.has (key)) {
            continue;
        }
        const value = (node as any)[key];
        if (Array.isArray (value)) {
            for (const item of value) {
                if (item !== null && typeof item === 'object' && typeof item.kind === 'number') {
                    j06Walk (item, visit, visited);
                }
            }
        } else if (value !== null && typeof value === 'object' && typeof value.kind === 'number') {
            j06Walk (value, visit, visited);
        }
    }
}

function j06ElementUsesOnly (printer: any, nameNode: any, scope: any): boolean {
    const checker = printer.getChecker ();
    let uses = 0;
    let ok = true;
    j06Walk (scope, (node: any) => {
        if (!ok || node === nameNode) {
            return;
        }
        if (ts.isIdentifier (node) && node.text === nameNode.text && j06SameSymbol (checker, node, nameNode)) {
            const verdict = j06UseVerdict (node);
            if (verdict === 'element') {
                uses++;
            } else if (verdict === 'other') {
                ok = false;
            }
        }
    });
    return ok && uses > 0;
}

// `const x = await this.m (...)` -> the awaited TS type is the box; the printed initialiser is the
// erased `.join()` of a `CompletableFuture<Object>`, so the declaration carries the checkcast
function j06AwaitRetype (printer: any, declaration: any, printed: string, iden: string, printedName: string): string | undefined {
    const initializer = declaration.initializer;
    if (initializer === undefined || initializer.kind !== ts.SyntaxKind.AwaitExpression) {
        return undefined;
    }
    const call = j06UnwrapParens (initializer.expression);
    if (call === undefined || call.kind !== ts.SyntaxKind.CallExpression) {
        return undefined;
    }
    const callee = call.expression;
    if (callee === undefined || !ts.isPropertyAccessExpression (callee)) {
        return undefined;
    }
    const receiver = callee.expression;
    if (!j06IsThisKeyword (receiver) && !j06IsSuperKeyword (receiver)) {
        return undefined;
    }
    const marker = iden + 'Object ' + printedName + ' = ';
    const trimmed = printed.trimEnd ();
    if (printed.slice (0, marker.length) !== marker || !trimmed.endsWith ('.join()') && !trimmed.endsWith ('.join();')) {
        return undefined;
    }
    let type;
    try {
        type = printer.getChecker ().getTypeAtLocation (initializer);
    } catch (e) {
        return undefined;
    }
    const javaType = j06JsonBoxType (printer.getChecker (), type);
    if (javaType === undefined) {
        return undefined;
    }
    const scope = j06EnclosingFunction (declaration);
    const elementOnly = scope !== undefined && j06ElementUsesOnly (printer, declaration.name, scope);
    if (process.env['J06_DEBUG'] === '1') {
        console.error ('j06 await', printedName, 'box', javaType, 'elemOnly', elementOnly);
    }
    if (!elementOnly) {
        return undefined;
    }
    return iden + javaType + ' ' + printedName + ' = (' + javaType + ') ' + printed.slice (marker.length);
}

function j06EscapeRegExp (text: string): string {
    return text.replace (/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// `const [ a, b ] = this.m (...)` -> per slot, the tuple element's TS box; the printed element line
// is the holder read `((List<Object>) h).get(i)` the destructuring block emits
function j06TupleRetype (printer: any, declaration: any, printed: string, typed: WeakMap<any, string>): string {
    const pattern = declaration.name;
    if (pattern === undefined || pattern.kind !== ts.SyntaxKind.ArrayBindingPattern) {
        return printed;
    }
    const elements = pattern.elements ?? [];
    const call = j06UnwrapParens (declaration.initializer);
    if (call === undefined || call.kind !== ts.SyntaxKind.CallExpression) {
        return printed;
    }
    const checker = printer.getChecker ();
    let elementTypes: any;
    try {
        const type = checker.getTypeAtLocation (call);
        if (!checker.isTupleType (type)) {
            return printed;
        }
        elementTypes = checker.getTypeArguments (type);
    } catch (e) {
        return printed;
    }
    if (elementTypes === undefined || elementTypes.length !== elements.length) {
        return printed;
    }
    const scope = j06EnclosingFunction (declaration);
    if (scope === undefined) {
        return printed;
    }
    let out = printed;
    for (let index = 0; index < elements.length; index++) {
        const element = elements[index];
        if (element === undefined || element.kind !== ts.SyntaxKind.BindingElement) {
            continue;
        }
        if (element.dotDotDotToken !== undefined || element.initializer !== undefined) {
            continue;
        }
        const nameNode = element.name;
        if (nameNode === undefined || nameNode.kind !== ts.SyntaxKind.Identifier) {
            continue;
        }
        const javaType = j06JsonBoxType (checker, elementTypes[index]);
        if (javaType === undefined || !j06ElementUsesOnly (printer, nameNode, scope)) {
            continue;
        }
        const printedName = printer.printNode (nameNode, 0);
        const rx = new RegExp ('^(\\s*)var ' + j06EscapeRegExp (printedName)
            + ' = \\(\\((?:java\\.util\\.)?List<Object>\\) (\\w+)\\)\\.get\\(' + index + '\\);$', 'm');
        const match = rx.exec (out);
        if (match === null) {
            continue;
        }
        const holder = match[2];
        const replacement = match[1] + javaType + ' ' + printedName + ' = (' + javaType + ') ((java.util.List<Object>) '
            + holder + ').get(' + index + ');';
        out = out.slice (0, match.index) + replacement + out.slice (match.index + match[0].length);
        typed.set (element, javaType);
    }
    return out;
}

export function installJ06TupleAsyncLocals (transpiler: any): void {
    const printer = transpiler?.javaTranspiler ?? transpiler;
    if (!printer || typeof printer.printVariableDeclarationList !== 'function' || printer._hx10w3J06Patched) {
        return;
    }
    printer._hx10w3J06Patched = true;
    // the retyped locals answer their declared box here, so the printer's own element-read arm
    // (`x[k]` with a String key -> guarded `x.get(k)`) fires on them
    const typed = new WeakMap<any, string> ();
    publishJavaDeclaredLocalTypes (printer, (declaration: any) => typed.get (declaration));
    const original = printer.printVariableDeclarationList.bind (printer);
    printer.printVariableDeclarationList = function (node: any, identation: any) {
        const printed = original (node, identation);
        if (typeof printed !== 'string') {
            return printed;
        }
        const declarations = node?.declarations;
        if (declarations === undefined || declarations.length !== 1) {
            return printed;
        }
        const declaration = declarations[0];
        if (declaration === undefined) {
            return printed;
        }
        if (declaration.name?.kind === ts.SyntaxKind.ArrayBindingPattern) {
            return j06TupleRetype (printer, declaration, printed, typed);
        }
        if (declaration.name?.kind !== ts.SyntaxKind.Identifier) {
            return printed;
        }
        const iden = printer.getIden (identation);
        if (typeof iden !== 'string') {
            return printed;
        }
        const printedName = printer.printNode (declaration.name, 0);
        const retyped = j06AwaitRetype (printer, declaration, printed, iden, printedName);
        if (retyped === undefined) {
            return printed;
        }
        typed.set (declaration, J06_MAP_TYPE);
        return retyped;
    };
}

// snippet checks: the probe prints through the real printer, so the assertions are the emitted lines
export function j06TupleAsyncSelfTest (transpiler: any): string[] {
    const problems: string[] = [];
    if (transpiler === undefined || transpiler === null) {
        return [ 'j06: no transpiler' ];
    }
    const probe = path.join (process.cwd (), 'ts', 'src', `zzj06tupleasync${process.pid}.ts`);
    const body = [
        "import Exchange from './abstract/binance.js';",
        "import type { Dict } from './base/types.js';",
        'export default class zzj06tupleasync extends Exchange {',
        '    async loadDict (): Promise<Dict> { return {}; }',
        '    async loadList (): Promise<any[]> { return []; }',
        '    async readDict (symbol: string) { const data = await this.loadDict (); return data[symbol]; }',
        "    async readDictLit (symbol: string) { const data = await this.loadDict (); return data['walletAddress']; }",
        '    async readDictWrite (symbol: string) { const data = await this.loadDict (); data[symbol] = 1; return data; }',
        '    async readDictMixed (symbol: string, params = {}) { const data = await this.loadDict (); return this.parseOrder (data, params); }',
        '    async readList (symbol: string) { const xs = await this.loadList (); return xs[0]; }',
        '    prepareTuple (): [Dict, Dict] { return [ {}, {} ]; }',
        '    readTuple (symbol: string) { const [ request, query ] = this.prepareTuple (); return request[symbol]; }',
        '    readTupleMixed (symbol: string) { const [ request, query ] = this.prepareTuple (); return this.extend (request, query); }',
        "    async readDictValue (symbol: string) { const data = await this.loadDict (); const out: Dict = {}; out['kept'] = data; return data[symbol]; }",
        '}',
    ].join ('\n');
    try {
        fs.writeFileSync (probe, body);
        const out = transpiler.transpileJavaByPath (probe).content as string;
        if (process.env['J06_DEBUG'] === '1') {
            console.error (out);
        }
        const mapDecl = 'java.util.Map<String, Object> data = (java.util.Map<String, Object>) (this.loadDict()).join();';
        if (out.indexOf (mapDecl) === -1) {
            problems.push (`j06: awaited Dict local must take the box\n${out}`);
        }
        if (out.indexOf ('return (data == null || symbol == null ? null : data.get(symbol));') === -1) {
            problems.push (`j06: a String-keyed read of the box must print the guarded native get\n${out}`);
        }
        if (out.indexOf ('return data.get("walletAddress");') === -1) {
            problems.push (`j06: a literal-keyed read of the box must print the native get\n${out}`);
        }
        if (out.indexOf ('data[symbol] = 1') !== -1) {
            problems.push ('j06: element write must print natively');
        }
        if (/Object data = \(this\.loadDict\(\)\)\.join\(\);[\s\S]*parseOrder/.test (out) === false
            && /Object data = \((this|super)\.loadDict\(\)\)\.join\(\);/.test (out) === false) {
            problems.push ('j06: an awaited local with a non-element use must stay Object');
        }
        if (/java\.util\.Map<String, Object> xs = /.test (out)) {
            problems.push ('j06: an awaited list local must not take the map box');
        }
        const valueSection = out.slice (out.indexOf ('readDictValue'), out.indexOf ('readDictValue') + 900);
        if (!/java\.util\.Map<String, Object> data = /.test (valueSection)) {
            problems.push (`j06: a box used as a dict value must still take the box\n${valueSection}`);
        }
        const tupleDecl = 'java.util.Map<String, Object> request = (java.util.Map<String, Object>) ((java.util.List<Object>) requestqueryVariable).get(0);';
        if (out.indexOf (tupleDecl) === -1) {
            problems.push (`j06: destructured Dict slot must take the box\n${out}`);
        }
        if (/java\.util\.Map<String, Object> request = [^\n]*\n[^\n]*this\.extend \(request, query\)/.test (out)) {
            problems.push ('j06: a destructured slot used as a call argument must stay Object');
        }
    } catch (e: any) {
        problems.push (`j06 self-test threw: ${e.message}`);
    } finally {
        fs.rmSync (probe, { force: true });
    }
    return problems;
}
