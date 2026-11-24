// End-to-end check of what a user without Node.js gets from the plugin on an OpenAI host:
//
//   packed npm tarball  ->  stand-in registry on loopback  ->  plugin/scripts/launch
//   (launch.cmd on Windows)  ->  plugin/scripts/bootstrap.mjs (download, verify, cache)
//   ->  the single-file server  ->  MCP initialize / tools/list / resources/read over stdio
//
// in an environment shaped like that user's: a scratch home, a PATH with the system's own
// directories only, nothing inherited, and the only "app runtime" a Node placed where the
// ChatGPT desktop app keeps its own
// (~/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node; on Windows
// node.exe one level up, the layout Node.js is distributed in there).
// It runs a scratch COPY of the plugin whose lock points at the loopback registry, so the
// committed plugin and its lock are never touched and no knob exists that a user could set.
//
// Usage: node scripts/smoke-plugin.mjs [--tarball <ccxt-mcp-x.y.z.tgz>] [--live <exchange>]
//   --tarball  test this exact file (the release job passes the one it is about to publish);
//              without it the checkout is packed (run `npm run build` first)
//   --live     also call show_chart on that exchange (needs network access to it)
// Runs on Linux, macOS and Windows.
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
const windows = process.platform === 'win32';
// the temp directory as the system itself names it (a symlink on macOS, an 8.3 short name on
// some Windows machines): the server reports the path of the Node it runs on, and the two
// are compared below
const scratch = fs.realpathSync.native (fs.mkdtempSync (path.join (os.tmpdir (), 'ccxt-mcp-smoke-')));

// Windows keeps a program's file locked for a moment after it exited
function cleanUp () {
    try {
        fs.rmSync (scratch, { 'recursive': true, 'force': true, 'maxRetries': 20, 'retryDelay': 250 });
    } catch (error) {
        say ('[smoke-plugin] could not remove ' + scratch + ' (' + (error.code || error.message) + ')');
    }
}

