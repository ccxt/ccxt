#!/usr/bin/env tsx
/**
 * Java Typed Wrapper Generator for CCXT
 *
 * Generates per-exchange typed subclasses that extend the transpiled Core classes.
 * Each typed class (e.g., Binance extends BinanceCore) adds typed method overloads
 * that delegate to the parent's untyped methods via super.method().
 *
 * This is safe because Java resolves overloads at compile time: BinanceCore.java
 * is compiled without knowledge of Binance.java's typed overloads, so internal
 * calls always bind to the untyped varargs methods.
 *
 * Usage: tsx build/generateJavaWrappers.ts
 */

import Transpiler from "ast-transpiler";
import * as fs from 'fs';
import { writeOverloadStrippedFile, removeOverloadStrippedFile } from './stripOverloads.js';

const TS_BASE_FILE = './ts/src/base/Exchange.ts';
const EXCHANGES_FOLDER = './java/lib/src/main/java/io/github/ccxt/exchanges/';
const WS_EXCHANGES_FOLDER = './java/lib/src/main/java/io/github/ccxt/exchanges/pro/';
const PREDICTION_EXCHANGES_FOLDER = './java/lib/src/main/java/io/github/ccxt/exchanges/prediction/';

// Known CCXT types that have Java equivalents in io.github.ccxt.types
const KNOWN_TYPES = new Set([
    'Ticker', 'Tickers', 'Trade', 'Order', 'OrderBook', 'OHLCV',
    'MarketInterface', 'Currencies', 'CurrencyInterface', 'Account', 'Balance', 'Balances',
    'Position', 'FundingRate', 'FundingRates', 'FundingRateHistory',
    'OpenInterest', 'OpenInterests', 'Liquidation',
    'LeverageTier', 'LeverageTiers', 'Leverage', 'Leverages',
    'MarginMode', 'MarginModes', 'MarginModification',
    'Transaction', 'DepositAddress', 'TransferEntry',
    'LedgerEntry', 'TradingFeeInterface', 'TradingFees',
    'Greeks', 'Option', 'OptionChain', 'Conversion',
    'LastPrice', 'LastPrices', 'LongShortRatio',
    'BorrowInterest', 'CrossBorrowRate', 'CrossBorrowRates',
    'IsolatedBorrowRate', 'IsolatedBorrowRates',
    'FundingHistory', 'DepositWithdrawFee',
    'OrderRequest', 'CancellationRequest', 'WithdrawalResponse',
    // native dedicated prediction-market types (io.github.ccxt.types.Prediction*)
    'PredictionTicker', 'PredictionTickers', 'PredictionOrder', 'PredictionTrade', 'PredictionPosition', 'PredictionOrderBook', 'PredictionTradingFee', 'PredictionOpenInterest', 'PredictionSettlement',
]);

// --- Type helpers ---
function isStringType(t: string) { return t === 'Str' || t === 'string' || t === 'StringLiteral' || t === 'OrderSide' || t === 'OrderType' || t === 'MarketType'; }
function isNumberType(t: string) { return t === 'Num' || t === 'number' || t === 'NumericLiteral'; }
function isIntegerType(t: string) { return t !== undefined && t.toLowerCase() === 'int'; }
function isBooleanType(t: string) { return t === 'boolean' || t === 'Bool'; }
function isObjectType(t: string) { return t === 'any' || t === 'unknown' || t === 'Dict' || t === 'Object' || t === 'Dictionary<any>' || (t?.startsWith('{') && t?.endsWith('}')); }

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
    if (methodName === 'watchOHLCVForSymbols') return null;

    const isPromise = tsReturnType.startsWith('Promise<') && tsReturnType.endsWith('>');
    let inner = isPromise ? tsReturnType.slice(8, -1) : tsReturnType;

    if (inner.endsWith('[]')) {
        const elem = inner.slice(0, -2);
        if (KNOWN_TYPES.has(elem)) return { javaType: `List<${elem}>`, isArray: true, elementType: elem };
        if (elem === 'string') return { javaType: 'List<String>', isArray: true, elementType: null };
        return null;
    }
    if (KNOWN_TYPES.has(inner)) return { javaType: inner, isArray: false, elementType: null };
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
const ALLOWED_PREFIXES = ['fetch', 'create', 'edit', 'cancel', 'close', 'setP', 'setM', 'setL', 'transfer', 'withdraw', 'watch', 'unWatch'];
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

