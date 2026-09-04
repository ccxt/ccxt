#!/usr/bin/env tsx
/**
 * Rust Typed Wrapper Generator for CCXT
 *
 * Generates per-exchange typed wrapper structs that own the transpiled
 * `<Exchange>Core` instance and expose the unified CCXT API surface
 * with native Rust return types from `ccxt::types::*` instead of the
 * dynamic `Value` enum.
 *
 * Mirrors `build/generateJavaWrappers.ts`: parses the TS `Exchange.ts`
 * method table, filters to user-facing methods (fetch/create/edit/
 * cancel/transfer/withdraw/watch/unWatch), maps TS types → Rust types,
 * and emits `rust/ccxt/src/exchanges/<id>_typed.rs` per exchange.
 *
 * Output shape (per exchange):
 *
 *   pub struct Binance { pub core: BinanceCore }
 *   impl Deref<Target = BinanceCore> for Binance { ... }
 *   impl Binance {
 *       pub async fn fetch_ticker_typed(&mut self, symbol: &str) -> Ticker { ... }
 *       pub async fn fetch_balance_typed(&mut self) -> Balances { ... }
 *       …
 *   }
 *
 * The `<id>_typed.rs` files are wired into `exchanges/mod.rs` by the
 * Rust transpiler's `writeModFile` (see build/rustTranspiler.ts).
 *
 * Usage: tsx build/generateRustWrappers.ts [exchangeId]
 */

import Transpiler from "ast-transpiler";
import * as fs from 'fs';
import * as path from 'path';

const TS_BASE_FILE = './ts/src/base/Exchange.ts';
// The base REST/prediction Cores are READ from here (parents, method surface).
const EXCHANGES_FOLDER = './rust/ccxt-base/src/exchanges/';
// The typed wrappers are WRITTEN into the sibling `ccxt-typed` crate — split out
// of `ccxt` so the base crate's single `rustc` invocation stays under the CI
// runner's memory ceiling. `crate::exchanges::*` inside the wrappers resolves
// via `ccxt-typed/src/exchanges/mod.rs`'s `pub use ccxt::exchanges::*;`.
const TYPED_FOLDER = './rust/ccxt/src/exchanges/';
const TYPED_AGGREGATOR = './rust/ccxt/src/typed.rs';

// ──────────────────────────────────────────────────────────────────────────────
// Type mapping
// ──────────────────────────────────────────────────────────────────────────────

// Unified CCXT struct types declared in `rust/ccxt/src/types.rs`. The
// generator only emits a typed wrapper if the inner return type is in
// this set; everything else falls back to `Value` (and we skip the
// method rather than emit an untyped pass-through).
const KNOWN_STRUCT_TYPES = new Map<string, string>([
    ['Ticker', 'Ticker'],
    ['Trade', 'Trade'],
    ['Order', 'Order'],
    ['OrderBook', 'OrderBook'],
    ['MarketInterface', 'Market'],
    ['Market', 'Market'],
    ['CurrencyInterface', 'Currency'],
    ['Currency', 'Currency'],
    ['Balance', 'Balances'],
    ['Balances', 'Balances'],
    ['Position', 'Position'],
    ['FundingRate', 'FundingRate'],
    ['OpenInterest', 'OpenInterest'],
    ['Liquidation', 'Liquidation'],
    ['LeverageTier', 'LeverageTier'],
    ['Leverage', 'Leverage'],
    ['MarginMode', 'MarginMode'],
    ['Transaction', 'Transaction'],
    ['DepositAddress', 'DepositAddress'],
    ['TransferEntry', 'Transfer'],
    ['LedgerEntry', 'LedgerEntry'],
    ['TradingFeeInterface', 'TradingFee'],
    ['Greeks', 'Greeks'],
    ['Fee', 'Fee'],
    ['CrossBorrowRate', 'BorrowRate'],
    ['IsolatedBorrowRate', 'BorrowRate'],
    ['BorrowRate', 'BorrowRate'],
    ['BorrowInterest', 'BorrowInterest'],
    ['Status', 'Status'],
]);

// Plural CCXT collection types — these are `pub type X = HashMap<String, T>;`
// aliases in `types.rs`. The value is the singular struct used to decode
// each map entry via `dict_from_value`.
const KNOWN_MAP_TYPES = new Map<string, string>([
    ['Tickers', 'Ticker'],
    ['Currencies', 'Currency'],
    ['Markets', 'Market'],
    ['OrderBooks', 'OrderBook'],
    ['FundingRates', 'FundingRate'],
    ['OpenInterests', 'OpenInterest'],
    ['Leverages', 'Leverage'],
    ['MarginModes', 'MarginMode'],
    ['TradingFees', 'TradingFee'],
    ['AllGreeks', 'Greeks'],
    ['DepositAddresses', 'DepositAddress'],
]);

// Combined lookup for "is this a name we can produce a decoder for?".
function knownReturnType(name: string): { rustType: string, decode: (v: string) => string } | null {
    const struct = KNOWN_STRUCT_TYPES.get(name);
    if (struct) {
        return { rustType: struct, decode: v => `${struct}::from_value(${v})` };
    }
    const mapElem = KNOWN_MAP_TYPES.get(name);
    if (mapElem) {
        return { rustType: name, decode: v => `dict_from_value(&${v}, ${mapElem}::from_value)` };
    }
    return null;
}

// Rust reserved keywords that can appear as parameter names in TS sources.
// We rename them with a trailing underscore so the generated code is valid.
const RUST_RESERVED = new Set([
    'type', 'match', 'move', 'ref', 'box', 'pub', 'mod', 'use', 'self',
    'crate', 'super', 'where', 'impl', 'trait', 'struct', 'enum',
    'fn', 'let', 'const', 'static', 'mut', 'as', 'in', 'loop',
    'while', 'for', 'if', 'else', 'return', 'break', 'continue',
    'true', 'false', 'unsafe', 'extern', 'async', 'await', 'dyn',
]);
function safeRustName(name: string): string {
    return RUST_RESERVED.has(name) ? `${name}_` : name;
}

// TS scalar predicates ─ same shape as the Java generator's helpers, kept
// inline so this file is self-contained (no shared module yet).
function isStringType(t: string) {
    return t === 'Str' || t === 'string' || t === 'StringLiteral'
        || t === 'OrderSide' || t === 'OrderType' || t === 'MarketType';
}
function isNumberType(t: string) { return t === 'Num' || t === 'number' || t === 'NumericLiteral'; }
function isIntegerType(t: string) { return t !== undefined && t.toLowerCase() === 'int'; }
function isBooleanType(t: string) { return t === 'boolean' || t === 'Bool'; }
function isObjectType(t: string) {
    return t === 'any' || t === 'unknown' || t === 'Dict' || t === 'Object'
        || t === 'Dictionary<any>' || (t?.startsWith('{') && t?.endsWith('}'));
}

interface ParamInfo {
    name: string;       // snake_case Rust param name
    rustType: string;   // Rust type annotation (e.g., `&str`, `Option<i64>`)
    toValueExpr: string;// expression that converts the param to a `Value`
    isOptional: boolean;
}

interface MethodInfo {
    tsName: string;     // camelCase TS name (e.g., fetchOrderBook)
    rustName: string;   // snake_case Rust name with `_typed` suffix
    rustReturn: string; // Rust return type (e.g., `Ticker`, `Vec<Trade>`, `Tickers`)
    decodeExpr: (vExpr: string) => string; // produces a Rust expression
    params: ParamInfo[];
    coreCall: string;   // method to call on `self.core.X(...)` (snake_case)
}

