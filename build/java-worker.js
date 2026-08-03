import { Transpiler } from 'ast-transpiler';
import { getProgramBatch } from './worker-program-batch.js';
import log from 'ololog'

// piscina reuses worker threads across tasks — cache the Transpiler per thread
// (construction is expensive: it re-parses the TS lib chain) and rebuild only if
// the config ever changes. The sticky program batch below hangs off this instance,
// so rebuilding the transpiler also drops the cached programs, which is exactly
// what a config change requires.
let cachedTranspiler = null;
let cachedConfigKey = null;
// SourceFile cache built once per worker thread at module scope, deliberately OUTSIDE
// the config-key check: if the config ever changes we rebuild the Transpiler but hand it
// back the same cache, so the already-parsed TS SourceFiles survive and are not re-parsed.
// This is complementary to the sticky ts.Program batch — the cache kills re-parsing, the
// batch kills re-binding/re-checking. Same-thread only: it holds live TS compiler objects
// and must NEVER be posted across threads (structured clone would either throw or
// silently deep-copy it).
let programCache = null;

// Same fix as NewTranspiler.patchJavaPropertyTypes() in build/javaTranspiler.ts, applied here too
// because worker threads construct their OWN Transpiler and never see the main-thread patch —
// CI's pooled path would otherwise silently drift from the main-thread emit.
// ast-transpiler's BaseTranspiler.getType() returns the raw TS type name for a TypeReference
// (`Dict`, `Str`, `Num`, ...), and JavaTranspiler calls it only from printPropertyAccessModifiers(),
// so a TS class field `x: Dict = {}` was emitted as `public Dict x = ...` — javac "cannot find
// symbol". Resolve ccxt TS aliases in field position to DEFAULT_TYPE (`Object`), matching the
// uniformly Object-typed generated Java (a narrower Map<String, Object> breaks on assignment from
// safeValue(), which returns Object).
const patchJavaPropertyTypes = (transpiler) => {
    const javaTranspiler = transpiler?.javaTranspiler;
    if (!javaTranspiler || typeof javaTranspiler.getType !== 'function' || javaTranspiler._propertyTypesPatched) {
        return;
    }
    const originalGetType = javaTranspiler.getType.bind(javaTranspiler);
    javaTranspiler.getType = (node) => {
        const type = originalGetType(node);
        // Only rewrite genuine TypeReference annotations (`x: Dict`). Keyword types
        // (`x: boolean`, `x: string`, `x: any`, `x: string[]`) carry no `typeName` and are already
        // resolved to real Java types — `boolean` is also a key of VariableTypeReplacements, so
        // matching on the name alone would wrongly demote `public boolean verbose` to
        // `public Object verbose`.
        const isTypeReference = node?.type?.typeName !== undefined;
        const tsAliases = javaTranspiler.VariableTypeReplacements ?? {};
        if (isTypeReference && (typeof type === 'string') && Object.prototype.hasOwnProperty.call(tsAliases, type)) {
            return javaTranspiler.DEFAULT_TYPE ?? 'Object';
        }
        return type;
    };
    javaTranspiler._propertyTypesPatched = true;
};

const verbose = !!process.env.CCXT_TRANSPILE_VERBOSE;

export default async ({transpilerConfig, configKey, file, files, roots}) => {
    const key = configKey || JSON.stringify(transpilerConfig);
    if (!cachedTranspiler || cachedConfigKey !== key) {
        if (!programCache) programCache = Transpiler.createProgramCache();
        cachedTranspiler = new Transpiler(transpilerConfig, programCache);
        cachedTranspiler.setVerboseMode(false);
        patchJavaPropertyTypes(cachedTranspiler);
        cachedConfigKey = key;
    }
    const transpiler = cachedTranspiler;
    // work set for THIS task — one file by default
    const filePaths = files ?? [file];

    // ts.Program roots — the FULL file list of the current stage, sent identically on
    // every task, so this thread builds the shared program once and every later
    // one-file task prints straight off its checker (see worker-program-batch.js).
    // Files that import each other (a derived exchange and its parent) are just
    // separate root files of the same program, and the emit is byte-identical to the
    // per-file path.
    const programRoots = (roots && roots.length) ? roots : filePaths;
    const batch = getProgramBatch (transpiler, programRoots, key);

    const result = [];
    for (const filePath of filePaths) {
        if (verbose) {
            log.blue('[worker][java] Transpiling', filePath);
        }
        const transpiled = batch
            ? batch.transpileJavaByPath(filePath)
            : transpiler.transpileJavaByPath(filePath);
        result.push(transpiled);
    }
    return result;
}
