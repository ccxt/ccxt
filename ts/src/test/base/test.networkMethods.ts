
// AUTO_TRANSPILE_ENABLED

import assert from 'assert';
import ccxt from '../../../ccxt.js';

function testNetworkMethods () {

    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });

    assert (exchange.networkCodeReplacement ('USDT', 'ERC20') === 'ERC20');
    assert (exchange.networkCodeReplacement ('USDT', 'ETH') === 'ERC20');
    assert (exchange.networkCodeReplacement ('ETH', 'ERC20') === 'ETH');
    assert (exchange.networkCodeReplacement ('ETH', 'ETH') === 'ETH');

    assert (exchange.networkCodeReplacement ('USDT', 'CRC20') === 'ERC20');
    assert (exchange.networkCodeReplacement ('USDT', 'CRONOS') === 'ERC20');
    assert (exchange.networkCodeReplacement ('CRO', 'CRC20') === 'CRONOS');
    assert (exchange.networkCodeReplacement ('CRO', 'CRONOS') === 'CRONOS');
}

export default testNetworkMethods;