interface ParamInfo {
    name: string;
    javaType: string;
    isOptional: boolean;
    defaultValue: string | null;
}

interface MethodInfo {
    name: string;
    javaReturnType: string;
    isArray: boolean;
    elementType: string | null;
    requiredParams: ParamInfo[];
    optionalParams: ParamInfo[];
    isWatch: boolean;
}

// User-facing methods with no required params for which we DO emit typed
// zero-arg + truncation overloads. The default rule (skip if no required
// params) protects against collisions with internal `this.method()` and
// `this.method(null)` calls in transpiled WS Core code that expect the
// parent's `Object... varargs` to match. For these methods we've audited
// the TS sources, confirmed no internal zero-arg call sites remain (the
// few that existed were updated to pass `params` / `{}`), and the typed
// overloads are safe to emit.
//
// Adding to this list requires:
//   1. `grep -r "await this\.<method>\s*(\s*)" ts/src/` returns no hits
//   2. None of the remaining call sites pass `null` literally without an
//      explicit cast — they should always pass a typed value
//
// loadMarkets / loadAccounts / loadTimeDifference / signIn etc. are NOT in
// this list because their internal call sites are too numerous to refactor
// (loadMarkets alone has 3000+ `this.loadMarkets()` zero-arg call sites).
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
    // WebSocket variants — same zero-required-param shape, same typed return.
    // Only includes methods that exist on at least one exchange's TS source AND
    // have a base `Object... varargs` definition on Exchange.java (so the
    // untyped async alias `fetchXWsAsync(Object...)` can delegate to it).
    // `fetchCurrenciesWs` is excluded because its TS body uses `new Promise()`
    // which doesn't transpile to Java — no base method, no delegate target.
    'fetchBalanceWs',
    'fetchOrdersWs',
    'fetchMyTradesWs',
    'fetchOpenOrdersWs',
    'fetchClosedOrdersWs',
    'fetchTickersWs',
    'fetchPositionsWs',
]);

// WS subscription methods (watch*) with all-optional parameters. They get
// typed truncation overloads only — NO async siblings (watch* methods ship
// sync-only by design) and NO base-class alias / regex rewrite (their
// internal call sites don't trigger overload-resolution collisions; verified
// via grep over ts/src/pro/*.ts). Keeps the user-facing surface symmetric
// with their REST `fetch*` counterparts which already get truncations.
const WATCH_ZERO_ARG_WHITELIST = new Set([
    'watchTickers',
    'watchBalance',
    'watchOrders',
    'watchMyTrades',
    'watchPositions',
]);

