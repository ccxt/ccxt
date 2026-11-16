// Drift guard for the AI-facing docs (llms.txt, llms-full.txt, .claude/skills/ccxt-*/SKILL.md).
// These files are hand-written, so nothing regenerates them when the unified API changes.
// This script checks them against the source of truth and exits non-zero on drift:
//   1. pinned ccxt versions match package.json
//   2. every method listed in a "- `method(args)`" reference bullet exists in ts/src; for base
//      methods the listed arguments must follow the base signature (same names in the same
//      order, no extras, no missing required ones)
//   3. base methods that are deprecated (a stub that throws "deprecated", or a JSDoc
//      `@deprecated` tag) are only mentioned on lines that say they are deprecated
// It does not compile code blocks; see .claude/rules/ai-docs.md for that.
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

// ---- collect method names and signatures from the TypeScript sources ------------------------
const KEYWORDS = new Set ([ 'if', 'for', 'while', 'switch', 'catch', 'return', 'function', 'constructor', 'super', 'typeof', 'new', 'await', 'else', 'do', 'try', 'throw', 'delete', 'void', 'in', 'of' ]);
const METHOD_DECL = /^\s{4}(?:public\s+|override\s+|static\s+)*(?:async\s+)?([a-zA-Z_]\w*)\s*\(([^)]*)\)\s*(?::[^\n]*)?\{[ \t]*$/gm;
interface Arg { name: string, required: boolean }
function parseArgs (raw: string): Arg[] {
    return raw.split (',').map ((a) => a.trim ()).filter ((a) => a).map ((a) => ({
        'name': a.split (/[:=?]/)[0].trim (),
        'required': !/[=?]/.test (a.split (':')[0] + (a.includes ('=') ? '=' : '')),
    })).filter ((a) => a.name !== 'params');
}
const baseSource = read ('ts/src/base/Exchange.ts');
const baseSignatures = new Map<string, Arg[]> ();
const deprecatedInBase = new Set<string> ();
for (const m of baseSource.matchAll (METHOD_DECL)) {
    const name = m[1];
    if (KEYWORDS.has (name)) {
        continue;
    }
    if (!baseSignatures.has (name)) {
        baseSignatures.set (name, parseArgs (m[2]));
    }
    // look at the body up to the next method declaration (JSDoc lives inside the body here)
    const start = m.index! + m[0].length;
    const next = baseSource.slice (start).search (/\n {4}(?:public\s+|override\s+|static\s+)*(?:async\s+)?[a-zA-Z_]\w*\s*\([^)]*\)\s*(?::[^\n]*)?\{[ \t]*\n/);
    const body = baseSource.slice (start, next === -1 ? start + 2000 : start + next);
    if (/^\s*throw new NotSupported \([^\n]*is deprecated/.test (body) || /^\s*\/\*\*[\s\S]*?@deprecated[\s\S]*?\*\//.test (body)) {
        deprecatedInBase.add (name);
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
                if (!KEYWORDS.has (m[1])) {
                    known.add (m[1]);
                }
            }
        }
    }
}
scan ('ts/src');
// helpers attached as class fields (`milliseconds = milliseconds`, `iso8601 = iso8601`, ...)
for (const m of baseSource.matchAll (/^\s{4}([a-zA-Z_]\w*)\s*(?::[^=\n]+)?=\s*[a-zA-Z_]/gm)) {
    known.add (m[1]);
}
// names are compared case- and underscore-insensitively, so camelCase, snake_case and PascalCase
// bullets all resolve (fetch_ohlcv, FetchOHLCV and fetchOHLCV are the same method)
const fold = (n: string) => n.replace (/_/g, '').toLowerCase ();
const knownFolded = new Map<string, string> ();
for (const n of known) {
    if (!knownFolded.has (fold (n)) || baseSignatures.has (n)) {
        knownFolded.set (fold (n), n);
    }
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
// a documented argument matches the base one when the names agree after dropping
// brackets, case, underscores and a plural "s" (`[symbols]` ~ symbols, `ids` ~ ids, `id` ~ id)
const normArg = (a: string) => fold (a.replace (/[[\]{}\s]/g, '')).replace (/s$/, '');
function argMatches (listed: string, base: string): boolean {
    if (/^(true|false|True|False|null|None|nil|undefined|-?\d[\d._]*|'[^']*'|"[^"]*")$/.test (listed)) {
        return true; // a literal value in an example call
    }
    if (/^[[{]/.test (listed) && /[\]}]$/.test (listed) && /,/.test (listed)) {
        return true; // a structural example like [{ id, symbol }] or [[symbol, timeframe]]
    }
    const a = normArg (listed);
    const b = normArg (base);
    return a === b || a.startsWith (b) || b.startsWith (a);
}

// ---- check the docs -----------------------------------------------------------------------------
const PIN_PATTERNS = [
    /io\.github\.ccxt:ccxt:(\d+\.\d+\.\d+)/g,                              // Maven / Gradle
    /\bccxt(?:-pro|-prediction)?\s*=\s*(?:\{[^}\n]*version\s*=\s*)?"[=^~]?(\d+\.\d+\.\d+)"/g, // Cargo
    /\bccxt@v?(\d+\.\d+\.\d+)/g,                                           // npm
    /github\.com\/ccxt\/ccxt\/go\/v4(?:\/pro)?@v(\d+\.\d+\.\d+)/g,         // go get
    /\bccxt\s*==\s*(\d+\.\d+\.\d+)/g,                                      // pip
    /\bccxt\/ccxt[:\s"]+\^?(\d+\.\d+\.\d+)/g,                              // composer
    /package ccxt (?:--version |-v )(\d+\.\d+\.\d+)/g,                     // dotnet add package
];
const problems: string[] = [];
for (const doc of DOCS) {
    const lines = read (doc).split ('\n');
    lines.forEach ((line, i) => {
        const where = `${doc}:${i + 1}`;
        // 1. version pins
        for (const re of PIN_PATTERNS) {
            for (const m of line.matchAll (re)) {
                if (m[1] !== version) {
                    problems.push (`${where}: pinned version ${m[1]} != package.json ${version}`);
                }
            }
        }
        if (SKIP_REFERENCE_CHECK.has (doc) || !/^\s*[-*] /.test (line)) {
            return;
        }
        // 2. reference bullets: "- `fetchX(a, b)` / `fetchY(c)` - description"
        const isDeprecationNote = /deprecated|replaces the older|legacy alias/i.test (line);
        for (const m of line.matchAll (/`([a-zA-Z_]\w*)\(([^)`]*)\)`/g)) {
            if (KEYWORDS.has (m[1])) {
                continue;
            }
            const name = knownFolded.get (fold (m[1]));
            if (name === undefined) {
                problems.push (`${where}: \`${m[1]}\` is not defined anywhere in ts/src`);
                continue;
            }
            const base = baseSignatures.get (name);
            if (base && !isDeprecationNote) {
                const listed = topLevelArgs (m[2]);
                if (listed.length > base.length && listed[listed.length - 1].startsWith ('{')) {
                    listed.pop (); // a trailing object literal is the params argument
                }
                const required = base.filter ((a) => a.required).length;
                const shown = `\`${m[1]}(${m[2]})\` vs base (${base.map ((a) => a.name).join (', ')})`;
                if (listed.length > base.length) {
                    problems.push (`${where}: ${shown}: too many positional args`);
                } else if (listed.length > 0 && listed.length < required) {
                    problems.push (`${where}: ${shown}: missing required args`);
                } else {
                    const bad = listed.findIndex ((a, k) => !argMatches (a, base[k].name));
                    if (bad !== -1) {
                        problems.push (`${where}: ${shown}: arg ${bad + 1} "${listed[bad]}" should be "${base[bad].name}"`);
                    }
                }
            }
            // 3. deprecated base methods must not be presented as working methods
            if (deprecatedInBase.has (name) && !isDeprecationNote) {
                problems.push (`${where}: \`${m[1]}\` is deprecated in the base class`);
            }
        }
    });
}

if (VERBOSE) {
    console.log (`checked ${DOCS.length} files against ccxt ${version}: ${known.size} known methods, ${baseSignatures.size} base signatures, deprecated: ${[ ...deprecatedInBase ].join (', ')}`);
}
if (problems.length) {
    console.error (problems.join ('\n'));
    console.error (`\n${problems.length} problem(s) in AI-facing docs. Fix the doc (or the source) — see CLAUDE.md §8.1.`);
    process.exit (1);
}
console.log (`AI-facing docs OK (${DOCS.length} files, ccxt ${version})`);
