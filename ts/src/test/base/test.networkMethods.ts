
// AUTO_TRANSPILE_ENABLED

import assert from 'assert';
import ccxt from '../../../ccxt.js';

function testNetworkMethods () {

    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });

    assert (exchange.unifiedNetworkCodeAdjuster ('USDT', 'ERC20') === 'ERC20');
    assert (exchange.unifiedNetworkCodeAdjuster ('USDT', 'ETH') === 'ERC20');
    assert (exchange.unifiedNetworkCodeAdjuster ('ETH', 'ERC20') === 'ETH');
    assert (exchange.unifiedNetworkCodeAdjuster ('ETH', 'ETH') === 'ETH');

    assert (exchange.unifiedNetworkCodeAdjuster ('USDT', 'CRC20') === 'ERC20');
    assert (exchange.unifiedNetworkCodeAdjuster ('USDT', 'CRONOS') === 'ERC20');
    assert (exchange.unifiedNetworkCodeAdjuster ('CRO', 'CRC20') === 'CRONOS');
    assert (exchange.unifiedNetworkCodeAdjuster ('CRO', 'CRONOS') === 'CRONOS');
}

export default testNetworkMethods;
