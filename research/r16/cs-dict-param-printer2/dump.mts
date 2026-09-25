// single-file C# replay: writes each file's printed C# to OUT/<path>.cs
import fs from 'fs';
import path from 'path';
import worker from '../../../build/csharp-worker.ts';
const [ out, ...files ] = process.argv.slice (2);
const cfg = { verbose: false, csharp: { parser: { ELEMENT_ACCESS_WRAPPER_OPEN: 'getValue(', ELEMENT_ACCESS_WRAPPER_CLOSE: ')' } } };
const res = await worker ({ transpilerConfig: cfg, files, roots: files } as any);
res.result.forEach ((r, i) => {
    const text = typeof r === 'string' ? r : (r.content ?? JSON.stringify (r));
    const dest = path.join (out, files[i].replace (/\.ts$/, '.cs'));
    fs.mkdirSync (path.dirname (dest), { recursive: true });
    fs.writeFileSync (dest, text);
});
process.exit (0);
