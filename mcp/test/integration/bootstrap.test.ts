import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import http from 'http';
import crypto from 'crypto';
import { spawn, type ChildProcessByStdio } from 'child_process';
import type { Readable } from 'stream';
import type { AddressInfo } from 'net';
import { fileURLToPath } from 'url';
import { paxPath, tar, tgz, type TarEntry } from '../helpers/tar.js';

// plugin/scripts/bootstrap.mjs is what stands between a user with no npm and a running
// server: it downloads, verifies, caches and imports the single-file bundle. It is run here
// exactly as a host runs it — as a child process, from a scratch copy of the plugin whose
// lock points at a stand-in registry on loopback (the only non-https address it accepts).
const here = path.dirname (fileURLToPath (import.meta.url));
const bootstrapSource = path.resolve (here, '..', '..', 'plugin', 'scripts', 'bootstrap.mjs');
const BUNDLE_ENTRY = 'package/js/bundle/ccxt-mcp.mjs';
const VERSION = '9.9.9';
const windows = process.platform === 'win32';
const skip = windows ? 'the fake npx / node layout below is POSIX' : false;

const sha512 = (data: Buffer | string): string => 'sha512-' + crypto.createHash ('sha512').update (data).digest ('base64');

// the stand-in "server": proves it ran (marker file), writes one line to stdout and exits
const fakeServer = (label: string): string => [
    'import fs from \'node:fs\';',
    'fs.writeFileSync (process.env.MARKER, ' + JSON.stringify (label) + ');',
    'process.stdout.write (\'{"server":' + JSON.stringify (label).replace (/'/g, '') + '}\\n\');',
].join ('\n');

let root: string;
let isolatedNode: string;
let registry: http.Server;
let base: string;
let requests: string[] = [];
// the Range header of every request, in step with `requests`
let ranges: (string | undefined)[] = [];
const routes = new Map<string, (response: http.ServerResponse, request: http.IncomingMessage) => void> ();

before (async () => {
    root = fs.mkdtempSync (path.join (os.tmpdir (), 'ccxt-mcp-bootstrap-'));
    // the bootstrap also looks for npx beside the Node that runs it, so "no npx" needs a
    // Node that sits alone in its directory
    const nodeDirectory = path.join (root, 'lonely-node');
    fs.mkdirSync (nodeDirectory);
    isolatedNode = path.join (nodeDirectory, path.basename (process.execPath));
    try {
        fs.linkSync (process.execPath, isolatedNode);
    } catch (error) {
        fs.copyFileSync (process.execPath, isolatedNode);
        fs.chmodSync (isolatedNode, 0o755);
    }
    registry = http.createServer ((request, response) => {
        requests.push (request.url ?? '');
        ranges.push (request.headers['range']);
        const route = routes.get (request.url ?? '');
        if (route === undefined) {
            response.writeHead (404).end ();
            return;
        }
        route (response, request);
    });
    await new Promise<void> ((resolve) => registry.listen (0, '127.0.0.1', resolve));
    base = 'http://127.0.0.1:' + (registry.address () as AddressInfo).port;
});

after (async () => {
    registry.closeAllConnections ();
    await new Promise ((resolve) => registry.close (resolve));
    fs.rmSync (root, { 'recursive': true, 'force': true });
});

interface Scenario {
    plugin: string;
    data: string;
    home: string;
    bin: string;
    marker: string;
    npxLog: string;
    fixed: string;
}

let counter = 0;

// The bootstrap looks for npx in fixed system locations a test cannot create or hide — CI
// images ship /usr/local/bin/npx, which would make every "no npx" case run the real one. The
// copy under test is the committed file with exactly those literals moved under a scratch root.
function sandboxed (source: string, fakeRoot: string): string {
    let text = source;
    for (const location of [ '/opt/homebrew/bin', '/usr/local/bin', '/usr/bin' ]) {
        const literal = '\'' + location + '\',';
        assert.equal (text.split (literal).length, 2, 'the bootstrap should name ' + location + ' exactly once');
        text = text.replace (literal, JSON.stringify (fakeRoot + location) + ',');
    }
    return text;
}

// a scratch plugin (bootstrap + lock), an empty data dir, an empty HOME and an empty PATH dir
function scenario (lock: Record<string, unknown>): Scenario {
    const dir = path.join (root, 'case-' + (counter++));
    const plugin = path.join (dir, 'plugin with space');
    fs.mkdirSync (path.join (plugin, 'scripts'), { 'recursive': true });
    fs.writeFileSync (path.join (plugin, 'scripts', 'bootstrap.mjs'), sandboxed (fs.readFileSync (bootstrapSource, 'utf8'), path.join (dir, 'fixed root')));
    fs.writeFileSync (path.join (plugin, 'server.lock.json'), JSON.stringify (lock));
    const made: Scenario = {
        plugin,
        'data': path.join (dir, 'data'),
        'home': path.join (dir, 'home'),
        'bin': path.join (dir, 'bin'),
        'marker': path.join (dir, 'marker'),
        'npxLog': path.join (dir, 'npx.log'),
        'fixed': path.join (dir, 'fixed root'),
    };
    fs.mkdirSync (made.home);
    fs.mkdirSync (made.bin);
    return made;
}

