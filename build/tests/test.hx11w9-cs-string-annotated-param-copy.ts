// Run: npx tsx --test build/tests/test.hx11w9-cs-string-annotated-param-copy.ts
import assert from 'node:assert/strict';
import test from 'node:test';
import Transpiler from 'ast-transpiler';
import { setupCsharpPrinter } from './../csharp-worker.js';

const cfg = { verbose: false, csharp: { parser: { ELEMENT_ACCESS_WRAPPER_OPEN: 'getValue(', ELEMENT_ACCESS_WRAPPER_CLOSE: ')' } } };

test('upbit watchPrivate: `: string` copies of required string params print string', () => {
    const transpiler = new Transpiler (cfg);
    setupCsharpPrinter (transpiler);
    const out = (transpiler as any).transpileCSharpByPath ('./ts/src/pro/upbit.ts').content as string;
    assert.match (out, /\n\s+string messageHashResolved = messageHash;/);
    assert.match (out, /\n\s+string channelKey = channel;/);
    assert.doesNotMatch (out, /object channelKey = channel;/);
});
