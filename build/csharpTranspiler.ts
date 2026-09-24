import Transpiler from "ast-transpiler";
import path from 'path'
import errors from "../js/src/base/errors.js"
import { basename, join, resolve } from 'path'
import { createFolderRecursively, replaceInFile, overwriteFile, checkCreateFolder } from './fsLocal.js'
import { setupCsharpPrinter } from './csharp-worker.js'
import { CORE_LIST_ARGS, CORE_LIST_TARGET_TYPES } from './csharp-local-types.js'
import { MARKET_ROW_STRING_KEYS } from './csharp-local-types.js'
// the positional core-argument type tables live in the classifier module so the pooled
// workers' parameter-type hook (build/csharp-local-types.js) reads the same proof
import { CORE_NUMERIC_ARGS, CORE_STRING_ARGS } from './csharp-local-types.js'
import { PARAMETERS_ARG_TYPED_METHODS } from './csharp-local-types.js'
import { writeOverloadStrippedFile, removeOverloadStrippedFile, restoreParamsBagInitializers } from './stripOverloads.js'
import { platform } from 'process'
import os from 'os'
import fs from 'fs'
import log from 'ololog'
import ansi from 'ansicolor'
import {Transpiler as OldTranspiler } from "./transpile.js";
import { writeFile } from 'fs/promises';
import errorHierarchy from '../js/src/base/errorHierarchy.js'
import Piscina from 'piscina';
import { isMainEntry } from "./transpile.js";
import { filterDirtyExchangeFiles, skipUpToDateStage, testStageInputs } from "./transpile.js";
import { unCamelCase } from "../js/src/base/functions.js";

ansi.nice

type dict = { [key: string]: string }

let exchanges = JSON.parse (fs.readFileSync("./exchanges.json", "utf8"));
const exchangeIds: string[] = exchanges.ids
const wsIds: string[] = exchanges.ws || []
const predictionIds: string[] = exchanges.prediction || []
const predictionWsIds: string[] = exchanges.predictionWs || []

// @ts-expect-error
const metaUrl = import.meta.url
let __dirname = new URL('.', metaUrl).pathname;

let shouldTranspileTests = true

// S10: keywords after which a `((string)…)` cast wrap is still an expression position. A
// plain (non-keyword) identifier directly before the `(` makes it a call's argument list
// instead (`Remove((string)key)`, the printer's `throw new ExchangeError ((string)arg)`).
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
    // overwriteFile() already opens+truncates+writes the file; the extra
    // fs.writeFileSync below wrote every generated file a second time
    // (~50 MB of redundant I/O per full build)
    overwriteFile (path, content);
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

