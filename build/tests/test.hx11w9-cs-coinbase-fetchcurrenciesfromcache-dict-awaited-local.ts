// Run: npx tsx --test build/tests/test.hx11w9-cs-coinbase-fetchcurrenciesfromcache-dict-awaited-local.ts
import assert from 'node:assert/strict';
import test from 'node:test';
import Transpiler from 'ast-transpiler';
import { setupCsharpPrinter } from './../csharp-worker.js';

const cfg = { verbose: false, csharp: { parser: { ELEMENT_ACCESS_WRAPPER_OPEN: 'getValue(', ELEMENT_ACCESS_WRAPPER_CLOSE: ')' } } };

test('coinbase fetchMarketsV2: awaited FetchCurrenciesFromCache local prints Dictionary<string, object>', () => {
    const transpiler = new Transpiler (cfg);
    setupCsharpPrinter (transpiler);
    const out = (transpiler as any).transpileCSharpByPath ('./ts/src/coinbase.ts').content as string;
    assert.match (out, /Dictionary<string, object> response = await this\.fetchCurrenciesFromCache\(parameters\);/);
    assert.doesNotMatch (out, /object response = await this\.fetchCurrenciesFromCache/);
});
