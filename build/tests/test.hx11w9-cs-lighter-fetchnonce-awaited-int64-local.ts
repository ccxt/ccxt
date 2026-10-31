// Run: npx tsx --test build/tests/test.hx11w9-cs-lighter-fetchnonce-awaited-int64-local.ts
import assert from 'node:assert/strict';
import test from 'node:test';
import Transpiler from 'ast-transpiler';
import { setupCsharpPrinter } from './../csharp-worker.js';

const cfg = { verbose: false, csharp: { parser: { ELEMENT_ACCESS_WRAPPER_OPEN: 'getValue(', ELEMENT_ACCESS_WRAPPER_CLOSE: ')' } } };

test('lighter: `const nonce = await this.fetchNonce (...)` prints Int64', () => {
    const transpiler = new Transpiler (cfg);
    setupCsharpPrinter (transpiler);
    const out = (transpiler as any).transpileCSharpByPath ('./ts/src/lighter.ts').content as string;
    assert.match (out, /\n\s+Int64 nonce = await this\.[fF]etchNonce\(/);
    assert.doesNotMatch (out, /object nonce = await this\.[fF]etchNonce\(/);
});
