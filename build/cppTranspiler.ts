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
const TRADING_METHODS_FILE  = './cpp/ccxt/base/Exchange.TradingMethods.inc';
const ERRORS_FILE           = './cpp/ccxt/base/Errors.h';
const EXCHANGES_FOLDER      = './cpp/ccxt/exchanges/';
const BASE_TESTS_FOLDER     = './cpp/tests/Generated/Base/';
const TS_BASE_TESTS_FOLDER  = './ts/src/test/base/';

const DELIMITER = 'METHODS BELOW THIS LINE ARE TRANSPILED FROM TYPESCRIPT';

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

function overwriteFileAndFolder (filePath: string, content: string) {
    if (!fs.existsSync (filePath)) {
        checkCreateFolder (filePath);
    }
    overwriteFile (filePath, formatCppSource (filePath, content));
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
// dynamic property reads to getProperty.
//
// Done with a scanner rather than a regex because the argument list nests parentheses.
function rewriteDynamicDispatch (content: string): string {
    const NEEDLE = '::getValue(this, ';
    let out = '';
    let cursor = 0;
    for (;;) {
        const at = content.indexOf (NEEDLE, cursor);
        if (at === -1) {
            out += content.slice (cursor);
            return out;
        }
        // find the ')' closing the getValue call
        let depth = 0;
        let i = at + '::getValue('.length - 1;
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
        if (content[keyEnd + 1] !== '(') {
            // a bare property read: this[key]
            out += content.slice (cursor, at) + `getProperty(this, ${key})`;
            cursor = keyEnd + 1;
            continue;
        }
        // a dynamic call: this[key](args...) — capture the balanced argument list
        depth = 0;
        let argsEnd = -1;
        for (i = keyEnd + 1; i < content.length; i++) {
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
        const args = content.slice (keyEnd + 2, argsEnd).trim ();
        const argList = args.length ? `ccxt::list{${args}}` : 'ccxt::list{}';
        out += content.slice (cursor, at) + `callDynamically(this, ${key}, ${argList})`;
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
    const asDictValue = new RegExp (`(\\{ std::string\\("[^"]*"\\), )(${alternation})( \\})`, 'g');
    return content.replace (asDictValue, '$1std::string("$2")$3');
}

// D3c — SUPER_TOKEN is 'base', copy-pasted from the C# backend, so `super.foo()`
// emits `base.foo()`. Rewrite to a qualified call on the actual parent.
function rewriteSuperCalls (content: string, parentClass: string): string {
    return content.replace (/\bbase\.(\w+)\s*\(/g, `${parentClass}::$1(`);
}

// TS `catch (e) { ... throw e; }` becomes `catch (const std::exception& e) { ... throw e; }`,
// which SLICES: rethrowing the caught reference by value copies it down to the static
// type, so a BadRequest leaves the catch block as a bare std::exception and every
// `catch (const BadRequest&)` further up stops matching. It also destroys the message,
// which is how 227 static request fixtures came to report only "std::exception".
// `throw;` rethrows the original object untouched.
function rewriteRethrow (content: string): string {
    return content.replace (/\bthrow e;/g, 'throw;');
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
    return content
        .replace (/\bclient\.(resolve|reject)\s*\(/g, 'this->$1(')
        .replace (/\bclient\.([A-Za-z_]\w*)\b(?!\s*\()/g, '::getValue(client, std::string("$1"))');
}

// `Precise.stringAdd(...)` is a static call on an imported class; the backend has no
// notion of namespaces so it emits the TS member-access form.
function rewritePreciseCalls (content: string): string {
    return content.replace (/\bPrecise\.(string\w+)\s*\(/g, 'ccxt::Precise::$1(');
}

// A TS local may share a name with a helper (`const isArray = Array.isArray(x)`), and in
// C++ the name is in scope inside its own initialiser, so the call resolves to the
// half-declared variable. Qualify the call.
function rewriteSelfShadowingLocals (content: string): string {
    return content.replace (/std::any (\w+) = \1\(/g, 'std::any $1 = ::$1(');
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
function outsideStringLiterals (content: string, transform: (s: string) => string): string {
    const literals: string[] = [];
    const masked = content.replace (/"(?:[^"\\]|\\.)*"/g, (match) => {
        literals.push (match);
        return `\u0000LIT${literals.length - 1}\u0000`;
    });
    return transform (masked).replace (/\u0000LIT(\d+)\u0000/g, (_m, i) => literals[Number (i)]);
}

function rewriteAnyMemberAccess (content: string): string {
    return outsideStringLiterals (content, (masked) => masked
        .replace (/\b([A-Za-z_]\w*)\.storeArray\(/g, 'this->storeArray($1, ')
        .replace (/\b([A-Za-z_]\w*)\.describe\(\)/g, '::describeOf($1)')
        .replace (/\b([A-Za-z_]\w*)\.reset\(/g, '::resetOrderBook($1, ')
        .replace (new RegExp (`\\b([A-Za-z_]\\w*)\\.(${ANY_PROPERTIES})\\b(?!\\s*\\()`, 'g'),
                  '::getValue($1, std::string("$2"))'));
}

function applyCommonFixes (content: string): string {
    return rewriteRethrow (
        rewriteErrorClassValues (
        rewriteInstanceOf (
            rewritePreciseCalls (
                rewriteSelfShadowingLocals (
                rewriteAnyMemberAccess (
                rewriteWsClientAccess (
                    rewriteAsyncLambdasMutable (
                        rewriteDynamicDispatch (content)))))))));
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
            [ BASE_METHODS_FILE, TRADING_METHODS_FILE ])) {
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

        overwriteFileAndFolder (BASE_METHODS_FILE, header + applyCommonFixes (baseMethods) + '\n');
        log.green ('[cpp] Transpiled base methods to', (BASE_METHODS_FILE as any).yellow);

        if (tradingMethods.length) {
            overwriteFileAndFolder (TRADING_METHODS_FILE, header + applyCommonFixes (tradingMethods) + '\n');
            log.green ('[cpp] Transpiled trading methods to', (TRADING_METHODS_FILE as any).yellow);
        }
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
            const result: any = this.transpiler.transpileCppByPath ('./ts/src/' + file);
            overwriteFileAndFolder (EXCHANGES_FOLDER + id + '.h', this.createExchangeFile (id, result));
            log.green ('[cpp] Transpiled', (id as any).yellow);
        }
    }

    // The static request/response tests call methods by name ("fetchTicker") with an
    // argument list read out of a JSON fixture. C++ has no reflection, so the dispatch
    // has to be generated: scan the emitted class for its public async methods and emit
    // a name -> call table. Arity is taken from the signature, and every argument is
    // read positionally out of the list, so a fixture that supplies fewer arguments
    // than the signature declares simply leaves the rest undefined -- exactly what the
    // TS harness does by spreading a short array.
    createDispatchTable (id: string, content: string): string {
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
        return this.buildDispatchTable (id, scanned);
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

    buildDispatchTable (id: string, content: string): string {
        // `virtual` is optional: the backend emits it on some methods and only
        // `override` on others. Only the NAME is matched here -- the parameter list is
        // scanned by hand below, because a default value can itself contain parentheses
        // and commas (`std::any timeframe = std::string("1m")`), and a `[^)]*` capture
        // truncates there. That silently gave fetchOHLCV an arity of 2 instead of 5, so
        // the dispatcher dropped timeframe/since/limit and every OHLCV fixture built a
        // request with default values.
        const signature = /^[ \t]*(?:virtual )?std::shared_future<std::any> (\w+)\(/gm;
        const seen = new Set<string> ();
        const branches: string[] = [];
        let match: RegExpExecArray | null;
        while ((match = signature.exec (content)) !== null) {
            const name = match[1];
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
                    `            if (${test}) return awaitValue(this->${name}(${passed.join (', ')}));`
                );
            }
            branches.push (
                `        if (which == "${name}") {\n${arms.join ('\n')}\n        }`
            );
        }
        return [
            '    // GENERATED dispatch table - see createDispatchTable in build/cppTranspiler.ts',
            '    virtual std::any callMethod (std::any name, std::any args) override {',
            '        const std::string which = ::toString(name).has_value()',
            '            ? std::any_cast<std::string>(::toString(name)) : std::string();',
            '        const long count = ccxt::isList(args)',
            '            ? static_cast<long>(std::any_cast<ccxt::list>(args).size()) : 0;',
            ...branches,
            `        throw NotSupported (std::string("${id} has no unified method ") + which);`,
            '    }',
            ''
        ].join ('\n');
    }

    createExchangeFile (id: string, result: any): string {
        let content = result.content as string;
        // the abstract tier carries the implicit API methods (see generateImplicitAPI)
        const parent = id + 'Api';
        content = content.replace (/^class\s+(\w+)\s*:\s*public\s+\w+/m, `class $1 : public ${parent}`);
        // C++ does not inherit constructors, and the backend emits none, so the class
        // would only have the implicit default one -- `binance(config)` would not
        // compile. Pull the parent's in explicitly.
        content = content.replace (/^(class\s+\w+\s*:\s*public\s+\w+\s*\n?\{\s*\npublic:\n)/m,
                                   `$1    using ${parent}::${parent};\n`);
        content = rewriteSuperCalls (content, parent);
        content = applyCommonFixes (content);
        // append the dispatch table inside the class body, just before its closing `};`
        const dispatch = this.createDispatchTable (id, content);
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
            let content = applyCommonFixes (result.content as string);
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
            // needs ArrayCache/ArrayCacheByTimestamp/ArrayCacheBySymbolById/BySide from
            // ts/src/base/ws/Cache.ts; the pro layer is a non-goal this iteration
            'test.safeMethods': 'testCacheSafeCalls',
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
        return content.replace (
            /^std::any equals\(std::any a, std::any b\)\n\{[\s\S]*?\n\}\n/m,
            ''
        );
    }
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

async function runMain () {
    const force = process.argv.includes ('--force');
    const baseClassOnly = process.argv.includes ('--baseClass');
    const baseTestsOnly = process.argv.includes ('--baseTests');
    const ids = process.argv.slice (2).filter ((x) => !x.startsWith ('--'));

    const driver = new CppTranspilerDriver ();

    if (baseClassOnly) {
        driver.transpileErrorHierarchy (force);
        driver.transpileBaseMethods (TS_BASE_FILE, force);
        return;
    }
    if (baseTestsOnly) {
        await driver.transpileBaseTests (force);
        return;
    }
    if (ids.length) {
        // a named exchange always rebuilds: the caller asked for it explicitly
        driver.transpileDerivedExchangeFiles (ids, true);
        return;
    }
    driver.transpileErrorHierarchy (force);
    driver.transpileBaseMethods (TS_BASE_FILE, force);
    await driver.transpileBaseTests (force);
    log.bright.green ('[cpp] Transpiled successfully.');
}

if (isMainEntry (metaUrl)) {
    await runMain ();
}

export { CppTranspilerDriver };
