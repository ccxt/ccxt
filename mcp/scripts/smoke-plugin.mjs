// End-to-end check of what a user without Node.js gets from the plugin on an OpenAI host:
//
//   packed npm tarball  ->  stand-in registry on loopback  ->  plugin/scripts/launch
//   ->  plugin/scripts/bootstrap.mjs (download, verify, cache)  ->  the single-file server
//   ->  MCP initialize / tools/list / resources/read over stdio
//
// in an environment shaped like that user's: a scratch HOME, PATH=/usr/bin:/bin, nothing
// inherited, and the only "app runtime" a Node placed where the ChatGPT desktop app keeps
// its own (~/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node).
// It runs a scratch COPY of the plugin whose lock points at the loopback registry, so the
// committed plugin and its lock are never touched and no knob exists that a user could set.
//
// Usage: node scripts/smoke-plugin.mjs [--tarball <ccxt-mcp-x.y.z.tgz>] [--live <exchange>]
//   --tarball  test this exact file (the release job passes the one it is about to publish);
//              without it the checkout is packed (run `npm run build` first)
//   --live     also call show_chart on that exchange (needs network access to it)
// POSIX only (it drives scripts/launch); needs the system `tar` (scripts/lock-server.mjs).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname (fileURLToPath (import.meta.url));
const mcpRoot = path.resolve (here, '..');
const pkg = JSON.parse (fs.readFileSync (path.join (mcpRoot, 'package.json'), 'utf8'));
const option = (name) => {
    const index = process.argv.indexOf (name);
    return (index === -1) ? undefined : process.argv[index + 1];
};
const say = (message) => process.stderr.write (message + '\n');
const scratch = fs.mkdtempSync (path.join (os.tmpdir (), 'ccxt-mcp-smoke-'));

function fail (message) {
    say ('[smoke-plugin] FAILED: ' + message);
    fs.rmSync (scratch, { 'recursive': true, 'force': true });
    process.exit (1);
}

function check (condition, message) {
    if (!condition) {
        fail (message);
    }
    say ('  ok  ' + message);
}

// 1. the tarball: the one given, or this checkout packed the way `npm publish` packs it
let tarball = option ('--tarball');
if (tarball === undefined) {
    const packed = spawnSync ('npm', [ 'pack', '--pack-destination', scratch, '--silent' ], { 'cwd': mcpRoot, 'encoding': 'utf8' });
    if (packed.status !== 0) {
        fail ('npm pack failed: ' + packed.stderr);
    }
    tarball = path.join (scratch, `${pkg.name}-${pkg.version}.tgz`);
}
tarball = path.resolve (tarball);
say (`[smoke-plugin] tarball ${tarball} (${(fs.statSync (tarball).size / (1024 * 1024)).toFixed (2)} MB)`);

// 2. the stand-in registry
const requests = [];
const registry = http.createServer ((request, response) => {
    requests.push (request.url);
    if (request.url !== '/' + path.basename (tarball)) {
        response.writeHead (404).end ();
        return;
    }
    response.writeHead (200, { 'content-type': 'application/octet-stream', 'content-length': fs.statSync (tarball).size });
    fs.createReadStream (tarball).pipe (response);
});
await new Promise ((resolve) => registry.listen (0, '127.0.0.1', resolve));

// 3. a scratch copy of the plugin, pinned to that tarball by the same script the release uses
const plugin = path.join (scratch, 'plugin copy');
fs.cpSync (path.join (mcpRoot, 'plugin'), plugin, { 'recursive': true });
const lockPath = path.join (plugin, 'server.lock.json');
fs.writeFileSync (lockPath, JSON.stringify ({
    'version': pkg.version,
    'tarball': `http://127.0.0.1:${registry.address ().port}/${path.basename (tarball)}`,
    'integrity': null,
    'bundleIntegrity': null,
}, null, 2) + '\n');
const locked = spawnSync (process.execPath, [ path.join (here, 'lock-server.mjs'), '--lock', lockPath, tarball ], { 'encoding': 'utf8' });
if (locked.status !== 0) {
    fail ('lock-server failed: ' + locked.stderr);
}

// 4. the machine: no Node on PATH, the app's runtime in the user's cache
const home = path.join (scratch, 'home');
const runtime = path.join (home, '.cache', 'codex-runtimes', 'codex-primary-runtime', 'dependencies', 'node', 'bin', 'node');
fs.mkdirSync (path.dirname (runtime), { 'recursive': true });
try {
    fs.linkSync (process.execPath, runtime);
} catch (error) {
    fs.copyFileSync (process.execPath, runtime);
    fs.chmodSync (runtime, 0o755);
}
// what Codex gives a plugin's MCP server: a short fixed list plus the two plugin variables
const env = { 'HOME': home, 'PATH': '/usr/bin:/bin', 'PLUGIN_ROOT': plugin, 'PLUGIN_DATA': path.join (scratch, 'plugin data') };
// (Codex also forwards a custom CA bundle; --live needs it behind a TLS-inspecting proxy)
for (const name of [ 'NODE_EXTRA_CA_CERTS', 'SSL_CERT_FILE' ]) {
    if (process.env[name]) {
        env[name] = process.env[name];
    }
}
for (const tool of [ 'node', 'npm', 'npx' ]) {
    const found = spawnSync ('/bin/sh', [ '-c', 'command -v ' + tool ], { env, 'encoding': 'utf8' });
    check (found.status !== 0, `no ${tool} on PATH=${env.PATH}` + (found.stdout ? ' (found ' + found.stdout.trim () + ')' : ''));
}

