import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { canonicalUrl, loadConfig } from '../../hosted/src/config.js';
import { HOSTED_TOOLS } from '../../hosted/src/profile.js';

// The hosted plugin (mcp/hosted/plugin) is published in up to five places that nobody
// re-reads together: the Claude manifests, the OpenAI (Agent Plugins) manifests, the two repo
// marketplaces and the MCP Registry entry in server.json. A directory rejects a submission
// for one over-long string or a missing icon, and a URL that drifts in one file silently
// installs a different server for that host. So the invariants are pinned here, against the
// values the directories document:
// - Claude: https://code.claude.com/docs/en/plugins/manifest-reference and
//   https://claude.com/docs/plugins/pre-submission-checklist
// - OpenAI: https://developers.openai.com/plugins/deploy/submission (field reference) and
//   https://developers.openai.com/plugins/plugin-guidelines

const mcpRoot = path.resolve (path.dirname (fileURLToPath (import.meta.url)), '..', '..');
const repoRoot = path.resolve (mcpRoot, '..');
const pluginRoot = path.join (mcpRoot, 'hosted', 'plugin');

function readJson (file: string): any {
    return JSON.parse (fs.readFileSync (file, 'utf8'));
}

const claudePlugin = readJson (path.join (pluginRoot, '.claude-plugin', 'plugin.json'));
const claudeMcp = readJson (path.join (pluginRoot, '.mcp.json'));
const openaiPlugin = readJson (path.join (pluginRoot, 'plugin.json'));
const openaiMcp = readJson (path.join (pluginRoot, 'mcp.json'));
const claudeMarketplace = readJson (path.join (repoRoot, '.claude-plugin', 'marketplace.json'));
const openaiMarketplace = readJson (path.join (repoRoot, '.agents', 'plugins', 'marketplace.json'));
const serverJson = readJson (path.join (mcpRoot, 'server.json'));
const openai = openaiPlugin['extensions']['com.openai'];
const listing = openai['interface'];

// the URL the hosted server answers on with its default configuration: the one value every
// manifest must carry (it is also the phase-2 OAuth audience and Claude's ui.domain input,
// so it can never change once a directory has it)
const HOSTED_URL = canonicalUrl (loadConfig ({}));
const PLUGIN_NAME = 'ccxt';
const SERVER_NAME = 'ccxt';

function claudeEntry (): any {
    return claudeMarketplace['plugins'].find ((entry: any) => entry['name'] === PLUGIN_NAME);
}

function listFiles (dir: string): string[] {
    const out: string[] = [];
    for (const entry of fs.readdirSync (dir, { 'withFileTypes': true })) {
        const full = path.join (dir, entry.name);
        out.push (full);
        if (entry.isDirectory ()) {
            out.push (...listFiles (full));
        }
    }
    return out;
}

