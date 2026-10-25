import { Transpiler } from 'ast-transpiler';
import { getProgramBatch } from './worker-program-batch.js';
import { installCcxtGoLocalTypes, installCcxtGoIndexableTypes } from './go-local-types.js';
import { installCcxtGoParamTypes } from './hx10w3-G08.js';
import { installCcxtGoDictParams } from './hx10w8-GB01.js';
import { installCcxtGoGb05ParamTypes } from './hx10w8-GB05.js';
import { installCcxtGoGb11HandleErrorsCode } from './hx10w9-GB11.js';
import log from 'ololog'

// task payload posted by goTranspiler.ts#webworkerTranspile (structured clone)
interface GoWorkerTask {
    transpilerConfig: any;
    configKey?: string;
    file?: string;
    files?: string[];
    roots?: string[];
}

// exchange -> method -> raw leading comment, collected while printing
type GoComments = { [exchange: string]: { [method: string]: string } };

let cachedTranspiler: Transpiler | null = null;
let cachedConfigKey: string | null = null;
let goComments: GoComments = {};
let programCache: ReturnType<typeof Transpiler.createProgramCache> | null = null;

function transformLeadingComment (comment: string): string {
    const commentNameRegex = /@name\s(\w+)#(\w+)/;
    const nameMatches = comment.match (commentNameRegex);
    const exchangeName = nameMatches ? nameMatches[1] : undefined;
    if (!exchangeName) {
        return comment;
    }
    const methodName = (nameMatches as RegExpMatchArray)[2];
    let exchangeMethods = goComments[exchangeName];
    if (!exchangeMethods) {
        exchangeMethods = goComments[exchangeName] = {};
    }
    exchangeMethods[methodName] = comment;
    return comment;
}

const verbose = !!process.env['CCXT_TRANSPILE_VERBOSE'];

export default async ({ transpilerConfig, configKey, file, files, roots }: GoWorkerTask) => {
    const key = configKey || JSON.stringify (transpilerConfig);
    if (!cachedTranspiler || cachedConfigKey !== key) {
        if (!programCache) {
            programCache = Transpiler.createProgramCache ();
        }
        cachedTranspiler = new Transpiler (transpilerConfig, programCache);
        cachedTranspiler.setVerboseMode (false);
        cachedTranspiler.goTranspiler.transformLeadingComment = transformLeadingComment;
        installCcxtGoLocalTypes(cachedTranspiler.goTranspiler, transpilerConfig?.go?.unifiedInt64Params);
        installCcxtGoIndexableTypes(cachedTranspiler.goTranspiler);
        installCcxtGoParamTypes(cachedTranspiler.goTranspiler);
        installCcxtGoDictParams(cachedTranspiler.goTranspiler);
        installCcxtGoGb05ParamTypes(cachedTranspiler.goTranspiler);
        installCcxtGoGb11HandleErrorsCode(cachedTranspiler.goTranspiler);
        cachedConfigKey = key;
    }
    const transpiler = cachedTranspiler;
    // accept either the legacy single-file payload or a multi-file chunk
    const filePaths: string[] = files ?? [ file as string ];

    // ts.Program roots — the FULL file list of the current stage, sent identically on
    // every task, so this thread builds the shared program once and every later
    // one-file task prints straight off its checker (see worker-program-batch.ts).
    // Every transpileGoByPath otherwise builds a program over [file, globalsShim]:
    // the SourceFile cache already makes the ~340-file import closure parse-free, but
    // the bind/check work behind getPreEmitDiagnostics is redone per root set.
    // Files that import each other (a derived exchange and its parent) are just
    // separate root files of the same program, and the emit is byte-identical to the
    // per-file path.
    const programRoots = (roots && roots.length) ? roots : filePaths;
    const batch = getProgramBatch (transpiler, programRoots, key);

    const result: any[] = [];
    for (const filePath of filePaths) {
        if (verbose) {
            log.blue ('[worker][go] Transpiling', filePath);
        }
        result.push (batch ? batch.transpileGoByPath (filePath) : transpiler.transpileGoByPath (filePath));
    }
    // the comments collected by transformLeadingComment during this task, keyed
    // exchange -> method, so one merge per task is equivalent to one per file
    const comments = goComments;
    goComments = {};
    return { files: result, file: result[0], goComments: comments };
}
