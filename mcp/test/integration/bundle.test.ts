import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

// The single-file bundle (scripts/build-bundle.mjs) is what the plugin runs on machines with
// no npm, so it has to work with NOTHING beside it: no node_modules, no package.json, no ui/
// or data/ directory. It is built here into an empty directory and spoken to over real stdio,
// next to the unbundled build it was made from — the two must be indistinguishable.
const here = path.dirname (fileURLToPath (import.meta.url));
const mcpRoot = path.resolve (here, '..', '..');
const serverEntry = path.join (mcpRoot, 'js', 'server.js');
const docManifest = path.join (mcpRoot, 'js', 'data', 'method-docs.json');
const skip = !fs.existsSync (serverEntry) ? 'run npm run build first' : false;

let dir: string;
let bundle: string;

function cleanEnv (configPath: string): Record<string, string> {
    const env: Record<string, string> = {};
    for (const [ key, value ] of Object.entries (process.env)) {
        // strip ambient credentials, and NODE_PATH so the bundle cannot borrow a module
        if (value !== undefined && !/APIKEY|SECRET|PASSWORD|PRIVATEKEY|CCXT_MCP|^NODE_PATH$/.test (key)) {
            env[key] = value;
        }
    }
    env['CCXT_MCP_CONFIG'] = configPath;
    return env;
}

async function connect (entry: string, cwd: string): Promise<Client> {
    const config = path.join (dir, 'config.json');
    const transport = new StdioClientTransport ({ 'command': process.execPath, 'args': [ entry ], cwd, 'env': cleanEnv (config) });
    const client = new Client ({ 'name': 'bundle-test', 'version': '0.0.1' });
    await client.connect (transport);
    return client;
}

before (() => {
    if (skip) {
        return;
    }
    dir = fs.mkdtempSync (path.join (os.tmpdir (), 'ccxt-mcp-bundle-'));
    fs.writeFileSync (path.join (dir, 'config.json'), '{}', { 'mode': 0o600 });
    const alone = path.join (dir, 'alone');
    fs.mkdirSync (alone);
    bundle = path.join (alone, 'ccxt-mcp.mjs');
    const build = spawnSync (process.execPath, [ path.join (mcpRoot, 'scripts', 'build-bundle.mjs'), '--out', bundle ], { 'encoding': 'utf8' });
    assert.equal (build.status, 0, 'build-bundle failed:\n' + build.stderr);
    assert.deepEqual (fs.readdirSync (alone), [ 'ccxt-mcp.mjs' ]);
});

after (() => {
    if (dir !== undefined) {
        fs.rmSync (dir, { 'recursive': true, 'force': true });
    }
});

