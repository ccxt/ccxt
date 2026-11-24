import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

// plugin/scripts/launch picks the Node runtime for the plugin: the host app's own first, then
// the user's. The order is the contract (a user with no Node must get the app's runtime, and
// an outdated Node must never win over a usable one), so every documented location is walked
// here, highest priority first, with fake `node` scripts that print which one they are.
const here = path.dirname (fileURLToPath (import.meta.url));
const launcherSource = path.resolve (here, '..', '..', 'plugin', 'scripts', 'launch');
const skip = (process.platform === 'win32') ? 'POSIX launcher' : false;

let root: string;
let launcher: string;
let home: string;
let pathDir: string;

// The launcher probes fixed system locations (/usr/local/bin/node, /Applications/…) that a
// test cannot create or hide — CI images ship a Node in /usr/local/bin. The copy under test
// is the committed script with exactly those absolute literals moved under a scratch root.
function sandboxed (source: string, fakeRoot: string): string {
    const fixed = [
        '/Applications/ChatGPT.app/Contents/Resources/cua_node/bin/node',
        '/opt/homebrew/bin/node',
        '/usr/local/bin/node',
        '/usr/bin/node',
    ];
    let text = source;
    for (const location of fixed) {
        const literal = 'try_node "' + location + '" "$@"';
        assert.equal (text.split (literal).length, 2, 'the launcher should probe ' + location + ' exactly once');
        text = text.replace (literal, 'try_node "' + fakeRoot + location + '" "$@"');
    }
    assert.ok (!/try_node "\/(?!tmp|var|private)/.test (text.replace (new RegExp (fakeRoot.replace (/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '/tmp')), 'the launcher probes a fixed location this test does not sandbox');
    return text;
}

function fakeNode (file: string, label: string, version = 'v24.1.0'): void {
    fs.mkdirSync (path.dirname (file), { 'recursive': true });
    fs.writeFileSync (file, [
        '#!/bin/sh',
        'if [ "$1" = "--version" ]; then printf \'%s\\n\' ' + JSON.stringify (version) + '; exit 0; fi',
        'printf \'%s\\n\' ' + JSON.stringify (label),
        'for argument in "$@"; do printf \'arg=%s\\n\' "$argument"; done',
        'exit 7',
    ].join ('\n') + '\n', { 'mode': 0o755 });
}

function launch (env: Record<string, string>, args: string[] = [ './scripts/bootstrap.mjs' ]): { status: number | null, stdout: string, stderr: string } {
    const result = spawnSync (launcher, args, { 'env': { 'HOME': home, 'PATH': pathDir, ...env }, 'encoding': 'utf8' });
    return { 'status': result.status, 'stdout': result.stdout, 'stderr': result.stderr };
}

before (() => {
    // spaces everywhere: the plugin lives under "Application Support" on macOS
    root = fs.mkdtempSync (path.join (os.tmpdir (), 'ccxt mcp launcher '));
    home = path.join (root, 'home dir');
    pathDir = path.join (root, 'path bin');
    fs.mkdirSync (home);
    fs.mkdirSync (pathDir);
    launcher = path.join (root, 'launch');
    fs.writeFileSync (launcher, sandboxed (fs.readFileSync (launcherSource, 'utf8'), path.join (root, 'fixed root')), { 'mode': 0o755 });
});

after (() => {
    fs.rmSync (root, { 'recursive': true, 'force': true });
});

test ('the committed launcher is an executable POSIX sh script that passes a syntax check', { skip }, () => {
    assert.ok (fs.readFileSync (launcherSource, 'utf8').startsWith ('#!/bin/sh\n'));
    assert.ok ((fs.statSync (launcherSource).mode & 0o111) === 0o111, 'plugin/scripts/launch must be executable (chmod 755; git mode 100755)');
    const check = spawnSync ('/bin/sh', [ '-n', launcherSource ], { 'encoding': 'utf8' });
    assert.equal (check.status, 0, check.stderr);
    // no eval and no command substitution of anything but the two fixed probes
    const code = fs.readFileSync (launcherSource, 'utf8').split ('\n').filter ((line) => !line.trim ().startsWith ('#')).join ('\n');
    assert.ok (!/\beval\b/.test (code));
    assert.deepEqual (code.match (/\$\([^)]*\)/g), [ '$("$candidate" --version 2>/dev/null)', '$(command -v node 2>/dev/null)' ]);
});

