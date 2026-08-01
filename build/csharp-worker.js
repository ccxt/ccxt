import { Transpiler } from 'ast-transpiler';
import { setupCsharpPrinter } from './csharpPrinterSetup.js';
import { getProgramBatch } from './worker-program-batch.js';
import log from 'ololog'

// piscina reuses worker threads across tasks — cache the Transpiler per thread
// (construction is expensive) and rebuild only if the config ever changes
let cachedTranspiler = null;
let cachedConfigKey = null;
let rawComments = [];

const verbose = !!process.env.CCXT_TRANSPILE_VERBOSE;

export default async ({transpilerConfig, configKey, file, files, roots}) => {
    const key = configKey || JSON.stringify(transpilerConfig);
    if (!cachedTranspiler || cachedConfigKey !== key) {
        cachedTranspiler = new Transpiler(transpilerConfig);
        setupCsharpPrinter(cachedTranspiler);
        // the main thread turns these into C# doc comments — collect the raw ones and let
        // it replay its own transform so the wrapper docs stay identical
        cachedTranspiler.csharpTranspiler.transformLeadingComment = (comment) => {
            rawComments.push(comment);
            return comment;
        };
        cachedConfigKey = key;
    }
    const transpiler = cachedTranspiler;
    rawComments = [];

    // work set for THIS task — one file by default
    const filePaths = files ?? [file];
    // ts.Program roots — the whole stage, identical on every task, so the batch this
    // thread builds on its first task is reused for all the rest (see
    // worker-program-batch.js). Falls back to the task's own files when the driver
    // did not send roots (older payload shape).
    const programRoots = (roots && roots.length) ? roots : filePaths;
    const batch = getProgramBatch (transpiler, programRoots, key);

    const result = [];
    for (const filePath of filePaths) {
        if (verbose) {
            log.blue('[worker][csharp] Transpiling', filePath);
        }
        const transpiled = batch
            ? batch.transpileCSharpByPath(filePath)
            : transpiler.transpileCSharpByPath(filePath);
        result.push(transpiled);
    }
    return { result, comments: rawComments };
}
