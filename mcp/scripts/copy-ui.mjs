// tsc only emits .ts sources, so the MCP Apps view files (ts/ui/*.html plus the shared
// css/js fragments that ts/ui.ts inlines at read time) are copied next to the compiled
// output here. The compiled js/ui.js resolves them relative to itself, exactly as
// ts/ui.ts does under tsx in tests.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname (fileURLToPath (import.meta.url));
const source = path.resolve (here, '..', 'ts', 'ui');
const target = path.resolve (here, '..', 'js', 'ui');

fs.rmSync (target, { recursive: true, force: true });
fs.mkdirSync (target, { recursive: true });
const files = fs.readdirSync (source).filter ((file) => /\.(html|css|js)$/.test (file));
for (const file of files) {
    fs.copyFileSync (path.join (source, file), path.join (target, file));
}
process.stderr.write ('[copy-ui] copied ' + files.length + ' view files -> js/ui\n');
