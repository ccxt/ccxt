// Runs the test suite with an explicit file list. `npm test` used shell globs
// (test/unit/*.test.ts), which cmd.exe does not expand and Node 20's test runner does not
// expand either — on Windows the suite found no files. Listing the files here makes the same
// command work on every platform and Node version.
//
// Usage:  node scripts/run-tests.mjs [dir ...]      (default: unit schema integration)
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const mcpRoot = path.resolve (path.dirname (fileURLToPath (import.meta.url)), '..');
const groups = process.argv.slice (2);
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
const result = spawnSync (process.execPath, [ '--import', 'tsx', '--test', ...files ], { 'cwd': mcpRoot, 'stdio': 'inherit' });
process.exit (result.status ?? 1);
