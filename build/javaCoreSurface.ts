#!/usr/bin/env tsx
/**
 * Java Core Surface Generator for CCXT
 *
 * Emits the typed public surface — typed parameter lists, blocking sync facade,
 * arity-truncation overloads, typed async forwarders and the `String[]`
 * ergonomic overloads — DIRECTLY INTO each generated `<X>Core.java` class,
 * instead of into a separate `<X>.java extends <X>Core` wrapper file.
 *
 * Why this is safe (measured on the whole tree, see PR notes):
 *
 *  - every transpiled core method is `(Object a, Object b, Object... optionalArgs)`;
 *    no venue core declares a fixed arity that differs from the base declaration
 *    for any typed-surface name, so the typed overloads never clash;
 *  - the cores hold ZERO typed locals. An internal `this.fetchX(objLocal, ...)`
 *    passes `Object` arguments, and `Object` is NOT assignable to
 *    `String` / `Long` / `Double` / `Map<String,Object>`, so those call sites keep
 *    binding to the varargs core even though the typed overloads now live in the
 *    same class;
 *  - zero-arg / `(null)` internal call shapes are already routed to the untyped
 *    `<name>Async()` alias by `routeWhitelistedInternalCallsToAsync` in
 *    build/javaTranspiler.ts, together with ZERO_REQUIRED_TYPED_WHITELIST;
 *  - the reflective test harness prefers `isVarArgs` methods, so reflective
 *    dispatch is unaffected.
 *
 * Bodies delegate to the varargs core in the same class with every argument cast
 * to `(Object)`:  `this.fetchTicker((Object) symbol, (Object) params)`.
 * The cast is load-bearing: without it the delegate would recurse into the typed
 * overload itself.
 *
 * Conversion: names in TYPED_CORES (build/javaTypedCores.ts) already return the
 * unified family from the core, so the sync facade is a plain `Helpers.joinTyped`
 * and the async forwarder is a bare return — exactly the shape
 * build/dropJavaThinWrappers.py produces for the wrappers today. Names outside
 * the table still return `CompletableFuture<Object>`, so they keep the
 * `joinUnwrapped` + `new T(res)` / `toTypedList(...)` conversion.
 *
 * Type spellings match the wrapper files this surface replaced (`List<Trade>`,
 * `Map<String, Object>`, `CompletableFuture<Ticker>`), and the four imports the
 * wrappers carried (`io.github.ccxt.types.*`, `java.util.List`, `java.util.Map`,
 * `java.util.concurrent.CompletableFuture`) are added to the core's import block.
 * Measured on the whole tree: the transpiled bodies spell every `java.util.*`
 * and `io.github.ccxt.types.*` reference fully qualified, and no simple name in
 * the types package collides with a class in `errors`, `ws`, `api`, the exchange
 * classes or the root package, so the imports change nothing outside the block.
 * Keeping the wrapper's spelling lets git match the unchanged overload lines
 * against the deleted wrapper (~120k fewer added and deleted lines in the
 * migration diff) and keeps `git blame` on the surface readable.
 *
 * Usage:
 *   tsx build/javaCoreSurface.ts               # every REST core
 *   tsx build/javaCoreSurface.ts binance okx   # named cores only
 */

import * as fs from 'fs';
import { fileURLToPath } from 'node:url';
import { parseMethodsFromTS, capitalize, camelCase, type MethodInfo, type ParamInfo, ZERO_REQUIRED_TYPED_WHITELIST, WATCH_ZERO_ARG_WHITELIST, toPredictionMethods, predictionTierExcludeNames, PREDICTION_BASE_TS } from './generateJavaWrappers.js';
import { TYPED_CORES, PREDICTION_TYPED_CORES, SNAPSHOT_CORES } from './javaTypedCores.js';

// Which typed-core table the surface currently emits against. Set per tier by
// main(); the prediction tier has its own families (PredictionOrder, ...).
let ACTIVE_TYPED_CORES: Record<string, string> = TYPED_CORES;

