import { Transpiler } from 'ast-transpiler';
import log from 'ololog'

// Piscina reuses worker threads across tasks — cache the Transpiler per thread
// (construction is expensive: it re-parses the TS lib chain) and rebuild only if
// the config ever changes. One Transpiler is reused across the many one-file tasks
// a thread serves; the rebuilt ast-transpiler dist resets its per-file emit state
// (restoreFinalVarMutations) so a warm instance emits byte-identical Java.
let cachedTranspiler = null;
let cachedConfigKey = null;

const verbose = !!process.env.CCXT_TRANSPILE_VERBOSE;

export default async ({transpilerConfig, configKey, files}) => {
    const key = configKey || JSON.stringify(transpilerConfig);
    if (!cachedTranspiler || cachedConfigKey !== key) {
        cachedTranspiler = new Transpiler(transpilerConfig);
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