test ('every documented location is tried, in priority order', { skip }, () => {
    const fixed = path.join (root, 'fixed root');
    const app = path.join (root, 'ChatGPT.app', 'Contents', 'Resources');
    const env: Record<string, string> = {
        'CODEX_MCP_NODE_PATH': path.join (root, 'env', 'mcp node'),
        'CODEX_BROWSER_USE_NODE_PATH': path.join (root, 'env', 'browser node'),
        'CODEX_ELECTRON_RESOURCES_PATH': path.join (root, 'electron resources'),
        'CODEX_CLI_PATH': path.join (app, 'codex-cli', 'bin', 'codex'),
        'NODE': path.join (root, 'env', 'explicit node'),
        'NVM_DIR': path.join (root, 'nvm dir'),
    };
    // highest priority first
    const chain: [ string, string ][] = [
        [ 'CODEX_MCP_NODE_PATH', env['CODEX_MCP_NODE_PATH'] ],
        [ 'CODEX_BROWSER_USE_NODE_PATH', env['CODEX_BROWSER_USE_NODE_PATH'] ],
        [ 'CODEX_ELECTRON_RESOURCES_PATH', path.join (env['CODEX_ELECTRON_RESOURCES_PATH'], 'cua_node', 'bin', 'node') ],
        [ 'beside CODEX_CLI_PATH', path.join (app, 'codex-cli', 'bin', 'cua_node', 'bin', 'node') ],
        [ 'app Resources via CODEX_CLI_PATH', path.join (app, 'cua_node', 'bin', 'node') ],
        [ 'cache runtime node/bin', path.join (home, '.cache', 'codex-runtimes', 'codex-primary-runtime', 'dependencies', 'node', 'bin', 'node') ],
        [ 'cache runtime bin', path.join (home, '.cache', 'codex-runtimes', 'codex-primary-runtime', 'dependencies', 'bin', 'node') ],
        [ '/Applications/ChatGPT.app', path.join (fixed, 'Applications', 'ChatGPT.app', 'Contents', 'Resources', 'cua_node', 'bin', 'node') ],
        [ '~/Applications/ChatGPT.app', path.join (home, 'Applications', 'ChatGPT.app', 'Contents', 'Resources', 'cua_node', 'bin', 'node') ],
        [ 'NODE', env['NODE'] ],
        [ 'PATH', path.join (pathDir, 'node') ],
        [ '/opt/homebrew', path.join (fixed, 'opt', 'homebrew', 'bin', 'node') ],
        [ '/usr/local', path.join (fixed, 'usr', 'local', 'bin', 'node') ],
        [ '/usr/bin', path.join (fixed, 'usr', 'bin', 'node') ],
        [ 'volta', path.join (home, '.volta', 'bin', 'node') ],
        [ 'fnm (XDG data)', path.join (home, '.local', 'share', 'fnm', 'aliases', 'default', 'bin', 'node') ],
        [ 'fnm (macOS)', path.join (home, 'Library', 'Application Support', 'fnm', 'aliases', 'default', 'bin', 'node') ],
        [ 'nvm', path.join (env['NVM_DIR'], 'versions', 'node', 'v22.3.0', 'bin', 'node') ],
    ];
    for (const [ label, file ] of chain) {
        fakeNode (file, label);
    }
    for (const [ label, file ] of chain) {
        const result = launch (env, [ './scripts/boot strap.mjs', 'second arg' ]);
        // exit status and arguments pass through untouched, spaces included
        assert.equal (result.status, 7, label + ': ' + result.stderr);
        assert.equal (result.stdout, label + '\narg=./scripts/boot strap.mjs\narg=second arg\n');
        assert.equal (result.stderr, '');
        fs.rmSync (file);
    }
    const none = launch (env);
    assert.equal (none.status, 127);
    assert.equal (none.stdout, '');
    assert.equal (none.stderr.trim ().split ('\n').length, 1);
    assert.match (none.stderr, /^\[ccxt-mcp plugin\] could not start: no Node\.js runtime was found — .*install Node\.js 18 or newer from https:\/\/nodejs\.org/);
});

test ('XDG_CACHE_HOME moves the app runtime location', { skip }, () => {
    const xdg = path.join (root, 'xdg cache');
    const file = path.join (xdg, 'codex-runtimes', 'codex-primary-runtime', 'dependencies', 'node', 'bin', 'node');
    fakeNode (file, 'xdg runtime');
    const result = launch ({ 'XDG_CACHE_HOME': xdg });
    assert.equal (result.stdout, 'xdg runtime\narg=./scripts/bootstrap.mjs\n');
    fs.rmSync (file);
});