function parseMethodsFromTS(sourceFile: string = TS_BASE_FILE): MethodInfo[] {
    const transpiler = new Transpiler({ verbose: false, csharp: { parser: { ELEMENT_ACCESS_WRAPPER_OPEN: "getValue(", ELEMENT_ACCESS_WRAPPER_CLOSE: ")" } } });
    const strippedBaseFile = writeOverloadStrippedFile (sourceFile);
    const baseFile: any = transpiler.transpileJavaByPath(strippedBaseFile);
    removeOverloadStrippedFile (strippedBaseFile, sourceFile);
    const methodsTypes = baseFile.methodsTypes || [];

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

function genReturnExpr(m: MethodInfo): string {
    if (m.isArray && m.elementType) return `toTypedList(res, ${m.elementType}::new)`;
    if (m.javaReturnType === 'Object') return 'res';
    if (m.javaReturnType === 'Long') return '(res instanceof Number n) ? n.longValue() : null';
    if (m.javaReturnType === 'Double') return '(res instanceof Number n) ? n.doubleValue() : null';
    if (m.javaReturnType === 'String') return '(String) res';
    if (m.javaReturnType === 'Boolean') return '(Boolean) res';
    if (m.javaReturnType === 'Map<String, Object>') return '(Map<String, Object>) res';
    return `new ${m.javaReturnType}(res)`;
}

function genAsyncReturnExpr(m: MethodInfo): string {
    if (m.isArray && m.elementType) return `res -> toTypedList(res, ${m.elementType}::new)`;
    if (m.javaReturnType === 'Object') return 'res -> res';
    if (m.javaReturnType === 'Long') return 'res -> (res instanceof Number n) ? n.longValue() : null';
    if (m.javaReturnType === 'Double') return 'res -> (res instanceof Number n) ? n.doubleValue() : null';
    if (m.javaReturnType === 'String') return 'res -> (String) res';
    if (m.javaReturnType === 'Boolean') return 'res -> (Boolean) res';
    if (m.javaReturnType === 'Map<String, Object>') return 'res -> (Map<String, Object>) res';
    return `${m.javaReturnType}::new`;
}

/**
 * Generate the super.method() delegation call.
 *
 * For REST typed wrappers: simple super.method(args) works because the Core
 * parent only has untyped methods (typed overloads are on this class).
 *
 * For WS typed wrappers: must cast all args to (Object) because the WS Core
 * parent inherits REST typed overloads from the typed REST class. Without
 * casts, super.watchTicker(symbol, params) would match the REST typed overload
 * (returning List<Trade>) instead of the WS untyped implementation
 * (returning CompletableFuture<Object>).
 */
function genDelegateCall(methodName: string, allParams: ParamInfo[], castToObject = false): string {
    if (castToObject) {
        // For WS: cast all args to (Object) and coalesce null params to empty map.
        // This is needed because Helpers.getArg returns null for explicit null args
        // instead of the default value, causing NPE in extend() calls.
        const args = allParams.map(p => {
            if (p.name === 'params') return `(Object) (${p.name} != null ? ${p.name} : new java.util.HashMap<String, Object>())`;
            return `(Object) ${p.name}`;
        }).join(', ');
        return `super.${methodName}(${args})`;
    }
    const args = allParams.map(p => p.name).join(', ');
    return `super.${methodName}(${args})`;
}

function genMethod(m: MethodInfo, castToObject = false): string {
    const methodName = camelCase(m.name);
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
    lines.push(`    @SuppressWarnings("unchecked")`);
    lines.push(`    public ${m.javaReturnType} ${methodName}(${fullParamDecl}) {`);
    lines.push(`        Object res = Helpers.joinUnwrapped(${delegateCall});`);
    lines.push(`        return ${genReturnExpr(m)};`);
    lines.push(`    }`);

    // Truncation overloads: required + first k optionals, for k = 0 .. N-1.
    // Each truncation has a unique arity, so Java's overload resolution is
    // unambiguous at every call site (no `null`-trap from sibling overloads
    // at the same arity).
    //
    // For methods with zero required params we only emit these overloads
    // when the method is on the ZERO_REQUIRED_TYPED_WHITELIST. The default
    // rule skips them because the resulting zero-arg / single-null overloads
    // can collide with internal `this.method()` / `this.method(null)` calls
    // in transpiled WS Core code that expect the parent's `Object... varargs`
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
            lines.push(`    public ${m.javaReturnType} ${methodName}(${presentDecl}) { return ${methodName}(${allArgs}); }`);
        }
    }

    // Async method (full params). Emitted for both fetch* (REST) and watch*
    // (WS) — symmetric typed-async surface. For watch*, the sync wrapper
    // joins on the same `super.<method>(...)` Future; the async wrapper
    // hands the typed Future back to the caller so they can compose without
    // blocking the calling thread.
    lines.push(`    @SuppressWarnings("unchecked")`);
    lines.push(`    public CompletableFuture<${m.javaReturnType}> ${methodName}Async(${fullParamDecl}) {`);
    lines.push(`        return ${delegateCall}.thenApply(${genAsyncReturnExpr(m)});`);
    lines.push(`    }`);

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
            lines.push(`    public CompletableFuture<${m.javaReturnType}> ${methodName}Async(${presentDecl}) { return ${methodName}Async(${allArgs}); }`);
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
        lines.push(`    public ${m.javaReturnType} ${methodName}(${stringArrDecl}) { return ${methodName}(${delegateArgs}); }`);
        lines.push(`    public CompletableFuture<${m.javaReturnType}> ${methodName}Async(${stringArrDecl}) { return ${methodName}Async(${delegateArgs}); }`);
    }

    return lines.join('\n');
}

/**
 * Generate a typed exchange wrapper class that extends the Core class.
 *
 * e.g., Binance extends BinanceCore with typed overloads.
 */
