import { Transpiler } from 'ast-transpiler';
import { getProgramBatch } from './worker-program-batch.js';
import log from 'ololog'

let cachedTranspiler = null;
let cachedConfigKey = null;
let goComments = {};

function transformLeadingComment (comment) {
    const commentNameRegex = /@name\s(\w+)#(\w+)/;
    const nameMatches = comment.match(commentNameRegex);
    const exchangeName = nameMatches ? nameMatches[1] : undefined;
    if (!exchangeName) {
        return comment;
    }
    const methodName = nameMatches[2];
    let exchangeMethods = goComments[exchangeName];
    if (!exchangeMethods) {
        exchangeMethods = goComments[exchangeName] = {};
    }
    exchangeMethods[methodName] = comment;
    return comment;
}

const verbose = !!process.env.CCXT_TRANSPILE_VERBOSE;

export default async ({transpilerConfig, configKey, file, files, roots}) => {
    const key = configKey || JSON.stringify(transpilerConfig);
    if (!cachedTranspiler || cachedConfigKey !== key) {
        cachedTranspiler = new Transpiler(transpilerConfig);
        cachedTranspiler.setVerboseMode(false);
        cachedTranspiler.goTranspiler.transformLeadingComment = transformLeadingComment;
        cachedConfigKey = key;
    }
    const transpiler = cachedTranspiler;
    // accept either the legacy single-file payload or a multi-file chunk
    const filePaths = files ?? [file];

    // ts.Program roots — the FULL file list of the current stage, sent identically on
    // every task, so this thread builds the shared program once and every later
    // one-file task prints straight off its checker (see worker-program-batch.js).
    // Every transpileGoByPath otherwise builds a program over [file, globalsShim]:
    // the SourceFile cache already makes the ~340-file import closure parse-free, but
    // the bind/check work behind getPreEmitDiagnostics is redone per root set.
    // Files that import each other (a derived exchange and its parent) are just
    // separate root files of the same program, and the emit is byte-identical to the
    // per-file path.
    const programRoots = (roots && roots.length) ? roots : filePaths;
    const batch = getProgramBatch (transpiler, programRoots, key);

    const result = [];
    for (const filePath of filePaths) {
        if (verbose) {
            log.blue('[worker][go] Transpiling', filePath);
        }
        result.push(batch ? batch.transpileGoByPath(filePath) : transpiler.transpileGoByPath(filePath));
    }
    // the comments collected by transformLeadingComment during this task, keyed
    // exchange -> method, so one merge per task is equivalent to one per file
    const comments = goComments;
    goComments = {};
    return { files: result, file: result[0], goComments: comments };
}
