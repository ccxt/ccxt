import Transpiler from "ast-transpiler";
import ts from "typescript";
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
import { Transpiler as OldTranspiler, parallelizeTranspiling } from "./transpile.js";
import errorHierarchy from '../js/src/base/errorHierarchy.js'
import Piscina from 'piscina';
import { isMainEntry, stripSignAsyncForAst } from "./transpile.js";
import { unCamelCase } from "../js/src/base/functions.js";
import { ZERO_REQUIRED_TYPED_WHITELIST } from "./generateJavaWrappers.js";

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
    overwriteFile(path, content);
    fs.writeFileSync(path, content);
}

// User-facing typed-wrapper methods that ship BOTH a typed sync overload
// (`Balances fetchBalance()`) AND a typed async sibling
// (`CompletableFuture<Balances> fetchBalanceAsync()`). Internal calls in
// transpiled `*Core.java` files that resolve to the typed sync overload
// would break the parent's CompletableFuture chain (`.join()` doesn't
// exist on `Balances`), and inside `Promise.all` they'd silently run
// synchronously instead of in parallel.
//
// Only the ZERO-ARG call shape needs rewriting:
//   - `this.fetchBalance()`         → Java picks typed sync (more specific
//     than varargs) → returns `Balances` → `.join()` fails. REWRITE.
//   - `this.fetchBalance(params)`   → Java transpiler emits `(Object) params`
//     cast; `Object` not assignable to typed `Map`, so it routes to the
//     base `fetchBalance(Object... varargs)`. Already correct. DON'T touch.
//   - `this.fetchBalance(undef)`    → same as above. DON'T touch.
//
// Rewriting non-zero-arg calls would break compilation because there is
// no `fetchBalanceAsync(Object... varargs)` on the base class — only the
// typed-arity variants exist.
//
// Anchored on `this.` so we don't rewrite `super.<method>(...)` calls
// that the typed wrappers themselves use to delegate to the base class.
// Applies only to per-exchange Core .java output — base `Exchange.java`
// (which lacks the typed-async siblings) is unaffected because it's
// emitted via a different code path (`transpileBaseMethods`).
//
// Whitelist is the single source of truth in build/generateJavaWrappers.ts.
// Match both zero-arg `()` and explicit single-null `(null)` (the latter is
// what `await this.fetchX (undefined)` in TS transpiles to in Java). Both are
// semantically "all defaults"; both must route through Async to avoid
// colliding with the typed sync overload's `(List<String>)` etc.
const WHITELISTED_ZERO_ARG_CALL_RE = new RegExp(
    '\\bthis\\.(' + [...ZERO_REQUIRED_TYPED_WHITELIST].join('|') + ')\\(\\s*(?:null\\s*)?\\)',
    'g',
);

