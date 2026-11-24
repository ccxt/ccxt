import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import http from 'http';
import crypto from 'crypto';
import { spawn, type ChildProcessByStdio } from 'child_process';
import type { Readable } from 'stream';
import type { AddressInfo } from 'net';
import { fileURLToPath } from 'url';
import { paxPath, tar, tgz, type TarEntry } from '../helpers/tar.js';
import { windows, scratchDirectory, removeTree, placeNode, nodeName, unixLines, systemEnv } from '../helpers/platform.js';

// plugin/scripts/bootstrap.mjs is what stands between a user with no npm and a running
// server: it downloads, verifies, caches and imports the single-file bundle. It is run here
// exactly as a host runs it — as a child process, from a scratch copy of the plugin whose
// lock points at a stand-in registry on loopback (the only non-https address it accepts).
//
// Every test runs on Linux, macOS and Windows. What differs by platform is kept in a few
// helpers below: the environment a child is given (which variables name the user's folders),
// what a stand-in npx is made of, and where the user's cache directory is. File modes are
// asserted where the platform has them; Windows has no mode bits, and what is promised there
// is the location (inside the user's own profile), which the same tests assert.
const here = path.dirname (fileURLToPath (import.meta.url));
const bootstrapSource = path.resolve (here, '..', '..', 'plugin', 'scripts', 'bootstrap.mjs');
const BUNDLE_ENTRY = 'package/js/bundle/ccxt-mcp.mjs';
const VERSION = '9.9.9';

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
    root = scratchDirectory ('ccxt-mcp-bootstrap-');
    // the bootstrap also looks for npx beside the Node that runs it, so "no npx" needs a
    // Node that sits alone in its directory
    isolatedNode = path.join (root, 'lonely-node', nodeName);
    placeNode (isolatedNode, root);
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
    removeTree (root);
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

// A stand-in npx: records its arguments (NPX_LOG) and the PATH it was given (NPX_LOG.path),
// and answers on stdout like a server would. On Unix it is the sh script npx is there. On
// Windows npx comes in three shapes, and the bootstrap starts each one differently:
//   'cmd'      npx.cmd on its own — started through cmd.exe
//   'install'  the layout of a Node.js install: npx.cmd with node_modules\npm\bin\npx-cli.js
//              beside it — the bootstrap runs that script with Node and never starts the
//              batch file (which here fails if it is)
//   'program'  npx.exe, as Volta has it — started as it is. The stand-in is Node itself,
//              which rejects "-y" with status 9: proof that it got the arguments
type NpxKind = 'cmd' | 'install' | 'program';

function addFakeNpx (made: Scenario, directory = made.bin, kind: NpxKind = 'cmd'): void {
    fs.mkdirSync (directory, { 'recursive': true });
    if (!windows) {
        fs.writeFileSync (path.join (directory, 'npx'), '#!/bin/sh\nprintf \'%s\\n\' "$*" > "$NPX_LOG"\nprintf \'%s\\n\' "$PATH" > "$NPX_LOG.path"\nprintf \'%s\\n\' \'{"server":"npx"}\'\n', { 'mode': 0o755 });
        return;
    }
    if (kind === 'program') {
        placeNode (path.join (directory, 'npx.exe'), root);
        return;
    }
    if (kind === 'install') {
        fs.writeFileSync (path.join (directory, 'npx.cmd'), '@echo off\r\n>&2 echo the batch file must not be started when npx-cli.js is beside it\r\nexit /b 99\r\n');
        const cli = path.join (directory, 'node_modules', 'npm', 'bin', 'npx-cli.js');
        fs.mkdirSync (path.dirname (cli), { 'recursive': true });
        fs.writeFileSync (cli, [
            'const fs = require (\'fs\');',
            'fs.writeFileSync (process.env.NPX_LOG, process.argv.slice (2).join (\' \') + \'\\n\');',
            'fs.writeFileSync (process.env.NPX_LOG + \'.path\', process.env.PATH + \'\\n\');',
            'fs.writeFileSync (process.env.NPX_LOG + \'.node\', process.execPath + \'\\n\');',
            'process.stdout.write (\'{"server":"npx"}\\n\');',
        ].join ('\n') + '\n');
        return;
    }
    // `set PATH` prints every variable whose name begins with PATH, as NAME=value: unlike
    // `echo %PATH%` it is safe whatever characters the directories have in their names
    fs.writeFileSync (path.join (directory, 'npx.cmd'), [
        '@echo off',
        '>"%NPX_LOG%" echo %*',
        '>"%NPX_LOG%.path" set PATH',
        'echo {"server":"npx"}',
    ].join ('\r\n') + '\r\n');
}

// what the stand-in npx was started with, and the first directory of the PATH it was given
function npxArguments (made: Scenario): string {
    return unixLines (fs.readFileSync (made.npxLog, 'utf8'));
}

function npxFirstPathEntry (made: Scenario): string {
    const logged = unixLines (fs.readFileSync (made.npxLog + '.path', 'utf8')).split ('\n');
    const line = logged.find ((candidate) => /^path=/i.test (candidate)) ?? logged[0];
    return line.replace (/^path=/i, '').split (path.delimiter)[0];
}

