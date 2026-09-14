// Import collapsing for generated Java, shared by every generator that writes Java under
// java/lib and java/tests (javaTranspiler.ts, generateJavaWrappers.ts, generateImplicitAPI.ts).
//
// The ast-transpiler Java printer spells the JDK collection types out in full at every use
// site (`new java.util.HashMap<String, Object>()`, `java.util.List<Object>`,
// `java.util.concurrent.CompletableFuture<Object>`, ...), and the typed-core pass spells the
// CCXT unified types the same way (`CompletableFuture<io.github.ccxt.types.Ticker>`,
// `.thenApply(io.github.ccxt.types.Ticker::new)`). The helpers below rewrite those references
// to their simple names and add the matching single-type `import` declarations once at the top
// of the compilation unit. They run at WRITE time, after every upstream regex pass (which still
// match on the qualified spelling), so no pass and no pinned dependency needs patching.
//
// Scope is deliberately a closed allow-list of unambiguous names. A single-type import shadows
// on-demand (`.*`) imports and same-package types (JLS 6.4.1), so the rewrite can only change
// resolution if a nested type of the same simple name is inherited into the class body — no
// generated or hand-written type under java/ (including nested types, tests, examples, cli),
// no java.lang / java.util / java.security / io.netty.channel type and no exchange, ws, base
// or error class is named like any entry below
// (`grep -rE '\b(class|interface|enum|record)\s+(List|Map|Order|...)\b' java/`).
// Wildcard imports are never emitted: they would re-introduce exactly that ambiguity.
// Deliberately NOT collapsed (ambiguity or <60 uses): Function, Set, Map.Entry,
// ConcurrentHashMap, Callable, Collections, Locale, Base64, zip.*, io.github.ccxt.ws.*.
//
// The rewrite is source-aware: string / char / text-block literals, `//` and `/* */` comments
// and existing `import` declarations are left untouched, so it is idempotent and cannot
// corrupt an already-shortened file or a literal that happens to mention a package name.
// A reference to a type of the compilation unit's own package (its `package` declaration) is
// shortened without an import: the package is already in scope (JLS 6.3).
// This module has no dependencies on purpose: the standalone generators import it without
// pulling in the transpiler driver.
export const JAVA_UTIL_IMPORTS: Record<string, string> = {
    'ArrayList': 'java.util.ArrayList',
    'Arrays': 'java.util.Arrays',
    'HashMap': 'java.util.HashMap',
    'LinkedHashMap': 'java.util.LinkedHashMap',
    'List': 'java.util.List',
    'Map': 'java.util.Map',
    'CompletableFuture': 'java.util.concurrent.CompletableFuture',
    'Collectors': 'java.util.stream.Collectors',
};

// Unified types (java/lib/src/main/java/io/github/ccxt/types) the typed cores and surfaces
// reference by qualified name. Closed list: a new type stays qualified until it is audited.
export const CCXT_TYPE_NAMES: readonly string[] = [
    'ADL', 'Account', 'Balance', 'Balances', 'BorrowInterest', 'Conversion', 'CrossBorrowRate',
    'CrossBorrowRates', 'Currencies', 'DepositAddress', 'DepositWithdrawFee', 'DepositWithdrawFees',
    'FundingHistory', 'FundingRate', 'FundingRateHistory', 'FundingRates', 'Greeks',
    'IsolatedBorrowRate', 'IsolatedBorrowRates', 'LastPrices', 'LedgerEntry', 'Leverage',
    'LeverageTier', 'LeverageTiers', 'Leverages', 'Liquidation', 'LongShortRatio', 'MarginLoan',
    'MarginMode', 'MarginModes', 'MarginModification', 'MarketInterface', 'OHLCV', 'OpenInterest',
    'OpenInterests', 'Option', 'OptionChain', 'Order', 'OrderBook', 'OrderBooks', 'Position',
    'PositionModeInfo', 'PredictionEvent', 'PredictionOpenInterest', 'PredictionOrder',
    'PredictionOrderBook', 'PredictionPosition', 'PredictionSettlement', 'PredictionTicker',
    'PredictionTickers', 'PredictionTrade', 'PredictionTradingFee', 'Status', 'Ticker', 'Tickers',
    'Trade', 'TradingFeeInterface', 'TradingFees', 'Transaction', 'TransferEntry',
];

export const CCXT_TYPES_PACKAGE = 'io.github.ccxt.types';

export const CCXT_TYPE_IMPORTS: Record<string, string> = Object.fromEntries (
    CCXT_TYPE_NAMES.map ((name) => [ name, CCXT_TYPES_PACKAGE + '.' + name ])
);

// simple name -> fully-qualified name, every collapsed type
export const JAVA_IMPORTS: Record<string, string> = { ...JAVA_UTIL_IMPORTS, ...CCXT_TYPE_IMPORTS };

