// Sticky ts.Program batches for the piscina transpile workers.
//
// Every transpile*ByPath call builds a ts.Program rooted at [file, globalsShim].
// The Transpiler's SourceFile cache already makes the ~340-file import closure
// parse-free after the first file, but the bind/check work behind
// getPreEmitDiagnostics is redone for every root set. createProgramBatch pays it
// once for a whole set of roots and then prints any of them off the same checker.
//
// The drivers therefore hand every task the FULL file list of the current stage as
// `roots` while keeping the task's work set at one file, so:
//   - piscina still load-balances at one-file granularity (a slow exchange cannot
//     stall a multi-file chunk), and
//   - each worker thread builds the shared Program exactly once and reuses it for
//     every subsequent file of that stage.
//
// The cache is keyed by (configKey, roots) rather than being a single slot because
// the drivers run independent stages concurrently (C#'s transpileTests fires base
// tests, exchange tests and ws exchange tests through Promise.all), so tasks from
// two different root sets interleave on the same thread. A single slot would
// rebuild the Program on every alternation — strictly worse than not caching.
//
// A ts.Program (and its checker) is expensive to keep alive, so the cache is a
// tiny LRU: enough to cover the concurrent stages, not enough to retain every
// program a thread ever built.
const MAX_CACHED_BATCHES = Number (process.env.CCXT_TRANSPILE_BATCH_CACHE) || 3;

const verbose = !!process.env.CCXT_TRANSPILE_VERBOSE;

// key -> { transpiler, batch }; Map iteration order is insertion order, which is
// what makes the delete/set dance below a real LRU
const cache = new Map ();

function batchKey (configKey, roots) {
    // roots arrive as a fresh array on every task (structured clone), so identity
    // cannot be used — compare by content. Joining ~130 paths costs a few
    // microseconds against a multi-second program build.
    return configKey + '\u0000' + roots.join ('\u0000');
}

/**
 * Return a ts.Program batch covering `roots`, reusing the one this thread already
 * built when the roots and the transpiler instance are unchanged.
 * Returns null when the installed ast-transpiler has no createProgramBatch, so
 * callers fall back to the per-file transpile*ByPath path.
 */
export function getProgramBatch (transpiler, roots, configKey) {
    if (typeof transpiler.createProgramBatch !== 'function') {
        return null;
    }
    if (!roots || roots.length === 0) {
        return null;
    }
    const key = batchKey (configKey, roots);
    const cached = cache.get (key);
    // the transpiler is rebuilt when the parser config changes; a batch holds a
    // checker wired to the instance that created it, so never cross the two
    if (cached && cached.transpiler === transpiler) {
        cache.delete (key);
        cache.set (key, cached);
        return cached.batch;
    }
    const batch = transpiler.createProgramBatch (roots);
    if (verbose) {
        // one line per thread per stage — if this fires once per FILE the roots are not
        // being kept identical across tasks and the sticky reuse has been lost
        console.error ('[worker][program-batch] built ts.Program over', roots.length, 'roots');
    }
    cache.set (key, { 'transpiler': transpiler, 'batch': batch });
    while (cache.size > MAX_CACHED_BATCHES) {
        cache.delete (cache.keys ().next ().value);
    }
    return batch;
}

export default getProgramBatch;
