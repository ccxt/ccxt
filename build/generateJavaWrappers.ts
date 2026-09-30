#!/usr/bin/env tsx
/**
 * Java Typed Surface Generator for CCXT
 *
 * Emits ONE interface per tier (TypedSurface for Exchange, PredictionTypedSurface
 * for PredictionExchange). The abstract `CompletableFuture<T> m(...)` signatures are the
 * typed cores' own signatures, read from the generated tier files (return family from
 * build/javaTypedCore.ts); the `default` methods are the typed sync (blocking) truncations
 * and async overloads, each calling the core at full arity with the TS defaults.
 *
 * Usage: tsx build/generateJavaWrappers.ts
 */

import Transpiler from "ast-transpiler";
import * as fs from 'fs';
import { fileURLToPath } from 'node:url';
import { writeOverloadStrippedFile, removeOverloadStrippedFile, restoreParamsBagInitializers } from './stripOverloads.js';
import { typedReturnTable } from './javaTypedCore.js';
import type { JavaTier } from './javaTypedCore.js';
import { applyJavaImports, nativeTypedList } from './javaUtilImports.js';

const TS_BASE_FILE = './ts/src/base/Exchange.ts';
const BASE_PKG = './java/lib/src/main/java/io/github/ccxt/';

// Known CCXT types that have Java equivalents in io.github.ccxt.types
const KNOWN_TYPES = new Set([
    'Ticker', 'Tickers', 'Trade', 'Order', 'OrderBook', 'OHLCV',
    'MarketInterface', 'Currencies', 'CurrencyInterface', 'Account', 'Balance', 'BalanceAccount', 'Balances',
    'ADL',
    'Position', 'FundingRate', 'FundingRates', 'FundingRateHistory',
    'OpenInterest', 'OpenInterests', 'Liquidation',
    'LeverageTier', 'LeverageTiers', 'Leverage', 'Leverages',
    'MarginMode', 'MarginModes', 'MarginModification', 'MarginLoan',
    'Status', 'PositionModeInfo',
    'Transaction', 'DepositAddress', 'TransferEntry',
    'LedgerEntry', 'TradingFeeInterface', 'TradingFees',
    'Greeks', 'Option', 'OptionChain', 'Conversion',
    'LastPrice', 'LastPrices', 'LongShortRatio',
    'BorrowInterest', 'CrossBorrowRate', 'CrossBorrowRates',
    'IsolatedBorrowRate', 'IsolatedBorrowRates',
    'FundingHistory', 'DepositWithdrawFee', 'DepositWithdrawFees',
    'OrderBooks',
    'OrderRequest', 'CancellationRequest', 'WithdrawalResponse',
    // native dedicated prediction-market types (io.github.ccxt.types.Prediction*)
    'PredictionTicker', 'PredictionTickers', 'PredictionOrder', 'PredictionTrade', 'PredictionPosition', 'PredictionOrderBook', 'PredictionTradingFee', 'PredictionOpenInterest', 'PredictionSettlement',
    'PredictionEvent', 'PredictionMarket', 'PredictionOutcome', 'PredictionFees', 'PredictionOrderRequest',
]);

// --- Type helpers ---
function isStringType(t: string) { return t === 'Str' || t === 'string' || t === 'StringLiteral' || t === 'OrderSide' || t === 'OrderType' || t === 'MarketType'; }
function isNumberType(t: string) { return t === 'Num' || t === 'number' || t === 'NumericLiteral'; }
function isIntegerType(t: string) { return t !== undefined && t.toLowerCase() === 'int'; }
function isBooleanType(t: string) { return t === 'boolean' || t === 'Bool'; }
// Key/value bags: Dict, Dictionary<...>, Object and inline `{ ... }` literals. Same
// shape as `params`, so they get the same Java type in every position. Every branch
// is anchored at BOTH ends so an array of bags (`Dictionary<any>[]`, `{ ... }[]`)
// falls through instead of being typed as a single Map.
function isDictType(t: string) { return t === 'Dict' || t === 'Object' || (t?.startsWith('Dictionary<') && t?.endsWith('>')) || (t?.startsWith('{') && t?.endsWith('}')); }
// Genuinely free-form annotations. NOT dict-shaped: `fetchPartialBalance (part: any)`
// takes a string key, so narrowing `any` to Map would break real call sites.
function isFreeFormType(t: string) { return t === 'any' || t === 'unknown'; }
function isObjectType(t: string) { return isFreeFormType(t) || isDictType(t); }

// Request bags passed INTO the exchange as arrays of plain dicts on the wire. The
// same-named Java KNOWN_TYPES are parse-result POJOs built from a response, so inputs
// stay Map-shaped rather than reusing them.
const REQUEST_BAG_TYPES = new Set([ 'OrderRequest', 'CancellationRequest', 'PredictionOrderRequest' ]);

// TS type aliases (`export type X = Y | undefined`) whose Java class carries
// the non-null name. Kept out of KNOWN_TYPES because emitting `new X(res)`
// for the alias name would be a `cannot find symbol` at compile time.
const KNOWN_TYPE_ALIASES: Record<string, string> = {
    'Market': 'MarketInterface',
    'Currency': 'CurrencyInterface',
};