// The environment of a bootstrap under test: nothing inherited (no ambient npx, proxy,
// CCXT_MCP_SERVER or cache location), a scratch home, and only `made.bin` on PATH. On
// Windows the user's folders are named by variables of their own, and so is the folder of a
// Node.js install — all of them point into the scratch directory, so that the npx of the
// machine that runs the tests cannot be found. A value of undefined removes a variable.
function childEnv (made: Scenario, extraEnv: Record<string, string | undefined>): Record<string, string> {
    const env: Record<string, string | undefined> = windows
        ? {
            ...systemEnv (),
            'USERPROFILE': made.home,
            'APPDATA': path.join (made.home, 'AppData', 'Roaming'),
            'LOCALAPPDATA': path.join (made.home, 'AppData', 'Local'),
            'ProgramFiles': path.join (made.fixed, 'Program Files'),
        }
        : { 'HOME': made.home };
    Object.assign (env, { 'PATH': made.bin, 'PLUGIN_DATA': made.data, 'MARKER': made.marker, 'NPX_LOG': made.npxLog }, extraEnv);
    const defined: Record<string, string> = {};
    for (const [ name, value ] of Object.entries (env)) {
        if (value !== undefined) {
            defined[name] = value;
        }
    }
    return defined;
}

// the variable(s) a process takes its temporary directory from
function temporaryDirectory (directory: string): Record<string, string> {
    return windows ? { 'TEMP': directory, 'TMP': directory } : { 'TMPDIR': directory };
}

// the directory the bootstrap keeps the server in when the host names none: the one
// cacheDirectory () in ts/config.ts gives the server itself
function userCache (made: Scenario): string {
    if (windows) {
        return path.join (made.home, 'AppData', 'Local', 'ccxt-mcp', 'cache');
    }
    if (process.platform === 'darwin') {
        return path.join (made.home, 'Library', 'Caches', 'ccxt-mcp');
    }
    return path.join (made.home, '.cache', 'ccxt-mcp');
}

// Unix: only the user may read the file / enter the directory. Windows has no mode bits;
// there the protection is where the file is (the user's profile, whose access list the
// system sets), so the callers assert the location instead.
function assertPrivate (target: string, mode: number): void {
    if (!windows) {
        assert.equal (fs.statSync (target).mode & 0o777, mode, target);
    }
}

interface Run {
    code: number | null;
    stdout: string;
    stderr: string;
}

function start (made: Scenario, extraEnv: Record<string, string | undefined> = {}): ChildProcessByStdio<null, Readable, Readable> {
    return spawn (isolatedNode, [ path.join (made.plugin, 'scripts', 'bootstrap.mjs') ], {
        'cwd': made.plugin,
        'env': childEnv (made, extraEnv),
        'stdio': [ 'ignore', 'pipe', 'pipe' ],
        'windowsHide': true,
    });
}

// stdout is returned with CR LF read as LF: the stand-in npx of Windows is a batch file,
// whose `echo` ends lines that way. Everything else is compared byte for byte.
function run (made: Scenario, extraEnv: Record<string, string | undefined> = {}): Promise<Run> {
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
        child.on ('close', (code) => resolve ({ code, 'stdout': unixLines (stdout), stderr }));
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
    return (fs.readdirSync (dir, { 'recursive': true }) as string[]).filter ((entry) => {
        try {
            return fs.statSync (path.join (dir, entry)).isFile ();
        } catch (error) {
            return false; // it went away between the listing and the look
        }
    }).sort ();
}

// Asserts which files `dir` holds once a bootstrap has exited. On Windows a file that was
// just deleted stays listed for as long as anything else still has it open (a virus scanner
// looking at a file that was written a moment ago), so the listing is given a few seconds
// to settle there; everywhere else it is compared at once.
async function expectFiles (dir: string, expected: string[], message?: string): Promise<void> {
    const deadline = Date.now () + (windows ? 5000 : 0);
    while (Date.now () < deadline && JSON.stringify (filesUnder (dir)) !== JSON.stringify (expected)) {
        await new Promise ((resolve) => setTimeout (resolve, 100));
    }
    assert.deepEqual (filesUnder (dir), expected, message);
}

const cachedBundle = path.join ('server', VERSION, 'ccxt-mcp.mjs');
const packageFiles = (bundle: string): TarEntry[] => [
    { 'name': 'package/package.json', 'data': '{"name":"ccxt-mcp"}' },
    { 'name': 'package/js/server.js', 'data': 'throw new Error ("the unbundled entry must never be run");' },
    { 'name': BUNDLE_ENTRY, 'data': bundle },
];

