// Replays build/goTranspiler.ts nativeTypedContainerAccess over generated Go files (text pass only).
// usage: node replay.mjs <build/goTranspiler.ts> <outdir> <file.go>...
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire ('/root/ccxt/package.json');
const esbuild = require ('esbuild');
const src = fs.readFileSync (process.argv[2], 'utf8');
const slice = (from, to) => { const a = src.indexOf (from); const b = src.indexOf (to, a); if (a < 0 || b < 0) { throw new Error (from); } return src.substring (a, b); };
const code = [
    slice ('function goTextMaskLiteralsAndComments', '// every brace-delimited block'),
    slice ('const GO_ACCESS_DEREF_CONSUMERS', 'function retagLoopBoundedElementReads'),
].join ('\n');
const js = esbuild.transformSync (code, { loader: 'ts' }).code;
const fn = new Function (js + '\nreturn nativeTypedContainerAccess;') ();
const out = process.argv[3];
for (const f of process.argv.slice (4)) {
    const dst = path.join (out, f);
    fs.mkdirSync (path.dirname (dst), { recursive: true });
    fs.writeFileSync (dst, fn (fs.readFileSync (f, 'utf8')));
}
