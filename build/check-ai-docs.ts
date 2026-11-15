// Drift guard for the AI-facing docs (llms.txt, llms-full.txt, .claude/skills/ccxt-*/SKILL.md).
// These files are hand-written, so nothing regenerates them when the unified API changes.
// This script checks them against the source of truth and exits non-zero on drift:
//   1. pinned ccxt versions match package.json
//   2. every method listed in a "- `method(args)`" reference bullet exists in ts/src,
//      and does not list more positional arguments than the base signature accepts
//   3. methods whose base implementation only throws "deprecated" are not recommended
// Usage: npm run check-ai-docs   (or: tsx build/check-ai-docs.ts [--verbose])
import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.join (path.dirname (new URL (import.meta.url).pathname), '..');
const VERBOSE = process.argv.includes ('--verbose');
const read = (p: string) => fs.readFileSync (path.join (ROOT, p), 'utf8');

const DOCS = [
    'llms.txt',
    'llms-full.txt',
    ...fs.readdirSync (path.join (ROOT, '.claude/skills'))
        .filter ((d) => d.startsWith ('ccxt-') && fs.existsSync (path.join (ROOT, '.claude/skills', d, 'SKILL.md')))
        .map ((d) => `.claude/skills/${d}/SKILL.md`),
];
// skills whose reference bullets use language-native names that have no TS twin
const SKIP_REFERENCE_CHECK = new Set ([ '.claude/skills/ccxt-rust/SKILL.md', '.claude/skills/ccxt-cli/SKILL.md', '.claude/skills/ccxt-mcp/SKILL.md' ]);

const version: string = JSON.parse (read ('package.json')).version;

// ---- collect method names from the TypeScript sources --------------------------------------
const METHOD_DECL = /^\s{4}(?:public\s+|override\s+|static\s+)*(?:async\s+)?([a-zA-Z_]\w*)\s*\(([^)]*)\)/gm;
function argNames (raw: string): string[] {
    return raw.split (',').map ((a) => a.trim ().split (/[:=?]/)[0].trim ()).filter ((a) => a && a !== 'params');
}
const baseSource = read ('ts/src/base/Exchange.ts');
const baseSignatures = new Map<string, string[]> ();
const deprecatedInBase = new Set<string> ();
for (const m of baseSource.matchAll (METHOD_DECL)) {
    if (!baseSignatures.has (m[1])) {
        baseSignatures.set (m[1], argNames (m[2]));
    }
    const body = baseSource.slice (m.index!, m.index! + 400);
    if (/^[^\n]*\{\s*\n\s*throw new NotSupported \([^\n]*is deprecated/.test (body)) {
        deprecatedInBase.add (m[1]);
    }
}
const known = new Set<string> (baseSignatures.keys ());
function scan (dir: string) {
    for (const entry of fs.readdirSync (path.join (ROOT, dir), { withFileTypes: true })) {
        const rel = path.join (dir, entry.name);
        if (entry.isDirectory ()) {
            if (![ 'test', 'abstract', 'static_dependencies' ].includes (entry.name)) {
                scan (rel);
            }
        } else if (entry.name.endsWith ('.ts')) {
            for (const m of read (rel).matchAll (METHOD_DECL)) {
                known.add (m[1]);
            }
        }
    }
}
scan ('ts/src');
// helpers attached as class fields (`milliseconds = milliseconds`, `iso8601 = iso8601`, ...)
for (const m of baseSource.matchAll (/^\s{4}([a-zA-Z_]\w*)\s*(?::[^=\n]+)?=\s*[a-zA-Z_]/gm)) {
    known.add (m[1]);
}
// split "a, [b, c], { d, e }" on top-level commas only
function topLevelArgs (raw: string): string[] {
    const out: string[] = [];
    let depth = 0;
    let current = '';
    for (const ch of raw) {
        if ('[{('.includes (ch)) {
            depth++;
        } else if (']})'.includes (ch)) {
            depth--;
        }
        if (ch === ',' && depth === 0) {
            out.push (current.trim ());
            current = '';
        } else {
            current += ch;
        }
    }
    out.push (current.trim ());
    return out.filter ((a) => a && a !== 'params');
}

const toCamel = (n: string) => {
    if (n.includes ('_')) {
        const [ head, ...rest ] = n.split ('_');
        return head + rest.map ((x) => x.charAt (0).toUpperCase () + x.slice (1)).join ('');
    }
    return n.charAt (0).toLowerCase () + n.slice (1);
};

// ---- check the docs -----------------------------------------------------------------------------
const problems: string[] = [];
for (const doc of DOCS) {
    const lines = read (doc).split ('\n');
    lines.forEach ((line, i) => {
        const where = `${doc}:${i + 1}`;
        // 1. version pins (Maven coordinates, Cargo deps, explicit "ccxt ... 4.x.y")
        for (const m of line.matchAll (/(?:io\.github\.ccxt:ccxt:|ccxt(?:-pro|-prediction)?\s*=\s*"|ccxt@)(\d+\.\d+\.\d+)/g)) {
            if (m[1] !== version) {
                problems.push (`${where}: pinned version ${m[1]} != package.json ${version}`);
            }
        }
        if (SKIP_REFERENCE_CHECK.has (doc) || !line.startsWith ('- `')) {
            return;
        }
        // 2. reference bullets: "- `fetchX(a, b)` / `fetchY(c)` - description"
        const isDeprecationNote = /deprecated/i.test (line);
        for (const m of line.matchAll (/`([a-zA-Z_]\w*)\(([^)`]*)\)`/g)) {
            const name = toCamel (m[1]);
            if (!known.has (name)) {
                problems.push (`${where}: \`${m[1]}\` is not defined anywhere in ts/src`);
                continue;
            }
            const base = baseSignatures.get (name);
            const listed = topLevelArgs (m[2]);
            if (base && listed.length > base.length && listed[listed.length - 1].startsWith ('{')) {
                listed.pop (); // a trailing object literal is the params argument
            }
            if (base && listed.length > base.length) {
                problems.push (`${where}: \`${m[1]}(${m[2]})\` lists ${listed.length} positional args, base signature is (${base.join (', ')})`);
            }
            // 3. deprecated stubs must not be presented as working methods
            if (deprecatedInBase.has (name) && !isDeprecationNote) {
                problems.push (`${where}: \`${m[1]}\` is deprecated in the base class (always throws)`);
            }
        }
    });
}

if (VERBOSE) {
    console.log (`checked ${DOCS.length} files against ccxt ${version}: ${known.size} known methods, ${deprecatedInBase.size} deprecated`);
}
if (problems.length) {
    console.error (problems.join ('\n'));
    console.error (`\n${problems.length} problem(s) in AI-facing docs. Fix the doc (or the source) — see CLAUDE.md §8.1.`);
    process.exit (1);
}
console.log (`AI-facing docs OK (${DOCS.length} files, ccxt ${version})`);