// Scalars map to BOXED reference types — Int→Long (64-bit, ms timestamps), Num→Double,
// Str→String, Bool→Boolean — never primitives, so every optional slot accepts a typed null.
function tsTypeToJavaType(tsType: string | undefined, isReturn = false): string {
    if (!tsType) return 'Object';
    if (isStringType(tsType)) return 'String';
    if (isIntegerType(tsType)) return 'Long';
    if (isNumberType(tsType)) return 'Double';
    if (isBooleanType(tsType)) return 'Boolean';
    if (tsType === 'Strings' || tsType === 'string[]') return 'List<String>';
    if (tsType.endsWith('[]') && REQUEST_BAG_TYPES.has(tsType.slice(0, -2))) return 'List<Map<String, Object>>';
    if (isDictType(tsType)) return 'Map<String, Object>';
    if (isFreeFormType(tsType)) return isReturn ? 'Map<String, Object>' : 'Object';
    if (KNOWN_TYPES.has(tsType)) return tsType;
    return 'Object';
}

function tsReturnTypeToJava(methodName: string, tsReturnType: string): { javaType: string, isArray: boolean, elementType: string | null } | null {
    if (methodName === 'fetchTime') return { javaType: 'Long', isArray: false, elementType: null };
    if (methodName.startsWith('watchOrderBook')) return { javaType: 'OrderBook', isArray: false, elementType: null };
    // Base body is fetchOrderBook + aggregate/extend (blockchaincom: parseOrderBook).
    // The TS annotation is missing so the parser sees Promise<any>; without this
    // special-case the typed OrderBook wrapper is never emitted. Java-only — do
    // not annotate Exchange.ts here (Go IFetchL2OrderBook / C# already diverge).
    if (methodName === 'fetchL2OrderBook') return { javaType: 'OrderBook', isArray: false, elementType: null };
    if (methodName === 'watchOHLCVForSymbols') return null;

    const isPromise = tsReturnType.startsWith('Promise<') && tsReturnType.endsWith('>');
    let inner = isPromise ? tsReturnType.slice(8, -1) : tsReturnType;

    if (inner.endsWith('[]')) {
        const elem = inner.slice(0, -2);
        const className = KNOWN_TYPE_ALIASES[elem] ?? elem;
        if (KNOWN_TYPES.has(className)) return { javaType: `List<${className}>`, isArray: true, elementType: className };
        if (elem === 'string') return { javaType: 'List<String>', isArray: true, elementType: null };
        return null;
    }
    {
        const className = KNOWN_TYPE_ALIASES[inner] ?? inner;
        if (KNOWN_TYPES.has(className)) return { javaType: className, isArray: false, elementType: null };
    }
    if (isIntegerType(inner) || inner === 'number' && methodName === 'fetchTime') return { javaType: 'Long', isArray: false, elementType: null };
    if (isNumberType(inner)) return { javaType: 'Double', isArray: false, elementType: null };
    if (isStringType(inner)) return { javaType: 'String', isArray: false, elementType: null };
    if (isBooleanType(inner)) return { javaType: 'Boolean', isArray: false, elementType: null };
    if (isObjectType(inner)) return null;
    if (inner === 'void') return null;
    if (inner.startsWith('Dictionary<')) return null;
    if (inner.startsWith('{')) return null;
    if (inner === 'string[][]') return null;
    return null;
}

// --- Allowed method filter ---
// 'addMargin' / 'reduceMargin' / 'borrow' / 'repay' cover the eight base margin
// methods (addMargin, reduceMargin, borrow{Cross,Isolated,}Margin,
// repay{Cross,Isolated,}Margin). They are annotated Promise<MarginModification> /
// Promise<MarginLoan> in Exchange.ts and share setMargin's already-wrapped shape;
// without these prefixes they were silently left as CompletableFuture<Object> on
// the exchange with no typed overload. 'loadAccounts' is the same gap: the parser
// already infers Promise<Account[]> from `this.accounts!: Account[]` / fetchAccounts,
// but the name missed every prefix so no typed overload was emitted. The prefixes
// are deliberately narrow so the sync helpers (addFetchCache, addKeyInArrayItems,
// reduceFeesByCurrency) and other load* internals (loadMarkets, loadTimeDifference,
// loadOrderBook) stay out. loadAccounts is NOT on ZERO_REQUIRED_TYPED_WHITELIST —
// its internal callers print the full-arity core call.
const ALLOWED_PREFIXES = ['fetch', 'create', 'edit', 'cancel', 'close', 'setP', 'setM', 'setL', 'transfer', 'withdraw', 'watch', 'unWatch', 'addMargin', 'reduceMargin', 'borrow', 'repay', 'loadAccounts'];
const BLACKLIST = new Set([
    'fetch', 'fetchCurrenciesWs', 'fetchMarketsWs', 'setSandBoxMode', 'loadOrderBook',
    'loadMarketsHelper', 'createNetworksByIdObject', 'setMarketsFromExchange',
    'setLastRequest', 'setLastRestRequestTimestamp',
    'setProperty', 'setProxyAgents', 'watch', 'watchMultiple', 'watchMultipleSubscription',
    'watchPrivate', 'watchPublic', 'setPositionsCache', 'setPositionCache',
    'watchMany', 'watchMultiHelper', 'watchMultipleWrapper', 'watchMultiRequest',
    'watchMultiTicker', 'watchMultiTickerHelper', 'watchPrivateMultiple',
    'watchPrivateRequest', 'watchPrivateSubscribe', 'watchPublicMultiple',
    'watchSpotPrivate', 'watchSwapPrivate', 'watchSpotPublic', 'watchSwapPublic',
    'watchTopics', 'createContractOrder', 'createSpotOrder', 'createSwapOrder', 'createVault',
    'fetchRestOrderBookSafe', 'fetchPortfolioDetails', 'unWatch', 'unWatchChannel', 'unWatchMultiple',
    'unWatchPrivate', 'unWatchPublic', 'unWatchPublicMultiple', 'unWatchTopics',
]);

