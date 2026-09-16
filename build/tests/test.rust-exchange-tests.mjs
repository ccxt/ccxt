import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { RustTranspilerBuilder } from '../rustTranspiler.ts';

const builder = new RustTranspilerBuilder();

test('preserves async free functions without await, but not synchronous siblings', () => {
    const source = 'async function helper() { return true; }\nfunction syncHelper() { return true; }';
    const rust = 'fn helper() -> Value { Value::Bool(true) }\nfn syncHelper() -> Value { Value::Bool(true) }';
    const output = builder.runExchangeTestPipeline(rust, new Set(), source);
    assert.match(output, /async fn helper\(/);
    assert.match(output, /\nfn syncHelper\(/);
});

test('ignores async declarations inside TS comments and strings', () => {
    const source = '// async function helper() {}\nconst text = "async function helper() {}";';
    const output = builder.runExchangeTestPipeline('fn helper() -> Value { Value::Null }', new Set(), source);
    assert.doesNotMatch(output, /async fn/);
});

test('real fetchTrades keeps its awaited async helper and group_by call', () => {
    const file = 'ts/src/test/Exchange/test.fetchTrades.ts';
    const result = builder.transpiler.transpileRustByPath(file);
    const output = builder.runExchangeTestPipeline(result.content, new Set(), fs.readFileSync(file, 'utf8'));
    assert.match(output, /async fn helperTestFetchTradesSideSequence\(/);
    assert.match(output, /helperTestFetchTradesSideSequence\([^;]+\)\.await;/);
    assert.match(output, /exchange\.group_by\(/);
});