function addFakeNpx (made: Scenario, directory = made.bin): void {
    fs.mkdirSync (directory, { 'recursive': true });
    fs.writeFileSync (path.join (directory, 'npx'), '#!/bin/sh\nprintf \'%s\\n\' "$*" > "$NPX_LOG"\nprintf \'%s\\n\' "$PATH" > "$NPX_LOG.path"\nprintf \'%s\\n\' \'{"server":"npx"}\'\n', { 'mode': 0o755 });
}

interface Run {
    code: number | null;
    stdout: string;
    stderr: string;
}

function start (made: Scenario, extraEnv: Record<string, string> = {}): ChildProcessByStdio<null, Readable, Readable> {
    return spawn (isolatedNode, [ path.join (made.plugin, 'scripts', 'bootstrap.mjs') ], {
        'cwd': made.plugin,
        // nothing inherited: no ambient npx, proxy, CCXT_MCP_SERVER or cache location
        'env': { 'HOME': made.home, 'PATH': made.bin, 'PLUGIN_DATA': made.data, 'MARKER': made.marker, 'NPX_LOG': made.npxLog, ...extraEnv },
        'stdio': [ 'ignore', 'pipe', 'pipe' ],
    });
}

function run (made: Scenario, extraEnv: Record<string, string> = {}): Promise<Run> {
    return new Promise ((resolve, reject) => {
        const child = start (made, extraEnv);
        let stdout = '';
        let stderr = '';
        child.stdout.on ('data', (chunk) => {
            stdout += chunk;
        });
        child.stderr.on ('data', (chunk) => {
            stderr += chunk;
        });
        child.on ('error', reject);
        child.on ('close', (code) => resolve ({ code, stdout, stderr }));
    });
}

function serve (route: string, body: Buffer): void {
    routes.set (route, (response) => {
        response.writeHead (200, { 'content-type': 'application/octet-stream', 'content-length': body.length });
        response.end (body);
    });
}

function lockFor (route: string, tarball: Buffer, bundle: string): Record<string, unknown> {
    return { 'version': VERSION, 'tarball': base + route, 'integrity': sha512 (tarball), 'bundleIntegrity': sha512 (bundle) };
}

function filesUnder (dir: string): string[] {
    if (!fs.existsSync (dir)) {
        return [];
    }
    return (fs.readdirSync (dir, { 'recursive': true }) as string[]).filter ((entry) => fs.statSync (path.join (dir, entry)).isFile ()).sort ();
}

const cachedBundle = path.join ('server', VERSION, 'ccxt-mcp.mjs');
const packageFiles = (bundle: string): TarEntry[] => [
    { 'name': 'package/package.json', 'data': '{"name":"ccxt-mcp"}' },
    { 'name': 'package/js/server.js', 'data': 'throw new Error ("the unbundled entry must never be run");' },
    { 'name': BUNDLE_ENTRY, 'data': bundle },
];

test ('a verified download is cached privately and run, and a warm cache needs no network', { skip }, async () => {
    const bundle = fakeServer ('good');
    const tarball = tgz (packageFiles (bundle));
    serve ('/good.tgz', tarball);
    // the registry answers with a redirect to its CDN in real life
    routes.set ('/redirect.tgz', (response) => response.writeHead (302, { 'location': '/good.tgz' }).end ());
    const made = scenario (lockFor ('/redirect.tgz', tarball, bundle));
    requests = [];
    const first = await run (made);
    assert.equal (first.code, 0, first.stderr);
    // stdout is the JSON-RPC channel: it carries the server's bytes and nothing else
    assert.equal (first.stdout, '{"server":"good"}\n');
    assert.match (first.stderr, /downloading the CCXT server 9\.9\.9/);
    assert.equal (fs.readFileSync (made.marker, 'utf8'), 'good');
    assert.deepEqual (requests, [ '/redirect.tgz', '/good.tgz' ]);
    assert.deepEqual (filesUnder (made.data), [ cachedBundle ], 'only the bundle is written, and no temporary file is left');
    assert.equal (fs.readFileSync (path.join (made.data, cachedBundle), 'utf8'), bundle);
    assert.equal (fs.statSync (path.join (made.data, cachedBundle)).mode & 0o777, 0o600);
    assert.equal (fs.statSync (path.dirname (path.join (made.data, cachedBundle))).mode & 0o777, 0o700);

    fs.rmSync (made.marker);
    requests = [];
    const second = await run (made);
    assert.equal (second.code, 0, second.stderr);
    assert.equal (second.stdout, '{"server":"good"}\n');
    assert.equal (second.stderr, '', 'a warm start is silent');
    assert.deepEqual (requests, [], 'a warm cache must not touch the network');
    assert.equal (fs.readFileSync (made.marker, 'utf8'), 'good');
});