/**
 * SNAPSHOT_CORES (watchOrderBook*): the crypto-tier core is typed to the live ws
 * structure (`CompletableFuture<WsOrderBook>`) and copies it itself. The public
 * surface type (OrderBook) differs from the core type, so the facade KEEPS its
 * `new OrderBook(res)` conversion -- the OrderBook(Object) constructor accepts a
 * WsOrderBook -- and only swaps `joinUnwrapped(CompletableFuture<Object>)`, which
 * no longer compiles against the typed future, for the generic `joinTyped`.
 * Crypto tier only: PredictionExchange re-declares watchOrderBook untyped.
 */
function isSnapshotCore(m: MethodInfo): boolean {
    return ACTIVE_TYPED_CORES === TYPED_CORES && Object.prototype.hasOwnProperty.call(SNAPSHOT_CORES, m.name);
}

const EXCHANGES_FOLDER = './java/lib/src/main/java/io/github/ccxt/exchanges/';

const SURFACE_BEGIN = '    // --- BEGIN GENERATED TYPED PUBLIC SURFACE (build/javaCoreSurface.ts) ---';
const SURFACE_END = '    // --- END GENERATED TYPED PUBLIC SURFACE ---';

/**
 * Imports the surface relies on. They are the exact four the deleted wrapper
 * files carried; injectSurface adds any that are missing to the core's import
 * block (idempotent).
 */
const SURFACE_IMPORTS = [
    'import io.github.ccxt.types.*;',
    'import java.util.List;',
    'import java.util.Map;',
    'import java.util.concurrent.CompletableFuture;',
];

/** Spell a java type produced by the shared MethodInfo tables as the wrappers did (simple names, see SURFACE_IMPORTS). */
function fq(javaType: string): string {
    return javaType;
}

function future(inner: string): string {
    return `CompletableFuture<${inner}>`;
}

/** `this.name((Object) a, (Object) b, ...)` — forces the varargs core. */
function delegate(methodName: string, allParams: ParamInfo[]): string {
    const args = allParams.map(p => `(Object) ${p.name}`).join(', ');
    return `this.${methodName}(${args})`;
}

function isCoreTyped(m: MethodInfo): boolean {
    const fam = ACTIVE_TYPED_CORES[m.name];
    if (fam === undefined) return false;
    if (fam !== m.javaReturnType) {
        console.warn(`javaCoreSurface: TYPED_CORES['${m.name}'] = ${fam} but surface type is ${m.javaReturnType}; emitting the converting form`);
        return false;
    }
    return true;
}

function syncBody(m: MethodInfo, call: string): string[] {
    if (isCoreTyped(m)) return [`        return Helpers.joinTyped(${call});`];
    const join = isSnapshotCore(m) ? 'joinTyped' : 'joinUnwrapped';
    const lines = [`        Object res = Helpers.${join}(${call});`];
    if (m.isArray && m.elementType) lines.push(`        return toTypedList(res, ${m.elementType}::new);`);
    else if (m.javaReturnType === 'Object') lines.push('        return res;');
    else if (m.javaReturnType === 'Long') lines.push('        return (res instanceof Number n) ? n.longValue() : null;');
    else if (m.javaReturnType === 'Double') lines.push('        return (res instanceof Number n) ? n.doubleValue() : null;');
    else if (m.javaReturnType === 'String') lines.push('        return (String) res;');
    else if (m.javaReturnType === 'Boolean') lines.push('        return (Boolean) res;');
    else if (m.javaReturnType === 'Map<String, Object>') lines.push('        return (Map<String, Object>) res;');
    else lines.push(`        return new ${m.javaReturnType}(res);`);
    return lines;
}