function fail (message) {
    say ('[smoke-plugin] FAILED: ' + message);
    cleanUp ();
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
    // npm is a batch file on Windows, which only a shell can start; the one path in the
    // command line is quoted for it
    const packed = windows
        ? spawnSync ('npm pack --pack-destination "' + scratch + '" --silent', { 'cwd': mcpRoot, 'encoding': 'utf8', 'shell': true })
        : spawnSync ('npm', [ 'pack', '--pack-destination', scratch, '--silent' ], { 'cwd': mcpRoot, 'encoding': 'utf8' });
    if (packed.status !== 0) {
        fail ('npm pack failed: ' + (packed.stderr || packed.error));
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
const runtimeRoot = path.join (home, '.cache', 'codex-runtimes', 'codex-primary-runtime', 'dependencies', 'node');
const runtime = windows ? path.join (runtimeRoot, 'node.exe') : path.join (runtimeRoot, 'bin', 'node');
fs.mkdirSync (path.dirname (runtime), { 'recursive': true });
// a hard link is instant, but Windows cannot delete a link to the program of a process that
// is still running — and this process is one
let linked = false;
if (!windows) {
    try {
        fs.linkSync (process.execPath, runtime);
        linked = true;
    } catch (error) {
        // another volume
    }
}
if (!linked) {
    fs.copyFileSync (process.execPath, runtime);
    fs.chmodSync (runtime, 0o755);
}
// what Codex gives a plugin's MCP server: a short fixed list plus the two plugin variables.
// On Windows the user's folders are named by variables of their own, and a program cannot
// open a socket without SystemRoot. ProgramFiles is left out on purpose: it is where the
// launcher would find the Node.js installed on this machine.
const systemRoot = process.env['SystemRoot'] || process.env['windir'] || 'C:\\Windows';
const shell = process.env['ComSpec'] || path.join (systemRoot, 'System32', 'cmd.exe');
const env = windows
    ? { 'SystemRoot': systemRoot, 'windir': systemRoot, 'ComSpec': shell, 'PATHEXT': process.env['PATHEXT'] || '.COM;.EXE;.BAT;.CMD', 'TEMP': os.tmpdir (), 'TMP': os.tmpdir (), 'USERPROFILE': home, 'APPDATA': path.join (home, 'AppData', 'Roaming'), 'LOCALAPPDATA': path.join (home, 'AppData', 'Local'), 'PATH': path.join (systemRoot, 'System32') + path.delimiter + systemRoot }
    : { 'HOME': home, 'PATH': '/usr/bin:/bin' };
env['PLUGIN_ROOT'] = plugin;
env['PLUGIN_DATA'] = path.join (scratch, 'plugin data');
// (Codex also forwards a custom CA bundle; --live needs it behind a TLS-inspecting proxy)
for (const name of [ 'NODE_EXTRA_CA_CERTS', 'SSL_CERT_FILE' ]) {
    if (process.env[name]) {
        env[name] = process.env[name];
    }
}
for (const tool of [ 'node', 'npm', 'npx' ]) {
    const names = windows ? [ tool + '.exe', tool + '.cmd', tool + '.bat', tool + '.com' ] : [ tool ];
    const found = env.PATH.split (path.delimiter).flatMap ((directory) => names.map ((name) => path.join (directory, name))).filter ((file) => fs.existsSync (file));
    check (found.length === 0, `no ${tool} on PATH=${env.PATH}` + ((found.length > 0) ? ' (found ' + found.join (', ') + ')' : ''));
}

// How a host starts the plugin's server. Unix: it executes ./scripts/launch from mcp.json.
// Windows: that name has to become launch.cmd, and a batch file is started through cmd.exe —
// with the whole command between one more pair of quotes, which /s makes cmd remove again.
function startServer () {
    const options = { 'cwd': plugin, env, 'stdio': [ 'pipe', 'pipe', 'pipe' ], 'windowsHide': true };
    if (!windows) {
        return spawn ('./scripts/launch', [ './scripts/bootstrap.mjs' ], options);
    }
    const launcher = path.join (plugin, 'scripts', 'launch.cmd');
    return spawn (shell, [ '/d', '/s', '/c', '""' + launcher + '" "./scripts/bootstrap.mjs""' ], { ...options, 'windowsVerbatimArguments': true });
}

// the launcher stays between this process and the server on Windows (cmd.exe has no exec),
// so stopping a server that hangs means stopping the tree
function stopServer (child) {
    if (windows && child.pid !== undefined) {
        spawnSync ('taskkill', [ '/pid', String (child.pid), '/t', '/f' ], { 'stdio': 'ignore' });
    } else {
        child.kill ();
    }
}

// one server session: start through the launcher, run the requests, close stdin
function session (calls) {
    return new Promise ((resolve) => {
        const child = startServer ();
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
        const timer = setTimeout (() => stopServer (child), 120000);
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

say ('[smoke-plugin] cold start: ' + (windows ? 'cmd.exe /d /s /c ""scripts\\launch.cmd" "./scripts/bootstrap.mjs""' : './scripts/launch ./scripts/bootstrap.mjs') + ' (cwd = plugin copy)');
const cold = await session (calls);
say (cold.stderr.trim ().split ('\n').map ((line) => '  stderr| ' + line).join ('\n'));
check (cold.unanswered === 0 && cold.results.length === calls.length + 1, 'every request was answered (exit status ' + cold.code + ')');
check (cold.code === 0, 'the server exited with status 0 once its stdin was closed');
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
// the server and the licence notices of what is bundled into it; the private copy the server
// ran from (see runnableCopy in the bootstrap) must be gone again
const cachedNotices = path.join (path.dirname (cached), 'THIRD_PARTY_LICENSES.txt');
const allFiles = fs.readdirSync (env.PLUGIN_DATA, { 'recursive': true }).filter ((entry) => fs.statSync (path.join (env.PLUGIN_DATA, entry)).isFile ());
check (allFiles.length === 2 && fs.existsSync (cached) && fs.existsSync (cachedNotices), 'exactly two files were written: ' + path.relative (scratch, cached) + ' and ' + path.basename (cachedNotices) + ' — found ' + JSON.stringify (allFiles));
const noticesText = fs.readFileSync (cachedNotices, 'utf8');
check (noticesText.startsWith ('THIRD-PARTY SOFTWARE NOTICES') && noticesText.includes ('protobufjs@') && !noticesText.includes ('\r'), 'the third-party licence notices came with it (' + noticesText.length + ' chars, LF line endings)');
if (!windows) {
    // Windows has no mode bits: there the files are private by being in the user's profile
    check ((fs.statSync (cached).mode & 0o777) === 0o600 && (fs.statSync (cachedNotices).mode & 0o777) === 0o600 && (fs.statSync (path.dirname (cached)).mode & 0o777) === 0o700, 'both are readable by this user only (mode 600 in a 700 directory)');
}
// Windows file names compare without regard to case
const sameText = (text) => (windows ? text.toLowerCase () : text);
check (sameText (cold.stderr).includes (sameText (' at ' + fs.realpathSync.native (runtime) + '\n')), 'the launcher picked the app-runtime Node at ' + path.relative (scratch, runtime));

say ('[smoke-plugin] warm start with the registry shut down');
await new Promise ((resolve) => registry.close (resolve));
const warm = await session ([ [ 'tools/list', {} ] ]);
check (warm.results[1]?.result?.tools?.length === toolNames.length, 'tools/list -> ' + warm.results[1]?.result?.tools?.length + ' tools from the cached server');
check (requests.length === 1 && !warm.stderr.includes ('downloading'), 'no network was used');
const afterWarm = fs.readdirSync (env.PLUGIN_DATA, { 'recursive': true }).filter ((entry) => fs.statSync (path.join (env.PLUGIN_DATA, entry)).isFile ());
check (afterWarm.length === 2, 'the warm start left the cache as it was: ' + JSON.stringify (afterWarm));

cleanUp ();
say ('[smoke-plugin] passed');