// a relative "./" path that resolves to a regular file inside the plugin folder
function pluginFile (relative: string): string {
    assert.match (relative, /^\.\//, relative + ' must be a ./-prefixed relative path');
    const full = path.resolve (pluginRoot, relative);
    assert.ok (full.startsWith (pluginRoot + path.sep), relative + ' escapes the plugin folder');
    assert.ok (fs.statSync (full).isFile (), relative + ' is not a file');
    return full;
}

function imageSize (file: string): { width: number, height: number } {
    const data = fs.readFileSync (file);
    if (file.endsWith ('.png')) {
        assert.equal (data.subarray (1, 4).toString ('latin1'), 'PNG', file + ' is not a PNG');
        return { 'width': data.readUInt32BE (16), 'height': data.readUInt32BE (20) };
    }
    if (file.endsWith ('.svg')) {
        const viewBox = /viewBox="\s*[-\d.]+\s+[-\d.]+\s+([\d.]+)\s+([\d.]+)\s*"/.exec (data.toString ('utf8'));
        assert.ok (viewBox, file + ' has no numeric viewBox');
        return { 'width': Number (viewBox![1]), 'height': Number (viewBox![2]) };
    }
    throw new Error ('unexpected image type: ' + file);
}

// WCAG relative luminance contrast, the measure OpenAI states the brand colours against
function contrast (a: string, b: string): number {
    const luminance = (hex: string) => {
        const channels = [ 1, 3, 5 ].map ((at) => parseInt (hex.slice (at, at + 2), 16) / 255);
        const linear = channels.map ((c) => (c <= 0.03928) ? c / 12.92 : Math.pow ((c + 0.055) / 1.055, 2.4));
        return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
    };
    const [ light, dark ] = [ luminance (a), luminance (b) ].sort ((x, y) => y - x);
    return (light + 0.05) / (dark + 0.05);
}

test ('the hosted URL is an https URL ending in /mcp', () => {
    assert.equal (HOSTED_URL, 'https://mcp.ccxt.com/mcp');
});

test ('every manifest points at the same hosted URL, with one server', () => {
    // Claude reads .mcp.json (type http); OpenAI reads mcp.json (type streamable-http, and
    // "only one MCP server can be connected per plugin")
    for (const [ file, config, type ] of [ [ '.mcp.json', claudeMcp, 'http' ], [ 'mcp.json', openaiMcp, 'streamable-http' ] ]) {
        const servers = config['mcpServers'];
        assert.deepEqual (Object.keys (servers), [ SERVER_NAME ], file + ' must declare exactly the ' + SERVER_NAME + ' server');
        // a url without a type is a configuration error in Claude Code, and headers are
        // rejected by OpenAI's public submission
        assert.deepEqual (servers[SERVER_NAME], { 'type': type, 'url': HOSTED_URL }, file);
    }
    // added to server.json at launch only (every release publishes it to the MCP Registry)
    if (serverJson['remotes'] !== undefined) {
        assert.deepEqual (serverJson['remotes'], [ { 'type': 'streamable-http', 'url': HOSTED_URL } ]);
    }
    // the Claude manifest must not declare a second copy of the server inline
    assert.equal (claudePlugin['mcpServers'], undefined);
});

test ('the stdio package entry of server.json is unchanged by the remote', () => {
    assert.equal (serverJson['packages'].length, 1);
    assert.equal (serverJson['packages'][0]['identifier'], 'ccxt-mcp');
    assert.equal (serverJson['packages'][0]['transport']['type'], 'stdio');
});

test ('names: "ccxt" everywhere, displayed as "CCXT", never with "MCP" or "Plugin" appended', () => {
    assert.equal (claudePlugin['name'], PLUGIN_NAME);
    assert.equal (openaiPlugin['name'], PLUGIN_NAME);
    assert.match (openaiPlugin['name'], /^(?!.*(?:--|\.\.))[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/);
    assert.ok (openaiPlugin['name'].length <= 64);
    // OpenAI guideline 1.3: do not append "MCP", "MCP Server" or "Plugin" to a product name
    for (const name of [ claudePlugin['displayName'], claudeEntry ()['displayName'], listing['displayName'] ]) {
        assert.equal (name, 'CCXT');
    }
    assert.equal (listing['developerName'], 'CCXT');
});

test ('the local plugin stays listed, under its own name', () => {
    // renaming or dropping it would uninstall it for every existing user
    const local = claudeMarketplace['plugins'].find ((entry: any) => entry['name'] === 'ccxt-mcp');
    assert.ok (local, 'the ccxt-mcp entry must stay in .claude-plugin/marketplace.json');
    assert.equal (local['source'], './mcp/plugin');
    const names = claudeMarketplace['plugins'].map ((entry: any) => entry['name']);
    assert.equal (new Set (names).size, names.length, 'plugin names in a marketplace must be unique');
});

test ('both marketplaces resolve the hosted entry to this folder', () => {
    assert.equal (claudeEntry ()['source'], './mcp/hosted/plugin');
    assert.equal (openaiMarketplace['plugins'].length, 1, 'the OpenAI marketplace lists the hosted plugin only');
    const entry = openaiMarketplace['plugins'][0];
    assert.equal (entry['name'], PLUGIN_NAME);
    // source.path is relative to the marketplace root (the repo), not to .agents/plugins/
    assert.deepEqual (entry['source'], { 'source': 'local', 'path': './mcp/hosted/plugin' });
    assert.equal (path.resolve (repoRoot, entry['source']['path']), pluginRoot);
    // "Always include policy.installation, policy.authentication, and category"
    assert.ok ([ 'AVAILABLE', 'INSTALLED_BY_DEFAULT', 'NOT_AVAILABLE' ].includes (entry['policy']['installation']));
    assert.ok (typeof entry['policy']['authentication'] === 'string' && entry['policy']['authentication'].length > 0);
    assert.equal (entry['category'], listing['category']);
});

test ('versions agree across the manifests', () => {
    assert.equal (openaiPlugin['version'], claudePlugin['version']);
    assert.equal (claudeEntry ()['version'], claudePlugin['version']);
});

test ('listing URLs are https, within the caps, and the same for both directories', () => {
    const pairs: [ string, string ][] = [
        [ claudePlugin['supportUrl'], listing['supportURL'] ],
        [ claudePlugin['privacyPolicyUrl'], listing['privacyPolicyURL'] ],
        [ claudePlugin['termsOfServiceUrl'], listing['termsOfServiceURL'] ],
        [ claudePlugin['documentationUrl'], listing['websiteURL'] ],
    ];
    for (const [ claude, openaiUrl ] of pairs) {
        assert.equal (claude, openaiUrl);
        assert.match (claude, /^https:\/\/[^\s@]+$/);
        assert.ok (claude.length <= 1024);
    }
});

test ('OpenAI listing text is within the public-submission caps', () => {
    assert.ok (listing['displayName'].length <= 30);
    assert.ok (listing['shortDescription'].length > 0 && listing['shortDescription'].length <= 30);
    assert.ok (listing['longDescription'].length > 0 && listing['longDescription'].length <= 4000);
    assert.ok (listing['developerName'].length <= 80);
    assert.ok (typeof listing['category'] === 'string' && listing['category'].length > 0);
    assert.ok (listing['capabilities'].length <= 20);
    for (const capability of listing['capabilities']) {
        assert.ok (capability.length <= 120);
    }
    const prompts: string[] = listing['defaultPrompt'];
    assert.ok (prompts.length <= 3);
    assert.equal (new Set (prompts).size, prompts.length, 'starter prompts must be unique');
    for (const prompt of prompts) {
        assert.ok (prompt.length <= 128, prompt);
        assert.ok (!prompt.includes ('@'), 'starter prompts must not @mention: ' + prompt);
    }
    assert.ok (openaiPlugin['description'].length <= 4000);
    assert.ok (openaiPlugin['keywords'].length <= 25);
    assert.ok (claudePlugin['author']['name'].length <= 120);
});

test ('brand colours are #RRGGBB with at least 2:1 contrast', () => {
    assert.match (listing['brandColor'], /^#[0-9a-fA-F]{6}$/);
    assert.ok (contrast (listing['brandColor'], '#ffffff') >= 2);
    if (listing['brandColorDark'] !== undefined) {
        assert.match (listing['brandColorDark'], /^#[0-9a-fA-F]{6}$/);
        assert.ok (contrast (listing['brandColorDark'], '#212121') >= 2);
    }
});

test ('icons and logos exist, are square, at least 48 px and at most 5 MiB', () => {
    const images = [ claudePlugin['icon'], listing['logo'], listing['logoDark'], listing['composerIcon'], listing['composerIconDark'] ].filter ((value) => value !== undefined);
    assert.ok (listing['logo'] && listing['composerIcon'], 'OpenAI requires logo and composerIcon');
    for (const relative of images) {
        const file = pluginFile (relative);
        assert.ok (fs.statSync (file).size <= 5 * 1024 * 1024, relative + ' is over 5 MiB');
        const { width, height } = imageSize (file);
        assert.equal (width, height, relative + ' is not square');
        assert.ok (width >= 48 && width <= 4096, relative + ' is ' + width + ' px');
    }
    // Claude's directory is stricter for its listing icon (claude plugin validate,
    // ICON_MISSING): a square PNG or JPEG, 512 to 2048 px a side, under 2 MB — and it is
    // taken only the first time the plugin is saved in the portal
    const icon = pluginFile (claudePlugin['icon']);
    assert.match (icon, /\.png$/);
    assert.ok (fs.statSync (icon).size < 2 * 1024 * 1024);
    const { width } = imageSize (icon);
    assert.ok (width >= 512 && width <= 2048, claudePlugin['icon'] + ' is ' + width + ' px');
});

test ('review cases: exactly five positive and three negative, naming real hosted tools', () => {
    const cases = openai['review']['test_cases'];
    assert.equal (cases['positive'].length, 5);
    assert.equal (cases['negative'].length, 3);
    for (const positive of cases['positive']) {
        assert.ok (positive['description'] && positive['prompt'] && positive['expected_behavior']);
        const tools = positive['tools_triggered'].split (',').map ((name: string) => name.trim ());
        for (const tool of tools) {
            assert.ok (tool in HOSTED_TOOLS, 'review case names a tool the hosted server does not list: ' + tool);
        }
    }
    for (const negative of cases['negative']) {
        assert.ok (negative['description'] && negative['prompt']);
    }
    // the ZIP importer rejects these, and they would publish reviewer secrets
    assert.equal (openai['review']['test_credentials'], undefined);
    assert.equal (openai['review']['reviewer_instructions'], undefined);
});

test ('the skill names only tools the hosted server lists', () => {
    const skill = fs.readFileSync (path.join (pluginRoot, 'skills', 'ccxt', 'SKILL.md'), 'utf8');
    const front = /^---\n([\s\S]*?)\n---\n/.exec (skill);
    assert.ok (front, 'SKILL.md needs YAML front matter');
    assert.match (front![1], /^name: ccxt$/m);
    assert.match (front![1], /^description: .{20,}$/m);
    const mentioned = new Set ([ ...skill.matchAll (/`((?:list|describe|search|get|show|call|watch|create|cancel|edit|fetch|execute|set|withdraw|transfer)_[a-z_]+)`/g) ].map ((match) => match[1]));
    assert.ok (mentioned.size > 0);
    for (const tool of mentioned) {
        assert.ok (tool in HOSTED_TOOLS, 'the skill names ' + tool + ', which the hosted server does not list');
    }
    for (const tool of [ 'search_markets', 'show_chart', 'show_orderbook', 'show_tickers' ]) {
        assert.ok (mentioned.has (tool), 'the skill should steer the model to ' + tool);
    }
});

test ('the folder passes the directories\' packaging rules', () => {
    const files = listFiles (pluginRoot);
    // Claude pre-submission checklist: no symlinks, at most 512 files, non-image files under
    // 256 KiB; OpenAI: no lifecycle hooks and no app references in a public ZIP
    assert.ok (files.length <= 512);
    for (const file of files) {
        const relative = path.relative (pluginRoot, file);
        assert.ok (!fs.lstatSync (file).isSymbolicLink (), relative + ' is a symlink');
        if (fs.statSync (file).isFile () && !/\.(png|svg|jpe?g|webp)$/.test (file)) {
            assert.ok (fs.statSync (file).size < 256 * 1024, relative + ' is over 256 KiB');
        }
        assert.ok (!/(^|\/)(hooks|\.app\.json|\.codex-plugin)(\/|$)/.test (relative), relative + ' is not allowed in a public plugin');
    }
    assert.ok (fs.statSync (path.join (pluginRoot, 'LICENSE')).isFile ());
    const readme = fs.readFileSync (path.join (pluginRoot, 'README.md'), 'utf8');
    assert.ok (readme.split (/\s+/).filter ((word) => word.length > 0).length >= 40, 'README needs at least 40 words');
    assert.equal (claudePlugin['license'], 'MIT');
});