function routeWhitelistedInternalCallsToAsync(javaSource: string): string {
    return javaSource.replace(WHITELISTED_ZERO_ARG_CALL_RE, 'this.$1Async()');
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
const BASE_METHODS_FILE = './java/lib/src/main/java/io/github/ccxt/Exchange.java';
const EXCHANGES_FOLDER = './java/lib/src/main/java/io/github/ccxt/exchanges/';
const EXCHANGES_WS_FOLDER = './java/lib/src/main/java/io/github/ccxt/exchanges/pro/';
const GENERATED_TESTS_FOLDER = './java/tests/src/main/java/tests/exchange/';
const BASE_TESTS_FOLDER = 'java/tests/src/main/java/tests/base/';
const BASE_TESTS_FILE = './java/tests/src/main/java/tests/exchange/TestMain.java';
const EXCHANGE_BASE_FOLDER = './java/tests/src/main/java/tests/exchange/';
const EXCHANGE_GENERATED_FOLDER = './java/tests/src/main/java/tests/exchange/';
const EXAMPLES_INPUT_FOLDER = './examples/ts/';
const EXAMPLES_OUTPUT_FOLDER = './examples/java/examples/';
const csharpComments: any = {};

class NewTranspiler {

    transpiler!: Transpiler;
    pythonStandardLibraries;
    oldTranspiler = new OldTranspiler();

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
        // sign (+ crypto helpers) is async only in JS; in Java it is synchronous. Wrap
        // transpileJavaByPath so every file is transpiled from a sign-synchronous copy
        // (async/await for sign stripped). byPath mode is preserved via a temp file.
        const originalByPath = this.transpiler.transpileJavaByPath.bind (this.transpiler);
        this.transpiler.transpileJavaByPath = (filePath: string) => {
            const tmpPath = filePath.replace (/\.ts$/, '.__signsync__.ts');
            fs.writeFileSync (tmpPath, stripSignAsyncForAst (fs.readFileSync (filePath, 'utf8')));
            try {
                return originalByPath (tmpPath);
            } finally {
                try { fs.unlinkSync (tmpPath); } catch (e) { /* ignore */ }
            }
        };
    }

    createGeneratedHeader() {
        return [
            "// PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:",
            "// https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code",
            ""
        ]
    }

    getJavaImports(file: any, ws = false) {
        if (ws) {
            // For WS pro exchanges — no import of REST parent (use FQN to avoid name clash)
            return [
                'package io.github.ccxt.exchanges.pro;',
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
            paramType = 'Exchange';
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
        const isAsync = methodWrapper.async;
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


    transpileErrorHierarchy() {

        const errorHierarchyFilename = './js/src/base/errorHierarchy.js'
        const errorHierarchyPath = __dirname + '/.' + errorHierarchyFilename

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

    transpileBaseMethods(baseExchangeFile: string) {
        const javaExchangeBase = BASE_METHODS_FILE;
        const delimiter = 'METHODS BELOW THIS LINE ARE TRANSPILED FROM TYPESCRIPT'

        const strippedBaseFile = writeOverloadStrippedFile (baseExchangeFile);
        const baseFile: any = this.transpiler.transpileJavaByPath(strippedBaseFile);
        removeOverloadStrippedFile (strippedBaseFile, baseExchangeFile);
        let baseClass = baseFile.content as any;// remove this later

        // custom transformations needed for Java
        baseClass = baseClass.replace(/(put\("\w+",\s*)(this\.\w+)/gm, "$1Exchange.$2");
        baseClass = this.regexAll(baseClass, [
            [/\(Object client, /g, '(Client client, '],
            [/Object client = (.+)/g, 'Client client = (Client)$1'],
            [/(\w+)(\.storeArray\(.+\))/gm, '((IOrderBookSide)$1)$2'],
            [/(\b\w*)RestInstance.describe/g, "(\(Exchange\)$1RestInstance).describe"],

            // [/(put\(\s*"\w+", )(this\.\w+)/gm, "$1Exchange.$2"],
            [/public Object setMarketsFromExchange\(Object sourceExchange\)/g, "public Object setMarketsFromExchange(Exchange sourceExchange)"]
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
        // Pattern 2: } closing an if/else where both branches terminate, followed by return null
        // This is unreachable but the lambda requires a return — Java compiler sees it as error

        baseClass = this.addDeprecatedAnnotations(baseClass);

        // // WS fixes
        // baseClass = baseClass.replace(/\(object client,/gm, '(WebSocketClient client,');

        const javaDelimiter = '// ' + delimiter + '\n';
        const restOfFile = '([^\n]*\n)+'
        const parts = baseClass.split(javaDelimiter)
        if (parts.length > 1) {
            log.magenta('→', (javaExchangeBase as any).yellow)
            replaceInFile(javaExchangeBase, new RegExp(javaDelimiter + restOfFile), javaDelimiter + '\n' + parts[1].trim() + '\n')
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
        if (!inputExchanges || inputExchanges.length === 0) {
            // REST transpile writes `<Exchange>Core.java`; only Binance.java and
            // Bybit.java exist as plain names (tracked in git). Match against
            // both shapes — on a fresh CI checkout only the two tracked files
            // are plain, so a naive `.java` match emits only those WS classes
            // and every other exchange dies at runtime with ClassNotFound.
            const restExchanges = new Set<string>();
            for (const f of fs.readdirSync(EXCHANGES_FOLDER)) {
                if (!f.endsWith('.java')) continue;
                const base = f.replace('.java', '').toLowerCase();
                restExchanges.add(base);
                if (base.endsWith('core')) restExchanges.add(base.slice(0, -4));
            }
            const wsExchanges = (exchanges as any).ws as string[];
            inputExchanges = wsExchanges.filter((ws: string) => restExchanges.has(ws));
            log.blue('[java-ws] Filtering to exchanges with REST parents:', inputExchanges);
        }
        const options = { csharpFolder: EXCHANGES_WS_FOLDER, exchanges: inputExchanges }
        await this.transpileDerivedExchangeFiles (tsFolder, options, '.ts', force, !!(inputExchanges), true)
    }

    async transpileEverything(force = false, child = false, baseOnly = false, examplesOnly = false) {

        const exchanges = process.argv.slice(2).filter(x => !x.startsWith('--'))
            , javaFolder = EXCHANGES_FOLDER
            , tsFolder = './ts/src/'
            , exchangeBase = './ts/src/base/Exchange.ts'

        if (!child) {
            createFolderRecursively(javaFolder)
        }
        const transpilingSingleExchange = (exchanges.length === 1); // when transpiling single exchange, we can skip some steps because this is only used for testing/debugging
        if (transpilingSingleExchange) {
            force = true; // when transpiling single exchange, we always force
        }
        const options = { csharpFolder: javaFolder, exchanges }

        if (!baseOnly && !examplesOnly) {
            await this.transpileDerivedExchangeFiles(tsFolder, options, '.ts', force, !!(child || exchanges.length))
        }

        if (transpilingSingleExchange) {
            return;
        }
        if (child) {
            return;
        }

        this.transpileBaseMethods(exchangeBase)

        if (baseOnly) {
            return;
        }


        this.transpileTests()

        this.transpileErrorHierarchy()

        // Fix Api classes that extend other exchanges (not Exchange) to use Core suffix
        this.fixApiExtendsForCore()

        log.bright.green('Transpiled successfully.')
    }

    async webworkerTranspile(allFiles: any[], parserConfig: any) {

        // create worker
        const piscina = new Piscina({
            filename: resolve(__dirname, 'java-worker.js')
        });

        const chunkSize = 20;
        const promises: any = [];
        const now = Date.now();
        for (let i = 0; i < allFiles.length; i += chunkSize) {
            const chunk = allFiles.slice(i, i + chunkSize);
            promises.push(piscina.run({ transpilerConfig: parserConfig, files: chunk }));
        }
        const workerResult = await Promise.all(promises);
        const elapsed = Date.now() - now;
        log.green('[ast-transpiler] Transpiled', allFiles.length, 'files in', elapsed, 'ms');
        const flatResult = workerResult.flat();
        return flatResult;
    }

    async transpileDerivedExchangeFiles(jsFolder: string, options: any, pattern = '.ts', force = false, child = false, ws = false) {

        // todo normalize jsFolder and other arguments

        // exchanges.json accounts for ids included in exchanges.cfg
        let ids: string[] = []
        try {
            ids = (exchanges as any).ids
        } catch (e) {
        }

        const regex = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))

        // let exchanges
        if (options.exchanges && options.exchanges.length) {
            exchanges = options.exchanges.map((x: string) => x + pattern)
        } else {
            exchanges = fs.readdirSync(jsFolder).filter(file => file.match(regex) && (!ids || ids.includes(basename(file, '.ts'))))
        }

        // transpile using webworker
        const allFilesPath = exchanges.map((file: string) => jsFolder + file);
        // const transpiledFiles =  await this.webworkerTranspile(allFilesPath, this.getTranspilerConfig());
        log.blue('[java] Transpiling [', exchanges.join(', '), ']');
        const transpiledFiles = allFilesPath.map((file: string) => this.transpiler.transpileJavaByPath(file));

        if (!ws) {
            for (let i = 0; i < transpiledFiles.length; i++) {
                const transpiled = transpiledFiles[i];
                const exchangeName = exchanges[i].replace('.ts','');
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
        exchanges.map((file: string, idx: number) => this.transpileDerivedExchangeFile(jsFolder, file, options, transpiledFiles[idx], force, ws))

        const classes = {}

        return classes
    }

    createJavaClass(name: string, javaVersion: any, ws = false) {
        const javaImports = this.getJavaImports(name, ws).join("\n") + "\n\n";
        let content = javaVersion.content;

        // Append "Core" suffix so the typed wrapper can take the clean name.
        // e.g., transpiled Binance becomes BinanceCore, typed Binance extends BinanceCore.
        // Same for WS: pro.BinanceCore (transpiled WS), pro.Binance (typed WS wrapper).
        const className = this.capitalize(name) + 'Core';

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
        // Rename the class to include Core suffix
        content = content.replace(/class\s+\w+\s+extends/, `class ${className} extends`);
        // Also rename self-references like ClassName.this in anonymous inner classes
        const origName = this.capitalize(name);
        content = content.replace(new RegExp(`${origName}\\.this`, 'g'), `${className}.this`);
        content = content.replace(/, (sha1|sha384|sha512|sha256|md5|ed25519|keccak|p256|secp256k1)([,)])/g, `, $1()$2`);
        content = content.replace(/(\s+public Object describe\(\))/g, `${constructor}$1`)
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
            // For WS classes, extend the typed REST class (not Core) so WS inherits REST typed methods.
            // pro.BinanceCore extends io.github.ccxt.exchanges.Binance (the typed REST wrapper)
            const restTypedFqn = `io.github.ccxt.exchanges.${this.capitalize(name)}`;
            content = content.replace(/extends\s\w+Api/g, `extends ${restTypedFqn}`);
            content = content.replace(/extends\s(\w+)Rest/g, `extends io.github.ccxt.exchanges.$1`);
            content = content.replace(/extends\s(\w+)\b(?!\.)/, `extends ${restTypedFqn}`);
            content = this.postProcessWsJava(content, name);
        }
        content = this.addDeprecatedAnnotations(content);
        content = this.createGeneratedHeader().join('\n') + '\n' + content;
        return javaImports + content;
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

    /**
     * Fix Api classes that extend other exchange classes (not Exchange) to use Core suffix.
     * e.g., BinanceusdmApi extends Binance → BinanceusdmApi extends BinanceCore
     * This is needed because the typed wrapper class now takes the clean name (Binance),
     * and Api classes must extend the untyped Core class to avoid inheriting typed overloads.
     */
    fixApiExtendsForCore() {
        const apiFolder = './java/lib/src/main/java/io/github/ccxt/api/';
        if (!fs.existsSync(apiFolder)) return;

        const apiFiles = fs.readdirSync(apiFolder).filter(f => f.endsWith('Api.java'));
        for (const file of apiFiles) {
            const path = apiFolder + file;
            let content = fs.readFileSync(path, 'utf-8');
            // Match "extends SomeName" where SomeName is NOT "Exchange" and NOT already Core
            const match = content.match(/class\s+\w+Api\s+extends\s+(\w+)/);
            if (match && match[1] !== 'Exchange' && !match[1].endsWith('Core')) {
                const parentName = match[1];
                // Update extends clause
                content = content.replace(
                    new RegExp(`extends\\s+${parentName}\\b`),
                    `extends ${parentName}Core`
                );
                // Update import to use Core name
                content = content.replace(
                    new RegExp(`import\\s+io\\.github\\.ccxt\\.exchanges\\.${parentName}\\s*;`),
                    `import io.github.ccxt.exchanges.${parentName}Core;`
                );
                fs.writeFileSync(path, content, 'utf-8');
            }
        }
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
     * Read `exchanges/<Exchange>.java` (the typed REST wrapper) and collect all
     * public method names (typed overloads). Used by redirectToAsyncOnJoin to
     * scope the rewrite to methods that actually shadow the untyped varargs
     * base.
     */
    collectTypedRestMethodNames(name: string): Set<string> {
        const path = EXCHANGES_FOLDER + this.capitalize(name) + '.java';
        try {
            const content = fs.readFileSync(path, 'utf-8');
            return this.collectMethodNamesInClass(content);
        } catch {
            return new Set();
        }
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
     * Rewrite `(this.X(arg1, arg2, ...)).join()` inside WS cores, where X is a
     * typed REST method on the exchange's REST typed wrapper, to cast every
     * argument to `(Object)` so the call dispatches to the untyped `X(Object...)`
     * varargs inherited from the REST untyped Core instead of the typed
     * overload (which would return the typed value directly and break `.join()`).
     *
     * Scoped to methods we can verify exist on the typed REST wrapper file to
     * avoid breaking WS-core local helpers.
     */
    redirectToAsyncOnJoin(content: string, name: string): string {
        const typedRestMethods = this.collectTypedRestMethodNames(name);
        if (typedRestMethods.size === 0) return content;
        // loadMarkets has a special typed signature `loadMarkets(boolean reload)`;
        // the untyped base accepts 0 args, so a zero-arg call is already unambiguous
        // and we shouldn't touch it.
        typedRestMethods.delete('loadMarkets');
        const pattern = /\(this\.(\w+)\(/g;
        let result = '';
        let lastIdx = 0;
        let match;
        while ((match = pattern.exec(content)) !== null) {
            const methodName = match[1];
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
                const argsCast = argsRaw.trim().length === 0
                    ? argsRaw
                    : this.splitTopLevelArgs(argsRaw).map(a => `(Object)(${a.trim()})`).join(', ');
                result += content.substring(lastIdx, match.index);
                result += `(this.${methodName}(${argsCast})).join()`;
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

    postProcessWsJava(content: string, name: string, isCore = true): string {
        const cap = this.capitalize(name) + (isCore ? 'Core' : ''); // WS classes are now named *Core

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
        content = content.replace(/Object\s+future\s*=\s*client\.(future|reusableFuture)\((\w+)\)/gm,
            'io.github.ccxt.ws.Future future = client.$1((String)$2)');
        // Object future = Helpers.GetValue(client.futures, x) → cast to Future
        content = content.replace(/Object\s+future\s*=\s*Helpers\.GetValue\(client\.futures,\s*(\w+)\)/gm,
            'io.github.ccxt.ws.Future future = (io.github.ccxt.ws.Future)Helpers.GetValue(client.futures, $1)');

        // ── Pattern 3: (String) cast on messageHash for client.future() / reusableFuture() ──
        // client.future(messageHash) where messageHash is Object
        content = content.replace(/client\.(future|reusableFuture)\(messageHash\)/gm, 'client.$1((String)messageHash)');

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
        content = content.replace(/(throw new \w+\()Helpers\.add\(/gm, '$1(String)Helpers.add(');
        content = content.replace(/(client\.(?:future|reusableFuture)\()Helpers\.add\(/gm, '$1(String)Helpers.add(');

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

        // ── String type fixes ──
        content = content.replace(/String (\w+) = ((?:this\.\w+\(|Helpers\.)[^;]+);/gm, 'Object $1 = $2;');

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
        content = this.fixEffectivelyFinal(content);

        // ── Fix effectively final for lambda captures in spawn/delay ──
        content = this.fixEffectivelyFinalLambda(content);

        // ── Remove duplicate final variable declarations in same method ──
        content = this.removeTrueDuplicateFinals(content);

        // ── Void supplyAsync return null insertion ──
        content = this.insertReturnNullInSupplyAsync(content);

        // Runs AFTER insertReturnNullInSupplyAsync to fix `return null;` leakage
        // into void event-handler methods. Uses comment/string-aware brace tracking
        // to avoid false state from brace chars in `//` comment blocks.
        content = this.fixVoidReturnNull(content);

        // Redirect `(this.restMethod(...)).join()` to `(this.restMethodAsync(...)).join()`
        // so the typed REST overload (returning a typed value directly) doesn't shadow
        // the future-returning variant the transpiled WS code expects.
        content = this.redirectToAsyncOnJoin(content, name);

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

    transpileDerivedExchangeFile(tsFolder: string, filename: string, options: any, csharpResult: any, force = false, ws = false) {

        const tsPath = tsFolder + filename

        const { csharpFolder: javaFolder } = options

        const javaName = filename.replace('.ts', '.java')

        const fileNameNoExt = filename.replace('.ts', '')

        const tsMtime = fs.statSync(tsPath).mtime.getTime()

        let javaSource = this.createJavaClass(fileNameNoExt, csharpResult, ws)
        javaSource = routeWhitelistedInternalCallsToAsync(javaSource)

        if (javaFolder) {
            // Both REST and WS classes get Core suffix (e.g., BinanceCore.java, pro/BinanceCore.java)
            const outputName = this.capitalize(fileNameNoExt) + 'Core.java';
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

    transpileCryptoTestsToJava(outDir: string) {

        const jsFile = './ts/src/test/base/test.cryptography.ts';
        const csharpFile = `${outDir}/TestCryptography.java`;

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

    transpileBaseTestsToJava() {
        const outDir = BASE_TESTS_FOLDER;
        this.transpileBaseTests(outDir);
        this.transpileCryptoTestsToJava(outDir);
        // this.transpileWsCacheTestsToCSharp(outDir);
        // this.transpileWsOrderbookTestsToCSharp(outDir);
    }

    transpileBaseTests(outDir: string) {

        const baseFolders = {
            ts: './ts/src/test/base/',
        };

        let baseFunctionTests = fs.readdirSync(baseFolders.ts).filter(filename => filename.endsWith('.ts')).map(filename => filename.replace('.ts', ''));

        for (const testName of baseFunctionTests) {
            const tsFile = baseFolders.ts + testName + '.ts';
            const tsContent = fs.readFileSync(tsFile).toString();
            if (!tsContent.includes('// AUTO_TRANSPILE_ENABLED')) {
                continue;
            }

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
            [/public Object initOfflineExchange/g, 'public Exchange initOfflineExchange'],
            [/Object exchange(?=[,)])/g, 'Exchange exchange'],
            [/Object exchange =/g, 'Exchange exchange ='],
            [/throw new Error/g, 'throw new Exception'],
            [/public class TestMainClass/g, 'public class TestMain extends BaseTest'],
            [/assert/gm, 'Assert'],
            [/TestMainClass\.this/gm, 'TestMain.this'],
            [/throw new Exception/g, 'throw new RuntimeException'],
            [/throw e/gm, 'throw new RuntimeException(e)'],

        ])
        // Null-safe Array.isArray (see Helpers.isArrayJs).
        contentIndentend = contentIndentend.replace(/\(([^()]+(?:\([^()]*\))*) instanceof java\.util\.List\) \|\| \(\1\.getClass\(\)\.isArray\(\)\)/g, 'Helpers.isArrayJs($1)');

        const file = [
            'package tests.exchange;',
            'import io.github.ccxt.Helpers;',
            'import io.github.ccxt.Exchange;',
            'import tests.BaseTest;',
            'import io.github.ccxt.errors.*;',
            '',
            this.createGeneratedHeader().join('\n'),
            contentIndentend,
        ].join('\n')

        overwriteFileAndFolder(files.javaFile, file);
    }

    transpileExchangeTests() {
        this.transpileMainTest({
            'tsFile': './ts/src/test/tests.ts',
            'javaFile': BASE_TESTS_FILE,
        });

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

        this.transpileAndSaveJavaExchangeTests(tests);
    }

    transpileWsExchangeTests() {

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
                [/Object exchange(?=[,)])/g, 'Exchange exchange'],
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
            // const namespace = isWs ? 'using ccxt;\nusing ccxt.pro;' : 'using ccxt;';

            const preciseImport = contentIndentend.indexOf('Precise.') >= 0 ? 'import io.github.ccxt.base.Precise;\n' : '';
            const packageName = isWs ? 'tests.exchange.ws' : 'tests.exchange';
            const fileHeaders = [
                `package ${packageName};`,
                'import tests.BaseTest;',
                'import io.github.ccxt.Helpers;',
                'import io.github.ccxt.Exchange;',
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
                    [/public java.util.concurrent.CompletableFuture<Object> /g, 'public static java.util.concurrent.CompletableFuture<Object> '], // make tests static
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

    transpileTests() {
        if (!shouldTranspileTests) {
            log.bright.yellow('Skipping tests transpilation');
            return;
        }
        this.transpileBaseTestsToJava();
        this.transpileExchangeTests();
        this.transpileWsExchangeTests();
    }
}

async function runMain() {
    const ws = process.argv.includes('--ws')
    const baseOnly = process.argv.includes('--baseTests')
    const test = process.argv.includes('--test') || process.argv.includes('--tests')
    const examples = process.argv.includes('--examples');
    const force = process.argv.includes('--force')
    const child = process.argv.includes('--child')
    const multiprocess = process.argv.includes('--multiprocess') || process.argv.includes('--multi')
    const baseClassOnly = process.argv.includes('--baseClass')
    shouldTranspileTests = process.argv.includes('--noTests') ? false : true
    if (!child && !multiprocess) {
        log.bright.green({ force })
    }
    // sign is async only in JS; in Java it is synchronous. The AST transpiler resolves
    // the base Exchange.ts (via `extends Exchange`) and base/functions/rsa.ts (rsa/jwt)
    // to infer return types / async-ness, so those must be sign-synchronous ON DISK
    // while exchanges + wrappers transpile. The top-level process strips them before
    // forking workers and restores them after; child processes inherit the stripped files.
    const syncStripFiles = [ './ts/src/base/Exchange.ts', './ts/src/base/functions/rsa.ts' ];
    const syncStripBackups: { [path: string]: string } = {};
    if (!child) {
        for (const f of syncStripFiles) {
            syncStripBackups[f] = fs.readFileSync (f, 'utf8');
            fs.writeFileSync (f, stripSignAsyncForAst (syncStripBackups[f]));
        }
    }
    try {
        const transpiler = new NewTranspiler();
        if (baseClassOnly) {
            transpiler.transpileBaseMethods('./ts/src/base/Exchange.ts');
        } else if (ws) {
            await transpiler.transpileWS(force)
        } else if (test) {
            transpiler.transpileTests()
        } else if (multiprocess) {
            await parallelizeTranspiling(exchangeIds)
        } else {
            await transpiler.transpileEverything(force, child, baseOnly, examples)
        }
    } finally {
        if (!child) {
            for (const f of Object.keys (syncStripBackups)) {
                fs.writeFileSync (f, syncStripBackups[f]);
            }
        }
    }
}

if (isMainEntry(metaUrl)) {
    await runMain();
}