test ('a cached bundle that no longer matches the lock is fetched again, never run', { skip }, async () => {
    const bundle = fakeServer ('fresh');
    const tarball = tgz (packageFiles (bundle));
    serve ('/fresh.tgz', tarball);
    const made = scenario (lockFor ('/fresh.tgz', tarball, bundle));
    const target = path.join (made.data, cachedBundle);
    fs.mkdirSync (path.dirname (target), { 'recursive': true });
    fs.writeFileSync (target, fakeServer ('tampered'));
    requests = [];
    const result = await run (made);
    assert.equal (result.code, 0, result.stderr);
    assert.equal (result.stdout, '{"server":"fresh"}\n');
    assert.deepEqual (requests, [ '/fresh.tgz' ]);
    assert.equal (fs.readFileSync (target, 'utf8'), bundle);
});

test ('a tarball with the wrong checksum is refused and leaves nothing behind', { skip }, async () => {
    const bundle = fakeServer ('evil');
    const tarball = tgz (packageFiles (bundle));
    serve ('/evil.tgz', tarball);
    const made = scenario ({ ...lockFor ('/evil.tgz', tarball, bundle), 'integrity': sha512 ('some other tarball') });
    // npx is available, and must NOT be used to paper over a failed verification
    addFakeNpx (made);
    const result = await run (made);
    assert.equal (result.code, 1);
    assert.equal (result.stdout, '');
    assert.match (result.stderr, /does not match the checksum pinned in this plugin, so it was not run/);
    assert.deepEqual (filesUnder (made.data), []);
    assert.ok (!fs.existsSync (made.marker), 'the server must not have run');
    assert.ok (!fs.existsSync (made.npxLog), 'npx must not have run');
});

test ('a genuine tarball whose bundle differs from the pinned bundle checksum is refused', { skip }, async () => {
    const bundle = fakeServer ('swapped');
    const tarball = tgz (packageFiles (bundle));
    serve ('/swapped.tgz', tarball);
    const made = scenario ({ ...lockFor ('/swapped.tgz', tarball, bundle), 'bundleIntegrity': sha512 ('another bundle') });
    const result = await run (made);
    assert.equal (result.code, 1);
    assert.equal (result.stdout, '');
    assert.match (result.stderr, /does not match the checksum pinned in this plugin/);
    assert.deepEqual (filesUnder (made.data), []);
    assert.ok (!fs.existsSync (made.marker));
});

test ('path-traversal, link and look-alike entries are ignored: only the one bundle is written', { skip }, async () => {
    const bundle = fakeServer ('real');
    const decoy = fakeServer ('decoy');
    const tarball = tgz ([
        { 'name': '../../../escaped.mjs', 'data': decoy },
        { 'name': '/tmp/ccxt-mcp-absolute.mjs', 'data': decoy },
        { 'name': 'package/js/bundle/../bundle/ccxt-mcp.mjs', 'data': decoy },
        { 'name': 'package/js/bundle/ccxt-mcp.mjs/', 'type': '5' },
        { 'name': 'ccxt-mcp.mjs', 'prefix': 'package/js/bundle/../bundle', 'data': decoy },
        // a link and a long-named file that only LOOK like the bundle in their short name field
        { 'name': 'package/js/link.mjs', 'type': '2', 'linkname': '../../../../etc/passwd' },
        paxPath ('package/js/bundle/ccxt-mcp.mjs.' + 'x'.repeat (120)),
        { 'name': BUNDLE_ENTRY, 'data': decoy },
        ...packageFiles (bundle),
    ]);
    serve ('/traversal.tgz', tarball);
    const made = scenario (lockFor ('/traversal.tgz', tarball, bundle));
    const result = await run (made);
    assert.equal (result.code, 0, result.stderr);
    assert.equal (result.stdout, '{"server":"real"}\n');
    assert.deepEqual (filesUnder (made.data), [ cachedBundle ]);
    assert.deepEqual (filesUnder (path.dirname (made.data)).filter ((file) => file.includes ('escaped')), []);
    assert.ok (!fs.existsSync ('/tmp/ccxt-mcp-absolute.mjs'));
});

