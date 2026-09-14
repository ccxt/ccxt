import Transpiler from "ast-transpiler";
// "typescript6" is an npm alias for typescript@6 — the last release that ships the JS compiler API (typescript@7 is the native compiler and only provides the tsc binary)
import ts from "typescript6";
import path from 'path'
import errors from "../js/src/base/errors.js"
import { basename, join, resolve } from 'path'
import { createFolderRecursively, replaceInFile, overwriteFile, checkCreateFolder } from './fsLocal.js'
import { writeOverloadStrippedFile, removeOverloadStrippedFile } from './stripOverloads.js'
import { writeFile } from 'fs/promises';
import { platform } from 'process'
import fs from 'fs'
import log from 'ololog'
import ansi from 'ansicolor'
import { Transpiler as OldTranspiler } from "./transpile.js";
import errorHierarchy from '../js/src/base/errorHierarchy.js'
import Piscina from 'piscina';
import os from 'os';
import { execFileSync } from 'child_process';
import { isMainEntry } from "./transpile.js";
import { filterDirtyExchangeFiles, skipUpToDateStage, testStageInputs } from "./transpile.js";
import { unCamelCase } from "../js/src/base/functions.js";
import { installJavaLocalTypes, installJavaNumericLocalTypes, patchJavaLiteralLocalTypes, elementAccessHasStringElements, JAVA_STRING_RETURN_METHODS, JAVA_STRING_PARAM_POSITIONS, patchJavaConsumerStringCasts, patchJavaMapChannelStringCasts, patchJavaStringReceiverCasts } from './java-local-types.js';
import { ZERO_REQUIRED_TYPED_WHITELIST } from "./generateJavaWrappers.js";
import { typeCoreReturns, typedReturnTable } from "./javaTypedCore.js";
import { applyJavaImports, shortenJavaReferences, ensureJavaImports } from "./javaUtilImports.js";

ansi.nice

type dict = { [key: string]: string }

let exchanges = JSON.parse(fs.readFileSync("./exchanges.json", "utf8"));
const exchangeIds: string[] = exchanges.ids

// @ts-expect-error
const metaUrl = import.meta.url
let __dirname = new URL('.', metaUrl).pathname;

let shouldTranspileTests = true

function overwriteFileAndFolder(path: string, content: string) {
    if (!(fs.existsSync(path))) {
        checkCreateFolder(path);
    }
    // overwriteFile() already opens+truncates+writes the file; the extra
    // fs.writeFileSync below wrote every generated file a second time
    //
    // Every Java compilation unit this transpiler emits (exchange cores, WS cores, tests,
    // errors) goes through here: collapse the `java.util.*` / `io.github.ccxt.types.*`
    // spelling last, so every regex pass above still matches on the fully-qualified form.
    if (path.endsWith('.java')) {
        content = applyJavaImports(content);
    }
    overwriteFile(path, content);
}

// Zero-arg `this.fetchBalance()` (or `this.fetchBalance(null)`) on a whitelisted
// name would bind TypedSurface's fixed-arity default and return a typed value
// (JLS 15.12.2 phase 1 beats varargs); `new Object[0]` binds only the varargs core.
const WHITELISTED_ZERO_ARG_CALL_RE = new RegExp(
    '\\bthis\\.(' + [...ZERO_REQUIRED_TYPED_WHITELIST].join('|') + ')\\(\\s*(?:null\\s*)?\\)',
    'g',
);

function routeWhitelistedInternalCallsToVarargs(javaSource: string): string {
    return javaSource.replace(WHITELISTED_ZERO_ARG_CALL_RE, 'this.$1(new Object[0])');
}

// Split a comma-separated argument list, respecting nested () [] {} and
// string literals (so that `()` inside a quoted string is not counted as
// paren depth). Used to rewrite multi-arg System.out.println calls in
// transpiled tests.
function splitTopLevelArgs(s: string): string[] {
    const out: string[] = [];
    let depth = 0;
    let inStr: string | null = null;
    let buf = '';
    for (let i = 0; i < s.length; i++) {
        const ch = s[i];
        if (inStr) {
            buf += ch;
            if (ch === '\\' && i + 1 < s.length) { buf += s[++i]; continue; }
            if (ch === inStr) inStr = null;
            continue;
        }
        if (ch === '"' || ch === '\'') { inStr = ch; buf += ch; continue; }
        if (ch === '(' || ch === '[' || ch === '{') depth++;
        else if (ch === ')' || ch === ']' || ch === '}') depth--;
        if (ch === ',' && depth === 0) {
            out.push(buf);
            buf = '';
        } else {
            buf += ch;
        }
    }
    if (buf.length > 0) out.push(buf);
    return out;
}

// Find a System.out.println(...) call starting at `from` in `src` and
// return the start, end-of-call (one past the closing paren), and the raw
// argument string. Walks paren depth and respects string literals.
function findPrintlnCall(src: string, from: number): { start: number, end: number, args: string } | null {
    const marker = 'System.out.println(';
    const start = src.indexOf(marker, from);
    if (start < 0) return null;
    let i = start + marker.length;
    let depth = 1;
    let inStr: string | null = null;
    while (i < src.length && depth > 0) {
        const ch = src[i];
        if (inStr) {
            if (ch === '\\' && i + 1 < src.length) { i += 2; continue; }
            if (ch === inStr) inStr = null;
            i++; continue;
        }
        if (ch === '"' || ch === '\'') inStr = ch;
        else if (ch === '(') depth++;
        else if (ch === ')') depth--;
        i++;
    }
    if (depth !== 0) return null;
    return { start, end: i, args: src.slice(start + marker.length, i - 1) };
}

// this is necessary because for some reason
// pathname keeps the first '/' for windows paths
// making them invalid
// example: /C:Users/user/Desktop/
if (platform === 'win32') {
    if (__dirname[0] === '/') {
        __dirname = __dirname.substring(1)
    }
}

const GLOBAL_WRAPPER_FILE = './cs/ccxt/base/Exchange.Wrappers.cs';
const EXCHANGE_WRAPPER_FOLDER = './java/lib/src/main/java/io/github/ccxt/'
const EXCHANGE_WS_WRAPPER_FOLDER = './cs/ccxt/exchanges/pro/wrappers/'
const ERRORS_FOLDER = './java/lib/src/main/java/io/github/ccxt/errors/';
const BASE_METHODS_FILE = './java/lib/src/main/java/io/github/ccxt/BaseExchange.java';
// Exchange is the thin concrete tier over BaseExchange. The 62 symbol-based trading
// methods (createOrder/fetchTicker/fetchOrders/editOrder/... + watch*) live in the
// TS `export default class Exchange extends BaseExchange` block and are injected here,
// NOT into BaseExchange — so the prediction tier (extends BaseExchange) does not
// inherit them and can declare its own standalone-typed versions.
const EXCHANGE_METHODS_FILE = './java/lib/src/main/java/io/github/ccxt/Exchange.java';
const EXCHANGES_FOLDER = './java/lib/src/main/java/io/github/ccxt/exchanges/';
const EXCHANGES_WS_FOLDER = './java/lib/src/main/java/io/github/ccxt/exchanges/pro/';
const EXCHANGES_PREDICTION_FOLDER = './java/lib/src/main/java/io/github/ccxt/exchanges/prediction/';
const GENERATED_TESTS_FOLDER = './java/tests/src/main/java/tests/exchange/';
const BASE_TESTS_FOLDER = 'java/tests/src/main/java/tests/base/';
const BASE_TESTS_FILE = './java/tests/src/main/java/tests/exchange/TestMain.java';
const EXCHANGE_BASE_FOLDER = './java/tests/src/main/java/tests/exchange/';
const EXCHANGE_GENERATED_FOLDER = './java/tests/src/main/java/tests/exchange/';
const EXAMPLES_INPUT_FOLDER = './examples/ts/';
const EXAMPLES_OUTPUT_FOLDER = './examples/java/examples/';
const csharpComments: any = {};

// every ts/src/prediction/*.ts venue — read by getPredictionImplementedNames() to decide
// which Exchange-tier methods get injected into PredictionExchange.java, so they are real
// inputs of the prediction base stage. Computed once per process.
let cachedPredictionSourceFiles: string[] | undefined = undefined;
function predictionSourceFiles () {
    if (cachedPredictionSourceFiles === undefined) {
        const dir = './ts/src/prediction/';
        try {
            cachedPredictionSourceFiles = fs.readdirSync (dir).filter ((f: string) => f.endsWith ('.ts')).map ((f: string) => dir + f);
        } catch (e) {
            cachedPredictionSourceFiles = [] as string[];
        }
    }
    return cachedPredictionSourceFiles;
}

// ============================================================================
// Java local-variable typing for the ast-transpiler Java printer.
//
// The Java printer declares every body local as `Object` (VAR_TOKEN) because its
// generic INFER_VAR_TYPE branch would also type Safe*/GetValue/ternary/Add results,
// which are genuinely `Object` at runtime. patchJavaLocalTypes narrows ONLY the
// locals whose initializer is a whole call to a hand-written base accessor with a
// known concrete runtime type:
//
//     Object price = this.safeString(ticker, "price");
// becomes
//     String price = this.safeString(ticker, "price");
//
// `BaseExchange.safeString / safeString2 / safeStringN` are hand-written, delegate
// to `SafeMethods`, and are DECLARED `String` (their bodies return a `String` or
// null on every path), so the narrowed declaration needs no cast. The
// `safeStringUpper* / safeStringLower*` family is declared `String` too (SS-01: the
// hand-written SafeMethods bodies drop a non-String default through `optString`), so
// it classifies the same way and needs no `(String)` cast either. Boxed `String`,
// never a primitive: an absent key yields null.
//
// It is applied as a monkey-patch on `transpiler.javaTranspiler` from BOTH the
// main-thread Transpiler (setupTranspiler below) and the piscina worker
// (build/java-worker.ts, which imports it from this module) — same precedent as
// patchJavaPropertyTypes(), and it keeps the ast-transpiler pin untouched.
//
// Uses `typescript6` — the same 6.x line that ast-transpiler bundles — so SyntaxKind
// values agree with the AST nodes the printer hands us.
// ============================================================================


// helper → Java type. Every entry MUST be a hand-written Java base method whose
// runtime value is always an instance of that type (or null). Transpiled base
// methods (safeBool/safeDict/safeList/safeNumber...) do NOT qualify: their Java
// bodies return whatever the TS default argument was, boxed as Object.
//
// SafeMethods.SafeStringTyped / safeString2 / SafeStringN coerce the found value to
// String and drop a non-String default (`instanceof String s ? s : null`), so they
// are String-or-null unconditionally — and `BaseExchange` declares them `String`.
//
// SS-01: SafeMethods.safeStringUpper* / safeStringLower* apply the same rule to their
// default through `optString` (String when the caller passed one, null when it was
// absent or non-String), so the case family is String-or-null on every path too and
// `BaseExchange` declares all six `String`. The family therefore needs no `(String)`
// checkcast at any declaration/reassignment use site — it classifies exactly like
// safeString.
const STRING_ACCESSORS = new Set([
    'safeString', 'safeString2', 'safeStringN',
    'safeStringUpper', 'safeStringUpper2', 'safeStringUpperN',
    'safeStringLower', 'safeStringLower2', 'safeStringLowerN',
]);

// hand-written base methods declared with a String return in Java
// (BaseExchange.iso8601 / numberToString) — used only to prove a later
// reassignment keeps the local a String
const STRING_RETURNING_BASE_METHODS = new Set([
    'iso8601', 'numberToString',
]);

// Precise.string* statics are declared `public static String` in Precise.java
const PRECISE_STRING_STATICS = new Set([
    'stringAdd', 'stringSub', 'stringMul', 'stringDiv', 'stringMod', 'stringAbs',
    'stringNeg', 'stringMax', 'stringMin', 'stringOr',
]);

const ACCESSOR_DECLARATION_FILE = /[\\/]base[\\/]functions[\\/]type\.ts$/;

function isThisCall (node: any): boolean {
    return node !== undefined && ts.isCallExpression (node)
        && ts.isPropertyAccessExpression (node.expression)
        && node.expression.expression.kind === ts.SyntaxKind.ThisKeyword;
}

// `this.x(...)` or `super.x(...)`: both resolve against the class hierarchy
function isThisOrSuperCall (node: any): boolean {
    return node !== undefined && ts.isCallExpression (node)
        && ts.isPropertyAccessExpression (node.expression)
        && (node.expression.expression.kind === ts.SyntaxKind.ThisKeyword || node.expression.expression.kind === ts.SyntaxKind.SuperKeyword);
}

// `this.safeString(...)` / `this.safeStringUpper(...)` … resolving to the base accessor
// in ts/src/base/functions/type.ts (an exchange override would be transpiled with its
// own signature and must not classify)
function isBaseStringAccessorCall (printer: any, node: any): boolean {
    if (!isThisCall (node)) {
        return false;
    }
    const name = node.expression.name.escapedText;
    if (!STRING_ACCESSORS.has (name)) {
        return false;
    }
    const declaration = printer.getChecker ().getResolvedSignature (node)?.declaration;
    return declaration !== undefined && ACCESSOR_DECLARATION_FILE.test (declaration.getSourceFile ().fileName);
}

// ===== SS-03: value-identity of the add overload switch (measured) =====
//
// Measured with a javac harness against the built Helpers (72-row matrix): with a
// String-OR-NULL left box — exactly what BaseExchange.safeString / safeString2 /
// safeStringN hand back — the overload a retyped local selects (add(String,String) /
// add(String,Object)) is value-IDENTICAL to today's add(Object,Object) iff the right
// operand is a provably NON-NULL String: every path then string-concatenates, a null left
// included ("null" + r). The measured divergences (add(Object,Object) -> add(String,*)):
//
//   (null, null)              null         -> "nullnull"
//   (null, Long/Integer)      null         -> "null5"
//   (null, Boolean/Map/List)  null         -> "nulltrue" / "null{}" / "null[]"
//   (any,  Double)            numeric box  -> string   (the Double branch wins first)
//
// In a `x + r0 + r1` chain the accumulated left of every ENCLOSING add is a NON-NULL
// String (r0 is a non-null String), so there only a possibly-numeric right operand can
// move the result. A local on the LEFT of `+` is therefore admitted exactly when the
// first right operand is a provably non-null String and every deeper right operand is
// not possibly numeric. This mirrors the predicates the guarded-string family in
// build/java-local-types.js already uses for its own `+=`/add-left rule
// (isProvablyNonNullStringExpression / isPossiblyNumericDeep); no ternary is emitted —
// the acceptance is a compile-time predicate on the printed shape only.

// unwrap `( ... )` layers
function unwrapParensAll (node: any): any {
    while (node !== undefined && ts.isParenthesizedExpression (node)) {
        node = node.expression;
    }
    return node;
}

// true when the printed Java for `node` is statically a String — a real String box, NOT
// the null/undefined literals (those print `Helpers.add(null, r)`, whose Object overload
// returns null when r is numeric): the deep form — a `+` chain counts when its LEFT spine
// is statically a String, because `Helpers.add(String, ..)` returns a String on every
// path. The inline hook's isProvablyStringExpression above is deliberately left untouched
// (it gates the already-accepted set); this is the predicate the `+` proof needs, and it
// is deliberately STRICTER than the module's same-named predicate (no NullKeyword /
// undefined / selfName acceptance).
function isStaticallyStringExpression (printer: any, node: any, selfName: string | undefined): boolean {
    node = unwrapParensAll (node);
    if (node === undefined) {
        return false;
    }
    switch (node.kind) {
        case ts.SyntaxKind.StringLiteral:
        case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
            return true;
        case ts.SyntaxKind.ConditionalExpression:
            return isStaticallyStringExpression (printer, node.whenTrue, selfName)
                && isStaticallyStringExpression (printer, node.whenFalse, selfName);
        case ts.SyntaxKind.BinaryExpression:
            return node.operatorToken.kind === ts.SyntaxKind.PlusToken
                && isStaticallyStringExpression (printer, node.left, selfName);
        case ts.SyntaxKind.CallExpression: {
            if (isBaseStringAccessorCall (printer, node)) {
                return true; // BaseExchange.safeString* are declared String
            }
            const callee = node.expression;
            if (!ts.isPropertyAccessExpression (callee)) {
                return false;
            }
            const method = String (callee.name.escapedText);
            if (callee.expression.kind === ts.SyntaxKind.ThisKeyword) {
                return STRING_RETURNING_BASE_METHODS.has (method);
            }
            return callee.expression.kind === ts.SyntaxKind.Identifier
                && (callee.expression as any).escapedText === 'Precise'
                && PRECISE_STRING_STATICS.has (method);
        }
        default:
            return false;
    }
}

// true when the TYPE the checker gives `node` could hold a Java-Double box at runtime
// (number / bigint members, or an any/unknown/error type we cannot rule out).
function isPossiblyNumericExpression (printer: any, node: any): boolean {
    try {
        const type = printer.getChecker ().getTypeAtLocation (node);
        return typeIsPossiblyNumeric (type);
    } catch (e) {
        return true; // unprovable — treat as possibly numeric
    }
}

function typeIsPossiblyNumeric (type: any): boolean {
    if (type === undefined) {
        return true;
    }
    const flags = type.flags;
    if (flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown)) {
        return true;
    }
    if (flags & (ts.TypeFlags.NumberLike | ts.TypeFlags.BigIntLike)) {
        return true;
    }
    if (flags & ts.TypeFlags.Union) {
        return type.types.some ((member: any) => typeIsPossiblyNumeric (member));
    }
    if (flags & ts.TypeFlags.Intersection) {
        return type.types.some ((member: any) => typeIsPossiblyNumeric (member));
    }
    return false;
}

// true when any operand of the `+` chain (through parentheses) could be a Java Double
// box: Helpers.add tests `a instanceof Double || b instanceof Double` BEFORE its String
// branches, so a single Double operand silently turns the whole call numeric.
function isPossiblyNumericDeep (printer: any, node: any): boolean {
    node = unwrapParensAll (node);
    if (node === undefined) {
        return true;
    }
    if (ts.isBinaryExpression (node) && node.operatorToken.kind === ts.SyntaxKind.PlusToken) {
        return isPossiblyNumericDeep (printer, node.left) || isPossiblyNumericDeep (printer, node.right);
    }
    return isPossiblyNumericExpression (printer, node);
}

// true when the printed Java for `node` is a String GUARANTEED non-null at runtime
// (given the named local holds String-or-null): literals, templates, ternaries of these,
// and `+` chains with a statically-String or non-null-String-plus-non-numeric shape.
// Calls do NOT qualify — even an audited non-null call is only proven for the narrowed
// local, not for arbitrary call sites (same rule as the module's predicate).
function isProvablyNonNullStringExpression (printer: any, node: any, selfName: string | undefined): boolean {
    node = unwrapParensAll (node);
    if (node === undefined) {
        return false;
    }
    switch (node.kind) {
        case ts.SyntaxKind.StringLiteral:
        case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
            return true;
        case ts.SyntaxKind.ConditionalExpression:
            return isProvablyNonNullStringExpression (printer, node.whenTrue, selfName)
                && isProvablyNonNullStringExpression (printer, node.whenFalse, selfName);
        case ts.SyntaxKind.BinaryExpression: {
            if (node.operatorToken.kind !== ts.SyntaxKind.PlusToken) {
                return false;
            }
            return isStaticallyStringExpression (printer, node.left, selfName)
                || (isProvablyNonNullStringExpression (printer, node.left, selfName) && !isPossiblyNumericDeep (printer, node.right))
                || (isProvablyNonNullStringExpression (printer, node.right, selfName) && !isPossiblyNumericDeep (printer, node.left));
        }
        default:
            return false;
    }
}

// `x = x + r0 + r1 ...` (and the `x += r` form, which prints `x = Helpers.add(x, r)`):
// measured-safe when the level-0 right operand is a provably non-null String and every
// enclosing right operand is not possibly numeric. Walks DOWN the left spine to find the
// level-0 `+`, then UP for the enclosing levels.
function plusWriteRightIsSafe (printer: any, right: any, sourceName: string): boolean {
    let node = unwrapParensAll (right);
    if (node === undefined || !ts.isBinaryExpression (node) || node.operatorToken.kind !== ts.SyntaxKind.PlusToken) {
        return false;
    }
    let level0;
    while (node !== undefined && ts.isBinaryExpression (node) && node.operatorToken.kind === ts.SyntaxKind.PlusToken) {
        const left = unwrapParensAll (node.left);
        if (left !== undefined && ts.isIdentifier (left) && left.escapedText === sourceName) {
            level0 = node;
            break;
        }
        if (left !== undefined && ts.isBinaryExpression (left) && left.operatorToken.kind === ts.SyntaxKind.PlusToken) {
            node = left;
            continue;
        }
        break;
    }
    if (level0 === undefined) {
        return false;
    }
    if (!isProvablyNonNullStringExpression (printer, level0.right, sourceName)) {
        return false;
    }
    let child = level0;
    let parent = level0.parent;
    while (parent !== undefined && ts.isParenthesizedExpression (parent)) {
        child = parent;
        parent = parent.parent;
    }
    while (parent !== undefined && ts.isBinaryExpression (parent)
        && parent.operatorToken.kind === ts.SyntaxKind.PlusToken && parent.left === child) {
        if (isPossiblyNumericDeep (printer, parent.right)) {
            return false;
        }
        child = parent;
        parent = parent.parent;
        while (parent !== undefined && ts.isParenthesizedExpression (parent)) {
            child = parent;
            parent = parent.parent;
        }
    }
    return true;
}

// true when the printed Java for `node` is statically a String (or null).
// `selfName` is the local being classified: a self-reference (`x = cond ? 'a' : x`)
// is consistent with whatever type that local ends up with.
//
// A bare base accessor call is only accepted at the TOP level (`nested` false): the
// declaration hook narrows exactly that shape. A case-family call inside a ternary arm
// would print uncast (fine for javac now that both families are String-declared); the
// refinement is deliberately not made here so the set of narrowed locals stays
// unchanged.
function isProvablyStringExpression (printer: any, node: any, selfName: string | undefined, nested = false): boolean {
    if (node === undefined) {
        return false;
    }
    switch (node.kind) {
        case ts.SyntaxKind.StringLiteral:
        case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
        case ts.SyntaxKind.NullKeyword:
            return true;
        case ts.SyntaxKind.Identifier:
            return node.escapedText === 'undefined' || node.escapedText === selfName;
        case ts.SyntaxKind.ParenthesizedExpression:
            return isProvablyStringExpression (printer, node.expression, selfName, nested);
        case ts.SyntaxKind.ConditionalExpression:
            return isProvablyStringExpression (printer, node.whenTrue, selfName, true) && isProvablyStringExpression (printer, node.whenFalse, selfName, true);
        case ts.SyntaxKind.BinaryExpression:
            // `'lit' + x` prints Helpers.add(String, Object) → String
            return node.operatorToken.kind === ts.SyntaxKind.PlusToken
                && (node.left.kind === ts.SyntaxKind.StringLiteral || node.left.kind === ts.SyntaxKind.NoSubstitutionTemplateLiteral);
        case ts.SyntaxKind.CallExpression: {
            if (isBaseStringAccessorCall (printer, node)) {
                return !nested;
            }
            const callee = node.expression;
            if (!ts.isPropertyAccessExpression (callee)) {
                return false;
            }
            // escapedText is a branded `__String` on the typed node; it is a plain string at runtime
            const method = String (callee.name.escapedText);
            if (callee.expression.kind === ts.SyntaxKind.ThisKeyword) {
                return STRING_RETURNING_BASE_METHODS.has (method);
            }
            return callee.expression.kind === ts.SyntaxKind.Identifier
                && (callee.expression as any).escapedText === 'Precise'
                && PRECISE_STRING_STATICS.has (method);
        }
        default:
            return false;
    }
}

function enclosingFunction (node: any): any {
    let current = node?.parent;
    while (current) {
        switch (current.kind) {
            case ts.SyntaxKind.MethodDeclaration:
            case ts.SyntaxKind.FunctionDeclaration:
            case ts.SyntaxKind.FunctionExpression:
            case ts.SyntaxKind.ArrowFunction:
            case ts.SyntaxKind.Constructor:
            case ts.SyntaxKind.SourceFile:
                return current;
        }
        current = current.parent;
    }
    return undefined;
}

