// JN-30 (d) census: every Promise<X>/Promise<X[]> unified return in ts/src/base/Exchange.ts
// + ts/src/base/PredictionExchange.ts, cross-checked against (1) a Java class in
// io.github.ccxt.types and (2) KNOWN_TYPES in build/generateJavaWrappers.ts (the gate that
// decides whether the typed wrapper overload is emitted).
//
// Run from the repo root: npx tsx JN-30-evidence/audit-known-census.ts
import fs from 'fs';

const files = [ 'ts/src/base/Exchange.ts', 'ts/src/base/PredictionExchange.ts' ];
const KNOWN = new Set (/const KNOWN_TYPES = new Set\(\[([\s\S]*?)\]\)/.exec (fs.readFileSync ('build/generateJavaWrappers.ts', 'utf8'))![1].match (/'([A-Za-z0-9_]+)'/g)!.map ((n) => n.slice (1, -1)));
// aliases the wrapper generator resolves before the KNOWN_TYPES check (see KNOWN_TYPE_ALIASES)
const ALIAS: Record<string, string> = { 'Market': 'MarketInterface', 'Currency': 'CurrencyInterface' };
const CLASSES = new Set (fs.readdirSync ('java/lib/src/main/java/io/github/ccxt/types').filter ((f) => f.endsWith ('.java')).map ((f) => f.slice (0, -5)));
const SCALARS = new Set ([ 'void', 'number', 'string', 'boolean', 'int', 'Int', 'Num', 'Str', 'Bool', 'any', 'Dict', 'Dictionary<any>', 'Object', 'Strings', 'string[][]' ]);

const RETURN_RE = /^\s+(?:override\s+)?async (\w+)\s*\(.*\)\s*:\s*Promise<(.*)>/;
const missingClass: string[] = [];
const missingKnown: string[] = [];
const all = new Set<string> ();
for (const file of files) {
    if (!fs.existsSync (file)) continue;
    for (const line of fs.readFileSync (file, 'utf8').split ('\n')) {
        const m = line.match (RETURN_RE);
        if (m === null) continue;
        const method = m[1];
        let inner = m[2].trim ();
        if (inner.endsWith ('[]')) inner = inner.slice (0, -2);
        if (SCALARS.has (inner) || inner.indexOf ('{') >= 0 || inner.indexOf ('[') >= 0 || inner.indexOf ('|') >= 0) continue;
        if (inner.startsWith ('Dictionary<') || inner.startsWith ('List<')) continue; // index-signature bags
        const className = ALIAS[inner] !== undefined ? ALIAS[inner] : inner;
        all.add (method + ' -> ' + inner);
        if (!CLASSES.has (className)) missingClass.push (method + ' -> ' + inner);
        if (CLASSES.has (className) && !KNOWN.has (className)) missingKnown.push (method + ' -> ' + inner);
    }
}
console.log ('unified methods scanned: ' + all.size);
console.log ('\n[A] type used in a return with NO Java class (and not in KNOWN_TYPES):');
console.log (missingClass.length === 0 ? '  (none)' : missingClass.map ((r) => '  ' + r).join ('\n'));
console.log ('\n[B] Java class EXISTS but NOT wired into KNOWN_TYPES (typed overload never emitted):');
console.log (missingKnown.length === 0 ? '  (none)' : missingKnown.map ((r) => '  ' + r).join ('\n'));
const orphans: string[] = [];
for (const k of KNOWN) {
    if (!CLASSES.has (k)) orphans.push (k);
}
console.log ('\n[C] KNOWN_TYPES entries with no Java class (would break the wrapper compile):');
console.log (orphans.length === 0 ? '  (none)' : orphans.map ((o) => '  ' + o).join ('\n'));
