// Packs the plugin directory (plugin/) into ccxt-mcp-plugin.zip — the archive uploaded to the
// OpenAI plugin portal, and handy for sideloading. The zip holds the directory's CONTENTS
// (plugin.json, mcp.json, skills/, assets/, … at the archive root). The sync checks run first,
// so a zip can never carry a stale skill copy or a version that disagrees with package.json.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname (fileURLToPath (import.meta.url));
const mcpRoot = path.resolve (here, '..');
const pluginDir = path.join (mcpRoot, 'plugin');
const out = path.join (mcpRoot, 'ccxt-mcp-plugin.zip');

function fail (message) {
    process.stderr.write (`[plugin-zip] ${message}\n`);
    process.exit (1);
}

for (const script of [ 'sync-versions.mjs', 'sync-plugin.mjs' ]) {
    const check = spawnSync (process.execPath, [ path.join (here, script), '--check' ], { 'stdio': 'inherit' });
    if (check.status !== 0) {
        fail (`${script} --check failed — run "npm run sync-versions" / "npm run sync-plugin" first`);
    }
}

// a symlink would be stored as a link (or silently followed) depending on the zip tool
function assertNoSymlinks (dir) {
    for (const entry of fs.readdirSync (dir, { 'withFileTypes': true })) {
        const full = path.join (dir, entry.name);
        if (entry.isSymbolicLink ()) {
            fail (`${path.relative (mcpRoot, full)} is a symlink — the plugin must contain real files only`);
        }
        if (entry.isDirectory ()) {
            assertNoSymlinks (full);
        }
    }
}
assertNoSymlinks (pluginDir);

if (spawnSync ('zip', [ '-v' ], { 'stdio': 'ignore' }).error) {
    fail ('the "zip" command was not found on PATH — install it (e.g. apt-get install zip) and retry');
}

fs.rmSync (out, { 'force': true });
// -X drops extra file attributes (uid/gid, timestamps beyond the basics) for a leaner archive
const zip = spawnSync ('zip', [ '-r', '-X', '-q', out, '.', '-x', '.DS_Store', '*/.DS_Store' ], { 'cwd': pluginDir, 'stdio': 'inherit' });
if (zip.status !== 0) {
    fail (`zip exited with status ${zip.status}`);
}
const kb = (fs.statSync (out).size / 1024).toFixed (1);
process.stderr.write (`[plugin-zip] wrote ${path.relative (mcpRoot, out)} (${kb} kB)\n`);
