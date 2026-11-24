import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { windows, scratchDirectory, removeTree, placeNode, samePath, unixLines, systemEnv, system32, runBatch, batchCommandLine, commandInterpreter } from '../helpers/platform.js';

// plugin/scripts/launch (sh) and plugin/scripts/launch.cmd (Windows) pick the Node runtime
// for the plugin: the host app's own first, then the user's. The order is the contract (a
// user with no Node must get the app's runtime, and an outdated Node must never win over a
// usable one), so every documented location is walked here, highest priority first.
//
// The same tests run against the launcher of the platform they run on. What differs is how
// a stand-in runtime is made:
//   - a FAKE is a script that answers the launcher's version question and then prints who
//     it is and what it was given: a sh script on Unix, a .cmd wrapper on Windows
//   - a REAL one is the Node that runs this suite, placed at the candidate location. Windows
//     needs it wherever the launcher insists on a node.exe (a batch file cannot stand in for
//     a program); it runs the plugin's script, which here is a stub that reports the same
const here = path.dirname (fileURLToPath (import.meta.url));
const scriptsSource = path.resolve (here, '..', '..', 'plugin', 'scripts');
const launcherName = windows ? 'launch.cmd' : 'launch';
const launcherSource = path.join (scriptsSource, launcherName);
const posixOnly = (reason: string): string | false => (windows ? reason : false);
const windowsOnly = (reason: string): string | false => (windows ? false : reason);

let root: string;
let plugin: string;
let launcher: string;
let home: string;
let pathDir: string;
let fixed: string;

