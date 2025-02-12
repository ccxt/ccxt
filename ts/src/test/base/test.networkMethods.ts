
// AUTO_TRANSPILE_ENABLED

import assert from 'assert';
import ccxt from '../../../ccxt.js';

function testNetworkMethods () {

    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });

    assert (exchange.networkCodeAdjusterForCurrency ('USDT', 'ERC20') === 'ERC20');
    assert (exchange.networkCodeAdjusterForCurrency ('USDT', 'ETH') === 'ERC20');
    assert (exchange.networkCodeAdjusterForCurrency ('ETH', 'ERC20') === 'ETH');
    assert (exchange.networkCodeAdjusterForCurrency ('ETH', 'ETH') === 'ETH');

    assert (exchange.networkCodeAdjusterForCurrency ('USDT', 'CRC20') === 'ERC20');
    assert (exchange.networkCodeAdjusterForCurrency ('USDT', 'CRONOS') === 'ERC20');
    assert (exchange.networkCodeAdjusterForCurrency ('CRO', 'CRC20') === 'CRONOS');
    assert (exchange.networkCodeAdjusterForCurrency ('CRO', 'CRONOS') === 'CRONOS');
}

export default testNetworkMethods;