function generateTypedExchangeClass(exchangeId: string, methods: MethodInfo[], javaPackage = 'io.github.ccxt.exchanges'): string {
    const className = capitalize(exchangeId);
    const coreClassName = className + 'Core';

    const lines: string[] = [];

    // Header
    lines.push(`package ${javaPackage};`);
    lines.push(``);
    lines.push(`import io.github.ccxt.Helpers;`);
    lines.push(`import io.github.ccxt.types.*;`);
    lines.push(``);
    lines.push(`import java.util.List;`);
    lines.push(`import java.util.Map;`);
    lines.push(`import java.util.concurrent.CompletableFuture;`);
    lines.push(`import java.util.stream.Collectors;`);
    lines.push(``);
    lines.push(`// PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:`);
    lines.push(`// https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code`);
    lines.push(``);
    lines.push(`/**`);
    lines.push(` * Typed wrapper for ${exchangeId}. Extends ${coreClassName} with typed method overloads.`);
    lines.push(` */`);
    lines.push(`public class ${className} extends ${coreClassName} {`);
    lines.push(``);

    // Constructors
    lines.push(`    public ${className}() {`);
    lines.push(`        super();`);
    lines.push(`    }`);
    lines.push(``);
    lines.push(`    public ${className}(Object options) {`);
    lines.push(`        super(options);`);
    lines.push(`    }`);
    lines.push(``);

    // toTypedList is inherited from Exchange (defined once, not duplicated per exchange)

    // loadMarkets special overloads
    lines.push(`    // --- loadMarkets (special: first arg is boolean reload) ---`);
    lines.push(`    @SuppressWarnings("unchecked")`);
    lines.push(`    public Map<String, MarketInterface> loadMarkets(boolean reload) {`);
    lines.push(`        Object res = super.loadMarkets(reload).join();`);
    lines.push(`        java.util.LinkedHashMap<String, MarketInterface> result = new java.util.LinkedHashMap<>();`);
    lines.push(`        for (Map.Entry<String, Object> entry : ((Map<String, Object>) res).entrySet()) {`);
    lines.push(`            result.put(entry.getKey(), new MarketInterface(entry.getValue()));`);
    lines.push(`        }`);
    lines.push(`        return result;`);
    lines.push(`    }`);
    lines.push(`    @SuppressWarnings("unchecked")`);
    lines.push(`    public CompletableFuture<Map<String, MarketInterface>> loadMarketsAsync(boolean reload) {`);
    lines.push(`        return super.loadMarkets(reload).thenApply(res -> {`);
    lines.push(`            java.util.LinkedHashMap<String, MarketInterface> result = new java.util.LinkedHashMap<>();`);
    lines.push(`            for (Map.Entry<String, Object> entry : ((Map<String, Object>) res).entrySet()) {`);
    lines.push(`                result.put(entry.getKey(), new MarketInterface(entry.getValue()));`);
    lines.push(`            }`);
    lines.push(`            return result;`);
    lines.push(`        });`);
    lines.push(`    }`);
    lines.push(``);

    // All typed methods
    for (const m of methods) {
        lines.push(genMethod(m));
        lines.push('');
    }

    lines.push(`}`);

    return lines.join('\n');
}

/**
 * Generate a typed WS wrapper that extends the WS Core class.
 * Only includes watch method overloads (REST typed methods are inherited
 * from the typed REST parent via the chain: pro.BinanceCore → Binance → BinanceCore).
 */
function generateTypedWsClass(exchangeId: string, watchMethods: MethodInfo[]): string {
    const className = capitalize(exchangeId);
    const coreClassName = className + 'Core';

    const lines: string[] = [];

    lines.push(`package io.github.ccxt.exchanges.pro;`);
    lines.push(``);
    lines.push(`import io.github.ccxt.Helpers;`);
    lines.push(`import io.github.ccxt.types.*;`);
    lines.push(``);
    lines.push(`import java.util.List;`);
    lines.push(`import java.util.Map;`);
    lines.push(`import java.util.concurrent.CompletableFuture;`);
    lines.push(``);
    lines.push(`// PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:`);
    lines.push(`// https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code`);
    lines.push(``);
    lines.push(`/**`);
    lines.push(` * Typed WS wrapper for ${exchangeId}. Extends ${coreClassName} with typed watch method overloads.`);
    lines.push(` * REST typed methods (fetchTicker, createOrder, etc.) are inherited from the typed REST class.`);
    lines.push(` */`);
    lines.push(`public class ${className} extends ${coreClassName} {`);
    lines.push(``);
    lines.push(`    public ${className}() {`);
    lines.push(`        super();`);
    lines.push(`    }`);
    lines.push(``);
    lines.push(`    public ${className}(Object options) {`);
    lines.push(`        super(options);`);
    lines.push(`    }`);
    lines.push(``);

    // Only watch method overloads — REST overloads are inherited from typed REST parent.
    // castToObject=true because the WS Core parent inherits REST typed overloads,
    // so we need (Object) casts to force the untyped varargs WS implementation.
    for (const m of watchMethods) {
        lines.push(genMethod(m, true));
        lines.push('');
    }

    lines.push(`}`);

    return lines.join('\n');
}

