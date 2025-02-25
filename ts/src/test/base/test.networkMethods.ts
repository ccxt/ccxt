
// AUTO_TRANSPILE_ENABLED

import assert from 'assert';
import ccxt from '../../../ccxt.js';

function testNetworkMethods () {

    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });

    assert (exchange.networkCodeProtocolCorrector ('USDT', 'ERC20') === 'ERC20');
    assert (exchange.networkCodeProtocolCorrector ('USDT', 'ETH') === 'ERC20');
    assert (exchange.networkCodeProtocolCorrector ('ETH', 'ERC20') === 'ETH');
    assert (exchange.networkCodeProtocolCorrector ('ETH', 'ETH') === 'ETH');

    assert (exchange.networkCodeProtocolCorrector ('USDT', 'CRC20') === 'CRC20');
    assert (exchange.networkCodeProtocolCorrector ('USDT', 'CRONOS') === 'CRC20');
    assert (exchange.networkCodeProtocolCorrector ('CRO', 'CRC20') === 'CRONOS');
    assert (exchange.networkCodeProtocolCorrector ('CRO', 'CRONOS') === 'CRONOS');
}

export default testNetworkMethods;
