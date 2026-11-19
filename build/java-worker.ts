import { Transpiler } from 'ast-transpiler';
import { getProgramBatch } from './worker-program-batch.js';
import { patchJavaLocalTypes } from './javaTranspiler.js';
import { installJavaExpressionTypeResolver, installJavaOwnerStores, installJavaRepoMethodUses } from './javaTranspiler.js';
import { installJavaLocalTypes, installJavaNumericLocalTypes, patchJavaLiteralLocalTypes, patchJavaStringReceiverCasts, patchJavaMapChannelStringCasts, patchJavaConsumerStringCasts, installJavaDeclaredLocalTypes, installJavaObjectParamPositions, installJavaStringListParamTypes, installJavaNullScalarLocalTypes, patchJavaOmitLocalTypes, patchJavaQualifiedDtoListElementLocals, patchJavaStringAccumulatorLists, patchJavaRowAccumulatorLists, patchJavaTupleHolderElementLocals, patchJavaOrderBookCacheLocals, patchJavaDeclaredMapReceiverCasts, patchJavaBaseMapFieldReceiverCasts, patchJavaFreshMapElementWrites, patchJavaDeclaredBoxLiteralEquality, patchJavaObjectKeysLength, patchJavaMapArgIdentity, patchJavaNonNullStringLocals, patchJavaNonNullLongSubtract, installJavaBooleanParams, installJavaStringDefaultParams, installJavaTuplePairReturns, installJavaStringListArgs, installJavaBooleanFixedParams, installJavaBooleanWriteLocals, installJavaLongSlots, installJavaMapLocals, patchJavaUntilOmitMapWrites, installJavaNativeReplace, installJavaStringReturnSites } from './java-local-types.js';
import { javaCoreSetHandedSpellings } from './java-local-types.js';
import { installJavaFreshObjectMapWrites } from './java-local-types.js';
import { installJavaStringCoreArgs } from './java-local-types.js';
import { installJavaNativePadStartFirst, installJavaLiteralReplace } from './java-local-types.js';
import { installJavaCounterTypes } from './java-local-types.js';
import { installJavaMapLocalTypes } from './java-local-types.js';
import { installJavaParamTypes } from './java-local-types.js';
import { installJavaMapArgAlreadyTyped } from './java-local-types.js';
import { installJavaTypedBaseFields } from './java-local-types.js';
import { installJavaListLocals } from './java-local-types.js';
import { installJavaJ8CopyLocals } from './java-local-types.js';
import { installJavaR84j1StringElementLocals, installJavaR84j1BoxElementLocals } from './java-local-types.js';
import { installJavaR84j2ContainerLocals } from './java-local-types.js';
import { installJavaR84j2GuardedListLocals } from './java-local-types.js';
import { installJavaR84j2MapConditionalLocals } from './java-local-types.js';
import { installJavaR84j8Locals } from './java-local-types.js';
import { installJavaR87j2WsLocals } from './java-local-types.js';
import { installJavaR87j2UrlLocals } from './java-local-types.js';
import { installJavaR87j3SumCounterLocals } from './java-local-types.js';
import { installJavaR90j3NativeSumLocals } from './java-local-types.js';
import { installJavaR90j3CounterLoops } from './java-local-types.js';
import { installJavaR87j4SplitLists } from './java-local-types.js';
import { installJavaR87j5CalleeStringArgs } from './java-local-types.js';
import { installJavaR87j8CopyStringResolver } from './java-local-types.js';
import { installJavaR90j2ElementListLocals } from './java-local-types.js';
import { installJavaR90j2PromiseAllLocals } from './java-local-types.js';
import { installJavaR90j2ElementMapLocals } from './java-local-types.js';
import { installJavaR90j6StringListReaders } from './java-local-types.js';
import { installJavaR90j6AsStringListReaders } from './java-local-types.js';
import { installJavaR90j6PairLocals } from './java-local-types.js';
import { installJavaR90j6ListCopyLocals } from './java-local-types.js';
import { installJavaR90j7MapDelete } from './java-local-types.js';
import { installJavaR92j3LongDefaultParams } from './java-local-types.js';
import { installJavaR92j3LongFixedParams } from './java-local-types.js';
import { installJavaR92j3ParseToIntCompare } from './java-local-types.js';
import { installJavaR92j3SafeIntegerOperands } from './java-local-types.js';
import { installJavaR92j3HexStringCalls } from './java-local-types.js';
import { installJavaR90j8OmitParamLocals } from './java-local-types.js';
import { installJavaR92j1AssertedStringLocals } from './java-local-types.js';
import { installJavaR92j1StringRowLocals } from './java-local-types.js';
import { installJavaR92j2MarketTypeParams, installJavaTypedDefaultReaders } from './java-local-types.js';
import { installJavaR92j2MapSlotHandOff } from './java-local-types.js';
import { installJavaR92j2StringSlotLocals } from './java-local-types.js';
import { installJavaR93j2ListLocals } from './java-local-types.js';
import { installJavaScalarLocals } from './java-local-types.js';
import { installJavaStringReturns } from './java-local-types.js';
import { installJavaR77j2ConditionalLocals } from './java-local-types.js';
import { installJ6ReaderLocals } from './java-local-types.js';
import { installJ84j6TrueOnlyLocals } from './java-local-types.js';
import { installJ84j6StringListLocals } from './java-local-types.js';
import { installJavaPredictionMapLocals } from './java-local-types.js';
import { installJavaListParamSlots } from './java-local-types.js';
import { installJavaEventsParamsSlots, installJavaCurrenciesByIdReads, installJavaSourceExchangeReads, installJavaTypedOrderbooksField, installJavaNullSeedStructureLocals } from './java-local-types.js';
import { installJavaNonNullMapPuts } from './java-local-types.js';
import { installJavaLocalElementWrites } from './java-local-types.js';
import { installJavaStringListIndexOf } from './java-local-types.js';
import { installJavaMapCopyLocals } from './java-local-types.js';
import log from 'ololog'
import { readFileSync, existsSync } from 'fs';
import { dirname, resolve as resolvePath } from 'path';


