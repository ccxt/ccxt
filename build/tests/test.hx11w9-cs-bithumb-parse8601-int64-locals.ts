// Run: npx tsx --test build/tests/test.hx11w9-cs-bithumb-parse8601-int64-locals.ts
import assert from 'node:assert/strict';
import test from 'node:test';
import Transpiler from 'ast-transpiler';
import { setupCsharpPrinter } from './../csharp-worker.js';

const cfg = { verbose: false, csharp: { parser: { ELEMENT_ACCESS_WRAPPER_OPEN: 'getValue(', ELEMENT_ACCESS_WRAPPER_CLOSE: ')' } } };

test('bithumb: parse8601 / safeInteger-copy timestamp locals with Int64? writes print Int64?', () => {
    const transpiler = new Transpiler (cfg);
    setupCsharpPrinter (transpiler);
    const out = (transpiler as any).transpileCSharpByPath ('./ts/src/bithumb.ts').content as string;
    assert.match (out, /Int64\? timestamp = this\.parse8601\(datetime\);/);
    assert.match (out, /Int64\? timestamp = generationTwoTimestamp;/);
    assert.doesNotMatch (out, /object timestamp = this\.parse8601\(datetime\);/);
    assert.doesNotMatch (out, /object timestamp = generationTwoTimestamp;/);
});
