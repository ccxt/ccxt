// @ts-nocheck
import { strictEqual } from 'assert';
import { Exchange, functions } from '../../../../ccxt.js';
const { index, aggregate, unCamelCase } = functions;
const equal = strictEqual;
function testLegacyHas() {
    const exchange = new Exchange({
        'id': 'mock',
        'has': {
            'CORS': true,
            'publicAPI': false,
            'fetchDepositAddress': 'emulated'
        }
    });
    equal(exchange.hasCORS, true);
    equal(exchange.hasPublicAPI, false);
    equal(exchange.hasFetchDepositAddress, true);
}
export default testLegacyHas;
