import Transpiler from "ast-transpiler";
// "typescript6" is an npm alias for typescript@6 — the last release that ships the JS compiler API (typescript@7 is the native compiler and only provides the tsc binary)
import ts from "typescript6";
import path from 'path'
import errors from "../js/src/base/errors.js"
import { basename, join, resolve } from 'path'
import { createFolderRecursively, replaceInFile, overwriteFile, checkCreateFolder } from './fsLocal.js'
import { writeOverloadStrippedFile, removeOverloadStrippedFile } from './stripOverloads.js'
import { platform } from 'process'
import fs from 'fs'
import log from 'ololog'
import ansi from 'ansicolor'
import {Transpiler as OldTranspiler, parallelizeTranspiling } from "./transpile.js";
import { writeFile } from 'fs/promises';
import errorHierarchy from '../js/src/base/errorHierarchy.js'
import Piscina from 'piscina';
import { isMainEntry } from "./transpile.js";
import { unCamelCase } from "../js/src/base/functions.js";

ansi.nice

type dict = { [key: string]: string }

let exchanges = JSON.parse (fs.readFileSync("./exchanges.json", "utf8"));
const exchangeIds: string[] = exchanges.ids
const predictionIds: string[] = exchanges.prediction || []
const predictionWsIds: string[] = exchanges.predictionWs || []

// @ts-expect-error
const metaUrl = import.meta.url
let __dirname = new URL('.', metaUrl).pathname;

let shouldTranspileTests = true

