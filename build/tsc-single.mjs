// Compile one or more TypeScript files WITHOUT losing the project settings.
//
// Why this file exists:
//
//   The fast per-exchange build lane used to run the compiler like this:
//
//       tsc ts/src/binance.ts --outDir ./js/src
//
//   TypeScript has a surprising rule: as soon as you name input files on the
//   command line, it silently ignores tsconfig.json (newer versions warn about
//   it with error TS5112). That meant this lane compiled with TypeScript's
//   built-in defaults instead of our project settings, causing two problems:
//
//   1. Type checking became stricter than the project intends. For example,
//      `let x: Dict = undefined;` compiles fine in the full build (we set
//      strictNullChecks: false), but the bare command rejected it with TS2322.
//      Contributors hit this as a confusing wall where their perfectly normal
//      code failed CI while identical lines elsewhere in the repo were fine:
//      https://github.com/ccxt/ccxt/pull/28049
//
//   2. The emitted JavaScript could differ between the two lanes, because the
//      bare command also fell back to default target/module settings instead
//      of the ES2022 / Node16 combination the project specifies.
//
// What this script does instead:
//
//   It writes a tiny temporary tsconfig that says "inherit everything from the
//   real tsconfig.json, and compile just these files", then runs `tsc -p` on
//   it. Inheriting via "extends" keeps a single source of truth: any future
//   change to the real tsconfig automatically applies here too.
//
//   Two details worth knowing:
//
//   - `include: []` is required. In tsconfig inheritance the `files`,
//     `include` and `exclude` keys each override independently, so without
//     this line the inherited `include: ["ts/**/*"]` would drag the entire
//     tree into every single-file compile.
//
//   - There are no compilerOptions overrides on purpose. The inherited
//     rootDir (./ts) and outDir (./js) resolve relative to the real config's
//     location, so `ts/src/foo.ts` lands at `js/src/foo.js` exactly like the
//     full `npm run tsBuild` — overriding outDir here would double-nest the
//     output (js/src/src/...), see the review in:
//     https://github.com/ccxt/ccxt/pull/29544
//
//   Each invocation uses its own temp directory, so the parallel per-exchange
//   builds in build/transpile.sh can run many of these at once safely.
//
// Usage:
//
//   node build/tsc-single.mjs ts/src/binance.ts [more files...]
//
import { execSync } from 'child_process';
import { writeFileSync, mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve } from 'path';

const cwd = process.cwd ();
const files = process.argv.slice (2).map ((f) => resolve (cwd, f));
if (!files.length) {
    console.error ('usage: node build/tsc-single.mjs <file.ts> [more.ts ...]');
    process.exit (1);
}
const shim = join (mkdtempSync (join (tmpdir (), 'tsc-single-')), 'tsconfig.json');
writeFileSync (shim, JSON.stringify ({
    'extends': join (cwd, 'tsconfig.json'), // inherit ALL real project settings
    'files': files,                         // ... but compile only these files
    'include': [],                          // ... and nothing else (see note above)
}));
execSync ('npx tsc -p ' + JSON.stringify (shim), { stdio: 'inherit', cwd });