// SS-04: replace every comment character with a space, preserving LENGTH and newlines,
// so text offsets computed on the result are valid for the original string. Used by the
// ws post-pass when it has to prove a local's declared type from the printed text.
function maskJavaComments (content: string): string {
    const blanks = (m: string) => m.replace(/[^\n]/g, ' ');
    return content
        .replace(/\/\*[\s\S]*?\*\//g, blanks)
        .replace(/\/\/[^\n]*/g, blanks);
}

// SS-04: hand-written BaseExchange fields whose Java declaration is `public String`
// (mirror of THIS_MEMBER_TYPES['…'] === 'String' in build/java-local-types.js)
const JS_STRING_MEMBER_FIELDS = new Set([
    'id', 'version', 'name', 'secret', 'apiKey', 'password', 'uid', 'login', 'url', 'hostname',
]);

// the first argument of the `Helpers.add(` call that starts at `addStart`, as text +
// offset. Quote- and paren-aware; undefined when the call cannot be parsed (the callers
// then keep the conservative behaviour).
function jsAddFirstOperand (content: string, addStart: number): { text: string; start: number } | undefined {
    const open = content.indexOf('(', addStart);
    if (open === -1 || open - addStart > 'Helpers.add'.length + 2) {
        return undefined;
    }
    const start = open + 1;
    let depth = 0;
    let inString = '';
    let end = -1;
    for (let i = start; i < content.length; i++) {
        const ch = content[i];
        if (inString !== '') {
            if (ch === '\\') {
                i++;
                continue;
            }
            if (ch === inString) {
                inString = '';
            }
            continue;
        }
        if (ch === '"' || ch === "'") {
            inString = ch;
        } else if (ch === '(') {
            depth++;
        } else if (ch === ')') {
            if (depth === 0) {
                end = i;
                break;
            }
            depth--;
        } else if (ch === ',' && depth === 0) {
            end = i;
            break;
        } else if (ch === '\n') {
            return undefined;
        }
    }
    if (end === -1) {
        return undefined;
    }
    return { text: content.slice(start, end), start };
}

// every Identifier node in `scope`, by source name. Not cached: the Java printer
// renames identifiers inside object literals in place (`x` → `finalX`) while a
// function body is being printed, so the walk must read the live AST each time.
function identifierIndex (scope: any): Map<string, any[]> {
    const index = new Map<string, any[]> ();
    const visit = (n: any) => {
        if (n.kind === ts.SyntaxKind.Identifier) {
            const name = n.escapedText;
            let list = index.get (name);
            if (list === undefined) {
                list = [];
                index.set (name, list);
            }
            list.push (n);
        }
        ts.forEachChild (n, visit);
    };
    ts.forEachChild (scope, visit);
    return index;
}

// resolves to an `async` method (or one declared to return a Promise — an overload
// signature carries the return type but not the modifier)
function isAsyncMethodCall (printer: any, callNode: any): boolean {
    const declaration = printer.getChecker ().getResolvedSignature (callNode)?.declaration;
    if (declaration === undefined) {
        return false;
    }
    if (ts.canHaveModifiers (declaration) && (ts.getModifiers (declaration) ?? []).some ((m: any) => m.kind === ts.SyntaxKind.AsyncKeyword)) {
        return true;
    }
    const returnType = declaration.type;
    return returnType !== undefined && ts.isTypeReferenceNode (returnType)
        && ts.isIdentifier (returnType.typeName) && returnType.typeName.escapedText === 'Promise';
}

// env-gated calibration trace (same convention as the module's
// CCXT_JAVA_LOCAL_TYPES_DEBUG / JAVA_STRING_HELPERS_DEBUG): CCXT_JAVA_SAFESTRING_DEBUG=1
// prints one line per rejected safeString-family declaration with the reason the
// use-scan declined it (write-rhs / write-plus-safe / write-plus-unsafe /
// compound-plus-unsafe / compound-plus-ws / compound-assign / pro-async / ...).
const SAFESTRING_DEBUG = process.env['CCXT_JAVA_SAFESTRING_DEBUG'] === '1';
let safeStringRejectReason: string | undefined;
function safeStringReject (reason: string): boolean {
    safeStringRejectReason = reason;
    return false;
}

// would postProcessWsJava's "String type fixes" pass rewrite this declaration back to
// `Object`? (mirror of build/java-local-types.js#dataflowWsReverts): pro/prediction source
// file + a printed value starting with `this.<m>(` / `Helpers.<...>(`. The SS-03 `+`
// acceptance must not fire there — the retype would be silently reverted, and it would
// also pre-empt a declaration the pro messageHash family types WITH the redundant
// `(String)` checkcast that defeats the revert (measured: pro/Htx messageHash would
// lose its String type). Files that survive the revert (REST/base) keep the relaxation.
const WS_REVERT_SOURCE_FILE = /[\\/](pro|prediction)[\\/]/;
function wsPostProcessReverts (declaration: any): boolean {
    if (!WS_REVERT_SOURCE_FILE.test (declaration.getSourceFile ().fileName)) {
        return false;
    }
    let initializer = declaration.initializer;
    while (initializer !== undefined && ts.isParenthesizedExpression (initializer)) {
        initializer = initializer.expression;
    }
    if (initializer === undefined || initializer.kind !== ts.SyntaxKind.CallExpression) {
        return false;
    }
    const callee = initializer.expression;
    if (ts.isPropertyAccessExpression (callee)) {
        return callee.expression.kind === ts.SyntaxKind.ThisKeyword;
    }
    return ts.isIdentifier (callee) && callee.escapedText === 'Helpers';
}

// reject the refinement when a later use needs the local to stay `Object`
function isSafeToNarrow (printer: any, declaration: any, sourceName: string, isProFile: boolean, plusRelaxationAllowed = false): boolean {
    if (SAFESTRING_DEBUG) {
        safeStringRejectReason = undefined;
    }
    const scope = enclosingFunction (declaration);
    if (scope === undefined) {
        return false;
    }
    const uses = identifierIndex (scope).get (sourceName) ?? [];
    for (const n of uses) {
        if (n === declaration.name) {
            continue;
        }
        const parent = n.parent;
        if (parent === undefined) {
            continue;
        }
        if (ts.isVariableDeclaration (parent) && parent.name === n) {
            continue; // a sibling block-scoped declaration gets its own type
        }
        if (ts.isPropertyAccessExpression (parent) && parent.name === n) {
            continue; // `obj.<name>` is a member, not this local
        }
        if (ts.isPostfixUnaryExpression (parent) || ts.isPrefixUnaryExpression (parent)) {
            const op = parent.operator;
            if (op === ts.SyntaxKind.PlusPlusToken || op === ts.SyntaxKind.MinusMinusToken) {
                return SAFESTRING_DEBUG ? safeStringReject ('inc-dec') : false;
            }
        }
        if (ts.isSpreadElement (parent)) {
            return SAFESTRING_DEBUG ? safeStringReject ('spread') : false;
        }
        if (ts.isTypeOfExpression (parent)) {
            return SAFESTRING_DEBUG ? safeStringReject ('typeof') : false; // `typeof x === 'number'` prints `x instanceof Long`: inconvertible for a String
        }
        if (ts.isArrayLiteralExpression (parent) && ts.isBinaryExpression (parent.parent)
            && parent.parent.left === parent && parent.parent.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
            return SAFESTRING_DEBUG ? safeStringReject ('destructure') : false; // `[x, y] = f()` prints `x = ((List) tmp).get(i)`
        }
        if (ts.isBinaryExpression (parent) && parent.left === n) {
            const op = parent.operatorToken.kind;
            if (op === ts.SyntaxKind.EqualsToken) {
                // SS-02: a reassignment whose RHS is provably a String read/chain (non-ws tiers).
                // SS-03: a write whose printed Java is `Helpers.add(<local>, ..)` — admitted when
                // the measured add-overload identity holds, so the emitted call binds
                // add(String, ..) with an unchanged value for every reachable input.
                const provable = isProvablyStringExpression (printer, parent.right, sourceName)
                    || isProvablyStringReassignment (printer, parent.right, sourceName)
                    || (plusRelaxationAllowed && plusWriteRightIsSafe (printer, parent.right, sourceName));
                if (!provable) {
                    if (SAFESTRING_DEBUG) {
                        const right = unwrapParensAll (parent.right);
                        const isPlus = right !== undefined && ts.isBinaryExpression (right)
                            && right.operatorToken.kind === ts.SyntaxKind.PlusToken;
                        safeStringReject (isPlus ? 'write-plus-unsafe' : 'write-rhs');
                    }
                    return false;
                }
            } else if (op === ts.SyntaxKind.PlusEqualsToken) {
                // `x += r` prints `x = Helpers.add (x, r)`: with x a String the call binds
                // add(String, ..) -> String, value-identical to add(Object, Object) whenever
                // r is a provably non-null String. Other compound operators print numeric
                // helpers whose Object result cannot assign to a String local.
                const plusOk = (plusRelaxationAllowed && isProvablyNonNullStringExpression (printer, parent.right, sourceName))
                    || isProvablyNonNullStringOperand (printer, parent.right, sourceName);
                if (!plusOk) {
                    return SAFESTRING_DEBUG ? safeStringReject (plusRelaxationAllowed ? 'compound-plus-unsafe' : 'compound-plus-ws') : false;
                }
            } else if (op >= ts.SyntaxKind.FirstCompoundAssignment && op <= ts.SyntaxKind.LastCompoundAssignment) {
                return SAFESTRING_DEBUG ? safeStringReject ('compound-assign') : false;
            }
        }
        // A pro core extends the REST *wrapper* class, whose typed overloads
        // (`Ticker fetchTicker(String symbol)`) would win Java overload resolution
        // over the `Object...` core once an argument expression is a String. Keep
        // any local that feeds such a call `Object` (directly or nested — e.g.
        // `Helpers.add(String, String)` also returns String) so the call keeps
        // binding to the core.
        if (isProFile && feedsInheritedAsyncCall (printer, n, scope)) {
            return SAFESTRING_DEBUG ? safeStringReject ('pro-async') : false;
        }
    }
    return true;
}

// is `n` an argument of a `this.<async>()` call, either directly or through the
// expression forms whose printed Java type is String whenever an operand is
// (`(x)`, `x + y` → Helpers.add(String, ..) → String, `c ? x : y`). Anything else
// in between (another call, an element access) prints as Object and breaks the chain.
function feedsInheritedAsyncCall (printer: any, n: any, scope: any): boolean {
    let child = n;
    let current = n.parent;
    while (current !== undefined && current !== scope) {
        if (ts.isCallExpression (current)) {
            return current.arguments.indexOf (child) !== -1 && isThisOrSuperCall (current) && isAsyncMethodCall (printer, current);
        }
        const propagates = ts.isParenthesizedExpression (current)
            || (ts.isBinaryExpression (current) && current.operatorToken.kind === ts.SyntaxKind.PlusToken)
            || (ts.isConditionalExpression (current) && current.condition !== child);
        if (!propagates) {
            return false;
        }
        child = current;
        current = current.parent;
    }
    return false;
}

// ===== SS-02: reassignment acceptance for `safeString*` locals =====
//
// The write `x = …` on a narrowed safeString-family local must print a value javac
// accepts as a String. `isProvablyStringExpression` above proves the literal /
// accessor / Precise / literal-led `+` shapes; the functions below add the remaining
// shapes whose printed Java is provably a String (or null), each with its own proof:
//
//   * `x = recv[key]` — `recv` provably holds only String elements
//     (java-local-types.js#elementAccessHasStringElements). Prints
//     `Helpers.GetValue (recv, key)`, declared Object, so the WRITE SITE needs the same
//     `(String)` checkcast the declaration of such a local already carries (that path
//     has shipped it since JAVA-RE-6).
//   * `x = other` — the local itself, or another local whose own decision this engine
//     recomputes to String (cycle-guarded; a local the output keeps Object proves
//     nothing).
//   * `x = a + b + …` — the printed `Helpers.add (<left>, …)` resolves to the
//     String-declared `add(String, …)` exactly when the left spine starts with a
//     String literal or with a String local whose first right operand is a provably
//     non-null String. Every such chain yields a non-null String from the first `+`
//     on, and the value matches the old add(Object, Object) call on every path
//     (Helpers.add's String branches concatenate `valueOf(a) + valueOf(b)`).
//   * `x = <value> as string` — prints `((String)value)`, already String-typed.
//   * `x = <recv>.replace/.replaceAll/.slice/.toLowerCase/.toUpperCase()/.toString()`
//     — prints `Helpers.replace/replaceAll/slice` (all `public static String`) or, for
//     a String receiver, a String-typed method / `String.valueOf`.
//   * `x = this.<name>(…)` — a name in JAVA_STRING_RETURN_METHODS whose Java
//     declaration is `public String` on every override (tree-audited for this slice),
//     or one of the two hand-written String-declared helpers below.
//   * `x += r` — a provably non-null String `r` (see isProvablyNonNullStringOperand).
//
// Every other shape keeps the printer's Object, unchanged.
const STRING_RESULT_METHOD_CALLS = new Set([
    // TS-side method names whose printed Java is statically String for a String receiver
    'replace', 'replaceAll', 'slice', 'toLowerCase', 'toUpperCase', 'toString',
]);

// hand-written BaseExchange methods declared String in Java that are not part of
// JAVA_STRING_RETURN_METHODS (tree census: one `public String` declaration each)
const STRING_DECLARED_BASE_CALLS = new Set([ 'capitalize', 'json' ]);

// declarations whose String decision is already being computed higher up a read chain
const stringWriteInProgress = new Set<any> ();

function resolvesToMethodNamed (printer: any, node: any, name: string): boolean {
    let declaration;
    try {
        declaration = printer.getChecker ().getResolvedSignature (node)?.declaration;
    } catch (e) {
        declaration = undefined;
    }
    return declaration !== undefined && ts.isMethodDeclaration (declaration)
        && declaration.name !== undefined && declaration.name.escapedText === name;
}

// the single local binding an identifier reads, or undefined
function referencedLocalDeclaration (printer: any, identifier: any): any {
    let declaration;
    try {
        declaration = printer.getChecker ().getSymbolAtLocation (identifier)?.valueDeclaration;
    } catch (e) {
        declaration = undefined;
    }
    if (declaration === undefined || !ts.isVariableDeclaration (declaration) || !ts.isIdentifier (declaration.name)) {
        return undefined;
    }
    return declaration;
}

// does the FINAL output declare this local `String`? The full decision is recomputed
// under a cycle guard. In a ws-tier file the declaration is also subject to
// postProcessWsJava's `String x = this.<m>(` -> Object revert, so only the case family
// (whose declaration prints a `(String)` prefix that the revert pattern does not match)
// counts as String there.
function referencedLocalEmitsString (printer: any, identifier: any): boolean {
    const declaration = referencedLocalDeclaration (printer, identifier);
    if (declaration === undefined || stringWriteInProgress.has (declaration)) {
        return false;
    }
    try {
        if (declaration.getStart () >= identifier.getStart ()) {
            return false;
        }
    } catch (e) {
        return false;
    }
    stringWriteInProgress.add (declaration);
    try {
        if (javaLocalType (printer, declaration) !== 'String') {
            return false;
        }
    } finally {
        stringWriteInProgress.delete (declaration);
    }
    return true;
}

function receiverIsProvablyString (printer: any, node: any, sourceName: string, depth = 0): boolean {
    if (node === undefined || depth > 3) return false;
    let value = node;
    while (ts.isParenthesizedExpression (value)) value = value.expression;
    if (value.kind === ts.SyntaxKind.StringLiteral || value.kind === ts.SyntaxKind.NoSubstitutionTemplateLiteral) {
        return true;
    }
    if (ts.isIdentifier (value)) {
        return value.escapedText === sourceName || referencedLocalEmitsString (printer, value);
    }
    if (ts.isAsExpression (value) || ts.isTypeAssertionExpression (value)) {
        return value.type !== undefined && value.type.kind === ts.SyntaxKind.StringKeyword;
    }
    if (ts.isCallExpression (value) && ts.isPropertyAccessExpression (value.expression)) {
        const method = String (value.expression.name.escapedText);
        // never-null String results of any receiver (a null receiver throws, exactly
        // like the TS expression they print)
        return method === 'toString' || method === 'toLowerCase' || method === 'toUpperCase';
    }
    return false;
}

// `this.<name>(…)` whose printed Java is `public String <name>(…)` on every declaration
function isStringDeclaredThisCall (printer: any, node: any): boolean {
    const method = String (node.expression.name.escapedText);
    if (STRING_DECLARED_BASE_CALLS.has (method)) {
        return true;
    }
    return JAVA_STRING_RETURN_METHODS.has (method) && resolvesToMethodNamed (printer, node, method);
}

// a value that is a non-null String on every path: a literal, a literal-led `+` chain,
// or a never-null String call
function isProvablyNonNullStringOperand (printer: any, node: any, sourceName: string, depth = 0): boolean {
    if (node === undefined || depth > 3) return false;
    let value = node;
    while (ts.isParenthesizedExpression (value)) value = value.expression;
    if (value.kind === ts.SyntaxKind.StringLiteral || value.kind === ts.SyntaxKind.NoSubstitutionTemplateLiteral) {
        return true;
    }
    if (ts.isBinaryExpression (value) && value.operatorToken.kind === ts.SyntaxKind.PlusToken) {
        return plusChainIsValuePreserving (printer, value, sourceName, depth + 1);
    }
    if (ts.isCallExpression (value) && ts.isPropertyAccessExpression (value.expression)) {
        const method = String (value.expression.name.escapedText);
        return method === 'toLowerCase' || method === 'toUpperCase' || method === 'toString';
    }
    return false;
}

// a `+` chain whose printed Helpers.add(...) calls all return a non-null String from
// the first `+` on: the left spine starts with a String literal, or with a String local
// whose first right operand is a provably non-null String
function plusChainIsValuePreserving (printer: any, node: any, sourceName: string, depth = 0): boolean {
    if (node === undefined || depth > 3) return false;
    let spine = node;
    for (;;) {
        let left = spine.left;
        while (ts.isParenthesizedExpression (left)) left = left.expression;
        if (ts.isBinaryExpression (left) && left.operatorToken.kind === ts.SyntaxKind.PlusToken) {
            spine = left;
            continue;
        }
        if (left.kind === ts.SyntaxKind.StringLiteral || left.kind === ts.SyntaxKind.NoSubstitutionTemplateLiteral) {
            return true;
        }
        if (ts.isIdentifier (left) && (left.escapedText === sourceName || referencedLocalEmitsString (printer, left))) {
            return isProvablyNonNullStringOperand (printer, spine.right, sourceName, depth + 1);
        }
        return false;
    }
}

// the SS-02 extension of the reassignment acceptance: is the printed Java of this
// write value provably a String (or null)?
function isProvablyStringReassignment (printer: any, node: any, sourceName: string, depth = 0): boolean {
    if (node === undefined || depth > 3) {
        return false;
    }
    if (isProvablyStringExpression (printer, node, sourceName)) {
        return true;
    }
    let value = node;
    while (ts.isParenthesizedExpression (value)) {
        value = value.expression;
    }
    if (ts.isElementAccessExpression (value)) {
        return elementAccessHasStringElements (value);
    }
    if (ts.isIdentifier (value)) {
        return value.escapedText === sourceName || referencedLocalEmitsString (printer, value);
    }
    if (ts.isAsExpression (value) || ts.isTypeAssertionExpression (value)) {
        return value.type !== undefined && value.type.kind === ts.SyntaxKind.StringKeyword;
    }
    if (ts.isBinaryExpression (value) && value.operatorToken.kind === ts.SyntaxKind.PlusToken) {
        return plusChainIsValuePreserving (printer, value, sourceName, depth);
    }
    if (ts.isCallExpression (value) && ts.isPropertyAccessExpression (value.expression)) {
        if (value.expression.expression.kind === ts.SyntaxKind.ThisKeyword) {
            return isStringDeclaredThisCall (printer, value);
        }
        const method = String (value.expression.name.escapedText);
        if (!STRING_RESULT_METHOD_CALLS.has (method)) {
            return false;
        }
        if (method === 'toString') {
            return true; // String.valueOf(x) / x.toString() — String for every receiver
        }
        return receiverIsProvablyString (printer, value.expression.expression, sourceName, depth + 1);
    }
    return false;
}

function javaLocalType (printer: any, declaration: any): string | undefined {
    let initializer = declaration.initializer;
    while (initializer !== undefined && ts.isParenthesizedExpression (initializer)) {
        initializer = initializer.expression;
    }
    if (!isBaseStringAccessorCall (printer, initializer)) {
        return undefined;
    }
    if (!ts.isIdentifier (declaration.name)) {
        return undefined;
    }
    // scan by the SOURCE name: ReservedKeywordsReplacements renames the printed one
    const sourceName = declaration.name.escapedText;
    const fileName = declaration.getSourceFile ().fileName;
    const isProFile = /[\\/]pro[\\/]/.test (fileName);
    const plusRelaxationAllowed = !wsPostProcessReverts (declaration);
    if (!isSafeToNarrow (printer, declaration, sourceName, isProFile, plusRelaxationAllowed)) {
        if (SAFESTRING_DEBUG) {
            console.error (`[java-safestring] reject ${fileName}:${declaration.getStart ()} ${sourceName} (${safeStringRejectReason ?? 'unknown'})`);
            safeStringRejectReason = undefined;
        }
        return undefined;
    }
    return 'String';
}

export function patchJavaLocalTypes (transpiler: any): void {
    const printer = transpiler?.javaTranspiler;
    if (!printer || typeof printer.printVariableDeclarationList !== 'function' || printer._localTypesPatched) {
        return;
    }
    // declaration node → narrowed Java type, filled as declarations are printed.
    // Java statements print in source order, so by the time a reassignment is
    // printed its declaration has already been classified.
    const narrowed = new WeakMap<any, string> ();
    const original = printer.printVariableDeclarationList.bind (printer);
    printer.printVariableDeclarationList = function (node: any, identation: number) {
        const printed = original (node, identation);
        const declaration = node.declarations?.[0];
        if (declaration === undefined || declaration.initializer === undefined) {
            return printed;
        }
        const javaType = javaLocalType (printer, declaration);
        if (SS02_CENSUS) ss02Record (printer, declaration, javaType, printed, identation);
        if (javaType === undefined) {
            return printed;
        }
        // the original emits `<finalVars><iden>Object <name> = <value>`; retype the
        // declaration line only (finalVars above it, if any, are left untouched)
        const iden = printer.getIden (identation);
        const marker = `${iden}${printer.VAR_TOKEN} ${printer.printNode (declaration.name)} = `;
        const at = printed.lastIndexOf (marker);
        if (at === -1) {
            return printed;
        }
        const value = printed.slice (at + marker.length);
        if (!value.startsWith ('this.')) {
            return printed; // unexpected shape — leave it as the printer emitted it
        }
        narrowed.set (declaration, javaType);
        return printed.slice (0, at) + `${iden}${javaType} ${printer.printNode (declaration.name)} = ${value}`;
    };
    // SS-02: `x = recv[key]` with provably String elements prints
    // `Helpers.GetValue(recv, key)`, declared Object, so the write site needs the same
    // `(String)` checkcast such declarations already carry.
    const originalBinary = printer.printBinaryExpression.bind (printer);
    printer.printBinaryExpression = function (node: any, identation: number) {
        const printed = originalBinary (node, identation);
        if (node.operatorToken.kind !== ts.SyntaxKind.EqualsToken || !ts.isIdentifier (node.left)) {
            return printed;
        }
        let right = node.right;
        while (ts.isParenthesizedExpression (right)) {
            right = right.expression;
        }
        if (ts.isElementAccessExpression (right)) {
            if (!elementAccessHasStringElements (right)) {
                return printed;
            }
            const symbol = printer.getChecker ().getSymbolAtLocation (node.left);
            const declaration = symbol?.valueDeclaration;
            const javaType = (declaration !== undefined) ? narrowed.get (declaration) : undefined;
            if (javaType !== 'String') {
                return printed;
            }
            const leftText = printer.printNode (node.left, 0);
            const marker = `${leftText} = `;
            const at = printed.lastIndexOf (marker);
            if (at === -1) {
                return printed;
            }
            const head = at + marker.length;
            if (!printed.slice (head).startsWith ('Helpers.GetValue(')) {
                return printed; // unexpected shape — leave it as the printer emitted it
            }
            if (printed.slice (head).startsWith ('(String) ')) {
                return printed; // already cast (never expected — idempotence guard)
            }
            return printed.slice (0, head) + '(String) ' + printed.slice (head);
        }
        return printed;
    };
    printer._localTypesPatched = true;
}

// ===== SS-02 census: safeString-family locals with later writes (env-gated) =====
//
// Read-only instrumentation for the SS-02 slice — one JSON line per local whose
// initializer is a whole `this.safeString*`-family call, appended to
// CCXT_SS02_CENSUS_OUT (default /tmp/ss02-census.jsonl) when CCXT_SS02_CENSUS=1.
// Piscina workers inherit the env and share the file (one atomic O_APPEND write per
// line). Nothing below changes what the printer emits.
//
// Each record carries
//   * this engine's verdict (`javaLocalType`) and whether a retype would survive
//     postProcessWsJava's `String x = this.<m>(` revert for a ws-tier file,
//   * the blockers of a replica of isSafeToNarrow that keeps scanning after a reject
//     (`mismatch` flags replica drift against the real verdict),
//   * one entry per later assignment with the shape flags a reassignment acceptance
//     reads: the isProvablyStringExpression verdict, string-element element reads,
//     `+` left spines, reads of another local's decision, String-candidate calls.
const SS02_CENSUS = process.env['CCXT_SS02_CENSUS'] === '1';
const SS02_CENSUS_OUT = process.env['CCXT_SS02_CENSUS_OUT'] ?? '/tmp/ss02-census.jsonl';

function ss02Brief (node: any, limit = 110): string {
    try { return String (node?.getText?.() ?? '').replace (/\s+/g, ' ').slice (0, limit); } catch (e) { return '<no-text>'; }
}

function ss02Kind (node: any): string {
    try { return String ((ts.SyntaxKind as any)[node?.kind] ?? node?.kind); } catch (e) { return '<kind>'; }
}

function ss02Append (record: any): void {
    try { fs.appendFileSync (SS02_CENSUS_OUT, JSON.stringify (record) + '\n'); } catch (e) {}
}

// the `this.safeString*` initializer call of a candidate declaration, or undefined
function ss02FamilyInitializer (declaration: any): any {
    let initializer = declaration?.initializer;
    while (initializer !== undefined && ts.isParenthesizedExpression (initializer)) {
        initializer = (initializer as any).expression;
    }
    if (!isThisCall (initializer)) {
        return undefined;
    }
    const name = String ((initializer as any).expression.name.escapedText);
    return name.startsWith ('safeString') ? { name, node: initializer } : undefined;
}

// replica of isSafeToNarrow that keeps collecting after the first reject (the engine
// stops there); a record whose accepted flag disagrees with the real verdict is flagged
function ss02ScanUses (printer: any, declaration: any, sourceName: string, isProFile: boolean): any {
    const scope = enclosingFunction (declaration);
    const blockers: any[] = [];
    if (scope === undefined) {
        return { accepted: false, blockers: [{ reason: 'no-scope' }] };
    }
    const uses = identifierIndex (scope).get (sourceName) ?? [];
    for (const n of uses) {
        if (n === declaration.name) continue;
        const parent = n.parent;
        if (parent === undefined) continue;
        if (ts.isVariableDeclaration (parent) && parent.name === n) continue;
        if (ts.isPropertyAccessExpression (parent) && parent.name === n) continue;
        if (ts.isPostfixUnaryExpression (parent) || ts.isPrefixUnaryExpression (parent)) {
            const op = parent.operator;
            if (op === ts.SyntaxKind.PlusPlusToken || op === ts.SyntaxKind.MinusMinusToken) {
                blockers.push ({ reason: 'increment', text: ss02Brief (n) });
            }
        }
        if (ts.isSpreadElement (parent)) blockers.push ({ reason: 'spread', text: ss02Brief (n) });
        if (ts.isTypeOfExpression (parent)) blockers.push ({ reason: 'typeof', text: ss02Brief (n) });
        if (ts.isArrayLiteralExpression (parent) && ts.isBinaryExpression (parent.parent)
            && parent.parent.left === parent && parent.parent.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
            blockers.push ({ reason: 'array-destructuring', text: ss02Brief (n) });
        }
        if (ts.isBinaryExpression (parent) && parent.left === n) {
            const op = parent.operatorToken.kind;
            if (op === ts.SyntaxKind.EqualsToken) {
                const provable = isProvablyStringExpression (printer, parent.right, sourceName)
                    || isProvablyStringReassignment (printer, parent.right, sourceName);
                if (!provable) {
                    blockers.push ({ reason: 'write', kind: ss02Kind (parent.right), text: ss02Brief (parent.right) });
                }
            } else if (op === ts.SyntaxKind.PlusEqualsToken) {
                if (!isProvablyNonNullStringOperand (printer, parent.right, sourceName)) {
                    blockers.push ({ reason: 'compound-write', kind: ss02Kind (op), text: ss02Brief (parent) });
                }
            } else if (op >= ts.SyntaxKind.FirstCompoundAssignment && op <= ts.SyntaxKind.LastCompoundAssignment) {
                blockers.push ({ reason: 'compound-write', kind: ss02Kind (op), text: ss02Brief (parent) });
            }
        }
        if (isProFile && feedsInheritedAsyncCall (printer, n, scope)) {
            blockers.push ({ reason: 'pro-inherited-async', text: ss02Brief (n) });
        }
    }
    return { accepted: blockers.length === 0, blockers };
}

// the engine's own decision for the declaration an identifier reads, 'Object' when the
// local stays Object, undefined when the identifier is not a single local binding
function ss02LocalDecision (printer: any, identifier: any): any {
    try {
        const symbol = printer.getChecker ().getSymbolAtLocation (identifier);
        const declaration = symbol?.valueDeclaration;
        if (declaration === undefined || !ts.isVariableDeclaration (declaration) || !ts.isIdentifier (declaration.name)) {
            return undefined;
        }
        return javaLocalType (printer, declaration) ?? 'Object';
    } catch (e) {
        return 'error';
    }
}

function ss02WriteInfo (printer: any, parent: any, sourceName: string): any {
    let opText = '<op>';
    try { opText = String (parent.operatorToken?.getText?.() ?? '<op>'); } catch (e) {}
    const info: any = {
        op: opText,
        kind: ss02Kind (parent.right),
        text: ss02Brief (parent.right, 100),
    };
    if (parent.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
        info.provable = isProvablyStringExpression (printer, parent.right, sourceName);
        info.extended = isProvablyStringReassignment (printer, parent.right, sourceName);
        let right = parent.right;
        while (ts.isParenthesizedExpression (right)) right = right.expression;
        if (ts.isCallExpression (right)) {
            if (isBaseStringAccessorCall (printer, right)) {
                info.shape = 'base-accessor';
            } else if (ts.isPropertyAccessExpression (right.expression)) {
                const method = String (right.expression.name.escapedText);
                const isThis = right.expression.expression.kind === ts.SyntaxKind.ThisKeyword;
                const isPrecise = ts.isIdentifier (right.expression.expression) && (right.expression.expression as any).escapedText === 'Precise';
                info.shape = (isThis ? 'this-call:' : (isPrecise ? 'precise:' : 'call:')) + method;
                info.resolvesToMethod = isThis ? resolvesToMethodNamed (printer, right, method) : false;
                info.stringDeclared = isThis ? isStringDeclaredThisCall (printer, right) : false;
            } else {
                info.shape = 'call';
            }
        } else if (ts.isBinaryExpression (right) && right.operatorToken.kind === ts.SyntaxKind.PlusToken) {
            info.shape = 'plus';
            info.leftKind = ss02Kind (right.left);
            info.leftText = ss02Brief (right.left, 50);
            info.leftProvable = plusChainIsValuePreserving (printer, right, sourceName);
        } else if (ts.isElementAccessExpression (right)) {
            info.shape = 'element-access';
            info.receiver = ss02Brief (right.expression, 40);
            info.stringElements = elementAccessHasStringElements (right);
        } else if (ts.isIdentifier (right)) {
            info.shape = 'identifier';
            info.target = String (right.escapedText);
            info.targetSelf = right.escapedText === sourceName;
            info.targetDecision = ss02LocalDecision (printer, right);
        } else if (ts.isConditionalExpression (right)) {
            info.shape = 'ternary';
            info.armKinds = [ ss02Kind (right.whenTrue), ss02Kind (right.whenFalse) ];
            info.armsProvable = isProvablyStringExpression (printer, right.whenTrue, sourceName)
                && isProvablyStringExpression (printer, right.whenFalse, sourceName);
        } else {
            info.shape = 'other:' + info.kind;
        }
    } else if (parent.operatorToken.kind === ts.SyntaxKind.PlusEqualsToken) {
        info.provable = false;
        info.extended = isProvablyNonNullStringOperand (printer, parent.right, sourceName);
    }
    return info;
}

function ss02Writes (printer: any, declaration: any, sourceName: string): any[] {
    const scope = enclosingFunction (declaration);
    if (scope === undefined) return [];
    const writes: any[] = [];
    for (const n of (identifierIndex (scope).get (sourceName) ?? [])) {
        if (n === declaration.name) continue;
        const parent = n.parent;
        if (parent === undefined || !ts.isBinaryExpression (parent) || parent.left !== n) continue;
        const op = parent.operatorToken.kind;
        if (op < ts.SyntaxKind.FirstAssignment || op > ts.SyntaxKind.LastAssignment) continue;
        writes.push (ss02WriteInfo (printer, parent, sourceName));
    }
    return writes;
}

function ss02Record (printer: any, declaration: any, javaType: string | undefined, printed: string, identation: number): void {
    try {
        const candidate = ss02FamilyInitializer (declaration);
        if (candidate === undefined) return;
        const sourceName = String (declaration.name.escapedText);
        const fileName = declaration.getSourceFile ().fileName;
        const isProFile = /[\\/]pro[\\/]/.test (fileName);
        const isPredictionFile = /[\\/]prediction[\\/]/.test (fileName);
        const isWsFile = isProFile || isPredictionFile;
        const iden = printer.getIden (identation);
        const marker = `${iden}${printer.VAR_TOKEN} ${printer.printNode (declaration.name)} = `;
        const at = printed.lastIndexOf (marker);
        const value = at === -1 ? undefined : printed.slice (at + marker.length);
        const retyped = javaType !== undefined && value !== undefined && value.startsWith ('this.');
        const scan = ss02ScanUses (printer, declaration, sourceName, isProFile);
        let realVerdict = false;
        try { realVerdict = isSafeToNarrow (printer, declaration, sourceName, isProFile); } catch (e) {}
        ss02Append ({
            file: fileName.replace (/^.*[\\/]ts[\\/]/, 'ts/'),
            name: sourceName,
            accessor: candidate.name,
            classifies: isBaseStringAccessorCall (printer, candidate.node),
            ws: isWsFile, pro: isProFile, prediction: isPredictionFile,
            verdict: javaType ?? 'Object',
            retyped,
            accepted: realVerdict,
            mismatch: scan.accepted !== realVerdict,
            blockers: scan.blockers,
            writes: ss02Writes (printer, declaration, sourceName),
        });
    } catch (e) {
        ss02Append ({ error: String ((e as any)?.stack ?? e) });
    }
}

// default min(2, AP): 2w + shared-Program chunks is within ~10% of 4w and uses fewer cores.
// Override with CCXT_TRANSPILE_PROCESSES.
function javaWorkerThreads () {
    const requested = Number (process.env.CCXT_TRANSPILE_PROCESSES);
    if (requested > 0) {
        return requested;
    }
    return Math.max (1, Math.min (2, os.availableParallelism ()));
}

class NewTranspiler {

    transpiler!: Transpiler;
    pythonStandardLibraries;
    piscina: Piscina | undefined;
    oldTranspiler = new OldTranspiler();
    // lazily created in webworkerTranspile and kept alive for the lifetime of the
    // transpiler, so worker threads (and their warm Transpiler + ts.Program batch)
    // are reused across every stage instead of paying a cold pool per call
    piscina: Piscina | undefined;
    // Cached transpiled body of the TS `Exchange extends BaseExchange` tier (the 62
    // trading methods), reused by both the Exchange.java injection and the
    // PredictionExchange.java convenience-method injection.
    _exchangeTierBody: string | undefined;

    constructor() {

        this.setupTranspiler()
        // this.transpiler.csharpTranspiler.VAR_TOKEN = 'var'; // tmp fix


        this.pythonStandardLibraries = {
            'hashlib': 'hashlib',
            'math': 'math',
            'json.loads': 'json',
            'json.dumps': 'json',
            'sys': 'sys',
        }
    }

    getWsRegexes() {
        // hoplefully we won't need this in the future by having everything typed properly in the typescript side
        return [
            [/new (\w+)Rest\(\)/, 'new ccxt.$1()'],
            [/return await (\w+);/gm, 'return await ($1 as Exchange.Future);'],
            // [/typeof\(client\)/gm, 'client'],
            // [/typeof\(orderbook\)/gm, 'orderbook'], // fix this in the transpiler later
            [/new\sgetValue\((\w+),\s(\w+)\)\((\w+)\)/gm, 'this.newException(getValue($1, $2), $3)'],
            [/\(object\)client\).subscriptions/gm, '(WebSocketClient)client).subscriptions'],
            [/client\.subscriptions/gm, '((WebSocketClient)client).subscriptions'],
            [/Dictionary<string,object>\)client.futures/gm, 'Dictionary<string, ccxt.Exchange.Future>)client.futures'],
            [/this\.safeValue\(client\.futures,/gm, 'this.safeValue((client as WebSocketClient).futures,'],
            [/Dictionary<string,object>\)this\.clients/gm, 'Dictionary<string, ccxt.Exchange.WebSocketClient>)this.clients'],
            [/(object \w+) = client\.futures/, '$1 = (client as WebSocketClient).futures'],
            [/(orderbook)(\.reset.+)/gm, '($1 as IOrderBook)$2'],
            [/(\w+)(\.cache)/gm, '($1 as ccxt.pro.OrderBook)$2'],
            //  [/(\w+)(\.reset)/gm, '($1 as ccxt.OrderBook)$2'],
            [/((?:this\.)?\w+)(\.hashmap)/gm, '($1 as ArrayCacheBySymbolById)$2'],
            [/(countedBookSide)\.store\(((.+),(.+),(.+))\)/gm, '($1 as IOrderBookSide).store($2)'],
            [/(\w+)\.store\(((.+),(.+),(.+))\)/gm, '($1 as IOrderBookSide).store($2)'],
            [/(\w+)\.store\(((.+),(.+))\)/gm, '($1 as IOrderBookSide).store($2)'],
            [/(\w+)(\.storeArray\(.+\))/gm, '($1 as IOrderBookSide)$2'],
            // [/(.+)\.store\((.+),(.+)\)/gm, '($1 as OrderBookSide).store($2,$3)'],
            [/(\w+)\.call\(this,(.+)\)/gm, 'DynamicInvoker.InvokeMethod($1, new object[] {$2})'],
            [/(\w+)(\.limit\(\))/gm, '($1 as IOrderBook)$2'],
            [/(future)\.resolve\((.*)\)/gm, '($1 as Future).resolve($2)'],
            // [/this\.spawn\((this\.\w+),(.+)\)/gm, 'this.spawn($1, new object[] {$2})'],
            // [/this\.delay\(([^,]+),([^,]+),(.+)\)/gm, 'this.delay($1, $2, new object[] {$3})'],
            // [/(this\.\w+)\.(append|resolve|getLimit)\((.+)\)/gm, 'callDynamically($1, "$2", new object[] {$3})'], // check this.orders
            [/(((?:this\.)?\w+))\.(append|resolve|getLimit)\((.+)\)/gm, 'callDynamically($1, "$3", new object[] {$4})'],
            [/future(\.reject.+)/gm, '((Future)future)$1'],
            [/(\w+)(\.reject.+)/gm, '((WebSocketClient)$1)$2'],
            [/(client)(\.reset.+)/gm, '((WebSocketClient)$1)$2'],
            [/\(client,/g, '(client as WebSocketClient,'],
            [/\(object client,/gm, '(WebSocketClient client,'],
            [/\(object client\)/gm, '(WebSocketClient client)'],
            [/object client =/gm, 'var client ='],
            [/object future =/gm, 'var future ='],
        ]
    }

    getJavaWsRegexes() {
        // Java-specific WS regexes — converts transpiled code for WS exchange classes
        return [
            // Dynamic exception construction: new getValue(x, key)(msg) → this.newException(getValue(x, key), msg)
            [/new\sHelpers\.GetValue\((\w+),\s*(\w+)\)\((\w+)\)/gm, 'this.newException(Helpers.GetValue($1, $2), $3)'],

            // Client type casts — transpiled code uses Object client, need to cast to Client
            [/\(Object client,/gm, '(Client client,'],
            [/\(Object client\)/gm, '(Client client)'],
            [/Object client =/gm, 'Client client ='],
            [/Object future =/gm, 'Object future ='],

            // client.subscriptions / client.futures — these are Object type fields
            // transpiled code tries to cast them to Map, which works since they're ConcurrentHashMaps
            [/\(java\.util\.Map<String, Object>\)client\.futures/gm, '(java.util.Map)client.futures'],
            [/\(java\.util\.Map<String, Object>\)client\.subscriptions/gm, '(java.util.Map)client.subscriptions'],
            [/\(java\.util\.Map<String, Object>\)this\.clients/gm, '(java.util.Map)this.clients'],

            // new XyzRest() → new Xyz() for instantiating REST parent
            [/new (\w+)Rest\(\)/g, 'new io.github.ccxt.exchanges.$1()'],

            // ArrayCache constructor — needs FQN for inner classes + int cast
            [/new ArrayCache\((\w+)\)/gm, 'new ArrayCache(((Number)$1).intValue())'],
            [/new ArrayCacheByTimestamp\((\w+)\)/gm, 'new ArrayCache.ArrayCacheByTimestamp(((Number)$1).intValue())'],
            [/new ArrayCacheByTimestamp\(\)/gm, 'new ArrayCache.ArrayCacheByTimestamp()'],
            [/new ArrayCacheBySymbolById\((\w+)\)/gm, 'new ArrayCache.ArrayCacheBySymbolById(((Number)$1).intValue())'],
            [/new ArrayCacheBySymbolById\(\)/gm, 'new ArrayCache.ArrayCacheBySymbolById()'],
            [/new ArrayCacheByOutcomeById\((\w+)\)/gm, 'new ArrayCache.ArrayCacheByOutcomeById(((Number)$1).intValue())'],
            [/new ArrayCacheByOutcomeById\(\)/gm, 'new ArrayCache.ArrayCacheByOutcomeById()'],
            [/new ArrayCacheBySymbolBySide\((\w+)\)/gm, 'new ArrayCache.ArrayCacheBySymbolBySide(((Number)$1).intValue())'],
            [/new ArrayCacheBySymbolBySide\(\)/gm, 'new ArrayCache.ArrayCacheBySymbolBySide()'],
        ]
    }

    // c# custom method
    customCSharpPropAssignment(node: any, identation: any) {
        const stringValue = node.getFullText().trim();
        if (Object.keys(errors).includes(stringValue)) {
            return `typeof(${stringValue})`;
        }
        return undefined;
    }

    // a helper to apply an array of regexes and substitutions to text
    // accepts an array like [ [ regex, substitution ], ... ]

    regexAll(text: string, array: any[]) {
        for (const i in array) {
            let regex = array[i][0]
            const flags = (typeof regex === 'string') ? 'g' : undefined
            regex = new RegExp(regex, flags)
            text = text.replace(regex, array[i][1])
        }
        return text
    }

    // ============================================================================

    iden(level = 1) {
        return '    '.repeat(level)
    }
    // ============================================================================

    getTranspilerConfig() {
        return {
            "verbose": false,
            "csharp": {
                "parser": {
                    "ELEMENT_ACCESS_WRAPPER_OPEN": "getValue(",
                    "ELEMENT_ACCESS_WRAPPER_CLOSE": ")",
                    // "VAR_TOKEN": "var",
                }
            },
        }
    }

    createSee(link: string) {
        return `/// See <see href="${link}"/>  <br/>`
    }

    createParam(param: any) {
        return `/// <item>
    /// <term>${param.name}</term>
    /// <description>
    /// ${param.type} : ${param.description}
    /// </description>
    /// </item>`
    }

    createCsharpCommentTemplate(name: string, desc: string, see: string[], params: string[], returnType: string, returnDesc: string) {
        //
        // Summary:
        //     Converts the value of the specified 16-bit signed integer to an equivalent 64-bit
        //     signed integer.
        //
        // Parameters:
        //   value:
        //     The 16-bit signed integer to convert.
        //
        // Returns:
        //     A 64-bit signed integer that is equivalent to value
        const comment = `
    /// <summary>
    /// ${desc}
    /// </summary>
    /// <remarks>
    ${see.map(l => this.createSee(l)).join("\n    ")}
    /// <list type="table">
    ${params.map(p => this.createParam(p)).join("\n    ")}
    /// </list>
    /// </remarks>
    /// <returns> <term>${returnType}</term> ${returnDesc}.</returns>`
        const commentWithoutEmptyLines = comment.replace(/^\s*[\r\n]/gm, "");
        return commentWithoutEmptyLines;
    }

    transformTSCommentIntoCSharp(name: string, desc: string, sees: string[], params: string[], returnType: string, returnDesc: string) {
        return this.createCsharpCommentTemplate(name, desc, sees, params, returnType, returnDesc);
    }

    transformLeadingComment(comment: any) {
        // parse comment
        // /**
        //  * @method
        //  * @name binance#fetchTime
        //  * @description fetches the current integer timestamp in milliseconds from the exchange server
        //  * @see https://binance-docs.github.io/apidocs/spot/en/#check-server-time       // spot
        //  * @see https://binance-docs.github.io/apidocs/futures/en/#check-server-time    // swap
        //  * @see https://binance-docs.github.io/apidocs/delivery/en/#check-server-time   // future
        //  * @param {object} [params] extra parameters specific to the exchange API endpoint
        //  * @returns {int} the current integer timestamp in milliseconds from the exchange server
        //  */
        // return comment;
        const commentNameRegex = /@name\s(\w+)#(\w+)/;
        const nameMatches = comment.match(commentNameRegex);
        const exchangeName = nameMatches ? nameMatches[1] : undefined;
        if (!exchangeName) {
            return comment;
        }
        const methodName = nameMatches[2];
        const commentDescriptionRegex = /@description\s(.+)/;
        const descriptionMatches = comment.match(commentDescriptionRegex);
        const description = descriptionMatches ? descriptionMatches[1] : undefined;
        const seeRegex = /@see\s(.+)/g;
        const seeMatches = comment.match(seeRegex);
        const sees: string[] = [];
        if (seeMatches) {
            seeMatches.forEach((match: any) => {
                const [, link] = match.split(' ');
                sees.push(link);
            });
        }
        // const paramRegex = /@param\s{(\w+)}\s\[(\w+)\]\s(.+)/g; // @param\s{(\w+)}\s\[((\w+(.\w+)?))\]\s(.+)
        const paramRegex = /@param\s{(\w+[?]?)}\s\[(\w+\.?\w+?)]\s(.+)/g;
        const params = [] as any;
        let paramMatch;
        while ((paramMatch = paramRegex.exec(comment)) !== null) {
            const [, type, name, description] = paramMatch;
            params.push({ type, name, description });
        }
        const returnRegex = /@returns\s{(\w+\[?\]?\[?\]?)}\s(.+)/;
        const returnMatch = comment.match(returnRegex);
        const returnType = returnMatch ? returnMatch[1] : undefined;
        const returnDescription = returnMatch && returnMatch.length > 1 ? returnMatch[2] : undefined;
        let exchangeData = csharpComments[exchangeName];
        if (!exchangeData) {
            exchangeData = csharpComments[exchangeName] = {}
        }
        let exchangeMethods = csharpComments[exchangeName];
        if (!exchangeMethods) {
            exchangeMethods = {}
        }
        const transformedComment = this.transformTSCommentIntoCSharp(methodName, description, sees, params, returnType, returnDescription);
        exchangeMethods[methodName] = transformedComment;
        csharpComments[exchangeName] = exchangeMethods
        return comment;
    }

    setupTranspiler() {
        this.transpiler = new Transpiler(this.getTranspilerConfig())
        this.transpiler.setVerboseMode(false);
        this.transpiler.csharpTranspiler.transformLeadingComment = this.transformLeadingComment.bind(this);
        this.patchJavaPropertyTypes();
        // narrows `Object x = this.safeString(...)` locals to `String` — see
        // patchJavaLocalTypes above (also applied per worker thread in java-worker.ts)
        patchJavaLocalTypes(this.transpiler);
        // JAVA-15: parse* return signatures (String / java.util.List<Object>) and the
        // parse* body locals fed by them + the timestamp/symbol/currency accessors —
        // see build/java-local-types.js (also applied per worker thread in java-worker.ts)
        installJavaLocalTypes(this.transpiler);
        // JAVA-RE-4: literal / boolean-expression locals (`Object x = "lit"` -> String,
        // `Object ok = Helpers.isEqual(...)` -> Boolean, object/array literals ->
        // Map<String,Object>/List<Object>) — additive slice of the same module, also
        // applied per worker thread in java-worker.ts
        patchJavaLiteralLocalTypes(this.transpiler);
        // JAVA-RE-7: numeric helper locals (safeInteger*/safeFloat*/safeNumber*/parseToInt/
        // milliseconds/seconds/parse8601/parseTimeframe) -> Long/Double/int, the generated
        // method returns those locals rely on, and the conditional-arm restorations —
        // same module, additive section (also applied per worker thread in java-worker.ts)
        installJavaNumericLocalTypes(this.transpiler);
        // SS-06: the four Object-parameter consumers (Helpers.isEqual / isTrue / inOp and
        // this.safeValue*) take a String directly — drop the redundant `((String)x)`
        // checkcast at their argument positions when the operand's declaration already
        // printed `String`. Installed LAST so the print-order proof sees the declaration
        // text every other local-typing slice rewrote (also applied in java-worker.ts).
        patchJavaConsumerStringCasts(this.transpiler);
        // SS-09: the map put/get channel (Helpers.addElementToObject / Helpers.GetValue /
        // put(...) object-literal emits) takes String operands with no cast — drop the
        // redundant ((String)x) checkcast an `x as string` assertion prints at those
        // positions when the operand's declaration printed `String`. Installed LAST so the
        // print-order proof sees every other local-typing pass's rewritten declaration text
        // (also applied per worker thread in java-worker.ts)
        patchJavaMapChannelStringCasts(this.transpiler);
        // SS-12: drop the redundant (String) wrapper on the receiver slot of the
        // string-method prints (x.toUpperCase()/x.length()/Helpers.replace((String)x,..))
        // when the receiver local's emitted Java declaration is `String` — installed
        // LAST so its declaration observer sees the final text of the whole chain
        // (also applied per worker thread in java-worker.ts)
        patchJavaStringReceiverCasts(this.transpiler);
    }

    // ast-transpiler resolves CLASS FIELD types through BaseTranspiler.getType(), which for a
    // TypeReference returns the raw TypeScript type name (`Dict`, `Str`, `Num`, `Strings`, ...)
    // WITHOUT consulting `VariableTypeReplacements` — the very map it already applies to locals,
    // parameters and return types. Java has no `Dict`/`Str`/`Num` class, so a TS field declared
    //     skippedMethods: Dict = {};
    // was emitted verbatim as
    //     public Dict skippedMethods = new java.util.HashMap<String, Object>() {{}};
    // and javac failed with "cannot find symbol". Untyped fields were unaffected (they fall back
    // to the initializer-inferred type), which is why this only surfaced once ts/src was annotated
    // for noImplicitAny.
    //
    // Scope: within JavaTranspiler, getType() is called from exactly ONE site —
    // printPropertyAccessModifiers() — so routing its result through VariableTypeReplacements
    // fixes class-field declarations only, and cannot perturb parameters, locals or return types
    // (those already go through ArgTypeReplacements / the Dict special-cases and are correct).
    // The map is applied by exact key, so a type name it does not know is passed through unchanged.
    patchJavaPropertyTypes() {
        const javaTranspiler = (this.transpiler as any)?.javaTranspiler;
        if (!javaTranspiler || typeof javaTranspiler.getType !== 'function' || javaTranspiler._propertyTypesPatched) {
            return;
        }
        const originalGetType = javaTranspiler.getType.bind(javaTranspiler);
        javaTranspiler.getType = (node: any) => {
            const type = originalGetType(node);
            const replacements = javaTranspiler.VariableTypeReplacements ?? {};
            if ((typeof type === 'string') && Object.prototype.hasOwnProperty.call(replacements, type)) {
                return replacements[type];
            }
            return type;
        };
        javaTranspiler._propertyTypesPatched = true;
    }

    createGeneratedHeader() {
        return [
            "// PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:",
            "// https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code",
            ""
        ]
    }

    getJavaImports(file: any, ws = false, prediction = false) {
        if (ws) {
            // For WS pro exchanges — no import of REST parent (use FQN to avoid name clash)
            return [
                prediction ? 'package io.github.ccxt.exchanges.prediction.pro;' : 'package io.github.ccxt.exchanges.pro;',
                'import io.github.ccxt.base.Precise;',
                'import io.github.ccxt.errors.*;',
                'import io.github.ccxt.Helpers;',
                'import io.github.ccxt.ws.*;',
                'import io.github.ccxt.Client;',
            ];
        }
        // Prediction-market REST exchanges live in their own package and extend
        // their own implicit-API class under io.github.ccxt.api.prediction.
        if (prediction) {
            // prediction exchanges merge REST + WS in one class, so they also need
            // the WS infrastructure imports (Client, ArrayCache, IOrderBookSide, ...)
            return [
                'package io.github.ccxt.exchanges.prediction;',
                `import io.github.ccxt.api.prediction.${this.capitalize(file)}Api;`,
                'import io.github.ccxt.base.Precise;',
                'import io.github.ccxt.errors.*;',
                'import io.github.ccxt.Helpers;',
                'import io.github.ccxt.ws.*;',
                'import io.github.ccxt.Client;',
            ];
        }
        const values = [
            // "using ccxt;",
            'package io.github.ccxt.exchanges;',
            `import io.github.ccxt.api.${this.capitalize(file)}Api;`,
            'import io.github.ccxt.base.Precise;',
            'import io.github.ccxt.errors.*;',
            'import io.github.ccxt.Helpers;'
            // 'import io.github.ccxt.Exchange;',
            // 'import io.github.ccxt.Errors;'
        ]
        return values;
    }

    isObject(type: string) {
        return (type === 'any') || (type === 'unknown');
    }

    isDictionary(type: string): boolean {
        return (type === 'Object') || (type === 'Dictionary<any>') || (type === 'unknown') || (type === 'Dict') || ((type.startsWith('{')) && (type.endsWith('}')))
    }

    isStringType(type: string) {
        return (type === 'Str') || (type === 'string') || (type === 'StringLiteral') || (type === 'StringLiteralType') || (type.startsWith('"') && type.endsWith('"')) || (type.startsWith("'") && type.endsWith("'"))
    }

    isNumberType(type: string) {
        return (type === 'Num') || (type === 'number') || (type === 'NumericLiteral') || (type === 'NumericLiteralType')
    }

    isIntegerType(type: string) {
        return type !== undefined && (type.toLowerCase() === 'int');
    }

    isBooleanType(type: string) {
        return (type === 'boolean') || (type === 'BooleanLiteral') || (type === 'BooleanLiteralType') || (type === 'Bool')
    }

    convertJavascriptTypeToJavaType(name: string, type: string, isReturn = false): string | undefined {

        if (name === 'fetchTime') {
            return `CompletableFuture<Long>`; // custom handling for now
        }

        const isPromise = type.startsWith('Promise<') && type.endsWith('>');
        let wrappedType = isPromise ? type.substring(8, type.length - 1) : type;
        let isList = false;

        function addFutureIfNeeded(t: string) {
            if (t === 'void') {
                return isPromise ? `CompletableFuture<Void>` : 'void';
            } else if (isList) {
                return isPromise ? `CompletableFuture<List<${t}>>` : `List<${t}>`;
            }
            return isPromise ? `CompletableFuture<${t}>` : t;
        }

        const javaReplacements: dict = {
            'OrderType': 'String',
            'OrderSide': 'String', // tmp
        };

        if (wrappedType === undefined || wrappedType === 'Undefined') {
            return addFutureIfNeeded('Object'); // default if type is unknown
        }

        if (wrappedType === 'string[][]') {
            return addFutureIfNeeded('List<List<String>>');
        }

        // check if returns a list
        if (wrappedType.endsWith('[]')) {
            isList = true;
            wrappedType = wrappedType.substring(0, wrappedType.length - 2);
        }

        if (this.isObject(wrappedType)) {
            if (isReturn) {
                return addFutureIfNeeded('Map<String, Object>');
            }
            return addFutureIfNeeded('Object');
        }
        if (this.isDictionary(wrappedType)) {
            return addFutureIfNeeded('Map<String, Object>');
        }
        if (this.isStringType(wrappedType)) {
            return addFutureIfNeeded('String');
        }
        if (this.isIntegerType(wrappedType)) {
            return addFutureIfNeeded('long');
        }
        if (this.isNumberType(wrappedType)) {
            return addFutureIfNeeded('double');
        }
        if (this.isBooleanType(wrappedType)) {
            return addFutureIfNeeded('boolean');
        }
        if (wrappedType === 'Strings') {
            return addFutureIfNeeded('List<String>');
        }
        if (javaReplacements[wrappedType] !== undefined) {
            return addFutureIfNeeded(javaReplacements[wrappedType]);
        }

        // Convert Dictionary<...> -> Map<String, ...>
        if (wrappedType.startsWith('Dictionary<')) {
            let inner = wrappedType.substring(11, wrappedType.length - 1);
            if (inner.startsWith('Dictionary<')) {
                inner = this.convertJavascriptTypeToJavaType(name, inner) as any;
            }
            return addFutureIfNeeded(`Map<String, ${inner}>`);
        }

        return addFutureIfNeeded(wrappedType);
    }

    safeJavaName(name: string): string {
        const javaReservedWordsReplacement: dict = {
            'params': 'parameters',
            'base': 'baseArg',
        }
        return javaReservedWordsReplacement[name] || name;
    }

    convertJavascriptParamToJavaParam(param: any): string | undefined {
        const name = param.name;
        const safeName = this.safeJavaName(name);
        const isOptional = param.optional || param.initializer !== undefined;

        let paramType: any = undefined;

        if (name === 'sourceExchange' && param.type === undefined) {
            paramType = 'BaseExchange';
        } else if (param.type == undefined) {
            paramType = 'Object';
        } else {
            paramType = this.convertJavascriptTypeToJavaType(name, param.type);
        }

        const isNonNullableType =
            this.isNumberType(param.type) ||
            this.isBooleanType(param.type) ||
            this.isIntegerType(param.type);

        if (isOptional && isNonNullableType) {
            if (paramType === 'boolean') paramType = 'Boolean';
            else if (paramType === 'double') paramType = 'Double';
            else if (paramType === 'float') paramType = 'Float';
            else if (paramType === 'long') paramType = 'Long';
            else if (paramType === 'int') paramType = 'Integer';
        }

        if (isOptional) {
            if (param.initializer !== undefined && param.initializer !== 'undefined') {
                const init =
                    typeof param.initializer === 'string'
                        ? param.initializer.replaceAll("'", '"')
                        : param.initializer;
                return `${paramType} ${safeName} = ${init}`;
            }

            return `${paramType} ${safeName} = null`;
        }

        return `${paramType} ${safeName}`;
    }


    shouldCreateWrapper(methodName: string, isWs = false): boolean {
        const allowedPrefixes = [
            'fetch',
            'create',
            'edit',
            'cancel',
            'setP',
            'setM',
            'setL',
            'transfer',
            'withdraw',
            'watch',
            // 'load',
        ];
        // const allowedPrefixesWs = [
        //     ''
        // ]
        const blacklistMethods = [
            'fetch',
            'setSandBoxMode',
            'loadOrderBook',
            'fetchCurrencies',
            'loadMarketsHelper',
            'createNetworksByIdObject',
            'setMarketsFromExchange',
            'setLastRequest',
            'setLastRestRequestTimestamp',
            'setProperty',
            'setProxyAgents',
            'watch',
            'watchMultipleSubscription',
            'watchMultiple',
            'watchPrivate',
            'watchPublic',
            'setPositionsCache',
            'setPositionCache'
        ] // improve this later
        if (isWs) {
            if (methodName.indexOf('Snapshot') !== -1 || methodName.indexOf('Subscription') !== -1 || methodName.indexOf('Cache') !== -1) {
                return false;
            }
        }
        const isBlackListed = blacklistMethods.includes(methodName);
        const startsWithAllowedPrefix = allowedPrefixes.some(prefix => methodName.startsWith(prefix));
        return !isBlackListed && startsWithAllowedPrefix;
    }

    unwrapTaskIfNeeded(type: string): string {
        return type.startsWith('Task<') && type.endsWith('>') ? type.substring(5, type.length - 1) : type;
    }

    unwrapListIfNeeded(type: string): string {
        return type.startsWith('List<') && type.endsWith('>') ? type.substring(5, type.length - 1) : type;
    }

    unwrapDictionaryIfNeeded(type: string): string {
        return type.startsWith('Dictionary<string,') && type.endsWith('>') ? type.substring(19, type.length - 1) : type;
    }

    createReturnStatement(methodName: string, unwrappedType: string) {
        // handle watchOrderBook exception here
        if (methodName.startsWith('watchOrderBook')) {
            return `return ((ccxt.pro.IOrderBook) res).Copy();`; // return copy to avoid concurrency issues
        }

        if (methodName === 'watchOHLCVForSymbols') {
            return `return Helper.ConvertToDictionaryOHLCVList(res);`
        }

        // custom handling for now
        if (methodName === 'fetchTime') {
            return `return (Int64)res;`;
        }

        // handle the typescript type Dict
        if (unwrappedType === 'Dict') {
            return `return (Dictionary<string, object>)res;`;
        }

        const needsToInstantiate = !unwrappedType.startsWith('List<') && !unwrappedType.startsWith('Dictionary<') && unwrappedType !== 'object' && unwrappedType !== 'string' && unwrappedType !== 'float' && unwrappedType !== 'bool' && unwrappedType !== 'Int64';
        let returnStatement = "";
        if (unwrappedType.startsWith('List<')) {
            if (unwrappedType === 'List<Dictionary<string, object>>') {
                returnStatement = `return ((IList<object>)res).Select(item => (item as Dictionary<string, object>)).ToList();`
            } else {
                returnStatement = `return ((IList<object>)res).Select(item => new ${this.unwrapListIfNeeded(unwrappedType)}(item)).ToList<${this.unwrapListIfNeeded(unwrappedType)}>();`
            }
        } else if (unwrappedType.startsWith('Dictionary<string,') && unwrappedType !== 'Dictionary<string, object>' && !unwrappedType.startsWith('Dictionary')) {
            const type = this.unwrapDictionaryIfNeeded(unwrappedType);
            const returnParts = [
                `var keys = ((IDictionary<string, object>)res).Keys.ToList();`,
                `        var result = new Dictionary<string, ${type}>();`,
                `        foreach (var key in keys)`,
                `        {`,
                `            result[key] = new ${type}(((IDictionary<string,object>)res)[key]);`,
                `        }`,
                `        return result;`,
            ].join("\n");
            return returnParts;
        } else {
            returnStatement = needsToInstantiate ? `return new ${unwrappedType}(res);` : `return ((${unwrappedType})res);`;;
        }
        return returnStatement;
    }

    getDefaultParamsWrappers(rawParameters: any[]) {
        const res: string[] = [];

        rawParameters.forEach(param => {
            const isOptional = param.optional || param.initializer === 'undefined';
            // const isOptional =  param.optional || param.initializer !== undefined;
            if (isOptional && (this.isIntegerType(param.type) || this.isNumberType(param.type))) {
                const decl = `${this.inden(2)}var ${param.name} = ${param.name}2 == 0 ? null : (object)${param.name}2;`;
                res.push(decl);
            }
        });

        return res.join("\n");
    }

    inden(level: number) {
        return '    '.repeat(level);
    }

    createWrapper(exchangeName: string, methodWrapper: any, isWs = false) {
        // non-async methods with a declared Promise<T> return type (pure delegators) must be wrapped like async ones
        const isAsync = methodWrapper.async || (methodWrapper.returnType ?? '').startsWith ('Promise');
        const methodName = methodWrapper.name;
        if (!this.shouldCreateWrapper(methodName, isWs)) {
            return ''; // skip aux methods like encodeUrl, parseOrder, etc
        }
        const methodNameCapitalized = methodName.charAt(0).toUpperCase() + methodName.slice(1);
        const returnType = this.convertJavascriptTypeToJavaType(methodName, methodWrapper.returnType, true);
        const unwrappedType = this.unwrapTaskIfNeeded(returnType as string);
        const args: any[] = methodWrapper.parameters.map((param: any) => this.convertJavascriptParamToJavaParam(param));
        const stringArgs = args.filter(arg => arg !== undefined).join(', ');
        const params = methodWrapper.parameters.map((param: any) => this.safeJavaName(param.name)).join(', ');

        const one = this.inden(1);
        const two = this.inden(2);
        const methodDoc = [] as any[];
        if (csharpComments[exchangeName] && csharpComments[exchangeName][methodName]) {
            methodDoc.push(csharpComments[exchangeName][methodName]);
        }
        const method = [
            `${one}public ${isAsync ? 'async ' : ''}${returnType} ${methodNameCapitalized}(${stringArgs})`,
            `${one}{`,
            this.getDefaultParamsWrappers(methodWrapper.parameters),
            `${two}var res = ${isAsync ? 'await ' : ''}this.${methodName}(${params});`,
            `${two}${this.createReturnStatement(methodName, unwrappedType)}`,
            `${one}}`
        ];
        return methodDoc.concat(method).filter(e => !!e).join('\n')
    }

    createExchangesWrappers(): string[] {
        const res: string[] = ['// class wrappers'];

        exchangeIds.forEach(exchange => {
            const capitalizedExchange = exchange.charAt(0).toUpperCase() + exchange.slice(1);
            const capitalName = capitalizedExchange.replace('.ts', '');

            const className = exchange.replace('.ts', '');
            const constructor1 = `    public ${capitalName}() { super(null); }`;
            const constructor2 = `    public ${capitalName}(Object args) { super(args); }`;

            const cls = [
                `public class ${capitalName} extends ${className} {`,
                constructor1,
                constructor2,
                `}`
            ].join('\n');

            res.push(cls);
        });

        return res;
    }

    createJavaWrappers(exchange: string, path: string, wrappers: any[], ws = false) {
        const wrappersIndented = wrappers
            .map(wrapper => this.createWrapper(exchange, wrapper, ws))
            .filter(wrapper => wrapper !== '')
            .join('\n');

        const shouldCreateClassWrappers = exchange === 'Exchange';
        const classes = shouldCreateClassWrappers ? this.createExchangesWrappers().filter(e => !!e).join('\n') : '';

        const pkg = ws ? 'package ccxt.pro;' : 'package io.github.ccxt;';
        const capitizedName = exchange.charAt(0).toUpperCase() + exchange.slice(1);

        const capitalizeStatement = ws
            ? [
                `public class ${capitizedName} extends ${exchange} {`,
                `    public ${capitizedName}() { super(null); }`,
                `    public ${capitizedName}(Object args) { super(args); }`,
                `}`
            ].join('\n')
            : '';

        const file = [
            pkg,
            '',
            this.createGeneratedHeader().join('\n'),
            capitalizeStatement,
            `public class ${exchange} {`,
            wrappersIndented,
            `}`,
            classes
        ].filter(s => s !== '').join('\n');

        log.magenta('→', (path as any).yellow);
        overwriteFileAndFolder(path, file);
    }


    transpileErrorHierarchy(force = true) {

        const errorHierarchyFilename = './js/src/base/errorHierarchy.js'
        const errorHierarchyPath = __dirname + '/.' + errorHierarchyFilename

        // this stage writes one Errors/<Name>.java per node of the hierarchy, so the output
        // list has to be derived from errorHierarchy itself — same pre-order walk the
        // intellisense() generator below does (BaseError first, then every descendant)
        const errorNames = [ 'BaseError' ];
        const walkErrorHierarchy = (map: any) => {
            for (const key in map) {
                errorNames.push (key);
                walkErrorHierarchy (map[key]);
            }
        };
        walkErrorHierarchy ((errorHierarchy as any)['BaseError']);
        if (skipUpToDateStage ('java', 'error hierarchy', force, [ errorHierarchyFilename ], errorNames.map ((name) => ERRORS_FOLDER + this.capitalize (name) + '.java'))) {
            return;
        }

        let js = fs.readFileSync(errorHierarchyPath, 'utf8')

        js = this.regexAll(js, [
            // [ /export { [^\;]+\s*\}\n/s, '' ], // new esm
            [/\s*export default[^\n]+;\n/g, ''],
            // [ /module\.exports = [^\;]+\;\n/s, '' ], // old commonjs
        ]).trim()

        const message = 'Transpiling error hierachy →'
        const root = errorHierarchy['BaseError']

        // a helper to generate a list of exception class declarations
        // properly derived from corresponding parent classes according
        // to the error hierarchy

        function intellisense(map: any, parent: any, generate: any, classes: any) {
            function* generator(map: any, parent: any, generate: any, classes: any): any {
                for (const key in map) {
                    yield generate(key, parent, classes)
                    yield* generator(map[key], key, generate, classes)
                }
            }
            return Array.from(generator(map, parent, generate, classes))
        }


        // JAVA ----------------------------------------------------------------

        // ---------------------------------------------------------------------

        function javaMakeErrorClassFile(name: string, parent: string) {
            const exception =
                `public class ${name} extends ${parent}
{
    public ${name}() { super(); }
    public ${name}(String message) { super(message); }
    public ${name}(String message, ${parent} inner) { super(message, inner); }
}`;
            return exception
        }

        const javaBaseError =
            `public class BaseError extends RuntimeException
{
    public BaseError() { super(); }
    public BaseError(String message) { super(message); }
    public BaseError(String message, Throwable cause) { super(message, cause); }
}`;

        const javaErrors = intellisense(root as any, 'BaseError', javaMakeErrorClassFile, undefined)
        const allErrors = [javaBaseError].concat(javaErrors)
        for (let i = 0; i < allErrors.length; i++) {
            const error = allErrors[i];
            const groups = error.match(/class (\w+) extends (\w+)/);
            const errorName = groups[1];
            const baseError = groups[2];
            const file = [
                'package io.github.ccxt.errors;',
                this.createGeneratedHeader().join('\n'),
                error
            ].join('\n')

            const fileName = ERRORS_FOLDER + this.capitalize(errorName) + '.java'
            log.bright.cyan(message, (fileName as any).yellow)
            overwriteFileAndFolder(fileName, file)
        }
        // const javaBodyIntellisense = '\npackage io.github.ccxt;\n' + this.createGeneratedHeader().join('\n') + '\n' + javaBaseError + '\n' + javaErrors.join ('\n') + '\n'
        // if (fs.existsSync (ERRORS_FILE)) {
        //     log.bright.cyan (message, (ERRORS_FILE as any).yellow)
        //     overwriteFileAndFolder (ERRORS_FILE, javaBodyIntellisense)
        // }
        // log.bright.cyan (message, (ERRORS_FILE as any).yellow)
    }

    // Common regex/AST-artifact fixes applied to the whole transpiled Exchange.ts
    // output (both the BaseExchange class and the trailing Exchange class). Factored
    // out so the Exchange-tier body can be re-derived identically from either the
    // base transpile or a standalone prediction transpile.
    applyExchangeTierJavaFixes(baseClass: string): string {
        // the transpiled base methods live on `BaseExchange` (Exchange is a thin subclass), so
        // the qualified-this used inside anonymous-class initializers must name the enclosing class
        // BaseExchange, not Exchange. (The Exchange-tier trading methods have no such put(...,this.X)
        // initializers, so this is a no-op there.)
        baseClass = baseClass.replace(/(put\("\w+",\s*)(this\.\w+)/gm, "$1BaseExchange.$2");
        baseClass = this.regexAll(baseClass, [
            [/\(Object client, /g, '(Client client, '],
            [/Object client = (.+)/g, 'Client client = (Client)$1'],
            [/(\w+)(\.storeArray\(.+\))/gm, '((IOrderBookSide)$1)$2'],
            [/(\b\w*)RestInstance.describe/g, "(\(BaseExchange\)$1RestInstance).describe"],

            // [/(put\(\s*"\w+", )(this\.\w+)/gm, "$1BaseExchange.$2"],
            [/public Object setMarketsFromExchange\(Object sourceExchange\)/g, "public Object setMarketsFromExchange(BaseExchange sourceExchange)"]
        ]);
        // cast callDynamically to CompletableFuture when .join() is called on the result
        baseClass = baseClass.replace(/\(Helpers\.callDynamically\(([^)]+(?:\([^)]*\))*[^)]*)\)\)\.join\(\)/g, '((java.util.concurrent.CompletableFuture<Object>)Helpers.callDynamically($1)).join()');
        // Strip invalid parens around a method callee, e.g. `(this.handleSubTypeAndParams)(args)`
        // (see createJavaClass for the full rationale).
        baseClass = baseClass.replace(/\((this\.[A-Za-z0-9_]+)\)\(/g, '$1(');
        // Null-safe Array.isArray (see Helpers.isArrayJs comment).
        baseClass = baseClass.replace(/\(\(([^()]+(?:\([^()]*\))*) instanceof java\.util\.List\) \|\| \(\1\.getClass\(\)\.isArray\(\)\)\)/g, 'Helpers.isArrayJs($1)');

        // Remove unreachable "return null;" after throw/return statements (ast-transpiler 0.0.80)
        // Pattern 1: throw directly followed by return null (same block)
        baseClass = baseClass.replace(/throw ([^;]+) ;\n\s*return null;/g, 'throw $1 ;');
        // Pattern 2: if/else where the else throws, followed by return null before });
        // Only safe when else contains throw (not return) — throw always terminates
        baseClass = this.removeUnreachableReturnNull(baseClass);

        baseClass = this.addDeprecatedAnnotations(baseClass);
        return baseClass;
    }

    // Return the transpiled+fixed body (no outer braces) of the TS `Exchange extends
    // BaseExchange` class — the 62 symbol-based trading methods. Cached on first call.
    getExchangeTierBody(baseExchangeFile = './ts/src/base/Exchange.ts'): string {
        if (this._exchangeTierBody !== undefined) {
            return this._exchangeTierBody;
        }
        const strippedBaseFile = writeOverloadStrippedFile (baseExchangeFile);
        const baseFile: any = this.transpiler.transpileJavaByPath(strippedBaseFile);
        removeOverloadStrippedFile (strippedBaseFile, baseExchangeFile);
        const baseClass = this.applyExchangeTierJavaFixes(baseFile.content as string);
        const match = baseClass.match(/(?:public\s+)?class\s+Exchange\s+extends\s+BaseExchange\s*\{([\s\S]*)\}\s*$/);
        this._exchangeTierBody = match ? match[1] : '';
        return this._exchangeTierBody;
    }

    // Method names the prediction layer actually implements — PredictionExchange.ts plus every
    // ts/src/prediction/*.ts venue. Used to keep only the prediction unified surface when injecting
    // Exchange-tier methods into PredictionExchange.java: symbol-based trading methods no prediction
    // venue implements (closePosition, fetchGreeks, createLimitOrder, ...) are dropped, not injected,
    // so prediction instances never carry them (true parity with the other languages).
    getPredictionImplementedNames(): Set<string> {
        const names = new Set<string>();
        const files = [ './ts/src/base/PredictionExchange.ts' ];
        const dir = './ts/src/prediction';
        if (fs.existsSync(dir)) {
            for (const f of fs.readdirSync(dir)) {
                if (f.endsWith('.ts')) {
                    files.push(dir + '/' + f);
                }
            }
        }
        const re = /^    (?:async )?([a-zA-Z][a-zA-Z0-9]*) \(/;
        for (const file of files) {
            for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
                const m = line.match(re);
                if (m) {
                    names.add(m[1]);
                }
            }
        }
        return names;
    }

    // Names of every method declared directly in a transpiled Java class body
    // (indentation level 1, e.g. `    public ... foo(...)`).
    extractJavaMethodNames(classBody: string): Set<string> {
        const names = new Set<string>();
        const re = /\n {4}(?:@[\w.]+\s*(?:\([^)]*\))?\s*)*(?:public|private|protected)\b[^\n(]*?([A-Za-z_][A-Za-z0-9_]*)\s*\(/g;
        let m;
        while ((m = re.exec(classBody)) !== null) {
            names.add(m[1]);
        }
        return names;
    }

    // Remove a whole method (signature + brace-matched body) from a transpiled Java
    // class body, by method name (first match only — the base tier has no overloaded
    // trading-method names).
    removeJavaMethod(classBody: string, methodName: string): string {
        const declRe = new RegExp('\\n {4}(?:@[\\w.]+\\s*(?:\\([^)]*\\))?\\s*)*(?:public|private|protected)\\b[^\\n(]*?\\b' + methodName + '\\s*\\(');
        const m = declRe.exec(classBody);
        if (!m) {
            return classBody;
        }
        const start = m.index; // the '\n' before the declaration
        let i = classBody.indexOf('{', m.index + m[0].length);
        if (i < 0) {
            return classBody;
        }
        let depth = 0;
        let inStr: string | null = null;
        let j = i;
        for (; j < classBody.length; j++) {
            const ch = classBody[j];
            if (inStr) {
                if (ch === '\\') { j++; continue; }
                if (ch === inStr) inStr = null;
                continue;
            }
            if (ch === '"' || ch === '\'') { inStr = ch; continue; }
            if (ch === '{') depth++;
            else if (ch === '}') { depth--; if (depth === 0) { j++; break; } }
        }
        return classBody.slice(0, start) + classBody.slice(j);
    }

    // String-safe file replace: unlike replaceInFile, the replacement is supplied via a
    // callback so `$`-sequences in transpiled Java are treated literally.
    replaceInFileLiteral(filename: string, regex: RegExp, replacement: string) {
        const contents = fs.readFileSync(filename, 'utf8');
        const newContents = contents.replace(regex, () => replacement);
        fs.writeFileSync(filename, newContents);
    }

    transpileBaseMethods(baseExchangeFile: string, force = true) {
        // both generated base files come out of this one pass; `exchanges.json` is listed
        // as an input too — the wrapper generators keyed off the exchange list live in this
        // stage, so adding an exchange must invalidate it even when Exchange.ts did not change
        if (skipUpToDateStage ('java', 'base methods', force, [
            baseExchangeFile,
            './ts/src/base/types.ts',
            './exchanges.json',
        ], [
            BASE_METHODS_FILE,
            EXCHANGE_METHODS_FILE,
        ])) {
            return;
        }
        const javaExchangeBase = BASE_METHODS_FILE;
        const delimiter = 'METHODS BELOW THIS LINE ARE TRANSPILED FROM TYPESCRIPT'

        const strippedBaseFile = writeOverloadStrippedFile (baseExchangeFile);
        const baseFile: any = this.transpiler.transpileJavaByPath(strippedBaseFile);
        removeOverloadStrippedFile (strippedBaseFile, baseExchangeFile);
        let baseClass = this.applyExchangeTierJavaFixes(baseFile.content as string);

        const javaDelimiter = '// ' + delimiter + '\n';
        const restOfFile = '([^\n]*\n)+'
        const parts = baseClass.split(javaDelimiter)
        if (parts.length > 1) {
            // ts/src/base/Exchange.ts declares two classes — `class BaseExchange { ... }` and the
            // `export default class Exchange extends BaseExchange { ...62 trading methods... }` — so
            // the ast-transpiler appends the whole Exchange class after BaseExchange's closing brace.
            // Java allows only one public top-level class per file, so the trading methods are injected
            // into the hand-written Exchange.java below; strip the emitted Exchange class from the
            // BaseExchange output (keeping BaseExchange's closing brace).
            let baseMethods = parts[1];
            baseMethods = baseMethods.replace(/\n\s*(?:public\s+)?class\s+Exchange\s+extends\s+BaseExchange\s*\{[\s\S]*$/, '\n');
            baseMethods = typeCoreReturns(baseMethods, typedReturnTable('rest'));
            log.magenta('→', (javaExchangeBase as any).yellow)
            this.spliceTranspiledJavaBody(javaExchangeBase, javaDelimiter, restOfFile, baseMethods.trim() + '\n', false);
        }

        // Inject the Exchange-tier (62 trading methods) into Exchange.java below its delimiter.
        const match = baseClass.match(/(?:public\s+)?class\s+Exchange\s+extends\s+BaseExchange\s*\{([\s\S]*)\}\s*$/);
        if (match) {
            let exchangeBody = match[1];
            this._exchangeTierBody = exchangeBody;
            // loadOrderBook is provided hand-written (void, WS-snapshot friendly) in Exchange.java;
            // drop the transpiled CompletableFuture version to avoid a redundant overload.
            exchangeBody = this.removeJavaMethod(exchangeBody, 'loadOrderBook');
            exchangeBody = this.redirectToAsyncOnJoin(exchangeBody);
            exchangeBody = typeCoreReturns(exchangeBody, typedReturnTable('rest'));
            log.magenta('→', (EXCHANGE_METHODS_FILE as any).yellow)
            this.spliceTranspiledJavaBody(EXCHANGE_METHODS_FILE, javaDelimiter, restOfFile, exchangeBody.trim() + '\n}\n', true);
        }
    }

    // Replace everything below the transpile delimiter of a half hand-written base file
    // (BaseExchange.java / Exchange.java / PredictionExchange.java) with `body`, shortened to
    // simple java.util / unified-type names; the hand-written header only gains the imports the body needs.
    spliceTranspiledJavaBody(filename: string, javaDelimiter: string, restOfFile: string, body: string, literal: boolean) {
        const pattern = new RegExp(javaDelimiter + restOfFile);
        const shortened = shortenJavaReferences(body);
        const replacement = javaDelimiter + '\n' + shortened.source;
        if (literal) {
            this.replaceInFileLiteral(filename, pattern, replacement);
        } else {
            replaceInFile(filename, pattern, replacement);
        }
        const contents = fs.readFileSync(filename, 'utf8');
        const withImports = ensureJavaImports(contents, shortened.imports);
        if (withImports !== contents) {
            fs.writeFileSync(filename, withImports);
        }
    }

    transpilePredictionBaseMethods(predictionBaseFile = './ts/src/base/PredictionExchange.ts', force = true) {
        // PredictionExchange is the base for prediction-market exchanges; it lives in
        // io.github.ccxt (like Exchange) and is transpiled the same way as the base.
        const javaPredictionBase = './java/lib/src/main/java/io/github/ccxt/PredictionExchange.java';
        // hidden inputs: the injected Exchange-tier body comes from ts/src/base/Exchange.ts
        // (via getExchangeTierBody), the typed surface from types.ts, and the kept-method
        // filter from getPredictionImplementedNames() which reads every ts/src/prediction/*.ts
        if (skipUpToDateStage ('java', 'prediction base methods', force, [
            predictionBaseFile,
            './ts/src/base/Exchange.ts',
            './ts/src/base/types.ts',
        ].concat (predictionSourceFiles ()), [ javaPredictionBase ])) {
            return;
        }
        const delimiter = 'METHODS BELOW THIS LINE ARE TRANSPILED FROM TYPESCRIPT'
        const baseFile: any = this.transpiler.transpileJavaByPath(predictionBaseFile);
        let baseClass = baseFile.content as any;
        // qualified-this inside anonymous-class initializers names the lexically enclosing class,
        // which for these methods is PredictionExchange (not Exchange/BaseExchange).
        baseClass = baseClass.replace(/(put\("\w+",\s*)(this\.\w+)/gm, "$1PredictionExchange.$2");
        baseClass = this.regexAll(baseClass, [
            [/\(Object client, /g, '(Client client, '],
            [/Object client = (.+)/g, 'Client client = (Client)$1'],
            [/(\w+)(\.storeArray\(.+\))/gm, '((IOrderBookSide)$1)$2'],
        ]);
        baseClass = baseClass.replace(/\(Helpers\.callDynamically\(([^)]+(?:\([^)]*\))*[^)]*)\)\)\.join\(\)/g, '((java.util.concurrent.CompletableFuture<Object>)Helpers.callDynamically($1)).join()');
        baseClass = baseClass.replace(/\(\(([^()]+(?:\([^()]*\))*) instanceof java\.util\.List\) \|\| \(\1\.getClass\(\)\.isArray\(\)\)\)/g, 'Helpers.isArrayJs($1)');
        baseClass = baseClass.replace(/throw ([^;]+) ;\n\s*return null;/g, 'throw $1 ;');
        baseClass = this.removeUnreachableReturnNull(baseClass);
        baseClass = this.addDeprecatedAnnotations(baseClass);
        const javaDelimiter = '// ' + delimiter + '\n';
        const restOfFile = '([^\n]*\n)+'
        const parts = baseClass.split(javaDelimiter)
        if (parts.length > 1) {
            // PredictionExchange extends BaseExchange (NOT Exchange), so it does not inherit the 62
            // trading methods that were moved to the Exchange tier. PredictionExchange.ts freshly
            // (re)defines the prediction-specific ones (createOrder/fetchTicker/... → Prediction* types),
            // but the convenience/fallback methods (editOrder, createLimitOrder, createStopLossOrder,
            // fetchL2OrderBook, ...) are not re-declared there. The prediction typed wrappers still call
            // `super.<method>(...)` for the full trading surface, so inject those non-overlapping
            // Exchange-tier methods here. Each delegates to prediction's own createOrder/cancelOrder/etc.
            let predictionBody = parts[1].trim();
            const predictionOwnNames = this.extractJavaMethodNames('\n' + predictionBody);
            let extras = this.getExchangeTierBody();
            // The ast-transpiler qualifies `this` inside anonymous-class initializers with the
            // lexically-enclosing TS class name (`Exchange.this.sortBy(...)`). Re-home those to
            // PredictionExchange, which is where these methods now physically live.
            extras = extras.replace(/\bExchange\.this\b/g, 'PredictionExchange.this');
            // loadOrderBook is WS-snapshot infra prediction never invokes; drop it (mirrors Exchange.java).
            extras = this.removeJavaMethod(extras, 'loadOrderBook');
            // Drop every Exchange-tier method PredictionExchange already declares (avoids duplicate defs).
            for (const name of predictionOwnNames) {
                extras = this.removeJavaMethod(extras, name);
            }
            // Keep only the tier methods the prediction layer actually implements (createOrder,
            // fetchTicker, ...); drop the symbol-based surface no prediction venue supports so
            // PredictionExchange.java doesn't carry (and leak) closePosition/fetchGreeks/etc.
            const predImplemented = this.getPredictionImplementedNames();
            for (const name of this.extractJavaMethodNames('\n' + extras)) {
                if (!predImplemented.has(name)) {
                    extras = this.removeJavaMethod(extras, name);
                }
            }
            // predictionBody ends with the class's closing brace — splice the extras in before it.
            const withoutClose = predictionBody.replace(/\}\s*$/, '');
            let merged = withoutClose.trimEnd() + '\n\n' + extras.trim() + '\n}\n';
            merged = this.redirectToAsyncOnJoin(merged, true);
            merged = typeCoreReturns(merged, typedReturnTable('prediction'));
            log.magenta('→', (javaPredictionBase as any).yellow)
            this.spliceTranspiledJavaBody(javaPredictionBase, javaDelimiter, restOfFile, merged, true);
        }
    }

    camelize(str: string) {
        var res = str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function (match, index) {
            if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
            return index === 0 ? match.toLowerCase() : match.toUpperCase();
        });
        return res.replaceAll('-', '');
    }


    getCsharpExamplesWarning() {
        return [
            '',
            '    // !!Warning!! This example was automatically transpiled',
            '    // from the TS version, meaning that the code is overly',
            '    // complex and illegible compared to the code you would need to write',
            '    // normally. Use it only to get an idea of how things are done.',
            '    // Additionally always choose the typed version of the method instead of the generic one',
            '    // (e.g. CreateOrder (typed) instead of createOrder (generic)',
            ''
        ].join('\n')
    }

    transpileExamples() {
        return;
        // currently disabled!, the generated code is too complex and illegible
        const transpileFlagPhrase = '// AUTO-TRANSPILE //'

        const allTsExamplesFiles = fs.readdirSync(EXAMPLES_INPUT_FOLDER).filter((f) => f.endsWith('.ts'));
        for (const filenameWithExtenstion of allTsExamplesFiles) {
            const tsFile = path.join(EXAMPLES_INPUT_FOLDER, filenameWithExtenstion)
            let tsContent = fs.readFileSync(tsFile).toString()
            if (tsContent.indexOf(transpileFlagPhrase) > -1) {
                const fileName = filenameWithExtenstion.replace('.ts', '')
                log.magenta('[C#] Transpiling example from', (tsFile as any).yellow)
                const csharp = this.transpiler.transpileCSharp(tsContent);

                const transpiledFixed = this.regexAll(
                    csharp.content,
                    [
                        [/object exchange/, 'Exchange exchange'],
                        [/async public Task example/gm, 'async public Task ' + this.camelize(fileName)],
                        [/(^\s+)object\s(\w+)\s=/gm, '$1var $2 ='],
                        [/^await.+$/gm, '']
                    ]
                )

                const finalFile = [
                    'using ccxt;',
                    'using ccxt.pro;',
                    'namespace examples;',
                    // this.getCsharpExamplesWarning(),
                    'partial class Examples',
                    '{',
                    transpiledFixed,
                    '}'
                ].join('\n');

                overwriteFileAndFolder(EXAMPLES_OUTPUT_FOLDER + fileName + '.cs', finalFile);
            }
        }
    }

    async transpileWS(force = false) {
        const tsFolder = './ts/src/pro/';

        let inputExchanges: string[] =  process.argv.slice (2).filter (x => !x.startsWith ('--'));
        const scopedRun = inputExchanges.length > 0;
        if (!inputExchanges || inputExchanges.length === 0) {
            const restExchanges = new Set<string>();
            for (const f of fs.readdirSync(EXCHANGES_FOLDER)) {
                if (!f.endsWith('.java')) continue;
                restExchanges.add(f.replace('.java', '').toLowerCase());
            }
            const wsExchanges = (exchanges as any).ws as string[];
            inputExchanges = wsExchanges.filter((ws: string) => restExchanges.has(ws));
            log.blue('[java-ws] Filtering to exchanges with REST parents:', inputExchanges);
        }
        const options = { csharpFolder: EXCHANGES_WS_FOLDER, exchanges: inputExchanges }
        if (scopedRun) {
            force = true; // a scoped run (CI `transpileJavaSingle -- --ws <exchange>`) always writes, same as the REST path
        }
        await this.transpileDerivedExchangeFiles (tsFolder, options, '.ts', force, true)
    }

    async transpilePrediction(force = false) {
        // Prediction-market exchanges (ts/src/prediction/) transpile to classes
        // under io.github.ccxt.exchanges.prediction. REST + WS are merged into one
        // class (no separate prediction/pro package).
        this.transpilePredictionBaseMethods('./ts/src/base/PredictionExchange.ts', force);
        const tsFolder = './ts/src/prediction/';
        const outputFolder = EXCHANGES_PREDICTION_FOLDER;

        let inputExchanges: string[] = process.argv.slice (2).filter (x => !x.startsWith ('--'));
        if (!inputExchanges || inputExchanges.length === 0) {
            inputExchanges = (exchanges as any).prediction;
        }
        createFolderRecursively(outputFolder);
        const options = { csharpFolder: outputFolder, exchanges: inputExchanges }
        await this.transpileDerivedExchangeFiles (tsFolder, options, '.ts', force, false, true)
    }

    async transpileEverything(force = false, baseOnly = false, examplesOnly = false) {

        const exchanges = process.argv.slice(2).filter(x => !x.startsWith('--'))
            , javaFolder = EXCHANGES_FOLDER
            , tsFolder = './ts/src/'
            , exchangeBase = './ts/src/base/Exchange.ts'

        createFolderRecursively(javaFolder)
        const transpilingSingleExchange = (exchanges.length === 1); // when transpiling single exchange, we can skip some steps because this is only used for testing/debugging
        if (transpilingSingleExchange) {
            force = true; // when transpiling single exchange, we always force
        }
        const options = { csharpFolder: javaFolder, exchanges }

        if (!baseOnly && !examplesOnly) {
            await this.transpileDerivedExchangeFiles(tsFolder, options, '.ts', force)
        }

        if (transpilingSingleExchange) {
            return;
        }

        this.transpileBaseMethods(exchangeBase, force)

        if (baseOnly) {
            return;
        }


        await this.transpileTests(force)

        this.transpileErrorHierarchy(force)

        log.bright.green('Transpiled successfully.')
    }

    async webworkerTranspile(allFiles: any[], parserConfig: any) {

        // one shared pool, created lazily and kept alive for the lifetime of the
        // transpiler: the per-thread Transpiler and its sticky ts.Program batch (see
        // build/worker-program-batch.ts) only pay off if the threads survive across
        // calls — a REST run calls this three times (exchanges, then two test stages),
        // so a fresh pool per call would cold-start the Transpilers every time.
        // Piscina unrefs idle workers, so the pool never holds the process open.
        // Threads default to min(2, AP); CCXT_TRANSPILE_PROCESSES overrides.
        const maxThreads = javaWorkerThreads ();
        if (!this.piscina) {
            this.piscina = new Piscina({
                filename: resolve(__dirname, 'java-worker.ts'),
                maxThreads
            });
        }
        const piscina = this.piscina;
        const configKey = JSON.stringify(parserConfig);

        // One file per task (load-balances; a slow file can't stall others). `roots` is
        // the FULL stage list on every task so each worker builds ONE sticky ts.Program
        // (see build/worker-program-batch.ts) and prints each file off that checker.
        const promises: any = [];
        const now = Date.now();
        for (const file of allFiles) {
            promises.push(piscina.run({ transpilerConfig: parserConfig, configKey, roots: allFiles, files: [file] }));
        }
        const workerResult = await Promise.all(promises);
        const elapsed = Date.now() - now;
        log.green('[ast-transpiler] Transpiled', allFiles.length, 'files in', elapsed, 'ms (webworkerTranspile @ javaTranspiler.ts)');
        // Order-preserving flatten: Promise.all resolves in input order; each task returns
        // one result, so flat() matches allFiles order.
        const flatResult = workerResult.flat();
        return flatResult;
    }

    async transpileDerivedExchangeFiles(jsFolder: string, options: any, pattern = '.ts', force = false, ws = false, prediction = false) {

        // todo normalize jsFolder and other arguments

        // exchanges.json accounts for ids included in exchanges.cfg
        let ids: string[] = []
        try {
            ids = prediction ? (exchanges as any).prediction : (exchanges as any).ids
        } catch (e) {
        }

        const regex = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))

        // local file list — must NOT clobber the module-level `exchanges` (the parsed
        // exchanges.json), which transpileWS reads `.ws` off of. Assigning to it worked
        // only because each stage ran in its own process; --rest-and-ws reuses one.
        let exchangeFiles: string[]
        if (options.exchanges && options.exchanges.length) {
            exchangeFiles = options.exchanges.map((x: string) => x + pattern)
        } else {
            exchangeFiles = fs.readdirSync(jsFolder).filter(file => file.match(regex) && (!ids || ids.includes(basename(file, '.ts'))))
        }

        // incremental gate (same rule as the Python/PHP pass in build/transpile.ts):
        // drop the exchanges whose generated <Name>.java is newer than their ts
        // source. This has to happen BEFORE the pool is fed, because `allFilesPath`
        // doubles as the sticky ts.Program root list (see build/worker-program-batch.ts)
        // — leaving a clean exchange in it would transpile and rewrite it anyway.
        // `--force` (and any single-exchange run) keeps everything.
        exchangeFiles = filterDirtyExchangeFiles('java', exchangeFiles, force, (file: string) => {
            const fileNameNoExt = basename(file, pattern);
            const outputs: string[] = [];
            if (options.csharpFolder) {
                outputs.push(options.csharpFolder + this.capitalize(fileNameNoExt) + '.java');
            }
            return { 'tsPath': jsFolder + file, 'outputs': outputs };
        })

        if (!exchangeFiles.length) {
            return {}
        }

        // transpile using webworker
        const allFilesPath = exchangeFiles.map((file: string) => jsFolder + file);
        log.blue('[java] Transpiling [', exchangeFiles.join(', '), ']');
        // Pool the exchange fan-out across worker threads (one file per task, each
        // worker reusing a cached Transpiler). A single exchange stays on the main
        // thread — pooling one file just adds pool-boot latency for no parallelism.
        const transpiledFiles = (allFilesPath.length > 1)
            ? await this.webworkerTranspile(allFilesPath, this.getTranspilerConfig())
            : allFilesPath.map((file: string) => this.transpiler.transpileJavaByPath(file));

        if (!ws) {
            for (let i = 0; i < transpiledFiles.length; i++) {
                const transpiled = transpiledFiles[i];
                const exchangeName = exchangeFiles[i].replace('.ts','');
                const path = EXCHANGE_WRAPPER_FOLDER + this.capitalize(exchangeName) + '.java';
                // this.createJavaWrappers(exchangeName, path, transpiled.methodsTypes)
                // break;
            }
        } else {
            //
            for (let i = 0; i < transpiledFiles.length; i++) {
                // const transpiled = transpiledFiles[i];
                // const exchangeName = exchanges[i].replace('.ts','');
                // const path = EXCHANGE_WS_WRAPPER_FOLDER + exchangeName + '.cs';
                // this.createCSharpWrappers(exchangeName, path, transpiled.methodsTypes, true)
            }
        }
        exchangeFiles.map((file: string, idx: number) => this.transpileDerivedExchangeFile(jsFolder, file, options, transpiledFiles[idx], force, ws, prediction))

        const classes = {}

        return classes
    }

    createJavaClass(name: string, javaVersion: any, ws = false, prediction = false) {
        const javaImports = this.getJavaImports(name, ws, prediction).join("\n") + "\n\n";
        let content = javaVersion.content;

        const className = this.capitalize(name);

        // inject constructor
        const constructor = [
            '',
            `   public ${className} () {`,
            `       super();`,
            `   }`,
            '',
            `   public ${className} (Object options) {`,
            `       super(options);`,
            `   }`,
            ''
        ].join('\n');

        const regex = /class (\w+) extends (\w+)/
        // const res = content.match(regex)
        // const parentExchange = res[1].toLowerCase();
        // override extends from Exchange to ClassApi
        content = content.replace(/extends\s\w+/g, `extends ${this.capitalize(name)}Api`);
        content = content.replace(/class\s+\w+\s+extends/, `class ${className} extends`);
        content = content.replace(/, (sha1|sha384|sha512|sha256|md5|ed25519|keccak|p256|secp256k1)([,)])/g, `, $1()$2`);
        content = content.replace(/(\s+public Object describe\(\))/g, `${constructor}$1`)
        // `for (var i = <ident>; Helpers.isLessThan(i, end); i++)` — when the loop
        // initializer is a bare identifier (an Object-typed local, e.g. a running
        // index reassigned from this.sum(...)), Java's `var` infers Object and
        // `i++` fails ("bad operand type Object"). Declare such loop vars as a
        // primitive `long` (coerced via Helpers.parseInt). Loops whose init is a
        // numeric literal (`var i = 0`) are left untouched — `var` infers int and
        // `i++` works. The boxed `long` still satisfies Helpers.isLessThan/GetValue
        // via autoboxing.
        content = content.replace(
            /for \(var (\w+) = ([A-Za-z_]\w*); (Helpers\.isLessThan(?:OrEqual)?)\(\1,/g,
            'for (long $1 = Helpers.toInt64($2); $3($1,'
        );
        // cast callDynamically to CompletableFuture when .join() is called on the result
        content = content.replace(/\(Helpers\.callDynamically\(([^)]+(?:\([^)]*\))*[^)]*)\)\)\.join\(\)/g, '((java.util.concurrent.CompletableFuture<Object>)Helpers.callDynamically($1)).join()');
        // Null-safe Array.isArray rewrite. ast-transpiler emits the bare
        // `(X instanceof java.util.List) || (X.getClass().isArray())` form,
        // which NPEs when X is null (JS Array.isArray(null) is false). Route
        // all such checks through Helpers.isArrayJs which guards null first.
        content = content.replace(/\(([^()]+(?:\([^()]*\))*) instanceof java\.util\.List\) \|\| \(\1\.getClass\(\)\.isArray\(\)\)/g, 'Helpers.isArrayJs($1)');

        // Remove unreachable "return null;" after throw/return statements (ast-transpiler 0.0.80)
        content = content.replace(/throw ([^;]+) ;\n\s*return null;/g, 'throw $1 ;');
        content = this.removeUnreachableReturnNull(content);
        // Remove unreachable "return null;" after simple if/else where both branches
        // directly return (single-line return in each branch, no nested control flow)
        // Handle if/else where else has return (not throw): remove unreachable return null
        // Pattern: "return X;\n    } else\n    {\n    return Y;\n    }\n    return null;\n    });"
        // Safe because plain "} else" covers all paths, and else block ends with return
        // Pattern: any line ending with "return X;\n  }\n  return null;\n  });" where the line
        // before "}" starts the else block with "} else\n  {"
        // Uses the removeReturnNullAfterElseReturn method for multi-line else blocks
        // Handle simple if/else where both branches have a direct return as last line:
        // } else\n {\n    return X;\n }\n return null;\n });
        // Remove unreachable "return null;" for simple if/else where else ends with return.
        // Uses line-by-line function to avoid greedy regex issues.

        // const baseWsClassRegex = /class\s(\w+)\s+:\s(\w+)/;
        // const baseWsClassExec = baseWsClassRegex.exec(content);
        // const baseWsClass = baseWsClassExec ? baseWsClassExec[2] : '';
        // if (!ws) {
        //     content = content.replace(/class\s(\w+)\s:\s(\w+)/gm, "public partial class $1 : $2");
        // } else {
        //     const wsParent =  baseWsClass.endsWith('Rest') ? 'ccxt.' + baseWsClass.replace('Rest', '') : baseWsClass;
        //     content = content.replace(/class\s(\w+)\s:\s(\w+)/gm, `public partial class $1 : ${wsParent}`);
        // }
        // content = content.replace(/binaryMessage.byteLength/gm, 'getValue(binaryMessage, "byteLength")'); // idex tmp fix
        // WS fixes
        if (ws) {
            const wsRegexes = this.getJavaWsRegexes();
            content = this.regexAll (content, wsRegexes);
            content = this.replaceImportedRestClasses (content, javaVersion.imports);
            // WS classes extend the REST class: pro.Binance extends io.github.ccxt.exchanges.Binance
            const restTypedFqn = `io.github.ccxt.exchanges.${this.capitalize(name)}`;
            content = content.replace(/extends\s\w+Api/g, `extends ${restTypedFqn}`);
            content = content.replace(/extends\s(\w+)Rest/g, `extends io.github.ccxt.exchanges.$1`);
            content = content.replace(/extends\s(\w+)\b(?!\.)/, `extends ${restTypedFqn}`);
            content = this.postProcessWsJava(content, name);
        } else if (prediction) {
            // prediction merges REST + WS in one class — apply the WS regexes + post-processing
            // (orderbook/side casts, watch(), resolve/append, ...) so the watch* methods compile,
            // but keep the REST `extends <Id>Api` (which extends PredictionExchange) and skip the
            // effectively-final pass (it conflicts with the REST parse* methods, which the
            // ast-transpiler already handles).
            content = this.regexAll (content, this.getJavaWsRegexes());
            content = this.postProcessWsJava(content, name, true, true);
        }
        content = this.addDeprecatedAnnotations(content);
        return this.createGeneratedHeader().join('\n') + '\n' + javaImports + content;
    }

    /**
     * Remove unreachable "return null;" lines that appear after if/else blocks where
     * both branches terminate (return or throw). The ast-transpiler 0.0.80 adds these
     * for safety but Java treats them as compilation errors.
     */
    removeUnreachableReturnNull(content: string): string {
        const lines = content.split('\n');
        const result: string[] = [];
        for (let i = 0; i < lines.length; i++) {
            // Check if this line is "return null;" and the next is "});" (lambda end)
            if (lines[i].trim() === 'return null;' && i + 1 < lines.length && lines[i + 1].trim().startsWith('})')) {
                // Check if the preceding non-empty line is "}" closing an else/else-if block
                // that contains a throw or return
                let j = i - 1;
                while (j >= 0 && lines[j].trim() === '') j--;
                if (j >= 0 && lines[j].trim() === '}') {
                    // Look back further to check if the block contains throw or return
                    let k = j - 1;
                    while (k >= 0 && lines[k].trim() !== '{') k--;
                    // Check the else block for throw (guaranteed unconditional termination).
                    // We don't check for return because return might be inside a nested
                    // if/for and not guaranteed to execute on all paths.
                    let hasThrow = false;
                    for (let l = k; l <= j; l++) {
                        const trimmed = lines[l].trim();
                        if (trimmed.startsWith('throw ')) {
                            hasThrow = true;
                            break;
                        }
                    }
                    // Only safe with plain "} else" (not "} else if")
                    let hasPlainElse = false;
                    if (k > 0) {
                        const beforeBlock = lines[k - 1].trim();
                        hasPlainElse = beforeBlock === '} else';
                    }
                    if (hasThrow && hasPlainElse) {
                        // Skip this "return null;" line — it's unreachable
                        continue;
                    }
                }
            }
            result.push(lines[i]);
        }
        return result.join('\n');
    }

    /**
     * Remove "return null;" after if/else where the else block's last statement is a return.
     * More conservative than removeUnreachableReturnNull — only handles the else-return pattern.
     */
    removeReturnNullAfterElseReturn(content: string): string {
        const lines = content.split('\n');
        const result: string[] = [];
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].trim() === 'return null;'
                && i + 1 < lines.length && lines[i + 1].trim().startsWith('})')) {
                // Check: preceding } then scan backward for "} else" + "{" pair
                let j = i - 1;
                while (j >= 0 && lines[j].trim() === '') j--;
                if (j >= 0 && lines[j].trim() === '}') {
                    const elseClose = j;
                    // Scan backward to find "} else" line, tracking brace depth
                    let depth = 1; // start with 1 for the closing }
                    let elseStart = -1;
                    for (let k = elseClose - 1; k >= 0; k--) {
                        const t = lines[k].trim();
                        if (t === '}') depth++;
                        else if (t === '{') {
                            depth--;
                            if (depth === 0) {
                                // Found the opening { of this block
                                if (k > 0 && lines[k - 1].trim() === '} else') {
                                    elseStart = k;
                                }
                                break;
                            }
                        }
                    }
                    if (elseStart >= 0) {
                        // Check that the last non-comment statement before } is a return
                        let lastReturn = false;
                        for (let k = elseClose - 1; k > elseStart; k--) {
                            const t = lines[k].trim();
                            if (t === '' || t.startsWith('//') || t === '}') continue;
                            lastReturn = t.startsWith('return ');
                            break;
                        }
                        if (lastReturn) {
                            continue; // Skip return null — else block ends with return
                        }
                    }
                }
            }
            result.push(lines[i]);
        }
        return result.join('\n');
    }

    /**
     * Remove "return null;" after if { return } else { ...return } where BOTH branches
     * guarantee a return. Uses brace-depth to find the exact else block boundaries,
     * then checks that the else block's last statement (at depth 0 within the block) is a return
     * and the if block's statement just before "} else" is also a return.
     */
    removeReturnNullAfterCompleteIfElse(content: string): string {
        const lines = content.split('\n');
        const result: string[] = [];
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].trim() === 'return null;'
                && i + 1 < lines.length && lines[i + 1].trim().startsWith('})')) {
                let j = i - 1;
                while (j >= 0 && lines[j].trim() === '') j--;
                if (j >= 0 && lines[j].trim() === '}') {
                    // Find matching { using depth tracking
                    let depth = 0;
                    let elseOpen = -1;
                    for (let k = j; k >= 0; k--) {
                        for (let c = lines[k].length - 1; c >= 0; c--) {
                            if (lines[k][c] === '}') depth++;
                            else if (lines[k][c] === '{') depth--;
                        }
                        if (depth === 0) {
                            elseOpen = k;
                            break;
                        }
                    }
                    if (elseOpen >= 0 && elseOpen > 0 && lines[elseOpen - 1].trim() === '} else') {
                        // Check else block: last non-empty/non-comment/non-brace line is return
                        let elseLastReturn = false;
                        for (let k = j - 1; k > elseOpen; k--) {
                            const t = lines[k].trim();
                            if (t === '' || t.startsWith('//') || t === '}' || t === '{') continue;
                            elseLastReturn = t.startsWith('return ');
                            break;
                        }
                        // Check if block: line before "} else" should be return
                        let ifLastReturn = false;
                        const elseKeyLine = elseOpen - 1; // "} else" line
                        // Find the line before } in "} else" — scan backward
                        for (let k = elseKeyLine - 1; k >= 0; k--) {
                            const t = lines[k].trim();
                            if (t === '' || t.startsWith('//') || t === '}' || t === '{') continue;
                            ifLastReturn = t.startsWith('return ');
                            break;
                        }
                        if (elseLastReturn && ifLastReturn) {
                            continue; // Skip unreachable return null;
                        }
                    }
                }
            }
            result.push(lines[i]);
        }
        return result.join('\n');
    }

    replaceImportedRestClasses(content: string, imports: any[]) {
        for (const imp of imports) {
            // { name: "hitbtc", path: "./hitbtc.js", isDefault: true, }
            // { name: "bequantRest", path: "../bequant.js", isDefault: true, }
            const name = imp.name;
            if (name.endsWith('Rest')) {
                content = content.replaceAll(name, 'ccxt.' + name.replace('Rest', ''));
            }
        }
        return content;
    }

    /**
     * Insert `@Deprecated` annotation on every method whose preceding JSDoc
     * block contains an `@deprecated` tag. Silences javac `[dep-ann]` warnings
     * and lets IDEs surface the deprecation on callers.
     */
    addDeprecatedAnnotations(content: string): string {
        const re = /(\/\*\*(?:[^*]|\*(?!\/))*?@deprecated(?:[^*]|\*(?!\/))*?\*\/)(\s*\n)(?!\s*@Deprecated\b)([ \t]*)(public|protected|private)\b/g;
        return content.replace(re, '$1$2$3@Deprecated\n$3$4');
    }

    /**
     * Convert `return null;` → `return;` inside `public void` method bodies.
     * The transpiler emits `return null;` for bare `return;` statements in TS,
     * which is invalid in Java void context. Tracks brace depth to stay within
     * the method body only.
     */
    /**
     * Collect the typed `default` method names declared on the generated
     * TypedSurface / PredictionTypedSurface interface. Used by redirectToAsyncOnJoin
     * to scope the rewrite to methods that shadow the untyped varargs core signature.
     */
    _typedSurfaceNames: Map<boolean, Set<string>> = new Map();
    collectTypedSurfaceMethodNames(prediction = false): Set<string> {
        const cached = this._typedSurfaceNames.get(prediction);
        if (cached !== undefined) return new Set(cached);
        const path = EXCHANGE_WRAPPER_FOLDER + (prediction ? 'PredictionTypedSurface.java' : 'TypedSurface.java');
        const names = new Set<string>();
        let content = '';
        try {
            content = fs.readFileSync(path, 'utf-8');
        } catch {
            log.red(`[java] ${path} missing — run \`tsx build/generateJavaWrappers.ts\` first; typed-call casts skipped`);
        }
        const re = /^\s{4}default\s+[^=]+?\s+(\w+)\s*\(/gm;
        let m;
        while ((m = re.exec(content)) !== null) names.add(m[1]);
        this._typedSurfaceNames.set(prediction, names);
        return new Set(names);
    }

    /**
     * Collect every method name defined inside the class body of the given
     * file. Used for method-reference-as-value rewriting so we don't need a
     * hardcoded whitelist.
     */
    collectMethodNamesInClass(content: string): Set<string> {
        const names = new Set<string>();
        const re = /^\s{4}(?:public|private|protected)\s+[^=]+?\s+(\w+)\s*\(/gm;
        let m;
        while ((m = re.exec(content)) !== null) {
            const n = m[1];
            // Skip obvious non-method tokens that could sneak through
            if (n === 'this' || n === 'class' || n === 'if' || n === 'for' || n === 'while') continue;
            names.add(n);
        }
        return names;
    }

    /**
     * Rewrite `(this.X(arg1, ...)).join()` / `(super.X(arg1, ...)).join()` in every
     * transpiled tier, where X carries typed defaults on TypedSurface, to cast every
     * argument to `(Object)` so the call dispatches to the untyped `X(Object...)` core
     * signature instead of a typed overload (which returns the typed value and breaks
     * `.join()`, or is ambiguous between List<String> / String[] on a null).
     */
    redirectToAsyncOnJoin(content: string, prediction = false): string {
        const typedRestMethods = this.collectTypedSurfaceMethodNames(prediction);
        if (typedRestMethods.size === 0) return content;
        // loadMarkets has a special typed signature `loadMarkets(boolean reload)`;
        // the untyped base accepts 0 args, so a zero-arg call is already unambiguous
        // and we shouldn't touch it.
        typedRestMethods.delete('loadMarkets');
        const pattern = /\((this|super)\.(\w+)\(/g;
        let result = '';
        let lastIdx = 0;
        let match;
        while ((match = pattern.exec(content)) !== null) {
            const receiver = match[1];
            const methodName = match[2];
            if (!typedRestMethods.has(methodName)) {
                continue;
            }
            const argsStart = match.index + match[0].length;
            let depth = 1;
            let j = argsStart;
            while (j < content.length && depth > 0) {
                if (content[j] === '(') depth++;
                else if (content[j] === ')') depth--;
                j++;
            }
            // j now points just past the closing ')' of the method call.
            // Expect outer ')' + '.join()' to confirm this is a CompletableFuture-style use.
            if (j < content.length && content[j] === ')' && content.substring(j + 1, j + 8) === '.join()') {
                const argsRaw = content.substring(argsStart, j - 1);
                // Zero-arg calls are already unambiguous (typed overloads require
                // 1+ args); only cast when there are real args.
                //
                // SS-05: an argument at a parameter position the transpiler retyped to
                // `String` (JAVA_STRING_PARAM_POSITIONS) must stay uncast — an `(Object)`
                // cast would no longer bind the String-parameter method at all, and the
                // method name is only admitted to that table when dropping the cast
                // still binds the untyped varargs implementation (no typed truncation
                // overload can steal it).
                // `new Object[0]` (routeWhitelistedInternalCallsToVarargs) already binds the
                // varargs core; casting it to (Object) would pass the array as one element.
                const retyped = JAVA_STRING_PARAM_POSITIONS[methodName] ?? [];
                const bare = (a: string, k: number) => retyped.includes(k) || a === 'new Object[0]';
                const argsCast = argsRaw.trim().length === 0
                    ? argsRaw
                    : this.splitTopLevelArgs(argsRaw).map((a, k) => (bare(a.trim(), k) ? a.trim() : `(Object)(${a.trim()})`)).join(', ');
                result += content.substring(lastIdx, match.index);
                result += `(${receiver}.${methodName}(${argsCast})).join()`;
                lastIdx = j + 8;
                pattern.lastIndex = lastIdx;
            }
        }
        result += content.substring(lastIdx);
        return result;
    }

    /**
     * Rewrite `this.delay(ms, "methodName", arg1, arg2, ...)` to a spawn-and-sleep
     * lambda that dispatches the callback via Helpers.callDynamically. Uses
     * balanced-paren walking to support any number of args and arbitrary nested
     * expressions.
     */
    rewriteDelayWithStringCallback(content: string): string {
        const pattern = /this\.delay\(/g;
        let result = '';
        let lastIdx = 0;
        let match;
        while ((match = pattern.exec(content)) !== null) {
            const openIdx = match.index + match[0].length;
            let depth = 1;
            let i = openIdx;
            while (i < content.length && depth > 0) {
                const ch = content[i];
                if (ch === '(') depth++;
                else if (ch === ')') depth--;
                i++;
            }
            const argsRaw = content.substring(openIdx, i - 1);
            const args = this.splitTopLevelArgs(argsRaw);
            if (args.length < 2) continue;
            const delayMs = args[0].trim();
            const callback = args[1].trim();
            const callbackMatch = callback.match(/^"(\w+)"$/);
            if (!callbackMatch) continue; // only rewrite string-literal callback form
            const callbackName = callbackMatch[1];
            const extraArgs = args.slice(2).map(a => a.trim()).join(', ');
            result += content.substring(lastIdx, match.index);
            const extraArgsList = extraArgs.length > 0 ? `, ${extraArgs}` : '';
            result += `this.scheduleCallback(${delayMs}, "${callbackName}"${extraArgsList})`;
            lastIdx = i;
            pattern.lastIndex = i;
        }
        result += content.substring(lastIdx);
        return result;
    }

    /**
     * Split a method-args string by commas at nesting depth 0. Preserves parens,
     * brackets, and braces in nested expressions.
     */
    splitTopLevelArgs(args: string): string[] {
        const out: string[] = [];
        let depth = 0;
        let angleDepth = 0;
        let start = 0;
        let inStr: string | null = null;
        for (let i = 0; i < args.length; i++) {
            const ch = args[i];
            if (inStr !== null) {
                if (ch === '\\' && i + 1 < args.length) { i++; continue; }
                if (ch === inStr) inStr = null;
                continue;
            }
            if (ch === '"' || ch === '\'') { inStr = ch; continue; }
            if (ch === '(' || ch === '[' || ch === '{') depth++;
            else if (ch === ')' || ch === ']' || ch === '}') depth--;
            // Track generic type params <...>. Only treat `<` as an open when it
            // looks like a generic (followed by an identifier or another `<`).
            // Comparison operators like `x < y` have space around `<`, so this
            // heuristic is safe for well-formatted transpiled code.
            else if (ch === '<' && depth === 0 && i + 1 < args.length && /[A-Za-z_<]/.test(args[i + 1])) {
                angleDepth++;
            } else if (ch === '>' && angleDepth > 0) {
                angleDepth--;
            } else if (ch === ',' && depth === 0 && angleDepth === 0) {
                out.push(args.substring(start, i));
                start = i + 1;
            }
        }
        if (start < args.length) out.push(args.substring(start));
        return out;
    }

    fixVoidReturnNull(content: string): string {
        const lines = content.split('\n');
        let depth = 0;
        let armed = false;
        let inVoid = false;
        let entryDepth = -1;
        let inBlockComment = false;
        const stripForBraceCount = (raw: string): string => {
            // Remove line comments, string literals, and block-comment segments so
            // brace tracking stays accurate. Brace chars inside those contexts
            // must not affect depth.
            let s = raw;
            // Handle /* ... */ segments across and within lines
            if (inBlockComment) {
                const end = s.indexOf('*/');
                if (end < 0) return '';
                s = s.substring(end + 2);
                inBlockComment = false;
            }
            while (true) {
                const start = s.indexOf('/*');
                if (start < 0) break;
                const end = s.indexOf('*/', start + 2);
                if (end < 0) {
                    inBlockComment = true;
                    s = s.substring(0, start);
                    break;
                }
                s = s.substring(0, start) + s.substring(end + 2);
            }
            // Strip string literals (simple; doesn't handle escaped quotes beyond \\)
            s = s.replace(/"(?:[^"\\]|\\.)*"/g, '""');
            s = s.replace(/'(?:[^'\\]|\\.)*'/g, "''");
            // Strip line comments
            s = s.replace(/\/\/.*$/, '');
            return s;
        };
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (!inVoid && !armed && /^\s*public\s+void\s+\w+\s*\(/.test(line)) {
                armed = true;
            }
            if (inVoid) {
                lines[i] = line.replace(/\breturn null;/g, 'return;');
            }
            const counted = stripForBraceCount(line);
            for (const ch of counted) {
                if (ch === '{') {
                    if (armed && !inVoid) {
                        inVoid = true;
                        entryDepth = depth;
                        armed = false;
                    }
                    depth++;
                } else if (ch === '}') {
                    depth--;
                    if (inVoid && depth === entryDepth) {
                        inVoid = false;
                        entryDepth = -1;
                    }
                }
            }
        }
        return lines.join('\n');
    }

    // true when the text proves the identifier `name` at offset `pos` is Java-`String`:
    // the NEAREST PRECEDING declaration of `name` inside the same method must be
    // `String ...` AND its value must survive the "String type fixes" revert below
    // (`String x = this.<m>(...)` / `Helpers.<...>(...)` are rewritten back to Object,
    // so they prove nothing). Used by the ws post-passes: the `(String)` hash cast they
    // add around `client.future(name)` / `client.reusableFuture(name)` is redundant when
    // the hash local is already declared String (WsClient.future/reusableFuture take
    // `String`). A field/param not declared in the file proves nothing -> keep the cast.
    provablyStringLocal (content: string, name: string, pos: number): boolean {
        const masked = maskJavaComments(content);
        const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const before = masked.slice(0, pos);
        // the enclosing method: the last member-modifier line before `pos`; a use that has
        // no declaration inside its own method binds to a field/param -> keep the cast
        const breaks = [...before.matchAll(/^[ \t]*(?:public|private|protected)[ \t]/gm)];
        const windowStart = breaks.length > 0 ? breaks[breaks.length - 1].index : 0;
        const window = masked.slice(windowStart, pos);
        const decl = new RegExp(`\\b(String|Object|Integer|Long|Double|Boolean|var|char)\\s+${escaped}\\s*(?=[=;,)])`, 'g');
        let last = null;
        let m;
        while ((m = decl.exec(window)) !== null) {
            last = m;
        }
        if (last === null || last[1] !== 'String') {
            return false;
        }
        const rest = window.slice(last.index + last[0].length);
        const value = /^\s*=\s*([^\n;]*)/.exec(rest);
        if (value !== null && /^(?:this\.[A-Za-z_]\w*\s*\(|Helpers\.)/.test(value[1].trim())) {
            return false;
        }
        return true;
    }

    // SS-04: true when the `Helpers.add(...)` call starting at `addStart` has a FIRST operand
    // that is statically String in Java — javac then picks the String-returning
    // `add(String, *)` overload (Helpers.java), so an outer `(String)` checkcast is redundant.
    // Text-level proof for the shapes the ws post-passes meet: a string literal, an audited
    // `this.<member>` String field, a local whose same-method nearest declaration proves
    // String, or a nested `Helpers.add(...)` chain that itself starts with one.
    addChainStartsWithString (content: string, addStart: number): boolean {
        const first = jsAddFirstOperand(content, addStart);
        if (first === undefined) {
            return false;
        }
        const text = first.text.trim();
        if (text.startsWith('"') || text.startsWith("'")) {
            return true;
        }
        const member = /^this\.([A-Za-z_]\w*)$/.exec(text);
        if (member !== null) {
            return JS_STRING_MEMBER_FIELDS.has(member[1]);
        }
        if (text.startsWith('Helpers.add(')) {
            const nested = content.indexOf('Helpers.add(', first.start);
            return nested !== -1 && this.addChainStartsWithString(content, nested);
        }
        if (/^[A-Za-z_]\w*$/.test(text)) {
            return this.provablyStringLocal(content, text, first.start);
        }
        return false;
    }

    postProcessWsJava(content: string, name: string, skipEffectivelyFinal = false, prediction = false): string {
        const cap = this.capitalize(name);

        // ── Fix broken method references: ClassName."methodName" → "methodName" ──
        // The transpiler generates method references as ClassName."methodName" which is
        // invalid Java (string template syntax). These are used as map values for
        // message handler dispatch tables. Replace with just the string literal.
        content = content.replace(new RegExp(`${cap}\\.("\\w+")`, 'gm'), '$1');

        // ── Pattern 12: Map casts for client.subscriptions/futures access ──
        content = content.replace(/\(\(Object\)client\)\.subscriptions/gm, '((java.util.Map)client.subscriptions)');
        content = content.replace(/\(\(Object\)client\)\.futures/gm, '((java.util.Map)client.futures)');
        // Direct access without cast
        content = content.replace(/client\.subscriptions\.remove\(/gm, '((java.util.Map<String,Object>)client.subscriptions).remove(');
        content = content.replace(/client\.subscriptions\.keySet\(/gm, '((java.util.Map<String,Object>)client.subscriptions).keySet(');

        // Object.keys / Object.values / Array.isArray are now emitted as
        // `Helpers.objectKeys(x)` / `objectValues(x)` / `isArray(x)` directly
        // by ast-transpiler (PR #48). The earlier regex post-process here
        // routed the older `new ArrayList<>(((Map<String,Object>)x).keySet())`
        // shape; it's been removed since #48 covers every argument shape
        // (this.x, Helpers.GetValue(...), nested casts) that the regex missed.

        // ── Pattern 6: Method reference for ping ──
        content = content.replace(new RegExp(`${cap}\\.this::ping`, 'gm'),
            `(java.util.function.Function<Client, Object>) ${cap}.this::ping`);

        // ── Pattern 1+2: client.future() / client.reusableFuture() return Future ──
        // Object future = client.future(x) → io.github.ccxt.ws.Future future = client.future((String)x)
        // SS-04: the (String) hash cast is redundant when the local is already declared String
        // in this file (WsClient.future/reusableFuture take String)
        content = content.replace(/Object\s+future\s*=\s*client\.(future|reusableFuture)\((\w+)\)/gm,
            (_match: string, method: string, hash: string, offset: number) =>
                `io.github.ccxt.ws.Future future = client.${method}(${this.provablyStringLocal (content, hash, offset) ? hash : `(String)${hash}`})`);
        // Object future = Helpers.GetValue(client.futures, x) → cast to Future
        content = content.replace(/Object\s+future\s*=\s*Helpers\.GetValue\(client\.futures,\s*(\w+)\)/gm,
            'io.github.ccxt.ws.Future future = (io.github.ccxt.ws.Future)Helpers.GetValue(client.futures, $1)');

        // ── Pattern 3: (String) cast on the hash argument of client.future() / reusableFuture() ──
        // client.future(hash) where the hash local is Object-typed. any
        // identifier is accepted, not just `messageHash`, so a renamed hash
        // local cannot silently fall out of the cast — unless the same method's nearest
        // preceding declaration proves the identifier String (SS-04)
        content = content.replace(/client\.(future|reusableFuture)\((\w+)\)/gm,
            (_match: string, method: string, hash: string, offset: number) =>
                `client.${method}(${this.provablyStringLocal (content, hash, offset) ? hash : `(String)${hash}`})`);
        // idempotence guard: never cast an already-cast argument
        content = content.replace(/client\.(future|reusableFuture)\(\(String\)\(String\)/gm, 'client.$1((String)');

        // ── Pattern 2: future.join() → future.getFuture().join() ──
        // Only for local `future` variables (not this.xxx)
        // When future is Object-typed (from safeValue etc), cast to Future first
        content = content.replace(/(?<!\w)(future)\.getFuture\(\)\.join\(\)/gm,
            '((io.github.ccxt.ws.Future)future).getFuture().join()');
        content = content.replace(/(?<!\w)(future)\.join\(\)/gm,
            '((io.github.ccxt.ws.Future)future).getFuture().join()');
        // (future).join() pattern
        content = content.replace(/\(future\)\.join\(\)/gm,
            '((io.github.ccxt.ws.Future)future).getFuture().join()');
        // client.future(...).join() → client.future(...).getFuture().join()
        content = content.replace(/client\.(future|reusableFuture)\(([^)]+)\)\.join\(\)/gm,
            'client.$1($2).getFuture().join()');
        // (client.future(...)).join() → client.future(...).getFuture().join()
        // Parenthesized form — use balanced parens since args may contain nested parens
        content = this.replaceParenthesizedClientFutureJoin(content);
        // But if future is already typed as io.github.ccxt.ws.Future, don't double-cast
        content = content.replace(/\(\(io\.github\.ccxt\.ws\.Future\)(\(io\.github\.ccxt\.ws\.Future\))/gm, '($1');

        // ── Pattern 10: (String) cast on Helpers.add() for exception constructors and client.future() ──
        // SS-04: only when the add-chain's FIRST operand is not already String — javac picks a
        // String-returning `add(String, *)` overload exactly when it is, and the printer already
        // emits the cast on every shape it cannot prove
        content = content.replace(/(throw new \w+\()Helpers\.add\(/gm,
            (match: string, prefix: string, offset: number) =>
                this.addChainStartsWithString (content, offset + match.length - 'Helpers.add('.length)
                    ? match : `${prefix}(String)Helpers.add(`);
        content = content.replace(/(client\.(?:future|reusableFuture)\()Helpers\.add\(/gm,
            (match: string, prefix: string, offset: number) =>
                this.addChainStartsWithString (content, offset + match.length - 'Helpers.add('.length)
                    ? match : `${prefix}(String)Helpers.add(`);

        // ── Typed-wrapper overload collision: fetchBalance / fetchPositions ──
        // The typed-wrapper exchange classes (e.g. exchanges/Hashkey.java) define
        //     Balances fetchBalance(Map<String, Object> params)
        //     List<Position> fetchPositions(List<String> symbols, Map<String, Object> params)
        // which Java's overload resolution prefers over the inherited async
        //     CompletableFuture<Object> fetchBalance(Object... optionalArgs)
        // when the WS code calls `this.fetchBalance(new HashMap<>(){{...}})`. The
        // typed return is not a CompletableFuture, so the trailing `.join()`
        // fails to compile. Cast the HashMap to Object so the varargs overload
        // wins and the call returns a CompletableFuture<Object>.
        content = content.replace(/this\.fetchBalance\(new java\.util\.HashMap/gm,
            'this.fetchBalance((Object) new java.util.HashMap');
        content = content.replace(/this\.fetchPositions\((null|[a-zA-Z_]\w*),\s*new java\.util\.HashMap/gm,
            'this.fetchPositions($1, (Object) new java.util.HashMap');

        // ── Pattern 5: ArrayCache .hashmap access ──
        // Only match local variables, not this.xxx
        content = content.replace(/(?<!this\.)(?<![\w.])([a-z]\w+)\.hashmap\b/gm, '((io.github.ccxt.ws.ArrayCache)$1).hashmap');
        // this.xxx.hashmap → ((ArrayCache)this.xxx).hashmap
        content = content.replace(/(this\.\w+)\.hashmap\b/gm, '((io.github.ccxt.ws.ArrayCache)$1).hashmap');
        // Prevent double-wrapping
        content = content.replace(/\(\(io\.github\.ccxt\.ws\.ArrayCache\)\(\(io\.github\.ccxt\.ws\.ArrayCache\)/gm,
            '((io.github.ccxt.ws.ArrayCache)');

        // ── Pattern: future.resolve(...) on Object-typed future variable ──
        // future.resolve(x) where future is Object → cast
        content = content.replace(/(?<!\w)future\.resolve\(([^)]+)\)/gm,
            '((io.github.ccxt.ws.Future)future).resolve($1)');
        // future.reject(x) on Object
        content = content.replace(/(?<!\w)future\.reject\(([^)]+)\)/gm,
            '((io.github.ccxt.ws.Future)future).reject($1)');
        // promise.resolve(x) where promise is Object → cast
        content = content.replace(/(?<!\w)promise\.resolve\(([^)]*)\)/gm,
            '((io.github.ccxt.ws.Future)promise).resolve($1)');

        // ── Dynamic method dispatch for Object-typed variables ──
        // Dynamic method calls on Object-typed variables — use balanced paren matching
        const dynamicMethods = ['append', 'reset', 'storeArray', 'store', 'getLimit'];
        for (const method of dynamicMethods) {
            content = this.replaceDynamicMethodCall(content, method);
        }
        content = content.replace(/(?<!this\.)(?<!Helpers\.)(?<![\w.])([a-z]\w+)\.limit\(\)/gm,
            'Helpers.callDynamically($1, "limit", new Object[]{})');


        // ── this.xxx.append/store/storeArray/reset calls on Object-typed fields ──
        content = content.replace(/this\.(myTrades|positions|orders|trades|ohlcvs|tickers|orderbooks)\.(append|store|storeArray|reset)\(/gm,
            'Helpers.callDynamically(this.$1, "$2", new Object[]{')
        // Fix: the above leaves dangling ) from the original call, so fix the pattern
        // Actually let's use balanced parens for this too
        content = this.replaceThisFieldDynamicCall(content);

        // ── Property access on Object-typed variables ──
        content = content.replace(/(?<![.\w])([a-z]\w+)\.cache\b(?!\()/gm,
            '((java.util.List<Object>)Helpers.GetValue($1, "cache"))');
        content = content.replace(/(?<![.\w])([a-z]\w+)\.nonce\b(?!\()/gm, 'Helpers.GetValue($1, "nonce")');

        // ── Method references in subscription maps → string name ──
        // Dynamically detect every method defined in this class, plus a fixed
        // whitelist of base-class methods used as callback refs (defined on
        // Exchange/base, so file-local detection can't see them). Rewrite
        // `this.<method>` / `<ClassName>.this.<method>` used as a value (not a
        // call, assignment target, or member-access base) to the string literal
        // `"<method>"`. Dispatch uses Helpers.callDynamically at call-site.
        const baseClassCallbacks = [
            'ping', 'negotiate', 'negotiateHelper', 'keepAliveListenKey',
            'fetchOrderBookSnapshot', 'loadOrderBook', 'loadBalanceSnapshot',
            'loadPositionsSnapshot',
        ];
        const methodNames = this.collectMethodNamesInClass(content);
        for (const b of baseClassCallbacks) methodNames.add(b);
        if (methodNames.size > 0) {
            const namesPattern = Array.from(methodNames).join('|');
            // ClassName.this.method (as value)
            content = content.replace(
                new RegExp(`${cap}\\.this\\.(${namesPattern})\\s*(?=[,;)\\s])`, 'gm'),
                '"$1"'
            );
            // this.method (as value, not preceded by '=' which would be wrong context)
            content = content.replace(
                new RegExp(`(?<!=\\s)this\\.(${namesPattern})\\s*(?=[,;)\\s])`, 'gm'),
                '"$1"'
            );
            // var = this.method;  → var = "method";
            content = content.replace(
                new RegExp(`=\\s*this\\.(${namesPattern})\\s*;`, 'gm'),
                '= "$1";'
            );
        }

        // ── .call(this, args) → reflection dispatch — use balanced parens ──
        content = this.replaceCallPattern(content);

        // ── this.spawn(this.method, args) → lambda (as statement ending with ;) ──
        content = content.replace(/this\.spawn\(this\.(\w+),\s*([^)]*(?:\([^)]*\)[^)]*)*)\);/gm, (match: string, method: string, args: string) => {
            return `this.spawn(() -> { try { this.${method}(${args}); } catch(Exception _e) { throw new RuntimeException(_e); } });`;
        });
        // this.spawn("methodName", arg1, arg2, ...) → this.spawn(() -> { ... }) (as statement)
        content = content.replace(/this\.spawn\("(\w+)",\s*([^)]*(?:\([^)]*\)[^)]*)*)\);/gm, (match: string, method: string, args: string) => {
            return `this.spawn(() -> { try { this.${method}(${args}); } catch(Exception _e) { throw new RuntimeException(_e); } });`;
        });
        // this.spawn(this.method, args) used as expression (value) — NOT ending with ;
        content = content.replace(/this\.spawn\(this\.(\w+),\s*([^)]*(?:\([^)]*\)[^)]*)*)\)(?=\))/gm,
            (match: string, method: string, args: string) => {
                return `this.${method}(${args})`;
            });
        // this.spawn("methodName", args) as expression — the method-ref-as-string
        // pass above has already converted this.methodRef → "methodRef" by the time
        // we get here. Rewrite to spawnWithResult which returns a Future capturing
        // the async call's outcome.
        content = content.replace(/this\.spawn\("(\w+)",\s*([^)]*(?:\([^)]*\)[^)]*)*)\)(?=\))/gm,
            (match: string, methodName: string, args: string) => {
                return `this.spawnWithResult("${methodName}", ${args})`;
            });

        // ── watch/watchMultiple missing 5th arg ──
        for (const method of ['watch', 'watchMultiple']) {
            const pattern = new RegExp(`this\\.${method}\\(`, 'g');
            let result2 = '';
            let lastIdx2 = 0;
            let m2;
            while ((m2 = pattern.exec(content)) !== null) {
                const startIdx = m2.index + m2[0].length;
                let depth2 = 1;
                let j2 = startIdx;
                while (j2 < content.length && depth2 > 0) {
                    if (content[j2] === '(') depth2++;
                    if (content[j2] === ')') depth2--;
                    j2++;
                }
                const args2 = content.substring(startIdx, j2 - 1);
                let topLevelCommas = 0;
                let d = 0;
                for (const ch of args2) {
                    if (ch === '(') d++;
                    if (ch === ')') d--;
                    if (ch === ',' && d === 0) topLevelCommas++;
                }
                const argCount = topLevelCommas + 1;
                result2 += content.substring(lastIdx2, m2.index);
                if (argCount === 4) {
                    result2 += `this.${method}(${args2}, null)`;
                } else if (argCount === 3) {
                    result2 += `this.${method}(${args2}, null, null)`;
                } else if (argCount === 2) {
                    result2 += `this.${method}(${args2}, null, null, null)`;
                } else {
                    result2 += `this.${method}(${args2})`;
                }
                lastIdx2 = j2;
            }
            result2 += content.substring(lastIdx2);
            content = result2;
        }

        // ── Client type handling ──
        content = content.replace(/WsClient\b/gm, 'Client');
        content = content.replace(/\(Object client\)/gm, '(Client client)');
        content = content.replace(/\(Object client,/gm, '(Client client,');
        content = content.replace(/,\s*Object client,/gm, ', Client client,');
        content = content.replace(/,\s*Object client\)/gm, ', Client client)');
        content = content.replace(/Object client =/gm, 'Client client =');
        content = content.replace(/Object client = this\.client\(/gm, 'Client client = this.client(');
        content = content.replace(/Client\s+client\s*=\s*Helpers\.GetValue\((\w+),\s*(\w+)\)/gm,
            'Client client = (Client)Helpers.GetValue($1, $2)');
        content = content.replace(/Client\s+client\s*=\s*this\.(safeValue|safeDict)\(/gm,
            'Client client = (Client)this.$1(');

        // ── Pattern 9: int/long from Object ──
        content = content.replace(/int (\w+) = (?![\d(])/gm, 'Object $1 = ');
        content = content.replace(/new ArrayCache\(this\.(safeInteger\([^)]+\))\)/gm,
            'new ArrayCache(((Number)this.$1).intValue())');
        content = content.replace(/new ArrayCache\(this\.(safeInteger\([^)]+\))\)/gm,
            'new ArrayCache(((Number)this.$1).intValue())');
        content = content.replace(/client\.lastPong\s*=\s*([^;]+);/gm, (match: string, rhs: string) => {
            if (rhs.startsWith('((Number)') || /^\d+L?$/.test(rhs.trim())) return match;
            return `client.lastPong = ((Number)${rhs}).longValue();`;
        });
        content = content.replace(/client\.keepAlive\s*=\s*([^;]+);/gm, (match: string, rhs: string) => {
            if (rhs.startsWith('((Number)') || /^\d+L?$/.test(rhs.trim())) return match;
            return `client.keepAlive = ((Number)${rhs}).longValue();`;
        });

        // ── this.delay → spawn with sleep ──
        // Existing forms: `this.delay(ms, this.methodName, args...)` where callback
        // is a method reference. Handled first.
        content = content.replace(/this\.delay\(([^,]+),\s*this\.(\w+),\s*([^)]+)\)/gm,
            'this.spawn(() -> { try { Thread.sleep(((Number)$1).longValue()); this.$2($3); } catch(Exception _e) {} })');
        content = content.replace(/this\.delay\(([^,]+),\s*this\.(\w+)\)/gm,
            'this.spawn(() -> { try { Thread.sleep(((Number)$1).longValue()); this.$2(); } catch(Exception _e) {} })');
        // Generalized form: `this.delay(ms, "methodName", ...args)` where the callback
        // is already a string literal (the method-ref-as-string rewrite above converts
        // `this.method` → `"method"`). Dispatch dynamically via Helpers.callDynamically.
        content = this.rewriteDelayWithStringCallback(content);

        // ── String type fixes: revert pass REMOVED (SS-07 / SS-15) ──
        // The pass rewrote every `String x = this.<m>(...)` / `String x = Helpers.<...>(...)`
        // declaration in pro/prediction files back to `Object`. The local-typing layers emit a
        // String declaration only when every reaching value is provably String-or-null, so the
        // pass only de-typed the WS tree; pro/prediction now match the REST tier.

        // ── CompletableFuture<Void> → <Object> ──
        content = content.replace(/CompletableFuture<Void>/gm, 'CompletableFuture<Object>');

        // ── this.lockId()/this.unlockId() → synchronized with scoping fix ──
        content = this.fixSynchronizedScoping(content);

        // ── super.describeData() → call WS parent method ──
        content = content.replace(/super\.describeData\(\)/gm, (match: string) => {
            return `new io.github.ccxt.exchanges.pro.Binance().describeData()`;
        });

        // ── Fix effectively final: when url is captured in anonymous inner class ──
        content = content.replace(/(this\.authenticate\(new java\.util\.HashMap[^}]*\{\{[^}]*put\(\s*"url",\s*)url(\s*\))/gm,
            (match: string, before: string, after: string) => {
                return match;
            });
        {
            const lines2 = content.split('\n');
            for (let j = 0; j < lines2.length; j++) {
                if (lines2[j].includes('this.authenticate')) {
                    for (let k = j; k < Math.min(j + 5, lines2.length); k++) {
                        if (lines2[k].includes('put( "url", url )')) {
                            const indent2 = lines2[j].match(/^\s*/)?.[0] || '';
                            lines2.splice(j, 0, `${indent2}final Object finalUrl = url;`);
                            lines2[k + 1] = lines2[k + 1].replace(/put\(\s*"url",\s*url\s*\)/, 'put( "url", finalUrl )');
                            j = k + 2;
                            break;
                        }
                    }
                }
            }
            content = lines2.join('\n');
        }

        // ── Fix extra args in method calls when definition has fewer params ──
        {
            const defMatch = content.match(/loadPositionsSnapshot\(Client\s+\w+,\s*Object\s+\w+,\s*Object\s+\w+\)\s*$/m);
            const callMatch = content.match(/this\.loadPositionsSnapshot\(\w+,\s*\w+,\s*\w+,\s*\w+\)/);
            if (defMatch && callMatch) {
                content = content.replace(
                    /loadPositionsSnapshot\(Client\s+(\w+),\s*Object\s+(\w+),\s*Object\s+(\w+)\)\s*$/m,
                    'loadPositionsSnapshot(Client $1, Object $2, Object $3, Object... _extraArgs)'
                );
            }
        }

        // ── Bids/Asks class references ──
        content = content.replace(/new Bids\(/gm, 'new io.github.ccxt.ws.OrderBookSide.Bids(');
        content = content.replace(/new Asks\(/gm, 'new io.github.ccxt.ws.OrderBookSide.Asks(');

        // ── Exchange class name capitalization ──
        content = content.replace(/new io\.github\.ccxt\.exchanges\.([a-z])(\w+)\(\)/gm,
            (m: string, first: string, rest: string) => `new io.github.ccxt.exchanges.${first.toUpperCase()}${rest}()`);

        // ── Assignment to map.get() → Helpers.addElementToObject ──
        content = content.replace(/\(\(java\.util\.HashMap<String, Object>\)(\w+)\)\.get\("(\w+)"\)\s*=\s*([^;]+);/gm,
            'Helpers.addElementToObject($1, "$2", $3);');
        content = content.replace(/\(\(java\.util\.List<Object>\)Helpers\.GetValue\((\w+),\s*"(\w+)"\)\)\s*=\s*([^;]+);/gm,
            'Helpers.addElementToObject($1, "$2", $3);');
        content = content.replace(/\(\(java\.util\.List<Object>\)\(\(java\.util\.List<Object>\)Helpers\.GetValue\((\w+),\s*"(\w+)"\)\)\)\s*=\s*([^;]+);/gm,
            'Helpers.addElementToObject($1, "$2", $3);');

        // ── (List<String>) cast fix for ArrayList<Object> → List<String> ──
        content = content.replace(/\(java\.util\.List<String>\)new java\.util\.ArrayList<Object>/gm,
            '(java.util.List<String>)(java.util.List)new java.util.ArrayList<Object>');

        // ── Fix effectively final for anonymous inner class captures ──
        // (skipped for prediction REST+WS files: the ast-transpiler already handles
        // effectively-final there, and this pass mis-scopes vars across the REST parse* methods)
        if (!skipEffectivelyFinal) {
            content = this.fixEffectivelyFinal(content);
            // ── Fix effectively final for lambda captures in spawn/delay ──
            content = this.fixEffectivelyFinalLambda(content);
        }

        // ── Remove duplicate final variable declarations in same method ──
        if (!skipEffectivelyFinal) {
            content = this.removeTrueDuplicateFinals(content);
        }

        // ── Void supplyAsync return null insertion ──
        content = this.insertReturnNullInSupplyAsync(content);

        // Runs AFTER insertReturnNullInSupplyAsync to fix `return null;` leakage
        // into void event-handler methods. Uses comment/string-aware brace tracking
        // to avoid false state from brace chars in `//` comment blocks.
        content = this.fixVoidReturnNull(content);

        return content;
    }

    fixSynchronizedScoping(content: string): string {
        content = content.replace(/this\.lockId\(\);/gm, 'synchronized (this) {');
        content = content.replace(/this\.unlockId\(\);/gm, '}');

        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].trim() === 'synchronized (this) {') {
                const syncStart = i;
                let syncEnd = -1;
                let braceCount = 0;
                for (let j = i; j < lines.length; j++) {
                    for (const ch of lines[j]) {
                        if (ch === '{') braceCount++;
                        if (ch === '}') braceCount--;
                    }
                    if (braceCount === 0) {
                        syncEnd = j;
                        break;
                    }
                }
                if (syncEnd === -1) continue;

                const declaredVars: {name: string, lineIdx: number}[] = [];
                for (let j = syncStart + 1; j < syncEnd; j++) {
                    const declMatch = lines[j].match(/^(\s*)Object\s+(\w+)\s*=\s*/);
                    if (declMatch) {
                        declaredVars.push({name: declMatch[2], lineIdx: j});
                    }
                }

                for (const v of declaredVars) {
                    let usedAfter = false;
                    for (let j = syncEnd + 1; j < Math.min(syncEnd + 5, lines.length); j++) {
                        if (lines[j].includes(v.name)) {
                            usedAfter = true;
                            break;
                        }
                    }
                    if (usedAfter) {
                        const indent = lines[v.lineIdx].match(/^(\s*)/)?.[1] || '';
                        lines[v.lineIdx] = lines[v.lineIdx].replace(`Object ${v.name} =`, `${v.name} =`);
                        lines.splice(syncStart, 0, `${indent}Object ${v.name};`);
                        i++;
                    }
                }
            }
        }
        return lines.join('\n');
    }

    replaceThisFieldDynamicCall(content: string): string {
        content = content.replace(/Helpers\.callDynamically\(this\.(myTrades|positions|orders|trades|ohlcvs|tickers|orderbooks), "(append|store|storeArray|reset)", new Object\[\]\{/gm,
            'this.$1.$2(');
        const fields = ['myTrades', 'positions', 'orders', 'trades', 'ohlcvs', 'tickers', 'orderbooks'];
        const methods2 = ['append', 'store', 'storeArray', 'reset'];
        for (const field of fields) {
            for (const method of methods2) {
                const pattern = new RegExp(`this\\.${field}\\.${method}\\(`, 'g');
                let result = '';
                let lastIdx = 0;
                let match;
                while ((match = pattern.exec(content)) !== null) {
                    const startIdx = match.index + match[0].length;
                    let depth = 1;
                    let j = startIdx;
                    while (j < content.length && depth > 0) {
                        if (content[j] === '(') depth++;
                        if (content[j] === ')') depth--;
                        j++;
                    }
                    const args = content.substring(startIdx, j - 1);
                    result += content.substring(lastIdx, match.index);
                    result += `Helpers.callDynamically(this.${field}, "${method}", new Object[]{${args}})`;
                    lastIdx = j;
                }
                result += content.substring(lastIdx);
                content = result;
            }
        }
        return content;
    }

    insertReturnNullInSupplyAsync(content: string): string {
        const lines = content.split('\n');

        let inSupplyAsync = 0;
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes('CompletableFuture.supplyAsync')) inSupplyAsync++;
            if (lines[i].includes('VIRTUAL_EXECUTOR)')) inSupplyAsync = Math.max(0, inSupplyAsync - 1);
            if (inSupplyAsync > 0 && lines[i].trim() === 'return;') {
                lines[i] = lines[i].replace('return;', 'return null;');
            }
        }

        for (let i = 0; i < lines.length; i++) {
            if (!lines[i].trim().startsWith('}, io.github.ccxt.Exchange.VIRTUAL_EXECUTOR)')) continue;

            let lastStmtIdx = i - 1;
            while (lastStmtIdx >= 0 && lines[lastStmtIdx].trim() === '') lastStmtIdx--;
            if (lastStmtIdx < 0) continue;

            const stmt = lines[lastStmtIdx].trim();

            const isReturn = (s: string) => s.startsWith('return ') || s.startsWith('return(') || s === 'return null;';
            let hasReturn = isReturn(stmt);

            if (!hasReturn) {
                for (let k = lastStmtIdx - 1; k >= Math.max(0, lastStmtIdx - 30); k--) {
                    const kLine = lines[k].trim();
                    if (kLine.includes('-> {')) break;
                    if (kLine.match(/^(?:public|private|protected)\s+/)) break;
                    if (isReturn(kLine)) {
                        hasReturn = true;
                        break;
                    }
                    if (kLine.endsWith(';') && !kLine.includes('put(') && !kLine.includes('add(') && !kLine.startsWith('//')) {
                        break;
                    }
                }
            }

            if (stmt === '}') {
                let bd = 0;
                let openingLine = lastStmtIdx;
                for (let k = lastStmtIdx; k >= 0; k--) {
                    for (let ci = lines[k].length - 1; ci >= 0; ci--) {
                        if (lines[k][ci] === '}') bd++;
                        if (lines[k][ci] === '{') bd--;
                        if (bd === 0) {
                            openingLine = k;
                            break;
                        }
                    }
                    if (bd === 0) break;
                }
                let openingStmt = lines[openingLine].trim();
                if (openingStmt === '{') {
                    let prevLine = openingLine - 1;
                    while (prevLine >= 0 && lines[prevLine].trim() === '') prevLine--;
                    if (prevLine >= 0) openingStmt = lines[prevLine].trim();
                }
                if (openingStmt.startsWith('} else') || openingStmt.startsWith('else')) {
                    let innerLast = lastStmtIdx - 1;
                    while (innerLast >= 0 && lines[innerLast].trim() === '') innerLast--;
                    if (innerLast >= 0 && isReturn(lines[innerLast].trim())) {
                        hasReturn = true;
                    }
                } else if (openingStmt.includes('catch')) {
                    let innerLast = lastStmtIdx - 1;
                    while (innerLast >= 0 && lines[innerLast].trim() === '') innerLast--;
                    if (innerLast >= 0 && isReturn(lines[innerLast].trim())) {
                        hasReturn = true;
                    }
                }
                if (openingStmt.startsWith('for ') || openingStmt.startsWith('for(') ||
                    openingStmt.startsWith('while ') || openingStmt.startsWith('while(')) {
                    const indent3 = lines[i].match(/^\s*/)?.[0] || '';
                    lines.splice(i, 0, indent3 + '    return null;');
                    i++;
                    hasReturn = true;
                }
            }

            if (!hasReturn) {
                const indent = lines[i].match(/^\s*/)?.[0] || '';
                lines.splice(i, 0, indent + '    return null;');
                i++;
            }
        }

        return lines.join('\n');
    }

    fixEffectivelyFinal(content: string): string {
        const lines = content.split('\n');

        for (let i = 0; i < lines.length; i++) {
            if (!lines[i].includes('new java.util.HashMap<String, Object>() {{')) continue;

            let depth = 0;
            let endLine = -1;
            for (let j = i; j < lines.length; j++) {
                for (const ch of lines[j]) {
                    if (ch === '{') depth++;
                    if (ch === '}') depth--;
                }
                if (depth === 0) {
                    endLine = j;
                    break;
                }
            }
            if (endLine < 0) continue;

            const capturedVars = new Set<string>();
            for (let j = i; j <= endLine; j++) {
                const putMatch = lines[j].match(/put\(\s*"[^"]+",\s*(?:new\s+)?([a-z]\w+)\s*\)/);
                if (putMatch) {
                    const varName = putMatch[1];
                    if (['null', 'true', 'false', 'this'].includes(varName)) continue;
                    if (varName.startsWith('final')) continue;
                    capturedVars.add(varName);
                }
                const asListMatches = lines[j].matchAll(/java\.util\.Arrays\.asList\(([^)]+)\)/g);
                for (const m of asListMatches) {
                    const argsStr = m[1];
                    const args = argsStr.split(',').map((a: string) => a.trim());
                    for (const arg of args) {
                        const varMatch = arg.match(/^([a-z]\w+)$/);
                        if (varMatch) {
                            const varName = varMatch[1];
                            if (!['null', 'true', 'false', 'this'].includes(varName) && !varName.startsWith('final')) {
                                capturedVars.add(varName);
                            }
                        }
                    }
                }
                const extendMatch = lines[j].match(/\.extend\([^,]+,\s*([a-z]\w+)\)/);
                if (extendMatch) {
                    const varName = extendMatch[1];
                    if (!['null', 'true', 'false', 'this'].includes(varName) && !varName.startsWith('final')) {
                        capturedVars.add(varName);
                    }
                }
                const isEqualMatch = lines[j].match(/Helpers\.isEqual\(([a-z]\w+),\s*"/);
                if (isEqualMatch) {
                    const varName = isEqualMatch[1];
                    if (!['null', 'true', 'false', 'this'].includes(varName) && !varName.startsWith('final')) {
                        capturedVars.add(varName);
                    }
                }
                const innerAsListMatches = lines[j].matchAll(/asList\(([^()]+)\)/g);
                for (const m2 of innerAsListMatches) {
                    const innerArgs = m2[1].split(',').map((a: string) => a.trim());
                    for (const arg of innerArgs) {
                        const varMatch = arg.match(/^([a-z]\w+)$/);
                        if (varMatch) {
                            const vn = varMatch[1];
                            if (!['null', 'true', 'false', 'this'].includes(vn) && !vn.startsWith('final')) {
                                capturedVars.add(vn);
                            }
                        }
                    }
                }
            }

            for (const varName of capturedVars) {
                let reassigned = false;
                let methodStart = i;
                for (let j = i - 1; j >= 0; j--) {
                    if (lines[j].match(/^\s*(?:public|private|protected)\s+/)) {
                        methodStart = j;
                        break;
                    }
                }
                for (let j = methodStart; j < lines.length; j++) {
                    if (j > methodStart && lines[j].match(/^\s*(?:public|private|protected)\s+/)) break;
                    const reassignRegex = new RegExp(`^\\s+${varName}\\s*=\\s`);
                    if (reassignRegex.test(lines[j])) {
                        reassigned = true;
                        break;
                    }
                }

                if (reassigned) {
                    const baseFinalName = `final${varName.charAt(0).toUpperCase()}${varName.slice(1)}`;
                    let nearbyExists = false;
                    for (let j = Math.max(methodStart, i - 5); j < i; j++) {
                        if (lines[j].includes(`final Object ${baseFinalName}`) || lines[j].includes(`final Object ${baseFinalName}2`)) {
                            nearbyExists = true;
                            break;
                        }
                    }
                    let suffix = '';
                    for (let j = methodStart; j < i; j++) {
                        if (lines[j].includes(`final Object ${baseFinalName}`)) suffix = '2';
                        if (lines[j].includes(`final Object ${baseFinalName}2`)) suffix = '3';
                    }
                    const finalVarName = baseFinalName + suffix;
                    if (nearbyExists) {
                        const existingFinal = baseFinalName;
                        for (let j2 = i; j2 <= endLine; j2++) {
                            if (lines[j2].includes(`final Object`)) continue;
                            lines[j2] = lines[j2].replace(
                                new RegExp(`\\b${varName}\\b`, 'g'),
                                existingFinal
                            );
                        }
                    } else {
                        const indent = lines[i].match(/^\s*/)?.[0] || '';
                        lines.splice(i, 0, `${indent}final Object ${finalVarName} = ${varName};`);
                        i++; endLine++;
                        for (let j = i; j <= endLine; j++) {
                            if (lines[j].includes(`final Object ${finalVarName}`)) continue;
                            lines[j] = lines[j].replace(
                                new RegExp(`\\b${varName}\\b`, 'g'),
                                finalVarName
                            );
                        }
                    }
                }
            }
        }

        return lines.join('\n');
    }

    fixEffectivelyFinalLambda(content: string): string {
        const lines = content.split('\n');

        for (let i = 0; i < lines.length; i++) {
            const spawnMatch = lines[i].match(/this\.spawn\(\(\)\s*->\s*\{.*this\.(\w+)\(([^)]+)\)/);
            if (!spawnMatch) continue;

            const args = spawnMatch[2].split(',').map((a: string) => a.trim());

            let methodStart = 0;
            for (let j = i - 1; j >= 0; j--) {
                if (lines[j].match(/^\s*(?:public|private|protected)\s+/)) {
                    methodStart = j;
                    break;
                }
            }

            for (const arg of args) {
                if (!arg.match(/^[a-z]\w+$/)) continue;
                let reassigned = false;
                for (let j = methodStart; j < i; j++) {
                    if (new RegExp(`^\\s+${arg}\\s*=\\s`).test(lines[j])) {
                        reassigned = true;
                        break;
                    }
                }
                if (reassigned) {
                    const finalName = `_final_${arg}`;
                    const indent = lines[i].match(/^\s*/)?.[0] || '';
                    lines.splice(i, 0, `${indent}final Object ${finalName} = ${arg};`);
                    i++;
                    lines[i] = lines[i].replace(
                        new RegExp(`this\\.(\\w+)\\(([^)]*\\b)${arg}\\b`),
                        (m: string, method: string, before: string) => `this.${method}(${before}${finalName}`
                    );
                }
            }
        }

        return lines.join('\n');
    }

    removeTrueDuplicateFinals(content: string): string {
        const lines = content.split('\n');
        let seen = new Set<string>();
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].match(/^\s*(?:public|private|protected)\s+.*\(.*\)\s*$/)) {
                seen = new Set<string>();
            }
            if (lines[i].match(/^\s*(?:public|private|protected)\s+.*\(.*\)\s*\{?\s*$/)) {
                seen = new Set<string>();
            }
            const finalMatch = lines[i].match(/^\s*final\s+Object\s+(final\w+)\s*=\s*\w+\s*;/);
            if (finalMatch) {
                const varName = finalMatch[1];
                if (seen.has(varName)) {
                    lines[i] = '';
                } else {
                    seen.add(varName);
                }
            }
        }
        return lines.join('\n');
    }

    replaceParenthesizedClientFutureJoin(content: string): string {
        const pattern = /\(client\.(future|reusableFuture)\(/g;
        let result = '';
        let lastIdx = 0;
        let match;
        while ((match = pattern.exec(content)) !== null) {
            const method = match[1];
            const argsStart = match.index + match[0].length;
            let depth = 1;
            let j = argsStart;
            while (j < content.length && depth > 0) {
                if (content[j] === '(') depth++;
                if (content[j] === ')') depth--;
                j++;
            }
            if (j < content.length && content[j] === ')' && content.substring(j + 1, j + 8) === '.join()') {
                const args = content.substring(argsStart, j - 1);
                result += content.substring(lastIdx, match.index);
                result += `client.${method}(${args}).getFuture().join()`;
                lastIdx = j + 8;
            }
        }
        result += content.substring(lastIdx);
        return result;
    }

    replaceCallPattern(content: string): string {
        const pattern = /(\w+)\.call\(this,\s*/g;
        let result = '';
        let lastIdx = 0;
        let match;
        while ((match = pattern.exec(content)) !== null) {
            const handler = match[1];
            const startIdx = match.index + match[0].length;
            let depth = 1;
            let i = startIdx;
            while (i < content.length && depth > 0) {
                if (content[i] === '(') depth++;
                if (content[i] === ')') depth--;
                i++;
            }
            const args = content.substring(startIdx, i - 1);
            result += content.substring(lastIdx, match.index);
            result += `Helpers.callDynamically(this, ${handler}, new Object[] {${args}})`;
            lastIdx = i;
        }
        result += content.substring(lastIdx);
        return result;
    }

    replaceDynamicMethodCall(content: string, methodName: string): string {
        const pattern = new RegExp(`(?<=[^\\w.])([a-z]\\w+)\\.${methodName}\\(`, 'g');
        let result = '';
        let lastIdx = 0;
        let match;
        while ((match = pattern.exec(content)) !== null) {
            const varName = match[1];
            const before = content.substring(Math.max(0, match.index - 20), match.index);
            if (/(?:this\.|Helpers\.|new\s|\w\.)$/.test(before)) continue;
            const skipVars = ['new', 'var', 'for', 'if', 'else', 'return', 'try', 'catch', 'throw',
                'list', 'channel', 'response', 'request', 'message',
                'data', 'params', 'options', 'config', 'entry', 'item', 'key', 'value',
                'client', 'exchange', 'string', 'array', 'map', 'set',
                'ticker', 'trade', 'order', 'balance', 'position', 'currency', 'market'];
            if (skipVars.includes(varName)) continue;

            const startIdx = match.index + match[0].length;
            let depth = 1;
            let i = startIdx;
            while (i < content.length && depth > 0) {
                if (content[i] === '(') depth++;
                if (content[i] === ')') depth--;
                i++;
            }
            const args = content.substring(startIdx, i - 1);
            result += content.substring(lastIdx, match.index);
            result += `Helpers.callDynamically(${varName}, "${methodName}", new Object[]{${args}})`;
            lastIdx = i;
        }
        result += content.substring(lastIdx);
        return result;
    }

    transpileDerivedExchangeFile(tsFolder: string, filename: string, options: any, csharpResult: any, force = false, ws = false, prediction = false) {

        const tsPath = tsFolder + filename

        const { csharpFolder: javaFolder } = options

        const javaName = filename.replace('.ts', '.java')

        const fileNameNoExt = filename.replace('.ts', '')

        const tsMtime = fs.statSync(tsPath).mtime.getTime()

        let javaSource = this.createJavaClass(fileNameNoExt, csharpResult, ws, prediction)
        javaSource = routeWhitelistedInternalCallsToVarargs(javaSource)
        javaSource = this.redirectToAsyncOnJoin(javaSource, prediction)
        javaSource = typeCoreReturns(javaSource, typedReturnTable(prediction ? 'prediction' : ws ? 'ws' : 'rest'))

        if (javaFolder) {
            const outputName = this.capitalize(fileNameNoExt) + '.java';
            overwriteFileAndFolder(javaFolder + outputName, javaSource)
        }
    }

    // ---------------------------------------------------------------------------------------------
    transpileWsOrderbookTestsToCSharp(outDir: string) {

        const jsFile = './ts/src/pro/test/base/test.orderBook.ts';
        const csharpFile = `${outDir}/Ws/test.orderBook.cs`;

        log.magenta('Transpiling from', (jsFile as any).yellow)

        const csharp = this.transpiler.transpileCSharpByPath(jsFile);
        let content = csharp.content;
        const splitParts = content.split('// --------------------------------------------------------------------------------------------------------------------');
        splitParts.shift();
        content = splitParts.join('\n// --------------------------------------------------------------------------------------------------------------------\n');
        content = this.regexAll(content, [
            [/typeof\((\w+)\)/g, '$1'], // tmp fix
            [/object\s*(\w+)\s=\sgetValue\((\w+),\s*"(bids|asks)".+/g, 'var $1 = $2.$3;'], // tmp fix
            [/object  = functions;/g, ''], // tmp fix
            [/\s*public\sobject\sequals(([^}]|\n)+)+}/gm, ''], // remove equals
            [/assert/g, 'Assert'],
        ]).trim()

        const contentLines = content.split('\n');
        const contentIdented = contentLines.map(line => '        ' + line).join('\n');

        const file = [
            'using ccxt.pro;',
            'namespace Tests;',
            '',
            this.createGeneratedHeader().join('\n'),
            'public partial class BaseTest',
            '{',
            contentIdented,
            '}',
        ].join('\n')

        log.magenta('→', (csharpFile as any).yellow)

        overwriteFileAndFolder(csharpFile, file);
    }

    // ---------------------------------------------------------------------------------------------
    transpileWsCacheTestsToCSharp(outDir: string) {

        const jsFile = './ts/src/pro/test/base/test.cache.ts';
        const csharpFile = `${outDir}/Ws/test.cache.cs`;

        log.magenta('Transpiling from', (jsFile as any).yellow)

        const csharp = this.transpiler.transpileCSharpByPath(jsFile);
        let content = csharp.content;
        const splitParts = content.split('// ----------------------------------------------------------------------------');
        splitParts.shift();
        content = splitParts.join('\n// ----------------------------------------------------------------------------\n');
        content = this.regexAll(content, [
            [/typeof\((\w+)\)/g, '$1'], // tmp fix
            [/typeof\(timestampCache\)/g, 'timestampCache'], // tmp fix
            [/object  = functions;/g, ''], // tmp fix
            [/\s*public\sobject\sequals(([^}]|\n)+)+}/gm, ''], // remove equals
            [/assert/g, 'Assert'],
        ]).trim()

        const contentLines = content.split('\n');
        const contentIdented = contentLines.map(line => '        ' + line).join('\n');

        const file = [
            'using ccxt.pro;',
            'namespace Tests;',
            '',
            this.createGeneratedHeader().join('\n'),
            'public partial class BaseTest',
            '{',
            contentIdented,
            '}',
        ].join('\n')

        log.magenta('→', (csharpFile as any).yellow)

        overwriteFileAndFolder(csharpFile, file);
    }

    // ---------------------------------------------------------------------------------------------

    transpileCryptoTestsToJava(outDir: string, force = true) {

        const jsFile = './ts/src/test/base/test.cryptography.ts';
        const csharpFile = `${outDir}/TestCryptography.java`;

        if (skipUpToDateStage ('java', 'crypto test', force, testStageInputs (), [ csharpFile ])) {
            return;
        }

        log.magenta('[java] Transpiling from', (jsFile as any).yellow)

        const java = this.transpiler.transpileJavaByPath(jsFile);
        let content = java.content;
        content = this.regexAll(content, [
            [/\s*public\sObject\sequals(([^}]|\n)+)+}/gm, ''], // remove equals
            [/, (sha1|sha384|sha512|sha256|md5|ed25519|keccak|p256|secp256k1)([,)])/gm, `, $1()$2`],
            [/, (sha1|sha384|sha512|sha256|md5|ed25519|keccak|p256|secp256k1)([,)])/gm, `, $1()$2`], // quick fix to replace twice
            [/assert/g, 'Assert'],
            // [/(^\s*Assert\(equals\(ecdsa\([^;]+;)/gm, '/*\n $1\nTODO: add ecdsa\n*/'] // temporarily disable ecdsa tests
        ]).trim()

        const contentLines = content.split('\n');
        const contentIdented = contentLines.map(line => '        ' + line).join('\n');


        const file = [
            'package tests.base;',
            'import tests.BaseTest;',
            'import io.github.ccxt.Helpers;',
            '',
            this.createGeneratedHeader().join('\n'),
            'public class TestCryptography extends BaseTest {',
            contentIdented,
            '}',
        ].join('\n')

        log.magenta('→', (csharpFile as any).yellow)

        overwriteFileAndFolder(csharpFile, file);
    }

    transpileExchangeTest(name: string, path: string): [string, string] {
        const java = this.transpiler.transpileJavaByPath(path);
        let content = java.content;

        const parsedName = name.replace('.ts', '');
        const parsedParts = parsedName.split('.');
        const finalName = parsedParts[0] + this.capitalize(parsedParts[1]);

        content = this.regexAll(content, [
            [/assert/g, 'Assert'],
            [/object exchange/g, 'Exchange exchange'],
            [/function test/g, finalName],
        ]).trim()
        // cast callDynamically to CompletableFuture when .join() is called on the result
        content = content.replace(/\(Helpers\.callDynamically\(([^)]+(?:\([^)]*\))*[^)]*)\)\)\.join\(\)/g, '((java.util.concurrent.CompletableFuture<Object>)Helpers.callDynamically($1)).join()');

        const contentLines = content.split('\n');
        const contentIdented = contentLines.map(line => '    ' + line).join('\n');

        const className = 'Test' + this.capitalize(parsedName.replace('test.', ''))
        const file = [
            'package tests.exchange;',
            'import io.github.ccxt.Helpers;',
            'import io.github.ccxt.Exchange;',
            '',
            this.createGeneratedHeader().join('\n'),
            `public class ${className} {`,
            contentIdented,
            '}',
        ].join('\n')
        return [className, file];
    }

    async transpileExchangeTestsToJava() {
        const inputDir = './ts/src/test/exchange/';
        const outDir = GENERATED_TESTS_FOLDER;
        const ignore = [
            // 'exportTests.ts',
            // 'test.fetchLedger.ts',
            'test.throttler.ts',
            // 'test.fetchOrderBooks.ts', // uses spread operator
        ]

        const inputFiles = fs.readdirSync('./ts/src/test/exchange');
        const files = inputFiles.filter(file => file.match(/\.ts$/)).filter(file => !ignore.includes(file));
        const transpiledFiles = files.map(file => this.transpileExchangeTest(file, inputDir + file));
        await Promise.all(transpiledFiles.map((file, idx) => writeFile(outDir + file[0] + '.java', file[1])))
    }

    transpileBaseTestsToJava(force = true) {
        const outDir = BASE_TESTS_FOLDER;
        this.transpileBaseTests(outDir, force);
        this.transpileCryptoTestsToJava(outDir, force);
        // this.transpileWsCacheTestsToCSharp(outDir);
        // this.transpileWsOrderbookTestsToCSharp(outDir);
    }

    transpileBaseTests(outDir: string, force = true) {

        const baseFolders = {
            ts: './ts/src/test/base/',
        };

        let baseFunctionTests = fs.readdirSync(baseFolders.ts).filter(filename => filename.endsWith('.ts')).map(filename => filename.replace('.ts', ''));

        // the AUTO_TRANSPILE_ENABLED filter is hoisted out of the write loop below so the
        // whole-stage gate can name the exact set of files this stage writes
        const eligible = baseFunctionTests.filter ((testName) => fs.readFileSync (baseFolders.ts + testName + '.ts').toString ().includes ('// AUTO_TRANSPILE_ENABLED'));

        if (skipUpToDateStage ('java', 'base tests', force, testStageInputs (), eligible.map ((testName) => `${outDir}/Test${this.capitalize (testName.replace ('test.', '').replace ('tests.', ''))}.java`))) {
            return;
        }

        for (const testName of eligible) {
            const tsFile = baseFolders.ts + testName + '.ts';

            const correctedTestName = 'Test' + this.capitalize(testName.replace('test.', '').replace('tests.', ''))
            const javaFile = `${outDir}/${correctedTestName}.java`;

            log.magenta('Transpiling from', (tsFile as any).yellow)

            const java = this.transpiler.transpileJavaByPath(tsFile);
            let content = java.content;
            content = this.regexAll(content, [
                [/async public/gm, 'public'],
                [/object  = functions;/g, ''], // tmp fix
                [/assert/g, 'Assert'],
                [/Object exchange(?=[,)])/g, 'Exchange exchange'],
                [/new ccxt\.Exchange/gm, 'new Exchange'],
                [/\s*public\sObject\sequals(([^}]|\n)+)+}/gm, ''], // remove equals
                [/testSharedMethods.AssertDeepEqual/gm, 'AssertDeepEqual'], // deepEqual added
            ]).trim()
        // cast callDynamically to CompletableFuture when .join() is called on the result
        content = content.replace(/\(Helpers\.callDynamically\(([^)]+(?:\([^)]*\))*[^)]*)\)\)\.join\(\)/g, '((java.util.concurrent.CompletableFuture<Object>)Helpers.callDynamically($1)).join()');
        // Strip parens around a method callee, e.g. `(this.handleSubTypeAndParams)(args)`.
        // ast-transpiler 0.0.86 emits this invalid form when destructuring the tuple return
        // of a method called with its optional trailing arg (handleSubTypeAndParams(..., 'linear')).
        // Java never needs parens around the callee. Anchored on `)(` right after the name so
        // it never touches the valid whole-call form `(this.watch(...)).join()`.
        content = content.replace(/\((this\.[A-Za-z0-9_]+)\)\(/g, '$1(');
            // Null-safe Array.isArray (see Helpers.isArrayJs comment).
            content = content.replace(/\(([^()]+(?:\([^()]*\))*) instanceof java\.util\.List\) \|\| \(\1\.getClass\(\)\.isArray\(\)\)/g, 'Helpers.isArrayJs($1)');

            if (correctedTestName === 'TestInit') {
                content = this.regexAll(content, [
                    [/(test(\w+))\(\)/gm, '(new Test$2()).$1()'],
                ])
            } else if (correctedTestName === 'TestSafeMethods') {
                // we don't support wS structs yet

                content = this.regexAll(content, [
                    [/\/\/ init array cache tests[\s\S]*/gm, '}'],
                ]);
            }

            const contentLines = content.split('\n');
            const contentIdented = contentLines.map(line => '        ' + line).join('\n');

            const usesExchange = java.content.indexOf('ccxt.Exchange') >= 0;
            const usesPrecise = java.content.indexOf('Precise.') >= 0;
            const exchangeImport = usesExchange ? 'import io.github.ccxt.Exchange;\n' : '';
            const preciseImport = usesPrecise ? 'import io.github.ccxt.base.Precise;\n' : '';
            const file = [
                'package tests.base;',
                'import tests.BaseTest;',
                'import io.github.ccxt.Helpers;',
                exchangeImport,
                preciseImport,
                this.createGeneratedHeader().join('\n'),
                `public class ${correctedTestName} extends BaseTest`,
                '{',
                contentIdented,
                '}',
            ].join('\n')

            log.magenta('→', (javaFile as any).yellow)

            overwriteFileAndFolder(javaFile, file);
        }
    }

    capitalize(s: string) {
        return s.charAt(0).toUpperCase() + s.slice(1);
    }

    /**
     * Test-side counterpart of redirectToAsyncOnJoin. `(exchange.<m>(args)).join()` in
     * transpiled tests binds a typed TypedSurface default whenever the args are
     * statically typed (String symbol, literals, zero-arg whitelisted names), which
     * returns the typed value and has no `.join()`. Casting cannot fix it: an
     * `(Object)` at an SS-05 String position leaves no applicable method. So every
     * call to a typed-surface name is late-bound through Helpers.callDynamically,
     * whose findMethod prefers the untyped varargs core over typed overloads.
     */
    lateBindTypedSurfaceCalls(content: string): string {
        const typedNames = new Set<string>();
        for (const iface of ['TypedSurface.java', 'PredictionTypedSurface.java']) {
            const path = EXCHANGE_WRAPPER_FOLDER + iface;
            if (!fs.existsSync(path)) {
                log.red(`[java] ${path} missing — run \`tsx build/generateJavaWrappers.ts\` first; typed-surface late-binding skipped`);
                continue;
            }
            const re = /^\s{4}default\s+[^=]+?\s+(\w+)\s*\(/gm;
            let m;
            const src = fs.readFileSync(path, 'utf-8');
            while ((m = re.exec(src)) !== null) typedNames.add(m[1]);
        }
        if (typedNames.size === 0) return content;
        const marker = /\(exchange\.(\w+)\(/g;
        let result = '';
        let lastIdx = 0;
        let match;
        while ((match = marker.exec(content)) !== null) {
            const name = match[1];
            if (!typedNames.has(name)) continue;
            const argsStart = match.index + match[0].length;
            let depth = 1;
            let j = argsStart;
            let inStr: string | null = null;
            while (j < content.length && depth > 0) {
                const ch = content[j];
                if (inStr !== null) {
                    if (ch === '\\') j++;
                    else if (ch === inStr) inStr = null;
                } else if (ch === '"' || ch === '\'') inStr = ch;
                else if (ch === '(') depth++;
                else if (ch === ')') depth--;
                j++;
            }
            if (content[j] !== ')' || content.substring(j + 1, j + 8) !== '.join()') continue;
            const args = content.substring(argsStart, j - 1).trim();
            const argsArray = args === '' ? 'new Object[]{}' : `new Object[]{${args}}`;
            result += content.substring(lastIdx, match.index);
            result += `((java.util.concurrent.CompletableFuture<Object>)Helpers.callDynamically(exchange, "${name}", ${argsArray})).join()`;
            lastIdx = j + 8;
            marker.lastIndex = lastIdx;
        }
        return result + content.substring(lastIdx);
    }

    transpileMainTest(files: any) {
        log.magenta('[java] Transpiling from', files.tsFile.yellow)
        let ts = fs.readFileSync(files.tsFile).toString();

        ts = this.regexAll(ts, [
            [/\'use strict\';?\s+/g, ''],
        ])

        const mainContent = ts;
        const java = this.transpiler.transpileJava(mainContent);
        // let contentIndentend = csharp.content.split('\n').map(line => line ? '    ' + line : line).join('\n');
        let contentIndentend = java.content;


        // ad-hoc fixes
        contentIndentend = this.regexAll(contentIndentend, [
            [/Object mockedExchange =/gm, 'var mockedExchange ='],
            // The shared static-test harness holds either a regular Exchange or a prediction
            // PredictionExchange (both extend BaseExchange, as siblings), so type the shared `exchange`
            // variable as the common base and drive the tested method by reflection. The legacy
            // request-builders that call a symbol-trading method (createOrder/fetchTicker) directly are
            // cast back to Exchange below — they run only against regular venues.
            [/public Object initOfflineExchange/g, 'public BaseExchange initOfflineExchange'],
            [/Object exchange(?=[,)])/g, 'BaseExchange exchange'],
            [/Object exchange =/g, 'BaseExchange exchange ='],
            // the main live runner (initExchange (exchangeId, ...)) also serves prediction venues,
            // so it must STAY BaseExchange-typed — only the base-tests literal init is a real Exchange
            [/BaseExchange exchange = (initExchange\("Exchange"[^;]*\))/g, 'Exchange exchange = ((Exchange)$1)'],
            [/BaseExchange exchange = this\.initOfflineExchange\(("[a-z]+")\)/g, 'Exchange exchange = ((Exchange)this.initOfflineExchange($1))'],
            [/testReturnResponseHeaders\(BaseExchange exchange\)/g, 'testReturnResponseHeaders(Exchange exchange)'],
            [/throw new Error/g, 'throw new Exception'],
            [/public class TestMainClass/g, 'public class TestMain extends BaseTest'],
            [/assert/gm, 'Assert'],
            [/TestMainClass\.this/gm, 'TestMain.this'],
            [/throw new Exception/g, 'throw new RuntimeException'],
            [/throw e/gm, 'throw new RuntimeException(e)'],
            // noImplicitAny bags: Object so safeValue assignments typecheck (Map is too narrow)
            [/public (?:Dict|java\.util\.Map<String, Object>) skippedMethods\b/g, 'public Object skippedMethods'],
            [/public (?:Dict|java\.util\.Map<String, Object>) checkedPublicTests\b/g, 'public Object checkedPublicTests'],

        ])
        // Null-safe Array.isArray (see Helpers.isArrayJs).
        contentIndentend = contentIndentend.replace(/\(([^()]+(?:\([^()]*\))*) instanceof java\.util\.List\) \|\| \(\1\.getClass\(\)\.isArray\(\)\)/g, 'Helpers.isArrayJs($1)');
        contentIndentend = this.lateBindTypedSurfaceCalls(contentIndentend);

        const file = [
            'package tests.exchange;',
            'import io.github.ccxt.Helpers;',
            'import io.github.ccxt.Exchange;',
            'import io.github.ccxt.BaseExchange;',
            'import tests.BaseTest;',
            'import io.github.ccxt.errors.*;',
            '',
            this.createGeneratedHeader().join('\n'),
            contentIndentend,
        ].join('\n')

        overwriteFileAndFolder(files.javaFile, file);
    }

    async transpileExchangeTests(force = true) {
        const baseFolders = {
            ts: './ts/src/test/Exchange/',
            tsBase: './ts/src/test/Exchange/base/',
            javaBase: EXCHANGE_BASE_FOLDER,
            java: EXCHANGE_GENERATED_FOLDER,
        };

        let baseTests = fs.readdirSync(baseFolders.tsBase).filter(filename => filename.endsWith('.ts')).map(filename => filename.replace('.ts', ''));
        const exchangeTests = fs.readdirSync(baseFolders.ts).filter(filename => filename.endsWith('.ts')).map(filename => filename.replace('.ts', ''));

        // ignore throttle test for now
        baseTests = baseTests.filter(filename => filename !== 'test.throttle');

        const tests = [] as any;
        baseTests.forEach(baseTest => {
            let correctedName = 'Test' + this.capitalize(baseTest.replace('test.', ''));
            correctedName = correctedName.replace('Ohlcv', 'OHLCV'); // special case
            tests.push({
                base: true,
                name: baseTest,
                tsFile: baseFolders.tsBase + baseTest + '.ts',
                javaFile: baseFolders.javaBase + correctedName + '.java',
            });
        });
        exchangeTests.forEach(test => {
            const correctedName = 'Test' + this.capitalize(test.replace('test.', ''));
            tests.push({
                base: false,
                name: test,
                tsFile: baseFolders.ts + test + '.ts',
                javaFile: baseFolders.java + correctedName + '.java',
            });
        });

        // whole-stage gate — TestMain.java is included because transpileMainTest below writes
        // it from ./ts/src/test/tests.ts, which is part of testStageInputs(). The tests[] list
        // is built above the gate only so the output paths are available here.
        if (skipUpToDateStage ('java', 'exchange tests', force, testStageInputs (), [ BASE_TESTS_FILE ].concat (tests.map ((t: any) => t.javaFile)))) {
            return;
        }

        this.transpileMainTest({
            'tsFile': './ts/src/test/tests.ts',
            'javaFile': BASE_TESTS_FILE,
        });

        await this.transpileAndSaveJavaExchangeTests(tests);
    }

    async transpileWsExchangeTests(force = true) {

        const baseFolders = {
            ts: './ts/src/pro/test/Exchange/',
            java: EXCHANGE_GENERATED_FOLDER + 'ws/',
        };

        const wsTests = fs.readdirSync(baseFolders.ts).filter(filename => filename.endsWith('.ts')).map(filename => filename.replace('.ts', ''));

        if (!fs.existsSync(baseFolders.java)) {
            fs.mkdirSync(baseFolders.java, { recursive: true });
        }

        const tests = [] as any;

        wsTests.forEach(test => {
            const correctedName = 'Test' + this.capitalize(test.replace('test.', ''));
            tests.push({
                base: false,
                name: test,
                tsFile: baseFolders.ts + test + '.ts',
                javaFile: baseFolders.java + correctedName + '.java',
            });
        });

        if (skipUpToDateStage ('java', 'ws exchange tests', force, testStageInputs (), tests.map ((t: any) => t.javaFile))) {
            return;
        }

        this.transpileAndSaveJavaExchangeTests(tests, true);
    }

    async transpileAndSaveJavaExchangeTests(tests: any[], isWs = false) {
        const paths = tests.map(test => test.tsFile);
        const flatResult = await this.webworkerTranspile(paths, this.getTranspilerConfig());
        flatResult.forEach((file, idx) => {
            let contentIndentend = file.content.split('\n').map((line: string) => line ? '    ' + line : line).join('\n');
            const filename = tests[idx].name;


            let className = 'Test' + this.capitalize(filename.replace('test.', '').replace('tests.', ''));
            if (className === 'TestOhlcv') className = 'TestOHLCV'; // special case

            let regexes = [
                [/assert/g, 'Assert'],
                [/testSharedMethods\./gm, 'TestSharedMethods.'],
                [/async public/gm, 'public'],
                // REST test functions serve BOTH tiers (regular Exchange and prediction
                // PredictionExchange are siblings under BaseExchange), so type the exchange
                // param as the common base; the awaited unified-method calls are late-bound
                // below through Helpers.callDynamically. WS tests only run against regular
                // venues, keep them statically typed.
                [/Object exchange(?=[,)])/g, isWs ? 'Exchange exchange' : 'BaseExchange exchange'],
                [/throw new Exception/g, 'throw new RuntimeException'],
                [/throw e/gm, 'throw new RuntimeException(e)'],
                [/TestSharedMethods\.assertTimestampAndDatetime\(exchange, skippedProperties, method, orderbook\)/, '// testSharedMethods.assertTimestampAndDatetime (exchange, skippedProperties, method, orderbook)'], // tmp disabling timestamp check on the orderbook
                [/void function/g, 'void'],
                // Test files transpile TS `exchange.spawn(localFn, args)` where
                // `localFn` is a top-level async function in the same file
                // (transpiled as a method on the test class). Java's
                // Exchange.spawn takes a Runnable, so wrap the call in a
                // lambda that invokes the method and .join()s its
                // CompletableFuture, mirroring the lib's spawn pattern.
                [/(\w+)\.spawn\(([^,]+),(.+)\)/gm, '$1.spawn(() -> { try { this.$2($3).join(); } catch(Exception _e) { throw new RuntimeException(_e); } })'],
                [/exchange.jsonStringifyWithNull/g, 'exchange.json'],
                [/(response instanceof java.util.Map)/, '(true)'], // in java this check does not really make sense
            ];

            if (filename.includes('fetch') || filename.includes('load') || filename.includes('create') || filename.includes('watch')) {
                // Resolve cross-file static test calls. e.g. testTrade(exchange,...)
                // is rewritten to TestTrade.testTrade(exchange,...). Skip names
                // ending in "Helper": ccxt's TS test files declare local helpers
                // (testWatchTickersHelper, testWatchBidsAsksHelper) inline on the
                // same class as the public test, so they resolve as instance
                // method calls without qualification. Without this skip the
                // rewrite invents nonexistent helper classes.
                contentIndentend = contentIndentend.replace(
                    /test(\w+)\(exchange,/g,
                    (match: string, name: string) =>
                        name.endsWith('Helper') ? match : `Test${name}.test${name}(exchange,`
                );
            } else {
                contentIndentend = this.regexAll(contentIndentend, [
                    [/testTrade\(exchange\,/, 'TestTrade.testTrade(exchange,'], // quick fix
                ]);
            }

            // Java's System.out.println accepts a single argument; the transpiled
            // output of `console.log(a, b, c)` is `System.out.println(a, b, c)`,
            // which doesn't compile. Collapse multi-arg println calls into a
            // single space-separated string. Walks paren depth and respects
            // string literals so that `()` inside a quoted message doesn't
            // confuse the matcher.
            {
                let cursor = 0;
                let rebuilt = '';
                while (true) {
                    const found = findPrintlnCall(contentIndentend, cursor);
                    if (!found) {
                        rebuilt += contentIndentend.slice(cursor);
                        break;
                    }
                    rebuilt += contentIndentend.slice(cursor, found.start);
                    const parts = splitTopLevelArgs(found.args);
                    if (parts.length <= 1) {
                        rebuilt += `System.out.println(${found.args})`;
                    } else {
                        const joined = parts.map(p => `String.valueOf(${p.trim()})`).join(' + " " + ');
                        rebuilt += `System.out.println(${joined})`;
                    }
                    cursor = found.end;
                }
                contentIndentend = rebuilt;
            }

            //*
            // In java everything is class-based so we don't ahve independent functions laying around
            // so let's say we have the test `testFetchLedger`, it will call the aux function `testledgerEntry`
            // but that function is part of a different class.

            contentIndentend = this.regexAll(contentIndentend, regexes)
            // cast callDynamically to CompletableFuture when .join() is called on the result.
            // The simple regex form only handles one level of nested parens; some WS tests
            // pass arrays-of-lists which the regex can't reach, so do a paren-counting pass too.
            contentIndentend = contentIndentend.replace(/\(Helpers\.callDynamically\(([^)]+(?:\([^)]*\))*[^)]*)\)\)\.join\(\)/g, '((java.util.concurrent.CompletableFuture<Object>)Helpers.callDynamically($1)).join()');
            {
                const marker = '(Helpers.callDynamically(';
                let cursor = 0;
                let rebuilt = '';
                while (true) {
                    const start = contentIndentend.indexOf(marker, cursor);
                    if (start < 0) { rebuilt += contentIndentend.slice(cursor); break; }
                    let i = start + marker.length;
                    let depth = 1;
                    let inStr: string | null = null;
                    while (i < contentIndentend.length && depth > 0) {
                        const ch = contentIndentend[i];
                        if (inStr) {
                            if (ch === '\\' && i + 1 < contentIndentend.length) { i += 2; continue; }
                            if (ch === inStr) inStr = null;
                            i++; continue;
                        }
                        if (ch === '"' || ch === '\'') inStr = ch;
                        else if (ch === '(') depth++;
                        else if (ch === ')') depth--;
                        i++;
                    }
                    // i now points one past the inner closing `)`. Need to also match `).join()`.
                    if (depth === 0 && contentIndentend.slice(i, i + 8) === ').join()') {
                        const args = contentIndentend.slice(start + marker.length, i - 1);
                        rebuilt += contentIndentend.slice(cursor, start);
                        rebuilt += `((java.util.concurrent.CompletableFuture<Object>)Helpers.callDynamically(${args})).join()`;
                        cursor = i + 8;
                    } else {
                        rebuilt += contentIndentend.slice(cursor, start + 1);
                        cursor = start + 1;
                    }
                }
                contentIndentend = rebuilt;
            }
            // Null-safe Array.isArray (see Helpers.isArrayJs).
            contentIndentend = contentIndentend.replace(/\(([^()]+(?:\([^()]*\))*) instanceof java\.util\.List\) \|\| \(\1\.getClass\(\)\.isArray\(\)\)/g, 'Helpers.isArrayJs($1)');
            if (!isWs) {
                // late-bind awaited unified-method calls: the exchange param is BaseExchange
                // (common tier base) but fetchTicker/createOrder/… live on the concrete tiers,
                // so `(exchange.fetchX(args)).join()` must dispatch reflectively on the runtime
                // type. Helpers.callDynamically throws unchecked, so no try/catch is needed.
                contentIndentend = contentIndentend.replace(/\(exchange\.(\w+)\((.*)\)\)\.join\(\)/g, (match: string, name: string, callArgs: string) => {
                    const argsArray = callArgs.trim() === '' ? 'new Object[]{}' : `new Object[]{${callArgs}}`;
                    return `((java.util.concurrent.CompletableFuture<Object>)Helpers.callDynamically(exchange, "${name}", ${argsArray})).join()`;
                });
            } else {
                contentIndentend = this.lateBindTypedSurfaceCalls(contentIndentend);
            }
            // const namespace = isWs ? 'using ccxt;\nusing ccxt.pro;' : 'using ccxt;';

            const preciseImport = contentIndentend.indexOf('Precise.') >= 0 ? 'import io.github.ccxt.base.Precise;\n' : '';
            const packageName = isWs ? 'tests.exchange.ws' : 'tests.exchange';
            const fileHeaders = [
                `package ${packageName};`,
                'import tests.BaseTest;',
                'import io.github.ccxt.Helpers;',
                'import io.github.ccxt.Exchange;',
                ...(isWs ? [] : ['import io.github.ccxt.BaseExchange;']),
                'import io.github.ccxt.errors.*;',
                ...(isWs ? ['import tests.exchange.*;'] : []),
                preciseImport,
                '',
                this.createGeneratedHeader().join('\n'),
                '',
                `public class ${className} extends BaseTest {`,
            ]
            let java: string;
            if (filename === 'test.sharedMethods') {
                contentIndentend = this.regexAll(contentIndentend, [
                    [/public void /g, 'public static void '], // make tests static
                    [/public (java\.util\.concurrent\.CompletableFuture<\w+>) /g, 'public static $1 '], // make tests static
                    [/public Object /g, 'public static Object ']
                ])
                // const doubleIndented = contentIndentend.split('\n').map((line: string) => line ? '    ' + line : line).join('\n');
                java = [
                    ...fileHeaders,
                    contentIndentend,
                    '}'
                ].join('\n');
            } else {
                contentIndentend = this.regexAll(contentIndentend, [
                    [/public void/g, 'public static void'], // make tests static
                    [/async public Task/g, 'async static public Task'], // make tests static
                    [/public object /g, 'public static object '],
                ])
                java = [
                    ...fileHeaders,
                    contentIndentend,
                    '}',
                ].join('\n');
            }
            overwriteFileAndFolder(tests[idx].javaFile, java);
        });
    }

    async transpileTests(force = true) {
        if (!shouldTranspileTests) {
            log.bright.yellow('Skipping tests transpilation');
            return;
        }
        // each stage is awaited: transpileAndSaveJavaExchangeTests is async, and leaving the
        // promises floating meant transpileEverything logged "Transpiled successfully" and
        // runMain started transpileWS with ~84 test files still in flight — three root sets
        // then alternated against the worker sticky-Program LRU (MAX_CACHED_BATCHES = 3)
        await this.transpileBaseTestsToJava(force);
        const baseTestsOnly = process.argv.includes('--baseTests')
        if (baseTestsOnly) return;
        await this.transpileExchangeTests(force);
        await this.transpileWsExchangeTests(force);
    }
}

