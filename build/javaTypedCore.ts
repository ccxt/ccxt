#!/usr/bin/env tsx
/**
 * Typed transpiled Java cores. Retypes every `CompletableFuture<Object> <unified>(...)` the
 * transpiler emits (BaseExchange / Exchange / PredictionExchange tiers and every core under
 * exchanges/, exchanges/pro/, exchanges/prediction/) to `CompletableFuture<T>` using the
 * return-type table generateJavaWrappers.ts derives from ts/src/base/Exchange.ts, and puts
 * the typed construction on the core's own `supplyAsync` tail.
 *
 * The unified types are views over the raw payload (`Ticker extends TypedMap extends
 * AbstractMap<String,Object>`, `OHLCV extends TypedList`), so a typed result IS the dict the
 * transpiled consumers (Helpers.GetValue / safe* / extend / filterBy / json) already handle:
 * no internal call site changes and no inverse conversion layer.
 *
 * Java generics are invariant: a name is retyped on every tier at once or nothing compiles.
 */

import * as fs from 'fs';
import {
    parseMethodsFromTS, toPredictionMethods, predictionTierExcludeNames,
    PREDICTION_EXCHANGE_METHODS, PREDICTION_BASE_TS, isWsApi,
} from './generateJavaWrappers.js';
import type { MethodInfo } from './generateJavaWrappers.js';
import { nativeTypedList } from './javaUtilImports.js';

export type JavaTier = 'rest' | 'ws' | 'prediction';

// Hand-written base bodies (`completedFuture(this.currencies)`) consumed by setMarkets: they
// stay `CompletableFuture<Object>` on the core; TypedSurface converts them.
export const SURFACE_ONLY = new Set([ 'fetchMarkets', 'fetchCurrencies', 'loadMarkets' ]);

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
    return table;
}

// isUTAEnabled (): Promise<boolean> (base stub + kucoin), not a unified wrapper
const BASE_ASYNC_HELPERS: MethodInfo[] = [
    { name: 'isUTAEnabled', javaReturnType: 'Boolean', isArray: false, elementType: null, requiredParams: [], optionalParams: [], isWatch: false },
];
// loadOutcome (): Promise<PredictionOutcomeMarket> sends the outcome dict on every path
const PREDICTION_BASE_ASYNC_HELPERS: MethodInfo[] = [
    { name: 'loadOutcome', javaReturnType: 'Map<String, Object>', isArray: false, elementType: null, requiredParams: [], optionalParams: [], isWatch: false },
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
    return `io.github.ccxt.types.${m.javaReturnType}::new`;
}

/** Static helper every generated async lambda is passed to (ast-transpiler java `asyncSupplier`); it defaults to VIRTUAL_EXECUTOR. */
export const JAVA_ASYNC_SUPPLIER = 'BaseExchange.supplyAsync';
/** Import that makes JAVA_ASYNC_SUPPLIER resolve outside package io.github.ccxt. */
export const JAVA_ASYNC_SUPPLIER_IMPORT = 'import io.github.ccxt.BaseExchange;';

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
};

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
export function supplyBodyReturnsType(lines: string[], from: number, to: number, supplyIndent: string, m: MethodInfo): boolean {
    const want = m.isArray ? undefined : m.javaReturnType;
    if (want === undefined || ![ 'String', 'Long', 'Double', 'Boolean', 'Map<String, Object>' ].includes(want)) return false;
    const body = lines.slice(from, to);
    const opened = body.findIndex(l => l.trim().endsWith('supplyAsync(() -> {'));
    if (opened === -1) return false;
    const inner = body.slice(opened + 1);
    if (inner.some(l => l.includes('->'))) return false;
    const declTypes = new Map<string, Set<string>>();
    for (const l of inner) {
        const d = /^\s*(?:final )?([A-Za-z_][\w.]*(?:<[^=]*>)?) (\w+)(?: = .*)?;$/.exec(l);
        if (d !== null && d[1] !== 'return' && d[1] !== 'throw') {
            const set = declTypes.get(d[2]) ?? new Set<string>();
            set.add(d[1].replace(/^java\.util\./, ''));
            declTypes.set(d[2], set);
        }
    }
    const sameType = (t: string) => t === want || (want === 'Map<String, Object>' && t === 'HashMap<String, Object>');
    let returns = 0;
    for (const l of inner) {
        if (/^\s*return\b/.test(l) && !/;\s*$/.test(l)) return false;
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
        const call = wholeThisCall(e);
        if (call !== undefined && TYPED_BASE_READERS[call] === want) continue;
        return false;
    }
    return returns > 0;
}

