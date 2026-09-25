// offline replay of goAnyLocalNativeNilCompares over checked-in generated Go (no transpile)
// usage: tsx replay.ts <root> [--write]
import fs from 'fs';
import path from 'path';
import { goAnyLocalNativeNilCompares } from '../../../build/goTranspiler.ts';
const root = process.argv[2];
const write = process.argv.includes ('--write');
let before = 0, after = 0, files = 0;
for (const dir of [ 'go/v4', 'go/v4/pro', 'go/v4/prediction' ]) {
    for (const f of fs.readdirSync (path.join (root, dir))) {
        if (!f.endsWith ('.go') || f.endsWith ('_test.go') || f.endsWith ('_api.go')) { continue; }
        if (f.startsWith ('exchange') && f !== 'exchange_generated.go') { continue; }
        const p = path.join (root, dir, f);
        const src = fs.readFileSync (p, 'utf8');
        const fn = src.includes ('ccxt.IsEqual(') ? 'ccxt.IsEqual(' : 'IsEqual(';
        const out = goAnyLocalNativeNilCompares (src, fn);
        before += (src.match (/IsEqual\(/g) || []).length;
        after += (out.match (/IsEqual\(/g) || []).length;
        if (out !== src) { files++; if (write) { fs.writeFileSync (p, out); } }
    }
}
console.log (JSON.stringify ({ before, after, removed: before - after, files }));
