// @ts-nocheck

import assert, { strictEqual, deepEqual } from 'assert';
import ccxt, { Exchange, functions } from '../../../ccxt.js';

const { index, aggregate, unCamelCase } = functions;

const equal = strictEqual;

function testExchangeConfigExtension () {
    const cost = { 'min': 0.001, 'max': 1000 }
    const precision = { 'amount': 3 }
    const exchange = new Exchange ({
        'id': 'mock',
        'markets': {
            'ETH/BTC': { 'limits': { cost }, precision },
        },
    });

    deepEqual (exchange.markets['ETH/BTC'].limits.cost, cost);
    deepEqual (exchange.markets['ETH/BTC'].precision, { 'price': 0.000001, 'amount': 0.001 });
    deepEqual (exchange.markets['ETH/BTC'].symbol, 'ETH/BTC');
}

export default testExchangeConfigExtension;
