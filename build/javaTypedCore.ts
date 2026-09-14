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
    if (tier === 'prediction') {
        const shared = baseTierDeclaredNames();
        for (const m of restMethods()) {
            if (shared.has(m.name) && table.has(m.name)) table.set(m.name, m);
        }
    }
    return table;
}

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
    if (m.isArray && m.elementType) return `res -> Helpers.toTypedList(res, io.github.ccxt.types.${m.elementType}::new)`;
    if (m.javaReturnType === 'Long') return 'res -> (res instanceof Number n) ? n.longValue() : null';
    if (m.javaReturnType === 'Double') return 'res -> (res instanceof Number n) ? n.doubleValue() : null';
    if (m.javaReturnType === 'String') return 'res -> (String) res';
    if (m.javaReturnType === 'Boolean') return 'res -> (Boolean) res';
    if (m.javaReturnType === 'Map<String, Object>') return 'res -> (java.util.Map<String, Object>) res';
    return `io.github.ccxt.types.${m.javaReturnType}::new`;
}

const DECL_RE = /^(\s*)public (?:java\.util\.concurrent\.)?CompletableFuture<Object> (\w+)\((.*)$/;

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
        const supplyClose = bodyIndent + '    });';
        let converted = false;
        for (let j = i + 1; j < lines.length; j++) {
            if (lines[j] === close) break;
            if (lines[j] === supplyClose) {
                lines[j] = `${bodyIndent}    }).thenApply(${coreConverter(m)});`;
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
