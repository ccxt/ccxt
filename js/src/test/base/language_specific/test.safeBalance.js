// @ts-nocheck
import { strictEqual, deepEqual } from 'assert';
import { Exchange, functions } from '../../../../ccxt.js';
const { index, aggregate, unCamelCase } = functions;
const equal = strictEqual;
function testSafeBalance() {
    const exchange = new Exchange({
        'markets': {
            'ETH/BTC': { 'id': 'ETH/BTC', 'symbol': 'ETH/BTC', 'base': 'ETH', 'quote': 'BTC', }
        }
    });
    const input = {
        'ETH': { 'free': 10, 'used': 10, 'total': 20 },
        'ZEC': { 'free': 0, 'used': 0, 'total': 0 },
    };
    const expected = {
        'ETH': { 'free': 10, 'used': 10, 'total': 20 },
        'ZEC': { 'free': 0, 'used': 0, 'total': 0 },
        'free': {
            'ETH': 10,
            'ZEC': 0,
        },
        'used': {
            'ETH': 10,
            'ZEC': 0,
        },
        'total': {
            'ETH': 20,
            'ZEC': 0,
        },
    };
    const actual = exchange.safeBalance(input);
    deepEqual(actual, expected);
}
export default testSafeBalance;