test ('a Node older than 18 is skipped in favour of a newer one further down', { skip }, () => {
    const old = path.join (root, 'old', 'node');
    const fine = path.join (pathDir, 'node');
    fakeNode (old, 'old', 'v16.20.2');
    fakeNode (fine, 'fine', 'v18.0.0');
    const result = launch ({ 'CODEX_MCP_NODE_PATH': old });
    assert.equal (result.status, 7, result.stderr);
    assert.equal (result.stdout, 'fine\narg=./scripts/bootstrap.mjs\n');
    fs.rmSync (fine);
    // only the old one left: refuse, and say which version is needed
    const refused = launch ({ 'CODEX_MCP_NODE_PATH': old });
    assert.equal (refused.status, 127);
    assert.equal (refused.stdout, '');
    assert.equal (refused.stderr.trim ().split ('\n').length, 1);
    assert.match (refused.stderr, /needs Node\.js 18 or newer, but the only one found is .*old\/node \(v16\.20\.2\)/);
    fs.rmSync (old);
});

test ('things that are not a runnable Node are passed over', { skip }, () => {
    const fine = path.join (pathDir, 'node');
    fakeNode (fine, 'fine');
    const notExecutable = path.join (root, 'junk', 'not-executable');
    const directory = path.join (root, 'junk', 'directory');
    const garbage = path.join (root, 'junk', 'garbage');
    const failing = path.join (root, 'junk', 'failing');
    fs.mkdirSync (directory, { 'recursive': true });
    fs.writeFileSync (notExecutable, '#!/bin/sh\necho v24.0.0\n', { 'mode': 0o644 });
    fs.writeFileSync (garbage, '#!/bin/sh\necho "; touch ' + path.join (root, 'injected') + '"\n', { 'mode': 0o755 });
    fs.writeFileSync (failing, '#!/bin/sh\nexit 3\n', { 'mode': 0o755 });
    for (const candidate of [ notExecutable, directory, garbage, failing, 'relative/node', path.join (root, 'junk', 'missing') ]) {
        const result = launch ({ 'CODEX_MCP_NODE_PATH': candidate });
        assert.equal (result.stdout, 'fine\narg=./scripts/bootstrap.mjs\n', candidate + ': ' + result.stderr);
    }
    assert.ok (!fs.existsSync (path.join (root, 'injected')), 'a version string must never be evaluated');
    fs.rmSync (fine);
});

// mcp.json names the script as ./scripts/bootstrap.mjs. If the launcher let the host's
// working directory decide what that means, a host that starts servers from the user's
// workspace would run a file the workspace controls instead of the plugin's verified chain.
test ('a relative script is resolved against the plugin root, whatever directory the host starts it from', { skip }, () => {
    const plugin = path.join (root, 'installed plugin');
    const foreign = path.join (root, 'untrusted workspace');
    fs.mkdirSync (path.join (plugin, 'scripts'), { 'recursive': true });
    fs.mkdirSync (path.join (foreign, 'scripts'), { 'recursive': true });
    fs.copyFileSync (launcher, path.join (plugin, 'scripts', 'launch'));
    fs.chmodSync (path.join (plugin, 'scripts', 'launch'), 0o755);
    fs.writeFileSync (path.join (plugin, 'scripts', 'bootstrap.mjs'), 'the plugin\'s own bootstrap\n');
    fs.writeFileSync (path.join (foreign, 'scripts', 'bootstrap.mjs'), 'a bootstrap planted in the workspace\n');
    // like the real one, this "node" reads the script it is given from where it stands
    const node = path.join (pathDir, 'node');
    fs.writeFileSync (node, '#!/bin/sh\nif [ "$1" = "--version" ]; then echo v24.1.0; exit 0; fi\ncat "$1"\npwd -P\n', { 'mode': 0o755 });
    const env = { 'HOME': home, 'PATH': pathDir + ':/usr/bin:/bin', 'CDPATH': foreign };
    for (const [ cwd, command ] of [ [ foreign, path.join (plugin, 'scripts', 'launch') ], [ path.join (plugin, 'scripts'), './launch' ], [ plugin, 'scripts/launch' ] ]) {
        const result = spawnSync (command, [ './scripts/bootstrap.mjs' ], { cwd, env, 'encoding': 'utf8' });
        assert.equal (result.stderr, '');
        // nothing but the script's own output reaches stdout (the MCP channel): no CDPATH echo
        assert.equal (result.stdout, 'the plugin\'s own bootstrap\n' + fs.realpathSync (plugin) + '\n', 'started from ' + cwd);
    }
    fs.rmSync (node);
});

test ('without a script to run it stops with usage status 64', { skip }, () => {
    const result = launch ({}, []);
    assert.equal (result.status, 64);
    assert.equal (result.stdout, '');
    assert.match (result.stderr, /launcher was given no script to run/);
});
