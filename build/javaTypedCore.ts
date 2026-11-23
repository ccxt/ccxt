#!/usr/bin/env tsx
/**
 * Retypes every transpiled `CompletableFuture<Object> <unified>(...)` core to `CompletableFuture<T>`
 * (types from generateJavaWrappers.ts) on every tier at once (Java generics are invariant); the
 * unified types are views over the raw dict, so transpiled consumers need no change.
 */

import * as fs from 'fs';
import {
    parseMethodsFromTS, toPredictionMethods, predictionTierExcludeNames,
    PREDICTION_EXCHANGE_METHODS, PREDICTION_BASE_TS, isWsApi,
} from './generateJavaWrappers.js';
import type { MethodInfo } from './generateJavaWrappers.js';
import { nativeTypedList } from './javaUtilImports.js';
import { javaIsTypedMapDto } from './java-local-types.js';

export type JavaTier = 'rest' | 'ws' | 'prediction';

// loadMarkets stays `CompletableFuture<Object>` on the core; TypedSurface converts it.
export const SURFACE_ONLY = new Set([ 'loadMarkets' ]);

const FUTURE = 'java.util.concurrent.CompletableFuture';
const BASE_EXCHANGE_TS = './ts/src/base/Exchange.ts';

let allMethodsCache: MethodInfo[] | null = null;
let predictionMethodsCache: MethodInfo[] | null = null;

function allMethods(): MethodInfo[] {
    if (!allMethodsCache) allMethodsCache = parseMethodsFromTS();
    return allMethodsCache;
}

export function restMethods(): MethodInfo[] {
    return allMethods().filter(m => !m.isWatch && !isWsApi(m));
}

export function wsMethods(): MethodInfo[] {
    return allMethods().filter(m => m.isWatch || isWsApi(m));
}

export function predictionMethods(): MethodInfo[] {
    if (!predictionMethodsCache) {
        const baseNames = new Set(allMethods().map(m => m.name));
        let baseOnly: MethodInfo[] = [];
        if (fs.existsSync(PREDICTION_BASE_TS)) {
            baseOnly = parseMethodsFromTS(PREDICTION_BASE_TS).filter(m => !m.isWatch && !isWsApi(m) && !baseNames.has(m.name));
        }
        const exclude = predictionTierExcludeNames();
        const extra = Object.values(PREDICTION_EXCHANGE_METHODS).flat();
        predictionMethodsCache = toPredictionMethods(restMethods().filter(m => !exclude.has(m.name))).concat(baseOnly, extra);
    }
    return predictionMethodsCache;
}

