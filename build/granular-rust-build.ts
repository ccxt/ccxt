import * as fs from 'fs';
import execSync from 'child_process';
import log from 'ololog';


function run (command: string) {
    log.bright.cyan (command);
    execSync.execSync (command, { 'stdio': 'inherit' });
}

// An exchange class may derive from another (myokx extends okx, binanceusdm extends
// binance). The rust core embeds the parent as `crate::exchanges::<parent>`, so every
// ancestor has to be transpiled too, and before its children.
function withAncestors (ids: string[]): string[] {
    const ordered: string[] = [];
    const visit = (id: string) => {
        if (ordered.indexOf (id) >= 0) {
            return;
        }
        const file = './ts/src/' + id + '.ts';
        if (fs.existsSync (file)) {
            const source = fs.readFileSync (file, 'utf8');
            const match = source.match (/export default class\s+\w+\s+extends\s+(\w+)/);
            if (match !== null) {
                const parent = match[1].replace (/Rest$/, '').toLowerCase ();
                if (parent !== 'exchange' && fs.existsSync ('./ts/src/' + parent + '.ts')) {
                    visit (parent);
                }
            }
        }
        ordered.push (id);
    };
    for (const id of ids) {
        visit (id);
    }
    return ordered;
}

// rust/tests/src/language_specific.rs is hand written (tracked, not generated) and imports
// concrete typed wrappers, so those cores must survive the prune even when the PR did not
// touch them; they are kept from git, not re-transpiled.
function requiredByHandWrittenTests (): string[] {
    const file = './rust/tests/src/language_specific.rs';
    if (!fs.existsSync (file)) {
        return [];
    }
    const source = fs.readFileSync (file, 'utf8');
    const ids: string[] = [];
    const braced = /use\s+ccxt::\{([^}]*)\}/g;
    let match = braced.exec (source);
    while (match !== null) {
        for (const raw of match[1].split (',')) {
            const name = raw.trim ().toLowerCase ();
            if (name.length > 0 && fs.existsSync ('./ts/src/' + name + '.ts')) {
                ids.push (name);
            }
        }
        match = braced.exec (source);
    }
    return ids;
}

const prunedFolders = [
    { folder: './rust/ccxt-base/src/exchanges', suffixes: [ '.rs', '_api.rs' ] },
    { folder: './rust/ccxt/src/exchanges', suffixes: [ '_typed.rs' ] },
    { folder: './rust/ccxt-pro/src/pro', suffixes: [ '.rs' ] },
    { folder: './rust/ccxt-pro/src/pro_typed', suffixes: [ '_typed.rs' ] },
];
const handWritten = new Set ([ 'mod.rs', 'cache.rs', 'order_book.rs', 'ws_client.rs' ]);

// Same as granular-go-build: every venue the PR does not need is removed from the
// checkout so `cargo build` only compiles the kept set. The registries (mod.rs, the typed
// aggregators, the Cargo feature lists and the test core registry) are all regenerated
// from the files left on disk afterwards, so nothing dangles. The prediction tier is left
// alone, as in the Go build. Scoped runs never push, so the prune never reaches master.
function pruneExchanges (keep: string[]): void {
    const kept = new Set (keep);
    for (const { folder, suffixes } of prunedFolders) {
        if (!fs.existsSync (folder)) {
            continue;
        }
        for (const file of fs.readdirSync (folder)) {
            if (!file.endsWith ('.rs') || handWritten.has (file)) {
                continue;
            }
            const suffix = suffixes.find ((sfx) => file.endsWith (sfx) && (sfx !== '.rs' || !file.endsWith ('_api.rs') && !file.endsWith ('_typed.rs')));
            if (suffix === undefined) {
                continue;
            }
            const id = file.slice (0, -suffix.length);
            if (!kept.has (id)) {
                fs.unlinkSync (folder + '/' + file);
                log.red ('Deleted: ' + folder + '/' + file);
            }
        }
    }
}

function main () {
    const args = process.argv.slice (2);
    const split = args.indexOf ('--prediction');
    const positional = (split === -1 ? args : args.slice (0, split)).filter ((arg) => !arg.startsWith ('-'));
    const predictionPositional = (split === -1 ? [] : args.slice (split + 1)).filter ((arg) => !arg.startsWith ('-'));
    if (positional.length < 1 && predictionPositional.length < 1) {
        console.error ('Usage: tsx granular-rust-build.ts <exchange1> <exchange2> ... [--prediction <exchange1> ...]');
        process.exit (1);
    }
    const exchanges = withAncestors ([ ...new Set (positional) ]);
    const keep = withAncestors ([ ...new Set (exchanges.concat (requiredByHandWrittenTests ())) ]);
    pruneExchanges (keep);
    const restIds = exchanges.filter ((id) => fs.existsSync ('./ts/src/' + id + '.ts'));
    // one invocation for every id rather than one per exchange: the transpiler builds an
    // in-process registry of the method signatures it has already emitted, and a derived
    // exchange transpiled in a separate process gets the wrong call shape for the methods
    // it inherits (E0308 on binanceusdm -> binance::futures_transfer).
    if (restIds.length > 0) {
        run (`tsx ./build/rustTranspiler.ts ${restIds.join (' ')}`);
    }
    const predictionIds = [ ...new Set (predictionPositional) ]
        .filter ((id) => fs.existsSync ('./ts/src/prediction/' + id + '.ts'));
    if (predictionIds.length > 0) {
        run (`tsx ./build/rustTranspiler.ts --prediction ${predictionIds.join (' ')}`);
    }
    const wsIds = exchanges.filter ((id) => fs.existsSync ('./ts/src/pro/' + id + '.ts'));
    if (wsIds.length > 0) {
        run (`tsx ./build/rustTranspiler.ts --ws ${wsIds.join (' ')}`);
    }
    run ('tsx ./build/rustTranspiler.ts --baseClass');
    run ('tsx ./build/rustTranspiler.ts --tests');
    run ('tsx ./build/rustTranspiler.ts --modFiles');
    log.bright.green ("Done! You can now build the Rust project with 'cargo build'.");
}

main ();
