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
    log.bright.green ("Done! You can now build the Rust project with 'cargo build'.");
}

main ();
