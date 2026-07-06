


import assert from 'assert';
import ccxt from '../../../ccxt.js';
import testSharedMethods from '../Exchange/base/test.sharedMethods.js';

function testIsJsonEncodedObject () {
    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });
    assert (exchange.isJsonEncodedObject ('{"key":"value"}'));
    assert (exchange.isJsonEncodedObject ('{}'));
    assert (exchange.isJsonEncodedObject ('[]'));
    // todo: the belows  are not ideal, but currently valid
    assert (exchange.isJsonEncodedObject ('{x'));
    assert (exchange.isJsonEncodedObject ('[x'));
    assert (exchange.isJsonEncodedObject ('{'));
    assert (exchange.isJsonEncodedObject ('['));
    // invalid
    assert (!exchange.isJsonEncodedObject ('x'));
    assert (!exchange.isJsonEncodedObject (''));
    assert (!exchange.isJsonEncodedObject ('}'));
    assert (!exchange.isJsonEncodedObject (']'));
    assert (!exchange.isJsonEncodedObject ('null'));
    assert (!exchange.isJsonEncodedObject ('undefined'));
    // todo: maybe some updates, if ever
    // assert (!exchange.isJsonEncodedObject ('{"key":value}'));
    // assert (!exchange.isJsonEncodedObject ('{key:"value"}'));
}

export default testIsJsonEncodedObject;
