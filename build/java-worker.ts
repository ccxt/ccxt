import { Transpiler } from 'ast-transpiler';
import { getProgramBatch } from './worker-program-batch.js';
import { patchJavaLocalTypes } from './javaTranspiler.js';
import { installJavaExpressionTypeResolver } from './javaTranspiler.js';
import { installJavaLocalTypes, installJavaNumericLocalTypes, patchJavaLiteralLocalTypes, patchJavaStringReceiverCasts, patchJavaMapChannelStringCasts, patchJavaConsumerStringCasts, installJavaDeclaredLocalTypes, installJavaObjectParamPositions, installJavaStringListParamTypes, installJavaNullScalarLocalTypes, patchJavaOmitLocalTypes, patchJavaQualifiedDtoListElementLocals, patchJavaStringAccumulatorLists, patchJavaTupleHolderElementLocals, patchJavaOrderBookCacheLocals, patchJavaDeclaredMapReceiverCasts, patchJavaBaseMapFieldReceiverCasts, patchJavaFreshMapElementWrites, patchJavaDeclaredBoxLiteralEquality, patchJavaObjectKeysLength, patchJavaMapArgIdentity, patchJavaNonNullStringLocals, patchJavaNonNullLongSubtract, installJavaBooleanParams, installJavaStringDefaultParams, installJavaTuplePairReturns, installJavaStringListArgs, installJavaBooleanFixedParams, installJavaBooleanWriteLocals, installJavaLongSlots, installJavaMapLocals, patchJavaUntilOmitMapWrites, installJavaNativeReplace } from './java-local-types.js';
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
        // same strict effectively-final rule as the main thread's setupTranspiler()
        (cachedTranspiler as any).javaTranspiler.javaStrictEffectivelyFinal = true;
        // same printer hook the main thread installs in setupTranspiler(); the
        // batch below prints through this very javaTranspiler instance
        patchJavaLocalTypes (cachedTranspiler);
        installJavaLocalTypes (cachedTranspiler);
        patchJavaLiteralLocalTypes (cachedTranspiler);
        installJavaNumericLocalTypes (cachedTranspiler);
        // SS-06 / SS-09 / SS-12 cast-removal slices: same order as the main thread's
        // setupTranspiler so both print paths emit byte-identical Java
        patchJavaConsumerStringCasts (cachedTranspiler);
        patchJavaMapChannelStringCasts (cachedTranspiler);
        patchJavaStringReceiverCasts (cachedTranspiler);
        // java-09: last-installed declaration observer (same order as the main thread)
        installJavaDeclaredLocalTypes (cachedTranspiler);
        // hx7 java-03: same row-builder parameter boxing as the main thread's setupTranspiler()
        installJavaObjectParamPositions (cachedTranspiler);
        // java-13: the same printed-Java String proof the main thread installs at the end
        // of setupTranspiler() — both print paths must emit byte-identical Java
        installJavaExpressionTypeResolver (cachedTranspiler);
        installJavaStringListParamTypes (cachedTranspiler);
        installJavaNullScalarLocalTypes (cachedTranspiler);
        patchJavaOmitLocalTypes (cachedTranspiler);
        patchJavaQualifiedDtoListElementLocals (cachedTranspiler);
        patchJavaStringAccumulatorLists (cachedTranspiler);
        patchJavaTupleHolderElementLocals (cachedTranspiler);
        patchJavaOrderBookCacheLocals (cachedTranspiler);
        patchJavaDeclaredMapReceiverCasts (cachedTranspiler);
        patchJavaBaseMapFieldReceiverCasts (cachedTranspiler);
        patchJavaFreshMapElementWrites (cachedTranspiler);
        patchJavaDeclaredBoxLiteralEquality (cachedTranspiler);
        patchJavaObjectKeysLength (cachedTranspiler);
        patchJavaMapArgIdentity (cachedTranspiler);
        patchJavaNonNullStringLocals (cachedTranspiler);
        patchJavaNonNullLongSubtract (cachedTranspiler);
        installJavaBooleanParams (cachedTranspiler);
        installJavaStringDefaultParams (cachedTranspiler);
        installJavaTuplePairReturns (cachedTranspiler);
        installJavaStringListArgs (cachedTranspiler);
        installJavaLongSlots (cachedTranspiler);
        installJavaMapLocals (cachedTranspiler);
        patchJavaUntilOmitMapWrites (cachedTranspiler);
        installJavaBooleanFixedParams (cachedTranspiler);
        installJavaBooleanWriteLocals (cachedTranspiler);
        installJavaNativeReplace (cachedTranspiler);
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
