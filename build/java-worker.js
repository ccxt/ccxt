import { Transpiler } from 'ast-transpiler';
import log from 'ololog'

// Piscina reuses worker threads across tasks — cache the Transpiler per thread
// (construction is expensive: it re-parses the TS lib chain) and rebuild only if
// the config ever changes. One Transpiler is reused across the many one-file tasks
// a thread serves; the rebuilt ast-transpiler dist resets its per-file emit state
// (restoreFinalVarMutations) so a warm instance emits byte-identical Java.
let cachedTranspiler = null;
let cachedConfigKey = null;
// Program cache built once per worker thread at module scope, deliberately OUTSIDE the
// config-key check: if the config ever changes we rebuild the Transpiler but hand it back
// the same cache, so the already-parsed TS SourceFiles survive and are not re-parsed.
// Same-thread only — it holds live TS compiler objects and must NEVER be posted across
// threads (structured clone would either throw or silently deep-copy it).
let programCache = null;

const verbose = !!process.env.CCXT_TRANSPILE_VERBOSE;

export default async ({transpilerConfig, configKey, files}) => {
    const key = configKey || JSON.stringify(transpilerConfig);
    if (!cachedTranspiler || cachedConfigKey !== key) {
        if (!programCache) programCache = Transpiler.createProgramCache();
        cachedTranspiler = new Transpiler(transpilerConfig, programCache);
        cachedTranspiler.setVerboseMode(false);
        cachedConfigKey = key;
    }
    const transpiler = cachedTranspiler;

    const result = [];
    // Multi-file task: compile the whole chunk as ONE ts.Program instead of one
    // program per file. Every transpileJavaByPath builds a program over
    // [file, globalsShim]; the SourceFile cache already makes the ~340-file import
    // closure parse-free, but the bind/check work behind getPreEmitDiagnostics is
    // redone per file. createProgramBatch pays it once for the chunk. The batch is
    // scoped to this task on this thread — a live ts.Program must never cross a
    // worker boundary. Files that import each other (a derived exchange and its
    // parent) are just separate root files of the same program, and the emit is
    // byte-identical to the per-file path.
    const batch = (files.length > 1 && typeof transpiler.createProgramBatch === 'function')
        ? transpiler.createProgramBatch(files)
        : null;
    for (const filePath of files) {
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