function shouldCreateWrapper(name: string): boolean {
    if (BLACKLIST.has(name)) return false;
    if (name.toLowerCase().includes('uta')) return false;
    if (name.includes('Snapshot') || name.includes('Subscription') || name.includes('Cache')) return false;
    return ALLOWED_PREFIXES.some(p => name.startsWith(p));
}

export interface ParamInfo {
    name: string;
    javaType: string;
    isOptional: boolean;
    defaultValue: string | null;
}

export interface MethodInfo {
    name: string;
    javaReturnType: string;
    isArray: boolean;
    elementType: string | null;
    requiredParams: ParamInfo[];
    optionalParams: ParamInfo[];
    isWatch: boolean;
}

// Zero-required-param methods that get typed zero-arg + truncation defaults
// (internal calls print full arity, so a truncation never binds them).
export const ZERO_REQUIRED_TYPED_WHITELIST = new Set([
    // REST
    'fetchBalance',
    'fetchOrders',
    'fetchMyTrades',
    'fetchOpenOrders',
    'fetchClosedOrders',
    'fetchCanceledOrders',
    'fetchTime',
    'fetchStatus',
    'fetchTickers',
    'fetchPositions',
    'fetchAccounts',
    'fetchCurrencies',
    'fetchMarkets',
    // WebSocket variants with a base `Object...` core. `fetchCurrenciesWs` is
    // excluded: its TS body uses `new Promise()`, which has no Java core.
    'fetchBalanceWs',
    'fetchOrdersWs',
    'fetchMyTradesWs',
    'fetchOpenOrdersWs',
    'fetchClosedOrdersWs',
    'fetchTickersWs',
    'fetchPositionsWs',
]);

// watch* methods with all-optional parameters: typed truncation overloads only,
// no async siblings (watch* is sync-only) and no internal-call rewrite.
const WATCH_ZERO_ARG_WHITELIST = new Set([
    'watchTickers',
    'watchBalance',
    'watchOrders',
    'watchMyTrades',
    'watchPositions',
]);