// ===== String-typing audit (`--audit-string-types`) =====
//
// Two gates over the generated Java tree, run against a base ref (default origin/master):
//   1. ternary gate: no ADDED ` ? ` line under java/ that is not a retype of a removed line
//      (same text modulo the declared type token and `(String)`/`(Object)` casts);
//   2. diff audit: every changed line in a GENERATED file pairs with a removed line as either
//      a declaration retype (type token moved) or a cast removal — anything else is 'other'
//      and fails the run.
// Plus the tree KPIs the typing work is measured by (Object/String safeString locals, casts).
//   npx tsx build/javaTranspiler.ts --audit-string-types [--base <ref>] [--target <ref>] [--json]
//   npx tsx build/javaTranspiler.ts --audit-string-types --self-test

const AUDIT_GEN_MARKER = 'IT IS GENERATED AND WILL BE OVERWRITTEN';
const AUDIT_TYPE_WORDS = ['String', 'Object', 'Boolean', 'Integer', 'Long', 'Double', 'Float', 'Number', 'BigInteger', 'BigDecimal', 'CharSequence', 'String\\[\\]', 'Object\\[\\]', 'List', 'Map', 'Set', 'boolean', 'int', 'long', 'double', 'float', 'char', 'byte', 'short', 'var', 'java\\.util\\.List<Object>', 'java\\.util\\.Map<String, Object>'];
const AUDIT_TYPE_ALT = AUDIT_TYPE_WORDS.join('|');
const AUDIT_DECL_RX = new RegExp('^[ \\t]*(?:(?:public|protected|private|static|final)[ \\t]+)*(?:' + AUDIT_TYPE_ALT + ')[ \\t]+(?:\\[[ \\t]*\\])?[A-Za-z_$][A-Za-z0-9_$]*[ \\t]*(?:=|;|\\()');
const AUDIT_TYPENORM_RX = new RegExp('\\b(?:' + AUDIT_TYPE_ALT + ')\\b', 'g');
const AUDIT_KPI_RX = {
    objectLocals: /^[ \t]*Object[ \t]+[A-Za-z_$][A-Za-z0-9_$]*[ \t]*=[ \t]*this\.safeString/gm,
    stringLocals: /^[ \t]*String[ \t]+[A-Za-z_$][A-Za-z0-9_$]*[ \t]*=[ \t]*this\.safeString/gm,
    stringCasts: /\(String\)[ \t]*this\.safeString/g,
    wrappedCasts: /\(\(String\)[ \t]*[A-Za-z_$][A-Za-z0-9_$]*\)/g,
};

