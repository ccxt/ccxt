#!/usr/bin/env tsx
/**
 * Java Typed Surface Generator for CCXT
 *
 * Emits ONE interface per tier (TypedSurface for Exchange, PredictionTypedSurface
 * for PredictionExchange). The abstract `CompletableFuture<T> m(Object..., Object...
 * optionalArgs)` signatures mirror the transpiled cores, which build/javaTypedCore.ts
 * types in place; the `default` methods are the typed-parameter sync (blocking) and
 * async overloads, dispatching with explicit (Object) casts so the call always
 * reaches the transpiled per-exchange override virtually.
 *
 * Usage: tsx build/generateJavaWrappers.ts
 */

import Transpiler from "ast-transpiler";
import * as fs from 'fs';
import { fileURLToPath } from 'node:url';
import { writeOverloadStrippedFile, removeOverloadStrippedFile, restoreParamsBagInitializers } from './stripOverloads.js';
import { JAVA_STRING_PARAM_POSITIONS } from './java-local-types.js';
import { typedReturnTable } from './javaTypedCore.js';
import type { JavaTier } from './javaTypedCore.js';
import { applyJavaImports } from './javaUtilImports.js';

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
function isObjectType(t: string) { return t === 'any' || t === 'unknown' || t === 'Dict' || t === 'Object' || t === 'Dictionary<any>' || (t?.startsWith('{') && t?.endsWith('}')); }

// TS type aliases (`export type X = Y | undefined`) whose Java class carries
// the non-null name. Kept out of KNOWN_TYPES because emitting `new X(res)`
// for the alias name would be a `cannot find symbol` at compile time.
const KNOWN_TYPE_ALIASES: Record<string, string> = {
    'Market': 'MarketInterface',
    'Currency': 'CurrencyInterface',
};

function tsTypeToJavaType(tsType: string | undefined, isReturn = false): string {
    if (!tsType) return 'Object';
    if (isStringType(tsType)) return 'String';
    if (isIntegerType(tsType)) return 'Long';
    if (isNumberType(tsType)) return 'Double';
    if (isBooleanType(tsType)) return 'Boolean';
    if (tsType === 'Strings' || tsType === 'string[]') return 'List<String>';
    if (isObjectType(tsType)) return isReturn ? 'Map<String, Object>' : 'Object';
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
// REST/WS cores still call `this.loadAccounts()` against the Object... varargs.
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

// Zero-required-param methods that get typed zero-arg + truncation defaults.
// javaTranspiler routes internal `this.<m>()` / `this.<m>(null)` calls on these
// names to the varargs core (`new Object[0]`) so the typed default never binds.
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
    if (m.isArray && m.elementType) return `Helpers.toTypedList(res, ${m.elementType}::new)`;
    if (m.javaReturnType === 'Object') return 'res';
    if (m.javaReturnType === 'Long') return '(res instanceof Number n) ? n.longValue() : null';
    if (m.javaReturnType === 'Double') return '(res instanceof Number n) ? n.doubleValue() : null';
    if (m.javaReturnType === 'String') return '(String) res';
    if (m.javaReturnType === 'Boolean') return '(Boolean) res';
    if (m.javaReturnType === 'Map<String, Object>') return '(Map<String, Object>) res';
    return `new ${m.javaReturnType}(res)`;
}

function genAsyncReturnExpr(m: MethodInfo): string {
    if (m.isArray && m.elementType) return `res -> Helpers.toTypedList(res, ${m.elementType}::new)`;
    if (m.javaReturnType === 'Object') return 'res -> res';
    if (m.javaReturnType === 'Long') return 'res -> (res instanceof Number n) ? n.longValue() : null';
    if (m.javaReturnType === 'Double') return 'res -> (res instanceof Number n) ? n.doubleValue() : null';
    if (m.javaReturnType === 'String') return 'res -> (String) res';
    if (m.javaReturnType === 'Boolean') return 'res -> (Boolean) res';
    if (m.javaReturnType === 'Map<String, Object>') return 'res -> (Map<String, Object>) res';
    return `${m.javaReturnType}::new`;
}

/**
 * Generate the delegation call to the untyped `Object...` core method.
 * Every argument is cast to (Object) so the typed default never re-binds to
 * itself and always reaches the `CompletableFuture<Object>` varargs signature.
 */
