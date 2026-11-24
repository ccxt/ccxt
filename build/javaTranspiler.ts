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
import errorHierarchy from '../js/src/base/errorHierarchy.js'
import Piscina from 'piscina';
import os from 'os';
import { execFileSync } from 'child_process';
import { isMainEntry } from "./transpile.js";
import { filterDirtyExchangeFiles, skipUpToDateStage, testStageInputs } from "./transpile.js";
import { unCamelCase } from "../js/src/base/functions.js";
import { ts } from './csharp-local-types.js';
import { installJavaLocalTypes, installJavaNumericLocalTypes, patchJavaLiteralLocalTypes, elementAccessHasStringElements, JAVA_STRING_RETURN_METHODS, JAVA_STRING_PARAM_POSITIONS, javaStringParamPositions, patchJavaConsumerStringCasts, patchJavaMapChannelStringCasts, patchJavaStringReceiverCasts, installJavaDeclaredLocalTypes, installJavaObjectParamPositions, installJavaStringListParamTypes, installJavaNullScalarLocalTypes, javaVenueAsyncReturnTable, javaIsTypedMapDto, patchJavaOmitLocalTypes, patchJavaQualifiedDtoListElementLocals, patchJavaStringAccumulatorLists, patchJavaRowAccumulatorLists, patchJavaTupleHolderElementLocals, patchJavaOrderBookCacheLocals, patchJavaDeclaredMapReceiverCasts, patchJavaBaseMapFieldReceiverCasts, nativeJavaLongLimitLocals, patchJavaFreshMapElementWrites, patchJavaDeclaredBoxLiteralEquality, patchJavaObjectKeysLength, patchJavaMapArgIdentity, patchJavaNonNullStringLocals, patchJavaNonNullLongSubtract, installJavaBooleanParams, installJavaStringDefaultParams, installJavaTuplePairReturns, installJavaStringListArgs, installJavaBooleanFixedParams, installJavaBooleanWriteLocals, javaBooleanLocalWrite, installJavaLongSlots, installJavaMapLocals, patchJavaUntilOmitMapWrites, installJavaNativeReplace, installJavaStringReturnSites, resetJavaVenueIndexes, javaVenueTupleCoreProven, javaVenueFileAsyncReturns, javaVenueDtoListInfo } from './java-local-types.js';
import { installJavaFreshObjectMapWrites } from './java-local-types.js';
import { nativeJavaEqualTruthy } from './java-local-types.js';
import { nativeJavaParamCompare } from './java-local-types.js';
import { nativeJavaTypedArithmetic, nativeJavaPrimitiveArithmetic, nativeJavaNumericLocalsRetype, nativeJavaSumLongLocals } from './java-local-types.js';
import { nativeJavaIntegralMultiplySubtract, nativeJavaNumberDivModNeg, nativeJavaInlineDivModNeg, nativeJavaLongBoxLocals } from './java-local-types.js';
import { installJavaStringCoreArgs } from './java-local-types.js';
import { installJavaNativePadStartFirst, installJavaLiteralReplace } from './java-local-types.js';
import { installJavaCounterTypes } from './java-local-types.js';
import { installJavaMapLocalTypes } from './java-local-types.js';
import { installJavaParamTypes } from './java-local-types.js';
import { installJavaMapArgAlreadyTyped } from './java-local-types.js';
import { installJavaTypedBaseFields } from './java-local-types.js';
import { installJavaListLocals } from './java-local-types.js';
import { installJavaJ8CopyLocals } from './java-local-types.js';
import { installJavaR84j1StringElementLocals, installJavaR84j1BoxElementLocals } from './java-local-types.js';
import { installJavaH26j01MapRowLists } from './java-local-types.js';
import { installJavaR84j2ContainerLocals } from './java-local-types.js';
import { installJavaR84j2GuardedListLocals } from './java-local-types.js';
import { installJavaR84j2MapConditionalLocals } from './java-local-types.js';
import { installJavaR84j8Locals } from './java-local-types.js';
import { installJavaR87j2WsLocals } from './java-local-types.js';
import { installJavaR87j2UrlLocals } from './java-local-types.js';
import { installJavaR87j3SumCounterLocals } from './java-local-types.js';
import { installJavaR90j3NativeSumLocals } from './java-local-types.js';
import { installJavaR90j3CounterLoops } from './java-local-types.js';
import { installJavaR87j4SplitLists } from './java-local-types.js';
import { installJavaR87j5CalleeStringArgs } from './java-local-types.js';
import { installJavaR87j8CopyStringResolver } from './java-local-types.js';
import { installJavaR90j2ElementListLocals } from './java-local-types.js';
import { installJavaR90j2PromiseAllLocals } from './java-local-types.js';
import { installJavaR90j2ElementMapLocals } from './java-local-types.js';
import { installJavaR90j6StringListReaders } from './java-local-types.js';
import { installJavaR90j6AsStringListReaders } from './java-local-types.js';
import { installJavaR90j6PairLocals } from './java-local-types.js';
import { installJavaR90j6ListCopyLocals } from './java-local-types.js';
import { installJavaR90j7MapDelete } from './java-local-types.js';
import { installJavaR92j3LongDefaultParams } from './java-local-types.js';
import { installJavaR92j3LongFixedParams } from './java-local-types.js';
import { installJavaR92j3ParseToIntCompare } from './java-local-types.js';
import { installJavaR92j3SafeIntegerOperands } from './java-local-types.js';
import { installJavaR92j3HexStringCalls } from './java-local-types.js';
import { installJavaR90j8OmitParamLocals } from './java-local-types.js';
import { installJavaR92j1AssertedStringLocals } from './java-local-types.js';
import { installJavaR92j1StringRowLocals } from './java-local-types.js';
import { installJavaR92j2MarketTypeParams, installJavaTypedDefaultReaders } from './java-local-types.js';
import { installJavaR92j2MapSlotHandOff } from './java-local-types.js';
import { installJavaR92j2StringSlotLocals } from './java-local-types.js';
import { installJavaR93j2ListLocals } from './java-local-types.js';
import { installJavaBaseMapCallReturns } from './java-local-types.js';
import { installJavaBaseMapReturnSites } from './java-local-types.js';
import { installJavaScalarLocals } from './java-local-types.js';
import { installJavaParamTypesPreScan } from './java-local-types.js';
import { installJavaStringReturns } from './java-local-types.js';
import { installJavaPredictionMapLocals } from './java-local-types.js';
import { installJavaListParamSlots } from './java-local-types.js';
import { installJavaEventsParamsSlots, installJavaCurrenciesByIdReads, installJavaSourceExchangeReads, installJavaTypedOrderbooksField, installJavaNullSeedStructureLocals } from './java-local-types.js';
import { installJavaNonNullMapPuts } from './java-local-types.js';
import { installJavaLocalElementWrites } from './java-local-types.js';
import { installJavaStringListIndexOf } from './java-local-types.js';
import { installJavaMapCopyLocals } from './java-local-types.js';
import { installJavaR77j2ConditionalLocals } from './java-local-types.js';
import { installJ6ReaderLocals } from './java-local-types.js';
import { installJ84j6TrueOnlyLocals } from './java-local-types.js';
import { installJ84j6StringListLocals } from './java-local-types.js';
import { javaCoreBaseTierSpellings } from './java-local-types.js';
import { javaBaseMapCallReturnTable } from './java-local-types.js';
import { isTsIndexSource, readTsIndexSource } from './csharp-local-types.js';
import { ZERO_REQUIRED_TYPED_WHITELIST } from "./generateJavaWrappers.js";
import { typeCoreReturns, typedReturnTable, JAVA_ASYNC_SUPPLIER, JAVA_ASYNC_SUPPLIER_IMPORT, isAsyncLambdaClose, javaTypedCoreDirectReturnSelfTest } from "./javaTypedCore.js";
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
        content = nativeJavaStringAdd(content);
        content = applyJavaImports(path.includes('/java/lib/') ? nativeJavaCoreArgHelpers(content) : content);
        if (path.includes('/java/lib/')) { content = nativeJavaPaginationCursorPuts(content); } // pagination cursor puts, after the final element-write passes
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

const EXCHANGE_WRAPPER_FOLDER = './java/lib/src/main/java/io/github/ccxt/'
const ERRORS_FOLDER = './java/lib/src/main/java/io/github/ccxt/errors/';
const BASE_METHODS_FILE = './java/lib/src/main/java/io/github/ccxt/BaseExchange.java';
// hand-written above the delimiter of BaseExchange.java with typed Pair returns
const JAVA_HAND_WRITTEN_PAIR_METHODS = [
    'handleOptionStringAndParams', 'handleOptionStringAndParams2', 'handleOptionBoolAndParams', 'handleOptionBoolAndParams2',
    'handleMarginModeAndParams', 'handleMarketTypeAndParams', 'handleSubTypeAndParams', 'handleUntilOption', 'handlePostOnly',
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
const BASE_TESTS_FOLDER = 'java/tests/src/main/java/tests/base/';
const BASE_TESTS_FILE = './java/tests/src/main/java/tests/exchange/TestMain.java';
const EXCHANGE_BASE_FOLDER = './java/tests/src/main/java/tests/exchange/';
const EXCHANGE_GENERATED_FOLDER = './java/tests/src/main/java/tests/exchange/';

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
function retypeCodeOnly (line: string, inComment = false): [string, boolean] {
    let out = '';
    let i = 0;
    while (i < line.length) {
        if (inComment) {
            const j = line.indexOf ('*/', i);
            if (j === -1) return [out, true];
            i = j + 2; inComment = false; continue;
        }
        const c = line[i];
        if (line.startsWith ('//', i)) break;
        if (line.startsWith ('/*', i)) {
            const j = line.indexOf ('*/', i + 2);
            if (j === -1) { inComment = true; break; }
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
    return [out, inComment];
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
    // Guarded native replaceFirst is a String (null arm included)
    if ((token === 'String' || token === 'java.lang.String') && /^\(([\w$.]+) == null \? null : \(\(String\)\1\)\.replaceFirst\(/.test (value)) return true;
    if (value.indexOf ('+') !== -1 && /"/.test (value)) return true;
    return false;
}

// a later declaration of the same name is a DIFFERENT variable (Java forbids
// redeclaring a name in one scope), so its LHS is not a use of the hoisted name.
function retypeDeclaresName (code: string, name: string): boolean {
    return new RegExp (`^\s*(?:final\s+)?[A-Za-z_$][\w$.]*(?:<[^;=]*>)?(?:\[\])*\s+${name}\s*(?:=|;)`).test (code);
}

function retypeUseIsAudited (line: string, name: string, token?: string): boolean {
    const [code] = retypeCodeOnly (line);
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
        const [code, open] = retypeCodeOnly (line, inComment);
        inComment = open;
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
const WS_FUTURE_TYPE = 'io.github.ccxt.ws.Future';
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
                return false;
            }
        }
        if (ts.isSpreadElement (parent)) {
            return false;
        }
        if (ts.isTypeOfExpression (parent)) {
            return false; // `typeof x === 'number'` prints `x instanceof Long`: inconvertible for a String
        }
        if (ts.isArrayLiteralExpression (parent) && ts.isBinaryExpression (parent.parent)
            && parent.parent.left === parent && parent.parent.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
            return false; // `[x, y] = f()` prints `x = ((List) tmp).get(i)`
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
                    return false;
                }
            } else if (op >= ts.SyntaxKind.FirstCompoundAssignment && op <= ts.SyntaxKind.LastCompoundAssignment) {
                return false;
            }
        }
        // A pro core extends the REST *wrapper* class, whose typed overloads
        // (`Ticker fetchTicker(String symbol)`) would win Java overload resolution
        // over the `Object...` core once an argument expression is a String. Keep
        // any local that feeds such a call `Object` (directly or nested — e.g.
        // `Helpers.add(String, String)` also returns String) so the call keeps
        // binding to the core.
        if (isProFile && feedsInheritedAsyncCall (printer, n, scope)) {
            return false;
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
        return undefined;
    }
    return 'String';
}

// venue-local async cores (java-local-types section 12) join the unified table; base names never collide
function withVenueAsyncReturns (table: Map<string, any>, tsPath?: string): Map<string, any> {
    const merged = new Map(table);
    for (const [name, info] of (tsPath === undefined ? new Map() : javaVenueFileAsyncReturns(tsPath))) {
        if (!merged.has(name)) merged.set(name, info);
    }
    for (const [name, javaReturnType] of javaVenueAsyncReturnTable()) {
        if (!merged.has(name)) merged.set(name, { name, javaReturnType, isArray: false, returnsProven: javaVenueTupleCoreProven(name), ...javaVenueDtoListInfo(javaReturnType) });
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
            // padStart the printer emits as its native `(len >= n ? ..substring(..) : String.format(..)
            // .replace(..) + recv)` ternary: both arms are Strings; the Helpers.padStart form is not claimed
            if (name === 'padStart' && current.arguments?.length === 2) {
                try {
                    const printed = printer.printNode (current, 0);
                    if (typeof printed === 'string' && printed.startsWith ('(') && printed.includes ('.length() >= ')
                        && printed.includes ('String.format(') && !printed.includes ('Helpers.')) {
                        return 'String';
                    }
                } catch (e) {
                    return undefined;
                }
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

// Whole-repo facts about a method name for printer.javaBaseListParameterTypeOf (the base-tier program
// holds ts/src/base/Exchange.ts and its imports, never the venues). Plain data only, every judgement stays in the
// printer: how many ts/src declarations carry the name, whether a non-call `.name` reference or a string literal
// mentions it, whether the hand-written Java above the transpile delimiters calls it, and the argument nodes of
// every `this.name (..)` call outside the declaring file. Installed in the main thread and in every worker.
let javaRepoMethodIndex: any;
// an unannotated async method whose returns (outside nested functions) carry no value
function javaIsAsyncVoidMethod (n: any): boolean {
    if (!ts.isMethodDeclaration (n) || n.body === undefined || n.type !== undefined || !(n.modifiers ?? []).some ((m: any) => m.kind === ts.SyntaxKind.AsyncKeyword)) {
        return false;
    }
    let valued = false;
    const visit = (c: any) => {
        if (valued || ts.isFunctionLike (c)) {
            return;
        }
        if (ts.isReturnStatement (c) && c.expression !== undefined) {
            valued = true;
            return;
        }
        c.forEachChild (visit);
    };
    n.body.forEachChild (visit);
    return !valued;
}
function javaRepoMethodUsesIndex (): any {
    if (javaRepoMethodIndex !== undefined) {
        return javaRepoMethodIndex;
    }
    const declared = new Map<string, number> ();
    const mentioned = new Set<string> ();
    const asyncVoid = new Map<string, boolean> ();
    const calls = new Map<string, { file: string, args: any[] }[]> ();
    const declaredIn = new Map<string, Set<string>> ();
    const key = (file: string) => path.resolve (file).replace (/\.nooverloads\.\d+(\.ts)$/, '$1');
    const visitDir = (dir: string) => {
        if (!fs.existsSync (dir)) {
            return;
        }
        for (const entry of fs.readdirSync (dir, { withFileTypes: true })) {
            const full = path.join (dir, entry.name);
            if (entry.isDirectory ()) {
                if (entry.name !== 'static_dependencies' && entry.name !== 'node_modules') {
                    visitDir (full);
                }
                continue;
            }
            const text = isTsIndexSource (entry.name) && !/\.nooverloads\.\d+\.ts$/.test (entry.name) ? readTsIndexSource (full) : undefined;
            if (text === undefined) {
                continue;
            }
            const source: any = ts.createSourceFile (full, text, ts.ScriptTarget.Latest, true);
            const inBase = /[\\/]ts[\\/]src[\\/]base[\\/]/.test (full); // the base tier prints its own returns
            const visit = (n: any) => {
                if ((ts.isMethodDeclaration (n) || ts.isPropertyDeclaration (n) || ts.isPropertyAssignment (n)) && n.name !== undefined && ts.isIdentifier (n.name)) {
                    declared.set (n.name.text, (declared.get (n.name.text) ?? 0) + 1);
                    declaredIn.set (n.name.text, (declaredIn.get (n.name.text) ?? new Set<string> ()).add (key (full)));
                }
                if (ts.isMethodDeclaration (n) && n.name !== undefined && ts.isIdentifier (n.name)) {
                    asyncVoid.set (n.name.text, (asyncVoid.get (n.name.text) ?? true) && !inBase && javaIsAsyncVoidMethod (n));
                }
                if (ts.isPropertyAccessExpression (n)) {
                    const thisCall = n.expression.kind === ts.SyntaxKind.ThisKeyword && ts.isCallExpression (n.parent) && n.parent.expression === n;
                    if (!thisCall) {
                        mentioned.add (n.name.text);
                    } else {
                        const list = calls.get (n.name.text) ?? [];
                        list.push ({ file: key (full), args: [ ...n.parent.arguments ] });
                        calls.set (n.name.text, list);
                    }
                }
                if (ts.isStringLiteralLike (n)) {
                    mentioned.add (n.text);
                }
                n.forEachChild (visit);
            };
            visit (source);
        }
    };
    visitDir (path.resolve (__dirname, '..', 'ts', 'src'));
    let handWritten: string | undefined;
    try {
        const dir = path.resolve (__dirname, '..', 'java', 'lib', 'src', 'main', 'java', 'io', 'github', 'ccxt');
        handWritten = fs.readdirSync (dir).filter ((f: string) => f.endsWith ('.java'))
            .map ((f: string) => fs.readFileSync (path.join (dir, f), 'utf8').split ('// METHODS BELOW THIS LINE ARE TRANSPILED FROM TYPESCRIPT')[0]).join ('\n');
    } catch (e) {
        handWritten = undefined; // no Java tree to consult: the proof stays withheld
    }
    javaRepoMethodIndex = { declared, mentioned, asyncVoid, calls, handWritten, key, declaredIn };
    return javaRepoMethodIndex;
}

// Every hand-written Java declaration of a method name in java/lib and java/tests, as parameter type lists; a name
// with a varargs, generic or multi-line declaration answers undefined (unknown), and so does a missing Java tree.
let javaDeclarationIndex: Map<string, string[][] | undefined> | undefined;
function javaDeclarationsIndex (): Map<string, string[][] | undefined> {
    if (javaDeclarationIndex !== undefined) {
        return javaDeclarationIndex;
    }
    // workers load the table the main process wrote once, instead of each scanning the Java tree
    const saved = process.env.CCXT_JAVA_DECLARATIONS_FILE;
    if (saved !== undefined && fs.existsSync (saved)) {
        const rows: [string, string[][] | null][] = JSON.parse (fs.readFileSync (saved, 'utf8'));
        javaDeclarationIndex = new Map (rows.map (([ name, list ]) => [ name, list ?? undefined ]));
        return javaDeclarationIndex;
    }
    const index = new Map<string, string[][] | undefined> ();
    const head = /^\s*(?:(?:public|protected|private|static|final|abstract|default|synchronized)\s+)+(<[^(]*>\s+)?[\w.<>, ?\[\]]+?\s+(\w+)\s*\(([^)]*)(\))?/;
    const bare = /^\s*()(?!return\b|new\b|throw\b|else\b)[\w.<>, ?\[\]]+?\s+(\w+)\s*\(([^)]*)(\))\s*(?:throws\s[\w., ]+)?\s*[;{]\s*$/;
    const visit = (dir: string) => {
        if (!fs.existsSync (dir)) {
            return;
        }
        for (const entry of fs.readdirSync (dir, { withFileTypes: true })) {
            const full = path.join (dir, entry.name);
            if (entry.isDirectory ()) {
                visit (full);
                continue;
            }
            if (!entry.name.endsWith ('.java') || /[\\/]io[\\/]github[\\/]ccxt[\\/]exchanges[\\/]/.test (full)) {
                continue;
            }
            // venue classes and the base tiers below the delimiter are counted from their TS declarations
            // below, so the answer never depends on the tree an earlier print left behind
            for (const line of fs.readFileSync (full, 'utf8').split ('// METHODS BELOW THIS LINE ARE TRANSPILED FROM TYPESCRIPT')[0].split ('\n')) {
                if (line.length > 400 || !line.includes ('(')) {
                    continue;
                }
                // interface members may carry no modifier: a typed head ending the line counts too
                const m = head.exec (line) ?? bare.exec (line);
                if (m === null || /\s=\s/.test (line.slice (0, m.index + m[0].indexOf ('(')))) {
                    continue;
                }
                const name = m[2];
                if (index.has (name) && index.get (name) === undefined) {
                    continue;
                }
                if (m[1] !== undefined || m[4] === undefined || m[3].includes ('...')) {
                    index.set (name, undefined);
                    continue;
                }
                const params: string[] = [];
                let depth = 0;
                let cur = '';
                for (const c of m[3]) {
                    depth += c === '<' ? 1 : (c === '>' ? -1 : 0);
                    if (c === ',' && depth === 0) {
                        params.push (cur);
                        cur = '';
                    } else {
                        cur += c;
                    }
                }
                if (cur.trim () !== '') {
                    params.push (cur);
                }
                const types = params.map ((p) => p.trim ().replace (/^final\s+/, '').replace (/\s+\w+$/, '').replace (/\s+/g, '').replace (/\bjava\.(?:util|lang)\./g, ''));
                const list = index.get (name) ?? [];
                if (!list.some ((t) => t.join (',') === types.join (','))) {
                    list.push (types);
                }
                index.set (name, list);
            }
        }
    };
    visit (path.resolve (__dirname, '..', 'java', 'lib', 'src', 'main', 'java'));
    visit (path.resolve (__dirname, '..', 'java', 'tests', 'src'));
    javaAddPrintedDeclarations (index);
    javaDeclarationIndex = index;
    return index;
}

// TS parameter aliases whose Java slot type is fixed; any other spelling stays distinct (keeps the cast)
const JAVA_TS_PARAMETER_TYPES: Record<string, string> = { 'string': 'String', 'Str': 'String', 'Dict': 'Map<String,Object>', 'NullableDict': 'Map<String,Object>', 'Market': 'Map<String,Object>', 'Int': 'Long', 'any': 'Object' };
function javaPrintedTypeOfTs (text: string): string {
    return JAVA_TS_PARAMETER_TYPES[text] ?? ('ts:' + text);
}

// every non-override ts/src class method is one printed Java declaration per distinct TS parameter-type list;
// an override prints its ancestor's Java parameter types, so it adds none; two TS spellings count twice (keeps the cast)
function javaAddPrintedDeclarations (index: Map<string, string[][] | undefined>): void {
    const handWritten = new Set (index.keys ());
    const visitDir = (dir: string) => {
        if (!fs.existsSync (dir)) {
            return;
        }
        for (const entry of fs.readdirSync (dir, { withFileTypes: true }).sort ((a, b) => (a.name < b.name ? -1 : (a.name > b.name ? 1 : 0)))) {
            const full = path.join (dir, entry.name);
            if (entry.isDirectory ()) {
                if (entry.name !== 'static_dependencies' && entry.name !== 'node_modules') {
                    visitDir (full);
                }
                continue;
            }
            const text = isTsIndexSource (entry.name) && !/\.nooverloads\.\d+\.ts$/.test (entry.name) ? readTsIndexSource (full) : undefined;
            if (text === undefined) {
                continue;
            }
            const source: any = ts.createSourceFile (full, text, ts.ScriptTarget.Latest, true);
            const inBase = /[\\/]ts[\\/]src[\\/]base[\\/]/.test (full);
            // top-level class members only: walking every method body materializes the whole ts/src AST
            const visit = (n: any) => {
                if (ts.isMethodDeclaration (n) && n.body !== undefined && n.name !== undefined && ts.isIdentifier (n.name)) {
                    const name = n.name.text;
                    if (inBase && handWritten.has (name)) {
                        // a base method Java declares by hand is not printed
                    } else if ((ts.getModifiers (n) ?? []).some ((m: any) => m.kind === ts.SyntaxKind.OverrideKeyword)) {
                        // an override keeps its ancestor's printed Java parameter types
                    } else if (index.has (name) && index.get (name) === undefined) {
                        // unknown stays unknown
                    } else if (n.parameters.some ((p: any) => p.dotDotDotToken !== undefined)) {
                        index.set (name, undefined);
                    } else {
                        const types = n.parameters.map ((p: any) => javaPrintedTypeOfTs (p.type === undefined ? 'any' : p.type.getText (source).replace (/\s+/g, '')));
                        const list = index.get (name) ?? [];
                        if (!list.some ((t) => t.join (',') === types.join (','))) {
                            list.push (types);
                        }
                        index.set (name, list);
                    }
                }
            };
            for (const statement of source.statements) {
                if (ts.isClassDeclaration (statement)) {
                    statement.members.forEach (visit);
                }
            }
        }
    };
    visitDir (path.resolve (__dirname, '..', 'ts', 'src'));
}

// main process only: scan the Java tree once, before any worker starts or any Java file is rewritten
function javaWriteDeclarationsFile (): void {
    if (process.env.CCXT_JAVA_DECLARATIONS_FILE !== undefined) {
        return;
    }
    const file = path.resolve (__dirname, '..', '.cache', 'java-declarations.' + process.pid + '.json');
    fs.mkdirSync (path.dirname (file), { recursive: true });
    fs.writeFileSync (file, JSON.stringify ([ ...javaDeclarationsIndex () ].map (([ name, list ]) => [ name, list ?? null ])));
    process.env.CCXT_JAVA_DECLARATIONS_FILE = file;
}

export function installJavaRepoMethodUses (transpiler: any): void {
    const printer = transpiler?.javaTranspiler;
    if (!printer || printer._javaRepoMethodUsesInstalled) {
        return;
    }
    printer._javaRepoMethodUsesInstalled = true;
    printer.javaDeclarationsOf = (name: string) => javaDeclarationsIndex ().get (name);
    printer.javaRepoMethodUses = (name: string, ownFile: string) => {
        const index = javaRepoMethodUsesIndex ();
        if (index.handWritten === undefined) {
            return undefined;
        }
        const own = index.key (ownFile);
        return {
            declared: index.declared.get (name) ?? 0,
            mentions: index.mentioned.has (name) ? 1 : 0,
            handWritten: new RegExp (`\\b${name}\\s*\\(`).test (index.handWritten),
            asyncVoid: index.asyncVoid.get (name) === true,
            calls: (index.calls.get (name) ?? []).filter ((call: any) => call.file !== own).map ((call: any) => call.args),
            // calls from files that do not declare the name themselves (a venue-private method's foreign callers)
            foreignCalls: (index.calls.get (name) ?? []).filter ((call: any) => !(index.declaredIn.get (name)?.has (call.file))).length,
        };
    };
}

// The single-owner stores of the hand-written BaseExchange.java header, handed to the
// printer (printer.javaOwnerStoreFields / javaOwnerStoreHandoffs). A field is a store when its
// declaration is `public Map<String, Object> <name> = new SynchronizedOptions (` (put(k, null)
// removes the key, the contract of the helper's element write); a hand-off key is a name for which
// the header declares both `<key>ForLoad()` and `<key>ForLoadOrEmpty()` owner accessors.
// Installed in the main thread and in every worker; a header that declares none leaves every site on the helper.
export function installJavaOwnerStores (transpiler: any): void {
    const printer = transpiler?.javaTranspiler;
    if (!printer || printer._javaOwnerStoresInstalled) {
        return;
    }
    printer._javaOwnerStoresInstalled = true;
    let header = '';
    try {
        header = fs.readFileSync (path.join (__dirname, '..', 'java', 'lib', 'src', 'main', 'java', 'io', 'github', 'ccxt', 'BaseExchange.java'), 'utf8').split ('// METHODS BELOW THIS LINE ARE TRANSPILED FROM TYPESCRIPT')[0];
    } catch (e) {
        return;
    }
    const stores = new Set<string> ();
    for (const m of header.matchAll (/^ {4}public\s+Map<\s*String\s*,\s*Object\s*>\s+(\w+)\s*=\s*new\s+(?:[A-Za-z_][\w.]*\.)?SynchronizedOptions\s*\(/gm)) {
        stores.add (m[1]);
    }
    const handoffs: { [key: string]: [ string, string ] } = {};
    for (const m of header.matchAll (/^ {4}public\s+Map<\s*String\s*,\s*Object\s*>\s+(\w+)ForLoad\s*\(\s*\)/gm)) {
        if (new RegExp (`^ {4}public\\s+Map<\\s*String\\s*,\\s*Object\\s*>\\s+${m[1]}ForLoadOrEmpty\\s*\\(\\s*\\)`, 'm').test (header)) {
            handoffs[m[1]] = [ m[1] + 'ForLoad', m[1] + 'ForLoadOrEmpty' ];
        }
    }
    printer.javaOwnerStoreFields = stores;
    printer.javaOwnerStoreHandoffs = handoffs;
    // plain caches: `public Map<String, Object> <name> = new HashMap<>();` that the base only ever
    // reassigns to a fresh HashMap (a put of a null value stores it, exactly like the helper)
    // the transpiled half of BaseExchange.java is printed from the base methods of ts/src/base/Exchange.ts
    // (`{}` and createSafeDictionary print a fresh HashMap), so its writes are read there
    let tsBase = '';
    try {
        tsBase = fs.readFileSync (path.join (__dirname, '..', 'ts', 'src', 'base', 'Exchange.ts'), 'utf8');
    } catch (e) {
        return;
    }
    const tsDelimiter = tsBase.indexOf ('METHODS BELOW THIS LINE ARE TRANSPILED FROM TYPESCRIPT');
    const tsExchange = tsBase.indexOf ('export default class Exchange extends BaseExchange');
    const tsMethods = (tsDelimiter >= 0 && tsExchange > tsDelimiter) ? tsBase.slice (tsDelimiter, tsExchange) : tsBase;
    const caches = new Set<string> ();
    for (const m of header.matchAll (/^ {4}public\s+Map<\s*String\s*,\s*Object\s*>\s+(\w+)\s*=\s*new\s+HashMap<>\s*\(\s*\)\s*;/gm)) {
        const handAssigns = [ ...header.matchAll (new RegExp (`\\bthis\\.${m[1]}\\s*=(?!=)\\s*([^;]*)`, 'g')) ];
        const tsAssigns = [ ...tsMethods.matchAll (new RegExp (`\\bthis\\.${m[1]}\\s*=(?!=)\\s*([^;]*)`, 'g')) ];
        // a describe () key the base declares as an object literal reaches the field as a fresh deepExtend map
        const describedLiteral = new RegExp (`^ {12}'${m[1]}': \\{`, 'm').test (tsMethods);
        const fromDescribe = (x: string) => describedLiteral && x === `(Map<String, Object>) this.safeValue(extendedProperties, "${m[1]}")`;
        // a constructor read that defaults to the field itself, when every TS write first reassigns it to `{}`
        const selfDefault = (x: string) => x === `(Map<String, Object>) this.safeValue(extendedProperties, "${m[1]}", this.${m[1]})`
            && new RegExp (`\\bthis\\.${m[1]}\\s*=\\s*\\{\\s*\\}`).test (tsMethods);
        if (handAssigns.every ((x) => /^(?:new\s+HashMap\b|this\.createSafeDictionary\s*\()/.test (x[1].trim ()) || fromDescribe (x[1].trim ()) || selfDefault (x[1].trim ()))
            && tsAssigns.every ((x) => /^(?:\{\s*\}|this\.createSafeDictionary\s*\()/.test (x[1].trim ()))) {
            caches.add (m[1]);
        }
    }
    printer.javaPlainCacheFields = caches;
    // every Map<String, Object> field of the header: the printer proves which of them hold nested maps
    const mapFields = new Set<string> ();
    for (const m of header.matchAll (/^ {4}public\s+(?:volatile\s+)?Map<\s*String\s*,\s*Object\s*>\s+(\w+)\s*[=;]/gm)) {
        mapFields.add (m[1]);
    }
    printer.javaHeaderMapFields = mapFields;
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
    const emittedDeclaredStringLocals = new WeakSet<any> ();
    const emittedLongLocals = new WeakSet<any> ();
    // destructured element -> the numeric box its final printed line declares (`Long page = (Long) ...`)
    const emittedBindingBoxes = new WeakMap<any, string> ();
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
                        if (element.kind === ts.SyntaxKind.BindingElement && element.name?.kind === ts.SyntaxKind.Identifier
                            && lines.some ((line: string) => line.startsWith (`Long ${printer.printNode (element.name, 0)} = `))) {
                            emittedLongLocals.add (element);
                        }
                        // the printer's declared-box arithmetic reads a `Long` / `Integer` / `Double` element from this table
                        const boxLine = element.kind === ts.SyntaxKind.BindingElement && element.name?.kind === ts.SyntaxKind.Identifier
                            ? lines.map ((line: string) => /^(Long|Integer|Double) ([\w$]+) = /.exec (line))
                                .find ((m: any) => m !== null && m[2] === printer.printNode (element.name, 0)) : undefined;
                        if (boxLine !== undefined && boxLine !== null) {
                            emittedBindingBoxes.set (element, boxLine[1]);
                        }
                    }
                }
                if (declaration.name?.kind === ts.SyntaxKind.Identifier && declaration.initializer !== undefined) {
                    // a pro/prediction declaration the ws post-process rewrites back to
                    // `Object` is not a String at the use sites either (same guard the
                    // SS-03 `+` acceptance uses: wsPostProcessReverts)
                    const stringMarker = `${printer.getIden (identation)}String ${printer.printNode (declaration.name, 0)} = `;
                    const stringAt = printed.lastIndexOf (stringMarker);
                    if (stringAt !== -1 && (stringAt === 0 || printed.charAt (stringAt - 1) === '\n')) {
                        // the final line is String in every tier; the concat proof still skips the ws-revert shape
                        emittedDeclaredStringLocals.add (declaration);
                        if (!wsPostProcessReverts (declaration)) {
                            emittedStringLocals.add (declaration);
                        }
                    }
                    const longMarker = `${printer.getIden (identation)}Long ${printer.printNode (declaration.name, 0)} = `;
                    const longAt = printed.lastIndexOf (longMarker);
                    if (longAt !== -1 && (longAt === 0 || printed.charAt (longAt - 1) === '\n')) {
                        emittedLongLocals.add (declaration);
                    }
                }
            }
        } catch (e) {
            // never break a print on an observer error
        }
        return printed;
    };
    printer.javaExpressionTypeResolver = (node: any) => javaPrintedExpressionType (printer, emittedStringLocals, node);
    // the same proof over every local whose final line is `String x = `, ws tiers included
    printer.javaDeclaredStringResolver = (node: any) => javaPrintedExpressionType (printer, emittedDeclaredStringLocals, node);
    // a use of a local whose final declaration prints the nullable box `Long <name> = `
    printer.javaBoxedLongResolver = (node: any) => {
        const declaration = printer.getChecker ().getSymbolAtLocation (node)?.valueDeclaration?.resolve ();
        return declaration !== undefined && emittedLongLocals.has (declaration) && String (node.text) === String (declaration.name?.text);
    };
    printer.javaBindingElementTypeResolver = (element: any) => emittedBindingBoxes.get (element);
    printer._javaExpressionTypeResolverInstalled = true;
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
    oldTranspiler = new OldTranspiler();
    // lazily created in webworkerTranspile and kept alive for the lifetime of the
    // transpiler, so worker threads (and their warm Transpiler + ts.Program batch)
    // are reused across every stage instead of paying a cold pool per call
    piscina: Piscina | undefined;
    javaCoreHanded: Record<string, Record<string, string[]>> | undefined;
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
        javaWriteDeclarationsFile ();
        this.setupTranspiler()
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

            // client.subscriptions / client.futures — these are Object type fields
            // transpiled code tries to cast them to Map, which works since they're ConcurrentHashMaps
            [/\(java\.util\.Map<String, Object>\)client\.futures/gm, '(java.util.Map)client.futures'],
            [/\(java\.util\.Map<String, Object>\)client\.subscriptions/gm, '(java.util.Map)client.subscriptions'],
            [/\(java\.util\.Map<String, Object>\)this\.clients/gm, '(java.util.Map)this.clients'],
            // `clients` is the typed Map<String, Client> field: `delete this.clients[k]` needs no cast
            [/\(\((?:java\.util\.)?Map<String,\s?Object>\)this\.clients\)\.remove\(/gm, 'this.clients.remove('],

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


    // a helper to apply an array of regexes and substitutions to text
    // accepts an array like [ [ regex, substitution ], ... ]

    regexAll(text: string, array: any[]) {
        for (const [regex, substitution] of array) {
            text = text.replace(new RegExp(regex, (typeof regex === 'string') ? 'g' : undefined), substitution)
        }
        return text
    }

    // ============================================================================

    getTranspilerConfig() {
        return {
            "verbose": false,
            "csharp": {
                "parser": {
                    "ELEMENT_ACCESS_WRAPPER_OPEN": "getValue(",
                    "ELEMENT_ACCESS_WRAPPER_CLOSE": ")",
                }
            },
            "java": {
                // generated async lambdas go through BaseExchange.supplyAsync, which
                // defaults to VIRTUAL_EXECUTOR so no tier lands on the ForkJoinPool common pool
                "asyncSupplier": JAVA_ASYNC_SUPPLIER,
                // library async methods print a private sync <name>Core plus a one-line supplier wrapper
                "asyncCoreSplit": "/ts/src/(?!test/)",
            },
        }
    }


    setupTranspiler() {
        this.transpiler = new Transpiler(this.getTranspilerConfig())
        this.transpiler.setVerboseMode(false);
        // a lambda body cannot capture a reassigned parameter: fail the transpile instead of copying it
        (this.transpiler as any).javaTranspiler.javaStrictEffectivelyFinal = true;
        installJavaOwnerStores(this.transpiler);
        this.patchJavaPropertyTypes();
        // the local-typing installers, in order (each is also applied per worker thread in java-worker.ts);
        // later installers' proofs read the declaration text the earlier ones rewrote
        const installers = [
            patchJavaLocalTypes,
            installJavaLocalTypes,
            patchJavaLiteralLocalTypes,
            installJavaNumericLocalTypes,
            patchJavaConsumerStringCasts,
            patchJavaMapChannelStringCasts,
            patchJavaStringReceiverCasts,
            installJavaDeclaredLocalTypes,
            installJavaObjectParamPositions,
            installJavaExpressionTypeResolver,
            installJavaStringListParamTypes,
            installJavaNullScalarLocalTypes,
            patchJavaOmitLocalTypes,
            patchJavaQualifiedDtoListElementLocals,
            patchJavaStringAccumulatorLists,
            patchJavaRowAccumulatorLists,
            patchJavaTupleHolderElementLocals,
            patchJavaOrderBookCacheLocals,
            patchJavaDeclaredMapReceiverCasts,
            patchJavaBaseMapFieldReceiverCasts,
            patchJavaFreshMapElementWrites,
            patchJavaDeclaredBoxLiteralEquality,
            patchJavaObjectKeysLength,
            patchJavaMapArgIdentity,
            patchJavaNonNullStringLocals,
            patchJavaNonNullLongSubtract,
            installJavaBooleanParams,
            installJavaStringDefaultParams,
            installJavaTuplePairReturns,
            installJavaStringListArgs,
            installJavaLongSlots,
            installJavaMapLocals,
            patchJavaUntilOmitMapWrites,
            installJavaBooleanFixedParams,
            installJavaBooleanWriteLocals,
            installJavaNativeReplace,
            installJavaStringReturnSites,
            installJavaFreshObjectMapWrites,
            installJavaStringCoreArgs,
            installJavaNativePadStartFirst,
            installJavaLiteralReplace,
            installJavaCounterTypes,
            installJavaMapLocalTypes,
            installJavaParamTypes,
            installJavaMapArgAlreadyTyped,
            installJavaRepoMethodUses,
            installJavaListLocals,
            installJavaScalarLocals,
            installJavaParamTypesPreScan,
            installJavaStringReturns,
            installJavaPredictionMapLocals,
            installJavaListParamSlots,
            installJavaTypedBaseFields,
            installJavaNonNullMapPuts,
            installJavaLocalElementWrites,
            installJavaStringListIndexOf,
            installJavaR77j2ConditionalLocals,
            installJ6ReaderLocals,
            installJavaJ8CopyLocals,
            installJavaR84j1StringElementLocals,
            installJavaR84j1BoxElementLocals,
            installJavaH26j01MapRowLists,
            installJavaR84j2ContainerLocals,
            installJavaR84j2GuardedListLocals,
            installJavaR84j2MapConditionalLocals,
            installJ84j6TrueOnlyLocals,
            installJ84j6StringListLocals,
            installJavaR84j8Locals,
            installJavaR87j2WsLocals,
            installJavaR87j2UrlLocals,
            installJavaR87j3SumCounterLocals,
            installJavaR87j4SplitLists,
            installJavaR87j5CalleeStringArgs,
            installJavaR87j8CopyStringResolver,
            installJavaR90j2ElementListLocals,
            installJavaR90j2PromiseAllLocals,
            installJavaR90j2ElementMapLocals,
            installJavaR90j3NativeSumLocals,
            installJavaR90j3CounterLoops,
            installJavaR90j6StringListReaders,
            installJavaR90j6AsStringListReaders,
            installJavaR90j6PairLocals,
            installJavaR90j6ListCopyLocals,
            installJavaR90j7MapDelete,
            installJavaR92j3LongDefaultParams,
            installJavaR92j3LongFixedParams,
            installJavaR92j3ParseToIntCompare,
            installJavaR92j3SafeIntegerOperands,
            installJavaR92j3HexStringCalls,
            installJavaR90j8OmitParamLocals,
            installJavaR92j1AssertedStringLocals,
            installJavaR92j1StringRowLocals,
            installJavaR92j2MarketTypeParams,
            installJavaTypedDefaultReaders,
            installJavaR92j2MapSlotHandOff,
            installJavaR92j2StringSlotLocals,
            installJavaR93j2ListLocals,
            installJavaBaseMapCallReturns,
            installJavaBaseMapReturnSites,
            installJavaMapCopyLocals,
            installJavaEventsParamsSlots,
            installJavaCurrenciesByIdReads,
            installJavaSourceExchangeReads,
            installJavaTypedOrderbooksField,
            installJavaNullSeedStructureLocals,
        ];
        for (const install of installers) {
            install(this.transpiler);
        }
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
        baseClass = this.applyTierJavaFixes(baseClass, 'BaseExchange', [
            [/(\b\w*)RestInstance.describe/g, "(\(BaseExchange\)$1RestInstance).describe"],
            [/public Object setMarketsFromExchange\(Object sourceExchange\)/g, "public Object setMarketsFromExchange(BaseExchange sourceExchange)"],
            // cast callDynamically to CompletableFuture when .join() is called on the result
            [/\(Helpers\.callDynamically\(([^)]+(?:\([^)]*\))*[^)]*)\)\)\.join\(\)/g, '((java.util.concurrent.CompletableFuture<Object>)Helpers.callDynamically($1)).join()'],
            // Strip invalid parens around a method callee, e.g. `(this.handleSubTypeAndParams)(args)`
            [/\((this\.[A-Za-z0-9_]+)\)\(/g, '$1('],
        ]);
        baseClass = nativeJavaNumericLocalsRetype(nativeJavaPrimitiveArithmetic(baseClass));
        baseClass = nativeJavaIntegralMultiplySubtract(baseClass);
        baseClass = nativeJavaNumberDivModNeg(baseClass, true);
        baseClass = nativeJavaLongBoxLocals(baseClass, (c: string) => nativeJavaNumberDivModNeg(nativeJavaIntegralMultiplySubtract(nativeJavaNumericLocalsRetype(nativeJavaPrimitiveArithmetic(nativeJavaOrderedComparisons(c)))), true));
        baseClass = nativeJavaMapLocalOps(baseClass);
        return baseClass;
    }

    // fixes shared by every transpiled base tier: the qualified-this inside anonymous-class
    // initializers names the class the methods physically live on (`owner`), Client-typed
    // params/locals, order-book side casts, then the tier's own `extraRules`
    applyTierJavaFixes(baseClass: string, owner: string, extraRules: any[]): string {
        baseClass = baseClass.replace(/(put\("\w+",\s*)(this\.\w+)/gm, `$1${owner}.$2`);
        baseClass = this.regexAll(baseClass, [
            [/\(Object client, /g, '(Client client, '],
            [/Object client = (.+)/g, 'Client client = (Client)$1'],
            [/(\w+)(\.storeArray\(.+\))/gm, '((IOrderBookSide)$1)$2'],
            ...extraRules,
        ]);
        // Remove unreachable "return null;" after throw statements / a throwing plain else
        baseClass = baseClass.replace(/throw ([^;]+) ;\n\s*return null;/g, 'throw $1 ;');
        baseClass = this.removeUnreachableReturnNull(baseClass);
        return this.addDeprecatedAnnotations(baseClass);
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
        // an async method's private sync core goes with it
        return methodName.endsWith('Core') ? out : this.removeJavaMethod(out, methodName + 'Core');
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
        const shortened = shortenJavaReferences(javaBaseNativePasses(this, body, filename));
        const replacement = javaDelimiter + '\n' + shortened.source;
        if (literal) {
            // the replacement is supplied via a callback so `$`-sequences in transpiled Java are treated literally
            fs.writeFileSync(filename, fs.readFileSync(filename, 'utf8').replace(pattern, () => replacement));
        } else {
            replaceInFile(filename, pattern, replacement);
        }
        const contents = fs.readFileSync(filename, 'utf8');
        const withImports = nativeJavaInlineCompare(ensureJavaImports(contents, shortened.imports));
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
        // the base-tier returns just printed here are handed to the venue workers with each task
        this.javaCoreHanded = javaCoreBaseTierSpellings ((this.transpiler as any).javaTranspiler, [ 'predictionBase', 'exchange', 'base' ]);
        const baseClass = this.applyTierJavaFixes(baseFile.content as string, 'PredictionExchange', [
            // cast callDynamically to CompletableFuture when .join() is called on the result
            [/\(Helpers\.callDynamically\(([^)]+(?:\([^)]*\))*[^)]*)\)\)\.join\(\)/g, '((java.util.concurrent.CompletableFuture<Object>)Helpers.callDynamically($1)).join()'],
        ]);
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
            const extrasNames = this.extractJavaMethodNames('\n' + extras);
            for (const name of extrasNames) {
                if (!predImplemented.has(name) && !(name.endsWith('Core') && extrasNames.has(name.slice(0, -4)))) {
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
        const handed = this.javaCoreHanded;
        const handedKey = handed === undefined ? '' : JSON.stringify (handed);
        const baseMapReturns = javaBaseMapCallReturnTable ();

        // One file per task (load-balances; a slow file can't stall others). `roots` is
        // the FULL stage list on every task so each worker builds ONE sticky ts.Program
        // (see build/worker-program-batch.ts) and prints each file off that checker.
        const promises: any = [];
        const now = Date.now();
        for (const file of allFiles) {
            promises.push(piscina.run({ transpilerConfig: parserConfig, configKey, roots: allFiles, files: [file], handed, handedKey, baseMapReturns }));
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

        // override extends from Exchange to ClassApi
        content = content.replace(/extends\s\w+/g, `extends ${this.capitalize(name)}Api`);
        content = content.replace(/class\s+\w+\s+extends/, `class ${className} extends`);
        // twice: a `g` match consumes the comma the next hash name needs (`, sha1, sha256)`)
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
        // Remove unreachable "return null;" after throw statements / a throwing plain else
        content = content.replace(/throw ([^;]+) ;\n\s*return null;/g, 'throw $1 ;');
        content = this.removeUnreachableReturnNull(content);

        // WS fixes
        if (ws) {
            const wsRegexes = this.getJavaWsRegexes();
            content = this.regexAll (content, wsRegexes);
            content = this.replaceImportedRestClasses (content, javaVersion.imports ?? []);
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
        if (!ws && !prediction) {
            // this.delay(ms, this.cb[, args]) also appears in REST files (e.g. the
            // interactivebrokers gateway keep-alive loop) — turn the method reference into a
            // string and dispatch through scheduleCallback (same as the WS tier's string form);
            // the spawn-lambda form is unusable here because a reassigned delay variable is
            // not effectively final, while scheduleCallback evaluates its arguments eagerly
            content = content.replace(/this\.delay\(([^,]+),\s*this\.(\w+)/gm, 'this.delay($1, "$2"');
            content = this.rewriteDelayWithStringCallback(content);
        }
        content = this.addDeprecatedAnnotations(content);

        // retype the raw-text `final Object` hoists (see retypeFinalVarDeclarations)
        content = this.retypeFinalVarDeclarations(content);
        content = nativeJavaDeclaredElementReads(content);
        content = nativeJavaElementReads(content);
        // literal limit locals fed to Long slots (java-local-types section 32)
        content = nativeJavaLongLimitLocals(content);
        content = nativeJavaTopLevelNewMap(content);
        content = nativeJavaReassignedNewMap(content);
        content = nativeJavaEqualTruthy(content);
        content = nativeJavaOrderedComparisons(content);
        content = nativeJavaNestedNewMaps(content);
        content = nativeJavaTypedArithmetic(content);
        // Re-run the long-limit + compare passes over the typed native arithmetic
        content = nativeJavaNonNullCompare(nativeJavaOrderedComparisons(nativeJavaLongLimitLocals(content)));
        content = nativeJavaParamCompare(content);
        content = nativeJavaNumericLocalsRetype(nativeJavaPrimitiveArithmetic(content));
        content = nativeJavaSumLongLocals(content);
        // a min over a sum local retyped Long just above
        content = content.includes('Helpers.mathMin(') ? nativeJavaLongLimitLocals(content) : content;
        content = nativeJavaIntegralMultiplySubtract(content);
        content = nativeJavaNumberDivModNeg(content);
        // Object locals holding only Long boxes retype to Long, then the typed arithmetic/compare passes re-run
        content = nativeJavaLongBoxLocals(content, (c: string) => nativeJavaNumberDivModNeg(nativeJavaIntegralMultiplySubtract(nativeJavaSumLongLocals(nativeJavaNumericLocalsRetype(nativeJavaPrimitiveArithmetic(nativeJavaParamCompare(nativeJavaNonNullCompare(nativeJavaOrderedComparisons(nativeJavaTypedArithmetic(c))))))))));

        return this.createGeneratedHeader().join('\n') + '\n' + javaImports + content;
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


    // true when the text proves the identifier `name` at offset `pos` is Java-`String`:
    // the NEAREST PRECEDING declaration of `name` inside the same method must be
    // `String ...` AND its value must survive the "String type fixes" revert below
    // (`String x = this.<m>(...)` / `Helpers.<...>(...)` are rewritten back to Object,
    // so they prove nothing). Used by the ws post-passes: the `(String)` hash cast they
    // add around `client.future(name)` / `client.reusableFuture(name)` is redundant when
    // the hash local is already declared String (WsClient.future/reusableFuture take
    // `String`). A field/param not declared in the file proves nothing -> keep the cast.
    provablyStringLocal (content: string, name: string, pos: number): boolean {
        return this.provablyTypedLocal (content, name, pos, 'String');
    }

    // the same nearest-preceding-declaration proof for any declared Java type: ws locals the printer
    // declares `io.github.ccxt.ws.Future` (a read out of client.futures) need no checkcast at their uses
    provablyTypedLocal (content: string, name: string, pos: number, type: string): boolean {
        const masked = maskJavaComments(content);
        const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const before = masked.slice(0, pos);
        // the enclosing method: the last member-modifier line before `pos`; a use that has
        // no declaration inside its own method binds to a field/param -> keep the cast
        const breaks = [...before.matchAll(/^[ \t]*(?:public|private|protected)[ \t]/gm)];
        const windowStart = breaks.length > 0 ? breaks[breaks.length - 1].index : 0;
        const window = masked.slice(windowStart, pos);
        const decl = new RegExp(`\\b(String|Object|Integer|Long|Double|Boolean|var|char|io\\.github\\.ccxt\\.ws\\.Future)\\s+${escaped}\\s*(?=[=;,)])`, 'g');
        let last = null;
        let m;
        while ((m = decl.exec(window)) !== null) {
            last = m;
        }
        if (last === null || last[1] !== type) {
            return false;
        }
        const rest = window.slice(last.index + last[0].length);
        const value = /^\s*=\s*([^\n;]*)/.exec(rest);
        if (type === 'String' && value !== null && /^(?:this\.[A-Za-z_]\w*\s*\(|Helpers\.)/.test(value[1].trim())) {
            return false;
        }
        return true;
    }


    removeUnreachableReturnNull(content: string): string {
        const lines = content.split('\n');
        const result: string[] = [];
        for (let i = 0; i < lines.length; i++) {
            // Check if this line is "return null;" and the next is "});" (lambda end)
            let after = i + 1;
            while (after < lines.length && lines[after].trim() === '') after++;
            let head = i;
            while (head > 0 && !/^ {0,4}(?:public|private|protected) /.test(lines[head])) head--;
            const coreClose = lines[i].startsWith('        return null;') && lines[after] === '    }' && /^ {0,4}private \S.* \w+Core\(/.test(lines[head]);
            if (lines[i].trim() === 'return null;' && i + 1 < lines.length && (isAsyncLambdaClose(lines[i + 1].trim()) || coreClose)) {
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
        content = content.replace(new RegExp(`${cap}\\.("\\w+")`, 'gm'), '$1');

        // ── Pattern 12: Map casts for client.subscriptions/futures access ──
        content = content.replace(/\(\(Object\)client\)\.subscriptions/gm, '((java.util.Map)client.subscriptions)');
        content = content.replace(/\(\(Object\)client\)\.futures/gm, '((java.util.Map)client.futures)');

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
        // a `future` the file declares io.github.ccxt.ws.Future (nearest declaration in the method) needs no cast
        const wsFutureLocal = (name: string, offset: number, _text: string): string =>
            this.provablyTypedLocal (content, name, offset, WS_FUTURE_TYPE) ? name : `((${WS_FUTURE_TYPE})${name})`;
        content = content.replace(/(?<!\w)(future)\.getFuture\(\)\.join\(\)/gm,
            (m: string, name: string, offset: number) => `${wsFutureLocal (name, offset, content)}.getFuture().join()`);
        content = content.replace(/(?<!\w)(future)\.join\(\)/gm,
            (m: string, name: string, offset: number) => `${wsFutureLocal (name, offset, content)}.getFuture().join()`);
        // (future).join() pattern
        content = content.replace(/\(future\)\.join\(\)/gm,
            (m: string, offset: number) => `${wsFutureLocal ('future', offset + 1, content)}.getFuture().join()`);
        // client.future(...).join() → client.future(...).getFuture().join()
        content = content.replace(/client\.(future|reusableFuture)\(([^)]+)\)\.join\(\)/gm,
            'client.$1($2).getFuture().join()');
        // (client.future(...)).join() → client.future(...).getFuture().join()
        // Parenthesized form — use balanced parens since args may contain nested parens
        content = this.replaceParenthesizedClientFutureJoin(content);
        // But if future is already typed as io.github.ccxt.ws.Future, don't double-cast
        content = content.replace(/\(\(io\.github\.ccxt\.ws\.Future\)(\(io\.github\.ccxt\.ws\.Future\))/gm, '($1');

        // ── Pattern 10: (String) cast on Helpers.add() for exception constructors and client.future() ──
        // only when the add-chain's FIRST operand is not already String
        content = content.replace(/(throw new \w+\()Helpers\.add\(/gm,
            (match: string, prefix: string, offset: number) =>
                this.addChainStartsWithString (content, offset + match.length - 'Helpers.add('.length)
                    ? match : `${prefix}(String)Helpers.add(`);
        content = content.replace(/(client\.(?:future|reusableFuture)\()Helpers\.add\(/gm,
            (match: string, prefix: string, offset: number) =>
                this.addChainStartsWithString (content, offset + match.length - 'Helpers.add('.length)
                    ? match : `${prefix}(String)Helpers.add(`);

        // ── Pattern 5: ArrayCache .hashmap access ──
        content = this.regexAll(content, [
            // Only match local variables, not this.xxx
            [/(?<!this\.)(?<![\w.])([a-z]\w+)\.hashmap\b/gm, '((io.github.ccxt.ws.ArrayCache)$1).hashmap'],
            // this.xxx.hashmap → ((ArrayCache)this.xxx).hashmap
            [/(this\.\w+)\.hashmap\b/gm, '((io.github.ccxt.ws.ArrayCache)$1).hashmap'],
            // Prevent double-wrapping
            [/\(\(io\.github\.ccxt\.ws\.ArrayCache\)\(\(io\.github\.ccxt\.ws\.ArrayCache\)/gm, '((io.github.ccxt.ws.ArrayCache)'],
        ]);

        // future.resolve(x) where future is Object → cast
        content = content.replace(/(?<!\w)future\.resolve\(([^)]+)\)/gm,
            (m: string, args: string, offset: number) => `${wsFutureLocal ('future', offset, content)}.resolve(${args})`);
        // future.reject(x) on Object
        content = content.replace(/(?<!\w)future\.reject\(([^)]+)\)/gm,
            (m: string, args: string, offset: number) => `${wsFutureLocal ('future', offset, content)}.reject(${args})`);
        // promise.resolve(x) where promise is Object → cast
        content = content.replace(/(?<!\w)promise\.resolve\(([^)]*)\)/gm,
            (m: string, args: string, offset: number) => `${wsFutureLocal ('promise', offset, content)}.resolve(${args})`);

        // a resolved ws list is an ArrayCache or a plain list: the typed static answers Long for both
        content = this.replaceDynamicMethodCall(content, 'getLimit',
            (varName, args) => `io.github.ccxt.ws.ArrayCache.getLimitOf(${varName}, ${args})`);

        // ── Property access on Object-typed variables ──
        content = this.regexAll(content, [
            [/(?<![.\w])([a-z]\w+)\.cache\b(?!\()/gm, '((java.util.List<Object>)Helpers.GetValue($1, "cache"))'],
            [/(?<![.\w])([a-z]\w+)\.nonce\b(?!\()/gm, 'Helpers.GetValue($1, "nonce")'],
        ]);

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
        const namesPattern = Array.from(methodNames).join('|');
        content = this.regexAll(content, [
            // ClassName.this.method (as value)
            [new RegExp(`${cap}\\.this\\.(${namesPattern})\\s*(?=[,;)\\s])`, 'gm'), '"$1"'],
            // this.method (as value, not preceded by '=' which would be wrong context)
            [new RegExp(`(?<!=\\s)this\\.(${namesPattern})\\s*(?=[,;)\\s])`, 'gm'), '"$1"'],
            // var = this.method;  → var = "method";
            [new RegExp(`=\\s*this\\.(${namesPattern})\\s*;`, 'gm'), '= "$1";'],
        ]);

        // ── .call(this, args) → reflection dispatch — use balanced parens ──
        content = this.replaceCallPattern(content);

        // ── this.spawn(this.method, args) → lambda (as statement ending with ;) ──
        content = content.replace(/this\.spawn\(this\.(\w+),\s*([^)]*(?:\([^)]*\)[^)]*)*)\);/gm,
            (_m, name, args) => this.spawnMethodReference(name, args)
                ?? `this.spawn(() -> { try { this.${name}(${args}); } catch(Exception _e) { throw new RuntimeException(_e); } });`);
        // this.spawn("methodName", arg1, arg2, ...) → this.spawn(() -> { ... }) (as statement)
        content = content.replace(/this\.spawn\("(\w+)",\s*([^)]*(?:\([^)]*\)[^)]*)*)\);/gm,
            (_m, name, args) => this.spawnMethodReference(name, args)
                ?? `this.spawn(() -> { try { this.${name}(${args}); } catch(Exception _e) { throw new RuntimeException(_e); } });`);
        // this.spawn(this.method, args) used as expression (value) — NOT ending with ;
        content = content.replace(/this\.spawn\(this\.(\w+),\s*([^)]*(?:\([^)]*\)[^)]*)*)\)(?=\))/gm, 'this.$1($2)');
        // this.spawn("methodName", args) as expression — the method-ref-as-string
        // pass above has already converted this.methodRef → "methodRef" by the time
        // we get here. Rewrite to spawnWithResult which returns a Future capturing
        // the async call's outcome.
        content = content.replace(/this\.spawn\("(\w+)",\s*([^)]*(?:\([^)]*\)[^)]*)*)\)(?=\))/gm, 'this.spawnWithResult("$1", $2)');

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
                const missing = (argCount >= 2 && argCount <= 4) ? 5 - argCount : 0;
                result2 += `this.${m2[1] ?? ''}${method}(${args2}${', null'.repeat(missing)})`;
                lastIdx2 = j2;
            }
            result2 += content.substring(lastIdx2);
            content = result2;
        }

        // ── Client type handling, Pattern 9: int/long from Object ──
        const longField = (match: string, field: string, rhs: string) =>
            (rhs.startsWith('((Number)') || /^\d+L?$/.test(rhs.trim())) ? match : `client.${field} = ((Number)${rhs}).longValue();`;
        content = this.regexAll(content, [
            [/WsClient\b/gm, 'Client'],
            [/\(Object client\)/gm, '(Client client)'],
            [/\(Object client,/gm, '(Client client,'],
            [/,\s*Object client,/gm, ', Client client,'],
            [/,\s*Object client\)/gm, ', Client client)'],
            [/Object client =/gm, 'Client client ='],
            [/Object client = this\.client\(/gm, 'Client client = this.client('],
            [/Client\s+client\s*=\s*Helpers\.GetValue\((\w+),\s*(\w+)\)/gm, 'Client client = (Client)Helpers.GetValue($1, $2)'],
            [/Client\s+client\s*=\s*this\.(safeValue|safeDict)\(/gm, 'Client client = (Client)this.$1('],
        ]);
        // parseTimeframe is declared primitive int, so its local keeps `int`; any other reverted
        // local may box an Integer, which a printer `((long) x)` cast would reject at runtime
        const revertedInts = new Set<string>();
        content = content.replace(/int (\w+) = (?![\d(]|this\.parseTimeframe\()/gm, (_m: string, n: string) => { revertedInts.add(n); return 'Object ' + n + ' = '; });
        for (const n of revertedInts) {
            content = content.replace(new RegExp('\\(\\(long\\) ' + n + '\\)', 'g'), '((Number) ' + n + ').longValue()');
        }
        content = this.regexAll(content, [
            [/new ArrayCache\(this\.(safeInteger\([^)]+\))\)/gm, 'new ArrayCache(((Number)this.$1).intValue())'],
            [/client\.(lastPong|keepAlive)\s*=\s*([^;]+);/gm, longField],
            // ── this.delay(ms, this.method[, args]) → spawn with sleep ──
            [/this\.delay\(([^,]+),\s*this\.(\w+),\s*([^)]+)\)/gm, 'this.spawn(() -> { try { Thread.sleep(((Number)$1).longValue()); this.$2($3); } catch(Exception _e) {} })'],
            [/this\.delay\(([^,]+),\s*this\.(\w+)\)/gm, 'this.spawn(() -> { try { Thread.sleep(((Number)$1).longValue()); this.$2(); } catch(Exception _e) {} })'],
        ]);

        // ── this.delay → spawn with sleep ──
        // `this.delay(ms, "methodName", ...args)` where the callback
        // is already a string literal (the method-ref-as-string rewrite above converts
        // `this.method` → `"method"`). Dispatch dynamically via Helpers.callDynamically.
        content = this.rewriteDelayWithStringCallback(content);

        // ── CompletableFuture<Void> → <Object> ──
        // a declaration the method index marks as returning no value keeps the Void the printer gave it
        const voidIndex = javaRepoMethodUsesIndex ();
        content = content.replace(/CompletableFuture<Void>(?=(\s+(\w+)\()?)/gm, (m: string, _d: string, name: string) =>
            (name !== undefined && voidIndex.asyncVoid.get (name) === true && voidIndex.handWritten !== undefined && !new RegExp (`\\b${name}\\s*\\(`).test (voidIndex.handWritten)) ? m : 'CompletableFuture<Object>');

        // ── this.lockId()/this.unlockId() → synchronized with scoping fix ──
        content = this.fixSynchronizedScoping(content);

        // ── super.describeData() → call WS parent method ──
        content = content.replace(/super\.describeData\(\)/gm, 'new io.github.ccxt.exchanges.pro.Binance().describeData()');

        // ── Fix extra args in method calls when definition has fewer params ──
        if (/loadPositionsSnapshot\(Client\s+\w+,\s*Object\s+\w+,\s*Object\s+\w+\)\s*$/m.test(content) && /this\.loadPositionsSnapshot\(\w+,\s*\w+,\s*\w+,\s*\w+\)/.test(content)) {
            content = content.replace(/loadPositionsSnapshot\(Client\s+(\w+),\s*Object\s+(\w+),\s*Object\s+(\w+)\)\s*$/m,
                'loadPositionsSnapshot(Client $1, Object $2, Object $3, Object... _extraArgs)');
        }

        content = this.regexAll(content, [
            // ── Bids/Asks class references ──
            [/new Bids\(/gm, 'new io.github.ccxt.ws.OrderBookSide.Bids('],
            [/new Asks\(/gm, 'new io.github.ccxt.ws.OrderBookSide.Asks('],
            // ── Exchange class name capitalization ──
            [/new io\.github\.ccxt\.exchanges\.([a-z])(\w+)\(\)/gm,
                (m: string, first: string, rest: string) => `new io.github.ccxt.exchanges.${first.toUpperCase()}${rest}()`],
            // ── Assignment to map.get() → Helpers.addElementToObject ──
            [/\(\(java\.util\.HashMap<String, Object>\)(\w+)\)\.get\("(\w+)"\)\s*=\s*([^;]+);/gm, 'Helpers.addElementToObject($1, "$2", $3);'],
            [/\(\(java\.util\.List<Object>\)Helpers\.GetValue\((\w+),\s*"(\w+)"\)\)\s*=\s*([^;]+);/gm, 'Helpers.addElementToObject($1, "$2", $3);'],
            // ── (List<String>) cast fix for ArrayList<Object> → List<String> ──
            [/\(\(java\.util\.List<Object>\)\(\(java\.util\.List<Object>\)Helpers\.GetValue\((\w+),\s*"(\w+)"\)\)\)\s*=\s*([^;]+);/gm, 'Helpers.addElementToObject($1, "$2", $3);'],
            [/\(java\.util\.List<String>\)new java\.util\.ArrayList<Object>/gm, '(java.util.List<String>)(java.util.List)new java.util.ArrayList<Object>'],
        ]);

        // ── spawn lambdas whose argument is a reassigned local: pass the arguments by value ──
        if (!skipEffectivelyFinal) {
            content = this.spawnReassignedArgsByValue(content);
        }

        // ── Void supplyAsync return null insertion, then `return null;` leakage out of void handlers ──
        content = this.insertReturnNullInSupplyAsync(content);
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

    insertReturnNullInSupplyAsync(content: string): string {
        const lines = content.split('\n');

        let inSupplyAsync = 0;
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes(JAVA_ASYNC_SUPPLIER + '(') && lines[i].trimEnd().endsWith('{')) inSupplyAsync++;
            if (inSupplyAsync > 0 && lines[i].trim() === '});') inSupplyAsync--;
            if (inSupplyAsync > 0 && lines[i].trim() === 'return;') {
                lines[i] = lines[i].replace('return;', 'return null;');
            }
        }

        // Only the `});` closing an async lambda body qualifies; nested lambdas are tracked by depth.
        let depth = 0;
        for (let i = 0; i < lines.length; i++) {
            const t = lines[i].trim();
            if (t.includes(JAVA_ASYNC_SUPPLIER + '(') && t.endsWith('{')) { depth = 1; continue; }
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
        for (let i = 0; i < lines.length; i++) {
            const match = lines[i].match (RETYPE_COPY_LINE);
            if (match === null) continue;
            const indent = match[1];
            const hoistedName = match[2];
            const sourceName = match[3];
            const start = retypeMemberStart (lines, i);
            const end = retypeMemberEnd (lines, i);

            // 1. the source type: the nearest preceding declaration of the same name inside the member
            let typeToken: string | undefined;
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
            const reference = retypeReferenceToken (typeToken);
            if (reference === undefined) continue;

            // 2. every later mention of the hoisted name inside the member must be an audited
            //    fixed-parameter Object position
            let audited = true;
            for (let j = i + 1; j <= end; j++) {
                // the copy is not final, so every later write is audited too
                const write = lines[j].match (new RegExp (`^(\\s*${hoistedName}\\s*=\\s*)(?!=)(.+)$`));
                if (write !== null) {
                    if (!retypeWrittenValueMatches (write[2], reference)) { audited = false; break; }
                    continue;
                }
                if (!retypeUseIsAudited (lines[j], hoistedName, reference)) { audited = false; break; }
            }
            if (!audited) continue;

            lines[i] = `${indent}${reference} ${hoistedName} = ${sourceName};`;
        }
        return lines.join ('\n');
    }

    // `this.spawn(this::m, a..)`: BaseExchange's typed spawn overloads take the arguments by value;
    // a bare `null` would infer Object and miss a narrower parameter, so that shape keeps the lambda
    spawnMethodReference(name: string, argsText: string): string | undefined {
        const args: string[] = [];
        let depth = 0;
        let start = 0;
        for (let k = 0; k < argsText.length; k++) {
            const ch = argsText[k];
            if (ch === '(' || ch === '<' || ch === '{') depth++;
            else if (ch === ')' || ch === '>' || ch === '}') depth--;
            else if (ch === ',' && depth === 0) {
                args.push(argsText.slice(start, k).trim());
                start = k + 1;
            }
        }
        args.push(argsText.slice(start).trim());
        if (depth !== 0 || args.length > 6 || args.some((a) => a === '' || a === 'null' || /["']/.test(a))) {
            return undefined;
        }
        return `this.spawn(this::${name}, ${args.join(', ')});`;
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

        const fileNameNoExt = filename.replace('.ts', '')

        let javaSource = this.createJavaClass(fileNameNoExt, csharpResult, ws, prediction)
        javaSource = typeCoreReturns(javaSource, withVenueAsyncReturns(typedReturnTable(prediction ? 'prediction' : ws ? 'ws' : 'rest'), tsPath))
        const nativePasses = [
            nativeJavaMapLocalsRetype, nativeJavaCoreArgIdentities, nativeJavaNumberParamCompare, nativeJavaWsOrderBookContainers,
            nativeJavaBoxLocalsCoreArgs, nativeJavaNumberProvenCompare, nativeJavaMapLocalOps, nativeJavaRemainingCoreArgs,
            nativeJavaInlineDivModNeg, nativeJavaInlineCompare, nativeJavaContainerOps,
        ];
        for (const pass of nativePasses) {
            javaSource = pass(javaSource)
        }
        if (ws) {
            javaSource = nativeJavaWsHandlerDispatch(javaSource)
        }
        const apiPath = path.join(javaFolder ?? '', '..', 'api', this.capitalize(fileNameNoExt) + 'Api.java')
        if (!ws && !prediction && fs.existsSync(apiPath)) {
            javaSource = nativeJavaLiteralApiDispatch(javaSource, fs.readFileSync(apiPath, 'utf8'))
        }

        if (javaFolder) {
            const outputName = this.capitalize(fileNameNoExt) + '.java';
            overwriteFileAndFolder(javaFolder + outputName, javaSource)
        }
    }


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
            // Strip parens around a method callee, e.g. `(this.handleSubTypeAndParams)(args)`
            content = content.replace(/\((this\.[A-Za-z0-9_]+)\)\(/g, '$1(');
            // Null-safe Array.isArray (see Helpers.isArrayJs).

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

            overwriteFileAndFolder(javaFile, nativeJavaTestCoreArgs(file));
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
            [/BaseExchange exchange = this\.initOfflineExchange\(("[a-z0-9]+")\)/g, 'Exchange exchange = ((Exchange)this.initOfflineExchange($1))'],
            [/testReturnResponseHeaders\(BaseExchange exchange\)/g, 'testReturnResponseHeaders(Exchange exchange)'],
            [/throw new Error/g, 'throw new Exception'],
            [/public class TestMainClass/g, 'public class TestMain extends BaseTest'],
            [/assert/gm, 'Assert'],
            [/TestMainClass\.this/gm, 'TestMain.this'],
            [/throw new Exception/g, 'throw new RuntimeException'],
            // the retyped Map<String, Object> field takes the Object fixture read through an assignment cast
            [/exchange\.currencies = currencies;/g, 'exchange.currencies = (Map<String, Object>) currencies;'],
            [/throw e/gm, 'throw new RuntimeException(e)'],
            // noImplicitAny bags: Object so safeValue assignments typecheck (Map is too narrow)
            [/public (?:Dict|java\.util\.Map<String, Object>) skippedMethods\b/g, 'public Object skippedMethods'],
            [/public (?:Dict|java\.util\.Map<String, Object>) checkedPublicTests\b/g, 'public Object checkedPublicTests'],

        ])
        // Null-safe Array.isArray (see Helpers.isArrayJs).
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

        overwriteFileAndFolder(files.javaFile, nativeJavaTestCoreArgs(file));
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

        await this.transpileAndSaveJavaExchangeTests(tests, true);
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

            // Java's System.out.println accepts a single argument: collapse multi-arg println calls
            // into one space-separated string (paren-depth and string-literal aware)
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
                    rebuilt += parts.length <= 1 ? `System.out.println(${found.args})` : `System.out.println(${parts.map(p => `String.valueOf(${p.trim()})`).join(' + " " + ')})`;
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
            // The simple regex form only handles one level of nested parens, so a paren-counting pass follows.
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
                    // i is one past the inner closing `)`; the outer `).join()` must follow
                    if (depth === 0 && contentIndentend.slice(i, i + 8) === ').join()') {
                        rebuilt += contentIndentend.slice(cursor, start);
                        rebuilt += `((java.util.concurrent.CompletableFuture<Object>)Helpers.callDynamically(${contentIndentend.slice(start + marker.length, i - 1)})).join()`;
                        cursor = i + 8;
                    } else {
                        rebuilt += contentIndentend.slice(cursor, start + 1);
                        cursor = start + 1;
                    }
                }
                contentIndentend = rebuilt;
            }
            // Null-safe Array.isArray (see Helpers.isArrayJs).
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
            overwriteFileAndFolder(tests[idx].javaFile, nativeJavaTestCoreArgs(java));
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
        this.transpileBaseTests(BASE_TESTS_FOLDER, force);
        this.transpileCryptoTestsToJava(BASE_TESTS_FOLDER, force);
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

// `<open><balanced-expr>)` -> `<balanced-expr>` per rule in order: `((String)x)` wrappers (`foo((String)x)` is a
// call, not a wrapper) and the two truthiness wrappers the handle* tuple coercion (build/java-local-types.js
// section 4b) injects on the element write; the read spellings are untouched, so both sides strip symmetrically
const AUDIT_STRIP_WRAPPERS: [string, RegExp | undefined][] = [ [ '((String)', /[A-Za-z0-9_$]/ ], [ 'Boolean.TRUE.equals(', undefined ], [ 'Helpers.isTrue(', undefined ] ];
function auditStripCasts (s: string): string {
    for (const [ open, word ] of AUDIT_STRIP_WRAPPERS) {
        for (;;) {
            let at = s.indexOf(open);
            while (word && at > 0 && word.test(s[at - 1])) at = s.indexOf(open, at + 1);
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
    return s
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
// Writes throwaway ts/src probe files (first one transpiled), lets `check` inspect the Java, then removes them
function probeSelfTest (files: [string, string[]][], check: (out: string, problems: string[]) => void, threw = 'self-test threw'): string[] {
    const problems: string[] = [];
    const paths = files.map(([ name ]) => path.join(process.cwd(), 'ts', 'src', `${name}${process.pid}.ts`));
    try {
        files.forEach(([ , lines ], i) => fs.writeFileSync(paths[i], lines.join('\n')));
        check(new NewTranspiler().transpiler.transpileJavaByPath(paths[0]).content as string, problems);
    } catch (e: any) {
        problems.push(`${threw}: ${e.message}`);
    } finally {
        for (const p of paths) fs.rmSync(p, { force: true });
    }
    return problems;
}

type SnippetCase = [string, string, string | undefined];

// expect set: pass(wrap(body)) must include it and satisfy `extra`; unset: it must equal `unchanged(body)`
function runSnippetCases (cases: SnippetCase[], wrap: (body: string) => string, pass: (src: string) => string, label: (name: string, out: string) => string, unchanged = wrap, extra = (out: string) => true): string[] {
    const problems: string[] = [];
    for (const [ name, body, expect ] of cases) {
        const out = pass (wrap (body));
        const ok = expect === undefined ? out === unchanged (body) : out.includes (expect) && extra (out);
        if (!ok) problems.push (label (name, out));
    }
    return problems;
}

// [regex(es), mustMatch, message]: mustMatch fails unless every regex matches, else fails if any matches
type JavaProbeCheck = [RegExp | RegExp[], boolean, string];
type JavaProbeSpec = { cls?: string, members?: string[], files?: [string, string[]][], checks: JavaProbeCheck[], threw?: string, output?: boolean };

// probeSelfTest over a binance-derived class `cls` holding `members` (or explicit `files`); `output` appends the Java on failure
function javaProbeCases (spec: JavaProbeSpec): string[] {
    const files = spec.files ?? [ [ spec.cls ?? '', [ "import Exchange from './abstract/binance.js';", `export default class ${spec.cls} extends Exchange {`, ...spec.members ?? [], '}' ] ] ];
    return probeSelfTest(files, (out, problems) => {
        for (const [ rx, mustMatch, message ] of spec.checks) {
            const rxs = Array.isArray(rx) ? rx : [ rx ];
            if (mustMatch ? !rxs.every((r) => r.test(out)) : rxs.some((r) => r.test(out))) problems.push(message);
        }
        if (spec.output && problems.length) problems.push('output:\n' + out);
    }, spec.threw);
}

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
    const wired = [
        mapLocalsSelfTest,
        javaFreshObjectMapWritesSelfTest,
        javaPredictionMapLocalsSelfTest,
        javaFreshMapParameterSelfTest,
        javaCounterLocalsSelfTest,
        javaMapLocalsSelfTest,
        javaTypedArithmeticSelfTest,
        javaParamTypesSelfTest,
        javaListLocalsSelfTest,
        javaScalarLocalsSelfTest,
        javaParamTypesPreScanSelfTest,
        javaStringReturnsSelfTest,
        javaNonNullCompareSelfTest,
        javaParamCompareSelfTest,
        javaCoreArgIdentitiesSelfTest,
        javaPrimitiveArithmeticSelfTest,
        javaNumericLocalsRetypeSelfTest,
        javaMapLocalsRetypeSelfTest,
        javaNumberParamCompareSelfTest,
        javaWsOrderBookContainersSelfTest,
        javaBoxLocalsCoreArgsSelfTest,
        javaIntegralMultiplySubtractSelfTest,
        javaNumberDivModNegSelfTest,
        javaInlineDivModNegSelfTest,
        javaInlineCompareSelfTest,
        javaContainerOpsSelfTest,
        javaCoreArgHelpersSelfTest,
        javaIsEqualSelfTest,
        x21SelfTest,
        x22SelfTest,
        javaPaginationCursorSelfTest,
        javaNonNullMapPutsSelfTest,
        javaTypedCoreDirectReturnSelfTest,
        javaR77j2ConditionalLocalsSelfTest,
        javaNullSeedJoinSelfTest,
        javaBaseProducerLocalsSelfTest,
        j6ReaderLocalsSelfTest,
        javaJ8CopyLocalsSelfTest,
        javaR84j1StringElementLocalsSelfTest,
        javaR84j2ContainerLocalsSelfTest,
        javaR84j2GuardedListLocalsSelfTest,
        javaR84j2MapConditionalLocalsSelfTest,
        javaR84j4NullSeedSelfTest,
        javaR84j5CalleeReturnsSelfTest,
        javaR87j5CalleeReturnsSelfTest,
        j84j6TrueOnlyLocalsSelfTest,
        javaR84j8LocalsSelfTest,
        javaR87j2WsLocalsSelfTest,
        javaR87j2LengthListLocalsSelfTest,
        javaR87j2UrlLocalsSelfTest,
        javaR87j4SplitSeedSelfTest,
        javaR87j8LocalsSelfTest,
        javaR90j2ElementListLocalsSelfTest,
        javaR90j2PromiseAllLocalsSelfTest,
        javaR90j2ElementMapLocalsSelfTest,
        javaR90j2ElementMapSlotSelfTest,
        javaR90j4NullSeedSelfTest,
        javaR90j6ReaderLocalsSelfTest,
        javaR90j8LocalsSelfTest,
        javaR92j2MarketTypeParamsSelfTest,
        javaR92j2SlotHandOffSelfTest,
        javaR92j2ElementMapWritesSelfTest,
        javaR92j2StringSlotLocalsSelfTest,
        javaR92j4NullSeedConsumerSelfTest,
        javaR92j8LocalsSelfTest,
        javaR93j2ListLocalsSelfTest,
        javaR93j8LocalsSelfTest,
        javaH26J03AsDictReaderSelfTest,
        h27J05HoistPureValuesSelfTest,
        h28J05HoistSelfTest,
        h29J05HoistSelfTest,
        h30J05HoistSelfTest,
    ];
    return problems.concat(...wired.map((selfTest) => selfTest()));
}

// ral-77j5: locals of base producers whose hand-written Java return is concrete (byte[] / Integer);
// a byte[] local handed to a typed slot, an Integer local in a ternary arm and a redeclared producer keep Object
function javaBaseProducerLocalsSelfTest (): string[] {
    const problems: string[] = [];
    const probe = path.join(process.cwd(), 'ts', 'src', `zz77j5selftest${process.pid}.ts`);
    const body = [
        "import Exchange from './abstract/binance.js';",
        `export default class zz77j5selftest${process.pid} extends Exchange {`,
        "    sink (m: any, k: string): string { return k; }",
        "    typed (m: string): string { return m; }",
        "    pos (d: any, t: any, p: any) { const enc = this.ethEncodeStructuredData (d, t, p); const bin = this.encode ('x'); const n = this.binaryLength (bin); const r = this.randNumber (6); const q = this.precisionFromString ('0.01'); return [ this.sink (enc, 'k'), this.hash (bin, undefined, 'hex'), this.numberToString (n), this.numberToString (r), q ]; }",
        "    str (x: string) { const pp = this.parsePrecision (x); return { 'p': pp }; }",
        "    b16 (h: string) { const hb = this.base16ToBinary (h); const hl = this.base16ToBinary (h); const hs = this.base16ToBinary (h); return [ this.sink (hb, 'k'), [ hl, 1 ], this.typed (hs as any) ]; }",
        "    zzBytesJoin (h: string) { const a = this.base16ToBinary (h); const m = this.binaryConcat (a, a); return m; }",
        "    zzBytesMixed (h: string) { if (h === '') { return h; } return this.base16ToBinary (h); }",
        "    zzBytesUse (h: string) { const mm = this.zzBytesJoin (h); const mx = this.zzBytesJoin (h); return [ this.sink (mm, 'k'), this.typed (mx as any) ]; }",
        "    neg (d: any, t: any, p: any) { const enc2 = this.ethEncodeStructuredData (d, t, p); const r2 = this.randNumber (6); const u = (d === undefined) ? r2 : 0; return [ this.typed (enc2 as any), u ]; }",
        '}',
    ].join('\n');
    try {
        fs.writeFileSync(probe, body);
        const out = new NewTranspiler().transpiler.transpileJavaByPath(probe).content as string;
        if (!/byte\[\] enc = this\.ethEncodeStructuredData\(/.test(out)) problems.push("base producers: 'enc' (ethEncodeStructuredData into an Object slot) must print byte[]");
        if (!/byte\[\] bin = this\.encode\(/.test(out)) problems.push("base producers: 'bin' (encode into hash/binaryLength) must print byte[]");
        for (const name of [ 'n', 'r', 'q' ]) {
            if (!new RegExp(`Integer ${name} = this\\.`).test(out)) problems.push(`base producers: '${name}' (int producer) must print Integer`);
        }
        if (!/byte\[\] hb = this\.base16ToBinary\(/.test(out)) problems.push("bytes helpers: 'hb' (base16ToBinary into a venue Object slot) must print byte[]");
        if (!/byte\[\] hl = this\.base16ToBinary\(/.test(out)) problems.push("bytes helpers: 'hl' (base16ToBinary into a list literal) must print byte[]");
        if (!/public byte\[\] zzBytesJoin\(/.test(out) || !/byte\[\] m = this\.binaryConcat\(/.test(out)) problems.push("bytes returns: 'zzBytesJoin' (returns a binaryConcat local) must print byte[]");
        if (!/public Object zzBytesMixed\(/.test(out)) problems.push("bytes returns: 'zzBytesMixed' (a string return site) must stay Object");
        if (!/byte\[\] mm = this\.zzBytesJoin\(/.test(out)) problems.push("bytes returns: 'mm' (byte[] method into an Object slot) must print byte[]");
        if (!/\bObject mx = /.test(out)) problems.push("bytes returns: 'mx' feeds a typed String slot and must stay Object");
        if (!/\bObject hs = /.test(out)) problems.push("bytes helpers: 'hs' feeds a typed String slot and must stay Object");
        if (!/\bObject enc2 = /.test(out)) problems.push("base producers: 'enc2' feeds a typed String slot and must stay Object");
        if (!/\bObject r2 = /.test(out)) problems.push("base producers: 'r2' is a ternary arm and must stay Object");
        // base-tier `: Str` methods printed below the transpile delimiter: a String-returning, never redeclared one prints String
        if (!/String pp = this\.parsePrecision\(/.test(out)) problems.push("base producers: 'pp' (base-tier String method) must print String with no checkcast");
    } catch (e: any) {
        problems.push(`base producers self-test threw: ${e.message}`);
    } finally {
        fs.rmSync(probe, { force: true });
    }
    return problems;
}

// ral-84j5: base `: Str` callees whose every return prints String (networkCodeToId) print `public String`,
// so the caller's local is String and its `.toUpperCase ()` is native (no `((String)x)` receiver cast)
function javaR84j5CalleeReturnsSelfTest (): string[] {
    const problems: string[] = [];
    const probe = path.join(process.cwd(), 'ts', 'src', `zz84j5selftest${process.pid}.ts`);
    const body = [
        "import Exchange from './abstract/binance.js';",
        "import type { Strings, Dict } from './base/types.js';",
        `export default class zz84j5selftest${process.pid} extends Exchange {`,
        "    net (code: string, networkCode: string) { const request: any = {}; const nid = this.networkCodeToId (networkCode, code); if (nid !== undefined) { request['chain'] = nid.toUpperCase (); } return request; }",
        "    syms (symbols: Strings = undefined) { const sn: Strings = this.marketSymbols (symbols, undefined, false); const out = []; for (let i = 0; i < (sn as string[]).length; i++) { out.push (this.market ((sn as string[])[i])); } return out; }",
        "    urlOf (g: string) { const bu = this.urls['api'] as Dict; return this.safeString (bu, g, bu['public']); }",
        "    urlOnly (g: string) { const bu2 = this.urls['api'] as Dict; return this.safeString (bu2, g); }",
        '}',
    ].join('\n');
    try {
        fs.writeFileSync(probe, body);
        const out = new NewTranspiler().transpiler.transpileJavaByPath(probe).content as string;
        if (!/String nid = this\.networkCodeToId\(/.test(out)) problems.push("ral-84j5: 'nid' (networkCodeToId, every return String) must print String");
        if (!/nid\.toUpperCase\(\)/.test(out) || /\(\(String\)nid\)/.test(out)) problems.push("ral-84j5: 'nid.toUpperCase ()' must print natively with no (String) receiver cast");
        // `x as string[]` uses of a marketSymbols local: the List<String> local takes them as the identity
        if (!/List<String> sn = this\.marketSymbols\(/.test(out)) problems.push("ral-84j5: 'sn' (marketSymbols, used through `as string[]`) must print List<String>");
        if (/<\?>\)\(List<String>\)\(sn\)/.test(out)) problems.push("ral-84j5: '(sn as string[]).length' must print without the List<String> assertion cast");
        // `this.urls['api']` locals read by a string key: Map local, native `.get`; with no element read they stay Object
        if (!/(java\.util\.)?Map<String, Object> bu = \((java\.util\.)?Map<String, Object>\) this\.urls\.get\("api"\);/.test(out) || !/bu\.get\("public"\)/.test(out)) problems.push("ral-84j5: 'bu' (this.urls['api'] read by key) must print Map<String, Object> with a native .get");
        if (!/Object bu2 = /.test(out)) problems.push("ral-84j5: 'bu2' (no element read) must stay Object");
    } catch (e: any) {
        problems.push(`ral-84j5 self-test threw: ${e.message}`);
    } finally {
        fs.rmSync(probe, { force: true });
    }
    return problems;
}

// ral-87j5: venue / base callees whose every return proves the type print it, so their result locals use it natively
function javaR87j5CalleeReturnsSelfTest (): string[] {
    const problems: string[] = [];
    const probe = path.join(process.cwd(), 'ts', 'src', 'pro', `zz87j5selftest${process.pid}.ts`);
    const body = [
        "import Exchange from '../binance.js';",
        "import type { Str, Dict, Int } from '../base/types.js';",
        `export default class zz87j5selftest${process.pid} extends Exchange {`,
        "    getSettlementCurrencies (type: string, method: string): string[] { return this.safeList (this.options, type, [ 'usdt' ]) as string[]; }",
        "    useSc () { const sc = this.getSettlementCurrencies ('swap', 'fetchMarkets'); let n = 0; for (let c = 0; c < sc.length; c++) { n += 1; } return n; }",
        "    useMh (client: any) { const mh = this.findMessageHashes (client, 'positions::'); for (let j = 0; j < mh.length; j++) { client.resolve ([], mh[j]); } }",
        "    getStockWsUrl (streamType: Str = 'market'): string { const wsUrls: Dict = this.safeDict (this.safeDict (this.urls, 'api', {}), 'ws', {}); const baseUrl = wsUrls['stock']; if (streamType === 'combined') { return baseUrl.replace ('/ws', '/stream'); } return baseUrl; }",
        "    requestId (url: string): Int { return this.sum (url.length, 1); }",
        "    useSu () { const su = this.getStockWsUrl ('user'); return this.requestId (su); }",
        "    useOh (trades: any[]) { const oh = this.buildOHLCVC (trades, '1m', 0, 10); return oh.length; }",
        "    findOutcomeInMarket (market: Dict, hint: Str = undefined): Dict { return this.safeDict (this.safeList (market, 'outcomes', []), 0, {}); }",
        "    useFo (market: Dict) { const fo = this.findOutcomeInMarket (market); return Object.keys (fo).length > 0; }",
        '}',
    ].join('\n');
    try {
        fs.writeFileSync(probe, body);
        const out = new NewTranspiler().transpiler.transpileJavaByPath(probe).content as string;
        if (!/(java\.util\.)?List<Object> getSettlementCurrencies\(/.test(out)) problems.push("ral-87j5: venue getSettlementCurrencies (: string[]) must print List<Object>");
        if (!/(java\.util\.)?List<Object> sc = this\.getSettlementCurrencies\(/.test(out) || !/c < sc\.size\(\)/.test(out)) problems.push("ral-87j5: 'sc' must print List<Object> with a native .size()");
        if (!/(java\.util\.)?List<Object> mh = this\.findMessageHashes\(/.test(out) || /\(List<\?>\)mh/.test(out)) problems.push("ral-87j5: 'mh' (base findMessageHashes) must print List<Object> with native list reads");
        // a const String result of a venue-typed callee passes a String parameter bare (no `(String) (su)` checkcast)
        if (!/String su = this\.getStockWsUrl\(/.test(out) || !/this\.requestId\(su\)/.test(out)) problems.push("ral-87j5: 'su' (String venue callee result) must be passed to a String parameter with no checkcast");
        if (!/(java\.util\.)?List<Object> oh = this\.buildOHLCVC\(/.test(out)) problems.push("ral-87j5: 'oh' (base buildOHLCVC: OHLCVC[]) must print List<Object>");
        if (!/(java\.util\.)?Map<String, Object> fo = this\.findOutcomeInMarket\(/.test(out) || /\(\(Map<String, Object>\)fo\)/.test(out)) problems.push("ral-87j5: 'fo' (venue findOutcomeInMarket: Dict) must print Map<String, Object> with a native use");
    } catch (e) {
        problems.push(`ral-87j5 self-test threw: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
        fs.rmSync(probe, { force: true });
    }
    return problems;
}

// section 50 is fail-closed: a nested, closure or Object-returning (safeDict / safeValue) write keeps `Object`
function mapLocalsSelfTest (): string[] {
    const problems: string[] = [];
    // ral-77j3: `url = <string> + url` keeps a non-null String local String (its own read anchors the native concat)
    const selfAnchored = path.join(process.cwd(), 'ts', 'src', `zz77j3selftest${process.pid}.ts`);
    try {
        fs.writeFileSync(selfAnchored, [
            "import Exchange from './abstract/binance.js';",
            'export default class zz77j3selftest extends Exchange {',
            "    pos (path: string, host: string) { let url = '/'; url += path; url = host + url; return url; }",
            "    neg (path: string, host: any) { let other = '/'; other += path; other = host + other; return other; }",
            '}',
        ].join('\n'));
        const out = new NewTranspiler().transpiler.transpileJavaByPath(selfAnchored).content as string;
        if (!/String url = "\/";/.test(out) || !/url = \(host \+ url\);/.test(out)) problems.push("ral-77j3: 'url' (every write a non-null String, `host + url` self-anchored) must print String with a native concat");
        if (!/Object other = "\/";/.test(out)) problems.push("ral-77j3: 'other' (an `any` left operand) must stay Object");
    } catch (e: any) {
        problems.push(`ral-77j3 self-test threw: ${e.message}`);
    } finally {
        fs.rmSync(selfAnchored, { force: true });
    }
    // ral-84j3: base encoder writes, const String copies and `<number>.toString ()` keep a non-null String local String
    const r84j3 = path.join(process.cwd(), 'ts', 'src', `zz84j3selftest${process.pid}.ts`);
    try {
        fs.writeFileSync(r84j3, [
            "import Exchange from './abstract/binance.js';",
            "import type { Dict } from './base/types.js';",
            'export default class zz84j3selftest extends Exchange {',
            "    enc (q: Dict, p: string) { let body = ''; if (p === 'a') { body = this.urlencode (q); } const base = p + '/'; let auth = ''; auth = base; auth = body + '|' + base; return auth + body; }",
            "    num (m: string) { let nonce = ''; nonce = this.milliseconds ().toString (); let a = ''; a = nonce + m; return a; }",
            "    neg (q: any, p: string) { let other = ''; other = this.implodeParams (p, q); return other; }",
            '}',
        ].join('\n'));
        const out = new NewTranspiler().transpiler.transpileJavaByPath(r84j3).content as string;
        if (!/String body = "";/.test(out) || !/String auth = "";/.test(out)) problems.push("ral-84j3: 'body' (urlencode write) and 'auth' (const String copy) must print String");
        if (!/String nonce = "";/.test(out)) problems.push("ral-84j3: 'nonce' (`this.milliseconds ().toString ()` write) must print String");
        if (!/Object other = "";/.test(out)) problems.push("ral-84j3: 'other' (implodeParams is declared Object) must stay Object");
    } catch (e: any) {
        problems.push(`ral-84j3 self-test threw: ${e.message}`);
    } finally {
        fs.rmSync(r84j3, { force: true });
    }
    // ral-87j3 R1: JSON.stringify / toUpperCase / replaceAll-of-self / remove0xPrefix writes keep a non-null String local String
    const r87j3 = path.join(process.cwd(), 'ts', 'src', `zz87j3selftest${process.pid}.ts`);
    try {
        fs.writeFileSync(r87j3, [
            "import Exchange from './abstract/binance.js';",
            "import type { Dict, Str } from './base/types.js';",
            'export default class zz87j3selftest extends Exchange {',
            "    js (q: Dict, p: string) { let body = ''; if (p === 'a') { body = JSON.stringify (q); } let auth = ''; auth = p + '?'; auth += body; return auth; }",
            "    up (p: string, k: string) { let s = ''; s = p.toUpperCase (); s = s.replaceAll (k, '-'); const parts = s.split ('-'); return parts; }",
            "    hex (p: string) { let h = ''; h = this.remove0xPrefix (p); return h + '00'; }",
            "    neg (p: Str, k: string) { let t = ''; t = p.replaceAll (k, '-'); return t + k; }",
            '}',
        ].join('\n'));
        const out = new NewTranspiler().transpiler.transpileJavaByPath(r87j3).content as string;
        if (!/String body = "";/.test(out) || !/auth = \(auth \+ body\)/.test(out)) problems.push("ral-87j3: 'body' (JSON.stringify write) must print String and `auth += body` a native concat");
        if (!/String s = "";/.test(out) || !/\(s\.split\(/.test(out)) problems.push("ral-87j3: 's' (toUpperCase / replaceAll-of-self writes) must print String with a bare split receiver");
        if (!/String h = "";/.test(out)) problems.push("ral-87j3: 'h' (remove0xPrefix write) must print String");
        if (!/Object t = "";/.test(out)) problems.push("ral-87j3: 't' (replaceAll of a nullable Str receiver) must stay Object");
    } catch (e) {
        problems.push(`ral-87j3 self-test threw: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
        fs.rmSync(r87j3, { force: true });
    }
    // ral-87j3 R2: an int-literal counter written only by base this.sum of integral operands prints Long and compares natively
    const r87j3b = path.join(process.cwd(), 'ts', 'src', `zz87j3bselftest${process.pid}.ts`);
    try {
        fs.writeFileSync(r87j3b, [
            "import Exchange from './abstract/binance.js';",
            "import type { Dict } from './base/types.js';",
            'export default class zz87j3bselftest extends Exchange {',
            "    walk (xs: any[], step: number) { const n = xs.length; let i = 0; while (i < n) { i = this.sum (i, 1); } return i; }",
            "    neg (xs: any[], p: Dict) { const n = xs.length; let j = 0; while (j < n) { j = this.sum (j, this.safeValue (p, 'k')); } return j; }",
            "    arg (p: Dict) { let k = 0; k = this.sum (k, 1); return this.safeValue (p, k); }",
            "    cap (xs: any[], p: Dict) { const n = xs.length; const a = this.safeInteger (p, 'a', 1); let e = this.sum (a, 2); if (e > n) { e = n; } return e; }",
            "    left (s: string) { let d = 0; if (s.length < 5) { d = 5 - s.length; } return d > 2; }",
            "    async step (xs: any[]) { let r = 0; for (let q = 0; q < xs.length; q++) { try { await this.loadMarkets (); } catch (e) { r = r + 1; } } return r; }",
            '}',
        ].join('\n'));
        const out = new NewTranspiler().transpiler.transpileJavaByPath(r87j3b).content as string;
        // ral-90j3 loosened: a counter's sum of two proven longs now prints the native add `i = (i + 1L)`
        if (!/Long i = 0L;/.test(out) || !/i = (?:\(Long\) this\.sum\(i, 1\)|\(i \+ 1L\))/.test(out)) problems.push("ral-87j3: 'i' (sum-of-integral counter) must print Long with a checkcast or native sum write");
        if (!/Object j = 0;/.test(out)) problems.push("ral-87j3: 'j' (sum with an Object operand) must stay Object");
        if (!/Object k = 0;/.test(out)) problems.push("ral-87j3: 'k' (no comparison / arithmetic use) must stay Object");
        if (!/Long e = (?:\(Long\) this\.sum\(a, 2\)|\(a \+ 2L\));/.test(out) || !/e = Long\.valueOf\(n\)/.test(out)) problems.push("ral-87j3 R3: 'e' (sum initializer, length-const write) must print Long");
        if (!/Long d = 0L;/.test(out)) problems.push("ral-87j3 R3: 'd' (native long write) must print Long");
        if (!/Long r = 0L;/.test(out) || !/r = \(r \+ 1L\);/.test(out)) problems.push("ral-87j3 R4: 'r' (self step write) must print Long with a native add");
    } catch (e) {
        problems.push(`ral-87j3 R2 self-test threw: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
        fs.rmSync(r87j3b, { force: true });
    }
    // ral-90j3: base this.sum of two proven non-null longs prints the native long add (no `(Long)` checkcast)
    const r90j3 = path.join(process.cwd(), 'ts', 'src', `zz90j3selftest${process.pid}.ts`);
    try {
        fs.writeFileSync(r90j3, [
            "import Exchange from './abstract/binance.js';",
            "import type { Dict } from './base/types.js';",
            'export default class zz90j3selftest extends Exchange {',
            "    rid () { const requestId = this.sum (this.safeInteger (this.options, 'requestId', 0), 1); this.options['requestId'] = requestId; return requestId; }",
            "    exp () { const expiry = this.sum (this.milliseconds (), 5000); return expiry > 3; }",
            "    walk (xs: any[]) { const n = xs.length; let i = 0; while (i < n) { i = this.sum (i, 1); } return i; }",
            "    neg (p: Dict) { const a = this.sum (this.safeInteger (p, 'a'), 1); return a; }",
            "    neg2 (p: Dict) { const b = this.sum (this.safeValue (p, 'b'), 1); return b; }",
            "    cut (s: string, p: Dict) { const a = this.safeInteger (p, 'a', 0); const e = this.sum (a, 2); return s.slice (a, e); }",
            "    put (p: Dict) { const a = this.safeInteger (p, 'a', 0); const f = this.sum (a, 2); p['f'] = f; return p; }",
            "    loop (xs: any[]) { const n = xs.length; const out = []; let s = 0; while (s < n) { let t = this.sum (s, 2); if (t > n) { t = n; } for (let k = s; k < t; k++) { out.push (xs[k]); } s = this.sum (s, 2); } return out; }",
            "    loop2 (xs: any[]) { const n = xs.length; let s = 0; while (s < n) { let t = this.sum (s, 2); if (t > n) { t = n; } for (let m = s; m < t; m++) { m = m + 1; } s = this.sum (s, 2); } return s; }",
            '}',
        ].join('\n'));
        const out = new NewTranspiler().transpiler.transpileJavaByPath(r90j3).content as string;
        if (!/Long requestId = \(this\.safeInteger\(this\.options, "requestId", 0\) \+ 1L\);/.test(out)) problems.push("ral-90j3: 'requestId' (safeInteger with int default + 1) must print the native long add");
        if (!/Long expiry = \(this\.milliseconds\(\) \+ 5000L\);/.test(out)) problems.push("ral-90j3: 'expiry' (milliseconds + literal) must print the native long add");
        if (!/i = \(i \+ 1L\);/.test(out)) problems.push("ral-90j3: counter sum write must print the native long add");
        if (!/Long a = \(Long\) this\.sum\(/.test(out) && !/Object a = this\.sum\(/.test(out)) problems.push("ral-90j3: 'a' (safeInteger without default) must keep this.sum");
        if (!/Object b = this\.sum\(/.test(out)) problems.push("ral-90j3: 'b' (Object operand) must stay Object");
        if (!/Long e = \(a \+ 2L\);/.test(out)) problems.push("ral-90j3 R2: 'e' (const-local sum feeding a slice bound) must print the native long add");
        if (/Long f = \(a \+ 2L\);/.test(out)) problems.push("ral-90j3 R2: 'f' (const-local sum only put into a map) must not be retyped by R2");
        if (!/for \(long k = s; k < t; k\+\+\)/.test(out)) problems.push("ral-90j3 R3: 'k' (loop between two Long counters) must print a native long header");
        if (/for \(long m = s; m < t; m\+\+\)/.test(out)) problems.push("ral-90j3 R3: 'm' (loop variable written in the body) must keep the helper header");
    } catch (e) {
        problems.push(`ral-90j3 self-test threw: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
        fs.rmSync(r90j3, { force: true });
    }
    // integer-literal defaulted number slots (buildOHLCVC since / limit) print Long, so call sites pass NL
    const r92j3 = path.join(process.cwd(), 'ts', 'src', `zz92j3selftest${process.pid}.ts`);
    try {
        fs.writeFileSync(r92j3, [
            "import Exchange from './abstract/binance.js';",
            "import type { Int, Dict, Trade } from './base/types.js';",
            'export default class zz92j3selftest extends Exchange {',
            "    candles (trades: Trade[]) { const c = this.buildOHLCVC (trades, '1m', 0, 100); return c; }",
            "    insertMissingCandles (candles: number[][], distanceInMs: number, since: Int, limit: number): number[] { const out: number[] = []; let n: Int = 0; while (n < limit) { out.push (n); n = this.sum (n, 1); } return out; }",
            "    fill (xs: number[][]) { return this.insertMissingCandles (xs, 1000, undefined, 5); }",
            "    within (xs: string[], p: Dict) { const end = this.safeInteger (p, 'end'); return this.parseToInt (xs[0]) > end; }",
            "    deadline () { const d = this.seconds () + this.safeInteger (this.options, 'expiry', 600); return d; }",
            "    grow (p: Dict, n: Int = 1) { const have = this.safeInteger (p, 'have', 0); const next = have + n; return next > 10; }",
            "    sig (o: Dict) { const s = this.remove0xPrefix (this.safeString (o, 'r')) + this.intToBase16 (o['v']); return '0x' + s; }",
            '}',
        ].join('\n'));
        const out = new NewTranspiler().transpiler.transpileJavaByPath(r92j3).content as string;
        if (!/this\.buildOHLCVC\([^\n]*, 0L, 100L\)/.test(out)) problems.push("r92j3 R1: buildOHLCVC since / limit must take Long arguments");
        if (!/this\.insertMissingCandles\(xs, 1000, \(Object\) null, 5L\)|this\.insertMissingCandles\(xs, 1000, null, 5L\)/.test(out)) problems.push("r92j3 R2: a fixed whole-number slot must take its int literal as NL");
        if (!/List<Object> insertMissingCandles\([^)]*Long limit\)/.test(out)) problems.push("r92j3 R2: insertMissingCandles limit must print Long");
        if (!/this\.parseToInt\([^\n]*\) > end\)/.test(out) || /\}\)\.test\(this\.parseToInt\(/.test(out)) problems.push("r92j3 R3: a parseToInt compare operand must print the native compare");
        if (!/= \(this\.seconds\(\) \+ this\.safeInteger\(this\.options, "expiry", 600\)\);/.test(out)) problems.push("r92j3 R4: a defaulted safeInteger operand must print the native long add");
        if (!/Long next = \(have \+ java\.util\.Objects\.requireNonNullElse\(n, 1L\)\);/.test(out)) problems.push("r92j3 R4: 'next' (sum of a defaulted safeInteger local and a Long slot) must be a native Long");
        if (!/String s = \(this\.remove0xPrefix\(this\.safeString\(o, "r"\)\) \+ this\.intToBase16\(/.test(out)) problems.push("r92j3 R5: remove0xPrefix + intToBase16 must print the native concat");
    } catch (e) {
        problems.push(`r92j3 self-test threw: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
        fs.rmSync(r92j3, { force: true });
    }
    // String / Long temps of inlined helper blobs and literal seeds
    const r93j3 = path.join(process.cwd(), 'ts', 'src', `zz93j3selftest${process.pid}.ts`);
    try {
        fs.writeFileSync(r93j3, [
            "import Exchange from './abstract/binance.js';",
            "import type { Dict } from './base/types.js';",
            'export default class zz93j3selftest extends Exchange {',
            "    formatNumber (data: string): string { const parts = data.split ('.'); let joined = this.safeString (parts, 0, '') + this.safeString (parts, 1, ''); while (joined.startsWith ('0')) { joined = joined.slice (1); } return joined; }",
            "    pair (xs: string[]) { let out = ''; if (xs.length > 1) { out = this.formatNumber (xs[0]) + this.formatNumber (xs[1]); } return out; }",
            "    capped (p: Dict) { const left = this.parseToInt (this.safeString (p, 'l')); let digits = 0; if (left > 2) { digits = 5 - left; } return Math.min (left, digits); }",
            "    diff (p: Dict, s: string) { const sz = this.parseToInt (this.safeString (p, 'sz')); const most = 8 - sz; let left = 0; if (s.length <= 5) { left = 5 - (s.length); } const capped = (most < left) ? most : left; let z = ''; for (let i = 1; i < capped; i++) { z = z + '0'; } return z; }",
            "    scale (p: Dict) { let f = 1; for (let i = 0; i < 3; i++) { f = this.parseToInt (f * 256); } return f; }",
            "    pad (p: string) { const n = parseInt (p); let s = '1'; for (let i = 0; i < -1 - n; i++) { s = s + '0'; } return s; }",
            '}',
        ].join('\n'));
        const out = new NewTranspiler().transpiler.transpileJavaByPath(r93j3).content as string;
        if (!/public String formatNumber\(/.test(out)) problems.push("r93j3 R1: formatNumber must print String");
        if (!/out = \(this\.formatNumber\([^\n]*\) \+ this\.formatNumber\(/.test(out)) problems.push("r93j3 R1: formatNumber + formatNumber must print the native concat");
        if (!/String joined = /.test(out)) problems.push("r93j3 R2: a concat of literal-defaulted safeString reads, sliced by itself, must be a String local");
        if (!/Long digits = 0L;/.test(out)) problems.push("r93j3 R3: an int counter fed to Math.min with a long must print Long");
        if (!/Long most = \(8L - sz\);/.test(out)) problems.push("r93j3 R4: int literal minus a parseToInt const must print Long");
        if (!/Long f = 1L;/.test(out)) problems.push("r93j3 R5: an int counter written by parseToInt must print Long");
        if (!/i < \(-1 - n\); i\+\+/.test(out)) problems.push("r93j3 R6: a negated int literal minus a Long must print the native compare");
    } catch (e) {
        problems.push(`r93j3 self-test threw: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
        fs.rmSync(r93j3, { force: true });
    }
    const probe = path.join(process.cwd(), 'ts', 'src', `zzmaplocalsselftest${process.pid}.ts`);
    const body = [
        "import Exchange from './abstract/binance.js';", "import type { Dict } from './base/types.js';",
        'export default class zzmaplocalsselftest extends Exchange {',
        "    nestedIntKey (response: any, params = {}) { let data = this.extend (params, {}); if (Array.isArray (response)) { data = this.safeDict (response, 0, {}); } return this.omit (data, 'a'); }",
        "    nestedStrKey (ticker: any, params = {}) { let raw = this.extend (params, {}); if (ticker !== undefined) { if (ticker['x'] !== undefined) { raw = this.safeDict (ticker, 'market', {}); } } return this.omit (raw, 'a'); }",
        "    closure (params = {}) { let p = this.extend (params, {}); const f = () => { p = this.safeValue (params, 'q'); }; f (); return this.omit (p, 'a'); }",
        "    positive (params = {}) { let q = this.extend (params, {}); if (params['z'] !== undefined) { q = this.extend (q, {}); } return this.omit (q, 'a'); }",
        "    async accReturnAsync (params = {}) { let r = undefined; try { r = await this.zzAccHelper (params); } catch (e) { r = await this.zzAccHelper (params); } return r; }",
        "    async accReturnTernary (params = {}) { let s = undefined; try { s = await this.zzAccHelper (params); } catch (e) { s = await this.zzAccHelper (params); } return (params['z'] !== undefined) ? s : undefined; }",
        "    async zzAccHelper (params = {}): Promise<Dict> {", "        return {};", "    }",
        '}',
    ].join('\n');
    try {
        fs.writeFileSync(probe, body);
        const out = new NewTranspiler().transpiler.transpileJavaByPath(probe).content as string;
        if (!/\bObject p = /.test(out)) problems.push("map locals: 'p' has an unproven write and must stay Object");
        // the Map-locals pass types the nested safeDict writes and prints their checkcast
        for (const name of [ 'data', 'raw' ]) {
            if (!new RegExp(`\\bObject ${name} = `).test(out) && !new RegExp(`\\b${name} = \\(java\\.util\\.Map<String, Object>\\) this\\.safeDict\\(`).test(out)) problems.push(`map locals: '${name}' safeDict write needs Object or a checkcast`);
        }
        if (!/Map<String, Object> q = /.test(out)) problems.push("map locals: 'q' (every write a Map) must print Map<String, Object>");
        // a null accumulator returned whole from an async method (its supplyAsync lambda) joins its writes; a ternary-arm return keeps Object
        if (!/Map<String, Object> r = null;/.test(out)) problems.push("null accumulator: 'r' returned from an async method must print java.util.Map<String, Object>");
        if (!/\bObject s = null;/.test(out)) problems.push("null accumulator: 's' returned through a ternary arm must stay Object");
    } catch (e: any) {
        problems.push(`map locals self-test threw: ${e.message}`);
    } finally {
        fs.rmSync(probe, { force: true });
    }
    // ral-87j7: a prediction venue's parsePredictionOrder (returns this.safePredictionOrder ({..})) is a
    // fresh map through base/PredictionExchange.ts: its result local prints Map and the write a native put;
    // parsePredictionPositions / parsePredictionTrades results print List<Object> read by size()/get
    const r87j7 = path.join(process.cwd(), 'ts', 'src', 'prediction', `zz87j7selftest${process.pid}.ts`);
    try {
        fs.writeFileSync(r87j7, [
            "import Exchange from '../abstract/prediction/kalshi.js';",
            "import type { Dict, Market, PredictionOrder, Str } from '../base/types.js';",
            'export default class zz87j7selftest extends Exchange {',
            "    zzCancel (response: Dict, id: string) { const order = this.parsePredictionOrder (response); order['id'] = id; return order; }",
            "    zzPositions (rows: any[]) { const parsed = this.parsePredictionPositions (rows); let n = 0; for (let i = 0; i < parsed.length; i++) { n += 1; } return n; }",
            "    zzPosition (raw: Dict) { const position = this.parsePredictionPosition (raw); return position['outcome']; }",
            "    parsePredictionOrder (order: Dict, market: Market = undefined): PredictionOrder { return this.safePredictionOrder ({ 'id': this.safeString (order, 'id') }, market); }",
            "    async zzRawRows (params: Dict = {}): Promise<Dict[]> {",
            "        const out: Dict[] = [];",
            "        return out;",
            "    }",
            "    async zzUseRows () { const rows = await this.zzRawRows (); return rows.length; }",
            "    async zzRawIds (): Promise<Str[]> {",
            "        const ids: Str[] = [];",
            "        return ids;",
            "    }",
            "    async zzUseIds () { const ids = await this.zzRawIds (); return ids.length; }",
            '}',
        ].join('\n'));
        resetJavaVenueIndexes();
        const out = new NewTranspiler().transpiler.transpileJavaByPath(r87j7).content as string;
        if (!/Map<String, ?Object> order = this\.parsePredictionOrder\(/.test(out) || !/order\.put\("id", id\);/.test(out)) problems.push("ral-87j7: a prediction-order result local must print Map with a native put");
        if (!/List<Object> parsed = this\.parsePredictionPositions\(/.test(out) || !/i < parsed\.size\(\)/.test(out)) problems.push("ral-87j7: a parsePredictionPositions result must print List<Object> read by size()");
        if (!/List<Object> rows = \(this\.zzRawRows\(/.test(out) || !/rows\.size\(\)/.test(out)) problems.push("ral-87j7: an awaited venue Promise<Dict[]> core (returns a local) must give a List<Object> local read by size()");
        if (!/Map<String, ?Object> position = this\.parsePredictionPosition\(/.test(out) || !/position\.get\("outcome"\)/.test(out)) problems.push("ral-90j7: a parsePredictionPosition result must print Map<String, Object> read by get()");
        if (!/List<Object> ids = \(this\.zzRawIds\(/.test(out)) problems.push("ral-87j7: an awaited venue Promise<Str[]> core (returns a local) must give a List<Object> local");
    } catch (e) {
        problems.push(`ral-87j7 self-test threw: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
        fs.rmSync(r87j7, { force: true });
    }
    // ral-90j7 R1: a Map-typed callee result with a `delete x[k]` use prints Map<String, Object> and a bare remove
    const r90j7 = path.join(process.cwd(), 'ts', 'src', `zz90j7selftest${process.pid}.ts`);
    try {
        fs.writeFileSync(r90j7, [
            "import Exchange from './paradex.js';",
            "import type { Dict, Num, OrderSide, OrderType, Str } from './base/types.js';",
            'export default class zz90j7selftest extends Exchange {',
            "    createOrderRequest (symbol: Str, type: Str, side: Str, amount: number, price: number = undefined, params: Dict = {}): Dict { return { 'instId': symbol }; }",
            "    zzWs (symbol: string, code: number) { const args = this.createOrderRequest (symbol, 'limit', 'buy', 1, undefined, {}); delete args['instId']; args['instIdCode'] = code; return args; }",
            "    async zzEdit (id: string, symbol: string, type: OrderType, side: OrderSide, amount: Num = undefined, price: Num = undefined, params = {}) { await this.loadMarkets (); let request = this.createOrderRequest (symbol, type, side, amount, price, params); request = this.omit (request, [ 'instruction', 'client_id' ]); request['order_id'] = id; request = await this.signOrderRequest (request, true); return request; }",
            "    zzWsTrades (rows: any[]) { const trades = this.parseWsTrades (rows); let n = 0; for (let j = 0; j < trades.length; j++) { n += 1; } return n; }",
            "    setMarkets (markets: any, currencies: any = undefined) { const result = super.setMarkets (markets, currencies); const symbols = Object.keys (result); return result; }",
            '}',
        ].join('\n'));
        const out = new NewTranspiler().transpiler.transpileJavaByPath(r90j7).content as string;
        if (!/Map<String, ?Object> args = this\.createOrderRequest\(/.test(out) || !/\bargs\.remove\("instId"\);/.test(out)) problems.push("ral-90j7: a Map callee result with a delete must print Map<String, Object> and a bare remove");
        if (!/Map<String, ?Object> request = this\.createOrderRequest\(/.test(out) || !/\brequest\.put\("order_id", id\);/.test(out)) problems.push("ral-90j7: a Map callee result rewritten by this.omit (self, ..) must stay Map<String, Object> with a native put");
        if (!/List<Object> trades = this\.parseWsTrades\(/.test(out) || !/j < trades\.size\(\)/.test(out)) problems.push("ral-90j7: a parseWsTrades result must print List<Object> read by size()");
        if (!/Map<String, ?Object> result = super\.setMarkets\(/.test(out) || !/result\.keySet\(\)/.test(out)) problems.push("ral-90j7: a super.setMarkets result must print Map<String, Object> read by keySet()");
    } catch (e) {
        problems.push(`ral-90j7 self-test threw: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
        fs.rmSync(r90j7, { force: true });
    }
    // a parse* result typed Map from its declaration (returns this.safePosition ({..})) is read natively
    const r92j7 = path.join(process.cwd(), 'ts', 'src', `zz92j7selftest${process.pid}.ts`);
    try {
        fs.writeFileSync(r92j7, [
            "import Exchange from './abstract/kucoin.js';",
            "import type { Dict, Market } from './base/types.js';",
            'export default class zz92j7selftest extends Exchange {',
            "    parseWsUtaPosition (position: Dict, market: Market = undefined): Dict { return this.safePosition ({ 'info': position, 'symbol': undefined }); }",
            "    zzUta (data: Dict) { const newPosition = this.parseWsUtaPosition (data); const keys = Object.keys (newPosition); for (let i = 0; i < keys.length; i++) { const key = keys[i]; if (newPosition[key] === undefined) { delete newPosition[key]; } } return newPosition; }",
            '}',
        ].join('\n'));
        const out = new NewTranspiler().transpiler.transpileJavaByPath(r92j7).content as string;
        if (!/Map<String, ?Object> newPosition = this\.parseWsUtaPosition\(/.test(out) || !/newPosition\.remove\(key\);/.test(out)) problems.push("ral-92j7: a parseWsUtaPosition result must print Map<String, Object> with a bare remove");
    } catch (e) {
        problems.push(`ral-92j7 self-test threw: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
        fs.rmSync(r92j7, { force: true });
    }
    // okx parseTradingBalance (returns this.safeBalance (..)) prints Map: its result keys are read natively
    const r92j7b = path.join(process.cwd(), 'ts', 'src', `zz92j7bselftest${process.pid}.ts`);
    try {
        fs.writeFileSync(r92j7b, [
            "import Exchange from './okx.js';",
            "import type { Dict } from './base/types.js';",
            'export default class zz92j7bselftest extends Exchange {',
            "    zzBalance (message: Dict) { const balance = this.parseTradingBalance (message); const keys = Object.keys (balance); return keys.length; }",
            '}',
        ].join('\n'));
        const out = new NewTranspiler().transpiler.transpileJavaByPath(r92j7b).content as string;
        if (!/Map<String, ?Object> balance = this\.parseTradingBalance\(/.test(out) || !/\(balance\.keySet\(\)\)/.test(out)) problems.push("ral-92j7: a parseTradingBalance result must print Map<String, Object> read by keySet()");
    } catch (e) {
        problems.push(`ral-92j7 self-test threw: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
        fs.rmSync(r92j7b, { force: true });
    }
    // parsePositions / parseDepositAddresses print List<Object>: a result read as a list goes native, a pass-through stays Object
    const r92j7c = path.join(process.cwd(), 'ts', 'src', `zz92j7cselftest${process.pid}.ts`);
    try {
        fs.writeFileSync(r92j7c, [
            "import Exchange from './abstract/htx.js';",
            "import type { Dict } from './base/types.js';",
            'export default class zz92j7cselftest extends Exchange {',
            "    zzAddr (data: Dict[], code: string) { const allAddresses: Dict[] = this.parseDepositAddresses (data, [ code ], false); let n = 0; for (let i = 0; i < allAddresses.length; i++) { n += 1; } return n; }",
            "    zzPos (raw: Dict[]) { const positions = this.parsePositions (raw); const positionsLength = positions.length; return positionsLength; }",
            "    zzPass (raw: Dict[]) { const passed = this.parsePositions (raw); return this.filterBySinceLimit (passed, undefined, undefined); }",
            '}',
        ].join('\n'));
        const out = new NewTranspiler().transpiler.transpileJavaByPath(r92j7c).content as string;
        if (!/List<Object> allAddresses = this\.parseDepositAddresses\(/.test(out) || !/i < allAddresses\.size\(\)/.test(out)) problems.push("ral-92j7: a parseDepositAddresses result read by length must print List<Object> with a native size()");
        if (!/List<Object> positions = this\.parsePositions\(/.test(out) || !/= positions\.size\(\);/.test(out)) problems.push("ral-92j7: a parsePositions result read by length must print List<Object> with a native size()");
        if (!/\bObject passed = this\.parsePositions\(/.test(out)) problems.push("ral-92j7: a pass-through parsePositions result must stay Object");
    } catch (e) {
        problems.push(`ral-92j7 self-test threw: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
        fs.rmSync(r92j7c, { force: true });
    }
    // parseTickers prints Map (filterByArrayTickers -> indexBy): a result handed to a Map parameter needs no cast
    const r92j7d = path.join(process.cwd(), 'ts', 'src', `zz92j7dselftest${process.pid}.ts`);
    try {
        fs.writeFileSync(r92j7d, [
            "import Exchange from './abstract/gemini.js';",
            "import type { Dict } from './base/types.js';",
            'export default class zz92j7dselftest extends Exchange {',
            "    zzTickers (response: Dict[], keys: string[]): Dict { const result = this.parseTickers (response); return this.removeKeysFromDict (result, keys); }",
            '}',
        ].join('\n'));
        const out = new NewTranspiler().transpiler.transpileJavaByPath(r92j7d).content as string;
        if (!/Map<String, ?Object> result = this\.parseTickers\(/.test(out) || !/removeKeysFromDict\(result, keys\)/.test(out)) problems.push("ral-92j7: a parseTickers result handed to a Map parameter must print Map<String, Object> with no cast");
    } catch (e) {
        problems.push(`ral-92j7 self-test threw: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
        fs.rmSync(r92j7d, { force: true });
    }
    // bitfinex parseOrderFlags prints List<Object> (safeList with a list default): its result is read natively
    const r93j7a = path.join(process.cwd(), 'ts', 'src', `zz93j7aselftest${process.pid}.ts`);
    try {
        fs.writeFileSync(r93j7a, [
            "import Exchange from './bitfinex.js';",
            'export default class zz93j7aselftest extends Exchange {',
            "    zzFlags (raw: string) { const flags = this.parseOrderFlags (raw); let n = 0; for (let i = 0; i < flags.length; i++) { n += 1; } return n; }",
            '}',
        ].join('\n'));
        const out = new NewTranspiler().transpiler.transpileJavaByPath(r93j7a).content as string;
        if (!/List<Object> flags = this\.parseOrderFlags\(/.test(out) || !/i < flags\.size\(\)/.test(out)) problems.push("ral-93j7: a parseOrderFlags result must print List<Object> with a native size()");
    } catch (e) {
        problems.push(`ral-93j7 self-test threw: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
        fs.rmSync(r93j7a, { force: true });
    }
    // parseSettlements is List<Object> on every declaration: its result local takes no declaration cast
    const r93j7b = path.join(process.cwd(), 'ts', 'src', `zz93j7bselftest${process.pid}.ts`);
    try {
        fs.writeFileSync(r93j7b, [
            "import Exchange from './binance.js';",
            "import type { Dict, Market } from './base/types.js';",
            'export default class zz93j7bselftest extends Exchange {',
            "    zzSettle (response: Dict[], market: Market) { const settlements = this.parseSettlements (response, market); return settlements.length; }",
            '}',
        ].join('\n'));
        const out = new NewTranspiler().transpiler.transpileJavaByPath(r93j7b).content as string;
        if (!/List<Object> settlements = this\.parseSettlements\(/.test(out) || !/= settlements\.size\(\)|return settlements\.size\(\)/.test(out)) problems.push("ral-93j7: a parseSettlements result must print List<Object> without a cast and a native size()\n" + out.split('\n').filter((l) => l.includes('settlements')).join('\n'));
    } catch (e) {
        problems.push(`ral-93j7 self-test threw: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
        fs.rmSync(r93j7b, { force: true });
    }
    // an awaited List<Object> venue fetch rewritten by a List<Object> venue filter stays List: its length is native
    const r93j7c = path.join(process.cwd(), 'ts', 'src', 'prediction', `zz93j7cselftest${process.pid}.ts`);
    try {
        fs.writeFileSync(r93j7c, [
            "import Exchange from './sxbet.js';",
            "import type { Dict } from '../base/types.js';",
            'export default class zz93j7cselftest extends Exchange {',
            "    zzFixture (raw: Dict[], id: string): Dict[] { const result: Dict[] = []; for (let i = 0; i < raw.length; i++) { if (this.safeString (raw[i], 'sportXeventId') === id) { result.push (raw[i]); } } return result; }",
            "    async zzRaw (id: string, params: Dict = {}) { let rawMarkets = await this.fetchRawMarketsPaged (this.extend ({ 'sportXeventId': id }, params), undefined); rawMarkets = this.zzFixture (rawMarkets, id); const rawMarketsLength = rawMarkets.length; return rawMarketsLength; }",
            '}',
        ].join('\n'));
        const out = new NewTranspiler().transpiler.transpileJavaByPath(r93j7c).content as string;
        if (!/List<Object> rawMarkets = \(this\.fetchRawMarketsPaged\(/.test(out) || !/= rawMarkets\.size\(\);/.test(out)) problems.push("ral-93j7: a venue List fetch rewritten by a venue List filter must print List<Object> with a native size()\n" + out.split('\n').filter((l) => /rawMarkets|zzFixture/.test(l)).join('\n'));
    } catch (e) {
        problems.push(`ral-93j7 self-test threw: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
        fs.rmSync(r93j7c, { force: true });
    }
    // prediction parseEvent (returns this.extend (..)) prints Map: its result is read and written natively
    const r93j7d = path.join(process.cwd(), 'ts', 'src', 'prediction', `zz93j7dselftest${process.pid}.ts`);
    try {
        fs.writeFileSync(r93j7d, [
            "import Exchange from './myriad.js';",
            "import type { Dict, PredictionEvent } from '../base/types.js';",
            'export default class zz93j7dselftest extends Exchange {',
            "    zzEv (raw: Dict) { const ev = this.parseEvent (raw); ev['markets'] = []; return ev; }",
            "    parseEvent (rawEvent: Dict): PredictionEvent { if (rawEvent === undefined) { return this.extend ({ 'id': undefined }) as PredictionEvent; } return this.extend ({ 'id': this.safeString (rawEvent, 'id'), 'info': rawEvent }); }",
            '}',
        ].join('\n'));
        const out = new NewTranspiler().transpiler.transpileJavaByPath(r93j7d).content as string;
        if (!/Map<String, ?Object> ev = this\.parseEvent\(/.test(out) || !/\bev\.put\("markets"/.test(out)) problems.push("ral-93j7: a parseEvent result must print Map<String, Object> with a native put\n" + out.split('\n').filter((l) => /\bev\b/.test(l)).join('\n'));
        if ((out.match(/return \(\((java\.util\.)?Map<String, ?Object>\) this\.extend\(/g) ?? []).length !== 2) problems.push("ral-93j7: a parseEvent `return this.extend ({..})` must print the ((Map) call) form the literal hoist accepts\n" + out.split('\n').filter((l) => /return|mapLiteral/.test(l)).join('\n'));
    } catch (e) {
        problems.push(`ral-93j7 self-test threw: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
        fs.rmSync(r93j7d, { force: true });
    }
    return problems;
}

// A fresh map local printed Object puts natively; null, published or merged receivers keep the helper
function javaFreshObjectMapWritesSelfTest (): string[] {
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
        if (/Helpers\.addElementToObject\(a, /.test(out)) problems.push("fresh local 'a' must put natively");
        for (const name of [ 'c', 'd' ]) {
            // 84j8 declares the self-merged literal 'c' Map<String, Object>: its literal-key put is then native
            const declaredMap = name === 'c' && /Map<String, Object> c = /.test(out) && /\bc\.put\("free", /.test(out);
            if (!declaredMap && !new RegExp(`Helpers\\.addElementToObject\\(${name}, `).test(out)) problems.push(`'${name}' is unproven and must keep the helper`);
        }
        // the Map-locals pass declares 'b' a Map; only the declared-Map non-null put may fire, never the cast put
        if (/\(\(java\.util\.Map<String, Object>\)b\)\.put\(/.test(out)) problems.push("'b' is unproven and must not take the cast put");
    } catch (e: any) {
        problems.push(`self-test threw: ${e.message}`);
    } finally {
        fs.rmSync(probe, { force: true });
    }
    return problems;
}

// a prediction-venue const fed by a fresh-map producer up the abstract chain types Map and puts natively
function javaPredictionMapLocalsSelfTest (): string[] {
    const M = '(?:java\\.util\\.)?Map<String, Object>';
    return javaProbeCases({ files: [ [ 'prediction/zzpredmapselftest', [ "import Exchange from '../abstract/prediction/kalshi.js';", 'export default class zzpredmapselftest extends Exchange {',
        "    fresh (r: any) { const a = this.safePredictionOrder ({ 'id': r }); a['status'] = 'open'; a['x'] = r; return a; }",
        "    parseOwn (r: any) { return this.safePredictionOrder ({ 'id': r }); }",
        "    viaVenue (r: any) { const b = this.parseOwn (r); b['status'] = r; return b; }",
        "    unwritten (r: any) { const c = this.safePredictionOrder ({ 'id': r }); return this.safeString (c, 'id'); }",
        "    unknown (r: any) { const d = this.parsePredictionOrder (r); d['status'] = r; return d; }",
        "    keyed (r: any, k: any) { const e = this.safePredictionOrder ({ 'id': r }); e[k] = 1; return e; }",
        '}' ] ] ], checks: [
        [ [ new RegExp(`${M} a = \\(${M}\\) this\\.safePredictionOrder\\(`), /\ba\.put\("status", "open"\)/, /\ba\.put\("x", r\)/ ], true, "prediction map locals: 'a' must type Map and put natively" ],
        [ [ new RegExp(`${M} b = `), /\bb\.put\("status", r\)/ ], true, "prediction map locals: 'b' (venue fresh producer) must put natively" ],
        [ new RegExp(`${M} c = \\(`), false, "prediction map locals: 'c' has no element write and must not gain a cast" ],
        [ /Helpers\.addElementToObject\(d, "status", r\)/, true, "prediction map locals: 'd' (base parsePredictionOrder, not a fresh producer) must keep the helper" ],
        [ /Helpers\.addElementToObject\(e, /, true, "prediction map locals: 'e' (any key) must keep the helper" ],
    ] });
}

// a never-written Dict parameter fed only const object literals from its own file puts natively
function javaFreshMapParameterSelfTest (): string[] {
    const cls = 'zzfreshparamselftest';
    return javaProbeCases({ files: [ [ cls, [ "import Exchange from './abstract/binance.js';", "import type { Dict } from './base/types.js';", `export default class ${cls} extends Exchange {`,
        "    zzBuildA (request: Dict, v: any) { request['k'] = v; return request; }",
        "    zzCallA (v: any) { const request: Dict = { 'a': 1 }; return this.zzBuildA (request, v); }",
        "    zzBuildB (request: Dict, v: any) { request['k'] = v; return request; }",
        "    zzCallB (v: any, params: Dict = {}) { const request: Dict = { 'a': 1 }; this.zzBuildB (request, v); return this.zzBuildB (params, v); }",
        "    zzBuildC (request: Dict, v: any) { request = this.extend (request, {}); request['k'] = v; return request; }",
        "    zzCallC (v: any) { const request: Dict = { 'a': 1 }; return this.zzBuildC (request, v); }",
    '}' ] ] ], checks: [
        [ /\brequest\.put\("k", v\);\s*return request;\s*}\s*public Object zzCallA/, true, "fresh param: 'zzBuildA' request must put natively" ],
        [ /zzBuildB[\s\S]*?Helpers\.addElementToObject\(request, "k", v\)/, true, "fresh param: 'zzBuildB' (a params caller) must keep the helper" ],
        [ /zzBuildC[\s\S]*?Helpers\.addElementToObject\(request, "k", v\)/, true, "fresh param: 'zzBuildC' (written param) must keep the helper" ],
    ] });
}

// a declared-Map receiver written with a never-null value puts natively; a nullable value keeps the helper
function javaNonNullMapPutsSelfTest (): string[] {
    const cls = 'zznonnullputselftest';
    return javaProbeCases({ files: [ [ cls, [ "import Exchange from './abstract/binance.js';", "import type { Dict, Str } from './base/types.js';", `export default class ${cls} extends Exchange {`,
        "    zzEnc (t: Str): Str { const m: Dict = { 'a': 'A' }; return this.safeString (m, t, t); }",
        "    zzPut (symbol: Str, price: any, t: Str, params: Dict = {}) { if (price !== undefined) { params['p'] = this.priceToPrecision (symbol, price); } const kind = this.safeString (params, 'kind'); if (kind !== undefined) { params['k'] = this.zzEnc (kind); } params['d'] = this.safeString (params, 'd', 'x'); params['n'] = this.safeString (params, 'n'); params['q'] = this.priceToPrecision (symbol, price); return params; }",
    '}' ] ] ], checks: [
        [ [ /parameters\.put\("p", this\.priceToPrecision\(/, /parameters\.put\("k", this\.zzEnc\(/, /parameters\.put\("d", this\.safeString\(/ ], true, "non-null puts: guarded / defaulted values must put natively" ],
        [ [ /Helpers\.addElementToObject\(parameters, "n", /, /Helpers\.addElementToObject\(parameters, "q", / ], true, "non-null puts: nullable values must keep the helper" ],
    ], output: true });
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

// Native top-level newMap (declaration initializer / return value)
// `Map<String, Object> x = Helpers.newMap("k", v, ...);` -> `new HashMap` + one put per pair, and
// `return Helpers.newMap(...);` -> a block filling a file-unique temp. Helpers.newMap is exactly a
// plain HashMap filled in argument order; the map is unreachable until filled, so order is moot.
const JAVA_NEW_MAP_DECL_HEAD = /^(\s*)(?:(Map<String, Object>|java\.util\.Map<String, Object>) ([A-Za-z_$][\w$]*) = |return )Helpers\.newMap\(/;

// top-level args of the call opened at `start` (index after `(`) + end index after `)`; comments fail closed
function newMapScanArgs (src: string, start: number): { args: string[], end: number } | undefined {
    const args: string[] = [];
    let depth = 0;
    let buf = '';
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
        if (ch === '/' && (src[i + 1] === '*' || src[i + 1] === '/')) return undefined;
        // a type argument list (`HashMap<String, Object>(`, `(Map<String, Object>) x`) is one atom
        const generic = ch === '<' && /[\w$]$/.test (buf) ? /^<[\w$.?, <>]*>(?=[(\[)])/.exec (src.slice (i, i + 200)) : null;
        if (generic !== null) { buf += generic[0]; i += generic[0].length - 1; continue; }
        if (ch === '(' || ch === '[' || ch === '{') depth++;
        else if (ch === ')' || ch === ']' || ch === '}') {
            if (depth === 0) {
                if (ch !== ')') return undefined;
                if (buf.trim () !== '') args.push (buf);
                else if (args.length > 0) return undefined; // trailing comma
                return { args, end: i + 1 };
            }
            depth--;
        }
        if (ch === ',' && depth === 0) {
            args.push (buf);
            buf = '';
            continue;
        }
        buf += ch;
    }
    return undefined;
}

// the even-arity, literal-keyed `Helpers.newMap(` call whose args open at `head` on lines[i] and end in `;` + EOL:
// trimmed args + the number of lines it spans, else undefined (fail closed)
function newMapPairsAt (lines: string[], i: number, head: number): { pairs: string[], consumed: number } | undefined {
    const rest = lines.slice (i).join ('\n');
    const scan = newMapScanArgs (rest, head);
    const tail = scan === undefined ? null : /^;[ \t]*(?=\n|$)/.exec (rest.slice (scan.end));
    if (scan === undefined || tail === null || scan.args.length === 0 || scan.args.length % 2 !== 0) return undefined;
    if (!scan.args.every ((a, k) => k % 2 === 1 || /^\s*"(?:[^"\\]|\\.)*"\s*$/.test (a))) return undefined;
    return { pairs: scan.args.map ((a) => a.trim ()), consumed: rest.slice (0, scan.end + tail[0].length).split ('\n').length };
}

export function nativeJavaTopLevelNewMap (content: string): string {
    const lines = content.split ('\n');
    const out: string[] = [];
    let temp = 0;
    for (let i = 0; i < lines.length; i++) {
        const m = JAVA_NEW_MAP_DECL_HEAD.exec (lines[i]);
        const map = m === null ? undefined : newMapPairsAt (lines, i, m[0].length);
        if (m === null || map === undefined) { out.push (lines[i]); continue; }
        const indent = m[1];
        const inner = m[3] === undefined ? indent + '    ' : indent;
        const name = m[3] ?? ('h2kMap' + (temp++));
        if (m[3] === undefined) out.push (indent + '{');
        out.push (`${inner}${m[2] ?? 'java.util.HashMap<String, Object>'} ${name} = new java.util.HashMap<String, Object>();`);
        for (let k = 0; k < map.pairs.length; k += 2) out.push (`${inner}${name}.put(${map.pairs[k]}, ${map.pairs[k + 1]});`);
        if (m[3] === undefined) out.push (`${inner}return ${name};`, indent + '}');
        i += map.consumed - 1;
    }
    return out.join ('\n');
}

// Native GetValue reads on declared List/String/TypedMap locals
// `Helpers.GetValue(x, k)` where x's printed declaration is List<T>, String or a types/ TypedMap view
// -> the helper's own branch; its null receiver/key and out-of-range answers stay explicit
const ELEMENT_READ_LIST_RE = /^(?:java\.util\.)?(?:List|ArrayList)<[\w.<>?, ]+>$/;
const JAVA_TYPED_MAP_VIEWS = new Set([ 'Tickers', 'OpenInterests', 'MarginModes', 'FundingRates', 'LeverageTiers', 'Currencies', 'Balances', 'OrderBooks', 'LastPrices', 'TradingFees', 'CrossBorrowRates', 'IsolatedBorrowRates', 'DepositAddresses', 'DepositWithdrawFees', 'Leverages', 'MarketMarginModes', 'PredictionTickers' ]);

function elementReadDeclaredTypeOf (lines: string[], lineIndex: number, name: string): string | undefined {
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
function elementReadIntIndex (lines: string[], i: number, key: string): { guard: string, idx: string } | undefined {
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
    const t = elementReadDeclaredTypeOf(lines, i, key);
    if (t === 'long') return { guard: '', idx: '((int) ' + key + ')' };
    if (t === 'Long' || t === 'Integer') return { guard: key + ' == null || ', idx: key + '.intValue()' };
    return undefined;
}

export function nativeJavaElementReads (content: string): string {
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
            const cls = elementReadDeclaredTypeOf(lines, i, r);
            if (cls === undefined) return whole;
            if (ELEMENT_READ_LIST_RE.test(cls) || cls === 'String') {
                const ix = elementReadIntIndex(lines, i, key);
                if (ix === undefined) return whole;
                const len = cls === 'String' ? r + '.length()' : r + '.size()';
                const low = /^\d+$/.test(ix.idx) ? '' : ix.idx + ' < 0 || ';
                const get = cls === 'String' ? 'String.valueOf(' + r + '.charAt(' + ix.idx + '))' : r + '.get(' + ix.idx + ')';
                return `(${r} == null || ${ix.guard}${low}${ix.idx} >= ${len} ? null : ${get})`;
            }
            const view = cls.replace(/^io\.github\.ccxt\.types\./, '');
            if (JAVA_TYPED_MAP_VIEWS.has(view) && /^[A-Za-z_]\w*$/.test(key) && elementReadDeclaredTypeOf(lines, i, key) === 'String') {
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

// Native `+` for Helpers.add with a statically-String first operand
// javac binds such a call to add(String, String|Object) = `a + String.valueOf(b)`, which is
// exactly Java's native concat; anything else (Object/number first) keeps the helper.
const JAVA_STRING_PRODUCER_CALLS = /^this\.(safeString|safeString2|safeStringN|safeStringUpper|safeStringLower|urlencode|json|numberToString|uuid)\(/;

// mask string/char literals and comments with spaces (same length)
function stringAddMask (s: string): string {
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
function stringAddClose (m: string, open: number): number {
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
function stringAddPlusTerms (m: string): Array<[number, number]> | undefined {
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
function stringAddIsPrimary (m: string): boolean {
    const t = stringAddPlusTerms(m);
    return t !== undefined && t.length === 1;
}

function stringAddStripParens (raw: string, m: string): [string, string] {
    let r = raw.trim(); let k = m.trim();
    while (k.startsWith('(') && stringAddClose(k, 0) === k.length) { r = r.slice(1, -1).trim(); k = k.slice(1, -1).trim(); }
    return [r, k];
}

// nearest same-member declaration of `name` before `pos` is `String` (params included)
function stringAddStringLocal (masked: string, name: string, pos: number): boolean {
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

function stringAddIsString (raw: string, m: string, masked: string, pos: number, ownMethods: Set<string>): boolean {
    const [r, k] = stringAddStripParens(raw, m);
    const terms = stringAddPlusTerms(k);
    if (terms === undefined || k === '') { return false; }
    if (terms.length > 1) {
        return terms.some(([a, b]) => stringAddIsString(r.slice(a, b), k.slice(a, b), masked, pos, ownMethods));
    }
    if (/^"/.test(r) && k.length === r.length && /^"\s*"$/.test(k)) { return true; }
    const field = /^this\.([A-Za-z_]\w*)$/.exec(k);
    if (field !== null) { return JS_STRING_MEMBER_FIELDS.has(field[1]) && !ownMethods.has('field:' + field[1]); }
    const call = JAVA_STRING_PRODUCER_CALLS.exec(k) || /^(String)\.valueOf\(/.exec(k);
    if (call !== null) {
        const open = k.indexOf('(');
        return stringAddClose(k, open) === k.length && !ownMethods.has(call[1]);
    }
    if (/^[A-Za-z_]\w*$/.test(k)) { return stringAddStringLocal(masked, k, pos); }
    return false;
}

export function nativeJavaStringAdd (content: string): string {
    if (content.indexOf('Helpers.add(') === -1) { return content; }
    // a class that (re)declares one of the anchored members fails closed for that member
    const ownMethods = new Set<string>();
    for (const d of content.matchAll(/\b(?:public|private|protected)\s+(?:static\s+)?[\w.<>?,\[\] ]+?\s+(\w+)\s*(\(|=|;)/g)) {
        ownMethods.add(d[2] === '(' ? d[1] : 'field:' + d[1]);
    }
    let masked = stringAddMask(content);
    let from = masked.length;
    for (;;) {
        const at = masked.lastIndexOf('Helpers.add(', from);
        if (at === -1) { break; }
        from = at - 1;
        if (at > 0 && /[\w.]/.test(masked[at - 1])) { continue; }
        const open = at + 'Helpers.add'.length;
        const end = stringAddClose(masked, open);
        if (end === -1) { continue; }
        const inner = masked.slice(open + 1, end - 1);
        const args = splitTopLevelArgs(inner);
        if (args.length !== 2) { continue; }
        const aM = args[0]; const bM = args[1];
        const aRaw = content.slice(open + 1, open + 1 + aM.length);
        const bRaw = content.slice(open + 2 + aM.length, end - 1);
        if (!stringAddIsString(aRaw, aM, masked, at, ownMethods)) { continue; }
        // a bare statement `Helpers.add(..);` is not a legal native expression statement
        if (/[;{}]\s*$/.test(masked.slice(Math.max(0, at - 200), at)) && /^\s*;/.test(masked.slice(end))) { continue; }
        const b = bRaw.trim();
        const bPrimary = stringAddIsPrimary(bM.trim()) && !/^\(\w[\w.<>?, ]*\)/.test(bM.trim());
        const a = aRaw.trim();
        const aSafe = stringAddPlusTerms(aM.trim()) !== undefined ? a : `(${a})`;
        const repl = `(${aSafe} + ${bPrimary ? b : `(${b})`})`;
        content = content.slice(0, at) + repl + content.slice(end);
        masked = stringAddMask(content);
    }
    return content;
}

// Native ordered comparisons over declared numeric operands
// Helpers.isGreaterThan/isLessThan/isGreaterThanOrEqual/isLessThanOrEqual -> `> < >= <=` when both
// operands are int literals or locals/params the final text declares Long/Integer/long/int/Double; a
// boxed operand gets the helper's null table. Double pairs only for `>` (the others go through isEqual).
const ORDERED_COMPARE_CALL = /Helpers\.is(GreaterThan|LessThan|GreaterThanOrEqual|LessThanOrEqual)\(/g;
const ORDERED_COMPARE_OPS: Record<string, string> = { GreaterThan: '>', LessThan: '<', GreaterThanOrEqual: '>=', LessThanOrEqual: '<=' };
const ORDERED_COMPARE_TYPES: Record<string, { kind: string, boxed: boolean }> = {
    Long: { kind: 'long', boxed: true }, Integer: { kind: 'long', boxed: true }, long: { kind: 'long', boxed: false },
    int: { kind: 'long', boxed: false }, Double: { kind: 'double', boxed: true }, double: { kind: 'double', boxed: false },
};

function orderedCompareSplitArgs (text: string, start: number): { args: string[], end: number } | undefined {
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

function orderedCompareStripParens (text: string): string {
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
function orderedCompareDeclaredType (member: string, name: string, fields: Set<string>): { kind: string, boxed: boolean } | undefined {
    if (fields.has (name)) return undefined;
    const esc = name.replace (/\$/g, '\\$');
    // type and name on one line: a comment line ending in a word is not the type of the next line's write
    const decl = new RegExp ('(?:^|[\\s(,])([\\w.$]+(?:<[\\w.<>, ?]*>)?(?:\\[\\])?)[ \\t]+' + esc + '\\s*(=|;|,|\\)|:)', 'gm');
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
    return ORDERED_COMPARE_TYPES[t];
}

function orderedCompareOperand (text: string, member: string, fields: Set<string>): { kind: string, boxed: boolean, text: string, literal?: boolean } | undefined {
    const inner = orderedCompareStripParens (text);
    if (/^-?\d{1,15}L?$/.test (inner)) return { kind: 'long', boxed: false, text: inner, literal: true };
    if (/^-?\d{1,15}\.\d{1,15}$/.test (inner)) return { kind: 'double', boxed: false, text: inner, literal: true };
    if (/^[A-Za-z_$][\w$]*$/.test (inner)) {
        const t = orderedCompareDeclaredType (member, inner, fields);
        return t === undefined ? undefined : { ...t, text: inner };
    }
    // `(x + 1L)` / `(x - 1L)` over a declared long: the operand unboxes (or throws) before the helper runs
    const arith = inner.match (/^([A-Za-z_$][\w$]*) ([+-]) (\d+L?)$/);
    if (arith !== null) {
        const t = orderedCompareDeclaredType (member, arith[1], fields);
        if (t !== undefined && t.kind === 'long') return { kind: 'long', boxed: false, text: '(' + inner + ')' };
    }
    return undefined;
}

function orderedCompareNative (helper: string, l, r): string | undefined {
    // `>=` adds isEqual, exact for a double only against a small literal; `< <=` are true for NaN (keep)
    const longs = l.kind === 'long' && r.kind === 'long';
    const a = l.text, b = r.text;
    if (!longs && (helper === 'LessThan' || helper === 'LessThanOrEqual') && r.literal && !l.literal) {
        // helper LT = !(GT || EQ), LE = !GT: NaN and a null left side answer true
        const neg = `!(${a} ${helper === 'LessThan' ? '>=' : '>'} ${b})`;
        return l.boxed ? `(${a} == null || ${neg})` : `(${neg})`;
    }
    if (!longs && helper !== 'GreaterThan' && (helper !== 'GreaterThanOrEqual' || !(l.literal || r.literal))) return undefined;
    const cmp = `${a} ${ORDERED_COMPARE_OPS[helper]} ${b}`;
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

// names of the fields a printed Java class declares (4-space member lines ending in `=` or `;`)
function javaClassFields (lines: string[]): Set<string> {
    const fields = new Set<string> ();
    for (const line of lines) {
        const f = line.match (/^    (?:(?:public|private|protected|static|final|volatile|transient) )*[\w.][\w.<>, ?\[\]]* ([A-Za-z_$][\w$]*)\s*(?:=|;)/);
        if (f !== null) fields.add (f[1]);
    }
    return fields;
}

// line indexes of the printed class's member heads; `withParen` keeps only method/ctor heads
function javaMemberStarts (lines: string[], withParen = false, from = 0): number[] {
    const head = withParen ? /^    (?:public|private|protected)\b.*\(/ : /^    (?:public|private|protected)\b/;
    const starts: number[] = [];
    for (let i = from; i < lines.length; i++) if (head.test (lines[i])) starts.push (i);
    return starts;
}

// rewrites each member of a printed class; text before the first member is kept. undefined: no member
function mapJavaMembers (content: string, withParen: boolean, rewrite: (member: string) => string): string | undefined {
    const lines = content.split ('\n');
    const starts = javaMemberStarts (lines, withParen);
    if (starts.length === 0) return undefined;
    starts.push (lines.length);
    const parts: string[] = [ lines.slice (0, starts[0]).join ('\n') ];
    for (let s = 0; s + 1 < starts.length; s++) parts.push (rewrite (lines.slice (starts[s], starts[s + 1]).join ('\n')));
    return parts.join ('\n');
}

// innermost-last rewrite of the two-argument helper calls `re` finds on one printed line: the line is
// re-scanned after every rewrite; comment lines are kept
function rewriteHelperCalls (line: string, re: RegExp, native: (m: RegExpExecArray, args: string[], line: string) => string | undefined): string {
    const trimmed = line.trim ();
    if (trimmed.startsWith ('//') || trimmed.startsWith ('*')) return line;
    for (let again = true; again;) {
        again = false;
        re.lastIndex = 0;
        let m;
        while ((m = re.exec (line)) !== null) {
            const split = orderedCompareSplitArgs (line, m.index + m[0].length);
            if (split === undefined || split.args.length !== 2) continue;
            const text = native (m, split.args, line);
            if (text === undefined) continue;
            line = line.slice (0, m.index) + text + line.slice (split.end + 1);
            again = true;
            break;
        }
    }
    return line;
}

// the per-member compare skeleton: every method whose text matches `memberRe` gets its `re` calls rewritten
function rewriteMemberHelperCalls (content: string, re: RegExp, memberRe: RegExp, native: (m: RegExpExecArray, args: string[], member: string, fields: Set<string>) => string | undefined): string {
    const lines = content.split ('\n');
    const fields = javaClassFields (lines);
    const starts = javaMemberStarts (lines, true);
    for (let s = 0; s < starts.length; s++) {
        const from = starts[s], to = s + 1 < starts.length ? starts[s + 1] : lines.length;
        const member = lines.slice (from, to).join ('\n');
        if (!memberRe.test (member)) continue;
        for (let i = from; i < to; i++) lines[i] = rewriteHelperCalls (lines[i], re, (m, args) => native (m, args, member, fields));
    }
    return lines.join ('\n');
}

export function nativeJavaOrderedComparisons (content: string): string {
    if (!/Helpers\.is(?:Greater|Less)Than/.test (content)) return content;
    return rewriteMemberHelperCalls (content, ORDERED_COMPARE_CALL, /Helpers\.is/, (m, args, member, fields) => {
        const l = orderedCompareOperand (args[0], member, fields);
        const r = orderedCompareOperand (args[1], member, fields);
        return l === undefined || r === undefined ? undefined : orderedCompareNative (m[1], l, r);
    });
}

// Native promiseAll / objectValues / opNeg (post-print text pass)
// index of the `)` closing the `(` at `open`, skipping string/char literals; -1 when unbalanced
function promiseAllClose (s: string, open: number): number {
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

// Nested / argument Helpers.newMap literals -> hoisted native HashMap
// A `Helpers.newMap("k", v, ...)` used as a call argument or literal value (not the whole RHS of a
// declaration/assignment/return, handled by the top-level newMap pass) becomes a preceding `HashMap` local filled by `put`s,
// only when everything Java evaluates before it in the statement commutes with its values.
export function javaNestedNewMapStats (): Record<string, number> { return (globalThis as any).__javaNestedNewMapStats ??= {}; }
function nestedNewMapCount (k: string) { const s = javaNestedNewMapStats (); s[k] = (s[k] || 0) + 1; }
// base readers that write no state (BaseExchange.java / Exchange.java / java.util)
const NESTED_NEW_MAP_PURE_SAFE = [ 'String', 'StringLower', 'StringUpper', 'Integer', 'IntegerProduct', 'Number', 'Float', 'Value', 'Bool', 'Dict', 'List', 'String2', 'Integer2', 'Number2', 'Value2', 'Bool2', 'Dict2', 'List2', 'StringN', 'IntegerN', 'NumberN', 'ValueN', 'Timestamp', 'Timestamp2', 'TimestampN' ];
const NESTED_NEW_MAP_PURE_CALL = new RegExp ('^(?:this\\.(?:safe(?:' + NESTED_NEW_MAP_PURE_SAFE.join ('|') + ')|iso8601|parseNumber|numberToString|omitZero)|java\\.util\\.Objects\\.equals|java\\.util\\.Objects\\.requireNonNullElse|Helpers\\.newMap|Precise\\.string(?:Abs|Mul|Add|Sub|Div))$');
function nestedNewMapPureCall (n: string): boolean { return NESTED_NEW_MAP_PURE_CALL.test (n); }

// blank string/char literals and comments (length-preserving) so brackets can be matched
function nestedNewMapMask (s: string): string {
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

function nestedNewMapClose (m: string, open: number): number {
    let d = 0;
    for (let k = open; k < m.length; k++) {
        const c = m[k];
        if (c === '(' || c === '[' || c === '{') d++;
        else if (c === ')' || c === ']' || c === '}') { d--; if (d === 0) return k; }
    }
    return -1;
}

function nestedNewMapArgs (m: string, from: number, to: number): Array<[number, number]> {
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
function nestedNewMapCalls (m: string, a: number, b: number): string[] | undefined {
    const names: string[] = [];
    const re = /([A-Za-z_$][\w$]*(?:\s*\.\s*[A-Za-z_$][\w$]*)*)\s*\(|\)\s*\.\s*([A-Za-z_$][\w$]*)\s*\(/g;
    re.lastIndex = a;
    let r: RegExpExecArray | null;
    while ((r = re.exec (m)) !== null && r.index < b) {
        const open = r.index + r[0].length - 1;
        const close = nestedNewMapClose (m, open);
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
function nestedNewMapMutates (t: string): boolean { return /\+\+|--|(?<![=!<>+\-*/%&|^])=(?!=)|[+\-*/%&|^]=|->/.test (t); }
function nestedNewMapAllPure (names: string[]): boolean { return names.every ((n) => nestedNewMapPureCall (n)); }

function nestedNewMapEmit (raw: string, m: string, open: number, close: number, name: string, indent: string, fresh: () => string, out: string[]): boolean {
    const spans = nestedNewMapArgs (m, open + 1, close);
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
        if (m.startsWith ('Helpers.newMap(', vs) && nestedNewMapClose (m, vs + 'Helpers.newMap('.length - 1) === ve - 1) {
            value = fresh ();
            if (!nestedNewMapEmit (raw, m, vs + 'Helpers.newMap('.length - 1, ve - 1, value, indent, fresh, lines)) return false;
        } else {
            value = raw.slice (vs, ve);
            if (/\/[/*]/.test (value.replace (/"(?:[^"\\\n]|\\.)*"/g, '""'))) return false;
        }
        lines.push (indent + name + '.put(' + key + ', ' + value + ');');
    }
    out.push (...lines);
    return true;
}

function nestedNewMapRewriteOnce (content: string, m: string, from: number, taken: Set<string>): { content: string, next: number } | undefined {
    let i = m.indexOf ('Helpers.newMap(', from);
    for (; i >= 0; i = m.indexOf ('Helpers.newMap(', i + 1)) {
        if (i > 0 && /[\w$.]/.test (m[i - 1])) continue;
        const open = i + 'Helpers.newMap('.length - 1;
        const close = nestedNewMapClose (m, open);
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
        if (path.length === 0) { nestedNewMapCount ('keep:whole-rhs-or-statement'); continue; }
        if (/^(?:if|else|for|while|do|switch|case|default|try|catch|finally|synchronized|super\s*\(|this\s*\(|public|private|protected|static|@)\b/.test (head)) { nestedNewMapCount ('keep:control-header'); continue; }
        const lineStart = content.lastIndexOf ('\n', first - 1) + 1;
        if (content.slice (lineStart, first).trim () !== '') { nestedNewMapCount ('keep:statement-not-line-start'); continue; }
        // the text at path depth (completed sub-expressions removed): no branch may skip the literal
        let top = '';
        for (let q = first, dd = 0; q < i; q++) {
            const c = m[q];
            if (path.includes (q)) { top += c; continue; }
            if (c === '(' || c === '[' || c === '{') { dd++; continue; }
            if (c === ')' || c === ']' || c === '}') { dd--; continue; }
            if (dd === 0) top += c;
        }
        if (path.some ((q) => /\b(?:for|while|if|switch|catch|synchronized)\s*$/.test (m.slice (Math.max (0, q - 20), q)))) { nestedNewMapCount ('keep:control-header'); continue; }
        if (/\?|&&|\|\||->|:/.test (top) || path.some ((q) => m[q] !== '(')) { nestedNewMapCount ('keep:conditional-or-lambda-path'); continue; }
        // evaluation order: the prefix Java evaluates before the literal must commute with it
        const assign = head.match (/^(?:(?:final\s+)?[\w$.]+(?:<[^;=()]*>)?(?:\[\])*\s+)?[A-Za-z_$][\w$]*\s*=(?!=)/);
        const prefix = assign ? head.slice (assign[0].length) : head;
        const prefixCalls = nestedNewMapCalls (m, first + (assign ? assign[0].length : 0), i);
        const valueCalls = nestedNewMapCalls (m, open + 1, close + 1);
        if (prefixCalls === undefined || valueCalls === undefined) { nestedNewMapCount ('keep:unparsed'); continue; }
        if (nestedNewMapMutates (prefix) || !nestedNewMapAllPure (prefixCalls)) { nestedNewMapCount ('keep:effectful-prefix'); continue; }
        if (nestedNewMapMutates (m.slice (open + 1, close))) { nestedNewMapCount ('keep:values-write'); continue; }
        const valuesPure = nestedNewMapAllPure (valueCalls);
        // effectful values: the prefix may only read locals (a call's side effect cannot change them)
        if (!valuesPure && (prefixCalls.length > 0 || /\bthis\s*\.\s*[A-Za-z_$][\w$]*(?!\s*\()|\)\s*[\w$(]/.test (prefix.replace (/\bthis\s*\.\s*[A-Za-z_$][\w$]*\s*\($/, '')))) {
            nestedNewMapCount ('keep:effectful-values-after-heap-read'); continue;
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
        if (!nestedNewMapEmit (content, m, open, close, name, indent, fresh, lines)) {
            taken.clear (); snapshot.forEach ((x) => taken.add (x));
            nestedNewMapCount ('keep:non-literal-key-or-multiline-value'); continue;
        }
        nestedNewMapCount ('hoisted');
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
        const r = nestedNewMapRewriteOnce (content, nestedNewMapMask (content), from, taken);
        if (r === undefined) return content;
        content = r.content;
        from = r.next;
    }
}

// `x = Helpers.newMap("k", v, ...);` -> a block filling a fresh HashMap, then `x = tmp;`
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
        const map = m === null ? undefined : newMapPairsAt (lines, i, m[0].length);
        if (m === null || map === undefined) { out.push (lines[i]); continue; }
        const indent = m[1];
        const inner = indent + '    ';
        const name = 'hx4NewMap' + (temp++);
        out.push (indent + '{');
        out.push (`${inner}java.util.HashMap<String, Object> ${name} = new java.util.HashMap<String, Object>();`);
        for (let k = 0; k < map.pairs.length; k += 2) out.push (`${inner}${name}.put(${map.pairs[k]}, ${map.pairs[k + 1]});`);
        out.push (`${inner}${m[2]} = ${name};`, indent + '}');
        i += map.consumed - 1;
    }
    return out.join ('\n');
}

// base readers the h30-J05 hoist treats as write-free (declared before the main entry runs)
const H30J05_READERS = /^(?:(?:this|\w+\.this)\.(?:safeString|safeString2|safeBool|safeNumber|safeInteger|arrayConcat)|Precise\.stringAdd|(?:io\.github\.ccxt\.)?Helpers\.(?:GetValue|newMap)|java\.util\.Objects\.equals|Arrays\.asList)$/;
// after the pass constants above: they are consts, so the entry must not run before their initialization
if (isMainEntry(metaUrl)) {
    // Deliberately not `await runMain()`: build/java-worker.ts imports this module
    // for patchJavaLocalTypes, and piscina loads worker modules through tsx's CJS
    // require hook, whose esbuild transform rejects top-level await ("not supported
    // with the cjs output format"). A rejection is still fatal here — an unhandled
    // rejection exits 1, exactly like the awaited form did.
    runMain();
}

// Integer-literal counters print `long`; a counter read as a value (map literal, call argument) or captured stays Object
function javaCounterLocalsSelfTest (): string[] {
    return javaProbeCases({ cls: 'zzj10selftest', members: [
        "    pos (s: string, max: number) { let a = 0; let b = 1; while (a <= max && s[a] === '0') { a = a + 1; } b += 2; b++; return [ a > 3, a === 2, b - 1 ]; }",
        "    neg (params = {}) { let c = 0; c += 1; let d = 0; d = d + 1; const r = { 'page': d }; let e = 0; const f = () => { e = e + 1; }; f (); return [ this.safeString (params, c), r, e > 1 ]; }",
    ], checks: [
        ...[ 'a', 'b' ].map((n): JavaProbeCheck => [ new RegExp(`\\blong ${n} = `), true, `counter '${n}' must print long` ]),
        [ [ /a = \(a \+ 1L\);/, /b = \(b \+ 2L\);/ ], true, 'counter writes must print native long arithmetic' ],
        ...[ 'c', 'd', 'e' ].map((n): JavaProbeCheck => [ new RegExp(`\\bObject ${n} = `), true, `'${n}' is read as a value or captured and must stay Object` ]),
    ] });
}

// Object locals whose init and every write are Maps print Map<String, Object>; any other write keeps Object
function javaMapLocalsSelfTest (): string[] {
    return javaProbeCases({ cls: 'zzj11selftest', members: [
        "    omitted (r: any) { let a = this.safeDict (r, 'k', {}); a = this.omit (a, 'x'); a['p'] = 1; return a['q']; }",
        "    fees (info: any) { const b = this.depositWithdrawFee (info); b['info'] = info; return b['networks']; }",
        "    copied (r: any) { const d = this.safeDict (r, 'z', {}); let c = this.safeDict (r, 'k'); if (d['y'] !== undefined) { c = d; } return c['q']; }",
        "    anyWrite (r: any) { let e = this.safeDict (r, 'k', {}); e = this.safeValue (r, 'v'); return e['q']; }",
        "    fieldWrite (code: string) { let f = this.account (); if (code in this.balance) { f = this.balance[code]; } f['free'] = '1'; return f; }",
        "    otherDefault (r: any) { const g = this.safeDict (r, 'k', r); return g['q']; }",
    ], checks: [
        [ /Map<String, Object> a = (\(java\.util\.Map<String, Object>\) )?this\.safeDict\(/, true, "'a' (safeDict + omit-self) must print Map<String, Object>" ],
        [ /Map<String, Object> b = (\(java\.util\.Map<String, Object>\) )?this\.depositWithdrawFee\(/, true, "'b' (fresh-map method) must print Map<String, Object>" ],
        [ /Map<String, Object> c = /, true, "'c' (safeDict + Map copy) must print Map<String, Object>" ],
        [ [ /Helpers\.addElementToObject\(a, /, /Helpers\.GetValue\(a, / ], false, "'a' put/get must go native" ],
        ...[ 'e', 'f', 'g' ].map((n): JavaProbeCheck => [ new RegExp(`\\bObject ${n} = `), true, `'${n}' has an unproven write/default and must stay Object` ]),
    ] });
}

// Snippet checks for the native arithmetic pass (`--audit-string-types --self-test`)
function javaTypedArithmeticSelfTest (): string[] {
    const member = (body: string) => `    public Object m(Long since, Long limit, Object x)\n    {\n${body}\n    }\n`;
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
    const problems = runSnippetCases(cases, member, nativeJavaTypedArithmetic, (name, out) => `arithmetic: ${[ 'FAIL', name, '\n', out ].join (' ').slice (0, 300)}`);
    if (problems.length) problems.push (`arithmetic: ${problems.length} !== 0`);
    return problems;
}

// Venue-only methods called with typed arguments print typed parameters; a written,
// mistyped, `+`-left or name-referenced parameter keeps Object
function javaParamTypesSelfTest (): string[] {
    return javaProbeCases({ cls: 'zzj12selftest', members: [
        "    run (r: any) { const s = this.safeString (r, 'a'); this.zzjA (s, s === 'b', this.safeList (r, 'l', [])); this.zzjB (s); this.zzjC (s); this.zzjD (r); const f = this.zzjE; return f; }",
        "    zzjA (code: string, flag: boolean, rows: any[]) { return [ code.length, flag, rows.length ]; }",
        "    zzjB (code: string) { code = code + 'x'; return code; }",
        "    zzjC (code: string) { return code + this.id; }",
        "    zzjD (code: string) { return code; }",
        "    zzjE (code: string) { return code; }",
    ], checks: [
        [ /zzjA\(String code, Boolean flag, java\.util\.List<Object> rows\)/, true, 'zzjA must print String/Boolean/List<Object> params' ],
        [ /this\.zzjA\(s, java\.util\.Objects\.equals\(s, "b"\), \(java\.util\.List<Object>\) \(this\.safeList\(/, true, 'zzjA call must pass the String local bare and checkcast the List' ],
        // A plain `string` annotation prints String on a generated venue method whether the
        // parameter is written, `+`-left or handed an unproven caller, because writes are cast and the
        // caller carries the checkcast
        ...[ 'zzjB', 'zzjC', 'zzjD', 'zzjE' ].map((n): JavaProbeCheck => [ new RegExp(`${n}\\(String code\\)`), true, `java param types self test: ${n} must print String code` ]),
    ] });
}

// Object locals whose init and every write are Lists print List<Object>; any other write keeps Object
function javaListLocalsSelfTest (): string[] {
    return javaProbeCases({ cls: 'zzj13selftest', output: true, members: [
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
    ], checks: [
        [ /List<Object> a = /, true, "'a' ([] + arrayConcat) must print List<Object>" ],
        [ /a = (\(java\.util\.List<Object>\) )?this\.arrayConcat\(/, true, "'a' arrayConcat write must stay a List write" ],
        [ /List<Object> b = (\(java\.util\.List<Object>\) )?this\.safeList\(/, true, "'b' (safeList + safeList write) must print List<Object>" ],
        [ /List<Object> c = /, true, "'c' (Object.keys) must print List<Object>" ],
        [ [ /Helpers\.getArrayLength\((a|b)\)/, /Helpers\.GetValue\((a|b), / ], false, "'a'/'b' length/get must go native" ],
        // shapes no earlier section types: toArray / fresh-list method writes, a List<Object> core + sortBy
        [ [ /List<Object> m = /, /m = \(java\.util\.List<Object>\) this\.convertTradingViewToOHLCV\(/ ], true, "'m' ([] + toArray + fresh-list method) must print List<Object> with a write checkcast" ],
        [ /List<Object> o = this\.filterBySinceLimit\(/, true, "'o' (filterBySinceLimit + sortBy) must print List<Object>" ],
        [ [ /Helpers\.getArrayLength\([mo]\)/, /Helpers\.GetValue\(o, / ], false, "'m'/'o' length/get must go native" ],
        [ /List<Object> q = /, false, "'q' (as string[] prints a List<String> cast) must not print List<Object>" ],
        [ /List<Object> s = (?!\(java\.util\.List<Object>\) \(\(Object\))/, false, "'s' (as any prints ((Object)v)) needs the List checkcast" ],
        ...[ 'e', 'f' ].map((n): JavaProbeCheck => [ new RegExp(`\\bObject ${n} = `), true, `'${n}' has an unproven write/default and must stay Object` ]),
        // 'k': safeList with a [] default plus a write guarded by Array.isArray (k's source) is a List on every path
        [ /\bObject k = |k = \(java\.util\.List<Object>\) response;/, true, "'k' guarded write must take the List checkcast" ],
        [ /List<Object> g = /, false, "'g' has no List write and must not print List<Object>" ],
    ] });
}

// r77j2: conditional initialisers whose arms prove one box print it; an Integer-only or unproven arm keeps Object
function javaR77j2ConditionalLocalsSelfTest (): string[] {
    const problems: string[] = [];
    const probe = path.join(process.cwd(), 'ts', 'src', `zzr77j2selftest${process.pid}.ts`);
    const body = [
        "import Exchange from './abstract/binance.js';",
        "import type { Int, Dict } from './base/types.js';",
        'export default class zzr77j2selftest extends Exchange {',
        "    async all (ps: any[]) { const a = await Promise.all (ps); return a.length; }",
        "    lim (limit: Int = undefined) { const b = (limit === undefined) ? 93 : limit; return b * 2; }",
        "    exp (e: string) { const c = (e === '') ? undefined : this.convertExpireDate (e); return c; }",
        "    nd (r: Dict, k: string) { let d = (k === undefined) ? undefined : this.safeDict (r, k); if (d === undefined) { d = this.safeDict (r, 'x'); } return d; }",
        "    ints (x: boolean) { const f = x ? 1 : 2; return f; }",
        "    anyArm (x: boolean, r: any) { const g = x ? r : 1; return g; }",
        '}',
    ].join('\n');
    try {
        fs.writeFileSync(probe, body);
        const out = new NewTranspiler().transpiler.transpileJavaByPath(probe).content as string;
        if (!/List<Object> a = /.test(out)) problems.push("'a' (await Promise.all of a list) must print List<Object>");
        if (!/Long b = /.test(out)) problems.push("'b' (int literal : Long param) must print Long");
        if (!/String c = \(String\) \(/.test(out)) problems.push("'c' (null : convertExpireDate) must print String with a checkcast");
        if (!/Map<String, Object> d = \(java\.util\.Map<String, Object>\) \(/.test(out)) problems.push("'d' (null : safeDict, safeDict write) must print Map with a checkcast");
        if (/\bLong f = |\bObject f = (?!.*\? 1 : 2)/.test(out)) problems.push("'f' (int : int) is not this family's");
        if (!/\bObject g = /.test(out)) problems.push("'g' (any : int) must stay Object");
        if (problems.length) problems.push('output:\n' + out);
    } catch (e: any) {
        problems.push(`self-test threw: ${e.message}`);
    } finally {
        fs.rmSync(probe, { force: true });
    }
    return problems;
}

// Object locals whose init and every write are one proven scalar box print it; a mixed write keeps Object
function javaScalarLocalsSelfTest (): string[] {
    return javaProbeCases({ cls: 'zzj14selftest', members: [
        "    ts (t: any) { const a = this.safeIntegerOmitZero (t, 'k'); return { 'a': a }; }",
        "    flag (p: any, d: boolean) { const b = this.safeBool (p, 'x', this.safeBool (p, 'y', false)); return [ b, p ]; }",
        "    str (t: any) { let c = this.safeString (t, 'v'); if (c === undefined) { c = this.safeString2 (t, 'w', 'z'); } return { 'c': c }; }",
        "    until (p: any) { let u = this.safeInteger (p, 'until'); if (u === undefined) { u = this.milliseconds (); } return u > 5; }",
        "    mixed (p: any) { let e = this.safeInteger (p, 'k'); e = this.sum (e, 1); return e; }",
        "    product (p: any) { const g = this.safeIntegerProduct2 (p, 'a', 'b', 1000, 0); return g; }",
    ], checks: [
        [ /Long a = \(Long\) this\.safeIntegerOmitZero\(/, true, "'a' (safeIntegerOmitZero, no default) must print Long with a checkcast" ],
        [ /Boolean b = \(Boolean\) this\.safeBool\(/, true, "'b' (safeBool, Boolean default) must print Boolean" ],
        [ /String c = this\.safeString\(/, true, "'c' (safeString + safeString2 write) must print String" ],
        [ /Long u = this\.safeInteger\(/, true, "'u' (safeInteger + milliseconds write) must print Long" ],
        ...[ 'e', 'g' ].map((n): JavaProbeCheck => [ new RegExp(`\\bObject ${n} = `), true, `'${n}' has an unproven write/default/arm and must stay Object` ]),
    ] });
}

// r77-j4: `let x = undefined` seeds joined over copy / sync-core writes print the written box
function javaNullSeedJoinSelfTest (): string[] {
    const problems: string[] = [];
    const probe = path.join(process.cwd(), 'ts', 'src', `zzj4nullseed${process.pid}.ts`);
    const body = [
        "import Exchange from './abstract/binance.js';",
        "import type { Dict } from './base/types.js';",
        'export default class zzj4nullseed extends Exchange {',
        "    action (p: Dict): Dict { return { 'a': this.safeString (p, 'a') }; }",
        "    sign2 (p: Dict, flag: boolean) { let sig = undefined; if (flag) { sig = this.action (p); } else { sig = this.action ({}); } const r = sig['r']; return [ r ]; }",
        "    copy (p: Dict, flag: boolean) { const a = this.safeString (p, 'a'); const b = this.safeString (p, 'b'); let c = undefined; if (flag) { c = a; } else { c = flag ? a : b; } return { 'c': c }; }",
        "    signed (action: any, nonce: any, vault: string = undefined): Dict { return { 'r': action, 'n': nonce, 'v': vault }; }",
        "    built (payload: any): Dict { return { 'r': payload }; }",
        "    send (p: Dict, flag: boolean) { let sent: Dict; if (flag) { sent = this.signed (p, 1); } else { sent = this.built (p); } return { 'signature': sent }; }",
        "    netw (p: Dict, flag: boolean) { let net = undefined; if (flag) { net = this.networkIdToCode (this.safeString (p, 'n')); } return { 'net': net }; }",
        "    mixed (p: Dict, flag: boolean) { const a = this.safeString (p, 'a'); let m = undefined; if (flag) { m = a; } else { m = p; } return { 'm': m }; }",
        '}',
    ].join('\n');
    try {
        fs.writeFileSync(probe, body);
        const out = new NewTranspiler().transpiler.transpileJavaByPath(probe).content as string;
        if (!/Map<String, Object> sent = null/.test(out)) problems.push("'sent' (sync cores returning Map on every write) must print Map<String, Object>");
        if (!/String net = null/.test(out)) problems.push("'net' (base core printed String) must print String");
        if (!/String c = null/.test(out)) problems.push("'c' (copies of String locals) must print String");
        if (!/\bObject m = null/.test(out)) problems.push("'m' (String and Map writes) must stay Object");
    } catch (e: any) {
        problems.push(`self-test threw: ${e.message}`);
    } finally {
        fs.rmSync(probe, { force: true });
    }
    return problems;
}

// 77j8: copies of a default-valued scalar parameter print its box; `[]` locals written only inside an
// `Array.isArray (v)` branch print List<Object>; an unproven write keeps Object
function javaJ8CopyLocalsSelfTest (): string[] {
    const problems: string[] = [];
    const probe = path.join(process.cwd(), 'ts', 'src', `zzj8selftest${process.pid}.ts`);
    const body = [
        "import Exchange from './abstract/binance.js';",
        "import type { Int } from './base/types.js';",
        'export default class zzj8selftest extends Exchange {',
        "    since (symbol: string, since: Int = undefined, p = {}) { let a: Int = since; if (a === undefined) { a = this.milliseconds () - 30 * 24 * 60 * 60 * 1000; } return { 'a': a }; }",
        "    lit (symbol: string, limit: Int = undefined, p = {}) { let b: Int = limit; if (b === undefined) { b = 200; } return { 'b': b }; }",
        "    mixed (symbol: string, since: Int = undefined, p = {}) { let c: Int = since; c = this.sum (c, 1); return { 'c': c }; }",
        "    guarded (response: any) { let d = []; if (Array.isArray (response)) { d = response; } return d.length; }",
        "    unguarded (response: any) { let e = []; e = response; return e.length; }",
        '}',
    ].join('\n');
    try {
        fs.writeFileSync(probe, body);
        const out = new NewTranspiler().transpiler.transpileJavaByPath(probe).content as string;
        if (!/Long a = since;/.test(out)) problems.push("'a' (copy of a Long default parameter) must print Long");
        // the write is a Long checkcast or native long arithmetic of a Long reader and long literals
        if (!/a = \(Long\) /.test(out) && !/a = \(this\.milliseconds\(\) - \(+30L \* 24L\)/.test(out)) problems.push("'a' Long-arithmetic write needs a Long checkcast or native long arithmetic");
        if (!/Long b = limit;/.test(out) || !/b = 200L;/.test(out)) problems.push("'b' (Long copy + int literal write) must print Long and a 200L write");
        if (!/List<Object> d = /.test(out) || !/d = \(java\.util\.List<Object>\) response;/.test(out)) problems.push("'d' (Array.isArray-guarded write) must print List<Object> with a checkcast");
        for (const name of [ 'c', 'e' ]) {
            if (!new RegExp(`\\bObject ${name} = `).test(out)) problems.push(`'${name}' has an unproven write and must stay Object`);
        }
        if (problems.length) problems.push('output:\n' + out);
    } catch (e: any) {
        problems.push(`self-test threw: ${e.message}`);
    } finally {
        fs.rmSync(probe, { force: true });
    }
    return problems;
}

// Scalar-proven locals compared to each other print a value compare; a typed-param callee declared above its caller
// still reads the caller's typed local
function javaParamTypesPreScanSelfTest (): string[] {
    return javaProbeCases({ cls: 'zzj15selftest', output: true, members: [
        "    zzjHelper (code: string) { return code.length; }",
        "    seq (p: any) { const a = this.safeInteger (p, 'a'); const b = this.safeInteger (p, 'b'); if (a !== b) { return 1; } return a === b; }",
        "    run (r: any) { const s = this.safeString (r, 'a'); return this.zzjHelper (s); }",
    ], checks: [
        [ [ /Long a = this\.safeInteger\(/, /Long b = this\.safeInteger\(/ ], true, "'a'/'b' compared box-to-box must print Long (box-to-box veto lifted)" ],
        [ [ /!java\.util\.Objects\.equals\(a, b\)/, /[^!]java\.util\.Objects\.equals\(a, b\)/ ], true, 'Long === / !== Long must print Objects.equals' ],
        [ /\ba [!=]= b\b/, false, 'no reference ==/!= on two Long boxes' ],
        [ /zzjHelper\(String code\)/, true, 'zzjHelper above its caller must print String code (helper return pre-scan)' ],
    ] });
}
// `: Str` / `: Int` / `: Num` venue methods print String / Long / Double once their bodies print
function javaStringReturnsSelfTest (): string[] {
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
    ];
    const childBody = [
        `import base from './zzj17selftest${process.pid}.js';`,
        "import type { Str } from './base/types.js';",
        `export default class zzj17selftestchild${process.pid} extends base {`,
        "    over (x: any): Str { return this.safeValue (x, 'u'); }",
        '}',
    ];
    return javaProbeCases({ files: [ [ 'zzj17selftest', body ], [ 'zzj17selftestchild', childBody ] ], checks: [
        [ /public String pairSym\(/, true, "pairSym (callee printed after its caller, String local return) must print String" ],
        [ /String a = this\.pairSym\(/, true, "the caller local of pairSym must print String" ],
        [ /public Long tif\(/, true, "tif (Int, safeInteger return) must print Long" ],
        [ /Long c = this\.tif\(/, true, "the caller local of tif must print Long" ],
        [ /public Double fromW\(/, true, "fromW (Num, parseNumber/undefined arms) must print Double" ],
        [ /public Object unboxed\(/, true, "unboxed has a ternary-arm caller and must stay Object" ],
        [ /public Object over\(/, true, "over is redeclared by a descendant and must stay Object" ],
    ] });
}

// Ordered comparisons / Math.max-min over non-null numeric expressions (runs after the typed arithmetic + long-limit passes)
function nonNullCompareSplitTop (text: string): { left: string, op: string, right: string } | undefined {
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

export function nonNullCompareOperand (text: string, member: string, fields: Set<string>, content: string, depth = 0): { kind: string, boxed: boolean, text: string, literal?: boolean } | undefined {
    const base = orderedCompareOperand (text, member, fields);
    if (base !== undefined || depth > 8) return base;
    const inner = orderedCompareStripParens (text);
    const prim = (kind: string) => ({ kind, boxed: false, text: '(' + inner + ')' });
    const cast = inner.match (/^\((long|int|double)\) ?(.+)$/);
    if (cast !== null) {
        const o = nonNullCompareOperand (cast[2], member, fields, content, depth + 1);
        return o === undefined ? undefined : prim (cast[1] === 'double' ? 'double' : 'long');
    }
    const bin = nonNullCompareSplitTop (inner);
    if (bin !== undefined) {
        const l = nonNullCompareOperand (bin.left, member, fields, content, depth + 1);
        const r = nonNullCompareOperand (bin.right, member, fields, content, depth + 1);
        if (l === undefined || r === undefined) return undefined;
        return prim (l.kind === 'double' || r.kind === 'double' ? 'double' : 'long');
    }
    // hand-written base members returning a non-null long / int (no venue redeclaration)
    const call = inner.match (/^this\.(milliseconds|seconds|parseTimeframe)\(/);
    if (call !== null && promiseAllClose (inner, call[0].length - 1) === inner.length - 1
        && !new RegExp ('^    (?:public|private|protected)[^\\n(]* ' + call[1] + '\\(', 'm').test (content)) return prim ('long');
    if (/^Helpers\.getArrayLength\(/.test (inner) && promiseAllClose (inner, 'Helpers.getArrayLength'.length) === inner.length - 1) return prim ('long');
    if (/\.(?:size|length)\(\)$/.test (inner) && !/\s/.test (inner.replace (/\([^()]*\)/g, ''))) return prim ('long');
    const mm = inner.match (/^Math\.(?:min|max)\(/);
    if (mm !== null && promiseAllClose (inner, mm[0].length - 1) === inner.length - 1) {
        const split = orderedCompareSplitArgs (inner, mm[0].length);
        if (split === undefined || split.args.length !== 2) return undefined;
        const ks = split.args.map ((a) => nonNullCompareOperand (a, member, fields, content, depth + 1));
        if (ks.some ((k) => k === undefined)) return undefined;
        return prim (ks.some ((k) => k.kind === 'double') ? 'double' : 'long');
    }
    return undefined;
}

// the expression's Java type is long (Long box once stored): the result box of a native Math.max/min
function nonNullCompareLongValued (text: string, member: string, depth = 0): boolean {
    const e = orderedCompareStripParens (text);
    if (depth > 8) return false;
    if (/^-?\d{1,15}L$/.test (e) || /^\(long\) ?/.test (e) || /^this\.(?:milliseconds|seconds)\(\)$/.test (e)) return true;
    if (/^[A-Za-z_$][\w$]*$/.test (e)) {
        const decls = [ ...member.matchAll (new RegExp ('(?:^|[\\s(,])([\\w.$<>]+) ' + e.replace (/\$/g, '\\$') + '\\s*(?:=|;|,|\\))', 'gm')) ].map ((d) => d[1]);
        return decls.length === 1 && /^(?:final )?(?:Long|long)$/.test (decls[0]);
    }
    const bin = nonNullCompareSplitTop (e);
    return bin !== undefined && (nonNullCompareLongValued (bin.left, member, depth + 1) || nonNullCompareLongValued (bin.right, member, depth + 1));
}

// Helpers.mathMax/mathMin hand back one operand's box: native only for two non-null long-valued operands
function nonNullCompareMathNative (helper: string, l, r, args: string[], member: string): string | undefined {
    if (l.kind !== 'long' || r.kind !== 'long' || l.boxed || r.boxed) return undefined;
    const wide = (o) => (o.literal && !/L$/.test (o.text) ? o.text + 'L' : o.text);
    // an int-valued non-literal side would turn the helper's Integer result into a Long
    if (!args.every ((a, k) => [ l, r ][k].literal || nonNullCompareLongValued (a, member))) return undefined;
    if (!args.some ((a) => nonNullCompareLongValued (a, member))) return undefined;
    return `Math.${helper === 'mathMax' ? 'max' : 'min'}(${wide (l)}, ${wide (r)})`;
}

export function nativeJavaNonNullCompare (content: string): string {
    if (!/Helpers\.(?:is(?:Greater|Less)Than|mathM(?:in|ax))/.test (content)) return content;
    const re = /Helpers\.(is(?:GreaterThan|LessThan|GreaterThanOrEqual|LessThanOrEqual)|mathMin|mathMax)\(/g;
    return rewriteMemberHelperCalls (content, re, /Helpers\.(?:is|math)/, (m, args, member, fields) => {
        const l = nonNullCompareOperand (args[0], member, fields, content);
        const r = nonNullCompareOperand (args[1], member, fields, content);
        if (l === undefined || r === undefined) return undefined;
        return m[1].startsWith ('math') ? nonNullCompareMathNative (m[1], l, r, args, member) : orderedCompareNative (m[1].replace (/^is/, ''), l, r);
    });
}

function javaNonNullCompareSelfTest (): string[] {
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
    return runSnippetCases(cases, member, nativeJavaNonNullCompare, (name, out) => `compare ${name}: ${out.slice (0, 400)}`);
}

// The unwritten first parameter of parseWsOrderStatus compared to,
// divided or mod-ed with an integer literal prints a double compare carrying the helper's null arm
function javaParamCompareSelfTest (): string[] {
    const problems: string[] = [];
    const head = '    public Object parseWsOrderStatus(Object code, Object reason)\n    {\n';
    const run = (body: string) => nativeJavaParamCompare (head + body + '\n    }\n');
    const pos: [string, string][] = [
        [ '        if (Helpers.isEqual(code, 418)) {}', '(code != null && ((Number) code).doubleValue() == 418)' ],
        [ '        if (Helpers.isLessThan(code, 400)) {}', '(code == null || !(((Number) code).doubleValue() >= 400))' ],
        [ '        if (Helpers.isGreaterThanOrEqual(code, 400)) {}', '(code != null && ((Number) code).doubleValue() >= 400)' ],
        [ '        if (Helpers.isLessThanOrEqual(code, 503)) {}', '(code == null || !(((Number) code).doubleValue() > 503))' ],
        [ '        Object t = this.parseToInt(Helpers.divide(code, 1000));', '(code == null ? null : ((Number) code).doubleValue() / 1000)' ],
        [ '        Object t = Helpers.mod(1000, code);', '(code == null ? null : ((double) 1000) % ((Number) code).doubleValue())' ],
    ];
    for (const [ body, expect ] of pos) if (!run (body).includes (expect)) problems.push (`java param compare self test expected ${expect} in\n${run (body)}`);
    const neg = [
        '        code = this.safeInteger(reason, "c");\n        if (Helpers.isEqual(code, 418)) {}',
        '        if (Helpers.isEqual(reason, 418)) {}',
        '        if (Helpers.isEqual(code, other)) {}',
    ];
    for (const body of neg) if (run (body) !== head + body + '\n    }\n') problems.push (`must keep the helper in\n${body}`);
    const other = '    public Object fetchX(Object code)\n    {\n        if (Helpers.isEqual(code, 1)) {}\n    }\n';
    if (nativeJavaParamCompare (other) !== other) problems.push ('other methods keep the helper');
    return problems;
}

// The transpiled bodies of BaseExchange.java / Exchange.java / PredictionExchange.java
// get the same native post-passes createJavaClass runs on exchange files, in the same order
function javaBaseNativePasses (transpiler: any, body: string, sourcePath?: string): string {
    let content = body;
    content = transpiler.retypeFinalVarDeclarations(content);
    content = nativeJavaDeclaredElementReads(content);
    content = nativeJavaElementReads(content);
    content = nativeJavaLongLimitLocals(content);
    content = nativeJavaTopLevelNewMap(content);
    content = nativeJavaReassignedNewMap(content);
    content = nativeJavaEqualTruthy(content);
    content = nativeJavaOrderedComparisons(content);
    content = nativeJavaNestedNewMaps(content);
    content = nativeJavaTypedArithmetic(content);
    content = nativeJavaBoxLocalsCoreArgs(content);
    content = nativeJavaNumberProvenCompare(content);
    content = nativeJavaRemainingCoreArgs(content);
    content = nativeJavaInlineDivModNeg(content);
    content = nativeJavaInlineCompare(content);
    content = nativeJavaContainerOps(content);
    content = nativeJavaCoreArgHelpers(nativeJavaStringAdd(content));
    content = nativeJavaInlineCompare(nativeJavaInlineDivModNeg(content));
    return content;
}

// the single declared type of a name in a printed member (params included); undefined when the name
// is shadowed by a lambda parameter or declared with mixed types. Memoised per member.
function memberDeclaredTypeOf (member: string, skipYield = false): (name: string) => string | undefined {
    const typeCache = new Map<string, string | undefined> ();
    const keywords = [ 'return', 'new', 'else', 'case', 'throw', 'instanceof', ...(skipYield ? [ 'yield' ] : []) ];
    return (name: string): string | undefined => {
        if (typeCache.has (name)) return typeCache.get (name);
        const re = new RegExp (`(?:^|[\\s(,])((?:final )?[\\w.]+(?:<[\\w.?]+(?:<[\\w.?, ]*>)?(?:, [\\w.?]+(?:<[\\w.?, ]*>)?)*>)?) ${name}(?=\\s*(?:=(?!=)|[,);:]))`, 'g');
        const types = new Set<string> ();
        for (const m of member.matchAll (re)) {
            const t = m[1].replace (/^final /, '');
            if (!keywords.includes (t)) types.add (t);
        }
        const shadowed = new RegExp (`(?:\\(|, )${name}\\) ->|(?<![\\w.])${name} ->`).test (member);
        const out = !shadowed && types.size === 1 ? [ ...types ][0] : undefined;
        typeCache.set (name, out);
        return out;
    };
}

// Helpers.toMapArg/toStringArg/toLongOrNull/toStringListArg are identities on a value that already
// prints the slot type: a name the member declares that type only, or a base call that returns it.
export function nativeJavaCoreArgIdentities (content: string): string {
    const H = /Helpers\.(toMapArg|toStringArg|toLongOrNull|toStringListArg)\(/;
    if (!H.test (content)) return content;
    const MAP = '(?:java\\.util\\.)?Map<String, Object>';
    const LIST_STRING = '(?:java\\.util\\.)?List<String>';
    const DECLARED: Record<string, string> = { toMapArg: MAP, toStringArg: 'String', toLongOrNull: 'Long', toStringListArg: LIST_STRING };
    // base Java methods whose every overload prints that core type
    const MAP_CALLS = /^this\.(?:market|currency|safeMarket|safeCurrency|keysort|deepExtend)\($/;
    const lines = content.split ('\n');
    const starts = [ ...javaMemberStarts (lines), lines.length ];
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
        const declaredType = memberDeclaredTypeOf (member);
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
                } else if (helper === 'toMapArg') {
                    const call = /^(?:[A-Z]\w*\.)?this\.\w+\(/.exec (arg);
                    if (call !== null && closeOf (arg, call[0].length - 1) === arg.length - 1) {
                        const head = call[0].replace (/^[A-Z]\w*\./, '');
                        if (MAP_CALLS.test (head)) native = true;
                        // the two-argument extend overload is declared Map<String, Object> (varargs one is Object)
                        const ext = head === 'this.extend(' ? splitTopLevelArgs (arg.slice (call[0].length, -1)) : [];
                        if (ext.length === 2 && ext.every ((a) => (a.match (/</g) ?? []).length === (a.match (/>/g) ?? []).length)) native = true;
                        if (head === 'this.omit(') {
                            // the omit(Map<String, Object>, ..) overloads return a Map
                            const first = /^this\.omit\(([A-Za-z_]\w*), /.exec (arg);
                            native = first !== null && want.test (declaredType (first[1]) ?? '');
                        }
                    }
                }
                // String.toLowerCase()/toUpperCase() on a cast receiver already prints a String
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

// Test printer: Map-locals retype + core-arg passes over generated test classes (members sit one level deeper than in exchanges),
// and a list literal handed to callDynamically already is a List, so its toStringListArg is dropped.
export function nativeJavaTestCoreArgs (content: string): string {
    if (!/Helpers\.(?:toMapArg|toStringListArg)\(/.test (content)) return content;
    const lines = content.split ('\n');
    const deep = lines.map ((l) => /^        (?:public|private|protected)\b/.test (l));
    // the exchange test param is a BaseExchange: its market/safeMarket print the Map the Map-locals proof reads off `this`
    const shifted = lines.map ((l, i) => (deep[i] ? l.slice (4) : l)).join ('\n').replace (/\bexchange\.(market|safeMarket)\(/g, 'this.$1(');
    const done = nativeJavaCoreArgIdentities (nativeJavaMapLocalsRetype (shifted)).replace (/\bthis\.(market|safeMarket)\(/g, 'exchange.$1(').split ('\n');
    if (done.length !== lines.length) return content;
    return done.map ((l, i) => {
        l = deep[i] ? '    ' + l : l;
        return l.includes ('Helpers.callDynamically(')
            ? l.replace (/Helpers\.toStringListArg\((new (?:java\.util\.)?ArrayList<Object>\((?:java\.util\.)?Arrays\.asList\(\w+\)\))\)/g, '$1')
            : l;
    }).join ('\n');
}

function javaCoreArgIdentitiesSelfTest (): string[] {
    const problems: string[] = [];
    const body = [
        '    public Object a(Object p, Map<String, Object> q)',
        '    {',
        '        Map<String, Object> m = this.omit(q, "x");',
        '        Object o = this.omit(p, "x");',
        '        String s = this.safeString(p, "s");',
        '        Long n = this.safeInteger(p, "n");',
        '        List<String> l = null;',
        '        return this.f(Helpers.toMapArg(m), Helpers.toMapArg(o), Helpers.toStringArg(s), Helpers.toLongOrNull(n), Helpers.toStringListArg(l), Helpers.toMapArg(this.omit(q, "y")), Helpers.toMapArg(this.omit(p, "y")), Helpers.toStringArg(p), Helpers.toMapArg(this.currency((String) (s))), Helpers.toMapArg(Woo.this.extend(q, m)), Helpers.toMapArg(this.extend(q, m, o)));',
        '    }',
        '    public Object b(Object p)',
        '    {',
        '        Map<String, Object> m = null;',
        '        Object m2 = (m) -> m;',
        '        return this.g(Helpers.toMapArg(m));',
        '    }',
    ].join('\n');
    const out = nativeJavaCoreArgIdentities(body);
    const want = 'return this.f(m, Helpers.toMapArg(o), s, n, l, this.omit(q, "y"), Helpers.toMapArg(this.omit(p, "y")), Helpers.toStringArg(p), this.currency((String) (s)), Woo.this.extend(q, m), Helpers.toMapArg(this.extend(q, m, o)));';
    if (!out.includes(want)) problems.push('declared-type core args must drop their identity wrapper (only those)');
    if (!out.includes('return this.g(Helpers.toMapArg(m));')) problems.push('a lambda-shadowed name must keep the wrapper');
    return problems;
}

// Snippet checks for the extended native arithmetic pass (`--audit-string-types --self-test`)
function javaPrimitiveArithmeticSelfTest (): string[] {
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
        [ 'loop-exit guarded parseToInt chain', '        for (var j = 0; j < 3; j++)\n        {\n            Long w = (this.parseToInt(x) * 1000L);\n            Long t = this.safeInteger(x, 0);\n            if (java.util.Objects.equals(t, null))\n            {\n                continue;\n            }\n            Long c = this.parseToInt(Helpers.multiply(((((double) t) / ((double) w))), w));\n        }', 'Long c = this.parseToInt(((((double) t) / ((double) w)) * w));' ],
        [ 'unguarded nullable beside parseToInt chain', '        Long w = (this.parseToInt(x) * 1000L);\n        Long t = this.safeInteger(x, 0);\n        Long c = this.parseToInt(Helpers.multiply(((((double) t) / ((double) w))), w));', undefined ],
        [ 'rewritten after loop-exit guard', '        for (var j = 0; j < 3; j++)\n        {\n            Long w = (this.parseToInt(x) * 1000L);\n            Long t = this.safeInteger(x, 0);\n            if (java.util.Objects.equals(t, null))\n            {\n                continue;\n            }\n            t = this.safeInteger(x, 1);\n            Long c = this.parseToInt(Helpers.multiply(((((double) t) / ((double) w))), w));\n        }', undefined ],
        [ 'safeInteger string key literal default', '        Long t = this.safeInteger(x, "expires_in", 900);\n        Object e = this.sum(x, this.parseToInt(Helpers.multiply((t * 1000L), 0.8)));', 'this.parseToInt(((t * 1000L) * 0.8))' ],
        [ 'safeInteger string key no default', '        Long t = this.safeInteger(x, "expires_in");\n        Object e = this.sum(x, this.parseToInt(Helpers.multiply((t * 1000L), 0.8)));', undefined ],
        [ 'safeInteger string key null default', '        Long t = this.safeInteger(x, "expires_in", null);\n        Object e = this.sum(x, Helpers.multiply(t, 3));', undefined ],
    ];
    return runSnippetCases(cases, member, nativeJavaPrimitiveArithmetic, (name, out) => `arithmetic: ${name}\n${out}`);
}

// Snippet checks for the Object-local retype that lets the primitive arithmetic go native
function javaNumericLocalsRetypeSelfTest (): string[] {
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
    return runSnippetCases(cases, member, nativeJavaNumericLocalsRetype, (name, out) => `arithmetic: ${name}\n${out}`);
}

// Object/var locals whose every write is a proven Map (null, a Map literal / newMap, a Map-declared
// name, a 2-arg extend, omit of a Map, Pair.second() of a Map slot, or slot 1 of an audited tuple
// producer) print `java.util.Map<String, Object>`; the core-arg pass then drops their toMapArg identity wrappers.
// tuple producers -> index of the params argument slot 1 echoes (or omits from); -1 = always a Map
function slotOneMapProducers (): Record<string, { params: number, venue?: string }> {
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

function memberCloseParen (text: string, open: number): number {
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
function memberStatementEnd (text: string, from: number): number {
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

function memberStripParens (e: string): string {
    e = e.trim ();
    while (e.startsWith ('(') && memberCloseParen (e, 0) === e.length - 1) e = e.slice (1, -1).trim ();
    return e;
}

// top-level arguments of the call whose `(` is at text[open]
function memberCallArgs (text: string, open: number): string[] | undefined {
    const close = memberCloseParen (text, open);
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

function memberSplitTernary (e: string): [string, string, string] | undefined {
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

// greatest fixpoint: drop every assumed name with a write `proves` rejects under the current set
function shrinkAssumed<W> (assumed: Set<string>, writes: Map<string, W[]>, proves: (w: W, assumed: Set<string>) => boolean): void {
    for (let changed = true; changed;) {
        changed = false;
        for (const n of [ ...assumed ]) if (!(writes.get (n) ?? []).every ((w) => proves (w, assumed))) { assumed.delete (n); changed = true; }
    }
}

function mapLocalsRetypeMember (member: string, className: string): string {
    if (!member.includes ('Helpers.toMapArg(')) return member;
    const header = member.split ('\n', 1)[0];
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
            const end = memberStatementEnd (member, start);
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
        const args = memberCallArgs (member, open);
        return args === undefined ? undefined : { name: m[2], args };
    };
    const proves = (e: string, assumed: Set<string>, depth = 0): boolean => {
        e = memberStripParens (e);
        if (e === 'null' || e.startsWith ('new HashMap<String, Object>() {{') || e.startsWith ('new java.util.HashMap<String, Object>() {{')) return true;
        if (/^[A-Za-z_]\w*$/.test (e)) return assumed.has (e) || declaredMap (e);
        const t = memberSplitTernary (e);
        if (t !== undefined) return depth < 4 && proves (t[1], assumed, depth + 1) && proves (t[2], assumed, depth + 1);
        // toMapArg of a proven Map is the identity (the tuple's params argument echoes the local)
        const wrapped = /^Helpers\.toMapArg\(([A-Za-z_]\w*)\)$/.exec (e);
        if (wrapped !== null) return proves (wrapped[1], assumed, depth + 1);
        const call = /^(this\.\w+\(|Helpers\.newMap\()/.exec (e);
        if (call !== null && memberCloseParen (e, call[0].length - 1) === e.length - 1) {
            if (call[1] === 'Helpers.newMap(' || /^this\.(?:market|currency|safeMarket|safeCurrency|keysort|deepExtend)\($/.test (call[1])) return true;
            const args = memberCallArgs (e, call[0].length - 1) ?? [];
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
            const spec = holder === undefined ? undefined : slotOneMapProducers ()[holder.name];
            if (holder === undefined || spec === undefined || (spec.venue !== undefined && spec.venue !== className)) return false;
            if (spec.params === -1) return true;
            const arg = holder.args[spec.params];
            return arg !== undefined && depth < 4 && proves (arg.replace (/^\(Map<String, Object>\) /, ''), assumed, depth + 1);
        }
        return false;
    };
    // greatest fixpoint over the candidates
    const assumed = new Set (candidates);
    shrinkAssumed (assumed, writes, (w, a) => proves (w.rhs, a));
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
            const rhs = memberStripParens (w.rhs);
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

export function nativeJavaMapLocalsRetype (content: string): string {
    if (!content.includes ('Helpers.toMapArg(')) return content;
    const cls = /^public (?:abstract )?class (\w+)/m.exec (content);
    const className = cls === null ? '' : cls[1];
    return mapJavaMembers (content, false, (member) => mapLocalsRetypeMember (member, className)) ?? content;
}

// Snippet checks for the Map-local retype (`--audit-string-types --self-test`)
function javaMapLocalsRetypeSelfTest (): string[] {
    const cls = (body: string) => `public class Bitget extends BitgetApi\n{\n    public Object m(Map<String, Object> parameters, Object p)\n    {\n${body}\n    }\n}`;
    const run = (body: string) => nativeJavaCoreArgIdentities (nativeJavaMapLocalsRetype (cls (body)));
    const cases: [string, string, string | undefined][] = [
        // positives: Pair slot, omit of a Map, audited tuple slot 1, base handle* over a Map params argument
        [ 'pair + tuple slot', '        Object q = null;\n        Pair<String, Map<String, Object>> aqVariable = this.handleMarginModeAndParams("x", parameters, (String) null);\n        q = aqVariable.second();\n        List<Object> bqVariable = (List<Object>) this.handleProductTypeAndParams(null, Helpers.toMapArg(q));\n        q = ((List<Object>) bqVariable).get(1);\n        return this.f(Helpers.toMapArg(q));',
            'java.util.Map<String, Object> q = null;' ],
        [ 'postOnly echo', '        Object q = this.omit(parameters, "a");\n        List<Object> pqVariable = (List<Object>) this.handlePostOnly(false, false, Helpers.toMapArg(q));\n        q = ((List<Object>) pqVariable).get(1);\n        return this.f(Helpers.toMapArg(q));',
            'java.util.Map<String, Object> q = this.omit(parameters, "a");' ],
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
    return runSnippetCases(cases, cls, (src) => nativeJavaCoreArgIdentities (nativeJavaMapLocalsRetype (src)), (name, out) => `map locals: ${name}\n${out}`, (body) => nativeJavaCoreArgIdentities (cls (body)));
}

// ordered compares whose operand is an unwritten TS-`number` parameter printed `Object` (audited table, tier/class/method)
// or a `this.sum(..)` (Generic.sum: a non-null Long/Double); the other side an int literal, a `var i = <int>` counter or
// a declared Long/Integer/long/int/Double. Forms keep the helper's null table and its NaN answers (LT/LE true, GT/GE false).
function numberParamTable (): Record<string, Record<string, string[]>> {
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

function numberParamClassKey (content: string): string | undefined {
    const pkg = content.match (/^package io\.github\.ccxt\.exchanges(\.pro|\.prediction)?;$/m);
    const cls = content.match (/^public class (\w+) extends/m);
    if (pkg === null || cls === null) return undefined;
    return (pkg[1] === '.pro' ? 'pro/' : pkg[1] === '.prediction' ? 'prediction/' : '') + cls[1];
}

function nullSafeCompareNative (helper: string, l: { text: string, nullName?: string }, r: { text: string, nullName?: string }): string {
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

export function nativeJavaNumberParamCompare (content: string): string {
    if (!/Helpers\.is(?:Greater|Less)Than/.test (content)) return content;
    const key = numberParamClassKey (content);
    const table = key === undefined ? {} : (numberParamTable ()[key] ?? {});
    const sumOverridden = /^    (?:public|private|protected)[^\n(]* sum\(/m.test (content);
    const lines = content.split ('\n');
    const fields = javaClassFields (lines);
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
            const inner = orderedCompareStripParens (text);
            if (params.has (inner)) return { text: `((Number) ${inner}).doubleValue()`, nullName: inner, mine: true };
            const sum = inner.match (/^this\.sum\(/);
            if (sum !== null && !sumOverridden && promiseAllClose (inner, sum[0].length - 1) === inner.length - 1) return { text: `((Number) ${inner}).doubleValue()`, mine: true };
            if (/^-?\d{1,15}L?$/.test (inner)) return { text: inner, mine: false };
            if (/^[A-Za-z_$][\w$]*$/.test (inner)) {
                const t = orderedCompareDeclaredType (member, inner, fields);
                if (t !== undefined) return { text: inner, nullName: t.boxed ? inner : undefined, mine: false };
            }
            return undefined;
        };
        for (let k = i + 1; k < end; k++) {
            lines[k] = rewriteHelperCalls (lines[k], re, (m, args) => {
                const l = operand (args[0]), r = operand (args[1]);
                return l === undefined || r === undefined || !(l.mine || r.mine) ? undefined : nullSafeCompareNative (m[1], l, r);
            });
        }
        i = end;
    }
    return lines.join ('\n');
}

function javaNumberParamCompareSelfTest (): string[] {
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
    return runSnippetCases(cases, (src) => src, nativeJavaNumberParamCompare, (name, out) => `compare ${name}: ${out.slice (0, 600)}`);
}

// Helpers.addElementToObject / Helpers.GetValue on locals whose single member-wide declaration
// is io.github.ccxt.ws.WsOrderBook (a synchronized Map) or a List<String> read at a `for (var i` counter.
export function nativeJavaWsOrderBookContainers (content: string): string {
    if (!/Helpers\.(?:addElementToObject|GetValue)\(/.test (content)) return content;
    const WS_BOOK = /^(?:io\.github\.ccxt\.ws\.)?WsOrderBook(?:\.(?:Counted|Indexed)OrderBook)?$/;
    const LIST_STRING = /^(?:java\.util\.)?List<String>$/;
    const lines = content.split ('\n');
    const starts = [ ...javaMemberStarts (lines), lines.length ];
    let changed = false;
    for (let s = 0; s + 1 < starts.length; s++) {
        const from = starts[s];
        const to = starts[s + 1];
        const member = lines.slice (from, to).filter ((l) => !/^\s*(?:\/\/|\*|\/\*)/.test (l)).join ('\n');
        if (!/Helpers\.(?:addElementToObject|GetValue)\(/.test (member)) continue;
        const declaredType = memberDeclaredTypeOf (member);
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

// Snippet checks for the WsOrderBook / List<String> container pass (`--audit-string-types --self-test`)
function javaWsOrderBookContainersSelfTest (): string[] {
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
        [ 'List<Object> left to the list-local pass', 'Object client', '        List<String> keys = this.sort(raw);\n        Object key = Helpers.GetValue(keys, 0);', undefined ],
    ];
    const wrapped = cases.map(([ name, sig, body, expect ]): SnippetCase => [ name, cls (sig, body), expect ]);
    return runSnippetCases(wrapped, (src) => src, nativeJavaWsOrderBookContainers, (name, out) => `containers: ${name}\n${out}`);
}

// Object/var locals whose every write proves one box: String / Long (`this.sum` of Long-or-int operands) /
// List<String> retype so the core-arg pass drops toStringArg / toLongOrNull / toStringListArg; Boolean- and Integer-proven
// locals turn isTrue / isEqual(x, intLiteral) into Boolean.TRUE.equals / Objects.equals.
function boxLocalsBaseReturnTypes (): Record<string, string> {
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

function boxLocalsCoreArgsMember (member: string, content: string): string {
    if (!/Helpers\.(?:toStringArg|toLongOrNull|toStringListArg|isTrue|isEqual)\(/.test (member)) return member;
    const header = member.split ('\n', 1)[0];
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
    const baseTypes = boxLocalsBaseReturnTypes ();
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
            const end = memberStatementEnd (member, start);
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
        e = memberStripParens (e);
        if (e === 'null') return true;
        if (/^[A-Za-z_]\w*$/.test (e)) {
            if (assumed.has (e)) return true;
            if (kind === 'String') return declaredAs (e, /^String$/);
            if (kind === 'Long') return declaredAs (e, /^Long$/);
            if (kind === 'List<String>') return declaredAs (e, /^(?:java\.util\.)?List<String>$/);
            if (kind === 'Boolean') return e === 'true' || e === 'false' || declaredAs (e, /^(?:Boolean|boolean)$/);
            return false;
        }
        const t = memberSplitTernary (e);
        if (t !== undefined) return depth < 4 && proves (kind, t[1], assumed, depth + 1) && proves (kind, t[2], assumed, depth + 1);
        if (kind === 'String' && /^"(?:[^"\\]|\\.)*"$/.test (e)) return true;
        if (kind === 'Integer') return INT_LIT.test (e) || (/\.size\(\)$/.test (e) && /^\(\(\(?(?:java\.util\.)?List<\?>\)\s*[A-Za-z_]\w*\)\)?\.size\(\)$|^[A-Za-z_]\w*\.size\(\)$/.test (e));
        if (kind === 'Boolean') {
            return e.startsWith ('!') && !e.startsWith ('!=');
        }
        const call = /^this\.(\w+)\(/.exec (e);
        if (call === null || memberCloseParen (e, call[0].length - 1) !== e.length - 1) return false;
        if (kind === 'Long' && call[1] === 'sum') {
            const args = memberCallArgs (e, call[0].length - 1) ?? [];
            return args.length === 2 && args.every ((a) => INT_LIT.test (memberStripParens (a)) || (depth < 4 && proves ('Long', a, assumed, depth + 1)));
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
        shrinkAssumed (assumed, writes, (w, a) => proves (kind, w, a));
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
    shrinkAssumed (bAssumed, writes, (w, a) => proves ('Boolean', w, a));
    shrinkAssumed (iAssumed, writes, (w, a) => proves ('Integer', w, a));
    out = out.replace (/Helpers\.isTrue\(([A-Za-z_]\w*)\)/g, (all, n) => (bAssumed.has (n) || declaredAs (n, /^Boolean$/)) ? `Boolean.TRUE.equals(${n})` : all);
    out = out.replace (/Helpers\.isEqual\(([A-Za-z_]\w*), (-?\d+)\)/g, (all, n, lit) => {
        if (iAssumed.has (n) || declaredAs (n, /^Integer$/)) return `java.util.Objects.equals(${n}, ${lit})`;
        if (declaredAs (n, /^Long$/)) return `(${n} != null && ${n} == ${lit}L)`;
        return all;
    });
    return out;
}

export function nativeJavaBoxLocalsCoreArgs (content: string): string {
    if (!/Helpers\.(?:toStringArg|toLongOrNull|toStringListArg|isTrue|isEqual)\(/.test (content)) return content;
    const out = mapJavaMembers (content, false, (member) => boxLocalsCoreArgsMember (member, content));
    return out === undefined ? content : nativeJavaCoreArgIdentities (out);
}

// Snippet checks (`--audit-string-types --self-test`)
function javaBoxLocalsCoreArgsSelfTest (): string[] {
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
    return runSnippetCases(cases, cls, nativeJavaBoxLocalsCoreArgs, (name, out) => `java box locals core args: ${name}\n${out}`, (body) => nativeJavaCoreArgIdentities (cls (body)));
}

// Snippet checks for multiply/subtract over Long/Integer/integral-Object locals (`--audit-string-types --self-test`)
function javaIntegralMultiplySubtractSelfTest (): string[] {
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
    return runSnippetCases(cases, member, nativeJavaIntegralMultiplySubtract, (name, out) => `arithmetic: ${name}\n${out}`);
}

// Snippet checks for native divide / mod / opNeg (`--audit-string-types --self-test`)
function javaNumberDivModNegSelfTest (): string[] {
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
    const problems = runSnippetCases(cases, member, nativeJavaNumberDivModNeg, (name, out) => `java number div mod neg: ${name}\n${out}`);
    const overridden = `    public Object sum(Object a, Object b)\n    {\n        return a;\n    }\n${member ('        Object r = this.f(Helpers.divide(this.sum(since, 1), 2));')}`;
    if (nativeJavaNumberDivModNeg (overridden) !== overridden) problems.push ('an overridden sum keeps the helper');
    return problems;
}

// ordered compares / mathMin / mathMax whose operands are Number-proven: Object/var locals whose every write is a number
// literal, null, this.sum / milliseconds / parseToInt / safeInteger.. (base, not redeclared), a declared numeric, native
// arithmetic, a Number-proven local or a ternary of those. Compares keep the helper's null/NaN table (nullSafeCompareNative).
function numberProvenCalls (): Record<string, boolean> {
    // name -> may return null
    return {
        sum: false, milliseconds: false, seconds: false, parseTimeframe: false, parseToInt: true,
        safeInteger: true, safeInteger2: true, safeIntegerN: true, safeTimestamp: true, safeTimestamp2: true,
        safeNumber: true, safeNumber2: true, safeNumberN: true,
    };
}

function numberProvenCompareMember (member: string, content: string, fields: Set<string>): string {
    if (!/Helpers\.(?:is(?:Greater|Less)Than(?:OrEqual)?|mathM(?:in|ax))\(/.test (member)) return member;
    const header = member.split ('\n', 1)[0];
    const declTypes = new Map<string, string[]> ();
    const declRe = /(?:^|[\s(,])((?:final )?[\w.]+(?:<[\w.<>, ?]*>)?) ([A-Za-z_]\w*)(?=\s*(?:=(?!=)|[,);:]))/g;
    for (const m of member.matchAll (declRe)) {
        const t = m[1].replace (/^final /, '');
        if ([ 'return', 'new', 'else', 'case', 'throw', 'instanceof' ].includes (t)) continue;
        declTypes.set (m[2], [ ...(declTypes.get (m[2]) ?? []), t ]);
    }
    const lambdaShadow = (n: string) => new RegExp (`(?:\\(|, )${n}\\) ->|(?<![\\w.])${n} ->`).test (member);
    const isParam = (n: string) => new RegExp (`[(,] ?(?:final )?[\\w.<>, ?]+ ${n}[,)]`).test (header);
    const calls = numberProvenCalls ();
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
            const end = memberStatementEnd (member, start);
            if (end === -1) { ok = false; break; }
            list.push (member.slice (start, end));
        }
        if (ok && list.length > 0) { candidates.add (n); writes.set (n, list); }
    }
    // undefined = unproven; true = Number or null; false = non-null Number
    const state = new Map<string, boolean> ();
    for (const n of candidates) state.set (n, false);
    const prove = (e: string, depth = 0): boolean | undefined => {
        e = memberStripParens (e);
        if (depth > 6) return undefined;
        if (e === 'null' || e === '(Object) null') return true;
        if (/^-?\d{1,15}L?$/.test (e) || /^-?\d{1,15}\.\d{1,15}$/.test (e)) return false;
        if (/^[A-Za-z_$][\w$]*$/.test (e)) {
            if (state.has (e)) return state.get (e);
            const t = orderedCompareDeclaredType (member, e, fields);
            return t === undefined ? undefined : t.boxed;
        }
        const tern = memberSplitTernary (e);
        if (tern !== undefined) {
            const a = prove (tern[1], depth + 1), b = prove (tern[2], depth + 1);
            return a === undefined || b === undefined ? undefined : a || b;
        }
        const call = /^this\.(\w+)\(/.exec (e);
        if (call !== null && memberCloseParen (e, call[0].length - 1) === e.length - 1) return callNullable (call[1]);
        const h = /^(?:Helpers\.(?:add|subtract|multiply|mathMin|mathMax)|java\.util\.Objects\.requireNonNullElse)\(/.exec (e);
        if (h !== null && memberCloseParen (e, h[0].length - 1) === e.length - 1) {
            const args = memberCallArgs (e, h[0].length - 1) ?? [];
            if (args.length !== 2) return undefined;
            const ps = args.map ((a) => prove (a, depth + 1));
            if (ps.some ((p) => p === undefined)) return undefined;
            // requireNonNullElse(a, null) throws on a null a
            if (h[0].startsWith ('java')) return ps[1] === true ? undefined : false;
            return ps[0] || ps[1];
        }
        const prim = nonNullCompareOperand (e, member, fields, content);
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
        const inner = orderedCompareStripParens (text);
        if (/^-?\d{1,15}L?$/.test (inner) || /^-?\d{1,15}\.\d{1,15}$/.test (inner)) return { text: inner, pure: true, num: `((double) ${inner})` };
        if (/^[A-Za-z_$][\w$]*$/.test (inner)) {
            if (state.has (inner)) return { text: `((Number) ${inner}).doubleValue()`, nullName: state.get (inner) ? inner : undefined, pure: true, num: `((Number) ${inner}).doubleValue()` };
            const t = orderedCompareDeclaredType (member, inner, fields);
            if (t === undefined) return undefined;
            return { text: inner, nullName: t.boxed ? inner : undefined, pure: true, num: t.boxed ? `((Number) ${inner}).doubleValue()` : `((double) ${inner})` };
        }
        const sum = /^this\.sum\(/.exec (inner);
        if (sum !== null && !sumOverridden && memberCloseParen (inner, sum[0].length - 1) === inner.length - 1) return { text: `((Number) ${inner}).doubleValue()`, pure: false, num: '' };
        const prim = nonNullCompareOperand (inner, member, fields, content);
        if (prim === undefined || prim.boxed) return undefined;
        const pure = !/[\w$]\s*\(/.test (inner.replace (/\((?:long|int|double)\)/g, ''));
        return { text: prim.text, pure, num: `((double) ${prim.text})` };
    };
    const re = /Helpers\.(isGreaterThanOrEqual|isGreaterThan|isLessThanOrEqual|isLessThan|mathMin|mathMax)\(/g;
    const lines = member.split ('\n');
    for (let k = 1; k < lines.length; k++) {
        lines[k] = rewriteHelperCalls (lines[k], re, (m, args) => {
            const l = operand (args[0]), r = operand (args[1]);
            if (l === undefined || r === undefined) return undefined;
            if (!m[1].startsWith ('math')) return nullSafeCompareNative (m[1], l, r);
            // helper: null if either is null, else the ORIGINAL box of the toDouble-smaller (larger) side
            if (!l.pure || !r.pure) return undefined;
            const a = orderedCompareStripParens (args[0]), b = orderedCompareStripParens (args[1]);
            const pick = `(${l.num} ${m[1] === 'mathMin' ? '<' : '>'} ${r.num} ? (Object) (${a}) : (Object) (${b}))`;
            const nulls = [ l.nullName, r.nullName ].filter ((x) => x !== undefined).map ((x) => `${x} == null`);
            return nulls.length === 0 ? pick : `(${nulls.join (' || ')} ? null : ${pick})`;
        });
    }
    return lines.join ('\n');
}

export function nativeJavaNumberProvenCompare (content: string): string {
    if (!/Helpers\.(?:is(?:Greater|Less)Than(?:OrEqual)?|mathM(?:in|ax))\(/.test (content)) return content;
    const fields = javaClassFields (content.split ('\n'));
    return mapJavaMembers (content, true, (member) => numberProvenCompareMember (member, content, fields)) ?? content;
}

// Every write to this.urls in the file is the base ctor deepExtend read or an omit() result (never a ConcurrentHashMap)
function urlsIsPlainMap (content: string): boolean {
    for (const m of content.matchAll (/\bthis\.urls\s*=(?!=)\s*([^;]*);/g)) {
        const rhs = m[1].trim ();
        if (rhs === 'newUrls') {
            if (!/Map<String, Object> newUrls = this\.omit\(this\.urls, /.test (content)) return false;
        } else if (!/^\(Map<String, Object>\) this\.safeValue\(extendedProperties, "urls"\)$/.test (rhs)) return false;
    }
    return !/\bConcurrentHashMap<[^>]*>\s*\([^)]*\)[^;]*\burls\b/.test (content);
}

// The cursor is written into a list element and the element stored back at its own index
// (TS `first[k] = cursor; data[0] = first`). Inside the `cursor != null` / `size > 0` guards both helper calls are plain Map.put / List.set.
export function nativeJavaPaginationCursorPuts (content: string): string {
    if (!/\baddPaginationCursorToResult\(/.test (content)) return content;
    const lines = content.split ('\n');
    let changed = false;
    for (let from = 0; from < lines.length; from++) {
        if (!/^    public [^=;]* addPaginationCursorToResult\(/.test (lines[from])) continue;
        let to = from + 1;
        while (to < lines.length && !/^    (?:public|private|protected)\b/.test (lines[to])) to++;
        const member = lines.slice (from, to).join ('\n');
        const data = /\b(?:List<Object>|java\.util\.List<Object>|Object) (data)\b/.exec (member)?.[1];
        const lenMatch = /Integer (\w+) = (?:\(\(List<\?>\)data\)|data)\.size\(\);/.exec (member); // ral-84j7: bare data.size() on a declared List
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

export function javaPaginationCursorSelfTest (): string[] {
    const cls = (sig: string, body: string) => `public class X\n{\n    public List<Object> addPaginationCursorToResult(${sig})\n    {\n${body}\n        return data;\n    }\n}\n`;
    const guard = '        Integer dataLength = ((List<?>)data).size();\n        if (!java.util.Objects.equals(cursor, null) && (dataLength != null && dataLength > 0))\n        {\n';
    const first = '            Object first = (data == null || 0 >= ((List<?>)data).size() ? null : ((List<?>)data).get(0));\n';
    const cases: [string, string, string, string | undefined][] = [
        [ 'elem put and set', 'Map<String, Object> r', '        String cursor = this.safeString(r, "c");\n        List<Object> data = (List<Object>) this.safeList(r, "d", new ArrayList<Object>(Arrays.asList()));\n' + guard + first + '            Helpers.addElementToObject(first, "k", cursor);\n            Helpers.addElementToObject(data, 0, first);\n        }', '((Map<String, Object>)first).put("k", cursor);\n            data.set(0, first);' ],
        [ 'Object data last', 'String cursor, Object data', guard.replace ('Integer dataLength', 'Integer dataLength') + '            Helpers.addElementToObject(data, (((long) dataLength) - 1L), data);\n        }', '((List<Object>) data).set((int) (((long) dataLength) - 1L), data);' ],
        [ 'bare size on declared List (ral-84j7)', 'Map<String, Object> r', '        String cursor = this.safeString(r, "c");\n        List<Object> data = (List<Object>) this.safeList(r, "d", new ArrayList<Object>(Arrays.asList()));\n' + guard.replace ('((List<?>)data).size()', 'data.size()') + first + '            Helpers.addElementToObject(first, "k", cursor);\n            Helpers.addElementToObject(data, 0, first);\n        }', '((Map<String, Object>)first).put("k", cursor);\n            data.set(0, first);' ],
        [ 'unguarded cursor keeps helper', 'Map<String, Object> r', '        String cursor = this.safeString(r, "c");\n        List<Object> data = (List<Object>) this.safeList(r, "d", new ArrayList<Object>(Arrays.asList()));\n        Integer dataLength = ((List<?>)data).size();\n        if (dataLength != null && dataLength > 0)\n        {\n' + first + '            Helpers.addElementToObject(first, "k", cursor);\n            Helpers.addElementToObject(data, 0, first);\n        }', 'data.set(0, first)' ],
    ];
    const wrapped = cases.map (([ name, sig, body, expect ]): SnippetCase => [ name, cls (sig, body), expect ]);
    const keepsHelper = (out: string) => out.includes ('Helpers.addElementToObject(first, "k", cursor)');
    return wrapped.flatMap ((c) => runSnippetCases ([ c ], (src) => src, nativeJavaPaginationCursorPuts, (name, out) => `pagination ${name}\n${out}`, (src) => src, c[0] === 'unguarded cursor keeps helper' ? keepsHelper : () => true));
}

// Helpers.addElementToObject / GetValue / inOp / objectKeys on locals declared once per member as Map<String, Object>.
// put keeps the helper's ConcurrentHashMap null-remove semantics: a nullable value needs a provably fresh (non-concurrent) map.
export function nativeJavaMapLocalOps (content: string): string {
    if (!/Helpers\.(?:addElementToObject|GetValue|inOp|objectKeys)\(/.test (content)) return content;
    const MAP = /^(?:java\.util\.)?(?:Map|HashMap|LinkedHashMap)<String, Object>$/;
    const lines = content.split ('\n');
    const starts = [ ...javaMemberStarts (lines), lines.length ];
    let changed = false;
    for (let s = 0; s + 1 < starts.length; s++) {
        const from = starts[s];
        const to = starts[s + 1];
        // `Object x = super.parseTrade(..)` (base returns the Trade view, a Map) written once becomes a Map local
        for (let i = from; i < to; i++) {
            const decl = /^(\s*)Object ([A-Za-z_]\w*) = (super\.(?:parseTrade|parseWsTrade|parseOrder|parseWsOrder)\()(.*)\);(\s*\/\/.*)?$/.exec (lines[i]);
            if (decl === null || memberCloseParen (decl[3] + decl[4] + ')', decl[3].length - 1) !== decl[3].length + decl[4].length) continue;
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
        const declaredType = memberDeclaredTypeOf (member);
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
                const end = memberStatementEnd (member, start);
                if (end === -1) { ok = false; break; }
                const rhs = memberStripParens (member.slice (start, end).replace (/^\s*\((?:java\.util\.)?Map<String, Object>\)\s*/, ''));
                writes++;
                const call = /^this\.(extend|keysort|account)\(/.exec (rhs);
                // parseOrder/parseTrade (+ws) return the typed view (Order/Trade) over a safeOrder/safeTrade payload; TypedMap.put is a plain
                // raw.put on that LinkedHashMap/HashMap (safeTrade already puts natively into it), never a ConcurrentHashMap, so the helper's null-remove arm cannot fire.
                // Balances stays excluded: safeBalance(this.balance) wraps the shared ConcurrentHashMap
                const typedCall = /^(?:this|super)\.(parseOrder|parseWsOrder|parseTrade|parseWsTrade|safeMarketStructure)\(/.exec (rhs); // MarketInterface view over a fresh deepExtend LinkedHashMap
                const typedView = typedCall !== null && memberCloseParen (rhs, typedCall[0].length - 1) === rhs.length - 1
                    && !new RegExp (`public (?!(?:io\\.github\\.ccxt\\.types\\.)?(?:${typedCall[1] === 'safeMarketStructure' ? 'MarketInterface' : 'Order|Trade'})\\b)[\\w.<>, ?]+ ${typedCall[1]}\\(`).test (content);
                const isFresh = /^new (?:java\.util\.)?(?:Linked)?HashMap<String, Object>\(\) \{\{/.test (rhs)
                    || /^Helpers\.newMap\(/.test (rhs)
                    || typedView
                    || (call !== null && memberCloseParen (rhs, call[0].length - 1) === rhs.length - 1
                        && (call[1] !== 'extend' || (memberCallArgs (rhs, call[0].length - 1) ?? []).length === 2));
                if (!isFresh) { ok = false; break; }
            }
            // a lambda/anonymous class may write it; any non-Map cast or instanceof may change meaning
            if (new RegExp (`(?<![\\w.])${n} instanceof `).test (member)) ok = false;
            freshCache.set (n, ok && writes > 0);
            return ok && writes > 0;
        };
        const nonNull = (v: string): boolean => {
            v = memberStripParens (v);
            return /^(?:"(?:[^"\\]|\\.)*"|-?\d+(?:\.\d+)?[LD]?|true|false)$/.test (v)
                || /^new [\w.]+(?:<[\w.<>, ?]*>)?\(/.test (v)
                // primitive long arithmetic over a `for (var i` counter, or a Long whose only write is Generic.sum (never null)
                || ((c) => c !== null && declaredType (c[1]) === 'var' && new RegExp (`\\bfor \\(var ${c[1]} = \\d+;`).test (member))
                    (/^\(\(long\) ([A-Za-z_]\w*)\) [-+] \d+L$/.exec (v))
                || (/^[A-Za-z_]\w*$/.test (v) && declaredType (v) === 'Long' && soleSumWrite (v));
        };
        // `Long x = (Long) this.sum(a, b);` with no other write: the base sum boxes a long/double, never null
        const soleSumWrite = (n: string): boolean => {
            const writes = [ ...member.matchAll (new RegExp (`(?<![\\w.])${n}\\s*(?:=(?!=)|\\+=|-=|\\+\\+|--)`, 'g')) ];
            return writes.length === 1 && new RegExp (`\\bLong ${n} = \\(Long\\) this\\.sum\\([^;]*\\);`).test (member)
                && !/public [\w.<>]+ sum\(/.test (content.replace (/^[\s\S]*?\bclass \w+ extends Exchange\b/, '')) ;
        };
        const stringKey = (k: string) => /^"(?:[^"\\]|\\.)*"$/.test (k);
        for (let i = from; i < to; i++) {
            const line = lines[i];
            if (/^\s*(?:\/\/|\*)/.test (line)) continue;
            // A value spanning lines (literal-map `{{ }}` arg) on a fresh local prints a native put
            const multi = /^(\s*)Helpers\.addElementToObject\(([A-Za-z_]\w*), ("(?:[^"\\]|\\.)*"|[A-Za-z_]\w*), (?!.*\);\s*(?:\/\/.*)?$)/.exec (line);
            if (multi !== null && isMap (multi[2]) && fresh (multi[2]) && (stringKey (multi[3]) || declaredType (multi[3]) === 'String')) {
                const rest = lines.slice (i, to).join ('\n');
                const end = memberStatementEnd (rest, 0);
                const stmt = end === -1 ? '' : rest.slice (0, end + 1);
                const open = stmt.indexOf ('(');
                if (stmt !== '' && stmt.endsWith (');') && memberCloseParen (stmt, open) === stmt.length - 2 && (memberCallArgs (stmt, open) ?? []).length === 3) {
                    const value = stmt.slice (multi[0].length, -2);
                    const span = stmt.split ('\n').length;
                    lines[i] = `${multi[1]}${multi[2]}.put(${multi[3]}, ${value});`;
                    for (let k = 1; k < span; k++) lines[i + k] = '\u0000'; // dropped below; keeps member indices stable
                    changed = true;
                    i += span - 1;
                    continue;
                }
            }
            let next = line;
            next = next.replace (/^(\s*)Helpers\.addElementToObject\(([A-Za-z_]\w*), ("(?:[^"\\]|\\.)*"|[A-Za-z_]\w*|\(\(String\)[A-Za-z_]\w*\)), (.*)\);(\s*\/\/.*)?$/, (whole, ind, recv, key, value, tail) => {
                if (!isMap (recv)) return whole;
                // `((String)k)` over a String-declared name is that String; it binds only with a never-null value
                if (key.startsWith ('((String)')) return (declaredType (key.slice (9, -1)) === 'String' && nonNull (value)) ? `${ind}${recv}.put(${key}, ${value});${tail ?? ''}` : whole;
                const args = memberCallArgs (`(${key}, ${value})`, 0);
                if (args === undefined || args.length !== 2) return whole;
                if (!(fresh (recv) || nonNull (value))) return whole;
                if (stringKey (key) || declaredType (key) === 'String') return `${ind}${recv}.put(${key}, ${value});${tail ?? ''}`;
                // any other key: the helper's raw Map<Object, Object> put, on a fresh local only
                if (!fresh (recv)) return whole;
                return `${ind}((java.util.Map<Object, Object>) (java.util.Map<?, ?>) ${recv}).put(${key}, ${value});${tail ?? ''}`;
            });
            // BaseExchange Map fields: a value that is never null skips the ConcurrentHashMap null-remove branch
            next = next.replace (/^(\s*)Helpers\.addElementToObject\((this\.(?:balance|tickers|orderbooks|urls|has|features)), (.*)\);(\s*\/\/.*)?$/, (whole, ind, recv, rest, tail) => {
                const args = memberCallArgs (`(${rest})`, 0);
                if (args === undefined || args.length !== 2) return whole;
                const [ key, value ] = args.map ((a) => a.trim ());
                const v = memberStripParens (value);
                const call = v.match (/^this\.(extend|safeBalance|orderBook)\(/);
                const closed = call !== null && memberCloseParen (v, call[0].length - 1) === v.length - 1;
                const twoArgExtend = call === null || call[1] !== 'extend' || (memberCallArgs (v, call[0].length - 1) ?? []).length === 2;
                // This.urls is only ever a HashMap/LinkedHashMap (deepExtend / omit), so a null value is a plain put
                const plainUrls = recv === 'this.urls' && (stringKey (key) || declaredType (key) === 'String') && urlsIsPlainMap (content);
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
            // objectKeys snapshots under the map's monitor: only an unshared fresh local skips it
            if (next !== line) { lines[i] = next; changed = true; }
        }
    }
    return changed ? lines.filter ((l) => l !== '\u0000').join ('\n') : content;
}

// Native forms for the remaining core-arg / isEqual / isTrue sites: the Map-locals and box-locals passes re-run with `//` comments masked,
// isEqual on two integral-proven operands, isTrue on Java-boolean expressions, toMapArg on outcome() Map locals.
function splitLineComment (line: string): [string, string] {
    for (let k = 0; k < line.length; k++) {
        const c = line[k];
        if (c === '"' || c === '\'') { for (k++; k < line.length && line[k] !== c; k++) if (line[k] === '\\') k++; continue; }
        if (c === '/' && line[k + 1] === '/') return [ line.slice (0, k), line.slice (k) ];
    }
    return [ line, '' ];
}

function commentMaskedRerun (content: string): string {
    const lines = content.split ('\n');
    const split = lines.map (splitLineComment);
    if (split.every ((s) => s[1] === '')) return content;
    const masked = split.map ((s) => s[0]).join ('\n');
    const out = nativeJavaBoxLocalsCoreArgs (nativeJavaMapLocalsRetype (masked));
    if (out === masked) return content;
    const outLines = out.split ('\n');
    if (outLines.length !== lines.length) return content;
    return outLines.map ((l, i) => l + split[i][1]).join ('\n');
}

// Java expressions that are boolean by construction (`!x`, `&&`, `||`, `==`, `!=`, instanceof, boolean helpers)
function isJavaBooleanExpr (e: string): boolean {
    e = memberStripParens (e);
    if (/^(?:Helpers\.isEqual|Helpers\.isArray|java\.util\.Objects\.equals|Boolean\.TRUE\.equals)\(/.test (e)) return memberCloseParen (e, e.indexOf ('(')) === e.length - 1;
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

function remainingCoreArgsMember (member: string, content: string): string {
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
    const header = member.split ('\n', 1)[0];
    const lambdaShadow = (n: string) => new RegExp (`(?:\\(|, )${n}\\) ->|(?<![\\w.])${n} ->`).test (member);
    const isParam = (n: string) => new RegExp (`[(,] ?(?:final )?[\\w.<>, ?]+ ${n}[,)]`).test (header);
    const single = (n: string) => { const t = declTypes.get (n); return t !== undefined && t.length === 1 && !lambdaShadow (n) ? t[0] : undefined; };
    const writeOps = (n: string) => [ ...member.matchAll (new RegExp (`(?<![\\w.])${n}\\s*(=(?!=)|\\+=|-=|\\+\\+|--)`, 'g')) ];
    const writesOf = (n: string): string[] | undefined => {
        const list: string[] = [];
        for (const m of writeOps (n)) {
            if (m[1] !== '=') return undefined;
            const start = m.index + m[0].length;
            const end = memberStatementEnd (member, start);
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
    const baseTypes = boxLocalsBaseReturnTypes ();
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
        if (counter (n)) return 'p';
        return objAssumed.has (n) ? 'n' : undefined;
    };
    // undefined = not integral; true = may be null
    const exprNullable = (e: string, depth = 0): boolean | undefined => {
        e = memberStripParens (e).replace (/^\(Object\)\s*/, '');
        e = memberStripParens (e);
        if (e === 'null') return true;
        if (INT.test (e) || /^-?\d+L$/.test (e)) return false;
        if (/^[A-Za-z_]\w*$/.test (e)) { const k = nameKind (e); return k === undefined ? undefined : (k === 'L' || k === 'N'); }
        const t = memberSplitTernary (e);
        if (t !== undefined) {
            if (depth > 3) return undefined;
            const a = exprNullable (t[1], depth + 1), b = exprNullable (t[2], depth + 1);
            return a === undefined || b === undefined ? undefined : (a || b);
        }
        if (/^\(\(\(?(?:java\.util\.)?List<[\w?]+>\)\s*\(?[\w.]+\)\)?\.size\(\)$|^[A-Za-z_]\w*\.size\(\)$/.test (e)) return false;
        const arith = /^([A-Za-z_]\w*) [*+-] \d+L$/.exec (e);
        if (arith !== null) { const k = nameKind (arith[1]); return k === 'p' || k === 'L' ? false : undefined; }
        const h = /^(?:Helpers\.(getArrayLength|parseInt)|Long\.(parseLong))\(/.exec (e);
        if (h !== null && memberCloseParen (e, h[0].length - 1) === e.length - 1) return h[1] === 'parseInt'; // Long.parseLong never answers null
        const call = /^this\.(\w+)\(/.exec (e);
        if (call !== null && memberCloseParen (e, call[0].length - 1) === e.length - 1 && longCall (call[1])) return true;
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
        const e = memberStripParens (raw);
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
            const close = memberCloseParen (out, open);
            const args = close === -1 ? undefined : memberCallArgs (out, open);
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
            const e = memberStripParens (w);
            if (e === 'null') return true;
            const c = /^this\.(\w+)\(/.exec (e);
            if (c !== null && memberCloseParen (e, c[0].length - 1) === e.length - 1) return c[1] === 'outcome' && mapCall ('outcome');
            const j = /^\(this\.loadOutcome\(/.exec (e);
            return j !== null && mapCall ('loadOutcome') && e.endsWith (').join()') && memberCloseParen (e, 0) === e.length - '.join()'.length - 1
                && memberCloseParen (e, j[0].length - 1) === e.length - '.join()'.length - 2;
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

export function nativeJavaRemainingCoreArgs (content: string): string {
    const out = commentMaskedRerun (content);
    if (!/Helpers\.(?:isEqual|toMapArg)\(/.test (out)) return out;
    const parts = mapJavaMembers (out, false, (member) => remainingCoreArgsMember (member, out));
    return parts === undefined ? out : nativeJavaCoreArgIdentities (parts);
}

// Snippet checks (`--audit-string-types --self-test`)
function javaInlineDivModNegSelfTest (): string[] {
    const member = (body: string) => `    public Object m(Object p, Object d)\n    {\n${body}\n    }\n`;
    const cases: [string, string, string[]][] = [
        [ 'nested divide', '        Object r = this.f(Helpers.divide(Helpers.divide(d, 1000), 60));', [ '}).apply(((java.util.function.BinaryOperator<Object>)', '}).apply(d, 1000), 60))' ] ],
        [ 'mod guard', '        Object r = this.f(Helpers.mod(p, 1));', [ 'j37a instanceof String || j37a instanceof Long', ' % j37d.applyAsDouble(j37b); }).apply(p, 1))' ] ],
        [ 'opNeg box', '        Object r = this.g(Helpers.opNeg(p));', [ 'if (j37a instanceof Integer j37v) return -j37v;', '}).apply(p))' ] ],
        [ 'string arg kept', '        Object r = this.f(Helpers.divide(p, "a,b)"));', [ '}).apply(p, "a,b)"))' ] ],
    ];
    const problems = cases.flatMap (([ name, body, expects ]) => runSnippetCases ([ [ name, body, '' ] ], member, nativeJavaInlineDivModNeg, (n, out) => `java inline div mod neg: ${n}\n${out}`, member,
        (out) => !/Helpers\.(?:divide|mod|opNeg)\(/.test (out) && expects.every ((e) => out.includes (e))));
    const other = member ('        Object r = this.f(MyHelpers.divide(p, 1));');
    if (nativeJavaInlineDivModNeg (other) !== other) problems.push ('a foreign divide must stay');
    return problems;
}

// Every remaining Helpers.isGreaterThan/isLessThan/isGreaterThanOrEqual/isLessThanOrEqual/mathMin/mathMax
// call prints as an inline lambda that replays the helper's own dispatch (null, Integer->Long, isNumber, NaN, String, original box).
function inlineCompareLambda (helper: string, a: string, b: string): string {
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

export function nativeJavaInlineCompare (content: string): string {
    if (!/Helpers\.(?:is(?:Greater|Less)Than|mathM(?:in|ax))/.test (content)) return content;
    const re = /\bHelpers\.(isGreaterThanOrEqual|isLessThanOrEqual|isGreaterThan|isLessThan|mathMin|mathMax)\(/g;
    const lines = content.split ('\n');
    for (let i = 0; i < lines.length; i++) {
        lines[i] = rewriteHelperCalls (lines[i], re, (m, args, line) => {
            const before = line.slice (0, m.index);
            return before.includes ('//') || (before.split ('"').length - 1) % 2 === 1 ? undefined : inlineCompareLambda (m[1], args[0], args[1]);
        });
    }
    return lines.join ('\n');
}

// Snippet checks (`--audit-string-types --self-test`)
function javaInlineCompareSelfTest (): string[] {
    const cases: [string, string][] = [
        [ '        if (Helpers.isLessThan(a, Helpers.mathMax(b, 1))) {}', '(java.util.function.BiPredicate<Object, Object>)' ],
        [ '        Object x = Helpers.mathMin(limit, 1000);', '.apply(limit, 1000);' ],
        [ '        // Helpers.isLessThan(a, b)', '// Helpers.isLessThan(a, b)' ],
        [ '        if (Helpers.isLessThanOrEqual(a, 0)) {}', '(java.util.function.BiPredicate<Object, Object>)' ],
    ];
    const problems = runSnippetCases (cases.map (([ body, expect ]): SnippetCase => [ body, body, expect ]), (body) => body, nativeJavaInlineCompare, (body, out) => `java inline compare self test: ${body}\n${out}`);
    if (nativeJavaInlineCompare (cases[0][0]).includes ('Helpers.')) problems.push ('nested helper left behind');
    return problems;
}

// getArrayLength / inOp / objectKeys / newMap -> inline Java with the exact dispatch of Helpers.java; addElementToObject /
// GetValue -> native Map/List operations on receivers declared Map<String, Object> / List<Object> (fields, locals, casts).
function javaMapCacheFields (): Set<string> {
    return new Set ([ 'options', 'urls', 'has', 'features', 'api', 'exceptions', 'headers', 'commonCurrencies', 'markets_by_id', 'baseCurrencies', 'quoteCurrencies', 'transformedApi', 'userAgents' ]);
}

// end of the string / char literal or comment starting at k (index of its last char), or -1 when text[k] starts none
function containerOpsSkipLiteral (t: string, k: number): number {
    const c = t[k];
    if (c === '"' || c === '\'') {
        for (let j = k + 1; j < t.length; j++) { if (t[j] === '\\') j++; else if (t[j] === c) return j; }
        return t.length - 1;
    }
    if (c === '/' && t[k + 1] === '/') { const e = t.indexOf ('\n', k); return e === -1 ? t.length - 1 : e - 1; }
    if (c === '/' && t[k + 1] === '*') { const e = t.indexOf ('*/', k + 2); return e === -1 ? t.length - 1 : e + 1; }
    return -1;
}

function containerOpsClose (t: string, open: number): number {
    let depth = 0;
    for (let k = open; k < t.length; k++) {
        const s = containerOpsSkipLiteral (t, k);
        if (s !== -1) { k = s; continue; }
        const c = t[k];
        if (c === '(' || c === '[' || c === '{') depth++;
        else if ((c === ')' || c === ']' || c === '}') && --depth === 0) return k;
    }
    return -1;
}

// top-level comma split of t; generic argument lists (`HashMap<String, Object>`) are one token
function containerOpsSplitArgs (t: string): string[] {
    const out: string[] = [];
    let depth = 0, at = 0;
    for (let k = 0; k < t.length; k++) {
        const s = containerOpsSkipLiteral (t, k);
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

function containerOpsUnparen (e: string): string {
    e = e.trim ();
    while (e.startsWith ('(') && containerOpsClose (e, 0) === e.length - 1) e = e.slice (1, -1).trim ();
    return e;
}

// A newMap literal whose statement evaluates nothing before it (only casts, first-argument call openers and
// local/literal leading args; no field reads that the values could reorder) becomes statement-level puts on a fresh local instead of a `switch (0)` blob.
function containerOpsHoistPrefix (): RegExp {
    const pureArg = String.raw`(?:"(?:[^"\\]|\\.)*"|\d+L?|(?:\(String\))?[A-Za-z_]\w*), `;
    return new RegExp (String.raw`^[ \t]*(?:return |[\w.]+(?:<[\w.?, <>]*>)? [A-Za-z_]\w* = |[A-Za-z_]\w* = )?`
    + String.raw`(?:\((?:\(?[\w.]+(?:<[\w.?, <>]*>)?\)\s?)?|(?:this|[A-Za-z_]\w*|\(\([\w.]+(?:<[\w.?, <>]*>)?\)[A-Za-z_]\w*\))\.\w+\(|new [\w.]+(?:<[\w.?, <>]*>)?\(|`
    + pureArg + ')*$');
}
function containerOpsHoistStatement (t: string, at: number, close: number, args: string[], lineStart: number, indent: string, fresh: () => string): { text: string, end: number } | undefined {
    if (args.length === 0 || args.length % 2 !== 0 || args.some ((a, i) => i % 2 === 0 && !/^"(?:[^"\\]|\\.)*"$/.test (a))) return undefined;
    const h27 = h27J05HoistPureValues (t, at, close, args, lineStart, indent, fresh); if (h27 !== undefined) return h27;
    const h28 = h28J05HoistStatement (t, at, close, args, lineStart, indent, fresh); if (h28 !== undefined) return h28;
    const h29 = h29J05HoistStatement (t, at, close, args, lineStart, indent, fresh); if (h29 !== undefined) return h29;
    const h30 = h30J05HoistStatement (t, at, close, args, lineStart, indent, fresh); if (h30 !== undefined) return h30;
    const prefix = t.slice (lineStart, at);
    if (!containerOpsHoistPrefix ().test (prefix) || /^\s*(?:if|for|while|switch|else|case|do|try|catch|synchronized)\b/.test (prefix)) return undefined;
    const before = t.slice (0, lineStart).trimEnd ();
    if (!/[;{}]$/.test (before) || /^\s*\/\//.test (before.slice (before.lastIndexOf ('\n') + 1))) return undefined;
    const n = fresh ();
    const lines: string[] = [ `${indent}java.util.HashMap<String, Object> ${n} = new java.util.HashMap<String, Object>();` ];
    for (let i = 0; i < args.length; i += 2) lines.push (`${indent}${n}.put(${args[i]}, ${args[i + 1]});`);
    lines.push (`${prefix}${n}`);
    return { text: lines.join ('\n'), end: close + 1 };
}

function containerOpsNextNewMap (t: string, from: number): number {
    for (let k = from; k < t.length; k++) {
        const s = containerOpsSkipLiteral (t, k);
        if (s !== -1) { k = s; continue; }
        if (t.startsWith ('Helpers.newMap(', k) && !/[\w.]/.test (t[k - 1] ?? '')) return k;
    }
    return -1;
}

function containerOpsMember (member: string, fresh: () => string): string {
    const declaredType = memberDeclaredTypeOf (member, true);
    const ident = (e: string) => /^[A-Za-z_]\w*$/.test (e) && !/^(?:this|null|true|false)$/.test (e);
    const strLit = (e: string) => /^"(?:[^"\\]|\\.)*"$/.test (e);
    const numLit = (e: string) => /^\d+L?$/.test (e);
    const fieldRef = (e: string) => /^this(?:\.[A-Za-z_]\w*)+$/.test (e);
    // re-evaluating it reads the same value and runs nothing
    const pure = (e: string): boolean => {
        e = containerOpsUnparen (e);
        if (ident (e) || fieldRef (e) || strLit (e) || numLit (e)) return true;
        const cast = /^\(([\w.]+(?:<[\w.<>, ?]*>)?)\)\s*(.+)$/s.exec (e);
        return cast !== null && containerOpsClose (e, 0) === cast[1].length + 1 && pure (cast[2]);
    };
    const asObject = (e: string) => (strLit (e) ? e : `((Object)(${e}))`);
    const rewrite = (helper: string, args: string[], statement: boolean, indent: string): string | undefined => {
        // operand declared List/ArrayCache/String/Map in this member: the type's own op, null as the helper answers
        const declared = ident (args[0] ?? '') ? declaredType (args[0]) : undefined;
        const listLike = declared !== undefined && /^(?:(?:java\.util\.)?(?:List|ArrayList)<[\w.?<>, ]*>|(?:io\.github\.ccxt\.ws\.)?ArrayCache)$/.test (declared);
        const mapLike = declared !== undefined && /^(?:java\.util\.)?(?:Map|HashMap)<String, Object>$/.test (declared);
        if (helper === 'getArrayLength' && args.length === 1 && (listLike || declared === 'String')) {
            return `(${args[0]} == null ? 0 : ${args[0]}.${listLike ? 'size' : 'length'}())`;
        }
        if (helper === 'objectKeys' && args.length === 1 && mapLike) {
            return `(${args[0]} == null ? new java.util.ArrayList<Object>() : new java.util.ArrayList<Object>(${args[0]}.keySet()))`;
        }
        if (helper === 'inOp' && args.length === 2 && strLit (args[1]) && (mapLike || listLike)) {
            return `(${args[0]} != null && ${args[0]}.${mapLike ? 'containsKey' : 'contains'}(${args[1]}))`;
        }
        if (helper === 'getArrayLength' && args.length === 1) {
            const l = fresh (), s = fresh (), o = fresh ();
            return `(switch ((Object)(${args[0]})) { case null -> 0; case java.util.List<?> ${l} -> ${l}.size(); case String ${s} -> ${s}.length(); case Object ${o} -> ${o}.getClass().isArray() ? java.lang.reflect.Array.getLength(${o}) : 0; })`;
        }
        if (helper === 'objectKeys' && args.length === 1 && /^this\.(?:currencies|timeframes|requiredCredentials|events)$/.test (args[0])) {
            // declared Map<String, Object> fields (BaseExchange, PredictionExchange); Helpers.objectKeys takes no lock either
            return `(${args[0]} == null ? new java.util.ArrayList<Object>() : new java.util.ArrayList<Object>(${args[0]}.keySet()))`;
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
        // GetValue / addElementToObject -> plain native op on a proven receiver + key, else the helper call
        if (helper === 'GetValue' || helper === 'addElementToObject') return x22MapRewrite (helper, args, statement, declaredType, member);
        return undefined;
    };
    // code positions of every helper call, rewritten right-to-left so inner calls go first
    const starts: number[] = [];
    const head = /Helpers\.(?:GetValue|addElementToObject|getArrayLength|inOp|objectKeys|newMap)\(/y;
    for (let k = 0; k < member.length; k++) {
        const s = containerOpsSkipLiteral (member, k);
        if (s !== -1) { k = s; continue; }
        if (member[k] === 'H' && !/[\w.]/.test (member[k - 1] ?? '')) { head.lastIndex = k; if (head.test (member)) starts.push (k); }
    }
    let out = member;
    for (let from = 0; ;) {
        const at = containerOpsNextNewMap (out, from);
        if (at === -1) break;
        const open = at + 'Helpers.newMap'.length, close = containerOpsClose (out, open);
        const lineStart = out.lastIndexOf ('\n', at - 1) + 1;
        const hoisted = close === -1 ? undefined : containerOpsHoistStatement (out, at, close, containerOpsSplitArgs (out.slice (open + 1, close)), lineStart, /^\s*/.exec (out.slice (lineStart))![0], fresh);
        if (hoisted === undefined) { from = at + 1; continue; }
        out = out.slice (0, lineStart) + hoisted.text + out.slice (hoisted.end);
        from = lineStart;
    }
    starts.length = 0;
    for (let k = 0; k < out.length; k++) {
        const s = containerOpsSkipLiteral (out, k);
        if (s !== -1) { k = s; continue; }
        if (out[k] === 'H' && !/[\w.]/.test (out[k - 1] ?? '')) { head.lastIndex = k; if (head.test (out)) starts.push (k); }
    }
    for (let i = starts.length - 1; i >= 0; i--) {
        const at = starts[i];
        const helper = /^Helpers\.(\w+)\(/.exec (out.slice (at))![1];
        const open = at + 'Helpers.'.length + helper.length;
        const close = containerOpsClose (out, open);
        if (close === -1) continue;
        const args = containerOpsSplitArgs (out.slice (open + 1, close));
        const lineStart = out.lastIndexOf ('\n', at - 1) + 1;
        const indent = /^\s*/.exec (out.slice (lineStart))![0];
        const statement = out.slice (lineStart, at).trim () === '' && out[close + 1] === ';';
        const text = rewrite (helper, args, statement, indent);
        if (text === undefined) continue;
        out = statement && helper === 'addElementToObject' ? out.slice (0, at) + text + out.slice (close + 2) : out.slice (0, at) + text + out.slice (close + 1);
    }
    return out;
}

export function nativeJavaContainerOps (content: string): string {
    if (!/Helpers\.(?:GetValue|addElementToObject|getArrayLength|inOp|objectKeys|newMap)\(/.test (content)) return content;
    const prefix = /\bj39[a-z]\d/.test (content) ? 'j39z' : 'j39';
    let counter = 0;
    const fresh = () => `${prefix}v${++counter}`;
    const lines = content.split ('\n');
    const starts = [ 0, ...javaMemberStarts (lines, false, 1), lines.length ];
    const parts: string[] = [];
    for (let s = 0; s + 1 < starts.length; s++) parts.push (containerOpsMember (lines.slice (starts[s], starts[s + 1]).join ('\n'), fresh));
    return parts.join ('\n');
}

// Snippet checks (`--audit-string-types --self-test`)
function javaContainerOpsSelfTest (): string[] {
    const cls = (body: string) => `public class Woo extends WooApi\n{\n    public Object m(Map<String, Object> p, Object o, String s, List<Object> l)\n    {\n${body}\n    }\n}`;
    const cases: [string, string, string | undefined][] = [
        [ 'length', '        return Helpers.getArrayLength(o);', 'case java.util.List<?> j39v1 -> j39v1.size(); case String j39v2 -> j39v2.length()' ],
        [ 'keys', '        return Helpers.objectKeys(o);', 'synchronized (j39v1) { yield new java.util.ArrayList<Object>(j39v1.keySet()); }' ],
        [ 'inOp lit', '        return Helpers.inOp(o, "a");', 'j39v2.contains("a"); case java.util.Map<?, ?> j39v1 -> j39v1.containsKey("a")' ],
        [ 'inOp id', '        return Helpers.inOp(o, s);', '((Object)(s)) instanceof String && j39v1.containsKey(s)' ],
        [ 'newMap', '        return this.f(Helpers.newMap("a", o));', 'j39v1.put("a", o);\n        return this.f(j39v1);' ],
        [ 'newMap expr', '        return this.f(this.g(), Helpers.newMap("a", o));', 'switch (0) { default -> { java.util.HashMap<String, Object> j39v1 = new java.util.HashMap<String, Object>(); j39v1.put("a", o); yield j39v1; } }' ],
        [ 'newMap field recv', '        this.options.put("x", Helpers.newMap("a", o));', 'switch (0) { default -> {' ],
        [ 'newMap if', '        if (this.f(Helpers.newMap("a", o)) != null) return null;', 'if (this.f((switch (0) { default -> {' ],
        [ 'typed length', '        return Helpers.getArrayLength(l);', '(l == null ? 0 : l.size())' ],
        [ 'typed keys', '        return Helpers.objectKeys(p);', '(p == null ? new java.util.ArrayList<Object>() : new java.util.ArrayList<Object>(p.keySet()))' ],
        [ 'typed inOp', '        return Helpers.inOp(p, "a");', '(p != null && p.containsKey("a"))' ],
        [ 'typed string length', '        return Helpers.getArrayLength(s);', '(s == null ? 0 : s.length())' ],
        [ 'newMap add hoist', '        Object r = null;\n        ((List<Object>)r).add(Helpers.newMap(\"a\", o));\n        return r;', 'j39v1.put(\"a\", o);\n        ((List<Object>)r).add(j39v1);' ],
        [ 'newMap add unbraced', '        if (o != null)\n            ((List<Object>)l).add(Helpers.newMap(\"a\", o));\n        return l;', 'add((switch (0) { default -> {' ],
        [ 'newMap add in call', '        ((List<Object>)l).add(this.f(Helpers.newMap(\"a\", o)));\n        return l;', 'j39v1.put(\"a\", o);\n        ((List<Object>)l).add(this.f(j39v1));' ],
        [ 'nested', '        return Helpers.inOp(Helpers.newMap("a", Helpers.getArrayLength(o)), "a");', 'j39v1.put("a", (switch ((Object)(o))' ],
        // negatives: Object receiver put/get, impure inOp key, odd newMap, string-literal content, expression GetValue
        [ 'put Object', '        Helpers.addElementToObject(o, "a", 1);', undefined ],
        [ 'get Object', '        return Helpers.GetValue(o, "a");', undefined ],
        [ 'inOp call key', '        return Helpers.inOp(o, this.k());', undefined ],
        [ 'newMap odd', '        return Helpers.newMap("a", o, "b");', undefined ],
        [ 'newMap id key', '        return Helpers.newMap(s, o);', undefined ],
        [ 'in string', '        return "Helpers.inOp(o, s)";', undefined ],
    ];
    return runSnippetCases(cases, cls, nativeJavaContainerOps, (name, out) => `java container ops self test: ${name}\n${out}`);
}

// Core-arg / truthiness / literal-equality / literal-add helpers as inline pattern switches
// that replay the Helpers.java branches exactly (null, Integer->Long, Double, String, Float/BigDecimal).
function coreArgLiteral (raw: string): string | undefined {
    const t = raw.trim().replace(/^\((-?\d+L?)\)$/, '$1');
    if (/^-?\d{1,15}L?$/.test(t)) { return t.replace(/L$/, ''); }
    return undefined;
}

// a String literal no Double.parseDouble / BigDecimal parse accepts (Helpers.isNumber is false)
function isUnparseableNumberLiteral (lit: string): boolean {
    if (!/^"(?:[^"\\]|\\.)*"$/.test(lit) || /\\/.test(lit)) { return false; }
    return !/^\s*[+-]?(?:NaN|Infinity|0[xX][0-9a-fA-F.]*(?:[pP][+-]?\d+)?|[\d.]+(?:[eE][+-]?\d+)?)[fFdD]?\s*$/.test(lit.slice(1, -1));
}

// the literal holds a character no numeric text can contain anywhere, so any concatenation stays unparseable
function poisonsNumberAdd (lit: string): boolean {
    return /^"(?:[^"\\]|\\.)*"$/.test(lit) && /[^0-9A-Za-z.+\-\s\\]/.test(lit.slice(1, -1));
}

// nearest same-member declaration type of `name` before `pos` (params included)
function coreArgDeclType (masked: string, name: string, pos: number): string | undefined {
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

interface CoreArgHelperCtx { masked: string, pos: number, fields: Set<string>, methods: Set<string> }

function coreArgHelperRewrite (name: string, args: string[], argsM: string[], n: number, intConsts: Set<string>, ctx: CoreArgHelperCtx): string | undefined {
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
        // Native only on a proven boolean/Boolean operand, else the helper call stays
        return args.length === 1 ? nativeIsTrue(x, ctx) : undefined;
    }
    if (args.length !== 2) { return undefined; }
    const a = args[0].trim(); const b = args[1].trim();
    if (name === 'isEqual') { return nativeIsEqual(a, b, intConsts, ctx); }
    // name === 'add': only the (Object, Object) overload; a String-typed `a` binds add(String, ..)
    if (/^this\.(?:id|version)$/.test(a) && !ctx.fields.has(a.slice(5))) { return `(${a} + ${stringAddIsPrimary(argsM[1].trim()) ? b : `(${b})`})`; }
    const aOk = /^this\.(?:parseToInt|seconds|milliseconds)\(/.test(a) && stringAddClose(argsM[0].trim(), argsM[0].trim().indexOf('(')) === argsM[0].trim().length && !new RegExp(`\\bString\\s+${a.slice(5, a.indexOf('('))}\\(`).test(ctx.masked)
        || /^\(*Helpers\.(?:divide|multiply|subtract|mod|GetValue)\(/.test(a) && stringAddIsPrimary(argsM[0].trim())
        || /^\(\((?:java\.util\.function\.BinaryOperator<Object>\)|Object\) \(switch )/.test(a) && stringAddIsPrimary(argsM[0].trim())
        || /^[A-Za-z_]\w*$/.test(a) && [ 'Object', 'Long', 'Integer', 'Double', 'long' ].includes(coreArgDeclType(ctx.masked, a, ctx.pos) ?? '');
    const aT = argsM[0].trim();
    const objCall = /^this\.(implodeParams|implodeHostname|remove0xPrefix|formatNumber)\(/.exec(a);
    const aObj = aOk || stringAddIsPrimary(aT) && (
        objCall !== null && stringAddClose(aT, aT.indexOf('(')) === aT.length && !new RegExp(`\\bString\\s+${objCall[1]}\\(`).test(ctx.masked)
        || /^\w+\.this\.(?:milliseconds|seconds)\(\)$/.test(a) && !/\bString\s+(?:milliseconds|seconds)\(/.test(ctx.masked)
        || /^\(\(Map<String, Object>\)\w+\)\.get\(/.test(a) && stringAddClose(aT, aT.indexOf('.get(') + 4) === aT.length
        || /^\(\w+ == null \|\| .*\? null : \(\(List<\?>\)\w+\)\.get\(\w+\)\)$/.test(a)
        || /^\w+\.get\("\w+"\)$/.test(a) && /^(?:java\.util\.)?Map<String, ?Object>$/.test(coreArgDeclType(ctx.masked, a.slice(0, a.indexOf('.')), ctx.pos) ?? ''));
    // a String-typed `a` binds add(String, ..): a + String.valueOf(b), which is Java's own `+`
    const aStr = /^this\.intToBase16\(/.test(a) && stringAddClose(aT, aT.indexOf('(')) === aT.length && !/\b(?:Object|var|Long)\s+intToBase16\(/.test(ctx.masked)
        || /^\(\(String\)\w+\)\.(?:toLowerCase|toUpperCase|trim)\(\)$/.test(a);
    if (aStr) { return `(${a} + ${stringAddIsPrimary(argsM[1].trim()) ? b : `(${b})`})`; }
    if (!aObj) { return undefined; }
    const lit = coreArgLiteral(b);
    if (lit !== undefined) {
        return `((Object) (switch ((Object) (${a})) { case null -> (Object) null; case Long ${v} -> (Object) (${v} + ${lit}L); case Integer ${v} -> (Object) (${v}.longValue() + ${lit}L); case Double ${v} -> (Object) (${v} + ((double) ${lit}L)); case String ${v} -> (Object) (${v} + "${lit}"); default -> (Object) null; }))`;
    }
    // b is a String whose leading literal no number parse accepts, so only a Double `a` stays numeric
    const terms = stringAddPlusTerms(stringAddStripParens(b, argsM[1])[1]);
    const bStr = stringAddStripParens(b, argsM[1])[0];
    if (terms !== undefined && poisonsNumberAdd(bStr.slice(terms[0][0], terms[0][1]).trim()) && !/^"/.test(a)) {
        return `((Object) (switch ((Object) (${a})) { case null -> (Object) ("null" + (${b})); case Double ${v} -> (Object) (${v} + 0.0); case Object ${v} -> (Object) (String.valueOf(${v}) + (${b})); }))`;
    }
    const x0 = a; const y0 = b;
    return `((java.util.function.BinaryOperator<Object>) (${v}A, ${v}B) -> { Object ${v}P = ${v}A instanceof Integer ${v}i ? (Object) Long.valueOf(${v}i.longValue()) : ${v}A; Object ${v}Q = ${v}B instanceof Integer ${v}i ? (Object) Long.valueOf(${v}i.longValue()) : ${v}B; if (${v}P instanceof Long ${v}l && ${v}Q instanceof Long ${v}r) { return ${v}l + ${v}r; } if (${v}P instanceof Double || ${v}Q instanceof Double) { java.util.function.ToDoubleFunction<Object> ${v}D = ${v}o -> { if (${v}o instanceof Double || ${v}o instanceof Float || ${v}o instanceof Long || ${v}o instanceof Integer || ${v}o instanceof java.math.BigDecimal) { return ((Number) ${v}o).doubleValue(); } try { return Double.parseDouble(String.valueOf(${v}o)); } catch (NumberFormatException ${v}e) { return 0.0; } }; return ${v}D.applyAsDouble(${v}P) + ${v}D.applyAsDouble(${v}Q); } if (${v}P instanceof String || ${v}Q instanceof String) { return String.valueOf(${v}P) + String.valueOf(${v}Q); } return null; }).apply(${x0}, ${y0})`;
}

export function nativeJavaCoreArgHelpers (content: string): string {
    const re = /Helpers\.(isEqual|isTrue|toMapArg|toStringArg|toStringListArg|toLongOrNull|toString|toInt64|add)\($/;
    if (!/Helpers\.(isEqual|isTrue|toMapArg|toStringArg|toStringListArg|toLongOrNull|toString|toInt64|add)\(/.test(content)) { return content; }
    const intConsts = new Set([ 'TICK_SIZE', 'DECIMAL_PLACES', 'SIGNIFICANT_DIGITS' ]);
    for (const c of [ ...intConsts ]) { if (new RegExp(`\\b(?:int|long|Object|var|Long|Integer)\\s+${c}\\b`).test(content)) { intConsts.delete(c); } }
    const fields = new Set<string>(); const methods = new Set<string>();
    for (const d of content.matchAll(/\b(?:public|private|protected)\s+(?:static\s+)?[\w.<>?,\[\] ]+?\s+(\w+)\s*(\(|=|;)/g)) {
        (d[2] === '(' ? methods : fields).add(d[1]);
    }
    let masked = stringAddMask(content);
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
        const end = stringAddClose(masked, open);
        if (end === -1) { continue; }
        // a bare statement `Helpers.x(..);` is not a legal native expression statement
        if (/[;{}]\s*$/.test(masked.slice(Math.max(0, at - 200), at)) && /^\s*;/.test(masked.slice(end))) { continue; }
        const argsM = splitTopLevelArgs(masked.slice(open + 1, end - 1));
        const args: string[] = []; let p = open + 1;
        for (const m of argsM) { args.push(content.slice(p, p + m.length)); p += m.length + 1; }
        const repl = coreArgHelperRewrite(head[1], args, argsM, n++, intConsts, { masked, pos: at, fields, methods });
        if (repl === undefined) { continue; }
        content = content.slice(0, at) + repl + content.slice(end);
        masked = stringAddMask(content);
    }
    return content;
}

// Snippet checks (`--audit-string-types --self-test`)
function javaCoreArgHelpersSelfTest (): string[] {
    const isTrueCls = (body: string) => `public class Woo extends WooApi\n{\n    public Object m(Object p, Boolean q, boolean r)\n    {\n${body}\n    }\n}`;
    const isTrueCases: [string, string, string | undefined][] = [
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
    const cls = (body: string) => `public class Woo extends WooApi\n{\n    public Object m(Object p, String s, Long n)\n    {\n${body}\n    }\n}`;
    const cases: [string, string, string | undefined][] = [
        [ 'isEqual null', '        if (Helpers.isEqual(p, null)) {}', 'if ((((Object) (p)) == null)) {}' ],
        [ 'isEqual word', '        if (Helpers.isEqual(p, "abc")) {}', '"abc".equals(p)' ],
        [ 'isTrue Object', '        if (Helpers.isTrue(p)) {}', undefined ],
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
    const isTrue = runSnippetCases(isTrueCases, isTrueCls, nativeJavaCoreArgHelpers, (name, out) => `java is true self test: ${name}\n${out}`, isTrueCls, (out) => !out.includes ('Helpers.isTrue(') && !out.includes ('switch') && nativeJavaCoreArgHelpers (out) === out);
    return isTrue.concat(runSnippetCases(cases, cls, nativeJavaCoreArgHelpers, (name, out) => `java core arg helpers self: ${name}\n${out}`, cls, (out) => !out.includes ('Helpers.')));
}

// Truthiness. Helpers.isTrue tests null, Boolean, Long, Integer, Double, String, List, Map in
// order, so a native test is only correct on a proven boolean (`x`) or Boolean (`Boolean.TRUE.equals(x)`).
// Every other operand keeps the plain helper call; no inline pattern switch is ever emitted.
function isTrueDeclTypes (masked: string, name: string, pos: number): string[] {
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
// a function, not a const Set: the transpile entry point runs before this line is evaluated
function isMarketBoolKey (k: string): boolean {
    return [ 'active', 'spot', 'margin', 'swap', 'future', 'option', 'index', 'stock', 'prediction', 'contract', 'linear', 'inverse', 'quanto', 'percentage', 'tierBased' ].includes (k);
}
function isMarketBoolRead (e: string, ctx: CoreArgHelperCtx): boolean {
    const m = /^(?:([A-Za-z_]\w*)|\(\(Map<String, Object>\)([A-Za-z_]\w*)\))\.get\("(\w+)"\)$/.exec (e);
    if (m === null || !isMarketBoolKey (m[3])) { return false; }
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

function isTrueOperandType (e: string, ctx: CoreArgHelperCtx): 'boolean' | 'Boolean' | undefined {
    let t = e.trim();
    while (/^\(.*\)$/s.test(t) && stringAddClose(t, 0) === t.length) { t = t.slice(1, -1).trim(); }
    if (/^[A-Za-z_]\w*$/.test(t)) {
        if (ctx.fields.has(t) || /^(?:true|false|null|this)$/.test(t)) { return t === 'true' || t === 'false' ? 'boolean' : undefined; }
        const decls = isTrueDeclTypes(ctx.masked, t, ctx.pos);
        if (decls.length === 0) { return undefined; }
        if (decls.every((d) => d === 'boolean')) { return 'boolean'; }
        if (decls.every((d) => d === 'boolean' || d === 'Boolean' || d === 'java.lang.Boolean')) { return 'Boolean'; }
        return undefined;
    }
    if (isMarketBoolRead (t, ctx)) { return 'Boolean'; }
    // requireNonNullElse(<Boolean>, <boolean literal>) is a non-null Boolean
    const r = /^java\.util\.Objects\.requireNonNullElse\(([A-Za-z_]\w*), (?:true|false)\)$/.exec(t);
    if (r !== null && isTrueOperandType(r[1], ctx) !== undefined) { return 'Boolean'; }
    if (isJavaBooleanExpr(t) || isTopLevelLogic(t)) { return 'boolean'; }
    return undefined;
}

// a top-level `&&` / `||` (no top-level `?:` or assignment) is a Java boolean: both operands must be boolean
function isTopLevelLogic (e: string): boolean {
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

function nativeIsTrue (x: string, ctx: CoreArgHelperCtx): string | undefined {
    const t = isTrueOperandType(x, ctx);
    if (t === 'boolean') { return stringAddIsPrimary(x) ? x : `(${x})`; }
    if (t === 'Boolean') { return `Boolean.TRUE.equals(${x})`; }
    return undefined;
}

// Literal equality. Exactly two outcomes per Helpers.isEqual site:
// a proven operand type -> plain native `==` / `.equals`; anything else -> the helper call, untouched.
// `==` is only emitted between proven primitives (boxed `==` is reference identity, and the helper
// compares numbers across widths and handles null); `.equals` only on a non-null String receiver.
function nativeIsEqual (a: string, b: string, intConsts: Set<string>, ctx: CoreArgHelperCtx): string | undefined {
    // isEqual(x, null) is x == null for every x
    if (b === 'null') { return `(((Object) (${a})) == null)`; }
    const strLit = (t: string) => /^"(?:[^"\\]|\\.)*"$/.test(t);
    // primitive long/int/double: a declared local/param, a numeric literal, a static final int constant,
    // or a `((double) x) op ((double) y)` expression
    const prim = (t: string): boolean => /^-?\d{1,15}L?$/.test(t) || /^\(-?\d{1,15}L?\)$/.test(t)
        || intConsts.has(t)
        || /^[A-Za-z_]\w*$/.test(t) && [ 'long', 'int', 'double', 'short', 'byte' ].includes(coreArgDeclType(ctx.masked, t, ctx.pos) ?? '')
        || /^\(\(\(double\) \w+\) [-+*/%] \(\(double\) \w+\)\)$/.test(t);
    const isLit = (t: string) => /^\(?-?\d{1,15}L?\)?$/.test(t) || intConsts.has(t);
    if (prim(a) && prim(b) && !(isLit(a) && isLit(b))) { return `(${a} == ${b})`; }
    // the literal is a non-null String receiver; a number-shaped literal is equal to numbers too,
    // so it only goes native against a declared String operand
    const isStr = (t: string) => /^[A-Za-z_]\w*$/.test(t) && coreArgDeclType(ctx.masked, t, ctx.pos) === 'String';
    if (strLit(b) && !strLit(a) && (isUnparseableNumberLiteral(b) || isStr(a))) { return `${b}.equals(${a})`; }
    return undefined;
}

// Snippet checks (`--audit-string-types --self-test`)
function javaIsEqualSelfTest (): string[] {
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
    return runSnippetCases(cases, cls, nativeJavaCoreArgHelpers, (name, out) => `java is equal self test: ${name}\n${out}`, cls, (out) => !out.includes ('Helpers.') && !out.includes ('switch') && nativeJavaCoreArgHelpers (out) === out);
}

// Object locals proven String (base `: Str` producers) / Map (venue `: Dict` omit/fresh-map
// callees) print their concrete type; any unproven write or producer keeps Object
function x21SelfTest (): string[] {
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
    ];
    return probeSelfTest([ [ 'zzx21selftest', body ] ], (out, problems) => {
        if (!/String a = \(String\) this\.currencyToPrecision\(/.test(out)) problems.push("'a' (currencyToPrecision + literal write) must print String with a checkcast");
        if (!/String b = (\(String\) )?this\.parsePrecision\(/.test(out)) problems.push("'b' (parsePrecision) must print String");
        if (!/Map<String, Object> d = /.test(out)) problems.push("'d' (venue omit-of-Map-param callee) must print Map");
        if (!/Map<String, Object> e = /.test(out)) problems.push("'e' (venue omit-of-handle-element-1 callee) must print Map");
        // a venue method's proven Dict return is typed, so a local off zzxLoose is a Map too
        if (!/Map<String, Object> f = /.test(out)) problems.push("'f' (venue Dict-returning callee) must print Map");
        for (const name of [ 'c' ]) {
            if (!new RegExp(`\\bObject ${name} = `).test(out)) problems.push(`'${name}' has an unproven write/producer and must stay Object`);
        }
        if (problems.length) problems.push('output:\n' + out);
    });
}

// Helpers.GetValue / Helpers.addElementToObject inside nativeJavaContainerOps. Exactly two outcomes per site:
//   * receiver + key proven -> the plain Map/List op (`m.get(k)`, `m.put(k, v);`, `l.get(N)`), with only the null
//     guard the helper's own contract needs (GetValue answers null for a null receiver / key / out-of-range index);
//   * anything else -> the helper call, untouched; no inline pattern-match or
//     ConcurrentHashMap null-remove replay is emitted.
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
    const sig = member.split ('\n', 1)[0].replace (/\{.*$/, '');
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
        const mapRecv = (ident (t) && isMap (declaredType (t))) || (fieldMap !== null && fieldMap[1] !== 'markets_by_id' && javaMapCacheFields ().has (fieldMap[1]));
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

// Snippet checks (`--audit-string-types --self-test`)
function x22SelfTest (): string[] {
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
    return cases.flatMap ((c) => {
        const out = nativeJavaContainerOps (cls (c[1]));
        const idempotent = nativeJavaContainerOps (out) === out ? [] : [ `java selftest: ${c[0]} not idempotent` ];
        return runSnippetCases ([ c ], cls, nativeJavaContainerOps, (name, o) => `java selftest: ${name}\n${o}`, cls, (o) => !/j39|switch|synchronized/.test (o)).concat (idempotent);
    });
}


// 77j6: a base safeDict / safeList local whose default argument is a proven Map / List prints the box
function j6ReaderLocalsSelfTest (): string[] {
    const problems: string[] = [];
    const probe = path.join(process.cwd(), 'ts', 'src', `zzj6readerselftest${process.pid}.ts`);
    const body = [
        "import Exchange from './abstract/binance.js';", "import type { Dict } from './base/types.js';",
        'export default class zzj6readerselftest extends Exchange {',
        "    dictParam (ticker: Dict) { const stats = this.safeDict (ticker, 'stats', ticker); return this.safeString (stats, 'a'); }",
        "    listParam (response: Dict[]) { const rows = this.safeList (response, 'rows', response); return rows.length; }",
        "    safeDictionary () { const opts = this.safeDict (this.options, 'requestId', this.createSafeDictionary ()); return this.safeInteger (opts, 'x'); }",
        "    anyParam (ticker: any) { const inner = this.safeDict (ticker, 'stats', ticker); return this.safeString (inner, 'a'); }",
        "    joined (response: Dict[]) { const ids = this.safeList (response, 'ids', response); return ids.join (','); }",
        '}',
    ].join('\n');
    try {
        fs.writeFileSync(probe, body);
        const out = new NewTranspiler().transpiler.transpileJavaByPath(probe).content as string;
        if (!/Map<String, Object> stats = \(java\.util\.Map<String, Object>\) this\.safeDict\(/.test(out)) problems.push("j6 reader: 'stats' (Dict default) must print Map<String, Object> with a checkcast");
        if (!/List<Object> rows = \(java\.util\.List<Object>\) this\.safeList\(/.test(out)) problems.push("j6 reader: 'rows' (Dict[] default) must print List<Object> with a checkcast");
        if (!/Map<String, Object> opts = \(java\.util\.Map<String, Object>\) this\.safeDict\(/.test(out)) problems.push("j6 reader: 'opts' (createSafeDictionary default) must print Map<String, Object>");
        if (!/\bObject inner = /.test(out)) problems.push("j6 reader: 'inner' (any default) must stay Object");
        if (!/\bObject ids = /.test(out)) problems.push("j6 reader: 'ids' (.join receiver) must stay Object");
    } catch (e: any) {
        problems.push(`j6 reader self-test threw: ${e.message}`);
    } finally {
        fs.rmSync(probe, { force: true });
    }
    return problems;
}

// ral-84j1: string elements of a String-only list (Object.keys copy, ecdsa r/s) print String, and their
// String-method / delete-key / String-argument uses lose the checkcast; an any element or a list of
// unproven elements stays Object
function javaR84j1StringElementLocalsSelfTest (): string[] {
    const problems: string[] = [];
    const probe = path.join(process.cwd(), 'ts', 'src', `zzr84j1selftest${process.pid}.ts`);
    const body = [
        "import Exchange from './abstract/binance.js';",
        "import type { Dict, OrderRequest, OrderType, Ticker, Trade } from './base/types.js';", "import { ArrayCache } from './base/ws/Cache.js';", "import Client from './base/ws/Client.js';",
        'export default class zzr84j1selftest extends Exchange {',
        "    tick (t: Ticker, m: Dict) { const symbol = t['symbol']; m[(symbol as string)] = t; return m; }",
        "    keys (m: any) { const ks = Object.keys (m); const out: Dict = {}; for (let i = 0; i < ks.length; i++) { const k = ks[i]; if (k.startsWith ('x')) { delete m[k]; } out[k] = this.currency (k); } return out; }",
        "    box (m: Dict) { const rows: Dict[] = this.safeList (m, 'l', []); const out = []; for (let i = 0; i < rows.length; i++) { const row = rows[i]; row['seen'] = true; out.push (this.safeString (row, 'id')); const ro = rows[i]; out.push (this.safeString (ro, 'id')); } return out; }",
        "    resolved (m: Dict, xs: string[], f: boolean) { let syms: string[] = Object.keys (m); if (f) { syms = this.marketSymbols (xs, undefined, false); } const out: Dict = {}; for (let i = 0; i < syms.length; i++) { const sym = syms[i]; out[sym] = 1; } return out; }",
        "    sib (m: any, f: boolean) { const out: Dict = {}; if (f) { const cs = Object.keys (m); for (let i = 0; i < cs.length; i++) { const c = cs[i]; out[c] = 1; } } else { const ds = Object.keys (out); for (let i = 0; i < ds.length; i++) { const c = ds[i]; out[c] = 2; } } return out; }",
        "    lit (response: Dict) { const out: Dict = {}; const currencyIds = Object.keys (response); for (let i = 0; i < currencyIds.length; i++) { const entry = currencyIds[i]; const splitEntry = entry.split (' '); const head = splitEntry[0]; const code = this.safeCurrencyCode (head); out[code] = 1; } return out; }",
        "    sibbox (m: Dict, f: boolean) { const out: Dict = {}; if (f) { const rs: Dict[] = this.safeList (m, 'a', []); for (let i = 0; i < rs.length; i++) { const e = rs[i]; e['x'] = 1; out['a'] = e; } } else { const qs: Dict[] = this.safeList (m, 'b', []); for (let i = 0; i < qs.length; i++) { const e = qs[i]; e['y'] = 2; out['b'] = e; } } const ls: Dict[] = this.safeList (m, 'c', []); const first = ls[0]; first['z'] = 3; return out; }",
        "    unified (m: Dict, trades: Trade[], cache: ArrayCache) { const out: Dict = {}; for (let i = 0; i < trades.length; i++) { const trade = trades[i]; cache.append (trade); out[trade['id']] = 1; } return out; }",
        "    pairs (sts: string[][]) { const out = []; for (let i = 0; i < sts.length; i++) { const st = sts[i]; const sy = st[0]; out.push (sy.toUpperCase ()); } return out; }",
        "    neg (m: Dict, xs: string[]) { const vs: any[] = this.safeList (m, 'l', []); const out = []; for (let i = 0; i < vs.length; i++) { const a = vs[i]; out.push (a.length); const b = xs[i]; out.push (b.toUpperCase ()); } return out; }",
        "    asserted (m: Dict) { const out: Dict = {}; const tf = this.safeValue (m, 'tf') as string; out[tf] = 1; return tf.toUpperCase (); }",
        "    url92 (client: Client) { const url = client.url; if (url.indexOf ('v2') >= 0) { return 1; } return 0; }",
        "    zzFlags92 (bits: number, zzNames92: string[]) { const out = []; for (let i = 0; i < zzNames92.length; i++) { out.push (zzNames92[i]); } return out; }",
        "    zzFlagsCaller92 () { return this.zzFlags92 (1, [ 'a', 'b' ]); }",
        "    zzReq07 (orders: OrderRequest[]) { const out = []; for (let i = 0; i < orders.length; i++) { out.push (this.safeString (orders[i], 'symbol')); } return out; }",
        "    override async createOrders (orders: OrderRequest[], params: Dict = {}) { const r = this.zzReq07 (orders); return r; }",
        "    zzNeg07 (rows: OrderRequest[]) { return rows.length; }",
        "    zzNegCaller07 (rows: any) { return this.zzNeg07 (rows); }",
        "    rows92 (sts: string[][]) { const out = []; for (let i = 0; i < sts.length; i++) { const row = sts[i]; out.push (this.market (row[0])); out.push (row[1]); } return out; }",
        "    hex93 (hex: string) { const digits = '0123456789abcdef'; const lower93 = hex.toLowerCase (); const out = []; for (let i = 0; i < lower93.length; i++) { const ch93 = lower93[i]; out.push (digits.indexOf (ch93)); } return out; }",
        "    pclone93 (ps: Dict[], cache: ArrayCache) { for (let i = 0; i < ps.length; i++) { const pc93 = ps[i]; if (pc93['side'] === undefined) { pc93['side'] = 'long'; const sh93 = this.clone (pc93); cache.append (sh93); } cache.append (pc93); } }",
        "    ord93 (orders: OrderRequest[]) { const out = []; for (let i = 0; i < orders.length; i++) { const raw93 = orders[i]; const ot93: OrderType = raw93['type']; out.push (this.amountToPrecision (ot93, 1)); out.push (ot93.toUpperCase ()); } return out; }",
        "    async pos93 () { const fs = [ this.fetchPositions (undefined, {}), this.fetchPositions (undefined, {}) ]; const ps = await Promise.all (fs); const out = []; for (let i = 0; i < ps.length; i++) { const pp93 = ps[i]; for (let ii = 0; ii < pp93.length; ii++) { out.push (pp93[ii]); } } return out; }",
        '}',
    ].join('\n');
    try {
        fs.writeFileSync(probe, body);
        const out = new NewTranspiler().transpiler.transpileJavaByPath(probe).content as string;
        if (!/String k = \(String\) \(ks == null \|\| i < 0/.test(out)) problems.push("84j1: 'k' (Object.keys element) must print String with one checkcast");
        if (!/\bk\.startsWith\(/.test(out) || /\(\(String\)k\)/.test(out) || /\(String\)k\b/.test(out)) problems.push("84j1: 'k' uses must print with no (String) cast");
        if (!/Map<String, Object> row = \(java\.util\.Map<String, Object>\) \(rows == null/.test(out) || !/\brow\.put\("seen"/.test(out)) problems.push("84j1: 'row' (Dict element with an element write) must print Map<String, Object> and a native put");
        if (!/String symbol = \(String\) [^;]*\.get\("symbol"\)/.test(out) || /\(\(String\)symbol\)/.test(out)) problems.push("84j1: 'symbol' (Str structure field) must print String and its `as string` key no cast");
        if (!/String sym = (\(String\) )?\(syms == null/.test(out) || !/out\.put\(sym, /.test(out)) problems.push("87j1 r4 (stack-87j): 'sym' (element of a list re-bound only by Object.keys / marketSymbols, backpack fetchTickers shape) must print String with a native put key");
        if ((out.match(/String c = (\(String\) )?\((cs|ds) == null/g) || []).length !== 2 || /put\(\(String\)c,/.test(out)) problems.push("87j1 r5: both sibling 'c' bindings (const element reads of String-only lists) must print String with a native put key");
        if (!/String head = \(String\) (\(splitEntry == null \|\| 0 >= |Helpers\.GetValue\(splitEntry, 0\))/.test(out) || /safeCurrencyCode\(\(String\) \(head\)/.test(out)) problems.push("87j1 r6: 'head' (literal-index read of a split list) must print String with no core-argument cast");
        if ((out.match(/Map<String, Object> e = \(java\.util\.Map<String, Object>\) \((rs|qs) == null/g) || []).length !== 2 || /Helpers\.addElementToObject\(e,/.test(out)) problems.push("90j1 r2: both sibling 'e' bindings (const Dict[] element reads) must print Map<String, Object> with a native put");
        if (!/Map<String, Object> first = \(java\.util\.Map<String, Object>\) \(ls == null \|\| 0 >= /.test(out) || !/\bfirst\.put\("z"/.test(out)) problems.push("90j1 r2: 'first' (literal-index read of a Dict[] list) must print Map<String, Object> with a native put");
        if (!/Map<String, Object> trade = \(java\.util\.Map<String, Object>\) \(trades == null/.test(out) || !/\btrade\.get\("id"\)/.test(out)) problems.push("90j1 r3: 'trade' (element of a Trade[] list, appended to a ws cache) must print Map<String, Object> with a native get");
        if (!/String sy = \(String\) \(st == null \|\| 0 >= /.test(out) || !/\bsy\.toUpperCase\(/.test(out)) problems.push("90j1 r4: 'sy' (literal-index read of a row of an unwritten `string[][]` parameter) must print String with a native toUpperCase");
        if (!/String tf = \(\(String\)/.test(out) || !/\bout\.put\(tf, /.test(out) || !/\btf\.toUpperCase\(/.test(out)) problems.push("92j1 r2: 'tf' (a const `x as string` local) must print String with a native put key and toUpperCase");
        if (!/zzReq07\((java\.util\.)?List<\?> orders\)/.test(out)) problems.push("j07: a venue `OrderRequest[]` parameter whose caller forwards an unwritten override-async `OrderRequest[]` parameter must print List<?>");
        if (!/zzNeg07\(Object rows\)/.test(out)) problems.push("j07: a venue `OrderRequest[]` parameter with a boxed caller must stay Object");
        if (!/zzFlags92\(Object bits, (java\.util\.)?List<Object> zzNames92\)/.test(out) || !/\bi < zzNames92\.size\(\)/.test(out)) problems.push("92j1 r1: venue-only `string[]` parameter 'zzNames92' (element / length uses, literal callers) must print List<Object> with a native size");
        if (!/String url = client\.url;/.test(out) || !/\burl\.indexOf\("v2"\)/.test(out)) problems.push("92j1 r3: 'url' (ws Client url field) must print String with a native indexOf");
        if (!/List<\?> row = \(java\.util\.List<\?>\) \(sts == null/.test(out) || !/\(row == null \|\| 0 >= row\.size\(\) \? null : row\.get\(0\)\)/.test(out)) problems.push("92j1 r4: 'row' (counter row of an unwritten `string[][]` parameter) must print List<?> with native literal reads");
        if (!/String ch93 = \(String\) (\(lower93 == null|Helpers\.GetValue\(lower93, i\))/.test(out) || !/\.indexOf\(ch93\)/.test(out)) problems.push("93j1 r2: 'ch93' (counter read of a plain string local) must print String with a native indexOf argument");
        if (!/Map<String, Object> pc93 = \(java\.util\.Map<String, Object>\) /.test(out) || !/\bpc93\.put\("side", "long"\)/.test(out)) problems.push("93j1 r5: 'pc93' (Dict[] element also handed to base clone) must print Map<String, Object> with a native put");
        if (!/String ot93 = /.test(out) || !/\bot93\.toUpperCase\(/.test(out)) problems.push("93j1 r6: 'ot93' (OrderRequest type field) must print String with a native toUpperCase");
        if (!/List<\?> pp93 = \(java\.util\.List<\?>\) /.test(out) || !/\bii < pp93\.size\(\)/.test(out) || /\(\(List<\?>\)pp93\)/.test(out)) problems.push("93j1 r3: 'pp93' (array row of an awaited Promise.all list) must print List<?> with native size / get");
        if (!/String b = \(String\) \(xs == null/.test(out) || !/\bb\.toUpperCase\(/.test(out)) problems.push("90j1 r1: 'b' (element of an unwritten `string[]` parameter) must print String with a native toUpperCase");
        for (const name of [ 'a', 'ro' ]) {
            if (!new RegExp(`\\bObject ${name} = `).test(out)) problems.push(`84j1: '${name}' (unproven element or no native use) must stay Object`);
        }
        if (problems.length) problems.push('output:\n' + out);
    } catch (e: any) {
        problems.push(`84j1 self-test threw: ${e.message}`);
    } finally {
        fs.rmSync(probe, { force: true });
    }
    return problems;
}

// r84j2: element-read locals used at once as a List (push) / Map (string-key write) print the box with one checkcast
function javaR84j2ContainerLocalsSelfTest (): string[] {
    const problems: string[] = [];
    const probe = path.join(process.cwd(), 'ts', 'src', `zzr84j2selftest${process.pid}.ts`);
    const body = [
        "import Exchange from './abstract/binance.js';",
        "import type { Dict } from './base/types.js';",
        'export default class zzr84j2selftest extends Exchange {',
        "    push (m: Dict, k: string, v: any) { const a = m[k]; a.push (v); return m; }",
        "    put (m: Dict, k: string) { const b = m[k]; b['id'] = 'x'; return m; }",
        "    nul (m: Dict, k: string, v: any) { const c = m[k]; c['id'] = v; return m; }",
        "    late (m: Dict, k: string, v: any) { const d = m[k]; const e = 1; d.push (v); return e; }",
        "    arg (m: Dict, k: string, v: any) { const f = m[k]; f.push (v); return this.safeString (f, 0); }",
        '}',
    ].join('\n');
    try {
        fs.writeFileSync(probe, body);
        const out = new NewTranspiler().transpiler.transpileJavaByPath(probe).content as string;
        if (!/List<Object> a = \(java\.util\.List<Object>\) \(/.test(out) || !/\ba\.add\(v\)/.test(out)) problems.push("'a' (m[k] then a.push) must print List<Object> with a native add");
        if (!/Map<String, Object> b = \(java\.util\.Map<String, Object>\) \(/.test(out) || !/\bb\.put\("id", "x"\)/.test(out)) problems.push("'b' (m[k] then b['id'] = string) must print Map with a native put");
        for (const name of [ 'c', 'd', 'f' ]) {
            if (!new RegExp(`\\bObject ${name} = `).test(out)) problems.push(`'${name}' (nullable put value / late first use / call argument) must stay Object`);
        }
        if (problems.length) problems.push('output:\n' + out);
    } catch (e: any) {
        problems.push(`self-test threw: ${e.message}`);
    } finally {
        fs.rmSync(probe, { force: true });
    }
    return problems;
}

// r84j2 R2: List conditionals whose Object arm an Array.isArray guard or a T[] parameter proves print List<Object>
function javaR84j2GuardedListLocalsSelfTest (): string[] {
    const problems: string[] = [];
    const probe = path.join(process.cwd(), 'ts', 'src', `zzr84j2listselftest${process.pid}.ts`);
    const body = [
        "import Exchange from './abstract/binance.js';",
        "import type { Dict, Strings } from './base/types.js';",
        'export default class zzr84j2listselftest extends Exchange {',
        "    guarded (r: any) { const isArr = Array.isArray (r); const a = isArr ? r : this.safeList (r, 'data', []); let n = 0; for (let i = 0; i < 2; i++) { n = n + (a[i] === undefined ? 0 : 1); } return n; }",
        "    param (o: Strings = undefined) { const b = (o === undefined) ? [] : o; let s = ''; for (let i = 0; i < 2; i++) { s = b[i]; } return s; }",
        "    unguarded (r: any, f: boolean) { const c = f ? r : []; let n = 0; for (let i = 0; i < 2; i++) { n = n + (c[i] === undefined ? 0 : 1); } return n; }",
        "    noread (r: any) { const isArr = Array.isArray (r); const d = isArr ? r : []; return this.safeValue (d, 0); }",
        '}',
    ].join('\n');
    try {
        fs.writeFileSync(probe, body);
        const out = new NewTranspiler().transpiler.transpileJavaByPath(probe).content as string;
        if (!/List<Object> a = \(java\.util\.List<Object>\) \(/.test(out)) problems.push("'a' (isArray-guarded r : safeList) must print List<Object> with a checkcast");
        if (!/List<Object> b = \(java\.util\.List<Object>\) \(/.test(out)) problems.push("'b' ([] : Strings param) must print List<Object> with a checkcast");
        for (const name of [ 'c', 'd' ]) {
            if (!new RegExp(`\\bObject ${name} = `).test(out)) problems.push(`'${name}' (unguarded any arm / no element read) must stay Object`);
        }
        if (problems.length) problems.push('output:\n' + out);
    } catch (e: any) {
        problems.push(`self-test threw: ${e.message}`);
    } finally {
        fs.rmSync(probe, { force: true });
    }
    return problems;
}

// r84j2 R3: Map conditionals over base Map fields / Dict parameters print Map<String, Object> when a use is native
function javaR84j2MapConditionalLocalsSelfTest (): string[] {
    const problems: string[] = [];
    const probe = path.join(process.cwd(), 'ts', 'src', `zzr84j2mapselftest${process.pid}.ts`);
    const body = [
        "import Exchange from './abstract/binance.js';",
        "import type { Dict } from './base/types.js';",
        'export default class zzr84j2mapselftest extends Exchange {',
        "    keysOf (t: Dict = undefined) { const a = (t === undefined) ? this.timeframes : t; return Object.keys (a); }",
        "    argOnly (t: Dict = undefined) { const b = (t === undefined) ? this.timeframes : t; return this.safeString (b, 'x'); }",
        "    anyArm (t: any, f: boolean) { const c = f ? t : {}; return Object.keys (c); }",
        '}',
    ].join('\n');
    try {
        fs.writeFileSync(probe, body);
        const out = new NewTranspiler().transpiler.transpileJavaByPath(probe).content as string;
        if (!/Map<String, Object> a = /.test(out)) problems.push("'a' (this.timeframes : Dict param, Object.keys use) must print Map<String, Object>");
        for (const name of [ 'b', 'c' ]) {
            if (!new RegExp(`\\bObject ${name} = `).test(out)) problems.push(`'${name}' (no native use / unproven any arm) must stay Object`);
        }
        if (problems.length) problems.push('output:\n' + out);
    } catch (e: any) {
        problems.push(`self-test threw: ${e.message}`);
    } finally {
        fs.rmSync(probe, { force: true });
    }
    return problems;
}

// r84-j4: null seeds written from native String producers (literal-bound slice, toLowerCase, join) print
// String when a use hands them to a fixed String core parameter; the same writes with only Object-slot
// uses keep Object
function javaR84j4NullSeedSelfTest (): string[] {
    const problems: string[] = [];
    const probe = path.join(process.cwd(), 'ts', 'src', `zzr84j4seed${process.pid}.ts`);
    const body = [
        "import Exchange from './abstract/binance.js';",
        'export default class zzr84j4seed extends Exchange {',
        "    ids (id: string, flag: boolean) { let baseId = undefined; if (flag) { baseId = id.slice (0, 3); } else { baseId = id.toLowerCase (); } const base = this.safeCurrencyCode (baseId); return { 'base': base }; }",
        "    joined (parts: string[]) { let quoteId = undefined; quoteId = parts.join ('-'); return this.safeCurrencyCode (quoteId); }",
        "    slot (id: string) { let k = undefined; k = id.toLowerCase (); return { 'k': k }; }",
        '}',
    ].join('\n');
    try {
        fs.writeFileSync(probe, body);
        const out = new NewTranspiler().transpiler.transpileJavaByPath(probe).content as string;
        if (!/String baseId = null/.test(out) || !/safeCurrencyCode\(baseId[,)]/.test(out)) problems.push("'baseId' (slice / toLowerCase writes, String core argument) must print String with no argument cast");
        if (!/String quoteId = null/.test(out)) problems.push("'quoteId' (join write, String core argument) must print String");
        if (!/\bObject k = null/.test(out)) problems.push("'k' (only an Object-slot use) must stay Object");
        if (problems.length) problems.push('output:\n' + out);
    } catch (e: any) {
        problems.push(`self-test threw: ${e.message}`);
    } finally {
        fs.rmSync(probe, { force: true });
    }
    return problems;
}

// ral-84j6: a reader / handleOption local compared only against `true` prints `boolean x = Boolean.TRUE.equals(..)`
// and native `x` / `!x` tests; a local with any other use or a write keeps Object
function j84j6TrueOnlyLocalsSelfTest (): string[] {
    const problems: string[] = [];
    const probe = path.join(process.cwd(), 'ts', 'src', `zz84j6selftest${process.pid}.ts`);
    const body = [
        "import Exchange from './abstract/binance.js';", "import type { Strings } from './base/types.js';",
        `export default class zz84j6selftest${process.pid} extends Exchange {`,
        "    pos (params = {}) { const qq = this.handleOption ('createOrder', 'quoteOrderQty', true); const ff = this.safeValue (params, 'f'); const r = {}; if (qq === true) { r['x'] = 1; } if (true !== ff) { r['y'] = 1; } return r; }",
        "    def (params = {}) { const dd = this.safeValue (params, 'd'); const r = {}; if (dd !== undefined) { r['x'] = 1; } if (undefined === dd) { r['y'] = 1; } const mm = this.safeValue (params, 'm'); if (mm === undefined || mm === true) { r['z'] = 1; } return r; }",
        "    ann (params = {}) { const aa: boolean = this.handleOption ('watchPositions', 'fetchPositionsSnapshot', true); const md: any[] = this.safeValue (params, 'md'); const r = {}; if (aa === true) { r['x'] = 1; } if (md !== undefined) { r['y'] = 1; } return r; }",
        "    sl (params = {}) { const r = {}; const ss: Strings = this.safeList2 (params, 'a', 'b'); if (ss !== undefined) { r['s'] = ss.join (','); } const bb: Strings = this.safeList (params, 'c', []); if (bb !== undefined) { r['b'] = bb.join (','); } return r; }",
        "    neg (params = {}) { const nn = this.handleOption ('createOrder', 'x', false); let ww = this.handleOption ('createOrder', 'w', false); const r = {}; if (nn === true) { r['n'] = nn; } if (ww === true) { ww = false; } return [ r, ww ]; }",
        '}',
    ].join('\n');
    try {
        fs.writeFileSync(probe, body);
        const out = new NewTranspiler().transpiler.transpileJavaByPath(probe).content as string;
        if (!/boolean qq = Boolean\.TRUE\.equals\(this\.handleOption\(/.test(out) || !/if \(qq\)/.test(out)) problems.push("ral-84j6: 'qq' (handleOption compared only to true) must print boolean with a native test");
        if (!/boolean ff = Boolean\.TRUE\.equals\(this\.safeValue\(/.test(out) || !/if \(!ff\)/.test(out)) problems.push("ral-84j6: 'ff' (`true !== ff`) must print boolean with a native negated test");
        if (!/boolean dd = \(this\.safeValue\(parameters, "d"\)\) != null;/.test(out) || !/if \(dd\)/.test(out) || !/if \(!dd\)/.test(out)) problems.push("ral-84j6: 'dd' (compared only to undefined) must print `boolean dd = (..) != null` with native tests");
        if (!/\bObject mm = /.test(out)) problems.push("ral-84j6: 'mm' mixes an undefined and a true compare and must stay Object");
        if (!/boolean aa = Boolean\.TRUE\.equals\(this\.handleOption\(/.test(out) || !/if \(aa\)/.test(out)) problems.push("ral-84j6: 'aa' (a `boolean`-annotated handleOption result compared only to true) must print boolean");
        if (!/\bObject md = /.test(out)) problems.push("ral-84j6: 'md' (a list-annotated local) must stay Object");
        if (!/java\.util\.List<String> ss = \(java\.util\.List<String>\) this\.safeList2\(/.test(out) || !/String\.join\(",", ss\)/.test(out)) problems.push("ral-84j6: 'ss' (Strings reader, nullish tests + join) must print List<String> with a cast-free String.join");
        if (!/\bObject bb = /.test(out)) problems.push("ral-84j6: 'bb' (non-null list default) must stay Object");
        if (!/\bObject nn = /.test(out)) problems.push("ral-84j6: 'nn' has a value use and must stay Object");
        if (!/\bObject ww = /.test(out)) problems.push("ral-84j6: 'ww' is written and must stay Object");
    } catch (e: any) {
        problems.push(`ral-84j6 self-test threw: ${e.message}`);
    } finally {
        fs.rmSync(probe, { force: true });
    }
    return problems;
}

// 84j8: balance-map literals merged into themselves and per-binding Object.keys lists
function javaR84j8LocalsSelfTest (): string[] {
    const problems: string[] = [];
    const probe = path.join(process.cwd(), 'ts', 'src', `zzr84j8selftest${process.pid}.ts`);
    const body = [
        "import Exchange from './abstract/binance.js';",
        "import type { Dict, Int } from './base/types.js';",
        'export default class zzr84j8selftest extends Exchange {',
        "    bal (response: any, code: string) { let result: Dict = { 'info': response }; result[code] = this.account (); result = this.mergeBalanceAccount (result, code, this.account ()); return this.safeBalance (result); }",
        "    other (response: any, code: string, x: Dict) { let r: Dict = { 'info': response }; r = this.mergeBalanceAccount (x, code, this.account ()); return r; }",
        "    later (response: any, stock: boolean) { let xs: Dict[] = []; if (stock) { const rows = this.safeList (response, 'rows', []); xs = rows; } return xs.length; }",
        "    laterBad (response: any, stock: boolean) { let ys: Dict[] = []; if (stock) { const rows = this.safeValue (response, 'rows'); ys = rows; } return ys.length; }",
        "    asserted (s: string) { let zs: any[] = []; const parsed = this.parseJson (s); if (parsed !== undefined) { zs = parsed as any[]; } return zs.length; }",
        "    until (since: Int = undefined, params = {}) { let request: Dict = {}; if (since !== undefined) { request['startTime'] = since; } let paramsUntil: Dict = {}; [ request, paramsUntil ] = this.handleUntilOption ('endTime', request, params); if (since === undefined) { request = this.omit (request, 'count'); } request['x'] = 1; return this.extend (request, paramsUntil); }",
        "    splitJoin (s: string, v: string) { const parts = s.split ('-'); let more = v.split (','); const w: string = more.join (''); more = w.split (' '); return parts.join ('') + this.safeString (more, 0); }",
        "    keys2 (a: Dict, b: Dict, f: boolean) { if (f) { const keys = Object.keys (a); throw new Error ('one of ' + keys.join (', ')); } else { const keys = Object.keys (b); throw new Error ('one of ' + keys.join (', ')); } }",
        '}',
    ].join('\n');
    try {
        fs.writeFileSync(probe, body);
        const out = new NewTranspiler().transpiler.transpileJavaByPath(probe).content as string;
        if (!/Map<String, Object> result = /.test(out)) problems.push("'result' (self-merged balance literal) must print Map<String, Object>");
        if (!/result = \(java\.util\.Map<String, Object>\) this\.mergeBalanceAccount\(result, /.test(out)) problems.push("'result' merge write needs one checkcast and a bare Map argument");
        if (!/\bObject r = /.test(out)) problems.push("'r' (merge of a foreign map) must stay Object");
        if ((out.match(/List<String> keys = new java\.util\.ArrayList<String>\(/g) ?? []).length !== 2) problems.push("both sibling 'keys' bindings must print List<String>");
        // (the `.size()` read goes native in the file post-pass, which this raw printer probe does not run)
        if (!/List<Object> xs = /.test(out) || !/\bxs = rows;/.test(out)) problems.push("'xs' (copy of a later safeList const) must print List<Object> and copy rows without a cast");
        if (!/List<Object> zs = /.test(out) || !/\bzs = \(java\.util\.List<Object>\)\(parsed\);/.test(out)) problems.push("'zs' (as any[] write) must print List<Object> with only the assertion's own cast");
        if (!/Map<String, Object> request = /.test(out)) problems.push("'request' (handleUntilOption Pair slot 0) must print Map<String, Object>");
        if (!/List<String> parts = new java\.util\.ArrayList<String>\(/.test(out) || !/String\.join\("", parts\)/.test(out)) problems.push("'parts' (native split joined) must print List<String> and join without a checkcast");
        if (!/List<String> more = /.test(out) || !/more = new java\.util\.ArrayList<String>\(/.test(out)) problems.push("'more' (split write) must print List<String> with a List<String> write");
        if (!/\bObject ys = /.test(out)) problems.push("'ys' (copy of a safeValue const) must stay Object");
        if (/\(java\.util\.List<String>\)keys\)/.test(out) || !/String\.join\(", ", keys\)/.test(out)) problems.push("'keys' join must read the declared List<String> without a checkcast");
        if (problems.length) problems.push('output:\n' + out);
    } catch (e: any) {
        problems.push(`self-test threw: ${e.message}`);
    } finally {
        fs.rmSync(probe, { force: true });
    }
    return problems;
}

// ral-87j2 R1: a ws order-book side read off a WsOrderBook local, and a guarded ws cache read, print the
// hand-written ws class with one checkcast and a native store / append; a side with no store keeps Object
function javaR87j2WsLocalsSelfTest (): string[] {
    const problems: string[] = [];
    const probe = path.join(process.cwd(), 'ts', 'src', 'pro', `zzr87j2ws${process.pid}.ts`);
    const body = [
        "import binanceRest from '../binance.js';",
        "import { ArrayCache } from '../base/ws/Cache.js';",
        `export default class zzr87j2ws${process.pid} extends binanceRest {`,
        "    sides (symbol: string, bid: boolean, price: number, amount: number) { const orderbook = this.safeValue (this.orderbooks, symbol); const s = bid ? orderbook['bids'] : orderbook['asks']; s.store (price, amount); const t = orderbook['asks']; return t; }",
        "    cache (symbol: string, trade: any) { let arr = (symbol === undefined) ? undefined : this.safeValue (this.trades, symbol); if (arr === undefined) { arr = new ArrayCache (10); } arr.append (trade); return arr; }",
        '}',
    ].join('\n');
    try {
        fs.writeFileSync(probe, body);
        const out = new NewTranspiler().transpiler.transpileJavaByPath(probe).content as string;
        if (!/io\.github\.ccxt\.ws\.OrderBookSide s = \(io\.github\.ccxt\.ws\.OrderBookSide\) /.test(out) || !/\bs\.store\(price, amount\)/.test(out)) problems.push("ral-87j2: 's' (WsOrderBook bids/asks conditional, store use) must print OrderBookSide with a native store");
        if (!/io\.github\.ccxt\.ws\.ArrayCache arr = \(io\.github\.ccxt\.ws\.ArrayCache\) /.test(out) || !/\barr\.append\(trade\)/.test(out)) problems.push("ral-87j2: 'arr' (guarded this.trades read, append use) must print ArrayCache with a native append");
        if (!/\bObject t = /.test(out)) problems.push("ral-87j2: 't' (no store use) must stay Object");
        if (problems.length) problems.push('output:\n' + out);
    } catch (e) {
        problems.push(`self-test threw: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
        fs.rmSync(probe, { force: true });
    }
    return problems;
}

// ral-87j2 R3: an Array.isArray-guarded List conditional whose only native use is `x.length` prints List<Object>
// with a native size(); the same local with only call-argument uses keeps Object
function javaR87j2LengthListLocalsSelfTest (): string[] {
    const problems: string[] = [];
    const probe = path.join(process.cwd(), 'ts', 'src', `zzr87j2len${process.pid}.ts`);
    const body = [
        "import Exchange from './abstract/binance.js';",
        `export default class zzr87j2len${process.pid} extends Exchange {`,
        "    rowsOf (response: any) { const isArr = Array.isArray (response); const rows = isArr ? response : this.safeList (response, 'data', []); const out = []; for (let i = 0; i < rows.length; i++) { out.push (this.safeDict (rows, i)); } return out; }",
        "    argOnly (response: any) { const isArr = Array.isArray (response); const other = isArr ? response : this.safeList (response, 'data', []); return this.safeDict (other, 0); }",
        '}',
    ].join('\n');
    try {
        fs.writeFileSync(probe, body);
        const out = new NewTranspiler().transpiler.transpileJavaByPath(probe).content as string;
        if (!/List<Object> rows = \(java\.util\.List<Object>\) /.test(out) || !/< rows\.size\(\)/.test(out)) problems.push("ral-87j2: 'rows' (isArray-guarded, .length use) must print List<Object> with a native size()");
        if (!/\bObject other = /.test(out)) problems.push("ral-87j2: 'other' (only a safe* argument) must stay Object");
        if (problems.length) problems.push('output:\n' + out);
    } catch (e) {
        problems.push(`self-test threw: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
        fs.rmSync(probe, { force: true });
    }
    return problems;
}

// ral-87j2 R4: a conditional of describe() urls string leaves handed to a String core parameter prints String with
// one checkcast and a bare argument; the same conditional with a non-string leaf keeps Object
function javaR87j2UrlLocalsSelfTest (): string[] {
    const problems: string[] = [];
    const probe = path.join(process.cwd(), 'ts', 'src', `zzr87j2url${process.pid}.ts`);
    const body = [
        "import Exchange from './abstract/binance.js';",
        `export default class zzr87j2url${process.pid} extends Exchange {`,
        "    describe () { return this.deepExtend (super.describe (), { 'urls': { 'api': { 'ws': { 'spot': 'wss://a', 'swap': 'wss://b', 'odd': { 'x': 1 } } } } }); }",
        "    open (u: string) { return u.length; }",
        "    pick (isSpot: boolean) { const url = isSpot ? this.urls['api']['ws']['spot'] : this.urls['api']['ws']['swap']; return this.open (url); }",
        "    odd (isSpot: boolean) { const other = isSpot ? this.urls['api']['ws']['spot'] : this.urls['api']['ws']['odd']; return this.open (other); }",
        '}',
    ].join('\n');
    try {
        fs.writeFileSync(probe, body);
        const out = new NewTranspiler().transpiler.transpileJavaByPath(probe).content as string;
        if (!/String url = \(String\) /.test(out)) problems.push("ral-87j2: 'url' (urls string leaves, String slot use) must print String");
        if (!/this\.open\(url\)/.test(out) || /this\.open\(\(String\) ?\(?url\)?\)/.test(out)) problems.push("ral-87j2 R4: 'url' must reach the String parameter as a bare `this.open(url)` (no checkcast)");
        if (!/\bObject other = /.test(out)) problems.push("ral-87j2: 'other' (a non-string urls leaf) must stay Object");
        if (problems.length) problems.push('output:\n' + out);
    } catch (e) {
        problems.push(`self-test threw: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
        fs.rmSync(probe, { force: true });
    }
    return problems;
}

// r87-j4: a null seed written from a literal-index read of a const native split prints String (the split
// local goes List<String>) when it reaches a String core parameter; a seed with only Object-slot uses stays Object
function javaR87j4SplitSeedSelfTest (): string[] {
    const problems: string[] = [];
    const probe = path.join(process.cwd(), 'ts', 'src', `zzr87j4seed${process.pid}.ts`);
    const body = [
        "import Exchange from './abstract/binance.js';", "import Precise from './base/Precise.js';", "import type { Str } from './base/types.js';",
        'export default class zzr87j4seed extends Exchange {',
        "    one (s: string) { let currencyId = undefined; const currencyParts = s.split ('-'); currencyId = currencyParts[0]; return this.safeCurrencyCode (currencyId); }",
        "    obj (s: string) { let k = undefined; const ps = s.split ('-'); k = ps[0]; return { 'k': k }; }",
        "    cost (a: string, p: string, params = {}) { const c = this.safeString (params, 'c'); let orderCost: Str = undefined; if (c !== undefined) { orderCost = c; } else { const q = Precise.stringMul (a, p); orderCost = q; } if (c === 'x') { const q = Precise.stringAdd (a, p); return q; } return this.getAmount2 (orderCost); }",
        "    getAmount2 (x: string) { return x; }",
        '}',
    ].join('\n');
    try {
        fs.writeFileSync(probe, body);
        const out = new NewTranspiler().transpiler.transpileJavaByPath(probe).content as string;
        if (!/String currencyId = null/.test(out) || !/safeCurrencyCode\(currencyId[,)]/.test(out)) problems.push("r87-j4: 'currencyId' (split element write, String core argument) must print String with no argument cast");
        if (!/java\.util\.List<String> currencyParts = /.test(out)) problems.push("r87-j4: 'currencyParts' must print List<String>");
        if (!/\bObject k = null/.test(out)) problems.push("r87-j4: 'k' (only an Object-slot use) must stay Object");
        if (!/String orderCost = null/.test(out) || !/getAmount2\(orderCost\)/.test(out)) problems.push("r87-j4 R2: 'orderCost' (copy of a later-declared Precise const, String core argument) must print String");
        if (problems.length) problems.push('output:\n' + out);
    } catch (e) {
        problems.push(`r87-j4 self-test threw: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
        fs.rmSync(probe, { force: true });
    }
    return problems;
}

// 90j4: null seeds written from a typed handle*AndParams Pair slot, native String uses (ws tier, where
// the earlier sections leave such a seed Object)
function javaR90j4NullSeedSelfTest (): string[] {
    const problems: string[] = [];
    const probe = path.join(process.cwd(), 'ts', 'src', 'pro', `zzr90j4seed${process.pid}.ts`);
    const body = [
        "import Exchange from '../binance.js';", "import type { Str, Dict, Trade } from '../base/types.js';",
        'export default class zzr90j4seed extends Exchange {',
        "    async a1 (flag: boolean, params: Dict = {}) { let subType: Str = undefined; let paramsSubType: Dict = {}; if (flag) { subType = 'linear'; } else { const [ marketType, paramsMarketType ] = this.handleMarketTypeAndParams ('a1', undefined, params); [ subType, paramsSubType ] = this.handleOptionStringAndParams (paramsMarketType, 'a1', 'subType', subType); } return await this.ws2 ('c', subType, paramsSubType); }",
        "    async a3 (flag: boolean, params: Dict = {}) { let k = undefined; let p2: Dict = {}; if (flag) { k = params['k']; } else { [ k, p2 ] = this.handleOptionStringAndParams (params, 'a3', 'k'); } return await this.ws2 ('c', k, p2); }",
        "    async ws2 (c: string, s: string, params: Dict = {}) { return [ c, s, params ]; }",
        "    h3 (raw: Dict, flag: boolean) { let parsed = undefined; if (flag) { parsed = this.parseWsTrade (raw); } else { parsed = this.parseTrade (raw); } const symbol = parsed['symbol']; return symbol; }",
        "    h4 (raw: Dict, flag: boolean) { let parsed = undefined; if (flag) { parsed = this.parseWsTrade (raw); } else { parsed = this.parseTrade (raw); } return [ parsed ]; }",
        "    parseWsTrade (trade: Dict, market = undefined): Trade { return this.parseTrade (trade, market); }",
        '}',
    ].join('\n');
    try {
        fs.writeFileSync(probe, body);
        const out = new NewTranspiler().transpiler.transpileJavaByPath(probe).content as string;
        if (!/String subType = null/.test(out) || !/ws2\("c", subType, /.test(out) || /toStringArg\(subType\)/.test(out)) problems.push("r90-j4: 'subType' (literal + Pair slot 0 writes, String core argument) must print String with no argument cast");
        if (!/\bObject k = null/.test(out)) problems.push("r90-j4: 'k' (an unproven element-read write beside the Pair slot) must stay Object");
        if (!/Map<String, Object> parsed = null;[^]*?String symbol = \(String\) parsed\.get\("symbol"\)/.test(out)) problems.push("r90-j4 R2: 'parsed' (Trade core writes, string-key read) must print Map<String, Object> with an uncast get");
        if (!/public Object h4\([^]*?\bObject parsed = null/.test(out)) problems.push("r90-j4 R2: 'parsed' with no native use must stay Object");
        if (problems.length) problems.push('output:\n' + out);
    } catch (e) {
        problems.push(`r90-j4 self-test threw: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
        fs.rmSync(probe, { force: true });
    }
    return problems;
}

// 87j8: String accumulators whose pushed String locals are declared after the list
function javaR87j8LocalsSelfTest (): string[] {
    const problems: string[] = [];
    const probe = path.join(process.cwd(), 'ts', 'src', `zzr87j8selftest${process.pid}.ts`);
    const body = [
        "import Exchange from './abstract/binance.js';",
        "import type { Dict } from './base/types.js';",
        'export default class zzr87j8selftest extends Exchange {',
        "    acc (rows: Dict[]) { const out = []; for (let i = 0; i < rows.length; i++) { const a = this.safeString (rows[i], 'a', ''); const b = this.safeString (rows[i], 'b', ''); out.push (a + ': ' + b); } return out.join (', '); }",
        "    twice (rows: Dict[], a: string, b: string) { let k: string = a.toLowerCase (); k = k + b; const keys = []; for (let i = 0; i < rows.length; i++) { let k: string = a.toLowerCase (); k = k + b; keys.push (k); } return keys.join (','); }",
        "    sliced (order: Dict) { const code = this.safeString (order, 'b'); let base = code; if ((base !== undefined) && base.startsWith ('EQ_')) { base = base.slice (3); } return this.safeCurrencyCode (base); }",
        "    chunks (rows: Dict[]) { const ids: string[] = []; for (let i = 0; i < rows.length; i++) { ids.push (this.safeString (rows[i], 'id', '')); } let chunk: string[] = []; const out = []; for (let i = 0; i < ids.length; i++) { chunk.push (ids[i]); const chunkLength = chunk.length; if (chunkLength >= 10) { out.push (chunk.join (',')); chunk = []; } } return out; }",
        "    gen2Id (market: Dict): string { return this.safeString (market, 'baseId', '') + '-' + this.safeString (market, 'quoteId', ''); }",
        "    viaInternal (rows: Dict[]) { const ids = []; for (let i = 0; i < rows.length; i++) { ids.push (this.gen2Id (rows[i])); } return ids.join (','); }",
        "    accAny (rows: Dict[]) { const bad = []; for (let i = 0; i < rows.length; i++) { const v = rows[i]['v']; bad.push (v); } return bad.join (','); }",
        '}',
    ].join('\n');
    try {
        fs.writeFileSync(probe, body);
        const out = new NewTranspiler().transpiler.transpileJavaByPath(probe).content as string;
        if (!/List<String> out = new java\.util\.ArrayList<String>\(/.test(out) || !/\bout\.add\(/.test(out)) problems.push("'out' (pushes of a String concat of later String locals) must print List<String> with a bare add");
        if (!/\bObject bad = /.test(out)) problems.push("'bad' (push of an Object element read) must stay Object");
        if (!/\bString base = code;/.test(out)) problems.push("'base' (String copy written from a native literal slice of itself) must print String");
        if (/\(String\) \(base\)/.test(out)) problems.push("'base' must reach the String core argument without a checkcast");
        if (!/List<String> chunk = new java\.util\.ArrayList<String>\(/.test(out) || !/\bchunk\.add\(/.test(out)) problems.push("'chunk' (reassigned list fed by reads of a List<String> local) must print List<String> with a bare add");
        if (!/public String gen2Id\(/.test(out) || !/List<String> ids = new java\.util\.ArrayList<String>\(java\.util\.Arrays\.asList\(\)\);\s*for[^]*?ids\.add\(this\.gen2Id\(/.test(out)) problems.push("'ids' (pushes of an internal method the printer declares String) must print List<String> with a bare add");
        if (!/\bObject keys = /.test(out)) problems.push("'keys' (push of a local with a same-named sibling binding) must stay Object");
        if (problems.length) problems.push('output:\n' + out);
    } catch (e) {
        problems.push(`self-test threw: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
        fs.rmSync(probe, { force: true });
    }
    return problems;
}

// ral-90j2 R1: an element-read List local is decided per checker binding, so a same-named sibling never refuses it
function javaR90j2ElementListLocalsSelfTest (): string[] {
    const problems: string[] = [];
    const probe = path.join(process.cwd(), 'ts', 'src', `zzr90j2el${process.pid}.ts`);
    const body = [
        "import Exchange from './abstract/binance.js';",
        "import type { Dict } from './base/types.js';",
        `export default class zzr90j2el${process.pid} extends Exchange {`,
        "    twice (m: Dict, keys: string[], v: any) { for (let i = 0; i < keys.length; i++) { const g = m[keys[i]]; g.push (v); m[keys[i]] = g; } let n = 0; for (let i = 0; i < keys.length; i++) { const g = m[keys[i]] as any[]; n = n + g.length; } return n; }",
        "    argOnly (m: Dict, k: string) { const h = m[k] as any[]; return this.safeDict (h, 0); }",
        '}',
    ].join('\n');
    try {
        fs.writeFileSync(probe, body);
        const out = new NewTranspiler().transpiler.transpileJavaByPath(probe).content as string;
        if (!/List<Object> g = \(java\.util\.List<Object>\) \(/.test(out) || !/\bg\.add\(v\)/.test(out)) problems.push("ral-90j2 R1: the first 'g' (m[k] then g.push) must print List<Object> with a native add");
        if (!/List<Object> g = \(java\.util\.List<Object>\)\(/.test(out) || !/g\.size\(\)/.test(out)) problems.push("ral-90j2 R1: the second 'g' (m[k] as any[] then g.length) must print List<Object> with a native size()");
        if (!/\bObject h = /.test(out)) problems.push("ral-90j2 R1: 'h' (only a safe* argument) must stay Object");
        if (problems.length) problems.push('output:\n' + out);
    } catch (e) {
        problems.push(`self-test threw: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
        fs.rmSync(probe, { force: true });
    }
    return problems;
}

// ral-90j2 R2: `await Promise.all (xs)` in two sibling branches: each binding read by `.length` prints List<Object>
function javaR90j2PromiseAllLocalsSelfTest (): string[] {
    const problems: string[] = [];
    const probe = path.join(process.cwd(), 'ts', 'src', `zzr90j2pa${process.pid}.ts`);
    const body = [
        "import Exchange from './abstract/binance.js';",
        `export default class zzr90j2pa${process.pid} extends Exchange {`,
        "    async both (f: boolean, ps: any[]) { if (f) { const rs = await Promise.all (ps); const n = rs.length; return n; } else { const rs = await Promise.all (ps); return this.safeDict (rs, 0); } }",
        '}',
    ].join('\n');
    try {
        fs.writeFileSync(probe, body);
        const out = new NewTranspiler().transpiler.transpileJavaByPath(probe).content as string;
        if (!/List<Object> rs = /.test(out) || !/= rs\.size\(\)/.test(out)) problems.push("ral-90j2 R2: the first 'rs' (.length use) must print List<Object> with a native size()");
        if (!/\bObject rs = /.test(out)) problems.push("ral-90j2 R2: the second 'rs' (only a safe* argument) must stay Object");
        if (problems.length) problems.push('output:\n' + out);
    } catch (e) {
        problems.push(`self-test threw: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
        fs.rmSync(probe, { force: true });
    }
    return problems;
}

// ral-90j2 R3: an element-read Map-structure local read by a literal key in the next statement prints Map with one checkcast
function javaR90j2ElementMapLocalsSelfTest (): string[] {
    const problems: string[] = [];
    const probe = path.join(process.cwd(), 'ts', 'src', `zzr90j2em${process.pid}.ts`);
    const body = [
        "import Exchange from './abstract/binance.js';",
        "import type { Ticker } from './base/types.js';",
        `export default class zzr90j2em${process.pid} extends Exchange {`,
        "    read (ts: Record<string, Ticker>, s: string) { const t = ts[s]; return this.parseTicker (t['info']); }",
        "    argOnly (ts: Record<string, Ticker>, s: string) { const u = ts[s]; return this.parseTicker (u); }",
        '}',
    ].join('\n');
    try {
        fs.writeFileSync(probe, body);
        const out = new NewTranspiler().transpiler.transpileJavaByPath(probe).content as string;
        if (!/Map<String, Object> t = \(java\.util\.Map<String, Object>\) \(/.test(out) || !/\bt\.get\("info"\)/.test(out)) problems.push("ral-90j2 R3: 't' (ts[s] then t['info']) must print Map with a native get");
        if (!/\bObject u = /.test(out)) problems.push("ral-90j2 R3: 'u' (only a call argument) must stay Object");
        if (problems.length) problems.push('output:\n' + out);
    } catch (e) {
        problems.push(`self-test threw: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
        fs.rmSync(probe, { force: true });
    }
    return problems;
}

// ral-90j2 R4: an element-read Map-structure local handed first to a Map<String, Object> core slot prints Map, and the argument binds bare
function javaR90j2ElementMapSlotSelfTest (): string[] {
    const problems: string[] = [];
    const probe = path.join(process.cwd(), 'ts', 'src', `zzr90j2ms${process.pid}.ts`);
    const body = [
        "import Exchange from './abstract/binance.js';",
        "import type { Dict, Market } from './base/types.js';",
        `export default class zzr90j2ms${process.pid} extends Exchange {`,
        "    slot (rs: Record<string, Dict>, id: string, market: Market) { const p = rs[id]; return this.parsePosition (p, market); }",
        '}',
    ].join('\n');
    try {
        fs.writeFileSync(probe, body);
        const out = new NewTranspiler().transpiler.transpileJavaByPath(probe).content as string;
        if (!/Map<String, Object> p = \(java\.util\.Map<String, Object>\) \(/.test(out) || !/parsePosition\(p, /.test(out)) problems.push("ral-90j2 R4: 'p' (rs[id] handed to parsePosition's Map slot) must print Map and bind bare");
        if (problems.length) problems.push('output:\n' + out);
    } catch (e) {
        problems.push(`self-test threw: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
        fs.rmSync(probe, { force: true });
    }
    return problems;
}

// ral-90j6: reader results with native uses: R1 safeList* used by length/join -> List<String>; R2 `as string[]`
// safeList read by length/index -> List<String>; R4 safeList* re-written from a const list literal -> List<Object>. Written / value-used locals keep Object.
function javaR90j6ReaderLocalsSelfTest (): string[] {
    const problems: string[] = [];
    const probe = path.join(process.cwd(), 'ts', 'src', `zz90j6selftest${process.pid}.ts`);
    const body = [
        "import Exchange from './abstract/binance.js';",
        `export default class zz90j6selftest${process.pid} extends Exchange {`,
        "    r1 (params = {}) { const tt = this.safeList (params, 'tags', []); const r = {}; if (tt.length > 0) { r['t'] = tt.join (','); } return r; }",
        "    r2 (params = {}) { const ok: string[] = this.safeList (params, 'success', []) as string[]; const r = []; for (let i = 0; i < ok.length; i++) { r.push (ok[i]); } return r; }",
        "    r4 (params = {}) { let ll = this.safeList (params, 'list', []); const acc = []; for (let i = 0; i < ll.length; i++) { acc.push (ll[i]); } ll = acc; return ll; }",
        "    neg (params = {}) { let ww = this.safeList (params, 'w', []); if (ww.length > 0) { ww = this.safeValue (params, 'x'); } return ww.join (','); }",
        '}',
    ].join('\n');
    try {
        fs.writeFileSync(probe, body);
        const out = new NewTranspiler().transpiler.transpileJavaByPath(probe).content as string;
        if (!/java\.util\.List<String> tt = \(java\.util\.List<String>\) this\.safeList\(/.test(out) || !/tt\.size\(\) > 0/.test(out) || !/String\.join\(",", tt\)/.test(out)) problems.push("ral-90j6 R1: 'tt' (safeList read by length + join) must print List<String> with native size()/String.join");
        if (!/java\.util\.List<String> ok = \(java\.util\.List<String>\)\(this\.safeList\(/.test(out) || !/i < ok\.size\(\)/.test(out)) problems.push("ral-90j6 R2: 'ok' (as string[] reader read by length/index) must print List<String> with a native size()");
        if (!/java\.util\.List<Object> ll = \(java\.util\.List<Object>\) this\.safeList\(/.test(out) || !/i < ll\.size\(\)/.test(out)) problems.push("ral-90j6 R4: 'll' (safeList re-written from a const list) must print List<Object> with a native size()");
        if (!/\bObject ww = /.test(out)) problems.push("ral-90j6: 'ww' (re-written from safeValue) must stay Object");
    } catch (e) {
        problems.push(`ral-90j6 self-test threw: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
        fs.rmSync(probe, { force: true });
    }
    return problems;
}

// 90j8: lane rules for copies / omit results / literals
function javaR90j8LocalsSelfTest (): string[] {
    const problems: string[] = [];
    const probe = path.join(process.cwd(), 'ts', 'src', `zzr90j8selftest${process.pid}.ts`);
    const body = [
        "import Exchange from './abstract/binance.js';",
        "import type { Dict } from './base/types.js';",
        'export default class zzr90j8selftest extends Exchange {',
        "    async zzr90j8Pages (params: Dict = {}): Promise<Dict[]> {",
        "        const out: Dict[] = [];",
        "        out.push (params);",
        "        return out;",
        "    }",
        "    async zzr90j8Raw (params: Dict = {}): Promise<Dict[]> {",
        "        const response = await this.publicGetPing (params);",
        "        return response;",
        "    }",
        "    strs (rows: number[]) { const parsed: string[] = []; for (let i = 0; i < rows.length; i++) { const id = this.safeString (rows, i, ''); const sid = id.toString (); parsed.push (sid); } return parsed.join (','); }",
        "    ids (symbols: string[]) { const out: string[] = []; for (let i = 0; i < symbols.length; i++) { const market = this.market (symbols[i]); const marketId = market['id']; out.push (marketId); } return out.join (','); }",
        "    async zzr90j8Use (q: string, params: Dict = {}) { let rows: Dict[] = []; if (q !== undefined) { rows = await this.zzr90j8Pages (params); } let raw: Dict[] = []; raw = await this.zzr90j8Raw (params); return [ rows.length, raw ]; }",
        "    sign (path: string, api: string[] = [ 'public' ], method: string = 'GET', params: Dict = {}): Dict { const headers = undefined; const body = undefined; const query = this.omit (params, this.extractParams (path)); const n = Object.keys (query).length; let url = '/' + path; if (n > 0) { url += '?' + this.urlencode (query); } const later = this.omit (params, 'a'); if (method === 'GET') { url += Object.keys (later).length; } return { 'url': url, 'method': method, 'body': body, 'headers': headers }; }",
        '}',
    ].join('\n');
    try {
        fs.writeFileSync(probe, body);
        resetJavaVenueIndexes();
        const out = new NewTranspiler().transpiler.transpileJavaByPath(probe).content as string;
        if (!/Map<String, Object> query = \(java\.util\.Map<String, Object>\) this\.omit\(/.test(out) || !/\bquery\.size\(\)/.test(out)) problems.push("'query' (omit of an Object param whose first use is Object.keys) must print a Map with a native size()");
        if (!/\bObject later = /.test(out)) problems.push("'later' (first use under an if) must stay Object");
        if (!/List<Object> rows = /.test(out) || !/\brows\.size\(\)/.test(out)) problems.push("'rows' (let x: Dict[] = [] written from a fresh-list Promise<Dict[]> venue method) must print List<Object> with a native size()");
        if (!/List<String> out = new java\.util\.ArrayList<String>\(/.test(out) || !/\bout\.add\(marketId\)/.test(out)) problems.push("'out' (pushes of a market['id'] structure-key String local) must print List<String> with a bare add");
        if (!/List<String> parsed = new java\.util\.ArrayList<String>\(/.test(out) || !/\bparsed\.add\(sid\)/.test(out)) problems.push("'parsed' (pushes of a const x.toString () local) must print List<String> with a bare add");
        if (!/\bObject raw = /.test(out)) problems.push("'raw' (written from a venue method that returns an awaited response) must stay Object");
        if (problems.length) problems.push('output:\n' + out);
    } catch (e) {
        problems.push(`self-test threw: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
        fs.rmSync(probe, { force: true });
    }
    return problems;
}

// 92j2 R1: a read-only `marketType: MarketType` slot of the base parse* family prints String,
// so its `x === undefined ? 'swap' : x` local and the safeMarket hand-off print native
function javaR92j2MarketTypeParamsSelfTest (): string[] {
    const problems: string[] = [];
    const probe = path.join(process.cwd(), 'ts', 'src', `zzr92j2mt${process.pid}.ts`);
    const body = [
        "import Exchange from './abstract/binance.js';",
        "import type { MarketType, Strings, Str, Leverages } from './base/types.js';",
        `export default class zzr92j2mt${process.pid} extends Exchange {`,
        "    parseLeverages (response: object[], symbols: Strings = undefined, symbolKey: Str = undefined, marketType: MarketType | undefined = undefined): Leverages {",
        "        const leverageStructures = {};",
        "        const marketTypeResolved: MarketType = (marketType === undefined) ? 'swap' : marketType;",
        "        for (let i = 0; i < response.length; i++) {",
        "            const info = response[i];",
        "            const market = this.safeMarket (this.safeString (info, symbolKey), undefined, undefined, marketTypeResolved);",
        "            leverageStructures[market['symbol']] = this.parseLeverage (info, market);",
        "        }",
        "        return leverageStructures as Leverages;",
        "    }",
        '}',
    ].join('\n');
    try {
        fs.writeFileSync(probe, body);
        const out = new NewTranspiler().transpiler.transpileJavaByPath(probe).content as string;
        if (!/parseLeverages\(Object response, (java\.util\.)?List<String> symbols, String symbolKey, String marketType\)/.test(out)) problems.push("92j2 R1: the MarketType slot of parseLeverages must print String");
        if (!/\bString marketTypeResolved = /.test(out)) problems.push("92j2 R1: 'marketTypeResolved' must print String");
        if (!/this\.safeMarket\([^;]*, marketTypeResolved\)/.test(out)) problems.push("92j2 R1: 'marketTypeResolved' must reach safeMarket bare");
        if (problems.length) problems.push('output:\n' + out);
    } catch (e) {
        problems.push(`self-test threw: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
        fs.rmSync(probe, { force: true });
    }
    return problems;
}

// 92j2 R2: a conditional / element-read local handed once, in the next statement, to a fixed
// Map parameter takes the slot's checkcast on its declaration and passes bare
function javaR92j2SlotHandOffSelfTest (): string[] {
    const problems: string[] = [];
    const probe = path.join(process.cwd(), 'ts', 'src', `zzr92j2so${process.pid}.ts`);
    const body = [
        "import Exchange from './abstract/binance.js';",
        "import type { Dict, Balances } from './base/types.js';",
        `export default class zzr92j2so${process.pid} extends Exchange {`,
        "    zzBal (response: Dict): Balances { return this.safeBalance (response); }",
        "    async a (params: Dict = {}) { const response = await this.publicGetPing (params); const balanceResponse = (response === undefined) ? {} : response; const r = this.zzBal (balanceResponse); return r; }",
        "    b (groups: Dict, k: string) { const g = groups[k]; const r = this.zzBal (g); return r; }",
        "    async d (params: Dict = {}) { const response = await this.publicGetPing (params); const later = (response === undefined) ? {} : response; const x = 1; return this.zzBal (later); }",
        '}',
    ].join('\n');
    try {
        fs.writeFileSync(probe, body);
        const out = new NewTranspiler().transpiler.transpileJavaByPath(probe).content as string;
        if (!/Map<String, Object> balanceResponse = \(java\.util\.Map<String, Object>\) \(/.test(out) || !/this\.zzBal\(balanceResponse\)/.test(out)) problems.push("92j2 R2: 'balanceResponse' (conditional handed to a Dict slot next) must print Map and pass bare");
        if (!/Map<String, Object> g = \(java\.util\.Map<String, Object>\) \(/.test(out) || !/this\.zzBal\(g\)/.test(out)) problems.push("92j2 R2: 'g' (element read handed to a Dict slot next) must print Map and pass bare");
        if (!/\bObject later = /.test(out)) problems.push("92j2 R2: 'later' (hand-off not in the next statement) must stay Object");
        if (problems.length) problems.push('output:\n' + out);
    } catch (e) {
        problems.push(`self-test threw: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
        fs.rmSync(probe, { force: true });
    }
    return problems;
}

// 92j2 R3: an element-read Map local whose later literal-key writes the printer already prints as Map puts
function javaR92j2ElementMapWritesSelfTest (): string[] {
    const problems: string[] = [];
    const probe = path.join(process.cwd(), 'ts', 'src', `zzr92j2mw${process.pid}.ts`);
    const body = [
        "import Exchange from './abstract/binance.js';",
        "import type { Dict } from './base/types.js';",
        `export default class zzr92j2mw${process.pid} extends Exchange {`,
        "    fees (rows: Dict[], code: string) { const all: Dict = {}; for (let i = 0; i < rows.length; i++) { const entry = rows[i]; const fee: Dict = all[code]; const info = fee['info']; info.push (entry); const result: Dict = { 'fee': this.safeNumber (entry, 'f') }; fee['withdraw'] = result; } return all; }",
        '}',
    ].join('\n');
    try {
        fs.writeFileSync(probe, body);
        const out = new NewTranspiler().transpiler.transpileJavaByPath(probe).content as string;
        if (!/Map<String, Object> fee = \(java\.util\.Map<String, Object>\) \(/.test(out) || !/\bfee\.put\("withdraw", result\)/.test(out)) problems.push("92j2 R3: 'fee' (element read, literal-key read next, Map put later) must print Map with a native put");
        if (problems.length) problems.push('output:\n' + out);
    } catch (e) {
        problems.push(`self-test threw: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
        fs.rmSync(probe, { force: true });
    }
    return problems;
}

// 92j2 R4: a Str conditional whose every use is a printed String slot takes that slot's conversion once
function javaR92j2StringSlotLocalsSelfTest (): string[] {
    const problems: string[] = [];
    const probe = path.join(process.cwd(), 'ts', 'src', `zzr92j2ss${process.pid}.ts`);
    const body = [
        "import Exchange from './abstract/binance.js';",
        "import type { Currency, Dict, Market, Str, Int } from './base/types.js';",
        `export default class zzr92j2ss${process.pid} extends Exchange {`,
        "    zzFixed (s: Str, n: Int) { return [ s, n ]; }",
        "    a (rows: Dict[], currency: Currency = undefined) { const code = (currency !== undefined) ? currency['code'] : undefined; return this.filterByCurrencySinceLimit (rows, code, undefined, undefined); }",
        "    b (market: Market = undefined) { const sym = (market !== undefined) ? market['symbol'] : undefined; return this.zzFixed (sym, 1); }",
        "    c (rows: Dict[], currency: Currency = undefined) { const both = (currency !== undefined) ? currency['code'] : undefined; this.zzFixed (both, 1); return this.filterByCurrencySinceLimit (rows, both, undefined, undefined); }",
        '}',
    ].join('\n');
    try {
        fs.writeFileSync(probe, body);
        const out = new NewTranspiler().transpiler.transpileJavaByPath(probe).content as string;
        if (!/String code = java\.util\.Objects\.toString\(/.test(out) || !/filterByCurrencySinceLimit\(rows, code,/.test(out)) problems.push("92j2 R4: 'code' (only a defaulted core String slot) must print String and pass bare");
        if (!/String sym = \(String\) \(/.test(out) || !/this\.zzFixed\(sym,/.test(out)) problems.push("92j2 R4: 'sym' (only a fixed String slot) must print String and pass bare");
        if (!/\bObject both = /.test(out)) problems.push("92j2 R4: 'both' (core and fixed slots) must stay Object");
        if (problems.length) problems.push('output:\n' + out);
    } catch (e) {
        problems.push(`self-test threw: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
        fs.rmSync(probe, { force: true });
    }
    return problems;
}

// a read-only array conditional / element read takes one List<?> checkcast and reads natively; a literal
// index only (tuple cast kept) stays Object
function javaR93j2ListLocalsSelfTest (): string[] {
    const problems: string[] = [];
    const probe = path.join(process.cwd(), 'ts', 'src', `zzr93j2ls${process.pid}.ts`);
    const body = [
        "import Exchange from './abstract/binance.js';",
        "import type { Dict } from './base/types.js';",
        `export default class zzr93j2ls${process.pid} extends Exchange {`,
        "    a (chart: Dict) {",
        "        const list = this.safeList (chart, 'prices', this.safeValue (chart, 'data'));",
        "        const points: Dict[] = (list !== undefined) ? list : [];",
        "        let n = 0;",
        "        for (let i = 0; i < points.length; i++) { n = n + this.safeInteger (points[i], 'x', 0); }",
        "        return n;",
        "    }",
        "    b (grouped: Dict, k: string) {",
        "        const rows: Dict[] = (k !== undefined) ? this.safeList (grouped, k, this.safeValue (grouped, 'z')) : undefined;",
        "        return this.safeString (rows[0], 'id');",
        "    }",
        '}',
    ].join('\n');
    try {
        fs.writeFileSync(probe, body);
        const out = new NewTranspiler().transpiler.transpileJavaByPath(probe).content as string;
        if (!/List<\?> points = \((java\.util\.)?List<\?>\) \(/.test(out) || !/i < points\.size\(\)/.test(out)) problems.push("93j2 R1: 'points' (array conditional read by length / index) must print List<?> and read natively");
        if (!/\bObject rows = /.test(out)) problems.push("93j2 R1: 'rows' (literal index only) must stay Object");
        if (problems.length) problems.push('output:\n' + out);
    } catch (e) {
        problems.push(`self-test threw: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
        fs.rmSync(probe, { force: true });
    }
    return problems;
}

// null seeds handed to a typed core slot: a Map seed written from a later `this.market (..)` const reaches a Map
// parameter, and two String seeds written from each other reach String parameters, with no argument checkcast
function javaR92j4NullSeedConsumerSelfTest (): string[] {
    const problems: string[] = [];
    const probe = path.join(process.cwd(), 'ts', 'src', 'pro', `zzr92j4seed${process.pid}.ts`);
    const body = [
        "import Exchange from '../nado.js';", "import type { Str, Strings, Dict, Market } from '../base/types.js';",
        `export default class zzr92j4seed${process.pid} extends Exchange {`,
        "    async wp (t: string, market: Market, h: string, params: Dict = {}) { return [ t, market, h, params ]; }",
        "    async sp (c: Str, h: Str, params: Dict = {}) { return [ c, h, params ]; }",
        "    async m1 (symbols: Strings = undefined, params: Dict = {}) {",
        "        const symbolsNormalized: Strings = this.marketSymbols (symbols, undefined, true, true, true);",
        "        let market: Market = undefined;",
        "        let messageHash = 'ticker';",
        "        if (symbolsNormalized !== undefined) {",
        "            const symbolMarket = this.market (symbolsNormalized[0]);",
        "            market = symbolMarket;",
        "            messageHash = 'ticker:' + this.safeString (symbolMarket, 'symbol', '');",
        "        }",
        "        const ticker = await this.wp ('x', market, messageHash, params);",
        "        return ticker;",
        "    }",
        "    async m2 (f: boolean, mode: string) {",
        "        let hash: Str = undefined;",
        "        let channel: Str = undefined;",
        "        if (f) { channel = 'acc.' + mode; hash = channel; } else { hash = 'account'; channel = hash; }",
        "        return await this.sp (channel, hash);",
        "    }",
        "    async m4 (f: boolean, a: string, b: string) { let url: Str = undefined; if (f) { url = a.toLowerCase (); } else { url = b.trim (); } return await this.watch (url as string, 'h'); }",
        "    exp (parts: string[], f: boolean) { let expiry = undefined; if (f) { expiry = this.safeString (parts, 1); } else { expiry = this.convertMarketIdExpireDate (this.safeString (parts, 1)); } return this.convertExpireDate (expiry); }",
        "    bal (sym: string, parts: string[], f: boolean) { let baseId = undefined; if (f) { baseId = this.safeString (parts, 0); } else { const baseLength = sym.length - 3; if (baseLength > 0) { baseId = sym.slice (0, baseLength); } } return this.safeCurrencyCode (baseId); }",
        "    async m3 (f: boolean, raw: Dict) { let other: Str = undefined; let mixed: Str = undefined; if (f) { other = 'a'; mixed = other; } else { mixed = raw['k']; } return await this.sp (mixed, other); }",
        '}',
    ].join('\n');
    try {
        fs.writeFileSync(probe, body);
        const out = new NewTranspiler().transpiler.transpileJavaByPath(probe).content as string;
        if (!/Map<String, Object> market = null/.test(out) || !/this\.wp\("x", market, messageHash, /.test(out)) problems.push("r92-j4: 'market' (written from a later market() const, passed to a Map slot) must print Map with a bare argument");
        if (!/String hash = null/.test(out) || !/String channel = null/.test(out) || !/this\.sp\(channel, hash/.test(out)) problems.push("r92-j4: 'hash' / 'channel' (String writes of each other, String slots) must print String with bare arguments");
        if (!/String url = null/.test(out) || !/this\.watch\(url, /.test(out)) problems.push("r92-j4: 'url' (String writes, `url as string` into watch) must print String with the identity cast dropped");
        if (!/String expiry = null/.test(out) || !/this\.convertExpireDate\(expiry\)/.test(out)) problems.push("r92-j4: 'expiry' (safeString / convertMarketIdExpireDate writes, String slot) must print String with a bare argument");
        if (!/String baseId = null/.test(out) || !/this\.safeCurrencyCode\(baseId, /.test(out)) problems.push("r92-j4: 'baseId' (safeString / integral-bound slice writes, String slot) must print String with a bare argument");
        if (!/\bObject mixed = null/.test(out)) problems.push("r92-j4: 'mixed' (one Object element write) must stay Object");
        if (problems.length) problems.push('output:\n' + out);
    } catch (e) {
        problems.push(`self-test threw: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
        fs.rmSync(probe, { force: true });
    }
    return problems;
}

// venue list fetchers: `let x: List = []` targets and fetchers returning another proven fetcher's awaited result
function javaR92j8LocalsSelfTest (): string[] {
    const problems: string[] = [];
    const probe = path.join(process.cwd(), 'ts', 'src', `zzr92j8selftest${process.pid}.ts`);
    const body = [
        "import Exchange from './abstract/binance.js';",
        "import type { Dict, List } from './base/types.js';",
        'export default class zzr92j8selftest extends Exchange {',
        "    async zzr92j8Inner (params: Dict = {}): Promise<Dict[]> {",
        "        const out: Dict[] = [];",
        "        out.push (params);",
        "        return out;",
        "    }",
        "    async zzr92j8Outer (params: Dict = {}): Promise<Dict[]> {",
        "        return await this.zzr92j8Inner (params);",
        "    }",
        "    async zzr92j8Leaf (params: Dict = {}): Promise<Dict[]> { const res: Dict[] = []; res.push (params); return res; }",
        "    async zzr92j8Load (params: Dict = {}): Promise<Dict[]> { return await this.zzr92j8Leaf (params); }",
        "    omitPerBinding (a: Dict, flag: boolean) { if (flag) { let tickers = [ 1 ]; tickers = [ 2 ]; return tickers; } const data = this.safeDict (a, 'data', {}); const tickers = this.omit (data, 'date'); return Object.keys (tickers).length; }",
        "    signedCopy (params: Dict, post: boolean) { const sorted: Dict = this.keysort (this.omit (params, 'a')); let signed: Dict = sorted; if (post) { signed = this.keysort (sorted); } return Object.keys (signed).length; }",
        "    async zzr92j8Use (q: string, params: Dict = {}) { const first = await this.zzr92j8Inner (params); let rows: List = []; if (q !== undefined) { rows = await this.zzr92j8Outer (params); } return [ first.length, rows.length ]; }",
        '}',
    ].join('\n');
    try {
        fs.writeFileSync(probe, body);
        resetJavaVenueIndexes();
        const out = new NewTranspiler().transpiler.transpileJavaByPath(probe).content as string;
        if (!/List<Object> rows = /.test(out) || !/\brows\.size\(\)/.test(out)) problems.push("'rows' (let x: List = [] written from a list fetcher) must print List<Object> with a native size()");
        if (!/private List<Object> zzr92j8LeafCore\(/.test(out)) problems.push("'zzr92j8Leaf' (a list fetcher returned only by `return await` from a Promise<Dict[]> method) must print a List<Object> core");
        if (!/Map<String, Object> signed = sorted;/.test(out) || !/\bsigned\.size\(\)/.test(out)) problems.push("'signed' (copy of a keysort Map local, published as Map<String,Object>) must print Map<String, Object> with a native size()");
        if (!/Map<String, Object> tickers = this\.omit\(/.test(out)) problems.push("'tickers' (omit of a Map, a same-named sibling binding written elsewhere) must print Map<String, Object>");
        if (problems.length) problems.push('output:\n' + out);
    } catch (e) {
        problems.push(`self-test threw: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
        fs.rmSync(probe, { force: true });
    }
    return problems;
}

function javaR93j8LocalsSelfTest (): string[] {
    const problems: string[] = [];
    const probe = path.join(process.cwd(), 'ts', 'src', `zzr93j8selftest${process.pid}.ts`);
    const body = [
        "import Exchange from './abstract/binance.js';",
        "import type { Dict, Str } from './base/types.js';",
        'export default class zzr93j8selftest extends Exchange {',
        "    chunked (symbols: string[]) {",
        "        const tickers: string[] = [];",
        "        for (let i = 0; i < symbols.length; i++) {",
        "            const s = symbols[i];",
        "            let base: Str = s;",
        "            if (s.endsWith ('-NO')) {",
        "                base = s.slice (0, -3);",
        "            }",
        "            tickers.push (base);",
        "        }",
        "        const n = tickers.length;",
        "        let chunk: string[] = [];",
        "        const out: Dict[] = [];",
        "        for (let ti = 0; ti < n; ti++) {",
        "            chunk.push (tickers[ti]);",
        "            const chunkLength = chunk.length;",
        "            if (chunkLength < 10) {",
        "                continue;",
        "            }",
        "            out.push ({ 'tickers': chunk.join (',') });",
        "            chunk = [];",
        "        }",
        "        return out;",
        "    }",
        "    pushedIds (symbols: string[]) {",
        "        const ids: string[] = [];",
        "        for (let i = 0; i < symbols.length; i++) {",
        "            const id = this.market (symbols[i])['id'] as string;",
        "            ids.push (id);",
        "        }",
        "        return ids.join (',');",
        "    }",
        "    tail (ids: string[]) {",
        "        const first = this.safeString (ids, 0, '');",
        "        const n = first.length;",
        "        let suffix = first;",
        "        if (n > 6) {",
        "            suffix = first.slice (n - 6);",
        "        }",
        "        return suffix.toUpperCase ();",
        "    }",
        "    keyedAll (symbols: string[]) {",
        "        let all: string[] = Object.keys (this.markets as Dict);",
        "        if (symbols !== undefined) {",
        "            all = this.marketSymbols (symbols);",
        "        }",
        "        return all.length;",
        "    }",
        "    keyed (symbols: string[], byId: Dict) {",
        "        let ids: string[] = [];",
        "        if (symbols.length === 0) {",
        "            const m: Dict = this.safeDict (byId, 'a', {});",
        "            ids = Object.keys (m);",
        "        } else {",
        "            ids = this.marketIds (symbols);",
        "        }",
        "        const out: Dict = {};",
        "        for (let i = 0; i < ids.length; i++) {",
        "            out[ids[i]] = true;",
        "        }",
        "        return out;",
        "    }",
        '}',
    ].join('\n');
    try {
        fs.writeFileSync(probe, body);
        resetJavaVenueIndexes();
        const out = new NewTranspiler().transpiler.transpileJavaByPath(probe).content as string;
        if (!/List<String> ids = /.test(out) || !/ids = new java\.util\.ArrayList<String>\(m\.keySet\(\)\);/.test(out) || !/\bids\.size\(\)/.test(out)) problems.push("'ids' (String list written from Object.keys of a Map local and marketIds) must print List<String> with a native size()");
        if (!/List<String> ids = new java\.util\.ArrayList<String>/.test(out) || !/String id = /.test(out) || !/\bids\.add\(id\)/.test(out)) problems.push("'ids' / 'id' (String list fed by an `as string` local) must print List<String> / String with a native add");
        if (!/String suffix = first;/.test(out) || !/suffix\.toUpperCase\(\)/.test(out)) problems.push("'suffix' (String copy written by a non-literal slice) must print String with a native toUpperCase()");
        if (!/List<String> all = new java\.util\.ArrayList<String>\(\(\(java\.util\.Map<String, Object>\)this\.markets\)\.keySet\(\)\);/.test(out) || !/\ball\.size\(\)/.test(out)) problems.push("'all' (String list from Object.keys (this.markets as Dict) and marketSymbols) must print List<String> with a native size()");
        if (!/List<String> chunk = /.test(out) || !/\bchunk\.size\(\)/.test(out)) problems.push("'chunk' (String list fed by elements of a list of String copy locals) must print List<String> with a native size()");
        if (problems.length) problems.push('output:\n' + out);
    } catch (e) {
        problems.push(`self-test threw: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
        fs.rmSync(probe, { force: true });
    }
    return problems;
}

// ws handler dispatch: `Helpers.callDynamically(this, m, new Object[] {args})` where every write of `m` is null, a
// handler-name literal or a read of a local name table becomes a `switch` of direct calls (table retyped String).
// Each name has one declaration in the class (reflection picks it too); missing args are padded like padArgs.
function nativeJavaWsHandlerDispatch (content: string): string {
    const esc = (s: string) => s.replace (/[.*+?^${}()|[\]\\]/g, '\\$&');
    const sigs = new Map<string, string[][]> ();
    const splitTop = (text: string) => {
        const out: string[] = [];
        let depth = 0, cur = '';
        for (const c of text) {
            depth += c === '<' || c === '(' ? 1 : c === '>' || c === ')' ? -1 : 0;
            if (c === ',' && depth === 0) { out.push (cur.trim ()); cur = ''; } else { cur += c; }
        }
        return cur.trim () ? [ ...out, cur.trim () ] : out;
    };
    for (const m of content.matchAll (/^ {4}public [\w.<>, ]+? (\w+)\(([^)]*)\)\s*$/gm)) {
        sigs.set (m[1], [ ...(sigs.get (m[1]) ?? []), splitTop (m[2]).map ((p) => p.replace (/\s+\w+$/, '')) ]);
    }
    const norm = (t: string) => t.replace (/java\.util\./g, '').replace (/\s+/g, ' ');
    const edits: { from: number, to: number, text: string }[] = [];
    const masked = content.replace (/^[ \t]*\/\/.*$/gm, (c) => ' '.repeat (c.length));
    const seen = new Set<number> ();
    const callRe = /^([ \t]+)Helpers\.callDynamically\(this, (\w+), new Object\[\] \{([\w, ]*)\}\);$/gm;
    let call;
    while ((call = callRe.exec (content)) !== null) {
        const [ , indent, v, argText ] = call;
        // scope: the block declaring the dispatch local (a method can hold two `method` locals)
        const declAt = content.lastIndexOf (`Object ${v} = `, call.index);
        let start = declAt, depth = 0;
        for (; start > 0 && depth >= 0; start--) depth += content[start - 1] === '}' ? 1 : content[start - 1] === '{' ? -1 : 0;
        let end = start + 1;
        for (depth = 1; end < content.length && depth > 0; end++) depth += content[end] === '{' ? 1 : content[end] === '}' ? -1 : 0;
        if (declAt < 0 || content.lastIndexOf ('\n    public ', call.index) > declAt || end <= call.index || seen.has (declAt)) continue;
        seen.add (declAt);
        const body = masked.slice (start, end);
        const memberFrom = content.lastIndexOf ('\n    public ', call.index);
        const memberTo = content.indexOf ('\n    }\n', call.index);
        const method = content.slice (memberFrom, call.index);
        const member = masked.slice (memberFrom, memberTo);
        // every dispatch through this local, all with the same argument list
        const sites = [ ...body.matchAll (new RegExp (`^([ \\t]+)Helpers\\.callDynamically\\(this, ${v}, new Object\\[\\] \\{([\\w, ]*)\\}\\);$`, 'gm')) ];
        if (sites.some ((m) => m[2] !== argText)) continue;
        const args = argText.split (',').map ((a) => a.trim ()).filter ((a) => a !== '');
        const decl = body.match (new RegExp (`\\n\\s*Object ${v} = ([^;\\n]+);`, 'g')) ?? [];
        const writes = [ ...body.matchAll (new RegExp (`(?<![\\w.])${v} = ([^;\\n]+);`, 'g')) ].map ((w) => w[1].trim ());
        if (decl.length !== 1) continue;
        // every use of the dispatch local: its writes, null tests, this call
        const uses = (body.replace (/"(?:[^"\\\n]|\\.)*"/g, '""').match (new RegExp (`(?<![\\w."])${v}(?![\\w"])`, 'g')) ?? []).length;
        const nullTests = (body.match (new RegExp (`java\\.util\\.Objects\\.equals\\(${v}, null\\)`, 'g')) ?? []).length;
        const calls = (body.match (new RegExp (`Helpers\\.callDynamically\\(this, ${v}, `, 'g')) ?? []).length;
        if (calls !== sites.length || uses !== writes.length + nullTests + calls) continue;
        const tables = new Set<string> (), names = new Set<string> (), reads: [ string, string ][] = [];
        let ok = true;
        for (const w of writes) {
            let r;
            if (w === 'null') continue;
            if ((r = /^"(\w+)"$/.exec (w))) { names.add (r[1]); continue; }
            r = /^(?:\(\(\(java\.util\.Objects\.equals\((\w+), null\)\)\)\) \? null : )?this\.safeValue\((\w+), (\w+|"\w+")\)$/.exec (w);
            if (r && (r[1] === undefined || r[1] === r[3])) { tables.add (r[2]); reads.push ([ w, `${r[2]}.get(${r[3]})` ]); continue; }
            // values are non-empty literals, so the second key is read only when the first misses
            r = /^this\.safeValue2\((\w+), (\w+), (\w+)\)$/.exec (w);
            if (r) { tables.add (r[1]); reads.push ([ w, `(${r[1]}.get(${r[2]}) != null ? ${r[1]}.get(${r[2]}) : ${r[1]}.get(${r[3]}))` ]); continue; }
            r = /^\((\w+) == null \|\| (\w+) == null \? null : \1\.get\(\2\)\)$/.exec (w) ?? /^(\w+)\.get\((\w+|"\w+")\)$/.exec (w);
            if (r) { tables.add (r[1]); continue; }
            ok = false;
        }
        if (!ok) continue;
        const keyOk = (k: string) => /^"\w+"$/.test (k) || new RegExp (`(?:\\n\\s*|\\()String ${k}(?: =|,|\\))`).test (member);
        if (!reads.every (([ , g ]) => [ ...g.matchAll (/\.get\(([^()]+)\)/g) ].every ((k) => keyOk (k[1])))) continue;
        if (!writes.every ((w) => !/\.get\((\w+)\)/.test (w) || keyOk (/\.get\((\w+)\)/.exec (w)[1]))) continue;
        const retypes: [ string, string ][] = [];
        for (const t of tables) {
            const litRe = new RegExp (`\\n([ \\t]*)(?:java\\.util\\.)?Map<String, (?:Object|String)> ${t} = new (?:java\\.util\\.)?HashMap<String, (?:Object|String)>\\(\\) \\{\\{\\n((?:\\s*put\\( ?"[^"\\n]*", (?:"\\w+"|\\w+\\.this\\.safeValue\\(\\w+, [^;\\n]+\\) )\\);\\n)+)\\s*\\}\\};`, 'g');
            // the table is the dispatch block's own, or the member's only one
            const scope = (body.match (litRe) ?? []).length === 1 ? body : member;
            const lits = [ ...scope.matchAll (litRe) ];
            if (lits.length !== 1) { ok = false; break; }
            const lit = lits[0];
            const tUses = (scope.match (new RegExp (`(?<![\\w."])${t}(?![\\w"])`, 'g')) ?? []).length;
            const tReads = (scope.match (new RegExp (`(?:this\\.safeValue2?\\(${t}, |${t}\\.(?:get|containsKey)\\(|\\(${t} == null)`, 'g')) ?? []).length;
            if (!lit || tUses !== 1 + tReads) { ok = false; break; }
            for (const n of lit[2].matchAll (/"(\w+)"\);/g)) names.add (n[1]);
            // a nested entry reads another single-use literal name table with a String key: `inner.get(key)`
            let litText = lit[0];
            for (const nm of lit[2].matchAll (/\w+\.this\.safeValue\((\w+), ([^;\n]+)\) \);/g)) {
                const [ whole, inner, key ] = nm;
                const innerRe = new RegExp (`\\n([ \\t]*)(?:java\\.util\\.)?Map<String, Object> ${inner} = new (?:java\\.util\\.)?HashMap<String, Object>\\(\\) \\{\\{\\n((?:\\s*put\\( ?"[^"\\n]*", "\\w+"\\);\\n)+)\\s*\\}\\};`, 'g');
                const innerLits = [ ...member.matchAll (innerRe) ];
                const keyString = /^\w+\.this\.safeString\(\w+, (?:\d+|"\w+")\)$/.test (key) || keyOk (key);
                if (innerLits.length !== 1 || !keyString || (member.match (new RegExp (`(?<![\\w."])${inner}(?![\\w"])`, 'g')) ?? []).length !== 2) { ok = false; break; }
                for (const n of innerLits[0][2].matchAll (/"(\w+)"\);/g)) names.add (n[1]);
                retypes.push ([ innerLits[0][0], innerLits[0][0].replace (/Map<String, Object>/, 'Map<String, String>').replace (/HashMap<String, Object>/, 'HashMap<String, String>') ]);
                litText = litText.replace (whole, `${inner}.get(${key}) );`);
            }
            if (!ok) break;
            retypes.push ([ lit[0], litText.replace (/Map<String, Object>/, 'Map<String, String>').replace (/HashMap<String, Object>/, 'HashMap<String, String>') ]);
        }
        if (!ok || names.size === 0) continue;
        const argType = (a: string) => new RegExp (`(?:\\n\\s*|\\(|, )([\\w.]+(?:<[\\w.<>, ?]*>)?) ${a}(?: =|,|\\)|;)`).exec (method)?.[1];
        const arms: string[] = [];
        for (const n of [ ...names ].sort ()) {
            const s = sigs.get (n);
            if (s === undefined || s.length !== 1 || s[0].length < args.length || s[0].some ((p) => p.includes ('...'))) { ok = false; break; }
            const params = s[0];
            const typed = args.every ((a, i) => params[i] === 'Object' || (argType (a) !== undefined && norm (argType (a)) === norm (params[i])));
            if (!typed) { ok = false; break; }
            const pad = params.slice (args.length).map ((p) => (/^(java\.util\.)?Map\b/.test (p) ? 'new java.util.HashMap<String, Object>()' : 'null'));
            arms.push (`${indent}    case "${n}" -> this.${n}(${[ ...args, ...pad ].join (', ')});`);
        }
        if (!ok) continue;
        const miss = `"Method not found: " + ${v} + " with ${args.length} args on " + this.getClass().getName()`;
        let newBody = content.slice (start, end);
        for (const m of sites.reverse ()) {
            const ind = m[1];
            const sw = [ `${ind}switch (${v})`, `${ind}{`, ...arms.map ((a) => ind + a.slice (indent.length)), `${ind}    case null, default -> throw new RuntimeException(${miss});`, `${ind}}` ].join ('\n');
            newBody = newBody.slice (0, m.index) + sw + newBody.slice (m.index + m[0].length);
        }
        newBody = newBody.replace (new RegExp (`(\\n\\s*)Object ${v} = `), `$1String ${v} = `);
        for (const [ w, g ] of reads) newBody = newBody.split (`${v} = ${w};`).join (`${v} = ${g};`);
        // a table declared above the dispatch block is retyped in place
        const outer: { from: number, to: number, text: string }[] = [];
        for (const [ a, b ] of retypes) {
            const at = newBody.includes (a) ? start : content.indexOf (a, memberFrom);
            if (at < 0 || at > start) { ok = false; break; }
            if (at < start) outer.push ({ from: at, to: at + a.length, text: b });
            else newBody = newBody.replace (a, b);
        }
        if (!ok) continue;
        edits.push ({ from: start, to: end, text: newBody }, ...outer);
    }
    let out = content;
    for (const e of edits.sort ((a, b) => b.from - a.from)) out = out.slice (0, e.from) + e.text + out.slice (e.to);
    return out;
}

// `this[name] (args)` on a String local bound once to a literal that names a generated implicit-API method
// (varargs, declared only in api/<X>Api.java): a direct call, which is what reflection resolves to.
function nativeJavaLiteralApiDispatch (content: string, apiSource: string): string {
    const re = /\(\((?:java\.util\.concurrent\.)?CompletableFuture<Object>\)(?:io\.github\.ccxt\.)?Helpers\.callDynamically\(this, (\w+), new Object\[\] \{ ([^{}\n]*) \}\)\)\.join\(\)/g;
    return content.replace (re, (whole, v, args) => {
        const decls = [ ...content.matchAll (new RegExp (`\\b(?:String|Object) ${v} = "(\\w+)";`, 'g')) ];
        const uses = (content.match (new RegExp (`(?<![\\w."])${v}(?![\\w"])`, 'g')) ?? []).length;
        if (decls.length !== 1 || uses !== 2) return whole;
        const name = decls[0][1];
        const apiDecls = apiSource.match (new RegExp (`\\n    public CompletableFuture<[\\w<>, ]+>\\s+${name} \\(Object\\.\\.\\. optionalArgs\\)`, 'g')) ?? [];
        if (apiDecls.length !== 1 || new RegExp (`\\b${name}\\(`).test (content)) return whole;
        return `(this.${name}(${args})).join()`;
    });
}

// ===== h26-J03: a `safeDict (..) as Dict` reader with a Dict default prints the 77j6 Map local
function javaH26J03AsDictReaderSelfTest (): string[] {
    const problems: string[] = [];
    const probe = path.join(process.cwd(), 'ts', 'src', `zzh26j03selftest${process.pid}.ts`);
    const body = [
        "import Exchange from './abstract/binance.js';", "import type { Dict, Market } from './base/types.js';",
        `export default class zzh26j03selftest${process.pid} extends Exchange {`,
        "    pos (data: Dict) { const o1 = this.safeDict (data, 'order', data) as Dict; return this.safeString (o1, 'id'); }",
        "    anyDefault (data: any) { const o2 = this.safeDict (data, 'order', data) as Dict; return this.safeString (o2, 'id'); }",
        "    marketCast (data: Dict, market: Market = undefined) { const o3 = this.safeDict (data, 'm', market) as Market; return this.safeString (o3, 'id'); }",
        "    otherWrite (data: Dict, r: any) { let o4 = this.safeDict (data, 'order', data) as Dict; if (r) { o4 = r; } return this.safeString (o4, 'id'); }",
        '}',
    ].join('\n');
    try {
        fs.writeFileSync(probe, body);
        const out = new NewTranspiler().transpiler.transpileJavaByPath(probe).content as string;
        if (!/Map<String, Object> o1 = this\.safeDict\(/.test(out)) problems.push("h26-J03: 'o1' (as Dict, Dict default) must print Map<String, Object> (Map-default overload, no checkcast)");
        for (const name of [ 'o2', 'o3', 'o4' ]) {
            if (!new RegExp(`\\bObject ${name} = `).test(out)) problems.push(`h26-J03: '${name}' must stay Object`);
        }
    } catch (e: any) {
        problems.push(`h26-J03 self-test threw: ${e.message}`);
    } finally {
        fs.rmSync(probe, { force: true });
    }
    return problems;
}

// ===== h27-J05: a newMap literal whose values are only member-declared locals/params or literals is hoisted
// before its statement even after calls: a callee cannot write a Java local, so the values read the same.
function h27J05HoistPureValues (t: string, at: number, close: number, args: string[], lineStart: number, indent: string, fresh: () => string): { text: string, end: number } | undefined {
    const prefix = t.slice (lineStart, at);
    if (/^\s*(?:(?:if|for|while|switch|else|case|do|try|catch|synchronized|yield|throw)\b|\}|\/\/)/.test (prefix) || /->|\binstanceof\b|\bswitch\b|\byield\b|"|\+\+|--/.test (prefix)) return undefined;
    // no write inside the statement before the literal (only a leading `x = ` / `T x = `)
    if (/[^=!<>]=(?!=)/.test (prefix.slice (prefix.indexOf ('(') + 1 || prefix.length))) return undefined;
    // the previous statement ended (whole-line `//` comments in between are skipped)
    const before = t.slice (0, lineStart).replace (/(?:\n[ \t]*\/\/[^\n]*)+\s*$/, '').trimEnd ();
    if (!/[;{}]$/.test (before) || /^\s*\/\//.test (before.slice (before.lastIndexOf ('\n') + 1))) return undefined;
    // a name the member declares (any type) is a local or parameter, never a field
    const keywords = [ 'return', 'new', 'else', 'case', 'throw', 'instanceof', 'yield' ];
    const declared = (name: string) => [ ...t.matchAll (new RegExp (`(?:^|[\\s(,])((?:final )?[\\w.]+(?:<[\\w.?]+(?:<[\\w.?, ]*>)?(?:, [\\w.?]+(?:<[\\w.?, ]*>)?)*>)?) ${name}(?=\\s*(?:=(?!=)|[,);:]))`, 'g')) ]
        .some ((m) => !keywords.includes (m[1].replace (/^final /, '')));
    const pure = (e: string): boolean => {
        e = containerOpsUnparen (e);
        if (/^(?:null|true|false|-?\d+(?:\.\d+)?[LD]?|"(?:[^"\\]|\\.)*")$/.test (e)) return true;
        return /^[A-Za-z_]\w*$/.test (e) && e !== 'this' && declared (e);
    };
    if (args.some ((a, i) => i % 2 === 1 && !pure (a))) return undefined;
    const n = fresh ();
    const lines: string[] = [ `${indent}java.util.HashMap<String, Object> ${n} = new java.util.HashMap<String, Object>();` ];
    for (let i = 0; i < args.length; i += 2) lines.push (`${indent}${n}.put(${args[i]}, ${args[i + 1]});`);
    lines.push (`${prefix}${n}`);
    return { text: lines.join ('\n'), end: close + 1 };
}
function h27J05HoistPureValuesSelfTest (): string[] {
    const cls = (body: string) => `public class Woo extends WooApi\n{\n    public Object m(Map<String, Object> p, Object o, String s, List<Object> l)\n    {\n${body}\n    }\n}`;
    const cases: [string, string, string | undefined][] = [
        [ 'after call, param + literal', '        return this.extend(this.f(p), Helpers.newMap("a", s, "b", null));', '        j39v1.put("a", s);\n        j39v1.put("b", null);\n        return this.extend(this.f(p), j39v1);' ],
        // negatives: a call value (could depend on the earlier call), an undeclared name, a write before the literal, a condition
        [ 'call value', '        return this.extend(this.f(p), Helpers.newMap("a", this.g()));', 'switch (0)' ],
        [ 'field value', '        return this.extend(this.f(p), Helpers.newMap("a", this.x));', 'switch (0)' ],
        [ 'write first', '        return this.extend(this.f(s = "q"), Helpers.newMap("a", s));', 'switch (0)' ],
        [ 'two declared types', '        Object q = null;\n        if (o != null) { Long q = 1L; }\n        return this.extend(this.f(p), Helpers.newMap("a", q));', '        j39v1.put("a", q);\n        return this.extend(this.f(p), j39v1);' ],
        [ 'after comment', '        Object q = 1L;\n        //\n        //   {}\n        return this.extend(this.f(p), Helpers.newMap("a", q));', '        //   {}\n        java.util.HashMap<String, Object> j39v1' ],
        [ 'undeclared name', '        return this.extend(this.f(p), Helpers.newMap("a", fieldName));', 'switch (0)' ],
        [ 'in if', '        if (this.f(p, Helpers.newMap("a", s)) != null) return null;', 'switch (0)' ],
    ];
    return runSnippetCases(cases, cls, nativeJavaContainerOps, (name, out) => `h27-J05 hoist self test: ${name}\n${out}`);
}
// ===== end h27-J05

// ===== h28-J05: a newMap value may also be parseNumber of a local/literal: a static, side-effect-free reader
// of its own argument, so after the earlier calls it returns the same value as in place.
function h28J05HoistStatement (t: string, at: number, close: number, args: string[], lineStart: number, indent: string, fresh: () => string): { text: string, end: number } | undefined {
    const pn = /^(?:this|BaseExchange)\.parseNumber\(([A-Za-z_]\w*|"(?:[^"\\]|\\.)*"|-?\d+(?:\.\d+)?[LD]?)\)$/;
    const plain = args.map ((a, i) => (i % 2 === 1 ? pn.exec (containerOpsUnparen (a))?.[1] ?? a : a));
    if (plain.every ((a, i) => a === args[i])) return undefined;
    const h = h27J05HoistPureValues (t, at, close, plain, lineStart, indent, fresh);
    if (h === undefined) return undefined;
    const n = /HashMap<String, Object> (\w+) = /.exec (h.text)![1];
    const lines: string[] = [ `${indent}java.util.HashMap<String, Object> ${n} = new java.util.HashMap<String, Object>();` ];
    for (let i = 0; i < args.length; i += 2) lines.push (`${indent}${n}.put(${args[i]}, ${args[i + 1]});`);
    lines.push (`${t.slice (lineStart, at)}${n}`);
    return { text: lines.join ('\n'), end: close + 1 };
}
function h28J05HoistSelfTest (): string[] {
    const cls = (body: string) => `public class Woo extends WooApi\n{\n    public Object m(Map<String, Object> p, Object o, String s, List<Object> l)\n    {\n${body}\n    }\n}`;
    const cases: [string, string, string | undefined][] = [
        [ 'parseNumber of a param', '        return this.extend(this.f(p), Helpers.newMap("a", this.parseNumber(o), "b", s));', '        j39v1.put("a", this.parseNumber(o));\n        j39v1.put("b", s);\n        return this.extend(this.f(p), j39v1);' ],
        // negatives: parseNumber of a call or a field, another method on a local
        [ 'parseNumber of a call', '        return this.extend(this.f(p), Helpers.newMap("a", this.parseNumber(this.g())));', 'switch (0)' ],
        [ 'parseNumber of a field', '        return this.extend(this.f(p), Helpers.newMap("a", this.parseNumber(this.x)));', 'switch (0)' ],
        [ 'other reader', '        return this.extend(this.f(p), Helpers.newMap("a", this.safeString(p, "k")));', 'switch (0)' ],
    ];
    return runSnippetCases(cases, cls, nativeJavaContainerOps, (name, out) => `h28-J05 hoist self test: ${name}\n${out}`);
}
// ===== end h28-J05

// ===== h29-J05: (1) a string literal in the statement prefix is masked before the h27/h28 proofs (it cannot read or write);
// (2) the base pure-prefix rule may follow whole-line `//` comments or a statement ending in a trailing `//` comment.
function h29J05HoistStatement (t: string, at: number, close: number, args: string[], lineStart: number, indent: string, fresh: () => string): { text: string, end: number } | undefined {
    const prefix = t.slice (lineStart, at);
    const masked = prefix.replace (/"(?:[^"\\\n]|\\.)*"/g, (m) => 'S'.repeat (m.length));
    if (masked !== prefix && !masked.includes ('"')) {
        const t2 = t.slice (0, lineStart) + masked + t.slice (at);
        const h = h27J05HoistPureValues (t2, at, close, args, lineStart, indent, fresh) ?? h28J05HoistStatement (t2, at, close, args, lineStart, indent, fresh);
        const cut = h === undefined ? -1 : h.text.lastIndexOf ('\n' + masked);
        if (h !== undefined && cut !== -1) return { text: h.text.slice (0, cut + 1) + prefix + h.text.slice (cut + 1 + masked.length), end: h.end };
    }
    if (!containerOpsHoistPrefix ().test (prefix) || /^\s*(?:if|for|while|switch|else|case|do|try|catch|synchronized)\b/.test (prefix)) return undefined;
    const prev = t.slice (0, lineStart).replace (/(?:\n[ \t]*\/\/[^\n]*)+\s*$/, '').trimEnd ();
    const last = prev.slice (prev.lastIndexOf ('\n') + 1);
    if (/^\s*\/\//.test (last) || !(/[;{}]$/.test (prev) || /^[^"\/]*;[ \t]*\/\/[^\n]*$/.test (last))) return undefined;
    const n = fresh ();
    const lines: string[] = [ `${indent}java.util.HashMap<String, Object> ${n} = new java.util.HashMap<String, Object>();` ];
    for (let i = 0; i < args.length; i += 2) lines.push (`${indent}${n}.put(${args[i]}, ${args[i + 1]});`);
    lines.push (`${prefix}${n}`);
    return { text: lines.join ('\n'), end: close + 1 };
}
function h29J05HoistSelfTest (): string[] {
    const cls = (body: string) => `public class Woo extends WooApi\n{\n    public Object m(Map<String, Object> p, Object o, String s, List<Object> l)\n    {\n${body}\n    }\n}`;
    const cases: [string, string, string | undefined][] = [
        [ 'string literal in prefix', '        return this.extend(this.omit(p, "k"), Helpers.newMap("a", s));', '        j39v1.put("a", s);\n        return this.extend(this.omit(p, "k"), j39v1);' ],
        [ 'trailing comment before', '        Object q = o; // note\n        l.add(Helpers.newMap("a", this.safeString(p, "k")));', '        j39v1.put("a", this.safeString(p, "k"));\n        l.add(j39v1);' ],
        // negatives: a write inside a masked prefix, a call value after an earlier call, a trailing comment after an open statement
        [ 'write in prefix', '        return this.extend(this.f(s = "q"), Helpers.newMap("a", s));', 'switch (0)' ],
        [ 'call value after call', '        return this.extend(this.omit(p, "k"), Helpers.newMap("a", this.g()));', 'switch (0)' ],
        [ 'after comment lines', '        Object q = o;\n        // note\n        l.add(Helpers.newMap("a", this.g()));', '        j39v1.put("a", this.g());\n        l.add(j39v1);' ],
        [ 'open statement', '        Object q = this.f(o, // note\n            l.add(Helpers.newMap("a", this.g())));', 'switch (0)' ],
    ];
    return runSnippetCases(cases, cls, nativeJavaContainerOps, (name, out) => `h29-J05 hoist self test: ${name}\n${out}`);
}
// ===== end h29-J05

// ===== h30-J05: (1) values and the already-evaluated part of the prefix are both write-free (base readers,
// GetValue, Objects.equals, fresh HashMap / ArrayList), so they commute; (2) after any call, values built only from
// member-declared locals and literals; (3) `T x = c ? null : newMap(..);` becomes `T x = null; if (!(c)) {..}`.
function h30J05Mask (e: string): string {
    return e.replace (/"(?:[^"\\\n]|\\.)*"/g, (m) => 'S'.repeat (m.length));
}
function h30J05WriteFree (e: string, anonPut: boolean, mapLocal: (n: string) => boolean): boolean {
    const m = h30J05Mask (e);
    if (m.includes ('"') || /->|\+\+|--|\bswitch\b|\byield\b|[^=!<>]=(?!=)/.test (m)) return false;
    for (const n of m.matchAll (/\bnew\s+([\w.]+)(<[^()]*>)?\s*\(/g)) if (!/^(?:java\.util\.)?(?:HashMap|ArrayList)$/.test (n[1])) return false;
    const stripped = m.replace (/\bnew\s+[\w.]+(?:<[^()]*>)?\s*\(/g, '(');
    for (const c of stripped.matchAll (/([\w.]+)\s*\(/g)) {
        if (H30J05_READERS.test (c[1])) continue;
        if (anonPut && c[1] === 'put' && /\(\) \{\{/.test (m)) continue;
        // Map.get on a Map-cast receiver or a Map-declared local only reads
        if (c[1] === '.get' || (/^[A-Za-z_]\w*\.get$/.test (c[1]) && mapLocal (c[1].slice (0, -4)))) continue;
        return false;
    }
    return true;
}
// the prefix with the names of calls still open at the literal removed (those run after their arguments)
function h30J05Evaluated (prefix: string): string {
    const m = h30J05Mask (prefix);
    const open: number[] = [];
    for (let k = 0; k < m.length; k++) {
        if (m[k] === '(') open.push (k);
        else if (m[k] === ')') open.pop ();
    }
    let out = m;
    for (const k of open.reverse ()) {
        const name = /(?:\.?[A-Za-z_]\w*)+$/.exec (out.slice (0, k));
        if (name !== null) out = out.slice (0, k - name[0].length) + ' '.repeat (name[0].length) + out.slice (k);
    }
    return out;
}
function h30J05HoistStatement (t: string, at: number, close: number, args: string[], lineStart: number, indent: string, fresh: () => string): { text: string, end: number } | undefined {
    const prefix = t.slice (lineStart, at);
    if (/^\s*(?:(?:if|for|while|switch|else|case|do|try|catch|synchronized|yield|throw)\b|\}|\/\/)/.test (prefix)) return undefined;
    const prev = t.slice (0, lineStart).replace (/(?:\n[ \t]*\/\/[^\n]*)+\s*$/, '').trimEnd ();
    const last = prev.slice (prev.lastIndexOf ('\n') + 1);
    if (/^\s*\/\//.test (last) || !(/[;{}]$/.test (prev) || /^[^"\/]*;[ \t]*\/\/[^\n]*$/.test (last))) return undefined;
    const lead = /^\s*(?:return |[\w.]+(?:<[\w.?, <>]*>)? [A-Za-z_]\w* = |[A-Za-z_]\w* = )?/.exec (prefix)![0];
    const values = args.filter ((a, i) => i % 2 === 1);
    const n = fresh;
    const emit = (body: string[]) => ({ text: body.join ('\n'), end: close + 1 });
    const puts = (v: string) => args.reduce ((acc: string[], a, i) => (i % 2 === 0 ? [ ...acc, `${v}.put(${a}, ${args[i + 1]});` ] : acc), []);
    const ternary = /^(\s*)((?:[\w.]+(?:<[\w.?, <>]*>)? )?)([A-Za-z_]\w*) = (.+) \? null : \(*$/.exec (prefix);
    if (ternary !== null && ternary[2] !== "" && ternary[2] !== "var " && !h30J05Mask (ternary[4]).includes ('?') && !/[^=!<>]=(?!=)/.test (h30J05Mask (ternary[4]))) {
        const opens = (/\(*$/.exec (prefix)![0]).length;
        let end = close + 1;
        for (let k = 0; k < opens; k++) { if (t[end] !== ')') return undefined; end++; }
        if (t[end] !== ';' || new RegExp (`\\b${ternary[3]}\\b`).test (values.join (' '))) return undefined;
        const v = n ();
        const out = [ `${indent}${ternary[2]}${ternary[3]} = null;`, `${indent}if (!(${ternary[4].trim ()}))`, `${indent}{`,
            `${indent}    java.util.HashMap<String, Object> ${v} = new java.util.HashMap<String, Object>();`,
            ...puts (v).map ((p) => `${indent}    ${p}`), `${indent}    ${ternary[3]} = ${v};`, `${indent}}` ];
        return { text: out.join ('\n'), end: end + 1 };
    }
    const evaluated = h30J05Evaluated (prefix.slice (lead.length));
    let flat = evaluated;
    for (let k = 0; k < 20 && /\([^()]*\)/.test (flat); k++) flat = flat.replace (/\([^()]*\)/g, 'X');
    if (/\?|->|\binstanceof\b/.test (flat)) return undefined;
    if (/[^=!<>]=(?!=)|\+\+|--/.test (evaluated)) return undefined;
    const declared = memberDeclaredTypeOf (t, true);
    const localOnly = (e: string) => {
        const m = h30J05Mask (e);
        if (/[^=!<>]=(?!=)|\+\+|--|->/.test (m)) return false;
        const calls = [ ...m.matchAll (/([\w.]+)\s*\(/g) ].map ((c) => c[1]);
        if (calls.some ((c) => c !== 'java.util.Objects.equals')) return false;
        const ids = m.replace (/java\.util\.Objects\.equals/g, ' ').match (/[A-Za-z_][\w.]*/g) ?? [];
        return ids.every ((id) => /^(?:null|true|false|S+)$/.test (id) || (/^[A-Za-z_]\w*$/.test (id) && id !== 'this' && declared (id) !== undefined));
    };
    const mapLocal = (x: string) => /^(?:java\.util\.)?(?:Map|HashMap)<String, Object>$/.test (declared (x) ?? '');
    const commute = h30J05WriteFree (evaluated, false, mapLocal) && values.every ((v) => h30J05WriteFree (v, true, mapLocal));
    if (!commute && !values.every (localOnly)) return undefined;
    const v = n ();
    return emit ([ `${indent}java.util.HashMap<String, Object> ${v} = new java.util.HashMap<String, Object>();`, ...puts (v).map ((p) => `${indent}${p}`), `${prefix}${v}` ]);
}
function h30J05HoistSelfTest (): string[] {
    const cls = (body: string) => `public class Woo extends WooApi\n{\n    public Object m(Map<String, Object> p, Object o, String s, List<Object> l)\n    {\n${body}\n    }\n}`;
    const cases: [string, string, string | undefined][] = [
        [ 'write-free prefix and values', '        l.add(this.extend(Helpers.GetValue(this.fees, "t"), Helpers.newMap("a", this.safeBool(p, "k", (Object) null), "b", (s + "/"))));', '        j39v1.put("a", this.safeBool(p, "k", (Object) null));\n        j39v1.put("b", (s + "/"));\n        l.add(this.extend(Helpers.GetValue(this.fees, "t"), j39v1));' ],
        [ 'field receiver, arrayConcat', '        this.options.put("c", this.extend(o, Helpers.newMap("a", this.arrayConcat(l, l), "b", s)));', '        j39v1.put("a", this.arrayConcat(l, l));\n        j39v1.put("b", s);\n        this.options.put("c", this.extend(o, j39v1));' ],
        [ 'local ternary after call', '        return this.extend(this.f(p), Helpers.newMap("a", (java.util.Objects.equals(s, "0")) ? "ok" : "no"));', '        j39v1.put("a", (java.util.Objects.equals(s, "0")) ? "ok" : "no");\n        return this.extend(this.f(p), j39v1);' ],
        [ 'ternary arm', '        Map<String, Object> f = ((java.util.Objects.equals(s, null))) ? null : Helpers.newMap("a", s, "b", this.g());', '        Map<String, Object> f = null;\n        if (!(((java.util.Objects.equals(s, null)))))\n        {\n            java.util.HashMap<String, Object> j39v1 = new java.util.HashMap<String, Object>();\n            j39v1.put("a", s);\n            j39v1.put("b", this.g());\n            f = j39v1;\n        }' ],
        // negatives: a writing call before the literal with a call value, a field in a local-only value, an unknown reader, a nested ternary, a write in the condition
        [ 'call value after call', '        return this.extend(this.f(p), Helpers.newMap("a", this.safeString(p, "k")));', 'switch (0)' ],
        [ 'field after call', '        return this.extend(this.f(p), Helpers.newMap("a", (java.util.Objects.equals(this.x, "0")) ? "ok" : "no"));', 'switch (0)' ],
        [ 'unknown reader', '        l.add(this.extend(Helpers.GetValue(this.fees, "t"), Helpers.newMap("a", this.g(p))));', 'switch (0)' ],
        [ 'two ternaries', '        Map<String, Object> f = (s == null) ? null : (o == null) ? null : Helpers.newMap("a", this.g());', 'switch (0)' ],
        [ 'write in condition', '        Map<String, Object> f = ((s = null) == null) ? null : Helpers.newMap("a", s);', 'switch (0)' ],
        [ 'self reference', '        Map<String, Object> f = (s == null) ? null : Helpers.newMap("a", this.g(f));', 'switch (0)' ],
    ];
    return runSnippetCases(cases, cls, nativeJavaContainerOps, (name, out) => `h30-J05 hoist self test: ${name}\n${out}`);
}
// ===== end h30-J05
