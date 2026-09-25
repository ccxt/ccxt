// single-file C# printer replay (no post-pass): npx tsx probe.mts <worktree> <ts file> <out>
import * as fs from 'fs';
const wt = process.argv[2];
const { Transpiler } = await import(wt + '/node_modules/ast-transpiler/dist/transpiler.js');
const w: any = await import(wt + '/build/csharp-worker.ts');
const t: any = new Transpiler({ verbose: false, csharp: { parser: { ELEMENT_ACCESS_WRAPPER_OPEN: 'getValue(', ELEMENT_ACCESS_WRAPPER_CLOSE: ')' } } });
if (process.env.OFF) t.csharpTranspiler._guardedMinMaxPatched = true;
w.setupCsharpPrinter(t);
fs.writeFileSync(process.argv[4], t.transpileCSharpByPath(process.argv[3]).content);
