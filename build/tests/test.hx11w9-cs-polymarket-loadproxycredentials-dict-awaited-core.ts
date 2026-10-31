// Run: npx tsx --test build/tests/test.hx11w9-cs-polymarket-loadproxycredentials-dict-awaited-core.ts
import assert from 'node:assert/strict';
import test from 'node:test';
import Transpiler from 'ast-transpiler';
import { setupCsharpPrinter } from './../csharp-worker.js';

const cfg = { verbose: false, csharp: { parser: { ELEMENT_ACCESS_WRAPPER_OPEN: 'getValue(', ELEMENT_ACCESS_WRAPPER_CLOSE: ')' } } };

test('polymarket loadProxyCredentials: awaited core and its callers print IDictionary', () => {
    const transpiler = new Transpiler (cfg);
    setupCsharpPrinter (transpiler);
    const rest = (transpiler as any).transpileCSharpByPath ('./ts/src/polymarket.ts').content as string;
    assert.match (rest, /Task<IDictionary<string, object>> loadProxyCredentials/);
    assert.match (rest, /return await this\.createProxyCredentials/);
    assert.match (rest, /IDictionary<string, object> credentials = await this\.loadProxyCredentials/);
    const pro = (transpiler as any).transpileCSharpByPath ('./ts/src/pro/polymarket.ts').content as string;
    assert.match (pro, /IDictionary<string, object> credentials = await this\.loadProxyCredentials/);
});