test ('the bundle is found when its name arrives in a pax header or the ustar prefix field', { skip }, async () => {
    for (const [ label, entries ] of [
        [ 'pax', [ paxPath (BUNDLE_ENTRY), { 'name': 'package/js/bundle/truncated-name', 'data': fakeServer ('pax') } ] ],
        [ 'prefix', [ { 'name': 'ccxt-mcp.mjs', 'prefix': 'package/js/bundle', 'data': fakeServer ('prefix') } ] ],
    ] as [ string, TarEntry[] ][]) {
        const tarball = tgz (entries);
        serve ('/' + label + '.tgz', tarball);
        const made = scenario (lockFor ('/' + label + '.tgz', tarball, fakeServer (label)));
        const result = await run (made);
        assert.equal (result.code, 0, result.stderr);
        assert.equal (result.stdout, '{"server":"' + label + '"}\n');
    }
});

test ('an archive that holds the bundle twice is refused', { skip }, async () => {
    const bundle = fakeServer ('twice');
    const tarball = tgz ([ ...packageFiles (bundle), { 'name': BUNDLE_ENTRY, 'data': bundle } ]);
    serve ('/twice.tgz', tarball);
    const made = scenario (lockFor ('/twice.tgz', tarball, bundle));
    const result = await run (made);
    assert.equal (result.code, 1);
    assert.match (result.stderr, /could not be read \(the archive holds the server twice\)/);
    assert.deepEqual (filesUnder (made.data), []);
});

test ('a truncated gzip stream and a truncated tar are refused', { skip }, async () => {
    const bundle = fakeServer ('truncated');
    const whole = tgz (packageFiles (bundle));
    const cutGzip = whole.subarray (0, Math.floor (whole.length / 2));
    const cutTar = (await import ('zlib')).gzipSync (tar (packageFiles (bundle)).subarray (0, 512 * 5 + 10));
    for (const [ label, tarball ] of [ [ 'cut-gzip', cutGzip ], [ 'cut-tar', cutTar ] ] as [ string, Buffer ][]) {
        serve ('/' + label + '.tgz', tarball);
        // the checksum matches the damaged bytes, so only the archive reader can catch it
        const made = scenario (lockFor ('/' + label + '.tgz', tarball, bundle));
        const result = await run (made);
        assert.equal (result.code, 1, label);
        assert.equal (result.stdout, '', label);
        assert.match (result.stderr, /archive could not be read/, label);
        assert.deepEqual (filesUnder (made.data), [], label);
        assert.ok (!fs.existsSync (made.marker), label);
    }
});

test ('a download over the size cap is abandoned', { skip }, async () => {
    let sent = 0;
    routes.set ('/huge.tgz', (response) => {
        response.writeHead (200, { 'content-type': 'application/octet-stream' });
        const chunk = Buffer.alloc (1024 * 1024);
        const pump = (): void => {
            // far past the 64 MB cap if the client never hangs up
            while (sent < 512 && !response.destroyed) {
                sent++;
                if (!response.write (chunk)) {
                    response.once ('drain', pump);
                    return;
                }
            }
            response.end ();
        };
        response.on ('error', () => undefined);
        pump ();
    });
    const made = scenario ({ 'version': VERSION, 'tarball': base + '/huge.tgz', 'integrity': sha512 ('x'), 'bundleIntegrity': sha512 ('y') });
    addFakeNpx (made);
    const result = await run (made);
    assert.equal (result.code, 1);
    assert.match (result.stderr, /larger than 64 MB/);
    assert.ok (sent < 200, 'the client should hang up soon after the cap, but ' + sent + ' MB were sent');
    assert.deepEqual (filesUnder (made.data), []);
    assert.ok (!fs.existsSync (made.npxLog));
});

test ('a pinned release without a bundle falls back to npx with the pinned version', { skip }, async () => {
    const tarball = tgz ([ { 'name': 'package/package.json', 'data': '{}' }, { 'name': 'package/js/server.js', 'data': '' } ]);
    serve ('/no-bundle.tgz', tarball);
    const made = scenario (lockFor ('/no-bundle.tgz', tarball, 'irrelevant'));
    addFakeNpx (made);
    const result = await run (made);
    assert.equal (result.code, 0, result.stderr);
    assert.equal (fs.readFileSync (made.npxLog, 'utf8'), '-y ccxt-mcp@' + VERSION + '\n');
    // npx inherits the channel: its stdout is the server's, the bootstrap adds nothing
    assert.equal (result.stdout, '{"server":"npx"}\n');
    assert.match (result.stderr, /published without a single-file server — trying npx instead/);
    assert.deepEqual (filesUnder (made.data), []);
});

