// Builds js/data/method-docs.json — the per-exchange method documentation manifest served
// by the describe_method tool (descriptions, typed params incl. params.* keys, @see links).
// Parses the JSDoc blocks in the monorepo's ts/src/*.ts sources directly (they follow the
// strict convention documented in CLAUDE.md §7), so it only runs inside the ccxt monorepo:
// at publish time the manifest ships in the npm tarball; outside the repo it skips and
// describe_method falls back to runtime signature introspection.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const here = path.dirname (fileURLToPath (import.meta.url));
const repoRoot = path.resolve (here, '..', '..');
const sourceDir = path.join (repoRoot, 'ts', 'src');
const outputFile = path.join (here, '..', 'js', 'data', 'method-docs.json');

if (!fs.existsSync (path.join (sourceDir, 'base', 'Exchange.ts'))) {
    console.error ('[build-doc-manifest] ccxt monorepo sources not found — skipping (describe_method will use runtime introspection)');
    process.exit (0);
}

const JSDOC_BLOCK = /\/\*\*([\s\S]*?)\*\/\s*(?:async\s+)?([A-Za-z0-9_]+)\s*\(/g;

function parseBlock (raw) {
    const lines = raw.split ('\n').map ((line) => line.replace (/^\s*\*\s?/, '').trim ());
    const entry = {};
    const params = [];
    const see = [];
    for (const line of lines) {
        if (line.startsWith ('@description')) {
            entry.description = line.slice ('@description'.length).trim ();
        } else if (line.startsWith ('@see')) {
            const url = line.slice ('@see'.length).trim ().split (/\s+/)[0];
            if (url) {
                see.push (url);
            }
        } else if (line.startsWith ('@param')) {
            const match = line.match (/^@param\s*(?:\{([^}]*)\})?\s*(\[?[A-Za-z0-9_.$]+\]?)\s*(.*)$/);
            if (match) {
                const bracketed = match[2].startsWith ('[');
                const name = match[2].replace (/^\[|\]$/g, '');
                params.push ({
                    name,
                    'type': match[1] || undefined,
                    'optional': bracketed || undefined,
                    'description': match[3] || undefined,
                });
            }
        } else if (line.startsWith ('@returns')) {
            entry.returns = line.slice ('@returns'.length).trim ();
        } else if (line.startsWith ('@ignore')) {
            entry.ignore = true;
        }
    }
    if (params.length) {
        entry.params = params;
    }
    if (see.length) {
        entry.see = see;
    }
    return entry;
}

function parseFile (filePath) {
    const content = fs.readFileSync (filePath).toString ();
    const methods = {};
    let match;
    JSDOC_BLOCK.lastIndex = 0;
    while ((match = JSDOC_BLOCK.exec (content)) !== null) {
        const entry = parseBlock (match[1]);
        const name = match[2];
        if (entry.ignore || name === 'if' || name === 'for' || name === 'while' || name === 'switch') {
            continue;
        }
        if (entry.description === undefined && entry.params === undefined) {
            continue;
        }
        delete entry.ignore;
        methods[name] = entry;
    }
    return methods;
}

const manifest = { 'base': {}, 'exchanges': {} };

manifest.base = parseFile (path.join (sourceDir, 'base', 'Exchange.ts'));

const files = fs.readdirSync (sourceDir).filter ((file) => file.endsWith ('.ts'));
for (const file of files) {
    const id = file.replace (/\.ts$/, '');
    const methods = parseFile (path.join (sourceDir, file));
    if (Object.keys (methods).length) {
        manifest.exchanges[id] = methods;
    }
}

// pro (websocket) sources document watch* methods on the same exchange ids
const proDir = path.join (sourceDir, 'pro');
if (fs.existsSync (proDir)) {
    for (const file of fs.readdirSync (proDir).filter ((f) => f.endsWith ('.ts'))) {
        const id = file.replace (/\.ts$/, '');
        const methods = parseFile (path.join (proDir, file));
        if (Object.keys (methods).length) {
            manifest.exchanges[id] = { ...(manifest.exchanges[id] ?? {}), ...methods };
        }
    }
}

// prediction sources
const predictionDir = path.join (sourceDir, 'prediction');
if (fs.existsSync (predictionDir)) {
    for (const file of fs.readdirSync (predictionDir).filter ((f) => f.endsWith ('.ts'))) {
        const id = file.replace (/\.ts$/, '');
        const methods = parseFile (path.join (predictionDir, file));
        if (Object.keys (methods).length) {
            manifest.exchanges[id] = { ...(manifest.exchanges[id] ?? {}), ...methods };
        }
    }
}

fs.mkdirSync (path.dirname (outputFile), { 'recursive': true });
fs.writeFileSync (outputFile, JSON.stringify (manifest));
const size = fs.statSync (outputFile).size;
console.error ('[build-doc-manifest] wrote ' + outputFile + ' (' + Object.keys (manifest.base).length + ' base methods, ' + Object.keys (manifest.exchanges).length + ' exchanges, ' + (size / 1024 / 1024).toFixed (1) + ' MB)');
