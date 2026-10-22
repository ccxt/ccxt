// AUTO_TRANSPILE_ENABLED

import assert from 'assert';
import ccxt from '../../../ccxt.js';

function testCheckAddress () {

    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });
    const address = 'rDsbeomae4FXwgQTJp9Rs64Qg9vDiTCdBv';
    // currencies without a tag requirement pass with or without a tag
    assert (exchange.checkAddress (address) === address);
    assert (exchange.checkAddress (address, 'BTC') === address);
    // tag-required currencies need a tag
    assert (exchange.checkAddress (address, 'XRP', '123456') === address);
    assert (exchange.checkAddress (address, 'ATOM', '123456') === address);
    let caught = false;
    try {
        exchange.checkAddress (address, 'XRP');
    } catch (error) {
        caught = true;
    }
    assert (caught, 'XRP without a tag should have thrown');
    caught = false;
    try {
        exchange.checkAddress (address, 'XLM', undefined);
    } catch (error) {
        caught = true;
    }
    assert (caught, 'XLM without a tag should have thrown');
    caught = false;
    try {
        exchange.checkAddress (undefined, 'BTC');
    } catch (error) {
        caught = true;
    }
    assert (caught, 'an undefined address should have thrown');
}

export default testCheckAddress;