// ──────────────────────────────────────────────────────────────────────────────
// Method filter
// ──────────────────────────────────────────────────────────────────────────────

const ALLOWED_PREFIXES = [
    'fetch', 'create', 'edit', 'cancel', 'close',
    'setP', 'setM', 'setL', 'transfer', 'withdraw',
    // WS (`watch*`) methods — emitted only into the `ccxt_pro` typed layer;
    // the REST / prediction passes filter them out (they'd never be reachable
    // on a REST/prediction Core anyway).
    'watch',
];
// Internal helpers we don't want to emit even though they match a prefix.
const BLACKLIST = new Set([
    'fetch', 'fetchCurrenciesWs', 'fetchMarketsWs',
    'loadOrderBook', 'loadMarketsHelper', 'createNetworksByIdObject',
    'setMarketsFromExchange', 'setProperty', 'setProxyAgents',
    'createContractOrder', 'createSpotOrder', 'createSwapOrder', 'createVault',
    'fetchRestOrderBookSafe', 'fetchPortfolioDetails',
]);

function shouldCreateWrapper(name: string): boolean {
    // `unWatch*` (typed unsubscribe) and `*Ws` REST-over-WS helpers stay out.
    if (name.startsWith('unWatch')) return false;
    if (name.endsWith('Ws')) return false;
    if (BLACKLIST.has(name)) return false;
    if (name.toLowerCase().includes('uta')) return false;
    if (name.includes('Snapshot') || name.includes('Subscription') || name.includes('Cache')) return false;
    return ALLOWED_PREFIXES.some(p => name.startsWith(p));
}

// Is this a WS `watch*` method (routed to the `ccxt_pro` typed layer)?
function isWatchMethod(name: string): boolean {
    return name.startsWith('watch');
}

// ──────────────────────────────────────────────────────────────────────────────
// camelCase ↔ snake_case helpers (mirror of build/rustTranspiler.ts)
// ──────────────────────────────────────────────────────────────────────────────

function toSnakeCase(name: string): string {
    // PascalCase / camelCase → snake_case. Preserves runs of capitals
    // (e.g., fetchOHLCV → fetch_ohlcv).
    return name
        .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
        .toLowerCase();
}

function capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

// ──────────────────────────────────────────────────────────────────────────────
// TS return type → Rust return type + decoder
// ──────────────────────────────────────────────────────────────────────────────

function mapReturnType(name: string, tsReturn: string): { rustReturn: string, decode: (v: string) => string } | null {
    if (name === 'fetchTime') {
        return { rustReturn: 'Option<i64>', decode: v => `match ${v} { Value::Int(n) => Some(n), _ => None }` };
    }

    const isPromise = tsReturn.startsWith('Promise<') && tsReturn.endsWith('>');
    let inner = isPromise ? tsReturn.slice(8, -1) : tsReturn;

    // Array of known struct: `Trade[]` → `Vec<Trade>`
    if (inner.endsWith('[]')) {
        const elem = inner.slice(0, -2);
        const rustElem = KNOWN_STRUCT_TYPES.get(elem);
        if (rustElem) {
            return {
                rustReturn: `Vec<${rustElem}>`,
                decode: v => `vec_from_value(&${v}, ${rustElem}::from_value)`,
            };
        }
        if (elem === 'OHLCV') {
            // `OHLCV` is `pub type OHLCV = [f64; 6]` — a fixed-size array
            // alias, not a struct, so it needs its own decoder rather than
            // `<T>::from_value`. Without this, fetchOHLCV (a core unified
            // method) has no typed wrapper on any exchange and callers are
            // pushed back to the Value-returning `call_raw`.
            return {
                rustReturn: 'Vec<OHLCV>',
                decode: v => `match ${v} { Value::Arr(arr) => arr.iter().map(|c| { let mut out = [0.0f64; 6]; if let Value::Arr(fields) = c { for (i, slot) in out.iter_mut().enumerate() { if let Some(f) = fields.get(i).and_then(|x| x.as_f64()) { *slot = f; } } } out }).collect(), _ => Vec::new() }`,
            };
        }
        if (elem === 'string') {
            return {
                rustReturn: 'Vec<String>',
                decode: v => `match ${v} { Value::Arr(arr) => arr.iter().filter_map(|x| match x { Value::Str(s) => Some(s.clone()), _ => None }).collect(), _ => Vec::new() }`,
            };
        }
        return null;
    }

    // Single known struct or known map alias
    const known = knownReturnType(inner);
    if (known) {
        return { rustReturn: known.rustType, decode: known.decode };
    }

    // Scalar fallbacks
    if (isStringType(inner)) {
        return { rustReturn: 'Option<String>', decode: v => `match ${v} { Value::Str(s) => Some(s), _ => None }` };
    }
    if (isBooleanType(inner)) {
        return { rustReturn: 'Option<bool>', decode: v => `match ${v} { Value::Bool(b) => Some(b), _ => None }` };
    }
    if (isIntegerType(inner)) {
        return { rustReturn: 'Option<i64>', decode: v => `match ${v} { Value::Int(n) => Some(n), _ => None }` };
    }
    if (isNumberType(inner)) {
        return { rustReturn: 'Option<f64>', decode: v => `match ${v} { Value::Float(f) => Some(f), Value::Int(n) => Some(n as f64), _ => None }` };
    }
    return null;
}

// ──────────────────────────────────────────────────────────────────────────────
// TS param type → Rust param descriptor
// ──────────────────────────────────────────────────────────────────────────────

