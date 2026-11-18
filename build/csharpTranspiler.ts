import Transpiler from "ast-transpiler";
import { basename, join, resolve } from 'path'
import { createFolderRecursively, replaceInFile, overwriteFile, checkCreateFolder } from './fsLocal.js'
import { setupCsharpPrinter } from './csharp-worker.js'
import { CORE_LIST_ARGS } from './csharp-local-types.js'
import { MARKET_ROW_BOOL_KEYS, CSHARP_COLLECTION_RETURN_METHODS } from './csharp-local-types.js'
// the positional core-argument type tables live in the classifier module so the pooled
// workers' parameter-type hook (build/csharp-local-types.js) reads the same proof
import { CORE_NUMERIC_ARGS, CORE_STRING_ARGS } from './csharp-local-types.js'
import { csharpTupleReturns } from './csharp-local-types.js'
import { isTsIndexSource, readTsIndexSource } from './csharp-local-types.js'
import { PARAMETERS_ARG_TYPED_METHODS, PARSE_CURRENCY_IDICT_PARAMS, PARSE_MARKET_IDICT_PARAMS, SIGNATURE_ARG_TYPES } from './csharp-local-types.js'
import { writeOverloadStrippedFile, removeOverloadStrippedFile, restoreParamsBagInitializers } from './stripOverloads.js'
import { platform } from 'process'
import os from 'os'
import fs from 'fs'
import log from 'ololog'
import ansi from 'ansicolor'
import {Transpiler as OldTranspiler } from "./transpile.js";
import errorHierarchy from '../js/src/base/errorHierarchy.js'
import Piscina from 'piscina';
import { isMainEntry } from "./transpile.js";
import { filterDirtyExchangeFiles, skipUpToDateStage, testStageInputs } from "./transpile.js";
import { unCamelCase } from "../js/src/base/functions.js";

ansi.nice


let exchanges = JSON.parse (fs.readFileSync("./exchanges.json", "utf8"));
const exchangeIds: string[] = exchanges.ids
const wsIds: string[] = exchanges.ws || []
const predictionIds: string[] = exchanges.prediction || []
const predictionWsIds: string[] = exchanges.predictionWs || []

// @ts-expect-error
const metaUrl = import.meta.url
let __dirname = new URL('.', metaUrl).pathname;

let shouldTranspileTests = true

// Keywords after which a `((string)…)` cast wrap is still an expression position. A plain
// identifier directly before the `(` makes it a call's argument list instead
// (`Remove((string)key)`, `throw new ExchangeError ((string)arg)`).
const CALL_PRECEDING_KEYWORDS = new Set ([
    'return', 'throw', 'new', 'case', 'else', 'in', 'is', 'as', 'await', 'yield', 'when',
    'do', 'if', 'while', 'switch', 'using', 'typeof', 'default', 'checked', 'unchecked',
    'ref', 'out', 'params', 'stackalloc', 'and', 'or', 'not', 'this', 'base', 'null',
    'true', 'false', 'void', 'var', 'delegate', 'lock', 'fixed', 'unsafe', 'goto',
]);

function overwriteFileAndFolder (path: string, content: string) {
    if (!(fs.existsSync(path))) {
        checkCreateFolder (path);
    }
    overwriteFile (path, path.endsWith ('.cs') ? csharpTupleReturns (content, path) : content);
}

// on windows the URL pathname keeps a leading '/' before the drive letter
if (platform === 'win32') {
    if (__dirname[0] === '/') {
        __dirname = __dirname.substring(1)
    }
}

// the index where the bracket group opened at `from` closes, walking by `step` (-1 walks back from a
// closer); characters in `quotes` start a literal skipped up to its matching quote; -1 when unbalanced
function csharpMatchingClose (text: string, from: number, opens = '(', closes = ')', quotes = '', step = 1): number {
    let depth = 0;
    let quote = '';
    for (let i = from; (step > 0) ? (i < text.length) : (i >= 0); i += step) {
        const ch = text[i];
        if (quote !== '') {
            if (ch === '\\') {
                i += step;
            } else if (ch === quote) {
                quote = '';
            }
        } else if (quotes.includes (ch)) {
            quote = ch;
        } else if ((quotes === '"') && (step > 0) && (ch === '/') && (text[i + 1] === '/')) {
            // the former matchingParen walker (every '"'-quoted caller): a `//` comment runs to the end of the line
            while ((i < text.length) && (text[i] !== '\n')) {
                i++;
            }
        } else if (opens.includes (ch)) {
            depth++;
        } else if (closes.includes (ch)) {
            depth--;
            if (depth === 0) {
                return i;
            }
        }
    }
    return -1;
}

function csharpArgumentCount (args: string): number {
    if (args.trim () === '') {
        return 0
    }
    let depth = 0
    let count = 1
    let inString = false
    let quote = ''
    for (let i = 0; i < args.length; i++) {
        const c = args[i]
        if (inString) {
            if (c === '\\') {
                i += 1
            } else if (c === quote) {
                inString = false
            }
            continue
        }
        if (c === '"' || c === "'") {
            inString = true
            quote = c
        } else if (c === '(' || c === '[' || c === '{') {
            depth += 1
        } else if (c === ')' || c === ']' || c === '}') {
            depth -= 1
        } else if (c === ',' && depth === 0) {
            count += 1
        }
    }
    return count
}

// native getArrayLength / inOp / getValue on a receiver the EMITTED signature and declarations type
// (a type produced after printing): the member the helper's own runtime branch performs; a receiver
// or key the emitted text does not prove keeps the helper

// declared C# types whose `Count` counts the elements getArrayLength's IList / ICollection
// branches count (the helper answers 0 for null, which `x?.Count ?? 0` reproduces)
const CSHARP_DECLARED_COUNT_TYPES = [ 'List<', 'IList<', 'Collection<', 'Dictionary<', 'IDictionary<',
    'ConcurrentDictionary<', 'IReadOnlyDictionary<', 'SortedDictionary<', 'SortedList<', 'HashSet<',
    'ConcurrentQueue<',
    // ws caches and book sides (cs/ccxt/ws): SlimConcurrentList<object>, the helper's IList<object> branch
    'ccxt.pro.ArrayCache', 'ccxt.pro.IOrderBookSide', 'ccxt.pro.IAsks', 'ccxt.pro.IBids' ];
// declared C# types whose `Length` is getArrayLength's own byte[] / string branch
const CSHARP_DECLARED_LENGTH_TYPES = [ 'byte[]', 'string', 'string?' ];
// declared C# dictionary types whose `ContainsKey` is InOp's IDictionary<string, object> branch
const CSHARP_DECLARED_DICT_TYPES = [ 'Dictionary<', 'IDictionary<', 'ConcurrentDictionary<',
    'IReadOnlyDictionary<', 'SortedDictionary<', 'SortedList<' ];
// space-normalized dictionary types whose indexer hands back an `object`: the box GetValue's
// dictionary branch returns, and the only value the `: null` branch can join
const CSHARP_DECLARED_OBJECT_DICT_TYPES = [ 'Dictionary<string,object>', 'IDictionary<string,object>',
    'ConcurrentDictionary<string,object>', 'IReadOnlyDictionary<string,object>', 'SortedDictionary<string,object>' ];
// declared C# list types whose `Contains` is InOp's IList<object> branch (a List<string> /
// List<Int64> receiver casts the key in the helper, so it keeps the helper)
const CSHARP_DECLARED_LIST_TYPES = [ 'List<object>', 'IList<object>' ];

// a method signature line inside a class body: indented, a member name, an argument list;
// the return type accepts a trailing `?` (`bool?` / `double?`), or the region boundary
// drifts and a later method's body reads the previous method's parameter types
const CSHARP_HELPER_SIGNATURE_RE = /^[ ]{4,}(?:(?:public|private|protected|internal)[ ]+)?(?:static[ ]+|async[ ]+|virtual[ ]+|override[ ]+|sealed[ ]+|new[ ]+|partial[ ]+|extern[ ]+|unsafe[ ]+)*(?:[A-Za-z_][\w<>,.\[\]?]*(?:[ ][A-Za-z_][\w<>,.\[\]?]*)*)[ ]+([A-Za-z_]\w*)[ ]*\(/;
// a declaration of one variable: `Type name = value;` / `Type name;` (`Int64? x` included)
const CSHARP_HELPER_DECL_RE = /^[ ]*([A-Za-z_][\w<>,.\[\]?]*(?:[ ][A-Za-z_][\w<>,.\[\]?]*)*)[ ]+([A-Za-z_]\w*)[ ]*(=[ ]*([^;]*))?;[ ]*$/;
// the same declaration with a collection/object initializer that spans lines (`= new X () {`)
const CSHARP_HELPER_NEW_DECL_RE = /^[ ]*([A-Za-z_][\w<>,.\[\]]*(?:[ ][A-Za-z_][\w<>,.\[\]]*)*)[ ]+([A-Za-z_]\w*)[ ]*=[ ]*new\b[^;]*\{[ ]*$/;
const CSHARP_HELPER_TYPE_RE = /^[A-Za-z_][\w.]*(?:[ ]*<[^<>=;(){}]*>)?(?:[ ]*\[\])?[?]?$/;
// statement keywords a declaration-shaped line may start with
const CSHARP_HELPER_KEYWORDS = [ 'return', 'throw', 'if', 'else', 'while', 'for', 'foreach', 'using',
    'lock', 'yield', 'case', 'switch', 'do', 'try', 'catch', 'break', 'continue', 'goto', 'new',
    'fixed', 'checked', 'unchecked', 'await', 'base', 'this', 'var' ];

// string / char literal bodies and line comments blanked out, offsets and quotes preserved
function csharpHelperMaskLine (line: string): string {
    let out = '';
    let i = 0;
    while (i < line.length) {
        const ch = line[i];
        if ((ch === '/') && (line[i + 1] === '/')) {
            out += ' '.repeat (line.length - i);
            break;
        }
        if ((ch === '"') || (ch === "'")) {
            const quote = ch;
            let j = i + 1;
            out += (quote === '"') ? '"' : ' ';
            while (j < line.length) {
                if (line[j] === '\\') { out += '  '; j += 2; continue; }
                if (line[j] === quote) break;
                out += ' '; j++;
            }
            if (j < line.length) { out += (quote === '"') ? '"' : ' '; j++; }
            i = j;
            continue;
        }
        out += ch;
        i++;
    }
    return out;
}

// the parameter types a signature line (and its continuation lines) declares
function csharpHelperSignatureParams (masked: string[], start: number): { [name: string]: string } {
    let depth = 0;
    let text = '';
    for (let i = start; (i < masked.length) && (i < start + 14); i++) {
        text += masked[i].split ('{')[0] + ' ';
            depth += (masked[i].match (/\(/g) ?? []).length;
            depth -= (masked[i].match (/\)/g) ?? []).length;
        if ((depth <= 0) && text.includes ('(')) {
            break;
        }
    }
    const open = text.indexOf ('(');
    const close = text.lastIndexOf (')');
    if ((open < 0) || (close <= open)) {
        return {};
    }
    const params: { [name: string]: string } = {};
    const parts = [];
    let current = '';
    let nesting = 0;
    for (const ch of text.substring (open + 1, close)) {
        if ((ch === '(') || (ch === '<') || (ch === '[')) nesting++;
        if ((ch === ')') || (ch === '>') || (ch === ']')) nesting--;
        if ((ch === ',') && (nesting === 0)) { parts.push (current); current = ''; continue; }
        current += ch;
    }
    if (current.trim ()) parts.push (current);
    for (const part of parts) {
        const tokens = part.trim ().split ('=')[0].trim ().split (/\s+/).filter ((t) => t.length > 0);
        if (tokens.length < 2) continue;
        const name = tokens[tokens.length - 1];
        let type = tokens.slice (0, tokens.length - 1).join (' ');
        type = type.replace (/^(ref|out|in|params|this)\s+/, '');
        if (!/^[A-Za-z_]\w*$/.test (name) || !CSHARP_HELPER_TYPE_RE.test (type)) continue;
        params[name] = type;
    }
    return params;
}

// the method-signature lines of a masked file (each method's region runs to the next one)
function csharpMethodSignatures (masked: string[]): number[] {
    const signatures = [];
    for (let i = 0; i < masked.length; i++) {
        if (CSHARP_HELPER_SIGNATURE_RE.test (masked[i]) && !masked[i].trimEnd ().endsWith (';')) signatures.push (i);
    }
    return signatures;
}

// every declaration line in [start, end)
function csharpRegionDeclarations (masked: string[], start: number, end: number) {
    const declarations = [];
    for (let i = start; i < end; i++) {
        const d = csharpHelperDeclarationOfLine (masked[i]);
        if (d !== undefined) declarations.push ({ line: i, name: d.name, type: d.type, value: d.value });
    }
    return declarations;
}

// a method region plus its `for (int|Int64 x = ...)` counters and the names any other syntax binds
function csharpCounterRegion (masked: string[], start: number, end: number) {
    const region = { start, end, params: csharpHelperSignatureParams (masked, start), declarations: csharpRegionDeclarations (masked, start, end), lines: masked, bound: new Set<string> (), forInt: new Set<string> (), forInt64: new Set<string> () };
    for (let i = start + 1; i < end; i++) {
        for (const b of masked[i].matchAll (/\bfor[ ]*\([ ]*(int|Int64)[ ]+([A-Za-z_]\w*)[ ]*=/g)) (b[1] === 'int' ? region.forInt : region.forInt64).add (b[2]);
        for (const b of masked[i].matchAll (/(?:\bfor(?:each)?[ ]*\([ ]*([A-Za-z_][\w<>?,]*)[ ]+|\bout[ ]+[A-Za-z_][\w<>?]*[ ]+|\bis[ ]+[A-Za-z_][\w<>?]*[ ]+|\bcatch[ ]*\([ ]*[A-Za-z_][\w.]*[ ]+)([A-Za-z_]\w*)/g)) {
            if ((b[1] !== 'int') && (b[1] !== 'Int64')) region.bound.add (b[2]);
        }
        for (const b of masked[i].matchAll (/([A-Za-z_]\w*)[ ]*=>/g)) region.bound.add (b[1]);
        for (const b of masked[i].matchAll (/\(([^()]*)\)[ ]*=>/g)) {
            for (const p of b[1].split (',')) region.bound.add (p.trim ().split (/\s+/).pop () ?? '');
        }
    }
    return region;
}

// one region per method of a masked file (start = signature line, end = next signature), with params and
// declarations, plus `for` counters and bound names when `counters`
type CsharpRegion = { start: number, end: number, params: { [name: string]: string }, declarations: { line: number, name: string, type: string, value: string }[], lines: string[], [field: string]: any };
function csharpRegions (masked: string[], counters = false): CsharpRegion[] {
    const signatures = csharpMethodSignatures (masked);
    return signatures.map ((start, n) => {
        const end = (n + 1 < signatures.length) ? signatures[n + 1] : masked.length;
        return counters ? csharpCounterRegion (masked, start, end) : { start, end, params: csharpHelperSignatureParams (masked, start), declarations: csharpRegionDeclarations (masked, start, end), lines: masked };
    });
}

// the per-line pass driver: per method region (with `for` counters and bound names when `counters`),
// `rewrite` answers each body line's replacement or undefined
function csharpLinePass (content: string, counters: boolean, rewrite: (region: any, original: string, masked: string, line: number) => string | undefined): string {
    const lines = content.split ('\n');
    const masked = lines.map (csharpHelperMaskLine);
    let changed = false;
    for (const region of csharpRegions (masked, counters)) {
        for (let i = region.start + 1; i < region.end; i++) {
            const next = rewrite (region, lines[i], masked[i], i);
            if (next !== undefined) {
                lines[i] = next;
                masked[i] = csharpHelperMaskLine (next);
                changed = true;
            }
        }
    }
    return changed ? lines.join ('\n') : content;
}

// the declaration a line carries, or undefined: `Type name = value;` / `Type name;` /
// `Type name = new ...() {` (the initializer continues on the next lines)
function csharpHelperDeclarationOfLine (line: string): { type: string, name: string, value: string } | undefined {
    const match = CSHARP_HELPER_DECL_RE.exec (line);
    if (match === null) {
        const opened = CSHARP_HELPER_NEW_DECL_RE.exec (line);
        if (opened === null) {
            return undefined;
        }
        const type = opened[1].trim ();
        if (CSHARP_HELPER_KEYWORDS.includes (type.split (' ')[0]) || !CSHARP_HELPER_TYPE_RE.test (type)) {
            return undefined;
        }
        return { type, name: opened[2], value: 'new' };
    }
    const type = match[1].trim ();
    const name = match[2];
    if (CSHARP_HELPER_KEYWORDS.includes (type.split (' ')[0]) || !CSHARP_HELPER_TYPE_RE.test (type)) {
        return undefined;
    }
    return { type, name, value: (match[4] ?? '').trim () };
}

// hand-written ws cache fields declared `IDictionary<string, object>` (cs/ccxt/base/Exchange.Options.cs);
// (orderbooks reads go through getOrderBook); a field may still be null, so reads keep a null test
const CSHARP_WS_CACHE_DICT_FIELDS = [ 'balance', 'tickers', 'fundingRates', 'bidsasks', 'trades', 'ohlcvs' ];

// inOp-only receivers: further hand-written base dictionaries (Exchange.Options.cs, ws/Exchange.WsBridge.cs)
// and the ws client's maps (ws/Client.cs); InOp's IDictionary branches answer ContainsKey for each
const CSHARP_INOP_DICT_FIELDS: { [name: string]: string } = {
    'orderbooks': 'IDictionary<string, object>', 'markets_by_id': 'IDictionary<string, object>',
    'timeframes': 'Dictionary<string, object>', 'has': 'Dictionary<string, object>',
    'options': 'ConcurrentDictionary<string, object>', 'clients': 'ConcurrentDictionary<string, WebSocketClient>',
    'markets': 'IDictionary<string, object>', 'currencies_by_id': 'IDictionary<string, object>',
    'outcomes': 'IDictionary<string, object>', 'outcomes_by_id': 'IDictionary<string, object>',
    'events': 'IDictionary<string, object>', 'events_by_slug': 'IDictionary<string, object>',
}
const CSHARP_WS_CLIENT_MAP_RE = /^([A-Za-z_]\w*)\.(subscriptions|futures)$/
const CSHARP_WS_CLIENT_MAPS: { [name: string]: string } = { 'subscriptions': 'IDictionary<string, object>', 'futures': 'IDictionary<string, Future>' }

// `client.subscriptions|futures` where `client` is a `WebSocketClient` parameter or a local bound once
// by `var client = this.client(...)` (never null) and never rebound in the method
function csharpInOpReceiverType (region: CsharpRegion, name: string, line: number): { type: string, kind: string, value: string } | undefined {
    if (name.startsWith ('this.')) {
        const type = CSHARP_INOP_DICT_FIELDS[name.slice (5)];
        return (type === undefined) ? undefined : { type, kind: 'field', value: '' };
    }
    const member = CSHARP_WS_CLIENT_MAP_RE.exec (name);
    if (member === null) {
        return undefined;
    }
    const client = member[1];
    const writes = region.lines.filter ((l, k) => (k > region.start) && (k < region.end)
        && new RegExp ('(?<![\\w.])' + client + '[ ]*=[^=>]').test (l));
    const bound = writes.filter ((l) => new RegExp ('^[ ]*var[ ]+' + client + '[ ]*=[ ]*this\\.client\\(').test (l));
    const isParam = region.params[client] === 'WebSocketClient';
    const local = region.declarations.some ((d) => d.name === client);
    if (local || !((isParam && writes.length === 0) || (!isParam && writes.length === 1 && bound.length === 1
        && region.lines.findIndex ((l, k) => (k > region.start) && bound.includes (l)) < line))) {
        return undefined;
    }
    return { type: CSHARP_WS_CLIENT_MAPS[member[2]], kind: 'field', value: '' };
}

// the C# type the emitted text declares for `name` at `line`: a local declared before the read,
// else a parameter of the enclosing signature
function csharpHelperReceiverType (region: CsharpRegion, name: string, line: number, params: { [name: string]: string }): { type: string, kind: string, value: string } | undefined {
    if (name.startsWith ('this.')) {
        return CSHARP_WS_CACHE_DICT_FIELDS.includes (name.slice (5)) ? { type: 'IDictionary<string, object>', kind: 'field', value: '' } : undefined;
    }
    const all = region.declarations.filter ((d) => d.name === name);
    const types = [];
    for (const declaration of all) {
        if (!types.includes (declaration.type)) types.push (declaration.type);
    }
    if (types.length > 1) {
        return undefined; // the read may sit behind either binding
    }
    const declarations = all.filter ((d) => d.line < line);
    if (declarations.length > 0) {
        const last = declarations[declarations.length - 1];
        return { type: last.type, kind: 'local', value: last.value };
    }
    if (all.length > 0) {
        return undefined; // bound only after the read: not the binding the read uses
    }
    if (params[name] !== undefined) {
        return { type: params[name], kind: 'param', value: '' };
    }
    return undefined;
}

// inOp operands only: the one declaration of `name` whose block is still open at `line`, for a
// method that rebinds the name with other types in sibling blocks (nested rebinding is CS0136)
function csharpInOpScopedLocal (region: CsharpRegion, name: string, line: number): { type: string, kind: string, value: string, nonNull: boolean } | undefined {
    if (!/^[A-Za-z_]\w*$/.test (name) || (region.params[name] !== undefined)) {
        return undefined;
    }
    const open = region.declarations.filter ((d) => (d.name === name) && (d.line < line)).filter ((d) => {
        let depth = 0;
        for (let k = d.line + 1; k < line; k++) {
            for (const ch of region.lines[k]) {
                if (ch === '{') depth++;
                if ((ch === '}') && (--depth < 0)) return false;
            }
        }
        return true;
    });
    return (open.length === 1) ? { type: open[0].type, kind: 'local', value: open[0].value, nonNull: false } : undefined;
}

// whether the value a local holds at `line` can be null: only a freshly constructed initializer
// that nothing has reassigned is provably non-null
function csharpHelperLocalIsNonNull (region: CsharpRegion, name: string, line: number, value: string): boolean {
    if (!/^new\b/.test (value)) {
        return false;
    }
    return !region.lines.some ((maskedLine, i) => (i > region.start) && (i < line)
        && new RegExp ('^[ ]*' + name + '[ ]*=[^=]').test (maskedLine));
}

// each helper call `re` matches on the masked line: `visit (start, end, argument)`, or for `pair` calls
// of exactly two arguments `visit (start, end, leftMask, rightMask, rightText, leftText)`
function csharpHelperCalls (original: string, masked: string, re: RegExp, pair: boolean, visit: (start: number, end: number, name: string, keyMask: string, keyText: string, leftText: string) => void) {
    let match;
    while ((match = re.exec (masked)) !== null) {
        const open = match.index + match[0].length - 1;
        const close = csharpHelperCallEnd (masked, open);
        if (close === undefined) continue;
        if (!pair) {
            visit (match.index, close + 1, masked.substring (open + 1, close).trim (), '', '', '');
            continue;
        }
        const comma = csharpHelperTopLevelComma (masked, open, close);
        if ((comma === undefined) || (csharpHelperTopLevelComma (masked, comma, close) !== undefined)) continue;
        visit (match.index, close + 1, masked.substring (open + 1, comma).trim (), masked.substring (comma + 1, close).trim (), original.substring (comma + 1, close).trim (), original.substring (open + 1, comma).trim ());
    }
}

// rewrite every proven helper call on one line; offsets are taken from the mask, the emitted text
// from the original line
function csharpHelperRewriteLine (original: string, masked: string, takeType, takeKeyType, takeIndexType, takeNullableKeyType = (k) => false, takeInOpType = (n) => undefined, objectNull = false, takeObjectKey = (k) => false, keyName = () => undefined): string | undefined {
    const edits = [];
    csharpHelperCalls (original, masked, /getArrayLength[ ]*\(/g, false, (start, end, name) => {
        // the `IList<object> cache` property of a ws order book (cs/ccxt/ws/OrderBook.cs)
        if (CSHARP_ORDERBOOK_CACHE_RE.test (name)) {
            edits.push ({ start, end, text: `(${name}?.Count ?? 0)` });
            return;
        }
        if (!/^[A-Za-z_]\w*$/.test (name)) return;
        const receiver = takeType (name);
        if (receiver === undefined) return;
        const member = CSHARP_DECLARED_COUNT_TYPES.some ((p) => receiver.type.startsWith (p)) ? 'Count'
            : (CSHARP_DECLARED_LENGTH_TYPES.includes (receiver.type) ? 'Length' : undefined);
        if (member === undefined) return;
        edits.push ({ start, end, text: `(${name}?.${member} ?? 0)` });
    });
    csharpHelperCalls (original, masked, /(?<![A-Za-z_])inOp[ ]*\(/g, true, (start, end, name, keyMask, keyText) => {
        if (!/^(?:this\.)?[A-Za-z_]\w*$/.test (name) && !CSHARP_WS_CLIENT_MAP_RE.test (name)) return;
        const receiver = takeType (name) ?? takeInOpType (name);
        if (receiver === undefined) return;
        const isDict = CSHARP_DECLARED_DICT_TYPES.some ((p) => receiver.type.startsWith (p));
        const isList = CSHARP_DECLARED_LIST_TYPES.includes (receiver.type) || WS_CACHE_CLASSES.test (receiver.type);
        if (!isDict && !isList) return;
        const nullableKey = takeNullableKeyType (keyMask, true);
        if (!nullableKey && !takeKeyType (keyMask, true)) {
            // an `object` key: InOp's IDictionary<string, object> branch answers false for a non-string key;
            // other dictionaries cast the key and throw
            if (!takeObjectKey (keyMask)) return;
            const nonNullReceiver = (receiver.kind === 'local' && receiver.nonNull) || (receiver.kind === 'param' && receiver.paramsBag);
            const receiverTest = nonNullReceiver ? '' : `${name} != null && `;
            const stringKey = keyName ();
            if (!CSHARP_DECLARED_OBJECT_DICT_TYPES.includes (receiver.type.replace (/\s+/g, '')) || (stringKey === undefined)) return;
            edits.push ({ start, end, text: `(${receiverTest}${keyText} is string ${stringKey} && ${name}.ContainsKey(${stringKey}))` });
            return;
        }
        const call = `${name}.${isDict ? 'ContainsKey' : 'Contains'}(${keyText})`;
        const guarded = nullableKey || (receiver.type.endsWith ('?')
            || (receiver.kind === 'param' && !receiver.paramsBag)
            || (receiver.kind === 'local' && !receiver.nonNull)
            || (receiver.kind === 'field'));
        const nullTest = nullableKey ? `${name} != null && ${keyText} != null` : `${name} != null`;
        edits.push ({ start, end, text: guarded ? `(${nullTest} && ${call})` : call });
    });
    csharpHelperCalls (original, masked, /(?<![A-Za-z_.])getValue[ ]*\(/g, true, (start, end, name, keyMask, keyText) => {
        if (!/^(?:this\.)?[A-Za-z_]\w*$/.test (name)) return;
        const receiver = takeType (name);
        if (receiver === undefined) return;
        // the helper's IList<object> branch: an index at or past Count reads null, a negative one
        // throws in both forms; only an `int` local or a non-negative int literal is a C# index
        if (CSHARP_DECLARED_LIST_TYPES.includes (receiver.type) || (receiver.type === 'List<string>')) {
            if (!(/^\d{1,9}$/.test (keyMask) || takeIndexType (keyMask))) return;
            edits.push ({ start, end, text: `(${name} != null && ${keyText} < ${name}.Count ? ${name}[${keyText}] : null)` });
            return;
        }
        // the helper's dictionary branch hands back the boxed value; a value-typed dictionary
        // (int/Int64/double) cannot join the `: null` branch, so only object-valued dictionaries
        if (!CSHARP_DECLARED_OBJECT_DICT_TYPES.includes (receiver.type.replace (/\s+/g, ''))) return;
        // a `string?` key: the helper's null-key test is kept, so a null key reads null
        const nullableValueKey = takeNullableKeyType (keyMask);
        if (!nullableValueKey && !takeKeyType (keyMask)) return;
        const valueNullTest = nullableValueKey ? `${name} != null && ${keyText} != null` : `${name} != null`;
        edits.push ({ start, end, text: `(${valueNullTest} && ${name}.ContainsKey(${keyText}) ? ${name}[${keyText}] : null)` });
    });
    csharpHelperOperatorEdits (original, masked, takeType, edits, objectNull);
    if (edits.length === 0) {
        return undefined;
    }
    let out = original;
    for (const edit of edits.sort ((a, b) => b.start - a.start)) {
        out = out.substring (0, edit.start) + edit.text + out.substring (edit.end);
    }
    return out;
}

// declared C# kinds an operator rule may read: the value the emitted declaration holds
const CSHARP_OPERATOR_STRING_TYPES = [ 'string', 'string?' ];
const CSHARP_OPERATOR_NULLABLE_TYPES = [ 'string', 'string?', 'Int64?', 'long?', 'int?', 'double?', 'bool?' ];
const NATIVE_MARKET_KEY_READ_RE = /^\((?:([A-Za-z_]\w*) != null && )?([A-Za-z_]\w*)\.ContainsKey\("(\w+)"\) \? \2\["\3"\] : null\)$/;
const NATIVE_MARKET_ROW_CALL_RE = /^this\.(?:market|safeMarket|safeMarketStructure|parseMarket)\(/;
const CSHARP_OPERATOR_BOOL_TYPES = [ 'bool', 'bool?' ];
const CSHARP_OPERATOR_INTEGER_TYPES = [ 'int', 'Int64', 'long' ];
const CSHARP_OPERATOR_NUMERIC_TYPES = [ 'int', 'Int64', 'long', 'double' ];
const CSHARP_OPERATOR_NULLABLE_INTEGER_TYPES = [ 'Int64?', 'long?', 'int?' ];
const CSHARP_OPERATOR_NULLABLE_NUMERIC_TYPES = [ 'Int64?', 'long?', 'int?', 'double?' ];
const CSHARP_OPERATOR_TOKENS = { isGreaterThan: '>', isGreaterThanOrEqual: '>=', isLessThan: '<', isLessThanOrEqual: '<=' };

// hand-written base members an operator rule may read by name: `Int64? precisionMode`
// (Exchange.Options.cs) and the `public static int` counting-mode constants (Exchange.Number.cs)
const CSHARP_OPERATOR_FIELD_TYPES: { [name: string]: string } = {
    'this.precisionMode': 'Int64?', 'DECIMAL_PLACES': 'int', 'SIGNIFICANT_DIGITS': 'int', 'TICK_SIZE': 'int',
};

// the kind of one printed operand: a string / numeric literal, null, or a name the emitted
// text declares (its declared type); undefined for every other expression
function csharpOperatorOperand (maskedArg: string, originalArg: string, takeType) {
    if (/^"[ ]*"$/.test (maskedArg) && /^"(?:[^"\\]|\\.)*"$/.test (originalArg)) {
        return { kind: 'string-literal' };
    }
    if (maskedArg === 'null') {
        return { kind: 'null' };
    }
    if ((maskedArg === 'true') || (maskedArg === 'false')) {
        return { kind: 'bool-literal' };
    }
    if (/^-?\d{1,15}$/.test (maskedArg)) {
        return { kind: 'integer-literal' };
    }
    if (/^-?\d+\.\d+$/.test (maskedArg)) {
        return { kind: 'double-literal' };
    }
    // `client.url` on a name declared `WebSocketClient`: the field is a plain `string`
    const clientUrl = /^([A-Za-z_]\w*)\.url$/.exec (maskedArg);
    if (clientUrl !== null) {
        const owner = takeType (clientUrl[1]);
        return ((owner !== undefined) && (owner.type === 'WebSocketClient')) ? { kind: 'name', type: 'string' } : undefined;
    }
    // a whole base `this.safeString(..)` / `this.safeInteger(..)` call: the accessor returns string? / Int64?
    const safeCall = /^this\.(safeString2?|safeInteger2?)\(/.exec (maskedArg);
    if ((safeCall !== null) && (csharpHelperCallEnd (maskedArg, safeCall[0].length - 1) === maskedArg.length - 1)) {
        return { kind: 'name', type: safeCall[1].startsWith ('safeString') ? 'string?' : 'Int64?' };
    }
    const field = CSHARP_OPERATOR_FIELD_TYPES[maskedArg];
    if (field !== undefined) {
        return { kind: 'name', type: field };
    }
    if (!/^[A-Za-z_]\w*$/.test (maskedArg) || (maskedArg === 'null')) {
        return undefined;
    }
    const receiver = takeType (maskedArg);
    return (receiver === undefined) ? undefined : { kind: 'name', type: receiver.type };
}

// `isEqual(a, b)` -> `(a == b)` and `isGreaterThan(a, b)` & co -> the operator, when the emitted
// declarations make the C# operator compute the helper's answer for every value the operands
// can hold (a null / NaN operand whose helper branch differs keeps the helper)
function csharpNativeOperatorText (helper: string, left, right, leftText: string, rightText: string, objectNull: boolean): string | undefined {
    const isName = (o, types) => (o.kind === 'name') && types.includes (o.type);
    if (helper === 'isEqual') {
        // string ordinal equality, null on either side answering like isEqual's null branch
        const stringPair = (isName (left, CSHARP_OPERATOR_STRING_TYPES) && ((right.kind === 'string-literal') || isName (right, CSHARP_OPERATOR_STRING_TYPES)))
            || (isName (right, CSHARP_OPERATOR_STRING_TYPES) && (left.kind === 'string-literal'));
        // an `object` name is null only for the null box, which is isEqual's both-null branch
        const nullableName = (o) => isName (o, CSHARP_OPERATOR_NULLABLE_TYPES) || (objectNull && isName (o, [ 'object' ]));
        const nullTest = (nullableName (left) && (right.kind === 'null')) || (nullableName (right) && (left.kind === 'null'));
        // bool equality: a null `bool?` differs from both literals, like isEqual's null branch
        const boolPair = (isName (left, CSHARP_OPERATOR_BOOL_TYPES) && (right.kind === 'bool-literal'))
            || (isName (right, CSHARP_OPERATOR_BOOL_TYPES) && (left.kind === 'bool-literal'));
        // integers compare through Convert.ToInt64 in isEqual: the same value comparison
        // (a nullable integer: null equals only null in both, the lifted `==`)
        const integer = (o) => isName (o, CSHARP_OPERATOR_INTEGER_TYPES) || isName (o, CSHARP_OPERATOR_NULLABLE_INTEGER_TYPES) || (o.kind === 'integer-literal');
        const integerPair = integer (left) && integer (right)
            && ((left.kind === 'name') || (right.kind === 'name'));
        if (stringPair || nullTest || boolPair || integerPair) {
            return `(${leftText} == ${rightText})`;
        }
        return objectNull ? csharpStringConstantPattern (left, right, leftText, rightText) : undefined;
    }
    const token = CSHARP_OPERATOR_TOKENS[helper];
    if (token === undefined) {
        return undefined;
    }
    const numericLiteral = (o) => (o.kind === 'integer-literal') || (o.kind === 'double-literal');
    const plain = (o) => isName (o, CSHARP_OPERATOR_NUMERIC_TYPES) || numericLiteral (o);
    if ((left.kind !== 'name') && (right.kind !== 'name')) {
        return undefined;
    }
    const integral = (o) => isName (o, CSHARP_OPERATOR_INTEGER_TYPES) || (o.kind === 'integer-literal');
    if (integral (left) && integral (right)) {
        return `(${leftText} ${token} ${rightText})`;
    }
    // `>` / `>=`: the helper answers false for a null left (isEqual(null, x) is false too) and for a
    // NaN operand, as the lifted / IEEE operator does; `<` / `<=` answer true there, so they stay.
    // Two names must share a kind (Int64 vs double compares exactly only through a literal), and an
    // `int` left meets only integers (isEqual's `(int)b` cast of a double box answers false)
    if ((token === '>') || (token === '>=')) {
        const leftOk = plain (left) || isName (left, CSHARP_OPERATOR_NULLABLE_NUMERIC_TYPES);
        const bothNames = (left.kind === 'name') && (right.kind === 'name');
        const leftBase = (left.kind === 'name') ? left.type.replace ('?', '').replace ('long', 'Int64') : '';
        const rightBase = (right.kind === 'name') ? right.type.replace ('long', 'Int64') : '';
        const sameKind = !bothNames || (leftBase === rightBase) || ((leftBase !== 'double') && (rightBase !== 'double'));
        const intLeft = (leftBase === 'int') && !integral (right);
        if (leftOk && plain (right) && sameKind && !intLeft) {
            return `(${leftText} ${token} ${rightText})`;
        }
    }
    return undefined;
}

// `var x = V[N];` / `var x = ((IList<object>) V)[N];` with `V` declared `IList<object>`: the one
// binding of `x` in the method, so its static type is `object` (the list's element type)
function csharpVarObjectElementLocal (region: CsharpRegion, name: string, line: number): { type: string, kind: string, value: string } | undefined {
    if (!/^[A-Za-z_]\w*$/.test (name) || (region.params[name] !== undefined) || region.declarations.some ((d) => d.name === name)) {
        return undefined;
    }
    const element = new RegExp ('^[ ]*var[ ]+' + name + '[ ]*=[ ]*(?:([A-Za-z_]\\w*)|\\(\\(IList<object>\\)[ ]*([A-Za-z_]\\w*)\\))\\[\\d+\\];[ ]*$');
    const binding = new RegExp ('[\\w>?\\]][ ]+' + name + '\\b(?![ ]*\\()|\\b(?:out|ref)[ ]+' + name + '\\b');
    let found = undefined;
    for (let k = region.start + 1; k < region.end; k++) {
        if (/^[ ]*(?:\*|\/\*)/.test (region.lines[k]) || !binding.test (region.lines[k])) continue;
        const m = element.exec (region.lines[k]);
        if ((m === null) || (found !== undefined)) return undefined;
        found = { line: k, list: m[1] ?? m[2], cast: m[1] === undefined };
    }
    if ((found === undefined) || (found.line >= line)) {
        return undefined;
    }
    const list = csharpHelperReceiverType (region, found.list, found.line, region.params);
    if (!found.cast && ((list === undefined) || (list.type !== 'IList<object>')) && !csharpVarListOfObjectCall (region, found.list, found.line)) {
        return undefined;
    }
    return { type: 'object', kind: 'local', value: '' };
}

// `var V = [await ]this.m(...);` where the file declares `m` only as returning `List<object>`
function csharpVarListOfObjectCall (region: CsharpRegion, name: string, line: number): boolean {
    const call = new RegExp ('^[ ]*var[ ]+' + name + '[ ]*=[ ]*(?:await[ ]+)?this\\.([A-Za-z_]\\w*)\\(');
    const m = region.lines.slice (region.start + 1, line).map ((l) => call.exec (l)).find ((x) => x !== null);
    if (m === undefined) return false;
    const binds = region.lines.filter ((l, k) => (k > region.start) && (k < region.end) && new RegExp ('(?<![\\w.])' + name + '\\b[ ]*=[^=>]').test (l));
    if (binds.length !== 1) return false;
    const signature = new RegExp ('^[ ]{4}(?:public|private|protected|internal)\\b.*[ ]([\\w<>,.?]+)[ ]+' + m[1] + '\\(');
    const returns = region.lines.map ((l) => signature.exec (l)).filter ((s) => s !== null).map ((s) => s[1]);
    return (returns.length > 0) && returns.every ((t) => (t === 'Task<List<object>>') || (t === 'List<object>'));
}

// `isEqual(x, "lit")` on an object/string name is true only for a string box equal to the literal
// (null and other boxes answer false), which is the constant pattern `x is "lit"`; a literal that
// Double.TryParse could read would reach isEqual's numeric branch for a double box, so it keeps the helper
function csharpStringConstantPattern (left, right, leftText: string, rightText: string): string | undefined {
    const pair = (name, nameText: string, literal, literalText: string) => {
        // a bool literal: isEqual is true only for the same bool box (isNumber(bool) is false)
        if ((name.kind === 'name') && (name.type === 'object') && (literal.kind === 'bool-literal')) return `(${nameText} is ${literalText})`;
        if ((name.kind !== 'name') || ![ 'object', 'string', 'string?' ].includes (name.type) || (literal.kind !== 'string-literal')) return undefined;
        const body = literalText.slice (1, -1);
        if (/[0-9\\]/.test (body) || /nan|inf|\u221e/i.test (body)) return undefined;
        return `(${nameText} is ${literalText})`;
    };
    return pair (left, leftText, right, rightText) ?? pair (right, rightText, left, leftText);
}

// `(book as ccxt.pro.OrderBook).cache`: the book's `IList<object> cache` property
const CSHARP_ORDERBOOK_CACHE_RE = /^\([A-Za-z_]\w* as ccxt\.pro\.OrderBook\)\.cache$/;

// `object x = (book as ccxt.pro.OrderBook).cache;` never reassigned in its method holds the
// property's `IList<object>`: declare it so, so its length / element reads print natively
export function retypeOrderBookCacheLocals (content: string): string {
    const decl = /^([ ]*)object ([A-Za-z_]\w*) = (\([A-Za-z_]\w* as ccxt\.pro\.OrderBook\)\.cache);[ ]*$/;
    if (!content.includes (' as ccxt.pro.OrderBook).cache;')) {
        return content;
    }
    const lines = content.split ('\n');
    const masked = lines.map (csharpHelperMaskLine);
    let changed = false;
    for (let i = 0; i < lines.length; i++) {
        const m = decl.exec (lines[i]);
        if (m === null) continue;
        // the enclosing member: class members sit at 4 spaces with an access modifier
        const member = /^[ ]{4}(?:public|private|protected|internal)\b/;
        let start = i;
        while ((start > 0) && !member.test (masked[start])) start--;
        let end = i + 1;
        while ((end < lines.length) && !member.test (masked[end])) end++;
        const name = m[2];
        const write = new RegExp ('(?<![\\w.])' + name + '[ ]*(=[^=>]|\\+=|-=|\\?\\?=|\\+\\+|--)|\\b(ref|out)[ ]+' + name + '\\b|[A-Za-z_>\\]?][ ]+' + name + '[ ]*[=;]');
        if (masked.some ((l, k) => (k > start) && (k < end) && (k !== i) && write.test (l))) continue;
        lines[i] = `${m[1]}IList<object> ${name} = ${m[3]};`;
        changed = true;
    }
    return changed ? lines.join ('\n') : content;
}

// a line that may carry a call one of the rewrites above takes
const CSHARP_HELPER_LINE_RE = /getArrayLength|inOp|getValue|isEqual|isGreaterThan|isLessThan|isTrue/;

// the operator helper calls of one line whose operands the emitted declarations prove
function csharpHelperOperatorEdits (original: string, masked: string, takeType, edits, objectNull: boolean) {
    csharpHelperCalls (original, masked, /(?<![A-Za-z0-9_.])(isEqual|isGreaterThan|isGreaterThanOrEqual|isLessThan|isLessThanOrEqual)\(/g, true, (start, end, leftMask, rightMask, rightText, leftText) => {
        if (edits.some ((e) => (e.start < end) && (start < e.end))) return;
        const left = csharpOperatorOperand (leftMask, leftText, takeType);
        const right = csharpOperatorOperand (rightMask, rightText, takeType);
        if ((left === undefined) || (right === undefined)) return;
        const helper = masked.substring (start).split (/\W/)[0];
        const text = csharpNativeOperatorText (helper, left, right, leftText, rightText, objectNull) ?? csharpNullableIntegerComparisonText (helper, left, right, leftText, rightText);
        if (text !== undefined) {
            edits.push ({ start, end, text });
        }
    });
}

// the index of the `)` closing the call whose `(` sits at `open`
function csharpHelperCallEnd (line: string, open: number): number | undefined {
    const close = csharpMatchingClose (line, open);
    return (close === -1) ? undefined : close;
}

// the index of the first comma at the argument level between `open` and `close`
function csharpHelperTopLevelComma (line: string, open: number, close: number): number | undefined {
    let depth = 0;
    for (let i = open + 1; i < close; i++) {
        const ch = line[i];
        if ((ch === '(') || (ch === '[') || (ch === '{')) depth++;
        if ((ch === ')') || (ch === ']') || (ch === '}')) depth--;
        if ((ch === ',') && (depth === 0)) return i;
    }
    return undefined;
}

// `getArrayLength(x)` -> `(x?.Count ?? 0)` / `(x?.Length ?? 0)`, `inOp(x, k)` ->
// `x.ContainsKey(k)` / `x.Contains(k)` (with a null test where the emitted declaration allows a
// null receiver) for every receiver the emitted signature / declarations type as a collection
function nativeDeclaredHelperCallsBase (content: string, objectNull: boolean): string {
    if (!CSHARP_HELPER_LINE_RE.test (content)) {
        return csharpNativeArithmetic (csharpDeclaredReceiverHelperCalls (content));
    }
    const lines = content.split ('\n');
    const masked = lines.map (csharpHelperMaskLine);
    const regions = csharpRegions (masked);
    if (regions.length === 0) {
        return content;
    }
    const regionOfLine = (line: number) => regions.reduce ((current, region) => (region.start <= line) ? region : current, regions[0]);
    let changed = false;
    // pattern variables for `object` keys: unique per file, since `else if` nests them in one scope
    let stringKeys = Math.max (-1, ...Array.from (content.matchAll (/\binOpKey(\d+)\b/g), (m) => Number (m[1]))) + 1;
    const out = lines.map ((line, i) => {
        if (!CSHARP_HELPER_LINE_RE.test (line)) {
            return line;
        }
        const region = regionOfLine (i);
        if ((i <= region.start) || (i >= region.end)) {
            return line;
        }
        const takeType = (name) => {
            const receiver = csharpHelperReceiverType (region, name, i, region.params) ?? csharpVarObjectElementLocal (region, name, i);
            if (receiver === undefined) {
                return undefined;
            }
            if (receiver.kind === 'local') {
                receiver.nonNull = csharpHelperLocalIsNonNull (region, name, i, receiver.value);
            }
            if (receiver.kind === 'param') {
                const bag = new RegExp ('^[ ]*' + name + '[ ]*\\?\\?=');
                receiver.paramsBag = masked.some ((maskedLine, k) => (k > region.start) && (k < i) && bag.test (maskedLine));
            }
            return receiver;
        };
        // an `int` index: every binding of the name in the method is an `int` local or
        // `for (int name = ...)` header, so the read compiles as a List indexer argument
        const takeIndexType = (keyMask) => {
            if (!/^[A-Za-z_]\w*$/.test (keyMask) || (region.params[keyMask] !== undefined)) return false;
            const bound = region.declarations.filter ((d) => d.name === keyMask);
            if (bound.some ((d) => d.type !== 'int')) return false;
            // any other typed binding (foreach / lambda / catch / out variable) keeps the helper
            const typed = new RegExp ('([A-Za-z_][\\w<>?\\[\\]]*)[ ]+' + keyMask + '\\b(?=[ ]*(?:=[^=]|;|\\)|,|in\\b))', 'g');
            for (let k = region.start + 1; k < region.end; k++) {
                for (const m of masked[k].matchAll (typed)) {
                    if (![ 'int', 'return', 'throw', 'else', 'case', 'await', 'new', 'in' ].includes (m[1])) return false;
                }
            }
            const header = new RegExp ('\\bfor[ ]*\\([ ]*int[ ]+' + keyMask + '[ ]*=');
            const loops = masked.some ((maskedLine, k) => (k > region.start) && (k <= i) && header.test (maskedLine));
            return loops || bound.some ((d) => d.line < i);
        };
        // the declared type of a key name (`scoped`: or of its one declaration still open at the read)
        const keyType = (keyMask: string, scoped: boolean) => /^[A-Za-z_]\w*$/.test (keyMask)
            ? (csharpHelperReceiverType (region, keyMask, i, region.params) ?? (scoped ? csharpInOpScopedLocal (region, keyMask, i) : undefined))?.type : undefined;
        // a string literal is never null
        const takeKeyType = (keyMask, scoped = false) => keyMask.startsWith ('"') || (keyType (keyMask, scoped) === 'string');
        // a `string?` local/param key: a ws cache field read tests it for null first, as the helper does
        const takeNullableKeyType = (keyMask, scoped = false) => keyType (keyMask, scoped) === 'string?';
        const takeObjectKey = (keyMask) => keyType (keyMask, true) === 'object';
        const rewritten = csharpConstantEqualities (csharpHelperRewriteLine (line, masked[i], takeType, takeKeyType, takeIndexType, takeNullableKeyType, (name) => csharpInOpReceiverType (region, name, i) ?? csharpInOpScopedLocal (region, name, i), objectNull, takeObjectKey, () => `inOpKey${stringKeys++}`), line, takeType, objectNull, content);
        if (rewritten === undefined) {
            return line;
        }
        changed = true;
        return rewritten;
    });
    return csharpNativeArithmetic (csharpDeclaredReceiverHelperCalls (changed ? out.join ('\n') : content));
}

// `callDynamically(x, "append"|"getLimit", ...)` on a receiver whose C# declaration (the last one in
// the same member) or base field names a ws cache class binds the method that class declares
// (cs/ccxt/ws/ArrayCache.cs: `void append(object)`, `Int64? getLimit(object, object)`).
const WS_CACHE_CLASSES = /^(?:ccxt\.pro\.)?ArrayCache(?:ByTimestamp|BySymbolById|BySymbolBySide|ByOutcomeById)?\??$/
const WS_CACHE_FIELDS = [ 'this.orders', 'this.myTrades', 'this.liquidations' ]
const WS_CACHE_METHOD_ARITY: { [method: string]: number } = { 'append': 1, 'getLimit': 2 }
// any other receiver goes through the static BaseCache twin (same NRE for null/non-cache)
const WS_CACHE_STATIC_TWIN: { [method: string]: string } = { 'append': 'appendTo', 'getLimit': 'getLimitOf' }
const CSHARP_MEMBER_START_RE = /^    (?:public|private|protected|internal)\b/

function csharpWsCacheReceiverDeclared (lines: string[], lineIndex: number, receiver: string): boolean {
    if (WS_CACHE_FIELDS.includes (receiver)) {
        return true
    }
    const declaration = new RegExp ('^\\s*([A-Za-z_][\\w.]*\\??)\\s+' + receiver + '\\s*(?:=|;)')
    const paramDeclaration = new RegExp ('[(,]\\s*(ccxt\\.pro\\.ArrayCache\\w*)\\s+' + receiver + '\\s*[,)]')
    for (let i = lineIndex; i >= 0; i--) {
        const m = declaration.exec (lines[i])
        if (m) {
            return WS_CACHE_CLASSES.test (m[1])
        }
        if (CSHARP_MEMBER_START_RE.test (lines[i])) {
            const p = paramDeclaration.exec (lines[i])
            return p !== null && WS_CACHE_CLASSES.test (p[1])
        }
    }
    return false
}

export function nativeWsCacheCalls (content: string): string {
    const lines = content.split ('\n')
    const call = /callDynamically\(((?:this\.)?\w+), "(append|getLimit)", new object\[\] \{/g
    let changed = false
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        if (!line.includes ('callDynamically(')) {
            continue
        }
        let out = ''
        let cursor = 0
        call.lastIndex = 0
        let m
        while ((m = call.exec (line)) !== null) {
            const argsAt = m.index + m[0].length
            const argsEnd = csharpMatchingClose (line, argsAt - 1, '{', '}', '"\'')
            if (argsEnd < 0 || line[argsEnd + 1] !== ')') {
                continue
            }
            const args = line.slice (argsAt, argsEnd)
            if (csharpArgumentCount (args) !== WS_CACHE_METHOD_ARITY[m[2]]) {
                continue
            }
            const native = csharpWsCacheReceiverDeclared (lines, i, m[1])
                ? m[1] + '.' + m[2] + '(' + args.trim () + ')'
                : 'ccxt.pro.BaseCache.' + WS_CACHE_STATIC_TWIN[m[2]] + '(' + m[1] + ', ' + args.trim () + ')'
            out += line.slice (cursor, m.index) + native
            cursor = argsEnd + 2
            call.lastIndex = cursor
        }
        if (cursor > 0) {
            lines[i] = out + line.slice (cursor)
            changed = true
        }
    }
    return changed ? lines.join ('\n') : content
}

// watchOHLCVForSymbols' nested `{ symbol: { timeframe: OHLCV[] } }` map: no generated To*/From* pair,
// the hand-written ToOHLCVDict / FromOHLCVDict (Exchange.TranspileHelpers.cs) key on this type string
const OHLCV_DICT_TYPE = 'Dictionary<string, Dictionary<string, List<OHLCV>>>';

// core methods whose `Task<object>` return is rewritten to a typed `Task<T>` / `Task<List<T>>` (the
// `new T(item)` conversion moves from the PascalCase wrapper onto the core return path); a core
// feeding an untyped helper or reflective pagination stays object (no reverse From helper)
const TYPED_CORES: Record<string, string> = {
    'cancelAllContractOrders': 'List<Order>',
    'cancelAllOrders': 'List<Order>',
    'cancelAllOrdersAfter': 'Dictionary<string, object>',
    'cancelAllOrdersWs': 'List<Order>',
    'cancelAllSpotOrders': 'List<Order>',
    'cancelAllUtaOrders': 'List<Order>',
    'cancelContractOrder': 'Order',
    'cancelOrder': 'Order',
    'cancelOrderWithClientOrderId': 'Order',
    'cancelOrderWs': 'Order',
    // okx#cancelOrders omits request-only keys (clientOrderId[], trigger, …) before parseOrders
    'cancelOrders': 'List<Order>',
    'cancelOrdersForSymbols': 'List<Order>',
    'cancelOrdersWithClientOrderIds': 'List<Order>',
    'cancelOrdersWs': 'List<Order>',
    'cancelSpotOrder': 'Order',
    'cancelTwapOrder': 'Order',
    'cancelUnifiedOrder': 'Order',
    'cancelUtaOrder': 'Order',
    'cancelUtaOrders': 'List<Order>',
    'closePosition': 'Order',
    'createAmmOrder': 'PredictionOrder',
    'createApiKey': 'Dictionary<string, object>',
    'createContractOrder': 'Order',
    'createContractOrders': 'List<Order>',
    'createConvertTrade': 'Conversion',
    'createDepositAddress': 'DepositAddress',
    'createExtendedOrderRequest': 'Dictionary<string, object>',
    'createGiftCode': 'Dictionary<string, object>',
    'createLimitBuyOrder': 'Order',
    'createLimitBuyOrderWs': 'Order',
    'createLimitOrder': 'Order',
    'createLimitOrderWs': 'Order',
    'createLimitSellOrder': 'Order',
    'createLimitSellOrderWs': 'Order',
    'createMarketBuyOrder': 'Order',
    'createMarketBuyOrderWithCost': 'Order',
    'createMarketBuyOrderWs': 'Order',
    'createMarketOrder': 'Order',
    'createMarketOrderWithCost': 'Order',
    'createMarketOrderWithCostWs': 'Order',
    'createMarketOrderWs': 'Order',
    'createMarketSellOrder': 'Order',
    'createMarketSellOrderWithCost': 'Order',
    'createMarketSellOrderWs': 'Order',
    'createOrder': 'Order',
    'createOrderWithTakeProfitAndStopLoss': 'Order',
    'createOrderWithTakeProfitAndStopLossWs': 'Order',
    'createOrderWs': 'Order',
    'createOrderbookOrder': 'PredictionOrder',
    'createOrDeriveApiKey': 'Dictionary<string, object>',
    'createOrders': 'List<Order>',
    'createOrdersWs': 'List<Order>',
    'createPostOnlyOrder': 'Order',
    'createPostOnlyOrderWs': 'Order',
    'createReduceOnlyOrder': 'Order',
    'createReduceOnlyOrderWs': 'Order',
    'createSubAccount': 'Dictionary<string, object>',
    'createSpotOrder': 'Order',
    'createSpotOrders': 'List<Order>',
    'createStopLimitOrder': 'Order',
    'createStopLimitOrderWs': 'Order',
    'createStopLossOrder': 'Order',
    'createStopLossOrderWs': 'Order',
    'createStopMarketOrder': 'Order',
    'createStopMarketOrderWs': 'Order',
    'createStopOrder': 'Order',
    'createStopOrderWs': 'Order',
    'createSwapOrder': 'Order',
    'createTakeProfitOrder': 'Order',
    'createTakeProfitOrderWs': 'Order',
    'createTrailingAmountOrder': 'Order',
    'createTrailingAmountOrderWs': 'Order',
    'createTrailingPercentOrder': 'Order',
    'createTrailingPercentOrderWs': 'Order',
    'createTriggerOrder': 'Order',
    'createTriggerOrderWs': 'Order',
    'createTwapOrder': 'Order',
    'createUtaOrder': 'Order',
    'createUtaOrders': 'List<Order>',
    'createVault': 'Dictionary<string, object>',
    'editContractOrder': 'Order',
    'editLimitBuyOrder': 'Order',
    'editLimitOrder': 'Order',
    'editLimitSellOrder': 'Order',
    'editOrder': 'Order',
    'editOrderWithClientOrderId': 'Order',
    'editOrderWs': 'Order',
    'editOrders': 'List<Order>',
    'editSpotOrder': 'Order',
    'fetchADLRank': 'ADL',
    'fetchAccount': 'Account',
    // htx: every path is safeString(...) — the params override is stringified in TS too
    'fetchAccountIdByType': 'string',
    'fetchAccountPositions': 'List<Position>',
    'fetchAccounts': 'List<Account>',
    'fetchAccountSettings': 'Dictionary<string, object>',
    'fetchAccountsV2': 'List<Account>',
    'fetchAccountsV3': 'List<Account>',
    // parseAllGreeks() ends in filterByArray(results, 'symbol', symbols), whose `indexed`
    // parameter defaults to TRUE, so the runtime value is a symbol-keyed dict, not the
    // Greeks[] the TS annotation used to claim. AllGreeks is that dict.
    'fetchAllGreeks': 'AllGreeks',
    'fetchAmmOrders': 'List<PredictionOrder>',
    'fetchApiKey': 'Dictionary<string, object>',
    'fetchApiKeys': 'Dictionary<string, object>',
    // container families (Balances, Tickers, ...): consuming sites go through the reverse From* helper
    // (typeCores); setLeverage stays untyped (typing it would drop venue keys from the public return)
    'fetchBalance': 'Balances',
    'fetchBalanceWs': 'Balances',
    'fetchBidsAsks': 'Tickers',
    'fetchBorrowRate': 'Dictionary<string, object>',
    'fetchBorrowRateHistories': 'Dictionary<string, object>',
    'fetchBorrowRateHistory': 'List<Dictionary<string, object>>',
    'fetchBuilderApprovals': 'List<Dictionary<string, object>>',
    'fetchContractBalance': 'Balances',
    'fetchContractTickers': 'Tickers',
    'fetchCrossBorrowRates': 'CrossBorrowRates',
    'fetchCurrenciesFromCache': 'Dictionary<string, object>',
    // gemini: parseCurrencies dict, or `{}` when the web scrape is empty. Currencies
    // is reversible and Currency already has the extra bag, so the struct is lossless.
    'fetchCurrenciesFromWeb': 'Currencies',
    'fetchCurrency': 'Dictionary<string, object>',
    'fetchCurrencyById': 'Dictionary<string, object>',
    'fetchDepositMethodId': 'Dictionary<string, object>',
    'fetchDepositMethodIds': 'List<Dictionary<string, object>>',
    'fetchDepositWithdrawFees': 'DepositWithdrawFees',
    'fetchDydxAccount': 'Dictionary<string, object>',
    'fetchFundingIntervals': 'FundingRates',
    'fetchFundingLimits': 'Dictionary<string, object>',
    'fetchFundingRates': 'FundingRates',
    'fetchIsolatedBorrowRates': 'IsolatedBorrowRates',
    'fetchLatestBlockHeight': 'Int64',
    'fetchLeverages': 'Leverages',
    'fetchMarginModes': 'MarginModes',
    'fetchMarkPrices': 'Tickers',
    'fetchMarketsByTypeAndSubType': 'List<MarketInterface>',
    'fetchMarketsFromAPI': 'List<MarketInterface>',
    'fetchMarketsFromWeb': 'List<MarketInterface>',
    // bitstamp: publicGetMarkets returns a list of market dicts (cached). The
    // previous Dictionary wrapper was a runtime InvalidCastException.
    'fetchMarketsFromCache': 'List<Dictionary<string, object>>',
    // kraken: privatePostDepositMethods['result'] is a list of method dicts.
    'fetchDepositMethods': 'List<Dictionary<string, object>>',
    // mexc: both spot and (after wrapping the swap asset list) swap return an
    // account dict with a `balances` array.
    'fetchAccountHelper': 'Dictionary<string, object>',
    'fetchMarketsV1': 'List<MarketInterface>',
    'fetchMyDustTrades': 'List<Trade>',
    'fetchNetworkDepositAddress': 'Dictionary<string, object>',
    'fetchOpenInterests': 'OpenInterests',
    'fetchOrderBooks': 'OrderBooks',
    'fetchOutcome': 'Dictionary<string, object>',
    'fetchPaymentMethods': 'List<Dictionary<string, object>>',
    'fetchPortfolioDetails': 'List<Dictionary<string, object>>',
    'fetchPrivateDepositWithdrawFees': 'Dictionary<string, object>',
    'fetchPrivateTradingFee': 'Dictionary<string, object>',
    'fetchPrivateTransactionFees': 'Dictionary<string, object>',
    'fetchPublicDepositWithdrawFees': 'Dictionary<string, object>',
    'fetchPublicTradingFee': 'Dictionary<string, object>',
    'fetchPublicTransactionFees': 'Dictionary<string, object>',
    'fetchSpotTickers': 'Tickers',
    'fetchSwapAndFutureMarkets': 'List<MarketInterface>',
    'fetchTickers': 'Tickers',
    'fetchTickersV2': 'Tickers',
    'fetchTickersV3': 'Tickers',
    'fetchTickersWs': 'Tickers',
    'fetchBorrowInterest': 'List<BorrowInterest>',
    'fetchCanceledAndClosedOrders': 'List<Order>',
    'fetchCanceledOrders': 'List<Order>',
    'fetchClosedContractOrders': 'List<Order>',
    'fetchClosedOrder': 'Order',
    'fetchClosedOrders': 'List<Order>',
    'fetchClosedOrdersWs': 'List<Order>',
    'fetchClosedSpotOrders': 'List<Order>',
    'fetchContractDepositAddress': 'DepositAddress',
    'fetchContractDeposits': 'List<Transaction>',
    'fetchContractMarkets': 'List<MarketInterface>',
    'fetchContractOHLCV': 'List<OHLCV>',
    'fetchContractOrder': 'Order',
    'fetchContractOrders': 'List<Order>',
    'fetchContractOrdersByStatus': 'List<Order>',
    'fetchContractWithdrawals': 'List<Transaction>',
    'fetchConvertCurrencies': 'Currencies',
    'fetchConvertQuote': 'Conversion',
    'fetchConvertTrade': 'Conversion',
    'fetchConvertTradeHistory': 'List<Conversion>',
    'fetchCrossBorrowRate': 'CrossBorrowRate',
    'fetchDefaultMarkets': 'List<MarketInterface>',
    'fetchDeposit': 'Transaction',
    'fetchDepositAddress': 'DepositAddress',
    // parseDepositAddresses(indexed=true) returns a network-keyed dict on every venue;
    // the old List<DepositAddress> wrapper was a shape lie that threw at runtime
    'fetchDepositAddressesByNetwork': 'DepositAddresses',
    'fetchDepositAddressDefault': 'DepositAddress',
    'fetchDepositAddressSupplement': 'DepositAddress',
    'fetchDepositAddresses': 'List<DepositAddress>',
    // fetchDepositAddressesByNetwork stays untyped: indexed parseDepositAddresses() returns a dict
    'fetchDepositWithdrawFee': 'DepositWithdrawFee',
    'fetchDeposits': 'List<Transaction>',
    'fetchDepositsOrWithdrawalsHelper': 'List<Transaction>',
    'fetchDepositsWithdrawals': 'List<Transaction>',
    'fetchDepositsWs': 'List<Transaction>',
    'fetchDerivativesMarketLeverageTiers': 'List<LeverageTier>',
    'fetchDerivativesOpenInterestHistory': 'List<OpenInterest>',
    'fetchExtendedAccount': 'Dictionary<string, object>',
    'fetchFinancialBalance': 'Balances',
    'fetchFreeBalance': 'Balance',
    'fetchFundingHistory': 'List<FundingHistory>',
    'fetchFundingInterval': 'FundingRate',
    'fetchFundingRate': 'FundingRate',
    'fetchFundingRateHistory': 'List<FundingRateHistory>',
    'fetchFutureMarkets': 'List<MarketInterface>',
    'fetchGreeks': 'Greeks',
    'fetchHip3Markets': 'List<MarketInterface>',
    'fetchIndexOHLCV': 'List<OHLCV>',
    'fetchInverseSwapMarkets': 'List<MarketInterface>',
    'fetchIsolatedBorrowRate': 'IsolatedBorrowRate',
    'fetchLastPrices': 'LastPrices',
    'fetchLedger': 'List<LedgerEntry>',
    'fetchLedgerByEntries': 'List<LedgerEntry>',
    'fetchLedgerEntriesByIds': 'List<LedgerEntry>',
    'fetchLedgerEntry': 'LedgerEntry',
    'fetchLeverage': 'Leverage',
    // parseLeverageTiers returns a symbol-keyed dict with NO top-level `info`; the struct ctor
    // splats it (Helper.GetInfo yields null), so FromLeverageTiers inverts it exactly — the
    // consuming base site (fetchMarketLeverageTiers reads tiers[symbol]) is routed through it
    'fetchLeverageTiers': 'LeverageTiers',
    'fetchLiquidations': 'List<Liquidation>',
    'fetchLongShortRatio': 'LongShortRatio',
    'fetchLongShortRatioHistory': 'List<LongShortRatio>',
    'fetchMarginBalance': 'Balances',
    'fetchMarginAdjustmentHistory': 'List<MarginModification>',
    'fetchMarginMode': 'MarginMode',
    'fetchMarket': 'MarketInterface',
    'fetchMarketById': 'MarketInterface',
    'fetchMarkOHLCV': 'List<OHLCV>',
    'fetchMarkPrice': 'Ticker',
    'fetchMarketLeverageTiers': 'List<LeverageTier>',
    'fetchMarkets': 'List<MarketInterface>',
    'fetchMarketsByType': 'List<MarketInterface>',
    'fetchMarketsV2': 'List<MarketInterface>',
    'fetchMarketsV3': 'List<MarketInterface>',
    'fetchMarketsWs': 'List<MarketInterface>',
    'fetchMyBuys': 'List<Trade>',
    'fetchMyContractTrades': 'List<Trade>',
    'fetchMyLiquidations': 'List<Liquidation>',
    'fetchMySells': 'List<Trade>',
    'fetchMySpotTrades': 'List<Trade>',
    'fetchMyTrades': 'List<Trade>',
    'fetchMyTradesWs': 'List<Trade>',
    'fetchMyUtaTrades': 'List<Trade>',
    'fetchMySettlementHistory': 'List<Dictionary<string, object>>',
    'fetchOHLCV': 'List<OHLCV>',
    'fetchOHLCVWs': 'List<OHLCV>',
    'fetchL2OrderBook': 'OrderBook',
    'fetchL3OrderBook': 'OrderBookL3',
    'fetchNonce': 'Int64',
    'fetchOpenInterest': 'OpenInterest',
    'fetchOpenInterestHistory': 'List<OpenInterest>',
    'fetchOpenOrder': 'Order',
    'fetchOpenOrders': 'List<Order>',
    'fetchOpenOrdersV1': 'List<Order>',
    'fetchOpenOrdersV2': 'List<Order>',
    'fetchOpenOrdersWs': 'List<Order>',
    'fetchOpenSpotOrders': 'List<Order>',
    'fetchOpenSwapOrders': 'List<Order>',
    'fetchOption': 'Option',
    'fetchOptionChain': 'OptionChain',
    'fetchOptionMarkets': 'List<MarketInterface>',
    'fetchOptionUnderlyings': 'List<string>',
    'fetchOptionOHLCV': 'List<OHLCV>',
    'fetchOptionPositions': 'List<Position>',
    'fetchOrder': 'Order',
    'fetchOrderBook': 'OrderBook',
    'fetchOrderBookWs': 'OrderBook',
    'fetchOrderStatus': 'string',
    'fetchOrderClassic': 'Order',
    'fetchOrderDefault': 'Order',
    'fetchOrderSupplement': 'Order',
    'fetchOrderTrades': 'List<Trade>',
    'fetchOrderWithClientOrderId': 'Order',
    'fetchOrderWs': 'Order',
    'fetchOrders': 'List<Order>',
    'fetchOrdersByIds': 'List<Order>',
    'fetchOrdersByState': 'List<Order>',
    'fetchOrdersByStates': 'List<Order>',
    'fetchOrdersByStatus': 'List<Order>',
    'fetchOrdersByStatusWs': 'List<Order>',
    'fetchOrdersByType': 'List<Order>',
    'fetchOrdersClassic': 'List<Order>',
    'fetchOrdersWithMethod': 'List<Order>',
    'fetchOrdersWs': 'List<Order>',
    'fetchOutcomes': 'Dictionary<string, object>',
    'fetchPartialBalance': 'Balance',
    'fetchPortfolios': 'List<Account>',
    'fetchPosition': 'Position',
    'fetchPositionADLRank': 'ADL',
    'fetchPositionHistory': 'List<Position>',
    'fetchPositionMode': 'PositionModeInfo',
    'fetchPositionWs': 'List<Position>',
    'fetchPositions': 'List<Position>',
    'fetchPositionsADLRank': 'List<ADL>',
    'fetchPositionsForSymbol': 'List<Position>',
    'fetchPositionsForSymbolWs': 'List<Position>',
    'fetchPositionsHistory': 'List<Position>',
    'fetchPositionsRisk': 'List<Position>',
    'fetchPositionsWs': 'List<Position>',
    'fetchPremiumIndexOHLCV': 'List<OHLCV>',
    'fetchRestOrderBookSafe': 'OrderBook',
    'fetchSettlementHistory': 'List<Dictionary<string, object>>',
    'fetchSettlements': 'List<PredictionSettlement>',
    'fetchSpotBalance': 'Balances',
    'fetchSpotMarkets': 'List<MarketInterface>',
    'fetchSpotOHLCV': 'List<OHLCV>',
    'fetchSpotOrder': 'Order',
    'fetchSpotOrderTrades': 'List<Trade>',
    'fetchSpotOrders': 'List<Order>',
    'fetchSpotOrdersByStates': 'List<Order>',
    'fetchSpotOrdersByStatus': 'List<Order>',
    'fetchStatus': 'Status',
    'fetchSwapBalance': 'Balances',
    'fetchSwapMarkets': 'List<MarketInterface>',
    'fetchTicker': 'Ticker',
    'fetchTicker2': 'Ticker',
    'fetchTickerV1': 'Ticker',
    'fetchTickerV1AndV2': 'Ticker',
    'fetchTickerV2': 'Ticker',
    'fetchTickerV3': 'Ticker',
    'fetchTickerWs': 'Ticker',
    'fetchTime': 'Int64',
    'fetchTotalBalance': 'Balance',
    'fetchTrades': 'List<Trade>',
    'fetchTradesWs': 'List<Trade>',
    'fetchTradingFee': 'TradingFeeInterface',
    // TradingFeeInterface.tiers (ts/src/base/types.ts) carries the cryptomus/onetrading
    // volume-tier schedule, so the TradingFees struct is now lossless for every venue.
    'fetchTradingFees': 'TradingFees',
    'fetchPrivateTradingFees': 'TradingFees',
    'fetchPublicTradingFees': 'TradingFees',
    'fetchQuote': 'Dictionary<string, object>',
    'fetchRawEventByTicker': 'Dictionary<string, object>',
    'fetchRawMarketById': 'Dictionary<string, object>',
    'fetchRawQuestionById': 'Dictionary<string, object>',
    'fetchRawTopicDetail': 'Dictionary<string, object>',
    'fetchTradeQuote': 'Dictionary<string, object>',
    'fetchTradingFeesWs': 'TradingFees',
    'fetchTradingLimits': 'Dictionary<string, object>',
    'fetchTradingLimitsById': 'Dictionary<string, object>',
    'fetchTransactionFee': 'Dictionary<string, object>',
    'fetchTransactionFees': 'Dictionary<string, object>',
    'fetchTransactions': 'List<Transaction>',
    'fetchTransactionsByType': 'List<Transaction>',
    // fetchTransactionsHelper stays untyped: dydx runs filterBy() over its result (VENUE_TYPED_CORES)
    'fetchTransactionsWithMethod': 'List<Transaction>',
    'fetchTransfer': 'TransferEntry',
    'fetchTransfers': 'List<TransferEntry>',
    'fetchUSDTMarkets': 'List<MarketInterface>',
    'fetchUnderlyingAssets': 'List<string>',
    'fetchUTAMarkets': 'List<MarketInterface>',
    'fetchUtaMarkets': 'List<MarketInterface>',
    'fetchUTAOHLCV': 'List<OHLCV>',
    'fetchUnifiedOrder': 'Order',
    'fetchUsedBalance': 'Balance',
    'fetchUtaBalance': 'Balances',
    'fetchUtaCanceledAndClosedOrders': 'List<Order>',
    'fetchUtaOrder': 'Order',
    'fetchUtaOrdersByStatus': 'List<Order>',
    'fetchVolatilityHistory': 'List<Dictionary<string, object>>',
    'fetchWallet': 'Dictionary<string, object>',
    'fetchWithdrawAddresses': 'List<Dictionary<string, object>>',
    'fetchWithdrawal': 'Transaction',
    'fetchWithdrawals': 'List<Transaction>',
    'fetchWithdrawalsWs': 'List<Transaction>',
    'fetchWithdrawalWhitelist': 'List<Dictionary<string, object>>',
    'setLeverage': 'Dictionary<string, object>',
    'setMargin': 'MarginModification',
    'setMarginMode': 'Dictionary<string, object>',
    'setPositionMode': 'Dictionary<string, object>',
    'transfer': 'TransferEntry',
    'transferBetweenMainAndSubAccount': 'TransferEntry',
    'transferBetweenSubAccounts': 'TransferEntry',
    'transferClassic': 'TransferEntry',
    'transferIn': 'TransferEntry',
    'transferOut': 'TransferEntry',
    'transferUta': 'TransferEntry',
    // watch* cores: To* materialises the snapshot the wrapper produced; names with consuming call
    // sites (watchTickers, watchOHLCVForSymbols, watchMarkPrices, watchFundingRates) or a cast-only
    // wrapper stay untyped
    'watchBalance': 'Balances',
    'watchBidsAsks': 'Tickers',
    'watchFundingRate': 'FundingRate',
    'watchFundingRatesForSymbols': 'FundingRates',
    'watchLiquidations': 'List<Liquidation>',
    'watchLiquidationsForSymbols': 'List<Liquidation>',
    'watchMarkPrice': 'Ticker',
    'watchMyLiquidations': 'List<Liquidation>',
    'watchMyLiquidationsForSymbols': 'List<Liquidation>',
    'watchMyTrades': 'List<Trade>',
    'watchMyTradesForSymbols': 'List<Trade>',
    'watchOHLCV': 'List<OHLCV>',
    'watchOHLCVForSymbols': OHLCV_DICT_TYPE,
    'watchOrders': 'List<Order>',
    'watchOrdersForSymbols': 'List<Order>',
    'watchPosition': 'Position',
    'watchPositionForSymbols': 'List<Position>',
    'watchPositions': 'List<Position>',
    'watchTicker': 'Ticker',
    'watchTrades': 'List<Trade>',
    'watchTradesForSymbols': 'List<Trade>',
    'watchUtaTickers': 'Tickers',
    'withdraw': 'Transaction',
    'withdrawWs': 'Transaction',
    // the ws container families below snapshot the live cache exactly as the wrapper's
    // `new Tickers(res)` / `new FundingRates(res)` did: the ctor re-materialises every row
    // into a fresh struct, so the caller never holds the live dictionary
    'watchTickers': 'Tickers',
    'watchMarkPrices': 'Tickers',
    'watchFundingRates': 'FundingRates',
};

// watch* cores whose public shape is a SNAPSHOT of a live ws structure rather than a
// re-materialised unified struct. `.Copy()` is load-bearing: without it the caller holds
// the live book and sees updates it must not see, so the copy moves onto the core return.
const SNAPSHOT_CORES: Record<string, { type: string; helper: string; predictionType?: string; predictionHelper?: string }> = {
    'watchOrderBook': {
        'type': 'ccxt.pro.IOrderBook',
        'helper': 'ccxt.BaseExchange.ToOrderBookSnapshot',
        'predictionType': 'ccxt.PredictionOrderBook',
        'predictionHelper': 'ccxt.BaseExchange.ToPredictionOrderBookSnapshot',
    },
    'watchOrderBookForSymbols': {
        'type': 'ccxt.pro.IOrderBook',
        'helper': 'ccxt.BaseExchange.ToOrderBookSnapshot',
    },
};

// struct families with a reverse `FromX` / `FromXList` helper (cs/ccxt/base/Exchange.TypedCores.cs,
// `python3 build/generateTypedCoreHelpers.py --capabilities`; FromOHLCVList is hand-written)
const REVERSIBLE_FAMILIES: string[] = [
    'ADL', 'Account', 'Balance', 'BalanceAccount', 'Balances', 'BorrowInterest',
    'CancellationRequest', 'Conversion', 'CrossBorrowRate', 'CrossBorrowRates', 'Currencies',
    'Currency', 'CurrencyLimits', 'DepositAddress', 'DepositAddresses', 'DepositWithdrawFee',
    'DepositWithdrawFeeNetwork', 'DepositWithdrawFees', 'Fee', 'FundingHistory', 'FundingRate',
    'FundingRateHistory', 'FundingRates', 'Greeks', 'IsolatedBorrowRate', 'IsolatedBorrowRates',
    'LastPrice', 'LastPrices', 'LedgerEntry', 'Leverage', 'LeverageTier', 'LeverageTiers',
    'Leverages', 'Limits', 'Liquidation', 'LongShortRatio', 'MarginLoan', 'MarginMode',
    'MarginModes', 'MarginModification', 'Market', 'MarketInterface', 'MarketMarginModes',
    'MinMax', 'Network', 'NetworkLimits', 'OHLCV', 'OpenInterest', 'OpenInterests', 'Option',
    'OptionChain', 'Order', 'OrderBook', 'OrderBooks', 'OrderRequest', 'Position',
    'PositionModeInfo', 'Precision', 'PredictionEvent', 'PredictionFees', 'PredictionMarket',
    'PredictionOpenInterest', 'PredictionOrder', 'PredictionOrderBook',
    'PredictionOrderRequest', 'PredictionOutcome', 'PredictionPosition', 'PredictionSettlement',
    'PredictionTicker', 'PredictionTickers', 'PredictionTrade', 'PredictionTradingFee',
    'AllGreeks',
    'Status', 'Ticker', 'Tickers', 'Trade', 'TradingFeeInterface', 'TradingFees', 'Transaction',
    'TransferEntry', 'WithdrawalResponse',
];

// the prediction tier (PredictionExchange : BaseExchange) is a sibling hierarchy with its own
// structures, so the same method name is typed differently there — no invariance conflict
const PREDICTION_TYPED_CORES: Record<string, string> = {
    'cancelAllOrders': 'List<PredictionOrder>',
    'cancelOrder': 'PredictionOrder',
    'cancelOrders': 'List<PredictionOrder>',
    'createMarketBuyOrderWithCost': 'PredictionOrder',
    'createMarketOrderWithCost': 'PredictionOrder',
    'createMarketSellOrderWithCost': 'PredictionOrder',
    'createOrder': 'PredictionOrder',
    'createOrders': 'List<PredictionOrder>',
    'editOrder': 'PredictionOrder',
    'fetchAccounts': 'List<Account>',
    'fetchCanceledOrders': 'List<PredictionOrder>',
    'fetchClosedOrders': 'List<PredictionOrder>',
    // fetchEvent/fetchEvents/fetchEventsByQuery: the nested PredictionMarket carries the
    // unified market-interface keys (base/quote/precision/limits/...) in its `extra` bag,
    // which FromPredictionMarket writes back, so the round trip is lossless.
    'fetchEvent': 'PredictionEvent',
    'fetchEvents': 'List<PredictionEvent>',
    'fetchEventsByQuery': 'List<Dictionary<string, object>>',
    // venue-internal raw-page helpers: each returns one locally-built list of API rows and
    // every consumer reads it through getArrayLength/getValue/safeList/promiseAll
    'fetchRawActiveMarkets': 'List<Dictionary<string, object>>',
    'fetchRawEventsBySearch': 'List<Dictionary<string, object>>',
    'fetchRawEventsList': 'List<Dictionary<string, object>>',
    'fetchRawMarketsBySearch': 'List<Dictionary<string, object>>',
    'fetchRawMarketsByTags': 'List<Dictionary<string, object>>',
    'fetchRawMarketsList': 'List<Dictionary<string, object>>',
    'fetchRawQuestionsBySearch': 'List<Dictionary<string, object>>',
    'fetchRawQuestionsList': 'List<Dictionary<string, object>>',
    'fetchRawTopics': 'List<Dictionary<string, object>>',
    'fetchSeriesEvents': 'List<Dictionary<string, object>>',
    // the fetchMarkets family is deliberately absent so it falls through to TYPED_CORES
    // 'List<MarketInterface>': FetchMarkets is declared on BaseExchange and C# overrides are
    // invariant, so the prediction tier cannot diverge (CS0508).
    'fetchMyTrades': 'List<PredictionTrade>',
    'fetchOpenInterest': 'PredictionOpenInterest',
    'fetchOpenOrders': 'List<PredictionOrder>',
    'fetchOrder': 'PredictionOrder',
    'fetchOrderTrades': 'List<PredictionTrade>',
    'fetchOrders': 'List<PredictionOrder>',
    'fetchOrdersByIds': 'List<PredictionOrder>',
    'fetchOrderBook': 'PredictionOrderBook',
    'fetchPosition': 'PredictionPosition',
    'fetchPositions': 'List<PredictionPosition>',
    'fetchTicker': 'PredictionTicker',
    'fetchTickers': 'PredictionTickers',
    // the prediction tier caches PredictionTicker rows, so its watchTickers snapshot is a
    // PredictionTickers — it is a sibling hierarchy declaration, no invariance conflict
    'watchTickers': 'PredictionTickers',
    'fetchTrades': 'List<PredictionTrade>',
    'fetchTradingFee': 'PredictionTradingFee',
};

// per-venue typed cores (keyed by ts/src file id, derived venues resolve through their parent),
// consulted before the name-keyed tables; an empty string opts a venue out
const VENUE_TYPED_CORES: Record<string, Record<string, string>> = {
    'alpaca': { 'fetchTransactionsHelper': 'List<Transaction>' },
    'hitbtc': { 'fetchTransactionsHelper': 'List<Transaction>' },
    'dydx': { 'fetchTransactionsHelper': 'List<Dictionary<string, object>>' },
    'poloniex': { 'fetchTransactionsHelper': 'Dictionary<string, object>' },
    // sync homonyms: hashkey/kucoin/mexc/weex declare a SYNC createSpotOrderRequest and
    // 29 venues a sync createOrderRequest — only these async declarations are typed
    'htx': { 'createSpotOrderRequest': 'Dictionary<string, object>' },
    'nado': {
        'cancelAllOrdersRequest': 'Dictionary<string, object>',
        'cancelOrdersRequest': 'Dictionary<string, object>',
        'createOrderRequest': 'Dictionary<string, object>',
        'editOrderRequest': 'Dictionary<string, object>',
    },
};

// sync cores whose runtime value already is the named type (market / currency rows and their
// builders): every declaration is retyped and each return funnelled through ToDict (`as`, identity)
// unless already that dictionary; registered in build/csharp-local-types.js for downstream locals
const SYNC_TYPED_CORES: Record<string, string> = {
    'safeMarketStructure': 'Dictionary<string, object>',
    'safeCurrencyStructure': 'Dictionary<string, object>',
    'safeMarket': 'Dictionary<string, object>',
    'safeCurrency': 'Dictionary<string, object>',
    'market': 'Dictionary<string, object>',
    'currency': 'Dictionary<string, object>',
    'parseMarket': 'Dictionary<string, object>',
    'parseCurrency': 'Dictionary<string, object>',
    'createExpiredOptionMarket': 'Dictionary<string, object>',
};

// Core parameters that name a DICTIONARY ROW (`parse*(object row, …)`, `object currency`), keyed by
// position, with NO call-site wrap: every caller in cs/** already passes a Dictionary<string, object>
// or null. Names whose callers pass `getValue(list, i)` or an `object` local stay out (needs a new cast).
const CORE_DICT_ARGS: Record<string, number[]> = {
    'assignDefaultDepositWithdrawFees': [ 1 ],
    'convertDerivativesId': [ 0 ],
    'createTransferSettlementData': [ 1 ],
    'createWithdrawalSettlementData': [ 2 ],
    'getDedicatedNetworkId': [ 0 ],
    'getSupportedMapping': [ 1 ],
    'parseAccountPosition': [ 0 ],
    'parseAccountPositions': [ 0 ],
    'parseBorrowRate': [ 1 ],
    'parseCustomBalance': [ 0 ],
    'parseDepositAddress': [ 1 ],
    'parseDepositAddressSpecial': [ 0 ],
    'parseDepositWithdrawFee': [ 1 ],
    'parseMarginLoan': [ 1 ],
    'parseOption': [ 1 ],
    'parsePortfolioDetails': [ 0 ],
    'parseTradeQuote': [ 0 ],
    'parseTradingViewOHLCV': [ 0 ],
    'parseTransactionFee': [ 1 ],
    'parseWeiOrderBook': [ 0 ],
    'safeCurrencyStructure': [ 0 ],
};

// as CORE_DICT_ARGS, but a caller holds the row in an `IDictionary<string, object>` local, so the
// parameter is named by the interface
const CORE_IDICT_ARGS: Record<string, number[]> = {
    'getOrderAmount': [ 0 ],
    'internalFetchTransfers': [ 1 ],
    'mergeBalanceAccount': [ 0 ],
    'parseCancelOrders': [ 0 ],
    'parseFundingRateWs': [ 0 ],
    'parseOutcomeMarket': [ 0 ],
    'parsePredictionOpenInterest': [ 0 ],
    'parseTransfer': [ 1 ],
    'parseTransfers': [ 1 ],
    'parseWsFundingRate': [ 0 ],
    'parseWsUtaOrder': [ 0 ],
    'parseWsUtaPosition': [ 0 ],
    'parseWsUtaTicker': [ 0 ],
    'parseWsUtaTrade': [ 0 ],
    'removeKeysFromDict': [ 0 ],
};

// collection helpers whose every return site yields a list or null (a return-site census); the
// declaration is retyped and typeCollectionReturns() normalizes `return <own param>;` /
// `return this.arraySlice(...);` through toArray. Absent: argument-dependent filterByArray* /
// filterBySymbols*, ws overrides, arraySlice (byte[] callers)
const COLLECTION_RETURN_METHODS: string[] = [
    'filterByKey', 'filterBySymbol', 'filterByLimit', 'filterBySinceLimit',
    'filterByValueSinceLimit', 'filterBySymbolSinceLimit', 'filterByCurrencySinceLimit',
    'filterBySymbolsSinceLimit', 'filterByOutcomeSinceLimit',
    'parseTrades', 'parseTradesHelper', 'parseOrders', 'parseOHLCV', 'parseOHLCVs', 'parseTransactions',
    'parseLedger', 'parseLiquidations', 'marketIds', 'currencyIds', 'marketCodes',
    'marketSymbols', 'marketsForSymbols', 'parseMarkets',
];

// parseCurrencies returns its keyed `Dictionary<string, object> result` local: only the declaration changes
const COLLECTION_RETURN_DICT_METHODS: string[] = [
    'parseCurrencies',
];

// Venue-helper `object` parameters narrowed to `string?`, keyed by venue then method -> positions
// (one helper name can be a different method per venue class). Admitted only when every call site
// passes a string, every override is still `object`, and every body use is an identity under `string?`.
const VENUE_STRING_ARGS: Record<string, Record<string, number[]>> = {
    'BaseExchange': { 'CancelAllContractOrders': [ 0 ], 'CancelAllSpotOrders': [ 0 ], 'FetchFundingHistory': [ 0 ], 'FetchMyLiquidations': [ 0 ], 'borrowIsolatedMargin': [ 0 ], 'calculateFee': [ 0, 1, 2 ], 'calculateRateLimiterCost': [ 2 ], 'repayIsolatedMargin': [ 0 ], 'repayMargin': [ 2 ], 'unWatchFundingRate': [ 0 ], 'unWatchMarkPrice': [ 0 ], 'unWatchMyTrades': [ 0 ], 'unWatchOrders': [ 0 ], 'unWatchTrades': [ 0 ] },
    'alpaca': { 'FetchTransactionsHelper': [ 0, 1 ], 'parseOrderStatus': [ 0 ], 'parseTimeInForce': [ 0 ], 'parseTransactionStatus': [ 0 ], 'parseTransactionType': [ 0 ] },
    'apex': { 'FetchFundingHistory': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseOrderType': [ 0 ], 'parseTimeInForce': [ 0 ] },
    'aster': { 'FetchFundingHistory': [ 0 ], 'createOrderRequest': [ 0, 1, 2 ], 'isInverse': [ 0 ], 'isLinear': [ 0 ], 'modifyMarginHelper': [ 0 ], 'parseLedgerEntryType': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseOrderType': [ 0 ], 'parseTransferStatus': [ 0 ] },
    'backpack': { 'FetchFundingHistory': [ 0 ], 'createOrderRequest': [ 0, 1 ], 'parseMarketType': [ 0 ], 'parseOrderSide': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseTransactionStatus': [ 0 ] },
    'bigone': { 'parseOrderStatus': [ 0 ], 'parseTransactionStatus': [ 0 ], 'parseTransferStatus': [ 0 ], 'parseType': [ 0 ] },
    'binance': { 'FetchFundingHistory': [ 0 ], 'FetchMyDustTrades': [ 0 ], 'FetchMyLiquidations': [ 0 ], 'FetchMySettlementHistory': [ 0 ], 'FetchSettlementHistory': [ 0 ], 'borrowIsolatedMargin': [ 0 ], 'createOrderRequest': [ 1, 2 ], 'editContractOrderRequest': [ 0, 2, 3 ], 'editSpotOrderRequest': [ 0, 2, 3 ], 'modifyMarginHelper': [ 0 ], 'parseLedgerEntryType': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseOrderTypeByMarket': [ 0 ], 'parseTransactionStatusByType': [ 0 ], 'parseTransferStatus': [ 0 ], 'repayIsolatedMargin': [ 0 ], 'verifyGiftCode': [ 0 ] },
    'bingx': { 'FetchFundingHistory': [ 0 ], 'FetchMyLiquidations': [ 0 ], 'createOrderRequest': [ 0, 1, 2 ], 'parseOrderStatus': [ 0 ], 'parseOrderType': [ 0 ], 'parseTransactionStatus': [ 0 ], 'parseTransferStatus': [ 0 ] },
    'bit2c': { 'isFiat': [ 0 ] },
    'bitbank': { 'parseOrderStatus': [ 0 ] },
    'bitbns': { 'parseTransactionStatusByType': [ 0, 1 ] },
    'bitfinex': { 'convertDerivativesId': [ 1 ], 'createOrderRequest': [ 0, 1, 2 ], 'isFiat': [ 0 ], 'parseLedgerEntryType': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseTimeInForce': [ 0 ], 'parseTransactionStatus': [ 0 ], 'parseTransferStatus': [ 0 ] },
    'bitflyer': { 'parseDepositStatus': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseWithdrawalStatus': [ 0 ] },
    'bitget': { 'FetchFundingHistory': [ 0 ], 'FetchMyLiquidations': [ 0 ], 'FetchUtaCanceledAndClosedOrders': [ 0 ], 'borrowIsolatedMargin': [ 0 ], 'createOrderRequest': [ 1, 2 ], 'createUtaOrderRequest': [ 1, 2 ], 'modifyMarginHelper': [ 0, 2 ], 'parseLedgerType': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseTransactionStatus': [ 0 ], 'parseTransactionType': [ 0 ], 'parseTransferStatus': [ 0 ], 'repayIsolatedMargin': [ 0 ] },
    'bithumb': { 'createOrderRequest': [ 0, 1, 2 ], 'parseOrderStatus': [ 0 ], 'parseTransactionStatusByType': [ 0, 1 ] },
    'bitopro': { 'parseOrderStatus': [ 0 ], 'parseTransactionStatus': [ 0 ] },
    'bitrue': { 'parseOrderStatus': [ 0 ], 'parseTransactionStatusByType': [ 0, 1 ] },
    'bitso': { 'parseLedgerEntryType': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseTransactionStatus': [ 0 ] },
    'bitstamp': { 'getCurrencyName': [ 0 ], 'parseLedgerEntryType': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseTransactionStatus': [ 0 ], 'parseTransferStatus': [ 0 ] },
    'bitteam': { 'parseOrderStatus': [ 0 ], 'parseOrderType': [ 0 ], 'parseTransactionType': [ 0 ] },
    'bittrade': { 'FetchOpenOrdersV1': [ 0 ], 'FetchOpenOrdersV2': [ 0 ], 'FetchTradingLimitsById': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseTradingLimits': [ 1 ], 'parseTransactionStatus': [ 0 ] },
    'bitvavo': { 'cancelOrderRequest': [ 0 ], 'createOrderRequest': [ 0, 1, 2 ], 'editOrderRequest': [ 0, 2, 3 ], 'fetchOHLCVRequest': [ 0 ], 'parseLedgerEntryType': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseTransactionStatus': [ 0 ], 'parseTransferStatus': [ 0 ] },
    'blofin': { 'createOrderRequest': [ 0, 1, 2 ], 'createTpslOrderRequest': [ 0, 1, 2 ], 'parseLedgerEntryType': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseTransactionDepositStatus': [ 0 ], 'parseTransactionWithdrawalStatus': [ 0 ] },
    'btcbox': { 'FetchOrdersByType': [ 0, 1 ], 'parseOrderStatus': [ 0 ] },
    'btcmarkets': { 'calculateFee': [ 0, 1, 2 ], 'parseOrderStatus': [ 0 ], 'parseTransactionStatus': [ 0 ], 'parseTransactionType': [ 0 ] },
    'btcturk': { 'parseOrderStatus': [ 0 ] },
    'btse': { 'CreateContractOrder': [ 0, 1, 2 ], 'CreateSpotOrder': [ 0, 1, 2 ], 'parseLedgerEntryDirection': [ 0 ], 'parseLedgerEntryType': [ 0 ], 'parseMarginModeType': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseOrderType': [ 0 ], 'parsePositionSide': [ 0 ], 'parseTimeInForce': [ 0 ], 'parseTransactionStatus': [ 0 ], 'parseTransactionType': [ 0 ] },
    'bullish': { 'parseMarketType': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseOrderType': [ 0 ], 'parsePositionSide': [ 0 ], 'parseTransactionStatus': [ 0 ], 'parseTransactionType': [ 0 ] },
    'bybit': { 'FetchDerivativesOpenInterestHistory': [ 0 ], 'FetchFundingHistory': [ 0 ], 'FetchMyLiquidations': [ 0 ], 'FetchMySettlementHistory': [ 0 ], 'FetchOrderClassic': [ 0 ], 'FetchSettlementHistory': [ 0 ], 'cancelOrderRequest': [ 0 ], 'createOrderRequest': [ 0, 1, 2 ], 'editOrderRequest': [ 0, 2, 3 ], 'parseLedgerEntryType': [ 0 ], 'parseMarginModeType': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseTimeInForce': [ 0 ], 'parseTransactionStatus': [ 0 ], 'parseTransferStatus': [ 0 ] },
    'cex': { 'FetchOrdersByStatus': [ 0, 1 ], 'parseLedgerEntryType': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseTransactionStatus': [ 0 ] },
    'coinbase': { 'FetchDepositMethodId': [ 0 ], 'FetchOrdersByStatus': [ 0, 1 ], 'deposit': [ 2 ], 'findAccountId': [ 0 ], 'parseLedgerEntryStatus': [ 0 ], 'parseLedgerEntryType': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseOrderType': [ 0 ], 'parseTimeInForce': [ 0 ], 'parseTransactionStatus': [ 0 ] },
    'coinbaseexchange': { 'parseLedgerEntryType': [ 0 ], 'parseOrderStatus': [ 0 ] },
    'coinbaseinternational': { 'FetchFundingHistory': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseOrderType': [ 0 ], 'parseTransactionStatus': [ 0 ], 'parseTransferStatus': [ 0 ] },
    'coincheck': { 'parseTransactionStatus': [ 0 ] },
    'coinmate': { 'parseOrderStatus': [ 0 ], 'parseOrderType': [ 0 ], 'parseTransactionStatus': [ 0 ] },
    'coinsph': { 'encodeOrderSide': [ 0 ], 'parseOrderSide': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseOrderTimeInForce': [ 0 ], 'parseOrderType': [ 0 ], 'parseTransactionStatus': [ 0 ] },
    'cryptocom': { 'FetchSettlementHistory': [ 0 ], 'createAdvancedOrderRequest': [ 0, 1, 2 ], 'createOrderRequest': [ 0, 1, 2 ], 'editOrderRequest': [ 0 ], 'parseDepositStatus': [ 0 ], 'parseLedgerEntryType': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseTimeInForce': [ 0 ], 'parseWithdrawalStatus': [ 0 ] },
    'cryptomus': { 'parseOrderStatus': [ 0 ] },
    'deepcoin': { 'createOrderRequest': [ 0, 1, 2 ], 'createRegularOrderRequest': [ 1, 2 ], 'createTriggerOrderRequest': [ 1, 2 ], 'parseLedgerEntryType': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseOrderTimeInForce': [ 0 ], 'parseOrderType': [ 0 ], 'parseTransactionStatus': [ 0 ], 'parseTransferStatus': [ 0 ] },
    'delta': { 'FetchOrdersWithMethod': [ 1 ], 'FetchSettlementHistory': [ 0 ], 'modifyMarginHelper': [ 0, 2 ], 'parseOrderStatus': [ 0 ] },
    'deribit': { 'FetchMyLiquidations': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseOrderType': [ 0 ], 'parseTimeInForce': [ 0 ], 'parseTransactionStatus': [ 0 ], 'parseTransferStatus': [ 0 ] },
    'derive': { 'FetchFundingHistory': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseTimeInForce': [ 0 ], 'parseTransactionStatus': [ 0 ] },
    'digifinex': { 'FetchFundingHistory': [ 0 ], 'FetchTransactionsByType': [ 0 ], 'createOrderRequest': [ 1 ], 'modifyMarginHelper': [ 0 ], 'parseLedgerEntryType': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseTransactionStatus': [ 0 ], 'parseTransferStatus': [ 0 ] },
    'dydx': { 'FetchTransactionsHelper': [ 0 ], 'createOrderRequest': [ 0, 1, 2 ], 'parseLedgerEntryType': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseOrderType': [ 0 ] },
    'extended': { 'CreateExtendedOrderRequest': [ 0, 1, 2 ], 'FetchFundingHistory': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseTransactionStatus': [ 0 ], 'parseTransactionType': [ 0 ] },
    'foxbit': { 'FetchOrdersByStatus': [ 0, 1 ], 'parseLedgerEntryType': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseTransactionStatus': [ 0 ] },
    'gate': { 'FetchFundingHistory': [ 0 ], 'FetchMyLiquidations': [ 0 ], 'FetchMySettlementHistory': [ 0 ], 'FetchOrdersByStatus': [ 0 ], 'FetchSettlementHistory': [ 0 ], 'borrowIsolatedMargin': [ 0 ], 'createOrderRequest': [ 1, 2 ], 'editOrderRequest': [ 0, 2, 3 ], 'fetchOrderRequest': [ 0 ], 'getSettlementCurrencies': [ 0 ], 'modifyMarginHelper': [ 0 ], 'parseLedgerEntryType': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseTransactionStatus': [ 0 ], 'prepareOrdersByStatusRequest': [ 0 ], 'repayIsolatedMargin': [ 0 ] },
    'gemini': { 'parseMarketActive': [ 0 ], 'parseTransactionStatus': [ 0 ] },
    'grvt': { 'FetchFundingHistory': [ 0 ], 'filterTransfersByType': [ 1 ], 'parseOrderStatus': [ 0 ], 'parseTimeInForce': [ 0 ] },
    'hashkey': { 'CreateSpotOrder': [ 0, 1, 2 ], 'CreateSwapOrder': [ 0, 1, 2 ], 'FetchOpenSpotOrders': [ 0 ], 'FetchOpenSwapOrders': [ 0 ], 'createOrderRequest': [ 0, 1, 2 ], 'createSpotOrderRequest': [ 1, 2 ], 'createSwapOrderRequest': [ 1, 2 ], 'encodeAccountType': [ 0 ], 'encodeFlowType': [ 0 ], 'modifyMarginHelper': [ 0, 2 ], 'parseAccountType': [ 0 ], 'parseLedgerEntryType': [ 0 ], 'parseOrderStatus': [ 0 ] },
    'hibachi': { 'FetchMySettlementHistory': [ 0 ], 'createOrderRequest': [ 1, 2, 3 ], 'editOrderRequest': [ 2, 3, 4 ], 'orderMessage': [ 3, 4 ], 'parseOrderStatus': [ 0 ], 'parseTransactionStatus': [ 0 ] },
    'hitbtc': { 'FetchTransactionsHelper': [ 0, 1 ], 'createOrderRequest': [ 1, 2, 3 ], 'modifyMarginHelper': [ 0, 2 ], 'parseOrderStatus': [ 0 ], 'parseTransactionStatus': [ 0 ], 'parseTransactionType': [ 0 ] },
    'hollaex': { 'parseOrderStatus': [ 0 ] },
    'htx': { 'CreateSpotOrderRequest': [ 1 ], 'FetchWithdrawAddresses': [ 1, 2 ], 'FetchClosedContractOrders': [ 0 ], 'FetchClosedSpotOrders': [ 0 ], 'FetchFundingHistory': [ 0 ], 'FetchSettlementHistory': [ 0 ], 'FetchSpotOrders': [ 0 ], 'FetchTradingLimitsById': [ 0 ], 'borrowIsolatedMargin': [ 0 ], 'createContractOrderRequest': [ 1, 2 ], 'parseLedgerEntryType': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseTradingLimits': [ 1 ], 'parseTransactionStatus': [ 0 ], 'repayIsolatedMargin': [ 0 ] },
    'hyperliquid': { 'FetchFundingHistory': [ 0 ], 'createOrderRequest': [ 0, 3 ], 'modifyMarginHelper': [ 0, 2 ], 'parseCreateEditOrderArgs': [ 2, 3 ], 'parseLedgerEntryType': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseOrderType': [ 0 ] },
    'independentreserve': { 'parseOrderStatus': [ 0 ], 'parseTimeInForce': [ 0 ] },
    'indodax': { 'parseOrderStatus': [ 0 ], 'parseTransactionStatus': [ 0 ] },
    'kraken': { 'orderRequest': [ 0, 1, 2 ], 'parseAccountType': [ 0 ], 'parseLedgerEntryType': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseTransactionStatus': [ 0 ], 'parseTransactionsByType': [ 0 ] },
    'krakenfutures': { 'FetchFundingHistory': [ 0 ], 'createOrderRequest': [ 0, 1, 2 ], 'parseLedgerEntryType': [ 0 ] },
    'kucoin': { 'CancelAllContractOrders': [ 0 ], 'CancelAllSpotOrders': [ 0 ], 'CancelAllUtaOrders': [ 0 ], 'CreateContractOrder': [ 0, 1, 2 ], 'CreateSpotOrder': [ 0, 1, 2 ], 'CreateUtaOrder': [ 0, 1, 2 ], 'FetchContractOrder': [ 0 ], 'FetchContractOrdersByStatus': [ 0 ], 'FetchFundingHistory': [ 0 ], 'FetchMyContractTrades': [ 0 ], 'FetchMySpotTrades': [ 0 ], 'FetchMyUtaTrades': [ 0 ], 'FetchOrdersByStatus': [ 0 ], 'FetchSpotOrder': [ 0 ], 'FetchSpotOrdersByStatus': [ 0 ], 'FetchUtaOrder': [ 0 ], 'FetchUtaOrdersByStatus': [ 0 ], 'borrowIsolatedMargin': [ 0 ], 'createContractOrderRequest': [ 1, 2 ], 'createSpotOrderRequest': [ 1, 2 ], 'createUtaOrderRequest': [ 1, 2 ], 'parseLedgerEntryType': [ 0 ], 'parseLedgerStatus': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseOrderTimeInForce': [ 0 ], 'parseTransactionStatus': [ 0 ], 'parseTransferStatus': [ 0 ], 'repayIsolatedMargin': [ 0 ], 'typeToTradeType': [ 0 ] },
    'latoken': { 'FetchPrivateTradingFee': [ 0 ], 'FetchPublicTradingFee': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseOrderType': [ 0 ], 'parseTimeInForce': [ 0 ], 'parseTransactionStatus': [ 0 ], 'parseTransactionType': [ 0 ], 'parseTransferStatus': [ 0 ] },
    'lbank': { 'FetchOrderDefault': [ 0 ], 'FetchOrderSupplement': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseTransactionStatus': [ 0 ] },
    'lighter': { 'createOrderRequest': [ 1 ], 'modifyLeverageAndMarginMode': [ 1 ], 'parseOrderStatus': [ 0 ], 'parseTransactionStatus': [ 0 ], 'signAndCancelAllOrders': [ 1 ], 'signAndCancelOrder': [ 1 ], 'signAndCreateOrder': [ 1, 2, 3 ] },
    'luno': { 'parseOrderStatus': [ 0 ] },
    'mercado': { 'parseOrderStatus': [ 0 ] },
    'mexc': { 'CreateSpotOrder': [ 1, 2, 5 ], 'CreateSwapOrder': [ 1, 2, 5 ], 'FetchAccountHelper': [ 0 ], 'FetchFundingHistory': [ 0 ], 'createSpotOrderRequest': [ 1, 2 ], 'modifyMarginHelper': [ 0, 2 ], 'parseOrderSide': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseOrderTimeInForce': [ 0 ], 'parseOrderType': [ 0 ], 'parseTransactionStatusByType': [ 0, 1 ], 'parseTransferStatus': [ 0 ] },
    'modetrade': { 'FetchFundingHistory': [ 0 ], 'createOrderRequest': [ 0, 1, 2 ], 'parseLedgerEntryType': [ 0 ], 'parseOrderType': [ 0 ], 'parseTimeInForce': [ 0 ], 'parseTransactionStatus': [ 0 ] },
    'mudrex': { 'parseOrderStatus': [ 0 ] },
    'nado': { 'CancelAllOrdersRequest': [ 0 ], 'CreateOrderRequest': [ 0, 1, 2 ], 'EditOrderRequest': [ 0, 2, 3 ], 'FetchFundingHistory': [ 0 ], 'parseOrderTimeInForce': [ 0 ] },
    'ndax': { 'parseLedgerEntryType': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseTransactionStatusByType': [ 0 ] },
    'okx': { 'FetchFundingHistory': [ 0 ], 'FetchSettlementHistory': [ 0 ], 'createOrderRequest': [ 0, 1, 2 ], 'editOrderRequest': [ 0, 2, 3 ], 'modifyMarginHelper': [ 0, 2 ], 'parseBalanceByType': [ 0 ], 'parseLedgerEntryType': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseTransactionStatus': [ 0 ], 'parseTransferStatus': [ 0 ] },
    'onetrading': { 'parseOrderStatus': [ 0 ], 'parseTimeInForce': [ 0 ] },
    'pacifica': { 'FetchFundingHistory': [ 0 ], 'cancelAllOrdersRequest': [ 0 ], 'createOrderRequest': [ 0, 1, 2 ], 'editOrderRequest': [ 0, 2, 3 ], 'parseLedgerEntryType': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseOrderType': [ 0 ] },
    'paradex': { 'FetchFundingHistory': [ 0 ], 'filterTransactionsByKind': [ 1 ], 'FetchMyLiquidations': [ 0 ], 'createOrderRequest': [ 0, 1, 2 ], 'encodeMarginMode': [ 0 ], 'parseOrderType': [ 0 ], 'parseTimeInForce': [ 0 ], 'parseTransactionStatus': [ 0 ] },
    'paymium': { 'parseTransferStatus': [ 0 ] },
    'phemex': { 'FetchFundingHistory': [ 0 ], 'parseMarginStatus': [ 0 ], 'parseOrderSide': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseOrderType': [ 0 ], 'parseTimeInForce': [ 0 ], 'parseTransactionStatus': [ 0 ], 'parseTransferStatus': [ 0 ] },
    'poloniex': { 'FetchTransactionsHelper': [ 0 ], 'modifyMarginHelper': [ 0, 2 ], 'orderRequest': [ 0, 1, 2 ], 'parseOrderStatus': [ 0 ], 'parseOrderType': [ 0 ] },
    'prediction:binance': { 'parseOrderStatus': [ 0 ] },
    'prediction:hyperliquid': { 'buildOutcomeSymbol': [ 1 ], 'parseOrderStatus': [ 0 ], 'parseOrderType': [ 0 ], 'parseTimeInForce': [ 0 ] },
    'prediction:kalshi': { 'calculateFee': [ 0, 1, 2 ], 'parseOrderStatus': [ 0 ] },
    'prediction:limitless': { 'parseOrderSide': [ 0 ], 'parseOrderTimeInForce': [ 0 ] },
    'prediction:myriad': { 'FetchRawMarketById': [ 0 ], 'FetchRawQuestionById': [ 0 ], 'FetchTradeQuote': [ 1 ], 'buildOrderbookOrder': [ 1, 2 ], 'parseOrderStatus': [ 0 ], 'parseTradeTx': [ 3 ] },
    'prediction:opinion': { 'opinionOrderRawAmounts': [ 1 ], 'parseOrderStatus': [ 0 ] },
    'prediction:polymarket': { 'buildClobOrderBody': [ 1, 2 ], 'parseOrderStatus': [ 0 ], 'polymarketOrderRawAmounts': [ 0 ] },
    'pro:alpaca': { 'authenticate': [ 0 ] },
    'pro:apex': { 'authenticate': [ 0 ] },
    'pro:aster': { 'parseWsTicker': [ 1 ], 'unWatchMarkPrice': [ 0 ], 'unWatchTrades': [ 0 ] },
    'pro:backpack': { 'parseWsOrderSide': [ 0 ], 'parseWsOrderStatus': [ 0 ], 'unWatchOrders': [ 0 ], 'unWatchTrades': [ 0 ] },
    'pro:binance': { 'ensureUserDataStreamWsSubscribeListenToken': [ 0 ], 'ensureUserDataStreamWsSubscribeSignature': [ 0 ], 'setBalanceCache': [ 1 ], 'setPositionsCache': [ 1 ], 'unWatchMarkPrice': [ 0 ], 'unWatchTrades': [ 0 ] },
    'pro:bingx': { 'getOrderBookLimitByMarketType': [ 0 ], 'setPositionsCache': [ 1 ], 'unWatchTrades': [ 0 ] },
    'pro:bitfinex': { 'parseWsOrderStatus': [ 0 ], 'subscribe': [ 1 ], 'unWatchTrades': [ 0 ] },
    'pro:bitget': { 'parseWsOrderStatus': [ 0 ], 'parseWsTicker': [ 1 ], 'unWatchTrades': [ 0 ] },
    'pro:bitopro': { 'watchPublic': [ 1 ] },
    'pro:bitrue': { 'parseWsOrderStatus': [ 0 ], 'parseWsOrderType': [ 0 ] },
    'pro:bitstamp': { 'subscribePrivate': [ 1 ], 'unWatchMyTrades': [ 0 ], 'unWatchOrders': [ 0 ], 'unWatchTrades': [ 0 ] },
    'pro:bitvavo': { 'unWatchTrades': [ 0 ] },
    'pro:blockchaincom': { 'parseWsOrderStatus': [ 0 ] },
    'pro:blofin': { 'parseWsTicker': [ 1 ] },
    'pro:bybit': { 'authenticate': [ 0 ], 'unWatchMyTrades': [ 0 ], 'unWatchOrders': [ 0 ], 'unWatchTrades': [ 0 ] },
    'pro:coinbase': { 'parseWsTicker': [ 1 ], 'subscribe': [ 0 ], 'subscribeMultiple': [ 0 ], 'unSubscribe': [ 1 ], 'unSubscribeMultiple': [ 1 ], 'unWatchOrders': [ 0 ], 'unWatchTrades': [ 0 ] },
    'pro:coinbaseexchange': { 'parseWsOrderStatus': [ 0 ], 'subscribeMultiple': [ 2 ] },
    'pro:coinbaseinternational': { 'parseWsTicker': [ 1 ] },
    'pro:cryptocom': { 'unWatchTrades': [ 0 ] },
    'pro:deepcoin': { 'parsePositionSide': [ 0 ], 'parseWsOrderStatus': [ 0 ], 'unWatchTrades': [ 0 ] },
    'pro:derive': { 'unWatchTrades': [ 0 ] },
    'pro:dydx': { 'unWatchTrades': [ 0 ] },
    'pro:gate': { 'authenticate': [ 0 ], 'setPositionsCache': [ 1 ], 'unWatchTrades': [ 0 ] },
    'pro:gemini': { 'parseWsOrderStatus': [ 0 ], 'parseWsOrderType': [ 0 ] },
    'pro:hitbtc': { 'subscribePrivate': [ 0 ], 'subscribePublic': [ 0, 1 ], 'unSubscribePublic': [ 1 ] },
    'pro:htx': { 'unWatchTrades': [ 0 ] },
    'pro:hyperliquid': { 'unWatchMyTrades': [ 0 ], 'unWatchOrders': [ 0 ], 'unWatchTrades': [ 0 ] },
    'pro:kraken': { 'orderRequestWs': [ 1, 2 ], 'watchPrivate': [ 0, 1 ] },
    'pro:krakenfutures': { 'parseWsTicker': [ 1 ], 'subscribePublic': [ 1 ] },
    'pro:kucoin': { 'parseWsOrderStatus': [ 0 ], 'unWatchFundingRate': [ 0 ], 'unWatchMarkPrice': [ 0 ], 'unWatchTrades': [ 0 ], 'watchMultiHelper': [ 1 ] },
    'pro:lbank': { 'parseWsOrderStatus': [ 0 ] },
    'pro:lighter': { 'unWatchMarkPrice': [ 0 ], 'unWatchMyTrades': [ 0 ], 'unWatchOrders': [ 0 ], 'unWatchTrades': [ 0 ] },
    'pro:mexc': { 'parseWsOrderStatus': [ 0 ], 'parseWsOrderType': [ 0 ], 'unWatchFundingRate': [ 0 ], 'unWatchTrades': [ 0 ] },
    'pro:nado': { 'unWatchMyTrades': [ 0 ], 'unWatchOrders': [ 0 ], 'unWatchTrades': [ 0 ], 'watchPrivate': [ 0 ] },
    'pro:okx': { 'subscribe': [ 1 ], 'subscribeMultiple': [ 1 ], 'unWatchTrades': [ 0 ] },
    'pro:onetrading': { 'parseTradingOrderStatus': [ 0 ], 'parseWsOrderStatus': [ 0 ] },
    'pro:paradex': { 'handleUnsubscribeReply': [ 1 ] },
    'pro:pacifica': { 'unWatchMyTrades': [ 0 ], 'unWatchOrders': [ 0 ], 'unWatchTrades': [ 0 ] },
    'pro:phemex': { 'handleBalance': [ 2 ] },
    'pro:poloniex': { 'parseStatus': [ 0 ], 'subscribe': [ 0, 1 ] },
    'pro:toobit': { 'parseWsTicker': [ 1 ], 'setBalanceCache': [ 1 ], 'setPositionsCache': [ 1 ] },
    'pro:upbit': { 'parseWsOrderStatus': [ 0 ], 'watchPublicMultiple': [ 1 ] },
    'pro:weex': { 'subscribePrivate': [ 2 ], 'unWatchMyTrades': [ 0 ], 'unWatchOrders': [ 0 ], 'unWatchTrades': [ 0 ] },
    'pro:whitebit': { 'parseWsOrderType': [ 0 ], 'setBalanceCache': [ 1 ] },
    'pro:woo': { 'unWatchTrades': [ 0 ] },
    'pro:xt': { 'subscribe': [ 0, 1, 2 ], 'unSubscribe': [ 1, 2, 3 ], 'unWatchFundingRate': [ 0 ], 'unWatchTrades': [ 0 ] },
    'revolutx': { 'parseOrderStatus': [ 0 ] },
    'tokocrypto': { 'parseBalanceCustom': [ 1, 2 ], 'parseOrderStatus': [ 0 ], 'parseOrderType': [ 0 ], 'parseTransactionStatusByType': [ 0 ] },
    'toobit': { 'FetchDepositsOrWithdrawalsHelper': [ 0, 1 ], 'createContractOrderRequest': [ 0, 1, 2 ], 'createOrderRequest': [ 0, 1, 2 ], 'parseLedgerType': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseOrderType': [ 0 ], 'parseTransactionStatus': [ 0 ] },
    'upbit': { 'calcOrderPrice': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseTransactionStatus': [ 0 ] },
    'weex': { 'CreateContractOrder': [ 0, 1, 2 ], 'CreateSpotOrder': [ 0, 1, 2 ], 'FetchFundingHistory': [ 0 ], 'createContractOrderRequest': [ 1, 2 ], 'createSpotOrderRequest': [ 1, 2 ], 'encodeMarginMode': [ 0 ], 'modifyMarginHelper': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseOrderType': [ 0 ], 'parseTransferStatus': [ 0 ] },
    'whitebit': { 'FetchFundingHistory': [ 0 ], 'isFiat': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseOrderType': [ 0 ], 'parseTransactionStatus': [ 0 ] },
    'woo': { 'FetchFundingHistory': [ 0 ], 'defaultNetworkCodeForCurrency': [ 0 ], 'encodeMarginMode': [ 0 ], 'modifyMarginHelper': [ 0, 2 ], 'parseLedgerEntryType': [ 0 ], 'parseTimeInForce': [ 0 ], 'parseTransactionStatus': [ 0 ], 'repayMargin': [ 2 ] },
    'woofipro': { 'FetchFundingHistory': [ 0 ], 'createOrderRequest': [ 0, 1, 2 ], 'modifyMarginHelper': [ 0, 2 ], 'parseLedgerEntryType': [ 0 ], 'parseOrderType': [ 0 ], 'parseTimeInForce': [ 0 ], 'parseTransactionStatus': [ 0 ] },
    'xt': { 'CreateContractOrder': [ 1, 2 ], 'CreateSpotOrder': [ 1, 2 ], 'FetchFundingHistory': [ 0 ], 'FetchOrdersByStatus': [ 0, 1 ], 'modifyMarginHelper': [ 0, 2 ], 'parseLedgerEntryType': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseTransactionStatus': [ 0 ] },
    'zebpay': { 'orderRequest': [ 0, 1 ] },
};

// Non-core helper `object since/limit/until/amount/price` parameters narrowed to the box every caller
// passes (exact Int64?/double?/null, no conversion), keyed by method -> position across the whole tree
// (overrides are invariant); body uses must be identities and positions needing a shadow are excluded.
const VENUE_NUMERIC_ARG_NAMES = [ 'since', 'limit', 'until', 'amount', 'price', 'status', 'outcomeSide', 'marketCount', 'id', 'marketId', 'scale' ];

const VENUE_NUMERIC_ARGS: Record<string, Record<number, string>> = {
    'amountToPredictionPrecision': { 1: 'double?' },
    'borrowMargin': { 1: 'double?' },
    'buildClobOrderBody': { 3: 'double?' },
    'buildOrderbookOrder': { 3: 'double?', 4: 'double?' },
    'calcOrderPrice': { 1: 'double?', 2: 'double?' },
    'calculateFee': { 3: 'double?', 4: 'double?' },
    'convertCurrencyNetwork': { 1: 'double?' },
    'createEditOrderRequest': { 4: 'double?', 5: 'double?' },
    'createTpslOrderRequest': { 3: 'double?', 4: 'double?' },
    'editSpotOrderRequest': { 4: 'double?', 5: 'double?' },
    'encodeWithdrawMessage': { 0: 'double?' },
    'fetchPaginatedCallIncremental': { 2: 'Int64?', 3: 'Int64?' },
    'filterByOutcomesSinceLimit': { 2: 'Int64?', 3: 'Int64?' },
    'filterBySymbolsSinceLimit': { 2: 'Int64?', 3: 'Int64?' },
    'fetchOrdersHelper': { 1: 'Int64?', 2: 'Int64?' },
    'getAssetHistoryRows': { 1: 'Int64?', 2: 'Int64?' },
    'getClosestLimit': { 0: 'Int64?' },
    'handleSubscriptionStatus': { 2: 'Int64?' },
    'handlePaginationParams': { 1: 'Int64?' },
    'internalFetchTransfers': { 2: 'Int64?', 3: 'Int64?' },
    'opinionOrderRawAmounts': { 2: 'double?', 3: 'double?' },
    'opinionOutcomeByMarketIdSide': { 0: 'Int64?', 1: 'Int64?' },
    'orderRequestWs': { 4: 'double?', 5: 'double?' },
    'parseBorrowRateHistories': { 2: 'Int64?', 3: 'Int64?' },
    'parseContractOrderBook': { 2: 'Int64?' },
    'parseConversions': { 4: 'Int64?', 5: 'Int64?' },
    'parseCreateEditOrderArgs': { 4: 'double?', 5: 'double?' },
    'parseFundingHistories': { 2: 'Int64?', 3: 'Int64?' },
    'parseFundingRateHistories': { 2: 'Int64?', 3: 'Int64?' },
    'parseIncomes': { 2: 'Int64?', 3: 'Int64?' },
    'parseLedger': { 2: 'Int64?', 3: 'Int64?' },
    'parseLiquidations': { 2: 'Int64?', 3: 'Int64?' },
    'parseLongShortRatioHistory': { 2: 'Int64?', 3: 'Int64?' },
    'parsePredictionOrders': { 2: 'Int64?', 3: 'Int64?' },
    'parsePredictionTrades': { 2: 'Int64?', 3: 'Int64?' },
    'parseSettlements': { 2: 'Int64?', 3: 'Int64?' },
    'parseTradingViewOHLCV': { 3: 'Int64?' },
    'parseTransactionsByType': { 3: 'Int64?', 4: 'Int64?' },
    'parseWsOHLCVs': { 3: 'Int64?', 4: 'Int64?' },
    'parseWsOrderStatus': { 0: 'Int64?' },
    'parseWsTrades': { 2: 'Int64?', 3: 'Int64?' },
    'prepareAccountRequest': { 0: 'Int64?' },
    'prepareAccountRequestWithCurrencyCode': { 1: 'Int64?' },
    'priceToPredictionPrecision': { 1: 'double?' },
    'queryTransactionsByEventType': { 4: 'Int64?', 5: 'Int64?' },
    'requestWalletHistoryRows': { 4: 'Int64?' },
    'seedOrderBook': { 2: 'Int64?' },
    'signAndCreateOrder': { 5: 'double?' },
    'titleForMarketSymbol': { 2: 'Int64?' },
    // phemex: every caller passes a safeInteger / Int64? valueScale
    'toEn': { 1: 'Int64?' },
    'tokenizedConvertHistory': { 0: 'Int64?', 1: 'Int64?' },
};

// Shadow-local uses that stay identities when the shadow takes the parameter's own type (same box,
// same overload); int literals for `Int64?` and `add (...)` keep `object`. Body text has C# string
// literal contents blanked, so a parameter name inside a message is not read as an assignment.
const stripCsStringLiterals = (body: string): string => body.replace (/"(?:[^"\\\n]|\\.)*"/g, '""');

const CORE_ARG_SHADOW_TYPES = [ 'string', 'Int64?', 'double?', 'bool?' ];

// The `limit` core-arg shadow also admits `limitVar = callDynamically (…, "getLimit", …)` (ArrayCache
// declares `Int64? getLimit`, so the unbox names the existing box) and integer-literal writes (the
// emitted cast keeps the Int32 -> Int64 box change visible). Keyed by source name; other copies unaffected.
const CORE_ARG_SHADOW_LIMIT_SOURCE = 'limit';
const CORE_ARG_SHADOW_LIMIT_GETLIMIT_RE = /^callDynamically\s*\(\s*[A-Za-z_]\w*\s*,\s*"getLimit"\s*,/;
const CORE_ARG_SHADOW_LIMIT_LITERAL_RE = /^-?\d+$/;

// identifiers the enclosing declaration already types `string`, whose `castCoreArgCallSites` wrap
// is a no-op (sibling families keep their casts)
const CORE_ARG_CALL_SITE_TYPED_IDENTIFIERS = [ 'path', 'symbol' ];

// Callees whose every definition in cs/** declares `object` at the argument's position, so an `object`
// and a string/nullable-numeric argument select the same overload and box. `GetValue` is the typed
// twin of `getValue`; a shadow alias can only reach its string key position, read the same way.
const CORE_ARG_SHADOW_CALLEES = [
    'parseTimeframe', 'safeString', 'safeString2', 'safeStringN', 'safeBool', 'safeInteger',
    'safeNumber', 'safeDict', 'safeValue', 'safeList', 'safeTicker', 'safeOrder', 'safeTrade',
    'safeSymbol', 'getValue', 'GetValue', 'isEqual', 'isTrue', 'isGreaterThan', 'isLessThan',
    'isGreaterThanOrEqual', 'isLessThanOrEqual', 'mathMin', 'mathMax', 'subtract', 'multiply',
    'divide', 'sum', 'filterBySymbolSinceLimit', 'filterBySinceLimit', 'filterBySymbol',
    'fetchPaginatedCallIncremental', 'fetchPaginatedCallCursor',
    'fetchPaginatedCallDynamic', 'fetchPaginatedCallDeterministic', 'unWatchOHLCVForSymbols',
    'WatchOHLCVForSymbols', 'checkAddress', 'ToInt64Arg', 'ToDoubleArg', 'ToDoubleArgRequired',
    'ToOHLCVList', 'ToTradeList', 'ToOrderList', 'ToTransactionList', 'ToFundingRateHistoryList',
    'ToOpenInterestList', 'ToTransferEntryList', 'FromOHLCVDict', 'FromOHLCVList',
    'FromOpenInterests', 'symbol', 'market', 'marketId', 'parseToInt', 'parseOHLCVs', 'parseOrders',
    'parseTrades', 'parseTransactions', 'findNearestCeiling',
];

// Extension of the allowlist above: every definition of these names in cs/** types every position
// `object`, so a narrowed argument keeps the same overload and box.
const CORE_ARG_SHADOW_NEW_CALLEES = [
    'subscribe', 'subscribePublic', 'subscribePublicUta', 'watchPublic', 'watchMultipleSubscription',
    'loadOutcome', 'iso8601', 'yyyymmdd', 'capitalize', 'numberToString', 'getMessageHash',
    'getUrlByMarketType', 'marketOrNull', 'safeCurrency', 'filterBy', 'inOp', 'inArray',
    'parseTransfers', 'parseOpenInterestsHistory', 'filterByOutcomeSinceLimit',
    // `amountToPrecision` and `insertMissingCandles` type every position `object`; the three others
    // carry one `string` position an `object` argument cannot reach today (no implicit object ->
    // string), so every reachable position is `object`.
    'amountToPrecision', 'currencyToPrecision', 'insertMissingCandles', 'parseBorrowRateHistory',
    'withdrawRequest',
];

// Declared types `retypeIdentifierCopies` may name for a plain identifier copy
// (`object x = <typed param or local>;`). Every entry is a type the emitted tree already
// carries on a declaration line, so the copy names what the box already is.
const IDENTIFIER_COPY_TYPES = [ 'string', 'string?', 'Int64?', 'double?', 'bool?', 'IList<object>', 'List<object>', 'Dictionary<string, object>', 'IDictionary<string, object>' ];

// Sources (parameter names) whose copies are handled by the core-arg shadow passes,
// so `retypeIdentifierCopies` never retypes them.
const IDENTIFIER_COPY_SKIPPED_SOURCES = [ 'limit', 'symbol', 'timeframe', 'since', 'currency', 'tag' ];
const IDENTIFIER_COPY_SKIPPED_ALIASES = [ 'limitVar', 'symbolVar', 'timeframeVar', 'sinceVar', 'currencyVar', 'tagVar', 'startTime', 'tag' ];

// Callees every definition of which declares `object` in the position an argument lands in
// (`currency`, `networkIdToCode`, `safeCurrencyCode`, `safeOutcome`, `safeOutcomeSymbol`,
// `filterByValueSinceLimit`), plus `getArrayLength`, whose List/IList twins are identity copies
// of the `object` overload's IList branch (null -> 0). Definitions: cs/ccxt/base/*.cs.
const IDENTIFIER_COPY_IDENTITY_CALLEES = [ 'currency', 'networkIdToCode', 'safeCurrencyCode', 'safeOutcome', 'safeOutcomeSymbol', 'filterByValueSinceLimit', 'getArrayLength' ];

// Box-identical widening edges a write may cross: `List<object>` implements `IList<object>`, and
// `string?` is the same C# type as `string` (a CS86xx warning is all the annotation adds).
const IDENTIFIER_COPY_WIDENING: Record<string, boolean> = {
    'List<object>->IList<object>': true,
    'Dictionary<string, object>->IDictionary<string, object>': true,
    'string?->string': true,
};

// Identifiers whose call-site wrap is skipped when their nearest in-scope declaration is exactly the
// narrowed type (`string code`, `string tag`/`tagVar`): the cast would be an identity. `string?` and
// `object` declarations keep their cast (non-null assertion / unproven box).
const CORE_ARG_CAST_EXEMPT_NAMES = [ 'code', 'codeVar', 'tag', 'tagVar' ];

// Hand-written / base-emitted producers whose declared return type is `string`/`string?`: a
// `((string)this.<name>(...))` wrap is an identity conversion, so the cast can go. A name the
// processed content itself declares wins over this table (an override decides the static type).
const STRING_PRODUCER_HELPERS: Record<string, string> = {
    safeString: 'cs/ccxt/base/Exchange.SafeMethods.cs:129 string?',
    safeString2: 'cs/ccxt/base/Exchange.SafeMethods.cs:131 string?',
    safeStringUpper: 'cs/ccxt/base/Exchange.SafeMethods.cs:139 string?',
    safeStringLower: 'cs/ccxt/base/Exchange.SafeMethods.cs:157 string?',
    safeStringLower2: 'cs/ccxt/base/Exchange.SafeMethods.cs:163 string?',
    safeCurrencyCode: 'cs/ccxt/base/Exchange.BaseMethods.cs:5916 string?',
    amountToPrecision: 'cs/ccxt/base/Exchange.BaseMethods.cs:5718 string?',
    findTimeframe: 'cs/ccxt/base/Exchange.BaseMethods.cs:630 string?',
    json: 'cs/ccxt/base/Exchange.Functions.cs:325 string',
    ethGetAddressFromPrivateKey: 'cs/ccxt/base/Exchange.ETH.cs:322 string',
    numberToString: 'cs/ccxt/base/Exchange.Number.cs:427 string',
    intToBase16: 'cs/ccxt/base/Exchange.Encode.cs:265 string',
    urlencode: 'cs/ccxt/base/Exchange.Encode.cs:364 string',
};

// the `public string <name> { get; set; }` block of cs/ccxt/base/Exchange.Options.cs (partial
// class BaseExchange, lines 89-96) -- every tier inherits them, no venue declares a twin.
// `token` in the same block is `public object` and is deliberately absent.
const STRING_PRODUCER_FIELDS = [
    'secret', 'apiKey', 'password', 'uid', 'accountId', 'login', 'privateKey', 'walletAddress', 'twofa',
];

// parse* cores whose `market` parameter is only ever a market row: every call site passes null, a
// Dictionary<string, object> / IDictionary<string, object> value, or an admitted name's own `market`
// parameter, and every body use is a dict use.
const PARSE_MARKET_PARAM_DICTS: string[] = [
    'parseADLRank', 'parseAccountPosition', 'parseBorrowInterest', 'parseBorrowInterests',
    'parseEmulatedLeverageTiers', 'parseFeeTiers', 'parseFundingFeeToPrecision',
    'parseFundingRate', 'parseFundingRateHistories', 'parseFundingRateHistory',
    'parseFundingRateWs', 'parseGreeks', 'parseIncome', 'parseIncomes', 'parseIsolatedBorrowRate',
    'parseLastPrice', 'parseLeverage', 'parseLiquidation', 'parseLiquidations',
    'parseLongShortRatio', 'parseLongShortRatioHistory', 'parseMarginLoan', 'parseMarginMode',
    'parseMarginModification', 'parseMarketLeverageTiers', 'parseMyTrade', 'parseOpenInterest',
    'parseOpenInterestsHistory', 'parseOpenOrders', 'parseOption', 'parseOptionPosition',
    'parseOrderTrade', 'parseOrders', 'parsePerpetualTicker', 'parsePositionRisk',
    'parseSettlement', 'parseSettlements', 'parseSpotOrUtaTicker', 'parseSwapTicker',
    'parseTradingFee', 'parseTradingOrder', 'parseTradingViewOHLCV', 'parseWSSwapOrder',
    'parseWSTicker', 'parseWsBidAsk', 'parseWsFundingRate', 'parseWsInstrument',
    'parseWsLiquidation', 'parseWsMyLiquidation', 'parseWsMyTrade', 'parseWsOHLCVs',
    'parseWsOldTrade', 'parseWsOptionsPosition', 'parseWsOrder', 'parseWsOrderStatus',
    'parseWsOrderTrade', 'parseWsOrderUpdate', 'parseWsPosition', 'parseWsTrades',
    'parseWsUpdatedTicker', 'parseWsUtaOrder', 'parseWsUtaPosition', 'parseWsUtaTicker',
    'parseWsUtaTrade',
    // Further `object market` parameters admitted by the same rule (call sites pass null / a Dictionary
    // / IDictionary / an admitted name's own `market`, fixed point over both lists; body uses are dict uses).
    'CreateSpotOrder', 'CreateSwapOrder', 'checkContractMarket', 'createOrderRequest',
    'createPublicRequest', 'createSpotOrderRequest', 'customHandleDelta', 'customHandleDeltas',
    'customParseBidAsk', 'customParseOrderBook', 'editOrderRequest', 'findOutcomeInMarket',
    'futuresRequestId', 'getBybitType', 'getDexFromHip3Symbol', 'getGen2MarketId', 'getInstType',
    'getMarketIdByType', 'getMarketType', 'getOrderChannelAndMessageHash',
    'getProductGroupFromMarket', 'getTypeByMarket', 'getUrlByMarket',
    'getV5LinearChannelAndMessageHash', 'handleOrderBookMessage', 'handleProductTypeAndParams',
    'handleSubTypeAndParams', 'isNativeMarket', 'multiOrderSpotPrepareRequest', 'orderBookSuffix',
    'orderMessage', 'orderToTrade', 'parseAmmEventToOrder', 'parseFundingHistories',
    'parseFundingHistory', 'parseLeverageFromMarket', 'parsePosition', 'parseTradingFees',
    'prepareRequest', 'resolveAuthType', 'safeLiquidation', 'safeMarketStructure',
    'spotOrderPrepareRequest',
    'subscribe', 'toEp', 'toEv', 'toSandboxMarketId', 'unSubscribe', 'unWatch', 'unWatchPublic',
    'unsubscribePublic', 'watchPublic', 'wathPublic',
    // row builders whose every caller passes null, a dictionary or an admitted name's own `market`
    'fromEr', 'parseContractTrade', 'parseSpotOrUtaTrade',
];

// the emitted declaration line the pass rewrites, and the `market` parameter inside it (with and
// without the null default -- some venues declare the parameter required)
const PARSE_MARKET_SIG_RE = /^(\s*)public (async )?(virtual|override) ([\w<>., ?]+) (\w+)\((.*)\)\s*$/;
const PARSE_MARKET_PARAM_RE = /([(,]\s*)object(\s+market\s*=\s*null)(?=[,)])/g;
const PARSE_MARKET_PARAM_REQUIRED_RE = /([(,]\s*)object(\s+market)(?=[,)])/g;

// ws handler `object message` -> `Dictionary<string, object>` where every reference passes a dict: a
// dispatch-table entry selected by a key read off the message, or a direct call with a proven dict
// (statically `object` arguments get the cast). Handlers that can receive arrays/strings stay `object`.
const WS_HANDLER_DICT_MESSAGE: Record<string, string[]> = {
    alpaca: [ 'handleMyTrade', 'handleOrder', 'handleTradeUpdate' ],
    apex: [ 'handleAccount', 'handleAuthenticate', 'handleOHLCV', 'handleOrderBook', 'handlePong', 'handleSubscriptionStatus', 'handleTicker', 'handleTrades' ],
    backpack: [ 'handleBidAsk', 'handleOHLCV', 'handleOrder', 'handleOrderBook', 'handlePositions', 'handleTicker', 'handleTrades' ],
    binance: [ 'handleOptionsOrderUpdate', 'handleWsError' ],
    bingx: [ 'handleBalance', 'handleMyTrades', 'handleOHLCV', 'handleOrder', 'handleOrderBook', 'handlePositions', 'handleSubscriptionStatus', 'handleTrades' ],
    bitget: [ 'handleAuthenticate', 'handleOHLCVUnSubscription', 'handleOrderBookUnSubscription', 'handleSubscriptionStatus', 'handleTickerUnSubscription', 'handleTradesUnSubscription', 'handleUnSubscriptionStatus' ],
    bithumb: [ 'handleBalance', 'handleOrderBook', 'handleOrders', 'handleTicker', 'handleTrades' ],
    bitopro: [ 'handleBalance', 'handleMyTrade', 'handleOrderBook', 'handleTicker', 'handleTrade' ],
    bitrue: [ 'handleBalance', 'handleOHLCV', 'handleOrder', 'handleOrderBook', 'handleTicker', 'handleTrades' ],
    bitstamp: [ 'handleFundingRate', 'handleMyTrades', 'handleOrderBook', 'handleOrderBookSubscription', 'handleOrders', 'handleSubscriptionStatus', 'handleTrade', 'handleUnsubscriptionStatus' ],
    bittrade: [ 'handleSystemStatus' ],
    bitvavo: [ 'handleAuthenticationMessage', 'handleBidAsk', 'handleDeposits', 'handleErrorMessage', 'handleFetchBalance', 'handleFetchCurrencies', 'handleFetchOHLCV', 'handleMarkets', 'handleMultipleOrders', 'handleMyTrade', 'handleMyTrades', 'handleOHLCV', 'handleOrder', 'handleOrderBook', 'handleOrderBookSnapshot', 'handleOrderBookSubscriptions', 'handleSingleOrder', 'handleSubscriptionStatus', 'handleTicker', 'handleTrade', 'handleTradingFees', 'handleUnsubscriptionStatus', 'handleWithdraw', 'handleWithdraws' ],
    blockchaincom: [ 'handleAuthenticationMessage', 'handleBalance', 'handleOHLCV', 'handleOrderBook', 'handleOrders', 'handleTicker', 'handleTrades' ],
    blofin: [ 'handleBalance', 'handleBidAsk', 'handleFundingRate', 'handleOHLCV', 'handleOrderBook', 'handleOrders', 'handlePong', 'handlePositions', 'handleTicker', 'handleTrades' ],
    bullish: [ 'handleBalance', 'handleErrorMessage', 'handleMyTrades', 'handleOrderBook', 'handleOrders', 'handlePong', 'handlePositions', 'handleTicker', 'handleTrades' ],
    bybit: [ 'handleAuthenticate', 'handleBalance', 'handleLiquidation', 'handleMyTrades', 'handleOHLCV', 'handleOrder', 'handleOrderBook', 'handleOrderWs', 'handlePong', 'handlePositions', 'handleSubscriptionStatus', 'handleTicker', 'handleTrades', 'handleUnSubscribe' ],
    cex: [ 'handleAuthenticationMessage', 'handleBalance', 'handleConnected', 'handleErrorMessage', 'handleInitOHLCV', 'handleMyTrades', 'handleOHLCV', 'handleOHLCV1m', 'handleOHLCV24', 'handleOrderBookSnapshot', 'handleOrderBookUpdate', 'handleOrderUpdate', 'handleOrdersSnapshot', 'handleTicker', 'handleTrade', 'handleTradesInner', 'handleTradesSnapshot', 'handleTransaction' ],
    coinbase: [ 'handleHeartbeats', 'handleOrder', 'handleOrderBook', 'handleSubscriptionStatus', 'handleTickers', 'handleTrade' ],
    coinbaseexchange: [ 'handleErrorMessage', 'handleMyTrade', 'handleOrder', 'handleOrderBook', 'handleSubscriptionStatus', 'handleTicker', 'handleTrade' ],
    coinbaseinternational: [ 'handleFundingRate', 'handleInstrument', 'handleOHLCV', 'handleOrderBook', 'handleSubscriptionStatus', 'handleTicker', 'handleTrade' ],
    coinone: [ 'handleOrderBook', 'handlePong', 'handleTicker', 'handleTrades' ],
    cryptocom: [ 'handleAuthenticate', 'handleCancelAllOrders', 'handleOrder', 'handlePing', 'handleSubscribe', 'handleUnsubscribe' ],
    deepcoin: [ 'handleErrorMessage', 'handleMyTrade', 'handleOHLCV', 'handleOrder', 'handleOrderBook', 'handleOrderBookSnapshot', 'handlePosition', 'handleSubscriptionStatus', 'handleTicker', 'handleTrades' ],
    dydx: [ 'handleErrorMessage', 'handleOHLCV', 'handleOrderBook', 'handleTrades' ],
    extended: [ 'handleBalance', 'handleMarkPrice', 'handleMyTrades', 'handleOrders', 'handlePositions' ],
    gate: [ 'handleAuthenticationMessage', 'handleBalanceSubscription', 'handleOrderBookSubscription', 'handleSubscriptionStatus', 'handleUnSubscribe' ],
    grvt: [ 'handleMyTrade', 'handleOHLCV', 'handleOrder', 'handleOrderBook', 'handlePosition', 'handleTicker', 'handleTrades' ],
    hitbtc: [ 'handleBalance', 'handleBidAsk', 'handleNotification', 'handleOHLCV', 'handleOrder', 'handleOrderBook', 'handleOrderHelper', 'handleTicker', 'handleTrades' ],
    hollaex: [ 'handlePong' ],
    htx: [ 'handlePositions', 'handleSystemStatus' ],
    hyperliquid: [ 'handleActiveAssetCtx', 'handleBalance', 'handleMyTrades', 'handleOHLCV', 'handleOrder', 'handleOrderBook', 'handlePong', 'handlePositions', 'handleSubscriptionResponse', 'handleTrades', 'handleWsPost', 'handleWsTickers' ],
    kraken: [ 'handleBalance', 'handleCancelAllOrders', 'handleCancelOrder', 'handleCreateEditOrder', 'handleErrorMessage', 'handleHeartbeat', 'handleMyTrades', 'handleOHLCV', 'handleOrderBook', 'handleOrders', 'handlePong', 'handleSubscriptionStatus', 'handleSystemStatus', 'handleTicker', 'handleTrades' ],
    krakenfutures: [ 'handleAuthenticate', 'handleBalance', 'handleBidAsk', 'handleErrorMessage', 'handleMyTrades', 'handleOrder', 'handleOrderBook', 'handleOrderBookSnapshot', 'handleOrderSnapshot', 'handlePositions', 'handleTicker', 'handleTrade' ],
    kucoin: [ 'handleBalance', 'handleBidAsk', 'handleContractTicker', 'handleErrorMessage', 'handleMyTrade', 'handleOHLCV', 'handleOrder', 'handleOrderBook', 'handlePong', 'handlePosition', 'handleSubject', 'handleSubscriptionStatus', 'handleSystemStatus', 'handleTicker', 'handleTrade', 'handleUtaBalance', 'handleUtaFundingRate', 'handleUtaMyTrade', 'handleUtaOHLCV', 'handleUtaOrder', 'handleUtaOrderBook', 'handleUtaPosition', 'handleUtaTicker', 'handleUtaTrade' ],
    lbank: [ 'handleBalance', 'handleErrorMessage', 'handleOHLCV', 'handleOrderBook', 'handleOrders', 'handlePing', 'handleTicker', 'handleTrades' ],
    lighter: [ 'handleBalance', 'handleLiquidation', 'handleMyTrades', 'handleOrderBook', 'handleOrderBookMessage', 'handleOrders', 'handlePing', 'handleSubscriptionStatus', 'handleTicker', 'handleTrades', 'handleWsSendtxApi' ],
    mexc: [ 'handleOrderBookSubscription' ],
    mudrex: [ 'handleOHLCV', 'handleTicker' ],
    nado: [ 'handleAllBidsAsks', 'handleAuthentication', 'handleBidAsk', 'handleExecuteResponse', 'handleMyTrade', 'handleOHLCV', 'handleOrder', 'handleOrderBook', 'handlePosition', 'handleSubscription', 'handleTrade', 'handleUnsubscription' ],
    okx: [ 'handleAuthenticate', 'handleBalance', 'handleBalanceAndPosition', 'handleBidAsk', 'handleCancelAllOrders', 'handleFundingRate', 'handleLiquidation', 'handleMyLiquidation', 'handleMyTrades', 'handleOHLCV', 'handleOrderBook', 'handleOrders', 'handlePlaceOrders', 'handlePositions', 'handleSubscriptionStatus', 'handleTicker', 'handleTrades', 'handleUnsubscription' ],
    opinion: [ 'handleMyTrade', 'handleOrder', 'handleOrderBook', 'handleTicker', 'handleTrades' ],
    p2b: [ 'handleOHLCV', 'handleOrderBook', 'handlePong', 'handleTicker', 'handleTrade' ],
    pacifica: [ 'handleMyTrades', 'handleOHLCV', 'handleOrder', 'handleOrderBook', 'handlePong', 'handleSubscriptionResponse', 'handleTrades', 'handleWsPost', 'handleWsTickers' ],
    phemex: [ 'handleOHLCV', 'handleOrderBook', 'handleTicker', 'handleTrades' ],
    upbit: [ 'handleMyTrade' ],
    weex: [ 'handleBalance', 'handleBidAsk', 'handleMyTrades', 'handleOHLCV', 'handleOrderBook', 'handleOrders', 'handlePing', 'handlePositions', 'handleSubscriptionStatus', 'handleTicker', 'handleTrade' ],
    whitebit: [ 'handlePong', 'handleSubscriptionStatus' ],
    woo: [ 'handleAuth', 'handleBalance', 'handleBidAsk', 'handleFundingRate', 'handleOHLCV', 'handleOrderBook', 'handleOrderUpdate', 'handlePing', 'handlePong', 'handlePositions', 'handleSubscribe', 'handleTicker', 'handleTickers', 'handleTrade', 'handleUnSubscription' ],
    woofipro: [ 'handleAuth', 'handleBalance', 'handleBidAsk', 'handleOHLCV', 'handleOrderBook', 'handleOrderUpdate', 'handlePing', 'handlePong', 'handlePositions', 'handleSubscribe', 'handleTicker', 'handleTickers', 'handleTrade' ],
    xt: [ 'handleBalance', 'handleErrorMessage', 'handleFundingRate', 'handleMyTrades', 'handleOHLCV', 'handleOrder', 'handleOrderBook', 'handlePosition', 'handleTicker', 'handleTickers', 'handleTrade' ],
};

// ws handlers whose dispatcher hands an `IDictionary<string, object>`: retyped to the interface, the
// box the argument already has, so no call site changes. Admitted only when every reference is a keyed
// dispatch entry or a statically-dict argument and the body compiles unchanged; otherwise stays `object`.
const WS_HANDLER_IDICT_MESSAGE: Record<string, string[]> = {
    aster: [ 'handleBalanceAndPosition', 'handleBidAsk', 'handleOHLCV', 'handleOrder', 'handleOrderBook', 'handlePositions', 'handleTicker', 'handleTrade' ],
    bingx: [ 'handleUnSubscription' ],
    deepcoin: [ 'handleUnSubscription' ],
    htx: [ 'handleUnSubscription' ],
    hyperliquid: [ 'handleMyTradesUnsubscription', 'handleOHLCVUnsubscription', 'handleOrderBookUnsubscription', 'handleOrderUnsubscription', 'handlePositionsUnsubscription', 'handleSpotBalanceUnsubscription', 'handleTickerUnsubscription', 'handleTickersUnsubscription', 'handleTradesUnsubscription' ],
    independentreserve: [ 'handleHeartbeat', 'handleOrderBook', 'handleSubscriptions', 'handleTrades' ],
    modetrade: [ 'handleAuth', 'handleBalance', 'handleBidAsk', 'handleOHLCV', 'handleOrderBook', 'handleOrderUpdate', 'handlePing', 'handlePong', 'handlePositions', 'handleSubscribe', 'handleTicker', 'handleTickers', 'handleTrade' ],
    myriad: [ 'handleOrder', 'handleOrderBook', 'handlePosition', 'handleTicker', 'handleTrades' ],
    ndax: [ 'handleOHLCV', 'handleOrderBook', 'handleSubscriptionStatus', 'handleTicker', 'handleTrades' ],
    pacifica: [ 'handleMyTradesUnsubscription', 'handleOHLCVUnsubscription', 'handleOrderBookUnsubscription', 'handleOrderUnsubscription', 'handleTickersUnsubscription', 'handleTradesUnsubscription' ],
    poloniex: [ 'handleBalance', 'handleMyTrades', 'handleOHLCV', 'handleOrder', 'handleOrderBook', 'handleTicker', 'handleTrade' ],
    upbit: [ 'handleBalance', 'handleMyOrder', 'handleOHLCV', 'handleOrder', 'handleOrderBook', 'handleTicker', 'handleTrades' ],
    xt: [ 'handleUnSubscription' ],
};

// `sign()` / `handleErrors()` parameter types keyed by POSITION (overrides rename parameters; types are
// invariant), matching the hand-written base Exchange.cs. No `Var` shadow: every body write is a literal or
// dict producer. The table lives in build/csharp-local-types.js so the printer reads these positions too.

// Methods whose trailing `parameters` is typed `Dictionary<string, object> parameters = null`.
// C# overrides are invariant on parameter types, so a name is listed only when every declaration
// of it is rewritten by the same pass and no body/call site needs a non-dict value.

const GLOBAL_WRAPPER_FILE = './cs/ccxt/base/Exchange.Wrappers.cs';
// the fine-split moves the 62 symbol-based trading methods onto the concrete `Exchange` tier
// (not BaseExchange), so the sibling PredictionExchange tier does not inherit them
const GLOBAL_TRADING_WRAPPER_FILE = './cs/ccxt/base/Exchange.TradingWrappers.cs';
const BASE_TRADING_METHODS_FILE = './cs/ccxt/base/Exchange.TradingMethods.cs';
const EXCHANGE_WRAPPER_FOLDER = './cs/ccxt/wrappers/'
// ws + prediction class aliases are consolidated into one file each, mirroring the REST
// Exchange.Wrappers.cs, so no per-exchange wrapper directory survives
const WS_CLASS_ALIAS_FILE = './cs/ccxt/ws/Exchange.WsAliases.cs'
const PREDICTION_CLASS_ALIAS_FILE = './cs/ccxt/base/Exchange.PredictionAliases.cs'
const PREDICTION_WS_CLASS_ALIAS_FILE = './cs/ccxt/base/Exchange.PredictionWsAliases.cs'
const ERRORS_FILE = './cs/ccxt/base/Exchange.Errors.cs';
const BASE_METHODS_FILE = './cs/ccxt/base/Exchange.BaseMethods.cs';

// safeDict/safeList family: the printer emits `object` returns, the bodies return the real type, so
// signature and returns are retyped (found value cast, default handed back with `as`). Dictionaries
// name the interface (ConcurrentDictionary values pass through); the rewrite is exact-match and throws
// if the generated shape changes
const SAFE_COLLECTION_HELPER_TYPES: Record<string, string> = {
    'safeDict': 'IDictionary<string, object>',
    'safeDict2': 'IDictionary<string, object>',
    'safeDictN': 'IDictionary<string, object>',
    'safeList': 'List<object>',
    'safeList2': 'List<object>',
    'safeListN': 'List<object>',
};

// Native C# members for the list wrappers the printer emits (`getArrayLength(x)`, `((IList<object>)x)
// .ToArray()/.First()/.Last()`). The receiver counts only when its own declaration in the same
// method is a list type; see nativeListHelperCalls().
const CSHARP_MEMBER_SIGNATURE = /^\s*(?:public|private|protected|internal)\b/;
const CSHARP_TYPE_TOKEN = '[A-Za-z_][\\w.]*(?:<[^<>]*(?:<[^<>]*>)?[^<>]*>)?(?:\\?)?(?:\\[\\])?';
const CSHARP_TYPED_BINDING = new RegExp ('^\\s*(' + CSHARP_TYPE_TOKEN + ')\\s+([A-Za-z_]\\w*)\\s*(?:=\\s*(.*))?$');
const CSHARP_BARE_DECLARATION = new RegExp ('^\\s*(' + CSHARP_TYPE_TOKEN + ')\\s+([A-Za-z_]\\w*)\\s*;\\s*$');
const CSHARP_NON_TYPES = new Set ([ 'return', 'if', 'else', 'for', 'foreach', 'while', 'using', 'new',
    'lock', 'case', 'break', 'throw', 'await', 'yield', 'switch', 'do', 'try', 'catch', 'finally',
    'continue', 'goto', 'in', 'is', 'static', 'public', 'private', 'protected', 'internal', 'class',
    'namespace', 'delegate', 'event', 'params', 'checked', 'unchecked', 'from', 'where', 'select' ]);
const CSHARP_LIST_TYPE_RECEIVER = /^(?:IList|List)</;
const CSHARP_LIST_RECEIVER_CALL = /getArrayLength\(([A-Za-z_]\w*)\)|\(\(IList<object>\)([A-Za-z_]\w*)\)\.(ToArray|First|Last)\(\)/g;
// `((IList<object>)x)` is an identity conversion when x's emitted type already is List/IList<object>;
// dropped only before accesses that resolve identically (indexer, Add, ToArray, First, Last), not
// before `.Reverse()/.Sort()`, which are void List instance methods.
const CSHARP_IDENTITY_LIST_CAST = /\(\(IList<object>\)\s*([A-Za-z_]\w*)\s*\)(\.Add\(|\[|\.ToArray\(\)|\.First\(\)|\.Last\(\))/g;
// the same identity around the hand-written ws cache: `ccxt.pro.OrderBook.cache` is declared
// `IList<object>` (cs/ccxt/ws/OrderBook.cs:22/:33), so the cast is a no-op on that member read
const CSHARP_ORDERBOOK_CACHE_CAST = /\(\(IList<object>\)(?:\(IList<object>\))?\(+([A-Za-z_]\w*) as ccxt\.pro\.OrderBook\)\.cache\)+\.Add\(/g;

// locate a whole transpiled C# method
// by name — the span stripCSharpMethod() cuts out, kept addressable so a rewritten method
// can be spliced back at its original position
function findCSharpMethodSpan (body: string, name: string): { start: number, end: number, method: string } | undefined {
    const sigRe = new RegExp ('\\n([ \\t]*)public [^\\n]*\\b' + name + '\\s*\\(');
    const m = sigRe.exec (body);
    if (!m) {
        return undefined;
    }
    const start = m.index; // the '\n' just before the signature line
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
    return { start, end, method: body.substring (start, end) };
}
const EXCHANGES_FOLDER = './cs/ccxt/exchanges/';
const EXCHANGES_WS_FOLDER = './cs/ccxt/exchanges/pro/';
const EXCHANGES_PREDICTION_FOLDER = './cs/ccxt/exchanges/prediction/';
const EXCHANGE_PREDICTION_WRAPPER_FOLDER = './cs/ccxt/wrappers/prediction/';
const EXCHANGES_PREDICTION_WS_FOLDER = './cs/ccxt/exchanges/prediction/pro/';
const BASE_TESTS_FOLDER = './cs/tests/Generated/Base';
const BASE_TESTS_FILE =  './cs/tests/Generated/TestMethods.cs';
const EXCHANGE_BASE_FOLDER = './cs/tests/Generated/Exchange/Base/';
const EXCHANGE_GENERATED_FOLDER = './cs/tests/Generated/Exchange/';

// default min(2, AP): 2w + shared-Program chunks is within ~10–15% of 4w and uses fewer cores.
// Override with CCXT_TRANSPILE_PROCESSES.
function csharpWorkerThreads () {
    const requested = Number (process.env.CCXT_TRANSPILE_PROCESSES);
    if (requested > 0) {
        return Math.min (requested, 3);
    }
    return Math.max (1, Math.min (2, os.availableParallelism ()));
}

// Typed-core return conversions the operand's declared type makes unnecessary, proven from the
// runtime's declarations: `From<T>(v)` is the identity, `To<R>(x)` on an `R` operand is the
// identity (`Int64?` -> `?? 0`), and the snapshot helper on `limit()` is `.Copy()`.
interface CsharpRuntimeDecl { ret: string, params: { type: string, name: string }[], body: string }
const CSHARP_RUNTIME_BASE_DIR = resolve (__dirname, '..', 'cs', 'ccxt', 'base')
const CSHARP_RUNTIME_BOOK_FILE = resolve (__dirname, '..', 'cs', 'ccxt', 'ws', 'OrderBook.cs')
const CSHARP_RUNTIME_DECL_RE = /^\s*public\s+(?:(?:static|async|virtual|override|new|sealed|abstract|extern|unsafe)\s+)*([\w<>,.?\[\]]+(?:\s+[\w<>,.?\[\]]+)*?)\s+([A-Za-z_]\w*)\s*\((.*)\)\s*(?:\{.*|=>.*)?$/
let csharpRuntimeBaseDecls: Map<string, CsharpRuntimeDecl[]> | undefined
let csharpRuntimeBookDecls: Map<string, CsharpRuntimeDecl[]> | undefined
let csharpOwnDeclsCache: { content: string, decls: Map<string, CsharpRuntimeDecl[]> } | undefined

// `long` and `Int64` are one C# type
function csharpNormalizeDeclaredType (type: string): string {
    return type.replace (/\blong\b/g, 'Int64').replace (/\s+/g, ' ').trim ()
}

// The C# type each BaseExchange member declares in cs/ccxt/base/Exchange.Options.cs; the printer uses
// it to emit native dictionary reads for `this.<member>[key]` / `key in this.<member>`. A member
// declared twice or not at all is absent and keeps the helper.
const CSHARP_BASE_FIELD_DECLARATION = /^\s*public\s+(?!static\b|virtual\b|override\b|async\b|class\b)([A-Za-z_][\w<>,. ?]*?)\s+([A-Za-z_]\w*)\s*(?:\{|=|;)/
function csharpDeclaredBaseFieldTypes (): { [name: string]: string } {
    const table: { [name: string]: string } = {}
    const seen = new Set<string> ()
    let content = ''
    try {
        content = fs.readFileSync (join (CSHARP_RUNTIME_BASE_DIR, 'Exchange.Options.cs'), 'utf8')
    } catch (e) {
        content = '' // a checkout without the hand-written base: nothing is declared
    }
    for (const line of content.split ('\n')) {
        const match = CSHARP_BASE_FIELD_DECLARATION.exec (line)
        if (match === null) {
            continue
        }
        if (seen.has (match[2])) {
            delete table[match[2]]
            continue
        }
        seen.add (match[2])
        table[match[2]] = match[1].trim ().replace (/\s*,\s*/g, ', ')
    }
    return table
}

// method names declared once in ts/src (outside base/, test/) with a non-Promise return annotation: the candidates
// of the printer's inferred collection return (config.csharp.uniqueMethodNames); empty without sources
function csharpDeclaredUniqueMethods (): string[] {
    const counts = new Map<string, number> ()
    const annotated = new Set<string> ()
    const declaration = /^[ \t]+((?:(?:public|protected|private|override|async|static)\s+)*)([A-Za-z_$][\w$]*)\s*\((?:[^()]|\([^()]*\))*\)\s*(?::\s*([^{;=]+?)\s*)?\{/gm
    const walk = (dir: string) => {
        for (const entry of fs.readdirSync (dir, { withFileTypes: true })) {
            const full = join (dir, entry.name)
            if (entry.isDirectory ()) {
                if (entry.name !== 'node_modules') walk (full)
                continue
            }
            const text = isTsIndexSource (entry.name) ? readTsIndexSource (full) : undefined
            for (const m of text !== undefined ? text.matchAll (declaration) : []) {
                counts.set (m[2], (counts.get (m[2]) ?? 0) + 1)
                if (m[3] && !/\b(async|override)\b/.test (m[1]) && !/^Promise\b/.test (m[3]) && !/[\\/](base|test)[\\/]/.test (full)) annotated.add (m[2])
            }
        }
    }
    const root = resolve (__dirname, '..', 'ts', 'src')
    try {
        walk (root)
    } catch (e) {
        annotated.clear () // no corpus: nothing proves
        if (fs.existsSync (root)) {
            throw e
        }
    }
    return [ ...annotated ].filter ((name) => counts.get (name) === 1).sort ()
}

function csharpScanDeclarations (lines: string[]): Map<string, CsharpRuntimeDecl[]> {
    const out = new Map<string, CsharpRuntimeDecl[]> ()
    for (let i = 0; i < lines.length; i++) {
        const sig = CSHARP_RUNTIME_DECL_RE.exec (lines[i])
        if (sig === null) {
            continue
        }
        const params: { type: string, name: string }[] = []
        let nesting = 0
        let current = ''
        const parts: string[] = []
        for (const ch of sig[3]) {
            nesting += (ch === '<') ? 1 : ((ch === '>') ? -1 : 0)
            if ((ch === ',') && (nesting === 0)) {
                parts.push (current)
                current = ''
            } else {
                current += ch
            }
        }
        parts.push (current)
        for (const part of parts) {
            const tokens = part.split ('=')[0].trim ().split (/\s+/)
            if (tokens.length >= 2) {
                params.push ({ type: csharpNormalizeDeclaredType (tokens.slice (0, -1).join (' ')), name: tokens[tokens.length - 1] })
            }
        }
        // a brace-scoped body on the following lines (one-statement helpers, `limit()`)
        const body: string[] = []
        if (/\{\s*$/.test (lines[i]) || ((i + 1 < lines.length) && (lines[i + 1].trim () === '{'))) {
            let depth = 0
            for (let j = /\{\s*$/.test (lines[i]) ? i : i + 1; (j < lines.length) && (j < i + 80); j++) {
                const text = lines[j].replace (/\/\/.*$/, '').trim ()
                if (text !== '') {
                    body.push (text)
                }
                depth += (text.match (/\{/g) ?? []).length - (text.match (/\}/g) ?? []).length
                if (depth <= 0) {
                    break
                }
            }
        }
        const list = out.get (sig[2]) ?? []
        list.push ({ ret: csharpNormalizeDeclaredType (sig[1]), params, body: body.join (' ') })
        out.set (sig[2], list)
    }
    return out
}

function csharpRuntimeDeclarations (): Map<string, CsharpRuntimeDecl[]> {
    if (csharpRuntimeBaseDecls === undefined) {
        // Exchange.BaseMethods.cs is regenerated by the same run: a type read from it would depend on stage order
        const lines: string[] = []
        for (const name of fs.readdirSync (CSHARP_RUNTIME_BASE_DIR).filter ((n) => n.endsWith ('.cs') && n !== 'Exchange.BaseMethods.cs').sort ()) {
            lines.push (...fs.readFileSync (join (CSHARP_RUNTIME_BASE_DIR, name), 'utf8').split ('\n'))
        }
        csharpRuntimeBaseDecls = csharpScanDeclarations (lines)
    }
    return csharpRuntimeBaseDecls
}

// `IOrderBook limit();` on the ws interface and every implementation returning `this`: the live,
// non-null book, so `.Copy()` is the snapshot helper's own arm
function csharpBookLimitReturnsSelf (): boolean {
    if (csharpRuntimeBookDecls === undefined) {
        const lines = fs.readFileSync (CSHARP_RUNTIME_BOOK_FILE, 'utf8').split ('\n')
        const scanned = csharpScanDeclarations (lines)
        const implementations = (scanned.get ('limit') ?? []).filter ((d) => d.ret === 'IOrderBook' && d.params.length === 0)
        const declared = lines.some ((line) => /^\s*IOrderBook limit\(\);\s*$/.test (line))
        csharpRuntimeBookDecls = (declared && implementations.length > 0 && implementations.every ((d) => /return this; \}$/.test (d.body)))
            ? new Map ([ [ 'limit', implementations ] ]) : new Map ()
    }
    return csharpRuntimeBookDecls.has ('limit')
}


// `From<T>(T value) { return value; }` declared in the runtime: the typed core's `T` is handed back as is
function csharpHelperIsIdentity (helper: string, type: string): boolean {
    const declared = csharpRuntimeDeclarations ().get (helper.replace (/^ccxt\.BaseExchange\./, '')) ?? []
    return declared.some ((d) => d.params.length === 1 && d.ret === type && d.params[0].type === type
        && d.body === '{ return ' + d.params[0].name + '; }')
}

// the declared C# type of a return operand: a local / parameter bound exactly once in the method
// (a foreach variable counts as a second binding), or a `this.<name>(...)` call whose every
// declaration (runtime + the emitted class) names one return type. '' = unproven
function csharpDeclaredOperandType (value: string, content: string, methodLines: string[]): string {
    const lines = methodLines.filter ((line) => line !== null)
    if (/^[A-Za-z_]\w*$/.test (value)) {
        const masked = lines.map (csharpHelperMaskLine)
        const bound: string[] = []
        for (const line of masked) {
            const declaration = csharpHelperDeclarationOfLine (line)
            if ((declaration !== undefined) && (declaration.name === value)) {
                bound.push (csharpNormalizeDeclaredType (declaration.type))
            }
            const implicit = /^\s*var\s+(\w+)\s*=/.exec (line)
            if ((implicit !== null) && (implicit[1] === value)) {
                bound.push ('var')
            }
            const each = /^\s*foreach\s*\(\s*[\w<>,.?\[\] ]+?\s+(\w+)\s+in\b/.exec (line)
            if ((each !== null) && (each[1] === value)) {
                bound.push ('foreach')
            }
        }
        const param = csharpHelperSignatureParams (masked, 0)[value]
        if (param !== undefined) {
            bound.push (csharpNormalizeDeclaredType (param))
        }
        return (bound.length === 1) ? bound[0] : ''
    }
    const call = /^this\.([A-Za-z_]\w*)\(/.exec (value)
    if ((call === null) || (csharpMatchingClose (value, call[0].length - 1, '(', ')', '"') !== value.length - 1)) {
        return ''
    }
    if ((csharpOwnDeclsCache === undefined) || (csharpOwnDeclsCache.content !== content)) {
        csharpOwnDeclsCache = { content, decls: csharpScanDeclarations (content.split ('\n')) }
    }
    const types = new Set<string> ()
    for (const d of (csharpRuntimeDeclarations ().get (call[1]) ?? []).concat (csharpOwnDeclsCache.decls.get (call[1]) ?? [])) {
        types.add (d.ret)
    }
    return (types.size === 1) ? Array.from (types)[0] : ''
}

// the native expression a `To<R>(object)` wrapper collapses to, or '' when the helper stays
function csharpNativeCoreConversion (helper: string, value: string, content: string, methodLines: string[]): string {
    const name = helper.replace (/^ccxt\.BaseExchange\./, '')
    const declared = (csharpRuntimeDeclarations ().get (name) ?? []).filter ((d) => d.params.length === 1 && d.params[0].type === 'object')
    if (declared.length !== 1) {
        return ''
    }
    const ret = declared[0].ret
    const body = declared[0].body
    if (ret === 'ccxt.pro.IOrderBook') {
        // `(value is IOrderBook book) ? book.Copy() : null` on a `limit()` read of a proven IOrderBook
        const limit = /^\(([A-Za-z_]\w*) as (?:ccxt\.pro\.)?IOrderBook\)\.limit\(\)$/.exec (value)
        return (limit !== null) && /\(value is ccxt\.pro\.IOrderBook (\w+)\) \? \1\.Copy\(\) : null; \}$/.test (body) && csharpBookLimitReturnsSelf ()
            ? value + '.Copy()' : ''
    }
    const operand = csharpDeclaredOperandType (value, content, methodLines)
    if (ret === 'Int64') {
        // ToInt64Value delegates to ToInt64ArgRequired: `(value == null) ? 0 : Convert.ToInt64(value, ...)`
        const required = (csharpRuntimeDeclarations ().get ('ToInt64ArgRequired') ?? []).filter ((d) => d.ret === 'Int64' && d.params.length === 1 && d.params[0].type === 'object')
        if ((required.length !== 1) || !/^\{ return \(value == null\) \? 0 : Convert\.ToInt64\(value, System\.Globalization\.CultureInfo\.InvariantCulture\); \}$/.test (required[0].body)
                || !/^\{ return ToInt64ArgRequired\(value\); \}$/.test (body)) {
            return ''
        }
        return (operand === 'Int64') ? value : ((operand === 'Int64?') ? value + ' ?? 0' : '')
    }
    if (ret === 'string') {
        // `if (value is string s) { return s; }` first, everything else stringified or null
        return /^\{ if \(value is string s\) \{ return s; \}/.test (body) && ((operand === 'string') || (operand === 'string?')) ? value : ''
    }
    return ''
}

// A typed-core `return` whose operand already has the dictionary type the To* funnel materialises
// prints bare. Proofs come from emitted declaration text only (this file, cs/ccxt/base, cs/ccxt/api).
// the two dictionary shapes the funnels materialise; every other target stays untouched
const CSHARP_RET_TARGETS = [ 'Dictionary<string, object>', 'List<Dictionary<string, object>>' ]
const CSHARP_RET_ROOT = resolve (__dirname, '..', 'cs', 'ccxt')

const CSHARP_RET_API_METHOD = /^\s*public async Task<(.+)> (\w+) \(object parameters = null\)/
const CSHARP_RET_SIGNATURE = /^\s*(?:public|private|protected|internal)\s+(?:static\s+|async\s+|virtual\s+|override\s+|new\s+|sealed\s+)*([\w<>,.?\[\]\s]+?)\s+([A-Za-z_]\w*)\s*\(/
// one local declaration; `var` counts as an occurrence but can never prove a type
const CSHARP_RET_DECLARATION = /^\s*(var|object|string\??|bool\??|double\??|Int64\??|int\??|I?List<[\w<>,.? ]*>|I?Dictionary<[\w<>,.? ]*>|ccxt\.[\w.<>?]+)\s+([A-Za-z_]\w*)\s*(?:=[^=]|;)/
const CSHARP_RET_FOREACH = /^\s*foreach\s*\(\s*([\w<>,.?\s]+?)\s+([A-Za-z_]\w*)\s+in\b/
const CSHARP_RET_IDENTIFIER = /^[A-Za-z_]\w*$/
const CSHARP_RET_CALL = /^(await\s+)?(this|base)\.([A-Za-z_]\w*)\s*\(/
const CSHARP_RET_BARE_CALL = /^(await\s+)?([A-Za-z_]\w*)\s*\(/

const csharpRetApiTables = new Map<string, Map<string, string> | undefined> ()
const csharpRetSameFileSignatures = new Map<string, Map<string, Set<string>>> ()
let csharpRetBaseSignatures: Map<string, Set<string>> | undefined

// the venue id the content is emitted into: the generated class carries it
function csharpRetVenue (content: string): string {
    const match = /^\s*public (?:partial )?class (\w+)/m.exec (content)
    return (match === null) ? '' : match[1]
}

// implicit-API endpoints: the generated wrapper's own `Task<T>` is what the compiler sees
function csharpRetApiTable (venue: string, prediction: boolean): Map<string, string> | undefined {
    if (venue === '') {
        return undefined
    }
    const key = (prediction ? 'prediction:' : 'root:') + venue
    if (csharpRetApiTables.has (key)) {
        return csharpRetApiTables.get (key)
    }
    const predictionFile = join (CSHARP_RET_ROOT, 'api', 'prediction', venue + '.cs')
    const rootFile = join (CSHARP_RET_ROOT, 'api', venue + '.cs')
    const candidates = prediction ? [ predictionFile, rootFile ] : [ rootFile, predictionFile ]
    let table: Map<string, string> | undefined
    for (const file of candidates) {
        let text
        try {
            text = fs.readFileSync (file, 'utf8')
        } catch (e) {
            continue // hand-written venue or a checkout without the generated api tree
        }
        table = new Map ()
        for (const line of text.split ('\n')) {
            const match = CSHARP_RET_API_METHOD.exec (line)
            if ((match !== null) && (match[1] !== 'object')) {
                table.set (match[2], match[1])
            }
        }
        break
    }
    csharpRetApiTables.set (key, table)
    return table
}

// add each signature's declared return type in `text` to `index` (by method name)
function csharpRetIndexSignatures (index: Map<string, Set<string>>, text: string): Map<string, Set<string>> {
    for (const line of text.split ('\n')) {
        const match = CSHARP_RET_SIGNATURE.exec (line)
        if (match !== null) {
            index.set (match[2], (index.get (match[2]) ?? new Set<string> ()).add (match[1].trim ()))
        }
    }
    return index
}

function csharpRetBaseIndex (): Map<string, Set<string>> {
    if (csharpRetBaseSignatures !== undefined) {
        return csharpRetBaseSignatures
    }
    const index = new Map<string, Set<string>> ()
    let files: string[] = []
    try {
        files = fs.readdirSync (join (CSHARP_RET_ROOT, 'base')).filter ((f) => f.endsWith ('.cs'))
    } catch (e) {
        files = []
    }
    for (const file of files) {
        let text
        try {
            text = fs.readFileSync (join (CSHARP_RET_ROOT, 'base', file), 'utf8')
        } catch (e) {
            continue
        }
        // a generated base file is rewritten during this same build: reading it here would make
        // the proof depend on the pass order, so only the hand-written files are evidence
        if (text.indexOf ('IT IS GENERATED AND WILL BE OVERWRITTEN') !== -1) {
            continue
        }
        csharpRetIndexSignatures (index, text)
    }
    csharpRetBaseSignatures = index
    return index
}

function csharpRetSameFileIndex (content: string): Map<string, Set<string>> {
    const cached = csharpRetSameFileSignatures.get (content)
    if (cached !== undefined) {
        return cached
    }
    const index = csharpRetIndexSignatures (new Map<string, Set<string>> (), content)
    if (csharpRetSameFileSignatures.size > 64) {
        csharpRetSameFileSignatures.clear ()
    }
    csharpRetSameFileSignatures.set (content, index)
    return index
}

// every declared C# return type of `name` the emitted text proves; >1 distinct spelling is unproven
function csharpRetDeclaredReturnTypes (content: string, name: string): string[] {
    // a pascalized call site reads the camelCase declaration (typeCores runs before the rename)
    const sameFile = csharpRetSameFileIndex (content)
    const found = sameFile.get (name) ?? sameFile.get (name.charAt (0).toLowerCase () + name.slice (1)) ?? csharpRetBaseIndex ().get (name)
    return [ ...(found ?? []) ]
}

function csharpRetUnwrapTask (type: string): string {
    const match = /^Task<(.+)>$/.exec (type)
    return (match === null) ? type : match[1]
}

function csharpRetSplitParams (plist: string): string[] {
    const out: string[] = []
    let depth = 0
    let current = ''
    for (const ch of plist) {
        if ((ch === '<') || (ch === '(') || (ch === '[')) {
            depth += 1
        } else if ((ch === '>') || (ch === ')') || (ch === ']')) {
            depth -= 1
        }
        if ((ch === ',') && (depth === 0)) {
            out.push (current)
            current = ''
            continue
        }
        current += ch
    }
    out.push (current)
    return out.filter ((p) => p.trim () !== '')
}

// name -> every binding the method text declares (one binding per name per method in C#,
// except sibling blocks, whose duplicate makes the name unprovable)
function csharpRetMethodBindings (methodLines: string[]): Map<string, string[]> {
    const bindings = new Map<string, string[]> ()
    const add = (name: string, type: string) => bindings.set (name, (bindings.get (name) ?? []).concat (type))
    for (let i = 0; i < methodLines.length; i++) {
        const line = methodLines[i]
        const trimmed = line.trimStart ()
        if ((i > 0) && (trimmed.startsWith ('//') || trimmed.startsWith ('*'))) {
            continue
        }
        const declaration = CSHARP_RET_DECLARATION.exec (line)
        if (declaration !== null) {
            add (declaration[2], declaration[1].trim ())
            continue
        }
        const loop = CSHARP_RET_FOREACH.exec (line)
        if (loop !== null) {
            add (loop[2], loop[1].trim ())
        }
    }
    // parameters of the enclosing signature line
    const signature = (methodLines.length > 0) ? methodLines[0] : ''
    const open = signature.indexOf ('(')
    const close = signature.lastIndexOf (')')
    if ((open !== -1) && (close > open)) {
        for (const param of csharpRetSplitParams (signature.substring (open + 1, close))) {
            const decl = param.split ('=')[0].trim ().split (/\s+/)
            if (decl.length >= 2) {
                add (decl[decl.length - 1], decl.slice (0, -1).join (' '))
            }
        }
    }
    return bindings
}

// whether wrapping `expr` in the helper materialising `targetType` only renames its type
function csharpReturnIsAlreadyTyped (expr: string, targetType: string, content: string, methodLines: string[], prediction = false): boolean {
    if (CSHARP_RET_TARGETS.indexOf (targetType) === -1) {
        return false
    }
    const value = expr.trim ()
    if (value === '') {
        return false
    }
    // `null` fits every reference-typed return: the helper hands it back unchanged
    if (value === 'null') {
        return true
    }
    if (value.startsWith ('new ' + targetType)) {
        return true
    }
    const call = CSHARP_RET_CALL.exec (value) ?? CSHARP_RET_BARE_CALL.exec (value)
    if (call !== null) {
        const awaited = call[1] !== undefined
        const name = (call.length === 4) ? call[3] : call[2]
        if (awaited) {
            const api = csharpRetApiTable (csharpRetVenue (content), prediction)
            if ((api !== undefined) && api.has (name)) {
                return api.get (name) === targetType
            }
        }
        const declared = csharpRetDeclaredReturnTypes (content, name)
        if (declared.length !== 1) {
            return false
        }
        return (awaited ? csharpRetUnwrapTask (declared[0]) : declared[0]) === targetType
    }
    if (CSHARP_RET_IDENTIFIER.test (value)) {
        const bindings = csharpRetMethodBindings (methodLines)
        const types = bindings.get (value)
        return (types !== undefined) && (types.length === 1) && (types[0] === targetType)
    }
    return false
}

// --self-test: each return/argument identity accepts only its own declared shape
function csharpReturnIdentitySelfTest (): string[] {
    const pad = '    '
    const wrap = (lines: string[]) => [ 'public class Test {', pad + 'public virtual Dictionary<string, object> helper(object value = null)', pad + '{', pad + pad + 'return null;', pad + '}', pad + 'public async override Task<Dictionary<string, object>> f(object parameters = null)', pad + '{' ].concat (lines, [ pad + '}', '}' ]).join ('\n')
    const text = wrap ([
        pad + pad + 'object boxed = null;',
        pad + pad + 'Dictionary<string, object> row = new Dictionary<string, object>() {};',
        pad + pad + 'IDictionary<string, object> iface = this.safeDict(parameters, "k");',
        pad + pad + 'foreach (var entry in new List<object>() {})',
        pad + pad + '{',
        pad + pad + pad + 'object entryCopy = entry;',
        pad + pad + '}',
    ])
    const methodLines = text.split ('\n')
    const dictionary = 'Dictionary<string, object>'
    const dictList = 'List<Dictionary<string, object>>'
    const cases: [string, string, string, boolean][] = [
        [ 'null', 'null', dictionary, true ],
        [ 'new-dict', 'new Dictionary<string, object>() {}', dictionary, true ],
        [ 'new-dictlist', 'new List<Dictionary<string, object>>() {}', dictList, true ],
        [ 'local-typed', 'row', dictionary, true ],
        [ 'local-boxed', 'boxed', dictionary, false ],
        [ 'local-interface', 'iface', dictionary, false ],
        [ 'foreach-var', 'entry', dictionary, false ],
        [ 'wrong-target', 'null', 'Int64', false ],
        [ 'unindexed-call', 'this.unknownHelper(parameters)', dictionary, false ],
        [ 'typed-call', 'this.helper(parameters)', dictionary, true ],
        [ 'awaited-typed', 'await this.f(parameters)', dictionary, true ],
    ]
    const problems: string[] = []
    for (const [ name, expr, target, expected ] of cases) {
        const got = csharpReturnIsAlreadyTyped (expr, target, text, methodLines)
        if (got !== expected) {
            problems.push ('[return identity] ' + name + ' expected ' + String (expected) + ' got ' + String (got))
        }
    }
    return problems
}

// --self-test: each rule accepts only its own declared shape
function csharpTypedCoreConversionSelfTest (): string[] {
    const problems: string[] = []
    const expect = (name: string, got: string | boolean, expected: string | boolean) => {
        if (got !== expected) {
            problems.push ('[RF-cs-2-d] ' + name + ' expected `' + expected + '` got `' + got + '`')
        }
    }
    expect ('identity FromDict', csharpHelperIsIdentity ('ccxt.BaseExchange.FromDict', 'Dictionary<string, object>'), true)
    expect ('identity FromInt64', csharpHelperIsIdentity ('ccxt.BaseExchange.FromInt64', 'Int64'), true)
    expect ('identity FromStringValue', csharpHelperIsIdentity ('ccxt.BaseExchange.FromStringValue', 'string'), true)
    expect ('identity wrong type', csharpHelperIsIdentity ('ccxt.BaseExchange.FromInt64', 'string'), false)
    expect ('identity ToDict', csharpHelperIsIdentity ('ccxt.BaseExchange.ToDict', 'Dictionary<string, object>'), false)
    expect ('identity FromDictList reboxes', csharpHelperIsIdentity ('ccxt.BaseExchange.FromDictList', 'List<Dictionary<string, object>>'), false)
    expect ('identity FromOHLCVDict converts', csharpHelperIsIdentity ('ccxt.BaseExchange.FromOHLCVDict', 'Dictionary<string, Dictionary<string, List<OHLCV>>>'), false)
    const snapshot = 'ccxt.BaseExchange.ToOrderBookSnapshot'
    expect ('snapshot-limit', csharpNativeCoreConversion (snapshot, '(orderbook as IOrderBook).limit()', '', []), '(orderbook as IOrderBook).limit().Copy()')
    expect ('snapshot-qualified', csharpNativeCoreConversion (snapshot, '(orderbook as ccxt.pro.IOrderBook).limit()', '', []), '(orderbook as ccxt.pro.IOrderBook).limit().Copy()')
    expect ('snapshot-bare', csharpNativeCoreConversion (snapshot, 'orderbook', '', []), '')
    expect ('snapshot-copy', csharpNativeCoreConversion (snapshot, '(orderbook as IOrderBook).Copy()', '', []), '')
    expect ('snapshot-prediction', csharpNativeCoreConversion ('ccxt.BaseExchange.ToPredictionOrderBookSnapshot', '(orderbook as IOrderBook).limit()', '', []), '')
    const body = [
        'public async override Task<Int64> FetchTime(object parameters = null)',
        '{',
        '    Int64? timestamp = this.safeInteger(response, "timestamp");',
        '    Int64 fixedTimestamp = this.safeTimestamp(response, "ts");',
        '    object boxed = this.safeInteger(response, "ts");',
        '    foreach (var row in new List<object>() {})',
        '    {',
        '        Int64? shadowed = null;',
        '    }',
        '    Int64? shadowed = null;',
        '    return ccxt.BaseExchange.ToInt64Value(timestamp);',
        '}',
    ]
    const int64 = (value: string) => csharpNativeCoreConversion ('ccxt.BaseExchange.ToInt64Value', value, '', body)
    expect ('int64-nullable-local', int64 ('timestamp'), 'timestamp ?? 0')
    expect ('int64-value-local', int64 ('fixedTimestamp'), 'fixedTimestamp')
    expect ('int64-object-local', int64 ('boxed'), '')
    expect ('int64-param', int64 ('parameters'), '')
    expect ('int64-multi-binding', int64 ('shadowed'), '')
    expect ('int64-milliseconds', int64 ('this.milliseconds()'), 'this.milliseconds()')
    expect ('int64-safeinteger', int64 ('this.safeInteger(response, "ts")'), 'this.safeInteger(response, "ts") ?? 0')
    expect ('int64-safetimestamp', int64 ('this.safeTimestamp(response, "ts")'), 'this.safeTimestamp(response, "ts") ?? 0')
    expect ('int64-sum-of-calls', int64 ('this.safeInteger(a, "x") + this.safeInteger(b, "y")'), '')
    expect ('int64-generated-base', int64 ('this.parseToInt(nonce)'), '')
    expect ('int64-literal', int64 ('null'), '')
    const strBody = [
        'public async virtual Task<string> FetchAccountIdByType(object type, object parameters = null)',
        '{',
        '    string? accountId = this.safeString(parameters, "id");',
        '    object boxed = this.safeString(parameters, "id");',
        '}',
    ]
    const str = (value: string) => csharpNativeCoreConversion ('ccxt.BaseExchange.ToStringValue', value, '', strBody)
    expect ('string-local', str ('accountId'), 'accountId')
    expect ('string-object-local', str ('boxed'), '')
    expect ('string-param', str ('type'), '')
    expect ('string-safestring', str ('this.safeString(account, "id")'), 'this.safeString(account, "id")')
    expect ('string-call-tail', str ('this.safeString(a, "id") + "x"'), '')
    return problems
}

class NewTranspiler {

    transpiler!: Transpiler;
    pythonStandardLibraries;
    piscina: Piscina | undefined;
    oldTranspiler = new OldTranspiler();
    // true while transpiling the prediction-market exchanges (ts/src/prediction/),
    // which live in the ccxt.prediction / ccxt.prediction.pro namespaces
    isPrediction = false;
    // the ts/src id of the class currently being emitted ('' for the base tiers and the
    // tests), so VENUE_TYPED_CORES can type one method name per class
    currentVenue = '';
    // derived venue -> parent venue (bequant -> hitbtc), read off the `class X : Y` line
    venueParents: Record<string, string> = {};
    // set once PredictionExchange.cs has been emitted in this process. A full run reaches
    // transpilePredictionBaseMethods twice (recursive prediction pass, then the main pass)
    // with identical inputs, so the second call would only rewrite the same bytes.
    private _predictionBaseWritten = false;

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
            [/new\sgetValue\((\w+),\s(\w+)\)\((\w+)\)/gm, 'this.newException(getValue($1, $2), $3)'],
            [/client\.subscriptions/gm, '((WebSocketClient)client).subscriptions'],
            [/Dictionary<string,object>\)client.futures/gm, 'Dictionary<string, ccxt.Exchange.Future>)client.futures'],
            [/this\.safeValue\(client\.futures,/gm, 'this.safeValue((client as WebSocketClient).futures,'],
            // reads of the cached orderbook map go through the typed helpers added next to
            // safeValue in cs/ccxt/ws/Exchange.WsBridge.cs (both return ccxt.pro.IOrderBook;
            // the map only ever holds this.orderBook()/indexedOrderBook()/countedOrderBook()
            // instances, so the value inside the box is unchanged)
            [/this\.safeValue\((this\.orderbooks),/gm, 'this.safeOrderBook($1,'],
            [/getValue\((this\.orderbooks),/gm, 'this.getOrderBook($1,'],
            [/Dictionary<string,object>\)this\.clients/gm, 'Dictionary<string, ccxt.Exchange.WebSocketClient>)this.clients'],
            [/(orderbook)(\.reset.+)/gm, '($1 as IOrderBook)$2'],
            [/(\w+)(\.cache)/gm, '($1 as ccxt.pro.OrderBook)$2'],
            //  [/(\w+)(\.reset)/gm, '($1 as ccxt.OrderBook)$2'],
            // every cache variable's hashmap read goes through ArrayCache
            [/((?:this\.)?\w+)(\.hashmap)/gm, '($1 as ArrayCache)$2'],
            [/(\w+)\.store\(((.+),(.+))\)/gm, '($1 as IOrderBookSide).store($2)'],
            [/(\w+)(\.storeArray\(.+\))/gm, '($1 as IOrderBookSide)$2'],
            [/(\w+)\.call\(this,(.+)\)/gm, 'DynamicInvoker.InvokeMethod($1, new object[] {$2})'],
            [/(\w+)(\.limit\(\))/gm, '($1 as IOrderBook)$2'],
            [/this\.spawn\((this\.\w+),(.+)\)/gm, 'this.spawn($1, new object[] {$2})'],
            [/this\.delay\(([^,\n]+),([^,\n]+),([^\n]+)\)/gm, 'this.delay($1, $2, new object[] {$3})'],
            [/(((?:this\.)?\w+))\.(append|getLimit)\((.+)\)/gm, 'callDynamically($1, "$3", new object[] {$4})'],
            [/(client)(\.reset.+)/gm, '((WebSocketClient)$1)$2'],
            [/\(client,/g, '(client as WebSocketClient,'],
            [/([(,]\s*)object client\b/g, '$1WebSocketClient client'],
            [/object client =/gm, 'var client ='],
            [/object future =/gm, 'var future ='],
        ]
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
                // RFM-C2-B: hand-written base member -> declared C# type (the printer's csharpDeclaredBaseFieldType)
                "declaredBaseFieldTypes": csharpDeclaredBaseFieldTypes (),
                "uniqueMethodNames": csharpDeclaredUniqueMethods (),
                "numericArgTypes": CORE_NUMERIC_ARGS,
                "coreArgShadowCallees": CORE_ARG_SHADOW_CALLEES,
                "dictParamsMethods": PARAMETERS_ARG_TYPED_METHODS,
                "coreArgTypes": this.coreArgTypeTable (),
                "signatureArgTypes": SIGNATURE_ARG_TYPES,
                "callSiteArgTypes": this.callSiteArgTypeTable (),
                "callSiteTypedIdentifiers": CORE_ARG_CALL_SITE_TYPED_IDENTIFIERS,
                "typedCores": { "base": TYPED_CORES, "prediction": PREDICTION_TYPED_CORES, "snapshot": SNAPSHOT_CORES, "venue": VENUE_TYPED_CORES },
                "parser": {
                    "ELEMENT_ACCESS_WRAPPER_OPEN": "getValue(",
                    "ELEMENT_ACCESS_WRAPPER_CLOSE": ")",
                    // "VAR_TOKEN": "var",
                }
            },
        }
    }

    setupTranspiler() {
        this.transpiler = new Transpiler (this.getTranspilerConfig())
        setupCsharpPrinter (this.transpiler);
        this.patchCsharpPropertyTypes ();
    }

    // Same ast-transpiler field-type hole as Java: getType() returns raw TS aliases
    // (Dict/Str/Num/...) for class fields without VariableTypeReplacements. Without this,
    // `skippedMethods: Dict = {}` emits `public Dict ...` and CS0246. Route field types
    // through the existing map (exact key only).
    patchCsharpPropertyTypes () {
        const csharpTranspiler = (this.transpiler as any)?.csharpTranspiler;
        if (!csharpTranspiler || typeof csharpTranspiler.getType !== 'function' || csharpTranspiler._propertyTypesPatched) {
            return;
        }
        const originalGetType = csharpTranspiler.getType.bind (csharpTranspiler);
        csharpTranspiler.getType = (node: any) => {
            const type = originalGetType (node);
            const replacements = csharpTranspiler.VariableTypeReplacements ?? {};
            if ((typeof type === 'string') && Object.prototype.hasOwnProperty.call (replacements, type)) {
                return replacements[type];
            }
            return type;
        };
        csharpTranspiler._propertyTypesPatched = true;
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
        return values;
    }

    // the typed C# return of a core method, or '' when the method keeps `Task<object>`
    typedCoreType (methodName: string, isPredictionTier = false, venue: string = this.currentVenue): string {
        // the per-venue axis wins: walk the venue and its parents (bequant -> hitbtc)
        let v: string | undefined = venue;
        while (v !== undefined && v !== '') {
            const perVenue = VENUE_TYPED_CORES[v];
            if (perVenue !== undefined && (methodName in perVenue)) {
                return perVenue[methodName];
            }
            v = this.venueParents[v];
        }
        const snapshot = SNAPSHOT_CORES[methodName];
        if (snapshot !== undefined) {
            return (isPredictionTier && snapshot.predictionType !== undefined) ? snapshot.predictionType : snapshot.type;
        }
        if (isPredictionTier && (methodName in PREDICTION_TYPED_CORES)) {
            return PREDICTION_TYPED_CORES[methodName];
        }
        return TYPED_CORES[methodName] ?? '';
    }

    // the To* helper that materialises a typed core's return, or the snapshot helper for
    // the live ws structures whose public shape is a `.Copy()` rather than a `new T(...)`
    typedCoreToHelper (methodName: string, isPredictionTier: boolean, csharpType: string): string {
        const snapshot = SNAPSHOT_CORES[methodName];
        if (snapshot !== undefined) {
            return (isPredictionTier && snapshot.predictionHelper !== undefined) ? snapshot.predictionHelper : snapshot.helper;
        }
        if (csharpType === 'Dictionary<string, object>') {
            return 'ccxt.BaseExchange.ToDict';
        }
        if (csharpType === 'List<Dictionary<string, object>>') {
            return 'ccxt.BaseExchange.ToDictList';
        }
        if (csharpType === OHLCV_DICT_TYPE) {
            return 'ccxt.BaseExchange.ToOHLCVDict';
        }
        if (csharpType === 'Int64') {
            return 'ccxt.BaseExchange.ToInt64Value';
        }
        if (csharpType === 'string') {
            return 'ccxt.BaseExchange.ToStringValue';
        }
        if (csharpType === 'List<string>') {
            return 'ccxt.BaseExchange.ToStringList';
        }
        return 'ccxt.BaseExchange.To' + this.typedCoreHelperSuffix (csharpType);
    }

    // the prediction tier is detected from the emitted content, not from `this.isPrediction`:
    // the recursive prediction pass and the main pass both reach these files, and only the text
    // reliably says which class hierarchy the method is being emitted into

    // `List<OrderBook>` -> `List<ccxt.OrderBook>`. Required because ccxt.pro declares its own
    // OrderBook / Trade classes, which would otherwise win name resolution inside pro files
    qualifyTypedCoreType (csharpType: string): string {
        if (csharpType.startsWith ('ccxt.')) {
            return csharpType; // SNAPSHOT_CORES already spell the fully qualified name
        }
        // raw / primitive core types are not ccxt. structs
        if (csharpType === 'Int64' || csharpType === 'string' || csharpType === 'List<string>' || csharpType === 'Dictionary<string, object>' || csharpType === 'List<Dictionary<string, object>>') {
            return csharpType;
        }
        if (csharpType === OHLCV_DICT_TYPE) {
            return 'Dictionary<string, Dictionary<string, List<ccxt.OHLCV>>>';
        }
        if (csharpType.startsWith ('List<') && csharpType.endsWith ('>')) {
            return 'List<ccxt.' + csharpType.substring (5, csharpType.length - 1) + '>';
        }
        return 'ccxt.' + csharpType;
    }

    // helper suffix used by ToXxx: `List<Order>` -> `OrderList`, `Ticker` -> `Ticker`
    typedCoreHelperSuffix (csharpType: string): string {
        if (csharpType.startsWith ('List<') && csharpType.endsWith ('>')) {
            return csharpType.substring (5, csharpType.length - 1) + 'List';
        }
        return csharpType;
    }

    // [line, column, expression] of the terminating `;` of a `return <expr>;` statement starting at line
    // `start`, tolerating multi-line expressions by only stopping on a `;` outside brackets/strings
    collectReturnStatement (lines: string[], start: number): [ number, number, string ] {
        let depth = 0;
        let inString = false;
        let [ lastLine, semi ] = [ start, lines[start].length ];
        scan: for (let i = start; i < lines.length; i++) {
            const line = lines[i];
            for (let j = 0; j < line.length; j++) {
                const ch = line[j];
                if (inString) {
                    if (ch === '\\') { j++; continue; }
                    if (ch === '"') { inString = false; }
                    continue;
                }
                if (ch === '"') { inString = true; continue; }
                if (ch === '/' && line[j + 1] === '/') { break; }
                if (ch === '(' || ch === '[' || ch === '{') { depth++; continue; }
                if (ch === ')' || ch === ']' || ch === '}') { depth--; continue; }
                if (ch === ';' && depth <= 0) { [ lastLine, semi ] = [ i, j ]; break scan; }
            }
        }
        const at = lines[start].indexOf ('return ') + 7;
        const head = lines[start].substring (at);
        const expr = (lastLine === start) ? head.substring (0, semi - at) : [ head ].concat (lines.slice (start + 1, lastLine), [ lines[lastLine].substring (0, semi) ]).join (' ');
        return [ lastLine, semi, expr.trim () ];
    }

    // the reverse helper for a typed core's shape: `List<Order>` -> `FromOrderList`, or ''
    // when the family is not invertible. Reflective pagination and any
    // `object x = await this.fetchOrders(...)` consumer reads dictionary keys off the
    // result, so a boxed struct has to be de-typed first.
    typedCoreFromHelper (csharpType: string): string {
        if (csharpType === 'Dictionary<string, object>') {
            return 'ccxt.BaseExchange.FromDict';
        }
        if (csharpType === 'List<Dictionary<string, object>>') {
            return 'ccxt.BaseExchange.FromDictList';
        }
        if (csharpType === OHLCV_DICT_TYPE) {
            return 'ccxt.BaseExchange.FromOHLCVDict';
        }
        if (csharpType === 'Int64') {
            return 'ccxt.BaseExchange.FromInt64';
        }
        if (csharpType === 'string') {
            return 'ccxt.BaseExchange.FromStringValue';
        }
        if (csharpType === 'List<string>') {
            return 'ccxt.BaseExchange.FromStringList';
        }
        const family = csharpType.startsWith ('List<') ? csharpType.slice (5, -1) : csharpType;
        if (!REVERSIBLE_FAMILIES.includes (family)) {
            return '';
        }
        return 'ccxt.BaseExchange.From' + this.typedCoreHelperSuffix (csharpType);
    }

    // wraps every `await this.<typedCore>(...)` on one line in its From* helper, so a typed
    // struct never lands in an `object` local. Occurrences already funnelled through a
    // To*/From* helper, and the tail-call returns typeCores deliberately left bare, are skipped.
    wrapTypedCoreConsumers (line: string, names: string[], predictionTier: boolean, skipReturn: boolean): string {
        let out = line;
        for (const name of names) {
            const typedType = this.typedCoreType (this.pascalName (name, true), predictionTier);
            if (typedType === '') {
                continue;
            }
            const needle = 'await this.' + name + '(';
            let from = 0;
            while (true) {
                const at = out.indexOf (needle, from);
                if (at === -1) {
                    break;
                }
                const before = out.substring (0, at);
                const close = csharpMatchingClose (out, at + needle.length - 1, '(', ')', '"');
                if (close === -1) {
                    // a call spanning several lines is left alone rather than mangled;
                    // the runtime FromTyped dispatcher still de-types it if it is awaited reflectively
                    break;
                }
                if (/ccxt\.BaseExchange\.(To|From)\w+\($/.test (before) || (skipReturn && /^\s*return $/.test (before))) {
                    from = close;
                    continue;
                }
                const helper = this.typedCoreFromHelper (typedType);
                if (csharpHelperIsIdentity (helper, typedType)) {
                    // the reverse conversion is the identity for this family (the From helper hands
                    // its own declared type back), so the consumer keeps the bare await expression
                    from = close;
                    continue;
                }
                if (helper === '') {
                    // a non-invertible family (Tickers / Balances / OrderBook): leave the call
                    // exactly as it was before this pass. Those names are typed only where the
                    // wrapper conversion was the sole consumer, so nothing regresses; the
                    // analyzer refuses to ADD any such name that has consuming call sites.
                    from = close;
                    continue;
                }
                out = before + helper + '(' + out.substring (at, close + 1) + ')' + out.substring (close + 1);
                from = close + helper.length + 2;
            }
        }
        return out;
    }

    // rewrites every typed core so the generated core returns its typed shape:
    //   - the signature `Task<object> fetchOrder(` becomes `Task<Order>`
    //   - every return site inside it is funnelled through `BaseExchange.ToOrder(...)`,
    //     except a tail call to another already-typed core of the same shape
    //   - an untyped core returning a typed core needs the reverse conversion; only OHLCV has a
    //     lossless one, so any other family reaching that branch is a table bug and throws
    // every method name that may carry a typed return: the two TYPED_CORES tables plus the
    // ws snapshot cores, whose type differs per tier but is never ''
    typedCoreNames (): string[] {
        const names = Object.keys (TYPED_CORES)
            .concat (Object.keys (PREDICTION_TYPED_CORES).filter ((n) => !(n in TYPED_CORES)))
            .concat (Object.keys (SNAPSHOT_CORES).filter ((n) => !(n in TYPED_CORES)));
        for (const venue of Object.keys (VENUE_TYPED_CORES)) {
            for (const name of Object.keys (VENUE_TYPED_CORES[venue])) {
                if (!names.includes (name)) {
                    names.push (name);
                }
            }
        }
        return names;
    }

    // `List<object> x = FromDictList(await this.core(...))` -> `List<Dictionary<string, object>> x =
    // await this.core(...)` when every read of x is one that takes the typed list as is
    // (count, element read, getValue / getArrayLength / filterBy / parseLedger / parseCurrencies);
    // safeDict / safeValue and every other consumer keep the reboxing helper.
    declareDictListLocals (lines: string[], bodyStart: number, bodyEnd: number): void {
        const declRe = /^(\s*)List<object> (\w+) = ccxt\.BaseExchange\.FromDictList\((await this\.\w+\(.*\))\);$/;
        for (let j = bodyStart + 1; j < bodyEnd; j++) {
            const decl = lines[j] === null ? null : declRe.exec (lines[j]);
            if (decl === null) {
                continue;
            }
            const name = decl[2];
            const nameRe = new RegExp ('\\b' + name + '\\b');
            const allowed = new RegExp ('(?:getArrayLength|getValue|this\\.filterBy|this\\.parseLedger|this\\.parseCurrencies)\\(' + name + '(?=[,)])|\\b' + name + '\\?\\.Count|\\b' + name + '\\.Count|\\b' + name + ' (?:!=|==) null|\\b' + name + '\\[[^\\]=]*\\](?!\\s*=[^=])', 'g');
            let sound = true;
            for (let k = j + 1; k < bodyEnd && sound; k++) {
                const text = lines[k];
                if (text === null || !nameRe.test (text) || text.trim ().startsWith ('//')) {
                    continue;
                }
                const rest = text.replace (allowed, '');
                if (nameRe.test (rest) || new RegExp ('\\b' + name + ' = ').test (text)) {
                    sound = false;
                }
            }
            if (sound) {
                lines[j] = decl[1] + 'List<Dictionary<string, object>> ' + name + ' = ' + decl[3] + ';';
            }
        }
    }

    // `Dictionary<string, object> x = FromOHLCVDict(await this.core(...))` -> the core's own typed
    // dictionary when every read of x is a null check, ContainsKey or an indexer read; any other
    // consumer (safeDict / getValue on x itself) keeps the reboxing helper.
    declareOHLCVDictLocals (lines: string[], bodyStart: number, bodyEnd: number, predictionTier: boolean): void {
        const declRe = /^(\s*)Dictionary<string, object> (\w+) = ccxt\.BaseExchange\.FromOHLCVDict\((await this\.(\w+)\(.*\))\);$/;
        for (let j = bodyStart + 1; j < bodyEnd; j++) {
            const decl = lines[j] === null ? null : declRe.exec (lines[j]);
            if (decl === null || this.typedCoreType (this.pascalName (decl[4], true), predictionTier) !== OHLCV_DICT_TYPE) {
                continue;
            }
            const name = decl[2];
            const nameRe = new RegExp ('\\b' + name + '\\b');
            const allowed = new RegExp ('\\b' + name + ' != null|\\b' + name + '\\.ContainsKey\\(|\\b' + name + '\\[[^\\]=]*\\](?!\\s*=[^=])', 'g');
            let sound = true;
            for (let k = j + 1; k < bodyEnd && sound; k++) {
                const text = lines[k];
                if (text === null || !nameRe.test (text) || text.trim ().startsWith ('//')) {
                    continue;
                }
                if (nameRe.test (text.replace (allowed, '')) || new RegExp ('\\b' + name + ' = ').test (text)) {
                    sound = false;
                }
            }
            if (sound) {
                lines[j] = decl[1] + this.qualifyTypedCoreType (OHLCV_DICT_TYPE) + ' ' + name + ' = ' + decl[3] + ';';
            }
        }
    }

    typeCores (content: string, predictionTier = this.isPrediction): string {
        const names = this.typedCoreNames ().map ((name) => this.pascalName (name));
        if (!names.some (name => content.includes (' ' + name + '('))) {
            return content;
        }
        const lines = content.split ('\n');
        // void `Task` and concrete `Task<...>` bodies are visited too: they can consume typed cores
        // into `object` locals and need the From* funnel like anyone else
        const sigRe = /^(\s*)public async (virtual|override) Task(?:<[\w.<>, ?]+>)? (\w+)\(/;
        const typedCallRe = new RegExp ('^await this\\.(' + names.join ('|') + ')\\(');
        for (let i = 0; i < lines.length; i++) {
            const sig = sigRe.exec (lines[i]);
            if (!sig) {
                continue;
            }
            const [ , indent, modifier, printedName ] = sig;
            const methodName = this.pascalName (printedName, true);
            const isObjectTask = lines[i].indexOf (' Task<object> ') !== -1;
            const typedType = isObjectTask ? this.typedCoreType (methodName, predictionTier) : '';
            const isTyped = typedType !== '';
            // the method body ends at its closing brace, which is the first line indented exactly
            // like the signature — brace counting is unusable here because generated bodies carry
            // `{`/`}` inside string literals (url templates, json payloads)
            const bounds = this.methodBodyBounds (lines, i, indent);
            if (bounds === undefined) {
                continue;
            }
            const [ bodyStart, bodyEnd ] = bounds;
            if (isTyped) {
                lines[i] = `${indent}public async ${modifier} Task<${this.qualifyTypedCoreType (typedType)}> ${printedName}(` + lines[i].split (printedName + '(').slice (1).join (printedName + '(');
            }
            const tailOk: Record<number, boolean> = {};
            for (let j = bodyStart + 1; j < bodyEnd; j++) {
                if (!lines[j].trim ().startsWith ('return ')) {
                    continue;
                }
                const [ lastLine, semi, expr ] = this.collectReturnStatement (lines, j);
                const calledCore = typedCallRe.exec (expr);
                const calledType = calledCore ? this.typedCoreType (this.pascalName (calledCore[1], true), predictionTier) : '';
                // the return already carries the core's own dictionary type
                if (isTyped && (csharpReturnIsAlreadyTyped (expr, typedType, content, lines.slice (i, bodyEnd + 1), predictionTier) || this.callReturnsDeclaredType (expr, typedType, predictionTier))) {
                    tailOk[j] = true;
                    j = lastLine;
                    continue;
                }
                let wrapper = '';
                if (isTyped && calledType !== typedType) {
                    wrapper = this.typedCoreToHelper (methodName, predictionTier, typedType);
                } else if (!isTyped && calledType !== '') {
                    // an untyped core forwarding a typed one has to hand back the untyped shape
                    wrapper = this.typedCoreFromHelper (calledType);
                    if (wrapper === '') {
                        throw new Error (`typeCores: untyped ${methodName} returns typed core ${calledCore[1]} (${calledType}) — drop it from TYPED_CORES or add a From helper`);
                    }
                }
                if (wrapper === '') {
                    tailOk[j] = true;
                    j = lastLine;
                    continue;
                }
                // the wrapper is unnecessary where the return operand's declared type is
                // already the helper's own (see csharpNativeCoreConversion)
                const nativeConversion = isTyped
                    ? csharpNativeCoreConversion (wrapper, expr, content, lines.slice (i, bodyEnd + 1))
                    : (csharpHelperIsIdentity (wrapper, calledType) ? expr.trim () : '');
                const pad = lines[j].substring (0, lines[j].length - lines[j].trimStart ().length);
                const trailing = lines[lastLine].substring (semi + 1);
                lines[j] = `${pad}return ${(nativeConversion !== '') ? nativeConversion : `${wrapper}(${expr})`};${trailing}`;
                for (let k = j + 1; k <= lastLine; k++) {
                    lines[k] = null as any;
                }
                tailOk[j] = true;
                j = lastLine;
            }
            // every remaining `await this.<typedCore>(...)` in the body is a consuming site —
            // its result lands in an `object` local or a bigger expression, where a boxed
            // struct would read as null. Funnel those through the reverse From* helper.
            for (let j = bodyStart + 1; j < bodyEnd; j++) {
                if (lines[j] === null || lines[j].indexOf ('await this.') === -1) {
                    continue;
                }
                // a consuming call whose argument list spans several lines has to be joined
                // first, or the paren walker gives up and the boxed struct escapes untouched
                // (binance watchTicker -> `object tickers = await this.WatchTickers(` + 3 lines)
                let end = j;
                if (csharpMatchingClose (lines[j], lines[j].indexOf ('await this.'), '(', ')', '"') === -1) {
                    const [ last ] = this.collectReturnStatement (lines, j);
                    if (last > j && last < bodyEnd) {
                        end = last;
                    }
                }
                if (end > j) {
                    const pad = lines[j].substring (0, lines[j].length - lines[j].trimStart ().length);
                    const joined = lines.slice (j, end + 1).map ((l, k) => (k === 0 ? l : l.trim ())).join (' ');
                    const wrapped = this.wrapTypedCoreConsumers (joined, names, predictionTier, tailOk[j] === true);
                    if (wrapped !== joined) {
                        lines[j] = pad + wrapped.trim ();
                        for (let k = j + 1; k <= end; k++) {
                            lines[k] = null as any;
                        }
                        j = end;
                        continue;
                    }
                }
                lines[j] = this.wrapTypedCoreConsumers (lines[j], names, predictionTier, tailOk[j] === true);
            }
            this.declareDictListLocals (lines, bodyStart, bodyEnd);
            this.declareOHLCVDictLocals (lines, bodyStart, bodyEnd, predictionTier);
            i = bodyEnd;
        }
        return lines.filter (line => line !== null).join ('\n');
    }

    // rewrites every sync core declared in SYNC_TYPED_CORES — the BaseExchange original and
    // every venue override — from `object` to its concrete type, and funnels each return
    // expression through `ccxt.BaseExchange.ToDict(...)`. ToDict is `value as
    // Dictionary<string, object>`: identity for the rows these paths build, null for null,
    // so the typed signature compiles without touching the box. Return expressions that
    // already carry the dictionary statically stay bare: extend/deepExtend are declared
    // Dictionary<string, object> in Exchange.Generic.cs, and a retyped core hands the same
    // row back unmodified (this.safeMarketStructure(, base.safeMarket(, ...).
    typeSyncCores (content: string): string {
        const names = Object.keys (SYNC_TYPED_CORES);
        if (!names.some (name => content.includes ('object ' + name + '('))) {
            return content;
        }
        const sigRe = new RegExp ('^(\\s*)public (virtual|override) object (' + names.join ('|') + ')\\(');
        const lines = content.split ('\n');
        for (let i = 0; i < lines.length; i++) {
            const sig = sigRe.exec (lines[i]);
            if (!sig) {
                continue;
            }
            const [ full, indent, modifier, methodName ] = sig;
            lines[i] = indent + 'public ' + modifier + ' ' + SYNC_TYPED_CORES[methodName] + ' ' + methodName + '(' + lines[i].substring (full.length);
            // the body ends at its closing brace: the first line indented exactly like the
            // signature (brace counting is unusable — generated bodies carry braces inside
            // string literals)
            const bounds = this.methodBodyBounds (lines, i, indent);
            if (bounds === undefined) {
                continue;
            }
            const [ bodyStart, bodyEnd ] = bounds;
            for (let j = bodyStart + 1; j < bodyEnd; j++) {
                if (!lines[j].trim ().startsWith ('return ')) {
                    continue;
                }
                const [ lastLine, semi, expr ] = this.collectReturnStatement (lines, j);
                if (this.syncCoreReturnIsAlreadyTyped (expr)
                        || csharpReturnIsAlreadyTyped (expr, SYNC_TYPED_CORES[methodName], content, lines.slice (i, bodyEnd + 1), this.isPrediction)
                        || this.callReturnsDeclaredType (expr, SYNC_TYPED_CORES[methodName], this.isPrediction)) {
                    j = lastLine;
                    continue;
                }
                // close the helper before the `;` first, then open it after `return ` (one line or many)
                const retAt = lines[j].indexOf ('return ') + 7;
                lines[lastLine] = lines[lastLine].substring (0, semi) + ')' + lines[lastLine].substring (semi);
                lines[j] = lines[j].substring (0, retAt) + 'ccxt.BaseExchange.ToDict(' + lines[j].substring (retAt);
                j = lastLine;
            }
            i = bodyEnd;
        }
        return lines.join ('\n');
    }

    // a `this.`/`base.` call whose callee is declared with the target type in the closed
    // tables (typed cores, collection returns): every override prints it, so ToDict is identity
    callReturnsDeclaredType (expr: string, targetType: string, predictionTier: boolean): boolean {
        const call = /^(await\s+)?(this|base)\.(\w+)\(/.exec (expr);
        if (call === null || (targetType !== 'Dictionary<string, object>' && targetType !== 'List<Dictionary<string, object>>')) {
            return false;
        }
        const venue = (call[2] === 'base') ? '' : this.currentVenue;
        const declared = (call[1] !== undefined) ? this.typedCoreType (this.pascalName (call[3], true), predictionTier, venue) : (CSHARP_COLLECTION_RETURN_METHODS as Record<string, string>)[call[3]];
        return declared === targetType;
    }

    // the returns of a SYNC_TYPED_CORES method that already hand the dictionary back, so a
    // ToDict funnel would only add noise
    syncCoreReturnIsAlreadyTyped (expr: string): boolean {
        const unchanged = [ 'ccxt.BaseExchange.ToDict(', 'this.extend(', 'base.extend(', 'this.deepExtend(', 'base.deepExtend(' ];
        for (const name of Object.keys (SYNC_TYPED_CORES)) {
            unchanged.push ('this.' + name + '(', 'base.' + name + '(');
        }
        return unchanged.some ((prefix) => expr.startsWith (prefix));
    }

    // the printed (PascalCase) name, or with `camel` the TS (table) name of a printed method name
    pascalName (name: string, camel = false): string {
        return (camel ? name.charAt (0).toLowerCase () : name.charAt (0).toUpperCase ()) + name.slice (1);
    }

    // A typed core needs no PascalCase forwarding wrapper: the core itself carries the public
    // name. The key set matches typedCoreType(), which falls back to TYPED_CORES on the
    // prediction tier, so a single union map covers both hierarchies.
    pascalTypedCoreNames (predictionTier: boolean): Record<string, string> {
        const names = this.typedCoreNames ();
        const map: Record<string, string> = {};
        for (const name of names) {
            if (this.typedCoreType (name, predictionTier) !== '') {
                map[name] = name.charAt (0).toUpperCase () + name.slice (1);
            }
        }
        return map;
    }

    // WS tests bind the unified methods STATICALLY, so unlike the REST tests they never pass
    // through invokeExchangeDynamically -> detypeForComparison and receive the raw struct.
    // `assert (exchange.isDictionary (response))` then sees a boxed Tickers/Ticker, not the
    // symbol-keyed dictionary the unified test asserts. Project on the TEST path only.
    detypeWsTypedCoreCalls (content: string): string {
        const map = this.pascalTypedCoreNames (false);
        const pascals = new Set<string> ();
        for (const name of Object.keys (map)) {
            // the snapshot cores hand back the live ws structure on purpose; the ws tests
            // already `.Copy()` them and assert on the book's own accessors
            if (!(name in SNAPSHOT_CORES)) {
                pascals.add (map[name]);
            }
        }
        const callRe = /await exchange\.(\w+)\(/g;
        let out = '';
        let last = 0;
        let match = callRe.exec (content);
        while (match !== null) {
            if (pascals.has (match[1])) {
                const open = match.index + match[0].length - 1;
                const close = csharpMatchingClose (content, open, '(', ')', '"');
                if (close !== -1) {
                    out += content.slice (last, match.index);
                    out += 'detypeForComparison(' + content.slice (match.index, close + 1) + ')';
                    last = close + 1;
                    callRe.lastIndex = last;
                }
            }
            match = callRe.exec (content);
        }
        return out + content.slice (last);
    }

    // synchronous parse*/safe* calls in tests may return a unified struct; the test bodies index
    // the result as a dictionary, so project it through the harness-only toDict seam
    detypeStructReturningCalls (content: string): string {
        const callRe = /exchange\.(?:safe|parse)(?:Ticker|Trade|Order|OrderBook|Balance|Market|Currency)\(/g;
        let out = '';
        let last = 0;
        let match = callRe.exec (content);
        while (match !== null) {
            const open = match.index + match[0].length - 1;
            const close = csharpMatchingClose (content, open, '(', ')', '"');
            if (close !== -1) {
                out += content.slice (last, match.index) + 'toDict(' + content.slice (match.index, close + 1) + ')';
                last = close + 1;
                callRe.lastIndex = last;
            }
            match = callRe.exec (content);
        }
        return out + content.slice (last);
    }

    // right hand side whose C# static type is exactly the shadow's type
    coreArgShadowRhsIsTyped (rhs: string, targetType: string): boolean {
        if (targetType === 'string') {
            if (/^"(?:[^"\\]|\\.)*"$/.test (rhs)) {
                return true;
            }
            if (/^this\.(?:safeString|symbol)\s*\(/.test (rhs)) {
                return true;
            }
        }
        const cast = /^\(\(([^()]*)\)/.exec (rhs) || /^\(([\w<>, ?\[\].]+)\)/.exec (rhs);
        if (cast) {
            const inner = cast[1].trim ();
            if (inner === targetType) {
                return true;
            }
        }
        if (targetType !== 'string') {
            if (/^(?:this|ccxt\.BaseExchange)\.(?:safeInteger|safeFloat|safeNumber|parseToInt|ToInt64Arg|ToDoubleArg)\s*\(/.test (rhs)) {
                return true;
            }
        }
        return false;
    }

    // `((T)x)` / `(T)x` immediately wrapping the occurrence at `at`, or null
    coreArgShadowCastBefore (line: string, at: number): string | null {
        let m = /\(\(([^()]*)\)$/.exec (line.slice (0, at));
        if (m !== null) {
            return m[1].trim ();
        }
        m = /(?:^|[^\w(])\(([\w<>, ?\[\].]+)\)$/.exec (line.slice (0, at));
        return m === null ? null : m[1].trim ();
    }

    // innermost call whose argument list holds `at`; returns [ name, openParen ]. The scan stops
    // at a `;` or at a `{` that does not open a `new List/object[]/Dictionary` initializer, so it
    // never walks out of the statement the occurrence belongs to.
    coreArgShadowCallee (line: string, at: number): [ string, number ] | null {
        let depth = 0;
        let i = at - 1;
        while (i >= 0) {
            const ch = line[i];
            if (ch === ')') {
                depth += 1;
            } else if (ch === '(') {
                depth -= 1;
                if (depth < 0) {
                    const name = /([\w.]+)\s*$/.exec (line.slice (0, i));
                    return name === null ? null : [ name[1], i ];
                }
            } else if (ch === ';' || (ch === '}' && depth === 0)) {
                return null;
            } else if (ch === '{' && depth === 0) {
                if (!/(?:new List<object>|new object\[\]|new Dictionary<string, object>)\s*\(?\s*\)?\s*$/.test (line.slice (0, i))) {
                    return null;
                }
            }
            i -= 1;
        }
        return null;
    }

    // classification of one occurrence: 'write', 'read', or '' when not provable
    coreArgShadowUseKind (line: string, at: number, alias: string, targetType: string, methodReturnType: string, inDictInit: boolean): string {
        const pre = line.slice (0, at);
        const post = line.slice (at + alias.length);
        const postl = post.replace (/^\s+/, '');
        if (/(?:ref|out)\s+$/.test (pre)) {
            return '';
        }
        if (pre.trim () === '') {
            const m = /^\s*(\?\?=|\+=|-=|\*=|%=|\/=|=(?!=))\s*(.*?);?\s*$/.exec (post);
            if (m !== null) {
                const op = m[1];
                const rhs = m[2].trim ();
                if ((op === '??=' || op === '=') && this.coreArgShadowRhsIsTyped (rhs, targetType)) {
                    return 'write';
                }
                return '';
            }
        }
        const cast = this.coreArgShadowCastBefore (line, at);
        if (cast !== null) {
            // an identity cast, or a cast to object (boxes the same value / null)
            return (cast === targetType || cast === 'object') ? 'read' : '';
        }
        // `alias.Value`: the printer's own unboxing of a null-proven nullable-numeric shadow, which only compiles
        // once the declaration names the nullable type
        if (targetType === 'Int64?' && /^\.Value\b/.test (post)) {
            return 'read';
        }
        // `(alias == null)` / `(alias != null)`: the native spelling of the isEqual(alias, null)
        // guard this classifier already accepts at an argument position. The null test reads the
        // box itself and answers the same for `object` and every narrowed type here.
        if (/^[!=]=\s*null\s*\)/.test (postl)) {
            return 'read';
        }
        // the initializer of a new `object` local boxes the same value (Nullable<T> boxes as T)
        if (postl.trim () === ';' && /^\s*object\s+[A-Za-z_]\w*\s*=\s*$/.test (pre)) {
            return 'read';
        }
        // the same object-slot write with the cast already dropped, which the [AST] dict-write
        // rule does for a `request` receiver: the cast named the slot, so its absence proves
        // the declaration is a dictionary and the value is boxed into an `object` entry
        if (postl.trim () === ';' && /request\s*\[[^\]]*\]\s*=\s*$/.test (pre)) {
            return 'read';
        }
        if (/[{,]\s*$/.test (pre) && /(?:new List<object>|new object\[\]|new Dictionary<string, object>)\s*\(?\s*\)?\s*\{[^{}]*$/.test (pre)) {
            return 'read';
        }
        if (inDictInit && /^\s*\{\s*"(?:[^"\\]|\\.)*"\s*,\s*$/.test (pre)) {
            return 'read';
        }
        // A native `(a + b)` operand reads the alias exactly as a helper argument did, and the concat
        // exists only where the printer proved the operands strings.
        if (/\+\s*$/.test (pre) || /^\s*\+/.test (postl)) {
            return 'read';
        }
        // The same native `+` concat with the printer's parenthesised operand, `... + (alias)` / `(alias) + ...`.
        if (/\+\s*\(\s*$/.test (pre) && /^\)/.test (postl)
            || /\($/.test (pre) && /^\)\s*\+/.test (postl)) {
            return 'read';
        }

        if (postl.charAt (0) === ',' || postl.charAt (0) === ')') {
            // a callee outside the table keeps its argument untyped (a narrowed parameter's
            // call-site cast was already answered above)
            const callee = this.coreArgShadowCallee (line, at);
            const name = callee === null ? '' : callee[0].split ('.').pop () as string;
            if (callee !== null && (CORE_ARG_SHADOW_CALLEES.indexOf (name) !== -1 || CORE_ARG_SHADOW_NEW_CALLEES.indexOf (name) !== -1)) {
                return 'read';
            }
            return '';
        }
        return '';
    }

    // The `limit` shadow's two admitted write forms (getLimit / integer literal), or null otherwise.
    // `coreArgShadowLimitCastWrite` reproduces the raw line byte-for-byte with the cast, so the caller
    // keeps the declaration `object` whenever the printed line is not the proven shape.
    coreArgShadowLimitWriteRhs (rhs: string): string | null {
        if (CORE_ARG_SHADOW_LIMIT_GETLIMIT_RE.test (rhs) || CORE_ARG_SHADOW_LIMIT_LITERAL_RE.test (rhs)) {
            return rhs;
        }
        return null;
    }

    coreArgShadowLimitCastWrite (line: string, alias: string, targetType: string): string | null {
        const m = new RegExp ('^(\\s*)' + alias + '\\s*(\\?\\?=|=)\\s*(.*?)\\s*;(\\s*(?://.*)?)$').exec (line);
        if (m === null) {
            return null;
        }
        const rhs = this.coreArgShadowLimitWriteRhs (m[3]);
        return rhs === null ? null : m[1] + alias + ' ' + m[2] + ' ((' + targetType + ')' + rhs + ');' + m[4];
    }

    // True when the shadow `alias` is used only in the proven ways above and read at least once
    // (a write-only local is CS0219).
    // `limitCasts` collects the writes needing a `((T)…)` cast the caller re-inserts before retyping.
    coreArgShadowIsProvable (bodyLines: string[], alias: string, targetType: string, methodReturnType: string, skipLine = -1, limitCasts?: number[]): boolean {
        if (CORE_ARG_SHADOW_TYPES.indexOf (targetType) === -1) {
            return false;
        }
        // strip `//` and block comments, then track the brace depth so a `{ "key", x }` entry is
        // only accepted inside a `Dictionary<string, object>` initializer
        const lines: string[] = [];
        const dictInits: boolean[] = [];
        const frames: number[][] = [];
        let inBlock = false;
        let depth = 0;
        for (const raw of bodyLines) {
            let line = raw;
            if (inBlock) {
                const end = line.indexOf ('*/');
                if (end === -1) { line = ''; } else { line = line.slice (end + 2); inBlock = false; }
            }
            const open = line.indexOf ('/*');
            if (open !== -1) {
                const end = line.indexOf ('*/', open);
                if (end === -1) { line = line.slice (0, open); inBlock = true; } else { line = line.slice (0, open) + line.slice (end + 2); }
            }
            const slash = this.coreArgShadowCommentAt (line);
            if (slash !== -1) {
                line = line.slice (0, slash);
            }
            while (frames.length > 0 && frames[frames.length - 1][0] > depth) {
                frames.pop ();
            }
            dictInits.push (frames.some ((frame) => frame[1] === 1));
            if (/(?:new Dictionary<string, object>|new List<object>|new object\[\])\s*\(?\s*\)?\s*\{/.test (line)) {
                const isDict = /new Dictionary<string, object>\s*\(?\s*\)?\s*\{/.test (line);
                frames.push ([ depth + this.coreArgShadowBraceDelta (line), isDict ? 1 : 0 ]);
            }
            depth += this.coreArgShadowBraceDelta (line);
            lines.push (line);
        }
        let reads = 0;
        // Only the `limit` copy offers its write forms; they are re-checked on the RAW line by
        // coreArgShadowLimitCastWrite, so a line the rewrite cannot reproduce keeps the site `object`.
        const limitWrites = limitCasts !== undefined;
        for (let k = 0; k < lines.length; k++) {
            if (k === skipLine) {
                continue;
            }
            const line = lines[k];
            for (const at of this.coreArgShadowOccurrences (line, alias)) {
                const kind = this.coreArgShadowUseKind (line, at, alias, targetType, methodReturnType, dictInits[k]);
                if (kind === '') {
                    if (limitWrites && line.slice (0, at).trim () === '') {
                        const post = /^\s*(?:\?\?=|=)\s*(.*?)\s*;(\s*(?:\/\/.*)?)$/.exec (line.slice (at + alias.length));
                        if (post !== null && this.coreArgShadowLimitWriteRhs (post[1]) !== null) {
                            limitCasts.push (k);
                            continue;
                        }
                    }
                    return false;
                }
                if (kind === 'read') {
                    reads += 1;
                }
            }
        }
        return reads > 0;
    }

    // index of the `//` comment start outside `quotes` (string/char) literals, or -1
    coreArgShadowCommentAt (line: string, quotes = '"\''): number {
        let i = 0;
        while (i < line.length) {
            const ch = line[i];
            if (quotes.includes (ch)) {
                i = this.coreArgShadowSkipLiteral (line, i);
                continue;
            }
            if (ch === '/' && line[i + 1] === '/') {
                return i;
            }
            i += 1;
        }
        return -1;
    }

    // first index past the string/char literal that starts at `start`
    coreArgShadowSkipLiteral (line: string, start: number): number {
        const quote = line[start];
        let i = start + 1;
        while (i < line.length) {
            if (line[i] === '\\') { i += 2; continue; }
            if (line[i] === quote) { return i + 1; }
            i += 1;
        }
        return i;
    }

    // net `{` minus `}` outside string/char literals
    coreArgShadowBraceDelta (line: string): number {
        let delta = 0;
        let i = 0;
        while (i < line.length) {
            const ch = line[i];
            if (ch === '"' || ch === '\'') {
                i = this.coreArgShadowSkipLiteral (line, i);
                continue;
            }
            if (ch === '{') { delta += 1; } else if (ch === '}') { delta -= 1; }
            i += 1;
        }
        return delta;
    }

    // positions of `alias` outside string/char literals and `//` comments
    coreArgShadowOccurrences (line: string, alias: string): number[] {
        const out: number[] = [];
        let i = 0;
        while (i <= line.length - alias.length) {
            const ch = line[i];
            if (ch === '"' || ch === '\'') {
                i = this.coreArgShadowSkipLiteral (line, i);
                continue;
            }
            if (ch === '/' && line[i + 1] === '/') {
                break;
            }
            if (line.startsWith (alias, i)) {
                const before = i === 0 ? '' : line[i - 1];
                const after = i + alias.length < line.length ? line[i + alias.length] : '';
                if (!/[\w.]/.test (before) && !/\w/.test (after)) {
                    out.push (i);
                    i += alias.length;
                    continue;
                }
            }
            i += 1;
        }
        return out;
    }

    // narrows the `object` parameters listed in CORE_STRING_ARGS to `string` on every
    // generated declaration. Positional, because the prediction tier renames the first
    // parameter (`symbol` -> `outcome`) while C# invariance is on types only.
    // merged view of both tables: position -> narrowed C# type, per method name
    coreArgTypes (methodName: string): Record<number, string> | undefined {
        const strings = CORE_STRING_ARGS[methodName];
        const numerics = CORE_NUMERIC_ARGS[methodName];
        const lists = CORE_LIST_ARGS[methodName];
        if (strings === undefined && numerics === undefined && lists === undefined) {
            return undefined;
        }
        const merged: Record<number, string> = {};
        for (const pos of strings || []) {
            merged[pos] = 'string';
        }
        for (const pos of Object.keys (numerics || {})) {
            merged[Number (pos)] = (numerics as any)[pos];
        }
        for (const pos of Object.keys (lists || {})) {
            merged[Number (pos)] = (lists as any)[pos];
        }
        return merged;
    }

    // Declaration rewrite view: the string/numeric positions plus the dictionary-row positions
    // (Dictionary where every caller passes a Dictionary, its interface where one caller holds an
    // IDictionary). Only `typeCoreArgs` uses this -- `castCoreArgCallSites` keeps reading
    // `coreArgTypes`, so a dict position is never wrapped (the callers already pass a Dictionary).
    coreArgTypesAll (methodName: string): Record<number, string> | undefined {
        const base = this.coreArgTypes (methodName);
        const dicts = CORE_DICT_ARGS[methodName];
        const idicts = CORE_IDICT_ARGS[methodName];
        if (dicts === undefined && idicts === undefined) {
            return base;
        }
        const merged: Record<number, string> = Object.assign ({}, base || {});
        for (const pos of dicts || []) {
            merged[pos] = 'Dictionary<string, object>';
        }
        for (const pos of idicts || []) {
            merged[pos] = 'IDictionary<string, object>';
        }
        return merged;
    }

    // the positions a `this.`/`base.`/`exchange.` call converts its argument at (the printer's csharpCallSiteArgs)
    callSiteArgTypeTable (): Record<string, Record<number, string>> {
        const names = Object.keys (CORE_STRING_ARGS).concat (Object.keys (CORE_NUMERIC_ARGS)).concat (Object.keys (CORE_LIST_ARGS)).concat (Object.keys (SIGNATURE_ARG_TYPES));
        const table: Record<string, Record<number, string>> = {};
        for (const name of names) {
            table[name] = Object.assign ({}, this.coreArgTypes (name), SIGNATURE_ARG_TYPES[name]);
        }
        return table;
    }

    // every CORE_*_ARGS position -> narrowed C# type, the table the printer prints signatures from
    coreArgTypeTable (): Record<string, Record<number, string>> {
        const names = new Set (Object.keys (CORE_STRING_ARGS).concat (Object.keys (CORE_NUMERIC_ARGS)).concat (Object.keys (CORE_DICT_ARGS)).concat (Object.keys (CORE_IDICT_ARGS)).concat (Object.keys (CORE_LIST_ARGS)));
        const table: Record<string, Record<number, string>> = {};
        for (const name of names) {
            table[name] = this.coreArgTypesAll (name) as Record<number, string>;
        }
        return table;
    }

    // renames every free occurrence of `name` to `alias` inside a generated method body,
    // skipping string literals and member access (`.name`) so dictionary keys such as
    // "timeframe" and properties such as `this.timeframe` are left untouched.
    renameLocalInBody (body: string, name: string, alias: string): string {
        let out = '';
        let i = 0;
        while (i < body.length) {
            const ch = body[i];
            if (ch === '"' || ch === '\'') {
                const quote = ch;
                let j = i + 1;
                while (j < body.length) {
                    if (body[j] === '\\') { j += 2; continue; }
                    if (body[j] === quote) { j++; break; }
                    j++;
                }
                out += body.substring (i, j);
                i = j;
                continue;
            }
            if (/[A-Za-z_]/.test (ch)) {
                let j = i;
                while (j < body.length && /[\w]/.test (body[j])) {
                    j++;
                }
                const word = body.substring (i, j);
                const prev = out[out.length - 1];
                out += (word === name && prev !== '.') ? alias : word;
                i = j;
                continue;
            }
            out += ch;
            i++;
        }
        return out;
    }

    // `object market = null` -> `IDictionary<string, object> market = null` on the parse* names in
    // PARSE_MARKET_PARAM_DICTS. Name-keyed and applied to every declaration of the name (C# overrides
    // are invariant on parameter types), so base / venue / ws / prediction stay in sync.
    retypeParseMarketParams (content: string): string {
        const typed = Object.keys (PARSE_MARKET_IDICT_PARAMS);
        const typedCurrency = Object.keys (PARSE_CURRENCY_IDICT_PARAMS);
        if (!PARSE_MARKET_PARAM_DICTS.concat (typed, typedCurrency).some (name => content.includes (name + '('))) {
            return content;
        }
        const lines = content.split ('\n');
        for (let i = 0; i < lines.length; i++) {
            const sig = PARSE_MARKET_SIG_RE.exec (lines[i]);
            if (sig !== null && typedCurrency.indexOf (sig[5]) !== -1) {
                // ral-90c1: `object currency` (parseConversion: fromCurrency / toCurrency) -> IDictionary,
                // same shadow rule; lines are not advanced, so a name in both tables is retyped by both
                const params = this.splitCsharpParams (sig[6]);
                for (const at of ([] as number[]).concat (PARSE_CURRENCY_IDICT_PARAMS[sig[5]])) {
                    const slot = (params[at] ?? '').trim ().split ('=')[0].trim ().split (/\s+/).pop ();
                    if ([ 'currency', 'fromCurrency', 'toCurrency' ].includes (slot)) {
                        this.retypeParseMarketParamShadowed (lines, i, sig[1], slot);
                    }
                }
            }
            if (sig !== null && typed.indexOf (sig[5]) !== -1) {
                i = this.retypeParseMarketParamShadowed (lines, i, sig[1]);
                continue;
            }
            if (sig === null || PARSE_MARKET_PARAM_DICTS.indexOf (sig[5]) === -1) {
                continue;
            }
            lines[i] = lines[i].replace (PARSE_MARKET_PARAM_RE, '$1IDictionary<string, object>$2')
                                 .replace (PARSE_MARKET_PARAM_REQUIRED_RE, '$1IDictionary<string, object>$2');
        }
        return lines.join ('\n');
    }

    // PARSE_MARKET_IDICT_PARAMS: retype `object market`; a body writing anything but null or a
    // market-row core keeps the object slot as `object marketVar = market;` (the printer's reads
    // agree: build/csharp-local-types.js#parseMarketParamType). Returns the body's last line.
    retypeParseMarketParamShadowed (lines: string[], i: number, indent: string, slot = 'market'): number {
        const [ bodyStart, bodyEnd ] = this.methodBodyBounds (lines, i, indent) ?? [ lines.length, lines.length - 1 ];
        const paramRe = (slot === 'market') ? PARSE_MARKET_PARAM_RE : new RegExp ('([(,]\\s*)object(\\s+' + slot + '\\s*=\\s*null)(?=[,)])', 'g');
        const requiredRe = (slot === 'market') ? PARSE_MARKET_PARAM_REQUIRED_RE : new RegExp ('([(,]\\s*)object(\\s+' + slot + ')(?=[,)])', 'g');
        lines[i] = lines[i].replace (paramRe, '$1IDictionary<string, object>$2')
                           .replace (requiredRe, '$1IDictionary<string, object>$2');
        const writes = lines.slice (bodyStart + 1, bodyEnd).join ('\n').match (new RegExp ('(?<![\\w.])' + slot + '\\s*(?:\\?\\?)?=(?!=)[^;]*;|(?<![\\w])(?:ref|out)\\s+' + slot + '(?![\\w])', 'g')) ?? [];
        const rowWrite = (slot === 'market') ? /^market\s*=\s*(?:null|this\.(?:market|safeMarket)\([^;]*\));$/
            : new RegExp ('^' + slot + '\\s*=\\s*(?:null|this\\.(?:currency|safeCurrency)\\([^;]*\\));$');
        if (writes.every ((w) => rowWrite.test (w))) {
            return bodyEnd;
        }
        for (let k = bodyStart + 1; k < bodyEnd; k++) {
            lines[k] = this.renameLocalInBody (lines[k], slot, slot + 'Var');
        }
        lines[bodyStart] = lines[bodyStart] + '\n' + indent + '    object ' + slot + 'Var = ' + slot + ';';
        return bodyEnd;
    }

    // Narrows the `object` parameters in VENUE_NUMERIC_ARGS (name + position, every declaration, since
    // overrides are invariant) to Int64?/double?, only for names in VENUE_NUMERIC_ARG_NAMES. A body that
    // assigns the parameter gets the `object <name>Var = <name>;` shadow, so it keeps an object slot.
    // the shared walk: `table` maps a method name to its [ position, C# type ] rows; `numeric` adds the
    // VENUE_NUMERIC_ARG_NAMES filter and counts a ref/out argument as a write
    typeVenueArgs (content: string, table: Record<string, any>, rows: (positions: any) => [ number, string ][], numeric: boolean): string {
        const names = Object.keys (table);
        if (!names.some (name => content.includes (' ' + name + '('))) {
            return content;
        }
        const sigRe = /^(\s*)public (async )?(virtual|override) ([\w<>., ?]+) (\w+)\((.*)\)\s*$/;
        const lines = content.split ('\n');
        for (let i = 0; i < lines.length; i++) {
            const sig = sigRe.exec (lines[i]);
            if (!sig) {
                continue;
            }
            const [ , indent, asyncKw, modifier, returnType, methodName, plist ] = sig;
            const positions = table[methodName];
            if (positions === undefined) {
                continue;
            }
            const bounds = this.methodBodyBounds (lines, i, indent);
            if (bounds === undefined) {
                continue;
            }
            const [ bodyStart, bodyEnd ] = bounds;
            const body = lines.slice (bodyStart + 1, bodyEnd).join ('\n');
            const params = this.splitCsharpParams (plist);
            const shadows: string[] = [];
            const renames: string[][] = [];
            let changed = false;
            for (const [ pos, targetType ] of rows (positions)) {
                const param = params[pos];
                if (param === undefined || !param.trimStart ().startsWith ('object ')) {
                    continue;
                }
                const paramName = param.split ('=')[0].trim ().split (/\s+/).pop () as string;
                if (numeric && VENUE_NUMERIC_ARG_NAMES.indexOf (paramName) === -1) {
                    continue;
                }
                const reassigned = new RegExp ('(?<![\\w.])' + paramName + '\\s*(?:\\?\\?)?=(?!=)').test (stripCsStringLiterals (body))
                    || numeric && new RegExp ('(?<![\\w.])(?:ref|out)\\s+' + paramName + '(?![\\w])').test (body);
                params[pos] = param.replace ('object ' + paramName, targetType + ' ' + paramName);
                if (reassigned) {
                    const alias = paramName + 'Var';
                    shadows.push (`${indent}    object ${alias} = ${paramName};`);
                    renames.push ([ paramName, alias ]);
                }
                changed = true;
            }
            if (!changed) {
                continue;
            }
            if (renames.length) {
                for (let k = bodyStart + 1; k < bodyEnd; k++) {
                    for (const [ name, alias ] of renames) {
                        lines[k] = this.renameLocalInBody (lines[k], name, alias);
                    }
                }
            }
            lines[i] = `${indent}public ${asyncKw || ''}${modifier} ${returnType} ${methodName}(${params.join (',')})`;
            if (shadows.length) {
                lines[bodyStart] = lines[bodyStart] + '\n' + shadows.join ('\n');
            }
            i = bodyEnd;
        }
        return lines.join ('\n');
    }

    typeVenueNumericArgs (content: string): string {
        return this.typeVenueArgs (content, VENUE_NUMERIC_ARGS, (positions: any) => Object.keys (positions).map ((k) => [ Number (k), positions[k] ]), true);
    }

    venueStringArgsWithBaseRows (venueKey: string): Record<string, number[]> | undefined {
        const own = VENUE_STRING_ARGS[venueKey];
        if (venueKey === 'BaseExchange' || venueKey === 'Exchange' || venueKey === 'PredictionExchange') {
            return own;
        }
        const baseKeys = venueKey.startsWith ('prediction:') ? [ 'BaseExchange', 'PredictionExchange' ] : [ 'BaseExchange', 'Exchange' ];
        const merged: Record<string, number[]> = { ...(own ?? {}) };
        for (const baseKey of baseKeys) {
            for (const [ name, positions ] of Object.entries (VENUE_STRING_ARGS[baseKey] ?? {})) {
                merged[name] = Array.from (new Set ([ ...(merged[name] ?? []), ...positions ])).sort ((a, b) => a - b);
            }
        }
        return Object.keys (merged).length ? merged : undefined;
    }

    // Narrows VENUE_STRING_ARGS[venueKey] parameters to `string?`: every call site passes a string, every
    // override declaration is still `object`, and every body use is an identity under `string?`. A body
    // that assigns the parameter gets the `object <name>Var = <name>;` shadow and keeps an object slot.
    typeVenueStringArgs (content: string, venueKey: string): string {
        // C# overrides are invariant on parameter types: a row on the generated base class
        // (BaseExchange / Exchange / PredictionExchange) retypes the virtual, so every venue
        // override of that name has to take the same spelling or CS0115 — merge the base rows
        // under the venue's own table instead of enumerating each override by hand.
        const table = this.venueStringArgsWithBaseRows (venueKey);
        if (table === undefined) {
            return content;
        }
        return this.typeVenueArgs (content, table, (positions: number[]) => positions.map ((pos) => [ pos, 'string?' ]), false);
    }

    // Copies of a `typeCoreArgs`-narrowed parameter may name its type (same box). Runs after typeCoreArgs;
    // coreArgShadowIsProvable checks every other use keeps overload, box and control flow. Only the
    // declaration changes.
    retypeCoreArgCopies (content: string): string {
        if (!/^\s*object \w+ = \w+;/m.test (content)) {
            return content;
        }
        return this.csharpPublicMethodBodies (content, (bodyLines, returnType, types) => {
            let changed = false;
            for (let k = 0; k < bodyLines.length; k++) {
                const decl = /^(\s*)object (\w+) = (\w+);\s*$/.exec (bodyLines[k]);
                if (decl === null) {
                    continue;
                }
                const [ , dindent, alias, source ] = decl;
                const type = types[source];
                if (type === undefined || type === 'object' || CORE_ARG_SHADOW_TYPES.indexOf (type) === -1) {
                    continue;
                }
                // Every source gets the extended (callee / RHS) rules; `limitCasts` (getLimit + integer
                // literal, `((Int64?)...)`) only for `limit`.
                // All-or-nothing per source: an unreproducible write line keeps the declaration `object`.
                const limitOwned = source === CORE_ARG_SHADOW_LIMIT_SOURCE;
                const limitCasts: number[] = [];
                if (this.coreArgShadowIsProvable (bodyLines, alias, type, returnType, k, limitOwned ? limitCasts : undefined)) {
                    const rewrites: Array<[ number, string ]> = [];
                    let ok = true;
                    for (const li of limitCasts) {
                        const rewritten = this.coreArgShadowLimitCastWrite (bodyLines[li], alias, type);
                        if (rewritten === null) {
                            ok = false;
                            break;
                        }
                        rewrites.push ([ li, rewritten ]);
                    }
                    if (ok && rewrites.length === limitCasts.length) {
                        bodyLines[k] = dindent + type + ' ' + alias + ' = ' + source + ';';
                        for (const [ li, rewritten ] of rewrites) {
                            bodyLines[li] = rewritten;
                        }
                        changed = true;
                    }
                }
            }
            return changed;
        });
    }

    // Order matters: retypeCoreArgCopies gives a narrowed parameter's copy the parameter's type, and
    // only then can dropRedundantCoreArgCasts prove a `((string)code)` / `((string)codeVar)` wrap redundant.
    finalizeCoreArgTypes (content: string): string {
        return this.dropRedundantCoreArgCasts (this.retypeCoreArgCopies (content));
    }

    // ===== plain identifier copies of typed params / typed locals =====
    // The source type is read off the EMITTED text (the printer answers `object` for every parameter),
    // and the copy is typed only when every other use is an identity by `coreArgShadowUseKind` or below.
    retypeIdentifierCopies (content: string): string {
        if (!/^\s*object \w+ = \w+;\s*$/m.test (content)) {
            return content;
        }
        const lines = content.split ('\n');
        const sigRe = /^(\s*)(?:public|private|protected|internal)\s+(?:static\s+)?(?:async\s+)?(?:virtual\s+|override\s+|sealed\s+|new\s+)*([\w<>., ?\[\]]+)\s+(\w+)\s*\((.*)\)\s*$/;
        for (let i = 0; i < lines.length; i++) {
            const sig = sigRe.exec (lines[i]);
            if (sig === null || lines[i + 1] !== sig[1] + '{') {
                continue; // only a method with its body block on the next line
            }
            const [ , indent, returnType, , plist ] = sig;
            const params = this.csharpParamTypes (plist);
            const bounds = this.methodBodyBounds (lines, i, indent);
            if (bounds === undefined) {
                continue;
            }
            const bodyEnd = bounds[1];
            const bodyLines = lines.slice (i + 2, bodyEnd);
            // local declarations of the body: a type the printer or a retype pass already
            // emitted. A name declared twice (two sibling blocks) proves nothing.
            const locals: Record<string, string> = {};
            const localCounts: Record<string, number> = {};
            for (const line of bodyLines) {
                const decl = /^\s*([A-Za-z_][\w<>, ?\[\]]*?)\s+(\w+)\s*=/.exec (line);
                if (decl !== null) {
                    locals[decl[2]] = decl[1].trim ();
                    localCounts[decl[2]] = (localCounts[decl[2]] ?? 0) + 1;
                }
            }
            // declared types visible to the proof: the method's parameters and its own single
            // local declarations. A name bound by both (a local shadowing a parameter) is dropped.
            const declared: Record<string, string> = {};
            for (const name of Object.keys (params)) {
                if ((localCounts[name] ?? 0) === 0) {
                    declared[name] = params[name];
                }
            }
            for (const name of Object.keys (locals)) {
                if ((localCounts[name] ?? 0) === 1 && params[name] === undefined) {
                    declared[name] = locals[name];
                }
            }
            let changed = false;
            for (let k = 0; k < bodyLines.length; k++) {
                const decl = /^(\s*)object (\w+) = (\w+);\s*$/.exec (bodyLines[k]);
                if (decl === null) {
                    continue;
                }
                const [ , dindent, alias, source ] = decl;
                if (IDENTIFIER_COPY_SKIPPED_ALIASES.indexOf (alias) !== -1 || IDENTIFIER_COPY_SKIPPED_SOURCES.indexOf (source) !== -1) {
                    continue;
                }
                const type = declared[source];
                if (type === undefined || IDENTIFIER_COPY_TYPES.indexOf (type) === -1) {
                    continue;
                }
                if (this.identifierCopyIsProvable (bodyLines, alias, type, returnType, k, declared)) {
                    bodyLines[k] = dindent + type + ' ' + alias + ' = ' + source + ';';
                    changed = true;
                }
            }
            if (changed) {
                for (let k = 0; k < bodyLines.length; k++) {
                    lines[i + 2 + k] = bodyLines[k];
                }
            }
            i = bodyEnd;
        }
        return lines.join ('\n');
    }

    // True when `alias` (declared `targetType` by retypeIdentifierCopies) is used only in the proven
    // shapes of `coreArgShadowIsProvable` plus the extensions here, and read at least once (CS0219).
    identifierCopyIsProvable (bodyLines: string[], alias: string, targetType: string, methodReturnType: string, skipLine: number, declared: Record<string, string>): boolean {
        const lines: string[] = [];
        const dictInits: boolean[] = [];
        const frames: number[][] = [];
        let inBlock = false;
        let depth = 0;
        for (const raw of bodyLines) {
            let line = raw;
            if (inBlock) {
                const end = line.indexOf ('*/');
                if (end === -1) { line = ''; } else { line = line.slice (end + 2); inBlock = false; }
            }
            const open = line.indexOf ('/*');
            if (open !== -1) {
                const end = line.indexOf ('*/', open);
                if (end === -1) { line = line.slice (0, open); inBlock = true; } else { line = line.slice (0, open) + line.slice (end + 2); }
            }
            const slash = this.coreArgShadowCommentAt (line);
            if (slash !== -1) {
                line = line.slice (0, slash);
            }
            while (frames.length > 0 && frames[frames.length - 1][0] > depth) {
                frames.pop ();
            }
            dictInits.push (frames.some ((frame) => frame[1] === 1));
            if (/(?:new Dictionary<string, object>|new List<object>|new object\[\])\s*\(?\s*\)?\s*\{/.test (line)) {
                const isDict = /new Dictionary<string, object>\s*\(?\s*\)?\s*\{/.test (line);
                frames.push ([ depth + this.coreArgShadowBraceDelta (line), isDict ? 1 : 0 ]);
            }
            depth += this.coreArgShadowBraceDelta (line);
            lines.push (line);
        }
        let reads = 0;
        for (let k = 0; k < lines.length; k++) {
            if (k === skipLine) {
                continue;
            }
            const line = lines[k];
            for (const at of this.coreArgShadowOccurrences (line, alias)) {
                const kind = this.identifierCopyUseKind (line, at, alias, targetType, methodReturnType, dictInits[k], declared);
                if (kind === '') {
                    return false;
                }
                if (kind === 'read') {
                    reads += 1;
                }
            }
        }
        return reads > 0;
    }

    // One occurrence of an identifier copy: `coreArgShadowUseKind`'s rules (`string?` is the same C#
    // type as `string`), then the extra write / read / callee shapes.
    identifierCopyUseKind (line: string, at: number, alias: string, targetType: string, methodReturnType: string, inDictInit: boolean, declared: Record<string, string>): string {
        const bare = (targetType === 'string?') ? 'string' : targetType;
        const known = this.coreArgShadowUseKind (line, at, alias, bare, methodReturnType, inDictInit);
        if (known !== '') {
            return known;
        }
        const pre = line.slice (0, at);
        const post = line.slice (at + alias.length);
        if (/(?:ref|out)\s+$/.test (pre)) {
            return '';
        }
        if (pre.trim () === '') {
            const m = /^\s*(?:\?\?=|=)\s*(.*?);?\s*$/.exec (post);
            if (m !== null && this.identifierCopyRhsIsTyped (m[1].trim (), targetType, declared)) {
                return 'write';
            }
            return '';
        }
        const postl = post.replace (/^\s+/, '');
        if (postl.charAt (0) === ',' || postl.charAt (0) === ')') {
            const callee = this.coreArgShadowCallee (line, at);
            if (callee !== null && IDENTIFIER_COPY_IDENTITY_CALLEES.indexOf (callee[0].split ('.').pop () as string) !== -1) {
                return 'read';
            }
        }
        // `<other> = alias;` where `other` is a local the body declares with a type the copy's
        // own type converts to implicitly: the assignment stores the same reference / box the
        // `object` spelling stored, and the target's own declaration (and every later use of it)
        // is untouched by this pass.
        const assign = /^(\w+)\s*=\s*$/.exec (pre.trim ());
        if (assign !== null && postl.trim () === ';') {
            const target = declared[assign[1]];
            if (target === 'object' || target === targetType || IDENTIFIER_COPY_WIDENING[targetType + '->' + target] === true) {
                return 'read';
            }
        }
        return '';
    }

    // One arm of a conditional write: a string literal, or a local the method declares with the
    // string box (`string` / `string?`).
    identifierCopyStringArmIsTyped (arm: string, declared: Record<string, string>): boolean {
        if (/^"(?:[^"\\]|\\.)*"$/.test (arm)) {
            return true;
        }
        if (/^\w+$/.test (arm)) {
            const type = declared[arm];
            return type === 'string' || type === 'string?';
        }
        return false;
    }

    // Right hand side whose C# static type is exactly `targetType` (or, for a `string?` target,
    // any nullable string producer): the write stores the same box either way.
    identifierCopyRhsIsTyped (rhs: string, targetType: string, declared: Record<string, string>): boolean {
        if (targetType === 'string' || targetType === 'string?') {
            // `this.safeOutcomeSymbol (...)` => string? (Exchange.PredictionAliases.cs /
            // prediction tier), `x.ToString ()` => string for any non-null x, and the
            // `(x as String).PadLeft (...)`: string
            if (/^this\.safeOutcomeSymbol\s*\(/.test (rhs) || /^\w+\.ToString\s*\(\s*\)$/.test (rhs)
                || /^\(\w+ as String\)\.PadLeft\s*\(/.test (rhs)) {
                return true;
            }
            // `(cond) ? "a" : "b"` / `(cond) ? strLocal : strLocal2`: the conditional's value is
            // the selected string (or null), so the declaration stores the same reference. Both
            // arms must be a string literal or a local the method declares string / string?.
            const arms = /^.*?\)\s*\?\s*(.*?)\s*:\s*(.*?)\s*$/.exec (rhs);
            if (arms !== null && arms[0].indexOf ('?') !== -1 && this.identifierCopyStringArmIsTyped (arms[1], declared)
                && this.identifierCopyStringArmIsTyped (arms[2], declared)) {
                return true;
            }
        }
        // a read of a local the method declares with the same box (`List<object>` into an
        // `IList<object>` copy, `string?` into a `string?` copy): the compiler already proves
        // every write to that local produces it.
        if (/^\w+$/.test (rhs)) {
            const source = declared[rhs];
            if (source !== undefined && source !== 'object' && source !== 'var') {
                if (source === targetType) {
                    return true;
                }
                if (IDENTIFIER_COPY_WIDENING[source + '->' + targetType] === true) {
                    return true;
                }
            }
        }
        return false;
    }

    // `((string)timeframe)` / `((string)timeframeVar)` is the identity once the binding is typed
    // `string` (narrowed parameter, string local or retyped shadow), so the cast is dropped. A name
    // declared `object`/`var` keeps its cast, where it is load-bearing.
    dropStringTimeframeCasts (content: string): string {
        if (!content.includes ('(string)timeframe')) {
            return content;
        }
        const names = [ 'timeframe', 'timeframeVar' ];
        return this.csharpPublicMethodBodies (content, (bodyLines, returnType, declared) => {
            if (!bodyLines.some ((line) => line.includes ('(string)timeframe'))) {
                return false;
            }
            for (const line of bodyLines) {
                for (const name of names) {
                    const decl = new RegExp ('^\\s*([A-Za-z_][\\w<>,?\\[\\] .]*)\\s+' + name + '\\s*[=;]').exec (line);
                    if (decl !== null) {
                        declared[name] = decl[1].trim ();
                    }
                }
            }
            let changed = false;
            for (const name of names) {
                const type = declared[name];
                if (type !== 'string' && type !== 'string?') {
                    continue;
                }
                for (let k = 0; k < bodyLines.length; k++) {
                    let line = bodyLines[k];
                    for (;;) {
                        // a removal can expose another cast on the same binding (`[(string)((string)t)]`
                        // leaves the indexer-key wrapper sitting directly on it), so settle the line
                        const rewritten = this.dropStringCastToken (line, name);
                        if (rewritten === line) {
                            break;
                        }
                        line = rewritten;
                        changed = true;
                    }
                    bodyLines[k] = line;
                }
            }
            return changed;
        });
    }

    // `visit` each `public virtual|override` method body (its lines, return type, parameter name -> type); a
    // visit answering true had rewritten `bodyLines`, which are written back
    // the body of the method whose signature is line `i`: [ opening-brace line, closing-brace line ], the
    // closing brace being the first line indented exactly like the signature (brace counting is unusable:
    // generated bodies carry braces inside string literals); undefined when no opening brace follows
    methodBodyBounds (lines: string[], i: number, indent: string): [ number, number ] | undefined {
        let bodyStart = i + 1;
        while (bodyStart < lines.length && lines[bodyStart].trim () !== '{') {
            bodyStart++;
        }
        if (bodyStart >= lines.length) {
            return undefined;
        }
        let bodyEnd = lines.length - 1;
        for (let j = bodyStart + 1; j < lines.length; j++) {
            if (lines[j] === indent + '}') { bodyEnd = j; break; }
        }
        return [ bodyStart, bodyEnd ];
    }

    // parameter name -> declared type of a printed parameter list (defaults dropped)
    csharpParamTypes (plist: string): Record<string, string> {
        const types: Record<string, string> = {};
        for (const param of this.splitCsharpParams (plist)) {
            const parts = param.split ('=')[0].trim ().split (/\s+/);
            if (parts.length >= 2) {
                types[parts[parts.length - 1]] = parts.slice (0, -1).join (' ');
            }
        }
        return types;
    }

    csharpPublicMethodBodies (content: string, visit: (bodyLines: string[], returnType: string, types: Record<string, string>) => boolean): string {
        const lines = content.split ('\n');
        const sigRe = /^(\s*)public (async )?(virtual|override) ([\w<>., ?]+) (\w+)\((.*)\)\s*$/;
        for (let i = 0; i < lines.length; i++) {
            const sig = sigRe.exec (lines[i]);
            if (sig === null) {
                continue;
            }
            const [ , indent, , , returnType, , plist ] = sig;
            const bounds = this.methodBodyBounds (lines, i, indent);
            if (bounds === undefined) {
                continue;
            }
            const [ bodyStart, bodyEnd ] = bounds;
            const bodyLines = lines.slice (bodyStart + 1, bodyEnd);
            const types = this.csharpParamTypes (plist);
            const changed = visit (bodyLines, returnType, types);
            if (changed) {
                for (let k = 0; k < bodyLines.length; k++) {
                    lines[bodyStart + 1 + k] = bodyLines[k];
                }
            }
            i = bodyEnd;
        }
        return lines.join ('\n');
    }

    // Removes the `(string)name` cast token (and, when the enclosing `(` is the cast's own grouping
    // paren, that pair) from one line. `f((string)x)` keeps the call paren (`f(x)`), `,((string)x),`
    // loses the redundant pair, `[(string)x]` loses the token. A member access or a longer name after
    // the operand, and any `)` that does not close the cast, leave the line untouched.
    dropStringCastToken (line: string, name: string): string {
        const token = '(string)' + name;
        let out = line;
        let from = 0;
        for (;;) {
            const at = out.indexOf (token, from);
            if (at === -1) {
                return out;
            }
            const after = out[at + token.length];
            if (after !== undefined && /[\w.]/.test (after)) {
                from = at + token.length;
                continue;
            }
            const before = at > 0 ? out[at - 1] : undefined;
            const beforeBefore = at > 1 ? out[at - 2] : undefined;
            // a `(` preceded by a word character or `)` is a call's paren, not the cast's grouping
            // paren; with any other predecessor it groups the cast and the pair is redundant
            const outerCast = before === '(' && beforeBefore === ')' && out.slice (0, at - 1).endsWith ('(string)');
            const groups = outerCast || (before === '(' && beforeBefore !== undefined && !/[\w)]/.test (beforeBefore));
            if (groups && after === ')') {
                out = out.slice (0, at - 1) + name + out.slice (at + token.length + 1);
                from = at - 1 + name.length;
                continue;
            }
            out = out.slice (0, at) + name + out.slice (at + token.length);
            from = at + name.length;
        }
    }

    // `client` is WebSocketClient by declaration in the ws tree (handler param, or `client()` result),
    // so the ws regexes' ((WebSocketClient)client) / (client as WebSocketClient) wrappers are identities.
    removeRedundantClientCasts (content: string): string {
        if (!/\(\(WebSocketClient\)client\)|\(client as WebSocketClient[,)]/.test (content)) {
            return content;
        }
        const lines = content.split ('\n');
        const sigRe = /^(\s*)public (async )?(virtual|override) ([\w<>., ?]+) (\w+)\((.*)\)\s*$/;
        const redeclRe = /^\s*(var|object|WebSocketClient)\s+client\s*=/;
        for (let i = 0; i < lines.length; i++) {
            const sig = sigRe.exec (lines[i]);
            if (sig === null) {
                continue;
            }
            const [ , indent, , , , , plist ] = sig;
            let typed = this.splitCsharpParams (plist).some ((param) => {
                const decl = param.split ('=')[0].trim ().split (/\s+/);
                return decl.length >= 2 && decl[decl.length - 1] === 'client' && /WebSocketClient$/.test (decl[decl.length - 2]);
            });
            const bounds = this.methodBodyBounds (lines, i, indent);
            if (bounds === undefined) {
                continue;
            }
            const [ bodyStart, bodyEnd ] = bounds;
            let changed = false;
            for (let k = bodyStart + 1; k < bodyEnd; k++) {
                const line = lines[k];
                if (line.trim ().startsWith ('//')) {
                    continue;
                }
                const redecl = redeclRe.exec (line);
                if (redecl !== null) {
                    const declared = redecl[1];
                    const init = line.substring (line.indexOf ('=') + 1).trim ();
                    typed = (declared === 'WebSocketClient') || (declared === 'var' && /^this\.client\s*\(/.test (init));
                    continue;
                }
                if (!typed) {
                    continue;
                }
                const fixed = line
                    .split ('((WebSocketClient)client)').join ('client')
                    .split ('(client as WebSocketClient,').join ('(client,')
                    .split ('(client as WebSocketClient)').join ('client');
                if (fixed !== line) {
                    lines[k] = fixed;
                    changed = true;
                }
            }
            if (changed) {
                i = bodyEnd;
            }
        }
        return lines.join ('\n');
    }

    // Retypes the helpers in COLLECTION_RETURN_METHODS from `object` to `IList<object>` (same
    // runtime box, now nameable) and normalizes the return sites that would stop compiling; see
    // the COLLECTION_RETURN_METHODS comment for the exact shapes. In-place, line-preserving:
    // only the signature line and specific single-line return statements change. The list is
    // also registered in build/csharp-local-types.js so `object x = this.<name>(...)` locals
    // become `IList<object>`.
    typeCollectionReturns (content: string): string {
        if (!COLLECTION_RETURN_METHODS.concat (COLLECTION_RETURN_DICT_METHODS).some ((name) => content.includes (' object ' + name + '('))) {
            return content;
        }
        const targets = new Map<string, string> ();
        for (const name of COLLECTION_RETURN_METHODS) {
            targets.set (name, 'IList<object>');
        }
        for (const name of COLLECTION_RETURN_DICT_METHODS) {
            targets.set (name, 'Dictionary<string, object>');
        }
        const lines = content.split ('\n');
        const sigRe = /^(\s*)public (async )?(virtual|override) object (\w+)\((.*)\)\s*$/;
        for (let i = 0; i < lines.length; i++) {
            const sig = sigRe.exec (lines[i]);
            if (!sig || !targets.has (sig[4])) {
                continue;
            }
            const [ , indent, , , methodName, plist ] = sig;
            const target = targets.get (methodName) as string;
            // body span: opening brace on its own line, closing brace at the signature indent
            const bounds = this.methodBodyBounds (lines, i, indent);
            if (bounds === undefined) {
                continue;
            }
            const [ bodyStart, bodyEnd ] = bounds;
            const paramNames = this.splitCsharpParams (plist)
                .map ((p) => p.split ('=')[0].trim ().split (/\s+/).pop ())
                .filter ((p) => p !== undefined) as string[];
            lines[i] = lines[i].replace (' object ' + methodName + '(', ' ' + target + ' ' + methodName + '(');
            if (target !== 'IList<object>') {
                continue; // dict returns need no return-site normalization
            }
            for (let j = bodyStart + 1; j < bodyEnd; j++) {
                const line = lines[j];
                const trimmed = line.trim ();
                if (!trimmed.startsWith ('return ')) {
                    continue;
                }
                const pad = line.substring (0, line.length - line.trimStart ().length);
                // arraySlice keeps its object signature (byte[] callers get byte[] / List<byte>
                // back); toArray is an identity on the list inputs these helpers receive
                const slice = /^return this\.arraySlice\((.*)\);\s*$/.exec (trimmed);
                if (slice) {
                    lines[j] = `${pad}return this.toArray(this.arraySlice(${slice[1]}));`;
                    continue;
                }
                // `return ((object)this.<another listed name>(...));` — the (object) cast was a
                // no-op while both sides were `object`; drop it so the typed return compiles
                if (trimmed.startsWith ('return ((object)this.')) {
                    const inner = trimmed.substring ('return ((object)this.'.length);
                    const called = /^(\w+)\(/.exec (inner);
                    if (called && targets.has (called[1])) {
                        lines[j] = pad + 'return this.' + inner.replace (/\)\);\s*$/, ');');
                        continue;
                    }
                }
                // `return <own object param>;` — the null/empty guards hand the input straight
                // back; toArray keeps null null and an IList<object>/List<object> identical
                const ident = /^return (\w+);\s*$/.exec (trimmed);
                if (ident && paramNames.includes (ident[1])) {
                    lines[j] = `${pad}return this.toArray(${ident[1]});`;
                    continue;
                }
            }
        }
        return lines.join ('\n');
    }

    // The C# type the nearest in-scope declaration of `name` at or before `at` gives it, or '' when
    // no declaration is in scope. Walks back line by line to the enclosing public method signature
    // (the shape typeCoreArgs rewrites) and rejects a declaration whose block has already closed
    // before the site (delta + after < 0), so a same-named local of a sibling block is never used.
    // A trailing `//` comment is cut: the generated tree carries whole commented-out bodies whose
    // declarations must not be read.
    coreArgCastDeclaredType (content: string, at: number, name: string): string {
        const declRe = new RegExp ('(?<![\\w.])(string\\?|string|object|Int64\\?|Int64|double\\?|double|bool\\?|bool)\\s+' + name + '\\b(?!\\s*\\()', 'g');
        const sigRe = /^(\s*)public (async )?(virtual|override) ([\w<>., ?]+) (\w+)\((.*)\)\s*$/;
        let offset = at;
        let delta = 0;
        for (;;) {
            const lineStart = content.lastIndexOf ('\n', offset - 1) + 1;
            let text = content.slice (lineStart, offset);
            const comment = this.coreArgShadowCommentAt (text);
            if (comment !== -1) {
                text = text.slice (0, comment);
            }
            let last: RegExpExecArray | null = null;
            declRe.lastIndex = 0;
            for (;;) {
                const m = declRe.exec (text);
                if (m === null) {
                    break;
                }
                last = m;
                declRe.lastIndex = m.index + m[0].length;
            }
            if (last !== null) {
                const after = this.coreArgShadowBraceDelta (text.slice (last.index + last[0].length));
                if (delta + after >= 0) {
                    return last[1];
                }
            }
            if (sigRe.test (text)) {
                return '';
            }
            delta += this.coreArgShadowBraceDelta (text);
            if (lineStart === 0) {
                return '';
            }
            offset = lineStart - 1;
        }
    }

    // Drops the `((string)name)` wrap castCoreArgCallSites left on a `code`/`codeVar` argument already
    // typed `string` (same nearest-declaration proof): static type, overload and box are unchanged.
    // Runs after retypeCoreArgCopies.
    dropRedundantCoreArgCasts (content: string): string {
        for (const name of CORE_ARG_CAST_EXEMPT_NAMES) {
            const needle = '((string)' + name + ')';
            let from = 0;
            for (;;) {
                const at = content.indexOf (needle, from);
                if (at === -1) {
                    break;
                }
                const before = content[at - 1];
                const after = content[at + needle.length];
                const free = (before === undefined || !/[\w.]/.test (before)) && (after === undefined || !/\w/.test (after));
                if (free && this.coreArgCastDeclaredType (content, at, name) === 'string') {
                    content = content.slice (0, at) + name + content.slice (at + needle.length);
                    from = at + name.length;
                    continue;
                }
                from = at + needle.length;
            }
        }
        return content;
    }

    // Drop a receiver cast proven by the EMITTED declaration text, after the printer and retypeCoreArgCopies:
    // `((string)x).Split/.ToUpper/...` where `x` is declared `string`/`string?` in the method, and
    // `((IDictionary<string, object>)x)` where `x` is declared `Dictionary`/`IDictionary<string, object>`.
    // A name with any other binding in the method (another declaration, a lambda/foreach/catch/for variable) stays cast.
    retypePrintedReceiverCasts (content: string): string {
        const dictType = /^I?Dictionary<string, ?object>\??$/;
        content = this.retypeReceiverCasts (content, content.includes ('((IDictionary<string,object>)') || content.includes ('((IDictionary<string, object>)'), {
            type: dictType,
            declRe: /^\s*(object|string\??|bool\??|Int64\??|double\??|int\??|long\??|var|byte\[\]|List<[^>]*>\??|IList<[^>]*>\??|Dictionary<[^>]*>\??|IDictionary<[^>]*>\??|ccxt\.[\w.<>?]+|Future\??|WebSocketClient\??|[A-Z][\w.<>, ?\[\]]*?)\s+([A-Za-z_][A-Za-z0-9_]*)\s*[=;]/,
            paramRe: /^(?:ref\s+|out\s+|params\s+)?(.+?)\s+([A-Za-z_][A-Za-z0-9_]*)(?:\s*=.*)?$/,
            shadowed: (text: string, name: string) => [ ...text.matchAll (new RegExp ('[(,]\\s*([\\w.<>?\\[\\]]+(?:, ?[\\w.<>?]+>)?)\\s+' + name + '\\s*[,)]', 'g')) ].some ((m) => !dictType.test (m[1])),
            cast: (name: string) => new RegExp ('\\(\\(IDictionary<string, ?object>\\)' + name + '\\)(?=[.[])', 'g'),
            replacement: (name: string) => name,
        });
        return this.retypeReceiverCasts (content, content.includes ('((string)'), {
            type: /^string\??$/,
            declRe: /^\s*(object|string\??|bool\??|Int64\??|double\??|int\??|long\??|var|byte\[\]|List<[^>]*>|IList<[^>]*>|Dictionary<[^>]*>|IDictionary<[^>]*>|ccxt\.[\w.<>?]+|Future\??|WebSocketClient\??)\s+([A-Za-z_][A-Za-z0-9_]*)\s*=/,
            paramRe: /^(string\??)\s+([A-Za-z_][A-Za-z0-9_]*)/,
            shadowed: () => false,
            cast: (name: string) => new RegExp ('\\(\\(string\\)' + name + '\\)\\.(Split|ToUpper|ToLower|Replace|Trim|Length)\\b', 'g'),
            replacement: (name: string) => name + '.$1',
        });
    }

    // one row of retypePrintedReceiverCasts: per public method, names declared with `row.type` (params whose type
    // fails it are blocked only when `row.paramRe` captures any type) lose the `row.cast` around them
    retypeReceiverCasts (content: string, present: boolean, row: any): string {
        if (!present) {
            return content;
        }
        const sigRe = /^(\s*)public\s+(?:async\s+|virtual\s+|override\s+)+[\w<>., ?]+\s+\w+\s*\((.*)\)\s*$/;
        const lines = content.split ('\n');
        for (let i = 0; i < lines.length; i++) {
            const sig = sigRe.exec (lines[i]);
            if (sig === null) {
                continue;
            }
            const bounds = this.methodBodyBounds (lines, i, sig[1]);
            if (bounds === undefined) {
                continue;
            }
            const [ bodyStart, bodyEnd ] = bounds;
            const candidates = new Set<string> ();
            const blocked = new Set<string> ();
            for (const param of this.splitCsharpParams (sig[2])) {
                const declared = row.paramRe.exec (param.trim ());
                if (declared !== null) {
                    (row.type.test (declared[1]) ? candidates : blocked).add (declared[2]);
                }
            }
            for (let j = bodyStart + 1; j < bodyEnd; j++) {
                const declaration = row.declRe.exec (lines[j]);
                if (declaration !== null) {
                    (row.type.test (declaration[1]) ? candidates : blocked).add (declaration[2]);
                }
            }
            const body = lines.slice (bodyStart + 1, bodyEnd);
            const text = body.join ('\n');
            let rewritten = text;
            for (const name of candidates) {
                if (blocked.has (name)) {
                    continue; // another binding of the name exists in this method
                }
                if (new RegExp ('\\b' + name + '\\b\\s*=>').test (text)) {
                    continue; // a lambda parameter of the same name would shadow it
                }
                if (new RegExp ('(?:\\bforeach|\\bcatch|\\bfor|\\busing|\\bfixed)\\s*\\([^)]*\\b' + name + '\\b').test (text)) {
                    continue; // a loop/catch variable of the same name would shadow it
                }
                if (!row.shadowed (text, name)) {
                    rewritten = rewritten.replace (row.cast (name), row.replacement (name));
                }
            }
            if (rewritten !== text) {
                const rewrittenBody = rewritten.split ('\n');
                lines.splice (bodyStart + 1, body.length, ...rewrittenBody);
                i = bodyStart + rewrittenBody.length;
            }
        }
        return lines.join ('\n');
    }

    // drop `((string)x)` when the enclosing method declares `x` as `string`/`string?`: the printer wraps
    // every string receiver, and string -> string is an identity reference conversion (null stays null).
    // Scope is the method; a name also declared with another type or `var` keeps its cast.
    stripRedundantStringCasts (content: string): string {
        const targets = [ 'type', 'side', 'status', 'id', 'marketId' ];
        const declRe = new RegExp ('(?:^|[\\s(,])(string\\?|string|object|var|bool\\?|bool|Int64\\?|Int64|double\\?|double|int\\?|int|Dictionary<string, object>|List<object>|IList<object>|IDictionary<string, object>)\\s+(' + targets.join ('|') + ')(?![\\w])\\s*(?==|,|\\))', 'g');
        return this.stringCastPass (content, declRe, (allowed, blocked) => {
            const names = [ ...allowed ].filter ((n) => !blocked.has (n));
            return (names.length === 0) ? undefined : (line) => this.dropStringCastsOnLine (line, names);
        });
    }

    // per method region (signature line to the next signature line: braces inside comments would drift a
    // brace count), `declRe` over the code (signature plus non-comment body lines; a doc line never widens
    // the sets) splits the bound names into declared `string`/`string?` and anything else; `rewriter`
    // answers the region's non-comment line rewrite, or undefined to leave the region
    stringCastPass (content: string, declRe: RegExp, rewriter: (allowed: Set<string>, blocked: Set<string>) => ((line: string) => string) | undefined): string {
        const lines = content.split ('\n');
        const sigLines = lines.flatMap ((line, i) => this.isCsharpMethodSignature (line) ? [ i ] : []);
        for (let k = 0; k < sigLines.length; k++) {
            const end = (k + 1 < sigLines.length) ? sigLines[k + 1] : lines.length;
            const code = lines.slice (sigLines[k] + 1, end).filter ((line) => !this.isCsharpCommentLine (line));
            const allowed = new Set<string> ();
            const blocked = new Set<string> ();
            for (const m of [ lines[sigLines[k]] ].concat (code).join ('\n').matchAll (declRe)) {
                (((m[1] === 'string') || (m[1] === 'string?')) ? allowed : blocked).add (m[2]);
            }
            const rewrite = rewriter (allowed, blocked);
            for (let j = sigLines[k] + 1; (rewrite !== undefined) && (j < end); j++) {
                if (!this.isCsharpCommentLine (lines[j])) {
                    lines[j] = rewrite (lines[j]);
                }
            }
        }
        return lines.join ('\n');
    }

    isCsharpCommentLine (line: string): boolean {
        const trimmed = line.trim ();
        return trimmed.startsWith ('*') || trimmed.startsWith ('//')
            || trimmed.startsWith ('/*') || trimmed.endsWith ('*/');
    }

    // `((string)name)` → `name`, repeatedly (a nested `((string)((string)x))` needs two
    // rounds), only in the code part of the line: double-quoted literals and `//` comments
    // are copied through untouched.
    dropStringCastsOnLine (line: string, names: string[]): string {
        const commentAt = this.coreArgShadowCommentAt (line, '"');
        const code = (commentAt === -1) ? line : line.substring (0, commentAt);
        const tail = (commentAt === -1) ? '' : line.substring (commentAt);
        let out = '';
        let i = 0;
        while (i < code.length) {
            const quote = code.indexOf ('"', i);
            if (quote === -1) {
                out += this.dropStringCasts (code.substring (i), names);
                break;
            }
            out += this.dropStringCasts (code.substring (i, quote), names);
            const close = this.coreArgShadowSkipLiteral (code, quote);
            out += code.substring (quote, close);
            i = close;
        }
        return out + tail;
    }

    dropStringCasts (span: string, names: string[]): string {
        let out = span;
        for (let round = 0; round < 3; round++) {
            let changed = false;
            for (const name of names) {
                const re = new RegExp ('\\(\\(string\\)' + name + '\\)', 'g');
                out = out.replace (re, (match: string, ...rest: any[]) => {
                    const offset = rest[rest.length - 2] as number;
                    const input = rest[rest.length - 1] as string;
                    const before = (offset > 0) ? input[offset - 1] : '';
                    const after = input[offset + match.length] || '';
                    // `((string)NAME)` is textually the same string in two shapes: the cast
                    // wrapper the printer emits (`x as string`, `x.toUpperCase()` receivers)
                    // and a CALL's paren followed by the printer's single-paren cast
                    // (`Remove((string)id)`, `throw new X((string)m)`). Deleting the wrapper is
                    // only safe in the first shape: in the second the match's leading paren
                    // belongs to the call (`…Removeid;`). The two are told apart by the
                    // character before the match — a method name never precedes a wrapper
                    // (`f(((string)x))` is a wrapper as the sole argument, `f((string)x)` is
                    // the call's paren plus a single cast) — so a match preceded by an
                    // identifier is left untouched and its cast stays correct.
                    if (/[A-Za-z0-9_]/.test (before)) {
                        return match;
                    }
                    changed = true;
                    return name;
                });
            }
            if (!changed) {
                break;
            }
        }
        return out;
    }

    // drop `((string)X)` when X is already `string`: a string literal, a nested string cast, a `this.<m>(...)`
    // declared string-returning, or a name the method declares `string`/`string?` (identity conversion).
    // Conflicting declarations veto; `f((string)X)` drops only the cast token so the call's paren survives.
    dropIdentityStringCasts (content: string): string {
        if (!content.includes ('((string)')) {
            return content;
        }
        const fields = new Set<string> (STRING_PRODUCER_FIELDS);
        // every `public ... <name>(` in the content: the emitted declaration decides the type of a
        // `this.<name>(...)` call; two declarations that disagree answer `*`, which vetoes the name
        const declared = new Map<string, string> ();
        for (const m of content.matchAll (/^\s*public\s+(?:static\s+|virtual\s+|override\s+|async\s+|new\s+)*([A-Za-z_][\w<>.,?\[\]]*)\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(/gm)) {
            const previous = declared.get (m[2]);
            if (previous === undefined) {
                declared.set (m[2], m[1]);
            } else if (previous !== m[1]) {
                declared.set (m[2], '*');
            }
        }
        const stringProducer = (name: string): boolean => {
            if (declared.has (name)) {
                const ret = declared.get (name);
                return (ret === 'string') || (ret === 'string?');
            }
            return STRING_PRODUCER_HELPERS[name] !== undefined;
        };
        const declRe = new RegExp ('(?:^|[\\s(,])(string\\?|string|object|var|bool\\?|bool|Int64\\?|Int64|double\\?|double|int\\?|int|Dictionary<string, object>|IDictionary<string, object>|List<object>|IList<object>|ccxt\\.[\\w.<>?]+|[A-Z][\\w.]*)\\s+([A-Za-z_][A-Za-z0-9_]*)(?![\\w])\\s*(?==|,|\\))', 'g');
        // the veto: another binding of the name, or a lambda / loop / catch parameter of that name
        // anywhere in the method body would shadow it (stringCastPass asks once per region, in order)
        const lines = content.split ('\n');
        const sigLines = lines.flatMap ((line, i) => this.isCsharpMethodSignature (line) ? [ i ] : []);
        let region = 0;
        return this.stringCastPass (content, declRe, (allowed, blocked) => {
            const k = region++;
            const body = lines.slice (sigLines[k] + 1, (k + 1 < sigLines.length) ? sigLines[k + 1] : lines.length).join ('\n');
            const veto = (name: string): boolean => blocked.has (name)
                || new RegExp ('\\b' + name + '\\b\\s*=>').test (body)
                || new RegExp ('\\([^()]*\\b' + name + '\\b[^()]*\\)\\s*=>').test (body)
                || new RegExp ('(?:\\bforeach|\\bcatch|\\bfor|\\busing|\\bfixed)\\s*\\([^)]*\\b' + name + '\\b').test (body);
            return (line) => this.dropIdentityStringCastsOnLine (line, allowed, veto, stringProducer, fields);
        });
    }

    // one line of the pass above: scan the code part (a `//` comment and the inside of string
    // literals are never touched -- maskCsharpLiterals blanks the literals, so a `((string)` and
    // a paren inside one can neither match nor shift the paren depth), drop every removable cast
    // that does not overlap another one on the same line, and repeat: a removal can expose the
    // next wrapper (`((string)((string)x))` -> `((string)x)` -> `x`).
    dropIdentityStringCastsOnLine (line: string, allowed: Set<string>, veto: (name: string) => boolean,
                                  stringProducer: (name: string) => boolean, fields: Set<string>): string {
        let out = line;
        for (let round = 0; round < 6; round++) {
            const commentAt = this.coreArgShadowCommentAt (out, '"');
            const masked = this.maskCsharpLiterals ((commentAt === -1) ? out : out.substring (0, commentAt));
            const removals: number[][][] = [];
            let from = 0;
            let lastEnd = -1;
            for (;;) {
                const at = masked.indexOf ('((string)', from);
                if (at === -1) {
                    break;
                }
                from = at + 9;
                if (at < lastEnd) {
                    continue; // nested in a removal already accepted on this line -- next round
                }
                const removal = this.identityStringCastRemoval (out, masked, at, allowed, veto, stringProducer, fields);
                if (removal !== null) {
                    removals.push (removal);
                    lastEnd = removal[removal.length - 1][1];
                }
            }
            if (removals.length === 0) {
                break;
            }
            for (let i = removals.length - 1; i >= 0; i--) {
                const ranges = removals[i];
                for (let r = ranges.length - 1; r >= 0; r--) {
                    const [ a, b ] = ranges[r];
                    out = out.substring (0, a) + out.substring (b);
                }
            }
        }
        return out;
    }


    // the [from, to) range(s) to delete for the cast at `at` (index of the `((string)` in the
    // masked line), or null when the operand's static type is not provably `string`. The first
    // range is the cast token; a wrapper adds a second range for its closing `)`.
    identityStringCastRemoval (line: string, masked: string, at: number, allowed: Set<string>,
                               veto: (name: string) => boolean, stringProducer: (name: string) => boolean,
                               fields: Set<string>): number[][] | null {
        const open = at + 9;
        // the operand ends at the first `,` `)` `;` `}` `]` at paren depth 0 -- for the wrapper
        // that `)` is the cast's own, for `f((string)X, y)` the argument's separator
        let depth = 0;
        let term = -1;
        for (let i = open; i < masked.length; i++) {
            const ch = masked[i];
            if (ch === '(') {
                depth++;
            } else if (ch === ')') {
                if (depth === 0) { term = i; break; }
                depth--;
            } else if ((depth === 0) && ((ch === ',') || (ch === ';') || (ch === '}') || (ch === ']'))) {
                term = i;
                break;
            }
        }
        if (term === -1) {
            return null;
        }
        const operand = line.substring (open, term).trim ();
        if (!this.identityStringOperand (operand, allowed, veto, stringProducer, fields)) {
            return null;
        }
        // Is the `(` at `at` the cast's own paren (the wrapper `((string)X)`, delete the pair)
        // or a CALL's paren followed by the printer's single cast (`f((string)X)`, delete only
        // the cast token -- deleting the pair there would eat the call's paren)? A word character
        // immediately before it is a callee (`Remove((string)k)`), and a non-keyword word before
        // whitespace is a callee the printer spaced off (`new ExchangeError ((string)m)`); a `)`
        // or `]` is resolved by the group it closes -- an expression group is the cast's own
        // paren (`[(string)((string)code)]`), a call/indexer group is a call's.
        const before = (at > 0) ? masked[at - 1] : '';
        const prevWord = /([A-Za-z_][A-Za-z0-9_]*)\s*$/.exec (masked.substring (0, at));
        let callParen = /[A-Za-z0-9_\]]/.test (before);
        if (!callParen && (before === ')')) {
            const group = csharpMatchingClose (masked, at - 1, ')', '(', '', -1);
            const beforeGroup = (group > 0) ? masked[group - 1] : '';
            callParen = /[A-Za-z0-9_\]]/.test (beforeGroup);
        }
        if (!callParen && (prevWord !== null) && !CALL_PRECEDING_KEYWORDS.has (prevWord[1])) {
            callParen = true;
        }
        if (callParen) {
            return [ [ at + 1, at + 9 ] ];
        }
        // the wrapper `((string)X)`: the `(` at `at` must close exactly at `term`, which is the
        // invariant that makes the removal a balanced-pair delete
        if ((masked[term] !== ')') || (csharpMatchingClose (masked, at, '(', ')', '"') !== term)) {
            return null;
        }
        return [ [ at, at + 9 ], [ term, term + 1 ] ];
    }

    identityStringOperand (operand: string, allowed: Set<string>, veto: (name: string) => boolean,
                           stringProducer: (name: string) => boolean, fields: Set<string>): boolean {
        if (operand.startsWith ('"') || operand.startsWith ('@"') || operand.startsWith ('$"')) {
            return true; // a string literal IS a string
        }
        if (operand.startsWith ('((string)') || operand.startsWith ('(string)')) {
            return true; // a nested cast to `string` already yields a `string`
        }
        const call = /^this\.([A-Za-z_][A-Za-z0-9_]*)\s*\(/.exec (operand);
        if (call !== null) {
            return stringProducer (call[1]);
        }
        const field = /^this\.([A-Za-z_][A-Za-z0-9_]*)$/.exec (operand);
        if (field !== null) {
            return fields.has (field[1]);
        }
        const ident = /^([A-Za-z_][A-Za-z0-9_]*)$/.exec (operand);
        if (ident !== null) {
            return allowed.has (ident[1]) && !veto (ident[1]);
        }
        return false;
    }

    isCsharpMethodSignature (line: string): boolean {
        return /^    (?:public|private|protected|internal)\b.*\)\s*$/.test (line);
    }

    // drop `((string)X)` when X is provably the non-nullable `string` the cast targets: a string literal,
    // this.numberToString/json/intToBase16/urlencode or a Precise.string* static (all declare `string`).
    // `string?` producers, `object` operands and string-method receiver casts keep their cast.
    foldIdentityStringCasts (content: string): string {
        const CALLEES = [ 'this.numberToString(', 'this.json(', 'this.intToBase16(', 'this.urlencode(' ];
        const STATIC_PRODUCER = /^Precise\.string[A-Za-z0-9_]*\(/;
        let out = '';
        let i = 0;
        for (;;) {
            const at = content.indexOf ('((string)', i);
            if (at === -1) {
                out += content.substring (i);
                break;
            }
            // A call's argument list also starts with `((string)` when its first argument is a
            // `(string)` cast — `Remove((string)key)`, and the printer's `throw new X ((string)arg)`
            // which even puts a space before the `(`. Only an EXPRESSION-position `((string)` is a
            // cast WRAP: the identifier token before it must not be a plain callable name (a
            // keyword like `return` / `throw` / `new` still starts an expression).
            const prevWord = /([A-Za-z_][\w]*)\s*$/.exec (content.substring (0, at));
            if (prevWord !== null && !CALL_PRECEDING_KEYWORDS.has (prevWord[1])) {
                out += content.substring (i, at + 9);
                i = at + 9;
                continue;
            }
            const rest = content.substring (at + 9);
            let end = -1; // index just past the cast's own closing `)`
            const literal = /^"(?:[^"\\]|\\.)*"/.exec (rest);
            if (literal !== null) {
                end = (rest[literal[0].length] === ')') ? at + 9 + literal[0].length + 1 : -1;
            } else {
                const callee = CALLEES.find ((c) => rest.startsWith (c));
                const isStatic = STATIC_PRODUCER.test (rest);
                if (callee !== undefined || isStatic) {
                    // `head` = index of the call's own `(` inside `rest`
                    const head = (callee !== undefined) ? callee.length - 1 : (STATIC_PRODUCER.exec (rest) as RegExpExecArray)[0].length - 1;
                    const open = at + 9 + head;
                    const close = csharpMatchingClose (content, open, '(', ')', '"');
                    if (close !== -1 && content[close + 1] === ')') {
                        end = close + 2;
                    }
                }
            }
            if (end === -1) {
                out += content.substring (i, at + 9);
                i = at + 9;
                continue;
            }
            // the outer `(` at `at` must close exactly at the cast's own `)` — the invariant
            // that makes the removal a balanced-pair delete (`((string)X)` -> `X`)
            if (csharpMatchingClose (content, at, '(', ')', '"') !== end - 1) {
                out += content.substring (i, at + 9);
                i = at + 9;
                continue;
            }
            out += content.substring (i, at) + content.substring (at + 9, end - 1);
            i = end;
        }
        return out;
    }

    // `getArrayLength(x)` and `((IList<object>)x).ToArray()/.First()/.Last()` on a receiver the method
    // declares List<>/IList<> become `x.Count` / the cast-less Linq call; a nullable receiver keeps the
    // helper's null->0 as `x?.Count ?? 0`; an `object` receiver is left untouched.
    nativeListHelperCalls (content: string): string {
        content = this.csharpOrderbookCacheCasts (content);
        content = this.csharpListResultToArray (content);
        const masked = this.maskCsharpLiterals (content);
        const lines = content.split ('\n');
        const maskedLines = masked.split ('\n');
        const returns = this.csharpFileReturnTypes (maskedLines);
        const starts: number[] = [];
        let offset = 0;
        for (const line of lines) {
            starts.push (offset);
            offset += line.length + 1;
        }
        const depth: number[] = [];
        let braces = 0;
        for (const line of maskedLines) {
            depth.push (braces);
            braces += this.csharpBraceDelta (line);
        }
        const pieces: string[] = [];
        let cursor = 0;
        let line = 0;
        while (line < lines.length) {
            if ((depth[line] > 1) || !CSHARP_MEMBER_SIGNATURE.test (maskedLines[line]) || (maskedLines[line].indexOf ('(') < 0)) {
                line++;
                continue;
            }
            const span = this.csharpMethodBodySpan (maskedLines, line);
            if (span === undefined) {
                line++;
                continue;
            }
            const [ a, b ] = span;
            if (starts[a] < cursor) {
                line = b + 1;
                continue;
            }
            const { lists, nonNull } = this.csharpTypedListReceivers (maskedLines.slice (a, b + 1));
            const temps = this.csharpTempHolderListTypes (maskedLines.slice (a, b + 1), returns);
            const end = starts[b] + lines[b].length;
            const region = content.substring (starts[a], end);
            if ((lists.size > 0) || (temps.size > 0)) {
                let rewritten = (lists.size > 0) ? this.csharpNativeListCalls (region, lists, nonNull) : region;
                rewritten = this.csharpIdentityListCasts (rewritten, lists, temps);
                if (rewritten !== region) {
                    pieces.push (content.substring (cursor, starts[a]));
                    pieces.push (rewritten);
                    cursor = end;
                }
            }
            line = b + 1;
        }
        if (cursor === 0) {
            return content;
        }
        pieces.push (content.substring (cursor));
        return pieces.join ('');
    }

    // same-length copy of `content` with string/char literals and comments blanked out (a brace or
    // a `getArrayLength(` inside a literal must not move any structural scan)
    maskCsharpLiterals (content: string): string {
        const out: string[] = content.split ('');
        const blank = (at: number) => { out[at] = (content[at] === '\n') ? '\n' : ' '; };
        let i = 0;
        while (i < content.length) {
            const ch = content[i];
            const verbatim = (ch === '@') && (content[i + 1] === '"');
            if (verbatim || (ch === '"') || (ch === "'")) {
                const quote = verbatim ? '"' : ch;
                blank (i);
                i += verbatim ? 2 : 1;
                while (i < content.length) {
                    if (!verbatim && (content[i] === '\\') && (i + 1 < content.length)) {
                        blank (i);
                        blank (i + 1);
                        i += 2;
                        continue;
                    }
                    if (verbatim && (content[i] === '"') && (content[i + 1] === '"')) {
                        blank (i);
                        blank (i + 1);
                        i += 2;
                        continue;
                    }
                    if (content[i] === quote) {
                        blank (i);
                        i++;
                        break;
                    }
                    if (content[i] === '\n') {
                        i++;
                        break;
                    }
                    blank (i);
                    i++;
                }
                continue;
            }
            if ((ch === '/') && (content[i + 1] === '/')) {
                while ((i < content.length) && (content[i] !== '\n')) {
                    blank (i);
                    i++;
                }
                continue;
            }
            if ((ch === '/') && (content[i + 1] === '*')) {
                blank (i);
                blank (i + 1);
                i += 2;
                while ((i < content.length) && !((content[i] === '*') && (content[i + 1] === '/'))) {
                    blank (i);
                    i++;
                }
                if (i < content.length) {
                    blank (i);
                    blank (i + 1);
                    i += 2;
                }
                continue;
            }
            i++;
        }
        return out.join ('');
    }

    csharpBraceDelta (maskedLine: string): number {
        return (maskedLine.match (/\{/g) ?? []).length - (maskedLine.match (/\}/g) ?? []).length;
    }

    // `[start, end]` line range of the method body whose signature line is `start` (the signature
    // may wrap, so the body opens at the first line carrying `{`)
    csharpMethodBodySpan (maskedLines: string[], start: number): [ number, number ] | undefined {
        let open = start;
        while ((open < maskedLines.length) && (open - start < 40) && (maskedLines[open].indexOf ('{') < 0)) {
            open++;
        }
        if (open >= maskedLines.length) {
            return undefined;
        }
        let braces = 0;
        for (let k = open; k < maskedLines.length; k++) {
            braces += this.csharpBraceDelta (maskedLines[k]);
            if (braces <= 0) {
                return [ start, k ];
            }
        }
        return undefined;
    }


    // receivers of this method body: `lists` holds the names whose only C# declaration here is a
    // list type, `nonNull` the subset whose every write is a non-null producer. Parameters,
    // initializer-less declarations, `ref`/`out` sinks and compound assignments are never
    // non-null (the caller of a method can hand it a null list).
    csharpTypedListReceivers (maskedLines: string[]) {
        const declTypes = new Map<string, Set<string>>();
        const writes = new Map<string, string[]> ();
        const unsafe = new Set<string> ();
        const declare = (name: string, type: string) => {
            const types = declTypes.get (name) ?? new Set<string> ();
            types.add (type);
            declTypes.set (name, types);
        };
        let signatureEnd = maskedLines.length - 1;
        for (let k = 0; k < maskedLines.length; k++) {
            if (maskedLines[k].indexOf ('{') >= 0) {
                signatureEnd = k;
                break;
            }
        }
        const signature = maskedLines.slice (0, signatureEnd + 1).join (' ');
        const open = signature.indexOf ('(');
        if (open >= 0) {
            const close = csharpMatchingClose (signature, open, '([{', ')]}');
            if (close > 0) {
                for (const arg of this.splitCsharpParams (signature.substring (open + 1, close))) {
                    const param = CSHARP_TYPED_BINDING.exec (arg);
                    if (param && !CSHARP_NON_TYPES.has (param[1])) {
                        declare (param[2], param[1]);
                        unsafe.add (param[2]);
                    }
                }
            }
        }
        for (let k = signatureEnd + 1; k < maskedLines.length; k++) {
            const line = maskedLines[k];
            // a `ref`/`out` sink or a compound assignment can rewrite any name at any statement
            const sink = /^\s*([A-Za-z_]\w*)\s*(?:\+=|-=|\*=|\/=|\?\?=|&=|\|=|\^=|<<=|>>=)/.exec (line);
            if (sink) {
                unsafe.add (sink[1]);
            }
            if (/\b(?:ref|out)\s+[A-Za-z_]\w*/.test (line)) {
                for (const m of line.matchAll (/\b(?:ref|out)\s+([A-Za-z_]\w*)/g)) {
                    unsafe.add (m[1]);
                }
            }
            const declaration = CSHARP_TYPED_BINDING.exec (line);
            if (declaration && !CSHARP_NON_TYPES.has (declaration[1])) {
                declare (declaration[2], declaration[1]);
                writes.set (declaration[2], [ declaration[3].trim () ].concat (writes.get (declaration[2]) ?? []));
                continue;
            }
            const bare = CSHARP_BARE_DECLARATION.exec (line);
            if (bare && !CSHARP_NON_TYPES.has (bare[1])) {
                declare (bare[2], bare[1]);
                unsafe.add (bare[2]);
                continue;
            }
            const foreach = /\bforeach\s*\(\s*([A-Za-z_][\w.]*(?:<[^<>]*>)?)\s+([A-Za-z_]\w*)\s+in\b/.exec (line);
            if (foreach && !CSHARP_NON_TYPES.has (foreach[1])) {
                declare (foreach[2], foreach[1]);
                continue;
            }
            const assignment = /^\s*([A-Za-z_]\w*)\s*=(?!=)(.*)$/.exec (line);
            if (assignment && declTypes.has (assignment[1])) {
                writes.set (assignment[1], [].concat (writes.get (assignment[1]) ?? [], [ assignment[2].trim () ]));
            }
        }
        const lists = new Map<string, string> ();
        for (const [ name, types ] of declTypes) {
            if (types.size === 1) {
                const type = types.values ().next ().value as string;
                if (CSHARP_LIST_TYPE_RECEIVER.test (type)) {
                    lists.set (name, type);
                }
            }
        }
        const nonNull = new Set<string> ();
        for (let round = 0; round < 4; round++) {
            let changed = false;
            for (const name of lists.keys ()) {
                if (nonNull.has (name) || unsafe.has (name)) {
                    continue;
                }
                const list = writes.get (name);
                if ((list === undefined) || (list.length === 0)) {
                    continue;
                }
                if (list.every ((rhs) => this.csharpListWriteIsNonNull (rhs, nonNull))) {
                    nonNull.add (name);
                    changed = true;
                }
            }
            if (!changed) {
                break;
            }
        }
        return { lists, nonNull };
    }

    // non-null producers for a list receiver: `new …`, a Linq `.ToList()`, and the safe* helpers —
    // which return `defaultValue` whenever the key misses, so a non-null *list* default proves it
    csharpListWriteIsNonNull (rhs: string, nonNull: Set<string>, depth = 0): boolean {
        if (depth > 4) {
            return false;
        }
        const text = rhs.replace (/;\s*$/, '').trim ();
        if (text.startsWith ('new ')) {
            return true;
        }
        if (/\.ToList(?:<[^<>]*>)?\(\)$/.test (text)) {
            return true;
        }
        const safe = /\bthis\.(?:safeList[2N]?|safeValue[2N]?)\s*\(/.exec (text);
        if (safe !== null) {
            const open = text.indexOf ('(', safe.index);
            const close = csharpMatchingClose (text, open, '([{', ')]}');
            if (close < 0) {
                return false;
            }
            const args = this.splitCsharpParams (text.substring (open + 1, close));
            if (args.length < 3) {
                return false; // no default: the helper hands back null
            }
            const fallback = args[args.length - 1].trim ();
            if (!fallback.startsWith ('new List')) {
                return false; // `defaultValue as List<object>` is null for a non-list default
            }
            return this.csharpListWriteIsNonNull (fallback, nonNull, depth + 1);
        }
        if (/^[A-Za-z_]\w*$/.test (text)) {
            return nonNull.has (text);
        }
        return false;
    }

    csharpNativeListCalls (region: string, lists: Map<string, string>, nonNull: Set<string>): string {
        const masked = this.maskCsharpLiterals (region);
        let out = '';
        let cursor = 0;
        let match: RegExpExecArray | null;
        CSHARP_LIST_RECEIVER_CALL.lastIndex = 0;
        while ((match = CSHARP_LIST_RECEIVER_CALL.exec (region)) !== null) {
            const at = match.index;
            if (masked[at] !== region[at]) {
                continue; // inside a literal or a comment
            }
            if ((at > 0) && /[\w.]/.test (region[at - 1])) {
                continue; // tail of a longer name
            }
            const name = match[1] ?? match[2];
            if (!lists.has (name)) {
                continue;
            }
            out += region.substring (cursor, at);
            const replacement = (match[1] !== undefined)
                ? (nonNull.has (name) ? name + '.Count' : name + '?.Count ?? 0')
                : name + '.' + match[3] + '()';
            // `??` binds looser than every binary operator, so an operand position needs the
            // grouping: `((getArrayLength (symbols) == 1))` -> `((symbols?.Count ?? 0) == 1)`
            // (unparenthesised it is `symbols?.Count ?? (0 == 1)`, CS0019). Every other emitted
            // site ends at `;`, `,` or `)` -- census: 424 sites, 0 with an operator after.
            const following = region.substring (at + match[0].length).replace (/^\s+/, '').charAt (0);
            // the same grouping when the operator PRECEDES the call: `i < symbols?.Count ?? 0`
            // parses as `(i < symbols?.Count) ?? 0` (CS0019 bool ?? int) once the comparison
            // itself prints natively
            const before = region.substring (0, at).replace (/\s+$/, '');
            // a plain assignment `x = getArrayLength (y);` is not an operand position
            const preceding = /(?:^|[^=<>!])=$/.test (before) ? '' : before.slice (-1);
            const operand = (following !== '' && '=<>!&|+-*/%^?:'.indexOf (following) !== -1)
                || (preceding !== '' && '=<>!&|+-*/%^?:'.indexOf (preceding) !== -1);
            out += (operand && replacement.includes ('??')) ? '(' + replacement + ')' : replacement;
            cursor = at + match[0].length;
        }
        if (cursor === 0) {
            return region;
        }
        out += region.substring (cursor);
        return out;
    }

    // drop the identity `((IList<object>)x)` cast for a receiver the enclosing method declares
    // List<object>/IList<object> (csharpTypedListReceivers) or a destructuring holder whose `var` is
    // inferred from a list producer (csharpTempHolderListTypes). The emitted value never changes.
    csharpIdentityListCasts (region: string, lists: Map<string, string>, temps: Map<string, string>): string {
        const names = new Map<string, string> (temps);
        for (const [ name, type ] of lists) {
            if (!names.has (name)) {
                names.set (name, type);
            }
        }
        if (names.size === 0) {
            return region;
        }
        // a match that is the tail of a longer name stays
        region = this.csharpReplaceUnmasked (region, CSHARP_IDENTITY_LIST_CAST, (match, at) => (((at > 0) && /[\w.]/.test (region[at - 1])) || !names.has (match[1])) ? undefined : match[1] + match[2]);
        // toArray returns every IList<object> (ws caches are List<object>) as the same reference and null as null:
        // on a name this method declares only IList<object> the call is an identity of the same static type
        // a `return` widens too when the method itself is declared to return object / IList<object>
        const widensReturn = /^\s*(?:public|protected|private|internal)\b[^(]*?\b(?:object|IList<object>|Task<object>|Task<IList<object>>)\s+[A-Za-z_]\w*\s*\(/.test (region);
        return this.csharpReplaceUnmasked (region, /\bthis\.toArray\(([A-Za-z_]\w*)\)/g, (match, at) => (((at > 0) && /[\w.]/.test (region[at - 1])) || !((lists.get (match[1]) === 'IList<object>') || ((lists.get (match[1]) === 'List<object>') && (this.csharpListWideningSlot (region.substring (Math.max (0, at - 120), at), lists) || (widensReturn && /\breturn\s+$/.test (region.substring (Math.max (0, at - 20), at))))))) ? undefined : match[1]);
    }

    // a slot that takes List<object> exactly as it takes IList<object>: an IList<object> declaration or
    // assignment to such a local, or the first argument of a single-signature base method with an
    // IList<object>/object parameter there (no overload can pick a different body)
    csharpListWideningSlot (before: string, lists: Map<string, string>): boolean {
        if (/\bIList<object>\s+\w+\s*=\s*$/.test (before)) {
            return true;
        }
        const assigned = /(?:^|[;{}]\s*|\n\s*)([A-Za-z_]\w*)\s*=\s*$/.exec (before);
        if (assigned) {
            return lists.get (assigned[1]) === 'IList<object>';
        }
        return /(?:\bthis\.(?:parseOHLCVs|parseLeverages|parseLiquidations|parseMarginModes|parseMarginModifications|parseOptionChain|parsePredictionOrders|arrayConcat)|\bccxt\.BaseExchange\.(?:ToTransactionList|ToDepositAddressList))\($/.test (before) || /\bthis\.arrayConcat\([A-Za-z_]\w*,\s*$/.test (before);
    }

    // `((IList<object>)(x as ccxt.pro.OrderBook).cache).Add(v)` — `cache` is declared
    // `IList<object>` on the hand-written ws cache (cs/ccxt/ws/OrderBook.cs), so the cast
    // (and the printer's doubly-cast spelling of it) is an identity conversion on the member read.
    csharpOrderbookCacheCasts (content: string): string {
        return this.csharpReplaceUnmasked (content, CSHARP_ORDERBOOK_CACHE_CAST, (match) => '(' + match[1] + ' as ccxt.pro.OrderBook).cache.Add(');
    }

    // `this.toArray(p)` where p is a call declared to return List<object>/IList<object> (base methods
    // below, or toArray itself): toArray hands any IList<object> back as the same reference and null as
    // null, so only the call p remains; skipped where `var` would pick up the narrower static type
    csharpListResultToArray (content: string): string {
        const masked = this.maskCsharpLiterals (content);
        const re = /\bthis\.toArray\(this\.(toArray|sortBy|sortBy2|safeList|getListFromObjectValues|parseOrderBookBidAsk|arrayConcat)\(/g;
        let out = '';
        let cursor = 0;
        let match: RegExpExecArray | null;
        while ((match = re.exec (masked)) !== null) {
            const at = match.index;
            if ((at > 0) && /[\w.]/.test (masked[at - 1])) {
                continue;
            }
            const innerOpen = at + match[0].length - 1;
            const innerClose = csharpMatchingClose (masked, innerOpen);
            if ((innerClose < 0) || (masked[innerClose + 1] !== ')') || /\bvar\s+\w+\s*=\s*$/.test (masked.substring (Math.max (0, at - 80), at))) {
                continue;
            }
            out += content.substring (cursor, at) + content.substring (at + 'this.toArray('.length, innerClose + 1);
            cursor = innerClose + 2;
            re.lastIndex = cursor;
        }
        return (cursor === 0) ? content : out + content.substring (cursor);
    }

    // replace each match of the global `re` outside literals and comments by `replace` (undefined keeps it);
    // `text` itself when nothing was replaced
    csharpReplaceUnmasked (text: string, re: RegExp, replace: (match: RegExpExecArray, at: number) => string | undefined): string {
        const masked = this.maskCsharpLiterals (text);
        let out = '';
        let cursor = 0;
        let match: RegExpExecArray | null;
        re.lastIndex = 0;
        while ((match = re.exec (text)) !== null) {
            const at = match.index;
            const next = (masked[at] === text[at]) ? replace (match, at) : undefined;
            if (next !== undefined) {
                out += text.substring (cursor, at) + next;
                cursor = at + match[0].length;
            }
        }
        return (cursor === 0) ? text : out + text.substring (cursor);
    }

    // the static C# type of a destructuring holder (`var <name> = <initializer>`) — the return
    // type the same file declares for `this.<method>` (the awaited `Task<T>` result under `await`),
    // or a `new List<object>` / `.ToList<object>()` producer. Anything else keeps the cast.
    csharpTempHolderListType (initializer: string, returns: Map<string, string>): string | undefined {
        let text = initializer.trim ().replace (/;\s*$/, '').trim ();
        const awaited = text.startsWith ('await ');
        if (awaited) {
            text = text.slice (6).trim ();
        }
        const call = /^this\.([A-Za-z_]\w*)\s*\(/.exec (text);
        if (call !== null) {
            const declared = returns.get (call[1]);
            if (declared === undefined) {
                return undefined;
            }
            const task = /^Task<(.+)>$/.exec (declared.trim ());
            const type = !awaited ? declared : (task === null) ? undefined : task[1].trim ();
            return ((type === 'List<object>') || (type === 'IList<object>')) ? type : undefined;
        }
        if (awaited) {
            return undefined;
        }
        if (/^new List<object>\s*[({]/.test (text) || /\.ToList<object>\(\)$/.test (text)) {
            return 'List<object>';
        }
        return undefined;
    }

    // the destructuring holders of one method region whose static type is a list. A name the
    // region declares with two different producers answers nothing — exactly one proof is required.
    csharpTempHolderListTypes (maskedLines: string[], returns: Map<string, string>): Map<string, string> {
        const types = new Map<string, Set<string>> ();
        for (const line of maskedLines) {
            const m = /^\s*var\s+([A-Za-z_]\w*)\s*=\s*(.*)$/.exec (line);
            if (m === null) {
                continue;
            }
            const type = this.csharpTempHolderListType (m[2], returns);
            let seen = types.get (m[1]);
            if (seen === undefined) {
                seen = new Set<string> ();
                types.set (m[1], seen);
            }
            seen.add (type ?? '?');
        }
        const out = new Map<string, string> ();
        for (const [ name, seen ] of types) {
            if (seen.size === 1) {
                const type = seen.values ().next ().value as string;
                if ((type === 'List<object>') || (type === 'IList<object>')) {
                    out.set (name, type);
                }
            }
        }
        return out;
    }

    // method name -> declared return type, from the emitted signatures of ONE file
    csharpFileReturnTypes (maskedLines: string[]): Map<string, string> {
        const found = new Map<string, string> ();
        for (const line of maskedLines) {
            if (!CSHARP_MEMBER_SIGNATURE.test (line) || (line.indexOf ('(') < 0)) {
                continue;
            }
            const m = /^\s*(?:public|private|protected|internal)\s+(?:(?:static|virtual|async|override|new|sealed|partial)\s+)*([A-Za-z_][\w<>,?.\[\]]*)\s+([A-Za-z_]\w*)\s*\(/.exec (line);
            if (m === null) {
                continue;
            }
            found.set (m[2], m[1]);
        }
        return found;
    }

    // top-level comma split of an emitted argument list, with each argument kept as its
    // own trimmed text so a call site can be rewritten argument-by-argument (unlike
    // splitCsharpParams, which returns the arguments only).
    wsArgSpans (content: string, from: number, to: number): { start: number, text: string }[] {
        const out: { start: number, text: string }[] = [];
        let depth = 0;
        let start = from;
        let i = from;
        const push = (end: number) => {
            out.push ({ start: start - from, text: content.substring (start, end) });
        };
        while (i < to) {
            const ch = content[i];
            if (ch === '"' || ch === '\'') {
                const quote = ch;
                i += 1;
                while (i < to) {
                    if (content[i] === '\\') {
                        i += 2;
                        continue;
                    }
                    if (content[i] === quote) {
                        break;
                    }
                    i += 1;
                }
            } else if (ch === '(' || ch === '[' || ch === '{') {
                depth += 1;
            } else if (ch === ')' || ch === ']' || ch === '}') {
                depth -= 1;
            } else if (ch === ',' && depth === 0) {
                push (i);
                start = i + 1;
            }
            i += 1;
        }
        push (to);
        return out;
    }

    // see WS_HANDLER_DICT_MESSAGE / WS_HANDLER_IDICT_MESSAGE. Retypes this venue's admitted ws handler
    // parameters. The concrete spelling wraps the arguments the retype leaves statically `object`; the
    // interface spelling edits no call site (every direct call must already pass a dict-typed value).
    // Self-gating: a handler with a call site the pass cannot name or clear stays `object` whole.
    retypeWsHandlerMessages (content: string, iface = false): string {
        const venueMatch = /public partial class (\w+)\s*:/.exec (content);
        if (venueMatch === null) {
            return content;
        }
        const names = (iface ? WS_HANDLER_IDICT_MESSAGE : WS_HANDLER_DICT_MESSAGE)[venueMatch[1]];
        if (names === undefined) {
            return content;
        }
        const membership = new Set (names);
        const sigs = [ ...content.matchAll (/^ {4}(?:public|protected|private|internal)[^\n]*?\b(\w+)\s*\(([^()]*)\)\s*$/gm) ];
        // the signature of the method enclosing `at`, and where the next one starts
        const enclosing = (at: number) => {
            const next = sigs.findIndex ((sig) => sig.index >= at);
            const sig = sigs[((next === -1) ? sigs.length : next) - 1];
            return { name: (sig === undefined) ? '' : sig[1], start: (sig === undefined) ? 0 : sig.index, end: (next === -1) ? content.length : sigs[next].index };
        };
        // does the method enclosing `at` declare `name` with a dict type?  (a local, a parameter,
        // or a value an earlier pass already asserted to the concrete spelling)
        const dictTypedInMethod = (at: number, name: string) => {
            const { start, end } = enclosing (at);
            for (const line of content.substring (start, end).split ('\n')) {
                const trimmed = line.trim ();
                if (trimmed.startsWith ('//') || trimmed.startsWith ('*')) {
                    continue;
                }
                if (new RegExp ('(?:Dictionary<string, object>|IDictionary<string, object>)\\s+' + name + '\\b').test (line)) {
                    return true;
                }
            }
            return false;
        };
        const declarations = [ ...content.matchAll (/^(\s*)(public|protected)((?:\s+(?:static|virtual|override|async|partial))*)\s+(?:[\w<>?,\[\] .]+?)\s+(\w+)\s*\(\s*WebSocketClient\s+client\s*,\s*object\s+([A-Za-z_]\w*)/gm) ]
            .filter ((decl) => membership.has (decl[4])).map ((decl) => ({ index: decl.index, text: decl[0], param: decl[5] }));
        const edits: { start: number, end: number, text: string }[] = [];
        for (const declaration of declarations) {
            const name = declaration.text.match (/handle\w+/)![0];
            const needle = 'object ' + declaration.param;
            const rel = declaration.text.lastIndexOf (needle);
            if (rel === -1) {
                continue;
            }
            const declLineStart = content.lastIndexOf ('\n', declaration.index) + 1;
            const callRe = /(?<![\w.])(?:this\.|base\.)?(\w+)\s*\(/g;
            const sites: { start: number, end: number, arg: string, pad: string, chain: boolean }[] = [];
            let clear = true;
            let call;
            while ((call = callRe.exec (content)) !== null) {
                if (call[1] !== name) {
                    continue;
                }
                const open = call.index + call[0].length - 1;
                const close = csharpMatchingClose (content, open, '(', ')', '"');
                if (close === -1) {
                    if (iface) {
                        clear = false;
                        break;
                    }
                    continue;
                }
                const lineStart = content.lastIndexOf ('\n', call.index) + 1;
                const trimmed = content.substring (lineStart, content.indexOf ('\n', call.index)).trim ();
                if (trimmed.startsWith ('//') || trimmed.startsWith ('*') || lineStart === declLineStart) {
                    continue;
                }
                const spans = this.wsArgSpans (content, open + 1, close);
                if (spans.length < 2) {
                    if (iface) {
                        clear = false;
                        break;
                    }
                    continue;
                }
                const arg = spans[1].text.trim ();
                const chain = membership.has (enclosing (call.index).name);
                if (iface && (!/^[A-Za-z_]\w*$/.test (arg) || (!chain && !dictTypedInMethod (call.index, arg)))) {
                    clear = false;
                    break;
                }
                const offset = open + 1 + spans[1].start;
                const raw = spans[1].text;
                const pad = raw.substring (0, raw.length - raw.trimStart ().length);
                sites.push ({ start: offset, end: offset + raw.length, arg, pad, chain });
            }
            if (!clear || sites.some (site => !site.chain && !/^[A-Za-z_]\w*$/.test (site.arg))) {
                continue;
            }
            edits.push ({ start: declaration.index + rel, end: declaration.index + rel + needle.length, text: (iface ? 'IDictionary' : 'Dictionary') + '<string, object> ' + declaration.param });
            for (const site of sites) {
                if (!iface && !site.chain) {
                    edits.push ({ start: site.start, end: site.end, text: site.pad + '(Dictionary<string, object>)' + site.arg });
                }
            }
        }
        edits.sort ((a, b) => b.start - a.start);
        for (const edit of edits) {
            content = content.substring (0, edit.start) + edit.text + content.substring (edit.end);
        }
        return content;
    }

    // top-level comma split of a C# parameter/argument list
    splitCsharpParams (plist: string): string[] {
        const out: string[] = [];
        let depth = 0;
        let cur = '';
        for (let i = 0; i < plist.length; i++) {
            const ch = plist[i];
            if (ch === '"' || ch === '\'') {
                const quote = ch;
                let j = i + 1;
                while (j < plist.length) {
                    if (plist[j] === '\\') { j += 2; continue; }
                    if (plist[j] === quote) { j++; break; }
                    j++;
                }
                cur += plist.substring (i, j);
                i = j - 1;
                continue;
            }
            if (ch === '<' || ch === '(' || ch === '[' || ch === '{') {
                depth++;
            } else if (ch === '>' || ch === ')' || ch === ']' || ch === '}') {
                depth--;
            }
            if (ch === ',' && depth === 0) {
                out.push (cur);
                cur = '';
            } else {
                cur += ch;
            }
        }
        if (cur !== '') {
            out.push (cur);
        }
        return out;
    }

    // drop redundant `((object)…)` boxes: `((object)X).ToString()` -> `X.ToString()` and `object N = ((object)X);`
    // -> `object N = X;`. The box only matters for a nullable value type (null box vs ""), so it goes only where
    // X's static type is provable from this file; `var`, nullable, lambda-parameter or unknown names keep it.
    dropRedundantObjectBoxCasts (content: string): string {
        const valueNullable = new Set<string> ([ 'Int64?', 'int?', 'Int32?', 'long?', 'double?', 'bool?',
            'float?', 'decimal?', 'byte?', 'sbyte?', 'short?', 'ushort?', 'uint?', 'UInt32?', 'UInt64?', 'char?' ]);
        const scalars = new Set<string> ([ 'var', 'string', 'string?', 'object', 'bool', 'bool?', 'double',
            'double?', 'int', 'int?', 'long', 'long?', 'decimal', 'float', 'Int64', 'Int64?', 'char', 'byte',
            'byte[]', 'uint', 'Int32', 'Int32?' ]);
        const keywords = new Set<string> ([ 'return', 'throw', 'await', 'new', 'else', 'if', 'while', 'switch',
            'case', 'using', 'yield', 'is', 'as', 'out', 'ref', 'not', 'in', 'do', 'try', 'catch', 'for',
            'foreach', 'lock', 'get', 'set', 'typeof', 'default', 'var' ]);
        // venue files derive from Exchange : BaseExchange, so these inherited signatures decide the
        // receiver type where the venue does not declare the name itself
        const baseReturnTypes: { [name: string]: string } = {
            'nonce': 'Int64',           // cs/ccxt/base/Exchange.BaseMethods.cs:4203 public virtual Int64 nonce ()
            'milliseconds': 'Int64',    // cs/ccxt/base/Exchange.Time.cs:6 public Int64 milliseconds ()
            'seconds': 'Int64',         // cs/ccxt/base/Exchange.cs:529 public Int64 seconds ()
            'microseconds': 'long',     // cs/ccxt/base/Exchange.Time.cs:41 public long microseconds ()
            'randNumber': 'int',        // cs/ccxt/base/Exchange.cs:490 public int randNumber (int size)
            'getValue': 'object',       // TranspileHelpers: object getValue (object, object)
            'sum': 'object',            // TranspileHelpers: object sum (object)
        };
        const methodDecl = /^\s*(?:public|protected|private|internal)\s+(?:static\s+|virtual\s+|override\s+|async\s+|new\s+|sealed\s+)*([\w<>,?\[\]. ]+?)\s+(\w+)\s*\(/;
        const localDecl = /^\s+([\w<>,?\[\].]+(?:<[^>]*>)?)\s+(\w+)\s*=\s*[^=]/;
        const varDecl = /^\s+(var)\s+(\w+)\s*=\s*[^=]/;
        const forDecl = /for\s*\(\s*([\w<>,?\[\].]+)\s+(\w+)\s*=/;
        const spaceSplit = /\s+/;
        const methodTypes = new Map<string, Set<string>> ();
        const unparsedNames = new Set<string> ();
        const addType = (map: Map<string, Set<string>>, name: string, type: string) => {
            const set = map.get (name) ?? new Set<string> ();
            set.add (type);
            map.set (name, set);
        };
        const safeType = (types: Set<string> | undefined): string | undefined => {
            if (types === undefined || Array.from (types).some ((type) => type === 'var' || valueNullable.has (type))) {
                return undefined;
            }
            return Array.from (types)[0];
        };
        const paramTypes = (plist: string): string[][] => this.splitCsharpParams (plist)
            .map ((param: string) => param.split ('=')[0].trim ().split (spaceSplit).filter ((p: string) => p !== ''))
            .filter ((parts: string[]) => parts.length >= 2);
        // ---- type knowledge: one pass over the file, no cross-file inference
        const lines = content.split ('\n');
        interface BoxScope { params: Map<string, Set<string>>, locals: Map<string, Set<string>> }
        const scopes: (BoxScope | undefined)[] = new Array (lines.length).fill (undefined);
        let scope: BoxScope | undefined = undefined;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const indent = line.length - line.trimStart ().length;
            const method = methodDecl.exec (line);
            if (method !== null) {
                const open = line.indexOf ('(');
                addType (methodTypes, method[2], method[1].trim ());
                scope = { params: new Map<string, Set<string>> (), locals: new Map<string, Set<string>> () };
                if (open >= 0) {
                    const close = csharpMatchingClose (line, open, '(', ')', '"');
                    if (close > open) {
                        for (const parts of paramTypes (line.substring (open + 1, close))) {
                            const type = parts.slice (0, parts.length - 1).join (' ')
                                .replace (/^(?:ref|out|params|this)\s+/, '');
                            addType (scope.params, parts[parts.length - 1], type);
                        }
                    }
                }
                scopes[i] = scope;
            } else if (indent <= 4) {
                const trimmed = line.trim ();
                if (trimmed !== '' && '{})]'.indexOf (trimmed[0]) < 0
                        && !trimmed.startsWith ('//') && !trimmed.startsWith ('#')) {
                    scope = undefined;
                }
            }
            if (scope !== undefined && method === null) {
                scopes[i] = scope;
                for (const decl of [ localDecl, varDecl, forDecl ]) {
                    const match = decl.exec (line);
                    if (match !== null) {
                        addType (scope.locals, match[2], match[1]);
                    }
                }
            }
            // comment text ("* @param {string} tag ... payment id") is not code: it must neither
            // declare a type for the audit nor poison a name
            const codeOnly = line.trimStart ();
            const skipLine = codeOnly.startsWith ('*') || codeOnly.startsWith ('//') || codeOnly.startsWith ('/*');
            if (skipLine) {
                continue;
            }
            for (const [ , kind, name ] of line.matchAll (/(?:^|\s)(\([^()]*\)|[A-Za-z_][\w<>?\[\].]*)\s+(\w+)\s*(?:=|;|\)|,)/g)) {
                if (!keywords.has (name) && !keywords.has (kind)) {
                    if (!scalars.has (kind) && !/^[A-Z][\w<>,?\[\]]*$/.test (kind)) {
                        unparsedNames.add (name);
                    } else if (scope !== undefined && method === null) {
                        addType (scope.locals, name, kind);
                    }
                }
            }
        }
        // lambda parameters shadow any same-named local: their type is not proven
        const lambdaNames = new Set<string> ();
        for (const line of lines) {
            const codeOnly = line.trimStart ();
            if (codeOnly.startsWith ('*') || codeOnly.startsWith ('//') || codeOnly.startsWith ('/*')) {
                continue;
            }
            for (const lambda of line.matchAll (/\(([^()]*)\)\s*=>/g)) {
                for (const parts of paramTypes (lambda[1])) {
                    lambdaNames.add (parts[parts.length - 1]);
                }
            }
            for (const lambda of line.matchAll (/(?:^|[^\w>.,])(\w+)\s*=>/g)) {
                lambdaNames.add (lambda[1]);
            }
        }
        // ---- receiver -> static type, or undefined when the file cannot prove it
        const receiverType = (operand: string, lineScope: BoxScope | undefined): string | undefined => {
            const scopeHas = (name: string): Set<string> | undefined => {
                if (lineScope === undefined) {
                    return undefined;
                }
                const params = lineScope.params.get (name);
                const locals = lineScope.locals.get (name);
                if (params === undefined && locals === undefined) {
                    return undefined;
                }
                return new Set<string> ([ ...(params ?? []), ...(locals ?? []) ]);
            };
            let text = operand.trim ();
            while (text.startsWith ('(') && csharpMatchingClose (text, 0, '(', ')', '"') === text.length - 1) {
                text = text.substring (1, text.length - 1).trim ();
            }
            const memberCall = /^(?:this|base)\.(\w+)\s*\(/.exec (text);
            if (memberCall !== null) {
                const own = methodTypes.get (memberCall[1]);
                return own !== undefined ? safeType (own) : baseReturnTypes[memberCall[1]];
            }
            const identifier = /^([\w.]+)$/.exec (text);
            if (identifier !== null) {
                const name = identifier[1].split ('.').pop () as string;
                return (lambdaNames.has (name) || unparsedNames.has (name)) ? undefined : safeType (scopeHas (name));
            }
            return undefined;
        };
        // ---- rewrite
        const output = lines.map ((line: string, index: number) => {
            const declaration = /^(\s*object\s+[A-Za-z_]\w*\s*=\s*)\(\(object\)/.exec (line);
            if (declaration !== null) {
                const open = declaration[1].length;
                const close = csharpMatchingClose (line, open, '(', ')', '"');
                if (close > 0 && line.substring (close + 1).trim () === ';') {
                    return declaration[1] + line.substring (open + 9, close) + ';';
                }
            }
            const sites = this.objectBoxSites (line);
            let out = line;
            for (let k = sites.length - 1; k >= 0; k--) {
                const at = sites[k];
                const close = csharpMatchingClose (out, at, '(', ')', '"');
                if (close < 0) {
                    continue;
                }
                const before = out.substring (0, at);
                const operand = out.substring (at + 9, close);
                const after = out.substring (close + 1);
                if (/\(\([\w<>,?\[\]. ]+\)$/.test (before) || !after.startsWith ('.ToString()')) {
                    continue;
                }
                if (receiverType (operand, scopes[index]) !== undefined) {
                    out = before + operand + after;
                }
            }
            return out;
        });
        return output.join ('\n');
    }

    // positions of `((object)` in one line, skipping string/char literals and line comments
    objectBoxSites (line: string): number[] {
        const sites: number[] = [];
        for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (ch === '"' || ch === '\'') {
                i++;
                while (i < line.length) {
                    if (line[i] === '\\') {
                        i += 2;
                        continue;
                    }
                    if (line[i] === ch) {
                        break;
                    }
                    i++;
                }
                continue;
            }
            if (ch === '/' && line[i + 1] === '/') {
                return sites;
            }
            if (ch === '(' && line.startsWith ('((object)', i)) {
                sites.push (i);
            }
        }
        return sites;
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

    createClassAliasFile (ids: string[], path: string, namespace: string) {
        // one file per tier holding every `class Binance : binance` alias, so the
        // generator never recreates a per-exchange wrapper directory
        if (!ids.length) {
            if (fs.existsSync (path)) {
                fs.unlinkSync (path);
                log.magenta ('×', (path as any).yellow)
            }
            return;
        }
        const header = this.createGeneratedHeader().join('\n');
        const classes = [ '// class wrappers' ];
        ids.forEach ((exchange: string) => {
            const capitalized = exchange.charAt(0).toUpperCase() + exchange.slice(1);
            const constructor = `public ${capitalized}(object args = null) : base(args) { }`;
            classes.push (`public class  ${capitalized}: ${exchange} { ${constructor} }`);
        });
        const file = [ namespace, '', header, classes.join('\n') ].join('\n') + '\n';
        log.magenta ('→', (path as any).yellow)
        overwriteFileAndFolder (path, file);
    }

    createCSharpWrappers(exchange:string, path: string, wrappers: any[], ws = false, prediction = false) {
        // Method wrappers have been retired: the PascalCase core is the public C# API.
        // This emitter now only writes the documented `class Binance : binance` aliases,
        // consolidated into one file per tier (createClassAliasFile). Any per-exchange
        // wrapper file that would be an empty partial class is deleted instead.
        const namespace = this.getNamespace (ws);
        const header = this.createGeneratedHeader().join('\n');
        if (exchange === 'BaseExchange') {
            const classes = this.createExchangesWrappers().filter(e => !!e).join('\n');
            const file = [ namespace, '', header, classes ].join('\n') + '\n';
            log.magenta ('→', (path as any).yellow)
            overwriteFileAndFolder (path, file);
            return;
        }
        if (fs.existsSync (path)) {
            fs.unlinkSync (path);
            log.magenta ('×', (path as any).yellow)
        }
    }

    transpileErrorHierarchy (force = true) {

        const errorHierarchyFilename = './js/src/base/errorHierarchy.js'

        if (skipUpToDateStage ('csharp', 'error hierarchy', force, [ errorHierarchyFilename ], [ ERRORS_FILE ])) {
            return;
        }

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

        const csharpErrors = intellisense (root as any, 'BaseError', csharpMakeErrorClassFile, undefined)
        const csharpBodyIntellisense = '\nnamespace ccxt;\n' + this.createGeneratedHeader().join('\n') + '\n' + csharpBaseError + '\n' + csharpErrors.join ('\n') + '\n'
        if (fs.existsSync (ERRORS_FILE)) {
            log.bright.cyan (message, (ERRORS_FILE as any).yellow)
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
        const found = findCSharpMethodSpan (body, name);
        if (!found) {
            return { 'body': body, 'method': '' };
        }
        return { 'body': body.substring (0, found.start) + body.substring (found.end), 'method': found.method };
    }

    // retype the generated safeDict/safeList family in Exchange.BaseMethods.cs (see
    // SAFE_COLLECTION_HELPER_TYPES for why the printer cannot do it from the TS annotations).
    // The found value is proven by the method's own guard, so it goes through an explicit
    // cast; the fallback hands the caller's default back with `as` (drop to null when it is
    // not the declared collection, the SafeString convention). Throws if a method is
    // missing, its signature moved, or any return survived without the rewrite.
    retypeSafeCollectionHelpers (baseMethods: string): string {
        for (const [ name, csharpType ] of Object.entries (SAFE_COLLECTION_HELPER_TYPES)) {
            const found = findCSharpMethodSpan (baseMethods, name);
            if (!found) {
                throw new Error (`[csharp] retypeSafeCollectionHelpers: ${name} not found in the generated base methods`);
            }
            const signature = 'public virtual object ' + name + '(';
            if (!found.method.includes (signature)) {
                throw new Error (`[csharp] retypeSafeCollectionHelpers: ${name} does not carry the expected \`${signature}\` signature`);
            }
            let rewritten = found.method.replace (signature, 'public virtual ' + csharpType + ' ' + name + '(');
            for (const returned of [ 'value', 'value2' ]) {
                rewritten = rewritten.replaceAll ('return ' + returned + ';', 'return (' + csharpType + ')' + returned + ';');
            }
            rewritten = rewritten.replaceAll ('return defaultValue;', 'return defaultValue as ' + csharpType + ';');
            const returns = (found.method.match (/return\s/g) ?? []).length;
            const typedReturns = (rewritten.match (/return\s(?:\(|defaultValue as )/g) ?? []).length;
            const bareReturns = (rewritten.match (/return\s(?!(?:\(|defaultValue as ))/g) ?? []).length;
            if (returns === 0 || typedReturns !== returns || bareReturns !== 0) {
                throw new Error (`[csharp] retypeSafeCollectionHelpers: ${name} lost return statements in the rewrite (${returns} -> ${typedReturns} typed, ${bareReturns} bare)`);
            }
            baseMethods = baseMethods.substring (0, found.start) + rewritten + baseMethods.substring (found.end);
        }
        return baseMethods;
    }

    transpileBaseMethods(baseExchangeFile: string, force = true) {
        // the four generated base files all come out of this one pass; `exchanges.json`
        // is a real input too — createExchangesWrappers() emits one `public class <Id>`
        // per listed exchange into Exchange.Wrappers.cs, so adding an exchange must
        // invalidate this stage even when ts/src/base/Exchange.ts did not change
        if (skipUpToDateStage ('csharp', 'base methods', force, [
            baseExchangeFile,
            './ts/src/base/types.ts',
            './exchanges.json',
        ], [
            BASE_METHODS_FILE,
            BASE_TRADING_METHODS_FILE,
            GLOBAL_WRAPPER_FILE,
            GLOBAL_TRADING_WRAPPER_FILE,
        ])) {
            return;
        }
        const csharpExchangeBase = BASE_METHODS_FILE;
        const delimiter = 'METHODS BELOW THIS LINE ARE TRANSPILED FROM TYPESCRIPT'

        const strippedBaseFile = writeOverloadStrippedFile (baseExchangeFile);
        const baseFile: any = this.transpiler.transpileCSharpByPath(strippedBaseFile);
        removeOverloadStrippedFile (strippedBaseFile, baseExchangeFile);
        let baseClass = baseFile.content as any;

        // the 62 symbol-based trading methods declared in TS `class Exchange extends BaseExchange`
        const exchangeTierNames = this.getExchangeTierMethodNames (baseExchangeFile);
        // loadOrderBook is hand-written on partial class Exchange (WsBridge.cs); drop the
        // transpiled copy. fetchOrderBook / fetchRestOrderBookSafe stay on the Exchange tier
        // so the prediction sibling can type fetchOrderBook as PredictionOrderBook (CS0508
        // if either name is declared on shared BaseExchange).
        const droppedOnBase = [ 'loadOrderBook' ];
        const isExchangeTier = (methodName: string) => exchangeTierNames.has (methodName) && !droppedOnBase.includes (methodName);

        // create wrappers with specific types — base-tier wrappers stay on BaseExchange (inherited by
        // both Exchange and the sibling PredictionExchange); the trading-tier wrappers land on the
        // concrete Exchange tier so PredictionExchange does NOT inherit the crypto-typed wrappers
        const allWrapperTypes = baseFile.methodsTypes || [];
        const baseTierWrapperTypes = allWrapperTypes.filter ((w: any) => !isExchangeTier (w.name));
        const exchangeTierWrapperTypes = allWrapperTypes.filter ((w: any) => isExchangeTier (w.name));
        this.createCSharpWrappers('BaseExchange', GLOBAL_WRAPPER_FILE, baseTierWrapperTypes)
        this.createCSharpWrappers('Exchange', GLOBAL_TRADING_WRAPPER_FILE, exchangeTierWrapperTypes)

        // custom transformations needed for c#
        baseClass = baseClass.replace("((object)this).number = String;", "this.number = typeof(String);"); // tmp fix for c#
        baseClass = baseClass.replaceAll("client.resolve", "// client.resolve"); // tmp fix for c#
        baseClass = baseClass.replaceAll("((object)this).number = float;", "this.number = typeof(float);"); // tmp fix for c#
        baseClass = baseClass.replaceAll(/(\w+)(\.storeArray\(.+\))/gm, '($1 as ccxt.pro.IOrderBookSide)$2'); // tmp fix for c#
        
        // Fix setMarketsFromExchange parameter type — typed as BaseExchange so it lives on the base
        // tier (returning `this`) and accepts both Exchange and PredictionExchange source instances
        baseClass = baseClass.replaceAll(/public virtual object setMarketsFromExchange\(object sourceExchange\)/g, 'public virtual BaseExchange setMarketsFromExchange(BaseExchange sourceExchange)');
        // implodeHostname forwards implodeParams (object -> string in Exchange.Misc.cs), so its
        // generated `object` signature only erased the string it already returns; the local-typing
        // classifier (build/csharp-local-types.js) relies on the honest `string` here.
        baseClass = baseClass.replaceAll(/public virtual object implodeHostname\(object url\)/g, 'public virtual string implodeHostname(object url)');
        baseClass = baseClass.replace("throw new getValue(broad, broadKey)(((string)message));", "this.throwDynamicException(broad, broadKey, message);"); // tmp fix for c#
        baseClass = baseClass.replace("throw new getValue(exact, str)(((string)message));", "this.throwDynamicException(exact, str, message);"); // tmp fix for c#

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
            }
            const fileHeader = this.getCsharpImports(undefined).concat([
                this.createGeneratedHeader().join('\n'),
                "public partial class BaseExchange\n{\n\n"
            ]).join("\n");
            const file = fileHeader + this.baseTierPasses (this.retypeSafeCollectionHelpers (this.dropStringTimeframeCasts ((this.finalizeCoreArgTypes (((this.typeCollectionReturns (this.typeCores (this.typeSyncCores (baseMethods), false)))))))), 'BaseExchange') + "\n";
            fs.writeFileSync (csharpExchangeBase, csharpTupleReturns (file, csharpExchangeBase));
            log.green ('Transpiled base methods to', (csharpExchangeBase as any).yellow)
            if (exchangeClassMatch) {
                const tradingHeader = this.getCsharpImports(undefined).concat([
                    this.createGeneratedHeader().join('\n'),
                    "public partial class Exchange\n{\n\n"
                ]).join("\n");
                const tradingFile = tradingHeader + this.baseTierPasses (this.dropStringTimeframeCasts ((this.finalizeCoreArgTypes (((this.typeCollectionReturns (this.typeCores (this.typeSyncCores (exchangeBody), false))))))), 'Exchange') + "\n}\n";
                fs.writeFileSync (BASE_TRADING_METHODS_FILE, csharpTupleReturns (tradingFile, BASE_TRADING_METHODS_FILE));
                log.green ('Transpiled trading methods to', (BASE_TRADING_METHODS_FILE as any).yellow)
            }
        }
    }

    // the shared tail of the BaseExchange / Exchange tier passes
    baseTierPasses (content: string, venue: string): string {
        return nativeDeclaredHelperCalls (this.dropIdentityStringCasts (this.retypeIdentifierCopies (this.stripRedundantStringCasts (this.retypePrintedReceiverCasts (this.foldIdentityStringCasts (this.nativeListHelperCalls (this.retypeParseMarketParams ((this.typeVenueNumericArgs (this.typeVenueStringArgs (content, venue)))))))))));
    }

    transpilePredictionBaseMethods (predictionBaseFile = './ts/src/base/PredictionExchange.ts', force = true) {
        // PredictionExchange is the base class for prediction-market exchanges; it lives
        // in the ccxt namespace (like Exchange) and is transpiled the same way as the base
        const predictionBase = './cs/ccxt/base/PredictionExchange.cs';
        // PredictionExchange extends BaseExchange and returns prediction-typed wrappers,
        // so Exchange.ts and types.ts are inputs as well. Note a full run reaches this
        // twice (once from the recursive prediction pass, once from the main pass) —
        // the gate also makes the second call free.
        if (skipUpToDateStage ('csharp', 'prediction base methods', force, [
            predictionBaseFile,
            './ts/src/base/Exchange.ts',
            './ts/src/base/types.ts',
        ], [ predictionBase ])) {
            return;
        }
        const delimiter = 'METHODS BELOW THIS LINE ARE TRANSPILED FROM TYPESCRIPT'
        const baseFile: any = this.transpiler.transpileCSharpByPath(predictionBaseFile);
        let baseClass = baseFile.content as any;
        baseClass = baseClass.replaceAll(/(\w+)(\.storeArray\(.+\))/gm, '($1 as ccxt.pro.IOrderBookSide)$2');
        const jsDelimiter = '// ' + delimiter
        const parts = baseClass.split (jsDelimiter)
        if (parts.length > 1) {
            // fetchOrderBook lives on the Exchange / PredictionExchange siblings, not on
            // BaseExchange, so the prediction declaration is virtual (not override).
            const baseMethods = parts[1];
            const fields = [
                '    public PredictionExchange(object args = null) : base(args) {}',
                '',
                '    public IDictionary<string, object> outcomes { get; set; } = null;',
                '    public IDictionary<string, object> outcomes_by_id { get; set; } = null;',
                '    public IDictionary<string, object> events { get; set; } = null;',
                '    public IDictionary<string, object> events_by_slug { get; set; } = null;',
                '    public bool reloadingEvents { get; set; } = false;',
                '    public Task<object> eventsLoading { get; set; } = null;',
                '',
            ].join('\n')
            const fileHeader = this.getCsharpImports(undefined).concat([
                this.createGeneratedHeader().join('\n'),
                "public partial class PredictionExchange : BaseExchange\n{\n\n"
            ]).join("\n");
            // method wrappers retired: PascalCase cores on PredictionExchange are the public API
            const file = fileHeader + fields + nativeDeclaredHelperCalls (this.dropIdentityStringCasts (this.retypeIdentifierCopies (this.retypePrintedReceiverCasts (this.foldIdentityStringCasts (this.nativeListHelperCalls (this.retypeParseMarketParams (this.typeVenueNumericArgs (this.typeVenueStringArgs (this.dropStringTimeframeCasts ((this.finalizeCoreArgTypes (((this.typeCollectionReturns (this.typeCores (this.typeSyncCores (baseMethods), true))))))), 'PredictionExchange')))))))) + "\n");
            fs.writeFileSync (predictionBase, csharpTupleReturns (file, predictionBase));
            this._predictionBaseWritten = true;
            log.green ('Transpiled prediction base methods to', (predictionBase as any).yellow)
        }
    }

    async transpileWS(force = false, prediction = false) {
        // prediction WS methods now live in the REST prediction classes (no ts/src/prediction/pro)
        if (prediction && !fs.existsSync ('./ts/src/prediction/pro')) {
            return;
        }
        const tsFolder = prediction ? './ts/src/prediction/pro/' : './ts/src/pro/';

        let inputExchanges =  process.argv.slice (2).filter (x => !x.startsWith ('--'));
        const scopedRun = inputExchanges.length > 0;
        if (prediction && (!inputExchanges || !inputExchanges.length)) {
            inputExchanges = predictionWsIds;
        }
        const csharpFolder = prediction ? EXCHANGES_PREDICTION_WS_FOLDER : EXCHANGES_WS_FOLDER;
        const options = { csharpFolder, exchanges:inputExchanges }
        if (scopedRun) {
            force = true; // a scoped run (CI `transpileCsSingle -- --ws <exchange>`) always writes, same as the REST path
        }
        this.isPrediction = prediction
        await this.transpileDerivedExchangeFiles (tsFolder, options, '.ts', force, true )
        this.isPrediction = false
    }

    async transpileEverything (force = false, baseOnly = false, examplesOnly = false, prediction = false) {

        let exchanges = process.argv.slice (2).filter (x => !x.startsWith ('--'))
        const csharpFolder = prediction ? EXCHANGES_PREDICTION_FOLDER : EXCHANGES_FOLDER
            , tsFolder = prediction ? './ts/src/prediction/' : './ts/src/'
            , exchangeBase = './ts/src/base/Exchange.ts'

        createFolderRecursively (csharpFolder)
        const transpilingSingleExchange = (exchanges.length === 1); // when transpiling single exchange, we can skip some steps because this is only used for testing/debugging
        if (transpilingSingleExchange) {
            force = true; // when transpiling single exchange, we always force
        }
        if (prediction) {
            // a scoped run (e.g. `csharpTranspiler.ts binance`) carries regular ids in argv —
            // the prediction pass must not try to transpile those from ts/src/prediction/
            // (the files don't exist there)
            const predictionOnly = exchanges.filter ((x: string) => predictionIds.includes (x))
            if (exchanges.length && !predictionOnly.length) {
                return;
            }
            exchanges = predictionOnly.length ? predictionOnly : predictionIds;
        }
        const options = { csharpFolder, exchanges }

        if (!baseOnly && !examplesOnly) {
            this.isPrediction = prediction
            await this.transpileDerivedExchangeFiles (tsFolder, options, '.ts', force)
            this.isPrediction = false
        }

        if (prediction) {
            // the venues override methods declared in the prediction base — regenerate it
            // in the same pass so a scoped prediction run can't leave the base stale
            this.transpilePredictionBaseMethods (undefined, force)
            log.bright.green ('Transpiled prediction exchanges successfully.')
            return;
        }

        if (examplesOnly) {
            return;
        }

        if (transpilingSingleExchange) {
            return;
        }

        // full builds also transpile the prediction-market exchanges (ts/src/prediction/)
        await this.transpileEverything (force, false, false, true)

        this.transpileBaseMethods (exchangeBase, force)

        // the recursive prediction pass above already regenerated PredictionExchange.cs from
        // the same inputs, so this second call would re-transpile and rewrite identical bytes
        if (!this._predictionBaseWritten) {
            this.transpilePredictionBaseMethods (undefined, force)
        }

        if (baseOnly) {
            return;
        }

        await this.transpileTests(force)

        this.transpileErrorHierarchy (force)

        log.bright.green ('Transpiled successfully.')
    }

    async webworkerTranspile (allFiles: any[], parserConfig: any) {

        // one shared pool — concurrent callers (base/exchange/ws tests) queue into the
        // same threads instead of each spawning their own full-size pool
        const maxThreads = csharpWorkerThreads ();
        if (!this.piscina) {
            this.piscina = new Piscina({
                filename: resolve(__dirname, 'csharp-worker.ts'),
                maxThreads,
            });
        }
        const piscina = this.piscina;
        const configKey = JSON.stringify (parserConfig);

        // One file per task. `roots` is the FULL stage list on every task so each worker
        // builds ONE sticky ts.Program (build/worker-program-batch.ts) and prints off it.
        const promises: any = [];
        const now = Date.now();
        for (const file of allFiles) {
            promises.push(piscina.run({transpilerConfig:parserConfig, configKey, roots: allFiles, files: [file]}));
        }
        const workerResult = await Promise.all(promises);
        const elapsed = Date.now() - now;
        log.green ('[ast-transpiler] Transpiled', allFiles.length, 'files in', elapsed, 'ms');
        const flatResult: any[] = [];
        for (const chunk of workerResult) {
            flatResult.push (...chunk.result);
        }
        return flatResult;
    }

    async transpileDerivedExchangeFiles (jsFolder: string, options: any, pattern = '.ts', force = false, ws = false, prediction = false) {

        // todo normalize jsFolder and other arguments

        // exchanges.json accounts for ids included in exchanges.cfg
        let ids: string[] = []
        try {
            ids = (exchanges as any).ids
        } catch (e) {
        }

        const regex = new RegExp (pattern.replace (/[.*+?^${}()|[\]\\]/g, '\\$&'))

        // local file list — must NOT clobber the module-level `exchanges` (the parsed
        // exchanges.json), which this function reads `.ids` off of on the next call.
        // Assigning to it worked only because each stage ran in its own process;
        // --rest-and-ws reuses one.
        let exchangeFiles: string[]
        if (options.exchanges && options.exchanges.length) {
            exchangeFiles = options.exchanges.map ((x: string) => x + pattern)
        } else {
            exchangeFiles = fs.readdirSync (jsFolder).filter (file => file.match (regex) && (!ids || ids.includes (basename (file, '.ts'))))
        }

        // the wrapper folder is needed up front: a skipped exchange must have BOTH its
        // transpiled class and its wrapper already up to date. ws/prediction-ws aliases
        // live in one consolidated file, so only the REST tiers have a folder stamp.
        const wrapperFolder = ws
            ? undefined
            : (this.isPrediction ? EXCHANGE_PREDICTION_WRAPPER_FOLDER : EXCHANGE_WRAPPER_FOLDER);

        // incremental gate (same rule as the Python/PHP pass in build/transpile.ts):
        // drop the exchanges whose output is newer than their ts source. This has to
        // happen BEFORE the pool is fed, because `allFilesPath` doubles as the sticky
        // ts.Program root list — leaving a clean exchange in it would transpile and
        // rewrite it anyway. `--force` (and any single-exchange run) keeps everything.
        exchangeFiles = filterDirtyExchangeFiles ('csharp', exchangeFiles, force, (file: string) => {
            const csName = file.replace ('.ts', '.cs');
            const outputs: string[] = [];
            if (options.csharpFolder) {
                outputs.push (options.csharpFolder + csName);
            }
            if (wrapperFolder) {
                outputs.push (wrapperFolder + csName);
            }
            return { 'tsPath': jsFolder + file, 'outputs': outputs };
        })

        if (!exchangeFiles.length) {
            return {}
        }

        // transpile using webworker
        const allFilesPath = exchangeFiles.map ((file: string) => jsFolder + file );
        log.blue('[csharp] Transpiling [', exchangeFiles.join(', '), ']');
        // a single exchange (scoped/debug run) is not worth a cold pool
        const transpiledFiles = (allFilesPath.length > 1)
            ? await this.webworkerTranspile (allFilesPath, this.getTranspilerConfig())
            : allFilesPath.map((file: string) => this.transpiler.transpileCSharpByPath(file));

        if (!ws) {
            for (let i = 0; i < transpiledFiles.length; i++) {
                const transpiled = transpiledFiles[i];
                const exchangeName = exchangeFiles[i].replace('.ts','');
                const path = wrapperFolder + exchangeName + '.cs';
                this.createCSharpWrappers(exchangeName, path, transpiled.methodsTypes)
            }
        }
        // ws / prediction-ws class aliases are written once, from the full id list, so a
        // scoped run cannot truncate the file to just the exchanges it transpiled
        if (ws) {
            if (this.isPrediction) {
                this.createClassAliasFile (predictionWsIds, PREDICTION_WS_CLASS_ALIAS_FILE, this.getNamespace (true));
            } else {
                this.createClassAliasFile (wsIds, WS_CLASS_ALIAS_FILE, this.getNamespace (true));
            }
        } else if (this.isPrediction) {
            this.createClassAliasFile (predictionIds, PREDICTION_CLASS_ALIAS_FILE, this.getNamespace (false));
        }
        exchangeFiles.map ((file: string, idx: number) => this.transpileDerivedExchangeFile (jsFolder, file, options, transpiledFiles[idx], force, ws, prediction))

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
        // WS fixes
        if (ws) {
            const wsRegexes = this.getWsRegexes();
            content = this.regexAll (content, wsRegexes);
            content = this.removeRedundantClientCasts (content);
            const classNameRegex = /public\spartial\sclass\s(\w+)\s:\s(\w+)/gm;
            const classNameExec = classNameRegex.exec(content);
            const className = classNameExec ? classNameExec[1] : '';
            const constructorLine = `\npublic partial class ${className} { public ${className}(object args = null) : base(args) { } }\n`
            content = constructorLine  + content;
        } else if (this.isPrediction) {
            // prediction exchanges merge REST + WS in one class, so the WS transforms
            // (client → WebSocketClient, orderbook casts, append/resolve, ...) apply here too
            content = this.regexAll (content, this.getWsRegexes());
            content = this.removeRedundantClientCasts (content);
        }
        const classDecl = /public partial class (\w+) : ([\w.]+)/.exec (content);
        if (classDecl) {
            this.currentVenue = classDecl[1];
            const parent = classDecl[2].split ('.').pop () as string;
            if (parent !== 'Exchange' && parent !== 'PredictionExchange' && parent !== this.currentVenue) {
                this.venueParents[this.currentVenue] = parent;
            }
        }
        // the prediction REST driver calls createCSharpClass with `prediction` unset, so the
        // tier flag has to come from `this.isPrediction` (set by every prediction pass) --
        // otherwise a prediction file would look up the REST venue's table and skip its own
        const venueKey = (this.isPrediction ? 'prediction:' : ws ? 'pro:' : '') + this.currentVenue;
        content = nativeDeclaredHelperCalls (this.typeVenueNumericArgs (this.typeVenueStringArgs (this.stripRedundantStringCasts (this.retypePrintedReceiverCasts (this.foldIdentityStringCasts (this.nativeListHelperCalls (this.retypeParseMarketParams (this.retypeWsHandlerMessages (this.retypeWsHandlerMessages ((this.dropStringTimeframeCasts ((this.finalizeCoreArgTypes (((this.typeCollectionReturns (this.typeCores (this.typeSyncCores (content)))))))))), true)))))), venueKey)), false);
        // the copy retypes below read `isEqual(x, null)` on `object` names; the final pass rewrites them
        content = this.dropRedundantObjectBoxCasts (content);
        content = this.retypeIdentifierCopies (content);
        content = this.dropIdentityStringCasts (content);
        // the copies retyped above are declarations the native helper pass could not see yet
        content = nativeDeclaredHelperCalls (retypeOrderBookCacheLocals (content));
        if (ws || this.isPrediction) {
            content = nativeWsCacheCalls (content);
        }
        this.currentVenue = '';
        content = this.createGeneratedHeader().join('\n') + '\n' + content;
        return csharpImports + content;
    }

    transpileDerivedExchangeFile (tsFolder: string, filename: string, options: any, csharpResult: any, force = false, ws = false, prediction = false) {

        const { csharpFolder } = options

        const csharpFilename = filename.replace ('.ts', '.cs')

        const csharp  = this.createCSharpClass (csharpResult, ws, prediction)

        if (csharpFolder) {
            overwriteFileAndFolder (csharpFolder + csharpFilename, csharp)
        }
    }

    // ---------------------------------------------------------------------------------------------
    // one base test file (orderbook / cache / cryptography): drop the TS preamble above `splitter`,
    // the `equals` helper and rename `assert`, then wrap it in `BaseTest`
    transpileBaseTestFileToCSharp (jsFile: string, csharpFile: string, stage: string, using: string, splitter: string | undefined, regexes: any[], force: boolean) {
        if (skipUpToDateStage ('csharp', stage, force, testStageInputs (), [ csharpFile ])) {
            return;
        }
        log.magenta ((using === 'using ccxt;' ? '[csharp] ' : '') + 'Transpiling from', (jsFile as any).yellow)
        let content = this.transpiler.transpileCSharpByPath(jsFile).content;
        if (splitter !== undefined) {
            const splitParts = content.split(splitter);
            splitParts.shift();
            content = splitParts.join('\n' + splitter + '\n');
        }
        content = this.regexAll (content, regexes.concat ([
            [ /\s*public\sobject\sequals(([^}]|\n)+)+}/gm, '' ], // remove equals
            [/assert/g, 'Assert'],
        ])).trim ()
        const contentIdented = content.split ('\n').map (line => '        ' + line).join ('\n');
        const file = [
            using,
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

    async transpileBaseTestsToCSharp (force = true) {
        const outDir = BASE_TESTS_FOLDER;
        await this.transpileBaseTests(outDir, force);
        const dashes = '// ' + '-'.repeat (76);
        this.transpileBaseTestFileToCSharp ('./ts/src/test/base/test.cryptography.ts', `${outDir}/test.cryptography.cs`, 'crypto test', 'using ccxt;', undefined, [], force);
        this.transpileBaseTestFileToCSharp ('./ts/src/pro/test/base/test.cache.ts', `${outDir}/Ws/test.cache.cs`, 'ws cache test', 'using ccxt.pro;', dashes, [], force);
        this.transpileBaseTestFileToCSharp ('./ts/src/pro/test/base/test.orderBook.ts', `${outDir}/Ws/test.orderBook.cs`, 'ws orderbook test', 'using ccxt.pro;', dashes + '-'.repeat (40), [
            [/object\s*(\w+)\s=\sgetValue\((\w+),\s*"(bids|asks)".+/g,'var $1 = $2.$3;'], // tmp fix
        ], force);
    }

    async transpileBaseTests (outDir: string, force = true) {

        const baseFolders = {
            ts: './ts/src/test/base/',
        };

        let baseFunctionTests = fs.readdirSync (baseFolders.ts).filter(filename => filename.endsWith('.ts')).map(filename => filename.replace('.ts', ''));

        // filter out NO_AUTO_TRANSPILE files first, then transpile the rest through the
        // worker pool — the previous serial loop was ~1s per file and dominated the build
        const eligible = baseFunctionTests.filter ((testName) => {
            const tsContent = fs.readFileSync (baseFolders.ts + testName + '.ts').toString ();
            return !tsContent.includes ('// NO_AUTO_TRANSPILE');
        });

        // whole-stage gate: `paths` below doubles as the sticky ts.Program root list, so
        // this stage is skipped all-or-nothing rather than per file
        if (skipUpToDateStage ('csharp', 'base tests', force, testStageInputs (), eligible.map ((testName) => `${outDir}/${testName}.cs`))) {
            return;
        }

        const paths = eligible.map ((testName) => baseFolders.ts + testName + '.ts');
        const transpiled = await this.webworkerTranspile (paths, this.getTranspilerConfig ());

        for (let i = 0; i < eligible.length; i++) {
            const testName = eligible[i];
            const tsFile = baseFolders.ts + testName + '.ts';

            const csharpFile = `${outDir}/${testName}.cs`;

            log.magenta ('Transpiling from', (tsFile as any).yellow)

            const csharp = transpiled[i];
            let content = csharp.content;
            content = this.regexAll (content, [
                [/assert/g, 'Assert'],
                [ /object exchange(?=[,)])/g, 'Exchange exchange' ],
                [ /\s*public\sobject\sequals(([^}]|\n)+)+}/gm, '' ], // remove equals
                [ /testSharedMethods\./gm, '' ], // deepEqual added
                // Match ArrayCache variables and cast to appropriate type based on variable name
                // Order matters: check most specific types first
                [/(\w*ArrayCacheBySymbolBySide\w*)\.hashmap/g, '(($1 as ArrayCacheBySymbolBySide).hashmap)'],
                [/(\w*ArrayCacheByTimestamp\w*)\.hashmap/g, '(($1 as ArrayCacheByTimestamp).hashmap)'],
                [/(\w*ArrayCacheBySymbolById\w*)\.hashmap/g, '(($1 as ArrayCacheBySymbolById).hashmap)'],
                // Match stored variables
                [/\bstored\.hashmap/g, '((stored as ArrayCache).hashmap)'],
            ]).trim ()

            content = this.detypeStructReturningCalls (content);
            const contentLines = content.split ('\n');
            const contentIdented = contentLines.map ((line: string) => '        ' + line).join ('\n');

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

    transpileMainTest(files: any) {
        log.magenta ('[csharp] Transpiling from', files.tsFile.yellow)
        // the legacy request-builders bind Exchange statically, so their typed-core calls print PascalCase
        const printer = this.transpiler.csharpTranspiler as any;
        printer.csharpTypedCoreInMemoryReceiver = 'exchange';
        let csharp;
        try {
            csharp = this.transpiler.transpileCSharp(fs.readFileSync (files.tsFile).toString ());
        } finally {
            printer.csharpTypedCoreInMemoryReceiver = undefined;
        }
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
            [ /BaseExchange exchange = this\.initOfflineExchange\(("[a-z0-9]+")\)/g, 'Exchange exchange = ((Exchange)this.initOfflineExchange($1))' ],
            [ /testReturnResponseHeaders\(BaseExchange exchange\)/g, 'testReturnResponseHeaders(Exchange exchange)' ],
            [/class testMainClass/g, 'public partial class testMainClass'],
            // noImplicitAny bags: keep object so safeValue assignments typecheck
            [ /public (?:Dict|Dictionary<string, object>) skippedMethods\b/g, 'public object skippedMethods' ],
            [ /public (?:Dict|Dictionary<string, object>) checkedPublicTests\b/g, 'public object checkedPublicTests' ],
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

    // one `{ base, name, tsFile, csharpFile }` entry per `.ts` test in `tsDir`
    exchangeTestEntries (tsDir: string, csharpDir: string, base?: boolean): any[] {
        return fs.readdirSync (tsDir).filter (filename => filename.endsWith ('.ts')).map (filename => filename.replace ('.ts', ''))
            .map ((name) => ({ base, name, tsFile: tsDir + name + '.ts', csharpFile: csharpDir + name + '.cs' }));
    }

    transpileExchangeTests(force = true){
        const baseFolders = {
            ts: './ts/src/test/Exchange/',
            tsBase: './ts/src/test/Exchange/base/',
            csharpBase: EXCHANGE_BASE_FOLDER,
            csharp: EXCHANGE_GENERATED_FOLDER,
        };

        // ignore throttle test for now
        const tests = this.exchangeTestEntries (baseFolders.tsBase, baseFolders.csharpBase, true).filter ((t: any) => t.name !== 'test.throttle')
            .concat (this.exchangeTestEntries (baseFolders.ts, baseFolders.csharp, false));

        // whole-stage gate — TestMethods.cs is included because transpileMainTest below
        // writes it from ./ts/src/test/tests.ts, which is part of testStageInputs()
        if (skipUpToDateStage ('csharp', 'exchange tests', force, testStageInputs (), [ BASE_TESTS_FILE ].concat (tests.map ((t: any) => t.csharpFile)))) {
            return;
        }

        this.transpileMainTest({
            'tsFile': './ts/src/test/tests.ts',
            'csharpFile': BASE_TESTS_FILE,
        });

        return this.transpileAndSaveCsharpExchangeTests (tests);
    }

    transpileWsExchangeTests(force = true){

        const baseFolders = {
            ts: './ts/src/pro/test/Exchange/',
            csharp: EXCHANGE_GENERATED_FOLDER + 'Ws/',
        };

        const tests = this.exchangeTestEntries (baseFolders.ts, baseFolders.csharp);

        if (skipUpToDateStage ('csharp', 'ws exchange tests', force, testStageInputs (), tests.map ((t: any) => t.csharpFile))) {
            return;
        }

        return this.transpileAndSaveCsharpExchangeTests (tests, true);
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
                [/testSharedMethods\.assertTimestampAndDatetime\(exchange, skippedProperties, method, orderbook\)/, '// testSharedMethods.assertTimestampAndDatetime (exchange, skippedProperties, method, orderbook)'], // tmp disabling timestamp check on the orderbook
                [/(\w+)\.spawn\(([^,]+),(.+)\)/gm, '$1.spawn($2, new object[] {$3})'],
                // apply 'getPreTranspilationRegexes' here, bcz in CS we don't have pre-transpilation regexes
                [/exchange.jsonStringifyWithNull/g, 'json'],
            ];

            if (!isWs) {
                // REST tests hold the exchange as `BaseExchange`, so a unified call can bind
                // neither statically (prediction is a sibling tier) nor through `dynamic`:
                // the DLR picks the overload from the arguments' STATIC type, which is
                // `object`, so every narrowed core parameter (`string symbol`, `Int64? limit`)
                // is rejected with RuntimeBinderException. Route through the reflective helper
                // instead -- it resolves the PascalCase rename and coerces the boxed scalars.
                regexes = regexes.concat([
                    [ /await exchange\.(\w+)\(\s*\)/g, 'await invokeExchangeDynamically(exchange, "$1")' ],
                    [ /await exchange\.(\w+)\(/g, 'await invokeExchangeDynamically(exchange, "$1", ' ],
                ]);
            }

            if (isWs) {
                // add ws-tests specific regexes
                regexes = regexes.concat([
                    [/await exchange.WatchOrderBook\((\(\(string\)symbol\))\)/g, '((IOrderBook)(await exchange.WatchOrderBook($1))).Copy()'],
                    [/await exchange.WatchOrderBookForSymbols\((.*?)\)/g, '((IOrderBook)(await exchange.WatchOrderBookForSymbols($1))).Copy()'],
                ]);
            }

            contentIndentend = this.regexAll (contentIndentend, regexes)
            // narrowed core parameters (`string code`, `string timeframe`) also need an explicit
            // cast in tests: REST tests route only the awaited `await exchange.X(` calls through
            // invokeExchangeDynamically, so synchronous helpers (currency, parseOHLCVs, ...) stay
            // static calls against `BaseExchange`; WS tests bind statically throughout.
            if (isWs) {
                // must run last: it matches the PascalCase names the printer produced
                contentIndentend = this.detypeWsTypedCoreCalls (contentIndentend);
            }
            contentIndentend = this.detypeStructReturningCalls (contentIndentend);
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
            overwriteFileAndFolder (tests[idx].csharpFile, nativeDeclaredHelperCalls (csharp));
        });
    }

    async transpileTests(force = true){
        if (!shouldTranspileTests) {
            log.bright.yellow ('Skipping tests transpilation');
            return;
        }
        const baseTestsOnly = process.argv.includes ('--baseTests')
        if (baseTestsOnly) {
            await this.transpileBaseTestsToCSharp(force);
            return;
        }

        // the three groups are independent — run them concurrently
        await Promise.all ([
            this.transpileBaseTestsToCSharp(force),
            this.transpileExchangeTests(force),
            this.transpileWsExchangeTests(force),
        ]);
    }
}

// ral-84c3 snippet checks: a row element local is typed only when a literal-key write makes a use native
function rowWriteElementSnippetChecks84c3 (): string[] {
    const problems: string[] = [];
    const config: any = { verbose: false, csharp: { parser: { NUM_LINES_END_FILE: 0, 'ELEMENT_ACCESS_WRAPPER_OPEN': 'getValue(', 'ELEMENT_ACCESS_WRAPPER_CLOSE': ')' } } };
    const transpiler = new Transpiler (config);
    setupCsharpPrinter (transpiler);
    const check = (name: string, body: string, expected: string[], forbidden: string[]) => {
        const src = 'type Dict = { [key: string]: any };\nclass Test {\n safeString (o, k, d = undefined): string { return d; }\n' + body + '\n}';
        const out: string = (transpiler as any).transpileCSharp (src).content;
        for (const e of expected) { if (!out.includes (e)) { problems.push (`84c3 row write: ${name}: missing ${e}`); } }
        for (const f of forbidden) { if (out.includes (f)) { problems.push (`84c3 row write: ${name}: has ${f}`); } }
    };
    check ('literal-key write is native', 'f (data: Dict[], c) { const first = data[0]; first["next"] = c; return data; }',
        [ 'IDictionary<string, object> first = ((IDictionary<string, object>)', 'first["next"] = c;' ], [ 'object first', '((IDictionary<string,object>)first)' ]);
    check ('safe-read-only local keeps object', 'g (data: Dict[]) { const entry = data[0]; return this.safeString (entry, "a"); }', [ 'object entry = ' ], [ 'IDictionary<string, object> entry' ]);
    check ('identifier-key write keeps object', 'h (data: Dict[], k: string) { const row = data[0]; row[k] = 1; return data; }', [ 'object row = ' ], [ 'IDictionary<string, object> row' ]);
    check ('in-tested local keeps object', 'k (data: Dict[]) { const row = data[0]; if ("a" in row) { row["a"] = 2; } return data; }', [ 'object row = ' ], [ 'IDictionary<string, object> row' ]);
    check ('market name keeps object', 'm (data: Dict[]) { const market = data[0]; market["a"] = 1; return data; }', [ 'object market = ' ], [ 'IDictionary<string, object> market' ]);
    check ('use-proven dict element of an any list', 'r (data: any[], c) { const last = data[data.length - 1]; last["next"] = c; data[data.length - 1] = last; return data; }',
        [ 'IDictionary<string, object> last = ((IDictionary<string, object>)', 'last["next"] = c;' ], [ 'object last', '((IDictionary<string,object>)last)' ]);
    check ('use-proven list element of an any list', 's (rows: any[], v) { const row = rows[0]; row.push (v); return rows; }',
        [ 'IList<object> row = ((IList<object>)', 'row.Add(v);' ], [ 'object row', '((IList<object>)row)' ]);
    check ('conditional write does not prove the box', 't (rows: any[], v, f) { const row = rows[0]; if (f) { row["a"] = v; } return rows; }', [ 'object row = ' ], [ 'IDictionary<string, object> row' ]);
    check ('statement before the write does not prove the box', 'u (rows: any[], v) { const row = rows[0]; this.safeString (v, "a"); row["a"] = v; return rows; }', [ 'object row = ' ], [ 'IDictionary<string, object> row' ]);
    check ('87c3 sibling-bound string list element', 'p (f, a: Dict, b: Dict) { if (f) { const ks = Object.keys (a); for (let i = 0; i < ks.length; i++) { const k = ks[i]; delete a[k]; } } else { const ks = Object.keys (b); for (let i = 0; i < ks.length; i++) { const k2 = ks[i]; delete b[k2]; } } }',
        [ 'string? k = ((string)', 'string? k2 = ((string)' ], [ 'object k ', 'object k2' ]);
    check ('87c3 sibling-bound pushed list keeps object', 'q (f, a: Dict) { if (f) { const ks = Object.keys (a); ks.push (1); const k = ks[0]; return k; } else { const ks = Object.keys (a); return ks; } }',
        [ 'object k = ' ], [ 'string? k = ' ]);
    check ('87c3 length-alias bounded keys element', 'v (a: Dict) { const ks = Object.keys (a); const n = ks.length; let r = 0; for (let i = 0; i < n; i++) { const k = ks[i]; r = k + "=" + a[k]; } return r; }',
        [ 'string k = ((string)' ], [ 'object k = ' ]);
    check ('87c3 length alias with a moved index keeps object', 'w (a: Dict) { const ks = Object.keys (a); const n = ks.length; let r = 0; for (let i = 0; i < n; i++) { i = i + 1; const k = ks[i]; r = k + "=" + a[k]; } return r; }',
        [ 'object k = ' ], [ 'string k = ' ]);
    check ('keyed read into a local keeps object', 'n (data: Dict[]) { const row = data[0]; row["a"] = 1; const s = row["b"]; return s; }', [ 'object row = ' ], [ 'IDictionary<string, object> row' ]);
    check ('90c3 keyed string-list element read by in / delete', 'x (s: Dict, d: Dict, h: string[]) { const r = { "hs": h }; s["r"] = r; const hs = this.safeList (s, "hs", []); for (let i = 0; i < hs.length; i++) { const k = hs[i]; if (k in d) { delete d[k]; } } }',
        [ 'string? k = ((string)hs[i])' ], [ 'object k = ' ]);
    check ('90c3 keyed list with a non-string writer keeps object', 'y (s: Dict, d: Dict, h: any[]) { const r = { "hs": h }; s["r"] = r; const hs = this.safeList (s, "hs", []); for (let i = 0; i < hs.length; i++) { const k = hs[i]; if (k in d) { delete d[k]; } } }',
        [ 'object k = ' ], [ 'string? k = ' ]);
    check ('90c3 keyed string-list element passed only to an object call keeps object', 'z (s: Dict, h: string[]) { const r = { "hs": h }; s["r"] = r; const hs = this.safeList (s, "hs", []); for (let i = 0; i < hs.length; i++) { const k = hs[i]; this.safeString (s, k); } }',
        [ 'object k = ' ], [ 'string? k = ' ]);
    check ('90c3 character of a string local read by indexOf', 'hx (hex: string) { const digits = "0123456789abcdef"; const lower = hex.toLowerCase (); let r = 0; for (let i = 0; i < lower.length; i++) { const ch = lower[i]; r = r + digits.indexOf (ch); } return r; }',
        [ 'string? ch = ((string)' ], [ 'object ch = ' ]);
    check ('string-list element read as the key of a declared dictionary', 'kr (s: Dict, h: string[]) { const r = { "hs": h }; s["r"] = r; const d = {}; const hs = this.safeList (s, "hs", []); let n = 0; for (let i = 0; i < hs.length; i++) { const k = hs[i]; n = d[k]; } return n; }',
        [ 'string? k = ((string)hs[i])', 'd.ContainsKey(k)' ], [ 'object k = ' ]);
    check ('Object.keys element compared to a literal while the list goes to a reader', 'nk (n: Dict) { const ks = Object.keys (n); for (let i = 0; i < ks.length; i++) { const k = ks[i]; if (k === "ERC20") { return k; } } return this.safeString (ks, 0); }',
        [ 'string? k = ((string)ks[i])', 'k == \"ERC20\"' ], [ 'object k = ' ]);
    check ('Object.keys element only tested by in on an untyped dict keeps object', 'nu (n: Dict, m) { const ks = Object.keys (n); for (let i = 0; i < ks.length; i++) { const k = ks[i]; if (k in m) { return 1; } } return this.safeString (ks, 0); }',
        [ 'object k = ' ], [ 'string? k = ' ]);
    check ('list element whose next statement is its string-method receiver', 'tq (tags) { const out: string[] = []; for (let i = 0; i < tags.length; i++) { const t = tags[i]; out.push (t.replaceAll ("-", " ")); } return out; }',
        [ 'string? t = ((string)', 't.Replace(' ], [ 'object t = ', '((string)t)' ]);
    check ('list element used as a receiver only behind a test keeps object', 'tr (tags, c) { const t = tags[0]; if (c) { return t.toUpperCase (); } return c; }',
        [ 'object t = ' ], [ 'string? t = ' ]);
    check ('guarded Int64? difference initialiser is declared Int64?', 'safeInteger (o, k, d = undefined): number { return d; }\n ra (o: Dict, m: number) { const e = this.safeInteger (o, "e"); if (e === undefined) { return 1; } const r = e - 5; if (m < r) { return 2; } return 3; }',
        [ 'Int64? r = (e - 5);' ], [ 'object r = ' ]);
    check ('nested guarded Int64? difference', 'safeInteger (o, k, d = undefined): number { return d; }\n rn (o: Dict, t: number) { const e = this.safeInteger (o, "e"); if (e !== undefined) { const r = e - 7 - 60000; if (r > 0) { return r; } } return 3; }',
        [ 'Int64? r = ((e - 7) - 60000);' ], [ 'object r = ', 'subtract(' ]);
    return problems;
}

async function runMain () {
    if (process.argv.includes ('--self-test')) {
        const problems = [ ...csharpNativeEmissionSelfTest (), ...counterAndGuardedMathSelfTest (), ...pureKeyInOpSelfTest (), ...digitLiteralEqualitySelfTest (), ...nonNullIntCompareSelfTest (), ...stringBoxConcatSelfTest (), ...csharpReturnIdentitySelfTest (), ...csharpTypedCoreConversionSelfTest (), ...nativeParseCallsSnippetChecks (), ...tupleSlotReadSnippetChecks (), ...nullSeedParamsSlotChecks (), ...copyLocalSnippetChecks77c5 (), ...helperReturnLocalsSnippetChecks (), ...rowWriteElementSnippetChecks84c3 (), ...copyLocalSnippetChecks84c5 (), ...nonNullStringCallSnippetChecks84c7 (), ...nullSeedNativeStringChecks87c4 (), ...nullSeedChecks90c4 (), ...nullSeedChecks92c4 (), ...nullSeedChecks93c4 (), ...copyLocalSnippetChecks87c5 (), ...readerSeedElementWriteChecks () ];
        if (problems.length) {
            console.error ('SELF-TEST FAILED:\n  - ' + problems.join ('\n  - '));
            process.exit (3);
        }
        console.log ('SELF-TEST PASSED');
        return;
    }
    const ws = process.argv.includes ('--ws')
    // bare prediction-only ids (e.g. `csharpTranspiler.ts kalshi`) auto-route to the
    // prediction namespace so scoped CI steps don't need to know it
    const cliExchanges = process.argv.slice (2).filter (x => !x.startsWith ('--'))
    const allArePredictionOnly = cliExchanges.length > 0 && cliExchanges.every (x => predictionIds.includes (x) && !exchangeIds.includes (x))
    const prediction = process.argv.includes ('--prediction') || allArePredictionOnly
    const baseTestsOnly = process.argv.includes ('--baseTests')
    const test = process.argv.includes ('--test') || process.argv.includes ('--tests')
    const examples = process.argv.includes ('--examples');
    const force = process.argv.includes ('--force')
    const baseClassOnly = process.argv.includes ('--baseClass')
    // single-process REST+WS (default via npm run transpileCS / CI): keeps the one
    // piscina pool (and its warm per-thread Transpilers) alive across both stages
    // instead of paying a second process boot + cold pool. Omit the flag for REST-only.
    const restAndWs = process.argv.includes ('--rest-and-ws')
    shouldTranspileTests = process.argv.includes ('--noTests') ? false : true
    log.bright.green ({ force })
    const transpiler = new NewTranspiler ();
    const inputExchanges = process.argv.slice (2).filter (x => !x.startsWith ('--'))
    try {
        if (baseClassOnly) {
            transpiler.transpileBaseMethods ('./ts/src/base/Exchange.ts')
            transpiler.transpilePredictionBaseMethods ()
        } else if (restAndWs) {
            // same work as `transpileCS --force` followed by `transpileCSWs --force`, but on
            // one transpiler instance, so the single piscina pool (and its warm per-thread
            // Transpilers) survives into the ws stage instead of paying a second process
            // boot + cold pool. `npm run transpileCS` is the default full path; --ws stays ws-only.
            await transpiler.transpileEverything (force, false, examples, prediction)
            await transpiler.transpileWS (force)
            if (!inputExchanges.length) {
                // full ws builds also transpile the prediction ws exchanges
                await transpiler.transpileWS (force, true)
            }
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
        } else if (test || baseTestsOnly) {
            await transpiler.transpileTests () 
        } else {
            await transpiler.transpileEverything (force, false, examples, prediction)
        }
    } finally {
        await transpiler.destroy ();
    }
}

if (isMainEntry(metaUrl)) {
    await runMain();
}

// `isEqual(E, const)` -> `==` / a constant pattern when the emitted text proves E's C# type: object reads
// compare null/bool/non-numeric literals as `E == null` / `E is true` / `E is "lit"`; typed base accessors,
// in-file signatures and hand-written base fields compare natively. E is printed once.
function csharpConstantEqualities (rewritten: string | undefined, line: string, takeType, objectNull: boolean, content: string): string | undefined {
    const original = rewritten ?? line;
    if (!objectNull || !/(?<![A-Za-z0-9_.])isEqual\(/.test (original)) {
        return rewritten;
    }
    const masked = csharpHelperMaskLine (original);
    const helperCall = /(?<![A-Za-z0-9_.])isEqual\(/g;
    const edits = [];
    let match;
    while ((match = helperCall.exec (masked)) !== null) {
        const open = match.index + match[0].length - 1;
        const close = csharpHelperCallEnd (masked, open);
        if (close === undefined) continue;
        const comma = csharpHelperTopLevelComma (masked, open, close);
        if ((comma === undefined) || (csharpHelperTopLevelComma (masked, comma, close) !== undefined)) continue;
        if (edits.some ((e) => (e.start < close + 1) && (match.index < e.end))) continue;
        const sides = [ [ open + 1, comma ], [ comma + 1, close ] ].map (([ a, b ]) => ({
            maskedText: masked.substring (a, b).trim (), text: original.substring (a, b).trim () }));
        let text = undefined;
        for (const [ e, c ] of [ [ 0, 1 ], [ 1, 0 ] ]) {
            const constant = csharpOperatorOperand (sides[c].maskedText, sides[c].text, () => undefined);
            if ((constant === undefined) || (constant.kind === 'name')) continue;
            const type = csharpIsEqualOperandType (sides[e].maskedText, takeType, content);
            if (type === undefined) continue;
            text = csharpConstantEqualityEmission (type, constant.kind, sides[e].text, sides[c].text);
            if (text !== undefined) break;
        }
        if (text !== undefined) {
            edits.push ({ start: match.index, end: close + 1, text });
        }
    }
    return (edits.length === 0) ? rewritten : applyRegionEdits (original, edits);
}

// apply non-overlapping `{ start, end, text }` edits to `original`, last first
function applyRegionEdits (original: string, edits: { start: number, end: number, text: string }[]): string {
    let out = original;
    for (const edit of edits.sort ((a, b) => b.start - a.start)) {
        out = out.substring (0, edit.start) + edit.text + out.substring (edit.end);
    }
    return out;
}

// the native text for `isEqual(E, constant)`, or undefined when E's type does not prove it
function csharpConstantEqualityEmission (type: string, kind: string, eText: string, cText: string): string | undefined {
    const eq = () => `(${eText} == ${cText})`;
    const body = (kind === 'string-literal') ? cText.slice (1, -1) : '';
    // Double.TryParse could read the literal: isEqual's numeric branch would convert a number box
    const numericLooking = /[0-9\\]/.test (body) || /nan|inf|\u221e/i.test (body);
    if (kind === 'null') {
        return ((type === 'bool') || (type === 'double')) ? undefined : eq ();
    }
    if (type === 'object') {
        if (kind === 'bool-literal') return `(${eText} is ${cText})`;
        if ((kind === 'string-literal') && !numericLooking) return `(${eText} is ${cText})`;
        return undefined;
    }
    if ((type === 'bool?') || (type === 'bool')) return (kind === 'bool-literal') ? eq () : undefined;
    if ((type === 'string?') || (type === 'string')) return (kind === 'string-literal') ? eq () : undefined;
    return undefined;
}

// the C# type the emitted text gives an isEqual operand: 'object', a scalar spelling, 'ref' (a reference
// only null-tested), or undefined
function csharpIsEqualOperandType (m: string, takeType, content: string): string | undefined {
    const whole = (prefixLength: number) => (m.endsWith (')') && (csharpHelperCallEnd (m, prefixLength - 1) === m.length - 1));
    const call = /^(getValue|GetValue|this\.([A-Za-z_]\w*))\(/.exec (m);
    if ((call !== null) && whole (call[0].length)) {
        if (call[2] === undefined) return 'object';
        if (/^namespace Tests;/m.test (content)) return undefined; // `this` is the test harness there
        return csharpEqualityMethodType (call[2], content);
    }
    // the guarded dictionary / list reads the getValue pass emits: a ternary of an object element and null
    // (an identifier key also gets its own `k != null &&` test)
    const dict = /^\((?:(this\.\w+|\w+) != null && )?(?:(\w+) != null && )?(this\.\w+|\w+)\.ContainsKey\(("[ ]*"|\w+|\(string\)\w+)\) \? (this\.\w+|\w+)\[("[ ]*"|\w+|\(string\)\w+)\] : null\)$/.exec (m);
    // an `object` key reaches the indexer as the helper's own `(string)k` view of the tested identifier
    const bare = (key: string | undefined) => key?.replace (/^\(string\)/, '');
    if ((dict !== null) && ((dict[1] === undefined) || (dict[1] === dict[3])) && ((dict[2] === undefined) || (dict[2] === bare (dict[4]))) && (dict[3] === dict[5]) && (dict[4] === dict[6])) {
        return csharpEqualityObjectDict (dict[3], takeType) ? 'object' : undefined;
    }
    const list = /^\((\w+) != null && (\d+|\w+) < (\w+)\.Count \? (\w+)\[(\d+|\w+)\] : null\)$/.exec (m);
    if ((list !== null) && (list[1] === list[3]) && (list[1] === list[4]) && (list[2] === list[5])) {
        const receiver = takeType (list[1]);
        return ((receiver !== undefined) && CSHARP_DECLARED_LIST_TYPES.includes (receiver.type)) ? 'object' : undefined;
    }
    const field = /^this\.(\w+)$/.exec (m);
    if ((field !== null) && !/^namespace Tests;/m.test (content)) {
        const declared = new RegExp ('\\b(?:public|private|protected|internal)\\b[^(;=\\n]*[ ]' + field[1] + '[ ]*(?:\\{|=|;)');
        if (declared.test (content)) return undefined; // a venue member shadows the base field
        const fields = { apiKey: 'string', secret: 'string', password: 'string', uid: 'string', accountId: 'string',
            login: 'string', privateKey: 'string', walletAddress: 'string', twofa: 'string', id: 'string',
            rateLimiterAlgorithm: 'string', token: 'object', last_http_response: 'object', myLiquidations: 'object' };
        // cs/ccxt/base/Exchange.Options.cs; `double` fields stay: IsInteger rounds through decimal
        return Object.prototype.hasOwnProperty.call (fields, field[1]) ? fields[field[1]] : undefined;
    }
    return undefined;
}

// a receiver whose indexer yields `object`: a declared object-valued dictionary local/param or base field
function csharpEqualityObjectDict (name: string, takeType): boolean {
    if (name.startsWith ('this.')) {
        return [ 'has', 'balance', 'tickers', 'fundingRates', 'bidsasks', 'trades', 'ohlcvs', 'orderbooks',
            'markets', 'markets_by_id', 'currencies_by_id', 'options' ].includes (name.slice (5)); // Exchange.Options.cs
    }
    const receiver = takeType (name);
    return (receiver !== undefined) && CSHARP_DECLARED_OBJECT_DICT_TYPES.includes (receiver.type.replace (/\s+/g, ''));
}

// the return type of `this.name(...)`: every signature of `name` in this file agrees, else the
// hand-written base accessor (no venue redeclares these: C# overrides keep the base return type)
function csharpEqualityMethodType (name: string, content: string): string | undefined {
    const signature = new RegExp ('^[ ]{4}(?:(?:public|private|protected|internal|virtual|override|static|async|new)[ ]+)+([\\w<>,.?\\[\\] ]+?)[ ]+' + name + '\\(', 'gm');
    const returns = Array.from (content.matchAll (signature), (s) => s[1].trim ());
    const map = (t: string) => ((t === 'object') || (t === 'bool') || (t === 'bool?')) ? t : undefined;
    if (returns.length > 0) {
        const kinds = Array.from (new Set (returns.map (map)));
        return (kinds.length === 1) ? kinds[0] : undefined;
    }
    const base = { safeValue: 'object', safeValue2: 'object', safeValueN: 'object', handleOption: 'object',
        safeBool: 'bool?', safeBool2: 'bool?', safeBoolN: 'bool?',
        safeString: 'string?', safeString2: 'string?', safeStringN: 'string?', safeStringLower: 'string?',
        safeStringUpper: 'string?', safeSymbol: 'string?', safeCurrencyCode: 'string?', outcomeSearchQuery: 'string?',
        safeNumber: 'ref', safeNumber2: 'ref', safeNumberN: 'ref', safeFloat: 'ref', safeInteger: 'ref',
        safeInteger2: 'ref', safeIntegerN: 'ref', safeTimestamp: 'ref', safeOrderBook: 'ref',
        safeDict: 'ref', safeList: 'ref', omitZero: 'ref' }; // 'ref': only `== null` is emitted
    return Object.prototype.hasOwnProperty.call (base, name) ? base[name] : undefined;
}

// helper calls whose receiver the emitted text declares, which the pass above leaves:
// inOp on the ws client maps / `this.clients` with an `object` key, inOp on an ArrayCache local,
// getArrayLength on ArrayCache fields, getIndexOf on `string` / `string?` receivers.
export function csharpDeclaredReceiverHelperCalls (content: string): string {
    if (!/\b(inOp|getArrayLength|getIndexOf)\(/.test (content)) {
        return content;
    }
    return csharpLinePass (content, false, (region, line, masked, i) => {
        if (!/\b(inOp|getArrayLength|getIndexOf)\(/.test (masked)) {
            return undefined;
        }
        const typeOf = (name) => (/^[A-Za-z_]\w*$/.test (name) ? csharpHelperReceiverType (region, name, i, region.params) : undefined);
        return declaredReceiverRewriteLine (line, masked, typeOf, (name) => csharpInOpReceiverType (region, name, i));
    });
}

// hand-written `public ccxt.pro.ArrayCache <name>;` fields (cs/ccxt/base/Exchange.Options.cs)
function isArrayCacheField (name: string): boolean {
    return [ 'this.orders', 'this.myTrades', 'this.liquidations' ].includes (name);
}

// a needle printed as a `+` chain of identifiers/literals with a string literal in it: C# concatenation
// with a string operand is a non-null `string`, so the helper's `(string)` cast is the identity
function isStringConcatNeedle (mask: string): boolean {
    return mask.includes ('"') && /^[\s()+"\w]+$/.test (mask) && !/[A-Za-z_]\w*\s*\(/.test (mask) && /^[\s(]*("|\w)/.test (mask) && !/\+\s*[+)]|\(\s*\+/.test (mask);
}

function declaredReceiverRewriteLine (original: string, masked: string, typeOf, wsMapOf): string | undefined {
    const edits = [];
    let match;
    const calls = /(?<![A-Za-z_.])(inOp|getArrayLength|getIndexOf)\(/g;
    while ((match = calls.exec (masked)) !== null) {
        const helper = match[1];
        const open = match.index + match[0].length - 1;
        const close = csharpHelperCallEnd (masked, open);
        if (close === undefined) continue;
        if (edits.some ((e) => (match.index < e.end) && (close >= e.start))) continue;
        if (helper === 'getArrayLength') {
            const name = masked.substring (open + 1, close).trim ();
            // getArrayLength's IList<object> branch is the cache's Count; a null field reads 0
            if (isArrayCacheField (name)) {
                edits.push ({ start: match.index, end: close + 1, text: `(${name}?.Count ?? 0)` });
            }
            continue;
        }
        const comma = csharpHelperTopLevelComma (masked, open, close);
        if ((comma === undefined) || (csharpHelperTopLevelComma (masked, comma, close) !== undefined)) continue;
        const name = masked.substring (open + 1, comma).trim ();
        const keyMask = masked.substring (comma + 1, close).trim ();
        const keyText = original.substring (comma + 1, close).trim ();
        const literal = keyMask.startsWith ('"') && keyMask.endsWith ('"') && (keyMask.indexOf ('"', 1) === keyMask.length - 1);
        const key = /^[A-Za-z_]\w*$/.test (keyMask) ? typeOf (keyMask) : undefined;
        if (helper === 'getIndexOf') {
            const receiver = typeOf (name);
            if ((receiver === undefined) || ((receiver.type !== 'string') && (receiver.type !== 'string?'))) continue;
            // the needle is never evaluated twice and is already a C# string (a null one throws in both forms)
            if (!literal && !((key !== undefined) && ((key.type === 'string') || (key.type === 'string?'))) && !isStringConcatNeedle (keyMask)) continue;
            const scan = `IndexOf(${keyText}, StringComparison.Ordinal)`;
            // a `string?` receiver answers the helper's -1 for null through `?.`
            edits.push ({ start: match.index, end: close + 1, text: (receiver.type === 'string') ? `${name}.${scan}` : `(${name}?.${scan} ?? -1)` });
            continue;
        }
        // inOp: the key is read once; a literal or an identifier only
        if (!literal && (key === undefined)) continue;
        if ((key === undefined) || (key.type !== 'object')) continue; // string keys: the pass above
        if (name === 'this.clients') {
            // ConcurrentDictionary<string, WebSocketClient>: InOp's generic-dictionary branch casts the key
            edits.push ({ start: match.index, end: close + 1, text: `(${name} != null && ${keyText} != null && ${name}.ContainsKey((string)${keyText}))` });
            continue;
        }
        if (!/^[A-Za-z_]\w*\.futures$/.test (name) || (wsMapOf (name) === undefined)) continue;
        // IDictionary<string, Future> is not IDictionary<string, object>: the helper casts the key
        edits.push ({ start: match.index, end: close + 1, text: `(${name} != null && ${keyText} != null && ${name}.ContainsKey((string)${keyText}))` });
    }
    return (edits.length === 0) ? undefined : applyRegionEdits (original, edits);
}

// subtract/multiply/divide calls whose operands the emitted text declares numeric. The call
// binds a typed twin (Exchange.TranspileHelpers.cs) whose body is the operator on the converted operands,
// so the operator is emitted only where C#'s own promotion of the operands yields the twin's parameter type.

function csharpClosingParen (text: string, open: number): number | undefined {
    let depth = 0;
    for (let i = open; i < text.length; i++) {
        if ((text[i] === '(') || (text[i] === '[') || (text[i] === '{')) depth++;
        if ((text[i] === ')') || (text[i] === ']') || (text[i] === '}')) {
            depth--;
            if (depth === 0) return (text[i] === ')') ? i : undefined;
        }
    }
    return undefined;
}

function csharpStripParens (text: string): string {
    let t = text.trim ();
    while (t.startsWith ('(') && (csharpClosingParen (t, 0) === t.length - 1)) {
        t = t.slice (1, -1).trim ();
    }
    return t;
}

// the bound twin: [result type, the operand type C# promotes the native operator to] or undefined (object overload)
function arithmeticTwinType (name: string, left: string, right: string): string | undefined {
    const nullable = left.endsWith ('?') || right.endsWith ('?');
    const anyDouble = left.startsWith ('double') || right.startsWith ('double');
    if (name === 'subtract') {
        if (nullable) return undefined;
        return anyDouble ? 'double' : ((left === 'int' && right === 'int') ? 'int' : 'Int64');
    }
    if (name === 'multiply') {
        if (anyDouble) return undefined;
        return nullable ? 'Int64?' : 'Int64';
    }
    if ((left === 'double?') || (right === 'double?') || (nullable && anyDouble)) return undefined;
    return nullable ? 'double?' : 'double';
}

function arithmeticTwinRewrite (text: string, typeOfName: (name: string) => string | undefined, results: Map<string, string>): string {
    let out = '';
    let last = 0;
    const callRe = /(?<![A-Za-z0-9_.])(subtract|multiply|divide)\(/g;
    const calls = [];
    let m;
    while ((m = callRe.exec (text)) !== null) {
        const open = m.index + m[0].length - 1;
        const close = csharpClosingParen (text, open);
        if (close === undefined) continue;
        calls.push ({ start: m.index, open, close, name: m[1] });
        callRe.lastIndex = close + 1;
    }
    for (const call of calls) {
        out += text.slice (last, call.start);
        last = call.close + 1;
        const original = text.slice (call.start, call.close + 1);
        const comma = csharpHelperTopLevelComma (text, call.open, call.close);
        if ((comma === undefined) || (csharpHelperTopLevelComma (text, comma, call.close) !== undefined)) {
            out += original;
            continue;
        }
        const args = [ text.slice (call.open + 1, comma), text.slice (comma + 1, call.close) ].map ((a) => arithmeticTwinRewrite (a, typeOfName, results));
        const typed = args.map ((a) => arithmeticOperandType (a, typeOfName, results));
        const rebuilt = call.name + '(' + args[0] + ',' + args[1] + ')';
        const twin = (typed[0] && typed[1]) ? arithmeticTwinType (call.name, typed[0].type, typed[1].type) : undefined;
        let native: string | undefined;
        if (twin !== undefined) {
            // an operand that is itself an unparenthesised operator expression is wrapped
            const atom = (t: string) => (topLevelBinaryOperands (t) === undefined) ? t : '(' + t + ')';
            const L = atom (typed[0].text);
            let R = atom (typed[1].text);
            if (call.name === 'divide') {
                native = '((' + twin + ')' + L + ' / ' + R + ')';
            } else {
                // int x int promotes to int where the Int64 twin multiplies Int64: widen an int literal only
                if ((twin === 'Int64') && (typed[0].type === 'int') && (typed[1].type === 'int')) {
                    R = typed[1].literal ? R + 'L' : undefined;
                }
                native = (R === undefined) ? undefined : '(' + L + ((call.name === 'subtract') ? ' - ' : ' * ') + R + ')';
            }
        }
        const result = native ?? rebuilt;
        if (twin !== undefined) results.set (result, twin);
        out += result;
    }
    return out + text.slice (last);
}

// `A op B` with exactly one top-level `+`/`-`/`*` (binary, not a sign), else undefined
function topLevelBinaryOperands (text: string): { left: string, right: string } | undefined {
    let depth = 0;
    let found: number | undefined;
    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if ((ch === '(') || (ch === '[') || (ch === '{')) depth++;
        if ((ch === ')') || (ch === ']') || (ch === '}')) depth--;
        if ((depth === 0) && /[?:<>=!&|\/%^~,]/.test (ch)) return undefined;
        if ((depth === 0) && ((ch === '+') || (ch === '-') || (ch === '*')) && (text.slice (0, i).trim () !== '')) {
            if ((found !== undefined) || /[+\-*]$/.test (text.slice (0, i).trim ())) return undefined;
            found = i;
        }
    }
    return (found === undefined) ? undefined : { left: text.slice (0, found), right: text.slice (found + 1) };
}

function arithmeticOperandType (arg: string, typeOfName: (name: string) => string | undefined, results: Map<string, string>): { type: string, text: string, literal: boolean } | undefined {
    const text = arg.trim ();
    if (results.has (text)) {
        return { type: results.get (text), text, literal: false };
    }
    const bare = csharpStripParens (text);
    // an already-native `(A op B)`: the C# result type of the operator on the two typed operands
    const binary = topLevelBinaryOperands (bare);
    if (binary !== undefined) {
        const l = arithmeticOperandType (binary.left, typeOfName, results);
        const r = l && arithmeticOperandType (binary.right, typeOfName, results);
        if (!l || !r) return undefined;
        const nullable = l.type.endsWith ('?') || r.type.endsWith ('?');
        const base = (l.type.startsWith ('double') || r.type.startsWith ('double')) ? 'double'
            : ((l.type.startsWith ('Int64') || r.type.startsWith ('Int64')) ? 'Int64' : 'int');
        return { type: base + (nullable ? '?' : ''), text, literal: false };
    }
    if (/^-?\d{1,9}$/.test (bare)) {
        return { type: 'int', text: bare.startsWith ('-') ? '(' + bare + ')' : bare, literal: true };
    }
    if (/^\d{1,15}L$/.test (bare)) {
        return { type: 'Int64', text: bare, literal: true };
    }
    if (/^\d+\.\d+$/.test (bare)) {
        return { type: 'double', text: bare, literal: true };
    }
    if (/^this\.(milliseconds|seconds)\(\)$/.test (bare)) {
        return { type: 'Int64', text: bare, literal: false };
    }
    if (/^getArrayLength\([A-Za-z_]\w*\)$/.test (bare) || /^this\.parseTimeframe\([A-Za-z_]\w*\)$/.test (bare)) {
        return { type: 'int', text: bare, literal: false };
    }
    const member = /^([A-Za-z_]\w*)\.(Length|Count)$/.exec (bare);
    if (member !== null) {
        const owner = typeOfName (member[1]);
        const ok = (member[2] === 'Length') ? [ 'string', 'string?' ].includes (owner) : /^I?List<object>\??$/.test (owner ?? '');
        return ok ? { type: 'int', text: bare, literal: false } : undefined;
    }
    if (/^[A-Za-z_]\w*$/.test (bare)) {
        const type = typeOfName (bare);
        const types: { [type: string]: string } = { 'int': 'int', 'Int64': 'Int64', 'long': 'Int64', 'double': 'double', 'Int64?': 'Int64?', 'long?': 'Int64?', 'double?': 'double?' };
        const kind = ((type === undefined) || !Object.prototype.hasOwnProperty.call (types, type)) ? undefined : types[type];
        return (kind === undefined) ? undefined : { type: kind, text: bare, literal: false };
    }
    return undefined;
}

export function csharpNativeArithmetic (content: string): string {
    if (!/(?<![A-Za-z0-9_.])(subtract|multiply|divide)\(/.test (content) || /^namespace Tests\b/m.test (content)) {
        return content;
    }
    return csharpLinePass (content, false, (region, line, masked, i) => {
        // bound on the region's first line, before any line of it is rewritten
        region.bound = region.bound ?? arithmeticBoundNames (region.lines, region.start, region.end);
        if (!/(?<![A-Za-z0-9_.])(subtract|multiply|divide)\(/.test (masked) || line.includes ('\u0001') || /['@$]/.test (line)) {
            return undefined;
        }
        const typeOfName = (name: string) => region.bound.has (name) ? undefined : csharpHelperReceiverType (region, name, i, region.params)?.type;
        // string literals become opaque placeholders, a trailing line comment is kept aside
        const comment = masked.indexOf ('//');
        const code = (comment < 0) ? line : line.slice (0, comment);
        const strings = [];
        const opaque = code.replace (/"(?:[^"\\]|\\.)*"/g, (s) => '\u0001' + (strings.push (s) - 1) + '\u0001');
        const rewritten = arithmeticTwinRewrite (opaque, typeOfName, new Map ()).replace (/\u0001(\d+)\u0001/g, (_, n) => strings[Number (n)]) + ((comment < 0) ? '' : line.slice (comment));
        return (rewritten === line) ? undefined : rewritten;
    });
}

// names bound by any other syntax (for/foreach/out/lambda/pattern/tuple) in [start, end): they keep the helper
function arithmeticBoundNames (masked: string[], start: number, end: number): Set<string> {
    const bound = new Set<string> ();
    for (let i = start + 1; i < end; i++) {
        for (const b of masked[i].matchAll (/(?:\bfor(?:each)?[ ]*\([ ]*[A-Za-z_][\w<>?,]*[ ]+|\bout[ ]+[A-Za-z_][\w<>?]*[ ]+|\bis[ ]+[A-Za-z_][\w<>?]*[ ]+)([A-Za-z_]\w*)/g)) bound.add (b[1]);
        for (const b of masked[i].matchAll (/([A-Za-z_]\w*)[ ]*=>/g)) bound.add (b[1]);
        for (const b of masked[i].matchAll (/\(([^()]*)\)[ ]*=>/g)) {
            for (const n of b[1].split (',')) bound.add (n.trim ().split (/\s+/).pop ());
        }
    }
    return bound;
}

// `isGreaterThan(a, b)` & co with an `Int64?` / `long?` name: the helper answers true for (value, null),
// false for (null, value) under `>`; `<` is !GT && !EQ, the OrEqual twins add isEqual (true for null vs null).
// The lifted operator is false for any null: guard the side that differs.
function csharpNullableIntegerComparisonText (helper: string, left, right, leftText: string, rightText: string): string | undefined {
    const token = { isGreaterThan: '>', isGreaterThanOrEqual: '>=', isLessThan: '<', isLessThanOrEqual: '<=' }[helper];
    // `double(?) < N`: the helper is !GT && !EQ (true for null and NaN); `!(x >= N)` is the same
    // answer for every box, where a plain `<` is false for both
    if ((token === '<') && (left.kind === 'name') && [ 'double', 'double?' ].includes (left.type) && (right.kind === 'integer-literal')) {
        return `(!(${leftText} >= ${rightText}))`;
    }
    const nullable = (o) => (o.kind === 'name') && [ 'Int64?', 'long?' ].includes (o.type);
    const integer = (o) => nullable (o) || (o.kind === 'integer-literal') || ((o.kind === 'name') && [ 'int', 'Int64', 'long' ].includes (o.type));
    if ((token === undefined) || !integer (left) || !integer (right) || (!nullable (left) && !nullable (right))) {
        return undefined;
    }
    const L = leftText;
    const R = rightText;
    const core = `${L} ${token} ${R}`;
    if (token === '>') {
        return nullable (right) ? `(${nullable (left) ? L + ' != null && ' : ''}(${R} == null || ${core}))` : `(${core})`;
    }
    if (token === '<') {
        return nullable (left) ? `(${nullable (right) ? R + ' != null && ' : ''}(${L} == null || ${core}))` : `(${core})`;
    }
    if (token === '>=') {
        return nullable (right) ? `(${R} == null || ${core})` : `(${core})`;
    }
    return nullable (left) ? `(${L} == null || ${core})` : `(${core})`;
}

// final pass after the declared-helper rewrites: mathMin/mathMax on two declared integers of
// one kind -> Math.Min/Max, a guarded `Int64?` request value -> `.Value`, `isTrue((x))` on bool/bool?
export function nativeDeclaredHelperCalls (content: string, objectNull = true): string {
    const baseOut = csharpParamsBagGetValue (csharpArithmeticNullableCompare (csharpNonNullDivModNegate (csharpDigitLiteralEquality (csharpObjectNumericLocalRetype (csharpDeclaredGetValue (csharpStringAddEqualityTruth (csharpPureKeyInOp (csharpCounterAndGuardedMath (csharpDeclaredIntMinMaxTruth (csharpNonNullIntCompare (csharpWsAndIndexGetValue (nativeDeclaredHelperCallsBase (content, objectNull)))))))))))));
    const inlineHelperSwitchOut = csharpInlineHelperSwitch (objectNull, baseOut);
    const typedSubMulOut = csharpTypedSubtractMultiply (objectNull, inlineHelperSwitchOut);
    const typedSubMulAgainOut = csharpTypedSubtractMultiply (objectNull, typedSubMulOut);
    return csharpStringEncodeIdentity (csharpTypedRowCaches (csharpTupleSlotRead (objectNull, csharpNativeParseCalls (objectNull, typedSubMulAgainOut)))); // parse, then tuple-slot reads
}

// `this.encode(x)` is `(string)x` (Exchange.Encode.cs): on an operand declared `string`/`string?`
// (every declaration of the name in the member, or a string credential field) it is `x` itself
function csharpStringEncodeIdentity (content: string): string {
    const stringFields = [ 'this.secret', 'this.password', 'this.privateKey', 'this.apiKey', 'this.uid', 'this.walletAddress' ];
    if (!content.includes ('encode(')) {
        return content;
    }
    const lines = content.split ('\n');
    let changed = false;
    const call = /(?<![\w.])(?:this\.)?encode\(((?:this\.)?[A-Za-z_]\w*)\)/g;
    for (let i = 0; i < lines.length; i++) {
        if (!lines[i].includes ('encode(')) {
            continue;
        }
        let start = i;
        while ((start > 0) && !/^    (?:public|private|protected|internal)\b/.test (lines[start])) start--;
        let end = i + 1;
        while ((end < lines.length) && !/^    (?:public|private|protected|internal)\b/.test (lines[end])) end++;
        const proven = (name: string): boolean => {
            if (name.startsWith ('this.')) {
                return stringFields.includes (name);
            }
            const decl = new RegExp ('(?:^|[(,{;]|\\s)([A-Za-z_][\\w.<>\\[\\], ]*?\\??)\\s+' + name + '\\s*(?:=(?!=)|;|,|\\)|\\bin\\b)', 'g');
            let seen = 0;
            for (let k = start; k < end; k++) {
                const text = lines[k].replace (/"(?:[^"\\]|\\.)*"/g, '""');
                for (const m of text.matchAll (decl)) {
                    const type = m[1].trim ().split (/[\s(,]+/).pop ();
                    if ([ 'return', 'else', 'new', 'throw', 'await', 'case', 'in', 'is', 'as' ].includes (type)) {
                        continue;
                    }
                    if ((type !== 'string') && (type !== 'string?')) {
                        return false;
                    }
                    seen++;
                }
            }
            return seen > 0;
        };
        const next = lines[i].replace (call, (all, name) => (proven (name) ? name : all));
        if (next !== lines[i]) {
            lines[i] = next;
            changed = true;
        }
    }
    return changed ? lines.join ('\n') : content;
}

// ws caches Exchange.Options.cs declares with a typed row (`IDictionary<string, IDictionary<string, object>>`):
// the guarded row read already is that row type, so its `(IDictionary<string,object>)` cast is an identity,
// and the base reset stores the typed twin of createSafeDictionary
var csharpTypedRowFieldNames: string[] | undefined;
function csharpTypedRowCaches (content: string): string {
    if (csharpTypedRowFieldNames === undefined) {
        let declared = '';
        try { declared = fs.readFileSync (join (CSHARP_RUNTIME_BASE_DIR, 'Exchange.Options.cs'), 'utf8'); } catch (e) { declared = ''; }
        csharpTypedRowFieldNames = [ ...declared.matchAll (/^[ ]*public IDictionary<string, IDictionary<string, object>> ([A-Za-z_]\w*)$/gm) ].map ((m) => m[1]);
    }
    for (const name of csharpTypedRowFieldNames) {
        if (!content.includes ('this.' + name)) continue;
        const f = 'this\\.' + name;
        const row = new RegExp ('\\(\\(IDictionary<string,object>\\)(\\(' + f + ' != null && ([A-Za-z_]\\w*) != null && ' + f + '\\.ContainsKey\\(\\2\\) \\? ' + f + '\\[(?:\\(string\\))?\\2\\] : null\\))\\)', 'g');
        content = content.replace (row, '$1').replace (new RegExp ('^([ ]*' + f + ' = this\\.createSafeDictionary)\\(', 'gm'), '$1<IDictionary<string, object>>(');
        content = csharpTypedRowNestedReads (content, name);
    }
    return content;
}

// getValue/inOp(<guarded row read>, k) on a typed-row cache with a literal or declared string/string? key: one
// TryGetValue chain (GetValue/InOp's dictionary branch: a null row or key reads null / false, a missing key null / false)
function csharpTypedRowNestedReads (content: string, name: string): string {
    const f = 'this\\.' + name;
    const call = new RegExp ('(?<![\\w.])(getValue|inOp)\\(\\(' + f + ' != null && ([A-Za-z_]\\w*) != null && ' + f + '\\.ContainsKey\\(\\2\\) \\? ' + f + '\\[(?:\\(string\\))?\\2\\] : null\\), ("[^"\\\\]*"|[A-Za-z_]\\w*)\\)', 'g');
    let n = (content.match (new RegExp ('\\bout var ' + name + 'Row\\d+', 'g')) ?? []).length; // out-var names stay unique in the file
    return csharpLinePass (content, false, (region, original) => {
        if (!call.test (original)) return undefined;
        call.lastIndex = 0;
        let changed = false;
        const out = original.replace (call, (whole, helper, symbol, key) => {
            const literal = key.startsWith ('"');
            const types = literal ? [] : [ ...csharpTypedBindings (region, key) ];
            if (!literal && ((types.length === 0) || !types.every ((t) => (t === 'string') || (t === 'string?')) || csharpRebinds (region, key))) return whole;
            n++;
            changed = true;
            const head = `${'this.' + name} != null && ${symbol} != null && ${'this.' + name}.TryGetValue(${symbol}, out var ${name}Row${n}) && ${name}Row${n} != null${literal ? '' : ' && ' + key + ' != null'} && `;
            return (helper === 'inOp') ? `(${head}${name}Row${n}.ContainsKey(${key}))` : `(${head}${name}Row${n}.TryGetValue(${key}, out var ${name}Value${n}) ? ${name}Value${n} : null)`;
        });
        return changed ? out : undefined;
    });
}

function csharpDeclaredIntMinMaxTruth (content: string): string {
    if (!/(?<![\w.])(?:mathMin|mathMax|isTrue)\(/.test (content)) {
        return content;
    }
    return csharpLinePass (content, false, declaredIntMinMaxTruthLine);
}

// one name of the method: its single declared C# type at `line`, written nowhere else by ref/out
function methodNameType (region: CsharpRegion, name: string, line: number): string | undefined {
    if (!/^[A-Za-z_]\w*$/.test (name)) return undefined;
    const t = csharpHelperReceiverType (region, name, line, region.params);
    if (t === undefined) return undefined;
    const sink = new RegExp ('\\b(?:ref|out)[ ]+' + name + '\\b');
    for (let k = region.start + 1; k < region.end; k++) {
        if (sink.test (region.lines[k])) return undefined;
    }
    return t.type.replace (/^long(\??)$/, 'Int64$1');
}

// `isTrue((m.ContainsKey("spot") ? m["spot"] : null))` on a market row local: the key holds a bool or
// nothing on every row writer (MARKET_ROW_BOOL_KEYS), so `(x as bool?) == true` equals isTrue's answer
function marketBoolRead (region: CsharpRegion, arg: string, line: number): string | undefined {
    const m = NATIVE_MARKET_KEY_READ_RE.exec (arg);
    if ((m === null) || ((m[1] !== undefined) && (m[1] !== m[2])) || !MARKET_ROW_BOOL_KEYS.includes (m[3])) return undefined;
    const name = m[2];
    if (region.params[name] !== undefined) return undefined;
    const all = region.declarations.filter ((d) => d.name === name);
    if ((all.length !== 1) || (all[0].line >= line) || !/^I?Dictionary<string, object>\??$/.test (all[0].type) || !NATIVE_MARKET_ROW_CALL_RE.test (all[0].value)) return undefined;
    // the row is bound once and no key of it is written in the method
    const write = new RegExp ('(?:\\b' + name + '[ ]*=[^=>]|\\b' + name + '\\[[^\\]]*\\][ ]*=[^=]|\\b(?:ref|out)[ ]+' + name + '\\b)');
    for (let k = region.start + 1; k < region.end; k++) {
        if ((k !== all[0].line) && write.test (region.lines[k])) return undefined;
    }
    return `((${arg} as bool?) == true)`;
}

function declaredIntMinMaxTruthLine (region: CsharpRegion, original: string, masked: string, line: number): string | undefined {
    const edits = [];
    const call = /(?<![\w.])(mathMin|mathMax|isTrue)\(/g;
    let m;
    while ((m = call.exec (masked)) !== null) {
        const open = m.index + m[0].length - 1;
        const close = csharpHelperCallEnd (masked, open);
        if (close === undefined) continue;
        if (m[1] === 'isTrue') {
            const read = marketBoolRead (region, original.substring (open + 1, close).trim (), line);
            if (read !== undefined) {
                edits.push ({ start: m.index, end: close + 1, text: read });
                continue;
            }
            const inner = /^\(([A-Za-z_]\w*)\)$/.exec (masked.substring (open + 1, close).trim ());
            const type = (inner === null) ? undefined : methodNameType (region, inner[1], line);
            if (type === 'bool') edits.push ({ start: m.index, end: close + 1, text: inner[1] });
            if (type === 'bool?') edits.push ({ start: m.index, end: close + 1, text: `(${inner[1]} == true)` });
            continue;
        }
        const comma = csharpHelperTopLevelComma (masked, open, close);
        if ((comma === undefined) || (csharpHelperTopLevelComma (masked, comma, close) !== undefined)) continue;
        // the result is a value, never a receiver
        if (/^[ ]*[.\[]/.test (masked.substring (close + 1))) continue;
        const a = masked.substring (open + 1, comma).trim ();
        const b = masked.substring (comma + 1, close).trim ();
        const text = declaredIntMinMax (region, original, masked, line, m[1] === 'mathMin' ? 'Min' : 'Max', a, b);
        if (text !== undefined) edits.push ({ start: m.index, end: close + 1, text });
    }
    return (edits.length === 0) ? undefined : applyRegionEdits (original, edits);
}

// both names `int` or both `Int64`: Math.Min/Max returns the same value in the same box as the
// helper's original operand. A dominated-non-null `Int64?` meets an `int` name/literal only as a
// request field value (`request["k"] = ...` / `{ "k", ... }`): urlencode/json print Int32/Int64 alike
function declaredIntMinMax (region: CsharpRegion, original: string, masked: string, line: number, name: string, a: string, b: string): string | undefined {
    const literal = (x) => /^[0-9]{1,9}$/.test (x);
    const ta = literal (a) ? 'int' : methodNameType (region, a, line);
    const tb = literal (b) ? 'int' : methodNameType (region, b, line);
    if ((ta === undefined) || (tb === undefined)) return undefined;
    const guarded = (x) => {
        const prev = (region.lines[line - 2] ?? '').trim ();
        return (region.lines[line - 1] ?? '').trim () === '{' && (prev === `if ((${x} != null))` || prev === `if (${x} != null)`);
    };
    // two Int64 names, or an Int64 beside a dominated-non-null Int64? (boxed as Int64): one Int64 box either way
    const wide = (t, x) => (t === 'Int64') || ((t === 'Int64?') && guarded (x));
    if (wide (ta, a) && wide (tb, b) && ((ta === 'Int64') || (tb === 'Int64'))) {
        return `Math.${name}(${(ta === 'Int64?') ? a + '.Value' : a}, ${(tb === 'Int64?') ? b + '.Value' : b})`;
    }
    const field = /^[ ]*(?:[A-Za-z_]\w*\["[^"]*"\][ ]*=[ ]*(?:mathMin|mathMax)\([^;]*\);|\{[ ]*"[^"]*",[ ]*(?:mathMin|mathMax)\([^;]*\)[ ]*\},?)[ ]*$/.test (masked);
    if (!field) return undefined;
    if ((ta === 'Int64?') && (tb === 'int') && guarded (a)) return `Math.${name}(${a}.Value, ${b})`;
    return undefined;
}

// a `check (name, body, expected, forbidden?)` closure: `run (body)` must contain `expected`, not `forbidden`,
// and be a fixed point of `again` when given; a failure reports `label: name` and the (tail of the) output
function snippetChecker (problems: string[], label: string, run: (body: string) => string, again?: (out: string) => string, tail?: number) {
    return (name: string, body: string, expected: string, forbidden?: string) => {
        const out = run (body);
        if (!out.includes (expected) || ((forbidden !== undefined) && out.includes (forbidden)) || ((again !== undefined) && (again (out) !== out))) {
            problems.push (`${label}: ${name}\n${(tail === undefined) ? out : out.slice (-tail)}`);
        }
    };
}

// `assert.ok` / `console.log ('FAIL …')` stand-ins that push `label: …` problems
function selfTestSink (problems: string[], label: string) {
    return {
        assert: { ok: (cond: any, msg?: string) => { if (!cond) { problems.push (`${label}: ${String (msg).slice (0, 300)}`); } } },
        console: { log: (...a: any[]) => { const s = a.join (' '); if (s.startsWith ('FAIL')) { problems.push (`${label}: ${s.slice (0, 300)}`); } } },
    };
}

// a fresh printer for one self-test block (the module tail is not initialised yet when runMain starts)
function selfTestTranspiler (): any {
    const transpiler = new Transpiler ({ verbose: false, csharp: { parser: { NUM_LINES_END_FILE: 0, 'ELEMENT_ACCESS_WRAPPER_OPEN': 'getValue(', 'ELEMENT_ACCESS_WRAPPER_CLOSE': ')' } } } as any);
    setupCsharpPrinter (transpiler);
    return transpiler;
}

// snippet checks for the C# native-emission passes (`csharpTranspiler.ts --self-test`)
export function csharpNativeEmissionSelfTest (): string[] {
    const problems: string[] = [];
    // `FAIL <name>` per failed row plus a failure count
    const counted = (label: string, run: (body: string) => string, rows: string[][]) => {
        const failed = rows.filter (([ name, body, expected, forbidden ]) => {
            const out = run (body);
            return !out.includes (expected) || ((forbidden !== undefined) && out.includes (forbidden));
        });
        problems.push (...failed.map (([ name ]) => `${label}: ${('FAIL ' + name).slice (0, 300)}`));
        if (failed.length) { problems.push (`${label}: ${failed.length} case(s) failed`); }
    };
    const omitHost = 'omit (o, k) { return o; }\n extend (a, b) { return a; }\n safeString (o, k, d = undefined): string { return d; }\n';
    const cacheBody = 'handleOrder (client, message, isTrigger) { if (this.orders === undefined) { this.orders = new ArrayCacheBySymbolById (10); this.triggerOrders = new ArrayCacheBySymbolById (10); } const stored = isTrigger ? this.triggerOrders : this.orders; stored.append (message); client.resolve (stored, \'x\'); }';
    const rowHost = 'safeMarket (id, m = undefined, d = undefined, t = undefined): MarketInterface { return m; }\n safeBool (o, k, d = undefined): boolean { return d; }\n';
    const nativeAdd = selfTestTranspiler ();
    counted ('csharp native emission self test native add', (body) => nativeAdd.transpileCSharp ('type Int = number; class Test {\n safeInteger (o, k, d = undefined): Int { return d; }\n seconds (): Int { return 1; }\n' + body + '\n}').content, [
        [ 'int local + int literal -> Int64 operator',
            'f (xs) { for (let i = 0; i < xs.length; i++) { const v = [ i + 1 ]; xs.push (v); } }', '(i + 1L)', 'add(i, 1)' ],
        [ 'Int64? non-null default + Int64?(guarded)',
            'f (o) { const a = this.safeInteger (o, "a", 5); const b = this.safeInteger (o, "b"); if (b !== undefined) { return a + b; } return 0; }', '(a + b)', 'add(a, b)' ],
        [ 'Int64? unguarded keeps helper',
            'f (o) { const a = this.safeInteger (o, "a", 5); const b = this.safeInteger (o, "b"); return a + b; }', 'add(a, b)' ],
        [ 'seconds() + safeInteger with default',
            'f (o) { return this.seconds () + this.safeInteger (o, "x", 60); }', '(this.seconds() + this.safeInteger(o, "x", 60))' ],
        [ 'Int64? guarded + double keeps helper',
            'f (o) { const b = this.safeInteger (o, "b"); const d = 1.5; if (b !== undefined) { return b + d; } return 0; }', 'add(b, d)' ],
        [ 'Int64? rebound keeps helper',
            'f (o) { const a = this.safeInteger (o, "a", 5); let b = this.safeInteger (o, "b"); if (b !== undefined) { b = this.safeInteger (o, "c"); return a + b; } return 0; }', 'add(a, b)' ],
        [ 'int + guarded Int64? right',
            'f (o, xs) { const b = this.safeInteger (o, "b"); if (b === undefined) { return 0; } return xs.length + b; }', '(getArrayLength(xs) + b)', 'add(' ],
        [ 'int + int local keeps helper',
            'f (xs) { for (let i = 0; i < xs.length; i++) { const j = xs.length; xs.push (i + j); } }', 'add(i, j)' ],
        // integer-literal counters print Int64, so the compare/equality/add passes fire
        [ 'counter += 1 with compare + equality',
            'f (o) { let retry = 0; const m = this.safeInteger (o, "m", 10); while (retry < m) { retry += 1; if (retry === m) { return 1; } } return 0; }', 'Int64 retry = 0;', 'object retry' ],
        [ 'counter n = n + 1 read by numberToString',
            'numberToString (x): string { return x; }\n f (o) { let calls = 0; while (calls < 3) { calls = calls + 1; const s = "c" + this.numberToString (calls); } }', 'Int64 calls = 0;' ],
        [ 'counter returned keeps object',
            'f (o) { let n = 0; n += 1; return n; }', 'object n = 0;' ],
        [ 'counter vs double literal keeps object',
            'f (o) { let n = 0; n += 1; return n === 1.5; }', 'object n = 0;' ],
        [ 'counter -= keeps object',
            'f (o) { let n = 0; n += 1; n -= 1; return n > 0; }', 'object n = 0;' ],
        [ 'counter rebound from safeInteger keeps object',
            'f (o) { let n = 0; n += 1; n = this.safeInteger (o, "x"); return n > 0; }', 'object n = 0;' ],
        [ 'counter += double keeps object',
            'f (o) { let n = 0; n += 1.5; return n > 0; }', 'object n = 0;' ],
        // 77c2: conditional initialisers whose arms both have a proven C# type
        [ '77c2 c ? this.omit (params, k) : params -> IDictionary',
            omitHost + ' fetchLedger (code: string = undefined, params = {}) { const u = this.safeString (params, "until"); const p = (u !== undefined) ? this.omit (params, [ "until" ]) : params; return this.extend ({}, p); }',
            'IDictionary<string, object> p = ((IDictionary<string, object>)(((u != null)) ? this.omit(parameters, new List<object>() {"until"}) : parameters));' ],
        [ '77c2 omit ternary on a written params keeps object',
            omitHost + ' fetchLedger (code: string = undefined, params = {}) { params = this.extend (params, {}); const p = (code !== undefined) ? this.omit (params, "x") : params; return p; }',
            'object p = ' ],
        // stack-77c: with 77c1 (fetchLedger's params bag is IDictionary) and 77c5 (copies/extend of a typed bag)
        // `q` is a proven Dictionary, so this arm pair is now typed; the untyped-other-local guard is the next case.
        [ '77c2 omit ternary over another local keeps object',
            omitHost + ' fetchLedger (code: string = undefined, params = {}) { const q = this.extend (params, {}); const p = (code !== undefined) ? this.omit (params, "x") : q; return p; }',
            'Dictionary<string, object> q = this.extend(parameters, ' ],
        [ '77c2 omit ternary over an untyped local keeps object (stack-77c)',
            omitHost + ' fetchLedger (code: string = undefined, params = {}) { const q = code; const p = (code !== undefined) ? this.omit (params, "x") : q; return p; }',
            'object p = ' ],
        // stack-77c: 77c5's core-parameter copy rule answers first with the core `string` type of `symbol`
        [ '77c2 c ? "lit" : <string parameter> -> string?',
            'async fetchTicker (symbol: string, params = {}) { const s = (symbol === undefined) ? "BTC/USDT" : symbol; return s; }',
            'string s = ((symbol == null)) ? "BTC/USDT" : symbol;', 'object s = ' ],
        [ '77c2 c ? this.omit (<Dictionary local>, k) : <same local> -> Dictionary',
            omitHost + ' f (o) { const d = this.extend (o, {}); const p = (o !== undefined) ? this.omit (d, "x") : d; return p; }',
            'Dictionary<string, object> p = ((o != null)) ? this.omit(d, "x") : d;' ],
        [ '77c2 c ? "lit" : <untyped parameter> keeps object',
            'f (x) { const s = (x === undefined) ? "BTC/USDT" : x; return s; }',
            'object s = ' ],
        // 84c2: conditional initialisers over cast-proven arms / the printer's null-guard concat
        [ '84c2 c ? this.triggerOrders : this.orders -> ArrayCache with a native append',
            cacheBody, 'ccxt.pro.ArrayCache stored = ((ccxt.pro.ArrayCache)(isTrue(isTrigger) ? this.triggerOrders : this.orders));', 'object stored = ' ],
        [ '84c2 triggerOrders written with a non-cache value keeps object',
            cacheBody.replace ('client.resolve', 'this.triggerOrders = message; client.resolve'), 'object stored = ' ],
        [ '84c2 null-guard concat over a string-or-null local -> string?',
            'f (o, d: string) { let m = undefined; if (o) { m = \'x\'; } const md = m + d; return md; }',
            'string? md = (m == null ? null : m + (string)(object)(d));', 'object md = ' ],
        [ '84c2 c ? <int literal> : <native Int64 Math.Min> -> Int64 with no cast',
            'async fetchOHLCV (symbol: string, timeframe = \'1m\', since: Int = undefined, limit: Int = undefined, params = {}) { const request = {}; const n = (limit === undefined) ? 100 : Math.min (limit, 1000); request[\'limit\'] = n; const d = n * 60; return d; }',
            'Int64 n = ((limit == null)) ? 100 : Math.Min(limit.Value, 1000);', 'object n = ' ],
        [ '84c2 c ? <int literal> : <mathMin helper> keeps object',
            'f (limit: Int = undefined) { const n = (limit === undefined) ? 100 : Math.min (limit, 1000); return n; }',
            'object n = ((limit == null)) ? 100 : mathMin(limit, 1000);' ],
        [ '84c2 c ? market[quote] : market[base] read as a key -> string?',
            rowHost + ' f (marketId, balances: Dict) { const market = this.safeMarket (marketId, undefined, undefined, \'contract\'); const code = (this.safeBool (market, \'linear\', false)) ? market[\'quote\'] : market[\'base\']; if (code in balances) { return balances[code]; } return code; }',
            'string? code = ((string)((this.safeBool(market, "linear", false) == true) ? ', 'object code = ' ],
        [ '84c2 c ? market[quote] : market[base] never a key keeps object',
            rowHost + ' f (marketId) { const market = this.safeMarket (marketId, undefined, undefined, \'contract\'); const code = (this.safeBool (market, \'linear\', false)) ? market[\'quote\'] : market[\'base\']; return { \'code\': code }; }',
            'object code = ' ],
        // 87c2 R1: a literal-key element read whose first write is an unconditional push -> IList<object>
        [ '87c2 literal-key read pushed in its block -> IList with a native Add',
            'f (eventGroup: Dict, m) { const groupMarkets = eventGroup[\'markets\']; groupMarkets.push (m); eventGroup[\'markets\'] = groupMarkets; }',
            'groupMarkets.Add(m);', 'object groupMarkets = ' ],
        [ '87c2 literal-key read pushed only inside a branch keeps object',
            'f (eventGroup: Dict, m) { const groupMarkets = eventGroup[\'markets\']; if (m) { groupMarkets.push (m); } return groupMarkets; }',
            'object groupMarkets = ' ],
        // 90c2 R2: arms are parameters the printed signature names IList<object>; R3/R4: element reads of local literal maps
        // (R2 needs the printed IList<object> signature, which only the corpus run records: gated on the farm)
        [ '90c2 c ? <object param> : <object param> keeps object',
            'f (xs, zs, m) { const ys = (m === undefined) ? zs : xs; return ys.length; }',
            'object ys = ' ],
        [ '90c2 read of a local string-literal map used as a key -> string?',
            'f (has: Dict, k) { const fb: Dict = { \'a\': \'b\' }; const s = fb[k]; if (s in has) { has[k] = has[s]; } }',
            'string? s = ((string)(', 'object s = ' ],
        [ '90c2 read of a local string-literal map never used as a key keeps object',
            'f (k) { const fb: Dict = { \'a\': \'b\' }; const s = fb[k]; return s; }',
            'object s = ' ],
        [ '90c2 read of a local list-literal map with write-back -> List with a native element write',
            'safeValue (o, k) { return o; }\n f (n: number, p: number) { const cs = {}; const k = n.toString (); if (!(k in cs)) { cs[k] = [ p, p ]; } else { const c = cs[k]; c[1] = p; cs[k] = c; } return this.safeValue (cs, k); }',
            'c[Convert.ToInt32(1)] = p;', 'object c = ' ],
        // conditional initialisers handed to typed consumers: a typed-dict string arm into a string slot; a string-tested arm
        [ 'c ? dict[code] : undefined handed to a string parameter -> string? with no call-site cast',
            'filterByCurrencySinceLimit (a, code: Str = undefined, s = undefined, l = undefined) { return a; }\n f (rows, m) { const c = { \'code\': \'BTC\' }; const code = (m !== undefined) ? c[\'code\'] : undefined; return this.filterByCurrencySinceLimit (rows, code, 1, 2); }',
            'string? code = ((string)(', 'object code = ((' ],
        [ 'c ? dict[code] : undefined never handed to a string parameter keeps object',
            'f (rows, m) { const c = { \'code\': \'BTC\' }; const code = (m !== undefined) ? c[\'code\'] : undefined; return { \'code\': code }; }',
            'object code = ' ],
        [ 'p.endsWith (x) ? p.slice (..) : p read by a string method -> string?',
            'f (p) { const u = p.endsWith (\'utc\') ? p.slice (0, -3) : p; return u.toLowerCase (); }',
            'string? u = ((string)(', 'object u = ' ],
        [ 'p.endsWith (x) ? p.slice (..) : p never read by a string method keeps object',
            'f (p) { const u = p.endsWith (\'utc\') ? p.slice (0, -3) : p; return { \'u\': u }; }',
            'object u = ' ],
        [ 'c ? lit : <unwritten Str param> compared to literals -> string? with native ==',
            'f (type: Str, postOnly) { let t: Str = postOnly ? \'post_only\' : type; if (postOnly) { t = \'ioc\'; } if (t === \'limit\' || t === \'ioc\') { return 1; } return 0; }',
            'string? t = ((string)(', 'object t = ' ],
        // (venue sources only, the in-memory snippet tier keeps object: the positive case is proven on the farm)
        [ 'dict[lit] read as a string receiver outside a venue source keeps object',
            'f (d: Dict, k): string { const u = d[\'stock\']; if (k) { return u.replace (\'/ws\', \'/stream\'); } return u; }',
            'object u = ' ],
        [ 'dict[lit] read also stored in a map keeps object',
            'f (d: Dict, k) { const u = d[\'stock\']; const r = u.replace (\'/ws\', \'/stream\'); return { \'u\': u, \'r\': r }; }',
            'object u = ' ],
        [ 'c ? lit : <written Str param> keeps object',
            'f (type: Str, postOnly) { type = \'x\'; let t: Str = postOnly ? \'post_only\' : type; if (t === \'limit\') { return 1; } return 0; }',
            'object t = ' ],
        // conditional of a literal and a typed string local, read only as a guarded `+` left operand
        [ 'c ? lit : <string? local> read only as a + left -> string? with no object box at the read',
            'safeString (o, k, d = undefined) { return d; }\n f (c, o) { const s = this.safeString (o, \'k\'); const m = c ? \'/a\' : s; const t = m + \':\' + o; return t; }',
            'string? m = isTrue(c) ? ', 'object m = ' ],
        [ 'c ? lit : <string? local> also stored in a map keeps object',
            'safeString (o, k, d = undefined) { return d; }\n f (c, o) { const s = this.safeString (o, \'k\'); const m = c ? \'/a\' : s; const t = m + \':\' + o; return { \'m\': m, \'t\': t }; }',
            'object m = ' ],
        [ 'the guarded concat over that local needs no declaration cast',
            'safeString (o, k, d = undefined) { return d; }\n f (c, o) { const s = this.safeString (o, \'k\'); const m = c ? \'/a\' : s; const t = m + \':\' + o; return t; }',
            'string? t = (m == null ? null : ', 'string? t = ((string)(' ],
    ]);
    // a `namespace Tests;` body is the whole file
    counted ('arithmetic twins', (body) => csharpNativeArithmetic (body.startsWith ('namespace Tests;') ? body : 'namespace ccxt;\npublic partial class t : Exchange\n{\n    public virtual object f(object since, Int64? limit = null)\n    {\n' + body + '\n    }\n}\n'), [
        [ 'int * Int64? -> lifted *', '        int duration = this.parseTimeframe(tf);\n        Int64? n = limit;\n        return subtract(since, multiply(duration, n));', 'subtract(since, (duration * n))' ],
        [ 'Int64? * int literal', '        Int64? n = limit;\n        object p = multiply(n, 2);', 'object p = (n * 2);' ],
        [ 'nested twin result * literal', '        int duration = 60;\n        int maxLimit = 300;\n        Int64 d = multiply(multiply(duration, maxLimit), 1000);', 'Int64 d = (multiply(duration, maxLimit) * 1000);' ],
        [ 'int * int stays (Int32 overflow vs Int64 twin)', '        int a = 60;\n        int b = 300;\n        object d = multiply(a, b);', 'multiply(a, b)' ],
        [ 'int * int literal widens', '        int a = 60;\n        object d = multiply(a, 1000);', 'object d = (a * 1000L);' ],
        [ 'object operand stays', '        object a = 60;\n        Int64 b = 3;\n        object d = multiply(a, b);', 'multiply(a, b)' ],
        [ 'Int64? subtract stays (helper NRE on null)', '        Int64? a = limit;\n        object d = subtract(a, 1);', 'subtract(a, 1)' ],
        [ 'Int64 - int', '        Int64 now = this.milliseconds();\n        int d = 5;\n        object x = subtract(now, d);', 'object x = (now - d);' ],
        [ 'double multiply stays (Int64 re-box)', '        double a = 1.5;\n        double b = 2.0;\n        object x = multiply(a, b);', 'multiply(a, b)' ],
        [ 'Int64 / Int64 -> double division', '        Int64 a = 5;\n        Int64 b = 2;\n        object x = divide(a, b);', 'object x = ((double)a / b);' ],
        [ 'Int64? / int -> lifted double division', '        Int64? a = limit;\n        object x = divide(a, 1000);', 'object x = ((double?)a / 1000);' ],
        [ 'double? / Int64 stays (object overload)', '        double? a = null;\n        Int64 b = 2;\n        object x = divide(a, b);', 'divide(a, b)' ],
        [ 'lambda-bound name stays', '        Int64 a = 5;\n        Func<object, object> g = (a) => multiply(a, 2);', 'multiply(a, 2)' ],
        [ 'string literal argument untouched', '        Int64 a = 5;\n        object x = add(multiply(a, 2), \"s, t\");', 'add((a * 2), \"s, t\")' ],
        [ 'bare operator operand is wrapped', '        Int64 a = 5;\n        int b = 2;\n        object x = divide(a - b, 1000);', 'object x = ((double)(a - b) / 1000);' ],
        [ 'test tier untouched', '', 'public virtual object f' ],
        [ 'tests namespace', 'namespace Tests;\npublic partial class t\n{\n    public void f()\n    {\n        Int64 a = 1;\n        object x = multiply(a, 2);\n    }\n}\n', 'multiply(a, 2)' ],
    ]);
    // [ body, expected (undefined: the helper stays), extra member ]: nativeDeclaredHelperCalls inside a one-method class
    const hasOrKeeps = (label: string, signature: string, stays: (out: string) => boolean, rows: [string, string | undefined, string?][], tests = false) => {
        const { assert } = selfTestSink (problems, label);
        const wrap = (body: string, extra?: string) => [ 'namespace ccxt;', 'public partial class test : Exchange', '{', '    public virtual object ' + signature, '    {',
            ...body.split ('\n').map ((l) => '        ' + l), '    }', ...((extra === undefined) ? [] : [ extra ]), '}' ].join ('\n');
        for (const [ body, expected, extra ] of rows) {
            const out = nativeDeclaredHelperCalls (wrap (body, extra ?? (tests ? '' : undefined)));
            if (expected !== undefined) assert.ok (out.includes (expected), `expected ${expected}\n${out}`);
            else assert.ok (stays (out), `expected the helper to stay\n${out}`);
        }
        if (tests) {
            // the test tier: `this` is the harness, not an Exchange
            const out = nativeDeclaredHelperCalls (wrap ('if (isEqual(this.safeValue(response, "a"), null)) { }', '').replace ('namespace ccxt;', 'namespace Tests;'));
            assert.ok (out.includes ('isEqual('), out);
        }
    };
    // positives, then negatives: numeric-looking strings, numbers, untyped operands, value types vs null, shadowed fields, mixed signatures
    hasOrKeeps ('csharp native emission self test native equality', 'parseX(IDictionary<string, object> market, object response, List<object> rows)',
        (out) => out.includes ('isEqual(') || out.includes ('(((object)(') || out.includes ('static (c34x, c34y) =>'), [ // exact inline forms
        [ 'if (isEqual(getValue(response, "a"), null)) { }', '((getValue(response, "a") == null))' ],
        [ 'if (!isEqual(getValue(response, "a"), null)) { }', '(!(getValue(response, "a") == null))' ],
        [ 'if (isEqual(getValue(response, "spot"), true)) { }', '((getValue(response, "spot") is true))' ],
        [ 'if (isEqual(getValue(response, "kind"), "lit")) { }', '((getValue(response, "kind") is "lit"))' ],
        [ 'if (isEqual("lit", getValue(response, "kind"))) { }', '((getValue(response, "kind") is "lit"))' ],
        [ 'if (isEqual(this.safeValue(response, "fees"), null)) { }', '((this.safeValue(response, "fees") == null))' ],
        [ 'if (isEqual(this.safeBool(response, "x"), true)) { }', '((this.safeBool(response, "x") == true))' ],
        [ 'if (isEqual(this.safeString(response, "x"), "lit")) { }', '((this.safeString(response, "x") == "lit"))' ],
        [ 'if (isEqual(this.safeNumber(response, "x"), null)) { }', '((this.safeNumber(response, "x") == null))' ],
        [ 'if (isEqual((market != null && market.ContainsKey("linear") ? market["linear"] : null), true)) { }',
            '(((market != null && market.ContainsKey("linear") ? market["linear"] : null) is true))' ],
        [ 'if (isEqual((rows != null && 1 < rows.Count ? rows[1] : null), "")) { }', '(((rows != null && 1 < rows.Count ? rows[1] : null) is ""))' ],
        [ 'if (isEqual(this.apiKey, "")) { }', '((this.apiKey == ""))' ],
        [ 'if (isEqual(this.handleErrorMessage(null, response), true)) { }', '((this.handleErrorMessage(null, response) == true))',
            '    public virtual bool? handleErrorMessage(WebSocketClient client, object message) { return null; }' ],
        [ 'if (isEqual(getValue(response, "a"), "1")) { }', undefined ],
        [ 'if (isEqual(getValue(response, "a"), "NaN")) { }', undefined ],
        [ 'if (isEqual(getValue(response, "a"), 0)) { }', undefined ],
        [ 'if (isEqual(this.safeValue(response, "a"), "1.0")) { }', undefined ],
        [ 'if (isEqual(this.safeInteger(response, "a"), 1)) { }', undefined ],
        [ 'if (isEqual(this.rateLimit, -1)) { }', undefined ],
        [ 'if (isEqual(this.unknownThing(response), null)) { }', undefined ],
        [ 'if (isEqual(this.safeBool(response, "x"), "lit")) { }', undefined ],
        [ 'if (isEqual(this.apiKey, "")) { }', undefined, '    public string apiKey = "";' ],
        [ 'if (isEqual(this.handleErrorMessage(null, response), true)) { }', undefined,
            '    public virtual bool? handleErrorMessage(WebSocketClient client, object message) { return null; }\n    public virtual object handleErrorMessage(object message) { return null; }' ],
        [ 'if (isEqual((other != null && other.ContainsKey("k") ? other["k"] : null), true)) { }', undefined ],
        [ 'if (isEqual(getValue(response, "a"), getValue(response, "b"))) { }', undefined ],
    ], true);
    // positives, then negatives: doubles, object, expressions, rebinding with another type
    hasOrKeeps ('nullable comparisons', 'fetchX(Int64? since = null, Int64? limit = null, object parameters = null)', (out) => /is(Less|Greater)Than|c32Gt\(/.test (out), [
        [ 'if (isLessThan(limit, 26)) { }', '((limit == null || limit < 26))' ],
        [ 'Int64 allowed = 5;\nif (isLessThan(since, allowed)) { }', '((since == null || since < allowed))' ],
        [ 'Int64? a = this.safeInteger(parameters, "a");\nInt64? b = this.safeInteger(parameters, "b");\nif (isGreaterThanOrEqual(a, b)) { }', '((b == null || a >= b))' ],
        [ 'Int64? a = this.safeInteger(parameters, "a");\nInt64? b = this.safeInteger(parameters, "b");\nif (isLessThan(a, b)) { }', '((b != null && (a == null || a < b)))' ],
        [ 'Int64? a = this.safeInteger(parameters, "a");\nInt64? b = this.safeInteger(parameters, "b");\nif (isGreaterThan(a, b)) { }', '((a != null && (b == null || a > b)))' ],
        [ 'if (isLessThanOrEqual(limit, 100)) { }', '((limit == null || limit <= 100))' ],
        [ 'if (isGreaterThan(100, limit)) { }', '((limit == null || 100 > limit))' ],
        [ 'if (isGreaterThanOrEqual(5, limit)) { }', '((limit == null || 5 >= limit))' ],
        [ 'if (isLessThan(5, limit)) { }', '((5 < limit))' ],
        [ 'double? x = this.safeNumber(parameters, "x");\nif (isLessThan(x, 0)) { }', '((!(x >= 0)))' ],
        [ 'object x = this.safeValue(parameters, "x");\nif (isLessThan(x, limit)) { }', undefined ],
        [ 'if (isLessThan(this.safeInteger(parameters, \"a\"), limit)) { }', undefined ],
        [ 'if (isLessThan(limit, 1.5)) { }', undefined ],
        [ 'if (true)\n{\n    Int64? x = 1;\n}\nelse\n{\n    object x = 2;\n    if (isLessThan(x, 3)) { }\n}', undefined ],
        [ 'uint big = 4000000000;\nif (isLessThan(limit, big)) { }', undefined ],
    ]);
    const exchangeWrap = (signature: string) => (body: string) => 'namespace ccxt;\npublic partial class t : Exchange\n{\n    public virtual object f(' + signature + ')\n    {\n' + body + '\n    }\n}\n';
    const transpiled = (prefix: string) => {
        const transpiler = selfTestTranspiler ();
        return (body: string) => transpiler.transpileCSharp (prefix + body + '\n}').content;
    };
    const groups: [string, () => (body: string) => string, number | undefined, [string, string, string, string?][]][] = [
        // a safeDict* local rewritten through the 2-argument dict-receiver omit stays IDictionary
        [ 'omit-rewritten safeDict local', () => transpiled ('type Dict = any; class Test {\n safeDict (o, k, d = undefined): Dict { return d; }\n omit (o, ...k): any { return o; }\n safeString (o, k): string { return k; }\n'), 600, [
            [ 'omit(self, keys) keeps IDictionary',
                'f (raw) { let p = this.safeDict (raw, "params", {}); p["s"] = 1; p = this.omit (p, [ "a" ]); return this.safeString (p, "b"); }',
                'IDictionary<string, object> p = this.safeDict(', 'object p = ' ],
            [ 'omit(self, key) in a branch keeps IDictionary',
                'f (raw, h) { let p = this.safeDict (raw, "k", {}); if (h) { p = this.omit (p, h); } return p; }',
                'IDictionary<string, object> p = this.safeDict(' ],
            [ '3-argument omit stays object',
                'f (raw, h) { let p = this.safeDict (raw, "k", {}); p = this.omit (p, h, "x"); return p; }', 'object p = this.safeDict(' ],
            [ 'omit of another receiver stays object',
                'f (raw, o) { let p = this.safeDict (raw, "k", {}); p = this.omit (o, "x"); return p; }', 'object p = this.safeDict(' ],
            [ 'null write after omit: a reference local holds null',
                'f (raw) { let p = this.safeDict (raw, "k", {}); p = this.omit (p, "x"); p = undefined; return p; }', 'IDictionary<string, object> p = this.safeDict(' ],
            [ 'list write stays object',
                'f (raw, xs) { let p = this.safeDict (raw, "k", {}); p = this.omit (p, "x"); p = [ xs ]; return p; }', 'object p = this.safeDict(' ],
        ] ],
        // `const x = this.omit (params, …)` on the trailing `params = {}` parameter
        [ 'omit(params) local', () => transpiled ('type Dict = any; class Test {\n omit (o, ...k): any { return o; }\n safeString (o, k): string { return k; }\n'), 600, [
            [ 'omit(params, key) -> IDictionary',
                'fetchX (symbol: string, params: Dict = {}) { const query = this.omit (params, \'a\'); return this.safeString (query, \'b\'); }',
                'IDictionary<string, object> query = ((IDictionary<string, object>)this.omit(parameters, "a"));' ],
            [ 'omit(params, list) -> IDictionary',
                'fetchX (params: Dict = {}) { const query = this.omit (params, [ \'a\', \'b\' ]); return query; }',
                'IDictionary<string, object> query = ((IDictionary<string, object>)this.omit(parameters, new List<object>()' ],
            [ 'sign keeps object (implicit-API list bodies)',
                'sign (path, api = \'public\', method = \'GET\', params: Dict = {}) { const query = this.omit (params, \'a\'); return query; }', 'object query = this.omit(' ],
            [ 'rebound params keeps object',
                'fetchX (params: Dict = {}) { params = this.extend ({}, params); const query = this.omit (params, \'a\'); return query; }', 'object query = this.omit(' ],
            [ 'params without default keeps object',
                'fetchX (params: Dict) { const query = this.omit (params, \'a\'); return query; }', 'object query = this.omit(' ],
            [ 'later list write keeps object',
                'fetchX (xs, params: Dict = {}) { let query = this.omit (params, \'a\'); query = [ xs ]; return query; }', 'object query = this.omit(' ],
        ] ],
        // getValue(list, <Int64 local>) on a declared list
        [ 'Int64 list index', () => (body) => nativeDeclaredHelperCalls (exchangeWrap ('object since, object parameters = null') (body)), undefined, [
            [ 'List<object> x Int64 local', '        List<object> data = this.safeList(parameters, "d", new List<object>() {});\n        int n = data.Count;\n        for (Int64 i = 0; i < n; i++)\n        {\n            Int64 index = ((n - i) - 1);\n            object row = getValue(data, index);\n        }',
                'object row = (data != null && index < data.Count ? data[(int)index] : null);' ],
            [ 'IList<object> x for-counter', '        IList<object> data = this.safeList(parameters, "d");\n        for (Int64 i = 0; i < 3; i++)\n        {\n            object row = getValue(data, i);\n        }',
                'object row = (data != null && i < data.Count ? data[(int)i] : null);' ],
            [ 'object receiver keeps helper', '        object data = this.safeValue(parameters, "d");\n        Int64 index = 1;\n        object row = getValue(data, index);', 'object row = getValue(data, index);' ],
            [ 'Int64? index', '        List<object> data = new List<object>() {};\n        Int64? index = 1;\n        object row = getValue(data, index);', 'object row = (data != null && index != null && index < data.Count ? data[(int)index] : null);' ],
            [ 'index rebound with another type keeps helper', '        List<object> data = new List<object>() {};\n        if (true)\n        {\n            Int64 index = 1;\n            object row = getValue(data, index);\n        } else\n        {\n            object index = 2;\n        }', 'object row = getValue(data, index);' ],
        ] ],
        // native `+` on a left operand proven a non-null string
        [ 'csharp native emission self test native concat', () => transpiled ('class Test {\n safeString (o, k, d = undefined): string { return d; }\n implodeParams (p, o): string { return p; }\n'), undefined, [
            [ 'literal-initialized accumulator += element', 'f (o, xs) { let s = \'\'; for (let i = 0; i < xs.length; i++) { s += \',\'; s += xs[i]; } return s + \'!\'; }', 'return (s + "!")', 'add(s, ",")' ],
            [ '+= conditional right keeps its parentheses', 'f (o, side) { let s = \'\'; s += (side === \'sell\') ? \'A\' : \'B\'; return s; }', 's = s + ((', '(s + (isEqual' ],
            [ 'object-printed += conditional right', 'f (o, side, xs) { let s = \'\'; s += xs[0]; s += (side === \'sell\') ? \'A\' : \'B\'; return s; }', 's = (s + ((isEqual(side, "sell")) ? "A" : "B"));', 'add(s, (' ],
            [ 'safeString with literal default + literal', 'f (o) { const a = this.safeString (o, \'a\', \'x\'); return a + \':\'; }', '(a + ":")', 'add(a' ],
            [ 'literal accumulator self-concat writes', 'f (o, xs) { let s = \'\'; for (let i = 0; i < xs.length; i++) { s = s + \'&\'; } return s; }', '(s + "&")', 'add(s' ],
            [ 'safeString without default keeps helper', 'f (o) { const a = this.safeString (o, \'a\'); const b = o[\'b\']; return a + b; }', 'add(a, b)' ],
            [ 'later unknown write keeps helper', 'f (o) { let s = \'\'; s = o[\'x\']; return s + \':\'; }', 'add(s, ":")' ],
            [ 'object left + object right keeps helper', 'f (o) { let s = \'\'; const b = o[\'b\']; s = s + b; return s + b; }', 'return add(s, b)' ],
            [ 'object-printed left + string? local right', 'f (o, xs) { let s = \'\'; const v = this.safeString (o, \'v\'); s = s + xs[0]; return s + v; }', '(s + v)' ],
            [ 'loop write of unknown box keeps helper', 'f (o, xs) { let s = \'\'; for (let i = 0; i < xs.length; i++) { s = xs[i]; } return s + \':\'; }', 'add(s, ":")' ],
            [ 'closure write keeps helper', 'f (o) { let s = \'\'; const g = () => { s = o[\'x\']; }; g (); return s + \':\'; }', 'add(s, ":")' ],
        ] ],
        // annotated exchange-local returns / string params
        [ 'typed signatures', () => transpiled ('type Str = string | undefined; type Dict = any; class Test {\n'), undefined, [
            [ 'sbe row builder returns Dictionary', 'parseSbeTrade (frameHex: string, a: number, b: number): Dict { if (a < 8) { return undefined; } return { \'id\': frameHex }; }', 'public virtual Dictionary<string, object> parseSbeTrade(' ],
            [ 'string return gets boundary cast', 'fixCommaNumber (numberStr: Str): Str { const s = numberStr; return s; }', 'public virtual string? fixCommaNumber(' ],
            [ 'caller local takes the return type', 'hashMessage (m: string): string { return m; }\n g (m) { const h = this.hashMessage (m); return h; }', 'string? h = this.hashMessage(m);' ],
            [ 'unannotated parameter keeps object', 'parseOrderStatus (status) { return status; }', 'parseOrderStatus(object status)' ],
        ] ],
        // typed-expression comparisons
        [ 'csharp native emission self test', () => (body) => nativeDeclaredHelperCalls (exchangeWrap ('object since0, Int64? since = null, Int64? limit = null') (body)), undefined, [
            [ 'Int64 compound > Int64', '        Int64 a = this.milliseconds();\n        Int64 b = 5;\n        bool x = isGreaterThan((a - b), b);', 'bool x = ((a - b) > b);' ],
            [ 'nullable compound keeps helper', '        Int64 a = this.milliseconds();\n        Int64? b = limit;\n        bool x = isGreaterThan((a - b), 1);', 'bool x = ((a - b) > 1);' ], // null left is false in both
            [ 'object operand keeps helper', '        object a = 1;\n        bool x = isLessThan(this.milliseconds(), a);', 'bool x = isLessThan(this.milliseconds(), a);' ], // an object operand keeps the helper
        ] ],
    ];
    for (const [ label, runner, tail, rows ] of groups) {
        const check = snippetChecker (problems, label, runner (), undefined, tail);
        for (const [ name, body, expected, forbidden ] of rows) check (name, body, expected, forbidden);
    }
    problems.push (...declaredGetValueSelfTest ());
    problems.push (...objectNumericLocalRetypeSelfTest ());
    problems.push (...wsAndIndexGetValueSelfTest ());
    problems.push (...arithmeticNullableCompareSelfTest ());
    problems.push (...paramsBagGetValueSnippetChecks ());
    problems.push (...typedSubtractMultiplySnippetChecks ());
    problems.push (...inlineHelperSwitchSnippetChecks ());
    problems.push (...nonNullDivModNegateSelfTest ());
    return problems.concat (stringAddEqualityTruthSelfTest ());
}

// final-text pass: `for (object i = <int>; …; postFixIncrement(ref i))` counters whose every read normalises
// the box become `Int64 i … i++`; `prefixUnaryNeg(ref x)` on a numeric parameter copy / single-use
// safeInteger local -> `(-x)`; subtract/multiply/divide with null-guarded or this.sum operands.

// the call name and argument index whose argument list holds `pos`, plus that argument's text
function enclosingHelperCall (text: string, pos: number): { name: string, index: number, arg: string } | undefined {
    let depth = 0;
    let index = 0;
    let argStart = pos;
    for (let i = pos - 1; i >= 0; i--) {
        const ch = text[i];
        if ((ch === ')') || (ch === ']') || (ch === '}')) depth++;
        if ((ch === '(') || (ch === '[') || (ch === '{')) {
            if (depth === 0) {
                if (ch !== '(') return undefined;
                const name = /([A-Za-z_][\w.]*)$/.exec (text.slice (0, i));
                const close = csharpClosingParen (text, i);
                if ((name === null) || (close === undefined)) return undefined;
                if (argStart === pos) argStart = i + 1;
                let argEnd = close;
                let d = 0;
                for (let j = pos; j < close; j++) {
                    if ('([{'.includes (text[j])) d++;
                    if (')]}'.includes (text[j])) d--;
                    if ((d === 0) && (text[j] === ',')) { argEnd = j; break; }
                }
                return { name: name[1], index, arg: text.slice (argStart, argEnd).trim () };
            }
            depth--;
        }
        if ((ch === ',') && (depth === 0)) {
            if (index === 0) argStart = i + 1;
            index++;
        }
    }
    return undefined;
}

function csharpIndent (line: string): number {
    return line.length - line.trimStart ().length;
}

// last line of the block opened by the `{` on line `open`
function csharpBlockEnd (masked: string[], open: number, end: number): number {
    let depth = 0;
    for (let i = open; i < end; i++) {
        for (const ch of masked[i]) {
            if (ch === '{') depth++;
            if (ch === '}') { depth--; if (depth === 0) return i; }
        }
    }
    return end - 1;
}

function nameWriteRe (name: string): RegExp {
    return new RegExp ('(?<![\\w.])' + name + '[ ]*(?:=(?!=)|\\+=|-=|\\*=|/=|%=|\\?\\?=|\\+\\+|--)|\\b(?:ref|out)[ ]+' + name + '\\b|(?:\\+\\+|--)' + name + '\\b');
}

// a conjunct that is false when `name` is null: `name != null`, `!(name == null)`, a lifted `<`/`>` compare
function conjunctProvesNonNull (conjunct: string, name: string): boolean {
    const c = csharpStripParens (conjunct);
    if (new RegExp ('^' + name + '[ ]*!=[ ]*null$').test (c) || new RegExp ('^null[ ]*!=[ ]*' + name + '$').test (c)) return true;
    if (/^!/.test (c) && new RegExp ('^' + name + '[ ]*==[ ]*null$').test (csharpStripParens (c.slice (1)))) return true;
    return new RegExp ('^' + name + '[ ]*(?:<|>|<=|>=)[ ]*[^=<>]+$').test (c) && !/\bnull\b/.test (c);
}

function topLevelSplit (text: string, token: string): string[] {
    const parts = [];
    let depth = 0;
    let last = 0;
    for (let i = 0; i < text.length; i++) {
        if ('([{'.includes (text[i])) depth++;
        if (')]}'.includes (text[i])) depth--;
        if ((depth === 0) && text.startsWith (token, i)) { parts.push (text.slice (last, i)); last = i + token.length; i += token.length - 1; }
    }
    parts.push (text.slice (last));
    return parts;
}

// `name` is non-null at (line, col): an enclosing `if (… && name != null && …)` block with no write of `name`
// inside it, or a same-line `(name != null) && (…)` / `(name == null) || (…)` whose right operand holds col
function isNonNullGuarded (masked: string[], start: number, line: number, col: number, name: string): boolean {
    const write = nameWriteRe (name);
    const text = masked[line];
    for (const [ op, test ] of [ [ '&&', '!=' ], [ '||', '==' ] ]) {
        const re = new RegExp ('\\(' + name + '[ ]*' + test + '[ ]*null\\)+[ ]*' + op.replace (/\|/g, '\\|'), 'g');
        let m;
        while ((m = re.exec (text)) !== null) {
            if (m.index >= col) break;
            // the operator and col share the operator's paren group
            let depth = 0;
            let ok = true;
            for (let j = m.index + m[0].length; j < col; j++) {
                if (text[j] === '(') depth++;
                if (text[j] === ')') { depth--; if (depth < 0) { ok = false; break; } }
            }
            let opDepth = 0;
            for (let j = m.index; j < m.index + m[0].length - op.length; j++) {
                if (text[j] === '(') opDepth++;
                if (text[j] === ')') opDepth--;
            }
            // the null test must be the FIRST operand of the group holding the operator
            // (`(A && (x == null)) || B` would not guard B)
            const p = m.index + m[0].length - op.length;
            let d = 0;
            let groupStart = -1;
            for (let j = p - 1; j >= 0; j--) {
                if (text[j] === ')') d++;
                if (text[j] === '(') { if (d === 0) { groupStart = j; break; } d--; }
            }
            const first = (groupStart >= 0) && /^[ (]*$/.test (text.slice (groupStart + 1, m.index));
            if (ok && first && (opDepth <= 0) && !write.test (text.slice (m.index + m[0].length, col))) return true;
        }
    }
    let indent = csharpIndent (masked[line]);
    for (let k = line - 1; k > start; k--) {
        const ind = csharpIndent (masked[k]);
        if ((masked[k].trim () === '') || (ind >= indent)) continue;
        indent = ind;
        if ((masked[k].trim () !== '{') || (k - 1 <= start)) continue;
        const header = /^[ ]*(?:\}[ ]*else[ ]+)?if[ ]*\(/.exec (masked[k - 1]);
        if (header === null) continue;
        const open = header[0].length - 1;
        const close = csharpClosingParen (masked[k - 1], open);
        if (close === undefined) continue;
        const cond = masked[k - 1].slice (open + 1, close);
        if (cond.includes ('||')) continue;
        if (!topLevelSplit (csharpStripParens (cond), '&&').some ((c) => conjunctProvesNonNull (c, name))) continue;
        const blockEnd = csharpBlockEnd (masked, k, masked.length);
        let written = false;
        for (let j = k; j <= blockEnd; j++) {
            // the negation being proven is the read itself, not a write before it
            if (write.test (masked[j].replace ('prefixUnaryNeg(ref ' + name + ')', ''))) { written = true; break; }
        }
        if (!written) return true;
    }
    return false;
}

// arithmeticOperandType plus the typed base calls: `this.sum` of integer operands binds sum(Int64[?], Int64[?])
// (returns Int64), `this.parseToInt(...)` returns Int64?
function guardedOperandType (arg: string, typeOfName: (name: string) => string | undefined): { type: string, text: string, literal: boolean } | undefined {
    const known = arithmeticOperandType (arg, typeOfName, new Map ());
    if (known !== undefined) {
        return known;
    }
    const text = arg.trim ();
    const bare = csharpStripParens (text);
    const call = /^this\.(sum|parseToInt)\(/.exec (bare);
    if ((call === null) || (csharpClosingParen (bare, call[0].length - 1) !== bare.length - 1)) {
        return undefined;
    }
    if (call[1] === 'parseToInt') {
        return { type: 'Int64?', text: bare, literal: false };
    }
    const args = topLevelSplit (bare.slice (call[0].length, -1), ',');
    if (args.length !== 2) {
        return undefined;
    }
    const kinds = args.map ((a) => guardedOperandType (a, typeOfName));
    const integer = (k) => (k !== undefined) && [ 'int', 'Int64', 'Int64?' ].includes (k.type);
    return (integer (kinds[0]) && integer (kinds[1])) ? { type: 'Int64', text: bare, literal: false } : undefined;
}

function guardedArithmetic (text: string, typeOfName, guardedName: (name: string, col: number) => boolean, offset: number): string {
    let out = '';
    let last = 0;
    const callRe = /(?<![A-Za-z0-9_.])(subtract|multiply|divide)\(/g;
    let m;
    while ((m = callRe.exec (text)) !== null) {
        const open = m.index + m[0].length - 1;
        const close = csharpClosingParen (text, open);
        if (close === undefined) continue;
        const comma = csharpHelperTopLevelComma (text, open, close);
        if ((comma === undefined) || (csharpHelperTopLevelComma (text, comma, close) !== undefined)) continue;
        const raw = [ text.slice (open + 1, comma), text.slice (comma + 1, close) ];
        const inner = raw.map ((a, n) => guardedArithmetic (a, typeOfName, guardedName, offset + ((n === 0) ? open + 1 : comma + 1)));
        const typed = inner.map ((a) => guardedOperandType (a, typeOfName));
        let native: string | undefined;
        if ((typed[0] !== undefined) && (typed[1] !== undefined)) {
            const atom = (t: string) => (topLevelBinaryOperands (t) === undefined) ? t : '(' + t + ')';
            const L = atom (typed[0].text);
            const R = atom (typed[1].text);
            const kinds = [ typed[0].type, typed[1].type ];
            const base = kinds.map ((k) => k.replace ('?', ''));
            if (m[1] === 'subtract') {
                // only a null-guarded identifier may be nullable (subtract(object, object) dereferences null)
                const proven = [ 0, 1 ].every ((n) => !kinds[n].endsWith ('?')
                    || (/^[A-Za-z_]\w*$/.test (typed[n].text) && guardedName (typed[n].text, offset + m.index)));
                const nullable = kinds.some ((k) => k.endsWith ('?'));
                // the object overload: double left converts any right; Int64 left casts the right to Int64
                const pair = (base[0] === 'double') || ((base[1] !== 'double') && !((base[0] === 'int') && (base[1] === 'int')));
                if (nullable && proven && pair) native = '(' + L + ' - ' + R + ')';
            } else if ((m[1] === 'multiply') && (kinds[0] === 'int') && (kinds[1] === 'int') && !typed[0].literal && !typed[1].literal) {
                native = '((Int64)' + L + ' * ' + R + ')'; // the multiply(Int64, Int64) twin's body
            } else if ((arithmeticOperandType (inner[0], typeOfName, new Map ()) === undefined) || (arithmeticOperandType (inner[1], typeOfName, new Map ()) === undefined)) {
                // a this.sum / parseToInt operand the operand-type pass could not type: the divide twin it would have chosen
                const twin = arithmeticTwinType (m[1], kinds[0], kinds[1]);
                if ((twin !== undefined) && (m[1] === 'divide')) {
                    native = '((' + twin + ')' + L + ' / ' + R + ')';
                }
            }
        }
        out += text.slice (last, m.index) + (native ?? (m[1] + '(' + inner[0] + ',' + inner[1] + ')'));
        last = close + 1;
        callRe.lastIndex = close + 1;
    }
    return out + text.slice (last);
}

// every read of the counter in its header condition / body hands the box to a helper that normalises it
function counterReadsNormalise (masked: string[], from: number, to: number, header: string, name: string): boolean {
    const compare = [ 'isLessThan', 'isGreaterThan', 'isLessThanOrEqual', 'isGreaterThanOrEqual', 'isEqual' ];
    const keyed = [ 'getValue', 'GetValue', 'this.safeDict', 'this.safeList', 'this.safeValue', 'this.safeString', 'this.safeInteger', 'this.safeNumber' ];
    const texts = [ header ];
    for (let i = from; i <= to; i++) texts.push (masked[i]);
    const re = new RegExp ('(?<![\\w.])' + name + '(?![\\w])', 'g');
    for (const text of texts) {
        let m;
        while ((m = re.exec (text)) !== null) {
            const call = enclosingHelperCall (text, m.index);
            if ((call === undefined) || (call.arg !== name)) return false;
            if (compare.includes (call.name) || (keyed.includes (call.name) && (call.index === 1))) continue;
            return false;
        }
    }
    return true;
}

export function csharpCounterAndGuardedMath (content: string): string {
    if (!/(?<![\w.])(?:postFixIncrement|prefixUnaryNeg|subtract|multiply|divide)\(/.test (content) || /^namespace Tests\b/m.test (content)) {
        return content;
    }
    const lines = content.split ('\n');
    const masked = lines.map (csharpHelperMaskLine);
    let changed = false;
    const set = (i: number, next: string) => {
        if (next !== lines[i]) { lines[i] = next; masked[i] = csharpHelperMaskLine (next); changed = true; }
    };
    for (const { start, end, params } of csharpRegions (masked)) {
        const declarations = () => csharpRegionDeclarations (masked, start, end);
        const occurrences = (name: string) => {
            const re = new RegExp ('(?<![\\w.])' + name + '(?![\\w])');
            const at = [];
            for (let i = start + 1; i < end; i++) if (re.test (masked[i])) at.push (i);
            return at;
        };
        const written = (name: string, except: number[]) => {
            const re = nameWriteRe (name);
            for (let i = start + 1; i < end; i++) if (!except.includes (i) && re.test (masked[i])) return true;
            return false;
        };
        // (2) prefixUnaryNeg(ref x)
        for (let i = start + 1; i < end; i++) {
            const site = /(?<![\w.])prefixUnaryNeg\(ref ([A-Za-z_]\w*)\)/.exec (masked[i]);
            if (site === null) continue;
            const name = site[1];
            const decls = declarations ().filter ((d) => d.name === name);
            if ((decls.length !== 1) || (decls[0].type !== 'object') || (decls[0].line >= i)) continue;
            const decl = decls[0];
            const uses = occurrences (name).filter ((k) => k !== decl.line && k !== i);
            const tail = masked[i].slice (site.index + site[0].length);
            const after = uses.some ((k) => k > i) || new RegExp ('(?<![\\w.])' + name + '(?![\\w])').test (tail);
            if (written (name, [ decl.line, i ]) || after) continue;
            const guarded = () => isNonNullGuarded (masked, start, i, site.index, name)
                || new RegExp ('\\(!\\(' + name + ' == null\\)\\) \\? [^:]*$').test (masked[i].slice (0, site.index));
            const param = params[decl.value];
            // the helper negates the copy in place: no other read, or the read is the method's return
            const final = (uses.length === 0) || /^[ ]*return\b/.test (masked[i]);
            if ((param !== undefined) && /^[A-Za-z_]\w*$/.test (decl.value) && final) {
                const nonNull = [ 'double', 'Int64', 'int', 'long' ].includes (param);
                const nullable = [ 'double?', 'Int64?', 'long?' ].includes (param)
                    && (isNonNullGuarded (masked, start, i, site.index, decl.value) || guarded ());
                if ((nonNull || nullable) && !written (decl.value, [])) {
                    set (i, lines[i].replace (site[0], '(-' + decl.value + ')'));
                }
                continue;
            }
            const safe = /^this\.safeInteger2?\((.*)\)$/.exec (decl.value);
            if ((safe === null) || (csharpClosingParen (decl.value, decl.value.indexOf ('(')) !== decl.value.length - 1)) continue;
            const nullTest = new RegExp ('^(?:[^]*[^\\w.])?' + name + ' [!=]= null(?![\\w])');
            const nullTestsOnly = uses.every ((k) => k < i && masked[k].replace (new RegExp ('(?<![\\w.])' + name + ' [!=]= null', 'g'), '').search (new RegExp ('(?<![\\w.])' + name + '(?![\\w])')) < 0 && nullTest.test (masked[k]));
            const args = topLevelSplit (safe[1], ',');
            const defaulted = (decl.value.startsWith ('this.safeInteger(') && (args.length === 3) && /^\d{1,9}$/.test (args[2].trim ()));
            if (!nullTestsOnly || !(defaulted || guarded ())) continue;
            set (decl.line, lines[decl.line].replace ('object ' + name + ' = ', 'Int64? ' + name + ' = '));
            set (i, lines[i].replace (site[0], '(-' + name + ')'));
        }
        // (3) arithmetic on guarded nullable / this.sum / int x int operands
        const bound = arithmeticBoundNames (masked, start, end);
        const region = { start, end, params, declarations: declarations (), lines: masked, bound };
        for (let i = start + 1; i < end; i++) {
            if (!/(?<![A-Za-z0-9_.])(subtract|multiply|divide)\(/.test (masked[i]) || /['@$\u0001]/.test (lines[i])) continue;
            const typeOfName = (name: string) => bound.has (name) ? undefined : csharpHelperReceiverType (region, name, i, params)?.type;
            const comment = masked[i].indexOf ('//');
            const code = (comment < 0) ? lines[i] : lines[i].slice (0, comment);
            // string literals become same-length opaque runs (columns stay valid), restored in order
            const strings = [];
            const opaque = code.replace (/"(?:[^"\\]|\\.)*"/g, (s) => { strings.push (s); return '\u0001' + '\u0002'.repeat (s.length - 2) + '\u0001'; });
            let k = 0;
            const rewritten = guardedArithmetic (opaque, typeOfName, (name: string, col: number) => isNonNullGuarded (masked, start, i, col, name), 0)
                .replace (/\u0001\u0002*\u0001/g, () => strings[k++]);
            if (k !== strings.length) continue;
            set (i, rewritten + ((comment < 0) ? '' : lines[i].slice (comment)));
        }
    }
    // the retyped counters / negations feed the declared-operand twins once more
    return changed ? csharpNativeArithmetic (lines.join ('\n')) : content;
}

export function counterAndGuardedMathSelfTest (): string[] {
    const problems: string[] = [];
    const wrap = (body: string) => 'namespace ccxt;\npublic partial class t : Exchange\n{\n    public virtual object f(object since, double amount, Int64? limit = null)\n    {\n' + body + '\n    }\n}\n';
    const check = snippetChecker (problems, 'counter and guarded math self native math', (body) => csharpCounterAndGuardedMath (wrap (body)));
    check ('counter read as a string key keeps object', '        for (object i = 0; isLessThan(i, n); postFixIncrement(ref i))\n        {\n            object b = ((string)i);\n        }', 'postFixIncrement(ref i)');
    check ('counter subtract of a typed name keeps object', '        for (object i = 0; isLessThan(i, n); postFixIncrement(ref i))\n        {\n            object b = subtract(i, d);\n        }', 'postFixIncrement(ref i)');
    check ('object-initialised counter keeps helper', '        object s = 0;\n        for (object i = s; isLessThan(i, n); postFixIncrement(ref i))\n        {\n            object b = getValue(xs, i);\n        }', 'postFixIncrement(ref i)');
    check ('double param copy -> (-amount)', '        object amountVar = amount;\n        return this.g(prefixUnaryNeg(ref amountVar));', 'return this.g((-amount));');
    check ('object param copy keeps helper', '        object s = since;\n        return this.g(prefixUnaryNeg(ref s));', 'prefixUnaryNeg(ref s)');
    check ('copy read earlier in a loop keeps helper', '        object amountVar = amount;\n        while (true)\n        {\n            object y = amountVar;\n            object x = this.g(prefixUnaryNeg(ref amountVar));\n        }', 'prefixUnaryNeg(ref amountVar)');
    check ('copy read after the site keeps helper', '        object amountVar = amount;\n        object x = this.g(prefixUnaryNeg(ref amountVar));\n        return amountVar;', 'prefixUnaryNeg(ref amountVar)');
    check ('guarded Int64? param copy', '        object limitVar = limit;\n        if ((limitVar != null))\n        {\n            return this.g(prefixUnaryNeg(ref limitVar));\n        }\n        return null;', 'return this.g((-limit));');
    check ('unguarded Int64? param copy keeps helper', '        object limitVar = limit;\n        return this.g(prefixUnaryNeg(ref limitVar));', 'prefixUnaryNeg(ref limitVar)');
    check ('defaulted safeInteger local', '        object d = this.safeInteger(this.options, "k", 6);\n        string s = this.numberToString(prefixUnaryNeg(ref d));', 'string s = this.numberToString((-d));');
    check ('defaulted safeInteger local retyped', '        object d = this.safeInteger(this.options, "k", 6);\n        string s = this.numberToString(prefixUnaryNeg(ref d));', 'Int64? d = this.safeInteger(');
    check ('ternary-guarded safeInteger local', '        object sc = this.safeInteger(c, "scale");\n        double? p = (!(sc == null)) ? Math.Pow(Convert.ToDouble(10), Convert.ToDouble(prefixUnaryNeg(ref sc))) : null;', 'Convert.ToDouble((-sc))');
    check ('unguarded safeInteger local keeps helper', '        object sc = this.safeInteger(c, "scale");\n        object p = this.g(prefixUnaryNeg(ref sc));', 'prefixUnaryNeg(ref sc)');
    check ('guarded double? subtract', '        double? a = this.safeNumber(o, "a");\n        double? b = this.safeNumber(o, "b");\n        object p = null;\n        if (((a != null)) && ((b != null)))\n        {\n            p = subtract(a, b);\n        }', 'p = (a - b);');
    check ('one-side guarded subtract keeps helper', '        double? a = this.safeNumber(o, "a");\n        double? b = this.safeNumber(o, "b");\n        object p = null;\n        if ((a != null))\n        {\n            p = subtract(a, b);\n        }', 'subtract(a, b)');
    check ('|| guarded Int64 - Int64?', '        Int64? ts = this.safeInteger(o, "t");\n        Int64 now = this.milliseconds();\n        if (((ts == null)) || (isGreaterThan((subtract(now, ts)), 5)))\n        {\n        }', 'isGreaterThan(((now - ts)), 5)');
    check ('lifted > guard proves non-null', '        Int64? p = parseInt(s);\n        if ((p > 0))\n        {\n            for (int i = 0; isLessThan(i, subtract(p, 1)); i++)\n            {\n            }\n        }', 'isLessThan(i, (p - 1))');
    check ('guard write inside block keeps helper', '        Int64? p = parseInt(s);\n        if ((p != null))\n        {\n            p = null;\n            object q = subtract(p, 1);\n        }', 'subtract(p, 1)');
    check ('Int64? - double keeps helper', '        Int64? a = parseInt(s);\n        double b = 1.5;\n        if ((a != null))\n        {\n            object q = subtract(a, b);\n        }', 'subtract(a, b)');
    check ('int * int -> Int64 twin body', '        int a = 60;\n        int b = 300;\n        object d = multiply(a, b);', 'object d = ((Int64)a * b);');
    check ('this.sum operand -> divide twin', '        int n = 3;\n        Int64? c = this.safeInteger(o, "c", 100);\n        Int64? k = this.parseToInt(divide(this.sum(n, (c - 1)), c));', 'this.parseToInt(((double?)this.sum(n, (c - 1)) / c))');
    check ('double? multiply keeps helper', '        double? a = this.safeNumber(o, "a");\n        double? b = this.safeNumber(o, "b");\n        if ((a != null) && (b != null))\n        {\n            object c = multiply(a, b);\n        }', 'multiply(a, b)');
    return problems;
}

// a name's C# type at `line`: one declared type, a parameter, or a `for (int name = ...)` counter
// nothing else binds; names written by ref/out keep the helper
function declaredNameType (region: CsharpRegion, name: string, line: number): string | undefined {
    if (!/^[A-Za-z_]\w*$/.test (name) || region.bound.has (name)) return undefined;
    const sink = new RegExp ('\\b(?:ref|out)[ ]+' + name + '\\b');
    for (let k = region.start + 1; k < region.end; k++) {
        if (sink.test (region.lines[k])) return undefined;
    }
    const declared = csharpHelperReceiverType (region, name, line, region.params);
    if (declared !== undefined) return declared.type.replace (/^long(\??)$/, 'Int64$1');
    const other = region.declarations.some ((d) => d.name === name) || (region.params[name] !== undefined);
    return (!other && region.forInt.has (name)) ? 'int' : undefined;
}

// inOp on a declared string->object dictionary with a non-identifier key: InOp's IDictionary branch answers
// ContainsKey for a string key, else false, so `K is string k` reads K once; getIndexOf(s, xs[i]) on a
// declared string keeps the helper's `(string)` needle cast, Ordinal.
export function csharpPureKeyInOp (content: string): string {
    if (!/(?<![\w.])(?:inOp|getIndexOf)\(/.test (content)) {
        return content;
    }
    const objectDicts = [ 'Dictionary<string,object>', 'IDictionary<string,object>', 'ConcurrentDictionary<string,object>' ];
    // hand-written base fields declared as a string->object dictionary (cs/ccxt/base/Exchange.Options.cs, ws/Client.cs)
    const fields = { 'this.features': 'Dictionary<string, object>', 'this.markets_by_id': 'IDictionary<string, object>',
        'this.orderbooks': 'IDictionary<string, object>', 'this.markets': 'IDictionary<string, object>',
        'this.currencies_by_id': 'IDictionary<string, object>', 'this.has': 'Dictionary<string, object>',
        'this.timeframes': 'Dictionary<string, object>' };
    let keys = Math.max (-1, ...Array.from (content.matchAll (/\binOpKey(\d+)\b/g), (m) => Number (m[1]))) + 1;
    return csharpLinePass (content, false, (region, original, masked, i) => {
        if (!/(?<![\w.])(?:inOp|getIndexOf)\(/.test (masked)) return undefined;
        const receiverOf = (name: string) => {
            if (Object.prototype.hasOwnProperty.call (fields, name)) return fields[name];
            if (/^[A-Za-z_]\w*$/.test (name)) return csharpHelperReceiverType (region, name, i, region.params)?.type;
            return csharpInOpReceiverType (region, name, i)?.type;
        };
        return pureKeyInOpLine (original, masked, receiverOf, objectDicts, () => `inOpKey${keys++}`);
    });
}

// a key expression with no call but getValue / ContainsKey / Count and no write: evaluating it after
// the receiver's null test is unobservable
function isPureKey (mask: string): boolean {
    if (/(?<![=!<>])=(?!=)|\+\+|--|\bawait\b|\bnew\b/.test (mask)) return false;
    for (const m of mask.matchAll (/([A-Za-z_][\w.]*)[ ]*\(/g)) {
        if (!/(?:^|\.)(?:getValue|ContainsKey)$/.test (m[1])) return false;
    }
    return true;
}

function pureKeyInOpLine (original: string, masked: string, receiverOf, objectDicts: string[], keyName): string | undefined {
    const edits = [];
    const call = /(?<![\w.])(inOp|getIndexOf)\(/g;
    let m;
    while ((m = call.exec (masked)) !== null) {
        const open = m.index + m[0].length - 1;
        const close = csharpHelperCallEnd (masked, open);
        if (close === undefined) continue;
        if (edits.some ((e) => (m.index < e.end) && (close >= e.start))) continue;
        const comma = csharpHelperTopLevelComma (masked, open, close);
        if ((comma === undefined) || (csharpHelperTopLevelComma (masked, comma, close) !== undefined)) continue;
        const name = masked.substring (open + 1, comma).trim ();
        const keyMask = masked.substring (comma + 1, close).trim ();
        const keyText = original.substring (comma + 1, close).trim ();
        if (!/^(?:this\.)?[A-Za-z_]\w*(?:\.(?:subscriptions))?$/.test (name)) continue;
        const type = receiverOf (name);
        if (type === undefined) continue;
        if (m[1] === 'getIndexOf') {
            // only the `xs[i]` needle shape is handled here (literal / string needles are an earlier pass's)
            if (!/^[A-Za-z_]\w*\[[A-Za-z_]\w*\]$/.test (keyMask) || ((type !== 'string') && (type !== 'string?'))) continue;
            const scan = `IndexOf((string)${keyText}, StringComparison.Ordinal)`;
            edits.push ({ start: m.index, end: close + 1, text: (type === 'string') ? `${name}.${scan}` : `(${name}?.${scan} ?? -1)` });
            continue;
        }
        if (!objectDicts.includes (type.replace (/\s+/g, ''))) continue;
        // literal and identifier keys belong to the declared-helper pass
        if (/^[A-Za-z_]\w*$/.test (keyMask) || /^"[^"]*"$/.test (keyMask) || !isPureKey (keyMask)) continue;
        const bound = keyName ();
        edits.push ({ start: m.index, end: close + 1, text: `(${name} != null && ${keyText} is string ${bound} && ${name}.ContainsKey(${bound}))` });
    }
    return (edits.length === 0) ? undefined : applyRegionEdits (original, edits);
}

function pureKeyInOpSelfTest (): string[] {
    const problems: string[] = [];
    const wrap = (sig: string, body: string) => [ 'namespace ccxt;', 'public partial class test : Exchange', '{',
        `    public virtual object ${sig}`, '    {', ...body.split ('\n').map ((l) => '        ' + l), '    }', '}' ].join ('\n');
    // negatives: object receiver, call-bearing key, identifier key (other pass)
    const rows: [string, (content: string) => string, string, string, string][] = [
        [ 'declared dict + getValue key', csharpPureKeyInOp, 'f(object v)', 'IDictionary<string, object> d = this.safeDict(v, "a", new Dictionary<string, object>() {});\nif (inOp(d, getValue(v, "id"))) { }',
            '(d != null && getValue(v, "id") is string inOpKey0 && d.ContainsKey(inOpKey0))' ],
        [ 'base field + guarded read key', csharpPureKeyInOp, 'f(Dictionary<string, object> m)', 'if (inOp(this.orderbooks, (m.ContainsKey("s") ? m["s"] : null))) { }',
            '(this.orderbooks != null && (m.ContainsKey("s") ? m["s"] : null) is string inOpKey0 && this.orderbooks.ContainsKey(inOpKey0))' ],
        [ 'string? haystack, element needle', csharpPureKeyInOp, 'f(string? topic, List<object> keys)', 'for (int i = 0; i < keys.Count; i++) { if (getIndexOf(topic, keys[i]) >= 0) { } }',
            '(topic?.IndexOf((string)keys[i], StringComparison.Ordinal) ?? -1)' ],
        [ 'object receiver keeps helper', csharpPureKeyInOp, 'f(object d, object v)', 'if (inOp(d, getValue(v, "id"))) { }', 'inOp(d, getValue(v, "id"))' ],
        [ 'side-effecting key keeps helper', csharpPureKeyInOp, 'f(IDictionary<string, object> d)', 'if (inOp(d, this.k())) { }', 'inOp(d, this.k())' ],
        [ 'identifier key left to the declared pass', csharpPureKeyInOp, 'f(IDictionary<string, object> d, object k)', 'if (inOp(d, k)) { }', 'inOp(d, k)' ],
        [ 'string? haystack, string-concat needle', csharpDeclaredReceiverHelperCalls, 'f(string? msg, string? ch)', 'if ((ch != null) && (getIndexOf(msg, ((\"[\" + ch) + \"]\")) >= 0)) { }',
            '((msg?.IndexOf(((\"[\" + ch) + \"]\"), StringComparison.Ordinal) ?? -1) >= 0)' ],
        [ 'concat of two identifiers keeps helper', csharpDeclaredReceiverHelperCalls, 'f(string? msg, string? a, string? b)', 'if (getIndexOf(msg, (a + b)) >= 0) { }', 'getIndexOf(msg, (a + b))' ],
        [ 'call in needle keeps helper', csharpDeclaredReceiverHelperCalls, 'f(string? msg, string? a)', 'if (getIndexOf(msg, (\"[\" + this.g(a))) >= 0) { }', 'getIndexOf(msg, (\"[\" + this.g(a)))' ],
        [ 'object haystack keeps helper', csharpPureKeyInOp, 'f(object topic, List<object> keys)', 'if (getIndexOf(topic, keys[0]) >= 0) { }', 'getIndexOf(topic, keys[0])' ],
    ];
    for (const [ name, pass, sig, body, expected ] of rows) {
        snippetChecker (problems, 'pure key in op self', (b) => pass (wrap (sig, b))) (name, body, expected);
    }
    return problems;
}

// `add(L, R)` whose left prints a C# string binds add(string, string|object): body `L + R` (`b?.ToString()`
// is what string concatenation does); `isEqual` on proven string/int/bool? pairs and `isTrue` on proven
// bool/bool? operands, operand types read from the final emitted text.
export function csharpStringAddEqualityTruth (content: string): string {
    if (!/(?<![A-Za-z0-9_.])(add|isEqual|isTrue)\(/.test (content) || /^namespace Tests\b/m.test (content)) {
        return content;
    }
    const stringFields = [ 'id', 'version', 'userAgent', 'url', 'hostname', 'apiKey', 'secret', 'password', 'uid',
        'accountId', 'login', 'privateKey', 'walletAddress', 'twofa', 'rateLimiterAlgorithm' ];
    const stringCalls = [ 'implodeParams', 'implodeHostname', 'urlencode', 'urlencodeNested', 'urlencodeWithArrayRepeat',
        'rawencode', 'numberToString', 'iso8601', 'ymdhms', 'yyyymmdd', 'uuid', 'json', 'hmac', 'encode', 'decode',
        'stringToBase64', 'binaryToBase64', 'decimalToPrecision', 'safeString', 'safeString2', 'safeStringN',
        'safeStringLower', 'safeStringUpper', 'safeStringLower2', 'safeStringUpper2', 'amountToPrecision',
        'priceToPrecision', 'costToPrecision', 'currencyToPrecision', 'feeToPrecision', 'uuid5' ];
    const nullableBoolCalls = [ 'safeBool', 'safeBool2', 'safeBoolN' ];
    const lines = content.split ('\n');
    // the return types every in-file declaration of a method gives it
    const ownReturns: { [name: string]: string[] } = {};
    for (const l of lines.map (csharpHelperMaskLine)) {
        const m = /^[ ]{4}(?:(?:public|private|protected|internal|static|virtual|override|async|new)[ ]+)+([\w<>,.?\[\]]+)[ ]+([A-Za-z_]\w*)[ ]*\(/.exec (l);
        if (m !== null) (ownReturns[m[2]] = ownReturns[m[2]] ?? []).push (m[1]);
    }
    const ownMember = (name: string) => new RegExp ('^[ ]+(?:(?:public|private|protected|internal|static|virtual|override|new)[ ]+)+[\\w<>,.?\\[\\]]+[ ]+' + name + '[ ]*(?:\\{|;|=)', 'm').test (content);
    const returnsOf = (name: string, table: string[], kinds: string[]) => {
        const own = ownReturns[name];
        if (own !== undefined) return own.every ((t) => kinds.includes (t));
        return table.includes (name);
    };
    // per region, on its first line: the names bound by any other syntax (for/foreach/out/lambda/pattern/catch) are not proven, and its `for (int i = ...` counters
    const regionNames = (region) => {
        const { start, end, declarations, lines: masked } = region;
        const bound = new Set<string> ();
        for (let i = start + 1; i < end; i++) {
            for (const b of masked[i].matchAll (/(?:\bfor(?:each)?[ ]*\([ ]*[A-Za-z_][\w<>?,]*[ ]+|\bout[ ]+[A-Za-z_][\w<>?]*[ ]+|\bis[ ]+[A-Za-z_][\w<>?]*[ ]+|\bcatch[ ]*\([ ]*[A-Za-z_][\w.]*[ ]+)([A-Za-z_]\w*)/g)) bound.add (b[1]);
            for (const b of masked[i].matchAll (/([A-Za-z_]\w*)[ ]*=>/g)) bound.add (b[1]);
            for (const b of masked[i].matchAll (/\(([^()]*)\)[ ]*=>/g)) {
                for (const n of b[1].split (',')) bound.add (n.trim ().split (/\s+/).pop ());
            }
        }
        // `for (int i = ...` headers: one type for every header of the name and no other binding
        const forTypes = new Map<string, Set<string>> ();
        for (let i = start + 1; i < end; i++) {
            for (const f of masked[i].matchAll (/\bfor[ ]*\([ ]*(int|Int64)[ ]+([A-Za-z_]\w*)[ ]*=/g)) {
                if (!forTypes.has (f[2])) forTypes.set (f[2], new Set ());
                forTypes.get (f[2]).add (f[1]);
            }
        }
        const counters = new Map<string, string> ();
        for (const [ name, types ] of forTypes) {
            const others = new RegExp ('(?:\\bforeach[ ]*\\([ ]*[A-Za-z_][\\w<>?,]*[ ]+|\\bout[ ]+[A-Za-z_][\\w<>?]*[ ]+|\\bis[ ]+[A-Za-z_][\\w<>?]*[ ]+|\\bcatch[ ]*\\([ ]*[A-Za-z_][\\w.]*[ ]+)' + name + '\\b|\\b' + name + '[ ]*=>|\\([^()]*\\b' + name + '\\b[^()]*\\)[ ]*=>');
            const clash = declarations.some ((d) => d.name === name) || (csharpHelperSignatureParams (masked, start)[name] !== undefined)
                || masked.slice (start + 1, end).some ((l) => others.test (l));
            if ((types.size === 1) && !clash) counters.set (name, [ ...types ][0]);
        }
        for (const name of counters.keys ()) bound.delete (name);
        region.bound = bound;
        region.counters = counters;
        region.lines = masked.slice (); // the pass reads the masked text as it was before its own rewrites
    };
    // the outermost parenthesis pair wraps the whole text
    const wrapped = (m: string) => m.startsWith ('(') && (csharpHelperCallEnd (m, 0) === m.length - 1);
    // top-level `+` operands of a text with no other top-level operator, else undefined
    const plusOperands = (m: string, o: string): string[] | undefined => {
        const parts = [];
        let depth = 0;
        let last = 0;
        for (let k = 0; k < m.length; k++) {
            const ch = m[k];
            if ('([{'.includes (ch)) depth++;
            else if (')]}'.includes (ch)) depth--;
            else if ((depth === 0) && (ch === '"')) { const e = m.indexOf ('"', k + 1); if (e < 0) return undefined; k = e; }
            else if ((depth === 0) && (m.substring (k, k + 3) === ' + ')) { parts.push (o.substring (last, k)); last = k + 3; k += 2; }
            else if ((depth === 0) && /[?:=<>&|!*\/%^-]/.test (ch)) return undefined;
        }
        parts.push (o.substring (last));
        return (parts.length > 1) ? parts : undefined;
    };
    // the printed C# type of an operand: 'string', 'int', 'bool', 'bool?' (undefined when unproven)
    const typeOf = (region: CsharpRegion, line: number, text: string, depth = 0): string | undefined => {
        const t = text.trim ();
        const m = csharpHelperMaskLine (t);
        if ((t.length === 0) || (depth > 8)) return undefined;
        if (/^"(?:[^"\\]|\\.)*"$/.test (t)) return 'string';
        if (/^-?[0-9]{1,9}$/.test (t)) return 'int';
        if (/^(true|false)$/.test (t)) return 'bool';
        if (/^[A-Za-z_]\w*$/.test (t)) {
            if (region.bound.has (t)) return undefined;
            if (region.counters.has (t)) return 'int';
            const d = csharpHelperReceiverType (region, t, line, region.params);
            if (d === undefined) return undefined;
            const ty = d.type.replace (/^long$/, 'Int64');
            if ((ty === 'string') || (ty === 'string?')) return 'string';
            if ((ty === 'int') || (ty === 'Int64')) return 'int';
            if ((ty === 'bool') || (ty === 'bool?')) return ty;
            if ((ty === 'Int64?') || (ty === 'long?')) return 'nint'; // isEqual arm only
            if ((ty === 'object') && (d.kind === 'local') && (nonNullStringLocal (region, t, depth) || nonNullStringAt (region, t, line, depth))) return 'objstring';
            return undefined;
        }
        const field = /^this\.([A-Za-z_]\w*)$/.exec (t);
        if (field !== null) return (stringFields.includes (field[1]) && !ownMember (field[1])) ? 'string' : undefined;
        // an object-left concat this pass made native was an `object` in the text the overloads bound
        if (objectConcats.has (t)) return 'objstring';
        if (wrapped (m)) {
            const inner = t.slice (1, -1);
            const parts = plusOperands (m.slice (1, -1), inner);
            if (parts !== undefined) {
                const kinds = parts.map ((p) => typeOf (region, line, p, depth + 1));
                if ((kinds[0] === 'string') || ((parts.length === 2) && (kinds[1] === 'string'))) return 'string';
                if (kinds.every ((k) => k === 'int')) return 'int';
                return kinds.every ((k) => (k === 'int') || (k === 'nint')) ? 'nint' : undefined;
            }
            const minus = /^(.*[^ ]) - ([0-9]{1,9})$/.exec (inner);
            if ((minus !== null) && !/[?:=<>&|!+*\/%^]/.test (csharpHelperMaskLine (minus[1]).replace (/\([^()]*\)/g, ''))) {
                return (typeOf (region, line, minus[1], depth + 1) === 'int') ? 'int' : undefined;
            }
            return typeOf (region, line, inner, depth + 1);
        }
        const call = /^((?:this|Precise)\.)?([A-Za-z_]\w*)\(/.exec (m);
        if ((call !== null) && (csharpHelperCallEnd (m, call[0].length - 1) === m.length - 1)) {
            const name = call[2];
            if (call[1] === 'this.') {
                if (returnsOf (name, stringCalls, [ 'string', 'string?' ])) return 'string';
                if (returnsOf (name, nullableBoolCalls, [ 'bool?' ])) return 'bool?';
                return undefined;
            }
            return undefined;
        }
        // a string-only member call (an NRE on a null receiver happens before the helper too)
        for (const tail of m.matchAll (/\.(?:PadLeft|PadRight|Substring|ToLower|ToUpper|ToLowerInvariant|ToUpperInvariant|Trim|TrimStart|TrimEnd)\(/g)) {
            if (csharpHelperCallEnd (m, tail.index + tail[0].length - 1) !== m.length - 1) continue;
            if (/^\([A-Za-z_]\w* as String\)$/.test (m.substring (0, tail.index))) return 'string';
        }
        if (/^String\.Join\(/.test (m) && (csharpHelperCallEnd (m, 11) === m.length - 1)) return 'string';
        return undefined;
    };
    // every write of an `object` local in the method stores a non-null string (or a self-concat)
    const objectConcats = new Set<string> ();
    const banned = new Set<string> ();
    let objectListAt: { region: any, line: number } | undefined = undefined;
    // an object-left concat now prints `string` where the helper printed `object`: keep it only where
    // the static type picks nothing (assignment / return / string cast / concat or add operand)
    const objectConcatContextsBad = (text: string): string | undefined => {
        for (const e of objectConcats) {
            let at = text.indexOf (e);
            while (at >= 0) {
                const before = csharpHelperMaskLine (text.substring (0, at)).trimEnd ();
                const after = csharpHelperMaskLine (text.substring (at + e.length)).trimStart ();
                // `var x =` would infer string where it inferred object
                let ok = (/(?<![=!<>])=$/.test (before) && !/\bvar[ ]+[A-Za-z_]\w*[ ]*=$/.test (before)) || /\breturn$/.test (before) || /\(string\)$/.test (before) || /\+$/.test (before);
                // the left operand of a native concat (that concat proved its right a string)
                if (!ok && before.endsWith ('(') && !/[\w.]\($/.test (before) && /^\+ /.test (after)) ok = true;
                // the sole argument of Add on a List<object> local (Add(object) takes either type)
                const adder = /(?<![\w.])([A-Za-z_]\w*)\.Add\($/.exec (before);
                if (!ok && (adder !== null) && /^\)/.test (after) && (objectListAt !== undefined)) {
                    const d = csharpHelperReceiverType (objectListAt.region, adder[1], objectListAt.line, objectListAt.region.params);
                    ok = (d !== undefined) && (d.kind === 'local') && [ 'List<object>', 'IList<object>' ].includes (d.type.replace (/\s+/g, ''));
                }
                if (!ok) return e;
                at = text.indexOf (e, at + 1);
            }
        }
        return undefined;
    };
    const nonNullMemo = new Map<string, boolean> ();
    const nonNullStringLocal = (region: CsharpRegion, name: string, depth: number): boolean => {
        const key = region.start + ':' + name;
        if (nonNullMemo.has (key)) return nonNullMemo.get (key);
        nonNullMemo.set (key, false); // a cycle reads unproven
        let ok = !region.bound.has (name) && (region.params[name] === undefined) && (depth < 6);
        const write = new RegExp ('(?<![\\w.])' + name + '[ ]*(=(?![=>])|\\+=|-=|\\?\\?=|\\+\\+|--)|\\b(?:ref|out)[ ]+' + name + '\\b|(?<![\\w.])' + name + '[ ]*--|\\+\\+[ ]*' + name + '\\b');
        for (let k = region.start + 1; ok && (k < region.end); k++) {
            const l = region.lines[k];
            if (!write.test (l)) continue;
            const m = new RegExp ('^[ ]*(?:object[ ]+)?' + name + '[ ]*=[ ]*(.*);[ ]*$').exec (l);
            if (m === null) { ok = false; break; }
            const value = lines[k].substring (m.index + l.length - l.trimStart ().length).replace (/^[^=]*=[ ]*/, '').replace (/;[ ]*$/, '');
            ok = nonNullString (region, k, value, name, depth + 1);
        }
        nonNullMemo.set (key, ok);
        return ok;
    };
    // the block of `line` opened at or after `from` is still open at `to` (brace depth never closes it)
    const openThrough = (region: CsharpRegion, from: number, to: number): boolean => {
        let depth = 0;
        for (let k = from + 1; k < to; k++) {
            for (const ch of region.lines[k]) {
                if (ch === '{') depth++;
                if ((ch === '}') && (--depth < 0)) return false;
            }
        }
        return true;
    };
    const writesName = (l: string, name: string) => new RegExp ('(?<![\\w.])' + name + '[ ]*(=(?![=>])|\\+=|-=|\\?\\?=|\\+\\+|--)|\\b(?:ref|out)[ ]+' + name + '\\b|\\+\\+[ ]*' + name + '\\b').test (l);
    // `name != null` dominates `line`: an enclosing `if ((name != null))` block, or an earlier
    // `if ((name == null)) { throw|return }` in an enclosing block; no write of `name` in between
    // a loop back edge can carry a later write to the read: every later write stores a non-null string
    const laterWritesNonNull = (region: CsharpRegion, name: string, line: number, depth: number): boolean => {
        for (let k = line + 1; k < region.end; k++) {
            if (!writesName (region.lines[k], name)) continue;
            const m = new RegExp ('^[ ]*' + name + '[ ]*=[ ]*(.*);[ ]*$').exec (region.lines[k]);
            if (m === null) return false;
            const value = lines[k].trim ().replace (/^[A-Za-z_]\w*[ ]*=[ ]*/, '').replace (/;[ ]*$/, '');
            if (!nonNullString (region, k, value, name, depth + 1)) return false;
        }
        return true;
    };
    const nullGuarded = (region: CsharpRegion, name: string, line: number, depth = 0): boolean => {
        if ((depth > 6) || !laterWritesNonNull (region, name, line, depth)) return false;
        for (let k = line - 1; k > region.start; k--) {
            const l = region.lines[k].trim ();
            if (writesName (region.lines[k], name)) return false;
            if ((l === `if ((${name} != null))`) && ((region.lines[k + 1] ?? '').trim () === '{') && openThrough (region, k + 1, line)) return true;
            if ((l === `if ((${name} == null))`) && ((region.lines[k + 1] ?? '').trim () === '{')
                    && /^(throw|return)\b/.test ((region.lines[k + 2] ?? '').trim ()) && ((region.lines[k + 3] ?? '').trim () === '}') && openThrough (region, k + 3, line)) return true;
        }
        return false;
    };
    // the write of an `object` local that reaches `line`: a plain statement in a block still open at
    // `line` with no write of the name between, whose value is a non-null string
    const nonNullStringAt = (region: CsharpRegion, name: string, line: number, depth: number): boolean => {
        if (region.bound.has (name) || (region.params[name] !== undefined) || (depth > 6) || !laterWritesNonNull (region, name, line, depth)) return false;
        for (let k = line - 1; k > region.start; k--) {
            const l = region.lines[k];
            if (!writesName (l, name) && !new RegExp ('^[ ]*object[ ]+' + name + '[ ]*=').test (l)) continue;
            if (/=>/.test (l)) return false;
            const m = new RegExp ('^[ ]*(?:object[ ]+)?' + name + '[ ]*=[ ]*(.*);[ ]*$').exec (l);
            if ((m === null) || !openThrough (region, k, line)) return false;
            const value = lines[k].trim ().replace (/^(?:object[ ]+)?[A-Za-z_]\w*[ ]*=[ ]*/, '').replace (/;[ ]*$/, '');
            // a string-typed value (possibly null) behind a dominating null test
            return nonNullString (region, k, value, '\u0000', depth + 1) || ((typeOf (region, k, value, depth + 1) === 'string') && nullGuarded (region, name, line));
        }
        return false;
    };
    // a string local written once, by its declaration, with a non-null string value
    const singleWriteNonNull = (region: CsharpRegion, name: string, depth: number): boolean => {
        if (region.bound.has (name) || (region.params[name] !== undefined) || (depth > 6)) return false;
        const decls = region.declarations.filter ((x) => x.name === name);
        let writes = 0;
        for (let k = region.start + 1; k < region.end; k++) if (writesName (region.lines[k], name)) writes++;
        if ((decls.length !== 1) || (writes !== 1) || (decls[0].value === undefined)) return false;
        return nonNullString (region, decls[0].line, lines[decls[0].line].replace (/^[^=]*=[ ]*/, '').replace (/;[ ]*(?:\/\/.*)?$/, ''), '\u0000', depth + 1);
    };
    // handleOptionStringAndParams(2) answers its default for a missing option and throws on a non-string
    const optionTupleNonNull = (region: CsharpRegion, name: string, depth: number): boolean => {
        if (region.bound.has (name) || (region.params[name] !== undefined) || (depth > 6)) return false;
        const writeLines = [];
        for (let k = region.start + 1; k < region.end; k++) if (writesName (region.lines[k], name)) writeLines.push (k);
        if ((writeLines.length !== 1) || !new RegExp ('^[ ]*(?:\\(string\\?, object\\)|IList<object>|List<object>|var)[ ]+' + name + '[ ]*=').test (region.lines[writeLines[0]])) return false;
        const decls = [ { line: writeLines[0] } ];
        const text = lines[decls[0].line].replace (/^[^=]*=[ ]*/, '').replace (/;[ ]*(?:\/\/.*)?$/, '').replace (/^\(IList<object>\)/, '').trim ();
        const m = csharpHelperMaskLine (text);
        const call = /^this\.(handleOptionStringAndParams2?)\(/.exec (m);
        if ((call === null) || ownMember (call[1]) || (ownReturns[call[1]] !== undefined) || (csharpHelperCallEnd (m, call[0].length - 1) !== m.length - 1)) return false;
        const args = [];
        let from = call[0].length - 1;
        let at = csharpHelperTopLevelComma (m, from, m.length - 1);
        while (at !== undefined) { args.push (text.substring (from + 1, at)); from = at; at = csharpHelperTopLevelComma (m, at, m.length - 1); }
        args.push (text.substring (from + 1, m.length - 1));
        return (args.length === ((call[1] === 'handleOptionStringAndParams') ? 4 : 5)) && nonNullString (region, decls[0].line, args[args.length - 1], '\u0000', depth + 1);
    };
    const nonNullString = (region: CsharpRegion, line: number, text: string, self: string, depth: number): boolean => {
        const t = text.trim ();
        const m = csharpHelperMaskLine (t);
        if (depth > 8) return false;
        if (/^"(?:[^"\\]|\\.)*"$/.test (t)) return true;
        if ((t === self) || objectConcats.has (t)) return true;
        if (/^[A-Za-z_]\w*$/.test (t)) {
            if (region.bound.has (t)) return false;
            const d = csharpHelperReceiverType (region, t, line, region.params);
            if (d === undefined) return false;
            if ((d.type === 'string') || (d.type === 'string?')) return nullGuarded (region, t, line) || ((d.kind === 'local') && singleWriteNonNull (region, t, depth + 1));
            return (d.kind === 'local') && (d.type === 'object') && (nonNullStringLocal (region, t, depth + 1) || nonNullStringAt (region, t, line, depth + 1));
        }
        // element 0 of a handleOption*StringAndParams holder (pre-tuple `(string)H[0]` or `H.Item1`) with a non-null default
        const item = /^\(*(?:\(string\)\(?)?([A-Za-z_]\w*)(?:\.Item1|\[0\]| != null && 0 < \1\.Count \? \1\[0\] : null)\)*$/.exec (t);
        if (item !== null) return optionTupleNonNull (region, item[1], depth + 1);
        if (wrapped (m)) {
            const parts = plusOperands (m.slice (1, -1), t.slice (1, -1));
            // a C# string concatenation is never null
            if ((parts !== undefined) && (parts.length === 2)) return [ 0, 1 ].some ((n) => typeOf (region, line, parts[n], depth + 1) === 'string');
            return nonNullString (region, line, t.slice (1, -1), self, depth + 1);
        }
        const call = /^((?:this\.)?[A-Za-z_]\w*)\(/.exec (m);
        if ((call === null) || (csharpHelperCallEnd (m, call[0].length - 1) !== m.length - 1)) return false;
        const open = call[0].length - 1;
        const comma = csharpHelperTopLevelComma (m, open, m.length - 1);
        if (call[1] === 'add') return (comma !== undefined) && nonNullString (region, line, t.substring (open + 1, comma), self, depth + 1);
        // NumberToString answers null only for a null number
        if ((call[1] === 'this.numberToString') && (comma === undefined) && !ownMember ('numberToString') && (ownReturns['numberToString'] === undefined)) {
            const arg = t.substring (open + 1, m.length - 1).trim ();
            if (!/^[A-Za-z_]\w*$/.test (arg) || region.bound.has (arg)) return false;
            const d = csharpHelperReceiverType (region, arg, line, region.params);
            return (d !== undefined) && nullGuarded (region, arg, line);
        }
        // BinaryToBase16 (a null buffer throws in the hex loop) and IntToBase16 (Convert.ToInt64(null) is 0) never answer null
        if ([ 'this.binaryToBase16', 'this.intToBase16' ].includes (call[1]) && (comma === undefined)
                && !ownMember (call[1].slice (5)) && (ownReturns[call[1].slice (5)] === undefined)) return true;
        // SafeString / SafeString2 answer `defaultValue as string` for a missing / null value
        const arity = { 'this.safeString': 3, 'this.safeString2': 4 }[call[1]];
        if (arity !== undefined) {
            const args = [];
            let from = open;
            let at = comma;
            while (at !== undefined) { args.push (t.substring (from + 1, at)); from = at; at = csharpHelperTopLevelComma (m, at, m.length - 1); }
            args.push (t.substring (from + 1, m.length - 1));
            return (args.length === arity) && /^"(?:[^"\\]|\\.)*"$/.test (args[arity - 1].trim ());
        }
        return false;
    };
    const atom = (t: string) => {
        const s = t.trim ();
        const m = csharpHelperMaskLine (s);
        if (wrapped (m) || /^"(?:[^"\\]|\\.)*"$/.test (s) || /^[\w.]+$/.test (m)) return s;
        const call = /^[\w.]+\(/.exec (m);
        if ((call !== null) && (csharpHelperCallEnd (m, call[0].length - 1) === m.length - 1)) return s;
        return '(' + s + ')';
    };
    const rewrite = (region: CsharpRegion, line: number, text: string): string | undefined => {
        const m = csharpHelperMaskLine (text);
        const calls = [ ...m.matchAll (/(?<![A-Za-z0-9_.])(add|isEqual|isTrue)\(/g) ].reverse ();
        for (const c of calls) {
            const open = c.index + c[0].length - 1;
            const close = csharpHelperCallEnd (m, open);
            if (close === undefined) continue;
            const comma = csharpHelperTopLevelComma (m, open, close);
            let out: string | undefined = undefined;
            if (c[1] === 'isTrue') {
                if (comma !== undefined) continue;
                const arg = text.substring (open + 1, close);
                const ty = typeOf (region, line, arg);
                if (ty === 'bool') out = atom (arg);
                else if (ty === 'bool?') out = `(${atom (arg)} == true)`;
            } else {
                if ((comma === undefined) || (csharpHelperTopLevelComma (m, comma, close) !== undefined)) continue;
                const a = text.substring (open + 1, comma).trim ();
                const b = text.substring (comma + 1, close).trim ();
                const ta = typeOf (region, line, a);
                if (c[1] === 'add') {
                    // a non-null string box on the left: the helper's `(string)a + (string)b` for a string right
                    if (ta === 'string') out = `(${atom (a)} + ${atom (b)})`;
                    // both operands non-null string boxes -> the helper's `(string)a + (string)b`
                    else if ((ta === 'objstring') && (typeOf (region, line, b) === 'objstring') && !banned.has (`((string)${atom (a)} + (string)${atom (b)})`)) {
                        out = `((string)${atom (a)} + (string)${atom (b)})`;
                        objectConcats.add (out);
                    }
                    else if ((ta === 'objstring') && (typeOf (region, line, b) === 'string') && !banned.has (`(${atom (a)} + ${atom (b)})`)) {
                        out = `(${atom (a)} + ${atom (b)})`;
                        objectConcats.add (out);
                    }
                } else {
                    const tb = typeOf (region, line, b);
                    const literal = (x: string) => /^"(?:[^"\\]|\\.)*"$/.test (x) || /^-?[0-9]+$/.test (x) || /^(true|false)$/.test (x);
                    if (literal (a) && literal (b)) continue;
                    if (((ta === 'string') && (tb === 'string')) || ((ta === 'int') && (tb === 'int'))) out = `(${atom (a)} == ${atom (b)})`;
                    // lifted `==` on Int64? is isEqual's numeric compare with its null rows
                    else if ([ 'nint', 'int' ].includes (ta) && [ 'nint', 'int' ].includes (tb) && (ta === 'nint')) out = `(${atom (a)} == ${atom (b)})`;
                    else if ([ 'nint', 'string', 'bool?' ].includes (ta) && (b === 'null') && !/^"/.test (a)) out = `(${atom (a)} == null)`;
                    else if ((ta === 'bool?' || ta === 'bool') && /^(true|false)$/.test (b)) out = `(${atom (a)} == ${b})`;
                }
            }
            if (out === undefined) continue;
            return text.substring (0, c.index) + out + text.substring (close + 1);
        }
        return undefined;
    };
    return csharpLinePass (content, false, (region, line, masked, i) => {
        if (region.bound === undefined) regionNames (region);
        if (!/(?<![A-Za-z0-9_.])(add|isEqual|isTrue)\(/.test (masked) || /['@$]/.test (masked) || /^[ ]*(\/\/|\*|\/\*)/.test (masked)) return undefined;
        const comment = masked.indexOf ('//');
        let code = (comment < 0) ? lines[i] : lines[i].slice (0, comment);
        const fixpoint = (text: string) => {
            let next = rewrite (region, i, text);
            let guard = 0;
            while ((next !== undefined) && (guard++ < 200)) {
                text = next;
                next = rewrite (region, i, text);
            }
            return text;
        };
        const original = code;
        banned.clear ();
        objectListAt = { region, line: i };
        code = fixpoint (code);
        for (let round = 0; round < 20; round++) {
            const bad = objectConcatContextsBad (code);
            if (bad === undefined) break;
            banned.add (bad);
            code = fixpoint (original);
        }
        if (objectConcatContextsBad (code) !== undefined) code = original;
        const out = code + ((comment < 0) ? '' : lines[i].slice (comment));
        if (out === lines[i]) return undefined;
        lines[i] = out;
        return out;
    });
}

// snippet checks (part of `csharpTranspiler.ts --self-test`)
export function stringAddEqualityTruthSelfTest (): string[] {
    const problems: string[] = [];
    const wrap = (body: string) => 'namespace ccxt;\npublic partial class t : Exchange\n{\n    public virtual object f(object a, string b, string? c)\n    {\n'
        + body.split ('\n').map ((l) => '        ' + l).join ('\n') + '\n    }\n}\n';
    const check = snippetChecker (problems, 'string add equality truth self', (body) => csharpStringAddEqualityTruth (wrap (body)), csharpStringAddEqualityTruth);
    check ('string param left', 'object q = add(b, a);', 'object q = (b + a);');
    check ('binaryToBase16 box accumulates natively', 'object h = this.binaryToBase16(a);\nobject d = add(add(h, \"00\"), this.intToBase16(a));\nd = add(d, \"01\");', 'd = (d + \"01\");');
    check ('uuid5 string result left', 'string? q = this.uuid5(c, "x");\nobject d = add(this.uuid5(c, "y"), "-");', '(this.uuid5(c, "y") + "-")');
    check ('implodeHostname box keeps helper', 'object u = this.implodeHostname(a);\nobject d = add(u, \"/x\");', 'add(u, \"/x\")');
    check ('string? chain', 'object q = add(add(c, "-"), a);', '((c + "-") + a)');
    check ('object param left keeps helper', 'object q = add(a, "x");', 'add(a, "x")');
    check ('object literal-initialised local', 'object x = "/";\nx = add(x, b);', 'x = (x + b);');
    check ('object local safeString without default keeps helper', 'object y = this.safeString(a, "k");\nobject z = add(y, b);', 'add(y, b)');
    check ('object local safeString with literal default', 'object w = this.safeString(a, "k", "d");\nreturn add(add(w, ":"), b);', 'return ((w + ":") + b);');
    check ('object-left concat in a ternary keeps helper', 'object w = "d";\nobject t = a == null ? add(w, c) : 5;', 'add(w, c)');
    check ('object-left concat as an argument keeps helper', 'object w = "d";\nthis.f(add(w, c));', 'this.f(add(w, c))');
    check ('object-left concat into var keeps helper', 'object w = "d";\nvar t = add(w, c);', 'var t = add(w, c);');
    check ('object left with object right keeps helper', 'object w = "d";\nobject t = add(w, a);', 'add(w, a)');
    check ('null-guarded numberToString write', 'object id = null;\nif ((a != null))\n{\n    id = this.numberToString(a);\n    if ((b != null))\n    {\n        id = add(id, ("-" + b));\n    }\n}', 'id = (id + ("-" + b));');
    check ('loop write after the read keeps helper', 'object x = "a";\nwhile (true)\n{\n    object y = add(x, b);\n    x = null;\n}', 'add(x, b)');
    check ('unguarded numberToString keeps helper', 'object id = this.numberToString(a);\nobject z = add(id, b);', 'add(id, b)');
    check ('throw-guarded safeString local', 'object u = this.safeString(a, "x");\nif ((u == null))\n{\n    throw new Exception("x");\n}\nobject w = add(u, "/");', 'object w = (u + "/");');
    check ('for counter equality', 'int n = 3;\nfor (int i = 0; i < n; i++)\n{\n    if (isEqual(i, ((n - 1)))) {}\n}', 'if ((i == ((n - 1)))) {}');
    check ('lambda-bound counter keeps helper', 'int n = 3;\nFunc<object, object> g = (i) => isEqual(i, (n - 1));', 'isEqual(i, (n - 1))');
    check ('object vs int literal keeps helper', 'if (isEqual(a, 0)) {}', 'isEqual(a, 0)');
    check ('string call vs literal', 'if (isEqual(this.numberToString(a), "0")) {}', '(this.numberToString(a) == "0")');
    check ('bool? safeBool vs literal', 'if (isEqual(this.safeBool(a, "k"), true)) {}', '(this.safeBool(a, "k") == true)');
    check ('isTrue on bool? call', 'if (isTrue(this.safeBool(a, "k"))) {}', 'if ((this.safeBool(a, "k") == true)) {}');
    check ('isTrue on object keeps helper', 'if (isTrue(a)) {}', 'isTrue(a)');
    check ('option string tuple literal default', 'IList<object> q = null;\n(string?, object) mVariable = this.handleOptionStringAndParams2(a, \"f\", \"method\", \"spotMethod\", \"/t\");\nstring? sm = mVariable.Item1;\nobject m = sm;\nobject r = add(add(m, \":\"), b);', '((m + \":\") + b)');
    check ('option string holder (pre-tuple) literal default', 'IList<object> hVariable = (IList<object>)this.handleOptionStringAndParams2(a, \"f\", \"method\", \"spotMethod\", \"/t\");\nstring? sm = ((string)(hVariable != null && 0 < hVariable.Count ? hVariable[0] : null));\nobject m = sm;\nobject r = add(add(m, \":\"), b);', '((m + \":\") + b)');
    check ('option string holder (pre-tuple) null default keeps helper', 'IList<object> hVariable = (IList<object>)this.handleOptionStringAndParams(a, \"f\", \"method\", c);\nstring? sm = (string)hVariable[0];\nobject m = sm;\nobject r = add(m, b);', 'add(m, b)');
    check ('option string tuple null default keeps helper', '(string?, object) mVariable = this.handleOptionStringAndParams(a, \"f\", \"method\", c);\nobject m = mVariable.Item1;\nobject r = add(m, b);', 'add(m, b)');
    check ('object concat as List<object>.Add argument', 'List<object> xs = new List<object>() {};\nobject w = \"d\";\nxs.Add(add(add(w, \":\"), b));', 'xs.Add(((w + \":\") + b));');
    check ('object concat as object-param Add argument keeps helper', 'object w = \"d\";\na.Add(add(add(w, \":\"), b));', 'a.Add(add(add(w, \":\"), b));');
    check ('own string member shadow keeps helper', 'object q = add(this.id, a);\n    }\n    public object id;\n    public void g()\n    {', 'add(this.id, a)');
    const tests = csharpStringAddEqualityTruth ('namespace Tests;\npublic partial class t\n{\n    public void f(string b)\n    {\n        object q = add(b, 1);\n    }\n}\n');
    if (!tests.includes ('add(b, 1)')) problems.push ('string add equality truth self tests namespace rewritten');
    return problems;
}

// the per-line driver of the two-argument helper passes: each top-level `helper(a, b)` call on a method body line
// (not overlapping an earlier rewrite on that line) goes to `emit`, which answers its replacement or undefined
function csharpTwoArgCallPass (content: string, helper: string, emit: (region: CsharpRegion, line: number, call: { start: number, close: number, masked: string, a: string, b: string, aText: string, bText: string }) => string | undefined): string {
    if (!new RegExp ('\\b' + helper + '\\(').test (content) || /^namespace Tests;/m.test (content)) {
        return content;
    }
    return csharpLinePass (content, false, (region, original, masked, i) => {
        if (!new RegExp ('\\b' + helper + '\\(').test (masked)) return undefined;
        const edits = [];
        const calls = new RegExp ('(?<![A-Za-z_.])' + helper + '\\(', 'g');
        let m;
        while ((m = calls.exec (masked)) !== null) {
            const open = m.index + m[0].length - 1;
            const close = csharpHelperCallEnd (masked, open);
            if (close === undefined) continue;
            if (edits.some ((e) => (m.index < e.end) && (close >= e.start))) continue;
            const comma = csharpHelperTopLevelComma (masked, open, close);
            if ((comma === undefined) || (csharpHelperTopLevelComma (masked, comma, close) !== undefined)) continue;
            const text = emit (region, i, { start: m.index, close, masked, a: masked.substring (open + 1, comma).trim (), b: masked.substring (comma + 1, close).trim (),
                aText: original.substring (open + 1, comma).trim (), bText: original.substring (comma + 1, close).trim () });
            if (text !== undefined) edits.push ({ start: m.index, end: close + 1, text });
        }
        if (edits.length === 0) return undefined;
        let out = original;
        for (const e of edits.sort ((a, b) => b.start - a.start)) out = out.substring (0, e.start) + e.text + out.substring (e.end);
        return out;
    });
}

// the types of every typed binding of `name` in the method (declarations, loop headers, lambdas, params);
// a generic type with a space is captured from its last segment (`object>`) unless `pair` reads `<string, object>`
function csharpTypedBindings (region: CsharpRegion, name: string, pair = false): Set<string> {
    const typed = new RegExp ('([A-Za-z_][\\w<>?.\\[\\]]*' + (pair ? '(?:, object>)?' : '') + ')[ ]+' + name + '\\b(?=[ ]*(?:=[^=]|;|\\)|,|in\\b))', 'g');
    const seen = new Set<string> ();
    for (let k = region.start; k < region.end; k++) {
        for (const m of region.lines[k].matchAll (typed)) {
            if (![ 'return', 'throw', 'else', 'case', 'await', 'new', 'in' ].includes (m[1])) seen.add (m[1]);
        }
    }
    return seen;
}

// a lambda parameter (or, with `refOut`, a ref/out sink) rebinds `name` somewhere in the method
function csharpRebinds (region: CsharpRegion, name: string, refOut = true): boolean {
    const lambda = new RegExp ('\\((?:[ ]*[A-Za-z_]\\w*[ ]*,)*[ ]*' + name + '[ ]*(?:,[ ]*[A-Za-z_]\\w*[ ]*)*\\)[ ]*=>');
    const sink = new RegExp ('\\b(?:ref|out)[ ]+' + name + '\\b');
    return region.lines.slice (region.start, region.end).some ((l) => lambda.test (l) || (refOut && sink.test (l)));
}

// a snippet suite: the case table, then the `namespace Tests` input must come back unchanged
function snippetSuite (label: string, pass: (text: string) => string, wrap: (body: string) => string, cases: [string, string, string][], keeps: [string, string][], tail: number, idempotent: boolean, tests: string, testsProblem: string): string[] {
    const problems = snippetCaseProblems (label, pass, wrap, cases, keeps, tail, idempotent);
    if (pass (tests) !== tests) problems.push (testsProblem);
    return problems;
}

// getValue reads earlier passes leave on a declared receiver: hand-written base dictionary / list
// fields, `object` keys on declared dictionaries (GetValue's `(string)key` cast kept), ws book
// receivers, int-expression list indexes and `string` char reads.
export function csharpDeclaredGetValue (content: string): string {
    // hand-written field types (cs/ccxt/base/Exchange.Options.cs); no venue redeclares them
    const dictFields = [ 'features', 'userAgents', 'has', 'timeframes', 'precision', 'markets', 'markets_by_id',
        'currencies_by_id', 'options', 'balance', 'tickers', 'fundingRates', 'bidsasks', 'trades', 'ohlcvs' ];
    const listFields = [ 'symbols', 'codes', 'ids' ];
    const dictTypes = [ 'Dictionary<string,object>', 'IDictionary<string,object>', 'ConcurrentDictionary<string,object>', 'ccxt.pro.IOrderBook' ];
    const listTypes = [ 'List<object>', 'IList<object>', 'ccxt.pro.IBids', 'ccxt.pro.IAsks', 'ccxt.pro.IOrderBookSide' ];
    return csharpTwoArgCallPass (content, 'getValue', (region, i, { start: at, close, masked: line, a: r, b: keyMask, bText: k }) => {
        const { start, params, declarations, lines: masked } = region;
        // every typed binding of `name` in the method is `type`, and no lambda rebinds it
        const onlyBinding = (name: string, type: string) => [ ...csharpTypedBindings (region, name) ].every ((t) => [ type.split (' ').pop (), 'ref', 'out' ].includes (t)) && !csharpRebinds (region, name, false);
        const declared = (name: string) => (/^[A-Za-z_]\w*$/.test (name) ? csharpHelperReceiverType (region, name, i, params) : undefined);
        const intName = (name: string) => (params[name] === undefined) && onlyBinding (name, 'int')
            && (declarations.some ((d) => (d.name === name) && (d.line < i)) || masked.some ((l, j) => (j > start) && (j <= i) && new RegExp ('\\bfor[ ]*\\([ ]*int[ ]+' + name + '[ ]*=').test (l)));
        // a C# int index: a literal, or `+`/`-` over int-only names and literals (pure, read twice)
        const intIndex = (text: string) => {
            if (/^\d{1,9}$/.test (text) || (/^[A-Za-z_]\w*$/.test (text) && intName (text))) return true;
            if (!/^[\w ()+-]+$/.test (text) || !/[+-]/.test (text) || !text.startsWith ('(')) return false;
            const names = text.match (/[A-Za-z_]\w*/g) ?? [];
            return (names.length > 0) && names.every ((x) => intName (x)) && !/\b\d{10,}\b/.test (text);
        };
        const field = /^this\.([A-Za-z_]\w*)$/.exec (r);
        const local = (field === null) ? declared (r) : undefined;
        const rType = (field !== null) ? (dictFields.includes (field[1]) ? 'dict' : (listFields.includes (field[1]) ? 'list' : undefined))
            : ((local === undefined) ? undefined : (dictTypes.includes (local.type.replace (/\s+/g, '')) ? 'dict'
                : (listTypes.includes (local.type) ? 'list' : ([ 'string', 'string?' ].includes (local.type) ? 'string' : undefined))));
        if ((rType === undefined) || ((field === null) && !onlyBinding (r, local.type))) return undefined;
        if (rType === 'dict') {
            const literal = /^"[ ]*"$/.test (keyMask);
            const key = literal ? undefined : declared (keyMask);
            if (literal || ((key !== undefined) && (key.type === 'string'))) {
                return dictionaryGetValue (r, k, literal ? 'literal' : 'string');
            } else if ((key !== undefined) && ((key.type === 'object') || (key.type === 'string?')) && onlyBinding (keyMask, key.type)) {
                return dictionaryGetValue (r, k, key.type);
            }
        } else if (rType === 'list') {
            // the IList<object> branch: at or past Count reads null, a negative index throws in both
            if (intIndex (keyMask)) return `(${r} != null && ${k} < ${r}.Count ? ${r}[${k}] : null)`;
        } else if (/^\d{1,9}$/.test (keyMask) || intName (keyMask)) {
            // the string branch: `str[i].ToString()` (out of range throws in both); only where the
            // read is compared, so the `string` result cannot rebind an overload
            const after = line.substring (close + 1);
            if (/^\)*[ ]+is[ ]+"/.test (after) || (/isEqual\($/.test (line.substring (0, at)) && /^[ ]*,/.test (after))) return `(${r} != null ? ${r}[${k}].ToString() : null)`;
        }
        return undefined;
    });
}

// GetValue's dictionary branch inline: null receiver / key read null, a literal key skips the key test,
// an `object` key is cast like the helper (a non-string key throws there too)
function dictionaryGetValue (r: string, k: string, keyType: string): string {
    const sk = (keyType === 'object') ? `(string)${k}` : k;
    return (keyType === 'literal') ? `(${r} != null && ${r}.ContainsKey(${k}) ? ${r}[${k}] : null)` : `(${r} != null && ${k} != null && ${r}.ContainsKey(${sk}) ? ${r}[${sk}] : null)`;
}

// the shared snippet runner: each case's output must contain its expected text (and be a fixed point when
// `idempotent`), each keep must come back unchanged
function snippetCaseProblems (label: string, pass: (text: string) => string, wrap: (body: string) => string, cases: [string, string, string][], keeps: [string, string][], tail: number, idempotent = true): string[] {
    const problems: string[] = [];
    for (const [ name, body, expected ] of cases) {
        const out = pass (wrap (body));
        if (!out.includes (expected)) problems.push (`${label}: ${name}: ${out.slice (-tail)}`);
        if (idempotent && (pass (out) !== out)) problems.push (`${label}: ${name}: not idempotent`);
    }
    for (const [ name, body ] of keeps) {
        const out = pass (wrap (body));
        if (out !== wrap (body)) problems.push (`${label} keeps ${name}: ${out.slice (-tail)}`);
    }
    return problems;
}

// snippet checks (run from csharpNativeEmissionSelfTest)
function declaredGetValueSelfTest (): string[] {
    const wrap = (body: string, ns = 'ccxt') => `namespace ${ns};\npublic partial class t : Exchange\n{\n    public virtual object f(object key, string s, IDictionary<string, object> d, ccxt.pro.IOrderBook ob)\n    {\n${body}\n    }\n}\n`;
    const cases: [string, string, string][] = [
        [ 'base dict field + literal', '        object a = getValue(this.userAgents, "chrome");', '(this.userAgents != null && this.userAgents.ContainsKey("chrome") ? this.userAgents["chrome"] : null)' ],
        [ 'object key casts like the helper', '        object a = getValue(this.balance, key);', '(this.balance != null && key != null && this.balance.ContainsKey((string)key) ? this.balance[(string)key] : null)' ],
        [ 'string key on a param dict', '        object a = getValue(d, s);', '(d != null && s != null && d.ContainsKey(s) ? d[s] : null)' ],
        [ 'order book receiver', '        object a = getValue(ob, "nonce");', '(ob != null && ob.ContainsKey("nonce") ? ob["nonce"] : null)' ],
        [ 'list field + int loop index', '        for (int i = 0; i < 3; i++)\n        {\n            object a = getValue(this.symbols, i);\n        }', '(this.symbols != null && i < this.symbols.Count ? this.symbols[i] : null)' ],
        [ 'int expression index', '        List<object> xs = new List<object>() {};\n        int n = xs.Count;\n        object a = getValue(xs, (n - 1));', '(xs != null && (n - 1) < xs.Count ? xs[(n - 1)] : null)' ],
        [ 'string char compared', '        string? c = null;\n        if ((getValue(c, 0) is "-")) { }', '((c != null ? c[0].ToString() : null) is "-")' ],
    ];
    const keeps: [string, string][] = [
        [ 'object receiver', '        object o = null;\n        object a = getValue(o, "k");' ],
        [ 'object index on a list', '        List<object> xs = new List<object>() {};\n        object i = 0;\n        object a = getValue(xs, i);' ],
        [ 'string char not compared', '        string? c = null;\n        object a = getValue(c, 0);' ],
        [ 'unknown field', '        object a = getValue(this.fees, "trading");' ],
        [ 'Int64 expression index', '        List<object> xs = new List<object>() {};\n        Int64 n = 2;\n        object a = getValue(xs, (n - 1));' ],
    ];
    return snippetSuite ('declared get value self test', csharpDeclaredGetValue, wrap, cases, keeps, 400, false, wrap ('        object a = getValue(this.userAgents, "chrome");', 'Tests'), 'declared get value self test tests namespace changed');
}

// Retypes `object` numeric locals whose every read hands the box to a helper blind to the typed spelling,
// so typed twins / native operators apply: (A) `safeInteger(..) - N` read only by multiply/divide -> Int64?;
// (B) `s = this.sum(s, C)` counters -> Int64 and `for` counters -> `i++`; (C) guarded negation -> `(x = -x)`.
// the whole-region rewrite driver: `body` edits lines through `set`; `region ()` re-reads the declarations
// after edits; a changed file goes through csharpNativeArithmetic
function csharpRegionEdits (content: string, trigger: RegExp, body: (r: { start: number, end: number, params: any, lines: string[], masked: string[], set: (i: number, next: string) => void, region: () => CsharpRegion }) => void): string {
    if (!trigger.test (content) || /^namespace Tests\b/m.test (content)) {
        return content;
    }
    const lines = content.split ('\n');
    const masked = lines.map (csharpHelperMaskLine);
    let changed = false;
    const set = (i: number, next: string) => {
        if (next !== lines[i]) { lines[i] = next; masked[i] = csharpHelperMaskLine (next); changed = true; }
    };
    for (const { start, end, params } of csharpRegions (masked)) {
        const region = () => ({ start, end, params, declarations: csharpRegionDeclarations (masked, start, end), lines: masked });
        body ({ start, end, params, lines, masked, set, region });
    }
    return changed ? csharpNativeArithmetic (lines.join ('\n')) : content;
}

export function csharpObjectNumericLocalRetype (content: string): string {
    const compare = [ 'isLessThan', 'isGreaterThan', 'isLessThanOrEqual', 'isGreaterThanOrEqual', 'isEqual' ];
    const intKinds = [ 'int', 'Int64', 'Int64?' ];
    return csharpRegionEdits (content, /(?<![\w.])(?:postFixIncrement|prefixUnaryNeg|multiply|divide)\(/, ({ start, end, lines, masked, set, region }) => {
        const nameRe = (name: string) => new RegExp ('(?<![\\w.])' + name + '(?![\\w])', 'g');
        // every occurrence of `name` after its declaration line: [line, column]
        const uses = (name: string, decl: number) => {
            const at: [number, number][] = [];
            for (let i = start + 1; i < end; i++) {
                if (i === decl) continue;
                for (const m of masked[i].matchAll (nameRe (name))) at.push ([ i, m.index ]);
            }
            return at;
        };
        const single = (name: string) => region ().declarations.filter ((d) => d.name === name);
        const typeOf = (name: string, line: number) => {
            const r = region ();
            const sink = new RegExp ('\\b(?:ref|out)[ ]+' + name + '\\b');
            for (let k = start + 1; k < end; k++) if (sink.test (masked[k])) return undefined;
            return csharpHelperReceiverType (r, name, line, r.params)?.type;
        };
        // (A) Int64? page offsets
        for (let i = start + 1; i < end; i++) {
            const m = /^[ ]*object ([A-Za-z_]\w*) = \((this\.safeInteger2?\(.*\)) - (\d{1,9})\);[ ]*$/.exec (masked[i]);
            if ((m === null) || (csharpClosingParen (m[2], m[2].indexOf ('(')) !== m[2].length - 1) || (single (m[1]).length !== 1)) continue;
            const ok = uses (m[1], i).every (([ k, col ]) => {
                const call = enclosingHelperCall (masked[k], col);
                return (call !== undefined) && (call.arg === m[1]) && [ 'multiply', 'divide' ].includes (call.name) && (call.index <= 1);
            });
            if (ok) set (i, lines[i].replace ('object ' + m[1] + ' = ', 'Int64? ' + m[1] + ' = '));
        }
        // (B) integer-literal counters advanced by this.sum
        for (let i = start + 1; i < end; i++) {
            const m = /^[ ]*object ([A-Za-z_]\w*) = (\d{1,9});[ ]*$/.exec (masked[i]);
            if ((m === null) || (single (m[1]).length !== 1)) continue;
            const s = m[1];
            let sums = 0;
            const ok = uses (s, i).every (([ k, col ]) => {
                const text = masked[k];
                const write = new RegExp ('^[ ]*' + s + ' = this\\.sum\\(' + s + ', ([A-Za-z_]\\w*)\\);[ ]*$').exec (text);
                if ((write !== null) && (col === text.indexOf (s))) return intKinds.includes (typeOf (write[1], k));
                if ((write !== null) && (col === text.indexOf ('(' + s) + 1)) { sums++; return true; }
                if (new RegExp ('^[ ]*for \\(object [A-Za-z_]\\w* = ' + s + ';').test (text) && (text.indexOf ('= ' + s + ';') + 2 === col)) return true;
                const call = enclosingHelperCall (text, col);
                if ((call === undefined) || (call.arg !== s)) return false;
                if (compare.includes (call.name)) return true;
                if ((call.name === 'this.sum') && (call.index === 0)) {
                    const sum = new RegExp ('this\\.sum\\(' + s + ', ([A-Za-z_]\\w*)\\)').exec (text.slice (col - 9));
                    return (sum !== null) && intKinds.includes (typeOf (sum[1], k));
                }
                return false;
            });
            if (ok && (sums > 0)) set (i, lines[i].replace ('object ' + s + ' = ', 'Int64 ' + s + ' = '));
        }
        for (let i = start + 1; i < end; i++) {
            const loop = /^([ ]*)for \(object ([A-Za-z_]\w*) = ([A-Za-z_]\w*); (.*); postFixIncrement\(ref \2\)\)[ ]*$/.exec (masked[i]);
            if ((loop === null) || (masked[i + 1]?.trim () !== '{')) continue;
            const type = typeOf (loop[3], i);
            if (!intKinds.includes (type)) continue;
            const blockEnd = csharpBlockEnd (masked, i + 1, end);
            if (!counterReadsNormalise (masked, i + 2, blockEnd - 1, loop[4], loop[2])) continue;
            set (i, lines[i].replace ('for (object ' + loop[2] + ' = ', 'for (' + type + ' ' + loop[2] + ' = ').replace ('postFixIncrement(ref ' + loop[2] + '))', loop[2] + '++)'));
        }
        // (C) guarded in-place negation of a safeNumber local
        for (let i = start + 1; i < end; i++) {
            const m = /^[ ]*object ([A-Za-z_]\w*) = (this\.(?:safeNumber2?|safeFloat)\(.*\));[ ]*$/.exec (masked[i]);
            if ((m === null) || (csharpClosingParen (m[2], m[2].indexOf ('(')) !== m[2].length - 1) || (single (m[1]).length !== 1)) continue;
            const x = m[1];
            const site = 'prefixUnaryNeg(ref ' + x + ')';
            let sites = 0;
            const ok = uses (x, i).every (([ k, col ]) => {
                const text = masked[k];
                const before = text.slice (0, col);
                const after = text.slice (col + x.length);
                if (before.endsWith ('prefixUnaryNeg(ref ')) {
                    const prefix = text.slice (0, col - 'prefixUnaryNeg(ref '.length);
                    const cond = new RegExp ('\\(!\\(' + x + ' == null\\) && [^?:|]*\\) \\? $').test (prefix);
                    if (cond || isNonNullGuarded (masked, start, k, col, x)) { sites++; return true; }
                    return false;
                }
                if (/^[ ]*[!=]= null/.test (after)) return true;
                if (/: $/.test (before) && /^;/.test (after)) return true; // ternary else arm
                const call = enclosingHelperCall (text, col);
                return (call !== undefined) && (call.arg === x) && (compare.includes (call.name) || (call.name === 'this.numberToString'));
            });
            if (!ok || (sites === 0)) continue;
            set (i, lines[i].replace ('object ' + x + ' = ', 'double? ' + x + ' = '));
            for (let k = i + 1; k < end; k++) {
                if (masked[k].includes (site)) set (k, lines[k].split (site).join ('(' + x + ' = -' + x + ')'));
            }
        }
    });
}

// snippet checks (run from csharpNativeEmissionSelfTest)
export function objectNumericLocalRetypeSelfTest (): string[] {
    const problems: string[] = [];
    const wrap = (body: string) => 'namespace ccxt;\npublic partial class t : Exchange\n{\n    public virtual object f(object o, IList<object> xs, Int64? limit = null)\n    {\n' + body + '\n    }\n}\n';
    const check = snippetChecker (problems, 'object numeric local retype self', (body) => csharpObjectNumericLocalRetype (wrap (body)));
    check ('page offset -> Int64? twin', '        int maxEntries = 100;\n        object page = (this.safeInteger(o, "p", 1) - 1);\n        Int64? off = this.safeInteger(o, "offset", multiply(page, maxEntries));',
        'Int64? off = this.safeInteger(o, "offset", (page * maxEntries));');
    check ('page read elsewhere keeps object', '        int maxEntries = 100;\n        object page = (this.safeInteger(o, "p", 1) - 1);\n        object a = multiply(page, maxEntries);\n        return page;', 'multiply(page, maxEntries)');
    const chunk = '        Int64? chunkSize = this.safeInteger(this.options, "k", 100);\n        int n = (xs?.Count ?? 0);\n        object startIndex = 0;\n        while (isLessThan(startIndex, n))\n        {\n            object endIndex = this.sum(startIndex, chunkSize);\n            if (isGreaterThan(endIndex, n))\n            {\n                endIndex = n;\n            }\n            List<object> chunk = new List<object>() {};\n            for (object i = startIndex; isLessThan(i, endIndex); postFixIncrement(ref i))\n            {\n                chunk.Add(getValue(xs, i));\n            }\n            startIndex = this.sum(startIndex, chunkSize);\n        }';
    check ('chunk counter -> Int64 i++', chunk, 'for (Int64 i = startIndex; isLessThan(i, endIndex); i++)', 'postFixIncrement');
    check ('chunk start retyped', chunk, 'Int64 startIndex = 0;');
    check ('chunk counter read as value keeps helper', chunk.replace ('chunk.Add(getValue(xs, i));', 'chunk.Add(i);'), 'postFixIncrement(ref i)');
    check ('start written otherwise keeps object', chunk.replace ('startIndex = this.sum(startIndex, chunkSize);', 'startIndex = this.sum(startIndex, chunkSize);\n            startIndex = "x";'), 'object startIndex = 0;');
    check ('Int64? start counter -> Int64? i++', '        Int64? c = this.safeInteger(o, "c", 1);\n        Int64? start = (c * 2);\n        object end = add(start, c);\n        for (object i = start; isLessThan(i, end); postFixIncrement(ref i))\n        {\n            object v = getValue(xs, i);\n        }', 'for (Int64? i = start; isLessThan(i, end); i++)');
    check ('guarded safeNumber negation in place', '        object d = this.safeNumber(o, 2);\n        object size = (!(d == null) && isLessThan(d, 0)) ? prefixUnaryNeg(ref d) : d;\n        string side = (!(d == null) && isLessThan(d, 0)) ? "asks" : "bids";',
        'object size = (!(d == null) && isLessThan(d, 0)) ? (d = -d) : d;');
    check ('guarded safeNumber retyped', '        object d = this.safeNumber(o, 2);\n        if (!(d == null))\n        {\n            string s = this.numberToString(prefixUnaryNeg(ref d));\n        }', 'double? d = this.safeNumber(o, 2);');
    check ('unguarded safeNumber negation keeps helper', '        object d = this.safeNumber(o, 2);\n        object size = (isLessThan(d, 0)) ? prefixUnaryNeg(ref d) : d;', 'prefixUnaryNeg(ref d)');
    check ('safeNumber cast read keeps helper', '        object d = this.safeNumber(o, 2);\n        if (!(d == null))\n        {\n            string s = this.numberToString(prefixUnaryNeg(ref d));\n            string t = ((string)d);\n        }', 'prefixUnaryNeg(ref d)');
    return problems;
}

// `isEqual(E, "lit")` -> `(E is "lit")` for literals with a digit the earlier rule leaves:
// Double.TryParse cannot read a literal with an ASCII letter other than e/E (and no nan/inf), so isEqual
// answers false at its isNumber gate for every box but an equal string. E: object/string name, list element, getValue call.
export function csharpDigitLiteralEquality (content: string): string {
    const neverNumeric = (body: string) => /[0-9]/.test (body) && /^[\x20-\x7e]*$/.test (body) && !/[\\"]/.test (body)
        && /[A-DF-Za-df-z]/.test (body) && !/nan|inf/i.test (body);
    return csharpTwoArgCallPass (content, 'isEqual', (region, i, { close, aText: left, bText: right }) => {
        const { start, params, lines: masked } = region;
        // every typed binding of `name` in the method is one of `types`, and no lambda / ref / out rebinds it
        const onlyBinding = (name: string, types: string[]) => [ ...csharpTypedBindings (region, name) ].every ((t) => types.includes (t)) && !csharpRebinds (region, name);
        const declaredAs = (name: string, types: string[]) => {
            const t = csharpHelperReceiverType (region, name, i, params);
            return (t !== undefined) && types.includes (t.type.replace (/\s+/g, ' ')) && onlyBinding (name, types.map ((x) => x.split (' ').pop ()));
        };
        // the operand's static C# type is object or string, and reading it once is what the call did
        const objectOperand = (text: string) => {
            let m = /^([A-Za-z_]\w*)$/.exec (text);
            if (m !== null) return declaredAs (m[1], [ 'object', 'string', 'string?' ]);
            m = /^([A-Za-z_]\w*)\[([A-Za-z_]\w*)\]$/.exec (text);
            const intIndex = (j: string) => (params[j] === undefined) && onlyBinding (j, [ 'int' ])
                && (declaredAs (j, [ 'int' ]) || masked.some ((l, k) => (k > start) && (k <= i) && new RegExp ('\\bfor[ ]*\\([ ]*int[ ]+' + j + '[ ]*=').test (l)));
            if (m !== null) return declaredAs (m[1], [ 'List<object>', 'IList<object>' ]) && intIndex (m[2]);
            return /^getValue\(/.test (text) && (csharpHelperCallEnd (text, 8) === text.length - 1);
        };
        const lit = /^"([^"\\]*)"$/.exec (right);
        return ((lit === null) || !neverNumeric (lit[1]) || !objectOperand (left)) ? undefined : `(${left} is ${right})`;
    });
}

// snippet checks (run from the --self-test path)
function digitLiteralEqualitySelfTest (): string[] {
    const wrap = (body: string, ns = 'ccxt') => `namespace ${ns};\npublic partial class t : Exchange\n{\n    public virtual object f(object api, string? s, List<object> xs)\n    {\n${body}\n    }\n}\n`;
    const cases: [string, string, string][] = [
        [ 'object local, letter+digit literal', '        object apiName = getValue(api, 0);\n        if (isEqual(apiName, "v2Private")) { }', 'if ((apiName is "v2Private")) { }' ],
        [ 'negated', '        object apiName = getValue(api, 0);\n        bool b = !isEqual(apiName, "sapiV3");', 'bool b = !(apiName is "sapiV3");' ],
        [ 'list element', '        for (int j = 0; j < xs.Count; j++)\n        {\n            if (isEqual(xs[j], "TRD_GRP_003")) { }\n        }', '(xs[j] is "TRD_GRP_003")' ],
        [ 'getValue operand', '        if (isEqual(getValue(api, 1), "v4Public")) { }', '(getValue(api, 1) is "v4Public")' ],
        [ 'string? param', '        if (isEqual(s, "v3")) { }', '(s is "v3")' ],
    ];
    const keeps: [string, string][] = [
        [ 'numeric-looking literal', '        object side = getValue(api, 0);\n        if (isEqual(side, "3")) { }' ],
        [ 'exponent literal', '        object v = getValue(api, 0);\n        if (isEqual(v, "1e5")) { }' ],
        [ 'Infinity literal', '        object v = getValue(api, 0);\n        if (isEqual(v, "Infinity1")) { }' ],
        [ 'Int64 operand', '        Int64 v = 1;\n        if (isEqual(v, "v2")) { }' ],
        [ 'rebound with another type', '        object v = getValue(api, 0);\n        if (isEqual(v, "v2")) { }\n        Func<Int64, object> g = (v) => v;' ],
        [ 'call operand', '        if (isEqual(this.k(), "v2")) { }' ],
        [ 'object index on list', '        object j = 0;\n        if (isEqual(xs[j], "v2")) { }' ],
    ];
    return snippetSuite ('digit literal equality self test', csharpDigitLiteralEquality, wrap, cases, keeps, 400, true, wrap ('        object a = getValue(api, 0);\n        if (isEqual(a, "v2")) { }', 'Tests'), 'digit literal equality self test tests namespace changed');
}

// (A) subtract on Int64?/double? names proven non-null by a non-null single-binding declaration, a
// dominating `if (x == null) { exit | x = <non-null> }`, or the guarded-math pass's guard;
// (C) guarded negations. double? products keep multiply (its IsInteger re-box is observable).
function isNonNullNumericAtom (text: string, typeOf: (name: string) => string | undefined, nonNullName: (name: string) => boolean): boolean {
    const t = csharpStripParens (text);
    if (/^-?\d{1,15}L?$/.test (t) || /^\d+\.\d+$/.test (t) || /^this\.(milliseconds|seconds)\(\)$/.test (t)) return true;
    if (/^[A-Za-z_]\w*$/.test (t)) {
        const type = typeOf (t);
        if ([ 'int', 'Int64', 'long', 'double' ].includes (type)) return true;
        return [ 'Int64?', 'long?', 'double?' ].includes (type) && nonNullName (t);
    }
    // parseToInt never answers null for a finite in-range number: numberToString(null) parses to 0
    const parse = /^this\.parseToInt\((.*)\)$/.exec (t);
    if ((parse !== null) && (csharpClosingParen (t, 'this.parseToInt'.length) === t.length - 1)) {
        const arg = csharpStripParens (parse[1]);
        const div = /^\(double\?\)([A-Za-z_]\w*) \/ \d{1,9}$/.exec (arg);
        return (div !== null) && [ 'int', 'Int64', 'Int64?', 'long', 'long?' ].includes (typeOf (div[1]));
    }
    const safe = /^this\.safeInteger\((.*)\)$/.exec (t);
    if ((safe !== null) && (csharpClosingParen (t, 'this.safeInteger'.length) === t.length - 1)) {
        const args = topLevelSplit (safe[1], ',');
        return (args.length === 3) && /^-?\d{1,9}$/.test (args[2].trim ());
    }
    // `((n == null)) ? A : n` / `((n != null)) ? n : A`, or both arms non-null
    const q = topLevelSplit (t, ' ? ');
    if (q.length === 2) {
        const arms = topLevelSplit (q[1], ' : ');
        if (arms.length !== 2) return false;
        const cond = csharpStripParens (q[0]);
        const eq = /^([A-Za-z_]\w*) == null$/.exec (cond);
        const ne = /^([A-Za-z_]\w*) != null$/.exec (cond);
        if ((eq !== null) && (csharpStripParens (arms[1]) === eq[1])) return isNonNullNumericAtom (arms[0], typeOf, nonNullName);
        if ((ne !== null) && (csharpStripParens (arms[0]) === ne[1])) return isNonNullNumericAtom (arms[1], typeOf, nonNullName);
        return isNonNullNumericAtom (arms[0], typeOf, nonNullName) && isNonNullNumericAtom (arms[1], typeOf, nonNullName);
    }
    const binary = topLevelBinaryOperands (t);
    return (binary !== undefined) && isNonNullNumericAtom (binary.left, typeOf, nonNullName) && isNonNullNumericAtom (binary.right, typeOf, nonNullName);
}

// ordered comparisons whose operands the name pass leaves: `for (Int64 i = …)` counters, `Int64?` locals
// bound once from `safeInteger*(…, <int literal>)` (never null: SafeIntegerN answers the default), and
// handleErrors' `object` status code vs a positive literal.
export function csharpNonNullIntCompare (content: string): string {
    return csharpOrderedComparePass (content, (region, line, name, a, b) => nonNullIntCompareText (region, line, name, a, b));
}

// ordered-compare passes: each 2-arg `isLessThan|isGreaterThan[OrEqual](a, b)` call on a body line goes to
// `emit`; non-nested answers are spliced in, right to left
function csharpOrderedComparePass (content: string, emit: (region: CsharpRegion, line: number, name: string, a: string, b: string) => string | undefined): string {
    if (!/(?<![\w.])(?:isLessThan|isGreaterThan|isLessThanOrEqual|isGreaterThanOrEqual)\(/.test (content) || /^namespace Tests\b/m.test (content)) {
        return content;
    }
    return csharpLinePass (content, true, (region, original, masked, line) => {
        if (/['@$]/.test (original)) return undefined;
        const edits = [];
        const call = /(?<![\w.])(isLessThan|isGreaterThan|isLessThanOrEqual|isGreaterThanOrEqual)\(/g;
        let m;
        while ((m = call.exec (masked)) !== null) {
            const open = m.index + m[0].length - 1;
            const close = csharpHelperCallEnd (masked, open);
            if (close === undefined) continue;
            const comma = csharpHelperTopLevelComma (masked, open, close);
            if ((comma === undefined) || (csharpHelperTopLevelComma (masked, comma, close) !== undefined)) continue;
            const text = emit (region, line, m[1], original.substring (open + 1, comma).trim (), original.substring (comma + 1, close).trim ());
            if (text !== undefined) edits.push ({ start: m.index, end: close + 1, text });
        }
        if (edits.length === 0) return undefined;
        let out = original;
        for (const e of edits.sort ((x, y) => y.start - x.start)) {
            if (edits.some ((o) => (o !== e) && (o.start <= e.start) && (e.end <= o.end))) continue;
            out = out.substring (0, e.start) + e.text + out.substring (e.end);
        }
        return (out === original) ? undefined : out;
    });
}

// any write of `name` in the region other than its declaration line
function isWrittenAfterDeclaration (region: CsharpRegion, name: string, declLine: number): boolean {
    const write = new RegExp ('(?<![\\w.])' + name + '[ ]*(?:=[^=>]|\\+=|-=|\\*=|/=|\\?\\?=|\\+\\+|--)|(?:\\+\\+|--)' + name + '\\b|\\b(?:ref|out)[ ]+' + name + '\\b');
    for (let k = region.start + 1; k < region.end; k++) {
        if ((k !== declLine) && write.test (region.lines[k])) return true;
    }
    return false;
}

// an `Int64?` local that can never hold null: bound once, never written, from safeInteger(o, k, <int>) /
// safeInteger2(o, k1, k2, <int>), or `(N ± <int>)` / `((N == null)) ? <int> : N` over such a local
function isNonNullInt64Local (region: CsharpRegion, name: string, depth = 0): boolean {
    if ((depth > 4) || !/^[A-Za-z_]\w*$/.test (name) || region.bound.has (name) || (region.params[name] !== undefined)) return false;
    const all = region.declarations.filter ((d) => d.name === name);
    if ((all.length !== 1) || ![ 'Int64?', 'long?' ].includes (all[0].type) || isWrittenAfterDeclaration (region, name, all[0].line)) return false;
    const value = csharpStripParens (all[0].value);
    const call = /^this\.(safeInteger|safeInteger2)\(/.exec (value);
    if ((call !== null) && (csharpHelperCallEnd (value, call[0].length - 1) === value.length - 1)) {
        const args = [];
        let from = call[0].length - 1;
        let comma;
        while ((comma = csharpHelperTopLevelComma (value, from, value.length - 1)) !== undefined) { args.push (comma); from = comma; }
        const want = (call[1] === 'safeInteger') ? 2 : 3;
        return (args.length === want) && /^-?\d{1,15}$/.test (value.substring (args[want - 1] + 1, value.length - 1).trim ());
    }
    const shifted = /^([A-Za-z_]\w*)[ ]*[+-][ ]*\d{1,15}$/.exec (value);
    if (shifted !== null) return isNonNullInt64Local (region, shifted[1], depth + 1);
    const defaulted = /^\(\(([A-Za-z_]\w*) == null\)\)[ ]*\?[ ]*-?\d{1,15}[ ]*:[ ]*([A-Za-z_]\w*)$/.exec (value);
    return (defaulted !== null) && (defaulted[1] === defaulted[2]) && (region.declarations.some ((d) => (d.name === defaulted[1]) && (d.line < all[0].line)) || (region.params[defaulted[1]] !== undefined));
}

function nonNullIntNameType (region: CsharpRegion, name: string, line: number): string | undefined {
    if (!/^[A-Za-z_]\w*$/.test (name)) return undefined;
    if (region.forInt64.has (name) && !region.forInt.has (name) && !region.bound.has (name)
        && !region.declarations.some ((d) => d.name === name) && (region.params[name] === undefined)) {
        const sink = new RegExp ('\\b(?:ref|out)[ ]+' + name + '\\b');
        return region.lines.slice (region.start + 1, region.end).some ((l) => sink.test (l)) ? undefined : 'Int64';
    }
    const type = declaredNameType (region, name, line);
    return ((type === 'Int64?') && isNonNullInt64Local (region, name)) ? 'Int64' : type;
}

function nonNullIntCompareText (region: CsharpRegion, line: number, name: string, a: string, b: string): string | undefined {
    const atom = (x: string) => ((/^[A-Za-z_][\w.]*$/.test (x) || /^-?[\d.]+$/.test (x) || (csharpStripParens (x) !== x.trim ())) ? x : '(' + x + ')');
    const tokens = { isGreaterThan: '>', isGreaterThanOrEqual: '>=', isLessThan: '<', isLessThanOrEqual: '<=' };
    // handleErrors(object code, …): every caller passes an int / Int64 / Int64? box. A null box reads 0
    // through Convert.ToInt64, which answers like the helper's null branch against a positive literal
    const statusCode = /\boverride[ ]+object[ ]+handleErrors\([ ]*object[ ]+([A-Za-z_]\w*)[ ]*,/.exec (region.lines[region.start])?.[1];
    if ((statusCode !== undefined) && (a === statusCode) && /^[1-9]\d{0,8}$/.test (b)
        && !isWrittenAfterDeclaration (region, statusCode, -1) && !region.bound.has (statusCode)
        && !region.declarations.some ((d) => d.name === statusCode)) {
        return `(Convert.ToInt64(${a}) ${tokens[name]} ${b})`;
    }
    const operand = (text: string) => {
        const bare = csharpStripParens (text);
        if (/^-?\d{1,15}$/.test (bare)) return { kind: 'integer-literal' };
        const typed = arithmeticOperandType (text, (x: string) => nonNullIntNameType (region, x, line), new Map ());
        if ((typed === undefined) || typed.literal) return undefined;
        // integers only here: double operands are handled by the name pass
        if (![ 'int', 'Int64', 'Int64?' ].includes (typed.type)) return undefined;
        if (typed.type.endsWith ('?') && !/^[A-Za-z_]\w*$/.test (bare)) return undefined;
        return { kind: 'name', type: typed.type };
    };
    const l = operand (a);
    const r = operand (b);
    if ((l === undefined) || (r === undefined) || ((l.kind !== 'name') && (r.kind !== 'name'))) return undefined;
    return csharpNativeOperatorText (name, l, r, atom (a), atom (b), false) ?? csharpNullableIntegerComparisonText (name, l, r, atom (a), atom (b));
}

// snippet checks (run from the --self-test path)
function nonNullIntCompareSelfTest (): string[] {
    const problems: string[] = [];
    const wrap = (body: string, sig = 'public virtual object f(object o, Int64? limit = null)') => `namespace ccxt;\npublic partial class t : Exchange\n{\n    ${sig}\n    {\n${body}\n    }\n}\n`;
    const handle = 'public override object handleErrors(object code, string reason, string url, string method, object headers, object body, object response, Dictionary<string, object> requestHeaders, object requestBody)';
    const cases: [string, string, string, string?][] = [
        [ 'Int64 for counter < int', '        int n = 3;\n        for (Int64 i = 0; isLessThan(i, n); i++) { }', 'for (Int64 i = 0; (i < n); i++)' ],
        [ 'safeInteger literal default', '        Int64 now = this.milliseconds();\n        Int64? last = this.safeInteger(o, "t", 0);\n        Int64? rate = this.safeInteger(o, "r", 1000);\n        Int64? delay = (rate + 10000);\n        if (isGreaterThan((now - last), delay)) { }', 'if (((now - last) > delay))' ],
        [ 'handleErrors code', '        if (isGreaterThanOrEqual(code, 400)) { }', 'if ((Convert.ToInt64(code) >= 400))', handle ],
    ];
    const keeps: [string, string, string, string?][] = [
        [ 'safeInteger no default', '        Int64 now = this.milliseconds();\n        Int64? last = this.safeInteger(o, "t");\n        if (isGreaterThan((now - last), 5)) { }', '((now - last) > 5)' ], // a null left reads false in both
        [ 'safeInteger default rewritten', '        Int64 now = this.milliseconds();\n        Int64? last = this.safeInteger(o, "t", 0);\n        last = this.safeInteger(o, "u");\n        if (isGreaterThan((now - last), 5)) { }', '((now - last) > 5)' ], // a null left reads false in both
        [ 'handleErrors code reassigned', '        code = this.safeString(o, "c");\n        if (isGreaterThanOrEqual(code, 400)) { }', 'isGreaterThanOrEqual(code, 400)', handle ], // the compare pass keeps the helper
        [ 'handleErrors code vs zero', '        if (isGreaterThan(code, 0)) { }', 'isGreaterThan(code, 0)', handle ], // the compare pass keeps the helper
        [ 'Int64 counter vs double', '        double n = 3.5;\n        for (Int64 i = 0; isLessThan(i, n); i++) { }', 'isLessThan(i, n); i++)' ], // the compare pass keeps the helper
    ];
    for (const [ name, body, expected, sig ] of cases) {
        const out = nativeDeclaredHelperCalls (wrap (body, sig));
        if (!out.includes (expected)) problems.push (`non null int compare self: ${name}: ${out.slice (-500)}`);
        if (nativeDeclaredHelperCalls (out) !== out) problems.push (`non null int compare self: ${name}: not idempotent`);
    }
    for (const [ name, body, kept, sig ] of keeps) {
        const out = nativeDeclaredHelperCalls (wrap (body, sig));
        if (!out.includes (kept)) problems.push (`non null int compare self keeps ${name}: ${out.slice (-500)}`);
    }
    return problems;
}

// snippet checks (run from the --self-test path): object-left concat on two non-null string boxes
function stringBoxConcatSelfTest (): string[] {
    const problems: string[] = [];
    const wrap = (body: string) => 'namespace ccxt;\npublic partial class t : Exchange\n{\n    public virtual object f(object a, string b, string? c)\n    {\n'
        + body.split ('\n').map ((l) => '        ' + l).join ('\n') + '\n    }\n}\n';
    const check = snippetChecker (problems, 'string box concat self test', (body) => csharpStringAddEqualityTruth (wrap (body)), csharpStringAddEqualityTruth);
    check ('two throw-guarded string boxes', 'object u = this.safeString(a, "x");\nif ((u == null))\n{\n    throw new Exception("x");\n}\nobject r = ("/" + b);\nobject w = add(u, r);', 'object w = ((string)u + (string)r);');
    check ('if-guarded box + literal-initialised box', 'object o = this.safeString(a, "o");\nobject p = "x";\nif ((o != null))\n{\n    p = add(o, p);\n}', 'p = ((string)o + (string)p);');
    check ('unguarded right box keeps helper', 'object o = "x";\nobject p = this.safeString(a, "p");\nobject q = add(o, p);', 'add(o, p)');
    check ('object param right keeps helper', 'object o = "x";\nobject q = add(o, a);', 'add(o, a)');
    check ('argument position keeps helper', 'object o = "x";\nobject p = "y";\nthis.f(add(o, p));', 'this.f(add(o, p))');
    check ('Int64? vs Int64? sum', 'Int64? n = this.safeInteger(a, "n");\nInt64? m = this.safeInteger(a, "m");\nif (!isEqual(m, (n + 1))) {}', 'if (!(m == (n + 1))) {}');
    check ('Int64? vs object keeps helper', 'Int64? n = this.safeInteger(a, "n");\nif (isEqual(n, a)) {}', 'isEqual(n, a)');
    check ('Int64? rebound as double keeps helper', 'Int64? n = this.safeInteger(a, "n");\nif (isEqual(n, 1)) {}\n{\n    double? n = 1;\n}', 'isEqual(n, 1)');
    return problems;
}

// getValue reads earlier getValue passes leave: ws `client.subscriptions`, ws ArrayCache receivers,
// Int64/Int64?/mixed int index expressions on declared lists, and `keys[i]` element keys on declared
// dictionaries. Each emission carries GetValue's own null / ContainsKey / Count test.
export function csharpWsAndIndexGetValue (content: string): string {
    const dictTypes = [ 'Dictionary<string,object>', 'IDictionary<string,object>', 'ConcurrentDictionary<string,object>' ];
    const listTypes = [ 'List<object>', 'IList<object>' ];
    // SlimConcurrentList<object> subclasses: GetValue takes its IList<object> branch
    const cacheTypes = [ 'ccxt.pro.ArrayCache', 'ccxt.pro.ArrayCacheByTimestamp', 'ccxt.pro.ArrayCacheBySymbolById', 'ccxt.pro.ArrayCacheBySymbolBySide' ];
    return csharpTwoArgCallPass (content, 'getValue', (region, i, { a: r, b: keyMask, bText: k }) => {
        const { start, params, lines: masked } = region;
        // the one typed binding of `name` in the method, when no lambda parameter and no ref/out sink rebinds it
        const bindingType = (name: string): string | undefined => {
            if (!/^[A-Za-z_]\w*$/.test (name)) return undefined;
            const seen = csharpTypedBindings (region, name);
            if ((seen.size !== 1) || csharpRebinds (region, name)) return undefined;
            const t = [ ...seen ][0];
            if (masked.some ((l, j) => (j > start) && (j <= i) && new RegExp ('\\bfor[ ]*\\([ ]*' + t.replace (/[?.]/g, '\\$&') + '[ ]+' + name + '[ ]*=').test (l))) return t;
            // a generic type with a space is captured from its last segment (`object>`)
            const full = csharpHelperReceiverType (region, name, i, params);
            return ((full !== undefined) && (full.type.split (' ').pop () === t)) ? full.type : undefined;
        };
        // an integer index: int/Int64 names and int literals under `+`/`-` (pure, read twice); `Int64?` alone
        const indexKind = (text: string): string | undefined => {
            if (/^\d{1,9}$/.test (text)) return 'int';
            if (/^[A-Za-z_]\w*$/.test (text)) {
                const t = bindingType (text);
                return [ 'int', 'Int64', 'Int64?' ].includes (t) ? t : undefined;
            }
            if (!/^\([\w ()+-]+\)$/.test (text) || !/[+-]/.test (text) || /\b\d{10,}\b/.test (text)) return undefined;
            const names = text.match (/[A-Za-z_]\w*/g) ?? [];
            const kinds = names.map ((x) => bindingType (x));
            if ((names.length === 0) || !kinds.every ((t) => (t === 'int') || (t === 'Int64'))) return undefined;
            return kinds.includes ('Int64') ? 'Int64' : 'int';
        };
        const wsMap = CSHARP_WS_CLIENT_MAP_RE.exec (r);
        if (wsMap !== null) {
            // futures (IDictionary<string, Future>) reads through GetValue's snapshot copy: a
            // ContainsKey-then-indexer read could race a concurrent TryRemove, so it keeps the helper
            if ((wsMap[2] !== 'subscriptions') || (csharpInOpReceiverType (region, r, i) === undefined)) return undefined;
            const kt = /^"[ ]*"$/.test (keyMask) ? 'literal' : bindingType (keyMask);
            return ((kt !== undefined) && [ 'literal', 'string', 'string?', 'object' ].includes (kt)) ? dictionaryGetValue (r, k, kt) : undefined;
        }
        const rt = bindingType (r);
        if (rt === undefined) return undefined;
        const rn = rt.replace (/\s+/g, '');
        if (listTypes.includes (rn) || cacheTypes.includes (rt)) {
            const kind = indexKind (keyMask);
            if (kind === 'int') {
                // literal / int names on declared lists are handled earlier; caches are handled here
                if (cacheTypes.includes (rt)) return `(${r} != null && ${k} < ${r}.Count ? ${r}[${k}] : null)`;
            } else if (kind === 'Int64') {
                if (!/^[A-Za-z_]\w*$/.test (keyMask) || cacheTypes.includes (rt)) return `(${r} != null && ${k} < ${r}.Count ? ${r}[(int)${k}] : null)`;
            } else if (kind === 'Int64?') {
                return `(${r} != null && ${k} != null && ${k} < ${r}.Count ? ${r}[(int)${k}] : null)`;
            }
        } else if (dictTypes.includes (rn)) {
            // `keys[j]`: an element of a declared List<object>/IList<object> indexed by an int name
            const el = /^([A-Za-z_]\w*)\[([A-Za-z_]\w*)\]$/.exec (keyMask);
            if ((el !== null) && listTypes.includes ((bindingType (el[1]) ?? '').replace (/\s+/g, '')) && (bindingType (el[2]) === 'int')) {
                return dictionaryGetValue (r, k, 'object');
            }
        }
        return undefined;
    });
}

// snippet checks (run from csharpNativeEmissionSelfTest)
function wsAndIndexGetValueSelfTest (): string[] {
    const wrap = (body: string, ns = 'ccxt') => `namespace ${ns};\npublic partial class t : Exchange\n{\n    public virtual object f(WebSocketClient client, object mh, string s, List<object> xs, IDictionary<string, object> d)\n    {\n${body}\n    }\n}\n`;
    const cases: [string, string, string][] = [
        [ 'subscriptions literal', '        object a = getValue(client.subscriptions, "token");', '(client.subscriptions != null && client.subscriptions.ContainsKey("token") ? client.subscriptions["token"] : null)' ],
        [ 'subscriptions string key', '        object a = getValue(client.subscriptions, s);', '(client.subscriptions != null && s != null && client.subscriptions.ContainsKey(s) ? client.subscriptions[s] : null)' ],
        [ 'subscriptions object key', '        object a = getValue(client.subscriptions, mh);', '(client.subscriptions != null && mh != null && client.subscriptions.ContainsKey((string)mh) ? client.subscriptions[(string)mh] : null)' ],
        [ 'Int64? index', '        Int64? r = this.parseToInt("1");\n        object a = getValue(xs, r);', '(xs != null && r != null && r < xs.Count ? xs[(int)r] : null)' ],
        [ 'mixed int/Int64 expression', '        int n = (xs?.Count ?? 0);\n        for (Int64 i = 0; i < n; i++)\n        {\n            object a = getValue(xs, ((n - i) - 1));\n        }', '(xs != null && ((n - i) - 1) < xs.Count ? xs[(int)((n - i) - 1)] : null)' ],
        [ 'array cache int index', '        ccxt.pro.ArrayCache stored = this.orders;\n        for (int i = 0; i < (stored?.Count ?? 0); i++)\n        {\n            object a = getValue(stored, i);\n        }', '(stored != null && i < stored.Count ? stored[i] : null)' ],
        [ 'keys element key', '        List<object> ks = new List<object>(d.Keys);\n        for (int i = 0; i < ks.Count; i++)\n        {\n            object a = getValue(d, ks[i]);\n        }', '(d != null && ks[i] != null && d.ContainsKey((string)ks[i]) ? d[(string)ks[i]] : null)' ],
    ];
    const keeps: [string, string][] = [
        [ 'futures literal (snapshot read)', '        Future p = ((Future)getValue(client.futures, "authenticated"));' ],
        [ 'futures string key', '        Future p = ((Future)getValue(client.futures, s));' ],
        [ 'rebound client', '        client = this.client("x");\n        object a = getValue(client.subscriptions, "x");' ],
        [ 'object list index', '        object j = 0;\n        object a = getValue(xs, j);' ],
        [ 'Int64? in expression', '        Int64? r = this.parseToInt("1");\n        object a = getValue(xs, (r - 1));' ],
        [ 'double index', '        double r = 1;\n        object a = getValue(xs, r);' ],
        [ 'object list keys', '        object ks = new List<object>();\n        int i = 0;\n        object a = getValue(d, ks[i]);' ],
        [ 'object receiver', '        object o = d;\n        object a = getValue(o, "k");' ],
    ];
    return snippetSuite ('ws and index get value', csharpWsAndIndexGetValue, wrap, cases, keeps, 400, true, wrap ('        object a = getValue(client.subscriptions, "x");', 'Tests'), 'ws and index get value tests namespace changed');
}

// ordered comparisons whose nullable integer side is a call-free arithmetic expression (`(r + 1)`,
// `(now - expires)`): its value is the lifted Int64? the helper boxes, so the null-guard table applies
// with the expression repeated in the guard (pure: no calls)
export function csharpArithmeticNullableCompare (content: string): string {
    return csharpOrderedComparePass (content, (region, line, name, a, b) => {
        const operand = (text: string) => {
            const bare = csharpStripParens (text);
            if (/^-?\d{1,15}$/.test (bare)) return { kind: 'integer-literal', text: bare };
            // names, integer literals, `+ - *` and parentheses only: evaluating it twice is the same value
            if (!/^[\w ()+*-]+$/.test (bare) || /\w[ ]*\(/.test (bare) || /\d[A-Za-z_]/.test (bare)) return undefined;
            const typed = arithmeticOperandType (text, (x: string) => nonNullIntNameType (region, x, line), new Map ());
            if ((typed === undefined) || typed.literal || ![ 'int', 'Int64', 'Int64?' ].includes (typed.type)) return undefined;
            return { kind: 'name', type: typed.type, text: /^[A-Za-z_]\w*$/.test (bare) ? bare : '(' + bare + ')' };
        };
        const l = operand (a);
        const r = operand (b);
        if ((l === undefined) || (r === undefined) || ((l.kind !== 'name') && (r.kind !== 'name'))) return undefined;
        // plain-name nullable pairs are handled by earlier passes: only rewrite when an expression side is nullable
        const exprNullable = (o, t: string) => (o.kind === 'name') && (o.type === 'Int64?') && !/^[A-Za-z_]\w*$/.test (csharpStripParens (t));
        if (!exprNullable (l, a) && !exprNullable (r, b)) return undefined;
        return csharpNullableIntegerComparisonText (name, l, r, l.text, r.text);
    });
}

// snippet checks (run from the --self-test path)
function arithmeticNullableCompareSelfTest (): string[] {
    const wrap = (body: string) => `namespace ccxt;\npublic partial class t : Exchange\n{\n    public virtual object f(object o, Int64? limit = null)\n    {\n${body}\n    }\n}\n`;
    const cases: [string, string, string][] = [
        [ 'int counter vs Int64? + 1', '        Int64? r = this.safeInteger(o, "r");\n        for (int i = 0; isLessThan(i, (r + 1)); i++)\n        {\n        }', 'for (int i = 0; (i < (r + 1)); i++)' ],
        [ 'Int64? - 1 <= Int64?', '        Int64? U = this.safeInteger(o, "U");\n        Int64? s = this.safeInteger(o, "s");\n        bool x = (isLessThanOrEqual(((U - 1)), s));', 'bool x = (((U - 1) == null || (U - 1) <= s));' ],
        [ 'Int64? >= Int64? - 1', '        Int64? n = this.safeInteger(o, "n");\n        Int64? d = this.safeInteger(o, "d");\n        bool x = isGreaterThanOrEqual(n, (d - 1));', 'bool x = ((d - 1) == null || n >= (d - 1));' ],
        [ 'Int64 - Int64? > literal', '        Int64 t = this.milliseconds();\n        Int64? e = this.safeInteger(o, "e");\n        bool x = isGreaterThan(((t - e)), 60000);', 'bool x = ((t - e) > 60000);' ],
        [ 'Int64? < Int64 - Int64?', '        Int64 t = this.seconds();\n        Int64? s = this.safeInteger(o, "s");\n        Int64? e = this.safeInteger(o, "e");\n        bool x = isLessThanOrEqual(s, ((t - e)));', 'bool x = (s == null || s <= (t - e));' ],
    ];
    const keeps: [string, string][] = [
        [ 'call inside the expression', '        Int64? r = this.safeInteger(o, "r");\n        bool x = isLessThan(1, (r + this.f(o)));' ],
        [ 'double? expression', '        double? r = this.safeNumber(o, "r");\n        bool x = isLessThan(0, (r - 1));' ],
        [ 'object operand', '        object r = this.safeInteger(o, "r");\n        bool x = isLessThan(0, (r - 1));' ],
        [ 'plain nullable names (other passes)', '        Int64? r = this.safeInteger(o, "r");\n        bool x = isLessThan(r, 5);' ],
        [ 'division', '        Int64? r = this.safeInteger(o, "r");\n        bool x = isLessThan(1, (r / 2));' ],
    ];
    return snippetSuite ('arithmetic nullable compare self test', csharpArithmeticNullableCompare, wrap, cases, keeps, 300, true, 'namespace Tests;\n' + wrap ('        Int64? r = this.safeInteger(o, "r");\n        bool x = isLessThan(1, (r + 1));').split ('\n').slice (1).join ('\n'), 'arithmetic nullable compare self test tests namespace changed');
}

// native `-` / `/` / `%` / unary `-` earlier passes leave: (A) subtract on proven non-null nullable operands;
// (B) divide by the hand-written `double this.rateLimit`; (C) mod(<Int64[?] name>, <positive int literal>)
// -> the twin's double modulo, cast back; (D) arraySlice(a, prefixUnaryNeg(ref x)) on non-null x -> -Convert.ToInt64(x).
export function csharpNonNullDivModNegate (content: string): string {
    const DOUBLE_FIELDS: { [name: string]: string } = { 'this.rateLimit': 'double' }; // cs/ccxt/base/Exchange.Options.cs
    return csharpRegionEdits (content, /(?<![\w.])(?:prefixUnaryNeg|subtract|divide|mod)\(/, ({ start, end, params, lines, masked, set, region }) => {
        const bound = new Set<string> ();
        for (let i = start + 1; i < end; i++) {
            for (const b of masked[i].matchAll (/(?:\bfor(?:each)?[ ]*\([ ]*[A-Za-z_][\w<>?,]*[ ]+|\bout[ ]+[A-Za-z_][\w<>?]*[ ]+|\bis[ ]+[A-Za-z_][\w<>?]*[ ]+)([A-Za-z_]\w*)/g)) bound.add (b[1]);
        }
        const typeAt = (name: string, line: number) => bound.has (name) ? undefined : csharpHelperReceiverType (region (), name, line, params)?.type;
        // (D) proves the returned negation itself: that `ref` is the read, not a write before it
        let negSite = -1;
        const writeLines = (name: string) => {
            const re = nameWriteRe (name);
            const out = [];
            for (let k = start + 1; k < end; k++) if (re.test ((k === negSite) ? masked[k].replace ('prefixUnaryNeg(ref ' + name + ')', '') : masked[k])) out.push (k);
            return out;
        };
        const conjunctProves = (c: string, name: string) => conjunctProvesNonNull (c, name)
            || (csharpStripParens (c) === 'this.valueIsDefined(' + name + ')');
        // an enclosing `if (… && <proof> && …)` block, or an else-branch of a chain an earlier `(x == null || …)` heads,
        // with no write of the name from the proving header to the read
        const blockGuard = (name: string, line: number): boolean => {
            const writes = writeLines (name);
            const clean = (from: number) => !writes.some ((w) => (w >= from) && (w <= line));
            let indent = csharpIndent (masked[line]);
            for (let k = line - 1; k > start; k--) {
                const ind = csharpIndent (masked[k]);
                if ((masked[k].trim () === '') || (ind >= indent)) continue;
                indent = ind;
                if ((masked[k].trim () !== '{') || (k - 1 <= start)) continue;
                const headerLine = masked[k - 1];
                const header = /^[ ]*(?:\}[ ]*else[ ]+)?if[ ]*\(/.exec (headerLine);
                if (header !== null) {
                    const close = csharpClosingParen (headerLine, header[0].length - 1);
                    const cond = (close === undefined) ? '' : headerLine.slice (header[0].length, close);
                    if ((close !== undefined) && !cond.includes ('||') && topLevelSplit (csharpStripParens (cond), '&&').some ((c) => conjunctProves (c, name)) && clean (k - 1)) return true;
                }
                if (!/^[ ]*\}[ ]*else\b/.test (headerLine)) continue;
                // earlier headers of the same chain (same indent, `if (` / `} else if (`), up to the chain head
                for (let j = k - 2; j > start; j--) {
                    if ((masked[j].trim () === '') || (csharpIndent (masked[j]) !== ind)) continue;
                    const h = /^[ ]*(\}[ ]*else[ ]+)?if[ ]*\(/.exec (masked[j]);
                    if (h === null) continue;
                    const close = csharpClosingParen (masked[j], h[0].length - 1);
                    if (close === undefined) break;
                    const cond = csharpStripParens (masked[j].slice (h[0].length, close));
                    if (!cond.includes ('&&') && topLevelSplit (cond, '||').some ((d) => csharpStripParens (d) === name + ' == null') && clean (j)) return true;
                    if (h[1] === undefined) break;
                }
            }
            return false;
        };
        const nonNull = (name: string, line: number, col: number, depth: number): boolean => {
            if ((depth > 4) || bound.has (name)) return false;
            if (isNonNullGuarded (masked, start, line, col, name) || blockGuard (name, line)) return true;
            if (params[name] !== undefined) return false;
            const decls = region ().declarations.filter ((d) => d.name === name);
            if ((decls.length !== 1) || (decls[0].line >= line) || (decls[0].value === '')) return false;
            const atom = (text: string, at: number) => isNonNullNumericAtom (text, (x) => typeAt (x, at), (x) => nonNull (x, at, 0, depth + 1));
            if (!atom (decls[0].value, decls[0].line)) return false;
            // every later write is a plain `name = <non-null>;` statement
            for (const w of writeLines (name)) {
                if (w === decls[0].line) continue;
                const m = new RegExp ('^[ ]*' + name + ' = ([^;]*);[ ]*$').exec (masked[w]);
                if ((m === null) || !atom (m[1], w)) return false;
            }
            return true;
        };
        const operandType = (text: string, line: number) => {
            const bare = csharpStripParens (text);
            if (Object.prototype.hasOwnProperty.call (DOUBLE_FIELDS, bare)) return { type: DOUBLE_FIELDS[bare], text: bare, literal: false };
            return guardedOperandType (text, (x) => typeAt (x, line));
        };
        // innermost first: subtract / divide on proven operands
        const rewrite = (text: string, line: number, offset: number): string => {
            let out = '';
            let last = 0;
            const callRe = /(?<![A-Za-z0-9_.])(subtract|divide)\(/g;
            let m;
            while ((m = callRe.exec (text)) !== null) {
                const open = m.index + m[0].length - 1;
                const close = csharpClosingParen (text, open);
                if (close === undefined) continue;
                const comma = csharpHelperTopLevelComma (text, open, close);
                if ((comma === undefined) || (csharpHelperTopLevelComma (text, comma, close) !== undefined)) continue;
                const inner = [ rewrite (text.slice (open + 1, comma), line, offset + open + 1), rewrite (text.slice (comma + 1, close), line, offset + comma + 1) ];
                const typed = inner.map ((a) => operandType (a, line));
                let native: string | undefined;
                if ((typed[0] !== undefined) && (typed[1] !== undefined)) {
                    const L = typed[0].text;
                    const R = typed[1].text;
                    const kinds = [ typed[0].type, typed[1].type ];
                    const base = kinds.map ((k) => k.replace ('?', ''));
                    if (m[1] === 'subtract') {
                        const proven = [ 0, 1 ].every ((i) => !kinds[i].endsWith ('?')
                            || isNonNullNumericAtom (typed[i].text, (x) => typeAt (x, line), (x) => nonNull (x, line, offset + m.index, 0)));
                        const pair = (base[0] === 'double') || ((base[1] !== 'double') && !((base[0] === 'int') && (base[1] === 'int')));
                        if (kinds.some ((k) => k.endsWith ('?')) && proven && pair) native = '(' + L + ' - ' + R + ')';
                    } else if (Object.prototype.hasOwnProperty.call (DOUBLE_FIELDS, typed[1].text) && [ 'int', 'Int64', 'double' ].includes (kinds[0])) {
                        native = '(' + L + ' / ' + R + ')'; // divide(double, double): the left converts implicitly
                    }
                }
                out += text.slice (last, m.index) + (native ?? (m[1] + '(' + inner[0] + ',' + inner[1] + ')'));
                last = close + 1;
                callRe.lastIndex = close + 1;
            }
            return out + text.slice (last);
        };
        for (let i = start + 1; i < end; i++) {
            if (!/(?<![A-Za-z0-9_.])(?:subtract|divide)\(/.test (masked[i]) || /['@$\u0001]/.test (lines[i])) continue;
            const strings = [];
            const opaque = lines[i].replace (/"(?:[^"\\]|\\.)*"/g, (s) => { strings.push (s); return '\u0001' + '\u0002'.repeat (s.length - 2) + '\u0001'; });
            let k = 0;
            const rewritten = rewrite (opaque, i, 0).replace (/\u0001\u0002*\u0001/g, () => strings[k++]);
            if (k !== strings.length) continue;
            set (i, rewritten);
        }
        // (C) mod(<Int64 / Int64? name>, <positive int literal>)
        for (let i = start + 1; i < end; i++) {
            set (i, lines[i].replace (/(?<![A-Za-z0-9_.])mod\(([A-Za-z_]\w*), ([1-9]\d{0,8})\)/g, (all, x, d) => {
                const t = typeAt (x, i);
                if ((t === 'Int64?') || (t === 'long?')) return '((Int64?)((double?)' + x + ' % ' + d + '))';
                return all;
            }));
        }
        // (D) the slice start of a returned arraySlice: the in-place negation is unobservable
        for (let i = start + 1; i < end; i++) {
            const site = /^[ ]*return .*this\.arraySlice\(([A-Za-z_]\w*), prefixUnaryNeg\(ref ([A-Za-z_]\w*)\)\)/.exec (masked[i]);
            if (site === null) continue;
            const x = site[2];
            negSite = i;
            const col = masked[i].indexOf ('prefixUnaryNeg(ref ' + x + ')');
            if (bound.has (x) || (typeAt (x, i) !== 'object') || writeLines (x).some ((w) => (w >= i))) { negSite = -1; continue; }
            const decls = region ().declarations.filter ((d) => d.name === x);
            const objectAtom = (text: string, at: number): boolean => {
                const t = csharpStripParens (text);
                if (/^[A-Za-z_]\w*$/.test (t)) {
                    const type = typeAt (t, at);
                    return [ 'int', 'Int64', 'long', 'double' ].includes (type) || nonNull (t, at, 0, 1);
                }
                const q = topLevelSplit (t, ' ? ');
                const arms = (q.length === 2) ? topLevelSplit (q[1], ' : ') : [];
                return (arms.length === 2) && objectAtom (arms[0], at) && objectAtom (arms[1], at);
            };
            const proven = blockGuard (x, i) || ((decls.length === 1) && (decls[0].line < i)
                && (writeLines (x).filter ((w) => w !== decls[0].line).length === 0) && objectAtom (decls[0].value, decls[0].line));
            negSite = -1;
            if (!proven || (col < 0)) continue;
            set (i, lines[i].slice (0, col) + '-System.Convert.ToInt64(' + x + ')' + lines[i].slice (col + ('prefixUnaryNeg(ref ' + x + ')').length));
        }
    });
}

// snippet checks (run from the --self-test path)
function nonNullDivModNegateSelfTest (): string[] {
    const problems: string[] = [];
    const wrap = (body: string) => 'namespace ccxt;\npublic partial class t : Exchange\n{\n    public virtual object f(object o, string s, object array, Int64? since = null, Int64? limit = null, object lim = null)\n    {\n' + body + '\n    }\n}\n';
    const check = (name: string, body: string, expected: string, forbidden?: string) => {
        const out = csharpNonNullDivModNegate (wrap (body));
        if (!out.includes (expected) || ((forbidden !== undefined) && out.includes (forbidden))) problems.push (`non null div mod negate: ${name}\n${out}`);
        if (csharpNonNullDivModNegate (out) !== out) problems.push (`non null div mod negate: ${name}: not idempotent`);
    };
    const keep = (name: string, body: string) => {
        if (csharpNonNullDivModNegate (wrap (body)) !== wrap (body)) problems.push (`non null div mod negate keeps ${name}\n${csharpNonNullDivModNegate (wrap (body))}`);
    };
    check ('guarded nullable * literal operand', '        Int64? e = this.safeInteger(o, "e");\n        Int64? d = this.safeInteger(o, "d", 0);\n        object t = e;\n        if ((e != null))\n        {\n            t = subtract(e, (d * 1000));\n        }', 't = (e - (d * 1000));');
    check ('all writes non-null', '        Int64 now = this.seconds();\n        int tf = 60;\n        Int64? dl = this.safeInteger(o, "x", 200);\n        Int64? c = dl;\n        if ((limit != null))\n        {\n            c = limit;\n        }\n        object st = subtract(now, ((c * tf)));', 'object st = (now - ((c * tf)));');
    check ('else of a null-or chain', '        Int64? index = this.parseToInt(s);\n        if ((index == null || index <= 0))\n        {\n            s = "a";\n        } else if ((index >= 5))\n        {\n            s = "b";\n        } else\n        {\n            object v = getValue(array, subtract(index, 1));\n        }', 'getValue(array, (index - 1))');
    check ('guarded difference minus literal', '        Int64 time = this.milliseconds();\n        Int64? x = this.safeInteger(o, "x");\n        if ((x != null))\n        {\n            object r = subtract((x - time), 60000);\n        }', 'object r = ((x - time) - 60000);');
    check ('divide by rateLimit', '        object r = null;\n        if ((this.rateLimit > 0))\n        {\n            r = divide(1, this.rateLimit);\n        }', 'r = (1 / this.rateLimit);');
    check ('mod Int64? by literal', '        Int64? bits = this.safeInteger(o, "b");\n        Int64? bit = this.parseToInt(mod(bits, 2));', 'this.parseToInt(((Int64?)((double?)bits % 2)))');
    check ('guarded slice negation', '        if ((limit != null) && (lim != null))\n        {\n            return this.toArray(this.arraySlice(array, prefixUnaryNeg(ref lim)));\n        }\n        return null;', 'this.arraySlice(array, -System.Convert.ToInt64(lim))');
    check ('valueIsDefined + ternary copy', '        if (this.valueIsDefined(lim))\n        {\n            int n = 3;\n            object r = (isGreaterThan(lim, n)) ? n : lim;\n            return this.toArray(this.arraySlice(array, prefixUnaryNeg(ref r)));\n        }\n        return null;', 'this.arraySlice(array, -System.Convert.ToInt64(r))');
    keep ('unguarded nullable subtract operand', '        Int64? e = this.safeInteger(o, "e");\n        object t = subtract(e, 1);');
    keep ('a later null write', '        Int64? c = this.safeInteger(o, "x", 200);\n        c = limit;\n        object st = subtract(c, 1);');
    keep ('null-or chain then-branch', '        Int64? index = this.parseToInt(s);\n        if ((index == null || index <= 0))\n        {\n            object v = getValue(array, subtract(index, 1));\n        }');
    keep ('chain written between test and read', '        Int64? index = this.parseToInt(s);\n        if ((index == null))\n        {\n            s = "a";\n        } else\n        {\n            index = this.parseToInt(s);\n            object v = getValue(array, subtract(index, 1));\n        }');
    keep ('Int64? - double', '        Int64? d = this.safeInteger(o, "d", 0);\n        double b = 1.5;\n        object t = subtract(d, b);');
    keep ('mod by a variable', '        Int64? a = this.safeInteger(o, "a");\n        Int64? b = this.safeInteger(o, "b");\n        Int64? m = mod(a, b);');
    keep ('mod of object', '        object m = mod(o, 2);');
    keep ('unguarded slice negation', '        return this.toArray(this.arraySlice(array, prefixUnaryNeg(ref lim)));');
    keep ('slice negation not returned', '        if ((lim != null))\n        {\n            object r = this.arraySlice(array, prefixUnaryNeg(ref lim));\n        }\n        return null;');
    keep ('divide by object', '        object r = divide(1, o);');
    const tests = 'namespace Tests;\n' + wrap ('        object m = mod(since, 2);').split ('\n').slice (1).join ('\n');
    if (csharpNonNullDivModNegate (tests) !== tests) problems.push ('non null div mod negate tests namespace changed');
    return problems;
}

// getValue reads earlier getValue passes leave: a params-bag dictionary (`p ??= new Dictionary<...>()`,
// never rebound) with a literal / string key, and a declared list indexed by an enclosing `for`
// counter or a `this.sum`/`add`/`subtract` of int/Int64 names and int literals.
export function csharpParamsBagGetValue (content: string): string {
    const listTypes = [ 'List<object>', 'IList<object>' ];
    return csharpTwoArgCallPass (content, 'getValue', (region, i, { start: at, masked: line, a: r, b: keyMask, bText: k }) => {
        const { start, end, params, lines: masked } = region;
        if (!/^[A-Za-z_]\w*$/.test (r)) return undefined;
        // `isEqual(getValue(..), x)`: left for the isEqual rule, which only proves a getValue operand
        if (/\bisEqual\([ ]*$/.test (line.substring (0, at))) return undefined;
        // ref/out sinks and lambda parameters rebind a name: never typed here
        const rebound = (name: string) => csharpRebinds (region, name) || new RegExp ('(?:^|[^\\w.])' + name + '[ ]*=>').test (masked.slice (start, end).join ('\n'));
        const bindings = (name: string) => csharpTypedBindings (region, name, true);
        // the `for (T name = ...)` header whose `{ ... }` block (header-next line) encloses `i`
        const forCounter = (name: string): string | undefined => {
            const header = new RegExp ('^[ ]*for[ ]*\\([ ]*(int|Int64)[ ]+' + name + '[ ]*=');
            for (let k = i - 1; k > start; k--) {
                const h = header.exec (masked[k]);
                if ((h === null) || (masked[k + 1].trim () !== '{')) continue;
                let depth = 0;
                let open = true;
                for (let j = k + 1; j < i; j++) {
                    for (const ch of masked[j]) {
                        if (ch === '{') depth++;
                        if ((ch === '}') && (--depth <= 0)) open = false;
                    }
                }
                if (open && (depth > 0)) return h[1];
            }
            return undefined;
        };
        // a non-nullable integer name at `i`: one int/Int64 binding in the method, or its enclosing loop counter
        const intName = (name: string): string | undefined => {
            if (!/^[A-Za-z_]\w*$/.test (name) || rebound (name)) return undefined;
            const seen = bindings (name);
            if ((seen.size === 1) && [ 'int', 'Int64' ].includes ([ ...seen ][0]) && (params[name] === undefined)) {
                const t = [ ...seen ][0];
                const declared = new RegExp ('\\b' + t + '[ ]+' + name + '\\b');
                return masked.some ((l, j) => (j > start) && (j < i) && declared.test (l)) ? t : undefined;
            }
            return forCounter (name);
        };
        const intOperand = (text: string): string | undefined => (/^\d{1,9}$/.test (text) ? 'int' : intName (text));
        const bag = new RegExp ('^[ ]*' + r + '[ ]*\\?\\?=[ ]*new Dictionary<string, object>\\(\\);');
        if ((params[r] === 'object') && (bindings (r).size === 1) && !rebound (r)
            && masked.some ((l, j) => (j > start) && (j < i) && bag.test (l))
            && !masked.some ((l, j) => (j > start) && (j < end) && new RegExp ('(?:^|[^\\w.])' + r + '[ ]*(?:=[^=>]|\\+=|-=)').test (l))) {
            // the bag's box is the printer's Dictionary<string, object> (same cast the printer's params-bag inOp emits)
            const d = `((IDictionary<string, object>)${r})`;
            if (/^"[ ]*"$/.test (keyMask)) return `(${d}.ContainsKey(${k}) ? ${d}[${k}] : null)`;
            if (/^[A-Za-z_]\w*$/.test (keyMask) && !rebound (keyMask)) {
                const kt = [ ...bindings (keyMask) ];
                if ((kt.length === 1) && ((kt[0] === 'string') || (kt[0] === 'string?'))) return `(${k} != null && ${d}.ContainsKey(${k}) ? ${d}[${k}] : null)`;
            }
            return undefined;
        }
        // the receiver's one typed binding in the method
        const seen = rebound (r) ? new Set<string> () : bindings (r);
        if (seen.size !== 1) return undefined;
        const full = csharpHelperReceiverType ({ start, end, params, lines: masked, declarations: masked.slice (start, end).map ((l, j) => {
            const d = csharpHelperDeclarationOfLine (l);
            return (d === undefined) ? undefined : { line: start + j, name: d.name, type: d.type, value: d.value };
        }).filter ((d) => d !== undefined) }, r, i, params);
        if ((full === undefined) || (full.type.split (' ').pop () !== [ ...seen ][0]) || !listTypes.includes (full.type.replace (/\s+/g, ''))) return undefined;
        let index = undefined;
        let kind = undefined;
        if (/^[A-Za-z_]\w*$/.test (keyMask)) {
            kind = intName (keyMask);
            index = k;
        } else {
            const op = /^(?:this\.sum|add|subtract)\(([A-Za-z_]\w*|\d{1,9}), ([A-Za-z_]\w*|\d{1,9})\)$/.exec (keyMask);
            if (op !== null) {
                const a = intOperand (op[1]);
                const b = intOperand (op[2]);
                if ((a !== undefined) && (b !== undefined)) {
                    kind = ((a === 'Int64') || (b === 'Int64')) ? 'Int64' : 'int';
                    index = `(${op[1]} ${keyMask.startsWith ('subtract') ? '-' : '+'} ${op[2]})`;
                }
            }
        }
        if (kind === 'int') return `(${r} != null && ${index} < ${r}.Count ? ${r}[${index}] : null)`;
        if (kind === 'Int64') return `(${r} != null && ${index} < ${r}.Count ? ${r}[(int)${index}] : null)`;
        return undefined;
    });
}

// snippet checks (run from csharpNativeEmissionSelfTest)
function paramsBagGetValueSnippetChecks (): string[] {
    const problems: string[] = [];
    const wrap = (body: string, ns = 'ccxt') => `namespace ${ns};\npublic partial class t : Exchange\n{\n    public virtual object f(List<object> xs, IList<object> ys, object parameters = null)\n    {\n        parameters ??= new Dictionary<string, object>();\n${body}\n    }\n}\n`;
    const cases: [string, string, string][] = [
        [ 'bag literal', '        object a = getValue(parameters, "k");', 'object a = (((IDictionary<string, object>)parameters).ContainsKey("k") ? ((IDictionary<string, object>)parameters)["k"] : null);' ],
        [ 'bag string? key', '        string? key = this.safeString(parameters, "x");\n        object a = getValue(parameters, key);', '(key != null && ((IDictionary<string, object>)parameters).ContainsKey(key) ? ((IDictionary<string, object>)parameters)[key] : null)' ],
        [ 'sibling-loop Int64 counter', '        for (Int64 i = 0; isLessThan(i, 3); i++)\n        {\n            object a = getValue(xs, i);\n        }\n        for (int i = 0; i < 2; i++)\n        {\n            object b = xs[i];\n        }', 'object a = (xs != null && i < xs.Count ? xs[(int)i] : null);' ],
        [ 'sibling-loop int counter', '        for (int i = 0; i < 3; i++)\n        {\n            object a = getValue(ys, i);\n        }\n        for (Int64 i = 0; i < 2; i++)\n        {\n        }', 'object a = (ys != null && i < ys.Count ? ys[i] : null);' ],
        [ 'this.sum Int64 + literal', '        Int64 d = 4;\n        object a = getValue(xs, this.sum(d, 1));', 'object a = (xs != null && (d + 1) < xs.Count ? xs[(int)(d + 1)] : null);' ],
        [ 'add counter + literal', '        for (Int64 i = 0; i < 3; i++)\n        {\n            object a = getValue(xs, add(i, 1));\n        }', 'object a = (xs != null && (i + 1) < xs.Count ? xs[(int)(i + 1)] : null);' ],
        [ 'subtract int names', '        int n = 3;\n        object a = getValue(xs, subtract(n, 1));', 'object a = (xs != null && (n - 1) < xs.Count ? xs[(n - 1)] : null);' ],
    ];
    const keeps: [string, string][] = [
        [ 'rebound bag', '        parameters = this.omit(parameters, "a");\n        object a = getValue(parameters, "k");' ],
        [ 'object key on bag', '        object key = 1;\n        object a = getValue(parameters, key);' ],
        [ 'int index on bag', '        int i = 0;\n        object a = getValue(parameters, i);' ],
        [ 'counter outside its loop', '        for (Int64 i = 0; i < 3; i++)\n        {\n        }\n        object i2 = 1;\n        object a = getValue(xs, i2);' ],
        [ 'Int64? in sum', '        Int64? d = this.safeInteger(parameters, "d");\n        object a = getValue(xs, this.sum(d, 1));' ],
        [ 'object in subtract', '        object n = 3;\n        object a = getValue(xs, subtract(n, 1));' ],
        [ 'object receiver', '        object o = xs;\n        int j = 0;\n        object a = getValue(o, add(j, 1));' ],
        [ 'double operand', '        double d = 1;\n        object a = getValue(xs, add(d, 1));' ],
        [ 'isEqual operand (left to the isEqual rule)', '        bool a = isEqual(getValue(parameters, "k"), 1);' ],
    ];
    {
        const out = nativeDeclaredHelperCalls (wrap ('        if (isEqual(getValue(parameters, "k"), null))\n        {\n        }'));
        if (/\bisEqual\(/.test (out) || !out.includes (': null) == null)')) problems.push (`isEqual(getValue(bag), null): ${out.slice (-400)}`);
    }
    return [ ...problems, ...snippetSuite ('params bag get value snippet', csharpParamsBagGetValue, wrap, cases, keeps, 500, true, wrap ('        object a = getValue(parameters, "k");', 'Tests'), 'params bag get value snippet tests namespace changed') ];
}

// every `subtract(a, b)` / `multiply(a, b)` whose operand types are proven goes native.
// A typed-twin binding prints the twin body (`(a - b)`, `((Int64)a * b)`); an object-overload binding prints
// the helper body as a static lambda over `object` parameters (same boxes, value, box type and exceptions).

// the overload C# binds for `subtract|multiply(L, R)` (TranspileHelpers.cs twins), by operand static type
// the helper bodies (TDZ: kept inside the function, see the END-block rule)
function subMulHelperBody (name: string): string {
    const sub = '((Func<object, object, object>)(static (object hx4a, object hx4b) => ((hx4a is int hx4ai ? (object)(Int64)hx4ai : hx4a is uint hx4au ? (object)(Int64)hx4au : hx4a) is var hx4x && (hx4b is int hx4bi ? (object)(Int64)hx4bi : hx4b is uint hx4bu ? (object)(Int64)hx4bu : hx4b) is var hx4y) ? (hx4x.GetType() == typeof(Int64) ? (object)((Int64)hx4x - (Int64)hx4y) : hx4x.GetType() == typeof(double) ? (object)((double)hx4x - Convert.ToDouble(hx4y)) : null) : null))';
    const mul = '((Func<object, object, object>)(static (object hx4a, object hx4b) => ((hx4a is int hx4ai ? (object)(Int64)hx4ai : hx4a is uint hx4au ? (object)(Int64)hx4au : hx4a) is var hx4x && (hx4b is int hx4bi ? (object)(Int64)hx4bi : hx4b is uint hx4bu ? (object)(Int64)hx4bu : hx4b) is var hx4y) ? ((hx4x == null || hx4y == null) ? null : (hx4x is Int64 hx4xi && hx4y is Int64 hx4yi) ? (object)(hx4xi * hx4yi) : (Convert.ToDouble(hx4x) * Convert.ToDouble(hx4y)) is var hx4r && Convert.ToDecimal(hx4r) is var hx4d && hx4d == Math.Floor(hx4d) ? (object)Convert.ToInt64(hx4r) : (object)hx4r) : null))';
    return (name === 'subtract') ? sub : mul;
}

function subMulTwinBind (name: string, l: string, r: string): string {
    const rank = { 'int': 0, 'Int64': 1, 'double': 2 };
    if (name === 'subtract') {
        // Int64? beside int/Int64: lifted `-` (null stays null) in place of the object blob
        const lifted = [ 'int', 'Int64', 'int?', 'Int64?' ];
        if (lifted.includes (l) && lifted.includes (r) && (l === 'Int64?' || r === 'Int64?')) return 'Int64?';
        return ((l in rank) && (r in rank)) ? [ 'int', 'Int64', 'double' ][Math.max (rank[l], rank[r])] : 'object';
    }
    const integral = [ 'int', 'Int64' ];
    if (integral.includes (l) && integral.includes (r)) return 'Int64';
    const lifted = [ 'int', 'Int64', 'int?', 'Int64?' ];
    return (lifted.includes (l) && lifted.includes (r)) ? 'Int64?' : 'object';
}

// the type of the innermost `for (T name = …)` whose body is still open at `line` (C# forbids shadowing it)
function openLoopCounterType (masked: string[], start: number, line: number, name: string): string | undefined {
    const header = new RegExp ('\\bfor[ ]*\\([ ]*(int|Int64)[ ]+' + name + '[ ]*=');
    for (let k = line - 1; k > start; k--) {
        const h = header.exec (masked[k]);
        if (h === null) continue;
        let depth = 0;
        let opened = false;
        for (let j = k + 1; j < line; j++) {
            for (const ch of masked[j]) {
                if (ch === '{') { depth++; opened = true; }
                if (ch === '}') depth--;
            }
            if (opened && (depth <= 0)) return undefined;
        }
        return opened ? h[1] : undefined;
    }
    return undefined;
}

function subMulAtom (text: string): string {
    const t = text.trim ();
    if (/^[A-Za-z_][\w.]*$/.test (t) || /^\d+L?$/.test (t) || (t.startsWith ('(') && (csharpClosingParen (t, 0) === t.length - 1))) return t;
    return '(' + t + ')';
}

// the static C# type of an emitted operand expression, or undefined when not proven
function emittedOperandType (arg: string, typeOfName: (name: string) => string | undefined, results: Map<string, string>, file: string): string | undefined {
    const text = arg.trim ();
    if (results.has (text)) return results.get (text);
    const bare = csharpStripParens (text);
    if (bare !== text) return emittedOperandType (bare, typeOfName, results, file);
    if (/^\d{1,9}$/.test (bare)) return 'int';
    if (/^\d{1,18}L$/.test (bare)) return 'Int64';
    const neg = /^-(.+)$/.exec (bare);
    if (neg !== null) {
        const t = emittedOperandType (neg[1], typeOfName, results, file);
        return [ 'int', 'Int64', 'double', 'Int64?', 'double?', 'int?' ].includes (t) ? t : undefined;
    }
    const cast = /^\((Int64\??|double\??|int\??|object)\)(.+)$/.exec (bare);
    if (cast !== null) {
        const inner = cast[2].trim ();
        if (/^[A-Za-z_][\w.]*$/.test (inner) || (inner.startsWith ('(') && (csharpClosingParen (inner, 0) === inner.length - 1))) return cast[1];
    }
    const binary = topLevelBinaryOperands (bare);
    if (binary !== undefined) {
        const l = emittedOperandType (binary.left, typeOfName, results, file);
        const r = emittedOperandType (binary.right, typeOfName, results, file);
        const num = [ 'int', 'Int64', 'double', 'int?', 'Int64?', 'double?' ];
        if (!num.includes (l) || !num.includes (r)) return undefined;
        const base = (l.startsWith ('double') || r.startsWith ('double')) ? 'double' : ((l.startsWith ('Int64') || r.startsWith ('Int64')) ? 'Int64' : 'int');
        return base + ((l.endsWith ('?') || r.endsWith ('?')) ? '?' : '');
    }
    const div = /^\(double\??\)([A-Za-z_]\w*|\([^()]*\))[ ]*\/[ ]*([A-Za-z_]\w*)$/.exec (bare);
    if (div !== null) return 'double?';
    const call = /^((?:this\.)?[A-Za-z_][\w.]*)\(/.exec (bare);
    if ((call !== null) && (csharpClosingParen (bare, call[0].length - 1) === bare.length - 1)) {
        const fixed: { [name: string]: string | undefined } = {
            'this.parseToInt': 'Int64?', 'this.parseTimeframe': 'int', 'this.safeInteger': 'Int64?', 'this.safeInteger2': 'Int64?',
            'this.safeIntegerN': 'Int64?', 'this.safeTimestamp': 'Int64?', 'this.safeNumber': 'double?', 'this.parseNumber': 'double?',
            'getValue': 'object', 'this.safeValue': 'object', 'this.safeValue2': 'object', 'parseFloat': 'object', 'mathMin': 'object',
            'mathMax': 'object', 'this.parseToNumeric': 'object', 'divide': undefined, 'Math.Pow': 'double', 'Math.Floor': undefined,
            'Math.Ceiling': undefined, 'this.precisionFromString': 'int',
        };
        // grvt's own `public virtual Int64? convertToBigIntCustom(object x)`
        if ((call[1] === 'this.convertToBigIntCustom') && /public virtual Int64\? convertToBigIntCustom\(object x\)/.test (file)) return 'Int64?';
        if ((call[1] === 'Math.Floor') || (call[1] === 'Math.Ceiling')) {
            return /^Math\.(Floor|Ceiling)\(Double\.Parse\(/.test (bare) ? 'double' : undefined;
        }
        if ((call[1] === 'this.sum') || (call[1] === 'add') || (call[1] === 'divide')) {
            const open = call[0].length - 1;
            const comma = csharpHelperTopLevelComma (bare, open, bare.length - 1);
            if ((comma === undefined) || (csharpHelperTopLevelComma (bare, comma, bare.length - 1) !== undefined)) return (call[1] === 'this.sum') ? 'object' : undefined;
            const l = emittedOperandType (bare.slice (open + 1, comma), typeOfName, results, file);
            const r = emittedOperandType (bare.slice (comma + 1, -1), typeOfName, results, file);
            if ((l === undefined) || (r === undefined)) return undefined;
            if (call[1] === 'add') {
                // add twins: (Int64, Int64), (double, double), string forms; every other numeric pair binds (object, object)
                if ([ l, r ].some ((x) => x.startsWith ('string'))) return undefined;
                if ([ 'int', 'Int64' ].includes (l) && [ 'int', 'Int64' ].includes (r)) return 'Int64';
                if ([ 'int', 'Int64', 'double' ].includes (l) && [ 'int', 'Int64', 'double' ].includes (r)) return 'double';
                return 'object';
            }
            if ((call[1] === 'divide') && (l !== 'object') && (r !== 'object')) return undefined;
            // add / divide over these operands bind the (object, object) overload
            return ((call[1] !== 'this.sum') || ![ l, r ].every ((x) => [ 'int', 'Int64', 'int?', 'Int64?' ].includes (x))) ? 'object' : 'Int64';
        }
        if (Object.prototype.hasOwnProperty.call (fixed, call[1])) return fixed[call[1]];
        return undefined;
    }
    // a guarded dictionary read `(r != null && r.ContainsKey("k") ? r["k"] : null)` is an object
    if (/^[A-Za-z_]\w* != null && [A-Za-z_]\w*\.ContainsKey\("[^"]*"\) \? [A-Za-z_]\w*\["[^"]*"\] : null$/.test (bare)
        || /^[A-Za-z_]\w*\.ContainsKey\("[^"]*"\) \? [A-Za-z_]\w*\["[^"]*"\] : null$/.test (bare)) {
        const recv = /([A-Za-z_]\w*)\[/.exec (bare)[1];
        return /^(I?Dictionary<string, object>\??)$/.test (typeOfName (recv) ?? '') ? 'object' : undefined;
    }
    const member = /^([A-Za-z_]\w*)\.Length$/.exec (bare);
    if (member !== null) return [ 'string', 'string?' ].includes (typeOfName (member[1])) ? 'int' : undefined;
    if (/^[A-Za-z_]\w*$/.test (bare)) {
        const t = typeOfName (bare);
        if (t === undefined) return undefined;
        const norm = t.replace (/^long(\??)$/, 'Int64$1');
        return [ 'int', 'Int64', 'double', 'int?', 'Int64?', 'double?', 'object', 'string', 'string?' ].includes (norm) ? norm : undefined;
    }
    return undefined;
}

function subMulRewrite (text: string, typeOfName: (name: string) => string | undefined, results: Map<string, string>, file: string): string {
    let out = '';
    let last = 0;
    const callRe = /(?<![A-Za-z0-9_.])(subtract|multiply)\(/g;
    let m;
    while ((m = callRe.exec (text)) !== null) {
        const open = m.index + m[0].length - 1;
        const close = csharpClosingParen (text, open);
        if (close === undefined) continue;
        callRe.lastIndex = close + 1;
        out += text.slice (last, m.index);
        last = close + 1;
        const comma = csharpHelperTopLevelComma (text, open, close);
        if ((comma === undefined) || (csharpHelperTopLevelComma (text, comma, close) !== undefined)) {
            out += text.slice (m.index, close + 1);
            continue;
        }
        // arguments first (inner calls), with every inner rewrite typed in `results`
        const args = [ text.slice (open + 1, comma), text.slice (comma + 1, close) ].map ((a) => subMulRewrite (a, typeOfName, results, file));
        const types = args.map ((a) => emittedOperandType (a, typeOfName, results, file));
        const rebuilt = m[1] + '(' + args[0] + ',' + args[1] + ')';
        if ((types[0] === undefined) || (types[1] === undefined)) {
            out += rebuilt;
            continue;
        }
        const t = types.map ((x) => (x === 'string' || x === 'string?') ? 'object' : x);
        const bind = subMulTwinBind (m[1], t[0], t[1]);
        let native: string;
        if (bind === 'object') {
            native = subMulHelperBody (m[1]) + '(' + args[0].trim () + ', ' + args[1].trim () + ')';
        } else if (m[1] === 'subtract') {
            native = '(' + subMulAtom (args[0]) + ' - ' + subMulAtom (args[1]) + ')';
        } else {
            native = '((' + bind + ')' + subMulAtom (args[0]) + ' * ' + subMulAtom (args[1]) + ')';
        }
        results.set (native, bind);
        out += native;
    }
    return out + text.slice (last);
}

export function csharpTypedSubtractMultiply (objectNull: boolean, content: string): string {
    if (!objectNull || !/(?<![A-Za-z0-9_.])(subtract|multiply)\(/.test (content) || /^namespace Tests\b/m.test (content)) {
        return content;
    }
    const lines = content.split ('\n');
    const masked = lines.map (csharpHelperMaskLine);
    let changed = false;
    for (const { start, end, params } of csharpRegions (masked)) {
        const declarations = [];
        const loops: { [name: string]: Set<string> } = {};
        const bound = new Set<string> ();
        for (let i = start; i < end; i++) {
            const d = csharpHelperDeclarationOfLine (masked[i]);
            if (d !== undefined) declarations.push ({ line: i, name: d.name, type: d.type, value: d.value });
            const v = /^[ ]*var[ ]+([A-Za-z_]\w*)[ ]*=[ ]*new[ ]+Precise\(/.exec (masked[i]);
            if (v !== null) declarations.push ({ line: i, name: v[1], type: 'Precise', value: 'new' });
            if (i === start) continue;
            for (const b of masked[i].matchAll (/\bfor[ ]*\([ ]*(int|Int64)[ ]+([A-Za-z_]\w*)[ ]*=/g)) (loops[b[2]] ??= new Set ()).add (b[1]);
            for (const b of masked[i].matchAll (/(?:\bforeach[ ]*\([ ]*[A-Za-z_][\w<>?,]*[ ]+|\bout[ ]+[A-Za-z_][\w<>?]*[ ]+|\bis[ ]+[A-Za-z_][\w<>?]*[ ]+|\bcatch[ ]*\([ ]*[A-Za-z_][\w.]*[ ]+)([A-Za-z_]\w*)/g)) bound.add (b[1]);
            for (const b of masked[i].matchAll (/\bvar[ ]+([A-Za-z_]\w*)/g)) if (!/new[ ]+Precise\(/.test (masked[i])) bound.add (b[1]);
            for (const b of masked[i].matchAll (/\(([^()]*)\)[ ]*=>/g)) for (const x of b[1].split (',')) bound.add (x.trim ().split (/\s+/).pop ());
            if (/\bref[ ]+[A-Za-z_]/.test (masked[i])) for (const b of masked[i].matchAll (/\bref[ ]+([A-Za-z_]\w*)/g)) bound.add (b[1]);
        }
        const region = { start, end, params, declarations, lines: masked };
        for (let i = start + 1; i < end; i++) {
            if (!/(?<![A-Za-z0-9_.])(subtract|multiply)\(/.test (masked[i]) || lines[i].includes ('\u0001') || /['@$]/.test (lines[i])) continue;
            const typeOfName = (name: string) => {
                if (bound.has (name)) return undefined;
                if (loops[name] !== undefined) return (region.params[name] === undefined) ? openLoopCounterType (masked, start, i, name) : undefined;
                return csharpHelperReceiverType (region, name, i, region.params)?.type ?? csharpInOpScopedLocal (region, name, i)?.type;
            };
            const strings = [];
            const opaque = lines[i].replace (/"(?:[^"\\]|\\.)*"/g, (s) => '\u0001' + (strings.push (s) - 1) + '\u0001');
            const restored = (s: string) => s.replace (/\u0001(\d+)\u0001/g, (_, k) => strings[Number (k)]);
            // operand typing sees the string literals (dictionary keys), emission keeps them verbatim
            const next = restored (subMulRewrite (restored (opaque), typeOfName, new Map (), content));
            if (next !== lines[i]) {
                lines[i] = next;
                changed = true;
            }
        }
    }
    return changed ? lines.join ('\n') : content;
}

// snippet checks (run from csharpNativeEmissionSelfTest)
function typedSubtractMultiplySnippetChecks (): string[] {
    const problems: string[] = [];
    const wrap = (body: string, ns = 'ccxt') => 'namespace ' + ns + ';\npublic partial class t : Exchange\n{\n    public virtual object f(object o, string s, Int64? since = null, Int64? limit = null)\n    {\n' + body + '\n    }\n}\n';
    const check = (name: string, body: string, expected: string) => {
        const out = csharpTypedSubtractMultiply (true, wrap (body));
        if (!out.includes (expected) || /(?<![\w.])(subtract|multiply)\(/.test (out)) problems.push (`typed subtract multiply snippet checks: ${name}: ${out.slice (-400)}`);
        if (csharpTypedSubtractMultiply (true, out) !== out) problems.push (`typed subtract multiply snippet checks: ${name}: not idempotent`);
    };
    const keep = (name: string, body: string) => {
        if (csharpTypedSubtractMultiply (true, wrap (body)) !== wrap (body)) problems.push (`typed subtract multiply snippet checks keeps ${name}`);
    };
    check ('int x int multiply widens', '        int d = 60;\n        int l = 5;\n        object r = multiply(d, l);', 'object r = ((Int64)d * l);');
    check ('Int64? subtract binds object', '        object r = subtract(since, 1);', 'object r = ' + subMulHelperBody ('subtract') + '(since, 1);');
    check ('nested object multiply', '        object v = getValue(o, "a");\n        object r = subtract(multiply(v, 2), 1);', subMulHelperBody ('subtract') + '(' + subMulHelperBody ('multiply') + '(v, 2), 1)');
    check ('Int64? multiply lifted', '        Int64? a = this.safeInteger(o, "a");\n        object r = multiply(a, 1000);', 'object r = ((Int64?)a * 1000);');
    check ('for counter Int64 twin', '        for (int i = 0; i < 3; i++)\n        {\n            Int64 x = multiply(i, 5L);\n        }', 'Int64 x = ((Int64)i * 5L);');
    check ('double subtract twin', '        double a = 1.5;\n        int b = 2;\n        object r = subtract(a, b);', 'object r = (a - b);');
    keep ('unknown operand', '        object r = subtract(this.foo(), 1);');
    const tests = wrap ('        object r = subtract(since, 1);', 'Tests');
    if (csharpTypedSubtractMultiply (true, tests) !== tests) problems.push ('typed subtract multiply snippet checks tests namespace changed');
    const early = wrap ('        object r = subtract(since, 1);');
    if (csharpTypedSubtractMultiply (false, early) !== early) problems.push ('typed subtract multiply snippet checks fired in a non-final pass');
    return problems;
}

// isTrue / getArrayLength / getIndexOf / inOp stay helper calls here; isEqual(X, null|bool|non-numeric
// "lit") becomes a switch over `(object)(X)` copying the helper's type tests in order (X evaluated once).
export function csharpInlineHelperSwitch (objectNull: boolean, content: string): string {
    if (!objectNull || !/(?<![A-Za-z0-9_.])isEqual\(/.test (content) || /^namespace Tests\b/m.test (content)) {
        return content;
    }
    // Double.TryParse can never read it: isEqual answers false at its isNumber gate unless both are equal strings
    const neverNumeric = (body: string) => /^[\x20-\x7e]*$/.test (body) && !/[\\"]/.test (body) && !/nan|inf/i.test (body)
        && (!/[0-9]/.test (body) || /[A-DF-Za-df-z]/.test (body));
    const lines = content.split ('\n');
    const regions = csharpRegions (lines.map (csharpHelperMaskLine), true);
    const rewrite = (args: string[], masks: string[], line: number): string | undefined => {
        if (args.length !== 2) return undefined;
        const [ x, k ] = args;
        const lit = /^"[ ]*"$/.test (masks[1]) && /^"(?:[^"\\]|\\.)*"$/.test (k);
        if (k === 'null') return `(((object)(${x})) == null)`;
        if ((k === 'true') || (k === 'false')) return `(((object)(${x})) is ${k})`;
        if (lit) return neverNumeric (k.slice (1, -1)) ? `(((object)(${x})) is ${k})` : undefined;
        // an int literal: the plain `X == n` only when the printed declaration proves X an int / Int64
        // (or their nullable forms: a null box answers false in both); every other site keeps isEqual
        const isLit = (t: string) => /^-?\d{1,9}$/.test (csharpStripParens (t));
        const name = isLit (k) ? x : (isLit (x) ? k : undefined);
        if (name === undefined) return undefined;
        const bare = csharpStripParens (name);
        if (!/^[A-Za-z_]\w*$/.test (bare)) return undefined;
        const region = regions.filter ((r) => r.start < line).pop ();
        if (region === undefined) return undefined;
        const type = nonNullIntNameType (region, bare, line);
        return [ 'int', 'Int64', 'long', 'int?', 'Int64?', 'long?' ].includes (type) ? '(' + bare + ' == ' + csharpStripParens (isLit (k) ? k : x) + ')' : undefined;
    };
    let changed = false;
    for (let i = 0; i < lines.length; i++) {
        let masked = csharpHelperMaskLine (lines[i]);
        const starts = Array.from (masked.matchAll (/(?<![A-Za-z0-9_.])isEqual\(/g), (m) => m.index);
        // innermost first: a later start is never the container of an earlier one
        for (const s of starts.reverse ()) {
            const open = s + 'isEqual'.length;
            const close = csharpHelperCallEnd (masked, open);
            if (close === undefined) continue;
            const cuts = [ open ];
            let c = open;
            while ((c = csharpHelperTopLevelComma (masked, c, close)) !== undefined) cuts.push (c);
            cuts.push (close);
            const args = [], masks = [];
            for (let a = 0; a + 1 < cuts.length; a++) {
                args.push (lines[i].substring (cuts[a] + 1, cuts[a + 1]).trim ());
                masks.push (masked.substring (cuts[a] + 1, cuts[a + 1]).trim ());
            }
            if (args.some ((a) => a.length === 0)) continue;
            const text = rewrite (args, masks, i);
            if (text === undefined) continue;
            lines[i] = lines[i].substring (0, s) + text + lines[i].substring (close + 1);
            masked = csharpHelperMaskLine (lines[i]);
            changed = true;
        }
    }
    return changed ? lines.join ('\n') : content;
}

// snippet checks (run from csharpNativeEmissionSelfTest)
function inlineHelperSwitchSnippetChecks (): string[] {
    const problems: string[] = [];
    const wrap = (body: string, ns = 'ccxt') => `namespace ${ns};\npublic partial class t : Exchange\n{\n    public virtual object f(object x, object y, int z = 0)\n    {\n${body}\n    }\n}\n`;
    const cases: [string, string, string][] = [
        [ 'isEqual null', '        if (!isEqual(x, null)) { }', 'if (!(((object)(x)) == null)) { }' ],
        [ 'isEqual true', '        if (isEqual(getValue(x, "a"), true)) { }', 'if ((((object)(getValue(x, "a"))) is true)) { }' ],
        [ 'isEqual word', '        if (isEqual(x, "buy")) { }', 'if ((((object)(x)) is "buy")) { }' ],
        [ 'isEqual int local', '        Int64 n = this.milliseconds();\n        if (isEqual(n, -1)) { }', 'if ((n == -1)) { }' ],
        [ 'isEqual int param', '        if (isEqual(0, z)) { }', 'if ((z == 0)) { }' ],
        [ 'isEqual Int64? local', '        Int64? n = this.safeInteger(x, "a");\n        if (isEqual(n, 3)) { }', 'if ((n == 3)) { }' ],
        [ 'nested', '        if (isTrue(isEqual(x, null))) { }', 'if (isTrue((((object)(x)) == null))) { }' ], // helper call kept
    ];
    const keeps: [string, string][] = [
        [ 'isEqual numeric string', '        if (isEqual(x, "1")) { }' ],
        [ 'isEqual NaN', '        if (isEqual(x, "NaN")) { }' ],
        [ 'isEqual two names', '        if (isEqual(x, y)) { }' ],
        [ 'isEqual big int', '        if (isEqual(x, 100000000)) { }' ],
        [ 'isEqual object int', '        if (isEqual(x, -1)) { }' ],
        [ 'isEqual object zero', '        if (isEqual(x, 0)) { }' ],
        [ 'isEqual double local', '        double d = 1.5;\n        if (isEqual(d, 1)) { }' ],
        [ 'isEqual twice-declared', '        int n = 1;\n        Int64 n = 2;\n        if (isEqual(n, 1)) { }' ],
        [ 'inOp name key', '        if (inOp(x, y)) { }' ],
        [ 'inOp lit keeps helper (hx5 X03)', '        if (inOp(x, "k")) { }' ],
        [ 'inOp nested lit keeps helper (hx5 X03)', '        if (inOp(getValue(x, "a"), "k")) { }' ],
        [ 'getIndexOf call target', '        int p = getIndexOf(x, this.f(x, y));' ],
        [ 'isTrue object', '        if (isTrue(x)) { }' ], // unproven operand keeps the helper call
        [ 'isTrue call', '        if (isTrue(this.isDictionary(x))) { }' ],
        // an object receiver with a literal needle keeps the plain helper call
        [ 'getIndexOf object receiver', '        int p = getIndexOf(x, "?");' ],
        [ 'in string', '        string s = "isTrue(x)"; // isTrue(x)' ],
        // an unproven getArrayLength keeps the helper call (never an inline switch)
        [ 'getArrayLength object', '        for (int i = 0; i < getArrayLength(x); i++) { }' ],
        [ 'getArrayLength call arg', '        int n = getArrayLength(this.f(x, y));' ],
    ];
    problems.push (...snippetCaseProblems ('inline helper switch snippet checks', (t) => csharpInlineHelperSwitch (true, t), wrap, cases, keeps, 400));
    if (csharpInlineHelperSwitch (false, wrap ('        if (isTrue(x)) { }')) !== wrap ('        if (isTrue(x)) { }')) problems.push ('objectNull=false changed');
    if (csharpInlineHelperSwitch (true, wrap ('        if (isTrue(x)) { }', 'Tests')) !== wrap ('        if (isTrue(x)) { }', 'Tests')) problems.push ('inline helper switch snippet checks tests namespace changed');
    return problems;
}

// parseInt / parseFloat on an operand printed as a C# string (`string`/`string?` ident, `((string)ident)`, or its
// `.Replace("lit", (string)"lit")`) -> `JsParse.parseInt|parseFloat (s)`: typed, never throws, ECMAScript prefix parsing.
// parseFloat's `double?` only goes where an object box is held (same box); every other operand keeps the helper call.
function parseHelperInnerIsSimple (inner: string, typeOf: (name: string) => string | undefined): boolean {
    const text = inner.trim ();
    let m = /^([A-Za-z_]\w*)$/.exec (text);
    if (m !== null) {
        const t = typeOf (m[1]);
        return (t === 'string') || (t === 'string?');
    }
    if (/^\(\(string\)[A-Za-z_]\w*\)$/.test (text)) {
        return true;
    }
    m = /^([A-Za-z_]\w*)\.Replace\("[^"\\]*", \(string\)"[^"\\]*"\)$/.exec (text);
    if (m !== null) {
        const t = typeOf (m[1]);
        return (t === 'string') || (t === 'string?');
    }
    return false;
}

export function csharpNativeParseCalls (objectNull: boolean, content: string): string {
    if (!objectNull || !/\bparse(?:Int|Float)\s*\(/.test (content) || /^namespace Tests;/m.test (content)) {
        return content;
    }
    return csharpLinePass (content, false, (region, line, masked, i) => {
        if (!/\bparse(?:Int|Float)\s*\(/.test (masked)) {
            return undefined;
        }
        const typeOf = (name: string) => csharpHelperReceiverType (region, name, i, region.params)?.type;
        let result = '';
        let from = 0;
        const re = /(?<![\w.])parse(Int|Float)\(/g;
        let m: RegExpExecArray | null;
        while ((m = re.exec (masked)) !== null) {
            const open = m.index + m[0].length - 1;
            const close = csharpHelperCallEnd (masked, open);
            if ((close === undefined) || (m.index < from)) continue;
            if (!parseHelperInnerIsSimple (line.slice (open + 1, close), typeOf)) continue;
            if (m[1] === 'Float') {
                const before = masked.slice (0, m.index);
                const after = masked.slice (close + 1);
                const holdsBox = /(?:[^=!<>]=|\breturn|\?|:|\(object\))[ ]*$/.test (before) && /^[ ]*(?:\)*[ ]*;|\)+[ ]*;)/.test (after);
                if (!holdsBox) continue;
            }
            result += line.slice (from, m.index) + 'JsParse.parse' + m[1] + line.slice (open, close + 1);
            from = close + 1;
        }
        return (from === 0) ? undefined : result + line.slice (from);
    });
}

// exact snippet checks: `pass (wrap (body[, sig]))` must equal `wrap (expected[, sig])` and be a fixed point
function exactSnippetChecker (problems: string[], label: string, pass: (text: string) => string, wrap: (body: string, sig?: string) => string) {
    return (name: string, body: string, expected: string, sig?: string) => {
        const output = pass (wrap (body, sig));
        if (output !== wrap (expected, sig)) problems.push (`${label}: ${name}: ${output.replace (/\n/g, ' | ').slice (0, 300)}`);
        if (pass (output) !== output) problems.push (`${label}: ${name}: not idempotent`);
    };
}

export function nativeParseCallsSnippetChecks (): string[] {
    const problems: string[] = [];
    const wrap = (body: string, sig = 'public void Target (object o)') => `namespace ccxt;\n\npublic partial class BaseExchange\n{\n    ${sig}\n    {\n${body}\n    }\n}\n`;
    const check = exactSnippetChecker (problems, 'parse', (t) => csharpNativeParseCalls (true, t), wrap);
    check ('string? local parseInt', '        string? s = this.safeString(o, "a");\n        Int64? n = parseInt(s);', '        string? s = this.safeString(o, "a");\n        Int64? n = JsParse.parseInt(s);');
    check ('string param parseFloat assign', '        o = parseFloat(s);', '        o = JsParse.parseFloat(s);', 'public void Target (string s, object o)');
    check ('object operand keeps helper', '        Int64? n = parseInt(o);', '        Int64? n = parseInt(o);');
    check ('ambiguous object local keeps helper', '        object s = o;\n        Int64? n = parseInt(s);', '        object s = o;\n        Int64? n = parseInt(s);');
    check ('parseFloat as operand keeps helper', '        string s = "1";\n        object r = add(parseFloat(s), 1);', '        string s = "1";\n        object r = add(parseFloat(s), 1);');
    check ('parseFloat ternary arm', '        string? s = null;\n        o[0] = ((s == null)) ? null : parseFloat(s);', '        string? s = null;\n        o[0] = ((s == null)) ? null : JsParse.parseFloat(s);');
    check ('Replace operand', '        string? s = this.safeString(o, "a");\n        Int64? n = parseInt(s.Replace(".", (string)""));', '        string? s = this.safeString(o, "a");\n        Int64? n = JsParse.parseInt(s.Replace(".", (string)""));');
    check ('string cast operand', '        object s = o;\n        o = parseInt(((string)s));', '        object s = o;\n        o = JsParse.parseInt(((string)s));');
    check ('arithmetic parent keeps type', '        string s = "1";\n        Int64? t = (parseInt(s) * 1000);', '        string s = "1";\n        Int64? t = (JsParse.parseInt(s) * 1000);');
    if (csharpNativeParseCalls (false, wrap ('        string s = "1"; Int64? n = parseInt(s);')) !== wrap ('        string s = "1"; Int64? n = parseInt(s);')) problems.push ('parse: fired in a non-final pass');
    return problems;
}

// tuple-slot: `getValue(this.handleXAndParams(..), 0)` -> `this.handleXAndParams(..)[0]`.
// These producers always return a two-element List<object> (cs/ccxt/base, bitget), so the
// index read equals GetValue's list branch; the surrounding cast is kept.
export function csharpTupleSlotRead (objectNull: boolean, content: string): string {
    if (!objectNull || !/\bgetValue\(this\.handle/.test (content) || /^namespace Tests;/m.test (content)) {
        return content;
    }
    const producers = [ 'handleMarketTypeAndParams', 'handleSubTypeAndParams', 'handleProductTypeAndParams', 'handleOptionAndParams', 'handleOptionAndParams2' ];
    const head = new RegExp ('(?<![\\w.])getValue\\(this\\.(?:' + producers.join ('|') + ')\\(', 'g');
    let out = '';
    let pos = 0;
    let m: RegExpExecArray | null;
    while ((m = head.exec (content)) !== null) {
        let i = m.index + m[0].length;
        let depth = 1;
        let quote = false;
        for (; (i < content.length) && (depth > 0) && (content[i] !== '\n'); i++) {
            const c = content[i];
            if (quote) { if (c === '\\') i++; else if (c === '"') quote = false; continue; }
            if (c === '"') quote = true;
            else if (c === '(') depth++;
            else if (c === ')') depth--;
        }
        if ((depth !== 0) || !content.startsWith (', 0)', i)) continue;
        out += content.slice (pos, m.index) + m[0].slice ('getValue('.length) + content.slice (m.index + m[0].length, i) + '[0]';
        pos = i + ', 0)'.length;
        head.lastIndex = pos;
    }
    return (pos === 0) ? content : out + content.slice (pos);
}

export function tupleSlotReadSnippetChecks (): string[] {
    const problems: string[] = [];
    const wrap = (body: string) => `namespace ccxt;\n\npublic partial class BaseExchange\n{\n    public void Target (object o)\n    {\n${body}\n    }\n}\n`;
    const check = exactSnippetChecker (problems, 'tuple-slot', (t) => csharpTupleSlotRead (true, t), wrap);
    check ('market type slot 0', '        string? t = ((string)getValue(this.handleMarketTypeAndParams("f", market, parameters), 0));', '        string? t = ((string)this.handleMarketTypeAndParams("f", market, parameters)[0]);');
    check ('nested call args', '        object t = getValue(this.handleSubTypeAndParams(m, this.market(s), p, "linear"), 0);', '        object t = this.handleSubTypeAndParams(m, this.market(s), p, "linear")[0];');
    check ('slot 1 keeps helper', '        object t = getValue(this.handleMarketTypeAndParams("f", null, p), 1);', '        object t = getValue(this.handleMarketTypeAndParams("f", null, p), 1);');
    check ('other producer keeps helper', '        object t = getValue(this.handleTriggerPricesAndParams(s, p), 0);', '        object t = getValue(this.handleTriggerPricesAndParams(s, p), 0);');
    if (csharpTupleSlotRead (false, wrap ('        object t = getValue(this.handleOptionAndParams(p, "f", "o"), 0);')) !== wrap ('        object t = getValue(this.handleOptionAndParams(p, "f", "o"), 0);')) problems.push ('tuple-slot: fired in a non-final pass');
    return problems;
}

// 77c4 (run from the --self-test path): a null-seeded local whose writes are all element 1 of the
// params-tuple helpers (base handle*AndParams, the awaited bitget handleUTAAndParams) and self omits
// is declared IDictionary<string, object>; every slot read takes the exact cast back
export function nullSeedParamsSlotChecks (): string[] {
    const problems: string[] = [];
    const config: any = { verbose: false, csharp: { parser: { NUM_LINES_END_FILE: 0, 'ELEMENT_ACCESS_WRAPPER_OPEN': 'getValue(', 'ELEMENT_ACCESS_WRAPPER_CLOSE': ')' } } };
    const transpiler = new Transpiler (config);
    setupCsharpPrinter (transpiler);
    const method = (file: string, name: string) => {
        const out: string = (transpiler as any).transpileCSharpByPath (file).content;
        const start = out.indexOf (' ' + name + '(');
        return (start < 0) ? '' : out.slice (start, out.indexOf ('\n    }\n', start));
    };
    const expect = (label: string, body: string, wanted: string[]) => {
        for (const w of wanted) {
            if (!body.includes (w)) problems.push (`null-seed params slot: ${label}: missing ${w}`);
        }
    };
    expect ('binance fetchOrder (base element 1)', method ('./ts/src/binance.ts', 'fetchOrder'), [
        'IDictionary<string, object> paramsStock = null;',
        'paramsStock = (IDictionary<string, object>)stockparamsStockVariable[1];',
        'paramsStock = (IDictionary<string, object>)typeparamsStockVariable[1];',
        'paramsStock = this.omit(paramsStock, ',
    ]);
    expect ('bitget fetchMarketLeverageTiers (awaited venue tuple)', method ('./ts/src/bitget.ts', 'fetchMarketLeverageTiers'), [
        'IDictionary<string, object> paramsMarginMode = null;',
        'paramsMarginMode = (IDictionary<string, object>)((IList<object>)utaparamsMarginModeVariable)[1];',
    ]);
    return problems;
}

// 77c5 snippet checks (part of `csharpTranspiler.ts --self-test`): copies of a typed local / core
// parameter and the omit writes of such copies name the source's type; an untyped source keeps object
export function copyLocalSnippetChecks77c5 (): string[] {
    const problems: string[] = [];
    const config: any = { verbose: false, csharp: { parser: { NUM_LINES_END_FILE: 0, 'ELEMENT_ACCESS_WRAPPER_OPEN': 'getValue(', 'ELEMENT_ACCESS_WRAPPER_CLOSE': ')' } } };
    const transpiler = new Transpiler (config);
    setupCsharpPrinter (transpiler);
    const pre = 'type Dict = { [key: string]: any }; type Int = number; type Str = string | undefined;\nclass Test {\n omit (o, k): Dict { return o; }\n safeString (o, k, d = undefined): Str { return d; }\n';
    const check = (name: string, body: string, expected: string) => {
        const out: string = (transpiler as any).transpileCSharp (pre + body + '\n}').content;
        if (!out.includes (expected)) { problems.push (`77c5 copy locals: ${name}: ${out.replace (/\n/g, ' | ').slice (0, 300)}`); }
    };
    check ('dict copy with an omit write', 'f (o) { const d = {}; let q = d; if (o) { q = this.omit (d, "x"); } return this.safeString (q, "a"); }', 'Dictionary<string, object> q = d;');
    check ('core Int64? parameter copy', 'async fetchOHLCV (symbol: string, timeframe = "1m", since: Int = undefined, limit: Int = undefined, params = {}) { const start = since; return start; }', 'Int64? start = since;');
    check ('omit of an object receiver keeps object', 'f (o) { let q = o; if (o) { q = this.omit (o, "x"); } return this.safeString (q, "a"); }', 'object q = o;');
    return problems;
}

// 77c7: `this.<base helper / venue builder>(...)` locals typed from the callee's own C# signature
// (build/csharp-local-types.js, block "77c7"); each case fails on the parent, each keep holds there
export function helperReturnLocalsSnippetChecks (): string[] {
    const problems: string[] = [];
    const config: any = { verbose: false, csharp: { parser: { NUM_LINES_END_FILE: 0, 'ELEMENT_ACCESS_WRAPPER_OPEN': 'getValue(', 'ELEMENT_ACCESS_WRAPPER_CLOSE': ')' } } };
    const transpiler = new Transpiler (config);
    setupCsharpPrinter (transpiler);
    const print = (body: string) => (transpiler as any).transpileCSharp ('type Dict = any; class Test {\n binaryLength (b) { return 0; }\n packb (d) { return d; }\n randomBytes (n) { return \'\'; }\n hash (a, b, c) { return a; }\n' + body + '\n}').content as string;
    const cases: [string, string, string][] = [
        [ 'binaryLength -> int', 'f (m) { const n = this.binaryLength (m); return this.hash (m, n, 1); }', 'int n = this.binaryLength(m);' ],
        [ 'packb -> byte[]', 'f (a) { const d = this.packb (a); return this.hash (d, 1, 1); }', 'byte[] d = this.packb(a);' ],
        [ 'randomBytes -> string', 'f () { const n = this.randomBytes (16); return this.hash (n, 1, 1); }', 'string n = this.randomBytes(16);' ],
        [ 'per-declaration Sig builder', 'signUserSignedAction (t: Dict, m: Dict): Dict { const signature = { \'r\': 1 }; return signature; }\n buildSendAssetSig (m: Dict): Dict { return this.signUserSignedAction ({}, m); }\n g (p) { const sig = this.buildSendAssetSig (p); return this.hash (sig, 1, 1); }', 'Dictionary<string, object> sig = this.buildSendAssetSig(p);' ],
    ];
    for (const [ name, body, expected ] of cases) {
        const out = print (body);
        if (!out.includes (expected)) problems.push (`77c7 helper-return locals: ${name}: ${out.replace (/\n/g, ' | ').slice (-400)}`);
    }
    // a Sig builder whose return path is not a proven dict keeps object, and so does its caller
    const kept = print ('buildSendAssetSig (m: Dict): Dict { return m; }\n g (p) { const sig = this.buildSendAssetSig (p); return this.hash (sig, 1, 1); }');
    if (!kept.includes ('object sig = this.buildSendAssetSig(p);')) problems.push (`77c7 helper-return locals: unproven builder retyped: ${kept.replace (/\n/g, ' | ').slice (-400)}`);
    return problems;
}

// 84c5: copies of typed parameters and their extend / omit results (build/csharp-local-types.js,
// block "84c5"); each case fails on the parent, each keep holds there
export function copyLocalSnippetChecks84c5 (): string[] {
    const problems: string[] = [];
    const config: any = { verbose: false, csharp: { dictParamsMethods: [ 'fetchBalance' ], parser: { NUM_LINES_END_FILE: 0, 'ELEMENT_ACCESS_WRAPPER_OPEN': 'getValue(', 'ELEMENT_ACCESS_WRAPPER_CLOSE': ')' } } };
    const transpiler = new Transpiler (config);
    setupCsharpPrinter (transpiler);
    const pre = 'type Dict = { [key: string]: any }; type Int = number; type Str = string | undefined;\nclass Test {\n omit (o, k): Dict { return o; }\n extend (a, b = undefined): Dict { return a; }\n safeString (o, k, d = undefined): Str { return d; }\n';
    const check = (name: string, body: string, expected: string) => {
        const out: string = (transpiler as any).transpileCSharp (pre + body + '\n}').content;
        if (!out.includes (expected)) { problems.push (`84c5 copy locals: ${name}: ${out.replace (/\n/g, ' | ').slice (0, 300)}`); }
    };
    check ('copy of the typed params bag with an omit write', 'async fetchBalance (params = {}) { let q = params; if (q) { q = this.omit (q, "x"); } return this.safeString (q, "a"); }', 'IDictionary<string, object> q = parameters;');
    check ('copy of the typed params bag with an element write', 'async fetchBalance (params = {}) { const q = params; q["a"] = 1; return q; }', 'IDictionary<string, object> q = parameters;');
    check ('copy of the typed params bag with only helper uses keeps object', 'async fetchBalance (params = {}) { let q = params; q = this.omit (params, "x"); return this.extend ({}, q); }', 'object q = parameters;');
    check ('params bag of an unlisted method keeps object', 'async fooBar (params = {}) { let q = params; return this.safeString (q, "a"); }', 'object q = parameters;');
    check ('R3 keeps a plain Dictionary omit result Dictionary', 'async fetchBalance (params = {}) { const q = this.omit ({}, "x"); return this.extend ({}, q); }', 'Dictionary<string, object> q = this.omit(');
    // R2 (slot-1 writes into a typed bag copy) proves through the base Exchange.ts / ts/src corpus tables
    // (nullSeedElement1Call / tupleDictSlotCall), which an in-memory snippet cannot reach: farm-gated only.
    check ('written params bag keeps object', 'async fetchBalance (params = {}) { params = this.omit (params, "y"); let q = params; return this.safeString (q, "a"); }', 'object q = parameters;');
    return problems;
}

// ral-84c7: locals initialised by a helper whose result is a non-null string print `string` and
// their `+` reads print the native concatenation (no null-guarded object concat)
export function nonNullStringCallSnippetChecks84c7 (): string[] {
    const problems: string[] = [];
    const config: any = { verbose: false, csharp: { parser: { NUM_LINES_END_FILE: 0, 'ELEMENT_ACCESS_WRAPPER_OPEN': 'getValue(', 'ELEMENT_ACCESS_WRAPPER_CLOSE': ')' } } };
    const transpiler = new Transpiler (config);
    setupCsharpPrinter (transpiler);
    const print = (body: string) => (transpiler as any).transpileCSharp ('class Test {\n binaryToBase16 (b) { return \'\'; }\n hash (a, b, c) { return a; }\n' + body + '\n}').content as string;
    const cases: [string, string, string][] = [
        [ 'binaryToBase16 -> string', 'f (m) { const h = this.binaryToBase16 (m); const d = h + \'00\'; return this.hash (d, 1, 1); }', 'string d = (h + \"00\");' ],
        [ 'same-file literal-concat helper', 'chan (id: string, deltas: boolean = false): string { if (deltas) { return \'book.\' + id + \'.d\'; } return \'book.\' + id; }\n g (id) { const c = this.chan (id, true); const k = c + \':requested\'; return this.hash (k, 1, 1); }', 'string c = this.chan(id, true);' ],
    ];
    for (const [ name, body, expected ] of cases) {
        const out = print (body);
        if (!out.includes (expected)) problems.push (`84c7 non-null string call locals: ${name}: ${out.replace (/\n/g, ' | ').slice (-400)}`);
    }
    // ral-84c7 R2: pass-through helpers keep the argument's collection type
    const passThrough = (transpiler as any).transpileCSharp ('class Test {\n clone (o) { return o; }\n requireValue (v, m) { return v; }\n hash (a, b, c) { return a; }\n'
        + ' f (p) { const position = { \'a\': 1 }; const s = this.clone (position); s[\'side\'] = \'short\'; const r = this.requireValue (position, \'m\'); r[\'x\'] = 1; return this.hash (s, r, 1); }\n}').content as string;
    if (!passThrough.includes ('Dictionary<string, object> s = ((Dictionary<string, object>)this.clone(position));')) problems.push (`84c7 pass-through clone: ${passThrough.replace (/\n/g, ' | ').slice (-400)}`);
    if (!passThrough.includes ('Dictionary<string, object> r = ((Dictionary<string, object>)this.requireValue(position, "m"));')) problems.push (`84c7 pass-through requireValue: ${passThrough.replace (/\n/g, ' | ').slice (-400)}`);
    // a helper with a non-literal return path keeps object
    const kept = print ('chan (id) { if (id) { return \'a\'; } return id; }\n g (id) { const c = this.chan (id); const k = c + \':r\'; return this.hash (k, 1, 1); }');
    if (!kept.includes ('object c = this.chan(id);')) problems.push (`84c7 non-null string call locals: unproven helper retyped: ${kept.replace (/\n/g, ' | ').slice (-400)}`);
    // ral-87c7: the clock string seeding a guarded `+` chain takes the non-null `string`, so the chain local is native too
    const signed = print ('sign (method, path) { const ts = this.numberToString (this.milliseconds ()); let auth = ts + method + path; if (path) { auth = auth + \'?\'; } return this.hash (auth, 1, 1); }');
    for (const expected of [ 'string ts = callDynamically(this, "numberToString"', 'string auth = ((ts + method) + (path));', 'auth = (auth + "?");' ]) {
        if (!signed.includes (expected)) problems.push (`87c7 clock-string seed of a guarded concat: ${expected}: ${signed.replace (/\n/g, ' | ').slice (-400)}`);
    }
    // ral-87c7 R2: an Int64 sum bound clamped by an int length and read only by comparisons
    const chunked = (transpiler as unknown as { transpileCSharp (src: string): { content: string }, transpileCSharpByPath (file: string): { content: string } }).transpileCSharp ('class Test {\n sum (a, b) { return a; }\n safeInteger (o, k, d = undefined) { return d; }\n'
        + ' f (ids: string[]) { const n = ids.length; const size = this.safeInteger ({}, \'x\', 50); let start = 0; const out = []; while (start < n) { let end = this.sum (start, size); if (end > n) { end = n; } for (let i = start; i < end; i++) { out.push (ids[i]); } start = this.sum (start, size); } return out; }\n}').content as string;
    for (const expected of [ 'Int64 end = this.sum(start, size);', 'if (end > n)' ]) {
        if (!chunked.includes (expected)) problems.push (`87c7 Int64 sum bound: ${expected}: ${chunked.replace (/\n/g, ' | ').slice (-500)}`);
    }
    const escaped = (transpiler as unknown as { transpileCSharp (src: string): { content: string }, transpileCSharpByPath (file: string): { content: string } }).transpileCSharp ('class Test {\n sum (a, b) { return a; }\n safeInteger (o, k, d = undefined) { return d; }\n'
        + ' f (ids: string[]) { const n = ids.length; const size = this.safeInteger ({}, \'x\', 50); let start = 0; let end = this.sum (start, size); if (end > n) { end = n; } return [ start, end ]; }\n}').content as string;
    if (!escaped.includes ('object end = this.sum(start, size);')) problems.push (`87c7 Int64 sum bound: escaping read retyped: ${escaped.replace (/\n/g, ' | ').slice (-500)}`);
    // ral-87c7 R3: element read of a local map whose every element write is a list
    const bucketBody = (tail: string) => 'class Test {\n safeList (o, k, d = undefined) { return d; }\n hash (a, b, c) { return a; }\n'
        + ' f (keys: string[], rows: string[]) { const byKey = {}; for (let i = 0; i < keys.length; i++) { const k = keys[i]; if (!(k in byKey)) { byKey[k] = []; } const g = this.safeList (byKey, k, []); g.push (rows[i]); byKey[k] = g; }' + tail + ' }\n}';
    const bucket = (transpiler as unknown as { transpileCSharp (src: string): { content: string }, transpileCSharpByPath (file: string): { content: string } }).transpileCSharp (bucketBody (' const out = []; for (let i = 0; i < keys.length; i++) { const grouped = byKey[keys[i]]; for (let j = 0; j < grouped.length; j++) { out.push (grouped[j]); } } return out;')).content as string;
    // ral-90c7: the bucket map itself is Dictionary<string, List<object>>, so a string-keyed read needs no cast back
    const typedBucket = (tail: string) => (transpiler as unknown as { transpileCSharp (src: string): { content: string } }).transpileCSharp ('type Str = string | undefined;\nclass Test {\n safeList (o, k, d = undefined) { return d; }\n safeString (o, k, d = undefined): Str { return d; }\n hash (a, b, c) { return a; }\n'
        + ' f (rows) { const byKey = {}; for (let i = 0; i < rows.length; i++) { const k = this.safeString (rows[i], \'id\'); if (k === undefined) { continue; } if (!(k in byKey)) { byKey[k] = []; } const g = this.safeList (byKey, k, []); g.push (rows[i]); byKey[k] = g; } const out = []; for (let i = 0; i < rows.length; i++) { const m = this.safeString (rows[i], \'id\');' + tail + ' } return out; }\n}').content as string;
    const typed = typedBucket (' if ((m === undefined) || !(m in byKey)) { continue; } const grouped = byKey[m]; for (let j = 0; j < grouped.length; j++) { out.push (grouped[j]); }');
    for (const expected of [ 'Dictionary<string, List<object>> byKey = new Dictionary<string, List<object>>() {};', 'List<object> grouped = (m != null && byKey.ContainsKey(m) ? byKey[m] : null);', 'byKey[(string)k] = g;' ]) {
        if (!typed.includes (expected)) problems.push (`90c7 list-bucket map value type: ${expected}: ${typed.replace (/\n/g, ' | ').slice (-700)}`);
    }
    if (typed.includes ('((List<object>)') || typed.includes ('((IDictionary<string,object>)byKey)')) problems.push (`90c7 list-bucket map value type: cast kept: ${typed.replace (/\n/g, ' | ').slice (-700)}`);
    // a map with an element read that is not a local's initializer keeps Dictionary<string, object>
    const escapedMap = typedBucket (' const grouped = byKey[m]; out.push (grouped.length); out.push (byKey[m]);');
    if (escapedMap.includes ('List<object>> byKey')) problems.push (`90c7 list-bucket map value type: other element read retyped the map: ${escapedMap.replace (/\n/g, ' | ').slice (-700)}`);
    // ral-92c7: a self padStart write keeps the non-null string; a hex string also passed to calls is typed by its .length read
    const bare = (body: string) => (transpiler as unknown as { transpileCSharp (src: string): { content: string } }).transpileCSharp ('class Test {\n hash (a, b, c) { return a; }\n read (h, o) { return o; }\n' + body + '\n}').content;
    const padded = bare ('g (fee) { let h = this.intToBase16 (fee); h = h.padStart (24, \'0\'); const p = h + \'00\'; return this.hash (p, 1, 1); }');
    if (!padded.includes ('string h = ') || !padded.includes ('string p = (h + "00");')) problems.push (`92c7 self padStart write: ${padded.replace (/\n/g, ' | ').slice (-400)}`);
    const frame = bare ('g (m) { const h = this.binaryToBase16 (m); const n = h.length / 2; return this.read (h, n); }');
    if (!frame.includes ('string h = ') || !frame.includes ('h?.Length') || frame.includes ('((string)h)')) problems.push (`92c7 string-receiver call argument: ${frame.replace (/\n/g, ' | ').slice (-400)}`);
    const argOnly = bare ('g (m) { const h = this.binaryToBase16 (m); return this.read (h, 1); }');
    if (!argOnly.includes ('object h = ')) problems.push (`92c7 string-receiver call argument: argument-only local retyped: ${argOnly.replace (/\n/g, ' | ').slice (-400)}`);
    // ral-92c7 R4: a JSON.parse result whose first use (the next statement) needs a map is declared Dictionary
    const parsedMap = bare ('g (t, a) { const w = JSON.parse (t); w[\'x\'] = a; if (\'m\' in w) { w[\'m\'] = a; } return this.hash (w, 1, 1); }');
    if (!parsedMap.includes ('Dictionary<string, object> w = ((Dictionary<string, object>)') || parsedMap.includes ('((IDictionary<string,object>)w)')) problems.push (`92c7 JSON.parse map local: ${parsedMap.replace (/\n/g, ' | ').slice (-400)}`);
    const parsedLater = bare ('g (t, a) { const w = JSON.parse (t); const n = this.hash (a, 1, 1); w[\'x\'] = n; return w; }');
    if (!parsedLater.includes ('object w = ')) problems.push (`92c7 JSON.parse map local: map use not next retyped: ${parsedLater.replace (/\n/g, ' | ').slice (-400)}`);
    // ral-93c7: a helper declared once whose every return is an object literal, read as x[k]
    const req = (use: string) => bare ('unsubscribeRequest (c) { return { \'id\': c, \'method\': \'unsubscribe\' }; }\n g (c) { const u = this.unsubscribeRequest (c); ' + use + ' }');
    const literalDict = req ('return u[\'id\'];');
    if (!literalDict.includes ('Dictionary<string, object> u = ((Dictionary<string, object>)') || literalDict.includes ('getValue(u')) problems.push (`93c7 literal dict helper result: ${literalDict.replace (/\n/g, ' | ').slice (-400)}`);
    const literalPassed = req ('return this.hash (u, 1, 1);');
    if (!literalPassed.includes ('object u = ')) problems.push (`93c7 literal dict helper result: hand-off only retyped: ${literalPassed.replace (/\n/g, ' | ').slice (-400)}`);
    // ral-93c7 R3: `const c = this.currencies` read only by key reads the hand-written currenciesDict view
    const view = bare ('g (code) { const c = this.currencies; if (code in c) { return c[code]; } return undefined; }');
    if (!view.includes ('IDictionary<string, object> c = this.currenciesDict;')) problems.push (`93c7 currencies view local: ${view.replace (/\n/g, ' | ').slice (-400)}`);
    const viewPassed = bare ('g (code) { const c = this.currencies; return this.hash (c, code, 1); }');
    if (!viewPassed.includes ('object c = ')) problems.push (`93c7 currencies view local: hand-off retyped: ${viewPassed.replace (/\n/g, ' | ').slice (-400)}`);
    return problems;
}

// 87c4 snippet checks (part of `csharpTranspiler.ts --self-test`): a `let x: Str = undefined` read as a string
// receiver is declared `string?`, its same-file string-call write needs no cast and the receiver prints natively;
// a seed with no string-receiver use keeps object
export function nullSeedNativeStringChecks87c4 (): string[] {
    const problems: string[] = [];
    const config = { verbose: false, csharp: { parser: { NUM_LINES_END_FILE: 0, 'ELEMENT_ACCESS_WRAPPER_OPEN': 'getValue(', 'ELEMENT_ACCESS_WRAPPER_CLOSE': ')' } } };
    const transpiler = new Transpiler (config);
    setupCsharpPrinter (transpiler);
    const emit = transpiler as unknown as { transpileCSharp (src: string): { content: string }, transpileCSharpByPath (file: string): { content: string } };
    const pre = 'type Str = string | undefined;\nclass Test {\n signed (a: Str): Str { if (a === undefined) { return undefined; } return \'-\' + a; }\n';
    const print = (body: string) => emit.transpileCSharp (pre + body + '\n}').content;
    const out = print ('f (o, a: Str) { let x: Str = undefined; if (o) { x = this.signed (a); } if (x !== undefined) { return x.toLowerCase (); } return x; }');
    if (!out.includes ('string? x = null;') || out.includes ('((string)x)')) problems.push (`87c4 null-seed native string: ${out.replace (/\n/g, ' | ').slice (-400)}`);
    const kept = print ('f (o, a: Str) { let x: Str = undefined; if (o) { x = this.signed (a); } return x; }');
    if (!kept.includes ('object x = null;')) problems.push (`87c4 null-seed native string: seed with no string use retyped: ${kept.replace (/\n/g, ' | ').slice (-400)}`);
    // R2: a null seed written by `this.sum (a, b)` over integer operands and read by `<` is Int64? (needs the corpus' typed until/since)
    const whitebit: string = emit.transpileCSharpByPath ('./ts/src/whitebit.ts').content;
    const start = whitebit.indexOf (' fetchOHLCV(');
    const body = (start < 0) ? '' : whitebit.slice (start, whitebit.indexOf ('\n    }\n', start));
    if (!body.includes ('Int64? endTime = null;')) problems.push ('87c4 R2 null-seed sum write: whitebit fetchOHLCV endTime not Int64?');
    // R4: `let p = undefined; p = this.safeDict (o, 1, {}); … p = this.omit (p, k)` is IDictionary, so the omit binds the dict overload
    const r4 = print ('safeDict (o, k, d = undefined) { return d; }\n omit (o, k) { return o; }\n f (o) { let p = undefined; p = this.safeDict (o, 1, {}); if (o) { p = this.omit (p, \'a\'); } return p; }');
    if (!r4.includes ('IDictionary<string, object> p = null;')) problems.push (`87c4 R4 null-seed self-omit: ${r4.replace (/\n/g, ' | ').slice (-400)}`);
    return problems;
}

// ral-90c4 snippet checks (part of `csharpTranspiler.ts --self-test`)
export function nullSeedChecks90c4 (): string[] {
    const problems: string[] = [];
    const config = { verbose: false, csharp: { parser: { NUM_LINES_END_FILE: 0, 'ELEMENT_ACCESS_WRAPPER_OPEN': 'getValue(', 'ELEMENT_ACCESS_WRAPPER_CLOSE': ')' } } };
    const transpiler = new Transpiler (config);
    setupCsharpPrinter (transpiler);
    const emit = transpiler as unknown as { transpileCSharp (src: string): { content: string } };
    const pre = 'type Str = string | undefined;\nclass Test {\n signed (a: Str): Str { if (a === undefined) { return undefined; } return \'-\' + a; }\n';
    const print = (body: string) => emit.transpileCSharp (pre + body + '\n}').content;
    // R1: a `Str` null seed read as the LEFT of `+` keeps the printer's guarded concat, typed string?, no ((object)..) box
    const r1 = print ('f (o, a: Str) { let x: Str = undefined; if (o) { x = \'p\'; } x += \'?\' + a; return x; }');
    if (!r1.includes ('string? x = null;') || r1.includes ('((object)(x == null')) problems.push (`90c4 R1 null-seed guarded concat: ${r1.replace (/\n/g, ' | ').slice (-400)}`);
    // R2: a `typeof r === 'string'` const alias guards the copy `x = r` like the direct test, so the receiver prints natively
    const r2 = print ('f (r) { let x: Str = undefined; const isString = (typeof r === \'string\'); if (isString) { x = r; } else { x = this.signed (\'a\'); } const u = (x as string).toUpperCase (); return u; }');
    if (!r2.includes ('string? x = null;') || !r2.includes ('x = ((string)r);')) problems.push (`90c4 R2 typeof alias copy: ${r2.replace (/\n/g, ' | ').slice (-400)}`);
    // R4: a concat write whose left leaf is a typed string local, into a seed compared with a string literal: native ==
    const r4 = print ('safeString (o, k, d = undefined): Str { return d; }\n f (o) { let x: Str = undefined; const a = this.safeString (o, 4); const b = this.safeString (o, 5); if (a === \'limit\') { x = a; } else { x = a + \' \' + b; } if (x === \'stop loss\') { return 1; } return 0; }');
    if (!r4.includes ('string? x = null;') || !r4.includes ('x == "stop loss"')) problems.push (`90c4 R4 concat write: ${r4.replace (/\n/g, ' | ').slice (-400)}`);
    return problems;
}

// ral-87c5 R1: a copy of a typed string local whose `+` reads are left operands prints `string?` and
// keeps the printer's null-guarded concatenation, minus the `((object)…)` box
export function copyLocalSnippetChecks87c5 (): string[] {
    const problems: string[] = [];
    const config = { verbose: false, csharp: { parser: { NUM_LINES_END_FILE: 0, 'ELEMENT_ACCESS_WRAPPER_OPEN': 'getValue(', 'ELEMENT_ACCESS_WRAPPER_CLOSE': ')' } } };
    const transpiler = new Transpiler (config);
    setupCsharpPrinter (transpiler);
    const pre = 'type Str = string | undefined;\nclass Test {\n safeString (o, k, d = undefined): Str { return d; }\n hash (a, b, c) { return a; }\n';
    const print = (body: string) => (transpiler as unknown as { transpileCSharp (src: string): { content: string }, transpileCSharpByPath (file: string): { content: string } }).transpileCSharp (pre + body + '\n}').content as string;
    const out = print ('f (o) { const orderType = this.safeString (o, \'t\'); const q = orderType; const z = q + \'.x\'; const y = q + \'.y\'; return this.hash (z, y, 1); }');
    if (!out.includes ('string? q = orderType;')) problems.push (`87c5 string copy: not typed: ${out.replace (/\n/g, ' | ').slice (-400)}`);
    if (!out.includes ('string? z = ((string)(q == null ? null : q + ".x"));')) problems.push (`87c5 string copy: guarded read not native: ${out.replace (/\n/g, ' | ').slice (-400)}`);
    // R2: a Dictionary omit result later written from an IDictionary reader and through omit itself
    const widened = (transpiler as unknown as { transpileCSharp (src: string): { content: string }, transpileCSharpByPath (file: string): { content: string } }).transpileCSharp ('type Dict = { [key: string]: any };\nclass Test {\n omit (o, k): Dict { return o; }\n safeDict (o, k, d = undefined): Dict { return d; }\n hash (a, b, c) { return a; }\n'
        + ' f (o) { let p = this.omit ({}, \'a\'); if (o) { p = this.safeDict (o, \'b\'); } p = this.omit (p, \'c\'); return this.hash (p, 1, 1); }\n}').content as string;
    if (!widened.includes ('IDictionary<string, object> p = this.omit(')) problems.push (`87c5 R2 dictionary widening: ${widened.replace (/\n/g, ' | ').slice (-400)}`);
    // R3: self-concat writes `x = x + r` keep the guarded form, now without the box
    const selfWrite = print ('f (o, e) { const id = this.safeString (o, \'i\'); let s = id; if (e) { s = s + \'-\' + e; } const k = s + \':\'; return this.hash (k, 1, 1); }');
    if (!selfWrite.includes ('string? s = id;') || !selfWrite.includes ('s = (s == null ? null : s + "-" + ')) problems.push (`87c5 R3 string self write: ${selfWrite.replace (/\n/g, ' | ').slice (-400)}`);
    // a copy of an untyped value keeps object
    const kept = print ('f (o, r) { let q = o; q = q + \'?\' + r; return this.hash (q, 1, 1); }');
    if (!kept.includes ('object q = o;')) problems.push (`87c5 string copy: untyped source retyped: ${kept.replace (/\n/g, ' | ').slice (-400)}`);
    return problems;
}

// null-seed consumer checks (part of `csharpTranspiler.ts --self-test`)
export function nullSeedChecks92c4 (): string[] {
    const problems: string[] = [];
    const config = { verbose: false, csharp: { parser: { NUM_LINES_END_FILE: 0, 'ELEMENT_ACCESS_WRAPPER_OPEN': 'getValue(', 'ELEMENT_ACCESS_WRAPPER_CLOSE': ')' } } };
    const transpiler = new Transpiler (config);
    setupCsharpPrinter (transpiler);
    const emit = transpiler as unknown as { transpileCSharp (src: string): { content: string } };
    const pre = 'type Str = string | undefined;\nclass Test {\n signed (a: Str): Str { if (a === undefined) { return undefined; } return \'-\' + a; }\n currency (c) { return {}; }\n';
    const print = (body: string) => emit.transpileCSharp (pre + body + '\n}').content;
    // a Str seed compared with a non-numeric string literal prints the native != on string?
    const lit = print ('f (o, a: Str) { let x: Str = undefined; if (o) { x = this.signed (a); } return (x !== \'\') ? 1 : 0; }');
    if (!lit.includes ('string? x = null;') || !lit.includes ('(x != "")')) problems.push (`literal-compare seed: ${lit.replace (/\n/g, ' | ').slice (-400)}`);
    // the currency-row id read is a string write: the receiver call prints natively
    const row = print ('f (code: Str, n: Str) { const currency = this.currency (code); let id: Str = undefined; if (n === undefined) { id = currency[\'id\']; } return id.toUpperCase (); }');
    if (!row.includes ('string? id = null;') || !row.includes ('id.ToUpper()')) problems.push (`currency-row id write: ${row.replace (/\n/g, ' | ').slice (-400)}`);
    // slot 0 of hyperliquid isUnifiedEnabled is its bool? local: a seed compared `=== true` prints native ==
    const hl: string = (transpiler as unknown as { transpileCSharpByPath (file: string): { content: string } }).transpileCSharpByPath ('./ts/src/hyperliquid.ts').content;
    const t0 = hl.search (/ transfer\(/i);
    const tb = (t0 < 0) ? '' : hl.slice (t0, hl.indexOf ('\n    }\n', t0));
    if (!tb.includes ('bool? isUnified = null;') || !tb.includes ('(isUnified == true)')) problems.push ('hyperliquid transfer isUnified not bool? / native ==');
    // a ws url seed written from `wsUrls['public']` (wsUrls = this.safeDict (this.urls['api'], 'ws', {})) and read `url as string`
    const wsu = print ('describe () { return { \'urls\': { \'api\': { \'ws\': { \'public\': \'wss://a\', \'private\': \'wss://b\' } } } }; }\n safeDict (o, k, d = undefined) { return d; }\n watch (u: string) { return u; }\n f (o) { const wsUrls = this.safeDict (this.urls[\'api\'], \'ws\', {}); let url: Str = undefined; if (o) { url = wsUrls[\'public\']; } else { url = wsUrls[\'private\']; } return this.watch (url as string); }');
    if (!wsu.includes ('string? url = null;') || !wsu.includes ('url = ((string)(wsUrls')) problems.push (`ws url element write: ${wsu.replace (/\n/g, ' | ').slice (-400)}`);
    return problems;
}

export function nullSeedChecks93c4 (): string[] {
    const problems: string[] = [];
    const config = { verbose: false, csharp: { parser: { NUM_LINES_END_FILE: 0, 'ELEMENT_ACCESS_WRAPPER_OPEN': 'getValue(', 'ELEMENT_ACCESS_WRAPPER_CLOSE': ')' } } };
    const transpiler = new Transpiler (config);
    setupCsharpPrinter (transpiler);
    const emit = transpiler as unknown as { transpileCSharp (src: string): { content: string } };
    // `const c = x; x = (c === undefined) ? {} : c`: the const copy is the self arm, so the dict seed stays typed
    const src = 'type NullableDict = { [key: string]: unknown } | undefined;\nclass Test {\n f (o, b: string) { let h: NullableDict = undefined; if (o) { h = { \'a\': 1 }; } const c = h; h = (c === undefined) ? {} : c; h[\'r\'] = b; return h; }\n}';
    const out = emit.transpileCSharp (src).content;
    if (!out.includes ('Dictionary<string, object> h = null;') || !out.includes ('h["r"] = b;')) problems.push (`const-copy self ternary: ${out.replace (/\n/g, ' | ').slice (-400)}`);
    return problems;
}

// a safeString seed rewritten from an element of its own split keeps `string?` (part of `--self-test`)
export function readerSeedElementWriteChecks (): string[] {
    const problems: string[] = [];
    const config = { verbose: false, csharp: { parser: { NUM_LINES_END_FILE: 0, 'ELEMENT_ACCESS_WRAPPER_OPEN': 'getValue(', 'ELEMENT_ACCESS_WRAPPER_CLOSE': ')' } } };
    const transpiler = new Transpiler (config);
    setupCsharpPrinter (transpiler);
    const emit = transpiler as unknown as { transpileCSharp (src: string): { content: string } };
    const pre = 'type Str = string | undefined;\nclass Test {\n safeString (o, k, d = undefined): Str { return d; }\n hash (a, b, c) { return a; }\n';
    const out = emit.transpileCSharp (pre + 'f (o) { let t = this.safeString (o, \'w\'); if (t !== undefined) { const p = t.split (\'@\'); t = p[0]; } return this.hash (t, 1, 1); }\n}').content;
    if (!out.includes ('string? t = this.safeString(') || !out.includes ('t.Split(') || !out.includes ('t = ((string)(p')) problems.push (`reader seed element write: ${out.replace (/\n/g, ' | ').slice (-400)}`);
    const kept = emit.transpileCSharp (pre + 'f (o, r: string) { let t = this.safeString (o, \'w\'); const p = r.split (\'@\'); t = p[0]; return this.hash (t, 1, 1); }\n}').content;
    if (!kept.includes ('object t = ')) problems.push (`reader seed element write without a native use retyped: ${kept.replace (/\n/g, ' | ').slice (-400)}`);
    const callee = emit.transpileCSharp (pre + 'enc (t: Str): Str { return t; }\n p (t: Str, po: boolean) { let i = \'GTC\'; if (t !== undefined) { i = this.enc (t); } if (po && (i !== \'RPI\')) { i = \'POST_ONLY\'; } return i; }\n}').content;
    if (!callee.includes ('string? i = "GTC";') || !callee.includes ('(i != "RPI")')) problems.push (`literal seed written from a string? method: ${callee.replace (/\n/g, ' | ').slice (-400)}`);
    return problems;
}