function auditGit (repo: string, args: string[]): string {
    return execFileSync('git', ['-C', repo, ...args], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
}

// `((String)<balanced-expr>)` -> `<balanced-expr>`; `foo((String)x)` is a call, not a wrapper
function auditStripWrappedStringCasts (s: string): string {
    const open = '((String)';
    for (;;) {
        let at = -1;
        for (let k = s.indexOf(open); k !== -1; k = s.indexOf(open, k + 1)) {
            if (k === 0 || !/[A-Za-z0-9_$]/.test(s[k - 1])) { at = k; break; }
        }
        if (at === -1) return s;
        let depth = 1, j = at + open.length, closed = -1;
        for (; j < s.length; j++) {
            const ch = s[j];
            if (ch === '"') { j++; while (j < s.length && s[j] !== '"') { if (s[j] === '\\') j++; j++; } continue; }
            if (ch === '(') depth++;
            else if (ch === ')') { depth--; if (depth === 0) { closed = j; break; } }
        }
        if (closed === -1) return s;
        s = s.slice(0, at) + s.slice(at + open.length, closed) + s.slice(closed + 1);
    }
}
function auditStripCasts (s: string): string {
    return auditStripWrappedStringCasts(s)
        .replace(/\(String\)[ \t]*/g, '')
        .replace(/\(Object\)[ \t]+(?=[A-Za-z_$])/g, '')
        .replace(/([(,=] ?)\(([A-Za-z_$][A-Za-z0-9_$]*)\)(?=[,;)])/g, '$1$2');
}
const auditTypeNorm = (s: string) => s.replace(AUDIT_TYPENORM_RX, '<T>');
const auditStripEq = (r: string, a: string) => auditStripCasts(r).trim() === auditStripCasts(a).trim();
const auditTypeEq = (r: string, a: string) => auditTypeNorm(auditStripCasts(r)).trim() === auditTypeNorm(auditStripCasts(a)).trim();
const auditIsDecl = (s: string) => AUDIT_DECL_RX.test(s);
const auditTernaryKey = (line: string) => auditStripCasts(line.replace(/^(\s*)(?:Object|String|Long|Double|Boolean|Integer|java\.util\.List<Object>|java\.util\.Map<String, Object>)\s+(?=[A-Za-z_$][A-Za-z0-9_$]*\s*=)/, '$1<T> ')).trim();

function auditParseDiff (repo: string, base: string, target: string | null, scope: string) {
    const args = ['diff', '--no-color', '-U0', base];
    if (target) args.push(target);
    args.push('--', scope);
    const files = new Map<string, any>();
    let cur: any = null, hunk: any = null, newLine = 0;
    for (const raw of auditGit(repo, args).split('\n')) {
        if (raw.startsWith('+++ ')) {
            const f = raw.startsWith('+++ b/') ? raw.slice(6) : raw.slice(4).trim();
            if (!files.has(f)) files.set(f, { path: f, hunks: [] });
            cur = files.get(f); hunk = null; continue;
        }
        if (raw.startsWith('--- ')) continue;
        if (raw.startsWith('@@')) {
            const m = raw.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
            newLine = m ? parseInt(m[1], 10) : 0;
            hunk = { removed: [], added: [] }; cur.hunks.push(hunk); continue;
        }
        if (!cur || !hunk) continue;
        if (raw.startsWith('+')) { hunk.added.push({ text: raw.slice(1), line: newLine }); newLine++; }
        else if (raw.startsWith('-')) hunk.removed.push({ text: raw.slice(1) });
        else if (raw.startsWith(' ')) newLine++;
    }
    return files;
}

function auditKpis (repo: string, scopeRel: string) {
    const out: any = { scope: scopeRel, files: 0, objectLocals: 0, stringLocals: 0, stringCasts: 0, wrappedCasts: 0 };
    const dir = path.join(repo, scopeRel);
    if (!fs.existsSync(dir)) return out;
    const walk = (d: string) => {
        for (const e of fs.readdirSync(d, { withFileTypes: true })) {
            const p = path.join(d, e.name);
            if (e.isDirectory()) walk(p);
            else if (e.isFile() && e.name.endsWith('.java')) {
                const text = fs.readFileSync(p, 'utf8');
                out.files++;
                for (const k of Object.keys(AUDIT_KPI_RX)) out[k] += (text.match((AUDIT_KPI_RX as any)[k]) ?? []).length;
            }
        }
    };
    walk(dir);
    return out;
}

function auditTernaries (files: Map<string, any>) {
    const res: any = { addedLines: 0, removedLines: 0, ternaryCount: 0, ternaryLines: [] };
    for (const [file, info] of files) {
        const pool = new Map<string, number>();
        const added: string[] = [];
        for (const h of info.hunks) {
            res.addedLines += h.added.length; res.removedLines += h.removed.length;
            for (const r of h.removed) if (r.text.includes(' ? ')) { const k = auditTernaryKey(r.text); pool.set(k, (pool.get(k) ?? 0) + 1); }
            for (const a of h.added) if (a.text.includes(' ? ')) added.push(a.text);
        }
        for (const text of added) {
            const k = auditTernaryKey(text); const n = pool.get(k) ?? 0;
            if (n > 0) { pool.set(k, n - 1); continue; }
            res.ternaryCount++; res.ternaryLines.push({ file, text });
        }
    }
    return res;
}

function auditClassify (repo: string, target: string | null, files: Map<string, any>) {
    const report: any = { files: [], skippedHandwritten: [], totals: { declaration: 0, castRemoval: 0, other: 0 } };
    const headOf = (file: string) => {
        try { return target ? auditGit(repo, ['show', `${target}:${file}`]).slice(0, 400) : fs.readFileSync(path.join(repo, file), 'utf8').slice(0, 400); } catch { return ''; }
    };
    for (const [file, info] of files) {
        if (!headOf(file).includes(AUDIT_GEN_MARKER)) { report.skippedHandwritten.push(file); continue; }
        const rec: any = { path: file, declaration: 0, castRemoval: 0, other: 0, otherLines: [] };
        for (const h of info.hunks) {
            const unusedR: number[] = [...h.removed.keys()];
            const takenA = new Set<number>();
            const pair = (r: number, a: number, kind: string, text?: string) => {
                unusedR.splice(unusedR.indexOf(r), 1); takenA.add(a);
                rec[kind]++; report.totals[kind]++;
                if (kind === 'other' && text !== undefined) rec.otherLines.push(text);
            };
            h.added.forEach((a: any, ai: number) => {
                const ri = unusedR.find((r) => auditStripEq(h.removed[r].text, a.text));
                if (ri === undefined) return;
                if (h.removed[ri].text.trim() === a.text.trim()) pair(ri, ai, auditIsDecl(a.text) ? 'declaration' : 'other', a.text);
                else pair(ri, ai, 'castRemoval');
            });
            h.added.forEach((a: any, ai: number) => {
                if (takenA.has(ai)) return;
                const ri = unusedR.find((r) => auditTypeEq(h.removed[r].text, a.text));
                if (ri !== undefined) pair(ri, ai, 'declaration');
            });
            h.added.forEach((a: any, ai: number) => {
                if (takenA.has(ai) || !unusedR.length) return;
                const ri = unusedR[0];
                pair(ri, ai, auditStripEq(h.removed[ri].text, a.text) ? 'castRemoval' : auditTypeEq(h.removed[ri].text, a.text) ? 'declaration' : 'other', a.text);
            });
            h.added.forEach((a: any, ai: number) => {
                if (takenA.has(ai)) return;
                const kind = auditIsDecl(a.text) ? 'declaration' : 'other';
                rec[kind]++; report.totals[kind]++;
                if (kind === 'other') rec.otherLines.push(a.text);
            });
        }
        report.files.push(rec);
    }
    return report;
}

// synthetic repo: the gate must flag an injected ternary and an 'other' edit, and pass a clean retype
function auditSelfTest (): string[] {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'java-string-audit-'));
    const problems: string[] = [];
    const ok = (cond: boolean, msg: string) => { if (!cond) problems.push(msg); };
    const gc = (args: string[]) => auditGit(tmp, ['-c', 'user.email=audit@test', '-c', 'user.name=audit', ...args]);
    try {
        fs.mkdirSync(path.join(tmp, 'java', 'gen'), { recursive: true });
        const f = path.join(tmp, 'java', 'gen', 'Gen.java');
        const header = '// PLEASE DO NOT EDIT THIS FILE, IT IS ' + 'GENERATED AND WILL BE OVERWRITTEN:\npackage gen;\nclass Gen {\n';
        fs.writeFileSync(f, header + '    String a = (String) this.safeString(parsed, "k");\n    Object b = this.safeString(parsed, "k");\n    Object t = flag ? "a" : "b";\n    int c = 1;\n}\n');
        auditGit(tmp, ['init', '-q']); gc(['add', '-A']); gc(['commit', '-q', '-m', 'base']);
        const base = auditGit(tmp, ['rev-parse', 'HEAD']).trim();
        const kpi = auditKpis(tmp, 'java');
        ok(kpi.objectLocals === 1 && kpi.stringLocals === 0 && kpi.stringCasts === 1, `kpis expected 1/0/1, got ${kpi.objectLocals}/${kpi.stringLocals}/${kpi.stringCasts}`);
        // clean retype: cast removal + Object->String decl + retyped ternary (not new) -> passes
        fs.writeFileSync(f, header + '    String a = this.safeString(parsed, "k");\n    String b = this.safeString(parsed, "k");\n    String t = flag ? "a" : "b";\n    int c = 1;\n}\n');
        let files = auditParseDiff(tmp, base, null, 'java');
        let t = auditTernaries(files); let r = auditClassify(tmp, null, files);
        ok(t.ternaryCount === 0, `retyped ternary must not count as new, got ${t.ternaryCount}`);
        ok(r.totals.castRemoval === 1 && r.totals.declaration === 2 && r.totals.other === 0, `clean retype expected cast=1 decl=2 other=0, got ${r.totals.castRemoval}/${r.totals.declaration}/${r.totals.other}`);
        // injected ternary + semantic edit -> both gates fail
        fs.appendFileSync(f, '    String probe = flag ? "x" : "y";\n');
        fs.writeFileSync(f, fs.readFileSync(f, 'utf8').replace('int c = 1;', 'int c = 2;'));
        files = auditParseDiff(tmp, base, null, 'java');
        t = auditTernaries(files); r = auditClassify(tmp, null, files);
        ok(t.ternaryCount === 1, `injected ternary must be flagged, got ${t.ternaryCount}`);
        ok(r.totals.other >= 1, `semantic edit must be 'other', got ${r.totals.other}`);
    } catch (e: any) {
        problems.push(`self-test threw: ${e.message}`);
    } finally {
        fs.rmSync(tmp, { recursive: true, force: true });
    }
    return problems;
}

