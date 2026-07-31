import { Transpiler } from 'ast-transpiler';
import { setupCsharpPrinter } from './csharpPrinterSetup.js';
import log from 'ololog'

// piscina reuses worker threads across tasks — cache the Transpiler per thread
// (construction is expensive) and rebuild only if the config ever changes
let cachedTranspiler = null;
let cachedConfigKey = null;
let rawComments = [];

const verbose = !!process.env.CCXT_TRANSPILE_VERBOSE;

export default async ({transpilerConfig, configKey, files}) => {
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

    const result = [];
    for (const filePath of files) {
        if (verbose) {
            log.blue('[worker][csharp] Transpiling', filePath);
        }
        const transpiled = transpiler.transpileCSharpByPath(filePath);
        result.push(transpiled);
    }
    return { result, comments: rawComments };
}
