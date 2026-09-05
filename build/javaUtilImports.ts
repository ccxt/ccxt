// Post-processing shared by every generator that writes Java under java/lib and java/tests
// (build/javaTranspiler.ts, build/generateJavaWrappers.ts, build/generateImplicitAPI.ts).
//
// The ast-transpiler Java printer spells the JDK collection types out in full at every use
// site (`new java.util.HashMap<String, Object>()`, `java.util.List<Object>`,
// `java.util.concurrent.CompletableFuture<Object>`, ...), and the hand-rolled emitters copied
// that habit. Across the generated tree that was ~110k fully-qualified occurrences. This module
// rewrites those references to their simple names and adds the matching single-type `import`
// declarations once at the top of the file instead.
//
// Scope is deliberately a closed allow-list of unambiguous names. A single-type import shadows
// on-demand (`.*`) imports and same-package types (JLS 6.4.1), so the rewrite can only change
// resolution if a nested type of the same simple name is inherited into the class body — none
// of the generated or hand-written classes under java/ declare a type named like any entry
// below (checked by `grep -rE '\b(class|interface|enum|record)\s+(List|Map|...)\b' java/`).
// Wildcard imports are never emitted: they would re-introduce exactly that ambiguity.
//
// The rewrite is source-aware: string / char / text-block literals, `//` and `/* */` comments
// and existing `import` declarations are left untouched, so it is idempotent and cannot
// corrupt an already-shortened file or a literal that happens to mention `java.util`.
const JAVA_UTIL_IMPORTS: Record<string, string> = {
    'ArrayList': 'java.util.ArrayList',
    'Arrays': 'java.util.Arrays',
    'HashMap': 'java.util.HashMap',
    'LinkedHashMap': 'java.util.LinkedHashMap',
    'List': 'java.util.List',
    'Map': 'java.util.Map',
    'CompletableFuture': 'java.util.concurrent.CompletableFuture',
    'Collectors': 'java.util.stream.Collectors',
};

// Group 1: a region that must not be rewritten (literal, comment, import line).
// Group 2: the simple name of an allow-listed fully-qualified reference.
// The alternation is tried left to right at every position, so a literal or comment that
// starts before a qualified name swallows it before the name alternative can match.
const JAVA_SOURCE_TOKEN_RE = new RegExp(
    '("""[\\s\\S]*?"""'                         // text block
    + '|"(?:[^"\\\\\\n]|\\\\.)*"'               // string literal
    + '|\'(?:[^\'\\\\\\n]|\\\\.)*\''            // char literal
    + '|//[^\\n]*'                              // line comment
    + '|/\\*[\\s\\S]*?\\*/'                     // block comment
    + '|^[ \\t]*import[ \\t][^\\n]*)'           // import declaration (already qualified by design)
    + '|\\bjava\\.util\\.(?:concurrent\\.(CompletableFuture)|stream\\.(Collectors)|(ArrayList|Arrays|HashMap|LinkedHashMap|List|Map))\\b',
    'gm'
);

export interface ShortenedJavaSource {
    source: string;
    // fully-qualified names that were shortened at least once, sorted, unique
    imports: string[];
}

// Replace allow-listed `java.util.*` references with their simple names, outside literals,
// comments and import lines. Returns the rewritten source plus the imports it now needs.
export function shortenJavaUtilReferences (source: string): ShortenedJavaSource {
    const needed = new Set<string> ();
    const rewritten = source.replace (JAVA_SOURCE_TOKEN_RE, (match: string, skipped: string | undefined, concurrent: string | undefined, stream: string | undefined, plain: string | undefined) => {
        if (skipped !== undefined) {
            return skipped;
        }
        const simpleName = (concurrent ?? stream ?? plain) as string;
        needed.add (JAVA_UTIL_IMPORTS[simpleName]);
        return simpleName;
    });
    return { source: rewritten, imports: Array.from (needed).sort () };
}

const IMPORT_LINE_RE = /^[ \t]*import[ \t]+(?:static[ \t]+)?([\w.]+(?:\.\*)?)[ \t]*;/gm;
const PACKAGE_LINE_RE = /^[ \t]*package[ \t]+[\w.]+[ \t]*;[^\n]*\n/m;

function isCoveredByExistingImport (fqn: string, existing: Set<string>): boolean {
    if (existing.has (fqn)) {
        return true;
    }
    const pkg = fqn.slice (0, fqn.lastIndexOf ('.'));
    return existing.has (pkg + '.*');
}

// Add `import <fqn>;` for every name in `fqns` that the compilation unit does not already import
// (explicitly or via an on-demand import of the same package). New declarations are appended,
// sorted, directly after the last existing import — or after the `package` line when the file
// has no imports yet — so the output is stable across repeated runs.
export function ensureJavaImports (source: string, fqns: string[]): string {
    const existing = new Set<string> ();
    let lastImportEnd = -1;
    let m: RegExpExecArray | null;
    IMPORT_LINE_RE.lastIndex = 0;
    while ((m = IMPORT_LINE_RE.exec (source)) !== null) {
        existing.add (m[1]);
        lastImportEnd = m.index + m[0].length;
    }
    const missing = fqns.filter ((fqn) => !isCoveredByExistingImport (fqn, existing)).sort ();
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
    const pkg = PACKAGE_LINE_RE.exec (source);
    if (pkg !== null) {
        const cut = pkg.index + pkg[0].length;
        return source.slice (0, cut) + block + '\n' + source.slice (cut);
    }
    return block + '\n' + source;
}

// Whole-compilation-unit form: shorten every allow-listed reference and make sure the file
// imports what it now uses. Idempotent.
export function applyJavaUtilImports (source: string): string {
    const shortened = shortenJavaUtilReferences (source);
    return ensureJavaImports (shortened.source, shortened.imports);
}