// The sh launcher probes fixed system locations (/usr/local/bin/node, /Applications/…) that
// a test cannot create or hide — CI images ship a Node in /usr/local/bin. The copy under
// test is the committed script with exactly those absolute literals moved under a scratch
// root. launch.cmd has no such literal: every location it probes comes from a variable, so
// it is tested as committed.
function sandboxed (source: string, fakeRoot: string): string {
    if (windows) {
        const code = source.split ('\r\n').filter ((line) => !/^rem\b/i.test (line)).join ('\n');
        assert.ok (!/(^|[^A-Za-z])[A-Za-z]:\\/.test (code), 'launch.cmd probes a fixed location this test does not control');
        return source;
    }
    const fixedLocations = [
        '/Applications/ChatGPT.app/Contents/Resources/cua_node/bin/node',
        '/opt/homebrew/bin/node',
        '/usr/local/bin/node',
        '/usr/bin/node',
    ];
    let text = source;
    for (const location of fixedLocations) {
        const literal = 'try_node "' + location + '" "$@"';
        assert.equal (text.split (literal).length, 2, 'the launcher should probe ' + location + ' exactly once');
        text = text.replace (literal, () => 'try_node "' + fakeRoot + location + '" "$@"');
    }
    assert.ok (!/try_node "\/(?!tmp|var|private)/.test (text.split (fakeRoot).join ('/tmp')), 'the launcher probes a fixed location this test does not sandbox');
    return text;
}

// a start that hangs (cmd.exe waiting for a program that opened a window, say) must end as a
// failed test, not as a job that runs into the CI time limit
const TIMEOUT = 120000;

// what a stand-in prints once it is chosen, and the status every one of them ends with
const STATUS = 7;
const stub = [
    'process.stdout.write (\'exe=\' + process.execPath + \'\\n\');',
    'process.stdout.write (\'script=\' + process.argv[1] + \'\\n\');',
    'process.stdout.write (\'cwd=\' + process.cwd () + \'\\n\');',
    'for (const argument of process.argv.slice (2)) {',
    '    process.stdout.write (\'arg=\' + argument + \'\\n\');',
    '}',
    'process.exit (' + STATUS + ');',
].join ('\n') + '\n';

// `old` makes it a Node too old for the server (v16)
function fakeNode (file: string, label: string, old = false): void {
    fs.mkdirSync (path.dirname (file), { 'recursive': true });
    if (windows) {
        assert.match (label, /^[A-Za-z0-9 _.-]+$/, 'the label is printed by `echo`, which would act on anything else');
        // launch.cmd asks "-e <expression>" and reads the answer from the exit status: 42 is
        // a Node that is new enough, 43 an older one
        fs.writeFileSync (file, [
            '@echo off',
            'if "%~1"=="-e" exit /b ' + (old ? 43 : 42),
            'echo ran=' + label,
            ':next',
            'if "%~1"=="" goto :done',
            'echo arg=%~1',
            'shift',
            'goto :next',
            ':done',
            'exit /b ' + STATUS,
        ].join ('\r\n') + '\r\n');
        return;
    }
    fs.writeFileSync (file, [
        '#!/bin/sh',
        'if [ "$1" = "--version" ]; then printf \'%s\\n\' ' + (old ? 'v16.20.2' : 'v24.1.0') + '; exit 0; fi',
        'printf \'ran=%s\\n\' ' + JSON.stringify (label),
        'for argument in "$@"; do printf \'arg=%s\\n\' "$argument"; done',
        'exit ' + STATUS,
    ].join ('\n') + '\n', { 'mode': 0o755 });
}

function realNode (file: string): void {
    placeNode (file, root);
}

interface Launched {
    status: number | null;
    stdout: string;
    stderr: string;
}

function environment (extra: Record<string, string>): Record<string, string> {
    if (!windows) {
        return { 'HOME': home, 'PATH': pathDir, ...extra };
    }
    // every place launch.cmd looks in comes from one of these, so nothing installed on the
    // machine can be found; System32 is on PATH for where.exe, and holds no node.exe
    return {
        ...systemEnv (),
        'USERPROFILE': home,
        'LOCALAPPDATA': path.join (home, 'AppData', 'Local'),
        'ProgramFiles': path.join (fixed, 'Program Files (x86)'),
        'ProgramW6432': path.join (fixed, 'Program Files'),
        'PATH': pathDir + path.delimiter + system32 (),
        ...extra,
    };
}

function launchFrom (command: string, cwd: string | undefined, env: Record<string, string>, args: string[]): Launched {
    const result = windows
        ? runBatch (command, args, { cwd, 'env': environment (env) })
        : spawnSync (command, args, { cwd, 'env': environment (env), 'encoding': 'utf8', 'timeout': TIMEOUT });
    assert.equal (result.error, undefined, String (result.error));
    return { 'status': result.status, 'stdout': unixLines (result.stdout), 'stderr': unixLines (result.stderr) };
}

function launch (env: Record<string, string>, args: string[] = [ './scripts/bootstrap.mjs' ]): Launched {
    return launchFrom (launcher, undefined, env, args);
}

// the launcher chose the fake that prints `label`, and handed it `args` untouched
function assertFakeRan (result: Launched, label: string, args: string[], message = label): void {
    assert.equal (result.stderr, '', message);
    assert.equal (result.stdout, 'ran=' + label + '\n' + args.map ((argument) => 'arg=' + argument + '\n').join (''), message);
    assert.equal (result.status, STATUS, message);
}

// the launcher chose the Node at `file` and ran the plugin's own script with it, from `pluginRoot`
function assertRealRan (result: Launched, file: string, args: string[], message: string, pluginRoot = plugin): void {
    assert.equal (result.stderr, '', message);
    const lines = result.stdout.split ('\n');
    assert.equal (lines.pop (), '', message + ': ' + JSON.stringify (result.stdout));
    const value = (line: string | undefined, key: string): string => {
        assert.ok (line !== undefined && line.startsWith (key + '='), message + ': expected ' + key + '=… in ' + JSON.stringify (result.stdout));
        return (line as string).slice (key.length + 1);
    };
    const exe = value (lines[0], 'exe');
    assert.ok (samePath (exe, file), message + ': ran ' + exe + ' instead of ' + file);
    const script = value (lines[1], 'script');
    assert.ok (samePath (script, path.resolve (pluginRoot, args[0])), message + ': ran the script ' + script);
    const cwd = value (lines[2], 'cwd');
    assert.ok (samePath (cwd, pluginRoot), message + ': ran in ' + cwd);
    // nothing else reached stdout (the MCP channel), and the arguments arrived as they were given
    assert.deepEqual (lines.slice (3), args.slice (1).map ((argument) => 'arg=' + argument), message);
    assert.equal (result.status, STATUS, message);
}

function installPlugin (directory: string): string {
    fs.mkdirSync (path.join (directory, 'scripts'), { 'recursive': true });
    const target = path.join (directory, 'scripts', launcherName);
    fs.writeFileSync (target, sandboxed (fs.readFileSync (launcherSource, 'utf8'), fixed), { 'mode': 0o755 });
    return target;
}

before (() => {
    // spaces, parentheses and an ampersand everywhere: the plugin lives under "Application
    // Support" on macOS and can live under "Program Files (x86)" or a user called "R&D" on
    // Windows, and each of those characters means something to sh or to cmd.exe
    root = scratchDirectory ('ccxt mcp launcher (x86) & co ');
    plugin = path.join (root, 'plug in');
    home = path.join (root, 'home dir');
    pathDir = path.join (root, 'path bin');
    fixed = path.join (root, 'fixed root');
    fs.mkdirSync (home);
    fs.mkdirSync (pathDir);
    launcher = installPlugin (plugin);
    fs.writeFileSync (path.join (plugin, 'scripts', 'bootstrap.mjs'), stub);
    fs.writeFileSync (path.join (plugin, 'scripts', 'boot strap.mjs'), stub);
});

after (() => {
    removeTree (root);
});

test ('the committed sh launcher is an executable POSIX sh script that passes a syntax check', { 'skip': posixOnly ('needs /bin/sh and file modes; launch.cmd is read by the next test and run by all the others') }, () => {
    assert.ok (fs.readFileSync (launcherSource, 'utf8').startsWith ('#!/bin/sh\n'));
    assert.ok ((fs.statSync (launcherSource).mode & 0o111) === 0o111, 'plugin/scripts/launch must be executable (chmod 755; git mode 100755)');
    const check = spawnSync ('/bin/sh', [ '-n', launcherSource ], { 'encoding': 'utf8' });
    assert.equal (check.status, 0, check.stderr);
    // no eval and no command substitution of anything but the three fixed probes (command -v
    // only looks a name up, it runs nothing)
    const code = fs.readFileSync (launcherSource, 'utf8').split ('\n').filter ((line) => !line.trim ().startsWith ('#')).join ('\n');
    assert.ok (!/\beval\b/.test (code));
    assert.deepEqual (code.match (/\$\([^)]*\)/g), [ '$(command -v -- "$0" 2>/dev/null)', '$("$candidate" --version 2>/dev/null </dev/null)', '$(command -v node 2>/dev/null)' ]);
});

