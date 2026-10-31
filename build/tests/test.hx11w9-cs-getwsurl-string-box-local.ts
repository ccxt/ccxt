// Run: npx tsx --test build/tests/test.hx11w9-cs-getwsurl-string-box-local.ts
import assert from 'node:assert/strict';
import test from 'node:test';
import Transpiler from 'ast-transpiler';
import { setupCsharpPrinter } from './../csharp-worker.js';

const cfg = { verbose: false, csharp: { parser: { ELEMENT_ACCESS_WRAPPER_OPEN: 'getValue(', ELEMENT_ACCESS_WRAPPER_CLOSE: ')' } } };

for (const id of [ 'paradex', 'coinbaseinternational' ]) {
    test(`${id}: object url = this.getWsUrl() prints string?`, () => {
        const transpiler = new Transpiler (cfg);
        setupCsharpPrinter (transpiler);
        const out = (transpiler as any).transpileCSharpByPath (`./ts/src/pro/${id}.ts`).content as string;
        assert.match (out, /\n\s+string\? url = this\.getWsUrl\(/);
        assert.doesNotMatch (out, /object url = this\.getWsUrl\(/);
    });
}