function genDelegateCall(methodName: string, allParams: ParamInfo[], castToObject = false): string {
    if (castToObject) {
        // Cast all args to (Object) and coalesce null params to empty map: Helpers.getArg
        // returns null for explicit null args instead of the default, which NPEs in extend().
        //
        // SS-05 exception: arguments at parameter positions the transpiler retyped to
        // `String` (JAVA_STRING_PARAM_POSITIONS) must NOT be cast — an `(Object)` cast
        // would no longer bind the instrumented String-parameter method (and keeping the
        // cast while the parameter moved would silently fall through to the BaseExchange
        // NotImplemented override).  The uncast String argument still binds the venue's
        // WS implementation: it is the most specific applicable overload for that
        // position.
        const retyped = JAVA_STRING_PARAM_POSITIONS[methodName] ?? [];
        const args = allParams.map((p, k) => {
            const cast = retyped.includes(k) ? '' : '(Object) ';
            if (p.name === 'params') return `${cast}(${p.name} != null ? ${p.name} : new java.util.HashMap<String, Object>())`;
            return `${cast}${p.name}`;
        }).join(', ');
        return `this.${methodName}(${args})`;
    }
    const args = allParams.map(p => p.name).join(', ');
    return `this.${methodName}(${args})`;
}

function genMethod(m: MethodInfo, coreType: string, castToObject = false): string {
    const methodName = camelCase(m.name);
    const typedCore = coreType === m.javaReturnType;
    const allParams = [...m.requiredParams, ...m.optionalParams];
    const fullParamDecl = allParams.map(p => `${p.javaType} ${p.name}`).join(', ');
    const delegateCall = genDelegateCall(methodName, allParams, castToObject);

    const lines: string[] = [];

    // Full sync method with all params.
    //
    // Uses Helpers.joinUnwrapped() instead of raw .join() so that ccxt errors
    // surface as their idiomatic typed exception (AuthenticationError,
    // NetworkError, InsufficientFunds, …) rather than wrapped in a
    // CompletionException. Users can write:
    //
    //     try { Order o = binance.createOrder(...); }
    //     catch (InsufficientFunds e) { ... }
    //     catch (AuthenticationError e) { ... }
    //     catch (NetworkError e) { ... }
    //
    // — same shape as JDK exceptions, no .getCause() unwrap needed.
    if (typedCore) {
        lines.push(`    default ${m.javaReturnType} ${methodName}(${fullParamDecl}) { return Helpers.joinUnwrapped(${delegateCall}); }`);
    } else {
        lines.push(`    @SuppressWarnings("unchecked")`);
        lines.push(`    default ${m.javaReturnType} ${methodName}(${fullParamDecl}) {`);
        lines.push(`        Object res = Helpers.joinUnwrapped(${delegateCall});`);
        lines.push(`        return ${genReturnExpr(m)};`);
        lines.push(`    }`);
    }

    // Truncation overloads: required + first k optionals, for k = 0 .. N-1.
    // Each truncation has a unique arity, so Java's overload resolution is
    // unambiguous at every call site (no `null`-trap from sibling overloads
    // at the same arity).
    //
    // For methods with zero required params we only emit these overloads
    // when the method is on the ZERO_REQUIRED_TYPED_WHITELIST. The default
    // rule skips them because the resulting zero-arg / single-null overloads
    // can collide with internal `this.method()` / `this.method(null)` calls
    // in transpiled WS code that expect the core `Object... varargs`
    // signature (e.g. `this.loadMarkets()` zero-arg, called from 3000+ sites).
    // Whitelisted methods have had their internal zero-arg call sites
    // audited and fixed in TS source — see the whitelist comment above.
    const emitTruncations = m.requiredParams.length > 0
        || ZERO_REQUIRED_TYPED_WHITELIST.has(m.name)
        || WATCH_ZERO_ARG_WHITELIST.has(m.name);
    if (emitTruncations) {
        const defaultExpr = (p: ParamInfo) =>
            p.defaultValue && p.defaultValue !== 'null'
                ? p.defaultValue
                : `(${p.javaType}) null`;
        for (let k = 0; k < m.optionalParams.length; k++) {
            const presentParams = [...m.requiredParams, ...m.optionalParams.slice(0, k)];
            const presentDecl = presentParams.map(p => `${p.javaType} ${p.name}`).join(', ');
            const presentArgs = presentParams.map(p => p.name).join(', ');
            const trailingDefaults = m.optionalParams.slice(k).map(defaultExpr).join(', ');
            const allArgs = presentArgs ? `${presentArgs}, ${trailingDefaults}` : trailingDefaults;
            lines.push(`    default ${m.javaReturnType} ${methodName}(${presentDecl}) { return ${methodName}(${allArgs}); }`);
        }
    }

    // Async method (full params), for fetch* (REST) and watch* (WS) alike. The core
    // future is already typed, so this is the typed-parameter spelling of the same call.
    if (typedCore) {
        lines.push(`    default CompletableFuture<${m.javaReturnType}> ${methodName}Async(${fullParamDecl}) { return ${delegateCall}; }`);
    } else {
        lines.push(`    @SuppressWarnings("unchecked")`);
        lines.push(`    default CompletableFuture<${m.javaReturnType}> ${methodName}Async(${fullParamDecl}) {`);
        lines.push(`        return ${delegateCall}.thenApply(${genAsyncReturnExpr(m)});`);
        lines.push(`    }`);
    }

    // Async truncation overloads — symmetric with the sync truncations above.
    // Without these, `binance.fetchOrdersAsync()` would fall through to the
    // base `Object...` method and return `CompletableFuture<Object>` instead
    // of `CompletableFuture<List<Order>>`. Gated on the same `emitTruncations`
    // flag so the whitelist applies symmetrically.
    if (emitTruncations) {
        const defaultExpr = (p: ParamInfo) =>
            p.defaultValue && p.defaultValue !== 'null'
                ? p.defaultValue
                : `(${p.javaType}) null`;
        for (let k = 0; k < m.optionalParams.length; k++) {
            const presentParams = [...m.requiredParams, ...m.optionalParams.slice(0, k)];
            const presentDecl = presentParams.map(p => `${p.javaType} ${p.name}`).join(', ');
            const presentArgs = presentParams.map(p => p.name).join(', ');
            const trailingDefaults = m.optionalParams.slice(k).map(defaultExpr).join(', ');
            const allArgs = presentArgs ? `${presentArgs}, ${trailingDefaults}` : trailingDefaults;
            lines.push(`    default CompletableFuture<${m.javaReturnType}> ${methodName}Async(${presentDecl}) { return ${methodName}Async(${allArgs}); }`);
        }
    }

    // String[] ergonomic overload at FULL ARITY for any List<String> param.
    //
    // Without this, callers that pass `new String[]{...}` hit Java's varargs
    // gotcha: String[] is-a Object[], so an `Object...` core method unpacks
    // each element into a separate slot — second symbol overwrites the params
    // slot, producing `ClassCastException: String cannot be cast to Map`.
    //
    // Only the full-arity variant is generated. Adding the same overload at
    // truncated arities would collide with the existing `List<String>`
    // truncations on `f(null,...)` calls — Java can't pick between
    // `List<String>` and `String[]` for a literal null. The full-arity slot
    // is uniquely sized so no resolution clash.
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
        lines.push(`    default ${m.javaReturnType} ${methodName}(${stringArrDecl}) { return ${methodName}(${delegateArgs}); }`);
        lines.push(`    default CompletableFuture<${m.javaReturnType}> ${methodName}Async(${stringArrDecl}) { return ${methodName}Async(${delegateArgs}); }`);
    }

    return lines.join('\n');
}

