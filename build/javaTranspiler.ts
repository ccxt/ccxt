import Transpiler from "ast-transpiler";
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
import { hx11w8BasePinnedListParams } from './hx11w8-base-pinned-list-params.js';
import { hx11w8ObjectValuesListLocals } from './hx11w8-objectvalues-list-local.js';
import { hx11w8JavaParseTyped, hx11w8JavaParseSelfTest, HX11W8_JSPARSE_IMPORT } from './hx11w8-java-parse-typed.js';
import errorHierarchy from '../js/src/base/errorHierarchy.js'
import Piscina from 'piscina';
import os from 'os';
import { execFileSync } from 'child_process';
import { isMainEntry } from "./transpile.js";
import { filterDirtyExchangeFiles, skipUpToDateStage, testStageInputs } from "./transpile.js";
import { unCamelCase } from "../js/src/base/functions.js";
import { ts } from './csharp-local-types.js';
import { nativeJavaJ02ElementReads, j02SelfTest } from './hx10w2-J02.js';
import { nativeJ05CallReceiverReads, j05CallReceiverSelfTest } from './hx10w7-J05.js'; // hx10 wave-7 J05
import { nativeJavaJ05DictChains, j05DictChainsSelfTest } from './hx10w3-J05.js'; // hx10 wave-3 J05
import { installJavaLocalTypes, installJavaNumericLocalTypes, patchJavaLiteralLocalTypes, elementAccessHasStringElements, JAVA_STRING_RETURN_METHODS, JAVA_STRING_PARAM_POSITIONS, javaStringParamPositions, patchJavaConsumerStringCasts, patchJavaMapChannelStringCasts, patchJavaStringReceiverCasts, installJavaDeclaredLocalTypes, installJavaObjectParamPositions, installJavaStringListParamTypes, installJavaNullScalarLocalTypes, javaVenueAsyncReturnTable, javaIsTypedMapDto, patchJavaOmitLocalTypes, patchJavaQualifiedDtoListElementLocals, patchJavaStringAccumulatorLists, patchJavaTupleHolderElementLocals, patchJavaOrderBookCacheLocals, patchJavaDeclaredMapReceiverCasts, patchJavaBaseMapFieldReceiverCasts, nativeJavaLongLimitLocals, patchJavaFreshMapElementWrites, patchJavaDeclaredBoxLiteralEquality, patchJavaObjectKeysLength, patchJavaMapArgIdentity, patchJavaNonNullStringLocals, patchJavaNonNullLongSubtract, installJavaBooleanParams, installJavaStringDefaultParams, installJavaTuplePairReturns, installJavaStringListArgs, installJavaBooleanFixedParams, installJavaBooleanWriteLocals, javaBooleanLocalWrite, installJavaLongSlots, installJavaMapLocals, patchJavaUntilOmitMapWrites, installJavaNativeReplace, installJavaStringReturnSites } from './java-local-types.js';
import { installJavaH2kJ02FreshObjectMapWrites } from './java-local-types.js';
import { nativeJavaEqualTruthy } from './java-local-types.js';
import { h2kJ09NativeSubtractDivideMod } from './java-local-types.js';
import { nativeJavaJ04Arithmetic } from './java-local-types.js';
import { nativeJavaJ20ParamCompare } from './java-local-types.js';
import { nativeJavaJ04Arithmetic, nativeJavaJ23Arithmetic, nativeJavaJ24Arithmetic, nativeJavaJ27Arithmetic, nativeJavaSumLongLocals } from './java-local-types.js';
import { nativeJavaJ31Arithmetic, nativeJavaJ32DivModNeg, nativeJavaJ37DivModNeg } from './java-local-types.js';
import { installH2kJ11StringArgs } from './java-local-types.js';
import { nativeJavaInOp } from './java-local-types.js';
import { nativeJavaJ06FieldOps, j06SelfTest } from './hx10w2-J06.js';
import { j01wsNativeOps, j01wsSelfTest } from './hx10w3-J01.js'; // hx10 wave-3 J01
import { wsMapReads, wsReadsTest } from './hx10w7-OJ06.js'; // hx10w7 OJ06
import { nativeJavaToLongOrNullH2kJ13 } from './java-local-types.js';
import { installJavaNativePadStartFirst, installJ08NativeReplace } from './java-local-types.js';
import { installHx10J04StringHelpers } from './hx10w2-J04.js';
import { installJ10Types } from './java-local-types.js';
import { installJ11MapLocals } from './java-local-types.js';
import { installJ12ParamTypes } from './java-local-types.js';
import { installJ13ListLocals } from './java-local-types.js';
import { installJ14ScalarLocals } from './java-local-types.js';
import { installJ15J12PreScan } from './java-local-types.js';
import { installJ17StringReturns } from './java-local-types.js';
import { installJ03BooleanConditions, nativeJavaJ03Family } from './hx10w2-J03.js'; // hx10 wave-2 J03
import { installJ06TupleAsyncLocals, j06TupleAsyncSelfTest } from './hx10w3-J06.js'; // hx10 wave-3 J06
import { ZERO_REQUIRED_TYPED_WHITELIST } from "./generateJavaWrappers.js";
import { hx10J01ElementWrites, j01ElementWritesSelfTest } from './hx10w2-J01.js';
import { hx10w3J02BalancePuts, j02BalanceSelfTest } from './hx10w3-J02.js';
import { nativeJavaJ04OptionsOps, j04OptionsSelfTest } from './hx10w3-J04.js'; // hx10 w3 J04
import { hx10w4OJ01OptionsOwner, oj01OptionsSelfTest } from './hx10w4-OJ01.js'; // hx10 w4 OJ01
import { nativeJavaBF02FieldOps, bf02SelfTest } from './hx10w4-BF02.js'; // hx10 w4 BF02
import { j01w7FieldPuts, j01w7FieldPutsSelfTest } from './hx10w7-J01.js'; // hx10w7 J01
import { typeCoreReturns, typedReturnTable, JAVA_ASYNC_SUPPLIER, JAVA_ASYNC_SUPPLIER_IMPORT, isAsyncLambdaClose } from "./javaTypedCore.js";
import { applyJavaImports, shortenJavaReferences, ensureJavaImports } from "./javaUtilImports.js";
import { nativeJavaJ05, j05FamilySelfTest } from './hx10w2-J05.js';
import { nativeJavaJ09SwitchBlobs, j09SelfTest } from './hx10w6-J09.js'; // hx10 wave-6 J09
import { j12AsyncThrows, j12SelfTest } from './hx10w7-J12.js'; // hx10 wave-7 J12
import { hx10w10JO01, jo01SelfTest } from './hx10w10-JO01.js'; // hx10 wave-10 JO01
import { hx11w8GetValueBaseReturn, hx11w8GetValueBaseReturnSelfTest } from './hx11w8-getvalue-base-return.js'; // hx11 w8

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
        content = nativeJavaStringAdd(content);
        content = applyJavaImports(path.includes('/java/lib/') ? nativeJavaJ44(nativeJavaJ43(nativeJavaJ42(nativeJavaJ41(nativeJavaJ40(content))))) : content); // hx4 J40
        content = nativeJavaJ06FieldOps(content); // hx10w2 J06
        content = nativeJavaBF02FieldOps(content); // hx10 w4 BF02
        content = nativeJavaJ09SwitchBlobs(content); // hx10 wave-6 J09
        if (path.includes('/java/lib/')) { content = nativeJ05CallReceiverReads(content); } // hx10 wave-7 J05
        content = j12AsyncThrows(content); // hx10 wave-7 J12
        if (path.includes('/java/lib/')) { const typed = hx11w8JavaParseTyped(content); content = typed === content ? content : ensureJavaImports(typed, [ HX11W8_JSPARSE_IMPORT ]); } // hx11w8 parse
        if (path.includes('/java/lib/')) { content = hx11w8PaginationCursorPuts(content); } // hx11 w8 pagination cursor, after the final element-write passes
    }
    overwriteFile(path, content);
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

// `Helpers.callDynamically(x, "<m>", new Object[]{...})` on a local whose declaration (the last one in
// the same member) names a hand-written ws class binds the method that class declares:
// ws/ArrayCache.java `void append(Object)`, ws/WsOrderBook.java `void reset(Object)` / `WsOrderBook limit()`.
const JAVA_WS_NATIVE_METHODS: { [cls: string]: { [method: string]: { argc: number[], value: boolean } } } = {
    'io.github.ccxt.ws.ArrayCache': { 'append': { argc: [1], value: false } },
    'io.github.ccxt.ws.WsOrderBook': { 'reset': { argc: [1], value: false }, 'limit': { argc: [0], value: true } },
    'io.github.ccxt.ws.OrderBookSide': { 'store': { argc: [2, 3], value: false }, 'storeArray': { argc: [1], value: false }, 'limit': { argc: [0], value: false } },
};
const JAVA_MEMBER_START_RE = /^    (?:public|private|protected)\b/;

function javaDeclaredClassOf (lines: string[], lineIndex: number, receiver: string): string | undefined {
    const declaration = new RegExp('^\\s*(?:final\\s+)?([A-Za-z_][\\w.<>]*)\\s+' + receiver + '\\s*(?:=|;)');
    for (let i = lineIndex; i >= 0; i--) {
        const m = declaration.exec(lines[i]);
        if (m) {
            return m[1];
        }
        if (JAVA_MEMBER_START_RE.test(lines[i])) {
            return undefined;
        }
    }
    return undefined;
}

export function nativeJavaWsCacheCalls (content: string): string {
    const lines = content.split('\n');
    const call = /Helpers\.callDynamically\((\w+), "(\w+)", new Object\[\]\{/g;
    let changed = false;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!line.includes('Helpers.callDynamically(')) {
            continue;
        }
        let out = '';
        let cursor = 0;
        call.lastIndex = 0;
        let m;
        while ((m = call.exec(line)) !== null) {
            const cls = javaDeclaredClassOf(lines, i, m[1]);
            const spec = cls !== undefined ? JAVA_WS_NATIVE_METHODS[cls]?.[m[2]] : undefined;
            if (spec === undefined) {
                continue;
            }
            const argsAt = m.index + m[0].length;
            let depth = 1;
            let j = argsAt;
            while (j < line.length && depth > 0) {
                if (line[j] === '{' || line[j] === '(') depth++;
                if (line[j] === '}' || line[j] === ')') depth--;
                j++;
            }
            if (depth !== 0 || line[j] !== ')') {
                continue;
            }
            const args = line.slice(argsAt, j - 1).trim();
            // generic type arguments (`new HashMap<String, Object>()`) carry no top-level comma
            const argc = args === '' ? 0 : splitTopLevelArgs(args.replace(/<[\w.<>?, ]*>/g, '')).length;
            // void methods only in statement position: the helper's Object result is unused there
            const statement = /^\s*$/.test(line.slice(0, m.index)) && /^\s*;/.test(line.slice(j + 1));
            if (!spec.argc.includes(argc) || (!spec.value && !statement)) {
                continue;
            }
            out += line.slice(cursor, m.index) + m[1] + '.' + m[2] + '(' + args + ')';
            cursor = j + 1;
            call.lastIndex = cursor;
        }
        if (cursor > 0) {
            lines[i] = out + line.slice(cursor);
            changed = true;
        }
    }
    return changed ? lines.join('\n') : content;
}

// WsOrderBook.containsKey is true for these keys, so the helper's Map branch is exactly `get`
const JAVA_WS_ORDERBOOK_READ_KEYS = new Set([ 'asks', 'bids', 'timestamp', 'datetime', 'nonce', 'cache' ]);
const JAVA_INT_COUNTER_RE = (name: string) => new RegExp('\\bfor \\((?:var|int) ' + name + ' = ');
const JAVA_ANY_DECLARATION_RE = (name: string) => new RegExp('(?:^|[\\s(,])(?:final\\s+)?[A-Za-z_][\\w.<>?]*(?:<[^;()=]*>)?\\s+' + name + '\\s*(?:=|;|:|,|\\))');

// the nearest declaration of `name` in the same member is a `for (var|int name = ..)` counter (prints int)
function javaIntCounterIndex (lines: string[], lineIndex: number, name: string): boolean {
    const anyDeclaration = JAVA_ANY_DECLARATION_RE(name);
    for (let i = lineIndex; i >= 0; i--) {
        if (anyDeclaration.test(lines[i])) {
            return JAVA_INT_COUNTER_RE(name).test(lines[i]);
        }
        if (JAVA_MEMBER_START_RE.test(lines[i])) {
            return false;
        }
    }
    return false;
}

// `Helpers.getArrayLength(x)` -> `x.size()` / `x.length()` when x is a local declared once in the member as
// List/ArrayList/ArrayCache/String, written only by its non-null initializer; an `Object x = this.sort(..)`
// local read only through the two helpers first takes BaseExchange.sort's declared `java.util.List<String>`
const JAVA_LENGTH_LIST_TYPE_RE = /^(?:java\.util\.)?(?:List|ArrayList)<[\w.<>?, ]+>$|^(?:io\.github\.ccxt\.ws\.)?ArrayCache(?:\.\w+)?$/;
const JAVA_NONNULL_LIST_INIT_RE = /^(?:this\.sort\(|new (?:java\.util\.)?ArrayList<)/;

function javaMemberRange (lines: string[], lineIndex: number): [number, number] {
    let start = lineIndex;
    while (start > 0 && !JAVA_MEMBER_START_RE.test(lines[start])) start--;
    let end = lineIndex + 1;
    while (end < lines.length && !JAVA_MEMBER_START_RE.test(lines[end])) end++;
    return [start, end];
}

export function nativeJavaArrayLength (content: string): string {
    if (!content.includes('Helpers.getArrayLength(')) {
        return content;
    }
    const lines = content.split('\n');
    const ownSort = /^\s+(?:public|protected|private)\b[^=;(]*\ssort\(/m.test(content);
    const call = /Helpers\.getArrayLength\(([A-Za-z_]\w*)\)/g;
    let changed = false;
    for (let i = 0; i < lines.length; i++) {
        if (!lines[i].includes('Helpers.getArrayLength(') || /^\s*(?:\/\/|\*)/.test(lines[i])) {
            continue;
        }
        const before = lines[i];
        lines[i] = before.replace(call, (whole, name) => {
            const [start, end] = javaMemberRange(lines, i);
            const mention = new RegExp('(?<![\\w.$"])' + name + '(?![\\w$])', 'g');
            const declaration = new RegExp('^(\\s*)(?:final\\s+)?([A-Za-z_][\\w.<>?, ]*?)\\s+' + name + '\\s*=\\s*(.*);\\s*(?://.*)?$');
            const write = new RegExp('(?<![\\w.$])' + name + '\\s*(?:[-+*/]?=(?!=)|\\+\\+|--)');
            let at = -1;
            for (let k = start; k < end; k++) {
                if (/^\s*(?:\/\/|\*)/.test(lines[k]) || !mention.test(lines[k])) {
                    mention.lastIndex = 0;
                    continue;
                }
                mention.lastIndex = 0;
                if (declaration.test(lines[k])) {
                    if (at !== -1) return whole;
                    at = k;
                } else if (write.test(lines[k])) {
                    return whole;
                }
            }
            if (at === -1 || at >= i) {
                return whole;
            }
            const [, iden, type, init] = declaration.exec(lines[at])!;
            if (type === 'Object' && !ownSort && init.startsWith('this.sort(')) {
                for (let k = start; k < end; k++) {
                    if (k === at || /^\s*(?:\/\/|\*)/.test(lines[k])) continue;
                    const rest = lines[k].split('Helpers.getArrayLength(' + name + ')').join('').split('Helpers.GetValue(' + name + ', ').join('');
                    if (new RegExp('(?<![\\w.$"])' + name + '(?![\\w$])').test(rest)) return whole;
                }
                lines[at] = lines[at].replace(new RegExp('^' + iden + '(?:final\\s+)?Object\\s+' + name + '\\s*='), iden + 'java.util.List<String> ' + name + ' =');
                return name + '.size()';
            }
            if ((!JAVA_NONNULL_LIST_INIT_RE.test(init) || (ownSort && init.startsWith('this.sort('))) && !(type === 'String' && /^"(?:[^"\\]|\\.)*"$/.test(init))) {
                return whole;
            }
            if (type === 'String') {
                return name + '.length()';
            }
            return JAVA_LENGTH_LIST_TYPE_RE.test(type) ? name + '.size()' : whole;
        });
        changed = changed || lines[i] !== before;
    }
    return changed ? lines.join('\n') : content;
}

// `Helpers.GetValue(x, k)` on a receiver whose printed declaration is `List<Object>` (int literal or int
// counter index) or `WsOrderBook` (a key its containsKey always answers) -> the helper's own branch,
// with its null / out-of-range answers kept explicit; every other receiver keeps the helper
export function nativeJavaDeclaredElementReads (content: string): string {
    const lines = content.split('\n');
    const call = /Helpers\.GetValue\((\w+), (\d+|[A-Za-z_]\w*|"(\w+)")\)/g;
    let changed = false;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!line.includes('Helpers.GetValue(') || /^\s*(?:\/\/|\*)/.test(line)) {
            continue;
        }
        const next = line.replace(call, (whole, receiver, key, literal) => {
            const cls = javaDeclaredClassOf(lines, i, receiver);
            if (cls === 'List<Object>' || cls === 'java.util.List<Object>') {
                if (/^\d+$/.test(key)) {
                    return `(${receiver} == null || ${key} >= ${receiver}.size() ? null : ${receiver}.get(${key}))`;
                }
                if (literal === undefined && javaIntCounterIndex(lines, i, key)) {
                    return `(${receiver} == null || ${key} < 0 || ${key} >= ${receiver}.size() ? null : ${receiver}.get(${key}))`;
                }
                return whole;
            }
            if ((cls === 'io.github.ccxt.ws.WsOrderBook' || cls === 'WsOrderBook') && literal !== undefined && JAVA_WS_ORDERBOOK_READ_KEYS.has(literal)) {
                return `(${receiver} == null ? null : ${receiver}.get(${key}))`;
            }
            return whole;
        });
        if (next !== line) {
            lines[i] = next;
            changed = true;
        }
    }
    return changed ? lines.join('\n') : content;
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
// hand-written above the delimiter of BaseExchange.java with typed Pair returns
const JAVA_HAND_WRITTEN_PAIR_METHODS = [
    'handleOptionStringAndParams', 'handleOptionStringAndParams2', 'handleOptionBoolAndParams', 'handleOptionBoolAndParams2',
    'handleMarginModeAndParams', 'handleMarketTypeAndParams', 'handleSubTypeAndParams', 'handleUntilOption',
];
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

// the raw-text `final Object finalX = x;` hoists and the async-param snapshots are emitted
// as plain text, so no local-type family can re-type them; this pass copies the source
// declaration's own emitted type token onto the hoist — never a cast, never a primitive.
const RETYPE_HOIST_LINE = /^(\s*)final Object (final[A-Za-z0-9_]+) = ([A-Za-z_$][A-Za-z0-9_$]*);$/;
const RETYPE_SNAPSHOT_LINE = /^(\s*)final Object ([A-Za-z_$][A-Za-z0-9_$]*3) = ([A-Za-z_$][A-Za-z0-9_$]*2);$/;
const RETYPE_REFERENCE_TYPES = new Set ([
    'String', 'Long', 'Double', 'Boolean', 'Integer', 'Character',
    'java.lang.String', 'java.lang.Long', 'java.lang.Double', 'java.lang.Boolean',
    'java.lang.Integer', 'java.lang.Character',
]);
const RETYPE_TYPED_CONTAINER = /^(?:java\.util\.)?(?:List|Map|Set)<[A-Za-z0-9_$<>,. ]*>$/;
const RETYPE_MEMBER_BOUNDARY = /^\s*(?:public|private|protected|@)/;
const RETYPE_METHOD_END = /^ {0,4}\}$/;
// audited use shapes — the positions a hoisted name may occupy for the retype to fire: the
// `put` of the anonymous `HashMap<String, Object>` initializer every parse* returns, and the
// async-param snapshot's single widening copy (both fixed-parameter Object positions).
const RETYPE_AUDITED_USE_SHAPES = [
    /^\s*(?:[A-Za-z_$][\w$.]*\s*\.\s*)?put\s*\([^;]*,\s*NAME\s*\)\s*;$/,
    /^\s*(?:final\s+)?Object\s+[A-Za-z_$][\w$]*\s*=\s*NAME\s*;$/,
    // a value line of a multi-line `Helpers.newMap("k", v, ...)` (Object... parameter)
    /^\s*"[^"]*",\s*NAME,?\s*(?:\/\/.*)?$/,
];

// the plain copy shape `Object x = y;` (the async-param inside-wrapper
// `Object symbol = symbol3;` is its dominant instance) and the extended, still cast-free audits.
const RETYPE_COPY_LINE = /^(\s*)Object ([A-Za-z_$][A-Za-z0-9_$]*) = ([A-Za-z_$][A-Za-z0-9_$]*);$/;
// every one of these callees declares an `Object` parameter at the position the hoisted name can
// occupy (BaseExchange.java/Helpers.java/Precise.java read at 5faa2c21), so a narrower static
// argument type cannot move the overload; the receivers themselves are untouched.
const RETYPE_AUDITED_CALLEES = /^(?:(?:java\.util\.)?Objects\.equals|Boolean\.TRUE\.equals|Helpers\.(?:add|isEqual|isGreaterThan|isLessThan|divide|multiply|GetValue|replace|toString|newMap|task)|Precise\.(?:stringAbs|stringMul|stringAdd|stringSub|stringDiv)|(?:java\.util\.)?Arrays\.asList|(?:this|[A-Za-z_$][\w$.]*\.this)\.\w+|\w*(?:\.\w+)*\.put)$/;
// callees whose Java return type is String (BaseExchange.java:8623 symbol, :10911 safeSymbol,
// :1080 numberToString, :1264 iso8601, :1101 safeString, :10697 safeCurrencyCode, :1232 capitalize,
// Helpers.java:521 toString, :797 replace, Precise.stringMul/stringAdd/stringAbs): a write whose
const RETYPE_STRING_RETURN_CALLEES = new Set ([
    'this.symbol', 'this.safeSymbol', 'this.numberToString', 'this.iso8601', 'this.safeString',
    'this.safeCurrencyCode', 'this.capitalize', 'Helpers.toString', 'Helpers.replace',
    'Precise.stringMul', 'Precise.stringAdd', 'Precise.stringAbs',
]);

function retypeReferenceToken (token: string | undefined): string | undefined {
    if (token === undefined) return undefined;
    const t = token.trim ();
    if (t === '' || t === 'Object' || t === 'var') return undefined;
    if (RETYPE_REFERENCE_TYPES.has (t)) return t;
    if (RETYPE_TYPED_CONTAINER.test (t)) return t;
    return undefined;
}

// the member (method) window: a generated file closes a member with a 4-space `}` and opens a
// new one with a `public|private|protected`/`@` line — the convention the final pass below uses

function retypeMemberStart (lines: string[], index: number): number {
    for (let j = index - 1; j >= 0; j--) {
        if (RETYPE_MEMBER_BOUNDARY.test (lines[j]) || RETYPE_METHOD_END.test (lines[j])) return j;
    }
    return -1;
}

function retypeMemberEnd (lines: string[], index: number): number {
    for (let j = index + 1; j < lines.length; j++) {
        if (RETYPE_MEMBER_BOUNDARY.test (lines[j]) || RETYPE_METHOD_END.test (lines[j])) return j - 1;
    }
    return lines.length - 1;
}

function retypeSignatureLine (lines: string[], from: number, to: number): number {
    for (let j = to; j >= from; j--) {
        if (/^\s*(?:public|private|protected)\s+.*\(.*\)/.test (lines[j])) return j;
    }
    return -1;
}

function retypeParameterType (signature: string, name: string): string | undefined {
    const open = signature.indexOf ('(');
    const close = signature.lastIndexOf (')');
    if (open === -1 || close === -1 || close < open) return undefined;
    const params = signature.slice (open + 1, close);
    let depth = 0;
    let start = 0;
    const parts: string[] = [];
    for (let k = 0; k < params.length; k++) {
        const c = params[k];
        if (c === '<' || c === '(' || c === '[') depth++;
        else if (c === '>' || c === ')' || c === ']') depth--;
        else if (c === ',' && depth === 0) { parts.push (params.slice (start, k)); start = k + 1; }
    }
    parts.push (params.slice (start));
    for (const part of parts) {
        const tokens = part.trim ().split (/\s+/);
        if (tokens.length < 2 || tokens[tokens.length - 1] !== name) continue;
        return tokens.slice (0, tokens.length - 1).join (' ').replace (/^final\s+/, '').replace (/\.\.\.$/, '');
    }
    return undefined;
}

// a name mention inside a string/char literal or a comment is not a use —
// `throw new ArgumentsRequired((this.id + " requires a symbol argument"))` must not block.
function retypeCodeOnly (line: string): string {
    let out = '';
    let i = 0;
    let state = 0;
    while (i < line.length) {
        if (state === 1) {
            const j = line.indexOf ('*/', i);
            if (j === -1) return out;
            i = j + 2; state = 0; continue;
        }
        const c = line[i];
        if (line.startsWith ('//', i)) break;
        if (line.startsWith ('/*', i)) {
            const j = line.indexOf ('*/', i + 2);
            if (j === -1) { state = 1; break; }
            i = j + 2; continue;
        }
        if (c === '"') {
            i++;
            while (i < line.length) {
                if (line[i] === '\\') { i += 2; continue; }
                if (line[i] === '"') { i++; break; }
                i++;
            }
            continue;
        }
        if (c === "'") {
            const j = line.indexOf ("'", i + 1);
            if (j !== -1 && j - i <= 3) { i = j + 1; continue; }
            out += c; i++; continue;
        }
        out += c; i++;
    }
    return out;
}

// a mention of local NAME: member accesses (`x.NAME()`) and method calls are other symbols
function retypeMentionRegex (name: string, flags = ''): RegExp {
    return new RegExp (`(?<![\\w$.])${name}\\b(?!\\s*\\()`, flags);
}

// every occurrence of the name must sit in a proven cast-free context: an argument of an
// Object-parameter callee, an operand of a native `+` chain carrying a string literal (the
// printer only emits a native `+` for a proven string concatenation, and JLS 15.18.1 keeps the
function retypeMentionContextsOk (code: string, name: string, token: string | undefined, line: string): boolean {
    const re = retypeMentionRegex (name, 'g');
    let m: RegExpExecArray | null;
    while ((m = re.exec (code)) !== null) {
        const pre = code.slice (0, m.index);
        let depth = 0;
        let callee: string | undefined = undefined;
        for (let k = pre.length - 1; k >= 0; k--) {
            const c = pre[k];
            if (c === ')') depth++;
            else if (c === '(') {
                if (depth === 0) {
                    const head = pre.slice (0, k).trim ().match (/([\w$.]+)\s*$/);
                    callee = head !== null ? head[1] : undefined;
                    break;
                }
                depth--;
            }
        }
        if (callee !== undefined && RETYPE_AUDITED_CALLEES.test (callee)) continue;
        const adjacentPlus = /\+\s*$/.test (pre) || /^\s*\+/.test (code.slice (m.index + name.length));
        if (adjacentPlus && /"/.test (line)) continue;
        // `(T) name` or the printer's parenthesised `(T) (name)`
        const wrapped = /^\s*\)/.test (code.slice (m.index + name.length));
        const cast = pre.match (/\(([\w$.<>, ]+)\)\s*$/) ?? (wrapped ? pre.match (/\(([\w$.<>, ]+)\)\s*\(\s*$/) : null);
        if (cast !== null && (cast[1].trim () === (token ?? '') || cast[1].trim () === 'Object' || cast[1].trim () === 'java.lang.Object')) continue;
        return false;
    }
    return true;
}

// the write whitelist of the non-final copy shape: every later `NAME = <value>` must produce a
// value the declared token can hold without a cast.
function retypeWrittenValueMatches (rhs: string, token: string): boolean {
    const value = rhs.trim ().replace (/;$/, '');
    if (/^"[^"]*"$/.test (value)) return true;
    // Java widens a literal into a primitive but never boxes int -> Long or int -> Double
    if (token === 'Long' && /^-?\d+[Ll]$/.test (value)) return true;
    if (token === 'Double' && /^-?(\d+\.\d*|\d*\.\d+|\d+[Dd])$/.test (value)) return true;
    if (token === 'Integer' && /^-?\d+$/.test (value)) return true;
    const callee = value.match (/^([\w.$]+)\s*\(/);
    if (callee !== null && RETYPE_STRING_RETURN_CALLEES.has (callee[1]) && (token === 'String' || token === 'java.lang.String')) return true;
    // native literal String.replaceFirst/replace (section 52) returns String
    if ((token === 'String' || token === 'java.lang.String') && /^(?:\(\(String\)[\w$]+\)|[\w$]+)\.replace(?:First)?\("/.test (value)) return true;
    // hx4 J08: guarded native replaceFirst is a String (null arm included)
    if ((token === 'String' || token === 'java.lang.String') && /^\(([\w$.]+) == null \? null : \(\(String\)\1\)\.replaceFirst\(/.test (value)) return true;
    if (value.indexOf ('+') !== -1 && /"/.test (value)) return true;
    // a checkcast proves the value only when it wraps the whole expression, not one argument
    if (new RegExp (`^\\(\\s*${token}\\s*\\)`).test (value) && retypeCastSpansValue (value)) return true;
    return false;
}

// `(T) expr` where expr is one operand: an identifier/call chain, or a parenthesised expression
function retypeCastSpansValue (value: string): boolean {
    const rest = value.replace (/^\(\s*[^()]+\s*\)\s*/, '');
    if (rest.startsWith ('(')) {
        let depth = 0;
        for (let k = 0; k < rest.length; k++) {
            if (rest[k] === '(') depth++;
            else if (rest[k] === ')') { depth--; if (depth === 0) return k === rest.length - 1; }
        }
        return false;
    }
    return /^[\w$.]+(\((?:[^()]|\([^()]*\))*\))?(\.[\w$]+(\((?:[^()]|\([^()]*\))*\))?)*$/.test (rest);
}

// async-param copy `x = x3` writes the typed snapshot token admits: returns the printed write
// (a checkcast or `L` suffix where javac needs one) or undefined when the value may be another box.
// Map sources: omit of a Map, extend/deepExtend/keysort, safeDict and handle*-tuple element reads.
const RETYPE_COPY_MAP_TOKEN = /^(?:java\.util\.)?Map<String, Object>$/;
const RETYPE_COPY_EXTRA_CALLEES = /^(?:Helpers\.(?:mathMin|mathMax|subtract|isLessThanOrEqual|isGreaterThanOrEqual|callDynamically|addElementToObject)|io\.github\.ccxt\.ws\.ArrayCache\.getLimitOf|String\.valueOf)$/;

function retypeTopLevelArgCount (args: string): number {
    let depth = 0;
    let count = 1;
    let quoted = false;
    for (let k = 0; k < args.length; k++) {
        const c = args[k];
        if (c === '\\' && quoted) { k++; continue; }
        if (c === '"') quoted = !quoted;
        if (quoted) continue;
        if (c === '(' || c === '[' || c === '{') depth++;
        else if (c === ')' || c === ']' || c === '}') depth--;
        else if (c === ',' && depth === 0) count++;
    }
    return count;
}

function retypeCopyWrite (rhs: string, token: string, name: string): string | undefined {
    const tail = rhs.match (/;\s*(\/\/.*)?$/);
    const comment = tail !== null && tail[1] !== undefined ? ' ' + tail[1] : '';
    const value = rhs.replace (/;\s*(\/\/.*)?$/, '').trim ();
    const write = (v: string) => `${v};${comment}`;
    if (value === 'null' || retypeWrittenValueMatches (value, token)) return rhs;
    // the pass runs before applyJavaImports, so the printed casts are still `java.util.`-qualified
    // second() of a typed handle* Pair is its params Map in every Pair the base declares
    const pairRead = value.match (/^[A-Za-z_$][\w$]*Variable\.(first|second)\(\)$/)?.[1];
    const tupleRead = /^\(\((?:java\.util\.)?List<Object>\) [A-Za-z_$][\w$]*Variable\)\.get\(\d\)$/.test (value);
    if (RETYPE_COPY_MAP_TOKEN.test (token)) {
        const extend = value.match (/^this\.extend\((.*)\)$/);
        if (extend !== null) {
            const fixed = retypeTopLevelArgCount (extend[1]) === 2 && extend[1].indexOf ('...') === -1;
            return fixed ? rhs : write (`(${token}) ${value}`);
        }
        if (/^this\.(?:deepExtend|keysort)\(/.test (value)) return rhs;
        if (pairRead === 'second') return rhs;
        const castable = tupleRead
            || new RegExp (`^this\\.omit\\(${name},`).test (value)
            || /^this\.safeDict\(/.test (value);
        return castable ? write (`(${token}) ${value}`) : undefined;
    }
    if (token === 'Long') {
        if (/^-?\d+$/.test (value)) return write (`${value}L`);
        if (/^this\.(?:safeInteger|parseToInt|milliseconds)\(/.test (value)) return rhs;
        return undefined;
    }
    if (token === 'String') {
        if (/^\(\((?:java\.util\.)?Map<String, Object>\)[A-Za-z_$][\w$]*\)\.get\("[^"]*"\)$/.test (value)) return write (`(String) ${value}`);
        if (tupleRead && value.endsWith ('.get(0)')) return write (`(String) ${value}`);
        if (new RegExp (`^\\(\\(String\\)${name}\\)\\.to(?:Upper|Lower)Case\\(\\)$`).test (value)) return rhs;
    }
    return undefined;
}

// a use of the copy may sit on a continuation line of a multi-line call: resolve its callee
// over the preceding code, and admit the Object-parameter Helpers the base declares
function retypeCopyUseIsAudited (lines: string[], j: number, from: number, name: string, token: string): boolean {
    if (retypeUseIsAudited (lines[j], name, token)) return true;
    const code = retypeCodeOnly (lines[j]);
    let prefix = '';
    // a Helpers.newMap literal spans one line per property: look back over the whole literal
    for (let k = Math.max (from, j - 400); k < j; k++) prefix += retypeCodeOnly (lines[k]);
    const re = retypeMentionRegex (name, 'g');
    let m: RegExpExecArray | null;
    while ((m = re.exec (code)) !== null) {
        const pre = prefix + code.slice (0, m.index);
        let depth = 0;
        let callee: string | undefined = undefined;
        for (let k = pre.length - 1; k >= 0; k--) {
            const c = pre[k];
            if (c === ')') depth++;
            else if (c === '(') {
                if (depth === 0) {
                    const head = pre.slice (0, k).trim ().match (/([\w$.]+)\s*$/);
                    callee = head !== null ? head[1] : undefined;
                    break;
                }
                depth--;
            }
        }
        if (callee !== undefined && (RETYPE_AUDITED_CALLEES.test (callee) || RETYPE_COPY_EXTRA_CALLEES.test (callee))) continue;
        const local = code.slice (0, m.index);
        if ((/\+\s*$/.test (local) || /^\s*\+/.test (code.slice (m.index + name.length))) && /"/.test (lines[j])) continue;
        const cast = local.match (/\(([\w$.<>,? ]+)\)\s*\(?\s*$/);
        if (cast !== null) {
            const c = cast[1].replace (/\s+/g, '').replace (/^java\.util\./, '');
            const own = token.replace (/\s+/g, '').replace (/^java\.util\./, '');
            if (c === own || c === 'Object' || c === 'java.lang.Object') continue;
            if (RETYPE_COPY_MAP_TOKEN.test (token) && c === 'Map<?,?>') continue;
        }
        return false;
    }
    return true;
}

// a later declaration of the same name is a DIFFERENT variable (Java forbids
// redeclaring a name in one scope), so its LHS is not a use of the hoisted name.
function retypeDeclaresName (code: string, name: string): boolean {
    return new RegExp (`^\s*(?:final\s+)?[A-Za-z_$][\w$.]*(?:<[^;=]*>)?(?:\[\])*\s+${name}\s*(?:=|;)`).test (code);
}

function retypeUseIsAudited (line: string, name: string, token?: string): boolean {
    const code = retypeCodeOnly (line);
    if (retypeDeclaresName (code, name)) return true;
    if (!retypeMentionRegex (name).test (code)) return true;   // no mention outside literals
    for (const shape of RETYPE_AUDITED_USE_SHAPES) {
        if (new RegExp (shape.source.replace (/NAME/g, name)).test (line)) return true;
    }
    return retypeMentionContextsOk (code, name, token, line);
}

// the text indentation of the printer's spliced wrappers does not track block
// nesting, so the indent guard keeps missing declarations that ARE in scope (240 sites at the pin).
// The lookup below replaces it with a real brace-depth test; the scanner carries the block-comment
function retypeDepthScan (lines: string[]): number[] {
    const depths: number[] = [];
    let depth = 0;
    let inComment = false;
    for (const line of lines) {
        let code = '';
        let i = 0;
        while (i < line.length) {
            if (inComment) {
                const j = line.indexOf ('*/', i);
                if (j === -1) { i = line.length; break; }
                i = j + 2; inComment = false; continue;
            }
            if (line.startsWith ('//', i)) break;
            if (line.startsWith ('/*', i)) {
                const j = line.indexOf ('*/', i + 2);
                if (j === -1) { inComment = true; break; }
                i = j + 2; continue;
            }
            const c = line[i];
            if (c === '"') {
                i++;
                while (i < line.length) {
                    if (line[i] === '\\') { i += 2; continue; }
                    if (line[i] === '"') { i++; break; }
                    i++;
                }
                continue;
            }
            if (c === "'") {
                const j = line.indexOf ("'", i + 1);
                if (j !== -1 && j - i <= 3) { i = j + 1; continue; }
                code += c; i++; continue;
            }
            code += c; i++;
        }
        depths.push (depth);
        depth += (code.match (/{/g) ?? []).length - (code.match (/}/g) ?? []).length;
    }
    return depths;
}

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
// Uses the generator's own typescript (build/csharp-local-types.js `ts`) so SyntaxKind
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
    const name = node.expression.name.text;
    if (!STRING_ACCESSORS.has (name)) {
        return false;
    }
    const declaration = printer.getChecker ().getResolvedSignature (node)?.declaration?.resolve ();
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
            const method = String (callee.name.text);
            if (callee.expression.kind === ts.SyntaxKind.ThisKeyword) {
                return STRING_RETURNING_BASE_METHODS.has (method);
            }
            return callee.expression.kind === ts.SyntaxKind.Identifier
                && (callee.expression as any).text === 'Precise'
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
        return ts.typeParts (type).some ((member: any) => typeIsPossiblyNumeric (member));
    }
    if (flags & ts.TypeFlags.Intersection) {
        return ts.typeParts (type).some ((member: any) => typeIsPossiblyNumeric (member));
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
        if (left !== undefined && ts.isIdentifier (left) && left.text === sourceName) {
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
            return node.text === 'undefined' || node.text === selfName;
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
            const method = String (callee.name.text);
            if (callee.expression.kind === ts.SyntaxKind.ThisKeyword) {
                return STRING_RETURNING_BASE_METHODS.has (method);
            }
            return callee.expression.kind === ts.SyntaxKind.Identifier
                && (callee.expression as any).text === 'Precise'
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
            const name = n.text;
            let list = index.get (name);
            if (list === undefined) {
                list = [];
                index.set (name, list);
            }
            list.push (n);
        }
        n?.forEachChild (visit);
    };
    scope?.forEachChild (visit);
    return index;
}

// resolves to an `async` method (or one declared to return a Promise — an overload
// signature carries the return type but not the modifier)
function isAsyncMethodCall (printer: any, callNode: any): boolean {
    const declaration = printer.getChecker ().getResolvedSignature (callNode)?.declaration?.resolve ();
    if (declaration === undefined) {
        return false;
    }
    if (ts.canHaveModifiers (declaration) && (ts.getModifiers (declaration) ?? []).some ((m: any) => m.kind === ts.SyntaxKind.AsyncKeyword)) {
        return true;
    }
    const returnType = declaration.type;
    return returnType !== undefined && ts.isTypeReferenceNode (returnType)
        && ts.isIdentifier (returnType.typeName) && returnType.typeName.text === 'Promise';
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
    return ts.isIdentifier (callee) && callee.text === 'Helpers';
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
        declaration = printer.getChecker ().getResolvedSignature (node)?.declaration?.resolve ();
    } catch (e) {
        declaration = undefined;
    }
    return declaration !== undefined && ts.isMethodDeclaration (declaration)
        && declaration.name !== undefined && declaration.name.text === name;
}

// the single local binding an identifier reads, or undefined
function referencedLocalDeclaration (printer: any, identifier: any): any {
    let declaration;
    try {
        declaration = printer.getChecker ().getSymbolAtLocation (identifier)?.valueDeclaration?.resolve ();
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
        return value.text === sourceName || referencedLocalEmitsString (printer, value);
    }
    if (ts.isAsExpression (value) || ts.isTypeAssertion (value)) {
        return value.type !== undefined && value.type.kind === ts.SyntaxKind.StringKeyword;
    }
    if (ts.isCallExpression (value) && ts.isPropertyAccessExpression (value.expression)) {
        const method = String (value.expression.name.text);
        // never-null String results of any receiver (a null receiver throws, exactly
        // like the TS expression they print)
        return method === 'toString' || method === 'toLowerCase' || method === 'toUpperCase';
    }
    return false;
}

// `this.<name>(…)` whose printed Java is `public String <name>(…)` on every declaration
function isStringDeclaredThisCall (printer: any, node: any): boolean {
    const method = String (node.expression.name.text);
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
        const method = String (value.expression.name.text);
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
        if (ts.isIdentifier (left) && (left.text === sourceName || referencedLocalEmitsString (printer, left))) {
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
        return value.text === sourceName || referencedLocalEmitsString (printer, value);
    }
    if (ts.isAsExpression (value) || ts.isTypeAssertion (value)) {
        return value.type !== undefined && value.type.kind === ts.SyntaxKind.StringKeyword;
    }
    if (ts.isBinaryExpression (value) && value.operatorToken.kind === ts.SyntaxKind.PlusToken) {
        return plusChainIsValuePreserving (printer, value, sourceName, depth);
    }
    if (ts.isCallExpression (value) && ts.isPropertyAccessExpression (value.expression)) {
        if (value.expression.expression.kind === ts.SyntaxKind.ThisKeyword) {
            return isStringDeclaredThisCall (printer, value);
        }
        const method = String (value.expression.name.text);
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
    const sourceName = declaration.name.text;
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

// venue-local async cores (java-local-types section 12) join the unified table; base names never collide
function withVenueAsyncReturns (table: Map<string, any>): Map<string, any> {
    const merged = new Map(table);
    for (const [name, javaReturnType] of javaVenueAsyncReturnTable()) {
        if (!merged.has(name)) merged.set(name, { name, javaReturnType, isArray: false });
    }
    return merged;
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
            const declaration = symbol?.valueDeclaration?.resolve ();
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

// ===== java-13: the printed-Java String proof the `+` concat anchor needs =====
//
// `x + y` prints Helpers.add(x, y) unless one operand's printed text is statically a
// String — javac compiles `+` only when one side is. The generator proves string
// literals and the concats it prints itself; the two operand families only this layer
// can prove are
//
//   * a local whose FINAL emitted declaration is `String <name> = ` — every local-typing
//     slice rewrites the declaration text, so the proof is an observer of that text
//     (the same trick java-local-types.js#observeJavaStringDeclaration uses, with this
//     wrapper installed LAST so it sees what the whole chain emitted);
//   * a call to a hand-written `public String` runtime method (BaseExchange accessors,
//     the Precise string statics).
//
// javaExpressionTypeResolver hands both to the generator, whose javaProvableString then
// emits the native concat (ast-transpiler src/javaTranspiler.ts). Anything unproven
// returns undefined and keeps the helper.
//
// Every name below is a hand-written Java method declared `public String` /
// `public static String` in java/lib/src/main/java/io/github/ccxt (BaseExchange,
// base/SafeMethods, base/Strings, base/Time, base/NumberHelpers, base/Precise) and is
// not redeclared with another return type anywhere in the generated tree (grepped:
// only Kraken.java redeclares safeCurrencyCode, also as String).
const JAVA_STRING_RUNTIME_METHODS = new Set ([
    'safeString', 'safeString2', 'safeStringN', 'safeStringUpper', 'safeStringLower',
    'uuid22', 'capitalize', 'numberToString', 'decimalToPrecision', 'safeCurrencyCode',
    'yymmdd', 'yyyymmdd',
]);
const JAVA_STRING_PRECISE_METHODS = new Set ([
    'stringMul', 'stringDiv', 'stringSub', 'stringAdd', 'stringOr', 'stringMax',
    'stringMin', 'stringAbs', 'stringNeg', 'stringMod',
]);
// zero-argument members the Java printer rewrites into a String-typed expression of its own:
// printToLowerCaseCall / printToUpperCaseCall / printTrimCall emit `((String)<recv>)<m>()`
// (the cast is the printer's own, stripped again only when the receiver is already declared
// `String`), and printToStringCall emits `String.valueOf(<recv>)`. All four are statically
// `java.lang.String` whatever the receiver's printed declaration was, so they anchor a native
// `+` the same way a string literal or a `this.safeString(..)` call does.
const JAVA_STRING_CAST_METHODS = new Set ([
    'toLowerCase', 'toUpperCase', 'trim', 'toString',
]);

// the printed Java type of an expression, or undefined when this layer cannot prove it
function javaPrintedExpressionType (printer: any, emittedStringLocals: WeakSet<any>, node: any): string | undefined {
    if (node === undefined) {
        return undefined;
    }
    let current = node;
    while (current.kind === ts.SyntaxKind.ParenthesizedExpression) {
        current = current.expression;
    }
    if (current.kind === ts.SyntaxKind.StringLiteral || current.kind === ts.SyntaxKind.NoSubstitutionTemplateLiteral) {
        return 'String';
    }
    if (current.kind === ts.SyntaxKind.Identifier) {
        let declaration;
        try {
            declaration = printer.getChecker ().getSymbolAtLocation (current)?.valueDeclaration?.resolve ();
        } catch (e) {
            return undefined;
        }
        if (declaration === undefined || !emittedStringLocals.has (declaration)) {
            return undefined;
        }
        // the Java printer renames the identifiers captured by an object literal in place
        // (`baseId` -> `finalBaseId`, declared `final Object finalBaseId = baseId`), so a
        // renamed use site is NOT the type the local's own declaration was emitted with
        if (String (current.text) !== String (declaration.name?.text)) {
            return undefined;
        }
        return 'String';
    }
    if (current.kind === ts.SyntaxKind.CallExpression) {
        const callee = current.expression;
        if (callee?.kind === ts.SyntaxKind.PropertyAccessExpression) {
            const receiver = callee.expression;
            const name = String (callee.name?.text);
            // a zero-argument String-cast member: the printer emits `((String)recv).toLowerCase()`
            // / `String.valueOf(recv)` itself, which javac types String no matter what the receiver
            // was declared as (see JAVA_STRING_CAST_METHODS)
            if (JAVA_STRING_CAST_METHODS.has (name) && (current.arguments?.length ?? 0) === 0) {
                return 'String';
            }
            const onThis = receiver?.kind === ts.SyntaxKind.ThisKeyword || receiver?.kind === ts.SyntaxKind.SuperKeyword;
            if (onThis && JAVA_STRING_RUNTIME_METHODS.has (name)) {
                return 'String';
            }
            if (receiver?.kind === ts.SyntaxKind.Identifier && receiver.text === 'Precise' && JAVA_STRING_PRECISE_METHODS.has (name)) {
                return 'String';
            }
        }
    }
    return undefined;
}

// install the resolver the generator reads (printer.javaExpressionTypeResolver). Installed
// LAST in the main thread and in every worker so the declaration observer below sees the
// final text of the whole local-typing chain.
export function installJavaExpressionTypeResolver (transpiler: any): void {
    const printer = transpiler?.javaTranspiler;
    if (!printer || typeof printer.printVariableDeclarationList !== 'function' || printer._javaExpressionTypeResolverInstalled) {
        return;
    }
    const emittedStringLocals = new WeakSet<any> ();
    const upstream = printer.printVariableDeclarationList.bind (printer);
    printer.printVariableDeclarationList = function (node: any, identation: number) {
        const printed = upstream (node, identation);
        try {
            const declarations = node?.declarations;
            if (declarations !== undefined && declarations.length === 1) {
                const declaration = declarations[0];
                // element lines print `String x = (String) ...get(i)`, which the ws `this.` revert never matches
                if (declaration.name?.kind === ts.SyntaxKind.ArrayBindingPattern) {
                    // a destructured element the handle pass printed `String <name> = ` reads as String
                    const lines = printed.split ('\n').map ((line: string) => line.trimStart ());
                    for (const element of declaration.name.elements) {
                        if (element.kind === ts.SyntaxKind.BindingElement && element.name?.kind === ts.SyntaxKind.Identifier
                            && lines.some ((line: string) => line.startsWith (`String ${printer.printNode (element.name, 0)} = `))) {
                            emittedStringLocals.add (element);
                        }
                    }
                }
                if (declaration.name?.kind === ts.SyntaxKind.Identifier && declaration.initializer !== undefined) {
                    // a pro/prediction declaration the ws post-process rewrites back to
                    // `Object` is not a String at the use sites either (same guard the
                    // SS-03 `+` acceptance uses: wsPostProcessReverts)
                    if (!wsPostProcessReverts (declaration)) {
                        const iden = printer.getIden (identation);
                        const printedName = printer.printNode (declaration.name, 0);
                        const marker = `${iden}String ${printedName} = `;
                        const at = printed.lastIndexOf (marker);
                        if (at !== -1 && (at === 0 || printed.charAt (at - 1) === '\n')) {
                            emittedStringLocals.add (declaration);
                        }
                    }
                }
            }
        } catch (e) {
            // never break a print on an observer error
        }
        return printed;
    };
    printer.javaExpressionTypeResolver = (node: any) => javaPrintedExpressionType (printer, emittedStringLocals, node);
    printer._javaExpressionTypeResolverInstalled = true;
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
    const name = String ((initializer as any).expression.name.text);
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
        const declaration = symbol?.valueDeclaration?.resolve ();
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
                const method = String (right.expression.name.text);
                const isThis = right.expression.expression.kind === ts.SyntaxKind.ThisKeyword;
                const isPrecise = ts.isIdentifier (right.expression.expression) && (right.expression.expression as any).text === 'Precise';
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
            info.target = String (right.text);
            info.targetSelf = right.text === sourceName;
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
        const sourceName = String (declaration.name.text);
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
        return Math.min (requested, 3);
    }
    return Math.max (1, Math.min (2, os.availableParallelism ()));
}

class NewTranspiler {

    transpiler!: Transpiler;
    pythonStandardLibraries;
    oldTranspiler = new OldTranspiler();
    // lazily created in webworkerTranspile and kept alive for the lifetime of the
    // transpiler, so worker threads (and their warm Transpiler + ts.Program batch)
    // are reused across every stage instead of paying a cold pool per call
    piscina: Piscina | undefined;
    // Cached transpiled body of the TS `Exchange extends BaseExchange` tier (the 62
    // trading methods), reused by both the Exchange.java injection and the
    // PredictionExchange.java convenience-method injection.
    _exchangeTierBody: string | undefined;

    async destroy () {
        if (this.piscina) {
            await this.piscina.destroy ();
            this.piscina = undefined;
        }
    }

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
            "java": {
                // generated async lambdas go through BaseExchange.supplyAsync, which
                // defaults to VIRTUAL_EXECUTOR so no tier lands on the ForkJoinPool common pool
                "asyncSupplier": JAVA_ASYNC_SUPPLIER,
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
        // a lambda body cannot capture a reassigned parameter: fail the transpile instead of copying it
        (this.transpiler as any).javaTranspiler.javaStrictEffectivelyFinal = true;
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
        // java-09: record the Java type every rewritten declaration carries and hand the
        // table to the printer, so `Helpers.GetValue(x, "lit")` on a declared map local
        // prints `x.get("lit")`. Installed LAST so the observer sees the final text
        // (also applied per worker thread in java-worker.ts)
        installJavaDeclaredLocalTypes(this.transpiler);
        // hx7 java-03: box the row-builder parameter positions the pin types `Map<String, Object>`
        // although the exchange hands them a raw row/list response (parseCurrency / parseTicker /
        // parseTransfer — the java STATIC_RESPONSE ArrayList->Map sites). Installed LAST so no
        // earlier installer's proof reads a native type this one removes
        // (also applied per worker thread in java-worker.ts)
        installJavaObjectParamPositions(this.transpiler);
        // java-13: hand the generator the printed-Java String proof for a `+` concat
        // anchor (declared-String locals + hand-written String runtime calls) — installed
        // LAST for the same reason (also applied per worker thread in java-worker.ts)
        installJavaExpressionTypeResolver(this.transpiler);
        // default-valued Strings params answer their printed List<String> (also in java-worker.ts)
        installJavaStringListParamTypes(this.transpiler);
        // null-initialised scalar locals joined over their writes (also in java-worker.ts)
        installJavaNullScalarLocalTypes(this.transpiler);
        // omit-of-Map locals (section 25; also in java-worker.ts)
        patchJavaOmitLocalTypes(this.transpiler);
        // element reads of awaited qualified DTO lists (section 27; also in java-worker.ts)
        patchJavaQualifiedDtoListElementLocals(this.transpiler);
        patchJavaStringAccumulatorLists(this.transpiler);
        // element reads of audited handle* tuple holders (section 28; also in java-worker.ts)
        patchJavaTupleHolderElementLocals(this.transpiler);
        // ws order-book cache locals (section 30; also in java-worker.ts)
        patchJavaOrderBookCacheLocals(this.transpiler);
        // casts on receivers already declared Map<String, Object> (section 31; also in java-worker.ts)
        patchJavaDeclaredMapReceiverCasts(this.transpiler);
        patchJavaBaseMapFieldReceiverCasts(this.transpiler);
        // element writes on fresh unshared local maps (section 33; also in java-worker.ts)
        patchJavaFreshMapElementWrites(this.transpiler);
        // numeric-literal equality on declared Long/Double params and tuple bindings (section 35)
        patchJavaDeclaredBoxLiteralEquality(this.transpiler);
        patchJavaObjectKeysLength(this.transpiler);
        patchJavaMapArgIdentity(this.transpiler);
        patchJavaNonNullStringLocals(this.transpiler);
        patchJavaNonNullLongSubtract(this.transpiler);
        installJavaBooleanParams(this.transpiler);
        installJavaStringDefaultParams(this.transpiler);
        // typed Pair returns of handle*AndParams (section 46; also in java-worker.ts)
        installJavaTuplePairReturns(this.transpiler);
        // List<String> core arguments printed natively (section 47; also in java-worker.ts)
        installJavaStringListArgs(this.transpiler);
        // Long slots that already receive a Long (section 48; also in java-worker.ts)
        installJavaLongSlots(this.transpiler);
        // Map locals over proven Map writes (section 50; before 49, whose receivers read Map declarations)
        installJavaMapLocals(this.transpiler);
        // element writes on handleUntilOption slot 0 / omit-of-Map locals (section 49; also in java-worker.ts)
        patchJavaUntilOmitMapWrites(this.transpiler);
        // fixed boolean parameters print Boolean (section 51; also in java-worker.ts)
        installJavaBooleanFixedParams(this.transpiler);
        installJavaBooleanWriteLocals(this.transpiler);
        // native String.replaceFirst/replace for literal replace/replaceAll (section 52; also in java-worker.ts)
        installJavaNativeReplace(this.transpiler);
        // String.replace / native-concat return sites of `: Str` methods (section 53; also in java-worker.ts)
        installJavaStringReturnSites(this.transpiler);
        installJavaH2kJ02FreshObjectMapWrites(this.transpiler);
        installH2kJ11StringArgs(this.transpiler);
        installJavaNativePadStartFirst(this.transpiler);
        installJ08NativeReplace(this.transpiler);
        installHx10J04StringHelpers(this.transpiler); // hx10 J04
        installJ10Types(this.transpiler); // hx4 J10
        installJ11MapLocals(this.transpiler); // hx4 J11
        installJ12ParamTypes(this.transpiler); // hx4 J12
        installJ13ListLocals(this.transpiler); // hx4 J13
        installJ14ScalarLocals(this.transpiler); // hx4 J14
        installJ15J12PreScan(this.transpiler); // hx4 J15
        installJ17StringReturns(this.transpiler); // hx4 J17
        // hx10 J03: a `boolean`-typed parameter condition is a Boolean-or-null box (also in java-worker.ts)
        installJ03BooleanConditions(this.transpiler);
        // hx10 wave-3 J06: awaited / destructured locals take the box their TS type proves (also in java-worker.ts)
        installJ06TupleAsyncLocals(this.transpiler);
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
                JAVA_ASYNC_SUPPLIER_IMPORT,
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
                JAVA_ASYNC_SUPPLIER_IMPORT,
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
            'import io.github.ccxt.Helpers;',
            JAVA_ASYNC_SUPPLIER_IMPORT,
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
        // describe() is a dictionary on every tier (TS `describe (): Dict`); overrides are covariant-safe because every tier retypes it
        baseClass = baseClass.replace(/(\s+public) Object describe\(\)/g, '$1 java.util.Map<String, Object> describe()');
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
        baseClass = nativeJavaJ24Arithmetic(nativeJavaJ23Arithmetic(baseClass)); // hx4 J23, J24
        baseClass = nativeJavaJ27Arithmetic(baseClass); // hx4 J27
        baseClass = nativeJavaJ31Arithmetic(baseClass); // hx4 J31
        baseClass = nativeJavaJ32DivModNeg(baseClass, true); // hx4 J32
        baseClass = nativeJavaJ34MapLocals(baseClass); // hx4 J34
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
    // removes every overload of the name (a typed core and its Object... front)
    removeJavaMethod(classBody: string, methodName: string): string {
        let out = this.removeFirstJavaMethod(classBody, methodName);
        while (out !== classBody) {
            classBody = out;
            out = this.removeFirstJavaMethod(classBody, methodName);
        }
        return out;
    }

    removeFirstJavaMethod(classBody: string, methodName: string): string {
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
            // comments may hold quotes or braces (`it's`)
            if (ch === '/' && classBody[j + 1] === '/') { const e = classBody.indexOf ('\n', j); j = e < 0 ? classBody.length : e; continue; }
            if (ch === '/' && classBody[j + 1] === '*') { const e = classBody.indexOf ('*/', j + 2); j = e < 0 ? classBody.length : e + 1; continue; }
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
            for (const name of JAVA_HAND_WRITTEN_PAIR_METHODS) {
                baseMethods = this.removeJavaMethod(baseMethods, name);
            }
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
        const shortened = shortenJavaReferences(nativeJavaJ36MultiplySubtract(hx4J21BaseNativePasses(this, body, filename))); // hx4 J36
        const parseTyped = hx11w8JavaParseTyped(shortened.source); // hx11w8 parse
        if (parseTyped !== shortened.source) { shortened.source = parseTyped; shortened.imports.push(HX11W8_JSPARSE_IMPORT); }
        const replacement = javaDelimiter + '\n' + hx10w10JO01(j12AsyncThrows(shortened.source)); // hx10 wave-10 JO01
        if (literal) {
            this.replaceInFileLiteral(filename, pattern, replacement);
        } else {
            replaceInFile(filename, pattern, replacement);
        }
        const contents = fs.readFileSync(filename, 'utf8');
        const withImports = nativeJavaJ03Family(nativeJavaJ42(nativeJavaJ38(nativeJavaJ36MultiplySubtract(ensureJavaImports(contents, shortened.imports))))); // hx4 J42, hx10 J03
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
            merged = merged.replace(/(^|\s)public Object describe\(\)/g, '$1public java.util.Map<String, Object> describe()'); // describe(): Dict on the prediction base too (first method: no leading whitespace after trim)
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

        if (exchanges.length === 0) {
            // full builds also transpile the prediction-market exchanges (ts/src/prediction/)
            await this.transpilePrediction(force)
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
        content = content.replace(/, (sha1|sha384|sha512|sha256|md5|ed25519|keccak|p256|secp256k1)([,)])/g, `, $1()$2`);
        content = content.replace(/(\s+public) Object describe\(\)/g, '$1 java.util.Map<String, Object> describe()')
        content = content.replace(/(\s+public java\.util\.Map<String, Object> describe\(\))/g, `${constructor}$1`)
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
        if (ws || prediction) {
            content = nativeJavaWsCacheCalls(content);
            content = nativeJavaJ07WsOrderBookCalls(content);
            content = h2kJ06NativeCallDynamically(content);
        }
        content = this.addDeprecatedAnnotations(content);

        // retype the raw-text `final Object` hoists (see retypeFinalVarDeclarations)
        content = this.retypeFinalVarDeclarations(content);
        content = hx11w8ObjectValuesListLocals(content);
        content = nativeJavaDeclaredElementReads(content);
        content = nativeJavaJ03ElementReads(content);
        content = nativeJavaJ02ElementReads(content); // hx10 w2 J02
        content = nativeJavaJ05DictChains(content); // hx10 w3 J05
        content = nativeJavaArrayLength(content);
        content = h2kJ07NativeDeclaredLength(content);
        // literal limit locals fed to Long slots (java-local-types section 32)
        content = nativeJavaLongLimitLocals(content);
        content = nativeJavaTopLevelNewMap(content);
        content = nativeJavaReassignedNewMap(content); // hx4 J03
        content = nativeJavaEqualTruthy(content); // H2K-j08
        content = h2kJ09NativeSubtractDivideMod(content);
        content = h2kJ10NativeComparisons(content);
        content = nativeJavaInOp(content);
        content = nativeJavaToLongOrNullH2kJ13(content);
        content = nativeJavaH2kJ15(content);
        content = nativeJavaNestedNewMaps(content); // H2K-J16
        content = nativeJavaJ04Arithmetic(content); // hx4 J04
        // hx4 J19: re-run the long-limit + compare passes over J04's native arithmetic
        content = nativeJavaJ19Compare(h2kJ10NativeComparisons(nativeJavaLongLimitLocals(content)));
        content = nativeJavaJ20ParamCompare(content); // hx4 J20
        content = nativeJavaJ24Arithmetic(nativeJavaJ23Arithmetic(content)); // hx4 J23, J24
        content = nativeJavaJ27Arithmetic(content); // hx4 J27
        content = nativeJavaSumLongLocals(content); // hx11 w8 sum-long-local
        content = nativeJavaJ31Arithmetic(content); // hx4 J31
        content = nativeJavaJ25Compare(content); // hx4 J25
        content = nativeJavaJ32DivModNeg(content); // hx4 J32
        content = nativeJavaJ05(content); // hx10w2 J05

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
            if (lines[i].trim() === 'return null;' && i + 1 < lines.length && isAsyncLambdaClose(lines[i + 1].trim())) {
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
                && i + 1 < lines.length && isAsyncLambdaClose(lines[i + 1].trim())) {
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
                && i + 1 < lines.length && isAsyncLambdaClose(lines[i + 1].trim())) {
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

        // WsClient.subscriptions/rejections/futures are owner-thread maps behind OwnerMap views, so the
        // helper's put branch and a plain put agree; the generated text stays as the base prints it.

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
        // Object future = this.safeValue(client.futures, x) → cast to Future
        // client.futures is a ConcurrentHashMap<String, Future> (WsClient), so every path
        // hands back a Future or null and the checkcast cannot fail
        content = content.replace(/Object\s+future\s*=\s*this\.safeValue\(client\.futures,\s*([^)]+)\)/gm,
            'io.github.ccxt.ws.Future future = (io.github.ccxt.ws.Future)this.safeValue(client.futures, $1)');

        // WsClient.futures is Map<String, Future> and subscriptions an owner Map<String, Object>:
        // with a provably-String key, reads/puts print natively (no helper, no checkcast).
        const wsKeyIsString = (key: string, offset: number): boolean =>
            /^"[^"\\]*"$/.test (key) || (/^[A-Za-z_]\w*$/.test (key) && this.provablyStringLocal (content, key, offset));
        content = content.replace(/io\.github\.ccxt\.ws\.Future (\w+) = \(io\.github\.ccxt\.ws\.Future\)this\.safeValue\(client\.futures, ("[^"\\]*"|\w+)\);/gm,
            (whole: string, local: string, key: string, offset: number) =>
                wsKeyIsString (key, offset) ? `io.github.ccxt.ws.Future ${local} = client.futures.get(${key});` : whole);
        content = content.replace(/^(\s*)Helpers\.addElementToObject\(client\.subscriptions, ("[^"\\]*"|\w+), ([^\n]*)\);$/gm,
            (whole: string, indent: string, key: string, value: string, offset: number) =>
                wsKeyIsString (key, offset) && (value.split ('(').length === value.split (')').length)
                    ? `${indent}client.subscriptions.put(${key}, ${value});` : whole);

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
        const dynamicMethods = ['append', 'reset', 'storeArray', 'store'];
        for (const method of dynamicMethods) {
            content = this.replaceDynamicMethodCall(content, method);
        }
        // a resolved ws list is an ArrayCache or a plain list: the typed static answers Long for both
        content = this.replaceDynamicMethodCall(content, 'getLimit',
            (varName, args) => `io.github.ccxt.ws.ArrayCache.getLimitOf(${varName}, ${args})`);
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
            // an optional `<T>` type witness (ws receive locals) stays in front of the name
            const pattern = new RegExp(`this\\.(<[\\w.<>, ]+>)?${method}\\(`, 'g');
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
                const callee = `this.${m2[1] ?? ''}${method}`;
                if (argCount === 4) {
                    result2 += `${callee}(${args2}, null)`;
                } else if (argCount === 3) {
                    result2 += `${callee}(${args2}, null, null)`;
                } else if (argCount === 2) {
                    result2 += `${callee}(${args2}, null, null, null)`;
                } else {
                    result2 += `${callee}(${args2})`;
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
        // parseTimeframe is declared primitive int, so its local keeps `int`; any other reverted
        // local may box an Integer, which a printer `((long) x)` cast would reject at runtime
        const revertedInts = new Set<string>();
        content = content.replace(/int (\w+) = (?![\d(]|this\.parseTimeframe\()/gm, (_m: string, n: string) => { revertedInts.add(n); return 'Object ' + n + ' = '; });
        for (const n of revertedInts) {
            content = content.replace(new RegExp('\\(\\(long\\) ' + n + '\\)', 'g'), '((Number) ' + n + ').longValue()');
        }
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

        // ── spawn lambdas whose argument is a reassigned local: pass the arguments by value ──
        if (!skipEffectivelyFinal) {
            content = this.spawnReassignedArgsByValue(content);
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
            if (lines[i].includes(JAVA_ASYNC_SUPPLIER + '(')) inSupplyAsync++;
            if (inSupplyAsync > 0 && lines[i].trim() === '});') inSupplyAsync--;
            if (inSupplyAsync > 0 && lines[i].trim() === 'return;') {
                lines[i] = lines[i].replace('return;', 'return null;');
            }
        }

        // Only the `});` closing an async lambda body qualifies; nested lambdas are tracked by depth.
        let depth = 0;
        for (let i = 0; i < lines.length; i++) {
            const t = lines[i].trim();
            if (t.includes(JAVA_ASYNC_SUPPLIER + '(')) { depth = 1; continue; }
            if (depth === 0) continue;
            if (t.endsWith('{') && !t.startsWith('}')) { depth++; continue; }
            if (t === '}' || t === '});' || t.startsWith('} ')) { depth--; }
            if (depth !== 0 || t !== '});') continue;

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

    // retypes the raw-text `final Object` hoists and the async-param snapshots to the source
    // declaration's own emitted type token (never a cast); a later use that is not an audited
    // fixed-parameter Object position keeps the line as the transpiler printed it
    retypeFinalVarDeclarations (content: string): string {
        const lines = content.split ('\n');
        const debug = process.env.CCXT_JAVA_FINAL_HOIST_DEBUG === '1';
        for (let i = 0; i < lines.length; i++) {
            const hoistMatch = lines[i].match (RETYPE_HOIST_LINE);
            const snapshotMatch = hoistMatch === null ? lines[i].match (RETYPE_SNAPSHOT_LINE) : null;
            const copyMatch = hoistMatch === null && snapshotMatch === null ? lines[i].match (RETYPE_COPY_LINE) : null;
            const match = hoistMatch !== null ? hoistMatch : (snapshotMatch !== null ? snapshotMatch : copyMatch);
            if (match === null || match === undefined) continue;
            const isSnapshot = hoistMatch === null && snapshotMatch !== null;
            const isCopy = copyMatch !== null && copyMatch !== undefined;
            const indent = match[1];
            const hoistedName = match[2];
            const sourceName = match[3];
            const start = retypeMemberStart (lines, i);
            const end = retypeMemberEnd (lines, i);

            // 1. the source type: the nearest preceding declaration of the same name inside the
            //    member, or — for the async snapshot shape — the parameter type from the signature
            let typeToken: string | undefined;
            if (!isSnapshot) {
                const depths = retypeDepthScan (lines);
                let sawDeclaration = false;
                for (let j = i - 1; j > start; j--) {
                    const decl = lines[j].match (new RegExp (`^(\\s*)(?:final\\s+)?([A-Za-z_$][\\w$.]*(?:<[^;=]*>)?)\\s+${sourceName}\\s*=`));
                    if (decl !== null) {
                        sawDeclaration = true;
                        // in scope = the declaration's block is still open at the
                        // hoist (brace depth never drops below it), not the printer's text indent.
                        let inScope = true;
                        for (let k = j; k < i; k++) {
                            if (depths[k] < depths[j]) { inScope = false; break; }
                        }
                        if (!inScope) continue;                 // a closed block: keep scanning outward
                        typeToken = decl[2];
                        break;
                    }
                }
                // the source may be a fixed parameter (the printed signature
                // carries its own type) even when no declaration exists in the member.
                if (typeToken === undefined && !sawDeclaration) {
                    const signature = retypeSignatureLine (lines, start, i - 1);
                    if (signature !== -1) typeToken = retypeParameterType (lines[signature], sourceName);
                }
            } else {
                const signature = retypeSignatureLine (lines, start, i - 1);
                if (signature !== -1) typeToken = retypeParameterType (lines[signature], sourceName);
            }
            const reference = retypeReferenceToken (typeToken);
            if (reference === undefined) {
                if (debug) console.log (`final-hoist decline ${hoistedName} (source ${typeToken === undefined ? 'not found' : typeToken})`);
                continue;
            }

            // 2. every later mention of the hoisted name inside the member must be an audited
            //    fixed-parameter Object position
            let audited = true;
            // the async-param copy `x = x3` joins its writes against the snapshot type
            const isParamCopy = isCopy && sourceName === `${hoistedName}3`;
            const rewrites: [number, string][] = [];
            for (let j = i + 1; j <= end; j++) {
                if (isCopy) {
                    // the copy is not final, so every later write is audited too
                    const write = lines[j].match (new RegExp (`^(\\s*${hoistedName}\\s*=\\s*)(?!=)(.+)$`));
                    if (write !== null) {
                        if (isParamCopy) {
                            const printed = retypeCopyWrite (write[2], reference, hoistedName);
                            if (printed === undefined) { audited = false; break; }
                            if (printed !== write[2]) rewrites.push ([j, write[1] + printed]);
                            continue;
                        }
                        if (!retypeWrittenValueMatches (write[2], reference)) { audited = false; break; }
                        continue;
                    }
                }
                const useOk = isParamCopy
                    ? retypeCopyUseIsAudited (lines, j, i, hoistedName, reference)
                    : retypeUseIsAudited (lines[j], hoistedName, reference);
                if (!useOk) { audited = false; break; }
            }
            if (!audited) {
                if (debug) console.log (`final-hoist decline ${hoistedName} (use not audited)`);
                continue;
            }
            for (const [j, text] of rewrites) lines[j] = text;

            lines[i] = isCopy
                ? `${indent}${reference} ${hoistedName} = ${sourceName};`
                : `${indent}final ${reference} ${hoistedName} = ${sourceName};`;
            if (debug) console.log (`final-hoist retype ${hoistedName} -> ${reference} (source ${sourceName})`);
        }
        return lines.join ('\n');
    }

    spawnReassignedArgsByValue(content: string): string {
        const lines = content.split('\n');

        for (let i = 0; i < lines.length; i++) {
            const spawnMatch = lines[i].match(/this\.spawn\(\(\)\s*->\s*\{.*this\.(\w+)\(/);
            if (!spawnMatch) continue;

            // the arguments may carry the checkcast a retyped parameter demands
            // (`(Map<String, Object>) (x)`), whose parens hold commas of their own: take the
            // raw argument span to the matching close paren, split it at depth 0, and use the
            // trailing identifier of each argument as the captured-variable candidate
            let methodOpen = lines[i].indexOf(`this.${spawnMatch[1]}(`, lines[i].indexOf('this.spawn'));
            if (methodOpen === -1) continue;
            methodOpen += spawnMatch[1].length + 5;
            let depth = 1;
            let methodClose = methodOpen + 1;
            for (; methodClose < lines[i].length && depth > 0; methodClose++) {
                const ch = lines[i][methodClose];
                if (ch === '(') depth++;
                else if (ch === ')') depth--;
            }
            const argsText = lines[i].slice(methodOpen + 1, methodClose - 1);
            const argOrigin = methodOpen + 1;
            const candidates: { name: string, start: number, end: number }[] = [];
            let argStart = 0;
            depth = 0;
            const addCandidate = (start: number, end: number) => {
                const nameMatch = argsText.slice(start, end).match(/([a-z]\w*)\s*\)*\s*$/);
                if (nameMatch !== null) {
                    candidates.push({ name: nameMatch[1], start: argOrigin + start, end: argOrigin + end });
                }
            };
            for (let k = 0; k < argsText.length; k++) {
                const ch = argsText[k];
                if (ch === ',' && depth === 0) {
                    addCandidate(argStart, k);
                    argStart = k + 1;
                } else if (ch === '(' || ch === '<') {
                    depth++;
                } else if (ch === ')' || ch === '>') {
                    depth--;
                }
            }
            addCandidate(argStart, argsText.length);

            let methodStart = 0;
            for (let j = i - 1; j >= 0; j--) {
                if (lines[j].match(/^\s*(?:public|private|protected)\s+/)) {
                    methodStart = j;
                    break;
                }
            }

            const finals: { name: string, start: number, end: number }[] = [];
            for (const candidate of candidates) {
                const arg = candidate.name;
                if (finals.some((f) => f.name === arg)) continue;
                let reassigned = false;
                for (let j = methodStart; j < i; j++) {
                    if (new RegExp(`^\\s+${arg}\\s*=\\s`).test(lines[j])) {
                        reassigned = true;
                        break;
                    }
                }
                if (reassigned) {
                    finals.push(candidate);
                }
            }
            if (finals.length === 0) continue;

            // a lambda cannot capture the reassigned local: hand every argument to
            // Helpers.task(this::m, ...) by value instead
            const lambda = /^(\s*)this\.spawn\(\(\) -> \{ try \{ this\.(\w+)\((.*)\); \} catch\(Exception _e\) \{ throw new RuntimeException\(_e\); \} \}\);$/;
            const shape = lines[i].match(lambda);
            let argCount = 1;
            depth = 0;
            for (const ch of argsText) {
                if (ch === '(' || ch === '<') depth++;
                else if (ch === ')' || ch === '>') depth--;
                else if (ch === ',' && depth === 0) argCount++;
            }
            if (shape === null || shape[3] !== argsText || argCount > 6) continue;
            lines[i] = `${shape[1]}this.spawn(Helpers.task(this::${shape[2]}, ${argsText}));`;
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

    replaceDynamicMethodCall(content: string, methodName: string,
        format = (varName: string, args: string) => `Helpers.callDynamically(${varName}, "${methodName}", new Object[]{${args}})`): string {
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
            result += format(varName, args);
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
        javaSource = typeCoreReturns(javaSource, withVenueAsyncReturns(typedReturnTable(prediction ? 'prediction' : ws ? 'ws' : 'rest')))
        javaSource = hx4J06ObjectValues(javaSource) // hx4 J06
        javaSource = nativeJavaJ26MapLocals(javaSource) // hx4 J26
        javaSource = nativeJavaJ22CoreArgs(javaSource) // hx4 J22
        javaSource = nativeJavaJ28Compare(javaSource) // hx4 J28
        javaSource = nativeJavaJ29Containers(javaSource) // hx4 J29
        javaSource = nativeJavaJ30CoreArgs(javaSource) // hx4 J30
        javaSource = nativeJavaJ33Compare(javaSource) // hx4 J33
        javaSource = nativeJavaJ34MapLocals(javaSource) // hx4 J34
        javaSource = nativeJavaJ35(javaSource) // hx4 J35
        javaSource = nativeJavaJ36MultiplySubtract(javaSource) // hx4 J36
        javaSource = nativeJavaJ37DivModNeg(javaSource) // hx4 J37
        javaSource = nativeJavaJ36MultiplySubtract(javaSource) // hx4 J36 post-J37
        javaSource = nativeJavaJ38(javaSource) // hx4 J38
        javaSource = nativeJavaJ39Containers(javaSource) // hx4 J39
        javaSource = hx10J01ElementWrites(javaSource) // hx10 J01
        javaSource = wsMapReads(j01wsNativeOps(javaSource)) // hx10 wave-3 J01 + hx10w7 OJ06
        javaSource = hx10w3J02BalancePuts(javaSource) // hx10w3 J02
        javaSource = j01w7FieldPuts(javaSource) // hx10w7 J01
        javaSource = nativeJavaJ04OptionsOps(javaSource) // hx10 w3 J04
        javaSource = nativeJavaBF02FieldOps(javaSource) // hx10 w4 BF02
        javaSource = hx10w4OJ01OptionsOwner(javaSource) // hx10 w4 OJ01
        javaSource = nativeJavaJ03Family(javaSource) // hx10 wave-2 J03
        javaSource = hx10w10JO01(javaSource) // hx10 wave-10 JO01: counter RMW is one owner task
        javaSource = hx11w8GetValueBaseReturn(javaSource) // hx11 w8: GetValue on base-typed receivers

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
            JAVA_ASYNC_SUPPLIER_IMPORT,
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
                    [/\/\/ init array cache tests[\s\S]*?(?=\n\s*public void testSafeMethods\(\))/gm, '}'],
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
                JAVA_ASYNC_SUPPLIER_IMPORT,
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
     * `(exchange.<m>(args)).join()` in
     * transpiled tests binds a typed TypedSurface default whenever the args are
     * statically typed (String symbol, literals, zero-arg whitelisted names), which
     * returns the typed value and has no `.join()`. Casting cannot fix it: an
     * `(Object)` at an SS-05 String position leaves no applicable method. So every
     * call to a typed-surface name is late-bound through Helpers.callDynamically,
     * whose findMethod resolves the single core by name and pads omitted arguments.
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
        // by path, so the program includes the base Exchange the `any`-typed receivers bind to
        const java = this.transpiler.transpileJavaByPath(files.tsFile);
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
            JAVA_ASYNC_SUPPLIER_IMPORT,
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
                JAVA_ASYNC_SUPPLIER_IMPORT,
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
// `F(<balanced-expr>)` -> `<balanced-expr>` for the two truthiness wrappers the handle* tuple
// coercion (build/java-local-types.js section 4b) injects on the element write; the read spellings
// themselves are untouched by that section, so both sides strip symmetrically
function auditStripTruthinessCoercion (s: string): string {
    for (const open of ['Boolean.TRUE.equals(', 'Helpers.isTrue(']) {
        for (;;) {
            const at = s.indexOf(open);
            if (at === -1) break;
            let depth = 1, j = at + open.length, closed = -1;
            for (; j < s.length; j++) {
                const ch = s[j];
                if (ch === '"') { j++; while (j < s.length && s[j] !== '"') { if (s[j] === '\\') j++; j++; } continue; }
                if (ch === '(') depth++;
                else if (ch === ')') { depth--; if (depth === 0) { closed = j; break; } }
            }
            if (closed === -1) break;
            s = s.slice(0, at) + s.slice(at + open.length, closed) + s.slice(closed + 1);
        }
    }
    return s;
}
function auditStripCasts (s: string): string {
    return auditStripTruthinessCoercion(auditStripWrappedStringCasts(s))
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
        // typed-list element locals: only final TypedMap DTOs (and String) are element types
        ok(javaIsTypedMapDto('Position') && javaIsTypedMapDto('Order'), 'Position/Order must be TypedMap DTOs');
        ok(!javaIsTypedMapDto('TypedMap') && !javaIsTypedMapDto('Object'), 'TypedMap/Object must not be element DTOs');
        // Boolean write locals: safeBool/safeBool2 print Object in Java, so they never admit
        const boolKind = (n: any) => ({ safeBool: 'nullableBoolean', safeBool2: 'nullableBoolean', inArray: 'boolean' } as any)[n?.expression?.name?.text];
        const boolWrite = (src: string) => javaBooleanLocalWrite({ javaCallBooleanKind: boolKind, getChecker: () => undefined }, (ts.createSourceFile('w.ts', src, ts.ScriptTarget.Latest, true).statements[0] as any).expression);
        ok(!boolWrite('this.safeBool (m, "linear", false)'), 'safeBool write must not admit a Boolean local');
        ok(!boolWrite('this.safeBool2 (p, "postOnly", "post_only", false)'), 'safeBool2 write must not admit a Boolean local');
        ok(boolWrite('false') && boolWrite('undefined') && boolWrite('this.inArray (a, b)'), 'literal/null/boolean-call writes must admit');
    } catch (e: any) {
        problems.push(`self-test threw: ${e.message}`);
    } finally {
        fs.rmSync(tmp, { recursive: true, force: true });
    }
    return problems.concat(mapLocalsSelfTest(), h2kJ02SelfTest(), j10CounterSelfTest(), j11MapLocalsSelfTest(), j04ArithmeticSelfTest(), j12ParamTypesSelfTest(), j13ListLocalsSelfTest(), j14ScalarLocalsSelfTest(), j15SelfTest(), j17ReturnsSelfTest(), j19CompareSelfTest(), j20ParamCompareSelfTest(), j22CoreArgsSelfTest(), j23ArithmeticSelfTest(), j24ArithmeticSelfTest(), j25CompareSelfTest(), j26MapLocalsSelfTest(), j27ArithmeticSelfTest(), j28CompareSelfTest(), j29ContainersSelfTest(), j30SelfTest(), j31ArithmeticSelfTest(), j36SelfTest(), j32DivModNegSelfTest(), j37SelfTest(), j38SelfTest(), j39SelfTest(), j40SelfTest(), j40X15SelfTest(), j41SelfTest(), j42SelfTest(), j43SelfTest(), j44SelfTest(), x21SelfTest(), x22SelfTest(), j01ElementWritesSelfTest(), j02SelfTest(), j03FamilySelfTest(), j04w2Str(), j05FamilySelfTest(), j06SelfTest(), j01wsSelfTest(), wsReadsTest(), j02BalanceSelfTest(), j04OptionsSelfTest(), oj01OptionsSelfTest(), j05DictChainsSelfTest(), j06TupleAsyncSelfTest(new NewTranspiler().transpiler), bf02SelfTest(), j09SelfTest(), j01w7FieldPutsSelfTest(), j05CallReceiverSelfTest(), j12SelfTest(), jo01SelfTest(), hx11w8JavaParseSelfTest(), hx11w8GetValueBaseReturnSelfTest(), hx11w8PaginationCursorSelfTest());
}

// section 50 is fail-closed: a nested, closure or Object-returning (safeDict / safeValue) write keeps `Object`
function mapLocalsSelfTest (): string[] {
    const problems: string[] = [];
    const probe = path.join(process.cwd(), 'ts', 'src', `zzmaplocalsselftest${process.pid}.ts`);
    const body = [
        "import Exchange from './abstract/binance.js';",
        'export default class zzmaplocalsselftest extends Exchange {',
        "    nestedIntKey (response: any, params = {}) { let data = this.extend (params, {}); if (Array.isArray (response)) { data = this.safeDict (response, 0, {}); } return this.omit (data, 'a'); }",
        "    nestedStrKey (ticker: any, params = {}) { let raw = this.extend (params, {}); if (ticker !== undefined) { if (ticker['x'] !== undefined) { raw = this.safeDict (ticker, 'market', {}); } } return this.omit (raw, 'a'); }",
        "    closure (params = {}) { let p = this.extend (params, {}); const f = () => { p = this.safeValue (params, 'q'); }; f (); return this.omit (p, 'a'); }",
        "    positive (params = {}) { let q = this.extend (params, {}); if (params['z'] !== undefined) { q = this.extend (q, {}); } return this.omit (q, 'a'); }",
        '}',
    ].join('\n');
    try {
        fs.writeFileSync(probe, body);
        const out = new NewTranspiler().transpiler.transpileJavaByPath(probe).content as string;
        if (!/\bObject p = /.test(out)) problems.push("map locals: 'p' has an unproven write and must stay Object");
        // hx4 J11 types the nested safeDict writes and prints their checkcast
        for (const name of [ 'data', 'raw' ]) {
            if (!new RegExp(`\\bObject ${name} = `).test(out) && !new RegExp(`\\b${name} = \\(java\\.util\\.Map<String, Object>\\) this\\.safeDict\\(`).test(out)) problems.push(`map locals: '${name}' safeDict write needs Object or a checkcast`);
        }
        if (!/Map<String, Object> q = /.test(out)) problems.push("map locals: 'q' (every write a Map) must print Map<String, Object>");
    } catch (e: any) {
        problems.push(`map locals self-test threw: ${e.message}`);
    } finally {
        fs.rmSync(probe, { force: true });
    }
    return problems;
}

// H2K-J02: a fresh map local printed Object puts natively; null, published or merged receivers keep the helper
function h2kJ02SelfTest (): string[] {
    const problems: string[] = [];
    const probe = path.join(process.cwd(), 'ts', 'src', `zzh2kj02selftest${process.pid}.ts`);
    const body = [
        "import Exchange from './abstract/binance.js';",
        'export default class zzh2kj02selftest extends Exchange {',
        "    merged (code: string, acc: any) { let a: any = { 'info': acc }; a = this.mergeBalanceAccount (a, code, this.account ()); a['timestamp'] = 1; a[code] = acc; return a; }",
        "    viaParam (params = {}) { let b = {}; b = this.extend (b, params); if (params['z']) { b = this.safeDict (params, 'z', {}); } b['k'] = 1; return b; }",
        "    published (code: string) { let c: any = {}; c = this.mergeBalanceAccount (c, code, this.account ()); this.balance[code] = c; c['free'] = 1; return c; }",
        "    unkeyed (k: any) { let d: any = {}; d = this.mergeBalanceAccount (d, 'x', this.account ()); d[k] = 1; return d; }",
        '}',
    ].join('\n');
    try {
        fs.writeFileSync(probe, body);
        const out = new NewTranspiler().transpiler.transpileJavaByPath(probe).content as string;
        if (/Helpers\.addElementToObject\(a, /.test(out)) problems.push("h2k-j02: fresh local 'a' must put natively");
        for (const name of [ 'c', 'd' ]) {
            if (!new RegExp(`Helpers\\.addElementToObject\\(${name}, `).test(out)) problems.push(`h2k-j02: '${name}' is unproven and must keep the helper`);
        }
        // hx4 J11 declares 'b' a Map; only the declared-Map non-null put may fire, never the h2k cast put
        if (/\(\(java\.util\.Map<String, Object>\)b\)\.put\(/.test(out)) problems.push("h2k-j02: 'b' is unproven and must not take the cast put");
    } catch (e: any) {
        problems.push(`h2k-j02 self-test threw: ${e.message}`);
    } finally {
        fs.rmSync(probe, { force: true });
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
    try {
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
    } finally {
        await transpiler.destroy();
    }
}

// ===== H2K-j01: native top-level newMap (declaration initializer / return value) =====
// `Map<String, Object> x = Helpers.newMap("k", v, ...);` -> `new HashMap` + one put per pair, and
// `return Helpers.newMap(...);` -> a block filling a file-unique temp. Helpers.newMap is exactly a
// plain HashMap filled in argument order; the map is unreachable until filled, so order is moot.
const H2K_J01_HEAD = /^(\s*)(?:(Map<String, Object>|java\.util\.Map<String, Object>) ([A-Za-z_$][\w$]*) = |return )Helpers\.newMap\(/;

// top-level args of the call opened at `start` (index after `(`): [{text, comment}] + end index after `)`
function h2kJ01ScanArgs (src: string, start: number): { args: { text: string, comment: string }[], end: number } | undefined {
    const args: { text: string, comment: string }[] = [];
    let depth = 0;
    let buf = '';
    let comment = '';
    for (let i = start; i < src.length; i++) {
        const ch = src[i];
        if (ch === '"' || ch === '\'') {
            let j = i + 1;
            while (j < src.length && src[j] !== ch) {
                if (src[j] === '\\') j++;
                if (src[j] === '\n') return undefined;
                j++;
            }
            buf += src.slice (i, j + 1);
            i = j;
            continue;
        }
        if (ch === '/' && src[i + 1] === '*') return undefined;
        if (ch === '/' && src[i + 1] === '/') {
            const nl = src.indexOf ('\n', i);
            if (depth !== 0 || nl < 0) return undefined; // comment inside a nested value
            const text = src.slice (i, nl).trim ();
            // `v // c` (last pair) is the open arg's; `v, // c` the previous one's
            if (buf.trim () !== '') comment += (comment ? ' ' : '') + text;
            else if (args.length > 0) args[args.length - 1].comment += (args[args.length - 1].comment ? ' ' : '') + text;
            else return undefined;
            i = nl - 1;
            continue;
        }
        // a type argument list (`HashMap<String, Object>(`, `(Map<String, Object>) x`) is one atom
        const generic = ch === '<' && /[\w$]$/.test (buf) ? /^<[\w$.?, <>]*>(?=[(\[)])/.exec (src.slice (i, i + 200)) : null;
        if (generic !== null) { buf += generic[0]; i += generic[0].length - 1; continue; }
        if (ch === '(' || ch === '[' || ch === '{') depth++;
        else if (ch === ')' || ch === ']' || ch === '}') {
            if (depth === 0) {
                if (ch !== ')') return undefined;
                if (buf.trim () !== '') args.push ({ text: buf, comment });
                else if (args.length > 0) return undefined; // trailing comma
                return { args, end: i + 1 };
            }
            depth--;
        }
        if (ch === ',' && depth === 0) {
            args.push ({ text: buf, comment });
            buf = '';
            comment = '';
            continue;
        }
        buf += ch;
    }
    return undefined;
}

export function nativeJavaTopLevelNewMap (content: string): string {
    const lines = content.split ('\n');
    const out: string[] = [];
    let temp = 0;
    for (let i = 0; i < lines.length; i++) {
        const m = H2K_J01_HEAD.exec (lines[i]);
        if (m === null) { out.push (lines[i]); continue; }
        const rest = lines.slice (i).join ('\n');
        const scan = h2kJ01ScanArgs (rest, m[0].length);
        const tail = scan === undefined ? undefined : /^;[ \t]*(\/\/[^\n]*)?(?=\n|$)/.exec (rest.slice (scan.end));
        const pairs = scan?.args ?? [];
        // fail closed: odd arity, non-literal keys, comments the scan cannot place
        const ok = scan !== undefined && tail !== null && pairs.length > 0 && pairs.length % 2 === 0
            && pairs.every ((a, k) => k % 2 === 1 || (/^\s*"(?:[^"\\]|\\.)*"\s*$/.test (a.text) && a.comment === ''));
        if (!ok) { out.push (lines[i]); continue; }
        const indent = m[1];
        const inner = m[3] === undefined ? indent + '    ' : indent;
        const name = m[3] ?? ('h2kMap' + (temp++));
        const block: string[] = [];
        if (m[3] === undefined) block.push (indent + '{');
        block.push (`${inner}${m[2] ?? 'java.util.HashMap<String, Object>'} ${name} = new java.util.HashMap<String, Object>();`);
        for (let k = 0; k < pairs.length; k += 2) {
            const v = pairs[k + 1];
            block.push (`${inner}${name}.put(${pairs[k].text.trim ()}, ${v.text.trim ()});${v.comment ? ' ' + v.comment : ''}`);
        }
        if (m[3] === undefined) {
            block.push (`${inner}return ${name};${tail![1] ? ' ' + tail![1] : ''}`);
            block.push (indent + '}');
        } else if (tail![1]) {
            block[0] += ' ' + tail![1];
        }
        out.push (...block);
        const consumed = rest.slice (0, scan!.end + tail![0].length).split ('\n').length;
        i += consumed - 1;
    }
    return out.join ('\n');
}

// ===== H2K-j03: native GetValue reads on declared List/String/TypedMap locals =====
// `Helpers.GetValue(x, k)` where x's printed declaration is List<T>, String or a types/ TypedMap view
// -> the helper's own branch; its null receiver/key and out-of-range answers stay explicit
const J03_LIST_RE = /^(?:java\.util\.)?(?:List|ArrayList)<[\w.<>?, ]+>$/;
const J03_TYPED_MAP_VIEWS = new Set([ 'Tickers', 'OpenInterests', 'MarginModes', 'FundingRates', 'LeverageTiers', 'Currencies', 'Balances', 'OrderBooks', 'LastPrices', 'TradingFees', 'CrossBorrowRates', 'IsolatedBorrowRates', 'DepositAddresses', 'DepositWithdrawFees', 'Leverages', 'MarketMarginModes', 'PredictionTickers' ]);

function j03DeclaredTypeOf (lines: string[], lineIndex: number, name: string): string | undefined {
    const any = new RegExp('(?:^|[\\s(,])(?:final\\s+)?([A-Za-z_][\\w.]*(?:<[\\w.<>?, ]*>)?)\\s+' + name + '\\s*(?:=|;|:|,|\\))');
    for (let i = lineIndex; i >= 0; i--) {
        if (!/^\s*(?:\/\/|\*)/.test(lines[i])) {
            const m = any.exec(lines[i]);
            if (m && m[1] !== 'return' && m[1] !== 'new' && m[1] !== 'else') {
                return m[1].replace(/\s+/g, ' ');
            }
        }
        if (JAVA_MEMBER_START_RE.test(lines[i])) {
            return undefined;
        }
    }
    return undefined;
}

// int-valued index expression and its null guard (the helper's toInt is intValue for Integer/Long)
function j03IntIndex (lines: string[], i: number, key: string): { guard: string, idx: string } | undefined {
    if (/^\d+$/.test(key)) {
        return { guard: '', idx: key };
    }
    if (/^\(\(\(long\) [A-Za-z_]\w*\) - 1L\)$/.test(key) || /^\(\(\(\(Number\) [A-Za-z_]\w*\)\.longValue\(\)\) - 1L\)$/.test(key)) {
        return { guard: '', idx: '((int) ' + key + ')' };
    }
    if (!/^[A-Za-z_]\w*$/.test(key)) {
        return undefined;
    }
    if (javaIntCounterIndex(lines, i, key)) {
        return { guard: '', idx: key };
    }
    const t = j03DeclaredTypeOf(lines, i, key);
    if (t === 'int') return { guard: '', idx: key };
    if (t === 'long') return { guard: '', idx: '((int) ' + key + ')' };
    if (t === 'Long' || t === 'Integer') return { guard: key + ' == null || ', idx: key + '.intValue()' };
    return undefined;
}

export function nativeJavaJ03ElementReads (content: string): string {
    if (!content.includes('Helpers.GetValue(')) {
        return content;
    }
    const lines = content.split('\n');
    const call = /Helpers\.GetValue\(([A-Za-z_]\w*), (\d+|[A-Za-z_]\w*|\(\(\(long\) [A-Za-z_]\w*\) - 1L\)|\(\(\(\(Number\) [A-Za-z_]\w*\)\.longValue\(\)\) - 1L\))\)/g;
    let changed = false;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!line.includes('Helpers.GetValue(') || /^\s*(?:\/\/|\*)/.test(line)) {
            continue;
        }
        const next = line.replace(call, (whole, r, key) => {
            if (r === 'this' || r === key) return whole;
            const cls = j03DeclaredTypeOf(lines, i, r);
            if (cls === undefined) return whole;
            if (J03_LIST_RE.test(cls) || cls === 'String') {
                const ix = j03IntIndex(lines, i, key);
                if (ix === undefined) return whole;
                const len = cls === 'String' ? r + '.length()' : r + '.size()';
                const low = /^\d+$/.test(ix.idx) ? '' : ix.idx + ' < 0 || ';
                const get = cls === 'String' ? 'String.valueOf(' + r + '.charAt(' + ix.idx + '))' : r + '.get(' + ix.idx + ')';
                return `(${r} == null || ${ix.guard}${low}${ix.idx} >= ${len} ? null : ${get})`;
            }
            const view = cls.replace(/^io\.github\.ccxt\.types\./, '');
            if (J03_TYPED_MAP_VIEWS.has(view) && /^[A-Za-z_]\w*$/.test(key) && j03DeclaredTypeOf(lines, i, key) === 'String') {
                return `(${r} == null || ${key} == null ? null : ${r}.get(${key}))`;
            }
            return whole;
        });
        if (next !== line) {
            lines[i] = next;
            changed = true;
        }
    }
    return changed ? lines.join('\n') : content;
}

// ===== H2K-j05: native `+` for Helpers.add with a statically-String first operand =====
// javac binds such a call to add(String, String|Object) = `a + String.valueOf(b)`, which is
// exactly Java's native concat; anything else (Object/number first) keeps the helper.
const J05_STRING_CALLS = /^this\.(safeString|safeString2|safeStringN|safeStringUpper|safeStringLower|urlencode|json|numberToString|uuid)\(/;

// mask string/char literals and comments with spaces (same length)
function j05Mask (s: string): string {
    let out = '';
    for (let i = 0; i < s.length; i++) {
        const ch = s[i];
        if (ch === '"' || ch === '\'') {
            let j = i + 1;
            while (j < s.length && s[j] !== ch && s[j] !== '\n') { j += s[j] === '\\' ? 2 : 1; }
            out += ch + ' '.repeat(Math.max(0, Math.min(j, s.length - 1) - i - 1)) + (j < s.length ? ch : '');
            i = Math.min(j, s.length - 1);
            continue;
        }
        if (ch === '/' && s[i + 1] === '/') {
            let j = s.indexOf('\n', i); if (j < 0) { j = s.length; }
            out += ' '.repeat(j - i); i = j - 1; continue;
        }
        if (ch === '/' && s[i + 1] === '*') {
            let j = s.indexOf('*/', i + 2); j = j < 0 ? s.length : j + 2;
            out += s.slice(i, j).replace(/[^\n]/g, ' '); i = j - 1; continue;
        }
        out += ch;
    }
    return out;
}

// end index (exclusive) of the balanced group opened at `open`, over masked text
function j05Close (m: string, open: number): number {
    let depth = 0;
    for (let i = open; i < m.length; i++) {
        const c = m[i];
        if (c === '(' || c === '[' || c === '{') { depth++; }
        else if (c === ')' || c === ']' || c === '}') { depth--; if (depth === 0) { return i + 1; } }
    }
    return -1;
}

// split masked expression at top-level occurrences; undefined when it holds any other
// top-level operator (ternary, comparison, arithmetic, assignment, lambda, ...)
function j05PlusTerms (m: string): Array<[number, number]> | undefined {
    const terms: Array<[number, number]> = [];
    let depth = 0; let start = 0;
    for (let i = 0; i < m.length; i++) {
        const c = m[i];
        if (c === '(' || c === '[' || c === '{') { depth++; continue; }
        if (c === ')' || c === ']' || c === '}') { depth--; continue; }
        if (depth !== 0) { continue; }
        if (c === '+') {
            if (m[i + 1] === '+' || m[i + 1] === '=' || m.slice(start, i).trim() === '') { return undefined; }
            terms.push([start, i]); start = i + 1; continue;
        }
        if (/[-*\/%?:=<>!&|^~,;]/.test(c)) {
            return undefined;
        }
    }
    terms.push([start, m.length]);
    return terms;
}

// is the whole (trimmed) masked term one primary expression (no top-level operators)?
function j05IsPrimary (m: string): boolean {
    const t = j05PlusTerms(m);
    return t !== undefined && t.length === 1;
}

function j05StripParens (raw: string, m: string): [string, string] {
    let r = raw.trim(); let k = m.trim();
    while (k.startsWith('(') && j05Close(k, 0) === k.length) { r = r.slice(1, -1).trim(); k = k.slice(1, -1).trim(); }
    return [r, k];
}

// nearest same-member declaration of `name` before `pos` is `String` (params included)
function j05StringLocal (masked: string, name: string, pos: number): boolean {
    const before = masked.slice(0, pos);
    const breaks = [...before.matchAll(/^[ \t]*(?:public|private|protected)[ \t]/gm)];
    if (breaks.length === 0) { return false; }
    const window = before.slice(breaks[breaks.length - 1].index);
    const decl = new RegExp(`(?:^|[\\s(,])([\\w.<>?,\\[\\]]+)\\s+${name}\\s*(?=[=;,)])`, 'g');
    let last: string | undefined;
    let mm;
    while ((mm = decl.exec(window)) !== null) { last = mm[1]; }
    return last === 'String' || last === 'java.lang.String';
}

function j05IsString (raw: string, m: string, masked: string, pos: number, ownMethods: Set<string>): boolean {
    const [r, k] = j05StripParens(raw, m);
    const terms = j05PlusTerms(k);
    if (terms === undefined || k === '') { return false; }
    if (terms.length > 1) {
        return terms.some(([a, b]) => j05IsString(r.slice(a, b), k.slice(a, b), masked, pos, ownMethods));
    }
    if (/^"/.test(r) && k.length === r.length && /^"\s*"$/.test(k)) { return true; }
    if (/^\(String\)/.test(k)) { return j05IsPrimary(k.slice('(String)'.length)); }
    const field = /^this\.([A-Za-z_]\w*)$/.exec(k);
    if (field !== null) { return JS_STRING_MEMBER_FIELDS.has(field[1]) && !ownMethods.has('field:' + field[1]); }
    const call = J05_STRING_CALLS.exec(k) || /^(String)\.valueOf\(/.exec(k);
    if (call !== null) {
        const open = k.indexOf('(');
        return j05Close(k, open) === k.length && !ownMethods.has(call[1]);
    }
    if (/^[A-Za-z_]\w*$/.test(k)) { return j05StringLocal(masked, k, pos); }
    return false;
}

export function nativeJavaStringAdd (content: string): string {
    if (content.indexOf('Helpers.add(') === -1) { return content; }
    // a class that (re)declares one of the anchored members fails closed for that member
    const ownMethods = new Set<string>();
    for (const d of content.matchAll(/\b(?:public|private|protected)\s+(?:static\s+)?[\w.<>?,\[\] ]+?\s+(\w+)\s*(\(|=|;)/g)) {
        ownMethods.add(d[2] === '(' ? d[1] : 'field:' + d[1]);
    }
    let masked = j05Mask(content);
    let from = masked.length;
    for (;;) {
        const at = masked.lastIndexOf('Helpers.add(', from);
        if (at === -1) { break; }
        from = at - 1;
        if (at > 0 && /[\w.]/.test(masked[at - 1])) { continue; }
        const open = at + 'Helpers.add'.length;
        const end = j05Close(masked, open);
        if (end === -1) { continue; }
        const inner = masked.slice(open + 1, end - 1);
        const args = splitTopLevelArgs(inner);
        if (args.length !== 2) { continue; }
        const aM = args[0]; const bM = args[1];
        const aRaw = content.slice(open + 1, open + 1 + aM.length);
        const bRaw = content.slice(open + 2 + aM.length, end - 1);
        if (!j05IsString(aRaw, aM, masked, at, ownMethods)) { continue; }
        // a bare statement `Helpers.add(..);` is not a legal native expression statement
        if (/[;{}]\s*$/.test(masked.slice(Math.max(0, at - 200), at)) && /^\s*;/.test(masked.slice(end))) { continue; }
        const b = bRaw.trim();
        const bPrimary = j05IsPrimary(bM.trim()) && !/^\(\w[\w.<>?, ]*\)/.test(bM.trim());
        const a = aRaw.trim();
        const aSafe = j05PlusTerms(aM.trim()) !== undefined ? a : `(${a})`;
        const repl = `(${aSafe} + ${bPrimary ? b : `(${b})`})`;
        content = content.slice(0, at) + repl + content.slice(end);
        masked = j05Mask(content);
    }
    return content;
}

// ===== H2K-j06: native callDynamically (handler dispatch + ws receivers) =====
// No generated class is subclassed and only ws/ArrayCache declares append (only ws/OrderBookSide
// store/storeArray), so the reflective lookup binds exactly the method a typed call binds.
const H2K_J06_RECEIVER_METHODS: { [method: string]: { cls: string, argc: number[] } } = {
    'append': { cls: 'io.github.ccxt.ws.ArrayCache', argc: [1] },
    'store': { cls: 'io.github.ccxt.ws.OrderBookSide', argc: [2, 3] },
    'storeArray': { cls: 'io.github.ccxt.ws.OrderBookSide', argc: [1] },
};
const H2K_J06_COERCED_PARAMS = /^(?:java\.lang\.)?(?:String|Long|Double|Integer|Float|long|double|int|float|(?:java\.util\.)?List(?:<.*>)?)$/;

function h2kJ06SplitArgs (text: string): string[] {
    const out: string[] = [];
    let depth = 0;
    let buf = '';
    let quote = '';
    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (quote !== '') {
            buf += ch;
            if (ch === '\\') { buf += text[++i]; continue; }
            if (ch === quote) quote = '';
            continue;
        }
        if (ch === '"' || ch === '\'') { quote = ch; buf += ch; continue; }
        if ('<([{'.includes(ch)) depth++;
        if ('>)]}'.includes(ch)) depth--;
        if (ch === ',' && depth === 0) { out.push(buf.trim()); buf = ''; continue; }
        buf += ch;
    }
    if (buf.trim() !== '') out.push(buf.trim());
    return out;
}

// `Helpers.callDynamically(<id|this.id>, "<m>", new Object[]{..});` statements for the table above
function h2kJ06NativeReceiverCalls (content: string): string {
    const call = /(^|\n)([ \t]*)Helpers\.callDynamically\(((?:this\.)?\w+), "(\w+)", new Object\[\]\{/g;
    let out = '';
    let cursor = 0;
    let m;
    while ((m = call.exec(content)) !== null) {
        const spec = H2K_J06_RECEIVER_METHODS[m[4]];
        if (spec === undefined || m[3] === 'this') continue;
        const argsAt = m.index + m[0].length;
        let depth = 1;
        let j = argsAt;
        let quote = '';
        while (j < content.length && depth > 0) {
            const ch = content[j];
            if (quote !== '') { if (ch === '\\') j++; else if (ch === quote) quote = ''; }
            else if (ch === '"') quote = ch;
            else if ('{('.includes(ch)) depth++;
            else if ('})'.includes(ch)) depth--;
            j++;
        }
        if (depth !== 0 || !content.startsWith(');', j)) continue;
        const args = content.slice(argsAt, j - 1).trim();
        if (!spec.argc.includes(args === '' ? 0 : h2kJ06SplitArgs(args).length)) continue;
        const start = m.index + m[1].length + m[2].length;
        out += content.slice(cursor, start) + '((' + spec.cls + ') ' + m[3] + ').' + m[4] + '(' + args + ')';
        cursor = j + 1;
        call.lastIndex = cursor;
    }
    return cursor === 0 ? content : out + content.slice(cursor);
}

interface H2kJ06Method { name: string, params: string[][] }

function h2kJ06FileMethods (lines: string[]): { starts: number[], byName: Map<string, H2kJ06Method[]> } {
    const starts: number[] = [];
    const byName = new Map<string, H2kJ06Method[]>();
    const sig = /^    (?:public|private|protected)\b(?:\s+(?:static|synchronized|final))*\s+([\w.<>, ?\[\]]+?)\s+(\w+)\((.*)\)\s*(?:throws [\w., ]+)?\s*\{?\s*$/;
    for (let i = 0; i < lines.length; i++) {
        if (!/^    (?:public|private|protected)\b/.test(lines[i])) continue;
        starts.push(i);
        const s = sig.exec(lines[i]);
        if (s === null) continue;
        const params = h2kJ06SplitArgs(s[3]).map((p) => {
            const pm = /^(?:final\s+)?(.+?)\s+(\w+)$/.exec(p);
            return pm === null ? [ p, '' ] : [ pm[1], pm[2] ];
        });
        const list = byName.get(s[2]) ?? [];
        list.push({ name: s[2], params });
        byName.set(s[2], list);
    }
    return { starts, byName };
}

// `Object h = this.safeValue(M, k)` over a same-method never-written `M = {"k": "handleX", ..}` literal,
// then `Helpers.callDynamically(this, h, ..);` -> switch over the literal's handler names
function h2kJ06NativeHandlerDispatch (content: string): string {
    if (!content.includes('Helpers.callDynamically(this, ')) return content;
    const lines = content.split('\n');
    const { starts, byName } = h2kJ06FileMethods(lines);
    const site = /^(\s*)Helpers\.callDynamically\(this, (\w+), new Object\[\] \{(.*)\}\);\s*$/;
    let changed = false;
    for (let i = lines.length - 1; i >= 0; i--) {
        const s = site.exec(lines[i]);
        if (s === null) continue;
        const [ , indent, v, argText ] = s;
        let from = -1;
        for (const st of starts) if (st < i) from = st;
        if (from < 0) continue;
        let to = starts.find((st) => st > i) ?? lines.length;
        const body = lines.slice(from, to);
        const bodyText = body.join('\n');
        let prev = i - 1;
        while (prev > from && lines[prev].trim() === '') prev--;
        if (!/[{};]$/.test(lines[prev].trim())) continue;
        // the handler local: one declaration, never reassigned
        const decls = body.filter((l) => new RegExp('^\\s*\\S.*\\b' + v + ' = ').test(l) || new RegExp('^\\s*' + v + ' = ').test(l));
        if (decls.length !== 1) continue;
        const dm = new RegExp('^\\s*Object ' + v + ' = (?:this\\.safeValue\\((\\w+), \\w+\\)|\\((\\w+) == null \\|\\| \\w+ == null \\? null : (\\w+)\\.get\\(\\w+\\)\\));\\s*$').exec(decls[0]);
        if (dm === null || (dm[2] !== undefined && dm[2] !== dm[3])) continue;
        const map = dm[1] ?? dm[2];
        // the map: one literal declaration of string values, only read afterwards
        const mapDecl = body.findIndex((l) => new RegExp('^\\s*Map<String, Object> ' + map + ' = new HashMap<String, Object>\\(\\) \\{\\{\\s*$').test(l));
        if (mapDecl < 0) continue;
        const handlers: string[] = [];
        let k = mapDecl + 1;
        let literal = true;
        for (; k < body.length && body[k].trim() !== '}};'; k++) {
            const pm = /^\s*put\( "(?:[^"\\]|\\.)*", "(\w+)"\);\s*$/.exec(body[k]);
            if (pm === null) { literal = false; break; }
            if (!handlers.includes(pm[1])) handlers.push(pm[1]);
        }
        if (!literal || k >= body.length || handlers.length === 0) continue;
        const uses = bodyText.match(new RegExp('\\b' + map + '\\b(?!\\s*=\\s*new HashMap)[^\\n]{0,12}', 'g')) ?? [];
        const readUse = new RegExp('^' + map + '(?:, \\w+\\)| == null| \\? null|\\.get\\(\\w+\\)|\\.keySet\\(\\))');
        if (uses.some((u) => !readUse.test(u))) continue;
        if ((bodyText.match(new RegExp('\\b' + map + ' = ', 'g')) ?? []).length !== 1) continue;
        // arguments: identifiers with one visible declared type
        const args = h2kJ06SplitArgs(argText);
        const signature = byName.get(lines[from].match(/\s(\w+)\(/)?.[1] ?? '')?.find(() => true);
        const argTypes = args.map((a) => {
            if (!/^\w+$/.test(a)) return undefined;
            const local = body.filter((l) => new RegExp('^\\s*(?:final\\s+)?[\\w.<>, ?]+\\s+' + a + ' = ').test(l));
            const param = signature?.params.find((p) => p[1] === a);
            if (local.length + (param !== undefined ? 1 : 0) !== 1) return undefined;
            return param !== undefined ? param[0] : /^\s*(?:final\s+)?([\w.<>, ?]+?)\s+\w+ = /.exec(local[0])![1];
        });
        if (argTypes.some((t) => t === undefined || t === 'var')) continue;
        const cases: string[] = [];
        for (const h of handlers) {
            const decl = byName.get(h);
            if (decl === undefined || decl.length !== 1 || decl[0].params.length !== args.length) break;
            const printed = args.map((a, n) => {
                const p = decl[0].params[n][0];
                const t = argTypes[n]!;
                if (p.endsWith('...')) return undefined;
                if (t === p) return a;
                if (t === 'Object' && !H2K_J06_COERCED_PARAMS.test(p)) return '(' + p + ') ' + a;
                if (p === 'Object') return a;
                return undefined;
            });
            if (printed.some((x) => x === undefined)) break;
            cases.push(indent + '    case "' + h + '":', indent + '        this.' + h + '(' + printed.join(', ') + ');', indent + '        break;');
        }
        if (cases.length !== handlers.length * 3) continue;
        lines.splice(i, 1,
            indent + 'switch (String.valueOf(' + v + '))',
            indent + '{',
            ...cases,
            indent + '    default:',
            indent + '        throw new RuntimeException("Method not found: " + ' + v + ');',
            indent + '}');
        changed = true;
    }
    return changed ? lines.join('\n') : content;
}

export function h2kJ06NativeCallDynamically (content: string): string {
    return h2kJ06NativeHandlerDispatch(h2kJ06NativeReceiverCalls(content));
}

// ===== H2K-j07: getArrayLength on a declared List/String receiver =====
// `Helpers.getArrayLength(x)` -> `(x == null ? 0 : x.size())` / `.length()` when x has exactly one declaration in
// the member (local or parameter) whose printed type is List/ArrayList/String; the null arm is the helper's own 0.
const H2K_J07_TYPE_RE = /^(?:java\.util\.)?(?:List|ArrayList)<[\w.<>?, ]+>$|^String$/;

export function h2kJ07NativeDeclaredLength (content: string): string {
    if (!content.includes('Helpers.getArrayLength(')) {
        return content;
    }
    const lines = content.split('\n');
    const call = /Helpers\.getArrayLength\(([A-Za-z_]\w*)\)/g;
    let changed = false;
    for (let i = 0; i < lines.length; i++) {
        if (!lines[i].includes('Helpers.getArrayLength(') || /^\s*(?:\/\/|\*)/.test(lines[i])) {
            continue;
        }
        const before = lines[i];
        lines[i] = before.replace(call, (whole, name) => {
            const [start, end] = javaMemberRange(lines, i);
            const typed = new RegExp('(?:^|[\\s(,])((?:java\\.util\\.)?[A-Za-z_][\\w.]*(?:<[\\w.<>?, ]*>)?)\\s+' + name + '\\s*(?=[=,)])', 'g');
            const lambda = new RegExp('(?:\\(\\s*|,\\s*)' + name + '\\s*(?:,[^)]*)?\\)\\s*->|(?<![\\w.$])' + name + '\\s*->');
            const types: string[] = [];
            let at = -1;
            for (let k = start; k < end; k++) {
                if (/^\s*(?:\/\/|\*)/.test(lines[k])) continue;
                if (lambda.test(lines[k])) return whole;
                const code = lines[k].replace(/"(?:[^"\\]|\\.)*"/g, '""');
                for (const m of code.matchAll(typed)) {
                    if ([ 'return', 'else', 'new', 'case', 'throw' ].includes(m[1])) continue;
                    types.push(m[1]);
                    at = k;
                }
            }
            if (types.length !== 1 || at > i || !H2K_J07_TYPE_RE.test(types[0])) {
                return whole;
            }
            return '(' + name + ' == null ? 0 : ' + name + (types[0] === 'String' ? '.length()' : '.size()') + ')';
        });
        changed = changed || lines[i] !== before;
    }
    return changed ? lines.join('\n') : content;
}

// ===== H2K-j10: native ordered comparisons over declared numeric operands =====
// Helpers.isGreaterThan/isLessThan/isGreaterThanOrEqual/isLessThanOrEqual -> `> < >= <=` when both
// operands are int literals or locals/params the final text declares Long/Integer/long/int/Double; a
// boxed operand gets the helper's null table. Double pairs only for `>` (the others go through isEqual).
const H2K_J10_CALL = /Helpers\.is(GreaterThan|LessThan|GreaterThanOrEqual|LessThanOrEqual)\(/g;
const H2K_J10_OPS: Record<string, string> = { GreaterThan: '>', LessThan: '<', GreaterThanOrEqual: '>=', LessThanOrEqual: '<=' };
const H2K_J10_TYPES: Record<string, { kind: string, boxed: boolean }> = {
    Long: { kind: 'long', boxed: true }, Integer: { kind: 'long', boxed: true }, long: { kind: 'long', boxed: false },
    int: { kind: 'long', boxed: false }, Double: { kind: 'double', boxed: true }, double: { kind: 'double', boxed: false },
};

function h2kJ10SplitArgs (text: string, start: number): { args: string[], end: number } | undefined {
    const args: string[] = [];
    let depth = 0, cur = '', quote = '';
    for (let i = start; i < text.length; i++) {
        const c = text[i];
        if (quote !== '') {
            cur += c;
            if (c === '\\') { cur += text[++i]; continue; }
            if (c === quote) quote = '';
            continue;
        }
        if (c === '"' || c === '\'') { quote = c; cur += c; continue; }
        if (c === '(' || c === '[' || c === '{') depth++;
        if (c === ')' || c === ']' || c === '}') {
            if (depth === 0) { args.push (cur.trim ()); return { args, end: i }; }
            depth--;
        }
        if (c === ',' && depth === 0) { args.push (cur.trim ()); cur = ''; continue; }
        if (c === '\n') return undefined;
        cur += c;
    }
    return undefined;
}

function h2kJ10StripParens (text: string): string {
    while (text.startsWith ('(') && text.endsWith (')')) {
        let depth = 0, wraps = true;
        for (let i = 0; i < text.length - 1; i++) {
            if (text[i] === '(') depth++;
            if (text[i] === ')') depth--;
            if (depth === 0) { wraps = false; break; }
        }
        if (!wraps) break;
        text = text.slice (1, -1).trim ();
    }
    return text;
}

// the one declaration of `name` in the member (none elsewhere, no lambda param, no class field)
function h2kJ10DeclaredType (member: string, name: string, fields: Set<string>): { kind: string, boxed: boolean } | undefined {
    if (fields.has (name)) return undefined;
    const esc = name.replace (/\$/g, '\\$');
    const decl = new RegExp ('(?:^|[\\s(,])([\\w.$]+(?:<[\\w.<>, ?]*>)?(?:\\[\\])?)\\s+' + esc + '\\s*(=|;|,|\\)|:)', 'gm');
    const found: string[] = [];
    let m;
    while ((m = decl.exec (member)) !== null) {
        if (/^(return|else|new|case|throw|instanceof)$/.test (m[1])) continue;
        found.push (m[1] + (m[1] === 'var' ? member.slice (m.index + m[0].length).match (/^\s*(-?\d+);/)?.[1] ?? '?' : ''));
    }
    if (new RegExp ('(?:\\(|,\\s*)' + esc + '\\s*(?:,[\\w\\s,]*)?\\)\\s*->|\\b' + esc + '\\s*->').test (member)) return undefined;
    if (found.length !== 1) return undefined;
    const t = found[0].replace (/^final /, '');
    if (/^var-?\d+$/.test (t)) return { kind: 'long', boxed: false }; // `var i = 0` counter: int
    return H2K_J10_TYPES[t];
}

function h2kJ10Operand (text: string, member: string, fields: Set<string>): { kind: string, boxed: boolean, text: string, literal?: boolean } | undefined {
    const inner = h2kJ10StripParens (text);
    if (/^-?\d{1,15}L?$/.test (inner)) return { kind: 'long', boxed: false, text: inner, literal: true };
    if (/^-?\d{1,15}\.\d{1,15}$/.test (inner)) return { kind: 'double', boxed: false, text: inner, literal: true };
    if (/^[A-Za-z_$][\w$]*$/.test (inner)) {
        const t = h2kJ10DeclaredType (member, inner, fields);
        return t === undefined ? undefined : { ...t, text: inner };
    }
    // `(x + 1L)` / `(x - 1L)` over a declared long: the operand unboxes (or throws) before the helper runs
    const arith = inner.match (/^([A-Za-z_$][\w$]*) ([+-]) (\d+L?)$/);
    if (arith !== null) {
        const t = h2kJ10DeclaredType (member, arith[1], fields);
        if (t !== undefined && t.kind === 'long') return { kind: 'long', boxed: false, text: '(' + inner + ')' };
    }
    return undefined;
}

function h2kJ10Compare (helper: string, l, r): string | undefined {
    // `>=` adds isEqual, exact for a double only against a small literal; `< <=` are true for NaN (keep)
    const longs = l.kind === 'long' && r.kind === 'long';
    const a = l.text, b = r.text;
    if (!longs && (helper === 'LessThan' || helper === 'LessThanOrEqual') && r.literal && !l.literal) {
        // helper LT = !(GT || EQ), LE = !GT: NaN and a null left side answer true
        const neg = `!(${a} ${helper === 'LessThan' ? '>=' : '>'} ${b})`;
        return l.boxed ? `(${a} == null || ${neg})` : `(${neg})`;
    }
    if (!longs && helper !== 'GreaterThan' && (helper !== 'GreaterThanOrEqual' || !(l.literal || r.literal))) return undefined;
    const cmp = `${a} ${H2K_J10_OPS[helper]} ${b}`;
    if (!l.boxed && !r.boxed) return `(${cmp})`;
    const join = (parts, sep) => '(' + parts.filter ((x) => x !== undefined).join (sep) + ')';
    switch (helper) {
    case 'GreaterThan': return join ([ l.boxed ? `${a} != null` : undefined, r.boxed ? `(${b} == null || ${cmp})` : cmp ], ' && ');
    case 'LessThan': return join ([ r.boxed ? `${b} != null` : undefined, l.boxed ? `(${a} == null || ${cmp})` : cmp ], ' && ');
    case 'GreaterThanOrEqual': return join ([ r.boxed ? `${b} == null` : undefined, l.boxed ? `(${a} != null && ${cmp})` : cmp ], ' || ');
    case 'LessThanOrEqual': return join ([ l.boxed ? `${a} == null` : undefined, r.boxed ? `(${b} != null && ${cmp})` : cmp ], ' || ');
    }
    return undefined;
}

export function h2kJ10NativeComparisons (content: string): string {
    if (!/Helpers\.is(?:Greater|Less)Than/.test (content)) return content;
    const lines = content.split ('\n');
    const fields = new Set<string> ();
    for (const line of lines) {
        const f = line.match (/^    (?:(?:public|private|protected|static|final|volatile|transient) )*[\w.][\w.<>, ?\[\]]* ([A-Za-z_$][\w$]*)\s*(?:=|;)/);
        if (f !== null) fields.add (f[1]);
    }
    const starts: number[] = [];
    for (let i = 0; i < lines.length; i++) {
        if (/^    (?:public|private|protected)\b.*\(/.test (lines[i])) starts.push (i);
    }
    for (let s = 0; s < starts.length; s++) {
        const from = starts[s], to = s + 1 < starts.length ? starts[s + 1] : lines.length;
        const member = lines.slice (from, to).join ('\n');
        if (!member.includes ('Helpers.is')) continue;
        for (let i = from; i < to; i++) {
            const trimmed = lines[i].trim ();
            if (trimmed.startsWith ('//') || trimmed.startsWith ('*')) continue;
            let line = lines[i], again = true;
            while (again) { // innermost-last: re-scan after each rewrite
                again = false;
                H2K_J10_CALL.lastIndex = 0;
                let m;
                while ((m = H2K_J10_CALL.exec (line)) !== null) {
                    const split = h2kJ10SplitArgs (line, m.index + m[0].length);
                    if (split === undefined || split.args.length !== 2) continue;
                    const l = h2kJ10Operand (split.args[0], member, fields);
                    const r = h2kJ10Operand (split.args[1], member, fields);
                    if (l === undefined || r === undefined) continue;
                    const native = h2kJ10Compare (m[1], l, r);
                    if (native === undefined) continue;
                    line = line.slice (0, m.index) + native + line.slice (split.end + 1);
                    again = true;
                    break;
                }
            }
            lines[i] = line;
        }
    }
    return lines.join ('\n');
}

// ===== H2K-j15: native promiseAll / objectValues / opNeg (post-print text pass) =====
// index of the `)` closing the `(` at `open`, skipping string/char literals; -1 when unbalanced
function h2kJ15Close (s: string, open: number): number {
    let depth = 0;
    for (let k = open; k < s.length; k++) {
        const ch = s[k];
        if (ch === '"' || ch === '\'') {
            for (k++; k < s.length && s[k] !== ch; k++) if (s[k] === '\\') k++;
        } else if (ch === '(') depth++;
        else if (ch === ')' && --depth === 0) return k;
    }
    return -1;
}

// Helpers.promiseAll(x): same List cast, CompletableFuture filter, allOf, in-order join into an ArrayList
function h2kJ15PromiseAll (content: string): string {
    const head = 'Helpers.promiseAll(';
    let out = '';
    let at = 0;
    for (let k = content.indexOf (head); k !== -1; k = content.indexOf (head, at)) {
        if (/[\w$.]$/.test (content.slice (0, k))) { out += content.slice (at, k + head.length); at = k + head.length; continue; }
        const close = h2kJ15Close (content, k + head.length - 1);
        if (close === -1) break;
        const arg = content.slice (k + head.length, close);
        out += content.slice (at, k) + `((java.util.List<?>)(${arg})).stream().filter(java.util.concurrent.CompletableFuture.class::isInstance)`
            + '.map((promiseAllItem) -> (java.util.concurrent.CompletableFuture<?>) promiseAllItem)'
            + '.collect(java.util.stream.Collectors.collectingAndThen(java.util.stream.Collectors.toList(), (promiseAllFutures) -> '
            + 'java.util.concurrent.CompletableFuture.allOf(promiseAllFutures.toArray(new java.util.concurrent.CompletableFuture<?>[0]))'
            + '.<java.util.List<Object>>thenApply((promiseAllDone) -> promiseAllFutures.stream().<Object>map(java.util.concurrent.CompletableFuture::join)'
            + '.collect(java.util.stream.Collectors.toCollection(java.util.ArrayList<Object>::new)))))';
        at = close + 1;
    }
    return out + content.slice (at);
}

// member-local facts: the single declaration line of `name` in lines[from, to) and whether it is re-assigned
function h2kJ15Local (lines: string[], from: number, to: number, name: string) {
    const decl = new RegExp (`^\\s*([A-Za-z_][\\w.<>, ]*?)\\s+${name}\\s*=\\s*(.*);\\s*$`);
    const write = new RegExp (`(?<![\\w$.])${name}\\s*(?:=(?!=)|\\+\\+|--|[-+*/%]=)|(?:\\+\\+|--)${name}\\b`);
    const found: { index: number, type: string, init: string }[] = [];
    let writes = 0;
    for (let k = from; k < to; k++) {
        const code = lines[k].replace (/\/\/.*$/, '').replace (/"(?:[^"\\]|\\.)*"/g, '""');
        const m = decl.exec (code);
        if (m !== null && !/^(?:return|throw|else)$/.test (m[1])) found.push ({ index: k, type: m[1].replace (/\s+/g, ''), init: m[2] });
        else if (write.test (code)) writes++;
    }
    return found.length === 1 && writes === 0 ? found[0] : undefined;
}

// Helpers.objectValues(m) on a fresh member-local Map (groupBy result / empty literal): no sharing, never null
// Helpers.opNeg(x) inside the true arm of `!Objects.equals(x, null) ? ... : ...` on a Long/Double local
function h2kJ15Members (content: string): string {
    if (!content.includes ('Helpers.objectValues(') && !content.includes ('Helpers.opNeg(')) return content;
    const lines = content.split ('\n');
    const starts: number[] = [];
    for (let i = 0; i < lines.length; i++) if (/^    (?:public|private|protected)\b/.test (lines[i])) starts.push (i);
    for (let s = 0; s < starts.length; s++) {
        const from = starts[s];
        const to = s + 1 < starts.length ? starts[s + 1] : lines.length;
        for (let j = from + 1; j < to; j++) {
            lines[j] = lines[j].replace (/Helpers\.objectValues\(([A-Za-z_]\w*)\)/g, (call, name) => {
                const d = h2kJ15Local (lines, from, to, name);
                if (d === undefined || d.index >= j || d.type !== 'Map<String,Object>') return call;
                if (!/^this\.groupBy\(/.test (d.init) && !/^new HashMap<String, Object>\(\) \{\{\}\}$/.test (d.init)) return call;
                if (lines.slice (d.index, j + 1).some ((l) => l.includes ('->'))) return call;
                return `new java.util.ArrayList<Object>(${name}.values())`;
            });
            lines[j] = lines[j].replace (/\(\(\(!java\.util\.Objects\.equals\(([A-Za-z_]\w*), null\)\)\)\) \? ([^?:]*?Helpers\.opNeg\(\1\)[^?:]*?) : /g, (whole, name, arm) => {
                const d = h2kJ15Local (lines, from, to, name);
                if (d === undefined || d.index >= j || (d.type !== 'Long' && d.type !== 'Double')) return whole;
                if (new RegExp (`(?<![\\w$.])${name}\\s*=(?!=)`).test (arm)) return whole;
                return whole.replace (`Helpers.opNeg(${name})`, `${d.type}.valueOf(-${name})`);
            });
        }
    }
    return lines.join ('\n');
}

function nativeJavaH2kJ15 (content: string): string {
    return h2kJ15Members (content.includes ('Helpers.promiseAll(') ? h2kJ15PromiseAll (content) : content);
}

// ===== H2K-J16: nested / argument Helpers.newMap literals -> hoisted native HashMap =====
// A `Helpers.newMap("k", v, ...)` used as a call argument or literal value (not the whole RHS of a
// declaration/assignment/return: H2K-J01) becomes a preceding `HashMap` local filled by `put`s,
// only when everything Java evaluates before it in the statement commutes with its values.
export function j16Stats (): Record<string, number> { return (globalThis as any).__j16Stats ??= {}; }
function j16Count (k: string) { const s = j16Stats (); s[k] = (s[k] || 0) + 1; }
// base readers that write no state (BaseExchange.java / Exchange.java / java.util)
function j16PureCall (n: string): boolean { return /^(?:this\.(?:safe(?:String|StringLower|StringUpper|Integer|IntegerProduct|Number|Float|Value|Bool|Dict|List|String2|Integer2|Number2|Value2|Bool2|Dict2|List2|StringN|IntegerN|NumberN|ValueN|Timestamp|Timestamp2|TimestampN)|iso8601|parseNumber|numberToString|omitZero)|java\.util\.Objects\.equals|java\.util\.Objects\.requireNonNullElse|Helpers\.newMap|Precise\.string(?:Abs|Mul|Add|Sub|Div))$/.test (n); }

// blank string/char literals and comments (length-preserving) so brackets can be matched
function j16Mask (s: string): string {
    const out = s.split ('');
    let i = 0;
    while (i < s.length) {
        const c = s[i];
        if (c === '/' && s[i + 1] === '/') {
            while (i < s.length && s[i] !== '\n') out[i++] = ' ';
        } else if (c === '/' && s[i + 1] === '*') {
            const e = s.indexOf ('*/', i + 2);
            const end = e < 0 ? s.length : e + 2;
            for (; i < end; i++) if (s[i] !== '\n') out[i] = ' ';
        } else if (c === '"' || c === '\'') {
            i++;
            while (i < s.length && s[i] !== c && s[i] !== '\n') {
                if (s[i] === '\\') out[i++] = ' ';
                out[i++] = ' ';
            }
            i++;
        } else i++;
    }
    // generic type arguments (`HashMap<String, Object>(`, `(Map<String, Object>)x`): hide their commas
    return out.join ('').replace (/(?<=[A-Za-z_$])<[\w$.?<>, ]*>(?=\s*[({)\[])/g, (g) => g.replace (/,/g, ' '));
}

function j16Close (m: string, open: number): number {
    let d = 0;
    for (let k = open; k < m.length; k++) {
        const c = m[k];
        if (c === '(' || c === '[' || c === '{') d++;
        else if (c === ')' || c === ']' || c === '}') { d--; if (d === 0) return k; }
    }
    return -1;
}

function j16Args (m: string, from: number, to: number): Array<[number, number]> {
    const spans: Array<[number, number]> = [];
    let d = 0, s = from;
    for (let k = from; k < to; k++) {
        const c = m[k];
        if (c === '(' || c === '[' || c === '{') d++;
        else if (c === ')' || c === ']' || c === '}') d--;
        else if (c === ',' && d === 0) { spans.push ([s, k]); s = k + 1; }
    }
    if (m.slice (s, to).trim () !== '') spans.push ([s, to]);
    return spans;
}

// names of the calls in m[a,b) that complete before b (i.e. are evaluated before position b)
function j16Calls (m: string, a: number, b: number): string[] | undefined {
    const names: string[] = [];
    const re = /([A-Za-z_$][\w$]*(?:\s*\.\s*[A-Za-z_$][\w$]*)*)\s*\(|\)\s*\.\s*([A-Za-z_$][\w$]*)\s*\(/g;
    re.lastIndex = a;
    let r: RegExpExecArray | null;
    while ((r = re.exec (m)) !== null && r.index < b) {
        const open = r.index + r[0].length - 1;
        const close = j16Close (m, open);
        if (close < 0) return undefined;
        re.lastIndex = open + 1;
        if (close >= b) continue;
        const name = r[1] !== undefined ? r[1].replace (/\s+/g, '') : '.' + r[2];
        if (/^(?:if|for|while|switch|catch|synchronized|return|throw)$/.test (name)) return undefined;
        names.push (name);
    }
    return names;
}

// `new C(` keeps its args unevaluated; a cast `(T)` is a parenthesised group with no call name
function j16Mutates (t: string): boolean { return /\+\+|--|(?<![=!<>+\-*/%&|^])=(?!=)|[+\-*/%&|^]=|->/.test (t); }
function j16AllPure (names: string[]): boolean { return names.every ((n) => j16PureCall (n)); }

function j16Emit (raw: string, m: string, open: number, close: number, name: string, indent: string, fresh: () => string, out: string[]): boolean {
    const spans = j16Args (m, open + 1, close);
    if (spans.length === 0 || spans.length % 2 !== 0) return false;
    const lines = [indent + 'java.util.HashMap<String, Object> ' + name + ' = new java.util.HashMap<String, Object>();'];
    for (let p = 0; p < spans.length; p += 2) {
        // a trailing `// comment` of the previous property lands in this span: the mask drops it
        const km = m.slice (spans[p][0], spans[p][1]);
        const ks = spans[p][0] + km.search (/\S/);
        const ke = spans[p][0] + km.trimEnd ().length;
        const key = raw.slice (ks, ke);
        if (!/^"[^\n]*"$/.test (key) || !/^"\s*"$/.test (m.slice (ks, ke))) { return false; }
        let [vs, ve] = spans[p + 1];
        while (vs < ve && /\s/.test (m[vs])) vs++;
        while (ve > vs && /\s/.test (m[ve - 1])) ve--;
        let value: string;
        if (m.startsWith ('Helpers.newMap(', vs) && j16Close (m, vs + 'Helpers.newMap('.length - 1) === ve - 1) {
            value = fresh ();
            if (!j16Emit (raw, m, vs + 'Helpers.newMap('.length - 1, ve - 1, value, indent, fresh, lines)) return false;
        } else {
            value = raw.slice (vs, ve);
            if (/\/[/*]/.test (value.replace (/"(?:[^"\\\n]|\\.)*"/g, '""'))) return false;
        }
        lines.push (indent + name + '.put(' + key + ', ' + value + ');');
    }
    out.push (...lines);
    return true;
}

function j16RewriteOnce (content: string, m: string, from: number, taken: Set<string>): { content: string, next: number } | undefined {
    let i = m.indexOf ('Helpers.newMap(', from);
    for (; i >= 0; i = m.indexOf ('Helpers.newMap(', i + 1)) {
        if (i > 0 && /[\w$.]/.test (m[i - 1])) continue;
        const open = i + 'Helpers.newMap('.length - 1;
        const close = j16Close (m, open);
        if (close < 0) continue;
        // statement start, plus the bracket kinds on the path from it to the literal
        let d = 0, k = i - 1;
        const path: number[] = [];
        for (; k >= 0; k--) {
            const c = m[k];
            if (c === '}' && d === 0) break;
            if (c === ')' || c === ']' || c === '}') d++;
            else if (c === '(' || c === '[' || c === '{') {
                if (d > 0) { d--; continue; }
                if (c === '{') break;
                path.push (k);
            } else if (c === ';' && d === 0) break;
        }
        if (k < 0) continue;
        let first = k + 1;
        while (first < i && /\s/.test (m[first])) first++;
        const head = m.slice (first, i);
        if (path.length === 0) { j16Count ('keep:whole-rhs-or-statement (J01)'); continue; }
        if (/^(?:if|else|for|while|do|switch|case|default|try|catch|finally|synchronized|super\s*\(|this\s*\(|public|private|protected|static|@)\b/.test (head)) { j16Count ('keep:control-header'); continue; }
        const lineStart = content.lastIndexOf ('\n', first - 1) + 1;
        if (content.slice (lineStart, first).trim () !== '') { j16Count ('keep:statement-not-line-start'); continue; }
        // the text at path depth (completed sub-expressions removed): no branch may skip the literal
        let top = '';
        for (let q = first, dd = 0; q < i; q++) {
            const c = m[q];
            if (path.includes (q)) { top += c; continue; }
            if (c === '(' || c === '[' || c === '{') { dd++; continue; }
            if (c === ')' || c === ']' || c === '}') { dd--; continue; }
            if (dd === 0) top += c;
        }
        if (path.some ((q) => /\b(?:for|while|if|switch|catch|synchronized)\s*$/.test (m.slice (Math.max (0, q - 20), q)))) { j16Count ('keep:control-header'); continue; }
        if (/\?|&&|\|\||->|:/.test (top) || path.some ((q) => m[q] !== '(')) { j16Count ('keep:conditional-or-lambda-path'); continue; }
        // evaluation order: the prefix Java evaluates before the literal must commute with it
        const assign = head.match (/^(?:(?:final\s+)?[\w$.]+(?:<[^;=()]*>)?(?:\[\])*\s+)?[A-Za-z_$][\w$]*\s*=(?!=)/);
        const prefix = assign ? head.slice (assign[0].length) : head;
        const prefixCalls = j16Calls (m, first + (assign ? assign[0].length : 0), i);
        const valueCalls = j16Calls (m, open + 1, close + 1);
        if (prefixCalls === undefined || valueCalls === undefined) { j16Count ('keep:unparsed'); continue; }
        if (j16Mutates (prefix) || !j16AllPure (prefixCalls)) { j16Count ('keep:effectful-prefix'); continue; }
        if (j16Mutates (m.slice (open + 1, close))) { j16Count ('keep:values-write'); continue; }
        const valuesPure = j16AllPure (valueCalls);
        // effectful values: the prefix may only read locals (a call's side effect cannot change them)
        if (!valuesPure && (prefixCalls.length > 0 || /\bthis\s*\.\s*[A-Za-z_$][\w$]*(?!\s*\()|\)\s*[\w$(]/.test (prefix.replace (/\bthis\s*\.\s*[A-Za-z_$][\w$]*\s*\($/, '')))) {
            j16Count ('keep:effectful-values-after-heap-read'); continue;
        }
        const indent = content.slice (lineStart, first);
        const fresh = () => {
            let n = taken.size;
            let name: string;
            do { name = 'mapLiteral' + (++n); } while (taken.has (name));
            taken.add (name);
            return name;
        };
        const lines: string[] = [];
        const snapshot = new Set (taken);
        const name = fresh ();
        if (!j16Emit (content, m, open, close, name, indent, fresh, lines)) {
            taken.clear (); snapshot.forEach ((x) => taken.add (x));
            j16Count ('keep:non-literal-key-or-multiline-value'); continue;
        }
        j16Count ('hoisted');
        const out = content.slice (0, lineStart) + lines.join ('\n') + '\n' + content.slice (lineStart, i) + name + content.slice (close + 1);
        return { content: out, next: lineStart };
    }
    return undefined;
}

export function nativeJavaNestedNewMaps (content: string): string {
    if (content.indexOf ('Helpers.newMap(') < 0) return content;
    const taken = new Set<string> (content.match (/\bmapLiteral\d+\b/g) || []);
    let from = 0;
    for (;;) {
        const r = j16RewriteOnce (content, j16Mask (content), from, taken);
        if (r === undefined) return content;
        content = r.content;
        from = r.next;
    }
}

// hx4 J03: `x = Helpers.newMap("k", v, ...);` -> a block filling a fresh HashMap, then `x = tmp;`
// (newMap is a plain HashMap put in argument order; values still read the old x)
export function nativeJavaReassignedNewMap (content: string): string {
    if (content.indexOf ('Helpers.newMap(') < 0) return content;
    const head = /^(\s*)([A-Za-z_$][\w$]*) = Helpers\.newMap\(/;
    const lines = content.split ('\n');
    const out: string[] = [];
    let temp = 0;
    while (content.includes ('hx4NewMap' + temp)) temp++;
    for (let i = 0; i < lines.length; i++) {
        const m = head.exec (lines[i]);
        if (m === null) { out.push (lines[i]); continue; }
        const rest = lines.slice (i).join ('\n');
        const scan = h2kJ01ScanArgs (rest, m[0].length);
        const tail = scan === undefined ? undefined : /^;[ \t]*(\/\/[^\n]*)?(?=\n|$)/.exec (rest.slice (scan.end));
        const pairs = scan?.args ?? [];
        const ok = scan !== undefined && tail !== null && pairs.length > 0 && pairs.length % 2 === 0
            && pairs.every ((a, k) => k % 2 === 1 || (/^\s*"(?:[^"\\]|\\.)*"\s*$/.test (a.text) && a.comment === ''));
        if (!ok) { out.push (lines[i]); continue; }
        const indent = m[1];
        const inner = indent + '    ';
        const name = 'hx4NewMap' + (temp++);
        out.push (indent + '{');
        out.push (`${inner}java.util.HashMap<String, Object> ${name} = new java.util.HashMap<String, Object>();`);
        for (let k = 0; k < pairs.length; k += 2) {
            const v = pairs[k + 1];
            out.push (`${inner}${name}.put(${pairs[k].text.trim ()}, ${v.text.trim ()});${v.comment ? ' ' + v.comment : ''}`);
        }
        out.push (`${inner}${m[2]} = ${name};${tail![1] ? ' ' + tail![1] : ''}`);
        out.push (indent + '}');
        i += rest.slice (0, scan!.end + tail![0].length).split ('\n').length - 1;
    }
    return out.join ('\n');
}

// hx4 J06
// Helpers.objectValues(m) once typeCoreReturns has declared m a fresh member-local Map (groupBy result /
// empty literal): the H2K-j15 rule, re-run on the retyped declarations; opNeg stays with its own pass
function hx4J06ObjectValues (content: string): string {
    if (!content.includes ('Helpers.objectValues(')) return content;
    const lines = content.split ('\n');
    const starts: number[] = [];
    for (let i = 0; i < lines.length; i++) if (/^    (?:public|private|protected)\b/.test (lines[i])) starts.push (i);
    for (let s = 0; s < starts.length; s++) {
        const from = starts[s];
        const to = s + 1 < starts.length ? starts[s + 1] : lines.length;
        for (let j = from + 1; j < to; j++) {
            lines[j] = lines[j].replace (/Helpers\.objectValues\(([A-Za-z_]\w*)\)/g, (call, name) => {
                const d = h2kJ15Local (lines, from, to, name);
                if (d === undefined || d.index >= j || d.type.replace (/^java\.util\./, '') !== 'Map<String,Object>') return call;
                if (!/^this\.groupBy\(/.test (d.init) && !/^new (?:java\.util\.)?HashMap<String, Object>\(\) \{\{\}\}$/.test (d.init)) return call;
                if (lines.slice (d.index, j + 1).some ((l) => l.includes ('->'))) return call;
                return `new java.util.ArrayList<Object>(${name}.values())`;
            });
        }
    }
    return lines.join ('\n');
}

// after the pass constants above: they are consts, so the entry must not run before their initialization
if (isMainEntry(metaUrl)) {
    // Deliberately not `await runMain()`: build/java-worker.ts imports this module
    // for patchJavaLocalTypes, and piscina loads worker modules through tsx's CJS
    // require hook, whose esbuild transform rejects top-level await ("not supported
    // with the cjs output format"). A rejection is still fatal here — an unhandled
    // rejection exits 1, exactly like the awaited form did.
    runMain();
}

// hx4 J07
// `Helpers.callDynamically(x, "reset"|"limit", new Object[]{..})` on a local declared io.github.ccxt.ws.WsOrderBook
// whose args span lines, or `reset` with no args: the helper pads the omitted Object param with null.
export function nativeJavaJ07WsOrderBookCalls (content: string): string {
    if (content.indexOf ('Helpers.callDynamically(') < 0) return content;
    const lines = content.split ('\n');
    const lineStarts: number[] = [];
    let pos = 0;
    for (const l of lines) { lineStarts.push (pos); pos += l.length + 1; }
    const lineOf = (offset: number) => { let lo = 0, hi = lineStarts.length - 1; while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (lineStarts[mid] <= offset) lo = mid; else hi = mid - 1; } return lo; };
    const call = /Helpers\.callDynamically\((\w+), "(reset|limit)", new Object\[\]\{/g;
    let out = '';
    let cursor = 0;
    let m;
    while ((m = call.exec (content)) !== null) {
        const li = lineOf (m.index);
        if (javaDeclaredClassOf (lines, li, m[1]) !== 'io.github.ccxt.ws.WsOrderBook') continue;
        const argsAt = m.index + m[0].length;
        let depth = 1;
        let j = argsAt;
        let quote = '';
        while (j < content.length && depth > 0) {
            const ch = content[j];
            if (quote !== '') { if (ch === '\\') j++; else if (ch === quote) quote = ''; }
            else if (ch === '"') quote = ch;
            else if ('{('.includes (ch)) depth++;
            else if ('})'.includes (ch)) depth--;
            j++;
        }
        if (depth !== 0 || content[j] !== ')') continue;
        const args = content.slice (argsAt, j - 1).trim ();
        const argc = args === '' ? 0 : splitTopLevelArgs (args.replace (/<[\w.<>?, ]*>/g, '')).length;
        const lineHead = content.slice (lineStarts[li], m.index);
        const statement = /^\s*$/.test (lineHead) && /^\s*;/.test (content.slice (j + 1, j + 3));
        let native: string | undefined = undefined;
        if (m[2] === 'limit' && argc === 0) native = m[1] + '.limit()';
        if (m[2] === 'reset' && statement && argc <= 1) native = m[1] + '.reset(' + (argc === 0 ? 'null' : args) + ')';
        if (native === undefined) continue;
        out += content.slice (cursor, m.index) + native;
        cursor = j + 1;
        call.lastIndex = cursor;
    }
    return cursor === 0 ? content : out + content.slice (cursor);
}

// hx4 J10: integer-literal counters print `long`; a counter read as a value (map literal, call argument) or captured stays Object
function j10CounterSelfTest (): string[] {
    const problems: string[] = [];
    const probe = path.join(process.cwd(), 'ts', 'src', `zzj10selftest${process.pid}.ts`);
    const body = [
        "import Exchange from './abstract/binance.js';",
        'export default class zzj10selftest extends Exchange {',
        "    pos (s: string, max: number) { let a = 0; let b = 1; while (a <= max && s[a] === '0') { a = a + 1; } b += 2; b++; return [ a > 3, a === 2, b - 1 ]; }",
        "    neg (params = {}) { let c = 0; c += 1; let d = 0; d = d + 1; const r = { 'page': d }; let e = 0; const f = () => { e = e + 1; }; f (); return [ this.safeString (params, c), r, e > 1 ]; }",
        '}',
    ].join('\n');
    try {
        fs.writeFileSync(probe, body);
        const out = new NewTranspiler().transpiler.transpileJavaByPath(probe).content as string;
        for (const name of [ 'a', 'b' ]) {
            if (!new RegExp(`\\blong ${name} = `).test(out)) problems.push(`j10: counter '${name}' must print long`);
        }
        if (!/a = \(a \+ 1L\);/.test(out) || !/b = \(b \+ 2L\);/.test(out)) problems.push('j10: counter writes must print native long arithmetic');
        for (const name of [ 'c', 'd', 'e' ]) {
            if (!new RegExp(`\\bObject ${name} = `).test(out)) problems.push(`j10: '${name}' is read as a value or captured and must stay Object`);
        }
    } catch (e: any) {
        problems.push(`j10 self-test threw: ${e.message}`);
    } finally {
        fs.rmSync(probe, { force: true });
    }
    return problems;
}

// hx4 J11: Object locals whose init and every write are Maps print Map<String, Object>; any other write keeps Object
function j11MapLocalsSelfTest (): string[] {
    const problems: string[] = [];
    const probe = path.join(process.cwd(), 'ts', 'src', `zzj11selftest${process.pid}.ts`);
    const body = [
        "import Exchange from './abstract/binance.js';",
        'export default class zzj11selftest extends Exchange {',
        "    omitted (r: any) { let a = this.safeDict (r, 'k', {}); a = this.omit (a, 'x'); a['p'] = 1; return a['q']; }",
        "    fees (info: any) { const b = this.depositWithdrawFee (info); b['info'] = info; return b['networks']; }",
        "    copied (r: any) { const d = this.safeDict (r, 'z', {}); let c = this.safeDict (r, 'k'); if (d['y'] !== undefined) { c = d; } return c['q']; }",
        "    anyWrite (r: any) { let e = this.safeDict (r, 'k', {}); e = this.safeValue (r, 'v'); return e['q']; }",
        "    fieldWrite (code: string) { let f = this.account (); if (code in this.balance) { f = this.balance[code]; } f['free'] = '1'; return f; }",
        "    otherDefault (r: any) { const g = this.safeDict (r, 'k', r); return g['q']; }",
        '}',
    ].join('\n');
    try {
        fs.writeFileSync(probe, body);
        const out = new NewTranspiler().transpiler.transpileJavaByPath(probe).content as string;
        if (!/Map<String, Object> a = \(java\.util\.Map<String, Object>\) this\.safeDict\(/.test(out)) problems.push("j11: 'a' (safeDict + omit-self) must print Map<String, Object> with a checkcast");
        if (!/Map<String, Object> b = (\(java\.util\.Map<String, Object>\) )?this\.depositWithdrawFee\(/.test(out)) problems.push("j11: 'b' (fresh-map method) must print Map<String, Object>");
        if (!/Map<String, Object> c = /.test(out)) problems.push("j11: 'c' (safeDict + Map copy) must print Map<String, Object>");
        if (/Helpers\.addElementToObject\(a, /.test(out) || /Helpers\.GetValue\(a, /.test(out)) problems.push("j11: 'a' put/get must go native");
        for (const name of [ 'e', 'f', 'g' ]) {
            if (!new RegExp(`\\bObject ${name} = `).test(out)) problems.push(`j11: '${name}' has an unproven write/default and must stay Object`);
        }
    } catch (e: any) {
        problems.push(`j11 self-test threw: ${e.message}`);
    } finally {
        fs.rmSync(probe, { force: true });
    }
    return problems;
}

// hx4 J04: snippet checks for the native arithmetic pass (`--audit-string-types --self-test`)
function j04ArithmeticSelfTest (): string[] {
    const problems: string[] = [];
    {
        const assert = {
            ok: (cond: any, msg?: string) => { if (!cond) { problems.push (`hx4 J04 arithmetic: ${String (msg).slice (0, 300)}`); } },
            strictEqual: (a: any, b: any) => { if (a !== b) { problems.push (`hx4 J04 arithmetic: ${a} !== ${b}`); } },
        };
        const console = { log: (...a: any[]) => { const s = a.join (' '); if (s.startsWith ('FAIL')) { problems.push (`hx4 J04 arithmetic: ${s.slice (0, 300)}`); } } };

        const member = (body: string) => `    public Object m(Long since, Long limit, Object x)\n    {\n${body}\n    }\n`;
        const run = (body: string) => nativeJavaJ04Arithmetic (member (body));
        const cases: [string, string, string | undefined][] = [
            // positives
            [ 'getArrayLength local', '        Integer n = Helpers.getArrayLength(x);\n        Object a = Helpers.GetValue(x, Helpers.subtract(n, 1));', 'Helpers.GetValue(x, (n - 1L))' ],
            [ 'block guard', '        if (!java.util.Objects.equals(limit, null))\n        {\n            Object p = Helpers.multiply(limit, 2);\n        }', 'Object p = (limit * 2L);' ],
            [ 'early exit', '        if (java.util.Objects.equals(since, null))\n        {\n            throw new Error("x") ;\n        }\n        Object e = Helpers.add(this.seconds(), since);', 'Object e = (this.seconds() + since);' ],
            [ 'all-int widened', '        int d = this.parseTimeframe(x);\n        Object e = this.sum(x, Helpers.multiply(d, d));', 'this.sum(x, (((long) d) * d))' ],
            [ 'divide as double', '        Long n = 5L;\n        Object e = this.sum(x, Helpers.divide(n, 1000));', 'this.sum(x, (((double) n) / ((double) 1000)))' ],
            [ 'ternary default', '        Long r = (((java.util.Objects.equals(limit, null)))) ? 100L : limit;\n        Object e = this.sum(x, Helpers.multiply(r, 3));', 'this.sum(x, (r * 3L))' ],
            // negatives: nullable, unguarded, guard after a later write, ternary arm, Object operand, double operand
            [ 'nullable param', '        Object p = Helpers.multiply(limit, 2);', undefined ],
            [ 'safeInteger no default', '        Long v = this.safeInteger(x, "k");\n        Object p = Helpers.subtract(v, 1);', undefined ],
            [ 'ternary arm', '        Long n = 5L;\n        Object p = (x == null) ? Helpers.add(n, 1) : x;', undefined ],
            [ 'object operand', '        Object p = Helpers.add(x, 1);', undefined ],
            [ 'double multiply', '        Double d = 1.5;\n        Object p = this.sum(x, Helpers.multiply(d, 2));', undefined ],
            [ 'guard then write', '        if (!java.util.Objects.equals(limit, null))\n        {\n            limit = this.safeInteger(x, "k");\n            Object p = Helpers.multiply(limit, 2);\n        }', undefined ],
        ];
        let failed = 0;
        for (const [ name, body, expect ] of cases) {
            const out = run (body);
            const ok = expect === undefined ? out === member (body) : out.includes (expect);
            if (!ok) { failed++; console.log ('FAIL', name, '\n', out); }
        }
        assert.strictEqual (failed, 0);
    }
    return problems;
}

// hx4 J12: venue-only methods called with typed arguments print typed parameters; a written,
// mistyped, `+`-left or name-referenced parameter keeps Object
function j12ParamTypesSelfTest (): string[] {
    const problems: string[] = [];
    const probe = path.join(process.cwd(), 'ts', 'src', `zzj12selftest${process.pid}.ts`);
    const body = [
        "import Exchange from './abstract/binance.js';",
        'export default class zzj12selftest extends Exchange {',
        "    run (r: any) { const s = this.safeString (r, 'a'); this.zzjA (s, s === 'b', this.safeList (r, 'l', [])); this.zzjB (s); this.zzjC (s); this.zzjD (r); const f = this.zzjE; return f; }",
        "    zzjA (code: string, flag: boolean, rows: any[]) { return [ code.length, flag, rows.length ]; }",
        "    zzjB (code: string) { code = code + 'x'; return code; }",
        "    zzjC (code: string) { return code + this.id; }",
        "    zzjD (code: string) { return code; }",
        "    zzjE (code: string) { return code; }",
        '}',
    ].join('\n');
    try {
        fs.writeFileSync(probe, body);
        const out = new NewTranspiler().transpiler.transpileJavaByPath(probe).content as string;
        if (!/zzjA\(String code, Boolean flag, java\.util\.List<Object> rows\)/.test(out)) problems.push('j12: zzjA must print String/Boolean/List<Object> params');
        if (!/this\.zzjA\(s, java\.util\.Objects\.equals\(s, "b"\), \(java\.util\.List<Object>\) \(this\.safeList\(/.test(out)) problems.push('j12: zzjA call must pass the String local bare and checkcast the List');
        // hx10 w4 PJ01: a plain `string` annotation prints String on a generated venue method whether the
        // parameter is written, `+`-left or handed an unproven caller, because writes are cast and the
        // caller carries the checkcast
        for (const name of [ 'zzjB', 'zzjC', 'zzjD', 'zzjE' ]) {
            if (!new RegExp(`${name}\\(String code\\)`).test(out)) problems.push(`j12: ${name} must print String code`);
        }
    } catch (e: any) {
        problems.push(`j12 self-test threw: ${e.message}`);
    } finally {
        fs.rmSync(probe, { force: true });
    }
    return problems;
}

// hx10 J04: snippet checks for the native string-helper prints (`--audit-string-types --self-test`)
function j04w2Str (): string[] {
    const problems: string[] = [];
    const probe = path.join(process.cwd(), 'ts', 'src', `zzj04w2selftest${process.pid}.ts`);
    const body = [
        "import Exchange from './abstract/binance.js';",
        'export default class zzj04w2selftest extends Exchange {',
        '    zzjSlice (s: string, o: any) {',
        '        const b = s.length;',
        '        const both = s.slice (1, b);',
        '        const tail = s.slice (2);',
        '        const head = s.slice (0, b - 1);',
        "        const pos = s.indexOf ('x');",
        '        const boxed = s.slice (0, pos);',
        '        const rest = s.slice (b);',
        '        const unproven = o.slice (1, b);',
        "        const fractional = s.slice (this.safeFloat (o, 'a'), b);",
        '        return [ both, tail, head, rest, boxed, unproven, fractional ];',
        '    }',
        '    zzjSplit (s: string, sep: string, o: any) {',
        '        return [ s.split (sep), s.split (o) ];',
        '    }',
        '    zzjReplaceAll (s: string, repl: string) {',
        "        return s.replaceAll ('ab', repl);",
        '    }',
        '}',
    ].join('\n');
    try {
        fs.writeFileSync(probe, body);
        const out = new NewTranspiler().transpiler.transpileJavaByPath(probe).content as string;
        fs.writeFileSync(path.join(os.tmpdir(), 'j04w2-out.java'), out);
        const ok = (cond: boolean, msg: string) => { if (!cond) problems.push(`hx10 J04: ${msg}`); };
        ok(/\(s == null \? null : s\.substring\(/.test(out), 'a String slice with integral bounds must print native');
        ok(/String both = \(s == null \? null : /.test(out), 'the native slice keeps the String local typing');
        ok(/Helpers\.slice\(o, 1, b\)/.test(out), 'an unproven receiver keeps the helper');
        ok(/s\.substring\(\(int\) Math\.min\(Math\.max\(b < 0 \? s\.length\(\) \+ b : b, 0\), s\.length\(\)\)\)/.test(out), 'an open-end slice prints the one-argument substring');
        ok(/\(\(Number\)pos\)\.intValue\(\)/.test(out), 'an Object-printed index bound takes the intValue truncation');
        ok(/Helpers\.slice\(s, this\.safeFloat/.test(out), 'a fractional bound keeps the helper');
        ok(/\(\(String\)s\)\.split\(java\.util\.regex\.Pattern\.quote\(sep\)\)/.test(out), 'a String separator prints the native split');
        ok(/Helpers\.split\(s, o\)/.test(out), 'an unproven separator keeps the helper');
        ok(/\(\(String\)s\)\.replace\("ab", \(\(String\)repl\)\)/.test(out), 'a literal pattern with a String replacement prints native replace');
    } catch (e: any) {
        problems.push(`j04w2 self-test threw: ${e.message}`);
    } finally {
        fs.rmSync(probe, { force: true });
    }
    return problems;
}

// hx4 J13: Object locals whose init and every write are Lists print List<Object>; any other write keeps Object
function j13ListLocalsSelfTest (): string[] {
    const problems: string[] = [];
    const probe = path.join(process.cwd(), 'ts', 'src', `zzj13selftest${process.pid}.ts`);
    const body = [
        "import Exchange from './abstract/binance.js';",
        'export default class zzj13selftest extends Exchange {',
        "    acc (r: any) { let a = []; for (let i = 0; i < 3; i++) { a = this.arrayConcat (a, [ i ]); } return [ a.length, a[0] ]; }",
        "    lst (r: any) { let b = this.safeList (r, 'k', []); if (b.length === 0) { b = this.safeList (r, 'z', []); } return b[0]; }",
        "    keys (r: any) { const c = Object.keys (r); return c.length; }",
        "    anyWrite (r: any) { let e = []; e = this.safeValue (r, 'v'); return e.length; }",
        "    otherDefault (r: any) { const f = this.safeList (r, 'k', r); return f.length; }",
        "    nullOnly (r: any) { let g = undefined; if (r) { g = undefined; } return g; }",
        "    bybit (ps: any[]) { let h: any[] = []; for (let i = 0; i < ps.length; i++) { const p = ps[i]; h = this.arrayConcat (h, p); } return [ h.length, h[0] ]; }",
        "    binLev (response: any) { let k = this.safeList (response, 'positions', []); if (Array.isArray (response)) { k = response; } return k.length; }",
        "    mexc (response: any, x: boolean) { let m = []; if (x) { m = this.toArray (response); } else { m = this.convertTradingViewToOHLCV (response); } return m.length; }",
        "    chunk (ids: string[]) { let n: string[] = []; for (let i = 0; i < ids.length; i++) { n.push (ids[i]); if (n.length > 3) { n = []; } } return n[0]; }",
        "    strs (r: any) { const q = this.safeList (r, 'k', []) as string[]; return q.length; }",
        "    anyCast (r: any) { const s = this.toArray (r) as any; let t = s; t = this.sortBy (t, 'x'); return t.length; }",
        "    fbl (r: any) { let o = this.filterBySinceLimit (r, 1, 2); if (o.length > 1) { o = this.sortBy (o, 'x'); } return o[0]; }",
        '}',
    ].join('\n');
    try {
        fs.writeFileSync(probe, body);
        const out = new NewTranspiler().transpiler.transpileJavaByPath(probe).content as string;
        if (!/List<Object> a = /.test(out)) problems.push("j13: 'a' ([] + arrayConcat) must print List<Object>");
        if (!/a = \(java\.util\.List<Object>\) this\.arrayConcat\(/.test(out)) problems.push("j13: 'a' arrayConcat write needs a checkcast");
        if (!/List<Object> b = \(java\.util\.List<Object>\) this\.safeList\(/.test(out)) problems.push("j13: 'b' (safeList + safeList write) must print List<Object> with a checkcast");
        if (!/List<Object> c = /.test(out)) problems.push("j13: 'c' (Object.keys) must print List<Object>");
        if (/Helpers\.getArrayLength\((a|b)\)/.test(out) || /Helpers\.GetValue\((a|b), /.test(out)) problems.push("j13: 'a'/'b' length/get must go native");
        // shapes no earlier section types: toArray / fresh-list method writes, a List<Object> core + sortBy
        if (!/List<Object> m = /.test(out) || !/m = \(java\.util\.List<Object>\) this\.convertTradingViewToOHLCV\(/.test(out)) problems.push("j13: 'm' ([] + toArray + fresh-list method) must print List<Object> with a write checkcast");
        if (!/List<Object> o = this\.filterBySinceLimit\(/.test(out)) problems.push("j13: 'o' (filterBySinceLimit + sortBy) must print List<Object>");
        if (/Helpers\.getArrayLength\([mo]\)/.test(out) || /Helpers\.GetValue\(o, /.test(out)) problems.push("j13: 'm'/'o' length/get must go native");
        if (/List<Object> q = /.test(out)) problems.push("j13: 'q' (as string[] prints a List<String> cast) must not print List<Object>");
        if (/List<Object> s = (?!\(java\.util\.List<Object>\) \(\(Object\))/.test(out)) problems.push("j13: 's' (as any prints ((Object)v)) needs the List checkcast");
        for (const name of [ 'e', 'f', 'k' ]) {
            if (!new RegExp(`\\bObject ${name} = `).test(out)) problems.push(`j13: '${name}' has an unproven write/default and must stay Object`);
        }
        if (/List<Object> g = /.test(out)) problems.push("j13: 'g' has no List write and must not print List<Object>");
        if (problems.length) problems.push('j13 output:\n' + out);
    } catch (e: any) {
        problems.push(`j13 self-test threw: ${e.message}`);
    } finally {
        fs.rmSync(probe, { force: true });
    }
    return problems;
}

// hx4 J14: Object locals whose init and every write are one proven scalar box print it; a mixed write keeps Object
function j14ScalarLocalsSelfTest (): string[] {
    const problems: string[] = [];
    const probe = path.join(process.cwd(), 'ts', 'src', `zzj14selftest${process.pid}.ts`);
    const body = [
        "import Exchange from './abstract/binance.js';",
        'export default class zzj14selftest extends Exchange {',
        "    ts (t: any) { const a = this.safeIntegerOmitZero (t, 'k'); return { 'a': a }; }",
        "    flag (p: any, d: boolean) { const b = this.safeBool (p, 'x', this.safeBool (p, 'y', false)); return [ b, p ]; }",
        "    str (t: any) { let c = this.safeString (t, 'v'); if (c === undefined) { c = this.safeString2 (t, 'w', 'z'); } return { 'c': c }; }",
        "    until (p: any) { let u = this.safeInteger (p, 'until'); if (u === undefined) { u = this.milliseconds (); } return u > 5; }",
        "    mixed (p: any) { let e = this.safeInteger (p, 'k'); e = this.sum (e, 1); return e; }",
        "    product (p: any) { const g = this.safeIntegerProduct2 (p, 'a', 'b', 1000, 0); return g; }",
        '}',
    ].join('\n');
    try {
        fs.writeFileSync(probe, body);
        const out = new NewTranspiler().transpiler.transpileJavaByPath(probe).content as string;
        if (!/Long a = \(Long\) this\.safeIntegerOmitZero\(/.test(out)) problems.push("j14: 'a' (safeIntegerOmitZero, no default) must print Long with a checkcast");
        if (!/Boolean b = \(Boolean\) this\.safeBool\(/.test(out)) problems.push("j14: 'b' (safeBool, Boolean default) must print Boolean");
        if (!/String c = this\.safeString\(/.test(out)) problems.push("j14: 'c' (safeString + safeString2 write) must print String");
        if (!/Long u = this\.safeInteger\(/.test(out)) problems.push("j14: 'u' (safeInteger + milliseconds write) must print Long");
        for (const name of [ 'e', 'g' ]) {
            if (!new RegExp(`\\bObject ${name} = `).test(out)) problems.push(`j14: '${name}' has an unproven write/default/arm and must stay Object`);
        }
    } catch (e: any) {
        problems.push(`j14 self-test threw: ${e.message}`);
    } finally {
        fs.rmSync(probe, { force: true });
    }
    return problems;
}

// hx4 J15: J14 locals compared to each other print a value compare; a J12 callee declared above its caller
// still reads the caller's typed local
function j15SelfTest (): string[] {
    const problems: string[] = [];
    const probe = path.join(process.cwd(), 'ts', 'src', `zzj15selftest${process.pid}.ts`);
    const body = [
        "import Exchange from './abstract/binance.js';",
        'export default class zzj15selftest extends Exchange {',
        "    zzjHelper (code: string) { return code.length; }",
        "    seq (p: any) { const a = this.safeInteger (p, 'a'); const b = this.safeInteger (p, 'b'); if (a !== b) { return 1; } return a === b; }",
        "    run (r: any) { const s = this.safeString (r, 'a'); return this.zzjHelper (s); }",
        '}',
    ].join('\n');
    try {
        fs.writeFileSync(probe, body);
        const out = new NewTranspiler().transpiler.transpileJavaByPath(probe).content as string;
        if (!/Long a = this\.safeInteger\(/.test(out) || !/Long b = this\.safeInteger\(/.test(out)) problems.push("j15: 'a'/'b' compared box-to-box must print Long (J14 un-veto)");
        if (!/!java\.util\.Objects\.equals\(a, b\)/.test(out) || !/[^!]java\.util\.Objects\.equals\(a, b\)/.test(out)) problems.push('j15: Long === / !== Long must print Objects.equals');
        if (/\ba [!=]= b\b/.test(out)) problems.push('j15: no reference ==/!= on two Long boxes');
        if (!/zzjHelper\(String code\)/.test(out)) problems.push('j15: zzjHelper above its caller must print String code (J12 pre-scan)');
        if (problems.length) problems.push('j15 output:\n' + out);
    } catch (e: any) {
        problems.push(`j15 self-test threw: ${e.message}`);
    } finally {
        fs.rmSync(probe, { force: true });
    }
    return problems;
}
// hx4 J17: `: Str` / `: Int` / `: Num` venue methods print String / Long / Double once their bodies print
function j17ReturnsSelfTest (): string[] {
    const problems: string[] = [];
    const probe = path.join(process.cwd(), 'ts', 'src', `zzj17selftest${process.pid}.ts`);
    const child = path.join(process.cwd(), 'ts', 'src', `zzj17selftestchild${process.pid}.ts`);
    const body = [
        "import Exchange from './abstract/binance.js';",
        "import type { Str, Int, Num } from './base/types.js';",
        `export default class zzj17selftest${process.pid} extends Exchange {`,
        "    caller (p: any) { const a = this.pairSym (p); const c = this.tif (p); return [ a === undefined, c > 2, this.over (p) ]; }",
        "    pairSym (pair: any): Str { const b = this.safeString (pair, 0); if (b === undefined) { return undefined; } const s = b + '/'; return s; }",
        "    tif (t: Str): Int { return this.safeInteger ({ 'A': 1 }, t, 0); }",
        "    fromW (w: Str): Num { return (w === undefined) ? undefined : this.parseNumber (w); }",
        "    unboxed (t: Str): Int { return this.safeInteger ({ 'A': 1 }, t, 0); }",
        "    useU (p: any) { const u = this.unboxed (p); return (u > 1) ? u : 0; }",
        "    over (x: any): Str { const u = this.safeString (x, 'u'); return u; }",
        '}',
    ].join('\n');
    const childBody = [
        `import base from './zzj17selftest${process.pid}.js';`,
        "import type { Str } from './base/types.js';",
        `export default class zzj17selftestchild${process.pid} extends base {`,
        "    over (x: any): Str { return this.safeValue (x, 'u'); }",
        '}',
    ].join('\n');
    try {
        fs.writeFileSync(probe, body);
        fs.writeFileSync(child, childBody);
        const out = new NewTranspiler().transpiler.transpileJavaByPath(probe).content as string;
        if (!/public String pairSym\(/.test(out)) problems.push("j17: pairSym (callee printed after its caller, String local return) must print String");
        if (!/String a = this\.pairSym\(/.test(out)) problems.push("j17: the caller local of pairSym must print String");
        if (!/public Long tif\(/.test(out)) problems.push("j17: tif (Int, safeInteger return) must print Long");
        if (!/Long c = this\.tif\(/.test(out)) problems.push("j17: the caller local of tif must print Long");
        if (!/public Double fromW\(/.test(out)) problems.push("j17: fromW (Num, parseNumber/undefined arms) must print Double");
        if (!/public Object unboxed\(/.test(out)) problems.push("j17: unboxed has a ternary-arm caller and must stay Object");
        if (!/public Object over\(/.test(out)) problems.push("j17: over is redeclared by a descendant and must stay Object");
    } catch (e: any) {
        problems.push(`j17 self-test threw: ${e.message}`);
    } finally {
        fs.rmSync(probe, { force: true });
        fs.rmSync(child, { force: true });
    }
    return problems;
}

// hx4 J19: ordered comparisons / Math.max-min over non-null numeric expressions (runs after J04 + long-limit passes)
function j19SplitTop (text: string): { left: string, op: string, right: string } | undefined {
    let depth = 0, quote = '', at = -1, op = '';
    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (quote !== '') { if (c === '\\') i++; else if (c === quote) quote = ''; continue; }
        if (c === '"' || c === '\'') { quote = c; continue; }
        if (c === '(') depth++;
        else if (c === ')') depth--;
        else if (depth === 0 && /[?:<>=!&|]/.test (c)) return undefined;
        else if (depth === 0 && c === ' ' && /^ [-+*/%] /.test (text.slice (i, i + 3))) {
            // left-assoc: the last top-level operator of the lowest precedence splits
            const o = text[i + 1], low = o === '+' || o === '-';
            if (at === -1 || low || !(op === '+' || op === '-')) { at = i; op = o; }
        }
    }
    if (at === -1) return undefined;
    return { left: text.slice (0, at).trim (), op, right: text.slice (at + 3).trim () };
}

export function j19Operand (text: string, member: string, fields: Set<string>, content: string, depth = 0): { kind: string, boxed: boolean, text: string, literal?: boolean } | undefined {
    const base = h2kJ10Operand (text, member, fields);
    if (base !== undefined || depth > 8) return base;
    const inner = h2kJ10StripParens (text);
    const prim = (kind: string) => ({ kind, boxed: false, text: '(' + inner + ')' });
    const cast = inner.match (/^\((long|int|double)\) ?(.+)$/);
    if (cast !== null) {
        const o = j19Operand (cast[2], member, fields, content, depth + 1);
        return o === undefined ? undefined : prim (cast[1] === 'double' ? 'double' : 'long');
    }
    const bin = j19SplitTop (inner);
    if (bin !== undefined) {
        const l = j19Operand (bin.left, member, fields, content, depth + 1);
        const r = j19Operand (bin.right, member, fields, content, depth + 1);
        if (l === undefined || r === undefined) return undefined;
        return prim (l.kind === 'double' || r.kind === 'double' ? 'double' : 'long');
    }
    // hand-written base members returning a non-null long / int (no venue redeclaration)
    const call = inner.match (/^this\.(milliseconds|seconds|parseTimeframe)\(/);
    if (call !== null && h2kJ15Close (inner, call[0].length - 1) === inner.length - 1
        && !new RegExp ('^    (?:public|private|protected)[^\\n(]* ' + call[1] + '\\(', 'm').test (content)) return prim ('long');
    if (/^Helpers\.getArrayLength\(/.test (inner) && h2kJ15Close (inner, 'Helpers.getArrayLength'.length) === inner.length - 1) return prim ('long');
    if (/\.(?:size|length)\(\)$/.test (inner) && !/\s/.test (inner.replace (/\([^()]*\)/g, ''))) return prim ('long');
    const mm = inner.match (/^Math\.(?:min|max)\(/);
    if (mm !== null && h2kJ15Close (inner, mm[0].length - 1) === inner.length - 1) {
        const split = h2kJ10SplitArgs (inner, mm[0].length);
        if (split === undefined || split.args.length !== 2) return undefined;
        const ks = split.args.map ((a) => j19Operand (a, member, fields, content, depth + 1));
        if (ks.some ((k) => k === undefined)) return undefined;
        return prim (ks.some ((k) => k.kind === 'double') ? 'double' : 'long');
    }
    return undefined;
}

// the expression's Java type is long (Long box once stored): the result box of a native Math.max/min
function j19LongValued (text: string, member: string, depth = 0): boolean {
    const e = h2kJ10StripParens (text);
    if (depth > 8) return false;
    if (/^-?\d{1,15}L$/.test (e) || /^\(long\) ?/.test (e) || /^this\.(?:milliseconds|seconds)\(\)$/.test (e)) return true;
    if (/^[A-Za-z_$][\w$]*$/.test (e)) {
        const decls = [ ...member.matchAll (new RegExp ('(?:^|[\\s(,])([\\w.$<>]+) ' + e.replace (/\$/g, '\\$') + '\\s*(?:=|;|,|\\))', 'gm')) ].map ((d) => d[1]);
        return decls.length === 1 && /^(?:final )?(?:Long|long)$/.test (decls[0]);
    }
    const bin = j19SplitTop (e);
    return bin !== undefined && (j19LongValued (bin.left, member, depth + 1) || j19LongValued (bin.right, member, depth + 1));
}

// Helpers.mathMax/mathMin hand back one operand's box: native only for two non-null long-valued operands
function j19MathNative (helper: string, l, r, args: string[], member: string): string | undefined {
    if (l.kind !== 'long' || r.kind !== 'long' || l.boxed || r.boxed) return undefined;
    const wide = (o) => (o.literal && !/L$/.test (o.text) ? o.text + 'L' : o.text);
    // an int-valued non-literal side would turn the helper's Integer result into a Long
    if (!args.every ((a, k) => [ l, r ][k].literal || j19LongValued (a, member))) return undefined;
    if (!args.some ((a) => j19LongValued (a, member))) return undefined;
    return `Math.${helper === 'mathMax' ? 'max' : 'min'}(${wide (l)}, ${wide (r)})`;
}

export function nativeJavaJ19Compare (content: string): string {
    if (!/Helpers\.(?:is(?:Greater|Less)Than|mathM(?:in|ax))/.test (content)) return content;
    const lines = content.split ('\n');
    const fields = new Set<string> ();
    for (const line of lines) {
        const f = line.match (/^    (?:(?:public|private|protected|static|final|volatile|transient) )*[\w.][\w.<>, ?\[\]]* ([A-Za-z_$][\w$]*)\s*(?:=|;)/);
        if (f !== null) fields.add (f[1]);
    }
    const starts: number[] = [];
    for (let i = 0; i < lines.length; i++) if (/^    (?:public|private|protected)\b.*\(/.test (lines[i])) starts.push (i);
    const re = /Helpers\.(is(?:GreaterThan|LessThan|GreaterThanOrEqual|LessThanOrEqual)|mathMin|mathMax)\(/g;
    for (let s = 0; s < starts.length; s++) {
        const from = starts[s], to = s + 1 < starts.length ? starts[s + 1] : lines.length;
        const member = lines.slice (from, to).join ('\n');
        if (!/Helpers\.(?:is|math)/.test (member)) continue;
        for (let i = from; i < to; i++) {
            const trimmed = lines[i].trim ();
            if (trimmed.startsWith ('//') || trimmed.startsWith ('*')) continue;
            let line = lines[i], again = true;
            while (again) {
                again = false;
                re.lastIndex = 0;
                let m;
                while ((m = re.exec (line)) !== null) {
                    const split = h2kJ10SplitArgs (line, m.index + m[0].length);
                    if (split === undefined || split.args.length !== 2) continue;
                    const l = j19Operand (split.args[0], member, fields, content);
                    const r = j19Operand (split.args[1], member, fields, content);
                    if (l === undefined || r === undefined) continue;
                    const helper = m[1].replace (/^is/, '');
                    const native = m[1].startsWith ('math') ? j19MathNative (m[1], l, r, split.args, member) : h2kJ10Compare (helper, l, r);
                    if (native === undefined) continue;
                    line = line.slice (0, m.index) + native + line.slice (split.end + 1);
                    again = true;
                    break;
                }
            }
            lines[i] = line;
        }
    }
    return lines.join ('\n');
}

function j19CompareSelfTest (): string[] {
    const problems: string[] = [];
    const member = (body: string) => `    public Object m(Long since, Long limit, Object x, Double d)\n    {\n${body}\n    }\n`;
    const cases: [string, string, string | undefined][] = [
        [ 'diff vs literal', '        Long a = 5L;\n        boolean b = Helpers.isGreaterThan((a - since), 86400000);', 'boolean b = ((a - since) > 86400000);' ],
        [ 'ms minus', '        boolean b = Helpers.isLessThan((this.milliseconds() - 5L), limit);', '(limit != null && (this.milliseconds() - 5L) < limit)' ],
        [ 'cast product', '        long k = 3;\n        boolean b = Helpers.isGreaterThan(since, (((long) k) * 2L));', '(since != null && since > (((long) k) * 2L))' ],
        [ 'size', '        java.util.List<Object> q = null;\n        boolean b = Helpers.isGreaterThanOrEqual(q.size(), 3);', '((q.size()) >= 3)' ],
        [ 'math max long', '        Long a = 5L;\n        Object c = Helpers.mathMax((a + 1L), this.milliseconds());', 'Object c = Math.max((a + 1L), (this.milliseconds()));' ],
        // negatives: Object operand, call with nullable box, Object-returning sum, int-valued mathMax side, double mathMax
        [ 'object', '        boolean b = Helpers.isGreaterThan(x, 0);', undefined ],
        [ 'sum', '        boolean b = Helpers.isGreaterThan(this.sum(x, 1), 1);', undefined ],
        [ 'parseToInt', '        boolean b = Helpers.isGreaterThan(this.parseToInt(x), 1);', undefined ],
        [ 'int mathMax', '        Long a = 5L;\n        Object c = Helpers.mathMax(a, 2);', undefined ],
        [ 'double mathMin', '        Object c = Helpers.mathMin((d * 2.0), 1.5);', undefined ],
        [ 'size mathMax', '        java.util.List<Object> q = null;\n        Object c = Helpers.mathMax(q.size(), 5L);', undefined ],
        [ 'int counter mathMin', '        int n = 3;\n        Object c = Helpers.mathMin((n - 1), 5L);', undefined ],
        [ 'double lt compound', '        boolean b = Helpers.isLessThan((d * 2.0), since);', undefined ],
        [ 'override ms', '        boolean b = Helpers.isLessThan(this.milliseconds(), 5L);\n    }\n    public Long milliseconds()\n    {\n        return 1L;', undefined ],
    ];
    for (const [ name, body, expect ] of cases) {
        const out = nativeJavaJ19Compare (member (body));
        const ok = expect === undefined ? out === member (body) : out.includes (expect);
        if (!ok) problems.push (`hx4 J19 compare ${name}: ${out.slice (0, 400)}`);
    }
    return problems;
}

// hx4 J20: the unwritten first parameter of setLeverage / cancelAllOrdersAfter / handleErrors compared to,
// divided or mod-ed with an integer literal prints a double compare carrying the helper's null arm
function j20ParamCompareSelfTest (): string[] {
    const problems: string[] = [];
    const head = '    public Object handleErrors(Object code, Object reason)\n    {\n';
    const run = (body: string) => nativeJavaJ20ParamCompare (head + body + '\n    }\n');
    const pos: [string, string][] = [
        [ '        if (Helpers.isEqual(code, 418)) {}', '(code != null && ((Number) code).doubleValue() == 418)' ],
        [ '        if (Helpers.isLessThan(code, 400)) {}', '(code == null || !(((Number) code).doubleValue() >= 400))' ],
        [ '        if (Helpers.isGreaterThanOrEqual(code, 400)) {}', '(code != null && ((Number) code).doubleValue() >= 400)' ],
        [ '        if (Helpers.isLessThanOrEqual(code, 503)) {}', '(code == null || !(((Number) code).doubleValue() > 503))' ],
        [ '        Object t = this.parseToInt(Helpers.divide(code, 1000));', '(code == null ? null : ((Number) code).doubleValue() / 1000)' ],
        [ '        Object t = Helpers.mod(1000, code);', '(code == null ? null : ((double) 1000) % ((Number) code).doubleValue())' ],
    ];
    for (const [ body, expect ] of pos) if (!run (body).includes (expect)) problems.push (`j20: expected ${expect} in\n${run (body)}`);
    const neg = [
        '        code = this.safeInteger(reason, "c");\n        if (Helpers.isEqual(code, 418)) {}',
        '        if (Helpers.isEqual(reason, 418)) {}',
        '        if (Helpers.isEqual(code, other)) {}',
    ];
    for (const body of neg) if (run (body) !== head + body + '\n    }\n') problems.push (`j20: must keep the helper in\n${body}`);
    const other = '    public Object fetchX(Object code)\n    {\n        if (Helpers.isEqual(code, 1)) {}\n    }\n';
    if (nativeJavaJ20ParamCompare (other) !== other) problems.push ('j20: other methods keep the helper');
    return problems;
}

// hx4 J21: the transpiled bodies of BaseExchange.java / Exchange.java / PredictionExchange.java
// get the same native post-passes createJavaClass runs on exchange files, in the same order
function hx4J21BaseNativePasses (transpiler: any, body: string, sourcePath?: string): string {
    let content = body;
    content = transpiler.retypeFinalVarDeclarations(content);
    content = hx11w8BasePinnedListParams(content);
    content = hx11w8ObjectValuesListLocals(content);
    content = nativeJavaDeclaredElementReads(content);
    content = nativeJavaJ03ElementReads(content);
    content = nativeJavaJ02ElementReads(content, sourcePath); // hx10 w2 J02
    content = nativeJavaJ05DictChains(content); // hx10 w3 J05
    content = nativeJavaArrayLength(content);
    content = h2kJ07NativeDeclaredLength(content);
    content = nativeJavaLongLimitLocals(content);
    content = nativeJavaTopLevelNewMap(content);
    content = nativeJavaReassignedNewMap(content);
    content = nativeJavaEqualTruthy(content);
    content = h2kJ09NativeSubtractDivideMod(content);
    content = h2kJ10NativeComparisons(content);
    content = nativeJavaInOp(content);
    content = nativeJavaToLongOrNullH2kJ13(content);
    content = nativeJavaH2kJ15(content);
    content = nativeJavaNestedNewMaps(content);
    content = nativeJavaJ04Arithmetic(content);
    content = nativeJavaJ25Compare(content); // hx4 J25
    content = nativeJavaJ30CoreArgs(content); // hx4 J30
    content = nativeJavaJ33Compare(content); // hx4 J33
    content = nativeJavaJ35(content); // hx4 J35
    content = nativeJavaJ36MultiplySubtract(content); // hx4 J36
    content = nativeJavaJ37DivModNeg(content); // hx4 J37
    content = nativeJavaJ38(content); // hx4 J38
    content = nativeJavaJ39Containers(content); // hx4 J39
    content = nativeJavaJ40(nativeJavaStringAdd(content)); // hx4 J40
    content = nativeJavaJ38(nativeJavaJ36MultiplySubtract(nativeJavaJ37DivModNeg(content))); // hx4 J36..J38 post-J40
    content = nativeJavaJ41(content); // hx4 J41
    content = nativeJavaJ43(content); // hx4 J43
    content = nativeJavaJ44(content); // hx4 J44
    content = hx10J01ElementWrites(content); // hx10 J01
    content = hx10w3J02BalancePuts(content); // hx10w3 J02
    content = j01w7FieldPuts(content); // hx10w7 J01
    content = nativeJavaJ04OptionsOps(content); // hx10 w3 J04
    content = nativeJavaBF02FieldOps(content); // hx10 w4 BF02
    content = hx10w4OJ01OptionsOwner(content); // hx10 w4 OJ01
    content = nativeJavaJ05(content); // hx10w2 J05
    content = nativeJavaJ06FieldOps(content); // hx10w2 J06
    content = wsMapReads(j01wsNativeOps(content)); // hx10 wave-3 J01 + hx10w7 OJ06
    content = nativeJavaJ09SwitchBlobs(content); // hx10 wave-6 J09
    return content;
}

// hx4 J22
// Helpers.toMapArg/toStringArg/toLongOrNull/toStringListArg are identities on a value that already
// prints the slot type: a name the member declares that type only, or a base call that returns it.
export function nativeJavaJ22CoreArgs (content: string): string {
    const H = /Helpers\.(toMapArg|toStringArg|toLongOrNull|toStringListArg)\(/;
    if (!H.test (content)) return content;
    const MAP = '(?:java\\.util\\.)?Map<String, Object>';
    const LIST_STRING = '(?:java\\.util\\.)?List<String>';
    const DECLARED: Record<string, string> = { toMapArg: MAP, toStringArg: 'String', toLongOrNull: 'Long', toStringListArg: LIST_STRING };
    // base Java methods whose every overload prints that core type
    const MAP_CALLS = /^this\.(?:market|currency|safeMarket|safeCurrency|keysort|deepExtend)\($/;
    const STRING_CALLS = /^this\.(?:safeString|safeString2|safeStringN|safeStringUpper|safeStringUpper2|safeStringLower|safeStringLower2|symbol|marketId|safeSymbol|safeCurrencyCode)\($/;
    const lines = content.split ('\n');
    const starts: number[] = [];
    for (let i = 0; i < lines.length; i++) if (/^    (?:public|private|protected)\b/.test (lines[i])) starts.push (i);
    starts.push (lines.length);
    // closing index of the paren opened at text[open]; strings skipped
    const closeOf = (text: string, open: number): number => {
        let depth = 0;
        for (let k = open; k < text.length; k++) {
            const c = text[k];
            if (c === '"') { for (k++; k < text.length && text[k] !== '"'; k++) if (text[k] === '\\') k++; continue; }
            if (c === '(') depth++;
            else if (c === ')' && --depth === 0) return k;
        }
        return -1;
    };
    let changed = false;
    for (let s = 0; s + 1 < starts.length; s++) {
        const from = starts[s];
        const to = starts[s + 1];
        const member = lines.slice (from, to).filter ((l) => !/^\s*(?:\/\/|\*|\/\*)/.test (l)).join ('\n');
        if (!H.test (member)) continue;
        // the single declaration type of a name in this member (params included), else undefined
        const typeCache = new Map<string, string | undefined> ();
        const declaredType = (name: string): string | undefined => {
            if (typeCache.has (name)) return typeCache.get (name);
            const re = new RegExp (`(?:^|[\\s(,])((?:final )?[\\w.]+(?:<[\\w.?]+(?:<[\\w.?, ]*>)?(?:, [\\w.?]+(?:<[\\w.?, ]*>)?)*>)?) ${name}(?=\\s*(?:=(?!=)|[,);:]))`, 'g');
            const types = new Set<string> ();
            let count = 0;
            for (const m of member.matchAll (re)) {
                const t = m[1].replace (/^final /, '');
                if ([ 'return', 'new', 'else', 'case', 'throw', 'instanceof' ].includes (t)) continue;
                types.add (t); count++;
            }
            // lambda parameters `(name) ->` / `name ->` shadow the declaration
            const shadowed = new RegExp (`(?:\\(|, )${name}\\) ->|(?<![\\w.])${name} ->`).test (member);
            const out = !shadowed && count >= 1 && types.size === 1 ? [ ...types ][0] : undefined;
            typeCache.set (name, out);
            return out;
        };
        for (let i = from; i < to; i++) {
            let line = lines[i];
            if (!H.test (line)) continue;
            let out = '';
            let at = 0;
            const re = new RegExp (H.source, 'g');
            let m: RegExpExecArray | null;
            while ((m = re.exec (line)) !== null) {
                const open = m.index + m[0].length - 1;
                const close = closeOf (line, open);
                if (close === -1) break;
                const arg = line.slice (open + 1, close);
                const helper = m[1];
                let native = false;
                const want = new RegExp (`^${DECLARED[helper]}$`);
                if (/^[A-Za-z_]\w*$/.test (arg)) {
                    const t = declaredType (arg);
                    native = t !== undefined && want.test (t);
                } else if (helper === 'toMapArg' || helper === 'toStringArg') {
                    const call = /^this\.\w+\(/.exec (arg);
                    if (call !== null && closeOf (arg, call[0].length - 1) === arg.length - 1) {
                        const head = call[0];
                        if (helper === 'toMapArg' && MAP_CALLS.test (head)) native = true;
                        if (helper === 'toStringArg' && STRING_CALLS.test (head)) native = true;
                        if (helper === 'toMapArg' && head === 'this.omit(') {
                            // the omit(Map<String, Object>, ..) overloads return a Map
                            const first = /^this\.omit\(([A-Za-z_]\w*), /.exec (arg);
                            native = first !== null && want.test (declaredType (first[1]) ?? '');
                        }
                    }
                }
                // String.toLowerCase()/toUpperCase() on a cast receiver already prints a String
                if (helper === 'toStringArg' && /^\(\(String\)[A-Za-z_]\w*\)\.to(?:Lower|Upper)Case\(\)$/.test (arg)) native = true;
                if (!native) continue;
                out += line.slice (at, m.index) + arg;
                at = close + 1;
                re.lastIndex = close + 1;
            }
            if (at > 0) {
                lines[i] = out + line.slice (at);
                changed = true;
            }
        }
    }
    return changed ? lines.join ('\n') : content;
}

function j22CoreArgsSelfTest (): string[] {
    const problems: string[] = [];
    const body = [
        '    public Object a(Object p, Map<String, Object> q)',
        '    {',
        '        Map<String, Object> m = this.omit(q, "x");',
        '        Object o = this.omit(p, "x");',
        '        String s = this.safeString(p, "s");',
        '        Long n = this.safeInteger(p, "n");',
        '        List<String> l = null;',
        '        return this.f(Helpers.toMapArg(m), Helpers.toMapArg(o), Helpers.toStringArg(s), Helpers.toLongOrNull(n), Helpers.toStringListArg(l), Helpers.toMapArg(this.omit(q, "y")), Helpers.toMapArg(this.omit(p, "y")), Helpers.toStringArg(p), Helpers.toMapArg(this.currency((String) (s))));',
        '    }',
        '    public Object b(Object p)',
        '    {',
        '        Map<String, Object> m = null;',
        '        Object m2 = (m) -> m;',
        '        return this.g(Helpers.toMapArg(m));',
        '    }',
    ].join('\n');
    const out = nativeJavaJ22CoreArgs(body);
    const want = 'return this.f(m, Helpers.toMapArg(o), s, n, l, this.omit(q, "y"), Helpers.toMapArg(this.omit(p, "y")), Helpers.toStringArg(p), this.currency((String) (s)));';
    if (!out.includes(want)) problems.push('j22: declared-type core args must drop their identity wrapper (only those)');
    if (!out.includes('return this.g(Helpers.toMapArg(m));')) problems.push('j22: a lambda-shadowed name must keep the wrapper');
    return problems;
}

// hx4 J23: snippet checks for the extended native arithmetic pass (`--audit-string-types --self-test`)
function j23ArithmeticSelfTest (): string[] {
    const problems: string[] = [];
    const member = (body: string) => `    public Object m(Long since, Long limit, Object x, String s, Double d)\n    {\n${body}\n    }\n`;
    const cases: [string, string, string | undefined][] = [
        // positives
        [ 'microseconds', '        Object e = this.sum(x, Helpers.multiply(this.microseconds(), 1000));', 'this.sum(x, (this.microseconds() * 1000L))' ],
        [ 'guarded ternary arm', '        Long w = 5L;\n        Object r = (((java.util.Objects.equals(since, null)))) ? Helpers.subtract(this.milliseconds(), w) : since;', '? (this.milliseconds() - w) : since;' ],
        [ 'parseToInt operand', '        Long n = 5L;\n        Object e = this.sum(x, Helpers.add(this.parseToInt((((double) n) / ((double) 1000))), 60));', '((this.parseToInt((((double) n) / ((double) 1000)))) + 60L)' ],
        [ 'length operand', '        Object e = this.sum(x, Helpers.subtract((s == null ? 0 : s.length()), 1));', '(((long) (s == null ? 0 : s.length())) - 1)' ],
        [ 'double add', '        Object e = this.sum(x, Helpers.add(Math.floor(Double.parseDouble(String.valueOf(since))), 1));', '((Math.floor(Double.parseDouble(String.valueOf(since)))) + 1L)' ],
        [ 'guarded opNeg', '        if (!java.util.Objects.equals(limit, null))\n        {\n            return this.f(Helpers.opNeg(limit));\n        }', 'this.f((-limit))' ],
        [ 'double multiply into parseToInt', '        Object e = this.parseToInt(Helpers.multiply(Math.floor(Double.parseDouble(String.valueOf(since))), 3));', 'this.parseToInt(((Math.floor(Double.parseDouble(String.valueOf(since)))) * 3L))' ],
        // negatives: nullable box, double multiply into a plain slot, unguarded ternary arm, Object operand
        [ 'nullable param', '        Object e = this.sum(x, Helpers.multiply(this.microseconds(), limit));', undefined ],
        [ 'double multiply plain', '        Object e = this.sum(x, Helpers.multiply(Math.floor(Double.parseDouble(String.valueOf(since))), 3));', undefined ],
        [ 'ternary arm wrong guard', '        Long w = 5L;\n        Object r = (((java.util.Objects.equals(limit, null)))) ? Helpers.subtract(this.milliseconds(), w) : since;', undefined ],
        [ 'object operand', '        Object e = this.sum(x, Helpers.add(this.parseToInt(x), 1));', undefined ],
        [ 'nullable Double', '        Object e = this.sum(x, Helpers.add(d, 1));', undefined ],
    ];
    for (const [ name, body, expect ] of cases) {
        const out = nativeJavaJ23Arithmetic (member (body));
        const ok = expect === undefined ? out === member (body) : out.includes (expect);
        if (!ok) { problems.push (`hx4 J23 arithmetic: ${name}\n${out}`); }
    }
    return problems;
}

// hx4 J24: snippet checks for the Object-local retype that lets the J23 arithmetic go native
function j24ArithmeticSelfTest (): string[] {
    const problems: string[] = [];
    const member = (body: string) => `    public Object m(Long since, Long limit, Object x, String s)\n    {\n        Long now = this.milliseconds();\n        int duration = 60;\n${body}\n    }\n`;
    const cases: [string, string, string | undefined][] = [
        // positives
        [ 'long product local', '        Object delta = (duration * 3L);\n        Object t = Helpers.subtract(now, delta);', 'Object t = (now - delta);' ],
        [ 'guarded ternary local', '        Object st = (((!java.util.Objects.equals(since, null)))) ? since : ((now - 5L));\n        Object e = this.sum(x, Helpers.subtract(now, st));', 'this.sum(x, (now - st))' ],
        [ 'int local stays Integer', '        Object sd = Math.max(5, s.length());\n        Object e = this.sum(x, Helpers.subtract(sd, s.length()));', 'Integer sd = Math.max(5, s.length());' ],
        // negatives: nullable write, a cast read, a write the proof cannot type, no helper gained
        [ 'nullable write', '        Object st = since;\n        Object e = this.sum(x, Helpers.subtract(now, st));', undefined ],
        [ 'cast read', '        Object delta = (duration * 2L);\n        Object t = Helpers.subtract(now, delta);\n        String q = (String) delta;', undefined ],
        [ 'object write', '        Object delta = (duration * 2L);\n        delta = x;\n        Object t = Helpers.subtract(now, delta);', undefined ],
        [ 'ternary arm read', '        Object delta = (duration * 2L);\n        Object t = Helpers.subtract(now, delta);\n        Object u = (s == null) ? delta : x;', undefined ],
    ];
    for (const [ name, body, expect ] of cases) {
        const out = nativeJavaJ24Arithmetic (member (body));
        const ok = expect === undefined ? out === member (body) : out.includes (expect);
        if (!ok) { problems.push (`hx4 J24 arithmetic: ${name}\n${out}`); }
    }
    return problems;
}

// hx4 J25: compares over Object locals whose single write proves the box: `((String)s).indexOf(..)` /
// Helpers.getIndexOf (a non-null Integer) and a same-file `this.m(..)` whose every return is `this.parseToInt(..)` (Long)
function j25LongReturningMembers (content: string): Set<string> {
    const out = new Set<string> ();
    if (/^    (?:public|private|protected)[^\n(]* parseToInt\(/m.test (content)) return out;
    const lines = content.split ('\n');
    for (let i = 0; i < lines.length; i++) {
        const m = lines[i].match (/^    public Object (\w+)\(/);
        if (m === null) continue;
        let j = i + 1, returns = 0, ok = true;
        for (; j < lines.length && !/^    \}/.test (lines[j]); j++) {
            if (/^\s+return\b/.test (lines[j])) { returns++; ok = ok && /^\s+return this\.parseToInt\(.*\);$/.test (lines[j]); }
            if (/->|supplyAsync/.test (lines[j])) ok = false;
        }
        const redeclared = lines.filter ((l) => new RegExp ('^    (?:public|private|protected)[^\\n(]* ' + m[1] + '\\(').test (l)).length;
        if (ok && returns > 0 && redeclared === 1) out.add (m[1]);
        i = j;
    }
    return out;
}

function j25ProvenLocal (member: string, name: string, longMembers: Set<string>): { kind: string, boxed: boolean, text: string, nullName?: string } | undefined {
    const esc = name.replace (/\$/g, '\\$');
    const decls = [ ...member.matchAll (new RegExp ('^\\s+Object ' + esc + ' = (.+);$', 'gm')) ];
    if (decls.length !== 1) return undefined;
    const writes = member.match (new RegExp ('(?<![\\w$.])' + esc + '\\s*(?:[-+*/%]?=(?!=)|\\+\\+|--)', 'g')) ?? [];
    const otherDecl = new RegExp ('[\\w>\\]] ' + esc + '\\s*[,);:]').test (member) || new RegExp ('\\b' + esc + '\\s*->').test (member);
    if (writes.length !== 1 || otherDecl) return undefined;
    const init = decls[0][1];
    if (/^\(\(String\)[\w$.]+\)\.indexOf\("(?:[^"\\]|\\.)*"\)$/.test (init) || /^Helpers\.getIndexOf\([\w$.]+, "(?:[^"\\]|\\.)*"\)$/.test (init)) {
        return { kind: 'long', boxed: false, text: '((Integer) ' + name + ')' };
    }
    const call = init.match (/^this\.(\w+)\(/);
    if (call !== null && longMembers.has (call[1]) && h2kJ15Close (init, call[0].length - 1) === init.length - 1) {
        return { kind: 'long', boxed: true, text: '((Long) ' + name + ')', nullName: name };
    }
    return undefined;
}

export function nativeJavaJ25Compare (content: string): string {
    if (!/Helpers\.is(?:Greater|Less)Than/.test (content)) return content;
    const lines = content.split ('\n');
    const fields = new Set<string> ();
    for (const line of lines) {
        const f = line.match (/^    (?:(?:public|private|protected|static|final|volatile|transient) )*[\w.][\w.<>, ?\[\]]* ([A-Za-z_$][\w$]*)\s*(?:=|;)/);
        if (f !== null) fields.add (f[1]);
    }
    const longMembers = j25LongReturningMembers (content);
    const starts: number[] = [];
    for (let i = 0; i < lines.length; i++) if (/^    (?:public|private|protected)\b.*\(/.test (lines[i])) starts.push (i);
    const re = /Helpers\.(is(?:GreaterThan|LessThan|GreaterThanOrEqual|LessThanOrEqual))\(/g;
    for (let s = 0; s < starts.length; s++) {
        const from = starts[s], to = s + 1 < starts.length ? starts[s + 1] : lines.length;
        const member = lines.slice (from, to).join ('\n');
        if (!member.includes ('Helpers.is')) continue;
        const operand = (text: string) => {
            const inner = h2kJ10StripParens (text);
            if (/^[A-Za-z_$][\w$]*$/.test (inner) && !fields.has (inner)) {
                const p = j25ProvenLocal (member, inner, longMembers);
                if (p !== undefined) return { ...p, mine: true };
            }
            const o = j19Operand (text, member, fields, content);
            return o === undefined ? undefined : { ...o, mine: false };
        };
        for (let i = from; i < to; i++) {
            const trimmed = lines[i].trim ();
            if (trimmed.startsWith ('//') || trimmed.startsWith ('*')) continue;
            let line = lines[i], again = true;
            while (again) {
                again = false;
                re.lastIndex = 0;
                let m;
                while ((m = re.exec (line)) !== null) {
                    const split = h2kJ10SplitArgs (line, m.index + m[0].length);
                    if (split === undefined || split.args.length !== 2) continue;
                    const l = operand (split.args[0]), r = operand (split.args[1]);
                    if (l === undefined || r === undefined || !(l.mine || r.mine)) continue;
                    let native = h2kJ10Compare (m[1].replace (/^is/, ''), l, r);
                    if (native === undefined) continue;
                    for (const o of [ l, r ]) {
                        if (o.mine && o.nullName !== undefined) native = native.split (o.text + ' == null').join (o.nullName + ' == null').split (o.text + ' != null').join (o.nullName + ' != null');
                    }
                    line = line.slice (0, m.index) + native + line.slice (split.end + 1);
                    again = true;
                    break;
                }
            }
            lines[i] = line;
        }
    }
    return lines.join ('\n');
}

function j25CompareSelfTest (): string[] {
    const problems: string[] = [];
    const member = (body: string) => `    public Object m(Long since, Object x, String s)\n    {\n${body}\n    }\n`;
    const sbe = '    public Object rd(Object a)\n    {\n        Object r = 0;\n        return this.parseToInt(r);\n    }\n';
    const cases: [string, string, string | undefined][] = [
        [ 'indexOf gt', '        Object q = ((String)s).indexOf("?");\n        if (Helpers.isGreaterThan(q, 0)) {}', '((((Integer) q) > 0))' ],
        [ 'indexOf vs length', '        Object c = ((String)s).indexOf(":");\n        boolean b = Helpers.isLessThan(c, (((long) ((String)s).length()) - 1L));', '(((Integer) c) < (((long) ((String)s).length()) - 1L))' ],
        [ 'getIndexOf ge', '        Object c = Helpers.getIndexOf(s, ":");\n        boolean b = Helpers.isGreaterThanOrEqual(c, 0);', '(((Integer) c) >= 0)' ],
        [ 'sbe uint', '        Object bl = this.rd(x);\n        boolean b = Helpers.isLessThan(bl, 50);\n    }\n' + sbe + '    public void z()\n    {', '(bl == null || ((Long) bl) < 50)' ],
        [ 'sbe ge', '        Object bl = this.rd(x);\n        boolean b = Helpers.isGreaterThanOrEqual(bl, 248);\n    }\n' + sbe + '    public void z()\n    {', '(bl != null && ((Long) bl) >= 248)' ],
        // negatives: rewritten local, Object other side, non-literal indexOf arg, unknown callee, parseToInt override
        [ 'rewritten', '        Object q = ((String)s).indexOf("?");\n        q = x;\n        boolean b = Helpers.isGreaterThan(q, 0);', undefined ],
        [ 'object other', '        Object q = ((String)s).indexOf("?");\n        boolean b = Helpers.isGreaterThan(q, x);', undefined ],
        [ 'indexOf var arg', '        Object q = ((String)s).indexOf(x);\n        boolean b = Helpers.isGreaterThan(q, 0);', undefined ],
        [ 'unknown callee', '        Object bl = this.other(x);\n        boolean b = Helpers.isLessThan(bl, 50);', undefined ],
        [ 'parseToInt override', '        Object bl = this.rd(x);\n        boolean b = Helpers.isLessThan(bl, 50);\n    }\n' + sbe + '    public Long parseToInt(Object n)\n    {\n        return null;', undefined ],
    ];
    for (const [ name, body, expect ] of cases) {
        const out = nativeJavaJ25Compare (member (body));
        const ok = expect === undefined ? out === member (body) : out.includes (expect);
        if (!ok) problems.push (`hx4 J25 compare ${name}: ${out.slice (0, 500)}`);
    }
    return problems;
}

// hx4 J26
// Object/var locals whose every write is a proven Map (null, a Map literal / newMap, a Map-declared
// name, a 2-arg extend, omit of a Map, Pair.second() of a Map slot, or slot 1 of an audited tuple
// producer) print `java.util.Map<String, Object>`; J22 then drops their toMapArg identity wrappers.
// tuple producers -> index of the params argument slot 1 echoes (or omits from); -1 = always a Map
function j26Slot1MapProducers (): Record<string, { params: number, venue?: string }> {
    return {
    handlePostOnly: { params: 2 }, handleParamBool: { params: 0 }, handleParamBool2: { params: 0 },
    handleParamString: { params: 0 }, handleParamString2: { params: 0 },
    handleOptionAndParams: { params: 0 }, handleOptionAndParams2: { params: 0 },
    handleProductTypeAndParams: { params: -1, venue: 'Bitget' }, handleUTAAndParams: { params: -1, venue: 'Bitget' },
    handleDeriveSubaccountId: { params: -1, venue: 'Derive' }, parseCreateEditOrderArgs: { params: -1, venue: 'Hyperliquid' },
    requestWalletHistoryRows: { params: -1, venue: 'Btse' }, prepareRequest: { params: -1, venue: 'Gate' },
    handleApiKeyIndex: { params: 0, venue: 'Lighter' }, handleAccountIndex: { params: 0, venue: 'Lighter' },
    };
}

function j26Close (text: string, open: number): number {
    let depth = 0;
    for (let k = open; k < text.length; k++) {
        const c = text[k];
        if (c === '"') { for (k++; k < text.length && text[k] !== '"'; k++) if (text[k] === '\\') k++; continue; }
        if (c === '(' || c === '[' || c === '{') depth++;
        else if ((c === ')' || c === ']' || c === '}') && --depth === 0) return k;
    }
    return -1;
}

// end of the statement starting at `from` (a depth-0 `;`), strings, `//` comments and `{{ }}` bodies skipped
function j26StatementEnd (text: string, from: number): number {
    let depth = 0;
    for (let k = from; k < text.length; k++) {
        const c = text[k];
        if (c === '"') { for (k++; k < text.length && text[k] !== '"'; k++) if (text[k] === '\\') k++; continue; }
        if (c === '/' && text[k + 1] === '/') { while (k < text.length && text[k] !== '\n') k++; continue; }
        if (c === '(' || c === '[' || c === '{') depth++;
        else if (c === ')' || c === ']' || c === '}') { if (--depth < 0) return -1; }
        else if (c === ';' && depth === 0) return k;
    }
    return -1;
}

function j26Strip (e: string): string {
    e = e.trim ();
    while (e.startsWith ('(') && j26Close (e, 0) === e.length - 1) e = e.slice (1, -1).trim ();
    return e;
}

// top-level arguments of the call whose `(` is at text[open]
function j26Args (text: string, open: number): string[] | undefined {
    const close = j26Close (text, open);
    if (close === -1) return undefined;
    const out: string[] = [];
    let depth = 0, at = open + 1;
    for (let k = open + 1; k < close; k++) {
        const c = text[k];
        if (c === '"') { for (k++; k < close && text[k] !== '"'; k++) if (text[k] === '\\') k++; continue; }
        if (c === '(' || c === '[' || c === '{' || c === '<') depth++;
        else if (c === ')' || c === ']' || c === '}' || (c === '>' && text[k - 1] !== '-')) depth--;
        else if (c === ',' && depth === 0) { out.push (text.slice (at, k).trim ()); at = k + 1; }
    }
    const last = text.slice (at, close).trim ();
    if (last !== '') out.push (last);
    return out;
}

function j26Ternary (e: string): [string, string, string] | undefined {
    let depth = 0, q = -1;
    for (let k = 0; k < e.length; k++) {
        const c = e[k];
        if (c === '"') { for (k++; k < e.length && e[k] !== '"'; k++) if (e[k] === '\\') k++; continue; }
        if (c === '(' || c === '[' || c === '{') depth++;
        else if (c === ')' || c === ']' || c === '}') depth--;
        else if (c === '?' && depth === 0 && q === -1) q = k;
        else if (c === ':' && depth === 0 && q !== -1) return [ e.slice (0, q), e.slice (q + 1, k), e.slice (k + 1) ];
    }
    return undefined;
}

function j26Member (member: string, className: string): string {
    if (!member.includes ('Helpers.toMapArg(')) return member;
    const header = member.slice (0, member.indexOf ('\n') === -1 ? member.length : member.indexOf ('\n'));
    // declared names: name -> list of declared types (params included)
    const declTypes = new Map<string, string[]> ();
    const declRe = /(?:^|[\s(,])((?:final )?[\w.]+(?:<[\w.<>, ?]*>)?) ([A-Za-z_]\w*)(?=\s*(?:=(?!=)|[,);:]))/g;
    for (const m of member.matchAll (declRe)) {
        const t = m[1].replace (/^final /, '');
        if ([ 'return', 'new', 'else', 'case', 'throw', 'instanceof' ].includes (t)) continue;
        const list = declTypes.get (m[2]) ?? [];
        list.push (t);
        declTypes.set (m[2], list);
    }
    const lambdaShadow = (n: string) => new RegExp (`(?:\\(|, )${n}\\) ->|(?<![\\w.])${n} ->`).test (member);
    const isParam = (n: string) => new RegExp (`[(,] ?(?:final )?[\\w.<>, ?]+ ${n}[,)]`).test (header);
    const declaredMap = (n: string) => {
        const t = declTypes.get (n);
        return t !== undefined && t.length >= 1 && t.every ((x) => /^(?:java\.util\.)?Map<String, Object>$/.test (x)) && !lambdaShadow (n);
    };
    // candidates: one `Object`/`var` declaration in the body, not a parameter, not lambda-shadowed
    const candidates = new Set<string> ();
    for (const [ n, t ] of declTypes) {
        if (t.length === 1 && (t[0] === 'Object' || t[0] === 'var') && !isParam (n) && !lambdaShadow (n)
            && new RegExp (`(?:^|[\\s;{])(?:Object|var) ${n} = `, 'm').test (member)) candidates.add (n);
    }
    if (candidates.size === 0) return member;
    // every write `[Object |var ]n = <rhs>;` of each candidate
    const writes = new Map<string, { start: number, end: number, rhs: string }[]> ();
    for (const n of candidates) {
        const list: { start: number, end: number, rhs: string }[] = [];
        let ok = true;
        for (const m of member.matchAll (new RegExp (`(?<![\\w.])${n}\\s*(=(?!=)|\\+=|-=|\\+\\+|--)`, 'g'))) {
            if (m[1] !== '=') { ok = false; break; }
            const start = m.index + m[0].length;
            const end = j26StatementEnd (member, start);
            if (end === -1) { ok = false; break; }
            list.push ({ start, end, rhs: member.slice (start, end) });
        }
        // no inconvertible casts / instanceof on the local
        // any cast but a Map one (or an instanceof) on the local could stop compiling or change meaning
        for (const c of member.matchAll (new RegExp (`\\(([\\w.<>, ?]+)\\)\\s*\\(?\\s*${n}(?![\\w(])`, 'g'))) {
            if (!/^(?:java\.util\.)?Map<(?:String, Object|\?, \?)>$/.test (c[1])) ok = false;
        }
        if (new RegExp (`(?<![\\w.])${n} instanceof `).test (member)) ok = false;
        if (ok && list.length > 0) writes.set (n, list); else candidates.delete (n);
    }
    // the holder `<h> = <producer call>` of a `((List<Object>) h).get(1)` read
    const holderCall = (h: string): { name: string, args: string[] } | undefined => {
        const m = new RegExp (`(?:^|[\\s;{])(?:var|List<Object>|java\\.util\\.List<Object>) ${h} = (?:\\((?:java\\.util\\.)?List<Object>\\) )?\\(?(this\\.(\\w+)\\()`, 'm').exec (member);
        if (m === null) return undefined;
        if ((declTypes.get (h) ?? []).length !== 1) return undefined;
        const open = m.index + m[0].length - 1;
        const args = j26Args (member, open);
        return args === undefined ? undefined : { name: m[2], args };
    };
    const proves = (e: string, assumed: Set<string>, depth = 0): boolean => {
        e = j26Strip (e);
        if (e === 'null' || e.startsWith ('new HashMap<String, Object>() {{') || e.startsWith ('new java.util.HashMap<String, Object>() {{')) return true;
        if (/^[A-Za-z_]\w*$/.test (e)) return assumed.has (e) || declaredMap (e);
        const t = j26Ternary (e);
        if (t !== undefined) return depth < 4 && proves (t[1], assumed, depth + 1) && proves (t[2], assumed, depth + 1);
        const call = /^(this\.\w+\(|Helpers\.newMap\()/.exec (e);
        if (call !== null && j26Close (e, call[0].length - 1) === e.length - 1) {
            if (call[1] === 'Helpers.newMap(' || /^this\.(?:market|currency|safeMarket|safeCurrency|keysort|deepExtend)\($/.test (call[1])) return true;
            const args = j26Args (e, call[0].length - 1) ?? [];
            if (call[1] === 'this.extend(') return args.length === 2;
            if (call[1] === 'this.omit(') return args.length >= 2 && /^[A-Za-z_]\w*$/.test (args[0]) && (assumed.has (args[0]) || declaredMap (args[0]));
            return false;
        }
        const second = /^([A-Za-z_]\w*)\.second\(\)$/.exec (e);
        if (second !== null) {
            const t2 = declTypes.get (second[1]);
            return t2 !== undefined && t2.length === 1 && /^(?:io\.github\.ccxt\.types\.)?Pair<[\w.<>, ?]+, (?:java\.util\.)?Map<String, Object>>$/.test (t2[0]);
        }
        const slot = /^\(\((?:java\.util\.)?List<Object>\) ([A-Za-z_]\w*)\)\.get\(1\)$/.exec (e);
        if (slot !== null) {
            const holder = holderCall (slot[1]);
            const spec = holder === undefined ? undefined : j26Slot1MapProducers ()[holder.name];
            if (holder === undefined || spec === undefined || (spec.venue !== undefined && spec.venue !== className)) return false;
            if (spec.params === -1) return true;
            const arg = holder.args[spec.params];
            return arg !== undefined && depth < 4 && proves (arg.replace (/^\(Map<String, Object>\) /, ''), assumed, depth + 1);
        }
        return false;
    };
    // greatest fixpoint over the candidates
    const assumed = new Set (candidates);
    for (let changed = true; changed;) {
        changed = false;
        for (const n of [ ...assumed ]) {
            if (!(writes.get (n) ?? []).every ((w) => proves (w.rhs, assumed))) { assumed.delete (n); changed = true; }
        }
    }
    // retype the toMapArg names and the candidates their proofs read (static omit/arg types must line up)
    const wanted = new Set<string> ();
    const visit = (n: string) => {
        if (wanted.has (n) || !assumed.has (n)) return;
        wanted.add (n);
        for (const w of writes.get (n) ?? []) for (const m of w.rhs.matchAll (/[A-Za-z_]\w*/g)) visit (m[0]);
    };
    for (const m of member.matchAll (/Helpers\.toMapArg\(([A-Za-z_]\w*)\)/g)) visit (m[1]);
    if (wanted.size === 0) return member;
    const edits: { at: number, end: number, text: string }[] = [];
    for (const n of wanted) {
        const decl = new RegExp (`(^|[\\s;{])(Object|var) ${n} = `, 'm').exec (member);
        if (decl === null) return member;
        const at = decl.index + decl[1].length;
        edits.push ({ at, end: at + decl[2].length, text: 'java.util.Map<String, Object>' });
        for (const w of writes.get (n) ?? []) {
            const rhs = j26Strip (w.rhs);
            if (/^\(\((?:java\.util\.)?List<Object>\) [A-Za-z_]\w*\)\.get\(1\)$/.test (rhs)) {
                const lead = w.rhs.length - w.rhs.trimStart ().length;
                edits.push ({ at: w.start + lead, end: w.start + lead, text: '(java.util.Map<String, Object>) ' });
            }
        }
    }
    edits.sort ((a, b) => b.at - a.at);
    let out = member;
    for (const e of edits) out = out.slice (0, e.at) + e.text + out.slice (e.end);
    return out;
}

export function nativeJavaJ26MapLocals (content: string): string {
    if (!content.includes ('Helpers.toMapArg(')) return content;
    const cls = /^public (?:abstract )?class (\w+)/m.exec (content);
    const className = cls === null ? '' : cls[1];
    const lines = content.split ('\n');
    const starts: number[] = [];
    for (let i = 0; i < lines.length; i++) if (/^    (?:public|private|protected)\b/.test (lines[i])) starts.push (i);
    if (starts.length === 0) return content;
    starts.push (lines.length);
    const parts: string[] = [ lines.slice (0, starts[0]).join ('\n') ];
    for (let s = 0; s + 1 < starts.length; s++) parts.push (j26Member (lines.slice (starts[s], starts[s + 1]).join ('\n'), className));
    return parts.join ('\n');
}

// hx4 J26: snippet checks for the Map-local retype (`--audit-string-types --self-test`)
function j26MapLocalsSelfTest (): string[] {
    const problems: string[] = [];
    const cls = (body: string) => `public class Bitget extends BitgetApi\n{\n    public Object m(Map<String, Object> parameters, Object p)\n    {\n${body}\n    }\n}`;
    const run = (body: string) => nativeJavaJ22CoreArgs (nativeJavaJ26MapLocals (cls (body)));
    const cases: [string, string, string | undefined][] = [
        // positives: Pair slot, omit of a Map, audited tuple slot 1, base handle* over a Map params argument
        [ 'pair + tuple slot', '        Object q = null;\n        Pair<String, Map<String, Object>> aqVariable = this.handleMarginModeAndParams("x", parameters, (String) null);\n        q = aqVariable.second();\n        List<Object> bqVariable = (List<Object>) this.handleProductTypeAndParams(null, Helpers.toMapArg(q));\n        q = ((List<Object>) bqVariable).get(1);\n        return this.f(Helpers.toMapArg(q));',
            'java.util.Map<String, Object> q = null;' ],
        [ 'omit of Map', '        Object o = this.omit(parameters, "a");\n        return this.f(Helpers.toMapArg(o));', 'java.util.Map<String, Object> o = this.omit(parameters, "a");\n        return this.f(o);' ],
        [ 'handleParamString over Map', '        List<Object> vxVariable = (List<Object>) this.handleParamString(parameters, "k", (String) null);\n        var x = ((List<Object>) vxVariable).get(1);\n        return this.f(Helpers.toMapArg(x));', 'java.util.Map<String, Object> x = (java.util.Map<String, Object>) ((List<Object>) vxVariable).get(1);' ],
        // negatives: Object params argument, Object omit source, unaudited producer, foreign venue, String cast use
        [ 'Object params arg', '        List<Object> vxVariable = (List<Object>) this.handleParamString(p, "k", (String) null);\n        var x = ((List<Object>) vxVariable).get(1);\n        return this.f(Helpers.toMapArg(x));', undefined ],
        [ 'omit of Object', '        Object o = this.omit(p, "a");\n        return this.f(Helpers.toMapArg(o));', undefined ],
        [ 'unaudited producer', '        List<Object> vxVariable = (List<Object>) this.handleOther(parameters);\n        var x = ((List<Object>) vxVariable).get(1);\n        return this.f(Helpers.toMapArg(x));', undefined ],
        [ 'venue mismatch', '        List<Object> vxVariable = (List<Object>) this.handleApiKeyIndex(parameters, "a", "b", "c", null);\n        var x = ((List<Object>) vxVariable).get(1);\n        return this.f(Helpers.toMapArg(x));', undefined ],
        [ 'String cast use', '        Object o = this.omit(parameters, "a");\n        String s = (String) o;\n        return this.f(Helpers.toMapArg(o));', undefined ],
        [ 'other write', '        Object o = this.omit(parameters, "a");\n        o = this.safeValue(parameters, "x");\n        return this.f(Helpers.toMapArg(o));', undefined ],
    ];
    for (const [ name, body, expect ] of cases) {
        const out = run (body);
        const ok = expect === undefined ? out === nativeJavaJ22CoreArgs (cls (body)) : out.includes (expect);
        if (!ok) problems.push (`hx4 J26 map locals: ${name}\n${out}`);
    }
    return problems;
}

// hx4 J27: snippet checks for the Object-local box retype (`--audit-string-types --self-test`)
function j27ArithmeticSelfTest (): string[] {
    const problems: string[] = [];
    const member = (body: string) => `    public Object m(Object o, Long since)\n    {\n${body}\n    }\n`;
    const cases: [string, string, string | undefined][] = [
        // positives: Double producers under a guard, a Long param copy
        [ 'guarded double subtract', '        Object a = this.safeNumber(o, "a", (Object) null);\n        Object b = this.safeNumber(o, "b", (Object) null);\n        Object r = null;\n        if ((!java.util.Objects.equals(a, null)) && (!java.util.Objects.equals(b, null)))\n        {\n            r = Helpers.subtract(a, b);\n        }\n        return r;', 'r = (a - b);' ],
        [ 'long copy divide', '        if (java.util.Objects.equals(since, null))\n        {\n            return null;\n        }\n        Object s = since;\n        return this.parseToInt(Helpers.divide(s, 1000));', 'Long s = since;' ],
        // negatives: double multiply re-boxes, mixed boxes, unguarded, cast read
        [ 'double multiply', '        Object a = this.safeNumber(o, "a", (Object) null);\n        if (!java.util.Objects.equals(a, null))\n        {\n            return Helpers.multiply(a, a);\n        }\n        return null;', undefined ],
        [ 'mixed boxes', '        Object a = this.safeNumber(o, "a", (Object) null);\n        a = this.safeInteger(o, "b");\n        if (!java.util.Objects.equals(a, null))\n        {\n            return Helpers.subtract(a, 1);\n        }\n        return null;', undefined ],
        [ 'unguarded', '        Object a = this.safeNumber(o, "a", (Object) null);\n        return Helpers.subtract(a, 1);', undefined ],
        [ 'cast read', '        Object a = this.safeInteger(o, "a");\n        String q = (String) a;\n        if (!java.util.Objects.equals(a, null))\n        {\n            return Helpers.subtract(a, 1);\n        }\n        return null;', undefined ],
    ];
    for (const [ name, body, expect ] of cases) {
        const out = nativeJavaJ27Arithmetic (member (body));
        const ok = expect === undefined ? out === member (body) : out.includes (expect);
        if (!ok) { problems.push (`hx4 J27 arithmetic: ${name}\n${out}`); }
    }
    return problems;
}

// hx4 J28
// ordered compares whose operand is an unwritten TS-`number` parameter printed `Object` (audited table, tier/class/method)
// or a `this.sum(..)` (Generic.sum: a non-null Long/Double); the other side an int literal, a `var i = <int>` counter or
// a declared Long/Integer/long/int/Double. Forms keep the helper's null table and its NaN answers (LT/LE true, GT/GE false).
function j28NumberParams (): Record<string, Record<string, string[]>> {
    return {
        'pro/Paradex': {
            sbeReadUint: [ 'length' ], sbeReadVarStrings: [ 'count', 'frameLength' ], parseSbeTrade: [ 'blockLength' ],
            parseSbeOrderBook: [ 'blockLength' ], parseSbeMarketSummary: [ 'blockLength' ], parseSbeFundingData: [ 'blockLength' ],
            parseSbeOrder: [ 'blockLength' ], parseSbeFill: [ 'blockLength' ], parseSbePosition: [ 'blockLength' ], parseSbeAccount: [ 'blockLength' ],
        },
        'prediction/Opinion': { opinionOrderRawAmounts: [ 'decimals' ] },
        'prediction/Myriad': { fromWeiWithDecimals: [ 'decimals' ] },
        'prediction/Hyperliquid': { calculatePricePrecision: [ 'midPx' ] },
    };
}

function j28ClassKey (content: string): string | undefined {
    const pkg = content.match (/^package io\.github\.ccxt\.exchanges(\.pro|\.prediction)?;$/m);
    const cls = content.match (/^public class (\w+) extends/m);
    if (pkg === null || cls === null) return undefined;
    return (pkg[1] === '.pro' ? 'pro/' : pkg[1] === '.prediction' ? 'prediction/' : '') + cls[1];
}

function j28Native (helper: string, l: { text: string, nullName?: string }, r: { text: string, nullName?: string }): string {
    const ln = l.nullName !== undefined ? `${l.nullName} == null` : undefined;
    const rn = r.nullName !== undefined ? `${r.nullName} == null` : undefined;
    const lnn = l.nullName !== undefined ? `${l.nullName} != null` : undefined;
    const rnn = r.nullName !== undefined ? `${r.nullName} != null` : undefined;
    const and = (...p: (string | undefined)[]) => p.filter ((x) => x !== undefined).join (' && ');
    const or = (...p: (string | undefined)[]) => p.filter ((x) => x !== undefined).join (' || ');
    const wrap = (s: string) => '(' + s + ')';
    switch (helper) {
    // helper GT: (a, null) true, (null, _) false; GE = GT || isEqual (null, null) is true
    case 'isGreaterThan': return wrap (and (lnn, rn === undefined ? `${l.text} > ${r.text}` : wrap (or (rn, `${l.text} > ${r.text}`))));
    case 'isGreaterThanOrEqual': return wrap (or (ln !== undefined && rn !== undefined ? wrap (and (ln, rn)) : undefined, and (lnn, rn === undefined ? `${l.text} >= ${r.text}` : wrap (or (rn, `${l.text} >= ${r.text}`)))));
    // LT = !GT && !isEqual; LE = !GT (both true on NaN)
    case 'isLessThan': return wrap (and (ln !== undefined && rn !== undefined ? `!(${and (ln, rn)})` : undefined, or (ln, wrap (and (rnn, `!(${l.text} >= ${r.text})`)))));
    default: return wrap (or (ln, wrap (and (rnn, `!(${l.text} > ${r.text})`))));
    }
}

export function nativeJavaJ28Compare (content: string): string {
    if (!/Helpers\.is(?:Greater|Less)Than/.test (content)) return content;
    const key = j28ClassKey (content);
    const table = key === undefined ? {} : (j28NumberParams ()[key] ?? {});
    const sumOverridden = /^    (?:public|private|protected)[^\n(]* sum\(/m.test (content);
    const lines = content.split ('\n');
    const fields = new Set<string> ();
    for (const line of lines) {
        const f = line.match (/^    (?:(?:public|private|protected|static|final|volatile|transient) )*[\w.][\w.<>, ?\[\]]* ([A-Za-z_$][\w$]*)\s*(?:=|;)/);
        if (f !== null) fields.add (f[1]);
    }
    const re = /Helpers\.(isGreaterThanOrEqual|isGreaterThan|isLessThanOrEqual|isLessThan)\(/g;
    for (let i = 0; i < lines.length; i++) {
        const head = lines[i].match (/^    public [^(]* (\w+)\(([^)]*)\)$/);
        if (head === null) continue;
        let end = i + 1;
        while (end < lines.length && lines[end] !== '    }') end++;
        const member = lines.slice (i, end).join ('\n');
        if (!member.includes ('Helpers.is')) { i = end; continue; }
        const params = new Set<string> ();
        for (const p of table[head[1]] ?? []) {
            const write = new RegExp (`(?<![\\w.$])${p}\\s*(?:[-+*/%]?=(?!=)|\\+\\+|--)|(?:\\+\\+|--)${p}\\b`);
            const body = lines.slice (i + 1, end).map ((l) => l.replace (/"(?:[^"\\]|\\.)*"/g, '""'));
            const declared = new RegExp (`(?:^|[,(]\\s*)Object ${p}$`);
            if (head[2].split (',').some ((a) => declared.test (a.trim ())) && !body.some ((l) => write.test (l) || new RegExp (`[\\w>\\]] ${p}\\s*[=;,):]|\\b${p}\\s*->`).test (l))) params.add (p);
        }
        const operand = (text: string) => {
            const inner = h2kJ10StripParens (text);
            if (params.has (inner)) return { text: `((Number) ${inner}).doubleValue()`, nullName: inner, mine: true };
            const sum = inner.match (/^this\.sum\(/);
            if (sum !== null && !sumOverridden && h2kJ15Close (inner, sum[0].length - 1) === inner.length - 1) return { text: `((Number) ${inner}).doubleValue()`, mine: true };
            if (/^-?\d{1,15}L?$/.test (inner)) return { text: inner, mine: false };
            if (/^[A-Za-z_$][\w$]*$/.test (inner)) {
                const t = h2kJ10DeclaredType (member, inner, fields);
                if (t !== undefined) return { text: inner, nullName: t.boxed ? inner : undefined, mine: false };
            }
            return undefined;
        };
        for (let k = i + 1; k < end; k++) {
            const trimmed = lines[k].trim ();
            if (trimmed.startsWith ('//') || trimmed.startsWith ('*')) continue;
            let line = lines[k], again = true;
            while (again) {
                again = false;
                re.lastIndex = 0;
                let m;
                while ((m = re.exec (line)) !== null) {
                    const split = h2kJ10SplitArgs (line, m.index + m[0].length);
                    if (split === undefined || split.args.length !== 2) continue;
                    const l = operand (split.args[0]), r = operand (split.args[1]);
                    if (l === undefined || r === undefined || !(l.mine || r.mine)) continue;
                    line = line.slice (0, m.index) + j28Native (m[1], l, r) + line.slice (split.end + 1);
                    again = true;
                    break;
                }
            }
            lines[k] = line;
        }
        i = end;
    }
    return lines.join ('\n');
}

function j28CompareSelfTest (): string[] {
    const problems: string[] = [];
    const cls = (pkg: string, name: string, member: string) => `package io.github.ccxt.exchanges${pkg};\n\npublic class ${name} extends X\n{\n${member}    }\n}\n`;
    const sbe = (body: string) => cls ('.pro', 'Paradex', `    public Map<String, Object> parseSbeTrade(Object frameHex, Object blockLength, Object frameLength)\n    {\n${body}\n`);
    const cases: [string, string, string | undefined][] = [
        [ 'param lt', sbe ('        if (Helpers.isLessThan(blockLength, 50))'), '(blockLength == null || (!(((Number) blockLength).doubleValue() >= 50)))' ],
        [ 'param ge', sbe ('        if (Helpers.isGreaterThanOrEqual(blockLength, 248))'), '(blockLength != null && ((Number) blockLength).doubleValue() >= 248)' ],
        [ 'counter lt', cls ('.prediction', 'Myriad', '    public String fromWeiWithDecimals(Object hexValue, Object decimals)\n    {\n        for (var i = 0; Helpers.isLessThan(i, decimals); i++)\n'), '((decimals != null && !(i >= ((Number) decimals).doubleValue())))' ],
        [ 'sum gt', cls ('', 'Bitget', '    public Object m(Object a, Object b)\n    {\n        if (Helpers.isGreaterThan(this.sum(a, b), 1))\n'), '(((Number) this.sum(a, b)).doubleValue() > 1)' ],
        [ 'long vs sum', cls ('.pro', 'Paradex', '    public Object parseSbeMessage(Object message)\n    {\n        Long frameLength = this.parseToInt(message);\n        if (Helpers.isLessThan(frameLength, this.sum(frameLength, 8)))\n'), '(frameLength == null || (!(frameLength >= ((Number) this.sum(frameLength, 8)).doubleValue())))' ],
        // negatives: written param, param outside the table, other class, Object local, overridden sum
        [ 'written', sbe ('        blockLength = 3;\n        if (Helpers.isLessThan(blockLength, 50))'), undefined ],
        [ 'not in table', sbe ('        if (Helpers.isLessThan(frameHex, 50))'), undefined ],
        [ 'other class', cls ('.pro', 'Bybit', '    public Map<String, Object> parseSbeTrade(Object frameHex, Object blockLength, Object frameLength)\n    {\n        if (Helpers.isLessThan(blockLength, 50))\n'), undefined ],
        [ 'object local', cls ('', 'Bitget', '    public Object m(Object a, Object b)\n    {\n        Object x = a;\n        if (Helpers.isGreaterThan(this.sum(a, b), x))\n'), undefined ],
        [ 'sum override', cls ('', 'Bitget', '    public Object m(Object a, Object b)\n    {\n        if (Helpers.isGreaterThan(this.sum(a, b), 1))\n    }\n    public Object sum(Object a, Object b)\n    {\n        return a;\n'), undefined ],
    ];
    for (const [ name, src, expect ] of cases) {
        const out = nativeJavaJ28Compare (src);
        const ok = expect === undefined ? out === src : out.includes (expect);
        if (!ok) problems.push (`hx4 J28 compare ${name}: ${out.slice (0, 600)}`);
    }
    return problems;
}

// hx4 J29: Helpers.addElementToObject / Helpers.GetValue on locals whose single member-wide declaration
// is io.github.ccxt.ws.WsOrderBook (a synchronized Map) or a List<String> read at a `for (var i` counter.
export function nativeJavaJ29Containers (content: string): string {
    if (!/Helpers\.(?:addElementToObject|GetValue)\(/.test (content)) return content;
    const WS_BOOK = /^(?:io\.github\.ccxt\.ws\.)?WsOrderBook(?:\.(?:Counted|Indexed)OrderBook)?$/;
    const LIST_STRING = /^(?:java\.util\.)?List<String>$/;
    const lines = content.split ('\n');
    const starts: number[] = [];
    for (let i = 0; i < lines.length; i++) if (/^    (?:public|private|protected)\b/.test (lines[i])) starts.push (i);
    starts.push (lines.length);
    let changed = false;
    for (let s = 0; s + 1 < starts.length; s++) {
        const from = starts[s];
        const to = starts[s + 1];
        const member = lines.slice (from, to).filter ((l) => !/^\s*(?:\/\/|\*|\/\*)/.test (l)).join ('\n');
        if (!/Helpers\.(?:addElementToObject|GetValue)\(/.test (member)) continue;
        // the single declared type of a name in this member (params included), undefined when shadowed/mixed
        const typeCache = new Map<string, string | undefined> ();
        const declaredType = (name: string): string | undefined => {
            if (typeCache.has (name)) return typeCache.get (name);
            const re = new RegExp (`(?:^|[\\s(,])((?:final )?[\\w.]+(?:<[\\w.?]+(?:<[\\w.?, ]*>)?(?:, [\\w.?]+(?:<[\\w.?, ]*>)?)*>)?) ${name}(?=\\s*(?:=(?!=)|[,);:]))`, 'g');
            const types = new Set<string> ();
            for (const m of member.matchAll (re)) {
                const t = m[1].replace (/^final /, '');
                if ([ 'return', 'new', 'else', 'case', 'throw', 'instanceof' ].includes (t)) continue;
                types.add (t);
            }
            const shadowed = new RegExp (`(?:\\(|, )${name}\\) ->|(?<![\\w.])${name} ->`).test (member);
            const out = !shadowed && types.size === 1 ? [ ...types ][0] : undefined;
            typeCache.set (name, out);
            return out;
        };
        const counter = (name: string): boolean => declaredType (name) === 'var'
            && new RegExp (`\\bfor \\(var ${name} = \\d+;`).test (member);
        for (let i = from; i < to; i++) {
            const line = lines[i];
            if (/^\s*(?:\/\/|\*)/.test (line)) continue;
            let next = line;
            // statement put: WsOrderBook.put is the synchronized write the helper's Map branch performs
            next = next.replace (/^(\s*)Helpers\.addElementToObject\(([A-Za-z_]\w*), ("\w+"|[A-Za-z_]\w*), (.*)\);(\s*\/\/.*)?$/, (whole, ind, recv, key, value, tail) => {
                if (!WS_BOOK.test (declaredType (recv) ?? '')) return whole;
                if (!key.startsWith ('"') && declaredType (key) !== 'String') return whole;
                return `${ind}${recv}.put(${key}, ${value});${tail ?? ''}`;
            });
            next = next.replace (/Helpers\.GetValue\(([A-Za-z_]\w*), ([A-Za-z_]\w*)\)/g, (whole, recv, key) => {
                const rt = declaredType (recv) ?? '';
                // the helper reads a Map only for a String key it contains, else null
                if (WS_BOOK.test (rt) && declaredType (key) === 'String') {
                    return `(${recv} == null || ${key} == null || !${recv}.containsKey(${key}) ? null : ${recv}.get(${key}))`;
                }
                if (LIST_STRING.test (rt) && counter (key)) {
                    return `(${recv} == null || ${key} < 0 || ${key} >= ${recv}.size() ? null : ${recv}.get(${key}))`;
                }
                return whole;
            });
            if (next !== line) { lines[i] = next; changed = true; }
        }
    }
    return changed ? lines.join ('\n') : content;
}

// hx4 J29: snippet checks for the WsOrderBook / List<String> container pass (`--audit-string-types --self-test`)
function j29ContainersSelfTest (): string[] {
    const problems: string[] = [];
    const cls = (sig: string, body: string) => `public class Gemini extends GeminiRest\n{\n    public void m(${sig})\n    {\n${body}\n    }\n}`;
    const cases: [string, string, string, string | undefined][] = [
        [ 'book literal put', 'Object client', '        io.github.ccxt.ws.WsOrderBook orderbook = this.orderbook(null);\n        Helpers.addElementToObject(orderbook, "cache", new ArrayList<Object>(Arrays.asList()));', '        orderbook.put("cache", new ArrayList<Object>(Arrays.asList()));' ],
        [ 'book String put', 'Object client', '        io.github.ccxt.ws.WsOrderBook orderbook = this.orderbook(null);\n        String side = "bids";\n        Helpers.addElementToObject(orderbook, side, x);', '        orderbook.put(side, x);' ],
        [ 'book String read', 'Object client', '        io.github.ccxt.ws.WsOrderBook orderbook = this.orderbook(null);\n        String side = "bids";\n        Object b = Helpers.GetValue(orderbook, side);', '(orderbook == null || side == null || !orderbook.containsKey(side) ? null : orderbook.get(side))' ],
        [ 'List<String> counter read', 'Object client', '        List<String> keys = this.sort(raw);\n        for (var i = 0; i < keys.size(); i++)\n        {\n            Object key = Helpers.GetValue(keys, i);\n        }', '(keys == null || i < 0 || i >= keys.size() ? null : keys.get(i))' ],
        [ 'counted book put', 'Object client', '        io.github.ccxt.ws.WsOrderBook.CountedOrderBook ob = this.countedOrderBook(null);\n        Helpers.addElementToObject(ob, "symbol", symbol);', '        ob.put("symbol", symbol);' ],
        // negatives: Object receiver, Object key, mixed declarations, Object index, value-position put
        [ 'Object receiver', 'Object orderbook', '        Helpers.addElementToObject(orderbook, "cache", x);', undefined ],
        [ 'Object key', 'Object side', '        io.github.ccxt.ws.WsOrderBook orderbook = this.orderbook(null);\n        Object b = Helpers.GetValue(orderbook, side);\n        Helpers.addElementToObject(orderbook, side, b);', undefined ],
        [ 'mixed declarations', 'Object client', '        io.github.ccxt.ws.WsOrderBook orderbook = this.orderbook(null);\n        Runnable r = () -> { Object orderbook = null; };\n        Helpers.addElementToObject(orderbook, "cache", x);', undefined ],
        [ 'Object index', 'Object i', '        List<String> keys = this.sort(raw);\n        Object key = Helpers.GetValue(keys, i);', undefined ],
        [ 'List<Object> left to J03', 'Object client', '        List<String> keys = this.sort(raw);\n        Object key = Helpers.GetValue(keys, 0);', undefined ],
    ];
    for (const [ name, sig, body, expect ] of cases) {
        const input = cls (sig, body);
        const out = nativeJavaJ29Containers (input);
        const ok = expect === undefined ? out === input : out.includes (expect);
        if (!ok) problems.push (`hx4 J29 containers: ${name}\n${out}`);
    }
    return problems;
}

// hx4 J30
// Object/var locals whose every write proves one box: String / Long (`this.sum` of Long-or-int operands) /
// List<String> retype so J22 drops toStringArg / toLongOrNull / toStringListArg; Boolean- and Integer-proven
// locals turn isTrue / isEqual(x, intLiteral) into Boolean.TRUE.equals / Objects.equals.
function j30BaseReturnTypes (): Record<string, string> {
    const s = 'String', l = 'Long';
    return {
        safeString: s, safeString2: s, safeStringN: s, safeStringUpper: s, safeStringUpper2: s, safeStringLower: s,
        safeStringLower2: s, symbol: s, marketId: s, safeSymbol: s, safeCurrencyCode: s, findTimeframe: s,
        numberToString: s, iso8601: s, uuid: s, networkIdToCode: s,
        safeInteger: l, safeInteger2: l, safeIntegerN: l, safeTimestamp: l, safeTimestamp2: l, parseToInt: l,
        milliseconds: l, seconds: l, nonce: l, safeIntegerProduct: l,
        marketSymbols: 'List<String>',
    };
}

function j30Member (member: string, content: string): string {
    if (!/Helpers\.(?:toStringArg|toLongOrNull|toStringListArg|isTrue|isEqual)\(/.test (member)) return member;
    const header = member.slice (0, member.indexOf ('\n') === -1 ? member.length : member.indexOf ('\n'));
    const declTypes = new Map<string, string[]> ();
    const declRe = /(?:^|[\s(,])((?:final )?[\w.]+(?:<[\w.<>, ?]*>)?) ([A-Za-z_]\w*)(?=\s*(?:=(?!=)|[,);:]))/g;
    for (const m of member.matchAll (declRe)) {
        const t = m[1].replace (/^final /, '');
        if ([ 'return', 'new', 'else', 'case', 'throw', 'instanceof' ].includes (t)) continue;
        const list = declTypes.get (m[2]) ?? [];
        list.push (t);
        declTypes.set (m[2], list);
    }
    const lambdaShadow = (n: string) => new RegExp (`(?:\\(|, )${n}\\) ->|(?<![\\w.])${n} ->`).test (member);
    const isParam = (n: string) => new RegExp (`[(,] ?(?:final )?[\\w.<>, ?]+ ${n}[,)]`).test (header);
    const declaredAs = (n: string, re: RegExp) => {
        const t = declTypes.get (n);
        return t !== undefined && t.length === 1 && re.test (t[0]) && !lambdaShadow (n);
    };
    // a base method name answers its table type only when this class declares no other return type for it
    const baseTypes = j30BaseReturnTypes ();
    const callType = (name: string): string | undefined => {
        const t = baseTypes[name];
        if (t === undefined) return undefined;
        const other = new RegExp (`^    (?:public|protected|private) (?!${t.replace (/[<>]/g, '\\$&')} )[\\w.<>, ?]+ ${name}\\(`, 'm');
        return other.test (content) ? undefined : t;
    };
    const candidates = new Set<string> ();
    for (const [ n, t ] of declTypes) {
        if (t.length === 1 && (t[0] === 'Object' || t[0] === 'var') && !isParam (n) && !lambdaShadow (n)
            && new RegExp (`(?:^|[\\s;{])(?:Object|var) ${n}(?: = |;)`, 'm').test (member)) candidates.add (n);
    }
    const writes = new Map<string, string[]> ();
    const castsOf = new Map<string, string[]> ();
    for (const n of candidates) {
        const list: string[] = [];
        let ok = true;
        for (const m of member.matchAll (new RegExp (`(?<![\\w.])${n}\\s*(=(?!=)|\\+=|-=|\\+\\+|--)`, 'g'))) {
            if (m[1] !== '=') { ok = false; break; }
            const start = m.index + m[0].length;
            const end = j26StatementEnd (member, start);
            if (end === -1) { ok = false; break; }
            list.push (member.slice (start, end));
        }
        const casts = [ ...member.matchAll (new RegExp (`\\(([\\w.<>, ?]+)\\)\\s*\\(?\\s*${n}(?![\\w(])`, 'g')) ].map ((c) => c[1]);
        // overload-sensitive uses: Helpers.add(String, ..) / omitZero(String) bind other overloads
        if (new RegExp (`(?<![\\w.])${n} instanceof |Helpers\\.add\\([^;]*(?<![\\w.])${n}(?![\\w(])|omitZero\\(${n}\\)`).test (member)) ok = false;
        if (ok && list.length > 0) { writes.set (n, list); castsOf.set (n, casts); } else candidates.delete (n);
    }
    const INT_LIT = /^-?\d+$/;
    type Kind = 'String' | 'Long' | 'List<String>' | 'Boolean' | 'Integer';
    const proves = (kind: Kind, e: string, assumed: Set<string>, depth = 0): boolean => {
        e = j26Strip (e);
        if (e === 'null') return true;
        if (/^[A-Za-z_]\w*$/.test (e)) {
            if (assumed.has (e)) return true;
            if (kind === 'String') return declaredAs (e, /^String$/);
            if (kind === 'Long') return declaredAs (e, /^Long$/);
            if (kind === 'List<String>') return declaredAs (e, /^(?:java\.util\.)?List<String>$/);
            if (kind === 'Boolean') return e === 'true' || e === 'false' || declaredAs (e, /^(?:Boolean|boolean)$/);
            return false;
        }
        const t = j26Ternary (e);
        if (t !== undefined) return depth < 4 && proves (kind, t[1], assumed, depth + 1) && proves (kind, t[2], assumed, depth + 1);
        if (kind === 'String' && /^"(?:[^"\\]|\\.)*"$/.test (e)) return true;
        if (kind === 'Integer') return INT_LIT.test (e) || (/\.size\(\)$/.test (e) && /^\(\(\(?(?:java\.util\.)?List<\?>\)\s*[A-Za-z_]\w*\)\)?\.size\(\)$|^[A-Za-z_]\w*\.size\(\)$/.test (e));
        if (kind === 'Boolean') {
            if (/^java\.util\.Objects\.equals\(|^Boolean\.TRUE\.equals\(|^Helpers\.isEqual\(/.test (e) && j26Close (e, e.indexOf ('(')) === e.length - 1) return true;
            if (e.startsWith ('!') && !e.startsWith ('!=')) return true;
            const sb = /^this\.safeBool\(/.exec (e);
            if (sb !== null && j26Close (e, sb[0].length - 1) === e.length - 1 && callType ('safeBool') === undefined) {
                const args = j26Args (e, sb[0].length - 1) ?? [];
                return args.length === 3 && /^(?:true|false|null|\(Object\) null)$/.test (args[2]);
            }
            return false;
        }
        const call = /^this\.(\w+)\(/.exec (e);
        if (call === null || j26Close (e, call[0].length - 1) !== e.length - 1) return false;
        if (kind === 'Long' && call[1] === 'sum') {
            const args = j26Args (e, call[0].length - 1) ?? [];
            return args.length === 2 && args.every ((a) => INT_LIT.test (j26Strip (a)) || (depth < 4 && proves ('Long', a, assumed, depth + 1)));
        }
        return callType (call[1]) === kind;
    };
    const kindOf: Record<string, Kind> = { toStringArg: 'String', toLongOrNull: 'Long', toStringListArg: 'List<String>' };
    const castOk: Record<string, RegExp> = {
        'String': /^String$/, 'Long': /^Long$/, 'List<String>': /^(?:java\.util\.)?List<(?:\?|String)>$/,
    };
    const edits: { at: number, end: number, text: string }[] = [];
    const retyped = new Set<string> ();
    for (const helper of Object.keys (kindOf)) {
        const kind = kindOf[helper];
        const assumed = new Set ([ ...candidates ].filter ((n) => !retyped.has (n) && (castsOf.get (n) ?? []).every ((c) => castOk[kind].test (c))));
        for (let changed = true; changed;) {
            changed = false;
            for (const n of [ ...assumed ]) if (!(writes.get (n) ?? []).every ((w) => proves (kind, w, assumed))) { assumed.delete (n); changed = true; }
        }
        const wanted = new Set<string> ();
        const visit = (n: string) => {
            if (wanted.has (n) || !assumed.has (n)) return;
            wanted.add (n);
            for (const w of writes.get (n) ?? []) for (const m of w.matchAll (/[A-Za-z_]\w*/g)) visit (m[0]);
        };
        for (const m of member.matchAll (new RegExp (`Helpers\\.${helper}\\(([A-Za-z_]\\w*)\\)`, 'g'))) visit (m[1]);
        for (const n of wanted) {
            const decl = new RegExp (`(^|[\\s;{])(Object|var) ${n}(?= = |;)`, 'm').exec (member);
            if (decl === null) continue;
            const at = decl.index + decl[1].length;
            edits.push ({ at, end: at + decl[2].length, text: kind === 'List<String>' ? 'java.util.List<String>' : kind });
            retyped.add (n);
            // a Long-proven `this.sum(..)` write is an Object-typed call: checkcast the known Long box
            if (kind === 'Long') {
                for (const m of member.matchAll (new RegExp (`(?<![\\w.])${n}\\s*=\\s*(?=this\\.sum\\()`, 'g'))) {
                    const p = m.index + m[0].length;
                    edits.push ({ at: p, end: p, text: '(Long) ' });
                }
            }
        }
    }
    edits.sort ((a, b) => b.at - a.at);
    let out = member;
    for (const e of edits) out = out.slice (0, e.at) + e.text + out.slice (e.end);
    // isTrue / isEqual on proven (not retyped) Object locals and declared boxes
    const bAssumed = new Set ([ ...candidates ].filter ((n) => !retyped.has (n)));
    const iAssumed = new Set (bAssumed);
    for (let changed = true; changed;) {
        changed = false;
        for (const n of [ ...bAssumed ]) if (!(writes.get (n) ?? []).every ((w) => proves ('Boolean', w, bAssumed))) { bAssumed.delete (n); changed = true; }
    }
    for (let changed = true; changed;) {
        changed = false;
        for (const n of [ ...iAssumed ]) if (!(writes.get (n) ?? []).every ((w) => proves ('Integer', w, iAssumed))) { iAssumed.delete (n); changed = true; }
    }
    out = out.replace (/Helpers\.isTrue\(([A-Za-z_]\w*)\)/g, (all, n) => (bAssumed.has (n) || declaredAs (n, /^Boolean$/)) ? `Boolean.TRUE.equals(${n})` : all);
    out = out.replace (/Helpers\.isEqual\(([A-Za-z_]\w*), (-?\d+)\)/g, (all, n, lit) => {
        if (iAssumed.has (n) || declaredAs (n, /^Integer$/)) return `java.util.Objects.equals(${n}, ${lit})`;
        if (declaredAs (n, /^Long$/)) return `(${n} != null && ${n} == ${lit}L)`;
        if (declaredAs (n, /^(?:long|int)$/)) return `(${n} == ${lit})`;
        return all;
    });
    out = out.replace (/Helpers\.isEqual\(([A-Za-z_]\w*), ([A-Za-z_]\w*)\)/g, (all, a, b) => {
        for (const re of [ /^Long$/, /^Integer$/, /^String$/ ]) if (declaredAs (a, re) && declaredAs (b, re)) return `java.util.Objects.equals(${a}, ${b})`;
        return all;
    });
    return out;
}

export function nativeJavaJ30CoreArgs (content: string): string {
    if (!/Helpers\.(?:toStringArg|toLongOrNull|toStringListArg|isTrue|isEqual)\(/.test (content)) return content;
    const lines = content.split ('\n');
    const starts: number[] = [];
    for (let i = 0; i < lines.length; i++) if (/^    (?:public|private|protected)\b/.test (lines[i])) starts.push (i);
    if (starts.length === 0) return content;
    starts.push (lines.length);
    const parts: string[] = [ lines.slice (0, starts[0]).join ('\n') ];
    for (let s = 0; s + 1 < starts.length; s++) parts.push (j30Member (lines.slice (starts[s], starts[s + 1]).join ('\n'), content));
    return nativeJavaJ22CoreArgs (parts.join ('\n'));
}

// hx4 J30: snippet checks (`--audit-string-types --self-test`)
function j30SelfTest (): string[] {
    const problems: string[] = [];
    const cls = (body: string) => `public class Woo extends WooApi\n{\n    public Object m(Map<String, Object> parameters, Object p, Long n)\n    {\n${body}\n    }\n}`;
    const cases: [string, string, string | undefined][] = [
        [ 'sum Long', '        Object id;\n        synchronized (this) {\n        id = this.sum(this.safeInteger(this.options, "requestId", 0), 1);\n        }\n        return Helpers.toLongOrNull(id);',
            'Long id;\n        synchronized (this) {\n        id = (Long) this.sum(this.safeInteger(this.options, "requestId", 0), 1);\n        }\n        return id;' ],
        [ 'String ternary', '        Object s = (p == null) ? this.safeString(p, "a") : "x";\n        return this.f(Helpers.toStringArg(s));', 'String s = (p == null) ? this.safeString(p, "a") : "x";\n        return this.f(s);' ],
        [ 'marketSymbols', '        Object l = this.marketSymbols(p, (Object) null, true, false, false);\n        return this.f(Helpers.toStringListArg(l));', 'java.util.List<String> l = this.marketSymbols(' ],
        [ 'Boolean isTrue', '        Object b = (p == null) ? true : !Boolean.TRUE.equals(p);\n        if (Helpers.isTrue(b)) {}', 'if (Boolean.TRUE.equals(b))' ],
        [ 'Integer isEqual', '        Object c = null;\n        c = ((List<?>)p).size();\n        if (Helpers.isEqual(c, 1)) {}', 'if (java.util.Objects.equals(c, 1))' ],
        [ 'Long param isEqual', '        if (Helpers.isEqual(n, 0)) {}', 'if ((n != null && n == 0L))' ],
        // negatives: Object param, literal Long write, Helpers.add use, other write
        [ 'Object param', '        return this.f(Helpers.toStringArg(p));', undefined ],
        [ 'int literal long', '        Object x = 500;\n        return this.f(Helpers.toLongOrNull(x));', undefined ],
        [ 'add overload', '        Object s = "a";\n        Object t = Helpers.add(s, p);\n        return this.f(Helpers.toStringArg(s));', undefined ],
        [ 'mixed write', '        Object s = "a";\n        s = this.safeValue(p, "x");\n        return this.f(Helpers.toStringArg(s));', undefined ],
        [ 'sum of Object', '        Object x = this.sum(p, 1);\n        return this.f(Helpers.toLongOrNull(x));', undefined ],
        [ 'Integer vs Long write', '        Object c = this.sum(n, 1);\n        if (Helpers.isEqual(c, 1)) {}', undefined ],
    ];
    for (const [ name, body, expect ] of cases) {
        const out = nativeJavaJ30CoreArgs (cls (body));
        const ok = expect === undefined ? out === nativeJavaJ22CoreArgs (cls (body)) : out.includes (expect);
        if (!ok) problems.push (`hx4 J30: ${name}\n${out}`);
    }
    return problems;
}

// hx4 J31: snippet checks for multiply/subtract over Long/Integer/integral-Object locals (`--audit-string-types --self-test`)
function j31ArithmeticSelfTest (): string[] {
    const problems: string[] = [];
    const member = (body: string) => `    public Object m(Object o, Long since, Long limit, String s)\n    {\n        int duration = 60;\n${body}\n    }\n`;
    const cases: [string, string, string | undefined][] = [
        // positives: string-literal ternary, safeInteger default, integral Object local, Generic.sum of integral args
        [ 'string ternary', '        Long maxLimit = (((java.util.Objects.equals(o, "x")))) ? 1999L : 1000L;\n        Long v = (((java.util.Objects.equals(limit, null)))) ? maxLimit : Math.min(limit, maxLimit);\n        Object d = Helpers.multiply((Helpers.subtract(v, 1)), duration);', 'Object d = ((v - 1L) * duration);' ],
        [ 'safeInteger default', '        Long f = this.safeInteger(o, "k", 1);\n        Long n = this.seconds();\n        Object st = Helpers.subtract(n, Helpers.multiply(f, 60));', 'Object st = (n - (f * 60L));' ],
        [ 'integral object local', '        Object r = (((java.util.Objects.equals(limit, null)))) ? 93 : limit;\n        Object e = this.sum(since, Helpers.multiply(r, 1000));', '((((Number) r).longValue()) * 1000L)' ],
        [ 'integral sum', '        Object r = (((java.util.Objects.equals(limit, null)))) ? 93 : limit;\n        Object e = Helpers.subtract(this.sum(since, Helpers.multiply(r, 1000)), 1);', '((((Number) (this.sum(since, ' ],
        // negatives: nullable safeInteger, a double-valued write, a non-literal default, double multiply
        [ 'nullable safeInteger', '        Long f = this.safeInteger(o, "k");\n        Object st = Helpers.multiply(f, 60);', undefined ],
        [ 'double write', '        Object r = (((java.util.Objects.equals(limit, null)))) ? 1.5 : limit;\n        Object e = Helpers.multiply(r, 2);', undefined ],
        [ 'object default', '        Long f = this.safeInteger(o, "k", o);\n        Object st = Helpers.multiply(f, 60);', undefined ],
        [ 'unknown object write', '        Object r = limit;\n        r = o;\n        Object e = Helpers.multiply(r, 2);', undefined ],
    ];
    for (const [ name, body, expect ] of cases) {
        const out = nativeJavaJ31Arithmetic (member (body));
        const ok = expect === undefined ? out === member (body) : out.includes (expect);
        if (!ok) { problems.push (`hx4 J31 arithmetic: ${name}\n${out}`); }
    }
    return problems;
}

// hx4 J32: snippet checks for native divide / mod / opNeg (`--audit-string-types --self-test`)
function j32DivModNegSelfTest (): string[] {
    const problems: string[] = [];
    const member = (body: string) => `    public Object m(Long since, Object p, Double d)\n    {\n${body}\n    }\n`;
    const cases: [string, string, string | undefined][] = [
        [ 'long param divide', '        Long s = this.parseToInt(Helpers.divide(since, 1000));', '(since == null ? null : ((double) since) / ((double) 1000))' ],
        [ 'object number mod', '        Object lev = Helpers.parseInt(p);\n        Object r = this.f(Helpers.mod(1000, lev));', '(lev == null ? null : ((double) 1000) % ((Number) lev).doubleValue())' ],
        [ 'sum divide', '        Object r = this.f(Helpers.divide(this.sum(since, 1), 2));', '(((Number) this.sum(since, 1)).doubleValue() / ((double) 2))' ],
        [ 'opNeg box', '        Object r = this.f(Helpers.opNeg(d));', '(d == null ? null : -d)' ],
        [ 'ternary arm opNeg', '        Object r = (since == null) ? Helpers.opNeg(since) : since;', '((Object) (since == null ? null : -since))' ],
        // negatives: Object param, unproven Object local, operator operand, statement position
        [ 'object param', '        Object r = this.f(Helpers.divide(p, 1000));', undefined ],
        [ 'object local', '        Object x = this.safeValue(p, "a");\n        Object r = this.f(Helpers.divide(x, 1000));', undefined ],
        [ 'operator operand', '        Object r = this.f(Helpers.divide(since, 1000) + 1);', undefined ],
        [ 'opNeg on object', '        Object r = this.f(Helpers.opNeg(p));', undefined ],
    ];
    for (const [ name, body, expect ] of cases) {
        const out = nativeJavaJ32DivModNeg (member (body));
        const ok = expect === undefined ? out === member (body) : out.includes (expect);
        if (!ok) { problems.push (`hx4 J32: ${name}\n${out}`); }
    }
    const overridden = `    public Object sum(Object a, Object b)\n    {\n        return a;\n    }\n${member ('        Object r = this.f(Helpers.divide(this.sum(since, 1), 2));')}`;
    if (nativeJavaJ32DivModNeg (overridden) !== overridden) problems.push ('hx4 J32: an overridden sum keeps the helper');
    return problems;
}

// hx4 J33
// ordered compares / mathMin / mathMax whose operands are Number-proven: Object/var locals whose every write is a number
// literal, null, this.sum / milliseconds / parseToInt / safeInteger.. (base, not redeclared), a declared numeric, native
// arithmetic, a Number-proven local or a ternary of those. Compares keep the helper's null/NaN table (j28Native).
function j33NumericCalls (): Record<string, boolean> {
    // name -> may return null
    return {
        sum: false, milliseconds: false, seconds: false, parseTimeframe: false, parseToInt: true,
        safeInteger: true, safeInteger2: true, safeIntegerN: true, safeTimestamp: true, safeTimestamp2: true,
        safeNumber: true, safeNumber2: true, safeNumberN: true,
    };
}

function j33Member (member: string, content: string, fields: Set<string>): string {
    if (!/Helpers\.(?:is(?:Greater|Less)Than(?:OrEqual)?|mathM(?:in|ax))\(/.test (member)) return member;
    const header = member.slice (0, member.indexOf ('\n') === -1 ? member.length : member.indexOf ('\n'));
    const declTypes = new Map<string, string[]> ();
    const declRe = /(?:^|[\s(,])((?:final )?[\w.]+(?:<[\w.<>, ?]*>)?) ([A-Za-z_]\w*)(?=\s*(?:=(?!=)|[,);:]))/g;
    for (const m of member.matchAll (declRe)) {
        const t = m[1].replace (/^final /, '');
        if ([ 'return', 'new', 'else', 'case', 'throw', 'instanceof' ].includes (t)) continue;
        declTypes.set (m[2], [ ...(declTypes.get (m[2]) ?? []), t ]);
    }
    const lambdaShadow = (n: string) => new RegExp (`(?:\\(|, )${n}\\) ->|(?<![\\w.])${n} ->`).test (member);
    const isParam = (n: string) => new RegExp (`[(,] ?(?:final )?[\\w.<>, ?]+ ${n}[,)]`).test (header);
    const calls = j33NumericCalls ();
    const callNullable = (name: string): boolean | undefined => {
        if (!(name in calls)) return undefined;
        const decls = [ ...content.matchAll (new RegExp (`^    (?:public|protected|private)(?: static)? ([\\w.<>, ?]+) ${name}\\(`, 'gm')) ];
        if (decls.length > 0 && (name === 'sum' || decls.some ((d) => !/^(?:Long|Double|long|int|double)$/.test (d[1])))) return undefined;
        return calls[name];
    };
    const candidates = new Set<string> ();
    const writes = new Map<string, string[]> ();
    for (const [ n, t ] of declTypes) {
        if (t.length !== 1 || t[0] !== 'Object' || fields.has (n) || isParam (n) || lambdaShadow (n)) continue;
        if ([ ...member.matchAll (new RegExp (`(?:^|[\\s;{(])Object ${n} = `, 'gm')) ].length !== 1) continue;
        if (new RegExp (`(?:\\+\\+|--)${n}(?![\\w(])|(?<![\\w.])${n} instanceof `).test (member)) continue;
        const list: string[] = [];
        let ok = true;
        for (const m of member.matchAll (new RegExp (`(?<![\\w.])${n}\\s*(=(?!=)|[-+*/%]=|\\+\\+|--)`, 'g'))) {
            if (m[1] !== '=') { ok = false; break; }
            const start = m.index + m[0].length;
            const end = j26StatementEnd (member, start);
            if (end === -1) { ok = false; break; }
            list.push (member.slice (start, end));
        }
        if (ok && list.length > 0) { candidates.add (n); writes.set (n, list); }
    }
    // undefined = unproven; true = Number or null; false = non-null Number
    const state = new Map<string, boolean> ();
    for (const n of candidates) state.set (n, false);
    const prove = (e: string, depth = 0): boolean | undefined => {
        e = j26Strip (e);
        if (depth > 6) return undefined;
        if (e === 'null' || e === '(Object) null') return true;
        if (/^-?\d{1,15}L?$/.test (e) || /^-?\d{1,15}\.\d{1,15}$/.test (e)) return false;
        if (/^[A-Za-z_$][\w$]*$/.test (e)) {
            if (state.has (e)) return state.get (e);
            const t = h2kJ10DeclaredType (member, e, fields);
            return t === undefined ? undefined : t.boxed;
        }
        const tern = j26Ternary (e);
        if (tern !== undefined) {
            const a = prove (tern[1], depth + 1), b = prove (tern[2], depth + 1);
            return a === undefined || b === undefined ? undefined : a || b;
        }
        const call = /^this\.(\w+)\(/.exec (e);
        if (call !== null && j26Close (e, call[0].length - 1) === e.length - 1) return callNullable (call[1]);
        const h = /^(?:Helpers\.(?:add|subtract|multiply|mathMin|mathMax)|java\.util\.Objects\.requireNonNullElse)\(/.exec (e);
        if (h !== null && j26Close (e, h[0].length - 1) === e.length - 1) {
            const args = j26Args (e, h[0].length - 1) ?? [];
            if (args.length !== 2) return undefined;
            const ps = args.map ((a) => prove (a, depth + 1));
            if (ps.some ((p) => p === undefined)) return undefined;
            // requireNonNullElse(a, null) throws on a null a
            if (h[0].startsWith ('java')) return ps[1] === true ? undefined : false;
            return ps[0] || ps[1];
        }
        const prim = j19Operand (e, member, fields, content);
        return prim === undefined ? undefined : prim.boxed;
    };
    for (let changed = true; changed;) {
        changed = false;
        for (const n of [ ...state.keys () ]) {
            const ps = (writes.get (n) ?? []).map ((w) => prove (w));
            const next = ps.some ((p) => p === undefined) ? undefined : ps.some ((p) => p === true);
            if (next === undefined) { state.delete (n); changed = true; } else if (next !== state.get (n)) { state.set (n, next); changed = true; }
        }
    }
    const sumOverridden = callNullable ('sum') === undefined;
    // a compare operand: text usable in a primitive comparison + the name to null-check
    const operand = (text: string): { text: string, nullName?: string, pure: boolean, num: string } | undefined => {
        const inner = h2kJ10StripParens (text);
        if (/^-?\d{1,15}L?$/.test (inner) || /^-?\d{1,15}\.\d{1,15}$/.test (inner)) return { text: inner, pure: true, num: `((double) ${inner})` };
        if (/^[A-Za-z_$][\w$]*$/.test (inner)) {
            if (state.has (inner)) return { text: `((Number) ${inner}).doubleValue()`, nullName: state.get (inner) ? inner : undefined, pure: true, num: `((Number) ${inner}).doubleValue()` };
            const t = h2kJ10DeclaredType (member, inner, fields);
            if (t === undefined) return undefined;
            return { text: inner, nullName: t.boxed ? inner : undefined, pure: true, num: t.boxed ? `((Number) ${inner}).doubleValue()` : `((double) ${inner})` };
        }
        const sum = /^this\.sum\(/.exec (inner);
        if (sum !== null && !sumOverridden && j26Close (inner, sum[0].length - 1) === inner.length - 1) return { text: `((Number) ${inner}).doubleValue()`, pure: false, num: '' };
        const prim = j19Operand (inner, member, fields, content);
        if (prim === undefined || prim.boxed) return undefined;
        const pure = !/[\w$]\s*\(/.test (inner.replace (/\((?:long|int|double)\)/g, ''));
        return { text: prim.text, pure, num: `((double) ${prim.text})` };
    };
    const re = /Helpers\.(isGreaterThanOrEqual|isGreaterThan|isLessThanOrEqual|isLessThan|mathMin|mathMax)\(/g;
    const lines = member.split ('\n');
    for (let k = 1; k < lines.length; k++) {
        const trimmed = lines[k].trim ();
        if (trimmed.startsWith ('//') || trimmed.startsWith ('*')) continue;
        let line = lines[k], again = true;
        while (again) {
            again = false;
            re.lastIndex = 0;
            let m;
            while ((m = re.exec (line)) !== null) {
                const split = h2kJ10SplitArgs (line, m.index + m[0].length);
                if (split === undefined || split.args.length !== 2) continue;
                const l = operand (split.args[0]), r = operand (split.args[1]);
                if (l === undefined || r === undefined) continue;
                let native: string;
                if (m[1].startsWith ('math')) {
                    // helper: null if either is null, else the ORIGINAL box of the toDouble-smaller (larger) side
                    if (!l.pure || !r.pure) continue;
                    const a = h2kJ10StripParens (split.args[0]), b = h2kJ10StripParens (split.args[1]);
                    const pick = `(${l.num} ${m[1] === 'mathMin' ? '<' : '>'} ${r.num} ? (Object) (${a}) : (Object) (${b}))`;
                    const nulls = [ l.nullName, r.nullName ].filter ((x) => x !== undefined).map ((x) => `${x} == null`);
                    native = nulls.length === 0 ? pick : `(${nulls.join (' || ')} ? null : ${pick})`;
                } else {
                    native = j28Native (m[1], l, r);
                }
                line = line.slice (0, m.index) + native + line.slice (split.end + 1);
                again = true;
                break;
            }
        }
        lines[k] = line;
    }
    return lines.join ('\n');
}

export function nativeJavaJ33Compare (content: string): string {
    if (!/Helpers\.(?:is(?:Greater|Less)Than(?:OrEqual)?|mathM(?:in|ax))\(/.test (content)) return content;
    const lines = content.split ('\n');
    const fields = new Set<string> ();
    for (const line of lines) {
        const f = line.match (/^    (?:(?:public|private|protected|static|final|volatile|transient) )*[\w.][\w.<>, ?\[\]]* ([A-Za-z_$][\w$]*)\s*(?:=|;)/);
        if (f !== null) fields.add (f[1]);
    }
    const starts: number[] = [];
    for (let i = 0; i < lines.length; i++) if (/^    (?:public|private|protected)\b.*\(/.test (lines[i])) starts.push (i);
    if (starts.length === 0) return content;
    starts.push (lines.length);
    const parts: string[] = [ lines.slice (0, starts[0]).join ('\n') ];
    for (let s = 0; s + 1 < starts.length; s++) parts.push (j33Member (lines.slice (starts[s], starts[s + 1]).join ('\n'), content, fields));
    return parts.join ('\n');
}

// hx4 J33: snippet checks (`--audit-string-types --self-test`)
function j33SelfTest (): string[] {
    const problems: string[] = [];
    const cls = (body: string) => `public class Woo extends WooApi\n{\n    public Object m(Object since, Object limit, Long n, Double d)\n    {\n${body}\n    }\n}`;
    const cases: [string, string, string | undefined][] = [
        [ 'sum local gt', '        Object e = this.sum(since, 5);\n        if (Helpers.isGreaterThan(e, n)) {}', 'if (((n == null || ((Number) e).doubleValue() > n))) {}' ],
        [ 'size local lt', '        Object c = ((List<?>)limit).size();\n        for (var i = 0; Helpers.isLessThan(i, c); i++) {}', '(!(i >= ((Number) c).doubleValue()))' ],
        [ 'nullable lt', '        Object e = this.parseToInt(since);\n        if (Helpers.isLessThan(e, 0)) {}', '(e == null || (!(((Number) e).doubleValue() >= 0)))' ],
        [ 'ternary ge', '        Object a = (since == null) ? 100 : this.sum(since, 1);\n        if (Helpers.isGreaterThanOrEqual(a, 3)) {}', '(((Number) a).doubleValue() >= 3)' ],
        [ 'mathMin box', '        Object e = this.sum(since, 5);\n        Object r = Helpers.mathMin(e, 1000);', 'Object r = (((Number) e).doubleValue() < ((double) 1000) ? (Object) (e) : (Object) (1000));' ],
        [ 'mathMax nullable', '        Object x = Helpers.mathMax(n, 5L);', 'Object x = (n == null ? null : (((Number) n).doubleValue() > ((double) 5L) ? (Object) (n) : (Object) (5L)));' ],
        [ 'Double pair ge', '        Double y = 1.0;\n        boolean b = Helpers.isGreaterThanOrEqual(d, y);', '((d == null && y == null) || d != null && (y == null || d >= y))' ],
        // negatives: Object param, mixed write, compound write, impure mathMin operand, String local
        [ 'param', '        if (Helpers.isGreaterThan(since, 1)) {}', undefined ],
        [ 'mixed write', '        Object e = this.sum(since, 5);\n        e = this.safeString(limit, \"x\");\n        if (Helpers.isGreaterThan(e, 1)) {}', undefined ],
        [ 'compound', '        Object e = this.sum(since, 5);\n        e += 1;\n        if (Helpers.isGreaterThan(e, 1)) {}', undefined ],
        [ 'impure min', '        Object x = Helpers.mathMin(this.sum(since, 1), 5);', undefined ],
        [ 'string local', '        Object s = \"a\";\n        if (Helpers.isLessThan(s, \"b\")) {}', undefined ],
        [ 'sum override', '        Object e = this.sum(since, 5);\n        if (Helpers.isGreaterThan(e, 1)) {}\n    }\n    public Object sum(Object a, Object b)\n    {\n        return a;', undefined ],
    ];
    for (const [ name, body, expect ] of cases) {
        const out = nativeJavaJ33Compare (cls (body));
        const ok = expect === undefined ? out === cls (body) : out.includes (expect);
        if (!ok) problems.push (`hx4 J33: ${name}\n${out}`);
    }
    return problems;
}

// hx11w8 requestid-sandbox: every write to this.urls in the file is the base ctor deepExtend read or an omit() result (never a ConcurrentHashMap)
function hx11w8UrlsPlainMap (content: string): boolean {
    for (const m of content.matchAll (/\bthis\.urls\s*=(?!=)\s*([^;]*);/g)) {
        const rhs = m[1].trim ();
        if (rhs === 'newUrls') {
            if (!/Map<String, Object> newUrls = this\.omit\(this\.urls, /.test (content)) return false;
        } else if (!/^\(Map<String, Object>\) this\.safeValue\(extendedProperties, "urls"\)$/.test (rhs)) return false;
    }
    return !/\bConcurrentHashMap<[^>]*>\s*\([^)]*\)[^;]*\burls\b/.test (content);
}

// hx11 w8 addPaginationCursorToResult: the cursor is written into a list element and the element stored back at its own index
// (TS `first[k] = cursor; data[0] = first`). Inside the `cursor != null` / `size > 0` guards both helper calls are plain Map.put / List.set.
export function hx11w8PaginationCursorPuts (content: string): string {
    if (!/\baddPaginationCursorToResult\(/.test (content)) return content;
    const lines = content.split ('\n');
    let changed = false;
    for (let from = 0; from < lines.length; from++) {
        if (!/^    public [^=;]* addPaginationCursorToResult\(/.test (lines[from])) continue;
        let to = from + 1;
        while (to < lines.length && !/^    (?:public|private|protected)\b/.test (lines[to])) to++;
        const member = lines.slice (from, to).join ('\n');
        const data = /\b(?:List<Object>|java\.util\.List<Object>|Object) (data)\b/.exec (member)?.[1];
        const lenMatch = /Integer (\w+) = \(\(List<\?>\)data\)\.size\(\);/.exec (member);
        if (data === undefined || lenMatch === null) continue;
        const len = lenMatch[1];
        if ((member.match (/\bInteger \w+ = /g) ?? []).length !== 1 || !new RegExp (`${len} != null && ${len} > 0`).test (member)) continue;
        if (new RegExp (`(?<![\\w.])data\\s*=(?!=)`).test (member.replace (/(?:List<Object>|Object) data = /g, ''))) continue;
        const dataIsList = new RegExp (`List<Object> data\\b`).test (member);
        const listRef = dataIsList ? 'data' : '((List<Object>) data)';
        const idxOk = (idx: string) => idx === '0' || idx === `(((long) ${len}) - 1L)`;
        const stringGuarded = (v: string, at: number) => new RegExp (`String ${v} = [^\\n]*;`).test (member)
            && (member.match (new RegExp (`(?<![\\w.])${v}\\s*=(?!=)`, 'g')) ?? []).length === 1
            && lines.slice (from, at).some ((l) => l.includes (`!java.util.Objects.equals(${v}, null)`));
        for (let i = from; i < to; i++) {
            const line = lines[i];
            const put = /^(\s*)Helpers\.addElementToObject\((\w+), ("\w+"), (\w+)\);$/.exec (line);
            if (put !== null) {
                const [ , ind, recv, key, v ] = put;
                const elem = new RegExp (`^\\s*Object ${recv} = \\(data == null \\|\\| .*\\? null : .*data\\)?\\.get\\(.*\\)\\);$`);
                const readBack = lines.slice (i + 1, to).some ((l) => new RegExp (`^\\s*Helpers\\.addElementToObject\\(data, (.+), ${recv}\\);$`).exec (l) !== null);
                if (lines.slice (from, i).filter ((l) => elem.test (l)).length === 1 && readBack
                    && (member.match (new RegExp (`\\b\\w+(?:<[^>]*>)? ${recv} = `, 'g')) ?? []).length === 1 && stringGuarded (v, i)) {
                    lines[i] = `${ind}((Map<String, Object>)${recv}).put(${key}, ${v});`;
                    changed = true;
                }
                continue;
            }
            const set = /^(\s*)Helpers\.addElementToObject\(data, (0|\(\(\(long\) \w+\) - 1L\)), (\w+)\);$/.exec (line);
            if (set !== null && idxOk (set[2]) && lines.slice (from, i).some ((l) => new RegExp (`\\b${len} != null && ${len} > 0`).test (l))) {
                lines[i] = `${set[1]}${listRef}.set(${set[2] === '0' ? '0' : `(int) ${set[2]}`}, ${set[3]});`;
                changed = true;
            }
        }
    }
    return changed ? lines.join ('\n') : content;
}

export function hx11w8PaginationCursorSelfTest (): string[] {
    const problems: string[] = [];
    const cls = (sig: string, body: string) => `public class X\n{\n    public List<Object> addPaginationCursorToResult(${sig})\n    {\n${body}\n        return data;\n    }\n}\n`;
    const guard = '        Integer dataLength = ((List<?>)data).size();\n        if (!java.util.Objects.equals(cursor, null) && (dataLength != null && dataLength > 0))\n        {\n';
    const first = '            Object first = (data == null || 0 >= ((List<?>)data).size() ? null : ((List<?>)data).get(0));\n';
    const cases: [string, string, string, string | undefined][] = [
        [ 'elem put and set', 'Map<String, Object> r', '        String cursor = this.safeString(r, "c");\n        List<Object> data = (List<Object>) this.safeList(r, "d", new ArrayList<Object>(Arrays.asList()));\n' + guard + first + '            Helpers.addElementToObject(first, "k", cursor);\n            Helpers.addElementToObject(data, 0, first);\n        }', '((Map<String, Object>)first).put("k", cursor);\n            data.set(0, first);' ],
        [ 'Object data last', 'String cursor, Object data', guard.replace ('Integer dataLength', 'Integer dataLength') + '            Helpers.addElementToObject(data, (((long) dataLength) - 1L), data);\n        }', '((List<Object>) data).set((int) (((long) dataLength) - 1L), data);' ],
        [ 'unguarded cursor keeps helper', 'Map<String, Object> r', '        String cursor = this.safeString(r, "c");\n        List<Object> data = (List<Object>) this.safeList(r, "d", new ArrayList<Object>(Arrays.asList()));\n        Integer dataLength = ((List<?>)data).size();\n        if (dataLength != null && dataLength > 0)\n        {\n' + first + '            Helpers.addElementToObject(first, "k", cursor);\n            Helpers.addElementToObject(data, 0, first);\n        }', 'data.set(0, first)' ],
    ];
    for (const [ name, sig, body, expect ] of cases) {
        const input = cls (sig, body);
        const out = hx11w8PaginationCursorPuts (input);
        const ok = name === 'unguarded cursor keeps helper'
            ? out.includes ('Helpers.addElementToObject(first, "k", cursor)') && out.includes ('data.set(0, first)')
            : out.includes (expect!);
        if (!ok) problems.push (`hx11w8 pagination ${name}\n${out}`);
    }
    return problems;
}

// hx4 J34
// Helpers.addElementToObject / GetValue / inOp / objectKeys on locals declared once per member as Map<String, Object>.
// put keeps the helper's ConcurrentHashMap null-remove semantics: a nullable value needs a provably fresh (non-concurrent) map.
export function nativeJavaJ34MapLocals (content: string): string {
    if (!/Helpers\.(?:addElementToObject|GetValue|inOp|objectKeys)\(/.test (content)) return content;
    const MAP = /^(?:java\.util\.)?(?:Map|HashMap|LinkedHashMap)<String, Object>$/;
    const lines = content.split ('\n');
    const starts: number[] = [];
    for (let i = 0; i < lines.length; i++) if (/^    (?:public|private|protected)\b/.test (lines[i])) starts.push (i);
    starts.push (lines.length);
    let changed = false;
    for (let s = 0; s + 1 < starts.length; s++) {
        const from = starts[s];
        const to = starts[s + 1];
        // hx11w8 super-parsetrade-parsed-put: `Object x = super.parseTrade(..)` (base returns the Trade view, a Map) written once becomes a Map local
        for (let i = from; i < to; i++) {
            const decl = /^(\s*)Object ([A-Za-z_]\w*) = (super\.(?:parseTrade|parseWsTrade|parseOrder|parseWsOrder)\()(.*)\);(\s*\/\/.*)?$/.exec (lines[i]);
            if (decl === null || j26Close (decl[3] + decl[4] + ')', decl[3].length - 1) !== decl[3].length + decl[4].length) continue;
            const name = decl[2];
            // the only write is the declaration; no lambda parameter or instanceof test of the same name
            const body = lines.slice (from, to).filter ((l, k) => from + k !== i && !/^\s*(?:\/\/|\*|\/\*)/.test (l)).join ('\n');
            if (new RegExp (`(?<![\\w.])${name}\\s*(?:=(?!=)|\\+=|\\+\\+|--)|(?<![\\w.])${name} instanceof |(?<![\\w.])${name} ->|, ${name}\\) ->`).test (body)) continue;
            lines[i] = `${decl[1]}Map<String, Object> ${name} = ${decl[3]}${decl[4]});${decl[5] ?? ''}`;
            changed = true;
        }
        const member = lines.slice (from, to).filter ((l) => !/^\s*(?:\/\/|\*|\/\*)/.test (l)).join ('\n');
        if (!/Helpers\.(?:addElementToObject|GetValue|inOp|objectKeys)\(/.test (member)) continue;
        const sig = lines[from];
        const typeCache = new Map<string, string | undefined> ();
        const declaredType = (name: string): string | undefined => {
            if (typeCache.has (name)) return typeCache.get (name);
            const re = new RegExp (`(?:^|[\\s(,])((?:final )?[\\w.]+(?:<[\\w.?]+(?:<[\\w.?, ]*>)?(?:, [\\w.?]+(?:<[\\w.?, ]*>)?)*>)?) ${name}(?=\\s*(?:=(?!=)|[,);:]))`, 'g');
            const types = new Set<string> ();
            for (const m of member.matchAll (re)) {
                const t = m[1].replace (/^final /, '');
                if ([ 'return', 'new', 'else', 'case', 'throw', 'instanceof' ].includes (t)) continue;
                types.add (t);
            }
            const shadowed = new RegExp (`(?:\\(|, )${name}\\) ->|(?<![\\w.])${name} ->`).test (member);
            const out = !shadowed && types.size === 1 ? [ ...types ][0] : undefined;
            typeCache.set (name, out);
            return out;
        };
        const isMap = (n: string) => MAP.test (declaredType (n) ?? '');
        const isParam = (n: string) => new RegExp (`[(,]\\s*[\\w.<>, ?]+ ${n}\\s*[,)]`).test (sig.replace (/\{.*$/, ''));
        // every write is a fresh HashMap / LinkedHashMap built by a base producer (never a ConcurrentHashMap)
        const freshCache = new Map<string, boolean> ();
        const fresh = (n: string): boolean => {
            if (freshCache.has (n)) return freshCache.get (n)!;
            let ok = !isParam (n);
            let writes = 0;
            for (const m of member.matchAll (new RegExp (`(?<![\\w.])${n}\\s*(=(?!=)|\\+=|\\+\\+|--)`, 'g'))) {
                if (m[1] !== '=') { ok = false; break; }
                const start = m.index! + m[0].length;
                const end = j26StatementEnd (member, start);
                if (end === -1) { ok = false; break; }
                const rhs = j26Strip (member.slice (start, end).replace (/^\s*\((?:java\.util\.)?Map<String, Object>\)\s*/, ''));
                writes++;
                const call = /^this\.(extend|keysort|account)\(/.exec (rhs);
                // parseOrder/parseTrade (+ws) return the typed view (Order/Trade) over a safeOrder/safeTrade payload; TypedMap.put is a plain
                // raw.put on that LinkedHashMap/HashMap (safeTrade already puts natively into it), never a ConcurrentHashMap, so the helper's null-remove arm cannot fire.
                // Balances stays excluded: safeBalance(this.balance) wraps the shared ConcurrentHashMap
                const typedCall = /^(?:this|super)\.(parseOrder|parseWsOrder|parseTrade|parseWsTrade|safeMarketStructure)\(/.exec (rhs); // hx11w8 baseexchange-map-writes: MarketInterface view over a fresh deepExtend LinkedHashMap
                const typedView = typedCall !== null && j26Close (rhs, typedCall[0].length - 1) === rhs.length - 1
                    && !new RegExp (`public (?!(?:io\\.github\\.ccxt\\.types\\.)?(?:${typedCall[1] === 'safeMarketStructure' ? 'MarketInterface' : 'Order|Trade'})\\b)[\\w.<>, ?]+ ${typedCall[1]}\\(`).test (content);
                const isFresh = /^new (?:java\.util\.)?(?:Linked)?HashMap<String, Object>\(\) \{\{/.test (rhs)
                    || /^Helpers\.newMap\(/.test (rhs)
                    || typedView
                    || (call !== null && j26Close (rhs, call[0].length - 1) === rhs.length - 1
                        && (call[1] !== 'extend' || (j26Args (rhs, call[0].length - 1) ?? []).length === 2));
                if (!isFresh) { ok = false; break; }
            }
            // a lambda/anonymous class may write it; any non-Map cast or instanceof may change meaning
            if (new RegExp (`(?<![\\w.])${n} instanceof `).test (member)) ok = false;
            freshCache.set (n, ok && writes > 0);
            return ok && writes > 0;
        };
        const nonNull = (v: string): boolean => {
            v = j26Strip (v);
            return /^(?:"(?:[^"\\]|\\.)*"|-?\d+(?:\.\d+)?[LD]?|true|false)$/.test (v)
                || /^new [\w.]+(?:<[\w.<>, ?]*>)?\(/.test (v);
        };
        const stringKey = (k: string) => /^"(?:[^"\\]|\\.)*"$/.test (k);
        for (let i = from; i < to; i++) {
            const line = lines[i];
            if (/^\s*(?:\/\/|\*)/.test (line)) continue;
            let next = line;
            next = next.replace (/^(\s*)Helpers\.addElementToObject\(([A-Za-z_]\w*), ("(?:[^"\\]|\\.)*"|[A-Za-z_]\w*), (.*)\);(\s*\/\/.*)?$/, (whole, ind, recv, key, value, tail) => {
                if (!isMap (recv)) return whole;
                const args = j26Args (`(${key}, ${value})`, 0);
                if (args === undefined || args.length !== 2) return whole;
                if (!(fresh (recv) || nonNull (value))) return whole;
                if (stringKey (key) || declaredType (key) === 'String') return `${ind}${recv}.put(${key}, ${value});${tail ?? ''}`;
                // any other key: the helper's raw Map<Object, Object> put, on a fresh local only
                if (!fresh (recv)) return whole;
                return `${ind}((java.util.Map<Object, Object>) (java.util.Map<?, ?>) ${recv}).put(${key}, ${value});${tail ?? ''}`;
            });
            // BaseExchange Map fields: a value that is never null skips the ConcurrentHashMap null-remove branch
            next = next.replace (/^(\s*)Helpers\.addElementToObject\((this\.(?:balance|tickers|orderbooks|urls|has|features)), (.*)\);(\s*\/\/.*)?$/, (whole, ind, recv, rest, tail) => {
                const args = j26Args (`(${rest})`, 0);
                if (args === undefined || args.length !== 2) return whole;
                const [ key, value ] = args.map ((a) => a.trim ());
                const v = j26Strip (value);
                const call = v.match (/^this\.(extend|safeBalance|orderBook)\(/);
                const closed = call !== null && j26Close (v, call[0].length - 1) === v.length - 1;
                const twoArgExtend = call === null || call[1] !== 'extend' || (j26Args (v, call[0].length - 1) ?? []).length === 2;
                // hx11w8 requestid-sandbox: this.urls is only ever a HashMap/LinkedHashMap (deepExtend / omit), so a null value is a plain put
                const plainUrls = recv === 'this.urls' && (stringKey (key) || declaredType (key) === 'String') && hx11w8UrlsPlainMap (content);
                if (!(nonNull (value) || (closed && twoArgExtend) || plainUrls)) return whole;
                if (!stringKey (key) && !/^[A-Za-z_]\w*$/.test (key)) return whole;
                if (stringKey (key) || declaredType (key) === 'String') return `${ind}${recv}.put(${key}, ${value});${tail ?? ''}`;
                return `${ind}((java.util.Map<Object, Object>) (java.util.Map<?, ?>) ${recv}).put(${key}, ${value});${tail ?? ''}`;
            });
            next = next.replace (/Helpers\.GetValue\(([A-Za-z_]\w*), ("(?:[^"\\]|\\.)*"|[A-Za-z_]\w*)\)/g, (whole, recv, key) => {
                if (!isMap (recv)) return whole;
                if (stringKey (key)) return `(${recv} == null ? null : ${recv}.get(${key}))`;
                if (declaredType (key) === 'String') return `(${recv} == null || ${key} == null ? null : ${recv}.get(${key}))`;
                return whole;
            });
            next = next.replace (/Helpers\.inOp\(([A-Za-z_]\w*), ("(?:[^"\\]|\\.)*"|[A-Za-z_]\w*)\)/g, (whole, recv, key) => {
                if (!isMap (recv)) return whole;
                if (stringKey (key)) return `(${recv} != null && ${recv}.containsKey(${key}))`;
                if (declaredType (key) === 'String') return `(${recv} != null && ${key} != null && ${recv}.containsKey(${key}))`;
                return whole;
            });
            // objectKeys snapshots under the map's monitor: only an unshared fresh local skips it
            next = next.replace (/Helpers\.objectKeys\(([A-Za-z_]\w*)\)/g, (whole, recv) => {
                if (!isMap (recv) || !fresh (recv)) return whole;
                return `(${recv} == null ? new java.util.ArrayList<Object>() : new java.util.ArrayList<Object>(${recv}.keySet()))`;
            });
            if (next !== line) { lines[i] = next; changed = true; }
        }
    }
    return changed ? lines.join ('\n') : content;
}

// hx4 J34: snippet checks for the Map-local put/get/in/keys pass (`--audit-string-types --self-test`)
function j34MapLocalsSelfTest (): string[] {
    const problems: string[] = [];
    const cls = (sig: string, body: string) => `public class Gemini extends GeminiRest\n{\n    public Object m(${sig})\n    {\n${body}\n    }\n}`;
    const cases: [string, string, string, string | undefined][] = [
        [ 'fresh literal put', 'Object v', '        Map<String, Object> r = new HashMap<String, Object>() {{}};\n        Helpers.addElementToObject(r, "a", v);', '        r.put("a", v);' ],
        [ 'fresh Object-key put', 'Object k, Object v', '        Map<String, Object> r = new HashMap<String, Object>() {{}};\n        Helpers.addElementToObject(r, k, v);', '((java.util.Map<Object, Object>) (java.util.Map<?, ?>) r).put(k, v);' ],
        [ 'extend put', 'Object p, Object v', '        Map<String, Object> r = this.extend(new HashMap<String, Object>() {{}}, p);\n        Helpers.addElementToObject(r, "a", v);', '        r.put("a", v);' ],
        [ 'non-null value on any Map', 'Map<String, Object> p', '        Helpers.addElementToObject(p, "a", "x");', '        p.put("a", "x");' ],
        [ 'literal read', 'Map<String, Object> p', '        return Helpers.GetValue(p, "a");', '(p == null ? null : p.get("a"))' ],
        [ 'String-key read', 'Map<String, Object> p, String k', '        return Helpers.GetValue(p, k);', '(p == null || k == null ? null : p.get(k))' ],
        [ 'inOp', 'Map<String, Object> p', '        return Helpers.inOp(p, "a");', '(p != null && p.containsKey("a"))' ],
        [ 'fresh keys', 'Object v', '        Map<String, Object> r = new HashMap<String, Object>() {{}};\n        return Helpers.objectKeys(r);', 'new java.util.ArrayList<Object>(r.keySet())' ],
        [ 'field put extend', 'Object r, Object k', '        Helpers.addElementToObject(this.balance, \"spot\", this.extend(r, this.safeDict(this.balance, \"spot\", new HashMap<String, Object>() {{}})));', '        this.balance.put(\"spot\", this.extend(' ],
        [ 'field put Object key', 'Object k', '        Helpers.addElementToObject(this.orderbooks, k, this.orderBook(new HashMap<String, Object>() {{}}, 5));', '(java.util.Map<?, ?>) this.orderbooks).put(k, this.orderBook(' ],
        [ 'field put String key', 'String k', '        Helpers.addElementToObject(this.balance, k, this.safeBalance(null));', '        this.balance.put(k, this.safeBalance(null));' ],
        [ 'urls nullable value', 'Object v', '        Helpers.addElementToObject(this.urls, "apiBackup", v);', '        this.urls.put(' ],
        [ 'urls foreign assignment keeps helper', 'Object v', '        this.urls = (Map<String, Object>) v;\n        Helpers.addElementToObject(this.urls, "apiBackup", v);', undefined ],
        [ 'urls Object key keeps helper', 'Object k, Object v', '        Helpers.addElementToObject(this.urls, k, v);', undefined ],
        [ 'field nullable value', 'Object v', '        Helpers.addElementToObject(this.balance, \"info\", v);', undefined ],
        [ 'field options', 'Object v', '        Helpers.addElementToObject(this.options, \"a\", \"x\");', undefined ],
        [ 'field extend of 3', 'Object p, Object q', '        Helpers.addElementToObject(this.balance, \"a\", this.extend(p, q, p));', undefined ],
        // negatives: nullable value on a possibly concurrent map, Object receiver, Object key read, shared map keys, mixed decls, 3-arg extend
        [ 'nullable on param map', 'Map<String, Object> p, Object v', '        Helpers.addElementToObject(p, "a", v);', undefined ],
        [ 'nullable on safeDict map', 'Object o, Object v', '        Map<String, Object> r = (Map<String, Object>) this.safeDict(o, "x");\n        Helpers.addElementToObject(r, "a", v);', undefined ],
        [ 'Object receiver', 'Object p', '        Helpers.addElementToObject(p, "a", "x");\n        return Helpers.GetValue(p, "a");', undefined ],
        [ 'Object key read', 'Map<String, Object> p, Object k', '        return Helpers.GetValue(p, k);', undefined ],
        [ 'param keys', 'Map<String, Object> p', '        return Helpers.objectKeys(p);', undefined ],
        [ 'reassigned from safeDict', 'Object o, Object v', '        Map<String, Object> r = new HashMap<String, Object>() {{}};\n        r = (Map<String, Object>) this.safeDict(o, "x");\n        Helpers.addElementToObject(r, "a", v);', undefined ],
        [ 'typed order view put', 'Object v', '        Map<String, Object> o = (Map<String, Object>) this.parseOrder(v, null);\n        Helpers.addElementToObject(o, \"type\", v);', '        o.put(\"type\", v);' ],
        [ 'typed trade view put', 'Object v', '        Map<String, Object> t = this.parseWsTrade((Map<String, Object>) (v), null);\n        Helpers.addElementToObject(t, \"datetime\", v);', '        t.put(\"datetime\", v);' ],
        [ 'market structure view put', 'Object v', '        Map<String, Object> m = (Map<String, Object>) this.safeMarketStructure(v);\n        Helpers.addElementToObject(m, "baseId", v);', '        m.put("baseId", v);' ],
        [ 'market structure venue override keeps helper', 'Object v', '        Map<String, Object> m = (Map<String, Object>) this.safeMarketStructure(v);\n        Helpers.addElementToObject(m, "baseId", v);\n        return m;\n    }\n    public Object safeMarketStructure(Object x)\n    {\n        return x;', undefined ],
        [ 'typed balance view keeps helper', 'Object v', '        Map<String, Object> b = (Map<String, Object>) this.parseBalance(v);\n        Helpers.addElementToObject(b, \"timestamp\", v);', undefined ],
        [ 'order view reassigned from safeDict', 'Object v', '        Map<String, Object> o = (Map<String, Object>) this.parseOrder(v, null);\n        o = (Map<String, Object>) this.safeDict(v, \"x\");\n        Helpers.addElementToObject(o, \"type\", v);', undefined ],
        [ 'order view venue override returns Object', 'Object v', '        Map<String, Object> o = (Map<String, Object>) this.parseOrder(v, null);\n        Helpers.addElementToObject(o, \"type\", v);\n        return o;\n    }\n    public Object parseOrder(Object order, Map<String, Object> market)\n    {\n        return order;', undefined ],
        [ 'super parseTrade local put', 'Object t, Object v', '        Object p = super.parseTrade((Object) (t), (Map<String, Object>) null);\n        Helpers.addElementToObject(p, \"side\", v);', '        Map<String, Object> p = super.parseTrade((Object) (t), (Map<String, Object>) null);\n        p.put(\"side\", v);' ],
        [ 'super parseTrade local reassigned keeps helper', 'Object t, Object v', '        Object p = super.parseTrade((Object) (t), (Map<String, Object>) null);\n        p = v;\n        Helpers.addElementToObject(p, \"side\", v);', undefined ],
        [ 'extend of 3', 'Object p, Object q, Object v', '        Map<String, Object> r = (Map<String, Object>) this.extend(p, q, new HashMap<String, Object>() {{}});\n        Helpers.addElementToObject(r, "a", v);', undefined ],
    ];
    for (const [ name, sig, body, expect ] of cases) {
        const input = cls (sig, body);
        const out = nativeJavaJ34MapLocals (input);
        const ok = expect === undefined ? out === input : out.includes (expect);
        if (!ok) problems.push (`hx4 J34 map locals: ${name}\n${out}`);
    }
    return problems;
}

// hx4 J35
// Native forms for the remaining core-arg / isEqual / isTrue sites: J26+J30 re-run with `//` comments masked,
// isEqual on two integral-proven operands, isTrue on Java-boolean expressions, toMapArg on outcome() Map locals.
function j35SplitComment (line: string): [string, string] {
    for (let k = 0; k < line.length; k++) {
        const c = line[k];
        if (c === '"' || c === '\'') { for (k++; k < line.length && line[k] !== c; k++) if (line[k] === '\\') k++; continue; }
        if (c === '/' && line[k + 1] === '/') return [ line.slice (0, k), line.slice (k) ];
    }
    return [ line, '' ];
}

function j35MaskedRerun (content: string): string {
    const lines = content.split ('\n');
    const split = lines.map (j35SplitComment);
    if (split.every ((s) => s[1] === '')) return content;
    const masked = split.map ((s) => s[0]).join ('\n');
    const out = nativeJavaJ30CoreArgs (nativeJavaJ26MapLocals (masked));
    if (out === masked) return content;
    const outLines = out.split ('\n');
    if (outLines.length !== lines.length) return content;
    return outLines.map ((l, i) => l + split[i][1]).join ('\n');
}

// Java expressions that are boolean by construction (`!x`, `&&`, `||`, `==`, `!=`, instanceof, boolean helpers)
function j35JavaBoolean (e: string): boolean {
    e = j26Strip (e);
    if (/^(?:Helpers\.isEqual|Helpers\.isArray|java\.util\.Objects\.equals|Boolean\.TRUE\.equals)\(/.test (e)) return j26Close (e, e.indexOf ('(')) === e.length - 1;
    let depth = 0, top = false;
    for (let k = 0; k < e.length; k++) {
        const c = e[k];
        if (c === '"') { for (k++; k < e.length && e[k] !== '"'; k++) if (e[k] === '\\') k++; continue; }
        if (c === '(' || c === '[' || c === '{') depth++;
        else if (c === ')' || c === ']' || c === '}') depth--;
        else if (depth === 0) {
            if (c === '?' || (c === '=' && e[k + 1] !== '=' && !'=!<>'.includes (e[k - 1]))) return false;
            if (e.startsWith ('&&', k) || e.startsWith ('||', k) || e.startsWith (' == ', k - 1) || e.startsWith (' != ', k - 1) || e.startsWith (' instanceof ', k)) top = true;
        }
    }
    return top || (e.startsWith ('!') && !e.startsWith ('!='));
}

function j35BooleanIsTrue (content: string): string {
    if (!content.includes ('Helpers.isTrue(')) return content;
    let out = content;
    for (let changed = true; changed;) {
        changed = false;
        const at = [ ...out.matchAll (/Helpers\.isTrue\(/g) ].map ((m) => m.index).reverse ();
        for (const i of at) {
            const open = i + 'Helpers.isTrue'.length;
            const close = j26Close (out, open);
            if (close === -1) continue;
            const inner = out.slice (open + 1, close);
            if (!j35JavaBoolean (inner)) continue;
            out = out.slice (0, i) + '(' + inner + ')' + out.slice (close + 1);
            changed = true;
        }
    }
    return out;
}

function j35Member (member: string, content: string): string {
    if (!/Helpers\.(?:isEqual|toMapArg)\(/.test (member)) return member;
    const declTypes = new Map<string, string[]> ();
    const declRe = /(?:^|[\s(,])((?:final )?[\w.]+(?:<[\w.<>, ?]*>)?) ([A-Za-z_]\w*)(?=\s*(?:=(?!=)|[,);:]))/g;
    for (const m of member.matchAll (declRe)) {
        const t = m[1].replace (/^final /, '');
        if ([ 'return', 'new', 'else', 'case', 'throw', 'instanceof' ].includes (t)) continue;
        const list = declTypes.get (m[2]) ?? [];
        list.push (t);
        declTypes.set (m[2], list);
    }
    const header = member.slice (0, member.indexOf ('\n') === -1 ? member.length : member.indexOf ('\n'));
    const lambdaShadow = (n: string) => new RegExp (`(?:\\(|, )${n}\\) ->|(?<![\\w.])${n} ->`).test (member);
    const isParam = (n: string) => new RegExp (`[(,] ?(?:final )?[\\w.<>, ?]+ ${n}[,)]`).test (header);
    const single = (n: string) => { const t = declTypes.get (n); return t !== undefined && t.length === 1 && !lambdaShadow (n) ? t[0] : undefined; };
    const writeOps = (n: string) => [ ...member.matchAll (new RegExp (`(?<![\\w.])${n}\\s*(=(?!=)|\\+=|-=|\\+\\+|--)`, 'g')) ];
    const writesOf = (n: string): string[] | undefined => {
        const list: string[] = [];
        for (const m of writeOps (n)) {
            if (m[1] !== '=') return undefined;
            const start = m.index + m[0].length;
            const end = j26StatementEnd (member, start);
            if (end === -1) return undefined;
            list.push (member.slice (start, end));
        }
        return list;
    };
    const candidate = (n: string) => single (n) === 'Object' && !isParam (n)
        && new RegExp (`(?:^|[\\s;{])Object ${n}(?: = |;)`, 'm').test (member)
        && !new RegExp (`(?<![\\w.])${n} instanceof |Helpers\\.add\\([^;]*(?<![\\w.])${n}(?![\\w(])`).test (member);
    // `for (var i = <int>; ..; i++)` counters only ever hold an int
    const counter = (n: string) => single (n) === 'var' && new RegExp (`for \\(var ${n} = -?\\d+;`).test (member)
        && writeOps (n).every ((m, k) => (k === 0 && m[1] === '=') || m[1] === '++');
    const baseTypes = j30BaseReturnTypes ();
    const longCall = (name: string) => {
        if (baseTypes[name] !== 'Long') return false;
        return !new RegExp (`^    (?:public|protected|private) (?!Long )[\\w.<>, ?]+ ${name}\\(`, 'm').test (content);
    };
    const mapCall = (name: string) => (name === 'outcome' || name === 'loadOutcome')
        && !new RegExp (`^    (?:public|protected|private) [\\w.<>, ?]+ ${name}\\(`, 'm').test (content);
    // integral proof: 'p' primitive long/int, 'L' nullable Long, 'N' nullable Integer/Object, 'n' non-null Integer/Object
    type IK = 'p' | 'L' | 'N' | 'n';
    const INT = /^-?\d+$/;
    const intKind = new Map<string, IK> ();
    const objAssumed = new Set<string> ();
    const writesCache = new Map<string, string[]> ();
    for (const [ n ] of declTypes) {
        if (!candidate (n)) continue;
        const w = writesOf (n);
        if (w !== undefined && w.length > 0) { objAssumed.add (n); writesCache.set (n, w); }
    }
    const nameKind = (n: string): IK | undefined => {
        if (intKind.has (n)) return intKind.get (n);
        const t = single (n);
        if (t === 'Long') return 'L';
        if (t === 'Integer') return 'N';
        if (t === 'long' || t === 'int') return 'p';
        if (counter (n)) return 'p';
        return objAssumed.has (n) ? 'n' : undefined;
    };
    // undefined = not integral; true = may be null
    const exprNullable = (e: string, depth = 0): boolean | undefined => {
        e = j26Strip (e).replace (/^\(Object\)\s*/, '');
        e = j26Strip (e);
        if (e === 'null') return true;
        if (INT.test (e) || /^-?\d+L$/.test (e)) return false;
        if (/^[A-Za-z_]\w*$/.test (e)) { const k = nameKind (e); return k === undefined ? undefined : (k === 'L' || k === 'N'); }
        const t = j26Ternary (e);
        if (t !== undefined) {
            if (depth > 3) return undefined;
            const a = exprNullable (t[1], depth + 1), b = exprNullable (t[2], depth + 1);
            return a === undefined || b === undefined ? undefined : (a || b);
        }
        if (/^\(\(\(?(?:java\.util\.)?List<[\w?]+>\)\s*\(?[\w.]+\)\)?\.size\(\)$|^[A-Za-z_]\w*\.size\(\)$/.test (e)) return false;
        const arith = /^([A-Za-z_]\w*) [*+-] \d+L$/.exec (e);
        if (arith !== null) { const k = nameKind (arith[1]); return k === 'p' || k === 'L' ? false : undefined; }
        const h = /^Helpers\.(getArrayLength|parseInt)\(/.exec (e);
        if (h !== null && j26Close (e, h[0].length - 1) === e.length - 1) return h[1] === 'parseInt';
        const call = /^this\.(\w+)\(/.exec (e);
        if (call !== null && j26Close (e, call[0].length - 1) === e.length - 1 && longCall (call[1])) return true;
        return undefined;
    };
    for (let changed = true; changed;) {
        changed = false;
        for (const n of [ ...objAssumed ]) {
            const ks = writesCache.get (n)!.map ((w) => exprNullable (w));
            const k: IK | undefined = ks.some ((x) => x === undefined) ? undefined : ks.some ((x) => x) ? 'N' : 'n';
            if (k === undefined) { objAssumed.delete (n); intKind.delete (n); changed = true; }
            else if (intKind.get (n) !== k) { intKind.set (n, k); changed = true; }
        }
    }
    const operand = (raw: string): { prim: string, boxed: string } | undefined => {
        const e = j26Strip (raw);
        if (INT.test (e)) return { prim: `${e}L`, boxed: `${e}L` };
        // `Integer - 1L` unboxes to a primitive long (same NPE on null as the helper's argument)
        const sub = /^([A-Za-z_]\w*) - (\d+L)$/.exec (e);
        if (sub !== null && [ 'p', 'L', 'N' ].includes (nameKind (sub[1]) ?? '')) return { prim: `(${e})`, boxed: `(${e})` };
        if (!/^[A-Za-z_]\w*$/.test (e)) return undefined;
        const k = nameKind (e);
        if (k === 'p') return { prim: `((long) ${e})`, boxed: `((long) ${e})` };
        if (k === 'L') return { prim: '', boxed: e };
        if (k === 'n') return { prim: `((Number) ${e}).longValue()`, boxed: `((Number) ${e}).longValue()` };
        if (k === 'N') return { prim: '', boxed: `(${e} == null ? null : ((Number) ${e}).longValue())` };
        return undefined;
    };
    let out = member;
    if (out.includes ('Helpers.isEqual(')) {
        const at = [ ...out.matchAll (/Helpers\.isEqual\(/g) ].map ((m) => m.index).reverse ();
        for (const i of at) {
            const open = i + 'Helpers.isEqual'.length;
            const close = j26Close (out, open);
            const args = close === -1 ? undefined : j26Args (out, open);
            if (args === undefined || args.length !== 2) continue;
            const a = operand (args[0]), b = operand (args[1]);
            if (a === undefined || b === undefined) continue;
            const text = a.prim !== '' && b.prim !== '' ? `(${a.prim} == ${b.prim})` : `java.util.Objects.equals(${a.boxed}, ${b.boxed})`;
            out = out.slice (0, i) + text + out.slice (close + 1);
        }
        // this.rateLimit / this.rollingWindowSize are hand-written `double` fields: `==` matches the numeric compare
        out = out.replace (/Helpers\.isEqual\(this\.(rateLimit|rollingWindowSize), (-?\d+)\)/g, (all, f, lit) =>
            new RegExp (`^    (?:public |protected |private )?(?!double )[\\w.<>]+ ${f}\\b`, 'm').test (content) ? all : `(this.${f} == ${lit})`);
    }
    if (out.includes ('Helpers.toMapArg(')) {
        // Object locals written only from outcome()/loadOutcome().join() (Map<String, Object>) or null retype to Map
        const mapWrite = (w: string): boolean => {
            const e = j26Strip (w);
            if (e === 'null') return true;
            const c = /^this\.(\w+)\(/.exec (e);
            if (c !== null && j26Close (e, c[0].length - 1) === e.length - 1) return c[1] === 'outcome' && mapCall ('outcome');
            const j = /^\(this\.loadOutcome\(/.exec (e);
            return j !== null && mapCall ('loadOutcome') && e.endsWith (').join()') && j26Close (e, 0) === e.length - '.join()'.length - 1
                && j26Close (e, j[0].length - 1) === e.length - '.join()'.length - 2;
        };
        const retype = new Set<string> ();
        for (const m of out.matchAll (/Helpers\.toMapArg\(\(\(Object\)([A-Za-z_]\w*)\)\)|Helpers\.toMapArg\(([A-Za-z_]\w*)\)/g)) {
            const n = m[1] ?? m[2];
            if (!candidate (n)) continue;
            const w = writesOf (n);
            const casts = [ ...member.matchAll (new RegExp (`\\(([\\w.<>, ?]+)\\)\\s*\\(?\\s*${n}(?![\\w(])`, 'g')) ].map ((c) => c[1]);
            if (w !== undefined && w.length > 0 && w.every (mapWrite) && casts.every ((c) => /^(?:Object|(?:java\.util\.)?Map<(?:String, Object|\?, \?)>)$/.test (c))) retype.add (n);
        }
        for (const n of retype) out = out.replace (new RegExp (`(^|[\\s;{])Object ${n}(?= = |;)`, 'm'), `$1java.util.Map<String, Object> ${n}`);
        out = out.replace (/Helpers\.toMapArg\(\(\(Object\)([A-Za-z_]\w*)\)\)/g, (all, n) => {
            const t = retype.has (n) ? 'java.util.Map<String, Object>' : single (n);
            return t !== undefined && /^(?:java\.util\.)?Map<String, Object>$/.test (t) ? n : all;
        });
    }
    return out;
}

export function nativeJavaJ35 (content: string): string {
    let out = j35MaskedRerun (content);
    out = j35BooleanIsTrue (out);
    if (!/Helpers\.(?:isEqual|toMapArg)\(/.test (out)) return out;
    const lines = out.split ('\n');
    const starts: number[] = [];
    for (let i = 0; i < lines.length; i++) if (/^    (?:public|private|protected)\b/.test (lines[i])) starts.push (i);
    if (starts.length === 0) return out;
    starts.push (lines.length);
    const parts: string[] = [ lines.slice (0, starts[0]).join ('\n') ];
    for (let s = 0; s + 1 < starts.length; s++) parts.push (j35Member (lines.slice (starts[s], starts[s + 1]).join ('\n'), out));
    return nativeJavaJ22CoreArgs (parts.join ('\n'));
}

// hx4 J35: snippet checks (`--audit-string-types --self-test`)
function j35SelfTest (): string[] {
    const problems: string[] = [];
    const cls = (body: string) => `public class Woo extends WooApi\n{\n    public Object m(Map<String, Object> parameters, Object p, Long n, String outcome)\n    {\n${body}\n    }\n}`;
    const cases: [string, string, string | undefined][] = [
        [ 'comment masked', '        Object l = this.safeInteger(p, "limit", n); // limit=1000\n        return this.f(Helpers.toLongOrNull(l));', 'Long l = this.safeInteger(p, "limit", n); // limit=1000\n        return this.f(l);' ],
        [ 'size vs Long', '        Object c = ((List<?>)p).size();\n        if (Helpers.isEqual(c, n)) {}', 'java.util.Objects.equals(((Number) c).longValue(), n)' ],
        [ 'counter vs int', '        for (var i = 0; i < 3; i++)\n        {\n            if (Helpers.isEqual(i, 2)) {}\n        }', '(((long) i) == 2L)' ],
        [ 'ternary Object vs lit', '        Object t = (p == null) ? 0 : ((Object) this.parseToInt(p));\n        if (Helpers.isEqual(t, 0)) {}', 'java.util.Objects.equals((t == null ? null : ((Number) t).longValue()), 0L)' ],
        [ 'boolean isTrue', '        if (Helpers.isTrue((!Helpers.isEqual(p, null))) && Helpers.isTrue(((p instanceof java.util.Map)))) {}', 'if (((!Helpers.isEqual(p, null))) && (((p instanceof java.util.Map)))) {}' ],
        [ 'outcome Map', '        Object o = this.outcome((String) (outcome));\n        return this.g(Helpers.toMapArg(((Object)o)));', 'java.util.Map<String, Object> o = this.outcome((String) (outcome));\n        return this.g(o);' ],
        [ 'double field', '        if (Helpers.isEqual(this.rateLimit, -1)) {}', '(this.rateLimit == -1)' ],
        // negatives: Object param, safeNumber (Double) write, mixed outcome write, plain Object isTrue, ternary isTrue
        [ 'Object param', '        if (Helpers.isEqual(p, 1)) {}', undefined ],
        [ 'safeNumber write', '        Object x = this.safeNumber(p, "a");\n        if (Helpers.isEqual(x, 5)) {}', undefined ],
        [ 'mixed outcome', '        Object o = this.outcome((String) (outcome));\n        o = this.safeValue(p, "x");\n        return this.g(Helpers.toMapArg(((Object)o)));', undefined ],
        [ 'Object isTrue', '        if (Helpers.isTrue(p)) {}', undefined ],
        [ 'ternary isTrue', '        if (Helpers.isTrue(p == null ? n : p)) {}', undefined ],
    ];
    for (const [ name, body, expect ] of cases) {
        const out = nativeJavaJ35 (cls (body));
        const ok = expect === undefined ? out === cls (body) : out.includes (expect);
        if (!ok) problems.push (`hx4 J35: ${name}\n${out}`);
    }
    return problems;
}

// hx5 X13: J36 no longer inlines the helper body. A Helpers.multiply/subtract call becomes a plain native
// `(a * b)` / `(a - b)` only when both operands are proven non-null integral primitives (integer literal, a
// primitive `long`/`int` local or parameter of the enclosing member, an int-returning `.length()`/`.size()`/
// `this.precisionFromString(..)`/`this.parseTimeframe(..)`, or a product/difference this pass already proved).
// Long x Long is exactly the helper's Long branch; int is widened to long like the helper's Integer->Long step.
// Doubles stay on the helper (multiply re-boxes integral doubles to Long), as does every unproven operand.
function j36SplitArgs (inner: string): string[] | undefined {
    const parts: string[] = [];
    let depth = 0, quote = '', start = 0;
    for (let i = 0; i < inner.length; i++) {
        const ch = inner[i];
        if (quote) { if (ch === '\\') { i++; } else if (ch === quote) { quote = ''; } continue; }
        if (ch === '"' || ch === '\'') { quote = ch; continue; }
        if (ch === '(' || ch === '[' || ch === '{') depth++;
        else if (ch === ')' || ch === ']' || ch === '}') depth--;
        else if (ch === ',' && depth === 0) { parts.push (inner.slice (start, i).trim ()); start = i + 1; }
    }
    parts.push (inner.slice (start).trim ());
    return (depth === 0 && !quote && parts.length === 2 && parts.every ((p) => p.length > 0)) ? parts : undefined;
}

// hx5 X13
function j36Balanced (s: string): boolean {
    let depth = 0, quote = '';
    for (let i = 0; i < s.length; i++) {
        const ch = s[i];
        if (quote) { if (ch === '\\') { i++; } else if (ch === quote) { quote = ''; } continue; }
        if (ch === '"' || ch === '\'') { quote = ch; continue; }
        if (ch === '(') depth++; else if (ch === ')') { depth--; if (depth < 0) return false; }
    }
    return depth === 0 && !quote;
}

// hx5 X13: 'long' (already long), 'int' (needs widening) or undefined (unproven -> helper call)
function j36Integral (op: string, member: string, proven: Set<string>): 'long' | 'int' | undefined {
    const o = op.trim ();
    if (proven.has (o)) return 'long';
    if (/^-?\d{1,18}L?$/.test (o)) return 'long';
    const ident = /^[A-Za-z_]\w*$/.test (o) ? o : undefined;
    if (ident !== undefined) {
        const esc = ident.replace (/\$/g, '\\$');
        const decls = [ ...member.matchAll (new RegExp ('(?<![\\w.<>,?])([A-Za-z_][\\w.<>,? ]*?)\\s+' + esc + '\\s*(?=[=;,)])', 'g')) ]
            .map ((m) => m[1].trim ()).filter ((t) => !/^(?:return|new|case|throw|else)$/.test (t));
        if (decls.length !== 1) return undefined;
        if (decls[0] === 'long' || decls[0] === 'final long') return 'long';
        if (decls[0] === 'int' || decls[0] === 'final int') return 'int';
        return undefined;
    }
    const call = /^(?:[A-Za-z_]\w*(?:\.[A-Za-z_]\w*)*|\(\(String\)\s*[A-Za-z_]\w*\))\.(length|size)\(\)$/.exec (o);
    if (call !== null) {
        const recv = o.slice (0, o.length - call[1].length - 3).replace (/^\(\(String\)\s*|\)$/g, '');
        if (recv.startsWith ('this.')) return undefined;
        const esc = recv.replace (/\$/g, '\\$');
        // receiver must be a non-null String/List local: a single declaration initialised from a literal/constructor
        const ok = new RegExp ('(?:String|List<[^>]*>|ArrayList<[^>]*>)\\s+' + esc + '\\s*=\\s*(?:"|new\\s|\\()').test (member)
            && !new RegExp ('(?<![\\w.])' + esc + '\\s*=\\s*null\\b').test (member);
        return ok ? 'int' : undefined;
    }
    const m = /^this\.(precisionFromString|parseTimeframe)\(([\s\S]*)\)$/.exec (o);
    if (m !== null && j36Balanced (m[2])) return 'int';
    return undefined;
}

function j36Member (member: string): string {
    const re = /(?<![\w.])Helpers\.(multiply|subtract)\(/g;
    const proven = new Set<string> ();
    let out = member;
    let skipFrom = Infinity;
    for (;;) {
        const all = [ ...out.matchAll (re) ].filter ((m) => (m.index as number) < skipFrom);
        if (all.length === 0) break;
        const m = all[all.length - 1];
        const at = m.index as number;
        skipFrom = at;
        let depth = 1, quote = '', j = at + m[0].length;
        for (; j < out.length && depth > 0; j++) {
            const ch = out[j];
            if (quote) { if (ch === '\\') { j++; } else if (ch === quote) { quote = ''; } continue; }
            if (ch === '"' || ch === '\'') { quote = ch; continue; }
            if (ch === '(') depth++; else if (ch === ')') depth--;
        }
        if (depth !== 0) continue;
        const args = j36SplitArgs (out.slice (at + m[0].length, j - 1));
        if (args === undefined) continue;
        const ta = j36Integral (args[0], out, proven), tb = j36Integral (args[1], out, proven);
        if (ta === undefined || tb === undefined) continue;
        const lit = (x: string) => /^-?\d+$/.test (x) ? x + 'L' : x;
        const a = ta === 'int' ? `((long) ${args[0]})` : lit (args[0]);
        const b = tb === 'int' && ta === 'int' ? `((long) ${args[1]})` : lit (args[1]);
        const b2 = /^-/.test (b) ? `(${b})` : b;
        const native = `(${a} ${m[1] === 'multiply' ? '*' : '-'} ${b2})`;
        proven.add (native);
        out = out.slice (0, at) + native + out.slice (j);
    }
    return out;
}

function nativeJavaJ36MultiplySubtract (source: string): string {
    if (!/(?<![\w.])Helpers\.(?:multiply|subtract)\(/.test (source)) return source;
    const lines = source.split ('\n');
    const starts: number[] = [];
    for (let i = 0; i < lines.length; i++) if (/^    (?:public|private|protected)\b/.test (lines[i])) starts.push (i);
    if (starts.length === 0) return j36Member (source);
    starts.push (lines.length);
    const parts: string[] = [ lines.slice (0, starts[0]).join ('\n') ];
    for (let s = 0; s + 1 < starts.length; s++) parts.push (j36Member (lines.slice (starts[s], starts[s + 1]).join ('\n')));
    return parts.join ('\n');
}

// hx5 X13: snippet checks (`--audit-string-types --self-test`)
function j36SelfTest (): string[] {
    const problems: string[] = [];
    const cases: [string, string, (o: string) => boolean][] = [
        [ 'long local minus int call', 'long maxDecimals = 6; Object v = Helpers.subtract(maxDecimals, this.precisionFromString(this.safeString(m, "a")));', (o) => o.includes ('Object v = (maxDecimals - this.precisionFromString(this.safeString(m, "a")));') ],
        [ 'nested proven', 'int d = this.parseTimeframe(t); Object x = Helpers.subtract(Helpers.multiply(d, 1000), 1);', (o) => o.includes ('Object x = ((((long) d) * 1000L) - 1L);') ],
        [ 'negative literal', 'long s = 8; Object x = Helpers.multiply(s, -1);', (o) => o.includes ('(s * (-1L))') ],
        [ 'unproven nested', 'Object x = Helpers.subtract(Helpers.multiply(a, (b + 1)), 1);', (o) => o === 'Object x = Helpers.subtract(Helpers.multiply(a, (b + 1)), 1);' ],
        [ 'string arg comma', 'Object x = Helpers.multiply(f("a,b)"), 2);', (o) => o === 'Object x = Helpers.multiply(f("a,b)"), 2);' ],
        [ 'Long box stays helper', 'Long v = this.safeInteger(x, "k"); Object p = Helpers.subtract(v, 1);', (o) => o.includes ('Helpers.subtract(v, 1)') ],
        [ 'double stays helper', 'double d = 1.5; Object p = Helpers.multiply(d, 2);', (o) => o.includes ('Helpers.multiply(d, 2)') ],
        [ 'redeclared stays helper', 'long n = 1; Object n2 = null; Object p = Helpers.multiply(n, 2); Object n = 3;', (o) => o.includes ('Helpers.multiply(n, 2)') ],
        [ 'other helper kept', 'Object x = Helpers.add(a, b); Object y = MyHelpers.multiply(a, b);', (o) => o === 'Object x = Helpers.add(a, b); Object y = MyHelpers.multiply(a, b);' ],
        [ 'no lambda ever', 'Object x = Helpers.multiply(p, q);', (o) => !o.includes ('j36') && o === 'Object x = Helpers.multiply(p, q);' ],
    ];
    for (const [ name, src, ok ] of cases) {
        const out = nativeJavaJ36MultiplySubtract (src);
        if (!ok (out)) problems.push (`hx5 X13 J36: ${name}\n${out}`);
        if (nativeJavaJ36MultiplySubtract (out) !== out) problems.push (`hx5 X13 J36: ${name} not idempotent`);
    }
    return problems;
}

// hx4 J37: snippet checks (`--audit-string-types --self-test`)
function j37SelfTest (): string[] {
    const problems: string[] = [];
    const member = (body: string) => `    public Object m(Object p, Object d)\n    {\n${body}\n    }\n`;
    const cases: [string, string, string[]][] = [
        [ 'nested divide', '        Object r = this.f(Helpers.divide(Helpers.divide(d, 1000), 60));', [ '}).apply(((java.util.function.BinaryOperator<Object>)', '}).apply(d, 1000), 60))' ] ],
        [ 'mod guard', '        Object r = this.f(Helpers.mod(p, 1));', [ 'j37a instanceof String || j37a instanceof Long', ' % j37d.applyAsDouble(j37b); }).apply(p, 1))' ] ],
        [ 'opNeg box', '        Object r = this.g(Helpers.opNeg(p));', [ 'if (j37a instanceof Integer j37v) return -j37v;', '}).apply(p))' ] ],
        [ 'string arg kept', '        Object r = this.f(Helpers.divide(p, "a,b)"));', [ '}).apply(p, "a,b)"))' ] ],
    ];
    for (const [ name, body, expects ] of cases) {
        const out = nativeJavaJ37DivModNeg (member (body));
        if (/Helpers\.(?:divide|mod|opNeg)\(/.test (out) || !expects.every ((e) => out.includes (e))) problems.push (`hx4 J37: ${name}\n${out}`);
    }
    const other = member ('        Object r = this.f(MyHelpers.divide(p, 1));');
    if (nativeJavaJ37DivModNeg (other) !== other) problems.push ('hx4 J37: a foreign divide must stay');
    return problems;
}

// hx4 J38
// Every remaining Helpers.isGreaterThan/isLessThan/isGreaterThanOrEqual/isLessThanOrEqual/mathMin/mathMax
// call prints as an inline lambda that replays the helper's own dispatch (null, Integer->Long, isNumber, NaN, String, original box).
function j38Inline (helper: string, a: string, b: string): string {
    const num = 'java.util.function.Predicate<Object> j38n = j38o -> { if (j38o == null) return false; try { Double.parseDouble(String.valueOf(j38o)); return true; } catch (Exception j38x) { return false; } };';
    const dbl = 'java.util.function.ToDoubleFunction<Object> j38d = j38o -> { if (j38o instanceof Double || j38o instanceof Float || j38o instanceof Long || j38o instanceof Integer || j38o instanceof java.math.BigDecimal) return ((Number) j38o).doubleValue(); try { return Double.parseDouble(String.valueOf(j38o)); } catch (NumberFormatException j38x) { return 0.0; } };';
    if (helper === 'mathMin' || helper === 'mathMax') {
        return `((java.util.function.BinaryOperator<Object>) (j38a, j38b) -> { if (j38a == null || j38b == null) return null; ${dbl} double j38u = j38d.applyAsDouble(j38a); double j38v = j38d.applyAsDouble(j38b); return (j38u ${helper === 'mathMin' ? '<' : '>'} j38v) ? j38a : j38b; }).apply(${a}, ${b})`;
    }
    const gt = 'boolean j38g; if (j38a != null && j38b == null) j38g = true; else if (j38a == null || j38b == null) j38g = false; else { Object j38p = (j38a instanceof Integer) ? (Object) Long.valueOf(((Integer) j38a).longValue()) : j38a; Object j38q = (j38b instanceof Integer) ? (Object) Long.valueOf(((Integer) j38b).longValue()) : j38b; if (j38p instanceof Long && j38q instanceof Long) j38g = ((Long) j38p) > ((Long) j38q); else if (j38n.test(j38p) || j38n.test(j38q)) j38g = j38d.applyAsDouble(j38p) > j38d.applyAsDouble(j38q); else if (j38p instanceof String && j38q instanceof String) j38g = ((String) j38p).compareTo((String) j38q) > 0; else j38g = false; }';
    const eq = 'java.util.function.Predicate<Object> j38i = j38o -> { if (j38o instanceof Byte || j38o instanceof Short || j38o instanceof Integer || j38o instanceof Long || j38o instanceof java.util.concurrent.atomic.AtomicInteger || j38o instanceof java.util.concurrent.atomic.AtomicLong) return true; return (j38o instanceof Float || j38o instanceof Double || j38o instanceof java.math.BigDecimal) && new java.math.BigDecimal(String.valueOf(j38o)).stripTrailingZeros().scale() <= 0; };'
        + ' java.util.function.ToLongFunction<Object> j38l = j38o -> (j38o instanceof Long || j38o instanceof Integer || j38o instanceof Double || j38o instanceof Float || j38o instanceof java.math.BigDecimal) ? ((Number) j38o).longValue() : Long.parseLong(String.valueOf(j38o));'
        + ' boolean j38e; try { if (j38a == null || j38b == null) j38e = j38a == j38b; else if (!j38a.getClass().equals(j38b.getClass()) && !(j38n.test(j38a) && j38n.test(j38b))) j38e = false; else if (j38i.test(j38a) && j38i.test(j38b)) j38e = j38l.applyAsLong(j38a) == j38l.applyAsLong(j38b); else if (j38a instanceof Double || j38b instanceof Double) j38e = j38d.applyAsDouble(j38a) == j38d.applyAsDouble(j38b); else if (j38a instanceof Float || j38b instanceof Float) j38e = (float) j38d.applyAsDouble(j38a) == (float) j38d.applyAsDouble(j38b); else if (j38a instanceof String && j38b instanceof String) j38e = j38a.equals(j38b); else if (j38a instanceof Boolean && j38b instanceof Boolean) j38e = j38a.equals(j38b); else if (j38n.test(j38a) && j38n.test(j38b)) j38e = new java.math.BigDecimal(String.valueOf(j38a)).compareTo(new java.math.BigDecimal(String.valueOf(j38b))) == 0; else j38e = false; } catch (Exception j38x) { j38e = false; }';
    const ret = { isGreaterThan: 'j38g', ['is' + 'LessThan']: '!j38g && !j38e', isGreaterThanOrEqual: 'j38g || j38e', isLessThanOrEqual: '(!j38g && !j38e) || j38e' }[helper];
    return `((java.util.function.BiPredicate<Object, Object>) (j38a, j38b) -> { ${num} ${dbl} ${gt}${helper === 'isGreaterThan' ? '' : ' ' + eq} return ${ret}; }).test(${a}, ${b})`;
}

export function nativeJavaJ38 (content: string): string {
    if (!/Helpers\.(?:is(?:Greater|Less)Than|mathM(?:in|ax))/.test (content)) return content;
    const re = /\bHelpers\.(isGreaterThanOrEqual|isLessThanOrEqual|isGreaterThan|isLessThan|mathMin|mathMax)\(/g;
    const lines = content.split ('\n');
    for (let i = 0; i < lines.length; i++) {
        const trimmed = lines[i].trim ();
        if (trimmed.startsWith ('//') || trimmed.startsWith ('*')) continue;
        let line = lines[i], again = true;
        while (again) {
            again = false;
            re.lastIndex = 0;
            let m;
            while ((m = re.exec (line)) !== null) {
                const before = line.slice (0, m.index);
                if (before.includes ('//') || (before.split ('"').length - 1) % 2 === 1) continue;
                const split = h2kJ10SplitArgs (line, m.index + m[0].length);
                if (split === undefined || split.args.length !== 2) continue;
                line = before + j38Inline (m[1], split.args[0], split.args[1]) + line.slice (split.end + 1);
                again = true;
                break;
            }
        }
        lines[i] = line;
    }
    return lines.join ('\n');
}

// hx4 J38: snippet checks (`--audit-string-types --self-test`)
function j38SelfTest (): string[] {
    const problems: string[] = [];
    const cases: [string, string][] = [
        [ '        if (Helpers.isLessThan(a, Helpers.mathMax(b, 1))) {}', '(java.util.function.BiPredicate<Object, Object>)' ],
        [ '        Object x = Helpers.mathMin(limit, 1000);', '.apply(limit, 1000);' ],
        [ '        // Helpers.isLessThan(a, b)', '// Helpers.isLessThan(a, b)' ],
        [ '        if (Helpers.isLessThanOrEqual(a, 0)) {}', '(java.util.function.BiPredicate<Object, Object>)' ],
    ];
    for (const [ body, expect ] of cases) {
        const out = nativeJavaJ38 (body);
        if (!out.includes (expect)) problems.push (`hx4 J38: ${body}\n${out}`);
    }
    if (nativeJavaJ38 (cases[0][0]).includes ('Helpers.')) problems.push ('hx4 J38: nested helper left behind');
    return problems;
}

// hx4 J39
// getArrayLength / inOp / objectKeys / newMap -> inline Java with the exact dispatch of Helpers.java; addElementToObject /
// GetValue -> native Map/List operations on receivers declared Map<String, Object> / List<Object> (fields, locals, casts).
function j39MapFields (): Set<string> {
    return new Set ([ 'options', 'urls', 'has', 'features', 'api', 'exceptions', 'headers', 'commonCurrencies', 'markets_by_id', 'baseCurrencies', 'quoteCurrencies', 'transformedApi', 'userAgents' ]);
}

// end of the string / char literal or comment starting at k (index of its last char), or -1 when text[k] starts none
function j39SkipLiteral (t: string, k: number): number {
    const c = t[k];
    if (c === '"' || c === '\'') {
        for (let j = k + 1; j < t.length; j++) { if (t[j] === '\\') j++; else if (t[j] === c) return j; }
        return t.length - 1;
    }
    if (c === '/' && t[k + 1] === '/') { const e = t.indexOf ('\n', k); return e === -1 ? t.length - 1 : e - 1; }
    if (c === '/' && t[k + 1] === '*') { const e = t.indexOf ('*/', k + 2); return e === -1 ? t.length - 1 : e + 1; }
    return -1;
}

function j39Close (t: string, open: number): number {
    let depth = 0;
    for (let k = open; k < t.length; k++) {
        const s = j39SkipLiteral (t, k);
        if (s !== -1) { k = s; continue; }
        const c = t[k];
        if (c === '(' || c === '[' || c === '{') depth++;
        else if ((c === ')' || c === ']' || c === '}') && --depth === 0) return k;
    }
    return -1;
}

// top-level comma split of t; generic argument lists (`HashMap<String, Object>`) are one token
function j39Split (t: string): string[] {
    const out: string[] = [];
    let depth = 0, at = 0;
    for (let k = 0; k < t.length; k++) {
        const s = j39SkipLiteral (t, k);
        if (s !== -1) { k = s; continue; }
        const c = t[k];
        if (c === '<' && /[\w]/.test (t[k - 1] ?? '')) {
            const g = /^<[\w.?,\s<>]*>/.exec (t.slice (k));
            if (g !== null) { k += g[0].length - 1; continue; }
        }
        if (c === '(' || c === '[' || c === '{') depth++;
        else if (c === ')' || c === ']' || c === '}') depth--;
        else if (c === ',' && depth === 0) { out.push (t.slice (at, k).trim ()); at = k + 1; }
    }
    const last = t.slice (at).trim ();
    if (last !== '' || out.length > 0) out.push (last);
    return out;
}

function j39Unparen (e: string): string {
    e = e.trim ();
    while (e.startsWith ('(') && j39Close (e, 0) === e.length - 1) e = e.slice (1, -1).trim ();
    return e;
}

// hx11 w8: a newMap literal that is the whole argument of a statement-level `((List<Object>)x).add(...)` becomes
// statement-level puts instead of a `switch (0)` lambda blob. Unbraced control bodies keep the switch form.
function j39HoistStatement (t: string, at: number, close: number, args: string[], lineStart: number, indent: string, fresh: () => string): { text: string, end: number } | undefined {
    if (args.length === 0 || args.length % 2 !== 0 || args.some ((a, i) => i % 2 === 0 && !/^"(?:[^"\\]|\\.)*"$/.test (a))) return undefined;
    const prefix = t.slice (lineStart, at);
    if (!/^[ \t]*\(\([A-Za-z.<>?, ]+\)[A-Za-z_]\w*\)\.add\($/.test (prefix) || t.slice (close + 1, close + 3) !== ');') return undefined;
    const before = t.slice (0, lineStart).trimEnd ();
    if (!/[;{}]$/.test (before) || /^\s*\/\//.test (before.slice (before.lastIndexOf ('\n') + 1))) return undefined;
    const n = fresh ();
    const lines: string[] = [ `${indent}java.util.HashMap<String, Object> ${n} = new java.util.HashMap<String, Object>();` ];
    for (let i = 0; i < args.length; i += 2) lines.push (`${indent}${n}.put(${args[i]}, ${args[i + 1]});`);
    lines.push (`${prefix}${n});`);
    return { text: lines.join ('\n'), end: close + 3 };
}

function j39Member (member: string, fresh: () => string): string {
    const typeCache = new Map<string, string | undefined> ();
    const declaredType = (name: string): string | undefined => {
        if (typeCache.has (name)) return typeCache.get (name);
        const re = new RegExp (`(?:^|[\\s(,])((?:final )?[\\w.]+(?:<[\\w.?]+(?:<[\\w.?, ]*>)?(?:, [\\w.?]+(?:<[\\w.?, ]*>)?)*>)?) ${name}(?=\\s*(?:=(?!=)|[,);:]))`, 'g');
        const types = new Set<string> ();
        for (const m of member.matchAll (re)) {
            const t = m[1].replace (/^final /, '');
            if ([ 'return', 'new', 'else', 'case', 'throw', 'instanceof', 'yield' ].includes (t)) continue;
            types.add (t);
        }
        const shadowed = new RegExp (`(?:\\(|, )${name}\\) ->|(?<![\\w.])${name} ->`).test (member);
        const out = !shadowed && types.size === 1 ? [ ...types ][0] : undefined;
        typeCache.set (name, out);
        return out;
    };
    const ident = (e: string) => /^[A-Za-z_]\w*$/.test (e) && !/^(?:this|null|true|false)$/.test (e);
    const strLit = (e: string) => /^"(?:[^"\\]|\\.)*"$/.test (e);
    const numLit = (e: string) => /^\d+L?$/.test (e);
    const fieldRef = (e: string) => /^this(?:\.[A-Za-z_]\w*)+$/.test (e);
    // re-evaluating it reads the same value and runs nothing
    const pure = (e: string): boolean => {
        e = j39Unparen (e);
        if (ident (e) || fieldRef (e) || strLit (e) || numLit (e)) return true;
        const cast = /^\(([\w.]+(?:<[\w.<>, ?]*>)?)\)\s*(.+)$/s.exec (e);
        return cast !== null && j39Close (e, 0) === cast[1].length + 1 && pure (cast[2]);
    };
    const asObject = (e: string) => (strLit (e) ? e : `((Object)(${e}))`);
    const rewrite = (helper: string, args: string[], statement: boolean, indent: string): string | undefined => {
        if (helper === 'getArrayLength' && args.length === 1) {
            const l = fresh (), s = fresh (), o = fresh ();
            return `(switch ((Object)(${args[0]})) { case null -> 0; case java.util.List<?> ${l} -> ${l}.size(); case String ${s} -> ${s}.length(); case Object ${o} -> ${o}.getClass().isArray() ? java.lang.reflect.Array.getLength(${o}) : 0; })`;
        }
        if (helper === 'objectKeys' && args.length === 1) {
            const m = fresh ();
            return `((java.util.List<Object>) switch ((Object)(${args[0]})) { case java.util.Map<?, ?> ${m} -> { synchronized (${m}) { yield new java.util.ArrayList<Object>(${m}.keySet()); } } case null, default -> new java.util.ArrayList<Object>(); })`;
        }
        if (helper === 'inOp' && args.length === 2 && pure (args[1])) {
            const [ o, k ] = args;
            const m = fresh (), l = fresh ();
            const mapArm = strLit (k) ? `${m}.containsKey(${k})` : `${asObject (k)} instanceof String && ${m}.containsKey(${k})`;
            const listArm = strLit (k) ? `${l}.contains(${k})` : `${asObject (k)} != null && ${l}.contains(${k})`;
            return `(switch ((Object)(${o})) { case java.util.List<?> ${l} -> ${listArm}; case java.util.Map<?, ?> ${m} -> ${mapArm}; case null, default -> false; })`;
        }
        if (helper === 'newMap') {
            if (args.length === 0) return 'new java.util.HashMap<String, Object>()';
            if (args.length % 2 !== 0 || args.some ((a, i) => i % 2 === 0 && !strLit (a))) return undefined;
            const n = fresh ();
            const puts: string[] = [];
            for (let i = 0; i < args.length; i += 2) puts.push (`${n}.put(${args[i]}, ${args[i + 1]});`);
            const sep = args.some ((a) => a.includes ('\n')) || args.length > 2 ? `\n${indent}    ` : ' ';
            return `(switch (0) { default -> { java.util.HashMap<String, Object> ${n} = new java.util.HashMap<String, Object>();${sep}${puts.join (sep)}${sep}yield ${n}; } })`;
        }
        // hx5 X22: GetValue / addElementToObject -> plain native op on a proven receiver + key, else the helper call
        if (helper === 'GetValue' || helper === 'addElementToObject') return x22MapRewrite (helper, args, statement, declaredType, member);
        return undefined;
    };
    // code positions of every helper call, rewritten right-to-left so inner calls go first
    const starts: number[] = [];
    const head = /Helpers\.(?:GetValue|addElementToObject|getArrayLength|inOp|objectKeys|newMap)\(/y;
    for (let k = 0; k < member.length; k++) {
        const s = j39SkipLiteral (member, k);
        if (s !== -1) { k = s; continue; }
        if (member[k] === 'H' && !/[\w.]/.test (member[k - 1] ?? '')) { head.lastIndex = k; if (head.test (member)) starts.push (k); }
    }
    let out = member;
    for (let i = starts.length - 1; i >= 0; i--) {
        const at = starts[i];
        const helper = /^Helpers\.(\w+)\(/.exec (out.slice (at))![1];
        const open = at + 'Helpers.'.length + helper.length;
        const close = j39Close (out, open);
        if (close === -1) continue;
        const args = j39Split (out.slice (open + 1, close));
        const lineStart = out.lastIndexOf ('\n', at - 1) + 1;
        const indent = /^\s*/.exec (out.slice (lineStart))![0];
        const statement = out.slice (lineStart, at).trim () === '' && out[close + 1] === ';';
        const hoisted = helper === 'newMap' ? j39HoistStatement (out, at, close, args, lineStart, indent, fresh) : undefined;
        if (hoisted !== undefined) { out = out.slice (0, lineStart) + hoisted.text + out.slice (hoisted.end); continue; }
        const text = rewrite (helper, args, statement, indent);
        if (text === undefined) continue;
        out = statement && helper === 'addElementToObject' ? out.slice (0, at) + text + out.slice (close + 2) : out.slice (0, at) + text + out.slice (close + 1);
    }
    return out;
}

export function nativeJavaJ39Containers (content: string): string {
    if (!/Helpers\.(?:GetValue|addElementToObject|getArrayLength|inOp|objectKeys|newMap)\(/.test (content)) return content;
    const prefix = /\bj39[a-z]\d/.test (content) ? 'j39z' : 'j39';
    let counter = 0;
    const fresh = () => `${prefix}v${++counter}`;
    const lines = content.split ('\n');
    const starts: number[] = [ 0 ];
    for (let i = 1; i < lines.length; i++) if (/^    (?:public|private|protected)\b/.test (lines[i])) starts.push (i);
    starts.push (lines.length);
    const parts: string[] = [];
    for (let s = 0; s + 1 < starts.length; s++) parts.push (j39Member (lines.slice (starts[s], starts[s + 1]).join ('\n'), fresh));
    return parts.join ('\n');
}

// hx4 J39: snippet checks (`--audit-string-types --self-test`)
function j39SelfTest (): string[] {
    const problems: string[] = [];
    const cls = (body: string) => `public class Woo extends WooApi\n{\n    public Object m(Map<String, Object> p, Object o, String s, List<Object> l)\n    {\n${body}\n    }\n}`;
    const cases: [string, string, string | undefined][] = [
        [ 'length', '        return Helpers.getArrayLength(o);', 'case java.util.List<?> j39v1 -> j39v1.size(); case String j39v2 -> j39v2.length()' ],
        [ 'keys', '        return Helpers.objectKeys(o);', 'synchronized (j39v1) { yield new java.util.ArrayList<Object>(j39v1.keySet()); }' ],
        [ 'inOp lit', '        return Helpers.inOp(o, "a");', 'j39v2.contains("a"); case java.util.Map<?, ?> j39v1 -> j39v1.containsKey("a")' ],
        [ 'inOp id', '        return Helpers.inOp(o, s);', '((Object)(s)) instanceof String && j39v1.containsKey(s)' ],
        [ 'newMap', '        return this.f(Helpers.newMap("a", o));', 'switch (0) { default -> { java.util.HashMap<String, Object> j39v1 = new java.util.HashMap<String, Object>(); j39v1.put("a", o); yield j39v1; } }' ],
        [ 'newMap add hoist', '        Object r = null;\n        ((List<Object>)r).add(Helpers.newMap(\"a\", o));\n        return r;', 'j39v1.put(\"a\", o);\n        ((List<Object>)r).add(j39v1);' ],
        [ 'newMap add unbraced', '        if (o != null)\n            ((List<Object>)l).add(Helpers.newMap(\"a\", o));\n        return l;', 'add((switch (0) { default -> {' ],
        [ 'newMap add in call', '        ((List<Object>)l).add(this.f(Helpers.newMap(\"a\", o)));\n        return l;', 'add(this.f((switch (0) { default -> {' ],
        [ 'nested', '        return Helpers.inOp(Helpers.newMap("a", Helpers.getArrayLength(o)), "a");', 'j39v4.put("a", (switch ((Object)(o))' ],
        // negatives: Object receiver put/get, impure inOp key, odd newMap, string-literal content, expression GetValue
        [ 'put Object', '        Helpers.addElementToObject(o, "a", 1);', undefined ],
        [ 'get Object', '        return Helpers.GetValue(o, "a");', undefined ],
        [ 'inOp call key', '        return Helpers.inOp(o, this.k());', undefined ],
        [ 'newMap odd', '        return Helpers.newMap("a", o, "b");', undefined ],
        [ 'newMap id key', '        return Helpers.newMap(s, o);', undefined ],
        [ 'in string', '        return "Helpers.inOp(o, s)";', undefined ],
    ];
    for (const [ name, body, expect ] of cases) {
        const out = nativeJavaJ39Containers (cls (body));
        const ok = expect === undefined ? out === cls (body) : out.includes (expect);
        if (!ok) problems.push (`hx4 J39: ${name}\n${out}`);
    }
    return problems;
}

// hx4 J40: core-arg / truthiness / literal-equality / literal-add helpers as inline pattern switches
// that replay the Helpers.java branches exactly (null, Integer->Long, Double, String, Float/BigDecimal).
function j40Lit (raw: string): string | undefined {
    const t = raw.trim().replace(/^\((-?\d+L?)\)$/, '$1');
    if (/^-?\d{1,15}L?$/.test(t)) { return t.replace(/L$/, ''); }
    return undefined;
}

// a String literal no Double.parseDouble / BigDecimal parse accepts (Helpers.isNumber is false)
function j40Unparseable (lit: string): boolean {
    if (!/^"(?:[^"\\]|\\.)*"$/.test(lit) || /\\/.test(lit)) { return false; }
    return !/^\s*[+-]?(?:NaN|Infinity|0[xX][0-9a-fA-F.]*(?:[pP][+-]?\d+)?|[\d.]+(?:[eE][+-]?\d+)?)[fFdD]?\s*$/.test(lit.slice(1, -1));
}

// the literal holds a character no numeric text can contain anywhere, so any concatenation stays unparseable
function j40PoisonsNumber (lit: string): boolean {
    return /^"(?:[^"\\]|\\.)*"$/.test(lit) && /[^0-9A-Za-z.+\-\s\\]/.test(lit.slice(1, -1));
}

// nearest same-member declaration type of `name` before `pos` (params included)
function j40DeclType (masked: string, name: string, pos: number): string | undefined {
    const before = masked.slice(0, pos);
    const breaks = [...before.matchAll(/^[ \t]*(?:public|private|protected)[ \t]/gm)];
    if (breaks.length === 0) { return undefined; }
    const window = before.slice(breaks[breaks.length - 1].index);
    const decl = new RegExp(`(?:^|[\\s(,])([\\w.<>?,\\[\\]]+)\\s+${name}\\s*(?=[=;,)])`, 'g');
    let last: string | undefined;
    let mm;
    while ((mm = decl.exec(window)) !== null) { if (!/,$/.test(mm[1]) && !/^(?:return|new|else|case|throw)$/.test(mm[1])) { last = mm[1]; } }
    return last;
}

interface J40Ctx { masked: string, pos: number, fields: Set<string>, methods: Set<string> }

function j40Rewrite (name: string, args: string[], argsM: string[], n: number, intConsts: Set<string>, ctx: J40Ctx): string | undefined {
    const v = 'hx4J40v' + n;
    const x = args[0] === undefined ? '' : args[0].trim();
    if (name === 'toStringArg' || name === 'toString') {
        return args.length === 1 ? `java.util.Objects.toString(${x}, null)` : undefined;
    }
    if (name === 'toMapArg' || name === 'toStringListArg') {
        if (args.length !== 1) { return undefined; }
        const [ t, w, msg ] = name === 'toMapArg' ? [ 'java.util.Map<String, Object>', 'java.util.Map<?, ?>', 'a dictionary' ] : [ 'java.util.List<String>', 'java.util.List<?>', 'a list of strings' ];
        return `((${t}) (switch ((Object) (${x})) { case null -> (${t}) null; case ${w} ${v} -> (${t}) ${v}; case Object ${v} -> throw new ClassCastException("ccxt: expected ${msg}, got " + ${v}.getClass().getName()); }))`;
    }
    if (name === 'toLongOrNull') {
        if (args.length !== 1) { return undefined; }
        return `((Long) (switch ((Object) (${x})) { case null -> (Long) null; case Long ${v} -> ${v}; case Number ${v} -> Long.valueOf(${v}.longValue()); case Object ${v} -> throw new ClassCastException("ccxt: expected a number, got " + ${v}.getClass().getName()); }))`;
    }
    if (name === 'toInt64') {
        if (args.length !== 1) { return undefined; }
        return `((long) (switch ((Object) (${x})) { case null -> Long.parseLong("null"); case Long ${v} -> ${v}.longValue(); case Integer ${v} -> ${v}.longValue(); case Double ${v} -> ${v}.longValue(); case Float ${v} -> ${v}.longValue(); case java.math.BigDecimal ${v} -> ${v}.longValue(); case String ${v} -> Long.parseLong(${v}); case Object ${v} -> Long.parseLong(String.valueOf(${v})); }))`;
    }
    if (name === 'isTrue') {
        // hx5 X14: native only on a proven boolean/Boolean operand, else the helper call stays
        return args.length === 1 ? j40X14IsTrue(x, ctx) : undefined;
    }
    if (args.length !== 2) { return undefined; }
    const a = args[0].trim(); const b = args[1].trim();
    if (name === 'isEqual') { return j40X15Equal(a, b, intConsts, ctx); } // hx5 X15
    // name === 'add': only the (Object, Object) overload; a String-typed `a` binds add(String, ..)
    if (/^this\.(?:id|version)$/.test(a) && !ctx.fields.has(a.slice(5))) { return `(${a} + ${j05IsPrimary(argsM[1].trim()) ? b : `(${b})`})`; }
    const aOk = /^this\.(?:parseToInt|seconds|milliseconds)\(/.test(a) && j05Close(argsM[0].trim(), argsM[0].trim().indexOf('(')) === argsM[0].trim().length && !new RegExp(`\\bString\\s+${a.slice(5, a.indexOf('('))}\\(`).test(ctx.masked)
        || /^\(*Helpers\.(?:divide|multiply|subtract|mod|GetValue)\(/.test(a) && j05IsPrimary(argsM[0].trim())
        || /^\(\((?:java\.util\.function\.BinaryOperator<Object>\)|Object\) \(switch )/.test(a) && j05IsPrimary(argsM[0].trim())
        || /^[A-Za-z_]\w*$/.test(a) && [ 'Object', 'Long', 'Integer', 'Double', 'long' ].includes(j40DeclType(ctx.masked, a, ctx.pos) ?? '');
    const aT = argsM[0].trim();
    const objCall = /^this\.(implodeParams|implodeHostname|remove0xPrefix|formatNumber)\(/.exec(a);
    const aObj = aOk || j05IsPrimary(aT) && (
        objCall !== null && j05Close(aT, aT.indexOf('(')) === aT.length && !new RegExp(`\\bString\\s+${objCall[1]}\\(`).test(ctx.masked)
        || /^\w+\.this\.(?:milliseconds|seconds)\(\)$/.test(a) && !/\bString\s+(?:milliseconds|seconds)\(/.test(ctx.masked)
        || /^\(\(Map<String, Object>\)\w+\)\.get\(/.test(a) && j05Close(aT, aT.indexOf('.get(') + 4) === aT.length
        || /^\(\w+ == null \|\| .*\? null : \(\(List<\?>\)\w+\)\.get\(\w+\)\)$/.test(a)
        || /^\w+\.get\("\w+"\)$/.test(a) && /^(?:java\.util\.)?Map<String, ?Object>$/.test(j40DeclType(ctx.masked, a.slice(0, a.indexOf('.')), ctx.pos) ?? ''));
    // a String-typed `a` binds add(String, ..): a + String.valueOf(b), which is Java's own `+`
    const aStr = /^this\.intToBase16\(/.test(a) && j05Close(aT, aT.indexOf('(')) === aT.length && !/\b(?:Object|var|Long)\s+intToBase16\(/.test(ctx.masked)
        || /^\(\(String\)\w+\)\.(?:toLowerCase|toUpperCase|trim)\(\)$/.test(a);
    if (aStr) { return `(${a} + ${j05IsPrimary(argsM[1].trim()) ? b : `(${b})`})`; }
    if (!aObj) { return undefined; }
    const lit = j40Lit(b);
    if (lit !== undefined) {
        return `((Object) (switch ((Object) (${a})) { case null -> (Object) null; case Long ${v} -> (Object) (${v} + ${lit}L); case Integer ${v} -> (Object) (${v}.longValue() + ${lit}L); case Double ${v} -> (Object) (${v} + ((double) ${lit}L)); case String ${v} -> (Object) (${v} + "${lit}"); default -> (Object) null; }))`;
    }
    // b is a String whose leading literal no number parse accepts, so only a Double `a` stays numeric
    const terms = j05PlusTerms(j05StripParens(b, argsM[1])[1]);
    const bStr = j05StripParens(b, argsM[1])[0];
    if (terms !== undefined && j40PoisonsNumber(bStr.slice(terms[0][0], terms[0][1]).trim()) && !/^"/.test(a)) {
        return `((Object) (switch ((Object) (${a})) { case null -> (Object) ("null" + (${b})); case Double ${v} -> (Object) (${v} + 0.0); case Object ${v} -> (Object) (String.valueOf(${v}) + (${b})); }))`;
    }
    const x0 = a; const y0 = b;
    return `((java.util.function.BinaryOperator<Object>) (${v}A, ${v}B) -> { Object ${v}P = ${v}A instanceof Integer ${v}i ? (Object) Long.valueOf(${v}i.longValue()) : ${v}A; Object ${v}Q = ${v}B instanceof Integer ${v}i ? (Object) Long.valueOf(${v}i.longValue()) : ${v}B; if (${v}P instanceof Long ${v}l && ${v}Q instanceof Long ${v}r) { return ${v}l + ${v}r; } if (${v}P instanceof Double || ${v}Q instanceof Double) { java.util.function.ToDoubleFunction<Object> ${v}D = ${v}o -> { if (${v}o instanceof Double || ${v}o instanceof Float || ${v}o instanceof Long || ${v}o instanceof Integer || ${v}o instanceof java.math.BigDecimal) { return ((Number) ${v}o).doubleValue(); } try { return Double.parseDouble(String.valueOf(${v}o)); } catch (NumberFormatException ${v}e) { return 0.0; } }; return ${v}D.applyAsDouble(${v}P) + ${v}D.applyAsDouble(${v}Q); } if (${v}P instanceof String || ${v}Q instanceof String) { return String.valueOf(${v}P) + String.valueOf(${v}Q); } return null; }).apply(${x0}, ${y0})`;
}

export function nativeJavaJ40 (content: string): string {
    const re = /Helpers\.(isEqual|isTrue|toMapArg|toStringArg|toStringListArg|toLongOrNull|toString|toInt64|add)\($/;
    if (!/Helpers\.(isEqual|isTrue|toMapArg|toStringArg|toStringListArg|toLongOrNull|toString|toInt64|add)\(/.test(content)) { return content; }
    const intConsts = new Set([ 'TICK_SIZE', 'DECIMAL_PLACES', 'SIGNIFICANT_DIGITS' ]);
    for (const c of [ ...intConsts ]) { if (new RegExp(`\\b(?:int|long|Object|var|Long|Integer)\\s+${c}\\b`).test(content)) { intConsts.delete(c); } }
    const fields = new Set<string>(); const methods = new Set<string>();
    for (const d of content.matchAll(/\b(?:public|private|protected)\s+(?:static\s+)?[\w.<>?,\[\] ]+?\s+(\w+)\s*(\(|=|;)/g)) {
        (d[2] === '(' ? methods : fields).add(d[1]);
    }
    let masked = j05Mask(content);
    let from = masked.length;
    // binding names stay unique when the pass re-runs over its own output
    let n = 1 + Math.max(-1, ...[ ...content.matchAll(/hx4J40v(\d+)/g) ].map((m) => Number(m[1])));
    for (;;) {
        const at = masked.lastIndexOf('Helpers.', from);
        if (at === -1) { break; }
        from = at - 1;
        if (at > 0 && /[\w.]/.test(masked[at - 1])) { continue; }
        const head = /^Helpers\.(\w+)\(/.exec(masked.slice(at, at + 40));
        if (head === null || !re.test(head[0])) { continue; }
        const open = at + head[0].length - 1;
        const end = j05Close(masked, open);
        if (end === -1) { continue; }
        // a bare statement `Helpers.x(..);` is not a legal native expression statement
        if (/[;{}]\s*$/.test(masked.slice(Math.max(0, at - 200), at)) && /^\s*;/.test(masked.slice(end))) { continue; }
        const argsM = splitTopLevelArgs(masked.slice(open + 1, end - 1));
        const args: string[] = []; let p = open + 1;
        for (const m of argsM) { args.push(content.slice(p, p + m.length)); p += m.length + 1; }
        const repl = j40Rewrite(head[1], args, argsM, n++, intConsts, { masked, pos: at, fields, methods });
        if (repl === undefined) { continue; }
        content = content.slice(0, at) + repl + content.slice(end);
        masked = j05Mask(content);
    }
    return content;
}

// hx4 J40: snippet checks (`--audit-string-types --self-test`)
function j40SelfTest (): string[] {
    const problems: string[] = j40X14SelfTest();
    const cls = (body: string) => `public class Woo extends WooApi\n{\n    public Object m(Object p, String s, Long n)\n    {\n${body}\n    }\n}`;
    const cases: [string, string, string | undefined][] = [
        [ 'isEqual null', '        if (Helpers.isEqual(p, null)) {}', 'if ((((Object) (p)) == null)) {}' ],
        [ 'isEqual word', '        if (Helpers.isEqual(p, "abc")) {}', '"abc".equals(p)' ],
        [ 'isTrue Object', '        if (Helpers.isTrue(p)) {}', undefined ], // hx5 X14
        [ 'toMapArg', '        return this.f(Helpers.toMapArg(p));', 'case java.util.Map<?, ?> hx4J40v0' ],
        [ 'toStringArg', '        return this.f(Helpers.toStringArg(p));', 'this.f(java.util.Objects.toString(p, null))' ],
        [ 'add Object lit', '        Object x = p;\n        return Helpers.add(x, 1);', 'case Integer hx4J40v0 -> (Object) (hx4J40v0.longValue() + 1L);' ],
        [ 'add nested', '        Object x = p;\n        return Helpers.add(Helpers.add(x, n), 1);', 'case Long hx4J40v1 -> (Object) (hx4J40v1 + 1L);' ],
        [ 'add id', '        return Helpers.add(this.id, " x");', 'return (this.id + " x");' ],
        [ 'add Object pair', '        Object x = p;\n        return Helpers.add(x, n);', '.apply(x, n)' ],
        // negatives: String-declared add operand, statement position
        [ 'add String', '        return Helpers.add(s, 1);', undefined ],
        [ 'statement', '        Helpers.toMapArg(p);', undefined ],
    ];
    for (const [ name, body, expect ] of cases) {
        const out = nativeJavaJ40 (cls (body));
        const ok = expect === undefined ? out === cls (body) : out.includes (expect) && !out.includes ('Helpers.');
        if (!ok) problems.push (`hx4 J40: ${name}\n${out}`);
    }
    return problems;
}

// hx4 J41 -> hx5 X16: the inline lambdas that replayed Helpers.slice / Helpers.getIndexOf are gone.
// A call collapses to a plain String op only when the generator proves it equivalent (see the hx5 X16 block
// at the end of the file); every other site keeps the helper call exactly as master emitted it.
export function nativeJavaJ41 (content: string): string {
    if (!/Helpers\.(?:slice|getIndexOf)\(/.test(content)) { return content; }
    let masked = j05Mask(content);
    let from = masked.length;
    for (;;) {
        const at = masked.lastIndexOf('Helpers.', from);
        if (at === -1) { break; }
        from = at - 1;
        if (at > 0 && /[\w.]/.test(masked[at - 1])) { continue; }
        const head = /^Helpers\.(slice|getIndexOf)\(/.exec(masked.slice(at, at + 24));
        if (head === null) { continue; }
        const open = at + head[0].length - 1;
        const end = j05Close(masked, open);
        if (end === -1) { continue; }
        const argsM = splitTopLevelArgs(masked.slice(open + 1, end - 1));
        const args: string[] = []; let p = open + 1;
        for (const m of argsM) { args.push(content.slice(p, p + m.length).trim()); p += m.length + 1; }
        const repl = hx5X16Native(head[1], args, content);
        if (repl === undefined) { continue; }
        content = content.slice(0, at) + repl + content.slice(end);
        masked = j05Mask(content);
    }
    return content;
}

// hx5 X16: snippet checks (`--audit-string-types --self-test`)
function j41SelfTest (): string[] {
    return hx5X16SelfTest();
}

// hx5 X17: J42 no longer inlines Helpers.toLong/toDouble; see x17J42Native at the end of the file.
export function nativeJavaJ42 (content: string): string {
    if (!/Helpers\.(?:parseInt|parseFloat)\(/.test(content)) { return content; }
    let masked = j05Mask(content);
    let from = masked.length;
    for (;;) {
        const at = masked.lastIndexOf('Helpers.', from);
        if (at === -1) { break; }
        from = at - 1;
        if (at > 0 && /[\w.]/.test(masked[at - 1])) { continue; }
        const head = /^Helpers\.(parseInt|parseFloat)\(/.exec(masked.slice(at, at + 24));
        if (head === null) { continue; }
        const open = at + head[0].length - 1;
        const end = j05Close(masked, open);
        if (end === -1) { continue; }
        // a bare statement `Helpers.x(..);` is not a legal native expression statement
        if (/[;{}]\s*$/.test(masked.slice(Math.max(0, at - 200), at)) && /^\s*;/.test(masked.slice(end))) { continue; }
        const argsM = splitTopLevelArgs(masked.slice(open + 1, end - 1));
        if (argsM.length !== 1) { continue; }
        const x = content.slice(open + 1, end - 1).trim();
        const native = x17J42Native(head[1], x, content, at); // hx5 X17
        if (native === undefined) { continue; }
        content = content.slice(0, at) + native + content.slice(end);
        masked = j05Mask(content);
    }
    return content;
}

// hx5 X17: J42 snippet checks (`--audit-string-types --self-test`)
function j42SelfTest (): string[] {
    const problems: string[] = [];
    const cls = (body: string) => `public class Woo extends WooApi\n{\n    public Object m(Object p, String s, long l, double d, Long b)\n    {\n${body}\n    }\n}`;
    const cases: [string, string, string | undefined][] = [
        [ 'Object -> helper', '        Object x = Helpers.parseInt(p);', undefined ],
        [ 'String -> helper (parseLong throws, helper yields null)', '        Object x = Helpers.parseInt(s);', undefined ],
        [ 'String parseFloat -> helper (helper yields 0.0)', '        Object x = Helpers.parseFloat(s);', undefined ],
        [ 'nested Object -> helper', '        return Helpers.parseFloat(Helpers.parseInt(p));', undefined ],
        [ 'unparseable literal -> helper', '        return Helpers.parseInt("a)b");', undefined ],
        [ 'statement', '        Helpers.parseInt(l);', undefined ],
        [ 'long param', '        Object x = Helpers.parseInt(l);', 'Object x = Long.valueOf(l);' ],
        [ 'double param parseInt', '        Object x = Helpers.parseInt(d);', 'Object x = Long.valueOf((long) d);' ],
        [ 'double param parseFloat', '        Object x = Helpers.parseFloat(d);', 'Object x = Double.valueOf(d);' ],
        [ 'Long param parseInt', '        Object x = Helpers.parseInt(b);', 'Object x = b;' ],
        [ 'local int', '        int i = 3;\n        Object x = Helpers.parseFloat(i);', 'Object x = Double.valueOf((double) i);' ],
        [ 'digit literal', '        Object x = Helpers.parseInt("42");', 'Object x = Long.valueOf(42L);' ],
        [ 'decimal literal', '        Object x = Helpers.parseFloat("-1.5");', 'Object x = Double.valueOf(-1.5);' ],
        [ 'leading zero literal -> helper', '        Object x = Helpers.parseInt("007");', undefined ],
        [ 'shadowed by Object local', '        Object l2 = p;\n        Object x = Helpers.parseInt(p);', undefined ],
    ];
    for (const [ name, body, expect ] of cases) {
        const out = nativeJavaJ42 (cls (body));
        const ok = expect === undefined ? out === cls (body) : out.includes (expect) && !/Helpers\.parse(?:Int|Float)\(/.test (out) && !out.includes ('switch');
        if (!ok) problems.push (`hx5 X17 J42: ${name}\n${out}`);
    }
    const once = nativeJavaJ42 (cls ('        Object x = Helpers.parseInt(l) + Helpers.parseInt(p);'));
    if (nativeJavaJ42 (once) !== once) problems.push ('hx5 X17 J42: not idempotent');
    return problems;
}

// hx5 X18 (was hx4 J43): no curried lambdas. Helpers.replaceAll(s, f, r) becomes the plain
// `s.replace(f, r)` only when s is proven a non-null String and f/r are string literals with
// f non-empty (helper: null s -> null, "" f -> s, all occurrences, literal). Everything else
// stays the helper call: Helpers.replace is replaceFirst (JS semantics, String.replace is
// replace-all), Helpers.split null-guards and wraps in Arrays.asList, padEnd coerces numbers.
function x18NonNullString (e: string): string | undefined {
    // returns a postfix expression proven to evaluate to a non-null String (or to NPE before the
    // helper would run, exactly as master did)
    let x = e.trim ();
    for (;;) {
        // strip `((String)X)` / `(String)X` casts
        const m = /^\(\s*\(String\)\s*(.*)\)$/s.exec (x);
        if (m !== null && j05Close (j05Mask (x), 0) === x.length) { x = m[1].trim (); continue; }
        const c = /^\(String\)\s*(.*)$/s.exec (x);
        if (c !== null) { x = c[1].trim (); continue; }
        break;
    }
    if (/^"(?:[^"\\\n]|\\.)*"$/.test (x)) { return x; }
    const mk = j05Mask (x);
    // `(<expr>).toLowerCase()` / `.toUpperCase()` / `.trim()`: NPEs on null before the helper, else non-null
    const call = /\.(toLowerCase|toUpperCase|trim)\(\)$/.exec (mk);
    if (call !== null && mk.startsWith ('(') && j05Close (mk, 0) === call.index) { return x; }
    if (mk.startsWith ('String.valueOf(') && j05Close (mk, 'String.valueOf'.length) === mk.length) { return x; }
    return undefined;
}

function x18Literal (e: string): string | undefined {
    let x = e.trim ();
    const m = /^\(\s*String\s*\)\s*(".*")$/s.exec (x);
    if (m !== null) { x = m[1]; }
    return /^"(?:[^"\\\n]|\\.)*"$/.test (x) ? x : undefined;
}

function j43Rewrite (name: string, args: string[]): string | undefined {
    if (name !== 'replaceAll' || args.length !== 3) { return undefined; }
    const s = x18NonNullString (args[0]);
    const f = x18Literal (args[1]);
    const r = x18Literal (args[2]);
    if (s === undefined || f === undefined || r === undefined || f === '""') { return undefined; }
    return `${s}.replace(${f}, ${r})`;
}

export function nativeJavaJ43 (content: string): string {
    if (!/Helpers\.replaceAll\(/.test (content)) { return content; }
    let masked = j05Mask (content);
    let from = masked.length;
    for (;;) {
        const at = masked.lastIndexOf ('Helpers.replaceAll(', from);
        if (at === -1) { break; }
        from = at - 1;
        if (at > 0 && /[\w.]/.test (masked[at - 1])) { continue; }
        const open = at + 'Helpers.replaceAll'.length;
        const end = j05Close (masked, open);
        if (end === -1) { continue; }
        const argsM = splitTopLevelArgs (masked.slice (open + 1, end - 1));
        const args: string[] = []; let p = open + 1;
        for (const m of argsM) { args.push (content.slice (p, p + m.length)); p += m.length + 1; }
        const repl = j43Rewrite ('replaceAll', args);
        if (repl === undefined) { continue; }
        content = content.slice (0, at) + repl + content.slice (end);
        masked = j05Mask (content);
    }
    return content;
}

// hx5 X18: snippet checks (`--audit-string-types --self-test`)
function j43SelfTest (): string[] {
    const problems: string[] = [];
    const cases: [string, string][] = [
        // native: receiver proven non-null String, literal non-empty search
        [ 'String n = Helpers.replaceAll(((String)((String)marketPart).toLowerCase()), "-", "_");', 'String n = ((String)marketPart).toLowerCase().replace("-", "_");' ],
        [ 'String n = Helpers.replaceAll(String.valueOf(x), (String)"-", (String)"+");', 'String n = String.valueOf(x).replace("-", "+");' ],
        // helper left alone
        [ 'String x = Helpers.replaceAll(s, (String)"-", (String)"+");', 'String x = Helpers.replaceAll(s, (String)"-", (String)"+");' ],
        [ 'String x = Helpers.replaceAll(((String)s), k, v);', 'String x = Helpers.replaceAll(((String)s), k, v);' ],
        [ 'String x = Helpers.replaceAll(String.valueOf(x), "", "+");', 'String x = Helpers.replaceAll(String.valueOf(x), "", "+");' ],
        [ 'String x = Helpers.replace(((String)s), ".", "");', 'String x = Helpers.replace(((String)s), ".", "");' ],
        [ 'String x = Helpers.replace("a.b", ".", "");', 'String x = Helpers.replace("a.b", ".", "");' ],
        [ 'List<Object> x = (List<Object>) Helpers.split(m.get("a,b"), ",");', 'List<Object> x = (List<Object>) Helpers.split(m.get("a,b"), ",");' ],
        [ 'String x = Helpers.padEnd(f, ((Number)6).intValue(), ((String)"0").charAt(0));', 'String x = Helpers.padEnd(f, ((Number)6).intValue(), ((String)"0").charAt(0));' ],
    ];
    for (const [ src, expect ] of cases) {
        const out = nativeJavaJ43 (src);
        if (out !== expect || /hx4J43|->/.test (out)) { problems.push (`hx5 X18: ${src}\n${out}`); }
        if (nativeJavaJ43 (out) !== out) { problems.push (`hx5 X18: not idempotent: ${src}`); }
    }
    return problems;
}

// hx5 X19: Helpers.isInstance / inOp / isArray become a plain native op only on a proven
// operand; every other site keeps the master helper call (no inlined switch or lambda).
// isEqual / isTrue are not rewritten here: J40 (X14/X15) already runs before this pass.

// innermost member window (from the last `public|private|protected` line) before `pos`
function x19Member (masked: string, pos: number): string | undefined {
    const before = masked.slice(0, pos);
    const breaks = [ ...before.matchAll(/^[ \t]*(?:public|private|protected)[ \t]/gm) ];
    return breaks.length === 0 ? undefined : before.slice(breaks[breaks.length - 1].index);
}

// `e` is the parameter of the innermost enclosing `catch(Exception e)` whose try body makes only
// synchronous, non-wrapping calls, so `e` can never be a CompletionException/ExecutionException
// and `e instanceof X` equals Helpers.isInstance(e, X.class)
function x19CatchSync (masked: string, name: string, pos: number): boolean {
    const member = x19Member(masked, pos);
    if (member === undefined) { return false; }
    const base = pos - member.length;
    const re = new RegExp(`\\}\\s*catch\\s*\\(\\s*Exception\\s+${name}\\s*\\)\\s*\\{`, 'g');
    let hit: RegExpExecArray | null = null; let mm;
    while ((mm = re.exec(member)) !== null) { hit = mm; }
    if (hit === null) { return false; }
    const catchOpen = base + hit.index + hit[0].length - 1;
    const catchEnd = j05Close(masked, catchOpen);
    if (catchEnd === -1 || catchEnd < pos) { return false; }
    // `name` must not be reassigned inside the catch body before the site
    if (new RegExp(`(?<![\\w.])${name}\\s*=(?!=)`).test(masked.slice(catchOpen, pos))) { return false; }
    // the matching try block: walk back from the `}` that closes it
    const tryClose = base + hit.index;
    let depth = 0; let tryOpen = -1;
    for (let i = tryClose; i >= 0; i--) {
        const c = masked[i];
        if (c === '}' || c === ')' || c === ']') { depth++; }
        else if (c === '{' || c === '(' || c === '[') { depth--; if (depth === 0) { tryOpen = i; break; } }
    }
    if (tryOpen === -1 || !/\btry\s*$/.test(masked.slice(Math.max(0, tryOpen - 20), tryOpen))) { return false; }
    const body = masked.slice(tryOpen + 1, tryClose);
    // every call in the try body must be one of these synchronous helpers (no join/get/async methods)
    const SYNC = new Set([ 'this.throwExactlyMatchedException', 'this.throwBroadlyMatchedException', 'this.json', 'this.exceptions.get', 'this.safeString', 'this.safeInteger', 'this.safeValue', 'this.safeDict', 'this.safeList', 'java.util.Objects.equals', 'Helpers.GetValue', 'String.valueOf' ]);
    for (const c of body.matchAll(/([A-Za-z_][\w.]*)\s*\(/g)) {
        const callee = c[1];
        if (/^(?:if|while|for|switch|return|throw|new)$/.test(callee)) { continue; }
        if (/\bnew\s*$/.test(body.slice(Math.max(0, c.index - 8), c.index))) { continue; }
        if (!SYNC.has(callee)) { return false; }
    }
    return !/->|\bnew\s+\w+\s*\([^)]*\)\s*\{/.test(body);
}

// `name` is a member local whose only assignment is its declaration `= new HashMap/ArrayList(...)`
function x19FreshLocal (masked: string, name: string, pos: number, kind: 'map' | 'list'): boolean {
    const member = x19Member(masked, pos);
    if (member === undefined) { return false; }
    const ty = kind === 'map' ? '(?:java\\.util\\.)?(?:Hash)?Map<String,\\s*Object>' : '(?:java\\.util\\.)?(?:Array)?List<Object>';
    const ctor = kind === 'map' ? '(?:java\\.util\\.)?HashMap' : '(?:java\\.util\\.)?ArrayList';
    const decls = [ ...member.matchAll(new RegExp(`(?<![\\w.])${ty}\\s+${name}\\s*=\\s*new\\s+${ctor}<[^>]*>\\s*\\(`, 'g')) ];
    const assigns = [ ...member.matchAll(new RegExp(`(?<![\\w.])${name}\\s*=(?!=)`, 'g')) ];
    return decls.length === 1 && assigns.length === 1;
}

function x19Rewrite (name: string, args: string[], masked: string, at: number): string | undefined {
    const x = args.map((s) => s.trim());
    if (name === 'isInstance' && x.length === 2) {
        const t = /^([A-Za-z_][\w.]*)\.class$/.exec(x[1]);
        if (t === null || !/^[A-Za-z_]\w*$/.test(x[0]) || !x19CatchSync(masked, x[0], at)) { return undefined; }
        return `(${x[0]} instanceof ${t[1]})`;
    }
    if (name === 'inOp' && x.length === 2) {
        // key must be a non-null String literal; the receiver a fresh, never-reassigned local
        if (!/^"(?:[^"\\]|\\.)*"$/.test(x[1]) || !/^[A-Za-z_]\w*$/.test(x[0])) { return undefined; }
        if (x19FreshLocal(masked, x[0], at, 'map')) { return `${x[0]}.containsKey(${x[1]})`; }
        if (x19FreshLocal(masked, x[0], at, 'list')) { return `${x[0]}.contains(${x[1]})`; }
        return undefined;
    }
    if (name === 'isArray' && x.length === 1) {
        // a fresh List local is always a non-null List (real arrays never reach this shape)
        return /^[A-Za-z_]\w*$/.test(x[0]) && x19FreshLocal(masked, x[0], at, 'list') ? 'true' : undefined;
    }
    return undefined;
}

export function nativeJavaJ44 (content: string): string {
    if (!/Helpers\.(?:isInstance|isArray|inOp)\(/.test(content)) { return content; }
    let masked = j05Mask(content);
    let from = masked.length;
    for (;;) {
        const at = masked.lastIndexOf('Helpers.', from);
        if (at === -1) { break; }
        from = at - 1;
        if (at > 0 && /[\w.]/.test(masked[at - 1])) { continue; }
        const head = /^Helpers\.(isInstance|isArray|inOp)\(/.exec(masked.slice(at, at + 40));
        if (head === null) { continue; }
        const open = at + head[0].length - 1;
        const end = j05Close(masked, open);
        if (end === -1) { continue; }
        if (/[;{}]\s*$/.test(masked.slice(Math.max(0, at - 200), at)) && /^\s*;/.test(masked.slice(end))) { continue; }
        const argsM = splitTopLevelArgs(masked.slice(open + 1, end - 1));
        const args: string[] = []; let p = open + 1;
        for (const m of argsM) { args.push(content.slice(p, p + m.length)); p += m.length + 1; }
        const repl = x19Rewrite(head[1], args, masked, at);
        if (repl === undefined) { continue; }
        content = content.slice(0, at) + repl + content.slice(end);
        masked = j05Mask(content);
    }
    return content;
}

// hx5 X19: snippet checks (`--audit-string-types --self-test`)
function j44SelfTest (): string[] {
    const problems: string[] = [];
    const cls = (body: string) => `public class Woo extends WooApi\n{\n    public Object m(Object p, Object q)\n    {\n${body}\n    }\n}`;
    const cases: [string, string, string | undefined][] = [
        [ 'isInstance sync try', '        try\n        {\n            if (!java.util.Objects.equals(p, null))\n            {\n                this.throwExactlyMatchedException(this.exceptions.get("exact"), p, this.json(q));\n            }\n        } catch(Exception e)\n        {\n            if (Helpers.isInstance(e, AuthenticationError.class)) {}\n        }', 'if ((e instanceof AuthenticationError)) {}' ],
        [ 'isInstance async try', '        try\n        {\n            q = (this.fetchX(p)).join();\n        } catch(Exception e)\n        {\n            if (Helpers.isInstance(e, AuthenticationError.class)) {}\n        }', undefined ],
        [ 'isInstance outside catch', '        if (Helpers.isInstance(p, AuthenticationError.class)) {}', undefined ],
        [ 'inOp fresh map', '        Map<String, Object> r = new HashMap<String, Object>() {{ }};\n        if (Helpers.inOp(r, "id")) {}', 'if (r.containsKey("id")) {}' ],
        [ 'inOp reassigned map', '        Map<String, Object> r = new HashMap<String, Object>() {{ }};\n        r = (Map<String, Object>) q;\n        if (Helpers.inOp(r, "id")) {}', undefined ],
        [ 'inOp non-literal key', '        Map<String, Object> r = new HashMap<String, Object>() {{ }};\n        if (Helpers.inOp(r, q)) {}', undefined ],
        [ 'inOp Object receiver', '        if (Helpers.inOp(p, Helpers.GetValue(q, "id"))) {}', undefined ],
        [ 'isArray Object', '        if (Helpers.isArray(p)) {}', undefined ],
        [ 'isArray fresh list', '        List<Object> r = new ArrayList<Object>(java.util.Arrays.asList());\n        if (Helpers.isArray(r)) {}', 'if (true) {}' ],
        [ 'isTrue Object', '        if (Helpers.isTrue(p)) {}', undefined ], // hx5 X14: helper left alone
        [ 'statement', '        Helpers.isArray(p);', undefined ],
    ];
    for (const [ name, body, expect ] of cases) {
        const out = nativeJavaJ44 (cls (body));
        const ok = expect === undefined ? out === cls (body) : out.includes (expect) && !/Helpers\.(?:isInstance|isArray|inOp)\(/.test (out);
        if (!ok) problems.push (`hx5 X19: ${name}\n${out}`);
        if (nativeJavaJ44 (out) !== out) problems.push (`hx5 X19: not idempotent: ${name}`);
        if (/hx4J44|switch|BiPredicate/.test (out)) problems.push (`hx5 X19: inlined body: ${name}`);
    }
    return problems;
}

// hx5 X14: J40 truthiness. Helpers.isTrue tests null, Boolean, Long, Integer, Double, String, List, Map in
// order, so a native test is only correct on a proven boolean (`x`) or Boolean (`Boolean.TRUE.equals(x)`).
// Every other operand keeps the plain helper call; no inline pattern switch is ever emitted.
function j40X14DeclTypes (masked: string, name: string, pos: number): string[] {
    const before = masked.slice(0, pos);
    const breaks = [ ...before.matchAll(/^[ \t]*(?:public|private|protected)[ \t]/gm) ];
    if (breaks.length === 0) { return []; }
    const window = before.slice(breaks[breaks.length - 1].index);
    const out: string[] = [];
    for (const mm of window.matchAll(new RegExp(`(?:^|[\\s(,])((?:final )?[\\w.<>?,\\[\\]]+)\\s+${name}\\s*(?=[=;,)])`, 'g'))) {
        const t = mm[1].replace(/^final /, '');
        if (/,$/.test(t) || /^(?:return|new|else|case|throw|instanceof)$/.test(t)) { continue; }
        out.push(t);
    }
    // an untyped lambda parameter of the same name is a different binding
    if (new RegExp(`(?:\\(|, )${name}\\) ->|(?<![\\w.])${name} ->`).test(window)) { return []; }
    return out;
}

// A Bool field of the TS MarketInterface only holds true/false/null, so `Boolean.TRUE.equals` equals isTrue.
// The receiver must be one local declared once as a Market (MarketInterface, or a Map from this.market/safeMarket).
const J40_MARKET_BOOL_KEYS = new Set ([ 'active', 'spot', 'margin', 'swap', 'future', 'option', 'index', 'stock', 'prediction', 'contract', 'linear', 'inverse', 'quanto', 'percentage', 'tierBased' ]);
function j40MarketBoolRead (e: string, ctx: J40Ctx): boolean {
    const m = /^(?:([A-Za-z_]\w*)|\(\(Map<String, Object>\)([A-Za-z_]\w*)\))\.get\("(\w+)"\)$/.exec (e);
    if (m === null || !J40_MARKET_BOOL_KEYS.has (m[3])) { return false; }
    const name = m[1] ?? m[2];
    const before = ctx.masked.slice (0, ctx.pos);
    const breaks = [ ...before.matchAll (/^[ \t]*(?:public|private|protected)[ \t]/gm) ];
    if (breaks.length === 0) { return false; }
    const window = before.slice (breaks[breaks.length - 1].index);
    if (new RegExp (`(?:\\(|, )${name}\\) ->|(?<![\\w.])${name} ->`).test (window)) { return false; }
    if (new RegExp (`(?<![\\w.])${name}\\s*(?:=(?!=)|\\+=)`).test (window.replace (new RegExp (`(?:MarketInterface|Map<String, Object>) ${name} = `, 'g'), ''))) { return false; }
    const decls = [ ...window.matchAll (new RegExp (`(?:^|[\\s(,])((?:final )?[\\w.<>?,\\[\\]]+(?: <[^>]*>)?)\\s+${name}\\s*(?=[=;,)])`, 'g')) ];
    if (decls.length !== 1) { return false; }
    const init = new RegExp (`(?:MarketInterface|Map<String, Object>) ${name} = (?:\\(\\w+\\) )?this\\.(?:market|safeMarket|parseMarket)\\(`).test (window);
    return init;
}

function j40X14Type (e: string, ctx: J40Ctx): 'boolean' | 'Boolean' | undefined {
    let t = e.trim();
    while (/^\(.*\)$/s.test(t) && j05Close(t, 0) === t.length) { t = t.slice(1, -1).trim(); }
    if (/^[A-Za-z_]\w*$/.test(t)) {
        if (ctx.fields.has(t) || /^(?:true|false|null|this)$/.test(t)) { return t === 'true' || t === 'false' ? 'boolean' : undefined; }
        const decls = j40X14DeclTypes(ctx.masked, t, ctx.pos);
        if (decls.length === 0) { return undefined; }
        if (decls.every((d) => d === 'boolean')) { return 'boolean'; }
        if (decls.every((d) => d === 'boolean' || d === 'Boolean' || d === 'java.lang.Boolean')) { return 'Boolean'; }
        return undefined;
    }
    if (j40MarketBoolRead (t, ctx)) { return 'Boolean'; }
    // requireNonNullElse(<Boolean>, <boolean literal>) is a non-null Boolean
    const r = /^java\.util\.Objects\.requireNonNullElse\(([A-Za-z_]\w*), (?:true|false)\)$/.exec(t);
    if (r !== null && j40X14Type(r[1], ctx) !== undefined) { return 'Boolean'; }
    if (j35JavaBoolean(t) || j40X14TopLogic(t)) { return 'boolean'; }
    return undefined;
}

// a top-level `&&` / `||` (no top-level `?:` or assignment) is a Java boolean: both operands must be boolean
function j40X14TopLogic (e: string): boolean {
    let depth = 0, logic = false;
    for (let k = 0; k < e.length; k++) {
        const c = e[k];
        if (c === '"' || c === '\'') { for (k++; k < e.length && e[k] !== c; k++) if (e[k] === '\\') k++; continue; }
        if (c === '(' || c === '[' || c === '{') depth++;
        else if (c === ')' || c === ']' || c === '}') depth--;
        else if (depth === 0) {
            if (c === '?' || (c === '=' && e[k + 1] !== '=' && !'=!<>'.includes (e[k - 1]))) return false;
            if (e.startsWith ('&&', k) || e.startsWith ('||', k)) logic = true;
        }
        if (depth < 0) return false;
    }
    return logic && depth === 0;
}

function j40X14IsTrue (x: string, ctx: J40Ctx): string | undefined {
    const t = j40X14Type(x, ctx);
    if (t === 'boolean') { return j05IsPrimary(x) ? x : `(${x})`; }
    if (t === 'Boolean') { return `Boolean.TRUE.equals(${x})`; }
    return undefined;
}

function j40X14SelfTest (): string[] {
    const problems: string[] = [];
    const cls = (body: string) => `public class Woo extends WooApi\n{\n    public Object m(Object p, Boolean q, boolean r)\n    {\n${body}\n    }\n}`;
    const cases: [string, string, string | undefined][] = [
        [ 'Boolean param', '        if (Helpers.isTrue(q)) {}', 'if (Boolean.TRUE.equals(q)) {}' ],
        [ 'boolean param', '        if (Helpers.isTrue(r)) {}', 'if (r) {}' ],
        [ 'Boolean local', '        Boolean b = null;\n        if (Helpers.isTrue(b)) {}', 'if (Boolean.TRUE.equals(b)) {}' ],
        [ 'paren Boolean', '        if (Helpers.isTrue((q))) {}', 'if (Boolean.TRUE.equals((q))) {}' ],
        [ 'requireNonNullElse', '        if (Helpers.isTrue(java.util.Objects.requireNonNullElse(q, false))) {}', 'if (Boolean.TRUE.equals(java.util.Objects.requireNonNullElse(q, false))) {}' ],
        [ 'java boolean expr', '        if (Helpers.isTrue(p == null)) {}', 'if ((p == null)) {}' ],
        [ 'TRUE.equals && call', '        if (Helpers.isTrue(Boolean.TRUE.equals(q) && this.inArray(p, p))) {}', 'if ((Boolean.TRUE.equals(q) && this.inArray(p, p))) {}' ],
        [ 'ternary', '        if (Helpers.isTrue(r ? p : q)) {}', undefined ],
        // helper left alone: Object param, Object local, mixed declarations, requireNonNullElse on Object, call result
        [ 'Object param', '        if (Helpers.isTrue(p)) {}', undefined ],
        [ 'Object local', '        Object b = p;\n        if (Helpers.isTrue(b)) {}', undefined ],
        [ 'mixed decls', '        { Object b = p; }\n        Boolean b = q;\n        if (Helpers.isTrue(b)) {}', undefined ],
        [ 'rNNE Object', '        if (Helpers.isTrue(java.util.Objects.requireNonNullElse(p, false))) {}', undefined ],
        [ 'call', '        if (Helpers.isTrue(this.safeBool(p, "a"))) {}', undefined ],
    ];
    for (const [ name, body, expect ] of cases) {
        const out = nativeJavaJ40 (cls (body));
        const ok = expect === undefined ? out === cls (body) : out.includes (expect) && !out.includes ('Helpers.isTrue(') && !out.includes ('switch') && nativeJavaJ40 (out) === out;
        if (!ok) problems.push (`hx5 X14: ${name}\n${out}`);
    }
    return problems;
}

// hx5 X15: J40 literal equality. Exactly two outcomes per Helpers.isEqual site:
// a proven operand type -> plain native `==` / `.equals`; anything else -> the helper call, untouched.
// `==` is only emitted between proven primitives (boxed `==` is reference identity, and the helper
// compares numbers across widths and handles null); `.equals` only on a non-null String receiver.
function j40X15Equal (a: string, b: string, intConsts: Set<string>, ctx: J40Ctx): string | undefined {
    // isEqual(x, null) is x == null for every x
    if (b === 'null') { return `(((Object) (${a})) == null)`; }
    if (a === 'null') { return `(((Object) (${b})) == null)`; }
    const strLit = (t: string) => /^"(?:[^"\\]|\\.)*"$/.test(t);
    // primitive long/int/double: a declared local/param, a numeric literal, a static final int constant,
    // or a `((double) x) op ((double) y)` expression
    const prim = (t: string): boolean => /^-?\d{1,15}L?$/.test(t) || /^\(-?\d{1,15}L?\)$/.test(t)
        || intConsts.has(t)
        || /^[A-Za-z_]\w*$/.test(t) && [ 'long', 'int', 'double', 'short', 'byte' ].includes(j40DeclType(ctx.masked, t, ctx.pos) ?? '')
        || /^\(\(\(double\) \w+\) [-+*/%] \(\(double\) \w+\)\)$/.test(t);
    const isLit = (t: string) => /^\(?-?\d{1,15}L?\)?$/.test(t) || intConsts.has(t);
    if (prim(a) && prim(b) && !(isLit(a) && isLit(b))) { return `(${a} == ${b})`; }
    // the literal is a non-null String receiver; a number-shaped literal is equal to numbers too,
    // so it only goes native against a declared String operand
    const isStr = (t: string) => /^[A-Za-z_]\w*$/.test(t) && j40DeclType(ctx.masked, t, ctx.pos) === 'String';
    if (strLit(b) && !strLit(a) && (j40Unparseable(b) || isStr(a))) { return `${b}.equals(${a})`; }
    if (strLit(a) && !strLit(b) && (j40Unparseable(a) || isStr(b))) { return `${a}.equals(${b})`; }
    return undefined;
}

// hx5 X15: snippet checks (`--audit-string-types --self-test`)
function j40X15SelfTest (): string[] {
    const problems: string[] = [];
    const cls = (body: string) => `public class Woo extends WooApi\n{\n    public Object m(Object p, String s, Long n, long k, double d)\n    {\n${body}\n    }\n}`;
    const cases: [string, string, string | undefined][] = [
        [ 'null', '        if (Helpers.isEqual(p, null)) {}', 'if ((((Object) (p)) == null)) {}' ],
        [ 'long lit', '        if (Helpers.isEqual(k, 5)) {}', 'if ((k == 5)) {}' ],
        [ 'double lit', '        if (Helpers.isEqual(d, 0)) {}', 'if ((d == 0)) {}' ],
        [ 'prim pair', '        if (Helpers.isEqual(k, d)) {}', 'if ((k == d)) {}' ],
        [ 'int local', '        int i = 3;\n        if (Helpers.isEqual(i, TICK_SIZE)) {}', 'if ((i == TICK_SIZE)) {}' ],
        [ 'double expr', '        if (Helpers.isEqual((((double) k) % ((double) d)), 0)) {}', 'if (((((double) k) % ((double) d)) == 0)) {}' ],
        [ 'word lit', '        if (Helpers.isEqual(p, "abc")) {}', 'if ("abc".equals(p)) {}' ],
        [ 'numeric lit vs String', '        if (Helpers.isEqual(s, "1")) {}', 'if ("1".equals(s)) {}' ],
        // helper kept: unproven Object / boxed Long against a literal, numeric-text literal vs Object, Object pair
        [ 'Object int lit', '        if (Helpers.isEqual(p, 5)) {}', undefined ],
        [ 'boxed Long lit', '        if (Helpers.isEqual(n, 5)) {}', undefined ],
        [ 'Object const', '        if (Helpers.isEqual(this.precisionMode, TICK_SIZE)) {}', undefined ],
        [ 'numeric lit vs Object', '        if (Helpers.isEqual(p, "1")) {}', undefined ],
        [ 'Object pair', '        if (Helpers.isEqual(p, n)) {}', undefined ],
    ];
    for (const [ name, body, expect ] of cases) {
        const out = nativeJavaJ40 (cls (body));
        const ok = expect === undefined ? out === cls (body) : out.includes (expect) && !out.includes ('Helpers.') && !out.includes ('switch') && nativeJavaJ40 (out) === out;
        if (!ok) problems.push (`hx5 X15: ${name}\n${out}`);
    }
    return problems;
}

// hx5 X16
// Proof for nativeJavaJ41. Native only when equivalent to the helper:
//  - getIndexOf(s, t) -> s.indexOf(t): s a proven non-null String (literal, or a local declared
//    `String s = "lit"` exactly once in the file and never reassigned), t a string literal (non-null String,
//    so indexOf neither NPEs nor diverges from the helper's String/String branch).
//  - slice(s, b, e) -> s.substring(b[, e]): s a string literal and b/e integer literals (or null end) whose
//    clamped bounds equal the raw ones, so substring cannot throw and returns what Helpers.Slice returns.
// Anything else returns undefined: the helper call stays.
function hx5X16Literal (x: string): string | undefined {
    const m = /^"((?:[^"\\]|\\.)*)"$/.exec(x.trim());
    if (m === null || m[1].includes('\\')) { return undefined; }
    return m[1];
}

function hx5X16StringLocal (name: string, content: string): boolean {
    if (!/^[A-Za-z_]\w*$/.test(name)) { return false; }
    const masked = content.replace(/"(?:[^"\\\n]|\\.)*"/g, '""');
    const decl = new RegExp('(^|[^\\w.])String\\s+' + name + '\\s*=\\s*""\\s*;', 'g');
    const anyDecl = new RegExp('(^|[^\\w.])[\\w.<>,?\\[\\] ]+\\s' + name + '\\s*[=;,):]', 'g');
    const assign = new RegExp('(^|[^\\w.])' + name + '\\s*(=(?!=)|\\+=|\\+\\+|--)', 'g');
    const decls = (masked.match(decl) || []).length;
    if (decls !== 1) { return false; }
    if ((masked.match(anyDecl) || []).length !== 1) { return false; }
    // untyped lambda parameters of the same name would shadow the proof in another scope
    if (new RegExp('(^|[^\\w.])' + name + '\\s*->|[(,]\\s*' + name + '\\s*[,)][^;{]*->').test(masked)) { return false; }
    return (masked.match(assign) || []).length === 1;
}

function hx5X16NonNullString (x: string, content: string): boolean {
    return hx5X16Literal(x) !== undefined || hx5X16StringLocal(x.trim(), content);
}

function hx5X16Native (name: string, args: string[], content: string): string | undefined {
    if (name === 'getIndexOf' && args.length === 2) {
        if (hx5X16Literal(args[1]) === undefined) { return undefined; }
        if (!hx5X16NonNullString(args[0], content)) { return undefined; }
        return args[0] + '.indexOf(' + args[1] + ')';
    }
    if (name === 'slice' && args.length === 3) {
        const s = hx5X16Literal(args[0]);
        if (s === undefined) { return undefined; }
        const len = s.length;
        if (!/^\d+$/.test(args[1])) { return undefined; }
        const b = Number(args[1]);
        if (args[2] === 'null') {
            if (b > len) { return undefined; }
            return args[0] + '.substring(' + b + ')';
        }
        if (!/^\d+$/.test(args[2])) { return undefined; }
        const e = Number(args[2]);
        if (e > len || b > e) { return undefined; }
        return args[0] + '.substring(' + b + ', ' + e + ')';
    }
    return undefined;
}

function hx5X16SelfTest (): string[] {
    const problems: string[] = [];
    const cases: [string, string][] = [
        // unproven receivers keep the helper call verbatim
        [ '        String b = Helpers.slice(id, 0, Helpers.getIndexOf(id, "/"));', '        String b = Helpers.slice(id, 0, Helpers.getIndexOf(id, "/"));' ],
        [ '        String b = Helpers.slice(Helpers.slice(h, -64, null), 1, null);', '        String b = Helpers.slice(Helpers.slice(h, -64, null), 1, null);' ],
        [ '        if (Helpers.getIndexOf(topic, (keys == null ? null : keys.get(i))) >= 0) {}', '        if (Helpers.getIndexOf(topic, (keys == null ? null : keys.get(i))) >= 0) {}' ],
        // a reassigned String local is not proven
        [ '        String d = "0123";\n        d = x;\n        int v = Helpers.getIndexOf(d, "1");', 'Helpers.getIndexOf(d, "1")' ],
        // a same-named lambda parameter elsewhere defeats the proof
        [ '        String d = "0123";\n        f((d) -> Helpers.getIndexOf(d, "1"));', 'Helpers.getIndexOf(d, "1")' ],
        // non-literal target stays (null target / non-String target differ from indexOf)
        [ '        String d = "0123";\n        int v = Helpers.getIndexOf(d, c);', 'Helpers.getIndexOf(d, c)' ],
        // proven: single-assignment String local + literal target
        [ '        String d = "0123";\n        int v = Helpers.getIndexOf(d, "1");', 'int v = d.indexOf("1");' ],
        [ '        int v = Helpers.getIndexOf("abc", "b");', 'int v = "abc".indexOf("b");' ],
        // literal slices with in-range bounds
        [ '        String v = Helpers.slice("abcdef", 1, 3);', 'String v = "abcdef".substring(1, 3);' ],
        [ '        String v = Helpers.slice("abcdef", 2, null);', 'String v = "abcdef".substring(2);' ],
        // out-of-range / negative bounds stay (helper clamps, substring throws)
        [ '        String v = Helpers.slice("abc", 1, 9);', 'Helpers.slice("abc", 1, 9)' ],
        [ '        String v = Helpers.slice("abc", -2, null);', 'Helpers.slice("abc", -2, null)' ],
        // masked text untouched
        [ '        // Helpers.slice(a, 0, 1)', '// Helpers.slice(a, 0, 1)' ],
        [ '        String q = "Helpers.slice(a, 0, 1)";', '"Helpers.slice(a, 0, 1)"' ],
    ];
    for (const [ body, expect ] of cases) {
        const out = nativeJavaJ41 (body);
        const again = nativeJavaJ41 (out);
        if (!out.includes (expect) || again !== out || /hx4J41|java\.util\.function/.test (out)) problems.push (`hx5 X16: ${body}\n${out}`);
    }
    return problems;
}

// hx5 X17: Helpers.parseInt/parseFloat only become native when the operand's Java type makes the
// result identical to Helpers.toLong/toDouble under the helper's catch-all (parseInt: failure -> null;
// parseFloat: failure or null -> 0.0). A String operand is NEVER made native: Long.parseLong /
// Double.parseDouble throw where the helper returns null / 0.0. Unproven -> the helper call stays.
function x17J42Native (name: string, x: string, content: string, at: number): string | undefined {
    const lit = /^"(-?(?:0|[1-9]\d{0,17}))"$/.exec(x);
    if (lit !== null) { return name === 'parseInt' ? `Long.valueOf(${lit[1]}L)` : `Double.valueOf(${lit[1]}.0)`; }
    const dec = /^"(-?(?:0|[1-9]\d{0,14})\.\d{1,15})"$/.exec(x);
    if (dec !== null && name === 'parseFloat') { return `Double.valueOf(${dec[1]})`; }
    if (!/^[A-Za-z_]\w*$/.test(x)) { return undefined; }
    const type = x17J42DeclaredType(content, at, x);
    if (type === undefined) { return undefined; }
    if (name === 'parseInt') {
        if (type === 'Long') { return x; } // toLong(null) throws -> null, toLong(Long) is identity
        if (type === 'long' || type === 'int') { return `Long.valueOf(${x})`; }
        if (type === 'double' || type === 'float') { return `Long.valueOf((long) ${x})`; } // == Double.longValue (NaN -> 0)
        return undefined;
    }
    if (type === 'double') { return `Double.valueOf(${x})`; }
    if (type === 'long' || type === 'int' || type === 'float') { return `Double.valueOf((double) ${x})`; }
    return undefined;
}

// hx5 X17: the declared Java type of `name` at `at`: the nearest local declaration above in the same
// member, else the member's parameter list. Java's static typing makes that declaration sound.
function x17J42DeclaredType (content: string, at: number, name: string): string | undefined {
    const lines = content.slice(0, at).split('\n');
    const decl = new RegExp('^\\s*(?:final\\s+)?([A-Za-z_][\\w.<>?, ]*?)\\s+' + name + '\\s*(?:=|;)');
    for (let i = lines.length - 1; i >= 0; i--) {
        const line = i === lines.length - 1 ? '' : lines[i];
        const m = decl.exec(line);
        if (m !== null) { return m[1]; }
        if (/^    (?:public|private|protected)\b/.test(lines[i])) {
            const sig = lines.slice(i, lines.length - 1).join(' ');
            const params = /\(([^)]*)\)/.exec(sig);
            if (params === null) { return undefined; }
            for (const p of params[1].split(',')) {
                const pm = /^\s*(?:final\s+)?([\w.]+)\s+(\w+)\s*$/.exec(p);
                if (pm !== null && pm[2] === name) { return pm[1]; }
            }
            return undefined;
        }
    }
    return undefined;
}

// hx5 X21: Object locals proven String (base `: Str` producers) / Map (venue `: Dict` omit/fresh-map
// callees) print their concrete type; any unproven write or producer keeps Object
function x21SelfTest (): string[] {
    const problems: string[] = [];
    const probe = path.join(process.cwd(), 'ts', 'src', `zzx21selftest${process.pid}.ts`);
    const body = [
        "import Exchange from './abstract/binance.js';",
        "import type { Dict } from './base/types.js';",
        'export default class zzx21selftest extends Exchange {',
        "    zzxClean (params: Dict = {}): Dict { const zzo: Dict = this.omit (params, [ 'type', 'settle' ]); return zzo; }",
        "    zzxRoute (methodName: string, params: Dict): Dict { const [ route, paramsResolved ] = this.handleOptionAndParams (params, methodName, 'route', 'auto'); return this.omit (paramsResolved, [ 'route' ]); }",
        "    zzxLoose (params: Dict = {}): Dict { return params; }",
        "    ctp (code: string, fee: any) { let a = this.currencyToPrecision (code, fee); if (a === undefined) { a = '0'; } return { 'a': a }; }",
        "    pp (p: any) { const b = this.parsePrecision (this.safeString (p, 'x')); return [ b ]; }",
        "    mixed (code: string, fee: any, p: any) { let c = this.currencyToPrecision (code, fee); c = this.safeValue (p, 'x'); return [ c ]; }",
        "    cl () { const q = {}; const d = this.zzxClean (q); return this.extend (d, {}); }",
        "    rt () { const q = {}; const e = this.zzxRoute ('fetchX', q); return this.extend (e, {}); }",
        "    lo () { const q = {}; const f = this.zzxLoose (q); return this.extend (f, {}); }",
        '}',
    ].join('\n');
    try {
        fs.writeFileSync(probe, body);
        const out = new NewTranspiler().transpiler.transpileJavaByPath(probe).content as string;
        if (!/String a = \(String\) this\.currencyToPrecision\(/.test(out)) problems.push("x21: 'a' (currencyToPrecision + literal write) must print String with a checkcast");
        if (!/String b = \(String\) this\.parsePrecision\(/.test(out)) problems.push("x21: 'b' (parsePrecision) must print String");
        if (!/Map<String, Object> d = /.test(out)) problems.push("x21: 'd' (venue omit-of-Map-param callee) must print Map");
        if (!/Map<String, Object> e = /.test(out)) problems.push("x21: 'e' (venue omit-of-handle-element-1 callee) must print Map");
        // hx10 w4 PJ03 types a venue method's proven Dict return, so a local off zzxLoose is a Map too
        if (!/Map<String, Object> f = /.test(out)) problems.push("x21: 'f' (venue Dict-returning callee) must print Map");
        for (const name of [ 'c' ]) {
            if (!new RegExp(`\\bObject ${name} = `).test(out)) problems.push(`x21: '${name}' has an unproven write/producer and must stay Object`);
        }
        if (problems.length) problems.push('x21 output:\n' + out);
    } catch (e: any) {
        problems.push(`x21 self-test threw: ${e.message}`);
    } finally {
        fs.rmSync(probe, { force: true });
    }
    return problems;
}

// hx5 X22
// Helpers.GetValue / Helpers.addElementToObject inside nativeJavaJ39Containers. Exactly two outcomes per site:
//   * receiver + key proven -> the plain Map/List op (`m.get(k)`, `m.put(k, v);`, `l.get(N)`), with only the null
//     guard the helper's own contract needs (GetValue answers null for a null receiver / key / out-of-range index);
//   * anything else -> the helper call, untouched. The hx4 J39 inline blobs (pattern-match + synchronized
//     ConcurrentHashMap null-remove replay) are gone.
// put is native only on a FRESH local (every write is `new [Linked]HashMap<String, Object>(...)`, not a parameter):
// such a map is never a ConcurrentHashMap (put(k, null) would throw where the helper removes), never null, and
// unshared, so the helper's `synchronized (m)` pairing with objectKeys has no reader. Fields (this.options is a
// ConcurrentHashMap; this.urls / this.has are read by other threads) always keep the put helper.
function x22MapRewrite (helper: string, args: string[], statement: boolean, declaredType: (name: string) => string | undefined, member: string): string | undefined {
    const ident = (e: string) => /^[A-Za-z_]\w*$/.test (e) && !/^(?:this|null|true|false|new)$/.test (e);
    const strLit = (e: string) => /^"(?:[^"\\]|\\.)*"$/.test (e);
    const isMap = (t: string | undefined) => /^(?:java\.util\.)?(?:Map|HashMap|LinkedHashMap)<String, Object>$/.test (t ?? '');
    const isList = (t: string | undefined) => /^(?:java\.util\.)?(?:List|ArrayList)<Object>$/.test (t ?? '');
    const stringKey = (k: string) => strLit (k) || (ident (k) && declaredType (k) === 'String');
    const sig = member.slice (0, member.indexOf ('\n') === -1 ? member.length : member.indexOf ('\n')).replace (/\{.*$/, '');
    const fresh = (n: string): boolean => {
        if (new RegExp (`[(,]\\s*(?:final )?[\\w.]+(?:<[\\w.<>, ?]*>)? ${n}\\s*[,)]`).test (sig)) return false;
        // any lambda / anonymous class mentioning it, or a compound write, vetoes
        let writes = 0;
        for (const m of member.matchAll (new RegExp (`(?<![\\w.])${n}\\s*(=(?!=)|\\+=|\\+\\+|--)`, 'g'))) {
            if (m[1] !== '=') return false;
            const rhs = member.slice (m.index! + m[0].length).trimStart ();
            if (!/^new (?:java\.util\.)?(?:Linked)?HashMap<(?:String, Object)?>\(/.test (rhs)) return false;
            writes++;
        }
        return writes > 0;
    };
    if (helper === 'GetValue' && args.length === 2 && !statement) {
        const [ t, k ] = args;
        const fieldMap = /^this\.([A-Za-z_]\w*)$/.exec (t);
        // GetValue does not synchronize: a plain get on a declared-Map base field is the same read
        // markets_by_id is volatile and reset to null by other threads: the guard's double read could NPE, keep the helper
        const mapRecv = (ident (t) && isMap (declaredType (t))) || (fieldMap !== null && fieldMap[1] !== 'markets_by_id' && j39MapFields ().has (fieldMap[1]));
        if (mapRecv && stringKey (k)) {
            const recvNonNull = ident (t) && fresh (t);
            // HashMap.get(null) answers null; a possibly-concurrent map throws, so guard an identifier key
            const keyNull = strLit (k) || recvNonNull ? '' : `${k} == null`;
            const recvNull = recvNonNull ? '' : `${t} == null`;
            const guard = [ recvNull, keyNull ].filter ((g) => g !== '').join (' || ');
            return guard === '' ? `${t}.get(${k})` : `(${guard} ? null : ${t}.get(${k}))`;
        }
        if (ident (t) && isList (declaredType (t)) && /^\d+L?$/.test (k)) {
            const n = k.replace (/L$/, '');
            return `(${t} == null || ${n} >= ${t}.size() ? null : ${t}.get(${n}))`;
        }
        return undefined;
    }
    if (helper === 'addElementToObject' && args.length === 3 && statement) {
        const [ t, k, v ] = args;
        if (ident (t) && isMap (declaredType (t)) && stringKey (k) && fresh (t)) return `${t}.put(${k}, ${v});`;
        return undefined;
    }
    return undefined;
}

// hx5 X22: snippet checks (`--audit-string-types --self-test`)
function x22SelfTest (): string[] {
    const problems: string[] = [];
    const cls = (body: string) => `public class Woo extends WooApi\n{\n    public Object m(Map<String, Object> p, Object o, String s, List<Object> l)\n    {\n${body}\n    }\n}`;
    const cases: [string, string, string | undefined][] = [
        // native: plain op on a proven receiver + key
        [ 'get map param lit', '        return Helpers.GetValue(p, "a");', '        return (p == null ? null : p.get("a"));' ],
        [ 'get map param String key', '        return Helpers.GetValue(p, s);', '        return (p == null || s == null ? null : p.get(s));' ],
        [ 'get fresh local', '        Map<String, Object> r = new HashMap<String, Object>() {{}};\n        return Helpers.GetValue(r, s);', '        return r.get(s);' ],
        [ 'get field', '        return Helpers.GetValue(this.urls, "api");', '        return (this.urls == null ? null : this.urls.get("api"));' ],
        [ 'get list', '        return Helpers.GetValue(l, 0);', '        return (l == null || 0 >= l.size() ? null : l.get(0));' ],
        [ 'put fresh local nullable', '        Map<String, Object> r = new HashMap<String, Object>() {{}};\n        Helpers.addElementToObject(r, s, o);', '        r.put(s, o);' ],
        // helper kept: ConcurrentHashMap / shared field puts, unproven receiver, Object key, non-fresh map, list put
        [ 'put options field', '        Helpers.addElementToObject(this.options, s, null);', undefined ],
        [ 'put urls field', '        Helpers.addElementToObject(this.urls, "a", o);', undefined ],
        [ 'put param map', '        Helpers.addElementToObject(p, "a", o);', undefined ],
        [ 'put safeDict local', '        Map<String, Object> r = (Map<String, Object>) this.safeDict(o, "x");\n        Helpers.addElementToObject(r, "a", o);', undefined ],
        [ 'put reassigned local', '        Map<String, Object> r = new HashMap<String, Object>() {{}};\n        r = this.extend(r, o);\n        Helpers.addElementToObject(r, "a", o);', undefined ],
        [ 'put Object key', '        Map<String, Object> r = new HashMap<String, Object>() {{}};\n        Helpers.addElementToObject(r, o, o);', undefined ],
        [ 'get Object receiver', '        return Helpers.GetValue(o, "a");', undefined ],
        [ 'get Object key', '        return Helpers.GetValue(p, o);', undefined ],
        [ 'get list var index', '        return Helpers.GetValue(l, s);', undefined ],
        [ 'get options id key', '        return Helpers.GetValue(this.options, o);', undefined ],
    ];
    for (const [ name, body, expect ] of cases) {
        const out = nativeJavaJ39Containers (cls (body));
        const ok = expect === undefined ? out === cls (body) : out.includes (expect) && !/j39|switch|synchronized/.test (out);
        if (!ok) problems.push (`hx5 X22: ${name}\n${out}`);
        if (nativeJavaJ39Containers (out) !== out) problems.push (`hx5 X22: ${name} not idempotent`);
    }
    return problems;
}

// hx10 wave-2 J03: native isTrue/isEqual/add/subtract/multiply/divide from statically known types
// (`--audit-string-types --self-test`). Text cases exercise the printed-type proofs one rule at a
// time; the probe exercises the printer rule for a `boolean`/`Bool` parameter condition.
function j03FamilySelfTest (): string[] {
    const problems: string[] = [];
    {
        const cls = (body: string) => `    public Object m (Object q)\n    {\n${body}\n    }\n`;
        const withDecls = (decls: string, body: string) => `    public Object m (Object q)\n    {\n${decls}\n${body}\n    }\n`;
        const run = (decls: string, body: string) => nativeJavaJ03Family (withDecls (decls, body));
        const cases: [string, string, string, string | undefined][] = [
            // arithmetic: the declared box is the proof, the helper's null arm becomes an explicit ternary
            [ 'multiply Long x Long', '        Long a = this.safeInteger(q, "a");\n        Long b = this.safeInteger(q, "b");', '        Object r = Helpers.multiply(a, b);', 'Object r = ((a == null || b == null) ? null : (a * b));' ],
            [ 'multiply Long x int literal', '        Long p = this.safeInteger(q, "p");', '        Object r = Helpers.multiply(p, 20);', '((p == null) ? null : (p * 20L))' ],
            [ 'multiply Integer widened', '        Integer n = this.safeInteger(q, "n");', '        Object r = Helpers.multiply(n, 16L);', '(((long) n) * 16L)' ],
            [ 'subtract Double pair', '        Double a = this.safeFloat(q, "a");\n        Double b = this.safeFloat(q, "b");', '        Object r = Helpers.subtract(a, b);', '((a == null || b == null) ? null : (a - b))' ],
            [ 'divide Long pair', '        Long a = this.safeInteger(q, "a");\n        Long b = this.safeInteger(q, "b");', '        Object r = Helpers.divide(a, b);', '(((double) a) / ((double) b))' ],
            [ 'add Long pair', '        Long a = this.safeInteger(q, "a");\n        Long b = this.safeInteger(q, "b");', '        Object r = Helpers.add(a, b);', '((a == null || b == null) ? null : (a + b))' ],
            [ 'add String plus literal', '        String id = "x";', '        Object r = Helpers.add(this.id, " redeem");', '(this.id + " redeem")' ],
            // isEqual: same declared family -> Objects.equals (never reference `==` on boxes)
            [ 'isEqual Long pair', '        Long a = this.safeInteger(q, "a");\n        Long b = this.safeInteger(q, "b");', '        Object r = Helpers.isEqual(a, b);', 'java.util.Objects.equals(a, b)' ],
            [ 'isEqual String pair', '        String a = this.safeString(q, "a");\n        String b = this.safeString(q, "b");', '        Object r = Helpers.isEqual(a, b);', 'java.util.Objects.equals(a, b)' ],
            [ 'isEqual null', '        Long a = this.safeInteger(q, "a");', '        Object r = Helpers.isEqual(a, null);', '(a == null)' ],
            // isTrue: a declared boolean is the condition, a Boolean box is the null-safe TRUE test
            [ 'isTrue boolean', '        boolean f = java.util.Objects.equals(q, "f");', '        if (Helpers.isTrue(f)) { }', 'if (f)' ],
            [ 'isTrue Boolean', '        Boolean f = (Boolean) this.safeBool(q, "f", false);', '        if (Helpers.isTrue(f)) { }', 'Boolean.TRUE.equals(f)' ],
            // negatives: an unproven box keeps the plain helper call
            [ 'multiply Double', '        Double a = this.safeFloat(q, "a");\n        Double b = this.safeFloat(q, "b");', '        Object r = Helpers.multiply(a, b);', undefined ],
            [ 'subtract mixed integral', '        Long a = this.safeInteger(q, "a");\n        Integer b = this.safeInteger2(q, "b");', '        Object r = Helpers.subtract(a, b);', undefined ],
            [ 'add String x Double', '        Double d = this.safeFloat(q, "d");', '        Object r = Helpers.add(d, "1");', undefined ],
            [ 'isEqual String x number', '        String s = this.safeString(q, "s");', '        Object r = Helpers.isEqual(s, 1);', undefined ],
            [ 'isEqual Long x Integer', '        Long a = this.safeInteger(q, "a");\n        Integer b = this.safeInteger2(q, "b");', '        Object r = Helpers.isEqual(a, b);', undefined ],
            [ 'isTrue Object', '        Object c = this.safeValue(q, "c");', '        if (Helpers.isTrue(c)) { }', undefined ],
            [ 'multiply ternary arm', '        Long a = this.safeInteger(q, "a");\n        Long b = this.safeInteger(q, "b");', '        Object r = (a == null) ? Helpers.multiply(a, b) : q;', undefined ],
            [ 'multiply other-method local', '        Long a = this.safeInteger(q, "a");\n        Long b = this.safeInteger(q, "b");', '        Object r = Helpers.multiply(a, b);', undefined ],
        ];
        for (const [ name, decls, body, expect ] of cases) {
            const source = name === 'multiply other-method local'
                ? `    public Object other (Object q)\n    {\n${decls}\n    }\n\n    public Object m (Object q)\n    {\n        Object r = Helpers.multiply(a, b);\n    }\n`
                : withDecls (decls, body);
            const out = nativeJavaJ03Family (source);
            const ok = expect === undefined ? out === source : out.includes (expect);
            if (!ok) problems.push (`hx10 J03: ${name}\n${out}`);
            if (nativeJavaJ03Family (out) !== out) problems.push (`hx10 J03: ${name} not idempotent`);
        }
        // a comment or a string holding a helper call is not a call site
        const commented = cls ('        // Helpers.multiply(a, b)\n        Object r = "Helpers.add(x, y)";');
        if (nativeJavaJ03Family (commented) !== commented) problems.push ('hx10 J03: a comment/string was rewritten');
    }
    const probe = path.join (process.cwd (), 'ts', 'src', `zzj03selftest${process.pid}.ts`);
    const body = [
        "import Exchange from './abstract/binance.js';",
        'export default class zzj03selftest extends Exchange {',
        '    j03Condition (flag = false, raw: any) { let r = 0; if (flag) { r = 1; } if (raw) { r = 2; } return r; }',
        '    j03Written (flag = false) { flag = this.safeBool ({}, "k", false); if (flag) { return 1; } return 0; }',
        '}',
    ].join ('\n');
    try {
        fs.writeFileSync (probe, body);
        const out = new NewTranspiler ().transpiler.transpileJavaByPath (probe).content as string;
        if (process.env['J03_DUMP'] !== undefined) fs.writeFileSync (process.env['J03_DUMP'], out);
        if (!/public Object j03Condition\(Object flag, Object raw\)/.test (out)) problems.push ('hx10 J03: the probe signature changed');
        if (!/TRUE\.equals\(java\.util\.Objects\.requireNonNullElse\(flag, false\)\)/.test (out)) problems.push ('hx10 J03: a boolean parameter condition must print the null-safe TRUE test');
        if (!/Helpers\.isTrue\(raw\)/.test (out)) problems.push ('hx10 J03: an `any` parameter must keep the helper');
        const written = out.slice (out.indexOf ('j03Written'));
        if (written.includes ('TRUE.equals(')) problems.push ('hx10 J03: a parameter the body writes must keep the helper');
    } catch (e: any) {
        problems.push (`hx10 J03 self-test threw: ${e.message}`);
    } finally {
        fs.rmSync (probe, { force: true });
    }
    return problems;
}
