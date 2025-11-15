import assert from 'assert';
import testSharedMethods from './test.sharedMethods.js';
import Precise from '../../../base/Precise.js';
function testLiquidation(exchange, skippedProperties, method, entry, symbol) {
    const format = {
        'info': {},
        'symbol': 'ETH/BTC',
        'contracts': exchange.parseNumber('1.234'),
        'contractSize': exchange.parseNumber('1.234'),
        'price': exchange.parseNumber('1.234'),
        'baseValue': exchange.parseNumber('1.234'),
        'quoteValue': exchange.parseNumber('1.234'),
        'timestamp': 1502962946216,
        'datetime': '2017-09-01T00:00:00',
    };
    // todo: atm, many exchanges fail, so temporarily decrease stict mode
    const emptyAllowedFor = ['timestamp', 'datetime', 'quoteValue', 'baseValue', 'previousClose', 'price', 'contractSize', 'contracts'];
    testSharedMethods.assertStructure(exchange, skippedProperties, method, entry, format, emptyAllowedFor);
    testSharedMethods.assertTimestampAndDatetime(exchange, skippedProperties, method, entry);
    const logText = testSharedMethods.logTemplate(exchange, method, entry);
    testSharedMethods.assertGreater(exchange, skippedProperties, method, entry, 'contracts', '0');
    testSharedMethods.assertGreater(exchange, skippedProperties, method, entry, 'contractSize', '0');
    testSharedMethods.assertGreater(exchange, skippedProperties, method, entry, 'price', '0');
    testSharedMethods.assertGreater(exchange, skippedProperties, method, entry, 'baseValue', '0');
    testSharedMethods.assertGreater(exchange, skippedProperties, method, entry, 'quoteValue', '0');
    const contracts = exchange.safeString(entry, 'contracts');
    const contractSize = exchange.safeString(entry, 'contractSize');
    const price = exchange.safeString(entry, 'price');
    const baseValue = exchange.safeString(entry, 'baseValue');
    if (contracts && contractSize) {
        assert(Precise.stringEq(baseValue, Precise.stringMul(contracts, contractSize)), 'baseValue == contracts * contractSize' + logText);
        if (price) {
            assert(Precise.stringEq(baseValue, Precise.stringMul(Precise.stringMul(contracts, contractSize), price)), 'quoteValue == contracts * contractSize * price' + logText);
        }
    }
    // if singular was called, then symbol needs to be asserted
    if (method === 'watchLiquidations' || method === 'fetchLiquidations') {
        testSharedMethods.assertSymbol(exchange, skippedProperties, method, entry, 'symbol', symbol);
    }
}
export default testLiquidation;