// one server session: start through the launcher, run the requests, close stdin
function session (calls) {
    return new Promise ((resolve) => {
        const child = spawn ('./scripts/launch', [ './scripts/bootstrap.mjs' ], { 'cwd': plugin, env, 'stdio': [ 'pipe', 'pipe', 'pipe' ] });
        const state = { 'stdoutLines': [], 'stderr': '', 'results': [] };
        const pending = new Map ();
        let buffer = '';
        child.stderr.on ('data', (chunk) => {
            state.stderr += chunk;
        });
        child.stdout.on ('data', (chunk) => {
            buffer += chunk;
            let newline;
            while ((newline = buffer.indexOf ('\n')) !== -1) {
                const line = buffer.slice (0, newline);
                buffer = buffer.slice (newline + 1);
                state.stdoutLines.push (line);
                let message;
                try {
                    message = JSON.parse (line);
                } catch (error) {
                    continue; // reported below: stdout must be JSON-RPC only
                }
                if (pending.has (message.id)) {
                    pending.get (message.id) (message);
                    pending.delete (message.id);
                }
            }
        });
        const send = (message) => child.stdin.write (JSON.stringify (message) + '\n');
        const request = (id, method, params) => new Promise ((answer) => {
            pending.set (id, answer);
            send ({ 'jsonrpc': '2.0', id, method, params });
        });
        const timer = setTimeout (() => child.kill (), 120000);
        child.on ('close', (code) => {
            clearTimeout (timer);
            resolve ({ ...state, code, 'unanswered': pending.size });
        });
        (async () => {
            state.results.push (await request (0, 'initialize', { 'protocolVersion': '2025-06-18', 'capabilities': {}, 'clientInfo': { 'name': 'smoke-plugin', 'version': '0' } }));
            send ({ 'jsonrpc': '2.0', 'method': 'notifications/initialized' });
            let id = 1;
            for (const [ method, params ] of calls) {
                state.results.push (await request (id++, method, params));
            }
            child.stdin.end ();
        }) ();
    });
}

const calls = [
    [ 'tools/list', {} ],
    [ 'resources/read', { 'uri': 'ui://ccxt/chart.html' } ],
    [ 'tools/call', { 'name': 'describe_method', 'arguments': { 'exchange': 'kraken', 'method': 'fetchOHLCV' } } ],
];
const live = option ('--live');
if (live !== undefined) {
    calls.push ([ 'tools/call', { 'name': 'show_chart', 'arguments': { 'exchange': live, 'symbol': 'BTC/USDT', 'timeframe': '1h', 'limit': 5 } } ]);
}

say ('[smoke-plugin] cold start: ./scripts/launch ./scripts/bootstrap.mjs (cwd = plugin copy)');
const cold = await session (calls);
say (cold.stderr.trim ().split ('\n').map ((line) => '  stderr| ' + line).join ('\n'));
check (cold.unanswered === 0 && cold.results.length === calls.length + 1, 'every request was answered');
check (cold.stdoutLines.every ((line) => line.startsWith ('{"')), 'stdout carried JSON-RPC only (' + cold.stdoutLines.length + ' lines)');
const [ initialize, toolsList, chartView, describe, chart ] = cold.results;
check (initialize.result?.serverInfo?.version === pkg.version, 'initialize -> ' + JSON.stringify (initialize.result?.serverInfo));
const toolNames = (toolsList.result?.tools ?? []).map ((tool) => tool.name);
check (toolNames.includes ('show_chart') && toolNames.includes ('setup_account') && toolNames.includes ('watch_subscribe'), 'tools/list -> ' + toolNames.length + ' tools (show_chart, setup_account, watch_subscribe among them)');
const html = chartView.result?.contents?.[0]?.text ?? '';
check (html.startsWith ('<!doctype html>') && !html.includes ('@include'), 'resources/read ui://ccxt/chart.html -> ' + html.length + ' chars of self-contained HTML');
const described = describe.result?.content?.[0]?.text ?? '';
check (describe.result?.isError !== true && described.includes ('"ok":true'), 'describe_method kraken fetchOHLCV -> ' + described.slice (0, 110) + '…');
if (live !== undefined) {
    const text = chart.result?.content?.[0]?.text ?? JSON.stringify (chart.error);
    check (chart.result?.isError !== true && text.includes ('"ok":true'), `show_chart ${live} BTC/USDT -> ` + text.slice (0, 260) + '…');
}
check (requests.length === 1, 'the registry was asked once: ' + JSON.stringify (requests));
const cached = path.join (env.PLUGIN_DATA, 'server', pkg.version, 'ccxt-mcp.mjs');
const allFiles = fs.readdirSync (env.PLUGIN_DATA, { 'recursive': true }).filter ((entry) => fs.statSync (path.join (env.PLUGIN_DATA, entry)).isFile ());
check (allFiles.length === 1 && fs.existsSync (cached), 'exactly one file was written: ' + path.relative (scratch, cached) + ' (mode ' + (fs.statSync (cached).mode & 0o777).toString (8) + ')');
check (cold.stderr.includes (' at ' + fs.realpathSync (runtime) + '\n'), 'the launcher picked the app-runtime Node at ' + path.relative (scratch, runtime));

say ('[smoke-plugin] warm start with the registry shut down');
await new Promise ((resolve) => registry.close (resolve));
const warm = await session ([ [ 'tools/list', {} ] ]);
check (warm.results[1]?.result?.tools?.length === toolNames.length, 'tools/list -> ' + warm.results[1]?.result?.tools?.length + ' tools from the cached server');
check (requests.length === 1 && !warm.stderr.includes ('downloading'), 'no network was used');

fs.rmSync (scratch, { 'recursive': true, 'force': true });
say ('[smoke-plugin] passed');
