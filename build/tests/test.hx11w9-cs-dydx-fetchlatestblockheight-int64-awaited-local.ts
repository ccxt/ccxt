// Run: npx tsx --test build/tests/test.hx11w9-cs-dydx-fetchlatestblockheight-int64-awaited-local.ts
import assert from 'node:assert/strict';
import test from 'node:test';
import Transpiler from 'ast-transpiler';
import { setupCsharpPrinter } from './../csharp-worker.js';

const cfg = { verbose: false, csharp: { parser: { ELEMENT_ACCESS_WRAPPER_OPEN: 'getValue(', ELEMENT_ACCESS_WRAPPER_CLOSE: ')' } } };

test('dydx: awaited fetchLatestBlockHeight locals print Int64', () => {
    const transpiler = new Transpiler (cfg);
    setupCsharpPrinter (transpiler);
    const out = (transpiler as any).transpileCSharpByPath ('./ts/src/dydx.ts').content as string;
    assert.match (out, /\n\s+Int64 lastBlockHeight = await this\.FetchLatestBlockHeight\(\)/);
    assert.match (out, /\n\s+Int64 latestBlockHeight = await this\.FetchLatestBlockHeight\(\)/);
    assert.doesNotMatch (out, /object (last|latest)BlockHeight = await this\.FetchLatestBlockHeight\(\)/);
});
