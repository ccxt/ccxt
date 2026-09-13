// C++ transpiler driver.
//
// Mirrors build/csharpTranspiler.ts and build/goTranspiler.ts: ast-transpiler does the
// heavy lifting (it ships a C++ backend), and this file owns configuration, the
// class/tier splitting, the post-processing of constructs the backend cannot express,
// and file layout.
//
// Read .claude/cpp-port.prd.md for scope. The design decisions referenced below as
// D1/D3/D3b/D3c are recorded in the implementation plan.

import Transpiler from "ast-transpiler";
import fs from 'fs';
import path from 'path';
import log from 'ololog';
import ansi from 'ansicolor';
import { spawnSync } from 'child_process';
import errorHierarchy from '../js/src/base/errorHierarchy.js';
import { overwriteFile, checkCreateFolder } from './fsLocal.js';
import { writeOverloadStrippedFile, removeOverloadStrippedFile } from './stripOverloads.js';
import { isMainEntry, filterDirtyExchangeFiles, skipUpToDateStage, testStageInputs } from './transpile.js';
import { extractTypesIR } from './typesIR.js';
import cppTypesEmitter from './typeEmitters/cpp.js';

ansi.nice;

const metaUrl = import.meta.url;
let __dirname = new URL ('.', metaUrl).pathname;
if (process.platform === 'win32') {
    if (__dirname[0] === '/') {
        __dirname = __dirname.substring (1);
    }
}

// ---------------------------------------------------------------------------
// paths
// ---------------------------------------------------------------------------

const TS_BASE_FILE          = './ts/src/base/Exchange.ts';
const BASE_METHODS_FILE     = './cpp/ccxt/base/Exchange.BaseMethods.inc';
const SET_MARKETS_FILE      = './cpp/ccxt/base/Exchange.SetMarkets.inc';
const TRADING_METHODS_FILE  = './cpp/ccxt/base/Exchange.TradingMethods.inc';
const BASE_DISPATCH_FILE    = './cpp/ccxt/base/Exchange.Dispatch.inc';
const TYPED_API_FILE        = './cpp/ccxt/base/Exchange.TypedApi.inc';
const ERRORS_FILE           = './cpp/ccxt/base/Errors.h';
const EXCHANGES_FOLDER      = './cpp/ccxt/exchanges/';
const PRO_EXCHANGES_FOLDER  = './cpp/ccxt/pro/';
const PREDICTION_BASE_FILE  = './ts/src/base/PredictionExchange.ts';
const PREDICTION_FOLDER     = './cpp/ccxt/prediction/';
const PREDICTION_BASE_HEADER = './cpp/ccxt/base/PredictionExchange.h';
const BASE_TESTS_FOLDER     = './cpp/tests/Generated/Base/';
const EXCHANGE_TESTS_FOLDER = './cpp/tests/Generated/';
const TS_BASE_TESTS_FOLDER  = './ts/src/test/base/';
const TS_PRO_BASE_TESTS_FOLDER = './ts/src/pro/test/base/';

const DELIMITER = 'METHODS BELOW THIS LINE ARE TRANSPILED FROM TYPESCRIPT';

