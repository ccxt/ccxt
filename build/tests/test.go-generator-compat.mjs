import assert from 'node:assert/strict';
import test from 'node:test';
import Transpiler from 'ast-transpiler';
import { installCcxtGoLocalTypes } from '../go-local-types.js';
import { GO_TEST_EXCHANGE_SETTER } from '../go-test-transforms.js';

function transpile () {
    const transpiler = new Transpiler ();
    transpiler.setVerboseMode (false);
    installCcxtGoLocalTypes (transpiler.goTranspiler);
    return transpiler.transpileGo (`class Sample {
        safeString (obj, key) { return obj[key]; }
        safeInteger (obj, key) { return obj[key]; }
        safeFloat (obj, key) { return obj[key]; }
        uuid16 () { return ''; }
        run (obj) {
            const text = this.safeString (obj, 'text');
            const timestamp = this.safeInteger (obj, 'timestamp');
            const price = this.safeFloat (obj, 'price');
            const product = Precise.stringMul (text, '100');
            const matches = Precise.stringEq (text, '0');
            const literal = 'value';
            const identifier = this.uuid16 ();
            const wrapped = (this.safeString (obj, 'wrapped'));
            return [ text, timestamp, price, product, matches, literal, identifier, wrapped ];
        }
    }`).content;
}

test ('nullable helpers retain the current runtime any signatures', () => {
    const output = transpile ();
    for (const name of [ 'text', 'timestamp', 'price', 'product', 'wrapped' ]) {
        assert.match (output, new RegExp (`var ${name} any =`));
    }
    assert.match (output, /var matches bool = Precise.StringEq/);
    assert.match (output, /var literal string =/);
    assert.match (output, /var identifier string = this.Uuid16/);
});


test ('test harness setters leave comparisons and exchangeName intact', () => {
    const source = [
        '    exchange.Id = "bingx"',
        '    exchange.Options = map[string]any{}',
        '    if (exchangeName == "lighter") {',
        '    if (exchangeName == "grvt") {',
        '    if (exchange.Id == "bingx") {',
        '    exchange.Id == "bingx"',
    ];
    const expected = [
        '    exchange.SetId("bingx")',
        '    exchange.SetOptions(map[string]any{})',
        ...source.slice (2),
    ];
    assert.equal (source.join ('\n').replace (...GO_TEST_EXCHANGE_SETTER), expected.join ('\n'));
});
