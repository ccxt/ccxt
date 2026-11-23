// Keeps plugin/skills in order. The plugin ships two kinds of skill:
//   synced         a real copy of a canonical repo skill (<repo>/.claude/skills/<name>), copied
//                  rather than symlinked because ZIP uploads, Windows checkouts and non-Claude
//                  hosts do not reliably follow symlinks;
//   plugin-native  written in plugin/skills and living only there, because it is about the
//                  plugin itself (first-run onboarding) and must not be offered by the repo's
//                  skill installer to people who use the server without the plugin.
// Anything else under plugin/skills is an error: a skill nobody declared would ship unreviewed.
// Run after editing a canonical skill. With --check it only verifies (exit 1 on drift, listing
// what differs) — suitable for CI / a prepublish guard.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname (fileURLToPath (import.meta.url));
const mcpRoot = path.resolve (here, '..');
const repoRoot = path.resolve (mcpRoot, '..');
const checkOnly = process.argv.includes ('--check');

// test/schema/plugin.test.ts carries the same two lists and asserts they agree with the directory
const SYNCED_SKILLS = [ 'ccxt-mcp' ];
const PLUGIN_NATIVE_SKILLS = [ 'ccxt-get-started' ];

const skillsRoot = path.join (mcpRoot, 'plugin', 'skills');
const label = (file) => path.relative (repoRoot, file).split (path.sep).join ('/');

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

// files of one synced skill that differ from, are missing from, or are extra to its canonical copy
function compare (source, target) {
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
    return { sourceFiles, differences };
}

let failed = false;
const fail = (message) => {
    process.stderr.write (`[sync-plugin] ${message}\n`);
    failed = true;
};

for (const name of SYNCED_SKILLS) {
    const source = path.join (repoRoot, '.claude', 'skills', name);
    const target = path.join (skillsRoot, name);
    if (!fs.existsSync (path.join (source, 'SKILL.md'))) {
        fail (`canonical skill not found at ${label (source)}`);
        continue;
    }
    const { sourceFiles, differences } = compare (source, target);
    if (checkOnly) {
        for (const { file, reason } of differences) {
            fail (`${label (target)}/${file} ${reason}`);
        }
        if (differences.length) {
            fail (`${label (target)} is out of sync with ${label (source)} — run "npm run sync-plugin"`);
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
            process.stderr.write (`[sync-plugin] ${label (target)}/${file} (${reason}) -> ${action}\n`);
        }
    }
}

// Plugin-native skills are never written here — there is nothing to copy them from — but a
// missing one, a canonical twin (two sources of truth), or an undeclared directory is drift
// this script is the place to catch, in both modes.
for (const name of PLUGIN_NATIVE_SKILLS) {
    if (!fs.existsSync (path.join (skillsRoot, name, 'SKILL.md'))) {
        fail (`plugin-native skill ${label (path.join (skillsRoot, name))}/SKILL.md is missing`);
    }
    if (fs.existsSync (path.join (repoRoot, '.claude', 'skills', name))) {
        fail (`${name} is declared plugin-native but .claude/skills/${name} also exists — move it to SYNCED_SKILLS or delete one copy`);
    }
}
const declared = [ ...SYNCED_SKILLS, ...PLUGIN_NATIVE_SKILLS ];
for (const entry of fs.readdirSync (skillsRoot)) {
    if (!declared.includes (entry)) {
        fail (`${label (path.join (skillsRoot, entry))} is neither a synced nor a plugin-native skill — declare it in scripts/sync-plugin.mjs`);
    }
}

if (failed) {
    process.exit (1);
}
