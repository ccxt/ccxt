// replay nativeDeclaredHelperCalls over committed C# output (no transpile): in-dir -> out-dir
import fs from 'fs';
import path from 'path';
import { nativeDeclaredHelperCalls } from './native-slice.ts';

const [ inDir, outDir ] = process.argv.slice (2);
let files = 0, changed = 0;
const walk = (d: string) => {
    for (const e of fs.readdirSync (d, { withFileTypes: true })) {
        const p = path.join (d, e.name);
        if (e.isDirectory ()) { walk (p); continue; }
        if (!p.endsWith ('.cs')) continue;
        const src = fs.readFileSync (p, 'utf8');
        const out = nativeDeclaredHelperCalls (src);
        const target = path.join (outDir, path.relative (inDir, p));
        fs.mkdirSync (path.dirname (target), { recursive: true });
        fs.writeFileSync (target, out);
        files++;
        if (out !== src) changed++;
    }
};
walk (inDir);
console.log ('files', files, 'changed', changed);