test ('a lock without checksums (the 0.1.3 state) goes straight to npx, without any download', { skip }, async () => {
    const made = scenario ({ 'version': VERSION, 'tarball': base + '/never.tgz', 'integrity': null, 'bundleIntegrity': null });
    addFakeNpx (made);
    requests = [];
    const result = await run (made);
    assert.equal (result.code, 0, result.stderr);
    assert.equal (fs.readFileSync (made.npxLog, 'utf8'), '-y ccxt-mcp@' + VERSION + '\n');
    assert.equal (result.stdout, '{"server":"npx"}\n');
    assert.deepEqual (requests, []);
});

test ('without checksums and without npx it says, in one line, what to do', { skip }, async () => {
    const made = scenario ({ 'version': VERSION, 'tarball': base + '/never.tgz', 'integrity': null, 'bundleIntegrity': null });
    requests = [];
    const result = await run (made);
    assert.equal (result.code, 1);
    assert.equal (result.stdout, '');
    assert.equal (result.stderr.trim ().split ('\n').length, 1, result.stderr);
    assert.match (result.stderr, /^\[ccxt-mcp plugin\] this plugin version \(server 9\.9\.9\) can only start through npx/);
    assert.match (result.stderr, /install Node\.js 18 or newer from https:\/\/nodejs\.org/);
    assert.match (result.stderr, /next ccxt-mcp release/);
    assert.deepEqual (requests, []);
});

test ('offline with no npx: one clear line, nothing written', { skip }, async () => {
    // a loopback port nobody listens on
    const made = scenario ({ 'version': VERSION, 'tarball': 'http://127.0.0.1:9/offline.tgz', 'integrity': sha512 ('a'), 'bundleIntegrity': sha512 ('b') });
    const result = await run (made);
    assert.equal (result.code, 1);
    assert.equal (result.stdout, '');
    assert.match (result.stderr, /could not be downloaded \(the download failed \(ECONNREFUSED\)\) and npx is not installed/);
    assert.deepEqual (filesUnder (made.data), []);
});

test ('a plain-http address that is not loopback is refused without a request', { skip }, async () => {
    const made = scenario ({ 'version': VERSION, 'tarball': 'http://registry.npmjs.org/ccxt-mcp/-/ccxt-mcp-9.9.9.tgz', 'integrity': sha512 ('a'), 'bundleIntegrity': sha512 ('b') });
    addFakeNpx (made);
    const result = await run (made);
    assert.equal (result.code, 1);
    assert.match (result.stderr, /refusing to download the server from a non-https address/);
    assert.ok (!fs.existsSync (made.npxLog));
});

test ('CCXT_MCP_SERVER runs a local server and skips lock, cache and network', { skip }, async () => {
    const made = scenario ({ 'version': VERSION, 'tarball': base + '/never.tgz', 'integrity': sha512 ('a'), 'bundleIntegrity': sha512 ('b') });
    const local = path.join (made.home, 'my server.mjs');
    fs.writeFileSync (local, fakeServer ('local'));
    requests = [];
    const result = await run (made, { 'CCXT_MCP_SERVER': local });
    assert.equal (result.code, 0, result.stderr);
    assert.equal (result.stdout, '{"server":"local"}\n');
    assert.match (result.stderr, /using the local server from CCXT_MCP_SERVER/);
    assert.deepEqual (requests, []);
    assert.deepEqual (filesUnder (made.data), []);

    // a typo must not silently run something else
    for (const bad of [ 'relative/server.mjs', path.join (made.home, 'missing.mjs') ]) {
        const refused = await run (made, { 'CCXT_MCP_SERVER': bad });
        assert.equal (refused.code, 1);
        assert.match (refused.stderr, /CCXT_MCP_SERVER must be the absolute path of an existing server file/);
        assert.deepEqual (requests, []);
    }
});

test ('without PLUGIN_DATA the bundle goes to the cache directory the server itself uses', { 'skip': (process.platform !== 'linux') ? 'asserts the Linux cache path' : false }, async () => {
    const bundle = fakeServer ('xdg');
    const tarball = tgz (packageFiles (bundle));
    serve ('/xdg.tgz', tarball);
    const made = scenario (lockFor ('/xdg.tgz', tarball, bundle));
    const viaHome = await run (made, { 'PLUGIN_DATA': '' });
    assert.equal (viaHome.code, 0, viaHome.stderr);
    assert.deepEqual (filesUnder (path.join (made.home, '.cache', 'ccxt-mcp')), [ cachedBundle ]);
    const xdg = path.join (made.home, 'xdg');
    const viaXdg = await run (made, { 'PLUGIN_DATA': '', 'XDG_CACHE_HOME': xdg });
    assert.equal (viaXdg.code, 0, viaXdg.stderr);
    assert.deepEqual (filesUnder (path.join (xdg, 'ccxt-mcp')), [ cachedBundle ]);
    // Claude Code's name for the plugin data directory is honoured too (a fresh home: the
    // user cache filled above is a second place the server is read from)
    const other = scenario (lockFor ('/xdg.tgz', tarball, bundle));
    const claudeData = path.join (other.home, 'claude-data');
    const viaClaude = await run (other, { 'PLUGIN_DATA': '', 'CLAUDE_PLUGIN_DATA': claudeData });
    assert.equal (viaClaude.code, 0, viaClaude.stderr);
    assert.deepEqual (filesUnder (claudeData), [ cachedBundle ]);
});

