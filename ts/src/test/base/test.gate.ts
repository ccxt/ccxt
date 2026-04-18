import assert from 'assert';
import ccxt from '../../../ccxt.js';

function getGateContractMarket (name, orderSizeMin) {
    return {
        'name': name,
        'type': 'direct',
        'quanto_multiplier': '1',
        'order_price_deviate': '0.5',
        'mark_price': '10',
        'order_price_round': '0.1',
        'order_size_min': orderSizeMin,
        'order_size_max': '1000000',
        'leverage_min': '1',
        'leverage_max': '100',
        'create_time': 1609800048,
    };
}

function testGate () {
    const gateioExchange = new ccxt.gateio ();
    assert (gateioExchange.safeValue (gateioExchange.commonCurrencies, 'RED') === undefined);
    const redSymbol = gateioExchange.parseContractMarket (getGateContractMarket ('RED_USDT', '1'), 'usdt')['symbol'];
    assert (redSymbol === 'RED/USDT:USDT');
}

export default testGate;
