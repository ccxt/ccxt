import Transpiler, { alignGoTrailingComments } from "ast-transpiler";
import path from 'path';
import errors from "../js/src/base/errors.js";
import { basename, resolve } from 'path';
import { createFolderRecursively, overwriteFile, checkCreateFolder } from './fsLocal.js';
import { writeOverloadStrippedFile, removeOverloadStrippedFile, restoreParamsBagInitializers } from './stripOverloads.js';
// import { writeFile } from 'fs/promises';
import { platform } from 'process';
import { spawnSync } from 'child_process';
import fs from 'fs';
import log from 'ololog';
import ansi from 'ansicolor';
import {Transpiler as OldTranspiler } from "./transpile.js";
import errorHierarchy from '../js/src/base/errorHierarchy.js';
import Piscina from 'piscina';
import os from 'os';
import { isMainEntry } from "./transpile.js";
import { filterDirtyExchangeFiles, skipUpToDateStage, testStageInputs } from "./transpile.js";
import { installCcxtGoLocalTypes, installCcxtGoIndexableTypes, CCXT_GO_HELPER_RETURN_TYPES, CCXT_GO_BOOL_METHOD_NAMES, CCXT_GO_STRING_PTR_METHOD_NAMES } from './go-local-types.js';

type dict = { [key: string]: string };

// required non-symbol string params (order ids, currency codes, addresses): merged into the table below
const GO_UNIFIED_REQUIRED_ID_PARAMS: { [method: string]: number[] } = {
    'fetchDepositAddress': [ 0 ], 'createDepositAddress': [ 0 ], 'fetchDepositAddressesByNetwork': [ 0 ],
    'fetchContractDepositAddress': [ 0 ], 'cancelOrderWs': [ 0 ], 'editOrderWs': [ 0 ], 'fetchOrderWs': [ 0 ],
    'cancelSpotOrder': [ 0 ], 'cancelContractOrder': [ 0 ], 'fetchOrderStatus': [ 0 ], 'editLimitOrder': [ 0 ],
    'editLimitBuyOrder': [ 0 ], 'editLimitSellOrder': [ 0 ], 'editOrderWithClientOrderId': [ 0 ],
    'fetchOrderWithClientOrderId': [ 0 ], 'cancelOrderWithClientOrderId': [ 0 ], 'createConvertTrade': [ 0, 1, 2 ],
    'fetchConvertQuote': [ 0, 1 ], 'fetchConvertTrade': [ 0 ], 'repayCrossMargin': [ 0 ], 'borrowCrossMargin': [ 0 ],
    'repayIsolatedMargin': [ 1 ], 'borrowIsolatedMargin': [ 1 ], 'repayMargin': [ 0 ], 'borrowMargin': [ 0 ],
    'fetchCrossBorrowRate': [ 0 ], 'fetchBorrowRate': [ 0 ], 'fetchDepositWithdrawFee': [ 0 ],
    'fetchTransactionFee': [ 0 ], 'fetchOptionChain': [ 0 ], 'createSubAccount': [ 0 ], 'fetchTransfer': [ 0 ],
    'fetchLedgerEntry': [ 0 ], 'withdrawWs': [ 0, 2 ], 'fetchOrdersByStatusWs': [ 0 ],
    'editOrder': [ 0 ], 'fetchOrderTrades': [ 0 ], 'withdraw': [ 0 ],
    'transfer': [ 0, 3 ], 'setMarginMode': [ 0 ],
};

const GO_UNIFIED_STRING_PARAMS: { [method: string]: number[] } = {
    'createOrder': [ 0, 1, 2 ], 'createOrderWs': [ 0, 1, 2 ], 'createLimitOrder': [ 0, 1 ], 'createLimitOrderWs': [ 0, 1 ],
    'createMarketOrder': [ 0, 1 ], 'createMarketOrderWs': [ 0, 1 ], 'createMarketOrderWithCost': [ 0, 1 ],
    'createMarketOrderWithCostWs': [ 0, 1 ], 'createOrderWithTakeProfitAndStopLoss': [ 0, 1, 2 ],
    'createOrderWithTakeProfitAndStopLossWs': [ 0, 1, 2 ], 'createPostOnlyOrder': [ 0, 1, 2 ],
    'createPostOnlyOrderWs': [ 0, 1, 2 ], 'createReduceOnlyOrder': [ 0, 1, 2 ], 'createReduceOnlyOrderWs': [ 0, 1, 2 ],
    'createStopLimitOrder': [ 0, 1 ], 'createStopLimitOrderWs': [ 0, 1 ], 'createStopLossOrder': [ 0, 1, 2 ],
    'createStopLossOrderWs': [ 0, 1, 2 ], 'createStopMarketOrder': [ 0, 1 ], 'createStopMarketOrderWs': [ 0, 1 ],
    'createStopOrder': [ 0, 1, 2 ], 'createStopOrderWs': [ 0, 1, 2 ], 'createTakeProfitOrder': [ 0, 1, 2 ],
    'createTakeProfitOrderWs': [ 0, 1, 2 ], 'createTrailingAmountOrder': [ 0, 1, 2 ],
    'createTrailingAmountOrderWs': [ 0, 1, 2 ], 'createTrailingPercentOrder': [ 0, 1, 2 ],
    'createTrailingPercentOrderWs': [ 0, 1, 2 ], 'createTriggerOrder': [ 0, 1, 2 ], 'createTriggerOrderWs': [ 0, 1, 2 ],
    'createTwapOrder': [ 0, 1 ], 'sign': [ 0 ], 'editLimitOrder': [ 1, 2 ], 'editOrderWithClientOrderId': [ 1, 2, 3 ],
    'editOrderWs': [ 1, 2, 3 ], 'setTakeProfitAndStopLossParams': [ 1, 2 ], 'editLimitBuyOrder': [ 1 ],
    'editLimitSellOrder': [ 1 ], 'watchOHLCV': [ 0 ], 'unWatchOrderBook': [ 0 ], 'unWatchTrades': [ 0 ],
    'unWatchOHLCV': [ 0 ], 'unWatchTicker': [ 0 ], 'unWatchMarkPrice': [ 0 ], 'unWatchFundingRate': [ 0 ],
    'fetchOpenInterest': [ 0 ], 'fetchOpenInterestHistory': [ 0 ], 'createMarketBuyOrderWithCost': [ 0 ],
    'createMarketSellOrderWithCost': [ 0 ], 'addMargin': [ 0 ], 'reduceMargin': [ 0 ], 'closePosition': [ 0 ],
    'watchFundingRate': [ 0 ], 'fetchFundingInterval': [ 0 ], 'fetchMarketLeverageTiers': [ 0 ], 'fetchGreeks': [ 0 ],
    'fetchMarkPrice': [ 0 ], 'repayIsolatedMargin': [ 0 ], 'borrowIsolatedMargin': [ 0 ], 'fetchOption': [ 0 ],
    'fetchPositionsForSymbol': [ 0 ], 'fetchPositionsForSymbolWs': [ 0 ], 'watchMarkPrice': [ 0 ],
    'fetchPositionHistory': [ 0 ], 'fetchLiquidations': [ 0 ], 'watchLiquidations': [ 0 ], 'watchMyLiquidations': [ 0 ],
    'fetchOHLCVWs': [ 0 ], 'fetchIsolatedBorrowRate': [ 0 ], 'fetchTickerWs': [ 0 ], 'fetchOrderBookWs': [ 0 ],
    'fetchTradesWs': [ 0 ], 'fetchPositionWs': [ 0 ], 'fetchSpotOHLCV': [ 0 ], 'fetchContractOHLCV': [ 0 ],
    'fetchADLRank': [ 0 ], 'fetchPositionADLRank': [ 0 ], 'fetchMarkOHLCV': [ 0 ], 'fetchIndexOHLCV': [ 0 ],
    'fetchPremiumIndexOHLCV': [ 0 ], 'fetchL2OrderBook': [ 0 ], 'fetchL3OrderBook': [ 0 ], 'fetchLongShortRatio': [ 0 ],
    'createLimitBuyOrder': [ 0 ], 'createLimitSellOrder': [ 0 ], 'createMarketBuyOrder': [ 0 ],
    'createMarketSellOrder': [ 0 ], 'createLimitBuyOrderWs': [ 0 ], 'createLimitSellOrderWs': [ 0 ],
    'createMarketBuyOrderWs': [ 0 ], 'createMarketSellOrderWs': [ 0 ], 'fetchOrderBook': [ 0 ], 'fetchTicker': [ 0 ],
    'fetchOHLCV': [ 0 ], 'watchOrderBook': [ 0 ], 'watchTicker': [ 0 ], 'fetchTradingFee': [ 0 ], 'fetchFundingRate': [ 0 ],
};
for (const [method, indexes] of Object.entries (GO_UNIFIED_REQUIRED_ID_PARAMS)) {
    GO_UNIFIED_STRING_PARAMS[method] = [ ...new Set ([ ...(GO_UNIFIED_STRING_PARAMS[method] ?? []), ...indexes ]) ].sort ((x, y) => x - y);
}

ansi.nice;

// const allExchanges: {ids: string[], ws: string[]} = JSON.parse (fs.readFileSync("./exchanges.json", "utf8"));
const allExchanges = JSON.parse (fs.readFileSync("./exchanges.json", "utf8"));
let exchanges = allExchanges;
const exchangeIds = exchanges.ids;
const exchangeIdsWs = exchanges.ws;
const predictionIds = exchanges.prediction || [];
const predictionWsIds = exchanges.predictionWs || [];
const exchangeIdsPrediction = predictionIds; // alias used by the runMain/base-method paths
let transpiledExchanges = exchangeIds;

let __dirname = new URL('.', import.meta.url).pathname;

let shouldTranspileTests = true;

// ast-transpiler emits every async method core as a trampoline over a capacity-1
// channel (ccxt/ast-transpiler#67): the function makes the channel, launches the body
// in a goroutine and returns the channel immediately, with an *unnamed* result:
//
//     func (this *Bit2cCore) FetchBalance(...) <-chan any {
//         ch := make(chan any, 1)
//         go this.fetchBalanceBody(ch)
//         return ch
//     }
//
//     func (this *Bit2cCore) fetchBalanceBody(ch chan any, ...) any {
//         defer close(ch)
//         defer ReturnPanicError(ch)
//         ...
//         ch <- value
//         return nil
//     }
//
// Buffering the channel and shaping the body are therefore the emitter's job now and
// CCXT no longer post-processes either. One thing the emitter does not do is stop a
// core after its first send.
//
// `try { ... return x } catch (e) { ... }` is emulated with a synthetic, immediately
// invoked closure, so the `return` inside it only leaves that *closure* — in TypeScript
// the same `return` leaves the whole async function. Execution therefore carries on
// round the enclosing retry loop and reaches a second `ch <-`; the channel holds one
// value, so that send blocks forever. Under the trampoline it parks the body goroutine
// rather than the caller, but it is still a leaked goroutine — and, worse, the loop has
// already re-issued the network request to get there.
//
// Four base methods have that shape today — Fetch2, FetchWebEndpoint,
// SafeDeterministicCall and FetchRestOrderBookSafe — each sending from inside a retry
// loop's try block. The guard threads a `chSent` flag through exactly those cores and
// leaves the body goroutine as soon as the closure produced a value, which is what the
// TypeScript said in the first place:
//
//     for … {                                     for … {
//         {                                           {
//             func(this *X) (ret_ any) {                  func(this *X) (ret_ any) {
//                 // try block:                               // try block:
//                 ch <- response                              ch <- response
//                 return nil                                  chSent = true
//             }(this)                                         return nil
//         }                                               }(this)
//     }                                               }
//                                                     if chSent {
//                                                         return nil
//                                                     }
//                                                 }
//
// `return nil` (not `return ch`) is the right early exit: it leaves the body closure,
// whose result type is `any`, and `defer close(ch)` still runs — the trampoline handed
// the channel to the caller long before.
//
// That also repairs a real bug the port has today, independent of the emitter: with
// `maxRetries` at its default 3, `SafeDeterministicCall` and `FetchRestOrderBookSafe`
// keep looping after a successful call and re-issue the request up to three times
// (measured: one call, three round trips). The caller only ever saw the first value, so
// the extra traffic was invisible. The guard makes the loop stop on success.
//
// Cores that send only at their own level — the vast majority — are left byte-identical,
// and any core whose shape is not fully understood is skipped, so a parse we do not
// fully trust degrades to exactly what ast-transpiler emitted.
//
// Everything here matches the *raw* emitted text: this runs before gofmt, which is what
// later normalises the 4-space indentation to tabs (`<-chan any` and the single-space
// signatures now come straight out of the printer, F04).
// The BODY half of a trampoline pair: `func (this *X) fetchTickerBody(ch chan any, …) any {`
// (or the package-level `func helperABody(ch chan any, …) any {`). The public trampoline
// itself is three statements and can never multi-send, so only the body is scanned.
const GO_CORE_SIGNATURE = /^func\s+(?:\([^()]*\)\s*)?[a-z_]\w*\s*\(ch chan\s+[^(),\n]+(?:,[^\n]*)?\)\s*any\s*\{$/;
const GO_CORE_CLOSE = /^([ \t]*)defer close\(ch\)$/;
// the panic helper is package-qualified in the prediction namespace (ccxt.ReturnPanicError)
const GO_CORE_PANIC = /^([ \t]*)defer (?:[A-Za-z_][A-Za-z0-9_.]*\.)?ReturnPanicError\(ch\)$/;
// generated cores are always top-level funcs, so the core ends at a brace in column 0
const GO_CORE_END = /^\}\s*$/;
const GO_CORE_SEND = /^ch\s*<-/;
const GO_FUNC_LITERAL = /\bfunc\s*(?:\([^()]*\))?\s*\(/g;
// the try/catch shim closes as an immediately-invoked literal, `}()` or `}(this)`
const GO_LITERAL_INVOKED = /^\}\s*\([^()]*\)\s*$/;
// the flag threaded through cores that send from inside such a shim
const GO_SENT_FLAG = 'chSent';
// the transpiler emits one tab per nesting level, exactly what gofmt writes back
const GO_INDENT_UNIT = '\t';

// drop string/rune literals and comments so brace counting and identifier lookups
// cannot be fooled by Go source quoted inside a literal or a comment. Block comments
// span lines (the transpiler copies JSDoc across verbatim), so the caller carries the
// open-comment state from one line to the next.
function stripGoLiterals (line: string, state?: { 'inBlockComment': boolean }): string {
    let stripped = '';
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (state !== undefined && state.inBlockComment) {
            if (char === '*' && line[i + 1] === '/') {
                state.inBlockComment = false;
                i++;
            }
            continue;
        }
        if (char === '/' && line[i + 1] === '*' && state !== undefined) {
            state.inBlockComment = true;
            i++;
            continue;
        }
        if (char === '/' && line[i + 1] === '/') {
            break;
        }
        if (char === '"' || char === '`' || char === '\'') {
            const quote = char;
            i++;
            while (i < line.length) {
                if (quote !== '`' && line[i] === '\\') {
                    i += 2;
                    continue;
                }
                if (line[i] === quote) {
                    break;
                }
                i++;
            }
            stripped += '""';
            continue;
        }
        stripped += char;
    }
    return stripped;
}

// Free helpers that normalize every argument with derefScalar at entry, so a *T boxed in
// an `any` reads there exactly like the plain value it points at. A DerefScalar() wrap at
// the assignment adds nothing when every read of that local goes through one of these.
const GO_POINTER_TRANSPARENT_SHIMS = new Set ([
    'IsEqual', 'EvalTruthy', 'Add', 'Subtract', 'Multiply', 'Divide', 'Mod', 'Negate', 'OpNeg', 'UnaryPlus',
    'IsGreaterThan', 'IsLessThan', 'IsGreaterThanOrEqual', 'IsLessThanOrEqual',
    'GetValue', 'GetArrayLength', 'GetLength', 'GetIndexOf', 'InOp', 'Contains', 'IsNil',
    'GetValue', 'ToString', 'ToLower', 'ToUpper', 'Trim', 'StartsWith', 'EndsWith', 'Replace', 'Split', 'Join', 'Slice',
    'JsonParse', 'JsonStringify', 'ParseInt', 'ParseFloat', 'ToFloat64',
    'MathFloor', 'MathCeil', 'MathRound', 'MathAbs', 'mathMin', 'mathMax', 'mathFloor', 'mathCeil', 'mathRound', 'mathAbs',
    'IsArray', 'IsString', 'IsInt', 'IsBool', 'IsNumber', 'IsObject', 'IsDictionary',
    'ObjectKeys', 'ObjectValues', 'derefScalar', 'DerefScalar',
]);

// the whole-argument names of a line that are passed to a pointer-transparent shim: the
// argument must BE the name (a `[]any{x}` or `Add(x, 1)` chunk carries/consumes it deeper
// and is not itself a shim boundary), and a `this.`/`x.` method of the same name is not
// the free function.
function goShimDirectArgumentNames (line: string): string[] {
    const names: string[] = [];
    const callPattern = /(?<![\w.])(?:ccxt\.)?([A-Za-z_]\w*)\s*\(/g;
    let match;
    while ((match = callPattern.exec (line)) !== null) {
        if (!GO_POINTER_TRANSPARENT_SHIMS.has (match[1])) {
            continue;
        }
        let depth = 1;
        let i = match.index + match[0].length;
        while (i < line.length && depth > 0) {
            if (line[i] === '(') {
                depth++;
            } else if (line[i] === ')') {
                depth--;
            }
            i++;
        }
        const args = line.substring (match.index + match[0].length, i - 1);
        let level = 0;
        let chunk = '';
        const chunks: string[] = [];
        for (const char of args) {
            if (char === '(') {
                level++;
            } else if (char === ')') {
                level--;
            }
            if (char === ',' && level === 0) {
                chunks.push (chunk);
                chunk = '';
                continue;
            }
            chunk += char;
        }
        chunks.push (chunk);
        for (const candidate of chunks) {
            const trimmed = candidate.trim ();
            if (/^[A-Za-z_]\w*$/.test (trimmed)) {
                names.push (trimmed);
            }
        }
    }
    return names;
}

// the line with the DerefScalar() wrapper (the name and its closing paren only) and the
// declaration/assignment target removed: the wrapped call's own arguments still read the
// local (`x = DerefScalar(this.SafeString(m, "k", x))`), so they must be scanned, not
// hidden behind the wrap.
function goDerefWrapReadText (line: string): string {
    let text = line;
    let index = text.indexOf ('DerefScalar(');
    while (index >= 0) {
        const open = index + 'DerefScalar'.length;
        let depth = 0;
        let close = -1;
        for (let i = open; i < text.length; i++) {
            if (text[i] === '(') {
                depth++;
            } else if (text[i] === ')') {
                depth--;
                if (depth === 0) {
                    close = i;
                    break;
                }
            }
        }
        if (close < 0) {
            break;
        }
        text = text.slice (0, index) + text.slice (open + 1, close) + text.slice (close + 1);
        index = text.indexOf ('DerefScalar(');
    }
    return text.replace (/^\s*(?:var\s+\w+\s+(?:any|[\w.\[\]\*]+)\s*=|[\w.\[\]]+\s*(?::=|=)(?!=))/, '');
}

// the line's right-hand side once the write target (`var x … =`, `x =`, `x :=`, `_ = x`)
// is removed; null when the line does not write the local. A write with a right side that
// reads the local again (`x = this.SafeString2(p, "k", x)`) keeps that read.
function goDerefWrapWriteRhs (line: string, name: string): string | null {
    const text = line.trim ();
    const escaped = name.replace (/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (new RegExp ('^var ' + escaped + ' [\\w.\\[\\]\\*]+\\s*=(?!=)').test (text)) {
        return text.replace (new RegExp ('^var ' + escaped + ' [\\w.\\[\\]\\*]+\\s*='), '');
    }
    if (new RegExp ('^' + escaped + '\\s*:?=(?!=)').test (text)) {
        return text.replace (new RegExp ('^' + escaped + '\\s*:?=(?!=)'), '');
    }
    if (new RegExp ('^_\\s*=\\s*' + escaped + '$').test (text)) {
        return '';
    }
    return null;
}

// DerefScalar() exists so the `any` box carries the plain value: raw `x == nil`, `x != true`
// and `switch x` on the pointer box would never match. When every READ of the local in this
// body is a pointer-transparent shim call, nothing can observe the pointer and the wrap is
// provably redundant (the shims deref it themselves, #30054). Any other mention — a raw
// comparison, a dict/slice store, a return, an argument to a non-shim call, or a mention the
// scan cannot classify — keeps the wrap.
function goDerefWrapRedundantLocals (fn: string, wrapLines: Set<number>, names: Iterable<string>): Set<string> {
    const commentState = { 'inBlockComment': false };
    const lines = fn.split ('\n').map ((line) => stripGoLiterals (line, commentState));
    const redundant = new Set<string> ();
    for (const name of names) {
        const escaped = name.replace (/[.*+?^${}()|[\]\\]/g, '\\$&');
        const mention = new RegExp ('(?<![\\w.])' + escaped + '(?![\\w])', 'g');
        let safe = true;
        for (let index = 0; index < lines.length; index++) {
            const wrapped = wrapLines.has (index);
            let text = wrapped ? goDerefWrapReadText (lines[index]) : lines[index];
            if (!wrapped) {
                const rhs = goDerefWrapWriteRhs (text, name);
                if (rhs !== null) {
                    text = rhs;
                }
            }
            const occurrences = (text.match (mention) || []).length;
            if (!occurrences) {
                continue;
            }
            const shimArgs = goShimDirectArgumentNames (text).filter ((candidate) => candidate === name).length;
            if (shimArgs === occurrences) {
                continue;
            }
            safe = false;
            break;
        }
        if (safe) {
            redundant.add (name);
        }
    }
    return redundant;
}

// the declaration form of the wrap the createGoExchange pass above adds is removed again for
// the locals the proof above accepts; the reassignment form is never added in the first place.
function goUnwrapDerefWraps (fn: string, names: Iterable<string>, safeCall: string): string {
    for (const name of names) {
        const escaped = name.replace (/[.*+?^${}()|[\]\\]/g, '\\$&');
        fn = fn.replace (new RegExp ('(var ' + escaped + ' any = )(?:ccxt\\.)?DerefScalar\\(' + '(' + safeCall + ')' + '\\)', 'g'), '$1$2');
    }
    return fn;
}

// The printer prints `x === undefined` as a native `x == nil` when the operand's TypeScript
// type proves the box holds a scalar (goIsAnyBoxExpression). That proof is local to the
// function: a bare `any` PARAMETER (`func (this *X) F(code any, …)`) keeps whatever the
// caller boxed, and a caller holding a typed local (`var code *string = this.SafeString(…)`)
// boxes the pointer itself — `(*string)(nil) == nil` is false in Go, while IsEqual(x, nil)
// derefs both sides and answers true. The callee then takes the wrong branch: SafeCurrency()
// dropped the caller's currency for a response without a `currency` id and Currency() panicked
// on the empty code (binance fetchDepositAddress, STATIC_RESPONSE). GetArg-bound optionals are
// safe (GetArg runs derefScalar and folds a typed nil pointer into the default) and locals are
// proven by the printer's own write analysis, so only the bare parameters keep the helper.
function goParamNilCompareText (fn: string, isEqualFn: string): string {
    const sigEnd = fn.indexOf ('{');
    if (sigEnd < 0) {
        return fn;
    }
    const body = fn.slice (sigEnd);
    const paramMatches = fn.slice (0, sigEnd).match (/(\w+) any\b/g) || [];
    for (let i = 0; i < paramMatches.length; i++) {
        const name = paramMatches[i].split (/\s+/)[0];
        if ((name === 'this') || (name === 'optionalArgs') || (name === 'chan')) {
            continue;
        }
        // a defaulted parameter bound by GetArg (or its typed twin) is nil-comparable natively
        if (new RegExp ('(^|[\\s(])(?:var\\s+)?' + name + '\\s*(?::=|=)\\s*(?:ccxt\\.)?GetArg\\w*\\(').test (body)) {
            continue;
        }
        fn = fn.replace (new RegExp ('(?<![.\\w*"])' + name + ' (==|!=) nil\\b', 'g'), ((_m: string, op: string) => (op === '==') ? isEqualFn + name + ', nil)' : '!' + isEqualFn + name + ', nil)') as any);
    }
    return fn;
}

// whole-file form of goParamNilCompareText (same function blocks the DerefScalar pass walks)
export function goParamNativeNilCompares (content: string, isEqualFn: string): string {
    return content.replace (/\nfunc [\s\S]*?\n\}/g, ((fn: string) => goParamNilCompareText (fn, isEqualFn)) as any);
}

// One level out from the caller-fed parameter above: a local `any` boxed from a method THIS FILE
// declares with a pointer result. The printer types a `Str` return as `*string`, so
// `var timeInForce any = this.ParseOrderTimeInForce(…)` (mexc.go) boxes the pointer itself, and
// the printer's own local proof (goAnyLocalHoldsPointer) only knows its helper-return table —
// it prints a native `timeInForce == nil`, false for `(*string)(nil)`, so the guard never runs
// and the parsed order loses its timeInForce (mexc createOrder, STATIC_RESPONSE: `[timeInForce]
// computed: <empty> stored: IOC/FOK`). The method's Go result type is read off the text being
// written (the only place that spells it) and IsEqual() derefs the box, which is the comparison
// master emitted. Resolved per function body: the same name can be a proven local elsewhere.
function goPointerReturnMethods (content: string): Set<string> {
    const methods = new Set<string> ();
    const signature = /\nfunc \(this \*[\w.]+\) (\w+)\([^)\n]*\) \*[\w.[\]]+ \{/g;
    let match: RegExpExecArray | null;
    while ((match = signature.exec (content)) !== null) {
        methods.add (match[1]);
    }
    return methods;
}

function goPointerLocalNilCompareText (fn: string, methods: Set<string>, isEqualFn: string): string {
    if (!methods.size) {
        return fn;
    }
    const sigEnd = fn.indexOf ('{');
    if (sigEnd < 0) {
        return fn;
    }
    const body = fn.slice (sigEnd);
    const callee = 'this\\.(?:Exchange\\.|BaseExchange\\.)?(?:' + Array.from (methods).join ('|') + ')\\(';
    const anyLocals = new Set ((fn.match (/var (\w+) any\b/g) || []).map ((decl: string) => decl.split (' ')[1]));
    const names = new Set<string> ();
    // the declaration and the reassignment form, the two shapes the printer's local proof reads
    const decl = new RegExp ('var (\\w+) any = ' + callee, 'g');
    const assign = new RegExp ('(?<![.\\w*"])(\\w+) = ' + callee, 'g');
    let match: RegExpExecArray | null;
    while ((match = decl.exec (body)) !== null) {
        if (anyLocals.has (match[1])) {
            names.add (match[1]);
        }
    }
    while ((match = assign.exec (body)) !== null) {
        if (anyLocals.has (match[1])) {
            names.add (match[1]);
        }
    }
    for (const name of names) {
        fn = fn.replace (new RegExp ('(?<![.\\w*"])' + name + ' (==|!=) nil\\b', 'g'), ((_m: string, op: string) => (op === '==') ? isEqualFn + name + ', nil)' : '!' + isEqualFn + name + ', nil)') as any);
    }
    return fn;
}

// whole-file form of goPointerLocalNilCompareText; the method table comes from the same text the
// pass rewrites, so every caller (base methods, prediction base, each exchange) is complete on
// its own file.
export function goPointerLocalNativeNilCompares (content: string, isEqualFn: string): string {
    const methods = goPointerReturnMethods (content);
    if (!methods.size) {
        return content;
    }
    return content.replace (/\nfunc [\s\S]*?\n\}/g, ((fn: string) => goPointerLocalNilCompareText (fn, methods, isEqualFn)) as any);
}

// Self-test for the caller-fed `any` parameter rule: the bare parameter keeps the deref-aware
// helper, the GetArg-bound optional and the typed local keep the printer's native comparison,
// and a second application is a no-op.
function goParamNilSelfTest (): string[] {
    const problems: string[] = [];
    const ok = (condition: boolean, message: string) => { if (!condition) { problems.push (message); } };
    const pass = (text: string): string => goParamNativeNilCompares (text, 'IsEqual(');
    const param = pass ('\nfunc (this *X) f(currencyId any, optionalArgs ...any) any {\n\tif (currencyId == nil) {\n\t\treturn nil\n\t}\n\t_ = currencyId\n}\n');
    ok (param.indexOf ('if (IsEqual(currencyId, nil)) {') >= 0, 'a bare any parameter must keep the helper');
    ok (param.indexOf ('currencyId == nil') < 0, 'the native comparison must be gone');
    const negated = pass ('\nfunc (this *X) f(response any) any {\n\tif (response != nil) && (currency != nil) {\n\t\treturn response\n\t}\n}\n');
    ok (negated.indexOf ('!IsEqual(response, nil)') >= 0, 'the negated form must keep its operator');
    ok (negated.indexOf ('(currency != nil)') >= 0, 'a GetArg-bound optional keeps the native comparison');
    const typed = pass ('\nfunc (this *X) f(response any) any {\n\tvar code *string = this.SafeString(response, "code")\n\tif code != nil {\n\t\treturn code\n\t}\n\treturn nil\n}\n');
    ok (typed.indexOf ('if code != nil {') >= 0, 'a typed local keeps the native comparison');
    const twice = pass (pass ('\nfunc (this *X) f(response any) any {\n\tif (response == nil) || (response == nil) {\n\t\treturn nil\n\t}\n}\n'));
    ok (twice.indexOf ('IsEqual(IsEqual(') < 0, 'a second application must be a no-op');
    ok (twice.indexOf ('(IsEqual(response, nil)) || (IsEqual(response, nil))') >= 0, 'both operands of a duplicated check must be wrapped once');
    return problems;
}

// The same hazard reaches an `any` LOCAL, not only a bare parameter: the printer's proof
// (goAnyLocalHoldsPointer) recognises only a call to a `*T`-returning helper, so a local fed
// by a pointer-typed name is misread as a plain scalar and printed as the native
// `x == nil` -- false for the boxed (*string)(nil), so the guard never fires and the local
// keeps the pointer. `var currency any = requested` (requested: `var requested *string =
// this.SafeStringN(...)`) stored a nil info.currency instead of the 'USDT' default (mudrex
// fetchBalance, STATIC_RESPONSE; master's older pin printed IsEqual here and passed). IsEqual
// derefs both operands, so every local a pointer can reach keeps the helper.
const GO_POINTER_NAME_PATTERN = '\\*[\\w\\[\\].]+';

// the top-level `\nfunc ` blocks, each with the brace that closes it. The brace count skips
// string literals and line comments so a body carrying a func literal -- the
// `func (this *X) (ret any) {` shims -- cannot end its block early.
function goFuncBlockRanges (content: string): { start: number; end: number }[] {
    const ranges: { start: number; end: number }[] = [];
    let cursor = 0;
    while (true) {
        const start = content.indexOf ('\nfunc ', cursor);
        if (start < 0) {
            return ranges;
        }
        let depth = 0;
        let index = start;
        let end = content.length;
        while (index < content.length) {
            const char = content[index];
            if (char === '"') {
                index++;
                while (index < content.length) {
                    if (content[index] === '\\') { index++; } else if (content[index] === '"') { break; }
                    index++;
                }
            } else if (char === '`') {
                index++;
                while ((index < content.length) && (content[index] !== '`')) { index++; }
            } else if ((char === '/') && (content[index + 1] === '/')) {
                while ((index < content.length) && (content[index] !== '\n')) { index++; }
            } else if (char === '{') {
                depth++;
            } else if (char === '}') {
                depth--;
                if (depth === 0) { end = index + 1; break; }
            }
            index++;
        }
        ranges.push ({ start, end });
        cursor = end;
    }
}

// the names a pointer can reach inside one function block: the pointer-typed locals the
// local-typing families emit (`var x *string = ...`), the native `*T` parameters of the
// signature, and every `any` local declared or assigned from one of those, transitively.
function goBoxedPointerNames (fn: string): Set<string> {
    const pointerNames = new Set<string> ();
    let match: RegExpExecArray | null;
    const localRe = new RegExp ('var (\\w+) ' + GO_POINTER_NAME_PATTERN + ' = ', 'g');
    while ((match = localRe.exec (fn)) !== null) {
        pointerNames.add (match[1]);
    }
    const braceAt = fn.indexOf ('{');
    const signature = (braceAt < 0) ? fn : fn.slice (0, braceAt);
    const paramRe = new RegExp ('(\\w+) ' + GO_POINTER_NAME_PATTERN + '(?=[,)])', 'g');
    while ((match = paramRe.exec (signature)) !== null) {
        if (match[1] !== 'this') {
            pointerNames.add (match[1]);
        }
    }
    // every `any` box fed by one of those names: `var currency any = requested`, `x = code`.
    // Only the names declared `any` in this block (own declarations, `x := GetArg(...)` and the
    // bare `any` parameters of the signature) can hold the box: a name declared with a pointer
    // a typed GetArg twin's local is compared natively too, so it needs no rewrite
    const anyNames = new Set<string> ();
    const anyDeclRe = /var (\w+) any\b/g;
    while ((match = anyDeclRe.exec (fn)) !== null) {
        anyNames.add (match[1]);
    }
    const getArgRe = /(\w+) := GetArg\(/g;
    while ((match = getArgRe.exec (fn)) !== null) {
        anyNames.add (match[1]);
    }
    const bareParamRe = /(\w+) any\b/g;
    while ((match = bareParamRe.exec (signature)) !== null) {
        anyNames.add (match[1]);
    }
    const feeds: string[][] = [];
    const declRe = /var (\w+) any = (\w+)\b/g;
    while ((match = declRe.exec (fn)) !== null) {
        feeds.push ([ match[1], match[2] ]);
    }
    const assignRe = /(?:^|[\s;])(\w+) = (\w+)\b/g;
    while ((match = assignRe.exec (fn)) !== null) {
        feeds.push ([ match[1], match[2] ]);
    }
    const boxed = new Set<string> ();
    let grew = true;
    while (grew) {
        grew = false;
        for (let i = 0; i < feeds.length; i++) {
            const target = feeds[i][0];
            const source = feeds[i][1];
            if (boxed.has (target) || !anyNames.has (target)) {
                continue;
            }
            if (pointerNames.has (source) || boxed.has (source)) {
                boxed.add (target);
                grew = true;
            }
        }
    }
    return boxed;
}

// the boxed-pointer locals of one block keep the deref-aware comparison
function goBoxedPointerNilCompareText (fn: string, isEqualFn: string): string {
    const boxed = goBoxedPointerNames (fn);
    for (const name of boxed) {
        const escaped = name.replace (/[.*+?^${}()|[\]\\]/g, '\\$&');
        fn = fn.replace (new RegExp ('(?<![.\\w*"])' + escaped + ' (==|!=) nil\\b', 'g'), ((_m: string, op: string) => (op === '==') ? isEqualFn + name + ', nil)' : '!' + isEqualFn + name + ', nil)') as any);
    }
    return fn;
}

// whole-file form: each block's rewrite is spliced back at its own offset, so a block whose
// text occurs twice cannot be rewritten in the wrong place.
export function goBoxedPointerNilCompares (content: string, isEqualFn: string): string {
    const ranges = goFuncBlockRanges (content);
    for (let i = ranges.length - 1; i >= 0; i--) {
        const start = ranges[i].start;
        const end = ranges[i].end;
        const block = content.slice (start, end);
        const rewritten = goBoxedPointerNilCompareText (block, isEqualFn);
        if (rewritten !== block) {
            content = content.slice (0, start) + rewritten + content.slice (end);
        }
    }
    return content;
}

// Self-test: a local fed by a pointer-typed local or a native `*T` parameter keeps the
// helper, a box fed by a container keeps the native comparison, another block's rewrite
// cannot leak in, and a second application is a no-op.
function goBoxedPointerSelfTest (): string[] {
    const problems: string[] = [];
    const ok = (condition: boolean, message: string) => { if (!condition) { problems.push (message); } };
    const pass = (text: string): string => goBoxedPointerNilCompares (text, 'IsEqual(');
    const fed = pass ('\nfunc (this *X) f(optionalArgs ...any) any {\n\tvar requested *string = this.SafeStringN(optionalArgs, "currency")\n\tvar currency any = requested\n\tif currency == nil {\n\t\tcurrency = "USDT"\n\t}\n\treturn currency\n}\n');
    ok (fed.indexOf ('if IsEqual(currency, nil) {') >= 0, 'a local fed by a pointer-typed local must keep the helper');
    ok (fed.indexOf ('var requested *string = this.SafeStringN') >= 0, 'the pointer-typed local itself must stay native');
    const param = pass ('\nfunc (this *X) f(code *string) any {\n\tvar local any = code\n\tif local != nil {\n\t\treturn local\n\t}\n\treturn nil\n}\n');
    ok (param.indexOf ('if !IsEqual(local, nil) {') >= 0, 'a local fed by a native `*T` parameter must keep the helper');
    const plain = pass ('\nfunc (this *X) f(response any) any {\n\tvar data any = nil\n\tdata = this.SafeDict(response, "data", map[string]any{})\n\tif data == nil {\n\t\treturn nil\n\t}\n\treturn data\n}\n');
    ok (plain.indexOf ('if data == nil {') >= 0, 'a box fed by a container keeps the native comparison');
    const twice = pass (pass ('\nfunc (this *X) f() any {\n\tvar requested *string = this.SafeString("x", "y")\n\tvar currency any = requested\n\tif currency == nil {\n\t\treturn nil\n\t}\n\treturn currency\n}\n'));
    ok (twice.indexOf ('IsEqual(IsEqual(') < 0, 'a second application must be a no-op');
    ok (twice.indexOf ('if IsEqual(currency, nil) {') >= 0, 'the wrapped form must survive the second pass');
    const scoped = pass ('\nfunc (this *X) f() any {\n\tvar requested *string = this.SafeString("x", "y")\n\treturn nil\n}\n\nfunc (this *X) g() any {\n\tvar currency any = this.SafeString("x", "y")\n\tif currency == nil {\n\t\treturn nil\n\t}\n\treturn currency\n}\n');
    ok (scoped.indexOf ('if currency == nil {') >= 0, 'a block with no pointer feed must stay untouched');
    const literal = pass ('\nfunc (this *X) f() any {\n\tvar requested *string = this.SafeString("x", "y")\n\tvar identity any = requested\n\tvar myidentity any = identity\n\tif myidentity == nil {\n\t\treturn nil\n\t}\n\treturn myidentity\n}\n');
    ok (literal.indexOf ('if IsEqual(myidentity, nil) {') >= 0, 'a name must not be rewritten inside a longer identifier');
    return problems;
}

// IsEqual(x, nil) on a name declared once in the block as a map, []any or scalar pointer is
// `x == nil`: derefScalar folds exactly those typed nils to nil. A `var x string` against a
// string literal is plain `==`. Any other or repeated declaration keeps the helper.
const GO_NIL_COMPARABLE_TYPES = new Set (['map[string]any', '[]any', '*string', '*float64', '*int64', '*bool', '*int']);

function goTypedNilCompareText (fn: string, isEqualFn: string): string {
    const helper = isEqualFn.replace (/[.(]/g, '\\$&');
    const sigEnd = fn.indexOf ('{');
    if ((sigEnd < 0) || (fn.indexOf (isEqualFn) < 0)) {
        return fn;
    }
    const signature = fn.slice (0, sigEnd);
    const typeOf = (name: string): string | undefined => {
        const decls = fn.match (new RegExp ('\\bvar ' + name + ' ([^=\\n]+?) =', 'g')) || [];
        const bare = fn.match (new RegExp ('\\bvar ' + name + ' [^=\\n]+\\n', 'g')) || [];
        const rebinds = fn.match (new RegExp ('(?<![.\\w])' + name + '\\s*(?:,\\s*\\w+\\s*)*:=|,\\s*' + name + '\\s*(?:,\\s*\\w+\\s*)*:=|\\bfunc\\b[^{\\n]*[(,]\\s*' + name + ' ', 'g')) || [];
        const inSignature = new RegExp ('[(,]\\s*' + name + ' ').test (signature);
        if ((decls.length !== 1) || bare.length || rebinds.length || inSignature) {
            return undefined;
        }
        return decls[0].slice (('var ' + name + ' ').length, -2).trim ();
    };
    return fn.replace (new RegExp ('(!?)(?<![.\\w])' + helper + '(\\w+), (nil|"[^"\\\\]*")\\)', 'g'), ((m: string, not: string, name: string, rhs: string) => {
        const type = typeOf (name);
        const exact = (rhs === 'nil') ? GO_NIL_COMPARABLE_TYPES.has (type) : (type === 'string');
        if (!exact) {
            return m;
        }
        return '(' + name + ((not === '!') ? ' != ' : ' == ') + rhs + ')';
    }) as any);
}

export function goTypedNativeNilCompares (content: string, isEqualFn: string): string {
    return content.replace (/\nfunc [\s\S]*?\n\}/g, ((fn: string) => goTypedNilCompareText (fn, isEqualFn)) as any);
}

function goTypedNilSelfTest (): string[] {
    const problems: string[] = [];
    const ok = (condition: boolean, message: string) => { if (!condition) { problems.push (message); } };
    const pass = (text: string): string => goTypedNativeNilCompares (text, 'IsEqual(');
    const typed = pass ('\nfunc (this *X) f(p any) any {\n\tvar m map[string]any = SafeMapTyped(p, "a")\n\tvar s *string = this.SafeString(p, "b")\n\tvar t string = "spot"\n\tif !IsEqual(m, nil) && IsEqual(s, nil) && IsEqual(t, "swap") {\n\t\treturn m\n\t}\n\treturn nil\n}\n');
    ok (typed.indexOf ('if (m != nil) && (s == nil) && (t == "swap") {') >= 0, 'typed locals must compare natively: ' + typed);
    const other = pass ('\nfunc (this *X) f(p any, q map[string]any) any {\n\tvar a any = p\n\tvar l []string = nil\n\tvar n int = 1\n\tif IsEqual(a, nil) || IsEqual(l, nil) || IsEqual(n, nil) || IsEqual(q, nil) || IsEqual(p, "x") {\n\t\treturn nil\n\t}\n\treturn a\n}\n');
    ok (other.indexOf ('IsEqual(a, nil) || IsEqual(l, nil) || IsEqual(n, nil) || IsEqual(q, nil) || IsEqual(p, "x")') >= 0, 'any/[]string/int/params keep the helper');
    const shadow = pass ('\nfunc (this *X) f(p any) any {\n\tvar m map[string]any = nil\n\tif true {\n\t\tvar m any = p\n\t\t_ = m\n\t}\n\tm, ok := p.(map[string]any)\n\tif IsEqual(m, nil) {\n\t\treturn ok\n\t}\n\treturn nil\n}\n');
    ok (shadow.indexOf ('IsEqual(m, nil)') >= 0, 'a redeclared name keeps the helper');
    const ws = goTypedNativeNilCompares ('\nfunc (this *X) f(p any) any {\n\tvar l []any = nil\n\tif !ccxt.IsEqual(l, nil) {\n\t\treturn l\n\t}\n\treturn nil\n}\n', 'ccxt.IsEqual(');
    ok (ws.indexOf ('if (l != nil) {') >= 0, 'the package-qualified helper must be rewritten too');
    ok (pass (typed) === typed, 'a second application must be a no-op');
    return problems;
}

// IsEqual(x, nil) on an `any` local is `x == nil` unless the box can hold a nil scalar pointer,
// a typed-nil map/slice or a nil *sync.Map (derefScalar/IsEqual fold those to nil). Every write
// must come from a producer below that never yields one; any other write keeps the helper.
const GO_ANY_NIL_SAFE_CALLS = new Set ([
    'this.Extend', 'this.DeepExtend', 'this.Account', 'this.IndexBy', 'this.GroupBy', 'this.SortBy',
    'this.Milliseconds', 'this.Seconds', 'this.Uuid', 'this.Json', 'this.ParseToInt', 'this.Sum', 'this.ParseJson',
    'Add', 'Subtract', 'Multiply', 'Divide', 'mathMin', 'mathMax', 'ParseInt', 'GetArrayLength',
    'NewArrayCache', 'NewArrayCacheByTimestamp', 'NewArrayCacheBySymbolById', 'NewArrayCacheBySymbolBySide',
]);
// SafeDict/SafeList* return a non-nil container or their default: safe with a nil/literal default
const GO_ANY_NIL_SAFE_DEFAULTED = new Set ([
    'this.SafeDict', 'this.SafeDict2', 'this.SafeDictN', 'this.SafeList', 'this.SafeList2', 'this.SafeListN',
]);
// DerefScalar folds these scalar-pointer results into a plain value or untyped nil
const GO_ANY_NIL_DEREF_INNER = /^this\.(?:Safe(?:String|Integer|Number|Float|Bool|Timestamp)\w*|SafeCurrencyCode|NumberToString|PriceToPrecision|AmountToPrecision|Iso8601|Parse8601)\(/;
const GO_ANY_NIL_SCALAR_TYPES = new Set (['string', 'int64', 'float64', 'bool', 'int']);

// the top-level comma-separated arguments of a call text starting at `open` ('('), or undefined
// when the call does not close exactly at the end of `text`
function goCallArgsSpanningText (text: string, open: number): string[] | undefined {
    const args: string[] = [];
    let depth = 0;
    let start = open + 1;
    for (let i = open; i < text.length; i++) {
        const char = text[i];
        if (char === '"') {
            i++;
            while ((i < text.length) && (text[i] !== '"')) { if (text[i] === '\\') { i++; } i++; }
        } else if ((char === '(') || (char === '{') || (char === '[')) {
            depth++;
        } else if ((char === ')') || (char === '}') || (char === ']')) {
            depth--;
            if (depth === 0) {
                if (i !== text.length - 1) {
                    return undefined;
                }
                const last = text.slice (start, i).trim ();
                if (last.length) { args.push (last); }
                return args;
            }
        } else if ((char === ',') && (depth === 1)) {
            args.push (text.slice (start, i).trim ());
            start = i + 1;
        }
    }
    return undefined;
}

function goAnyNilSafeWrite (rhs: string, scalarLocals: Set<string>): boolean {
    const text = rhs.replace (/\bccxt\./g, '').trim ();
    if (/^(?:nil|true|false|-?\d+(?:\.\d+)?(?:[eE][-+]?\d+)?|"(?:[^"\\]|\\.)*")$/.test (text)) {
        return true;
    }
    if (/^(?:map\[string\]any|\[\]any)\{/.test (text)) {
        const args = goCallArgsSpanningText (text, text.indexOf ('{'));
        return (args !== undefined) || !/\}\s*$/.test (text) && text.endsWith ('{');
    }
    if (/^\w+$/.test (text)) {
        return scalarLocals.has (text);
    }
    const call = /^((?:this\.)?\w+)\(/.exec (text);
    if (!call) {
        return false;
    }
    const args = goCallArgsSpanningText (text, call[0].length - 1);
    if (args === undefined) {
        return false;
    }
    if (call[1] === 'DerefScalar') {
        return (args.length === 1) && GO_ANY_NIL_DEREF_INNER.test (args[0]) && (goCallArgsSpanningText (args[0], args[0].indexOf ('(')) !== undefined);
    }
    if (GO_ANY_NIL_SAFE_CALLS.has (call[1])) {
        return true;
    }
    if (GO_ANY_NIL_SAFE_DEFAULTED.has (call[1])) {
        const keys = (call[1].endsWith ('2')) ? 3 : 2;
        if (args.length <= keys) {
            return true;
        }
        return (args.length === keys + 1) && /^(?:nil|map\[string\]any\{\}|\[\]any\{\})$/.test (args[keys]);
    }
    return false;
}

function goAnyLocalNilCompareText (fn: string, isEqualFn: string): string {
    if (fn.indexOf (isEqualFn) < 0) {
        return fn;
    }
    const helper = isEqualFn.replace (/[.(]/g, '\\$&');
    const sigEnd = fn.indexOf ('{');
    const signature = fn.slice (0, sigEnd);
    const commentState = { 'inBlockComment': false };
    const lines = fn.split ('\n');
    const code = lines.map ((line) => stripGoLiterals (line, commentState));
    const scalarLocals = new Set<string> ();
    for (const line of code) {
        const decl = /^\s*var (\w+) (\w+) = /.exec (line);
        if (decl && GO_ANY_NIL_SCALAR_TYPES.has (decl[2])) {
            scalarLocals.add (decl[1]);
        }
    }
    for (const name of Array.from (scalarLocals)) {
        const count = code.filter ((line) => new RegExp ('(?<![.\\w])' + name + '\\b[^=\\n]*:=|\\bvar ' + name + ' ').test (line)).length;
        if ((count !== 1) || new RegExp ('[(,]\\s*' + name + ' ').test (signature)) {
            scalarLocals.delete (name);
        }
    }
    const verdict = new Map<string, boolean> ();
    const provable = (name: string): boolean => {
        if (verdict.has (name)) {
            return verdict.get (name);
        }
        let ok = !new RegExp ('[(,]\\s*' + name + ' ').test (signature);
        let decls = 0;
        const mention = new RegExp ('(?<![.\\w])' + name + '(?!\\w)');
        for (let i = 0; ok && (i < lines.length); i++) {
            const line = code[i];
            if (!mention.test (line)) {
                continue;
            }
            const decl = new RegExp ('^\\s*var ' + name + ' any(?: = (.*))?$').exec (line);
            if (decl) {
                decls++;
                const raw = new RegExp ('^\\s*var ' + name + ' any = (.*)$').exec (lines[i]);
                ok = (decl[1] === undefined) || ((raw !== null) && goAnyNilSafeWrite (raw[1], scalarLocals));
                continue;
            }
            if (new RegExp ('&' + name + '\\b|(?<![.\\w])' + name + '\\s*(?:\\+\\+|--|[-+*/%|&^]=|:=)|\\bvar ' + name + '\\b|,\\s*' + name + '\\s*(?:,[^=\\n]*)?:?=[^=]|(?<![.\\w])' + name + '\\s*,[\\w\\s,]*:?=[^=]|\\bfunc\\b[^{\\n]*[(,]\\s*' + name + ' ').test (line)) {
                ok = false;
                continue;
            }
            const write = new RegExp ('^\\s*' + name + ' = (.*)$').exec (lines[i]);
            if (write) {
                ok = goAnyNilSafeWrite (write[1], scalarLocals);
                continue;
            }
            if (new RegExp ('(?<![.\\w=!<>])' + name + '\\s*=[^=]').test (line)) {
                ok = false;
            }
        }
        ok = ok && (decls === 1);
        verdict.set (name, ok);
        return ok;
    };
    return fn.replace (new RegExp ('(!?)(?<![.\\w])' + helper + '(\\w+), nil\\)', 'g'), ((m: string, not: string, name: string) => {
        if (!provable (name)) {
            return m;
        }
        return '(' + name + ((not === '!') ? ' != nil)' : ' == nil)');
    }) as any);
}

// `P && P` / `P || P` over one ident (TS `x !== undefined && x !== null`) is one Go nil test; vet
// rejects the duplicate. A helper/native pair folds only where the helper side absorbs the other.
export function goCollapseDuplicateNilCompares (text: string, isEqualFn: string): string {
    const helper = isEqualFn.replace (/[.(]/g, '\\$&');
    const side = '(\\(*)(?:(!?)' + helper + '(\\w+), nil\\)|(\\w+) ([!=])= nil)(\\)*)';
    const pattern = new RegExp (side + ' (&&|\\|\\|) ' + side, 'g');
    // true when the side tests "is nil"
    const isNil = (not: string, eq: string): boolean => (eq === undefined) ? (not === '') : (eq === '=');
    for (let changed = true; changed;) {
        changed = false;
        text = text.replace (pattern, ((m: string, o1: string, n1: string, h1: string, v1: string, e1: string, c1: string, op: string, o2: string, n2: string, h2: string, v2: string, e2: string, c2: string, at: number, all: string) => {
            const or = (op === '||');
            // parens opened before side 1 / closed after side 2 belong to the enclosing group
            const lead = o1.length - c1.length;
            const trail = c2.length - o2.length;
            const mixed = ((h1 === undefined) !== (h2 === undefined));
            if ((lead < 0) || (trail < 0) || ((h1 || v1) !== (h2 || v2)) || (isNil (n1, e1) !== isNil (n2, e2)) || (mixed && (isNil (n1, e1) !== or))) {
                return m;
            }
            const prefix = o1.slice (0, lead);
            const suffix = c2.slice (o2.length);
            const core = m.slice (lead, m.length - trail);
            const before = all.slice (0, at) + prefix;
            const after = suffix + all.slice (at + m.length);
            // only whole operands of a boolean chain; `A && P || P` is not `A && P`
            if (!/(?:^|[({,]|&&|\|\||[^=!<>]=|\breturn|\bif)\s*$/.test (before) || !/^\s*(?:$|[)}{,;\n]|&&|\|\|)/.test (after)) {
                return m;
            }
            if (or && (/&&\s*$/.test (before) || /^\s*&&/.test (after))) {
                return m;
            }
            changed = true;
            const joint = core.indexOf (c1 + ' ' + op + ' ' + o2) + c1.length;
            // the helper side implies the native one (IsEqual also folds typed nil pointers)
            const kept = ((h2 !== undefined) && (h1 === undefined)) ? core.slice (joint + op.length + 2) : core.slice (0, joint);
            return prefix + kept + suffix;
        }) as any);
    }
    return text;
}

export function goAnyLocalNativeNilCompares (content: string, isEqualFn: string): string {
    const ranges = goFuncBlockRanges (content);
    for (let i = ranges.length - 1; i >= 0; i--) {
        const block = content.slice (ranges[i].start, ranges[i].end);
        const rewritten = goCollapseDuplicateNilCompares (goAnyLocalNilCompareText (block, isEqualFn), isEqualFn);
        if (rewritten !== block) {
            content = content.slice (0, ranges[i].start) + rewritten + content.slice (ranges[i].end);
        }
    }
    return content;
}

function goAnyLocalNilSelfTest (): string[] {
    const problems: string[] = [];
    const ok = (condition: boolean, message: string) => { if (!condition) { problems.push (message); } };
    const pass = (text: string): string => goAnyLocalNativeNilCompares (text, 'IsEqual(');
    const f = (body: string): string => pass ('\nfunc (this *X) f(p any) any {\n' + body + '\treturn nil\n}\n');
    ok (f ('\tvar a any = nil\n\tif true {\n\t\ta = this.SafeDict(p, "x")\n\t} else {\n\t\ta = []any{1}\n\t}\n\tif !IsEqual(a, nil) {\n\t\treturn a\n\t}\n').indexOf ('if (a != nil) {') >= 0, 'SafeDict/literal writes compare natively');
    ok (f ('\tvar s any = DerefScalar(this.SafeString(p, "s"))\n\tvar n int64 = this.Milliseconds()\n\ts = n\n\tif IsEqual(s, nil) {\n\t}\n').indexOf ('if (s == nil) {') >= 0, 'DerefScalar of a scalar accessor and a scalar local are safe');
    ok (f ('\tvar m any = map[string]any{\n\t\t"a": 1,\n\t}\n\tif IsEqual(m, nil) {\n\t}\n').indexOf ('if (m == nil) {') >= 0, 'a multi-line literal is safe');
    const keep = [
        '\tvar v any = this.SafeString(p, "v")\n\tif IsEqual(v, nil) {\n\t}\n',
        '\tvar v any = this.SafeValue(p, "v")\n\tif IsEqual(v, nil) {\n\t}\n',
        '\tvar v any = MapTyped(p)\n\tif IsEqual(v, nil) {\n\t}\n',
        '\tvar v any = this.FilterBy(p, "a", "b")\n\tif IsEqual(v, nil) {\n\t}\n',
        '\tvar v any = this.SafeDict(p, "v", p)\n\tif IsEqual(v, nil) {\n\t}\n',
        '\tvar v any = nil\n\tv, _ = this.Two(p)\n\tif IsEqual(v, nil) {\n\t}\n',
        '\tvar v any = nil\n\tAppendToArray(&v, 1)\n\tif IsEqual(v, nil) {\n\t}\n',
        '\tvar v any = nil\n\tfunc() {\n\t\tv = this.SafeInteger(p, "a")\n\t}()\n\tif IsEqual(v, nil) {\n\t}\n',
        '\tvar v any = nil\n\tif true {\n\t\tvar v any = p\n\t\t_ = v\n\t}\n\tif IsEqual(v, nil) {\n\t}\n',
        '\tvar v any = this.Extend(p).X\n\tif IsEqual(v, nil) {\n\t}\n',
        '\tvar q *string = nil\n\tvar v any = q\n\tif IsEqual(v, nil) {\n\t}\n',
        '\tvar v any = DerefScalar(this.SafeValue(p, "a"))\n\tif IsEqual(v, nil) {\n\t}\n',
    ];
    keep.forEach ((body, index) => ok (f (body).indexOf ('IsEqual(v, nil)') >= 0, 'unproven write must keep the helper #' + index));
    ok (pass ('\nfunc (this *X) f(v any) any {\n\tif IsEqual(v, nil) {\n\t}\n}\n').indexOf ('IsEqual(v, nil)') >= 0, 'a parameter keeps the helper');
    const ws = goAnyLocalNativeNilCompares ('\nfunc (this *X) f() any {\n\tvar c any = ccxt.NewArrayCache(1)\n\tif !ccxt.IsEqual(c, nil) {\n\t}\n}\n', 'ccxt.IsEqual(');
    ok (ws.indexOf ('if (c != nil) {') >= 0, 'the package-qualified helper is rewritten');
    ok (pass (ws) === ws, 'a second application is a no-op');
    const dup = (body: string): string => f ('\tvar a any = this.SafeDict(p, "a")\n\tvar q *string = nil\n' + body);
    ok (dup ('\tvar h bool = ((a != nil)) && ((a != nil)) && (q != nil)\n').indexOf ('var h bool = ((a != nil)) && (q != nil)') >= 0, 'duplicate native && collapses');
    ok (dup ('\tvar h bool = (!IsEqual(a, nil)) && (!IsEqual(a, nil))\n').indexOf ('var h bool = ((a != nil))\n') >= 0, 'duplicate helper && collapses after the native rewrite');
    ok (dup ('\tif (IsEqual(a, nil)) || (IsEqual(a, nil)) || (q == nil) {\n\t}\n').indexOf ('if ((a == nil)) || (q == nil) {') >= 0, 'duplicate native || collapses');
    ok (dup ('\tif (q == nil) || IsEqual(q, nil) {\n\t}\n').indexOf ('if IsEqual(q, nil) {') >= 0, 'mixed native/helper || keeps the helper');
    ok (dup ('\tif (q != nil) && ((!IsEqual(q, nil))) {\n\t}\n').indexOf ('if ((!IsEqual(q, nil))) {') >= 0, 'mixed native/helper && keeps the helper');
    ok (dup ('\tif (q == nil) && (q == nil) {\n\t}\n\tif (q != nil) || (q != nil) {\n\t}\n').indexOf ('if (q == nil) {\n\t}\n\tif (q != nil) {') >= 0, 'any same-polarity duplicate collapses');
    ok (dup ('\tif (q != nil) && (q == nil) {\n\t}\n\tif (a != nil) && (q != nil) {\n\t}\n\tif (q == nil) && IsEqual(q, nil) {\n\t}\n').indexOf ('if (q != nil) && (q == nil) {\n\t}\n\tif (a != nil) && (q != nil) {\n\t}\n\tif (q == nil) && IsEqual(q, nil) {') >= 0, 'contradictions, other idents and non-absorbing mixed pairs are kept');
    ok (dup ('\tif (q != nil) && (q == nil) || (q == nil) {\n\t}\n\tif (q == nil) || (q == nil) && (a != nil) {\n\t}\n').indexOf ('if (q != nil) && (q == nil) || (q == nil) {\n\t}\n\tif (q == nil) || (q == nil) && (a != nil) {') >= 0, 'an || pair bound into && is kept');
    return problems;
}

// IsEqual(x, "lit") is `x == "lit"` on a box that never holds a *string/*any (the helper derefs
// those) or a *sync.Map; on a `*string` local it is the helper's nil-guarded compare. Every
// write must be proven below; parameters and unknown producers keep the helper.
const GO_STRING_CMP_SAFE_CALLS = new Set ([
    'GetValue', 'Add', 'Subtract', 'Multiply', 'Divide', 'ParseInt', 'GetArrayLength', 'mathMin', 'mathMax',
    'ToUpper', 'ToLower', 'ToString', 'Replace', 'JsonStringify', 'StringArg', 'Json',
    'this.Json', 'this.Uuid', 'this.Milliseconds', 'this.Seconds', 'this.Extend', 'this.DeepExtend',
]);
// producers whose Go result is `any` or `string`, so `x := <call>` compares with a string constant
const GO_STRING_CMP_BOX_CALLS = new Set ([
    'GetValue', 'Add', 'ToUpper', 'ToLower', 'ToString', 'Replace', 'JsonStringify', 'StringArg', 'Json',
    'this.Json', 'this.Uuid', 'GetArg', 'DerefScalar',
]);
const GO_STRING_PTR_TUPLE_CALL = /^(?:this|base|this\.Exchange|this\.BaseExchange)\.Handle(?:MarketType|SubType|MarginMode|OptionString)AndParams2?\(/;
const GO_STRING_CMP_PLAIN_ARG = /^(?:nil|true|false|""|-?\d+(?:\.\d+)?|map\[string\]any\{\}|\[\]any\{\})$/;

// true when the masked right-hand side cannot yield a pointer box; `ident` judges bare names
function goStringCmpSafeWrite (rhs: string, ident: (name: string) => boolean, boxOnly: boolean): boolean {
    const text = rhs.replace (/\bccxt\./g, '').trim ();
    if (text === '""') {
        return true;
    }
    if (/^(?:nil|true|false|-?\d+(?:\.\d+)?)$/.test (text) || /^(?:map\[string\]any|\[\]any)\{/.test (text)) {
        return !boxOnly;
    }
    if (/^\w+$/.test (text)) {
        return !boxOnly && ident (text);
    }
    const call = /^((?:this\.)?\w+)\(/.exec (text);
    const args = call ? goCallArgsSpanningText (text, call[0].length - 1) : undefined;
    if ((call === null) || (args === undefined)) {
        return false;
    }
    if (boxOnly && !GO_STRING_CMP_BOX_CALLS.has (call[1])) {
        return false;
    }
    if (call[1] === 'DerefScalar') {
        return (args.length === 1) && GO_ANY_NIL_DEREF_INNER.test (args[0]) && (goCallArgsSpanningText (args[0], args[0].indexOf ('(')) !== undefined);
    }
    if (call[1] === 'GetArg') {
        return (args.length === 3) && GO_STRING_CMP_PLAIN_ARG.test (args[2]);
    }
    return GO_STRING_CMP_SAFE_CALLS.has (call[1]);
}

function goStringLiteralCompareText (fn: string, isEqualFn: string): string {
    if (fn.indexOf (isEqualFn) < 0) {
        return fn;
    }
    const helper = isEqualFn.replace (/[.(]/g, '\\$&');
    const signature = fn.slice (0, fn.indexOf ('{'));
    const signatureLine = signature.split ('\n').length - 1;
    const commentState = { 'inBlockComment': false };
    const code = fn.split ('\n').map ((line) => stripGoLiterals (line, commentState));
    const kinds = new Map<string, string> ();
    const kindOf = (name: string): string => {
        const known = kinds.get (name);
        if (known !== undefined) {
            return known;
        }
        kinds.set (name, 'no');
        const param = new RegExp ('[(,]\\s*' + name + ' (\\S+?)[,)]').exec (signature);
        const declRe = new RegExp ('\\bvar ' + name + '\\b|(?<![.\\w])' + name + '\\s*(?:,\\s*\\w+\\s*)*:=|,\\s*' + name + '\\s*(?:,\\s*\\w+\\s*)*:=|\\bfunc\\b[^{]*[(,]\\s*' + name + ' ');
        const declLines = code.map ((line, index) => index).filter ((index) => (index > signatureLine) && declRe.test (code[index]));
        let kind = 'no';
        if (param) {
            kind = (!declLines.length && /^(?:string|int64|float64|bool|int)$/.test (param[1])) ? 'scalar' : 'no';
            kinds.set (name, kind);
            return kind;
        }
        if (declLines.length !== 1) {
            return kind;
        }
        const declIndex = declLines[0];
        const decl = code[declIndex];
        const safeIdent = (other: string): boolean => (other !== name) && (kindOf (other) !== 'no') && (kindOf (other) !== 'ptr');
        let match: RegExpExecArray | null;
        if (new RegExp ('^\\s*var ' + name + ' (?:string|int64|float64|bool|int) = ').test (decl)) {
            kind = 'scalar';
        } else if (new RegExp ('^\\s*var ' + name + ' \\*string(?: = |$)').test (decl)) {
            kind = 'ptr';
        } else if ((match = new RegExp ('^\\s*' + name + ', \\w+ := (.*)$').exec (decl)) && GO_STRING_PTR_TUPLE_CALL.test (match[1]) && (goCallArgsSpanningText (match[1], match[1].indexOf ('(')) !== undefined)) {
            kind = 'ptr';
        } else if ((match = new RegExp ('^\\s*var ' + name + ' any(?: = (.*))?$').exec (decl))) {
            kind = ((match[1] === undefined) || goStringCmpSafeWrite (match[1], safeIdent, false)) ? 'box' : 'no';
        } else if ((match = new RegExp ('^\\s*' + name + ' := (.*)$').exec (decl))) {
            kind = goStringCmpSafeWrite (match[1], safeIdent, true) ? 'box' : 'no';
        }
        if (kind === 'box') {
            const mention = new RegExp ('(?<![.\\w])' + name + '(?!\\w)');
            const unsafe = new RegExp ('&' + name + '\\b|(?<![.\\w])' + name + '\\s*(?:\\+\\+|--|[-+*/%|&^]=)|,\\s*' + name + '\\s*(?:,[^=\\n]*)?=[^=]|(?<![.\\w])' + name + '\\s*,[\\w\\s,]*=[^=]');
            for (let i = 0; (kind === 'box') && (i < code.length); i++) {
                if ((i === declIndex) || !mention.test (code[i])) {
                    continue;
                }
                const write = new RegExp ('^\\s*' + name + ' = (.*)$').exec (code[i]);
                if (unsafe.test (code[i])) {
                    kind = 'no';
                } else if (write) {
                    kind = goStringCmpSafeWrite (write[1], safeIdent, false) ? 'box' : 'no';
                } else if (new RegExp ('(?<![.\\w=!<>])' + name + '\\s*=[^=]').test (code[i])) {
                    kind = 'no';
                }
            }
        }
        kinds.set (name, kind);
        return kind;
    };
    return fn.replace (new RegExp ('(!?)(?<![.\\w])' + helper + '(\\w+), (\"(?:[^\"\\\\]|\\\\.)*\")\\)', 'g'), ((m: string, not: string, name: string, literal: string) => {
        const kind = kindOf (name);
        if (kind === 'box') {
            return '(' + name + ((not === '!') ? ' != ' : ' == ') + literal + ')';
        }
        if (kind === 'ptr') {
            return (not === '!') ? '(' + name + ' == nil || *' + name + ' != ' + literal + ')' : '(' + name + ' != nil && *' + name + ' == ' + literal + ')';
        }
        return m;
    }) as any);
}

export function goStringLiteralNativeCompares (content: string, isEqualFn: string): string {
    const ranges = goFuncBlockRanges (content);
    for (let i = ranges.length - 1; i >= 0; i--) {
        const block = content.slice (ranges[i].start, ranges[i].end);
        const rewritten = goStringLiteralCompareText (block, isEqualFn);
        if (rewritten !== block) {
            content = content.slice (0, ranges[i].start) + rewritten + content.slice (ranges[i].end);
        }
    }
    return content;
}

// SafeBool* with a literal bool default never returns nil (exchange_safe.go falls back to it),
// so its nil-guarded truthiness `C != nil && *C` reads the flag once as `*C`.
const GO_SAFEBOOL_LITERAL_CALL = 'this\\.SafeBool(?:2|N)?\\((?:[^()]|\\((?:[^()]|\\([^()]*\\))*\\))*, (?:true|false)\\)';
export function goSafeBoolLiteralDefaultDeref (content: string): string {
    const guarded = new RegExp ('(' + GO_SAFEBOOL_LITERAL_CALL + ') != nil && \\*(' + GO_SAFEBOOL_LITERAL_CALL + ')', 'g');
    return content.replace (guarded, (m: string, a: string, b: string) => ((a === b) ? '*' + a : m));
}

function goSafeBoolLiteralSelfTest (): string[] {
    const problems: string[] = [];
    const ok = (condition: boolean, message: string) => { if (!condition) { problems.push (message); } };
    ok (goSafeBoolLiteralDefaultDeref ('if this.SafeBool(this.Options, "a", false) != nil && *this.SafeBool(this.Options, "a", false) {') === 'if *this.SafeBool(this.Options, "a", false) {', 'literal default derefs once');
    ok (goSafeBoolLiteralDefaultDeref ('(!(this.SafeBool2(GetValue(m, "i"), "a", "b", true) != nil && *this.SafeBool2(GetValue(m, "i"), "a", "b", true)))') === '(!(*this.SafeBool2(GetValue(m, "i"), "a", "b", true)))', 'nested args and SafeBool2');
    const keep = [
        'this.SafeBool(p, "a") != nil && *this.SafeBool(p, "a")',
        'this.SafeBool(p, "a", d) != nil && *this.SafeBool(p, "a", d)',
        'this.SafeBool(p, "a", false) != nil && *this.SafeBool(q, "a", false)',
        'this.SafeBool(p, GetValue(k, false)) != nil && *this.SafeBool(p, GetValue(k, false))',
    ];
    keep.forEach ((text, index) => ok (goSafeBoolLiteralDefaultDeref (text) === text, 'non-literal default must keep the guard #' + index));
    return problems;
}

function goStringLiteralSelfTest (): string[] {
    const problems: string[] = [];
    const ok = (condition: boolean, message: string) => { if (!condition) { problems.push (message); } };
    const f = (body: string, sig = 'p any'): string => goStringLiteralNativeCompares ('\nfunc (this *X) f(' + sig + ', optionalArgs ...any) any {\n' + body + '\treturn nil\n}\n', 'IsEqual(');
    ok (f ('\tapi := GetArg(optionalArgs, 0, "public")\n\tif IsEqual(api, "private") || !IsEqual(api, "v2") {\n\t}\n').indexOf ('if (api == "private") || (api != "v2") {') >= 0, 'GetArg with a literal default compares natively');
    ok (f ('\tvar t any = "spot"\n\tvar u string = "x"\n\tif true {\n\t\tt = DerefScalar(this.SafeString(p, "type"))\n\t} else {\n\t\tt = u\n\t}\n\tt = GetValue(p, 0)\n\tif IsEqual(t, "swap") {\n\t}\n').indexOf ('if (t == "swap") {') >= 0, 'literal/DerefScalar/string-local/GetValue writes compare natively');
    ok (f ('\tm, q := this.HandleMarketTypeAndParams("f", nil, p)\n\t_ = q\n\tif IsEqual(m, "spot") && !IsEqual(m, "swap") {\n\t}\n').indexOf ('if (m != nil && *m == "spot") && (m == nil || *m != "swap") {') >= 0, 'a *string tuple result gets the nil-guarded compare');
    ok (f ('\tvar s *string = this.SafeString(p, "a")\n\tif IsEqual(s, "a") {\n\t}\n').indexOf ('(s != nil && *s == "a")') >= 0, 'a *string local gets the nil-guarded compare');
    const keep = [
        '\tvar v any = this.SafeString(p, "v")\n\tif IsEqual(v, "a") {\n\t}\n',
        '\tvar v any = "a"\n\tv = this.GetMarketType("f", p)\n\tif IsEqual(v, "a") {\n\t}\n',
        '\tvar v any = "a"\n\tvar s *string = nil\n\tv = s\n\tif IsEqual(v, "a") {\n\t}\n',
        '\tvar v any = "a"\n\tv, _ = this.Two(p)\n\tif IsEqual(v, "a") {\n\t}\n',
        '\tvar v any = nil\n\tif true {\n\t\tvar v any = p\n\t\t_ = v\n\t}\n\tif IsEqual(v, "a") {\n\t}\n',
        '\tv := GetArg(optionalArgs, 0, this.SafeString(p, "a"))\n\tif IsEqual(v, "a") {\n\t}\n',
        '\tv := this.Milliseconds()\n\tif IsEqual(v, "a") {\n\t}\n',
        '\tvar v any = func() any {\n\t\treturn p\n\t}()\n\tif IsEqual(v, "a") {\n\t}\n',
        '\tvar v any = DerefScalar(p)\n\tif IsEqual(v, "a") {\n\t}\n',
        '\tvar v any = "a"\n\tAppendToArray(&v, 1)\n\tif IsEqual(v, "a") {\n\t}\n',
        '\tvar v any = "a"\n\tvar w any = v\n\tw = p\n\tv = w\n\tif IsEqual(v, "a") {\n\t}\n',
    ];
    keep.forEach ((body, index) => ok (f (body).indexOf ('IsEqual(v, "a")') >= 0, 'unproven write must keep the helper #' + index));
    ok (f ('\tif IsEqual(p, "a") {\n\t}\n').indexOf ('IsEqual(p, "a")') >= 0, 'an any parameter keeps the helper');
    const ws = goStringLiteralNativeCompares ('\nfunc (this *X) f(optionalArgs ...any) any {\n\tapi := ccxt.GetArg(optionalArgs, 0, "public")\n\tif ccxt.IsEqual(api, "x") {\n\t}\n}\n', 'ccxt.IsEqual(');
    ok (ws.indexOf ('if (api == "x") {') >= 0, 'the package-qualified helper is rewritten');
    ok (goStringLiteralNativeCompares (ws, 'ccxt.IsEqual(') === ws, 'a second application is a no-op');
    return problems;
}

// Self-test for the same-file pointer-returning method rule: the boxed local keeps the
// deref-aware helper, a scalar-returning or unknown method and a typed local keep the native
// comparison, the reassignment form is caught too and a second application is a no-op.
function goPointerLocalNilSelfTest (): string[] {
    const problems: string[] = [];
    const ok = (condition: boolean, message: string) => { if (!condition) { problems.push (message); } };
    const pass = (text: string): string => goPointerLocalNativeNilCompares (text, 'IsEqual(');
    const pointer = '\nfunc (this *X) ParseOrderTimeInForce(status *string) *string {\n\treturn status\n}\n\nfunc (this *X) ParseOrder(order any) any {\n\tvar timeInForce any = this.ParseOrderTimeInForce(this.SafeString(order, "timeInForce"))\n\tvar typeRaw *string = this.SafeString(order, "type")\n\tif timeInForce == nil {\n\t\ttimeInForce = this.GetTifFromRawOrderType(typeRaw)\n\t}\n\tif typeRaw != nil {\n\t\treturn timeInForce\n\t}\n\treturn nil\n}\n';
    const rewritten = pass (pointer);
    ok (rewritten.indexOf ('if IsEqual(timeInForce, nil) {') >= 0, 'a local boxed from a same-file pointer method must keep the helper');
    ok (rewritten.indexOf ('if typeRaw != nil {') >= 0, 'a typed local must keep the native comparison');
    ok (rewritten.indexOf ('timeInForce == nil') < 0, 'the native comparison on the boxed local must be gone');
    const reassigned = pass ('\nfunc (this *X) M(a any) *string {\n\treturn nil\n}\n\nfunc (this *X) N(order any) any {\n\tvar code any = nil\n\tcode = this.M(order)\n\tif code != nil {\n\t\treturn code\n\t}\n\treturn nil\n}\n');
    ok (reassigned.indexOf ('if !IsEqual(code, nil) {') >= 0, 'a local reassigned from a pointer method must keep the helper');
    const scalar = pass ('\nfunc (this *X) M(a any) string {\n\treturn ""\n}\n\nfunc (this *X) N(order any) any {\n\tvar code any = this.M(order)\n\tif code == nil {\n\t\treturn nil\n\t}\n\treturn code\n}\n');
    ok (scalar.indexOf ('if code == nil {') >= 0, 'a scalar-returning method keeps the native comparison');
    const unknown = pass ('\nfunc (this *X) N(order any) any {\n\tvar code any = this.SomeOtherFileMethod(order)\n\tif code == nil {\n\t\treturn nil\n\t}\n\treturn code\n}\n');
    ok (unknown.indexOf ('if code == nil {') >= 0, 'a method this file does not declare keeps the native comparison');
    const twice = pass (pass (pointer));
    ok (twice.indexOf ('IsEqual(IsEqual(') < 0, 'a second application must be a no-op');
    ok (twice.indexOf ('if IsEqual(timeInForce, nil) {') >= 0, 'the rewritten comparison must survive a second application');
    return problems;
}

// Self-test for the DerefScalar() redundancy proof: a shim-only local loses the wrap, and
// every other read shape keeps it.
function goDerefWrapSelfTest (): string[] {
    const problems: string[] = [];
    const ok = (condition: boolean, message: string) => { if (!condition) { problems.push (message); } };
    const safeCall = 'this\\.(?:DerivedExchange\\.)?(?:Safe(?:(?:String|Integer|Number|Float|Bool)[N2-9]*|CurrencyCode|Symbol)|NumberToString|Parse8601|Iso8601)\\((?:[^()]|\\([^()]*\\))*\\)';
    const redundant = (body: string, name: string): boolean => {
        const text = '\nfunc (this *X) f() any {\n' + body + '}\n';
        const wrapLines = new Set<number> ();
        text.split ('\n').forEach ((line, index) => { if (line.indexOf ('DerefScalar(') >= 0) { wrapLines.add (index); } });
        return goDerefWrapRedundantLocals (text, wrapLines, [ name ]).has (name);
    };
    ok (redundant ('\tvar flag any = DerefScalar(this.SafeBool(market, "flag", false))\n\tif IsEqual(flag, true) {\n\t\treturn nil\n\t}\n', 'flag'), 'shim-only declaration must drop the wrap');
    ok (redundant ('\tvar amount any = nil\n\tamount = DerefScalar(this.SafeNumber(order, "amount"))\n\tif EvalTruthy(amount) {\n\t\treturn nil\n\t}\n\t_ = amount\n', 'amount'), 'shim-only reassignment must drop the wrap');
    ok (redundant ('\tvar flag any = DerefScalar(this.SafeBool(market, "flag", false))\n\t// flag is read through the shim below\n\tif !EvalTruthy(flag) {\n\t\treturn nil\n\t}\n', 'flag'), 'a comment mention must not veto');
    ok (redundant ('\tvar id any = DerefScalar(this.SafeString(o, "id"))\n\tquantity = Add(id, "x")\n', 'id'), 'a shim call inside a write must keep the local redundant');
    ok (!redundant ('\tvar code any = DerefScalar(this.SafeString(entry, "code"))\n\tif code == nil {\n\t\treturn nil\n\t}\n', 'code'), 'a raw nil comparison must keep the wrap');
    ok (!redundant ('\tvar side any = DerefScalar(this.SafeString(trade, "side"))\n\tswitch side {\n\tcase "buy":\n\t\treturn nil\n\t}\n', 'side'), 'a switch must keep the wrap');
    ok (!redundant ('\tvar id any = DerefScalar(this.SafeString(o, "id"))\n\treturn id\n', 'id'), 'a return must keep the wrap');
    ok (!redundant ('\tvar id any = DerefScalar(this.SafeString(o, "id"))\n\tresult["id"] = id\n', 'id'), 'a dict store must keep the wrap');
    ok (!redundant ('\tvar id any = DerefScalar(this.SafeString(o, "id"))\n\tthis.ParseOrderId(id, market)\n', 'id'), 'an argument to a non-shim call must keep the wrap');
    ok (!redundant ('\tvar qty any = DerefScalar(this.SafeNumber(o, "qty"))\n\tresult := map[string]any{"qty": qty}\n', 'qty'), 'a dict literal value must keep the wrap');
    ok (!redundant ('\tvar x any = nil\n\tx = this.SafeString2(params, "x", "y", x)\n\tif IsEqual(x, nil) {\n\t\treturn nil\n\t}\n', 'x'), 'a read inside the wrapped call arguments must keep the wrap');
    ok (!redundant ('\tvar x any = nil\n\tx = this.SafeString2(params, "x", "y", x)\n\tif IsEqual(x, nil) {\n\t\treturn nil\n\t}\n', 'x'), 'the same read keeps the wrap inside the wrapped form too');
    const both = '\nfunc (this *X) f() any {\n\tvar flag any = DerefScalar(this.SafeBool(market, "flag", false))\n\t_ = flag\n}\n\nfunc (this *X) g() any {\n\tvar flag any = ccxt.DerefScalar(this.SafeBool(market, "flag", false))\n\tif flag != nil && *flag {\n\t\treturn nil\n\t}\n}\n';
    const lines = new Set<number> ();
    both.split ('\n').forEach ((line, index) => { if (line.indexOf ('DerefScalar(') >= 0) { lines.add (index); } });
    ok (goDerefWrapRedundantLocals (both, lines, [ 'flag' ]).size === 0, 'a second function with a raw comparison must veto the name');
    const unwrapped = goUnwrapDerefWraps ('func f() {\n\tvar flag any = DerefScalar(this.SafeBool(market, "flag", false))\n\tvar row any = ccxt.DerefScalar(this.SafeString(data, "row"))\n}\n', [ 'flag', 'row' ], safeCall);
    ok (unwrapped.indexOf ('DerefScalar(') < 0, 'both wrap forms must be removed');
    ok (unwrapped.indexOf ('var flag any = this.SafeBool(market, "flag", false)') >= 0 && unwrapped.indexOf ('var row any = this.SafeString(data, "row")') >= 0, 'the drop must keep the wrapped call');
    return problems;
}

// One entry per line of a core body: how deeply it sits inside func literals, and
// whether that line opens or closes one. Everything the rewriter needs to decide
// what is "core level" comes from here, so the brace scan happens exactly once.
type CoreBodyScan = {
    'literalDepth': number[];   // func-literal nesting depth *before* the line
    'closesTo': number[];       // for a line that closes a literal: the depth it drops to, else -1
    'sendsInLiteral': boolean;  // some line sends on ch from inside a func literal
};

// Walk a core body once and record func-literal nesting per line. Returns null when
// the braces do not balance, i.e. when the scan cannot be trusted.
function scanCoreBody (body: string[]): CoreBodyScan | null {
    const literalDepth: number[] = [];
    const closesTo: number[] = [];
    const funcLiteral: boolean[] = [];
    const comment = { 'inBlockComment': false };
    let sendsInLiteral = false;
    for (const line of body) {
        const code = stripGoLiterals (line, comment);
        const depthBefore = funcLiteral.filter ((isFunc) => isFunc).length;
        literalDepth.push (depthBefore);
        if (depthBefore > 0 && GO_CORE_SEND.test (line.trim ())) {
            sendsInLiteral = true;
        }
        const starts: number[] = [];
        GO_FUNC_LITERAL.lastIndex = 0;
        let literal = GO_FUNC_LITERAL.exec (code);
        while (literal !== null) {
            starts.push (literal.index);
            literal = GO_FUNC_LITERAL.exec (code);
        }
        let closed = -1;
        for (let i = 0; i < code.length; i++) {
            if (code[i] === '{') {
                // a brace opened by the nearest `func(` on this line, with no other
                // brace in between, opens a function literal body
                const opensLiteral = starts.some ((at) => (at < i) && (code.slice (at, i).indexOf ('{') < 0));
                funcLiteral.push (opensLiteral);
            } else if (code[i] === '}') {
                if (funcLiteral.pop () === true) {
                    closed = funcLiteral.filter ((isFunc) => isFunc).length;
                }
            } else {
                continue;
            }
            if (funcLiteral.length < 0) {
                return null;
            }
        }
        closesTo.push (closed);
    }
    if (funcLiteral.length || comment.inBlockComment) {
        return null;
    }
    return { literalDepth, closesTo, sendsInLiteral };
}

// true when every bracket the line opens it also closes — i.e. the line is a
// complete statement rather than the head of a multi-line composite literal
function isBalancedGoLine (line: string): boolean {
    const code = stripGoLiterals (line);
    let depth = 0;
    for (const char of code) {
        if (char === '{' || char === '(' || char === '[') {
            depth++;
        } else if (char === '}' || char === ')' || char === ']') {
            depth--;
        }
        if (depth < 0) {
            return false;
        }
    }
    return depth === 0;
}

// Thread the sent-flag through one core BODY. `lines[start]` is the `defer close(ch)`
// line and `lines[start + 1]` the `defer ReturnPanicError(ch)` right after it; the body
// statements follow, flat, until the column-0 closing brace. Returns the replacement body
// (flag declaration + rewritten lines) and the index of that brace, or null when any
// safety gate fails.
function guardMultiSendCore (lines: string[], start: number): { 'body': string[]; 'end': number } | null {
    const indent = (GO_CORE_CLOSE.exec (lines[start]) as RegExpExecArray)[1];
    // the two defers open the body at the same level; anything else is a shape we did
    // not emit and do not understand
    if ((GO_CORE_PANIC.exec (lines[start + 1]) as RegExpExecArray)[1] !== indent) {
        return null;
    }
    const bodyStart = start + 2;
    let end = bodyStart;
    while (end < lines.length && !GO_CORE_END.test (lines[end])) {
        end++;
    }
    if (end >= lines.length) {
        return null;
    }
    const body = lines.slice (bodyStart, end);
    const scan = scanCoreBody (body);
    if (scan === null || !scan.sendsInLiteral) {
        // nothing to guard: the core only ever sends at its own level
        return null;
    }
    const rewritten: string[] = [];
    for (let index = 0; index < body.length; index++) {
        const line = body[index];
        const trimmed = line.trim ();
        const nested = scan.literalDepth[index] > 0;
        const lineIndent = line.slice (0, line.length - line.trimStart ().length);
        if (new RegExp ('\\b' + GO_SENT_FLAG + '\\b').test (stripGoLiterals (line))) {
            // the flag would collide with an identifier the body already uses
            return null;
        }
        rewritten.push (line);
        if (nested && GO_CORE_SEND.test (trimmed)) {
            // record the send so the core level below can stop; a multi-line send
            // (`ch <- map[string]any{` …) would put this in the wrong place, so the
            // send has to be a complete statement on its own line
            if (!isBalancedGoLine (line)) {
                return null;
            }
            rewritten.push (lineIndent + GO_SENT_FLAG + ' = true');
        }
        if (scan.closesTo[index] === 0 && GO_LITERAL_INVOKED.test (trimmed)) {
            // the outermost try/catch shim just returned: if it produced a value the
            // core is done, exactly as the `return` inside the TypeScript `try` meant.
            // `return nil` leaves the body method (whose result is `any`); the
            // trampoline already handed the channel to the caller and `defer close`
            // still runs
            rewritten.push (lineIndent + 'if ' + GO_SENT_FLAG + ' {');
            rewritten.push (lineIndent + GO_INDENT_UNIT + 'return nil');
            rewritten.push (lineIndent + '}');
        }
    }
    const declaration = [ indent + GO_SENT_FLAG + ' := false', indent + '_ = ' + GO_SENT_FLAG ];
    return { 'body': declaration.concat (rewritten), 'end': end };
}

function guardMultiSendCores (content: string): string {
    if (content.indexOf ('ReturnPanicError(ch)') < 0) {
        return content;
    }
    const lines = content.split ('\n');
    const result: string[] = [];
    let index = 0;
    while (index < lines.length) {
        const isCore = (index + 2 < lines.length)
            && GO_CORE_CLOSE.test (lines[index])
            && GO_CORE_PANIC.test (lines[index + 1])
            && result.length > 0
            && GO_CORE_SIGNATURE.test (result[result.length - 1]);
        const guarded = isCore ? guardMultiSendCore (lines, index) : null;
        if (guarded === null) {
            result.push (lines[index]);
            index++;
            continue;
        }
        // the core keeps the prologue ast-transpiler emitted; only the body is rewritten
        result.push (lines[index], lines[index + 1]);
        for (const line of guarded.body) {
            result.push (line);
        }
        // the core's closing brace is emitted by the next turn of the loop
        index = guarded.end;
    }
    return result.join ('\n');
}

// Go cannot assign an interface value to a concrete-typed variable, so a local the
// classifier named `string` needs the explicit assertion its new type forces:
//
//     var key any = GetValue(keys, i)              // before
//     var key string = GetValue(keys, i).(string)  // after
//
// This is the element-access family of build/go-local-types.js: `keys` is a []string
// local and the read is bounded by its own loop condition, so GetValue always returns
// the boxed string of its []string branch — never the untyped nil the assertion would
// panic on (that path is what keeps every unbounded/computed/map-receiver site `any`).
// The C# port of the same family emits the identical `(string)` cast.
//
// Only those declarations can match: a `var x string = GetValue(...)` line the
// classifier did not produce would not compile at all, so this rewrite and the
// classifier's decision are the same set by construction. Anchored to one whole
// declaration line so a comment or string that merely quotes the shape is untouched.
function assertTypedElementAccess (content: string): string {
    return content.replace (
        /^(\s*var[ \t]+\w+[ \t]+string[ \t]*=[ \t]*)((?:[A-Za-z_]\w*\.)?GetValue\()((?:[^()\n]|\([^()\n]*\))*)(\))[ \t]*$/gm,
        (_match, declaration: string, call: string, args: string, close: string) => `${declaration}${call}${args}${close}.(string)`,
    );
}

// gofmt's declaration-list rule (go/printer nodes.go `declList`): a top-level declaration
// that carries a doc comment is separated from the declaration above it by exactly one
// blank line (`min = 2` linebreaks), while a declaration without one is emitted adjacent
// to it. The wrapper joins below used a bare '\n' everywhere, so a wrapper whose
// `/** ... */` doc template followed the previous wrapper's closing brace came out as
// `}\n/**` and gofmt re-inserted the blank line.
function joinGoDeclarations (decls: string[]): string {
    return decls.filter (decl => decl !== '').map ((decl, index) =>
        (index === 0 ? '' : (goDeclStartsWithComment (decl) ? '\n\n' : '\n')) + decl).join ('');
}

function goDeclStartsWithComment (decl: string): boolean {
    const firstLine = decl.split ('\n')[0].trim ();
    return firstLine.startsWith ('//') || firstLine.startsWith ('/*');
}

// The Go printer emits gofmt-clean text (tabs, go/printer spacing, tabwriter alignment),
// so no gofmt runs at write time. `--check-gofmt [paths…]` is the gate: it runs `gofmt -l`
// over go/v4 (pro/, prediction/) and go/tests and exits 1 on any listing or parse error,
// 2 when gofmt or the tree is missing; `--check-gofmt --self-test` exercises the gate itself.
// gofmt is resolved from $CCXT_GOFMT, PATH, $GOROOT/bin and /usr/local/go/bin, in that order.
const GOFMT_BINARY_ENV = 'CCXT_GOFMT';
// the emitted tree: go/v4 recurses into pro/ and prediction/, go/tests holds the test tier
const GOFMT_GATE_TREE = [ 'go/v4', 'go/tests' ];

function gofmtUsable (binary: string): boolean {
    const probe = spawnSync (binary, [], { 'input': 'package x\n', 'encoding': 'utf8', 'windowsHide': true });
    return !probe.error && probe.status === 0;
}

let resolvedGofmt: string | null | undefined = undefined;  // undefined = not probed yet

function resolveGofmt (): string | null {
    if (resolvedGofmt !== undefined) {
        return resolvedGofmt;
    }
    const candidates = [ process.env[GOFMT_BINARY_ENV], 'gofmt' ];
    if (process.env['GOROOT']) {
        candidates.push (path.join (process.env['GOROOT'], 'bin', 'gofmt'));
    }
    // the campaign's own layout: this host keeps the toolchain here and off PATH
    candidates.push ('/usr/local/go/bin/gofmt');
    resolvedGofmt = null;
    for (const candidate of candidates) {
        if (typeof candidate === 'string' && candidate.length > 0 && gofmtUsable (candidate)) {
            resolvedGofmt = candidate;
            break;
        }
    }
    return resolvedGofmt;
}

// `s[i]` on a local the printer typed `[]string` prints as `GetValue(s, i)`, whose Go
// return type is `any`, so the declaration keeps the box; inside a loop that bounds the
// counter to `len(s)` every read is the element itself, and the retag happens here.
function goTextMaskLiteralsAndComments (content: string): string {
    const out = content.split ('');
    let state = 'code';
    let escaped = false;
    for (let i = 0; i < content.length; i++) {
        const c = content[i];
        if (state === 'code') {
            if ((c === '/') && (content[i + 1] === '/')) { state = 'line'; out[i] = ' '; out[i + 1] = ' '; i++; continue; }
            if ((c === '/') && (content[i + 1] === '*')) { state = 'block'; out[i] = ' '; out[i + 1] = ' '; i++; continue; }
            if (c === '"') { state = 'dq'; out[i] = ' '; continue; }
            if (c === '`') { state = 'raw'; out[i] = ' '; continue; }
            if (c === '\'') { state = 'rune'; out[i] = ' '; continue; }
            continue;
        }
        out[i] = (c === '\n') ? '\n' : ' ';
        if (state === 'line') { if (c === '\n') { state = 'code'; } continue; }
        if (state === 'block') { if ((c === '*') && (content[i + 1] === '/')) { out[i + 1] = ' '; i++; state = 'code'; } continue; }
        if (state === 'dq') { if (escaped) { escaped = false; } else if (c === '\\') { escaped = true; } else if (c === '"') { state = 'code'; } continue; }
        if (state === 'rune') { if (escaped) { escaped = false; } else if (c === '\\') { escaped = true; } else if (c === '\'') { state = 'code'; } continue; }
        if (state === 'raw') { if (c === '`') { state = 'code'; } continue; }
    }
    return out.join ('');
}

// every brace-delimited block of the file as { open, close, depth } line indices, plus the
// brace depth at the start of each line (and after the last one)
function goTextBlocks (maskedLines: string[]): any {
    const depth: number[] = [];
    let current = 0;
    for (const line of maskedLines) {
        depth.push (current);
        current += (line.split ('{').length - 1) - (line.split ('}').length - 1);
    }
    depth.push (current);
    const blocks: any[] = [];
    const stack: any[] = [];
    for (let k = 0; k < maskedLines.length; k++) {
        const before = depth[k];
        const after = depth[k + 1];
        if (after > before) {
            for (let x = before; x < after; x++) {
                const block: any = { 'open': k, 'close': maskedLines.length - 1, 'depth': x + 1 };
                blocks.push (block);
                stack.push (block);
            }
        } else if (after < before) {
            for (let x = before; x > after; x--) {
                const closed: any = stack.pop ();
                if (closed !== undefined) {
                    closed.close = k;
                }
            }
        }
    }
    return { 'blocks': blocks, 'depth': depth };
}

// the innermost block holding this line, undefined at the top level
function goTextEnclosingBlock (blocks: any[], index: number): any {
    let found: any = undefined;
    for (const block of blocks) {
        if ((block.open < index) && (index <= block.close) && ((found === undefined) || (block.depth > found.depth))) {
            found = block;
        }
    }
    return found;
}

// a line that writes, rebinds or takes the address of `name`
function goTextWritesName (maskedLine: string, name: string): boolean {
    const patterns = [
        new RegExp ('\\b' + name + '\\s*:='),
        new RegExp ('\\bvar\\s+' + name + '\\b'),
        new RegExp ('\\b' + name + '\\s*\\[[^\\]]*\\]\\s*[-+*/%&|^]?=(?!=)'),
        new RegExp ('\\b' + name + '\\s*[-+*/%&|^]?=(?!=)'),
        new RegExp ('\\b' + name + '\\s*(?:\\+\\+|--)'),
        new RegExp ('&\\s*' + name + '\\b'),
    ];
    return patterns.some ((rx: RegExp) => rx.test (maskedLine));
}

// a read of the local a `string` declaration cannot carry, or one that would observe the
// box instead of the element: a nil comparison, `IsEqual(x, nil)`, a type assertion, len
function goTextReadIsHazard (maskedLine: string, name: string): boolean {
    const patterns = [
        new RegExp ('\\b' + name + '\\s*[!=]=\\s*nil\\b'),
        new RegExp ('\\bnil\\s*[!=]=\\s*' + name + '\\b'),
        new RegExp ('\\bIsEqual\\s*\\(\\s*' + name + '\\s*,\\s*nil\\s*\\)'),
        new RegExp ('\\b' + name + '\\s*\\.\\s*\\('),
        new RegExp ('\\b(?:len|cap)\\s*\\(\\s*' + name + '\\s*\\)'),
    ];
    return patterns.some ((rx: RegExp) => rx.test (maskedLine));
}

// `var x any = [ccxt.]GetValue(s, i)` -> `var x string = s[i]` when `s` is a `[]string`
// local and the declaration heads a counting loop bounded by `len(s)` (directly or via an
// unwritten int local); any write to the counter or slice, or a hazard read, keeps `any`.
// Container helpers on a local/parameter printed `[]any`/`[]string`/`map[string]any` (the only
// declaration of that name in its top-level func) become native Go where the helper adds nothing:
// len(x); x["k"] as the first argument of a helper that derefs it at entry; x["k"] = v on a proven non-nil map.
const GO_ACCESS_DEREF_CONSUMERS = [ 'SafeStringPtr', 'IsEqual', 'EvalTruthy', 'IsString', 'ToString', 'ParseInt', 'Add', 'GetValue' ];
const GO_ACCESS_NON_NIL_MAP_INIT = /^(?:map\[string\]any\{|(?:ccxt\.)?GetArgMap\(optionalArgs, \d+, map\[string\]any\{\}\)$|this\.(?:Extend|DeepExtend)\()/;
const GO_ACCESS_SCALAR_TYPES = [ 'string', 'int64', 'float64', 'bool', 'int' ];
// value types derefScalar passes through unchanged (it only unwraps pointers)
const GO_ACCESS_PLAIN_VALUE_TYPES = [ ...GO_ACCESS_SCALAR_TYPES, 'map[string]any', '[]any', '[]string' ];
const GO_ACCESS_DEREF_POINTER_TYPES = [ '*string', '*int64', '*float64', '*bool' ];

function goAccessEscape (name: string): string {
    return name.replace (/[^\w]/g, '');
}

// the Go type of `name` when the func text declares it exactly once (a `var` or a parameter
// of the top-level signature), with its initializer text for a `var`; undefined otherwise
function goAccessSingleDeclaration (maskedFunc: string, signature: string, name: string): any {
    const n = goAccessEscape (name);
    const vars = [ ...maskedFunc.matchAll (new RegExp ('\\bvar\\s+' + n + '\\s+([^=\\n]+?)\\s*(?:=|\\n)', 'g')) ];
    const shortDecls = maskedFunc.match (new RegExp ('(?:^|[^\\w.])' + n + '\\s*(?:,\\s*\\w+\\s*)*:=|,\\s*' + n + '\\s*(?:,\\s*\\w+\\s*)*:=', 'gm')) ?? [];
    const literalParams = [ ...maskedFunc.matchAll (/\bfunc\s*\(([^()]*)\)/g) ].filter ((m) => new RegExp ('\\b' + n + '\\b').test (m[1]));
    const rangeDecls = maskedFunc.match (new RegExp ('\\bfor\\b[^\\n{]*\\b' + n + '\\b[^\\n{]*:=\\s*range\\b')) ?? [];
    const sigParam = new RegExp ('[(,]\\s*' + n + '\\s+([^,()]+?)\\s*[,)]').exec (signature.substring (signature.indexOf ('(', signature.startsWith ('func (') ? signature.indexOf (')') + 1 : 0)));
    const count = vars.length + shortDecls.length + literalParams.length + rangeDecls.length + (sigParam ? 1 : 0);
    if (count !== 1) {
        return undefined;
    }
    if (sigParam) {
        return { 'type': sigParam[1].trim (), 'init': undefined };
    }
    if (vars.length === 1) {
        const line = maskedFunc.substring (vars[0].index).split ('\n')[0];
        return { 'type': vars[0][1].trim (), 'index': vars[0].index, 'line': line };
    }
    return undefined;
}

// line k sits directly in the body of an `if name != nil {` block (no else-if chain above it)
function goAccessInsideNilGuard (masked: string[], k: number, name: string): boolean {
    let depth = 0;
    for (let j = k - 1; j >= 0; j--) {
        const line = masked[j];
        for (let c = line.length - 1; c >= 0; c--) {
            depth += (line[c] === '}') ? 1 : ((line[c] === '{') ? -1 : 0);
            if (depth < 0) {
                return new RegExp ('^\\s*if ' + goAccessEscape (name) + ' != nil \\{\\s*$').test (line);
            }
        }
    }
    return false;
}

function nativeTypedContainerAccess (content: string): string {
    if (!/\b(?:GetArrayLength|GetValue|AddElementToObject|InOp|ObjectKeys)\(/.test (content)) {
        return content;
    }
    const lines = content.split ('\n');
    const masked = goTextMaskLiteralsAndComments (content).split ('\n');
    if (lines.length !== masked.length) {
        return content;
    }
    let start = -1;
    for (let k = 0; k < lines.length; k++) {
        if (lines[k].startsWith ('func ')) {
            start = k;
            continue;
        }
        if ((start >= 0) && (lines[k] === '}')) {
            rewriteTypedContainerFunc (lines, masked, start, k);
            start = -1;
        }
    }
    return lines.join ('\n');
}

// Go types whose len() answers what GetArrayLength answers (nil slice -> 0, string -> bytes)
const GO_ARRLEN_NATIVE_TYPES = /^(?:string|\[\](?:any|string|int64|float64|bool|int|map\[string\]any|\[\]any))$/;
// hand-written callees whose Go signature returns []any (no generated override exists)
const GO_ARRLEN_SLICE_PRODUCER = /^(?:ccxt\.)?(?:this\.(?:ToArray|ArrayConcat|Sort|SortBy|SortBy2|FilterBy|ExtractParams)\(.*\)|(?:ListTyped|ArrayTyped|ObjectValues|SafeListTyped|SafeList2Typed|SafeListTypedDefault)\(.*\)|\[\]any\{.*\})$/;

// `var x any = P` -> `var x []any = P` when x is declared once, every write is a []any producer
// and no read observes the box itself (nil comparison, type assertion, address, multi-assign):
// each read then sees the same []any value it saw through the box.
function retypeSliceProducerLocals (lines: string[], masked: string[], start: number, end: number) {
    const maskedFunc = masked.slice (start, end + 1).join ('\n');
    const names = new Set ([ ...maskedFunc.matchAll (/\bGetArrayLength\((\w+)\)/g) ].map ((m) => m[1]));
    for (const name of names) {
        const n = goAccessEscape (name);
        const decl = goAccessSingleDeclaration (maskedFunc, lines[start], name);
        if ((decl === undefined) || (decl.type !== 'any') || (decl.index === undefined)) {
            continue;
        }
        const declRx = new RegExp ('^(\\s*var ' + n + ' )any( = )(.*)$');
        const writeRx = new RegExp ('^\\s*' + n + ' = (.*)$');
        let declLine = -1;
        let safe = true;
        for (let k = start + 1; (k < end) && safe; k++) {
            const d = declRx.exec (masked[k]);
            const w = writeRx.exec (masked[k]);
            const rhs = d ? lines[k].substring (d[1].length + 3 + d[2].length) : (w ? lines[k].substring (lines[k].length - w[1].length) : undefined);
            if (d) {
                declLine = k;
            }
            if ((rhs !== undefined) && !GO_ARRLEN_SLICE_PRODUCER.test (rhs.trim ())) {
                safe = false;
            }
            if ((rhs === undefined) && goTextWritesName (masked[k], n)) {
                safe = false;
            }
            if (new RegExp ('\\b' + n + '\\s*[!=]=|[!=]=\\s*' + n + '\\b|\\b' + n + '\\s*\\.\\s*\\(|&\\s*' + n + '\\b|\\b' + n + '\\s*,[^=\\n]*=|,\\s*' + n + '\\s*(?:,[^=\\n]*)?=').test (masked[k])) {
                safe = false;
            }
        }
        if (safe && (declLine >= 0)) {
            lines[declLine] = lines[declLine].replace (declRx, '$1[]any$2$3');
            masked[declLine] = masked[declLine].replace (declRx, '$1[]any$2$3');
        }
    }
}

// len(ObjectKeys(m)) -> len(m) on a map[string]any local/param: the helper derefs nothing
// for a plain map and counts every key, a nil map answers 0 either way
function goNativeObjectKeysLength (line: string, masked: string, typeAt: (name: string, k: number) => string | undefined, k: number): string {
    return line.replace (/(?<![\w.])len\((?:ccxt\.)?ObjectKeys\((\w+)\)\)/g, (all: string, name: string, at: number) =>
        (((masked.substr (at, all.length) === all) && (typeAt (name, k) === 'map[string]any')) ? 'len(' + name + ')' : all));
}

function rewriteTypedContainerFunc (lines: string[], masked: string[], start: number, end: number) {
    retypeSliceProducerLocals (lines, masked, start, end);
    const maskedFunc = masked.slice (start, end + 1).join ('\n');
    const lineOffsets: number[] = [];
    let offset = 0;
    for (let k = start; k <= end; k++) {
        lineOffsets.push (offset);
        offset += masked[k].length + 1;
    }
    const cache = new Map<string, any> ();
    const declOf = (name: string) => {
        if (!cache.has (name)) {
            cache.set (name, goAccessSingleDeclaration (maskedFunc, lines[start], name));
        }
        return cache.get (name);
    };
    // declared before this line (a parameter always is)
    const typeAt = (name: string, k: number): string | undefined => {
        const decl = declOf (name);
        if ((decl === undefined) || ((decl.index !== undefined) && (decl.index >= lineOffsets[k - start]))) {
            return undefined;
        }
        return decl.type;
    };
    const notRebound = (name: string): boolean => !new RegExp ('(?:^|[^\\w.&*])' + goAccessEscape (name) + '\\s*=(?!=)|&\\s*' + goAccessEscape (name) + '\\b', 'm').test (maskedFunc);
    const consumers = GO_ACCESS_DEREF_CONSUMERS.join ('|');
    for (let k = start + 1; k < end; k++) {
        let line = lines[k];
        const original = line;
        const m = masked[k];
        if (goNativeInOp (lines, masked, k, maskedFunc, declOf, typeAt)) {
            continue;
        }
        if (!/\b(?:GetArrayLength|GetValue|AddElementToObject|ObjectKeys)\(/.test (m)) {
            continue;
        }
        const isCode = (text: string, at: number) => m.substr (at, text.length) === text;
        line = line.replace (/(?<![\w.])(?:ccxt\.)?GetArrayLength\((\w+)\)/g, (all: string, name: string, at: number) => {
            const t = typeAt (name, k);
            return (isCode (all, at) && (t !== undefined) && GO_ARRLEN_NATIVE_TYPES.test (t)) ? 'len(' + name + ')' : all;
        });
        if (line.length === lines[k].length) {
            line = line.replace (new RegExp ('((?<![\\w.])(?:ccxt\\.)?(?:' + consumers + ')\\()(?:ccxt\\.)?GetValue\\((\\w+), ("[^"\\\\\\n]*")\\)', 'g'), (all: string, head: string, name: string, key: string, at: number) =>
                ((isCode (head, at) && (typeAt (name, k) === 'map[string]any')) ? head + name + '[' + key + ']' : all));
        }
        if (line === lines[k]) {
            goNativeMapWrite (lines, masked, start, end, k, maskedFunc, declOf, typeAt, notRebound);
        } else {
            lines[k] = line;
        }
        if ((lines[k] === original) && /\bObjectKeys\(/.test (m)) {
            lines[k] = goNativeObjectKeysLength (lines[k], m, typeAt, k);
        }
    }
}

// `if ... InOp(m, k) ... {` -> `if _, ok := m[k]; ... ok ... {` on a map local the method creates (the
// native map-write receiver proof, so no other goroutine sees it) with a string key; the read has no
// side effect and a nil map reads ok=false like the helper. Other shapes, or `ok` in the func, keep InOp.
function goNativeInOp (lines: string[], masked: string[], k: number, maskedFunc: string,
    declOf: (name: string) => any, typeAt: (name: string, k: number) => string | undefined): boolean {
    const cond = /^(\s*(?:\} else )?if )([^;{}]*) \{$/.exec (masked[k]);
    const calls = [ ...masked[k].matchAll (/(?<![\w.])(?:ccxt\.)?InOp\(/g) ];
    if ((cond === null) || (calls.length !== 1) || /\bok\b/.test (maskedFunc)) {
        return false;
    }
    const at = calls[0].index;
    const call = /^(?:ccxt\.)?InOp\((\w+), (\w+|"[^"\\\n]*")\)/.exec (lines[k].substring (at));
    if ((call === null) || (goMapWriteGroupEnd (masked[k], at + call[0].indexOf ('(')) !== at + call[0].length)) {
        return false;
    }
    const [ , name, key ] = call;
    if ((typeAt (name, k) !== 'map[string]any') || !goMapWriteLocalNeverNil (maskedFunc, declOf (name), name, declOf)) {
        return false;
    }
    if (!key.startsWith ('"') && (typeAt (key, k) !== 'string')) {
        return false;
    }
    let rest = lines[k].substring (cond[1].length, at) + 'ok' + lines[k].substring (at + call[0].length);
    rest = rest.replace (/(^|[^\w)\]])\(ok\)/g, '$1ok');
    lines[k] = cond[1] + '_, ok := ' + name + '[' + key + ']; ' + rest;
    return true;
}

// ------------------------------------------------------------------------------------
// AddElementToObject(m, k, v) -> m[k] = v
// ------------------------------------------------------------------------------------
// The helper derefs a pointer key/value (a nil pointer or a typed-nil container becomes
// untyped nil) and is a no-op on a typed-nil map; its mutex guards shared maps only. So the
// native write needs a never-nil map local, a string key and a value the deref leaves alone.
const GO_MAPWRITE_NON_NIL_INIT = /^(?:(?:ccxt\.)?map\[string\]any\{|(?:ccxt\.)?GetArgMap\(optionalArgs, \d+, map\[string\]any\{\}\)$|this\.(?:Extend|DeepExtend)\(|this\.Account\(\)$)/;
// hand-written callees (no generated override) whose result derefScalar leaves unchanged
const GO_MAPWRITE_PLAIN_CALLS = [
    'this.Milliseconds', 'this.Seconds', 'this.Microseconds', 'this.Uuid', 'this.Uuid2', 'this.Uuid16', 'this.Uuid22',
    'this.Extend', 'this.DeepExtend', 'this.Json', 'this.Capitalize', 'this.ParseTimeframe', 'this.Account',
    'GetValue', 'ToString', 'ToLower', 'ToUpper', 'MathFloor', 'MathCeil', 'MathRound', 'MathAbs', 'ParseInt', 'Json', 'JsonStringify',
];

// end index (exclusive) of the balanced group opening at text[open], or -1
function goMapWriteGroupEnd (text: string, open: number): number {
    let depth = 0;
    for (let i = open; i < text.length; i++) {
        const c = text[i];
        depth += ('([{'.indexOf (c) >= 0) ? 1 : ((')]}'.indexOf (c) >= 0) ? -1 : 0);
        if (depth === 0) {
            return i + 1;
        }
    }
    return -1;
}

// every declaration and write of a local map is a never-nil map producer
function goMapWriteLocalNeverNil (maskedFunc: string, decl: any, name: string, declOf?: (name: string) => any, depth: number = 0): boolean {
    const producer = GO_MAPWRITE_NON_NIL_INIT;
    if ((decl === undefined) || (decl.index === undefined)) {
        return false;
    }
    const init = decl.line.replace (/^\s*var\s+\w+\s+\S+\s*=\s*/, '').trim ();
    // element 0 of the base handleUntilOption tuple is the request map it was handed
    const until = /^(?:ccxt\.)?MapTyped\((?:ccxt\.)?GetValue\((\w+), 0\)\)$/.exec (init);
    let admitted = producer.test (init);
    // Omit on a never-nil map answers a fresh map (exchange_functions.go OmitN/OmitMap)
    const omit = /^(?:ccxt\.)?MapTyped\(this\.Omit\((\w+), /.exec (init);
    if (!admitted && (omit !== null) && (omit[1] !== name) && (declOf !== undefined) && (depth < 4)) {
        admitted = goMapWriteLocalNeverNil (maskedFunc, declOf (omit[1]), omit[1], declOf, depth + 1);
    }
    if (!admitted && (until !== null) && (declOf !== undefined) && (depth < 4)) {
        const tuple = declOf (until[1]);
        const call = (tuple === undefined || tuple.index === undefined) ? null
            : /^\s*var\s+\w+\s+\[\]any\s*=\s*this\.HandleUntilOption\((?:\w+|\s*), (\w+), /.exec (tuple.line);
        admitted = (call !== null) && !new RegExp ('(?:^|[^\\w.&*])' + goAccessEscape (until[1]) + '\\s*=(?!=)|&\\s*' + goAccessEscape (until[1]) + '\\b', 'm').test (maskedFunc)
            && goMapWriteLocalNeverNil (maskedFunc, declOf (call[1]), call[1], declOf, depth + 1);
    }
    if (!admitted) {
        return false;
    }
    const n = goAccessEscape (name);
    if (new RegExp ('&\\s*' + n + '\\b|(?:^|[^\\w.])' + n + '\\s*(?:,[^=\\n]*)?:=|,\\s*' + n + '\\s*(?:,[^=\\n]*)?=(?!=)|(?:^|[^\\w.])' + n + '\\s*,[^=\\n]*=(?!=)', 'm').test (maskedFunc)) {
        return false; // address taken or multi-value rebinding
    }
    for (const w of maskedFunc.matchAll (new RegExp ('(?:^|[^\\w.&*])' + n + '\\s*=(?!=)\\s*([^\\n]*)', 'gm'))) {
        if (!producer.test (w[1].trim ())) {
            return false;
        }
    }
    return true;
}

// the masked value text is one call of a plain-return callee, or one map/slice literal
function goMapWritePlainValueExpr (maskedValue: string): boolean {
    const literal = /^(?:ccxt\.)?(?:map\[string\]any|\[\]any|\[\]string)\{/.exec (maskedValue);
    const call = /^(?:ccxt\.)?((?:this\.)?\w+)\(/.exec (maskedValue);
    let open = -1;
    if (literal !== null) {
        open = literal[0].length - 1;
    } else if ((call !== null) && (GO_MAPWRITE_PLAIN_CALLS.indexOf (call[1]) >= 0)) {
        open = call[0].length - 1;
    }
    return (open >= 0) && (goMapWriteGroupEnd (maskedValue, open) === maskedValue.length);
}

function goNativeMapWrite (lines: string[], masked: string[], start: number, end: number, k: number, maskedFunc: string,
    declOf: (name: string) => any, typeAt: (name: string, k: number) => string | undefined, notRebound: (name: string) => boolean) {
    const m = masked[k];
    const head = /^(\s*)(?:ccxt\.)?AddElementToObject\((\w+), /.exec (m);
    if ((head === null) || (lines[k].substring (0, head[0].length) !== head[0])) {
        return;
    }
    const name = head[2];
    if ((typeAt (name, k) !== 'map[string]any') || !goMapWriteLocalNeverNil (maskedFunc, declOf (name), name, declOf)) {
        return;
    }
    // the call may span lines (a multi-line literal value): it must be the whole statement
    const tail = masked.slice (k, end).join ('\n');
    const open = m.indexOf ('(', head[1].length);
    const close = goMapWriteGroupEnd (tail, open);
    if ((close < 0) || (tail.substring (close).split ('\n')[0].trim () !== '')) {
        return;
    }
    const lastLine = k + tail.substring (0, close).split ('\n').length - 1;
    const argsMasked = tail.substring (head[0].length, close - 1);
    const argsText = lines.slice (k, lastLine + 1).join ('\n').substring (head[0].length, close - 1);
    let depth = 0;
    let comma = -1;
    for (let i = 0; i < argsMasked.length; i++) {
        const c = argsMasked[i];
        depth += ('([{'.indexOf (c) >= 0) ? 1 : ((')]}'.indexOf (c) >= 0) ? -1 : 0);
        if ((depth === 0) && (c === ',')) {
            comma = i;
            break;
        }
    }
    if ((comma < 0) || (argsMasked[comma + 1] !== ' ') || (argsMasked.substring (0, comma).indexOf ('\n') >= 0)) {
        return;
    }
    const key = argsText.substring (0, comma);
    const value = argsText.substring (comma + 2);
    const valueMasked = argsMasked.substring (comma + 2);
    // a pointer the enclosing `if p != nil {` proves non-nil: the helper stores *p
    const guardedPointer = (text: string) => /^\w+$/.test (text) && (GO_ACCESS_DEREF_POINTER_TYPES.indexOf (typeAt (text, k) ?? '') >= 0)
        && notRebound (text) && goAccessInsideNilGuard (masked, k, text);
    let keyOut: string | undefined = undefined;
    if (/^"[^"\\\n]*"$/.test (key) || (/^\w+$/.test (key) && (typeAt (key, k) === 'string'))) {
        keyOut = key;
    } else if (guardedPointer (key) && (typeAt (key, k) === '*string')) {
        keyOut = '*' + key;
    }
    const valueType = /^\w+$/.test (value) ? typeAt (value, k) : undefined;
    // SafeString with a string default never answers nil (exchange_safe.go)
    const defaulted = /^this\.SafeString\((\w+(?:\[\"[^\"\\\n]*\"\])?|this\.\w+), (\w+|"[^"\\\n]*"), (\w+|"[^"\\\n]*")\)$/.exec (value);
    const defaultedOk = (defaulted !== null) && (defaulted[3].startsWith ('"') || (typeAt (defaulted[3], k) === 'string'));
    let valueOut: string | undefined = undefined;
    if (keyOut === undefined) {
        return;
    }
    if (/^(?:"[^"\\\n]*"|-?\d+(?:\.\d+)?|true|false|nil)$/.test (value) || goMapWritePlainValueExpr (valueMasked)) {
        valueOut = value;
    } else if ((valueType !== undefined) && (GO_ACCESS_SCALAR_TYPES.indexOf (valueType) >= 0)) {
        valueOut = value;
    } else if ((valueType !== undefined) && keyOut.startsWith ('"') && (GO_ACCESS_PLAIN_VALUE_TYPES.indexOf (valueType) >= 0)) {
        valueOut = value; // container locals under a literal key, as the typed-container pass always printed them
    } else if ((valueType === 'map[string]any') && goMapWriteLocalNeverNil (maskedFunc, declOf (value), value, declOf)) {
        valueOut = value; // the helper would store a typed-nil map as untyped nil
    } else if (guardedPointer (value)) {
        valueOut = '*' + value;
    } else if (defaultedOk) {
        valueOut = '*' + value;
    }
    if ((keyOut === undefined) || (valueOut === undefined)) {
        return;
    }
    const suffix = lines[lastLine].substring (lines[lastLine].length - (tail.substring (close).split ('\n')[0].length));
    const rewritten = (head[1] + name + '[' + keyOut + '] = ' + valueOut + suffix).split ('\n');
    lines.splice (k, rewritten.length, ...rewritten);
    masked[k] = masked[k].replace (/\S[\s\S]*/, (s: string) => ' '.repeat (s.length));
}

// `GetValue(m, "lit")` -> `m["lit"]` for a map local whose every write is a Market/SafeMarket
// result or nil: those rows are pointer-free (MarketTyped), so the index reads what GetValue does.
const GO_MARKET_ROW_WRITE = /^(?:(?:ccxt\.)?this\.(?:DerivedExchange\.|Exchange\.)?(?:Market|SafeMarket)\(.*\)|nil)$/;

function nativeMarketRowReads (content: string): string {
    if (!/\bGetValue\(\w+, "/.test (content)) {
        return content;
    }
    const lines = content.split ('\n');
    const masked = goTextMaskLiteralsAndComments (content).split ('\n');
    if (lines.length !== masked.length) {
        return content;
    }
    let start = -1;
    for (let k = 0; k < lines.length; k++) {
        if (lines[k].startsWith ('func ')) {
            start = k;
        } else if ((start >= 0) && (lines[k] === '}')) {
            rewriteMarketRowReads (lines, masked, start, k);
            start = -1;
        }
    }
    return lines.join ('\n');
}

function rewriteMarketRowReads (lines: string[], masked: string[], start: number, end: number) {
    const maskedFunc = masked.slice (start, end + 1).join ('\n');
    const verdicts = new Map<string, number | undefined> ();
    // line index of the single declaration when every write is a market row or nil
    const marketRowLocal = (name: string): number | undefined => {
        if (verdicts.has (name)) {
            return verdicts.get (name);
        }
        let verdict: number | undefined = undefined;
        const decl = goAccessSingleDeclaration (maskedFunc, lines[start], name);
        if ((decl !== undefined) && (decl.type === 'map[string]any') && (decl.index !== undefined) && !new RegExp ('&\\s*' + name + '\\b').test (maskedFunc)) {
            const writes = new RegExp ('(?<![\\w.])' + name + '\\b[^\\n=(]*(?<![=!<>:])=(?!=)');
            let ok = true;
            let declLine = -1;
            for (let k = start + 1; ok && (k < end); k++) {
                if (!writes.test (masked[k])) {
                    continue;
                }
                const m = new RegExp ('^\\s*(var ' + name + ' map\\[string\\]any|' + name + ') = (.*)$').exec (lines[k]);
                ok = (m !== null) && (masked[k].trimEnd ().length === lines[k].trimEnd ().length) && GO_MARKET_ROW_WRITE.test (m[2].trim ());
                if (ok && m[1].startsWith ('var ')) {
                    declLine = k;
                }
            }
            verdict = (ok && (declLine >= 0)) ? declLine : undefined;
        }
        verdicts.set (name, verdict);
        return verdict;
    };
    for (let k = start + 1; k < end; k++) {
        if (masked[k].indexOf ('GetValue(') < 0) {
            continue;
        }
        const m = masked[k];
        lines[k] = lines[k].replace (/(?<![\w.])(?:ccxt\.)?GetValue\((\w+), ("[^"\\\n]*")\)/g, (all: string, name: string, key: string, at: number) => {
            const head = all.substring (0, all.indexOf ('(') + 1 + name.length);
            const declLine = (m.substr (at, head.length) === head) ? marketRowLocal (name) : undefined;
            return ((declLine !== undefined) && (declLine < k)) ? name + '[' + key + ']' : all;
        });
    }
}

// `GetValue(ob, "asks"|"bids")` -> `ob.GetAsks()`/`ob.GetBids()` on a never-written, proven non-nil
// OrderBookInterface local; a cached book read right after its create-if-absent guard is typed first.
const GO_OB_CTOR = /^this\.(?:Indexed|Counted)?OrderBook\(.*\)$/;

function nativeOrderBookSideReads (content: string): string {
    if (!/GetValue\(\w+, "(?:asks|bids)"\)/.test (content)) {
        return content;
    }
    const lines = content.split ('\n');
    const masked = goTextMaskLiteralsAndComments (content).split ('\n');
    if (lines.length !== masked.length) {
        return content;
    }
    let start = -1;
    for (let k = 0; k < lines.length; k++) {
        if (lines[k].startsWith ('func ')) {
            start = k;
        } else if ((start >= 0) && (lines[k] === '}')) {
            rewriteOrderBookSideReads (lines, masked, start, k);
            start = -1;
        }
    }
    return lines.join ('\n');
}

// a stored book is present at line k: an `if !(InOp(this.Orderbooks, key))` block right above that ends by
// storing a new book (key proven non-nil) or by leaving, or an enclosing `if InOp(this.Orderbooks, key)`
const GO_OB_STORE_WRITE = /\b(?:AddElementToObject|Remove)\(this\.Orderbooks\b|this\.Orderbooks\.(?:Store|Delete)\(/;

function orderBookKeyPresent (lines: string[], start: number, k: number, ind: string, key: string, keyNonNil: (at: number) => boolean): boolean {
    const pkg = '(?:ccxt\\.)?';
    const negGuard = new RegExp ('^' + ind + 'if !\\(' + pkg + 'InOp\\(this\\.Orderbooks, ' + key + '\\)\\) \\{$');
    if (lines[k - 1] === ind + '}') {
        let open = k - 2;
        while ((open > start) && !(lines[open].startsWith (ind) && !lines[open].startsWith (ind + '\t'))) {
            open--;
        }
        if ((open <= start) || !negGuard.test (lines[open])) {
            return false;
        }
        let last = k - 2;
        while ((last > open) && /^\s*(?:\/\/.*)?$/.test (lines[last])) {
            last--;
        }
        const tail = lines[last];
        if (!tail.startsWith (ind + '\t') || tail.startsWith (ind + '\t\t')) {
            return false;
        }
        const body = tail.trim ();
        if ((body === 'return') || (body === 'continue')) {
            return true;
        }
        const stored = new RegExp ('^(?:' + pkg + 'AddElementToObject\\(this\\.Orderbooks, ' + key + ', |this\\.Orderbooks\\.Store\\(' + key + ', )(.*)\\)$').exec (body);
        if ((stored === null) || !keyNonNil (k)) {
            return false;
        }
        if (GO_OB_CTOR.test (stored[1])) {
            return true;
        }
        // a local declared from a book constructor in the same block
        const local = stored[1];
        const declRx = new RegExp ('^' + ind + '\\tvar ' + local + ' ' + pkg + 'OrderBookInterface = (.*)$');
        for (let j = open + 1; j < last; j++) {
            const d = declRx.exec (lines[j]);
            if (d !== null) {
                return GO_OB_CTOR.test (d[1]);
            }
        }
        return false;
    }
    if (ind.length < 2) {
        return false;
    }
    const outer = ind.substring (1);
    const posGuard = new RegExp ('^' + outer + 'if ' + pkg + 'InOp\\(this\\.Orderbooks, ' + key + '\\) \\{$');
    for (let j = k - 1; j > start; j--) {
        if (lines[j].startsWith (ind) || /^\s*$/.test (lines[j])) {
            if (GO_OB_STORE_WRITE.test (lines[j])) {
                return false;
            }
            continue;
        }
        return posGuard.test (lines[j]);
    }
    return false;
}

function rewriteOrderBookSideReads (lines: string[], masked: string[], start: number, end: number) {
    const maskedFunc = masked.slice (start, end + 1).join ('\n');
    const written = (name: string, declLine: number): boolean => {
        const w = new RegExp ('(?<![\\w.])' + name + '\\b[^\\n=(]*(?<![=!<>:])=(?!=)|&\\s*' + name + '\\b|(?<![\\w.])' + name + '\\s*(?:\\+\\+|--)');
        for (let k = start + 1; k < end; k++) {
            if ((k !== declLine) && w.test (masked[k])) {
                return true;
            }
        }
        return false;
    };
    const declLineOf = (name: string): number => {
        const decl = goAccessSingleDeclaration (maskedFunc, lines[start], name);
        if ((decl === undefined) || (decl.index === undefined)) {
            return -1;
        }
        return start + maskedFunc.substring (0, decl.index).split ('\n').length - 1;
    };
    // the key is a string, or a *string dereferenced earlier on a line whose block encloses the read
    const { 'blocks': blocks } = goTextBlocks (masked);
    const keyNonNil = (key: string, at: number): boolean => {
        const decl = goAccessSingleDeclaration (maskedFunc, lines[start], key);
        if ((decl === undefined) || written (key, (decl.index === undefined) ? -1 : declLineOf (key))) {
            return false;
        }
        if (decl.type === 'string') {
            return true;
        }
        if (decl.type !== '*string') {
            return false;
        }
        const deref = new RegExp ('(?<![\\w.)\\]])\\*' + key + '\\b');
        for (let k = start + 1; k < at; k++) {
            if (!deref.test (masked[k]) || /^\s*(?:if|else|for|switch|case|\})/.test (masked[k]) || /&&|\|\|/.test (masked[k])) {
                continue;
            }
            const block = goTextEnclosingBlock (blocks, k);
            if ((block !== undefined) && (block.open <= at) && (at <= block.close)) {
                return true;
            }
        }
        return false;
    };
    const books = new Set<string> ();
    for (let k = start + 3; k < end; k++) {
        const m = /^(\s*)var (\w+) any = ((?:ccxt\.)?)GetValue\(this\.Orderbooks, (\w+)\)$/.exec (lines[k]);
        if ((m === null) || (masked[k] !== lines[k])) {
            continue;
        }
        const [ , ind, name, pkg, key ] = m;
        if (!orderBookKeyPresent (lines, start, k, ind, key, (at: number) => keyNonNil (key, at)) || (declLineOf (name) !== k) || written (name, k)
            || written (key, declLineOf (key))) {
            continue;
        }
        lines[k] = ind + 'var ' + name + ' ' + pkg + 'OrderBookInterface = ' + pkg + 'OrderBookTyped(' + pkg + 'GetValue(this.Orderbooks, ' + key + '))';
        books.add (name);
    }
    const isBook = (name: string, at: number): boolean => {
        const k = declLineOf (name);
        if ((k < 0) || (k >= at) || written (name, k)) {
            return false;
        }
        if (books.has (name)) {
            return true;
        }
        const m = /^\s*var \w+ (?:ccxt\.)?OrderBookInterface = (.*)$/.exec (lines[k]);
        return (m !== null) && (GO_OB_CTOR.test (m[1]) || /\.\((?:ccxt\.)?OrderBookInterface\)$/.test (m[1]));
    };
    for (let k = start + 1; k < end; k++) {
        if (masked[k].indexOf ('GetValue(') < 0) {
            continue;
        }
        const m = masked[k];
        lines[k] = lines[k].replace (/(?<![\w.])(?:ccxt\.)?GetValue\((\w+), "(asks|bids)"\)/g, (all: string, name: string, side: string, at: number) => {
            const head = all.substring (0, all.indexOf ('(') + 1 + name.length);
            if ((m.substr (at, head.length) !== head) || !isBook (name, k)) {
                return all;
            }
            return name + '.Get' + side[0].toUpperCase () + side.slice (1) + '()';
        });
        const side = /^(\s*)var (\w+) any = (\w+\.Get(?:Asks|Bids)\(\))$/.exec (lines[k]);
        if ((side !== null) && (declLineOf (side[2]) === k) && !written (side[2], k)) {
            const pkg = /(?:^|\n)import ccxt "/.test (lines.slice (0, start).join ('\n')) ? 'ccxt.' : '';
            lines[k] = side[1] + 'var ' + side[2] + ' ' + pkg + 'IOrderBookSide = ' + side[3];
        }
    }
}

function retagLoopBoundedElementReads (content: string): string {
    if (content.indexOf ('GetValue(') < 0) {
        return content; // no candidate line anywhere in this file
    }
    const lines = content.split ('\n');
    const maskedLines = goTextMaskLiteralsAndComments (content).split ('\n');
    if (lines.length !== maskedLines.length) {
        return content;
    }
    const { 'blocks': blocks, 'depth': depth } = goTextBlocks (maskedLines);
    let changed = false;
    for (let index = 0; index < lines.length; index++) {
        const candidate = /^([ \t]*)var ([A-Za-z_]\w*) any = (?:ccxt\.)?GetValue\(([A-Za-z_]\w*), ([A-Za-z_]\w*)\)[ \t]*$/.exec (lines[index]);
        if ((candidate === null) || (lines[index] !== maskedLines[index])) {
            continue; // not the exact declaration line, or (partly) inside a literal/comment
        }
        const indent = candidate[1];
        const name = candidate[2];
        const slice = candidate[3];
        const counter = candidate[4];
        if ((name === slice) || (name === counter) || (slice === counter)) {
            continue;
        }
        const body = goTextEnclosingBlock (blocks, index);
        if (body === undefined) {
            continue;
        }
        const header = /^[ \t]*for ([A-Za-z_]\w*) := (\d+); ([A-Za-z_]\w*) < (.+); ([A-Za-z_]\w*)\+\+ \{$/.exec (maskedLines[body.open]);
        if ((header === null) || (header[1] !== counter) || (header[3] !== counter) || (header[5] !== counter)) {
            continue; // the declaration is not the first statement of a counting for-loop
        }
        const fn = blocks.find ((block: any) => (block.depth === 1) && (block.open < index) && (index <= block.close));
        if ((fn === undefined) || (maskedLines[fn.open].indexOf ('func ') !== 0)) {
            continue; // no enclosing function: a different code path prints this line
        }
        // the slice: a `[]string` local of this function, declared in a scope that still
        // holds at the loop header, and never written
        const declarationRx = new RegExp ('^[ \\t]*var ' + slice + ' \\[\\]string = ');
        let sliceLine = -1;
        for (let k = fn.open + 1; k < body.open; k++) {
            if (declarationRx.test (maskedLines[k])) {
                if ((sliceLine >= 0) || (depth[k] > depth[body.open])) {
                    sliceLine = -2; // ambiguous or declared inside the loop
                    break;
                }
                sliceLine = k;
            }
        }
        if (sliceLine < 0) {
            continue;
        }
        const sliceBlock = goTextEnclosingBlock (blocks, sliceLine);
        if ((sliceBlock !== undefined) && (sliceBlock.close < body.open)) {
            continue; // the declaration sits in a block that closed before the loop
        }
        let sliceWritten = false;
        for (let k = fn.open + 1; k < fn.close; k++) {
            if ((k !== sliceLine) && goTextWritesName (maskedLines[k], slice)) {
                sliceWritten = true;
                break;
            }
        }
        if (sliceWritten) {
            continue;
        }
        // the bound: len(slice), GetArrayLength(slice), or an int local `= len(slice)` that
        // is declared before the loop and never written
        const bound = header[4].trim ();
        if ((bound !== 'len(' + slice + ')') && (bound !== 'GetArrayLength(' + slice + ')')) {
            if (!/^[A-Za-z_]\w*$/.test (bound) || (bound === name) || (bound === counter) || (bound === slice)) {
                continue;
            }
            const boundRx = new RegExp ('^[ \\t]*(?:var ' + bound + ' int = |' + bound + ' := )len\\(' + slice + '\\)[ \\t]*$');
            let boundLine = -1;
            for (let k = fn.open + 1; k < body.open; k++) {
                if (boundRx.test (maskedLines[k])) {
                    if ((boundLine >= 0) || (depth[k] > depth[body.open])) {
                        boundLine = -2; // ambiguous or declared inside the loop
                        break;
                    }
                    boundLine = k;
                }
            }
            if (boundLine < 0) {
                continue;
            }
            const boundBlock = goTextEnclosingBlock (blocks, boundLine);
            if ((boundBlock !== undefined) && (boundBlock.close < body.open)) {
                continue;
            }
            let boundWritten = false;
            for (let k = fn.open + 1; k < fn.close; k++) {
                if ((k !== boundLine) && goTextWritesName (maskedLines[k], bound)) {
                    boundWritten = true;
                    break;
                }
            }
            if (boundWritten) {
                continue;
            }
        }
        // the body: no write to the counter or the slice, and every read of the local a
        // value position
        let unsafe = false;
        for (let k = body.open + 1; k < body.close; k++) {
            const maskedLine = maskedLines[k];
            if (goTextWritesName (maskedLine, counter) || goTextWritesName (maskedLine, slice)) {
                unsafe = true;
                break;
            }
            if ((k !== index) && new RegExp ('\\b' + name + '\\b').test (maskedLine) && goTextReadIsHazard (maskedLine, name)) {
                unsafe = true;
                break;
            }
        }
        if (unsafe) {
            continue;
        }
        lines[index] = indent + 'var ' + name + ' string = ' + slice + '[' + counter + ']';
        changed = true;
    }
    return changed ? lines.join ('\n') : content;
}

// Semantic post-passes over the printer text: a leaked body goroutine, a missing type
// assertion and an unbounded element read are fixed here; layout is the printer's job and
// is gofmt-clean except where an emitter splices operand text into a call it prints.
function formatGoSource (filePath: string, content: string): string {
    if (!filePath.endsWith ('.go')) {
        return content;
    }
    content = guardMultiSendCores (content);
    content = assertTypedElementAccess (content);
    content = retagLoopBoundedElementReads (content);
    content = nativeTypedContainerAccess (content);
    content = nativeOrderBookSideReads (content);
    return goGofmtSplicedText (content);
}

// ------------------------------------------------------------------------------------
// gofmt spacing of the arithmetic an emitter splices into a call or an index
// ------------------------------------------------------------------------------------
// go/printer (src/go/printer/nodes.go) prints a level-4/5 operator (`+ - * / % << >>
// & &^ | ^`) with a blank on each side only when cutoff() asks for it: 6 for the
// operator tree on top of a statement, 5 when that tree mixes level 4 and level 5, and
// 4 - both blanks dropped - one level down. The level is 1 at the start of every
// statement, one deeper for the argument list of a call with more than one argument and
// for an index or slice expression, one shallower inside parentheses (never below 1),
// and 1 again inside a composite literal.
//
// The printer prints the operand text of the helper call it emits - the key of
// `AddElementToObject(container, key, value)`, the index of `GetValue(list, index)`, a
// string slice's bounds, the terms of `Add`/`Subtract` - at the level of the TS
// expression it was read from, not at the level of the Go text it lands in: the TS
// `trades[length - 1] = lastTrade` comes out as `AddElementToObject(trades, length - 1,
// lastTrade)`, while gofmt prints that call as `AddElementToObject(trades, length-1,
// lastTrade)`, because the argument list of a three-argument call is level 2. Text the
// printer has already produced cannot be re-printed, so normalise it once, here:
//   * every level-4/5 operator at level >= 2 loses both blanks, except where dropping
//     them would glue two tokens into a different one (`/*`, `//`, `++`, `--`, `&&`,
//     `&^`): walkBinary() raises the cutoff for exactly those pairs, so their blanks stay;
//   * a string slice's `:` takes the blanks go/printer's SliceExpr block gives it;
//   * `if (cond) {` / `for (cond) {` / `switch (cond) {` lose the redundant parens
//     controlClause() strips off a control expression.
function goGofmtSplicedText (content: string): string {
    if (content.indexOf ('(') < 0) {
        return content;
    }
    return goGofmtLevelOneSums (goGofmtTightenSplicedArithmetic (goGofmtLevelOneChains (goGofmtSliceColons (content))));
}

// the RHS of a one-to-one assignment is level 1, and so is the sole argument of a one-argument
// call there: a chain of level-4 operators only (cutoff 6) keeps both blanks, e.g. gofmt's
// `x += "::" + Join(s, ",")` and `x = SafeStringPtr(*a + "-" + b)`
function goGofmtLevelOneSums (content: string): string {
    const lines = content.split ('\n');
    for (let l = 0; l < lines.length; l++) {
        const statement = /^(\t*[A-Za-z_][A-Za-z0-9_.]* (?:[-+|^]?=|:=) )(.+)$/.exec (lines[l]);
        if (statement === null) {
            continue;
        }
        let rhs = statement[2];
        let head = statement[1];
        let tail = '';
        for (let call = /^[A-Za-z_][A-Za-z0-9_.]*\(/.exec (rhs); call !== null; call = /^[A-Za-z_][A-Za-z0-9_.]*\(/.exec (rhs)) {
            const open = call[0].length - 1;
            if ((goMatchingCloseText (rhs, open) !== rhs.length - 1) || (goCountFrameArgsText (rhs, open) !== 1)) {
                break;
            }
            head += rhs.slice (0, open + 1);
            tail = ')' + tail;
            rhs = rhs.slice (open + 1, rhs.length - 1);
        }
        const widened = goWidenLevelFourChainText (rhs);
        if (widened !== null) {
            lines[l] = head + widened + tail;
        }
    }
    return lines.join ('\n');
}

// index of the bracket closing the one at `open` (strings skipped), -1 when unbalanced
function goMatchingCloseText (text: string, open: number): number {
    let depth = 0;
    for (let i = open; i < text.length; i++) {
        const char = text[i];
        if (char === '"' || char === '\'' || char === '`') {
            i = goSkipLiteralText (text, i);
        } else if (char === '(' || char === '[' || char === '{') {
            depth += 1;
        } else if (char === ')' || char === ']' || char === '}') {
            depth -= 1;
            if (depth === 0) {
                return i;
            }
        }
    }
    return -1;
}

// `text` with a blank on each side of every top-level binary operator, when all of them are
// level 4 (`+ - | ^`); null when there is none, another operator, or nothing to change
function goWidenLevelFourChainText (text: string): string | null {
    const operators: number[] = [];
    let depth = 0;
    let operand = false;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === '"' || char === '\'' || char === '`') {
            i = goSkipLiteralText (text, i);
            operand = true;
        } else if (/[0-9.]/.test (char) && !operand) {
            i += /^[0-9.]*(?:[eEpP][-+]?)?[0-9A-Za-z_.]*/.exec (text.slice (i))[0].length - 1;   // `1e-9` is one literal
            operand = true;
        } else if (char === '/' && (text[i + 1] === '/' || text[i + 1] === '*')) {
            return null;
        } else if (char === '(' || char === '[' || char === '{') {
            depth += 1;
        } else if (char === ')' || char === ']' || char === '}') {
            depth -= 1;
            operand = true;
        } else if ((depth === 0) && (char !== ' ') && (char !== '\t')) {
            const value = goGoOperatorText (text, i);
            if ((value !== null) || (char === '=') || (char === '!') || (char === ':') || (char === ',')) {
                if (operand) {
                    if ((value === null) || (value.precedence !== 4)) {
                        return null;
                    }
                    operators.push (i);
                }
                operand = false;
                i += (value === null) ? 0 : value.token.length - 1;
            } else {
                operand = true;
            }
        }
    }
    if (operators.length === 0) {
        return null;
    }
    let out = text;
    for (let o = operators.length - 1; o >= 0; o--) {
        const at = operators[o];
        const right = (out[at + 1] === ' ') ? '' : ' ';
        const left = (out[at - 1] === ' ') ? '' : ' ';
        out = out.slice (0, at) + left + out[at] + right + out.slice (at + 1);
    }
    return (out === text) ? null : out;
}

// the characters a Go operand can end with, i.e. the left neighbour of a binary operator
const GO_OPERAND_ENDER = /[A-Za-z0-9_)\]}"'`]/;

// go/printer's walkBinary() raises the cutoff - and so keeps both blanks - for exactly the
// operand pairs that would otherwise glue into another token: `/*`, `//`, `&&`, `&^`,
// `++`, `--`. Every other pair (`+ *p`, `x & y`, ...) is compacted normally.
function goOperatorGluesTokens (operator: string, right: string): boolean {
    const pair = operator + right;
    return (pair === '/*') || (pair === '//') || (pair === '&&') || (pair === '&^') ||
        (pair === '++') || (pair === '--');
}

// index of the last byte of the Go literal that starts at `index`
function goSkipLiteralText (content: string, index: number): number {
    const quote = content[index];
    for (let i = index + 1; i < content.length; i++) {
        const char = content[i];
        if (char === '\\' && quote !== '`') {
            i += 1;
        } else if (char === quote) {
            return i;
        } else if (char === '\n' && quote !== '`') {
            return i - 1;                 // unterminated: stop at the line end
        }
    }
    return content.length - 1;
}

// index of the last byte of the comment that starts at `index`
function goSkipCommentText (content: string, index: number): number {
    if (content[index + 1] === '/') {
        const end = content.indexOf ('\n', index);
        return end < 0 ? content.length - 1 : end;
    }
    const end = content.indexOf ('*/', index + 2);
    return end < 0 ? content.length - 1 : end + 1;
}

// number of comma separated entries between the bracket at `opener` and its matching
// closer (strings and comments ignored); 0 when unbalanced
function goCountFrameArgsText (content: string, opener: number): number {
    let depth = 0;
    let entries = 0;
    let seen = false;
    for (let i = opener + 1; i < content.length; i++) {
        const char = content[i];
        if (char === '"' || char === '\'' || char === '`') {
            i = goSkipLiteralText (content, i);
            seen = true;
        } else if (char === '/' && (content[i + 1] === '/' || content[i + 1] === '*')) {
            i = goSkipCommentText (content, i);
        } else if (char === '(' || char === '[' || char === '{') {
            depth += 1;
        } else if (char === ')' || char === ']' || char === '}') {
            if (depth === 0) {
                return seen || entries > 0 ? entries + 1 : 0;
            }
            depth -= 1;
            seen = true;
        } else if (char === ',' && depth === 0) {
            entries += 1;
        } else if (char !== ' ' && char !== '\t' && char !== '\n' && char !== '\r') {
            seen = true;
        }
    }
    return 0;
}

// a `(` opens a call's (or a conversion's, or a func literal's) argument list when an
// operand or a selector ends right in front of it; every other `(` only groups, and
// go/printer prints a grouped expression one level shallower
function goIsCallParenText (content: string, open: number): boolean {
    let i = open - 1;
    while ((i >= 0) && ((content[i] === ' ') || (content[i] === '\t'))) {
        i -= 1;
    }
    return (i >= 0) && GO_OPERAND_ENDER.test (content[i]);
}

// a `(` that opens the parameter list of a function declaration, a method or a func type
// rather than a call: the names and types in there are declarations, so a `*` in there is a
// pointer, never a multiplication - nothing inside a signature is a level-4/5 expression
function goIsSignatureParenText (content: string, open: number): boolean {
    const head = content.slice (content.lastIndexOf ('\n', open - 1) + 1, open);
    const keyword = head.lastIndexOf ('func');
    return (keyword >= 0) && (head.indexOf ('{', keyword) < 0);
}

// the level-4/5 operator token at `index`, or null when the text there is none: level 6
// is unary, `++`/`--` and the `//`/`/*` openers are not operators, `*=` & co assign, and
// level 3 and below (`<`, `<-`, comparisons) always keep their blanks
function goLevel45OperatorText (content: string, index: number): string | null {
    const char = content[index];
    const next = content[index + 1];
    if ((char === '+') || (char === '-') || (char === '*') || (char === '/') ||
            (char === '%') || (char === '|') || (char === '^')) {
        return ((next === '=') || (next === '>') || (next === char) || (next === '-')) ? null : char;
    }
    if (char === '&') {
        if ((next === '&') || (next === '=')) {
            return null;
        }
        return (next === '^') ? '&^' : '&';
    }
    if ((char === '<') || (char === '>')) {
        if (next !== char) {
            return null;                  // a comparison, or the `<-` receive operator
        }
        return (content[index + 2] === '=') ? null : char + char;
    }
    return null;
}

// the `)` of a `if (cond) {` style control clause, i.e. of exactly the parens that wrap a
// whole control expression on one line: -1 when this `(` is anything else (a composite
// literal in the condition, a condition spanning lines, or no control keyword in front)
function goControlClauseClose (content: string, open: number): number {
    const head = content.slice (content.lastIndexOf ('\n', open - 1) + 1, open);
    if (!/^[ \t]*(?:\} else )?(?:if|for|switch)[ \t]+$/.test (head)) {
        return -1;
    }
    let depth = 0;
    for (let i = open; i < content.length; i++) {
        const char = content[i];
        if (char === '"' || char === '\'' || char === '`') {
            i = goSkipLiteralText (content, i);
        } else if (char === '(') {
            depth += 1;
        } else if (char === ')') {
            depth -= 1;
            if (depth === 0) {
                const lineEnd = content.indexOf ('\n', i);
                const tail = content.slice (i + 1, lineEnd < 0 ? content.length : lineEnd);
                return /^[ \t]*\{[ \t]*$/.test (tail) ? i : -1;
            }
        } else if ((char === '{') || (char === '}') || (char === '\n')) {
            return -1;                    // not the whole condition: gofmt keeps the parens
        }
    }
    return -1;
}

// go/printer's SliceExpr case prints a slice's bounds one level deeper than the slice, so
// their level-4/5 operators lose the blanks, and pads the `:` on both sides when the
// slice itself sits at level <= 1, has both bounds and at least one bound is a binary
// expression: `s[0:len(s) - 3]` is emitted by the printer, gofmt prints `s[0 : len(s)-3]`
function goGofmtSliceColons (content: string): string {
    const fixes: { 'start': number, 'end': number, 'text': string }[] = [];
    const stack: { 'open': number, 'level': number }[] = [];
    let level = 1;
    let i = 0;
    while (i < content.length) {
        const char = content[i];
        if (char === '"' || char === '\'' || char === '`') {
            i = goSkipLiteralText (content, i) + 1;
            continue;
        }
        if (char === '/' && (content[i + 1] === '/' || content[i + 1] === '*')) {
            i = goSkipCommentText (content, i) + 1;
            continue;
        }
        if (char === '(' || char === '[' || char === '{') {
            stack.push ({ 'open': i + 1, 'level': level });
            if (char === '{') {
                level = 1;
            } else if (char === '[') {
                level += 1;
            } else if (goIsCallParenText (content, i)) {
                if (goCountFrameArgsText (content, i) > 1) {
                    level += 1;
                }
            } else if (level > 1) {
                level -= 1;
            }
            i += 1;
            continue;
        }
        if (char === ')' || char === ']' || char === '}') {
            const frame = stack.pop ();
            if (frame !== undefined) {
                if (char === ']') {
                    const fix = goSliceColonFix (content, frame.open, i, frame.level);
                    if (fix !== null) {
                        fixes.push (fix);
                    }
                }
                level = frame.level;
            }
            i += 1;
            continue;
        }
        i += 1;
    }
    fixes.sort ((a, b) => b.start - a.start);     // back to front: every edit keeps its offsets
    for (let f = 0; f < fixes.length; f++) {
        content = content.slice (0, fixes[f].start) + fixes[f].text + content.slice (fixes[f].end);
    }
    return content;
}

// the `colon : high` text of the slice whose bounds are `content[open : close]`, or null
// when the brackets hold anything but one `low:high` pair
function goSliceColonFix (content: string, open: number, close: number, level: number) {
    const bounds = content.slice (open, close);
    let depth = 0;
    let colon = -1;
    for (let i = 0; i < bounds.length; i++) {
        const char = bounds[i];
        if (char === '"' || char === '\'' || char === '`') {
            i = goSkipLiteralText (bounds, i);
        } else if (char === '(' || char === '[' || char === '{') {
            depth += 1;
        } else if (char === ')' || char === ']' || char === '}') {
            depth -= 1;
        } else if (char === ':' && depth === 0) {
            if (colon >= 0) {
                return null;              // `low:high:max` and anything else: leave it alone
            }
            colon = i;
        }
    }
    if (colon < 0) {
        return null;
    }
    const low = bounds.slice (0, colon).replace (/[ \t]+$/, '');
    const high = bounds.slice (colon + 1).replace (/^[ \t]+/, '');
    const needsBlanks = (level <= 1) && (low.trim () !== '') && (high.trim () !== '') &&
        (goBoundIsBinary (low) || goBoundIsBinary (high));
    const blank = needsBlanks ? ' ' : '';
    return { 'start': open, 'end': close, 'text': low + blank + ':' + blank + high };
}

// true when the slice bound `text` is a binary expression for go/printer's isBinary(),
// i.e. when it has a binary operator of its own - one nested in a call or a bracket does
// not count, and neither does a unary sign
function goBoundIsBinary (text: string): boolean {
    let depth = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === '"' || char === '\'' || char === '`') {
            i = goSkipLiteralText (text, i);
        } else if (char === '(' || char === '[' || char === '{') {
            depth += 1;
        } else if (char === ')' || char === ']' || char === '}') {
            depth -= 1;
        } else if ((depth === 0) && ('+-*/%&|^<>=!'.indexOf (char) >= 0)) {
            let before = i - 1;
            while ((before >= 0) && ((text[before] === ' ') || (text[before] === '\t'))) {
                before -= 1;
            }
            if ((before >= 0) && GO_OPERAND_ENDER.test (text[before])) {
                return true;
            }
        }
    }
    return false;
}

// the same level rule for the operators the printer printed, with the control-clause
// parens dropped on the way through
function goGofmtTightenSplicedArithmetic (content: string): string {
    const out: string[] = [];
    const stack: { 'kind': string, 'level': number }[] = [];
    const strippedClosers = new Set<number> ();
    let level = 1;
    let lastChar = '';
    let i = 0;
    while (i < content.length) {
        const char = content[i];
        if (char === '"' || char === '\'' || char === '`') {
            const literal = content.slice (i, goSkipLiteralText (content, i) + 1);
            out.push (literal);
            lastChar = literal[literal.length - 1];
            i += literal.length;
            continue;
        }
        if (char === '/' && (content[i + 1] === '/' || content[i + 1] === '*')) {
            const comment = content.slice (i, goSkipCommentText (content, i) + 1);
            out.push (comment);                                 // a line comment keeps its newline
            i += comment.length;
            continue;
        }
        if (strippedClosers.has (i)) {
            i += 1;
            continue;
        }
        if ((char === '(') && (level > 0)) {
            const close = goControlClauseClose (content, i);
            if (close > 0) {
                strippedClosers.add (close);                    // stripParens(cond)
                i += 1;
                continue;
            }
        }
        if (char === '(' || char === '[' || char === '{') {
            stack.push ({ 'kind': char, 'level': level });
            if (char === '{') {
                level = 1;
            } else if (char === '[') {
                level += 1;
            } else if (goIsSignatureParenText (content, i)) {
                level = 0;                                      // declarations: no operators in there
            } else if (goIsCallParenText (content, i)) {
                if (goCountFrameArgsText (content, i) > 1) {
                    level += 1;
                }
            } else if (level > 1) {
                level -= 1;
            }
            out.push (char);
            lastChar = char;
            i += 1;
            continue;
        }
        if (char === ')' || char === ']' || char === '}') {
            const frame = stack.pop ();
            if (frame !== undefined) {
                level = frame.level;
            }
            out.push (char);
            lastChar = char;
            i += 1;
            continue;
        }
        const operator = goLevel45OperatorText (content, i);
        if ((operator !== null) && (level > 1) && GO_OPERAND_ENDER.test (lastChar)) {
            const tightened = goTightenedOperatorText (content, i, operator);
            if (tightened !== null) {
                if ((out.length > 0) && ((out[out.length - 1] === ' ') || (out[out.length - 1] === '\t'))) {
                    out.pop ();
                }
                out.push (operator);
                i = tightened.end;
                lastChar = '';
                continue;
            }
        }
        out.push (char);
        if ((char !== ' ') && (char !== '\t')) {
            lastChar = char;
        }
        i += 1;
    }
    return out.join ('');
}

// the blanks an operator printed at level >= 2 may not keep: the span to replace with the
// bare operator, or null when a blank has to stay there (a line break on either side, or a
// right operand that would glue with the operator into another token)
function goTightenedOperatorText (content: string, index: number, operator: string) {
    let start = index;
    while ((start > 0) && ((content[start - 1] === ' ') || (content[start - 1] === '\t'))) {
        start -= 1;
    }
    if ((start === 0) || (content[start - 1] === '\n')) {
        return null;                      // the operator starts a line: go/printer's linebreak
    }
    let end = index + operator.length;
    while ((end < content.length) && ((content[end] === ' ') || (content[end] === '\t'))) {
        end += 1;
    }
    const right = content[end] ?? '';
    if ((right === '') || (right === '\n') || goOperatorGluesTokens (operator, right)) {
        return null;
    }
    return { 'start': start, 'end': end };
}

// drop the blanks around every level-4/5 operator of `text` (level >= 2 throughout: the
// cutoff is 4, so no level-4/5 operator keeps a blank), strings and comments untouched
function goSqueezeLevel45Text (text: string): string {
    const out: string[] = [];
    let lastChar = '';
    let i = 0;
    while (i < text.length) {
        const char = text[i];
        if (char === '"' || char === '\'' || char === '`') {
            const literal = text.slice (i, goSkipLiteralText (text, i) + 1);
            out.push (literal);
            lastChar = literal[literal.length - 1];
            i += literal.length;
            continue;
        }
        if (char === '/' && (text[i + 1] === '/' || text[i + 1] === '*')) {
            const comment = text.slice (i, goSkipCommentText (text, i) + 1);
            out.push (comment);
            i += comment.length;
            continue;
        }
        const operator = goLevel45OperatorText (text, i);
        if ((operator !== null) && GO_OPERAND_ENDER.test (lastChar)) {
            const tightened = goTightenedOperatorText (text, i, operator);
            if (tightened !== null) {
                if ((out.length > 0) && ((out[out.length - 1] === ' ') || (out[out.length - 1] === '\t'))) {
                    out.pop ();
                }
                out.push (operator);
                i = tightened.end;
                lastChar = '';
                continue;
            }
        }
        out.push (char);
        if ((char !== ' ') && (char !== '\t')) {
            lastChar = char;
        }
        i += 1;
    }
    return out.join ('');
}

// go/printer threads the level it prints an expression at through the operator tree: the
// operands of a comparison or a logical operator print (at least) one level deeper, and in a
// chain that mixes level 4 and level 5 every level-5 operator sits one level deeper than the
// level-4 operator it hangs under (diffPrec()) - its grouped operand lands at level 2 with
// it (reduceDepth()). The frame walk above only counts brackets, so the level-1 chains are
// the one place left where the printer's own level bookkeeping shows: the composite literal
// element `(90 * 86400) * 1000 - 1` is gofmt's `(90*86400)*1000 - 1`, while the same chain
// without its level-4 operator keeps every blank (`(90 * 86400) * 1000`).
function goGofmtLevelOneChains (content: string): string {
    const fixes: { 'start': number, 'end': number, 'text': string }[] = [];
    const stack: { 'level': number }[] = [];
    let level = 1;
    let lineStart = 0;
    let i = 0;
    while (i <= content.length) {
        const char = content[i];
        if ((i === content.length) || (char === '\n')) {
            if (level === 1) {
                goCollectLevelOneChainFixes (content, lineStart, i, fixes);
            }
            lineStart = i + 1;
            i += 1;
            continue;
        }
        if (char === '"' || char === '\'' || char === '`') {
            i = goSkipLiteralText (content, i) + 1;
            continue;
        }
        if (char === '/' && (content[i + 1] === '/' || content[i + 1] === '*')) {
            i = goSkipCommentText (content, i);              // a line comment stops at its newline
            continue;
        }
        if (char === '(' || char === '[' || char === '{') {
            stack.push ({ 'level': level });
            if (char === '{') {
                level = 1;
            } else if (char === '[') {
                level += 1;
            } else if (goIsSignatureParenText (content, i)) {
                level = 0;
            } else if (goIsCallParenText (content, i)) {
                if (goCountFrameArgsText (content, i) > 1) {
                    level += 1;
                }
            } else if (level > 1) {
                level -= 1;
            }
            i += 1;
            continue;
        }
        if (char === ')' || char === ']' || char === '}') {
            const frame = stack.pop ();
            if (frame !== undefined) {
                level = frame.level;
            }
            i += 1;
            continue;
        }
        i += 1;
    }
    fixes.sort ((a, b) => b.start - a.start);     // back to front: every edit keeps its offsets
    for (let f = 0; f < fixes.length; f++) {
        content = content.slice (0, fixes[f].start) + fixes[f].text + content.slice (fixes[f].end);
    }
    return content;
}

// every Go operator token with go/token's precedence (0 for the ones that only delimit an
// expression: `=` & co assign, `<-` receives), or null when the text is not an operator
function goGoOperatorText (content: string, index: number) {
    const char = content[index];
    const next = content[index + 1];
    if (char === '<') {
        if (next === '<') { return (content[index + 2] === '=') ? null : { 'token': '<<', 'precedence': 5 }; }
        if (next === '-') { return { 'token': '<-', 'precedence': 0 }; }
        if (next === '=') { return { 'token': '<=', 'precedence': 3 }; }
        return { 'token': '<', 'precedence': 3 };
    }
    if (char === '>') {
        if (next === '>') { return (content[index + 2] === '=') ? null : { 'token': '>>', 'precedence': 5 }; }
        if (next === '=') { return { 'token': '>=', 'precedence': 3 }; }
        return { 'token': '>', 'precedence': 3 };
    }
    if (char === '&') {
        if (next === '&') { return { 'token': '&&', 'precedence': 2 }; }
        if (next === '^') { return (content[index + 2] === '=') ? null : { 'token': '&^', 'precedence': 5 }; }
        if (next === '=') { return null; }
        return { 'token': '&', 'precedence': 5 };
    }
    if (char === '|') {
        if (next === '|') { return { 'token': '||', 'precedence': 1 }; }
        if (next === '=') { return null; }
        return { 'token': '|', 'precedence': 4 };
    }
    if ((char === '+') || (char === '-')) {
        if ((next === char) || (next === '=') || (next === '>')) { return null; }   // `++`/`--`, `+=`, `->`
        return { 'token': char, 'precedence': 4 };
    }
    if ((char === '*') || (char === '/') || (char === '%') || (char === '^')) {
        if (next === '=') { return null; }
        return { 'token': char, 'precedence': (char === '^') ? 4 : 5 };
    }
    if (char === '=') {
        if (next === '=') { return { 'token': '==', 'precedence': 3 }; }
        return null;                      // a plain assignment is a separator
    }
    if (char === '!') {
        if (next === '=') { return { 'token': '!=', 'precedence': 3 }; }
        return null;                      // unary not
    }
    return null;
}

// the keywords that can stand in front of an expression: an operator right after one of
// them is unary, not binary
const GO_EXPRESSION_KEYWORDS = new Set ([ 'break', 'case', 'chan', 'const', 'continue', 'default',
    'defer', 'else', 'fallthrough', 'for', 'func', 'go', 'goto', 'if', 'import', 'interface',
    'map', 'package', 'range', 'return', 'select', 'struct', 'switch', 'type', 'var' ]);

// the level-1 chain of the line [start, end): a mix of level 4 and level 5 makes the level-5
// operators print at level 2 - and with them the grouped operand they own
function goCollectLevelOneChainFixes (content: string, start: number, end: number, fixes: { 'start': number, 'end': number, 'text': string }[]) {
    const tokens: { 'operator': string | null, 'start': number, 'end': number, 'keyword': boolean }[] = [];
    let has4 = false;
    let has5 = false;
    let i = start;
    while (i < end) {
        const char = content[i];
        if (char === '"' || char === '\'' || char === '`') {
            const literalEnd = goSkipLiteralText (content, i);
            tokens.push ({ 'operator': null, 'start': i, 'end': literalEnd + 1, 'keyword': false });
            i = literalEnd + 1;
            continue;
        }
        if (char === '/' && (content[i + 1] === '/' || content[i + 1] === '*')) {
            i = goSkipCommentText (content, i) + 1;
            continue;
        }
        const value = goGoOperatorText (content, i);
        if (value !== null) {
            const previous = tokens[tokens.length - 1];
            const binary = (previous !== undefined) && (previous.operator === null) && !previous.keyword;
            const precedence = (binary ? value.precedence : 0);
            if (precedence === 4) {
                has4 = true;
            } else if (precedence === 5) {
                has5 = true;
            }
            tokens.push ({ 'operator': (value.precedence >= 4) ? value.token : null, 'start': i, 'end': i + value.token.length, 'keyword': binary && (value.precedence < 4) });
            i += value.token.length;
            continue;
        }
        // an operand: everything up to the next operator, blank or separator of this level
        const operandStart = i;
        let depth = 0;
        while (i < end) {
            const operandChar = content[i];
            if (operandChar === '"' || operandChar === '\'' || operandChar === '`') {
                i = goSkipLiteralText (content, i) + 1;
                continue;
            }
            if (operandChar === '/' && (content[i + 1] === '/' || content[i + 1] === '*')) {
                i = goSkipCommentText (content, i) + 1;
                continue;
            }
            if (operandChar === '(' || operandChar === '[' || operandChar === '{') {
                depth += 1;
            } else if (operandChar === ')' || operandChar === ']' || operandChar === '}') {
                if (depth === 0) {
                    break;
                }
                depth -= 1;
            } else if (depth === 0) {
                if (' \t:,='.indexOf (operandChar) >= 0) {
                    break;
                }
                if (goGoOperatorText (content, i) !== null) {
                    break;
                }
            }
            i += 1;
        }
        if (i > operandStart) {
            const operand = content.slice (operandStart, i);
            tokens.push ({ 'operator': null, 'start': operandStart, 'end': i, 'keyword': GO_EXPRESSION_KEYWORDS.has (operand) });
        } else {
            if (':,;='.indexOf (content[i]) >= 0) {
                // a separator ends the operand before it: what follows starts a new expression
                tokens.push ({ 'operator': null, 'start': i, 'end': i + 1, 'keyword': true });
            }
            i += 1;                       // a blank or a bracket: nothing to tokenize here
        }
    }
    if (!(has4 && has5)) {
        return;
    }
    for (let t = 0; t < tokens.length; t++) {
        const token = tokens[t];
        if (goOperatorPrecedenceText (token.operator as string) !== 5) {
            continue;
        }
        const previous = tokens[t - 1];
        if ((previous === undefined) || (previous.operator !== null) || previous.keyword) {
            continue;                     // a unary `*` owns no blanks and never mixes a chain
        }
        const tightened = goTightenedOperatorText (content, token.start, token.operator as string);
        if (tightened !== null) {
            fixes.push ({ 'start': tightened.start, 'end': tightened.end, 'text': token.operator as string });
        }
        // the operand of this level-5 operator prints one level deeper too: a grouped one
        // lands at level 2 with it, so every operator inside it loses its blanks
        const neighbours = [ t - 1, t + 1 ];
        for (let n = 0; n < neighbours.length; n++) {
            const neighbour = tokens[neighbours[n]];
            if ((neighbour !== undefined) && (neighbour.operator === null)) {
                const text = content.slice (neighbour.start, neighbour.end);
                if ((text[0] === '(') && (text[text.length - 1] === ')')) {
                    const squeezed = goSqueezeLevel45Text (text.slice (1, text.length - 1));
                    if (squeezed !== text.slice (1, text.length - 1)) {
                        fixes.push ({ 'start': neighbour.start + 1, 'end': neighbour.end - 1, 'text': squeezed });
                    }
                }
            }
        }
    }
}

// go/token precedence of the operators the Go printer can print
function goOperatorPrecedenceText (operator: string): number {
    switch (operator) {
    case '*': case '/': case '%': case '<<': case '>>': case '&': case '&^':
        return 5;
    case '+': case '-': case '|': case '^':
        return 4;
    }
    return 0;
}

// gofmt's printer starts the file at the package clause, writes exactly one blank line
// between it (and every import declaration) and what follows, never keeps more than one
// blank line anywhere (maxNewlines = 2), trims whitespace-only lines and ends the file with a
// single newline. Every emitter below assembles its own text — some leave two blank lines
// after the package clause, some none, one leaves three after the generated-header comment —
// so normalise those file-level properties once, here. Non-blank lines are left byte-for-byte
// alone. Pure text normalisation: no gofmt spawn.
function normalizeGoFileHeader (content: string): string {
    const lines = content.split ('\n');
    const packageLine = lines.findIndex ((line: string) => /^package \S/.test (line));
    if (packageLine < 0) {
        return content;         // hand-written file (or a fragment): leave it alone
    }
    const out = [ lines[packageLine] ];
    let i = packageLine + 1;
    while ((i < lines.length) && (lines[i].trim () === '')) {
        i++;
    }
    out.push ('');              // exactly one blank line after the package clause
    // every import declaration of the header (a file can carry more than one) keeps exactly
    // one blank line behind it
    while (/^import\b/.test (lines[i] ?? '')) {
        out.push (lines[i]);
        if (lines[i].indexOf ('(') >= 0) {
            i++;
            while ((i < lines.length) && (lines[i].trim () !== ')')) {
                out.push (lines[i]);
                i++;
            }
            out.push (lines[i]);            // the closing paren of the block
        }
        i++;
        while ((i < lines.length) && (lines[i].trim () === '')) {
            i++;
        }
        out.push ('');
    }
    // the rest of the file: every blank run collapses to a single blank line
    while (i < lines.length) {
        if (lines[i].trim () === '') {
            while ((i < lines.length) && (lines[i].trim () === '')) {
                i++;
            }
            if (i < lines.length) {
                out.push ('');
            }
            continue;
        }
        out.push (lines[i]);
        i++;
    }
    return out.join ('\n') + '\n';
}

// `gofmt -l` prints one path per line for every file it would reformat, and exits non-zero
// when a file does not even parse as go. Both are failures for the gate.
function gofmtListFiles (binary: string, targets: string[]) {
    const res = spawnSync (binary, [ '-l', ...targets ], { 'encoding': 'utf8', 'maxBuffer': 256 * 1024 * 1024, 'windowsHide': true });
    return {
        'files': (res.stdout ?? '').split ('\n').map ((line) => line.trim ()).filter ((line) => line.length > 0),
        'status': res.status,
        'error': res.error,
        'stderr': (res.stderr ?? '').trim (),
    };
}

function runGofmtGate () {
    if (process.argv.includes ('--self-test')) {
        const problems = gofmtSelfTest ();
        if (problems.length) {
            console.error ('SELF-TEST FAILED:\n  - ' + problems.join ('\n  - '));
            process.exit (3);
        }
        console.log ('SELF-TEST PASSED');
        return;
    }
    const explicit = process.argv.slice (2).filter ((x) => !x.startsWith ('--'));
    const targets = explicit.length ? explicit : GOFMT_GATE_TREE.filter ((target) => fs.existsSync (target));
    if (!targets.length) {
        console.error ('--check-gofmt: nothing to check, no emitted go tree here (' + GOFMT_GATE_TREE.join (', ') + ')');
        process.exit (2);
    }
    const gofmt = resolveGofmt ();
    if (gofmt === null) {
        console.error ('--check-gofmt: gofmt not found (looked at $' + GOFMT_BINARY_ENV + ', PATH, $GOROOT/bin, /usr/local/go/bin)');
        process.exit (2);
    }
    const listed = gofmtListFiles (gofmt, targets);
    if (listed.error) {
        console.error ('--check-gofmt: could not run ' + gofmt + ': ' + listed.error.message);
        process.exit (2);
    }
    if (listed.files.length || listed.status !== 0) {
        const headline = listed.files.length
            ? listed.files.length + ' file(s) are not gofmt-clean:'
            : 'gofmt exited ' + listed.status + ' without listing a file (parse error or bad path):';
        console.error ('--check-gofmt: ' + headline);
        for (const file of listed.files) {
            console.error ('  ' + file);
        }
        if (listed.stderr.length) {
            console.error (listed.stderr);
        }
        process.exit (1);
    }
    console.log ('--check-gofmt: clean (' + gofmt + ' -l ' + targets.join (' ') + ')');
}

// The fixtures are flush-left on purpose: the strings are raw printer output, and any
// indentation of the template literals would end up inside them.
const GOFMT_SELFTEST_MULTISEND = `func (this *Exchange) fetch2Async(symbol any, params ...any) <-chan any {
	ch := make(chan any, 1)
	go this.fetch2Body(ch, symbol, params...)
	return ch
}
func (this *Exchange) fetch2Body(ch chan any, symbol any, params ...any) any {
	defer close(ch)
	defer ReturnPanicError(ch)
	var errors any = 0
	for IsLessThanOrEqual(errors, 3) {

		{
			func(this *Exchange) (ret_ any) {
				// try block:
				response := (<-this.FetchAsync(symbol, nil, nil, params))
				retRes := (<-this.ParseTicker(response, nil))
				ch <- retRes
				return nil
			}(this)
		}

	}
	return nil
}
`;

// the same text with the guard applied: the flag declaration after the two defers, the
// sent flag after the send, and the early exit right after the closure that produced it
const GOFMT_SELFTEST_MULTISEND_GUARDED = `func (this *Exchange) fetch2Async(symbol any, params ...any) <-chan any {
	ch := make(chan any, 1)
	go this.fetch2Body(ch, symbol, params...)
	return ch
}
func (this *Exchange) fetch2Body(ch chan any, symbol any, params ...any) any {
	defer close(ch)
	defer ReturnPanicError(ch)
	chSent := false
	_ = chSent
	var errors any = 0
	for IsLessThanOrEqual(errors, 3) {

		{
			func(this *Exchange) (ret_ any) {
				// try block:
				response := (<-this.FetchAsync(symbol, nil, nil, params))
				retRes := (<-this.ParseTicker(response, nil))
				ch <- retRes
				chSent = true
				return nil
			}(this)
			if chSent {
				return nil
			}
		}

	}
	return nil
}
`;

// a core that only ever sends at its own level: the guard must not touch a byte of it
const GOFMT_SELFTEST_SINGLE_SEND = `func (this *Exchange) fetchBalanceBody(ch chan any, params any) any {
	defer close(ch)
	defer ReturnPanicError(ch)
	response := (<-this.FetchAsync("balance", nil, nil, params))
	ch <- response
	return nil
}
`;

// the element-access assertion is semantics, not formatting: kept by formatGoSource
const GOFMT_SELFTEST_ELEMENT_ACCESS = `func (this *Exchange) parseKeysBody(ch chan any, keys any) any {
	defer close(ch)
	defer ReturnPanicError(ch)
	var key string = GetValue(keys, 0)
	ch <- key
	return nil
}
`;

function gofmtSelfTest (): string[] {
    const problems: string[] = [];
    const ok = (condition: boolean, message: string) => { if (!condition) { problems.push (message); } };
    const passedThrough = formatGoSource ('selftest.go', GOFMT_SELFTEST_MULTISEND);
    ok (passedThrough === GOFMT_SELFTEST_MULTISEND_GUARDED,
        'formatGoSource must preserve the multi-send guard byte-for-byte\n--- actual ---\n' + passedThrough + '--- expected ---\n' + GOFMT_SELFTEST_MULTISEND_GUARDED);
    ok (passedThrough.indexOf ('chSent := false') !== -1 && passedThrough.indexOf ('if chSent {') !== -1,
        'the guarded core must carry the flag declaration and the early exit');
    const untouched = formatGoSource ('selftest.go', GOFMT_SELFTEST_SINGLE_SEND);
    ok (untouched === GOFMT_SELFTEST_SINGLE_SEND, 'a core that never multi-sends must pass through byte-identical');
    const asserted = formatGoSource ('selftest.go', GOFMT_SELFTEST_ELEMENT_ACCESS);
    ok (asserted.indexOf ('GetValue(keys, 0).(string)') !== -1, 'formatGoSource must keep the element-access assertion');
    const sums: [ string, string ][] = [
        [ '\tstreamHash += "::"+ccxt.Join(symbols, ",")', '\tstreamHash += "::" + ccxt.Join(symbols, ",")' ],
        [ '\tname = ccxt.SafeStringPtr("D"+*depth+"/"+*speed)', '\tname = ccxt.SafeStringPtr("D" + *depth + "/" + *speed)' ],
        [ '\tx = F(a+b, c)', '\tx = F(a+b, c)' ],
        [ '\tx = a*b + c', '\tx = a*b + c' ],
        [ '\tOrderRouterTolerance = 1e-9', '\tOrderRouterTolerance = 1e-9' ],
    ];
    for (const [ input, expected ] of sums) {
        const got = goGofmtSplicedText ('func f() {\n' + input + '\n}\n');
        ok (got === 'func f() {\n' + expected + '\n}\n', 'level-1 sum: ' + JSON.stringify (input) + ' -> ' + JSON.stringify (got));
    }
    // the gate's listing parser, against a real gofmt and a throwaway tree
    const gofmt = resolveGofmt ();
    if (gofmt === null) {
        console.log ('  note: gofmt not found — the gate listing check is skipped');
    } else {
        const dir = fs.mkdtempSync (path.join (os.tmpdir (), 'ccxt-check-gofmt-'));
        try {
            fs.writeFileSync (path.join (dir, 'clean.go'), 'package x\n\nfunc F() int {\n\treturn 1\n}\n');
            fs.writeFileSync (path.join (dir, 'dirty.go'), 'package x\n\nfunc F()  int {\n        return 1\n}\n');
            const listed = gofmtListFiles (gofmt, [ dir ]);
            ok (listed.status === 0 && listed.files.map ((file) => basename (file)).join (',') === 'dirty.go',
                'gofmt -l must list exactly the unformatted file, got [' + listed.files.join (',') + '] status=' + listed.status);
            const clean = gofmtListFiles (gofmt, [ path.join (dir, 'clean.go') ]);
            ok (clean.files.length === 0, 'a formatted file must not be listed');
        } finally {
            fs.rmSync (dir, { 'recursive': true, 'force': true });
        }
    }
    return problems;
}

// Typed pointer locals print both `x !== undefined` and `x !== null` as `x != nil`, and the printer
// also adds its own nil-guard before dereferencing (`x != nil && *x == ""`). Next to an explicit
// TS undefined-check that yields `(x != nil) && (x != nil ...`, which is harmless but rejected by
// `go vet` ("redundant and/or"), failing `go test`. Collapse the duplicated operand.
export function collapseRedundantNilChecks (content: string): string {
    const id = '([A-Za-z_][A-Za-z0-9_]*)';
    return content
        // (x != nil) && (x != nil && rest   ->  (x != nil) && (rest
        .replace (new RegExp ('\\(' + id + ' != nil\\) && \\(\\1 != nil && ', 'g'), '($1 != nil) && (')
        .replace (new RegExp ('\\(' + id + ' == nil\\) \\|\\| \\(\\1 == nil \\|\\| ', 'g'), '($1 == nil) || (')
        // (x != nil) && (x != nil)          ->  (x != nil)
        .replace (new RegExp ('\\(' + id + ' != nil\\) && \\(\\1 != nil\\)', 'g'), '($1 != nil)')
        .replace (new RegExp ('\\(' + id + ' == nil\\) \\|\\| \\(\\1 == nil\\)', 'g'), '($1 == nil)');
}

// Methods whose generated Go signature already returns map[string]any: MapTyped around their call is
// the identity and a `.(map[string]any)` assertion on it does not compile, so both are dropped.
const GO_MARKET_ROW_METHODS = [ 'Market', 'SafeMarket' ];
const GO_MAP_RETURNING_METHODS = [ 'Market', 'Currency', 'SafeCurrency', 'SafeMarket', 'Account', 'ParseOrderBook' ];

function dropNoOpMapTyped (content: string): string {
    const callee = new RegExp ('^this\\.(?:DerivedExchange\\.|Exchange\\.)?(?:' + GO_MAP_RETURNING_METHODS.join ('|') + ')\\(');
    // index of the paren closing the one opened at `open`, -1 when unbalanced
    const close = (text: string, open: number): number => {
        let depth = 0;
        for (let i = open; i < text.length; i++) {
            const c = text[i];
            if (c === '"' || c === '`' || c === "'") {
                i = goSkipLiteralText (text, i);
            } else if (c === '(') {
                depth += 1;
            } else if (c === ')') {
                depth -= 1;
                if (depth === 0) {
                    return i;
                }
            }
        }
        return -1;
    };
    let out = '';
    let cursor = 0;
    const wrapper = /\b(?:ccxt\.)?MapTyped\(|\bthis\.(?:DerivedExchange\.|Exchange\.)?(?:Currency|SafeCurrency|SafeMarket)\(/g;
    for (let m = wrapper.exec (content); m !== null; m = wrapper.exec (content)) {
        if (m.index < cursor) {
            continue;
        }
        const open = m.index + m[0].length - 1;
        const end = close (content, open);
        if (end < 0) {
            continue;
        }
        if (m[0].startsWith ('this.')) {
            if (content.startsWith ('.(map[string]any)', end + 1)) {
                out += content.substring (cursor, end + 1);
                cursor = end + 1 + '.(map[string]any)'.length;
            }
            continue;
        }
        const inner = content.substring (open + 1, end);
        const innerOpen = inner.indexOf ('(');
        if (!callee.test (inner) || (close (inner, innerOpen) !== inner.length - 1)) {
            continue;
        }
        out += content.substring (cursor, m.index) + dropNoOpMapTyped (inner);
        cursor = end + 1;
        wrapper.lastIndex = cursor;
    }
    return out + content.substring (cursor);
}

function overwriteFileAndFolder (path: string, content: string) {
    if (!(fs.existsSync(path))) {
        checkCreateFolder (path);
    }
    // gofmt aligns the trailing `//` comments of adjacent lines through its tabwriter; the
    // printer reproduces that itself (ast-transpiler `alignGoTrailingComments`), and this second
    // pass covers the text assembled here (hand-written emitters and sections concatenated after
    // the transpiled ones). It is a no-op on text that is already aligned. The nil-check collapse
    // runs last so its match sees the canonical spacing.
    content = collapseRedundantNilChecks (formatGoSource (path, normalizeGoFileHeader (alignGoTrailingComments (content))));
    // the collapse rewrites `if (x != nil) && (x != nil) {` into `if (x != nil) {`, and the
    // parens of that form are exactly the ones gofmt's stripParens() takes off a control
    // expression - so the spacing pass runs once more over its output
    // market-row reads run after dropNoOpMapTyped so `MapTyped(this.Market(..))` writes read as rows
    content = goGofmtSplicedText (nativeMarketRowReads (dropNoOpMapTyped (content)));
    // overwriteFile() already opens+truncates+writes the file; the extra
    // fs.writeFileSync below wrote every generated file a second time
    overwriteFile (path, content);
}

// The generated methods named in CCXT_GO_BOOL_METHOD_NAMES are annotated `: boolean` in
// ts/src, but the printer maps no TS return annotation to Go `bool` and emits `any`.
// Their bodies already `return` a Go bool on every path (no `return nil`, no
// any-typed expression — the per-method census lives in the campaign unit's REPORT.md),
// so the declared return type is retagged to match the value it returns. This is the
// signature half of the rule in build/go-local-types.js; the local half types
// `var x any = this.M(...)` as `bool` off the same list, so the two cannot drift.
// Same shape as the Promise-returning `<-chan any` coercion in createGoExchange().
function coerceGoBoolMethodReturns (content: string, names: string[]): string {
    for (const name of names) {
        const coerceRegex = new RegExp ('(func\\s+\\(this\\s+\\*\\w+\\)\\s+' + name + '\\([^)]*\\))\\s+any(\\s+\\{)', 'g');
        // F04: the replacement spells the single space before `{` itself, so a padded
        // signature (`) any  {`) can never survive the coercion as `) bool  {`
        content = content.replace (coerceRegex, '$1 bool {');
    }
    return content;
}

function capitalize(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

// The indentation of the line that the match starting at `offset` sits on. Several emitters
// rewrite one source expression into *several* Go statements; gofmt prints one statement per
// line at the enclosing block's indentation, so those rewrites emit the split form themselves
// and need this prefix to keep every emitted line at the same (future) tab depth.
function statementIndent (whole: string, offset: number): string {
    const lineStart = whole.lastIndexOf ('\n', offset - 1) + 1;
    const prefix = whole.substring (lineStart, offset);
    const match = prefix.match (/^[ \t]*/);
    return match ? match[0] : '';
}

// this is necessary because for some reason
// pathname keeps the first '/' for windows paths
// making them invalid
// example: /C:Users/user/Desktop/
if (platform === 'win32') {
    if (__dirname[0] === '/') {
        __dirname = __dirname.substring(1);
    }
}

const TS_BASE_FILE = './ts/src/base/Exchange.ts';
const GLOBAL_WRAPPER_FILE = './go/v4/exchange_wrappers.go';
// suffix carried by every transpiled channel-returning method (FetchTickerAsync);
// the plain name (FetchTicker) is the typed sync method on the same struct
const GO_ASYNC_SUFFIX = 'Async';
const TYPED_INTERFACE_FILE = './go/v4/exchange_typed_interface.go';
const TYPED_WS_INTERFACE_FILE = './go/v4/pro/exchange_typed_interface.go';
// const EXCHANGE_WS_WRAPPER_FOLDER = './go/v4/exchanges/pro/wrappers/'
const ERRORS_FILE = './go/v4/exchange_errors.go';
const BASE_METHODS_FILE = './go/v4/exchange_generated.go';
const EXCHANGES_FOLDER = './go/v4';
const EXCHANGES_WS_FOLDER = './go/v4/pro';
const EXCHANGES_PREDICTION_FOLDER = './go/v4/prediction';
const EXCHANGES_PREDICTION_WS_FOLDER = './go/v4/prediction/pro';
const PREDICTION_PACKAGE = 'ccxtprediction';
const PREDICTION_WS_PACKAGE = 'ccxtpredictionpro';
const PREDICTION_IMPORT = 'import ccxtprediction "github.com/ccxt/ccxt/go/v4/prediction"';
const BASE_TESTS_FOLDER = './go/tests/base';
const BASE_TESTS_FILE =  './go/tests/base/tests.go';
// const EXCHANGE_BASE_FOLDER = './go/tests/Generated/Exchange/Base';
const GENERATED_TESTS_FOLDER = './go/tests';

// const EXAMPLES_INPUT_FOLDER = './examples/ts';
// const EXAMPLES_OUTPUT_FOLDER = './examples/go/examples';
const goComments: { [key: string]: { [key: string]: string}} = {};

const goTypeOptions: dict = {};
// names of the options structs that live in the base ccxt package; used by the
// prediction pass to decide between aliasing (type X = ccxt.X) and emitting a local struct
const baseGoTypeOptionNames = new Set<string>();
// option struct/func names the prediction package declares LOCALLY because its method
// renamed a base param (e.g. fetchTickers `outcomes` vs base `symbols`). Keyed by method
// capName → [Options, OptionsStruct, WithXxx...]. These must NOT be ccxt.-qualified in the
// wrapper file of an exchange that DEFINES the method (so it binds to the local struct), but
// MUST stay ccxt.-qualified where the method is a base delegation (missing-method wrapper).
const predictionLocalOptionStructs = new Map<string, string[]>();

const WRAPPER_METHODS: {} = {};

let goTests: string[] = [];
const goWsTests: string[] = [];

const imports = [
    'import ccxt "github.com/ccxt/ccxt/go/v4"'
];

// `exchange: any` in ts/src/test hides the callee from the transpiler's checker, so the async
// suffix is not applied to those call sites; every unified method received with `<-` is a
// channel trampoline, so append it here. Sleep is hand-written (exchange.go) and keeps its name.
const GO_TEST_ANY_RECEIVE_REGEX: [RegExp, string] = [
    new RegExp (`<-exchange\\.(\\((?:ccxt\\.)?I\\w+\\)\\.)?((?!Sleep\\b)[A-Z]\\w*?)(?<!${GO_ASYNC_SUFFIX})\\(`, 'g'),
    `<-exchange.$1$2${GO_ASYNC_SUFFIX}(`,
];

const VIRTUAL_BASE_METHODS: { [key: string]: boolean} = {
    "cancelOrder": true, // true if the method returns a channel (async in JS)
    "cancelOrdersWithClientOrderIds": true,
    "cancelOrderWithClient": true,
    "createExpiredOptionMarket": false,
    "createOrder": true,
    "editOrder": true,
    "editOrderWithClientOrderId": true,
    "fetchAccounts": true,
    "fetchEvents": true, // prediction base -> venue override (loadEventsHelper)
    "fetchOutcome": true, // prediction base -> venue override (kalshi on-demand loadOutcome)
    "fetchOutcomes": true, // prediction base loadOutcomes -> venue batch override (kalshi tickers=, polymarket clob_token_ids)
    "signEvmTransaction": false, // sync (returns hex string, not a channel); prediction base sendEvmTransaction -> venue override
    "fetchBalance": true,
    "fetchClosedOrders": true,
    "fetchDepositAddressesByNetwork": true,
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
    "fetchTradingFees": true,
    "fetchOption": true,
    "fetchOrder": true,
    "fetchOrderWithClientOrderId": true,
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
    "parseOrderBookBidsAsks": false,
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
    "parseWsTrade": false,
    "parseGreeks": false,
    "parseTransaction": false,
    "parseTransfer": false,
    "parseWithdrawal": false,
    "parseLeverage": false,
    "parseWithdrawalStatus": false,
    "safeMarket": false, // try to remove custom implementations
    "market": false,
    "setSandboxMode": false,
    "safeCurrencyCode": false,
    "parseConversion": false,
    "sign": false,
    "nonce": false, // venues override nonce() (e.g. hyperliquid); base incrementingNonce() must reach the override, matching Rust
    "signIn": true,
    // ws methods
    'cancelAllOrdersWs': true,
    'cancelOrdersWs': true,
    'cancelOrderWs': true,
    'createLimitBuyOrderWs': true,
    'createLimitOrderWs': true,
    'createLimitSellOrderWs': true,
    'createMarketBuyOrderWs': true,
    'createMarketOrderWithCostWs': true,
    'createMarketOrderWs': true,
    'createMarketSellOrderWs': true,
    'createOrdersWs': true,
    'createOrderWithTakeProfitAndStopLossWs': true,
    'createOrderWs': true,
    'createPostOnlyOrderWs': true,
    'createReduceOnlyOrderWs': true,
    'createStopLimitOrderWs': true,
    'createStopLossOrderWs': true,
    'createStopMarketOrderWs': true,
    'createStopOrderWs': true,
    'createTakeProfitOrderWs': true,
    'createTrailingAmountOrderWs': true,
    'createTrailingPercentOrderWs': true,
    'createTriggerOrderWs': true,
    'editOrderWs': true,
    'fetchBalanceWs': true,
    'fetchClosedOrdersWs': true,
    'fetchDepositsWs': true,
    'fetchMyTradesWs': true,
    'fetchOHLCVWs': true,
    'fetchOpenOrdersWs': true,
    'fetchOrderBookWs': true,
    'fetchOrdersByStatusWs': true,
    'fetchOrdersWs': true,
    'fetchOrderWs': true,
    'fetchOpenInterests': true,
    'fetchPositionsForSymbolWs': true,
    'fetchPositionsWs': true,
    'fetchPositionWs': true,
    'fetchTickersWs': true,
    'fetchTickerWs': true,
    'fetchTradesWs': true,
    'fetchTradingFeesWs': true,
    'fetchWithdrawalsWs': true,
    'handleDelta': false,
    'unWatchBidsAsks': true,
    'unWatchMyTrades': true,
    'unWatchOHLCV': true,
    'watchBalance': true,
    'watchBidsAsks': true,
    'watchLiquidations': true,
    'watchMarkPrice': true,
    'watchMarkPrices': true,
    'watchMyLiquidations': true,
    'watchMyLiquidationsForSymbols': true,
    'watchMyTrades': true,
    'watchOHLCV': true,
    'watchOHLCVForSymbols': true,
    'watchOrderBook': true,
    'watchOrderBookForSymbols': true,
    'watchOrders': true,
    'watchOrdersForSymbols': true,
    'watchPosition': true,
    'watchPositions': true,
    'watchTicker': true,
    'watchTickers': true,
    'watchTrades': true,
    'watchTradesForSymbols': true,
    'withdrawWs': true,
    "parseLastPrice": false,
    'fetchPositionsADLRank': true,
    'parseADLRank': false
    // 'fetchCurrenciesWs': true,
    // 'fetchMarketsWs': true,
}

const INTERFACE_METHODS = [
    'cancelOrders',
    'cancelOrdersWithClientOrderIds',
    'cancelAllOrders',
    'cancelAllOrdersAfter',
    'cancelOrder',
    'cancelOrderWithClientOrderId',
    'cancelOrdersForSymbols',
    'createConvertTrade',
    'createDepositAddress',
    'createLimitBuyOrder',
    'createLimitOrder',
    'createLimitSellOrder',
    'createMarketBuyOrder',
    'createMarketBuyOrderWithCost',
    'createMarketOrder',
    'createMarketOrderWithCost',
    'createMarketSellOrder',
    'createMarketSellOrderWithCost',
    'createOrder',
    'createOrders',
    'createOrderWithTakeProfitAndStopLoss',
    'createPostOnlyOrder',
    'createReduceOnlyOrder',
    'createStopLimitOrder',
    'createStopLossOrder',
    'createStopMarketOrder',
    'createStopOrder',
    'createTakeProfitOrder',
    'createTrailingAmountOrder',
    'createTrailingPercentOrder',
    'createTriggerOrder',
    'editLimitBuyOrder',
    'editLimitOrder',
    'editLimitSellOrder',
    'editOrder',
    'editOrderWithClientOrderId',
    'editOrders',
    'fetchAccounts',
    'fetchAllGreeks',
    'fetchBalance',
    'fetchBidsAsks',
    'fetchBorrowInterest',
    'fetchBorrowRate',
    'fetchCanceledAndClosedOrders',
    'fetchClosedOrders',
    'fetchConvertCurrencies',
    'fetchConvertQuote',
    'fetchConvertTrade',
    'fetchConvertTradeHistory',
    'fetchCrossBorrowRate',
    'fetchCrossBorrowRates',
    'fetchCurrencies',
    'fetchDepositAddress',
    'fetchDepositAddresses',
    'fetchDepositAddressesByNetwork',
    'fetchDeposits',
    'fetchDepositsWithdrawals',
    'fetchDepositWithdrawFee',
    'fetchDepositWithdrawFees',
    'fetchFreeBalance',
    'fetchFundingHistory',
    'fetchFundingInterval',
    'fetchFundingIntervals',
    'fetchFundingRate',
    'fetchFundingRateHistory',
    'fetchFundingRates',
    'fetchGreeks',
    'fetchIndexOHLCV',
    'fetchIsolatedBorrowRate',
    'fetchIsolatedBorrowRates',
    'fetchLastPrices',
    'fetchLedger',
    'fetchLedgerEntry',
    'fetchLeverage',
    'fetchLeverages',
    'fetchLeverageTiers',
    'fetchLiquidations',
    'fetchLongShortRatio',
    'fetchLongShortRatioHistory',
    'fetchMarginAdjustmentHistory',
    'fetchMarginMode',
    'fetchMarginModes',
    'fetchMarketLeverageTiers',
    'fetchMarkets',
    'fetchMarkOHLCV',
    'fetchMarkPrice',
    'fetchMarkPrices',
    'fetchMyLiquidations',
    'fetchMyTrades',
    'fetchOHLCV',
    'fetchOpenInterest',
    'fetchOpenInterestHistory',
    'fetchOpenInterests',
    'fetchOpenOrders',
    'fetchOption',
    'fetchOptionChain',
    'fetchOrder',
    'fetchOrderWithClientOrderId',
    'fetchOrderBook',
    'fetchOrderBooks',
    'fetchOrders',
    'fetchOrderStatus',
    'fetchOrderTrades',
    'fetchPaymentMethods',
    'fetchPosition',
    'fetchPositionHistory',
    'fetchPositionMode',
    'fetchPositions',
    'fetchPositionsForSymbol',
    'fetchPositionsHistory',
    'fetchPositionsRisk',
    'fetchPremiumIndexOHLCV',
    'fetchStatus',
    'fetchTicker',
    'fetchTickers',
    'fetchTime',
    'fetchTrades',
    'fetchTradingFee',
    'fetchTradingFees',
    'fetchTradingLimits',
    'fetchTransactionFee',
    'fetchTransactionFees',
    'fetchTransactions',
    'fetchTransfer',
    'fetchTransfers',
    'fetchWithdrawals',
    // 'setLeverage', // tmp remove we have to unify types
    'setMargin',
    'setMarginMode',
    'setPositionMode',
    'transfer',
    'withdraw',
    // ws methods
    'cancelAllOrdersWs',
    'cancelOrdersWs',
    'cancelOrderWs',
    'createLimitBuyOrderWs',
    'createLimitOrderWs',
    'createLimitSellOrderWs',
    'createMarketBuyOrderWs',
    'createMarketOrderWithCostWs',
    'createMarketOrderWs',
    'createMarketSellOrderWs',
    'createOrdersWs',
    'createOrderWithTakeProfitAndStopLossWs',
    'createOrderWs',
    'createPostOnlyOrderWs',
    'createReduceOnlyOrderWs',
    'createStopLimitOrderWs',
    'createStopLossOrderWs',
    'createStopMarketOrderWs',
    'createStopOrderWs',
    'createTakeProfitOrderWs',
    'createTrailingAmountOrderWs',
    'createTrailingPercentOrderWs',
    'createTriggerOrderWs',
    'editOrderWs',
    'fetchBalanceWs',
    'fetchClosedOrdersWs',
    // 'fetchCurrenciesWs',
    'fetchDepositsWs',
    // 'fetchMarketsWs',
    'fetchMyTradesWs',
    'fetchOHLCVWs',
    'fetchOpenOrdersWs',
    'fetchOrderBookWs',
    'fetchOrdersByStatusWs',
    'fetchOrdersWs',
    'fetchOrderWs',
    'fetchPositionsForSymbolWs',
    'fetchPositionsWs',
    'fetchPositionWs',
    'fetchTickersWs',
    'fetchTickerWs',
    'fetchTradesWs',
    'fetchTradingFeesWs',
    'fetchWithdrawalsWs',
    'unWatchBidsAsks',
    'unWatchMyTrades',
    // 'unWatchOHLCV',
    'unWatchOHLCV',
    'unWatchOHLCVForSymbols',
    'unWatchOrderBook',
    'unWatchOrderBookForSymbols',
    'unWatchOrders',
    'unWatchTicker',
    'unWatchTickers',
    'unWatchTrades',
    'unWatchTradesForSymbols',
    'watchBalance',
    'watchBidsAsks',
    'watchLiquidations',
    'watchMarkPrice',
    'watchMarkPrices',
    'watchMyLiquidations',
    'watchMyLiquidationsForSymbols',
    'watchMyTrades',
    'watchOHLCV',
    'watchOHLCVForSymbols',
    'watchOrderBook',
    'watchOrderBookForSymbols',
    'watchOrders',
    'watchOrdersForSymbols',
    'watchPosition',
    'watchPositions',
    'watchTicker',
    'watchTickers',
    'watchTrades',
    'watchTradesForSymbols',
    'withdrawWs',
    
];

class NewTranspiler {

    transpiler!: Transpiler;
    pythonStandardLibraries;
    oldTranspiler = new OldTranspiler();
    // true while transpiling the prediction-market exchanges (ts/src/prediction/),
    // which live in their own go packages (ccxtprediction / ccxtpredictionpro)
    isPrediction = false;
    // set once any stage skipped an up-to-date exchange: the shared
    // exchange_wrapper_structs.go is rebuilt from the module-level `goTypeOptions`
    // accumulator, which only holds the structs of the exchanges transpiled in this
    // process — rewriting it after a partial run would truncate it
    skippedUnchangedExchanges = false;
    // parsed PredictionExchange method signatures; lets a prediction venue that doesn't
    // override a unified method still emit the prediction-typed wrapper (resolving to the
    // inherited base method) instead of the crypto-typed exchangeTyped fallback
    predictionBaseMethodsTypes: any[] = [];
    // names of the 62 symbol-based trading methods that live in `export default class Exchange
    // extends BaseExchange` in the TS source. They hang off *Exchange (not *BaseExchange), so
    // prediction venues (which embed BaseExchange via PredictionExchange) never inherit them —
    // matching TS/C#/Java. Populated in transpileBaseMethods.
    exchangeTierMethods: Set<string> = new Set();
    private _extendedExchanges: { [key: string]: string } | null = null;
    private _typeAndFuncNamesCache: { [key: string]: Set<string> } = {};
    // transpiled base-class results, keyed by source path. transpileBaseMethods runs three
    // times per --rest-and-ws build (REST, prediction recursion, WS) over the same
    // Exchange.ts; the transpile is pure, so it is paid once per process.
    private _baseMethodsTranspileCache: { [key: string]: any } = {};
    // bytes last written by writeGeneratedOnce(), keyed by output path — lets the repeated
    // base passes skip re-emitting a file whose content they just produced identically
    private _lastWrittenContent: { [key: string]: string } = {};
    // true while createTypedInterfaceFile() is running: requireBaseMethodsMetadata() regenerates
    // the typed interface after a late base re-read, which must not re-enter its own caller
    creatingTypedInterface = false;
    // lazily created in webworkerTranspile and kept alive for the lifetime of the
    // instance, so every transpile stage reuses the same warm worker threads
    piscina: Piscina | undefined;
    futuresExchanges = new Set<string>([  // futures exchanges that extend a spot exchange class
        // 'kucoinfutures'
    ]);

    constructor(isWs: boolean = false) {

        this.setupTranspiler();
        // this.transpiler.goTranspiler.VAR_TOKEN = 'var'; // tmp fix


        this.pythonStandardLibraries = {
            'hashlib': 'hashlib',
            'math': 'math',
            'json.loads': 'json',
            'json.dumps': 'json',
            'sys': 'sys',
        };
    }

    getWsRegexes() {
        // hoplefully we won't need this in the future by having everything typed properly in the typescript side
        return [
            [/([^a-zA-Z0-9])base\.([A-Za-z0-9]+)\(/g, `$1this.base.$2(`],  // changes 'base' to 'this.base'
            // --- Generic fixes for WS transpilation (Go) ---
            // Instantiate REST class pointer correctly (e.g., new hitbtcRest() -> &ccxt.hitbtcRest{})
            [/New(\w+)Rest\(\)/g, '&ccxt.$1{}'],
            // await-style return (C#) → channel read in Go (return await foo; -> return <-$1)
            [/return await (\w+);/g, 'return <-$1'],
            [/new\s*getValue\((\w+),\s*(\w+)\)\((\w+)\)/g, 'this.NewException(GetValue($1, $2), $3)'],
            // Casted access to subscriptions/futures/clients → exported Go field/prop
            [/client\.subscriptions/g, 'client.(*WSClient).Subscriptions'],
            [/Dictionary<string,object>\)client\.futures/g, 'client.(*WSClient).Futures'],
            [/this\.safeValue\(client\.futures,/g, 'this.SafeValue(client.(*WSClient).Futures,'],
            [/Dictionary<string,object>\)this\.clients/g, 'this.Clients'],
            // OrderBook & OrderBookSide casts → plain method/field access with proper capitalisation
            [/(orderbook)(\.reset)/g, '$1.(OrderBookInterface).Reset'],
            [/(\w+)(\.cache)/g, '$1.Cache'],
            [/((\w+)(\.hashmap))/g, '$1.Hashmap'],
            [/(countedBookSide)\.store\(/g, '$1.Store('],
            [/(\w+)\.(store|storeArray)\(/g, '$1.$2('],
            
            // DynamicInvoker from C# → callDynamically helper in Go
            [/(\w+)\.call\(this,(.+)\)/g, 'this.CallDynamically($1, $2)'],
            
            // .limit() on order book variable should be capitalised
            [/(\w+)\.limit\(\)/g, '$1.Limit()'],
            
            // Future/Client Resolve/Reject casts
            [/future\.resolve/g, 'future.(*Future).Resolve'],
            [/(\w+)\.(resolve|reject)/g, '$1.$2'],
            
            // spawn/delay helpers – convert additional params array creation to variadic list
            [/this\.spawn\((this\.\w+),(.+)\)/g, 'this.Spawn($1, $2)'],
            [/this\.delay\(([^,]+),([^,]+),(.+)\)/g, 'this.Delay($1, $2, $3)'],
            
            // callDynamically array wrapper removal
            [/(((?:this\.)?\w+))\.(append|resolve|getLimit)\(/g, 'ccxt.CallDynamically($1, "$3", '],
            [/NewGetValue\(([A-Za-z0-9]+), ([A-Za-z0-9]+)\)\(([A-Za-z0-9]+)\)/g, 'ccxt.CallDynamically(GetValue($1, $2), $3)'],
            [/([a-zA-Z0-9]+)\.Call\(this, /g, 'ccxt.CallDynamically($1, '],
            
            [/Future\)/g, ''],  // Remove C# generics / casts that are invalid in Go
            [/;\s*\n/g, '\n'],  // Remove stray semicolons that leak from TS/CS syntax
            
            [/\.Append\(/g, '.(Appender).Append('],
            [/stored\.\(Appender\)\.Append\(this\.ParseOHLCV/g, "stored.Append(this.ParseOHLCV"],
            [/(stored|cached)?([Oo]rders)?\.Hashmap/g, '$1$2.(*ArrayCache).Hashmap'],
            // `const stored = new ArrayCache (limit)` prints as a short declaration; the ws regexes
            // above cannot see the inferred type, so name it. The local only ever holds the
            // constructor result (`this.trades[symbol] = stored`), and naming the type keeps the very
            // same box: every `.append`/`.hashmap`/nil-check in the sources of these 8 sites lives on
            // the *read* local (`this.trades[symbol]`), never on this one.
            [/stored := NewArrayCache\(limit\)/g, 'var stored *ArrayCache = NewArrayCache(limit)'],
            // Futures
            [/future\.(Resolve|Reject)/g, 'future.(*Future).$1'],
            [/\(<\-future\)/g, '<-future.(<-chan any)'],
            [/<-spawaned/g, '<-spawaned.(<-chan any)'],
            [/promise\.Resolve\(([^)]+)\)/g, 'promise.(*Future).Resolve(ToGetsLimit($1))'],
            // GetsLimit
            [/([a-zA-Z]\w*)\.GetLimit/g, 'ToGetsLimit($1).GetLimit'],
            [/order.Limit([^"])/g, 'ToGetsLimit(orderbooks).Limit$1'],
            // OrderBook
            [/\.Cache\s*=(?!=)\s*(.+)/g, '.(OrderBookInterface).SetCache($1)'],
            [/(?:&)?(storedOrderBook|orderbook)\.Cache/g, '$1.(OrderBookInterface).GetCache()'],
            [/orderbook(s)?\.(Reset|Limit)/g, 'orderbook$1.(OrderBookInterface).$2'],
            [/([a-zA-Z0-9]+).StoreArray/g, '$1.(IOrderBookSide).StoreArray'],
            [/(bookside|asks|bids|Side).Store/g, '$1.(IOrderBookSide).Store'],
            [/this.ParseWsBidAsk\(GetValue\(this.Orderbooks, symbol\)/g, 'this.ParseWsBidAsk(UnWrapType(ccxt.GetValue(this.Orderbooks, symbol))'],
            // Clients
            // AsClient instead of a hard .(*Client) assertion: the transport hands
            // generated code either *Client (offline mocks) or *WSClient (live), and
            // asserting the wrong one panics (e.g. handlePositions during ws static tests)
            [/FindMessageHashes\(client/g, 'FindMessageHashes\(ccxt.AsClient(client)'],
            [/CleanUnsubscription\(([a-zA-Z0-9]+),/g, 'CleanUnsubscription(ccxt.AsClient($1),'],
            [/client\.Subscriptions/g, 'client.(ClientInterface).GetSubscriptions()'],
            [/client\.Rejections/g, 'client.(ClientInterface).GetRejections()'],
            [/client\.(Url)/g, 'client.(ClientInterface).Get$1()'],
            [/client\.LastPong\s*=(?!=)\s*(.*)/g, 'client.(ClientInterface).SetLastPong($1)'],
            [/client\.LastPong/g, 'client.(ClientInterface).GetLastPong()'],
            [/client\.KeepAlive\s*=(?!=)\s*(.*)/g, 'client.(ClientInterface).SetKeepAlive($1)'],
            [/client\.KeepAlive/g, 'client.(ClientInterface).GetKeepAlive()'],
            [/client\.ReusableFuture\(([^\)]*)\)/g, 'client.(ClientInterface).ReusableFuture($1)'],
            [/(retRes\d+)\s+:=\s+<-future.\(<-chan any\)/g, '$1 := <-future.(*ccxt.Future).Await()'],
            // a discarded `await future` is received straight inside PanicOnError
            [/PanicOnError\(\(?<-future\.\(<-chan any\)\)?\)/g, 'PanicOnError(<-future.(*ccxt.Future).Await())'],
            [/<-client\.Future\(([^\)]*)\)/g, '<-client.(ClientInterface).Future($1)'],
            [/client\.Futures/g, 'client.(ClientInterface).GetFutures()'],
            [/client\.(Send|Reset|OnPong|Reject|Future|Resolve)/g, 'client.(ClientInterface).$1'],
            // Error constructors
            [/NewInvalidNonce/g, 'InvalidNonce'],
            [/NewOrderBook/g, 'NewWsOrderBook'],
            [/NewNotSupported/g, 'NotSupported'],
            [/restInstance := NewBinance/g, 'restInstance := &NewBinance'],
            [/GetDescribeForExtendedWsExchange\(&ccxt.(\w+){}, &ccxt.(\w+){}/g, 'GetDescribeForExtendedWsExchange(ccxt.New$1(nil), ccxt.New$2(nil)'],
            [/restInstance := &ccxt.(\w+){}/g, 'restInstance := ccxt.New$1(nil)'],
            // Nonce
        ];
    }

    // Dynamic alias detection based on TypeScript inheritance analysis
    get extendedExchanges(): { [key: string]: string } {
        if (!this._extendedExchanges) {

            const extendedExchanges: { [key: string]: string } = {};
            const tsFolder = './ts/src';

            exchangeIds.forEach((exchangeName: string) => {
                const filePath = `${tsFolder}/${exchangeName}.ts`;
                const content = fs.readFileSync(filePath, 'utf8');

                const inheritancePattern = /class (\w+) extends ([a-z0-9]+)/;
                const match = content.match(inheritancePattern);

                if (match) {
                    const baseExchange = match[2];
                    
                    if (baseExchange.toLowerCase() !== exchangeName.toLowerCase()) {
                        extendedExchanges[exchangeName] = baseExchange;
                    }
                }
            })
            this._extendedExchanges = extendedExchanges;
        }
        return this._extendedExchanges;
    }

    isExtendedExchange(exchangeName: string) {
        return this.extendedExchanges[exchangeName] !== undefined;
    }

    isAlias (exchangeName: string) {
        return this.isExtendedExchange(exchangeName) && !this.futuresExchanges.has(exchangeName);
    }

    getParentExchange(exchangeName: string) {
        return this.extendedExchanges[exchangeName];
    }

    // go custom method
    customGoPropAssignment(node: any, identation: any) {
        const stringValue = node.getFullText().trim();
        if (Object.keys(errors).includes(stringValue)) {
            return `typeof(${stringValue})`;
        }
        return undefined;
    }

    // a helper to apply an array of regexes and substitutions to text
    // accepts an array like [ [ regex, substitution ], ... ]

    regexAll (text: string, rules: any[]) {
        for (const [pattern, replacement] of rules) {
            const rx = typeof pattern === 'string' ? new RegExp(pattern, 'g') : pattern;
            text = text.replace(rx, replacement);
        }
        return text;
    }

    // ============================================================================

    iden(level = 1) {
        return '\t'.repeat(level);
    }
    // ============================================================================

    getTranspilerConfig(isWrapper: boolean = false) {
        const classNameMap = {};
        if (!isWrapper) {
            // the transpiled struct carries the public exchange name (Binance): its channel
            // methods take the Async suffix and the typed sync methods are appended to the same
            // file. Prediction ids are included since most live only in ts/src/prediction/.
            const allIds = exchangeIds.concat (predictionIds).concat (predictionWsIds);
            allIds.forEach((exchangeName: string) => {
                classNameMap[exchangeName] = capitalize(exchangeName);
                classNameMap[`${exchangeName}Rest`] = capitalize(exchangeName);
            });
            predictionIds.forEach((exchangeName: string) => {
                classNameMap[exchangeName] = capitalize(exchangeName);
                classNameMap[`${exchangeName}Rest`] = capitalize(exchangeName);
            });
        }
        return {
            "verbose": false,
            "go": {
                "classNameMap": classNameMap,
                // channel-returning async methods carry the suffix so the plain name is
                // free for the typed sync method emitted into the same core file
                "asyncMethodSuffix": GO_ASYNC_SUFFIX,
                // required OrderType/OrderSide params of the unified order methods print `string` on the
                // base, every override and go/v4/exchange_interface.go (audit: no override nil-compares them)
                "unifiedStringParams": GO_UNIFIED_STRING_PARAMS,
            //     "parser": {
            //         "ELEMENT_ACCESS_WRAPPER_OPEN": "getValue(",
            //         "ELEMENT_ACCESS_WRAPPER_CLOSE": ")",
            //         // "VAR_TOKEN": "var",
            //     }
            },
        };
    }

    createSee(link: string) {
        return `/// See <see href="${link}"/>  <br/>`;
    }

    createParam(param: any) {
        return`/// <item>
    /// <term>${param.name}</term>
    /// <description>
    /// ${param.type} : ${param.description}
    /// </description>
    /// </item>`;
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
    /// <returns> <term>${returnType}</term> ${returnDesc}.</returns>`;
    const commentWithoutEmptyLines = comment.replace(/^\s*[\r\n]/gm, "");
    return commentWithoutEmptyLines;
    }

    transformTSCommentIntoGO(name: string, desc: string, sees: string[], params : string[], returnType:string, returnDesc: string) {
        return this.createGOCommentTemplate(name, desc, sees, params, returnType, returnDesc);
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
            exchangeData = goComments[exchangeName] = {};
        }
        let exchangeMethods = goComments[exchangeName];
        if (!exchangeMethods) {
            exchangeMethods = {};
        }
        // const transformedComment = this.transformTSCommentIntoGo(methodName, description, sees,params, returnType, returnDescription);
        exchangeMethods[methodName] = comment;
        goComments[exchangeName] = exchangeMethods;
        return comment;
    }

    setupTranspiler(isWs: boolean = false) {
        this.transpiler = new Transpiler (this.getTranspilerConfig());
        this.transpiler.setVerboseMode(false);
        this.transpiler.goTranspiler.transformLeadingComment = this.transformLeadingComment.bind(this);
        // typed locals for the hand-written CCXT Go helpers (see build/go-local-types.js);
        // build/go-worker.ts installs the same hooks for the Piscina path
        installCcxtGoLocalTypes (this.transpiler.goTranspiler);
        installCcxtGoIndexableTypes (this.transpiler.goTranspiler);
    }

    createGeneratedHeader() {
        return [
            "// PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:",
            "// https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code",
            ""
        ];
    }

    getGoImports(file: any, ws = false) {
        if (this.isPrediction) {
            const namespace = ws ? `package ${PREDICTION_WS_PACKAGE}` : `package ${PREDICTION_PACKAGE}`;
            // gofmt keeps exactly one blank line between the package clause and the import clause,
            // and exactly one between the import clause and the generated-header comment — the
            // call site's trailing newlines cover the second one, so no trailing '' here
            return [
                namespace,
                '',
                'import ccxt "github.com/ccxt/ccxt/go/v4"',
                ...(ws ? [ PREDICTION_IMPORT ] : []),
            ];
        }
        const namespace = ws ? 'package ccxtpro' : 'package ccxt';
        const hasImport = (ws || this.isPrediction);
        const values = [
            // "using ccxt;",
            namespace,
            // the ws/prediction packages carry their ccxt import right after the package clause
            // and gofmt keeps exactly one blank line between the two; the base ccxt package has
            // no import here and keeps the single '' the call site's trailing newlines rely on
            ...(hasImport ? [ '', 'import ccxt "github.com/ccxt/ccxt/go/v4"' ] : [ '' ]),
            // 'import "helpers"'
        ]
        return values;
    }

    isObject(type: string) {
        return (type === 'any') || (type === 'unknown');
    }

    isDictionary(type: string): boolean {
        return (type === 'Object') || (type === 'Dictionary<any>') || (type === 'unknown') || (type === 'Dict') || ((type.startsWith('{')) && (type.endsWith('}')));
    }

    isStringType(type: string) {
        return (type === 'Str') || (type === 'string') || (type === 'StringLiteral') || (type === 'StringLiteralType') || (type.startsWith('"') && type.endsWith('"')) || (type.startsWith("'") && type.endsWith("'"));
    }

    isNumberType(type: string) {
        return (type === 'Num') || (type === 'number') || (type === 'NumericLiteral') || (type === 'NumericLiteralType');
    }

    isIntegerType(type: string) {
        return type !== undefined && (type.toLowerCase() === 'int');
    }

    isBooleanType(type: string) {
        return (type === 'boolean') || (type === 'BooleanLiteral') || (type === 'BooleanLiteralType') || (type === 'Bool');
    }

    /**
     * @description Converts a JavaScript type to a Go type
     * @param name 
     * @param type 
     * @param isReturn 
     * @returns 
     */
    jsTypeToGo(name: string, type: string, isReturn = false): string | undefined {

        // handle watchOrderBook exception here (watchOrderBook and watchOrderBookForSymbols)
        if (
            name.startsWith('createOrdersWs') ||
            name.startsWith('fetchOrdersByStatusWs')
        ) {
            return '[]Order'
        }
        if (name.startsWith('withdrawWs')) {
            return 'Transaction'
        }
        
        if (name.startsWith('watchOrderBook')) {
            // if (isReturn) {
            //     return `NewOrderBookFromWs`
            // }
             return this.isPrediction ? `PredictionOrderBook` : `OrderBook`;

        }

        if (name.startsWith('unWatch')) { // type not unified yet
            return `any`;
        }

        if (name === 'fetchTime'){
            return `<-chan int64`; // custom handling for now
        }

        const isPromise = type.startsWith('Promise<') && type.endsWith('>');
        let wrappedType = isPromise ? type.substring(8, type.length - 1) : type;
        let isList = false;

        // TS >= 5/6 (ast-transpiler 0.0.91) infers inline object literal types for
        // methods without an explicit annotation (e.g. `{ info: any; hedged: boolean; }`).
        // Map them to a plain dictionary (matches the previous TS 4.9 output).
        if (wrappedType !== undefined && wrappedType.trim().startsWith('{')) {
            if (wrappedType.trim().endsWith('[]')) {
                isList = true; // e.g. `{ id: Str; ... }[]` → []map[string]any
            }
            return addTaskIfNeeded('map[string]any');
        }

        // TS >= 5/6 (ast-transpiler 0.0.91) infers union return types for methods
        // without an explicit annotation (e.g. `Position | undefined`, `Dict | Leverage`).
        // Normalize them here: drop undefined/null members and collapse remaining
        // multi-member unions to the first member (matches the previous TS 4.9 output).
        if (wrappedType !== undefined && wrappedType.includes(' | ') && !wrappedType.includes('<')) {
            const members = wrappedType.split(' | ').map (m => m.trim()).filter (m => m !== 'undefined' && m !== 'null' && m !== 'Undefined');
            wrappedType = members.length > 0 ? members[0] : 'any';
        }

        function addTaskIfNeeded(type: string) {
            if (type == 'void') {
                return isPromise ? `<-chan` : '<-chan';
            } else if (isList) {
                return isPromise ? `<-chan []${type}` : `[]${type}`;
            }
            return isPromise ? `<-chan ${type}` : type;
        }

        const goReplacements: dict = {
            'OrderType': 'string',
            'OrderSide': 'string', // tmp
            'fetchEventsParams': 'map[string]interface{}', // params bag; surface as a map
            // TS >= 5/6 (ast-transpiler 0.0.91) prints this alias by name instead of
            // expanding it to `Dict | undefined` like TS 4.9 did
            'NullableDict': 'map[string]any',
            'Market': 'MarketInterface',
        };

        if (wrappedType === undefined || wrappedType === 'Undefined') {
            return addTaskIfNeeded('any'); // default if type is unknown;
        }

        // `List` is an alias for `Array<any>` (see ts/src/base/types.ts) — normalize it
        // to `any[]` so it flows through the array branch below instead of leaking the
        // bare `List` / `NewList` identifiers that don't exist in the Go runtime.
        if (wrappedType === 'List') {
            wrappedType = 'any[]';
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
                return addTaskIfNeeded('map[string]any');
            }
            return addTaskIfNeeded('any');
        }
        if (this.isDictionary(wrappedType)) {
            return addTaskIfNeeded('map[string]any');
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
            return addTaskIfNeeded('[]string');
        }
        if (goReplacements[wrappedType] !== undefined) {
            return addTaskIfNeeded(goReplacements[wrappedType]);
        }

        if (wrappedType.startsWith('Dictionary<')) {
            // Always convert the value type to ensure array/slice notation is correct.
            let valueType = wrappedType.substring(11, wrappedType.length - 1).trim();

            // Recursively convert the inner type (handles nested Dictionary and [] types).
            valueType = this.jsTypeToGo(name, valueType) as any;

            return addTaskIfNeeded(`map[string]${valueType}`);
        }

        return addTaskIfNeeded(wrappedType);
    }

    safeGoName(name: string): string {
        const goReservedWordsReplacement: dict = {
            'type': 'typeVar',
        };
        return goReservedWordsReplacement[name] || name;
    }

    convertParamsToGo(methodName: string, params: any[]): string {
        const needsVariadicOptions = params.some(param => param.optional || param?.initializer !== undefined);
        if (needsVariadicOptions && params.length === 1 && params[0].name === 'params') {
            // handle params = {}
            return 'params ...any';
        }
        const paramsParsed = params.map(param => this.convertJavascriptParamToGoParam(param)).join(', ');
        if (!needsVariadicOptions) {
            return paramsParsed;
        }
        // return paramsParsed;
        const regularParams = params.filter(params => !params.optional && params?.initializer === undefined);
        const regularParamsParsed = regularParams.map(param => this.convertJavascriptParamToGoParam(param));
        // const optionalParams = params.filter(params => params.optional || params?.initializer !== undefined);
        const allParams =  regularParamsParsed.concat(['options ...' + capitalize(methodName) + 'Options']);
        return allParams.join(', ');
    }

    convertJavascriptParamToGoParam(param: any): string | undefined {
        const name = param.name;
        const safeName = this.safeGoName(name);
        const isOptional =  param.optional || param.initializer !== undefined;
        const op = isOptional ? '?' : '';
        let paramType: any = undefined;
        if (param.type == undefined) {
            paramType = 'any';
        } else {
            paramType = this.jsTypeToGo(name, param.type);
        }
        const isNonNullableType = this.isNumberType(param.type) || this.isBooleanType(param.type) || this.isIntegerType(param.type);
        if (isNonNullableType) {
            if (isOptional) {
                // if (param.initializer !== undefined && param.initializer !== 'undefined') {
                return `${safeName} *${paramType}`;
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
                return `${safeName} *${paramType}`;
            } else {
                return `${safeName} ${paramType}`;
            }
        }
        return `${safeName} ${paramType}`;
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
            'unWatch'
            // 'load',
        ];
        // const allowedPrefixesWs = [
        //     ''
        // ]
        const blacklistMethods = new Set ([
            'createOrderRequest',
            'editOrderRequest',
            'cancelOrdersRequest',
            'cancelAllOrdersRequest',
            'createContractOrder',
            'createNetworksByIdObject',
            'createSpotOrder',
            'createSwapOrder',
            'createVault',
            'fetch',
            'fetchCurrenciesWs',
            'fetchMarketsWs',
            'fetchPortfolioDetails',
            'loadMarketsHelper',
            'loadOrderBook',
            'setPositionCache',
            'setPositionsCache',
            'setLastRequest',
            'setLastRestRequestTimestamp',
            'setProperty',
            'setProxyAgents',
            'setSandBoxMode',
            'unWatch',
            'unWatchChannel',
            'unWatchChannel',
            'unWatchMultiple',
            'unWatchPrivate',
            'unWatchPublic',
            'unWatchPublicMultiple',
            'unWatchTopics',
            'watch',
            'watchMany',
            'watchMultiHelper',
            'watchMultiple',
            'watchMultipleSubscription',
            'watchMultipleWrapper',
            'watchMultiRequest',
            'watchMultiTicker',
            'watchMultiTickerHelper',
            'watchPrivate',
            'watchPrivateMultiple',
            'watchPrivateRequest',
            'watchPrivateSubscribe',
            'watchPublic',
            'watchPublicMultiple',
            'watchSpotPrivate',
            'watchStockMarketStream',
            'watchSwapPrivate',
            'watchSpotPublic',
            'watchSwapPublic',
            'watchTopics',
            'unWatchChannels',
            // 'fetchCurrencies',
        ]); // improve this later
        if (methodName.toLowerCase().includes('uta')) {
            return false; // skip UTA methods
        }
        if (isWs) {
            if (methodName.indexOf('Snapshot') !== -1 || methodName.indexOf('Subscription') !== -1 || methodName.indexOf('Cache') !== -1) {
                return false;
            }
        }
        const isBlackListed = blacklistMethods.has (methodName);
        const startsWithAllowedPrefix = allowedPrefixes.some(prefix => methodName.startsWith(prefix));
        return !isBlackListed && startsWithAllowedPrefix;
    }

    unwrapTaskIfNeeded(type: string): string {
        // the printer emits `<-chan X` (F04: no space after `<-`); the legacy `<- chan X`
        // spelling stays matched so a stale type string cannot leak a channel into the
        // unwrapped type, and the optional leading space is dropped so the emitted wrapper
        // never carries `( int64, error)` (gofmt rewrites that to `(int64, error)`).
        return type.replace(/^[ \t]*<-\s*chan[ \t]*/, '');
    }

    unwrapListIfNeeded(type: string): string {
        return type.replace('[]', '');
    }

    unwrapDictionaryIfNeeded(type: string): string {
        return type.startsWith('Dictionary<string,') && type.endsWith('>') ? type.substring(19, type.length - 1) : type;
    }

    // createReturnStatement's conversion of `res` as a func(any) T value for AwaitResult
    createReturnConverter (methodName: string, unwrappedType: string) {
        const stmt = this.createReturnStatement (methodName, unwrappedType);
        if (stmt === 'res') {
            return 'Untyped';
        }
        const call = stmt.match (/^(\w+)\(res\)$/);
        if (call) {
            return call[1];
        }
        const assertion = stmt.match (/^\(?res\)?\.\((.+)\)$/);
        if (assertion) {
            return `AssertAs[${assertion[1]}]`;
        }
        throw new Error (`[go] no AwaitResult converter for ${methodName}: ${stmt}`);
    }

    createReturnStatement(methodName: string,  unwrappedType:string ) {

        // custom handling for now
        if (methodName === 'fetchTime'){
            return `(res).(int64)`;
        }

        if (unwrappedType === 'float64') {
            return `(res).(float64)`;
        }
        if (unwrappedType === 'int64') {
            return `(res).(int64)`;
        }
        if (methodName.startsWith('watchOrderBook')) {
            return this.isPrediction ? `NewPredictionOrderBookFromWs(res)` : `NewOrderBookFromWs(res)`;
        }

        if (methodName.startsWith('unWatch')) {
            // type not unified yet
            return 'res'
        }

        // handle the typescript type Dict
        if (unwrappedType === 'Dict' || unwrappedType === 'map[string]any') {
            return `res.(map[string]any)`;
        }

        if (unwrappedType === '[]map[string]any') {
            return `NewMapArray(res)`; // safe conversion, the runtime value is usually a []any
        }

        if (unwrappedType.startsWith('map[string]')) {
            const mapValueType = unwrappedType.substring('map[string]'.length);
            // struct-valued dictionaries (e.g. Dictionary<DepositWithdrawFee>) hold
            // map[string]any values at runtime, so convert them via the generated
            // NewXMap constructor. scalar/any values keep the plain type assertion,
            // and MarketInterface keeps the existing emission (LoadMarkets uses the
            // hand-written NewMarketsMap template instead).
            if (/^[A-Z]\w*$/.test(mapValueType) && mapValueType !== 'MarketInterface') {
                return `New${capitalize(mapValueType)}Map(res)`;
            }
        }

        const needsToInstantiate = !unwrappedType.startsWith('List<') &&
            !unwrappedType.startsWith('Dictionary<') &&
            !unwrappedType.startsWith('map[') &&
            unwrappedType !== 'object' &&
            unwrappedType !== 'string' &&
            unwrappedType !== 'float' &&
            unwrappedType !== 'bool' &&
            unwrappedType !== 'Int64';
        let returnStatement = "";
        if (unwrappedType.startsWith('[]')) {
            const typeWithoutList = this.unwrapListIfNeeded(unwrappedType);
            returnStatement = `New${capitalize(typeWithoutList)}Array(res)`;
        } else {
            returnStatement =  needsToInstantiate ? `New${capitalize(unwrappedType)}(res)` :  `res.(${unwrappedType})`;
        }
        return returnStatement;
    }

    /**
     * @description Single source of truth for the Go type of an option-struct field.
     * The struct declares it as `*<type>` and the wrapper declares its optional local as
     * `*<type>` too, so both must be computed here and nowhere else.
     */
    optionStructFieldGoType(param: any, qualify: (type: string | undefined) => string | undefined): string | undefined {
        return qualify(this.jsTypeToGo(param.name, param.type));
    }

    getDefaultParamsWrappers(name: string, rawParameters: any[]) {
        let res: string[] = [];

        const hasOptionalParams = rawParameters.some(param => param.optional || param.initializer !== undefined || param.initializer === 'undefined');
        const isOnlyParams = rawParameters.length === 1 && rawParameters[0].name === 'params';
        const i1 = '\t';
        const structName = capitalize(name) + 'Options';
        if (hasOptionalParams && !isOnlyParams) {
            const initOptions = [
                '',
                'opts := ' + structName + 'Struct{}',
                '',
                'for _, opt := range options {',
                '\topt(&opts)',
                '}'
            ].map(e => e!='' ? i1 + e : e);
            res = res.concat(initOptions);
        }
        return res.join("\n");
    }

    // True when the wrapper reads this parameter off the options struct, so the
    // call site can hand `opts.<Field>` over directly instead of via a local.
    isOptionStructParam(rawParameters: any[], param: any) {
        const hasOptionalParams = rawParameters.some(p => p.optional || p.initializer !== undefined || p.initializer === 'undefined');
        const isOnlyParams = rawParameters.length === 1 && rawParameters[0].name === 'params';
        if (!hasOptionalParams || isOnlyParams) {
            return false;
        }
        return !!(param.optional || param.initializer === 'undefined' || param.initializer !== undefined || param.initializer === '{}');
    }

    inden(level: number) {
        return '\t'.repeat(level);
    }

    // qualifies base ccxt type names (e.g. Ticker -> ccxt.Ticker) for code generated
    // into a sibling package (pro / prediction); primitives are left untouched
    qualifyBaseGoType(type: string | undefined): string | undefined {
        if (!type) {
            return type;
        }
        const baseNames = this.extractTypeAndFuncNames(EXCHANGES_FOLDER);
        return type.replace(/[A-Za-z_][A-Za-z0-9_]*/g, (m) => baseNames.has(m) ? `ccxt.${capitalize(m)}` : m);
    }

    createOptionsStruct(methodName: string, params: any[], isWs: boolean | 'prediction' = false) {
        const capName = capitalize(methodName);
        const optionalParams = params.filter(param => (
            param.optional ||
            param.initializer !== undefined ||
            param.initializer === 'undefined' ||
            param.initializer === '{}'
        ));
        // prediction is tracked via the instance flag; the isWs param is a plain boolean here
        const isPrediction = this.isPrediction || (isWs === 'prediction');
        if (
            (optionalParams.length === 0) ||
            (params.length === 1 && params[0].name === 'params')
        ) {
            return;
        }
        // reuse an already-generated struct, EXCEPT when a prediction method's optional params
        // differ from the existing (base) struct — e.g. fetchTickers takes `outcomes` not
        // `symbols`, so it needs a prediction-LOCAL struct with the renamed field instead of
        // the ccxt.-qualified base one (which would have no `Outcomes` field).
        let predictionLocalOverride = false;
        if (capName in goTypeOptions) {
            if (isPrediction) {
                // `\s+` between name and `*` — the emitted field line is space-aligned
                // (`Since  *int64`), so a single-space pattern would miss every field
                const existingFields = (goTypeOptions[capName].match (/^\s+(\w+)\s+\*/gm) || []).map (s => s.trim ().split (/\s+/)[0]);
                const predFields = optionalParams.map (param => capitalize (param.name));
                predictionLocalOverride = predFields.some (f => existingFields.indexOf (f) === -1);
            }
            if (!predictionLocalOverride) {
                return;
            }
        }
        // gofmt indents one tab per level and aligns the `Name Type` columns of a struct's
        // fields (tabwriter, padchar ' ', padding 1): every field name is padded with spaces
        // to the longest name in the struct plus one. Emitting both here keeps the option
        // structs byte-identical to gofmt's output.
        const one = '';
        const two = '\t';
        const three = '\t\t';

        const options = `${capName}Options`;
        const optionsStruct = `${capName}OptionsStruct`;

        // the prediction package aliases the structs that already exist in the base
        // package and declares local ones for prediction-only / param-renamed methods
        const useAlias = (isWs === true) || (isPrediction && baseGoTypeOptionNames.has(capName) && !predictionLocalOverride);
        if (isPrediction && !useAlias) {
            // a locally-declared option struct (param-renamed base method, or a prediction-only
            // method like fetchOrdersByIds): record its names so the defining exchange's wrapper
            // binds to the local struct rather than a ccxt.-qualified base struct of the same name
            const localNames = [ options, optionsStruct ];
            optionalParams
                .filter ((param) => param.optional || param.initializer !== undefined)
                .forEach ((param) => localNames.push (`With${capName}${capitalize (param.name)}`));
            predictionLocalOptionStructs.set (capName, localNames);
        }
        const qualify = (type: string | undefined) => (isPrediction ? this.qualifyBaseGoType(type) : type);

        if (useAlias) {
            // gofmt separates a run of `type` decls from the following `var` decls with one
            // blank line (go/printer declList: a decl-token change forces a blank line)
            goTypeOptions[capName] = [
                `type ${optionsStruct} = ccxt.${optionsStruct}`,
                `type ${options} = ccxt.${options}`,
                '',
                ...optionalParams.map(param => {
                    const methodName = `With${capName}${capitalize(param.name)}`;
                    return`var ${methodName} = ccxt.${methodName}`
                }),
            ].join('\n');
        } else {
            const fieldNames = optionalParams.map((param) => capitalize(param.name));
            const fieldIndent = '\t';
            // gofmt aligns the field types in one space-padded column (longest name + 1)
            const fieldWidth = Math.max(...fieldNames.map((name) => name.length)) + 1;
            goTypeOptions[capName] = [
                `type ${optionsStruct} struct {`,
                ...optionalParams.map((param, index) => {
                    const fieldType = this.optionStructFieldGoType(param, qualify) as string;
                    return `${fieldIndent}${fieldNames[index].padEnd(fieldWidth)}*${fieldType}`;
                }),
                '}',
                '',
                `type ${options} func(opts *${optionsStruct})`,
                ...optionalParams
                    .filter((param) => param.optional || param.initializer !== undefined)
                    .map((param) => {
                        const name = capitalize(param.name);
                        const type = this.optionStructFieldGoType(param, qualify);
                        return [
                            '',
                            `${one}func With${capName}${name}(${this.safeGoName(param.name)} ${type}) ${options} {`,
                            `${two}return func(opts *${optionsStruct}) {`,
                            `${three}opts.${name} = &${this.safeGoName(param.name)}`,
                            `${two}}`,
                            `${one}}`,
                        ].join('\n');
                    }),
                // here WithX methods with optional parameters, like withPrice, withSince, withParams, etc
                // example
                // func WithPrice(price float64) CreateOrderOptions {
                //     return func(opts *CreateOrderOptionsStruct) {
                //         opts.Price = &price
                //     }
                // }
            ].join('\n');
        }
    }

    // gofmt keeps a body on the function's header line only while the printed header (up to
    // and including the space before `{`) plus the printed body stays within 100 characters
    // (go/printer funcBody → bodySize, maxSize = 100); longer bodies move to their own
    // tab-indented line. `header` must end with the space that precedes `{`.
    goSingleStatementFunc (header: string, statement: string): string {
        if (header.length + statement.length <= 100) {
            return `${header}{ ${statement} }`;
        }
        return `${header}{\n\t${statement}\n}`;
    }

    createMissingMethodWrapper(exchangeName: string, name: string, methodInfo: any) {
        if (!methodInfo) {
            return '';
        }
        const itf = methodInfo.interface;
        // const params = methodInfo.params;
        const exCap = capitalize(exchangeName);
        const nameCap = capitalize(name);
        const wrapper = methodInfo.wrapper;

        let args: string[] = [];
        for (const param of wrapper.parameters) {
            if (param.name === 'params' && wrapper.parameters.length === 1) {
                args.push('params...');
                break;
            }
            if (param.isOptional || param.name === 'params' || param.initializer !== undefined || param.initializer === 'undefined' || param.initializer === '{}') {
                // if (wrapper.parameters.length === 1) {
                //     args.push(`params...`)
                // } else {
                //     args.push(`options...`)
                // }
                args.push(`options...`);
                break;
            } else {
                args.push(this.safeGoName(param.name));
            }
        }

        return this.goSingleStatementFunc (`func (this *${exCap}) ${itf} `, `return this.exchangeTyped.${nameCap}(${args.join(', ')})`);
    }

    createWrapper (exchangeName: string, methodWrapper: any, isWs: boolean | 'prediction' = false) {
        // non-async methods with a declared Promise<T> return type (pure delegators) must be wrapped like async ones
        const isAsync = methodWrapper.async || (methodWrapper.returnType ?? '').startsWith ('Promise');
        const isExchange = exchangeName === 'Exchange';
        const methodName = methodWrapper.name;
        if (!this.shouldCreateWrapper(methodName, isWs === true) || !isAsync) {
            return ''; // skip aux methods like encodeUrl, parseOrder, etc
        }

        const methodNameCapitalized = methodName.charAt(0).toUpperCase() + methodName.slice(1);
        const returnType = this.jsTypeToGo(methodName, methodWrapper.returnType, true);
        let unwrappedType = this.unwrapTaskIfNeeded(returnType as string);
        const stringArgs = this.convertParamsToGo(methodName, methodWrapper.parameters);
        this.createOptionsStruct(methodName, methodWrapper.parameters, isWs);
        // const stringArgs = args.filter(arg => arg !== undefined).join(', ');
        let params = methodWrapper.parameters.map((param: any) => {
            let parsedParam = this.safeGoName(param.name);

            if (methodName === 'createOrders' && param.name === 'orders') {
                // prediction venues batch PredictionOrderRequest (outcome) not OrderRequest (symbol)
                return this.isPrediction ? 'ConvertPredictionOrderRequestListToArray(orders)' : 'ConvertOrderRequestListToArray(orders)'; // quick fix, check this later
            }

            // optional params live on the options struct: hand the field straight to the
            // core call instead of hopping through an identically-typed local
            if (this.isOptionStructParam(methodWrapper.parameters, param)) {
                return `opts.${capitalize(param.name)}`;
            }

            return parsedParam;
        }).join(', ');

        const one = '';
        const two = '\t';
        const three = '\t\t';
        const methodDoc = [] as any[];
        if (goComments[exchangeName] && goComments[exchangeName][methodName]) {
            // the wrapper is a top-level declaration: its doc comment sits at column 0 even
            // when the source comment was written inside the method body
            methodDoc.push (goComments[exchangeName][methodName].replace (/^[ \t]+(?=\/\/|\/\*)/gm, '').replace (/^[ \t]+(?=\*)/gm, ' '));
        }

        let emptyObject = `${unwrappedType}{}`;
        if (unwrappedType.startsWith('[]')) {
            emptyObject = 'nil'
        } else if (unwrappedType.includes('int64')) {
            emptyObject = '-1'
        } else if (unwrappedType.includes('float64')) {
            emptyObject = 'float64(-1)'
        } else if (unwrappedType === 'string') {
            emptyObject = '""'
        } else if (unwrappedType === 'any') {
            emptyObject = 'nil';
        }

        const defaultParams =  this.getDefaultParamsWrappers(methodName, methodWrapper.parameters);

        if (stringArgs =='params ...any') {
            params = 'params...';
        }

        const accessor = isExchange ? 'this.Exchange.' : 'this.';
        const body = [
            // `${two}ch:= make(chan ${unwrappedType})`,
            // `${two}go func() {`,
            // `${three}defer close(ch)`,
            // `${three}defer ReturnPanicError(ch)`,
           `${defaultParams}`,
            // receive: `<-` binds the call directly, gofmt prints `<-this.X(...)` (no space after the arrow)
            // AwaitResult receives once, splits off the error and converts the payload to the wrapper's type
            `${two}var res AsyncResult[${unwrappedType}] = AwaitResult(${this.createReturnConverter(methodName, unwrappedType)}, ${accessor}${methodNameCapitalized}${GO_ASYNC_SUFFIX}(${params}))`,
            `${two}if res.Err != nil {`,
            `${three}return ${emptyObject}, res.Err`,
            `${two}}`,
            `${two}return res.Value, nil`,
            // `${two}}()`,
            // `${two}return ch`,
        ];
        const interfaceMethod = `${methodNameCapitalized}(${stringArgs}) (${unwrappedType}, error)`
        if (!WRAPPER_METHODS[exchangeName]) {
            WRAPPER_METHODS[exchangeName] = [];
        }
        if (!WRAPPER_METHODS[exchangeName][methodName]) {
            WRAPPER_METHODS[exchangeName][methodName] = {};
        }
        WRAPPER_METHODS[exchangeName][methodName] = {
            wrapper: methodWrapper,
            interface: interfaceMethod,
            params: stringArgs,
        };
        // wrapperMethods[exchangeName].push([interfaceMethod, stringArgs, methodWrapper]);
        const funcContext = isExchange ? 'ExchangeTyped' : capitalize(exchangeName);
        const method = [
            `${one}func (this *${funcContext}) ${methodNameCapitalized}(${stringArgs}) (${unwrappedType}, error) {`,
            ...body,
            // this.getDefaultParamsWrappers(methodNameCapitalized, methodWrapper.parameters),
            // `${two}res := ${isAsync ? '<-' : ''}this.${exchangeName}.${methodNameCapitalized}(${params});`,
            // `${two}${this.createReturnStatement(methodName, unwrappedType)}`,
            `${one}}`
        ];
        // return methodDoc.concat(method).concat(withMethod).filter(e => !!e).join('\n')
        const docLines = methodDoc.filter (e => !!e);
        // gofmt separates a documented declaration from the previous one with a blank line
        // (go/printer declList: min = 2 when the decl carries a doc comment), so a wrapper
        // with a comment block starts with a newline; the join sites strip it in first
        // position, where the section header already provides the separation.
        const text = docLines.concat(method).filter(e => !!e).join('\n');
        return docLines.length ? '\n' + text : text;
    }

    // Ensures WRAPPER_METHODS['Exchange'] is populated. The base-methods stage registers it as
    // a side effect, but that stage can be skipped by the mtime gate — in which case any
    // consumer (derived wrappers, typed interface) must transpile the base file on demand.
    // Re-runs at most once per process, and that re-run REWRITES exchange_wrappers.go from the
    // current Exchange.ts. The typed interface is regenerated with it: its own gate may already
    // have skipped it earlier in this process, which would leave IExchange declaring the previous
    // ExchangeTyped signatures and every exchange failing to implement it (#29588).
    requireBaseMethodsMetadata () {
        if (WRAPPER_METHODS['Exchange']) {
            return;
        }
        log.bright.cyan ('[go] base methods were up to date but their wrapper metadata is needed, re-reading', TS_BASE_FILE.yellow);
        this.transpileBaseMethods (TS_BASE_FILE, false, true);
        if (!this.creatingTypedInterface) {
            // WRAPPER_METHODS is populated now, so the nested call back into this method is a no-op
            this.createTypedInterfaceFile (true);
        }
    }

    createGoWrappers(exchange: string, path: string, wrappers: any[], ws: boolean | 'prediction' = false): string {
        // ast-transpiler drops the `= {}` default of a type-annotated params bag, which would
        // emit it as a required positional arg ahead of the variadic options
        restoreParamsBagInitializers(wrappers);
        const isPrediction = (ws === 'prediction');
        const isWs = (ws === true);
        const methodsList = new Set(wrappers.map(wrapper => wrapper.name));
        const missingMethods = INTERFACE_METHODS.filter(method => !methodsList.has(method));
        const isAlias = this.isAlias(exchange);
        let wrappersIndented = joinGoDeclarations (wrappers.map(wrapper => this.createWrapper(exchange, wrapper, ws)));
        if (isWs && path === GLOBAL_WRAPPER_FILE) {
            return '';
        }
        // BaseExchangeTyped mirrors ExchangeTyped but embeds only *BaseExchange and carries only the
        // base unified methods (never the 62 symbol-based ones). Prediction venues delegate their
        // inherited base methods to it, so the 62 stay off the prediction API. Reuse the ExchangeTyped
        // wrapper bodies with the base subset, rewriting the receiver and accessor.
        if (exchange === 'Exchange' && !isWs) {
            const baseTypedWrappers = joinGoDeclarations (wrappers
                .filter ((wrapper: any) => !this.exchangeTierMethods.has (wrapper.name))
                .map ((wrapper: any) => this.createWrapper (exchange, wrapper, ws)))
                .replace (/func \(this \*ExchangeTyped\)/g, 'func (this *BaseExchangeTyped)')
                .replace (/this\.Exchange\./g, 'this.BaseExchange.');
            if (baseTypedWrappers !== '') {
                // the base subset is appended after the exchange-tier wrappers: one blank line
                // when it opens with a doc comment, adjacent otherwise
                wrappersIndented = wrappersIndented + (goDeclStartsWithComment (baseTypedWrappers) ? '\n\n' : '\n') + baseTypedWrappers;
            }
        }

        let missingMethodsWrappers = '';
        if (exchange !== 'Exchange') {
            this.requireBaseMethodsMetadata ();
            if (!WRAPPER_METHODS['Exchange']) {
                throw new Error('Exchange wrapper methods are not defined, please transpile base methods first');
            }
            const loadMarketsHeader = `func (this *${capitalize(exchange)}) LoadMarkets(params ...any) (map[string]MarketInterface, error) `;
            missingMethodsWrappers = this.goSingleStatementFunc (loadMarketsHeader, 'return this.exchangeTyped.LoadMarkets(params...)') + '\n';
            missingMethodsWrappers += joinGoDeclarations (missingMethods.map (m => {
                // for prediction venues, a unified method the venue doesn't override but
                // PredictionExchange declares must emit the prediction-typed wrapper (resolving to
                // the inherited base method on this struct), not the crypto-typed exchangeTyped fallback
                if (this.isPrediction) {
                    const predMethod = this.predictionBaseMethodsTypes.find ((w: any) => w.name === m);
                    if (predMethod) {
                        return this.createWrapper (exchange, predMethod, ws);
                    }
                    // the 62 symbol-based trading methods live only on the Exchange tier (not
                    // PredictionExchange), so prediction venues must not expose them — this keeps the Go
                    // prediction API in line with TS/C#/Java and with the Python/PHP tier-split.
                    if (this.exchangeTierMethods.has (m)) {
                        return '';
                    }
                }
                return this.createMissingMethodWrapper(exchange, m,  WRAPPER_METHODS['Exchange'][m]);
            }));
        }

        if (exchange !== 'Exchange') {
            // the typed methods are appended to the exchange's own file by createGoExchange; only
            // the method bodies are produced here. Aliases and ws exchanges embed a struct that
            // already carries the full typed surface, so they get just their own overrides.
            const needsTypedBase = this.needsTypedBase (exchange, ws);
            let section = [
                '',
                '// typed methods',
                wrappersIndented,
                // gofmt puts one blank line between the last wrapper and the doc comment group of
                // the base-fallback wrappers (`min = 2` in go/printer declList)
                '',
                needsTypedBase ? '// missing typed methods from base' : '',
                needsTypedBase ? '// nolint' : '',
                needsTypedBase ? missingMethodsWrappers : '',
            ].join('\n');
            if (ws || this.isPrediction) {
                section = this.qualifyTypedSection (section, wrappers, missingMethods);
            }
            return section;
        }

        const exchangeStruct = [
            // ExchangeTyped embeds the concrete *Exchange (which itself embeds BaseExchange), so it
            // exposes both the base methods and the 62 symbol-based trading methods — regular venues
            // delegate their inherited unified methods here. Prediction venues use BaseExchangeTyped
            // (base methods only) instead, so the 62 stay off the prediction API.
            `type ExchangeTyped struct {`,
            `\t*Exchange`,
            `}`,
            ``,
            `type BaseExchangeTyped struct {`,
            `\t*BaseExchange`,
            `}`
        ].join('\n');

        const newMethod = [
            'func NewExchangeTyped(exchangePointer *Exchange) *ExchangeTyped {',
            `\treturn &ExchangeTyped{`,
            `\t\tExchange: exchangePointer,`,
            `\t}`,
            '}',
            '',
            '// NewBaseExchangeTyped wraps a bare *BaseExchange (used by prediction venues, which',
            '// embed BaseExchange via PredictionExchange rather than the concrete Exchange). It exposes',
            '// the base unified methods only — never the 62 symbol-based trading methods.',
            'func NewBaseExchangeTyped(base *BaseExchange) *BaseExchangeTyped {',
            `\treturn &BaseExchangeTyped{`,
            `\t\tBaseExchange: base,`,
            `\t}`,
            '}',
            '',
            'func (this *ExchangeTyped) LoadMarkets(params ...any) (map[string]MarketInterface, error) {',
            `\tvar res AsyncResult[map[string]MarketInterface] = AwaitResult(NewMarketsMap, this.Exchange.LoadMarkets${GO_ASYNC_SUFFIX}(params...))`,
            '\tif res.Err != nil {',
            '\t\treturn nil, res.Err',
            '\t}',
            '\treturn res.Value, nil',
            '}',
            '',
            'func (this *BaseExchangeTyped) LoadMarkets(params ...any) (map[string]MarketInterface, error) {',
            `\tvar res AsyncResult[map[string]MarketInterface] = AwaitResult(NewMarketsMap, this.BaseExchange.LoadMarkets${GO_ASYNC_SUFFIX}(params...))`,
            '\tif res.Err != nil {',
            '\t\treturn nil, res.Err',
            '\t}',
            '\treturn res.Value, nil',
            '}',
        ].join('\n');

        const file = [
            'package ccxt',
            '',
            exchangeStruct,
            '',
            newMethod,
            '',
            ...this.createGeneratedHeader().filter (line => line !== ''),
            '',
            wrappersIndented,
            // blank line before the doc comment group of the base-fallback wrappers, as gofmt
            // spaces every doc-commented top-level declaration (go/printer declList min = 2)
            '',
            '// missing typed methods from base',
            '//nolint',
            missingMethodsWrappers,
        ].join('\n');
        log.magenta ('→', (path as any).yellow);

        this.writeGeneratedOnce (path, file);
        return '';
    }

    // A non-alias REST exchange embeds only the base Exchange, which carries no typed methods, so
    // it needs an exchangeTyped delegate for the unified methods it does not override. Aliases embed
    // their parent and ws exchanges embed their REST twin — both already typed, so promotion covers them.
    needsTypedBase (exchange: string, ws: boolean | 'prediction' = false): boolean {
        return (ws !== true) && !this.isAlias (exchange);
    }

    // ccxt.-qualify the base package names inside a typed section emitted into package ccxtpro /
    // ccxtprediction, keeping the prediction-local option structs unqualified.
    qualifyTypedSection (section: string, wrappers: any[], missingMethods: string[]): string {
        // copy — extractTypeAndFuncNames returns a CACHED Set; mutating it below would
        // corrupt the cache for every later exchange/call
        const baseNames = new Set (this.extractTypeAndFuncNames(EXCHANGES_FOLDER));
        if (this.isPrediction) {
            // keep renamed-param option structs unqualified so the wrapper binds to the local
            // struct (with `Outcome`) rather than the ccxt base struct. covers both methods THIS
            // exchange defines AND unified methods it inherits from PredictionExchange (emitted as
            // typed wrappers above) — both need the prediction-local option struct.
            const localMethodNames = wrappers.map ((w: any) => w.name)
                .concat (missingMethods.filter ((m: string) => this.predictionBaseMethodsTypes.some ((w: any) => w.name === m)));
            for (const methodName of localMethodNames) {
                const localNames = predictionLocalOptionStructs.get(capitalize(methodName));
                if (localNames !== undefined) {
                    for (const name of localNames) {
                        baseNames.delete(name);
                    }
                }
            }
        }
        return this.addPackagePrefix(section, baseNames, 'ccxt');
    }

    transpileErrorHierarchy (force = true) {

        const errorHierarchyFilename = './js/src/base/errorHierarchy.js';
        const errorHierarchyPath = `${__dirname}/.${errorHierarchyFilename}`;

        if (skipUpToDateStage ('go', 'error hierarchy', force, [ errorHierarchyFilename ], [ ERRORS_FILE ])) {
            return;
        }

        let js = fs.readFileSync (errorHierarchyPath, 'utf8');

        js = this.regexAll (js, [
            // [ /export { [^\;]+\s*\}\n/s, '' ], // new esm
            [ /\s*export default[^\n]+;\n/g, '' ],
            // [ /module\.exports = [^\;]+\;\n/s, '' ], // old commonjs
        ]).trim ();

        const message = 'Transpiling error hierachy →';
        const root = errorHierarchy['BaseError'];

        // a helper to generate a list of exception class declarations
        // properly derived from corresponding parent classes according
        // to the error hierarchy

        function intellisense (map: any, parent: any, generate: any, classes: any) {
            function* generator(map: any, parent: any, generate: any, classes: any): any {
                for (const key in map) {
                    yield generate (key, parent, classes);
                    yield* generator (map[key], key, generate, classes);
                }
            }
            return Array.from (generator (map, parent, generate, classes));
        }

        const errorNames: string[] = [];
        function GoMakeErrorFile (name: string, parent: any) {
            errorNames.push(name);
            const exception =
`func ${name}(v ...any) error {
\treturn NewError("${name}", v...)
}`;
            return exception;
        }

        const goErrors = intellisense (root as any, 'BaseError', GoMakeErrorFile, undefined);


        // createError function
        const caseStatements = errorNames.map(error => {
            return`\tcase "${error}":
\t\treturn ${error}(v...)`;
        });

        const functionDecl = `func CreateError(err string, v ...any) error {
\tswitch err {
${caseStatements.join('\n')}
\tdefault:
\t\treturn NewError(err, v...)
\t}
}`;

    // gofmt aligns the type column of a const block to the widest name + 1 (tabwriter)
    const constNameColumn = Math.max (...errorNames.map ((error) => (error + 'ErrType').length)) + 1;
    const constStatements = errorNames.map(error => {
        return`\t${(error + 'ErrType').padEnd (constNameColumn)}ErrorType = "${error}"`;
    });

    const constDecl =`const (
${constStatements.join('\n')}
)`;

        const goBodyIntellisense = 'package ccxt\n' + this.createGeneratedHeader().join('\n') + '\n' + goErrors.join ('\n') + '\n' + functionDecl + '\n\n' + constDecl + '\n';
        if (fs.existsSync (ERRORS_FILE)) {
            log.bright.cyan (message, (ERRORS_FILE as any).yellow);
            overwriteFileAndFolder (ERRORS_FILE, goBodyIntellisense);
        }

        log.bright.cyan (message, (ERRORS_FILE as any).yellow);

    }

    // The base-methods pass does double duty: it writes exchange_generated.go /
    // exchange_wrappers.go AND it registers the module-level WRAPPER_METHODS metadata that
    // createGoWrappers() and createTypedInterfaceFile() need (both throw without it). So the
    // mtime gate can only skip it when nothing else in this process needs that metadata —
    // any stage that does calls requireBaseMethodsMetadata() below, which transpiles it on
    // demand, ignoring the gate.
    transpileBaseMethods(baseExchangeFile: string, isWs = false, force = true) {
        // `exchanges.json` is a real input for the typed interface / dynamic instance stages
        // that reuse this stage's metadata, so adding/removing an exchange must invalidate it
        // even when ts/src/base/Exchange.ts did not change
        if (skipUpToDateStage ('go', 'base methods', force, [
            baseExchangeFile,
            './ts/src/base/types.ts',
            './exchanges.json',
        ], isWs ? [ BASE_METHODS_FILE ] : [ BASE_METHODS_FILE, GLOBAL_WRAPPER_FILE ])) {
            // safeOptionsStructFile() dumps goTypeOptions wholesale, and the base pass is what
            // fills it with the base-Exchange option structs. Skipping it here would rewrite
            // exchange_wrapper_structs.go without them, so reuse the same "keep the previous
            // full run" guard the per-exchange gate uses.
            this.skippedUnchangedExchanges = true;
            return;
        }
        log.bright.cyan ('Transpiling base methods →', baseExchangeFile.yellow, BASE_METHODS_FILE.yellow);
        const goExchangeBase = BASE_METHODS_FILE;
        const delimiter = 'METHODS BELOW THIS LINE ARE TRANSPILED FROM TYPESCRIPT'

        // to go
        // const tsContent = fs.readFileSync (baseExchangeFile, 'utf8');
        // const delimited = tsContent.split (delimiter)
        const baseMethods = VIRTUAL_BASE_METHODS;
        const allVirtual = Object.keys(baseMethods);
        // A full --rest-and-ws run reaches this method three times with the same source file
        // (REST, the recursive prediction pass, and WS), and each one used to pay a fresh
        // transpile of the 9.7k-line Exchange.ts plus the overload-strip temp file. The
        // result is a pure function of `baseExchangeFile` (`wrapCallMethods` is the same
        // constant list every time and the source cannot change mid-process), so transpile
        // it once and replay the emit + wrapper side effects from the cached result.
        let baseFile = this._baseMethodsTranspileCache[baseExchangeFile];
        if (!baseFile) {
            this.transpiler.goTranspiler.wrapCallMethods = allVirtual;
            const strippedBaseFile = writeOverloadStrippedFile (baseExchangeFile);
            baseFile = this.transpiler.transpileGoByPath(strippedBaseFile);
            removeOverloadStrippedFile (strippedBaseFile, baseExchangeFile);
            this.transpiler.goTranspiler.wrapCallMethods = [];
            this._baseMethodsTranspileCache[baseExchangeFile] = baseFile;
        }
        let baseClass = baseFile.content as any; // remove this later

        // capture the 62 symbol-based method names from the TS `Exchange extends BaseExchange` tier,
        // so the wrappers keep them on ExchangeTyped (regular venues) and off prediction venues.
        const tsRaw = fs.readFileSync (baseExchangeFile, 'utf8');
        const exTierMatch = tsRaw.match (/export default class Exchange extends BaseExchange \{([\s\S]*?)\n\}/);
        this.exchangeTierMethods = new Set ();
        if (exTierMatch) {
            const methodNameRe = /^ {4}(?:async )?([a-zA-Z][a-zA-Z0-9]*) \(/gm;
            let mm;
            while ((mm = methodNameRe.exec (exTierMatch[1])) !== null) {
                this.exchangeTierMethods.add (mm[1]);
            }
        }

        const syncMethods = allVirtual.filter(elem => !baseMethods[elem]);
        const asyncMethods = allVirtual.filter(elem => baseMethods[elem]);

        const syncRegex = new RegExp(`<-this\\.callInternal\\("(${syncMethods.join('|')})"(?:, (.+))?\\)`, 'gm');
        // console.log(syncRegex)
        // baseClass = baseClass.replace(syncRegex, 'this.DerivedExchange.$1($2)');
        baseClass = baseClass.replace(syncRegex, (_match: any, p1: string, p2: string) => {
            const capitalizedMethod = capitalize(p1);
            return `this.DerivedExchange.${capitalizedMethod}(${p2 ?? ''})`;
        });

        const asyncRegex = new RegExp(`<-this\\.callInternal\\("(${asyncMethods.join('|')})"(?:, (.+))?\\)`, 'gm');
        // console.log(asyncRegex)
        // baseClass = baseClass.replace(asyncRegex, '<-this.DerivedExchange.$1($2)');
        baseClass = baseClass.replace(asyncRegex, (_match: any, p1: string, p2: string) => {
            const capitalizedMethod = capitalize(p1);
            return `<-this.DerivedExchange.${capitalizedMethod}${GO_ASYNC_SUFFIX}(${p2 ?? ''})`;
        });
        // create wrappers with specific types
        this.createGoWrappers('Exchange', GLOBAL_WRAPPER_FILE, baseFile.methodsTypes || [], isWs);

        // const exchangeMethods = wrapperMethods['Exchange'];
        // const sortedList = exchangeMethods.sort((a, b) => a.localeCompare(b));
        // sortedList.forEach( i => {
        //     console.log(i)
        // });


        // the `[ value, params ]` tuple helpers return a concrete `[]any` (see
        // coerceTupleHelperSignatures) so the destructuring holders can carry the real slice type
        baseClass = this.coerceTupleHelperSignatures (baseClass);

        // custom transformations needed for go
        baseClass = this.regexAll (baseClass, [
            [/\=\snew\s/gm, "= "],
            // baseClass = baseClass.replaceAll(/(?<!<-)this\.callInternal/gm, "<-this.callInternal");
            [/callDynamically\(/gm, 'this.CallDynamically('], //fix this on the transpiler
            [/throwDynamicException\(/gm, 'ThrowDynamicException('], //fix this on the transpiler
            [/currentRestInstance any,/g, "currentRestInstance Exchange,"],
            [/parentRestInstance any,/g, "parentRestInstance Exchange,"],
            [/client any,/g, "client *Client,"],
            [/this.Number = String/g, 'this.Number = "string"'],
            [/(\w+)(\.StoreArray\(.+\))/gm, '($1.(*OrderBookSide))$2'], // tmp fix for c#
            [/ch <- nil\s+\/\/.+/g, ''],

            [/currentRestInstance Exchange, parentRestInstance Exchange/g, 'currentRestInstance *Exchange, parentRestInstance *Exchange'],
            // --- WebSocket related fixes specific to **Go** ----------------------
            // 1) Access the strongly-typed field instead of dynamic lookup.
            ["client.futures", "client.Futures"],
            // 2) Remove unresolved C# artefacts concerning `number` typing – the
            //    Go layer already normalises this earlier to a literal string.
            ["((object)this).number = String;", "this.Number = \"string\""],
            ["((object)this).number = float;", "this.Number = 0"],
            // 3) Promise-style resolver calls don't exist in Go – comment them.
            ["client.resolve", "// client.resolve"],
            ["this.number = Number;", "this.number = typeof(float);"], // tmp fix for c#
            // 4) Translate the C# `throw new …` syntax into the helper used by Go.
            //    The replacement is a complete Go statement: gofmt never emits a `;`
            //    terminator, so none is written here either.
            ["throw NewGetValue(broad, broadKey)(((string)message));", "ThrowDynamicException(getValue(broad, broadKey), message)"],
            ["throw NewGetValue(exact, str)(((string)message));", "ThrowDynamicException(getValue(exact, str), message)"],
            ["throw NewGetValue(exact, str)(message);", "ThrowDynamicException(getValue(exact, str), message)"],
            // 5) Fix error constructors - remove "New" prefix
            [/NewNotSupported/g, 'NotSupported'],
            [/NewInvalidNonce/g, 'InvalidNonce'],
            // WS fixes
            [/\(object client,/gm, '(WebSocketClient client,'],
            [/Dictionary<string,object>\)client\.futures/gm, 'Dictionary<string, ccxt.Exchange.Future>)client.futures'],
            [/(\b\w*)RestInstance.describe/g, "(\(Exchange\)$1RestInstance).describe"],
            [/GetDescribeForExtendedWsExchange\(currentRestInstance \*Exchange, parentRestInstance \*Exchange/g, 'GetDescribeForExtendedWsExchange(currentRestInstance Describer, parentRestInstance Describer'],
            [/(var \w+ any) = client.Futures/g, '$1 = (client.(Client)).Futures'], // tmp fix for go not needed after ws-merge
            // Symbols is a typed []string field on BaseExchange; TS `this.symbols = []` transpiles
            // to an untyped []any{} literal which cannot be assigned to the typed field.
            [/this\.Symbols = \[\]any\{\}/g, 'this.Symbols = []string{}'],
            // setMarkets indexes each parsed row pointer-free (markets_by_id keeps the row itself)
            [/(\breturn )DerefScalar\(marketValues\[i\]\)/g, '$1MarketTyped(marketValues[i])'],
            [/\bvalues = append\(values, market\)/g, 'values = append(values, MarketTyped(market))'],
            // ParseToInt's TS body is `parseInt(parseFloat(numberToString(number)))` and the
            // hand-written ParseInt always returns int64 (math.MinInt64 when the conversion
            // fails), so the method never hands back nil. Name the concrete type here (the
            // only place this signature is emitted) so generated locals can be declared
            // `int64` instead of `any` — see the ParseToInt entry in build/go-local-types.js.
            [/func\s+\(this \*BaseExchange\)\s+ParseToInt\(number any\)\s+any\s*\{/g, 'func (this *BaseExchange) ParseToInt(number any) int64 {'],
            // Fix setMarketsFromExchange parameter type (base methods now hang off *BaseExchange)
            [/func\s+\(this \*BaseExchange\)\s+SetMarketsFromExchange\(sourceExchange any\)/g, 'func (this *BaseExchange) SetMarketsFromExchange(sourceExchange *BaseExchange)'],
            // The `[value, params]` tuple helpers of ts/src/base/Exchange.ts (handleOptionAndParams/2,
            // handleParamString/2, handleMarketTypeAndParams) return a TS tuple, which the printer can
            // only express as `any`. Coerce those declarations to `[]any` so the destructuring holder
            // (see CCXT_GO_ARRAY_BINDING_HOLDERS in build/go-local-types.js) is a real slice instead of
            // an `any` box — the same shape #30356's C# retypeDestructuringTemp gave the same holder.
            // The proof (every return path of every declaration, the two Okx/Deepcoin overrides
            // included, delegates to a `[]any{...}` literal) and the census checker live in
            // coerceTupleHelperSignatures above.
            // the empty `class Exchange extends BaseExchange {}` transpiles to a thin struct +
            // a NewExchange constructor; both are hand-written in exchange.go (where NewExchange
            // returns ICoreExchange so the base tests can type-assert `.(*ccxt.Exchange)`), so drop
            // the auto-generated duplicates to avoid redeclaration.
            [/type Exchange struct \{\s*BaseExchange\s*\}/g, ''],
            [/func NewExchange\(\) \*Exchange \{[\s\S]*?\n\}/g, ''],
            // fine split: the 62 symbol-based trading methods (createOrder/fetchTicker/fetchOrders/
            // cancelOrder/watch*/… + convenience wrappers) live in `export default class Exchange
            // extends BaseExchange` in the TS source and transpile with a *Exchange receiver, which we
            // keep (matching TS/C#/Java). They hang off *Exchange (embedded by regular venues) and NOT
            // *BaseExchange, so prediction venues — which embed BaseExchange via PredictionExchange —
            // never inherit them. The concrete `Exchange` struct is hand-written in exchange.go.
            // loadOrderBook is the exception: it is hand-written on *Exchange in exchange.go (it uses
            // WS cache primitives the transpiler cannot emit), so drop the transpiled *Exchange copy to
            // avoid a redeclaration (and its untranspilable body). loadOrderBook is the first method of
            // the Exchange class, always followed by another `func (this *Exchange)`.
            // Async cores are emitted as a trampoline + unexported body PAIR
            // (`LoadOrderBook` then `loadOrderBookBody`), so the cut has to run to the next
            // EXPORTED method — stopping at the lowercase body would leave that body behind,
            // orphaned and still untranspilable.
            [new RegExp(`func\\s+\\(this \\*Exchange\\)\\s+LoadOrderBook${GO_ASYNC_SUFFIX}\\([\\s\\S]*?(?=\\nfunc\\s+\\(this \\*Exchange\\)\\s+[A-Z])`, 'g'), ''],
            // The rest of the Safe* family enters Go as imported free functions (class
            // properties above the marker) and gets hand-written pointer-returning wrappers in
            // exchange_safe.go. safeBool/safeBool2/safeBoolN are the exception: real TS methods
            // below the marker, so the printer emits `any` copies here. Drop them so the
            // hand-written *bool twins (same pointer/`derefScalar` layer) take over — otherwise
            // Go reports a duplicate method. A rename in Exchange.ts makes this regex miss; the
            // copy then comes back as `any` and the declarations the classifier types `*bool`
            // fail the build loudly instead of drifting silently.
            [new RegExp ('func\\s+\\(this \\*BaseExchange\\)\\s+SafeBool(?:N|2)?\\([^)]*\\)\\s+any\\s*\\{[\\s\\S]*?(?=\\nfunc )', 'g'), ''],
            // `any` locals that capture a SafeBool* pointer must carry the plain value: this
            // file does not go through createGoExchange's unwrap pass, and its `any` locals are
            // still compared raw (`postOnly != true` in IsPostOnly), which an interface holding
            // a *bool always satisfies. Bool family only -- the other Safe* families' locals in
            // this file are consumed through IsEqual/EvalTruthy and need no unwrap.
            [/(var \w+ any = )(this\.SafeBool(?:2|N)?\((?:[^()]|\([^()]*\))*\))/g, '$1DerefScalar($2)'],
            // the 62 dispatch a few other 62-methods through this.DerivedExchange for virtual override
            // (e.g. editLimitOrder→editOrder, fetchTicker→fetchTickers, fetchOrderStatus→fetchOrder).
            // Those callees are NOT on PredictionExchange, so they are trimmed from IDerivedExchange
            // (see go/v4/exchange_interface.go) to let prediction cores satisfy it. These dispatch
            // sites live only inside the 62 (regular-only code that prediction never compiles), so we
            // type-assert to the per-method interface (I<Method>), which the regular venue satisfies.
            [new RegExp(`this\\.DerivedExchange\\.(EditOrder|FetchOrder|FetchTickers|CancelOrderWs|CreateOrderWs|FetchOrdersWs|FetchTickersWs|FetchPositionsHistory)${GO_ASYNC_SUFFIX}\\(`, 'g'), `this.DerivedExchange.(I$1).$1${GO_ASYNC_SUFFIX}(`],
            // SafeNumber / SafeNumber2 / SafeNumberN / SafeNumberOmitZero are hand-written in
            // go/v4/exchange_safe.go with the honest *float64 return the printer cannot emit (the
            // TS `Num` annotation prints as `any`), so drop the transpiled copies to avoid a
            // redeclaration — same shape as the loadOrderBook drop above. The classifier in
            // build/go-local-types.js types locals from the hand-written signature.
            [new RegExp(`func\\s+\\(this \\*BaseExchange\\)\\s+SafeNumber(?:2|N|OmitZero)?\\([^{]*\\{[\\s\\S]*?\\n\\}\\n`, 'g'), ''],
            // handleMarketType/SubType/OptionString(2)/MarginMode/OptionBool(2)/OptionInteger(2)AndParams are hand-written in
            // exchange_market_type.go with a (*string, map[string]any) result pair
            [new RegExp(`func\\s+\\(this \\*BaseExchange\\)\\s+(?:Handle(?:MarketType|SubType|OptionString|MarginMode)AndParams|HandleOption(?:Bool|Integer)AndParams2?|HandleOptionStringAndParams2|HandleUntilOption)\\([^{]*\\{[\\s\\S]*?\\n\\}\\n`, 'g'), ''],
            // marketSymbols is hand-written in exchange_market_type.go with its []string result
            [new RegExp('func\\s+\\(this \\*BaseExchange\\)\\s+MarketSymbols\\([^{]*\\{[\\s\\S]*?\\n\\}\\n', 'g'), ''],
            // implodeHostname is hand-written in go/v4/exchange_misc.go with its `string` return
            [new RegExp('func\\s+\\(this \\*BaseExchange\\)\\s+ImplodeHostname\\([^{]*\\{[\\s\\S]*?\\n\\}\\n', 'g'), ''],
        ]);

        // SafeCurrencyCode / SafeSymbol carry the `*string` shape the hand-written Safe*
        // accessors already use (see coerceTypedStringAccessors), so the locals initialised
        // from them can be typed and the printer's pointer-aware comparisons apply.
        baseClass = this.coerceTypedStringAccessors (baseClass);
        baseClass = this.coerceStringPtrMethods (baseClass, CCXT_GO_STRING_PTR_METHOD_NAMES, true);
    baseClass = this.coerceTypedMapAccessors (baseClass);

        const jsDelimiter = '// ' + delimiter;
        const parts = baseClass.split (jsDelimiter);
        if (parts.length > 1) {
            const baseMethods = parts[1];
            const fileHeader = this.getGoImports(undefined).concat([
                this.createGeneratedHeader().join('\n'),
            ]).join("\n");

            const file = goAnyLocalNativeNilCompares (goPointerLocalNativeNilCompares (goBoxedPointerNilCompares (goParamNativeNilCompares (coerceGoBoolMethodReturns (fileHeader + baseMethods + "\n", CCXT_GO_BOOL_METHOD_NAMES), 'IsEqual('), 'IsEqual('), 'IsEqual('), 'IsEqual(');
            // repeated base passes (REST / prediction recursion / WS) emit identical bytes —
            // skip the rewrite of this ~390 KB file after the first
            this.writeGeneratedOnce (goExchangeBase, file);
        }
    }

    transpilePredictionBaseMethods (predictionBaseFile = './ts/src/base/PredictionExchange.ts', registerOnly = false, force = true) {
        // PredictionExchange is the base for prediction-market exchanges; it lives in
        // package ccxt and embeds Exchange. Its methods are transpiled the same way as
        // the base methods (with virtual dispatch through DerivedExchange).
        // named exchange_prediction.go so extractTypeAndFuncNames() (which scans go/v4/exchange*.go)
        // picks up PredictionExchange and the prediction package qualifies it as ccxt.PredictionExchange
        const goPredictionBase = './go/v4/exchange_prediction.go';
        // `registerOnly` writes nothing — it only captures predictionBaseMethodsTypes for this
        // process — so it can never be satisfied by an up-to-date file on disk. It can however
        // be satisfied by an earlier full call in the same process: the recursive prediction
        // pass reaches it right after the main pass already transpiled the same file.
        if (registerOnly && this.predictionBaseMethodsTypes.length) {
            return;
        }
        if (!registerOnly && skipUpToDateStage ('go', 'prediction base methods', force, [
            predictionBaseFile,
            './ts/src/base/Exchange.ts',
            './ts/src/base/types.ts',
        ], [ goPredictionBase ])) {
            return;
        }
        const delimiter = 'METHODS BELOW THIS LINE ARE TRANSPILED FROM TYPESCRIPT'
        const allVirtual = Object.keys(VIRTUAL_BASE_METHODS);
        this.transpiler.goTranspiler.wrapCallMethods = allVirtual;
        const baseFile: any = this.transpiler.transpileGoByPath(predictionBaseFile);
        this.transpiler.goTranspiler.wrapCallMethods = [];
        // capture the signatures so createGoWrappers can emit prediction-typed wrappers for
        // unified methods that a venue inherits rather than overrides (runs in every process
        // that touches prediction, including --prediction where the file write is skipped)
        this.predictionBaseMethodsTypes = baseFile.methodsTypes || [];
        if (registerOnly) {
            return;
        }
        let baseClass = baseFile.content as any;
        const syncMethods = allVirtual.filter (elem => !VIRTUAL_BASE_METHODS[elem]);
        const asyncMethods = allVirtual.filter (elem => VIRTUAL_BASE_METHODS[elem]);
        const syncRegex = new RegExp(`<-this\\.callInternal\\("(${syncMethods.join('|')})"(?:, (.+))?\\)`, 'gm');
        baseClass = baseClass.replace(syncRegex, (_match: any, p1: string, p2: string) => `this.DerivedExchange.${capitalize(p1)}(${p2 ?? ''})`);
        const asyncRegex = new RegExp(`<-this\\.callInternal\\("(${asyncMethods.join('|')})"(?:, (.+))?\\)`, 'gm');
        baseClass = baseClass.replace(asyncRegex, (_match: any, p1: string, p2: string) => `<-this.DerivedExchange.${capitalize(p1)}${GO_ASYNC_SUFFIX}(${p2 ?? ''})`);
        baseClass = this.regexAll (baseClass, [
            [/\=\snew\s/gm, "= "],
            [/callDynamically\(/gm, 'this.CallDynamically('],
            [/throwDynamicException\(/gm, 'ThrowDynamicException('],
            [/NewNotSupported/g, 'NotSupported'],
            // super.method() in the outcome-stub overrides → the embedded BaseExchange
            [/\bbase\./gm, 'this.BaseExchange.'],
            // the base parse loops (parsePredictionTrades→parsePredictionTrade, etc.) must reach the
            // venue override, not the base NotSupported stub. Go has no virtual dispatch on `this`, so
            // route through this.DerivedExchange type-asserted to IPredictionDispatch (these loops only
            // ever run on prediction instances, whose DerivedExchange satisfies it).
            [/this\.(ParsePredictionOrder|ParsePredictionTrade|ParsePredictionPosition)\(/g, 'this.DerivedExchange.(IPredictionDispatch).$1('],
            // `any` locals that capture a SafeBool* pointer must carry the plain value: this
            // file does not go through createGoExchange's unwrap pass, and its `any` locals are
            // still compared raw (`postOnly != true` in IsPostOnly), which an interface holding
            // a *bool always satisfies. Bool family only -- the other Safe* families' locals in
            // this file are consumed through IsEqual/EvalTruthy and need no unwrap.
            [/(var \w+ any = )(this\.SafeBool(?:2|N)?\((?:[^()]|\([^()]*\))*\))/g, '$1DerefScalar($2)'],
        ]);
        // outcome/safeOutcome (: PredictionOutcomeMarket) and parseSearchQueries (: string[]) have no venue override
        baseClass = this.retypeGoMapMethod (baseClass, 'PredictionExchange', 'Outcome', undefined, true);
        baseClass = this.retypeGoMapMethod (baseClass, 'PredictionExchange', 'SafeOutcome', undefined, true);
        baseClass = this.retypeGoMapMethod (baseClass, 'PredictionExchange', 'ParseSearchQueries', undefined, true, '[]any');
        const jsDelimiter = '// ' + delimiter;
        const parts = baseClass.split (jsDelimiter);
        if (parts.length > 1) {
            const methods = parts[1];
            // gofmt indents a struct block with tabs and aligns the type column of every *typed*
            // field at (longest field name + 1); the embedded (typeless) field prints alone and
            // stays out of that alignment. This write never goes through formatGoSource(), so the
            // literal below is emitted pre-aligned.
            const structFields: [string, string][] = [
                [ 'BaseExchange', '' ],
                [ 'Outcomes', 'any' ],
                [ 'Outcomes_by_id', 'any' ],
                [ 'Events', 'any' ],
                [ 'Events_by_slug', 'any' ],
                [ 'ReloadingEvents', 'bool' ],
                [ 'EventsLoading', 'any' ],
            ];
            const fieldTypeColumn = Math.max (...structFields.filter ((f) => f[1]).map ((f) => f[0].length)) + 1;
            const structDef = [
                'type PredictionExchange struct {',
                ...structFields.map ((f) => f[1] ? '\t' + f[0].padEnd (fieldTypeColumn) + f[1] : '\t' + f[0]),
                '}',
                '',
            ].join('\n');
            const fileHeader = this.getGoImports(undefined).concat([
                this.createGeneratedHeader().join('\n'),
            ]).join("\n");
            // prediction exchanges live in package ccxtprediction and can only reach exported
            // members of the embedded base — expose the implicit-api dispatcher (called by the
            // generated _api.go files) and the describe-deep-extend helper as exported shims
            const shims = [
                '',
                'func (this *PredictionExchange) CallEndpointAsync(endpointName string, args ...any) <-chan any {',
                '\treturn this.callEndpointAsync(endpointName, args...)',
                '}',
                '',
            ].join('\n');
            // `shims` ends with the single trailing newline gofmt wants at EOF
            // (the caller-fed `any` parameters keep the helper here too — see goParamNativeNilCompares)
            const file = goAnyLocalNativeNilCompares (goPointerLocalNativeNilCompares (goBoxedPointerNilCompares (goParamNativeNilCompares (fileHeader + '\n' + structDef + methods + shims, 'IsEqual('), 'IsEqual('), 'IsEqual('), 'IsEqual(');
            // this is the one generated .go write that does not go through
            // overwriteFileAndFolder()/formatGoSource(), so guard its async cores here
            // (and add the element-access assertions formatGoSource would have added)
            fs.writeFileSync (goPredictionBase, assertTypedElementAccess (guardMultiSendCores (normalizeGoFileHeader (file))));
            log.green ('Transpiled prediction base methods to', (goPredictionBase as any).yellow)
        }
    }


    createDynamicInstanceFile(ws = false, prediction = false, force = true){
        const subFolder = ws ? '/pro' : (prediction ? '/prediction' : '');
        const dynamicInstanceFile = `./go/v4${subFolder}/exchange_dynamic.go`;
        // this file is a pure function of the exchange id lists in exchanges.json
        if (skipUpToDateStage ('go', `dynamic instance file (${subFolder || '/v4'})`, force, [ './exchanges.json' ], [ dynamicInstanceFile ])) {
            return;
        }
        const exchanges = ws ? exchangeIdsWs : (prediction ? predictionIds : ['Exchange'].concat(exchangeIds));
        const externalPackage = ws || prediction; // packages outside go/v4 import the base ccxt package
        const caseStatements = exchanges.map(exchange => {
            if (exchange === 'Exchange') {
                return`\tcase "Exchange":
\t\tExchangeItf := NewExchange()
\t\tExchangeItf.Init(exchangeArgs)
\t\treturn ExchangeItf, true`;
            }
            return`\tcase "${exchange}":
\t\t${exchange}Itf := New${capitalize(exchange)}(exchangeArgs)
\t\treturn ${exchange}Itf, true`;
        });

        const functionDecl = `
func DynamicallyCreateInstance(exchangeId string, exchangeArgs map[string]any) (${externalPackage ? 'ccxt.' : ''}ICoreExchange, bool) {
\tswitch exchangeId {
${caseStatements.join('\n')}
\tdefault:
\t\treturn nil, false
\t}
}
`;
        const file = [
            `package ccxt${ws ? 'pro' : (prediction ? 'prediction' : '')}`,
            '',
            ...(externalPackage ? [ 'import ccxt "github.com/ccxt/ccxt/go/v4"', '' ] : []),
            ...this.createGeneratedHeader().filter (line => line !== ''),
            '',
            functionDecl,
        ].join('\n') + '\n';

        fs.writeFileSync (dynamicInstanceFile, formatGoSource (dynamicInstanceFile, normalizeGoFileHeader (alignGoTrailingComments (file))));
    }


    createTypedInterfaceFile(force = true){
        if (skipUpToDateStage ('go', 'typed interface file', force, [
            './exchanges.json',
            './ts/src/base/Exchange.ts',
            './ts/src/base/types.ts',
        ], [ TYPED_INTERFACE_FILE ])) {
            return;
        }
        this.creatingTypedInterface = true;
        try {
            this.requireBaseMethodsMetadata ();
        } finally {
            this.creatingTypedInterface = false;
        }
        if (!WRAPPER_METHODS['Exchange']) {
            throw new Error('Exchange wrapper methods are not defined, please transpile base methods first');
        }
        const exchanges = ['exchange'].concat(exchangeIds);

        const caseStatements = exchanges.map(exchange => {
            const struct = exchange === 'exchange' ? 'ExchangeTyped' : capitalize(exchange);
            const args = exchange === 'exchange' ? 'nil' : 'options';
            return`\tcase "${exchange}":
\t\titf := New${struct}(${args})
\t\treturn itf`;
        });

        const functionDecl = `
func CreateExchange(exchangeId string, options map[string]any) IExchange {
\texchangeId = strings.ToLower(exchangeId)
\tswitch exchangeId {
${caseStatements.join('\n')}
\tdefault:
\t\treturn nil
\t}
}
`;
        const interfaceMethods = Object.keys(WRAPPER_METHODS['Exchange']).map(method => {
            const methodInfo = WRAPPER_METHODS['Exchange'][method];
            if (!INTERFACE_METHODS.includes(method)) {
                return '';
            }
            return methodInfo.interface;
        }).filter(e => !!e);

        const interfaceDecl = `
type IExchange interface {
\tIBaseExchange
\t${interfaceMethods.join('\n\t')}
}`;

        const file = [
            'package ccxt',
            '',
            'import "strings"',
            '',
            ...this.createGeneratedHeader().filter (line => line !== ''),
            '',
            interfaceDecl,
            '',
            functionDecl,
        ].join('\n') + '\n';

        fs.writeFileSync (TYPED_INTERFACE_FILE, formatGoSource (TYPED_INTERFACE_FILE, normalizeGoFileHeader (alignGoTrailingComments (file))));
    }

    // ----- WS specific ----- //
    createWsTypedInterfaceFile(force = true){
        // a pure function of the ws exchange id list in exchanges.json
        if (skipUpToDateStage ('go', 'ws typed interface file', force, [ './exchanges.json' ], [ TYPED_WS_INTERFACE_FILE ])) {
            return;
        }

        const interfaceWs = [
            'type IExchange interface {',
            '\tccxt.IExchange',
            '}'
        ].join('\n');

        const caseStatements = exchangeIdsWs.map(exchange => {
            const struct = capitalize(exchange);
            const args = 'options';
            return`\tcase "${exchange}":
\t\titf := New${struct}(${args})
\t\treturn itf`;
        });

        const functionDecl = `
func CreateExchange(exchangeId string, options map[string]any) ccxt.IExchange {
\texchangeId = strings.ToLower(exchangeId)
\tswitch exchangeId {
${caseStatements.join('\n')}
\tdefault:
\t\treturn nil
\t}
}
`;

        const file = [
            'package ccxtpro',
            '',
            'import (',
            // gofmt sorts the specs of an import block by import path (and indents with a tab)
            '\tccxt "github.com/ccxt/ccxt/go/v4"',
            '\t"strings"',
            ')',
            '',
            this.createGeneratedHeader().join('\n'),
            // no extra blank line: the generated header already ends with one
            interfaceWs,
            '',
            functionDecl,
        ].join('\n') + '\n';

        fs.writeFileSync (TYPED_WS_INTERFACE_FILE, formatGoSource (TYPED_WS_INTERFACE_FILE, normalizeGoFileHeader (alignGoTrailingComments (file))));
    }


    camelize(str: string) {
        var res =  str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
          if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
          return index === 0 ? match.toLowerCase() : match.toUpperCase();
        });
        return res.replaceAll('-', '');
      }


    getGoExamplesWarning() {
        return [
            '',
            '    // !!Warning!! This example was automatically transpiled',
            '    // from the TS version, meaning that the code is overly',
            '    // complex and illegible compared to the code you would need to write',
            '    // normally. Use it only to get an idea of how things are done.',
            '    // Additionally always choose the typed version of the method instead of the generic one',
            '    // (e.g. CreateOrder (typed) instead of createOrder (generic)',
            ''
        ].join('\n');
    }

    transpileExamples () {
        return;
        // currently disabled!, the generated code is too complex and illegible
        const transpileFlagPhrase = '// AUTO-TRANSPILE //';

        // @ts-expect-error
        const allTsExamplesFiles = fs.readdirSync (EXAMPLES_INPUT_FOLDER).filter((f) => f.endsWith('.ts'));
        for (const filenameWithExtenstion of allTsExamplesFiles) {
            // @ts-expect-error
            const tsFile = path.join (EXAMPLES_INPUT_FOLDER, filenameWithExtenstion);
            let tsContent = fs.readFileSync (tsFile).toString ();
            if (tsContent.indexOf (transpileFlagPhrase) > -1) {
                const fileName = filenameWithExtenstion.replace ('.ts', '');
                log.magenta ('[GO] Transpiling example from', (tsFile as any).yellow);
                const go = this.transpiler.transpileGo(tsContent);

                const transpiledFixed = this.regexAll(
                    go.content,
                    [
                        [/object exchange/, 'Exchange exchange'],
                        [/async public Task example/gm, 'async public Task ' + this.camelize(fileName)],
                        [/(^\s+)object\s(\w+)\s=/gm, '$1var $2 ='],
                        [/^await.+$/gm, ''],
                    ]
                );

                const finalFile = [
                    'using ccxt;',
                    'using ccxt.pro;',
                    'namespace examples;',
                    // this.getGoExamplesWarning(),
                    'partial class Examples',
                    '{',
                    transpiledFixed,
                    '}',
                ].join('\n');
                // @ts-expect-error
                overwriteFileAndFolder (`${EXAMPLES_OUTPUT_FOLDER}/${fileName}.go`, finalFile);
            }
        }
    }

    async transpileWS(force = false, prediction = false) {
        // prediction WS methods now live in the REST prediction classes (no ts/src/prediction/pro)
        if (prediction && !fs.existsSync ('./ts/src/prediction/pro')) {
            return;
        }
        const tsFolder = prediction ? './ts/src/prediction/pro' : './ts/src/pro';

        let inputExchanges =  process.argv.slice (2).filter (x => !x.startsWith ('--'));
        const scopedRun = inputExchanges.length > 0;
        if (inputExchanges === undefined) {
            inputExchanges = exchanges.ws;
        }
        if (prediction && (!inputExchanges || !inputExchanges.length)) {
            inputExchanges = predictionWsIds;
        }
        const wsFolder = prediction ? EXCHANGES_PREDICTION_WS_FOLDER : EXCHANGES_WS_FOLDER;
        const options = { goFolder: wsFolder, exchanges:inputExchanges };
        // const options = { goFolder: EXCHANGES_WS_FOLDER, exchanges:['bitget'] }
        if (scopedRun) {
            force = true; // a scoped run (CI `goTranspiler.ts <exchange> --ws`) always writes, same as the REST path
        }
        // base methods are always needed to populate the wrapper metadata (WRAPPER_METHODS)
        // (when the gate skips it, requireBaseMethodsMetadata() re-reads it on demand)
        this.transpileBaseMethods(TS_BASE_FILE, true, force);
        this.isPrediction = prediction;
        await this.transpileDerivedExchangeFiles (tsFolder, options, '.ts', force, !!(inputExchanges), true );
        this.isPrediction = false;
        if (prediction) {
            // the prediction ws package only emits the derived exchange classes,
            // it reuses the dynamic-instance / typed-interface plumbing of package ccxtpro
            log.bright.green ('Transpiled prediction ws exchanges successfully.');
            return;
        }
        this.createDynamicInstanceFile(true, false, force);
        this.transpileProTypes(force);
        this.createWsTypedInterfaceFile(force);

    }

    async transpileEverything (force = false, baseOnly = false, examplesOnly = false, prediction = false) {

        let exchanges = process.argv.slice (2).filter (x => !x.startsWith ('--'));
        const goFolder = prediction ? EXCHANGES_PREDICTION_FOLDER : EXCHANGES_FOLDER
            , tsFolder = prediction ? './ts/src/prediction' : './ts/src';

        createFolderRecursively (goFolder);
        const transpilingSingleExchange = (exchanges.length === 1); // when transpiling single exchange, we can skip some steps because this is only used for testing/debugging
        if (transpilingSingleExchange) {
            force = true; // when transpiling single exchange, we always force
        }
        if (prediction) {
            if (exchanges.length) {
                const predictionOnly = exchanges.filter ((x: string) => predictionIds.includes (x));
                if (!predictionOnly.length) {
                    // a scoped regular-exchange run has no prediction work —
                    // ts/src/prediction/ has no files for those ids
                    return;
                }
            }
            // a single-exchange prediction transpile would truncate the shared
            // exchange_wrapper_structs.go to that one exchange — the namespace is
            // small, so always emit the full set
            exchanges = predictionIds;
        }
        const options = { goFolder, exchanges };

        this.transpileBaseMethods (TS_BASE_FILE, false, force); // now we always need the baseMethods info
        // the dynamic-instance / typed-interface files belong to package ccxt; the
        // prediction package reuses them and must not regenerate them
        if (!transpilingSingleExchange && !prediction) {
            this.transpilePredictionBaseMethods (undefined, false, force);
            this.createDynamicInstanceFile(false, false, force);
            this.createTypedInterfaceFile(force);
        } else if (prediction) {
            // capture-only: populate predictionBaseMethodsTypes (no ccxt-package file write)
            // so inherited unified methods emit prediction-typed wrappers in this process
            this.transpilePredictionBaseMethods (undefined, true);
        }

        if (!baseOnly && !examplesOnly) {
            this.isPrediction = prediction;
            await this.transpileDerivedExchangeFiles (tsFolder, options, '.ts', force, !!(exchanges.length));
            this.isPrediction = false;
        }

        if (prediction) {
            // the prediction package needs its OWN DynamicallyCreateInstance (over
            // prediction ids); the base one in package ccxt only knows regular ids
            this.createDynamicInstanceFile (false, true, force);
            log.bright.green ('Transpiled prediction exchanges successfully.');
            return;
        }

        if (baseOnly) {
            return;
        }

        if (transpilingSingleExchange) {
            return;
        }

        // full builds also transpile the prediction-market exchanges (ts/src/prediction/)
        await this.transpileEverything (force, false, false, true);

        await this.transpileTests(force);

        this.transpileErrorHierarchy (force);

        log.bright.green ('Transpiled successfully.');
    }

    // default min(2, AP): 2w + shared-Program chunks is within ~10% of 4w (Go often prefers 2).
    // Override with CCXT_TRANSPILE_PROCESSES.
    goWorkerThreads () {
        const n = Number (process.env.CCXT_TRANSPILE_PROCESSES)
        if (n > 0) {
            return Math.floor (n)
        }
        return Math.max (1, Math.min (2, os.availableParallelism ()))
    }

    async webworkerTranspile (allFiles: any[], parserConfig: any) {

        // create worker
        const maxThreads = this.goWorkerThreads ()
        if (!this.piscina) {
            this.piscina = new Piscina({
                filename: resolve(__dirname, 'go-worker.ts'),
                maxThreads,
            });
        }
        const piscina = this.piscina;

        const configKey = JSON.stringify(parserConfig);
        const promises: any = [];
        const now = Date.now();
        // One file per task. `roots` is the FULL stage list on every task so each worker
        // builds ONE sticky ts.Program (build/worker-program-batch.ts) and prints off it.
        for (const file of allFiles) {
            promises.push(piscina.run({transpilerConfig:parserConfig, configKey, roots: allFiles, files: [file]}));
        }
        const workerResult = await Promise.all(promises);
        const elapsed = Date.now() - now;
        log.green ('[ast-transpiler] Transpiled', allFiles.length, 'files in', elapsed, 'ms');
        // Order-preserving flatten: Promise.all is in input order; each task returns one file.
        const flatResult = [];
        for (const res of workerResult) {
            for (const f of (res.files ?? [res.file])) {
                flatResult.push(f);
            }
            this.mergeWorkerGoComments(res.goComments);
        }
        return flatResult;
    }

    mergeWorkerGoComments (workerComments: any) {
        if (!workerComments) {
            return;
        }
        for (const exchangeName in workerComments) {
            const exchangeData = goComments[exchangeName] || (goComments[exchangeName] = {});
            const workerMethods = workerComments[exchangeName];
            for (const methodName in workerMethods) {
                exchangeData[methodName] = workerMethods[methodName];
            }
        }
    }

    safeOptionsStructFile(ws: boolean = false) {
        if (this.isPrediction) {
            // the prediction packages reuse the option structs of package ccxt (the
            // wrapper files reference them with the ccxt. qualifier through
            // addPackagePrefix) — only the option structs of methods that do not
            // exist in package ccxt (e.g. FetchEvents) are emitted locally
            const ccxtNames = this.extractTypeAndFuncNames(EXCHANGES_FOLDER);
            const file = [
                ws ? `package ${PREDICTION_WS_PACKAGE}` : `package ${PREDICTION_PACKAGE}`,
                // gofmt wants exactly one blank line between the package (or import) clause and
                // the generated-header comment; the header string already ends with a newline
                '',
                this.createGeneratedHeader().join('\n'),
            ];
            for (const key in goTypeOptions) {
                // emit param-renamed prediction overrides locally even though a same-named
                // struct exists in base (e.g. FetchTickersOptionsStruct with Outcomes)
                const isLocalOverride = predictionLocalOptionStructs.has(key);
                if (!isLocalOverride && (ccxtNames.has(key + 'Options') || ccxtNames.has(key + 'OptionsStruct'))) {
                    continue;
                }
                // the option-struct strings end with a blank line of their own; drop it before
                // pushing the single separating '' so consecutive decls keep one blank line
                // (gofmt collapses runs of blank lines between top-level decls)
                file.push(goTypeOptions[key].replace (/\n+$/, ''));
                file.push('');
            }
            const folder = ws ? EXCHANGES_PREDICTION_WS_FOLDER : EXCHANGES_PREDICTION_FOLDER;
            fs.writeFileSync (`${folder}/exchange_wrapper_structs.go`, normalizeGoFileHeader (file.join('\n')));
            return;
        }
        const EXCHANGE_OPTIONS_FILE = ws
            ? './go/v4/pro/exchange_wrapper_structs.go'
            : './go/v4/exchange_wrapper_structs.go';

        // gofmt puts one blank line after the package clause, after the import decl and
        // between the generated header comment and the first declaration
        const file = [
            ws ? 'package ccxtpro' : 'package ccxt',
            '',
            ...(ws ? [ 'import ccxt "github.com/ccxt/ccxt/go/v4"', '' ] : []),
            ...this.createGeneratedHeader().filter (line => line !== ''),
            ''
        ];
        // add simple Options
        if (!ws) {
            file.push('type Options struct {');
            file.push('\tParams *map[string]any');
            file.push('}');
            file.push('');
        }

        for (const key in goTypeOptions) {
            const struct = goTypeOptions[key];
            file.push(struct);
            file.push('');
        }

        fs.writeFileSync (EXCHANGE_OPTIONS_FILE, formatGoSource (EXCHANGE_OPTIONS_FILE, normalizeGoFileHeader (alignGoTrailingComments (file.join('\n')))));
    }

    async transpileDerivedExchangeFiles (jsFolder: string, options: any, pattern = '.ts', force = false, child = false, ws: boolean | 'prediction' = false) {

        // todo normalize jsFolder and other arguments

        // exchanges.json accounts for ids included in exchanges.cfg
        let ids: string[] = [];
        try {
            ids = this.isPrediction ? (ws ? predictionWsIds : predictionIds) : (exchanges as any).ids;
        } catch (e) {
        }

        const regex = new RegExp (pattern.replace (/[.*+?^${}()|[\]\\]/g, '\\$&'));

        // local file list — must NOT clobber the module-level `exchanges` (the parsed
        // exchanges.json), which this function reads `.ids` off of on the next call.
        // Assigning to it worked only because each stage ran in its own process;
        // --rest-and-ws reuses one.
        let exchangeFiles: string[];
        if (options.exchanges && options.exchanges.length) {
            exchangeFiles = options.exchanges.map ((x:string) => x + pattern);
        } else {
            exchangeFiles = fs.readdirSync (jsFolder).filter (file => file.match (regex) && (!ids || ids.includes (basename (file, '.ts'))));
        }

        // Only process exchanges that are in transpiledExchanges
        // (the prediction exchanges have their own id list and skip this gate)
        if (!this.isPrediction) {
            exchangeFiles = exchangeFiles.filter (file => {
                const exchangeName = basename (file, pattern);
                return transpiledExchanges.includes (exchangeName);
            });
        }

        // incremental gate (same rule as the Python/PHP pass in build/transpile.ts):
        // drop the exchanges whose generated .go is newer than its ts source.
        // This has to happen BEFORE the pool is fed, because `allFilesPath`
        // doubles as the sticky ts.Program root list — leaving a clean exchange in it
        // would transpile and rewrite it anyway. `--force` (and any single-exchange run)
        // keeps everything.
        const totalExchangeFiles = exchangeFiles.length;
        exchangeFiles = filterDirtyExchangeFiles ('go', exchangeFiles, force, (file: string) => {
            const extensionlessName = basename (file, pattern);
            return {
                'tsPath': `${jsFolder}/${file}`,
                'outputs': [
                    `${options.goFolder}/${extensionlessName}.go`,
                ],
            };
        });
        if (exchangeFiles.length < totalExchangeFiles) {
            this.skippedUnchangedExchanges = true;
        }

        if (!exchangeFiles.length) {
            return {};
        }

        // transpile using webworker
        const allFilesPath = exchangeFiles.map ((file: string) => `${jsFolder}/${file}` );
        log.blue('[go] Transpiling [', exchangeFiles.join(', '), ']');
        const transpiledFiles = allFilesPath.length > 1 ? await this.webworkerTranspile(allFilesPath, this.getTranspilerConfig()) : allFilesPath.map((file: string) => this.transpiler.transpileGoByPath(file));

        const typedSections: string[] = [];
        for (let i = 0; i < transpiledFiles.length; i++) {
            const transpiled = transpiledFiles[i];
            const exchangeName = exchangeFiles[i].replace('.ts','');
            typedSections.push (this.createGoWrappers(exchangeName, '', transpiled.methodsTypes, ws));
        }
        exchangeFiles.map ((file: string, idx: number) => this.transpileDerivedExchangeFile (jsFolder, file, options, transpiledFiles[idx], force, ws, typedSections[idx]));
        // prediction packages always need their own option-structs file even with a single exchange.
        // `goTypeOptions` only holds the structs of the exchanges transpiled in THIS run, and
        // safeOptionsStructFile() dumps it wholesale — so after an incremental run that skipped
        // exchanges, rewriting the shared file would truncate it to the dirty subset. The existing
        // file already covers the full set (it was written by the last full/--force run), so leave
        // it alone; `--force` regenerates it from scratch.
        if (this.skippedUnchangedExchanges) {
            log.bright.cyan ('[go] Keeping exchange_wrapper_structs.go from the previous full run (incremental run, pass --force to regenerate)');
        } else if (exchangeFiles.length > 1 || this.isPrediction) {
            this.safeOptionsStructFile(ws);
        }
        const classes = {};

        return classes;
    }

    // Write a generated file, skipping the write when this process already wrote
    // byte-identical content to the
    // same path. transpileBaseMethods re-emits exchange_generated.go / exchange_wrappers.go
    // on every one of its three passes and the later passes produce the same bytes; only
    // those two paths are remembered, so the cache never grows with the ~200 per-exchange files.
    writeGeneratedOnce (path: string, content: string) {
        const repeated = (path === BASE_METHODS_FILE) || (path === GLOBAL_WRAPPER_FILE);
        if (repeated && this._lastWrittenContent[path] === content) {
            log.green ('[go] already emitted identical', (path as any).yellow, '- skipping rewrite');
            return false;
        }
        if (repeated) {
            this._lastWrittenContent[path] = content;
        }
        overwriteFileAndFolder (path, content);
        return true;
    }

    /**
     * Extracts type names and global function names from all files in a directory
     * @param dirPath - The path to the directory to extract type and function names from.
     * @returns A set of type and function names with braces.
     */
    extractTypeAndFuncNames(dirPath: string): Set<string> {
        if (this._typeAndFuncNamesCache[dirPath]) {
            return this._typeAndFuncNamesCache[dirPath];
        }
        const results = new Set<string>([
            'Precise',
            'DECIMAL_PLACES',
            'SIGNIFICANT_DIGITS',
            'TICK_SIZE',
            'NO_PADDING',
            'PAD_WITH_ZERO',
            'TRUNCATE',
            'ROUND',
            'ROUND_UP',
            'ROUND_DOWN',
            'toFixed',
            'throwDynamicException',
            'NewArrayCache',
            'NewArrayCacheByTimestamp',
            'NewArrayCacheBySymbolById',
            'NewArrayCacheBySymbolBySide'
        ]);

        const files = fs.readdirSync(dirPath);
        for (const file of files) {
            // _test.go files are not part of the ccxt package a sibling package imports
            if (file.startsWith('exchange') && !file.endsWith('_test.go')) {
                const fullPath = path.join(dirPath, file);

                // Skip directories or non-files
                const stat = fs.statSync(fullPath);
                if (!stat.isFile()) continue;

                const content = fs.readFileSync(fullPath, "utf-8");
                const lines = content.split("\n");

                for (const line of lines) {
                    // Only match lines that start with type or func
                    if (!(
                        /^\s*func\s+/.test(line) ||
                        /^\s*type\s+\w+(?:\[[^\]]*\])?\s+(?:struct\s*\{|interface\s*\{|func\s*\()/.test(line)
                    )) continue;

                    const trimmed = line.trim();

                    // Exclude lines that are just "type" or "func"
                    if (/^(type|func)$/.test(trimmed)) continue;

                    const parts = trimmed.split(/\s+/);
                    if (parts.length < 2) continue;

                    // keep only the identifier: `Name(` and generic `Name[T any](` both end at the bracket
                    let name = parts[1].split(/[(\[]/)[0];
                    if (name.trim() !== "") results.add(name);
                }
            }
        }
        results.delete("Exception");
        this._typeAndFuncNamesCache[dirPath] = results;
        return results;
    }

    /**
     * Adds the package to prefix all methods and types, e.g. MarketInterface -> ccxt.MarketInterface
     * @param content The exchange file as a string
     * @param packageName The package name to add.
     * @returns The content with the package prefix added.
     */
    addPackagePrefix(content: string, methodsAndTypes: Set<string>, packageName: string = 'ccxt') {
        const pattern = Array.from(methodsAndTypes).join("|");
        // any of the method or type names that are not preceded by a `.`, but `...` is allowed e.g. MarketInterface, or ...MarketInterface but not .MarketInterface
        const regex = new RegExp(`(?<![A-Za-z0-9_\\)\\}]\\.)\\b(${pattern})\\b`, "g");
        const variadicRegex = new RegExp(`(?<=\\.\\.\\.)(${pattern})\\b`, "g");
        // qualify type/func names only OUTSIDE string literals — a ccxt type name that appears
        // inside a "..." or `...` literal is data (e.g. an EIP-712 type string or map key) and
        // must not be rewritten to ccxt.Type
        const qualifyOutsideStrings = (text: string): string => {
            const segments = text.split(/("(?:[^"\\]|\\.)*"|`[^`]*`)/g);
            let result = '';
            for (let i = 0; i < segments.length; i++) {
                const seg = segments[i];
                if ((seg.length > 0) && ((seg[0] === '"') || (seg[0] === '`'))) {
                    result += seg;
                } else {
                    result += seg.replace(regex, (match) => `${packageName}.${capitalize(match)}`).replace(variadicRegex, (match) => `${packageName}.${capitalize(match)}`);
                }
            }
            return result;
        };
        return content
            .split("\n")
            .map(line => {
                if (/^\s*(func|type)\b/.test(line)) {
                    // For func/type lines, only process the part after the declaration
                    const declarationMatch = line.match(/^(func(?: \(\w+ \*?\w+\))? \w+)\s*(\(.*)/);
                    if (declarationMatch) {
                        const declaration = declarationMatch[1];
                        const decMatch = declaration + qualifyOutsideStrings(declarationMatch[2]);
                        return decMatch
                    }
                    return line;
                }
                return qualifyOutsideStrings(line);
            })
            .join("\n");
    }

    /**
     * SafeCurrencyCode / SafeSymbol are string-ish on every TS return path: the `code` /
     * `symbol` field of the dict their callee (safeCurrency / safeMarket) always hands back,
     * or `undefined` when that dict carries none. Their Go body is transpiled into `any`, so
     * a local initialised from them can only be typed once the emitted signature carries the
     * same `*string` shape the hand-written Safe* accessors use (build/go-local-types.js
     * lists these two callees): an absent value then stays a nil pointer instead of an
     * untyped nil, which is the shape the printer's pointer-aware comparisons expect.
     * Wrap the single transpiled return in SafeStringPtr (go/v4/exchange_safe.go) and rename
     * the result type. Fail closed: a body that no longer matches this shape keeps the
     * transpiled `any` signature, so a printer change degrades instead of emitting an
     * uncompilable `*string` with an `any` return.
     *
     * @param content The generated exchange_generated.go content (raw, pre-gofmt)
     * @returns The content with the two coerced signatures
     */
    coerceTypedStringAccessors (content: string): string {
        // method name → the expressions its transpiled body may return (pre/post TS-P1 local)
        const stringish: [string, string[]][] = [
            [ 'SafeCurrencyCode', [ 'GetValue(currency, "code")', 'currencyResolved["code"]' ] ],
            [ 'SafeSymbol', [ 'GetValue(market, "symbol")', 'marketResolved["symbol"]' ] ],
        ];
        for (let i = 0; i < stringish.length; i++) {
            const method = stringish[i][0];
            const returnExprs = stringish[i][1];
            // the printer emits single spaces around the signature now (F04); the regex stays
            // whitespace-loose so it also matches pre-existing padding (`any  {`)
            const fnRegex = new RegExp ('func\\s+\\(this \\*BaseExchange\\)\\s+' + method + '\\(([^)]*)\\)\\s+any\\s*\\{([\\s\\S]*?)\\n\\}', 'g');
            content = content.replace (fnRegex, ((match: string, params: string, body: string) => {
                const returns = body.match (/^[ \t]*return .*$/gm) || [];
                const returnExpr = returnExprs.find ((e) => returns.length === 1 && returns[0].trim ().replace (/\s+/g, ' ') === ('return ' + e));
                if (returnExpr === undefined) {
                    return match; // unexpected body shape: keep the transpiled `any` signature
                }
                const returnIndent = (returns[0].match (/^[ \t]*/) as RegExpMatchArray)[0];
                const wrapped = body.replace (returns[0], returnIndent + 'return SafeStringPtr(' + returnExpr + ')');
                return 'func (this *BaseExchange) ' + method + '(' + params + ') *string {' + wrapped + '\n}';
            }) as any);
        }
        return content;
    }

    /**
     * An exchange may override one of the two coerced string-ish accessors — kraken's
     * safeCurrencyCode handles the X/Z prefixes. Its transpiled copy shadows the base method for
     * `this.SafeCurrencyCode(...)` calls on that exchange, so it has to carry the same `*string`
     * shape or the locals the classifier types against the call would not compile (the compiler
     * resolves the receiver, the classifier cannot). Every return goes through SafeStringPtr,
     * which is the identity on the string-ish value these methods return and maps anything else
     * (including nil) to the nil pointer = TS `undefined`. Fail closed: an override whose return
     * statements are not the emitted one-line `return <expr>` form is left `any` — the classifier
     * entries then fail the build loudly instead of drifting silently.
     *
     * @param content One generated exchange file (go/v4/<id>.go or a pro/prediction twin)
     * @returns The content with any override of the two accessors coerced
     */
    coerceTypedStringAccessorOverrides (content: string): string {
        const names = [ 'SafeCurrencyCode', 'SafeSymbol' ];
        for (let i = 0; i < names.length; i++) {
            const fnRegex = new RegExp ('func\\s+\\(this \\*(?!BaseExchange)(\\w+)\\)\\s+' + names[i] + '\\(([^)]*)\\)\\s+any\\s*\\{([\\s\\S]*?)\\n\\}', 'g');
            content = content.replace (fnRegex, ((match: string, receiver: string, params: string, body: string) => {
                const returns = body.match (/^[ \t]*return .*$/gm) || [];
                if (!returns.length || (body.indexOf ('SafeStringPtr(') >= 0)) {
                    return match;
                }
                let wrapped = body;
                for (let r = 0; r < returns.length; r++) {
                    const expr = returns[r].replace (/^[ \t]*return[ \t]+/, '');
                    const indent = returns[r].substring (0, returns[r].length - returns[r].trimStart ().length);
                    wrapped = wrapped.replace (returns[r], indent + 'return SafeStringPtr(' + expr + ')');
                }
                // keep the printer's own signature spacing and swap only the result type
                const head = match.substring (0, match.indexOf ('{'));
                return head.replace (/\s+any\s*$/, ' *string ') + '{' + wrapped + '\n}';
            }) as any);
        }
        return content;
    }

    /**
     * Retypes each named method (base copy when `base`, else every venue override) to `*string`,
     * routing every function-level return through SafeStringPtr (identity on a string, nil
     * otherwise). Fail closed: a body the return scanner cannot read keeps its `any` signature.
     */
    coerceStringPtrMethods (content: string, names: string[], base: boolean): string {
        for (const name of names) {
            const receiver = base ? 'BaseExchange' : '(?!BaseExchange\\b)\\w+';
            const fnRegex = new RegExp ('func\\s+\\(this \\*' + receiver + '\\)\\s+' + name + '\\([^)]*\\)\\s+any\\s*\\{[\\s\\S]*?\\n\\}', 'g');
            content = content.replace (fnRegex, ((match: string) => {
                const open = match.indexOf ('{');
                const scanned = this.wrapGoFunctionLevelReturns (match.substring (open + 1, match.length - 1), (expr: string) => 'SafeStringPtr(' + expr + ')');
                if ((scanned === undefined) || (scanned.total === 0)) {
                    return match;
                }
                return match.substring (0, open).replace (/\s+any\s*$/, ' *string ') + '{' + scanned.text + '}';
            }) as any);
        }
        return content;
    }

    // ---------------------------------------------------------------------------------------------
    /**
     * Index of the `}` that closes the brace-matched block opened at `open`, or -1 when the
     * text is unbalanced. Used by the map-accessor coercion to cut a method body out of the
     * printed file without a parser.
     */
    goBraceClose (content: string, open: number): number {
        let depth = 0;
        for (let i = open; i < content.length; i++) {
            const c = content[i];
            if (c === '{') {
                depth += 1;
            } else if (c === '}') {
                depth -= 1;
                if (depth === 0) {
                    return i;
                }
            }
        }
        return -1;
    }

    /**
     * Wraps every function-level `return <expr>` of a generated Go body with `wrapper`.
     * The returns of nested function literals are deliberately left alone: the closure's
     * expression has the closure's own type (Ndax's ParseOrderBook closure returns the two
     * key names, so `MapTyped(asksKey)` would not compile) and the printer always writes the
     * literal's `{` on the `func(` line (verified: 0 `= func(...) <type>` openings in go/v4
     * @0b32e4ad). Returns undefined - the caller keeps the transpiled `any` - when the body
     * cannot be scanned confidently (unbalanced braces, a `func(` head whose brace is on
     * another line, a bare `return`).
     */
    wrapGoFunctionLevelReturns (body: string, wrapper: (expr: string) => string): { text: string, total: number, exprs: string[] } | undefined {
        const inLiteral: boolean[] = [];
        const stack: boolean[] = [];
        let literalOpen = 0;
        for (let i = 0; i < body.length; i++) {
            inLiteral[i] = literalOpen > 0;
            const c = body[i];
            if (c === '{') {
                const lineStart = body.lastIndexOf ('\n', i - 1) + 1;
                const head = body.substring (lineStart, i);
                const isLiteral = /(^|[^\w.])func\s*\([^)]*\)/.test (head);
                stack.push (isLiteral);
                if (isLiteral) {
                    literalOpen += 1;
                }
            } else if (c === '}') {
                if (!stack.length) {
                    return undefined;
                }
                if (stack.pop ()) {
                    literalOpen -= 1;
                }
            }
        }
        if (stack.length) {
            return undefined;
        }
        const lines = body.split ('\n');
        const out: string[] = [];
        const exprs: string[] = [];
        let offset = 0;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim ();
            if (!inLiteral[offset] && /^return([ \t]|$)/.test (trimmed)) {
                let expr = trimmed.substring ('return'.length).trim ();
                if (expr.length === 0) {
                    return undefined;
                }
                // a multi-line expression (e.g. a map literal argument) ends where its delimiters balance;
                // an expression that never balances leaves the whole method untyped
                const depthOf = (text: string): number => {
                    let depth = 0;
                    for (let k = 0; k < text.length; k++) {
                        const c = text[k];
                        if (c === '"' || c === '`' || c === "'") {
                            k = goSkipLiteralText (text, k);
                        } else if (c === '(' || c === '[' || c === '{') {
                            depth += 1;
                        } else if (c === ')' || c === ']' || c === '}') {
                            depth -= 1;
                        }
                    }
                    return depth;
                };
                while ((depthOf (expr) > 0) && (i + 1 < lines.length)) {
                    if (/func\s*\(/.test (lines[i]) && (lines[i].indexOf ('{', lines[i].search (/func\s*\(/)) < 0)) {
                        return undefined;
                    }
                    offset += lines[i].length + 1;
                    i += 1;
                    expr += '\n' + lines[i];
                }
                if (depthOf (expr) !== 0) {
                    return undefined;
                }
                const indent = line.substring (0, line.length - line.trimStart ().length);
                out.push (indent + 'return ' + wrapper (expr));
                exprs.push (expr);
            } else {
                out.push (line);
            }
            offset += lines[i].length + 1;
            if (!inLiteral[offset - 1] && /func\s*\(/.test (lines[i]) && (lines[i].indexOf ('{', lines[i].search (/func\s*\(/)) < 0)) {
                return undefined; // a func literal that opens its brace on a later line
            }
        }
        return { text: out.join ('\n'), total: exprs.length, exprs: exprs };
    }

    /**
     * Retypes one generated method to `map[string]any` and - when `wrap` - rewrites every
     * function-level return through MapTyped, which is the identity on a map value, converts a
     * *sync.Map and maps anything else (including nil) to a map. Without `wrap` the body must
     * consist of exactly one `return <expr>` line whose expression satisfies `accept` (the
     * fail-closed shape check of coerceTypedStringAccessors). `accept`, when given with
     * `wrap`, must hold for every function-level return expression.
     */
    retypeGoMapMethod (content: string, receiver: string, method: string, accept: (expr: string) => boolean | undefined, wrap: boolean, goType = 'map[string]any'): string {
        // market rows leave Market/SafeMarket pointer-free, so their fields read natively
        const typed = (goType === '[]any') ? 'ListTyped(' : ((GO_MARKET_ROW_METHODS.indexOf (method) >= 0) ? 'MarketTyped(' : 'MapTyped(');
        const headRegex = new RegExp ('func\\s+\\(this \\*' + receiver + '\\)\\s+' + method + '\\(([^)]*)\\)\\s+any\\s*\\{', 'g');
        let out = '';
        let cursor = 0;
        let match = headRegex.exec (content);
        if (match === null) {
            return content;
        }
        while (match !== null) {
            const headStart = match.index;
            const open = content.indexOf ('{', headStart + match[0].length - 1);
            const close = (open < 0) ? -1 : this.goBraceClose (content, open);
            if ((open < 0) || (close < 0)) {
                return content; // unbalanced: keep the transpiled signature
            }
            const body = content.substring (open + 1, close);
            let newBody = body;
            if (wrap) {
                const scanned = this.wrapGoFunctionLevelReturns (body, (expr: string) => typed + expr + ')');
                if ((scanned === undefined) || (scanned.total === 0)) {
                    return content;
                }
                if ((accept !== undefined) && (!scanned.exprs.every (accept))) {
                    return content;
                }
                newBody = scanned.text;
            } else {
                const returns = body.match (/^[ \t]*return .*$/gm) || [];
                if ((returns.length !== 1) || (!accept (returns[0].trim ().replace (/\s+/g, ' ').replace (/^return /, '')))) {
                    return content;
                }
            }
            const head = content.substring (headStart, open);
            out += content.substring (cursor, headStart) + head.replace (/\s+any\s*$/, ' ' + goType + ' ') + '{' + newBody;
            cursor = close;
            match = headRegex.exec (content);
        }
        out += content.substring (cursor);
        return out;
    }

    /**
     * Map-returning accessors whose transpiled `any` signature hides a proven
     * `map[string]any` body (see the C3 SPECs). One row per method; a sibling unit that
     * lands the same change appends its own row to this table instead of adding a second
     * table. Fail closed: an unexpected body shape leaves the transpiled `any` signature.
     */
    coerceTypedMapAccessors (content: string): string {
        // receiver, method, accepted single-return shape, wrap-every-function-level-return
        const rows: [string, string, (expr: string) => boolean, boolean][] = [
            [ 'BaseExchange', 'Account', (expr: string) => expr.indexOf ('map[string]any{') === 0, false ],
            [ 'BaseExchange', 'ParseOrderBook', (expr: string) => expr.indexOf ('map[string]any{') === 0, false ],
            // every return path is a map: the argument is defaulted and the option-market producer is wrapped
            [ 'BaseExchange', 'Market',
              (expr: string) => (expr.indexOf ('GetValue(') === 0) || (expr === 'market') || (expr.indexOf ('this.DerivedExchange.CreateExpiredOptionMarket(') === 0),
              true ],
            // TS returns a dictionary on every path (currency panics, the safe forms build a structure)
            [ 'BaseExchange', 'Currency', (expr: string) => expr.length > 0, true ],
            [ 'BaseExchange', 'SafeCurrency', (expr: string) => expr.length > 0, true ],
            [ 'BaseExchange', 'SafeMarket', (expr: string) => expr.length > 0, true ],
        ];
        for (let i = 0; i < rows.length; i++) {
            content = this.retypeGoMapMethod (content, rows[i][0], rows[i][1], rows[i][2], rows[i][3]);
        }
        return content;
    }

    /**
     * An exchange may override one of the coerced map accessors; its transpiled copy shadows
     * the embedded base method, so it has to carry the same `map[string]any` shape or the
     * locals the classifier types against the call would not compile (the compiler resolves
     * the receiver, the classifier cannot). Every function-level return is wrapped in
     * MapTyped; the returns of nested function literals are untouched. Fail closed: an
     * unscannable body leaves the transpiled `any` signature, and a receiver that does not
     * declare the method is a no-op (the unit must then not add its classifier row).
     */
    coerceTypedMapAccessorOverrides (content: string): string {
        const rows: [string, string][] = [
            [ 'Ndax', 'ParseOrderBook' ],
            [ 'Binance', 'Market' ],
            [ 'Hyperliquid', 'Market' ],
        ];
        for (let i = 0; i < rows.length; i++) {
            content = this.retypeGoMapMethod (content, rows[i][0], rows[i][1], undefined, true);
        }
        // every exchange override of a base map accessor carries the base's map signature
        const overrides = content.match (/func\s+\(this \*\w+\)\s+(?:Currency|SafeCurrency|SafeMarket)\(/g) || [];
        for (let i = 0; i < overrides.length; i++) {
            const parts = /\*(\w+)\)\s+(\w+)\(/.exec (overrides[i]);
            content = this.retypeGoMapMethod (content, parts[1], parts[2], undefined, true);
        }
        return content;
    }

    // Tuple-helper return signatures (U28 family)
    //
    // ts/src/base/Exchange.ts declares the `[ value, params ]` helpers with a TS tuple return
    // (handleOptionAndParams/2, handleParamString/2, handleMarketTypeAndParams), which the printer
    // can only express as `any`. Every return statement of every declaration of those names —
    // BaseExchange's own bodies (HandleOptionAndParams 1, HandleOptionAndParams2 2,
    // HandleParamString 1, HandleParamString2 1, HandleMarketTypeAndParams 6) plus the two
    // exchange overrides (Okx, Deepcoin — each a single `return super.handleMarketTypeAndParams
    // (...)` delegating to the base) — already produces a Go `[]any` value, so the declared return
    // type can carry it. That is what lets the destructuring holder be a real `[]any` instead of an
    // `any` box (see CCXT_GO_ARRAY_BINDING_HOLDERS in build/go-local-types.js), the same shape
    // #30356's C# retypeDestructuringTemp gave the same holder.
    // The receiver is deliberately not restricted to *BaseExchange: Go has no virtual dispatch, so
    // an exchange that overrides one of these methods (Okx/Deepcoin do) shadows the embedded base
    // method for its own call sites — coercing the base declaration alone would leave those call
    // sites holding a `[]any` variable initialised from an `any` value (the first farm build of this
    // unit failed exactly there). The census checker for every declaration of the five names is
    // go-locals/u28-holder-gate.py (section "declarations of the five helpers"): it fails unless
    // each declaration returns []any on every path. Run it after adding a new override.
    // Nothing else moves: a `[]any` value still boxes into every `any` sink (parameter, map value,
    // AppendToArray, SafeValue/GetValue receiver), and no call site compares the result to a literal.
    coerceTupleHelperSignatures (content: string): string {
        // F04: the `[]any` retag spells the single space before `{` too
        return content.replace (/func\s+\(this \*(\w+)\)\s+(HandleOptionAndParams|HandleOptionAndParams2|HandleParamString|HandleParamString2|HandleNetworkCodeAndParams|HandleWithdrawTagAndParams|HandlePostOnly|HandleParamBool|HandleParamBool2|HandleParamInteger|HandleParamInteger2|HandleTriggerPricesAndParams|HandleTriggerDirectionAndParams)\(([^)]*)\)\s+any(\s+\{)/g, 'func (this *$1) $2($3) []any {')
            // hand-written base (exchange_market_type.go) returns the pair as two results; the
            // Okx/Deepcoin overrides only `return super...` so they carry the same results
            .replace (/func\s+\(this \*(\w+)\)\s+(HandleMarketTypeAndParams|HandleSubTypeAndParams|HandleOptionStringAndParams|HandleMarginModeAndParams)\(([^)]*)\)\s+(?:any|\[\]any)(\s+\{)/g, 'func (this *$1) $2($3) (*string, map[string]any) {')
            .replace (/func\s+\(this \*(\w+)\)\s+(HandleUntilOption)\(([^)]*)\)\s+(?:any|\[\]any)(\s+\{)/g, 'func (this *$1) $2($3) (map[string]any, map[string]any) {');
    }

    // ------------------------------------------------------------------
    // gofmt-compatible spacing of the arithmetic spliced into emitted Go
    // ------------------------------------------------------------------
    // go/printer prints a level-4/5 operator (`+ - * / % & | ^ << >>`) with a
    // blank around it only at the top level of a statement: nodes.go picks a
    // cutoff from the operator tree (walkBinary/cutoff) and drops both blanks
    // when the operator precedence is below it. The same `"a" + "b"` is therefore
    // spaced in `x := "a" + "b"` and compact in `Add(x, "a"+"b")` or `a[i+1]`.
    // gofmt tracks the level over the Go AST it prints: 1 at the start of every
    // statement, +1 for an argument list with more than one argument, +1 for an
    // index expression, -1 inside parentheses (never below 1), and back to 1 for
    // composite literal elements.
    //
    // `"\0"` is the one literal the printer cannot emit (a raw NUL byte is not
    // valid Go source), so its replacement text is spliced into Go the printer has
    // already produced and the level has to be read back from that text.
    goGofmtArithmeticDepth (content: string, index: number): number {
        // every statement is printed indented, so the enclosing top-level
        // declaration is the last line that starts in column 0
        let start = content.lastIndexOf ('\n', index - 1) + 1;
        while (start > 0) {
            const previousLineStart = content.lastIndexOf ('\n', start - 2) + 1;
            const previousLine = content.slice (previousLineStart, start - 1);
            if (previousLine.length > 0 && previousLine[0] !== ' ' && previousLine[0] !== '\t') {
                break;
            }
            start = previousLineStart;
        }
        const frames = [];
        for (let i = start; i < index; i++) {
            const char = content[i];
            if (char === '"' || char === '\'' || char === '`') {
                i = this.goSkipGoLiteral (content, i);
            } else if (char === '/' && (content[i + 1] === '/' || content[i + 1] === '*')) {
                i = this.goSkipGoComment (content, i);
            } else if (char === '(' || char === '[' || char === '{') {
                frames.push ({ kind: char, args: this.goCountFrameArgs (content, i) });
            } else if (char === ')' || char === ']' || char === '}') {
                frames.pop ();
            }
        }
        let depth = 1;
        for (let fi = 0; fi < frames.length; fi++) {
            const frame = frames[fi];
            if (frame.kind === '(') {
                // a call prints its argument list one level deeper, but only when
                // there is more than one argument
                if (frame.args > 1) {
                    depth += 1;
                }
            } else if (frame.kind === '[') {
                depth += 1;
            } else if (frame.kind === '{') {
                depth = 1;
            }
        }
        return depth;
    }

    // index of the last byte of the Go literal that starts at `index`
    goSkipGoLiteral (content: string, index: number): number {
        return goSkipLiteralText (content, index);
    }

    // index of the last byte of the comment that starts at `index`
    goSkipGoComment (content: string, index: number): number {
        return goSkipCommentText (content, index);
    }

    // number of comma separated entries between the bracket at `opener` and its
    // matching closer (strings and comments ignored); 0 when unbalanced
    goCountFrameArgs (content: string, opener: number): number {
        return goCountFrameArgsText (content, opener);
    }

    // the two-literal concatenation a `"\0"` string literal is rewritten into,
    // laid out the way gofmt would print it at the level it is spliced in
    goNulSeparatorText (content: string, index: number): string {
        const depth = this.goGofmtArithmeticDepth (content, index);
        // `"//" + "0"` is a level-4 chain over two primaries: gofmt keeps the
        // blanks at depth 1 and drops them below (cutoff() with has4 only)
        return depth > 1 ? '"//"+"0"' : '"//" + "0"';
    }

    createGoExchange(className: string, goVersion: any, ws: boolean | 'prediction' = false, typedSection = '') {
        const isPrediction = (ws === 'prediction');
        const isWs = (ws === true);
        const goImports = this.getGoImports(goVersion, isWs, isPrediction).join("\n") + "\n";
        let content = goVersion.content;
        const exchangeName = className;

        className = capitalize(className);

        const classExtends = /type\s\w+\sstruct\s{\s*(\w+)/;
        const matches = content.match(classExtends);
        const baseClass = matches ? matches[1].replace('Rest', '') : '';
        let isExtended = this.isExtendedExchange(exchangeName);
        const isAlias = this.isAlias (exchangeName);

        // A non-async method declared to return a Promise (e.g. `watchTrades (symbol): Promise<Trade[]> {
        // return this.watchTradesForSymbols([symbol], ...) }`) is transpiled with a Go return type of
        // `any` — the ast-transpiler only channel-wraps `async` methods. But its body returns a channel
        // and the typed wrapper reads it with `<-`, so coerce the declared return type to `<-chan any`.
        // Target methods by name from the parsed metadata (the same async||Promise signal the wrapper
        // side uses) so only Promise-returning methods are touched, never the many sync helpers.
        const promiseMethods = (goVersion.methodsTypes || []).filter ((m: any) => !m.async && (typeof m.returnType === 'string') && m.returnType.startsWith ('Promise'));
        for (let mi = 0; mi < promiseMethods.length; mi++) {
            const capName = capitalize (promiseMethods[mi].name);
            const coerceRegex = new RegExp ('(func\\s+\\(this\\s+\\*\\w+\\)\\s+' + capName + '\\([^)]*\\))\\s+any(\\s+\\{)', 'g');
            // F04: spell the single space before `{` (see coerceGoBoolMethodReturns)
            content = content.replace (coerceRegex, '$1 <-chan any {');
        }

        content = this.coerceTypedStringAccessorOverrides (content);
        content = this.coerceStringPtrMethods (content, CCXT_GO_STRING_PTR_METHOD_NAMES, false);
        content = this.coerceTypedMapAccessorOverrides (content);
        content = coerceGoBoolMethodReturns (content, CCXT_GO_BOOL_METHOD_NAMES);
        // The destructured `[ value, params ]` helpers carry a concrete `[]any` return (see
        // coerceTupleHelperSignatures); an exchange that overrides one of them (Okx, Deepcoin)
        // shadows the embedded base method, so its own declaration has to be coerced here too.
        content = this.coerceTupleHelperSignatures (content);

        // The Safe* accessors return a typed pointer. When the printer stores that result in an
        // `any` local, later inline `local == "literal"` comparisons compare an interface holding
        // a *string against an untyped constant and are always false. Unwrap at the assignment so
        // the `any` local carries the plain value, matching every other language port.
        const derefFn = isWs ? 'ccxt.DerefScalar(' : 'DerefScalar(';
        const safeCall = 'this\\.(?:DerivedExchange\\.)?(?:Safe(?:(?:String|Integer|Number|Float|Bool)[N2-9]*|CurrencyCode|Symbol)|NumberToString|Parse8601|Iso8601|' + CCXT_GO_STRING_PTR_METHOD_NAMES.join ('|') + ')\\((?:[^()]|\\([^()]*\\))*\\)';
        content = content.replace (new RegExp ('(var \\w+ any = )(' + safeCall + ')', 'g'), ((_m: string, decl: string, call: string) => decl + derefFn + call + ')') as any);
        // A SafeBool* call compared directly to a bool literal has no local for the unwrap
        // above, and the printer emits the comparison raw -- `this.SafeBool(..) == true`.
        // That compiled while the accessor returned `any`; now it is a type error (*bool vs
        // untyped bool), so route it through IsEqual, which derefs. Same rewrite the test
        // passes apply to their call comparisons; bool family only.
        const isEqualWrap = isWs ? 'ccxt.IsEqual(' : 'IsEqual(';
        content = content.replace (new RegExp ('(this\\.SafeBool(?:2|N)?\\((?:[^()]|\\([^()]*\\))*\\)) (==|!=) (true|false)\\b', 'g'), ((_m: string, call: string, op: string, literal: string) => (op === '==') ? isEqualWrap + call + ', ' + literal + ')' : '!' + isEqualWrap + call + ', ' + literal + ')') as any);
        // ... and the same for reassignments of a local already declared `any`. A typed
        // `var x *string` local must keep its pointer, and the same name can be `any` in one
        // function and typed in another, so resolve the declaration per function body.
        content = content.replace (/\nfunc [\s\S]*?\n\}/g, ((fn: string) => {
            const signature = fn.slice (0, fn.indexOf ('{'));
            const anyLocals = new Set ((fn.match (/var (\w+) any\b/g) || []).map ((d: string) => d.split (' ')[1]));
            // `any` parameters (and the `x := GetArg(...)` optionals) are untyped sinks too
            const paramMatches = signature.match (/(\w+) any\b/g) || [];
            for (let pi = 0; pi < paramMatches.length; pi++) {
                anyLocals.add (paramMatches[pi].split (' ')[0]);
            }
            const argMatches = fn.match (/(\w+) := GetArg\(/g) || [];
            for (let ai = 0; ai < argMatches.length; ai++) {
                anyLocals.add (argMatches[ai].split (' ')[0]);
            }
            const typedLocals = new Set ((fn.match (/var (\w+) \*\w+\b/g) || []).map ((d: string) => d.split (' ')[1]));
            if (!anyLocals.size) {
                return fn;
            }
            // DerefScalar() is only load-bearing for the reads that can see the pointer (raw
            // comparisons, stores, non-shim calls). Where every read of the local is a call to
            // a shim that derefs its own arguments, drop the wrapper the pass above added and
            // keep the pointer in the box — the shim reads the same value either way.
            const wrapLines = new Set<number> ();
            fn.split ('\n').forEach ((line, index) => {
                if (line.indexOf ('DerefScalar(') >= 0) {
                    wrapLines.add (index);
                }
            });
            const redundantWraps = goDerefWrapRedundantLocals (fn, wrapLines, anyLocals);
            fn = goUnwrapDerefWraps (fn, redundantWraps, safeCall);
            fn = fn.replace (new RegExp ('(\\n\\s*)(\\w+) = (' + safeCall + ')', 'g'), ((m: string, pre: string, name: string, call: string) => (anyLocals.has (name) && !typedLocals.has (name) && !redundantWraps.has (name)) ? pre + name + ' = ' + derefFn + call + ')' : m) as any);
            // An `any` name can still receive a typed pointer from its caller (an `any` parameter
            // fed a *string by another exchange method), so `name == "literal"` compares an
            // interface against an untyped constant and is always false. Route those via IsEqual.
            const isEqualFn = isWs ? 'ccxt.IsEqual(' : 'IsEqual(';
            fn = fn.replace (/(?<![.\w*"])(\w+) (==|!=) (("(?:[^"\\]|\\.)*")|-?\d+(?:\.\d+)?)/g, ((m: string, name: string, op: string, literal: string) => {
                if (!anyLocals.has (name) || typedLocals.has (name)) {
                    return m;
                }
                const call = isEqualFn + name + ', ' + literal + ')';
                return (op === '==') ? call : '!' + call;
            }) as any);
            // Same hazard when the right side is a helper call returning `any` (Subtract,
            // GetArrayLength, OpNeg, ...): `i == Subtract(n, 1)` compares an int against an
            // interface holding int64 and is always false.
            fn = fn.replace (/(?<![.\w*"])(\w+) (==|!=) ((?:Subtract|Add|Multiply|Divide|OpNeg|GetArrayLength|ParseInt)\((?:[^()]|\([^()]*\))*\))/g, ((m: string, name: string, op: string, call: string) => {
                if (name === 'nil' || typedLocals.has (name)) {
                    return m;
                }
                const wrapped = isEqualFn + name + ', ' + call + ')';
                return (op === '==') ? wrapped : '!' + wrapped;
            }) as any);
            // ... and when both sides are `any` names: two interfaces holding different numeric
            // kinds (int vs int64) compare unequal even when the numbers match.
            fn = fn.replace (/(?<![.\w*"])(\w+) (==|!=) (\w+)(?![\w(])/g, ((m: string, left: string, op: string, right: string) => {
                if (right === 'nil' || left === 'nil' || right === 'true' || right === 'false') {
                    return m;
                }
                if (!anyLocals.has (left) || !anyLocals.has (right) || typedLocals.has (left) || typedLocals.has (right)) {
                    return m;
                }
                const wrapped = isEqualFn + left + ', ' + right + ')';
                return (op === '==') ? wrapped : '!' + wrapped;
            }) as any);
            return fn;
        }) as any);

        // A bare `any` parameter keeps whatever the CALLER boxed: the printer's `x == nil` proof
        // is local to the function, so a typed `*T` local handed over by another method needs the
        // deref-aware helper (goParamNativeNilCompares). GetArg-bound optionals and the proven
        // locals keep the native comparison.
        content = goParamNativeNilCompares (content, isWs ? 'ccxt.IsEqual(' : 'IsEqual(');
        // ... and the same for the `any` LOCALS a pointer reaches: the printer's local proof
        // only knows a `*T`-returning helper call, not a typed local or a native `*T` parameter.
        // A prediction exchange lives in package ccxtprediction, which reaches the helper as
        // `ccxt.IsEqual` too (its generated file uses no bare form).
        content = goBoxedPointerNilCompares (content, (isWs || isPrediction) ? 'ccxt.IsEqual(' : 'IsEqual(');
        // ... and the same for a local boxed from a method this file types with a pointer result
        // (`var timeInForce any = this.ParseOrderTimeInForce(…)`): the printer cannot see that
        // signature, so its native `timeInForce == nil` never fires on the boxed (*string)(nil).
        content = goPointerLocalNativeNilCompares (content, isWs ? 'ccxt.IsEqual(' : 'IsEqual(');
        // typed locals compare natively (goTypedNativeNilCompares)
        content = goTypedNativeNilCompares (content, (isWs || isPrediction) ? 'ccxt.IsEqual(' : 'IsEqual(');
        content = goAnyLocalNativeNilCompares (content, (isWs || isPrediction) ? 'ccxt.IsEqual(' : 'IsEqual(');
        content = goStringLiteralNativeCompares (content, (isWs || isPrediction) ? 'ccxt.IsEqual(' : 'IsEqual(');
        content = goSafeBoolLiteralDefaultDeref (content);

        if (!isWs) {
            content = this.regexAll(content, [
                [/base\.(\w+)\(/gm, "this.Exchange.$1("],
                [/base\.Describe/gm, "this.Exchange.Describe"],
                [/var (precise|preciseAmount) any = /gm, "$1 := "],
                [/binaryMessage.ByteLength/gm, 'GetValue(binaryMessage, "byteLength")'], // idex tmp fix
                [/ToString\((precise\w*)\)/gm, "$1.ToString()"],
                [/<\-callDynamically/gm, '<-this.CallDynamically'],
                // bare dynamic calls (e.g. an implicit-api call pushed into a promises array)
                // are emitted without the receiver - route them through the exported helper too
                [/callDynamically\(/gm, 'this.CallDynamically('],
                [/toFixed/gm, 'ToFixed'],
                [/throwDynamicException/gm, 'ThrowDynamicException'],
                // for-loops initialized from a transpiled (any-typed) variable need a
                // numeric loop counter, e.g. `for i := startIndex;` -> `for i := int(ParseInt(startIndex));`
                [/for (\w+) := ([a-zA-Z_]\w*); /g, 'for $1 := int(ParseInt($2)); '],
            ]);
            // `"\0"` is emitted as a raw NUL byte, which is not valid Go source: splice in
            // the two-literal form instead. It lands in text the printer already produced,
            // so its blanks follow gofmt's depth rule (goGofmtArithmeticDepth). Nothing
            // below this point changes the level of the splice site, and running last means
            // the level is read off the final text.
            content = content.replace (/"\0"/gm, ((_match: string, offset: number) => this.goNulSeparatorText (content, offset)) as any); // check this later in bl3p
            if (this.isPrediction) {
                // prediction cores embed PredictionExchange (which embeds BaseExchange) instead
                // of Exchange directly, so they inherit the prediction methods + state
                content = content.replace(/(type \w+ struct \{\s*\n\s*)Exchange\b/, '$1PredictionExchange');
                // the shared `base.` fixup rewrote base-method calls to `this.Exchange.`, but a
                // prediction core reaches the embedded base as `this.BaseExchange.`
                content = content.replace(/\bthis\.Exchange\./g, 'this.BaseExchange.');
                // prediction exchanges merge REST + WS in one class, so apply the WS transforms
                // (orderbook/side casts, client/future resolve, append, limit, ...) here too
                content = this.regexAll (content, this.getWsRegexes());
                // the prediction exchanges live outside of package ccxt, so all the
                // package-level types/functions of go/v4 need the ccxt. qualifier
                // (this also rewrites the embedded struct member into ccxt.PredictionExchange)
                content = this.addPackagePrefix(content, this.extractTypeAndFuncNames(EXCHANGES_FOLDER), 'ccxt');
                // inherited prediction helpers (outcome, shortenSlug, checkEventsAndMarkets, ...)
                // reach the derived exchange via callDynamically. The shared `<-callDynamically`
                // fixup only covers awaited calls; non-awaited/sync ones stay bare and would be
                // undefined in package ccxtprediction. Route them through the exported
                // channel-based dispatcher — CallInternalMethod forwards both plain and channel
                // returns, so the `<-` receive is always valid.
                content = this.regexAll (content, [
                    [/callDynamically\(/gm, '<-this.CallDynamically('],
                ]);
            }
        } else {
            const restPackagePrefix = this.isPrediction ? `${PREDICTION_PACKAGE}.` : 'ccxt.';
            const inheritedClass = isAlias ? `${baseClass}` : `${restPackagePrefix}${className}`;
            const inheritedInstatiation = isAlias ? `new${baseClass}()` : `&${inheritedClass}{}`;
            const wsRegexes = this.getWsRegexes();
            content = this.regexAll (content, [
                [ /type (\w+) struct \{\s+(\w+)\s*\n\s*/g, `type $1 struct {\n\t*${inheritedClass}\n\tbase *${inheritedClass}\n` ],      // adds 'base exchangeName'
                [ /(p \:\= &.*$)/gm, `$1\n\tbase := ${inheritedInstatiation}\n\tp.base = base\n\tp.${baseClass} = base` ],  // could go in ast-transpiler if there is always a parameter named base
                ...wsRegexes,
            ]);
            content = this.addPackagePrefix(content, this.extractTypeAndFuncNames(EXCHANGES_FOLDER), 'ccxt');
        }


        if (isExtended) {
            content = content.replace(/this.Exchange.Describe/gm, `this.${baseClass}.Describe`);
        }

        // prediction cores embed BaseExchange directly (independent of the concrete Exchange)
        const baseField = this.isPrediction ? 'BaseExchange' : 'Exchange';
        const exchangeStructName = this.isPrediction ? 'ccxt.BaseExchange' : (ws ? 'ccxt.Exchange' : 'Exchange');
        let initMethod = '';
        if (!isAlias && !isWs) {
            const typedInit = this.isPrediction ? 'ccxt.NewBaseExchangeTyped(&this.BaseExchange)' : 'NewExchangeTyped(&this.Exchange)';
            initMethod = `
func (this *${className}) Init(userConfig map[string]any) {
\tthis.${baseField} = ${exchangeStructName}{}
\tthis.${baseField}.DerivedExchange = this
\tthis.${baseField}.InitParent(userConfig, this.Describe().(map[string]any), this)
\tthis.exchangeTyped = ${typedInit}
}\n`;
        } else {
            initMethod = `
func (this *${className}) Init(userConfig map[string]any) {
\tthis.${isWs ? 'base' : `${capitalize(baseClass)}`}.Init(this.DeepExtend(this.Describe(), userConfig))
\tthis.Itf = this
\tthis.Exchange.DerivedExchange = this
}\n`;
        }

        // The typed sync methods live on this same struct. A non-alias REST/prediction exchange
        // delegates the unified methods it does not override to `exchangeTyped` (set in Init so
        // that aliases, which embed the parent by value, and ws twins get it too). Aliases and ws
        // exchanges inherit the whole typed surface through their embedded parent instead.
        if (!isAlias && !isWs) {
            const typedType = this.isPrediction ? '*ccxt.BaseExchangeTyped' : '*ExchangeTyped';
            // the injected field is a real Go field, so it has to survive gofmt unchanged: tab
            // indentation, and no blank line left before the closing brace
            content = content.replace (/(type \w+ struct \{)([\s\S]*?)(\n\})/, (_match: string, head: string, body: string, tail: string) => head + body.replace (/\n+$/, '') + '\n\texchangeTyped ' + typedType + tail);
        }
        // the transpiled zero-arg constructor is the raw allocator (aliases/ws twins reuse it
        // before running their own Init); the public New<X>(userConfig) allocates and inits
        content = content.replace (
            new RegExp (`func New${className}\\(\\) \\*${className} \\{`),
            `func new${className}() *${className} {`
        );
        const publicCtor = [
            '',
            `func New${className}(userConfig map[string]any) *${className} {`,
            `\tp := new${className}()`,
            '\tp.Init(userConfig)',
            '\treturn p',
            '}',
            '',
        ].join('\n');

        // `content` already ends with a newline and publicCtor opens with an empty line, so the
        // plain join produced TWO blank lines before the constructor; gofmt keeps at most one
        // between declarations (go/printer linebreak nlimit).
        content = this.createGeneratedHeader().join('\n') + '\n' + content + (content.endsWith('\n') ? '' : '\n') + publicCtor + initMethod + typedSection;
        if (isPrediction) {
            // qualify everything that lives in the base ccxt package (types, helpers,
            // error constructors, the embedded Exchange struct itself, ...)
            content = this.addPackagePrefix(content, this.extractTypeAndFuncNames(EXCHANGES_FOLDER), 'ccxt');
        }
        return goImports + content;
    }

    transpileDerivedExchangeFile (tsFolder: string, filename: string, options: any, goResult: any, force = false, ws: boolean | 'prediction' = false, typedSection = '') {

        const tsPath = `${tsFolder}/${filename}`;

        let { goFolder } = options;

        const extensionlessName = filename.replace ('.ts', '');
        const goFilename = filename.replace ('.ts', '.go');

        const tsMtime = fs.statSync (tsPath).mtime.getTime ();

        const go  = this.createGoExchange (extensionlessName, goResult, ws, typedSection);

        if (goFolder) {
            overwriteFileAndFolder (`${goFolder}/${goFilename}`, go);
            // fs.utimesSync (`${goFolder}/${goFilename}`, new Date (), new Date (tsMtime))
        }
    }

    // The two ws test files (go/tests/base/cache/*.go) are assembled by splitting the transpiled
    // source on its section-separator comments and re-joining the parts. Splitting on the comment
    // *text* leaves the comment's own indentation behind as a whitespace-only line, and the
    // re-join puts the comment back at column 0 — both are things gofmt undoes (it trims blank
    // lines and indents a comment to the block it introduces), so normalize them at assembly time.
    // No content change: only the indentation of the separator and the blank lines move.
    normalizeSectionSeparators (content: string, separator: string): string {
        const lines = content.split ('\n');
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].trim () === separator) {
                let j = i + 1;
                while ((j < lines.length) && (lines[j].trim () === '')) {
                    j++;
                }
                const next = (j < lines.length) ? lines[j] : '';
                const indent = next.match (/^[ \t]*/);
                lines[i] = (indent ? indent[0] : '') + separator;
            } else if (lines[i].trim () === '') {
                lines[i] = '';
            }
        }
        return lines.join ('\n');
    }

    // ---------------------------------------------------------------------------------------------
    transpileWsOrderbookTestsToGo (outDir: string, force = true) {

        const jsFile = './ts/src/pro/test/base/test.orderBook.ts';
        const goFile = `${outDir}/cache/orderbook.go`;

        if (skipUpToDateStage ('go', 'ws orderbook test', force, testStageInputs (), [ goFile ])) {
            return;
        }

        log.magenta ('Transpiling from', (jsFile as any).yellow);

        const go = this.transpiler.transpileGoByPath(jsFile);
        let content = go.content;
        const separator = '// --------------------------------------------------------------------------------------------------------------------';
        const splitParts = content.split(separator);
        splitParts.shift();
        content = splitParts.join('\n' + separator + '\n');
        content = this.normalizeSectionSeparators (content, separator);
        content = this.regexAll (content, [
            [/var (\w+) any = GetValue\((\w+), "bids"\)/gm, '$1 := $2.Bids'],
            [/var (\w+) any = GetValue\((\w+), "asks"\)/gm, '$1 := $2.Asks'],
            [/assert/g, 'Assert'],
        ]).trim ();

        const contentLines = content.split ('\n');
        const contentIdented = contentLines.map (line => line).join ('\n');

        const file = [
            'package cache',
            '',
            this.createGeneratedHeader().join('\n'),
            contentIdented,
        ].join('\n') + '\n';

        log.magenta ('→', (goFile as any).yellow);

        overwriteFileAndFolder (goFile, file);
    }

    // ---------------------------------------------------------------------------------------------
    transpileWsCacheTestsToGo (outDir: string, force = true) {

        const jsFile = './ts/src/pro/test/base/test.cache.ts';
        const goFile = `${outDir}/cache/cache.go`;

        if (skipUpToDateStage ('go', 'ws cache test', force, testStageInputs (), [ goFile ])) {
            return;
        }

        log.magenta ('Transpiling from', (jsFile as any).yellow);

        const go = this.transpiler.transpileGoByPath(jsFile);
        let content = go.content;
        const separator = '// ----------------------------------------------------------------------------';
        const splitParts = content.split(separator);
        splitParts.shift();
        content = splitParts.join('\n' + separator + '\n');
        content = this.normalizeSectionSeparators (content, separator);
        content = this.regexAll (content, [
            [/assert/g, 'Assert'],
            [/GetValue\(cacheSymbolSide4/g, 'GetValue(cacheSymbolSide4.ToArray()' ],
            [/GetArrayLength\(cacheSymbolSide4\)/g  , 'GetArrayLength(cacheSymbolSide4.ToArray())'],
        ]).trim ();

        const contentLines = content.split ('\n');
        const contentIdented = contentLines.map (line =>  line).join ('\n');

        const file = [
            'package cache',
            '',
            this.createGeneratedHeader().join('\n'),
            contentIdented,
        ].join('\n') + '\n';

        log.magenta ('→', (goFile as any).yellow);

        overwriteFileAndFolder (goFile, file);
    }

    // ---------------------------------------------------------------------------------------------

    transpileCryptoTestsToGo (outDir: string, force = true) {

        const jsFile = './ts/src/test/base/test.cryptography.ts';
        const goFile = `${outDir}/test.cryptography.go`;

        if (skipUpToDateStage ('go', 'crypto test', force, testStageInputs (), [ goFile ])) {
            return;
        }

        log.magenta ('[go] Transpiling from', (jsFile as any).yellow);

        const go = this.transpiler.transpileGoByPath(jsFile);
        let content = go.content;
        content = this.regexAll (content, [
            [ /Newccxt.Exchange.+\n.+\n.+/gm, 'ccxt.Exchange{}' ],
            [ /func Equals\(.+\n.*\n.*\n.*}/gm, '' ], // remove equals
        ]).trim ();

        const file = [
            'package base',
            '',
            this.createGeneratedHeader().join('\n'),
            content,
        ].join('\n') + '\n';

        log.magenta ('→', (goFile as any).yellow);

        overwriteFileAndFolder (goFile, file);
    }

    transpileExchangeTest(name: string, path: string): [string, string] {
        const go = this.transpiler.transpileGoByPath(path);
        let content = go.content;

        const parsedName = name.replace('.ts', '');
        const parsedParts = parsedName.split('.');
        const finalName = parsedParts[0] + capitalize(parsedParts[1]);

        content = this.regexAll (content, [
            [/assert/g, 'Assert'],
            [/object exchange/g, 'Exchange exchange'],
            [/function test/g, finalName],
        ]).trim ();

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
        ].join('\n');
        return [finalName, file];
    }

    // async transpileExchangeTestsToGo() {
    //     const inputDir = './ts/src/test/exchange';
    //     const outDir = GENERATED_TESTS_FOLDER;
    //     const ignore = [
    //         // 'exportTests.ts',
    //         // 'test.fetchLedger.ts',
    //         'test.throttler.ts',
    //         // 'test.fetchOrderBooks.ts', // uses spread operator
    //     ];

    //     const inputFiles = fs.readdirSync('./ts/src/test/exchange');
    //     const files = inputFiles.filter(file => file.match(/\.ts$/)).filter(file => !ignore.includes(file) );
    //     const transpiledFiles = files.map(file => this.transpileExchangeTest(file, `${inputDir}/${file}`));
    //     await Promise.all (transpiledFiles.map ((file, idx) => writeFile (`${outDir}/${file[0]}.go`, file[1])));
    // }

    async transpileBaseTestsToGo (force = true) {
        const outDir = BASE_TESTS_FOLDER;
        await this.transpileBaseTests(outDir, force);
        this.transpileCryptoTestsToGo(outDir, force);
        this.transpileWsOrderbookTestsToGo(outDir, force);
        this.transpileWsCacheTestsToGo(outDir, force);
    }

    async transpileBaseTests (outDir: string, force = true) {

        const baseFolders = {
            ts: './ts/src/test/base',
        };

        const baseFunctionTests = fs.readdirSync (baseFolders.ts).filter(filename => filename.endsWith('.ts')).map(filename => filename.replace('.ts', ''));
        // `// NO_AUTO_TRANSPILE` sources are emitted by their own stage (test.cryptography)
        const eligible = baseFunctionTests.filter ((testName: string) => !fs.readFileSync (`${baseFolders.ts}/${testName}.ts`).toString ().includes ('// NO_AUTO_TRANSPILE'));
        // the accumulator feeds createFunctionsMapFile(), which rewrites the whole FunctionsMap —
        // it must see every test name even when the transpile below is skipped, otherwise the map
        // silently loses entries and the Go harness stops running those tests
        eligible.forEach ((testName: string) => goTests.push (capitalize (testName)));

        if (skipUpToDateStage ('go', 'base tests', force, testStageInputs (), eligible.map ((testName: string) => `${outDir}/${testName}.go`))) {
            return;
        }

        // route the ~61 sources through the worker pool instead of transpiling them one by
        // one on the main thread: `paths` doubles as the sticky ts.Program root list, so the
        // whole stage shares one program (same shape as the C# driver's base-test stage)
        const paths = eligible.map ((testName: string) => `${baseFolders.ts}/${testName}.ts`);
        const transpiled = await this.webworkerTranspile (paths, this.getTranspilerConfig ());

        for (let i = 0; i < eligible.length; i++) {
            const testName = eligible[i];
            const tsFile = paths[i];

            // const goFileName = capitalize(testName.replace ('test.', ''));
            const goFile = `${outDir}/${testName}.go`;

            log.magenta ('Transpiling from', (tsFile as any).yellow);

            const go = transpiled[i];
            let content = go.content;
            content = this.regexAll (content, [
                // the three statements this rewrite packs onto one line are exactly what gofmt
                // splits back out (one statement per line), so emit the split form at the
                // statement's own indentation — same tokens, gofmt-identical layout
                [/(\w+) := NewCcxt\.Exchange\(([\S\s]+?)\)/gm, (match: string, varName: string, args: string, offset: number, whole: string) => {
                    const indent = statementIndent (whole, offset);
                    return `${varName} := ccxt.NewExchange().(*ccxt.Exchange)\n${indent}${varName}.DerivedExchange = ${varName}\n${indent}${varName}.InitParent(${args}, map[string]any{}, ${varName})`;
                }],
                // instantiate the core type (channel-based methods, implements ICoreExchange) and let
                // Init wire up DerivedExchange/InitParent (Exchange above is the only special case)
                [/(\w+) := NewCcxt\.(\w+)\(([\S\s]+?)\)/gm, (match: string, varName: string, className: string, args: string, offset: number, whole: string) => {
                    const indent = statementIndent (whole, offset);
                    return `${varName} := ccxt.New${className}Core()\n${indent}${varName}.Init(${args})`;
                }],
                [/exchange any, /g,'exchange *ccxt.Exchange, '], // in arguments
                [/ any(?= \= map\[string\]any )/g, ' map[string]any'], // fix incorrect variable type
                [ /any\sfunc\sEquals.+\n.*\n.+\n.+/gm, '' ], // remove equals
                [/Precise\.String/gm, 'ccxt.Precise.String'],
                // Base-test helpers and the Safe* accessors return `any`/typed pointers, so the
                // printer's inlined `call == literal` is either a compile error or an
                // interface-vs-untyped-constant mismatch that is always false. Route the whole
                // family (Safe*, PrecisionFromString, Crc32, Rsa, Jwt, ...) back through IsEqual.
                [/(?<![.\w])((?:exchange\.)?[A-Z]\w*\((?:[^()]|\([^()]*\))*\)) == (("(?:[^"\\]|\\.)*")|(?:ccxt\.)?OpNeg\([^()]*\)|-?\d+(?:\.\d+)?)/g, 'IsEqual($1, $2)'],
                // SafeBool* now return `*bool` (the pointer layer): an `any` local that
                // captures the call must keep holding the plain value, exactly as it did before
                // that change, because test code compares such locals against untyped bool
                // constants (`local != true`) -- always true for an interface holding a *bool.
                // Mirrors the DerefScalar() wrap the exchange-body pass applies to this.SafeBool*.
                [/(var \w+ any = )(exchange\.Safe(?:Bool|String(?:Lower|Upper)?|Integer(?:Product)?|Timestamp|Float|Number)(?:2|N)?\((?:[^()]|\([^()]*\))*\))/g, '$1ccxt.DerefScalar($2)'],
                [ /testSharedMethods\./gm, '' ], // no need of class reference
                [ /func Equals\(.+\n.*\n.*\n.*\}/gm, '' ], // remove equals
                // the markers sit inside `// ` comments: drop the marker text and the space
                // the comment left in front of it, so no `// ` trailing-space line survives
                [ /[ \t]*\@SKIP_START_GO[\s\S]*?\@SKIP_END_GO/gm, '' ],
                // Match ArrayCache variables and cast to appropriate type based on variable name
                // Order matters: check most specific types first
                [/(\w*ArrayCacheBySymbolBySide\w*)\.Hashmap/g, '$1.(*ccxt.ArrayCacheBySymbolBySide).Hashmap'],
                [/(\w*ArrayCacheByTimestamp\w*)\.Hashmap/g, '$1.(*ccxt.ArrayCacheByTimestamp).Hashmap'],
                [/(\w*ArrayCacheBySymbolById\w*)\.Hashmap/g, '$1.(*ccxt.ArrayCacheBySymbolById).Hashmap'],
                // General ArrayCache pattern (must not match the specific types above)
                [/(\w+ArrayCache(?!BySymbolBySide|ByTimestamp|BySymbolById)\w*)\.Hashmap/g, '$1.(*ccxt.ArrayCache).Hashmap'],
                // Match stored/cached/orders patterns - explicit patterns for common variable names
                [/\bstored\.Hashmap/g, 'stored.(*ccxt.ArrayCache).Hashmap'],
                [/\bcached\.Hashmap/g, 'cached.(*ccxt.ArrayCache).Hashmap'],
                [/\b([Oo]rders)\.Hashmap/g, '$1.(*ccxt.ArrayCache).Hashmap'],

            ]).trim ();

            if (testName !== 'tests.init') {
                // Add package prefix to functions and types from the ccxt package
                content = this.addPackagePrefix(content, this.extractTypeAndFuncNames(EXCHANGES_FOLDER), 'ccxt');
            }

            const file = [
                'package base',
                // gofmt always separates the package clause from the next declaration by one blank
                // line (also when that declaration is the import clause); the import clause itself
                // is only present for the auto-transpiled tests (tests.init has none, and then the
                // single '' above is already the blank line before the generated-header comment)
                '',
                ...(testName.indexOf ('tests.init') === -1 ? [ 'import ccxt "github.com/ccxt/ccxt/go/v4"', '' ] : []),
                this.createGeneratedHeader().join('\n'),
                content,
            ].join('\n') + '\n';

            log.magenta ('→', (goFile as any).yellow);

            overwriteFileAndFolder (goFile, file);
        }
    }

    transpileMainTest(files: any) {
        log.magenta ('[go] Transpiling from', files.tsFile.yellow);
        let ts = fs.readFileSync (files.tsFile).toString ();

        ts = this.regexAll (ts, [
            [ /\'use strict\';?\s+/g, '' ],
            // the Go harness stores this field as an untyped `any` (it also appends to it), so
            // rewrite the annotation in the SOURCE: rewriting the printed `[]any` instead would
            // land after the printer has already aligned the struct fields (go/printer pads the
            // type column of the tag-carrying fields) and leave the padding stale.
            [ /onlySpecificTests: string\[\]/g, 'onlySpecificTests: any' ],
        ]);

        const mainContent = ts;
        const go = this.transpiler.transpileGo(mainContent);
        let contentIndentend = go.content;

        // ad-hoc fixes
        contentIndentend = this.regexAll (contentIndentend, [
            [/var (mockedExchange|exchange) any =/g, 'var $1 ccxt.ICoreExchange ='],
            [/exchange any([,)])/g, 'exchange ccxt.ICoreExchange$1'],
            // these 62 symbol-based methods are trimmed from ICoreExchange (so prediction cores satisfy
            // it), so call sites in the harness type-assert to the per-method interface (ccxt.I<Method>)
            // for exactly the method called. A prediction venue that overrides only some of these runs
            // the has-gated test for the ones it has, and each single-method assertion succeeds.
            [/exchange\.(FetchL2OrderBook|FetchPositions|FetchTickers|FetchOpenOrders|EditOrder|FetchOrder|CancelOrderWithClientOrderId|CancelOrdersWithClientOrderIds|EditOrderWithClientOrderId|FetchOrderWithClientOrderId|FetchBidsAsks|WatchBidsAsks|WatchOrderBookForSymbols|WatchPosition|WatchTradesForSymbols)(Async)?\(/g, 'exchange.(ccxt.I$1).$1$2('],
            GO_TEST_ANY_RECEIVE_REGEX,
            // SafeBool* now return `*bool` (the pointer layer): an `any` local that captures
            // the call must keep holding the plain value, exactly as it did before that change,
            // because test code compares such locals against untyped bool constants
            // (`local != true`) -- always true for an interface holding a *bool. Mirrors the
            // DerefScalar() wrap the exchange-body pass applies to this.SafeBool*.
            [/(var \w+ any = )(exchange\.Safe(?:Bool|String(?:Lower|Upper)?|Integer(?:Product)?|Timestamp|Float|Number)(?:2|N)?\((?:[^()]|\([^()]*\))*\))/g, '$1ccxt.DerefScalar($2)'],
            // the (?!=) guard keeps the assignment rewrite off == comparisons
            [/exchange\.(\w+)\s*=(?!=)\s*(.+)/g, 'exchange.Set$1($2)'],
            [/exchange\.(\w+)(,|;|\)|\s)/g, 'exchange.Get$1()$2'],
            [/InitOfflineExchange\(exchangeName any, optionalArgs \.\.\.any\) any\s+{/g, 'InitOfflineExchange(exchangeName any, optionalArgs ...any) ccxt.ICoreExchange {'],
            [/assert\(/g, 'Assert('],
            [ /any\sfunc\sEquals.+\n.*\n.+\n.+/gm, '' ], // remove equals
        ]);

        const file = [
            'package base',
            // gofmt always separates the package clause from the import clause by one blank line
            '',
            'import ccxt "github.com/ccxt/ccxt/go/v4"',
            '',
            this.createGeneratedHeader().join('\n'),
            contentIndentend,
        ].join('\n');

        overwriteFileAndFolder (files.goFile, file);
    }

    async transpileExchangeTests(force = true){
        const baseFolders = {
            ts: './ts/src/test/Exchange',
            tsBase: './ts/src/test/Exchange/base',
            goBase: './go/tests/base',
            go: './go/tests/base',
        };

        let baseTests = fs.readdirSync (baseFolders.tsBase).filter(filename => filename.endsWith('.ts')).map(filename => filename.replace('.ts', ''));
        let exchangeTests = fs.readdirSync (baseFolders.ts).filter(filename => filename.endsWith('.ts')).map(filename => filename.replace('.ts', ''));

        // ignore throttle test for now
        baseTests = baseTests.filter (filename => filename !== 'test.throttle');
        exchangeTests = exchangeTests.filter (filename => filename !== 'test.proxies' &&  filename !== 'test.fetchLastPrices' && filename !== 'test.createOrder');

        const tests: any[] = [] as any;
        baseTests.forEach (baseTest => {
            tests.push({
                base: true,
                name:baseTest,
                tsFile: `${baseFolders.tsBase}/${baseTest}.ts`,
                goFile: `${baseFolders.goBase}/${baseTest}.go`,
            });
        });
        exchangeTests.forEach (test => {
            tests.push({
                base: false,
                name: test,
                tsFile: `${baseFolders.ts}/${test}.ts`,
                goFile: `${baseFolders.go}/${test}.go`,
            });
        });

        const testNames = tests.map (test => test.name);
        // push before the gate: createFunctionsMapFile() rewrites the whole map from this
        // accumulator, so a skipped stage must still contribute its names
        testNames.forEach (test => goTests.push(test));

        if (skipUpToDateStage ('go', 'exchange tests', force, testStageInputs (), [ BASE_TESTS_FILE ].concat (tests.map ((t: any) => t.goFile)))) {
            return;
        }

        const baseTestsOnly = process.argv.includes ('--baseTests');
        if (baseTestsOnly) return;

        // remove above later debug only
        this.transpileMainTest({
            'tsFile': './ts/src/test/tests.ts',
            'goFile': BASE_TESTS_FILE,
        });
        await this.transpileAndSaveGoExchangeTests (tests);
    }

    async transpileWsExchangeTests(force = true){

        const baseFolders = {
            ts: `./ts/src/pro/test/Exchange`,
            go: `${GENERATED_TESTS_FOLDER}/base`,
        };

        const wsTests = fs.readdirSync (baseFolders.ts).filter(filename => filename.endsWith('.ts')).map(filename => filename.replace('.ts', ''));

        const tests = [] as any;

        wsTests.forEach (test => {
            tests.push({
                name: test,
                tsFile: `${baseFolders.ts}/${test}.ts`,
                goFile: `${baseFolders.go}/${test}.go`,
            });
            goWsTests.push(test)
        });

        if (skipUpToDateStage ('go', 'ws exchange tests', force, testStageInputs (), tests.map ((t: any) => t.goFile))) {
            return;
        }

        const baseTestsOnly = process.argv.includes ('--baseTests');
        if (baseTestsOnly) return;
        await this.transpileAndSaveGoExchangeTests (tests, true);
    }

    async transpileAndSaveGoExchangeTests(tests: any[], isWs = false) {
        let paths = tests.map(test => test.tsFile);
        // paths = [paths[30]];
        const flatResult = await this.webworkerTranspile (paths,  this.getTranspilerConfig());
        flatResult.forEach((file, idx) => {
            // the transpiled base tests are top-level funcs: gofmt puts them in column 0, so no
            // indentation prefix is applied here (the old 4-space one was stripped by gofmt)
            let contentIndentend = file.content;

            let regexes = [
                [/exchange := (?:&)?ccxt\.Exchange\{\}/g, 'exchange := ccxt.NewExchange()'],
                [/exchange := (?:&)?ccxt\.Coinbase\{\}/g, 'exchange := ccxt.NewCoinbase()'],
                [/exchange any([,)])/g, 'exchange ccxt.ICoreExchange$1'],
                // 62 symbol-based methods trimmed from ICoreExchange → assert to the per-method interface
                // (ccxt.I<Method>) for exactly the method called, so a prediction venue that overrides
                // only some of them satisfies each has-gated per-method assertion it actually runs.
                [/exchange\.(FetchL2OrderBook|FetchPositions|FetchTickers|FetchOpenOrders|EditOrder|FetchOrder|CancelOrderWithClientOrderId|CancelOrdersWithClientOrderIds|EditOrderWithClientOrderId|FetchOrderWithClientOrderId|FetchBidsAsks|WatchBidsAsks|WatchOrderBookForSymbols|WatchPosition|WatchTradesForSymbols)(Async)?\(/g, 'exchange.(ccxt.I$1).$1$2('],
                GO_TEST_ANY_RECEIVE_REGEX,
                // SafeBool* now return `*bool` (the pointer layer): an `any` local that
                // captures the call must keep holding the plain value, exactly as it did before
                // that change, because these tests compare such locals against untyped bool
                // constants (`local != true`) -- always true for an interface holding a *bool.
                // Mirrors the DerefScalar() wrap the exchange-body pass applies to this.SafeBool*.
                [/(var \w+ any = )(exchange\.Safe(?:Bool|String(?:Lower|Upper)?|Integer(?:Product)?|Timestamp|Float|Number)(?:2|N)?\((?:[^()]|\([^()]*\))*\))/g, '$1ccxt.DerefScalar($2)'],
                [/testSharedMethods\./g, ''], // no need of class reference
                [/assert/gm, 'Assert'],
                [/exchange\.(\w+)\s*=(?!=)\s*(.+)/g, 'exchange.Set$1($2)'],
                [/exchange\.(\w+)(,|;|\)|\s)/g, 'exchange.Get$1()$2'],
                [/Precise\./gm, 'ccxt.Precise.'],
                // the spawned helper is an async test function, i.e. a suffixed channel trampoline
                [/Spawn\(createOrderAfterDelay/g, `Spawn(CreateOrderAfterDelay${GO_ASYNC_SUFFIX}`],
                [/(<-exchange.Watch\w+\(.+\))/g, 'UnWrapType($1)'],
                // [/<-exchange.WatchOrderBook\(symbol\)/g, '(ToOrderBook(<-exchange.WatchOrderBook(symbol)))'], // orderbook watch
                // [/<-exchange.WatchOrderBookForSymbols\((.*?)\)/g, '(ToOrderBook(<-exchange.WatchOrderBookForSymbols($1)))'],
                [/(any\sfunc\sEquals.+\n.*\n.+\n.+|func Equals\(.+\n.*\n.*\n.*\})/gm, ''], // remove equals
                // Fix infinite loop bug in WebSocket tests - move now = exchange.Milliseconds() outside success check
                [/(\s+)(if IsTrue\(IsEqual\(success, true\)\) \{\s*\n[\s\S]*?)(\s+now = exchange\.Milliseconds\(\)\s*\n\s*\})/gm, '$1$2$1now = exchange.Milliseconds()$3'],
                // apply 'getPreTranspilationRegexes' here, bcz in GO we don't have pre-transpilation regexes
                [/exchange.JsonStringifyWithNull/g, 'JsonStringify'],
                


                // [ /object exchange(?=[,)])/g, 'Exchange exchange' ],
                // [ /throw new Error/g, 'throw new Exception' ],
                // [/testSharedMethods\.assertTimestampAndDatetime\(exchange, skippedProperties, method, orderbook\)/, '// testSharedMethods.assertTimestampAndDatetime (exchange, skippedProperties, method, orderbook)'], // tmp disabling timestamp check on the orderbook
                // [ /void function/g, 'void'],
            ];

            if (isWs) {
                // add ws-tests specific regeces
                regexes = regexes.concat([
                    [/await exchange.watchOrderBook\(symbol\)/g, '((IOrderBook)(await exchange.watchOrderBook(symbol))).Copy()'],
                    [/await exchange.watchOrderBookForSymbols\((.*?)\)/g, '((IOrderBook)(await exchange.watchOrderBookForSymbols($1))).Copy()'],
                ]);
            }

            contentIndentend = this.regexAll (contentIndentend, regexes);
            const namespace = 'package base';
            let imports = 'import "github.com/ccxt/ccxt/go/v4"';
            const fmtImport = contentIndentend.indexOf('fmt.Println') > -1 ? 'import "fmt"' : '';
            imports = [imports, fmtImport].filter(x => x).join('\n');
            const fileHeaders = [
                namespace,
                // gofmt always separates the package clause from the import clause by one blank line
                '',
                imports,
                '',
                this.createGeneratedHeader().join('\n'),
            ];
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

    async transpileTests(force = true){
        if (!shouldTranspileTests) {
            log.bright.yellow ('Skipping tests transpilation');
            return;
        }
        // every stage is awaited: the test writers are async (they go through the pool),
        // and letting them float meant `transpileEverything` returned — and the WS stage
        // started — while ~80 test files were still being printed, so three root sets
        // alternated against the worker sticky-Program LRU
        await this.transpileBaseTestsToGo(force);
        await this.transpileExchangeTests(force);
        await this.transpileWsExchangeTests(force);
        this.createFunctionsMapFile(force);
    }

    createFunctionsMapFile(force = true) {
        // derived purely from the test source listings collected above
        if (skipUpToDateStage ('go', 'functions map file', force, testStageInputs (), [ `${BASE_TESTS_FOLDER}/test.functions.go` ])) {
            return;
        }
        // const normalizedTestNames = goTests.map(test => 'Test' + capitalize(test.replace('Test.', '').replace('test.', '')) );
        const normalizedTestNames: string[] = [];
        const normalizedFunctionNames: string[] = [];

        //ws
        const normalizedWsTestNames: string[] = [];
        const normalizedWsFunctionNames: string[] = [];
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
            test = 'Test' + capitalize(methodName);
            normalizedTestNames.push(test);
        }

        for (let test of goWsTests) {
            const skipTests: any = [];
            if (skipTests.includes(test)) {
                continue;
            }
            if (test === 'test.ohlcv') {
                test = 'test.OHLCV';
            }
            const methodName = test.replace('Test.', '').replace('test.', '');
            normalizedWsFunctionNames.push(methodName);
            test = 'Test' + capitalize(methodName);
            normalizedWsTestNames.push(test);
        }

        // an async test transpiles to `Test<Name>Async` (channel-returning); the map keeps the
        // unified method name as key and points at whichever symbol the test file declares
        const goTestSymbol = (test: string, methodName: string): string => {
            const goFile = `${BASE_TESTS_FOLDER}/test.${methodName}.go`;
            if (fs.existsSync (goFile) && fs.readFileSync (goFile, 'utf8').includes (`func ${test}${GO_ASYNC_SUFFIX}(`)) {
                return test + GO_ASYNC_SUFFIX;
            }
            return test;
        };
        const file = [
            'package base',
            '',
            this.createGeneratedHeader().join('\n'),
            'var FunctionsMap = map[string]any{',
            // F09 — gofmt aligns the value of every consecutive single-line entry of a
            // composite literal to the widest key of the run (go/printer exprList +
            // text/tabwriter); route these hand-written entries through the same rule the
            // ast printer uses, so the column comes out where gofmt would put it. The
            // entries carry no comma: alignGoCompositeEntries renders it.
            ...this.transpiler.goTranspiler.alignGoCompositeEntries (normalizedTestNames.map((test,i) => `\t"${normalizedFunctionNames[i]}": ${goTestSymbol (test, normalizedFunctionNames[i])}`)),
            '}',
            '',
            'var WsFunctionsMap = map[string]any{',
            ...this.transpiler.goTranspiler.alignGoCompositeEntries (normalizedWsTestNames.map((test,i) => `\t"${normalizedWsFunctionNames[i]}": ${goTestSymbol (test, normalizedWsFunctionNames[i])}`)),
            '}',
        ].join('\n') + '\n';
        overwriteFileAndFolder (`${BASE_TESTS_FOLDER}/test.functions.go`, file);
    }

    transpileProTypes(force = true) {
        const GO_TYPES_FILE = "./go/v4/exchange_types.go";
        const GO_TYPES_FILE_PRO = "./go/v4/pro/exchange_types.go";

        // mirrors the hand-written go/v4/exchange_types.go into the pro package
        if (skipUpToDateStage ('go', 'pro types', force, [ GO_TYPES_FILE ], [ GO_TYPES_FILE_PRO ])) {
            return;
        }

        const output: string[] = [
            'package ccxtpro',
            '',
            'import ccxt "github.com/ccxt/ccxt/go/v4"',
            '',
            ...this.createGeneratedHeader().filter (line => line !== ''),
            '',
        ];
        const file = fs.readFileSync(GO_TYPES_FILE, "utf8");
        const lines = file.split(/\r?\n/);

        const structRegex = /^type\s+(\w+)\s+struct\s*{/;
    
        for (const line of lines) {
            const structMatch = line.match(structRegex);

            if (structMatch) {
                output.push(`type ${structMatch[1]} = ccxt.${structMatch[1]}`);
                continue;
            }
        }

        fs.writeFileSync(GO_TYPES_FILE_PRO, formatGoSource(GO_TYPES_FILE_PRO, normalizeGoFileHeader (alignGoTrailingComments(output.join("\n")) + "\n")), "utf8");
    }
    
}

// Module-level accumulators that a fresh process used to zero for us. --rest-and-ws runs
// both stages in ONE process, so the ws stage must start from the same blank slate the
// second `goTranspiler.ts --ws` process had — otherwise safeOptionsStructFile() dumps the
// REST structs into go/v4/pro/exchange_wrapper_structs.go as well.
function resetPerStageAccumulators () {
    for (const k of Object.keys (goTypeOptions)) {
        delete goTypeOptions[k];
    }
    baseGoTypeOptionNames.clear ();
    predictionLocalOptionStructs.clear ();
}

// ===== Local-typing audit (`--audit-local-types`) =====
//
// The go-locals campaign's shippable gate; mirrors build/javaTranspiler.ts `--audit-string-types`.
//
//   1. census: declarations / any / typed over go/v4 — the numbers census.sh prints — plus the
//      typed breakdown by declared type and the remaining `any` declarations grouped by the
//      callee of their initializer, so the untouched clusters stay visible;
//   2. declaration-diff gate: every line that changed in a GENERATED go/v4 file, with gofmt
//      normalization applied to BOTH sides first, must pair with a removed line as a declaration
//      retype (same var name, same initializer modulo `derefScalar(...)` wrappers — the
//      pointer-transparency wrapper the Safe*/arith shims take). Anything else is `other` and
//      fails the run. Normalizing with gofmt is what makes the gate usable on this tree: the
//      base commit regenerated its go files without gofmt, so a correct reindent of a whole file
//      is invisible here — and unlike a whitespace-insensitive text diff it cannot hide a
//      semantic edit inside a string literal;
//   3. `--parity [id...]`: proves build/go-worker.ts (Piscina) and the main-thread path emit
//      byte-identical Go for typed locals. Per file, the main-thread `transpileGoByPath` output
//      is compared against the worker's `createProgramBatch` output across two pool shapes
//      (1 and 2 threads), and a negative control — the same printer with the ccxt hook NOT
//      installed — must emit untyped declarations for the same file, or the comparison would
//      prove nothing about the hook being live on both sides.
//
//   npx tsx build/goTranspiler.ts --audit-local-types [--base <ref>] [--target <ref>] [--json]
//   npx tsx build/goTranspiler.ts --audit-local-types --parity [id...] [--roots-all]
//   npx tsx build/goTranspiler.ts --audit-local-types --self-test

const LOCAL_AUDIT_SCOPE = 'go/v4';
const LOCAL_AUDIT_GEN_MARKER = 'PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED';
// census shapes, byte-for-byte the ones census.sh greps for
const LOCAL_AUDIT_CENSUS_DECL_RX = /^\s+var [A-Za-z0-9_]+ [^=]+= /;
const LOCAL_AUDIT_CENSUS_ANY_RX = /^\s+var [A-Za-z0-9_]+ any = /;
const LOCAL_AUDIT_CENSUS_TYPE_RX = /^\s+var [A-Za-z0-9_]+ ([^=]+) = /;
// one declaration, parsed: `var <name> <type> = <init>` (no Go type contains '=')
const LOCAL_AUDIT_DECL_RX = /^(\s*)var\s+([A-Za-z_][A-Za-z0-9_]*)\s+([^=]+?)\s*=\s*(.*)$/;

function localAuditRun (cmd: string, args: string[], input?: string) {
    const res = spawnSync (cmd, args, { 'input': input, 'encoding': 'utf8', 'maxBuffer': 256 * 1024 * 1024, 'windowsHide': true });
    return { 'status': res.status, 'error': res.error, 'stdout': res.stdout ?? '', 'stderr': res.stderr ?? '' };
}

const localAuditGit = (repo: string, args: string[]) => localAuditRun ('git', [ '-C', repo, ...args ]);

// null when gofmt is missing or the text does not parse as Go
function localAuditGofmt (text: string) {
    const res = localAuditRun ('gofmt', [], text);
    if (res.error || res.status !== 0) {
        return null;
    }
    return res.stdout;
}

// whitespace outside string literals is the only thing gofmt moves: dropping it compares two
// lines for semantic identity without caring about indentation or gofmt's key alignment
function localAuditStripWs (s: string) {
    let out = '';
    let quote = '';
    for (let i = 0; i < s.length; i++) {
        const c = s[i];
        if (quote) {
            out += c;
            if (c === '\\' && quote !== '`') { out += s[++i] ?? ''; continue; }
            if (c === quote) { quote = ''; }
            continue;
        }
        if (c === '"' || c === "'" || c === '`') { quote = c; out += c; continue; }
        if (c === ' ' || c === '\t' || c === '\r') { continue; }
        out += c;
    }
    return out;
}

// `derefScalar(<balanced>)` / `DerefScalar(<balanced>)` -> `<balanced>`, repeatedly: the no-op
// unwrap a typed local forces on its initializer (or that a retyped local no longer needs, when
// the family removes the wrapper the `any` form carried). Leaves anything not balanced alone.
const LOCAL_AUDIT_DEREF_NAMES = [ 'derefScalar(', 'DerefScalar(' ];
function localAuditStripDeref (s: string) {
    for (;;) {
        let at = -1, open = '';
        for (const name of LOCAL_AUDIT_DEREF_NAMES) {
            const idx = s.indexOf (name);
            if (idx !== -1 && (at === -1 || idx < at)) { at = idx; open = name; }
        }
        if (at === -1) { return s; }
        let depth = 1, i = at + open.length, closed = -1;
        for (; i < s.length; i++) {
            const c = s[i];
            if (c === '"' || c === "'" || c === '`') {
                const q = c; i++;
                while (i < s.length && s[i] !== q) { if (s[i] === '\\') { i++; } i++; }
                continue;
            }
            if (c === '(') { depth++; }
            else if (c === ')') { depth--; if (depth === 0) { closed = i; break; } }
        }
        if (closed === -1) { return s; }
        s = s.slice (0, at) + s.slice (at + open.length, closed) + s.slice (closed + 1);
    }
}

const localAuditInitNorm = (s: string) => localAuditStripWs (localAuditStripDeref (s));

// 'format'  — same line up to whitespace/gofmt alignment
// 'declaration' — same var name, same initializer, declared type token changed
// 'coercion' — differs only by derefScalar(...) wrappers somewhere on the line
// 'other' — anything else: fails the gate
function localAuditPairKind (removed: string, added: string) {
    if (localAuditStripWs (removed) === localAuditStripWs (added)) { return 'format'; }
    const r = removed.match (LOCAL_AUDIT_DECL_RX);
    const a = added.match (LOCAL_AUDIT_DECL_RX);
    if (r && a && r[2] === a[2] && localAuditInitNorm (r[4]) === localAuditInitNorm (a[4])) {
        return (r[3].trim () === a[3].trim ()) ? 'format' : 'declaration';
    }
    if (localAuditInitNorm (removed) === localAuditInitNorm (added)) { return 'coercion'; }
    return 'other';
}

function localAuditInitKey (init: string) {
    const v = init.trim ();
    let m = v.match (/^\(<-(this\.[A-Za-z0-9_]+)\(/);
    if (m) { return `await ${m[1]}`; }
    m = v.match (/^([A-Za-z_][A-Za-z0-9_.]*)\(/);
    if (m) { return `${m[1]}(`; }
    if (/^"[^"]*"$/.test (v)) { return '"strlit"'; }
    if (/^[0-9]+$/.test (v)) { return 'intlit'; }
    if (/^(true|false)$/.test (v)) { return 'boollit'; }
    if (/^nil$/.test (v)) { return 'nil'; }
    return v.length > 40 ? v.slice (0, 40) + '...' : v;
}

function localAuditCensus (dir: string, recursive = false) {
    const out: any = { 'dir': dir, 'files': 0, 'declarations': 0, 'any': 0, 'typed': 0, 'byType': {} as Record<string, number>, 'anyByInit': {} as Record<string, number>, 'derefScalar': 0, 'derefScalarExported': 0 };
    if (!fs.existsSync (dir)) { return out; }
    const bump = (map: Record<string, number>, key: string) => { map[key] = (map[key] ?? 0) + 1; };
    const visit = (d: string) => {
        for (const e of fs.readdirSync (d, { 'withFileTypes': true })) {
            const p = path.join (d, e.name);
            if (e.isDirectory ()) { if (recursive) { visit (p); } continue; }
            if (!e.isFile () || !e.name.endsWith ('.go')) { continue; }
            out.files++;
            const text = fs.readFileSync (p, 'utf8');
            out.derefScalar += text.split ('derefScalar(').length - 1;
            out.derefScalarExported += text.split ('DerefScalar(').length - 1;
            for (const line of text.split ('\n')) {
                if (!LOCAL_AUDIT_CENSUS_DECL_RX.test (line)) { continue; }
                out.declarations++;
                const decl = line.match (LOCAL_AUDIT_DECL_RX);
                if (LOCAL_AUDIT_CENSUS_ANY_RX.test (line)) {
                    out.any++;
                    bump (out.anyByInit, decl ? localAuditInitKey (decl[4]) : line.trim ());
                    continue;
                }
                out.typed++;
                const tm = line.match (LOCAL_AUDIT_CENSUS_TYPE_RX);
                bump (out.byType, tm ? tm[1].trim () : '?');
            }
        }
    };
    visit (dir);
    return out;
}

function localAuditParseHunks (diffText: string) {
    const hunks: any[] = [];
    let hunk: any = null, newLine = 0;
    for (const raw of diffText.split ('\n')) {
        if (raw.startsWith ('@@')) {
            const m = raw.match (/^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
            newLine = m ? parseInt (m[1], 10) : 0;
            hunk = { 'removed': [], 'added': [] };
            hunks.push (hunk);
            continue;
        }
        if (!hunk) { continue; }
        if (raw.startsWith ('+')) { hunk.added.push ({ 'text': raw.slice (1), 'line': newLine }); newLine++; }
        else if (raw.startsWith ('-')) { hunk.removed.push ({ 'text': raw.slice (1) }); }
        else if (raw.startsWith (' ')) { newLine++; }
    }
    return hunks;
}

function localAuditDiffAudit (repo: string, base: string, target: string | null, scope: string) {
    const report: any = { 'scope': scope, 'base': base, 'target': target, 'files': [], 'skippedHandwritten': [], 'gofmtMissing': false, 'totals': { 'declaration': 0, 'coercion': 0, 'format': 0, 'other': 0 } };
    const nameArgs = [ 'diff', '--name-only', '--diff-filter=AM', base ];
    if (target) { nameArgs.push (target); }
    nameArgs.push ('--', scope);
    const names = localAuditGit (repo, nameArgs).stdout.split ('\n').map ((x) => x.trim ()).filter ((x) => x.length);
    const tmp = fs.mkdtempSync (path.join (os.tmpdir (), 'go-local-audit-'));
    try {
        for (const file of names) {
            const readSide = (ref: string | null) => {
                if (ref) {
                    const res = localAuditGit (repo, [ 'show', `${ref}:${file}` ]);
                    return res.status === 0 ? res.stdout : null;
                }
                try { return fs.readFileSync (path.join (repo, file), 'utf8'); } catch (e) { return null; }
            };
            const before = readSide (base), after = readSide (target);
            if (!(after ?? before ?? '').includes (LOCAL_AUDIT_GEN_MARKER)) { report.skippedHandwritten.push (file); continue; }
            const fmtBefore = before === null ? '' : localAuditGofmt (before);
            const fmtAfter = after === null ? '' : localAuditGofmt (after);
            const rec: any = { 'path': file, 'declaration': 0, 'coercion': 0, 'format': 0, 'other': 0, 'otherLines': [] };
            if ((before !== null && fmtBefore === null) || (after !== null && fmtAfter === null)) {
                // a generated go file must parse; gofmt missing would silently weaken the gate
                if (localAuditRun ('gofmt', [], 'package x\n').error) { report.gofmtMissing = true; }
                rec.other++;
                report.totals.other++;
                rec.otherLines.push ('gofmt could not normalize ' + ((before !== null && fmtBefore === null) ? 'the base' : 'the target') + ' revision (missing gofmt or invalid go)');
                report.files.push (rec);
                continue;
            }
            const beforePath = path.join (tmp, 'before.go'), afterPath = path.join (tmp, 'after.go');
            fs.writeFileSync (beforePath, fmtBefore ?? '');
            fs.writeFileSync (afterPath, fmtAfter ?? '');
            const diff = localAuditRun ('git', [ 'diff', '--no-index', '--no-color', '-U0', '--', beforePath, afterPath ]);
            for (const h of localAuditParseHunks (diff.stdout)) {
                const unusedR: number[] = h.removed.map ((_: any, i: number) => i);
                for (const a of h.added) {
                    let ri = unusedR.find ((r) => localAuditPairKind (h.removed[r].text, a.text) === 'format');
                    if (ri === undefined) { ri = unusedR.find ((r) => localAuditPairKind (h.removed[r].text, a.text) === 'declaration'); }
                    if (ri === undefined) { ri = unusedR.find ((r) => localAuditPairKind (h.removed[r].text, a.text) === 'coercion'); }
                    if (ri === undefined) {
                        rec.other++;
                        report.totals.other++;
                        rec.otherLines.push ('+ ' + a.text);
                        continue;
                    }
                    const kind = localAuditPairKind (h.removed[ri].text, a.text);
                    unusedR.splice (unusedR.indexOf (ri), 1);
                    rec[kind]++;
                    report.totals[kind]++;
                    if (kind === 'other') { rec.otherLines.push ('- ' + h.removed[ri].text + '\n    + ' + a.text); }
                }
                for (const ri of unusedR) {
                    rec.other++;
                    report.totals.other++;
                    rec.otherLines.push ('- ' + h.removed[ri].text);
                }
            }
            report.files.push (rec);
        }
    } finally {
        fs.rmSync (tmp, { 'recursive': true, 'force': true });
    }
    return report;
}

// every declaration in `content` whose initializer callee is a ccxt hook callee AND whose
// declared type matches what the hook table promises — 0 with the hook uninstalled
function localAuditHookTypedCount (content: string) {
    let n = 0;
    for (const line of content.split ('\n')) {
        const m = line.match (LOCAL_AUDIT_DECL_RX);
        if (!m) { continue; }
        const type = m[3].trim (), init = m[4].trim ();
        const open = init.indexOf ('(');
        if (open <= 0) { continue; }
        const callee = init.substring (0, open);
        if ((CCXT_GO_HELPER_RETURN_TYPES as any)[callee] === type) { n++; }
    }
    return n;
}

function localAuditEmitStats (content: string) {
    let anyCount = 0, total = 0;
    for (const line of content.split ('\n')) {
        if (!LOCAL_AUDIT_CENSUS_DECL_RX.test (line)) { continue; }
        total++;
        if (LOCAL_AUDIT_CENSUS_ANY_RX.test (line)) { anyCount++; }
    }
    return { 'declarations': total, 'any': anyCount, 'typed': total - anyCount, 'hookTyped': localAuditHookTypedCount (content) };
}

const LOCAL_AUDIT_PARITY_DEFAULT_IDS = [ 'cryptomus', 'bitflyer', 'gemini', 'alpaca' ];

// first differing line between two emits, for the failure diagnostics
function localAuditFirstDiff (x: string, y: string) {
    const xs = x.split ('\n'), ys = y.split ('\n');
    for (let i = 0; i < Math.max (xs.length, ys.length); i++) {
        if (xs[i] !== ys[i]) {
            return `L${i + 1}: ${JSON.stringify ((xs[i] ?? '<eof>').slice (0, 120))} vs ${JSON.stringify ((ys[i] ?? '<eof>').slice (0, 120))}`;
        }
    }
    return '';
}

async function runLocalTypeParity (ids: string[], rootsAll: boolean) {
    const files = ids.map ((id) => `ts/src/${id}.ts`);
    const missing = files.filter ((f) => !fs.existsSync (f));
    if (missing.length) {
        console.error ('local-type parity: no such ts source(s): ' + missing.join (', '));
        process.exit (1);
    }
    const config = new NewTranspiler ().getTranspilerConfig ();
    const configKey = JSON.stringify (config);
    // the stage list the worker's sticky ts.Program is built over: a scoped CLI run passes the
    // exchange files it is transpiling, a full build passes the whole stage
    const roots = rootsAll ? exchangeIds.map ((id: string) => `ts/src/${id}.ts`) : files;

    // main-thread path: exactly what transpileDerivedExchangeFiles does for one file
    const driver = new NewTranspiler ();
    const main = files.map ((f) => driver.transpiler.transpileGoByPath (f));

    // piscina path: build/go-worker.ts, one task per file, the same payload webworkerTranspile sends
    const runPool = async (maxThreads: number) => {
        const pool = new Piscina ({ 'filename': resolve (__dirname, 'go-worker.ts'), maxThreads });
        try {
            const tasks = files.map ((f) => pool.run ({ 'transpilerConfig': config, 'configKey': configKey, 'roots': roots, 'files': [ f ] }));
            const results = await Promise.all (tasks);
            return results.map ((r: any) => (r.files ?? [ r.file ])[0]);
        } finally {
            await pool.destroy ();
        }
    };
    const poolA = await runPool (1);
    const poolB = await runPool (2);

    // negative control: the printer WITHOUT the ccxt hook must not produce the typed declarations
    const bare = new Transpiler (config);
    bare.setVerboseMode (false);
    const unhooked = files.map ((f) => bare.transpileGoByPath (f));

    let failures = 0, hookTotal = 0;
    const rows: any[] = [];
    for (let i = 0; i < files.length; i++) {
        const same = (x: any, y: any) => x.content === y.content && JSON.stringify (x.methodsTypes) === JSON.stringify (y.methodsTypes);
        const mainVsA = same (main[i], poolA[i]);
        const aVsB = same (poolA[i], poolB[i]);
        const stats = localAuditEmitStats (main[i].content);
        const bareStats = localAuditEmitStats (unhooked[i].content);
        const control = bareStats.hookTyped === 0 && (stats.hookTyped === 0 || unhooked[i].content !== main[i].content);
        hookTotal += stats.hookTyped;
        const ok = mainVsA && aVsB && control;
        if (!ok) { failures++; }
        const diffs: string[] = [];
        if (!mainVsA) { diffs.push (`main!=pool1 ${localAuditFirstDiff (main[i].content, poolA[i].content)}`); }
        if (!aVsB) { diffs.push (`pool1!=pool2 ${localAuditFirstDiff (poolA[i].content, poolB[i].content)}`); }
        if (!control) { diffs.push ('negative control: the unhooked printer emitted the same hook-typed declarations'); }
        rows.push ({ 'file': files[i], 'bytes': main[i].content.length, 'methodsTypes': (main[i].methodsTypes ?? []).length, 'hookTyped': stats.hookTyped, 'unhookedHookTyped': bareStats.hookTyped, 'mainVsPool1': mainVsA, 'pool1VsPool2': aVsB, 'negativeControl': control, 'ok': ok, 'diffs': diffs });
    }
    const rootsNote = rootsAll ? `roots=${roots.length} (stage-wide)` : `roots=${roots.length}`;
    console.log (`local-type parity | ${rootsNote} files=${files.length}`);
    for (const r of rows) {
        console.log (`  ${r.ok ? 'OK  ' : 'FAIL'} ${r.file} main==pool(1)==pool(2)=${r.mainVsPool1 && r.pool1VsPool2} hook-typed-locals=${r.hookTyped} unhooked-copies=${r.unhookedHookTyped} bytes=${r.bytes} methodsTypes=${r.methodsTypes}`);
        for (const d of r.diffs) { console.log (`       ${d}`); }
    }
    const hookLive = hookTotal > 0;
    const pass = failures === 0 && hookLive;
    console.log (`  hook-typed locals across files: ${hookTotal}${hookLive ? '' : ' — WARNING: the negative control is vacuous (no hook-typed declarations in this sample)'}`);
    console.log (`  ${pass ? 'PASS' : 'FAIL'}${failures ? ` (${failures} file(s) diverged)` : ''}`);
    if (process.argv.includes ('--json')) {
        console.log (JSON.stringify ({ 'mode': 'parity', 'roots': roots.length, 'rows': rows, 'pass': pass }, null, 2));
    }
    process.exit (pass ? 0 : 1);
}

// synthetic repo: a clean retype (plus the reindent this tree's mixed base produces) and a
// derefScalar-wrapped consumer line must pass; a semantic edit and a changed initializer must fail
function localAuditSelfTest () {
    const tmp = fs.mkdtempSync (path.join (os.tmpdir (), 'go-local-audit-self-'));
    const problems: string[] = [];
    const ok = (cond: boolean, msg: string) => { if (!cond) { problems.push (msg); } };
    const gc = (args: string[]) => localAuditRun ('git', [ '-C', tmp, '-c', 'user.email=audit@test', '-c', 'user.name=audit', ...args ]);
    try {
        fs.mkdirSync (path.join (tmp, LOCAL_AUDIT_SCOPE), { 'recursive': true });
        const f = path.join (tmp, LOCAL_AUDIT_SCOPE, 'Gen.go');
        const handPath = path.join (tmp, LOCAL_AUDIT_SCOPE, 'Hand.go');
        const header = '// PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:\npackage ccxt\n\n';
        const genBase = 'func f() any {\n    var rows any = this.ToArray(response)\n    var s any = this.Capitalize(key)\n    var m any = this.Market(symbol)\n    var b any = DerefScalar(this.SafeBool(response, "success", false))\n    x := 1\n    if rows == nil {\n        return nil\n    }\n    _ = m\n    return rows\n}\n';
        const genTyped = 'func f() any {\n\tvar rows []any = this.ToArray(response)\n\tvar s string = this.Capitalize(key)\n\tvar m MarketInterface = derefScalar(this.Market(symbol))\n\tvar b *bool = this.SafeBool(response, "success", false)\n\tx := 1\n\tif derefScalar(rows) == nil {\n\t\treturn nil\n\t}\n\t_ = m\n\treturn rows\n}\n';
        const handBase = 'package ccxt\n\nfunc g() any { return nil }\n';
        fs.writeFileSync (f, header + genBase);
        fs.writeFileSync (handPath, handBase);
        gc ([ 'init', '-q' ]); gc ([ 'add', '-A' ]); gc ([ 'commit', '-q', '-m', 'base' ]);
        const base = gc ([ 'rev-parse', 'HEAD' ]).stdout.trim ();
        // census of the base revision
        const census = localAuditCensus (path.join (tmp, LOCAL_AUDIT_SCOPE));
        ok (census.declarations === 4 && census.any === 4 && census.typed === 0, `census expected 4/4/0, got ${census.declarations}/${census.any}/${census.typed}`);
        // clean retype + full reindent (spaces -> tabs) + DerefScalar wrapper removal + one
        // derefScalar-wrapped consumer line
        fs.writeFileSync (f, header + genTyped);
        let audit = localAuditDiffAudit (tmp, base, null, LOCAL_AUDIT_SCOPE);
        ok (audit.totals.other === 0, `clean retype+reindent must pass, got other=${audit.totals.other}: ${JSON.stringify (audit.files.map ((x: any) => x.otherLines[0]).filter ((x: any) => x))}`);
        ok (audit.totals.declaration === 4, `expected 4 declaration retypes, got ${audit.totals.declaration}`);
        ok (audit.totals.coercion === 1, `expected 1 coercion line, got ${audit.totals.coercion}`);
        ok (audit.files.length === 1 && audit.skippedHandwritten.length === 0, 'expected one generated file audited');
        // a hand-written file is skipped, never classified
        fs.writeFileSync (handPath, handBase.replace ('return nil', 'return 1'));
        audit = localAuditDiffAudit (tmp, base, null, LOCAL_AUDIT_SCOPE);
        ok (audit.skippedHandwritten.length === 1, `hand-written file must be skipped, got ${JSON.stringify (audit.skippedHandwritten)}`);
        ok (audit.totals.other === 0, `hand-written edit must not fail the gate, got other=${audit.totals.other}`);
        fs.writeFileSync (handPath, handBase);
        // semantic edit on a non-declaration line -> fails as 'other'
        fs.writeFileSync (f, header + genTyped.replace ('x := 1', 'x := 2'));
        audit = localAuditDiffAudit (tmp, base, null, LOCAL_AUDIT_SCOPE);
        ok (audit.totals.other >= 1, 'a semantic edit must be flagged');
        // retyped declaration whose INITIALIZER changed -> still 'other'
        fs.writeFileSync (f, header + genTyped.replace ('var rows []any = this.ToArray(response)', 'var rows []any = this.ToArray(response2)'));
        audit = localAuditDiffAudit (tmp, base, null, LOCAL_AUDIT_SCOPE);
        ok (audit.totals.other >= 1, 'a changed initializer must be flagged');
        ok (audit.totals.declaration === 3, `changed initializer must not count as a declaration, got ${audit.totals.declaration}`);
        // the hook-typed counter sees the hook's callees only
        ok (localAuditHookTypedCount ('\tvar rows []any = this.ToArray(response)\n\tvar x any = this.ToArray(response)\n') === 1, 'hook-typed counter mis-counts');
    } catch (e: any) {
        problems.push (`self-test threw: ${e.message}`);
    } finally {
        fs.rmSync (tmp, { 'recursive': true, 'force': true });
    }
    return problems;
}

async function runLocalTypeAudit () {
    const argv = process.argv.slice (2);
    const flag = (name: string) => { const i = argv.indexOf (name); return i === -1 ? undefined : argv[i + 1]; };
    if (argv.includes ('--self-test')) {
        const problems = localAuditSelfTest ();
        if (problems.length) { console.error ('SELF-TEST FAILED:\n  - ' + problems.join ('\n  - ')); process.exit (3); }
        console.log ('SELF-TEST PASSED');
        return;
    }
    if (argv.includes ('--parity')) {
        const consumed = new Set ([ flag ('--base'), flag ('--target') ].filter ((x) => x !== undefined));
        const ids = argv.filter ((x) => !x.startsWith ('--') && !consumed.has (x));
        await runLocalTypeParity (ids.length ? ids : LOCAL_AUDIT_PARITY_DEFAULT_IDS, argv.includes ('--roots-all'));
        return;
    }
    const repo = process.cwd ();
    const base = localAuditGit (repo, [ 'rev-parse', `${flag ('--base') ?? 'origin/master'}^{commit}` ]).stdout.trim ();
    const target = flag ('--target') ?? null;
    const census = localAuditCensus (LOCAL_AUDIT_SCOPE);
    const packages: any[] = [];
    for (const e of fs.readdirSync (LOCAL_AUDIT_SCOPE, { 'withFileTypes': true })) {
        if (e.isDirectory ()) { packages.push (localAuditCensus (path.join (LOCAL_AUDIT_SCOPE, e.name), true)); }
    }
    const audit = localAuditDiffAudit (repo, base, target, LOCAL_AUDIT_SCOPE);
    const pass = audit.totals.other === 0;
    const topAnyByInit = Object.entries (census.anyByInit).sort ((a: any, b: any) => b[1] - a[1]).slice (0, 30);
    const topByType = Object.entries (census.byType).sort ((a: any, b: any) => b[1] - a[1]).slice (0, 20);
    if (argv.includes ('--json')) {
        console.log (JSON.stringify ({ 'base': base, 'target': target, 'census': { 'declarations': census.declarations, 'any': census.any, 'typed': census.typed, 'byType': census.byType, 'anyByInit': census.anyByInit, 'derefScalar': census.derefScalar, 'derefScalarExported': census.derefScalarExported }, 'packages': packages, 'audit': { 'totals': audit.totals, 'files': audit.files, 'skippedHandwritten': audit.skippedHandwritten, 'gofmtMissing': audit.gofmtMissing }, 'pass': pass }, null, 2));
    } else {
        console.log (`local-type audit | base=${base.slice (0, 11)} target=${target ?? '<worktree>'}`);
        console.log (`  census ${census.dir}: files=${census.files} declarations=${census.declarations} any=${census.any} typed=${census.typed} (${census.declarations ? Math.round (100 * census.typed / census.declarations) : 0}%) derefScalar-calls=${census.derefScalar} DerefScalar-calls=${census.derefScalarExported}`);
        for (const p of packages) {
            if (p.declarations) { console.log (`  census ${p.dir}: files=${p.files} declarations=${p.declarations} any=${p.any} typed=${p.typed}`); }
        }
        console.log (`  typed by type: ${topByType.map ((x: any) => `${x[0]}=${x[1]}`).join (' ')}`);
        console.log (`  remaining any by initializer: ${topAnyByInit.map ((x: any) => `${x[0]}=${x[1]}`).join (' ')}`);
        console.log (`  diff audit (generated files): declaration=${audit.totals.declaration} coercion=${audit.totals.coercion} format=${audit.totals.format} other=${audit.totals.other} (hand-written skipped: ${audit.skippedHandwritten.length})`);
        for (const f of audit.files.filter ((x: any) => x.other > 0).slice (0, 30)) {
            console.log (`    OTHER ${f.path}: ${String (f.otherLines[0]).split ('\n')[0].trim ().slice (0, 140)}`);
        }
        console.log (`  ${pass ? 'PASS' : 'FAIL'}`);
    }
    process.exit (pass ? 0 : 1);
}

async function runMain () {
    if (process.argv.includes ('--audit-local-types')) {
        await runLocalTypeAudit ();
        return;
    }
    if (process.argv.includes ('--check-gofmt')) {
        runGofmtGate ();
        return;
    }
    if (process.argv.includes ('--self-test')) {
        const problems = goDerefWrapSelfTest ().concat (goParamNilSelfTest ()).concat (goBoxedPointerSelfTest ()).concat (goPointerLocalNilSelfTest ()).concat (goTypedNilSelfTest ()).concat (goAnyLocalNilSelfTest ()).concat (goStringLiteralSelfTest ()).concat (goSafeBoolLiteralSelfTest ());
        if (problems.length) {
            console.error ('SELF-TEST FAILED:\n  - ' + problems.join ('\n  - '));
            process.exit (3);
        }
        console.log ('SELF-TEST PASSED');
        return;
    }
    const ws = process.argv.includes ('--ws');
    // bare prediction-only ids (e.g. `goTranspiler.ts kalshi`) auto-route to the
    // prediction namespace so scoped CI steps don't need to know it
    const cliExchanges = process.argv.slice (2).filter (x => !x.startsWith ('--'));
    const allArePredictionOnly = cliExchanges.length > 0 && cliExchanges.every (x => predictionIds.includes (x) && !exchangeIds.includes (x));
    const prediction = process.argv.includes ('--prediction') || allArePredictionOnly;
    const test = process.argv.includes ('--test') || process.argv.includes ('--tests');
    const baseTestsOnly = process.argv.includes ('--baseTests');
    const examples = process.argv.includes ('--examples');
    const force = process.argv.includes ('--force');
    const baseClassOnly = process.argv.includes ('--baseClass')
    const exchange = process.argv.includes ('--exchange');
    if (exchange) {
        transpiledExchanges = [ exchange ];
    }
    if (prediction) {
        transpiledExchanges = predictionIds;
    }
    shouldTranspileTests = process.argv.includes ('--noTests') ? false : true;
    log.bright.green ({ force });
    const inputExchanges = process.argv.slice (2).filter (x => !x.startsWith ('--'));
    // single-process REST+WS (default via npm run transpileGO / CI): keeps the one
    // piscina pool (and its warm per-thread Transpilers) alive across both stages
    // instead of paying a second process boot + cold pool. Omit the flag for REST-only.
    const restAndWs = process.argv.includes ('--rest-and-ws');
    const transpiler = new NewTranspiler (ws);
    if (baseClassOnly) {
        transpiler.transpileBaseMethods (TS_BASE_FILE)
        transpiler.transpilePredictionBaseMethods ()
    } else if (restAndWs) {
        // reproduces, in order, exactly what the two CI commands do:
        //   goTranspiler.ts --force            -> transpileEverything (...)
        //   goTranspiler.ts --ws --force       -> transpileWS (force) [+ prediction ws]
        await transpiler.transpileEverything (force, false, examples, prediction);
        // goTypeOptions is a MODULE-LEVEL accumulator that safeOptionsStructFile() dumps
        // wholesale into exchange_wrapper_structs.go. The ws stage must only emit the ws
        // structs, which held automatically while each stage was its own process. Reusing
        // the process would otherwise append every REST struct to go/v4/pro/ (measured:
        // 1460 -> 7135 lines). Same class of latent bug as the `exchanges` clobber above.
        resetPerStageAccumulators ();
        await transpiler.transpileWS (force);
        if (!inputExchanges.length) {
            // full ws builds also transpile the prediction ws exchanges
            await transpiler.transpileWS (force, true);
        }
    } else if (ws) {
        if (prediction) {
            await transpiler.transpileWS (force, true);
        } else {
            await transpiler.transpileWS (force);
            if (!inputExchanges.length) {
                // full ws builds also transpile the prediction ws exchanges
                await transpiler.transpileWS (force, true);
            }
        }
    } else if (test || baseTestsOnly) {
        await transpiler.transpileTests ();
    } else {
        await transpiler.transpileEverything (force, false, examples, prediction);
    }
}

if (isMainEntry (import.meta.url)) {
    await runMain ();
}
