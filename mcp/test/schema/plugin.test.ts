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

test ('the MCP server is launched through npx pinned to the package version', () => {
    // npx caches an unpinned package forever, so each plugin release pins its server release
    const servers: Record<string, any> = {
        '.claude-plugin/plugin.json': claudeManifest['mcpServers']['ccxt'],
        'mcp.json': portableMcp['mcpServers']['ccxt'],
    };
    for (const [ file, server ] of Object.entries (servers)) {
        assert.ok (server, `${file} has no "ccxt" server`);
        assert.equal (server['command'], 'npx', `${file} command`);
        assert.deepEqual (server['args'], [ '-y', pinnedPackage ], `${file} args`);
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

test ('the bundled skill is byte-identical to the canonical .claude/skills/ccxt-mcp', () => {
    const canonical = path.join (repoRoot, '.claude', 'skills', 'ccxt-mcp');
    const bundled = path.join (pluginRoot, 'skills', 'ccxt-mcp');
    assert.ok (fs.existsSync (path.join (bundled, 'SKILL.md')), 'the plugin does not bundle skills/ccxt-mcp/SKILL.md');
    assert.deepEqual (walk (bundled), walk (canonical), 'file lists differ — run "npm run sync-plugin"');
    for (const entry of walk (canonical)) {
        if (fs.statSync (path.join (canonical, entry)).isFile ()) {
            const same = fs.readFileSync (path.join (canonical, entry)).equals (fs.readFileSync (path.join (bundled, entry)));
            assert.ok (same, `skills/ccxt-mcp/${entry} differs from the canonical skill — run "npm run sync-plugin"`);
        }
    }
});

test ('the sync scripts report no drift', () => {
    for (const script of [ 'sync-versions.mjs', 'sync-plugin.mjs' ]) {
        const check = spawnSync (process.execPath, [ path.join (mcpRoot, 'scripts', script), '--check' ], { 'encoding': 'utf8' });
        assert.equal (check.status, 0, `${script} --check failed:\n${check.stderr}`);
    }
});