test ('a verified download is cached privately and run, and a warm cache needs no network', async () => {
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
    await expectFiles (made.data, [ cachedBundle ], 'only the bundle is written, and no temporary file is left');
    assert.equal (fs.readFileSync (path.join (made.data, cachedBundle), 'utf8'), bundle);
    assertPrivate (path.join (made.data, cachedBundle), 0o600);
    assertPrivate (path.dirname (path.join (made.data, cachedBundle)), 0o700);

    fs.rmSync (made.marker);
    requests = [];
    const second = await run (made);
    assert.equal (second.code, 0, second.stderr);
    assert.equal (second.stdout, '{"server":"good"}\n');
    assert.equal (second.stderr, '', 'a warm start is silent');
    assert.deepEqual (requests, [], 'a warm cache must not touch the network');
    assert.equal (fs.readFileSync (made.marker, 'utf8'), 'good');
});

// The bundle redistributes third-party code, so the release puts their licences beside it
// and the bootstrap keeps the two together. The notices file is the ONE other entry it
// takes out of the tarball: by its exact name, covered by the tarball checksum, never run.
test ('the third-party licence notices are cached beside the bundle; a release without them still starts', async () => {
    const NOTICES_ENTRY = 'package/js/bundle/THIRD_PARTY_LICENSES.txt';
    const cachedNotices = path.join ('server', VERSION, 'THIRD_PARTY_LICENSES.txt');
    const bundle = fakeServer ('licensed');
    const notices = 'THIRD-PARTY SOFTWARE\n\nprotobufjs 7.0.0 (BSD-3-Clause)\n';
    const tarball = tgz ([
        // look-alikes that must not be taken for it, or written anywhere
        { 'name': 'package/js/bundle/../bundle/THIRD_PARTY_LICENSES.txt', 'data': 'decoy' },
        { 'name': '../../THIRD_PARTY_LICENSES.txt', 'data': 'decoy' },
        { 'name': 'package/THIRD_PARTY_LICENSES.txt', 'data': 'decoy' },
        { 'name': 'package/js/bundle/OTHER.txt', 'data': 'decoy' },
        ...packageFiles (bundle),
        { 'name': NOTICES_ENTRY, 'data': notices },
    ]);
    serve ('/licensed.tgz', tarball);
    const made = scenario (lockFor ('/licensed.tgz', tarball, bundle));
    requests = [];
    const first = await run (made);
    assert.equal (first.code, 0, first.stderr);
    assert.equal (first.stdout, '{"server":"licensed"}\n');
    await expectFiles (made.data, [ cachedNotices, cachedBundle ].sort (), 'the bundle, its notices and nothing else');
    assert.equal (fs.readFileSync (path.join (made.data, cachedNotices), 'utf8'), notices);
    assertPrivate (path.join (made.data, cachedNotices), 0o600);
    assert.deepEqual (filesUnder (path.dirname (made.data)).filter ((file) => file.endsWith ('.txt') && !file.includes (cachedNotices)), []);
    // warm: no network, and nothing added to or taken from the cache
    const second = await run (made);
    assert.equal (second.code, 0, second.stderr);
    assert.equal (second.stderr, '');
    assert.deepEqual (requests, [ '/licensed.tgz' ]);
    await expectFiles (made.data, [ cachedNotices, cachedBundle ].sort ());

    // an archive that names the notices twice: none is kept, and the verified server runs
    const doubled = tgz ([ ...packageFiles (bundle), { 'name': NOTICES_ENTRY, 'data': notices }, { 'name': NOTICES_ENTRY, 'data': 'another' } ]);
    serve ('/doubled.tgz', doubled);
    const other = scenario (lockFor ('/doubled.tgz', doubled, bundle));
    const result = await run (other);
    assert.equal (result.code, 0, result.stderr);
    assert.equal (result.stdout, '{"server":"licensed"}\n');
    await expectFiles (other.data, [ cachedBundle ]);
});

