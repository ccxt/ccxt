import Transpiler from "ast-transpiler";
import ts from "typescript";
import path from 'path'
import errors from "../js/src/base/errors.js"
import { basename, join, resolve } from 'path'
import { createFolderRecursively, replaceInFile, overwriteFile, writeFile, checkCreateFolder } from './fsLocal.js'
import { platform } from 'process'
import fs from 'fs'
import log from 'ololog'
import ansi from 'ansicolor'
import {Transpiler as OldTranspiler, parallelizeTranspiling } from "./transpile.js";
import { promisify } from 'util';
import errorHierarchy from '../js/src/base/errorHierarchy.js'
import Piscina from 'piscina';
import { isMainEntry } from "./transpile.js";
import { unCamelCase } from "../js/src/base/functions.js";

ansi.nice
const promisedWriteFile = promisify (fs.writeFile);

let exchanges = JSON.parse (fs.readFileSync("./exchanges.json", "utf8"));
const exchangeIds = exchanges.ids

let __dirname = new URL('.', import.meta.url).pathname;

let shouldTranspileTests = true;

function overwriteFileAndFolder (path, content) {
    if (!(fs.existsSync(path))) {
        checkCreateFolder (path);
    }
    overwriteFile (path, content);
    writeFile (path, content);
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

const GLOBAL_WRAPPER_FILE = './go/v4/base/exchange_wrappers.go';
const EXCHANGE_WRAPPER_FOLDER = './go/v4/'
const DYNAMIC_INSTANCE_FILE = './go/v4/exchange_dynamic.go';
// const EXCHANGE_WS_WRAPPER_FOLDER = './go/v4/exchanges/pro/wrappers/'
const ERRORS_FILE = './go/v4/exchange_errors.go';
const BASE_METHODS_FILE = './go/v4/exchange_generated.go';
const EXCHANGES_FOLDER = './go/v4/';
// const EXCHANGES_WS_FOLDER = './go/v4/exchanges/pro/';
// const GENERATED_TESTS_FOLDER = './go/tests/Generated/Exchange/';
const BASE_TESTS_FOLDER = './go/tests/base';
const BASE_TESTS_FILE =  './go/tests/base/tests.go';
// const EXCHANGE_BASE_FOLDER = './go/tests/Generated/Exchange/Base/';
// const EXCHANGE_GENERATED_FOLDER = './go/tests/Generated/Exchange/';
// const EXAMPLES_INPUT_FOLDER = './examples/ts/';
// const EXAMPLES_OUTPUT_FOLDER = './examples/cs/examples/';
const goComments = {};

const goTypeOptions = {};
const goWithMethods = {};

let goTests: string[] = [];

const VIRTUAL_BASE_METHODS = {
    "cancelOrder": true, // true if the method returns a channel (async in JS)
    "createExpiredOptionMarket": false,
    "createOrder": true,
    "editOrder": true,
    "fetchAccounts": true,
    "fetchBalance": true,
    "fetchClosedOrders": true,
    "fetchDeposits": true,
    "fetchDepositsWithdrawals": true,
    "fetchDepositWithdrawFees": true,
    "fetchFundingInterval": true,
    "fetchFundingIntervals": true,
    "fetchFundingRates": true,
    "fetchL2OrderBook": true,
    "fetchL3OrderBook": true,
    "fetchLeverage": true,
    "fetchLeverages": true,
    "fetchLeverageTiers": true,
    "fetchMarginMode": true,
    "fetchMarginModes": true,
    "fetchMyTrades": true,
    "fetchOHLCV": true,
    "fetchOpenOrders": true,
    "fetchOption": true,
    "fetchOrder": true,
    "fetchOrderBook": true,
    "fetchOrderBooks": true,
    "fetchOrders": true,
    "fetchOrderTrades": true,
    "fetchPositionsHistory": true,
    "fetchStatus": true,
    "fetchTicker": true,
    "fetchTickers": true,
    "fetchTime": true,
    "fetchTrades": true,
    "fetchTransactions": true,
    "fetchWithdrawals": true,
    "parseAccount": false,
    "parseBalance": false,
    "parseBidsAsks": false,
    "parseBorrowInterest": false,
    "parseBorrowRate": false,
    "parseCurrency": false,
    "parseDeposit": false,
    "parseDepositAddress": false,
    "parseDepositStatus": false,
    "parseDepositWithdrawFee": false,
    "parseFundingRate": false,
    "parseFundingRateHistory": false,
    "parseIncome": false,
    "parseLedgerEntry": false,
    "parseLiquidation": false,
    "parseMarginMode": false,
    "parseMarginModification": false,
    "parseMarket": false,
    "parseMarketLeverageTiers": false,
    "parseOHLCV": false,
    "parseOpenInterest": false,
    "parseOption": false,
    "parseOrder": false,
    "parseOrderSide": false,
    "parseOrderStatus": false,
    "parseOrderType": false,
    "parsePosition": false,
    "parseTicker": false,
    "parseTrade": false,
    "parseTransaction": false,
    "parseTransfer": false,
    "parseWithdrawal": false,
    "parseWithdrawalStatus": false,
    "safeMarket": false, // try to remove custom implementations
    "market": false,
    "setSandboxMode": false,
    "parseConversion": false,
    "sign": false
}

class NewTranspiler {

    transpiler: Transpiler;
    pythonStandardLibraries;
    oldTranspiler = new OldTranspiler();

    constructor() {

        this.setupTranspiler()
        // this.transpiler.goharpTranspiler.VAR_TOKEN = 'var'; // tmp fix


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
    customCSharpPropAssignment(node, identation) {
        const stringValue = node.getFullText().trim();
        if (Object.keys(errors).includes(stringValue)) {
            return `typeof(${stringValue})`;
        }
        return undefined;
    }

    // a helper to apply an array of regexes and substitutions to text
    // accepts an array like [ [ regex, substitution ], ... ]

    regexAll (text, array) {
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
            // "go": {
            //     "parser": {
            //         "ELEMENT_ACCESS_WRAPPER_OPEN": "getValue(",
            //         "ELEMENT_ACCESS_WRAPPER_CLOSE": ")",
            //         // "VAR_TOKEN": "var",
            //     }
            // },
        }
    }

    createSee(link: string) {
        return `/// See <see href="${link}"/>  <br/>`
    }

    createParam(param) {
        return`/// <item>
    /// <term>${param.name}</term>
    /// <description>
    /// ${param.type} : ${param.description}
    /// </description>
    /// </item>`
    }

    createGOCommentTemplate(name: string, desc: string, see: string[], params : string[], returnType:string, returnDesc: string) {
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

    transformTSCommentIntoGO(name: string, desc: string, sees: string[], params : string[], returnType:string, returnDesc: string) {
        return this.createGOCommentTemplate(name, desc, sees, params, returnType, returnDesc);
    }

    transformLeadingComment(comment) {
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
        // const commentDescriptionRegex = /@description\s(.+)/;
        // const descriptionMatches = comment.match(commentDescriptionRegex);
        // const description = descriptionMatches ? descriptionMatches[1] : undefined;
        // const seeRegex = /@see\s(.+)/g;
        // const seeMatches = comment.match(seeRegex);
        // const sees: string[] = [];
        // if (seeMatches) {
        //     seeMatches.forEach(match => {
        //         const [, link] = match.split(' ');
        //         sees.push(link);
        //     });
        // }
        // // const paramRegex = /@param\s{(\w+)}\s\[(\w+)\]\s(.+)/g; // @param\s{(\w+)}\s\[((\w+(.\w+)?))\]\s(.+)
        // const paramRegex = /@param\s{(\w+[?]?)}\s\[(\w+\.?\w+?)]\s(.+)/g;
        // const params = [] as any;
        // let paramMatch;
        // while ((paramMatch = paramRegex.exec(comment)) !== null) {
        //     const [, type, name, description] = paramMatch;
        //     params.push({type, name, description});
        // }
        // // const returnRegex = /@returns\s{(\w+\[?\]?\[?\]?)}\s(.+)/;
        // // const returnMatch = comment.match(returnRegex);
        // const returnType = returnMatch ? returnMatch[1] : undefined;
        // const returnDescription =  returnMatch && returnMatch.length > 1 ? returnMatch[2]: undefined;
        let exchangeData = goComments[exchangeName];
        if (!exchangeData) {
            exchangeData = goComments[exchangeName] = {}
        }
        let exchangeMethods = goComments[exchangeName];
        if (!exchangeMethods) {
            exchangeMethods = {}
        }
        // const transformedComment = this.transformTSCommentIntoCSharp(methodName, description, sees,params, returnType, returnDescription);
        exchangeMethods[methodName] = comment;
        goComments[exchangeName] = exchangeMethods
        return comment;
    }

    setupTranspiler() {
        this.transpiler = new Transpiler (this.getTranspilerConfig())
        this.transpiler.setVerboseMode(false);
        this.transpiler.goTranspiler.transformLeadingComment = this.transformLeadingComment.bind(this);
    }

    createGeneratedHeader() {
        return [
            "// PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:",
            "// https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code",
            ""
        ]
    }

    getGoImports(file, ws = false) {
        const namespace = ws ? 'package ccxt' : 'package ccxt';
        const values = [
            // "using ccxt;",
            namespace,
            // 'import "helpers"'
        ]
        // if (ws) {
        //     values.push("using System.Reflection;");
        // }
        return values;
    }

    getCsharpImports(file, ws = false) {
        const namespace = ws ? 'namespace ccxt.pro;' : 'namespace ccxt;';
        const values = [
            // "using ccxt;",
            namespace,
        ]
        // if (ws) {
        //     values.push("using System.Reflection;");
        // }
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
        return type !== undefined && (type.toLowerCase() === 'int') ;
    }

    isBooleanType(type: string) {
        return (type === 'boolean') || (type === 'BooleanLiteral') || (type === 'BooleanLiteralType') || (type === 'Bool')
    }

    convertJavascriptTypeToGoType(name: string, type: string, isReturn = false): string | undefined {

        // handle watchOrderBook exception here (watchOrderBook and watchOrderBookForSymbols)
        if (name.startsWith('watchOrderBook')) {
            return `Task<ccxt.pro.IOrderBook>`;
        }

        if (name === 'fetchTime'){
            return ` <- chan int64`; // custom handling for now
        }

        const isPromise = type.startsWith('Promise<') && type.endsWith('>');
        let wrappedType = isPromise ? type.substring(8, type.length - 1) : type;
        let isList = false;

        function addTaskIfNeeded(type) {
            if (type == 'void') {
                return isPromise ? `<- chan` : '<- chan';
            } else if (isList) {
                return isPromise ? `<- chan []${type}` : `[]${type}`;
            }
            return isPromise ? `<- chan ${type}` : type;
        }

        const csharpReplacements = {
            'OrderType': 'string',
            'OrderSide': 'string', // tmp
        }

        if (wrappedType === undefined || wrappedType === 'Undefined') {
            return addTaskIfNeeded('interface{}'); // default if type is unknown;
        }

        if (wrappedType === 'string[][]') {
            return addTaskIfNeeded('[][]string');
        }

        // check if returns a list
        if (wrappedType.endsWith('[]')) {
            isList = true;
            wrappedType = wrappedType.substring(0, wrappedType.length - 2);
        }

        if (this.isObject(wrappedType)) {
            if (isReturn) {
                return addTaskIfNeeded('map[string]interface{}');
            }
            return addTaskIfNeeded('interface{}');
        }
        if (this.isDictionary(wrappedType)) {
            return addTaskIfNeeded('map[string]interface{}');
        }
        if (this.isStringType(wrappedType)) {
            return addTaskIfNeeded('string');
        }
        if (this.isIntegerType(wrappedType)) {
            return addTaskIfNeeded('int64');
        }
        if (this.isNumberType(wrappedType)) {
            // return addTaskIfNeeded('float');
            return addTaskIfNeeded('float64');
        }
        if (this.isBooleanType(wrappedType)) {
            return addTaskIfNeeded('bool');
        }
        if (wrappedType === 'Strings') {
            return addTaskIfNeeded('[]string')
        }
        if (csharpReplacements[wrappedType] !== undefined) {
            return addTaskIfNeeded(csharpReplacements[wrappedType]);
        }

        if (wrappedType.startsWith('Dictionary<')) {
            let type = wrappedType.substring(11, wrappedType.length - 1);
            if (type.startsWith('Dictionary<')) {
                type = this.convertJavascriptTypeToGoType(name, type) as any;
            }
            return addTaskIfNeeded(`map[string]${type}`);
        }

        return addTaskIfNeeded(wrappedType);
    }

    safeGoName(name: string): string {
        const goReservedWordsReplacement = {
            'type': 'typeVar',
        }
        return goReservedWordsReplacement[name] || name;
    }

    convertParamsToGo(methodName: string, params: any[]): string {
        const needsVariadicOptions = params.some(param => param.optional || param?.initializer !== undefined);
        if (needsVariadicOptions && params.length === 1 && params[0].name === 'params') {
            // handle params = {}
            return 'params ...interface{}';
        }
        const paramsParsed = params.map(param => this.convertJavascriptParamToGoParam(param)).join(', ');
        if (!needsVariadicOptions) {
            return paramsParsed;
        }
        // return paramsParsed;
        const regularParams = params.filter(params => !params.optional && params?.initializer === undefined);
        const regularParamsParsed = regularParams.map(param => this.convertJavascriptParamToGoParam(param));
        // const optionalParams = params.filter(params => params.optional || params?.initializer !== undefined);
        const allParams =  regularParamsParsed.concat(['options ...' + this.capitalize(methodName) + 'Options']);
        return allParams.join(', ');
    }

    convertJavascriptParamToGoParam(param): string | undefined {
        const name = param.name;
        const safeName = this.safeGoName(name);
        const isOptional =  param.optional || param.initializer !== undefined;
        const op = isOptional ? '?' : '';
        let paramType: any = undefined;
        if (param.type == undefined) {
            paramType = 'interface{}';
        } else {
            paramType = this.convertJavascriptTypeToGoType(name, param.type);
        }
        const isNonNullableType = this.isNumberType(param.type) || this.isBooleanType(param.type) || this.isIntegerType(param.type);
        if (isNonNullableType) {
            if (isOptional) {
                // if (param.initializer !== undefined && param.initializer !== 'undefined') {
                return `${safeName} *${paramType}`
                // } else {
                //     if (paramType  === 'bool') {
                //         return `${paramType}? ${safeName} = false`
                //     }
                //     if (paramType === 'double' || paramType  === 'float') {
                //         return `${paramType}? ${safeName}2 = 0`
                //     }
                //     if (paramType  === 'Int64') {
                //         return `${paramType}? ${safeName}2 = 0`
                //     }
                //     return `${safeName} ${paramType}`
                // }
            }
        } else {
            if (isOptional) {
                // if (param.initializer !== undefined) {
                //         if (param.initializer === 'undefined' || param.initializer === '{}' || paramType === 'object') {
                //             return `${paramType} ${safeName} = null`
                //         }
                //         return `${paramType} ${safeName} = ${param.initializer.replaceAll("'", '"')}`
                // }
                return `${safeName} *${paramType}`
            } else {
                return `${safeName} ${paramType}`
            }
        }
        return `${safeName} ${paramType}`
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
            'setProperty',
            'setProxyAgents',
            'watch',
            'watchMultipleSubscription',
            'watchMultiple',
            'watchPrivate',
            'watchPublic',
            'setPositionsCache',
            'setPositionCache',
            'createSpotOrder',
            'createContractOrder',
            'createSwapOrder'
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
        return type.replace('<- chan ', '');
    }

    unwrapListIfNeeded(type: string): string {
        return type.replace('[]', '');
    }

    unwrapDictionaryIfNeeded(type: string): string {
        return type.startsWith('Dictionary<string,') && type.endsWith('>') ? type.substring(19, type.length - 1) : type;
    }

    createReturnStatement(methodName: string,  unwrappedType:string ) {

        // custom handling for now
        if (methodName === 'fetchTime'){
            return `(res).(int64)`;
        }

        // handle the typescript type Dict
        if (unwrappedType === 'Dict' || unwrappedType === 'map[string]interface{}') {
            return `res.(map[string]interface{})`;
        }

        if (unwrappedType === '[]map[string]interface{}') {
            return `res.([]map[string]interface{})`;
        }

        const needsToInstantiate = !unwrappedType.startsWith('List<') && !unwrappedType.startsWith('Dictionary<') && unwrappedType !== 'object' && unwrappedType !== 'string' && unwrappedType !== 'float' && unwrappedType !== 'bool' && unwrappedType !== 'Int64';
        let returnStatement = "";
        if (unwrappedType.startsWith('[]')) {
            const typeWithoutList = this.unwrapListIfNeeded(unwrappedType);
            returnStatement = `New${this.capitalize(typeWithoutList)}Array(res)`;
        } else {
            returnStatement =  needsToInstantiate ? `New${this.capitalize(unwrappedType)}(res)` :  `res.(${unwrappedType})`;            ;
        }
        return returnStatement;
    }

    getDefaultParamsWrappers(name: string, rawParameters) {
        let res: string[] = [];

        const hasOptionalParams = rawParameters.some(param => param.optional || param.initializer !== undefined || param.initializer === 'undefined');
        const isOnlyParams = rawParameters.length === 1 && rawParameters[0].name === 'params';
        const i2 = this.inden(2);
        const i1 = this.inden(1);
        if (hasOptionalParams && !isOnlyParams) {
            const structName = this.capitalize(name) + 'Options';
            const initOptions = [
                '',
                'opts := ' + structName + 'Struct{}',
                '',
                'for _, opt := range options {',
                '    opt(&opts)',
                '}'
            ].map(e => e!='' ? i1 + e : e);
            res = res.concat(initOptions);
        }
        if (!isOnlyParams) {
            rawParameters.forEach(param => {

                const isOptional =  param.optional || param.initializer === 'undefined' || param.initializer !== undefined || param.initializer === '{}';
                // const isOptional =  param.optional || param.initializer !== undefined;
                if (isOptional) {
                    const capName = this.capitalize(param.name);
                    // const decl =  `${this.inden(2)}var ${param.name} = ${param.name}2 == 0 ? null : (object)${param.name}2;`;
                    let decl = `
    var ${this.safeGoName(param.name)} interface{} = nil
    if opts.${capName} != nil {
        ${this.safeGoName(param.name)} = *opts.${capName}
    }`
                res.push(decl);
                }
            });

        }
        return res.join("\n");
    }

    inden(level: number) {
        return '    '.repeat(level);
    }

    createOptionsStruct(methodName: string, params) {
        const capName = this.capitalize(methodName);
        const optionalParams = params.filter(param => param.optional || param.initializer !== undefined || param.initializer === 'undefined' || param.initializer === '{}');
        if (optionalParams.length === 0) {
            return
        }
        if (capName in goTypeOptions) {
            return
        }
        if (params.length === 1 && params[0].name === 'params') {
            return;
        }
        const i1 = this.inden(1);
        const res = [
            'type ' + capName + 'OptionsStruct struct {'
        ];
        for (const param of optionalParams) {
            const name = this.capitalize(param.name);
            const type = this.convertJavascriptTypeToGoType(param.name, param.type);
            const decl = `${i1}${name} *${type}`;
            res.push(decl);
        }

        res.push('}');
        res.push('');
        res.push(`type ${capName}Options func(opts *${capName}OptionsStruct)`);
        const one = this.inden(0);
        const two = this.inden(1);
        const three = this.inden(2);

        // here WithX methods with optional parameters, like withPrice, withSince, withParams, etc
        // example
        // func WithPrice(price float64) CreateOrderOptions {
        //     return func(opts *CreateOrderOptionsStruct) {
        //         opts.Price = &price
        //     }
        // }
        const withMethod = optionalParams.filter(param => param.optional || param.initializer !== undefined).map(param => {
            const name = this.capitalize(param.name);
            const type = this.convertJavascriptTypeToGoType(param.name, param.type);
            const capName = this.capitalize(methodName);
            const structName = capName + 'OptionsStruct';
            return [
                '',
                `${one}func With${capName}${name}(${this.safeGoName(param.name)} ${type}) ${capName}Options {`,
                `${two}return func(opts *${structName}) {`,
                `${three}opts.${name} = &${this.safeGoName(param.name)}`,
                `${two}}`,
                `${one}}`,
                ''
            ].join('\n');
        });
        goTypeOptions[capName] = res.concat(withMethod).join("\n");
    }

    createWrapper (exchangeName, methodWrapper, isWs = false) {
        const isAsync = methodWrapper.async;
        const methodName = methodWrapper.name;
        if (!this.shouldCreateWrapper(methodName, isWs) || !isAsync) {
            return ''; // skip aux methods like encodeUrl, parseOrder, etc
        }
        const methodNameCapitalized = methodName.charAt(0).toUpperCase() + methodName.slice(1);
        const returnType = this.convertJavascriptTypeToGoType(methodName, methodWrapper.returnType, true);
        const unwrappedType = this.unwrapTaskIfNeeded(returnType as string);
        const stringArgs = this.convertParamsToGo(methodName, methodWrapper.parameters);
        this.createOptionsStruct(methodName, methodWrapper.parameters);
        // const stringArgs = args.filter(arg => arg !== undefined).join(', ');
        let params = methodWrapper.parameters.map(param => this.safeGoName(param.name)).join(', ');

        const one = this.inden(0);
        const two = this.inden(1);
        const three = this.inden(2);
        const methodDoc = [] as any[];
        if (goComments[exchangeName] && goComments[exchangeName][methodName]) {
            methodDoc.push(goComments[exchangeName][methodName]);
        }

        let emtpyObject = `${unwrappedType}{}`;
        if (unwrappedType.startsWith('[]')) {
            emtpyObject = 'nil'
        } else if (unwrappedType.includes('int64')) {
            emtpyObject = '-1'
        } else if (unwrappedType === 'string') {
            emtpyObject = '""'
        }

        const defaultParams =  this.getDefaultParamsWrappers(methodName, methodWrapper.parameters)

        if (stringArgs =='params ...interface{}') {
            params = 'params...'
        }

        const body = [
            // `${two}ch:= make(chan ${unwrappedType})`,
            // `${two}go func() {`,
            // `${three}defer close(ch)`,
            // `${three}defer ReturnPanicError(ch)`,
           `${defaultParams}`,
            `${two}res := <- this.Core.${methodNameCapitalized}(${params})`,
            `${two}if IsError(res) {`,
            `${three}return ${emtpyObject}, CreateReturnError(res)`,
            `${two}}`,
            `${two}return ${this.createReturnStatement(methodName, unwrappedType)}, nil`,
            // `${two}}()`,
            // `${two}return ch`,
        ]
        const method = [
            `${one}func (this *${this.capitalize(exchangeName)}) ${methodNameCapitalized}(${stringArgs}) (${unwrappedType}, error) {`,
            ...body,
            // this.getDefaultParamsWrappers(methodNameCapitalized, methodWrapper.parameters),
            // `${two}res := ${isAsync ? '<-' : ''}this.${exchangeName}.${methodNameCapitalized}(${params});`,
            // `${two}${this.createReturnStatement(methodName, unwrappedType)}`,
            `${one}}`
        ];
        // return methodDoc.concat(method).concat(withMethod).filter(e => !!e).join('\n')
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

    createGoWrappers(exchange:string, path: string, wrappers, ws = false) {
        const wrappersIndented = wrappers.map(wrapper => this.createWrapper(exchange, wrapper, ws)).filter(wrapper => wrapper !== '').join('\n');
        const shouldCreateClassWrappers = exchange === 'Exchange';
        const classes = shouldCreateClassWrappers ? this.createExchangesWrappers().filter(e=> !!e).join('\n') : '';
        // const exchangeName = ws ? exchange + 'Ws' : exchange;
        const namespace = 'package ccxt';
        const capitizedName = exchange.charAt(0).toUpperCase() + exchange.slice(1);
        // const capitalizeStatement = ws ? `public class  ${capitizedName}: ${exchange} { public ${capitizedName}(object args = null) : base(args) { } }` : '';
        const exchangeStruct = [
            `type ${capitizedName} struct {`,
            `   *${exchange}`,
            `   Core *${exchange}`,
            `}`
        ].join('\n');

        const newMethod = [
            'func New' + capitizedName + '(userConfig map[string]interface{}) ' + capitizedName + ' {',
            `   p := &${exchange}{}`,
            '   p.Init(userConfig)',
            `   return ${capitizedName}{`,
            `       ${exchange}: p,`,
            `       Core:  p,`,
            `   }`,
            '}'
        ].join('\n');

        const file = [
            namespace,
            '',
            exchangeStruct,
            '',
            newMethod,
            '',
            this.createGeneratedHeader().join('\n'),
            '',
            wrappersIndented,
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

        function intellisense (map, parent, generate, classes) {
            function* generator(map, parent, generate, classes) {
                for (const key in map) {
                    yield generate (key, parent, classes)
                    yield* generator (map[key], key, generate, classes)
                }
            }
            return Array.from (generator (map, parent, generate, classes))
        }

        const errorNames: string[] = [];
        function GoMakeErrorFile (name, parent) {
            errorNames.push(name);
            const exception =
`func ${name}(v ...interface{}) error {
    return NewError("${name}", v...)
}`;
            return exception
        }

        const goErrors = intellisense (root as any, 'BaseError', GoMakeErrorFile, undefined)


        // createError function
        const caseStatements = errorNames.map(error => {
            return`    case "${error}":
        return ${error}(v...)`;
        })

        const functionDecl = `func CreateError(err string, v ...interface{}) error {
    switch err {
${caseStatements.join('\n')}
        default:
            return NewError(err, v...)
    }
}`

    const constStatements = errorNames.map(error => {
        return`   ${error}ErrType ErrorType = "${error}"`;
    })

    const constDecl =` const (
${constStatements.join('\n')}
)`

        const goBodyIntellisense = '\package ccxt\n' + this.createGeneratedHeader().join('\n') + '\n' + goErrors.join ('\n') + '\n' + functionDecl + '\n' + constDecl + '\n';
        if (fs.existsSync (ERRORS_FILE)) {
            log.bright.cyan (message, (ERRORS_FILE as any).yellow)
            overwriteFileAndFolder (ERRORS_FILE, goBodyIntellisense)
        }

        log.bright.cyan (message, (ERRORS_FILE as any).yellow)

    }

    transpileBaseMethods(baseExchangeFile) {
        log.bright.cyan ('Transpiling base methods →', baseExchangeFile.yellow, BASE_METHODS_FILE.yellow)
        const goExchangeBase = BASE_METHODS_FILE;
        const delimiter = 'METHODS BELOW THIS LINE ARE TRANSPILED FROM JAVASCRIPT TO PYTHON AND PHP'

        // to c#
        // const tsContent = fs.readFileSync (baseExchangeFile, 'utf8');
        // const delimited = tsContent.split (delimiter)
        const allVirtual = Object.keys(VIRTUAL_BASE_METHODS);
        this.transpiler.goTranspiler.wrapCallMethods = Object.keys(VIRTUAL_BASE_METHODS);
        const baseFile = this.transpiler.transpileGoByPath(baseExchangeFile);
        this.transpiler.goTranspiler.wrapCallMethods = [];
        let baseClass = baseFile.content as any;// remove this later

        const syncMethods = allVirtual.filter(elem => !VIRTUAL_BASE_METHODS[elem])
        const asyncMethods = allVirtual.filter(elem => VIRTUAL_BASE_METHODS[elem])

        const syncRegex = new RegExp(`<-this\\.callInternal\\("(${syncMethods.join('|')})", (.+)\\)`, 'gm');
        // console.log(syncRegex)
        // baseClass = baseClass.replace(syncRegex, 'this.DerivedExchange.$1($2)');
        baseClass = baseClass.replace(syncRegex, (_match, p1, p2) => {
            const capitalizedMethod = this.capitalize(p1);
            return `this.DerivedExchange.${capitalizedMethod}(${p2})`;
        });

        const asyncRegex = new RegExp(`<-this\\.callInternal\\("(${asyncMethods.join('|')})", (.+)\\)`, 'gm');
        // console.log(asyncRegex)
        // baseClass = baseClass.replace(asyncRegex, '<-this.DerivedExchange.$1($2)');
        baseClass = baseClass.replace(asyncRegex, (_match, p1, p2) => {
            const capitalizedMethod = this.capitalize(p1);
            return `<-this.DerivedExchange.${capitalizedMethod}(${p2})`;
        });
        // create wrappers with specific types
        // this.createCSharpWrappers('Exchange', GLOBAL_WRAPPER_FILE, baseFile.methodsTypes)


        // custom transformations needed for go
        baseClass = baseClass.replaceAll(/\=\snew\s/gm, "= ");
        // baseClass = baseClass.replaceAll(/(?<!<-)this\.callInternal/gm, "<-this.callInternal");
        baseClass = baseClass.replaceAll(/callDynamically\(/gm, 'this.callDynamically(') //fix this on the transpiler
        baseClass = baseClass.replaceAll (/currentRestInstance interface\{\},/g, "currentRestInstance Exchange,");
        baseClass = baseClass.replaceAll (/parentRestInstance interface\{\},/g, "parentRestInstance Exchange,");
        baseClass = baseClass.replaceAll (/client interface\{\},/g, "client Client,");
        baseClass = baseClass.replaceAll (/this.Number = String/g, 'this.Number = "string"');
        baseClass = baseClass.replaceAll(/(\w+)(\.StoreArray\(.+\))/gm, '($1.(*OrderBookSide))$2'); // tmp fix for c#

        // baseClass = baseClass.replaceAll("client.futures", "getValue(client, \"futures\")"); // tmp fix for c# not needed after ws-merge
        // baseClass = baseClass.replace("((object)this).number = String;", "this.number = typeof(String);"); // tmp fix for c#
        // baseClass = baseClass.replaceAll("client.resolve", "// client.resolve"); // tmp fix for c#
        // baseClass = baseClass.replaceAll("((object)this).number = float;", "this.number = typeof(float);"); // tmp fix for c#
        // // baseClass = baseClass.replace("= new List<Task<List<object>>> {", "= new List<Task<object>> {");
        // // baseClass = baseClass.replace("this.number = Number;", "this.number = typeof(float);"); // tmp fix for c#
        // baseClass = baseClass.replace("throw new getValue(broad, broadKey)(((string)message));", "this.throwDynamicException(broad, broadKey, message);"); // tmp fix for c#
        // baseClass = baseClass.replace("throw new getValue(exact, str)(((string)message));", "this.throwDynamicException(exact, str, message);"); // tmp fix for c#
        // // baseClass = baseClass.replace("throw new getValue(exact, str)(message);", "throw new Exception ((string) message);"); // tmp fix for c#


        // // WS fixes
        // baseClass = baseClass.replace(/\(object client,/gm, '(WebSocketClient client,');
        // baseClass = baseClass.replace(/Dictionary<string,object>\)client\.futures/gm, 'Dictionary<string, ccxt.Exchange.Future>)client.futures');
        // baseClass = baseClass.replaceAll (/(\b\w*)RestInstance.describe/g, "(\(Exchange\)$1RestInstance).describe");

        const jsDelimiter = '// ' + delimiter
        const parts = baseClass.split (jsDelimiter)
        if (parts.length > 1) {
            const baseMethods = parts[1]
            const fileHeader = this.getGoImports(undefined).concat([
                this.createGeneratedHeader().join('\n'),
            ]).join("\n");

            const file = fileHeader + baseMethods + "\n";
            fs.writeFileSync (goExchangeBase, file);
        }
    }


    createDynamicInstanceFile(){
        const dynamicInstanceFile = DYNAMIC_INSTANCE_FILE;
        const exchanges = ['Exchange'].concat(exchangeIds);

        const caseStatements = exchanges.map(exchange => {
            return`    case "${exchange}":
        ${exchange}Itf := &${exchange}{}
        ${exchange}Itf.Init(exchangeArgs)
        return ${exchange}Itf, true`;
        })

        const functionDecl = `
func DynamicallyCreateInstance(exchangeId string, exchangeArgs map[string]interface{}) (IExchange, bool) {
    switch exchangeId {
${caseStatements.join('\n')}
        default:
            return nil, false
    }
    return nil, false
}
`
        const file = [
            'package ccxt',
            this.createGeneratedHeader().join('\n'),
            '',
            functionDecl,
        ].join('\n');

        fs.writeFileSync (dynamicInstanceFile, file);
    }

    camelize(str) {
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

                overwriteFileAndFolder (EXAMPLES_OUTPUT_FOLDER + fileName + '.go', finalFile);
            }
        }
    }

    async transpileWS(force = false) {
        const tsFolder = './ts/src/pro/';

        let inputExchanges =  process.argv.slice (2).filter (x => !x.startsWith ('--'));
        if (inputExchanges === undefined) {
            inputExchanges = exchanges.ws;
        }
        const options = { csharpFolder: EXCHANGES_WS_FOLDER, exchanges:inputExchanges }
        // const options = { csharpFolder: EXCHANGES_WS_FOLDER, exchanges:['bitget'] }
        await this.transpileDerivedExchangeFiles (tsFolder, options, '.ts', force, !!(inputExchanges), true )
    }

    async transpileEverything (force = false, child = false, baseOnly = false, examplesOnly = false) {

        const exchanges = process.argv.slice (2).filter (x => !x.startsWith ('--'))
            , csharpFolder = EXCHANGES_FOLDER
            , tsFolder = './ts/src/'
            , exchangeBase = './ts/src/base/Exchange.ts'

        if (!child) {
            createFolderRecursively (csharpFolder)
        }
        const transpilingSingleExchange = (exchanges.length === 1); // when transpiling single exchange, we can skip some steps because this is only used for testing/debugging
        if (transpilingSingleExchange) {
            force = true; // when transpiling single exchange, we always force
        }
        const options = { csharpFolder, exchanges }

        if (!baseOnly && !examplesOnly) {
            await this.transpileDerivedExchangeFiles (tsFolder, options, '.ts', force, !!(child || exchanges.length))
        }

        // this.transpileExamples(); // disabled for now

        if (examplesOnly) {
            return;
        }

        if (transpilingSingleExchange) {
            return;
        }
        if (child) {
            return;
        }

        this.transpileBaseMethods (exchangeBase)
        this.createDynamicInstanceFile();

        if (baseOnly) {
            return;
        }


        this.transpileTests()

        this.transpileErrorHierarchy ()

        log.bright.green ('Transpiled successfully.')
    }

    async webworkerTranspile (allFiles , parserConfig) {

        // create worker
        const piscina = new Piscina({
            filename: resolve(__dirname, 'go-worker.js')
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

    safeOptionsStructFile() {
        const EXCHANGE_OPTIONS_FILE = './go/v4/exchange_wrapper_structs.go';

        const file = [
            'package ccxt',
            this.createGeneratedHeader().join('\n'),
            ''
        ];
        // add simple Options
        file.push('type Options struct {');
        file.push('    Params *map[string]interface{}');
        file.push('}');
        file.push('');

        for (const key in goTypeOptions) {
            const struct = goTypeOptions[key];
            file.push(struct);
            file.push('');
        }

        fs.writeFileSync (EXCHANGE_OPTIONS_FILE, file.join('\n'));
    }

    async transpileDerivedExchangeFiles (jsFolder, options, pattern = '.ts', force = false, child = false, ws = false) {

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
            exchanges = options.exchanges.map (x => x + pattern)
        } else {
            exchanges = fs.readdirSync (jsFolder).filter (file => file.match (regex) && (!ids || ids.includes (basename (file, '.ts'))))
        }

        // exchanges = ['bitmart.ts']
        // transpile using webworker
        const allFilesPath = exchanges.map (file => jsFolder + file );
        // const transpiledFiles =  await this.webworkerTranspile(allFilesPath, this.getTranspilerConfig());
        log.blue('[go] Transpiling [', exchanges.join(', '), ']');
        const transpiledFiles =  allFilesPath.map(file => this.transpiler.transpileGoByPath(file));

        if (!ws) {
            for (let i = 0; i < transpiledFiles.length; i++) {
                const transpiled = transpiledFiles[i];
                const exchangeName = exchanges[i].replace('.ts','');
                const path = EXCHANGE_WRAPPER_FOLDER + exchangeName + '_wrapper.go';
                this.createGoWrappers(exchangeName, path, transpiled.methodsTypes)
            }
        } else {
            //
            for (let i = 0; i < transpiledFiles.length; i++) {
                // const transpiled = transpiledFiles[i];
                // const exchangeName = exchanges[i].replace('.ts','');
                // const path = EXCHANGE_WS_WRAPPER_FOLDER + exchangeName + '.go';
                // this.createCSharpWrappers(exchangeName, path, transpiled.methodsTypes, true)
            }
        }
        exchanges.map ((file, idx) => this.transpileDerivedExchangeFile (jsFolder, file, options, transpiledFiles[idx], force, ws))
        if (exchanges.length > 1) {
            this.safeOptionsStructFile();
        }
        const classes = {}

        return classes
    }

    createGoExchange(className, goVersion, ws = false) {
        const goImports = this.getGoImports(goVersion, ws).join("\n") + "\n\n";
        let content = goVersion.content;

        // const isInheritedExchange = content.indexOf('')

        // const baseWsClassRegex = /class\s(\w+)\s+:\s(\w+)/;
        // const baseWsClassExec = baseWsClassRegex.exec(content);
        // const baseWsClass = baseWsClassExec ? baseWsClassExec[2] : '';

        const classExtends = /type\s\w+\sstruct\s{\s*(\w+)/;
        const matches = content.match(classExtends);
        const baseClass = matches ? matches[1] : '';

        let isAlias = baseClass !== 'Exchange';

        if (!ws) {
            content = content.replace(/func\sNew(\w+)\(\)/g, "func New$1Core()");
            // content = content.replace(/(?<!<-)this\.callInternal/gm, "<-this.callInternal");
            content = content.replace(/base\.(\w+)\(/gm, "this.Exchange.$1(");
            content = content.replace(/base\.Describe/gm, "this.Exchange.Describe");
            content = content.replace(/"\0"/gm, '"\/\/\" + "0"'); // check this later in bl3p
            content = content.replace(/new Precise/gm, "NewPrecise");
            content = content.replace(/var precise interface\{\} = /gm, "precise := ");
            content = content.replace(/var preciseAmount interface\{\} = /gm, "preciseAmount := ");
            content = content.replace(/binaryMessage.ByteLength/gm, 'GetValue(binaryMessage, "byteLength")'); // idex tmp fix
            content = content.replace(/ToString\(precise\)/gm, 'precise.ToString()')
            content = content.replace(/ToString\((precise\w*)\)/gm, '$1.ToString()')
            content = content.replace(/<\-callDynamically/gm, '<-this.callDynamically') //fix this on the transpiler

        } else {
            // const wsParent =  baseWsClass.endsWith('Rest') ? 'ccxt.' + baseWsClass.replace('Rest', '') : baseWsClass;
            // content = content.replace(/class\s(\w+)\s:\s(\w+)/gm, `public partial class $1 : ${wsParent}`);
        }
        // content = content.replace(/binaryMessage.byteLength/gm, 'getValue(binaryMessage, "byteLength")'); // idex tmp fix
        // WS fixes
        if (ws) {
            // const wsRegexes = this.getWsRegexes();
            // content = this.regexAll (content, wsRegexes);
            // content = this.replaceImportedRestClasses (content, csharpVersion.imports);
            // const classNameRegex = /public\spartial\sclass\s(\w+)\s:\s(\w+)/gm;
            // const classNameExec = classNameRegex.exec(content);
            // const className = classNameExec ? classNameExec[1] : '';
            // const constructorLine = `\npublic partial class ${className} { public ${className}(object args = null) : base(args) { } }\n`
            // content = constructorLine  + content;
        }

        if (isAlias) {
            content = content.replace(/this.Exchange.Describe/gm, "this." + baseClass + ".Describe");
        }

        const capitalizedClassName = className.charAt(0).toUpperCase() + className.slice(1);
        let initMethod = '';
        if (!isAlias) {
            initMethod = `
func (this *${className}) Init(userConfig map[string]interface{}) {
    this.Exchange = Exchange{}
    this.Exchange.InitParent(userConfig, this.Describe().(map[string]interface{}), this)
    this.Exchange.DerivedExchange = this
}\n`
        } else {
            initMethod = `
func (this *${className}) Init(userConfig map[string]interface{}) {
    this.${baseClass}.Init(this.DeepExtend(this.Describe(), userConfig))
    this.Itf = this
    this.Exchange.DerivedExchange = this
}\n`
        }

        content = this.createGeneratedHeader().join('\n') + '\n' + content + '\n' +  initMethod;
        return goImports + content;
    }

    replaceImportedRestClasses (content, imports) {
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

    transpileDerivedExchangeFile (tsFolder, filename, options, csharpResult, force = false, ws = false) {

        const tsPath = tsFolder + filename

        const { csharpFolder } = options

        const extensionlessName = filename.replace ('.ts', '')
        const goFilename = filename.replace ('.ts', '.go')

        const tsMtime = fs.statSync (tsPath).mtime.getTime ()

        const csharp  = this.createGoExchange (extensionlessName, csharpResult, ws)

        if (csharpFolder) {
            overwriteFileAndFolder (csharpFolder + goFilename, csharp)
            // fs.utimesSync (csharpFolder + csharpFilename, new Date (), new Date (tsMtime))
        }
    }

    // ---------------------------------------------------------------------------------------------
    transpileWsOrderbookTestsToCSharp (outDir: string) {

        const jsFile = './ts/src/pro/test/base/test.OrderBook.ts';
        const csharpFile = `${outDir}/Orderbook.go`;

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

        const jsFile = './ts/src/pro/test/base/test.Cache.ts';
        const csharpFile = `${outDir}/Cache.go`;

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

    transpileCryptoTestsToGo (outDir: string) {

        const jsFile = './ts/src/test/base/test.cryptography.ts';
        const goFile = `${outDir}/test.cryptography.go`;

        log.magenta ('[go] Transpiling from', (jsFile as any).yellow)

        const csharp = this.transpiler.transpileGoByPath(jsFile);
        let content = csharp.content;
        content = this.regexAll (content, [
            [/new ccxt.Exchange.+\n.+\n.+/gm, 'ccxt.Exchange{}' ],
            [ /func Equals\(.+\n.*\n.*\n.*}/gm, '' ], // remove equals
            // [/(^\s*Assert\(equals\(ecdsa\([^;]+;)/gm, '/*\n $1\nTODO: add ecdsa\n*/'] // temporarily disable ecdsa tests
        ]).trim ()



        const file = [
            'package base',
            this.createGeneratedHeader().join('\n'),
            content
        ].join('\n')

        log.magenta ('→', (goFile as any).yellow)

        overwriteFileAndFolder (goFile, file);
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
        await Promise.all (transpiledFiles.map ((file, idx) => promisedWriteFile (outDir + file[0] + '.go', file[1])))
    }

    transpileBaseTestsToGo () {
        const outDir = BASE_TESTS_FOLDER;
        this.transpileBaseTests(outDir);
        this.transpileCryptoTestsToGo(outDir);
        // this.transpileWsCacheTestsToCSharp(outDir);
        // this.transpileWsOrderbookTestsToCSharp(outDir);
    }

    transpileBaseTests (outDir) {

        const baseFolders = {
            ts: './ts/src/test/base/',
        };

        let baseFunctionTests = fs.readdirSync (baseFolders.ts).filter(filename => filename.endsWith('.ts')).map(filename => filename.replace('.ts', ''));

        for (const testName of baseFunctionTests) {
            const tsFile = baseFolders.ts + testName + '.ts';
            const tsContent = fs.readFileSync(tsFile).toString();
            if (!tsContent.includes ('// AUTO_TRANSPILE_ENABLED')) {
                continue;
            }

            // const goFileName = this.capitalize(testName.replace ('test.', ''));
            const goFile = `${outDir}/${testName}.go`;

            log.magenta ('Transpiling from', (tsFile as any).yellow)

            const go = this.transpiler.transpileGoByPath(tsFile);
            let content = go.content;
            content = this.regexAll (content, [
                [/(\w+) := new ccxt\.Exchange\(([\S\s]+?)\)/gm, '$1 := ccxt.NewExchange().(*ccxt.Exchange); $1.DerivedExchange = $1; $1.InitParent($2, map[string]interface{}{}, $1)' ],
                [/exchange interface\{\}, /g,'exchange *ccxt.Exchange, '], // in arguments
                [/ interface\{\}(?= \= map\[string\]interface\{\} )/g, ' map[string]interface{}'], // fix incorrect variable type
                [ /interface{}\sfunc\sEquals.+\n.*\n.+\n.+/gm, '' ], // remove equals
                [/Precise\.String/gm, 'ccxt.Precise.String'],
                [ /testSharedMethods.AssertDeepEqual/gm, 'AssertDeepEqual' ], // deepEqual added
                [ /func Equals\(.+\n.*\n.*\n.*\}/gm, '' ], // remove equals
                [ /Assert\("GO_SKIP_START"\)[\S\s]+?Assert\("GO_SKIP_END"\)/gm, '' ], // remove equals

            ]).trim ()

            const file = [
                'package base',
                testName.indexOf('tests.init') === -1 ? 'import "github.com/ccxt/ccxt/go/v4"' : '',
                '',
                this.createGeneratedHeader().join('\n'),
                content,
            ].join('\n')

            log.magenta ('→', (goFile as any).yellow)

            goTests.push(this.capitalize(testName));
            overwriteFileAndFolder (goFile, file);
        }
    }

    capitalize(s: string) {
        return s.charAt(0).toUpperCase() + s.slice(1);
    }

    transpileMainTest(files) {
        log.magenta ('[go] Transpiling from', files.tsFile.yellow)
        let ts = fs.readFileSync (files.tsFile).toString ();

        ts = this.regexAll (ts, [
            [ /\'use strict\';?\s+/g, '' ],
        ])

        const mainContent = ts;
        const go = this.transpiler.transpileGo(mainContent);
        let contentIndentend = go.content;


        // ad-hoc fixes
        contentIndentend = this.regexAll (contentIndentend, [
            [/var exchange interface{} =/g,'var exchange ccxt.IExchange ='],
            [/var mockedExchange interface{} =/g,'var mockedExchange ccxt.IExchange ='],
            [/exchange interface\{\},/g, 'exchange ccxt.IExchange,'],
            [/exchange interface\{\}\)/g, 'exchange ccxt.IExchange)'],
            [/exchange.(\w+)\s*=\s*(.+)/g, 'exchange.Set$1($2)'],
            [/exchange\.(\w+)(,|;|\)|\s)/g, 'exchange.Get$1()$2'],
            [/InitOfflineExchange\(exchangeName interface{}\) interface\{\}  {/g, 'InitOfflineExchange(exchangeName interface{}) ccxt.IExchange {'],
            [/assert\(/g, 'Assert('],
            [/GetRootException\(ex\)/g, 'GetRootException(e)'],
            [/OnlySpecificTests \[\]interface\{\}/g, 'OnlySpecificTests interface{} '],
            [ /interface{}\sfunc\sEquals.+\n.*\n.+\n.+/gm, '' ], // remove equals
        ])

        const file = [
            'package base',
            'import "github.com/ccxt/ccxt/go/v4"',
            '',
            this.createGeneratedHeader().join('\n'),
            contentIndentend,
        ].join('\n')

        overwriteFileAndFolder (files.goFile, file);
    }

    transpileExchangeTests(){
        
        // remove above later debug only
        this.transpileMainTest({
            'tsFile': './ts/src/test/tests.ts',
            'goFile': BASE_TESTS_FILE,
        });
        const baseFolders = {
            ts: './ts/src/test/Exchange/',
            tsBase: './ts/src/test/Exchange/base/',
            goBase: './go/tests/base/',
            go: './go/tests/base/',
        };

        let baseTests = fs.readdirSync (baseFolders.tsBase).filter(filename => filename.endsWith('.ts')).map(filename => filename.replace('.ts', ''));
        let exchangeTests = fs.readdirSync (baseFolders.ts).filter(filename => filename.endsWith('.ts')).map(filename => filename.replace('.ts', ''));

        // ignore throttle test for now
        baseTests = baseTests.filter (filename => filename !== 'test.throttle');
        exchangeTests = exchangeTests.filter (filename => filename !== 'test.proxies' &&  filename !== 'test.fetchLastPrices' && filename !== 'test.createOrder');

        const tests = [] as any;
        baseTests.forEach (baseTest => {
            tests.push({
                base: true,
                name:baseTest,
                tsFile: baseFolders.tsBase + baseTest + '.ts',
                goFile: baseFolders.goBase + baseTest + '.go',
            });
        });
        exchangeTests.forEach (test => {
            tests.push({
                base: false,
                name: test,
                tsFile: baseFolders.ts + test + '.ts',
                goFile: baseFolders.go + test + '.go',
            });
        });

        const testNames = tests.map (test => test.name);
        testNames.forEach (test => goTests.push(test));
        this.transpileAndSaveGoExchangeTests (tests);
    }

    transpileWsExchangeTests(){

        // const baseFolders = {
        //     ts: './ts/src/pro/test/Exchange/',
        //     csharp: EXCHANGE_GENERATED_FOLDER + 'Ws/',
        // };

        // const wsTests = fs.readdirSync (baseFolders.ts).filter(filename => filename.endsWith('.ts')).map(filename => filename.replace('.ts', ''));

        // const tests = [] as any;

        // wsTests.forEach (test => {
        //     tests.push({
        //         name: test,
        //         tsFile: baseFolders.ts + test + '.ts',
        //         csharpFile: baseFolders.goharp + test + '.go',
        //     });
        // });

        // this.transpileAndSaveGoExchangeTests (tests, true);
    }

    async transpileAndSaveGoExchangeTests(tests, isWs = false) {
        let paths = tests.map(test => test.tsFile);
        // paths = [paths[30]];
        const flatResult = await this.webworkerTranspile (paths,  this.getTranspilerConfig());
        flatResult.forEach((file, idx) => {
            let contentIndentend = file.content.split('\n').map(line => line ? '    ' + line : line).join('\n');

            let regexes = [
                [/exchange \:\= &ccxt\.Exchange\{\}/g, 'exchange := ccxt.NewExchange()'],
                [/exchange := ccxt\.Exchange\{\}/g, 'exchange := ccxt.NewExchange()'],
                [/exchange interface\{\},/g, 'exchange ccxt.IExchange,'],
                [/exchange interface\{\}\)/g, 'exchange ccxt.IExchange)'],
                [/testSharedMethods\./g, ''],
                [/assert/gm, 'Assert'],
                [/exchange.(\w+)\s*=\s*(.+)/g, 'exchange.Set$1($2)'],
                [/exchange\.(\w+)(,|;|\)|\s)/g, 'exchange.Get$1()$2'],
                [/Precise\./gm, 'ccxt.Precise.'],
                [ /interface{}\sfunc\sEquals.+\n.*\n.+\n.+/gm, '' ], // remove equals
                [ /func Equals\(.+\n.*\n.*\n.*\}/gm, '' ], // remove equals


                // [ /object exchange(?=[,)])/g, 'Exchange exchange' ],
                // [ /throw new Error/g, 'throw new Exception' ],
                // [/testSharedMethods\.assertTimestampAndDatetime\(exchange, skippedProperties, method, orderbook\)/, '// testSharedMethods.assertTimestampAndDatetime (exchange, skippedProperties, method, orderbook)'], // tmp disabling timestamp check on the orderbook
                // [ /void function/g, 'void']
            ];

            // if (isWs) {
            //     // add ws-tests specific regeces
            //     regexes = regexes.concat([
            //         [/await exchange.watchOrderBook\(symbol\)/g, '((IOrderBook)(await exchange.watchOrderBook(symbol))).Copy()'],
            //         [/await exchange.watchOrderBookForSymbols\((.*?)\)/g, '((IOrderBook)(await exchange.watchOrderBookForSymbols($1))).Copy()'],
            //     ]);
            // }

            contentIndentend = this.regexAll (contentIndentend, regexes)
            const namespace = 'package base';
            const fileHeaders = [
                namespace,
                'import "github.com/ccxt/ccxt/go/v4"',
                '',
                this.createGeneratedHeader().join('\n'),
                '',
            ]
            let go: string;
            const filename = tests[idx].name;
            if (filename === 'test.sharedMethods') {
                // const doubleIndented = contentIndentend.split('\n').map(line => line ? '    ' + line : line).join('\n');
                go = [
                    ...fileHeaders,
                    contentIndentend,
                ].join('\n');
            } else {
                contentIndentend = this.regexAll (contentIndentend, [
                    // [ /public void/g, 'public static void' ], // make tests static
                    // [ /async public Task/g, 'async static public Task' ], // make tests static
                ])
                go = [
                    ...fileHeaders,
                    contentIndentend,
                ].join('\n');
            }
            overwriteFileAndFolder (tests[idx].goFile, go);
        });
    }

    transpileTests(){
        if (!shouldTranspileTests) {
            log.bright.yellow ('Skipping tests transpilation');
            return;
        }
        this.transpileBaseTestsToGo();
        this.transpileExchangeTests();
        this.createFunctionsMapFile();
        // this.transpileWsExchangeTests();
    }

    createFunctionsMapFile() {
        // const normalizedTestNames = goTests.map(test => 'Test' + this.capitalize(test.replace('Test.', '').replace('test.', '')) );
        const normalizedTestNames: string[] = [];
        const normalizedFunctionNames: string[] = [];
        for (let test of goTests) {
            const skipTests = [
                "test.sharedMethods",
                "Tests.init",
            ];
            if (skipTests.includes(test)) {
                continue;
            }
            if (test === 'test.ohlcv') {
                test = 'test.OHLCV';
            }
            const methodName = test.replace('Test.', '').replace('test.', '');
            normalizedFunctionNames.push(methodName);
            test = 'Test' + this.capitalize(methodName)
            normalizedTestNames.push(test);
        }
        const file = [
            'package base',
            '',
            this.createGeneratedHeader().join('\n'),
            '',
            'var FunctionsMap = map[string]interface{}{',
            ...normalizedTestNames.map((test,i) => `    "${normalizedFunctionNames[i]}": ${test},`),
            '}',
        ].join('\n');
        overwriteFileAndFolder (BASE_TESTS_FOLDER + '/test.functions.go', file);
}


}

if (isMainEntry(import.meta.url)) {
    const ws = process.argv.includes ('--ws')
    const baseOnly = process.argv.includes ('--baseTests')
    const test = process.argv.includes ('--test') || process.argv.includes ('--tests')
    const examples = process.argv.includes ('--examples');
    const force = process.argv.includes ('--force')
    const child = process.argv.includes ('--child')
    const multiprocess = process.argv.includes ('--multiprocess') || process.argv.includes ('--multi')
    shouldTranspileTests = process.argv.includes ('--noTests') ? false : true
    if (!child && !multiprocess) {
        log.bright.green ({ force })
    }
    const transpiler = new NewTranspiler ();
    if (ws) {
        await transpiler.transpileWS (force)
    } else if (test) {
        transpiler.transpileTests ()
    } else if (multiprocess) {
        parallelizeTranspiling (exchangeIds)
    } else {
        await transpiler.transpileEverything (force, child, baseOnly, examples)
    }
}