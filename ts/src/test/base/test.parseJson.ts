
import assert from 'assert';
import ccxt from '../../../ccxt.js';

function testParseJsonHelperStringOrNum (exchange, value) {
    if (typeof value === 'string') {
        assert (value === '123456789012345678901234', 'Expected string mismatch: ' + value.toString ());
    } else {
        // todo: fix
        const exactValue = 123456789012345678901234;
        assert (value > exactValue - 0.01 && value < exactValue + 0.01, 'Expected number mismatch: ' + value.toString ());
        // try {
        //     assert (value > 0, 'Expected number mismatch: ' + value.toString ());
        // } catch (err) {
        //     // only skip c# (todo: fix)
        //     const errorMessage = exchange.exceptionMessage (err);
        //     assert (errorMessage.indexOf ('System.Exception') >= 0, 'Exception: ' + errorMessage);
        // }
    }
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
    testParseJsonHelperStringOrNum (exchange, obj2Parsed['k']);
    exchange.setProperty (exchange, 'quoteJsonNumbers', false);
    const obj2Reparsed = exchange.parseJson (obj2);
    testParseJsonHelperStringOrNum (exchange, obj2Reparsed['k']);
    exchange.setProperty (exchange, 'quoteJsonNumbers', true);
    const obj2ReparsedAgain = exchange.parseJson (obj2);
    testParseJsonHelperStringOrNum (exchange, obj2ReparsedAgain['k']);
    //
    // // todo: fix failure in c#
    //
    // const obj3 = '{"k":123456789012345678901234,"k2":"{\\"k3\\":123}"}';
    // const obj3Parsed = exchange.parseJson (obj3);
    // testParseJsonHelperStringOrNum (exchange, obj3Parsed['k']);
    // assert (obj3Parsed['k2'] === '{"k3":123}');
}

export default testParseJson;