test ('the bundle, alone in a directory, serves the same tools, views and method docs as the build', { skip }, async () => {
    const bundled = await connect (bundle, path.dirname (bundle));
    const unbundled = await connect (serverEntry, mcpRoot);
    try {
        // the version comes from the embedded copy of package.json
        const pkg = JSON.parse (fs.readFileSync (path.join (mcpRoot, 'package.json'), 'utf8'));
        assert.equal (bundled.getServerVersion ()?.version, pkg.version);
        assert.equal (bundled.getInstructions (), unbundled.getInstructions ());

        const names = async (client: Client): Promise<string[]> => (await client.listTools ()).tools.map ((tool: any) => tool.name).sort ();
        const bundledNames = await names (bundled);
        assert.deepEqual (bundledNames, await names (unbundled));
        assert.ok (bundledNames.length >= 30);
        // the setup form's page is an embedded asset too; opening a browser is not for a test
        assert.ok (bundledNames.includes ('setup_account'));
        assert.ok (bundledNames.includes ('watch_subscribe'), 'ccxt.pro streaming must survive bundling');

        // every view is an embedded asset with its shared fragments inlined
        const resources = (await bundled.listResources ()).resources.map ((resource: any) => resource.uri).sort ();
        assert.ok (resources.includes ('ui://ccxt/chart.html'));
        for (const uri of resources) {
            const fromBundle: any = (await bundled.readResource ({ uri })).contents[0];
            const fromBuild: any = (await unbundled.readResource ({ uri })).contents[0];
            assert.ok (fromBundle.text.startsWith ('<!doctype html>'), uri);
            assert.ok (!fromBundle.text.includes ('@include'), uri + ' has an unresolved fragment');
            assert.equal (fromBundle.text, fromBuild.text, uri);
        }

        // describe_method answers from the embedded documentation manifest
        const describe = { 'name': 'describe_method', 'arguments': { 'exchange': 'kraken', 'method': 'fetchOHLCV' } };
        const fromBundle: any = await bundled.callTool (describe);
        const fromBuild: any = await unbundled.callTool (describe);
        assert.ok (!fromBundle.isError, JSON.stringify (fromBundle.content));
        assert.equal (fromBundle.content[0].text, fromBuild.content[0].text);
        if (fs.existsSync (docManifest)) {
            assert.match (fromBundle.content[0].text, /docs\.kraken\.com/, 'the per-exchange @see link comes only from the manifest');
        }

        // ccxt itself is whole: every exchange id the build knows is in the bundle
        const list = { 'name': 'list_exchanges', 'arguments': {} };
        assert.equal (((await bundled.callTool (list)) as any).content[0].text, ((await unbundled.callTool (list)) as any).content[0].text);
    } finally {
        await bundled.close ();
        await unbundled.close ();
    }
});

// Node resolves a bare specifier by walking up from the FILE's directory through every
// ancestor's node_modules. The bootstrap only checksums the bundle, so anything the bundle
// loaded that way would run unverified inside the process that holds the API keys — and a
// stray ~/node_modules is a common accident. Packages named like every optional module ccxt
// and ws try to load are planted beside the bundle's directory; none may ever execute.
test ('the bundle loads no package from a node_modules above it', { skip }, async () => {
    const planted = [ 'bufferutil', 'utf-8-validate', 'http-proxy-agent', 'https-proxy-agent', 'socks-proxy-agent', 'undici', 'protobufjs', 'ws' ];
    const log = path.join (dir, 'planted.log');
    for (const name of planted) {
        const packageDir = path.join (dir, 'node_modules', name);
        fs.mkdirSync (packageDir, { 'recursive': true });
        fs.writeFileSync (path.join (packageDir, 'package.json'), JSON.stringify ({ name, 'version': '0.0.0', 'main': 'index.js' }));
        fs.writeFileSync (path.join (packageDir, 'index.js'), 'require (\'fs\').appendFileSync (' + JSON.stringify (log) + ', ' + JSON.stringify (name + '\n') + ');\nmodule.exports = {};\n');
    }
    const client = await connect (bundle, path.dirname (bundle));
    try {
        // ws is loaded at server start; ccxt looks for the proxy agents on the first HTTP
        // request of an exchange. Whether that request reaches the exchange does not matter.
        await client.callTool ({ 'name': 'call_read_method', 'arguments': { 'exchange': 'kraken', 'method': 'fetchTime' } }).catch (() => undefined);
    } finally {
        await client.close ();
    }
    assert.equal (fs.existsSync (log) ? fs.readFileSync (log, 'utf8') : '', '', 'the bundle executed packages from a node_modules directory above it');
});

test ('the bundle has no import or require that Node would resolve from disk', { skip }, () => {
    const text = fs.readFileSync (bundle, 'utf8');
    // the one non-literal import left is ccxt's loadLighterLibrary (), which imports the
    // wasm_exec.js whose absolute path the user put in the exchange options
    const dynamic = text.match (/\bimport\s*\(\s*(?!["'`])[^)]{0,80}/g) ?? [];
    assert.deepEqual (dynamic.map ((found) => found.replace (/\s+/g, '')), [ 'import(filePathToFileUrlForWindows2(wasmExecPath' ]);
    // the banner's require () answers for Node builtins only
    assert.match (text, /__ccxtMcpBuiltins/);
});
