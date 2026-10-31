// Run: npx tsx --test build/tests/test.hx11w9-cs-coinbaseinternational-handlerouteandparams-dict-return.ts
import assert from 'node:assert/strict';
import test from 'node:test';
import Transpiler from 'ast-transpiler';
import { setupCsharpPrinter } from './../csharp-worker.js';

const cfg = { verbose: false, csharp: { parser: { ELEMENT_ACCESS_WRAPPER_OPEN: 'getValue(', ELEMENT_ACCESS_WRAPPER_CLOSE: ')' } } };

test('coinbaseinternational handleRouteAndParams returns Dictionary and types its callers', () => {
    const transpiler = new Transpiler (cfg);
    setupCsharpPrinter (transpiler);
    const out = (transpiler as any).transpileCSharpByPath ('./ts/src/coinbaseinternational.ts').content as string;
    assert.match (out, /public virtual Dictionary<string, object> handleRouteAndParams\(/);
    assert.match (out, /Dictionary<string, object> paramsResolved = this\.handleRouteAndParams\(/);
    assert.doesNotMatch (out, /object paramsResolved = this\.handleRouteAndParams\(/);
});