// --- Main ---
console.log('Parsing TypeScript Exchange.ts...');
const methods = parseMethodsFromTS();
const restCount = methods.filter(m => !m.isWatch).length;
const wsCount = methods.filter(m => m.isWatch).length;
console.log(`Found ${methods.length} methods (REST: ${restCount}, WS: ${wsCount})`);

for (const m of methods.slice(0, 5)) {
    const allParams = [...m.requiredParams, ...m.optionalParams];
    console.log(`  ${m.name}(${allParams.map(p => `${p.javaType} ${p.name}${p.isOptional ? '?' : ''}`).join(', ')}) -> ${m.javaReturnType}`);
}

// Generate REST typed wrappers
if (!fs.existsSync(EXCHANGES_FOLDER)) {
    console.error(`Exchanges folder not found: ${EXCHANGES_FOLDER}`);
    process.exit(1);
}

const coreFiles = fs.readdirSync(EXCHANGES_FOLDER).filter(f => f.endsWith('Core.java'));
let generated = 0;

// REST typed wrappers include only non-watch, non-*Ws methods. Both watch* and
// *Ws (WS-API variants) live on the pro typed wrapper, since their
// implementations are in the WS Core (pro/<Exchange>Core.java), not the REST
// Core. A typed REST `createOrderWs(...)` would `super.createOrderWs(...)` into
// REST BinanceCore — which has no such method — falling through to base
// Exchange.createOrderWs which throws NotSupported.
const isWsApi = (m: MethodInfo) => m.name.endsWith('Ws');
const restMethods = methods.filter(m => !m.isWatch && !isWsApi(m));

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
function toPredictionMethods(rest: MethodInfo[]): MethodInfo[] {
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
// prediction base and add the methods NOT already present. Every prediction Core extends
// PredictionExchange, so super.<method>() resolves on all — safe to share across the exchanges.
const PREDICTION_BASE_TS = './ts/src/base/PredictionExchange.ts';
const baseMethodNames = new Set(methods.map(m => m.name));
let predictionBaseOnlyMethods: MethodInfo[] = [];
if (fs.existsSync(PREDICTION_BASE_TS)) {
    predictionBaseOnlyMethods = parseMethodsFromTS(PREDICTION_BASE_TS).filter(m => !m.isWatch && !isWsApi(m) && !baseMethodNames.has(m.name));
    if (predictionBaseOnlyMethods.length) {
        console.log(`Found ${predictionBaseOnlyMethods.length} prediction-base-only methods: ${predictionBaseOnlyMethods.map(m => m.name).join(', ')}`);
    }
}
// Exchange-specific prediction methods that are NOT on any base (e.g. limitless.redeem returns a
// plain dict / Object and only exists on limitless). Only their own exchange's wrapper gets them,
// so super.<method>() resolves. Declared explicitly to avoid wrapping internal exchange helpers.
const PREDICTION_EXCHANGE_METHODS: Record<string, MethodInfo[]> = {
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
const predictionRestMethods = toPredictionMethods(restMethods).concat(predictionBaseOnlyMethods);
for (const coreFile of coreFiles) {
    const exchangeId = coreFile.replace('Core.java', '').toLowerCase();
    const className = capitalize(exchangeId);
    const outputPath = `${EXCHANGES_FOLDER}${className}.java`;

    const content = generateTypedExchangeClass(exchangeId, restMethods);
    fs.writeFileSync(outputPath, content, 'utf-8');
    generated++;
}

console.log(`Generated ${generated} REST typed wrappers`);

// Generate WS typed wrappers
if (fs.existsSync(WS_EXCHANGES_FOLDER)) {
    const wsCoreFiles = fs.readdirSync(WS_EXCHANGES_FOLDER).filter(f => f.endsWith('Core.java'));
    const watchMethods = methods.filter(m => m.isWatch || isWsApi(m));
    let wsGenerated = 0;

    for (const coreFile of wsCoreFiles) {
        const exchangeId = coreFile.replace('Core.java', '').toLowerCase();
        const className = capitalize(exchangeId);
        const outputPath = `${WS_EXCHANGES_FOLDER}${className}.java`;

        const content = generateTypedWsClass(exchangeId, watchMethods);
        fs.writeFileSync(outputPath, content, 'utf-8');
        wsGenerated++;
    }

    console.log(`Generated ${wsGenerated} WS typed wrappers`);
}

// Generate prediction REST typed wrappers (io.github.ccxt.exchanges.prediction).
// Prediction exchanges extend their own <Cap>Api (which extends Exchange), so
// they are NOT aliases — emit full typed wrappers, same as regular exchanges.
if (fs.existsSync(PREDICTION_EXCHANGES_FOLDER)) {
    const predCoreFiles = fs.readdirSync(PREDICTION_EXCHANGES_FOLDER).filter(f => f.endsWith('Core.java'));
    let predGenerated = 0;
    for (const coreFile of predCoreFiles) {
        const exchangeId = coreFile.replace('Core.java', '').toLowerCase();
        const className = capitalize(exchangeId);
        const outputPath = `${PREDICTION_EXCHANGES_FOLDER}${className}.java`;
        const exchangeMethods = predictionRestMethods.concat(PREDICTION_EXCHANGE_METHODS[exchangeId] || []);
        const content = generateTypedExchangeClass(exchangeId, exchangeMethods, 'io.github.ccxt.exchanges.prediction');
        fs.writeFileSync(outputPath, content, 'utf-8');
        predGenerated++;
    }
    console.log(`Generated ${predGenerated} prediction REST typed wrappers`);
}

console.log(`\nGenerated ${generated} typed exchange wrappers in ${EXCHANGES_FOLDER}`);

// Safety net: verify an Object... varargs alias exists for every whitelisted
// method. Missing aliases produced the silent CI break that motivated this
// whitelist; loud-failing here prevents the same trap. The aliases are split
// across two tiers after the base/Exchange split: base-infra methods (fetchBalance,
// fetchTime, ...) keep their aliases on BaseExchange.java, while the trading methods
// that moved to the Exchange tier (fetchOrders, fetchTickers, fetchPositions, ...)
// carry their aliases on Exchange.java. Check both.
const EXCHANGE_BASE_FILE = './java/lib/src/main/java/io/github/ccxt/BaseExchange.java';
const EXCHANGE_TIER_FILE = './java/lib/src/main/java/io/github/ccxt/Exchange.java';
{
    let src = '';
    if (fs.existsSync(EXCHANGE_BASE_FILE)) src += fs.readFileSync(EXCHANGE_BASE_FILE, 'utf-8');
    if (fs.existsSync(EXCHANGE_TIER_FILE)) src += '\n' + fs.readFileSync(EXCHANGE_TIER_FILE, 'utf-8');
    const missing: string[] = [];
    for (const m of ZERO_REQUIRED_TYPED_WHITELIST) {
        const aliasRe = new RegExp(`\\b${m}Async\\s*\\(\\s*Object\\.\\.\\.\\s*\\w+\\s*\\)`);
        if (!aliasRe.test(src)) missing.push(`${m}Async(Object... args)`);
    }
    if (missing.length > 0) {
        console.error(`\nERROR: BaseExchange.java / Exchange.java are missing untyped async aliases for ${missing.length} whitelisted method(s):`);
        for (const m of missing) console.error(`  - public CompletableFuture<Object> ${m} { return ${m.replace('Async', '').replace(/\(.*/, '')}(args); }`);
        console.error(`\nAdd them above the "METHODS BELOW THIS LINE ARE TRANSPILED" marker in the tier that declares the method.`);
        process.exit(1);
    }
}

console.log('Done!');
