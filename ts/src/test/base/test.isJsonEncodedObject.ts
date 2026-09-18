


import assert from 'assert';
import ccxt from '../../../ccxt.js';

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
}

export default testIsJsonEncodedObject;
