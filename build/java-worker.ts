import { Transpiler } from 'ast-transpiler';
import { getProgramBatch } from './worker-program-batch.js';
import { patchJavaLocalTypes } from './javaTranspiler.js';
import log from 'ololog'

// task payload posted by javaTranspiler.ts#webworkerTranspile (structured clone)
interface JavaWorkerTask {
    transpilerConfig: any;
    configKey?: string;
    file?: string;
    files?: string[];
    roots?: string[];
}

// piscina reuses worker threads across tasks — cache the Transpiler per thread
// (construction is expensive: it re-parses the TS lib chain) and rebuild only if
// the config ever changes. The sticky program batch below hangs off this instance,
// so rebuilding the transpiler also drops the cached programs, which is exactly
// what a config change requires.
let cachedTranspiler: Transpiler | null = null;
let cachedConfigKey: string | null = null;
// SourceFile cache built once per worker thread at module scope, deliberately OUTSIDE
// the config-key check: if the config ever changes we rebuild the Transpiler but hand it
// back the same cache, so the already-parsed TS SourceFiles survive and are not re-parsed.
// This is complementary to the sticky ts.Program batch — the cache kills re-parsing, the
// batch kills re-binding/re-checking. Same-thread only: it holds live TS compiler objects
// and must NEVER be posted across threads (structured clone would either throw or
// silently deep-copy it).
let programCache: ReturnType<typeof Transpiler.createProgramCache> | null = null;

const verbose = !!process.env['CCXT_TRANSPILE_VERBOSE'];

export default async ({ transpilerConfig, configKey, file, files, roots }: JavaWorkerTask) => {
    const key = configKey || JSON.stringify (transpilerConfig);
    if (!cachedTranspiler || cachedConfigKey !== key) {
        if (!programCache) programCache = Transpiler.createProgramCache ();
        cachedTranspiler = new Transpiler (transpilerConfig, programCache);
        cachedTranspiler.setVerboseMode (false);
        // same printer hook the main thread installs in setupTranspiler(); the
        // batch below prints through this very javaTranspiler instance
        patchJavaLocalTypes (cachedTranspiler);
        cachedConfigKey = key;
    }
    const transpiler = cachedTranspiler;
    // work set for THIS task — one file by default
    const filePaths: string[] = files ?? [ file as string ];

    // ts.Program roots — the FULL file list of the current stage, sent identically on
    // every task, so this thread builds the shared program once and every later
    // one-file task prints straight off its checker (see worker-program-batch.ts).
    // Files that import each other (a derived exchange and its parent) are just
    // separate root files of the same program, and the emit is byte-identical to the
    // per-file path.
    const programRoots = (roots && roots.length) ? roots : filePaths;
    const batch = getProgramBatch (transpiler, programRoots, key);

    const result: any[] = [];
    for (const filePath of filePaths) {
        if (verbose) {
            log.blue ('[worker][java] Transpiling', filePath);
        }
        const transpiled = batch
            ? batch.transpileJavaByPath (filePath)
            : transpiler.transpileJavaByPath (filePath);
        result.push (transpiled);
    }
    return result;
}
