import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { ESLint } from 'eslint';

const eslint = new ESLint();
const filePath = 'ts/src/base/functions/number.ts';

test('all current utilities are covered without source changes', async () => {
    const results = await eslint.lintFiles(['ts/src/base/functions/**/*.ts']);
    assert.ok(results.length >= 16);
    for (const result of results) {
        assert.equal(await eslint.isPathIgnored(result.filePath), false, result.filePath);
        assert.equal(result.errorCount, 0, JSON.stringify(result.messages));
        assert.ok(!result.messages.some(message => message.message.includes('no matching configuration')));
    }
});

test('recommended correctness rules catch real errors', async () => {
    const [result] = await eslint.lintText('export function broken(): number { return 1; return 2; }\nexport const repeated = { a: 1, a: 2 };\n', { filePath });
    const rules = result.messages.map(message => message.ruleId);
    assert.ok(rules.includes('no-unreachable'));
    assert.ok(rules.includes('no-dupe-keys'));
});

test('native idioms, overloads and optional browser imports remain allowed', async () => {
    const source = `export function value(x: number): number;
export function value(x: string): string;
export function value(x: any): any { if (x) return x; return 0; }
export async function optionalModule() { try { await import('node:fs'); } catch (error) {} }
`;
    const [result] = await eslint.lintText(source, { filePath });
    assert.equal(result.errorCount, 0, JSON.stringify(result.messages));
});

test('utilities do not change the existing exchange rules', async () => {
    const utility = await eslint.calculateConfigForFile(filePath);
    const exchange = await eslint.calculateConfigForFile('ts/src/bingx.ts');
    assert.equal(utility.rules['@typescript-eslint/strict-boolean-expressions'], undefined);
    assert.equal(exchange.rules['@typescript-eslint/strict-boolean-expressions'][0], 2);
    const pkg = JSON.parse(fs.readFileSync(new URL('../../package.json', import.meta.url), 'utf8'));
    assert.ok(pkg.scripts.lint.includes('"ts/src/base/functions/**/*.ts"'));
});