// --- Hoisted typed surface ---
// Every typed overload is a `default` method on ONE generated interface per tier that the
// tier base class implements. The default dispatches to the abstract core signature with
// explicit (Object) casts, so it always reaches the transpiled override. The abstract
// signature must match the transpiled override exactly: return family (javaTypedCore.ts)
// and the SS-05 `String` positions (JAVA_STRING_PARAM_POSITIONS); Java overrides are invariant.
function genAbstractDecl(m: MethodInfo, coreType: string): string {
    const name = camelCase(m.name);
    const retyped = JAVA_STRING_PARAM_POSITIONS[m.name] ?? [];
    for (const k of retyped) {
        if (k >= m.requiredParams.length) throw new Error(`${m.name}: String position ${k} falls into the Object... tail`);
    }
    const req = m.requiredParams.map((p, k) => `${retyped.includes(k) ? 'String' : 'Object'} ${p.name}`).join(', ');
    return `    CompletableFuture<${coreType}> ${name}(${req ? req + ', ' : ''}Object... optionalArgs);`;
}
// Erased parameter list (types only, `Object...` == `Object[]`) of a core declaration.
function eraseParams(paramList: string): string {
    return paramList.split(',').map(p => p.trim().replace(/\.\.\./, '[]').replace(/\s+\w+$/, '')).filter(Boolean).join(', ');
}
// Cores spell the return in simple names once written (build/javaUtilImports.ts); the qualified
// java.util / io.github.ccxt.types spelling is accepted too so the check does not depend on the collapse.
function eraseReturn(t: string): string {
    return t.replace(/\bjava\.util\./g, '').replace(/\bio\.github\.ccxt\.types\./g, '');
}
// A per-tier override whose signature differs from the abstract decl is a silent OVERLOAD (the
// base tier's body runs) or a compile error. Returns `file:line: m expected ... actual ...`.
let erasureChecked = 0;
function assertErasureMatches(methods: MethodInfo[], table: Map<string, MethodInfo>, files: string[]): string[] {
    const expected = new Map<string, string>();
    for (const m of methods) {
        const d = genAbstractDecl(m, coreReturnType(m, table)).match(/CompletableFuture<(.+)> (\w+)\((.*)\);$/)!;
        expected.set(d[2], `<${d[1]}> (${eraseParams(d[3])})`);
    }
    const declRe = /^\s*public (?:java\.util\.concurrent\.)?CompletableFuture<(.+)> (\w+)\((.*)\)\s*\{?\s*$/;
    const out: string[] = [];
    for (const file of files) {
        const lines = fs.readFileSync(file, 'utf-8').split('\n');
        for (let i = 0; i < lines.length; i++) {
            const d = lines[i].match(declRe);
            if (!d || !expected.has(d[2])) continue;
            erasureChecked++;
            const actual = `<${eraseReturn(d[1])}> (${eraseParams(d[3])})`;
            if (actual !== expected.get(d[2])) out.push(`${file}:${i + 1}: ${d[2]} expected ${expected.get(d[2])} actual ${actual}`);
        }
    }
    return out;
}
export function generateTypedSurfaceInterface(ifaceName: string, methods: MethodInfo[], tier: JavaTier): string {
    const table = typedReturnTable(tier);
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
    lines.push(` * method dispatches to the typed \`Object...\` core method (overridden per exchange).`);
    lines.push(` */`);
    lines.push(`public interface ${ifaceName} {`);
    lines.push(``);
    lines.push(`    // --- abstract core signatures (implemented by the transpiled tiers) ---`);
    lines.push(`    CompletableFuture<Object> loadMarkets(Object... optionalArgs);`);
    const seen = new Set<string>();
    for (const m of methods) {
        const d = genAbstractDecl(m, coreReturnType(m, table));
        if (!seen.has(d)) { seen.add(d); lines.push(d); }
    }
    lines.push(``);
    lines.push(`    // --- loadMarkets (special: first arg is boolean reload) ---`);
    lines.push(`    @SuppressWarnings("unchecked")`);
    lines.push(`    default Map<String, MarketInterface> loadMarkets(boolean reload) {`);
    lines.push(`        Object res = Helpers.joinUnwrapped(this.loadMarkets((Object) reload));`);
    lines.push(`        java.util.LinkedHashMap<String, MarketInterface> result = new java.util.LinkedHashMap<>();`);
    lines.push(`        for (Map.Entry<String, Object> entry : ((Map<String, Object>) res).entrySet()) {`);
    lines.push(`            result.put(entry.getKey(), new MarketInterface(entry.getValue()));`);
    lines.push(`        }`);
    lines.push(`        return result;`);
    lines.push(`    }`);
    lines.push(`    @SuppressWarnings("unchecked")`);
    lines.push(`    default CompletableFuture<Map<String, MarketInterface>> loadMarketsAsync(boolean reload) {`);
    lines.push(`        return this.loadMarkets((Object) reload).thenApply(res -> {`);
    lines.push(`            java.util.LinkedHashMap<String, MarketInterface> result = new java.util.LinkedHashMap<>();`);
    lines.push(`            for (Map.Entry<String, Object> entry : ((Map<String, Object>) res).entrySet()) {`);
    lines.push(`                result.put(entry.getKey(), new MarketInterface(entry.getValue()));`);
    lines.push(`            }`);
    lines.push(`            return result;`);
    lines.push(`        });`);
    lines.push(`    }`);
    lines.push(``);
    for (const m of methods) {
        lines.push(genMethod(m, coreReturnType(m, table), true));
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
    fs.writeFileSync(BASE_PKG + 'TypedSurface.java', applyJavaImports(generateTypedSurfaceInterface('TypedSurface', restMethods.concat(wsMethods), 'rest'), true), 'utf-8');
    const predictionExtra = Object.values(PREDICTION_EXCHANGE_METHODS).flat();
    const predictionMethods = predictionRestMethods.concat(predictionExtra);
    fs.writeFileSync(BASE_PKG + 'PredictionTypedSurface.java', applyJavaImports(generateTypedSurfaceInterface('PredictionTypedSurface', predictionMethods, 'prediction'), true), 'utf-8');
    console.log(`Generated TypedSurface (${restMethods.length} REST + ${wsMethods.length} WS methods) and PredictionTypedSurface (${predictionMethods.length} methods)`);

    const exchangesDir = BASE_PKG + 'exchanges/';
    const javaFiles = (dir: string) => fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => f.endsWith('.java')).map(f => dir + f) : [];
    const mainTierFiles = [ BASE_PKG + 'BaseExchange.java', BASE_PKG + 'Exchange.java' ].concat(javaFiles(exchangesDir), javaFiles(exchangesDir + 'pro/'));
    const predictionTierFiles = [ BASE_PKG + 'PredictionExchange.java' ].concat(javaFiles(exchangesDir + 'prediction/'));
    const mismatches = assertErasureMatches(restMethods.concat(wsMethods), typedReturnTable('rest'), mainTierFiles)
        .concat(assertErasureMatches(predictionMethods, typedReturnTable('prediction'), predictionTierFiles));
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