function mapParamType(p: any): ParamInfo | null {
    const rawName = p.name as string;
    if (rawName === 'params') {
        // Always tacked on at the end so callers can pass extra
        // exchange-specific knobs without leaving the typed surface. Typed as
        // `impl Into<Params>` rather than a raw `Value`: a caller builds it
        // from primitives (`Params::new().with_str("timeInForce", "GTC")`) or
        // passes `Params::none()` / `()` for no extras. `From<Value>` keeps
        // pre-existing `Value`-passing call sites compiling.
        return {
            name: 'params',
            rustType: 'impl Into<Params>',
            toValueExpr: 'params.into().into_value()',
            isOptional: true,
        };
    }
    const snake = toSnakeCase(rawName.replace(/[^A-Za-z0-9_]/g, ''));
    const name = safeRustName(snake);
    const tsType = p.type as string | undefined;
    const isOptional = p.optional || p.initializer !== undefined;

    if (isStringType(tsType ?? '')) {
        if (isOptional) {
            return {
                name, isOptional: true,
                rustType: `Option<&str>`,
                toValueExpr: `${name}.map(|s| Value::Str(s.to_string())).unwrap_or(Value::Null)`,
            };
        }
        return {
            name, isOptional: false,
            rustType: `&str`,
            toValueExpr: `Value::Str(${name}.to_string())`,
        };
    }
    if (isIntegerType(tsType ?? '')) {
        if (isOptional) {
            return {
                name, isOptional: true,
                rustType: `Option<i64>`,
                toValueExpr: `${name}.map(Value::Int).unwrap_or(Value::Null)`,
            };
        }
        return {
            name, isOptional: false,
            rustType: `i64`,
            toValueExpr: `Value::Int(${name})`,
        };
    }
    if (isNumberType(tsType ?? '')) {
        if (isOptional) {
            return {
                name, isOptional: true,
                rustType: `Option<f64>`,
                toValueExpr: `${name}.map(Value::Float).unwrap_or(Value::Null)`,
            };
        }
        return {
            name, isOptional: false,
            rustType: `f64`,
            toValueExpr: `Value::Float(${name})`,
        };
    }
    if (isBooleanType(tsType ?? '')) {
        if (isOptional) {
            return {
                name, isOptional: true,
                rustType: `Option<bool>`,
                toValueExpr: `${name}.map(Value::Bool).unwrap_or(Value::Null)`,
            };
        }
        return {
            name, isOptional: false,
            rustType: `bool`,
            toValueExpr: `Value::Bool(${name})`,
        };
    }
    if (tsType === 'Strings' || tsType === 'string[]') {
        if (isOptional) {
            return {
                name, isOptional: true,
                rustType: `Option<Vec<String>>`,
                toValueExpr: `match ${name} { Some(list) => Value::Arr(std::sync::Arc::new(list.into_iter().map(Value::Str).collect())), None => Value::Null }`,
            };
        }
        return {
            name, isOptional: false,
            rustType: `Vec<String>`,
            toValueExpr: `Value::Arr(std::sync::Arc::new(${name}.into_iter().map(Value::Str).collect()))`,
        };
    }
    // Unknown / object — pass through as `Value`. Honour the TS optionality
    // flag (otherwise required object-typed args like `fetchPartialBalance`'s
    // `parts` get bucketed into the `&[Value]` tail and the resulting call
    // arity drops below the core method's required arity).
    return {
        name, isOptional,
        rustType: `Value`,
        toValueExpr: name,
    };
}

// ──────────────────────────────────────────────────────────────────────────────
// Parse Exchange.ts → MethodInfo[]
// ──────────────────────────────────────────────────────────────────────────────

