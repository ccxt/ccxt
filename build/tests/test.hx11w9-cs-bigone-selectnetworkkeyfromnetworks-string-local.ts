// Run: npx tsx --test build/tests/test.hx11w9-cs-bigone-selectnetworkkeyfromnetworks-string-local.ts
import assert from 'node:assert/strict';
import test from 'node:test';
import Transpiler from 'ast-transpiler';
import { setupCsharpPrinter } from './../csharp-worker.js';

const cfg = { verbose: false, csharp: { parser: { ELEMENT_ACCESS_WRAPPER_OPEN: 'getValue(', ELEMENT_ACCESS_WRAPPER_CLOSE: ')' } } };

test('bigone fetchDepositAddress: selectNetworkKeyFromNetworks local prints string?', () => {
    const transpiler = new Transpiler (cfg);
    setupCsharpPrinter (transpiler);
    const out = (transpiler as any).transpileCSharpByPath ('./ts/src/bigone.ts').content as string;
    assert.match (out, /string\? selectedNetworkId = this\.selectNetworkKeyFromNetworks\(/);
    assert.doesNotMatch (out, /object selectedNetworkId = /);
});
