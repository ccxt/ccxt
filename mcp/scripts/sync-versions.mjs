// Keeps the version in mcpb/manifest.json and server.json in lockstep with package.json.
// Run after bumping the package version (and before packing/publishing). With --check it
// only verifies (exit 1 on drift) — suitable for CI / a prepublish guard.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname (fileURLToPath (import.meta.url));
const mcpRoot = path.resolve (here, '..');
const checkOnly = process.argv.includes ('--check');

const version = JSON.parse (fs.readFileSync (path.join (mcpRoot, 'package.json'), 'utf8')).version;

const targets = [
    { file: path.join (mcpRoot, 'mcpb', 'manifest.json'), key: 'version' },
    { file: path.join (mcpRoot, 'server.json'), key: 'version' },
];

let drift = false;
for (const { file, key } of targets) {
    if (!fs.existsSync (file)) {
        continue;
    }
    const json = JSON.parse (fs.readFileSync (file, 'utf8'));
    if (json[key] === version) {
        continue;
    }
    if (checkOnly) {
        process.stderr.write (`[sync-versions] ${path.relative (mcpRoot, file)} is ${json[key]}, expected ${version}\n`);
        drift = true;
    } else {
        json[key] = version;
        // server.json also carries per-package versions
        if (Array.isArray (json.packages)) {
            for (const p of json.packages) {
                p.version = version;
            }
        }
        fs.writeFileSync (file, JSON.stringify (json, null, 2) + '\n');
        process.stderr.write (`[sync-versions] set ${path.relative (mcpRoot, file)} -> ${version}\n`);
    }
}

if (checkOnly && drift) {
    process.exit (1);
}
