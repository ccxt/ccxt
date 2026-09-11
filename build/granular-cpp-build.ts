import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import log from 'ololog';

// granular-cpp-build.ts — the C++ mirror of build/granular-go-build.ts.
//
// The full C++ port compiles 104 per-exchange TUs (each one includes its
// half-megabyte <id>.h), which dominates the build (~140 TUs total). This
// script transpiles ONLY the named exchanges, prunes every other exchange
// from the generated tree, and rebuilds ccxt-tests/ccxt-cli against what
// remains — a single-exchange build is ~12 TUs instead of ~140.
//
//   npx tsx build/granular-cpp-build.ts <exchange1> [exchange2 ...] [--smoke]
//   npx tsx build/granular-cpp-build.ts --restore
//
// The pruned files are GENERATED (transpiled), so restoring is either
// `git checkout -- cpp/ccxt/exchanges cpp/ccxt/pro` (fast, files are
// committed and the transpile is deterministic) or a full
// `npm run emitAPI -- --cpp && npm run transpileCpp -- --all --force`.
// Do NOT commit the pruned tree.

const REST_DIR = './cpp/ccxt/exchanges';
const PRO_DIR = './cpp/ccxt/pro';
const PREDICTION_DIR = './cpp/ccxt/prediction';
const CMake = '-S cpp -B cpp/build';
const BUILD_JOBS = 8;   // -j14 OOM-kills big TUs against the session cgroup cap

function sh (command: string): void {
    execSync (command, { stdio: 'inherit' });
}

function knownExchangeIds (): Set<string> {
    return new Set (JSON.parse (fs.readFileSync ('./exchanges.json', 'utf8')).ids);
}

function knownProIds (): Set<string> {
    const dir = './ts/src/pro';
    return new Set (fs.readdirSync (dir)
        .filter ((f) => f.endsWith ('.ts'))
        .map ((f) => f.replace ('.ts', '')));
}

function knownPredictionIds (): Set<string> {
    return new Set (JSON.parse (fs.readFileSync ('./exchanges.json', 'utf8')).prediction || []);
}

// base classes named in generated class declarations: `class X : public ccxt::Y`
// (REST) / `class X : public ccxt::pro::Y` (pro). Derived venues (bybiteu ->
// bybit) and pro hierarchies (pro kucoinfutures -> pro kucoin -> REST kucoin)
// must stay on disk or the kept header fails to compile.
function resolveDependencies (kept: Set<string>): { rest: Set<string>, pro: Set<string> } {
    const rest = new Set (kept);
    const pro = new Set<string> ();
    const proIds = knownProIds ();
    const allIds = knownExchangeIds ();
    for (const id of kept) {
        if (proIds.has (id)) pro.add (id);
    }
    const parseBase = (headerPath: string, tier: 'rest' | 'pro'): string[] => {
        if (!fs.existsSync (headerPath)) return [];
        const text = fs.readFileSync (headerPath, 'utf8');
        const out: string[] = [];
        const re = tier === 'pro'
            ? /class\s+\w+\s*:\s*public\s+ccxt::(?:pro::)?(\w+)/g
            : /class\s+\w+\s*:\s*public\s+ccxt::(\w+)/g;
        let m: RegExpExecArray | null;
        while ((m = re.exec (text)) !== null) {
            out.push (m[1]);
        }
        return out;
    };
    // fixed-point walk over both tiers
    let changed = true;
    while (changed) {
        changed = false;
        for (const id of [...rest]) {
            for (const base of parseBase (path.join (REST_DIR, id + '.h'), 'rest')) {
                if (allIds.has (base) && !rest.has (base)) { rest.add (base); changed = true; }
            }
        }
        for (const id of [...pro]) {
            const headerPath = path.join (PRO_DIR, id + '.h');
            const text = fs.existsSync (headerPath) ? fs.readFileSync (headerPath, 'utf8') : '';
            const re = /class\s+\w+\s*:\s*public\s+ccxt::(pro::)?(\w+)/g;
            let m: RegExpExecArray | null;
            while ((m = re.exec (text)) !== null) {
                if (m[1]) {   // ccxt::pro::X
                    if (proIds.has (m[2]) && !pro.has (m[2])) { pro.add (m[2]); changed = true; }
                } else {      // ccxt::X — the REST base
                    if (allIds.has (m[2]) && !rest.has (m[2])) { rest.add (m[2]); changed = true; }
                }
            }
        }
    }
    return { rest, pro };
}