// incompressible padding, so the tarball spans many network chunks like the real 3 MB one
const bulkyServer = (label: string): string => fakeServer (label) + '\n// ' + crypto.randomBytes (150000).toString ('base64') + '\n';
const partFiles = (made: Scenario): string[] => filesUnder (made.data).filter ((file) => file.endsWith ('.part'));

async function waitFor (condition: () => boolean, what: string): Promise<void> {
    const deadline = Date.now () + 10000;
    while (!condition ()) {
        assert.ok (Date.now () < deadline, 'timed out waiting for ' + what);
        await new Promise ((resolve) => setTimeout (resolve, 20));
    }
}

// Hosts give a server a fixed time to answer (Codex: 30 seconds) and kill it when the first
// download is slower than that. If nothing were kept, a slow connection would fail the same
// way at every start, forever. Here the "host" kills the bootstrap halfway; the next start
// must ask for the rest only.
test ('a download cut short by the host is continued by the next start, not begun again', { skip }, async () => {
    const bundle = bulkyServer ('resumed');
    const tarball = tgz (packageFiles (bundle));
    const half = Math.floor (tarball.length / 2);
    routes.set ('/slow.tgz', (response, request) => {
        const range = /^bytes=(\d+)-$/.exec (request.headers['range'] ?? '');
        if (range === null) {
            // the first half, then silence: the connection is too slow for the host's deadline
            response.writeHead (200, { 'content-type': 'application/octet-stream', 'content-length': tarball.length });
            response.write (tarball.subarray (0, half));
            return;
        }
        const from = Number (range[1]);
        response.writeHead (206, { 'content-range': 'bytes ' + from + '-' + (tarball.length - 1) + '/' + tarball.length, 'content-length': tarball.length - from });
        response.end (tarball.subarray (from));
    });
    const made = scenario (lockFor ('/slow.tgz', tarball, bundle));
    requests = [];
    ranges = [];
    const first = start (made);
    const exited = new Promise ((resolve) => first.on ('close', resolve));
    await waitFor (() => partFiles (made).some ((file) => fs.statSync (path.join (made.data, file)).size === half), 'the first half to reach the disk');
    first.kill ('SIGKILL');
    await exited;
    assert.ok (!fs.existsSync (made.marker));
    assert.deepEqual (filesUnder (made.data), partFiles (made), 'nothing but the unfinished download may exist yet');

    const second = await run (made);
    assert.equal (second.code, 0, second.stderr);
    assert.equal (second.stdout, '{"server":"resumed"}\n');
    assert.deepEqual (requests, [ '/slow.tgz', '/slow.tgz' ]);
    assert.deepEqual (ranges, [ undefined, 'bytes=' + half + '-' ]);
    assert.deepEqual (filesUnder (made.data), [ cachedBundle ], 'the part file is gone once the server is cached');
    assert.equal (fs.readFileSync (path.join (made.data, cachedBundle), 'utf8'), bundle);
});