// per-thread, per-Transpiler: exchange files already printed once (declaration records are warm), and the
// outputs of stage files printed early as another file's dependency
const threadPrints = new WeakMap<object, { printed: Set<string>, kept: Map<string, any> }> ();

const EXCHANGE_IMPORT = /^import\s+(?:[\w$]+|\{[^}]*\})\s+from\s+'(\.{1,2}\/(?!base\/|abstract\/|test\/|ws\/)[\w-]+)\.js';/gm;
const dependencyCache = new Map<string, string[]> ();

// only the generated venue tiers (ts/src/<id>.ts, ts/src/pro/<id>.ts, ts/src/prediction/<id>.ts) are warmed;
// test files and the base tier print exactly as before
const VENUE_FILE = /(^|[\\/])ts[\\/]src[\\/](?:pro[\\/]|prediction[\\/])?[a-z0-9_]+\.ts$/;

// the exchange modules `file` imports (ts/src/<id>.ts from a pro tier, the parent class of a derived
// venue), transitively, dependencies before dependents
function javaExchangeDependencies (file: string): string[] {
    const cached = dependencyCache.get (file);
    if (cached !== undefined) {
        return cached;
    }
    const ordered: string[] = [];
    const seen = new Set<string> ([ file ]);
    const visit = (current: string) => {
        let text: string;
        try {
            text = readFileSync (current, 'utf8');
        } catch (e) {
            return;
        }
        for (const match of text.matchAll (EXCHANGE_IMPORT)) {
            const dependency = resolvePath (dirname (current), match[1] + '.ts');
            if (seen.has (dependency) || !VENUE_FILE.test (dependency) || !existsSync (dependency)) {
                continue;
            }
            seen.add (dependency);
            visit (dependency);
            ordered.push (dependency);
        }
    };
    visit (file);
    dependencyCache.set (file, ordered);
    return ordered;
}

