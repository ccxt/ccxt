// Copies the canonical ccxt-mcp usage skill (<repo>/.claude/skills/ccxt-mcp) into the plugin
// (plugin/skills/ccxt-mcp). The plugin ships a real copy rather than a symlink because ZIP
// uploads, Windows checkouts and non-Claude hosts do not reliably follow symlinks.
// Run after editing the skill. With --check it only verifies (exit 1 on drift, listing the
// files that differ) — suitable for CI / a prepublish guard.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname (fileURLToPath (import.meta.url));
const mcpRoot = path.resolve (here, '..');
const repoRoot = path.resolve (mcpRoot, '..');
const checkOnly = process.argv.includes ('--check');

const source = path.join (repoRoot, '.claude', 'skills', 'ccxt-mcp');
const target = path.join (mcpRoot, 'plugin', 'skills', 'ccxt-mcp');

// every regular file under dir, as sorted forward-slash relative paths
function listFiles (dir, prefix = '') {
    if (!fs.existsSync (dir)) {
        return [];
    }
    const files = [];
    for (const entry of fs.readdirSync (dir, { 'withFileTypes': true })) {
        const relative = prefix ? (prefix + '/' + entry.name) : entry.name;
        if (entry.isDirectory ()) {
            files.push (...listFiles (path.join (dir, entry.name), relative));
        } else {
            files.push (relative);
        }
    }
    return files.sort ();
}

if (!fs.existsSync (path.join (source, 'SKILL.md'))) {
    process.stderr.write (`[sync-plugin] canonical skill not found at ${path.relative (repoRoot, source)}\n`);
    process.exit (1);
}

const sourceFiles = listFiles (source);
const targetFiles = fs.lstatSync (target, { 'throwIfNoEntry': false })?.isSymbolicLink () ? [] : listFiles (target);
const differences = [];
for (const file of sourceFiles) {
    if (!targetFiles.includes (file)) {
        differences.push ({ file, 'reason': 'missing from the plugin' });
    } else if (!fs.readFileSync (path.join (source, file)).equals (fs.readFileSync (path.join (target, file)))) {
        differences.push ({ file, 'reason': 'differs' });
    }
}
for (const file of targetFiles) {
    if (!sourceFiles.includes (file)) {
        differences.push ({ file, 'reason': 'not in the canonical skill' });
    }
}

const sourceLabel = path.relative (repoRoot, source);
const targetLabel = path.relative (repoRoot, target);
if (checkOnly) {
    for (const { file, reason } of differences) {
        process.stderr.write (`[sync-plugin] ${targetLabel}/${file} ${reason}\n`);
    }
    if (differences.length) {
        process.stderr.write (`[sync-plugin] ${targetLabel} is out of sync with ${sourceLabel} — run "npm run sync-plugin"\n`);
        process.exit (1);
    }
} else if (differences.length) {
    // rebuild from scratch so stale files (and a leftover symlink) never survive
    fs.rmSync (target, { 'recursive': true, 'force': true });
    for (const file of sourceFiles) {
        const destination = path.join (target, file);
        fs.mkdirSync (path.dirname (destination), { 'recursive': true });
        fs.copyFileSync (path.join (source, file), destination);
    }
    for (const { file, reason } of differences) {
        const action = (reason === 'not in the canonical skill') ? 'removed' : 'copied';
        process.stderr.write (`[sync-plugin] ${targetLabel}/${file} (${reason}) -> ${action}\n`);
    }
}
