import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

// One directory, mcp/plugin/, is installed by three hosts that each read a different manifest:
// Claude Code (and Claude-compatible hosts such as Grok) reads .claude-plugin/plugin.json, the
// OpenAI portal / ChatGPT desktop reads the portable plugin.json + mcp.json, and Codex falls
// back to .codex-plugin/plugin.json. Nothing in the hosts cross-checks them, and a breach only
// surfaces at install / portal-upload time — so the invariants are asserted here.
// Portable caps: https://agent-plugins.org/schemas/1.0.0/plugin.schema.json (+ mcp.schema.json)
// and the OpenAI submission limits for the interface block.
const MAX_NAME = 64;
const NAME_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const MAX_INTERFACE: Record<string, number> = {
    'displayName': 30,
    'shortDescription': 30,
    'longDescription': 4000,
    'developerName': 80,
};
const MAX_CAPABILITIES = 20;
const MAX_CAPABILITY_LENGTH = 120;
const PORTABLE_KEYS = [ '$schema', 'name', 'version', 'description', 'author', 'homepage', 'repository', 'license', 'keywords', 'extensions' ];
const PORTABLE_MCP_STDIO_KEYS = [ 'type', 'command', 'args', 'env', 'cwd' ];
const ASSET_EXTENSIONS = [ '.png', '.jpg', '.jpeg', '.webp', '.svg' ];
const MAX_ASSET_BYTES = 5 * 1024 * 1024;
// the starter prompts are one-click buttons: a host shows three at most and truncates long ones
const MAX_DEFAULT_PROMPTS = 3;
const MAX_DEFAULT_PROMPT_LENGTH = 60;
// Two kinds of bundled skill (scripts/sync-plugin.mjs holds the same lists): a synced skill is
// a byte-identical copy of the canonical .claude/skills/<name>; a plugin-native skill lives
// only in plugin/skills, because it is about the plugin itself and must not be offered by the
// repo's skill installer to people who run the server without the plugin.
const SYNCED_SKILLS = [ 'ccxt-mcp' ];
const PLUGIN_NATIVE_SKILLS = [ 'ccxt-get-started' ];
const ONBOARDING_SKILL = 'ccxt-get-started';

const mcpRoot = path.resolve (path.dirname (fileURLToPath (import.meta.url)), '..', '..');
const repoRoot = path.resolve (mcpRoot, '..');
const pluginRoot = path.join (mcpRoot, 'plugin');
const readJson = (file: string): any => JSON.parse (fs.readFileSync (file, 'utf8'));

const pkg = readJson (path.join (mcpRoot, 'package.json'));
const claudeManifest = readJson (path.join (pluginRoot, '.claude-plugin', 'plugin.json'));
const portableManifest = readJson (path.join (pluginRoot, 'plugin.json'));
const codexManifest = readJson (path.join (pluginRoot, '.codex-plugin', 'plugin.json'));
const portableMcp = readJson (path.join (pluginRoot, 'mcp.json'));
const claudeMarketplace = readJson (path.join (repoRoot, '.claude-plugin', 'marketplace.json'));
const codexMarketplace = readJson (path.join (repoRoot, '.agents', 'plugins', 'marketplace.json'));

const manifests: Record<string, any> = {
    '.claude-plugin/plugin.json': claudeManifest,
    'plugin.json': portableManifest,
    '.codex-plugin/plugin.json': codexManifest,
};
// the OpenAI interface block lives under extensions in the portable manifest and at the root
// of the Codex compatibility manifest
const interfaces: Record<string, any> = {
    'plugin.json': portableManifest['extensions']['com.openai']['interface'],
    '.codex-plugin/plugin.json': codexManifest['interface'],
};
const pinnedPackage = pkg['name'] + '@' + pkg['version'];