function escapeRegExp (s: string): string {
    return s.replace (/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Regions that must not be rewritten (literal, comment, import line). The alternation is tried
// left to right at every position, so a region that starts before a qualified name swallows it
// before the name alternative can match.
const SKIPPED_REGION_PATTERN = '"""[\\s\\S]*?"""'      // text block
    + '|"(?:[^"\\\\\\n]|\\\\.)*"'                       // string literal
    + '|\'(?:[^\'\\\\\\n]|\\\\.)*\''                    // char literal
    + '|//[^\\n]*'                                      // line comment
    + '|/\\*[\\s\\S]*?\\*/'                             // block comment
    + '|^[ \\t]*import[ \\t][^\\n]*';                   // import declaration (already qualified by design)

// Group 1: a skipped region. Group 2: an allow-listed fully-qualified name. Longest names first
// so `...types.OrderBook` is never split as `...types.Order` + `Book`; `\b` guards both ends.
export const JAVA_SOURCE_TOKEN_RE = new RegExp (
    '(' + SKIPPED_REGION_PATTERN + ')'
    + '|\\b(' + Object.values (JAVA_IMPORTS).sort ((a, b) => b.length - a.length).map (escapeRegExp).join ('|') + ')\\b',
    'gm'
);

export interface ShortenedJavaSource {
    source: string;
    // fully-qualified names that were shortened at least once, sorted, unique
    imports: string[];
}

// Replace allow-listed qualified references with their simple names, outside literals,
// comments and import lines. Returns the rewritten source plus the imports it now needs.
export function shortenJavaReferences (source: string): ShortenedJavaSource {
    const needed = new Set<string> ();
    const rewritten = source.replace (JAVA_SOURCE_TOKEN_RE, (match: string, skipped: string | undefined, fqn: string | undefined) => {
        if (skipped !== undefined) {
            return skipped;
        }
        needed.add (fqn as string);
        return (fqn as string).slice ((fqn as string).lastIndexOf ('.') + 1);
    });
    return { source: rewritten, imports: Array.from (needed).sort () };
}

const IMPORT_LINE_RE = /^[ \t]*import[ \t]+(?:static[ \t]+)?([\w.]+(?:\.\*)?)[ \t]*;/gm;
const PACKAGE_LINE_RE = /^[ \t]*package[ \t]+([\w.]+)[ \t]*;[^\n]*\n/m;

function packageOf (fqn: string): string {
    return fqn.slice (0, fqn.lastIndexOf ('.'));
}

function isCoveredByExistingImport (fqn: string, existing: Set<string>): boolean {
    return existing.has (fqn) || existing.has (packageOf (fqn) + '.*');
}

// Add `import <fqn>;` for every name in `fqns` that the compilation unit does not already import
// (explicitly, via an on-demand import of the same package, or because the type lives in the
// unit's own package). New declarations are appended, sorted, directly after the last existing
// import — or after the `package` line when the file has no imports yet — so the output is
// stable across repeated runs.
export function ensureJavaImports (source: string, fqns: string[]): string {
    const existing = new Set<string> ();
    let lastImportEnd = -1;
    let m: RegExpExecArray | null;
    IMPORT_LINE_RE.lastIndex = 0;
    while ((m = IMPORT_LINE_RE.exec (source)) !== null) {
        existing.add (m[1]);
        lastImportEnd = m.index + m[0].length;
    }
    const pkg = PACKAGE_LINE_RE.exec (source);
    const ownPackage = (pkg !== null) ? pkg[1] : '';
    const missing = fqns.filter ((fqn) => packageOf (fqn) !== ownPackage && !isCoveredByExistingImport (fqn, existing)).sort ();
    if (missing.length === 0) {
        return source;
    }
    const block = missing.map ((fqn) => 'import ' + fqn + ';').join ('\n');
    if (lastImportEnd >= 0) {
        // keep whatever trailed the last import line (usually nothing, or a comment)
        const lineEnd = source.indexOf ('\n', lastImportEnd);
        const cut = (lineEnd < 0) ? source.length : lineEnd;
        return source.slice (0, cut) + '\n' + block + source.slice (cut);
    }
    if (pkg !== null) {
        const cut = pkg.index + pkg[0].length;
        return source.slice (0, cut) + block + '\n' + source.slice (cut);
    }
    return block + '\n' + source;
}

// Group 1: a skipped region. Group 2: an allow-listed SIMPLE name used as a type (not the
// member of a qualified name), for sources that were emitted with simple names to begin with.
const JAVA_SIMPLE_NAME_RE = new RegExp (
    '(' + SKIPPED_REGION_PATTERN + ')'
    + '|(?<![\\w.])(' + Object.keys (JAVA_IMPORTS).sort ((a, b) => b.length - a.length).join ('|') + ')\\b',
    'gm'
);

// Imports needed by a source that already spells the allow-listed types by simple name.
export function javaImportsForSimpleNames (source: string): string[] {
    const needed = new Set<string> ();
    let m: RegExpExecArray | null;
    JAVA_SIMPLE_NAME_RE.lastIndex = 0;
    while ((m = JAVA_SIMPLE_NAME_RE.exec (source)) !== null) {
        if (m[2] !== undefined) {
            needed.add (JAVA_IMPORTS[m[2]]);
        }
    }
    return Array.from (needed).sort ();
}

// Whole-compilation-unit form: shorten every allow-listed reference and make sure the file
// imports what it now uses. With `importSimpleNames`, allow-listed types the emitter already
// spelled by simple name get their single-type import too (TypedSurface writers). Idempotent.
export function applyJavaImports (source: string, importSimpleNames = false): string {
    const shortened = shortenJavaReferences (source);
    const imports = new Set (shortened.imports);
    if (importSimpleNames) {
        for (const fqn of javaImportsForSimpleNames (shortened.source)) {
            imports.add (fqn);
        }
    }
    return ensureJavaImports (shortened.source, Array.from (imports).sort ());
}