test ('a kept part is only a head start: a server without Range support or a damaged part still ends in the pinned server', { skip }, async () => {
    const bundle = bulkyServer ('restarted');
    const tarball = tgz (packageFiles (bundle));
    const leftover = (made: Scenario, contents: Buffer): void => {
        const directory = path.join (made.data, 'server', VERSION);
        fs.mkdirSync (directory, { 'recursive': true });
        // 2147483646 is above every real pid limit, so its owner is certainly not running
        fs.writeFileSync (path.join (directory, '.ccxt-mcp.tgz.2147483646.part'), contents);
    };
    // 1. the server ignores Range and sends the whole file
    serve ('/no-range.tgz', tarball);
    const ignored = scenario (lockFor ('/no-range.tgz', tarball, bundle));
    leftover (ignored, tarball.subarray (0, 1000));
    ranges = [];
    const whole = await run (ignored);
    assert.equal (whole.code, 0, whole.stderr);
    assert.equal (whole.stdout, '{"server":"restarted"}\n');
    assert.deepEqual (ranges, [ 'bytes=1000-' ]);
    assert.deepEqual (filesUnder (ignored.data), [ cachedBundle ]);

    // 2. the kept bytes are not the beginning of the pinned tarball: one fresh attempt
    routes.set ('/ranged.tgz', (response, request) => {
        const from = Number ((/^bytes=(\d+)-$/.exec (request.headers['range'] ?? '') ?? [ '', '0' ])[1]);
        response.writeHead ((from > 0) ? 206 : 200, (from > 0) ? { 'content-range': 'bytes ' + from + '-' + (tarball.length - 1) + '/' + tarball.length } : {});
        response.end (tarball.subarray (from));
    });
    const damaged = scenario (lockFor ('/ranged.tgz', tarball, bundle));
    leftover (damaged, crypto.randomBytes (1000));
    ranges = [];
    const retried = await run (damaged);
    assert.equal (retried.code, 0, retried.stderr);
    assert.equal (retried.stdout, '{"server":"restarted"}\n');
    assert.deepEqual (ranges, [ 'bytes=1000-', undefined ]);
    assert.match (retried.stderr, /partial download kept from an earlier start could not be completed/);
    assert.deepEqual (filesUnder (damaged.data), [ cachedBundle ]);

    // 3. a part that is already the whole file (killed between the last byte and the rename)
    routes.set ('/complete.tgz', (response, request) => {
        assert.equal (request.headers['range'], 'bytes=' + tarball.length + '-');
        response.writeHead (416, { 'content-range': 'bytes */' + tarball.length }).end ();
    });
    const complete = scenario (lockFor ('/complete.tgz', tarball, bundle));
    leftover (complete, tarball);
    const finished = await run (complete);
    assert.equal (finished.code, 0, finished.stderr);
    assert.equal (finished.stdout, '{"server":"restarted"}\n');
    assert.deepEqual (filesUnder (complete.data), [ cachedBundle ]);
});

test ('a part file whose owner is still downloading is left alone', { skip }, async () => {
    const bundle = fakeServer ('concurrent');
    const tarball = tgz (packageFiles (bundle));
    serve ('/concurrent.tgz', tarball);
    const made = scenario (lockFor ('/concurrent.tgz', tarball, bundle));
    const directory = path.join (made.data, 'server', VERSION);
    fs.mkdirSync (directory, { 'recursive': true });
    // this test process stands in for another instance that is in the middle of its download
    const theirs = path.join (directory, '.ccxt-mcp.tgz.' + process.pid + '.part');
    fs.writeFileSync (theirs, 'bytes another instance is still appending to');
    ranges = [];
    const result = await run (made);
    assert.equal (result.code, 0, result.stderr);
    assert.equal (result.stdout, '{"server":"concurrent"}\n');
    assert.deepEqual (ranges, [ undefined ], 'it must start at zero in a file of its own');
    assert.equal (fs.readFileSync (theirs, 'utf8'), 'bytes another instance is still appending to');
});

// The launcher prefers the app's own Node, which has no npx beside it, and a desktop app's
// PATH is minimal — so npx has to be looked for where the launcher looks for a user's Node.
test ('npx is found in the usual install locations when it is not on PATH', { skip }, async () => {
    const lock = { 'version': VERSION, 'tarball': base + '/never.tgz', 'integrity': null, 'bundleIntegrity': null };
    const locations: [ string, (made: Scenario) => string, Record<string, string> ][] = [
        [ 'Homebrew', (made) => path.join (made.fixed, 'opt', 'homebrew', 'bin'), {} ],
        [ '/usr/local', (made) => path.join (made.fixed, 'usr', 'local', 'bin'), {} ],
        [ '/usr/bin', (made) => path.join (made.fixed, 'usr', 'bin'), {} ],
        [ 'Volta', (made) => path.join (made.home, '.volta', 'bin'), {} ],
        [ 'fnm', (made) => path.join (made.home, '.local', 'share', 'fnm', 'aliases', 'default', 'bin'), {} ],
        [ 'fnm (macOS)', (made) => path.join (made.home, 'Library', 'Application Support', 'fnm', 'aliases', 'default', 'bin'), {} ],
        [ 'nvm', (made) => path.join (made.home, '.nvm', 'versions', 'node', 'v22.3.0', 'bin'), {} ],
        [ 'NVM_DIR', (made) => path.join (made.home, 'my nvm', 'versions', 'node', 'v20.11.1', 'bin'), { 'NVM_DIR': 'my nvm' } ],
    ];
    for (const [ label, where, extra ] of locations) {
        const made = scenario (lock);
        const directory = where (made);
        addFakeNpx (made, directory);
        const env: Record<string, string> = {};
        for (const [ key, value ] of Object.entries (extra)) {
            env[key] = path.join (made.home, value);
        }
        const result = await run (made, env);
        assert.equal (result.code, 0, label + ': ' + result.stderr);
        assert.equal (result.stdout, '{"server":"npx"}\n', label);
        assert.equal (fs.readFileSync (made.npxLog, 'utf8'), '-y ccxt-mcp@' + VERSION + '\n', label);
        // npx starts `node` from PATH: the one installed beside it has to win
        assert.equal (fs.readFileSync (made.npxLog + '.path', 'utf8').trim ().split (path.delimiter)[0], directory, label);
    }
    // nvm: the newest version wins, and one too old for the server is never used
    const made = scenario (lock);
    const versions = path.join (made.home, '.nvm', 'versions', 'node');
    for (const version of [ 'v16.20.2', 'v20.9.0', 'v22.3.0', 'v9.11.2' ]) {
        addFakeNpx (made, path.join (versions, version, 'bin'));
    }
    assert.equal ((await run (made)).code, 0);
    assert.equal (fs.readFileSync (made.npxLog + '.path', 'utf8').trim ().split (path.delimiter)[0], path.join (versions, 'v22.3.0', 'bin'));
    const onlyOld = scenario (lock);
    addFakeNpx (onlyOld, path.join (onlyOld.home, '.nvm', 'versions', 'node', 'v16.20.2', 'bin'));
    const refused = await run (onlyOld);
    assert.equal (refused.code, 1);
    assert.match (refused.stderr, /can only start through npx, which is not installed here/);
});

