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
let notices: string;
let metafile: string;

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
    notices = path.join (alone, 'THIRD_PARTY_LICENSES.txt');
    metafile = path.join (dir, 'meta.json');
    const build = spawnSync (process.execPath, [ path.join (mcpRoot, 'scripts', 'build-bundle.mjs'), '--out', bundle, '--metafile', metafile ], { 'encoding': 'utf8' });
    assert.equal (build.status, 0, 'build-bundle failed:\n' + build.stderr);
    // the server and the licences of what is inside it: text beside it, nothing it loads
    assert.deepEqual (fs.readdirSync (alone).sort (), [ 'THIRD_PARTY_LICENSES.txt', 'ccxt-mcp.mjs' ]);
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
        assert.ok (bundledNames.includes ('setup_account') && bundledNames.includes ('manage_accounts'));
        // both loopback pages and the stylesheet they share travel inside the one file
        const bundleText = fs.readFileSync (bundle, 'utf8');
        for (const asset of [ 'ui/setup.html', 'ui/accounts.html', 'ui/setup.css', 'ui/shared.css' ]) {
            assert.ok (bundleText.includes (JSON.stringify (asset) + ':'), asset + ' must be embedded in the bundle');
        }
        assert.ok (bundleText.includes ('<title>Your accounts') && bundleText.includes ('nav.progress'));
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