function asyncBody(m: MethodInfo, call: string): string {
    if (isCoreTyped(m)) return `        return ${call};`;
    let mapper: string;
    if (m.isArray && m.elementType) mapper = `res -> toTypedList(res, ${m.elementType}::new)`;
    else if (m.javaReturnType === 'Object') mapper = 'res -> res';
    else if (m.javaReturnType === 'Long') mapper = 'res -> (res instanceof Number n) ? n.longValue() : null';
    else if (m.javaReturnType === 'Double') mapper = 'res -> (res instanceof Number n) ? n.doubleValue() : null';
    else if (m.javaReturnType === 'String') mapper = 'res -> (String) res';
    else if (m.javaReturnType === 'Boolean') mapper = 'res -> (Boolean) res';
    else if (m.javaReturnType === 'Map<String, Object>') mapper = 'res -> (Map<String, Object>) res';
    else mapper = `${m.javaReturnType}::new`;
    return `        return ${call}.thenApply(${mapper});`;
}

function genMethodSurface(m: MethodInfo): string {
    const methodName = camelCase(m.name);
    const ret = fq(m.javaReturnType);
    const allParams = [...m.requiredParams, ...m.optionalParams];
    const fullDecl = allParams.map(p => `${fq(p.javaType)} ${p.name}`).join(', ');
    const call = delegate(methodName, allParams);

    const lines: string[] = [];

    lines.push(`    @SuppressWarnings("unchecked")`);
    lines.push(`    public ${ret} ${methodName}(${fullDecl}) {`);
    lines.push(...syncBody(m, call));
    lines.push(`    }`);

    const emitTruncations = m.requiredParams.length > 0
        || ZERO_REQUIRED_TYPED_WHITELIST.has(m.name)
        || WATCH_ZERO_ARG_WHITELIST.has(m.name);

    const defaultExpr = (p: ParamInfo) =>
        p.defaultValue && p.defaultValue !== 'null' ? p.defaultValue : `(${fq(p.javaType)}) null`;

    const truncations = (asyncSuffix: string, retType: string): string[] => {
        const out: string[] = [];
        for (let k = 0; k < m.optionalParams.length; k++) {
            const present = [...m.requiredParams, ...m.optionalParams.slice(0, k)];
            const decl = present.map(p => `${fq(p.javaType)} ${p.name}`).join(', ');
            const args = present.map(p => p.name).join(', ');
            const defaults = m.optionalParams.slice(k).map(defaultExpr).join(', ');
            const allArgs = args ? `${args}, ${defaults}` : defaults;
            out.push(`    public ${retType} ${methodName}${asyncSuffix}(${decl}) { return ${methodName}${asyncSuffix}(${allArgs}); }`);
        }
        return out;
    };

    if (emitTruncations) lines.push(...truncations('', ret));

    lines.push(`    @SuppressWarnings("unchecked")`);
    lines.push(`    public ${future(ret)} ${methodName}Async(${fullDecl}) {`);
    lines.push(asyncBody(m, call));
    lines.push(`    }`);

    if (emitTruncations) lines.push(...truncations('Async', future(ret)));

    // String[] ergonomic overload at FULL ARITY only (see generateJavaWrappers.ts
    // for why truncated String[] variants would collide on literal nulls).
    if (allParams.some(p => p.javaType === 'List<String>')) {
        const arrDecl = allParams.map(p => p.javaType === 'List<String>' ? `String[] ${p.name}` : `${fq(p.javaType)} ${p.name}`).join(', ');
        const arrArgs = allParams.map(p => p.javaType === 'List<String>'
            ? `${p.name} == null ? null : java.util.Arrays.asList(${p.name})`
            : p.name).join(', ');
        lines.push(`    public ${ret} ${methodName}(${arrDecl}) { return ${methodName}(${arrArgs}); }`);
        lines.push(`    public ${future(ret)} ${methodName}Async(${arrDecl}) { return ${methodName}Async(${arrArgs}); }`);
    }

    return lines.join('\n');
}