function runStringTypeAudit (): void {
    const argv = process.argv.slice(2);
    const flag = (name: string) => { const i = argv.indexOf(name); return i === -1 ? undefined : argv[i + 1]; };
    if (argv.includes('--self-test')) {
        const problems = auditSelfTest();
        if (problems.length) { console.error('SELF-TEST FAILED:\n  - ' + problems.join('\n  - ')); process.exit(3); }
        console.log('SELF-TEST PASSED'); return;
    }
    const repo = process.cwd();
    const base = auditGit(repo, ['rev-parse', `${flag('--base') ?? 'origin/master'}^{commit}`]).trim();
    const target = flag('--target') ?? null;
    const files = auditParseDiff(repo, base, target, 'java');
    const ternary = auditTernaries(files);
    const audit = auditClassify(repo, target, files);
    const kpis = auditKpis(repo, 'java/lib/src/main');
    const pass = ternary.ternaryCount === 0 && audit.totals.other === 0;
    if (argv.includes('--json')) {
        console.log(JSON.stringify({ base, target, kpis, ternary, audit, pass }, null, 2));
    } else {
        console.log(`string-type audit | base=${base.slice(0, 11)} target=${target ?? '<worktree>'}`);
        console.log(`  kpis java/lib/src/main: Object-safeString-locals=${kpis.objectLocals} String-safeString-locals=${kpis.stringLocals} (String)this.safeString=${kpis.stringCasts} ((String)x)=${kpis.wrappedCasts}`);
        console.log(`  ternary gate: added=${ternary.addedLines} removed=${ternary.removedLines} new-ternaries=${ternary.ternaryCount}`);
        for (const t of ternary.ternaryLines.slice(0, 30)) console.log(`    TERNARY ${t.file}: ${t.text.trim().slice(0, 160)}`);
        console.log(`  diff audit (generated files): declaration=${audit.totals.declaration} cast-removal=${audit.totals.castRemoval} other=${audit.totals.other} (hand-written skipped: ${audit.skippedHandwritten.length})`);
        for (const f of audit.files.filter((x: any) => x.other > 0).slice(0, 30)) console.log(`    OTHER ${f.path}: ${f.otherLines[0].trim().slice(0, 140)}`);
        console.log(`  ${pass ? 'PASS' : 'FAIL'}`);
    }
    process.exit(pass ? 0 : 1);
}

