import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { needsRustNativeTests } from '../utils/rust-native-tests.mjs';

test('runtime, generator, shared base and dependency changes select native tests', () => {
    for (const file of [
        'rust/ccxt-base/src/exchange.rs', 'rust/ccxt-base/src/value.rs',
        'rust/ccxt-base/tests/regression.rs', 'rust/ccxt-base/Cargo.toml',
        'rust/Cargo.toml', 'rust/Cargo.lock', 'ts/src/base/ws/Cache.ts',
        'build/rustTranspiler.ts', 'build/generateRustWrappers.ts',
        'build/rustFutureGenerator.ts', 'build/rust/helpers/new-pass.mjs',
        'build/granular-rust-build.ts', 'build/cache-remove-call.js',
        'package.json', 'package-lock.json', '.github/workflows/rust.yml',
        'build/utils/rust-native-tests.mjs', 'build/tests/test.rust-native-tests.mjs',
    ]) assert.equal(needsRustNativeTests([file]), true, file);
});

test('workflow keeps native selection independent of transpile scope and includes master', () => {
    const workflow = fs.readFileSync(new URL('../../.github/workflows/rust.yml', import.meta.url), 'utf8');
    assert.match(workflow, /- name: Transpile To Rust\n\s+if: env\.important_modified == 'true'\n/);
    assert.match(workflow, /- name: Transpile to Rust \(specific\)\n\s+if: env\.important_modified == 'false'\n/);
    const condition = workflow.split('- name: Native Rust regression tests')[1].match(/\n\s+if: (.+)/)[1];
    assert.equal(condition, "(github.ref == 'refs/heads/master' && (env.important_modified == 'true' || steps.native-tests.outputs.enabled == 'true')) || (github.event_name == 'pull_request' && steps.native-tests.outputs.enabled == 'true')");
    assert.match(workflow, /- name: Cargo test gate\n\s+if: github\.ref == 'refs\/heads\/master' && env\.important_modified == 'true'\n/);
});

test('ordinary exchange, generated venue and documentation changes stay scoped', () => {
    assert.equal(needsRustNativeTests([]), false);
    assert.equal(needsRustNativeTests([
        'ts/src/bingx.ts', 'ts/src/pro/bingx.ts',
        'ts/src/test/static/ws/bingx.json', 'rust/ccxt-pro/src/pro/bingx.rs',
        'rust/ccxt-base/README.md', 'build/javaTranspiler.ts',
    ]), false);
});

test('a mixed PR still selects native tests', () => {
    assert.equal(needsRustNativeTests(['ts/src/bingx.ts', 'rust/ccxt-base/src/value.rs']), true);
});

test('the CLI includes deleted runtime files in the comparison', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ccxt-rust-native-'));
    try {
        const env = { ...process.env, GIT_CONFIG_GLOBAL: '/dev/null', GIT_CONFIG_NOSYSTEM: '1' };
        const git = (...args) => execFileSync('git', ['-c', 'core.hooksPath=/dev/null', ...args], { cwd: root, env, stdio: 'pipe' });
        git('init');
        git('config', 'user.name', 'CI Test');
        git('config', 'user.email', 'ci@example.invalid');
        fs.mkdirSync(path.join(root, 'rust/ccxt-base/src'), { recursive: true });
        const file = path.join(root, 'rust/ccxt-base/src/old.rs');
        fs.writeFileSync(file, '// old\n');
        git('add', '.');
        git('commit', '-m', 'baseline');
        const script = fileURLToPath(new URL('../utils/rust-native-tests.mjs', import.meta.url));
        // Missing history must fail, not silently report that tests can be skipped.
        assert.throws(() => execFileSync(process.execPath, [script], { cwd: root, env, stdio: 'pipe' }));
        fs.unlinkSync(file);
        git('add', '-u');
        git('commit', '-m', 'remove runtime file');
        assert.equal(execFileSync(process.execPath, [script], { cwd: root, env, encoding: 'utf8' }), 'enabled=true\n');
    } finally {
        fs.rmSync(root, { recursive: true, force: true });
    }
});