/** loadMarkets is special: its first argument is a boolean `reload`, not `params`. */
function genLoadMarkets(): string {
    const marketMap = 'Map<String, MarketInterface>';
    return [
        `    // --- loadMarkets (special: first arg is boolean reload) ---`,
        `    @SuppressWarnings("unchecked")`,
        `    public ${marketMap} loadMarkets(boolean reload) {`,
        `        Object res = this.loadMarkets((Object) reload).join();`,
        `        java.util.LinkedHashMap<String, MarketInterface> result = new java.util.LinkedHashMap<>();`,
        `        for (Map.Entry<String, Object> entry : ((Map<String, Object>) res).entrySet()) {`,
        `            result.put(entry.getKey(), new MarketInterface(entry.getValue()));`,
        `        }`,
        `        return result;`,
        `    }`,
        `    @SuppressWarnings("unchecked")`,
        `    public CompletableFuture<${marketMap}> loadMarketsAsync(boolean reload) {`,
        `        return this.loadMarkets((Object) reload).thenApply(res -> {`,
        `            java.util.LinkedHashMap<String, MarketInterface> result = new java.util.LinkedHashMap<>();`,
        `            for (Map.Entry<String, Object> entry : ((Map<String, Object>) res).entrySet()) {`,
        `                result.put(entry.getKey(), new MarketInterface(entry.getValue()));`,
        `            }`,
        `            return result;`,
        `        });`,
        `    }`,
    ].join('\n');
}

export function buildSurface(methods: MethodInfo[], withLoadMarkets = true, table: Record<string, string> = TYPED_CORES): string {
    ACTIVE_TYPED_CORES = table;
    const out: string[] = [SURFACE_BEGIN, ''];
    if (withLoadMarkets) {
        out.push(genLoadMarkets());
        out.push('');
    }
    for (const m of methods) {
        out.push(genMethodSurface(m));
        out.push('');
    }
    out.push(SURFACE_END);
    return out.join('\n');
}

/**
 * Add the SURFACE_IMPORTS the core does not already carry, right after its last
 * `import` line (the transpiler emits a fixed import block after `package`).
 */
function ensureSurfaceImports(src: string, path: string): string {
    const missing = SURFACE_IMPORTS.filter(imp => !src.includes(imp + '\n'));
    if (!missing.length) return src;
    const lines = src.split('\n');
    let last = -1;
    for (let i = 0; i < lines.length; i++) if (lines[i].startsWith('import ')) last = i;
    if (last === -1) throw new Error(`${path}: no import block to extend`);
    lines.splice(last + 1, 0, ...missing);
    return lines.join('\n');
}

/**
 * Splice the surface into a core file, replacing a previously generated block if
 * present so the pass is idempotent.
 */
export function injectSurface(path: string, surface: string): boolean {
    const src = fs.readFileSync(path, 'utf-8');
    let body = src;
    const begin = body.indexOf(SURFACE_BEGIN);
    if (begin !== -1) {
        const end = body.indexOf(SURFACE_END, begin);
        if (end === -1) throw new Error(`${path}: unterminated generated surface block`);
        body = body.slice(0, begin) + body.slice(end + SURFACE_END.length + 1);
    }
    const lastBrace = body.lastIndexOf('}');
    if (lastBrace === -1) throw new Error(`${path}: no closing brace`);
    let next = body.slice(0, lastBrace) + surface + '\n' + body.slice(lastBrace);
    next = ensureSurfaceImports(next, path);
    if (next === src) return false;
    fs.writeFileSync(path, next, 'utf-8');
    return true;
}

const isWsApi = (m: MethodInfo) => m.name.endsWith('Ws');

/**
 * Split a comma-separated Java argument list at top level, respecting nested
 * (), [], {}, <> is NOT tracked (generics never appear in a call argument list
 * without parens) and string / char literals.
 */