async function runMain() {
    if (process.argv.includes('--audit-string-types')) {
        runStringTypeAudit();
        return;
    }
    const ws = process.argv.includes('--ws')
    // bare prediction-only ids (e.g. `javaTranspiler.ts kalshi`) auto-route to the
    // prediction namespace so scoped CI steps don't need to know it
    const cliExchanges = process.argv.slice(2).filter(x => !x.startsWith('--'))
    const allArePredictionOnly = cliExchanges.length > 0 && cliExchanges.every(x => (exchanges.prediction || []).includes(x) && !exchangeIds.includes(x))
    const prediction = process.argv.includes('--prediction') || allArePredictionOnly
    const baseTestsOnly = process.argv.includes('--baseTests')
    const test = process.argv.includes('--test') || process.argv.includes('--tests')
    const examples = process.argv.includes('--examples');
    const force = process.argv.includes('--force')
    const baseClassOnly = process.argv.includes('--baseClass')
    // single-process REST+WS (default via npm run transpileJava / CI): keeps the one
    // piscina pool (and its warm per-thread Transpilers) alive across both stages
    // instead of paying a second process boot + cold pool. Omit the flag for REST-only.
    const restAndWs = process.argv.includes('--rest-and-ws')
    shouldTranspileTests = process.argv.includes('--noTests') ? false : true
    log.bright.green({ force })
    const transpiler = new NewTranspiler();
    if (baseClassOnly) {
        transpiler.transpileBaseMethods('./ts/src/base/Exchange.ts');
        transpiler.transpilePredictionBaseMethods();
    } else if (restAndWs) {
        await transpiler.transpileEverything(force, false, examples)
        await transpiler.transpileWS(force)
    } else if (prediction) {
        await transpiler.transpilePrediction(force)
    } else if (ws) {
        await transpiler.transpileWS(force)
    } else if (test || baseTestsOnly) {
        await transpiler.transpileTests()
    } else {
        await transpiler.transpileEverything(force, false, examples)
    }
}

if (isMainEntry(metaUrl)) {
    // Deliberately not `await runMain()`: build/java-worker.ts imports this module
    // for patchJavaLocalTypes, and piscina loads worker modules through tsx's CJS
    // require hook, whose esbuild transform rejects top-level await ("not supported
    // with the cjs output format"). A rejection is still fatal here — an unhandled
    // rejection exits 1, exactly like the awaited form did.
    runMain();
}
