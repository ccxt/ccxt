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
const EXCHANGES_FOLDER = './rust/ccxt/src/exchanges/';

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
    ['BorrowInterest', 'BorrowRate'],
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
];
// Internal helpers we don't want to emit even though they match a prefix.
const BLACKLIST = new Set([
    'fetch', 'fetchCurrenciesWs', 'fetchMarketsWs',
    'loadOrderBook', 'loadMarketsHelper', 'createNetworksByIdObject',
    'setMarketsFromExchange', 'setProperty', 'setProxyAgents',
    'createContractOrder', 'createSpotOrder', 'createSwapOrder', 'createVault',
    'fetchRestOrderBookSafe', 'fetchPortfolioDetails',
    // WS variants intentionally skipped — WS layer not in scope for the
    // initial typed-REST wrappers.
]);

function shouldCreateWrapper(name: string): boolean {
    if (name.startsWith('watch') || name.startsWith('unWatch')) return false;
    if (name.endsWith('Ws')) return false;
    if (BLACKLIST.has(name)) return false;
    if (name.toLowerCase().includes('uta')) return false;
    if (name.includes('Snapshot') || name.includes('Subscription') || name.includes('Cache')) return false;
    return ALLOWED_PREFIXES.some(p => name.startsWith(p));
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
        // Always tacked on at the end as `Value` so callers can pass extra
        // exchange-specific knobs without leaving the typed surface.
        return {
            name: 'params',
            rustType: 'Value',
            toValueExpr: 'params',
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
    const sigRe = /^ {4}(?:async )?[A-Za-z_][A-Za-z0-9_]*\s*\([^;{]*\)\s*:\s*[^;{]+;\s*$/;
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

function genMethod(m: MethodInfo): string {
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
    if (required.length === 0) {
        coreCallExpr = `self.core.${m.coreCall}(&[${optionalArgs}])`;
    } else {
        coreCallExpr = `self.core.${m.coreCall}(${requiredArgs}, &[${optionalArgs}])`;
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

function generateTypedWrapper(exchangeId: string, methods: MethodInfo[]): string {
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
        '// The core is heap-allocated so its address stays stable across moves',
        '// of the wrapper. The derived-dispatch pointer captured inside',
        '// `Exchange::bind_derived` points at the heap allocation, which means',
        '// users can safely `let bin = Binance::new(None);` and pass `bin`',
        '// around by value — none of those moves invalidate the pointer.',
        '',
        '#![allow(unused, non_snake_case, clippy::all)]',
        '',
        'use crate::Value;',
        `use crate::exchanges::${exchangeId}::${coreClassName};`,
        'use crate::types::*;',
        '',
        `pub struct ${className} {`,
        `    pub core: Box<${coreClassName}>,`,
        '}',
        '',
        `impl ${className} {`,
        '    pub fn new(config: Option<Value>) -> Self {',
        `        let mut core = Box::new(${coreClassName}::new(config));`,
        '        // Re-bind so derived-dispatch points at the heap allocation',
        '        // (the `bind_derived` call inside `Core::new` captured the',
        '        // pre-move stack address, which is now invalid).',
        '        core.bind();',
        '        Self { core }',
        '    }',
        '',
        `    pub fn from_core(core: ${coreClassName}) -> Self {`,
        '        let mut boxed = Box::new(core);',
        '        boxed.bind();',
        '        Self { core: boxed }',
        '    }',
        '}',
        '',
        `impl std::ops::Deref for ${className} {`,
        `    type Target = ${coreClassName};`,
        '    fn deref(&self) -> &Self::Target { &*self.core }',
        '}',
        '',
        `impl std::ops::DerefMut for ${className} {`,
        '    fn deref_mut(&mut self) -> &mut Self::Target { &mut *self.core }',
        '}',
        '',
        `impl ${className} {`,
    ];

    const body = methods.map(genMethod).join('\n\n');
    const footer = ['}', ''];

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
    // `pub async fn fetch_balance(...) -> Value { ... }`
    // `pub fn safe_market(&self, ...) -> Value { ... }`
    const re = /\bpub\s+(?:async\s+)?fn\s+([a-z_][a-z0-9_]*)\s*\(/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(src)) !== null) out.add(m[1]);
    return out;
}

// Build the `<id> → parent_id` map by scanning every `<id>.rs` for a
// `type Target = crate::exchanges::<parent>::<Parent>Core;` line — this
// is the standard Rust pattern for the alias/subclass exchanges
// (myokx → okx, binanceusdm → binance, …).
function parseParents(folder: string): Map<string, string> {
    const parents = new Map<string, string>();
    const re = /type\s+Target\s*=\s*crate::exchanges::([a-z0-9_]+)::[A-Za-z0-9_]+Core\s*;/;
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

const BASE_RS = './rust/ccxt/src/exchange_generated.rs';
const STUBS_RS = './rust/ccxt/src/exchange_stubs.rs';

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

    if (!fs.existsSync(EXCHANGES_FOLDER)) {
        console.error(`Exchanges folder not found: ${EXCHANGES_FOLDER}`);
        process.exit(1);
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

    // Discover exchanges by their primary file `<id>.rs`. We deliberately
    // skip the auto-generated `_api.rs` siblings and any prior
    // `_typed.rs` files (we overwrite them below).
    const onlyId = process.argv[2];
    const all = fs.readdirSync(EXCHANGES_FOLDER)
        .filter(f => f.endsWith('.rs')
                  && !f.endsWith('_api.rs')
                  && !f.endsWith('_typed.rs')
                  && f !== 'mod.rs');
    const targets = onlyId
        ? all.filter(f => f === `${onlyId}.rs`)
        : all;

    // Pre-build the parent map so alias exchanges (myokx → okx,
    // binanceusdm → binance, …) inherit their parent's typed surface.
    const parents = parseParents(EXCHANGES_FOLDER);
    const methodCache = new Map<string, Set<string>>();
    if (parents.size > 0) {
        console.log(`Found ${parents.size} alias/derived exchanges (Deref-based inheritance)`);
    }

    const generatedIds: string[] = [];
    let totalEmittedMethods = 0;
    for (const f of targets) {
        const id = f.replace(/\.rs$/, '');
        const ownAndInherited = discoverReachableMethods(id, EXCHANGES_FOLDER, parents, methodCache);
        const reachable = new Set<string>([...baseMethods, ...ownAndInherited]);
        // Filter the global method list to those the core (including its
        // Deref-parent chain) actually exposes.
        const exchangeMethods = methods.filter(m => reachable.has(m.coreCall));
        totalEmittedMethods += exchangeMethods.length;
        const out = path.join(EXCHANGES_FOLDER, `${id}_typed.rs`);
        const content = generateTypedWrapper(id, exchangeMethods);
        fs.writeFileSync(out, content, 'utf-8');
        generatedIds.push(id);
    }
    const generated = generatedIds.length;
    console.log(`Generated ${generated} typed wrappers (avg ${(totalEmittedMethods / Math.max(1, generated)).toFixed(1)} methods/exchange) in ${EXCHANGES_FOLDER}`);

    // When generating the full set (no single-exchange filter), also emit
    // the aggregator `rust/ccxt/src/typed.rs` that re-exports every
    // `<Capitalized>` typed wrapper. `lib.rs` does `pub use typed::*;`
    // so users can write `use ccxt::Binance;` directly.
    if (!onlyId) {
        const aggregator = path.resolve('./rust/ccxt/src/typed.rs');
        // Read the on-disk listing so the aggregator includes every typed
        // file present, not just those we just wrote (handles partial-build
        // states where the per-exchange generator was run for one id).
        const allTyped = fs.readdirSync(EXCHANGES_FOLDER)
            .filter(f => f.endsWith('_typed.rs'))
            .map(f => f.replace(/_typed\.rs$/, ''));
        const lines: string[] = [
            '// PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:',
            '// https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code',
            '//',
            '// Aggregator: re-exports every per-exchange typed wrapper at the crate',
            '// root so users can write `use ccxt::Binance;` instead of the full',
            '// `use ccxt::exchanges::binance_typed::Binance;` path.',
            '//',
            '// Generated by `build/generateRustWrappers.ts`.',
            '',
            '#![allow(unused_imports)]',
            '',
        ];
        for (const id of allTyped) {
            lines.push(`pub use crate::exchanges::${id}_typed::${capitalize(id)};`);
        }
        lines.push('');
        fs.writeFileSync(aggregator, lines.join('\n'), 'utf-8');
        console.log(`Wrote aggregator ${aggregator} with ${allTyped.length} re-exports`);
    }
}

main();
