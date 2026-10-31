// Run: npx tsx --test build/tests/test.hx11w9-cs-poloniex-fetchtransactionshelper-dict-awaited-local.ts
import assert from 'node:assert/strict';
import test from 'node:test';
import Transpiler from 'ast-transpiler';
import { setupCsharpPrinter } from './../csharp-worker.js';

const cfg = { verbose: false, csharp: { parser: { ELEMENT_ACCESS_WRAPPER_OPEN: 'getValue(', ELEMENT_ACCESS_WRAPPER_CLOSE: ')' } } };

test('poloniex: `const response = await this.fetchTransactionsHelper (...)` prints Dictionary', () => {
    const transpiler = new Transpiler (cfg);
    setupCsharpPrinter (transpiler);
    const out = (transpiler as any).transpileCSharpByPath ('./ts/src/poloniex.ts').content as string;
    assert.match (out, /\n\s+Dictionary<string, object> response = (?:ccxt\.BaseExchange\.FromDict\()?await this\.[fF]etchTransactionsHelper\(/);
    assert.doesNotMatch (out, /object response = await this\.[fF]etchTransactionsHelper\(/);
});

test('dydx: same-named helper keeps its own typing', () => {
    const transpiler = new Transpiler (cfg);
    setupCsharpPrinter (transpiler);
    const out = (transpiler as any).transpileCSharpByPath ('./ts/src/dydx.ts').content as string;
    assert.doesNotMatch (out, /Dictionary<string, object> response = await this\.[fF]etchTransactionsHelper\(/);
});