// `callDynamically(x, "resolve"/"reject", ...)` whose receiver class the file itself declares —
// `Future f = ...` / `WebSocketClient c = ...`, an `x as Future|WebSocketClient` receiver, or a read
// of the ws client's `futures` map (`IDictionary<string, Future>`, cs/ccxt/ws/Client.cs) — binds the
// same method the reflective dispatch resolves, so the direct call is emitted instead. Only the
// methods those two hand-written classes declare, and only when the argument count binds the
// signature; every other receiver keeps the helper.
const WS_DECLARED_CLASSES_TYPED: dict = {
    'Future': 'Future',
    'Exchange.Future': 'Future',
    'ccxt.Exchange.Future': 'Future',
    'WebSocketClient': 'WebSocketClient',
    'Exchange.WebSocketClient': 'WebSocketClient',
    'ccxt.Exchange.WebSocketClient': 'WebSocketClient',
}
// class -> method -> rewritable argument counts, from the hand-written declarations
// (cs/ccxt/ws/Future.cs: `resolve(object data = null)`, `reject(object data)`;
// cs/ccxt/ws/Client.cs: `resolve(object content, object messageHash2)`, `reject(object content,
// object messageHash2 = null)`). An empty `new object[] {}` stays: the helper coerces it to {null}.
const WS_DECLARED_METHODS_TYPED: { [cls: string]: { [method: string]: number[] } } = {
    'Future': { 'resolve': [1, 1], 'reject': [1, 1] },
    'WebSocketClient': { 'resolve': [2, 2], 'reject': [1, 2] },
}
const CSHARP_DECLARATION_RE = /^[ \t]*([A-Za-z_][\w.]*(?:<[^=;{}]*>)?)[ \t]+(\w+)[ \t]*=[ \t]*(.+?);?[ \t]*$/gm
// a value read out of the ws client's `futures` map is a Future by the field's declared type
const CSHARP_FUTURES_READ_RE = /^(?:this\.)?(?:safeValue|getValue)\([^,]*\.futures,/

function csharpClassOfDeclaration (content: string, receiver: string, callAt: number): { cls: string, cast: boolean } | undefined {
    CSHARP_DECLARATION_RE.lastIndex = 0
    let declared: { cls: string, cast: boolean } | undefined = undefined
    let declarationCount = 0
    let match
    while ((match = CSHARP_DECLARATION_RE.exec (content)) !== null) {
        if (match[2] !== receiver) {
            continue
        }
        declarationCount += 1
        if (match.index >= callAt) {
            continue
        }
        const declaredClass = WS_DECLARED_CLASSES_TYPED[match[1]]
        if (declaredClass !== undefined) {
            declared = { cls: declaredClass, cast: false }
        } else if (CSHARP_FUTURES_READ_RE.test (match[3])) {
            declared = { cls: 'Future', cast: true }
        } else {
            declared = undefined
        }
    }
    // any `receiver = ...` beyond its own declarations is a rebind that could box another class (D2)
    const assignments = (content.match (new RegExp ('\\b' + receiver + '\\s*=(?![=>])', 'g')) || []).length
    if (assignments !== declarationCount) {
        return undefined
    }
    return declared
}

function csharpBalancedBraceEnd (content: string, openAt: number): number {
    let depth = 0
    let inString = false
    let quote = ''
    for (let i = openAt; i < content.length; i++) {
        const c = content[i]
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
        } else if (c === '{') {
            depth += 1
        } else if (c === '}') {
            depth -= 1
            if (depth === 0) {
                return i
            }
        }
    }
    return -1
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


// ===== native getArrayLength / inOp / getValue on a receiver the EMITTED text declares =====
//
// The printer's helper-to-native arms (csharpDeclaredLengthExpression / csharpNativeInExpression)
// read the print-time declared-local table, so a receiver whose C# type is produced later — a
// parameter narrowed by typeCoreArgs / retypeSignatureArgs, a local retyped by the classifier's
// post-print wrapper, a copy a later pass renamed — keeps the runtime helper. This pass reads the
// emitted signature and declarations and rewrites the call into the member the helper's own
// runtime branch performs: `Count` / `Length` for getArrayLength, `ContainsKey` / `Contains` for
// inOp, and the key-tested indexer read for getValue. Nothing is retyped here and no cast is
// added: a receiver the emitted text does not name, and a key that is not a literal or a
// non-nullable `string`, keep the helper.

// declared C# types whose `Count` counts the elements getArrayLength's IList / ICollection
// branches count (the helper answers 0 for null, which `x?.Count ?? 0` reproduces)
const CSHARP_DECLARED_COUNT_TYPES = [ 'List<', 'IList<', 'Collection<', 'Dictionary<', 'IDictionary<',
    'ConcurrentDictionary<', 'IReadOnlyDictionary<', 'SortedDictionary<', 'SortedList<', 'HashSet<',
    'ConcurrentQueue<' ];
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

// the C# type the emitted text declares for `name` at `line`: a local declared before the read,
// else a parameter of the enclosing signature. A name the region declares with two different
// types is left to the helper (the read may sit behind either binding)
function csharpHelperReceiverType (region, name: string, line: number, params: { [name: string]: string }): { type: string, kind: string, value: string } | undefined {
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

// whether the value a local holds at `line` can be null: only a freshly constructed initializer
// that nothing has reassigned is provably non-null
function csharpHelperLocalIsNonNull (region, name: string, line: number, value: string): boolean {
    if (!/^new\b/.test (value)) {
        return false;
    }
    return !region.lines.some ((maskedLine, i) => (i > region.start) && (i < line)
        && new RegExp ('^[ ]*' + name + '[ ]*=[^=]').test (maskedLine));
}

// rewrite every proven helper call on one line; offsets are taken from the mask, the emitted text
// from the original line
function csharpHelperRewriteLine (original: string, masked: string, takeType, takeKeyType): string | undefined {
    const edits = [];
    const lengthCall = /getArrayLength[ ]*\(/g;
    let match;
    while ((match = lengthCall.exec (masked)) !== null) {
        const open = match.index + match[0].length - 1;
        const close = csharpHelperCallEnd (masked, open);
        if (close === undefined) continue;
        const name = masked.substring (open + 1, close).trim ();
        if (!/^[A-Za-z_]\w*$/.test (name)) continue;
        const receiver = takeType (name);
        if (receiver === undefined) continue;
        const member = CSHARP_DECLARED_COUNT_TYPES.some ((p) => receiver.type.startsWith (p)) ? 'Count'
            : (CSHARP_DECLARED_LENGTH_TYPES.includes (receiver.type) ? 'Length' : undefined);
        if (member === undefined) continue;
        edits.push ({ start: match.index, end: close + 1, text: `(${name}?.${member} ?? 0)` });
    }
    const inCall = /(?<![A-Za-z_])inOp[ ]*\(/g;
    while ((match = inCall.exec (masked)) !== null) {
        const open = match.index + match[0].length - 1;
        const close = csharpHelperCallEnd (masked, open);
        if (close === undefined) continue;
        const firstComma = csharpHelperTopLevelComma (masked, open, close);
        if (firstComma === undefined) continue;
        const name = masked.substring (open + 1, firstComma).trim ();
        if (!/^[A-Za-z_]\w*$/.test (name)) continue;
        const secondComma = csharpHelperTopLevelComma (masked, firstComma, close);
        if (secondComma !== undefined) continue; // more than two arguments
        const keyMask = masked.substring (firstComma + 1, close).trim ();
        const receiver = takeType (name);
        if (receiver === undefined) continue;
        if (!takeKeyType (keyMask)) continue;
        const isDict = CSHARP_DECLARED_DICT_TYPES.some ((p) => receiver.type.startsWith (p));
        const isList = CSHARP_DECLARED_LIST_TYPES.includes (receiver.type);
        if (!isDict && !isList) continue;
        const keyText = original.substring (firstComma + 1, close).trim ();
        const call = `${name}.${isDict ? 'ContainsKey' : 'Contains'}(${keyText})`;
        const guarded = (receiver.type.endsWith ('?')
            || (receiver.kind === 'param' && !receiver.paramsBag)
            || (receiver.kind === 'local' && !receiver.nonNull));
        edits.push ({ start: match.index, end: close + 1, text: guarded ? `(${name} != null && ${call})` : call });
    }
    const valueCall = /(?<![A-Za-z_.])getValue[ ]*\(/g;
    while ((match = valueCall.exec (masked)) !== null) {
        const open = match.index + match[0].length - 1;
        const close = csharpHelperCallEnd (masked, open);
        if (close === undefined) continue;
        const firstComma = csharpHelperTopLevelComma (masked, open, close);
        if (firstComma === undefined) continue;
        const name = masked.substring (open + 1, firstComma).trim ();
        if (!/^[A-Za-z_]\w*$/.test (name)) continue;
        const secondComma = csharpHelperTopLevelComma (masked, firstComma, close);
        if (secondComma !== undefined) continue; // more than two arguments
        const keyMask = masked.substring (firstComma + 1, close).trim ();
        const receiver = takeType (name);
        if (receiver === undefined) continue;
        // the helper's dictionary branch hands back the boxed value; a value-typed dictionary
        // (int/Int64/double) cannot join the `: null` branch, so only object-valued dictionaries
        if (!CSHARP_DECLARED_OBJECT_DICT_TYPES.includes (receiver.type.replace (/\s+/g, ''))) continue;
        if (!takeKeyType (keyMask)) continue;
        const keyText = original.substring (firstComma + 1, close).trim ();
        edits.push ({ start: match.index, end: close + 1,
            text: `(${name} != null && ${name}.ContainsKey(${keyText}) ? ${name}[${keyText}] : null)` });
    }
    csharpHelperOperatorEdits (original, masked, takeType, edits);
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
const CSHARP_OPERATOR_INTEGER_TYPES = [ 'int', 'Int64', 'long' ];
const CSHARP_OPERATOR_NUMERIC_TYPES = [ 'int', 'Int64', 'long', 'double' ];
const CSHARP_OPERATOR_NULLABLE_INTEGER_TYPES = [ 'Int64?', 'long?', 'int?' ];
const CSHARP_OPERATOR_NULLABLE_NUMERIC_TYPES = [ 'Int64?', 'long?', 'int?', 'double?' ];
const CSHARP_OPERATOR_TOKENS = { isGreaterThan: '>', isGreaterThanOrEqual: '>=', isLessThan: '<', isLessThanOrEqual: '<=' };

// the kind of one printed operand: a string / numeric literal, null, or a name the emitted
// text declares (its declared type); undefined for every other expression
function csharpOperatorOperand (maskedArg: string, originalArg: string, takeType) {
    if (/^"[ ]*"$/.test (maskedArg) && /^"(?:[^"\\]|\\.)*"$/.test (originalArg)) {
        return { kind: 'string-literal' };
    }
    if (maskedArg === 'null') {
        return { kind: 'null' };
    }
    if (/^-?\d{1,15}$/.test (maskedArg)) {
        return { kind: 'integer-literal' };
    }
    if (/^-?\d+\.\d+$/.test (maskedArg)) {
        return { kind: 'double-literal' };
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
function csharpNativeOperatorText (helper: string, left, right, leftText: string, rightText: string): string | undefined {
    const isName = (o, types) => (o.kind === 'name') && types.includes (o.type);
    if (helper === 'isEqual') {
        // string ordinal equality, null on either side answering like isEqual's null branch
        const stringPair = (isName (left, CSHARP_OPERATOR_STRING_TYPES) && ((right.kind === 'string-literal') || isName (right, CSHARP_OPERATOR_STRING_TYPES)))
            || (isName (right, CSHARP_OPERATOR_STRING_TYPES) && (left.kind === 'string-literal'));
        const nullTest = (isName (left, CSHARP_OPERATOR_NULLABLE_TYPES) && (right.kind === 'null'))
            || (isName (right, CSHARP_OPERATOR_NULLABLE_TYPES) && (left.kind === 'null'));
        // integers compare through Convert.ToInt64 in isEqual: the same value comparison
        // (a nullable integer: null equals only null in both, the lifted `==`)
        const integer = (o) => isName (o, CSHARP_OPERATOR_INTEGER_TYPES) || isName (o, CSHARP_OPERATOR_NULLABLE_INTEGER_TYPES) || (o.kind === 'integer-literal');
        const integerPair = integer (left) && integer (right)
            && ((left.kind === 'name') || (right.kind === 'name'));
        return (stringPair || nullTest || integerPair) ? `(${leftText} == ${rightText})` : undefined;
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

// a line that may carry a call one of the rewrites above takes
const CSHARP_HELPER_LINE_RE = /getArrayLength|inOp|getValue|isEqual|isGreaterThan|isLessThan/;

// the operator helper calls of one line whose operands the emitted declarations prove
function csharpHelperOperatorEdits (original: string, masked: string, takeType, edits) {
    const helperCall = /(?<![A-Za-z0-9_.])(isEqual|isGreaterThan|isGreaterThanOrEqual|isLessThan|isLessThanOrEqual)\(/g;
    let match;
    while ((match = helperCall.exec (masked)) !== null) {
        const open = match.index + match[0].length - 1;
        const close = csharpHelperCallEnd (masked, open);
        if (close === undefined) continue;
        const comma = csharpHelperTopLevelComma (masked, open, close);
        if ((comma === undefined) || (csharpHelperTopLevelComma (masked, comma, close) !== undefined)) continue;
        if (edits.some ((e) => (e.start < close + 1) && (match.index < e.end))) continue;
        const leftText = original.substring (open + 1, comma).trim ();
        const rightText = original.substring (comma + 1, close).trim ();
        const left = csharpOperatorOperand (masked.substring (open + 1, comma).trim (), leftText, takeType);
        const right = csharpOperatorOperand (masked.substring (comma + 1, close).trim (), rightText, takeType);
        if ((left === undefined) || (right === undefined)) continue;
        const text = csharpNativeOperatorText (match[1], left, right, leftText, rightText);
        if (text !== undefined) {
            edits.push ({ start: match.index, end: close + 1, text });
        }
    }
}

// the index of the `)` closing the call whose `(` sits at `open`
function csharpHelperCallEnd (line: string, open: number): number | undefined {
    let depth = 0;
    for (let i = open; i < line.length; i++) {
        if (line[i] === '(') depth++;
        if (line[i] === ')') {
            depth--;
            if (depth === 0) return i;
        }
    }
    return undefined;
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
export function nativeDeclaredHelperCalls (content: string): string {
    if (!CSHARP_HELPER_LINE_RE.test (content)) {
        return content;
    }
    const lines = content.split ('\n');
    const masked = lines.map (csharpHelperMaskLine);
    const signatures = [];
    for (let i = 0; i < masked.length; i++) {
        if (CSHARP_HELPER_SIGNATURE_RE.test (masked[i]) && !masked[i].trimEnd ().endsWith (';')) {
            signatures.push (i);
        }
    }
    if (signatures.length === 0) {
        return content;
    }
    const regions = [];
    for (let n = 0; n < signatures.length; n++) {
        const start = signatures[n];
        const end = (n + 1 < signatures.length) ? signatures[n + 1] : lines.length;
        const params = csharpHelperSignatureParams (masked, start);
        const declarations = [];
        for (let i = start; i < end; i++) {
            const declaration = csharpHelperDeclarationOfLine (masked[i]);
            if (declaration !== undefined) {
                declarations.push ({ line: i, name: declaration.name, type: declaration.type, value: declaration.value });
            }
        }
        regions.push ({ start, end, params, declarations, lines: masked });
    }
    const regionOfLine = (line: number) => {
        let current = regions[0];
        for (const region of regions) {
            if (region.start <= line) current = region;
        }
        return current;
    };
    let changed = false;
    const out = lines.map ((line, i) => {
        if (!CSHARP_HELPER_LINE_RE.test (line)) {
            return line;
        }
        const region = regionOfLine (i);
        if ((i <= region.start) || (i >= region.end)) {
            return line;
        }
        const rewrite = (name, isKey = false) => {
            if (isKey) {
                if (!/^[A-Za-z_]\w*$/.test (name)) return false;
                const key = csharpHelperReceiverType (region, name, i, region.params);
                return (key !== undefined) && (key.type === 'string');
            }
            const receiver = csharpHelperReceiverType (region, name, i, region.params);
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
        const takeType = (name) => rewrite (name, false);
        const takeKeyType = (keyMask) => {
            if (keyMask.startsWith ('"')) return true; // a string literal is never null
            return rewrite (keyMask, true) === true;
        };
        const rewritten = csharpHelperRewriteLine (line, masked[i], takeType, takeKeyType);
        if (rewritten === undefined) {
            return line;
        }
        changed = true;
        return rewritten;
    });
    return changed ? out.join ('\n') : content;
}

export function nativeDeclaredWsCalls (content: string): string {
    const opener = 'callDynamically('
    let out = ''
    let cursor = 0
    let search = 0
    while (true) {
        const at = content.indexOf (opener, search)
        if (at < 0) {
            break
        }
        const receiverAt = at + opener.length
        // statement position only: a value-position call would have to bind the helper's object
        // result, which the void `resolve`/`reject` declarations cannot
        const lineStart = content.lastIndexOf ('\n', at - 1) + 1
        if (!/^[ \t]*$/.test (content.slice (lineStart, at))) {
            search = receiverAt
            continue
        }
        const head = /^(\w+)(?: as (WebSocketClient|Future))?\s*,\s*"(\w+)"\s*,\s*new object\[\]\s*\{/.exec (content.slice (receiverAt))
        if (!head) {
            search = receiverAt
            continue
        }
        const receiver = head[1]
        const castClass = head[2]
        const method = head[3]
        const argsAt = receiverAt + head[0].length
        const argsEnd = csharpBalancedBraceEnd (content, argsAt - 1)
        if (argsEnd < 0) {
            search = argsAt
            continue
        }
        const statementEnd = /^\s*\)\s*;/.exec (content.slice (argsEnd + 1))
        if (!statementEnd) {
            search = argsEnd
            continue
        }
        const args = content.slice (argsAt, argsEnd)
        const target = castClass !== undefined ? { cls: castClass, cast: true } : csharpClassOfDeclaration (content, receiver, at)
        const arities = (target !== undefined) ? WS_DECLARED_METHODS_TYPED[target.cls]?.[method] : undefined
        const argc = csharpArgumentCount (args)
        if (arities === undefined || argc < arities[0] || argc > arities[1]) {
            search = argsEnd
            continue
        }
        const receiverText = target!.cast ? `(${receiver} as ${target!.cls})` : receiver
        out += content.slice (cursor, at) + receiverText + '.' + method + '(' + args + ');'
        cursor = argsEnd + 1 + statementEnd[0].length
        search = cursor
    }
    return out + content.slice (cursor)
}

// `callDynamically(x, "append"|"getLimit", ...)` on a receiver whose C# declaration (the last one in
// the same member) or base field names a ws cache class binds the method that class declares
// (cs/ccxt/ws/ArrayCache.cs: `void append(object)`, `Int64? getLimit(object, object)`).
const WS_CACHE_CLASSES = /^(?:ccxt\.pro\.)?ArrayCache(?:ByTimestamp|BySymbolById|BySymbolBySide|ByOutcomeById)?\??$/
const WS_CACHE_FIELDS = [ 'this.orders', 'this.myTrades', 'this.liquidations' ]
const WS_CACHE_METHOD_ARITY: { [method: string]: number } = { 'append': 1, 'getLimit': 2 }
const CSHARP_MEMBER_START_RE = /^    (?:public|private|protected|internal)\b/

function csharpWsCacheReceiverDeclared (lines: string[], lineIndex: number, receiver: string): boolean {
    if (WS_CACHE_FIELDS.includes (receiver)) {
        return true
    }
    const declaration = new RegExp ('^\\s*([A-Za-z_][\\w.]*\\??)\\s+' + receiver + '\\s*(?:=|;)')
    for (let i = lineIndex; i >= 0; i--) {
        const m = declaration.exec (lines[i])
        if (m) {
            return WS_CACHE_CLASSES.test (m[1])
        }
        if (CSHARP_MEMBER_START_RE.test (lines[i])) {
            return false
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
            const argsEnd = csharpBalancedBraceEnd (line, argsAt - 1)
            if (argsEnd < 0 || line[argsEnd + 1] !== ')') {
                continue
            }
            const args = line.slice (argsAt, argsEnd)
            if (csharpArgumentCount (args) !== WS_CACHE_METHOD_ARITY[m[2]] || !csharpWsCacheReceiverDeclared (lines, i, m[1])) {
                continue
            }
            out += line.slice (cursor, m.index) + m[1] + '.' + m[2] + '(' + args.trim () + ')'
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

// watchOHLCVForSymbols returns `{ symbol: { timeframe: OHLCV[] } }`. That nested map is not a
// types.ts struct, so it has no generated To*/From* pair — the hand-written
// ToOHLCVDict / FromOHLCVDict in Exchange.TranspileHelpers.cs (built on ToOHLCVList /
// FromOHLCVList) carry it, keyed on this exact type string.
const OHLCV_DICT_TYPE = 'Dictionary<string, Dictionary<string, List<OHLCV>>>';

// core methods whose `Task<object>` return is rewritten to a typed `Task<T>` / `Task<List<T>>`,
// moving the `new T(item)` conversion out of the PascalCase wrapper and onto the core return path.
// only methods whose every intra-core call site is a plain `return await this.X(...);` from a core
// of the same typed shape are listed — anything feeding an untyped helper or reflective pagination
// (fetchPaginatedCall*, callDynamically) stays object, since there is no reverse From helper.
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
    // The dictionary-like container families (Balances, Tickers, MarginModes, ...) splat the
    // payload into a Dictionary<string, T>; their From* helpers write every entry back under
    // its own key, so a consuming site (`object x = await this.fetchTickers(...)` then
    // indexed / safeDict()ed) is funnelled through the reverse helper by typeCores. Every
    // consumer must sit inside a method body typeCores visits: Task<object> AND void Task
    // (loadBalanceSnapshot / loadPositionsSnapshot are void).
    // setLeverage is NOT typed: on master its wrapper is cast-only
    // (Task<Dictionary<string, object>>), so typing it to Leverage would silently drop
    // every venue-specific key from the public C# return - an API regression, not a win.
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
    // fetchDepositAddressesByNetwork is deliberately NOT typed: parseDepositAddresses()
    // is called with indexed=true by every venue that has this method, and then returns
    // a dict keyed by currency - not the DepositAddress[] the TS return annotation
    // claims. ToDepositAddressList then throws on a Dictionary.
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
    'fetchL3OrderBook': 'OrderBook',
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
    // fetchTransactionsHelper is deliberately NOT typed: dydx holds its result in an
    // object local and runs filterBy() / arrayConcat() / parseTransfers() over it
    // (ts/src/dydx.ts:1854,2071,2219), so the struct list escapes into untyped code
    // and filterBy throws InvalidCastException on List<Transaction>.
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
    // --- watch* -------------------------------------------------------------------
    // A watch core hands back the LIVE ws structure (ArrayCache*, the shared balance /
    // ticker dictionaries). Every To* helper materialises a NEW List/struct from the rows,
    // which is exactly the snapshot the deleted PascalCase wrapper produced with
    // `.Select(item => new T(item))` / `new T(res)`. Typing the core therefore keeps the
    // public C# semantics byte for byte while removing the second declaration.
    // The names below have zero consuming call sites outside the wrapper layer
    // (build/tmp_watch_analysis.py in the PR description); the ones that do have them
    // stay untyped and keep their wrapper:
    //   watchTickers        16 sites (binance, okx, kraken, gate, ... ) + Tickers is not invertible
    //   watchOHLCVForSymbols 11 sites; its wrapper conversion is Helper.ConvertToDictionaryOHLCVList
    //   watchMarkPrices      3 sites (okx, binance, aster) + Tickers is not invertible
    //   watchFundingRates    1 site  (okx) + FundingRates is not invertible
    // and the venue-internal plumbing (watchPublic/watchPrivate/watchTopics/...) whose
    // wrapper is cast-only, so typing it would drop venue keys.
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












// the prediction tier (PredictionExchange : BaseExchange) is a sibling hierarchy with its own
// structures, so the same method name is typed differently there — no invariance conflict
// struct families that have a reverse `FromX` / `FromXList` helper in
// cs/ccxt/base/Exchange.TypedCores.cs, i.e. that can be handed back to the untyped
// object pipeline. Produced by `python3 build/generateTypedCoreHelpers.py --capabilities`.
// The dictionary-like containers (Tickers, Balances, OrderBook, ...) are included since the
// generator learned to invert their splat constructors: the loop copies every non-"info"
// key verbatim, so writing each entry back under its own key restores the source dict.
// OHLCV's ctor is positional so the generator cannot invert it; FromOHLCVList is hand-written
// in Exchange.TranspileHelpers.cs, which is why the family is still listed here.
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

// Per-venue typed cores: one method name can legitimately carry different shapes on
// different classes (dydx fetchTransactionsHelper is a raw row list feeding filterBy, alpaca's
// is a parsed Transaction[]). The table is consulted BEFORE the name-keyed tables, keyed by
// the ts/src file id the core is declared in; derived venues (bequant : hitbtc) resolve
// through their parent. An empty string opts a venue out of a name-keyed entry.
const VENUE_TYPED_CORES: Record<string, Record<string, string>> = {
    'alpaca': { 'fetchTransactionsHelper': 'List<Transaction>' },
    'bydfi': { 'fetchTransactionsHelper': 'List<Transaction>' },
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

// Sync cores retyped from `object` to a concrete C# type. Unlike TYPED_CORES (async
// Task<object> -> Task<T>, where a To*/From* helper pair moves a boxed struct across the
// boundary), these are plain sync methods whose runtime value ALREADY is the named type:
// this.markets / this.currencies / this.markets_by_id / this.currencies_by_id hold plain
// Dictionary<string, object> rows (setMarkets builds each row with deepExtend and toArray
// de-types the typed fetchMarkets list before the merge), so naming the type moves no box.
// The row BUILDERS (parseMarket / parseCurrency / createExpiredOptionMarket) return the
// same family of rows: a census of all 119 declarations found every return path ending in
// safeMarketStructure / safeCurrencyStructure, this.extend / deepExtend, a fresh
// Dictionary literal, or a peer builder that resolves to one of those (poloniex's
// parseMarket forwards to parseSpot/SwapMarket, both ending in safeMarketStructure), so
// the ToDict funnel below is identity for them too.
// Every declaration (the BaseExchange original and every venue override — C# overrides are
// invariant) is rewritten, and each return expression is funnelled through ToDict (`as`
// cast: identity for these rows, null for null) unless it already hands the dictionary back
// unchanged. Registered in build/csharp-local-types.js so `object x = this.market(symbol)`
// locals can be typed downstream.
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



// Generated C# core parameters that name a DICTIONARY ROW (`parse*(object row, …)` first params and
// `object currency` params). Positional keying like CORE_STRING_ARGS, but NO call-site wrap: every
// caller in cs/** (generated trees, tests, cli, examples) already passes a Dictionary<string, object>
// or null -- campaigns/cs-strict/tools/S38/row_arg_census.py proves 20 (name,position) pairs over 161
// sites. A name whose callers pass `getValue(list, i)` or an `object` local is deliberately absent:
// the ((Dictionary<string, object>)…) wrap it would need is a new cast, i.e. an unproven assertion.
const CORE_DICT_ARGS: Record<string, number[]> = {
    'assignDefaultDepositWithdrawFees': [ 1 ],
    'convertDerivativesId': [ 0 ],
    'createTransferSettlementData': [ 1 ],
    'createWithdrawalSettlementData': [ 2 ],
    'getDedicatedNetworkId': [ 0 ],
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

// Same family, but at least one caller holds the value in an `IDictionary<string, object>` local
// (`CSHARP_LOCAL_ANNOTATION_TYPES`' spelling for a row). Naming the parameter Dictionary there would
// assert a runtime type the caller's static type does not prove, so the interface is the narrowest
// safe name; Dictionary callers convert implicitly. Same no-wrap gate as CORE_DICT_ARGS.
const CORE_IDICT_ARGS: Record<string, number[]> = {
    'internalFetchTransfers': [ 1 ],
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
};


// Collection-returning helpers whose every return site yields a list (or null) at runtime but
// whose generated declaration still said `object`. Every site was checked mechanically (a
// return-site census over cs/ccxt/*.cs and cs/ccxt/exchanges/*.cs): `new List<object>()`, a
// `List<object>` local, `null`, a call to another name in this list, or one of the three shapes
// typeCollectionReturns() normalizes:
//   return <own object param>;         -> return this.toArray(<param>);
//   return this.arraySlice(...);       -> return this.toArray(this.arraySlice(...));
//   return ((object)this.<name>(...)); -> return this.<name>(...);
// Deliberately absent: filterByArray / filterOutByArray / filterByArray* / filterBySymbols*
// (they hand back a DICTIONARY when `indexed` is true - argument-dependent, so not a list
// type), parseTickers / parsePositions / parseFundingRates / parseOpenInterests (funelled
// through filterByArray), parseFundingHistory (returns a Dictionary), parseWsTrade /
// parseWsTrades (46 ws-file overrides - a full ws regeneration is out of scope here) and
// arraySlice (byte[] callers receive byte[] / List<byte> back, so it keeps its object
// signature; its list returns are funnelled through toArray at the call sites above).
// parseOHLCV: 81 declarations (the BaseExchange virtual + 80 overrides), 80 of them a single
// `return [ … ];` row literal (a return-site census over cs/ccxt/exchanges/{,prediction/}*.cs);
// the base is the `<own object param>` shape and normalises to toArray (identity for the row
// the callers pass, null for null).
const COLLECTION_RETURN_METHODS: string[] = [
    'filterByKey', 'filterBySymbol', 'filterByLimit', 'filterBySinceLimit',
    'filterByValueSinceLimit', 'filterBySymbolSinceLimit', 'filterByCurrencySinceLimit',
    'filterBySymbolsSinceLimit', 'filterByOutcomeSinceLimit',
    'parseTrades', 'parseTradesHelper', 'parseOrders', 'parseOHLCV', 'parseOHLCVs', 'parseTransactions',
    'parseLedger', 'parseLiquidations', 'marketIds', 'currencyIds', 'marketCodes',
    'marketSymbols', 'marketsForSymbols', 'parseMarkets',
];

// Same idea for the one collection helper that hands back a keyed dictionary: parseCurrencies
// accumulates `Dictionary<string, object> result` (keyed by currency code) and returns it —
// both the base implementation and the bitstamp override. No return-site normalizations are
// needed (every return is that dict local); only the declaration changes.
const COLLECTION_RETURN_DICT_METHODS: string[] = [
    'parseCurrencies',
];

// Generated venue-helper `object` parameters narrowed to `string?` (see the pass below).
// Keyed by venue (`<id>`, `pro:<id>`, `prediction:<id>`, or the generated base class) and then
// by method name -> positions, because one helper name can legitimately be a different method
// in every venue class.  Produced by campaigns/cs-strict/tools/S45/admit_groups.py; admitted
// only when every call site of the name at that position in the subtree of the declaring class
// passes a `string`/`string?` argument, every declaration of the name at that position in the
// override chain is still `object`, and every use of the parameter inside the bodies is an
// identity under `string?` (see the pass for the shadow rule).
const VENUE_STRING_ARGS: Record<string, Record<string, number[]>> = {
    'BaseExchange': { 'CancelAllContractOrders': [ 0 ], 'CancelAllSpotOrders': [ 0 ], 'FetchFundingHistory': [ 0 ], 'FetchMyLiquidations': [ 0 ], 'borrowIsolatedMargin': [ 0 ], 'calculateFee': [ 0, 1, 2 ], 'repayIsolatedMargin': [ 0 ], 'repayMargin': [ 2 ], 'unWatchFundingRate': [ 0 ], 'unWatchMarkPrice': [ 0 ], 'unWatchMyTrades': [ 0 ], 'unWatchOrders': [ 0 ], 'unWatchTrades': [ 0 ] },
    'alpaca': { 'FetchTransactionsHelper': [ 0, 1 ], 'parseOrderStatus': [ 0 ], 'parseTimeInForce': [ 0 ], 'parseTransactionStatus': [ 0 ], 'parseTransactionType': [ 0 ] },
    'apex': { 'FetchFundingHistory': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseOrderType': [ 0 ], 'parseTimeInForce': [ 0 ] },
    'aster': { 'FetchFundingHistory': [ 0 ], 'createOrderRequest': [ 0 ], 'isInverse': [ 0 ], 'modifyMarginHelper': [ 0 ], 'parseLedgerEntryType': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseOrderType': [ 0 ], 'parseTransferStatus': [ 0 ] },
    'backpack': { 'FetchFundingHistory': [ 0 ], 'createOrderRequest': [ 0 ], 'parseMarketType': [ 0 ], 'parseOrderSide': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseTransactionStatus': [ 0 ] },
    'bigone': { 'parseOrderStatus': [ 0 ], 'parseTransactionStatus': [ 0 ], 'parseTransferStatus': [ 0 ], 'parseType': [ 0 ] },
    'binance': { 'FetchFundingHistory': [ 0 ], 'FetchMyDustTrades': [ 0 ], 'FetchMyLiquidations': [ 0 ], 'FetchMySettlementHistory': [ 0 ], 'FetchSettlementHistory': [ 0 ], 'borrowIsolatedMargin': [ 0 ], 'editContractOrderRequest': [ 0 ], 'editSpotOrderRequest': [ 0 ], 'modifyMarginHelper': [ 0 ], 'parseLedgerEntryType': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseOrderTypeByMarket': [ 0 ], 'parseTransactionStatusByType': [ 0 ], 'parseTransferStatus': [ 0 ], 'repayIsolatedMargin': [ 0 ], 'verifyGiftCode': [ 0 ] },
    'bingx': { 'FetchFundingHistory': [ 0 ], 'FetchMyLiquidations': [ 0 ], 'createOrderRequest': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseOrderType': [ 0 ], 'parseTransactionStatus': [ 0 ], 'parseTransferStatus': [ 0 ] },
    'bit2c': { 'isFiat': [ 0 ] },
    'bitbank': { 'parseOrderStatus': [ 0 ] },
    'bitbns': { 'parseTransactionStatusByType': [ 0, 1 ] },
    'bitfinex': { 'createOrderRequest': [ 0 ], 'isFiat': [ 0 ], 'parseLedgerEntryType': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseTimeInForce': [ 0 ], 'parseTransactionStatus': [ 0 ], 'parseTransferStatus': [ 0 ] },
    'bitflyer': { 'parseDepositStatus': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseWithdrawalStatus': [ 0 ] },
    'bitget': { 'FetchFundingHistory': [ 0 ], 'FetchMyLiquidations': [ 0 ], 'FetchUtaCanceledAndClosedOrders': [ 0 ], 'borrowIsolatedMargin': [ 0 ], 'modifyMarginHelper': [ 0, 2 ], 'parseLedgerType': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseTransactionStatus': [ 0 ], 'parseTransactionType': [ 0 ], 'parseTransferStatus': [ 0 ], 'repayIsolatedMargin': [ 0 ] },
    'bithumb': { 'createOrderRequest': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseTransactionStatusByType': [ 0, 1 ] },
    'bitopro': { 'parseOrderStatus': [ 0 ], 'parseTransactionStatus': [ 0 ] },
    'bitrue': { 'parseOrderStatus': [ 0 ], 'parseTransactionStatusByType': [ 0, 1 ] },
    'bitso': { 'parseLedgerEntryType': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseTransactionStatus': [ 0 ] },
    'bitstamp': { 'getCurrencyName': [ 0 ], 'parseLedgerEntryType': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseTransactionStatus': [ 0 ], 'parseTransferStatus': [ 0 ] },
    'bitteam': { 'parseOrderStatus': [ 0 ], 'parseOrderType': [ 0 ], 'parseTransactionType': [ 0 ] },
    'bittrade': { 'FetchOpenOrdersV1': [ 0 ], 'FetchOpenOrdersV2': [ 0 ], 'FetchTradingLimitsById': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseTradingLimits': [ 1 ], 'parseTransactionStatus': [ 0 ] },
    'bitvavo': { 'cancelOrderRequest': [ 0 ], 'createOrderRequest': [ 0 ], 'editOrderRequest': [ 0 ], 'fetchOHLCVRequest': [ 0 ], 'parseLedgerEntryType': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseTransactionStatus': [ 0 ], 'parseTransferStatus': [ 0 ] },
    'blofin': { 'createOrderRequest': [ 0 ], 'createTpslOrderRequest': [ 0 ], 'parseLedgerEntryType': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseTransactionDepositStatus': [ 0 ], 'parseTransactionWithdrawalStatus': [ 0 ] },
    'btcbox': { 'FetchOrdersByType': [ 0, 1 ], 'parseOrderStatus': [ 0 ] },
    'btcmarkets': { 'calculateFee': [ 0, 1, 2 ], 'parseOrderStatus': [ 0 ], 'parseTransactionStatus': [ 0 ], 'parseTransactionType': [ 0 ] },
    'btcturk': { 'parseOrderStatus': [ 0 ] },
    'btse': { 'CreateContractOrder': [ 0 ], 'CreateSpotOrder': [ 0 ], 'parseLedgerEntryDirection': [ 0 ], 'parseLedgerEntryType': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseOrderType': [ 0 ], 'parsePositionSide': [ 0 ], 'parseTimeInForce': [ 0 ], 'parseTransactionStatus': [ 0 ], 'parseTransactionType': [ 0 ] },
    'bullish': { 'parseMarketType': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseOrderType': [ 0 ], 'parsePositionSide': [ 0 ], 'parseTransactionStatus': [ 0 ], 'parseTransactionType': [ 0 ] },
    'bybit': { 'FetchDerivativesOpenInterestHistory': [ 0 ], 'FetchFundingHistory': [ 0 ], 'FetchMyLiquidations': [ 0 ], 'FetchMySettlementHistory': [ 0 ], 'FetchOrderClassic': [ 0 ], 'FetchSettlementHistory': [ 0 ], 'cancelOrderRequest': [ 0 ], 'createOrderRequest': [ 0 ], 'editOrderRequest': [ 0 ], 'parseLedgerEntryType': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseTimeInForce': [ 0 ], 'parseTransactionStatus': [ 0 ], 'parseTransferStatus': [ 0 ] },
    'bydfi': { 'FetchTransactionsHelper': [ 0, 1 ], 'createEditOrderRequest': [ 0, 2, 3 ], 'createOrderRequest': [ 0 ], 'paraseTransferStatus': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseOrderTimeInForce': [ 0 ], 'parseOrderType': [ 0 ], 'parsePositionSide': [ 0 ], 'parseTradeType': [ 0 ], 'parseTransactionStatus': [ 0 ] },
    'cex': { 'FetchOrdersByStatus': [ 0, 1 ], 'parseLedgerEntryType': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseTransactionStatus': [ 0 ] },
    'coinbase': { 'FetchDepositMethodId': [ 0 ], 'FetchOrdersByStatus': [ 0, 1 ], 'deposit': [ 2 ], 'findAccountId': [ 0 ], 'parseLedgerEntryStatus': [ 0 ], 'parseLedgerEntryType': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseOrderType': [ 0 ], 'parseTimeInForce': [ 0 ], 'parseTransactionStatus': [ 0 ] },
    'coinbaseexchange': { 'parseLedgerEntryType': [ 0 ], 'parseOrderStatus': [ 0 ] },
    'coinbaseinternational': { 'FetchFundingHistory': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseOrderType': [ 0 ], 'parseTransactionStatus': [ 0 ], 'parseTransferStatus': [ 0 ] },
    'coincheck': { 'parseTransactionStatus': [ 0 ] },
    'coinex': { 'FetchFundingHistory': [ 0 ], 'FetchOrdersByStatus': [ 0, 1 ], 'borrowIsolatedMargin': [ 0 ], 'modifyMarginHelper': [ 0, 2 ], 'parseOrderStatus': [ 0 ], 'parseTransactionStatus': [ 0 ], 'parseTransferStatus': [ 0 ], 'repayIsolatedMargin': [ 0 ] },
    'coinmate': { 'parseOrderStatus': [ 0 ], 'parseOrderType': [ 0 ], 'parseTransactionStatus': [ 0 ] },
    'coinsph': { 'encodeOrderSide': [ 0 ], 'parseOrderSide': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseOrderTimeInForce': [ 0 ], 'parseOrderType': [ 0 ], 'parseTransactionStatus': [ 0 ] },
    'cryptocom': { 'FetchSettlementHistory': [ 0 ], 'createAdvancedOrderRequest': [ 0 ], 'createOrderRequest': [ 0 ], 'editOrderRequest': [ 0 ], 'parseDepositStatus': [ 0 ], 'parseLedgerEntryType': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseTimeInForce': [ 0 ], 'parseWithdrawalStatus': [ 0 ] },
    'cryptomus': { 'parseOrderStatus': [ 0 ] },
    'deepcoin': { 'createOrderRequest': [ 0 ], 'parseLedgerEntryType': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseOrderTimeInForce': [ 0 ], 'parseOrderType': [ 0 ], 'parseTransactionStatus': [ 0 ], 'parseTransferStatus': [ 0 ] },
    'delta': { 'FetchOrdersWithMethod': [ 1 ], 'FetchSettlementHistory': [ 0 ], 'modifyMarginHelper': [ 0, 2 ], 'parseOrderStatus': [ 0 ] },
    'deribit': { 'FetchMyLiquidations': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseOrderType': [ 0 ], 'parseTimeInForce': [ 0 ], 'parseTransactionStatus': [ 0 ], 'parseTransferStatus': [ 0 ] },
    'derive': { 'FetchFundingHistory': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseTimeInForce': [ 0 ], 'parseTransactionStatus': [ 0 ] },
    'digifinex': { 'FetchFundingHistory': [ 0 ], 'FetchTransactionsByType': [ 0 ], 'modifyMarginHelper': [ 0 ], 'parseLedgerEntryType': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseTransactionStatus': [ 0 ], 'parseTransferStatus': [ 0 ] },
    'dydx': { 'FetchTransactionsHelper': [ 0 ], 'createOrderRequest': [ 0 ], 'parseLedgerEntryType': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseOrderType': [ 0 ] },
    'extended': { 'CreateExtendedOrderRequest': [ 0 ], 'FetchFundingHistory': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseTransactionStatus': [ 0 ], 'parseTransactionType': [ 0 ] },
    'foxbit': { 'FetchOrdersByStatus': [ 0, 1 ], 'parseLedgerEntryType': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseTransactionStatus': [ 0 ] },
    'gate': { 'FetchFundingHistory': [ 0 ], 'FetchMyLiquidations': [ 0 ], 'FetchMySettlementHistory': [ 0 ], 'FetchOrdersByStatus': [ 0 ], 'FetchSettlementHistory': [ 0 ], 'borrowIsolatedMargin': [ 0 ], 'editOrderRequest': [ 0 ], 'fetchOrderRequest': [ 0 ], 'getSettlementCurrencies': [ 0 ], 'modifyMarginHelper': [ 0 ], 'parseLedgerEntryType': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseTransactionStatus': [ 0 ], 'prepareOrdersByStatusRequest': [ 0 ], 'repayIsolatedMargin': [ 0 ] },
    'gemini': { 'parseMarketActive': [ 0 ], 'parseTransactionStatus': [ 0 ] },
    'grvt': { 'FetchFundingHistory': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseTimeInForce': [ 0 ] },
    'hashkey': { 'CreateSpotOrder': [ 0 ], 'CreateSwapOrder': [ 0 ], 'FetchOpenSpotOrders': [ 0 ], 'FetchOpenSwapOrders': [ 0 ], 'createOrderRequest': [ 0 ], 'modifyMarginHelper': [ 0 ], 'parseAccountType': [ 0 ], 'parseLedgerEntryType': [ 0 ], 'parseOrderStatus': [ 0 ] },
    'hibachi': { 'FetchMySettlementHistory': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseTransactionStatus': [ 0 ] },
    'hitbtc': { 'FetchTransactionsHelper': [ 0, 1 ], 'modifyMarginHelper': [ 0, 2 ], 'parseOrderStatus': [ 0 ], 'parseTransactionStatus': [ 0 ], 'parseTransactionType': [ 0 ] },
    'hollaex': { 'parseOrderStatus': [ 0 ] },
    'htx': { 'FetchClosedContractOrders': [ 0 ], 'FetchClosedSpotOrders': [ 0 ], 'FetchFundingHistory': [ 0 ], 'FetchSettlementHistory': [ 0 ], 'FetchSpotOrders': [ 0 ], 'FetchTradingLimitsById': [ 0 ], 'borrowIsolatedMargin': [ 0 ], 'parseLedgerEntryType': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseTradingLimits': [ 1 ], 'parseTransactionStatus': [ 0 ], 'repayIsolatedMargin': [ 0 ] },
    'hyperliquid': { 'FetchFundingHistory': [ 0 ], 'createOrderRequest': [ 0, 3 ], 'modifyMarginHelper': [ 0, 2 ], 'parseLedgerEntryType': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseOrderType': [ 0 ] },
    'independentreserve': { 'parseOrderStatus': [ 0 ], 'parseTimeInForce': [ 0 ] },
    'indodax': { 'parseOrderStatus': [ 0 ], 'parseTransactionStatus': [ 0 ] },
    'kraken': { 'orderRequest': [ 0 ], 'parseAccountType': [ 0 ], 'parseLedgerEntryType': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseTransactionStatus': [ 0 ], 'parseTransactionsByType': [ 0 ] },
    'krakenfutures': { 'FetchFundingHistory': [ 0 ], 'createOrderRequest': [ 0 ], 'parseLedgerEntryType': [ 0 ] },
    'kucoin': { 'CancelAllContractOrders': [ 0 ], 'CancelAllSpotOrders': [ 0 ], 'CancelAllUtaOrders': [ 0 ], 'CreateContractOrder': [ 0 ], 'CreateSpotOrder': [ 0 ], 'CreateUtaOrder': [ 0 ], 'FetchContractOrder': [ 0 ], 'FetchContractOrdersByStatus': [ 0 ], 'FetchFundingHistory': [ 0 ], 'FetchMyContractTrades': [ 0 ], 'FetchMySpotTrades': [ 0 ], 'FetchMyUtaTrades': [ 0 ], 'FetchOrdersByStatus': [ 0 ], 'FetchSpotOrder': [ 0 ], 'FetchSpotOrdersByStatus': [ 0 ], 'FetchUtaOrder': [ 0 ], 'FetchUtaOrdersByStatus': [ 0 ], 'borrowIsolatedMargin': [ 0 ], 'parseLedgerEntryType': [ 0 ], 'parseLedgerStatus': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseOrderTimeInForce': [ 0 ], 'parseTransactionStatus': [ 0 ], 'parseTransferStatus': [ 0 ], 'repayIsolatedMargin': [ 0 ] },
    'latoken': { 'FetchPrivateTradingFee': [ 0 ], 'FetchPublicTradingFee': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseOrderType': [ 0 ], 'parseTimeInForce': [ 0 ], 'parseTransactionStatus': [ 0 ], 'parseTransactionType': [ 0 ], 'parseTransferStatus': [ 0 ] },
    'lbank': { 'FetchOrderDefault': [ 0 ], 'FetchOrderSupplement': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseTransactionStatus': [ 0 ] },
    'lighter': { 'parseOrderStatus': [ 0 ], 'parseTransactionStatus': [ 0 ], 'signAndCancelAllOrders': [ 1 ], 'signAndCancelOrder': [ 1 ], 'signAndCreateOrder': [ 1 ] },
    'luno': { 'parseOrderStatus': [ 0 ] },
    'mercado': { 'parseOrderStatus': [ 0 ] },
    'mexc': { 'FetchFundingHistory': [ 0 ], 'modifyMarginHelper': [ 0, 2 ], 'parseOrderSide': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseOrderTimeInForce': [ 0 ], 'parseOrderType': [ 0 ], 'parseTransactionStatusByType': [ 0, 1 ], 'parseTransferStatus': [ 0 ] },
    'modetrade': { 'FetchFundingHistory': [ 0 ], 'createOrderRequest': [ 0 ], 'parseLedgerEntryType': [ 0 ], 'parseOrderType': [ 0 ], 'parseTimeInForce': [ 0 ], 'parseTransactionStatus': [ 0 ] },
    'mudrex': { 'parseOrderStatus': [ 0 ] },
    'nado': { 'CancelAllOrdersRequest': [ 0 ], 'CreateOrderRequest': [ 0 ], 'EditOrderRequest': [ 0 ], 'FetchFundingHistory': [ 0 ], 'parseOrderTimeInForce': [ 0 ] },
    'ndax': { 'parseLedgerEntryType': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseTransactionStatusByType': [ 0 ] },
    'okx': { 'FetchFundingHistory': [ 0 ], 'FetchSettlementHistory': [ 0 ], 'createOrderRequest': [ 0 ], 'editOrderRequest': [ 0 ], 'modifyMarginHelper': [ 0, 2 ], 'parseLedgerEntryType': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseTransactionStatus': [ 0 ], 'parseTransferStatus': [ 0 ] },
    'onetrading': { 'parseOrderStatus': [ 0 ], 'parseTimeInForce': [ 0 ] },
    'pacifica': { 'FetchFundingHistory': [ 0 ], 'cancelAllOrdersRequest': [ 0 ], 'createOrderRequest': [ 0 ], 'editOrderRequest': [ 0 ], 'parseLedgerEntryType': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseOrderType': [ 0 ] },
    'paradex': { 'FetchFundingHistory': [ 0 ], 'FetchMyLiquidations': [ 0 ], 'createOrderRequest': [ 0 ], 'parseOrderType': [ 0 ], 'parseTimeInForce': [ 0 ], 'parseTransactionStatus': [ 0 ] },
    'paymium': { 'parseTransferStatus': [ 0 ] },
    'phemex': { 'FetchFundingHistory': [ 0 ], 'parseMarginStatus': [ 0 ], 'parseOrderSide': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseOrderType': [ 0 ], 'parseTimeInForce': [ 0 ], 'parseTransactionStatus': [ 0 ], 'parseTransferStatus': [ 0 ] },
    'poloniex': { 'FetchTransactionsHelper': [ 0 ], 'modifyMarginHelper': [ 0, 2 ], 'orderRequest': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseOrderType': [ 0 ] },
    'prediction:binance': { 'parseOrderStatus': [ 0 ] },
    'prediction:hyperliquid': { 'parseOrderStatus': [ 0 ], 'parseOrderType': [ 0 ], 'parseTimeInForce': [ 0 ] },
    'prediction:kalshi': { 'calculateFee': [ 0, 1, 2 ], 'parseOrderStatus': [ 0 ] },
    'prediction:limitless': { 'parseOrderSide': [ 0 ], 'parseOrderTimeInForce': [ 0 ] },
    'prediction:myriad': { 'FetchRawMarketById': [ 0 ], 'FetchRawQuestionById': [ 0 ], 'parseOrderStatus': [ 0 ] },
    'prediction:opinion': { 'parseOrderStatus': [ 0 ] },
    'prediction:polymarket': { 'parseOrderStatus': [ 0 ], 'polymarketOrderRawAmounts': [ 0 ] },
    'pro:alpaca': { 'authenticate': [ 0 ] },
    'pro:apex': { 'authenticate': [ 0 ] },
    'pro:aster': { 'unWatchMarkPrice': [ 0 ], 'unWatchTrades': [ 0 ] },
    'pro:backpack': { 'parseWsOrderSide': [ 0 ], 'parseWsOrderStatus': [ 0 ], 'unWatchOrders': [ 0 ], 'unWatchTrades': [ 0 ] },
    'pro:binance': { 'ensureUserDataStreamWsSubscribeSignature': [ 0 ], 'unWatchMarkPrice': [ 0 ], 'unWatchTrades': [ 0 ] },
    'pro:bingx': { 'getOrderBookLimitByMarketType': [ 0 ], 'unWatchTrades': [ 0 ] },
    'pro:bitfinex': { 'parseWsOrderStatus': [ 0 ], 'subscribe': [ 1 ], 'unWatchTrades': [ 0 ] },
    'pro:bitget': { 'parseWsOrderStatus': [ 0 ], 'unWatchTrades': [ 0 ] },
    'pro:bitopro': { 'watchPublic': [ 1 ] },
    'pro:bitrue': { 'parseWsOrderStatus': [ 0 ], 'parseWsOrderType': [ 0 ] },
    'pro:bitstamp': { 'unWatchMyTrades': [ 0 ], 'unWatchOrders': [ 0 ], 'unWatchTrades': [ 0 ] },
    'pro:bitvavo': { 'unWatchTrades': [ 0 ] },
    'pro:blockchaincom': { 'parseWsOrderStatus': [ 0 ] },
    'pro:bybit': { 'unWatchMyTrades': [ 0 ], 'unWatchOrders': [ 0 ], 'unWatchTrades': [ 0 ] },
    'pro:coinbase': { 'unWatchOrders': [ 0 ], 'unWatchTrades': [ 0 ] },
    'pro:coinbaseexchange': { 'parseWsOrderStatus': [ 0 ] },
    'pro:coinex': { 'parseWsOrderStatus': [ 0 ] },
    'pro:cryptocom': { 'unWatchTrades': [ 0 ] },
    'pro:deepcoin': { 'parsePositionSide': [ 0 ], 'parseWsOrderStatus': [ 0 ], 'unWatchTrades': [ 0 ] },
    'pro:derive': { 'unWatchTrades': [ 0 ] },
    'pro:dydx': { 'unWatchTrades': [ 0 ] },
    'pro:gate': { 'unWatchTrades': [ 0 ] },
    'pro:gemini': { 'parseWsOrderStatus': [ 0 ], 'parseWsOrderType': [ 0 ] },
    'pro:htx': { 'unWatchTrades': [ 0 ] },
    'pro:hyperliquid': { 'unWatchMyTrades': [ 0 ], 'unWatchOrders': [ 0 ], 'unWatchTrades': [ 0 ] },
    'pro:kraken': { 'orderRequestWs': [ 1 ], 'watchPrivate': [ 0, 1 ] },
    'pro:krakenfutures': { 'subscribePublic': [ 1 ] },
    'pro:kucoin': { 'parseWsOrderStatus': [ 0 ], 'unWatchFundingRate': [ 0 ], 'unWatchMarkPrice': [ 0 ], 'unWatchTrades': [ 0 ] },
    'pro:lbank': { 'parseWsOrderStatus': [ 0 ] },
    'pro:lighter': { 'unWatchMarkPrice': [ 0 ], 'unWatchMyTrades': [ 0 ], 'unWatchOrders': [ 0 ], 'unWatchTrades': [ 0 ] },
    'pro:mexc': { 'parseWsOrderStatus': [ 0 ], 'parseWsOrderType': [ 0 ], 'unWatchFundingRate': [ 0 ], 'unWatchTrades': [ 0 ] },
    'pro:nado': { 'unWatchMyTrades': [ 0 ], 'unWatchOrders': [ 0 ], 'unWatchTrades': [ 0 ], 'watchPrivate': [ 0 ] },
    'pro:okx': { 'unWatchTrades': [ 0 ] },
    'pro:onetrading': { 'parseTradingOrderStatus': [ 0 ], 'parseWsOrderStatus': [ 0 ] },
    'pro:pacifica': { 'unWatchMyTrades': [ 0 ], 'unWatchOrders': [ 0 ], 'unWatchTrades': [ 0 ] },
    'pro:poloniex': { 'parseStatus': [ 0 ] },
    'pro:upbit': { 'parseWsOrderStatus': [ 0 ] },
    'pro:weex': { 'unWatchMyTrades': [ 0 ], 'unWatchOrders': [ 0 ], 'unWatchTrades': [ 0 ] },
    'pro:whitebit': { 'parseWsOrderType': [ 0 ] },
    'pro:woo': { 'unWatchTrades': [ 0 ] },
    'pro:xt': { 'subscribe': [ 1, 2 ], 'unSubscribe': [ 2, 3 ], 'unWatchFundingRate': [ 0 ], 'unWatchTrades': [ 0 ] },
    'revolutx': { 'parseOrderStatus': [ 0 ] },
    'tokocrypto': { 'parseOrderStatus': [ 0 ], 'parseOrderType': [ 0 ], 'parseTransactionStatusByType': [ 0 ] },
    'toobit': { 'FetchDepositsOrWithdrawalsHelper': [ 0, 1 ], 'createContractOrderRequest': [ 0 ], 'createOrderRequest': [ 0 ], 'parseLedgerType': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseOrderType': [ 0 ], 'parseTransactionStatus': [ 0 ] },
    'upbit': { 'calcOrderPrice': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseTransactionStatus': [ 0 ] },
    'weex': { 'CreateContractOrder': [ 0 ], 'CreateSpotOrder': [ 0 ], 'FetchFundingHistory': [ 0 ], 'modifyMarginHelper': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseOrderType': [ 0 ], 'parseTransferStatus': [ 0 ] },
    'whitebit': { 'FetchFundingHistory': [ 0 ], 'isFiat': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseOrderType': [ 0 ], 'parseTransactionStatus': [ 0 ] },
    'woo': { 'FetchFundingHistory': [ 0 ], 'defaultNetworkCodeForCurrency': [ 0 ], 'modifyMarginHelper': [ 0, 2 ], 'parseLedgerEntryType': [ 0 ], 'parseTimeInForce': [ 0 ], 'parseTransactionStatus': [ 0 ], 'repayMargin': [ 2 ] },
    'woofipro': { 'FetchFundingHistory': [ 0 ], 'createOrderRequest': [ 0 ], 'modifyMarginHelper': [ 0, 2 ], 'parseLedgerEntryType': [ 0 ], 'parseOrderType': [ 0 ], 'parseTimeInForce': [ 0 ], 'parseTransactionStatus': [ 0 ] },
    'xt': { 'FetchFundingHistory': [ 0 ], 'FetchOrdersByStatus': [ 0, 1 ], 'modifyMarginHelper': [ 0, 2 ], 'parseLedgerEntryType': [ 0 ], 'parseOrderStatus': [ 0 ], 'parseTransactionStatus': [ 0 ] },
    'zebpay': { 'orderRequest': [ 0 ] },
};

// U53: `object since/limit/until/amount/price` parameters on generated NON-core helpers (venue
// request builders, parse*/filter* helper families, the prediction precision helpers) narrowed to
// the box every caller already passes.  Keyed by method name -> position: C# overrides are
// invariant on parameter types, so every declaration of the name at that position in the whole
// generated tree is rewritten by the same pass, and the parameter NAME at that position must be
// one of VENUE_NUMERIC_ARG_NAMES (a same-name helper that spells the position differently -- e.g.
// prediction hyperliquid's `calculatePricePrecision(object midPx)` -- is a different method and is
// left alone).  Produced by campaigns/cs90/tools/U53/{census-num-params,census2,final_table}.py,
// which admit a position only when
//   * every call site of the name at that position in cs/ + examples/cs passes an argument whose
//     STATIC type is exactly Int64/Int64? (for an Int64? target) or double/double? (double?) or
//     `null` -- no literal, no int, no object: any conversion at the call site would change the
//     boxed type the parameter holds (an int literal boxes Int32 where Int64? boxes Int64);
//   * every declaration of the name at that position is `object <numeric-name>` and generated;
//   * every use of the parameter inside the body is an identity under the narrowed type: an
//     argument at a callee position whose every declaration is `object`, a cast to the target
//     type or to `object`, an initializer element, a `Dictionary<string, object>` indexer write,
//     an indexer key, or a `return` of an object-returning method -- and `arg_ok` requires NO
//     numeric overload at that callee position (multiply/divide/mod/sum have Int64? twins whose
//     binding would move);
//   * no `this.<name>` method-group reference (`spawn(...)`, DynamicInvoker) anywhere.
// A body that assigns to the parameter keeps the `object <name>Var = <name>;` shadow
// `typeCoreArgs` inserts and its uses are renamed, so nothing inside such a body moves; positions
// whose body needs that shadow are excluded here (they would ADD an object local).
const VENUE_NUMERIC_ARG_NAMES = [ 'since', 'limit', 'until', 'amount', 'price' ];

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
    'handlePaginationParams': { 1: 'Int64?' },
    'internalFetchTransfers': { 2: 'Int64?', 3: 'Int64?' },
    'opinionOrderRawAmounts': { 2: 'double?', 3: 'double?' },
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
    'parseWsTrades': { 2: 'Int64?', 3: 'Int64?' },
    'prepareAccountRequest': { 0: 'Int64?' },
    'prepareAccountRequestWithCurrencyCode': { 1: 'Int64?' },
    'priceToPredictionPrecision': { 1: 'double?' },
    'queryTransactionsByEventType': { 4: 'Int64?', 5: 'Int64?' },
    'requestWalletHistoryRows': { 4: 'Int64?' },
    'seedOrderBook': { 2: 'Int64?' },
    'signAndCreateOrder': { 5: 'double?' },
    'tokenizedConvertHistory': { 0: 'Int64?', 1: 'Int64?' },
};

// Uses of a `typeCoreArgs` shadow local (`object nameVar = name;`, inserted when the body assigns
// to the narrowed parameter `name`) that cannot change the resolved C# code when the shadow is
// declared with the parameter's own type: the copy is the same box (Nullable<T> boxes as T) and
// every proven use is an identity cast `((T)nameVar)`, a cast to `object` (same box), a bare
// argument to a callee whose parameter there is `object` (same overload, same box), a direct
// element of an object-valued initializer, an `IDictionary<string, object>` element assignment,
// `return nameVar;` from an object-returning method, or a write whose right hand side is a literal
// (string/bool/real only) or a cast/helper returning that same type. An integer literal is not one
// of them for `Int64?`: `Int64? x = 1000` converts the literal, so the box becomes an Int64 where
// the `object` spelling boxes an Int32. Everything else keeps `object` -- notably `add (...)`,
// whose add(string, string) overload would win and differs from add(object, object).
// cs90 U23 census: the `limit` core-arg copies (`object limitVar = limit;`, 305 sites) keep
// `object` -- each is reassigned an `object` producer (204 callDynamically(getLimit): CS0266 and an
// Int32 box on the ArrayCache min path; 76 int literals; 9 mathMin; 10 ternaries; 6 others).
const CORE_ARG_SHADOW_TYPES = [ 'string', 'Int64?', 'double?', 'bool?' ];

// cs90 U65: the `limit` core-arg shadow (`object limitVar = limit;`). The escalation the user
// approved (WAVE1 USER DECISIONS 2026-09-18 #1) admits two write forms for this ONE source --
// the copy is the same box as the parameter, and both forms hand the copy an Int64 box:
//
//   * `limitVar = callDynamically (<cache>, "getLimit", new object[] { … })` -- the hand-written
//     ws cache accessor. cs/ccxt/ws/ArrayCache.cs now declares `Int64? getLimit` (ArrayCache,
//     ArrayCache.getLimit/_getLimit and ArrayCacheByTimestamp.getLimit; every getLimit in cs/**),
//     so the `((Int64?)…)` unbox-cast names the box the value already has and null stays null.
//   * `limitVar = <integer literal>` (`??=` included) -- `Int64? x = 100` converts the literal
//     and boxes an Int64 where the `object` spelling boxed an Int32: the one deliberate box
//     change of the unit, and the emitted cast keeps it visible at the site.
//
// Keyed by the SOURCE parameter name, so every sibling copy keeps the rules it had.
const CORE_ARG_SHADOW_LIMIT_SOURCE = 'limit';
const CORE_ARG_SHADOW_LIMIT_GETLIMIT_RE = /^callDynamically\s*\(\s*[A-Za-z_]\w*\s*,\s*"getLimit"\s*,/;
const CORE_ARG_SHADOW_LIMIT_LITERAL_RE = /^-?\d+$/;

// `castCoreArgCallSites` wraps an argument whenever its printed form does not already look like a
// string literal or a `(string)` cast -- it has no type knowledge. A bare identifier the enclosing
// generated declaration already types with the target (`string symbol` after `typeCoreArgs`
// narrowed it, or a local declared `string`) makes that wrap a no-op: the callee receives the same
// reference. Only the identifiers owned by THIS unit are listed, so a sibling family (`code`,
// `type`/`side`/`id`, `timeframeVar`) keeps its casts and extends the list on its own branch.
const CORE_ARG_CALL_SITE_TYPED_IDENTIFIERS = [ 'symbol' ];

// Callees where every definition in cs/** (base, generated and ws tiers) declares `object` in the
// position an argument lands in, so an `object` argument and a `string`/nullable-numeric argument
// select the same overload and hand it the same box. `subtract`/`multiply`/`divide`/`sum` only add
// int/Int64/double overloads, which no nullable numeric or string converts to implicitly.
// `GetValue` is the typed twin of `getValue` (S63, one IDictionary<string, object> receiver
// parameter plus a string key): a shadow alias is a string/nullable numeric, so it can only ever
// reach the twin's key position, and both overloads read the same dictionary the same way.
const CORE_ARG_SHADOW_CALLEES = [
    'parseTimeframe', 'safeString', 'safeString2', 'safeStringN', 'safeBool', 'safeInteger',
    'safeNumber', 'safeDict', 'safeValue', 'safeList', 'safeTicker', 'safeOrder', 'safeTrade',
    'safeSymbol', 'getValue', 'GetValue', 'isEqual', 'isTrue', 'isGreaterThan', 'isLessThan',
    'isGreaterThanOrEqual', 'isLessThanOrEqual', 'mathMin', 'mathMax', 'subtract', 'multiply',
    'divide', 'sum', 'filterBySymbolSinceLimit', 'filterBySinceLimit', 'filterBySymbol',
    'handleWithdrawTagAndParams', 'fetchPaginatedCallIncremental', 'fetchPaginatedCallCursor',
    'fetchPaginatedCallDynamic', 'fetchPaginatedCallDeterministic', 'unWatchOHLCVForSymbols',
    'WatchOHLCVForSymbols', 'checkAddress', 'ToInt64Arg', 'ToDoubleArg', 'ToDoubleArgRequired',
    'ToOHLCVList', 'ToTradeList', 'ToOrderList', 'ToTransactionList', 'ToFundingRateHistoryList',
    'ToOpenInterestList', 'ToTransferEntryList', 'FromOHLCVDict', 'FromOHLCVList',
    'FromOpenInterests', 'symbol', 'market', 'marketId', 'parseToInt', 'parseOHLCVs', 'parseOrders',
    'parseTrades', 'parseTransactions', 'findNearestCeiling',
];

// Extension of the allowlist above: every definition of these names in cs/** (base, venue, ws,
// prediction) types every position `object`, so a narrowed argument keeps the same overload and
// box. Per-name and per-position proof: campaigns/cs-strict/tools/S32/callee-strict.py. Kept in
// its own list so a unit that owns a family can switch the extension off (`newRules`).
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

// `add` is admissible only as the RIGHT operand of a two-argument call: an `object` left keeps
// add(object, object) and a `string` left moves add(string, object) -> add(string, string), which
// the base declares identical. Index 0 would rebind to add(string, *) and differ on a null left.
const CORE_ARG_SHADOW_CALLEE_ONLY_POSITIONS: Record<string, number[]> = {
    'add': [ 1 ],
};

// cs90 U24: the shadow copies of the string core args the roster assigns to this unit
// (`symbol`, `timeframe`, `since`, `currency`, `tag` -- U23 owns `limit`). A copy is typed with
// the parameter's own type when every use is an identity. Two WRITES below become identities
// once the unboxing cast the typed declaration implies sits in the line, and this unit emits it:
//
//   * `symbolVar = GetValue (market, "symbol")` -- a market row read by a string key. The
//     classifier already emits the same cast for the read form (`string? symbol =
//     ((string)GetValue (market, "symbol"));`, see MARKET_ROW_STRING_KEYS in
//     build/csharp-local-types.js), so the cast names the box the row already holds and a null
//     value unboxes to null through it. The receiver must be a local this body binds ONLY from
//     `this.market / this.safeMarket / this.safeMarketStructure` (or the `null` init).
//   * `tagVar = tagparametersVariable[0]` -- element 0 of `handleWithdrawTagAndParams`, a
//     string-or-null on every return path of the hand-written helper (Exchange.BaseMethods.cs),
//     reached through the `IList<object>` local the body binds from that one call.
//
// Keyed by the SOURCE parameter name, so a sibling unit's copy keeps the rules it had.
const CORE_ARG_SHADOW_OWNED_SOURCES = [ 'symbol', 'timeframe', 'since', 'currency', 'tag' ];

const CORE_ARG_SHADOW_MARKET_ROW_READ_RE = /^(?:this\.)?(?:GetValue|getValue)\s*\(\s*([A-Za-z_]\w*)\s*,\s*"([^"]+)"\s*\)$/;
// The printer's null-safe `(market.ContainsKey("symbol") ? market["symbol"] : null)` read of the
// same key off the same proven row (backreference): a string-or-null box, identity `(string)` cast.
const CORE_ARG_SHADOW_MARKET_ROW_COND_RE = /^\(([A-Za-z_]\w*)\.ContainsKey\("([^"]+)"\)\s*\?\s*\1\[\s*"([^"]+)"\s*\]\s*:\s*null\)$/;

const CORE_ARG_SHADOW_MARKET_ROW_BIND_RE = /^\s*(?:I?Dictionary<string, object>\s+)?([A-Za-z_]\w*)\s*=\s*(?:this\.)?(?:market|safeMarket|safeMarketStructure)\s*\(/;
const CORE_ARG_SHADOW_ELEMENT0_READ_RE = /^([A-Za-z_]\w*)\[\s*0\s*\]$/;
// Tuple helpers whose element 0 is a string-or-null box at every call site in cs/**. Each is
// declared once (`Exchange.BaseMethods.cs`: `object tag, object parameters` -> `List<object>`,
// no venue or pro override) and called only from the generated `Withdraw`/`WithdrawWs` bodies,
// which pass the copy of their own `string tag = null` parameter: slot 0 is that box, or
// `safeString(parameters, "tag")` after the dictionary branch nulled it. Both are string-or-null,
// so the `(string)` element cast the destructured write gets names the box the slot already
// holds -- null passes a reference cast unchanged.
// (cs90 U24 added this table for its own tag element-0 rule; U25 owns the alias fence.)
const CORE_ARG_SHADOW_STRING_ELEMENT0_HELPERS = [ 'handleWithdrawTagAndParams' ];
const CORE_ARG_SHADOW_STRING_ELEMENT0_BIND_RE = /^\s*IList<object>\s+([A-Za-z_]\w*)\s*=\s*\(IList<object>\)\s*(?:this\.)?(?:handleWithdrawTagAndParams)\s*\(/;

// U25 owns the withdraw `tag` core arg: `Withdraw`/`WithdrawWs` narrow the parameter to
// `string tag = null` and every body reassigns it from `handleWithdrawTagAndParams`, so the 49
// sites carry an `object tagVar = tag;` seed. The widenings below are keyed to that alias and to
// the helper's holder, so the sibling shadow families (symbol / timeframe / since / currency /
// limit -- U23/U24) keep the base behaviour.
const CORE_ARG_SHADOW_TAG_ALIASES = [ 'tagVar' ];


// Declarations the scanned body carries for the family above: element-0 holders of the audited
// helpers, dictionary locals and plain `object` locals.
type CoreArgShadowTagContext = {
    stringHolders: Set<string>;
    dictNames: Set<string>;
    objectNames: Set<string>;
};

// cs90 U42: the declared types `retypeIdentifierCopies` may name for a plain identifier copy
// (`object x = <typed param or local>;`). Every entry is a type the emitted tree already
// carries on a declaration line, so the copy names what the box already is.
const U42_COPY_TYPES = [ 'string', 'string?', 'Int64?', 'double?', 'bool?', 'IList<object>', 'List<object>', 'Dictionary<string, object>', 'IDictionary<string, object>' ];

// The sources (parameter names) and copies the roster assigns to U23 (`limit`) and U24/U25
// (`symbol`, `timeframe`, `since`, `currency`, `tag`): a sibling unit owns those sites, so this
// unit never retypes them.
const U42_COPY_OWNED_SOURCES = [ 'limit', 'symbol', 'timeframe', 'since', 'currency', 'tag' ];
const U42_COPY_OWNED_ALIASES = [ 'limitVar', 'symbolVar', 'timeframeVar', 'sinceVar', 'currencyVar', 'tagVar', 'startTime', 'tag' ];

// Callees every definition of which declares `object` in the position an argument lands in
// (`currency`, `networkIdToCode`, `safeCurrencyCode`, `safeOutcome`, `safeOutcomeSymbol`,
// `filterByValueSinceLimit`), plus `getArrayLength`, whose List/IList twins are identity copies
// of the `object` overload's IList branch (null -> 0). Definitions: cs/ccxt/base/*.cs.
const U42_COPY_CALLEES = [ 'currency', 'networkIdToCode', 'safeCurrencyCode', 'safeOutcome', 'safeOutcomeSymbol', 'filterByValueSinceLimit', 'getArrayLength' ];

// Box-identical widening edges a write may cross: `List<object>` implements `IList<object>`, and
// `string?` is the same C# type as `string` (a CS86xx warning is all the annotation adds).
const U42_COPY_WIDENING: Record<string, boolean> = {
    'List<object>->IList<object>': true,
    'Dictionary<string, object>->IDictionary<string, object>': true,
    'string?->string': true,
};

// cs-strict S01: the `code` core-arg. CORE_STRING_ARGS narrows the positions `code` is passed to,
// and castCoreArgCallSites wraps every argument at those call sites -- including the ones that
// already pass the narrowed type, which is what the caller cores do: `withdraw (code: Str)` prints
// `string code = null`, so `this.currency(((string)code))` casts a value that is already a string.
// The wrap is skipped when the argument is one of these identifiers and its nearest in-scope
// declaration inside the enclosing public method is exactly the narrowed type. A `string?`
// declaration (the cast does assert non-null there) and an `object` declaration (an unproven box,
// TS `any`) keep their cast. Identifier-keyed, so sibling units (symbol / timeframe / type / side /
// id / status) keep owning their own call sites. U25 adds the withdraw `tag` core arg: the
// narrowed `tag` parameter of every `Withdraw`/`WithdrawWs` core and the `tagVar` shadow the
// body assigns it to are declared exactly `string`, so the wrap `castCoreArgCallSites` inserts
// for `withdrawRequest(... , tagVar, ...)` names the box those bindings already hold.
const CORE_ARG_CAST_EXEMPT_NAMES = [ 'code', 'codeVar', 'tag', 'tagVar' ];

// U47: hand-written / base-emitted C# producers whose DECLARED return type is `string`/`string?`,
// read off the declaration named in each value. A `((string)this.<name>(...))` wrap on one of
// them is an identity conversion (reference type: `string?` and `string` are one runtime type,
// the annotation is not part of a signature, null stays null, nothing unboxes), so the cast can
// go. A name the processed content itself declares wins over this table: an override that prints
// another type (or a `new`-hidden twin) then decides the call site's static type, not the base.
// Census of the surviving `((string)` casts on the base tree: campaigns/cs90/tools/U47.
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
// parameter, and every body use is a dict use (census: campaigns/cs-strict/tools/S37).
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
    // cs90 U51: the `object market` parameters S37 left. Same admission rule (every call site
    // passes null / a Dictionary / IDictionary value / an admitted name's own `market` parameter
    // -- fixed point over both lists -- and every body use is a dict use); the transitive closure
    // is derived by campaigns/cs90/tools/U51/{market-census4,admission-verdict}.py.
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
];

// the emitted declaration line the pass rewrites, and the `market` parameter inside it (with and
// without the null default -- some venues declare the parameter required)
const PARSE_MARKET_SIG_RE = /^(\s*)public (async )?(virtual|override) ([\w<>., ?]+) (\w+)\((.*)\)\s*$/;
const PARSE_MARKET_PARAM_RE = /([(,]\s*)object(\s+market\s*=\s*null)(?=[,)])/g;
const PARSE_MARKET_PARAM_REQUIRED_RE = /([(,]\s*)object(\s+market)(?=[,)])/g;

// S40 (cs-strict): ws handler parameter `object message` -> `Dictionary<string, object>`.
//
// A handler's `message` is the parsed frame: `Client.TryHandleMessage` hands the result of
// `JsonHelper.Deserialize` (a `Dictionary<string, object>` for every JSON object, see
// Exchange.JSONHelper.ToObject) to the venue dispatcher, which forwards it to the channel
// handlers.  A parameter is retyped here only where EVERY reference in the whole C# tree
// passes a dict at runtime:
//   * the handler is a `{ "key", this.handleX }` entry of a dispatch table invoked through
//     `DynamicInvoker.InvokeMethod(method, new object[] { client, message })` whose key was
//     read off the message with `safeString`/`safeValue` (`method` non-null), so a list, a
//     string or a scalar frame never reaches the handler -- and the argument is boxed, so the
//     reflective call itself needs no cast; or
//   * every direct call passes a value already proven a dict: a `safeString`/`safeValue` read
//     off the argument (or off a `safeDict(arg, ...)` copy of it) in a guard that dominates
//     the call, or the same retyped parameter of another handler of this venue.
// A call site whose argument is still statically `object` gets the `(Dictionary<string, object>)`
// assertion the new parameter requires -- the same shape `castCoreArgCallSites` emits for a
// narrowed core parameter (a null argument stays null through the cast).
// Handlers the file's dispatcher can hand a JSON array (`x is IList<object>`), a bare string
// (`isEqual (message, "pong")`) or a rewritten message stay `object`; the per (venue, handler)
// proof and the rejected list are in campaigns/cs-strict tools/S40 + the unit report.
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
    bydfi: [ 'handleBalance', 'handleErrorMessage', 'handleOHLCV', 'handleOrder', 'handleOrderBook', 'handlePong', 'handlePositions', 'handleSubscriptionStatus', 'handleTicker' ],
    cex: [ 'handleAuthenticationMessage', 'handleBalance', 'handleConnected', 'handleErrorMessage', 'handleInitOHLCV', 'handleMyTrades', 'handleOHLCV', 'handleOHLCV1m', 'handleOHLCV24', 'handleOrderBookSnapshot', 'handleOrderBookUpdate', 'handleOrderUpdate', 'handleOrdersSnapshot', 'handleTicker', 'handleTrade', 'handleTradesInner', 'handleTradesSnapshot', 'handleTransaction' ],
    coinbase: [ 'handleHeartbeats', 'handleOrder', 'handleOrderBook', 'handleSubscriptionStatus', 'handleTickers', 'handleTrade' ],
    coinbaseexchange: [ 'handleErrorMessage', 'handleMyTrade', 'handleOrder', 'handleOrderBook', 'handleSubscriptionStatus', 'handleTicker', 'handleTrade' ],
    coinbaseinternational: [ 'handleFundingRate', 'handleInstrument', 'handleOHLCV', 'handleOrderBook', 'handleSubscriptionStatus', 'handleTicker', 'handleTrade' ],
    coinex: [ 'handleAuthenticationMessage', 'handleBalance', 'handleBidAsk', 'handleMyTrades', 'handleOrderBook', 'handleOrders', 'handleSubscriptionStatus', 'handleTicker', 'handleTrades' ],
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

// U52: the ws handlers of S40's table that stayed `object` because their dispatcher hands them an
// `IDictionary<string, object>` -- retyped to the INTERFACE spelling, which is exactly the box the
// argument already has, so no call site changes and the tree gains no conversion.  Admission
// (campaigns/cs90/tools/U52/admit5.py, verify_U52.py) requires, per (venue, handler):
//   * every reference is a dispatch-table method group whose reflective invoke is selected by a
//     key read off the message (`string? k = this.safeString (message, …)` ->
//     `this.safeValue (methods, k)`, the invoke guarded by `method != null`), so a non-dict frame
//     selects no entry and never reaches the handler; or
//   * a direct call whose 2nd argument is ALREADY statically a dict type in the emitted text (a
//     `Dictionary<string, object>` / `IDictionary<string, object>` local, parameter, or another
//     handler of this table -- the same-file chain), so the retype needs no
//     `(Dictionary<string, object>)arg` assertion: the concrete spelling S40 uses would have to
//     downcast the interface-typed argument at runtime (rejected there, see its report);
//   * the handler body compiles unchanged under the interface parameter: no `(string)param` /
//     `param as T` conversion the interface cannot make, no `ref`/`out` sink, no reassignment of
//     the parameter (a reassignment site is a counter-proof: the value stops being the message).
// A handler whose emitted text stops satisfying the call-site rule stays `object` whole -- the
// pass is self-gating, it never guesses.
const WS_HANDLER_IDICT_MESSAGE: Record<string, string[]> = {
    aster: [ 'handleBalanceAndPosition', 'handleBidAsk', 'handleOHLCV', 'handleOrder', 'handleOrderBook', 'handlePositions', 'handleTicker', 'handleTrade' ],
    bingx: [ 'handleUnSubscription' ],
    bydfi: [ 'handleUnSubscription' ],
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

// `sign()` / `handleErrors()` parameter types, keyed by POSITION (the venue overrides rename the
// parameters: path/section, code/httpCode/statusCode, headers/responseHeaders, so only the
// position carries the type; C# overrides are invariant on types, not names). The hand-written
// base cs/ccxt/base/Exchange.cs already declares these positions concretely (`sign(object path,
// object api, string method, dict headers, …)`, `handleErrors(int, string, string, string, dict,
// …)`); the generated base virtual and its 101 venue overrides are the ones that lag. Positions
// stay `object` where the call-site census rejects them (see campaigns/cs-strict REPORT.md S41).
// No `object <name>Var` shadow (unlike typeCoreArgs): every write in the 202 bodies is a literal
// or a `Dictionary<string, object>` producer, so the narrowed declaration keeps the bodies
// byte-identical, and the 8 `add (method, …)` sites pass a static string or a literal.
const SIGNATURE_ARG_TYPES: Record<string, Record<number, string>> = {
    'sign': { 2: 'string', 4: 'Dictionary<string, object>' },
    'handleErrors': { 1: 'string', 2: 'string', 3: 'string', 7: 'Dictionary<string, object>' },
};

// S43 pilot: method names whose trailing `parameters` argument is retyped to
// `Dictionary<string, object> parameters = null`. C# overrides are invariant on parameter types,
// so a name may only be admitted while EVERY declaration of it (generated base + the venue
// override) is rewritten by the same pass. The two names below are the closed subset that has a
// single venue: `isUTAEnabled` (BaseMethods + kucoin), `WatchPosition` (TradingMethods + pro/kucoin);
// both have no body assignment a Dictionary cannot take and no call site passing a non-dict
// argument. The table lives in build/csharp-local-types.js so the classifier types the parameter too.










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

// The safeDict/safeList family is generated from ts/src/base/Exchange.ts, but its return
// annotations (`Dictionary<any>` / `any[]`, each unioned with `undefined`) do not reach the
// C# printer: getTypeFromRawType() has no member for a dictionary alias and a union falls
// back to DEFAULT_RETURN_TYPE, so every one of the six prints `public virtual object`
// (probed against the pinned ast-transpiler: bare `Dict`, `Dictionary<any>`, `Array<any>`,
// `any[]` and every `| undefined` variant all emit `object`). The bodies, however, return
// the real type on every path, so the emitted method text is retyped here: signature to the
// concrete C# type, every `return <x>;` through an explicit cast. build/csharp-local-types.js
// then names the locals fed by these calls.
//
// The dictionary three return the INTERFACE, not the concrete class: the found value only
// passed `isDictionary`, which accepts any IDictionary<string, object> — this port hands
// ConcurrentDictionary<string, object> through these paths for real (options itself is one,
// createSafeDictionary() builds one, and paradex stores one in options['paradexAccount']),
// and `(Dictionary<string, object>)` on such a value throws InvalidCastException. The cast
// to the interface is identity-preserving for every value the guard passes and never throws
// where the previous `object` return did not.
//
// Lists keep the concrete List<object>: every value the List<> guard passes that is NOT a
// List<object> also fails the consumer-side IList<object> casts this port already emits, so
// narrowing to List<object> changes nothing a caller could previously have used.
//
// The FOUND value is cast (the guard proves it); the DEFAULT is handed back with `as`, so a
// default that is not the declared collection drops to null instead of throwing — the same
// convention the hand-written SafeString/SafeStringN use (`return defaultValue as string`).
// This is reachable in the real tree: myriad's fetchOHLCV passes a dictionary as the list
// default (`safeDict`-shaped data read through `safeList (chart, 'data', chart)`), which the
// fixture suite catches the moment a hard cast is used there.
//
// The rewrite is exact-match and throws if the generated shape ever changes.
const SAFE_COLLECTION_HELPER_TYPES: Record<string, string> = {
    'safeDict': 'IDictionary<string, object>',
    'safeDict2': 'IDictionary<string, object>',
    'safeDictN': 'IDictionary<string, object>',
    'safeList': 'List<object>',
    'safeList2': 'List<object>',
    'safeListN': 'List<object>',
};

// S15 — native C# members for the list wrappers the printer emits (`getArrayLength(x)` for a TS
// `.length`, `((IList<object>)x).ToArray()/.First()/.Last()` for a list call). The receiver counts
// only when its own declaration in the same method is a list type; see nativeListHelperCalls().
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
// U48 — `((IList<object>)x)` is an identity conversion when x's emitted static type already IS
// List<object>/IList<object>. Dropped only in front of the accesses that resolve identically there
// (indexer, Add, ToArray, First, Last); `.Reverse()/.Sort()` are void List INSTANCE methods.
const CSHARP_IDENTITY_LIST_CAST = /\(\(IList<object>\)\s*([A-Za-z_]\w*)\s*\)(\.Add\(|\[|\.ToArray\(\)|\.First\(\)|\.Last\(\))/g;
// the same identity around the hand-written ws cache: `ccxt.pro.OrderBook.cache` is declared
// `IList<object>` (cs/ccxt/ws/OrderBook.cs:22/:33), so the cast is a no-op on that member read
const CSHARP_ORDERBOOK_CACHE_CAST = /\(\(IList<object>\)(?:\(IList<object>\))?\(+([A-Za-z_]\w*) as ccxt\.pro\.OrderBook\)\.cache\)+\.Add\(/g;

// locate a whole transpiled C# method (plus a preceding /** */ doc-comment block, if any)
// by name — the span stripCSharpMethod() cuts out, kept addressable so a rewritten method
// can be spliced back at its original position
function findCSharpMethodSpan (body: string, name: string): { start: number, end: number, method: string } | undefined {
    const sigRe = new RegExp ('\\n([ \\t]*)public [^\\n]*\\b' + name + '\\s*\\(');
    const m = sigRe.exec (body);
    if (!m) {
        return undefined;
    }
    let start = m.index; // the '\n' just before the signature line
    const before = body.substring (0, start);
    const docMatch = before.match (/\n[ \t]*\/\*\*[\s\S]*?\*\/[ \t]*$/);
    if (docMatch) {
        start = docMatch.index as number;
    }
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
const GENERATED_TESTS_FOLDER = './cs/tests/Generated/Exchange/';
const BASE_TESTS_FOLDER = './cs/tests/Generated/Base';
const BASE_TESTS_FILE =  './cs/tests/Generated/TestMethods.cs';
const EXCHANGE_BASE_FOLDER = './cs/tests/Generated/Exchange/Base/';
const EXCHANGE_GENERATED_FOLDER = './cs/tests/Generated/Exchange/';
const EXAMPLES_INPUT_FOLDER = './examples/ts/';
const EXAMPLES_OUTPUT_FOLDER = './examples/cs/examples/';
const csharpComments: any = {};

// default min(2, AP): 2w + shared-Program chunks is within ~10–15% of 4w and uses fewer cores.
// Override with CCXT_TRANSPILE_PROCESSES.
function csharpWorkerThreads () {
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
            // reads of the cached orderbook map go through the typed helpers added next to
            // safeValue in cs/ccxt/ws/Exchange.WsBridge.cs (both return ccxt.pro.IOrderBook;
            // the map only ever holds this.orderBook()/indexedOrderBook()/countedOrderBook()
            // instances, so the value inside the box is unchanged)
            [/this\.safeValue\((this\.orderbooks),/gm, 'this.safeOrderBook($1,'],
            [/getValue\((this\.orderbooks),/gm, 'this.getOrderBook($1,'],
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
            [/this\.delay\(([^,\n]+),([^,\n]+),([^\n]+)\)/gm, 'this.delay($1, $2, new object[] {$3})'],
            // [/(this\.\w+)\.(append|resolve|getLimit)\((.+)\)/gm, 'callDynamically($1, "$2", new object[] {$3})'], // check this.orders
            [/(((?:this\.)?\w+))\.(append|resolve|getLimit)\((.+)\)/gm, 'callDynamically($1, "$3", new object[] {$4})'],
            [/future(\.reject.+)/gm, '((Future)future)$1'],
            [/(\w+)(\.reject.+)/gm, '((WebSocketClient)$1)$2'],
            [/(client)(\.reset.+)/gm, '((WebSocketClient)$1)$2'],
            [/\(client,/g, '(client as WebSocketClient,'],
            [/([(,]\s*)object client\b/g, '$1WebSocketClient client'],
            [/object client =/gm, 'var client ='],
            [/object future =/gm, 'var future ='],
            // `resolve` on a receiver the arg pass already typed (`client as WebSocketClient`,
            // or Future for the ws promise) targets a method that class declares, so it needs no
            // reflective dispatch: the direct call binds the same method, with the same
            // object-typed arguments and the same void result.
            [/callDynamically\((\w+) as (WebSocketClient|Future), "resolve", new object\[\] \{(.+)\}\);/gm, '($1 as $2).resolve($3);'],
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
        setupCsharpPrinter (this.transpiler);
        this.transpiler.csharpTranspiler.transformLeadingComment = this.transformLeadingComment.bind(this);
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
            // TS interface names whose C# structs are Currency / Fee (cs/ccxt/base/Exchange.Types.cs)
            'CurrencyInterface': 'Currency',
            'FeeInterface': 'Fee',
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

    /**
     * @description Single source of truth for the C# type of an optional scalar parameter.
     * The wrapper signature declares it as `<type>? name = null` and passes it straight into
     * the core call, so the nullable scalar type is computed here and nowhere else.
     * Returns undefined for parameters that are not optional numeric scalars.
     */
    optionalScalarCsharpType(param: any): string | undefined {
        const isOptional = param.optional || param.initializer === 'undefined';
        if (!isOptional) {
            return undefined;
        }
        if (this.isIntegerType(param.type)) {
            return 'Int64';
        }
        if (this.isNumberType(param.type)) {
            return 'double';
        }
        return undefined;
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
                    const scalarType = this.optionalScalarCsharpType(param);
                    if (scalarType !== undefined) {
                        return `${scalarType}? ${safeName} = null`
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
            // same as fetchCurrencies: a hand-written PascalCase public method already
            // lives on Exchange.cs (new Currencies(await fetchCurrenciesWs())). Emitting
            // a generated wrapper is a second overload (object vs Dictionary params) and
            // bitvavo's ws override stays on the camelCase core that the hand-written
            // method already calls. Blacklist, don't type — the BaseExchange decl is
            // never rewritten, so a typed override would be CS0508.
            'fetchCurrenciesWs',
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
            // venue-internal ws transport plumbing: each of these resolves 2+ runtime
            // shapes across its call sites (ticker dict / live orderbook / ArrayCache /
            // [symbol, timeframe, stored] tuple / raw message), so no closed C# type
            // fits and a cast-only `Dictionary<string, object>` wrapper is a lie
            'watchExecuteRequest',
            'watchHeartbeat',
            'watchMany',
            'watchMultiHelper',
            'watchMultiTickerHelper',
            'watchMultipleWrapper',
            'watchPrivateMultiple',
            'watchPrivateRequest',
            'watchPrivateSubscribe',
            'watchPublicMultiple',
            'watchRequest',
            'watchSpotPrivate',
            'watchSpotPublic',
            'watchStockMarketStream',
            'watchSwapPrivate',
            'watchSwapPublic',
            'watchTopics',
            'setPositionsCache',
            'setPositionCache',
            // internal HTTP / pagination transport: not public API (users never call
            // fetch2 / fetchPaginatedCallCursor). fetch2 and fetchWebEndpoint return
            // polymorphic JSON (dict | list | string). fetchPaginatedCall* return a
            // concatenated List<object> of whatever the inner method produced, and
            // ~80 consumers immediately wrap that in ToTradeList / ToOrderList / …
            // which still hard-cast `(IList<object>)` — List<T> is invariant, so
            // typing them as List<Dictionary<string, object>> would throw at those
            // sites even after the toArray re-box. Blacklist, don't force a type.
            'fetch2',
            'fetchWebEndpoint',
            'fetchPaginatedCallDynamic',
            'fetchPaginatedCallDeterministic',
            'fetchPaginatedCallCursor',
            'fetchPaginatedCallIncremental',
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

    // locates the terminating `;` of a `return <expr>;` statement starting at line `start`,
    // tolerating multi-line expressions by only stopping on a `;` outside brackets/strings
    collectReturnStatement (lines: string[], start: number): number[] {
        let depth = 0;
        let inString = false;
        for (let i = start; i < lines.length; i++) {
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
                if (ch === ';' && depth <= 0) { return [ i, j ]; }
            }
        }
        return [ start, lines[start].length ];
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

    // finds the `)` closing the call that starts at `open` (the `(` index), skipping
    // string literals — generated argument lists carry `(`/`)` inside url templates
    matchingParen (line: string, open: number): number {
        let depth = 0;
        let inString = false;
        for (let i = open; i < line.length; i++) {
            const ch = line[i];
            if (inString) {
                if (ch === '\\') { i++; continue; }
                if (ch === '"') { inString = false; }
                continue;
            }
            if (ch === '"') { inString = true; continue; }
            if (ch === '(') { depth++; continue; }
            if (ch === ')') { depth--; if (depth === 0) { return i; } }
        }
        return -1;
    }

    // wraps every `await this.<typedCore>(...)` on one line in its From* helper, so a typed
    // struct never lands in an `object` local. Occurrences already funnelled through a
    // To*/From* helper, and the tail-call returns typeCores deliberately left bare, are skipped.
    wrapTypedCoreConsumers (line: string, names: string[], predictionTier: boolean, skipReturn: boolean): string {
        let out = line;
        for (const name of names) {
            const typedType = this.typedCoreType (name, predictionTier);
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
                const close = this.matchingParen (out, at + needle.length - 1);
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

    typeCores (content: string, predictionTier = this.isPrediction): string {
        const names = this.typedCoreNames ();
        if (!names.some (name => content.includes (' ' + name + '('))) {
            return content;
        }
        const lines = content.split ('\n');
        // void `Task` bodies (loadBalanceSnapshot, loadPositionsSnapshot) are visited too: they
        // consume typed cores into `object` locals and need the From* funnel like anyone else
        // `Task<...>` with a concrete argument is matched too: a typed core can itself consume
        // another typed core into an `object` local (okx FetchDepositAddress reads
        // FetchDepositAddressesByNetwork), and that boxed struct needs the same From* funnel
        const sigRe = /^(\s*)public async (virtual|override) Task(?:<[\w.<>, ]+>)? (\w+)\(/;
        const typedCallRe = new RegExp ('^await this\\.(' + names.join ('|') + ')\\(');
        for (let i = 0; i < lines.length; i++) {
            const sig = sigRe.exec (lines[i]);
            if (!sig) {
                continue;
            }
            const [ , indent, modifier, methodName ] = sig;
            const isObjectTask = lines[i].indexOf (' Task<object> ') !== -1;
            const typedType = isObjectTask ? this.typedCoreType (methodName, predictionTier) : '';
            const isTyped = typedType !== '';
            // the method body ends at its closing brace, which is the first line indented exactly
            // like the signature — brace counting is unusable here because generated bodies carry
            // `{`/`}` inside string literals (url templates, json payloads)
            let bodyStart = i + 1;
            while (bodyStart < lines.length && lines[bodyStart].trim () !== '{') {
                bodyStart++;
            }
            if (bodyStart >= lines.length) {
                continue;
            }
            let bodyEnd = lines.length - 1;
            for (let j = bodyStart + 1; j < lines.length; j++) {
                if (lines[j] === indent + '}') { bodyEnd = j; break; }
            }
            if (isTyped) {
                lines[i] = `${indent}public async ${modifier} Task<${this.qualifyTypedCoreType (typedType)}> ${methodName}(` + lines[i].split (methodName + '(').slice (1).join (methodName + '(');
            }
            const tailOk: Record<number, boolean> = {};
            for (let j = bodyStart + 1; j < bodyEnd; j++) {
                if (!lines[j].trim ().startsWith ('return ')) {
                    continue;
                }
                const [ lastLine, semi ] = this.collectReturnStatement (lines, j);
                const head = lines[j].substring (lines[j].indexOf ('return ') + 7);
                const middle = lines.slice (j + 1, lastLine);
                const tail = lastLine === j ? '' : lines[lastLine].substring (0, semi);
                const expr = (lastLine === j ? head.substring (0, semi - lines[j].indexOf ('return ') - 7) : [ head ].concat (middle).concat ([ tail ]).join (' ')).trim ();
                const calledCore = typedCallRe.exec (expr);
                const calledType = calledCore ? this.typedCoreType (calledCore[1], predictionTier) : '';
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
                const pad = lines[j].substring (0, lines[j].length - lines[j].trimStart ().length);
                const trailing = lines[lastLine].substring (semi + 1);
                lines[j] = `${pad}return ${wrapper}(${expr});${trailing}`;
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
                // first, or matchingParen gives up and the boxed struct escapes untouched
                // (binance watchTicker -> `object tickers = await this.WatchTickers(` + 3 lines)
                let end = j;
                if (this.matchingParen (lines[j], lines[j].indexOf ('await this.')) === -1) {
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
            let bodyStart = i + 1;
            while (bodyStart < lines.length && lines[bodyStart].trim () !== '{') {
                bodyStart++;
            }
            if (bodyStart >= lines.length) {
                continue;
            }
            let bodyEnd = lines.length - 1;
            for (let j = bodyStart + 1; j < lines.length; j++) {
                if (lines[j] === indent + '}') { bodyEnd = j; break; }
            }
            for (let j = bodyStart + 1; j < bodyEnd; j++) {
                if (!lines[j].trim ().startsWith ('return ')) {
                    continue;
                }
                const [ lastLine, semi ] = this.collectReturnStatement (lines, j);
                const head = lines[j].substring (lines[j].indexOf ('return ') + 7);
                const middle = lines.slice (j + 1, lastLine);
                const tail = lastLine === j ? '' : lines[lastLine].substring (0, semi);
                const expr = (lastLine === j ? head.substring (0, semi - lines[j].indexOf ('return ') - 7) : [ head ].concat (middle).concat ([ tail ]).join (' ')).trim ();
                if (this.syncCoreReturnIsAlreadyTyped (expr)) {
                    j = lastLine;
                    continue;
                }
                const retAt = lines[j].indexOf ('return ') + 7;
                if (lastLine === j) {
                    lines[j] = lines[j].substring (0, retAt) + 'ccxt.BaseExchange.ToDict(' + lines[j].substring (retAt, semi) + ')' + lines[j].substring (semi);
                } else {
                    // multi-line expression: open the helper on the first line, close it
                    // before the `;` on the last — formatting is preserved
                    lines[j] = lines[j].substring (0, retAt) + 'ccxt.BaseExchange.ToDict(' + lines[j].substring (retAt);
                    lines[lastLine] = lines[lastLine].substring (0, semi) + ')' + lines[lastLine].substring (semi);
                }
                j = lastLine;
            }
            i = bodyEnd;
        }
        return lines.join ('\n');
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

    // renames every typed core (declaration + call site) to PascalCase, so the generated core
    // *is* the public API and createWrapper stops emitting a thin duplicate. Method-name string
    // literals are deliberately NOT touched: they double as `has`/`describe()` capability keys
    // (`"createOrder": true`) — reflective lookup resolves the case instead (ResolveMethod).
    pascalizeTypedCores (content: string, predictionTier = this.isPrediction, receivers = [ 'this.', 'base.' ], declarations = true): string {
        const map = this.pascalTypedCoreNames (predictionTier);
        if (declarations) {
            const declRe = /(public\s+(?:async\s+)?(?:virtual\s+|override\s+)?Task<[^\n]*?>\s+)(\w+)\(/g;
            content = content.replace (declRe, (whole, head, name) => (map[name] !== undefined ? head + map[name] + '(' : whole));
        }
        const escaped = receivers.map ((r) => r.replace (/[.*+?^${}()|[\]\\]/g, '\\$&')).join ('|');
        const callRe = new RegExp ('(' + escaped + ')(\\w+)\\(', 'g');
        content = content.replace (callRe, (whole, receiver, name) => (map[name] !== undefined ? receiver + map[name] + '(' : whole));
        return content;
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
                const close = this.matchingParen (content, open);
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

    // index of the `)` closing the `(` at `open`, skipping string and char literals
    matchingParen (content: string, open: number): number {
        let depth = 0;
        let i = open;
        while (i < content.length) {
            const ch = content[i];
            if (ch === '"' || ch === '\'') {
                const quote = ch;
                i += 1;
                while (i < content.length && content[i] !== quote) {
                    i += (content[i] === '\\') ? 2 : 1;
                }
            } else if (ch === '(') {
                depth += 1;
            } else if (ch === ')') {
                depth -= 1;
                if (depth === 0) {
                    return i;
                }
            }
            i += 1;
        }
        return -1;
    }

    // right hand side whose C# static type is exactly the shadow's type
    coreArgShadowRhsIsTyped (rhs: string, targetType: string, newRules = true, tagContext?: CoreArgShadowTagContext): boolean {
        if (targetType === 'string') {
            if (/^"(?:[^"\\]|\\.)*"$/.test (rhs)) {
                return true;
            }
            if (/^this\.(?:safeString|symbol)\s*\(/.test (rhs)) {
                return true;
            }
            // `safeSymbol` returns `string?`, exactly like `safeString`
            if (newRules && /^this\.safeSymbol\s*\(/.test (rhs)) {
                return true;
            }
            // `capitalize` returns `string`; `((object)x).ToString()` is a string for any non-null x
            if (newRules && (/^this\.capitalize\s*\(/.test (rhs) || /^\(\(object\)[\w.]+\)\.ToString\s*\(\s*\)$/.test (rhs))) {
                return true;
            }
            if (/^\(\(string\)[\w.]+\)\.(?:ToLower|ToUpper|Trim)\s*\(\s*\)$/.test (rhs)) {
                return true;
            }
            // the destructured seed of a `tagVar` shadow: `<holder>[0]` of an audited helper
            // (CORE_ARG_SHADOW_STRING_ELEMENT0_HELPERS) holds a string or null, and the write
            // gets the `(string)` cast back to that box (insertCoreArgShadowElementCasts)
            if (tagContext !== undefined) {
                const element = /^([A-Za-z_]\w*)\s*\[\s*0\s*\]$/.exec (rhs);
                if (element !== null && tagContext.stringHolders.has (element[1])) {
                    return true;
                }
            }
        } else if (targetType === 'bool?') {
            if (/^(?:true|false)$/.test (rhs)) {
                return true;
            }
        } else if (targetType === 'double?') {
            // an integer literal would be converted (int -> double), boxing a Double instead of
            // the Int32 the `object` spelling boxes -- a real literal needs no conversion
            if (/^-?\d+\.\d*(?:[eE][-+]?\d+)?$/.test (rhs) || /^-?\d+[eE][-+]?\d+$/.test (rhs)) {
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

    // A callee outside the table keeps its argument untyped. No position exception is needed for
    // a narrowed parameter: castCoreArgCallSites wraps every argument there with `((string)…)`/
    // To*Arg, and coreArgShadowUseKind answers at that cast before asking about the callee.
    coreArgShadowCalleeAllows (callee: string, line: string, at: number, openParen: number, newRules = true): boolean {
        const name = callee.split ('.').pop () as string;
        const only = newRules ? CORE_ARG_SHADOW_CALLEE_ONLY_POSITIONS[name] : undefined;
        const extra = newRules ? CORE_ARG_SHADOW_NEW_CALLEES.indexOf (name) !== -1 : false;
        if (CORE_ARG_SHADOW_CALLEES.indexOf (name) === -1 && !extra && only === undefined) {
            return false;
        }
        if (only === undefined) {
            return true;
        }
        const [ index, count ] = this.coreArgShadowArgIndex (line, openParen, at);
        if (only !== undefined) {
            return count === 2 && only.indexOf (index) !== -1;
        }
    }

    // [ index of the argument holding `at`, number of top-level arguments ] of the call at `open`
    coreArgShadowArgIndex (line: string, open: number, at: number): [ number, number ] {
        let depth = 0;
        let index = 0;
        let count = 1;
        for (let i = open + 1; i < line.length; i++) {
            const ch = line[i];
            if (ch === '(') { depth += 1; } else if (ch === ')') {
                if (depth === 0) { break; }
                depth -= 1;
            } else if (ch === ',' && depth === 0) {
                count += 1;
                if (i < at) { index += 1; }
            }
        }
        return [ index, count ];
    }

    // classification of one occurrence: 'write', 'read', or '' when not provable
    coreArgShadowUseKind (line: string, at: number, alias: string, targetType: string, methodReturnType: string, inDictInit: boolean, newRules = true, tagContext?: CoreArgShadowTagContext): string {
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
                if ((op === '??=' || op === '=') && this.coreArgShadowRhsIsTyped (rhs, targetType, newRules, tagContext)) {
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
        // `(alias == null)` / `(alias != null)`: the native spelling of the isEqual(alias, null)
        // guard this classifier already accepts at an argument position. The null test reads the
        // box itself and answers the same for `object` and every narrowed type here.
        if (/^[!=]=\s*null\s*\)/.test (postl)) {
            return 'read';
        }
        // `(alias == "lit")` / `(alias != "lit")`: the native spelling of the isEqual(alias, "lit")
        // comparison this classifier already accepts at an argument position (the narrowed copy is
        // a `string` in the emitted declaration, which is what makes the operator a value compare)
        if (/^[!=]=\s*(?:"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')\s*\)/.test (postl)) {
            return 'read';
        }
        if (pre.trim () === 'return' && postl.trim () === ';') {
            return methodReturnType.includes ('object') ? 'read' : '';
        }
        if (postl.trim () === ';' && /[\}\]]\s*=\s*$/.test (pre) && /I?Dictionary<string,\s*object>/.test (pre)) {
            return 'read';
        }
        // the same object-slot write with the cast already dropped, which the [AST] dict-write
        // rule does for a `request` receiver: the cast named the slot, so its absence proves
        // the declaration is a dictionary and the value is boxed into an `object` entry
        if (postl.trim () === ';' && /request\s*\[[^\]]*\]\s*=\s*$/.test (pre)) {
            return 'read';
        }
        // U25: the `tagVar` shadow written into an object-valued slot the same body declares --
        // an `object` local (`destinationRequest = tagVar;`) or a dictionary's `object` indexer
        // (`transaction["tag"] = tagVar;` where `transaction` is declared `Dictionary<string,
        // object>` / `IDictionary<string, object>` in this method). Either slot boxes the same
        // string reference the `object` spelling boxes.
        if (tagContext !== undefined && postl.trim () === ';') {
            const intoDict = /(?:^|[^\w.])([A-Za-z_]\w*)\s*\[[^\]]*\]\s*=\s*$/.exec (pre);
            if (intoDict !== null && tagContext.dictNames.has (intoDict[1])) {
                return 'read';
            }
            const intoObject = /(?:^|[^\w.])([A-Za-z_]\w*)\s*=\s*$/.exec (pre);
            if (intoObject !== null && tagContext.objectNames.has (intoObject[1])) {
                return 'read';
            }
        }
        if (/[{,]\s*$/.test (pre) && /(?:new List<object>|new object\[\]|new Dictionary<string, object>)\s*\(?\s*\)?\s*\{[^{}]*$/.test (pre)) {
            return 'read';
        }
        if (inDictInit && /^\s*\{\s*"(?:[^"\\]|\\.)*"\s*,\s*$/.test (pre)) {
            return 'read';
        }
        // U57 prints a native `(a + b)` for `add (a, b)`: an operand of the `+` operator reads
        // the alias exactly the way an argument of the helper call did (the operator consumes
        // the value), and the concat only exists where the printer proved the operands strings.
        // Gated on newRules: a `timeframe` copy belongs to campaign unit S04 (contested sites go
        // to the lower unit number), so only the rules already on the base fire for it.
        if (newRules && (/\+\s*$/.test (pre) || /^\s*\+/.test (postl))) {
            return 'read';
        }
        // The same native `+` concat with the printer's parenthesised operand, `... + (alias)` / `(alias) + ...`.
        if (newRules
            && (/\+\s*\(\s*$/.test (pre) && /^\)/.test (postl)
                || /\($/.test (pre) && /^\)\s*\+/.test (postl))) {
            return 'read';
        }

        if (postl.charAt (0) === ',' || postl.charAt (0) === ')') {
            const callee = this.coreArgShadowCallee (line, at);
            if (callee !== null && this.coreArgShadowCalleeAllows (callee[0], line, at, callee[1], newRules)) {
                return 'read';
            }
            return '';
        }
        if (postl.charAt (0) === '}' && /\{\s*"[^"]*"\s*,\s*$/.test (pre)) {
            return 'read';
        }
        return '';
    }

    // U24: the locals this body binds ONLY from `producer` (a `null` init is allowed), i.e. every
    // assignment of the name in the body is the producer or null. The name is what the producer
    // regex captures in group 1.
    coreArgShadowProducerLocals (bodyLines: string[], producer: RegExp): string[] {
        const names: string[] = [];
        for (const line of bodyLines) {
            const m = producer.exec (line);
            if (m !== null && names.indexOf (m[1]) === -1) {
                names.push (m[1]);
            }
        }
        const out: string[] = [];
        for (const name of names) {
            if (this.coreArgShadowOnlyBinds (bodyLines, name, producer)) {
                out.push (name);
            }
        }
        return out;
    }

    coreArgShadowOnlyBinds (bodyLines: string[], name: string, producer: RegExp): boolean {
        const target = new RegExp ('^\\s*(?:I?Dictionary<string, object>\\s+|IList<object>\\s+)?' + name + '\\s*=\\s*(.*)$');
        let seen = false;
        for (const line of bodyLines) {
            const m = target.exec (line);
            if (m === null) {
                continue;
            }
            const rhs = m[1].trim ();
            if (rhs === 'null' || rhs === 'null;') {
                continue;
            }
            if (producer.test (line)) {
                seen = true;
                continue;
            }
            return false;
        }
        return seen;
    }

    // U24: the cast an owned source's copy needs when it is written from `rhs`, or null when
    // `rhs` is not one of the two proven string producers. See CORE_ARG_SHADOW_OWNED_SOURCES
    // for the proof of each shape.
    coreArgShadowWriteCastType (rhs: string, targetType: string, marketRows: string[], holders: string[]): string | null {
        if (targetType !== 'string') {
            return null;
        }
        const row = CORE_ARG_SHADOW_MARKET_ROW_READ_RE.exec (rhs);
        if (row !== null && MARKET_ROW_STRING_KEYS.indexOf (row[2]) !== -1 && marketRows.indexOf (row[1]) !== -1) {
            return 'string';
        }
        // The same read behind the printer's `ContainsKey` guard: both key literals from the table, same row local.
        const guarded = CORE_ARG_SHADOW_MARKET_ROW_COND_RE.exec (rhs);
        if (guarded !== null && guarded[2] === guarded[3] && MARKET_ROW_STRING_KEYS.indexOf (guarded[2]) !== -1 && marketRows.indexOf (guarded[1]) !== -1) {
            return 'string';
        }

        const element = CORE_ARG_SHADOW_ELEMENT0_READ_RE.exec (rhs);
        if (element !== null && holders.indexOf (element[1]) !== -1) {
            return 'string';
        }
        return null;
    }

    // U24: the `alias = <producer>;` write with the `((T)…)` cast its typed declaration needs, or
    // null when the raw line does not carry the shape the analysis proved (a trailing comment, a
    // different print). The caller keeps the declaration `object` on a null.
    coreArgShadowCastWrite (line: string, alias: string, targetType: string, bodyLines: string[]): string | null {
        const m = new RegExp ('^(\\s*)' + alias + '\\s*=\\s*([^;]+?)\\s*;\\s*$').exec (line);
        if (m === null) {
            return null;
        }
        const cast = this.coreArgShadowWriteCastType (m[2].trim (), targetType,
            this.coreArgShadowProducerLocals (bodyLines, CORE_ARG_SHADOW_MARKET_ROW_BIND_RE),
            this.coreArgShadowProducerLocals (bodyLines, CORE_ARG_SHADOW_STRING_ELEMENT0_BIND_RE));
        return cast === null ? null : m[1] + alias + ' = ((' + cast + ')' + m[2].trim () + ');';
    }

    // U65: the `limit` shadow's two admitted write forms (getLimit / integer literal), or null
    // when the RHS is not one of them. `coreArgShadowLimitCastWrite` is the same predicate on a
    // whole line, with the `((T)…)` cast the typed declaration needs; it reproduces the raw line
    // byte-for-byte (a trailing `//` comment included), so the caller can bail out -- and keep
    // the declaration `object` -- whenever the printed line is not the shape the scan proved.
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

    // True when the shadow `alias` (copy of the narrowed parameter, targetType its type) is used
    // only in the proven ways above and is read at least once (a write-only local is CS0219).
    // `newRules` is false for a `timeframe` copy: that shadow belongs to campaign unit S04
    // (contested sites go to the lower unit number), so only the rules already on the base fire.
    // `castCasts` (U24) enables the write forms above and collects the line index of every write
    // that needs the `((T)…)` cast the typed declaration implies; the caller re-inserts it and
    // only then retypes the declaration.
    // `limitCasts` (U65) is the `limit` twin: the `getLimit` read and the integer literals, whose
    // cast is `((Int64?)…)`; only the caller's `source === 'limit'` step offers it.
    coreArgShadowIsProvable (bodyLines: string[], alias: string, targetType: string, methodReturnType: string, skipLine = -1, newRules = true, castCasts?: number[], limitCasts?: number[]): boolean {
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
        // U24: the receivers the write forms below are proven through (only when the caller asks
        // for the casts -- an owned source's copy)
        const castWrites = castCasts !== undefined;
        const marketRows = castWrites ? this.coreArgShadowProducerLocals (lines, CORE_ARG_SHADOW_MARKET_ROW_BIND_RE) : [];
        const stringHolders = castWrites ? this.coreArgShadowProducerLocals (lines, CORE_ARG_SHADOW_STRING_ELEMENT0_BIND_RE) : [];
        const tagContext = CORE_ARG_SHADOW_TAG_ALIASES.indexOf (alias) !== -1 ? this.coreArgShadowTagContext (lines) : undefined;
        // U65: only the `limit` copy offers its write forms (the caller passes the collector);
        // they are re-checked on the RAW line by coreArgShadowLimitCastWrite before anything is
        // retyped, so a line the rewrite cannot reproduce keeps the whole site `object`.
        const limitWrites = limitCasts !== undefined;
        for (let k = 0; k < lines.length; k++) {
            if (k === skipLine) {
                continue;
            }
            const line = lines[k];
            for (const at of this.coreArgShadowOccurrences (line, alias)) {
                const kind = this.coreArgShadowUseKind (line, at, alias, targetType, methodReturnType, dictInits[k], newRules, tagContext);
                if (kind === '') {
                    if (castWrites && line.slice (0, at).trim () === '') {
                        const post = /^\s*=\s*([^;]+?)\s*;\s*$/.exec (line.slice (at + alias.length));
                        if (post !== null && this.coreArgShadowWriteCastType (post[1].trim (), targetType, marketRows, stringHolders) !== null) {
                            castCasts.push (k);
                            continue;
                        }
                    }
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

    // Names the scanned body declares for the U25 `tag` family (see the table above the class
    // fields): element-0 holders of an audited destructuring helper, dictionary locals and plain
    // `object` locals. Body-scoped on purpose -- C# forbids a local from shadowing a parameter,
    // and a name declared with any other type simply never enters the sets.
    coreArgShadowTagContext (lines: string[]): CoreArgShadowTagContext {
        const stringHolders = new Set<string> ();
        const dictNames = new Set<string> ();
        const objectNames = new Set<string> ();
        const holderRe = new RegExp ('^\\s*IList<object> ([A-Za-z_]\\w*) = \\(IList<object>\\)this\\.('
            + CORE_ARG_SHADOW_STRING_ELEMENT0_HELPERS.join ('|') + ')\\s*\\(');
        for (const line of lines) {
            const holder = holderRe.exec (line);
            if (holder !== null) {
                stringHolders.add (holder[1]);
            }
            const dict = /^\s*I?Dictionary<string, object>\s+([A-Za-z_]\w*)\s*=/.exec (line);
            if (dict !== null) {
                dictNames.add (dict[1]);
            }
            const obj = /^\s*object\s+([A-Za-z_]\w*)\s*=/.exec (line);
            if (obj !== null) {
                objectNames.add (obj[1]);
            }
        }
        return { stringHolders, dictNames, objectNames };
    }

    // index of the `//` comment start outside string/char literals, or -1
    coreArgShadowCommentAt (line: string): number {
        let i = 0;
        while (i < line.length) {
            const ch = line[i];
            if (ch === '"' || ch === '\'') {
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
        if (!PARSE_MARKET_PARAM_DICTS.some (name => content.includes (name + '('))) {
            return content;
        }
        const lines = content.split ('\n');
        for (let i = 0; i < lines.length; i++) {
            const sig = PARSE_MARKET_SIG_RE.exec (lines[i]);
            if (sig === null || PARSE_MARKET_PARAM_DICTS.indexOf (sig[5]) === -1) {
                continue;
            }
            lines[i] = lines[i].replace (PARSE_MARKET_PARAM_RE, '$1IDictionary<string, object>$2')
                                 .replace (PARSE_MARKET_PARAM_REQUIRED_RE, '$1IDictionary<string, object>$2');
        }
        return lines.join ('\n');
    }

    // True when every `name = ...` write inside a body is a producer whose C# type is a list the
    // CORE_LIST_ARGS target accepts (IList<object>). The set is the writers the S39 census found
    // tree-wide (build/csharpTranspiler.ts CORE_LIST_ARGS comment); anything else -- a compound
    // assignment, a call, an `object` local -- keeps the old `object` shadow. Comments are
    // stripped first: a body comment such as `// ... if you define symbols = [ 'A/B' ] ...` is
    // prose, not a write (and the shadow's rename pass would rewrite that prose).
    bodyWritesAreListTyped (body: string, name: string): boolean {
        let code = '';
        let i = 0;
        while (i < body.length) {
            const ch = body[i];
            if (ch === '"' || ch === '\'') {
                const start = i;
                i += 1;
                while (i < body.length && body[i] !== ch) {
                    i += body[i] === '\\' ? 2 : 1;
                }
                i += 1;
                code += body.substring (start, i);
                continue;
            }
            if (ch === '/' && body[i + 1] === '/') {
                while (i < body.length && body[i] !== '\n') { i += 1; }
                continue;
            }
            if (ch === '/' && body[i + 1] === '*') {
                const end = body.indexOf ('*/', i + 2);
                i = end === -1 ? body.length : end + 2;
                continue;
            }
            code += ch;
            i += 1;
        }
        const writes = new RegExp ('(?<![\\w.])' + name + '\\s*(?:[+\\-*/%]|\\?\\?)?=(?!=)', 'g');
        let match: RegExpExecArray | null;
        while ((match = writes.exec (code)) !== null) {
            const rhs = code.substring (match.index + match[0].length);
            if (!/^\s*(?:this\.marketSymbols\s*\(|new List<object>|this\.getActiveSymbols\s*\(|this\.symbols\s*[;)])/.test (rhs)) {
                return false;
            }
        }
        return true;
    }

    typeCoreArgs (content: string): string {
        const names = Object.keys (CORE_STRING_ARGS).concat (Object.keys (CORE_NUMERIC_ARGS)).concat (Object.keys (CORE_DICT_ARGS)).concat (Object.keys (CORE_IDICT_ARGS)).concat (Object.keys (CORE_LIST_ARGS));
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
            const positions = this.coreArgTypesAll (methodName);
            if (positions === undefined) {
                continue;
            }
            let bodyStart = i + 1;
            while (bodyStart < lines.length && lines[bodyStart].trim () !== '{') {
                bodyStart++;
            }
            if (bodyStart >= lines.length) {
                continue;
            }
            let bodyEnd = lines.length - 1;
            for (let j = bodyStart + 1; j < lines.length; j++) {
                if (lines[j] === indent + '}') { bodyEnd = j; break; }
            }
            const body = lines.slice (bodyStart + 1, bodyEnd).join ('\n');
            const params = this.splitCsharpParams (plist);
            const shadows: string[] = [];
            const renames: string[][] = [];
            let changed = false;
            for (const posKey of Object.keys (positions)) {
                const pos = Number (posKey);
                const targetType = positions[pos];
                const param = params[pos];
                if (param === undefined || !param.trimStart ().startsWith ('object ')) {
                    continue;
                }
                const paramName = param.split ('=')[0].trim ().split (/\s+/).pop () as string;
                // a body that assigns to the parameter cannot hold the narrowed type (the RHS
                // is `object`), so the body's uses are renamed to an `object` local seeded from
                // the parameter. The PUBLIC parameter keeps its original name and gains the
                // narrowed type — no `<name>Typed` appears in any signature. `ref name` counts
                // as an assignment: the helper mutates in place and needs an `object` slot.
                const reassigned = new RegExp ('(?<![\\w.])' + paramName + '\\s*(?:\\?\\?)?=(?!=)').test (body)
                    || new RegExp ('(?<![\\w.])(?:ref|out)\\s+' + paramName + '(?![\\w])').test (body);
                params[pos] = param.replace ('object ' + paramName, targetType + ' ' + paramName);
                // a list target keeps the parameter's own type when every write already produces
                // that type (see CORE_LIST_ARGS): the body's reads are the same calls either way
                // because every callee position a `symbols` argument lands in takes `object`, so
                // no shadow -- and no renamed body -- is needed for the list itself.
                const listTarget = CORE_LIST_TARGET_TYPES.indexOf (targetType) !== -1;
                if (reassigned && (!listTarget || !this.bodyWritesAreListTyped (body, paramName))) {
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

    // U53: narrows the `object` parameters listed in VENUE_NUMERIC_ARGS to Int64?/double?.
    // Keyed by method name + position (not by venue): C# overrides are invariant on parameter
    // types, so a narrowed base declaration forces every override -- the pass therefore rewrites
    // every declaration of the name at that position in the file it is handed.  Only a parameter
    // whose NAME is one of VENUE_NUMERIC_ARG_NAMES is touched, so a same-name helper that spells
    // the position differently keeps its `object` slot.  A body that assigns to (or refs) the
    // parameter gets the same `object <name>Var = <name>;` shadow `typeCoreArgs` inserts, with the
    // body renamed to it, so the body keeps the object-typed slot it has today.
    typeVenueNumericArgs (content: string): string {
        const names = Object.keys (VENUE_NUMERIC_ARGS);
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
            const positions = VENUE_NUMERIC_ARGS[methodName];
            if (positions === undefined) {
                continue;
            }
            let bodyStart = i + 1;
            while (bodyStart < lines.length && lines[bodyStart].trim () !== '{') {
                bodyStart++;
            }
            if (bodyStart >= lines.length) {
                continue;
            }
            let bodyEnd = lines.length - 1;
            for (let j = bodyStart + 1; j < lines.length; j++) {
                if (lines[j] === indent + '}') { bodyEnd = j; break; }
            }
            const body = lines.slice (bodyStart + 1, bodyEnd).join ('\n');
            const params = this.splitCsharpParams (plist);
            const shadows: string[] = [];
            const renames: string[][] = [];
            let changed = false;
            for (const posKey of Object.keys (positions)) {
                const pos = Number (posKey);
                const targetType = positions[pos];
                const param = params[pos];
                if (param === undefined || !param.trimStart ().startsWith ('object ')) {
                    continue;
                }
                const paramName = param.split ('=')[0].trim ().split (/\s+/).pop () as string;
                if (VENUE_NUMERIC_ARG_NAMES.indexOf (paramName) === -1) {
                    continue;
                }
                const reassigned = new RegExp ('(?<![\\w.])' + paramName + '\\s*(?:\\?\\?)?=(?!=)').test (body)
                    || new RegExp ('(?<![\\w.])(?:ref|out)\\s+' + paramName + '(?![\\w])').test (body);
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

    // Narrows the `object` parameters listed in VENUE_STRING_ARGS[venueKey] to `string?`.
    // The table was produced by campaigns/cs-strict/tools/S45/admit_groups.py, which admits a
    // (venue, name, position) only when
    //   * every call site of `name` at that position in the subtree of the declaring class
    //     passes an argument that is statically `string`/`string?` (the subtree is what C#
    //     resolves the call against: an inherited declaration is narrowed for descendants),
    //   * every declaration of `name` at that position in the override chain is still `object`
    //     (so the narrowed spelling is what C# invariance checks), and
    //   * every use of the parameter inside every body is an identity under `string?`
    //     (`((string)name)`, `((object)name)`, a bare argument at a callee position declared
    //     `object` or stringy with no string overload, a return, an initializer element, an
    //     object-typed value slot) -- unless the body assigns to the parameter, in which case
    //     this pass inserts the same `object <name>Var = <name>;` shadow `typeCoreArgs` uses
    //     and renames the body, so the body keeps the object-typed slot it has today.
    typeVenueStringArgs (content: string, venueKey: string): string {
        // C# overrides are invariant on parameter types: a row on the generated base class
        // (BaseExchange / Exchange / PredictionExchange) retypes the virtual, so every venue
        // override of that name has to take the same spelling or CS0115 — merge the base rows
        // under the venue's own table instead of enumerating each override by hand.
        const table = this.venueStringArgsWithBaseRows (venueKey);
        if (table === undefined) {
            return content;
        }
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
            let bodyStart = i + 1;
            while (bodyStart < lines.length && lines[bodyStart].trim () !== '{') {
                bodyStart++;
            }
            if (bodyStart >= lines.length) {
                continue;
            }
            let bodyEnd = lines.length - 1;
            for (let j = bodyStart + 1; j < lines.length; j++) {
                if (lines[j] === indent + '}') { bodyEnd = j; break; }
            }
            const body = lines.slice (bodyStart + 1, bodyEnd).join ('\n');
            const params = this.splitCsharpParams (plist);
            const shadows: string[] = [];
            const renames: string[][] = [];
            let changed = false;
            for (const pos of positions) {
                const param = params[pos];
                if (param === undefined || !param.trimStart ().startsWith ('object ')) {
                    continue;
                }
                const paramName = param.split ('=')[0].trim ().split (/\s+/).pop () as string;
                const reassigned = new RegExp ('(?<![\\w.])' + paramName + '\\s*(?:\\?\\?)?=(?!=)').test (body);
                params[pos] = param.replace ('object ' + paramName, 'string? ' + paramName);
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

    // Copies of a `typeCoreArgs`-narrowed parameter -- `object symbol2 = symbol;` and the
    // `object nameVar = name;` shadow that pass inserts for a reassigned parameter -- may name the
    // parameter's own type instead: the copy is the same box (Nullable<T> boxes as T, a reference
    // copy stays a reference). Runs after typeCoreArgs so the narrowed signature is visible;
    // coreArgShadowIsProvable then decides from the printed body whether every other use of the
    // local keeps the same overload resolution, box and control flow. Only the declaration line
    // changes -- plus, for the U25 `tagVar` shadow, the `(string)` the destructured seed write
    // needs in the slot (insertCoreArgShadowElementCasts).
    retypeCoreArgCopies (content: string): string {
        if (!/^\s*object \w+ = \w+;/m.test (content)) {
            return content;
        }
        const lines = content.split ('\n');
        const sigRe = /^(\s*)public (async )?(virtual|override) ([\w<>., ?]+) (\w+)\((.*)\)\s*$/;
        for (let i = 0; i < lines.length; i++) {
            const sig = sigRe.exec (lines[i]);
            if (sig === null) {
                continue;
            }
            const [ , indent, , , returnType, , plist ] = sig;
            const types: Record<string, string> = {};
            for (const param of this.splitCsharpParams (plist)) {
                const parts = param.split ('=')[0].trim ().split (/\s+/);
                if (parts.length >= 2) {
                    types[parts[parts.length - 1]] = parts.slice (0, -1).join (' ');
                }
            }
            let bodyStart = i + 1;
            while (bodyStart < lines.length && lines[bodyStart].trim () !== '{') {
                bodyStart++;
            }
            if (bodyStart >= lines.length) {
                continue;
            }
            let bodyEnd = lines.length - 1;
            for (let j = bodyStart + 1; j < lines.length; j++) {
                if (lines[j] === indent + '}') { bodyEnd = j; break; }
            }
            const bodyLines = lines.slice (bodyStart + 1, bodyEnd);
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
                // cs90 U24: the extended (callee / RHS) rules were withheld only from the
                // `timeframe` copy (the S04 ownership gate, a lower-numbered unit in the previous
                // round); this unit owns that copy now, so every source gets them. `castCasts` is
                // offered only for the sources this unit owns, so a sibling copy (`limit` -- U23)
                // keeps its write forms untyped.
                // cs90 U65: that sibling is resolved -- `limitCasts` offers the `getLimit` read +
                // integer-literal write forms (the `((Int64?)...)` cast), keyed on
                // source === 'limit' alone, so no other source's rules move. All-or-nothing per
                // source: a write line the cast insertion cannot reproduce keeps the declaration
                // `object`.
                const owned = CORE_ARG_SHADOW_OWNED_SOURCES.indexOf (source) !== -1;
                const limitOwned = source === CORE_ARG_SHADOW_LIMIT_SOURCE;
                const casts: number[] = [];
                const limitCasts: number[] = [];
                if (this.coreArgShadowIsProvable (bodyLines, alias, type, returnType, k, true, owned ? casts : undefined, limitOwned ? limitCasts : undefined)) {
                    const rewrites: Array<[ number, string ]> = [];
                    let ok = true;
                    for (const li of casts) {
                        const rewritten = this.coreArgShadowCastWrite (bodyLines[li], alias, type, bodyLines);
                        if (rewritten === null) {
                            ok = false;
                            break;
                        }
                        rewrites.push ([ li, rewritten ]);
                    }
                    for (const li of limitCasts) {
                        const rewritten = this.coreArgShadowLimitCastWrite (bodyLines[li], alias, type);
                        if (rewritten === null) {
                            ok = false;
                            break;
                        }
                        rewrites.push ([ li, rewritten ]);
                    }
                    if (ok && rewrites.length === casts.length + limitCasts.length) {
                        bodyLines[k] = dindent + type + ' ' + alias + ' = ' + source + ';';
                        for (const [ li, rewritten ] of rewrites) {
                            bodyLines[li] = rewritten;
                        }
                        // cs90 U25: the `tag` aliases carry element reads of the shadow local
                        // (the withdraw tag core arg), so the string element casts go in after
                        // the write casts above -- both units' passes run on the same body.
                        if (CORE_ARG_SHADOW_TAG_ALIASES.indexOf (alias) !== -1 && type === 'string') {
                            this.insertCoreArgShadowElementCasts (bodyLines, alias);
                        }
                        changed = true;
                    }
                }
            }
            if (changed) {
                for (let k = 0; k < bodyLines.length; k++) {
                    lines[bodyStart + 1 + k] = bodyLines[k];
                }
            }
            i = bodyEnd;
        }
        return lines.join ('\n');
    }

    // `tagVar = tagparametersVariable[0];` -- the destructured write the proof above admitted
    // (CORE_ARG_SHADOW_STRING_ELEMENT0_HELPERS). The retyped `string tagVar` needs the box named
    // in the slot, and `(string)` IS that box: an identity reference conversion, null included.
    // The holder is what scopes the rewrite -- only the audited helper's own holder matches.
    insertCoreArgShadowElementCasts (bodyLines: string[], alias: string) {
        const { stringHolders } = this.coreArgShadowTagContext (bodyLines);
        if (stringHolders.size === 0) {
            return;
        }
        for (let j = 0; j < bodyLines.length; j++) {
            const write = /^(\s*)([A-Za-z_]\w*) = ([A-Za-z_]\w*)\[0\];\s*$/.exec (bodyLines[j]);
            if (write !== null && write[2] === alias && stringHolders.has (write[3])) {
                bodyLines[j] = write[1] + write[2] + ' = (string)' + write[3] + '[0];';
            }
        }
    }

    // cs-strict S01: the two passes the pipeline needs in this order. retypeCoreArgCopies is what
    // gives a narrowed parameter's copy (`object codeVar = code;`) the parameter's own type, and
    // only afterwards can dropRedundantCoreArgCasts prove that a `((string)code)` /
    // `((string)codeVar)` wrap inserted at an earlier stage names what the box already is.
    finalizeCoreArgTypes (content: string): string {
        return this.dropRedundantCoreArgCasts (this.retypeCoreArgCopies (content));
    }

    // ===== cs90 U42: plain identifier copies of typed params / typed locals =====
    // Rules and every rejected sub-case: campaigns/cs90/U42/REPORT.md. The source's type is read
    // off the EMITTED text (the signature line / the local's declaration) -- the printer answers
    // `object` for every parameter at print time, so this proof cannot live in the classifier --
    // and the copy names it only when every other use is an identity by `coreArgShadowUseKind`
    // plus the extra shapes below. Ownership: U23/U24/U25 sources and aliases are skipped.
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
            const params: Record<string, string> = {};
            for (const param of this.splitCsharpParams (plist)) {
                const decl = param.split ('=')[0].trim ().split (/\s+/);
                if (decl.length >= 2) {
                    params[decl[decl.length - 1]] = decl.slice (0, -1).join (' ');
                }
            }
            let bodyEnd = lines.length - 1;
            for (let j = i + 2; j < lines.length; j++) {
                if (lines[j] === indent + '}') { bodyEnd = j; break; }
            }
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
                if (U42_COPY_OWNED_ALIASES.indexOf (alias) !== -1 || U42_COPY_OWNED_SOURCES.indexOf (source) !== -1) {
                    continue;
                }
                const type = declared[source];
                if (type === undefined || U42_COPY_TYPES.indexOf (type) === -1) {
                    continue;
                }
                if (this.u42CopyIsProvable (bodyLines, alias, type, returnType, k, declared)) {
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

    // True when `alias` (declared type `targetType` by retypeIdentifierCopies) is used only in
    // the proven shapes of `coreArgShadowIsProvable` plus this unit's own extensions, and is
    // read at least once (a write-only local is CS0219).
    u42CopyIsProvable (bodyLines: string[], alias: string, targetType: string, methodReturnType: string, skipLine: number, declared: Record<string, string>): boolean {
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
                const kind = this.u42CopyUseKind (line, at, alias, targetType, methodReturnType, dictInits[k], declared);
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

    // One occurrence of a U42 copy: `coreArgShadowUseKind`'s rules for the type it knows (`string?`
    // is the same C# type as `string`), then this unit's extra write / read / callee shapes.
    u42CopyUseKind (line: string, at: number, alias: string, targetType: string, methodReturnType: string, inDictInit: boolean, declared: Record<string, string>): string {
        const bare = (targetType === 'string?') ? 'string' : targetType;
        const known = this.coreArgShadowUseKind (line, at, alias, bare, methodReturnType, inDictInit, true);
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
            if (m !== null && this.u42CopyRhsIsTyped (m[1].trim (), targetType, declared)) {
                return 'write';
            }
            return '';
        }
        const postl = post.replace (/^\s+/, '');
        // `alias.ToString ()`: `object.ToString ()` and `string.ToString ()` are the same virtual
        // call (a null throws either way), so the receiver's static type moves nothing
        if ((targetType === 'string' || targetType === 'string?') && /^\.ToString\s*\(\s*\)/.test (postl)) {
            return 'read';
        }
        if (postl.charAt (0) === ',' || postl.charAt (0) === ')') {
            const callee = this.coreArgShadowCallee (line, at);
            if (callee !== null && U42_COPY_CALLEES.indexOf (callee[0].split ('.').pop () as string) !== -1) {
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
            if (target === 'object' || target === targetType || U42_COPY_WIDENING[targetType + '->' + target] === true) {
                return 'read';
            }
        }
        // `<dict>["key"] = alias;` on a receiver this body declares Dictionary<string, object> /
        // IDictionary<string, object>: the slot is `object`, so the value boxes the same either
        // way (the `coreArgShadowUseKind` rule of the same shape needs the cast spelling in the
        // line, which a typed local does not carry)
        const element = /^(\w+)\s*\[[^\]]*\]\s*=\s*$/.exec (pre.trim ());
        if (element !== null && postl.trim () === ';') {
            const receiver = declared[element[1]];
            if (receiver === 'Dictionary<string, object>' || receiver === 'IDictionary<string, object>') {
                return 'read';
            }
        }
        return '';
    }

    // One arm of a conditional write: a string literal, or a local the method declares with the
    // string box (`string` / `string?`).
    u42StringArmIsTyped (arm: string, declared: Record<string, string>): boolean {
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
    u42CopyRhsIsTyped (rhs: string, targetType: string, declared: Record<string, string>): boolean {
        if (targetType === 'string' || targetType === 'string?') {
            if (this.coreArgShadowRhsIsTyped (rhs, 'string', true)) {
                return true;
            }
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
            if (arms !== null && arms[0].indexOf ('?') !== -1 && this.u42StringArmIsTyped (arms[1], declared)
                && this.u42StringArmIsTyped (arms[2], declared)) {
                return true;
            }
        } else if (targetType === 'double?' || targetType === 'double') {
            if (/^this\.(?:parseNumber|safeNumber)\s*\(/.test (rhs)) {
                return true;
            }
            if (/^-?\d+\.\d*(?:[eE][-+]?\d+)?$/.test (rhs) || /^-?\d+[eE][-+]?\d+$/.test (rhs)) {
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
                if (U42_COPY_WIDENING[source + '->' + targetType] === true) {
                    return true;
                }
            }
        }
        return false;
    }

    // S04: `((string)timeframe)` / `((string)timeframeVar)` names the type the binding already has
    // once `typeCoreArgs` narrowed the `timeframe` parameter to `string` (or the body holds a
    // `string timeframe = ...` local) and `retypeCoreArgCopies` typed the `timeframeVar` shadow the
    // same way. Two producers wrap such a binding anyway: the printer, for a TS `(timeframe as
    // string)`, and castCoreArgCallSites, for the narrowed core positions. Both casts are the
    // identity -- an annotation-only `string?` operand included, `(string)x` and `x` are the same
    // expression for the compiler -- so the cast is dropped. Keyed to the `timeframe` bindings:
    // sibling units own their own names. A name the method declares `object`/`var` keeps its cast
    // (there the cast is load-bearing, and a bare use would rebind `add`, `throw`, ...).
    dropStringTimeframeCasts (content: string): string {
        if (!content.includes ('(string)timeframe')) {
            return content;
        }
        const names = [ 'timeframe', 'timeframeVar' ];
        const lines = content.split ('\n');
        const sigRe = /^(\s*)public (async )?(virtual|override) ([\w<>., ?]+) (\w+)\((.*)\)\s*$/;
        for (let i = 0; i < lines.length; i++) {
            const sig = sigRe.exec (lines[i]);
            if (sig === null) {
                continue;
            }
            const [ , indent, , , , , plist ] = sig;
            let bodyStart = i + 1;
            while (bodyStart < lines.length && lines[bodyStart].trim () !== '{') {
                bodyStart++;
            }
            if (bodyStart >= lines.length) {
                continue;
            }
            let bodyEnd = lines.length - 1;
            for (let j = bodyStart + 1; j < lines.length; j++) {
                if (lines[j] === indent + '}') { bodyEnd = j; break; }
            }
            const bodyLines = lines.slice (bodyStart + 1, bodyEnd);
            if (!bodyLines.some ((line) => line.includes ('(string)timeframe'))) {
                i = bodyEnd;
                continue;
            }
            const declared: Record<string, string> = {};
            for (const param of this.splitCsharpParams (plist)) {
                const parts = param.split ('=')[0].trim ().split (/\s+/);
                if (parts.length >= 2) {
                    declared[parts[parts.length - 1]] = parts.slice (0, -1).join (' ');
                }
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

    // S43 pilot: `..., object parameters = null)` -> `..., Dictionary<string, object> parameters = null)`
    // on the names in PARAMETERS_ARG_TYPED_METHODS. Pure declaration change: the value is a
    // Dictionary on every path (the `??= new Dictionary<string, object>()` entry fix), a Dictionary
    // argument converts to `object` at every use inside the body, and `extend(parameters, ...)` /
    // `omit(parameters, ...)` now bind their dict-receiver overloads, which hand back the same fresh
    // dictionary the object path built (Exchange.Functions.cs / Exchange.Generic.cs) -- no runtime
    // path changes. Runs last in each chain so it sees the final signature text.
    retypeParameterArgs (content: string): string {
        const names = PARAMETERS_ARG_TYPED_METHODS;
        const signature = /^\s+(?:public|protected|private|internal)\s+(?:static\s+)?(?:async\s+)?(?:virtual\s+|override\s+|new\s+)*[^()]+?\s+([A-Za-z_]\w*)\s*\(/;
        const lines = content.split ('\n');
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].indexOf ('object parameters = null)') === -1) {
                continue;
            }
            const match = signature.exec (lines[i]);
            if (match === null || names.indexOf (match[1]) === -1) {
                continue;
            }
            lines[i] = lines[i].replace ('object parameters = null)', 'Dictionary<string, object> parameters = null)');
        }
        return lines.join ('\n');
    }

    // S46: `client` is WebSocketClient by declaration in the ws tree (handler param, or
    // `var client = this.client(url)` — client() returns WebSocketClient), so the ws regexes'
    // ((WebSocketClient)client) / (client as WebSocketClient) wrappers are identity conversions.
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
            let bodyStart = i + 1;
            while (bodyStart < lines.length && lines[bodyStart].trim () !== '{') {
                bodyStart++;
            }
            if (bodyStart >= lines.length) {
                continue;
            }
            let bodyEnd = lines.length - 1;
            for (let j = bodyStart + 1; j < lines.length; j++) {
                if (lines[j] === indent + '}') { bodyEnd = j; break; }
            }
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
            let bodyStart = i + 1;
            while (bodyStart < lines.length && lines[bodyStart].trim () !== '{') {
                bodyStart++;
            }
            if (bodyStart >= lines.length) {
                continue;
            }
            let bodyEnd = lines.length - 1;
            for (let j = bodyStart + 1; j < lines.length; j++) {
                if (lines[j] === indent + '}') { bodyEnd = j; break; }
            }
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

    // true when the `((string)…)` wrap around this argument would only re-name the type the
    // argument already has (CORE_ARG_CAST_EXEMPT_NAMES); the call then compiles unchanged.
    coreArgCastExempt (content: string, at: number, arg: string): boolean {
        if (CORE_ARG_CAST_EXEMPT_NAMES.indexOf (arg) === -1) {
            return false;
        }
        return this.coreArgCastDeclaredType (content, at, arg) === 'string';
    }

    // cs-strict S01: drops the `((string)name)` wrap castCoreArgCallSites left on a `code`/
    // `codeVar` argument that is already exactly `string` at that point -- 619 sites pass a plain
    // `string code = null` parameter, and retypeCoreArgCopies turns `object codeVar = code;` into
    // `string codeVar = code;` only after the wrap was inserted. Same nearest-declaration proof as
    // the insertion pass; the wrap only names what the box already is, so the argument's static
    // type, overload and box are identical without it. Runs after retypeCoreArgCopies.
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
                if (free && this.coreArgCastExempt (content, at, name)) {
                    content = content.slice (0, at) + name + content.slice (at + needle.length);
                    from = at + name.length;
                    continue;
                }
                from = at + needle.length;
            }
        }
        return content;
    }

    // Declared C# type of the bare identifier `ident` at offset `at` of `content`, read off the
    // enclosing generated method's parameter list, falling back to the last local declaration
    // before `at` (C# forbids a local from shadowing a parameter, so the two cannot disagree).
    // Null when the enclosing declaration cannot be resolved -- then the caller keeps the cast.
    coreArgCallSiteDeclaredType (content: string, at: number, ident: string): string | null {
        const lines = content.split ('\n');
        let lineIndex = 0;
        for (let i = 0, off = 0; i < lines.length; i++) {
            if (off + lines[i].length >= at) { lineIndex = i; break; }
            off += lines[i].length + 1;
        }
        const sigRe = /^\s*public (async )?(virtual|override) ([\w<>., ?]+) (\w+)\((.*)\)\s*$/;
        let sig = -1;
        for (let i = lineIndex; i >= 0; i--) {
            if (sigRe.test (lines[i])) { sig = i; break; }
        }
        if (sig === -1) {
            return null;
        }
        const sigMatch = sigRe.exec (lines[sig]) as RegExpExecArray;
        const types: Record<string, string> = {};
        for (const param of this.splitCsharpParams (sigMatch[5])) {
            const parts = param.split ('=')[0].trim ().split (/\s+/);
            if (parts.length >= 2) {
                types[parts[parts.length - 1]] = parts.slice (0, -1).join (' ');
            }
        }
        for (let i = sig + 1; i <= lineIndex; i++) {
            const decl = /^\s*(string|object|Int64\??|double\??|bool\??|I?List<[^>]*>|Dictionary<[^>]*>|[\w.]+)\s+(\w+)\s*(?:=[^=]|;\s*$)/.exec (lines[i]);
            if (decl !== null && decl[2] === ident) {
                types[ident] = decl[1];
            }
        }
        return types[ident] === undefined ? null : types[ident];
    }

    // `((string)x).Split/.ToUpper/.ToLower/.Replace/.Trim/.Length` where `x` IS declared
    // `string`/`string?` in the same method: the cast names the box the value already is, so
    // it is dropped. The ast printer (csharpStringReceiverType) drops it at print time for
    // the locals it and the classifier type; a `typeCoreArgs`-narrowed core parameter and a
    // copy retyped by retypeCoreArgCopies only become visible in the printed text, so those
    // receivers are unboxed here, after both. A name with any other binding in the method
    // (a declaration of another type, a lambda/foreach/catch/for variable) stays cast.
    retypeStringReceiverCasts (content: string): string {
        if (!content.includes ('((string)')) {
            return content;
        }
        const sigRe = /^(\s*)public\s+(?:async\s+|virtual\s+|override\s+)+[\w<>., ?]+\s+\w+\s*\((.*)\)\s*$/;
        const declRe = /^\s*(object|string\??|bool\??|Int64\??|double\??|int\??|long\??|var|byte\[\]|List<[^>]*>|IList<[^>]*>|Dictionary<[^>]*>|IDictionary<[^>]*>|ccxt\.[\w.<>?]+|Future\??|WebSocketClient\??)\s+([A-Za-z_][A-Za-z0-9_]*)\s*=/;
        const lines = content.split ('\n');
        for (let i = 0; i < lines.length; i++) {
            const sig = sigRe.exec (lines[i]);
            if (sig === null) {
                continue;
            }
            let bodyStart = i + 1;
            while (bodyStart < lines.length && lines[bodyStart].trim () !== '{') {
                bodyStart++;
            }
            if (bodyStart >= lines.length) {
                continue;
            }
            let bodyEnd = lines.length - 1;
            for (let j = bodyStart + 1; j < lines.length; j++) {
                if (lines[j] === sig[1] + '}') { bodyEnd = j; break; }
            }
            const candidates = new Set<string> ();
            for (const param of this.splitCsharpParams (sig[2])) {
                const declaredString = /^(string\??)\s+([A-Za-z_][A-Za-z0-9_]*)/.exec (param.trim ());
                if (declaredString !== null) {
                    candidates.add (declaredString[2]);
                }
            }
            const blocked = new Set<string> ();
            for (let j = bodyStart + 1; j < bodyEnd; j++) {
                const declaration = declRe.exec (lines[j]);
                if (declaration === null) {
                    continue;
                }
                if (declaration[1] === 'string' || declaration[1] === 'string?') {
                    candidates.add (declaration[2]);
                } else {
                    blocked.add (declaration[2]);
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
                rewritten = rewritten.replace (new RegExp ('\\(\\(string\\)' + name + '\\)\\.(Split|ToUpper|ToLower|Replace|Trim|Length)\\b', 'g'), name + '.$1');
            }
            if (rewritten !== text) {
                const rewrittenBody = rewritten.split ('\n');
                lines.splice (bodyStart + 1, body.length, ...rewrittenBody);
                i = bodyStart + rewrittenBody.length;
            }
        }
        return lines.join ('\n');
    }

    // `((IDictionary<string,object>)x)` around a PARAMETER whose emitted signature declares a
    // concrete dictionary: the cast only names the box that declaration carries, so it is an
    // identity conversion and the receiver's own indexer/member does the same work. A
    // parameter's type exists nowhere at print time — ccxt prints every parameter `object` and
    // retypes the ones its passes own (typeCoreArgs, retypeParseMarketParams, the ws message
    // handler) — so the proof is read here, from the emitted signature, exactly like the string
    // receivers above. Only casts whose receiver really is the parameter are dropped: a name the
    // body also binds as a non-dictionary (a local, a lambda/foreach/catch variable) is skipped.
    retypeDictReceiverCasts (content: string): string {
        if (!content.includes ('((IDictionary<string,object>)')) {
            return content;
        }
        const sigRe = /^(\s*)public\s+(?:async\s+|virtual\s+|override\s+)+[\w<>., ?]+\s+\w+\s*\((.*)\)\s*$/;
        const declRe = /^\s*(object|string\??|bool\??|Int64\??|double\??|int\??|long\??|var|byte\[\]|List<[^>]*>|IList<[^>]*>|Dictionary<[^>]*>|IDictionary<[^>]*>|ccxt\.[\w.<>?]+|Future\??|WebSocketClient\??)\s+([A-Za-z_][A-Za-z0-9_]*)\s*=/;
        const lines = content.split ('\n');
        for (let i = 0; i < lines.length; i++) {
            const sig = sigRe.exec (lines[i]);
            if (sig === null) {
                continue;
            }
            let bodyStart = i + 1;
            while (bodyStart < lines.length && lines[bodyStart].trim () !== '{') {
                bodyStart++;
            }
            if (bodyStart >= lines.length) {
                continue;
            }
            let bodyEnd = lines.length - 1;
            for (let j = bodyStart + 1; j < lines.length; j++) {
                if (lines[j] === sig[1] + '}') { bodyEnd = j; break; }
            }
            const candidates = new Set<string> ();
            for (const param of this.splitCsharpParams (sig[2])) {
                const declaredDict = /^(Dictionary<string, object>|IDictionary<string, object>)\s+([A-Za-z_][A-Za-z0-9_]*)/.exec (param.trim ());
                if (declaredDict !== null) {
                    candidates.add (declaredDict[2]);
                }
            }
            if (candidates.size === 0) {
                continue;
            }
            const blocked = new Set<string> ();
            for (let j = bodyStart + 1; j < bodyEnd; j++) {
                const declaration = declRe.exec (lines[j]);
                if (declaration === null) {
                    continue;
                }
                if ((declaration[1] !== 'Dictionary<string, object>') && (declaration[1] !== 'IDictionary<string, object>')) {
                    blocked.add (declaration[2]);
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
                rewritten = rewritten.replace (new RegExp ('\\(\\(IDictionary<string,object>\\)' + name + '\\)', 'g'), name);
            }
            if (rewritten !== text) {
                const rewrittenBody = rewritten.split ('\n');
                lines.splice (bodyStart + 1, body.length, ...rewrittenBody);
                i = bodyStart + rewrittenBody.length;
            }
        }
        return lines.join ('\n');
    }

    // the two post-print passes that drop a cast proven by the EMITTED declaration text: the
    // string receivers (S10) and the dictionary receivers above. Independent, one entry point so
    // the pass chains stay a single call
    retypePrintedReceiverCasts (content: string): string {
        return this.retypeStringReceiverCasts (this.retypeDictReceiverCasts (content));
    }

    // `sign()` / `handleErrors()`: retype the SIGNATURE_ARG_TYPES positions on every declaration
    // (the base virtual and all 101 venue overrides — C# overrides are invariant). The body is
    // left byte-identical; a position whose body assigns to the parameter keeps the narrowed
    // declaration because every write is a literal or a `Dictionary<string, object>` producer.
    retypeSignatureArgs (content: string): string {
        const names = Object.keys (SIGNATURE_ARG_TYPES);
        if (!names.some (name => content.includes (' object ' + name + '('))) {
            return content;
        }
        const sigRe = /^(\s*)public (virtual|override) object (sign|handleErrors)\((.*)\)\s*$/;
        const lines = content.split ('\n');
        for (let i = 0; i < lines.length; i++) {
            const sig = sigRe.exec (lines[i]);
            if (sig === null) {
                continue;
            }
            const [ , indent, modifier, methodName, plist ] = sig;
            const positions = SIGNATURE_ARG_TYPES[methodName];
            const params = this.splitCsharpParams (plist);
            let changed = false;
            for (const posKey of Object.keys (positions)) {
                const pos = Number (posKey);
                const param = params[pos];
                if (param === undefined || !param.trimStart ().startsWith ('object ')) {
                    continue;
                }
                const paramName = param.split ('=')[0].trim ().split (/\s+/).pop () as string;
                params[pos] = param.replace ('object ' + paramName, positions[pos] + ' ' + paramName);
                changed = true;
            }
            if (changed) {
                lines[i] = `${indent}public ${modifier} object ${methodName}(${params.join (',')})`;
            }
        }
        return lines.join ('\n');
    }

    // narrowing a core parameter to `string` breaks every intra-core call site that still
    // holds the value in an `object` local, so each such argument gets an explicit
    // `((string)expr)`. The value is a string by contract (the TS signature says so); the
    // cast only makes the existing assumption explicit to the C# compiler.
    castCoreArgCallSites (content: string, receivers = [ 'this.', 'base.' ]): string {
        const allNames = Object.keys (CORE_STRING_ARGS)
            .concat (Object.keys (CORE_NUMERIC_ARGS).filter ((n) => !(n in CORE_STRING_ARGS)))
            .concat (Object.keys (CORE_LIST_ARGS).filter ((n) => !(n in CORE_STRING_ARGS) && !(n in CORE_NUMERIC_ARGS)))
            .concat (Object.keys (SIGNATURE_ARG_TYPES));
        for (const methodName of allNames) {
            const positions = Object.assign ({}, this.coreArgTypes (methodName), SIGNATURE_ARG_TYPES[methodName]);
            for (const receiver of receivers) {
                const needle = receiver + methodName + '(';
                let from = 0;
            for (;;) {
                const at = content.indexOf (needle, from);
                if (at === -1) {
                    break;
                }
                const before = content[at - 1];
                if (before !== undefined && /[\w.]/.test (before)) {
                    from = at + needle.length;
                    continue;
                }
                const open = at + needle.length - 1;
                const close = this.matchingParen (content, open);
                if (close === -1) {
                    from = at + needle.length;
                    continue;
                }
                const args = this.splitCsharpParams (content.substring (open + 1, close));
                let changed = false;
                // content offset of each argument, so the skip below can look up the enclosing scope
                const argOffsets: number[] = [];
                for (let q = 0, off = open + 1; q < args.length; q++) {
                    argOffsets.push (off);
                    off += args[q].length + 1;
                }
                for (const posKey of Object.keys (positions)) {
                    const pos = Number (posKey);
                    const targetType = positions[pos];
                    const arg = args[pos];
                    if (arg === undefined) {
                        continue;
                    }
                    const trimmed = arg.trim ();
                    if (trimmed === '') {
                        continue;
                    }
                    if (targetType === 'string') {
                        if (trimmed.startsWith ('(string)') || trimmed.startsWith ('((string)') || trimmed.startsWith ('"')) {
                            continue;
                        }
                        // the argument already carries the target type: `string symbol` (a
                        // `typeCoreArgs`-narrowed parameter or a `string` local) needs no cast --
                        // the callee receives the identical reference
                        if (CORE_ARG_CALL_SITE_TYPED_IDENTIFIERS.indexOf (trimmed) !== -1
                                && this.coreArgCallSiteDeclaredType (content, argOffsets[pos] + (arg.length - arg.trimStart ().length), trimmed) === 'string') {
                            continue;
                        }
                        args[pos] = '((string)' + trimmed + ')';
                        changed = true;
                        continue;
                    }
                    // a list target adds no wrap: every admitted caller already passes a list,
                    // `this.symbols`, null or nothing (see CORE_LIST_ARGS), and `((IList<object>)x)`
                    // on an `object` argument would be a new runtime type check
                    if (CORE_LIST_TARGET_TYPES.indexOf (targetType) !== -1) {
                        continue;
                    }
                    // reference type (the sign()/handleErrors() dictionaries): the argument is that
                    // dictionary by contract, so an explicit cast only spells the assumption out; a
                    // `new Dictionary<string, object>` literal and a bare `null` already convert
                    if (targetType.endsWith ('Dictionary<string, object>')) {
                        if (trimmed.startsWith ('((' + targetType + ')') || trimmed.startsWith ('(' + targetType + ')')
                            || trimmed.startsWith ('new Dictionary<string, object>') || trimmed === 'null') {
                            continue;
                        }
                        args[pos] = '((' + targetType + ')' + trimmed + ')';
                        changed = true;
                        continue;
                    }
                    // numeric: a direct unbox-cast of a boxed Int32 throws, so convert
                    const helper = (targetType === 'Int64?') ? 'ToInt64Arg'
                        : (targetType === 'Int64') ? 'ToInt64ArgRequired'
                            : (targetType === 'double?') ? 'ToDoubleArg' : 'ToDoubleArgRequired';
                    if (trimmed.startsWith (helper + '(') || trimmed.startsWith ('ccxt.BaseExchange.' + helper + '(')) {
                        continue;
                    }
                    args[pos] = 'ccxt.BaseExchange.' + helper + '(' + trimmed + ')';
                    changed = true;
                }
                const replacement = changed ? needle + args.join (',') + ')' : content.substring (at, close + 1);
                content = content.substring (0, at) + replacement + content.substring (close + 1);
                from = at + replacement.length;
                }
            }
        }
        return content;
    }

    // S03 — drop `((string)x)` when the enclosing method declares `x` as `string`/`string?`.
    //
    // The printer wraps EVERY string-method receiver and every `as string` assertion in
    // `((string)…)` unconditionally (`x.toUpperCase()` always prints `((string)x).ToUpper()`,
    // whatever `x` is — ast-transpiler printAsExpression / printCallExpression), so a site
    // whose operand is already that type keeps a redundant cast. String → string is a
    // reference conversion: null stays null, no unboxing, no overload-resolution change
    // (nullability is not part of a C# signature), so the removal is identity-preserving;
    // the nullable-flow warnings the bare form can raise (CS8602/CS8604) are in
    // ccxt.csproj's NoWarn.
    //
    // Scope is the METHOD: parameters, locals and foreach bindings, one binding per name
    // (C# forbids same-name locals in nested scopes). A name the same method declares with
    // any other type — or with `var`, whose type is unknown here — is left untouched, so
    // the `object` operands keep the cast that unboxes them.
    stripRedundantStringCasts (content: string): string {
        const targets = [ 'type', 'side', 'status', 'id', 'marketId' ];
        const lines = content.split ('\n');
        // A method's region runs from its signature line to the next signature line, so the
        // scan is delimited without counting braces: braces inside comments (`{@link …}`,
        // `// {` example blocks) are not code and a brace count would drift on them. A body
        // never contains a second indent-4 `public|…` `…)` line.
        const sigLines: number[] = [];
        for (let i = 0; i < lines.length; i++) {
            if (this.isCsharpMethodSignature (lines[i])) {
                sigLines.push (i);
            }
        }
        const declRe = new RegExp ('(?:^|[\\s(,])(string\\?|string|object|var|bool\\?|bool|Int64\\?|Int64|double\\?|double|int\\?|int|Dictionary<string, object>|List<object>|IList<object>|IDictionary<string, object>)\\s+(' + targets.join ('|') + ')(?![\\w])\\s*(?==|,|\\))', 'g');
        const foreachRe = new RegExp ('foreach\\s*\\(\\s*([^\\s]+)\\s+(' + targets.join ('|') + ')\\s+in\\b', 'g');
        for (let k = 0; k < sigLines.length; k++) {
            const sig = sigLines[k];
            const start = sig + 1;
            const end = (k + 1 < sigLines.length) ? sigLines[k + 1] : lines.length;
            // declarations are read from the code only: a doc-comment line inside the body
            // (`* @param {string} type …`) must never widen the allowed set
            const body = [];
            for (let j = start; j < end; j++) {
                if (this.isCsharpCommentLine (lines[j])) {
                    continue;
                }
                body.push (lines[j]);
            }
            const text = [ lines[sig] ].concat (body).join ('\n');
            const allowed = new Set ();
            const blocked = new Set ();
            let m;
            while ((m = declRe.exec (text)) !== null) {
                if (m[1] === 'string' || m[1] === 'string?') {
                    allowed.add (m[2]);
                } else {
                    blocked.add (m[2]);
                }
            }
            while ((m = foreachRe.exec (text)) !== null) {
                if (m[1] === 'string' || m[1] === 'string?') {
                    allowed.add (m[2]);
                } else {
                    blocked.add (m[2]);
                }
            }
            const names = [ ...allowed ].filter ((n) => !blocked.has (n));
            if (names.length === 0) {
                continue;
            }
            for (let j = start; j < end; j++) {
                if (this.isCsharpCommentLine (lines[j])) {
                    continue;
                }
                lines[j] = this.dropStringCastsOnLine (lines[j], names);
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
        const commentAt = this.csharpCommentIndex (line);
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
            const close = this.csharpLiteralEnd (code, quote);
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

    // U47 -- `((string)X)` where X's C# static type already IS the cast's target `string`: the
    // wrap is an identity conversion (reference type: `string?` and `string` are one runtime
    // type, nullability is not part of a signature, null stays null, nothing unboxes), so the
    // cast can be dropped without moving the box. Four proven subject families:
    //   * a STRING LITERAL -- its static type is `string` by definition (the printer's
    //     `Remove((string)"k")` / `Replace((string)"%", (string)"")` argument wraps);
    //   * a nested `(string)X` / `((string)X)` -- the inner cast's result type IS `string`;
    //   * `this.<m>(...)` whose declared return type is `string`/`string?` -- read off the
    //     processed content's own declaration of `<m>` (authoritative: a per-venue override
    //     prints its own declaration; a name declared twice with two types is vetoed) or, for a
    //     helper the content does not declare, STRING_PRODUCER_HELPERS above;
    //   * a bare identifier the SAME METHOD declares `string`/`string?` (parameter, local or
    //     `foreach` binding -- S09's region scan, extended from its five target names to every
    //     name). A name the method also declares with any other type, a lambda parameter of that
    //     name, or a `foreach|catch|for|using|fixed` variable of that name vetoes the site.
    // Both printed shapes are handled: the printer's wrapper `((string)X)` (the pair is dropped)
    // and a CALL's paren plus the printer's single cast `f((string)X)` (only the cast token is
    // dropped -- deleting the pair there would eat the call's paren; the two are told apart by
    // the character before the match, exactly as dropStringCasts does).
    dropIdentityStringCasts (content: string): string {
        if (!content.includes ('((string)')) {
            return content;
        }
        const fields = new Set<string> (STRING_PRODUCER_FIELDS);
        // every `public ... <name>(` in the content: the emitted declaration decides the type of
        // a `this.<name>(...)` call. Two declarations that disagree (overloads cannot, but a
        // `new`-hidden twin can) answer `*`, which vetoes the name.
        const declared = new Map<string, string> ();
        const methodRe = /^\s*public\s+(?:static\s+|virtual\s+|override\s+|async\s+|new\s+)*([A-Za-z_][\w<>.,?\[\]]*)\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(/gm;
        let m: RegExpExecArray | null;
        while ((m = methodRe.exec (content)) !== null) {
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
        const lines = content.split ('\n');
        // a method's region runs from its signature line to the next signature line (the S09
        // delimitation -- a brace count would drift on braces inside comments)
        const sigLines: number[] = [];
        for (let i = 0; i < lines.length; i++) {
            if (this.isCsharpMethodSignature (lines[i])) {
                sigLines.push (i);
            }
        }
        for (let k = 0; k < sigLines.length; k++) {
            const sig = sigLines[k];
            const start = sig + 1;
            const end = (k + 1 < sigLines.length) ? sigLines[k + 1] : lines.length;
            const code: string[] = [];
            for (let j = start; j < end; j++) {
                if (this.isCsharpCommentLine (lines[j])) {
                    continue;
                }
                code.push (lines[j]);
            }
            const text = [ lines[sig] ].concat (code).join ('\n');
            const allowed = new Set<string> ();
            const blocked = new Set<string> ();
            const declRe = new RegExp ('(?:^|[\\s(,])(string\\?|string|object|var|bool\\?|bool|Int64\\?|Int64|double\\?|double|int\\?|int|Dictionary<string, object>|IDictionary<string, object>|List<object>|IList<object>|ccxt\\.[\\w.<>?]+|[A-Z][\\w.]*)\\s+([A-Za-z_][A-Za-z0-9_]*)(?![\\w])\\s*(?==|,|\\))', 'g');
            while ((m = declRe.exec (text)) !== null) {
                if ((m[1] === 'string') || (m[1] === 'string?')) {
                    allowed.add (m[2]);
                } else {
                    blocked.add (m[2]);
                }
            }
            const foreachRe = new RegExp ('foreach\\s*\\(\\s*([^\\s]+)\\s+([A-Za-z_][A-Za-z0-9_]*)\\s+in\\b', 'g');
            while ((m = foreachRe.exec (text)) !== null) {
                if ((m[1] === 'string') || (m[1] === 'string?')) {
                    allowed.add (m[2]);
                } else {
                    blocked.add (m[2]);
                }
            }
            const body = lines.slice (start, end).join ('\n');
            const veto = (name: string): boolean => {
                if (blocked.has (name)) {
                    return true;
                }
                // a lambda parameter of that name would shadow the binding (`x => ...` and `(a, x) => ...`)
                if (new RegExp ('\\b' + name + '\\b\\s*=>').test (body)) {
                    return true;
                }
                if (new RegExp ('\\([^()]*\\b' + name + '\\b[^()]*\\)\\s*=>').test (body)) {
                    return true;
                }
                if (new RegExp ('(?:\\bforeach|\\bcatch|\\bfor|\\busing|\\bfixed)\\s*\\([^)]*\\b' + name + '\\b').test (body)) {
                    return true;
                }
                return false;
            };
            for (let j = start; j < end; j++) {
                if (this.isCsharpCommentLine (lines[j])) {
                    continue;
                }
                lines[j] = this.dropIdentityStringCastsOnLine (lines[j], allowed, veto, stringProducer, fields);
            }
        }
        return lines.join ('\n');
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
            const commentAt = this.csharpCommentIndex (out);
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

    // index of the `(` matching the `)` at `close` (the input is masked, so no literal can hide a
    // paren), or -1 when the group is unbalanced
    matchingParenBackwards (masked: string, close: number): number {
        let depth = 0;
        for (let i = close; i >= 0; i--) {
            const ch = masked[i];
            if (ch === ')') {
                depth++;
            } else if (ch === '(') {
                depth--;
                if (depth === 0) {
                    return i;
                }
            }
        }
        return -1;
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
            const group = this.matchingParenBackwards (masked, at - 1);
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
        if ((masked[term] !== ')') || (this.matchingParen (masked, at) !== term)) {
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

    // index of the `"` closing the literal opened at `open` (both indices exclusive of the
    // closing quote position; returns line.length when unterminated)
    csharpLiteralEnd (line: string, open: number): number {
        let i = open + 1;
        while (i < line.length) {
            if (line[i] === '\\') {
                i += 2;
                continue;
            }
            if (line[i] === '"') {
                return i + 1;
            }
            i++;
        }
        return line.length;
    }

    // index of the `//` that starts a comment outside a string literal, or -1
    csharpCommentIndex (line: string): number {
        let i = 0;
        while (i < line.length) {
            const ch = line[i];
            if (ch === '"') {
                i = this.csharpLiteralEnd (line, i);
                continue;
            }
            if (ch === '/' && line[i + 1] === '/') {
                return i;
            }
            i++;
        }
        return -1;
    }

    // S10: `((string)X)` where X's C# static type already IS the cast's own target
    // `string` — the wrap is an identity, so it can be dropped without moving the box.
    // Only three subject families qualify, each proven against its C# declaration:
    //   * a STRING LITERAL (`"…"`): its static type is `string` by definition. The
    //     printer's string-method rewrites wrap the literal arguments
    //     (`Split(new [] {((string)"-")}, …)`, `StartsWith(((string)"https://"))`,
    //     `Replace((string)" ", (string)"")`, `throw new X ((string)"…")`).
    //   * this.numberToString (cs/ccxt/base/Exchange.Number.cs
    //     `public virtual string numberToString(object number)`), this.json
    //     (Exchange.Functions.cs `public string json(object obj)`), this.intToBase16 and
    //     this.urlencode (Exchange.Encode.cs `public string …`) — every one declares the
    //     non-nullable `string` the `as string` assertion in ts/src asks for.
    //   * the Precise.string* statics (Exchange.Precise.cs, every one
    //     `static public string …`).
    // Everything else keeps its cast: a `string?` producer (amountToPrecision, parseUnits,
    // customUrlencode, …) is NOT the cast's target, an `object` local/parameter is not
    // either, and the `((string)this.secret).Length`-style string-method RECEIVER casts
    // (the S09 family) are not touched here.
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
                    const close = this.matchingParen (content, open);
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
            if (this.matchingParen (content, at) !== end - 1) {
                out += content.substring (i, at + 9);
                i = at + 9;
                continue;
            }
            out += content.substring (i, at) + content.substring (at + 9, end - 1);
            i = end;
        }
        return out;
    }

    // S15: `getArrayLength(x)` is the printer's wrapper for a TS `.length` and
    // `((IList<object>)x).ToArray()/.First()/.Last()` its cast around a Linq call. Once the
    // receiver's own C# declaration in the same method is a List<>/IList<>, both are the list's
    // own member: `x.Count` and the cast-less Linq call. A nullable receiver keeps the helper's
    // null->0 with `x?.Count ?? 0`; an `object` receiver keeps the helper and the cast untouched.
    nativeListHelperCalls (content: string): string {
        content = this.csharpOrderbookCacheCasts (content);
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

    csharpMatching (text: string, open: number): number {
        let depth = 0;
        for (let i = open; i < text.length; i++) {
            const ch = text[i];
            if ((ch === '(') || (ch === '[') || (ch === '{')) {
                depth++;
            } else if ((ch === ')') || (ch === ']') || (ch === '}')) {
                depth--;
                if (depth === 0) {
                    return i;
                }
            }
        }
        return -1;
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
            const close = this.csharpMatching (signature, open);
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
            const close = this.csharpMatching (text, open);
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

    // U48: drop the identity `((IList<object>)x)` cast for a receiver the enclosing method declares
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
        const masked = this.maskCsharpLiterals (region);
        let out = '';
        let cursor = 0;
        let match: RegExpExecArray | null;
        CSHARP_IDENTITY_LIST_CAST.lastIndex = 0;
        while ((match = CSHARP_IDENTITY_LIST_CAST.exec (region)) !== null) {
            const at = match.index;
            if (masked[at] !== region[at]) {
                continue; // inside a literal or a comment
            }
            if ((at > 0) && /[\w.]/.test (region[at - 1])) {
                continue; // tail of a longer name
            }
            if (!names.has (match[1])) {
                continue;
            }
            out += region.substring (cursor, at) + match[1] + match[2];
            cursor = at + match[0].length;
        }
        if (cursor === 0) {
            return region;
        }
        out += region.substring (cursor);
        return out;
    }

    // U48: `((IList<object>)(x as ccxt.pro.OrderBook).cache).Add(v)` — `cache` is declared
    // `IList<object>` on the hand-written ws cache (cs/ccxt/ws/OrderBook.cs:22/:33), so the cast
    // (and the printer's doubly-cast spelling of it) is an identity conversion on the member read.
    csharpOrderbookCacheCasts (content: string): string {
        const masked = this.maskCsharpLiterals (content);
        let out = '';
        let cursor = 0;
        let match: RegExpExecArray | null;
        CSHARP_ORDERBOOK_CACHE_CAST.lastIndex = 0;
        while ((match = CSHARP_ORDERBOOK_CACHE_CAST.exec (content)) !== null) {
            const at = match.index;
            if (masked[at] !== content[at]) {
                continue; // inside a literal or a comment
            }
            out += content.substring (cursor, at) + '(' + match[1] + ' as ccxt.pro.OrderBook).cache.Add(';
            cursor = at + match[0].length;
        }
        if (cursor === 0) {
            return content;
        }
        out += content.substring (cursor);
        return out;
    }

    // U48: the static C# type of a destructuring holder (`var <name> = <initializer>`) — the return
    // type the SAME file declares for `this.<method>` (the awaited `Task<T>` result under `await`),
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
            const type = awaited ? this.csharpAwaitedType (declared) : declared;
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

    // the static type of `await expr` for an expression declared `Task<T>` (undefined otherwise)
    csharpAwaitedType (declared: string): string | undefined {
        const m = /^Task<(.+)>$/.exec (declared.trim ());
        return (m === null) ? undefined : m[1].trim ();
    }

    // U48: the destructuring holders of one method region whose static type is a list. A name the
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

    // U48: method name -> declared return type, from the emitted signatures of ONE file. A name the
    // file declares twice with different return types (an overload family) answers nothing.
    csharpFileReturnTypes (maskedLines: string[]): Map<string, string> {
        const found = new Map<string, string | null> ();
        for (const line of maskedLines) {
            if (!CSHARP_MEMBER_SIGNATURE.test (line) || (line.indexOf ('(') < 0)) {
                continue;
            }
            const m = /^\s*(?:public|private|protected|internal)\s+(?:(?:static|virtual|async|override|new|sealed|partial)\s+)*([A-Za-z_][\w<>,?.\[\]]*)\s+([A-Za-z_]\w*)\s*\(/.exec (line);
            if (m === null) {
                continue;
            }
            if (found.has (m[2])) {
                if (found.get (m[2]) !== m[1]) {
                    found.set (m[2], null);
                }
            } else {
                found.set (m[2], m[1]);
            }
        }
        const out = new Map<string, string> ();
        for (const [ name, type ] of found) {
            if (type !== null) {
                out.set (name, type);
            }
        }
        return out;
    }

    // S40: top-level comma split of an emitted argument list, with each argument kept as its
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

    // S40: see WS_HANDLER_DICT_MESSAGE.  Retypes this venue's admitted ws handler parameters
    // and wraps the arguments the retype leaves statically `object`.  Self-gating: a handler
    // with a call site the pass cannot name stays `object` whole.
    retypeWsHandlerMessages (content: string): string {
        const venueMatch = /public partial class (\w+)\s*:/.exec (content);
        if (venueMatch === null) {
            return content;
        }
        const names = WS_HANDLER_DICT_MESSAGE[venueMatch[1]];
        if (names === undefined) {
            return content;
        }
        const membership = new Set (names);
        const sigRe = /^ {4}(?:public|protected|private|internal)[^\n]*?\b(\w+)\s*\(([^()]*)\)\s*$/gm;
        const sigs: { at: number, name: string }[] = [];
        let signature;
        while ((signature = sigRe.exec (content)) !== null) {
            sigs.push ({ at: signature.index, name: signature[1] });
        }
        const enclosingName = (at: number) => {
            let found = '';
            for (const sig of sigs) {
                if (sig.at >= at) {
                    break;
                }
                found = sig.name;
            }
            return found;
        };
        const declarations: { index: number, text: string, param: string }[] = [];
        const declRe = /^(\s*)(public|protected)((?:\s+(?:static|virtual|override|async|partial))*)\s+(?:[\w<>?,\[\] .]+?)\s+(\w+)\s*\(\s*WebSocketClient\s+client\s*,\s*object\s+([A-Za-z_]\w*)/gm;
        let decl;
        while ((decl = declRe.exec (content)) !== null) {
            if (membership.has (decl[4])) {
                declarations.push ({ index: decl.index, text: decl[0], param: decl[5] });
            }
        }
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
            let call;
            while ((call = callRe.exec (content)) !== null) {
                if (call[1] !== name) {
                    continue;
                }
                const open = call.index + call[0].length - 1;
                const close = this.matchingParen (content, open);
                if (close === -1) {
                    continue;
                }
                const lineStart = content.lastIndexOf ('\n', call.index) + 1;
                const trimmed = content.substring (lineStart, content.indexOf ('\n', call.index)).trim ();
                if (trimmed.startsWith ('//') || trimmed.startsWith ('*') || lineStart === declLineStart) {
                    continue;
                }
                const spans = this.wsArgSpans (content, open + 1, close);
                if (spans.length < 2) {
                    continue;
                }
                const arg = spans[1].text.trim ();
                if (arg.startsWith ('(Dictionary<string, object>)') || arg.startsWith ('(IDictionary<string, object>)')) {
                    continue;
                }
                const offset = open + 1 + spans[1].start;
                const raw = spans[1].text;
                const pad = raw.substring (0, raw.length - raw.trimStart ().length);
                sites.push ({ start: offset, end: offset + raw.length, arg, pad, chain: membership.has (enclosingName (call.index)) });
            }
            if (sites.some (site => !site.chain && !/^[A-Za-z_]\w*$/.test (site.arg))) {
                continue;
            }
            edits.push ({ start: declaration.index + rel, end: declaration.index + rel + needle.length, text: 'Dictionary<string, object> ' + declaration.param });
            for (const site of sites) {
                if (site.chain) {
                    continue;
                }
                edits.push ({ start: site.start, end: site.end, text: site.pad + '(Dictionary<string, object>)' + site.arg });
            }
        }
        edits.sort ((a, b) => b.start - a.start);
        for (const edit of edits) {
            content = content.substring (0, edit.start) + edit.text + content.substring (edit.end);
        }
        return content;
    }
    // U52: see WS_HANDLER_IDICT_MESSAGE.  Retypes this venue's admitted ws handler parameters to
    // the interface spelling and edits NO call site -- every direct call already passes a
    // statically dict-typed value, which the interface parameter accepts unchanged.  Self-gating:
    // a handler with a call the gate cannot clear stays `object` whole.
    retypeWsHandlerMessagesToInterface (content: string): string {
        const venueMatch = /public partial class (\w+)\s*:/.exec (content);
        if (venueMatch === null) {
            return content;
        }
        const names = WS_HANDLER_IDICT_MESSAGE[venueMatch[1]];
        if (names === undefined) {
            return content;
        }
        const membership = new Set (names);
        const sigRe = /^ {4}(?:public|protected|private|internal)[^\n]*?\b(\w+)\s*\(([^()]*)\)\s*$/gm;
        const sigs: { at: number, name: string }[] = [];
        let signature;
        while ((signature = sigRe.exec (content)) !== null) {
            sigs.push ({ at: signature.index, name: signature[1] });
        }
        const enclosingName = (at: number) => {
            let found = '';
            for (const sig of sigs) {
                if (sig.at >= at) {
                    break;
                }
                found = sig.name;
            }
            return found;
        };
        // does the method enclosing `at` declare `name` with a dict type?  (a local, a parameter,
        // or a value an earlier pass already asserted to the concrete spelling)
        const dictTypedInMethod = (at: number, name: string) => {
            let start = 0;
            let end = content.length;
            for (const sig of sigs) {
                if (sig.at < at) {
                    start = sig.at;
                } else {
                    end = sig.at;
                    break;
                }
            }
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
        const declRe = /^(\s*)(public|protected)((?:\s+(?:static|virtual|override|async|partial))*)\s+(?:[\w<>?,\[\] .]+?)\s+(\w+)\s*\(\s*WebSocketClient\s+client\s*,\s*object\s+([A-Za-z_]\w*)/gm;
        const declarations: { index: number, text: string, param: string }[] = [];
        let decl;
        while ((decl = declRe.exec (content)) !== null) {
            if (membership.has (decl[4])) {
                declarations.push ({ index: decl.index, text: decl[0], param: decl[5] });
            }
        }
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
            let clear = true;
            let call;
            while ((call = callRe.exec (content)) !== null) {
                if (call[1] !== name) {
                    continue;
                }
                const open = call.index + call[0].length - 1;
                const close = this.matchingParen (content, open);
                if (close === -1) {
                    clear = false;
                    break;
                }
                const lineStart = content.lastIndexOf ('\n', call.index) + 1;
                const trimmed = content.substring (lineStart, content.indexOf ('\n', call.index)).trim ();
                if (trimmed.startsWith ('//') || trimmed.startsWith ('*') || lineStart === declLineStart) {
                    continue;
                }
                const spans = this.wsArgSpans (content, open + 1, close);
                if (spans.length < 2) {
                    clear = false;
                    break;
                }
                const arg = spans[1].text.trim ();
                if (arg.startsWith ('(Dictionary<string, object>)') || arg.startsWith ('(IDictionary<string, object>)')) {
                    continue;
                }
                if (!/^[A-Za-z_]\w*$/.test (arg)) {
                    clear = false;
                    break;
                }
                if (membership.has (enclosingName (call.index))) {
                    continue;
                }
                if (!dictTypedInMethod (call.index, arg)) {
                    clear = false;
                    break;
                }
            }
            if (!clear) {
                continue;
            }
            edits.push ({ start: declaration.index + rel, end: declaration.index + rel + needle.length, text: 'IDictionary<string, object> ' + declaration.param });
        }
        edits.sort ((a, b) => b.start - a.start);
        for (const edit of edits) {
            content = content.substring (0, edit.start) + edit.text + content.substring (edit.end);
        }
        return content;
    }
    // index of the `)` closing the `(` at `open`, skipping string literals and comments
    matchingParen (text: string, open: number): number {
        let depth = 0;
        for (let i = open; i < text.length; i++) {
            const ch = text[i];
            if (ch === '"') {
                i++;
                while (i < text.length && text[i] !== '"') {
                    if (text[i] === '\\') {
                        i++;
                    }
                    i++;
                }
                continue;
            }
            if (ch === '/' && text[i + 1] === '/') {
                while (i < text.length && text[i] !== '\n') {
                    i++;
                }
                continue;
            }
            if (ch === '(') {
                depth++;
            } else if (ch === ')') {
                depth--;
                if (depth === 0) {
                    return i;
                }
            }
        }
        return -1;
    }

    // top-level comma split of a C# parameter/argument list. Skips string and char
    // literals, whose embedded commas would otherwise shift every later position.
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

    unwrapTaskIfNeeded(type: string): string {
        return type.startsWith('Task<') && type.endsWith('>') ? type.substring(5, type.length - 1) : type;
    }

    unwrapListIfNeeded(type: string): string {
        return type.startsWith('List<') && type.endsWith('>') ? type.substring(5, type.length - 1) : type;
    }

    unwrapDictionaryIfNeeded(type: string): string {
        return type.startsWith('Dictionary<string,') && type.endsWith('>') ? type.substring(19, type.length - 1) : type;
    }

    // -------------------------------------------------------------------------------------------
    // S20 — the redundant `((object)…)` boxes. Two shapes are removed:
    //   F1 `((object)X).ToString()` -> `X.ToString()`  (ast printToStringCall emits the box for
    //      every `<x>.toString ()` because it cannot know x's static type)
    //   F2 `object N = ((object)X);` -> `object N = X;`  (the target is already `object`, so the
    //      cast is an identity conversion — reference upcast or box — and pure noise)
    // The F1 box is load-bearing for exactly ONE static type: a nullable value type, where
    // `((object)x)` is a null box while `x.ToString ()` is "" (Nullable<T>.ToString). For every
    // other type the two spellings are identical: a non-nullable value type boxes to itself, a
    // reference type is unaffected, and a null receiver throws NullReferenceException either way.
    // So the cast goes only where the receiver's static type is provable from THIS file:
    //   * `this.X (`/`base.X (` -> the file's own declaration of X (every declaration of that name
    //     must be safe), else the hand-written base table below (proof: file:line);
    //   * a bare identifier -> the enclosing method's parameters/locals/foreach|for variables,
    //     else this file's fields; a use with no declaration in method or file is a base member
    //     this pass cannot see and is left alone;
    //   * `(T)x` with T a scalar keyword names its own type; a literal is safe.
    // Rejected (cast kept): nullable value types, `var`, unprovable/not-file-local types, a name
    // that is a lambda parameter anywhere in the file, and a name carrying a declaration-shaped
    // prefix this pass cannot type (tuple / unknown spelling), so a declaration it misses can
    // never resolve to a wrong type.
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
        const varDecl = /^\s+var\s+(\w+)\s*=\s*[^=]/;
        const fieldDecl = /^\s*(?:private|protected|public|internal)\s+(?:static\s+|readonly\s+|new\s+)*([\w<>,?\[\].]+(?:<[^>]*>)?)\s+(\w+)\s*[;=]/;
        const foreachDecl = /foreach\s*\(\s*([\w<>,?\[\].]+(?:<[^>]*>)?)\s+(\w+)\s+in\s/;
        const forDecl = /for\s*\(\s*([\w<>,?\[\].]+)\s+(\w+)\s*=/;
        const declPrefix = /(?:^|\s)(\([^()]*\)|[A-Za-z_][\w<>?\[\].]*)\s+(\w+)\s*(?:=|;|\)|,)/g;
        const lambdaArrow = /\(([^()]*)\)\s*=>/g;
        const lambdaBare = /(?:^|[^\w>.,])(\w+)\s*=>/g;
        const spaceSplit = /\s+/;
        const methodTypes = new Map<string, Set<string>> ();
        const fieldTypes = new Map<string, Set<string>> ();
        const lambdaNames = new Set<string> ();
        const unparsedNames = new Set<string> ();
        const addType = (map: Map<string, Set<string>>, name: string, type: string) => {
            const set = map.get (name) ?? new Set<string> ();
            set.add (type);
            map.set (name, set);
        };
        const safeType = (types: Set<string> | undefined): string | undefined => {
            if (types === undefined || types.size === 0) {
                return undefined;
            }
            for (const type of types) {
                if (type === 'var' || valueNullable.has (type)) {
                    return undefined;
                }
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
                let text = line;
                let j = i;
                while (open >= 0 && this.matchingParen (text, open) < 0 && j + 1 < lines.length) {
                    j++;
                    text += ' ' + lines[j].trim ();
                }
                addType (methodTypes, method[2], method[1].trim ());
                scope = { params: new Map<string, Set<string>> (), locals: new Map<string, Set<string>> () };
                if (open >= 0) {
                    const close = this.matchingParen (text, open);
                    if (close > open) {
                        for (const parts of paramTypes (text.substring (open + 1, close))) {
                            const type = parts.slice (0, parts.length - 1).join (' ')
                                .replace (/^(?:ref|out|params|this)\s+/, '');
                            addType (scope.params, parts[parts.length - 1], type);
                        }
                    }
                }
                for (let k = i; k <= j && k < lines.length; k++) {
                    scopes[k] = scope;
                }
            } else if (indent <= 4) {
                const trimmed = line.trim ();
                if (trimmed !== '' && '{})]'.indexOf (trimmed[0]) < 0
                        && !trimmed.startsWith ('//') && !trimmed.startsWith ('#')) {
                    scope = undefined;
                    const field = fieldDecl.exec (line);
                    if (field !== null) {
                        addType (fieldTypes, field[2], field[1]);
                    }
                }
            }
            if (scope !== undefined && method === null) {
                scopes[i] = scope;
                const local = localDecl.exec (line);
                if (local !== null) {
                    addType (scope.locals, local[2], local[1]);
                }
                const variable = varDecl.exec (line);
                if (variable !== null) {
                    addType (scope.locals, variable[1], 'var');
                }
                const each = foreachDecl.exec (line);
                if (each !== null) {
                    addType (scope.locals, each[2], each[1]);
                }
                const loop = forDecl.exec (line);
                if (loop !== null) {
                    addType (scope.locals, loop[2], loop[1]);
                }
            }
            // comment text ("* @param {string} tag ... payment id") is not code: it must neither
            // declare a type for the audit nor poison a name
            const codeOnly = line.trimStart ();
            const skipLine = codeOnly.startsWith ('*') || codeOnly.startsWith ('//') || codeOnly.startsWith ('/*');
            declPrefix.lastIndex = 0;
            let prefix = skipLine ? null : declPrefix.exec (line);
            while (prefix !== null) {
                const kind = prefix[1];
                const name = prefix[2];
                if (!keywords.has (name) && !keywords.has (kind)) {
                    if (scalars.has (kind) || /^[A-Z][\w<>,?\[\]]*$/.test (kind)) {
                        if (scope !== undefined && method === null) {
                            addType (scope.locals, name, kind);
                        }
                        addType (fieldTypes, name, kind);
                    } else {
                        unparsedNames.add (name);
                    }
                }
                prefix = declPrefix.exec (line);
            }
            lambdaArrow.lastIndex = 0;
            let lambda = skipLine ? null : lambdaArrow.exec (line);
            while (lambda !== null) {
                for (const parts of paramTypes (lambda[1])) {
                    lambdaNames.add (parts[parts.length - 1]);
                }
                lambda = lambdaArrow.exec (line);
            }
            lambdaBare.lastIndex = 0;
            lambda = skipLine ? null : lambdaBare.exec (line);
            while (lambda !== null) {
                lambdaNames.add (lambda[1]);
                lambda = lambdaBare.exec (line);
            }
        }
        // ---- receiver -> static type, or undefined when the file cannot prove it
        const receiverType = (operand: string, lineScope: BoxScope | undefined): string | undefined => {
            const scopeHas = (name: string): Set<string> | undefined => {
                if (lineScope === undefined) {
                    return undefined;
                }
                const types = new Set<string> ();
                const params = lineScope.params.get (name);
                const locals = lineScope.locals.get (name);
                if (params === undefined && locals === undefined) {
                    return undefined;
                }
                for (const type of params ?? []) {
                    types.add (type);
                }
                for (const type of locals ?? []) {
                    types.add (type);
                }
                return types;
            };
            let text = operand.trim ();
            while (text.startsWith ('(') && this.matchingParen (text, 0) === text.length - 1) {
                text = text.substring (1, text.length - 1).trim ();
            }
            const cast = /^\((string|bool|Int64|double|int|object)\)([\s\S]+)$/.exec (text);
            if (cast !== null) {
                return cast[1];
            }
            if (/^[\d"\-]/.test (text) || text === 'true' || text === 'false') {
                return 'literal';
            }
            const memberCall = /^(?:this|base)\.(\w+)\s*\(/.exec (text);
            if (memberCall !== null) {
                const own = methodTypes.get (memberCall[1]);
                return own !== undefined && own.size > 0 ? safeType (own) : baseReturnTypes[memberCall[1]];
            }
            const bareCall = /^(\w+)\s*\(/.exec (text);
            if (bareCall !== null) {
                const name = bareCall[1];
                if (scopeHas (name) === undefined && !fieldTypes.has (name)) {
                    const own = methodTypes.get (name);
                    return own !== undefined && own.size > 0 ? safeType (own) : baseReturnTypes[name];
                }
                return undefined;
            }
            const identifier = /^([\w.]+)$/.exec (text);
            if (identifier !== null) {
                const name = identifier[1].split ('.').pop () as string;
                if (lambdaNames.has (name) || unparsedNames.has (name)) {
                    return undefined;
                }
                const own = scopeHas (name);
                if (own !== undefined) {
                    return safeType (own);
                }
                return fieldTypes.has (name) ? safeType (fieldTypes.get (name)) : undefined;
            }
            return undefined;
        };
        // ---- rewrite
        const sites: number[] = [];
        const output = lines.map ((line: string, index: number) => {
            const declaration = /^(\s*object\s+[A-Za-z_]\w*\s*=\s*)\(\(object\)/.exec (line);
            if (declaration !== null) {
                const open = declaration[1].length;
                const close = this.matchingParen (line, open);
                if (close > 0 && line.substring (close + 1).trim () === ';') {
                    return declaration[1] + line.substring (open + 9, close) + ';';
                }
            }
            sites.length = 0;
            for (const at of this.objectBoxSites (line)) {
                sites.push (at);
            }
            let out = line;
            for (let k = sites.length - 1; k >= 0; k--) {
                const at = sites[k];
                const close = this.matchingParen (out, at);
                if (close < 0) {
                    continue;
                }
                const before = out.substring (0, at);
                const operand = out.substring (at + 9, close);
                const after = out.substring (close + 1);
                if (/\(\([\w<>,?\[\]. ]+\)$/.test (before) || !after.startsWith ('.ToString()')) {
                    continue;
                }
                if (receiverType (operand, scopes[index]) === undefined) {
                    continue;
                }
                out = before + operand + after;
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

    createReturnStatement(methodName: string,  unwrappedType:string ) {
        // typed cores already return the struct/list (see typeCores), so the wrapper no longer
        // re-materialises it — it just forwards the typed core result
        if (this.typedCoreType (methodName, this.isPrediction) !== '') {
            return `return res;`;
        }
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

    inden(level: number) {
        return '    '.repeat(level);
    }

    createWrapper (exchangeName: string, methodWrapper: any, isWs = false) {
        // the PascalCase core IS the public C# API. Method wrappers (cast-only and
        // converting) have been retired; only the `class Binance : binance` aliases
        // remain, emitted by createExchangesWrappers / needsCapitalizedClass.
        return '';
        // non-async methods with a declared Promise<T> return type (pure delegators) must be wrapped like async ones
        const isAsync = methodWrapper.async || (methodWrapper.returnType ?? '').startsWith ('Promise');
        const methodName = methodWrapper.name;
        if (!this.shouldCreateWrapper(methodName, isWs)) {
            return ''; // skip aux methods like encodeUrl, parseOrder, etc
        }
        const methodNameCapitalized = methodName.charAt(0).toUpperCase() + methodName.slice(1);
        // a typed core is emitted PascalCase (pascalizeTypedCores), so it already *is* the public
        // API — a wrapper here would be a duplicate declaration of the same name
        if (isAsync && this.typedCoreType (methodName, this.isPrediction, exchangeName) !== '') {
            return '';
        }
        const returnType = this.convertJavascriptTypeToCsharpType(methodName, methodWrapper.returnType, true);
        const unwrappedType = this.unwrapTaskIfNeeded(returnType as string);
        // a typed core's wrapper is `return res;`, so the wrapper's own return type must be the
        // exact type the core emits — unqualified `OrderBook` binds to ccxt.pro.OrderBook here
        const typedCore = this.typedCoreType (methodName, this.isPrediction, exchangeName);
        const wrapperReturnType = (typedCore !== '' && isAsync) ? `Task<${this.qualifyTypedCoreType (typedCore)}>` : returnType;
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
            `${one}public ${isAsync ? 'async ' : ''}${wrapperReturnType} ${methodNameCapitalized}(${stringArgs})`,
            `${one}{`,
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
        const errorHierarchyPath = __dirname + '/.' + errorHierarchyFilename

        if (skipUpToDateStage ('csharp', 'error hierarchy', force, [ errorHierarchyFilename ], [ ERRORS_FILE ])) {
            return;
        }

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

    // `this.orders` / `this.myTrades` are declared `ccxt.pro.ArrayCache` and the locals
    // initialised from their reads print the same type (build/csharp-local-types.js#
    // CSHARP_LOCAL_WS_MEMBER_TYPES). The printer's element WRITE always casts its receiver to
    // `List<object>` (transpiler.js ARRAY_KEYWORD), and that class cast is CS0030 on an
    // ArrayCache (BaseCache implements IList<object> but does not derive from List<object>).
    // The write through `((IList<object>)name)` is the identical indexer call, so retarget
    // only that cast, only for a receiver declared `ccxt.pro.ArrayCache` in the same method.
    retypeCacheElementWriteCasts (content: string): string {
        if (!content.includes ('ccxt.pro.ArrayCache ') || !content.includes ('((List<object>)')) {
            return content;
        }
        const memberStart = /^    (?:public|private|protected|internal|static)\b/;
        const declaration = /^\s*ccxt\.pro\.ArrayCache ([A-Za-z_][A-Za-z0-9_]*) = /;
        const lines = content.split ('\n');
        let declared = new Set<string> ();
        let changed = 0;
        for (let i = 0; i < lines.length; i++) {
            if (memberStart.test (lines[i])) {
                declared = new Set<string> (); // a new member: locals do not cross methods
                continue;
            }
            const match = declaration.exec (lines[i]);
            if (match) {
                declared.add (match[1]);
                continue;
            }
            if (declared.size === 0 || !lines[i].includes ('((List<object>)')) {
                continue;
            }
            for (const name of declared) {
                const token = '((List<object>)' + name + ')';
                if (!lines[i].includes (token)) {
                    continue;
                }
                const rewritten = lines[i].split (token).join ('((IList<object>)' + name + ')');
                // the retarget must be a pure cast-token substitution on this line
                if (rewritten.replaceAll ('((IList<object>)' + name + ')', token) !== lines[i]) {
                    throw new Error (`[csharp] retypeCacheElementWriteCasts: rewrite is not a cast substitution: ${lines[i]}`);
                }
                lines[i] = rewritten;
                changed++;
            }
        }
        if (changed === 0) {
            return content;
        }
        return lines.join ('\n');
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

        // to c#
        // const tsContent = fs.readFileSync (baseExchangeFile, 'utf8');
        // const delimited = tsContent.split (delimiter)
        const strippedBaseFile = writeOverloadStrippedFile (baseExchangeFile);
        const baseFile: any = this.transpiler.transpileCSharpByPath(strippedBaseFile);
        removeOverloadStrippedFile (strippedBaseFile, baseExchangeFile);
        let baseClass = baseFile.content as any;// remove this later

        // the 62 symbol-based trading methods declared in TS `class Exchange extends BaseExchange`
        const exchangeTierNames = this.getExchangeTierMethodNames (baseExchangeFile);
        // loadOrderBook is hand-written on partial class Exchange (WsBridge.cs); drop the
        // transpiled copy. fetchOrderBook / fetchRestOrderBookSafe stay on the Exchange tier
        // so the prediction sibling can type fetchOrderBook as PredictionOrderBook (CS0508
        // if either name is declared on shared BaseExchange).
        const droppedOnBase = [ 'loadOrderBook' ];
        const retainedOnBase: string[] = [];
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
        // implodeHostname forwards implodeParams (object -> string in Exchange.Misc.cs), so its
        // generated `object` signature only erased the string it already returns; the local-typing
        // classifier (build/csharp-local-types.js) relies on the honest `string` here.
        baseClass = baseClass.replaceAll(/public virtual object implodeHostname\(object url\)/g, 'public virtual string implodeHostname(object url)');
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
            const file = fileHeader + nativeDeclaredHelperCalls (this.dropIdentityStringCasts (this.retypeIdentifierCopies (this.stripRedundantStringCasts (this.retypePrintedReceiverCasts (this.foldIdentityStringCasts (this.nativeListHelperCalls (this.retypeParseMarketParams (this.retypeParameterArgs (this.typeVenueNumericArgs (this.typeVenueStringArgs (this.retypeSafeCollectionHelpers (this.pascalizeTypedCores (this.dropStringTimeframeCasts (this.retypeSignatureArgs (this.finalizeCoreArgTypes (this.castCoreArgCallSites (this.typeCoreArgs (this.typeCollectionReturns (this.typeCores (this.typeSyncCores (baseMethods), false))))))), false)), 'BaseExchange')))))))))) + "\n");
            fs.writeFileSync (csharpExchangeBase, file);
            log.green ('Transpiled base methods to', (csharpExchangeBase as any).yellow)
            if (exchangeClassMatch) {
                const tradingHeader = this.getCsharpImports(undefined).concat([
                    this.createGeneratedHeader().join('\n'),
                    "public partial class Exchange\n{\n\n"
                ]).join("\n");
                const tradingFile = tradingHeader + nativeDeclaredHelperCalls (this.dropIdentityStringCasts (this.retypeIdentifierCopies (this.stripRedundantStringCasts (this.retypePrintedReceiverCasts (this.foldIdentityStringCasts (this.nativeListHelperCalls (this.retypeParseMarketParams (this.retypeParameterArgs (this.typeVenueNumericArgs (this.typeVenueStringArgs (this.pascalizeTypedCores (this.dropStringTimeframeCasts (this.retypeSignatureArgs (this.finalizeCoreArgTypes (this.castCoreArgCallSites (this.typeCoreArgs (this.typeCollectionReturns (this.typeCores (this.typeSyncCores (exchangeBody), false))))))), false), 'Exchange')))))))))) + "\n}\n");
                fs.writeFileSync (BASE_TRADING_METHODS_FILE, tradingFile);
                log.green ('Transpiled trading methods to', (BASE_TRADING_METHODS_FILE as any).yellow)
            }
        }
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
            // method wrappers retired: PascalCase cores on PredictionExchange are the public API
            const file = fileHeader + fields + nativeDeclaredHelperCalls (this.dropIdentityStringCasts (this.retypeIdentifierCopies (this.retypePrintedReceiverCasts (this.foldIdentityStringCasts (this.nativeListHelperCalls (this.retypeParseMarketParams (this.typeVenueNumericArgs (this.typeVenueStringArgs (this.pascalizeTypedCores (this.dropStringTimeframeCasts (this.retypeSignatureArgs (this.finalizeCoreArgTypes (this.castCoreArgCallSites (this.typeCoreArgs (this.typeCollectionReturns (this.typeCores (this.typeSyncCores (baseMethods), true))))))), true), 'PredictionExchange')))))))) + "\n");
            fs.writeFileSync (predictionBase, file);
            this._predictionBaseWritten = true;
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
        const scopedRun = inputExchanges.length > 0;
        if (inputExchanges === undefined) {
            inputExchanges = exchanges.ws;
        }
        if (prediction && (!inputExchanges || !inputExchanges.length)) {
            inputExchanges = predictionWsIds;
        }
        const csharpFolder = prediction ? EXCHANGES_PREDICTION_WS_FOLDER : EXCHANGES_WS_FOLDER;
        const options = { csharpFolder, exchanges:inputExchanges }
        // const options = { csharpFolder: EXCHANGES_WS_FOLDER, exchanges:['bitget'] }
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

        this.transpileExamples(); // disabled for now

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
            // csharpComments lives on the main thread (the wrapper writer reads it), so
            // replay the raw comments the worker saw through the same transform
            for (const comment of chunk.comments) {
                this.transformLeadingComment (comment);
            }
        }
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
        await this.transpileDerivedExchangeFiles (tsFolder, options, '.ts', force, ws, true)
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
        content = content.replace(/binaryMessage.byteLength/gm, 'getValue(binaryMessage, "byteLength")'); // idex tmp fix
        // WS fixes
        if (ws) {
            const wsRegexes = this.getWsRegexes();
            content = this.regexAll (content, wsRegexes);
            content = nativeDeclaredWsCalls (content);
            content = this.removeRedundantClientCasts (content);
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
            content = nativeDeclaredWsCalls (content);
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
        content = nativeDeclaredHelperCalls (this.typeVenueNumericArgs (this.typeVenueStringArgs (this.stripRedundantStringCasts (this.retypePrintedReceiverCasts (this.foldIdentityStringCasts (this.nativeListHelperCalls (this.retypeParseMarketParams (this.retypeWsHandlerMessagesToInterface (this.retypeWsHandlerMessages (this.retypeParameterArgs (this.pascalizeTypedCores (this.dropStringTimeframeCasts (this.retypeSignatureArgs (this.finalizeCoreArgTypes (this.castCoreArgCallSites (this.typeCoreArgs (this.typeCollectionReturns (this.typeCores (this.typeSyncCores (content))))))))))))))))), venueKey)));
        content = this.dropRedundantObjectBoxCasts (content);
        content = this.retypeCacheElementWriteCasts (content);
        content = this.retypeIdentifierCopies (content);
        content = this.dropIdentityStringCasts (content);
        if (ws || this.isPrediction) {
            content = nativeWsCacheCalls (content);
        }
        this.currentVenue = '';
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
    transpileWsOrderbookTestsToCSharp (outDir: string, force = true) {

        const jsFile = './ts/src/pro/test/base/test.orderBook.ts';
        const csharpFile = `${outDir}/Ws/test.orderBook.cs`;

        if (skipUpToDateStage ('csharp', 'ws orderbook test', force, testStageInputs (), [ csharpFile ])) {
            return;
        }

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
    transpileWsCacheTestsToCSharp (outDir: string, force = true) {

        const jsFile = './ts/src/pro/test/base/test.cache.ts';
        const csharpFile = `${outDir}/Ws/test.cache.cs`;

        if (skipUpToDateStage ('csharp', 'ws cache test', force, testStageInputs (), [ csharpFile ])) {
            return;
        }

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

    transpileCryptoTestsToCSharp (outDir: string, force = true) {

        const jsFile = './ts/src/test/base/test.cryptography.ts';
        const csharpFile = `${outDir}/test.cryptography.cs`;

        if (skipUpToDateStage ('csharp', 'crypto test', force, testStageInputs (), [ csharpFile ])) {
            return;
        }

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

    async transpileBaseTestsToCSharp (force = true) {
        const outDir = BASE_TESTS_FOLDER;
        await this.transpileBaseTests(outDir, force);
        this.transpileCryptoTestsToCSharp(outDir, force);
        this.transpileWsCacheTestsToCSharp(outDir, force);
        this.transpileWsOrderbookTestsToCSharp(outDir, force);
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
            // noImplicitAny bags: keep object so safeValue assignments typecheck
            [ /public (?:Dict|Dictionary<string, object>) skippedMethods\b/g, 'public object skippedMethods' ],
            [ /public (?:Dict|Dictionary<string, object>) checkedPublicTests\b/g, 'public object checkedPublicTests' ],
        ])

        // the legacy request-builders bind Exchange statically, so the typed cores'
        // PascalCase rename applies to their call sites too (declarations left alone)
        contentIndentend = this.pascalizeTypedCores (contentIndentend, false, [ 'exchange.' ], false);

        const file = [
            'using ccxt;',
            'namespace Tests;',
            '',
            this.createGeneratedHeader().join('\n'),
            contentIndentend,
        ].join('\n')

        overwriteFileAndFolder (files.csharpFile, file);
    }

    transpileExchangeTests(force = true){
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

        const wsTests = fs.readdirSync (baseFolders.ts).filter(filename => filename.endsWith('.ts')).map(filename => filename.replace('.ts', ''));

        const tests = [] as any;

        wsTests.forEach (test => {
            tests.push({
                name: test,
                tsFile: baseFolders.ts + test + '.ts',
                csharpFile: baseFolders.csharp + test + '.cs',
            });
        });

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
                [ /throw new Error/g, 'throw new Exception' ],
                [/testSharedMethods\.assertTimestampAndDatetime\(exchange, skippedProperties, method, orderbook\)/, '// testSharedMethods.assertTimestampAndDatetime (exchange, skippedProperties, method, orderbook)'], // tmp disabling timestamp check on the orderbook
                [ /void function/g, 'void'],
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
                    [/await exchange.watchOrderBook\(symbol\)/g, '((IOrderBook)(await exchange.watchOrderBook(symbol))).Copy()'],
                    [/await exchange.watchOrderBookForSymbols\((.*?)\)/g, '((IOrderBook)(await exchange.watchOrderBookForSymbols($1))).Copy()'],
                ]);
            }

            contentIndentend = this.regexAll (contentIndentend, regexes)
            // narrowed core parameters (`string code`, `string timeframe`) also need an explicit
            // cast in tests: REST tests route only the awaited `await exchange.X(` calls through
            // invokeExchangeDynamically, so synchronous helpers (currency, parseOHLCVs, ...) stay
            // static calls against `BaseExchange`; WS tests bind statically throughout.
            contentIndentend = this.castCoreArgCallSites (contentIndentend, [ 'exchange.' ]);
            if (isWs) {
                contentIndentend = this.pascalizeTypedCores (contentIndentend, false, [ 'exchange.' ], false);
                // must run last: it matches the PascalCase names the previous pass produced
                contentIndentend = this.detypeWsTypedCoreCalls (contentIndentend);
            }
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

async function runMain () {
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
}

if (isMainEntry(metaUrl)) {
    await runMain();
}