// The bundle redistributes other projects' code with their comments stripped, so their
// licence texts must travel beside it. The list is derived here a second time, straight from
// esbuild's metafile, and compared with what the build wrote: a package that reaches the
// bundle without its notice fails this test (and, without a licence file, the build itself).
test ('the third-party notices cover exactly the packages in the bundle, with their licence texts', { skip }, () => {
    const text = fs.readFileSync (notices, 'utf8');
    const meta = JSON.parse (fs.readFileSync (metafile, 'utf8'));
    const outputs: any[] = Object.values (meta.outputs);
    assert.equal (outputs.length, 1);
    const expected = new Set<string> ();
    let own = 0;
    for (const [ file, input ] of Object.entries (outputs[0].inputs) as [ string, any ][]) {
        if (input.bytesInOutput === 0) {
            continue;
        }
        const parts = file.split ('node_modules/');
        if (parts.length === 1) {
            assert.ok (file.startsWith ('js/'), file + ' is in the bundle but is neither ccxt-mcp\'s own build nor an npm package');
            own++;
            continue;
        }
        const segments = parts[parts.length - 1].split ('/');
        const name = segments[0].startsWith ('@') ? segments[0] + '/' + segments[1] : segments[0];
        const manifest = JSON.parse (fs.readFileSync (path.join (mcpRoot, parts.slice (0, -1).join ('node_modules/'), 'node_modules', name, 'package.json'), 'utf8'));
        expected.add (manifest.name + '@' + manifest.version + ' (' + manifest.license + ')');
    }
    assert.ok (own > 10);
    const index = text.slice (text.indexOf ('\nPACKAGES\n'), text.indexOf ('\n====')).split ('\n').filter ((line) => /^- \S+@\S+ \(.+\)$/.test (line)).map ((line) => line.slice (2));
    assert.deepEqual ([ ...index ].sort (), [ ...expected ].sort (), 'the notices index and the metafile disagree about what is in the bundle');
    assert.ok (index.length >= 15);
    const rule = '\n' + '='.repeat (80) + '\n';
    // the part of the file about one package: its heading up to the next package's heading
    const section = (heading: string): string => {
        const start = text.indexOf (rule + heading + '@');
        assert.ok (start !== -1, heading + ' has no section in the notices');
        const body = text.indexOf (rule, start + rule.length);
        const next = text.indexOf (rule, body + rule.length);
        return text.slice (start, (next === -1) ? text.length : next);
    };
    // every indexed package has its section, and every section carries at least one licence text
    for (const entry of index) {
        const name = entry.slice (0, entry.lastIndexOf ('@'));
        const body = section (name);
        assert.ok (body.includes ('\n' + '-'.repeat (80) + '\n' + name + ' — '), name + ' has no licence text in the notices');
        assert.match (body, /\n-{80}\n\S+ — (LICEN[SC]E|COPYING|NOTICE)/i, name);
        assert.ok (body.length > 600, name + ': the licence text is suspiciously short');
    }
    // the licences that oblige a redistributor to reproduce their text — by name and by text
    for (const name of [ 'protobufjs', '@protobufjs/aspromise', '@protobufjs/base64', '@protobufjs/eventemitter', '@protobufjs/float', '@protobufjs/pool', '@protobufjs/utf8', 'fast-uri' ]) {
        assert.match (section (name), /License: BSD-3-Clause/, name);
        assert.match (section (name), /Redistribution and use in source and binary forms/, name);
        assert.match (section (name), /Redistributions in binary form must reproduce the above copyright\s+notice/, name);
    }
    assert.match (section ('long'), /License: Apache-2\.0/);
    assert.match (section ('long'), /Apache License\s+Version 2\.0, January 2004/);
    assert.match (section ('long'), /TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION/);
    assert.match (section ('zod-to-json-schema'), /License: ISC/);
    assert.match (section ('zod-to-json-schema'), /Permission to use, copy, modify, and\/or distribute this software/);
    for (const name of [ '@modelcontextprotocol/sdk', 'ajv', 'ws', 'zod', 'ccxt' ]) {
        assert.match (section (name), /License: MIT/, name);
        assert.match (section (name), /Permission is hereby granted, free of charge/, name);
    }
    // ccxt-mcp's own licence opens the file, and the vendored modules without a licence
    // file are said to be exactly that instead of being passed over
    assert.match (text, /^THIRD-PARTY SOFTWARE NOTICES\n\nccxt-mcp \d+\.\d+\.\d+[^\n]*\n\nccxt-mcp itself is distributed under the MIT License:\n\nMIT License\n/);
    const vendoredInBundle = new Set (Object.entries (outputs[0].inputs).filter (([ , input ]: any) => input.bytesInOutput > 0).map (([ file ]) => /\/static_dependencies\/([^/]+)\//.exec (file)?.[1]).filter ((name) => name !== undefined));
    for (const name of vendoredInBundle) {
        assert.match (text, new RegExp ('\\n- ' + name + ' \\(inside ccxt, \\d+ files? in the bundle\\): (NO SEPARATE LICENCE TEXT is shipped with it|licence file\\(s\\): )'), 'the vendored module ' + name + ' is not accounted for in the notices');
    }
    // the bundle points at the notices and names its own licence, right at the top
    const head = fs.readFileSync (bundle, 'utf8').slice (0, 1000);
    assert.match (head, /^(#![^\n]*\n)?\/\/ ccxt-mcp \d+\.\d+\.\d+[^\n]*MIT License, Copyright[^\n]*\n\/\/ [^\n]*third-party software[^\n]*\n\/\/ THIRD_PARTY_LICENSES\.txt/);
});

// What `npm publish` would upload. The bundle in it is useless to a redistributor — and the
// plugin's bootstrap has nothing to cache — without the licence files next to it.
const builtBundle = path.join (mcpRoot, 'js', 'bundle', 'ccxt-mcp.mjs');
test ('the npm package ships its own LICENSE and the third-party notices beside the bundle', { 'skip': fs.existsSync (builtBundle) ? false : 'run npm run build first' }, () => {
    const packed = spawnSync ('npm', [ 'pack', '--dry-run', '--json', '--ignore-scripts' ], { 'cwd': mcpRoot, 'encoding': 'utf8', 'shell': process.platform === 'win32' });
    assert.equal (packed.status, 0, packed.stderr);
    const files: string[] = JSON.parse (packed.stdout)[0].files.map ((file: any) => file.path);
    for (const expected of [ 'LICENSE', 'package.json', 'js/server.js', 'js/bundle/ccxt-mcp.mjs', 'js/bundle/THIRD_PARTY_LICENSES.txt' ]) {
        assert.ok (files.includes (expected), expected + ' is missing from the npm package');
    }
    assert.deepEqual (files.filter ((file) => file.startsWith ('js/bundle/')).sort (), [ 'js/bundle/THIRD_PARTY_LICENSES.txt', 'js/bundle/ccxt-mcp.mjs' ]);
    const license = fs.readFileSync (path.join (mcpRoot, 'LICENSE'), 'utf8');
    assert.match (license, /^MIT License\n/);
    // inside the ccxt repository it is a copy of the one licence the project has
    const rootLicense = path.join (mcpRoot, '..', 'LICENSE.txt');
    if (fs.existsSync (rootLicense)) {
        assert.equal (license, fs.readFileSync (rootLicense, 'utf8'), 'mcp/LICENSE must stay a copy of the repository\'s LICENSE.txt');
    }
    // the notices `npm run build` left in js/bundle are the ones of the bundle next to them
    const shipped = fs.readFileSync (path.join (mcpRoot, 'js', 'bundle', 'THIRD_PARTY_LICENSES.txt'), 'utf8');
    assert.equal (shipped, fs.readFileSync (notices, 'utf8'), 'js/bundle/THIRD_PARTY_LICENSES.txt is out of date — run npm run build');
});