// The rules launch.cmd is written by (they are spelled out at its top), checked on every
// platform by reading it: each one is a way a path with an unusual character, or a
// candidate's output, could otherwise change what cmd.exe executes.
test ('launch.cmd keeps the rules that make it safe with any path', () => {
    const text = fs.readFileSync (path.join (scriptsSource, 'launch.cmd'), 'utf8');
    const lines = text.split ('\r\n');
    const code = lines.filter ((line) => !/^rem\b/i.test (line) && line !== '');
    assert.equal (code[0], '@echo off');
    assert.ok (code.includes ('setlocal EnableExtensions DisableDelayedExpansion'));
    assert.ok (!/enabledelayedexpansion/i.test (code.slice (2).join ('\n')));
    // stdout is the MCP channel: the only thing printed is a message, and only to stderr
    for (const line of code.filter ((candidate) => /\becho\b/i.test (candidate)).slice (1)) {
        assert.match (line, /^>&2 echo \[ccxt-mcp plugin\] could not start: /, line);
    }
    assert.equal (code.filter ((line) => /\becho\b/i.test (line)).length, 5);
    // a comment is not a place for characters cmd.exe gives a meaning to
    for (const line of lines.filter ((candidate) => /^rem\b/i.test (candidate))) {
        assert.ok (!/[%&|<>^]/.test (line), 'a rem line with a special character: ' + line);
    }
    // a path never travels as an argument of `call` (which parses the line a second time):
    // the only arguments are literals written in the file
    for (const line of code.filter ((candidate) => /\bcall :/i.test (candidate))) {
        assert.match (line, /call :(try|try_under [a-z_\\-]+)\)?$/, line);
    }
    // a value from the environment is copied with its quotes removed, as the only expansion
    // on its line
    const copies = code.filter ((line) => /^if defined [A-Za-z0-9_]+ set "/.test (line));
    assert.ok (copies.length >= 10);
    for (const line of copies) {
        assert.match (line, /^if defined ([A-Za-z0-9_]+) set "(CANDIDATE|BASE|CLI)=%\1:"=%[^%"]*"$/, line);
    }
    // nothing a candidate prints is read: no `for /f` over a candidate's output, no findstr
    const loops = code.filter ((line) => /\bfor \/f\b/i.test (line));
    assert.equal (loops.length, 1);
    assert.ok (loops[0].includes ('(\'where node.exe 2^>nul ^<nul\')'));
    assert.ok (!/\bfindstr\b/i.test (code.join ('\n')));
    // every probe of a candidate has no stdin (the host's channel) and no output
    const probes = code.filter ((line) => line.includes ('"%PROBE%" -e '));
    assert.equal (probes.length, 2);
    for (const line of probes) {
        assert.ok (line.endsWith (' <nul >nul 2>nul'), line);
    }
    // the file is entered for its own directory before anything is looked for or started
    const entered = code.indexOf ('cd /d "%~dp0.." 2>nul || goto :no_root');
    assert.ok (entered !== -1 && entered < code.findIndex ((line) => /\bcall\b|\bwhere\b|"%PROBE%"/.test (line)));
});

test ('every documented location is tried, in priority order', () => {
    const app = path.join (root, 'ChatGPT.app', 'Contents', 'Resources');
    const nvm = path.join (root, 'nvm dir');
    const cache = path.join ('codex-runtimes', 'codex-primary-runtime', 'dependencies');
    // highest priority first: [ what it is, the file, a fake or the real Node ]
    let env: Record<string, string>;
    let chain: [ string, string, 'fake' | 'real' ][];
    if (windows) {
        const resources = path.join (root, 'electron resources');
        const local = path.join (home, 'AppData', 'Local');
        env = {
            // a wrapper script is accepted where someone names it explicitly, in either
            // batch flavour and whatever the case of its extension
            'CODEX_MCP_NODE_PATH': path.join (root, 'env', 'mcp node', 'node.cmd'),
            'CODEX_BROWSER_USE_NODE_PATH': path.join (root, 'env', 'browser node', 'Node.BAT'),
            'CODEX_ELECTRON_RESOURCES_PATH': resources,
            'CODEX_CLI_PATH': path.join (app, 'codex-cli', 'bin', 'codex.exe'),
            'NODE': path.join (root, 'env', 'explicit node', 'node.exe'),
            'NVM_SYMLINK': nvm,
        };
        chain = [
            [ 'CODEX_MCP_NODE_PATH', env['CODEX_MCP_NODE_PATH'], 'fake' ],
            [ 'CODEX_BROWSER_USE_NODE_PATH', env['CODEX_BROWSER_USE_NODE_PATH'], 'fake' ],
            [ 'CODEX_ELECTRON_RESOURCES_PATH', path.join (resources, 'cua_node', 'node.exe'), 'real' ],
            [ 'CODEX_ELECTRON_RESOURCES_PATH (bin)', path.join (resources, 'cua_node', 'bin', 'node.exe'), 'real' ],
            [ 'beside CODEX_CLI_PATH', path.join (app, 'codex-cli', 'bin', 'cua_node', 'node.exe'), 'real' ],
            [ 'beside CODEX_CLI_PATH (bin)', path.join (app, 'codex-cli', 'bin', 'cua_node', 'bin', 'node.exe'), 'real' ],
            [ 'app resources via CODEX_CLI_PATH', path.join (app, 'cua_node', 'node.exe'), 'real' ],
            [ 'app resources via CODEX_CLI_PATH (bin)', path.join (app, 'cua_node', 'bin', 'node.exe'), 'real' ],
            [ 'cache runtime', path.join (home, '.cache', cache, 'node', 'node.exe'), 'real' ],
            [ 'cache runtime (bin)', path.join (home, '.cache', cache, 'node', 'bin', 'node.exe'), 'real' ],
            [ 'LOCALAPPDATA runtime', path.join (local, cache, 'node', 'node.exe'), 'real' ],
            [ 'LOCALAPPDATA runtime (bin)', path.join (local, cache, 'node', 'bin', 'node.exe'), 'real' ],
            [ 'NODE', env['NODE'], 'real' ],
            [ 'PATH', path.join (pathDir, 'node.exe'), 'real' ],
            [ 'Program Files', path.join (fixed, 'Program Files (x86)', 'nodejs', 'node.exe'), 'real' ],
            [ 'ProgramW6432', path.join (fixed, 'Program Files', 'nodejs', 'node.exe'), 'real' ],
            [ 'NVM_SYMLINK', path.join (nvm, 'node.exe'), 'real' ],
            [ 'Volta', path.join (local, 'Volta', 'bin', 'node.exe'), 'real' ],
        ];
    } else {
        env = {
            'CODEX_MCP_NODE_PATH': path.join (root, 'env', 'mcp node'),
            'CODEX_BROWSER_USE_NODE_PATH': path.join (root, 'env', 'browser node'),
            'CODEX_ELECTRON_RESOURCES_PATH': path.join (root, 'electron resources'),
            'CODEX_CLI_PATH': path.join (app, 'codex-cli', 'bin', 'codex'),
            'NODE': path.join (root, 'env', 'explicit node'),
            'NVM_DIR': nvm,
        };
        chain = [
            [ 'CODEX_MCP_NODE_PATH', env['CODEX_MCP_NODE_PATH'], 'fake' ],
            [ 'CODEX_BROWSER_USE_NODE_PATH', env['CODEX_BROWSER_USE_NODE_PATH'], 'fake' ],
            [ 'CODEX_ELECTRON_RESOURCES_PATH', path.join (env['CODEX_ELECTRON_RESOURCES_PATH'], 'cua_node', 'bin', 'node'), 'fake' ],
            [ 'beside CODEX_CLI_PATH', path.join (app, 'codex-cli', 'bin', 'cua_node', 'bin', 'node'), 'fake' ],
            [ 'app Resources via CODEX_CLI_PATH', path.join (app, 'cua_node', 'bin', 'node'), 'fake' ],
            [ 'cache runtime node/bin', path.join (home, '.cache', cache, 'node', 'bin', 'node'), 'fake' ],
            [ 'cache runtime bin', path.join (home, '.cache', cache, 'bin', 'node'), 'fake' ],
            [ '/Applications/ChatGPT.app', path.join (fixed, 'Applications', 'ChatGPT.app', 'Contents', 'Resources', 'cua_node', 'bin', 'node'), 'fake' ],
            [ '~/Applications/ChatGPT.app', path.join (home, 'Applications', 'ChatGPT.app', 'Contents', 'Resources', 'cua_node', 'bin', 'node'), 'fake' ],
            [ 'NODE', env['NODE'], 'fake' ],
            [ 'PATH', path.join (pathDir, 'node'), 'fake' ],
            [ '/opt/homebrew', path.join (fixed, 'opt', 'homebrew', 'bin', 'node'), 'fake' ],
            [ '/usr/local', path.join (fixed, 'usr', 'local', 'bin', 'node'), 'fake' ],
            [ '/usr/bin', path.join (fixed, 'usr', 'bin', 'node'), 'fake' ],
            [ 'volta', path.join (home, '.volta', 'bin', 'node'), 'fake' ],
            [ 'fnm (XDG data)', path.join (home, '.local', 'share', 'fnm', 'aliases', 'default', 'bin', 'node'), 'fake' ],
            [ 'fnm (macOS)', path.join (home, 'Library', 'Application Support', 'fnm', 'aliases', 'default', 'bin', 'node'), 'fake' ],
            [ 'nvm', path.join (nvm, 'versions', 'node', 'v22.3.0', 'bin', 'node'), 'fake' ],
        ];
    }
    for (const [ label, file, kind ] of chain) {
        if (kind === 'fake') {
            fakeNode (file, label);
        } else {
            realNode (file);
        }
    }
    // exit status and arguments pass through untouched, spaces included
    const args = [ './scripts/boot strap.mjs', 'second arg' ];
    for (const [ label, file, kind ] of chain) {
        const result = launch (env, args);
        if (kind === 'fake') {
            assertFakeRan (result, label, args);
        } else {
            assertRealRan (result, file, args, label);
        }
        fs.rmSync (file, { 'maxRetries': 20, 'retryDelay': 250 });
    }
    const none = launch (env);
    assert.equal (none.status, 127);
    assert.equal (none.stdout, '');
    assert.equal (none.stderr.trim ().split ('\n').length, 1);
    assert.match (none.stderr, /^\[ccxt-mcp plugin\] could not start: no Node\.js runtime was found (—|-) .*install Node\.js 18 or newer from https:\/\/nodejs\.org/);
});

test ('XDG_CACHE_HOME moves the app runtime location', () => {
    const xdg = path.join (root, 'xdg cache');
    const directory = path.join (xdg, 'codex-runtimes', 'codex-primary-runtime', 'dependencies', 'node');
    if (windows) {
        const file = path.join (directory, 'node.exe');
        realNode (file);
        assertRealRan (launch ({ 'XDG_CACHE_HOME': xdg }), file, [ './scripts/bootstrap.mjs' ], 'XDG_CACHE_HOME');
        fs.rmSync (file, { 'maxRetries': 20, 'retryDelay': 250 });
    } else {
        const file = path.join (directory, 'bin', 'node');
        fakeNode (file, 'xdg runtime');
        assertFakeRan (launch ({ 'XDG_CACHE_HOME': xdg }), 'xdg runtime', [ './scripts/bootstrap.mjs' ]);
        fs.rmSync (file);
    }
});

test ('a Node older than 18 is skipped in favour of a newer one further down', () => {
    const args = [ './scripts/bootstrap.mjs' ];
    const old = path.join (root, 'old', windows ? 'node.cmd' : 'node');
    fakeNode (old, 'old', true);
    const fine = path.join (pathDir, windows ? 'node.exe' : 'node');
    if (windows) {
        realNode (fine);
        assertRealRan (launch ({ 'CODEX_MCP_NODE_PATH': old }), fine, args, 'the newer Node on PATH');
    } else {
        fakeNode (fine, 'fine');
        assertFakeRan (launch ({ 'CODEX_MCP_NODE_PATH': old }), 'fine', args);
    }
    fs.rmSync (fine, { 'maxRetries': 20, 'retryDelay': 250 });
    // only the old one left: refuse, and say which version is needed
    const refused = launch ({ 'CODEX_MCP_NODE_PATH': old });
    assert.equal (refused.status, 127);
    assert.equal (refused.stdout, '');
    assert.equal (refused.stderr.trim ().split ('\n').length, 1);
    if (windows) {
        assert.match (refused.stderr, /needs Node\.js 18 or newer, but the only one found is older \(".*\\old\\node\.cmd"\)/);
    } else {
        assert.match (refused.stderr, /needs Node\.js 18 or newer, but the only one found is .*old\/node \(v16\.20\.2\)/);
    }
    fs.rmSync (old);
});

// The fake above answers the version question itself. Here the real Node answers it: with
// the minimum raised above any release, the question launch.cmd asks ("-e <expression>") and
// the one launch asks ("--version") must both come back as "too old".
test ('the version question is understood by a real Node', () => {
    const strict = path.join (root, 'strict plugin');
    const target = installPlugin (strict);
    const source = fs.readFileSync (target, 'utf8');
    const minimum = windows ? 'set "MIN_MAJOR=18"' : 'MIN_MAJOR=18\n';
    assert.equal (source.split (minimum).length, 2);
    fs.writeFileSync (target, source.replace (minimum, minimum.replace ('18', '999')), { 'mode': 0o755 });
    const node = path.join (pathDir, windows ? 'node.exe' : 'node');
    realNode (node);
    const refused = launchFrom (target, undefined, {}, [ './scripts/bootstrap.mjs' ]);
    assert.equal (refused.status, 127, refused.stderr);
    assert.equal (refused.stdout, '');
    assert.match (refused.stderr, /needs Node\.js 999 or newer, but the only one found is /);
    assert.ok (refused.stderr.includes (windows ? '"' + node + '"' : node + ' (' + process.version + ')'), refused.stderr);
    // and as new enough with the real minimum (the plugin's script is the stub)
    assertRealRan (launch ({}), node, [ './scripts/bootstrap.mjs' ], 'the real Node on PATH');
    fs.rmSync (node, { 'maxRetries': 20, 'retryDelay': 250 });
});

test ('things that are not a runnable Node are passed over', () => {
    const args = [ './scripts/bootstrap.mjs' ];
    const junk = path.join (root, 'junk');
    // where a command would leave its mark if anything a candidate prints were ever run
    const injected = windows ? path.join (plugin, 'injected.txt') : path.join (root, 'injected');
    const directory = path.join (junk, windows ? 'directory.exe' : 'directory');
    fs.mkdirSync (directory, { 'recursive': true });
    const candidates: string[] = [ directory, path.join (junk, 'missing' + (windows ? '.exe' : '')) ];
    const fine = path.join (pathDir, windows ? 'node.exe' : 'node');
    if (windows) {
        realNode (fine);
        const script = (name: string, body: string[]): string => {
            const file = path.join (junk, name);
            fs.writeFileSync (file, [ '@echo off', ...body ].join ('\r\n') + '\r\n');
            return file;
        };
        candidates.push (
            // answers the question with a status that is not the answer of a Node …
            script ('failing.cmd', [ 'exit /b 3' ]),
            script ('succeeding.cmd', [ 'exit /b 0' ]),
            script ('other.cmd', [ 'exit /b 44' ]),
            // … or prints things that would be commands if the launcher ever read them (the
            // launcher's working directory is the plugin root)
            script ('garbage.cmd', [ 'echo v24.0.0^&echo x^>injected.txt', 'echo "^&echo x^>injected.txt^&"', 'exit /b 0' ]),
            // not a program and not a batch file: never started, whatever it holds — cmd.exe
            // would hand such a file to the application registered for it
            script ('node.txt', [ 'exit /b 42' ]),
            script ('node', [ 'exit /b 42' ]),
            // a relative name would be looked up in the working directory and on PATH
            'node.exe',
            'relative\\node.exe',
        );
    } else {
        fakeNode (fine, 'fine');
        const notExecutable = path.join (junk, 'not-executable');
        const garbage = path.join (junk, 'garbage');
        const failing = path.join (junk, 'failing');
        fs.writeFileSync (notExecutable, '#!/bin/sh\necho v24.0.0\n', { 'mode': 0o644 });
        fs.writeFileSync (garbage, '#!/bin/sh\necho "; touch \'' + injected + '\'"\n', { 'mode': 0o755 });
        fs.writeFileSync (failing, '#!/bin/sh\nexit 3\n', { 'mode': 0o755 });
        candidates.push (notExecutable, garbage, failing, 'relative/node');
    }
    for (const candidate of candidates) {
        const result = launch ({ 'CODEX_MCP_NODE_PATH': candidate });
        if (windows) {
            assertRealRan (result, fine, args, candidate);
        } else {
            assertFakeRan (result, 'fine', args, candidate);
        }
    }
    assert.ok (!fs.existsSync (injected), 'nothing a candidate prints may ever be evaluated, and a file that is not a program may not be started');
    fs.rmSync (fine, { 'maxRetries': 20, 'retryDelay': 250 });
});

// cmd.exe gives up on the first node.exe of PATH that is not a program; where.exe lists the
// others. (A directory stands in for the broken one: starting it fails without the dialog
// Windows can show for a damaged .exe file.)
test ('launch.cmd goes on to a later node.exe on PATH when the first is not a runnable one', { 'skip': windowsOnly ('launch.cmd needs cmd.exe; the sh launcher asks `command -v node` for the one PATH resolves to') }, () => {
    const first = path.join (root, 'first on path');
    const second = path.join (root, 'second on path');
    fs.mkdirSync (path.join (first, 'node.exe'), { 'recursive': true });
    const node = path.join (second, 'node.exe');
    realNode (node);
    const result = launch ({ 'PATH': [ first, second, system32 () ].join (path.delimiter) });
    assertRealRan (result, node, [ './scripts/bootstrap.mjs' ], 'the second node.exe on PATH');
    fs.rmSync (node, { 'maxRetries': 20, 'retryDelay': 250 });
});

// mcp.json names the script as ./scripts/bootstrap.mjs. If the launcher let the host's
// working directory decide what that means, a host that starts servers from the user's
// workspace would run a file the workspace controls instead of the plugin's verified chain.
test ('a relative script is resolved against the plugin root, whatever directory the host starts it from', () => {
    const installed = path.join (root, 'installed plugin');
    const foreign = path.join (root, 'untrusted workspace');
    const marker = path.join (root, 'decoy ran');
    installPlugin (installed);
    fs.mkdirSync (path.join (foreign, 'scripts'), { 'recursive': true });
    fs.writeFileSync (path.join (installed, 'scripts', 'bootstrap.mjs'), stub);
    // what the workspace plants: the script of the same name, and (Windows) the programs
    // cmd.exe would take from the working directory before it looks at PATH
    const planted = 'import fs from \'node:fs\';\nfs.writeFileSync (' + JSON.stringify (marker) + ', \'the planted bootstrap ran\');\n';
    fs.writeFileSync (path.join (foreign, 'scripts', 'bootstrap.mjs'), planted);
    if (windows) {
        for (const name of [ 'where.cmd', 'where.bat', 'node.cmd', 'node.bat' ]) {
            fs.writeFileSync (path.join (foreign, name), '@echo off\r\necho x> "%~dp0..\\decoy ran"\r\necho planted ' + name + '\r\nexit /b 42\r\n');
        }
    }
    // the real Node: it resolves the script against the directory it is started in
    const node = path.join (pathDir, windows ? 'node.exe' : 'node');
    realNode (node);
    const args = [ './scripts/bootstrap.mjs', 'an argument' ];
    // Windows: the first node.exe on PATH is not a program, so that launch.cmd has to start
    // where.exe — by name, which cmd.exe looks for in the working directory first
    const broken = path.join (root, 'broken first');
    if (windows) {
        fs.mkdirSync (path.join (broken, 'node.exe'), { 'recursive': true });
    }
    const env: Record<string, string> = windows ? { 'PATH': [ broken, pathDir, system32 () ].join (path.delimiter) } : { 'PATH': pathDir + ':/usr/bin:/bin', 'CDPATH': foreign };
    const started: [ string, string ][] = [
        [ foreign, path.join (installed, 'scripts', launcherName) ],
        [ path.join (installed, 'scripts'), windows ? launcherName : './' + launcherName ],
        [ installed, path.join ('scripts', launcherName) ],
    ];
    if (!windows) {
        // (what cmd.exe makes of "/" in a command is the host's side of things: the last test
        // of this file records it)
        started.push ([ installed, './scripts/' + launcherName ]);
    }
    for (const [ cwd, command ] of started) {
        // nothing but the script's own output reaches stdout (the MCP channel): no CDPATH echo
        assertRealRan (launchFrom (command, cwd, env, args), node, args, command + ' started from ' + cwd, installed);
    }
    assert.ok (!fs.existsSync (marker), 'something planted in the working directory was run: ' + (fs.existsSync (marker) ? fs.readFileSync (marker, 'utf8') : ''));
    fs.rmSync (node, { 'maxRetries': 20, 'retryDelay': 250 });
});

// Characters that are data in a file name and syntax in a shell. Each of them has broken a
// launcher of this kind before: "%" and "^" are rewritten by cmd's `call`, "!" by delayed
// expansion, "&", "(" and ")" end a command or a block, a quote around a variable's value
// un-quotes what follows it; "$", a backquote and a quote do the same to sh.
test ('paths and arguments full of shell syntax arrive untouched', () => {
    const odd = windows ? 'odd ^ 100% ! (x86) & co = , ~' : 'odd ^ 100% ! (x86) & co ; $HOME `id` \'q\' "d" *';
    const node = path.join (root, odd, windows ? 'node.exe' : 'node');
    realNode (node);
    const oddPlugin = path.join (root, windows ? 'plugin (x86) & co ^ ! ; = ,' : 'plugin (x86) & co ^ ! ; $HOME `id` \'q\' *');
    const target = installPlugin (oddPlugin);
    fs.writeFileSync (path.join (oddPlugin, 'scripts', 'bootstrap.mjs'), stub);
    // one "%" at most: a pair of them on a cmd.exe command line is a variable, which is the
    // host's concern (the launcher hands its arguments on exactly as it got them)
    const args = windows
        ? [ './scripts/bootstrap.mjs', 'a & b', '100% (x) ^ ! ; = , <in >out |pipe', '' ]
        : [ './scripts/bootstrap.mjs', 'a & b', '100% (x) ^ ! ; $HOME `id` \'q\' "d" * <in >out |pipe', '', ' lead and trail ' ];
    assertRealRan (launchFrom (target, undefined, { 'CODEX_MCP_NODE_PATH': node }, args), node, args, 'named by a variable', oddPlugin);
    if (windows) {
        // a value someone wrapped in quotes, as people do with paths that have spaces
        assertRealRan (launchFrom (target, undefined, { 'CODEX_MCP_NODE_PATH': '"' + node + '"' }, args), node, args, 'named by a quoted variable', oddPlugin);
        // found through PATH and where.exe instead
        assertRealRan (launchFrom (target, undefined, { 'PATH': [ path.dirname (node), system32 () ].join (path.delimiter) }, args), node, args, 'found on PATH', oddPlugin);
        // … and as a location derived from a variable
        const resources = path.join (root, odd, 'resources');
        const bundled = path.join (resources, 'cua_node', 'node.exe');
        realNode (bundled);
        assertRealRan (launchFrom (target, undefined, { 'CODEX_ELECTRON_RESOURCES_PATH': resources }, args), bundled, args, 'under CODEX_ELECTRON_RESOURCES_PATH', oddPlugin);
        fs.rmSync (bundled, { 'maxRetries': 20, 'retryDelay': 250 });
    } else {
        assertRealRan (launchFrom (target, undefined, { 'PATH': path.dirname (node) }, args), node, args, 'found on PATH', oddPlugin);
    }
    fs.rmSync (node, { 'maxRetries': 20, 'retryDelay': 250 });
});

// `sh launch` gives the script a $0 without a directory. The plugin root must then come from
// where the file really is — never from wherever the host happens to stand.
test ('started without a path in $0 the sh launcher still finds the plugin root, or refuses to guess', { 'skip': posixOnly ('sh only: a script started as `sh launch` has no directory in $0. cmd.exe always knows where a batch file is (%~dp0), however it was named — the test above starts launch.cmd by a bare name, a relative and an absolute path') }, () => {
    const installed = path.join (root, 'plugin by name');
    const foreign = path.join (root, 'workspace by name');
    installPlugin (installed);
    const launcherCopy = path.join (installed, 'scripts', 'launch');
    fs.mkdirSync (path.join (foreign, 'scripts'), { 'recursive': true });
    fs.writeFileSync (path.join (installed, 'server.lock.json'), '{}');
    fs.writeFileSync (path.join (installed, 'scripts', 'bootstrap.mjs'), 'the plugin\'s own bootstrap\n');
    // an untrusted directory one level below a planted scripts/bootstrap.mjs: what ".." of
    // the working directory would run
    fs.writeFileSync (path.join (foreign, 'scripts', 'bootstrap.mjs'), 'a bootstrap planted in the workspace\n');
    const below = path.join (foreign, 'sub');
    fs.mkdirSync (below);
    // like the real one, this "node" reads the script it is given from where it stands
    const node = path.join (pathDir, 'node');
    fs.writeFileSync (node, '#!/bin/sh\nif [ "$1" = "--version" ]; then echo v24.1.0; exit 0; fi\ncat "$1"\npwd -P\n', { 'mode': 0o755 });
    const expected = 'the plugin\'s own bootstrap\n' + fs.realpathSync (installed) + '\n';
    const base = pathDir + ':/usr/bin:/bin';
    // 1. the shell found "launch" in the working directory
    let result = spawnSync ('/bin/sh', [ 'launch', './scripts/bootstrap.mjs' ], { 'cwd': path.join (installed, 'scripts'), 'env': { 'HOME': home, 'PATH': base }, 'encoding': 'utf8' });
    assert.equal (result.stderr, '');
    assert.equal (result.stdout, expected);
    // 2. a shell that goes on to PATH (bash does) found it there, from an untrusted directory
    const bash = [ '/bin/bash', '/usr/bin/bash' ].find ((candidate) => fs.existsSync (candidate));
    if (bash !== undefined) {
        result = spawnSync (bash, [ 'launch', './scripts/bootstrap.mjs' ], { 'cwd': below, 'env': { 'HOME': home, 'PATH': path.join (installed, 'scripts') + ':' + base }, 'encoding': 'utf8' });
        assert.equal (result.stderr, '');
        assert.equal (result.stdout, expected, 'the root is where PATH found the launcher, not ".." of the working directory');
    }
    // 3. no file to locate (the script arrives on stdin, $0 is the shell): nothing is run,
    //    least of all the bootstrap one level up from the working directory
    result = spawnSync ('/bin/sh', [ '-s', './scripts/bootstrap.mjs' ], { 'argv0': 'sh', 'cwd': below, 'env': { 'HOME': home, 'PATH': base }, 'input': fs.readFileSync (launcherCopy, 'utf8'), 'encoding': 'utf8' });
    assert.equal (result.status, 66);
    assert.equal (result.stdout, '');
    assert.match (result.stderr, /cannot tell where the plugin is installed|plugin folder cannot be opened/);
    // 4. found on PATH, but in a directory that is not a plugin: refused as well
    const stray = path.join (root, 'stray bin');
    fs.mkdirSync (stray);
    fs.copyFileSync (launcherCopy, path.join (stray, 'launch'));
    fs.chmodSync (path.join (stray, 'launch'), 0o755);
    if (bash !== undefined) {
        result = spawnSync (bash, [ 'launch', './scripts/bootstrap.mjs' ], { 'cwd': below, 'env': { 'HOME': home, 'PATH': stray + ':' + base }, 'encoding': 'utf8' });
        assert.equal (result.status, 66);
        assert.equal (result.stdout, '');
        assert.match (result.stderr, /cannot tell where the plugin is installed/);
    }
    fs.rmSync (node);
});

test ('without a script to run it stops with usage status 64', () => {
    const result = launch ({}, []);
    assert.equal (result.status, 64);
    assert.equal (result.stdout, '');
    assert.match (result.stderr, /^\[ccxt-mcp plugin\] could not start: the launcher was given no script to run/);
    assert.equal (result.stderr.trim ().split ('\n').length, 1);
});

// plugin/mcp.json names the launcher as "./scripts/launch", without an extension, for every
// platform — the way OpenAI's own bundled plugin does. On Windows that only starts anything
// if the host completes the name to launch.cmd. No host can be run here, so this test shows
// what each of the ways a host could start the command does with the files as shipped. It
// FAILS only where the outcome would be dangerous or would contradict the plugin README
// (something other than the plugin's launcher ran; the .cmd named in full does not work);
// the outcomes that depend on the host are printed as diagnostics, for the README to quote.
test ('how "./scripts/launch" from mcp.json can reach launch.cmd on Windows', { 'skip': windowsOnly ('Windows only: on Unix the host executes scripts/launch itself, which every other test here does') }, (context) => {
    const installed = path.join (root, 'as shipped');
    fs.mkdirSync (path.join (installed, 'scripts'), { 'recursive': true });
    for (const name of [ 'launch', 'launch.cmd' ]) {
        fs.copyFileSync (path.join (scriptsSource, name), path.join (installed, 'scripts', name));
    }
    fs.writeFileSync (path.join (installed, 'scripts', 'bootstrap.mjs'), stub);
    const manifest = JSON.parse (fs.readFileSync (path.resolve (scriptsSource, '..', 'mcp.json'), 'utf8'));
    const server: any = Object.values (manifest.mcpServers ?? manifest)[0];
    assert.equal (server.command, './scripts/launch');
    const args: string[] = server.args;
    const node = path.join (pathDir, 'node.exe');
    realNode (node);
    const env = environment ({});
    type Outcome = { error?: Error, status: number | null, stdout: string | null, stderr: string | null };
    // (Node reports a file it will not start in two ways: as `error`, or by throwing)
    const attempt = (start: () => Outcome): Outcome => {
        try {
            return start ();
        } catch (error) {
            return { 'error': error as Error, 'status': null, 'stdout': null, 'stderr': null };
        }
    };
    const report = (how: string, result: Outcome): boolean => {
        const stdout = unixLines (String (result.stdout ?? ''));
        const started = result.error === undefined && result.status === STATUS;
        if (started) {
            // whatever started, it was the plugin's launcher and it found the plugin's script
            assertRealRan ({ 'status': result.status, stdout, 'stderr': unixLines (String (result.stderr ?? '')) }, node, args, how, installed);
        } else {
            assert.equal (stdout, '', how + ': nothing may reach stdout when the launcher does not start');
        }
        context.diagnostic (how + ': ' + (started ? 'STARTS the launcher' : 'does NOT start it (' + ((result.error as any)?.code ?? ('status ' + result.status + ', ' + JSON.stringify (unixLines (String (result.stderr ?? '')).trim ().slice (0, 160)))) + ')'));
        return started;
    };
    // 1. a host that creates the process itself (CreateProcess; Rust's std::process and
    //    Node's spawn do this): the file without an extension is a sh script, not a program
    const header = fs.readFileSync (path.join (installed, 'scripts', 'launch')).subarray (0, 2).toString ('latin1');
    assert.notEqual (header, 'MZ');
    assert.ok (!fs.existsSync (path.join (installed, 'scripts', 'launch.exe')));
    const direct = report ('CreateProcess on scripts\\launch (no extension, no shell)', attempt (() => spawnSync (path.join (installed, 'scripts', 'launch'), args, { 'cwd': installed, env, 'encoding': 'utf8', 'windowsHide': true, 'timeout': TIMEOUT })));
    assert.equal (direct, false, 'a sh script cannot be a Windows program');
    // 2. the same host with the extension added, the way a PATHEXT-aware resolver (the
    //    `which` crate, cmd.exe) completes it: Node refuses to start a .cmd without a shell
    //    since the fix for CVE-2024-27980; Rust's std starts it through cmd.exe
    report ('CreateProcess on scripts\\launch.cmd (no shell, as Node does it)', attempt (() => spawnSync (path.join (installed, 'scripts', 'launch.cmd'), args, { 'cwd': installed, env, 'encoding': 'utf8', 'windowsHide': true, 'timeout': TIMEOUT })));
    // 3. through cmd.exe with the .cmd named in full — what a resolver that found the
    //    extension has to end in. This one MUST work.
    const viaCmd = runBatch (path.join (installed, 'scripts', 'launch.cmd'), args, { 'cwd': installed, env });
    assert.equal (report ('cmd.exe /d /s /c ""<plugin>\\scripts\\launch.cmd" <args>"', viaCmd), true, viaCmd.stderr);
    const relative = spawnSync (commandInterpreter (), [ '/d', '/s', '/c', batchCommandLine ('./scripts/launch.cmd', args) ], { 'cwd': installed, env, 'encoding': 'utf8', 'windowsVerbatimArguments': true, 'windowsHide': true, 'timeout': TIMEOUT });
    report ('cmd.exe /d /s /c ""./scripts/launch.cmd" <args>" from the plugin root', relative);
    // 4. through a shell with the command exactly as mcp.json has it (Node's `shell: true`
    //    hands cmd.exe the words unquoted): cmd.exe reads "/" as the start of a switch
    report ('shell: true with "./scripts/launch" as written in mcp.json', attempt (() => spawnSync (server.command, args, { 'cwd': installed, env, 'encoding': 'utf8', 'shell': true, 'windowsHide': true, 'timeout': TIMEOUT })));
    report ('shell: true with ".\\scripts\\launch" (backslashes)', attempt (() => spawnSync ('.\\scripts\\launch', args, { 'cwd': installed, env, 'encoding': 'utf8', 'shell': true, 'windowsHide': true, 'timeout': TIMEOUT })));
    // 5. the command between quotes, as a host that quotes its words would pass it
    const quoted = spawnSync (commandInterpreter (), [ '/d', '/s', '/c', batchCommandLine (server.command, args) ], { 'cwd': installed, env, 'encoding': 'utf8', 'windowsVerbatimArguments': true, 'windowsHide': true, 'timeout': TIMEOUT });
    report ('cmd.exe /d /s /c ""./scripts/launch" <args>" (quoted, no extension)', quoted);
    const backslashes = spawnSync (commandInterpreter (), [ '/d', '/s', '/c', batchCommandLine ('.\\scripts\\launch', args) ], { 'cwd': installed, env, 'encoding': 'utf8', 'windowsVerbatimArguments': true, 'windowsHide': true, 'timeout': TIMEOUT });
    report ('cmd.exe /d /s /c "".\\scripts\\launch" <args>" (quoted, backslashes, no extension)', backslashes);
    fs.rmSync (node, { 'maxRetries': 20, 'retryDelay': 250 });
});