function overwriteFileAndFolder (path: string, content: string) {
    if (!(fs.existsSync(path))) {
        checkCreateFolder (path);
    }
    overwriteFile (path, content);
    fs.writeFileSync (path, content);
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
// the fine-split moves the 62 symbol-based trading methods onto the concrete `Exchange` tier
// (not BaseExchange), so the sibling PredictionExchange tier does not inherit them
const GLOBAL_TRADING_WRAPPER_FILE = './cs/ccxt/base/Exchange.TradingWrappers.cs';
const BASE_TRADING_METHODS_FILE = './cs/ccxt/base/Exchange.TradingMethods.cs';
const EXCHANGE_WRAPPER_FOLDER = './cs/ccxt/wrappers/'
const EXCHANGE_WS_WRAPPER_FOLDER = './cs/ccxt/exchanges/pro/wrappers/'
const ERRORS_FILE = './cs/ccxt/base/Exchange.Errors.cs';
const BASE_METHODS_FILE = './cs/ccxt/base/Exchange.BaseMethods.cs';
const EXCHANGES_FOLDER = './cs/ccxt/exchanges/';
const EXCHANGES_WS_FOLDER = './cs/ccxt/exchanges/pro/';
const EXCHANGES_PREDICTION_FOLDER = './cs/ccxt/exchanges/prediction/';
const EXCHANGE_PREDICTION_WRAPPER_FOLDER = './cs/ccxt/wrappers/prediction/';
const EXCHANGES_PREDICTION_WS_FOLDER = './cs/ccxt/exchanges/prediction/pro/';
const EXCHANGE_PREDICTION_WS_WRAPPER_FOLDER = './cs/ccxt/exchanges/prediction/pro/wrappers/';
const GENERATED_TESTS_FOLDER = './cs/tests/Generated/Exchange/';
const BASE_TESTS_FOLDER = './cs/tests/Generated/Base';
const BASE_TESTS_FILE =  './cs/tests/Generated/TestMethods.cs';
const EXCHANGE_BASE_FOLDER = './cs/tests/Generated/Exchange/Base/';
const EXCHANGE_GENERATED_FOLDER = './cs/tests/Generated/Exchange/';
const EXAMPLES_INPUT_FOLDER = './examples/ts/';
const EXAMPLES_OUTPUT_FOLDER = './examples/cs/examples/';
const csharpComments: any = {};

class NewTranspiler {

    transpiler!: Transpiler;
    pythonStandardLibraries;
    oldTranspiler = new OldTranspiler();
    // true while transpiling the prediction-market exchanges (ts/src/prediction/),
    // which live in the ccxt.prediction / ccxt.prediction.pro namespaces
    isPrediction = false;

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
            // Match ArrayCache variables and cast to appropriate type based on variable name
            // Order matters: check most specific types first
            [/((?:this\.)?\w*ArrayCacheBySymbolBySide\w*)(\.hashmap)/gm, '($1 as ArrayCacheBySymbolBySide)$2'],
            [/((?:this\.)?\w*ArrayCacheByTimestamp\w*)(\.hashmap)/gm, '($1 as ArrayCacheByTimestamp)$2'],
            [/((?:this\.)?\w*ArrayCacheBySymbolById\w*)(\.hashmap)/gm, '($1 as ArrayCacheBySymbolById)$2'],
            // General ArrayCache pattern (must not match the specific types above)
            [/((?:this\.)?\w+ArrayCache(?!BySymbolBySide|ByTimestamp|BySymbolById)\w*)(\.hashmap)/gm, '($1 as ArrayCache)$2'],
            // Fallback for other variables (keep original behavior for backwards compatibility)
            [/((?:this\.)?\w+)(\.hashmap)/gm, '($1 as ArrayCache)$2'],
            [/(countedBookSide)\.store\(((.+),(.+),(.+))\)/gm, '($1 as IOrderBookSide).store($2)'],
            [/(\w+)\.store\(((.+),(.+),(.+))\)/gm, '($1 as IOrderBookSide).store($2)'],
            [/(\w+)\.store\(((.+),(.+))\)/gm, '($1 as IOrderBookSide).store($2)'],
            [/(\w+)(\.storeArray\(.+\))/gm, '($1 as IOrderBookSide)$2'],
            // [/(.+)\.store\((.+),(.+)\)/gm, '($1 as OrderBookSide).store($2,$3)'],
            [/(\w+)\.call\(this,(.+)\)/gm, 'DynamicInvoker.InvokeMethod($1, new object[] {$2})'],
            [/(\w+)(\.limit\(\))/gm, '($1 as IOrderBook)$2'],
            [/(future)\.resolve\((.*)\)/gm, '($1 as Future).resolve($2)'],
            [/this\.spawn\((this\.\w+),(.+)\)/gm, 'this.spawn($1, new object[] {$2})'],
            [/this\.delay\(([^,]+),([^,]+),(.+)\)/gm, 'this.delay($1, $2, new object[] {$3})'],
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

    regexAll (text: string, array: any[]) {
        for (const i in array) {
            let regex = array[i][0]
            const flags = (typeof regex === 'string') ? 'g' : undefined
            regex = new RegExp (regex, flags)
            text = text.replace (regex, array[i][1])
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
        return`/// <item>
    /// <term>${param.name}</term>
    /// <description>
    /// ${param.type} : ${param.description}
    /// </description>
    /// </item>`
    }

    createCsharpCommentTemplate(name: string, desc: string, see: string[], params : string[], returnType:string, returnDesc: string) {
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
    ${see.map( l => this.createSee(l)).join("\n    ")}
    /// <list type="table">
    ${params.map( p => this.createParam(p)).join("\n    ")}
    /// </list>
    /// </remarks>
    /// <returns> <term>${returnType}</term> ${returnDesc}.</returns>`
    const commentWithoutEmptyLines = comment.replace(/^\s*[\r\n]/gm, "");
    return commentWithoutEmptyLines;
    }

    transformTSCommentIntoCSharp(name: string, desc: string, sees: string[], params : string[], returnType:string, returnDesc: string) {
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
            params.push({type, name, description});
        }
        const returnRegex = /@returns\s{(\w+\[?\]?\[?\]?)}\s(.+)/;
        const returnMatch = comment.match(returnRegex);
        const returnType = returnMatch ? returnMatch[1] : undefined;
        const returnDescription =  returnMatch && returnMatch.length > 1 ? returnMatch[2]: undefined;
        let exchangeData = csharpComments[exchangeName];
        if (!exchangeData) {
            exchangeData = csharpComments[exchangeName] = {}
        }
        let exchangeMethods = csharpComments[exchangeName];
        if (!exchangeMethods) {
            exchangeMethods = {}
        }
        const transformedComment = this.transformTSCommentIntoCSharp(methodName, description, sees,params, returnType, returnDescription);
        exchangeMethods[methodName] = transformedComment;
        csharpComments[exchangeName] = exchangeMethods
        return comment;
    }

    setupTranspiler() {
        this.transpiler = new Transpiler (this.getTranspilerConfig())
        this.transpiler.setVerboseMode(false);
        this.transpiler.csharpTranspiler.transformLeadingComment = this.transformLeadingComment.bind(this);
        // TS >= 5/6 (ast-transpiler 0.0.91) can report dictionary key types like `Str`
        // (string | undefined) as a union whose first member is not the string one.
        // The default printer only inspects the first union member, so dictionary
        // assignments (`result[symbol] = value`) would be wrongly emitted as list index
        // writes (`((List<object>)result)[Convert.ToInt32(symbol)]`). Handle unions
        // containing a string member here (matches the previous TS 4.9 output).
        const csharp = this.transpiler.csharpTranspiler;
        csharp.printElementAccessExpressionExceptionIfAny = (node: any) => {
            const { expression, argumentExpression } = node;
            const parent = node.parent;
            const isLeftSideOfAssignment = parent?.kind === ts.SyntaxKind.BinaryExpression
                && (parent.operatorToken.kind === ts.SyntaxKind.EqualsToken || parent.operatorToken.kind === ts.SyntaxKind.PlusEqualsToken)
                && parent?.left === node;
            if (isLeftSideOfAssignment && csharp.ELEMENT_ACCESS_WRAPPER_OPEN && csharp.ELEMENT_ACCESS_WRAPPER_CLOSE) {
                const type = (global as any).checker.getTypeAtLocation (argumentExpression);
                const isUnion = ((type.flags & ts.TypeFlags.Union) !== 0) && Array.isArray (type.types);
                if (isUnion && type.types.some ((t: any) => csharp.isStringType (t.flags))) {
                    const expressionAsString = csharp.printNode (expression, 0);
                    const argumentAsString = csharp.printNode (argumentExpression, 0);
                    const cast = ts.isStringLiteralLike (argumentExpression) ? '' : '(string)';
                    return `((IDictionary<string,object>)${expressionAsString})[${cast}${argumentAsString}]`;
                }
            }
            return undefined;
        };
    }

    createGeneratedHeader() {
        return [
            "// PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:",
            "// https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code",
            ""
        ]
    }

    getNamespace(ws = false) {
        if (this.isPrediction) {
            return ws ? 'namespace ccxt.prediction.pro;' : 'namespace ccxt.prediction;';
        }
        return ws ? 'namespace ccxt.pro;' : 'namespace ccxt;';
    }

    getCsharpImports(file: any, ws = false) {
        const namespace = this.getNamespace (ws);
        const values = [
            // "using ccxt;",
            namespace,
        ]
        if (this.isPrediction) {
            // prediction exchanges merge REST + WS in one class and need the ws
            // infrastructure types (IOrderBook, ArrayCache, ...) from ccxt.pro
            values.push ("using ccxt.pro;");
        }
        // if (ws) {
        //     values.push("using System.Reflection;");
        // }
        return values;
    }

    isObject(type: string) {
        return (type === 'any') || (type === 'unknown');
    }

    isDictionary(type: string): boolean {
        return (type === 'Object') || (type === 'Dictionary<any>') || (type === 'unknown') || (type === 'Dict') || (type === 'NullableDict') || ((type.startsWith('{')) && (type.endsWith('}')))
    }

    isStringType(type: string) {
        return (type === 'Str') || (type === 'string') || (type === 'StringLiteral') || (type === 'StringLiteralType') || (type.startsWith('"') && type.endsWith('"')) || (type.startsWith("'") && type.endsWith("'"))
    }

    isNumberType(type: string) {
        return (type === 'Num') || (type === 'number') || (type === 'NumericLiteral') || (type === 'NumericLiteralType')
    }

    isIntegerType(type: string) {
        return type !== undefined && (type.toLowerCase() === 'int') ;
    }

    isBooleanType(type: string) {
        return (type === 'boolean') || (type === 'BooleanLiteral') || (type === 'BooleanLiteralType') || (type === 'Bool')
    }

    convertJavascriptTypeToCsharpType(name: string, type: string, isReturn = false): string | undefined {

        // handle watchOrderBook exception here (watchOrderBook and watchOrderBookForSymbols)
        if (name.startsWith('watchOrderBook')) {
            return this.isPrediction ? `Task<ccxt.PredictionOrderBook>` : `Task<ccxt.pro.IOrderBook>`;
        }

        if (name === 'watchOHLCVForSymbols') {
            return `Task<Dictionary<string, Dictionary<string, List<OHLCV>>>>`;
        }

        if (name === 'fetchTime'){
            return `Task<Int64>`; // custom handling for now
        }

        const isPromise = type.startsWith('Promise<') && type.endsWith('>');
        let wrappedType = isPromise ? type.substring(8, type.length - 1) : type;
        let isList = false;

        // TS >= 5/6 (ast-transpiler 0.0.91) infers inline object literal types for
        // methods without an explicit annotation (e.g. `{ info: any; hedged: boolean; }`).
        // Map them to a plain dictionary (matches the previous TS 4.9 output).
        if (wrappedType !== undefined && wrappedType.trim().startsWith('{')) {
            if (wrappedType.trim().endsWith('[]')) {
                isList = true; // e.g. `{ id: Str; ... }[]` → List<Dictionary<string, object>>
            }
            return addTaskIfNeeded('Dictionary<string, object>');
        }

        // TS >= 5/6 (ast-transpiler 0.0.91) infers union return types for methods
        // without an explicit annotation (e.g. `OpenInterest | undefined`, `Dict | Leverage`).
        // Normalize them here: drop undefined/null members and collapse remaining
        // multi-member unions to the first member (matches the previous TS 4.9 output).
        if (wrappedType !== undefined && wrappedType.includes(' | ') && !wrappedType.includes('<')) {
            const members = wrappedType.split(' | ').map (m => m.trim()).filter (m => m !== 'undefined' && m !== 'null' && m !== 'Undefined');
            wrappedType = members.length > 0 ? members[0] : 'object';
        }

        // TS >= 5/6 keeps type alias names (e.g. `Market[]`) instead of expanding them;
        // map the nullable alias back to its concrete interface (matches the previous
        // TS 4.9 output, e.g. `List<MarketInterface>` in the committed wrappers).
        if (wrappedType === 'Market' || wrappedType === 'Market[]') {
            wrappedType = wrappedType.replace ('Market', 'MarketInterface');
        }

        function addTaskIfNeeded(type: string) {
            if (type == 'void') {
                return isPromise ? `Task` : 'void';
            } else if (isList) {
                return isPromise ? `Task<List<${type}>>` : `List<${type}>`;
            }
            return isPromise ? `Task<${type}>` : type;
        }

        const csharpReplacements: dict = {
            'OrderType': 'string',
            'OrderSide': 'string', // tmp
            'fetchEventsParams': 'Dictionary<string, object>', // params bag; surface as a dict
        }

        if (wrappedType === undefined || wrappedType === 'Undefined') {
            return addTaskIfNeeded('object'); // default if type is unknown;
        }

        // `List` is an alias for `Array<any>` (see ts/src/base/types.ts) — normalize it
        // to `any[]` so it flows through the array branch below instead of leaking the
        // bare `List` identifier, which is not a valid C# type without a generic arg.
        if (wrappedType === 'List') {
            wrappedType = 'any[]';
        }

        // Tuple return types like `[Dict, Str]` belong to internal multi-return helpers
        // (e.g. createOrderRequest) that aren't part of the unified API. C# has no inline
        // tuple syntax matching `[A, B]`, so treat them as an untyped array — exactly how
        // they transpiled before being annotated (they were `any[]`). The generated
        // wrapper only needs to compile; these helpers are never called through it.
        if (wrappedType.startsWith('[') && wrappedType.endsWith(']')) {
            wrappedType = 'any[]';
        }

        if (wrappedType === 'string[][]') {
            return addTaskIfNeeded('List<List<string>>');
        }

        // check if returns a list
        if (wrappedType.endsWith('[]')) {
            isList = true;
            wrappedType = wrappedType.substring(0, wrappedType.length - 2);
        }

        if (this.isObject(wrappedType)) {
            if (isReturn) {
                return addTaskIfNeeded('Dictionary<string, object>');
            }
            return addTaskIfNeeded('object');
        }
        if (this.isDictionary(wrappedType)) {
            return addTaskIfNeeded('Dictionary<string, object>');
        }
        if (this.isStringType(wrappedType)) {
            return addTaskIfNeeded('string');
        }
        if (this.isIntegerType(wrappedType)) {
            return addTaskIfNeeded('Int64');
        }
        if (this.isNumberType(wrappedType)) {
            // return addTaskIfNeeded('float');
            return addTaskIfNeeded('double');
        }
        if (this.isBooleanType(wrappedType)) {
            return addTaskIfNeeded('bool');
        }
        if (wrappedType === 'Strings') {
            return addTaskIfNeeded('List<String>')
        }
        if (csharpReplacements[wrappedType] !== undefined) {
            return addTaskIfNeeded(csharpReplacements[wrappedType]);
        }

        if (wrappedType.startsWith('Dictionary<')) {
            let type = wrappedType.substring(11, wrappedType.length - 1);
            if (type.startsWith('Dictionary<')) {
                type = this.convertJavascriptTypeToCsharpType(name, type) as any;
            }
            return addTaskIfNeeded(`Dictionary<string, ${type}>`);
        }

        return addTaskIfNeeded(wrappedType);
    }

    safeCsharpName(name: string): string {
        const csharpReservedWordsReplacement: dict = {
            'params': 'parameters',
            'base': 'baseArg',
        }
        return csharpReservedWordsReplacement[name] || name;
    }

    convertJavascriptParamToCsharpParam(param: any): string | undefined {
        const name = param.name;
        const safeName = this.safeCsharpName(name);
        const isOptional =  param.optional || param.initializer !== undefined;
        const op = isOptional ? '?' : '';
        let paramType: any = undefined;
        
        // Special case for setMarketsFromExchange method — base tier accepts any exchange
        if (name === 'sourceExchange' && param.type === undefined) {
            paramType = 'BaseExchange';
        } else if (param.type == undefined) {
            paramType = 'object';
        } else {
            paramType = this.convertJavascriptTypeToCsharpType(name, param.type);
        }
        const isNonNullableType = this.isNumberType(param.type) || this.isBooleanType(param.type) || this.isIntegerType(param.type);
        if (isNonNullableType) {
            if (isOptional) {
                if (param.initializer !== undefined && param.initializer !== 'undefined') {
                    return `${paramType} ${safeName} = ${param.initializer}`
                } else {
                    if (paramType  === 'bool') {
                        return `${paramType}? ${safeName} = false`
                    }
                    if (paramType === 'double' || paramType  === 'float') {
                        return `${paramType}? ${safeName}2 = 0`
                    }
                    if (paramType  === 'Int64') {
                        return `${paramType}? ${safeName}2 = 0`
                    }
                    return `${paramType}? ${safeName}`
                }
            }
        } else {
            // generated ccxt types (Currencies, MarketInterface, ...) are C# structs (value
            // types) — an optional param can only default to null if declared nullable (CS1750)
            const isStructType = paramType !== 'object' && paramType !== 'string'
                && !paramType.startsWith('List<') && !paramType.startsWith('Dictionary<')
                && paramType !== 'BaseExchange' && paramType !== 'Exchange';
            if (isOptional) {
                if (param.initializer !== undefined) {
                        if (param.initializer === 'undefined' || param.initializer === '{}' || paramType === 'object') {
                            return isStructType ? `${paramType}? ${safeName} = null` : `${paramType} ${safeName} = null`
                        }
                        return `${paramType} ${safeName} = ${param.initializer.replaceAll("'", '"')}`
                }
            } else {
                return `${paramType} ${safeName}`
            }
        }
        return `${paramType}${op} ${safeName}`
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

    createReturnStatement(methodName: string,  unwrappedType:string ) {
        // handle watchOrderBook exception here
        if (methodName.startsWith('watchOrderBook')) {
            // copy first to snapshot the live book, then reshape to the prediction structure for prediction venues
            return this.isPrediction ? `return new ccxt.PredictionOrderBook(((ccxt.pro.IOrderBook) res).Copy());` : `return ((ccxt.pro.IOrderBook) res).Copy();`; // return copy to avoid concurrency issues
        }

        if (methodName === 'watchOHLCVForSymbols') {
            return `return Helper.ConvertToDictionaryOHLCVList(res);`
        }

        // custom handling for now
        if (methodName === 'fetchTime'){
            return `return (Int64)res;`;
        }

        if (unwrappedType === 'double') {
            return `return (double)res;`;
        }

        // handle the typescript type Dict (and its nullable alias from TS >= 5/6 inference)
        if (unwrappedType === 'Dict' || unwrappedType === 'NullableDict') {
            return `return (Dictionary<string, object>)res;`;
        }

        const needsToInstantiate = !unwrappedType.startsWith('List<') && !unwrappedType.startsWith('Dictionary<') && unwrappedType !== 'object' && unwrappedType !== 'string' && unwrappedType !== 'float' && unwrappedType !== 'bool' && unwrappedType !== 'Int64';
        let returnStatement = "";
        if (unwrappedType.startsWith('List<')) {
            if (unwrappedType === 'List<Dictionary<string, object>>') {
                returnStatement = `return ((IList<object>)res).Select(item => (item as Dictionary<string, object>)).ToList();`
            } else if (unwrappedType === 'List<string>' || unwrappedType === 'List<String>') {
                // string is a primitive with no `new string(object)` constructor — cast each element instead
                returnStatement = `return ((IList<object>)res).Select(item => (item as string)).ToList();`
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
            returnStatement =  needsToInstantiate ? `return new ${unwrappedType}(res);` :  `return ((${unwrappedType})res);`;            ;
        }
        return returnStatement;
    }

    getDefaultParamsWrappers(rawParameters: any []) {
        const res: string[] = [];

        rawParameters.forEach(param => {
            const isOptional =  param.optional || param.initializer === 'undefined';
            // const isOptional =  param.optional || param.initializer !== undefined;
            if (isOptional && (this.isIntegerType(param.type) || this.isNumberType(param.type))) {
                const decl =  `${this.inden(2)}var ${param.name} = ${param.name}2 == 0 ? null : (object)${param.name}2;`;
                res.push(decl);
            }
        });

        return res.join("\n");
    }

    inden(level: number) {
        return '    '.repeat(level);
    }

    createWrapper (exchangeName: string, methodWrapper: any, isWs = false) {
        // non-async methods with a declared Promise<T> return type (pure delegators) must be wrapped like async ones
        const isAsync = methodWrapper.async || (methodWrapper.returnType ?? '').startsWith ('Promise');
        const methodName = methodWrapper.name;
        if (!this.shouldCreateWrapper(methodName, isWs)) {
            return ''; // skip aux methods like encodeUrl, parseOrder, etc
        }
        const methodNameCapitalized = methodName.charAt(0).toUpperCase() + methodName.slice(1);
        const returnType = this.convertJavascriptTypeToCsharpType(methodName, methodWrapper.returnType, true);
        const unwrappedType = this.unwrapTaskIfNeeded(returnType as string);
        const args: any[] = methodWrapper.parameters.map((param: any) => this.convertJavascriptParamToCsharpParam(param));
        const stringArgs = args.filter(arg => arg !== undefined).join(', ');
        const params = methodWrapper.parameters.map((param: any) => this.safeCsharpName(param.name)).join(', ');

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
        // in csharp classes should be Capitalized, so I'm creating a wrapper class for each exchange
        const res: string[] = ['// class wrappers'];
        exchangeIds.forEach(exchange => {
            const capitalizedExchange = exchange.charAt(0).toUpperCase() + exchange.slice(1);
            const capitalName = capitalizedExchange.replace('.ts','');
            const constructor = `public ${capitalName}(object args = null) : base(args) { }`
            res.push(`public class  ${capitalName}: ${exchange.replace('.ts','')} { ${constructor} }`)
        });
        return res;
    }

    createCSharpWrappers(exchange:string, path: string, wrappers: any[], ws = false, prediction = false) {
        const wrappersIndented = wrappers.map(wrapper => this.createWrapper(exchange, wrapper, ws)).filter(wrapper => wrapper !== '').join('\n');
        const shouldCreateClassWrappers = exchange === 'BaseExchange';
        const classes = shouldCreateClassWrappers ? this.createExchangesWrappers().filter(e=> !!e).join('\n') : '';
        // const exchangeName = ws ? exchange + 'Ws' : exchange;
        const namespace = this.getNamespace (ws);
        const capitizedName = exchange.charAt(0).toUpperCase() + exchange.slice(1);
        // prediction REST exchanges are not part of createExchangesWrappers (Exchange.Wrappers.cs),
        // so their Capitalized wrapper class is emitted into their own wrapper file
        const needsCapitalizedClass = ws || this.isPrediction;
        const capitalizeStatement = needsCapitalizedClass ? `public class  ${capitizedName}: ${exchange} { public ${capitizedName}(object args = null) : base(args) { } }` : '';
        const file = [
            namespace,
            '',
            this.createGeneratedHeader().join('\n'),
            capitalizeStatement,
            `public partial class ${exchange}`,
            '{',
            wrappersIndented,
            '}',
            classes
        ].join('\n')
        log.magenta ('→', (path as any).yellow)

        overwriteFileAndFolder (path, file);
    }

    transpileErrorHierarchy () {

        const errorHierarchyFilename = './js/src/base/errorHierarchy.js'
        const errorHierarchyPath = __dirname + '/.' + errorHierarchyFilename

        let js = fs.readFileSync (errorHierarchyPath, 'utf8')

        js = this.regexAll (js, [
            // [ /export { [^\;]+\s*\}\n/s, '' ], // new esm
            [ /\s*export default[^\n]+;\n/g, '' ],
            // [ /module\.exports = [^\;]+\;\n/s, '' ], // old commonjs
        ]).trim ()

        const message = 'Transpiling error hierachy →'
        const root = errorHierarchy['BaseError']

        // a helper to generate a list of exception class declarations
        // properly derived from corresponding parent classes according
        // to the error hierarchy

        function intellisense (map: any, parent: any, generate: any, classes: any) {
            function* generator(map: any, parent: any, generate: any, classes: any): any {
                for (const key in map) {
                    yield generate (key, parent, classes)
                    yield* generator (map[key], key, generate, classes)
                }
            }
            return Array.from (generator (map, parent, generate, classes))
        }


        // CSHARP ----------------------------------------------------------------

        // ---------------------------------------------------------------------

        function csharpMakeErrorClassFile (name: string, parent: string) {
            const exception =
`   public class ${name} : ${parent}
    {
        public ${name}() : base() { }
        public ${name}(string message) : base(message) { }
        public ${name}(string message, ${parent} inner) : base(message, inner) { }
    }`;
            return exception
        }

            const csharpBaseError =
`   public class BaseError : Exception
    {
        public BaseError() : base() { }
        public BaseError(string message) : base(message) { }
        public BaseError(string message, Exception inner) : base(message, inner) { }
    }`;

        // const pythonExports = [ 'error_hierarchy', 'BaseError' ]
        const csharpBody = undefined;
        const csharpErrors = intellisense (root as any, 'BaseError', csharpMakeErrorClassFile, undefined)
        const csharpBodyIntellisense = '\nnamespace ccxt;\n' + this.createGeneratedHeader().join('\n') + '\n' + csharpBaseError + '\n' + csharpErrors.join ('\n') + '\n'
        const csharpFile = ""
        if (fs.existsSync (ERRORS_FILE)) {
            log.bright.cyan (message, (ERRORS_FILE as any).yellow)
            // const csharpRegex = /(?<=public partial class Exchange\n{)((.|\n)+)(?=})/g
            // replaceInFile (ERRORS_FILE, csharpRegex, csharpBodyIntellisense)
            overwriteFileAndFolder (ERRORS_FILE, csharpBodyIntellisense)
        }

        log.bright.cyan (message, (ERRORS_FILE as any).yellow)

    }

    // the method names declared directly in the second (`export default class Exchange extends
    // BaseExchange`) class of ts/src/base/Exchange.ts — the 62 symbol-based trading methods that the
    // fine split moved off BaseExchange onto the concrete Exchange tier
    getExchangeTierMethodNames (baseExchangeFile: string): Set<string> {
        const src = fs.readFileSync (baseExchangeFile, 'utf8');
        const markerIdx = src.indexOf ('export default class Exchange extends BaseExchange');
        const names = new Set<string> ();
        if (markerIdx === -1) {
            return names;
        }
        const body = src.substring (markerIdx);
        // top-level (4-space indented) method declarations only; deeper indentation = method bodies
        const re = /^ {4}(?:async\s+)?([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/gm;
        let m;
        while ((m = re.exec (body)) !== null) {
            names.add (m[1]);
        }
        return names;
    }

    // cut a whole transpiled C# method (plus a preceding /** */ doc-comment block, if any) out of
    // `body`, returning the remaining body and the removed method text (for relocation)
    stripCSharpMethod (body: string, name: string): { body: string, method: string } {
        const sigRe = new RegExp ('\\n([ \\t]*)public [^\\n]*\\b' + name + '\\s*\\(');
        const m = sigRe.exec (body);
        if (!m) {
            return { 'body': body, 'method': '' };
        }
        let start = m.index; // the '\n' just before the signature line
        const before = body.substring (0, start);
        const docMatch = before.match (/\n[ \t]*\/\*\*[\s\S]*?\*\/[ \t]*$/);
        if (docMatch) {
            start = docMatch.index as number;
        }
        // brace-match the method body
        let depth = 0;
        let end = body.indexOf ('{', m.index + m[0].length - 1);
        for (; end < body.length; end++) {
            const c = body[end];
            if (c === '{') {
                depth++;
            } else if (c === '}') {
                depth--;
                if (depth === 0) {
                    end++;
                    break;
                }
            }
        }
        const method = body.substring (start, end);
        const newBody = body.substring (0, start) + body.substring (end);
        return { 'body': newBody, 'method': method };
    }

    transpileBaseMethods(baseExchangeFile: string) {
        const csharpExchangeBase = BASE_METHODS_FILE;
        const delimiter = 'METHODS BELOW THIS LINE ARE TRANSPILED FROM TYPESCRIPT'

        // to c#
        // const tsContent = fs.readFileSync (baseExchangeFile, 'utf8');
        // const delimited = tsContent.split (delimiter)
        const strippedBaseFile = writeOverloadStrippedFile (baseExchangeFile);
        const baseFile: any = this.transpiler.transpileCSharpByPath(strippedBaseFile);
        removeOverloadStrippedFile (strippedBaseFile, baseExchangeFile);
        let baseClass = baseFile.content as any;// remove this later

        // the 62 symbol-based trading methods declared in TS `class Exchange extends BaseExchange`
        const exchangeTierNames = this.getExchangeTierMethodNames (baseExchangeFile);
        // methods that TS places in `class Exchange` but which C#'s hand-written BaseExchange WS layer
        // (cs/ccxt/ws/Exchange.WsBridge.cs) depends on, so they must remain reachable from BaseExchange:
        //   loadOrderBook          — hand-written in WsBridge.cs (drop the transpiled copy)
        //   fetchRestOrderBookSafe — called by BaseExchange.loadOrderBook
        //   fetchOrderBook         — called by fetchRestOrderBookSafe (also overridden by every venue)
        const droppedOnBase = [ 'loadOrderBook' ];
        const retainedOnBase = [ 'fetchRestOrderBookSafe', 'fetchOrderBook' ];
        const isExchangeTier = (methodName: string) => exchangeTierNames.has (methodName) && !retainedOnBase.includes (methodName) && !droppedOnBase.includes (methodName);

        // create wrappers with specific types — base-tier wrappers stay on BaseExchange (inherited by
        // both Exchange and the sibling PredictionExchange); the trading-tier wrappers land on the
        // concrete Exchange tier so PredictionExchange does NOT inherit the crypto-typed wrappers
        const allWrapperTypes = baseFile.methodsTypes || [];
        const baseTierWrapperTypes = allWrapperTypes.filter ((w: any) => !isExchangeTier (w.name));
        const exchangeTierWrapperTypes = allWrapperTypes.filter ((w: any) => isExchangeTier (w.name));
        this.createCSharpWrappers('BaseExchange', GLOBAL_WRAPPER_FILE, baseTierWrapperTypes)
        this.createCSharpWrappers('Exchange', GLOBAL_TRADING_WRAPPER_FILE, exchangeTierWrapperTypes)


        // custom transformations needed for c#
        // baseClass = baseClass.replaceAll("client.futures", "getValue(client, \"futures\")"); // tmp fix for c# not needed after ws-merge
        baseClass = baseClass.replace("((object)this).number = String;", "this.number = typeof(String);"); // tmp fix for c#
        baseClass = baseClass.replaceAll("client.resolve", "// client.resolve"); // tmp fix for c#
        baseClass = baseClass.replaceAll("((object)this).number = float;", "this.number = typeof(float);"); // tmp fix for c#
        baseClass = baseClass.replaceAll(/(\w+)(\.storeArray\(.+\))/gm, '($1 as ccxt.pro.IOrderBookSide)$2'); // tmp fix for c#
        
        // Fix setMarketsFromExchange parameter type — typed as BaseExchange so it lives on the base
        // tier (returning `this`) and accepts both Exchange and PredictionExchange source instances
        baseClass = baseClass.replaceAll(/public virtual object setMarketsFromExchange\(object sourceExchange\)/g, 'public virtual BaseExchange setMarketsFromExchange(BaseExchange sourceExchange)');
        // baseClass = baseClass.replace("= new List<Task<List<object>>> {", "= new List<Task<object>> {");
        // baseClass = baseClass.replace("this.number = Number;", "this.number = typeof(float);"); // tmp fix for c#
        baseClass = baseClass.replace("throw new getValue(broad, broadKey)(((string)message));", "this.throwDynamicException(broad, broadKey, message);"); // tmp fix for c#
        baseClass = baseClass.replace("throw new getValue(exact, str)(((string)message));", "this.throwDynamicException(exact, str, message);"); // tmp fix for c#
        // baseClass = baseClass.replace("throw new getValue(exact, str)(message);", "throw new Exception ((string) message);"); // tmp fix for c#


        // WS fixes
        baseClass = baseClass.replace(/\(object client,/gm, '(WebSocketClient client,');
        baseClass = baseClass.replace(/(object \w+) = client\.futures/gm, '$1 = (client as WebSocketClient).futures');

        baseClass = baseClass.replace(/Dictionary<string,object>\)client\.futures/gm, 'Dictionary<string, ccxt.Exchange.Future>)client.futures');
        baseClass = baseClass.replaceAll (/(\b\w*)RestInstance.describe/g, "(\(Exchange\)$1RestInstance).describe");

        const jsDelimiter = '// ' + delimiter
        const parts = baseClass.split (jsDelimiter)
        if (parts.length > 1) {
            const rest = parts[1];
            // parts[1] holds the BaseExchange methods below the delimiter, its closing brace, then the
            // whole transpiled `class Exchange : BaseExchange { ...62 trading methods... }`. Split the
            // two tiers apart: base methods go to Exchange.BaseMethods.cs (partial class BaseExchange),
            // the trading methods to Exchange.TradingMethods.cs (partial class Exchange).
            const exchangeClassMatch = /class Exchange\s*:\s*BaseExchange\s*\{/.exec (rest);
            let baseMethods = rest;
            let exchangeBody = '';
            if (exchangeClassMatch) {
                baseMethods = rest.substring (0, exchangeClassMatch.index); // BaseExchange methods + its closing }
                exchangeBody = rest.substring (exchangeClassMatch.index + exchangeClassMatch[0].length).replace (/\}\s*$/, ''); // Exchange class body
                // drop the hand-written-elsewhere method(s)
                for (const name of droppedOnBase) {
                    exchangeBody = this.stripCSharpMethod (exchangeBody, name).body;
                }
                // relocate the WS-bridge dependency methods back onto BaseExchange
                for (const name of retainedOnBase) {
                    const cut = this.stripCSharpMethod (exchangeBody, name);
                    exchangeBody = cut.body;
                    if (cut.method) {
                        baseMethods = baseMethods.replace (/\}\s*$/, cut.method + '\n}\n');
                    }
                }
            } else {
                // no second class (older single-class layout): keep prior behaviour
                baseMethods = rest.replace (/\s*class Exchange\s*:\s*BaseExchange\s*\{\s*\}\s*$/, '\n');
            }
            const fileHeader = this.getCsharpImports(undefined).concat([
                this.createGeneratedHeader().join('\n'),
                "public partial class BaseExchange\n{\n\n"
            ]).join("\n");
            const file = fileHeader + baseMethods + "\n";
            fs.writeFileSync (csharpExchangeBase, file);
            log.green ('Transpiled base methods to', (csharpExchangeBase as any).yellow)
            if (exchangeClassMatch) {
                const tradingHeader = this.getCsharpImports(undefined).concat([
                    this.createGeneratedHeader().join('\n'),
                    "public partial class Exchange\n{\n\n"
                ]).join("\n");
                const tradingFile = tradingHeader + exchangeBody + "\n}\n";
                fs.writeFileSync (BASE_TRADING_METHODS_FILE, tradingFile);
                log.green ('Transpiled trading methods to', (BASE_TRADING_METHODS_FILE as any).yellow)
            }
        }
    }

    transpilePredictionBaseMethods (predictionBaseFile = './ts/src/base/PredictionExchange.ts') {
        // PredictionExchange is the base class for prediction-market exchanges; it lives
        // in the ccxt namespace (like Exchange) and is transpiled the same way as the base
        const predictionBase = './cs/ccxt/base/PredictionExchange.cs';
        const delimiter = 'METHODS BELOW THIS LINE ARE TRANSPILED FROM TYPESCRIPT'
        const baseFile: any = this.transpiler.transpileCSharpByPath(predictionBaseFile);
        let baseClass = baseFile.content as any;
        baseClass = baseClass.replaceAll(/(\w+)(\.storeArray\(.+\))/gm, '($1 as ccxt.pro.IOrderBookSide)$2');
        const jsDelimiter = '// ' + delimiter
        const parts = baseClass.split (jsDelimiter)
        if (parts.length > 1) {
            const baseMethods = parts[1]
            const fields = [
                '    public PredictionExchange(object args = null) : base(args) {}',
                '',
                '    public object outcomes { get; set; } = null;',
                '    public object outcomes_by_id { get; set; } = null;',
                '    public object events { get; set; } = null;',
                '    public object events_by_slug { get; set; } = null;',
                '    public bool reloadingEvents { get; set; } = false;',
                '    public Task<object> eventsLoading { get; set; } = null;',
                '',
            ].join('\n')
            const fileHeader = this.getCsharpImports(undefined).concat([
                this.createGeneratedHeader().join('\n'),
                "public partial class PredictionExchange : BaseExchange\n{\n\n"
            ]).join("\n");
            // typed wrappers (Task<PredictionTrade> etc.) emitted as a second partial so a prediction
            // venue that does NOT override a unified method still exposes the prediction-typed signature
            // instead of inheriting the crypto-typed wrapper from Exchange.Wrappers.cs
            const prevIsPrediction = this.isPrediction;
            this.isPrediction = true;
            const typedWrappers = (baseFile.methodsTypes || []).map((w: any) => this.createWrapper('PredictionExchange', w)).filter((w: string) => w !== '').join('\n');
            this.isPrediction = prevIsPrediction;
            const wrapperPartial = '\n\npublic partial class PredictionExchange\n{\n' + typedWrappers + '\n}\n';
            const file = fileHeader + fields + baseMethods + "\n" + wrapperPartial;
            fs.writeFileSync (predictionBase, file);
            log.green ('Transpiled prediction base methods to', (predictionBase as any).yellow)
        }
    }

    camelize(str: string) {
        var res =  str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
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

    transpileExamples () {
        return;
        // currently disabled!, the generated code is too complex and illegible
        const transpileFlagPhrase = '// AUTO-TRANSPILE //'

        const allTsExamplesFiles = fs.readdirSync (EXAMPLES_INPUT_FOLDER).filter((f) => f.endsWith('.ts'));
        for (const filenameWithExtenstion of allTsExamplesFiles) {
            const tsFile = path.join (EXAMPLES_INPUT_FOLDER, filenameWithExtenstion)
            let tsContent = fs.readFileSync (tsFile).toString ()
            if (tsContent.indexOf (transpileFlagPhrase) > -1) {
                const fileName = filenameWithExtenstion.replace ('.ts', '')
                log.magenta ('[C#] Transpiling example from', (tsFile as any).yellow)
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

                overwriteFileAndFolder (EXAMPLES_OUTPUT_FOLDER + fileName + '.cs', finalFile);
            }
        }
    }

    async transpileWS(force = false, prediction = false) {
        // prediction WS methods now live in the REST prediction classes (no ts/src/prediction/pro)
        if (prediction && !fs.existsSync ('./ts/src/prediction/pro')) {
            return;
        }
        const tsFolder = prediction ? './ts/src/prediction/pro/' : './ts/src/pro/';

        let inputExchanges =  process.argv.slice (2).filter (x => !x.startsWith ('--'));
        if (inputExchanges === undefined) {
            inputExchanges = exchanges.ws;
        }
        if (prediction && (!inputExchanges || !inputExchanges.length)) {
            inputExchanges = predictionWsIds;
        }
        const csharpFolder = prediction ? EXCHANGES_PREDICTION_WS_FOLDER : EXCHANGES_WS_FOLDER;
        const options = { csharpFolder, exchanges:inputExchanges }
        // const options = { csharpFolder: EXCHANGES_WS_FOLDER, exchanges:['bitget'] }
        this.isPrediction = prediction
        await this.transpileDerivedExchangeFiles (tsFolder, options, '.ts', force, !!(inputExchanges), true )
        this.isPrediction = false
    }

    async transpileEverything (force = false, child = false, baseOnly = false, examplesOnly = false, prediction = false) {

        let exchanges = process.argv.slice (2).filter (x => !x.startsWith ('--'))
        const csharpFolder = prediction ? EXCHANGES_PREDICTION_FOLDER : EXCHANGES_FOLDER
            , tsFolder = prediction ? './ts/src/prediction/' : './ts/src/'
            , exchangeBase = './ts/src/base/Exchange.ts'

        if (!child) {
            createFolderRecursively (csharpFolder)
        }
        const transpilingSingleExchange = (exchanges.length === 1); // when transpiling single exchange, we can skip some steps because this is only used for testing/debugging
        if (transpilingSingleExchange) {
            force = true; // when transpiling single exchange, we always force
        }
        if (prediction) {
            // a scoped run (e.g. a --multi worker chunk of regular exchanges) carries regular
            // ids in argv — the prediction pass must not try to transpile those from
            // ts/src/prediction/ (the files don't exist there); the multi parent transpiles
            // the prediction set itself after the workers finish
            const predictionOnly = exchanges.filter ((x: string) => predictionIds.includes (x))
            if (exchanges.length && !predictionOnly.length) {
                return;
            }
            exchanges = predictionOnly.length ? predictionOnly : predictionIds;
        }
        const options = { csharpFolder, exchanges }

        if (!baseOnly && !examplesOnly) {
            this.isPrediction = prediction
            await this.transpileDerivedExchangeFiles (tsFolder, options, '.ts', force, !!(child || exchanges.length))
            this.isPrediction = false
        }

        if (prediction) {
            // the venues override methods declared in the prediction base — regenerate it
            // in the same pass so a scoped prediction run can't leave the base stale
            this.transpilePredictionBaseMethods ()
            log.bright.green ('Transpiled prediction exchanges successfully.')
            return;
        }

        this.transpileExamples(); // disabled for now

        if (examplesOnly) {
            return;
        }

        if (transpilingSingleExchange) {
            return;
        }
        if (child) {
            return;
        }

        // full builds also transpile the prediction-market exchanges (ts/src/prediction/)
        await this.transpileEverything (force, child, false, false, true)

        this.transpileBaseMethods (exchangeBase)

        this.transpilePredictionBaseMethods ()

        if (baseOnly) {
            return;
        }


        this.transpileTests()

        this.transpileErrorHierarchy ()

        log.bright.green ('Transpiled successfully.')
    }

    async webworkerTranspile (allFiles: any[], parserConfig: any) {

        // create worker
        const piscina = new Piscina({
            filename: resolve(__dirname, 'csharp-worker.js')
        });

        const chunkSize = 20;
        const promises: any = [];
        const now = Date.now();
        for (let i = 0; i < allFiles.length; i += chunkSize) {
            const chunk = allFiles.slice(i, i + chunkSize);
            promises.push(piscina.run({transpilerConfig:parserConfig, files:chunk}));
        }
        const workerResult = await Promise.all(promises);
        const elapsed = Date.now() - now;
        log.green ('[ast-transpiler] Transpiled', allFiles.length, 'files in', elapsed, 'ms');
        const flatResult = workerResult.flat();
        return flatResult;
    }

    async transpilePrediction (force = false) {
        const ws = process.argv.includes ('--ws');
        const tsFolder = ws ? './ts/src/prediction/pro/' : './ts/src/prediction/';
        let inputExchanges = process.argv.slice (2).filter (x => !x.startsWith ('--'));
        if (inputExchanges === undefined || inputExchanges.length === 0) {
            inputExchanges = ws ? exchanges.predictionWs : exchanges.prediction;
        }
        const csharpFolder = ws ? EXCHANGES_PREDICTION_WS_FOLDER : EXCHANGES_PREDICTION_FOLDER;
        const options = { csharpFolder, exchanges: inputExchanges }
        await this.transpileDerivedExchangeFiles (tsFolder, options, '.ts', force, true, ws, true)
    }

    async transpileDerivedExchangeFiles (jsFolder: string, options: any, pattern = '.ts', force = false, child = false, ws = false, prediction = false) {

        // todo normalize jsFolder and other arguments

        // exchanges.json accounts for ids included in exchanges.cfg
        let ids: string[] = []
        try {
            ids = (exchanges as any).ids
        } catch (e) {
        }

        const regex = new RegExp (pattern.replace (/[.*+?^${}()|[\]\\]/g, '\\$&'))

        // let exchanges
        if (options.exchanges && options.exchanges.length) {
            exchanges = options.exchanges.map ((x: string) => x + pattern)
        } else {
            exchanges = fs.readdirSync (jsFolder).filter (file => file.match (regex) && (!ids || ids.includes (basename (file, '.ts'))))
        }

        // transpile using webworker
        const allFilesPath = exchanges.map ((file: string) => jsFolder + file );
        // const transpiledFiles =  await this.webworkerTranspile(allFilesPath, this.getTranspilerConfig());
        log.blue('[csharp] Transpiling [', exchanges.join(', '), ']');
        const transpiledFiles =  allFilesPath.map((file: string) => this.transpiler.transpileCSharpByPath(file));

        if (!ws) {
            const wrapperFolder = this.isPrediction ? EXCHANGE_PREDICTION_WRAPPER_FOLDER : EXCHANGE_WRAPPER_FOLDER;
            for (let i = 0; i < transpiledFiles.length; i++) {
                const transpiled = transpiledFiles[i];
                const exchangeName = exchanges[i].replace('.ts','');
                const path = wrapperFolder + exchangeName + '.cs';
                this.createCSharpWrappers(exchangeName, path, transpiled.methodsTypes)
            }
        } else {
            //
            const wrapperFolder = this.isPrediction ? EXCHANGE_PREDICTION_WS_WRAPPER_FOLDER : EXCHANGE_WS_WRAPPER_FOLDER;
            for (let i = 0; i < transpiledFiles.length; i++) {
                const transpiled = transpiledFiles[i];
                const exchangeName = exchanges[i].replace('.ts','');
                const path = wrapperFolder + exchangeName + '.cs';
                this.createCSharpWrappers(exchangeName, path, transpiled.methodsTypes, true)
            }
        }
        exchanges.map ((file: string, idx: number) => this.transpileDerivedExchangeFile (jsFolder, file, options, transpiledFiles[idx], force, ws, prediction))

        const classes = {}

        return classes
    }

    createCSharpClass(csharpVersion: any, ws = false, prediction = false) {
        const csharpImports = this.getCsharpImports(csharpVersion, ws, prediction).join("\n") + "\n\n";
        let content = csharpVersion.content;

        const baseWsClassRegex = /class\s(\w+)\s+:\s(\w+)/;
        const baseWsClassExec = baseWsClassRegex.exec(content);
        const baseWsClass = baseWsClassExec ? baseWsClassExec[2] : '';
        const restNamespacePrefix = this.isPrediction ? 'ccxt.prediction.' : 'ccxt.';
        if (!ws) {
            // prediction exchanges extend PredictionExchange; both partial declarations
            // (api/ abstract and exchanges/ file) must agree on the base class
            content = content.replace(/class\s(\w+)\s:\s(\w+)/gm, (m, p1, p2) => `public partial class ${p1} : ${(this.isPrediction && p2 === 'Exchange') ? 'PredictionExchange' : p2}`);
        } else {
            const wsParent =  baseWsClass.endsWith('Rest') ? restNamespacePrefix + baseWsClass.replace('Rest', '') : baseWsClass;
            content = content.replace(/class\s(\w+)\s:\s(\w+)/gm, `public partial class $1 : ${wsParent}`);
        }
        content = content.replace(/binaryMessage.byteLength/gm, 'getValue(binaryMessage, "byteLength")'); // idex tmp fix
        // WS fixes
        if (ws) {
            const wsRegexes = this.getWsRegexes();
            content = this.regexAll (content, wsRegexes);
            content = this.replaceImportedRestClasses (content, csharpVersion.imports);
            const classNameRegex = /public\spartial\sclass\s(\w+)\s:\s(\w+)/gm;
            const classNameExec = classNameRegex.exec(content);
            const className = classNameExec ? classNameExec[1] : '';
            const constructorLine = `\npublic partial class ${className} { public ${className}(object args = null) : base(args) { } }\n`
            content = constructorLine  + content;
        } else if (this.isPrediction) {
            // prediction exchanges merge REST + WS in one class, so the WS transforms
            // (client → WebSocketClient, orderbook casts, append/resolve, ...) apply here too
            content = this.regexAll (content, this.getWsRegexes());
        }
        content = this.createGeneratedHeader().join('\n') + '\n' + content;
        return csharpImports + content;
    }

    replaceImportedRestClasses (content: string, imports: any[]) {
        const restNamespacePrefix = this.isPrediction ? 'ccxt.prediction.' : 'ccxt.';
        for (const imp of imports) {
            // { name: "hitbtc", path: "./hitbtc.js", isDefault: true, }
            // { name: "bequantRest", path: "../bequant.js", isDefault: true, }
            const name = imp.name;
            if (name.endsWith('Rest')) {
                content = content.replaceAll(name, restNamespacePrefix + name.replace('Rest', ''));
            }
        }
        return content;
    }

    transpileDerivedExchangeFile (tsFolder: string, filename: string, options: any, csharpResult: any, force = false, ws = false, prediction = false) {

        const tsPath = tsFolder + filename

        const { csharpFolder } = options

        const csharpFilename = filename.replace ('.ts', '.cs')

        const tsMtime = fs.statSync (tsPath).mtime.getTime ()

        const csharp  = this.createCSharpClass (csharpResult, ws, prediction)

        if (csharpFolder) {
            overwriteFileAndFolder (csharpFolder + csharpFilename, csharp)
            // fs.utimesSync (csharpFolder + csharpFilename, new Date (), new Date (tsMtime))
        }
    }

    // ---------------------------------------------------------------------------------------------
    transpileWsOrderbookTestsToCSharp (outDir: string) {

        const jsFile = './ts/src/pro/test/base/test.orderBook.ts';
        const csharpFile = `${outDir}/Ws/test.orderBook.cs`;

        log.magenta ('Transpiling from', (jsFile as any).yellow)

        const csharp = this.transpiler.transpileCSharpByPath(jsFile);
        let content = csharp.content;
        const splitParts = content.split('// --------------------------------------------------------------------------------------------------------------------');
        splitParts.shift();
        content = splitParts.join('\n// --------------------------------------------------------------------------------------------------------------------\n');
        content = this.regexAll (content, [
            [/typeof\((\w+)\)/g,'$1'], // tmp fix
            [/object\s*(\w+)\s=\sgetValue\((\w+),\s*"(bids|asks)".+/g,'var $1 = $2.$3;'], // tmp fix
            [ /object  = functions;/g, '' ], // tmp fix
            [ /\s*public\sobject\sequals(([^}]|\n)+)+}/gm, '' ], // remove equals
            [/assert/g, 'Assert'],
        ]).trim ()

        const contentLines = content.split ('\n');
        const contentIdented = contentLines.map (line => '        ' + line).join ('\n');

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

        log.magenta ('→', (csharpFile as any).yellow)

        overwriteFileAndFolder (csharpFile, file);
    }

    // ---------------------------------------------------------------------------------------------
    transpileWsCacheTestsToCSharp (outDir: string) {

        const jsFile = './ts/src/pro/test/base/test.cache.ts';
        const csharpFile = `${outDir}/Ws/test.cache.cs`;

        log.magenta ('Transpiling from', (jsFile as any).yellow)

        const csharp = this.transpiler.transpileCSharpByPath(jsFile);
        let content = csharp.content;
        const splitParts = content.split('// ----------------------------------------------------------------------------');
        splitParts.shift();
        content = splitParts.join('\n// ----------------------------------------------------------------------------\n');
        content = this.regexAll (content, [
            [/typeof\((\w+)\)/g,'$1'], // tmp fix
            [/typeof\(timestampCache\)/g,'timestampCache'], // tmp fix
            [ /object  = functions;/g, '' ], // tmp fix
            [ /\s*public\sobject\sequals(([^}]|\n)+)+}/gm, '' ], // remove equals
            [/assert/g, 'Assert'],
        ]).trim ()

        const contentLines = content.split ('\n');
        const contentIdented = contentLines.map (line => '        ' + line).join ('\n');

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

        log.magenta ('→', (csharpFile as any).yellow)

        overwriteFileAndFolder (csharpFile, file);
    }

    // ---------------------------------------------------------------------------------------------

    transpileCryptoTestsToCSharp (outDir: string) {

        const jsFile = './ts/src/test/base/test.cryptography.ts';
        const csharpFile = `${outDir}/test.cryptography.cs`;

        log.magenta ('[csharp] Transpiling from', (jsFile as any).yellow)

        const csharp = this.transpiler.transpileCSharpByPath(jsFile);
        let content = csharp.content;
        content = this.regexAll (content, [
            [ /\s*public\sobject\sequals(([^}]|\n)+)+}/gm, '' ], // remove equals
            [/assert/g, 'Assert'],
            // [/(^\s*Assert\(equals\(ecdsa\([^;]+;)/gm, '/*\n $1\nTODO: add ecdsa\n*/'] // temporarily disable ecdsa tests
        ]).trim ()

        const contentLines = content.split ('\n');
        const contentIdented = contentLines.map (line => '        ' + line).join ('\n');


        const file = [
            'using ccxt;',
            'namespace Tests;',
            '',
            this.createGeneratedHeader().join('\n'),
            'public partial class BaseTest',
            '{',
            contentIdented,
            '}',
        ].join('\n')

        log.magenta ('→', (csharpFile as any).yellow)

        overwriteFileAndFolder (csharpFile, file);
    }

    transpileExchangeTest(name: string, path: string): [string, string] {
        const csharp = this.transpiler.transpileCSharpByPath(path);
        let content = csharp.content;

        const parsedName = name.replace('.ts', '');
        const parsedParts = parsedName.split('.');
        const finalName = parsedParts[0] + this.capitalize(parsedParts[1]);

        content = this.regexAll (content, [
            [/assert/g, 'Assert'],
            [/object exchange/g, 'Exchange exchange'],
            [/function test/g, finalName],
        ]).trim ()

        const contentLines = content.split ('\n');
        const contentIdented = contentLines.map (line => '    ' + line).join ('\n');

        const file = [
            'using ccxt;',
            'namespace Tests;',
            'using System;',
            'using System.Collections.Generic;',
            '',
            this.createGeneratedHeader().join('\n'),
            'public partial class BaseTest',
            '{',
            contentIdented,
            '}',
        ].join('\n')
        return [finalName, file];
    }

    async transpileExchangeTestsToCsharp() {
        const inputDir = './ts/src/test/exchange/';
        const outDir = GENERATED_TESTS_FOLDER;
        const ignore = [
            // 'exportTests.ts',
            // 'test.fetchLedger.ts',
            'test.throttler.ts',
            // 'test.fetchOrderBooks.ts', // uses spread operator
        ]

        const inputFiles = fs.readdirSync('./ts/src/test/exchange');
        const files = inputFiles.filter(file => file.match(/\.ts$/)).filter(file => !ignore.includes(file) );
        const transpiledFiles = files.map(file => this.transpileExchangeTest(file, inputDir + file));
        await Promise.all (transpiledFiles.map ((file, idx) => writeFile (outDir + file[0] + '.cs', file[1])));
    }

    transpileBaseTestsToCSharp () {
        const outDir = BASE_TESTS_FOLDER;
        this.transpileBaseTests(outDir);
        this.transpileCryptoTestsToCSharp(outDir);
        this.transpileWsCacheTestsToCSharp(outDir);
        this.transpileWsOrderbookTestsToCSharp(outDir);
    }

    transpileBaseTests (outDir: string) {

        const baseFolders = {
            ts: './ts/src/test/base/',
        };

        let baseFunctionTests = fs.readdirSync (baseFolders.ts).filter(filename => filename.endsWith('.ts')).map(filename => filename.replace('.ts', ''));

        for (const testName of baseFunctionTests) {
            const tsFile = baseFolders.ts + testName + '.ts';
            const tsContent = fs.readFileSync(tsFile).toString();
            if (tsContent.includes ('// NO_AUTO_TRANSPILE')) {
                continue;
            }

            const csharpFile = `${outDir}/${testName}.cs`;

            log.magenta ('Transpiling from', (tsFile as any).yellow)

            const csharp = this.transpiler.transpileCSharpByPath(tsFile);
            let content = csharp.content;
            content = this.regexAll (content, [
                [/object  = functions;/g, '' ], // tmp fix
                [/assert/g, 'Assert'],
                [ /object exchange(?=[,)])/g, 'Exchange exchange' ],
                [ /\s*public\sobject\sequals(([^}]|\n)+)+}/gm, '' ], // remove equals
                [ /testSharedMethods\./gm, '' ], // deepEqual added
                // Match ArrayCache variables and cast to appropriate type based on variable name
                // Order matters: check most specific types first
                [/(\w*ArrayCacheBySymbolBySide\w*)\.hashmap/g, '(($1 as ArrayCacheBySymbolBySide).hashmap)'],
                [/(\w*ArrayCacheByTimestamp\w*)\.hashmap/g, '(($1 as ArrayCacheByTimestamp).hashmap)'],
                [/(\w*ArrayCacheBySymbolById\w*)\.hashmap/g, '(($1 as ArrayCacheBySymbolById).hashmap)'],
                // General ArrayCache pattern (must not match the specific types above)
                [/(\w+ArrayCache(?!BySymbolBySide|ByTimestamp|BySymbolById)\w*)\.hashmap/g, '(($1 as ArrayCache).hashmap)'],
                // Match stored/cached variables
                [/\bstored\.hashmap/g, '((stored as ArrayCache).hashmap)'],
                [/\bcached\.hashmap/g, '((cached as ArrayCache).hashmap)'],
            ]).trim ()

            const contentLines = content.split ('\n');
            const contentIdented = contentLines.map (line => '        ' + line).join ('\n');

            const file = [
                'using ccxt;',
                'using ccxt.pro;',
                'namespace Tests;',
                '',
                this.createGeneratedHeader().join('\n'),
                'public partial class BaseTest',
                '{',
                contentIdented,
                '}',
            ].join('\n')

            log.magenta ('→', (csharpFile as any).yellow)

            overwriteFileAndFolder (csharpFile, file);
        } 
    }

    capitalize(s: string) {
        return s.charAt(0).toUpperCase() + s.slice(1);
    }

    transpileMainTest(files: any) {
        log.magenta ('[csharp] Transpiling from', files.tsFile.yellow)
        let ts = fs.readFileSync (files.tsFile).toString ();

        ts = this.regexAll (ts, [
            [ /\'use strict\';?\s+/g, '' ],
        ])

        const mainContent = ts;
        const csharp = this.transpiler.transpileCSharp(mainContent);
        // let contentIndentend = csharp.content.split('\n').map(line => line ? '    ' + line : line).join('\n');
        let contentIndentend = csharp.content;


        // ad-hoc fixes
        contentIndentend = this.regexAll (contentIndentend, [
            [ /object mockedExchange =/g, 'var mockedExchange =' ],
            // The shared static-test harness holds either a regular Exchange or a prediction
            // PredictionExchange (both extend BaseExchange, as siblings), so type the shared `exchange`
            // variable as the common base and drive the tested method by reflection. The legacy
            // request-builders that call a symbol-trading method (createOrder/fetchTicker) directly are
            // cast back to Exchange below — they run only against regular venues.
            [ /public virtual object initOfflineExchange/g, 'public virtual BaseExchange initOfflineExchange' ],
            [ /object exchange(?=[,)])/g, 'BaseExchange exchange' ],
            [ /object exchange =/g, 'BaseExchange exchange =' ],
            // the main live runner (initExchange (exchangeId, ...)) also serves prediction venues,
            // so it must STAY BaseExchange-typed — only the base-tests literal init is a real Exchange
            [ /BaseExchange exchange = (initExchange\("Exchange"[^;]*\))/g, 'Exchange exchange = ((Exchange)$1)' ],
            [ /BaseExchange exchange = this\.initOfflineExchange\(("[a-z]+")\)/g, 'Exchange exchange = ((Exchange)this.initOfflineExchange($1))' ],
            [ /testReturnResponseHeaders\(BaseExchange exchange\)/g, 'testReturnResponseHeaders(Exchange exchange)' ],
            [ /throw new Error/g, 'throw new Exception' ],
            [/class testMainClass/g, 'public partial class testMainClass'],
        ])

        const file = [
            'using ccxt;',
            'namespace Tests;',
            '',
            this.createGeneratedHeader().join('\n'),
            contentIndentend,
        ].join('\n')

        overwriteFileAndFolder (files.csharpFile, file);
    }

    transpileExchangeTests(){
        this.transpileMainTest({
            'tsFile': './ts/src/test/tests.ts',
            'csharpFile': BASE_TESTS_FILE,
        });

        const baseFolders = {
            ts: './ts/src/test/Exchange/',
            tsBase: './ts/src/test/Exchange/base/',
            csharpBase: EXCHANGE_BASE_FOLDER,
            csharp: EXCHANGE_GENERATED_FOLDER,
        };

        let baseTests = fs.readdirSync (baseFolders.tsBase).filter(filename => filename.endsWith('.ts')).map(filename => filename.replace('.ts', ''));
        const exchangeTests = fs.readdirSync (baseFolders.ts).filter(filename => filename.endsWith('.ts')).map(filename => filename.replace('.ts', ''));

        // ignore throttle test for now
        baseTests = baseTests.filter (filename => filename !== 'test.throttle');

        const tests = [] as any;
        baseTests.forEach (baseTest => {
            tests.push({
                base: true,
                name:baseTest,
                tsFile: baseFolders.tsBase + baseTest + '.ts',
                csharpFile: baseFolders.csharpBase + baseTest + '.cs',
            });
        });
        exchangeTests.forEach (test => {
            tests.push({
                base: false,
                name: test,
                tsFile: baseFolders.ts + test + '.ts',
                csharpFile: baseFolders.csharp + test + '.cs',
            });
        });

        this.transpileAndSaveCsharpExchangeTests (tests);
    }

    transpileWsExchangeTests(){

        const baseFolders = {
            ts: './ts/src/pro/test/Exchange/',
            csharp: EXCHANGE_GENERATED_FOLDER + 'Ws/',
        };

        const wsTests = fs.readdirSync (baseFolders.ts).filter(filename => filename.endsWith('.ts')).map(filename => filename.replace('.ts', ''));

        const tests = [] as any;

        wsTests.forEach (test => {
            tests.push({
                name: test,
                tsFile: baseFolders.ts + test + '.ts',
                csharpFile: baseFolders.csharp + test + '.cs',
            });
        });

        this.transpileAndSaveCsharpExchangeTests (tests, true);
    }

    async transpileAndSaveCsharpExchangeTests(tests: any[], isWs = false) {
        const paths = tests.map(test => test.tsFile);
        const flatResult = await this.webworkerTranspile (paths, this.getTranspilerConfig());
        flatResult.forEach((file, idx) => {
            let contentIndentend = file.content.split('\n').map((line: string) => line ? '    ' + line : line).join('\n');

            let regexes = [
                // REST test functions serve BOTH tiers (regular Exchange and prediction
                // PredictionExchange are siblings under BaseExchange), so type the exchange
                // param as the common base and late-bind the unified-method calls through
                // `dynamic` — the DLR resolves them on the concrete tier at runtime.
                // WS tests only run against regular venues, keep them statically typed.
                [ /object exchange(?=[,)])/g, isWs ? 'Exchange exchange' : 'BaseExchange exchange' ],
                [ /throw new Error/g, 'throw new Exception' ],
                [/testSharedMethods\.assertTimestampAndDatetime\(exchange, skippedProperties, method, orderbook\)/, '// testSharedMethods.assertTimestampAndDatetime (exchange, skippedProperties, method, orderbook)'], // tmp disabling timestamp check on the orderbook
                [ /void function/g, 'void'],
                [/(\w+)\.spawn\(([^,]+),(.+)\)/gm, '$1.spawn($2, new object[] {$3})'],
                // apply 'getPreTranspilationRegexes' here, bcz in CS we don't have pre-transpilation regexes
                [/exchange.jsonStringifyWithNull/g, 'json'],
            ];

            if (!isWs) {
                regexes = regexes.concat([
                    [/await exchange\.(\w+)\(/g, 'await ((dynamic)exchange).$1('],
                ]);
            }

            if (isWs) {
                // add ws-tests specific regeces
                regexes = regexes.concat([
                    [/await exchange.watchOrderBook\(symbol\)/g, '((IOrderBook)(await exchange.watchOrderBook(symbol))).Copy()'],
                    [/await exchange.watchOrderBookForSymbols\((.*?)\)/g, '((IOrderBook)(await exchange.watchOrderBookForSymbols($1))).Copy()'],
                ]);
            }

            contentIndentend = this.regexAll (contentIndentend, regexes)
            const namespace = isWs ? 'using ccxt;\nusing ccxt.pro;' : 'using ccxt;';
            const fileHeaders = [
                namespace,
                'namespace Tests;',
                '',
                this.createGeneratedHeader().join('\n'),
                '',
                'public partial class testMainClass : BaseTest',
                '{',
            ]
            let csharp: string;
            const filename = tests[idx].name;
            if (filename === 'test.sharedMethods') {
                const doubleIndented = contentIndentend.split('\n').map((line: string) => line ? '    ' + line : line).join('\n');
                csharp = [
                    ...fileHeaders,
                    `${this.iden(1)}public partial class SharedMethods`,
                    `${this.iden(1)}{`,
                    doubleIndented,
                    `${this.iden(1)}}`,
                    '}',
                ].join('\n');
            } else {
                contentIndentend = this.regexAll (contentIndentend, [
                    [ /public void/g, 'public static void' ], // make tests static
                    [ /async public Task/g, 'async static public Task' ], // make tests static
                    [ /public object /g, 'public static object ' ],
                ])
                csharp = [
                    ...fileHeaders,
                    contentIndentend,
                    '}',
                ].join('\n');
            }
            overwriteFileAndFolder (tests[idx].csharpFile, csharp);
        });
    }

    transpileTests(){
        if (!shouldTranspileTests) {
            log.bright.yellow ('Skipping tests transpilation');
            return;
        }
        this.transpileBaseTestsToCSharp();
        this.transpileExchangeTests();
        this.transpileWsExchangeTests();
    }
}

