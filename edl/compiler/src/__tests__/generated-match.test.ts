import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

import { compileContent } from '../index.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const compilerRoot = path.resolve(__dirname, '../..');
const projectRoot = path.resolve(compilerRoot, '..');
const exchangesDir = path.resolve(projectRoot, 'exchanges');
const snapshotsDir = path.resolve(compilerRoot, 'test-snapshots');

async function assertMatchesSnapshot(exchange: string) {
    const yamlPath = path.join(exchangesDir, `${exchange}.edl.yaml`);
    const tsPath = path.join(snapshotsDir, `${exchange}.ts.snap`);

    const source = fs.readFileSync(yamlPath, 'utf-8');
    const expected = fs.readFileSync(tsPath, 'utf-8').trim();

    const { code, result } = compileContent(source);
    assert.ok(result.success, `Compilation failed for ${exchange}: ${result.errors.join(', ')}`);
    assert.ok(code, `No code emitted for ${exchange}`);
    assert.equal(
        code.trim(),
        expected,
        `${exchange} generated TypeScript differs from checked-in snapshot`
    );
}

test('kraken DSL matches generated TypeScript snapshot', async () => {
    await assertMatchesSnapshot('kraken');
});

test('binance DSL matches generated TypeScript snapshot', async () => {
    await assertMatchesSnapshot('binance');
});
