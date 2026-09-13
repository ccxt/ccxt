import * as fs from 'fs';
import execSync from 'child_process';
import log from 'ololog';


function run (command: string) {
    log.bright.cyan (command);
    execSync.execSync (command, { 'stdio': 'inherit' });
}

// rust/tests/src/language_specific.rs is hand written (it is tracked, not generated)
// and imports concrete exchange types, so those cores have to exist even when the PR
// did not touch them, or ccxt_tests fails to compile with E0432.
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

function main () {
    const positional = process.argv.slice (2).filter ((arg) => !arg.startsWith ('-'));
    if (positional.length < 1) {
        console.error ('Usage: tsx granular-rust-build.ts <exchange1> <exchange2> ...');
        process.exit (1);
    }
    const exchanges = withAncestors ([ ...new Set (positional.concat (requiredByHandWrittenTests ())) ]);
    // ccxt-base/lib.rs declares `pub mod prediction;`, and that folder's mod.rs is only
    // written when the prediction tier is transpiled, so always include those cores.
    const predictionIds = fs.readdirSync ('./ts/src/prediction')
        .filter ((file) => file.endsWith ('.ts'))
        .map ((file) => file.slice (0, -3));
    const restIds = [ ...new Set (exchanges.concat (predictionIds)) ]
        .filter ((id) => fs.existsSync ('./ts/src/' + id + '.ts') || fs.existsSync ('./ts/src/prediction/' + id + '.ts'));
    // one invocation for every id rather than one per exchange: the transpiler builds an
    // in-process registry of the method signatures it has already emitted, and a derived
    // exchange transpiled in a separate process gets the wrong call shape for the methods
    // it inherits (E0308 on binanceusdm -> binance::futures_transfer).
    if (restIds.length > 0) {
        run (`tsx ./build/rustTranspiler.ts ${restIds.join (' ')}`);
    }
    // a pro core Derefs into its REST parent (crate::exchanges::<id>), so only the ws
    // venues whose parent was emitted above can be transpiled. binance is the venue kept
    // in git (see .gitignore), so it is always available to rewrite pro/mod.rs.
    const wsIds = exchanges.filter ((id) => fs.existsSync ('./ts/src/pro/' + id + '.ts'));
    const wsTargets = (wsIds.length > 0) ? wsIds : [ 'binance' ];
    run (`tsx ./build/rustTranspiler.ts --ws ${wsTargets.join (' ')}`);
    run ('tsx ./build/rustTranspiler.ts --baseClass');
    run ('tsx ./build/rustTranspiler.ts --tests');
    log.bright.green ("Done! You can now build the Rust project with 'cargo build'.");
}

main ();