// Hashing the cached file and then importing it by path reads it twice; whatever replaced it
// in between would run unverified. The server is therefore imported from a private copy
// written from the very bytes that were hashed.
test ('the server runs from a private copy of the verified bytes, which is gone when it exits', async () => {
    // reports where it was loaded from, and what the cache directory held at that moment
    const bundle = [
        'import fs from \'node:fs\';',
        'import path from \'node:path\';',
        'import { fileURLToPath } from \'node:url\';',
        'const self = fileURLToPath (import.meta.url);',
        'fs.writeFileSync (process.env.MARKER, JSON.stringify ({ \'name\': path.basename (self), \'mode\': fs.statSync (self).mode & 0o777, \'same\': fs.readFileSync (self, \'utf8\') === fs.readFileSync (path.join (path.dirname (self), \'ccxt-mcp.mjs\'), \'utf8\'), \'beside\': fs.readdirSync (path.dirname (self)).sort () }));',
        'process.stdout.write (\'{"server":"copy"}\\n\');',
    ].join ('\n');
    const tarball = tgz (packageFiles (bundle));
    serve ('/copy.tgz', tarball);
    const made = scenario (lockFor ('/copy.tgz', tarball, bundle));
    const directory = path.join (made.data, 'server', VERSION);
    // what a start that was killed left behind, and the copy of a server that is still running
    const dead = spawn (process.execPath, [ '-e', '' ], { 'stdio': 'ignore' });
    await new Promise ((resolve) => dead.on ('close', resolve));
    const stale = '.ccxt-mcp.run.' + dead.pid + '.0123456789ab.mjs';
    const alive = '.ccxt-mcp.run.' + process.pid + '.0123456789ab.mjs';
    fs.mkdirSync (directory, { 'recursive': true });
    fs.writeFileSync (path.join (directory, stale), 'throw new Error ("stale")');
    fs.writeFileSync (path.join (directory, alive), 'throw new Error ("not mine")');
    for (const label of [ 'cold', 'warm' ]) {
        const result = await run (made);
        assert.equal (result.code, 0, label + ': ' + result.stderr);
        assert.equal (result.stdout, '{"server":"copy"}\n');
        const seen = JSON.parse (fs.readFileSync (made.marker, 'utf8'));
        assert.match (seen.name, /^\.ccxt-mcp\.run\.\d+\.[0-9a-f]{12}\.mjs$/, label + ': imported from ' + seen.name);
        assert.notEqual (seen.name, alive);
        if (!windows) {
            assert.equal (seen.mode, 0o600);
        }
        assert.equal (seen.same, true);
        assert.deepEqual (seen.beside, [ alive, seen.name, 'ccxt-mcp.mjs' ].sort (), label + ': the stale copy is cleared, a live server\'s copy is left alone');
        await expectFiles (directory, [ alive, 'ccxt-mcp.mjs' ].sort (), label + ': the run copy is removed on exit');
        fs.rmSync (made.marker);
    }
    // the cached file swapped for something else between two starts is never what runs
    fs.writeFileSync (path.join (directory, 'ccxt-mcp.mjs'), fakeServer ('swapped'));
    const result = await run (made);
    assert.equal (result.code, 0, result.stderr);
    assert.equal (result.stdout, '{"server":"copy"}\n');
    assert.match (result.stderr, /does not match this plugin, fetching it again/);
});

