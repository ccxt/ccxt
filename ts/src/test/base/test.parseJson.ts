
import assert from 'assert';
import ccxt from '../../../ccxt.js';

function testParseJsonHelperLongNum (exchange, value) {
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
    const string1 = '{"k":"v"}';
    const parsed1 = exchange.parseJson (string1);
    const keys1 = Object.keys (parsed1);
    assert (keys1.length === 1);
    // assert (keys1[0] === 'k'); // todo: fails in GO
    assert (parsed1['k'] === 'v');

    //
    const string2 = '{"k":123.1,"k2":"{\\"k3\\":456}"}';
    const parsed2 = exchange.parseJson (string2);
    const keys2 = Object.keys (parsed2);
    assert (keys2.length === 2);
    assert (parsed2['k'] === 123.1);
    assert (parsed2['k2'] === '{"k3":456}');
    exchange.setProperty (exchange, 'quoteJsonNumbers', false);
    const parsed2NonQuoted = exchange.parseJson (string2);
    assert (parsed2NonQuoted['k'] === 123.1);
    assert (parsed2NonQuoted['k2'] === '{"k3":456}');
    const parsed2Quoted = exchange.parseJson (string2);
    assert (parsed2Quoted['k'] === 123.1);
    assert (parsed2Quoted['k2'] === '{"k3":456}');

    
    //
    // long number parsing
    // //
    // const obj2 = '{"k":123456789012345678901234}';
    // const obj2Parsed = exchange.parseJson (obj2);
    // testParseJsonHelperLongNum (exchange, obj2Parsed['k']);
    // exchange.setProperty (exchange, 'quoteJsonNumbers', false);
    // const obj2Reparsed = exchange.parseJson (obj2);
    // testParseJsonHelperLongNum (exchange, obj2Reparsed['k']);
    // exchange.setProperty (exchange, 'quoteJsonNumbers', true);
    // const obj2ReparsedAgain = exchange.parseJson (obj2);
    // testParseJsonHelperLongNum (exchange, obj2ReparsedAgain['k']);
    //
    // // todo: fix failure in c#
    //
    // const obj3 = '{"k":123456789012345678901234,"k2":"{\\"k3\\":123}"}';
    // const obj3Parsed = exchange.parseJson (obj3);
    // testParseJsonHelperStringOrNum (exchange, obj3Parsed['k']);
    // assert (obj3Parsed['k2'] === '{"k3":123}');
}

export default testParseJson;