// Names declared on the shared `class BaseExchange` in Exchange.ts: one declaration, one
// return family on every tier, so the prediction tier keeps the REST type for them.
let baseTierNamesCache: Set<string> | null = null;
export function baseTierDeclaredNames(): Set<string> {
    if (!baseTierNamesCache) {
        baseTierNamesCache = new Set<string>();
        const src = fs.readFileSync(BASE_EXCHANGE_TS, 'utf8').split('\n');
        const start = src.findIndex(l => /^export class BaseExchange\b/.test(l));
        const end = src.findIndex(l => /^export default class Exchange extends BaseExchange\b/.test(l));
        const re = /^    (?:async )?([a-zA-Z][a-zA-Z0-9]*) \(/;
        for (let i = start; i < end; i++) {
            const m = src[i].match(re);
            if (m) baseTierNamesCache.add(m[1]);
        }
    }
    return baseTierNamesCache;
}

/**
 * Typed methods of a tier, name -> MethodInfo. The prediction tier remaps the trading families
 * to Prediction* except for names declared on BaseExchange (shared with the REST tier) and
 * keeps the WS families (prediction venues merge their watch* methods into the same class).
 */
export function typedReturnTable(tier: JavaTier): Map<string, MethodInfo> {
    const table = new Map<string, MethodInfo>();
    const list = tier === 'prediction' ? predictionMethods().concat(toPredictionMethods(wsMethods())) : restMethods().concat(wsMethods());
    for (const m of list) {
        if (SURFACE_ONLY.has(m.name)) continue;
        if (m.javaReturnType === 'Object') continue;
        table.set(m.name, m);
    }
    for (const m of BASE_ASYNC_HELPERS) table.set(m.name, m);
    if (tier === 'prediction') {
        // base async helpers with a structure Promise<T> and no venue override
        for (const m of PREDICTION_BASE_ASYNC_HELPERS) table.set(m.name, m);
        const shared = baseTierDeclaredNames();
        for (const m of restMethods()) {
            if (shared.has(m.name) && table.has(m.name)) table.set(m.name, m);
        }
    }
    for (const m of list) {
        const raw = LOAD_SOURCE_CORES[m.name];
        if (raw !== undefined) table.set(m.name, { ...m, javaReturnType: raw, isArray: false, elementType: null, surface: m } as MethodInfo);
    }
    return table;
}

// isUTAEnabled (): Promise<boolean> (base stub + kucoin), not a unified wrapper
const BASE_ASYNC_HELPERS: MethodInfo[] = [
    { name: 'isUTAEnabled', javaReturnType: 'Boolean', isArray: false, elementType: null, requiredParams: [], optionalParams: [], isWatch: false },
    // ral-84j7: Promise<DepositAddresses> on the base stub and all 10 venue bodies; every body
    // returns this.indexBy (x, k) (hand-written Map<String, Object>) or a Map-declared local
    { name: 'fetchDepositAddressesByNetwork', javaReturnType: 'Map<String, Object>', isArray: false, elementType: null, requiredParams: [], optionalParams: [], isWatch: false },
    // Promise<{}> on the base stub: every venue body returns a response dict, a parse* dict or { 'info': .. }
    ...[ 'setLeverage', 'setMarginMode', 'setPositionMode', 'cancelAllOrdersAfter' ].map(name => ({ name, javaReturnType: 'Map<String, Object>', isArray: false, elementType: null, requiredParams: [], optionalParams: [], isWatch: false })),
    // Promise<{}> / Promise<Dict> declarations: every body returns a fee / limit / response dict
    ...[ 'fetchTransactionFees', 'fetchTradingLimits', 'createSubAccount' ].map(name => ({ name, javaReturnType: 'Map<String, Object>', isArray: false, elementType: null, requiredParams: [], optionalParams: [], isWatch: false })),
    // Promise<Dict[]> on every declaration: bodies return filterBy*SinceLimit, sortBy or parseBorrowRateHistory rows
    ...[ 'fetchSettlementHistory', 'fetchMySettlementHistory', 'fetchBorrowRateHistory' ].map(name => ({ name, javaReturnType: 'List<Object>', isArray: false, elementType: null, requiredParams: [], optionalParams: [], isWatch: false })),
];
// Promise<Market[]> / Promise<Currencies> on every tier: the raw rows setMarkets reads; TypedSurface wraps them
const LOAD_SOURCE_CORES: Record<string, string> = { fetchMarkets: 'List<Object>', fetchCurrencies: 'Map<String, Object>' };
// ral-84j7: base stubs of these typed cores take a type witness on failedFuture (no cast lambda)
const WITNESS_FAILED_FUTURE = new Set([ 'fetchDepositAddressesByNetwork', 'setLeverage', 'setMarginMode', 'setPositionMode', 'cancelAllOrdersAfter', 'fetchTransactionFees', 'fetchTradingLimits', 'createSubAccount' ]);
// loadOutcome (): Promise<PredictionOutcomeMarket> sends the outcome dict on every path
const PREDICTION_BASE_ASYNC_HELPERS: MethodInfo[] = [
    { name: 'loadOutcome', javaReturnType: 'Map<String, Object>', isArray: false, elementType: null, requiredParams: [], optionalParams: [], isWatch: false },
    // ral-90j5: sendEvmTransaction (): Promise<string>, one declaration (no venue override); its one
    // return is the eth_sendRawTransaction tx-hash string
    { name: 'sendEvmTransaction', javaReturnType: 'String', isArray: false, elementType: null, requiredParams: [], optionalParams: [], isWatch: false },
];

const JAVA_BUILTINS = new Set([ 'List', 'Map', 'String', 'Object', 'Long', 'Double', 'Boolean' ]);

/** `List<Trade>` -> `java.util.List<io.github.ccxt.types.Trade>`: cores import no types package. */
export function qualifyJavaType(javaType: string): string {
    return javaType
        .replace(/\b([A-Z][A-Za-z]+)\b/g, (s) => JAVA_BUILTINS.has(s) ? s : 'io.github.ccxt.types.' + s)
        .replace(/\bList</g, 'java.util.List<')
        .replace(/\bMap</g, 'java.util.Map<');
}

/** Lambda / constructor reference converting the raw supplyAsync result into the typed value. */
export function coreConverter(m: MethodInfo): string {
    if (m.isArray && m.elementType) return `res -> ${nativeTypedList('io.github.ccxt.types.' + m.elementType)}`;
    if (m.javaReturnType === 'Long') return 'res -> (res instanceof Number n) ? n.longValue() : null';
    if (m.javaReturnType === 'Double') return 'res -> (res instanceof Number n) ? n.doubleValue() : null';
    if (m.javaReturnType === 'String') return 'res -> (String) res';
    if (m.javaReturnType === 'Boolean') return 'res -> (Boolean) res';
    if (m.javaReturnType === 'Map<String, Object>') return 'res -> (java.util.Map<String, Object>) res';
    if (m.javaReturnType === 'List<Object>') return 'res -> (java.util.List<Object>) res'; // ral-87j7 venue Promise<Dict[]>
    return `io.github.ccxt.types.${m.javaReturnType}::new`;
}

/** Static helper every generated async lambda is passed to (ast-transpiler java `asyncSupplier`); it defaults to VIRTUAL_EXECUTOR. */
export const JAVA_ASYNC_SUPPLIER = 'BaseExchange.supplyAsync';
/** Import that makes JAVA_ASYNC_SUPPLIER resolve outside package io.github.ccxt. */
export const JAVA_ASYNC_SUPPLIER_IMPORT = 'import io.github.ccxt.BaseExchange;';

/** The line opening a supply body: the block lambda, or the header of the method's private sync core. */
function isSupplyBodyOpen(line: string): boolean {
    return line.trim().endsWith('supplyAsync(() -> {') || /^private \S.* \w+Core\(.*\)$/.test(line.trim());
}

/** A one-line wrapper `return SUPPLIER(() -> this.<name>Core(..));`: the core's header line index, else -1. */
function asyncCoreHeader(lines: string[], line: string, name: string, from: number): number {
    if (!line.trim().startsWith(`return ${JAVA_ASYNC_SUPPLIER}(() -> this.${name}Core(`) || !line.trim().endsWith('));')) return -1;
    const header = new RegExp(`^\\s*private \\S.* ${name}Core\\(`);
    for (let k = from; k < lines.length; k++) {
        if (header.test(lines[k])) return k;
        if (k > from + 3 && /^\s*public /.test(lines[k])) return -1;
    }
    return -1;
}

/** True for a trimmed line closing a generated supplyAsync lambda: `});`. */
export function isAsyncLambdaClose(line: string): boolean {
    return line.startsWith('})');
}

const DECL_RE = /^(\s*)public (?:java\.util\.concurrent\.)?CompletableFuture<Object> (\w+)\((.*)$/;

// Hand-written BaseExchange readers whose Java return type is fixed (an override cannot widen it).
const TYPED_BASE_READERS: Record<string, string> = {
    safeString: 'String', safeString2: 'String', safeStringUpper: 'String', safeStringLower: 'String',
    urlencode: 'String', uuid: 'String', iso8601: 'String',
    safeInteger: 'Long', safeInteger2: 'Long', safeIntegerProduct: 'Long', safeTimestamp: 'Long',
    safeTimestamp2: 'Long', milliseconds: 'Long', parse8601: 'Long',
    // BaseExchange.java: `Double safeNumber(Object, Object, Object)`, `String decode(Object)`, `Long parseToInt(Object)`
    safeNumber: 'Double', decode: 'String', parseToInt: 'Long',
    // generated base `List<Object> parseMarkets(..)` / `Map<String, Object> parseCurrencies(..)`
    parseMarkets: 'List<Object>', parseCurrencies: 'Map<String, Object>',
    // BaseExchange.java `List<Object> arrayConcat(Object, Object)`; generated base `List<Object> arraysConcat(..)`
    arrayConcat: 'List<Object>', arraysConcat: 'List<Object>',
    // BaseExchange.java `java.util.List<Object> toArray(Object)`: a fresh list for every input
    toArray: 'List<Object>',
};
// BaseExchange.java `java.util.Map<String, Object> extend(Object aa, Object bb)`: only the two-argument
// overload is typed (`Object extend(Object... objs)` is not)
const TYPED_BASE_TWO_ARG_READERS: Record<string, string> = { extend: 'Map<String, Object>', indexBy: 'Map<String, Object>' }; // indexBy: BaseExchange.java `java.util.Map<String, Object> indexBy(Object, Object)` (ral-84j7)
// BaseExchange.java credential fields declared `public String <name>;`
const TYPED_BASE_STRING_FIELDS = new Set([ 'apiKey', 'secret', 'password', 'uid', 'accountId', 'twofa', 'privateKey', 'walletAddress', 'login' ]);

/** Top-level `,`-separated argument count of `this.m(<args>)` (expr already proven a whole call). */
function topLevelArgCount(expr: string): number {
    const args = expr.slice(expr.indexOf('(') + 1, -1);
    if (args.trim() === '') return 0;
    let depth = 0, quote = '', count = 1;
    for (let k = 0; k < args.length; k++) {
        const ch = args[k];
        if (quote !== '') {
            if (ch === '\\') k++;
            else if (ch === quote) quote = '';
            continue;
        }
        if (ch === '"' || ch === '\'') quote = ch;
        else if (ch === '(' || ch === '{' || ch === '[') depth++;
        else if (ch === ')' || ch === '}' || ch === ']') depth--;
        else if (ch === '<' && /\w$/.test(args.slice(0, k))) depth++; // generic args `new HashMap<String, Object>`
        else if (ch === '>' && depth > 0 && /\w$/.test(args.slice(0, k))) depth--;
        else if (ch === ',' && depth === 0) count++;
    }
    return count;
}

/** Split `expr` on top-level `+`; undefined when another top-level operator would bind looser. */
function topLevelPlusParts(expr: string): string[] | undefined {
    const parts: string[] = [];
    let depth = 0, quote = '', start = 0;
    for (let k = 0; k < expr.length; k++) {
        const ch = expr[k];
        if (quote !== '') {
            if (ch === '\\') k++;
            else if (ch === quote) quote = '';
            continue;
        }
        if (ch === '"' || ch === '\'') quote = ch;
        else if (ch === '(') depth++;
        else if (ch === ')') depth--;
        else if (depth === 0 && /[=!<>?:&|]/.test(ch)) return undefined;
        else if (depth === 0 && ch === '+') {
            parts.push(expr.slice(start, k).trim());
            start = k + 1;
        }
    }
    parts.push(expr.slice(start).trim());
    return parts.length > 1 && parts.every(p => p !== '') ? parts : undefined;
}

/** `(a + "lit")`, `(("x" + a) + b)`: a `+` chain with a String literal operand is a Java String. */
function isStringConcat(expr: string): boolean {
    let e = expr.trim();
    while (e.startsWith('(') && e.endsWith(')') && wholeParens(e)) e = e.slice(1, -1).trim();
    const parts = topLevelPlusParts(e);
    if (parts === undefined) return false;
    return parts.some(p => /^"(?:[^"\\]|\\.)*"$/.test(p) || (p.startsWith('(') && isStringConcat(p)));
}

function wholeParens(e: string): boolean {
    let depth = 0, quote = '';
    for (let k = 0; k < e.length; k++) {
        const ch = e[k];
        if (quote !== '') {
            if (ch === '\\') k++;
            else if (ch === quote) quote = '';
            continue;
        }
        if (ch === '"' || ch === '\'') quote = ch;
        else if (ch === '(') depth++;
        else if (ch === ')' && --depth === 0 && k !== e.length - 1) return false;
    }
    return depth === 0;
}

/** Return types of the methods declared in `source` (`public [static] T name(`), one entry per name with a single spelling. */
function declaredReturnTypes(source: string): Map<string, string> {
    const seen = new Map<string, Set<string>>();
    const re = /^\s*public (?:static )?(?:final )?((?:java\.util\.concurrent\.)?[A-Za-z_][\w.]*(?:<.*?>)?) (\w+)\(/gm;
    for (let d = re.exec(source); d !== null; d = re.exec(source)) {
        const set = seen.get(d[2]) ?? new Set<string>();
        set.add(d[1].replace(/\bjava\.util\.(?:concurrent\.)?/g, ''));
        seen.set(d[2], set);
    }
    const out = new Map<string, string>();
    for (const [ name, set ] of seen) if (set.size === 1) out.set(name, [ ...set ][0]);
    return out;
}

let baseExchangeReturnCache: Map<string, string> | undefined;
/** Declared returns of the on-disk BaseExchange.java (single-spelling names only), read once. */
function baseExchangeDeclaredReturns(): Map<string, string> {
    if (baseExchangeReturnCache === undefined) {
        let content = '';
        try {
            content = fs.readFileSync('./java/lib/src/main/java/io/github/ccxt/BaseExchange.java', 'utf8');
        } catch (e) {
            content = '';
        }
        baseExchangeReturnCache = declaredReturnTypes(content);
    }
    return baseExchangeReturnCache;
}

const API_METHOD_RE = /^\s*public (?:java\.util\.concurrent\.)?CompletableFuture<(.+?)>\s+(\w+) \(Object\.\.\. optionalArgs\)/;
const apiReturnCache = new Map<string, Map<string, string>>();
/** `CompletableFuture<T>` of the generated implicit-api wrappers the class extends (on-disk api/<X>Api.java). */
function apiReturnTypes(source: string): Map<string, string> {
    const imp = /^import io\.github\.ccxt\.api\.((?:prediction\.)?)(\w+Api);$/m.exec(source);
    if (imp === null || !new RegExp(`\\bextends ${imp[2]}\\b`).test(source)) return new Map();
    const file = `./java/lib/src/main/java/io/github/ccxt/api/${imp[1] === '' ? '' : 'prediction/'}${imp[2]}.java`;
    let table = apiReturnCache.get(file);
    if (table === undefined) {
        table = new Map<string, string>();
        let content = '';
        try {
            content = fs.readFileSync(file, 'utf8');
        } catch (e) {
            content = '';
        }
        for (const line of content.split('\n')) {
            const m = API_METHOD_RE.exec(line);
            if (m !== null) table.set(m[2], m[1].replace(/\bjava\.util\./g, ''));
        }
        apiReturnCache.set(file, table);
    }
    return table;
}

/** Proof context of one source text for supplyBodyReturnsType: its own method returns, api futures and the typed table. */
export interface SupplyReturnContext {
    declared: Map<string, string>;
    api: Map<string, string>;
    table: Map<string, MethodInfo>;
}

export function supplyReturnContext(source: string, table: Map<string, MethodInfo>): SupplyReturnContext {
    return { declared: declaredReturnTypes(source), api: apiReturnTypes(source), table };
}

/** `this.m(..)` whose parentheses close at the end of `expr`: the receiver method name, else undefined. */
function wholeThisCall(expr: string): string | undefined {
    const m = /^this\.(\w+)\(/.exec(expr);
    if (m === null || !expr.endsWith(')')) return undefined;
    let depth = 0;
    let quote = '';
    for (let k = m[0].length - 1; k < expr.length; k++) {
        const ch = expr[k];
        if (quote !== '') {
            if (ch === '\\') k++;
            else if (ch === quote) quote = '';
            continue;
        }
        if (ch === '"' || ch === '\'') quote = ch;
        else if (ch === '(') depth++;
        else if (ch === ')' && --depth === 0 && k !== expr.length - 1) return undefined;
    }
    return depth === 0 ? m[1] : undefined;
}

/**
 * True when every `return` of the supply lambda (lines (from, to)) is statically the core's typed
 * return (`String` / `Long` / `Boolean` / `Map<String, Object>` / `Double`): `null`, a boolean literal,
 * a local whose every declaration in the body prints that type, or a typed BaseExchange reader.
 * A nested lambda (its own `return`s) or an unproven return keeps the converter.
 */
export function supplyBodyReturnsType(lines: string[], from: number, to: number, supplyIndent: string, m: MethodInfo, ctx?: SupplyReturnContext): boolean {
    const want = m.isArray ? undefined : m.javaReturnType;
    if (want === undefined || ![ 'String', 'Long', 'Double', 'Boolean', 'Map<String, Object>', 'List<Object>' ].includes(want)) return false;
    const body = lines.slice(from, to);
    const opened = body.findIndex(l => isSupplyBodyOpen(l));
    if (opened === -1) return false;
    const inner = body.slice(opened + 1);
    // a block lambda has `return`s of its own; expression lambdas and switch-expression arms
    // (`default -> {` .. `yield`) cannot hold a `return` of the supply body
    if (inner.some(l => /->\s*\{/.test(l) && !/\b(?:default|case\b[^>]*)\s*->\s*\{/.test(l))) return false;
    const declTypes = new Map<string, Set<string>>();
    for (const l of inner) {
        // `T x = ..;` / `T x;` / a multi-line anonymous-map initializer `T x = new HashMap<..>() {{`
        const d = /^\s*(?:final )?([A-Za-z_][\w.]*(?:<[^=]*>)?) (\w+)(?:(?: = .*)?;| = .*\{\{)$/.exec(l);
        if (d !== null && d[1] !== 'return' && d[1] !== 'throw') {
            const set = declTypes.get(d[2]) ?? new Set<string>();
            set.add(d[1].replace(/^java\.util\./, ''));
            declTypes.set(d[2], set);
        }
    }
    const sameType = (t: string) => t === want || (want === 'Map<String, Object>' && t === 'HashMap<String, Object>') || (want === 'List<Object>' && t === 'ArrayList<Object>');
    let returns = 0;
    for (const raw of inner) {
        // a trailing `// comment` after the statement (no quote in it, so it is not inside a string)
        const l = raw.replace(/;\s*\/\/[^"']*$/, ';');
        if (/^\s*return\b/.test(l) && !/;\s*$/.test(l)) {
            // `return new HashMap<String, Object>() {{` .. `}};`: an anonymous HashMap is a Map<String, Object>
            if (want === 'Map<String, Object>' && /^\s*return new (?:java\.util\.)?HashMap<String, Object>\(\) \{\{\s*$/.test(l) && l.startsWith(supplyIndent + '    ')) {
                returns++;
                continue;
            }
            return false;
        }
        const r = /^\s*return(?: (.*))?;$/.exec(l.trimEnd());
        if (r === null) continue;
        if (!l.startsWith(supplyIndent + '    ')) return false;
        returns++;
        const e = (r[1] ?? '').trim();
        if (e === '' || e === 'null') continue;
        if (want === 'Boolean' && (e === 'true' || e === 'false')) continue;
        if (/^\w+$/.test(e)) {
            const set = declTypes.get(e);
            if (set !== undefined && [ ...set ].every(sameType)) continue;
            return false;
        }
        if (returnExprHasType(e, want, ctx)) continue;
        return false;
    }
    return returns > 0;
}

/** Static Java type of one returned expression equals `want` (see supplyBodyReturnsType). */
function returnExprHasType(e: string, want: string, ctx?: SupplyReturnContext): boolean {
    const call = wholeThisCall(e);
    if (call !== undefined && TYPED_BASE_READERS[call] === want) return true;
    if (call !== undefined && TYPED_BASE_TWO_ARG_READERS[call] === want && topLevelArgCount(e) === 2) return true;
    if (want === 'Map<String, Object>' && /^new (?:java\.util\.)?HashMap<String, Object>\(\)(?: \{\{\}\})?$/.test(e)) return true;
    // BaseExchange.java `List<Object> arraySlice(Object, Object[, Object])` (ral-87j7)
    if (want === 'List<Object>' && call === 'arraySlice') return true;
    if (want === 'String') {
        const field = /^this\.(\w+)$/.exec(e);
        if (field !== null && TYPED_BASE_STRING_FIELDS.has(field[1])) return true;
        if (isStringConcat(e)) return true;
    }
    if (ctx === undefined) return false;
    // a method of this class whose declared Java return is `want` (an override can only narrow it)
    if (call !== undefined && ctx.declared.get(call) === want) return true;
    // an inherited BaseExchange.java method declared `want` (filterBy*SinceLimit: List<Object>)
    if (call !== undefined && !ctx.declared.has(call) && baseExchangeDeclaredReturns().get(call) === want) return true;
    // a TypedMap view (`Order parseOrder(..)`) is a Map<String, Object>
    const view = /^(?:io\.github\.ccxt\.types\.)?(\w+)$/.exec(call === undefined ? '' : ctx.declared.get(call) ?? '');
    if (want === 'Map<String, Object>' && view !== null && javaIsTypedMapDto(view[1])) return true;
    // `(this.m(..)).join()` of a CompletableFuture<want>: a generated api wrapper, a typed core
    // (retyped in this same pass, on every tier) or an on-disk typed declaration
    const joined = /^\((this\.\w+\(.*\))\)\.join\(\)$/.exec(e);
    if (joined !== null) {
        const inner = wholeThisCall(joined[1]);
        if (inner === undefined) return false;
        const core = ctx.table.get(inner);
        const t = ctx.api.get(inner)
            ?? (core !== undefined && !core.isArray ? core.javaReturnType : undefined)
            ?? /^CompletableFuture<(.+)>$/.exec(ctx.declared.get(inner) ?? '')?.[1];
        return t === want;
    }
    return false;
}

/** Static Java type of `e` is exactly Object: a local declared only `Object`, or a join of a ws Future / CompletableFuture<Object>. */
function returnExprIsObject(e: string, body: string[]): boolean {
    if (/^\w+$/.test(e)) {
        let seen = false;
        for (const l of body) {
            const d = /^\s*(?:final )?([A-Za-z_][\w.]*(?:<[^=]*>)?) (\w+)(?: = .*)?;$/.exec(l);
            if (d === null || d[2] !== e || d[1] === 'return' || d[1] === 'throw') continue;
            if (d[1] !== 'Object') return false;
            seen = true;
        }
        return seen;
    }
    // `((io.github.ccxt.ws.Future)x).getFuture().join()`: ws.Future.getFuture() is CompletableFuture<Object>
    if (/^\(\(io\.github\.ccxt\.ws\.Future\)\w+\)\.getFuture\(\)\.join\(\)$/.test(e)) return true;
    return false;
}

/**
 * `res -> (T) res` converters only (String / Boolean / Map<String, Object>): when every `return` of the
 * supply lambda (lines (from, to)) is a one-line statement of the supply body itself (no nested block
 * lambda, no multi-line return), rewrite each return not already proven T to `return (T) (e);` and
 * report true; the caller then leaves the tail without `.thenApply`. Same cast, same failure (the
 * ClassCastException completes the future exceptionally either way). Edits `lines` only on success.
 */
function castSupplyReturnsInPlace(lines: string[], from: number, to: number, supplyIndent: string, m: MethodInfo, ctx?: SupplyReturnContext): boolean {
    const want = m.isArray ? undefined : m.javaReturnType;
    if (want === undefined || ![ 'String', 'Boolean', 'Map<String, Object>' ].includes(want)) return false;
    const opened = lines.slice(from, to).findIndex(l => isSupplyBodyOpen(l));
    if (opened === -1) return false;
    const start = from + opened + 1;
    for (let k = start; k < to; k++) {
        const l = lines[k];
        if (/->\s*\{/.test(l) && !/\b(?:default|case\b[^>]*)\s*->\s*\{/.test(l)) return false;
    }
    const javaType = qualifyJavaType(want);
    const edits: Array<[number, string]> = [];
    for (let k = start; k < to; k++) {
        const raw = lines[k];
        if (!/^\s*return\b/.test(raw)) continue;
        const r = /^(\s*)return (.*);$/.exec(raw.trimEnd());
        if (r === null || !raw.startsWith(supplyIndent + '    ')) return false;
        const e = r[2].trim();
        if (e === 'null' || (want === 'Boolean' && (e === 'true' || e === 'false'))) continue;
        // `return x;  // note` and string literals holding `;`: only plain statements are rewritten
        if (/\/\/|\/\*/.test(e.replace(/"(?:[^"\\]|\\.)*"/g, '""'))) return false;
        if (returnExprHasType(e, want, ctx)) continue;
        // a direct cast compiles only from Object: anything else of another static type (Long reader,
        // typed future) would be a compile error, so it keeps the lambda
        if (!returnExprIsObject(e, lines.slice(start, to))) return false;
        const body = /^[\w.]+$/.test(e) || wholeParens(e) && e.startsWith('(') && e.endsWith(')') ? e : `(${e})`;
        edits.push([ k, `${r[1]}return (${javaType}) ${body};` ]);
    }
    if (edits.length === 0) return false;
    for (const [ k, l ] of edits) lines[k] = l;
    return true;
}

/**
 * Retype every `public CompletableFuture<Object> <name>(` declaration found in the table and
 * put the typed construction on the method's supplyAsync tail. Works on any transpiled tier text.
 */
export function typeCoreReturns(source: string, table: Map<string, MethodInfo>): string {
    const lines = source.split('\n');
    const ctx = supplyReturnContext(source, table);
    for (let i = 0; i < lines.length; i++) {
        const d = DECL_RE.exec(lines[i]);
        if (!d) continue;
        const [ , indent, name, rest ] = d;
        const m = table.get(name);
        if (!m) continue;
        lines[i] = `${indent}public ${FUTURE}<${qualifyJavaType(m.javaReturnType)}> ${name}(${rest}`;
        // the first method injected under a tier delimiter is trimmed to column 0 while its body
        // keeps the 4-space indent: anchor on the body brace, not the declaration
        const bodyIndent = lines[i + 1] !== undefined && /^\s*\{$/.test(lines[i + 1]) ? lines[i + 1].slice(0, lines[i + 1].indexOf('{')) : indent;
        const close = bodyIndent + '}';
        const supplyIndent = bodyIndent + '    ';
        let converted = false;
        for (let j = i + 1; j < lines.length; j++) {
            if (lines[j] === close) break;
            const trimmed = lines[j].trim();
            // an `Object...` front returns its typed core's future unchanged
            if (trimmed.startsWith(`return this.${name}(`)) {
                converted = true;
                break;
            }
            const core = asyncCoreHeader(lines, lines[j], name, j + 1);
            if (core !== -1) {
                // the body sits in the private sync core: prove or cast its returns there, else convert on the wrapper
                let end = core + 2;
                while (end < lines.length && lines[end] !== close) end++;
                const typed = ('returnsProven' in m && m.returnsProven === true) || supplyBodyReturnsType(lines, core, end, bodyIndent, m, ctx)
                    || castSupplyReturnsInPlace(lines, core, end, bodyIndent, m, ctx);
                if (typed) lines[core] = lines[core].replace(/^(\s*private )\S.*?( \w+Core\()/, `$1${qualifyJavaType(m.javaReturnType)}$2`);
                else lines[j] = `${lines[j].slice(0, -1)}.thenApply(${coreConverter(m)});`;
                converted = true;
                break;
            }
            if (lines[j].startsWith(supplyIndent) && lines[j].length === supplyIndent.length + trimmed.length
                && (isAsyncLambdaClose(trimmed) || trimmed.startsWith(`return ${FUTURE}.failedFuture(`)) && trimmed.endsWith(');')) {
                // every `return` of the supply lambda already has the declared type: `supplyAsync`
                // infers T from the retyped declaration, so the future is returned as-is (no cast lambda)
                // or the table entry carries a TS-AST proof of every return (venue tuple cores)
                const proven = 'returnsProven' in m && m.returnsProven === true;
                if (isAsyncLambdaClose(trimmed) && (proven || supplyBodyReturnsType(lines, i + 1, j, supplyIndent, m, ctx))) {
                    converted = true;
                    break;
                }
                // a reference-cast core (String / Boolean / Map) whose returns are all single-line
                // statements of the supply body: cast each unproven return in place, no lambda
                if (isAsyncLambdaClose(trimmed) && castSupplyReturnsInPlace(lines, i + 1, j, supplyIndent, m, ctx)) {
                    converted = true;
                    break;
                }
                if (WITNESS_FAILED_FUTURE.has(name) && trimmed.startsWith(`return ${FUTURE}.failedFuture(`)) {
                    lines[j] = `${supplyIndent}return ${FUTURE}.<${qualifyJavaType(m.javaReturnType)}>failedFuture(${trimmed.slice(`return ${FUTURE}.failedFuture(`.length)}`;
                    converted = true;
                    break;
                }
                // `});` -> `}).thenApply(f);`  /  `}, EXECUTOR);` -> `}, EXECUTOR).thenApply(f);`
                // a printed `return CompletableFuture.failedFuture(..);` takes the same `.thenApply(f)`
                lines[j] = `${supplyIndent}${trimmed.slice(0, -1)}.thenApply(${coreConverter(m)});`;
                converted = true;
                break;
            }
        }
        if (!converted) {
            throw new Error(`javaTypedCore: ${name} is in the typed table but has no supplyAsync body to convert`);
        }
    }
    return lines.join('\n');
}

/** `--audit-string-types --self-test`: a typed core whose body already returns the declared type keeps no cast lambda. */
export function javaTypedCoreDirectReturnSelfTest(): string[] {
    const problems: string[] = [];
    const core = (type: string, body: string[]) => [
        `    public CompletableFuture<Object> m(Object parameters)`,
        `    {`,
        ``,
        `        return BaseExchange.supplyAsync(() -> {`,
        ``,
        ...body.map(l => '            ' + l),
        `        });`,
        ``,
        `    }`,
        ``,
        `    public Map<String, Object> parseThing(Object x)`,
        `    {`,
        `        return null;`,
        `    }`,
    ].join('\n');
    const info = (javaReturnType: string): MethodInfo => ({ name: 'm', javaReturnType, isArray: false, elementType: null, requiredParams: [], optionalParams: [], isWatch: false } as any);
    const rows: Array<[string, string, string[], boolean]> = [
        // [label, type, body, cast lambda expected]
        [ 'string local', 'String', [ 'String result = this.safeString(parameters, "k");', 'return result;' ], false ],
        [ 'string local + null', 'String', [ 'String result = null;', 'if (parameters == null)', '{', '    return null;', '}', 'return result;' ], false ],
        [ 'typed reader', 'Long', [ 'return this.safeInteger(parameters, "time");' ], false ],
        [ 'map local', 'Map<String, Object>', [ 'Map<String, Object> response = (Map<String, Object>) this.safeDict(parameters, "a", null);', 'return response;' ], false ],
        [ 'boolean literals', 'Boolean', [ 'if (parameters == null)', '{', '    return false;', '}', 'return true;' ], false ],
        [ 'Object local cast in place (ral-49j)', 'String', [ 'Object result = this.safeValue(parameters, "k");', 'return result;' ], false ],
        [ 'joined future keeps cast', 'Map<String, Object>', [ 'return (this.fetchX(parameters)).join();' ], true ],
        [ 'reader of another type keeps cast', 'String', [ 'return this.safeInteger(parameters, "k");' ], true ],
        [ 'trailing call keeps cast', 'String', [ 'return this.safeString(a, "k").trim();' ], true ],
        [ 'nested lambda keeps cast', 'String', [ 'String r = null;', 'Object f = (x) -> { return x; };', 'return r;' ], true ],
        [ 'no-cast row keeps typed declaration', 'String', [ 'return this.safeString(parameters, "k");' ], false ],
        // ral-40c: hand-written / declared return types
        [ 'boolean literal with trailing comment', 'Boolean', [ 'return false;  // stub' ], false ],
        [ 'base safeNumber is Double', 'Double', [ 'return this.safeNumber(parameters, "n", (Object) null);' ], false ],
        [ 'base parseToInt is Long', 'Long', [ 'return this.parseToInt(this.safeInteger(parameters, "n"));' ], false ],
        [ 'base decode is String', 'String', [ 'return this.decode(this.base16ToBinary(parameters));' ], false ],
        [ 'two-argument extend is Map', 'Map<String, Object>', [ 'return this.extend(parameters, parameters);' ], false ],
        [ 'varargs extend keeps cast', 'Map<String, Object>', [ 'return this.extend(parameters, parameters, parameters);' ], true ],
        [ 'string literal concat is String', 'String', [ 'String a = null;', 'return ("x/" + a);' ], false ],
        [ 'concat without a literal keeps cast', 'String', [ 'Object a = null;', 'return (a + a);' ], true ],
        [ 'base String field', 'String', [ 'return this.apiKey;' ], false ],
        [ 'base Object field keeps cast', 'String', [ 'return this.token;' ], true ],
        [ 'anonymous map literal', 'Map<String, Object>', [ 'return new HashMap<String, Object>() {{', '    put( "a", 1 );', '}};' ], false ],
        [ 'multi-line map local', 'Map<String, Object>', [ 'Map<String, Object> r = new HashMap<String, Object>() {{', '    put( "a", 1 );', '}};', 'return r;' ], false ],
        [ 'switch-expression arm is no lambda', 'Map<String, Object>', [ 'Map<String, Object> r = this.extend(parameters, (switch (0) { default -> { HashMap<String, Object> j = new HashMap<String, Object>(); yield j; } }));', 'return r;' ], false ],
        [ 'block lambda keeps cast', 'Map<String, Object>', [ 'Map<String, Object> r = null;', 'Object f = (x, y) -> { return null; };', 'return r;' ], true ],
        [ 'declared helper of this class', 'Map<String, Object>', [ 'return this.parseThing(parameters);' ], false ],
        [ 'joined typed core', 'Map<String, Object>', [ 'return (this.m(parameters)).join();' ], false ],
        [ 'joined untyped future keeps cast', 'Map<String, Object>', [ 'return (this.watch(parameters, null, null, null, null)).join();' ], true ],
        [ 'safeDict is Object: keeps cast', 'Map<String, Object>', [ 'return this.safeDict(parameters, "k", null);' ], true ],
        // ral-49j: Object returns are cast in place, no lambda
        [ 'joined ws Future cast in place', 'String', [ 'Object future = this.safeValue(parameters, "k");', 'if (future != null)', '{', '    return ((io.github.ccxt.ws.Future)future).getFuture().join();', '}', 'return null;' ], false ],
        [ 'Object local cast in place', 'Boolean', [ 'Object r = this.safeValue(parameters, "k");', 'return r;' ], false ],
        [ 'typed future of another type keeps cast', 'String', [ 'Object r = null;', 'if (r == null)', '{', '    return r;', '}', 'return (this.fetchX(parameters)).join();' ], true ],
        [ 'inherited filterBySymbolSinceLimit is List', 'List<Object>', [ 'return this.filterBySymbolSinceLimit(parameters, null, null, null, false);' ], false ],
        [ 'inherited Object reader keeps cast', 'List<Object>', [ 'return this.filterBySymbol(parameters, null);' ], true ],
        [ 'Long core is no reference cast', 'Long', [ 'Object r = this.safeValue(parameters, "k");', 'return r;' ], true ],
    ];
    for (const [ label, type, body, cast ] of rows) {
        const out = typeCoreReturns(core(type, body), new Map([ [ 'm', info(type) ] ]));
        const hasCast = out.includes('.thenApply(');
        if (hasCast !== cast) problems.push(`typed core direct return '${label}': expected cast lambda ${cast}, got ${hasCast}`);
        if (!out.includes(`CompletableFuture<${qualifyJavaType(type)}> m(`)) problems.push(`typed core direct return '${label}': declaration not retyped`);
    }
    return problems;
}