// Strip TypeScript method *overload signatures* — bodyless class-member
// declarations like `safeDictN (a, b): Dictionary<any>;` that precede the
// real implementation. The ast-transpiler's `printFunctionBody` assumes every
// method has a body and crashes (`Cannot read properties of undefined
// (reading 'statements')`) on these. Mirrors `stripTsOverloadSignatures` in
// build/rustTranspiler.ts.
function stripTsOverloadSignatures(content: string): string {
    // The `(?:<[^>(){};]*>\s*)?` clause matches an optional generic parameter
    // list between the method name and `(` — required for generic overloads
    // like `requireValue <T>(...)` and `handleOptionAndParams <T>(...)`, whose
    // `<T>` would otherwise defeat the match and let the bodyless signature
    // reach ast-transpiler (which crashes on the missing body).
    const sigRe = /^ {4}(?:async )?[A-Za-z_][A-Za-z0-9_]*\s*(?:<[^>(){};]*>\s*)?\([^;{]*\)\s*:\s*[^;{]+;\s*$/;
    return content
        .split('\n')
        .filter((line) => {
            if (!sigRe.test(line)) {
                return true;
            }
            if (line.indexOf('=>') !== -1 || line.indexOf(' = ') !== -1) {
                return true;
            }
            return false;
        })
        .join('\n');
}

function parseMethodsFromTS(): MethodInfo[] {
    const transpiler = new Transpiler({
        verbose: false,
        csharp: { parser: { ELEMENT_ACCESS_WRAPPER_OPEN: "getValue(", ELEMENT_ACCESS_WRAPPER_CLOSE: ")" } },
    });
    // Parse a temp copy with overload signatures stripped (kept in the same
    // directory so the relative imports in Exchange.ts still resolve).
    const rawTs = fs.readFileSync(TS_BASE_FILE, 'utf-8');
    const cleanedTs = stripTsOverloadSignatures(rawTs);
    let baseFile: any;
    if (cleanedTs !== rawTs) {
        const tmpFile = path.join(path.dirname(TS_BASE_FILE), '.__ExchangeNoOverloadsRustWrap.ts');
        fs.writeFileSync(tmpFile, cleanedTs);
        try {
            baseFile = transpiler.transpileJavaByPath(tmpFile);
        } finally {
            fs.unlinkSync(tmpFile);
        }
    } else {
        baseFile = transpiler.transpileJavaByPath(TS_BASE_FILE);
    }
    const methodsTypes = baseFile.methodsTypes || [];

    const methods: MethodInfo[] = [];
    for (const m of methodsTypes) {
        if (!m.async) continue;
        if (!shouldCreateWrapper(m.name)) continue;

        const ret = mapReturnType(m.name, m.returnType);
        if (!ret) continue;

        const params: ParamInfo[] = [];
        let sawParams = false;
        for (const p of m.parameters) {
            const info = mapParamType(p);
            if (!info) continue;
            if (info.name === 'params') sawParams = true;
            params.push(info);
        }
        if (!sawParams) {
            params.push({
                name: 'params',
                rustType: 'Value',
                toValueExpr: 'params',
                isOptional: true,
            });
        }

        methods.push({
            tsName: m.name,
            // Typed method uses the same snake-case name as the core's
            // untyped method. Rust's method-resolution order picks the
            // inherent impl on the wrapper struct over the `Deref`-target
            // — so `binance.fetch_currencies(Value::Null).await` returns
            // `Result<Currencies>`, while users who want the raw
            // `Value`-shaped call go through `binance.core.fetch_currencies(...)`.
            rustName: toSnakeCase(m.name),
            rustReturn: ret.rustReturn,
            decodeExpr: ret.decode,
            params,
            coreCall: toSnakeCase(m.name),
        });
    }
    return methods;
}

// ──────────────────────────────────────────────────────────────────────────────
// Emit
// ──────────────────────────────────────────────────────────────────────────────

function genMethod(m: MethodInfo, dynamicRoute = false): string {
    // Split the params into "required positional" and "optional (varargs)".
    // The transpiled core methods take a fixed required slice + a `&[Value]`
    // tail for optionals; we mirror that boundary here.
    const required = m.params.filter(p => !p.isOptional);
    const optional = m.params.filter(p =>  p.isOptional);

    const paramDecls = m.params.map(p => `${p.name}: ${p.rustType}`).join(', ');
    const requiredArgs = required.map(p => p.toValueExpr).join(', ');
    const optionalArgs = optional.map(p => p.toValueExpr).join(', ');

    // The core method signature for a unified method like `fetchTicker`:
    //   pub async fn fetch_ticker(&mut self, mut symbol: Value, optional_args: &[Value]) -> Value
    // For methods with no required positional (e.g., `fetchBalance`):
    //   pub async fn fetch_balance(&mut self, optional_args: &[Value]) -> Value
    let coreCallExpr: string;
    if (dynamicRoute) {
        // An alias exchange (binanceusdm → binance, bequant → hitbtc, …)
        // inherits this method from its PARENT Core. Under static dispatch a
        // Core no longer Derefs to its parent (only to `Exchange`), so a direct
        // `self.core_mut().<m>()` can't see the parent's inherent method. Route
        // through `call_dynamic`, whose generated fallthrough forwards to the
        // parent Core — the same virtual path the runtime uses. Args flatten to
        // one `Vec` (required first, then optionals), matching how the
        // generated match arms unpack them.
        const allArgs = [requiredArgs, optionalArgs].filter(s => s.length > 0).join(', ');
        coreCallExpr = `self.core_mut().call_dynamic("${m.coreCall}", vec![${allArgs}])`;
    } else if (required.length === 0) {
        coreCallExpr = `self.core_mut().${m.coreCall}(&[${optionalArgs}])`;
    } else {
        coreCallExpr = `self.core_mut().${m.coreCall}(${requiredArgs}, &[${optionalArgs}])`;
    }

    const decode = m.decodeExpr('v');

    // Wrap the await in `runtime::call_typed` so the transpiled core's
    // panic-based error convention (`panic!("[Kind] message")`) surfaces
    // as a typed `Result<T, ExchangeError>` instead of unwinding the
    // caller. The decoded payload is produced only on the `Ok` arm.
    return [
        `    /// Typed wrapper around \`${m.tsName}\`.`,
        `    pub async fn ${m.rustName}(&mut self, ${paramDecls}) -> crate::Result<${m.rustReturn}> {`,
        `        let v = crate::runtime::call_typed(${coreCallExpr}).await?;`,
        `        Ok(${decode})`,
        `    }`,
    ].join('\n');
}

// The `TypedExchange` + `TypedExchangeExt` traits.
//
// `TypedExchange` is the object-safe core: its only required method is `call_raw`
// (dynamic dispatch to the Core), plus `load_markets`. `#[async_trait]` boxes
// those two so `Box<dyn TypedExchange>` works (raw `ExchangeBase` can't — it's
// `+ Sized` with `-> impl Future` methods).
//
// The ~120 typed methods live on `TypedExchangeExt`, blanket-implemented for
// every `TypedExchange` (incl. `dyn TypedExchange`). They use RPITIT
// (`-> impl Future`, NOT async_trait) so their bodies are generic and only
// codegen'd at the caller's use sites — keeping the lib's compile footprint flat
// (boxing all ~120 as async_trait defaults peaks the build memory past CI's
// runner and OOM-kills it).
function genTypedExchangeTrait(methods: MethodInfo[]): string {
    const extMethod = (m: MethodInfo) => {
        // Flatten args required-then-optional, matching how `call_dynamic`
        // unpacks them (same shape genMethod uses for its dynamic route).
        const paramDecls = m.params.map(p => `${p.name}: ${p.rustType}`).join(', ');
        const sep = paramDecls.length ? ', ' : '';
        const required = m.params.filter(p => !p.isOptional).map(p => p.toValueExpr);
        const optional = m.params.filter(p =>  p.isOptional).map(p => p.toValueExpr);
        const args = [...required, ...optional].join(', ');
        return [
            `    /// Typed \`${m.tsName}\`.`,
            `    fn ${m.rustName}<'a>(&'a mut self${sep}${paramDecls}) -> impl ::std::future::Future<Output = crate::Result<${m.rustReturn}>> + Send + 'a {`,
            // Build the args eagerly so no borrowed `&str` param is captured by
            // the `+ 'a` future (its lifetime is tied to `&mut self`, not params).
            `        let __args: Vec<Value> = vec![${args}];`,
            `        async move {`,
            `            let v = self.call_raw("${m.coreCall}", __args).await?;`,
            `            Ok(${m.decodeExpr('v')})`,
            `        }`,
            `    }`,
        ].join('\n');
    };
    return [
        '// PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:',
        '// https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code',
        '//',
        '// Aggregator: re-exports every per-exchange typed wrapper at the crate',
        '// root so users can write `use ccxt::Binance;` instead of the full',
        '// `use ccxt::exchanges::binance_typed::Binance;` path, and declares the',
        '// `TypedExchange` / `TypedExchangeExt` traits — the unified interface every',
        '// wrapper implements (each wrapper\'s `impl` lives in `<id>_typed.rs`).',
        '//',
        '// Generated by `build/generateRustWrappers.ts`.',
        '',
        '#![allow(unused_imports, unused_variables, clippy::all)]',
        '',
        'use crate::Value;',
        'use crate::Params;',
        'use crate::types::*;',
        '',
        '/// Object-safe core of the unified interface. Every typed wrapper',
        '/// implements it (just `call_raw`); the ergonomic typed methods live on',
        '/// [`TypedExchangeExt`]. `Box<dyn TypedExchange>` works.',
        '#[async_trait::async_trait]',
        'pub trait TypedExchange: Send {',
        '    /// Dynamic dispatch — the ONE method each wrapper implements. Routes',
        '    /// `method(args)` to the underlying Core, surfacing its panic-based',
        '    /// errors as `Result`.',
        '    async fn call_raw(&mut self, method: &str, args: Vec<Value>) -> crate::Result<Value>;',
        '',
        '    /// One loaded market, typed. `Err(BadSymbol)` when not listed.',
        '    fn market(&self, symbol: &str) -> crate::Result<Market>;',
        '',
        '    /// Every loaded market, typed. Empty until `load_markets` has run.',
        '    fn markets(&self) -> Vec<Market>;',
        '',
        '    /// Loads and caches markets (untyped setup for symbol resolution).',
        '    async fn load_markets(&mut self, reload: bool) -> Value {',
        '        self.call_raw("load_markets", vec![Value::Bool(reload)]).await.unwrap_or(Value::Null)',
        '    }',
        '}',
        '',
        '/// The typed unified methods (`fetch_ticker` → `Result<Ticker>`, …),',
        '/// blanket-implemented for every `TypedExchange`. Bring it into scope to',
        '/// call them: generic (`fn f<E: TypedExchange>(ex: &mut E)`), on a concrete',
        '/// wrapper, or on `&mut dyn TypedExchange`. A method the exchange does not',
        '/// implement resolves to a `NotSupported` error at runtime.',
        'pub trait TypedExchangeExt: TypedExchange {',
        methods.map(extMethod).join('\n'),
        '}',
        'impl<T: TypedExchange + ?Sized> TypedExchangeExt for T {}',
        '',
    ].join('\n');
}

// A wrapper's `impl TypedExchange` — just the one required `call_raw`, routing to
// the Core's `call_dynamic` (the same virtual path the runtime/WS tests use) and
// converting its panic-based errors to `Result` via `call_typed`. All the typed
// methods come from the trait defaults, so this stays a single method regardless
// of how many unified methods exist.
function genTypedExchangeImpl(className: string): string {
    return [
        '#[async_trait::async_trait]',
        `impl crate::typed::TypedExchange for ${className} {`,
        '    async fn call_raw(&mut self, method: &str, args: Vec<Value>) -> crate::Result<Value> {',
        '        crate::runtime::call_typed(self.core_mut().call_dynamic(method, args)).await',
        '    }',
        '',
        `    fn market(&self, symbol: &str) -> crate::Result<Market> { ${className}::market(self, symbol) }`,
        '',
        `    fn markets(&self) -> Vec<Market> { ${className}::markets(self) }`,
        '}',
        '',
    ].join('\n');
}

function generateTypedWrapper(exchangeId: string, methods: MethodInfo[], directlyCallable?: Set<string>, modulePath: string = 'exchanges'): string {
    const className = capitalize(exchangeId);
    const coreClassName = className + 'Core';

    const header = [
        '// PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:',
        '// https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code',
        '//',
        `// Typed wrapper for ${exchangeId}.`,
        '//',
        `// Owns a \`Box<${coreClassName}>\` and exposes the unified CCXT API`,
        '// surface with native Rust return types from `ccxt::types::*` instead',
        '// of the dynamic `Value` enum. Generated by',
        '// `build/generateRustWrappers.ts`.',
        '//',
        '// Dispatch is fully static (review #1: pointer removal) — the Core is',
        '// no longer self-referential, so it needs no pinning and no bind step;',
        '// it is simply heap-boxed and the wrapper drives it by `&mut`.',
        '',
        '#![allow(unused, non_snake_case, clippy::all)]',
        '',
        'use crate::Value;',
        'use crate::Params;',
        'use crate::Config;',
        `use crate::${modulePath}::${exchangeId}::${coreClassName};`,
        'use crate::types::*;',
        // Base methods are trait methods now (review #1: static dispatch); bring
        // the traits into scope so `self.core_mut().fetch_balance(...)` etc.
        // resolve to the base defaults on the Core.
        'use crate::exchange_generated::ExchangeBase;',
        'use crate::exchange::ExchangeRuntime;',
        '',
        `pub struct ${className} {`,
        '    // Private so safe callers cannot swap the Core out from under the',
        '    // typed surface; mutation goes through the typed methods below.',
        `    core: Box<${coreClassName}>,`,
        '}',
        '',
        `impl ${className} {`,
        '    pub fn new(config: Option<Value>) -> Self {',
        `        Self { core: Box::new(${coreClassName}::new(config)) }`,
        '    }',
        '',
        '    /// Construct from a typed [`Config`] builder — the `Value`-free path.',
        '    /// `Config::none()` for defaults.',
        '    pub fn with_config(config: Config) -> Self {',
        `        Self { core: Box::new(${coreClassName}::new(config.into_option())) }`,
        '    }',
        '',
        `    pub fn from_core(core: ${coreClassName}) -> Self {`,
        '        Self { core: Box::new(core) }',
        '    }',
        '',
        '    /// `&mut Core` for method calls. Kept as a helper so the typed',
        '    /// methods have one uniform accessor.',
        '    #[inline]',
        `    fn core_mut(&mut self) -> &mut ${coreClassName} {`,
        '        &mut self.core',
        '    }',
        '',
        '    /// Loads and caches markets (untyped). Essential setup for symbol',
        '    /// resolution; exposed explicitly since it is not part of the',
        '    /// `fetch*`/`create*` typed surface.',
        '    pub async fn load_markets(&mut self, reload: bool) -> Value {',
        '        self.core_mut().load_markets(&[Value::Bool(reload), Value::Null]).await',
        '    }',
        '',
        '    /// Fallible, typed `loadMarkets`: loads, caches, and returns the',
        '    /// markets. Prefer this over [`Self::load_markets`] — loading can fail',
        '    /// (a venue outage, or a venue whose currency load is authenticated,',
        '    /// like binance, rejecting bad credentials) and the untyped version',
        '    /// signals that by panicking rather than returning an error.',
        '    pub async fn try_load_markets(&mut self, reload: bool) -> crate::Result<Vec<Market>> {',
        '        crate::runtime::call_typed(',
        '            self.core_mut().load_markets(&[Value::Bool(reload), Value::Null]),',
        '        ).await?;',
        '        Ok(self.markets())',
        '    }',
        '',
        '    /// One loaded market, typed. Call after `load_markets`.',
        '    /// `Err(BadSymbol)` when the symbol is not listed on this venue.',
        '    pub fn market(&self, symbol: &str) -> crate::Result<Market> {',
        '        let sym = Value::Str(symbol.to_string());',
        '        crate::runtime::catch_typed(|| Market::from_value(ExchangeBase::market(&*self.core, sym)))',
        '    }',
        '',
        '    /// Every loaded market, typed. Empty until `load_markets` has run.',
        '    pub fn markets(&self) -> Vec<Market> {',
        '        match &self.core.markets {',
        '            Value::Dict(d) => d.values().cloned().map(Market::from_value).collect(),',
        '            _ => Vec::new(),',
        '        }',
        '    }',
        '',
        '    /// Every loaded currency, typed. Empty until `load_markets` has run.',
        '    pub fn currencies(&self) -> Vec<Currency> {',
        '        match &self.core.currencies {',
        '            Value::Dict(d) => d.values().cloned().map(Currency::from_value).collect(),',
        '            _ => Vec::new(),',
        '        }',
        '    }',
        '',
        '    // ── Runtime settings ──────────────────────────────────────────',
        '    // The Core fields are dynamic `Value`s and the wrapper Derefs',
        '    // read-only, so `ex.verbose = true` cannot work. These take Rust',
        '    // primitives and return `&mut Self` so they chain:',
        '    //',
        '    //     ex.set_verbose(true).set_timeout_ms(10_000);',
        '',
        '    /// Log every HTTP request and response to stderr.',
        '    pub fn set_verbose(&mut self, on: bool) -> &mut Self {',
        '        self.core.verbose = Value::Bool(on);',
        '        self',
        '    }',
        '',
        '    /// Whether request/response logging is on.',
        '    pub fn is_verbose(&self) -> bool {',
        '        matches!(self.core.verbose, Value::Bool(true))',
        '    }',
        '',
        '    /// Client-side rate limiting. On by default; turning it off makes',
        '    /// you responsible for staying inside the rate limits of the venue.',
        '    pub fn set_enable_rate_limit(&mut self, on: bool) -> &mut Self {',
        '        self.core.enableRateLimit = Value::Bool(on);',
        '        self',
        '    }',
        '',
        '    /// Milliseconds per rate-limit token. Read on every throttled call,',
        '    /// so changing it takes effect immediately.',
        '    pub fn set_rate_limit_ms(&mut self, ms: i64) -> &mut Self {',
        '        self.core.rateLimit = Value::Int(ms);',
        '        self',
        '    }',
        '',
        '    /// HTTP request timeout in milliseconds.',
        '    pub fn set_timeout_ms(&mut self, ms: i64) -> &mut Self {',
        '        self.core.timeout = Value::Int(ms);',
        '        self',
        '    }',
        '',
        '    /// Credentials, settable after construction.',
        '    pub fn set_api_key(&mut self, v: &str) -> &mut Self {',
        '        self.core.apiKey = Value::Str(v.to_string());',
        '        self',
        '    }',
        '    pub fn set_secret(&mut self, v: &str) -> &mut Self {',
        '        self.core.secret = Value::Str(v.to_string());',
        '        self',
        '    }',
        '    pub fn set_password(&mut self, v: &str) -> &mut Self {',
        '        self.core.password = Value::Str(v.to_string());',
        '        self',
        '    }',
        '    pub fn set_uid(&mut self, v: &str) -> &mut Self {',
        '        self.core.uid = Value::Str(v.to_string());',
        '        self',
        '    }',
        '    pub fn set_wallet_address(&mut self, v: &str) -> &mut Self {',
        '        self.core.walletAddress = Value::Str(v.to_string());',
        '        self',
        '    }',
        '    pub fn set_private_key(&mut self, v: &str) -> &mut Self {',
        '        self.core.privateKey = Value::Str(v.to_string());',
        '        self',
        '    }',
        '    pub fn set_token(&mut self, v: &str) -> &mut Self {',
        '        self.core.token = Value::Str(v.to_string());',
        '        self',
        '    }',
        '',
        '    /// Proxies. Set at most ONE of these — the request path rejects',
        '    /// conflicting proxy settings.',
        '    pub fn set_http_proxy(&mut self, url: &str) -> &mut Self {',
        '        self.core.httpProxy = Value::Str(url.to_string());',
        '        self',
        '    }',
        '    pub fn set_https_proxy(&mut self, url: &str) -> &mut Self {',
        '        self.core.httpsProxy = Value::Str(url.to_string());',
        '        self',
        '    }',
        '    pub fn set_socks_proxy(&mut self, url: &str) -> &mut Self {',
        '        self.core.socksProxy = Value::Str(url.to_string());',
        '        self',
        '    }',
        '    /// WebSocket proxy. The `watch*` transport dials it with an HTTP',
        '    /// CONNECT tunnel — separate from the REST proxies above, which',
        '    /// only apply to `fetch*`.',
        '    pub fn set_ws_proxy(&mut self, url: &str) -> &mut Self {',
        '        self.core.wsProxy = Value::Str(url.to_string());',
        '        self',
        '    }',
        '',
        '    /// Merge entries into `options`, the way `Config::options` does at',
        '    /// construction. Nested objects combine rather than replace.',
        '    pub fn set_options(&mut self, options: Params) -> &mut Self {',
        '        let merged = Config::new().options(Params::from(self.core.options.clone()))',
        '            .options(options)',
        '            .into_value();',
        '        self.core.options = crate::runtime::get_value(',
        '            &merged,',
        '            &Value::Str("options".to_string()),',
        '        );',
        '        self',
        '    }',
        '',
        '    /// Swap to the testnet/sandbox endpoints of this venue (or back).',
        '    /// `Err(NotSupported)` when the venue declares no `urls.test`.',
        '    pub fn set_sandbox_mode(&mut self, on: bool) -> crate::Result<()> {',
        '        // Presence of the `test` key is not enough: a transpiled',
        '        // describe() can emit `test: null` for a venue with no testnet,',
        '        // and the base implementation would then happily swap `urls.api`',
        '        // to null and report success. Require a real value.',
        '        let has_test = !matches!(',
        '            crate::runtime::get_value(&self.core.urls, &Value::Str("test".to_string())),',
        '            Value::Null',
        '        );',
        '        if on && !has_test {',
        '            return Err(crate::exchange_errors::not_supported(format!(',
        '                "{} does not have a sandbox URL",',
        '                self.id()',
        '            )));',
        '        }',
        '        let core = &mut *self.core;',
        '        crate::runtime::catch_typed(move || {',
        '            <_ as crate::exchange_generated::ExchangeBase>::set_sandbox_mode(',
        '                core,',
        '                Value::Bool(on),',
        '            )',
        '        })',
        '    }',
        '',
        '    /// Whether sandbox/testnet endpoints are currently in use.',
        '    pub fn is_sandbox_mode_enabled(&self) -> bool {',
        '        matches!(self.core.isSandboxModeEnabled, Value::Bool(true))',
        '    }',
        '',
        '    /// The ccxt id of this exchange, e.g. binance.',
        '    pub fn id(&self) -> String {',
        '        match &self.core.id {',
        '            Value::Str(s) => s.clone(),',
        '            _ => String::new(),',
        '        }',
        '    }',
        '',
        '    /// Unified symbols of every loaded market, sorted.',
        '    pub fn symbols(&self) -> Vec<String> {',
        '        let mut out: Vec<String> = self.markets().into_iter().map(|m| m.symbol).collect();',
        '        out.sort();',
        '        out',
        '    }',
        '}',
        '',
        '// Read-only deref only. `DerefMut` is intentionally NOT implemented so a',
        '// safe caller cannot `mem::replace`/swap the Core; mutation goes through',
        '// the typed methods, which project via `core_mut()` above.',
        `impl std::ops::Deref for ${className} {`,
        `    type Target = ${coreClassName};`,
        '    fn deref(&self) -> &Self::Target { &*self.core }',
        '}',
        '',
        `impl ${className} {`,
    ];

    // A method not directly callable on this Core (own inherent + base trait
    // methods) is inherited from a parent Core and must route via call_dynamic.
    const body = methods
        .map(m => genMethod(m, directlyCallable ? !directlyCallable.has(m.coreCall) : false))
        .join('\n\n');
    // Close the inherent impl, then emit the `TypedExchange` impl so this wrapper
    // is usable behind `fn f<E: TypedExchange>` / `Box<dyn TypedExchange>`.
    const footer = ['}', '', genTypedExchangeImpl(className)];

    return [...header, body, ...footer].join('\n');
}

// ──────────────────────────────────────────────────────────────────────────────
// Per-file method discovery
// ──────────────────────────────────────────────────────────────────────────────

// Scrape the set of `pub async fn <snake_name>` methods defined in a Rust
// source file. The typed wrapper can only delegate to methods that exist
// — base methods inherited via `Deref<Target = Exchange>` count too, so we
// also seed the lookup with `exchange_generated.rs` once at startup.
function discoverDefinedMethods(filePath: string): Set<string> {
    const out = new Set<string>();
    if (!fs.existsSync(filePath)) return out;
    const src = fs.readFileSync(filePath, 'utf-8');
    // `pub async fn fetch_balance(...) -> Value { ... }` (per-exchange override)
    // `async fn fetch_balance(...) -> Value { ... }` (base ExchangeBase trait
    // method — no `pub` since review #1's static-dispatch conversion). Match an
    // optional `pub` so inherited base methods are still discovered; otherwise
    // the wrapper only sees per-exchange overrides and drops ~80% of methods.
    const re = /\b(?:pub\s+)?(?:async\s+)?fn\s+([a-z_][a-z0-9_]*)\s*\(/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(src)) !== null) out.add(m[1]);
    return out;
}

// Build the `<id> → parent_id` map by scanning every `<id>.rs` for its
// embedded parent Core — `pub parent: crate::exchanges::<parent>::<Parent>Core`.
// This is the alias/subclass shape for exchanges (myokx → okx, binanceusdm →
// binance, …). NB: after the static-dispatch conversion (review #1) every Core
// `Deref`s directly to `crate::exchange::Exchange`, so parentage is NO LONGER
// visible in the `type Target = …` line; it lives in the `parent` field.
function parseParents(folder: string, modulePath: string = 'exchanges'): Map<string, string> {
    const parents = new Map<string, string>();
    const re = new RegExp(`\\bpub\\s+parent:\\s*crate::${modulePath}::([a-z0-9_]+)::[A-Za-z0-9_]+Core\\b`);
    for (const f of fs.readdirSync(folder)) {
        if (!f.endsWith('.rs') || f.endsWith('_api.rs') || f.endsWith('_typed.rs') || f === 'mod.rs') continue;
        const id = f.replace(/\.rs$/, '');
        const src = fs.readFileSync(path.join(folder, f), 'utf-8');
        const m = src.match(re);
        if (m) parents.set(id, m[1]);
    }
    return parents;
}

// Union of `<id>` own methods plus every ancestor's. Memoised so we
// don't re-scan a parent for each child.
function discoverReachableMethods(
    id: string,
    folder: string,
    parents: Map<string, string>,
    cache: Map<string, Set<string>>,
): Set<string> {
    const cached = cache.get(id);
    if (cached) return cached;
    const own = discoverDefinedMethods(path.join(folder, `${id}.rs`));
    const parent = parents.get(id);
    const result = parent
        ? new Set<string>([...own, ...discoverReachableMethods(parent, folder, parents, cache)])
        : own;
    cache.set(id, result);
    return result;
}

const BASE_RS = './rust/ccxt-base/src/exchange_generated.rs';
const STUBS_RS = './rust/ccxt-base/src/exchange_stubs.rs';

// ──────────────────────────────────────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────────────────────────────────────

function main() {
    console.log('Parsing TypeScript Exchange.ts...');
    const methods = parseMethodsFromTS();
    console.log(`Found ${methods.length} typed-eligible unified methods`);
    for (const m of methods.slice(0, 8)) {
        const paramStr = m.params.map(p => `${p.name}: ${p.rustType}`).join(', ');
        console.log(`  ${m.rustName}(${paramStr}) -> ${m.rustReturn}`);
    }

    // Methods defined on the base `Exchange` — these are reachable via
    // `Deref<Target = Exchange>` from any `<Exchange>Core` and don't need
    // per-exchange definition. The hand-written stubs file is included
    // too for the same reason.
    const baseMethods = new Set<string>([
        ...discoverDefinedMethods(BASE_RS),
        ...discoverDefinedMethods(STUBS_RS),
    ]);
    console.log(`Discovered ${baseMethods.size} base methods (Exchange + stubs)`);

    // Optional single-id filter, applied within each domain that has it.
    const onlyId = process.argv[2];

    // Three typed layers, one per domain. `ccxt` holds the REST typed API,
    // `ccxt-prediction` the prediction one, `ccxt-pro` the WS (`watch*`) one.
    // Each wrapper crate re-exports `ccxt-base`, so `crate::<coreModule>::…`
    // resolves to the engine's Cores (except `ccxt-pro`, whose venue Cores are
    // local to `crate::pro`).
    for (const cfg of DOMAINS) {
        generateDomain(cfg, methods, baseMethods, onlyId);
    }
    writeTestCoreRegistry();
}

interface DomainCfg {
    name: string;
    coresFolder: string;   // where the `<id>.rs` Cores are read from
    outFolder: string;     // where `<id>_typed.rs` wrappers are written
    aggregator: string;    // the crate's `typed.rs` (trait + re-exports)
    coreModule: string;    // wrapper's `use crate::<coreModule>::<id>::<Core>`
    wrapperModule: string; // aggregator's `crate::<wrapperModule>::<id>_typed`
    modReExport: string | null; // wrapper mod.rs `pub use <modReExport>;` (Core re-export) or null
    watch: boolean;        // true → emit only `watch*` methods; false → only non-watch
}

const DOMAINS: DomainCfg[] = [
    // REST — the `ccxt` typed crate. Wrappers sit next to the re-exported base
    // Cores in `ccxt/src/exchanges/`.
    {
        name: 'rest',
        coresFolder: EXCHANGES_FOLDER,        // ./rust/ccxt-base/src/exchanges/
        outFolder: TYPED_FOLDER,              // ./rust/ccxt/src/exchanges/
        aggregator: TYPED_AGGREGATOR,         // ./rust/ccxt/src/typed.rs
        coreModule: 'exchanges',
        wrapperModule: 'exchanges',
        modReExport: 'ccxt_base::exchanges::*',
        watch: false,
    },
    // Prediction markets — the `ccxt-prediction` typed crate. Same shape as
    // REST but over the engine's `prediction/` Cores.
    {
        name: 'prediction',
        coresFolder: './rust/ccxt-base/src/prediction/',
        outFolder: './rust/ccxt-prediction/src/prediction/',
        aggregator: './rust/ccxt-prediction/src/typed.rs',
        coreModule: 'prediction',
        wrapperModule: 'prediction',
        modReExport: 'ccxt_base::prediction::*',
        watch: false,
    },
    // WS `watch*` — the `ccxt-pro` typed layer. The venue Cores already live in
    // `ccxt-pro/src/pro/`, so the wrappers reference `crate::pro::<id>::<Core>`
    // and live in a separate `pro_typed/` module (the `pro/mod.rs` is authored
    // by the transpiler and must stay venue-only).
    {
        name: 'pro',
        coresFolder: './rust/ccxt-pro/src/pro/',
        outFolder: './rust/ccxt-pro/src/pro_typed/',
        aggregator: './rust/ccxt-pro/src/typed.rs',
        coreModule: 'pro',
        wrapperModule: 'pro_typed',
        modReExport: null,
        watch: true,
    },
];

function generateDomain(cfg: DomainCfg, methods: MethodInfo[], baseMethods: Set<string>, onlyId?: string) {
    if (!fs.existsSync(cfg.coresFolder)) {
        console.log(`[${cfg.name}] cores folder ${cfg.coresFolder} not found — skipping`);
        return;
    }
    fs.mkdirSync(cfg.outFolder, { recursive: true });

    // REST/prediction take the non-`watch*` surface. The pro layer takes BOTH:
    // in every other ccxt binding the pro class EXTENDS the REST one, so
    // `pro.binance` answers `fetchTicker` as well as `watchTicker`. A pro Core
    // embeds the REST Core as its `parent`, so the REST methods are genuinely
    // reachable — `reachable` below confirms it per venue, and anything not
    // defined on the pro Core itself routes through `call_dynamic`, whose
    // generated fallthrough forwards to the parent.
    const domainMethods = cfg.watch
        ? methods
        : methods.filter(m => !isWatchMethod(m.tsName));

    const all = fs.readdirSync(cfg.coresFolder)
        .filter(f => f.endsWith('.rs')
                  && !f.endsWith('_api.rs')
                  && !f.endsWith('_typed.rs')
                  && f !== 'mod.rs');
    const targets = onlyId ? all.filter(f => f === `${onlyId}.rs`) : all;

    const parents = parseParents(cfg.coresFolder, cfg.coreModule);
    const methodCache = new Map<string, Set<string>>();

    const generatedIds: string[] = [];
    let totalEmittedMethods = 0;
    for (const f of targets) {
        const id = f.replace(/\.rs$/, '');
        const ownAndInherited = discoverReachableMethods(id, cfg.coresFolder, parents, methodCache);
        const reachable = new Set<string>([...baseMethods, ...ownAndInherited]);
        const exchangeMethods = domainMethods.filter(m => reachable.has(m.coreCall));
        // A pro venue with no typed `watch*` surface gets no wrapper at all.
        // Count only the watch methods here: now that the pro layer also carries
        // the REST surface, every venue would otherwise clear a plain
        // `length === 0` gate on inherited methods alone.
        const watchCount = exchangeMethods.filter(m => isWatchMethod(m.tsName)).length;
        if (cfg.watch && watchCount === 0) continue;
        totalEmittedMethods += exchangeMethods.length;
        const directlyCallable = new Set<string>([
            ...baseMethods,
            ...discoverDefinedMethods(path.join(cfg.coresFolder, `${id}.rs`)),
        ]);
        const out = path.join(cfg.outFolder, `${id}_typed.rs`);
        const content = generateTypedWrapper(id, exchangeMethods, directlyCallable, cfg.coreModule);
        fs.writeFileSync(out, content, 'utf-8');
        generatedIds.push(id);
    }
    const generated = generatedIds.length;
    console.log(`[${cfg.name}] generated ${generated} typed wrappers (avg ${(totalEmittedMethods / Math.max(1, generated)).toFixed(1)} methods) in ${cfg.outFolder}`);

    if (onlyId) return; // single-id runs skip the aggregator/mod.rs rewrite

    const allTyped = fs.readdirSync(cfg.outFolder)
        .filter(f => f.endsWith('_typed.rs'))
        .map(f => f.replace(/_typed\.rs$/, ''))
        .sort();
    // Aggregator: the `TypedExchange` trait for this domain plus a re-export of
    // every wrapper struct, so `use <crate>::Binance;` works — and a `from_id`
    // factory that builds a boxed wrapper by exchange id for dynamic selection.
    const aggLines: string[] = [genTypedExchangeTrait(domainMethods)];
    for (const id of allTyped) {
        aggLines.push(`pub use crate::${cfg.wrapperModule}::${id}_typed::${capitalize(id)};`);
    }
    aggLines.push('');
    aggLines.push('/// Construct a boxed typed wrapper by exchange id — the typed analog of');
    aggLines.push('/// picking an exchange at runtime. `config` is the same optional settings');
    aggLines.push('/// map `<Exchange>::new` takes (apiKey, secret, proxies, …). Returns `None`');
    aggLines.push('/// for an unknown id.');
    aggLines.push('pub fn from_id(id: &str, config: Option<crate::Value>) -> Option<Box<dyn TypedExchange>> {');
    aggLines.push('    match id {');
    for (const id of allTyped) {
        aggLines.push(`        ${JSON.stringify(id)} => Some(Box::new(${capitalize(id)}::new(config))),`);
    }
    aggLines.push('        _ => None,');
    aggLines.push('    }');
    aggLines.push('}');
    aggLines.push('');
    aggLines.push('/// Same as [`from_id`] but takes the typed [`Config`] builder, so a caller');
    aggLines.push('/// never handles a `Value`. `Config::none()` for defaults.');
    aggLines.push('pub fn from_id_with_config(id: &str, config: crate::Config) -> Option<Box<dyn TypedExchange>> {');
    aggLines.push('    from_id(id, config.into_option())');
    aggLines.push('}');
    aggLines.push('');
    fs.writeFileSync(path.resolve(cfg.aggregator), aggLines.join('\n'), 'utf-8');
    console.log(`[${cfg.name}] wrote aggregator ${cfg.aggregator} with ${allTyped.length} re-exports`);

    writeTypedModFile(cfg.outFolder, allTyped, cfg.modReExport);
}

// Author a wrapper folder's `mod.rs`: optionally re-export the engine's Cores
// (so the wrappers' `crate::<coreModule>::<id>::<Core>` paths resolve) and
// declare one `pub mod <id>_typed;` per wrapper. For the pro layer the Cores
// are local to `crate::pro`, so no re-export is emitted (modReExport = null).
function writeTypedModFile(outFolder: string, ids: string[], modReExport: string | null) {
    const modPath = path.join(outFolder, 'mod.rs');
    const lines: string[] = [
        '// PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:',
        '// https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code',
        '//',
        '// Typed unified-method wrappers. Each `<id>_typed` module owns a venue',
        "// Core and exposes the typed surface. `crate::<module>::<id>::<Core>`",
        '// inside the wrappers resolves via the re-export below (or, for the pro',
        '// layer, via this crate\'s own `pro` module).',
    ];
    if (modReExport) {
        lines.push(`pub use ${modReExport};`);
    }
    lines.push('');
    lines.push(...[...ids].sort().map(id => `pub mod ${id}_typed;`));
    lines.push('');
    fs.writeFileSync(modPath, lines.join('\n'), 'utf-8');
    console.log(`Wrote ${modPath} with ${ids.length} 'pub mod <id>_typed;' decl(s)`);
}

// ──────────────────────────────────────────────────────────────────────────────
// Test-harness core registry
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Emits `rust/tests/src/generated_cores.rs`: the import aliases plus the
 * `for_each_core!` / `for_each_ws_core!` macros that `registry.rs` and
 * `live_dispatch.rs` dispatch over.
 *
 * These lists name every exchange, so hand-maintaining them meant they drifted
 * from whatever cores actually existed — and narrowing a layer (e.g. to a
 * single pro venue) required editing hand-written files. Generating them from
 * the Cores on disk keeps the harness in step with the tree automatically.
 */
function writeTestCoreRegistry(): void {
    const outPath = './rust/tests/src/generated_cores.rs';
    const idsIn = (folder: string): string[] => {
        if (!fs.existsSync(folder)) return [];
        return fs.readdirSync(folder)
            .filter(f => f.endsWith('.rs') && !f.endsWith('_api.rs') && !f.endsWith('_typed.rs') && f !== 'mod.rs')
            .map(f => f.replace(/\.rs$/, ''))
            .sort();
    };
    const rest = idsIn('./rust/ccxt-base/src/exchanges');
    const pro = idsIn('./rust/ccxt-pro/src/pro');
    const pred = idsIn('./rust/ccxt-base/src/prediction');
    // A prediction venue that shares an id with a REST one (binance,
    // hyperliquid) keeps the REST Core under the bare name and gets a `Pred`
    // alias, matching what the dispatcher expects.
    const predOnly = pred.filter(id => !rest.includes(id));
    const predDup = pred.filter(id => rest.includes(id));

    const L: string[] = [
        '// PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:',
        '// https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code',
        '//',
        '// Every exchange Core the live/offline test harness can dispatch to.',
        '// `registry.rs` and `live_dispatch.rs` walk these macros, so the lists',
        '// follow whatever Cores exist rather than being maintained by hand.',
        '//',
        '// Generated by `build/generateRustWrappers.ts`.',
        '',
        '#![allow(unused_imports)]',
        '',
    ];
    L.push('pub(crate) use ccxt::exchanges::{');
    for (const id of rest) L.push(`    ${id}::${capitalize(id)}Core,`);
    L.push('};');
    L.push('');
    if (predOnly.length) {
        L.push('pub(crate) use ccxt::prediction::{');
        for (const id of predOnly) L.push(`    ${id}::${capitalize(id)}Core,`);
        L.push('};');
        L.push('');
    }
    for (const id of predDup) {
        L.push(`pub(crate) use ccxt::prediction::${id}::${capitalize(id)}Core as Pred${capitalize(id)}Core;`);
    }
    if (predDup.length) L.push('');
    if (pro.length) {
        L.push('pub(crate) use ccxt_pro::pro::{');
        for (const id of pro) L.push(`    ${id}::${capitalize(id)}Core as Ws${capitalize(id)}Core,`);
        L.push('};');
        L.push('');
    }
    const allRest = [...rest, ...predOnly].sort();
    L.push('macro_rules! for_each_core {');
    L.push('    ($cb:ident) => {');
    for (const id of allRest) L.push(`        $cb!(${id}, ${capitalize(id)}Core);`);
    L.push('    };');
    L.push('}');
    L.push('pub(crate) use for_each_core;');
    L.push('');
    L.push('macro_rules! for_each_ws_core {');
    L.push('    ($cb:ident) => {');
    for (const id of pro) L.push(`        $cb!(${id}, Ws${capitalize(id)}Core);`);
    L.push('    };');
    L.push('}');
    L.push('pub(crate) use for_each_ws_core;');
    L.push('');
    fs.writeFileSync(outPath, L.join('\n'), 'utf-8');
    console.log(`Wrote ${outPath}: ${allRest.length} core(s), ${pro.length} ws core(s)`);
}

main();