// top-level comma split of a TS parameter list (skips nested <>, (), [], {} and quotes)
function splitTopLevel (text: string): string[] {
    const out: string[] = [];
    let depth = 0;
    let cur = '';
    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (ch === "'" || ch === '"') {
            const quote = ch;
            let j = i + 1;
            while (j < text.length) {
                if (text[j] === '\\') { j += 2; continue; }
                if (text[j] === quote) { j++; break; }
                j++;
            }
            cur += text.substring (i, j);
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
    if (cur.trim () !== '') {
        out.push (cur);
    }
    return out;
}

// ---------------------------------------------------------------------------
// formatting — clang-format if present, raw otherwise (mirrors formatGoSource)
// ---------------------------------------------------------------------------

let clangFormatMissingWarned = false;

function formatCppSource (filePath: string, content: string): string {
    if (!filePath.endsWith ('.h') && !filePath.endsWith ('.inc') && !filePath.endsWith ('.cpp')) {
        return content;
    }
    const formatted = spawnSync ('clang-format', [], {
        'input': content,
        'encoding': 'utf8',
        'maxBuffer': 256 * 1024 * 1024,
        'windowsHide': true,
    });
    if (formatted.error) {
        // absent formatter is not fatal: the generated code is already indented
        if (!clangFormatMissingWarned) {
            clangFormatMissingWarned = true;
            log.bright.yellow ('clang-format not found (' + formatted.error.message + '), writing C++ files unformatted');
        }
        return content;
    }
    if (formatted.status !== 0) {
        // write the unformatted output so the bad source can be inspected
        log.bright.yellow ('clang-format failed for ' + filePath + '\n' + (formatted.stderr || ''));
        return content;
    }
    return formatted.stdout;
}

// final token pass for EVERY generated artifact: the backend's hardcoded
// emissions (async lambda returns, destructuring bindings, method return
// types) bypass the VAR_TOKEN config, so convert any residual std::any /
// std::any_cast to the port's SBO value type (ccxt::any) at the write
// chokepoint. Idempotent.
function useSboAnyType (content: string): string {
    return content
        .replace (/\bstd::any_cast\b/g, 'ccxt::any_cast')
        .replace (/\bstd::any\b/g, 'ccxt::any');
}

function overwriteFileAndFolder (filePath: string, content: string) {
    if (!fs.existsSync (filePath)) {
        checkCreateFolder (filePath);
    }
    overwriteFile (filePath, formatCppSource (filePath, useSboAnyType (content)));
}

// ---------------------------------------------------------------------------
// the ccxt error class names, used by the D3b rewrite and to emit Errors.h
// ---------------------------------------------------------------------------

function collectErrorNames (): string[] {
    const names: string[] = [];
    const walk = (node: any) => {
        for (const key of Object.keys (node ?? {})) {
            names.push (key);
            walk (node[key]);
        }
    };
    walk (errorHierarchy);
    return names;
}

const ERROR_NAMES = collectErrorNames ();

// ---------------------------------------------------------------------------
// guard: constructs the backend drops without a word
// ---------------------------------------------------------------------------

// The cpp backend has no printer for for-of or switch. `printForOfStatement` and
// `printSwitchStatement` are not implemented, so the statement vanishes and leaves a
// body that still compiles but is silently wrong -- test.safeMethods' `equals` helper
// transpiled to a bare `return true`, which would have passed every assertion in the
// file. Nothing in the OUTPUT distinguishes that from a legitimately short function,
// so the guard runs over the INPUT and fails loudly on any occurrence that is not
// explicitly accounted for here.
const DROPPED_CONSTRUCTS = /\bfor\s*\(\s*const\s+\w+\s+of\b|\bswitch\s*\(/g;

const DROPPED_CONSTRUCT_ALLOWLIST: { [file: string]: string } = {
    // its single for-of is inside the file-local `equals` helper; stripGeneratedEquals
    // removes the mangled definition and BaseTest.Bridge.h hand-writes a real one
    'test.safeMethods.ts': 'equals() is hand-written in BaseTest.Bridge.h',
};

function assertNoDroppedConstructs (tsPath: string) {
    const name = path.basename (tsPath);
    const source = fs.readFileSync (tsPath).toString ();
    const hits = source.match (DROPPED_CONSTRUCTS);
    if (!hits || (name in DROPPED_CONSTRUCT_ALLOWLIST)) {
        return;
    }
    throw new Error (
        '[cpp] ' + tsPath + ' contains ' + hits.length + ' for-of/switch statement(s) (' +
        hits.join (', ') + '). The C++ backend drops these silently, producing code that ' +
        'compiles but is wrong. Rewrite them in the TS source as indexed for-loops, or ' +
        'add the file to DROPPED_CONSTRUCT_ALLOWLIST in build/cppTranspiler.ts with the ' +
        'reason it is safe.'
    );
}

// ---------------------------------------------------------------------------
// post-processing the backend cannot express
// ---------------------------------------------------------------------------

// D3 — dynamic dispatch. The backend emits `::getValue(this, m)(args)` for
// `this[m](args)`, which is not valid C++ (the cpp backend's printDynamicCall is a
// stub the base class never calls). Rewrite calls to the runtime registry, and bare
// dynamic property reads to getProperty. The receiver is parameterised: Exchange
// code dispatches on `this`, the transpiled test framework on the std::any
// `exchange`/`mockedExchange` locals.
//
// Done with a scanner rather than a regex because the argument list nests parentheses.
function rewriteDynamicDispatch (content: string, receiver = 'this'): string {
    const NEEDLE = `::getValue(${receiver}, `;
    const callFn = receiver === 'this'
        ? (key: string, args: string) => `callDynamically(this, ${key}, ${args})`
        : (key: string, args: string) => `callDynamically(${receiver}, ${key}, ${args})`;
    const readFn = receiver === 'this'
        ? (key: string) => `getProperty(this, ${key})`
        : (key: string) => `getProperty(${receiver}, ${key})`;
    let out = '';
    let cursor = 0;
    for (;;) {
        const at = content.indexOf (NEEDLE, cursor);
        if (at === -1) {
            out += content.slice (cursor);
            return out;
        }
        // find the ')' closing the getValue call. depth starts at 1: the needle
        // ends inside the getValue paren (right after the opening '('), so the
        // closing ')' is the one that brings the count back to zero.
        let depth = 1;
        let i = at + NEEDLE.length - 1;
        let keyEnd = -1;
        for (; i < content.length; i++) {
            if (content[i] === '(') depth++;
            else if (content[i] === ')') {
                depth--;
                if (depth === 0) { keyEnd = i; break; }
            }
        }
        if (keyEnd === -1) {
            out += content.slice (cursor);
            return out;
        }
        const key = content.slice (at + NEEDLE.length, keyEnd);
        // whitespace (including line breaks) may sit between the closing ')' and a
        // following call paren
        let probe = keyEnd + 1;
        while (probe < content.length
               && (content[probe] === ' ' || content[probe] === '\t'
                   || content[probe] === '\n' || content[probe] === '\r')) probe++;
        if (content[probe] !== '(') {
            // a bare property read: this[key]
            out += content.slice (cursor, at) + readFn (key);
            cursor = keyEnd + 1;
            continue;
        }
        // a dynamic call: this[key](args...) — capture the balanced argument list
        depth = 0;
        let argsEnd = -1;
        for (i = probe; i < content.length; i++) {
            if (content[i] === '(') depth++;
            else if (content[i] === ')') {
                depth--;
                if (depth === 0) { argsEnd = i; break; }
            }
        }
        if (argsEnd === -1) {
            out += content.slice (cursor);
            return out;
        }
        const args = content.slice (probe + 1, argsEnd).trim ();
        const argList = args.length ? `ccxt::list{${args}}` : 'ccxt::list{}';
        out += content.slice (cursor, at) + callFn (key, argList);
        cursor = argsEnd + 1;
    }
}

// D3b — error classes used as dict *values*. `'-1004': OperationFailed` puts a class
// where C++ needs an expression. Every port special-cases this (C# typeof(X), Java
// X.class, Go a package value); here the value becomes the class name and the throw
// helpers resolve it through the registry in Errors.h. Restricted to known ccxt error
// names so unrelated identifiers (and real constants like TRUNCATE) are left alone.
function rewriteErrorClassValues (content: string): string {
    const alternation = ERROR_NAMES.join ('|');
    // the class may sit on its own line (clang-format wraps long exception maps) and
    // the key may contain escaped quotes ('subscription cluster does not \"exist\"'),
    // both of which the old single-line form missed
    const asDictValue = new RegExp (`(\\{\\s*std::string\\((?:\\u0000LIT\\d+\\u0000|\\\"(?:[^\\\"\\\\]|\\\\.)*\\\")\\),\\s*)(${alternation})(\\s*[,}])`, 'g');
    // some exchanges spell exact entries as [ErrorClass, 'message'] tuples: the class
    // sits inside a list literal instead of a dict value position
    const asListValue = new RegExp (`(ccxt::list\\{\\s*)(${alternation})(\\s*,)`, 'g');
    // any remaining bare class used as a VALUE: safeString(..., errorCode, ExchangeError)
    // passes the class as the default argument. Exclusions keep the valid C++ forms
    // intact: throw <Class>(, ::<Class>, isInstanceOf<<Class>>, ccxt.<Class>.
    const asBareValue = new RegExp (`(?<![\\w:>.]|throw\\s)(${alternation})(\\s*[,)])`, 'g');
    // run on masked source so error-message text mentioning a class name is untouched
    return outsideStringLiterals (content, (masked) => masked
        .replace (asDictValue, '$1std::string("$2")$3')
        .replace (asListValue, '$1std::string("$2")$3')
        .replace (asBareValue, 'std::string("$1")$2'));
}

// D3c — SUPER_TOKEN is 'base', copy-pasted from the C# backend, so `super.foo()`
// emits `base.foo()`. Rewrite to a qualified call on the actual parent.
function rewriteSuperCalls (content: string, parentClass: string): string {
    return content.replace (/\bbase\.(\w+)\s*\(/g, `${parentClass}::$1(`);
}

// JS `method.call(this, ...args)` with a method NAME stored in a variable (pro
// exchanges build subscription dicts carrying method references, which the
// stringify pass turns into std::string names). The C++ route is the dynamic
// dispatcher: method.call(this, a, b) -> this->dispatchMethodName(method, list{a, b}).
// The argument list is paren-balanced per match (args contain nested calls).
function rewriteMethodNameCalls (content: string): string {
    let out = '';
    let cursor = 0;
    for (;;) {
        const marker = '.call(this, ';
        const at = content.indexOf (marker, cursor);
        if (at === -1) {
            out += content.slice (cursor);
            return out;
        }
        // find the receiver start (last identifier before the dot)
        let receiverStart = at;
        while (receiverStart > cursor && /[A-Za-z0-9_]/.test (content[receiverStart - 1])) {
            receiverStart--;
        }
        const receiver = content.slice (receiverStart, at);
        const argsStart = at + marker.length;
        let depth = 1;
        let inStr = false;
        let i = argsStart;
        for (; i < content.length; i++) {
            const c = content[i];
            if (inStr) {
                if (c === '\\') { i++; continue; }
                if (c === '"') { inStr = false; }
                continue;
            }
            if (c === '"') { inStr = true; continue; }
            if (c === '(') { depth++; continue; }
            if (c === ')') {
                depth--;
                if (depth === 0) {
                    break;
                }
            }
        }
        const args = content.slice (argsStart, i);
        out += content.slice (cursor, receiverStart);
        out += 'this->dispatchMethodName(' + receiver + ', ccxt::list{' + args + '})';
        cursor = i + 1;   // past the closing ')'
    }
}

// JS `broad[broadKey](errorMessage)` where the dict holds an error CLASS name:
// the C++ exceptions map stores the name as a string (rewriteErrorClassValues),
// and rewriteAnyMemberAccess turns the index into ::getValue(...), leaving the
// invocation dangling: `::getValue(broad, broadKey)(errorMessage)`. Rewrite the
// call form into makeExchangeError(name, message). Only pro venues use it.
function rewriteDynamicErrorCalls (content: string): string {
    return content.replace (/::getValue\(([^()]*)\)\(/g,
        '::makeExchangeError(::getValue($1), ');
}

// TS `catch (e) { ... throw e; }` becomes `catch (const std::exception& e) { ... throw e; }`,
// which SLICES: rethrowing the caught reference by value copies it down to the static
// type, so a BadRequest leaves the catch block as a bare std::exception and every
// `catch (const BadRequest&)` further up stops matching. It also destroys the message,
// which is how 227 static request fixtures came to report only "std::exception".
// `throw;` rethrows the original object untouched. The catch variable is almost always
// e, but error/exc appear too (whitebit fetchOrder) — cover all of them.
function rewriteRethrow (content: string): string {
    return content.replace (/\bthrow (e|error|exc);/g, 'throw;');
}

// `x instanceof T` emits dynamic_cast on a std::any, which cannot compile.
function rewriteInstanceOf (content: string): string {
    return content.replace (
        /\(dynamic_cast<const (\w+)\*>\(&\(([^)]+)\)\) != nullptr\)/g,
        'isInstanceOf<$1>($2)'
    );
}

// The backend wraps every async body in `[=]() -> std::any { ... }`. A `[=]` capture is
// const, so any statement that reassigns a captured local or parameter fails to compile
// — and reassigning `params` is ubiquitous in ccxt (`params = this.omit(params, ...)`).
// The lambda has to be mutable.
function rewriteAsyncLambdasMutable (content: string): string {
    return content.replace (
        /std::async\(std::launch::async, \[=\]\(\) -> std::any \{/g,
        // launch::deferred, not launch::async. The backend spawns a thread per async
        // call, and ccxt's value model (D1) is a graph of shared_ptr-backed dicts and
        // lists with no locking -- `this` and every captured container are shared
        // across those threads, so two overlapping calls corrupt the heap. That is not
        // theoretical: the static request run aborted nondeterministically with
        // "malloc(): unaligned tcache chunk" and "double free or corruption".
        // Deferred runs the body on the awaiting thread at get() time, which is exactly
        // the sequential semantics the transpiled code was written against in JS.
        // Real parallelism has to come back with locking, not a raw thread per call.
        'std::async(std::launch::deferred, [=]() mutable -> std::any {'
    );
}

// The WS `client` locals are std::any (they come out of this->clients), so member
// access on them does not compile. C# solves this by casting to WebSocketClient; the
// C++ port has no WS layer yet (an explicit non-goal for this iteration), so property
// reads go through getValue and the two resolve/reject calls land on the base stubs.
function rewriteWsClientAccess (content: string): string {
    const cap = (s: string) => s.charAt (0).toUpperCase () + s.slice (1);
    return content
        .replace (/\bclient\.(resolve|reject)\s*\(/g, 'this->$1(')
        .replace (/\bclient\.(future|reusableFuture|send|reset)\s*\(/g, (_m, m) => '::wsClient' + cap (m) + '(client, ')
        .replace (/\bclient\.([A-Za-z_]\w*)\b(?!\s*\()/g, '::getValue(client, std::string("$1"))');
}

// a ws Future held in an std::any local: future.resolve(v) / future.reject(e).
// `.resolve()` with no args resolves undefined — pass an empty any instead of
// emitting a trailing comma.
function rewriteWsFutureAccess (content: string): string {
    return content
        .replace (/\b(future|promise)\.(resolve|reject)\s*\(\s*\)/g,
                  (_m, recv, m) => '::wsFuture' + m.charAt (0).toUpperCase () + m.slice (1) + '(' + recv + ')')
        .replace (/\b(future|promise)\.(resolve|reject)\s*\(/g,
                  (_m, recv, m) => '::wsFuture' + m.charAt (0).toUpperCase () + m.slice (1) + '(' + recv + ', ');
}

// `Precise.stringAdd(...)` is a static call on an imported class; the backend has no
// notion of namespaces so it emits the TS member-access form.
function rewritePreciseCalls (content: string): string {
    return content.replace (/\bPrecise\.(string\w+)\s*\(/g, 'ccxt::Precise::$1(');
}

// A TS local may share a name with a helper (`const isArray = Array.isArray(x)`), and in
// C++ the name is in scope inside its own initialiser, so the call resolves to the
// half-declared variable. Qualify the call. The initialiser may be wrapped in
// parentheses and clang-format may have broken the line, so whitespace and opening
// parens are tolerated between `=` and the call.
function rewriteSelfShadowingLocals (content: string): string {
    return content.replace (/(?:std::any|ccxt::any) (\w+) =(\s*\(*)\1\(/g, 'std::any $1 =$2::$1(');
}

// Property and method access on std::any locals. C# casts these (`(client as
// WebSocketClient).futures`); C++ has no such cast on std::any, so reads go through
// getValue. The two method forms below only occur on WS paths, an explicit non-goal
// for this iteration.
const ANY_PROPERTIES = [
    'markets', 'markets_by_id', 'currencies', 'currencies_by_id', 'symbols', 'ids',
    'codes', 'baseCurrencies', 'quoteCurrencies', 'options', 'cache', 'subscriptions',
    'futures', 'id',
].join ('|');

// Rewrites must never fire inside a string literal: ccxt error messages mention things
// like ".options", and rewriting there produced `operator""options`. Mask literals out,
// transform, then restore.
//
// Implemented as a scanner rather than a regex because ccxt comments are full of
// quotes and escaped quotes (e.g. a line comment containing an escaped-quote JSON
// fragment), and a regex happily "masks" a string that starts inside a comment — the
// restore then splices foreign text into the comment and eats the following real
// code, which is exactly how assertStaticRequestOutput got corrupted into a
// 900-char comment.
function outsideStringLiterals (content: string, transform: (s: string) => string): string {
    const literals: string[] = [];
    let out = '';
    let i = 0;
    let inLiteral = false;
    let lit = '';
    while (i < content.length) {
        const c = content[i];
        if (!inLiteral) {
            if (c === '/' && content[i + 1] === '/') {
                const end = content.indexOf ('\n', i);
                if (end === -1) {
                    out += content.slice (i);
                    i = content.length;
                    break;
                }
                out += content.slice (i, end);
                i = end;
                continue;
            }
            if (c === '/' && content[i + 1] === '*') {
                const end = content.indexOf ('*/', i + 2);
                if (end === -1) {
                    out += content.slice (i);
                    i = content.length;
                    break;
                }
                out += content.slice (i, end + 2);
                i = end + 2;
                continue;
            }
            if (c === '"') {
                inLiteral = true;
                lit = '';
                i++;
                continue;
            }
            out += c;
            i++;
            continue;
        }
        // inside a double-quoted literal
        if (c === '\\' && i + 1 < content.length) {
            lit += content.slice (i, i + 2);
            i += 2;
            continue;
        }
        if (c === '"') {
            literals.push (lit);
            out += `\u0000LIT${literals.length - 1}\u0000`;
            inLiteral = false;
            i++;
            continue;
        }
        lit += c;
        i++;
    }
    return transform (out).replace (/\u0000LIT(\d+)\u0000/g, (_m, i) => '"' + literals[Number (i)] + '"');
}

function rewriteAnyMemberAccess (content: string): string {
    return outsideStringLiterals (content, (masked) => masked
        .replace (/\b([A-Za-z_]\w*)\.storeArray\(/g, 'this->storeArray($1, ')
        .replace (/\b([A-Za-z_]\w*)\.describe\(\)/g, '::describeOf($1)')
        .replace (/\b([A-Za-z_]\w*)\.reset\(/g, '::resetOrderBook($1, ')
        .replace (new RegExp (`\\b([A-Za-z_]\\w*)\\.(${ANY_PROPERTIES})\\b(?!\\s*\\()`, 'g'),
                  '::getValue($1, std::string("$2"))'));
}

// Precise.decimals is a plain int, but the generated code assigns helper results to it
// (`precise.decimals = mathMax(precise.decimals, priceDecimals)`). A regex cannot wrap
// an expression with nested parens, so scan to the statement's closing `;`.
function rewriteDecimalsAssignments (content: string): string {
    const MARK = '.decimals = ';
    let out = '';
    let cursor = 0;
    for (;;) {
        const at = content.indexOf (MARK, cursor);
        if (at === -1) {
            out += content.slice (cursor);
            return out;
        }
        out += content.slice (cursor, at);
        let i = at + MARK.length;
        let depth = 0;
        while (i < content.length) {
            const c = content[i];
            if (c === '(') {
                depth++;
            } else if (c === ')') {
                depth--;
            } else if (c === ';' && depth === 0) {
                break;
            }
            i++;
        }
        const expr = content.slice (at + MARK.length, i).trim ();
        out += MARK + 'static_cast<int> (toLong (' + expr + '))';
        cursor = i;
    }
}

// TS locals may be C++ reserved words (`const signed = ...` in several sign()
// overrides, `const auto = ...` in okx). Rename them mask-aware so error-message text
// containing the word is untouched; comments are fair game.
function rewriteReservedIdentifiers (content: string): string {
    return outsideStringLiterals (content, (masked) => masked
        .replace (/\bsigned\b/g, 'signedFlag')
        .replace (/\bauto\b/g, 'autoFlag')
        .replace (/\berrno\b/g, 'errnoFlag'));   // <cerrno> macro, same collision class
}

// The transpiler can shadow a global helper with a same-named local (okx: `const isArray
// = Array.isArray(params)` declares std::any isArray, and a later Array.isArray call
// emits bare `isArray(...)` which then resolves to the local). Rename the local and
// qualify the call sites.
const SHADOWED_HELPERS: Record<string, string> = { isArray: 'isArrayFlag' };
function rewriteShadowedHelperNames (content: string): string {
    let out = content;
    for (const [name, rename] of Object.entries (SHADOWED_HELPERS)) {
        if (!new RegExp (`\\b(?:std::any|ccxt::any) ${name} =`).test (out)) {
            continue;
        }
        out = outsideStringLiterals (out, (masked) => masked
            .replace (new RegExp (`(?<!:)\\b${name}\\(`, 'g'), `::${name}(`)
            .replace (new RegExp (`(?<!:)\\b${name}\\b`, 'g'), rename));
    }
    return out;
}

// TS lets parseTransaction overrides declare fewer params than the widest one (foxbit
// adds since/limit; alpaca/aster don't). C++ override requires the exact parameter
// list, so extend shorter exchange-level declarations with trailing std::any defaults
// to match the (already extended) base virtual signature.
const OVERRIDE_ARITY: Record<string, number> = { parseTransaction: 4 };
function extendOverrideSignatures (content: string): string {
    let out = content;
    for (const [name, arity] of Object.entries (OVERRIDE_ARITY)) {
        out = out.replace (new RegExp (`\\b${name}\\(([^)]*)\\) override`, 'g'), (whole, params) => {
            const parts = params.split (',').filter ((p: string) => p.trim ().length);
            let fixed = params;
            for (let n = parts.length; n < arity; n++) {
                fixed += (parts.length || fixed.trim ().length ? ', ' : '') + `std::any p${n} = std::any{}`;
            }
            return `${name}(${fixed}) override`;
        });
    }
    return out;
}

function applyCommonFixes (content: string): string {
    return rewriteRethrow (
        rewriteErrorClassValues (
        rewriteInstanceOf (
            rewritePreciseCalls (
                rewriteDecimalsAssignments (
                rewriteSelfShadowingLocals (
                rewriteShadowedHelperNames (
                rewriteReservedIdentifiers (
                rewriteAnyMemberAccess (
                rewriteWsFutureAccess (
                rewriteWsClientAccess (
                    rewriteAsyncLambdasMutable (
                        rewriteDynamicDispatch (extendOverrideSignatures (content))))))))))))));
}

// ---------------------------------------------------------------------------

function createGeneratedHeader (): string[] {
    return [
        '// PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:',
        '// https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code',
        ''
    ];
}

class CppTranspilerDriver {

    transpiler!: Transpiler;

    // Whole-file extraction of every generated member definition (virtual
    // std::any/void NAME(...) { ... }) from the base-methods content: each body
    // becomes an out-of-line definition qualified with `qualifier::name` and the
    // in-class position keeps a declaration. Reverse-order processing keeps the
    // earlier match indices valid. Members that fail to parse stay inline.
    extractAllMembers (content: string, qualifier: string): { content: string, impls: string } {
        const matches: { index: number, name: string }[] = [];
        const re = /(^|\n)(\s*)(virtual )?(std::any|void) (\w+)\s*\(/g;
        let m: RegExpExecArray | null;
        while ((m = re.exec (content)) !== null) {
            matches.push ({ index: m.index + m[1].length + m[2].length, name: m[5] });
        }
        let out = content;
        const impls: string[] = [];
        for (let i = matches.length - 1; i >= 0; i--) {
            const extracted = this.extractMemberFromIndex (out, matches[i].index, matches[i].name, qualifier);
            if (!extracted) continue;
            out = out.slice (0, extracted.start) + extracted.decl + out.slice (extracted.end);
            impls.unshift (extracted.impl);
        }
        return { content: out, impls: impls.join ('\n\n') };
    }

    // Hot-path optimisation of the generated setMarkets definition (live
    // loadMarkets runs it once per market over thousands of entries):
    // (1) hoist the repeated getValue(value, "id") lookups into one valueId;
    // (2) hoist defaultCurrencyPrecision out of the per-market currencies loop
    // (it only depends on precisionMode);
    // (3) replace the undefined-strip key-list rebuild with a direct
    // entries() iteration. All rewrites are scoped to the setMarkets
    // definition so identical patterns in other members stay untouched;
    // a missing anchor only warns — the generation still succeeds.
    optimizeSetMarketsBody (impls: string): string {
        const start = impls.indexOf ('std::any Exchange::setMarkets(');
        if (start < 0) return impls;
        const nextMember = impls.indexOf ('\nstd::any Exchange::', start + 12);
        const end = nextMember >= 0 ? nextMember : impls.length;
        let sm = impls.slice (start, end);

        // (3) direct entries() iteration for the undefined-strip — regex form:
        // the backend's body formatting is irregular (mixed indents, next-line
        // braces, `dict {}` spacing), so anchor on the valueDefined decl and
        // consume everything up to the deepExtend call.
        const stripRe =
            /ccxt::any valueDefined = ccxt::dict\s*\{\};[\s\S]*?ccxt::any market = this->deepExtend/;
        const stripTo = [
            '    std::any valueDefined = ccxt::dict{};',
            '    {',
            '      const ccxt::dict valueDict = std::any_cast<ccxt::dict>(value);',
            '      for (const auto& valueKv : valueDict.entries()) {',
            '        if (isTrue(!isEqual(valueKv.second, std::any{}))) {',
            '          ::setValue(valueDefined, valueKv.first, valueKv.second);',
            '        }',
            '      }',
            '    }',
        ].join ('\n');
        if (stripRe.test (sm)) {
            sm = sm.replace (stripRe,
                stripTo + '\n    std::any market = this->deepExtend');
        } else {
            log.warn ('[cpp] setMarkets: undefined-strip anchor not found, skipping rewrite');
        }

        // (1) hoist getValue(value, "id") — three lookups per market.
        // Replace the uses FIRST, then insert the declaration — inserting
        // before the replace would match the inserted line itself and
        // produce `std::any valueId = valueId;` (self-init UB, segfault).
        const valueDecl = '    ccxt::any value = ::getValue(marketValues, i);';
        if (sm.includes (valueDecl)) {
            sm = sm.replace (/::getValue\(value, std::string\("id"\)\)/g, 'valueId');
            sm = sm.replace (valueDecl, valueDecl
                + '\n    std::any valueId = ::getValue(value, std::string("id"));');
        } else {
            log.warn ('[cpp] setMarkets: value-decl anchor not found, skipping rewrite');
        }

        // (2) hoist defaultCurrencyPrecision out of the per-market loop — regex
        // form for the same formatting irregularity: delete the per-iteration
        // decl (ends at the first `std::string("1e-8"))));`), then re-insert it
        // before the loop, after the quoteCurrencies decl. Idempotent: a second
        // regen deletes the hoisted copy and re-inserts the same text.
        const precisionDeclRe =
            /ccxt::any defaultCurrencyPrecision =[\s\S]*?std::string\("1e-8"\)\)\)\)\);/;
        const quoteCurrenciesRe = /ccxt::any quoteCurrencies = ccxt::list\s*\{\};/;
        if (precisionDeclRe.test (sm) && quoteCurrenciesRe.test (sm)) {
            sm = sm.replace (precisionDeclRe, '');
            const hoistedPrecision = [
                '    std::any defaultCurrencyPrecision =',
                '        (isTrue((isEqual(this->precisionMode, DECIMAL_PLACES)))',
                '             ? std::any(8)',
                '             : std::any(this->parseNumber(std::string("1e-8"))));',
            ].join ('\n');
            sm = sm.replace (quoteCurrenciesRe,
                (m: string) => m + '\n' + hoistedPrecision);
        } else {
            log.warn ('[cpp] setMarkets: currency-precision anchors not found, skipping rewrite');
        }

        return impls.slice (0, start) + sm + impls.slice (end);
    }

    extractMemberFromIndex (content: string, at: number, name: string, qualifier: string): { start: number, end: number, decl: string, impl: string } | undefined {
        // the body brace is the first '{' after the signature's terminating ')'
        // — the backend emits both `) {` and `)\n    {` (brace on the next line,
        // indented), so match whitespace-agnostically. Defaults like
        // `= std::any{}` contain no ')' followed by '{'.
        const tail = content.slice (at);
        const bodyBrace = /\)\s*\{/.exec (tail);
        if (!bodyBrace) return undefined;
        const open = at + bodyBrace.index + bodyBrace[0].length - 1;
        let depth = 0;
        let end = -1;
        for (let i = open; i < content.length; i++) {
            if (content[i] === '{') depth++;
            else if (content[i] === '}') {
                depth--;
                if (depth === 0) { end = i + 1; break; }
            }
        }
        if (end === -1) return undefined;
        const decl = content.slice (at, open).trimEnd () + ';';
        // build the out-of-line signature from the SAME text as the declaration:
        // strip default args with a depth/string-aware scanner (defaults can be
        // arbitrary expressions with commas and parens — regex can't see them),
        // drop `virtual `, and qualify the name. The body is untouched.
        let sig = this.stripDefaultArgs (content.slice (at, open).trimEnd ());
        sig = sig.replace (/^virtual /, '');
        const firstParen = sig.indexOf ('(');
        const before = sig.slice (0, firstParen).trimEnd ();
        const nameMatch = /(\w+)$/.exec (before);
        if (nameMatch) {
            const nameStart = before.length - nameMatch[1].length;
            sig = before.slice (0, nameStart) + qualifier + '::'
                + before.slice (nameStart) + sig.slice (firstParen);
        }
        return { start: at, end, decl, impl: sig + content.slice (open, end) };
    }

    // removes `= <default>` from every top-level parameter of a member signature;
    // tracks paren depth, brace depth and string literals so defaults may contain
    // commas, parens and quotes (`= this->handleOptionAndParams("a", "b")`)
    stripDefaultArgs (sig: string): string {
        let out = '';
        let i = 0;
        let depth = 0;
        let brace = 0;
        while (i < sig.length) {
            const c = sig[i];
            if (c === '"' || c === '\'') {
                const quote = c;
                out += c;
                i++;
                while (i < sig.length && sig[i] !== quote) { out += sig[i]; i++; }
                if (i < sig.length) { out += sig[i]; i++; }
                continue;
            }
            if (c === '(') { depth++; out += c; i++; continue; }
            if (c === ')') { depth--; out += c; i++; continue; }
            if (c === '{') { brace++; out += c; i++; continue; }
            if (c === '}') { brace--; out += c; i++; continue; }
            if (c === '=' && depth === 1 && brace === 0) {
                // skip the default expression with a LOCAL depth counter; the
                // parameter list's closing ')' and top-level ',' separators are
                // left in place for the outer loop to emit
                let d2 = 1;
                while (i < sig.length) {
                    const d = sig[i];
                    if (d === '"' || d === '\'') {
                        const quote = d;
                        i++;
                        while (i < sig.length && sig[i] !== quote) { i++; }
                        if (i < sig.length) i++;
                        continue;
                    }
                    if (d === '(') d2++;
                    if (d === ')') {
                        d2--;
                        if (d2 === 0) { break; }   // the list's closing paren
                    }
                    if (d === ',' && d2 === 1) { break; }
                    i++;
                }
                continue;
            }
            out += c;
            i++;
        }
        return out.trimEnd ();
    }

    constructor () {
        this.setupTranspiler ();
    }

    getTranspilerConfig () {
        return {
            'verbose': false,
            'cpp': {
                'parser': {
                    // D1 — reference-semantic, insertion-ordered containers. ccxt signs
                    // requests over key order, and generated code mutates containers
                    // through std::any expecting JS aliasing; neither works with
                    // std::unordered_map / std::vector by value.
                    'OBJECT_OPENING': 'ccxt::dict {',
                    'ARRAY_OPENING_TOKEN': 'ccxt::list{',
                    // D2 — the port's SBO value type (see cpp/ccxt/base/Value.h):
                    // ccxt::any inlines the hot scalar/string/handle payloads where
                    // std::any heap-allocated a slot per value (~30% of warm CPU was
                    // malloc/std::any-manager). Every generated `std::any` VAR
                    // position (locals, params, undefined literals) routes through
                    // these tokens; hardcoded backend emissions (async lambda
                    // returns, method return types) are converted by the
                    // useSboAnyType write-chokepoint instead.
                    'VAR_TOKEN': 'ccxt::any',
                    'UNDEFINED_TOKEN': 'ccxt::any{}',
                    'DEFAULT_PARAMETER_TYPE': 'ccxt::any',
                },
                'FullPropertyAccessReplacements': {
                    // the backend maps this to INT_MAX (2^31), but JS means 2^53-1 and
                    // ccxt uses it as a sentinel
                    'Number.MAX_SAFE_INTEGER': 'MAX_SAFE_INTEGER',
                },
            },
        };
    }

    setupTranspiler () {
        this.transpiler = new Transpiler (this.getTranspilerConfig ());
        const cpp = (this.transpiler as any).cppTranspiler;
        // The C# backend sets this; the C++ one does not. Without it a method typed
        // Promise<T> but not declared `async` transpiles synchronously and returns
        // std::any where every caller awaits a std::shared_future.
        cpp.implicitAsyncTranspiling = true;
    }

    // -----------------------------------------------------------------------
    // base methods: ts/src/base/Exchange.ts -> two .inc fragments
    // -----------------------------------------------------------------------
    //
    // C++ has no partial classes, so the emitted `class X { public: ... };` wrapper is
    // stripped and only the member list is written. cpp/ccxt/base/Exchange.h includes
    // the fragments inside its own class body, reproducing what C# gets from
    // `partial class BaseExchange`.

    transpileBaseMethods (baseExchangeFile = TS_BASE_FILE, force = true) {
        if (skipUpToDateStage ('cpp', 'base methods', force,
            [ baseExchangeFile, './ts/src/base/types.ts', './exchanges.json' ],
            [ BASE_METHODS_FILE, TRADING_METHODS_FILE, SET_MARKETS_FILE ])) {
            return;
        }
        assertNoDroppedConstructs (baseExchangeFile);
        // ast-transpiler cannot parse the TS overload signatures in Exchange.ts
        const stripped = writeOverloadStrippedFile (baseExchangeFile);
        const result: any = this.transpiler.transpileCppByPath (stripped);
        removeOverloadStrippedFile (stripped, baseExchangeFile);

        const content = result.content as string;

        // everything above the delimiter is hand-written per language (see
        // cpp/ccxt/base/ExchangeBase.h) and must not reach the generated fragment
        const parts = content.split ('// ' + DELIMITER);
        if (parts.length < 2) {
            throw new Error ('[cpp] delimiter not found in transpiled ' + baseExchangeFile);
        }
        const rest = parts[1];

        // split the BaseExchange tier from the `class Exchange : public BaseExchange` tier
        const tierMatch = /\nclass Exchange\s*:\s*public BaseExchange\s*\n?\{\s*\npublic:\n/.exec (rest);
        let baseMethods = rest;
        let tradingMethods = '';
        if (tierMatch) {
            baseMethods = rest.slice (0, tierMatch.index);
            tradingMethods = rest.slice (tierMatch.index + tierMatch[0].length);
        }
        // drop the class-closing `};` each tier ends with
        baseMethods = baseMethods.replace (/\}\s*;\s*$/, '').trimEnd ();
        tradingMethods = tradingMethods.replace (/\}\s*;\s*$/, '').trimEnd ();

        const header = createGeneratedHeader ().join ('\n')
            + '\n// Included inside the body of class ccxt::Exchange - see Exchange.h.\n\n';

        // C++ override requires the exact parameter list, but TS lets foxbit declare
        // parseTransaction with two extra defaulted params. Extend the base virtual
        // with matching defaults so the override remains virtual-dispatched
        // (parseTransactions routes through this->parseTransaction) instead of hiding.
        baseMethods = baseMethods.replace (
            /virtual std::any parseTransaction\((?:std::any|ccxt::any) transaction, (?:std::any|ccxt::any) currency = (?:std::any|ccxt::any)\{\}\)/,
            'virtual std::any parseTransaction(std::any transaction, std::any currency = std::any{}, std::any since = std::any{}, std::any limit = std::any{})');

        // The whole generated base-methods surface is the live hot path (per-market
        // safe*/deepExtend/sortBy work over thousands of entries in setMarkets, and
        // every other generated call site). ALL members are extracted into
        // out-of-line definitions so a dedicated -O2 TU (Exchange.SetMarkets.cpp)
        // compiles them while the per-exchange TUs keep the fast -O0 build regime.
        // Probe-measured ~2.6x on a warm binance load (4.6s -> 1.7s) with this
        // surface at -O2 — and only the WHOLE surface: extracting a subset left
        // the remaining -O0 inline copies in the loop. If a member fails to parse
        // (upstream rename), it simply stays inline.
        const fixed = applyCommonFixes (baseMethods);
        const { content: inc, impls } = this.extractAllMembers (fixed, 'Exchange');
        const optimizedImpls = this.optimizeSetMarketsBody (impls);
        if (optimizedImpls.length) {
            overwriteFileAndFolder (SET_MARKETS_FILE,
                createGeneratedHeader ().join ('\n')
                + '\n// Out-of-line definitions of the generated ccxt::Exchange base members;\n'
                + '// included by cpp/ccxt/base/Exchange.SetMarkets.cpp, which compiles at\n'
                + '// -O2 (the per-market safe*/deepExtend loops dominate live loadMarkets).\n\n'
                + 'namespace ccxt {\n\n'
                + optimizedImpls + '\n\n'
                + '} // namespace ccxt\n');
        }

        overwriteFileAndFolder (BASE_METHODS_FILE, header + inc + '\n');
        log.green ('[cpp] Transpiled base methods to', (BASE_METHODS_FILE as any).yellow);

        if (tradingMethods.length) {
            overwriteFileAndFolder (TRADING_METHODS_FILE, header + applyCommonFixes (tradingMethods) + '\n');
            log.green ('[cpp] Transpiled trading methods to', (TRADING_METHODS_FILE as any).yellow);
        }

        // dispatch table over the transpiled base surface: tests and pagination reach
        // base methods (parsePrecision, networkIdToCode, checkProxySettings, ...) via
        // callDynamically, which in C# is reflection; here it is Exchange::callMethod
        // chaining up to ExchangeBase::callMethod (the hand-written helpers).
        const dispatchBranches = this.buildDispatchBranches (
            applyCommonFixes (baseMethods) + '\n' + applyCommonFixes (tradingMethods));
        const dispatch = [
            createGeneratedHeader ().join ('\n'),
            '// Included inside the body of class ccxt::Exchange - see Exchange.h.',
            '',
            '    virtual std::any callMethod (std::any name, std::any args) override {',
            '        const std::string which = ::toString(name).has_value()',
            '            ? std::any_cast<std::string>(::toString(name)) : std::string();',
            '        const long count = ccxt::isList(args)',
            '            ? static_cast<long>(std::any_cast<ccxt::list>(args).size()) : 0;',
            ...dispatchBranches,
            '        return ExchangeBase::callMethod (name, args);',
            '    }',
            ''
        ].join ('\n');
        overwriteFileAndFolder (BASE_DISPATCH_FILE, dispatch);
        log.green ('[cpp] Generated base dispatch table to', (BASE_DISPATCH_FILE as any).yellow);
    }

    // -----------------------------------------------------------------------
    // typed layer: Types.h (structs) + Exchange.TypedApi.inc (PascalCase facade)
    // -----------------------------------------------------------------------
    //
    // The user-facing typed API, mirroring the C# port's PascalCase wrappers
    // (cs/ccxt/wrappers/*): every unified method declared in ts/src/base/Exchange.ts
    // whose Promise<T> return type and parameter list both map onto the generated
    // struct set becomes `T FetchX (...)` calling the dynamic camelCase core and
    // converting the result. Methods with unmappable pieces stay dynamic-only.

    // shared by the Exchange facade (transpileTypedApi) and the prediction facade
    // (predictionTypedApiLines): the structNames map is the only difference -- the
    // main facade excludes Prediction* structs, the prediction facade includes them.
    mapTypedReturn (structNames: Map<string, string>, retRaw: string): { type: string, wrap: (call: string) => string } | undefined {
        const ret = retRaw.split ('|').map ((s) => s.trim ()).filter ((s) => s !== 'undefined' && s !== 'null').join ('|').trim ();
        if (ret === 'Int' || ret === 'int') {
            return { 'type': 'std::optional<int64_t>', 'wrap': (c) => 'typedsupport::anyInt (' + c + ')' };
        }
        if (ret === 'Str') {
            return { 'type': 'std::optional<std::string>', 'wrap': (c) => 'typedsupport::anyStr (' + c + ')' };
        }
        if (ret === 'Num') {
            return { 'type': 'std::optional<double>', 'wrap': (c) => 'typedsupport::anyNum (' + c + ')' };
        }
        if (ret === 'Bool') {
            return { 'type': 'std::optional<bool>', 'wrap': (c) => 'typedsupport::anyBool (' + c + ')' };
        }
        if (ret.endsWith ('[]')) {
            const elem = ret.slice (0, -2).trim ();
            const cpp = structNames.get (elem);
            if (cpp !== undefined) {
                return { 'type': 'std::vector<' + cpp + '>', 'wrap': (c) => 'typedVector<' + cpp + '> (' + c + ')' };
            }
            return undefined;
        }
        if (ret.startsWith ('Dictionary<') && ret.endsWith ('>')) {
            const inner = ret.slice (11, -1).trim ();
            const cpp = structNames.get (inner);
            if (cpp !== undefined) {
                return { 'type': 'std::map<std::string, ' + cpp + '>', 'wrap': (c) => 'typedMap<' + cpp + '> (' + c + ')' };
            }
            return undefined;
        }
        const cpp = structNames.get (ret);
        if (cpp !== undefined) {
            return { 'type': cpp, 'wrap': (c) => cpp + ' (' + c + ')' };
        }
        return undefined;
    }

    mapTypedParam (raw: string): { decl: string, conv: string } | undefined {
        const text = raw.trim ();
        if (text === '') {
            return undefined;
        }
        const eq = text.indexOf ('=');
        const head = (eq >= 0 ? text.slice (0, eq) : text).trim ();
        const def = eq >= 0 ? text.slice (eq + 1).trim () : undefined;
        const colon = head.indexOf (':');
        const name = (colon >= 0 ? head.slice (0, colon) : head).trim ();
        let type = colon >= 0 ? head.slice (colon + 1).trim () : undefined;
        if (type !== undefined) {
            type = type.split ('|').map ((s) => s.trim ()).filter ((s) => s !== 'undefined' && s !== 'null').join ('|').trim ();
        }
        const conv = 'typedAny (' + name + ')';
        // params bag and other untyped-object args (fetchEventsParams is the
        // prediction tier's params-bag interface)
        if ((type === undefined || type === 'object' || type === 'any' || type === 'Dict' || type === '{}' || type === 'fetchEventsParams') && def === '{}') {
            return { 'decl': 'const dict& ' + name + ' = dict {}', 'conv': conv };
        }
        if (type === undefined && def === 'undefined') {
            return { 'decl': 'const std::any& ' + name + ' = std::any {}', 'conv': conv };
        }
        if (type === undefined) {
            return undefined;
        }
        const stringLike = type === 'string' || type === 'OrderType' || type === 'OrderSide' || type === 'MarketType' || type === 'SubType' || type === 'IndexType';
        if (stringLike) {
            if (def === undefined) {
                return { 'decl': 'const std::string& ' + name, 'conv': conv };
            }
            if (def.startsWith ("'") && def.endsWith ("'")) {
                return { 'decl': 'const std::string& ' + name + ' = "' + def.slice (1, -1) + '"', 'conv': conv };
            }
            if (def === 'undefined') {
                return { 'decl': 'const std::optional<std::string>& ' + name + ' = std::nullopt', 'conv': conv };
            }
            return undefined;
        }
        if (type === 'Str') {
            return { 'decl': 'const std::optional<std::string>& ' + name + (def !== undefined ? ' = std::nullopt' : ''), 'conv': conv };
        }
        if (type === 'Strings' || type === 'string[]') {
            return { 'decl': 'const std::vector<std::string>& ' + name + (def !== undefined ? ' = {}' : ''), 'conv': conv };
        }
        if (type === 'Int' || type === 'int') {
            return { 'decl': 'std::optional<int64_t> ' + name + (def !== undefined ? ' = std::nullopt' : ''), 'conv': conv };
        }
        if (type === 'Num') {
            return { 'decl': 'std::optional<double> ' + name + (def !== undefined ? ' = std::nullopt' : ''), 'conv': conv };
        }
        if (type === 'number') {
            if (def === undefined) {
                return { 'decl': 'double ' + name, 'conv': conv };
            }
            if (def === 'undefined') {
                return { 'decl': 'std::optional<double> ' + name + ' = std::nullopt', 'conv': conv };
            }
            if (/^-?[0-9.]+$/.test (def)) {
                return { 'decl': 'double ' + name + ' = ' + def, 'conv': conv };
            }
            return undefined;
        }
        if (type === 'boolean') {
            if (def === undefined) {
                return { 'decl': 'bool ' + name, 'conv': conv };
            }
            if (def === 'true' || def === 'false') {
                return { 'decl': 'bool ' + name + ' = ' + def, 'conv': conv };
            }
            if (def === 'undefined') {
                return { 'decl': 'const std::optional<bool>& ' + name + ' = std::nullopt', 'conv': conv };
            }
            return undefined;
        }
        if (type === 'Bool') {
            return { 'decl': 'const std::optional<bool>& ' + name + (def !== undefined ? ' = std::nullopt' : ''), 'conv': conv };
        }
        if (type === 'OrderRequest[]' || type === 'CancellationRequest[]') {
            const elem = type.slice (0, -2);
            return { 'decl': 'const std::vector<' + elem + '>& ' + name, 'conv': 'typedAnyList (' + name + ')' };
        }
        return undefined;
    }

    transpileTypedApi (baseExchangeFile = TS_BASE_FILE, force = true) {
        if (skipUpToDateStage ('cpp', 'typed api', force,
            [ baseExchangeFile, './ts/src/base/types.ts' ],
            [ TYPED_API_FILE, './cpp/ccxt/base/Types.h' ])) {
            return;
        }
        // Types.h itself: same emitter transpileTypes.ts uses, written raw (no
        // clang-format) so both entry points produce byte-identical output
        const ir = extractTypesIR ('./ts/src/base/types.ts');
        for (const output of cppTypesEmitter.emit (ir, process.cwd ())) {
            checkCreateFolder (path.dirname (output.path));
            fs.writeFileSync (output.path, output.contents);
            log.green ('[cpp] Generated typed structs to', (output.path as any).yellow);
        }

        // ts struct name (and alias) -> cpp struct name
        const renames: Record<string, string> = {
            'FeeInterface': 'Fee',
            'CurrencyInterface': 'Currency',
            'MarketInterface': 'Market',
            'TradingFeeInterface': 'TradingFee',
        };
        const structNames = new Map<string, string> ();
        for (const t of ir.types) {
            if (/^Prediction/.test (t.name) || t.name === 'FeeStringInterface') {
                continue;
            }
            if (t.kind === 'interface' || t.kind === 'dictionary'
                || (t.kind === 'tuple' && (t.name === 'OHLCV' || t.name === 'OHLCVC'))) {
                structNames.set (t.name, renames[t.name] !== undefined ? renames[t.name] : t.name);
            }
        }
        for (const t of ir.types) {
            if (t.kind === 'alias' && t.aliasOf !== undefined && !structNames.has (t.name)) {
                const target = t.aliasOf.split ('|').map ((s) => s.trim ()).filter ((s) => s !== 'undefined' && s !== 'null')[0];
                if (target !== undefined && structNames.has (target)) {
                    structNames.set (t.name, structNames.get (target)!);
                }
            }
        }

        // internal plumbing that happens to have a mappable signature
        const denylist = new Set ([
            'loadMarketsHelper', 'fetchRestOrderBookSafe', 'loadOrderBook',
            'fetchPermissions', 'fetchTransactions',
        ]);

        const src = fs.readFileSync (baseExchangeFile, 'utf8');
        const re = /^    (?:async\s+)?([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([^)]*)\)\s*:\s*Promise<([^{]+?)>\s*\{/gm;
        const emitted = new Set<string> ();
        const lines: string[] = [];
        let match;
        while ((match = re.exec (src)) !== null) {
            const name = match[1];

            // the ws tier (watch*/*Ws) IS on the typed surface: the facade calls the
            // virtual camelCase method, so a REST instance throws the base stub's
            // NotSupported while a pro instance (ccxt::pro::<id>) dispatches to its
            // real override. unWatch* returns Promise<any> and is auto-skipped by
            // the return mapper below.
            if (denylist.has (name) || emitted.has (name)) {
                continue;
            }
            const ret = this.mapTypedReturn (structNames, match[3]);
            if (ret === undefined) {
                continue;
            }
            const argsText = match[2].trim ();
            const argPieces = argsText === '' ? [] : splitTopLevel (argsText);
            const decls: string[] = [];
            const convs: string[] = [];
            let mappable = true;
            for (const piece of argPieces) {
                const mapped = this.mapTypedParam (piece);
                if (mapped === undefined) {
                    mappable = false;
                    break;
                }
                decls.push (mapped.decl);
                convs.push (mapped.conv);
            }
            if (!mappable) {
                continue;
            }
            emitted.add (name);
            const pascal = name.charAt (0).toUpperCase () + name.slice (1);
            const call = 'awaitValue (std::any (this->' + name + ' (' + convs.join (', ') + ')))';
            lines.push ('    // typed facade over ' + name);
            lines.push ('    ' + ret.type + ' ' + pascal + ' (' + decls.join (', ') + ') {');
            lines.push ('        return ' + ret.wrap (call) + ';');
            lines.push ('    }');
            lines.push ('');
        }
        const header = createGeneratedHeader ().join ('\n')
            + '\n// Included inside the body of class ccxt::Exchange - see Exchange.h.\n'
            + '// The typed user-facing API: PascalCase methods returning Types.h structs\n'
            + '// (C# wrapper parity). Regenerate with `npm run transpileCpp -- --typedApi`.\n\n';
        checkCreateFolder (path.dirname (TYPED_API_FILE));
        fs.writeFileSync (TYPED_API_FILE, useSboAnyType (header + lines.join ('\n') + '\n'));
        log.green ('[cpp] Generated typed API (' + emitted.size.toString () + ' methods) to', (TYPED_API_FILE as any).yellow);
    }

    // -----------------------------------------------------------------------
    // error hierarchy -> cpp/ccxt/base/Errors.h
    // -----------------------------------------------------------------------

    transpileErrorHierarchy (force = true) {
        const source = './js/src/base/errorHierarchy.js';
        if (skipUpToDateStage ('cpp', 'error hierarchy', force, [ source ], [ ERRORS_FILE ])) {
            return;
        }
        const lines: string[] = [];
        const registry: string[] = [];
        // BaseError is the root key of the hierarchy *and* is hand-written below as the
        // std::runtime_error subclass, so declaring it again would emit
        // `class BaseError : public BaseError`. Skip anything already declared.
        const declared = new Set<string> ([ 'BaseError' ]);
        const declare = (node: any, parent: string) => {
            for (const name of Object.keys (node ?? {})) {
                if (declared.has (name)) {
                    declare (node[name], name);   // still emit its children
                    continue;
                }
                declared.add (name);
                lines.push (`class ${name} : public ${parent} {`);
                lines.push (`public:`);
                // inherit BaseError's constructors so `const char*`, std::string and
                // std::any all resolve without ambiguity at every throw site
                lines.push (`    using ${parent}::${parent};`);
                lines.push (`};`);
                lines.push ('');
                registry.push (`    if (name == "${name}") throw ${name} (message);`);
                declare (node[name], name);
            }
        };
        declare (errorHierarchy, 'BaseError');

        const file = [
            '#pragma once',
            '',
            ...createGeneratedHeader (),
            '#include "helpers.h"',
            '',
            '#include <any>',
            '#include <stdexcept>',
            '#include <string>',
            '',
            'namespace ccxt {',
            '',
            '// Root of the ccxt error hierarchy. Every generated class derives from it, so a',
            '// `catch (const std::exception&)` in transpiled code still sees ccxt errors.',
            'class BaseError : public std::runtime_error {',
            'public:',
            '    explicit BaseError (const std::string& message) : std::runtime_error (message) {}',
            '    explicit BaseError (const char* message) : std::runtime_error (message) {}',
            '    // transpiled throw sites pass std::any (the result of toString)',
            '    explicit BaseError (const std::any& message)',
            '        : std::runtime_error (std::any_cast<std::string> (::toString (message))) {}',
            '};',
            '',
            ...lines,
            '// Resolves the class name stored in describe().exceptions back to a real throw.',
            '// See D3b: error classes appear as dict *values* in TS, which C++ cannot express,',
            '// so the transpiler rewrites them to their names and they are re-materialised here.',
            '[[noreturn]] inline void throwByName (const std::string& name, const std::string& message) {',
            ...registry,
            '    throw BaseError (name + ": " + message);',
            '}',
            '',
            '} // namespace ccxt',
            ''
        ].join ('\n');

        overwriteFileAndFolder (ERRORS_FILE, file);
        log.green ('[cpp] Transpiled error hierarchy to', (ERRORS_FILE as any).yellow);
    }

    // -----------------------------------------------------------------------
    // per-exchange
    // -----------------------------------------------------------------------

    transpileDerivedExchangeFiles (exchanges: string[], force = true) {
        let files = exchanges.map ((id) => id + '.ts');
        // must run before transpiling: the file list doubles as the ts.Program roots
        files = filterDirtyExchangeFiles ('cpp', files, force, (file: string) => ({
            'tsPath': './ts/src/' + file,
            'outputs': [ EXCHANGES_FOLDER + file.replace ('.ts', '.h') ],
        }));
        if (!files.length) {
            return;
        }
        log.blue ('[cpp] Transpiling [', files.join (', '), ']');
        for (const file of files) {
            const id = path.basename (file, '.ts');
            assertNoDroppedConstructs ('./ts/src/' + file);
            // the TS parent class: super-calls and the dispatch fallback must reach the
            // parent's unified-method overrides for derived exchanges (bequant -> hitbtc)
            const source = fs.readFileSync ('./ts/src/' + file).toString ();
            const parentMatch = /\bclass\s+\w+\s+extends\s+(\w+)/.exec (source);
            const tsParent = parentMatch ? parentMatch[1] : 'Exchange';
            const result: any = this.transpiler.transpileCppByPath ('./ts/src/' + file);
            overwriteFileAndFolder (EXCHANGES_FOLDER + id + '.h', this.createExchangeFile (id, result, tsParent));
            // one tiny TU per exchange: includes just this header and registers the
            // factory creator, so the test binary never has to compile every venue
            // into a single translation unit
            overwriteFileAndFolder (EXCHANGES_FOLDER + 'tu_' + id + '.cpp', this.createExchangeTu (id));
            log.green ('[cpp] Transpiled', (id as any).yellow);
        }
    }

    createExchangeTu (id: string): string {
        return [
            '// PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:',
            '// https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code',
            '',
            `#include "${id}.h"`,
            '#include "ExchangeFactory.h"',
            '',
            'namespace ccxt {',
            'namespace factory {',
            'namespace {',
            '',
            `std::shared_ptr<ExchangeBase> create_${id} (std::any config) {`,
            `    return newExchange<${id}> (config);`,
            '}',
            '',
            `struct Registrar_${id} {`,
            `    Registrar_${id} () { registerExchange ("${id}", &create_${id}); }`,
            '};',
            '',
            `static Registrar_${id} g_registrar_${id};`,
            '',
            '} // namespace',
            '} // namespace factory',
            '} // namespace ccxt',
            ''
        ].join ('\n');
    }

    // The static request/response tests call methods by name ("fetchTicker") with an
    // argument list read out of a JSON fixture. C++ has no reflection, so the dispatch
    // has to be generated: scan the emitted class for its public async methods and emit
    // a name -> call table. Arity is taken from the signature, and every argument is
    // read positionally out of the list, so a fixture that supplies fewer arguments
    // than the signature declares simply leaves the rest undefined -- exactly what the
    // TS harness does by spreading a short array.
    createDispatchTable (id: string, content: string, tsParent = 'Exchange'): string {
        // Unified methods an exchange does NOT override are inherited from the base
        // class, and the fixtures call those by name too (fetchFundingInterval,
        // cancelOrderWithClientOrderId, ...). Scanning only the exchange's own class
        // left them undispatchable, so the base fragments are scanned as well; a name
        // the exchange overrides is seen first and wins.
        let scanned = content;
        for (const fragment of [ BASE_METHODS_FILE, TRADING_METHODS_FILE ]) {
            if (fs.existsSync (fragment)) {
                scanned += '\n' + fs.readFileSync (fragment).toString ();
            }
        }
        // a derived exchange (bequant -> hitbtc) must fall through to its TS parent's
        // dispatch table, so the parent's unified-method overrides stay reachable
        return this.buildDispatchTable (id, scanned, tsParent);
    }

    // Splits the parameter list that starts just after `openAt` (immediately following
    // the '(') into its top-level parameters, ignoring anything nested in parentheses,
    // braces, angle brackets or string literals -- a default value can contain both
    // commas and parentheses (`std::any timeframe = std::string("1m")`).
    splitParameters (content: string, openAt: number): string[] {
        let depth = 0;
        let inString = false;
        let current = '';
        const parameters: string[] = [];
        for (let i = openAt; i < content.length; i++) {
            const c = content[i];
            if (inString) {
                current += c;
                if (c === '\\') { current += content[++i] ?? ''; } else if (c === '"') { inString = false; }
                continue;
            }
            if (c === '"') { inString = true; current += c; continue; }
            if (c === '(' || c === '{' || c === '<') { depth++; current += c; continue; }
            if ((c === ')') && (depth === 0)) {
                if (current.trim ().length) { parameters.push (current.trim ()); }
                return parameters;
            }
            if (c === ')' || c === '}' || c === '>') { depth--; current += c; continue; }
            if ((c === ',') && (depth === 0)) { parameters.push (current.trim ()); current = ''; continue; }
            current += c;
        }
        return parameters;
    }

    buildDispatchTable (id: string, content: string, fallback = 'Exchange'): string {
        const branches = this.buildDispatchBranches (content);
        return [
            '    // GENERATED dispatch table - see createDispatchTable in build/cppTranspiler.ts',
            '    virtual std::any callMethod (std::any name, std::any args) override {',
            '        const std::string which = ::toString(name).has_value()',
            '            ? std::any_cast<std::string>(::toString(name)) : std::string();',
            '        const long count = ccxt::isList(args)',
            '            ? static_cast<long>(std::any_cast<ccxt::list>(args).size()) : 0;',
            ...branches,
            '        // not defined on this exchange: fall back to the TS parent class',
            `        return ${fallback}::callMethod (name, args);`,
            '    }',
            ''
        ].join ('\n');
    }

    // The branch list for a callMethod dispatch table over every method defined in
    // `content`. Shared by the per-exchange tables and the base Exchange table --
    // the emitted member surfaces differ only in return type:
    // std::shared_future<std::any> (await + unwrap), std::any (plain), void/bool.
    buildDispatchBranches (content: string): string[] {
        // `virtual` is optional: the backend emits it on some methods and only
        // `override` on others. Only the NAME is matched here -- the parameter list is
        // scanned by hand below, because a default value can itself contain parentheses
        // and commas (`std::any timeframe = std::string("1m")`), and a `[^)]*` capture
        // truncates there. That silently gave fetchOHLCV an arity of 2 instead of 5, so
        // the dispatcher dropped timeframe/since/limit and every OHLCV fixture built a
        // request with default values.
        const signature = /^[ \t]*(?:virtual )?(std::shared_future<std::any>|std::any|void|bool) (\w+)\(/gm;
        const seen = new Set<string> ();
        const branches: string[] = [];
        let match: RegExpExecArray | null;
        while ((match = signature.exec (content)) !== null) {
            const returnType = match[1];
            const name = match[2];
            if (seen.has (name)) {
                continue;
            }
            seen.add (name);
            const parameters = this.splitParameters (content, signature.lastIndex);
            const arity = parameters.length;
            // a parameter with no `=` has no default, so the call must supply it; arms
            // below that count would not compile
            const required = parameters.filter ((p) => p.indexOf ('=') === -1).length;
            // Dispatch on how many arguments the fixture actually supplied. JS spreads a
            // short array, so the parameters it does not reach keep their defaults; C++
            // has no such thing, and passing an explicit std::any{} OVERRIDES the
            // default. fetchOHLCV(symbol) must leave timeframe as "1m", not undefined --
            // passing undefined dropped `interval` from every ohlcv request.
            const wrap = (call: string) => {
                if (returnType === 'std::shared_future<std::any>') {
                    return `return awaitValue(${call});`;
                }
                if (returnType === 'void') {
                    return `{ ${call}; return std::any {}; }`;
                }
                if (returnType === 'bool') {
                    return `return std::any(${call});`;
                }
                return `return ${call};`;
            };
            const arms: string[] = [];
            for (let n = required; n <= arity; n++) {
                const passed: string[] = [];
                for (let i = 0; i < n; i++) {
                    passed.push (`::getValue(args, ${i})`);
                }
                const test = (n === arity)
                    ? ((n === required) ? 'true' : `count >= ${n}`)
                    : ((n === required) ? `count <= ${n}` : `count == ${n}`);
                arms.push (
                    `            if (${test}) ${wrap (`this->${name}(${passed.join (', ')})`)}`
                );
            }
            branches.push (
                `        if (which == "${name}") {\n${arms.join ('\n')}\n        }`
            );
        }
        return branches;
    }

    createExchangeFile (id: string, result: any, tsParent = 'Exchange'): string {
        let content = result.content as string;
        // the abstract tier carries the implicit API methods (see generateImplicitAPI)
        const parent = id + 'Api';
        content = content.replace (/^class\s+(\w+)\s*:\s*public\s+\w+/m, `class $1 : public ${parent}`);
        // C++ does not inherit constructors, and the backend emits none, so the class
        // would only have the implicit default one -- `binance(config)` would not
        // compile. Pull the parent's in explicitly.
        content = content.replace (/^(class\s+\w+\s*:\s*public\s+\w+\s*\n?\{\s*\npublic:\n)/m,
                                   `$1    using ${parent}::${parent};\n`);
        // super/base calls resolve to the TS parent (hitbtc for bequant) so derived
        // exchanges reach their parent's unified-method overrides
        content = rewriteSuperCalls (content, tsParent);
        content = applyCommonFixes (content);
        // append the dispatch table inside the class body, just before its closing `};`.
        // The fallback is the TS parent's table: Exchange::callMethod for root
        // exchanges, hitbtc::callMethod for derived ones.
        const dispatch = this.createDispatchTable (id, content, tsParent);
        const lastBrace = content.lastIndexOf ('};');
        if (lastBrace !== -1) {
            content = content.slice (0, lastBrace) + dispatch + content.slice (lastBrace);
        }
        return [
            '#pragma once',
            '',
            ...createGeneratedHeader (),
            '#include "../base/Exchange.h"',
            `#include "../api/${id}.h"`,
            '',
            'namespace ccxt {',
            '',
            content,
            '',
            '} // namespace ccxt',
            ''
        ].join ('\n');
    }

    // -----------------------------------------------------------------------
    // pro exchanges: ts/src/pro/<id>.ts -> cpp/ccxt/pro/<id>.h + tu
    // -----------------------------------------------------------------------
    //

    // The pro tier's client/cache/orderbook member calls land on std::any receivers
    // exactly like the ws base tests do; reuse the ws value fixes BEFORE the common
    // fixes so `.storeArray(` is consumed by wsStoreArray instead of this->storeArray.
    //
    // Method references passed as values (`this->delay(d, this->watchOrderBookSnapshot,
    // ...)` or the "method" key of a subscription dict) emit as bare `this->Name`
    // identifiers that cannot compile. Method names are known: the class source
    // declares them, so exactly those bare references become string literals.
    stringifyMethodReferences (id: string, content: string, sourceDir = 'pro'): string {
        // methods may live on the REST base or the shared base fragments
        // (e.g. delay(d, this->loadOrderBook, ...) where loadOrderBook is
        // Exchange's own), so the whole class surface is scanned
        let source = fs.readFileSync ('./ts/src/' + sourceDir + '/' + id + '.ts').toString ();
        for (const fragment of [ BASE_METHODS_FILE, TRADING_METHODS_FILE ]) {
            if (fs.existsSync (fragment)) {
                source += '\n' + fs.readFileSync (fragment).toString ();
            }
        }
        const methods = new Set<string> ();
        const re = /^[ \t]*(?:override\s+)?(?:async\s+)?([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/gm;
        let m: RegExpExecArray | null;
        while ((m = re.exec (source)) !== null) {
            methods.add (m[1]);
        }
        if (!methods.size) {
            return content;
        }
        const names = Array.from (methods).sort ((a, b) => b.length - a.length).join ('|');
        // a bare this->Name NOT followed by `(` is a method reference (a genuine call
        // always has the paren list, and non-method members are not in the set)
        return content.replace (
            new RegExp (`this->(${names})\\b(?!\\s*\\()`, 'g'),
            (_m, name) => 'std::string("' + name + '")');
    }

    createProExchangeFile (id: string, result: any): string {
        let content = result.content as string;
        // Mirror the TS hierarchy when a pro exchange derives from ANOTHER pro
        // exchange (kucoinfutures -> kucoin): the C++ class must derive from the
        // pro parent, not the REST class, so inherited watch* methods, super calls
        // and the dispatch fallthrough all resolve to the pro tier.
        const tsSource = fs.readFileSync ('./ts/src/pro/' + id + '.ts').toString ();
        const parentMatch = /\bclass\s+\w+\s+extends\s+(\w+)/.exec (tsSource);
        const tsParentId = parentMatch ? parentMatch[1] : id;
        const hasProParent = (tsParentId !== id) && fs.existsSync ('./ts/src/pro/' + tsParentId + '.ts');
        const parent = hasProParent ? 'ccxt::pro::' + tsParentId : 'ccxt::' + id;
        const ctorId = hasProParent ? tsParentId : id;
        // class binance : public binanceRest  ->  class binance : public ccxt::binance
        content = content.replace (/^class\s+(\w+)\s*:\s*public\s+\w+/m, `class $1 : public ${parent}`);
        // C++ does not inherit constructors; pull the parent's in explicitly
        // (same pattern as createExchangeFile's using <id>Api::<id>Api)
        content = content.replace (/^(class\s+\w+\s*:\s*public\s+\S+\s*\{\s*\npublic:\n)/m,
                                   `$1    using ${parent}::${ctorId};\n`);
        content = this.stringifyMethodReferences (id, content);
        content = rewriteMethodNameCalls (content);
        content = rewriteSuperCalls (content, parent);
        content = this.applyWsValueFixes (content);
        content = applyCommonFixes (content);
        content = rewriteDynamicErrorCalls (content);
        // the pro dispatch falls through to the TS parent's table (the pro parent
        // for pro-derived exchanges, else the REST class's table, which itself
        // falls through to Exchange::callMethod), so inherited methods keep
        // resolving exactly as in TS
        const dispatch = this.createDispatchTable (id, content, parent);
        const lastBrace = content.lastIndexOf ('};');
        if (lastBrace !== -1) {
            content = content.slice (0, lastBrace) + dispatch + content.slice (lastBrace);
        }
        return [
            '#pragma once',
            '',
            ...createGeneratedHeader (),
            '#include "../exchanges/' + id + '.h"',
            '#include "../base/Exchange.h"',
            '#include "ProExchangeFactory.h"',
            ...(hasProParent ? ['#include "' + tsParentId + '.h"'] : []),
            '',
            'namespace ccxt {',
            'namespace pro {',
            '',
            content,
            '',
            '} // namespace pro',
            '} // namespace ccxt',
            ''
        ].join ('\n');
    }

    createProExchangeTu (id: string): string {
        return [
            '// PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:',
            '// https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code',
            '',
            `#include "${id}.h"`,
            '#include "ProExchangeFactory.h"',
            '',
            'namespace ccxt {',
            'namespace pro {',
            'namespace factory {',
            'namespace {',
            '',
            `std::shared_ptr<ExchangeBase> create_${id} (std::any config) {`,
            `    return newExchange<ccxt::pro::${id}> (config);`,
            '}',
            '',
            `struct Registrar_${id} {`,
            `    Registrar_${id} () { registerProExchange ("${id}", &create_${id}); }`,
            '};',
            '',
            `static Registrar_${id} g_registrar_${id};`,
            '',
            '} // namespace',
            '} // namespace factory',
            '} // namespace pro',
            '} // namespace ccxt',
            ''
        ].join ('\n');
    }

    transpileProExchangeFiles (ids: string[], force = true) {
        let files = ids.map ((id) => 'pro/' + id + '.ts');
        files = filterDirtyExchangeFiles ('cpp', files, force, (file: string) => ({
            'tsPath': './ts/src/' + file,
            'outputs': [ PRO_EXCHANGES_FOLDER + path.basename (file, '.ts') + '.h' ],
        }));
        if (!files.length) {
            return;
        }
        log.blue ('[cpp] Transpiling pro [', files.join (', '), ']');
        for (const file of files) {
            const id = path.basename (file, '.ts');
            assertNoDroppedConstructs ('./ts/src/' + file);
            const result: any = this.transpiler.transpileCppByPath ('./ts/src/' + file);
            overwriteFileAndFolder (PRO_EXCHANGES_FOLDER + id + '.h', this.createProExchangeFile (id, result));
            overwriteFileAndFolder (PRO_EXCHANGES_FOLDER + 'tu_' + id + '.cpp', this.createProExchangeTu (id));
            log.green ('[cpp] Transpiled pro', (id as any).yellow);
        }
    }

    // -----------------------------------------------------------------------
    // prediction exchanges: ts/src/prediction/<id>.ts -> cpp/ccxt/prediction/<id>.h + tu
    // -----------------------------------------------------------------------
    //
    // The prediction tier is a sibling hierarchy (mirrors C#): PredictionExchange
    // extends Exchange, every prediction venue extends PredictionExchange, and
    // they live in ccxt::prediction with their own factory registry. The TS
    // sources say `extends Exchange`; that is remapped to PredictionExchange in
    // the generated api headers (generateImplicitAPI) and here, exactly like C#.

    predictionTypedApiLines (): string[] {
        // the same facade loop as transpileTypedApi, but the structNames map
        // INCLUDES the Prediction* structs so PredictionTicker/... returns map
        const ir = extractTypesIR ('./ts/src/base/types.ts');
        const renames: Record<string, string> = {
            'FeeInterface': 'Fee',
            'CurrencyInterface': 'Currency',
            'MarketInterface': 'Market',
            'TradingFeeInterface': 'TradingFee',
        };
        const structNames = new Map<string, string> ();
        for (const t of ir.types) {
            if (t.name === 'FeeStringInterface') {
                continue;
            }
            if (t.kind === 'interface' || t.kind === 'dictionary'
                || (t.kind === 'tuple' && (t.name === 'OHLCV' || t.name === 'OHLCVC'))) {
                structNames.set (t.name, renames[t.name] !== undefined ? renames[t.name] : t.name);
            }
        }
        for (const t of ir.types) {
            if (t.kind === 'alias' && t.aliasOf !== undefined && !structNames.has (t.name)) {
                const target = t.aliasOf.split ('|').map ((s) => s.trim ()).filter ((s) => s !== 'undefined' && s !== 'null')[0];
                if (target !== undefined && structNames.has (target)) {
                    structNames.set (t.name, structNames.get (target)!);
                }
            }
        }
        const src = fs.readFileSync (PREDICTION_BASE_FILE, 'utf8');
        const re = /^    (?:async\s+)?([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([^)]*)\)\s*:\s*Promise<([^{]+?)>\s*\{/gm;
        const emitted = new Set<string> ();
        const lines: string[] = [];
        let match;
        while ((match = re.exec (src)) !== null) {
            const name = match[1];
            if (emitted.has (name)) {
                continue;
            }
            const ret = this.mapTypedReturn (structNames, match[3]);
            if (ret === undefined) {
                continue;
            }
            const argsText = match[2].trim ();
            const argPieces = argsText === '' ? [] : splitTopLevel (argsText);
            const decls: string[] = [];
            const convs: string[] = [];
            let mappable = true;
            for (const piece of argPieces) {
                const mapped = this.mapTypedParam (piece);
                if (mapped === undefined) {
                    mappable = false;
                    break;
                }
                decls.push (mapped.decl);
                convs.push (mapped.conv);
            }
            if (!mappable) {
                continue;
            }
            emitted.add (name);
            const pascal = name.charAt (0).toUpperCase () + name.slice (1);
            const call = 'awaitValue (std::any (this->' + name + ' (' + convs.join (', ') + ')))';
            lines.push ('    // typed facade over ' + name);
            lines.push ('    ' + ret.type + ' ' + pascal + ' (' + decls.join (', ') + ') {');
            lines.push ('        return ' + ret.wrap (call) + ';');
            lines.push ('    }');
            lines.push ('');
        }
        return lines;
    }

    transpilePredictionBase (force = true) {
        if (skipUpToDateStage ('cpp', 'prediction base', force,
            [ PREDICTION_BASE_FILE, './ts/src/base/types.ts' ],
            [ PREDICTION_BASE_HEADER, './cpp/ccxt/base/Types.h' ])) {
            return;
        }
        assertNoDroppedConstructs (PREDICTION_BASE_FILE);
        const stripped = writeOverloadStrippedFile (PREDICTION_BASE_FILE);
        const result: any = this.transpiler.transpileCppByPath (stripped);
        removeOverloadStrippedFile (stripped, PREDICTION_BASE_FILE);
        let content = result.content as string;
        // TS: PredictionExchange extends BaseExchange (= ts/src/base/Exchange.ts,
        // which is ccxt::Exchange in this port)
        content = content.replace (/class PredictionExchange\s*:\s*public BaseExchange/,
                                   'class PredictionExchange : public Exchange');
        // C++ does not inherit constructors; the backend emits none for the base
        content = content.replace (/^(class PredictionExchange\s*:\s*public Exchange\s*\{\s*\npublic:\n)/m,
                                   `$1    PredictionExchange () = default;\n    explicit PredictionExchange (std::any config) : Exchange (config) {}\n`);
        // the TS base delegates to a stored REST base instance (`base.method(...)`,
        // `describeOf(base)`); the port IS that base (PredictionExchange extends
        // Exchange), so rewrite super calls to qualified self-calls and the
        // argument form to *this -- leaving them as `base` fails the compile
        content = rewriteSuperCalls (content, 'Exchange');
        content = content.replace (/\bdescribeOf\s*\(\s*base\s*\)/g, 'describeOf(*this)');
        content = applyCommonFixes (content);
        // dispatch over the prediction surface; fall through to Exchange::callMethod
        const dispatch = this.buildDispatchTable ('PredictionExchange', content, 'Exchange');
        const typed = this.predictionTypedApiLines ().join ('\n');
        const lastBrace = content.lastIndexOf ('};');
        if (lastBrace !== -1) {
            content = content.slice (0, lastBrace) + dispatch + typed + content.slice (lastBrace);
        }
        const header = [
            '#pragma once',
            '',
            ...createGeneratedHeader (),
            '#include "Exchange.h"',
            '',
            'namespace ccxt {',
            '',
            content,
            '',
            '} // namespace ccxt',
            ''
        ].join ('\n');
        overwriteFileAndFolder (PREDICTION_BASE_HEADER, header);
        log.green ('[cpp] Transpiled prediction base to', (PREDICTION_BASE_HEADER as any).yellow);
    }

    createPredictionExchangeFile (id: string, result: any): string {
        let content = result.content as string;
        // the abstract tier carries the implicit API methods (see generateImplicitAPI)
        const parent = id + 'Api';
        content = content.replace (/^class\s+(\w+)\s*:\s*public\s+\w+/m, `class $1 : public ${parent}`);
        content = content.replace (/^(class\s+\w+\s*:\s*public\s+\w+\s*\{\s*\npublic:\n)/m,
                                   `$1    using ${parent}::${parent};\n`);
        // super/base calls resolve to the prediction base (in ccxt, one namespace up)
        content = rewriteSuperCalls (content, 'ccxt::PredictionExchange');
        // method references as values ({ping: this->ping} dict entries,
        // this->spawn(this->pong, ...)) stringify like the pro tier does
        content = this.stringifyMethodReferences (id, content, 'prediction');
        // prediction venues carry ws code (opinion watchOrderBook/handleTrades):
        // the ws value fixes must run BEFORE applyCommonFixes, exactly like the
        // pro tier and the ws base tests (ArrayCache ctors, .limit()/.append()
        // -> wsLimit/wsAppend, etc.)
        content = applyCommonFixes (this.applyWsValueFixes (content));
        // the prediction dispatch falls through to PredictionExchange::callMethod
        const dispatch = this.buildDispatchTable (id, content, 'ccxt::PredictionExchange');
        const lastBrace = content.lastIndexOf ('};');
        if (lastBrace !== -1) {
            content = content.slice (0, lastBrace) + dispatch + content.slice (lastBrace);
        }
        return [
            '#pragma once',
            '',
            ...createGeneratedHeader (),
            '#include "../base/PredictionExchange.h"',
            `#include "../api/prediction/${id}.h"`,
            '#include "PredictionFactory.h"',
            '',
            'namespace ccxt {',
            'namespace prediction {',
            '',
            content,
            '',
            '} // namespace prediction',
            '} // namespace ccxt',
            ''
        ].join ('\n');
    }

    createPredictionExchangeTu (id: string): string {
        return [
            '// PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:',
            '// https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code',
            '',
            `#include "${id}.h"`,
            '#include "PredictionFactory.h"',
            '',
            'namespace ccxt {',
            'namespace prediction {',
            'namespace factory {',
            'namespace {',
            '',
            `std::shared_ptr<ExchangeBase> create_${id} (std::any config) {`,
            `    return newExchange<ccxt::prediction::${id}> (config);`,
            '}',
            '',
            `struct Registrar_${id} {`,
            `    Registrar_${id} () { registerPredictionExchange ("${id}", &create_${id}); }`,
            '};',
            '',
            `static Registrar_${id} g_registrar_${id};`,
            '',
            '} // namespace',
            '} // namespace factory',
            '} // namespace prediction',
            '} // namespace ccxt',
            ''
        ].join ('\n');
    }

    transpilePredictionExchangeFiles (ids: string[], force = true) {
        let files = ids.map ((id) => 'prediction/' + id + '.ts');
        files = filterDirtyExchangeFiles ('cpp', files, force, (file: string) => ({
            'tsPath': './ts/src/' + file,
            'outputs': [ PREDICTION_FOLDER + path.basename (file, '.ts') + '.h' ],
        }));
        if (!files.length) {
            return;
        }
        log.blue ('[cpp] Transpiling prediction [', files.join (', '), ']');
        for (const file of files) {
            const id = path.basename (file, '.ts');
            assertNoDroppedConstructs ('./ts/src/' + file);
            const result: any = this.transpiler.transpileCppByPath ('./ts/src/' + file);
            overwriteFileAndFolder (PREDICTION_FOLDER + id + '.h', this.createPredictionExchangeFile (id, result));
            overwriteFileAndFolder (PREDICTION_FOLDER + 'tu_' + id + '.cpp', this.createPredictionExchangeTu (id));
            log.green ('[cpp] Transpiled prediction', (id as any).yellow);
        }
    }

    // -----------------------------------------------------------------------
    // base tests
    // -----------------------------------------------------------------------
    //
    // The TS base tests are free functions, so unlike C# (which folds them into
    // `partial class BaseTest`) each becomes a plain header with a free function.

    async transpileBaseTests (force = true) {
        const names = fs.readdirSync (TS_BASE_TESTS_FOLDER)
            .filter ((f) => f.endsWith ('.ts'))
            .map ((f) => f.replace ('.ts', ''))
            .filter ((name) => {
                const source = fs.readFileSync (TS_BASE_TESTS_FOLDER + name + '.ts').toString ();
                return !source.includes ('// NO_AUTO_TRANSPILE');
            });

        if (skipUpToDateStage ('cpp', 'base tests', force, testStageInputs (),
            names.map ((name) => BASE_TESTS_FOLDER + name + '.h'))) {
            return;
        }

        for (const name of names) {
            assertNoDroppedConstructs (TS_BASE_TESTS_FOLDER + name + '.ts');
            const result: any = this.transpiler.transpileCppByPath (TS_BASE_TESTS_FOLDER + name + '.ts');
            // ws fixes first: test.safeMethods constructs the ws caches, and the
            // member-call rewrite must win over applyCommonFixes' storeArray rewrite
            let content = applyCommonFixes (this.applyWsValueFixes (result.content as string));
            content = this.applyTestFixes (content);
            content = this.stagedTestFunctions (content, name);
            content = this.forwardDeclarations (content);
            const file = [
                '#pragma once',
                '',
                ...createGeneratedHeader (),
                '#include "../../BaseTest.Bridge.h"',
                '',
                content,
                ''
            ].join ('\n');
            overwriteFileAndFolder (BASE_TESTS_FOLDER + name + '.h', file);
        }
        log.green ('[cpp] Transpiled', String (names.length), 'base tests to', (BASE_TESTS_FOLDER as any).yellow);
    }

    applyTestFixes (content: string): string {
        return this.stripGeneratedEquals (content)
            // `new ccxt.Exchange({...})` — the backend only recognises a bare identifier
            // constructor, so a qualified one loses its type and emits `undefined x = `
            .replace (/\bundefined (\w+) = ccxt\.Exchange\(/g, 'ccxt::Exchange $1 = ccxt::Exchange(')
            .replace (/\bccxt\.Exchange\b/g, 'ccxt::Exchange')
            // the shared assertion helpers are hand-written in BaseTest.Bridge.h
            .replace (/\btestSharedMethods\./g, '')
            .replace (/\bassert\(/g, 'assertTrue(');
    }

    // ws value-model fixes (cache + order book classes from cpp/ccxt/base/ws/). Must
    // run BEFORE applyCommonFixes: its `.storeArray(` rewrite would otherwise turn the
    // free-function test calls into `this->storeArray (...)`, which has no `this`.
    // Scoped to the base/ws test pipeline — the names cannot appear in exchange code.
    applyWsValueFixes (content: string): string {
        const BOOK_FACTORIES: Record<string, string> = {
            'OrderBook': 'ccxt::ws::wsOrderBook',
            'IndexedOrderBook': 'ccxt::ws::indexedOrderBook',
            'CountedOrderBook': 'ccxt::ws::countedOrderBook',
        };
        return outsideStringLiterals (content, (masked) => masked
            // the JS book class ladder collapses onto one C++ class + a mode factory
            .replace (/\b(OrderBook|IndexedOrderBook|CountedOrderBook) (\w+) = \1\(/g,
                (_m, cls, name) => 'ccxt::ws::WsOrderBook ' + name + ' = ' + BOOK_FACTORIES[cls] + '(')
            // reassignment: `book = IndexedOrderBook (input)` (no declaration)
            .replace (/= (OrderBook|IndexedOrderBook|CountedOrderBook)\(/g,
                (_m, cls) => '= ' + BOOK_FACTORIES[cls] + '(')
            // caches keep their names, namespaced
            .replace (/\b(ArrayCache(?:BySymbolById|ByTimestamp|ByOutcomeById|BySymbolBySide)?) (\w+) = \1\(/g,
                'ccxt::ws::$1 $2 = ccxt::ws::$1(')
            .replace (/= (ArrayCache(?:BySymbolById|ByTimestamp|ByOutcomeById|BySymbolBySide)?)\(/g,
                '= ccxt::ws::$1(')
            // bare constructor in an expression position (dict/list literal, call arg)
            .replace (/([,{(] ?)(ArrayCache(?:BySymbolById|ByTimestamp|ByOutcomeById|BySymbolBySide)?)\(/g,
                '$1ccxt::ws::$2(')
            // member calls on std::any receivers -> free helpers over the shared store
            .replace (/\b([A-Za-z_]\w*)\.storeArray\(/g, '::wsStoreArray($1, ')
            .replace (/\b([A-Za-z_]\w*)\.store\(/g, '::wsStore($1, ')
            .replace (/\b([A-Za-z_]\w*)\.limit\(\)/g, '::wsLimit($1)')
            .replace (/\b([A-Za-z_]\w*)\.append\(/g, '::wsAppend($1, ')
            .replace (/\b([A-Za-z_]\w*)\.getLimit\(/g, '::wsGetLimit($1, ')
            .replace (/\b([A-Za-z_]\w*)\.clear\(\)/g, '::wsClear($1)')
            // a no-arg reset means "rebuild from the stored snapshot" (ws reset)
            .replace (/\b([A-Za-z_]\w*)\.reset\(\s*\)/g, '::wsReset($1)')
            .replace (/\b([A-Za-z_]\w*)\.hashmap\b/g, '::getValue($1, std::string("hashmap"))')
            // member rewrites on this-> receivers emit `this->::name(` — collapse
            .replace (/this->::(getValue|wsAppend|wsStore|wsStoreArray|wsLimit|wsGetLimit|wsClear)\b/g, '::$1'));
    }

    // -----------------------------------------------------------------------
    // ws base tests: ts/src/pro/test/base/{test.cache,test.orderBook}.ts ->
    // cpp/tests/Generated/Base/Ws/*.h — same pipeline as transpileBaseTests,
    // mirroring csharpTranspiler.transpileWs{Cache,Orderbook}TestsToCSharp
    // -----------------------------------------------------------------------

    async transpileWsBaseTests (force = true) {
        const names = [ 'test.cache', 'test.orderBook' ];
        const outputs = names.map ((name) => BASE_TESTS_FOLDER + 'Ws/' + name + '.h');
        if (skipUpToDateStage ('cpp', 'ws base tests', force, testStageInputs (), outputs)) {
            return;
        }
        for (const name of names) {
            const source = TS_PRO_BASE_TESTS_FOLDER + name + '.ts';
            assertNoDroppedConstructs (source);
            const result: any = this.transpiler.transpileCppByPath (source);
            let content = this.applyWsValueFixes (result.content as string);
            content = applyCommonFixes (content);
            content = this.applyTestFixes (content);
            content = this.forwardDeclarations (content);
            const file = [
                '#pragma once',
                '',
                ...createGeneratedHeader (),
                '#include "../../../BaseTest.Bridge.h"',
                '',
                content,
                ''
            ].join ('\n');
            overwriteFileAndFolder (BASE_TESTS_FOLDER + 'Ws/' + name + '.h', file);
        }
        log.green ('[cpp] Transpiled', String (names.length), 'ws base tests to', (BASE_TESTS_FOLDER + 'Ws/' as any).yellow);
    }

    // C++ resolves free functions in declaration order, but the transpiler emits them in
    // source order and TS hoists -- test.extend calls tbfeCheckExtended before defining
    // it. Emitting a forward declaration for every function in the file removes the
    // ordering dependency entirely rather than reordering definitions, which would be
    // fragile as the TS sources change.
    forwardDeclarations (content: string): string {
        const signature = /^(std::any|void|bool|std::shared_future<std::any>) ([a-zA-Z_]\w*)\s*\(([^)]*)\)\s*$/gm;
        const declarations: string[] = [];
        const seen = new Set<string> ();
        let match: RegExpExecArray | null;
        while ((match = signature.exec (content)) !== null) {
            const [ , returnType, name, args ] = match;
            if (seen.has (name)) {
                continue;
            }
            seen.add (name);
            declarations.push (`${returnType} ${name}(${args});`);
        }
        if (!declarations.length) {
            return content;
        }
        return '// forward declarations - TS hoists function declarations, C++ does not\n'
            + declarations.join ('\n') + '\n\n' + content;
    }

    // Functions the generated file defines but this iteration cannot compile, because
    // they exercise a runtime layer that is deliberately absent. Excising them here --
    // definition AND call sites -- keeps the rest of the file gated instead of dropping
    // the whole test, and cpp/tests/main.cpp lists what was removed so the gap stays
    // visible. Never add an entry to hide a genuine failure.
    stagedTestFunctions (content: string, file: string): string {
        const staged: { [name: string]: string } = {
            // (empty since the ws layer landed; keep the mechanism for future gaps)
        };
        const name = staged[file];
        if (!name) {
            return content;
        }
        const definition = new RegExp (`^(?:std::any|void) ${name}\\(\\)\\n\\{[\\s\\S]*?\\n\\}\\n`, 'm');
        if (!definition.test (content)) {
            throw new Error (`[cpp] staged function ${name} not found in ${file}; remove the entry from stagedTestFunctions`);
        }
        return content
            .replace (definition, '')
            .replace (new RegExp (`^\\s*${name}\\(\\);\\s*$`, 'gm'), '');
    }

    // test.safeMethods defines a file-local `equals` whose only statement is a for-of,
    // which the backend drops -- the emitted body is `return true`, so every comparison
    // in that file would pass. Drop the definition; BaseTest.Bridge.h hand-writes a
    // deep-equality `equals` for the generated callers to resolve to, exactly as
    // cs/tests/BaseTest.Bridge.cs does.
    stripGeneratedEquals (content: string): string {
        const anyT = '(?:std::any|ccxt::any)';
        if (process.env.CPP_DEBUG_STRIP) {
            const i = content.indexOf ('equals');
            fs.writeFileSync ('/tmp/strip-debug.inc', content.slice (Math.max (0, i - 200), i + 400));
        }
        const sigRe = new RegExp ('^' + anyT + ' equals\\(' + anyT + ' a, ' + anyT + ' b\\)', 'gm');
        let out = content
            // the hoisted forward declaration (TS hoists the helper; the definition is stripped)
            .replace (new RegExp ('^' + anyT + ' equals\\(' + anyT + ' a, ' + anyT + ' b\\);$', 'gm'), '');
        // the definition: the body has nested if-blocks (braces on their own
        // lines — the backend's formatting), so strip from the signature line
        // to the MATCHING closing brace by depth counting; a lazy regex stops
        // at the first inner '}' and leaves orphan body lines behind
        let m = null;
        while ((m = sigRe.exec (out)) !== null) {
            const open = out.indexOf ('{', m.index + m[0].length);
            if (open < 0) {
                break;
            }
            let depth = 0;
            let end = -1;
            for (let i = open; i < out.length; i++) {
                if (out[i] === '{') {
                    depth++;
                } else if (out[i] === '}') {
                    depth--;
                    if (depth === 0) {
                        end = i;
                        break;
                    }
                }
            }
            if (end < 0) {
                break;
            }
            let stripEnd = end + 1;
            if (out[stripEnd] === '\n') {
                stripEnd++;
            }
            out = out.slice (0, m.index) + out.slice (stripEnd);
            sigRe.lastIndex = 0;
        }
        return out;
    }

    // -----------------------------------------------------------------------
    // exchange tests: ts/src/test/tests.ts + ts/src/test/Exchange/** -> .inc
    // fragments included inside the handwritten testMainClass bridge class,
    // mirroring csharpTranspiler.transpileExchangeTests
    // -----------------------------------------------------------------------

    transpileMainTest () {
        const tsFile = './ts/src/test/tests.ts';
        const outFile = EXCHANGE_TESTS_FOLDER + 'testMainClass.inc';
        const input = escapeMultilineStringLiterals (fs.readFileSync (tsFile).toString ());
        const result: any = this.transpiler.transpileCpp (input);
        if (process.env.CPP_DEBUG_RAW) {
            fs.writeFileSync (process.env.CPP_DEBUG_RAW, result.content);
        }
        const fixed = applyExchangeTestFixes (result.content);
        if (process.env.CPP_DEBUG_FIXED) {
            fs.writeFileSync (process.env.CPP_DEBUG_FIXED, fixed);
        }
        const members = stripClassWrapper (fixed);
        overwriteFileAndFolder (outFile,
            createGeneratedHeader ().join ('\n') + members);
        log.green ('[cpp] Transpiled tests.ts to', outFile.yellow);
    }

    transpileExchangeTestFiles () {
        const folders: { dir: string, out: string }[] = [
            { dir: './ts/src/test/Exchange/', out: EXCHANGE_TESTS_FOLDER + 'Exchange/' },
            { dir: './ts/src/test/Exchange/base/', out: EXCHANGE_TESTS_FOLDER + 'Exchange/Base/' },
        ];
        const written: string[] = [];
        for (const folder of folders) {
            const files = fs.readdirSync (folder.dir).filter ((f) => f.endsWith ('.ts'));
            for (const file of files) {
                const name = file.replace ('.ts', '');
                const source = escapeMultilineStringLiterals (
                    fs.readFileSync (folder.dir + file).toString ());
                let content = transpileFunctionsInChunks (this.transpiler, source, file);
                // the sharedMethods default export object is skipped by the chunker,
                // and call sites elsewhere reference it as `testSharedMethods.x`;
                // the prefix is stripped so the bare member names resolve inside
                // the bridge class
                content = content.replace (/\btestSharedMethods\./g, '');
                content = content.replace (/\bassert\s*\(/g, 'assertTrue(');
                // the sharedMethods file emits free functions; inside the bridge
                // class they become members, so `exchange` params keep their name
                const outFile = folder.out + name + '.inc';
                overwriteFileAndFolder (outFile,
                    createGeneratedHeader ().join ('\n') + content);
                written.push (outFile);
            }
        }
        // an include list so the handwritten bridge class pulls in everything
        // without hand-maintaining 70 include lines; paths are relative to
        // Generated/Exchange/Includes.inc
        const includesRoot = EXCHANGE_TESTS_FOLDER + 'Exchange/';
        const includes = written
            .map ((f) => {
                const rel = path.relative (includesRoot, f).replace (new RegExp ('\\' + path.sep, 'g'), '/');
                return `#include "${rel}"`;
            })
            .join ('\n');
        overwriteFileAndFolder (EXCHANGE_TESTS_FOLDER + 'Exchange/Includes.inc',
            createGeneratedHeader ().join ('\n') + includes + '\n');
        log.green ('[cpp] Transpiled', String (written.length), 'exchange test files');
    }

    // The per-method test functions become testMainClass members (via the .inc
    // includes), but tests.ts reaches them through the testFiles dict and
    // callMethod -- with reflection in C#, with generated thunks here. One thunk
    // per method, uniform signature, args unpacked by arity.
    transpileTestRegistry () {
        const dir = './ts/src/test/Exchange/';
        const files = fs.readdirSync (dir).filter ((f) => f.endsWith ('.ts'));
        const entries: string[] = [];
        for (const file of files) {
            const source = escapeMultilineStringLiterals (
                fs.readFileSync (dir + file).toString ());
            // the unified method name comes from the file name (test.fetchTicker.ts ->
            // fetchTicker), exactly like C# BaseTest.Helpers.cs builds "test" + Upper(key)
            // from the lowercase key. Matching the first function in the file instead is
            // wrong -- several files define local helpers above the test function.
            const methodName = file.replace (/^test\./, '').replace (/\.ts$/, '');
            const fnName = 'test' + methodName.charAt (0).toUpperCase () + methodName.slice (1);
            const fnMatch = source.match (new RegExp ('^(?:async\\s+)?function\\s+(' + fnName + ')\\s*\\(([^)]*)\\)', 'm'));
            if (!fnMatch) {
                log.warn ('[cpp] no function ' + fnName + ' found in ' + file + '; skipped in registry');
                continue;
            }
            const name = fnMatch[1];
            const params = fnMatch[2].split (',').map ((p) => p.trim ()).filter ((p) => p.length);
            // first two are always (exchange, skippedProperties)
            const extra = params.slice (2);
            const arity = extra.length;
            const unpack = extra.map ((p, i) => {
                const pname = (p.split ('=')[0].split (':')[0]).trim ();
                return `const std::any a${i} = argv.size () > ${i} ? argv[${i}] : std::any {};`;
            }).join (' ');
            const callArgs = extra.map ((_p, i) => `a${i}`).join (', ');
            const call = `return self->${name} (exchange, skippedProperties${callArgs ? ', ' + callArgs : ''});`;
            entries.push (
`        { std::string ("${methodName}"), TestEntry { [] (testMainClass* self, std::any exchange, std::any skippedProperties, std::any args) -> std::any {
            const auto& argv = std::any_cast<ccxt::list> (args).items ();
            ${unpack}${call}
        } } },`
            );
        }
        const registry =
`#pragma once

// PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:
// https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code

// One thunk per transpiled exchange test method, keyed by the unified method name
// (testFetchTicker -> "fetchTicker"). tests.ts reaches the tests through the
// testFiles dict + callMethod; C# resolves them by reflection, C++ by this table.
struct TestEntry {
    std::function<std::any (testMainClass*, std::any, std::any, std::any)> thunk;
};

inline const std::unordered_map<std::string, TestEntry>& testRegistry () {
    static const std::unordered_map<std::string, TestEntry> registry = {
${entries.join ('\n')}
    };
    return registry;
}
`;
        overwriteFileAndFolder (EXCHANGE_TESTS_FOLDER + 'Exchange/TestRegistry.inc', registry);
        log.green ('[cpp] Generated test registry with', String (entries.length), 'entries');
    }
}

// ---------------------------------------------------------------------------
// exchange test framework (mirrors csharpTranspiler.transpileExchangeTests)
// ---------------------------------------------------------------------------

// The tests.ts class is emitted as `class testMainClass { public: ... };`. The
// C++ port has no partial classes, so the handwritten bridge owns the class
// declaration (TestMainClass.Bridge.h) and this strips the generated wrapper,
// leaving only the member list to be #included inside it -- the same D2 pattern
// as Exchange.BaseMethods.inc.
function stripClassWrapper (content: string): string {
    const start = content.indexOf ('public:');
    if (start === -1) {
        throw new Error ('[cpp] tests.ts output has no public: section');
    }
    let out = content.slice (start + 'public:'.length);
    // drop the trailing `};` that closes the class
    out = out.replace (/\n\};\s*$/, '\n');
    return out;
}

// All member/property access on the std::any `exchange` variable goes through the
// runtime registry: calls -> callDynamically, assignments -> setProperty, reads ->
// getProperty. Scanner-based because argument lists nest parentheses, and RECURSIVE:
// an assignment RHS or a call argument list is rewritten with the same pass, so
// nested `exchange.x` inside a captured region is not skipped.
function rewriteExchangeAccess (content: string): string {
    return rewriteExchangeVarImpl (content, 'exchange');
}

function rewriteExchangeVarImpl (content: string, varName: string): string {
    const needle = varName + '.';
    const IDENT = /[A-Za-z_]\w*/;
    let out = '';
    let cursor = 0;
    while (true) {
        const at = content.indexOf (needle, cursor);
        if (at === -1) {
            out += content.slice (cursor);
            return out;
        }
        out += content.slice (cursor, at);
        let i = at + needle.length;
        while (i < content.length && /[A-Za-z_0-9]/.test (content[i])) i++;
        const name = content.slice (at + needle.length, i);
        if (!name || !IDENT.test (name)) {
            out += content.slice (at, i);
            cursor = i;
            continue;
        }
        // skip whitespace to classify: call / assign / read
        let j = i;
        while (j < content.length && (content[j] === ' ' || content[j] === '\t')) j++;
        if (content[j] === '(') {
            // dynamic call with balanced args (rewritten recursively)
            let depth = 0;
            let end = -1;
            for (let k = j; k < content.length; k++) {
                if (content[k] === '(') depth++;
                else if (content[k] === ')') {
                    depth--;
                    if (depth === 0) { end = k; break; }
                }
            }
            if (end === -1) {
                out += content.slice (at, i);
                cursor = i;
                continue;
            }
            const args = rewriteExchangeVarImpl (content.slice (j + 1, end).trim (), varName);
            out += `callDynamically(${varName}, std::string("${name}"), ccxt::list{${args}})`;
            cursor = end + 1;
            continue;
        }
        if (content[j] === '=') {
            // assignment: capture to the statement-closing ';' at depth zero
            let depth = 0;
            let end = -1;
            for (let k = j + 1; k < content.length; k++) {
                const c = content[k];
                if (c === '(' || c === '{' || c === '[') depth++;
                else if (c === ')' || c === '}' || c === ']') depth--;
                else if (c === ';' && depth <= 0) { end = k; break; }
            }
            if (end === -1) {
                out += content.slice (at, i);
                cursor = i;
                continue;
            }
            const rhs = rewriteExchangeVarImpl (content.slice (j + 1, end), varName);
            out += `setProperty(${varName}, std::string("${name}"), ${rhs.trim ()});`;
            cursor = end + 1;
            continue;
        }
        // property read
        out += `getProperty(${varName}, std::string("${name}"))`;
        cursor = i;
    }
}

// Same dynamic-access rewrite for other std::any locals that hold an exchange.
function rewriteExchangeVar (content: string, varName: string): string {
    if (varName === 'exchange') {
        return content;
    }
    return content.split (`exchange.`).join (`${varName}.`);
}

function applyExchangeTestFixes (content: string): string {
    // static tests hold their exchange in `mockedExchange` (setFetchResponse wraps
    // it); the access rewrite applies to both names.
    //
    // Masking is strictly single-level per phase: applyCommonFixes has its own
    // internal maskers (rewriteAnyMemberAccess etc.), and nesting them inside the
    // mask used for the D3/var rewrites made those inner maskers mistake the outer
    // LIT tokens for their own and restore them as the literal string "undefined" —
    // which then replaced every string in the file with "std::any{}".
    const d3AndVar = outsideStringLiterals (content, (masked) => {
        const withD3 = rewriteDynamicDispatch (rewriteDynamicDispatch (masked, 'exchange'), 'mockedExchange');
        return rewriteExchangeVarImpl (rewriteExchangeVarImpl (withD3, 'exchange'), 'mockedExchange');
    });
    const commonFixed = applyCommonFixes (d3AndVar);
    // The static ws tests pair an injector future with a watcher future inside
    // testWsStatically and REQUIRE true concurrency: the injector polls for the
    // watcher's pending future before injecting each frame, so awaiting them in
    // list order (plain promiseAll) would let the injector run to completion --
    // injecting everything into a not-yet-created future, then rejecting it --
    // before the watcher ever registers. Replace exactly the two pairs inside
    // testWsStatically; every other promiseAll (runStaticTests fan-out etc) keeps
    // its sequential semantics.
    let wsFixed = commonFixed
    // parsedResponses branch: final-state assert after all frames
    .replace (/(?:std::any|ccxt::any) results = awaitValue\(promiseAll\(promises\)\);\n\s*(?:std::any|ccxt::any) unifiedResult =/,
              'ccxt::any results = awaitValue(promiseAllConcurrent(promises));\n                   ccxt::any unifiedResult =')
    // sequential branch: one watch resolution per frame
    .replace (/awaitValue\(promiseAll\(promises\)\);\n\s*this->assertWsSentMessages/,
              'awaitValue(promiseAllConcurrent(promises));\n                   this->assertWsSentMessages')
    // single-parsedResponse branch: the dispatcher awaits the watch future
    // INLINE (callMethod emits awaitValue(watchX(...))), so building the
    // promises list on the caller thread would block inside the watch chain
    // before the injector thread exists. Wrap the dispatch in a deferred
    // future so promiseAllConcurrent's worker runs it concurrently with
    // the injector, mirroring the sequential branch's shape.
    .replace (/(?:std::any|ccxt::any) promises = ccxt::list\{callExchangeMethodDynamically\(exchange, method, input\), this->injectWsMessages\(exchange, url, messages\)\};/,
              `ccxt::any promises = ccxt::list{\n                       std::async(std::launch::deferred, [=]() -> ccxt::any {\n                           return callExchangeMethodDynamically(exchange, method, input);\n                       }).share(),\n                       this->injectWsMessages(exchange, url, messages)};`);
// The backend leaks `undefined` as a bare identifier in expression contexts,
    // and its string wrapper can produce `std::string(undefined)`. Neither is
    // valid C++; the wrapped form goes first so the bare replacement never
    // yields std::string(std::any{}). Masked so real string contents
    // ("fetchEvents returned undefined") are untouched.
    return outsideStringLiterals (wsFixed, (masked) => masked
        .replace (/std::string\(undefined\)/g, 'std::any{}')
        .replace (/\bundefined\b/g, 'std::any{}'));
}

// The cpp backend's emission of a multi-function file is nondeterministic across
// processes: whole-file transpiles of test.sharedMethods.ts dropped arbitrary
// functions run to run (same input, fresh instance, 10 vs 35 emitted). Per-function
// chunks are stable -- calls between functions stay bare identifiers, which resolve
// at include time -- so every top-level function is transpiled in isolation and the
// results rejoined. Every function present in the source MUST appear in the output;
// a silent drop aborts the build instead of shipping a hole.
function transpileFunctionsInChunks (transpiler: Transpiler, tsSource: string, fileName: string): string {
    const lines = tsSource.split ('\n');
    const starts: number[] = [];
    lines.forEach ((line, i) => {
        if (/^(async\s+)?function\s+\w/.test (line) || /^export\s+default\s/.test (line)) {
            starts.push (i);
        }
    });
    starts.push (lines.length);
    const expectedNames: string[] = [];
    starts.slice (0, -1).forEach ((s) => {
        const line = lines[s];
        const fnMatch = line.match (/^(?:async\s+)?function\s+(\w+)/);
        const defMatch = line.match (/^export\s+default\s+(\w+)/);
        if (fnMatch) expectedNames.push (fnMatch[1]);
        else if (defMatch) expectedNames.push (defMatch[1]);
    });
    const chunks: string[] = [];
    for (let s = 0; s < starts.length - 1; s++) {
        chunks.push (lines.slice (starts[s], starts[s + 1]).join ('\n'));
    }
    const emitted: string[] = [];
    for (const chunk of chunks) {
        const trimmed = chunk.trim ();
        if (!trimmed) continue;
        // the `export default {...}` object literal at the end of
        // test.sharedMethods.ts is dead weight for C++ (the members are the
        // functions above it); skip it explicitly.
        if (trimmed.startsWith ('export default {')) continue;
        // `export default testX;` re-exports the function defined in the previous
        // chunk; C++ has no module system so there is nothing to emit.
        if (/^export\s+default\s+\w+;\s*$/.test (trimmed)) continue;
        let piece: string;
        try {
            piece = transpiler.transpileCpp (trimmed).content;
        } catch (e: any) {
            throw new Error (`[cpp] chunk of ${fileName} failed to transpile: ${e.message}\n${trimmed.slice (0, 400)}`);
        }
        piece = applyExchangeTestFixes (piece);
        emitted.push (piece.trimEnd () + '\n');
    }
    const joined = emitted.join ('\n');
    for (const name of expectedNames) {
        if (!new RegExp (`\\b${name}\\s*\\(`).test (joined)) {
            throw new Error (`[cpp] function ${name} in ${fileName} was silently dropped by the backend; the chunked transpile must be fixed before this file can ship`);
        }
    }
    return joined;
}

// The backend cannot emit string literals containing real newlines: it dumps the
// literal as a `//` comment, the enclosing statement disappears, and the brace
// balance of the rest of the file breaks (this corrupted assertStaticRequestOutput
// in tests.ts and cascaded into 169 phantom errors). Escaping the newlines in the
// TS source before transpiling keeps the literal as a normal one-line string; the
// string VALUE is unchanged ('\n' is the same character).
function escapeMultilineStringLiterals (source: string): string {
    let out = '';
    let quote: string | null = null;   // ' " or `
    let tickContent: string[] = [];    // buffer for a backtick literal (backend has no template support)
    for (let i = 0; i < source.length; i++) {
        const c = source[i];
        if (quote === '`') {
            if (c === '\\') {
                if (source[i + 1] === '`') {   // escaped backtick
                    tickContent.push ('`');
                    i++;
                } else {
                    tickContent.push ('\\\\');
                }
                continue;
            }
            if (c === '`') {
                // no ${} interpolation in the ccxt sources; convert to a plain
                // double-quoted literal the backend can emit
                out += '"' + tickContent.join ('') + '"';
                tickContent = [];
                quote = null;
                continue;
            }
            if (c === '"') {
                tickContent.push ('\\"');
                continue;
            }
            if (c === '\n' || c === '\r') {
                tickContent.push ('\\n');
                if (c === '\r' && source[i + 1] === '\n') {
                    i++;
                }
                continue;
            }
            tickContent.push (c);
            continue;
        }
        if (quote === null) {
            // comments must be passed through untouched: a stray quote or backtick
            // inside a comment would otherwise swallow the rest of the file
            if (c === '/' && source[i + 1] === '/') {
                const end = source.indexOf ('\n', i);
                if (end === -1) {
                    out += source.slice (i);
                    return out;
                }
                out += source.slice (i, end);
                i = end - 1;
                continue;
            }
            if (c === '/' && source[i + 1] === '*') {
                const end = source.indexOf ('*/', i + 2);
                if (end === -1) {
                    out += source.slice (i);
                    return out;
                }
                out += source.slice (i, end + 2);
                i = end + 1;
                continue;
            }
            if (c === '"' || c === "'" || c === '`') {
                quote = c;
                out += c;
            } else {
                out += c;
            }
            continue;
        }
        if (c === '\\' && quote !== '`') {
            // keep escapes intact; the escaped char must not close the literal
            out += c;
            if (i + 1 < source.length) {
                out += source[i + 1];
                i++;
            }
            continue;
        }
        if (c === quote) {
            quote = null;
            out += c;
            continue;
        }
        if (c === '\n' || c === '\r') {
            out += '\\n';
            if (c === '\r' && source[i + 1] === '\n') {
                i++;   // CRLF -> one \n
            }
            continue;
        }
        out += c;
    }
    return out;
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

async function runMain () {
    const force = process.argv.includes ('--force');
    const baseClassOnly = process.argv.includes ('--baseClass');
    const baseTestsOnly = process.argv.includes ('--baseTests');
    const exchangeTestsOnly = process.argv.includes ('--tests');
    const proOnly = process.argv.includes ('--pro');
    const predictionOnly = process.argv.includes ('--prediction');
    const typedApiOnly = process.argv.includes ('--typedApi');
    const allExchangesOnly = process.argv.includes ('--all');
    const ids = process.argv.slice (2).filter ((x) => !x.startsWith ('--'));

    const driver = new CppTranspilerDriver ();

    if (baseClassOnly) {
        driver.transpileErrorHierarchy (force);
        driver.transpileBaseMethods (TS_BASE_FILE, force);
        driver.transpileTypedApi (TS_BASE_FILE, force);
        return;
    }
    if (typedApiOnly) {
        driver.transpileTypedApi (TS_BASE_FILE, true);
        return;
    }
    if (baseTestsOnly) {
        await driver.transpileBaseTests (force);
        await driver.transpileWsBaseTests (force);
        return;
    }
    if (exchangeTestsOnly) {
        driver.transpileMainTest ();
        driver.transpileExchangeTestFiles ();
        driver.transpileTestRegistry ();
        return;
    }
    if (proOnly) {
        // pro (WebSocket) tier: ts/src/pro/<id>.ts -> cpp/ccxt/pro/<id>.h. Named ids
        // or the whole ws-fixture-backed set (static/ws/<id>.json dir listing).
        const proIds = ids.length
            ? ids
            : fs.readdirSync ('./ts/src/test/static/ws/')
                  .filter ((f) => f.endsWith ('.json'))
                  .map ((f) => f.replace ('.json', ''));
        driver.transpileProExchangeFiles (proIds, force);
        return;
    }
    if (predictionOnly) {
        // prediction tier: ts/src/prediction/<id>.ts -> cpp/ccxt/prediction/<id>.h.
        // Named ids or the whole exchanges.json prediction set.
        const predictionIds = ids.length
            ? ids
            : JSON.parse (fs.readFileSync ('./exchanges.json', 'utf8')).prediction || [];
        driver.transpilePredictionBase (force);
        driver.transpilePredictionExchangeFiles (predictionIds, force);
        return;
    }
    if (ids.length) {
        // a named exchange always rebuilds: the caller asked for it explicitly
        driver.transpileDerivedExchangeFiles (ids, true);
        return;
    }
    if (allExchangesOnly) {
        // the full port: every exchange in exchanges.json (the port's registered
        // scope -- 104 venues), plus base + test framework. The static-test registry
        // is built from the fixture dirs separately and covers the 89 venues that
        // have static fixtures upstream.
        const exchangeIds: string[] = JSON.parse (fs.readFileSync ('./exchanges.json', 'utf8')).ids;
        const predictionIds: string[] = JSON.parse (fs.readFileSync ('./exchanges.json', 'utf8')).prediction || [];
        driver.transpileErrorHierarchy (force);
        driver.transpileBaseMethods (TS_BASE_FILE, force);
        driver.transpileTypedApi (TS_BASE_FILE, force);
        await driver.transpileBaseTests (force);
        await driver.transpileWsBaseTests (force);
        driver.transpileMainTest ();
        driver.transpileExchangeTestFiles ();
        driver.transpileTestRegistry ();
        driver.transpileDerivedExchangeFiles (exchangeIds, force);
        driver.transpilePredictionBase (force);
        driver.transpilePredictionExchangeFiles (predictionIds, force);
        log.bright.green ('[cpp] Transpiled all exchanges.');
        return;
    }
    driver.transpileErrorHierarchy (force);
    driver.transpileBaseMethods (TS_BASE_FILE, force);
    driver.transpileTypedApi (TS_BASE_FILE, force);
    await driver.transpileBaseTests (force);
    await driver.transpileWsBaseTests (force);
    log.bright.green ('[cpp] Transpiled successfully.');
}

if (isMainEntry (metaUrl)) {
    await runMain ();
}

export { CppTranspilerDriver, applyExchangeTestFixes, escapeMultilineStringLiterals, stripClassWrapper };
