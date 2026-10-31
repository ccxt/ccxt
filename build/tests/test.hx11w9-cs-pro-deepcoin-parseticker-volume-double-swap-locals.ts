// Run: npx tsx --test build/tests/test.hx11w9-cs-pro-deepcoin-parseticker-volume-double-swap-locals.ts
import assert from 'node:assert/strict';
import test from 'node:test';
import Transpiler from 'ast-transpiler';
import { setupCsharpPrinter } from './../csharp-worker.js';

const cfg = { verbose: false, csharp: { parser: { ELEMENT_ACCESS_WRAPPER_OPEN: 'getValue(', ELEMENT_ACCESS_WRAPPER_CLOSE: ')' } } };

test('pro deepcoin parseTicker: the baseVolume/quoteVolume swap locals print double?', () => {
    const transpiler = new Transpiler (cfg);
    setupCsharpPrinter (transpiler);
    const out = (transpiler as any).transpileCSharpByPath ('./ts/src/pro/deepcoin.ts').content as string;
    assert.match (out, /\n\s+double\? baseVolume = this\.safeNumber/);
    assert.match (out, /\n\s+double\? quoteVolume = this\.safeNumber/);
    assert.match (out, /\n\s+double\? temp = baseVolume;/);
});