function splitArgs(s: string): string[] | null {
    const out: string[] = [];
    let depth = 0, angle = 0, inStr: string | null = null, buf = '';
    for (let i = 0; i < s.length; i++) {
        const ch = s[i];
        if (inStr) {
            buf += ch;
            if (ch === '\\') { buf += s[++i]; continue; }
            if (ch === inStr) inStr = null;
            continue;
        }
        if (ch === '"' || ch === '\'') { inStr = ch; buf += ch; continue; }
        if (ch === '(' || ch === '[' || ch === '{') depth++;
        else if (ch === ')' || ch === ']' || ch === '}') depth--;
        // Generic argument lists: `new java.util.HashMap<String, Object>()`
        // contains a top-level-looking comma that is NOT an argument separator.
        // Only treat `<` as an opener when it directly follows an identifier.
        else if (ch === '<' && /[A-Za-z0-9_]/.test(buf.slice(-1))) angle++;
        else if (ch === '>' && angle > 0) angle--;
        if (depth < 0) return null;
        if (ch === ',' && depth === 0 && angle === 0) { out.push(buf); buf = ''; }
        else buf += ch;
    }
    if (depth !== 0 || angle !== 0 || inStr) return null;
    if (buf.trim().length) out.push(buf);
    return out;
}

/**
 * Cast every argument of an internal `this.<surfaceName>(...)` call to (Object).
 *
 * Once the typed surface lives in the same class, an internal call whose
 * arguments happen to be assignable to the typed parameter list (a `String`
 * literal, a `Map` from `this.extend(...)`) would bind to the typed sync facade
 * and get a unified type where the transpiled body expects
 * `CompletableFuture<Object>`. Casting to `(Object)` pins the call back onto the
 * varargs core. This is the Java analogue of C#'s `castCoreArgCallSites`.
 */
