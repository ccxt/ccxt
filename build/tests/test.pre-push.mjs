import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const hook = fileURLToPath(new URL('../../.git-templates/hooks/pre-push', import.meta.url));

function runHook(change, lintExit = 0) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ccxt-pre-push-'));
    try {
        const env = { ...process.env, GIT_CONFIG_GLOBAL: '/dev/null', GIT_CONFIG_NOSYSTEM: '1' };
        const git = (...args) => execFileSync('git', ['-c', 'core.hooksPath=/dev/null', ...args], { cwd: root, env, stdio: 'pipe' });
        git('init');
        git('config', 'user.name', 'Hook Test');
        git('config', 'user.email', 'hook@example.invalid');
        fs.mkdirSync(path.join(root, 'ts/src'), { recursive: true });
        fs.writeFileSync(path.join(root, 'ts/src/example.ts'), 'export const value = 1;\n');
        git('add', '.');
        git('commit', '-m', 'baseline');
        git('update-ref', 'refs/remotes/upstream/master', 'HEAD');
        change(root, git);
        const bin = path.join(root, 'bin');
        const log = path.join(root, 'calls.jsonl');
        fs.mkdirSync(bin);
        for (const command of ['eslint', 'npm']) {
            fs.writeFileSync(path.join(bin, command), `#!${process.execPath}\n` +
                `require('node:fs').appendFileSync(process.env.HOOK_TEST_LOG, JSON.stringify([${JSON.stringify(command)}, ...process.argv.slice(2)]) + '\\n');\n` +
                `process.exit(${command === 'eslint' ? lintExit : 0});\n`, { mode: 0o755 });
        }
        const result = spawnSync('bash', [hook], { cwd: root, encoding: 'utf8', env: { ...env, PATH: bin + path.delimiter + env.PATH, HOOK_TEST_LOG: log } });
        assert.ifError(result.error);
        const calls = fs.existsSync(log) ? fs.readFileSync(log, 'utf8').trim().split('\n').map(JSON.parse) : [];
        return { status: result.status, calls };
    } finally {
        fs.rmSync(root, { recursive: true, force: true });
    }
}

const otherChecks = [['npm', 'run', 'check-python-style'], ['npm', 'run', 'check-php-syntax']];

test('no changes: no checks run', () => {
    assert.deepEqual(runHook(() => {}), { status: 0, calls: [] });
});

test('deleted TS: skip ESLint but retain Python and PHP checks', () => {
    const result = runHook(root => fs.unlinkSync(path.join(root, 'ts/src/example.ts')));
    assert.deepEqual(result, { status: 0, calls: otherChecks });
});

test('renamed TS with spaces: lint only the destination as one argument', () => {
    const result = runHook((root, git) => git('mv', 'ts/src/example.ts', 'ts/src/renamed example.ts'));
    assert.deepEqual(result, { status: 0, calls: [['eslint', 'ts/src/renamed example.ts'], ...otherChecks] });
});

test('modified TS remains linted', () => {
    const result = runHook(root => fs.appendFileSync(path.join(root, 'ts/src/example.ts'), '// changed\n'));
    assert.deepEqual(result, { status: 0, calls: [['eslint', 'ts/src/example.ts'], ...otherChecks] });
});

test('added TS remains linted', () => {
    const result = runHook((root, git) => {
        fs.writeFileSync(path.join(root, 'ts/src/added.ts'), 'export const added = 1;\n');
        git('add', 'ts/src/added.ts');
    });
    assert.deepEqual(result, { status: 0, calls: [['eslint', 'ts/src/added.ts'], ...otherChecks] });
});

test('ESLint failure still blocks the push', () => {
    const result = runHook(root => fs.appendFileSync(path.join(root, 'ts/src/example.ts'), '// changed\n'), 9);
    assert.deepEqual(result, { status: 9, calls: [['eslint', 'ts/src/example.ts']] });
});