export function parseMethodsFromTS(sourceFile: string = TS_BASE_FILE): MethodInfo[] {
    const transpiler = new Transpiler({ verbose: false, csharp: { parser: { ELEMENT_ACCESS_WRAPPER_OPEN: "getValue(", ELEMENT_ACCESS_WRAPPER_CLOSE: ")" } } });
    const strippedBaseFile = writeOverloadStrippedFile (sourceFile);
    const baseFile: any = transpiler.transpileJavaByPath(strippedBaseFile);
    removeOverloadStrippedFile (strippedBaseFile, sourceFile);
    const methodsTypes = restoreParamsBagInitializers (baseFile.methodsTypes || []);

    const methods: MethodInfo[] = [];

    for (const m of methodsTypes) {
        if (!m.async) continue;
        if (!shouldCreateWrapper(m.name)) continue;

        const ret = tsReturnTypeToJava(m.name, m.returnType);
        if (!ret) continue;

        const requiredParams: ParamInfo[] = [];
        const optionalParams: ParamInfo[] = [];

        for (const p of m.parameters) {
            const isOptional = p.optional || p.initializer !== undefined;
            const isParams = p.name === 'params';
            const javaType = tsTypeToJavaType(p.type, false);

            if (isParams) {
                optionalParams.push({ name: 'params', javaType: 'Map<String, Object>', isOptional: true, defaultValue: 'null' });
            } else if (isOptional) {
                let defaultValue: string | null = null;
                if (p.initializer && p.initializer !== 'undefined' && p.initializer !== '{}') {
                    defaultValue = p.initializer.replace(/'/g, '"');
                }
                optionalParams.push({ name: safeName(p.name), javaType, isOptional: true, defaultValue });
            } else {
                requiredParams.push({ name: safeName(p.name), javaType, isOptional: false, defaultValue: null });
            }
        }

        if (!optionalParams.some(p => p.name === 'params')) {
            optionalParams.push({ name: 'params', javaType: 'Map<String, Object>', isOptional: true, defaultValue: 'null' });
        }

        methods.push({
            name: m.name,
            javaReturnType: ret.javaType,
            isArray: ret.isArray,
            elementType: ret.elementType,
            requiredParams,
            optionalParams,
            isWatch: m.name.startsWith('watch'),
        });
    }

    return methods;
}

function safeName(name: string): string {
    const reserved: Record<string, string> = { 'type': 'type', 'params': 'params' };
    return reserved[name] || name;
}

function camelCase(name: string): string {
    return name.charAt(0).toLowerCase() + name.slice(1);
}

function capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

// Core return type of a unified method: the typed family javaTypedCore.ts emits on the
// transpiled tier, or `Object` for the hand-written base bodies (fetchMarkets, ...).
function coreReturnType(m: MethodInfo, table: Map<string, MethodInfo>): string {
    const typed = table.get(m.name);
    return typed ? typed.javaReturnType : 'Object';
}

// Conversion of an untyped core result; only the SURFACE_ONLY names still need one.
function genReturnExpr(m: MethodInfo): string {
    if (m.isArray && m.elementType) return nativeTypedList(m.elementType);
    if (m.javaReturnType === 'Object') return 'res';
    if (m.javaReturnType === 'Long') return '(res instanceof Number n) ? n.longValue() : null';
    if (m.javaReturnType === 'Double') return '(res instanceof Number n) ? n.doubleValue() : null';
    if (m.javaReturnType === 'String') return '(String) res';
    if (m.javaReturnType === 'Boolean') return '(Boolean) res';
    if (m.javaReturnType === 'Map<String, Object>') return '(Map<String, Object>) res';
    return `new ${m.javaReturnType}(res)`;
}

function genAsyncReturnExpr(m: MethodInfo): string {
    if (m.isArray && m.elementType) return `res -> ${nativeTypedList(m.elementType)}`;
    if (m.javaReturnType === 'Object') return 'res -> res';
    if (m.javaReturnType === 'Long') return 'res -> (res instanceof Number n) ? n.longValue() : null';
    if (m.javaReturnType === 'Double') return 'res -> (res instanceof Number n) ? n.doubleValue() : null';
    if (m.javaReturnType === 'String') return 'res -> (String) res';
    if (m.javaReturnType === 'Boolean') return 'res -> (Boolean) res';
    if (m.javaReturnType === 'Map<String, Object>') return 'res -> (Map<String, Object>) res';
    return `${m.javaReturnType}::new`;
}

// The typed core's parameter types, name -> printed Java types, read from the generated tier
// files (the transpiler owns them); set by generateTypedSurfaceInterface for the tier it prints.
let coreParamTypes: Map<string, string[]> = new Map();

// Surface parameter types: the core's type where the core is typed, else the surface's own type.
function surfaceParams(m: MethodInfo): ParamInfo[] {
    const all = [...m.requiredParams, ...m.optionalParams];
    const core = coreParamTypes.get(m.name);
    if (core === undefined) return all;
    if (core.length !== all.length) {
        throw new Error(`${m.name}: typed core takes ${core.length} parameters, Exchange.ts declares ${all.length}`);
    }
    return all.map((p, k) => (core[k] === 'Object' ? p : { ...p, javaType: core[k] }));
}

// TS default of an omitted trailing parameter: the literal initializer, `{}` for params, else a typed null.
function defaultArg(p: ParamInfo): string {
    if (p.name === 'params') return 'new java.util.HashMap<String, Object>()';
    const v = p.defaultValue;
    if (!v || v === 'null' || v === 'undefined') return `(${p.javaType}) null`;
    if (p.javaType === 'Long' && /^-?\d+$/.test(v)) return `${v}L`;
    if (p.javaType === 'Double' && /^-?\d+(\.\d+)?$/.test(v)) return `${v}d`;
    return v;
}

// Full-arity call of the typed core. A null params bag is the TS default `{}`.
function genDelegateCall(methodName: string, allParams: ParamInfo[]): string {
    const args = allParams.map((p) => (p.name === 'params'
        ? `(params != null ? params : new java.util.HashMap<String, Object>())`
        : p.name)).join(', ');
    return `this.${methodName}(${args})`;
}

function genMethod(m: MethodInfo, coreType: string): string {
    const methodName = camelCase(m.name);
    const typedCore = coreType === m.javaReturnType;
    const allParams = surfaceParams(m);
    const required = allParams.slice(0, m.requiredParams.length);
    const optional = allParams.slice(m.requiredParams.length);
    const fullParamDecl = allParams.map(p => `${p.javaType} ${p.name}`).join(', ');
    const delegateCall = genDelegateCall(methodName, allParams);

    const lines: string[] = [];

    // Sync methods block with Helpers.joinUnwrapped so ccxt errors surface as their own
    // exception type (InsufficientFunds, NetworkError, ...) instead of a CompletionException.
    // The full arity belongs to the typed core (it returns the future): no sync overload there.
    suppressedSyncDefaults.push(m.name);

    // Truncation overloads: required + first k optionals, k = 0 .. N-1, each a unique arity
    // below the core's, calling the core with the TS defaults of the omitted parameters.
    // Zero-required methods only get them when whitelisted (a zero-arg typed overload
    // shadows nothing now, but the list keeps the public surface unchanged).
    const emitTruncations = m.requiredParams.length > 0
        || ZERO_REQUIRED_TYPED_WHITELIST.has(m.name)
        || WATCH_ZERO_ARG_WHITELIST.has(m.name);
    if (emitTruncations) {
        for (let k = 0; k < optional.length; k++) {
            const presentParams = [...required, ...optional.slice(0, k)];
            const presentDecl = presentParams.map(p => `${p.javaType} ${p.name}`).join(', ');
            const allArgs = [...presentParams.map(p => p.name), ...optional.slice(k).map(defaultArg)].join(', ');
            const call = `Helpers.joinUnwrapped(this.${methodName}(${allArgs}))`;
            if (typedCore) {
                lines.push(`    default ${m.javaReturnType} ${methodName}(${presentDecl}) { return ${call}; }`);
            } else {
                lines.push(`    @SuppressWarnings("unchecked")`);
                lines.push(`    default ${m.javaReturnType} ${methodName}(${presentDecl}) { Object res = ${call}; return ${genReturnExpr(m)}; }`);
            }
        }
    }

    // Async method (full params): the typed-parameter spelling of the core call, for a caller
    // that wants the surface name; the core itself is the same call.
    if (typedCore) {
        lines.push(`    default CompletableFuture<${m.javaReturnType}> ${methodName}Async(${fullParamDecl}) { return ${delegateCall}; }`);
    } else {
        lines.push(`    @SuppressWarnings("unchecked")`);
        lines.push(`    default CompletableFuture<${m.javaReturnType}> ${methodName}Async(${fullParamDecl}) {`);
        lines.push(`        return ${delegateCall}.thenApply(${genAsyncReturnExpr(m)});`);
        lines.push(`    }`);
    }

    // Async truncation overloads, symmetric with the sync truncations above.
    if (emitTruncations) {
        for (let k = 0; k < optional.length; k++) {
            const presentParams = [...required, ...optional.slice(0, k)];
            const presentDecl = presentParams.map(p => `${p.javaType} ${p.name}`).join(', ');
            const allArgs = [...presentParams.map(p => p.name), ...optional.slice(k).map(defaultArg)].join(', ');
            lines.push(`    default CompletableFuture<${m.javaReturnType}> ${methodName}Async(${presentDecl}) { return ${methodName}Async(${allArgs}); }`);
        }
    }

    // String[] overload at FULL arity for a List<String> parameter (arrays are the common
    // caller spelling). Only full arity: a truncated one would make `f(null)` ambiguous.
    const hasListString = allParams.some(p => p.javaType === 'List<String>');
    if (hasListString) {
        const stringArrDecl = allParams.map(p =>
            p.javaType === 'List<String>' ? `String[] ${p.name}` : `${p.javaType} ${p.name}`
        ).join(', ');
        const delegateArgs = allParams.map(p =>
            p.javaType === 'List<String>'
                ? `${p.name} == null ? null : java.util.Arrays.asList(${p.name})`
                : p.name
        ).join(', ');
        lines.push(`    default ${m.javaReturnType} ${methodName}(${stringArrDecl}) { return Helpers.joinUnwrapped(${methodName}Async(${delegateArgs})); }`);
        lines.push(`    default CompletableFuture<${m.javaReturnType}> ${methodName}Async(${stringArrDecl}) { return ${methodName}Async(${delegateArgs}); }`);
    }

    return lines.join('\n');
}

// --- Hoisted typed surface ---
// Every typed overload is a `default` method on ONE generated interface per tier that the
// tier base class implements. The abstract declaration is the typed core's own signature
// (read from the generated tier files), so every default calls the core at full arity.

// Split a printed Java parameter list on top-level commas.
function splitParams(list: string): string[] {
    const out: string[] = [];
    let depth = 0, cur = '';
    for (const ch of list) {
        if (ch === '<') depth++;
        if (ch === '>') depth--;
        if (ch === ',' && depth === 0) { out.push(cur.trim()); cur = ''; } else cur += ch;
    }
    if (cur.trim()) out.push(cur.trim());
    return out;
}
function simpleJavaType(t: string): string {
    return t.replace(/\bjava\.util\./g, '').replace(/\bio\.github\.ccxt\.types\./g, '').replace(/\s+/g, ' ').replace(/, */g, ', ');
}
const CORE_DECL_RE = /^\s*public (?:java\.util\.concurrent\.)?CompletableFuture<(.+)> (\w+)\((.*)\)\s*\{?\s*$/;
// name -> parameter types of the first typed declaration found (files in priority order)
export function readCoreParamTypes(files: string[]): Map<string, string[]> {
    const out = new Map<string, string[]>();
    for (const file of files) {
        if (!fs.existsSync(file)) continue;
        for (const line of fs.readFileSync(file, 'utf-8').split('\n')) {
            const d = line.match(CORE_DECL_RE);
            if (!d || out.has(d[2]) || d[3].includes('...')) continue;
            out.set(d[2], splitParams(d[3]).map((p) => simpleJavaType(p.replace(/\s+\w+$/, ''))));
        }
    }
    return out;
}
function genAbstractDecl(m: MethodInfo, coreType: string): string {
    const name = camelCase(m.name);
    const all = [...m.requiredParams, ...m.optionalParams];
    const core = coreParamTypes.get(m.name);
    if (core === undefined) throw new Error(`${m.name}: no typed core declaration in the tier files`);
    if (core.length !== all.length) throw new Error(`${m.name}: typed core takes ${core.length} parameters, Exchange.ts declares ${all.length}`);
    return `    CompletableFuture<${coreType}> ${name}(${all.map((p, k) => `${core[k]} ${p.name}`).join(', ')});`;
}
// Erased parameter list (types only, generics dropped) of a core declaration.
function eraseParams(paramList: string): string {
    return splitParams(paramList).map((p) => simpleJavaType(p.replace(/\s+\w+$/, '')).replace(/<.*>$/, '')).join(', ');
}
// Cores spell the return in simple names once written (build/javaUtilImports.ts); the qualified
// java.util / io.github.ccxt.types spelling is accepted too so the check does not depend on the collapse.
function eraseReturn(t: string): string {
    return simpleJavaType(t);
}
// names whose full-arity sync overload is not generated (the typed core owns that arity)
const suppressedSyncDefaults: string[] = [];
export function suppressedSyncDefaultNames(): string[] {
    return Array.from(new Set(suppressedSyncDefaults)).sort();
}
// Every file that declares a surface name must declare the abstract signature itself (a typed
// override bridge counts); anything else is a silent OVERLOAD, so the base tier's body runs.
let erasureChecked = 0;
function assertErasureMatches(methods: MethodInfo[], table: Map<string, MethodInfo>, files: string[], extra: string[] = []): string[] {
    const expected = new Map<string, string>();
    for (const d0 of methods.map((m) => genAbstractDecl(m, coreReturnType(m, table))).concat(extra)) {
        const d = d0.match(/CompletableFuture<(.+)> (\w+)\((.*)\);$/)!;
        expected.set(d[2], `${simpleJavaType(d[1])} (${eraseParams(d[3])})`);
    }
    const out: string[] = [];
    const seen = new Map<string, Map<string, string[]>>();
    for (const file of files) {
        const lines = fs.readFileSync(file, 'utf-8').split('\n');
        for (let i = 0; i < lines.length; i++) {
            const d = lines[i].match(CORE_DECL_RE);
            if (!d || !expected.has(d[2])) continue;
            const actual = `${eraseReturn(d[1])} (${d[3].includes('...') ? d[3] : eraseParams(d[3])})`;
            if (!seen.has(d[2])) seen.set(d[2], new Map());
            const perFile = seen.get(d[2])!;
            if (!perFile.has(file)) perFile.set(file, []);
            perFile.get(file)!.push(`${actual}  [${file}:${i + 1}]`);
        }
    }
    for (const [name, want] of expected) {
        const perFile = seen.get(name);
        if (perFile === undefined) continue;
        for (const actuals of perFile.values()) {
            erasureChecked++;
            if (!actuals.some((a) => a.startsWith(`${want}  [`))) {
                out.push(`${name}: expected ${want}, found ${actuals.join(' | ')}`);
            }
        }
    }
    return out;
}
// hand-written base cores the surface also dispatches to; loadMarkets keeps its own specials
const LOAD_MARKETS_DECL_FALLBACK = '    CompletableFuture<Object> loadMarkets(Object reload, Object params);';
function loadMarketsDecl(): string {
    const core = coreParamTypes.get('loadMarkets');
    return core === undefined ? LOAD_MARKETS_DECL_FALLBACK
        : `    CompletableFuture<Object> loadMarkets(${core[0]} reload, ${core[1]} params);`;
}
export function generateTypedSurfaceInterface(ifaceName: string, methods: MethodInfo[], tier: JavaTier, coreFiles: string[]): string {
    const table = typedReturnTable(tier);
    coreParamTypes = readCoreParamTypes(coreFiles);
    // one name, one return family on every tier: the surface spells what the core declares
    methods = methods.map(m => table.get(m.name) ?? m);
    const lines: string[] = [];
    lines.push(`// PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:`);
    lines.push(`// https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code`);
    lines.push(``);
    lines.push(`package io.github.ccxt;`);
    // single-type imports are inserted here by applyJavaImports from the names the body uses
    lines.push(``);
    lines.push(`/**`);
    lines.push(` * Typed sync + async surface shared by every exchange. Declared ONCE; each default`);
    lines.push(` * method calls the typed core (overridden per exchange) at full arity.`);
    lines.push(` */`);
    lines.push(`public interface ${ifaceName} {`);
    lines.push(``);
    lines.push(`    // --- abstract core signatures (implemented by the transpiled tiers) ---`);
    lines.push(loadMarketsDecl());
    const seen = new Set<string>();
    for (const m of methods) {
        const d = genAbstractDecl(m, coreReturnType(m, table));
        if (!seen.has(d)) { seen.add(d); lines.push(d); }
    }
    lines.push(``);
    lines.push(`    // --- loadMarkets (special: first arg is boolean reload) ---`);
    lines.push(`    default Map<String, MarketInterface> loadMarkets(boolean reload) {`);
    lines.push(`        return Helpers.joinUnwrapped(this.loadMarketsAsync(reload));`);
    lines.push(`    }`);
    lines.push(`    @SuppressWarnings("unchecked")`);
    lines.push(`    default CompletableFuture<Map<String, MarketInterface>> loadMarketsAsync(boolean reload) {`);
    lines.push(`        return this.loadMarkets(reload, new java.util.HashMap<String, Object>()).thenApply(res -> {`);
    lines.push(`            java.util.LinkedHashMap<String, MarketInterface> result = new java.util.LinkedHashMap<>();`);
    lines.push(`            for (Map.Entry<String, Object> entry : ((Map<String, Object>) res).entrySet()) {`);
    lines.push(`                result.put(entry.getKey(), new MarketInterface(entry.getValue()));`);
    lines.push(`            }`);
    lines.push(`            return result;`);
    lines.push(`        });`);
    lines.push(`    }`);
    lines.push(``);
    for (const m of methods) {
        lines.push(genMethod(m, coreReturnType(m, table)));
        lines.push('');
    }
    lines.push(`}`);
    return lines.join('\n');
}

// *Ws (WS-API variants) are grouped with watch* methods on the same interface; on a
// REST-only instance they fall through to the base NotSupported thrower at runtime.
export const isWsApi = (m: MethodInfo) => m.name.endsWith('Ws');

// Prediction exchanges return the native dedicated Prediction* types. The shared
// restMethods list is parsed from base Exchange.ts (base return types), so remap the
// trading return types to their prediction equivalents for the prediction package.
const PREDICTION_TYPE_MAP: Record<string, string> = {
    'Ticker': 'PredictionTicker',
    'Tickers': 'PredictionTickers',
    'Order': 'PredictionOrder',
    'Trade': 'PredictionTrade',
    'Position': 'PredictionPosition',
    'OrderBook': 'PredictionOrderBook',
    'TradingFeeInterface': 'PredictionTradingFee',
    'OpenInterest': 'PredictionOpenInterest',
};
export function toPredictionMethods(rest: MethodInfo[]): MethodInfo[] {
    return rest.map((m) => {
        if (m.isArray && m.elementType && PREDICTION_TYPE_MAP[m.elementType]) {
            const elem = PREDICTION_TYPE_MAP[m.elementType];
            return { ...m, elementType: elem, javaReturnType: `List<${elem}>` };
        }
        if (!m.isArray && PREDICTION_TYPE_MAP[m.javaReturnType]) {
            return { ...m, javaReturnType: PREDICTION_TYPE_MAP[m.javaReturnType] };
        }
        return m;
    });
}
// Prediction-only base methods (fetchSettlements, ...) live on PredictionExchange.ts, not
// Exchange.ts, so the shared restMethods list (parsed from Exchange.ts) misses them. Parse the
// prediction base and add the methods NOT already present. Every prediction exchange extends
// PredictionExchange, so the abstract core signature resolves on all of them.
export const PREDICTION_BASE_TS = './ts/src/base/PredictionExchange.ts';
// Prediction methods implemented by some venue but absent from PredictionExchange.ts (its base
// stub throws NotSupported). `redeem` returns `Promise<any>`, so it cannot be parsed from TS.
export const PREDICTION_EXCHANGE_METHODS: Record<string, MethodInfo[]> = {
    'limitless': [{
        name: 'redeem',
        javaReturnType: 'Object', isArray: false, elementType: null,
        requiredParams: [],
        optionalParams: [
            { name: 'outcome', javaType: 'String', isOptional: true, defaultValue: null },
            { name: 'params', javaType: 'Map<String, Object>', isOptional: true, defaultValue: 'null' },
        ],
        isWatch: false,
    }],
};
// Exchange-tier method names no prediction venue (or PredictionExchange) implements. Prediction
// venues extend PredictionExchange (not the Exchange tier), so declaring these would demand a
// core signature no tier implements — and would re-expose the symbol-based surface
// (closePosition, fetchGreeks, ...) prediction deliberately drops. Exclude them from the
// interface, matching javaTranspiler's PredictionExchange injection.
export function predictionTierExcludeNames(): Set<string> {
    const src = fs.readFileSync(TS_BASE_FILE, 'utf8').split('\n');
    const es = src.findIndex(l => l.startsWith('export default class Exchange extends BaseExchange'));
    const re = /^    (?:async )?([a-zA-Z][a-zA-Z0-9]*) \(/;
    const tier = new Set<string>();
    for (let i = es; i < src.length; i++) {
        const m = src[i].match(re);
        if (m) tier.add(m[1]);
    }
    const impl = new Set<string>();
    const files = [ './ts/src/base/PredictionExchange.ts' ];
    const dir = './ts/src/prediction';
    if (fs.existsSync(dir)) {
        for (const f of fs.readdirSync(dir)) {
            if (f.endsWith('.ts')) files.push(dir + '/' + f);
        }
    }
    for (const file of files) {
        for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
            const m = line.match(re);
            if (m) impl.add(m[1]);
        }
    }
    const exclude = new Set<string>();
    for (const t of tier) {
        if (!impl.has(t)) exclude.add(t);
    }
    return exclude;
}

/**
 * Detect whether this module is the process entry point.
 *
 * Deliberately a local copy rather than `import { isMainEntry } from './transpile.js'`
 * (the pattern used by go/csharp/javaTranspiler). Those drivers already depend on
 * transpile.js; this module does not, and importing it here would add ~500ms of
 * module-load plus real top-level side effects (it reads and parses exchanges.json
 * at import time) to the standalone `tsx build/generateJavaWrappers.ts` step — and
 * would create an import cycle, since javaTranspiler.ts imports both this module
 * and transpile.js. Three lines of duplication is the cheaper trade.
 */
function isMainEntry(metaUrl: string): boolean {
    if (!metaUrl.startsWith('file:')) return false;
    const modulePath = fileURLToPath(metaUrl);
    return process.argv[1] === modulePath || process.argv[1] === modulePath.replace('.js', '');
}

// --- Main ---
function main() {
    console.log('Parsing TypeScript Exchange.ts...');
    const methods = parseMethodsFromTS();
    const restCount = methods.filter(m => !m.isWatch).length;
    const wsCount = methods.filter(m => m.isWatch).length;
    console.log(`Found ${methods.length} methods (REST: ${restCount}, WS: ${wsCount})`);

    for (const m of methods.slice(0, 5)) {
        const allParams = [...m.requiredParams, ...m.optionalParams];
        console.log(`  ${m.name}(${allParams.map(p => `${p.javaType} ${p.name}${p.isOptional ? '?' : ''}`).join(', ')}) -> ${m.javaReturnType}`);
    }

    const restMethods = methods.filter(m => !m.isWatch && !isWsApi(m));

    const baseMethodNames = new Set(methods.map(m => m.name));
    let predictionBaseOnlyMethods: MethodInfo[] = [];
    if (fs.existsSync(PREDICTION_BASE_TS)) {
        predictionBaseOnlyMethods = parseMethodsFromTS(PREDICTION_BASE_TS).filter(m => !m.isWatch && !isWsApi(m) && !baseMethodNames.has(m.name));
        if (predictionBaseOnlyMethods.length) {
            console.log(`Found ${predictionBaseOnlyMethods.length} prediction-base-only methods: ${predictionBaseOnlyMethods.map(m => m.name).join(', ')}`);
        }
    }

    const predictionExclude = predictionTierExcludeNames();
    const predictionRestMethods = toPredictionMethods(restMethods.filter(m => !predictionExclude.has(m.name))).concat(predictionBaseOnlyMethods);
    const wsMethods = methods.filter(m => m.isWatch || isWsApi(m));
    const exchangesDir = BASE_PKG + 'exchanges/';
    const javaFiles = (dir: string) => fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => f.endsWith('.java')).map(f => dir + f) : [];
    // core signatures: the tier base first, then the venues (loadMarkets is only typed on a venue)
    const mainCoreFiles = [ BASE_PKG + 'Exchange.java', BASE_PKG + 'BaseExchange.java' ].concat(javaFiles(exchangesDir), javaFiles(exchangesDir + 'pro/'));
    const predictionCoreFiles = [ BASE_PKG + 'PredictionExchange.java', BASE_PKG + 'BaseExchange.java' ].concat(javaFiles(exchangesDir + 'prediction/'));
    const restSurface = generateTypedSurfaceInterface('TypedSurface', restMethods.concat(wsMethods), 'rest', mainCoreFiles);
    const mainLoadMarkets = loadMarketsDecl();
    fs.writeFileSync(BASE_PKG + 'TypedSurface.java', applyJavaImports(restSurface, true), 'utf-8');
    const predictionExtra = Object.values(PREDICTION_EXCHANGE_METHODS).flat();
    const predictionMethods = predictionRestMethods.concat(predictionExtra);
    const predictionSurface = generateTypedSurfaceInterface('PredictionTypedSurface', predictionMethods, 'prediction', predictionCoreFiles);
    const predictionLoadMarkets = loadMarketsDecl();
    fs.writeFileSync(BASE_PKG + 'PredictionTypedSurface.java', applyJavaImports(predictionSurface, true), 'utf-8');
    console.log(`Generated TypedSurface (${restMethods.length} REST + ${wsMethods.length} WS methods) and PredictionTypedSurface (${predictionMethods.length} methods)`);
    console.log(`Full-arity sync overloads not generated: ${suppressedSyncDefaultNames().length} names`);

    const mainTierFiles = [ BASE_PKG + 'BaseExchange.java', BASE_PKG + 'Exchange.java' ].concat(javaFiles(exchangesDir), javaFiles(exchangesDir + 'pro/'));
    const predictionTierFiles = [ BASE_PKG + 'PredictionExchange.java' ].concat(javaFiles(exchangesDir + 'prediction/'));
    coreParamTypes = readCoreParamTypes(mainCoreFiles);
    const mismatches = assertErasureMatches(restMethods.concat(wsMethods), typedReturnTable('rest'), mainTierFiles, [ mainLoadMarkets ]);
    coreParamTypes = readCoreParamTypes(predictionCoreFiles);
    mismatches.push(...assertErasureMatches(predictionMethods, typedReturnTable('prediction'), predictionTierFiles, [ predictionLoadMarkets ]));
    if (mismatches.length > 0) {
        console.error(`\nERROR: ${mismatches.length} core override(s) do not erase to the abstract interface signature:`);
        for (const x of mismatches) console.error(`  ${x}`);
        process.exit(1);
    }
    console.log(`Erasure check: ${erasureChecked} core declarations match their abstract interface signature`);

    console.log('Done!');
}

if (isMainEntry(import.meta.url)) {
    main();
}

