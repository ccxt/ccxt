

// todo: per https://github.com/ttodua/ccxt/blob/17fc70fd7ccd8f6f5357e2dbd08aa30a1df0948b/ts/src/test/base/test.json.ts#L1

import assert from 'assert';
import ccxt from '../../../ccxt.js';

function testParseJsonHelperStringOrNum (value) {
    const typeStr = typeof value;
    assert (value === '123456789012345678901234' || value === 123456789012345678901234, 'Expected value to be either a string or a number, but got: ' + value.toString () + ' of type ' + typeStr);
}

function testParseJson () {

    const exchange = new ccxt.Exchange ({
        'id': 'sampleex',
    });

    //
    const obj1 = '{"k":"v"}';
    const obj1Parsed = exchange.parseJson (obj1);
    const keys1 = Object.keys (obj1Parsed);
    assert (keys1.length === 1);
    assert (keys1[0] === 'k');
    assert (obj1Parsed['k'] === 'v');
    //
    const obj2 = '{"k":123456789012345678901234}';
    const obj2Parsed = exchange.parseJson (obj2);
    testParseJsonHelperStringOrNum (obj2Parsed['k']);
    exchange.setProperty (exchange, 'quoteJsonNumbers', false);
    const obj2Reparsed = exchange.parseJson (obj2);
    assert (typeof obj2Reparsed['k'] !== 'string');
    testParseJsonHelperStringOrNum (obj2Reparsed['k']);
    exchange.setProperty (exchange, 'quoteJsonNumbers', true);
    const obj2ReparsedAgain = exchange.parseJson (obj2);
    testParseJsonHelperStringOrNum (obj2ReparsedAgain['k']);
    //
    const obj3 = '{"k":123456789012345678901234,"k2":"{\\"k3\\":123}"}';
    const obj3Parsed = exchange.parseJson (obj3);
    testParseJsonHelperStringOrNum (obj3Parsed['k']);
    assert (obj3Parsed['k2'] === '{"k3":123}');
}

export default testParseJson;
