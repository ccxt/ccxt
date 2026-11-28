// Import collapsing for generated Java (javaTranspiler.ts, generateJavaWrappers.ts, generateImplicitAPI.ts):
// rewrites a closed allow-list of unambiguous qualified names (no java/ type shares a simple name;
// wildcards never emitted) to simple names plus single-type imports, outside literals/comments/imports.
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

// JDK types the printer already spells by SIMPLE name (it never qualifies them), so the
// qualified-name collapse above never sees them and applyJavaImports must import them on sight.
// e.g. a local typed by a base method that returns java.math.BigInteger (modPow).
export const JAVA_BARE_SIMPLE_IMPORTS: Record<string, string> = {
    'BigInteger': 'java.math.BigInteger',
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
    'OpenInterests', 'Option', 'OptionChain', 'Order', 'OrderBook', 'OrderBookL3', 'OrderBooks', 'Pair', 'Position',
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

// Native body of `Helpers.toTypedList` for a statically known element type; `List<?>` because
// the raw future may already be typed (`List<Order>`), from which `List<Object>` is inconvertible.
export function nativeTypedList (elementType: string, rawVar = 'res'): string {
    return `((java.util.List<?>) ${rawVar}).stream().map(${elementType}::new).collect(java.util.stream.Collectors.toList())`;
}

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

// Add `import <fqn>;` for every name not already imported (explicitly, on demand, or own package),
// sorted, after the last import or else after the `package` line.
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
    for (const fqn of javaBareSimpleImports (shortened.source)) {
        imports.add (fqn);
    }
    return ensureJavaImports (shortened.source, Array.from (imports).sort ());
}

// Group 1: a skipped region. Group 2: a JAVA_BARE_SIMPLE_IMPORTS name used as a type.
const JAVA_BARE_SIMPLE_NAME_RE = new RegExp (
    '(' + SKIPPED_REGION_PATTERN + ')'
    + '|(?<![\\w.])(' + Object.keys (JAVA_BARE_SIMPLE_IMPORTS).join ('|') + ')\\b',
    'gm'
);

// Imports for the JDK types the printer emits by simple name only (see JAVA_BARE_SIMPLE_IMPORTS).
function javaBareSimpleImports (source: string): string[] {
    const needed = new Set<string> ();
    let m: RegExpExecArray | null;
    JAVA_BARE_SIMPLE_NAME_RE.lastIndex = 0;
    while ((m = JAVA_BARE_SIMPLE_NAME_RE.exec (source)) !== null) {
        if (m[2] !== undefined) {
            needed.add (JAVA_BARE_SIMPLE_IMPORTS[m[2]]);
        }
    }
    return Array.from (needed).sort ();
}
