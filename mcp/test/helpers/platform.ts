import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawnSync, type SpawnSyncReturns } from 'child_process';

// What the launcher / bootstrap / smoke tests need to behave the same on Linux, macOS and
// Windows: scratch directories whose paths compare equal to what a child process reports,
// a copy of the running Node, a minimal environment for a child, and a way to start a batch
// file with a command line this code controls.
export const windows = process.platform === 'win32';

// A fresh directory under the temp directory, as the path the operating system itself
// reports for it. The temp directory is a symlink on macOS (/var -> /private/var) and an
// 8.3 short name on GitHub's Windows runners (C:\Users\RUNNER~1\…); a child that prints its
// working directory or its own path prints the resolved form, and the two must compare equal.
export function scratchDirectory (prefix: string): string {
    return fs.realpathSync.native (tempDirectory (prefix));
}

// A fresh directory under the temp directory that is removed again when the test process
// ends. Every test file used to leave its own behind (a journal, a config file, a launch
// file): thousands of ccxt-mcp-* directories after a day of runs. An exit handler rather
// than an `after` hook: it also runs when a test fails or the file is cut short, and after
// everything that still had a file open in there is gone.
const temporaryDirectories: string[] = [];
process.on ('exit', () => {
    for (const directory of temporaryDirectories) {
        try {
            fs.rmSync (directory, { 'recursive': true, 'force': true });
        } catch (error) {
            // still in use (Windows): the system's own temp cleanup gets it
        }
    }
});

export function tempDirectory (prefix: string): string {
    const directory = fs.mkdtempSync (path.join (os.tmpdir (), prefix));
    temporaryDirectories.push (directory);
    return directory;
}

// Windows refuses to delete a program for a moment after it exited (and for as long as a
// virus scanner looks at it), so a removal there is retried instead of failing the suite.
export function removeTree (directory: string | undefined): void {
    if (directory !== undefined) {
        fs.rmSync (directory, { 'recursive': true, 'force': true, 'maxRetries': 20, 'retryDelay': 250 });
    }
}

export const nodeName = windows ? 'node.exe' : 'node';

// Puts the Node that runs the tests at `target`. A hard link is instant, but on Windows a
// link to the program of a RUNNING process cannot be deleted again (the first Windows run of
// this suite ended in "EPERM … unlink …\node.exe" for exactly that reason), so there the
// first call makes one real copy and every later one links to that copy.
let nodeCopy: string | undefined;
export function placeNode (target: string, copyDirectory: string): void {
    fs.mkdirSync (path.dirname (target), { 'recursive': true });
    let source = process.execPath;
    if (windows) {
        if (nodeCopy === undefined || !fs.existsSync (nodeCopy)) {
            nodeCopy = path.join (copyDirectory, 'node-copy-' + process.pid + '.exe');
            fs.copyFileSync (process.execPath, nodeCopy);
        }
        source = nodeCopy;
    }
    try {
        fs.linkSync (source, target);
    } catch (error) {
        // another volume, or a file system without hard links
        fs.copyFileSync (source, target);
        fs.chmodSync (target, 0o755);
    }
}

// two spellings of one file: Windows paths differ in case and in "\" against "/"
export function samePath (a: string, b: string): boolean {
    const canonical = (file: string): string => {
        let resolved = path.resolve (file);
        try {
            resolved = fs.realpathSync.native (resolved);
        } catch (error) {
            // it need not exist any more
        }
        return windows ? resolved.toLowerCase () : resolved;
    };
    return canonical (a) === canonical (b);
}

// a batch file's `echo` ends its lines with CR LF
export function unixLines (text: string): string {
    return text.replace (/\r\n/g, '\n');
}

// The variables a Windows program cannot do without (sockets and cmd.exe need SystemRoot),
// and nothing else: no PATH, no profile, no Program Files — the caller adds those, so that
// nothing installed on the machine that runs the tests can be found by accident.
export function systemEnv (): Record<string, string> {
    if (!windows) {
        return {};
    }
    const env: Record<string, string> = {};
    for (const name of [ 'SystemRoot', 'windir', 'SystemDrive', 'ComSpec', 'PATHEXT', 'TEMP', 'TMP', 'NUMBER_OF_PROCESSORS', 'PROCESSOR_ARCHITECTURE' ]) {
        const found = Object.keys (process.env).find ((key) => key.toUpperCase () === name.toUpperCase ());
        if (found !== undefined && process.env[found] !== undefined) {
            env[name] = process.env[found] as string;
        }
    }
    return env;
}

export function commandInterpreter (): string {
    const systemRoot = process.env['SystemRoot'] || process.env['windir'] || 'C:\\Windows';
    return process.env['ComSpec'] || path.join (systemRoot, 'System32', 'cmd.exe');
}

export function system32 (): string {
    return path.join (process.env['SystemRoot'] || process.env['windir'] || 'C:\\Windows', 'System32');
}

// The command line cmd.exe is given for `file` and `args`: every word between double
// quotes, the whole between one more pair that /s makes cmd remove again. This is how a
// host has to start a .cmd file (Rust's std and Node's `shell` option both end in
// `cmd.exe /d /s /c "…"`), written out here so that the test, not a library, decides what
// cmd sees. Inside double quotes cmd gives a meaning to `"` and to a pair of `%` only.
export function batchCommandLine (file: string, args: string[]): string {
    const words = [ file, ...args ];
    const quoted = words.map ((word) => {
        assert.ok (!word.includes ('"'), 'a double quote cannot be passed to a batch file: ' + word);
        // "…\" would escape the closing quote for the program that reads the argument
        assert.ok (!word.endsWith ('\\'), 'an argument that ends in a backslash cannot be quoted: ' + word);
        return '"' + word + '"';
    });
    assert.ok ((words.join ('').match (/%/g) ?? []).length <= 1, 'cmd.exe would expand a pair of % signs');
    return '"' + quoted.join (' ') + '"';
}

// Starts a batch file the way a host must: through cmd.exe, with the command line above.
// A start that hangs (a program that opened a window, say) ends as a failed test after two
// minutes instead of holding the job until the CI time limit.
export function runBatch (file: string, args: string[], options: { cwd?: string, env?: Record<string, string>, input?: string } = {}): SpawnSyncReturns<string> {
    return spawnSync (commandInterpreter (), [ '/d', '/v:off', '/s', '/c', batchCommandLine (file, args) ], { ...options, 'encoding': 'utf8', 'windowsVerbatimArguments': true, 'windowsHide': true, 'timeout': 120000 });
}
