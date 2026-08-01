import { Transpiler } from 'ast-transpiler';
import { getProgramBatch } from './worker-program-batch.js';
import log from 'ololog'

// piscina reuses worker threads across tasks — cache the Transpiler per thread
// (construction is expensive) and rebuild only if the config ever changes. The
// sticky program batch below hangs off this instance, so rebuilding the transpiler
// also drops the cached programs, which is exactly what a config change requires.
let cachedTranspiler = null;
let cachedConfigKey = null;

const verbose = !!process.env.CCXT_TRANSPILE_VERBOSE;

export default async ({transpilerConfig, configKey, file, files, roots}) => {
    const key = configKey || JSON.stringify(transpilerConfig);
    if (!cachedTranspiler || cachedConfigKey !== key) {
        cachedTranspiler = new Transpiler(transpilerConfig);
        cachedConfigKey = key;
    }
    const transpiler = cachedTranspiler;
    // work set for THIS task — one file by default
    const filePaths = files ?? [file];

    // ts.Program roots — the FULL file list of the current stage, sent identically on
    // every task, so this thread builds the shared program once and every later
    // one-file task prints straight off its checker (see worker-program-batch.js).
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