export function castCoreArgCallSites(src: string, names: Set<string>): string {
    let out = '';
    let i = 0;
    while (i < src.length) {
        const m = /this\.([A-Za-z0-9_]+)\s*\(/.exec(src.slice(i));
        if (!m) { out += src.slice(i); break; }
        const start = i + m.index;
        const openIdx = start + m[0].length;      // just past '('
        out += src.slice(i, openIdx);
        i = openIdx;
        if (!names.has(m[1])) continue;
        // find matching close paren
        let depth = 1, j = openIdx, inStr: string | null = null;
        for (; j < src.length && depth > 0; j++) {
            const ch = src[j];
            if (inStr) {
                if (ch === '\\') { j++; continue; }
                if (ch === inStr) inStr = null;
                continue;
            }
            if (ch === '"' || ch === '\'') { inStr = ch; continue; }
            if (ch === '(' || ch === '[' || ch === '{') depth++;
            else if (ch === ')' || ch === ']' || ch === '}') depth--;
        }
        if (depth !== 0) continue;
        const inner = src.slice(openIdx, j - 1);
        if (!inner.trim()) continue;                       // zero-arg: already routed
        const args = splitArgs(inner);
        if (!args) continue;
        const casted = args.map(a => a.trim().startsWith('(Object)') ? a : ` (Object) (${a.trim()})`).join(',');
        out += casted + ')';
        i = j;
    }
    return out;
}

function isMainEntry(metaUrl: string): boolean {
    if (!metaUrl.startsWith('file:')) return false;
    const modulePath = fileURLToPath(metaUrl);
    return process.argv[1] === modulePath || process.argv[1] === modulePath.replace('.js', '');
}

const WS_FOLDER = './java/lib/src/main/java/io/github/ccxt/exchanges/pro/';
const PREDICTION_FOLDER = './java/lib/src/main/java/io/github/ccxt/exchanges/prediction/';
const API_FOLDER = './java/lib/src/main/java/io/github/ccxt/api/';

/**
 * Rename `<X>Core.java` -> `<X>.java` (deleting the old thin wrapper), and
 * retarget the `api/<X>Api` aliases that extend a core.
 */
function migrate(folder: string, only: string[]): number {
    let n = 0;
    for (const f of fs.readdirSync(folder).filter(x => x.endsWith('Core.java'))) {
        const base = f.slice(0, -'Core.java'.length);
        if (only.length && !only.includes(base.toLowerCase())) continue;
        const corePath = folder + f;
        const wrapperPath = folder + base + '.java';
        let src = fs.readFileSync(corePath, 'utf-8');
        src = src.split(base + 'Core').join(base);
        if (fs.existsSync(wrapperPath)) fs.unlinkSync(wrapperPath);
        fs.writeFileSync(wrapperPath, src, 'utf-8');
        fs.unlinkSync(corePath);
        n++;
    }
    return n;
}

function retargetApiAliases(): number {
    if (!fs.existsSync(API_FOLDER)) return 0;
    let n = 0;
    for (const f of fs.readdirSync(API_FOLDER).filter(x => x.endsWith('.java'))) {
        const p = API_FOLDER + f;
        const src = fs.readFileSync(p, 'utf-8');
        const next = src.replace(/\b(\w+)Core\b/g, '$1');
        if (next !== src) { fs.writeFileSync(p, next, 'utf-8'); n++; }
    }
    return n;
}

function main() {
    const args = process.argv.slice(2);
    const doMigrate = args.includes('--migrate');
    const only = args.filter(a => !a.startsWith('-')).map(s => s.toLowerCase());

    const methods = parseMethodsFromTS();
    const restMethods = methods.filter(m => !m.isWatch && !isWsApi(m));
    const wsMethods = methods.filter(m => m.isWatch || isWsApi(m));
    const surfaceNames = new Set(methods.map(m => camelCase(m.name)).concat(['loadMarkets']));

    // Prediction tier: same shape, but the unified families are the dedicated
    // Prediction* types, Exchange-tier names no prediction venue implements are
    // dropped, and PredictionExchange-only names are added.
    const baseNames = new Set(methods.map(m => m.name));
    const predictionBaseOnly = fs.existsSync(PREDICTION_BASE_TS)
        ? parseMethodsFromTS(PREDICTION_BASE_TS).filter(m => !m.isWatch && !isWsApi(m) && !baseNames.has(m.name))
        : [];
    const predictionExclude = predictionTierExcludeNames();
    const predictionMethods = toPredictionMethods(restMethods.filter(m => !predictionExclude.has(m.name))).concat(predictionBaseOnly);

    const predictionNames = new Set(predictionMethods.map(m => camelCase(m.name)).concat([...surfaceNames]));

    const tiers: Array<[string, MethodInfo[], boolean, Record<string, string>, Set<string>]> = [
        [EXCHANGES_FOLDER, restMethods, true, TYPED_CORES, surfaceNames],
        [WS_FOLDER, wsMethods, false, TYPED_CORES, surfaceNames],
        [PREDICTION_FOLDER, predictionMethods, true, PREDICTION_TYPED_CORES, predictionNames],
    ];

    let touched = 0, cores = 0;
    for (const [folder, tierMethods, withLoadMarkets, table, names] of tiers) {
        if (!fs.existsSync(folder)) continue;
        const surface = buildSurface(tierMethods, withLoadMarkets, table);
        for (const f of fs.readdirSync(folder).filter(x => x.endsWith('Core.java'))) {
            if (only.length && !only.includes(f.replace('Core.java', '').toLowerCase())) continue;
            const p = folder + f;
            // Pin every internal call on a surface name back onto the varargs core.
            fs.writeFileSync(p, castCoreArgCallSites(fs.readFileSync(p, 'utf-8'), names), 'utf-8');
            cores++;
            if (injectSurface(p, surface)) touched++;
        }
    }
    console.log(`javaCoreSurface: REST ${restMethods.length} / WS ${wsMethods.length} surface methods -> ${cores} core(s), ${touched} rewritten`);

    if (doMigrate) {
        let renamed = 0;
        for (const [folder] of tiers) if (fs.existsSync(folder)) renamed += migrate(folder, only);
        const aliases = retargetApiAliases();
        console.log(`javaCoreSurface: renamed ${renamed} core(s) to the plain class name, retargeted ${aliases} api alias file(s)`);
    }
}

if (isMainEntry(import.meta.url)) {
    main();
}
