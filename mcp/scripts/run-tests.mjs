// Runs the test suite with an explicit file list. `npm test` used shell globs
// (test/unit/*.test.ts), which cmd.exe does not expand and Node 20's test runner does not
// expand either — on Windows the suite found no files. Listing the files here makes the same
// command work on every platform and Node version.
//
// Usage:  node scripts/run-tests.mjs [--tap <file>] [dir ...]   (default: unit schema integration)
//   --tap <file>  also write the results there as TAP (the CI workflow keeps that file, so a
//                 run on a system nobody has at hand can be read afterwards: every failure
//                 with its output, and every skipped test with its reason)
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const mcpRoot = path.resolve (path.dirname (fileURLToPath (import.meta.url)), '..');
const groups = process.argv.slice (2);
let tapFile;
const tapFlag = groups.indexOf ('--tap');
if (tapFlag !== -1) {
    tapFile = groups.splice (tapFlag, 2)[1];
    if (tapFile === undefined) {
        process.stderr.write ('[run-tests] --tap needs a file name\n');
        process.exit (1);
    }
    tapFile = path.resolve (tapFile);
}
const dirs = groups.length ? groups : [ 'unit', 'schema', 'integration' ];
const files = [];
for (const dir of dirs) {
    const full = path.join (mcpRoot, 'test', dir);
    if (!fs.existsSync (full)) {
        process.stderr.write ('[run-tests] no such test directory: ' + full + '\n');
        process.exit (1);
    }
    for (const name of fs.readdirSync (full).sort ()) {
        if (name.endsWith ('.test.ts')) {
            files.push (path.join ('test', dir, name));
        }
    }
}
if (files.length === 0) {
    process.stderr.write ('[run-tests] no test files found\n');
    process.exit (1);
}
// with a destination for one reporter the runner wants one for each: the usual output
// stays on stdout, in the same format, and the file gets a copy
const reporters = (tapFile === undefined) ? [] : [ '--test-reporter=tap', '--test-reporter-destination=stdout', '--test-reporter=tap', '--test-reporter-destination=' + tapFile ];
const result = spawnSync (process.execPath, [ '--import', 'tsx', '--test', ...reporters, ...files ], { 'cwd': mcpRoot, 'stdio': 'inherit' });
if (tapFile !== undefined && fs.existsSync (tapFile)) {
    // the reasons tests were skipped for, counted: a platform on which half the suite says
    // nothing must be visible at the end of the log, not only inside it
    const reasons = new Map ();
    for (const line of fs.readFileSync (tapFile, 'utf8').split ('\n')) {
        const skipped = /^\s*ok \d+ - (.*?) # SKIP ?(.*)$/.exec (line);
        if (skipped !== null) {
            const reason = skipped[2] || '(no reason given)';
            reasons.set (reason, (reasons.get (reason) ?? []).concat ([ skipped[1] ]));
        }
    }
    const total = [ ...reasons.values () ].reduce ((sum, tests) => sum + tests.length, 0);
    process.stderr.write ('[run-tests] ' + total + ' skipped on ' + process.platform + ' (Node ' + process.versions.node + ')' + ((total > 0) ? ':' : '') + '\n');
    for (const [ reason, tests ] of reasons) {
        process.stderr.write ('[run-tests]   ' + tests.length + ' × ' + reason + '\n');
        for (const name of tests) {
            process.stderr.write ('[run-tests]       ' + name + '\n');
        }
    }
}
process.exit (result.status ?? 1);