// every entry under dir (files, directories and links), as paths relative to dir
function walk (dir: string, prefix = ''): string[] {
    const entries: string[] = [];
    for (const entry of fs.readdirSync (dir, { 'withFileTypes': true })) {
        const relative = prefix ? (prefix + '/' + entry.name) : entry.name;
        entries.push (relative);
        if (entry.isDirectory ()) {
            entries.push (...walk (path.join (dir, entry.name), relative));
        }
    }
    return entries.sort ();
}

// the YAML frontmatter of a SKILL.md, as its top-level "key: value" lines
function frontmatter (file: string): Record<string, string> {
    const match = /^---\n([\s\S]*?)\n---\n/.exec (fs.readFileSync (file, 'utf8'));
    assert.ok (match, `${file} has no frontmatter`);
    const fields: Record<string, string> = {};
    for (const line of match[1].split ('\n')) {
        const pair = /^([A-Za-z-]+):\s*(.*)$/.exec (line);
        if (pair) {
            fields[pair[1]] = pair[2];
        }
    }
    return fields;
}

// every "./…" string anywhere in a JSON value
function relativePaths (value: any): string[] {
    if (typeof value === 'string') {
        return value.startsWith ('./') ? [ value ] : [];
    }
    if (value && typeof value === 'object') {
        return Object.values (value).flatMap (relativePaths);
    }
    return [];
}

test ('plugin manifests share one valid name', () => {
    for (const [ file, manifest ] of Object.entries (manifests)) {
        assert.equal (manifest['name'], pkg['name'], `${file} name`);
        assert.match (manifest['name'], NAME_PATTERN, `${file} name`);
        assert.ok (manifest['name'].length <= MAX_NAME, `${file} name is over ${MAX_NAME} chars`);
    }
});

test ('both marketplaces list the plugin under the same name and source', () => {
    assert.equal (claudeMarketplace['name'], 'ccxt');
    assert.equal (codexMarketplace['name'], claudeMarketplace['name']);
    assert.ok (codexMarketplace['interface']['displayName']);
    const claudeEntry = claudeMarketplace['plugins'].find ((entry: any) => entry['name'] === pkg['name']);
    const codexEntry = codexMarketplace['plugins'].find ((entry: any) => entry['name'] === pkg['name']);
    assert.ok (claudeEntry, '.claude-plugin/marketplace.json has no ccxt-mcp entry');
    assert.ok (codexEntry, '.agents/plugins/marketplace.json has no ccxt-mcp entry');
    assert.equal (claudeEntry['source'], './mcp/plugin');
    assert.deepEqual (codexEntry['source'], { 'source': 'local', 'path': './mcp/plugin' });
    // both paths are relative to the repo root and must land on the plugin directory
    assert.equal (path.resolve (repoRoot, claudeEntry['source']), pluginRoot);
    assert.equal (path.resolve (repoRoot, codexEntry['source']['path']), pluginRoot);
});

test ('plugin versions match package.json', () => {
    for (const [ file, manifest ] of Object.entries (manifests)) {
        assert.equal (manifest['version'], pkg['version'], `${file} version`);
    }
    const entry = claudeMarketplace['plugins'].find ((candidate: any) => candidate['name'] === pkg['name']);
    assert.equal (entry['version'], pkg['version'], '.claude-plugin/marketplace.json entry version');
});

test ('Claude Code launches the server through npx pinned to the package version', () => {
    // npx caches an unpinned package forever, so each plugin release pins its server release
    const server = claudeManifest['mcpServers']['ccxt'];
    assert.ok (server, '.claude-plugin/plugin.json has no "ccxt" server');
    assert.equal (server['command'], 'npx');
    assert.deepEqual (server['args'], [ '-y', pinnedPackage ]);
});