async function runMain () {
    const ws = process.argv.includes ('--ws')
    // bare prediction-only ids (e.g. `csharpTranspiler.ts kalshi`) auto-route to the
    // prediction namespace so scoped CI steps don't need to know it
    const cliExchanges = process.argv.slice (2).filter (x => !x.startsWith ('--'))
    const allArePredictionOnly = cliExchanges.length > 0 && cliExchanges.every (x => predictionIds.includes (x) && !exchangeIds.includes (x))
    const prediction = process.argv.includes ('--prediction') || allArePredictionOnly
    const baseOnly = process.argv.includes ('--baseTests')
    const test = process.argv.includes ('--test') || process.argv.includes ('--tests')
    const examples = process.argv.includes ('--examples');
    const force = process.argv.includes ('--force')
    const child = process.argv.includes ('--child')
    const baseClassOnly = process.argv.includes ('--baseClass')
    const multiprocess = process.argv.includes ('--multiprocess') || process.argv.includes ('--multi')
    shouldTranspileTests = process.argv.includes ('--noTests') ? false : true
    if (!child && !multiprocess) {
        log.bright.green ({ force })
    }
    const transpiler = new NewTranspiler ();
    const inputExchanges = process.argv.slice (2).filter (x => !x.startsWith ('--'))
    if (baseClassOnly) {
        transpiler.transpileBaseMethods ('./ts/src/base/Exchange.ts')
        transpiler.transpilePredictionBaseMethods ()
    } else if (ws) {
        if (prediction) {
            await transpiler.transpileWS (force, true)
        } else {
            await transpiler.transpileWS (force)
            if (!inputExchanges.length) {
                // full ws builds also transpile the prediction ws exchanges
                await transpiler.transpileWS (force, true)
            }
        }
    } else if (test) {
        transpiler.transpileTests ()
    } else if (multiprocess) {
        await parallelizeTranspiling (exchangeIds)
        // the prediction exchanges are few — transpile them serially after the workers finish
        await transpiler.transpileEverything (force, false, false, false, true)
    } else {
        await transpiler.transpileEverything (force, child, baseOnly, examples, prediction)
    }
}

if (isMainEntry(metaUrl)) {
    await runMain();
}
