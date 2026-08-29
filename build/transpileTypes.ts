// Generates the per-language base type files from ts/src/base/types.ts, the source of truth.
//
// Background: unlike the per-exchange port files, the base type declarations
// (cs/ccxt/base/Exchange.Types.cs, python/ccxt/base/types.py, go/v4/exchange_types.go,
// java/lib/src/main/java/io/github/ccxt/types/*.java) were hand-maintained — nothing in
// build/ wrote them and nothing in CI diffed them against the TS, so they drifted silently
// until someone hit the resulting null fields (PR #29502).
//
// Usage:
//   tsx build/transpileTypes.ts                 # write every language
//   tsx build/transpileTypes.ts --check         # exit 1 if any target is stale
//   tsx build/transpileTypes.ts --lang csharp   # restrict to one language
//   tsx build/transpileTypes.ts --diff          # print a unified diff instead of writing

import fs from 'fs';
import path from 'path';
import { extractTypesIR, TypesIR } from './typesIR.js';

export interface EmitterOutput {
    /** repo-relative path of the file this emitter owns */
    path: string;
    /** full new contents (ignored when `delete` is true) */
    contents: string;
    /** type names whose block changed */
    changed: string[];
    /** when true, remove the file if it exists (type dropped from types.ts) */
    delete?: boolean;
}

export interface LanguageEmitter {
    id: string;
    emit: (ir: TypesIR, repoRoot: string) => EmitterOutput[];
}

const TYPES_PATH = path.join ('ts', 'src', 'base', 'types.ts');

async function loadEmitters (only: string | undefined): Promise<LanguageEmitter[]> {
    const all: LanguageEmitter[] = [];
    const ids = [ 'python', 'csharp', 'go', 'java' ];
    for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        if (only !== undefined && only !== id) {
            continue;
        }
        const modulePath = './typeEmitters/' + id + '.js';
        try {
            const mod = await import (modulePath);
            const emitter = mod.default !== undefined ? mod.default : mod.emitter;
            if (emitter !== undefined) {
                all.push (emitter as LanguageEmitter);
            }
        } catch (e) {
            if (only !== undefined) {
                throw e;
            }
            // an emitter that is not implemented yet simply does not contribute
        }
    }
    return all;
}

function unifiedDiff (before: string, after: string, filePath: string): string {
    const a = before.split ('\n');
    const b = after.split ('\n');
    const out: string[] = [];
    let i = 0;
    let j = 0;
    while (i < a.length || j < b.length) {
        if (i < a.length && j < b.length && a[i] === b[j]) {
            i += 1;
            j += 1;
            continue;
        }
        let matched = false;
        for (let look = 1; look < 200 && !matched; look++) {
            if (j + look < b.length && i < a.length && a[i] === b[j + look]) {
                for (let k = 0; k < look; k++) {
                    out.push ('+' + b[j + k]);
                }
                j += look;
                matched = true;
            } else if (i + look < a.length && j < b.length && a[i + look] === b[j]) {
                for (let k = 0; k < look; k++) {
                    out.push ('-' + a[i + k]);
                }
                i += look;
                matched = true;
            }
        }
        if (!matched) {
            if (i < a.length) {
                out.push ('-' + a[i]);
                i += 1;
            }
            if (j < b.length) {
                out.push ('+' + b[j]);
                j += 1;
            }
        }
    }
    if (out.length === 0) {
        return '';
    }
    return '--- a/' + filePath + '\n+++ b/' + filePath + '\n' + out.join ('\n');
}

async function main () {
    const argv = process.argv.slice (2);
    const check = argv.indexOf ('--check') >= 0;
    const showDiff = argv.indexOf ('--diff') >= 0;
    const langIndex = argv.indexOf ('--lang');
    const only = langIndex >= 0 ? argv[langIndex + 1] : undefined;
    const repoRoot = process.cwd ();
    const ir = extractTypesIR (path.join (repoRoot, TYPES_PATH));
    const emitters = await loadEmitters (only);
    if (emitters.length === 0) {
        console.log ('transpileTypes: no emitters available' + (only !== undefined ? ' for ' + only : ''));
        return;
    }
    let stale = 0;
    let written = 0;
    for (let e = 0; e < emitters.length; e++) {
        const emitter = emitters[e];
        const outputs = emitter.emit (ir, repoRoot);
        for (let o = 0; o < outputs.length; o++) {
            const output = outputs[o];
            const absolute = path.join (repoRoot, output.path);
            if (output.delete === true) {
                if (!fs.existsSync (absolute)) {
                    console.log ('  ok      ' + output.path + '  (already absent)');
                    continue;
                }
                stale += 1;
                if (showDiff) {
                    console.log ('--- a/' + output.path + '\n+++ /dev/null\n' + fs.readFileSync (absolute, 'utf8').split ('\n').map ((l) => '-' + l).join ('\n'));
                }
                if (check) {
                    console.log ('  STALE   ' + output.path + '  (should delete)');
                    continue;
                }
                fs.unlinkSync (absolute);
                written += 1;
                console.log ('  deleted ' + output.path + (output.changed.length > 0 ? '  (' + output.changed.join (', ') + ')' : ''));
                continue;
            }
            const before = fs.existsSync (absolute) ? fs.readFileSync (absolute, 'utf8') : '';
            if (before === output.contents) {
                console.log ('  ok      ' + output.path);
                continue;
            }
            stale += 1;
            if (showDiff) {
                console.log (unifiedDiff (before, output.contents, output.path));
            }
            if (check) {
                console.log ('  STALE   ' + output.path + (output.changed.length > 0 ? '  (' + output.changed.join (', ') + ')' : ''));
                continue;
            }
            fs.mkdirSync (path.dirname (absolute), { 'recursive': true });
            fs.writeFileSync (absolute, output.contents);
            written += 1;
            console.log ('  written ' + output.path + (output.changed.length > 0 ? '  (' + output.changed.join (', ') + ')' : ''));
        }
    }
    if (check && stale > 0) {
        console.log ('');
        console.log (stale.toString () + ' base type file(s) are out of date with ' + TYPES_PATH + '.');
        console.log ('Run `npm run transpile-types` and commit the result.');
        process.exit (1);
    }
    if (!check) {
        console.log ('transpileTypes: ' + written.toString () + ' file(s) written.');
    }
}

main ().catch ((e) => {
    console.error (e);
    process.exit (1);
});