test ('the portable mcp.json starts the server through the plugin launcher, relative to the plugin root', () => {
    // OpenAI hosts ship a Node runtime but no npm: scripts/launch finds that runtime and
    // scripts/bootstrap.mjs fetches the pinned server (see plugin/README.md "Runtime")
    const server = portableMcp['mcpServers']['ccxt'];
    assert.ok (server, 'mcp.json has no "ccxt" server');
    assert.deepEqual (server, { 'type': 'stdio', 'command': './scripts/launch', 'args': [ './scripts/bootstrap.mjs' ], 'cwd': './' });
    // the Agent Plugins schema: a stdio command is a bare name or a contained ./ path, and cwd
    // must match this pattern; Codex resolves both against the installed plugin root
    assert.match (server['cwd'], /^(\.\/|\$\{PLUGIN_ROOT\}(\/|$)|\$\{PLUGIN_DATA\}(\/|$))/);
    for (const reference of [ server['command'], ...server['args'] ]) {
        const resolved = path.resolve (pluginRoot, reference);
        assert.ok (resolved.startsWith (pluginRoot + path.sep), `mcp.json path escapes the plugin: ${reference}`);
        assert.ok (fs.existsSync (resolved), `mcp.json references a missing file: ${reference}`);
    }
});

test ('the launcher scripts ship complete: sh + cmd twins, executable, no machine-specific paths', () => {
    const scripts = path.join (pluginRoot, 'scripts');
    assert.deepEqual (fs.readdirSync (scripts).sort (), [ 'bootstrap.mjs', 'launch', 'launch.cmd' ]);
    if (process.platform !== 'win32') {
        // hosts exec the file directly; git must record it as 100755
        assert.equal (fs.statSync (path.join (scripts, 'launch')).mode & 0o111, 0o111, 'plugin/scripts/launch is not executable');
    }
    const sh = fs.readFileSync (path.join (scripts, 'launch'), 'utf8');
    assert.ok (sh.startsWith ('#!/bin/sh\n'));
    assert.ok (!sh.includes ('\r'), 'plugin/scripts/launch must use LF line endings');
    // cmd.exe mis-parses labels in LF-only batch files (.gitattributes pins eol=crlf)
    const cmd = fs.readFileSync (path.join (scripts, 'launch.cmd'), 'utf8');
    assert.ok (cmd.startsWith ('@echo off\r\n'));
    assert.ok (!/[^\r]\n/.test (cmd), 'plugin/scripts/launch.cmd must use CRLF line endings');
    assert.ok (/^[\x00-\x7f]*$/.test (cmd), 'plugin/scripts/launch.cmd must be ASCII: cmd.exe reads it in the console code page');
    // the script argument is plugin-relative, so both twins must leave the host's working
    // directory for the plugin root before they look for anything (launcher.test.ts runs the
    // sh one from a foreign directory; the cmd one can only be checked by reading it)
    assert.ok (cmd.includes ('\r\ncd /d "%~dp0.." 2>nul || goto :no_root\r\n'));
    assert.ok (cmd.indexOf ('cd /d "%~dp0.."') < cmd.indexOf ('call :try'), 'launch.cmd must enter the plugin root before probing for Node');
    assert.ok (cmd.indexOf ('cd /d "%~dp0.."') < cmd.indexOf ('(\'where node'));
    for (const [ file, text ] of [ [ 'launch', sh ], [ 'launch.cmd', cmd ], [ 'bootstrap.mjs', fs.readFileSync (path.join (scripts, 'bootstrap.mjs'), 'utf8') ] ]) {
        // a developer's home or checkout must never be baked into what users run
        assert.ok (!/\/(Users|home)\/[A-Za-z0-9._-]+\//.test (text), `plugin/scripts/${file} contains a user-specific absolute path`);
        assert.ok (!/[A-Za-z]:\\Users\\/.test (text), `plugin/scripts/${file} contains a user-specific absolute path`);
    }
    // the bootstrap has no node_modules to lean on, and must never touch the JSON-RPC channel
    const bootstrap = fs.readFileSync (path.join (scripts, 'bootstrap.mjs'), 'utf8');
    const imported = [ ...bootstrap.matchAll (/^import .* from '([^']+)';$/gm) ].map ((match) => match[1]);
    assert.ok (imported.length > 0 && imported.every ((specifier) => specifier.startsWith ('node:')), 'bootstrap.mjs may only import node: builtins');
    assert.ok (!/process\.stdout|console\.log|process\.stdin/.test (bootstrap), 'bootstrap.mjs must not use stdout or stdin');
    // both ends agree on where the bundle sits inside the npm tarball
    const entry = /const BUNDLE_ENTRY = '(package\/[^']+)';/.exec (bootstrap);
    assert.ok (entry, 'bootstrap.mjs no longer declares BUNDLE_ENTRY');
    const builder = fs.readFileSync (path.join (mcpRoot, 'scripts', 'build-bundle.mjs'), 'utf8');
    const built = /path\.join \(jsDir, '([a-z]+)', '([a-z.-]+)'\)/.exec (builder);
    assert.ok (built, 'build-bundle.mjs no longer declares its output path');
    assert.equal (entry[1], 'package/js/' + built[1] + '/' + built[2]);
    assert.ok (fs.readFileSync (path.join (mcpRoot, 'scripts', 'lock-server.mjs'), 'utf8').includes (`const BUNDLE_ENTRY = '${entry[1]}';`));
});