function pruneExchanges (keepRest: Set<string>, keepPro: Set<string>, keepPrediction: Set<string>): void {
    const allIds = knownExchangeIds ();
    const proIds = knownProIds ();
    const predictionIds = knownPredictionIds ();
    let deleted = 0;
    const pruneDir = (dir: string, keep: Set<string>, ids: Set<string>) => {
        for (const file of fs.readdirSync (dir)) {
            const match = file.match (/^(tu_)?(\w+)\.(cpp|h)$/);
            if (!match) continue;
            const name = match[2];
            if (!ids.has (name)) continue;             // never touch hand-written files
            if (keep.has (name)) continue;
            fs.unlinkSync (path.join (dir, file));
            log.red ('Deleted: ' + path.join (dir, file));
            deleted++;
        }
    };
    pruneDir (REST_DIR, keepRest, allIds);
    pruneDir (PRO_DIR, keepPro, proIds);
    pruneDir (PREDICTION_DIR, keepPrediction, predictionIds);
    log.green ('Pruned ' + deleted + ' generated exchange file(s); kept ' + keepRest.size + ' REST / ' + keepPro.size + ' pro / ' + keepPrediction.size + ' prediction');
}

function transpileOne (id: string): void {
    const prediction = fs.existsSync ('./ts/src/prediction/' + id + '.ts')
        && !fs.existsSync ('./ts/src/' + id + '.ts');
    if (prediction) {
        sh ('npx tsx build/cppTranspiler.ts --prediction ' + id + ' --force');
        return;
    }
    if (!fs.existsSync ('./ts/src/' + id + '.ts')) {
        throw new Error ('no REST source ts/src/' + id + '.ts for exchange "' + id + '"');
    }
    sh ('npx tsx build/cppTranspiler.ts ' + id);
    if (fs.existsSync ('./ts/src/pro/' + id + '.ts')) {
        sh ('npx tsx build/cppTranspiler.ts ' + id + ' --pro');
    }
}

function main (): void {
    const argsRaw = process.argv.slice (2);

    if (argsRaw.includes ('--restore')) {
        log.cyan ('Restoring the full generated tree from git (transpile output is deterministic)...');
        sh ('git checkout -- ' + REST_DIR + ' ' + PRO_DIR + ' ' + PREDICTION_DIR + ' cpp/ccxt/api');
        sh ('cmake ' + CMake);
        log.green ('Restored. Run the full build as usual: cmake --build cpp/build --parallel 8 && cmake --build cpp/build --parallel 1');
        return;
    }

    if (argsRaw.length < 1 || argsRaw.some ((a) => a.startsWith ('--') && a !== '--smoke')) {
        console.error ('Usage: npx tsx build/granular-cpp-build.ts <exchange1> [exchange2 ...] [--smoke]');
        console.error ('       npx tsx build/granular-cpp-build.ts --restore');
        process.exit (1);
    }

    const smoke = argsRaw.includes ('--smoke');
    const ids = [...new Set (argsRaw.filter ((a) => !a.startsWith ('--')))];
    if (smoke) {
        // the typed smoke includes bitvavo (typed ws gate) and binance (live gate) headers directly
        for (const id of ['bitvavo', 'binance']) {
            if (!ids.includes (id)) ids.push (id);
        }
    }

    // 1. implicit API headers for the whole tree (fast; the per-exchange
    //    transpile reads the api annotations out of the emitAPI output)
    sh ('npm run emitAPI -- --cpp');

    // 2. transpile the named exchanges (REST + pro when the source exists)
    for (const id of ids) {
        transpileOne (id);
    }

    // 3. resolve the class-hierarchy closure, then prune everything else
    const predictionIds = knownPredictionIds ();
    const keepPrediction = new Set (ids.filter ((id) => predictionIds.has (id)));
    const { rest, pro } = resolveDependencies (new Set (ids.filter ((id) => !predictionIds.has (id))));
    log.cyan ('Kept (with dependencies): REST [' + [...rest].join (', ') + '] pro [' + [...pro].join (', ') + '] prediction [' + [...keepPrediction].join (', ') + ']');
    pruneExchanges (rest, pro, keepPrediction);

    // 4. reconfigure (the tu_*.cpp GLOB changes) and build the test + CLI targets
    sh ('cmake ' + CMake);
    const targets = smoke
        ? 'ccxt-tests ccxt-cli ccxt-typed-smoke'
        : 'ccxt-tests ccxt-cli';
    sh ('cmake --build cpp/build --target ' + targets + ' --parallel ' + BUILD_JOBS);

    log.bright.cyan ('Done! Test the kept exchanges with:');
    log.bright.cyan ('  ./cpp/build/ccxt-tests <id> --requestTests | --responseTests | --wsTests');
    log.bright.cyan ('  npm run cpp -- <id> <method> [args]');
    log.yellow ('Restore the full tree before committing: npx tsx build/granular-cpp-build.ts --restore');
}

main ();
