// Run: npx tsx --test build/tests/test.hx11w9-cs-nado-orderrequest-dict-awaited-local.ts
import assert from 'node:assert/strict';
import test from 'node:test';
import Transpiler from 'ast-transpiler';
import { setupCsharpPrinter } from './../csharp-worker.js';

const cfg = { verbose: false, csharp: { parser: { ELEMENT_ACCESS_WRAPPER_OPEN: 'getValue(', ELEMENT_ACCESS_WRAPPER_CLOSE: ')' } } };
const gen = (path: string) => {
    const transpiler = new Transpiler (cfg);
    setupCsharpPrinter (transpiler);
    return (transpiler as any).transpileCSharpByPath (path).content as string;
};

for (const path of [ './ts/src/nado.ts', './ts/src/pro/nado.ts' ]) {
    test(`${path}: awaited order request builders print Dictionary locals`, () => {
        const out = gen (path);
        assert.match (out, /Dictionary<string, object> request = (?:ccxt\.BaseExchange\.FromDict\()?await this\.[cC]reateOrderRequest\(/);
        assert.doesNotMatch (out, /object request = await this\.(?:[cC]reate|[eE]dit)OrderRequest\(/);
        assert.doesNotMatch (out, /object request = await this\.[cC]ancel(?:All)?OrdersRequest\(/);
    });
}