// task payload posted by javaTranspiler.ts#webworkerTranspile (structured clone)
interface JavaWorkerTask {
    transpilerConfig: any;
    configKey?: string;
    file?: string;
    files?: string[];
    roots?: string[];
    handed?: Record<string, Record<string, string[]>>;
    handedKey?: string;
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

export default async ({ transpilerConfig, configKey, file, files, roots, handed, handedKey }: JavaWorkerTask) => {
    javaCoreSetHandedSpellings (handedKey ?? '', handed);
    const key = configKey || JSON.stringify (transpilerConfig);
    if (!cachedTranspiler || cachedConfigKey !== key) {
        if (!programCache) programCache = Transpiler.createProgramCache ();
        cachedTranspiler = new Transpiler (transpilerConfig, programCache);
        cachedTranspiler.setVerboseMode (false);
        // same strict effectively-final rule as the main thread's setupTranspiler()
        (cachedTranspiler as any).javaTranspiler.javaStrictEffectivelyFinal = true;
        installJavaOwnerStores (cachedTranspiler);
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
        // Same row-builder parameter boxing as the main thread's setupTranspiler()
        installJavaObjectParamPositions (cachedTranspiler);
        // java-13: the same printed-Java String proof the main thread installs at the end
        // of setupTranspiler() — both print paths must emit byte-identical Java
        installJavaExpressionTypeResolver (cachedTranspiler);
        installJavaStringListParamTypes (cachedTranspiler);
        installJavaNullScalarLocalTypes (cachedTranspiler);
        patchJavaOmitLocalTypes (cachedTranspiler);
        patchJavaQualifiedDtoListElementLocals (cachedTranspiler);
        patchJavaStringAccumulatorLists (cachedTranspiler);
        patchJavaRowAccumulatorLists (cachedTranspiler);
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
        installJavaStringReturnSites (cachedTranspiler);
        installJavaFreshObjectMapWrites (cachedTranspiler);
        installJavaStringCoreArgs (cachedTranspiler);
        installJavaNativePadStartFirst (cachedTranspiler);
        installJavaLiteralReplace (cachedTranspiler);
        installJavaCounterTypes (cachedTranspiler);
        installJavaMapLocalTypes (cachedTranspiler);
        installJavaParamTypes (cachedTranspiler);
        installJavaMapArgAlreadyTyped (cachedTranspiler);
        installJavaRepoMethodUses (cachedTranspiler);
        installJavaListLocals (cachedTranspiler);
        installJavaScalarLocals (cachedTranspiler);
        installJavaStringReturns (cachedTranspiler);
        installJavaR77j2ConditionalLocals (cachedTranspiler);
        installJ6ReaderLocals (cachedTranspiler);
        installJavaJ8CopyLocals (cachedTranspiler);
        installJavaR84j1StringElementLocals (cachedTranspiler);
        installJavaR84j1BoxElementLocals (cachedTranspiler);
        installJavaR84j2ContainerLocals (cachedTranspiler);
        installJavaR84j2GuardedListLocals (cachedTranspiler);
        installJavaR84j2MapConditionalLocals (cachedTranspiler);
        installJ84j6TrueOnlyLocals (cachedTranspiler);
        installJ84j6StringListLocals (cachedTranspiler);
        installJavaR84j8Locals (cachedTranspiler);
        installJavaR87j2WsLocals (cachedTranspiler);
        installJavaR87j2UrlLocals (cachedTranspiler);
        installJavaR87j3SumCounterLocals (cachedTranspiler);
        installJavaR87j4SplitLists (cachedTranspiler);
        installJavaR87j5CalleeStringArgs (cachedTranspiler);
        installJavaR87j8CopyStringResolver (cachedTranspiler);
        installJavaR90j2ElementListLocals (cachedTranspiler);
        installJavaR90j2PromiseAllLocals (cachedTranspiler);
        installJavaR90j2ElementMapLocals (cachedTranspiler);
        installJavaR90j3NativeSumLocals (cachedTranspiler);
        installJavaR90j3CounterLoops (cachedTranspiler);
        installJavaR90j6StringListReaders (cachedTranspiler);
        installJavaR90j6AsStringListReaders (cachedTranspiler);
        installJavaR90j6PairLocals (cachedTranspiler);
        installJavaR90j6ListCopyLocals (cachedTranspiler);
        installJavaR90j7MapDelete (cachedTranspiler);
        installJavaR92j3LongDefaultParams (cachedTranspiler);
        installJavaR92j3LongFixedParams (cachedTranspiler);
        installJavaR92j3ParseToIntCompare (cachedTranspiler);
        installJavaR92j3SafeIntegerOperands (cachedTranspiler);
        installJavaR92j3HexStringCalls (cachedTranspiler);
        installJavaR90j8OmitParamLocals (cachedTranspiler);
        installJavaR92j1AssertedStringLocals (cachedTranspiler);
        installJavaR92j1StringRowLocals (cachedTranspiler);
        installJavaR92j2MarketTypeParams (cachedTranspiler);
        installJavaTypedDefaultReaders (cachedTranspiler);
        installJavaR92j2MapSlotHandOff (cachedTranspiler);
        installJavaR92j2StringSlotLocals (cachedTranspiler);
        installJavaR93j2ListLocals (cachedTranspiler);
        installJavaPredictionMapLocals (cachedTranspiler);
        installJavaListParamSlots (cachedTranspiler);
        installJavaTypedBaseFields (cachedTranspiler);
        installJavaNonNullMapPuts (cachedTranspiler);
        installJavaLocalElementWrites (cachedTranspiler);
        installJavaStringListIndexOf (cachedTranspiler);
        installJavaMapCopyLocals (cachedTranspiler);
        installJavaEventsParamsSlots (cachedTranspiler);
        installJavaCurrenciesByIdReads (cachedTranspiler);
        installJavaSourceExchangeReads (cachedTranspiler);
        installJavaTypedOrderbooksField (cachedTranspiler);
        installJavaNullSeedStructureLocals (cachedTranspiler);
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
        // The printer answers "what type did that callee's local/return print as"
        // from records made while a file is printed. A venue file therefore printed differently
        // depending on whether its parent/REST tier had been printed earlier in the same worker thread,
        // which is piscina scheduling, so identical builds drifted by a few Object locals. Print every
        // imported venue file (ancestors first) before the file itself, once per thread. A dependency
        // this stage also prints is kept and handed back when its own task arrives, so no file is ever
        // printed twice (a second print sees its own records and is not the canonical print).
        const print = (f: string) => (batch ? batch.transpileJavaByPath (f) : transpiler.transpileJavaByPath (f));
        if (!VENUE_FILE.test (filePath)) {
            result.push (print (filePath));
            continue;
        }
        // the printer's records hang off declaration nodes of ONE ts.Program: key the bookkeeping by the
        // program batch (REST and WS stages build different programs on the same thread, and a REST file
        // printed in the REST stage left no records for the WS program)
        const owner: object = (batch as any) ?? transpiler;
        let state = threadPrints.get (owner);
        if (state === undefined) {
            state = { printed: new Set<string> (), kept: new Map<string, any> () };
            threadPrints.set (owner, state);
        }
        const stageFiles = new Set<string> (programRoots.map ((f: string) => resolvePath (f)));
        for (const dependency of javaExchangeDependencies (filePath)) {
            if (state.printed.has (dependency)) {
                continue;
            }
            const output = print (dependency);
            state.printed.add (dependency);
            if (stageFiles.has (dependency)) {
                state.kept.set (dependency, output);
            }
        }
        const absolute = resolvePath (filePath);
        const early = state.kept.get (absolute);
        if (early !== undefined) {
            state.kept.delete (absolute);
            result.push (early);
        } else {
            result.push (print (filePath));
            state.printed.add (absolute);
        }
    }
    return result;
}