/**
 * Retype every `public CompletableFuture<Object> <name>(` declaration found in the table and
 * put the typed construction on the method's supplyAsync tail. Works on any transpiled tier text.
 */
export function typeCoreReturns(source: string, table: Map<string, MethodInfo>): string {
    const lines = source.split('\n');
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
            if (lines[j].startsWith(supplyIndent) && lines[j].length === supplyIndent.length + trimmed.length
                && (isAsyncLambdaClose(trimmed) || trimmed.startsWith(`return ${FUTURE}.failedFuture(`)) && trimmed.endsWith(');')) {
                // every `return` of the supply lambda already has the declared type: `supplyAsync`
                // infers T from the retyped declaration, so the future is returned as-is (no cast lambda)
                if (isAsyncLambdaClose(trimmed) && supplyBodyReturnsType(lines, i + 1, j, supplyIndent, m)) {
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
    ].join('\n');
    const info = (javaReturnType: string): MethodInfo => ({ name: 'm', javaReturnType, isArray: false, elementType: null, requiredParams: [], optionalParams: [], isWatch: false } as any);
    const rows: Array<[string, string, string[], boolean]> = [
        // [label, type, body, cast lambda expected]
        [ 'string local', 'String', [ 'String result = this.safeString(parameters, "k");', 'return result;' ], false ],
        [ 'string local + null', 'String', [ 'String result = null;', 'if (parameters == null)', '{', '    return null;', '}', 'return result;' ], false ],
        [ 'typed reader', 'Long', [ 'return this.safeInteger(parameters, "time");' ], false ],
        [ 'map local', 'Map<String, Object>', [ 'Map<String, Object> response = (Map<String, Object>) this.safeDict(parameters, "a", null);', 'return response;' ], false ],
        [ 'boolean literals', 'Boolean', [ 'if (parameters == null)', '{', '    return false;', '}', 'return true;' ], false ],
        [ 'Object local keeps cast', 'String', [ 'Object result = this.safeValue(parameters, "k");', 'return result;' ], true ],
        [ 'joined future keeps cast', 'Map<String, Object>', [ 'return (this.fetchX(parameters)).join();' ], true ],
        [ 'reader of another type keeps cast', 'String', [ 'return this.safeInteger(parameters, "k");' ], true ],
        [ 'trailing call keeps cast', 'String', [ 'return this.safeString(a, "k").trim();' ], true ],
        [ 'nested lambda keeps cast', 'String', [ 'String r = null;', 'Object f = (x) -> { return x; };', 'return r;' ], true ],
        [ 'no-cast row keeps typed declaration', 'String', [ 'return this.safeString(parameters, "k");' ], false ],
    ];
    for (const [ label, type, body, cast ] of rows) {
        const out = typeCoreReturns(core(type, body), new Map([ [ 'm', info(type) ] ]));
        const hasCast = out.includes('.thenApply(');
        if (hasCast !== cast) problems.push(`typed core direct return '${label}': expected cast lambda ${cast}, got ${hasCast}`);
        if (!out.includes(`CompletableFuture<${qualifyJavaType(type)}> m(`)) problems.push(`typed core direct return '${label}': declaration not retyped`);
    }
    return problems;
}
