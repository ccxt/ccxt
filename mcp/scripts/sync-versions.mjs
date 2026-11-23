// Keeps every file that repeats the package version in lockstep with package.json:
// mcpb/manifest.json and server.json, plus the plugin manifests (plugin/.claude-plugin,
// plugin/plugin.json, plugin/.codex-plugin), the "ccxt-mcp@<version>" npx pin in the plugin's
// MCP server entries, and the plugin entry of the repo-root Claude marketplace.
// Run after bumping the package version (and before packing/publishing). With --check it
// only verifies (exit 1 on drift) — suitable for CI / a prepublish guard.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname (fileURLToPath (import.meta.url));
const mcpRoot = path.resolve (here, '..');
const repoRoot = path.resolve (mcpRoot, '..');
const checkOnly = process.argv.includes ('--check');

const pkg = JSON.parse (fs.readFileSync (path.join (mcpRoot, 'package.json'), 'utf8'));
const version = pkg.version;
const pinned = pkg.name + '@' + version;

// a "field" is one place the version lives: get reads it, set rewrites it
const field = (label, expected, get, set) => ({ label, expected, get, set });
const versionField = field ('version', version, (json) => json.version, (json) => {
    json.version = version;
});
// the plugins launch the server through npx, which caches an unpinned package forever —
// so the plugin version pins the exact server version it was released with
const isPin = (arg) => (typeof arg === 'string') && (arg === pkg.name || arg.startsWith (pkg.name + '@'));
const npxPinFields = (json) => Object.keys (json.mcpServers ?? {}).map ((name) => field (
    `mcpServers.${name} npx pin`,
    pinned,
    (j) => (j.mcpServers[name].args ?? []).find (isPin),
    (j) => {
        j.mcpServers[name].args = (j.mcpServers[name].args ?? []).map ((arg) => (isPin (arg) ? pinned : arg));
    }
));

const targets = [
    { file: path.join (mcpRoot, 'mcpb', 'manifest.json'), fields: () => [ versionField ] },
    {
        file: path.join (mcpRoot, 'server.json'),
        fields: (json) => {
            const fields = [ versionField ];
            // server.json also carries per-package versions
            (Array.isArray (json.packages) ? json.packages : []).forEach ((entry, i) => {
                fields.push (field (`packages[${i}].version`, version, (j) => j.packages[i].version, (j) => {
                    j.packages[i].version = version;
                }));
            });
            return fields;
        },
    },
    {
        file: path.join (mcpRoot, 'plugin', '.claude-plugin', 'plugin.json'),
        fields: (json) => [ versionField, ...npxPinFields (json) ],
    },
    { file: path.join (mcpRoot, 'plugin', 'plugin.json'), fields: () => [ versionField ] },
    { file: path.join (mcpRoot, 'plugin', '.codex-plugin', 'plugin.json'), fields: () => [ versionField ] },
    {
        file: path.join (mcpRoot, 'plugin', 'mcp.json'),
        fields: (json) => npxPinFields (json),
    },
    {
        // the marketplace lists the plugin by the package name; plugin.json wins at install
        // time, but `claude plugin validate --strict` fails when the two disagree
        file: path.join (repoRoot, '.claude-plugin', 'marketplace.json'),
        fields: (json) => {
            const fields = [];
            (Array.isArray (json.plugins) ? json.plugins : []).forEach ((entry, i) => {
                if (entry.name === pkg.name) {
                    fields.push (field (`plugins[${i}].version`, version, (j) => j.plugins[i].version, (j) => {
                        j.plugins[i].version = version;
                    }));
                }
            });
            return fields;
        },
    },
];

let drift = false;
for (const { file, fields } of targets) {
    if (!fs.existsSync (file)) {
        continue;
    }
    const relative = path.relative (repoRoot, file);
    const json = JSON.parse (fs.readFileSync (file, 'utf8'));
    let changed = false;
    for (const { label, expected, get, set } of fields (json)) {
        const actual = get (json);
        if (actual === expected) {
            continue;
        }
        if (checkOnly) {
            process.stderr.write (`[sync-versions] ${relative} ${label} is ${actual}, expected ${expected}\n`);
            drift = true;
        } else {
            set (json);
            changed = true;
            process.stderr.write (`[sync-versions] set ${relative} ${label} -> ${expected}\n`);
        }
    }
    if (changed) {
        fs.writeFileSync (file, JSON.stringify (json, null, 2) + '\n');
    }
}

if (checkOnly && drift) {
    process.exit (1);
}