test ('server.lock.json pins the package version and its registry tarball', () => {
    const lock = readJson (path.join (pluginRoot, 'server.lock.json'));
    assert.deepEqual (Object.keys (lock).sort (), [ 'bundleIntegrity', 'integrity', 'tarball', 'version' ]);
    assert.equal (lock['version'], pkg['version']);
    assert.equal (lock['tarball'], `https://registry.npmjs.org/${pkg['name']}/-/${pkg['name']}-${pkg['version']}.tgz`);
    // both checksums or neither: null means "this release has no verified single-file
    // server", which makes the bootstrap use npx (true for 0.1.3, and between a version bump
    // and the release job's scripts/lock-server.mjs run)
    const pattern = /^sha512-[A-Za-z0-9+/]{86}==$/;
    assert.equal (lock['integrity'] === null, lock['bundleIntegrity'] === null, 'integrity and bundleIntegrity must be set together');
    for (const key of [ 'integrity', 'bundleIntegrity' ]) {
        assert.ok (lock[key] === null || pattern.test (lock[key]), `server.lock.json ${key} is not a sha512 SRI string`);
    }
});

test ('portable plugin.json uses only the keys the Agent Plugins schema allows', () => {
    assert.equal (portableManifest['$schema'], 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json');
    for (const key of Object.keys (portableManifest)) {
        assert.ok (PORTABLE_KEYS.includes (key), `plugin.json has a top-level key the schema rejects: ${key}`);
    }
    for (const [ namespace, value ] of Object.entries (portableManifest['extensions'])) {
        assert.equal (typeof value, 'object', `extensions.${namespace} must be an object`);
    }
});

test ('portable mcp.json declares a stdio server the schema accepts', () => {
    assert.equal (portableMcp['$schema'], 'https://agent-plugins.org/schemas/1.0.0/mcp.schema.json');
    assert.deepEqual (Object.keys (portableMcp).sort (), [ '$schema', 'mcpServers' ]);
    for (const [ name, server ] of Object.entries (portableMcp['mcpServers']) as [ string, any ][]) {
        assert.equal (server['type'], 'stdio', `mcp.json ${name} type`);
        assert.ok (typeof server['command'] === 'string' && server['command'].length > 0, `mcp.json ${name} command`);
        for (const key of Object.keys (server)) {
            assert.ok (PORTABLE_MCP_STDIO_KEYS.includes (key), `mcp.json ${name} has a key the schema rejects: ${key}`);
        }
        for (const key of Object.keys (server['env'] ?? {})) {
            assert.ok (![ 'PLUGIN_ROOT', 'PLUGIN_DATA' ].includes (key), `mcp.json ${name} env may not set ${key}`);
        }
    }
});

test ('the Codex manifest carries the fields Codex requires and points at the portable files', () => {
    assert.equal (codexManifest['$schema'], undefined, 'a standalone Codex manifest must not carry $schema');
    for (const field of [ 'name', 'version', 'description', 'interface' ]) {
        assert.ok (codexManifest[field], `.codex-plugin/plugin.json is missing ${field}`);
    }
    assert.ok (codexManifest['author']['name']);
    assert.equal (codexManifest['skills'], './skills/');
    assert.equal (codexManifest['mcpServers'], './mcp.json');
});

test ('the OpenAI interface block is identical in both manifests and within the caps', () => {
    assert.deepEqual (interfaces['.codex-plugin/plugin.json'], interfaces['plugin.json']);
    for (const [ file, ui ] of Object.entries (interfaces)) {
        for (const [ field, max ] of Object.entries (MAX_INTERFACE)) {
            assert.ok (typeof ui[field] === 'string' && ui[field].length > 0, `${file} interface.${field} is required`);
            // the portal may count bytes rather than runes, so budget for the wider of the two
            assert.ok (ui[field].length <= max, `${file} interface.${field} is ${ui[field].length} chars, over the ${max} cap`);
            assert.ok (Buffer.byteLength (ui[field], 'utf8') <= max, `${file} interface.${field} is over the ${max} cap in bytes`);
        }
        assert.ok (ui['category'], `${file} interface.category is required`);
        assert.ok (Array.isArray (ui['capabilities']) && ui['capabilities'].length > 0 && ui['capabilities'].length <= MAX_CAPABILITIES);
        for (const capability of ui['capabilities']) {
            assert.ok (capability.length <= MAX_CAPABILITY_LENGTH, `${file} capability "${capability}" is over ${MAX_CAPABILITY_LENGTH} chars`);
        }
        assert.ok (Array.isArray (ui['defaultPrompt']) && ui['defaultPrompt'].every ((prompt: any) => typeof prompt === 'string'));
        assert.ok (ui['defaultPrompt'].length > 0 && ui['defaultPrompt'].length <= MAX_DEFAULT_PROMPTS, `${file} interface.defaultPrompt must hold 1-${MAX_DEFAULT_PROMPTS} prompts`);
        for (const prompt of ui['defaultPrompt']) {
            assert.ok (prompt.trim ().length > 0 && prompt.length <= MAX_DEFAULT_PROMPT_LENGTH, `${file} starter prompt "${prompt}" must be 1-${MAX_DEFAULT_PROMPT_LENGTH} chars`);
        }
        for (const field of [ 'composerIcon', 'logo' ]) {
            assert.ok (ui[field], `${file} interface.${field} is required`);
        }
        for (const field of [ 'websiteURL', 'supportURL', 'privacyPolicyURL', 'termsOfServiceURL' ]) {
            if (ui[field] !== undefined) {
                assert.match (ui[field], /^https:\/\//, `${file} interface.${field}`);
            }
        }
    }
});

test ('every relative path a manifest references exists inside the plugin', () => {
    for (const [ file, manifest ] of Object.entries (manifests)) {
        for (const reference of relativePaths (manifest)) {
            const resolved = path.resolve (pluginRoot, reference);
            assert.ok (resolved.startsWith (pluginRoot + path.sep), `${file} path escapes the plugin: ${reference}`);
            assert.ok (fs.existsSync (resolved), `${file} references a missing path: ${reference}`);
            if (reference.startsWith ('./assets/')) {
                assert.ok (ASSET_EXTENSIONS.includes (path.extname (resolved).toLowerCase ()), `${file} asset has an unsupported type: ${reference}`);
                assert.ok (fs.statSync (resolved).size <= MAX_ASSET_BYTES, `${file} asset is over 5 MiB: ${reference}`);
            }
        }
    }
});

test ('Claude userConfig is optional throughout and env references only declared keys', () => {
    const userConfig = claudeManifest['userConfig'] ?? {};
    for (const [ key, option ] of Object.entries (userConfig) as [ string, any ][]) {
        assert.match (key, /^[A-Za-z_][A-Za-z0-9_]*$/, `userConfig key ${key}`);
        for (const field of [ 'type', 'title', 'description' ]) {
            assert.ok (option[field], `userConfig.${key} is missing ${field}`);
        }
        // zero-config install must work: public market data needs no keys
        assert.notEqual (option['required'], true, `userConfig.${key} must stay optional`);
        if (/key|secret|password/i.test (key)) {
            assert.equal (option['sensitive'], true, `userConfig.${key} must be sensitive`);
        }
    }
    // sandbox-first: order placement is off, and the sandbox is on, until the user says otherwise
    if (userConfig['enable_trading']) {
        assert.equal (userConfig['enable_trading']['default'], false);
    }
    if (userConfig['sandbox']) {
        assert.equal (userConfig['sandbox']['default'], true);
    }
    const referenced = new Set<string> ();
    for (const match of JSON.stringify (claudeManifest['mcpServers']).matchAll (/\$\{user_config\.([^}]*)\}/g)) {
        referenced.add (match[1]);
    }
    for (const key of referenced) {
        assert.ok (key in userConfig, `mcpServers references \${user_config.${key}}, which userConfig does not declare`);
    }
    for (const key of Object.keys (userConfig)) {
        assert.ok (referenced.has (key), `userConfig.${key} is declared but never passed to the server`);
    }
});

test ('the plugin directory contains no symlinks', () => {
    // ZIP uploads, Windows checkouts and non-Claude hosts do not reliably follow them
    for (const entry of walk (pluginRoot)) {
        assert.ok (!fs.lstatSync (path.join (pluginRoot, entry)).isSymbolicLink (), `mcp/plugin/${entry} is a symlink`);
    }
});

test ('plugin/skills holds exactly the declared skills, each with matching frontmatter', () => {
    const declared = [ ...SYNCED_SKILLS, ...PLUGIN_NATIVE_SKILLS ].sort ();
    assert.deepEqual (fs.readdirSync (path.join (pluginRoot, 'skills')).sort (), declared, 'declare every bundled skill as synced or plugin-native (here and in scripts/sync-plugin.mjs)');
    for (const name of declared) {
        const fields = frontmatter (path.join (pluginRoot, 'skills', name, 'SKILL.md'));
        // hosts address a skill by its frontmatter name; one that differs from its directory
        // is loaded under a name nothing else (the manifest, the docs) refers to
        assert.equal (fields['name'], name, `skills/${name}/SKILL.md frontmatter name`);
        assert.ok ((fields['description'] ?? '').length > 0, `skills/${name}/SKILL.md needs a description`);
    }
});

test ('synced skills are byte-identical to their canonical .claude/skills copy', () => {
    for (const name of SYNCED_SKILLS) {
        const canonical = path.join (repoRoot, '.claude', 'skills', name);
        const bundled = path.join (pluginRoot, 'skills', name);
        assert.ok (fs.existsSync (path.join (bundled, 'SKILL.md')), `the plugin does not bundle skills/${name}/SKILL.md`);
        assert.deepEqual (walk (bundled), walk (canonical), `skills/${name}: file lists differ — run "npm run sync-plugin"`);
        for (const entry of walk (canonical)) {
            if (fs.statSync (path.join (canonical, entry)).isFile ()) {
                const same = fs.readFileSync (path.join (canonical, entry)).equals (fs.readFileSync (path.join (bundled, entry)));
                assert.ok (same, `skills/${name}/${entry} differs from the canonical skill — run "npm run sync-plugin"`);
            }
        }
    }
});

test ('plugin-native skills have no canonical twin', () => {
    // two copies with no sync between them would drift; a skill is one kind or the other
    for (const name of PLUGIN_NATIVE_SKILLS) {
        assert.ok (!fs.existsSync (path.join (repoRoot, '.claude', 'skills', name)), `.claude/skills/${name} exists — make ${name} a synced skill instead`);
    }
});

test ('the onboarding skill is wired for OpenAI hosts in both manifests', () => {
    // Codex (checked with CLI 0.171.0, app-server plugin/read) resolves the onboarding skill
    // from extensions["com.openai"].onboardingSkill — a path to the SKILL.md relative to the
    // plugin root — in the portable manifest, and from the same key in a standalone Codex
    // manifest; a top-level or interface-level key is ignored there.
    const expected = './skills/' + ONBOARDING_SKILL + '/SKILL.md';
    assert.equal (portableManifest['extensions']['com.openai']['onboardingSkill'], expected);
    assert.equal (codexManifest['extensions']['com.openai']['onboardingSkill'], expected);
    assert.ok (PLUGIN_NATIVE_SKILLS.includes (ONBOARDING_SKILL) || SYNCED_SKILLS.includes (ONBOARDING_SKILL));
    // the Codex interface block stays at the manifest root: under extensions it would be a
    // second copy that the identity test above does not compare
    assert.deepEqual (Object.keys (codexManifest['extensions']), [ 'com.openai' ]);
    assert.deepEqual (Object.keys (codexManifest['extensions']['com.openai']), [ 'onboardingSkill' ]);
});

test ('the onboarding skill keeps its safety script', () => {
    // the skill is the only thing between a first-time user and a pasted API key; these are
    // the lines a well-meaning edit must not drop
    const text = fs.readFileSync (path.join (pluginRoot, 'skills', ONBOARDING_SKILL, 'SKILL.md'), 'utf8');
    for (const needle of [ 'setup_account', 'list_accounts', 'show_balance', 'get_safety_status', 'Never enable withdrawals', 'delete that key on the exchange', 'explicit yes' ]) {
        assert.ok (text.includes (needle), `skills/${ONBOARDING_SKILL}/SKILL.md no longer mentions "${needle}"`);
    }
    assert.ok (text.split ('\n').length <= 130, 'the onboarding skill is a script, not a manual — keep it short');
});

test ('the onboarding skill does not offer futures on a Binance testnet account', () => {
    // the skill's default path is Binance + testnet, and ccxt refuses every private futures
    // call there (binance.ts sign(): "testnet/sandbox mode is not supported for futures
    // anymore") — so wherever the skill offers positions it must say where they do not work,
    // and it must be able to explain that error when the user hits it anyway
    const lines = fs.readFileSync (path.join (pluginRoot, 'skills', ONBOARDING_SKILL, 'SKILL.md'), 'utf8').split ('\n');
    const fallback = lines.findIndex ((line) => line.startsWith ('## If the setup tool is missing'));
    assert.ok (fallback > 0, 'the fallback section moved or was renamed — update this test');
    // the fallback section only maps tool names for an older server; it offers nothing
    const offers = lines.slice (0, fallback).filter ((line) => line.includes ('show_positions'));
    assert.ok (offers.length > 0, 'the skill no longer mentions show_positions before the fallback section');
    for (const line of offers) {
        assert.ok (/spot only/.test (line) && /Demo trading/.test (line), 'a line offers show_positions without saying the Binance testnet is spot only: ' + line);
    }
    const text = lines.join ('\n');
    assert.ok (text.includes ('testnet/sandbox mode is not supported for futures'), 'the skill no longer explains the Binance futures-on-testnet error');
    assert.ok (text.includes ('https://demo.binance.com'), 'the skill no longer says where Binance demo-trading keys come from');
});

test ('the sync scripts report no drift', () => {
    for (const script of [ 'sync-versions.mjs', 'sync-plugin.mjs' ]) {
        const check = spawnSync (process.execPath, [ path.join (mcpRoot, 'scripts', script), '--check' ], { 'encoding': 'utf8' });
        assert.equal (check.status, 0, `${script} --check failed:\n${check.stderr}`);
    }
});