test ('a cached bundle that no longer matches the lock is fetched again, never run', async () => {
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

test ('a tarball with the wrong checksum is refused and leaves nothing behind', async () => {
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
    await expectFiles (made.data, []);
    assert.ok (!fs.existsSync (made.marker), 'the server must not have run');
    assert.ok (!fs.existsSync (made.npxLog), 'npx must not have run');
});

test ('a genuine tarball whose bundle differs from the pinned bundle checksum is refused', async () => {
    const bundle = fakeServer ('swapped');
    const tarball = tgz (packageFiles (bundle));
    serve ('/swapped.tgz', tarball);
    const made = scenario ({ ...lockFor ('/swapped.tgz', tarball, bundle), 'bundleIntegrity': sha512 ('another bundle') });
    const result = await run (made);
    assert.equal (result.code, 1);
    assert.equal (result.stdout, '');
    assert.match (result.stderr, /does not match the checksum pinned in this plugin/);
    await expectFiles (made.data, []);
    assert.ok (!fs.existsSync (made.marker));
});

test ('path-traversal, link and look-alike entries are ignored: only the one bundle is written', async () => {
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
    await expectFiles (made.data, [ cachedBundle ]);
    assert.deepEqual (filesUnder (path.dirname (made.data)).filter ((file) => file.includes ('escaped')), []);
    assert.ok (!fs.existsSync ('/tmp/ccxt-mcp-absolute.mjs'));
});

test ('the bundle is found when its name arrives in a pax header or the ustar prefix field', async () => {
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

test ('an archive that holds the bundle twice is refused', async () => {
    const bundle = fakeServer ('twice');
    const tarball = tgz ([ ...packageFiles (bundle), { 'name': BUNDLE_ENTRY, 'data': bundle } ]);
    serve ('/twice.tgz', tarball);
    const made = scenario (lockFor ('/twice.tgz', tarball, bundle));
    const result = await run (made);
    assert.equal (result.code, 1);
    assert.match (result.stderr, /could not be read \(the archive holds the server twice\)/);
    await expectFiles (made.data, []);
});

test ('a truncated gzip stream and a truncated tar are refused', async () => {
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
        await expectFiles (made.data, [], label);
        assert.ok (!fs.existsSync (made.marker), label);
    }
});

test ('a download over the size cap is abandoned', async () => {
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
    await expectFiles (made.data, []);
    assert.ok (!fs.existsSync (made.npxLog));
});

test ('a pinned release without a bundle falls back to npx with the pinned version', async () => {
    const tarball = tgz ([ { 'name': 'package/package.json', 'data': '{}' }, { 'name': 'package/js/server.js', 'data': '' } ]);
    serve ('/no-bundle.tgz', tarball);
    const made = scenario (lockFor ('/no-bundle.tgz', tarball, 'irrelevant'));
    addFakeNpx (made);
    const result = await run (made);
    assert.equal (result.code, 0, result.stderr);
    assert.equal (npxArguments (made), '-y ccxt-mcp@' + VERSION + '\n');
    // npx inherits the channel: its stdout is the server's, the bootstrap adds nothing
    assert.equal (result.stdout, '{"server":"npx"}\n');
    assert.match (result.stderr, /published without a single-file server — trying npx instead/);
    await expectFiles (made.data, []);
});

test ('a lock without checksums (the 0.1.3 state) goes straight to npx, without any download', async () => {
    const made = scenario ({ 'version': VERSION, 'tarball': base + '/never.tgz', 'integrity': null, 'bundleIntegrity': null });
    addFakeNpx (made);
    requests = [];
    const result = await run (made);
    assert.equal (result.code, 0, result.stderr);
    assert.equal (npxArguments (made), '-y ccxt-mcp@' + VERSION + '\n');
    assert.equal (result.stdout, '{"server":"npx"}\n');
    assert.deepEqual (requests, []);
});

test ('without checksums and without npx it says, in one line, what to do', async () => {
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

test ('offline with no npx: one clear line, nothing written', async () => {
    // a loopback port nobody listens on
    const made = scenario ({ 'version': VERSION, 'tarball': 'http://127.0.0.1:9/offline.tgz', 'integrity': sha512 ('a'), 'bundleIntegrity': sha512 ('b') });
    const result = await run (made);
    assert.equal (result.code, 1);
    assert.equal (result.stdout, '');
    assert.match (result.stderr, /could not be downloaded \(the download failed \(ECONNREFUSED\)\) and npx is not installed/);
    await expectFiles (made.data, []);
});

test ('a plain-http address that is not loopback is refused without a request', async () => {
    const made = scenario ({ 'version': VERSION, 'tarball': 'http://registry.npmjs.org/ccxt-mcp/-/ccxt-mcp-9.9.9.tgz', 'integrity': sha512 ('a'), 'bundleIntegrity': sha512 ('b') });
    addFakeNpx (made);
    const result = await run (made);
    assert.equal (result.code, 1);
    assert.match (result.stderr, /refusing to download the server from a non-https address/);
    assert.ok (!fs.existsSync (made.npxLog));
});

test ('CCXT_MCP_SERVER runs a local server and skips lock, cache and network', async () => {
    const made = scenario ({ 'version': VERSION, 'tarball': base + '/never.tgz', 'integrity': sha512 ('a'), 'bundleIntegrity': sha512 ('b') });
    const local = path.join (made.home, 'my server.mjs');
    fs.writeFileSync (local, fakeServer ('local'));
    requests = [];
    const result = await run (made, { 'CCXT_MCP_SERVER': local });
    assert.equal (result.code, 0, result.stderr);
    assert.equal (result.stdout, '{"server":"local"}\n');
    assert.match (result.stderr, /using the local server from CCXT_MCP_SERVER/);
    assert.deepEqual (requests, []);
    await expectFiles (made.data, []);

    // a typo must not silently run something else
    for (const bad of [ 'relative/server.mjs', path.join (made.home, 'missing.mjs') ]) {
        const refused = await run (made, { 'CCXT_MCP_SERVER': bad });
        assert.equal (refused.code, 1);
        assert.match (refused.stderr, /CCXT_MCP_SERVER must be the absolute path of an existing server file/);
        assert.deepEqual (requests, []);
    }
});

test ('without PLUGIN_DATA the bundle goes to the cache directory the server itself uses', async () => {
    const bundle = fakeServer ('user-cache');
    const tarball = tgz (packageFiles (bundle));
    serve ('/user-cache.tgz', tarball);
    const made = scenario (lockFor ('/user-cache.tgz', tarball, bundle));
    const viaHome = await run (made, { 'PLUGIN_DATA': undefined });
    assert.equal (viaHome.code, 0, viaHome.stderr);
    // ~/.cache/ccxt-mcp, ~/Library/Caches/ccxt-mcp or %LOCALAPPDATA%\ccxt-mcp\cache: inside
    // the user's own profile on every platform, which on Windows is what keeps it private
    await expectFiles (userCache (made), [ cachedBundle ]);
    assert.ok (userCache (made).startsWith (made.home + path.sep));
    assertPrivate (path.join (userCache (made), cachedBundle), 0o600);
    assertPrivate (path.join (userCache (made), 'server', VERSION), 0o700);
    if (process.platform === 'linux') {
        const xdg = path.join (made.home, 'xdg');
        const viaXdg = await run (made, { 'PLUGIN_DATA': undefined, 'XDG_CACHE_HOME': xdg });
        assert.equal (viaXdg.code, 0, viaXdg.stderr);
        await expectFiles (path.join (xdg, 'ccxt-mcp'), [ cachedBundle ]);
    }
    if (windows) {
        // LOCALAPPDATA can be missing from the environment a host hands its children
        const bare = scenario (lockFor ('/user-cache.tgz', tarball, bundle));
        const withoutVariable = await run (bare, { 'PLUGIN_DATA': undefined, 'LOCALAPPDATA': undefined });
        assert.equal (withoutVariable.code, 0, withoutVariable.stderr);
        await expectFiles (userCache (bare), [ cachedBundle ]);
    }
    // Claude Code's name for the plugin data directory is honoured too (a fresh home: the
    // user cache filled above is a second place the server is read from)
    const other = scenario (lockFor ('/user-cache.tgz', tarball, bundle));
    const claudeData = path.join (other.home, 'claude-data');
    const viaClaude = await run (other, { 'PLUGIN_DATA': undefined, 'CLAUDE_PLUGIN_DATA': claudeData });
    assert.equal (viaClaude.code, 0, viaClaude.stderr);
    await expectFiles (claudeData, [ cachedBundle ]);
    await expectFiles (userCache (other), []);
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
test ('a download cut short by the host is continued by the next start, not begun again', async () => {
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
    await expectFiles (made.data, partFiles (made), 'nothing but the unfinished download may exist yet');

    const second = await run (made);
    assert.equal (second.code, 0, second.stderr);
    assert.equal (second.stdout, '{"server":"resumed"}\n');
    assert.deepEqual (requests, [ '/slow.tgz', '/slow.tgz' ]);
    assert.deepEqual (ranges, [ undefined, 'bytes=' + half + '-' ]);
    await expectFiles (made.data, [ cachedBundle ], 'the part file is gone once the server is cached');
    assert.equal (fs.readFileSync (path.join (made.data, cachedBundle), 'utf8'), bundle);
});

test ('a kept part is only a head start: a server without Range support or a damaged part still ends in the pinned server', async () => {
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
    await expectFiles (ignored.data, [ cachedBundle ]);

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
    await expectFiles (damaged.data, [ cachedBundle ]);

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
    await expectFiles (complete.data, [ cachedBundle ]);
});

test ('a part file whose owner is still downloading is left alone', async () => {
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

// A host starts one server per window or agent, and after an update several of them start at
// the same moment with nothing cached. Each downloads into a file of its own and puts the
// server in place under the same name; none may trip over the others, and what is left is
// the one cached server.
test ('instances that start together on a cold cache all run the pinned server, and leave one tidy cache', async () => {
    const bundle = bulkyServer ('together');
    const tarball = tgz (packageFiles (bundle));
    serve ('/together.tgz', tarball);
    const made = scenario (lockFor ('/together.tgz', tarball, bundle));
    requests = [];
    const results = await Promise.all ([ 0, 1, 2, 3, 4 ].map (() => run (made)));
    for (const result of results) {
        assert.equal (result.code, 0, result.stderr);
        assert.equal (result.stdout, '{"server":"together"}\n');
        assert.ok (!/could not be kept|could not be saved|does not match/.test (result.stderr), result.stderr);
    }
    assert.ok (requests.length >= 1 && requests.length <= 5, JSON.stringify (requests));
    await expectFiles (made.data, [ cachedBundle ], 'no part file, temporary file or run copy is left behind');
    assert.equal (fs.readFileSync (path.join (made.data, cachedBundle), 'utf8'), bundle);
    // and the next one is a warm start
    requests = [];
    const warm = await run (made);
    assert.equal (warm.code, 0, warm.stderr);
    assert.equal (warm.stderr, '');
    assert.deepEqual (requests, []);
});

// The launcher prefers the app's own Node, which has no npx beside it, and a desktop app's
// PATH is minimal — so npx has to be looked for where the launcher looks for a user's Node.
test ('npx is found in the usual install locations when it is not on PATH', async () => {
    const lock = { 'version': VERSION, 'tarball': base + '/never.tgz', 'integrity': null, 'bundleIntegrity': null };
    // [ what it is, where npx is put, the variables that point there (relative to the home) ]
    const locations: [ string, (made: Scenario) => string, Record<string, string> ][] = windows
        ? [
            [ 'Program Files', (made) => path.join (made.fixed, 'Program Files', 'nodejs'), {} ],
            [ 'ProgramW6432', (made) => path.join (made.home, 'Program Files 64', 'nodejs'), { 'ProgramW6432': 'Program Files 64' } ],
            [ 'NVM_SYMLINK', (made) => path.join (made.home, 'nvm link'), { 'NVM_SYMLINK': 'nvm link' } ],
            [ 'Volta', (made) => path.join (made.home, 'AppData', 'Local', 'Volta', 'bin'), {} ],
        ]
        : [
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
        assert.equal (npxArguments (made), '-y ccxt-mcp@' + VERSION + '\n', label);
        // npx starts `node` from PATH: the one installed beside it has to win
        assert.equal (npxFirstPathEntry (made), directory, label);
    }
    if (windows) {
        return;
    }
    // nvm: the newest version wins, and one too old for the server is never used
    const made = scenario (lock);
    const versions = path.join (made.home, '.nvm', 'versions', 'node');
    for (const version of [ 'v16.20.2', 'v20.9.0', 'v22.3.0', 'v9.11.2' ]) {
        addFakeNpx (made, path.join (versions, version, 'bin'));
    }
    assert.equal ((await run (made)).code, 0);
    assert.equal (npxFirstPathEntry (made), path.join (versions, 'v22.3.0', 'bin'));
    const onlyOld = scenario (lock);
    addFakeNpx (onlyOld, path.join (onlyOld.home, '.nvm', 'versions', 'node', 'v16.20.2', 'bin'));
    const refused = await run (onlyOld);
    assert.equal (refused.code, 1);
    assert.match (refused.stderr, /can only start through npx, which is not installed here/);
});

// On Windows npx is a batch file, and a batch file can only be started through cmd.exe —
// whose parser then reads the command line. The bootstrap therefore avoids cmd.exe where it
// can and builds the command line itself where it cannot (see npxInvocation in the bootstrap).
test ('Windows: each shape of npx is started the safe way, and one that cannot be is passed over', { 'skip': windows ? false : 'npx.cmd, npx.exe and cmd.exe exist on Windows only; on Unix npx is a script that is started as it is, which the tests above do' }, async () => {
    const lock = { 'version': VERSION, 'tarball': base + '/never.tgz', 'integrity': null, 'bundleIntegrity': null };
    // 1. a Node.js install: npx-cli.js is run with the node.exe beside it, no cmd.exe
    const install = scenario (lock);
    const nodejs = path.join (install.fixed, 'Program Files', 'nodejs');
    addFakeNpx (install, nodejs, 'install');
    placeNode (path.join (nodejs, 'node.exe'), root);
    let result = await run (install);
    assert.equal (result.code, 0, result.stderr);
    assert.equal (result.stdout, '{"server":"npx"}\n');
    assert.equal (npxArguments (install), '-y ccxt-mcp@' + VERSION + '\n');
    assert.equal (npxFirstPathEntry (install), nodejs);
    assert.equal (fs.readFileSync (install.npxLog + '.node', 'utf8').trim ().toLowerCase (), path.join (nodejs, 'node.exe').toLowerCase (), 'npx-cli.js runs with the Node it was installed with');
    // … and with the Node that runs the bootstrap when the install has none beside it (npm's
    // global prefix has that layout)
    const prefix = scenario (lock);
    addFakeNpx (prefix, prefix.bin, 'install');
    result = await run (prefix);
    assert.equal (result.code, 0, result.stderr);
    assert.equal (result.stdout, '{"server":"npx"}\n');
    assert.equal (fs.readFileSync (prefix.npxLog + '.node', 'utf8').trim ().toLowerCase (), isolatedNode.toLowerCase ());
    // 2. a batch file on its own, in a directory whose name is full of what cmd.exe reads as
    //    syntax: started through cmd.exe, with the path between quotes
    const batch = scenario (lock);
    const odd = path.join (batch.home, 'odd ^ ! (x86) & co = , ; bin');
    addFakeNpx (batch, odd, 'cmd');
    result = await run (batch, { 'NVM_SYMLINK': odd });
    assert.equal (result.code, 0, result.stderr);
    assert.equal (result.stdout, '{"server":"npx"}\n');
    assert.equal (npxArguments (batch), '-y ccxt-mcp@' + VERSION + '\n');
    // 3. the one character that means something to cmd.exe even between quotes: that npx is
    //    not started at all, and the next one is
    const unsafe = scenario (lock);
    const percent = path.join (unsafe.home, '100% %MARKER% bin');
    fs.mkdirSync (percent, { 'recursive': true });
    fs.writeFileSync (path.join (percent, 'npx.cmd'), '@echo off\r\n>&2 echo started from a path cmd.exe would rewrite\r\nexit /b 98\r\n');
    result = await run (unsafe, { 'NVM_SYMLINK': percent });
    assert.equal (result.code, 1);
    assert.equal (result.stdout, '');
    assert.match (result.stderr, /can only start through npx, which is not installed here/);
    assert.ok (!/cmd\.exe would rewrite/.test (result.stderr));
    addFakeNpx (unsafe, path.join (unsafe.home, 'AppData', 'Local', 'Volta', 'bin'), 'cmd');
    result = await run (unsafe, { 'NVM_SYMLINK': percent });
    assert.equal (result.code, 0, result.stderr);
    assert.equal (result.stdout, '{"server":"npx"}\n');
    // 4. a program (Volta's npx.exe) is started as it is: the stand-in is Node, which
    //    refuses the "-y" it was given with status 9
    const program = scenario (lock);
    addFakeNpx (program, program.bin, 'program');
    result = await run (program);
    assert.equal (result.code, 9, result.stderr);
    assert.match (result.stderr, /bad option: -y/);
});

// The version in the lock file ends up in a command line (`npx -y ccxt-mcp@<version>`, which
// on Windows can go through cmd.exe) and in a directory name. Anything that is not plainly a
// version is refused before either happens.
test ('a version in the lock file that is not a version never reaches a command line or a path', async () => {
    for (const version of [ '1.0.0&calc', '1.0.0 --registry=http://evil.example', '1.0.0"', '1.0.0%PATH%', '1.0.0^', '1.0.0|x', '1.0.0;x', '1.0.0$(id)', '1.0.0`id`', '../../x', '1.0.0/../..', '1.0.0\\..', '1.0.0\nx', ' 1.0.0', 'latest', '', 100 ]) {
        const made = scenario ({ 'version': version, 'tarball': base + '/never.tgz', 'integrity': null, 'bundleIntegrity': null });
        addFakeNpx (made);
        requests = [];
        const result = await run (made);
        assert.equal (result.code, 1, JSON.stringify (version));
        assert.equal (result.stdout, '', JSON.stringify (version));
        assert.match (result.stderr, /server\.lock\.json has no valid version/, JSON.stringify (version));
        assert.ok (!fs.existsSync (made.npxLog), JSON.stringify (version) + ': npx must not have run');
        assert.deepEqual (requests, []);
        await expectFiles (made.data, []);
    }
    // what a release and a pre-release look like is accepted as it is
    for (const version of [ '0.1.4', '12.0.0-rc.1', '1.2.3-beta-2' ]) {
        const made = scenario ({ 'version': version, 'tarball': base + '/never.tgz', 'integrity': null, 'bundleIntegrity': null });
        addFakeNpx (made);
        const result = await run (made);
        assert.equal (result.code, 0, version + ': ' + result.stderr);
        assert.equal (npxArguments (made), '-y ccxt-mcp@' + version + '\n');
    }
});

// a regular file where a directory is needed: fails for root too, unlike a chmod
function block (file: string): void {
    fs.mkdirSync (path.dirname (file), { 'recursive': true });
    fs.writeFileSync (file, 'not a directory');
}

// the error a file in the place of a directory gives: ENOTDIR on Unix; Windows reports the
// same condition under more than one name
const blockedPattern = windows ? /E[A-Z]+/ : /ENOTDIR/;

test ('an unwritable plugin data directory falls back to the user cache, and stays warm there', async () => {
    const bundle = fakeServer ('elsewhere');
    const tarball = tgz (packageFiles (bundle));
    serve ('/elsewhere.tgz', tarball);
    const made = scenario (lockFor ('/elsewhere.tgz', tarball, bundle));
    block (made.data);
    requests = [];
    const first = await run (made);
    assert.equal (first.code, 0, first.stderr);
    assert.equal (first.stdout, '{"server":"elsewhere"}\n');
    await expectFiles (userCache (made), [ cachedBundle ]);
    const second = await run (made);
    assert.equal (second.code, 0, second.stderr);
    assert.equal (second.stdout, '{"server":"elsewhere"}\n');
    assert.equal (second.stderr, '');
    assert.deepEqual (requests, [ '/elsewhere.tgz' ], 'the second start must find the server in the fallback location');
});

test ('with nowhere to keep it the verified server still runs once, from a private temporary directory', async () => {
    const bundle = fakeServer ('temporary');
    const tarball = tgz (packageFiles (bundle));
    serve ('/temporary.tgz', tarball);
    const made = scenario (lockFor ('/temporary.tgz', tarball, bundle));
    block (made.data);
    block (userCache (made));
    const temporary = path.join (made.home, 'tmp');
    fs.mkdirSync (temporary);
    const result = await run (made, temporaryDirectory (temporary));
    assert.equal (result.code, 0, result.stderr);
    assert.equal (result.stdout, '{"server":"temporary"}\n');
    assert.match (result.stderr, /could not be kept on disk \((.*)\), so it will be downloaded again at every start/);
    assert.match ((/could not be kept on disk \((.*)\), so/.exec (result.stderr) ?? [])[1] ?? '', blockedPattern);
    assert.deepEqual (fs.readdirSync (temporary), [], 'the temporary copy is removed when the server exits');
});

test ('a disk that takes nothing at all is reported as a disk problem, not as a connection problem', async () => {
    const bundle = fakeServer ('unsaved');
    const tarball = tgz (packageFiles (bundle));
    serve ('/unsaved.tgz', tarball);
    const made = scenario (lockFor ('/unsaved.tgz', tarball, bundle));
    block (made.data);
    block (userCache (made));
    const result = await run (made, temporaryDirectory (path.join (made.home, 'missing tmp')));
    assert.equal (result.code, 1);
    assert.equal (result.stdout, '');
    assert.ok (!fs.existsSync (made.marker));
    const last = result.stderr.trim ().split ('\n').pop () ?? '';
    assert.match (last, /was downloaded but could not be saved anywhere \((.*)\) and npx is not installed to run it another way — free some disk space or make that folder writable/);
    assert.match ((/saved anywhere \((.*)\) and npx/.exec (last) ?? [])[1] ?? '', blockedPattern);
    assert.ok (!/internet connection/.test (result.stderr), result.stderr);
    // with npx present it is still tried: npm keeps its cache somewhere else
    addFakeNpx (made);
    const viaNpx = await run (made, temporaryDirectory (path.join (made.home, 'missing tmp')));
    assert.equal (viaNpx.code, 0, viaNpx.stderr);
    assert.equal (viaNpx.stdout, '{"server":"npx"}\n');
});