// a regular file where a directory is needed: fails for root too, unlike a chmod
function block (file: string): void {
    fs.mkdirSync (path.dirname (file), { 'recursive': true });
    fs.writeFileSync (file, 'not a directory');
}

const userCache = (made: Scenario): string => ((process.platform === 'darwin') ? path.join (made.home, 'Library', 'Caches') : path.join (made.home, '.cache'));

test ('an unwritable plugin data directory falls back to the user cache, and stays warm there', { skip }, async () => {
    const bundle = fakeServer ('elsewhere');
    const tarball = tgz (packageFiles (bundle));
    serve ('/elsewhere.tgz', tarball);
    const made = scenario (lockFor ('/elsewhere.tgz', tarball, bundle));
    block (made.data);
    requests = [];
    const first = await run (made);
    assert.equal (first.code, 0, first.stderr);
    assert.equal (first.stdout, '{"server":"elsewhere"}\n');
    assert.deepEqual (filesUnder (path.join (userCache (made), 'ccxt-mcp')), [ cachedBundle ]);
    const second = await run (made);
    assert.equal (second.code, 0, second.stderr);
    assert.equal (second.stdout, '{"server":"elsewhere"}\n');
    assert.equal (second.stderr, '');
    assert.deepEqual (requests, [ '/elsewhere.tgz' ], 'the second start must find the server in the fallback location');
});

test ('with nowhere to keep it the verified server still runs once, from a private temporary directory', { skip }, async () => {
    const bundle = fakeServer ('temporary');
    const tarball = tgz (packageFiles (bundle));
    serve ('/temporary.tgz', tarball);
    const made = scenario (lockFor ('/temporary.tgz', tarball, bundle));
    block (made.data);
    block (userCache (made));
    const temporary = path.join (made.home, 'tmp');
    fs.mkdirSync (temporary);
    const result = await run (made, { 'TMPDIR': temporary });
    assert.equal (result.code, 0, result.stderr);
    assert.equal (result.stdout, '{"server":"temporary"}\n');
    assert.match (result.stderr, /could not be kept on disk \(.*ENOTDIR.*\), so it will be downloaded again at every start/);
    assert.deepEqual (fs.readdirSync (temporary), [], 'the temporary copy is removed when the server exits');
});

test ('a disk that takes nothing at all is reported as a disk problem, not as a connection problem', { skip }, async () => {
    const bundle = fakeServer ('unsaved');
    const tarball = tgz (packageFiles (bundle));
    serve ('/unsaved.tgz', tarball);
    const made = scenario (lockFor ('/unsaved.tgz', tarball, bundle));
    block (made.data);
    block (userCache (made));
    const result = await run (made, { 'TMPDIR': path.join (made.home, 'missing tmp') });
    assert.equal (result.code, 1);
    assert.equal (result.stdout, '');
    assert.ok (!fs.existsSync (made.marker));
    const last = result.stderr.trim ().split ('\n').pop () ?? '';
    assert.match (last, /was downloaded but could not be saved anywhere \(.*ENOTDIR.*\) and npx is not installed to run it another way — free some disk space or make that folder writable/);
    assert.ok (!/internet connection/.test (result.stderr), result.stderr);
    // with npx present it is still tried: npm keeps its cache somewhere else
    addFakeNpx (made);
    const viaNpx = await run (made, { 'TMPDIR': path.join (made.home, 'missing tmp') });
    assert.equal (viaNpx.code, 0, viaNpx.stderr);
    assert.equal (viaNpx.stdout, '{"server":"npx"}\n');
});
