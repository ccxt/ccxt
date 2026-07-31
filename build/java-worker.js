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
    for (const filePath of files) {
        if (verbose) {
            log.blue('[worker][java] Transpiling', filePath);
        }
        const transpiled = transpiler.transpileJavaByPath(filePath);
        result.push(transpiled);
    }
    return result;
}
